"""Atomic, response-body byte budget for authenticated HTTP range reads.

This module is transport-only: callers provide an already authenticated async
HTTP session. It never obtains credentials or creates a session itself.
"""
from __future__ import annotations

import asyncio
import hashlib
import json
import os
import re
import tempfile
import time
from pathlib import Path
from typing import Any, Mapping
from urllib.parse import urlsplit, urlunsplit


class RangeBudgetExceeded(RuntimeError):
    """The requested range cannot be reserved within the shared byte limit."""


class RangeProtocolError(RuntimeError):
    """The server did not honor the exact requested HTTP range."""


class UnsafeProjectPath(ValueError):
    """A requested state/output path escapes its root or traverses a symlink."""


def safe_project_path(project_root: str | Path, candidate: str | Path) -> Path:
    """Return an absolute project-contained path with no existing symlink component.

    This is a fail-closed filesystem guard, not a defense against a hostile
    concurrent process replacing a component between validation and use.
    Callers revalidate immediately before each operation.
    """
    root_input = Path(project_root).absolute()
    try:
        if root_input.is_symlink():
            raise UnsafeProjectPath(f"project root is a symlink: {root_input}")
        root = root_input.resolve(strict=True)
        if root != root_input:
            raise UnsafeProjectPath(f"project root traverses a symlink component: {root_input}")
    except OSError as exc:
        raise UnsafeProjectPath(f"project root is unavailable: {root_input}") from exc
    path_input = Path(candidate)
    path = path_input.absolute() if path_input.is_absolute() else (root / path_input).absolute()
    try:
        relative = path.relative_to(root)
    except ValueError as exc:
        raise UnsafeProjectPath(f"path escapes project root: {path}") from exc
    current = root
    for component in relative.parts:
        if component in ("", ".", ".."):
            raise UnsafeProjectPath(f"unsafe path component in {path}")
        current = current / component
        try:
            mode = current.lstat().st_mode
        except FileNotFoundError:
            # Later components cannot exist while this component is missing.
            break
        if os.path.islink(current):
            raise UnsafeProjectPath(f"symlink path component rejected: {current}")
    return path


class TransientHTTPStatus(RuntimeError):
    """An HTTP 5xx response eligible for the one bounded retry."""


class RangeCheckpointStore:
    """Atomic durable range ledger and verified response cache.

    The URL itself is never persisted (it may contain signed query material).
    Only its SHA256 identity, task scope, byte offsets, status, body checksum,
    and response-body byte accounting are recorded.
    """

    VERSION = 1

    def __init__(self, state_path: str | Path, cache_dir: str | Path, *,
                 task_id: str, limit_bytes: int, scope: Mapping[str, str],
                 project_root: str | Path | None = None):
        self.project_root = Path(project_root or Path(state_path).absolute().parent)
        self.state_path = safe_project_path(self.project_root, state_path)
        self.cache_dir = safe_project_path(self.project_root, cache_dir)
        safe_project_path(self.project_root, self.state_path.parent)
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        safe_project_path(self.project_root, self.cache_dir)
        self.state_path.parent.mkdir(parents=True, exist_ok=True)
        safe_project_path(self.project_root, self.state_path)
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.task_id = task_id
        self.limit_bytes = int(limit_bytes)
        self.scope = dict(scope)
        self._lock_stream = None
        try:
            import fcntl
            lock_path = safe_project_path(self.project_root, self.state_path.with_suffix(self.state_path.suffix + ".lock"))
            self._lock_stream = lock_path.open("a+b")
            fcntl.flock(self._lock_stream.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
        except (ImportError, BlockingIOError) as exc:
            if self._lock_stream:
                self._lock_stream.close()
                self._lock_stream = None
            raise RuntimeError("checkpoint is already in use or process locking is unavailable") from exc
        try:
            self._load_or_initialize()
        except BaseException:
            self.close()
            raise

    def _load_or_initialize(self) -> None:
        if self.state_path.exists():
            stored = json.loads(self.state_path.read_text())
            checksum = stored.pop("_checkpoint_sha256", None)
            expected = hashlib.sha256(json.dumps(stored, sort_keys=True, separators=(",", ":")).encode()).hexdigest()
            if checksum != expected:
                raise ValueError("checkpoint checksum verification failed; refusing resume")
            self.state = stored
            if (self.state.get("version") != self.VERSION
                    or self.state.get("task_id") != self.task_id
                    or self.state.get("limit_bytes") != self.limit_bytes
                    or self.state.get("scope") != self.scope):
                raise ValueError("checkpoint identity/budget/scope mismatch; refusing resume")
        else:
            self.state = {
                "version": self.VERSION, "task_id": self.task_id,
                "limit_bytes": self.limit_bytes, "scope": self.scope,
                "bytes_received": 0, "ranges": {}, "stages": {}, "last_event": None,
                "automatic_retries": 0,
                "retry_policy": "one transient-only retry maximum; 0.5s exponential backoff; no auth/416/protocol retries",
                "checkpoint_integrity": "unkeyed SHA256 detects accidental corruption only; it does not authenticate state or prevent deliberate tampering",
            }
            self._write()
        # A process may have died after dispatch/read but before completion.
        # Conservatively charge the uncheckpointed remainder of each reserved
        # range so restart cannot undercount response-body usage.
        recovered = False
        for key, record in self.state["ranges"].items():
            if record.get("status") == "in_flight":
                missing = max(0, int(record["reserved_bytes"]) - int(record.get("attempt_body_bytes", 0)))
                self.state["bytes_received"] += missing
                record["status"] = "interrupted"
                record["conservative_recovery_charge"] = missing
                recovered = True
        if recovered:
            self.state["last_event"] = {"status": "interrupted", "reason": "recovered in-flight range reservations"}
            self._write()

    def close(self) -> None:
        if self._lock_stream is not None:
            try:
                import fcntl
                fcntl.flock(self._lock_stream.fileno(), fcntl.LOCK_UN)
            finally:
                self._lock_stream.close()
                self._lock_stream = None

    def __enter__(self):
        return self

    def __exit__(self, *_exc):
        self.close()

    @staticmethod
    def resource_id(url: str) -> str:
        # fsspec commonly returns yarl.URL objects. Normalize only for
        # checkpoint identity; request dispatch retains the original object.
        url_text = str(url)
        parts = urlsplit(url_text)
        # Ignore query/fragment because they can carry expiring auth material.
        canonical = urlunsplit((parts.scheme, parts.netloc, parts.path, "", ""))
        return hashlib.sha256(canonical.encode("utf-8")).hexdigest()

    def range_key(self, url: str, start: int, end: int, context: Mapping[str, str]) -> str:
        identity = {"resource_sha256": self.resource_id(url), "start": start, "end": end,
                    "task_id": self.task_id, "scope": self.scope, "context": dict(context)}
        return hashlib.sha256(json.dumps(identity, sort_keys=True).encode()).hexdigest()

    @property
    def bytes_received(self) -> int:
        return int(self.state["bytes_received"])

    def verified_body(self, key: str, expected: int) -> bytes | None:
        record = self.state["ranges"].get(key)
        if not record or record.get("status") != "complete":
            return None
        path = safe_project_path(self.project_root, self.cache_dir / record["cache_file"])
        try:
            body = path.read_bytes()
        except OSError:
            return None
        digest = hashlib.sha256(body).hexdigest()
        if len(body) != expected or digest != record.get("sha256"):
            return None
        return body

    def charge(self, nbytes: int) -> None:
        self.state["bytes_received"] = self.bytes_received + int(nbytes)
        self._write()

    def begin_range(self, key: str, record: Mapping[str, Any]) -> None:
        data = dict(record)
        data["status"] = "in_flight"
        data.setdefault("attempt_body_bytes", 0)
        self.state["ranges"][key] = data
        self.state["last_event"] = {"range_key": key, "status": "in_flight",
                                     "context": data.get("context"), "start": data.get("start"),
                                     "end": data.get("end"), "reserved_bytes": data.get("reserved_bytes")}
        self._write()

    def update_range_progress(self, key: str, attempt_body_bytes: int) -> None:
        record = self.state["ranges"].get(key)
        if record is None or record.get("status") != "in_flight":
            raise RuntimeError("range progress without a durable in-flight reservation")
        record["attempt_body_bytes"] = int(attempt_body_bytes)
        self.state["last_event"] = {"range_key": key, "status": "in_flight",
                                     "context": record.get("context"), "start": record.get("start"),
                                     "end": record.get("end"), "attempt_body_bytes": int(attempt_body_bytes)}
        self._write()

    def record_chunk(self, key: str, nbytes: int, attempt_body_bytes: int) -> None:
        record = self.state["ranges"].get(key)
        if record is None or record.get("status") != "in_flight":
            raise RuntimeError("body chunk without a durable in-flight reservation")
        self.state["bytes_received"] = self.bytes_received + int(nbytes)
        record["attempt_body_bytes"] = int(attempt_body_bytes)
        self.state["last_event"] = {"range_key": key, "status": "in_flight",
                                     "context": record.get("context"), "start": record.get("start"),
                                     "end": record.get("end"), "attempt_body_bytes": int(attempt_body_bytes)}
        self._write()

    def record_stage(self, name: str, status: str, *, context: Mapping[str, str] | None = None,
                     details: Mapping[str, Any] | None = None) -> None:
        record = {"status": status, "context": dict(context or {}), "details": dict(details or {})}
        self.state["stages"][name] = record
        self.state["last_event"] = {"stage": name, **record}
        self._write()

    def retry_count(self, key: str) -> int:
        return int(self.state["ranges"].get(key, {}).get("automatic_retries", 0))

    def record_retry_wait(self, key: str, *, delay_seconds: float) -> None:
        record = self.state["ranges"].get(key)
        if record is None:
            raise RuntimeError("cannot retry a range without a checkpoint record")
        record["automatic_retries"] = int(record.get("automatic_retries", 0)) + 1
        record["status"] = "retry_wait"
        record["retry_delay_seconds"] = float(delay_seconds)
        self.state["automatic_retries"] += 1
        self.state["last_event"] = {"range_key": key, "status": "retry_wait",
                                     "automatic_retries": record["automatic_retries"],
                                     "delay_seconds": float(delay_seconds),
                                     "context": record.get("context"), "start": record.get("start"),
                                     "end": record.get("end")}
        self._write()

    def record_range(self, key: str, record: Mapping[str, Any], *, body: bytes | None = None) -> None:
        data = dict(record)
        if body is not None:
            digest = hashlib.sha256(body).hexdigest()
            cache_name = f"{key}.range"
            self._atomic_bytes(self.cache_dir / cache_name, body)
            data.update({"cache_file": cache_name, "sha256": digest, "status": "complete"})
        self.state["ranges"][key] = data
        self.state["last_event"] = {"range_key": key, **{k: data.get(k) for k in
            ("status", "context", "start", "end", "attempt_body_bytes", "error")}}
        self._write()

    def _write(self) -> None:
        body = json.dumps(self.state, sort_keys=True, separators=(",", ":")).encode()
        envelope = dict(self.state)
        envelope["_checkpoint_sha256"] = hashlib.sha256(body).hexdigest()
        self._atomic_bytes(self.state_path, (json.dumps(envelope, sort_keys=True, indent=2) + "\n").encode())

    def _atomic_bytes(self, path: Path, payload: bytes) -> None:
        path = safe_project_path(self.project_root, path)
        path.parent.mkdir(parents=True, exist_ok=True)
        safe_project_path(self.project_root, path.parent)
        safe_project_path(self.project_root, path)
        fd, temp_name = tempfile.mkstemp(prefix=f".{path.name}.", suffix=".tmp", dir=path.parent)
        try:
            with os.fdopen(fd, "wb") as stream:
                stream.write(payload)
                stream.flush()
                os.fsync(stream.fileno())
            os.replace(temp_name, path)
            safe_project_path(self.project_root, path)
            dir_fd = os.open(path.parent, os.O_RDONLY | getattr(os, "O_DIRECTORY", 0))
            try:
                os.fsync(dir_fd)
            finally:
                os.close(dir_fd)
        finally:
            try:
                os.unlink(temp_name)
            except FileNotFoundError:
                pass


class HTTPRangeByteBudget:
    """Serialize range requests and cap aggregate response-body bytes.

    A request reserves its maximum possible body (the requested range length)
    before dispatch. Undecoded response-body bytes yielded by
    ``response.content.read`` are charged; HTTP headers, TLS/IP overhead, and
    bytes buffered below that stream API are excluded. Non-206 or malformed
    replies are explicitly closed without draining their bodies.
    Unused reservation is released on success or failure, while consumed body
    bytes remain charged. A single lock serializes all clients sharing this
    budget, so concurrent callers cannot race the cap. It retries at most once
    for transport failures/timeouts and HTTP 5xx, with 0.5s exponential backoff;
    auth, 416, and protocol failures are never retried.
    """

    def __init__(self, limit_bytes: int = 250_000_000, chunk_bytes: int = 64 * 1024,
                 *, checkpoint: RangeCheckpointStore | None = None):
        if limit_bytes <= 0:
            raise ValueError("limit_bytes must be positive")
        if chunk_bytes <= 0:
            raise ValueError("chunk_bytes must be positive")
        self.limit_bytes = int(limit_bytes)
        self.chunk_bytes = int(chunk_bytes)
        if checkpoint and checkpoint.limit_bytes != int(limit_bytes):
            raise ValueError("checkpoint byte limit differs from budget")
        self.checkpoint = checkpoint
        self.bytes_received = checkpoint.bytes_received if checkpoint else 0
        self.reserved_bytes = 0
        self._dispatch_lock = asyncio.Lock()
        self._stage_deadline: float | None = None

    def set_stage_deadline(self, seconds: float) -> None:
        self._stage_deadline = time.monotonic() + float(seconds)

    def clear_stage_deadline(self) -> None:
        self._stage_deadline = None

    @property
    def stage_time_remaining(self) -> float | None:
        if self._stage_deadline is None:
            return None
        return self._stage_deadline - time.monotonic()

    @property
    def remaining_bytes(self) -> int:
        return self.limit_bytes - self.bytes_received - self.reserved_bytes

    async def fetch_range(
        self,
        session: Any,
        url: str,
        start: int,
        end: int,
        *,
        timeout: Any = None,
        headers: Mapping[str, str] | None = None,
        request_options: Mapping[str, Any] | None = None,
        context: Mapping[str, str] | None = None,
    ) -> bytes:
        """Fetch with at most one transient-only retry, shared across resumes."""
        if start < 0 or end <= start:
            raise ValueError("range must satisfy 0 <= start < end")
        ctx = dict(context or {})
        key = self.checkpoint.range_key(url, start, end, ctx) if self.checkpoint else None
        retries_used = self.checkpoint.retry_count(key) if self.checkpoint and key else 0
        attempt = min(retries_used, 1)
        while True:
            try:
                return await self._fetch_range_once(
                    session, url, start, end, timeout=timeout, headers=headers,
                    request_options=request_options, context=ctx, attempt_number=attempt,
                )
            except Exception as exc:
                if attempt >= 1 or not self._is_transient(exc):
                    raise
                delay = 0.5 * (2 ** attempt)
                if self.checkpoint and key:
                    self.checkpoint.record_retry_wait(key, delay_seconds=delay)
                await asyncio.sleep(delay)
                attempt += 1

    @staticmethod
    def _is_transient(exc: Exception) -> bool:
        if isinstance(exc, (RangeProtocolError, ValueError, TypeError)):
            return False
        if isinstance(exc, (OSError, asyncio.TimeoutError, TransientHTTPStatus)):
            return True
        try:
            import aiohttp
            return isinstance(exc, aiohttp.ClientError)
        except ImportError:
            return False

    async def _fetch_range_once(
        self,
        session: Any,
        url: str,
        start: int,
        end: int,
        *,
        timeout: Any = None,
        headers: Mapping[str, str] | None = None,
        request_options: Mapping[str, Any] | None = None,
        context: Mapping[str, str] | None = None,
        attempt_number: int = 0,
    ) -> bytes:
        """Fetch `[start, end)` as one exact HTTP 206 response.

        The inclusive Range header is generated here. HTTP 200, malformed or
        mismatched Content-Range, and known oversized Content-Length values
        are rejected before reading the body.
        """
        if start < 0 or end <= start:
            raise ValueError("range must satisfy 0 <= start < end")
        expected = end - start
        context = dict(context or {})
        url_id = self.checkpoint.resource_id(url) if self.checkpoint else None
        key = self.checkpoint.range_key(url, start, end, context) if self.checkpoint else None
        if self.checkpoint and key:
            cached = self.checkpoint.verified_body(key, expected)
            if cached is not None:
                return cached

        # Hold the shared lock through response consumption: this serializes
        # dispatch and makes reserve/check/update one atomic budget operation.
        async with self._dispatch_lock:
            # Another waiter may have completed this exact range while this
            # coroutine waited for the lock. Recheck persistent cache here to
            # prevent duplicate dispatches for identical concurrent reads.
            if self.checkpoint and key:
                cached = self.checkpoint.verified_body(key, expected)
                if cached is not None:
                    return cached
            if self.bytes_received + self.reserved_bytes + expected > self.limit_bytes:
                raise RangeBudgetExceeded(
                    f"cannot reserve {expected} bytes; "
                    f"{self.remaining_bytes} bytes remain"
                )
            self.reserved_bytes += expected
            reservation_remaining = expected
            attempt_body_bytes = 0
            if self.checkpoint and key:
                self.checkpoint.begin_range(key, {
                    "task_id": self.checkpoint.task_id, "context": context,
                    "resource_sha256": url_id, "start": start, "end": end,
                    "reserved_bytes": expected, "attempt_body_bytes": 0,
                    "automatic_retries": attempt_number,
                })
            request_headers = dict(headers or {})
            request_headers["Accept-Encoding"] = "identity"
            request_headers["Range"] = f"bytes={start}-{end - 1}"
            request_kwargs: dict[str, Any] = dict(request_options or {})
            # Range offsets refer to the encoded representation. Avoid
            # transparent decompression changing the counted payload.
            request_kwargs.setdefault("auto_decompress", False)
            request_kwargs["headers"] = request_headers
            if timeout is not None:
                request_kwargs["timeout"] = timeout

            response = None
            try:
                response_cm = session.get(url, **request_kwargs)
                async with response_cm as response:
                    try:
                        if 500 <= response.status <= 599:
                            raise TransientHTTPStatus(f"transient HTTP {response.status}")
                        if response.status != 206:
                            raise RangeProtocolError(
                                f"expected HTTP 206 for byte range, got {response.status}"
                            )

                        content_range = response.headers.get("Content-Range", "")
                        match = re.fullmatch(r"bytes (\d+)-(\d+)/(\d+|\*)", content_range)
                        if not match or int(match.group(1)) != start or int(match.group(2)) != end - 1:
                            raise RangeProtocolError(
                                f"Content-Range does not match requested [{start},{end})"
                            )

                        content_length = response.headers.get("Content-Length")
                        if content_length is None:
                            raise RangeProtocolError("Content-Length is required; chunked/unknown body rejected")
                        try:
                            declared_length = int(content_length)
                        except (TypeError, ValueError) as exc:
                            raise RangeProtocolError("invalid Content-Length") from exc
                        if declared_length != expected:
                            raise RangeProtocolError(
                                f"Content-Length {declared_length} differs from reserved {expected}"
                            )
                        transfer_encoding = response.headers.get("Transfer-Encoding", "")
                        if transfer_encoding:
                            raise RangeProtocolError("Transfer-Encoding is not accepted for bounded ranges")
                        content_encoding = response.headers.get("Content-Encoding", "identity").lower()
                        if content_encoding not in ("", "identity"):
                            raise RangeProtocolError("encoded response body is not accepted")

                        chunks: list[bytes] = []
                        while reservation_remaining > 0:
                            read_size = min(self.chunk_bytes, reservation_remaining)
                            chunk = await response.content.read(read_size)
                            if not chunk:
                                received = expected - reservation_remaining
                                raise RangeProtocolError(
                                    f"truncated range body: received {received} of {expected} bytes"
                                )

                            # Count body bytes as they cross the response stream
                            # boundary, before any returned/output buffer append.
                            body_length = len(chunk)
                            self.bytes_received += body_length
                            attempt_body_bytes += body_length
                            if self.checkpoint:
                                if key:
                                    self.checkpoint.record_chunk(key, body_length, attempt_body_bytes)
                                else:
                                    self.checkpoint.charge(body_length)
                            admitted = min(body_length, reservation_remaining)
                            self.reserved_bytes -= admitted
                            reservation_remaining -= admitted
                            if body_length > read_size:
                                raise RangeProtocolError(
                                    "transport yielded more body bytes than the reserved read size"
                                )
                            chunks.append(bytes(chunk))

                        body = b"".join(chunks)
                        if self.checkpoint and key:
                            self.checkpoint.record_range(key, {
                                "task_id": self.checkpoint.task_id, "context": context,
                                "resource_sha256": url_id, "start": start, "end": end,
                                "attempt_body_bytes": attempt_body_bytes,
                                "total_body_bytes": self.bytes_received,
                                "automatic_retries": attempt_number,
                            }, body=body)
                        return body
                    except BaseException as exc:
                        if self.checkpoint and key:
                            self.checkpoint.record_range(key, {
                                "task_id": self.checkpoint.task_id, "context": context,
                                "resource_sha256": url_id, "start": start, "end": end,
                                "attempt_body_bytes": attempt_body_bytes,
                                "total_body_bytes": self.bytes_received,
                                "automatic_retries": attempt_number, "status": "failed",
                                "error": type(exc).__name__,
                            })
                        # Do not drain a rejected/error body. Abort immediately.
                        close = getattr(response, "close", None)
                        if close is not None:
                            close()
                        raise
            finally:
                # Charge consumed bytes permanently and release only the
                # unconsumed part of this request's reservation.
                self.reserved_bytes -= reservation_remaining


def install_fsspec_httpfile_budget(http_file: Any, budget: HTTPRangeByteBudget,
                                   *, context: Mapping[str, str] | None = None,
                                   timeout_seconds: float = 30.0) -> None:
    """Install the budget on an already-open fsspec HTTPFile cache fetcher.

    `http_file` must already be opened through the caller's authenticated
    Earthaccess/fsspec path. The original HTTP session and URL are reused.
    The function intentionally does not open files or perform network I/O.
    """
    from fsspec.asyn import sync

    # earthaccess returns an EarthAccessFile proxy whose underlying fsspec
    # handle is stored in `.f`. Patching the proxy would shadow attributes on
    # the proxy itself and leave the actual cache fetcher unguarded.
    target = getattr(http_file, "f", None) or http_file
    required = ("kwargs", "fs", "url", "session", "loop", "cache")
    missing = [name for name in required if not hasattr(target, name)]
    if missing or not hasattr(target.cache, "fetcher"):
        raise TypeError(f"expected an open fsspec HTTPFile; missing {missing or ['cache.fetcher']}")

    async def bounded_fetch(session: Any, url: str, start: int, end: int,
                            base_headers: Mapping[str, str], request_options: Mapping[str, Any]) -> bytes:
        remaining = timeout_seconds
        if budget._stage_deadline is not None:
            remaining = min(remaining, budget._stage_deadline - time.monotonic())
        if remaining <= 0:
            raise TimeoutError("HDF5 read stage deadline exceeded")
        try:
            from aiohttp import ClientTimeout
            request_timeout = ClientTimeout(total=remaining, connect=min(10.0, remaining),
                                            sock_read=min(20.0, remaining))
        except ImportError:
            request_timeout = remaining
        return await asyncio.wait_for(
            budget.fetch_range(session, url, start, end, timeout=request_timeout,
                               headers=base_headers, request_options=request_options, context=context),
            timeout=remaining,
        )

    def fetcher(start: int, end: int) -> bytes:
        kwargs = dict(getattr(target, "kwargs", {}))
        base_headers = kwargs.pop("headers", {})
        kwargs.pop("timeout", None)
        url = target.fs.encode_url(target.url)
        return sync(
            target.loop,
            bounded_fetch,
            target.session,
            url,
            start,
            end,
            base_headers,
            kwargs,
            timeout=timeout_seconds + 1,
        )

    # fsspec's cache retains a fetcher captured during HTTPFile construction;
    # replace both references so every cache miss uses the guarded path.
    target._fetch_range = fetcher
    target.cache.fetcher = fetcher

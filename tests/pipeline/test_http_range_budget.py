"""Offline tests for atomic HTTP range response-body accounting."""
import asyncio
import json

import pytest

from pipeline.http_range_budget import (
    HTTPRangeByteBudget,
    RangeBudgetExceeded,
    RangeCheckpointStore,
    RangeProtocolError,
    UnsafeProjectPath,
    install_fsspec_httpfile_budget,
    safe_project_path,
)


class FakeContent:
    def __init__(self, body=b"", *, fail_after=None, delay=0, overread=False):
        self.body = body
        self.position = 0
        self.fail_after = fail_after
        self.delay = delay
        self.read_calls = 0
        self.overread = overread

    async def read(self, size):
        self.read_calls += 1
        if self.delay:
            await asyncio.sleep(self.delay)
        if self.fail_after is not None and self.position >= self.fail_after:
            raise OSError("synthetic transport failure")
        if self.position >= len(self.body):
            return b""
        stop = min(self.position + (len(self.body) if self.overread else size), len(self.body))
        if self.fail_after is not None:
            stop = min(stop, self.fail_after)
        chunk = self.body[self.position:stop]
        self.position = stop
        return chunk


class FakeResponse:
    def __init__(self, status, headers, body=b"", **content_options):
        self.status = status
        self.headers = headers
        self.content = FakeContent(body, **content_options)
        self._session = None
        self.close_calls = 0

    async def __aenter__(self):
        if self._session:
            self._session.active += 1
            self._session.max_active = max(self._session.max_active, self._session.active)
            await asyncio.sleep(self._session.enter_delay)
        return self

    async def __aexit__(self, exc_type, exc, tb):
        if self._session:
            self._session.active -= 1

    def close(self):
        self.close_calls += 1


class FakeSession:
    def __init__(self, responses, *, enter_delay=0):
        self.responses = list(responses)
        self.enter_delay = enter_delay
        self.active = 0
        self.max_active = 0
        self.calls = []

    def get(self, url, **kwargs):
        self.calls.append((url, kwargs))
        response = self.responses.pop(0)
        response._session = self
        return response


def response(start, end, body, *, status=206, content_length="auto", content_range=None, **opts):
    headers = {
        "Content-Range": content_range or f"bytes {start}-{end - 1}/1000",
    }
    if content_length is not None and content_length != "auto":
        headers["Content-Length"] = str(content_length)
    elif content_length == "auto":
        headers["Content-Length"] = str(len(body))
    return FakeResponse(status, headers, body, **opts)


def run(coro):
    return asyncio.run(coro)


def test_concurrent_requests_are_reserved_atomically_and_serialized():
    budget = HTTPRangeByteBudget(limit_bytes=8, chunk_bytes=2)
    session = FakeSession(
        [response(0, 4, b"abcd", delay=0.01), response(4, 8, b"efgh", delay=0.01)],
        enter_delay=0.01,
    )

    async def both():
        return await asyncio.gather(
            budget.fetch_range(session, "local://fixture", 0, 4),
            budget.fetch_range(session, "local://fixture", 4, 8),
        )

    assert run(both()) == [b"abcd", b"efgh"]
    assert session.max_active == 1
    assert budget.bytes_received == 8
    assert budget.reserved_bytes == 0
    assert budget.remaining_bytes == 0
    assert all(call[1]["headers"]["Accept-Encoding"] == "identity" for call in session.calls)


def test_budget_is_reserved_before_dispatch_and_aggregate_cap_is_enforced():
    budget = HTTPRangeByteBudget(limit_bytes=5)
    session = FakeSession([response(0, 4, b"abcd")])
    assert run(budget.fetch_range(session, "local://fixture", 0, 4)) == b"abcd"
    with pytest.raises(RangeBudgetExceeded):
        run(budget.fetch_range(session, "local://fixture", 4, 6))
    assert len(session.calls) == 1
    assert budget.bytes_received == 4
    assert budget.reserved_bytes == 0


def test_http_200_is_rejected_without_consuming_body_and_releases_reservation():
    budget = HTTPRangeByteBudget(limit_bytes=20)
    bad = response(0, 4, b"abcd", status=200)
    session = FakeSession([bad])
    with pytest.raises(RangeProtocolError, match="expected HTTP 206"):
        run(budget.fetch_range(session, "local://fixture", 0, 4))
    assert bad.content.read_calls == 0
    assert bad.close_calls == 1
    assert budget.bytes_received == 0
    assert budget.reserved_bytes == 0
    assert budget.remaining_bytes == 20


def test_oversized_declared_body_is_rejected_before_reading():
    budget = HTTPRangeByteBudget(limit_bytes=20)
    bad = response(0, 4, b"oversized", content_length=9)
    session = FakeSession([bad])
    with pytest.raises(RangeProtocolError, match="differs from reserved"):
        run(budget.fetch_range(session, "local://fixture", 0, 4))
    assert bad.content.read_calls == 0
    assert bad.close_calls == 1
    assert budget.bytes_received == 0
    assert budget.reserved_bytes == 0


def test_transport_failure_keeps_consumed_bytes_charged_and_releases_unused_reservation():
    budget = HTTPRangeByteBudget(limit_bytes=20, chunk_bytes=2)
    broken = response(0, 6, b"abcdef", fail_after=2)
    broken_retry = response(0, 6, b"abcdef", fail_after=2)
    session = FakeSession([broken, broken_retry])
    with pytest.raises(OSError, match="synthetic transport failure"):
        run(budget.fetch_range(session, "local://fixture", 0, 6))
    assert budget.bytes_received == 4
    assert len(session.calls) == 2
    assert budget.reserved_bytes == 0
    assert budget.remaining_bytes == 16


def test_mismatched_content_range_releases_all_reservation():
    budget = HTTPRangeByteBudget(limit_bytes=20)
    bad = response(0, 4, b"abcd", content_range="bytes 10-13/1000")
    session = FakeSession([bad])
    with pytest.raises(RangeProtocolError, match="Content-Range"):
        run(budget.fetch_range(session, "local://fixture", 0, 4))
    assert bad.content.read_calls == 0
    assert budget.bytes_received == 0
    assert budget.reserved_bytes == 0


@pytest.mark.parametrize(
    "headers, message",
    [
        ({"Content-Range": "bytes 0-3/1000"}, "Content-Length is required"),
        ({"Content-Range": "bytes 0-3/1000", "Content-Length": "4", "Transfer-Encoding": "chunked"}, "Transfer-Encoding"),
        ({"Content-Range": "bytes 0-3/1000", "Content-Length": "4", "Content-Encoding": "gzip"}, "encoded response"),
    ],
)
def test_unknown_chunked_or_encoded_bodies_are_rejected_and_aborted(headers, message):
    budget = HTTPRangeByteBudget(limit_bytes=20)
    bad = FakeResponse(206, headers, b"abcd")
    session = FakeSession([bad])
    with pytest.raises(RangeProtocolError, match=message):
        run(budget.fetch_range(session, "local://fixture", 0, 4))
    assert bad.content.read_calls == 0
    assert bad.close_calls == 1
    assert budget.bytes_received == 0
    assert budget.reserved_bytes == 0


def test_body_chunk_over_reservation_is_counted_then_aborted_before_return_buffer():
    budget = HTTPRangeByteBudget(limit_bytes=20, chunk_bytes=4)
    malformed = response(0, 4, b"abcde", content_length=4, overread=True)
    session = FakeSession([malformed])
    with pytest.raises(RangeProtocolError, match="more body bytes than the reserved"):
        run(budget.fetch_range(session, "local://fixture", 0, 4))
    assert malformed.content.read_calls == 1
    assert malformed.close_calls == 1
    assert budget.bytes_received == 5
    assert budget.reserved_bytes == 0


def test_truncated_response_charges_received_body_and_releases_reservation():
    budget = HTTPRangeByteBudget(limit_bytes=20, chunk_bytes=2)
    short = response(0, 6, b"abc", content_length=6)
    session = FakeSession([short])
    with pytest.raises(RangeProtocolError, match="truncated range body"):
        run(budget.fetch_range(session, "local://fixture", 0, 6))
    assert budget.bytes_received == 3
    assert budget.reserved_bytes == 0


def test_earthaccess_proxy_cache_miss_uses_installed_shared_budget(monkeypatch):
    """The cache path on EarthAccessFile.f must be guarded before h5py uses it."""
    import pipeline.http_range_budget as module

    class Cache:
        def __init__(self):
            self.fetcher = lambda start, end: b"unguarded"

    class FS:
        @staticmethod
        def encode_url(url):
            return "local://" + url

    class HTTPFile:
        def __init__(self):
            self.kwargs = {"headers": {"X-Test": "yes"}}
            self.fs = FS()
            self.url = "fixture"
            self.session = FakeSession([response(0, 4, b"data")])
            self.loop = object()
            self.cache = Cache()
            self._fetch_range = self.cache.fetcher

    class EarthAccessProxy:
        def __init__(self, f):
            self.f = f

    fake_http = HTTPFile()
    proxy = EarthAccessProxy(fake_http)
    budget = HTTPRangeByteBudget(limit_bytes=4)
    calls = []

    def local_sync(loop, coro_func, *args, **kwargs):
        calls.append(loop)
        sync_timeout = kwargs.pop("timeout")
        return asyncio.run(asyncio.wait_for(coro_func(*args, **kwargs), sync_timeout))

    monkeypatch.setattr("fsspec.asyn.sync", local_sync)
    install_fsspec_httpfile_budget(proxy, budget)

    assert fake_http.cache.fetcher is fake_http._fetch_range
    assert fake_http.cache.fetcher(0, 4) == b"data"
    assert calls == [fake_http.loop]
    assert fake_http.session.calls[0][0] == "local://fixture"
    assert fake_http.session.calls[0][1]["headers"]["X-Test"] == "yes"
    from aiohttp import ClientTimeout
    assert isinstance(fake_http.session.calls[0][1]["timeout"], ClientTimeout)
    assert fake_http.session.calls[0][1]["timeout"].total <= 30
    assert budget.bytes_received == 4
    assert budget.remaining_bytes == 0


def test_checkpoint_resumes_verified_range_without_second_network_request(tmp_path):
    state = tmp_path / "checkpoint.json"
    cache = tmp_path / "ranges"
    scope = {"collection": "fixture", "mode": "mask-only"}
    context = {"granule": "g1", "variable": "mask"}
    first_store = RangeCheckpointStore(state, cache, task_id="task-1", limit_bytes=8, scope=scope)
    first = HTTPRangeByteBudget(limit_bytes=8, checkpoint=first_store)
    session = FakeSession([response(0, 4, b"data")])
    assert run(first.fetch_range(session, "https://example.test/h5?secret=do-not-save", 0, 4, context=context)) == b"data"
    assert first.bytes_received == 4
    stored = state.read_text()
    assert "secret" not in stored and "do-not-save" not in stored
    first_store.close()

    resumed_store = RangeCheckpointStore(state, cache, task_id="task-1", limit_bytes=8, scope=scope)
    resumed = HTTPRangeByteBudget(limit_bytes=8, checkpoint=resumed_store)
    empty_session = FakeSession([])
    assert run(resumed.fetch_range(empty_session, "https://example.test/h5?secret=rotated", 0, 4, context=context)) == b"data"
    assert empty_session.calls == []
    assert resumed.bytes_received == 4
    assert resumed.remaining_bytes == 4
    resumed_store.close()


def test_yarl_url_range_identity_is_string_normalized_without_persisting_signed_query(tmp_path):
    from yarl import URL

    state, cache = tmp_path / "state.json", tmp_path / "cache"
    scope = {"variable": "mask"}
    context = {"granule": "g", "variable": "mask"}
    store = RangeCheckpointStore(state, cache, task_id="yarl", limit_bytes=8, scope=scope)
    budget = HTTPRangeByteBudget(limit_bytes=8, checkpoint=store)
    signed = URL("https://example.test/item.h5?token=not-for-checkpoint", encoded=True)
    session = FakeSession([response(0, 4, b"data")])
    assert run(budget.fetch_range(session, signed, 0, 4, context=context)) == b"data"
    persisted = state.read_text()
    assert "token" not in persisted and "not-for-checkpoint" not in persisted
    store.close()

    store2 = RangeCheckpointStore(state, cache, task_id="yarl", limit_bytes=8, scope=scope)
    budget2 = HTTPRangeByteBudget(limit_bytes=8, checkpoint=store2)
    rotated = URL("https://example.test/item.h5?token=rotated", encoded=True)
    empty = FakeSession([])
    assert run(budget2.fetch_range(empty, rotated, 0, 4, context=context)) == b"data"
    assert empty.calls == []
    store2.close()


def test_failed_range_checkpoint_charges_partial_bytes_across_single_retry(tmp_path):
    state = tmp_path / "checkpoint.json"
    cache = tmp_path / "ranges"
    store = RangeCheckpointStore(state, cache, task_id="task-2", limit_bytes=8,
                                 scope={"granule": "g1", "variable": "mask"})
    budget = HTTPRangeByteBudget(limit_bytes=8, chunk_bytes=2, checkpoint=store)
    failed = FakeSession([
        response(0, 6, b"abcdef", fail_after=2),
        response(0, 6, b"abcdef"),
    ])
    assert run(budget.fetch_range(failed, "local://h5", 0, 6,
                                  context={"granule": "g1", "variable": "mask"})) == b"abcdef"
    persisted = json.loads(state.read_text())
    assert persisted["bytes_received"] == 8
    assert persisted["last_event"]["status"] == "complete"
    assert persisted["automatic_retries"] == 1
    range_record = next(iter(persisted["ranges"].values()))
    assert range_record["attempt_body_bytes"] == 6
    assert range_record["automatic_retries"] == 1
    store.close()

    resumed_store = RangeCheckpointStore(state, cache, task_id="task-2", limit_bytes=8,
                                         scope={"granule": "g1", "variable": "mask"})
    resumed = HTTPRangeByteBudget(limit_bytes=8, chunk_bytes=2, checkpoint=resumed_store)
    empty_session = FakeSession([])
    assert run(resumed.fetch_range(empty_session, "local://h5", 0, 6,
                                   context={"granule": "g1", "variable": "mask"})) == b"abcdef"
    assert empty_session.calls == []
    assert resumed.bytes_received == 8
    assert resumed.remaining_bytes == 0
    resumed_store.close()


def test_401_and_protocol_errors_are_never_retried():
    for status in (401, 403, 416):
        budget = HTTPRangeByteBudget(limit_bytes=8)
        session = FakeSession([response(0, 4, b"xxxx", status=status)])
        with pytest.raises(RangeProtocolError):
            run(budget.fetch_range(session, "local://fixture", 0, 4))
        assert len(session.calls) == 1


def test_http_5xx_gets_one_retry_then_succeeds(tmp_path):
    store = RangeCheckpointStore(tmp_path / "s.json", tmp_path / "c", task_id="5xx",
                                 limit_bytes=8, scope={"v": "mask"})
    budget = HTTPRangeByteBudget(limit_bytes=8, checkpoint=store)
    session = FakeSession([response(0, 4, b"", status=503), response(0, 4, b"good")])
    assert run(budget.fetch_range(session, "local://fixture", 0, 4,
                                  context={"granule": "g", "variable": "mask"})) == b"good"
    assert len(session.calls) == 2
    assert store.state["automatic_retries"] == 1


def test_checkpoint_scope_mismatch_fails_closed(tmp_path):
    state, cache = tmp_path / "checkpoint.json", tmp_path / "ranges"
    store = RangeCheckpointStore(state, cache, task_id="task-1", limit_bytes=8, scope={"var": "mask"})
    store.close()
    with pytest.raises(ValueError, match="identity/budget/scope mismatch"):
        RangeCheckpointStore(state, cache, task_id="task-1", limit_bytes=8, scope={"var": "HHHH"})


def test_duplicate_concurrent_same_range_is_dispatched_once(tmp_path):
    store = RangeCheckpointStore(tmp_path / "state.json", tmp_path / "cache",
                                 task_id="dup", limit_bytes=4, scope={"v": "mask"})
    budget = HTTPRangeByteBudget(limit_bytes=4, checkpoint=store)
    session = FakeSession([response(0, 4, b"same", delay=0.01)])
    ctx = {"granule": "g", "variable": "mask"}

    async def both():
        return await asyncio.gather(
            budget.fetch_range(session, "local://granule", 0, 4, context=ctx),
            budget.fetch_range(session, "local://granule", 0, 4, context=ctx),
        )

    assert run(both()) == [b"same", b"same"]
    assert len(session.calls) == 1
    assert budget.bytes_received == 4
    store.close()


def test_interrupted_inflight_reservation_is_conservatively_charged(tmp_path):
    state, cache = tmp_path / "state.json", tmp_path / "cache"
    scope = {"variable": "mask"}
    store = RangeCheckpointStore(state, cache, task_id="crash", limit_bytes=10, scope=scope)
    key = store.range_key("local://h5", 0, 6, {"granule": "g", "variable": "mask"})
    store.begin_range(key, {"context": {"granule": "g", "variable": "mask"},
                       "start": 0, "end": 6, "reserved_bytes": 6, "attempt_body_bytes": 0})
    store.record_chunk(key, 2, 2)
    store.close()
    resumed = RangeCheckpointStore(state, cache, task_id="crash", limit_bytes=10, scope=scope)
    assert resumed.bytes_received == 6
    assert resumed.state["ranges"][key]["status"] == "interrupted"
    assert resumed.state["ranges"][key]["conservative_recovery_charge"] == 4
    resumed.close()


def test_corrupt_checkpoint_envelope_and_corrupt_range_cache_fail_closed(tmp_path):
    state, cache = tmp_path / "state.json", tmp_path / "cache"
    scope = {"var": "mask"}
    store = RangeCheckpointStore(state, cache, task_id="integrity", limit_bytes=8, scope=scope)
    budget = HTTPRangeByteBudget(limit_bytes=8, checkpoint=store)
    session = FakeSession([response(0, 4, b"good")])
    ctx = {"granule": "g", "variable": "mask"}
    run(budget.fetch_range(session, "local://h5", 0, 4, context=ctx))
    record = next(iter(store.state["ranges"].values()))
    (cache / record["cache_file"]).write_bytes(b"evil")
    store.close()
    resumed = HTTPRangeByteBudget(limit_bytes=8, checkpoint=RangeCheckpointStore(
        state, cache, task_id="integrity", limit_bytes=8, scope=scope))
    refetch = FakeSession([response(0, 4, b"good")])
    assert run(resumed.fetch_range(refetch, "local://h5", 0, 4, context=ctx)) == b"good"
    assert len(refetch.calls) == 1
    assert resumed.bytes_received == 8
    resumed.checkpoint.close()

    envelope = json.loads(state.read_text())
    envelope["bytes_received"] += 1
    state.write_text(json.dumps(envelope))
    with pytest.raises(ValueError, match="checksum verification failed"):
        RangeCheckpointStore(state, cache, task_id="integrity", limit_bytes=8, scope=scope)


def test_checkpoint_exclusive_process_lock(tmp_path):
    state, cache = tmp_path / "state.json", tmp_path / "cache"
    store = RangeCheckpointStore(state, cache, task_id="locked", limit_bytes=8, scope={"v": "mask"})
    with pytest.raises(RuntimeError, match="already in use"):
        RangeCheckpointStore(state, cache, task_id="locked", limit_bytes=8, scope={"v": "mask"})
    store.close()
    second = RangeCheckpointStore(state, cache, task_id="locked", limit_bytes=8, scope={"v": "mask"})
    second.close()


def test_fsspec_http_info_numeric_timeout_cancels_stalled_setup(monkeypatch):
    """Open-time `timeout` is fsspec's numeric sync deadline, not aiohttp's type."""
    import threading
    from fsspec.exceptions import FSTimeoutError
    from fsspec.implementations.http import HTTPFileSystem

    cancelled = threading.Event()

    class SlowSession:
        async def head(self, *_args, **_kwargs):
            try:
                await asyncio.Event().wait()
            finally:
                cancelled.set()

    fs = HTTPFileSystem()

    async def set_session():
        return SlowSession()

    monkeypatch.setattr(fs, "set_session", set_session)
    with pytest.raises(FSTimeoutError):
        fs.info("https://local.invalid/object", timeout=0.03)
    assert cancelled.wait(1)


def test_safe_path_rejects_traversal_and_symlink_components(tmp_path):
    root = tmp_path / "project"
    root.mkdir()
    with pytest.raises(UnsafeProjectPath, match="escapes project root"):
        safe_project_path(root, root.parent / "outside" / "state.json")
    (root / "linked").symlink_to(tmp_path, target_is_directory=True)
    with pytest.raises(UnsafeProjectPath, match="symlink path component"):
        safe_project_path(root, root / "linked" / "state.json")


def test_checkpoint_rejects_symlink_cache_dir_state_leaf_and_lock_leaf(tmp_path):
    root = tmp_path / "project"
    root.mkdir()
    outside = tmp_path / "outside"
    outside.mkdir()
    (root / "cache-link").symlink_to(outside, target_is_directory=True)
    with pytest.raises(UnsafeProjectPath, match="symlink"):
        RangeCheckpointStore(root / "state.json", root / "cache-link", task_id="x",
                             limit_bytes=8, scope={}, project_root=root)

    state_target = outside / "state"
    state_target.write_text("{}")
    (root / "state.json").symlink_to(state_target)
    with pytest.raises(UnsafeProjectPath, match="symlink"):
        RangeCheckpointStore(root / "state.json", root / "cache", task_id="x",
                             limit_bytes=8, scope={}, project_root=root)

    (root / "state.json").unlink()
    (root / "state.json.lock").symlink_to(outside / "lock")
    with pytest.raises(UnsafeProjectPath, match="symlink"):
        RangeCheckpointStore(root / "state.json", root / "cache", task_id="x",
                             limit_bytes=8, scope={}, project_root=root)

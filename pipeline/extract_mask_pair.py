"""Bounded, mask-only NISAR GCOV subset reader.

This command is intentionally inert by default.  `--execute` performs one
authenticated read of only the documented mask hyperslab for each granule;
it never accesses HHHH or numberOfLooks and never computes change.
"""
from __future__ import annotations

import argparse
import contextlib
import hashlib
import json
import os
import signal
import tempfile
import time
from pathlib import Path
from typing import Any

import numpy as np

from pipeline.http_range_budget import (
    HTTPRangeByteBudget,
    RangeCheckpointStore,
    install_fsspec_httpfile_budget,
    safe_project_path,
)

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "data/metadata/candidate_pair_manifest.json"
BBOX = (104.95, 10.45, 105.05, 10.55)
LIMIT = 250_000_000
TASK_ID = "4K-COVERAGE-01-angiang-mask-only-v1"
STAGE_TIMEOUT_SECONDS = 90
FSSPEC_OPEN_TIMEOUT_SECONDS = 30
PAIR = (
    {
        "granule": "NISAR_L2_PR_GCOV_033_148_D_083_4005_DHDH_A_20261022T113140_20261022T113214_P05036_N_F_J_001",
        "concept_id": "G4404304390-ASF",
    },
    {
        "granule": "NISAR_L2_PR_GCOV_034_148_D_083_4005_DHDH_A_20261103T113137_20261103T113215_P05036_N_F_J_001",
        "concept_id": "G4410154671-ASF",
    },
)
GROUP = "/science/LSAR/GCOV/grids/frequencyA"


class StageTimeout(TimeoutError):
    pass


@contextlib.contextmanager
def stage_deadline(name: str, seconds: float = STAGE_TIMEOUT_SECONDS):
    """Interrupt blocking stage work on the main thread with a strict deadline."""
    if not hasattr(signal, "setitimer") or not hasattr(signal, "SIGALRM"):
        raise RuntimeError("strict stage timeout requires POSIX interval timers")
    previous = signal.getsignal(signal.SIGALRM)
    def expired(_signum, _frame):
        raise StageTimeout(f"stage {name!r} exceeded {seconds}s deadline")
    signal.signal(signal.SIGALRM, expired)
    signal.setitimer(signal.ITIMER_REAL, seconds)
    try:
        yield
    finally:
        signal.setitimer(signal.ITIMER_REAL, 0)
        signal.signal(signal.SIGALRM, previous)


@contextlib.contextmanager
def tracked_stage(checkpoint: RangeCheckpointStore | None, name: str,
                 context: dict[str, str] | None = None):
    if checkpoint:
        checkpoint.record_stage(name, "running", context=context)
    try:
        yield
    except BaseException as exc:
        if checkpoint:
            checkpoint.record_stage(name, "failed", context=context,
                                    details={"error_type": type(exc).__name__})
        raise
    else:
        if checkpoint:
            checkpoint.record_stage(name, "complete", context=context)


def _plan() -> dict[str, Any]:
    return {
        "mode": "MASK_ONLY",
        "task_id": TASK_ID,
        "data_availability_status": "UNAVAILABLE_UNTIL_MASK_PAIR_RETRIEVAL_AND_ALIGNMENT_ARE_VERIFIED",
        "provider": "ASF",
        "collection": "NISAR_L2_GCOV_V1",
        "bbox_wgs84": list(BBOX),
        "granules": [{**g, "dataset": f"{GROUP}/mask"} for g in PAIR],
        "shared_response_body_budget_bytes": LIMIT,
        "concurrency": 1,
        "automatic_retry_policy": "at most 1 retry for transport timeout/error or HTTP 5xx with 0.5s exponential delay; never retry auth, 416, or protocol errors; partial bytes stay charged",
        "checkpoint_integrity": "unkeyed SHA256 detects accidental corruption only; it is not tamper-proof or authentic",
        "range_timeout_seconds": 30,
        "stage_timeout_seconds": STAGE_TIMEOUT_SECONDS,
        "change_analysis": False,
        "sensitive_backscatter_datasets_read": False,
        "execute_requires_explicit_flag": True,
    }


def _exact_granule(earthaccess: Any, spec: dict[str, str]) -> Any:
    results = earthaccess.search_data(
        short_name="NISAR_L2_GCOV_V1", granule_name=spec["granule"], count=1
    )
    if len(results) != 1:
        raise RuntimeError(f"exact catalog lookup did not return one granule: {spec['granule']}")
    item = results[0]
    # DataGranule is a dict-like CMR result; unlike DataCollection it does not
    # expose concept_id/native_id convenience properties in earthaccess 0.19.
    concept = item.get("meta", {}).get("concept-id")
    native = item.get("umm", {}).get("GranuleUR")
    if concept != spec["concept_id"] or native != spec["granule"]:
        raise RuntimeError("catalog record identity did not match the approved granule")
    return item


def _require_mask_dataset(h5: Any, path: str) -> Any:
    if path not in h5:
        raise RuntimeError(f"required mask dataset missing: {path}")
    dataset = h5[path]
    if getattr(dataset, "ndim", None) != 2:
        raise RuntimeError("mask dataset is not two-dimensional")
    return dataset


def valid_mask_pixels(mask: np.ndarray) -> np.ndarray:
    """Rev F mask predicate: 1..N valid subswath, 0 invalid, 255 fill/outside."""
    return (mask > 0) & (mask < 255)


def grids_compatible(first: dict[str, Any], second: dict[str, Any]) -> bool:
    a, b = first["window_coordinates_center_m"], second["window_coordinates_center_m"]
    return (
        first["projection"] == second["projection"]
        and first["full_grid_shape"] == second["full_grid_shape"]
        and first["shape"] == second["shape"]
        and first["window_row_col"] == second["window_row_col"]
        and first["pixel_spacing_m"] == second["pixel_spacing_m"]
        and all(abs(a[k] - b[k]) <= 0.01 for k in a)
    )


def _open_guarded_hdf5(earthaccess: Any, granule: Any, budget: HTTPRangeByteBudget,
                       *, context: dict[str, str]):
    """Open exact catalog object and install the budget before h5py access."""
    import h5py

    checkpoint = budget.checkpoint
    with tracked_stage(checkpoint, f"{context['granule']}:authenticated_fsspec_preflight", context):
        store = getattr(earthaccess, "__store__", None)
        if store is None or not hasattr(store, "get_fsspec_session"):
            raise RuntimeError("Earthaccess authenticated HTTPS fsspec session is unavailable")
        fs = store.get_fsspec_session()
        url = _exact_hdf5_data_url(granule, context["granule"])
        # earthaccess 0.19's Store._open_files performs fs.info(url) without
        # forwarding open_kwargs. Use its documented authenticated fsspec
        # session directly so this preflight has an explicit numeric fsspec
        # sync deadline. Passing `size` to fs.open skips its second info call.
        info = fs.info(url, timeout=FSSPEC_OPEN_TIMEOUT_SECONDS)
        size = info.get("size")
        if not isinstance(size, int) or size <= 0:
            raise RuntimeError("authenticated fsspec preflight returned no valid object size")
        stream = fs.open(
            url, mode="rb", size=size, block_size=8192, cache_type="none",
            timeout=FSSPEC_OPEN_TIMEOUT_SECONDS,
        )
    # This hook is deliberately before h5py.File and any metadata/dataset read.
    install_fsspec_httpfile_budget(stream, budget, context=context, timeout_seconds=30.0)
    target = stream
    if target.cache.fetcher is not target._fetch_range:
        raise RuntimeError("shared response budget is not installed on the active fsspec cache")
    try:
        with tracked_stage(checkpoint, f"{context['granule']}:hdf5_open", context):
            handle = h5py.File(stream, "r")
    except BaseException:
        close = getattr(stream, "close", None)
        if close:
            close()
        raise
    return handle, stream


def _exact_hdf5_data_url(granule: Any, expected_granule_ur: str) -> str:
    """Select only the exact producer HDF5 link from the verified CMR record."""
    from urllib.parse import urlsplit

    links = granule.data_links(access="external")
    expected_name = expected_granule_ur + ".h5"
    matches = [url for url in links if Path(urlsplit(url).path).name == expected_name]
    if len(matches) != 1:
        raise RuntimeError("verified CMR record does not expose exactly one matching producer HDF5 link")
    return matches[0]


def _read_mask(earthaccess: Any, spec: dict[str, str], budget: HTTPRangeByteBudget):
    context = {"granule": spec["granule"], "variable": "mask"}
    with tracked_stage(budget.checkpoint, f"{spec['granule']}:catalog_lookup", context):
        with stage_deadline("catalog_lookup"):
            granule = _exact_granule(earthaccess, spec)
    budget.set_stage_deadline(STAGE_TIMEOUT_SECONDS)
    h5 = stream = None
    try:
        h5, stream = _open_guarded_hdf5(earthaccess, granule, budget, context=context)
        target = getattr(stream, "f", None) or stream
        if target.cache.fetcher is not target._fetch_range:
            raise RuntimeError("range budget hook is not installed on the active cache")
        stage_start = time.monotonic()
        with tracked_stage(budget.checkpoint, f"{spec['granule']}:mask_metadata_hyperslab", context):
            path = f"{GROUP}/mask"
            ds = _require_mask_dataset(h5, path)
            proj_path = f"{GROUP}/projection"
            x_path, y_path = f"{GROUP}/xCoordinates", f"{GROUP}/yCoordinates"
            if proj_path not in h5 or x_path not in h5 or y_path not in h5:
                raise RuntimeError("grid metadata required to validate the mask window is missing")
            projection = np.asarray(h5[proj_path][()]).item()
            if isinstance(projection, bytes):
                projection = projection.decode("ascii", errors="strict")
            if str(projection) not in ("32648", "EPSG:32648"):
                raise RuntimeError(f"unexpected or unverified projection: {projection!r}")
            # Derive a row/column window from the geographic bbox and actual axes.
            x = h5[x_path]
            y = h5[y_path]
            if ds.shape != (len(y), len(x)) or len(x) < 2 or len(y) < 2:
                raise RuntimeError("mask dimensions/grid metadata are inconsistent")
            x_values = np.asarray(x[()], dtype=np.float64)
            y_values = np.asarray(y[()], dtype=np.float64)
            dx, dy = float(x_values[1] - x_values[0]), float(y_values[1] - y_values[0])
            if not np.isclose(dx, 10.0, atol=1e-5) or not np.isclose(dy, -10.0, atol=1e-5):
                raise RuntimeError("grid spacing/orientation differs from the verified 10 m target")
            if not np.allclose(np.diff(x_values), dx, atol=1e-5) or not np.allclose(np.diff(y_values), dy, atol=1e-5):
                raise RuntimeError("nonuniform coordinate axes cannot support the bounded bbox window")
            from pyproj import Transformer
            transformer = Transformer.from_crs("EPSG:4326", "EPSG:32648", always_xy=True)
            west, south, east, north = BBOX
            samples = np.linspace(0.0, 1.0, 33)
            lon = np.concatenate((west + (east-west)*samples, west + (east-west)*samples,
                                  np.full_like(samples, west), np.full_like(samples, east)))
            lat = np.concatenate((np.full_like(samples, south), np.full_like(samples, north),
                                  south + (north-south)*samples, south + (north-south)*samples))
            px, py = transformer.transform(lon, lat)
            xmin, xmax, ymin, ymax = min(px), max(px), min(py), max(py)
            cols = np.flatnonzero((x_values >= xmin) & (x_values <= xmax))
            rows = np.flatnonzero((y_values <= ymax) & (y_values >= ymin))
            if cols.size == 0 or rows.size == 0:
                raise RuntimeError("bbox has no pixel centers in this granule grid")
            window = (int(rows.min()), int(rows.max()) + 1, int(cols.min()), int(cols.max()) + 1)
            r0, r1, c0, c1 = window
            values = np.asarray(ds[r0:r1, c0:c1])
            if time.monotonic() - stage_start > STAGE_TIMEOUT_SECONDS:
                raise StageTimeout("mask metadata + hyperslab stage exceeded deadline")
            if values.shape != (r1-r0, c1-c0):
                raise RuntimeError("mask hyperslab returned unexpected shape")
            counts = {str(int(v)): int(n) for v, n in zip(*np.unique(values, return_counts=True))}
            valid = valid_mask_pixels(values)
        return {
            "granule": spec["granule"], "concept_id": spec["concept_id"],
            "dataset": path, "full_grid_shape": list(ds.shape),
            "shape": list(values.shape), "window_row_col": list(window),
            "projection": str(projection), "pixel_spacing_m": [dx, abs(dy)],
            "window_coordinates_center_m": {
                "x_first": float(x_values[c0]), "x_last": float(x_values[c1-1]),
                "y_first": float(y_values[r0]), "y_last": float(y_values[r1-1]),
            },
            "coordinate_axis_checksums": {
                "x_sha256": hashlib.sha256(x_values.tobytes()).hexdigest(),
                "y_sha256": hashlib.sha256(y_values.tobytes()).hexdigest(),
            },
            "mask_counts": counts, "valid_pixels": int(valid.sum()),
            "valid_fraction": float(valid.mean()), "mask_values": values,
        }
    finally:
        if h5 is not None:
            h5.close()
        if stream is not None:
            close = getattr(stream, "close", None)
            if close:
                close()
        budget.clear_stage_deadline()


def run(execute: bool = False) -> dict[str, Any]:
    plan = _plan()
    if not execute:
        return plan
    import earthaccess

    checkpoint_root = ROOT / "data/metadata/range_checkpoints" / TASK_ID
    checkpoint = RangeCheckpointStore(
        checkpoint_root / "state.json", checkpoint_root / "ranges",
        task_id=TASK_ID, limit_bytes=LIMIT,
        project_root=ROOT,
        scope={
            "collection": "NISAR_L2_GCOV_V1", "mode": "mask-only",
            "bbox": ",".join(map(str, BBOX)),
            "granules": "|".join(item["granule"] for item in PAIR),
            "variable": "science/LSAR/GCOV/grids/frequencyA/mask",
        },
    )
    try:
        return _run_with_checkpoint(plan, earthaccess, checkpoint, checkpoint_root)
    finally:
        checkpoint.close()


def _run_with_checkpoint(plan: dict[str, Any], earthaccess: Any,
                         checkpoint: RangeCheckpointStore, checkpoint_root: Path) -> dict[str, Any]:
    final_dir = safe_project_path(ROOT, ROOT / "data/raw/nisar_subsets" / f"angiang_mask_only_{TASK_ID}")
    staging_dir = safe_project_path(ROOT, final_dir.with_name(final_dir.name + ".staging"))
    existing_manifest = safe_project_path(ROOT, final_dir / "mask_coverage_manifest.json")
    if existing_manifest.exists():
        prior = json.loads(existing_manifest.read_text())
        _validate_manifest_outputs(prior, ROOT)
        return prior
    if final_dir.exists():
        raise RuntimeError("final output directory exists without a complete manifest; refusing to overwrite")
    with stage_deadline("earthdata_login"):
        auth = earthaccess.login(strategy="netrc")
    if not getattr(auth, "authenticated", False):
        raise RuntimeError("Earthdata authentication failed")
    budget = HTTPRangeByteBudget(limit_bytes=LIMIT, checkpoint=checkpoint)
    results = []
    # Sequential reads use one aggregate budget; no pair of streams runs concurrently.
    for spec in PAIR:
        results.append(_read_mask(earthaccess, spec, budget))
    first, second = results
    # Two identically shaped arrays are not sufficient evidence of alignment.
    with tracked_stage(checkpoint, "pair_grid_compatibility", {"granules": "|".join(x["granule"] for x in PAIR)}):
        grids_equal = grids_compatible(first, second)
        if not grids_equal:
            raise RuntimeError("granule mask windows are not demonstrably grid-aligned; common coverage rejected")
    arrays = [r.pop("mask_values") for r in results]
    common = valid_mask_pixels(arrays[0]) & valid_mask_pixels(arrays[1])
    checkpoint.record_stage("common_mask_coverage", "running", context={"variable": "mask"})
    from rasterio.transform import from_origin
    staging_dir.mkdir(parents=True, exist_ok=True)
    a = first["window_coordinates_center_m"]
    x0, y0 = a["x_first"], a["y_first"]
    dx, dy = first["pixel_spacing_m"]
    transform = from_origin(x0 - dx/2, y0 + dy/2, dx, dy)
    output_crs = first["projection"] if first["projection"].startswith("EPSG:") else f"EPSG:{first['projection']}"
    output_files = []
    checkpoint.record_stage("common_mask_coverage", "complete", context={"variable": "mask"},
                            details={"common_valid_pixels": int(common.sum()), "fraction": float(common.mean())})
    with tracked_stage(checkpoint, "staged_mask_outputs", {"task_id": TASK_ID}):
        for label, arr in zip(("20261022", "20261103"), arrays):
            path = staging_dir / f"{label}_mask.tif"
            record = _write_mask_atomic(path, arr, crs=output_crs, transform=transform)
            record["path"] = str((final_dir / path.name).relative_to(ROOT))
            output_files.append(record)
    summary = {
        **plan,
        "status": "MASK_COVERAGE_READ",
        "task_id": TASK_ID,
        "measured_response_body_bytes": budget.bytes_received,
        "remaining_budget_bytes": budget.remaining_bytes,
        "observations": results,
        "common_valid_pixels": int(common.sum()),
        "common_valid_fraction": float(common.mean()),
        "grid_alignment_verified": grids_equal,
        "output_files": output_files,
        "measured_response_body_accounting": "HTTP response body bytes yielded by guarded aiohttp content stream; excludes headers, TLS/IP overhead and lower-layer buffering",
        "change_analysis": False,
        "automatic_retry_policy": plan["automatic_retry_policy"],
        "checkpoint_integrity": plan["checkpoint_integrity"],
        "range_checkpoint_state": str((checkpoint_root / "state.json").relative_to(ROOT)),
        "outputs": [],
    }
    staging_manifest = staging_dir / "mask_coverage_manifest.json"
    final_manifest = final_dir / "mask_coverage_manifest.json"
    summary["manifest"] = str(final_manifest.relative_to(ROOT))
    safe_project_path(ROOT, staging_dir)
    fd, tmp_name = tempfile.mkstemp(prefix=".manifest.", suffix=".tmp", dir=staging_dir)
    with os.fdopen(fd, "w") as stream:
        json.dump(summary, stream, indent=2)
        stream.write("\n")
        stream.flush()
        os.fsync(stream.fileno())
    os.replace(tmp_name, staging_manifest)
    _fsync_directory(staging_dir, ROOT)
    with tracked_stage(checkpoint, "publish_atomic_directory", {"task_id": TASK_ID}):
        _publish_staging_directory(staging_dir, final_dir, summary, ROOT)
    checkpoint.record_stage("outputs_published", "complete", context={"task_id": TASK_ID},
                            details={"manifest": str(final_manifest.relative_to(ROOT))})
    return summary


def _validate_manifest_outputs(manifest: dict[str, Any], root: Path, *, output_dir: Path | None = None) -> None:
    """Fail closed if any final raster is missing, altered, or unreadable."""
    import rasterio
    for record in manifest.get("output_files", []):
        candidate = (output_dir / Path(record["path"]).name) if output_dir else (root / record["path"])
        path = safe_project_path(root, candidate)
        if not path.is_file() or path.stat().st_size != int(record["bytes"]):
            raise RuntimeError(f"final mask output missing/size mismatch: {record['path']}")
        if hashlib.sha256(path.read_bytes()).hexdigest() != record["sha256"]:
            raise RuntimeError(f"final mask output checksum mismatch: {record['path']}")
        with rasterio.open(path) as ds:
            if ds.count != 1 or ds.crs is None:
                raise RuntimeError(f"final mask output has invalid raster metadata: {record['path']}")


def _publish_staging_directory(staging_dir: Path, final_dir: Path,
                               manifest: dict[str, Any], root: Path) -> None:
    """Validate the whole staged product, then atomically publish the directory."""
    staging_dir = safe_project_path(root, staging_dir)
    final_dir = safe_project_path(root, final_dir)
    if final_dir.exists():
        raise RuntimeError("refusing to replace an existing final product directory")
    if not (staging_dir / "mask_coverage_manifest.json").is_file():
        raise RuntimeError("staged product has no manifest")
    _validate_manifest_outputs(manifest, root, output_dir=staging_dir)
    safe_project_path(root, staging_dir / "mask_coverage_manifest.json")
    os.replace(staging_dir, final_dir)
    _fsync_directory(final_dir.parent)
    _validate_manifest_outputs(manifest, root)


def _write_mask_atomic(path: Path, array: np.ndarray, *, crs: str, transform: Any,
                       project_root: Path | None = None) -> dict[str, Any]:
    """Write, reopen/verify, and atomically publish one final GeoTIFF."""
    import rasterio
    root = project_root or path.parent
    path = safe_project_path(root, path)
    safe_project_path(root, path.parent)
    fd, tmp_name = tempfile.mkstemp(prefix=f".{path.stem}.", suffix=".tmp.tif", dir=path.parent)
    os.close(fd)
    temp_path = Path(tmp_name)
    try:
        with stage_deadline("write_validate_rename_tiff"):
            with rasterio.open(temp_path, "w", driver="GTiff", height=array.shape[0], width=array.shape[1],
                               count=1, dtype=array.dtype, crs=crs, transform=transform,
                               compress="deflate") as dst:
                dst.write(array, 1)
            with rasterio.open(temp_path) as check:
                if (check.shape != array.shape or check.crs.to_string() != crs
                        or not np.array_equal(check.read(1), array)):
                    raise IOError("temporary GeoTIFF integrity validation failed")
            safe_project_path(root, temp_path)
            safe_project_path(root, path)
            os.replace(temp_path, path)
            _fsync_directory(path.parent, root)
        payload = path.read_bytes()
        return {"bytes": len(payload), "sha256": hashlib.sha256(payload).hexdigest()}
    finally:
        try:
            temp_path.unlink()
        except FileNotFoundError:
            pass


def _fsync_directory(path: Path, project_root: Path | None = None) -> None:
    safe_project_path(project_root or path, path)
    fd = os.open(path, os.O_RDONLY | getattr(os, "O_DIRECTORY", 0))
    try:
        os.fsync(fd)
    finally:
        os.close(fd)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--execute", action="store_true", help="perform bounded mask-only reads; default is dry-run")
    args = parser.parse_args()
    print(json.dumps(run(args.execute), indent=2))


if __name__ == "__main__":
    main()

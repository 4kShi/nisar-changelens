"""Local-only checks for the fail-closed, mask-only retrieval entry point."""
import sys
import time
from types import SimpleNamespace

import numpy as np
import pytest

from pipeline import extract_mask_pair as extractor
from pipeline.http_range_budget import HTTPRangeByteBudget
from pipeline.http_range_budget import UnsafeProjectPath


def test_dry_run_is_explicitly_inert_and_mask_only():
    plan = extractor.run(execute=False)
    assert plan["mode"] == "MASK_ONLY"
    assert plan["shared_response_body_budget_bytes"] == 250_000_000
    assert plan["concurrency"] == 1
    assert plan["change_analysis"] is False
    assert len(plan["granules"]) == 2
    assert all(g["dataset"].endswith("/mask") for g in plan["granules"])
    assert all("HHHH" not in g["dataset"] for g in plan["granules"])


def test_budget_hook_is_installed_before_h5py_file_open(monkeypatch):
    events = []

    class FakeH5py:
        @staticmethod
        def File(stream, mode):
            events.append(("h5py", mode))
            return object()

    class Cache:
        fetcher = lambda self, start, end: b""

    class Target:
        kwargs = {}
        fs = SimpleNamespace(encode_url=lambda url: url)
        url = "local"
        session = object()
        loop = object()
        def __init__(self):
            self.cache = Cache()
            self._fetch_range = self.cache.fetcher

    proxy = Target()
    preflight_calls = []

    class FakeFS:
        def info(self, url, *, timeout):
            preflight_calls.append(("info", url, timeout))
            return {"size": 4}

        def open(self, url, *, mode, size, block_size, cache_type, timeout):
            preflight_calls.append(("open", url, mode, size, block_size, cache_type, timeout))
            return proxy

    fs = FakeFS()
    fake_store = SimpleNamespace(get_fsspec_session=lambda: fs)
    granule_ur = "NISAR_TEST_GRANULE"
    fake_granule = SimpleNamespace(data_links=lambda access: [f"https://example.test/{granule_ur}.h5"])
    monkeypatch.setitem(sys.modules, "h5py", FakeH5py)
    def install(stream, budget, **options):
        events.append(("budget", budget))
        assert options["context"] == {"granule": granule_ur, "variable": "mask"}
        assert options["timeout_seconds"] == 30.0
        stream._fetch_range = lambda start, end: b"guarded"
        stream.cache.fetcher = stream._fetch_range

    monkeypatch.setattr(extractor, "install_fsspec_httpfile_budget", install)

    # Supply a stub for the authenticated fsspec session without network.
    fake_earthaccess = SimpleNamespace(__store__=fake_store)
    handle, stream = extractor._open_guarded_hdf5(
        fake_earthaccess, fake_granule, HTTPRangeByteBudget(limit_bytes=4),
        context={"granule": granule_ur, "variable": "mask"}
    )
    assert stream is proxy
    assert handle is not None
    assert events[0][0] == "budget"
    assert events[1] == ("h5py", "r")
    assert preflight_calls[0] == ("info", f"https://example.test/{granule_ur}.h5", 30)
    assert preflight_calls[1] == ("open", f"https://example.test/{granule_ur}.h5", "rb", 4, 8192, "none", 30)
    assert proxy.cache.fetcher is proxy._fetch_range


def test_authenticated_fsspec_preflight_stalled_head_is_cancelled_by_numeric_timeout(monkeypatch):
    import asyncio
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
    store = SimpleNamespace(get_fsspec_session=lambda: fs)
    granule_ur = "NISAR_TEST_GRANULE"
    granule = SimpleNamespace(data_links=lambda access: [f"https://example.test/{granule_ur}.h5"])
    monkeypatch.setattr(extractor, "FSSPEC_OPEN_TIMEOUT_SECONDS", 0.03)
    with pytest.raises(FSTimeoutError):
        extractor._open_guarded_hdf5(
            SimpleNamespace(__store__=store), granule,
            HTTPRangeByteBudget(limit_bytes=10),
            context={"granule": granule_ur, "variable": "mask"},
        )
    assert cancelled.wait(1)


def test_stage_deadline_raises_locally():
    with pytest.raises(extractor.StageTimeout, match="deadline"):
        with extractor.stage_deadline("fixture", seconds=0.02):
            time.sleep(0.1)


def test_documented_mask_predicate_and_common_valid_counts():
    # Synthetic unit fixture only; not an observation or science output.
    a = np.array([[0, 1, 2], [255, 4, 0]], dtype=np.uint8)
    b = np.array([[3, 1, 255], [1, 0, 0]], dtype=np.uint8)
    va, vb = extractor.valid_mask_pixels(a), extractor.valid_mask_pixels(b)
    assert va.tolist() == [[False, True, True], [False, True, False]]
    assert int((va & vb).sum()) == 1


def test_missing_mask_variable_fails_closed():
    with pytest.raises(RuntimeError, match="required mask dataset missing"):
        extractor._require_mask_dataset({}, "/science/LSAR/GCOV/grids/frequencyA/mask")


def test_incompatible_grid_metadata_is_rejected():
    grid = {
        "projection": "32648", "full_grid_shape": [100, 100],
        "shape": [10, 10], "window_row_col": [1, 11, 2, 12],
        "pixel_spacing_m": [10, 10],
        "window_coordinates_center_m": {"x_first": 1.0, "x_last": 91.0,
                                         "y_first": 2.0, "y_last": -88.0},
    }
    shifted = {**grid, "window_coordinates_center_m": {**grid["window_coordinates_center_m"], "x_first": 11.0}}
    assert extractor.grids_compatible(grid, grid)
    assert not extractor.grids_compatible(grid, shifted)


def test_atomic_mask_writer_and_manifest_checksum_validation(tmp_path):
    import rasterio
    from rasterio.transform import from_origin

    # Synthetic unit fixture only; never presented as NISAR.
    arr = np.array([[0, 1], [2, 255]], dtype=np.uint8)
    target = tmp_path / "mask.tif"
    record = extractor._write_mask_atomic(target, arr, crs="EPSG:32648", transform=from_origin(500000, 1200000, 10, 10))
    record["path"] = "mask.tif"
    assert target.exists()
    assert not list(tmp_path.glob("*.tmp.tif"))
    extractor._validate_manifest_outputs({"output_files": [record]}, tmp_path)
    payload = bytearray(target.read_bytes())
    payload[-1] ^= 1
    target.write_bytes(payload)
    with pytest.raises(RuntimeError, match="checksum mismatch"):
        extractor._validate_manifest_outputs({"output_files": [record]}, tmp_path)


def test_staging_directory_publishes_only_after_manifest_and_all_outputs_validate(tmp_path):
    from rasterio.transform import from_origin

    staging = tmp_path / "product.staging"
    final = tmp_path / "product"
    staging.mkdir()
    arr = np.array([[1, 2], [3, 255]], dtype=np.uint8)
    output = staging / "mask.tif"
    record = extractor._write_mask_atomic(output, arr, crs="EPSG:32648", transform=from_origin(500000, 1200000, 10, 10))
    record["path"] = "product/mask.tif"
    manifest = {"output_files": [record]}
    (staging / "mask_coverage_manifest.json").write_text('{"synthetic_fixture": true}\n')
    extractor._publish_staging_directory(staging, final, manifest, tmp_path)
    assert final.is_dir() and not staging.exists()
    extractor._validate_manifest_outputs(manifest, tmp_path)


def test_staging_directory_remains_unpublished_if_output_fails_validation(tmp_path):
    staging = tmp_path / "product.staging"
    final = tmp_path / "product"
    staging.mkdir()
    (staging / "mask_coverage_manifest.json").write_text('{}\n')
    manifest = {"output_files": [{"path": "product/missing.tif", "bytes": 1, "sha256": "bad"}]}
    with pytest.raises(RuntimeError, match="missing/size mismatch"):
        extractor._publish_staging_directory(staging, final, manifest, tmp_path)
    assert staging.is_dir()
    assert not final.exists()


@pytest.mark.parametrize("symlink_name", ["product.staging", "product"])
def test_staging_and_final_directory_symlinks_are_rejected(tmp_path, symlink_name):
    target = tmp_path / "outside"
    target.mkdir()
    (tmp_path / symlink_name).symlink_to(target, target_is_directory=True)
    staging = tmp_path / "product.staging"
    final = tmp_path / "product"
    with pytest.raises(UnsafeProjectPath, match="symlink"):
        extractor._publish_staging_directory(staging, final, {"output_files": []}, tmp_path)

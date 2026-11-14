"""Regression tests for dynamic X/Y pixel posting and grid gating in pipeline/gates.py."""
from __future__ import annotations

from pathlib import Path

import h5py
import numpy as np

from pipeline.gates import evaluate_gates


def _write_synthetic_gcov_h5(
    path: Path,
    *,
    x_coords: np.ndarray | None,
    y_coords: np.ndarray | None,
    projection: int | None = 32648,
    track: int = 148,
    frame: int = 83,
    crid: str = "P05036",
) -> None:
    """Create a minimal HDF5 structure matching NISAR L2 GCOV metadata paths for unit tests."""
    with h5py.File(path, "w") as h5:
        ident = h5.create_group("science/LSAR/identification")
        ident.create_dataset("productType", data=b"GCOV")
        ident.create_dataset("compositeReleaseId", data=crid.encode())
        ident.create_dataset("productVersion", data=b"1.0.20")
        ident.create_dataset("trackNumber", data=np.uint32(track))
        ident.create_dataset("frameNumber", data=np.uint32(frame))
        ident.create_dataset("lookDirection", data=b"Left")
        ident.create_dataset("orbitPassDirection", data=b"Descending")

        freq_a = h5.create_group("science/LSAR/GCOV/grids/frequencyA")
        if projection is not None:
            freq_a.create_dataset("projection", data=np.uint32(projection))
        if x_coords is not None:
            freq_a.create_dataset("xCoordinates", data=x_coords.astype(np.float64))
        if y_coords is not None:
            freq_a.create_dataset("yCoordinates", data=y_coords.astype(np.float64))

        nx = len(x_coords) if x_coords is not None and len(x_coords) > 0 else 2
        ny = len(y_coords) if y_coords is not None and len(y_coords) > 0 else 2
        hhhh = freq_a.create_dataset("HHHH", data=np.full((ny, nx), 0.15, dtype=np.float32))
        hhhh.attrs["units"] = b"1"
        freq_a.create_dataset("mask", data=np.ones((ny, nx), dtype=np.uint8))
        freq_a.create_dataset("numberOfLooks", data=np.full((ny, nx), 5.0, dtype=np.float32))


def _gate_by_id(report: dict, rule_id: str) -> dict:
    return next(c for c in report["checks"] if c["rule_id"] == rule_id)


def test_gates_derive_10m_square_posting_dynamically(tmp_path: Path) -> None:
    f1 = tmp_path / "before_10m.h5"
    f2 = tmp_path / "after_10m.h5"
    x = np.arange(494530.0, 494570.0, 10.0)
    y = np.arange(1166000.0, 1165960.0, -10.0)
    _write_synthetic_gcov_h5(f1, x_coords=x, y_coords=y)
    _write_synthetic_gcov_h5(f2, x_coords=x, y_coords=y)

    meta = {"maturity": "VALIDATED"}
    rep = evaluate_gates(f1, f2, before_catalog_metadata=meta, after_catalog_metadata=meta)
    assert rep["status"] == "pass"

    g06 = _gate_by_id(rep, "G06_crs_grid_alignment")
    g10 = _gate_by_id(rep, "G10_effective_resolution")
    assert g06["status"] == "pass"
    assert g06["observed_values"]["pixel_spacing_x_m"] == 10.0
    assert g06["observed_values"]["pixel_spacing_y_m"] == 10.0
    assert g06["observed_values"]["is_square_pixels"] is True
    assert "10 m posting" in g06["reason"]

    assert g10["status"] == "pass"
    assert g10["observed_values"]["pixel_posting_m"] == 10.0
    assert g10["observed_values"]["pixel_posting_x_m"] == 10.0
    assert g10["observed_values"]["pixel_posting_y_m"] == 10.0
    assert "10 m posting" in g10["reason"]
    assert "20m" not in g06["reason"] and "20m" not in g10["reason"]


def test_gates_support_matching_non_square_pixels_and_reject_mismatched_spacing(tmp_path: Path) -> None:
    f1 = tmp_path / "before_10x20.h5"
    f2 = tmp_path / "after_10x20.h5"
    f3 = tmp_path / "after_10x10.h5"
    x = np.arange(494530.0, 494570.0, 10.0)
    y_20 = np.arange(1166000.0, 1165920.0, -20.0)
    y_10 = np.arange(1166000.0, 1165960.0, -10.0)
    _write_synthetic_gcov_h5(f1, x_coords=x, y_coords=y_20)
    _write_synthetic_gcov_h5(f2, x_coords=x, y_coords=y_20)
    _write_synthetic_gcov_h5(f3, x_coords=x, y_coords=y_10)

    meta = {"maturity": "VALIDATED"}
    rep_rect = evaluate_gates(f1, f2, before_catalog_metadata=meta, after_catalog_metadata=meta)
    assert rep_rect["status"] == "pass"
    g06 = _gate_by_id(rep_rect, "G06_crs_grid_alignment")
    g10 = _gate_by_id(rep_rect, "G10_effective_resolution")
    assert g06["observed_values"]["is_square_pixels"] is False
    assert g06["observed_values"]["pixel_spacing_x_m"] == 10.0
    assert g06["observed_values"]["pixel_spacing_y_m"] == 20.0
    assert "10 m × 20 m posting" in g06["reason"]
    assert g10["observed_values"]["pixel_posting_m"] == [10.0, 20.0]

    rep_mismatch = evaluate_gates(f1, f3, before_catalog_metadata=meta, after_catalog_metadata=meta)
    assert rep_mismatch["status"] == "fail"
    assert _gate_by_id(rep_mismatch, "G06_crs_grid_alignment")["status"] == "fail"


def test_gates_fail_on_half_pixel_offset(tmp_path: Path) -> None:
    f1 = tmp_path / "before.h5"
    f2 = tmp_path / "after_halfpx.h5"
    x1 = np.arange(494530.0, 494570.0, 10.0)
    x2 = x1 + 5.0
    y = np.arange(1166000.0, 1165960.0, -10.0)
    _write_synthetic_gcov_h5(f1, x_coords=x1, y_coords=y)
    _write_synthetic_gcov_h5(f2, x_coords=x2, y_coords=y)

    meta = {"maturity": "VALIDATED"}
    rep = evaluate_gates(f1, f2, before_catalog_metadata=meta, after_catalog_metadata=meta)
    assert rep["status"] == "fail"
    g06 = _gate_by_id(rep, "G06_crs_grid_alignment")
    assert g06["status"] == "fail"
    assert abs(g06["observed_values"]["grid_phase_offset_x"] - 5.0) < 1e-6


def test_gates_fail_cleanly_when_resolution_metadata_missing_or_degenerate(tmp_path: Path) -> None:
    f1 = tmp_path / "single_coord.h5"
    f2 = tmp_path / "zero_step.h5"
    f3 = tmp_path / "missing_proj.h5"
    _write_synthetic_gcov_h5(f1, x_coords=np.array([494530.0]), y_coords=np.array([1166000.0]))
    _write_synthetic_gcov_h5(f2, x_coords=np.array([494530.0, 494530.0]), y_coords=np.array([1166000.0, 1165990.0]))
    _write_synthetic_gcov_h5(
        f3,
        x_coords=np.arange(494530.0, 494570.0, 10.0),
        y_coords=np.arange(1166000.0, 1165960.0, -10.0),
        projection=None,
    )

    meta = {"maturity": "VALIDATED"}
    for pair in ((f1, f2), (f2, f3)):
        rep = evaluate_gates(pair[0], pair[1], before_catalog_metadata=meta, after_catalog_metadata=meta)
        assert rep["status"] == "fail"
        assert _gate_by_id(rep, "G06_crs_grid_alignment")["status"] == "fail"
        assert _gate_by_id(rep, "G10_effective_resolution")["status"] == "fail"

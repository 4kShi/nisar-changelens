"""Unit and integration tests for the NISAR ChangeLens scientific pipeline."""
import math
from pathlib import Path
import numpy as np
from pipeline.extract_mask_pair import _plan


def test_db_conversion_and_log_ratio():
    """Verify calibrated dB formula: P_dB = 10 * log10(P) and signed ΔdB."""
    p_before = np.array([1.0, 0.1, 0.01, 10.0, 0.0, -1.0, np.nan], dtype=float)
    p_after = np.array([0.1, 0.1, 0.1, 1.0, 1.0, 1.0, 1.0], dtype=float)

    # Exclude non-positive and non-finite
    valid = (p_before > 0) & np.isfinite(p_before) & (p_after > 0) & np.isfinite(p_after)
    assert np.count_nonzero(valid) == 4

    db_before = 10.0 * np.log10(p_before[valid])
    db_after = 10.0 * np.log10(p_after[valid])
    delta_db = db_after - db_before

    # P_before=1.0 (0 dB), P_after=0.1 (-10 dB) -> ΔdB = -10 dB
    assert math.isclose(delta_db[0], -10.0, rel_tol=1e-5)
    # P_before=0.1 (-10 dB), P_after=0.1 (-10 dB) -> ΔdB = 0 dB
    assert math.isclose(delta_db[1], 0.0, abs_tol=1e-5)
    # P_before=0.01 (-20 dB), P_after=0.1 (-10 dB) -> ΔdB = +10 dB
    assert math.isclose(delta_db[2], 10.0, rel_tol=1e-5)
    # P_before=10.0 (+10 dB), P_after=1.0 (0 dB) -> ΔdB = -10 dB
    assert math.isclose(delta_db[3], -10.0, rel_tol=1e-5)


def test_public_data_fails_closed_without_verified_pair():
    """Only basemap boundaries are public while no pair outputs are verified."""
    plan = _plan()
    assert plan["data_availability_status"].startswith("UNAVAILABLE")
    assert plan["change_analysis"] is False
    assert plan["sensitive_backscatter_datasets_read"] is False
    public_data = Path("frontend/public/data/v1")
    assert (public_data / "mekong_boundary.geojson").is_file()
    assert (public_data / "mekong_provinces.geojson").is_file()
    assert not (public_data / "catalog.json").exists()
    assert not list(public_data.rglob("*.tif"))
    assert not list(public_data.rglob("manifest.json"))

"""Unit and integrity tests for pipeline/extract_verified_pair.py."""
from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import pytest

from pipeline import extract_verified_pair as verified_extractor


def test_decode_scalar_handles_numpy_generics_and_bytes():
    assert verified_extractor._decode_scalar(np.uint32(148)) == 148
    assert isinstance(verified_extractor._decode_scalar(np.uint32(148)), int)
    assert verified_extractor._decode_scalar(b"GCOV") == "GCOV"
    assert verified_extractor._decode_scalar(np.array([b"P05036"])) == "P05036"
    assert verified_extractor._decode_scalar(None, "fallback") == "fallback"


def test_dry_run_validates_mask_manifest_and_deducts_shared_budget():
    res = verified_extractor.run_verified_extraction(execute=False)
    assert res["mode"] == "VERIFIED_MASK_THEN_BACKSCATTER"
    assert res["status"] == "DRY_RUN"
    assert res["shared_total_limit_bytes"] == 250_000_000
    assert res["mask_bytes_used"] == 1_149_959
    assert res["remaining_limit_for_backscatter_bytes"] == 250_000_000 - 1_149_959
    assert res["common_mask_valid_fraction"] > 0.99


def test_verified_pair_manifest_and_checksums_pass_integrity_verification():
    manifest_path = verified_extractor.FINAL_PAIR_DIR / "verified_pair_manifest.json"
    assert manifest_path.exists()
    manifest = json.loads(manifest_path.read_text())
    verified_extractor._verify_outputs(manifest, verified_extractor.FINAL_PAIR_DIR)
    assert manifest["status"] == "VERIFIED_PAIR_COMPLETE"
    assert manifest["combined_total_response_body_bytes"] <= 250_000_000
    assert manifest["stats"]["valid_pixels"] == 1_207_740
    assert manifest["stats"]["common_valid_fraction"] > 0.999


def test_verify_outputs_fails_closed_on_checksum_mismatch(tmp_path: Path):
    dummy = tmp_path / "dummy.tif"
    dummy.write_bytes(b"real-bytes")
    bad_manifest = {
        "files": [
            {
                "name": "dummy.tif",
                "bytes": 10,
                "sha256": "0" * 64,
            }
        ]
    }
    with pytest.raises(RuntimeError, match="sha256 mismatch"):
        verified_extractor._verify_outputs(bad_manifest, tmp_path)

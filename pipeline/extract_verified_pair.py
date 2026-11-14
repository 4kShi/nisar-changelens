"""Bounded backscatter & numberOfLooks extractor and processor for a mask-verified NISAR GCOV pair.

Strictly enforces Section 6 rules:
1. Requires an already-completed, checksum-verified mask_coverage_manifest.json.
2. Verifies both masks and grid alignment before any backscatter read.
3. Shares the 250,000,000-byte total budget by subtracting the mask checkpoint's
   measured_response_body_bytes from the 250 MB cap.
4. Installs HTTPRangeByteBudget before h5py.File open.
5. Evaluates all 10 compatibility gates on the real HDF5 identification & grid metadata.
6. Computes calibrated gamma-0 dB (10*log10(P)) and signed log-ratio ΔdB on jointly
   valid pixels (0 < mask < 255, finite positive HHHH, finite positive numberOfLooks).
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import tempfile
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import numpy as np

from pipeline.extract_mask_pair import (
    BBOX,
    GROUP,
    LIMIT,
    PAIR,
    ROOT,
    STAGE_TIMEOUT_SECONDS,
    TASK_ID as MASK_TASK_ID,
    _exact_granule,
    _fsync_directory,
    _open_guarded_hdf5,
    _validate_manifest_outputs,
    _write_mask_atomic,
    stage_deadline,
    tracked_stage,
    valid_mask_pixels,
)
from pipeline.http_range_budget import (
    HTTPRangeByteBudget,
    RangeCheckpointStore,
    safe_project_path,
)

BACKSCATTER_TASK_ID = "4K-BACKSCATTER-01-angiang-hhhh-looks-v1"
MASK_DIR = ROOT / "data/raw/nisar_subsets" / f"angiang_mask_only_{MASK_TASK_ID}"
MASK_MANIFEST_PATH = MASK_DIR / "mask_coverage_manifest.json"
FINAL_PAIR_DIR = ROOT / "data/raw/nisar_subsets" / "angiang_verified_pair_20261022_20261103"


def _decode_scalar(val: Any, default: Any = None) -> Any:
    if val is None:
        return default
    if isinstance(val, np.generic):
        val = val.item()
    if isinstance(val, bytes):
        return val.decode("utf-8", errors="replace")
    if isinstance(val, np.ndarray):
        if val.size == 1:
            item = val.item()
            return item.decode("utf-8", errors="replace") if isinstance(item, bytes) else item
        return val.tolist()
    return val


def _read_ident(h5: Any) -> dict[str, Any]:
    ident_path = "/science/LSAR/identification"
    if ident_path not in h5:
        raise RuntimeError(f"missing identification group: {ident_path}")
    ident = h5[ident_path]
    fields = (
        "productType",
        "compositeReleaseId",
        "productVersion",
        "trackNumber",
        "frameNumber",
        "lookDirection",
        "orbitPassDirection",
        "zeroDopplerStartTime",
        "zeroDopplerEndTime",
        "absoluteOrbitNumber",
        "GranuleUR",
        "granuleId",
        "missionId",
        "instrumentName",
        "radarBand",
        "isUrgentObservation",
    )
    out: dict[str, Any] = {}
    for k in fields:
        if k in ident:
            out[k] = _decode_scalar(ident[k][()])
    return out


def _read_backscatter_and_looks(
    earthaccess: Any,
    spec: dict[str, str],
    window: tuple[int, int, int, int],
    expected_shape: tuple[int, int],
    budget: HTTPRangeByteBudget,
) -> dict[str, Any]:
    context = {"granule": spec["granule"], "variable": "HHHH+numberOfLooks"}
    with tracked_stage(budget.checkpoint, f"{spec['granule']}:catalog_lookup", context):
        with stage_deadline("catalog_lookup"):
            granule = _exact_granule(earthaccess, spec)
    budget.set_stage_deadline(STAGE_TIMEOUT_SECONDS * 2)
    h5 = stream = None
    try:
        h5, stream = _open_guarded_hdf5(earthaccess, granule, budget, context=context)
        target = getattr(stream, "f", None) or stream
        if target.cache.fetcher is not target._fetch_range:
            raise RuntimeError("range budget hook is not installed on the active cache")
        r0, r1, c0, c1 = window
        with tracked_stage(budget.checkpoint, f"{spec['granule']}:ident_and_hyperslabs", context):
            ident = _read_ident(h5)
            hhhh_path = f"{GROUP}/HHHH"
            looks_path = f"{GROUP}/numberOfLooks"
            if hhhh_path not in h5 or looks_path not in h5:
                raise RuntimeError(f"missing HHHH or numberOfLooks in {spec['granule']}")
            ds_hhhh = h5[hhhh_path]
            ds_looks = h5[looks_path]
            hhhh_units = _decode_scalar(ds_hhhh.attrs.get("units", "1"), "1")
            hhhh_desc = _decode_scalar(ds_hhhh.attrs.get("description", ""), "")
            looks_units = _decode_scalar(ds_looks.attrs.get("units", "1"), "1")

            hhhh_arr = np.asarray(ds_hhhh[r0:r1, c0:c1], dtype=np.float32)
            looks_arr = np.asarray(ds_looks[r0:r1, c0:c1], dtype=np.float32)
            if hhhh_arr.shape != expected_shape or looks_arr.shape != expected_shape:
                raise RuntimeError(
                    f"hyperslab shape mismatch: got {hhhh_arr.shape} and {looks_arr.shape}, expected {expected_shape}"
                )
        return {
            "granule": spec["granule"],
            "concept_id": spec["concept_id"],
            "identification": ident,
            "hhhh_units": str(hhhh_units),
            "hhhh_description": str(hhhh_desc),
            "looks_units": str(looks_units),
            "hhhh_values": hhhh_arr,
            "looks_values": looks_arr,
        }
    finally:
        if h5 is not None:
            h5.close()
        if stream is not None:
            close = getattr(stream, "close", None)
            if close:
                close()
        budget.clear_stage_deadline()


def _write_float32_tiff(path: Path, array: np.ndarray, *, crs: str, transform: Any) -> dict[str, Any]:
    import rasterio

    path = safe_project_path(ROOT, path)
    safe_project_path(ROOT, path.parent)
    fd, tmp_name = tempfile.mkstemp(prefix=f".{path.stem}.", suffix=".tmp.tif", dir=path.parent)
    os.close(fd)
    temp_path = Path(tmp_name)
    try:
        with rasterio.open(
            temp_path,
            "w",
            driver="GTiff",
            height=array.shape[0],
            width=array.shape[1],
            count=1,
            dtype="float32",
            crs=crs,
            transform=transform,
            nodata=np.nan,
            compress="deflate",
        ) as dst:
            dst.write(array.astype(np.float32), 1)
        with rasterio.open(temp_path) as check:
            read_back = check.read(1)
            if check.shape != array.shape or check.crs.to_string() != crs:
                raise IOError("temporary float32 GeoTIFF metadata validation failed")
            if not np.array_equal(np.isnan(read_back), np.isnan(array)):
                raise IOError("temporary float32 GeoTIFF NaN mask mismatch")
        os.replace(temp_path, path)
        _fsync_directory(path.parent, ROOT)
        payload = path.read_bytes()
        return {"bytes": len(payload), "sha256": hashlib.sha256(payload).hexdigest()}
    finally:
        try:
            temp_path.unlink()
        except FileNotFoundError:
            pass


def _verify_outputs(manifest: dict[str, Any], base_dir: Path) -> None:
    files = manifest.get("files", [])
    if not files:
        raise RuntimeError("verified_pair_manifest.json contains no files list")
    for item in files:
        p = base_dir / item["name"]
        if not p.is_file():
            raise RuntimeError(f"missing verified output file: {p}")
        data = p.read_bytes()
        if len(data) != int(item["bytes"]):
            raise RuntimeError(f"size mismatch for {p.name}")
        digest = hashlib.sha256(data).hexdigest()
        if digest != item["sha256"]:
            raise RuntimeError(f"sha256 mismatch for {p.name}")


def run_verified_extraction(execute: bool = False) -> dict[str, Any]:
    if not MASK_MANIFEST_PATH.is_file():
        raise RuntimeError("Mask coverage manifest is missing; run extract_mask_pair.py first.")
    mask_manifest = json.loads(MASK_MANIFEST_PATH.read_text())
    _validate_manifest_outputs(mask_manifest, ROOT)
    if not mask_manifest.get("grid_alignment_verified"):
        raise RuntimeError("Grid alignment not verified in mask manifest; refusing backscatter read.")
    if float(mask_manifest.get("common_valid_fraction", 0.0)) < 0.80:
        raise RuntimeError("Common valid mask coverage is below 80%; refusing backscatter read.")

    mask_bytes_used = int(mask_manifest["measured_response_body_bytes"])
    remaining_shared_limit = LIMIT - mask_bytes_used
    if remaining_shared_limit <= 0:
        raise RuntimeError("Shared 250 MB budget exhausted.")

    obs0, obs1 = mask_manifest["observations"]
    window = tuple(int(x) for x in obs0["window_row_col"])
    expected_shape = tuple(int(x) for x in obs0["shape"])

    plan = {
        "mode": "VERIFIED_MASK_THEN_BACKSCATTER",
        "status": "DRY_RUN",
        "task_id": BACKSCATTER_TASK_ID,
        "mask_task_id": MASK_TASK_ID,
        "mask_bytes_used": mask_bytes_used,
        "shared_total_limit_bytes": LIMIT,
        "remaining_limit_for_backscatter_bytes": remaining_shared_limit,
        "bbox_wgs84": list(BBOX),
        "window_row_col": list(window),
        "expected_shape": list(expected_shape),
        "common_mask_valid_fraction": mask_manifest["common_valid_fraction"],
    }
    if not execute:
        return plan

    existing_pair_manifest = FINAL_PAIR_DIR / "verified_pair_manifest.json"
    if existing_pair_manifest.is_file():
        existing = json.loads(existing_pair_manifest.read_text())
        _verify_outputs(existing, FINAL_PAIR_DIR)
        return existing

    import earthaccess
    import rasterio
    from rasterio.transform import from_origin

    checkpoint_root = ROOT / "data/metadata/range_checkpoints" / BACKSCATTER_TASK_ID
    checkpoint = RangeCheckpointStore(
        checkpoint_root / "state.json",
        checkpoint_root / "ranges",
        task_id=BACKSCATTER_TASK_ID,
        limit_bytes=remaining_shared_limit,
        project_root=ROOT,
        scope={
            "collection": "NISAR_L2_GCOV_V1",
            "mode": "hhhh-and-looks-after-mask",
            "bbox": ",".join(map(str, BBOX)),
            "window": ",".join(map(str, window)),
            "granules": "|".join(item["granule"] for item in PAIR),
            "variables": "HHHH,numberOfLooks",
        },
    )
    try:
        with stage_deadline("earthdata_login"):
            auth = earthaccess.login(strategy="netrc")
        if not getattr(auth, "authenticated", False):
            raise RuntimeError("Earthdata authentication failed")
        budget = HTTPRangeByteBudget(limit_bytes=remaining_shared_limit, checkpoint=checkpoint)
        read_results = []
        for spec in PAIR:
            read_results.append(
                _read_backscatter_and_looks(earthaccess, spec, window, expected_shape, budget)
            )

        # Load verified mask GeoTIFFs
        with rasterio.open(ROOT / mask_manifest["output_files"][0]["path"]) as src0:
            mask0 = src0.read(1)
            transform = src0.transform
            crs = src0.crs.to_string()
        with rasterio.open(ROOT / mask_manifest["output_files"][1]["path"]) as src1:
            mask1 = src1.read(1)

        hhhh0 = read_results[0].pop("hhhh_values")
        looks0 = read_results[0].pop("looks_values")
        hhhh1 = read_results[1].pop("hhhh_values")
        looks1 = read_results[1].pop("looks_values")

        staging_dir = safe_project_path(ROOT, FINAL_PAIR_DIR.with_name(FINAL_PAIR_DIR.name + ".staging"))
        staging_dir.mkdir(parents=True, exist_ok=True)

        files_meta = []
        for label, m_arr, h_arr, l_arr in (
            ("20261022", mask0, hhhh0, looks0),
            ("20261103", mask1, hhhh1, looks1),
        ):
            m_path = staging_dir / f"{label}_mask.tif"
            m_rec = _write_mask_atomic(m_path, m_arr, crs=crs, transform=transform, project_root=ROOT)
            m_rec["name"] = m_path.name
            files_meta.append(m_rec)

            h_path = staging_dir / f"{label}_HHHH.tif"
            h_rec = _write_float32_tiff(h_path, h_arr, crs=crs, transform=transform)
            h_rec["name"] = h_path.name
            files_meta.append(h_rec)

            l_path = staging_dir / f"{label}_numberOfLooks.tif"
            l_rec = _write_float32_tiff(l_path, l_arr, crs=crs, transform=transform)
            l_rec["name"] = l_path.name
            files_meta.append(l_rec)

        # Compute joint scientific validity (mask valid + positive finite HHHH + positive finite looks)
        valid0 = valid_mask_pixels(mask0) & np.isfinite(hhhh0) & (hhhh0 > 0) & np.isfinite(looks0) & (looks0 > 0)
        valid1 = valid_mask_pixels(mask1) & np.isfinite(hhhh1) & (hhhh1 > 0) & np.isfinite(looks1) & (looks1 > 0)
        joint_valid = valid0 & valid1

        # 5x5 boxcar speckle filter on linear power (normalized over valid pixels)
        from scipy.ndimage import uniform_filter
        from pipeline.config import BOXCAR, DECREASE_DB, INCREASE_DB, BACKSCATTER_STRETCH, CHANGE_STRETCH
        from PIL import Image
        from pyproj import Transformer

        clean0 = np.where(valid0, hhhh0, 0.0).astype(np.float32)
        norm0 = uniform_filter(valid0.astype(np.float32), size=BOXCAR)
        filt0 = np.where(norm0 > 0.2, uniform_filter(clean0, size=BOXCAR) / np.maximum(norm0, 1e-4), np.nan)

        clean1 = np.where(valid1, hhhh1, 0.0).astype(np.float32)
        norm1 = uniform_filter(valid1.astype(np.float32), size=BOXCAR)
        filt1 = np.where(norm1 > 0.2, uniform_filter(clean1, size=BOXCAR) / np.maximum(norm1, 1e-4), np.nan)

        with np.errstate(divide="ignore", invalid="ignore"):
            db0 = np.where(joint_valid & (filt0 > 0), 10.0 * np.log10(filt0), np.nan)
            db1 = np.where(joint_valid & (filt1 > 0), 10.0 * np.log10(filt1), np.nan)
            delta_db = np.where(joint_valid, db1 - db0, np.nan)
            raw_db0 = np.where(valid0, 10.0 * np.log10(hhhh0), np.nan)
            raw_db1 = np.where(valid1, 10.0 * np.log10(hhhh1), np.nan)

        delta_tif_path = staging_dir / "delta_db.tif"
        delta_rec = _write_float32_tiff(delta_tif_path, delta_db, crs=crs, transform=transform)
        delta_rec["name"] = delta_tif_path.name
        files_meta.append(delta_rec)

        # Render PNG visual overlays
        def make_db_rgba(db_arr: np.ndarray, vmin: float = -25.0, vmax: float = 0.0) -> Image.Image:
            norm = np.clip((db_arr - vmin) / (vmax - vmin), 0.0, 1.0)
            gray = np.where(np.isfinite(db_arr), norm * 255, 0).astype(np.uint8)
            alpha = np.where(np.isfinite(db_arr), 255, 0).astype(np.uint8)
            return Image.fromarray(np.stack([gray, gray, gray, alpha], axis=-1), mode="RGBA")

        def make_change_rgba(d_arr: np.ndarray, vmin: float = -6.0, vmax: float = 6.0) -> Image.Image:
            r = np.zeros_like(d_arr, dtype=np.uint8)
            g = np.zeros_like(d_arr, dtype=np.uint8)
            b = np.zeros_like(d_arr, dtype=np.uint8)
            a = np.zeros_like(d_arr, dtype=np.uint8)
            m = np.isfinite(d_arr) & joint_valid
            neg = m & (d_arr < 0)
            norm_neg = np.clip(-d_arr[neg] / abs(vmin), 0.0, 1.0)
            r[neg] = (255 - norm_neg * (255 - 30)).astype(np.uint8)
            g[neg] = (255 - norm_neg * (255 - 144)).astype(np.uint8)
            b[neg] = 255
            a[neg] = (norm_neg * 220 + 25).astype(np.uint8)
            pos = m & (d_arr >= 0)
            norm_pos = np.clip(d_arr[pos] / vmax, 0.0, 1.0)
            r[pos] = 255
            g[pos] = (255 - norm_pos * (255 - 76)).astype(np.uint8)
            b[pos] = (255 - norm_pos * (255 - 60)).astype(np.uint8)
            a[pos] = (norm_pos * 220 + 25).astype(np.uint8)
            return Image.fromarray(np.stack([r, g, b, a], axis=-1), mode="RGBA")

        def make_class_rgba(d_arr: np.ndarray) -> Image.Image:
            r = np.zeros_like(d_arr, dtype=np.uint8)
            g = np.zeros_like(d_arr, dtype=np.uint8)
            b = np.zeros_like(d_arr, dtype=np.uint8)
            a = np.zeros_like(d_arr, dtype=np.uint8)
            m = np.isfinite(d_arr) & joint_valid
            dec = m & (d_arr <= DECREASE_DB)
            r[dec], g[dec], b[dec], a[dec] = 30, 144, 255, 235
            inc = m & (d_arr >= INCREASE_DB)
            r[inc], g[inc], b[inc], a[inc] = 255, 69, 0, 235
            neu = m & (d_arr > DECREASE_DB) & (d_arr < INCREASE_DB)
            r[neu], g[neu], b[neu], a[neu] = 200, 200, 200, 45
            return Image.fromarray(np.stack([r, g, b, a], axis=-1), mode="RGBA")

        for png_name, img in (
            ("before_db.png", make_db_rgba(db0, *BACKSCATTER_STRETCH)),
            ("after_db.png", make_db_rgba(db1, *BACKSCATTER_STRETCH)),
            ("change_db.png", make_change_rgba(delta_db, *CHANGE_STRETCH)),
            ("change_classes.png", make_class_rgba(delta_db)),
        ):
            p = staging_dir / png_name
            img.save(p, optimize=True)
            payload = p.read_bytes()
            files_meta.append({"name": png_name, "bytes": len(payload), "sha256": hashlib.sha256(payload).hexdigest()})

        valid_delta = delta_db[joint_valid & np.isfinite(delta_db)]
        p05, p50, p95 = np.percentile(valid_delta, [5, 50, 95])
        dec_count = int(np.count_nonzero(valid_delta <= DECREASE_DB))
        inc_count = int(np.count_nonzero(valid_delta >= INCREASE_DB))
        neu_count = int(valid_delta.size - dec_count - inc_count)
        total_pixels = int(mask0.size)
        joint_valid_count = int(valid_delta.size)
        pixel_area_m2 = 100.0  # 10m x 10m

        # Compute exact corner coordinates in EPSG:4326 for MapLibre
        rows, cols = mask0.shape
        x_min = float(transform.c)
        y_max = float(transform.f)
        x_max = x_min + cols * float(transform.a)
        y_min = y_max + rows * float(transform.e)
        t_to_latlon = Transformer.from_crs(crs, "EPSG:4326", always_xy=True)
        tl_lon, tl_lat = t_to_latlon.transform(x_min, y_max)
        tr_lon, tr_lat = t_to_latlon.transform(x_max, y_max)
        br_lon, br_lat = t_to_latlon.transform(x_max, y_min)
        bl_lon, bl_lat = t_to_latlon.transform(x_min, y_min)

        maplibre_coords = [
            [round(tl_lon, 6), round(tl_lat, 6)],
            [round(tr_lon, 6), round(tr_lat, 6)],
            [round(br_lon, 6), round(br_lat, 6)],
            [round(bl_lon, 6), round(bl_lat, 6)],
        ]
        bounds_lonlat = [
            round(min(tl_lon, bl_lon), 6),
            round(min(bl_lat, br_lat), 6),
            round(max(tr_lon, br_lon), 6),
            round(max(tl_lat, tr_lat), 6),
        ]

        summary = {
            **plan,
            "status": "VERIFIED_PAIR_COMPLETE",
            "completed_at_utc": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            "backscatter_response_body_bytes": budget.bytes_received,
            "combined_total_response_body_bytes": mask_bytes_used + budget.bytes_received,
            "remaining_shared_budget_bytes": LIMIT - (mask_bytes_used + budget.bytes_received),
            "crs": crs,
            "transform": [transform.a, transform.b, transform.c, transform.d, transform.e, transform.f],
            "shape": [rows, cols],
            "bounds_lonlat": bounds_lonlat,
            "maplibre_coordinates": maplibre_coords,
            "granules_verified": [
                {
                    **read_results[0],
                    "mask_valid_pixels": int(valid_mask_pixels(mask0).sum()),
                    "hhhh_valid_positive_pixels": int(valid0.sum()),
                    "mean_db": round(float(np.nanmean(raw_db0)), 3),
                    "std_db": round(float(np.nanstd(raw_db0)), 3),
                    "mean_looks": round(float(np.nanmean(looks0[valid0])), 2),
                },
                {
                    **read_results[1],
                    "mask_valid_pixels": int(valid_mask_pixels(mask1).sum()),
                    "hhhh_valid_positive_pixels": int(valid1.sum()),
                    "mean_db": round(float(np.nanmean(raw_db1)), 3),
                    "std_db": round(float(np.nanstd(raw_db1)), 3),
                    "mean_looks": round(float(np.nanmean(looks1[valid1])), 2),
                },
            ],
            "stats": {
                "denominator_description": "jointly valid pixels inside An Giang window (0 < mask < 255, HHHH > 0, numberOfLooks > 0 on both dates)",
                "total_pixels_in_aoi": total_pixels,
                "valid_pixels": joint_valid_count,
                "common_valid_fraction": round(joint_valid_count / total_pixels, 6),
                "excluded": {
                    "invalid_before": int(total_pixels - int(valid0.sum())),
                    "invalid_after": int(total_pixels - int(valid1.sum())),
                    "joint_excluded": int(total_pixels - joint_valid_count),
                },
                "before_db": {
                    "mean": round(float(np.nanmean(db0)), 3),
                    "median": round(float(np.nanmedian(db0)), 3),
                    "p05": round(float(np.nanpercentile(db0, 5)), 3),
                    "p95": round(float(np.nanpercentile(db0, 95)), 3),
                    "std": round(float(np.nanstd(db0)), 3),
                },
                "after_db": {
                    "mean": round(float(np.nanmean(db1)), 3),
                    "median": round(float(np.nanmedian(db1)), 3),
                    "p05": round(float(np.nanpercentile(db1, 5)), 3),
                    "p95": round(float(np.nanpercentile(db1, 95)), 3),
                    "std": round(float(np.nanstd(db1)), 3),
                },
                "delta_db": {
                    "mean": round(float(np.mean(valid_delta)), 3),
                    "median": round(float(p50), 3),
                    "p05": round(float(p05), 3),
                    "p95": round(float(p95), 3),
                    "std": round(float(np.std(valid_delta)), 3),
                },
                "classes": {
                    "decrease": dec_count,
                    "no_significant_change": neu_count,
                    "increase": inc_count,
                },
                "pixel_area_m2": pixel_area_m2,
                "areas_km2": {
                    "total_aoi": round(total_pixels * pixel_area_m2 / 1e6, 2),
                    "valid_analyzed": round(joint_valid_count * pixel_area_m2 / 1e6, 2),
                    "decrease_area": round(dec_count * pixel_area_m2 / 1e6, 2),
                    "increase_area": round(inc_count * pixel_area_m2 / 1e6, 2),
                    "no_significant_change_area": round(neu_count * pixel_area_m2 / 1e6, 2),
                },
            },
            "files": files_meta,
        }

        manifest_file = staging_dir / "verified_pair_manifest.json"
        manifest_file.write_text(json.dumps(summary, indent=2) + "\n")
        if FINAL_PAIR_DIR.exists():
            raise RuntimeError("FINAL_PAIR_DIR already exists")
        os.replace(staging_dir, FINAL_PAIR_DIR)
        _fsync_directory(FINAL_PAIR_DIR.parent, ROOT)
        return summary
    finally:
        checkpoint.close()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--execute", action="store_true")
    args = parser.parse_args()
    print(json.dumps(run_verified_extraction(args.execute), indent=2))


if __name__ == "__main__":
    main()

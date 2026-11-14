"""Scientific processing pipeline for NISAR L2 GCOV pair over Mekong Delta.

Performs:
1. Window reading of HHHH covariance term and masks.
2. Speckle suppression (5x5 boxcar on linear power).
3. Calibrated dB conversion: P_dB = 10 * log10(P).
4. Signed change: ΔdB = P_after_dB - P_before_dB.
5. Strict Mekong Delta boundary masking and invalid exclusions.
6. Statistics computation (with explicit denominator).
7. RGBA visual layer generation (Before, After, Continuous ΔdB, Classified).
8. Research GeoTIFF export (delta_db.tif).
9. AOI GeoJSON generation.
"""
from __future__ import annotations

import json
import math
import os
import time
from pathlib import Path
from typing import Any, Dict, Tuple

import h5py
import numpy as np
from PIL import Image
from pyproj import Transformer
import rasterio
from rasterio.features import rasterize
from rasterio.transform import from_origin
from scipy.ndimage import uniform_filter
from shapely.geometry import box, mapping, shape
from shapely.ops import transform

from config import DECREASE_DB, INCREASE_DB, BOXCAR, BACKSCATTER_STRETCH, CHANGE_STRETCH


def process_pair(
    before_h5: str | Path,
    after_h5: str | Path,
    mekong_boundary_geojson: str | Path,
    out_dir: str | Path,
    stride: int = 5,
    *,
    polarization_term: str | None = None,
    valid_mask_values: tuple[int, ...] | None = None,
) -> Dict[str, Any]:
    """Process a pair only when grid and mask semantics are explicitly verifiable.

    NISAR mask bit meanings are product-version specific. Callers must provide
    the accepted values from verified product documentation; absent metadata is
    a hard stop, never an implicit all-valid mask.
    """
    t0 = time.time()
    out_dir = Path(out_dir)
    if not polarization_term or not polarization_term.isalpha():
        raise ValueError("Provide an explicit diagonal covariance dataset name (e.g. HHHH) after inspecting both products.")
    if not valid_mask_values:
        raise ValueError("Mask semantics are unverified. Supply valid_mask_values from the selected product documentation.")

    print(f"Opening HDF5 granules...")
    with h5py.File(before_h5, "r") as hb, h5py.File(after_h5, "r") as ha:
        group = "science/LSAR/GCOV/grids/frequencyA"
        variable = f"{group}/{polarization_term}"
        required = (variable, f"{group}/mask", f"{group}/xCoordinates", f"{group}/yCoordinates", f"{group}/projection")
        missing = [f for f in required if f not in hb or f not in ha]
        if missing:
            raise ValueError(f"Missing required GCOV datasets: {missing}")
        ds1, ds2 = hb[variable], ha[variable]
        x1, x2 = hb[f"{group}/xCoordinates"][()], ha[f"{group}/xCoordinates"][()]
        y1, y2 = hb[f"{group}/yCoordinates"][()], ha[f"{group}/yCoordinates"][()]
        p1, p2 = hb[f"{group}/projection"][()], ha[f"{group}/projection"][()]
        if isinstance(p1, np.ndarray): p1 = p1.item()
        if isinstance(p2, np.ndarray): p2 = p2.item()
        if isinstance(p1, bytes): p1 = p1.decode()
        if isinstance(p2, bytes): p2 = p2.decode()
        if ds1.shape != ds2.shape or not np.array_equal(x1, x2) or not np.array_equal(y1, y2) or p1 != p2:
            raise ValueError("GCOV grids differ; co-registration/resampling is required before comparison.")
        if len(x1) < 2 or len(y1) < 2:
            raise ValueError("GCOV coordinate arrays are insufficient to derive a raster transform.")
        dx, dy = float(x1[1] - x1[0]), float(y1[1] - y1[0])
        if not np.allclose(np.diff(x1), dx) or not np.allclose(np.diff(y1), dy):
            raise ValueError("Non-uniform GCOV grid cannot be represented by the current affine raster writer.")
        raw1 = ds1[::stride, ::stride].astype(np.float32)
        raw2 = ds2[::stride, ::stride].astype(np.float32)
        mask1 = hb[f"{group}/mask"][::stride, ::stride]
        mask2 = ha[f"{group}/mask"][::stride, ::stride]
        crs = f"EPSG:{int(p1)}" if str(p1).isdigit() else str(p1)
        if not crs or crs in {"None", "0"}:
            raise ValueError("Projection metadata is unverified; refusing to write georeferenced output.")

    rows, cols = raw1.shape
    x_min = float(x1[0])
    y_max = float(y1[0])
    res_x, res_y = dx * stride, abs(dy) * stride
    res = res_x
    x_max = x_min + cols * res
    y_min = y_max - rows * res

    if not np.isclose(res_x, res_y):
        raise ValueError("Non-square pixels are not supported by the current processing output.")
    affine = from_origin(x_min - dx / 2, y_max - dy / 2, res_x, res_y)
    print(f"Grid dimensions: {cols}x{rows} at {res}m resolution. Extent: X [{x_min}, {x_max}], Y [{y_min}, {y_max}]")

    # Load and transform Mekong Delta boundary
    print("Rasterizing Mekong Delta boundary mask...")
    t_to_utm = Transformer.from_crs("EPSG:4326", crs, always_xy=True)
    with open(mekong_boundary_geojson, "r") as f:
        mekong_gj = json.load(f)
    mekong_geom_4326 = shape(mekong_gj["features"][0]["geometry"])
    
    # Reproject Mekong boundary to UTM 48N
    def proj_coords(x, y):
        return t_to_utm.transform(x, y)
    mekong_geom_utm = transform(proj_coords, mekong_geom_4326)

    # Rasterize boundary: 1 inside Mekong Delta, 0 outside
    inside_mekong = rasterize(
        [(mekong_geom_utm, 1)],
        out_shape=(rows, cols),
        transform=affine,
        fill=0,
        dtype=np.uint8
    ) == 1

    # Joint validity criteria
    # 1. Inside Mekong Delta
    # 2. Raw linear backscatter > 0 and finite
    # 3. Fill / mask valid
    valid_raw1 = (raw1 > 0) & np.isfinite(raw1) & np.isin(mask1, valid_mask_values)
    valid_raw2 = (raw2 > 0) & np.isfinite(raw2) & np.isin(mask2, valid_mask_values)
    
    joint_valid = inside_mekong & valid_raw1 & valid_raw2

    # Exclusions accounting
    total_aoi_pixels = int(np.count_nonzero(inside_mekong))
    valid_pixels = int(np.count_nonzero(joint_valid))
    excluded = {
        "outside_mekong_boundary": int(np.count_nonzero(~inside_mekong)),
        "invalid_or_non_positive_before": int(np.count_nonzero(inside_mekong & ~valid_raw1)),
        "invalid_or_non_positive_after": int(np.count_nonzero(inside_mekong & ~valid_raw2)),
        "total_excluded_within_mekong": total_aoi_pixels - valid_pixels,
    }

    print(f"Total pixels in Mekong AOI: {total_aoi_pixels:,}, Joint valid pixels: {valid_pixels:,} ({valid_pixels/total_aoi_pixels*100:.1f}%)")

    # Speckle reduction: 5x5 boxcar filter on positive linear power
    print("Applying 5x5 boxcar filter for speckle reduction...")
    clean1 = np.where(valid_raw1, raw1, np.nan)
    clean2 = np.where(valid_raw2, raw2, np.nan)

    # Fast uniform filter (mean on valid neighborhood)
    filt1 = uniform_filter(np.nan_to_num(clean1, nan=0.0), size=BOXCAR)
    norm1 = uniform_filter(valid_raw1.astype(np.float32), size=BOXCAR)
    filt1 = np.where(norm1 > 0.2, filt1 / np.maximum(norm1, 1e-4), np.nan)

    filt2 = uniform_filter(np.nan_to_num(clean2, nan=0.0), size=BOXCAR)
    norm2 = uniform_filter(valid_raw2.astype(np.float32), size=BOXCAR)
    filt2 = np.where(norm2 > 0.2, filt2 / np.maximum(norm2, 1e-4), np.nan)

    # Convert to decibels: P_dB = 10 * log10(P)
    print("Computing backscatter in dB and signed difference ΔdB...")
    with np.errstate(divide="ignore", invalid="ignore"):
        db1 = np.where(joint_valid & (filt1 > 0), 10.0 * np.log10(filt1), np.nan)
        db2 = np.where(joint_valid & (filt2 > 0), 10.0 * np.log10(filt2), np.nan)
        delta_db = np.where(joint_valid, db2 - db1, np.nan)

    # Numerical statistics on jointly valid pixels
    valid_delta = delta_db[joint_valid & np.isfinite(delta_db)]
    if not valid_delta.size:
        raise ValueError("No jointly valid pixels remain after AOI, power, and quality mask filtering.")
    p05, p50, p95 = np.percentile(valid_delta, [5, 50, 95])
    mean_val = float(np.mean(valid_delta))
    std_val = float(np.std(valid_delta))

    # Classes: decrease (<= -3 dB), neutral, increase (>= +3 dB)
    dec_count = int(np.count_nonzero(valid_delta <= DECREASE_DB))
    inc_count = int(np.count_nonzero(valid_delta >= INCREASE_DB))
    neu_count = int(len(valid_delta) - dec_count - inc_count)

    pixel_area_m2 = float(res * res)
    stats = {
        "denominator_description": "jointly valid pixels inside AOI ∩ Mekong Delta boundary",
        "total_pixels_in_aoi": total_aoi_pixels,
        "valid_pixels": valid_pixels,
        "excluded": excluded,
        "delta_db": {
            "mean": round(mean_val, 3),
            "median": round(float(p50), 3),
            "p05": round(float(p05), 3),
            "p95": round(float(p95), 3),
            "std": round(std_val, 3),
        },
        "classes": {
            "decrease": dec_count,
            "no_significant_change": neu_count,
            "increase": inc_count,
        },
        "pixel_area_m2": pixel_area_m2,
        "areas_km2": {
            "total_aoi": round(total_aoi_pixels * pixel_area_m2 / 1e6, 1),
            "valid_analyzed": round(valid_pixels * pixel_area_m2 / 1e6, 1),
            "decrease_area": round(dec_count * pixel_area_m2 / 1e6, 1),
            "increase_area": round(inc_count * pixel_area_m2 / 1e6, 1),
        }
    }
    print("Change Statistics:", json.dumps(stats, indent=2))

    # Render Visual RGBA Layers
    print("Generating visual RGBA layers...")

    # Helper: grayscale stretch
    def make_db_rgba(db_arr: np.ndarray, vmin: float = -25.0, vmax: float = 0.0) -> Image.Image:
        norm = np.clip((db_arr - vmin) / (vmax - vmin), 0.0, 1.0)
        gray = (norm * 255).astype(np.uint8)
        alpha = np.where(np.isfinite(db_arr) & inside_mekong, 255, 0).astype(np.uint8)
        rgba = np.stack([gray, gray, gray, alpha], axis=-1)
        return Image.fromarray(rgba, mode="RGBA")

    # Helper: continuous diverging ΔdB (Blue for decrease, White for 0, Red for increase)
    def make_change_rgba(d_arr: np.ndarray, vmin: float = -6.0, vmax: float = 6.0) -> Image.Image:
        r = np.zeros_like(d_arr, dtype=np.uint8)
        g = np.zeros_like(d_arr, dtype=np.uint8)
        b = np.zeros_like(d_arr, dtype=np.uint8)
        a = np.zeros_like(d_arr, dtype=np.uint8)

        m = np.isfinite(d_arr) & joint_valid

        # Negative: decrease (blue to white)
        neg = m & (d_arr < 0)
        norm_neg = np.clip(-d_arr[neg] / abs(vmin), 0.0, 1.0)  # 0 at 0dB, 1 at <= -6dB
        # Interpolate white (255, 255, 255) to vibrant blue (30, 144, 255)
        r[neg] = (255 - norm_neg * (255 - 30)).astype(np.uint8)
        g[neg] = (255 - norm_neg * (255 - 144)).astype(np.uint8)
        b[neg] = 255
        a[neg] = (norm_neg * 220 + 20).astype(np.uint8)

        # Positive: increase (white to red)
        pos = m & (d_arr >= 0)
        norm_pos = np.clip(d_arr[pos] / vmax, 0.0, 1.0)  # 0 at 0dB, 1 at >= +6dB
        # Interpolate white (255, 255, 255) to vibrant red (231, 76, 60)
        r[pos] = 255
        g[pos] = (255 - norm_pos * (255 - 76)).astype(np.uint8)
        b[pos] = (255 - norm_pos * (255 - 60)).astype(np.uint8)
        a[pos] = (norm_pos * 220 + 20).astype(np.uint8)

        rgba = np.stack([r, g, b, a], axis=-1)
        return Image.fromarray(rgba, mode="RGBA")

    # Helper: classified ΔdB
    def make_class_rgba(d_arr: np.ndarray) -> Image.Image:
        r = np.zeros_like(d_arr, dtype=np.uint8)
        g = np.zeros_like(d_arr, dtype=np.uint8)
        b = np.zeros_like(d_arr, dtype=np.uint8)
        a = np.zeros_like(d_arr, dtype=np.uint8)

        m = np.isfinite(d_arr) & joint_valid

        # Decrease: DodgerBlue [30, 144, 255, 230]
        dec = m & (d_arr <= DECREASE_DB)
        r[dec], g[dec], b[dec], a[dec] = 30, 144, 255, 230

        # Increase: OrangeRed [255, 69, 0, 230]
        inc = m & (d_arr >= INCREASE_DB)
        r[inc], g[inc], b[inc], a[inc] = 255, 69, 0, 230

        # Neutral: subtle neutral gray with low alpha
        neu = m & (d_arr > DECREASE_DB) & (d_arr < INCREASE_DB)
        r[neu], g[neu], b[neu], a[neu] = 200, 200, 200, 40

        rgba = np.stack([r, g, b, a], axis=-1)
        return Image.fromarray(rgba, mode="RGBA")

    out_dir.mkdir(parents=True, exist_ok=True)
    # Save PNG images
    img_before = make_db_rgba(db1, BACKSCATTER_STRETCH[0], BACKSCATTER_STRETCH[1])
    img_after = make_db_rgba(db2, BACKSCATTER_STRETCH[0], BACKSCATTER_STRETCH[1])
    img_change = make_change_rgba(delta_db, CHANGE_STRETCH[0], CHANGE_STRETCH[1])
    img_class = make_class_rgba(delta_db)

    before_png = out_dir / "before_db.png"
    after_png = out_dir / "after_db.png"
    change_png = out_dir / "change_db.png"
    class_png = out_dir / "change_classes.png"

    img_before.save(before_png, optimize=True)
    img_after.save(after_png, optimize=True)
    img_change.save(change_png, optimize=True)
    img_class.save(class_png, optimize=True)
    print(f"Saved PNG visual layers (sizes: {before_png.stat().st_size/1e6:.2f}MB, {after_png.stat().st_size/1e6:.2f}MB, {change_png.stat().st_size/1e6:.2f}MB)")

    # Save scientific GeoTIFF (COG/GeoTIFF)
    print("Writing scientific GeoTIFF of ΔdB...")
    tif_path = out_dir / "delta_db.tif"
    with rasterio.open(
        tif_path,
        "w",
        driver="GTiff",
        height=rows,
        width=cols,
        count=1,
        dtype=np.float32,
        crs=crs,
        transform=affine,
        nodata=np.nan,
        compress="deflate",
    ) as dst:
        dst.write(delta_db.astype(np.float32), 1)

    # Compute exact lon/lat coordinates of grid corners for MapLibre
    t_to_latlon = Transformer.from_crs(crs, "EPSG:4326", always_xy=True)
    # Corners: Top-Left, Top-Right, Bottom-Right, Bottom-Left
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

    # Save AOI polygon GeoJSON
    aoi_box_utm = box(x_min, y_min, x_max, y_max)
    aoi_box_4326 = transform(lambda x, y: t_to_latlon.transform(x, y), aoi_box_utm)
    aoi_gj = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {
                    "name": "Mekong Delta Analyzed AOI",
                    "bounds_lonlat": bounds_lonlat,
                    "resolution_m": res,
                    "valid_pixels": valid_pixels,
                },
                "geometry": mapping(aoi_box_4326),
            }
        ],
    }
    aoi_json_path = out_dir / "aoi.geojson"
    with open(aoi_json_path, "w") as f:
        json.dump(aoi_gj, f)

    elapsed = time.time() - t0
    print(f"Processing finished in {elapsed:.1f}s! Outputs in {out_dir}")

    return {
        "stats": stats,
        "grid": {
            "crs": crs,
            "affine": [affine.a, affine.b, affine.c, affine.d, affine.e, affine.f],
            "width": cols,
            "height": rows,
            "spacing_m": [res, res],
            "pixel_convention": "corner",
            "bounds_lonlat": bounds_lonlat,
            "maplibre_coordinates": maplibre_coords,
        },
        "files": {
            "before_png": str(before_png.name),
            "after_png": str(after_png.name),
            "change_png": str(change_png.name),
            "class_png": str(class_png.name),
            "delta_db_tif": str(tif_path.name),
            "aoi_geojson": str(aoi_json_path.name),
        },
    }


if __name__ == "__main__":
    import sys
    from pipeline.config import LOCAL_FALLBACK_DIR
    b_h5 = sys.argv[1] if len(sys.argv) > 1 else str(LOCAL_FALLBACK_DIR / "NISAR_L2_PR_GCOV_032_155_A_006_2005_DHDH_M_20261010T222732_20261010T222741_P05023_N_P_J_001.h5")
    a_h5 = sys.argv[2] if len(sys.argv) > 2 else str(LOCAL_FALLBACK_DIR / "NISAR_L2_PR_GCOV_033_155_A_006_2005_DHDH_M_20261022T222732_20261022T222742_P05023_N_P_J_001.h5")
    m_gj = "frontend/public/data/v1/mekong_boundary.geojson"
    out = "frontend/public/data/v1/releases/rel-mekong-20261010-20261022"
    res = process_pair(b_h5, a_h5, m_gj, out)
    print("Done! Summary:", res["stats"]["areas_km2"])

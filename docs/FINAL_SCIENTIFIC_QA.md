# Final Independent Scientific & Technical Quality Audit (`FINAL_SCIENTIFIC_QA.md`)

**Project**: NISAR ChangeLens (*"See Change. Understand Earth."*)  
**Team**: `4/K`  
**Challenge**: NASA Space Apps Challenge 2026 — *Dancing with the SARs*  
**Audit Date**: 2026-11-14  
**Repository Root**: `./` (`4K - Dancing with the SARs`)

---

## 1. Executive Summary & Audit Scorecard

An independent scientific and technical quality audit was conducted directly against the pipeline source code, raw extracted HDF5/GeoTIFF subsets, cryptographic manifests, PNG visual layers, and frontend data bindings for the **An Giang Verified Window (`[104.95, 10.45, 105.05, 10.55]`)** and the **Đồng Tháp Diagnostic Window (`[105.45, 10.60, 105.55, 10.70]`)**.

| Audit Category | Status | Summary of Independent Evidence |
| :--- | :--- | :--- |
| **1. Acquisition & Orbital Compatibility (Gates 1–7)** | **PASS** | Verified directly from HDF5 `/science/LSAR/identification`: both `G4404304390-ASF` (`2026-10-22`) and `G4410154671-ASF` (`2026-11-03`) are `NISAR_L2_GCOV_V1`, Track `148`, Frame `083`, `Descending`, `Left`-looking, `DHDH` (`HHHH`/`HVHV`), CRID `P05036` (`v1.0.20`). |
| **2. Raster Grid & Coordinate Alignment (Gate 8)** | **PASS** | Both subsets share `EPSG:32648`, pixel spacing `dx = +10.0 m`, `dy = -10.0 m`, affine origin `(494530.0, 1166220.0)`, shape `1105 × 1094` (`1,208,870` pixels), and identical `xCoordinates` / `yCoordinates` SHA-256 digests. |
| **3. Mask & Radiometric Validity (Gates 9–10)** | **PASS** | Predicate `(mask > 0) & (mask < 255) & isfinite(HHHH) & (HHHH > 0) & isfinite(numberOfLooks) & (numberOfLooks > 0)` independently reproduced: `1,207,786` valid on Oct 22 (`99.910%`), `1,207,780` valid on Nov 03 (`99.910%`), and **`1,207,740` jointly valid pixels (`99.9065%`)**. |
| **4. 5×5 Boxcar Speckle Filter Implementation** | **PASS with MINOR WARNING (`W-1`)** | Filter operates on linear $\gamma^0$ power (`HHHH`) using normalized validity weighting (`uniform_filter(clean, 5) / uniform_filter(valid, 5)`), preventing zero/NaN contamination (`max_abs_diff = 2.38e-7` vs exact valid patch mean). **Minor Warning `W-1`**: `filt0` normalizes by `valid0` and `filt1` by `valid1` before applying `joint_valid`, causing a minor neighborhood-denominator difference along `1,019` pixels (`0.084%` of AOI) bordering the `86` single-date `mask=0` pixels (`0.000 dB` impact on mean/median $\Delta\gamma^0$; `0.01 km²` difference on class areas). |
| **5. Calibration ($\gamma^0_{\text{dB}}$) & Change ($\Delta\gamma^0_{\text{dB}}$)** | **PASS with MINOR WARNING (`W-2`)** | Formula $\gamma^0_{\text{dB}} = 10\log_{10}(P)$ and signed difference $\Delta\gamma^0_{\text{dB}} = \gamma^0_{\text{after,dB}} - \gamma^0_{\text{before,dB}}$ verified. `delta_db.tif` matches independent recalculation bit-for-bit (`np.allclose = True`). **Minor Warning `W-2`**: `granules_verified[].mean_db` in manifest reports raw unsmoothed pixel mean (`-9.793 dB` / `-9.317 dB`), whereas `stats.before_db.mean` / `after_db.mean` reports the $5\times 5$ boxcar-smoothed mean (`-8.742 dB` / `-8.325 dB`). Both are mathematically correct for their respective domains (due to Jensen's inequality on $\log_{10}$ of Rayleigh speckle) and should be clearly labeled. |
| **6. Area & Class Statistics Reproduction** | **PASS** | Independently reproduced: `120.89 km²` total AOI, **`120.77 km²` valid analyzed** (`1,207,740` px × `100 m²`), `2,905` px (`0.29 km²`, `0.24%`) with $\Delta\gamma^0 \le -3.0\text{ dB}$, `1,160,945` px (`116.09 km²`, `96.13%`) within $\pm 3.0\text{ dB}$, and `43,890` px (`4.39 km²`, `3.63%`) with $\Delta\gamma^0 \ge +3.0\text{ dB}$. Classes are mutually exclusive and sum to `1,207,740`. |
| **7. Output Integrity (SHA-256) & Frontend Sync** | **PASS (after fixing UI display typo `D-1`)** | All 11 files in `data/raw/nisar_subsets/angiang_verified_pair_20261022_20261103/` exist and match `verified_pair_manifest.json` byte-for-byte and SHA-256-for-SHA-256. All 4 PNGs in `frontend/public/data/verified-angiang/` are byte-identical to the pipeline outputs. A 1-character transcription typo (`...0755...` vs `...0855...`) in the static display string for `20261103_HHHH.tif` inside `frontend/src/data/study.ts` was identified (`D-1`) and corrected. |
| **8. 3-Level Scientific Interpretation & Honesty** | **PASS** | Strictly separates Level 1 (Measured $\Delta\gamma^0\text{ dB}$), Level 2 (Physical scattering hypotheses: specular reflection vs double-bounce), and Level 3 (Supported conclusions & missing auxiliary evidence). Makes zero unsupported binary flood claims. |

---

## 2. Files Inspected & Verification Methods

### Files Inspected
1. `pipeline/extract_verified_pair.py` (lines 1–537)
2. `pipeline/extract_mask_pair.py` (lines 1–475)
3. `pipeline/process_pair.py` (lines 1–384)
4. `pipeline/http_range_budget.py`
5. `data/raw/nisar_subsets/angiang_verified_pair_20261022_20261103/verified_pair_manifest.json`
6. `data/raw/nisar_subsets/angiang_verified_pair_20261022_20261103/*.tif` and `*.png` (all 11 files)
7. `data/raw/nisar_subsets/angiang_mask_only_4K-COVERAGE-01-angiang-mask-only-v1/mask_coverage_manifest.json`
8. `data/raw/nisar_subsets/mekong_bbox_10545_10555_1060_1070_20261114/subset_manifest.json`
9. `data/metadata/candidate_pair_manifest.json`
10. `frontend/public/data/verified-angiang/`
11. `frontend/src/data/study.ts`, `frontend/src/data/catalogInventory.ts`, `frontend/src/components/MapStage.tsx`, `frontend/src/App.tsx`

### Verification Method
An independent Python audit script using `rasterio`, `numpy`, `scipy.ndimage`, and `hashlib` read the 7 GeoTIFFs (`20261022_mask.tif`, `20261022_HHHH.tif`, `20261022_numberOfLooks.tif`, `20261103_mask.tif`, `20261103_HHHH.tif`, `20261103_numberOfLooks.tif`, `delta_db.tif`) and 4 PNGs directly from disk and recomputed every mask count, neighborhood filter value, dB statistic, class count, area total, and SHA-256 digest from scratch.

---

## 3. Detailed Audit of the 5×5 Boxcar Speckle Filter (Section 2.3)

In `pipeline/extract_verified_pair.py` (lines 334–345):
```python
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
```

### Answers to the 8 Audit Questions:
1. **Is the filter applied to the intended calibrated backscatter representation?**  
   **Yes (`PASS`)**. It is applied to linear $\gamma^0$ backscatter power (`hhhh0`, `hhhh1`) *prior* to logarithmic conversion ($10\log_{10}$). Averaging in linear power is physically required to suppress multiplicative SAR speckle without introducing logarithmic Rayleigh bias.
2. **Are invalid pixels excluded from the filtering calculation?**  
   **Yes (`PASS`)**. Invalid pixels (`~valid0`, `~valid1`) are replaced with `0.0` in the numerator (`clean0`, `clean1`) and `0.0` in the indicator array (`valid0.astype(np.float32)`).
3. **Does the filter use a validity-aware neighborhood calculation?**  
   **Yes (`PASS`)**. Dividing `uniform_filter(clean0, size=5)` by `norm0 = uniform_filter(valid0.astype(np.float32), size=5)` cancels the $1/25$ factor and divides the sum of valid linear power values by the exact fraction of valid pixels in the $5\times 5$ window. If fewer than 6 out of 25 pixels are valid (`norm0 <= 0.2`), the pixel is rejected as `np.nan`.
4. **Are NaN and NoData values handled correctly?**  
   **Yes (`PASS`)**. Because `np.where(valid0, hhhh0, 0.0)` replaces all `NaN` / non-positive values with `0.0` *before* calling `scipy.ndimage.uniform_filter`, `NaN` values cannot propagate through the C-level sliding-sum accumulator of `uniform_filter`.
5. **Can invalid pixels contaminate valid pixels near the AOI or swath boundaries?**  
   **No zero-bias contamination (`PASS`), with a minor single-date vs joint-mask note (`WARNING W-1`)**:
   - We compared `filt0[r, c]` against an explicit Python patch mean `np.mean(h0[r-2:r+3, c-2:c+3][valid0[r-2:r+3, c-2:c+3]])` across valid pixels immediately bordering `mask = 0` gaps. The maximum absolute difference was **`2.38 × 10⁻⁷`** (pure IEEE-754 `float32` rounding), proving that invalid pixels do **not** pull neighbor averages toward zero.
   - **Minor Warning `W-1` (Per-Date vs Joint Validity in the $5\times 5$ Neighborhood)**: Because `filt0` normalizes over `valid0` ($1,207,786$ valid pixels) and `filt1` normalizes over `valid1` ($1,207,780$ valid pixels), along the **$86$ pixels** where one date has `mask = 1` and the other date has `mask = 0` (steep radar shadow/layover edges on Núi Tô hill), the **$1,019$ neighboring pixels (`0.084%` of the window)** average over $N$ pixels on one date and $N-1$ pixels on the other date. Recomputing the entire pipeline using `joint_valid` inside both `clean0`/`clean1` and `norm` in `float64` produces:
     - `before_mean_db`: `-8.743 dB` (vs `-8.742 dB` reported, diff `0.001 dB`)
     - `after_mean_db`: `-8.326 dB` (vs `-8.325 dB` reported, diff `0.001 dB`)
     - `delta_mean_db`: **`+0.417 dB`** (identical to 3 decimal places)
     - `delta_median_db`: **`+0.240 dB`** (identical to 3 decimal places)
     - `decrease_area`: `0.28 km²` (vs `0.29 km²`), `increase_area`: `4.38 km²` (vs `4.39 km²`), `stable_area`: `116.12 km²` (vs `116.09 km²`).
     - In accordance with Change Control rules, the existing verified outputs were **preserved without modification**, and this `0.01 km²` edge-neighborhood sensitivity is documented here.
6. **Is the treatment of image edges correct?**  
   **Yes (`PASS`)**. `scipy.ndimage.uniform_filter` uses `mode="reflect"` at the outer array boundary for both `clean` and `norm`, which preserves energy and weights reflected valid pixels consistently in both numerator and denominator.
7. **Are the before and after images filtered consistently?**  
   **Yes (`PASS`)**. Both use the identical $5\times 5$ kernel (`BOXCAR = 5`) and minimum valid fraction (`norm > 0.2`).
8. **Is the difference calculated from the intended filtered products?**  
   **Yes (`PASS`)**. `delta_db = np.where(joint_valid, db1 - db0, np.nan)` is computed directly from the $5\times 5$ boxcar-filtered `db1` (`2026-11-03`) minus `db0` (`2026-10-22`).

---

## 4. Mask, Calibration & Area Statistics Verification (Sections 2.4 – 2.6)

### 4.1 Mask & Raster Validity (`PASS`)
- **Mask Values Present in An Giang Window (`1105 × 1094` = `1,208,870` pixels)**:
  - `2026-10-22`: `mask = 1` (valid Subswath 1): `1,207,786` pixels (`99.9103%`); `mask = 0` (invalid/radar shadow): `1,084` pixels (`0.0897%`); `mask = 255`: `0` pixels.
  - `2026-11-03`: `mask = 1` (valid Subswath 1): `1,207,780` pixels (`99.9098%`); `mask = 0` (invalid/radar shadow): `1,090` pixels (`0.0902%`); `mask = 255`: `0` pixels.
- **Independent Finite Backscatter & Looks Check**:
  - Every pixel with `mask == 1` in both dates also satisfies `np.isfinite(HHHH) & (HHHH > 0) & np.isfinite(numberOfLooks) & (numberOfLooks > 0)`.
  - `numberOfLooks` is checked as an additional radiometric quality gate (`mean_looks = 5.18` on both dates) and is never used as a substitute for `mask`.
- **Joint Valid Coverage**:
  - `joint_valid = valid0 & valid1` = **`1,207,740` / `1,208,870` pixels = `0.999065` (`99.9065%`)**.
  - Excluded pixels: `1,084` invalid on Oct 22, `1,090` invalid on Nov 03, `1,130` jointly excluded (`1084 + 1090 - 1044` overlap = `1,130`).

### 4.2 Calibration & Change Calculation (`PASS` with Documentation Note `W-2`)
- **Units & Formula**:
  - `/science/LSAR/GCOV/grids/frequencyA/HHHH` has `units = "1"` (linear terrain-flattened $\gamma^0$ covariance power, not $\sigma^0$).
  - Conversion: $\gamma^0_{\text{HH,dB}} = 10\log_{10}(P_{\text{HHHH}})$.
  - Difference direction: $\Delta\gamma^0_{\text{dB}} = \gamma^0_{\text{2026-11-03,dB}} - \gamma^0_{\text{2026-10-22,dB}}$.
- **Note `W-2` (Raw dB Mean vs Boxcar-Filtered dB Mean)**:
  - Before $5\times 5$ boxcar filtering, the pixel-wise mean of $10\log_{10}(\text{HHHH})$ is `-9.793 dB` (Oct 22) and `-9.317 dB` (Nov 03).
  - After $5\times 5$ linear-power boxcar filtering, the pixel-wise mean of $10\log_{10}(\overline{\text{HHHH}}_{5\times 5})$ is **`-8.742 dB`** (Oct 22) and **`-8.325 dB`** (Nov 03), with a mean difference of **`+0.417 dB`** (`-8.3254 - (-8.7420) = +0.4166 dB -> +0.417 dB`).
  - Why is the linear-boxcar dB mean ~`1.05 dB` higher than the unsmoothed dB mean? By Jensen's inequality for the concave $\log_{10}$ function, $\mathbb{E}[10\log_{10}(P)] < 10\log_{10}(\mathbb{E}[P])$. Averaging 25 pixels in linear power increases the effective number of looks from $L \approx 5.18$ to $L_{\text{eff}} \gg 25$, reducing the negative logarithmic speckle bias on both dates equally while preserving the change signal ($\Delta\gamma^0_{\text{dB}} = +0.417\text{ dB}$).

### 4.3 Area Statistics Reproduction (`PASS`)
- Pixel resolution: `10.0 m × 10.0 m = 100.0 m² = 0.0001 km²`.
- Total AOI area: `1,208,870 × 100 m² = 120,887,000 m² = 120.89 km²`.
- Valid analyzed area: `1,207,740 × 100 m² = 120,774,000 m² = 120.77 km²`.
- Class counts & areas across the `1,207,740` jointly valid pixels:
  - **Strong Decrease ($\Delta\gamma^0 \le -3.0\text{ dB}$)**: `2,905` pixels = `290,500 m²` = **`0.29 km²`** (`0.2405%`).
  - **Stable ($-3.0\text{ dB} < \Delta\gamma^0 < +3.0\text{ dB}$)**: `1,160,945` pixels = `116,094,500 m²` = **`116.09 km²`** (`96.1254%`).
  - **Strong Increase ($\Delta\gamma^0 \ge +3.0\text{ dB}$)**: `43,890` pixels = `4,389,000 m²` = **`4.39 km²`** (`3.6341%`).
  - **Sum of classes**: `2,905 + 1,160,945 + 43,890 = 1,207,740` (`100.0000%` of jointly valid pixels; `0.29 + 116.09 + 4.39 = 120.77 km²`).

---

## 5. Output Integrity & SHA-256 Verification (Section 2.7)

All 11 files in `data/raw/nisar_subsets/angiang_verified_pair_20261022_20261103/` were hashed and compared against `verified_pair_manifest.json` and `frontend/public/data/verified-angiang/`:

| File Name | Size (Bytes) | Verified SHA-256 Digest | Manifest Match | Public Copy Identical |
| :--- | ---: | :--- | :---: | :---: |
| `20261022_mask.tif` | `7,397` | `af0eba4063a97602bd51e669e7838eae5df612e6a1c65cab85017adec86de935` | PASS | N/A (GeoTIFF) |
| `20261022_HHHH.tif` | `3,784,519` | `23d03545aed516817ff154825ed4b68eb1fcea543afa0c71449c19ffe269d2da` | PASS | N/A (GeoTIFF) |
| `20261022_numberOfLooks.tif` | `4,060,806` | `6b83816b8a6b5c60eae09748c72d97e2d01e1788598dfa19f58e9b78f9f72eb4` | PASS | N/A (GeoTIFF) |
| `20261103_mask.tif` | `7,400` | `01b7d9bf7289bdb331bfb10584ee74c89528762ca059716f8358cecd05b72bcb` | PASS | N/A (GeoTIFF) |
| `20261103_HHHH.tif` | `3,776,075` | `6029c49b01916ac295ebadcf125529f955269eada6e26166590e764085595d53` | PASS | N/A (GeoTIFF) |
| `20261103_numberOfLooks.tif` | `4,060,549` | `815291e2efb33f70ea99686ed2fb846107c041bd1a69d99ff14a528712146879` | PASS | N/A (GeoTIFF) |
| `delta_db.tif` | `4,373,110` | `dba52a0625b2ac133a1c6fbd1deac01c8ecfecbe87e9b9957b6cf3427fd693ed` | PASS | N/A (GeoTIFF) |
| `before_db.png` | `946,777` | `04f7876b52403a0ccccb7d54c6021b20fdd3796d8df455a4e808d4ff634c4dc5` | PASS | PASS |
| `after_db.png` | `928,677` | `bade485125cd8a924a5cf457e3b87b3279730d27bdfc54075ff6ee035dba42f6` | PASS | PASS |
| `change_db.png` | `2,581,321` | `a7883858deaf4f4dd06e253e95d375b5746b10eaa8ca3c174ac7bf5162f29565` | PASS | PASS |
| `change_classes.png` | `42,345` | `a4af22fe19719dcd024d48f3781ba41e7d992ac8c89c328e21f4869ae46b69e3` | PASS | PASS |

- **Resolved Frontend Display Defect (`D-1`)**: In `frontend/src/data/study.ts`, the hardcoded SHA-256 string for `20261103_HHHH.tif` had character 57 typed as `7` (`...075595d53`) instead of `8` (`...085595d53`). Note that the UI truncates displayed hashes to 24 characters (`6029c49b01916ac295ebadcf…`), so the rendered UI was unaffected, and the full 64-character string in `study.ts` has been corrected to match `verified_pair_manifest.json` exactly.

---

## 6. Recommended Future Enhancements (Requiring Owner Approval Before Modifying Pipeline)

1. **Joint-Mask Neighborhood Normalization (`W-1`)**: In a future pipeline revision (if approved by the owner), replace `valid0` and `valid1` in `clean0`/`clean1`/`norm0`/`norm1` (`pipeline/extract_verified_pair.py` lines 334–340) with `joint_valid` and compute the `uniform_filter` in `float64` so that the `1,019` pixels bordering single-date `mask=0` shadow cells average over the exact same pixel support on both dates.
2. **Cross-Pol (`HVHV`) Integration**: Extend bounded extraction to include `/science/LSAR/GCOV/grids/frequencyA/HVHV` to help separate open-water specular decreases from emergent wetland double-bounce increases.

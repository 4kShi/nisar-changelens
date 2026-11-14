# NISAR Pair Validation Report

## 1. Executive Summary
- **Candidate Pair**:
  - **Earlier (`Before`)**: `NISAR_L2_PR_GCOV_033_148_D_083_4005_DHDH_A_20261022T113140_20261022T113214_P05036_N_F_J_001` (`G4404304390-ASF`, Cycle 33, Orbit 6475, `2026-10-22T11:31:40Z`)
  - **Later (`After`)**: `NISAR_L2_PR_GCOV_034_148_D_083_4005_DHDH_A_20261103T113137_20261103T113215_P05036_N_F_J_001` (`G4410154671-ASF`, Cycle 34, Orbit 6648, `2026-11-03T11:31:37Z`)
- **Collection**: `NISAR_L2_GCOV_V1` (`C3622241360-ASF`, science-validated archive)
- **Validation Status**:
  - **An Giang Screening Window (`[104.95, 10.45, 105.05, 10.55]`)**: **PASSED ALL 10 GATES (`VERIFIED_PAIR_COMPLETE`)** — `99.9065%` common valid coverage (`1,207,740` / `1,208,870` pixels = `120.77 km²`).
  - **Đồng Tháp Mười Pilot Bbox (`[105.45, 10.60, 105.55, 10.70]`)**: **REJECTED BY GATES 9 & 10 (`0.00%` valid pixels)** — 100% of `1,212,165` pixels have `mask = 255` (fill outside the tilted Descending Track 148 radar swath) and `HHHH = NaN`.

---

## 2. 10-Gate Compatibility Matrix (An Giang Verified Window `[104.95, 10.45, 105.05, 10.55]`)

| Gate | Requirement | Expected | Observed (`2026-10-22` vs `2026-11-03`) | Status |
| :--- | :--- | :--- | :--- | :--- |
| **1** | Product Type & Collection | `NISAR_L2_GCOV_V1` (`GCOV`) | `NISAR_L2_GCOV_V1` (`GCOV`) on both dates | **PASS** |
| **2** | Frequency & Polarization | `Frequency A / HHHH` | `Frequency A / HHHH` (`DHDH` dual-pol) | **PASS** |
| **3** | Relative Orbit / Track | Identical Track | `Track 148` vs `Track 148` | **PASS** |
| **4** | Frame Number | Identical Frame | `Frame 083` vs `Frame 083` | **PASS** |
| **5** | Orbit Pass Direction | Identical Direction | `Descending` vs `Descending` | **PASS** |
| **6** | Look Direction | Identical Look Direction | `Left` vs `Left` | **PASS** |
| **7** | Processor CRID & Version | Compatible Validated CRID | `CRID P05036` / `v1.0.20` on both dates | **PASS** |
| **8** | Grid Projection & Alignment | Identical CRS, spacing, and coordinates | `EPSG:32648`, `dx=10.0 m`, `dy=-10.0 m`, rows `[19962..21067)`, cols `[24469..25563)` (`1105×1094`), identical coordinate SHA-256 | **PASS** |
| **9** | Common Valid Subswath Mask | $\ge 80\%$ pixels with `0 < mask < 255` | **`99.9065%`** (`1,207,740` / `1,208,870` pixels jointly valid) | **PASS** |
| **10** | Finite Positive `HHHH` & `numberOfLooks` | `HHHH > 0` and `numberOfLooks > 0` | `1,207,740` jointly valid positive pixels; `mean_looks = 5.18` on both dates | **PASS** |

---

## 3. Resumable HTTP Range Byte-Budget Ledger

To prevent unbounded network transfers against the `5.78 GB` (`2026-10-22`) and `6.45 GB` (`2026-11-03`) remote HDF5 granules, all reads were guarded by `HTTPRangeByteBudget` and `RangeCheckpointStore` under a strict **250,000,000-byte (`250 MB`) shared cap**:

1. **Stage 1 — Mask Pair Verification (`4K-COVERAGE-01-angiang-mask-only-v1`)**:
   - Manifest: `data/raw/nisar_subsets/angiang_mask_only_4K-COVERAGE-01-angiang-mask-only-v1/mask_coverage_manifest.json`
   - Measured response-body bytes: **`1,149,959` bytes (`1.15 MB`)** across 214 HTTP range requests.
2. **Stage 2 — Calibrated `HHHH` & `numberOfLooks` Extraction (`4K-BACKSCATTER-01-angiang-hhhh-looks-v1`)**:
   - Manifest: `data/raw/nisar_subsets/angiang_verified_pair_20261022_20261103/verified_pair_manifest.json`
   - Measured response-body bytes: **`32,662,758` bytes (`32.66 MB`)**.
3. **Combined Total**:
   - **`33,812,717` bytes (`33.81 MB`, `13.53%` of the 250 MB cap)**, leaving **`216,187,283` bytes** unused.

---

## 4. Calibrated Radiometric Summary (An Giang Window)

- **Valid Area Analyzed**: `120.77 km²` out of `120.89 km²` (`1,207,740` / `1,208,870` 10 m pixels).
- **2026-10-22 (`Before`, $5\times 5$ normalized boxcar $\gamma^0_{\text{HH}}$ in dB)**:
  - Mean: `-8.742 dB` | Median: `-7.346 dB` | 5th–95th percentile: `[-18.306, -3.744] dB` | Std: `4.410 dB`
- **2026-11-03 (`After`, $5\times 5$ normalized boxcar $\gamma^0_{\text{HH}}$ in dB)**:
  - Mean: `-8.325 dB` | Median: `-7.297 dB` | 5th–95th percentile: `[-17.141, -3.715] dB` | Std: `3.990 dB`
- **Signed Log-Ratio Difference ($\Delta\gamma^0_{\text{dB}} = \gamma^0_{\text{after,dB}} - \gamma^0_{\text{before,dB}}$)**:
  - Mean: **`+0.417 dB`** | Median: **`+0.240 dB`** | 5th–95th percentile: **`[-1.186, +2.663] dB`** | Std: **`1.277 dB`**
- **Screening Classes (`±3.0 dB` threshold)**:
  - **Strong Decrease ($\Delta\gamma^0 \le -3.0\text{ dB}$)**: `2,905` pixels (`0.29 km²`, `0.24%`)
  - **Stable ($|\Delta\gamma^0| < 3.0\text{ dB}$)**: `1,160,945` pixels (`116.09 km²`, `96.13%`)
  - **Strong Increase ($\Delta\gamma^0 \ge +3.0\text{ dB}$)**: `43,890` pixels (`4.39 km²`, `3.63%`)

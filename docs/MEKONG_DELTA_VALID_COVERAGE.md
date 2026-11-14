# Mekong Delta Valid Coverage & Subswath Analysis

## 1. Why CMR Bounding-Box Intersection $\ne$ Valid SAR Swath Coverage
Each NISAR Level-2 Geocoded Polarimetric Covariance (`NISAR_L2_GCOV_V1`) granule is projected onto a north-up UTM grid (`EPSG:32648`, $10\text{ m} \times 10\text{ m}$ pixels, full grid shape $28,289 \times 26,645$). Because Descending Relative Orbit Track 148 travels NNE-to-SSW at an inclination of $\sim 10^\circ\text{–}12^\circ$, the illuminated radar swath forms a tilted parallelogram inside the north-up raster bounding box.

All grid cells outside the illuminated radar subswaths are padded with:
- `/science/LSAR/GCOV/grids/frequencyA/mask = 255` (fill / outside acquisition)
- `/science/LSAR/GCOV/grids/frequencyA/HHHH = NaN`
- `/science/LSAR/GCOV/grids/frequencyA/numberOfLooks = NaN`

Approximately **37%** of the north-up bounding box consists of `mask = 255` fill.

---

## 2. Comparison of Verified Subsets in the Mekong Delta

| Window Name | Province | WGS84 Bbox `[W, S, E, N]` | `EPSG:32648` Window (`rows`, `cols`) | Shape (`H × W`) | `2026-10-22` Valid Pixels (`0 < mask < 255`) | `2026-11-03` Valid Pixels (`0 < mask < 255`) | Common Valid Pixels & Fraction | Decision |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **An Giang Screening Window** | An Giang (Tri Tôn / Cô Tô) | `[104.95, 10.45, 105.05, 10.55]` | `[19962..21067)`, `[24469..25563)` | `1105 × 1094` (`1,208,870` px) | `1,207,786` (`99.910%`) | `1,207,780` (`99.910%`) | **`1,207,740` (`99.9065%`)** | **VERIFIED & COMPARABLE (10/10 Gates)** |
| **Đồng Tháp Mười Pilot Bbox** | Đồng Tháp (Tam Nông / Tràm Chim) | `[105.45, 10.60, 105.55, 10.70]` | `[18303..19410)`, `[29944..31039)` | `1107 × 1095` (`1,212,165` px) | `0` (`0.000%`, 100% `mask=255`) | `0` (`0.000%`, 100% `mask=255`) | **`0` (`0.0000%`)** | **REJECTED FAIL-CLOSED (Off-Swath)** |

---

## 3. Provincial Coverage Summary for Track 148 Frame 083 (`148_D_083`)
Within the Mekong Delta boundary (`mekong_provinces.geojson`):
- **High Valid Coverage inside `148_D_083` Swath**: Western and central-western sections including **An Giang** (western/central), **Kiên Giang**, and western **Cần Thơ**.
- **Partial / Edge Swath**: Central **Đồng Tháp**, **Hậu Giang**, and **Sóc Trăng** lie near the eastern swath boundary of Track 148 Frame 083.
- **Covered by Adjacent Orbit Tracks (`Track 075`, `Track 082`, `Track 002`)**: Eastern provinces (**Long An**, **Tiền Giang**, **Bến Tre**, **Vĩnh Long**, **Trà Vinh**) are covered by adjacent tracks in our 29-granule NASA CMR inventory (`data/work/discovery.json`).

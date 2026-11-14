# Scientific and Operational Limitations

> **Status: VERIFIED IMPLEMENTATION — Team 4/K (NASA Space Apps Challenge 2026, Hanoi, Vietnam).**

Scientific rigor requires explicit honesty about what satellite radar can and cannot prove. **NISAR ChangeLens** is an exploratory, educational, and transparent surface-anomaly screening tool—not an emergency-response alert system or automated flood classifier. All users, researchers, and hackathon judges should interpret outputs within the following physical and system boundaries.

---

## 1. Physical & Remote Sensing Limitations

### A. Data Maturity & Product Evolution
- **Mission Operations & Collection Status:** NISAR products available through NASA ASF DAAC carry either `VALIDATED` (`NISAR_L2_GCOV_V1`) or `PROVISIONAL` (`NISAR_L2_GCOV_PROVISIONAL_V1`) collection status and distinct processing CRIDs (for example `P05036` vs `P05023`).
- **Gate Enforcement:** All 10 automated compatibility gates (`pipeline/gates.py`) enforce collection maturity, matching CRID, matching processing version, and matching orbit/grid parameters before subtraction is permitted. The `18` `PROVISIONAL` granules in the `29`-granule regional inventory remain catalog-only (`Candidate`) and are blocked from verified pixel comparison by Gate 1.

### B. SAR Speckle Noise
- **Multiplicative Phenomenon:** Coherent SAR imagery exhibits multiplicative granular noise (speckle) within resolution cells.
- **Filtering Trade-Off:** The verified pipeline applies a validity-aware $5\times 5$ normalized boxcar filter (`normalized_boxcar_5x5`) directly in linear calibrated power (`HHHH`) before converting to logarithmic decibels ($\gamma^0_{\text{dB}} = 10\log_{10}(\overline{P}_{5\times 5})$). While this increases the effective spatial smoothing support and suppresses single-pixel variance, subtle speckle residual remains, so isolated pixels must never be interpreted as physical events.

### C. Radar Signal Ambiguity (Wind, Water, & Vegetation)
- **Specular Reflection vs. Roughness:** Open, calm surface water tends to reflect radar energy away from the sensor, producing low backscatter ($\Delta\gamma^0_{\text{dB}} \le -3\text{ dB}$).
- **Wind Roughening:** Wind-driven capillary and gravity waves roughen open water surfaces, elevating backscatter and mimicking vegetated or dry land surfaces.
- **Vegetation Canopy & Double-Bounce:** L-band ($\sim 24\text{ cm}$ wavelength) pulses partially penetrate sparse/moderate canopies and interact with woody stems and floodwater beneath vegetation. Emergent crops or flooded orchards can trigger strong trunk/stem–water corner-reflector **double-bounce**, raising backscatter ($\Delta\gamma^0_{\text{dB}} \ge +3\text{ dB}$) instead of decreasing it. Conversely, dense forests still attenuate signals, so L-band does **not** grant universal optical-like sub-canopy transparency.
- **Soil Moisture & Agricultural Cycles:** Irrigation, drainage, tillage, planting, harvest, and soil moisture swings all shift L-band $\gamma^0$ without surface inundation. Therefore, $\Delta\gamma^0_{\text{dB}}$ alone cannot distinguish open inundation from agricultural phenology or moisture shifts without independent auxiliary evidence.

### D. Observation Time Windows & Repeat Cycle
- **Temporal Sampling:** NISAR repeats the same exact orbit track and frame on a **12-day repeat cycle**. The verified An Giang comparison contrasts two discrete overpasses: `2026-10-22` (`11:31:40 UTC`, Cycle 33) and `2026-11-03` (`11:31:37 UTC`, Cycle 34) on Descending Track `148`, Frame `083`.
- **Short-Lived Events:** Flash flooding, diurnal tidal pulses, or rapid sluice-gate pumping occurring and receding between 12-day overpasses are not captured. Observed shifts measure only the net radiometric state difference between those two exact timestamps.

---

## 2. Data Processing & Architectural Limitations

### A. Display Representation vs. Native Analysis Grid
- **Static Georeferenced Overlays:** To remain 100% static, server-free, and fast on low-bandwidth mobile/web connections, the offline pipeline renders pre-verified **georeferenced RGBA PNG rasters** in `EPSG:4326` (`1105 × 1094` native grid window mapped cleanly via MapLibre GL JS `image` sources) alongside quantitative GeoTIFF derivatives (`EPSG:32648`, `10 m × 10 m` grid posting). **ChangeLens does not serve hosted multi-zoom XYZ raster tile pyramids.**
- **Resolution Distinction:** `10 m × 10 m` GCOV grid posting must not be conflated with effective multilooked radiometric resolution (~20–30 m depending on mode and `numberOfLooks`; mean looks $\approx 5.18$ in the verified An Giang pair). Furthermore, rendered PNG pixel colors are visual representations—never raw numeric radiometric look-up tables.

### B. Absence of Synchronized Ground Truth & Auxiliary Sensors
- **Unintegrated Evidence:** No synchronized in-situ hydrological station water levels, Sentinel-2 optical NDWI composites, Sentinel-1 C-band cross-checks, or high-resolution LiDAR/SRTM local incidence terrain corrections were integrated during this release.
- **No Fabricated Accuracy Scores:** Because synchronized field truth is unavailable, NISAR ChangeLens **asserts zero classification accuracy metrics (e.g., no synthetic F1/IoU or "95% flood confidence")**. Fabricating uncalibrated confidence numbers violates scientific integrity.

### C. Screening Tool — Not an Operational Flood Warning System
- **Standardized Labeling:** All change displays strictly use neutral observational language (**"Potential Surface Change"** / $\Delta\gamma^0_{\text{dB}}$ backscatter change), never binary flood extent claims.
- **Safety Boundary:** The tool must **not** be used for life-safety disaster dispatch, evacuation routing, or parametric insurance adjudication.

---

## 3. Five-State Evidence Discipline & 3-Level Interpretation Guardrail

Every observation, statistic, and hypothesis shown in ChangeLens follows both our **5 Evidence States** (`Verified`, `Computed`, `Candidate`, `Inferred`, `Unavailable`) and the **3-Level Interpretation Hierarchy**:

| Level | Evidence State Mapping | Meaning & Verification Standard |
| :--- | :--- | :--- |
| **Level 1: Observed Radar Change** | `Verified` / `Computed` | Directly verified acquisition/mask/grid checks plus deterministic $5\times 5$ calibrated backscatter shifts ($\Delta\gamma^0_{\text{dB}} = \text{After}_{\text{dB}} - \text{Before}_{\text{dB}}$) on jointly valid pixels. |
| **Level 2: Hypothesized Surface Phenomenon** | `Inferred` | Physical radar scattering mechanisms plausibly consistent with the $\Delta\gamma^0_{\text{dB}}$ shift (specular open water, double-bounce emergent crops, soil moisture, tillage/harvest), accompanied by explicit alternative hypotheses. |
| **Level 3: Supported Conclusion** | `Unavailable` *(until external evidence is supplied)* | Real-world confirmation requires independent optical imagery (NDWI), field observations, hydrometric gauge data, `HVHV` polarization ratios, and local incidence terrain normalization—currently **Unavailable** inside this prototype. |

---

## 4. Strict Geographic Domain Governance

- **Mekong Delta Boundary (`ĐBSCL`):** Regional catalog discovery (`data/work/discovery.json`) spans all 13 Mekong Delta provinces using `geoBoundaries` ADM1 geometry (`frontend/public/data/v1/mekong_provinces.geojson` & `mekong_boundary.geojson`).
- **Off-Swath Diagnostic Proof:** A coarse north-up CMR bounding box does **not** guarantee valid radar data inside a tilted SAR swath. When ChangeLens extracted the Đồng Tháp Mười diagnostic window (`[105.45, 10.60, 105.55, 10.70]`), all `1,212,165` pixels (`121.22 km²`) returned `mask = 255` and `HHHH = NaN`, proving `0.00%` valid radar coverage because the window sits just east of the tilted Descending Track `148` swath edge—not because the ground was unchanged.

---

## 5. Verified Scope Limitations in Current Release

1. **Single Verified Window vs. Regional Catalog:**
   - **Tier 4 (Verified Pair Comparison):** Strictly the **An Giang Screening Window (`[104.95, 10.45, 105.05, 10.55]`, `120.77 km²` jointly valid)** comparing `2026-10-22` (`G4404304390-ASF`) and `2026-11-03` (`G4410154671-ASF`).
   - **Tier 3 (Mask-Only Diagnostic):** **Đồng Tháp Diagnostic Window (`[105.45, 10.60, 105.55, 10.70]`)**, verified as `0.00%` valid off-swath (`100% mask = 255`) and blocked fail-closed at Gates 9–10.
   - **Tiers 1–2 (`Candidate` Catalog Only):** The remaining `11` provinces and `27` discovered CMR granules are catalog/footprint candidates pending bounded HDF5 subset extraction.
2. **Co-Polarized (`HHHH`) Focus:**
   - Verified quantitative maps analyze calibrated Frequency A `HHHH` (`mean_looks = 5.18`). `HVHV` cross-pol decomposition (`HH/HV` ratio) is identified in [`docs/NISAR_RELEVANCE.md`](NISAR_RELEVANCE.md) as a high-value future upgrade (requiring additional byte budget) rather than an active layer in the current build.
3. **Documented Quantitative Sensitivity & QA Notes (`W-1` & `W-2` in [`docs/FINAL_SCIENTIFIC_QA.md`](FINAL_SCIENTIFIC_QA.md)):**
   - **Per-Date vs. Joint-Mask Boxcar Support (`W-1`):** Along the `1,019` jointly valid pixels (`0.084%` of the AOI) adjacent to the `86` single-date invalid (`mask = 0`) radar-shadow pixels around Núi Tô hill, normalizing each date over its own valid neighborhood before applying `joint_valid` shifts $\pm 3.0\text{ dB}$ class areas by at most `0.01 km²` (`0.28 / 116.12 / 4.38 km²` vs. `0.29 / 116.09 / 4.39 km²`) and alters $\Delta\gamma^0_{\text{dB}}$ mean (`+0.417 dB`) and median (`+0.240 dB`) by `0.000 dB`.
   - **Jensen's Inequality in Raw vs. Smoothed dB Means (`W-2`):** Raw single-pixel dB means (`-9.793 dB` on Oct 22; `-9.317 dB` on Nov 03 in `granules_verified[].mean_db`) are ~`1.05 dB` lower than $5\times 5$ boxcar-smoothed dB means (`-8.742 dB` on Oct 22; `-8.325 dB` on Nov 03) because $10\log_{10}(\cdot)$ is strictly concave under Rayleigh speckle fluctuations. Both metrics are labeled unambiguously.

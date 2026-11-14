# Scientific and Operational Limitations

> **Status: IMPLEMENTATION (NASA Space Apps 2026, started 14 Nov 2026 00:00 ICT; authorized by project owner Trung).**

Scientific rigor requires explicit honesty about what satellite radar can and cannot prove. NISAR ChangeLens is an exploratory and educational scientific tool, not an emergency response or automated operational flood alert system. All users, researchers, and hackathon judges should interpret results within the following physical and system limitations.

---

## 1. Physical & Remote Sensing Limitations

### A. Data Maturity & Product Evolution
- **Mission Checkout Phase:** NISAR was launched recently and is in its active commissioning/checkout phase. Products available through ASF DAAC may carry `PROVISIONAL` or `VALIDATED` collection status, or early processing CRID versions (e.g., P05023 vs P05036).
- **Gate Enforcement:** When processing pairs, if granules have differing CRID levels or processing calibrations, cross-comparison is physically invalid and blocked by Gate 1 & 2. Fallback pairs operating under `PROVISIONAL` status are explicitly badged as such on the user interface and in metadata manifests.

### B. SAR Speckle Noise
- **Multiplicative Phenomenon:** Radar imagery exhibits inherent granular noise (speckle) caused by constructive and destructive interference of coherent backscatter waves within a resolution cell.
- **Filtering Trade-off:** While spatial filtering (such as a 5×5 boxcar or median window) is applied to suppress speckle before computing backscatter differences, subtle spatial variance remains. Single-pixel spikes must never be interpreted as localized physical surface changes.

### C. Radar Signal Ambiguity (Wind, Water, & Vegetation)
- **Specular Reflection vs Roughness:** Open, calm water acts as a specular reflector, bouncing radar energy away from the sensor and yielding low backscatter (dark pixels, $\Delta\text{dB} \le -3$).
- **Wind Roughening:** High surface winds create capillary and gravity waves that increase surface roughness, drastically raising backscatter from open water bodies and potentially mimicking land surfaces.
- **Vegetation Canopy & Double-Bounce:** Dense tree canopies scatter L-band microwave pulses differently depending on structure and water levels beneath the foliage. Inundated forests or flooded orchards can produce strong "double-bounce" reflections (trunk-water corner reflector effect), resulting in an *increase* in backscatter ($\Delta\text{dB} \ge +3$) rather than a decrease.
- **Soil Moisture & Crop Cycles:** Tillage, crop growth cycles, and severe soil moisture changes also cause backscatter shifts without surface inundation. Consequently, radar backscatter differencing alone cannot distinguish between new open water, wet mud, or harvested vegetation without independent corroborated evidence.

### D. Observation Time Windows & Repeat Cycle
- **Temporal Resolution:** NISAR's exact orbit repeat interval is 12 days. The available observation baseline (e.g., Track 155, 10 Oct 2026 to 22 Oct 2026) represents two snapshot acquisitions.
- **Short-Lived Events:** Flash floods, diurnal tidal surges, or rapid reservoir gate operations that occur and recede within the 12-day repeat cycle are missed entirely. Changes observed represent the net difference between the two specific overpass moments.

---

## 2. Data Processing & Architectural Limitations

### A. Display Downsampling & Spatial Resolution
- **Display Pyramid:** To enable instantaneous, responsive web visualization on client devices without requiring high-performance GIS workstations or backend servers, full-resolution SAR rasters are downsampled and converted into standard web tiles (XYZ in EPSG:3857) or bounded PNG layers (processing grid $\le 2048 \times 2048$).
- **Resolution Distinction:** Web display pixel dimensions (~15 m to ~30 m depending on zoom level) must not be confused with native SAR slant-range or single-look complex spatial resolution.

### B. Lack of Synchronized Ground Truth
- **In-Situ Gaps:** No live telemetry from hydrometric stations, water level gauges, or synchronized ground-based hydrological sensors within Dong Thap Muoi or across the broader Mekong Delta was ingested during the hackathon timeline.
- **Absence of Validation Metrics:** Because synchronized ground truth was unavailable, no statistical accuracy percentage (e.g., "95% accuracy") or synthetic confidence score is asserted. Creating artificial confidence scores without ground truth violates scientific integrity.

### C. Not an Operational Flood Detection System
- **Intended Scope:** The platform provides observational exploration and hypotheses of surface dynamics under the standardized banner: **"Potential Surface Change"**.
- **Safety Precaution:** It must **not** be used for life-critical disaster dispatch, civic evacuation planning, or regulatory insurance assessments.

---

## 3. The 3-Level Interpretation Guardrail

To prevent over-claiming and misinterpretation, all outputs adhere to a strict 3-tier interpretation hierarchy:

| Level | Classification | Meaning / Rule |
|---|---|---|
| **Level 1** | **Observed Radar Change** | The physical measurement: calibrated backscatter difference ($\Delta\text{dB} = \text{after} - \text{before}$), polarization (HHHH), acquisition dates, and orbit geometry. |
| **Level 2** | **Hypothesized Surface Phenomenon** | A plausible scientific hypothesis: e.g., "Significant backscatter decrease ($\Delta\text{dB} \le -3\,\text{dB}$) consistent with potential new open surface water or soil saturation." |
| **Level 3** | **Supported Conclusion** | A confirmed physical event: asserted **only** when corroborated by independent external evidence (e.g., optical cloud-free imagery, gauge records, local official reports). In the absence of external evidence, Level 3 conclusions are explicitly withheld.

---

## 4. Geographic Boundary Strictness

- **Scope:** The system strictly restricts analysis to the Vietnamese Mekong Delta (Đồng bằng sông Cửu Long - ĐBSCL), with focused exploration on the Dong Thap Muoi wetland region.
- **Masking:** All data layers are clipped to the official ĐBSCL geographic boundary; any raster pixels outside the administrative boundary are masked out to maintain geographic focus and prevent out-of-domain extrapolation.


---

## 9. Verified Scope Limitations in Current MVP Release (2026-11-14)

1. **Single Verified Window vs Regional Catalog**:
   - Full 10-gate HDF5 raster extraction (`mask`, `HHHH`, `numberOfLooks`) is verified for the **An Giang Screening Window (`[104.95, 10.45, 105.05, 10.55]`, `120.77 km²` valid)** and diagnostically verified as off-swath (`0%` valid, `mask = 255`) for the **Đồng Tháp Mười Pilot Bbox (`[105.45, 10.60, 105.55, 10.70]`)**.
   - Other Mekong Delta provinces and the remaining 27 discovered CMR granules are presented at **Tier 1 (Catalog Discovery)** and **Tier 2 (Footprint Intersection)** until bounded HDF5 subset extraction is run for those windows.
2. **Co-Pol (`HHHH`) Primary Focus**:
   - The current comparison processes calibrated Frequency A `HHHH` covariance (`mean_looks = 5.18`). Adding cross-polarized `HVHV` and polarimetric decomposition ratios (`HH/HV`) will further improve separation between open-water specular reflection and emergent vegetation double-bounce.
3. **No Unverified Flood Claims**:
   - All outputs are reported strictly as calibrated radar backscatter ($\gamma^0\text{ dB}$) and signed log-ratio backscatter difference ($\Delta\gamma^0\text{ dB}$), never as binary flood extent maps.
4. **Independent Scientific QA Notes (`W-1` & `W-2`, documented in `docs/FINAL_SCIENTIFIC_QA.md`)**:
   - **Per-Date vs Joint-Mask Boxcar Support (`W-1`)**: Because `normalized_boxcar_5x5` normalizes each date over its own valid mask before applying `joint_valid`, the `1,019` jointly valid pixels (`0.084%` of the window) adjacent to the `86` date-asymmetric `mask = 0` radar-shadow pixels on Núi Tô hill average over $N$ vs $N-1$ neighbors. Recomputing with `joint_valid` passed directly into both boxcar calls changes the $\pm 3.0\text{ dB}$ class areas by at most `0.01 km²` (`0.28 / 116.12 / 4.38 km²` vs `0.29 / 116.09 / 4.39 km²`) and changes $\Delta\gamma^0_{\text{dB}}$ mean (`+0.417 dB`) and median (`+0.240 dB`) by `0.000 dB`.
   - **Jensen's Inequality in Raw vs Smoothed dB Means (`W-2`)**: Raw unsmoothed pixel means in dB (`-9.793 dB` on Oct 22; `-9.317 dB` on Nov 03) are ~`1.05 dB` lower than $5\times 5$ boxcar-smoothed dB means (`-8.742 dB` on Oct 22; `-8.325 dB` on Nov 03) because $10\log_{10}(\cdot)$ is strictly concave on $(0, \infty)$. Both sets of figures are explicitly documented.

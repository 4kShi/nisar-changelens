# NASA-ISRO NISAR Mission & Product Relevance (`NISAR_RELEVANCE.md`)

**Project**: NISAR ChangeLens (*"See Change. Understand Earth."*)  
**Team**: `4/K` (NASA Space Apps Challenge 2026 — *Dancing with the SARs*, Hanoi)  
**Primary Dataset**: NASA-ISRO SAR Validated Level-2 Geocoded Covariance (`NISAR_L2_GCOV_V1`) via ASF DAAC

---

## 1. Why NISAR L-Band `L2 GCOV` Fits Mekong Delta Screening Physics

The NASA-ISRO **NISAR** mission (`L-band`, $\lambda \approx 24\text{ cm}$, `12-day` exact repeat orbit) addresses structural bottlenecks in tropical agricultural and floodplain monitoring across Vietnam's Mekong Delta:

1. **All-Weather Cloud Penetration:** L-band microwaves propagate cleanly through thick monsoon cloud layers that routinely obscure optical missions (`Sentinel-2`, `Landsat`) between May and November.
2. **Long-Wavelength Crop & Emergent-Stem Interaction:** At $\sim 24\text{ cm}$ wavelength (roughly `4×` longer than C-band `5.6 cm`), L-band energy experiences reduced volume scattering in sparse-to-moderate rice/herbaceous stems compared with shorter wavelengths—making trunk/stem–water **double-bounce** enhancements ($\Delta\gamma^0_{\text{dB}} \ge +3\text{ dB}$) and calm open-water **specular reflection** ($\Delta\gamma^0_{\text{dB}} \le -3\text{ dB}$) prominent diagnostic signals across delta paddies. *(Note: Dense tree canopies still attenuate L-band backscatter; ChangeLens never claims universal sub-canopy penetration.)*
3. **Radiometric Terrain-Corrected Geocoded Covariance (`L2 GCOV`):** Rather than raw uncalibrated Level-1 slant-range imagery, `NISAR_L2_GCOV_V1` provides **gamma-nought ($\gamma^0$) RTC linear covariance power** projected onto UTM (`EPSG:32648`, `10 m × 10 m` grid posting), enabling valid linear spatial speckle filtering prior to repeat-pass decibel differencing when orbit geometry and processing CRIDs match.

---

## 2. Specific NISAR Structural Realities Exposed by ChangeLens

Working directly with real HDF5 `NISAR_L2_GCOV_V1` files revealed critical nuances rarely shown in hackathon mockups:

- **Tilted Swaths vs. North-Up CMR Bounding Boxes:** A single Descending Track `148` Frame `083` GCOV granule spans `~5.8–6.5 GB` with `~37%` of its UTM rectangle filled with `mask = 255` / `NaN` corners outside the tilted ground swath. Selecting `[105.45, 10.60, 105.55, 10.70]` in **Đồng Tháp** intersects the CMR catalog footprint yet yields **`0` valid pixels out of `1,212,165`**, whereas neighboring **An Giang** (`[104.95, 10.45, 105.05, 10.55]`) lies cleanly inside the swath (`99.9065%` valid).
- **Commissioning & Maturity Governance (`V1` vs. `PROVISIONAL`):** Mekong CMR searches return `11` `NISAR_L2_GCOV_V1` granules and `18` `NISAR_L2_GCOV_PROVISIONAL_V1` granules across multiple CRIDs (`P05023`, `P05036`) and `6` relative tracks (`148, 075, 002, 155, 082, 009`). Gate 1 & Gate 7 explicitly separate catalog candidates from same-CRID `VALIDATED` pairs.

---

## 3. NISAR Mission Capability vs. ChangeLens Prototype Scope Matrix

| Dimension | Full NASA-ISRO NISAR Mission Capability | Implemented NISAR ChangeLens Prototype Scope | Verification State |
| :--- | :--- | :--- | :--- |
| **Frequencies & Bands** | Dual-frequency `L-band` (NASA, `24 cm`) + `S-band` (ISRO, `9.4 cm`) radar payload | `L-band frequencyA` (`20 MHz` mode) from `NISAR_L2_GCOV_V1` | `Verified` |
| **Polarizations Available** | Full/dual/quad-pol covariance (`HHHH`, `HVHV`, `VVVV`, cross-terms) | Co-polarized diagonal power **`HHHH`** analyzed quantitatively; `HVHV` identified in roadmap as next expansion slice | `Computed` (`HHHH`) / `Unavailable` (`HVHV`) |
| **Temporal Coverage** | Global continuous 12-day ascending & descending repeat passes | Verified 2-date An Giang pair (`2026-10-22` Cycle 33 $\rightarrow$ `2026-11-03` Cycle 34, Descending Track `148` Frame `083`) + `29` Mekong CMR catalog granules | `Verified` (pair) / `Candidate` (27 remaining) |
| **Spatial Footprint** | Global `~240 km` swath at `10–20 m` GCOV posting | Verified `120.77 km²` An Giang window (`1105 × 1094` px, `10 m` UTM 48N) + verified `0%` Đồng Tháp off-swath guard (`121.22 km²`) | `Verified` |
| **Access Architecture** | Multi-GB HDF5 distribution via Earthdata Cloud / ASF DAAC | Bounded 2-stage resumable HTTP Range reader extracting only `33.81 MB` (`13.53%` of `250 MB` cap) out of `12.23 GB` | `Verified` |
| **Multi-Sensor Comparison** | Synergy with `Sentinel-1` (C-band), `Sentinel-2` optical, hydrological stations | Deliberately limits direct cross-sensor pixel subtraction; cites optical `NDWI` and gauges strictly as external corroboration (**no unsupported claim that NISAR outperforms Sentinel-1 everywhere**) | `Unavailable` (external) |

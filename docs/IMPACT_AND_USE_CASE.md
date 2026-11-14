# Practical Impact & Primary Operational Use Case (`IMPACT_AND_USE_CASE.md`)

**Project**: NISAR ChangeLens (*"See Change. Understand Earth."*)  
**Team**: `4/K` (NASA Space Apps Challenge 2026 — *Dancing with the SARs*, Hanoi)  
**Target Region**: Upper Mekong Delta, Vietnam (`An Giang` Verified Window & `Đồng Tháp` Diagnostic Proof)

---

## 1. Selected Primary Use Case: Post-Monsoon Floodplain & Agricultural Surface-Anomaly Screening

Rather than claiming to solve global disaster response with an unverified flood map, **NISAR ChangeLens** commits to one concrete, high-value regional use case:

> **Fast, low-bandwidth, scientifically gated L-band surface-anomaly screening for agricultural and hydrology teams across the Upper Mekong Delta (`Tri Tôn / Cô Tô, An Giang`, `120.77 km²` valid window) between 12-day repeat NISAR overpasses.**

### Why This Problem Matters Concretely
1. **Perpetual Tropical Cloud Cover:** During peak late-monsoon / post-monsoon agricultural transitions in Vietnam's Mekong Delta (October–November), optical satellites (`Sentinel-2`, `Landsat`) are frequently obscured by cloud decks just as dyke gates open, paddy fields drain or re-flood, and alluvial channels shift.
2. **Last-Mile Access Barrier:** Even though `NISAR_L2_GCOV_V1` granules are open data, each HDF5 archive is **`5.78 GB` to `6.45 GB`**, requires Earthdata credentials, contains tilted radar swaths inside coarse north-up bounds (`mask = 255` outside the beam), and needs SAR radiometric calibration discipline before interpretation. Local commune extension officers, provincial irrigation staff, and field researchers lack multi-gigabyte GIS workstations and cannot wait to inspect raw HDF5 covariance cubes.

---

## 2. Target User Matrix & Real Workflow

| User Persona | Concrete Task Using ChangeLens | UI Features Used Today | Honest Boundary Enforced |
| :--- | :--- | :--- | :--- |
| **Provincial Agricultural & Irrigation Planner (An Giang / ĐBSCL)** | Prioritize which paddy clusters or canal zones (`±3.0 dB` zones over `4.39 km²` increase / `0.29 km²` decrease inside the `120.77 km²` Tri Tôn / Cô Tô window) warrant field reconnaissance after a 12-day cycle. | **Explore Mode**, interactive **Before/After Swipe (`2026-10-22` vs `2026-11-03`)**, bilingual **Vietnamese (`VI`)** toggle, and **Screening Receipt (`.md`/`.json`)**. | Uses shifts to target *where to inspect*, never treats `+3.0 dB` or `−3.0 dB` alone as automated crop loss or legal insurance proof. |
| **Hydrological & Remote Sensing Researcher** | Verify whether two repeat-pass granules actually share orbit geometry, CRID (`P05036`), grid alignment (`EPSG:32648`, `10 m`), and valid pixels (`mask`) before downloading multi-GB archives. | **Research & Gates Mode**, **10 Compatibility Gates matrix**, **29-Granule CMR Explorer**, **HTTP Range Byte-Budget ledger (`33.81 MB / 250 MB`)**, and **JSON Receipt** with SHA-256 digests. | Rejects off-swath false coverage cleanly (`Đồng Tháp 0% valid`) rather than wasting bandwidth or calibrating empty fill values. |
| **Environmental Journalist & Community Educator** | Explain clearly to the public how spaceborne L-band radar observes Mekong surface changes through cloud cover without overstating satellite conclusions. | **6-Act Judge/User Guided Tour (`EN | VI`)**, **3-Level Interpretation Guardrail**, and **5 Evidence States** legend. | Displays mandatory disclaimer: **Potential Surface Change $\neq$ Proven Flood Extent**. |

---

## 3. Measurable Operational Value in the Verified Prototype

- **99.7% Bandwidth Reduction (`33.81 MB` vs `12.23 GB`):** Two-stage HTTPS Range extraction retrieves only the spatial mask first (`1.15 MB`) and calibrated `HHHH` + `numberOfLooks` slices second (`32.66 MB`), proving a reproducible screening workflow suitable for constrained regional internet connections.
- **Zero-Backend Static Portability (`6.6 MB` Built Web App):** The compiled static bundle (`frontend/dist/`) runs in any standard browser with zero Earthdata logins, zero cloud GPU servers, and full bilingual `EN | VI` parity.
- **Portability Across Screening AOIs (Via `P0-2` Dynamic Grid Alignment):** Any new subwindow evaluated by `pipeline/gates.py` derives independent X/Y coordinate resolution dynamically rather than hardcoding `20 m` posting.

---

## 4. Explicit Verification Gaps Needed Before Operational Field Deployment

To keep impact claims honest and actionable, the following dependencies remain **Unavailable** in the current hackathon prototype and define the concrete Phase 2 engineering backlog:

1. **Cross-Polarized `HVHV` Covariance & `HH/HV` Ratio:** Required to better separate volume scattering in dense canopy from trunk–water double-bounce.
2. **Co-Temporal Optical & Gauge Integration:** Cloud-free `Sentinel-2`/`Landsat` `NDWI` cross-checks and Mekong River Commission / provincial canal gauge telemetry (`Châu Đốc`, `Tân Châu`, `Tri Tôn`) are necessary to upgrade a **`Level 2 Inferred`** hypothesis into a **`Level 3 Supported Conclusion`**.
3. **Topographic Local Incidence Angle Normalization:** Needed around steep granite outcrops such as **Núi Tô** hill (where 86 single-date `mask = 0` shadow/layover pixels occur in our verified window).
4. **Synchronized Field Crop Calendar & Ground Truth:** Required before any threshold classification accuracy metric (`precision`, `recall`, `F1`) can be scientifically reported.

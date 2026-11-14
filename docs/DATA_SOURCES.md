# Data Sources, Provenance & Attribution Register (`DATA_SOURCES.md`)

**Project**: NISAR ChangeLens (*"See Change. Understand Earth."*)  
**Team**: `4/K`  
**Challenge**: NASA Space Apps Challenge 2026 — *Dancing with the SARs*  
**Audit Date**: 2026-11-14

---

## 1. Master Data Source Attribution Table

The table below audits every external dataset, catalog API, administrative boundary dataset, and basemap service actually integrated into **NISAR ChangeLens**.

| Source | Provider | Exact Dataset/Product | Usage | Official URL | License/Terms | Attribution Requirements |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **NASA-ISRO SAR (NISAR) Validated L2 GCOV** | NASA / ISRO, distributed by Alaska Satellite Facility DAAC (ASF DAAC) | `NISAR_L2_GCOV_V1` (Collection Concept ID: `C3622241360-ASF`; Level-2 Geocoded Polarimetric Covariance, L-band `frequencyA`) | Primary scientific radar dataset: 11 granules discovered in catalog; 2 repeat-pass granules (`G4404304390-ASF` & `G4410154671-ASF`) extracted via bounded HTTP Range requests for the verified An Giang comparison and Đồng Tháp off-swath diagnostic. | https://nisar-docs.asf.alaska.edu/gcov/ | NASA Earth Science Open Data Policy (Public Domain / Unrestricted scientific & educational use; Earthdata Login required for raw HDF5 download) | *"NISAR L2 GCOV V1, NASA/ISRO, distributed by ASF DAAC, accessed 2026-11-14. Not an official NASA/ISRO product."* |
| **NASA-ISRO SAR (NISAR) Provisional L2 GCOV** | NASA / ISRO, distributed by ASF DAAC | `NISAR_L2_GCOV_PROVISIONAL_V1` (Collection Concept ID: `C3929016797-ASF`) | Catalog discovery & footprint inspection only (`18` granules in the 29-granule Mekong Delta inventory in `frontend/src/data/catalogInventory.ts`). Clearly badged as `PROVISIONAL`; blocked from validated pixel comparison by Gate 1. | https://nisar-docs.asf.alaska.edu/earthdata-search/ | NASA Earth Science Open Data Policy | *"NISAR L2 GCOV Provisional V1, NASA/ISRO, distributed by ASF DAAC."* |
| **NASA Common Metadata Repository (CMR)** | NASA Earthdata (`cmr.earthdata.nasa.gov`) | CMR Granule & Collection Search API (`granules.umm_json`) | Used by `pipeline/discover.py` and `earthaccess` to discover the 29 Mekong Delta NISAR granules (`data/work/discovery.json`) and extract tilted swath footprint polygons, orbit tracks, frames, and CRID metadata. | https://cmr.earthdata.nasa.gov/search/site/docs/search/api.html | NASA Open Data / Public API | Cite NASA Earthdata Common Metadata Repository (CMR). |
| **ASF Earthdata Cloud Archive** | NASA Earthdata Cloud / ASF DAAC (`nisar.asf.earthdatacloud.nasa.gov`) | Remote HDF5 granule objects accessed via authenticated HTTPS Range requests (`fsspec` + `h5py`) | Source of the bounded 2-stage HDF5 subwindow extraction (`1,149,959` bytes for Stage 1 mask + `32,662,758` bytes for Stage 2 `HHHH` & `numberOfLooks` = `33,812,717` bytes total). | https://asf.alaska.edu/datasets/daac/nisar/ | NASA Earthdata Login End User License Agreement (no redistribution of private tokens or signed URLs) | Cite ASF DAAC as distributor; never embed `.netrc` credentials or signed S3/CloudFront URLs. |
| **Vietnam & Mekong Delta Administrative Boundaries** | William & Mary geoLab (`geoBoundaries`) | Vietnam ADM1 provincial boundaries clipped to the 13 Mekong Delta provinces (`mekong_provinces.geojson`) and dissolved basin outline (`mekong_boundary.geojson`) | Rendered on the MapLibre map (`frontend/public/data/v1/`) for regional context, province selection, and AOI intersection checks. | https://www.geoboundaries.org/ | **CC BY 4.0** (Creative Commons Attribution 4.0 International) | *"Boundaries: geoBoundaries (Runfola et al., 2020), CC BY 4.0 (www.geoboundaries.org)."* Displayed in map attribution & footer. |
| **Web Basemap Tiles (Esri World Dark Gray Canvas)** | Esri / ArcGIS Online (`server.arcgisonline.com`) | `Canvas/World_Dark_Gray_Base` & `Canvas/World_Dark_Gray_Reference` XYZ raster tiles (`256×256`) | Background reference map layer in `frontend/src/components/MapStage.tsx` (fetched live by the browser when online; app degrades gracefully if offline). | https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer | Esri Master Agreement / ArcGIS Online Basemap Terms of Use | *"Basemap © Esri, HERE, Garmin, OpenStreetMap contributors."* Displayed in MapLibre `AttributionControl` & footer. |

### Clarification on Non-Integrated Auxiliary Datasets
- **Sentinel-1 / Sentinel-2 Optical (NDWI), DEM Terrain Slope, and Hydrological Gauge Data**:
  - These datasets are **NOT integrated** into the application's data files or processing pipeline. They are cited solely in **Section 04 (Level 3 Scientific Interpretation)** and [`docs/LIMITATIONS.md`](LIMITATIONS.md) as the external corroborating evidence that a researcher would need before concluding that an observed L-band backscatter change ($\Delta\gamma^0$) represents surface flooding.

---

## 2. Verified Metadata for the Validated NISAR Pair (An Giang Case Study)

All pixel-level scientific comparison results in **NISAR ChangeLens** derive from the following verified pair of `NISAR_L2_GCOV_V1` granules:

| Attribute | Earlier Acquisition (`Before`) | Later Acquisition (`After`) | Compatibility Verification |
| :--- | :--- | :--- | :--- |
| **Collection Short Name** | `NISAR_L2_GCOV_V1` | `NISAR_L2_GCOV_V1` | Gate 1 **PASS** (Both Validated V1) |
| **CMR Concept ID** | `G4404304390-ASF` | `G4410154671-ASF` | Authentic ASF DAAC concepts |
| **Granule Producer ID** | `NISAR_L2_PR_GCOV_033_148_D_083_4005_DHDH_A_20261022T113140_20261022T113214_P05036_N_F_J_001` | `NISAR_L2_PR_GCOV_034_148_D_083_4005_DHDH_A_20261103T113137_20261103T113215_P05036_N_F_J_001` | 12-day repeat cycle (Cycle 33 $\rightarrow$ Cycle 34) |
| **Acquisition Date & Time (UTC)** | `2026-10-22` (`11:31:40` – `11:32:14 UTC`) | `2026-11-03` (`11:31:37` – `11:32:15 UTC`) | Chronological order verified |
| **Relative Orbit Track & Frame** | Track `148`, Frame `083` | Track `148`, Frame `083` | Gates 3 & 4 **PASS** |
| **Orbit Pass & Look Direction** | `Descending`, `Left`-looking | `Descending`, `Left`-looking | Gates 5 & 6 **PASS** |
| **Frequency & Polarization** | L-band `frequencyA` (`20 MHz`), `DHDH` (`HHHH` analyzed) | L-band `frequencyA` (`20 MHz`), `DHDH` (`HHHH` analyzed) | Gate 2 **PASS** |
| **Processor CRID & Software** | `P05036` (ISCE3 `v1.0.20`) | `P05036` (ISCE3 `v1.0.20`) | Gate 7 **PASS** |
| **Study AOI Bounding Box (WGS84)** | `[104.95, 10.45, 105.05, 10.55]` (An Giang — Tri Tôn / Cô Tô) | `[104.95, 10.45, 105.05, 10.55]` (An Giang — Tri Tôn / Cô Tô) | `120.89 km²` total window (`120.77 km²` jointly valid) |
| **Native Grid & Projection** | `EPSG:32648` (UTM Zone 48N), `10 m × 10 m`, rows `[19962..21067)`, cols `[24469..25563)` (`1105 × 1094`) | `EPSG:32648` (UTM Zone 48N), `10 m × 10 m`, rows `[19962..21067)`, cols `[24469..25563)` (`1105 × 1094`) | Gate 8 **PASS** (Bit-identical coordinate arrays; zero resampling) |
| **Valid Mask Coverage (`0 < mask < 255`)** | `1,207,786 / 1,208,870` pixels (`99.9103%`) | `1,207,780 / 1,208,870` pixels (`99.9098%`) | Gate 9 **PASS**: **`1,207,740` jointly valid pixels (`99.9065%`)** |
| **Radiometric Quality (`HHHH > 0`, `looks > 0`)** | `1,207,786` finite positive pixels; mean looks = `5.1820` | `1,207,780` finite positive pixels; mean looks = `5.1818` | Gate 10 **PASS** |

---

## 3. Four-Tier Distinction of Geographic & Scientific Evidence

**NISAR ChangeLens** strictly prohibits extrapolating local subwindow results to the entire Mekong Delta or treating catalog metadata as validated raster coverage:

| Evidence Tier | Scope in Current Release | What Is Verified | What Is NOT Claimed |
| :--- | :--- | :--- | :--- |
| **Tier 1 — Catalog Discovery** | **29 granules** across the Mekong Delta (`[104.4, 8.5, 106.9, 11.2]`), covering all **13 provinces** (`data/work/discovery.json`). | Granule IDs, concept IDs, timestamps, orbit tracks (`148, 075, 002, 155, 082, 009`), frames, CRIDs, and collection maturity (`11` Validated V1 + `18` Provisional V1). | Does **not** imply that an AOI inside a granule's coarse north-up bounding box contains valid radar pixels. |
| **Tier 2 — Geographic Footprint Intersection** | Any of the 13 Mekong Delta provinces or user-placed custom AOI boxes (`0.10° × 0.10°`) intersecting a granule polygon. | Geometric intersection between the AOI bounding box and the granule's tilted G-ring footprint polygon. | Does **not** verify HDF5 subswath mask values (`mask`) or finite backscatter (`HHHH`). |
| **Tier 3 — Valid Raster Coverage** | Verified for two extracted HDF5 subwindows:<br>1. **An Giang `[104.95, 10.45, 105.05, 10.55]`**: **`99.9065%` valid** (`mask = 1`).<br>2. **Đồng Tháp `[105.45, 10.60, 105.55, 10.70]`**: **`0.00%` valid** (`100% mask = 255` outside the tilted Descending Track 148 swath). | Direct inspection of `/science/LSAR/GCOV/grids/frequencyA/mask` (`0 < mask < 255`). | The Đồng Tháp diagnostic window is rejected fail-closed at Gate 9 & Gate 10; no comparison raster is generated for it. |
| **Tier 4 — Scientifically Comparable Pair** | **Strictly the An Giang Pilot Window (`[104.95, 10.45, 105.05, 10.55]`, `120.77 km²` valid)** between `2026-10-22` (`G4404304390-ASF`) and `2026-11-03` (`G4410154671-ASF`). | Passes all 10 compatibility gates; calibrated $5\times 5$ boxcar $\gamma^0_{\text{dB}}$ and $\Delta\gamma^0_{\text{dB}}$ verified with SHA-256 checksums (`docs/FINAL_SCIENTIFIC_QA.md`). | Results apply **only** to this `120.77 km²` An Giang window—never to all of An Giang Province or all 13 Mekong Delta provinces. |

# API and Artifact Contracts

> **Status: VERIFIED IMPLEMENTATION — Team 4/K (NASA Space Apps Challenge 2026, Hanoi, Vietnam).**

Contract `v1.0` defines the static JSON schemas, compatibility gate structures, and asset integrity rules shared across the Python extraction pipeline (`pipeline/`) and TypeScript frontend (`frontend/src/types/contract.ts`, `frontend/src/data/contract.ts`). Geographic scope covers Vietnam's Mekong Delta (`ĐBSCL`), with verified Tier 4 comparison in An Giang (`[104.95, 10.45, 105.05, 10.55]`) and Tier 3 off-swath diagnostic proof in Đồng Tháp (`[105.45, 10.60, 105.55, 10.70]`).

| Static Artifact / Module | Role in Implemented Release |
| :--- | :--- |
| `frontend/src/data/contract.ts` & `contract.ts` types | Strongly typed Contract `v1.0` catalog & manifest validator (`validateCatalogIntegrity`), exercised continuously in `frontend/src/test/contract.test.ts`. |
| `data/raw/nisar_subsets/angiang_verified_pair_20261022_20261103/verified_pair_manifest.json` | Machine-verifiable Stage 2 extraction manifest recording granule metadata, grid geometry, $5\times 5$ boxcar parameters, calibrated statistics, and **11 SHA-256 digests** (`7` GeoTIFFs + `4` PNGs). |
| `frontend/public/data/verified-angiang/` | Deployed static mirror of `verified_pair_manifest.json` and the 4 georeferenced RGBA PNG overlays rendered by MapLibre GL JS `image` sources. |
| `data/raw/nisar_subsets/angiang_mask_only_.../mask_coverage_manifest.json` & `mekong_bbox_10545_10555_1060_1070_20261114/subset_manifest.json` | Stage 1 mask-only & Đồng Tháp `0%` off-swath diagnostic proof artifacts with byte-budget ledgers. |

---

## Shared Conventions

- **Encoding & Coordinates:** UTF-8 JSON; ISO 8601 UTC timestamps; geographic bounding boxes strictly `[west, south, east, north]` in WGS84 (`EPSG:4326`); projected grids declare CRS (`EPSG:32648`, Rasterio affine `[a, b, c, d, e, f]` with `x = a*col + b*row + c`, `y = d*col + e*row + f`).
- **Unknown vs. Zero:** `null` / `unknown` means unverified or unavailable—**never** an implicit zero or pass.
- **No Credential or Workstation Leakage:** All artifact `href` paths are relative web paths (`data/verified-angiang/*.png`, `data/v1/*.geojson`) or internal repository paths; signed Earthdata URLs, `.netrc` tokens, and private host directories are stripped and prohibited by CI/audit scans.

---

## Observation & Catalog Records

Each granule record captures:
- `collection`: Short name (`NISAR_L2_GCOV_V1` or `NISAR_L2_GCOV_PROVISIONAL_V1`), concept ID (`C3622241360-ASF` / `C3929016797-ASF`), maturity (`VALIDATED` / `PROVISIONAL`).
- `granule`: Concept ID (`G4404304390-ASF`, `G4410154671-ASF`, etc.), producer granule ID, orbit/cycle (`33` $\rightarrow$ `34`).
- `acquisition`: UTC timestamps (`2026-10-22T11:31:40Z`, `2026-11-03T11:31:37Z`), Track `148`, Frame `083`, `Descending`, `Left`-looking.
- `processing`: CRID (`P05036`), software version (`v1.0.20`).
- `measurement`: Frequency (`frequencyA`), polarization (`HHHH` analyzed in Stage 2), physical quantity (`gamma0` linear covariance converted to dB).
- `grid`: `EPSG:32648`, pixel spacing derived dynamically from HDF5 coordinate arrays (`+10.0 m × -10.0 m`), window shape (`1105 × 1094`).
- `validity`: Valid mask predicate `(mask > 0) & (mask < 255)` with explicit finite/positivity checks on `HHHH` and `numberOfLooks` (no silent NaN coercion).

---

## Compatibility Gate Contract & Fail-Closed Pair Handling

- Every gate check in `pipeline/gates.py` (`G01`–`G10`) and `frontend/src/data/study.ts` (`evaluatePairCompatibility`, Gates `1`–`10`) records status/pass outcomes, observed values, evidence references, and remediation guidance fail-closed.
- When a pair fails any blocking gate—such as the Đồng Tháp Diagnostic Window where valid mask coverage = `0.00%` (blocked at UI Gate `9` [`common_valid_mask`] & Gate `10` [`radiometric_validity`]), or a cross-track/cross-maturity mismatch (`PROVISIONAL` vs `VALIDATED`)—the frontend contract disables comparison layers, clears prior swipe overlays, renders an honest unavailable diagnostic state, and blocks misleading subtraction.
- For catalog-only (`Candidate`) regions outside the extracted windows, `comparison.status` remains explicitly `"unavailable"` until Stage 1 and Stage 2 verification succeed.

```json
{
  "schema_version": "1.0",
  "region_id": "dong-thap-diagnostic",
  "comparison": {
    "status": "unavailable",
    "reason": "100% of 1,212,165 extracted pixels in [105.45, 10.60, 105.55, 10.70] are mask = 255 / HHHH = NaN outside the tilted Descending Track 148 swath.",
    "failed_ui_gates": ["common_valid_mask", "radiometric_validity"]
  }
}
```

### UI Gate IDs (`study.ts`) vs. Python Pipeline Gate IDs (`pipeline/gates.py`)
The frontend contract evaluator and the Python HDF5 inspector organize the 10 compatibility checks across complementary abstraction layers with distinct rule identifiers (not 1:1 identical IDs):

| Domain | UI Gate (`frontend/src/data/study.ts`) | Python Pipeline Gate (`pipeline/gates.py`) | Verification Scope |
|---|---|---|---|
| **Validity Mask & NoData** | Gate 9 (`common_valid_mask`) | `G08_mask_nodata` | Requires `(mask > 0) & (mask < 255)` coverage (`≥80%` joint support in UI; mask presence in HDF5). |
| **Radiometric Positivity / Quality** | Gate 10 (`radiometric_validity`) | `G09_radiometric_quality` | Confirms `HHHH > 0` & `numberOfLooks > 0` in extracted windows (`study.ts`) and calibrated covariance quality (`gates.py`). |
| **Grid Alignment & Resolution** | Gate 8 (`grid_alignment`) | `G06_crs_grid_alignment`, `G10_effective_resolution` | Enforces identical CRS + dynamic X/Y spacing (`10 m × 10 m`) and separates posting from multilooked effective resolution. |

---

## Asset Integrity & Interpretation Contracts

- **Georeferenced Image Manifest:** Instead of XYZ/TMS tile pyramids, the web app loads verified `EPSG:4326` RGBA PNGs (`bounds: [104.95, 10.45, 105.05, 10.55]`) listed with exact byte counts and SHA-256 checksums in `verified_pair_manifest.json`. Zero unverified tile-URL templates are claimed.
- **Evidence-Tagged Interpretation:** All analytical summaries enforce **Level 1 (`Verified` / `Computed`)**, **Level 2 (`Inferred` physical scattering hypotheses)**, and **Level 3 (`Unavailable` external corroboration disclosure)** alongside denominator counts (`1,207,740 / 1,208,870` pixels = `99.9065%`). Valid-pixel coverage is strictly a **data-availability metric**, never a fabricated scientific confidence score.

---

## Live Verification Status

Unlike pre-hackathon planning drafts, all contract checks listed above are **actively implemented and verified** via automated tests:
- `frontend/src/test/contract.test.ts` (schema integrity, failed-gate blocking, unavailable region handling, absence of secrets/AI confidence fabrication)
- `tests/pipeline/test_extract_verified_pair.py` & `tests/pipeline/test_gates_dynamic_resolution.py` (dynamic grid spacing, half-pixel offset rejection, 11/11 SHA-256 verification)
- Headless browser QA confirming `0` HTTP `401/403` errors and clean AOI state resets across Explore, Research, EN/VI, and narrow mobile viewports.

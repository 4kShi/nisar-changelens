# Data access design

> **Status: IMPLEMENTATION (NASA Space Apps 2026, started 14 Nov 2026 00:00 ICT; authorized by project owner Trung).**

Implementation phase data access design. Authenticated access via `earthaccess` with `~/.netrc` on developer machine. Geographic scope strictly Mekong Delta (ĐBSCL), prioritizing Dong Thap Muoi.

## Discovery and authentication boundary

Private acquisition → scientific review → approved immutable public release.
Browser visitors receive no NASA credentials, cookies, signed acquisition URLs
or cloud session credentials. Public discovery and authenticated access are
different operations. Future authentication must be configured deliberately in a
private environment, without automatically inspecting local credential stores.
[earthaccess authentication](https://earthaccess.readthedocs.io/en/stable/user/explanation/authenticate/).

Resolve collection identity/version/revision before granules. Prefer documented
validated `NISAR_L2_GCOV_V1`; provisional is a separate collection and explicit
scientific decision. Neither name proves a suitable Mekong pair.
[Collection guide](https://nisar-docs.asf.alaska.edu/earthdata-search/).

| Documented interface | Future purpose |
|---|---|
| `https://cmr.earthdata.nasa.gov/search/collections.umm_json` | Resolve collection concept ID and revision |
| `https://cmr.earthdata.nasa.gov/search/granules.umm_json` | Bounded spatial/temporal candidate search |
| `https://api.daac.asf.alaska.edu/services/search/param` | Alternative ASF query using supported NISAR parameters |
| `earthaccess.search_datasets` / `search_data` | Optional Python wrappers |

Record query, response version, pagination and retrieval time. Candidate results
are not scientific acceptance. Empty versus truncated results have distinct states.
[CMR API](https://cmr.earthdata.nasa.gov/search/site/docs/search/api.html),
[ASF basics](https://docs.asf.alaska.edu/api/basics/),
[ASF keywords](https://docs.asf.alaska.edu/api/keywords/).

## Conditional Harmony route

Planned documentation-supported capability query:
`GET https://harmony.earthdata.nasa.gov/capabilities?shortName=NISAR_L2_GCOV_V1`.
Inspect service capabilities and actual variable/format combinations first.
If supported, use the documented Coverages/EDR interface with a bounded request,
retain job/service identities, poll within a fixed deadline, and copy permitted
results into controlled storage. Staged output URLs are temporary acquisition
links, not public demo URLs. [Harmony docs](https://harmony.earthdata.nasa.gov/docs).

GCOV support is **unknown**, not established by Harmony's general capabilities.
Fallback: supported server subset → demonstrably bounded HDF5 chunk access → stop
and revise access plan. Never automatically fall back to full-granule download.
A small spatial window does not bound bytes: HDF5 chunks, compression and transport
must be verified. [Rasterio windows](https://rasterio.readthedocs.io/en/stable/topics/windowed-rw.html).
If no legitimate pair/access path exists, expose unavailable comparison honestly.

## Proposed project budgets (not provider limits)

| Resource | Initial planning bound |
|---|---|
| Discovery | One AOI/date interval; 20/page, ≤100 candidates |
| Metadata | ≤5 MiB/response |
| Transfer | One active job/transfer; ≤256 MiB per approved pair including retries and metadata |
| Working grid | ≤2048 ×2048 pixels/date, subject to meaningful native sampling |
| Temporary storage | ≤2 GiB including decompression/staging |
| Released demo | Target ≤200 MiB |
| Browser first study | Target ≤25 MiB |

Unknown transfer estimates block measurement retrieval. Enforce streamed byte
limits even without Content-Length; abort a full-file response to a range request.
Do not silently increase limits or alter resolution to bypass science gates.
These bounds require practical validation and may force a smaller AOI.

Metadata: 10-second connect, 30-second read, 90-second total; at most three total
attempts for idempotent reads with bounded exponential jitter/Retry-After. Retry
transient transport, 408/429 and selected 5xx; never automatically retry auth,
invalid queries, missing variables or incompatibility. Do not repeat ambiguous job
creation until reconciling its receipt. Proposed job deadline 15 minutes; stop
polling/report unknown state, cancel only when supported and authorized.

## Future interfaces, without implementations

| Stage | Input → output |
|---|---|
| Inspect | Granule metadata → observation record + missing fields |
| Plan subset | AOI/variables/estimates → bounded request receipt |
| Prepare raster | Approved subset/target grid → measurement, mask, preparation receipt |
| Validate pair | Prepared observations → per-rule pass/fail/unknown evidence |
| Package | Reviewed results/provenance → immutable release manifest/assets |

Keep HDF5 variable identities, quantity/scale and metadata; a browse image is not
a quantitative raster. [ASF access cookbook](https://asfopensarlab.github.io/NISAR_Cookbook/nisar-data-access/).
Scientific rasters retain numeric values, CRS/affine/support. Display tiles record
stretch and visualization reprojection separately. Masks require categorical
resampling; continuous resampling needs scientific justification. Specify COG
compression, tiling, overviews, mask/NoData and resampling explicitly.
[GDAL COG](https://gdal.org/en/stable/drivers/raster/cog.html).

## Cache and provenance

Cache identity binds granule revisions/checksums, AOI, variables, processing
parameters, grid and environment. Proposed metadata freshness 24 hours; private
acquisition cache bounded; released assets immutable with atomic manifest release.
Eviction only targets identified project cache entries; no broad cleanup.
No authentication-bearing URL or secret enters cache keys, manifests or logs.

Record original IDs/citations, query/retrieval times, source/provider checksums
where available, acquired subset hash, subset method/byte receipt, transformations,
masks/parameters, software versions, timestamps and science/rights reviews. A
subset hash is not the checksum of a full source granule.

| Error | Required behavior |
|---|---|
| `NO_OBSERVATIONS` / `SEARCH_TRUNCATED` | Explain search scope / refine query |
| `METADATA_INCOMPLETE` / `PAIR_INCOMPATIBLE` / `GRID_MISMATCH` | Block comparison with reasons |
| `SERVICE_UNSUPPORTED` | Select reviewed bounded alternative or stop |
| `AUTH_REQUIRED` / `ACCESS_DENIED` | Private acquisition issue; never visitor login |
| `TRANSFER_BUDGET_EXCEEDED` | Abort and revise plan |
| `RATE_LIMITED` / `UPSTREAM_UNAVAILABLE` | Bounded retry then explicit failure |
| `CHECKSUM_MISMATCH` | Quarantine project asset; do not publish |
| `RELEASE_INVALID` | Reject comparison; show safe metadata-only state |

Safe public code/explanation only; private diagnostics sanitized. Exact metadata,
collection support, transfer behavior, science grids, redistribution, anonymous
hosting/CORS/ranges remain pending hackathon verification.

# NISAR Access Diagnosis

Updated: 2026-11-14

## Candidate

The candidate remains the validated collection `NISAR_L2_GCOV_V1`, granule
`G4404304390-ASF` (2026-10-22, track 148/frame 83). The bounded test bbox was
105.45–105.55°E, 10.60–10.70°N. The requested variable was only
`/science/LSAR/GCOV/grids/frequencyA/HHHH`.

## Harmony

Capabilities returned HTTP 200 using both collection concept ID
`C3622241360-ASF` and short name `NISAR_L2_GCOV_V1`; v3 reports bbox and
variable subsetting, `nasa/harmony-gdal-adapter`, and GeoTIFF output.
`harmony-py` 1.8.0 was installed only in the existing isolated
`nisar-earthdata` environment. The request object validated and submission
returned job `5ab445af-62eb-4cd9-9599-5709721a7adc`. Harmony job status was
`failed`; its steps report `No matching granules found` at `query-cmr`, with no
output files. The request used one granule, one variable, `forceAsync=true`,
`maxResults=1`, and a unique label. The bbox estimate was conservatively under
250 MB (about 1.2 million pixels at 10 m; one float32 layer is about 4.8 MB
before output overhead).

The selected CMR ID is `G4404304390-ASF` (`meta.concept-id`), while the
granule native ID/GranuleUR is
`NISAR_L2_PR_GCOV_033_148_D_083_4005_DHDH_A_20261022T113140_20261022T113214_P05036_N_F_J_001`.
Direct CMR `concept_id` query returns one record. Harmony's `granuleId` request
was sent the CMR concept ID, yet its `query-cmr` step found no match. The exact
reason is unresolved; no Harmony retry was made.

## Direct ASF access and metadata probe

The exact CMR `GET DATA` URL was checked with an Earthaccess-authenticated
session: HEAD returned HTTP 200 and advertised byte ranges; `Range: bytes=0-1023`
returned HTTP 206 with `Content-Range: bytes 0-1023/5779750912`, and exactly
1024 bytes were read. The first bytes were the HDF5 signature. Thus the CMR
concept ID and catalog `GET DATA` URL are valid and direct authenticated range
access works.

Using `earthaccess.open` on that same exact URL and h5py's file-object driver,
metadata-only inspection read 27,629 bytes from remote ranges (not the full
HDF5). Confirmed Frequency A datasets: HHHH is float32, units `1`, `_FillValue`
NaN, shape 33192×33912; mask is uint8, `_FillValue` 255, with documented
semantics 0=invalid/partially focused, 255=outside acquisition, valid samples
have subswath values; numberOfLooks is float32 with NaN fill. Grid arrays are
in meters and projection dataset value is EPSG:32648. No raster subset was
extracted and no mask values or HHHH pixels were read.

GDAL 3.12.2 still returned HTTP 404 on `/vsicurl` with `GDAL_HTTP_NETRC=YES`,
while the authenticated Earthaccess range request succeeds. This points to a
GDAL authentication/redirect-cookie path difference; its precise cause is not
established. NISAR GCOV files are HDF5, so the official GDAL subdataset driver
is HDF5 rather than NETCDF.

## Bounded subset result

For both dates, the bbox `105.45–105.55°E, 10.60–10.70°N` mapped to the same
verified pixel window, rows `[18298,19405)`, columns `[29937,31032)`, shape
1107×1095. Both products report EPSG:32648, x/y pixel coordinate convention
`center`, and 10 m x / −10 m y spacing. The GeoTIFF transform was derived from
those centers: `[10, 0, 549210, 0, -10, 1182860]` (Rasterio affine ordering).
The uncompacted output estimate was 21,818,970 bytes; total generated files
are about 95 KB, and remote bytes read through the bounded HDF5 reader were
1,369,832 bytes.

The extraction succeeded technically but the selected bbox is outside the
valid radar acquisition swath in both granules: all 1,212,165 pixels have mask
255 (outside acquisition), and HHHH/numberOfLooks are entirely NaN. The six
GeoTIFFs are retained under
`data/raw/nisar_subsets/mekong_bbox_10545_10555_1060_1070_20261114/` as a
reproducible invalid-coverage result. Checksums and per-file metadata are in
that directory's `subset_manifest.json`. These files must not be visualized as
surface observations or analyzed for change. AOI selection needs valid-mask
coverage evidence before any next extraction.

## GDAL fallback

System GDAL 3.12.2 was used for metadata-only `/vsicurl` access to the exact
ASF HDF5 URL, with `GDAL_HTTP_NETRC=YES`, bounded cache settings, and a 20 s
HTTP timeout. It returned HTTP 404. No raster was written and no full HDF5 was
downloaded.

## Status

Remote metadata and a bounded subset for both granules are verified, but the
chosen bbox has zero valid pixels. No change analysis may be run. Next select
a small AOI inside the acquisition-valid swath, then investigate Harmony's
query-CMR selector and GDAL authentication/redirect behavior separately. Do
not represent previous application assets or synthetic fixtures as this
NISAR pair.

## Independent output audit

Tester independently recomputed SHA256 for all six GeoTIFFs; every hash matches `subset_manifest.json`. All rasters are single-band 1107×1095 GeoTIFFs in EPSG:32648 with 10 m x/−10 m y spacing and identical bounds/transform across dates. HHHH and numberOfLooks are float32 with NaN NoData; mask is uint8 with NoData 255. Each mask contains only 255 and both numerical layers contain only NaN: valid observation count is zero for each date. No range or valid-value statistics exist. The files are a genuine bounded extraction but contain no radar observation in the selected box.

The source HDF coordinate arrays use pixel-center coordinates, while GeoTIFF `AREA_OR_POINT=Area` and affine transform encode the raster's corner origin. These are compatible representations; provenance should retain both conventions without describing the affine origin as a pixel center. No change analysis has been performed.

## Atomic range-byte budget fix and mask retry status

A reusable guarded fsspec HTTP range reader was added at
`pipeline/http_range_budget.py`, with offline synthetic coverage in
`tests/pipeline/test_http_range_budget.py`. It reserves each requested range
before dispatch under a shared async lock, serializes concurrency to one,
requires HTTP 206 and exact Content-Range/Content-Length, requests identity
encoding, rejects chunked/unknown/encoded bodies, closes malformed responses
without draining, and charges undecoded response-body bytes yielded by the
response stream before buffering. It releases unused reservation while keeping
consumed bytes charged. Accounting excludes headers, TLS/IP overhead and bytes
buffered below the response stream API.

Local verification: 11 tests passed; `py_compile` passed. Tests include
concurrent reservations, aggregate cap refusal, bad status/range/length,
chunked or encoded responses, truncation, transport errors, body over-read,
and reservation release. No NASA request was made before these checks passed.

After passing tests, one attempt to retrieve only the 2026-11-03 Frequency A
mask for the existing An Giang bbox stopped during Earthdata authentication:
`Network is unreachable` while contacting `urs.earthdata.nasa.gov`. No CMR or
data request followed, no mask was read, and no output directory/file was
created. The November 3 mask and common-valid coverage remain unknown. No
HHHH or numberOfLooks request was made.

## Deadline checkpoint — public discovery (2026-11-14)

Engineer confirmed no Earthdata Login recovery indicator; no URS retry or data
request was made in this checkpoint. An unauthenticated public CMR bounding-box
search returned 12 `NISAR_L2_GCOV_V1` and 18
`NISAR_L2_GCOV_PROVISIONAL_V1` records. The result is only broad-bbox catalog
evidence, not exact Delta polygon intersection or valid-pixel coverage. Other
catalog leads include track 148/frame 084 on 2026-10-22 and 2026-11-03 with a
validated collection assignment, and provisional track 47/frame 083 and 084
repeats on 2026-10-03 and 2026-10-15. No candidate has demonstrated common
valid pixels in a Mekong AOI. Pair status therefore remains **NOT YET VERIFIED**;
authenticated subset access and raster validation remain blocked.

## Connectivity restored and controlled mask attempt (2026-11-14)

This supersedes the earlier URS-unreachable status for the current session:
URS returned HTTP 200 and the isolated Python virtual environment (`python3`)
reported `earthaccess.login(strategy="netrc").authenticated == True`. The
An Giang October 22 mask was not available as a persisted raster. The bounded
mask-only reader was integrated with `HTTPRangeByteBudget` and passed 14 local
tests before one controlled two-granule attempt. It terminated at the 150 s
process deadline before writing a summary or output. Exact response-body bytes
and the stalled stage were not persisted. No HHHH/numberOfLooks read or further
retry was made. The attempt does not establish that the task budget was
exceeded, nor does it establish the final byte count.

## Resumable extractor timeout correction (2026-11-14)

The one controlled An Giang attempt failed before HDF5 access: the first
implementation passed `aiohttp.ClientTimeout` through fsspec's numeric
`sync(timeout=...)`, causing a `TypeError`. Its persistent checkpoint records
0 response-body bytes, 0 range requests, and no outputs; the October 22 catalog
lookup had completed and `earthaccess_open` failed. The checkpoint lock was
released. No second NASA request has been made.

The correction now obtains the already-authenticated Earthaccess HTTPS fsspec
session without exposing its token, performs `fs.info(url, timeout=30)`, and
passes the returned object size to `fs.open` to avoid a second preflight. The
range budget hook is installed before h5py; range reads retain a per-request
`aiohttp.ClientTimeout` inside the shared budget adapter. A local synthetic
stalled-HEAD regression exercises this preflight path and verifies cancellation.
`tests/pipeline`: 38 passed; `py_compile`: passed. This establishes local timeout
plumbing only, not successful access to either NISAR raster. The pair remains
NOT YET VERIFIED; no mask raster or common coverage result exists.

## Final authorized continuation (2026-11-14)

After the local timeout and URL normalization fixes passed review, the same
scope-matched checkpoint was continued once. Authenticated fsspec preflight,
HDF5 open, and group/superblock resolution succeeded. A guarded request for byte
range `[1548536,1548736)` timed out before response headers or body while
resolving October 22 `yCoordinates`. The checkpoint records 44 completed ranges
and 18,020 response-body bytes, one failed 200-byte reservation with zero body
bytes, zero retries, zero in-flight ranges, and a valid checksum. The aggregate
250,000,000-byte cap was not exceeded. There is no complete mask raster or
staging/final output. November 3 mask retrieval, common-valid coverage, HHHH,
numberOfLooks, and change analysis remain unverified; no further request was
made. Local tests now pass 39/39, including timeout cancellation and yarl URL
identity normalization.

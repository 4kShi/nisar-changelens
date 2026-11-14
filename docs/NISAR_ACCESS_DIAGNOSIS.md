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

## Full-grid mask/chunk inventory and bounded scan attempt

Metadata inspection reports a 33192×33912 uint8 mask in both granules, chunked
512×512 with gzip level 9. The HDF5 chunk index reports 4,355 allocated chunks;
stored mask chunk payload sizes are 1,399,714 bytes (2026-10-22) and 1,418,304
bytes (2026-11-03). A chunkwise scan attempt was started for both masks using
paired 512×512 reads, the documented valid predicate `0 < mask < 255`, and a
guarded HTTP range-body cap of 180,000,000 bytes for this attempt. It remained
active without emitting a scan summary and made no observable `/proc` I/O
progress for repeated 20–25 second checks; it was stopped. The in-process
instrumented range-byte counter could not be recovered after stopping. No scan
completion, common-valid pixel count, geographic window, or AOI candidate is
established. This is not evidence that the full granules contain zero
common-valid pixels.

A second attempt used one persistent earthaccess stream per granule, a 32 MiB
HDF5 raw-data chunk cache, sequential 512-row full-width stripes, socket
timeouts, an overall 125-second command deadline, and a guarded 180,000,000-byte
HTTP response-body cap. Both file streams opened, but grid initialization did
not produce a stripe result. The process was stopped after about 112 seconds
without observable I/O progress. Its HTTP response-body counter remained zero;
this does not establish that no bytes were transferred through uninstrumented
setup paths. No mask scan result or candidate area was obtained.

The first attempt's exact HTTP response-body bytes are unavailable, and earlier
metadata inventory network bytes were not metered; therefore aggregate remote
bytes cannot be certified against the 250 MB mission budget. No HHHH or
numberOfLooks full-grid reads were performed, and no new raster outputs were
created. Named Mekong Delta AOIs remain unranked because no geographic
valid-coverage window was identified. The tested bbox remains invalid as
described above. The prior successful bounded extraction measured 1,369,832
bytes through its limited HDF5 reader.

## GDAL fallback

System GDAL 3.12.2 was used for metadata-only `/vsicurl` access to the exact
ASF HDF5 URL, with `GDAL_HTTP_NETRC=YES`, bounded cache settings, and a 20 s
HTTP timeout. It returned HTTP 404. No raster was written and no full HDF5 was
downloaded.

## Status

Remote metadata and a bounded subset for both granules are verified, but the
chosen bbox has zero valid pixels and the attempted full mask scan did not
complete. No full-grid coverage or alternate AOI is established, so no change
analysis may be run. A future scan needs a reliable streaming/progress path
that exposes actual response-body byte counts before coverage can be assessed.
Do not represent previous application assets or synthetic fixtures as this
NISAR pair.


## An Giang candidate mask screen (2026-11-14)

The candidate bbox `[104.95,10.45,105.05,10.55]` is fully inside the project
An Giang ADM1 polygon, but is not a formal Long Xuyen Quadrangle boundary.
For `G4404304390-ASF` (2026-10-22), the hyperslab rows
`[19961,21068)`, columns `[24468,25564)`, shape 1107×1096, had 1,212,188
mask value 1 and 1,084 mask value 0 (99.91% mask-valid). The matching
2026-11-03 mask was not fully read. No common coverage or HHHH/numberOfLooks
validation was performed, and no raster outputs or change analysis were made.

The instrumented response-body counter reached 260,046,848 bytes, exceeding
the configured 250,000,000-byte cap by 10,046,848 bytes because concurrent
range calls raced a non-atomic guard. The next 16,777,216-byte range was
rejected before its body. All remote reads stopped at that point. The guard
must reserve bytes atomically before further retrieval. Detailed evidence is
in `docs/MEKONG_DELTA_VALID_COVERAGE.md` and `data/metadata/candidate_pair_manifest.json`.

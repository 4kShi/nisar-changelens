# Mekong Delta AOI ranking — evidence status

**As of 2026-11-14.** This is a screening record, not a final region ranking. No AOI is approved for scientific analysis from catalog footprints alone.

## Evidence basis

The current catalog inventory contains 11 granules in collection `NISAR_L2_GCOV_V1` and 18 in `NISAR_L2_GCOV_PROVISIONAL_V1` within `[104.4, 8.5, 106.9, 11.2]`, for 2026-10-01 through 2026-11-14. Track 148/frame 083, 2026-10-22 to 2026-11-03, is the strongest currently identified repeat candidate in the validated collection. CMR UMM gives two broad polygons with overlapping coverage, but these are not AOI-specific valid-pixel counts.

The project contains a Mekong regional boundary and province GeoJSON, but the auditor did not find a distinct, sourced Dong Thap Muoi or wetland boundary. The existing attribution note references geoBoundaries CC-BY 4.0 generally, without a dataset release or boundary identifier. Therefore exact site polygon intersections and a defensible full AOI ranking are unavailable at this time.

## Candidate status

| AOI | Exact boundary source/version | Catalog footprint intersection | Compatible pair evidence | Retrieval feasibility | Status |
|---|---|---|---|---|---|
| Dong Thap Muoi | Not verified; project uses approximate bbox only | Approximate bbox overlap reported for track 148/frame 083 | Leading candidate: same collection assignment/release, 12-day repeat; raster compatibility not checked | Small bbox estimated ~29 MB raw for three layers/two dates; Harmony outcome unknown | Candidate only |
| Tram Chim | Not identified in project data | Geographic relation to broad candidate footprint only | Same regional repeat candidate, no exact AOI intersection | Not measured | Unranked |
| Long Xuyen Quadrangle / An Giang | Not identified | Not computed | Not computed | Not estimated | Unranked |
| U Minh Thuong | Not identified | Not computed | Not computed | Not estimated | Unranked |
| Ca Mau | Not identified | Not computed | Not computed | Not estimated | Unranked |
| Other Delta wetlands | Not identified | Not computed | Not computed | Not estimated | Unranked |

## Ranking method required

1. Define each AOI as a versioned polygon with source, identifier, license and attribution. Define Dong Thap Muoi explicitly (e.g. wetland/ecoregion boundary); do not substitute an undocumented rectangle.
2. Search the same validated GCOV collection and time window for the whole Delta.
3. Intersect each exact polygon with each catalog granule footprint; calculate intersection area/fraction in an equal-area CRS or geodesically. Keep bbox screening separate.
4. Form pairs only within compatible collection/maturity/release, track/frame/direction, mode, frequency and polarization; then verify raster grid, masks, incidence geometry and common valid coverage.
5. Estimate exact Harmony variable subsets and rank by AOI coverage, repeat-pair quality, scientific relevance and bounded retrieval feasibility.

## Provisional conclusion

Track 148/frame 083 near the Dong Thap Muoi/Tram Chim vicinity is the lead **pair** in the current inventory, not a final AOI winner. Do not claim the AOI ranking is complete. Keep the entire Mekong Delta as the application’s regional context. A sourced AOI boundary inventory and exact intersection analysis remain required before selecting the detailed study AOI.

## References

- [ASF GCOV guide](https://nisar-docs.asf.alaska.edu/gcov/)
- [ASF Harmony guide](https://nisar-docs.asf.alaska.edu/harmony/)
- [geoBoundaries](https://www.geoboundaries.org/)


## Addendum — An Giang mask screening (2026-11-14)

The compact candidate bbox `[104.95,10.45,105.05,10.55]` is fully contained
by the project An Giang ADM1 polygon. It is not a formal Long Xuyen Quadrangle
or wetland boundary. For the 2026-10-22 track 148/frame 083 granule, the
bounded mask window contained 1,212,188 valid subswath pixels and 1,084
mask-0 pixels (99.91% mask-valid). The 2026-11-03 mask read did not complete,
and no HHHH or numberOfLooks data were read. Thus no common-valid pair coverage
was established; An Giang remains unranked for science use.

The instrumented request bodies reached 260,046,848 bytes, exceeding the
250,000,000-byte cap by 10,046,848 bytes because concurrent range requests
raced a non-atomic guard. No output rasters were created and no further remote
reads were made. See `docs/MEKONG_DELTA_VALID_COVERAGE.md` for the detailed
record.

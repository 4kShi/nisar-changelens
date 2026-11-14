# Scientific Methodology

> **Status: IMPLEMENTATION (NASA Space Apps 2026, started 14 Nov 2026 00:00 ICT; authorized by project owner Trung).**

Status: active implementation. Deterministic radar baseline ($P_{\text{dB}} = 10\log_{10}P$, $\Delta\text{dB} = \text{after}_{\text{dB}} - \text{before}_{\text{dB}}$), 10 automated compatibility gates, and 3-level interpretation hierarchy. Scope is strictly Mekong Delta (ĐBSCL), prioritizing Dong Thap Muoi.

## Evidence and product choice

The lead reviewed the [official ASF GCOV guide](https://nisar-docs.asf.alaska.edu/gcov/) and [Earthdata discovery guide](https://nisar-docs.asf.alaska.edu/earthdata-search/) on 2026-11-13. These support choosing GCOV as a candidate: its diagonal covariance layers describe calibrated, terrain-corrected radar power; off-diagonal layers are complex quantities. The discovery guide distinguishes validated `NISAR_L2_GCOV_V1`, provisional `NISAR_L2_GCOV_PROVISIONAL_V1` and separate beta collections. Collection documentation establishes neither coverage of the study area nor acquisition compatibility.

Prefer validated GCOV. Do not silently substitute provisional or beta products. Any provisional fallback requires a recorded scientific review and prominent maturity limitations. Exclude beta products from the mandatory demonstration unless a separately justified review establishes their suitability.

The linked GCOV product specification Revision F was inaccessible during the lead's review. Exact metadata paths, mask definitions, fill values, scaling and release-specific quality issues remain verification tasks. The following gates are original project design requirements, not a claim that the specification was inspected.

## Compatibility and validity gates

Lead's subsequent documentation update: ASF's [availability guide](https://nisar-docs.asf.alaska.edu/availability-overview/)
reports validated L0–L2 release on 2026-11-06 for L-band acquisitions from
2026-10-21, initially CRID P05036. This short interval may constrain pair choice;
it proves neither target coverage nor a repeat pair. The [known-issues page](https://nisar-docs.asf.alaska.edu/nisar-known-issues/)
records a permanent instrument gap from 2026-07-27T22:03:25Z to
2026-08-10T00:55:27Z, and an incomplete-L0B issue resolved with P05036.
Recheck applicable release notes for actual selected granules. The linked NASA
CRID details page returned 403; no detailed release-difference review is claimed.

Missing mandatory evidence produces `UNKNOWN`, which blocks comparison. Each gate records the observations, evidence reference, outcome, reason and reviewer. A caution never silently overrides a blocking condition.

| Gate | Required future verification | Decision |
|---|---|---|
| Identity and maturity | Authentic NISAR platform; collection/concept/granule identities; product level; maturity; acquisition timestamps; source lineage | Missing identity or maturity blocks; provisional use requires explicit scoped review |
| Processing | Product/schema versions, processor version, CRID, calibration conventions and relevant release notes | Unexplained processing differences block; equal CRID alone does not prove compatibility |
| Measurement | Same compatible real diagonal covariance term, normalization, representation, units, scaling and offsets | Unknown quantity or direct comparison of unlike representations blocks; no blind recalibration of already calibrated data |
| Frequency and polarization | Instrument band, frequency A/B, acquisition mode/bandwidth, actual channel and covariance term | Unknown or incompatible settings block; A/B labels must not be confused with L/S instrument bands |
| Orbit and viewing | Relative track, frame/footprint, ascending/descending direction, look direction, incidence/local-incidence information, orbit quality and relevant geometry | Prefer repeated comparable geometry; unexplained differences block. Same track/frame is insufficient by itself |
| CRS and grid | CRS definition, full affine transform including origin/rotation/sign, pixel-center convention, dimensions, spacing and bounds | Matching CRS alone fails the gate. Analysis pixels must represent the same locations |
| Coverage | AOI intersection and jointly valid spatial support | Empty overlap blocks; partial overlap restricts displayed and interpreted results |
| Masks and values | Authoritative mask semantics, fill values, NaN/infinity, invalid samples and product-specific quality flags | Unknown semantics block; invalid values remain excluded, never zero-filled |
| Radiometric quality | Known release defects, terrain-related limitations, noise effects, number of looks and available quality information | Material unresolved defects block; remaining limitations are displayed |
| Resolution and preparation | Effective resolution versus pixel spacing; any smoothing, resampling or mosaicking and their parameters | Finer posting is not evidence of finer resolution; undocumented preparation blocks |

Different original dimensions or extents can be acceptable when matching subwindows share identical pixel locations. The final analysis arrays, transforms and support must agree. Do not compare arrays merely because their shapes match.

If alignment requires reprojection/resampling, review a target-grid policy first. Preserve native metadata, record interpolation and its effects, and use appropriate categorical handling for masks. Display reprojection must remain separate from quantitative analysis. Do not automatically warp incompatible measurements into apparent scientific compatibility.

## Baseline comparison design

Use one reviewed real diagonal power quantity per comparison. Preserve linear measurements and masks. For strictly positive valid power `P`, a planned representation is:

`P_dB = 10 log10(P)`

The planned signed comparison is:

`ΔdB = P_after,dB − P_before,dB = 10 log10(P_after / P_before)`

Positive values indicate increased radar power; negative values indicate decreased power. The equivalent log-ratio and dB subtraction require matching quantities and valid positive inputs. Do not apply a second logarithm to existing dB values. Do not use the amplitude conversion factor for power. Zero, negative, nonfinite and invalid samples are excluded from logarithmic comparison, with counts and reasons recorded; do not replace them with an arbitrary epsilon.

A change overlay is an exploratory measurement comparison. Any later threshold must have a documented purpose, derivation, sensitivity assessment and independent evaluation where a classification claim is made. No threshold, confidence score or detection accuracy is established now. Before/after displays must share the same quantity, unit and stretch.

## Future workflow pseudocode

```text
accept a bounded AOI and documented discovery query
identify candidate authentic NISAR observations
inspect authoritative metadata, release notes and quality information
record every compatibility gate as PASS, BLOCK or UNKNOWN
if any mandatory gate is BLOCK or UNKNOWN:
    retain inspection evidence; do not produce a comparison
review any required raster preparation and target-grid policy
establish matching analysis locations and jointly valid support
if valid support is empty: stop with an explicit reason
compare the selected compatible quantity only on valid support
document parameters, exclusions, provenance and remaining limitations
review visual legends and scientific wording
release artifacts only after separate publication authorization
```

This is an algorithm specification, not executable processing code.

## Interpretation and uncertainty

Keep three independently labeled levels:

1. **Observed radar change:** a reviewed difference in the specified measurement, dates and valid footprint.
2. **Hypothesized surface phenomenon:** possible water, vegetation, moisture, agricultural or other changes, with alternatives and missing evidence.
3. **Scientifically supported conclusion:** a scoped interpretation requiring appropriate independent contextual evidence, citations and scientific review.

A power decrease alone does not establish flooding. Water, wind, vegetation structure, soil moisture, geometry and processing can complicate interpretation; flooded vegetation can behave differently from open water. Intensity subtraction cannot establish centimetre-scale displacement.

Report uncertainties qualitatively unless a defensible quantitative method is implemented and validated. Record quality exclusions, temporal gaps, spatial support, reference-evidence limitations and processing sensitivity. Do not present valid-pixel coverage as scientific confidence.

## Validation and fallback

During the hackathon, verify metadata interpretation against the authoritative specification and actual products, inspect registration and quality, retain failure examples, and assess sensitivity to justified preparation choices. Environmental classification requires suitable independent dated reference evidence and explicit evaluation scope; distinguish reference uncertainty from model or method error. Never evaluate on invalid pixels or select thresholds using undisclosed evaluation labels.

If no compatible pair exists, document the failed gates and consider a smaller AOI, different dates or another approved NISAR region. If still unavailable, offer observation inspection and an honest unavailable-comparison state. Synthetic imagery, another sensor or model-generated output must never masquerade as a NISAR result.


---

## 9. Empirical Validation Results — An Giang Screening Window (`2026-10-22` vs `2026-11-03`)

Executing our two-stage bounded pipeline (`pipeline/extract_mask_pair.py --execute` followed by `pipeline/extract_verified_pair.py --execute`) on the candidate pair (`G4404304390-ASF` on `2026-10-22` and `G4410154671-ASF` on `2026-11-03`, `NISAR_L2_GCOV_V1`, Track 148, Frame 083, Descending, Left-looking, CRID `P05036` v1.0.20) produced the following verified scientific results for `[104.95, 10.45, 105.05, 10.55]`:

1. **Grid Alignment & Valid Denominator**:
   - Projection: `EPSG:32648`, pixel spacing `dx = +10.0 m`, `dy = -10.0 m`.
   - Window: rows `[19962..21067)`, cols `[24469..25563)`, shape `1105 × 1094` (`1,208,870` total pixels = `120.89 km²`).
   - `2026-10-22` valid pixels (`0 < mask < 255`, `HHHH > 0`, `numberOfLooks > 0`): `1,207,786` (`99.910%`).
   - `2026-11-03` valid pixels (`0 < mask < 255`, `HHHH > 0`, `numberOfLooks > 0`): `1,207,780` (`99.910%`).
   - **Jointly valid pixels**: **`1,207,740` (`99.9065%` = `120.77 km²`)**, with `1,130` pixels (`0.093%`) excluded.
2. **Calibrated Backscatter & Log-Ratio Change ($5\times 5$ Normalized Boxcar)**:
   - $\gamma^0_{\text{HH,dB}} = 10\log_{10}(\overline{P}_{\text{HHHH},5\times 5})$
   - `2026-10-22`: Mean `-8.742 dB`, Median `-7.346 dB`, P05–P95 `[-18.306, -3.744] dB`, Std `4.410 dB`, Mean looks `5.18`.
   - `2026-11-03`: Mean `-8.325 dB`, Median `-7.297 dB`, P05–P95 `[-17.141, -3.715] dB`, Std `3.990 dB`, Mean looks `5.18`.
   - $\Delta\gamma^0_{\text{dB}} = \gamma^0_{\text{2026-11-03,dB}} - \gamma^0_{\text{2026-10-22,dB}}$:
     - Mean: **`+0.417 dB`**, Median: **`+0.240 dB`**, P05–P95: **`[-1.186, +2.663] dB`**, Std: **`1.277 dB`**.
   - Screening classes (`±3.0 dB` threshold):
     - **Strong Decrease ($\le -3.0\text{ dB}$)**: `2,905` pixels (`0.29 km²`, `0.24%`)
     - **Stable ($|\Delta\gamma^0| < 3.0\text{ dB}$)**: `1,160,945` pixels (`116.09 km²`, `96.13%`)
     - **Strong Increase ($\ge +3.0\text{ dB}$)**: `43,890` pixels (`4.39 km²`, `3.63%`)
3. **Independent Final Scientific QA Audit (`docs/FINAL_SCIENTIFIC_QA.md`)**:
   - **Validity-Aware $5\times 5$ Boxcar Verification (`PASS`)**: Confirmed that `normalized_boxcar_5x5` operates on linear $\gamma^0$ power (`HHHH`), zeros invalid pixels in the numerator, and divides by the local valid pixel fraction `uniform_filter(valid, 5)`, achieving zero contamination from `mask = 0` radar-shadow pixels (max deviation $2.38\times 10^{-7}$ vs explicit valid-only patch average).
   - **Boundary Window Support Note (`W-1`)**: Along the `1,019` jointly valid pixels (`0.084%` of the AOI) whose $5\times 5$ window touches one of the `86` single-date invalid (`mask = 0`) pixels around Núi Tô hill, per-date normalization vs joint-mask normalization shifts class areas by at most `0.01 km²` (`0.28 / 116.12 / 4.38 km²` vs `0.29 / 116.09 / 4.39 km²`), with `0.000 dB` effect on $\Delta\gamma^0_{\text{dB}}$ mean (`+0.417 dB`) and median (`+0.240 dB`).
   - **Raw vs Smoothed dB Mean Note (`W-2`)**: Unsmoothed single-pixel dB means (`-9.793 dB` Before, `-9.317 dB` After in `granules_verified[].mean_db`) are ~`1.05 dB` lower than $5\times 5$ boxcar-smoothed dB means (`-8.742 dB` Before, `-8.325 dB` After in `stats`) due to Jensen's inequality ($\mathbb{E}[10\log_{10} P] < 10\log_{10}\mathbb{E}[P]$) under multiplicative speckle reduction.
   - **SHA-256 Output Verification (`PASS`)**: All 11 GeoTIFF and PNG artifacts match `verified_pair_manifest.json` bit-for-bit.

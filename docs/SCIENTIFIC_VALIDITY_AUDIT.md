# Scientific Validity & Verification Audit (`SCIENTIFIC_VALIDITY_AUDIT.md`)

**Project**: NISAR ChangeLens (*"See Change. Understand Earth."*)  
**Team**: `4/K` (NASA Space Apps Challenge 2026 — *Dancing with the SARs*, Hanoi)  
**Audit Basis**: Direct inspection & independent reproduction across `pipeline/gates.py`, `pipeline/extract_verified_pair.py`, `frontend/src/data/study.ts`, `frontend/src/data/receipt.ts`, and `verified_pair_manifest.json`.

---

## 1. Audited Verification Ledger (Core Numbers & Equations)

| Parameter / Check | Audited Source Value | Verification Status | Evidence State |
| :--- | :--- | :--- | :--- |
| **Product Collection & Maturity** | `NISAR_L2_GCOV_V1` (`C3622241360-ASF`), `VALIDATED` | Verified directly in HDF5 & CMR | `Verified` |
| **Verified Pair Granules** | `G4404304390-ASF` (`2026-10-22T11:31:40Z`, Cycle `33`, Orbit `6475`) & `G4410154671-ASF` (`2026-11-03T11:31:37Z`, Cycle `34`, Orbit `6648`) | Verified exact 12-day repeat cycle | `Verified` |
| **Orbit, Look & Processing** | Track `148`, Frame `083`, `Descending`, `Left`-looking, `frequencyA/HHHH` (`20 MHz`), CRID `P05036` (`v1.0.20`) | Gates 1–7 `PASS` (`pipeline/gates.py`) | `Verified` |
| **CRS & Dynamic Pixel Spacing** | `EPSG:32648`, `dx = +10.0 m`, `dy = -10.0 m` derived dynamically from `xCoordinates`/`yCoordinates` (`P0-2` regression tested for `10 m`, `10×20 m`, and `5 m` offset failure) | Gate 8 + `4/4` tests in `test_gates_dynamic_resolution.py` | `Verified` |
| **An Giang Valid Support (`[104.95, 10.45, 105.05, 10.55]`)** | `1,207,740` jointly valid pixels out of `1,208,870` (`99.9065%` = `120.77 km²` of `120.89 km²`); `1,130` px (`0.09%`) excluded | Reproduced bit-for-bit across manifests & GeoTIFFs | `Verified` |
| **Đồng Tháp Off-Swath Diagnostic (`[105.45, 10.60, 105.55, 10.70]`)** | `0` valid pixels out of `1,212,165` (`0.00%`, `100% mask = 255`, `HHHH = NaN`) | Fail-closed rejection at Gates 9–10 | `Verified` (coverage) / `Unavailable` (comparison) |
| **Speckle Filter & Radiometry** | `normalized_boxcar_5x5` in linear `HHHH` power over valid mask (`norm > 0.2`), $\gamma^0_{\text{dB}} = 10\log_{10}(\overline{P}_{5\times 5})$ | Zero NaN/zero leakage (`max_abs_diff = 2.38e-7`) | `Computed` |
| **Calibrated Backscatter Means (`5×5` / Raw)** | Oct 22: `-8.742 dB` smoothed (`-9.793 dB` raw); Nov 03: `-8.325 dB` smoothed (`-9.317 dB` raw); mean looks `5.18` | Jensen's inequality `W-2` documented (`~1.05 dB`) | `Computed` |
| **Signed Log-Ratio Change ($\Delta\gamma^0_{\text{dB}}$)** | Mean `+0.417 dB`, Median `+0.240 dB`, P05–P95 `[-1.186, +2.663] dB`, Std `1.277 dB` | Matches `delta_db.tif` (`np.allclose = True`) | `Computed` |
| **`±3.0 dB` Screening Classes** | Decrease ($\le -3.0$): `0.29 km²` (`2,905` px, `0.24%`); Stable: `116.09 km²` (`1,160,945` px, `96.13%`); Increase ($\ge +3.0$): `4.39 km²` (`43,890` px, `3.63%`) | Sum = `1,207,740` px; boundary `W-1` diff $\le 0.01\text{ km}^2$ | `Computed` |
| **HTTP Range Byte Budget & Checksums** | `1,149,959` + `32,662,758` = `33,812,717` bytes (`13.53%` of `250 MB` cap); `11/11` output SHA-256 digests | Verified against `verified_pair_manifest.json` | `Verified` |

---

## 2. Five-State Epistemic Discipline Audit

Every output in **NISAR ChangeLens** maps strictly to one of five non-interchangeable states:
1. **`Verified`**: Direct pipeline pass/fail inspections, HDF5 coordinate & mask counts (`99.91%` in An Giang, `0.00%` in Đồng Tháp), byte-budget logs, and SHA-256 checksums.
2. **`Computed`**: Deterministic quantitative derivatives calculated solely on verified valid pixels ($\gamma^0_{\text{dB}}$, $\Delta\gamma^0_{\text{dB}}$, quantiles, class pixel/area totals).
3. **`Candidate`**: Genuine NASA CMR granules (`29` total) or geometrically grouped pairs (`22` total) and 11 regional provinces without local HDF5 raster verification.
4. **`Inferred`**: Physical L-band scattering hypotheses triggered by $\Delta\gamma^0_{\text{dB}}$ (calm open-water specular drop $\le -3\text{ dB}$ vs emergent stem–water double-bounce increase $\ge +3\text{ dB}$, moisture, crop tillage/harvest). Explicitly marked as **hypotheses, never flood proof**.
5. **`Unavailable`**: Excluded pixels (`1,130` px in An Giang), `100% mask = 255` off-swath Đồng Tháp comparison, unintegrated `HVHV` cross-pol, `Sentinel-2` optical `NDWI`, MRC/provincial river gauges, DEM local-incidence normalization, and synchronized field ground truth.

---

## 3. Auxiliary & Corroborating Evidence Scope (Strictly External Today)

To verify whether a `+3.0 dB` or `-3.0 dB` L-band signal in Tri Tôn / Cô Tô corresponds to open surface water, emergent flooded rice, dry-season tillage, or harvest, an operational follow-on study must supply:
- Co-temporal **Sentinel-2 / Landsat** optical `NDWI` / `MNDWI` where cloud-free;
- **Cross-polarized `HVHV`** covariance & `HH/HV` ratio from the GCOV archive;
- **In-situ water-level gauge records** (`Châu Đốc`, `Tân Châu`, regional canals);
- **High-resolution DEM** slope/local-incidence checks around granite hills (`Núi Tô`);
- **Field crop-calendar observations**.

Because none of those five datasets were ingested into this prototype, ChangeLens reports **`fabricated_confidence_score: null`** in code, documentation, and exported Screening Receipts.

---

## 4. Top Scientific Judge Questions Audited

- **Why is Đồng Tháp `0.00%` NOT "no surface change"?** Because every pixel in `[105.45, 10.60, 105.55, 10.70]` has `mask = 255` and `HHHH = NaN` outside Descending Track `148`'s tilted right edge. Treating missing swath data as `0 dB` change is a severe remote-sensing error that our Stage 1 mask inspection eliminates.
- **Why does smoothing increase raw mean dB (`-9.793 -> -8.742 dB`) yet leave $\Delta\gamma^0$ unbiased (`+0.417 dB`)?** By Jensen's inequality on concave $f(P) = 10\log_{10} P$, averaging $25$ independent positive Rayleigh speckle looks reduces variance in linear power prior to logging, shifting each single-date log mean up by $\sim +1.05\text{ dB}$ symmetrically; the log-ratio difference ($\text{After}_{\text{dB}} - \text{Before}_{\text{dB}}$) remains invariant (`W-2`).
- **Why was hardcoded `20 m` posting in `pipeline/gates.py` fixed (`P0-2`)?** While verified An Giang granules use `10 m × 10 m` grids (`dx = +10.0 m, dy = -10.0 m`), legacy pre-hackathon helper text in `gates.py` printed `"20m posting"`. `G06_crs_grid_alignment` and `G10_effective_resolution` now compute independent X and Y pixel spacings directly from HDF5 `xCoordinates` and `yCoordinates`, supporting arbitrary uniform grids including non-square postings.

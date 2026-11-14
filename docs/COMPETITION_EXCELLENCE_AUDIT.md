# NISAR ChangeLens — Competition Excellence Audit & Improvement Plan

**Project:** NISAR ChangeLens (*"See Change. Understand Earth."*)  
**Team:** `4/K` (`Phạm Thành Trung`, `Lý Chấn Hưng`)  
**Competition:** NASA Space Apps Challenge 2026 — *Dancing with the SARs*  
**Primary Region:** Mekong Delta, Vietnam (*An Giang* Verified Window & *Đồng Tháp* Off-Swath Diagnostic Window)  
**Primary Dataset:** NASA-ISRO `NISAR_L2_GCOV_V1` (Validated L2 Geocoded Covariance, L-Band Frequency A `HHHH`)  
**Canonical Repository:** `./` (`4K - Dancing with the SARs` · `https://github.com/4kShi/nisar-changelens`)  
**Historical Audit Timestamp:** `2026-11-15T00:36:00+07:00`  
**Current Phase:** **HISTORICAL PRE-PHASE-5 AUDIT (SUPERSEDED)** — All approved Phase 5 implementation tasks and final pre-release checks (`84/84` automated tests: `47` Python + `37` Frontend) have since been completed. Retained strictly as the pre-Phase-5 planning record; see [`FINAL_SUBMISSION_AUDIT.md`](FINAL_SUBMISSION_AUDIT.md) for current release verification status.

> **Historical Record Notice:** The findings, "Awaiting Owner Approval" labels, and pre-Phase-5 risk states (`R-1`–`R-5`, `76/76` test baseline) below describe the repository *prior* to Phase 5 execution and do **not** represent unresolved current blockers.

---

## 1. Executive Summary & Baseline Inspection

An independent, multidisciplinary inspection of the entire **NISAR ChangeLens** repository (`frontend/`, `pipeline/`, `tests/`, `data/`, `docs/`, and root files) was conducted against the five official NASA Space Apps judging criteria (**Impact, Creativity, Validity, Relevance, Presentation**).

### Verified Technical & Scientific Baseline (Preserved Intact)
- **Protected Reference Case Study (An Giang Window `[104.95, 10.45, 105.05, 10.55]`)**:
  - **Dataset**: `NISAR_L2_GCOV_V1` (`C3622241360-ASF`, Validated V1)
  - **Before Acquisition**: `2026-10-22T11:31:40Z` (`G4404304390-ASF`, Cycle 33, Orbit 6475)
  - **After Acquisition**: `2026-11-03T11:31:37Z` (`G4410154671-ASF`, Cycle 34, Orbit 6648)
  - **Geometry & Processor**: Track `148`, Frame `083`, `Descending`, `Left-looking`, Polarization `HHHH`, CRID `P05036` (`v1.0.20`), 12-day repeat interval
  - **Grid & Coverage**: `EPSG:32648` (UTM Zone 48N), `10 m × 10 m` pixel spacing, `1105 × 1094` pixels (`1,208,870` total = `120.89 km²`), **`1,207,740` jointly valid pixels (`99.9065%` = `120.77 km²`)** under `0 < mask < 255`, `HHHH > 0`, `numberOfLooks > 0`
  - **Radiometric Results ($5\times 5$ validity-aware boxcar in linear $\gamma^0$ power)**:
    - $\gamma^0_{\text{dB}} = 10\log_{10}(\overline{\gamma^0}_{5\times 5})$, $\Delta\gamma^0_{\text{dB}} = \gamma^0_{\text{After,dB}} - \gamma^0_{\text{Before,dB}}$
    - Before Mean: `-8.742 dB` (median `-7.346 dB`; unsmoothed pixel mean `-9.793 dB`)
    - After Mean: `-8.325 dB` (median `-7.297 dB`; unsmoothed pixel mean `-9.317 dB`)
    - $\Delta\gamma^0_{\text{dB}}$ Mean: **`+0.417 dB`** (median `+0.240 dB`, std `1.277 dB`, P05–P95 `[-1.186, +2.663] dB`)
    - Reference $\pm 3.0\text{ dB}$ Screening Classes: Strong Decrease ($\le -3.0\text{ dB}$): **`0.29 km²` (`0.24%`)** | Stable ($|\Delta\gamma^0| < 3.0\text{ dB}$): **`116.09 km²` (`96.13%`)** | Strong Increase ($\ge +3.0\text{ dB}$): **`4.39 km²` (`3.63%`)**
- **Diagnostic Fail-Closed Reference (Đồng Tháp Pilot Bbox `[105.45, 10.60, 105.55, 10.70]`)**:
  - Proven via actual HDF5 extraction to contain **`0.00%` valid pixels** (`1,212,165 / 1,212,165` pixels have `mask = 255` off-swath fill and `HHHH = NaN`), demonstrating why coarse CMR bounding-box overlap (`Tier 2`) must never be confused with valid SAR swath coverage (`Tier 3`).
- **Automated Test & Checksum Baseline**:
  - `76 / 76` automated tests passing (`43` Python pipeline tests + `33` frontend Vitest tests), `11 / 11` output GeoTIFF/PNG SHA-256 checksums verified against `verified_pair_manifest.json`.

### Baseline Competition Scorecard (`0.0 – 5.0` Uninflated Scale)

| Judging Criterion | Current Score (0–5) | Core Strength | Primary Vulnerability Holding Score Back |
| :--- | :---: | :--- | :--- |
| **1. Impact** | **3.4 / 5.0** | Real Mekong Delta radar data, zero-login static architecture, full `EN \| VI` bilingual accessibility | No focused primary user/decision workflow in the first 15 seconds; lacks an exportable screening receipt for local analysts; contradictory regional claims across docs |
| **2. Creativity** | **3.9 / 5.0** | 4-Tier Evidence Hierarchy + 10 Compatibility Gates + `33.81 MB` HTTP Range HDF5 byte-budget extractor + `Đồng Tháp 0%` off-swath diagnostic proof | Best technical differentiators (`99.7%` bandwidth savings & off-swath geometric proof) are buried inside `05 Gates` / `Research` mode rather than surfaced in a clear comparative story |
| **3. Validity** | **4.1 / 5.0** | Authentic `NISAR_L2_GCOV_V1` (`P05036`), linear-power $5\times 5$ boxcar, 3-level interpretation guardrail, `W-1`/`W-2` mathematical audit | **Severe doc-vs-app contradiction** in `docs/SUBMISSION.md`, `docs/LIMITATIONS.md`, `docs/SCIENTIFIC_METHODOLOGY.md`, and `pipeline/gates.py` (which still cite obsolete Track 155 / Oct 10 / `P05023` / 20 m posting / XYZ tiles!) |
| **4. Relevance** | **3.8 / 5.0** | Direct end-to-end use of NASA-ISRO NISAR L2 GCOV and 29 NASA CMR granules | Does not clearly articulate *why NISAR's 24 cm L-band wavelength & GCOV $\gamma^0$ terrain-flattened covariance* are physically essential for vegetated Mekong floodplains vs. C-band or optical sensors |
| **5. Presentation** | **3.5 / 5.0** | Polished dark scientific dashboard UI, responsive `1440×900` to `390×844`, instant `EN \| VI` toggle, on-map Before/After Swipe | No interactive **6-Act Guided Demo Tour** in the UI; `docs/SUBMISSION.md` has wrong granules/dates and placeholder URLs; missing dedicated 30s/60s/3m pitch & judge Q&A documents |
| **OVERALL AVERAGE** | **3.74 / 5.00** | Strong scientific and engineering core | Vulnerable to judge deductions on narrative clarity, doc consistency, and immediate problem-to-decision connection |

---

## 2. Five-Criteria Competition Weakness Audit

### Criterion 1: IMPACT (`Current Score: 3.4 / 5.0`)

1. **Current Strengths**:
   - Addresses seasonal surface and agricultural water-management challenges in Vietnam's Mekong Delta (*Đồng bằng sông Cửu Long*) where monsoon cloud cover (`80–90%` during peak flood months) blinds optical satellites.
   - Zero-cost, zero-login static web application paired with a `33.81 MB` bounded HDF5 subsetting pipeline removes the `6 GB per granule` infrastructure barrier for provincial universities, agricultural analysts, and educators.
   - Complete English/Vietnamese (`EN | VI`) interface serves actual local stakeholders in An Giang and Đồng Tháp.
2. **Specific Weaknesses**:
   - **W-IMP-1 (Generic Audience List Instead of One Primary Use Case)**: `README.md:85` and `docs/SUBMISSION.md:18,99` list "citizens, high school students, environmental journalists, researchers, and local planners" without defining a concrete primary operational workflow.
   - **W-IMP-2 (Missing Context on the Oct 22 → Nov 03 An Giang Window)**: The app states that `An Giang [104.95, 10.45, 105.05, 10.55]` is an "agricultural floodplain & granite hillslope" in Tri Tôn / Cô Tô, but never explains the real-world seasonal significance of **late October to early November** in the Upper Mekong Delta (the transition between late *mùa nước nổi* flood recession, in-field water retention, and winter–spring rice preparation around Tri Tôn / Cô Tô) or what decision a local analyst makes when `4.39 km² (3.63%)` of southeastern parcels show $\Delta\gamma^0 \ge +3.0\text{ dB}$.
   - **W-IMP-3 (No Actionable Output / Screening Receipt from the UI)**: After exploring a change map or diagnosing a blocked pair, a user cannot export a structured **Verification & Screening Report** (JSON/Markdown summary with coordinates, pixel counts, gate status, and interpretation limits) to share with field teams.
3. **Why a Judge May Deduct Points**:
   - Impact judges ask: *"Who concretely uses this on Monday morning, what decision does it inform, and what happens after they look at the red and blue pixels?"* Without a focused primary use case and an exportable screening artifact, the app feels like a passive viewer rather than a decision-support screening tool.
4. **Evidence Supporting Assessment**:
   - `frontend/src/App.tsx:489-558` (opens directly into technical tier badges without a 1-sentence human problem statement); `docs/SUBMISSION.md:18,30,176` (claims Dong Thap Muoi wetland tracking while the actual verified window is Tri Tôn / Cô Tô in An Giang).
5. **Highest-Value Improvement**:
   - Define and integrate a sharp primary use case (**Post-Monsoon Floodplain & Agricultural Surface-Anomaly Screening in the Upper Mekong Delta**) in `docs/IMPACT_AND_USE_CASE.md` and in a concise **Problem & Decision Context Card / Guided Story** plus a **1-Click "Export Screening Receipt"** in the UI.
6. **Expected Benefit**: `+0.7 to +0.9` on Impact (`3.4 → 4.2+`).
7. **Implementation Difficulty**: Low–Medium (documentation + lightweight client-side receipt generator and context banner).
8. **Remaining Uncertainty**: No real-world institutional deployment or synchronized in-situ hydrological gauge telemetry exists for the Oct 22 – Nov 03 window; this must be stated transparently as a future validation step.

---

### Criterion 2: CREATIVITY (`Current Score: 3.9 / 5.0`)

1. **Current Strengths**:
   - **4-Tier Evidence Hierarchy (`Catalog → Footprint → Valid Mask → 10-Gate Comparable Pair`)** directly solves one of the most pervasive failure modes in satellite hackathons: mistaking catalog bounding-box overlap for usable imagery.
   - **Empirical Off-Swath Proof (`Đồng Tháp 0% Valid`)**: Proving with real HDF5 bytes that a `121.22 km²` window inside a granule's coarse CMR polygon has `100%` `mask = 255` fill due to tilted orbit track geometry is a standout scientific insight.
   - **Two-Stage Resumable HTTP Range Byte-Budget Architecture**: Extracting `1,208,870` pixels of `mask`, `HHHH`, and `numberOfLooks` from `12.23 GB` of remote HDF5 files using only **`33.81 MB`** (`99.72%` data reduction, `13.53%` of a strict `250 MB` guard) with SHA-256 URL hashing and atomic range checkpoints (`pipeline/http_range_budget.py`, `pipeline/extract_mask_pair.py`, `pipeline/extract_verified_pair.py`).
2. **Specific Weaknesses**:
   - **W-CRE-1 (Core Differentiators Are Hidden Below the Fold)**: In default `Explore` mode, the `33.81 MB vs 12.23 GB` byte-budget breakthrough and the `10 Compatibility Gates` are collapsed at the bottom of the sidebar (`Section 05`). A judge evaluating in `Explore` mode may never realize ChangeLens has a custom HTTP Range HDF5 engine and 10-gate validator.
   - **W-CRE-2 (No Explicit Differentiation Matrix vs. Existing Tools)**: There is no document or UI callout contrasting ChangeLens against standard tools (ESA EO Browser, ASF Vertex, QGIS/SNAP desktop workflows, or black-box AI flood maps).
3. **Why a Judge May Deduct Points**:
   - If judges only see the map and swipe slider in the first 60 seconds, they may categorize ChangeLens as "another before/after satellite viewer" and miss the novel fail-closed gating and byte-budgeted HDF5 architecture.
4. **Evidence Supporting Assessment**:
   - `frontend/src/App.tsx:1537-1609` (`provenance` details element is collapsed by default in `Explore` mode); absence of `docs/CREATIVITY_AND_DIFFERENTIATION.md`.
5. **Highest-Value Improvement**:
   - Create `docs/CREATIVITY_AND_DIFFERENTIATION.md` with an evidence-backed comparison table against 5 existing tool categories, and surface a compact **"Why ChangeLens Is Different" / Guided 6-Act Tour** bar in the UI that highlights the `99.7%` HDF5 bandwidth reduction (`33.81 MB` from `12.2 GB`), the `Đồng Tháp 0%` off-swath proof, and the `10/10` compatibility gates.
6. **Expected Benefit**: `+0.5 to +0.7` on Creativity (`3.9 → 4.5+`).
7. **Implementation Difficulty**: Low.
8. **Remaining Uncertainty**: Live on-demand browser-triggered HDF5 extraction is intentionally offline/CLI-guarded because it requires personal NASA Earthdata credentials (`~/.netrc`).

---

### Criterion 3: VALIDITY (`Current Score: 4.1 / 5.0`)

1. **Current Strengths**:
   - Rigorous radar physics: linear $\gamma^0$ power validity-aware $5\times 5$ boxcar smoothing prior to $10\log_{10}(\cdot)$ conversion (`pipeline/extract_verified_pair.py:334-347`).
   - Explicit mathematical audit in `docs/FINAL_SCIENTIFIC_QA.md` quantifying both boundary-window normalization sensitivity (`W-1`: `0.000 dB` mean/median impact, $\le 0.01\text{ km}^2$ class shift across `1,019` Núi Tô shadow-adjacent pixels) and Jensen's inequality (`W-2`: `~1.05 dB` offset between unsmoothed pixel dB mean and $5\times 5$ linear-power boxcar dB mean).
   - Strict 3-Level Interpretation Hierarchy that blocks unverified flood/drying claims and explains specular reflection ($\Delta\gamma^0 \le -3\text{ dB}$) vs. L-band double-bounce ($\Delta\gamma^0 \ge +3\text{ dB}$).
2. **Specific Weaknesses**:
   - **W-VAL-1 (`P0 CRITICAL` — Documentation Contradicts Verified Baseline)**:
     - `docs/SUBMISSION.md:48-49, 235, 270` claims the project uses **Track 155, Frame 006 (`2026-10-10` & `2026-10-22`, CRID `P05023`, Provisional, Ascending)** over **Đồng Tháp Mười**, uses **TailwindCSS / Lucide Icons / XYZ tiles (`EPSG:3857`)**, and leaves `<!-- RESULTS: GITHUB_REPO_URL -->` unpopulated!
     - `docs/LIMITATIONS.md:26, 34` (and root `LIMITATIONS.md`) still cites `Track 155, 10 Oct 2026 to 22 Oct 2026` and `XYZ in EPSG:3857`.
     - `docs/SCIENTIFIC_METHODOLOGY.md:1-77` (and root `SCIENTIFIC_METHODOLOGY.md`) still contains pre-hackathon text (`"Future workflow pseudocode"`, `"This is an algorithm specification, not executable processing code"`, `"No threshold... is established now"`) that contradicts Section 9 of the same file.
     - `pipeline/gates.py:188, 258, 263, 283-284` hardcodes `"20m posting"` in its reason strings (whereas the verified An Giang grid is `10.0 m × 10.0 m`) and defaults `__main__` to obsolete Track 155 `P05023` filenames.
     - Root duplicate files `DEMO_GUIDE.md` and `TEAM_HANDOFF.md` are tracked in Git and out of sync with `docs/DEMO_GUIDE.md` and `docs/TEAM_HANDOFF.md`.
   - **W-VAL-2 (Map Click Does Not Report Local Radiometric or Evidence Class Details)**: Clicking a point inside the An Giang window only shows coordinates and a static inside/outside string (`App.tsx:1508-1528`), rather than reporting the explicit **Scientific Evidence Classification (`Verified` | `Computed` | `Candidate` | `Inferred` | `Unavailable`)** and window radiometric context.
3. **Why a Judge May Deduct Points**:
   - A technical or scientific judge who opens `docs/SUBMISSION.md` or `docs/SCIENTIFIC_METHODOLOGY.md` and sees Track 155 / Oct 10 / Provisional P05023 / XYZ tiles while the app shows Track 148 / Oct 22–Nov 03 / Validated P05036 will immediately question which dataset was actually processed and deduct heavily for inconsistency.
4. **Evidence Supporting Assessment**:
   - Verified via `grep -rnE "Track 155|Frame 006|2026-10-10|P05023|Tailwind|XYZ|RESULTS:"` across `docs/` and root `*.md` files (`2026-11-15T00:34:27+07:00`).
5. **Highest-Value Improvement**:
   - Eliminate every single doc-vs-code contradiction (`docs/SUBMISSION.md`, `docs/SCIENTIFIC_METHODOLOGY.md`, `docs/LIMITATIONS.md`, `docs/SYSTEM_ARCHITECTURE.md`, `docs/API_CONTRACTS.md`, `pipeline/gates.py`, and root duplicates), produce `docs/SCIENTIFIC_VALIDITY_AUDIT.md` with the 5-state **Scientific Evidence Classification System (`Verified`, `Computed`, `Candidate`, `Inferred`, `Unavailable`)**, and display that explicit Evidence Classification badge in the UI.
6. **Expected Benefit**: `+0.6 to +0.8` on Validity (`4.1 → 4.8+`).
7. **Implementation Difficulty**: Low–Medium.
8. **Remaining Uncertainty**: Cross-polarized `HVHV` and external optical/gauge validation are not bundled in the current `33.81 MB` extraction; they must be classified explicitly as `Unavailable / Future Corroboration` in the evidence matrix.

---

### Criterion 4: RELEVANCE (`Current Score: 3.8 / 5.0`)

1. **Current Strengths**:
   - Built specifically around NASA-ISRO **NISAR L2 GCOV** (`NISAR_L2_GCOV_V1` & `NISAR_L2_GCOV_PROVISIONAL_V1`) distributed by ASF DAAC, using real HDF5 group hierarchies (`/science/LSAR/identification`, `/science/LSAR/GCOV/grids/frequencyA/{HHHH,mask,numberOfLooks,xCoordinates,yCoordinates,projection}`).
   - Incorporates real processor release metadata (`CRID P05036` vs `P05023`), NISAR 12-day exact repeat cycle (`Cycle 33 → Cycle 34`), and subswath validity mask semantics (`0 < mask < 255`).
2. **Specific Weaknesses**:
   - **W-REL-1 (Under-Explained L-Band Physics vs. Generic SAR)**: The UI and pitch do not clearly explain to judges *why NISAR's 24 cm L-band radar* (`1.257 GHz`) behaves fundamentally differently in Mekong Delta rice paddies and wetlands than shorter-wavelength radar (penetrating emergent vegetation canopies to produce strong trunk/stem–water double-bounce returns $\Delta\gamma^0 \ge +3.0\text{ dB}$, which explains why `3.63%` of the An Giang window *increased* in backscatter while only `0.24%` showed open-water specular decrease!).
   - **W-REL-2 (No Explicit Boundary Table Between NISAR Mission Capabilities & ChangeLens Prototype Scope)**: Judges need a clear breakdown of what NISAR provides globally vs. what ChangeLens implements today vs. what NISAR capabilities (`HVHV`, off-diagonal covariance, S-band, InSAR `GUNW`) remain outside the current prototype.
3. **Why a Judge May Deduct Points**:
   - Without connecting the observed `+3.63%` backscatter increase in An Giang directly to **L-band (`24 cm`) canopy penetration and double-bounce physics in agricultural plots**, judges may miss why NISAR is uniquely relevant to this scientific finding.
4. **Evidence Supporting Assessment**:
   - `frontend/src/i18n/translations.ts` and `docs/SUBMISSION.md:178` (where `SUBMISSION.md` wrongly emphasized blue decrease instead of the actual An Giang L-band agricultural backscatter increase pattern).
5. **Highest-Value Improvement**:
   - Create `docs/NISAR_RELEVANCE.md` and enrich the UI's interpretation/tour notes to highlight why NISAR L-band GCOV (`24 cm` wavelength, RTC $\gamma^0$ diagonal covariance, 12-day repeat, `mask` subswath encoding, `CRID` calibration lineage) is essential to the An Giang findings.
6. **Expected Benefit**: `+0.6 to +0.8` on Relevance (`3.8 → 4.5+`).
7. **Implementation Difficulty**: Low.
8. **Remaining Uncertainty**: Official Space Apps 2026 challenge resource tab mapping could not be fetched live during initial offline preparation (`docs/CHALLENGE_COMPLIANCE.md:44`), so all official ASF DAAC / NASA Earthdata GCOV citations are provided in full.

---

### Criterion 5: PRESENTATION (`Current Score: 3.5 / 5.0`)

1. **Current Strengths**:
   - Modern, high-contrast scientific dashboard with verified responsive behavior (`1440×900`, `1280×800`, `1024×768`, `768×1024`, `390×844`), zero console errors, smooth Before/After Swipe, 4 threshold presets, and instant `EN | VI` switching.
2. **Specific Weaknesses**:
   - **W-PRE-1 (No Guided 6-Act Judge Walkthrough Inside the Application)**: A judge opening the app for 90 seconds has no 1-click **"6-Act Guided Demo Tour"** (`Act 1: Problem → Act 2: NISAR Observation → Act 3: Discovery & Off-Swath Proof → Act 4: An Giang Verified Evidence → Act 5: Scientific Responsibility → Act 6: Practical Impact`) that automatically switches the map view, AOI preset, layer, and explanation card step-by-step.
   - **W-PRE-2 (`docs/SUBMISSION.md` Is Outdated and Missing Required Pitch Deliverables)**:
     - `docs/PITCH_30_SECONDS.md`, `docs/PITCH_60_SECONDS.md`, `docs/DEMO_SCRIPT.md`, `docs/JUDGE_QA.md`, and `docs/FINAL_SUBMISSION_AUDIT.md` do not exist yet.
     - `docs/SUBMISSION.md` still contains wrong data granules (`Track 155`, `2026-10-10`), wrong tech stack (`TailwindCSS`), and placeholder URLs (`<!-- RESULTS: GITHUB_REPO_URL -->`).
   - **W-PRE-3 (Unused Legacy Component Clutter in `frontend/src/`)**: `Header.tsx`, `Footer.tsx`, `MapViewer.tsx`, `SidePanel.tsx`, and `useChangeLensData.ts` are unused remnants of an earlier layout that can confuse code reviewers inspecting `frontend/src/`.
3. **Why a Judge May Deduct Points**:
   - Presentation is judged under extreme time pressure. If judges read `docs/SUBMISSION.md` first, they get outdated information; if they open the web app first without a guided tour strip, they have to hunt across menus to see the `Đồng Tháp 0%` failure proof, the `Before ↔ After Swipe`, and the `10 Compatibility Gates`.
4. **Evidence Supporting Assessment**:
   - `docs/SUBMISSION.md:48-80`; `frontend/src/App.tsx` (no guided tour stepper).
5. **Highest-Value Improvement**:
   - Add a compact, non-intrusive **6-Act Guided Demo Bar ("Judge Quick Tour")** in `App.tsx` (`EN | VI`) that lets a judge step through all 6 acts in 60 seconds with one click per act, rewrite `docs/SUBMISSION.md` to 100% factual alignment, and produce `docs/PITCH_30_SECONDS.md`, `docs/PITCH_60_SECONDS.md`, `docs/DEMO_SCRIPT.md`, `docs/JUDGE_QA.md`, and `docs/FINAL_SUBMISSION_AUDIT.md`.
6. **Expected Benefit**: `+0.9 to +1.1` on Presentation (`3.5 → 4.5+`).
7. **Implementation Difficulty**: Low–Medium.
8. **Remaining Uncertainty**: Live public demo URL (`GitHub Pages` / `Cloudflare Pages`) and demo video recording link require Owner deployment/upload action.

---

## 3. Prioritized Improvement Roadmap (`Priority = Benefit / Effort`)

### P0 — Essential (Must Fix to Prevent Severe Judge Deductions)

| ID | Work Item | Target Criterion | Expected Benefit | Effort | Priority Ratio | Affected Files |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| **P0-1** | **Eliminate All Doc-vs-Baseline Contradictions & Sync Root Duplicates**: Rewrite `docs/SUBMISSION.md` to match the verified An Giang pair (`Track 148`, `Frame 083`, `2026-10-22` `G4404304390-ASF` vs `2026-11-03` `G4410154671-ASF`, `CRID P05036`, `EPSG:32648` 10 m, real GitHub URL `https://github.com/4kShi/nisar-changelens`, real tech stack). Update stale pre-hackathon sections in `docs/LIMITATIONS.md`, `docs/SCIENTIFIC_METHODOLOGY.md`, `docs/SYSTEM_ARCHITECTURE.md`, `docs/API_CONTRACTS.md`, and sync root markdown files (`DEMO_GUIDE.md`, `TEAM_HANDOFF.md`, `LIMITATIONS.md`, `SCIENTIFIC_METHODOLOGY.md`). | Validity, Presentation | Very High (`+0.8`) | Low | **5.0 / 5.0** | `docs/SUBMISSION.md`, `docs/LIMITATIONS.md`, `docs/SCIENTIFIC_METHODOLOGY.md`, `docs/SYSTEM_ARCHITECTURE.md`, `docs/API_CONTRACTS.md`, root mirror `.md` files |
| **P0-2** | **Fix `pipeline/gates.py` 10-m vs 20-m Posting String & Default Pair Alignment**: Replace hardcoded `"20m posting"` / `20.0` in `pipeline/gates.py` (`L188, 258, 263`) with dynamic `abs(float(b_dx))` (`10.0 m` on An Giang) and update `__main__` fallback reference without breaking any of the 43 pipeline tests. | Validity | High (`+0.4`) | Very Low | **4.8 / 5.0** | `pipeline/gates.py`, `tests/pipeline/test_pipeline.py` |
| **P0-3** | **Produce the Complete 9-Document Competition Excellence Package (Workstreams A–E & Part VII–VIII)**:<br>1. `docs/IMPACT_AND_USE_CASE.md`<br>2. `docs/CREATIVITY_AND_DIFFERENTIATION.md`<br>3. `docs/SCIENTIFIC_VALIDITY_AUDIT.md`<br>4. `docs/NISAR_RELEVANCE.md`<br>5. `docs/PITCH_30_SECONDS.md`<br>6. `docs/PITCH_60_SECONDS.md`<br>7. `docs/DEMO_SCRIPT.md`<br>8. `docs/JUDGE_QA.md`<br>9. `docs/FINAL_SUBMISSION_AUDIT.md` & `docs/FINAL_COMPETITION_SCORECARD.md` | All 5 Criteria | Very High (`+0.9`) | Medium | **4.7 / 5.0** | `docs/*.md`, `README.md` (index links) |

---

### P1 — High Value (High-Impact UI/UX & Scientific Communication Upgrades)

| ID | Work Item | Target Criterion | Expected Benefit | Effort | Priority Ratio | Affected Files |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| **P1-1** | **Interactive 6-Act Guided Demo Bar ("Judge Quick Tour") in the Web UI (`EN \| VI`)**: Add a compact, collapsible 6-step storyline bar at the top of the workspace (**Act 1: Mekong Problem → Act 2: NISAR L-Band → Act 3: 0% Off-Swath Proof → Act 4: An Giang Verified Swipe/Change → Act 5: 3-Level Guardrail → Act 6: Impact & Export**) that configures the map AOI, active layer, mode, and a concise narrative callout in one click per act. | Presentation, Impact, Creativity | Very High (`+0.9`) | Medium | **4.5 / 5.0** | `frontend/src/App.tsx`, `frontend/src/i18n/translations.ts`, `frontend/src/index.css`, `frontend/src/test/ux_optimization.test.tsx` |
| **P1-2** | **5-State Scientific Evidence Classification System (`Verified` \| `Computed` \| `Candidate` \| `Inferred` \| `Unavailable`)**: Surface an explicit evidence classification badge and breakdown in both the UI (`Location / Comparison / Point Readout`) and `docs/SCIENTIFIC_VALIDITY_AUDIT.md`, so judges immediately see what is `Verified` (HDF5 mask & metadata), `Computed` ($\gamma^0_{\text{dB}}$, $\Delta\gamma^0_{\text{dB}}$), `Candidate` (21 unextracted CMR repeat pairs), `Inferred` (Level 2 physical hypotheses), and `Unavailable` (synchronized optical NDWI, in-situ gauges, `HVHV` polarization). | Validity, Creativity | High (`+0.6`) | Low | **4.4 / 5.0** | `frontend/src/data/study.ts`, `frontend/src/App.tsx`, `frontend/src/i18n/translations.ts`, `frontend/src/index.css` |
| **P1-3** | **1-Click "Export Screening & Provenance Receipt" (`JSON` / `Markdown`) in the UI**: Allow researchers and local analysts to download a deterministic, self-contained **NISAR ChangeLens Screening Receipt** (`.md` or `.json`) for the currently selected AOI and observation pair (including 10-gate status, valid pixel denominator, $\Delta\gamma^0_{\text{dB}}$ statistics or block reason, SHA-256 manifest digest, and mandatory interpretation caveats). | Impact, Validity | High (`+0.5`) | Low | **4.2 / 5.0** | `frontend/src/App.tsx`, `frontend/src/i18n/translations.ts`, `frontend/src/index.css` |

---

### P2 — Optional (Low-Risk Polish if Time Permits)

| ID | Work Item | Target Criterion | Expected Benefit | Effort | Priority Ratio | Affected Files |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| **P2-1** | **Clean Up or Clearly Mark Unused Legacy Prototype Components**: Remove or archive unused dead files (`Header.tsx`, `Footer.tsx`, `MapViewer.tsx`, `SidePanel.tsx`, `useChangeLensData.ts`) if no test imports them, so code reviewers see a 100% clean module graph. | Presentation | Moderate (`+0.2`) | Very Low | **3.5 / 5.0** | `frontend/src/components/*`, `frontend/src/data/*` |

---

### P3 — Reject (Explicitly Excluded to Prevent Feature Creep & Scientific Dishonesty)

| ID | Rejected Idea | Reason for Rejection |
| :--- | :--- | :--- |
| **P3-1** | **Adding an Unverified AI / Deep Learning Flood Classifier** | Violates Part II Principle 1 & Workstream C: without synchronized ground truth in An Giang on `2026-10-22` and `2026-11-03`, an AI flood segmentation mask would hallucinate labels and destroy the project's strongest scientific differentiator (deterministic radar physics + fail-closed honesty). |
| **P3-2** | **Modifying or Re-thresholding the Protected An Giang Scientific Baseline Outputs** | Violates Part II Principle 2: all 11 GeoTIFF/PNG artifacts and `verified_pair_manifest.json` are bit-verified reference outputs and must remain untouched. |
| **P3-3** | **Rebuilding the MapLibre / React Architecture or Adding Heavy UI Libraries** | Violates Part V: current architecture builds in `~500 ms`, passes `76/76` tests, and works 100% offline without credentials. |

---

## 4. Detailed Engineering Specification for Proposed Changes (Part VI Compliance)

Before any code or file is modified in Phase 5, each proposed change is specified below with its purpose, affected files, risks, acceptance criteria, and regression tests:

1. **Change `P0-1` & `P0-3` — Documentation Synchronization & Workstream A–E Deliverables**:
   - **Why needed**: Resolves the critical discrepancy where `docs/SUBMISSION.md`, `docs/LIMITATIONS.md`, and `docs/SCIENTIFIC_METHODOLOGY.md` cite obsolete Track 155 / Oct 10 / `P05023` data, and provides the complete competition documentation suite (`IMPACT_AND_USE_CASE.md`, `CREATIVITY_AND_DIFFERENTIATION.md`, `SCIENTIFIC_VALIDITY_AUDIT.md`, `NISAR_RELEVANCE.md`, `PITCH_30_SECONDS.md`, `PITCH_60_SECONDS.md`, `DEMO_SCRIPT.md`, `JUDGE_QA.md`, `FINAL_SUBMISSION_AUDIT.md`, `FINAL_COMPETITION_SCORECARD.md`).
   - **Affected files**: `docs/*.md`, `README.md`, and root mirror markdown files (`DATA_SOURCES.md`, `DEMO_GUIDE.md`, `FINAL_SCIENTIFIC_QA.md`, `LIMITATIONS.md`, `SCIENTIFIC_METHODOLOGY.md`, `TEAM_HANDOFF.md`).
   - **Risks**: Near zero (documentation only; does not touch runtime code or scientific outputs).
   - **Acceptance criteria**: `grep` scan across all `.md` files confirms zero remaining false claims of Track 155 as the verified baseline, zero `TailwindCSS`/`XYZ tiles` claims for the SAR overlay, and zero `<!-- RESULTS: ... -->` placeholders.
   - **Regression tests**: Automated documentation consistency check + full `pytest` and `vitest` suites.

2. **Change `P0-2` — Dynamic Pixel Posting in `pipeline/gates.py`**:
   - **Why needed**: `pipeline/gates.py` lines `188`, `258`, and `263` hardcode `"20m posting"` / `20.0` even when evaluating `10 m` GCOV grids like the verified An Giang pair (`dx = 10.0 m`).
   - **Affected files**: `pipeline/gates.py`, `tests/pipeline/test_pipeline.py`.
   - **Risks**: Low; could affect any unit test in `tests/pipeline/test_pipeline.py` that asserts on `G06` or `G10` output fields if not checked carefully.
   - **Acceptance criteria**: `evaluate_gates()` dynamically reports `abs(float(b_dx))` (e.g., `10.0` m or `20.0` m) from the HDF5 coordinate array while preserving `rule_id`, `status`, and return schema; `11/11` verified manifest SHA-256 checksums remain completely untouched.
   - **Regression tests**: `PYTHONPATH=. pytest -q tests/pipeline` (`43/43` passing).

3. **Change `P1-1`, `P1-2`, `P1-3` — 6-Act Guided Demo Bar, 5-State Evidence Classification Badge & 1-Click Screening Receipt Export (`frontend/`)**:
   - **Why needed**: Gives judges an immediate 60-second interactive narrative (`Act 1` through `Act 6`), makes the 5-state **Scientific Evidence Classification (`Verified` | `Computed` | `Candidate` | `Inferred` | `Unavailable`)** visible at a glance, and provides an actionable **Screening & Provenance Receipt** download for the primary Mekong Delta monitoring use case.
   - **Affected files**: `frontend/src/App.tsx`, `frontend/src/data/study.ts`, `frontend/src/i18n/translations.ts`, `frontend/src/index.css`, `frontend/src/test/ux_optimization.test.tsx`, `frontend/src/test/i18n.test.tsx`.
   - **Risks**: Could add vertical height to the workspace or affect existing test selectors if not designed as a compact, secondary bar that preserves all existing `data-testid` attributes and responsive breakpoints.
   - **Acceptance criteria**:
     - All 6 acts clickable in both `EN` and `VI`, automatically configuring the corresponding AOI/layer/mode (`Act 1: Mekong Overview`, `Act 2: Before Oct 22 γ⁰`, `Act 3: Đồng Tháp 0% Off-Swath Diagnostic`, `Act 4: An Giang Change Map & Swipe`, `Act 5: 3-Level Interpretation & Evidence Classification`, `Act 6: 10 Gates, 33.81 MB Budget & Receipt Export`).
     - Zero HUD/legend overlap across `1440×900`, `1280×800`, `1024×768`, `768×1024`, and `390×844`.
     - All existing `33` frontend tests + new unit tests for the 6-Act Tour, 5-State Evidence Classification, and Screening Receipt pass (`0` TypeScript or console errors).
   - **Regression tests**: `npx tsc -b --pretty && npm test -- --run && npm run build` + multi-viewport headless browser verification.

---

## 5. Submission Risk Assessment

| Risk ID | Risk Description | Severity | Likelihood if Unfixed | Mitigation in Execution Plan |
| :--- | :--- | :---: | :---: | :--- |
| **R-1** | Judges read `docs/SUBMISSION.md` and see Track 155 / Oct 10 / `P05023` / `TailwindCSS` / placeholder URLs that contradict `README.md` and the live app | **CRITICAL** | **100%** (currently present in repo) | Fix in **P0-1** by rewriting `docs/SUBMISSION.md` and syncing all `docs/*.md` files to the verified An Giang baseline. |
| **R-2** | Judges spend 90 seconds in `Explore` mode and miss the `Đồng Tháp 0%` off-swath proof, the `33.81 MB / 12.2 GB` HTTP Range engine, and the `10 Compatibility Gates` | **HIGH** | **High** | Fix in **P1-1** with the interactive **6-Act Guided Demo Bar** right above the workspace and `docs/DEMO_SCRIPT.md`. |
| **R-3** | Judges ask *"Why didn't you validate against Sentinel-2 NDWI or ground gauges?"* or *"Does +3.63% dB increase prove flooding?"* | **HIGH** | **High** | Fix in **P0-3 & P1-2** via `docs/SCIENTIFIC_VALIDITY_AUDIT.md`, `docs/JUDGE_QA.md`, and the explicit 5-state **Evidence Classification Matrix** (`Verified` / `Computed` / `Candidate` / `Inferred` / `Unavailable`). |
| **R-4** | No live public hosted demo URL (`GitHub Pages` / `Cloudflare Pages`) or recorded video URL is filled into the final submission form | **HIGH** | **Medium** | Flagged explicitly in `docs/FINAL_SUBMISSION_AUDIT.md` as an Owner action item (`frontend/dist` is 100% static and ready for 1-command deployment). |
| **R-5** | Individual contribution breakdown for teammate **Lý Chấn Hưng** remains marked `NEEDS TEAM CONFIRMATION` in `README.md` / `docs/CONTRIBUTIONS.md` | **MEDIUM** | **Medium** | Highlighted for Owner confirmation prior to final GitHub push. |

---

## 6. Recommended Execution Plan (Phases 5–8 Upon Owner Approval)

1. **Step 1 — Execute P0 Documentation & Pipeline Consistency Fixes (`P0-1`, `P0-2`, `P0-3`)**:
   - Update `docs/SUBMISSION.md`, `docs/LIMITATIONS.md`, `docs/SCIENTIFIC_METHODOLOGY.md`, `docs/SYSTEM_ARCHITECTURE.md`, `docs/API_CONTRACTS.md`, and sync root duplicate `.md` files.
   - Fix `pipeline/gates.py` dynamic pixel posting (`10.0 m` vs `20.0 m`) and verify `43/43` Python tests pass.
   - Author the complete Workstream A–E documentation suite:
     - `docs/IMPACT_AND_USE_CASE.md`
     - `docs/CREATIVITY_AND_DIFFERENTIATION.md`
     - `docs/SCIENTIFIC_VALIDITY_AUDIT.md`
     - `docs/NISAR_RELEVANCE.md`
     - `docs/PITCH_30_SECONDS.md`
     - `docs/PITCH_60_SECONDS.md`
     - `docs/DEMO_SCRIPT.md`
     - `docs/JUDGE_QA.md`
2. **Step 2 — Implement High-Value UI Enhancements (`P1-1`, `P1-2`, `P1-3`, `P2-1`)**:
   - Add the bilingual **6-Act Guided Demo Bar ("Judge Quick Tour")** in `App.tsx`.
   - Add the **5-State Scientific Evidence Classification System (`Verified` | `Computed` | `Candidate` | `Inferred` | `Unavailable`)** display in `App.tsx` and `study.ts`.
   - Add the **1-Click Screening & Provenance Receipt Export (`.md` / `.json`)** button.
   - Add unit tests in `frontend/src/test/ux_optimization.test.tsx` and `frontend/src/test/i18n.test.tsx`.
3. **Step 3 — Full Technical, Scientific & Multi-Viewport Browser Verification (Phase 6)**:
   - Run `pytest -q tests/pipeline`, `npx tsc -b --pretty`, `npm test -- --run`, and `npm run build`.
   - Verify all 11 SHA-256 checksums in `verified_pair_manifest.json`.
   - Verify all viewports (`1440×900`, `1280×800`, `1024×768`, `768×1024`, `390×844`) in `EN` and `VI` via headless Chromium browser subagent with `0` console/network errors and `0` HUD/legend overlap.
4. **Step 4 — Independent 5-Evaluator Competition Judging Simulation & Final Submission Audit (Phases 7–8)**:
   - Produce `docs/FINAL_SUBMISSION_AUDIT.md` and `docs/FINAL_COMPETITION_SCORECARD.md` with Conservative, Realistic, and Optimistic post-improvement evaluations across all 5 criteria.

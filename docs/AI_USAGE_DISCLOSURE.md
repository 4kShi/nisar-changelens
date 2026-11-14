# AI Tools & AI-Assisted Development Disclosure (`AI_USAGE_DISCLOSURE.md`)

**Project**: NISAR ChangeLens (*"See Change. Understand Earth."*)  
**Team**: `4/K`  
**Challenge**: NASA Space Apps Challenge 2026 — *Dancing with the SARs*  
**Audit Date**: 2026-11-14

---

## 1. Fundamental Distinction: AI-Assisted Development vs. AI Inside the Final Product

To prevent any ambiguity for NASA Space Apps judges and scientific reviewers, Team `4/K` establishes a strict distinction between **how the software was built** and **how the software works**:

### A. AI-Assisted Development (`YES` — Extensively Used)
Artificial intelligence coding, research, and agentic orchestration tools (**ChatGPT**, **OpenAI Codex**, and **Google Antigravity `agy`**) were used extensively during pre-hackathon preparation and hackathon execution to assist with literature synthesis, architecture scaffolding, Python & TypeScript code generation, debugging, automated test authoring, independent QA script execution, bilingual (`EN | VI`) translation, and documentation packaging.

### B. AI Functionality Inside the Final Product (`NONE` — 100% Deterministic)
**NISAR ChangeLens contains zero generative AI, Large Language Model (LLM) APIs, neural networks, or machine-learning inference models inside the runtime web application or the scientific processing pipeline:**
1. **Deterministic Radar Physics**: Every pixel value, validity mask, $5\times 5$ boxcar filter, decibel conversion ($\gamma^0_{\text{dB}} = 10\log_{10}(\gamma^0_{\text{power}})$), signed change map ($\Delta\gamma^0_{\text{dB}} = \gamma^0_{\text{after,dB}} - \gamma^0_{\text{before,dB}}$), and area statistic is computed by deterministic mathematical formulas in [`pipeline/extract_verified_pair.py`](../pipeline/extract_verified_pair.py).
2. **Deterministic 10-Gate Compatibility Evaluator**: Pair compatibility in [`frontend/src/data/study.ts`](../frontend/src/data/study.ts) (`evaluatePairCompatibility`) and [`pipeline/extract_verified_pair.py`](../pipeline/extract_verified_pair.py) is evaluated by explicit boolean rules over HDF5/CMR metadata and pixel counts—never by probabilistic AI scoring.
3. **Deterministic Q&A Inspector**: The "Deterministic Evidence-Based Q&A Inspector" in Section 04 of the web UI (`SCIENTIFIC_QA_ITEMS` in [`frontend/src/data/study.ts`](../frontend/src/data/study.ts)) is a **curated, deterministic lookup table** of five pre-written scientific questions, answers, and provenance citations in English and Vietnamese. It is **not** a live chatbot or generative AI model, ensuring zero hallucination risk for end users.
4. **Software Test Fixture Isolation**: The optional synthetic checkerboard fixture (`frontend/src/dev-fixtures/fixture.ts`) is strictly isolated for UI component testing, clearly badged (`SOFTWARE TEST FIXTURE ONLY — NOT REAL NISAR DATA`), off by default, and never mixed with authentic NISAR scientific outputs.

---

## 2. Verified AI Tools Audit Table

Evidence for the tools below was audited from [`docs/AI_USAGE.md`](AI_USAGE.md), [`docs/IMPLEMENTATION_LOG.md`](IMPLEMENTATION_LOG.md), [`docs/NETWORK_DIAGNOSIS.md`](NETWORK_DIAGNOSIS.md), [`docs/NISAR_DATA_ACCESS_DIAGNOSIS.md`](NISAR_DATA_ACCESS_DIAGNOSIS.md), `preparation/`, and agent execution transcripts.

| AI Tool | Purpose | Development Stage | Human Contribution | Human Verification |
| :--- | :--- | :--- | :--- | :--- |
| **ChatGPT (OpenAI)** | **Planning, brainstorming & domain research**: Exploring NISAR L2 GCOV product structure (`HHHH` diagonal $\gamma^0$ power vs. off-diagonal complex terms), Mekong Delta wetland/agricultural radar scattering mechanisms (specular reflection vs. double-bounce), and formulating the 4-step user journey (*Discover → Observe → Compare → Understand*). | Pre-hackathon conceptual preparation (prior to `2026-11-14 00:00 ICT`) | Project owner Phạm Thành Trung defined the Mekong Delta regional focus, selected the challenge track (*Dancing with the SARs*), and established the scientific honesty guardrails (4-tier evidence hierarchy, 3-level interpretation hierarchy). | Cross-checked against official ASF NISAR GCOV documentation (`https://nisar-docs.asf.alaska.edu/gcov/`) and NASA CMR collection metadata (`NISAR_L2_GCOV_V1`). |
| **OpenAI Codex** | **Architecture scaffolding, network diagnosis & bounded HTTP Range reader**: Drafting initial repository specifications (`docs/API_CONTRACTS.md`, `docs/DATA_ACCESS_DESIGN.md`), diagnosing Earthdata/CMR/ASF network routes (`docs/NETWORK_DIAGNOSIS.md`, `docs/NISAR_DATA_ACCESS_DIAGNOSIS.md`), and implementing the resumable 250 MB HTTP Range byte-budget guard (`pipeline/http_range_budget.py`) and Stage 1 mask-only extractor (`pipeline/extract_mask_pair.py`). | Pre-hackathon documentation templates & early hackathon pipeline engineering (`2026-11-13` – `2026-11-14`) | Human owner set the strict 250 MB shared response-body byte cap, single-stream concurrency rule (`concurrency = 1`), and fail-closed requirement before touching `HHHH` backscatter arrays. | Verified via 39 unit and timeout/resumability tests in `tests/pipeline/test_http_range_budget.py` and `tests/pipeline/test_extract_mask_pair.py`, plus live checkpoint ledger inspection (`1,149,959` bytes used). |
| **Google Antigravity (`agy` — Autonomous Engineering, Research & Browser Verification Agents)** | **Code generation, refactoring, debugging, test generation, scientific QA audit, bilingual translation & release packaging**:<br>• Implemented Stage 2 calibrated `HHHH` + `numberOfLooks` extractor (`pipeline/extract_verified_pair.py`)<br>• Built and extended the interactive MapLibre GL JS + React 19 + TypeScript workbench (`frontend/src/App.tsx`, `MapStage.tsx`, `study.ts`, `catalogInventory.ts`)<br>• Implemented the complete `EN \| VI` bilingual language switcher (`frontend/src/i18n/`)<br>• Wrote automated tests (`tests/pipeline/test_extract_verified_pair.py`, `frontend/src/test/study.test.ts`, `i18n.test.tsx`)<br>• Executed the independent scientific QA audit (`docs/FINAL_SCIENTIFIC_QA.md`)<br>• Performed live browser verification and screenshot capture (`docs/screenshots/01..11`). | Active hackathon implementation, QA verification & release packaging (`2026-11-14`) | Human owner directed each mission phase, approved the transition from the `0.00%` valid off-swath Đồng Tháp diagnostic window to the `99.91%` valid An Giang window, mandated the independent scientific QA (`W-1`/`W-2`) and bilingual UI requirements, and reviewed final deliverables. | Independently verified via 60 automated tests (`43` Python `pytest` + `17` Frontend `vitest`), standalone Python bit-for-bit raster/SHA-256 audit scripts (`docs/FINAL_SCIENTIFIC_QA.md`), TypeScript/Vite production builds, and host-verified browser screenshots. |

---

## 3. Audit by Development Activity Category

| Activity Category | AI Involvement | Human Role & Verification |
| :--- | :--- | :--- |
| **1. Planning & Brainstorming** | Assisted by ChatGPT | Human owner selected the challenge, study region (Mekong Delta), and scientific honesty principles. |
| **2. Architecture Design** | Assisted by OpenAI Codex & Google Antigravity (`agy`) | Human owner approved the static no-backend web architecture and 2-stage resumable HDF5 pipeline. |
| **3. Scientific Literature & Spec Research** | Assisted by ChatGPT, Codex & `agy` | Verified against ASF NISAR GCOV user guide, NASA CMR API responses, and direct HDF5 metadata inspection. |
| **4. Data Exploration & Interpretation** | Assisted by Codex & `agy` | Discovered why the tilted Descending Track 148 swath yields `0.00%` valid pixels (`mask = 255`) in Đồng Tháp `[105.45, 10.60, 105.55, 10.70]` vs `99.9065%` valid pixels in An Giang `[104.95, 10.45, 105.05, 10.55]`. |
| **5. Code Generation & Completion** | Generated with OpenAI Codex & Google Antigravity (`agy`) | All Python (`pipeline/`) and TypeScript/React (`frontend/src/`) modules were verified through automated tests and production builds. |
| **6. Debugging & Refactoring** | Assisted by Codex & `agy` | Fixed `fsspec` numeric timeout handling, NumPy `uint32` JSON serialization, MapLibre WebWorker local bundling (`maplibre-gl-worker.js`), and a 1-character SHA-256 UI display typo (`D-1`). |
| **7. Test Generation** | Generated with Codex & `agy` | 43 Python pipeline tests (`tests/pipeline/`) and 17 Frontend Vitest tests (`frontend/src/test/`) executed and verified (`60/60` passing). |
| **8. Independent Scientific QA** | Executed by `agy` using standalone Python raster verification scripts | Independently recomputed all mask counts, $5\times 5$ boxcar edge behavior (`W-1`), Jensen's inequality dB shift (`W-2`), class areas, and SHA-256 digests (`docs/FINAL_SCIENTIFIC_QA.md`). |
| **9. Bilingual Translation (`EN \| VI`)** | Drafted & wired by `agy` (`frontend/src/i18n/translations.ts`, `study.ts`) | Verified 100% key parity (`i18n.test.tsx`), Vietnamese remote-sensing terminology accuracy, and live browser rendering (`docs/screenshots/08..11`). |
| **10. Documentation & Presentation Prep** | Drafted with Codex & `agy` (`README.md`, `docs/*.md`) | Audited against actual repository code, manifests, and SHA-256 checksums during final release engineering. |

---

## 4. Explicit Scientific Data Integrity Declarations

1. **Did AI generate, synthesize, or alter any scientific satellite data?**
   - **NO.** All scientific raster datasets (`20261022_mask.tif`, `20261022_HHHH.tif`, `20261022_numberOfLooks.tif`, `20261103_mask.tif`, `20261103_HHHH.tif`, `20261103_numberOfLooks.tif`, `delta_db.tif`, and the 4 PNG overlays) were extracted deterministically via HTTP Range requests from authentic NASA/ISRO `NISAR_L2_GCOV_V1` granules (`G4404304390-ASF` and `G4410154671-ASF`) hosted by ASF DAAC.
2. **Were AI models used to compute or estimate the reported scientific measurements?**
   - **NO.** Every reported figure (`1,207,740 / 1,208,870` valid pixels = `99.9065%`, `120.77 km²` valid area, `-8.742 dB` Before mean, `-8.325 dB` After mean, `+0.417 dB` mean $\Delta\gamma^0$, `0.29 km²` decrease $\le -3\text{ dB}$, `116.09 km²` stable within $\pm 3\text{ dB}$, `4.39 km²` increase $\ge +3\text{ dB}$) was produced by deterministic NumPy/SciPy array operations and independently reproduced from the GeoTIFF files.
3. **How was scientific correctness independently verified?**
   - An independent audit script read all 7 GeoTIFFs and 4 PNGs directly from disk, verified every pixel count, coordinate transform (`EPSG:32648`), $5\times 5$ boxcar neighborhood weight, dB conversion, and SHA-256 digest, and documented two minor methodological notes (`W-1` and `W-2`) in [`docs/FINAL_SCIENTIFIC_QA.md`](FINAL_SCIENTIFIC_QA.md) without concealing any limitation.

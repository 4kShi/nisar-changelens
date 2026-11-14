# GitHub Release Engineering & Public Packaging Audit (`GITHUB_RELEASE_AUDIT.md`)

**Project**: NISAR ChangeLens (*"See Change. Understand Earth."*)  
**Team**: `4/K` (`Phạm Thành Trung`, `Lý Chấn Hưng`)  
**Challenge**: NASA Space Apps Challenge 2026 — *Dancing with the SARs*  
**Audit Date**: 2026-11-14  
**Release Readiness Verdict**: **`READY AFTER OWNER CONFIRMATION`**

---

## 1. Repository Structure Overview

```text
4K - Dancing with the SARs/
├── .gitignore                        # Public-release Git ignore rules
├── LICENSE                           # MIT License (pending final owner confirmation of copyright names)
├── Makefile                          # Portable build, test & preview targets (PYTHON ?= python3)
├── README.md                         # Comprehensive judge & reviewer entry point
├── requirements.txt                  # Reproducible Python pipeline & test dependencies
├── config/
│   ├── .env.example                  # Public environment template (zero secrets)
│   └── dependency-plan.toml          # Historical dependency planning record
├── data/
│   ├── metadata/
│   │   ├── candidate_pair_manifest.json                          # 10-gate metadata & grid verification (24 KB)
│   │   └── range_checkpoints/
│   │       ├── 4K-COVERAGE-01-angiang-mask-only-v1/state.json    # Stage 1 byte-budget ledger (102 KB; *.range excluded)
│   │       └── 4K-BACKSCATTER-01-angiang-hhhh-looks-v1/state.json# Stage 2 byte-budget ledger (174 KB; *.range excluded)
│   ├── raw/
│   │   └── nisar_subsets/
│   │       ├── angiang_mask_only_4K-COVERAGE-01-angiang-mask-only-v1/ # Verified Stage 1 masks & manifest (24 KB)
│   │       ├── angiang_verified_pair_20261022_20261103/               # Verified 7 GeoTIFFs + 4 PNGs + manifest (24 MB)
│   │       └── mekong_bbox_10545_10555_1060_1070_20261114/            # Diagnostic 0% valid Đồng Tháp subset (104 KB)
│   └── work/
│       └── discovery.json            # 29 authentic NASA CMR granules discovered in Mekong Delta (51 KB)
├── docs/
│   ├── AI_USAGE_DISCLOSURE.md        # Audited AI tools & deterministic product disclosure
│   ├── CONTRIBUTIONS.md              # Official Team 4/K roster & contribution audit
│   ├── DATA_SOURCES.md               # Satellite, CMR, boundary & basemap attribution register
│   ├── DEMO_GUIDE.md                 # 3-minute live demo walkthrough & bilingual guide
│   ├── FINAL_SCIENTIFIC_QA.md        # Independent scientific QA audit (W-1, W-2, D-1, SHA-256)
│   ├── GITHUB_RELEASE_AUDIT.md       # This release engineering & security audit report
│   ├── LICENSES_AND_ATTRIBUTION.md   # Full frontend & Python dependency license audit
│   ├── LIMITATIONS.md                # Physical, operational & scope limitations
│   ├── MEKONG_DELTA_VALID_COVERAGE.md# Subswath geometry analysis (An Giang 99.91% vs Đồng Tháp 0%)
│   ├── NISAR_PAIR_VALIDATION.md      # 10-gate validation report for G4404304390-ASF & G4410154671-ASF
│   ├── SCIENTIFIC_METHODOLOGY.md     # Calibrated gamma-0 dB math, 5x5 boxcar & 3-level hierarchy
│   └── screenshots/                  # 22 verified browser screenshots (Explore, Research, EN/VI, Mobile, 9.5 MB)
├── frontend/
│   ├── index.html                    # Entry HTML
│   ├── package.json                  # React 19, MapLibre GL JS 6.18, TypeScript 7, Vite 8, Vitest 5
│   ├── package-lock.json             # Deterministic npm lockfile
│   ├── public/
│   │   ├── maplibre-gl-worker.js     # Bundled MapLibre CSP WebWorker (508 KB)
│   │   └── data/
│   │       ├── v1/                   # mekong_boundary.geojson (14 KB) & mekong_provinces.geojson (64 KB)
│   │       └── verified-angiang/     # Georeferenced PNG overlays & verified_pair_manifest.json (4.4 MB)
│   └── src/                          # TypeScript + React components, i18n (EN/VI), data contracts & Vitest suite
├── pipeline/
│   ├── http_range_budget.py          # 250 MB shared HTTP Range byte-budget guard & checkpoint store
│   ├── extract_mask_pair.py          # Stage 1 fail-closed mask-only HDF5 extractor
│   ├── extract_verified_pair.py      # Stage 2 calibrated HHHH + numberOfLooks extractor & 5x5 boxcar processor
│   ├── discover.py                   # NASA CMR Mekong Delta granule discovery script
│   ├── gates.py                      # 10 compatibility gates evaluator
│   ├── process_pair.py               # Local HDF5 pair processor
│   └── config.py                     # Portable pipeline paths & constants
└── tests/
    └── pipeline/                     # 43 pytest unit, timeout, budget & SHA-256 integrity tests
```

---

## 2. Files Included vs. Files Excluded (`.gitignore` Policy)

### Included in the Public Release Package (~34.5 MB Total)
1. **Application & Pipeline Source Code**: All files under `frontend/src/`, `frontend/public/`, `pipeline/`, `tests/pipeline/`, `Makefile`, `requirements.txt`, `frontend/package.json`, and `frontend/package-lock.json`.
2. **Small Verified Scientific Subsets & Checksummed Manifests (~24.2 MB)**:
   - `data/raw/nisar_subsets/angiang_verified_pair_20261022_20261103/` (`24 MB`: 7 GeoTIFFs + 4 PNGs + `verified_pair_manifest.json`) — required so external reviewers and `pytest` (`test_extract_verified_pair.py`) can independently verify every pixel count, $\gamma^0_{\text{dB}}$ value, and SHA-256 checksum without needing private NASA Earthdata credentials or re-downloading 12.2 GB of raw HDF5 granules.
   - `data/raw/nisar_subsets/angiang_mask_only_4K-COVERAGE-01-angiang-mask-only-v1/` (`24 KB`) — Stage 1 mask verification evidence.
   - `data/raw/nisar_subsets/mekong_bbox_10545_10555_1060_1070_20261114/` (`104 KB`) — Diagnostic off-swath (`0%` valid) Đồng Tháp evidence.
   - `data/metadata/candidate_pair_manifest.json` (`24 KB`), `data/work/discovery.json` (`51 KB`), and `data/metadata/range_checkpoints/*/state.json` (`276 KB` total — contains only SHA-256 hashed URL digests and byte-range accounting, zero signed URLs or tokens).
3. **Complete Documentation & Verified Screenshots (~5.1 MB)**:
   - `README.md`, `LICENSE`, `docs/*.md`, and all 11 screenshots in `docs/screenshots/`.

### Excluded via `.gitignore` (~242 MB Excluded)
| Excluded Path / Pattern | Size | Reason for Exclusion |
| :--- | :--- | :--- |
| `frontend/node_modules/` | `193 MB` | Standard npm dependency tree; reproducibly restored via `npm ci` or `npm install` from `frontend/package-lock.json`. |
| `frontend/dist/` & `*.tsbuildinfo` | `~6.6 MB` | Generated production bundle; reproducibly built via `npm run build`. |
| `data/metadata/range_checkpoints/**/ranges/` & `*.lock` | `34 MB` | Intermediate binary HTTP Range chunk cache files (`*.range`); final verified GeoTIFFs and `state.json` byte ledgers are already preserved. |
| `preparation/`, `frontend/.recovery/` | `3.1 MB` | Internal pre-hackathon agent relay logs (`INITIAL_STATE.json`, `qa-relay/`, `science-relay/`) and legacy UI backup snapshots not relevant to external reviewers. |
| `.pytest_cache/`, `__pycache__/`, `*.pyc` | `~250 KB` | Python bytecode and test runner cache. |
| `.env`, `.env.*` (except `.env.example`), `.netrc`, `*.pem`, `*.key` | `0 B` | Preventative security guard against accidental credential commits. |
| Duplicate root markdown mirrors (`DATA_SOURCES.md`, `DEMO_GUIDE.md`, `FINAL_SCIENTIFIC_QA.md`, `LIMITATIONS.md`, `SCIENTIFIC_METHODOLOGY.md`, `TEAM_HANDOFF.md`) | `~68 KB` | Canonical copies reside in `docs/`; excluding root duplicates prevents documentation drift while keeping files on disk intact. |

---

## 3. Public-Release Security & Privacy Audit

A comprehensive scan was executed across all included source, data, manifest, and documentation files:

| Security Check | Audit Result | Evidence / Remediation Applied |
| :--- | :---: | :--- |
| **1. `.env` / `.netrc` / Earthdata Credentials** | **PASS (`0 found`)** | No `.netrc` or `.env` files exist in the project directory. `config/.env.example` contains only public placeholder keys. |
| **2. Signed S3 / CloudFront URLs or Bearer Tokens** | **PASS (`0 found`)** | `RangeCheckpointStore` in `pipeline/http_range_budget.py` hashes source URLs with `SHA-256` (`source_url_sha256`) and refuses to persist query strings (`?`) or tokens (`A-userid`, `X-Amz-Signature`, `Bearer`). Verified in `state.json` and `verified_pair_manifest.json`. |
| **3. Private Workstation Absolute Paths (`/home/...`)** | **PASS (`Sanitized`)** | Audit identified hardcoded workstation paths in `Makefile`, `pipeline/config.py`, `pipeline/gates.py`, `pipeline/process_pair.py`, `pipeline/build_manifest.py`, `README.md`, `docs/DEMO_GUIDE.md`, `docs/FINAL_SCIENTIFIC_QA.md`, `docs/NISAR_DATA_ACCESS_DIAGNOSIS.md`, and `docs/NETWORK_DIAGNOSIS.md`. All were replaced with portable relative paths (`./`, `PYTHON ?= python3`, `NISAR_LOCAL_FALLBACK_DIR`). Re-scan across all release-tracked files returned **0 matches**. |
| **4. Unintended Large Files / GitHub Limits** | **PASS** | Largest single file in the release package is `data/raw/nisar_subsets/angiang_verified_pair_20261022_20261103/delta_db.tif` (**`4.2 MB`**), which is < 9% of GitHub's 50 MB warning threshold and < 5% of GitHub's 100 MB hard limit. **Git LFS is not required.** |

---

## 4. Dependency & License Audit Summary

Full details are recorded in [`docs/LICENSES_AND_ATTRIBUTION.md`](LICENSES_AND_ATTRIBUTION.md):
- **Frontend Runtime (`frontend/package.json`)**: `react@19.3.1` (`MIT`), `react-dom@19.3.1` (`MIT`), `maplibre-gl@6.18.0` (`BSD-3-Clause`). All permissive and compatible with open-source distribution.
- **Frontend Build/Test (`devDependencies`)**: `typescript@7.0.2` (`Apache-2.0`), `vite@8.3.8` (`MIT`), `vitest@5.1.0` (`MIT`), `jsdom@31.0.1` (`MIT`), `@testing-library/react@16.3.3` (`MIT`), `@testing-library/jest-dom@7.0.1` (`MIT`).
- **Python Pipeline (`requirements.txt`)**: `numpy@2.5.4` (`BSD-3-Clause`), `scipy@1.18.1` (`BSD-3-Clause` source; binary wheels dynamically bundle `libquadmath` `LGPL-2.1+` / optional `FFTW` `GPL-2.0+` — **not redistributed in this repository**), `rasterio@1.5.2` (`BSD-3-Clause`), `h5py@3.16.0` (`BSD-3-Clause`), `pyproj@3.8.0` (`MIT`), `shapely@2.2.0` (`BSD-3-Clause`), `requests@2.34.2` (`Apache-2.0`), `earthaccess@0.19.0` (`MIT`), `Pillow@13.0.0` (`MIT-CMU`), `pytest@9.2.0` (`MIT`).

---

## 5. Reproducibility, Offline/Online Matrix & Validation Results

### Feature Availability by Environment
| Workflow / Feature | Works Offline? | Requires Public Internet? | Requires Private NASA Earthdata Login (`~/.netrc`)? |
| :--- | :---: | :---: | :---: |
| **Core Web Demo (`npm run dev` / `npm run preview`)** | **Yes** *(GeoJSON boundaries, verified An Giang NISAR GCOV rasters, swipe comparison, 29-granule catalog, 10 gates, Q&A, and `EN \| VI` switcher all load from local static assets)* | Optional *(only needed to load background Esri World Dark Gray basemap tiles; map displays a clean fallback banner if offline)* | **No** |
| **Frontend Automated Tests (`npm test`) & Build (`npm run build`)** | **Yes (100% offline)** | **No** | **No** |
| **Pipeline Dry-Run, SHA-256 Verification & Unit Tests (`pytest -q tests/pipeline`)** | **Yes (100% offline)** | **No** | **No** |
| **Live Remote HDF5 Re-Extraction (`--execute` against ASF Earthdata Cloud)** | No | **Yes** | **Yes** *(Requires personal NASA Earthdata Login in `~/.netrc`)* |

### Final Rerun of All Verification Checks (2026-11-14)
1. **Python Pipeline Test Suite (`PYTHONPATH=. pytest -q tests/pipeline`)**: **`43 passed`**
2. **Frontend Unit, Contract, UX Optimization, Gating & Bilingual i18n Suite (`npm test -- --run`)**: **`33 passed`** (`5` test files)
3. **Total Automated Tests**: **`76 / 76 passed`**
4. **TypeScript & Vite Production Build (`npm run build`)**: **Succeeded (`0` errors)**
5. **SHA-256 Verification of Packaged Scientific Outputs**: **11 / 11 files in `data/raw/nisar_subsets/angiang_verified_pair_20261022_20261103/` and 4 / 4 baseline PNGs in `frontend/public/data/verified-angiang/` match `verified_pair_manifest.json` bit-for-bit.**
6. **Live Browser Smoke Test (`http://127.0.0.1:4173/`)**: Verified `Explore` vs `Research & Gates` modes, resizable map/sidebar splitter, `Before` / `After` / `Change Map` / `Swipe` layers, threshold presets (`Continuous`, `±2.0 dB`, `±3.0 dB Reference`, `±4.0 dB`), 22-pair Compatible Observation Finder, English (`EN`) and Vietnamese (`VI`) language switching, and Mobile (`390x844`) responsive layout with `0` console errors.

---

## 6. Public Demo Hosting Readiness & Recommendation

- **Current Public Demo Status**: **No public hosted URL is currently deployed.** Per strict release governance, we do **not** claim a live public URL until the owner authorizes deployment.
- **Architectural Readiness**: Because `frontend/dist/` is a **100% static client bundle (approximately `6.6 MB` uncompressed / `~6,842,940` bytes pre-P1, `6,843,141` bytes verified post-P1 across JS/CSS and static GeoJSON/PNG assets)** with zero backend server requirements and relative asset resolution (`import.meta.env.BASE_URL`), it can be deployed in under 2 minutes to any static host:
  1. **Recommended Option 1 — GitHub Pages (via GitHub Actions)**: Zero cost, lives in the same repository, automatic deployment on push to `main` (set `base: '/<repo-name>/'` in `vite.config.ts` if hosted on a project subpath, or `base: '/'` on a custom domain / Cloudflare Pages / Vercel / Netlify).
  2. **Recommended Option 2 — Cloudflare Pages / Vercel / Netlify**: Zero config (`Root directory: frontend`, `Build command: npm run build`, `Output directory: dist`), works out-of-the-box with `base: '/'`.

---

## 7. Remaining Owner Decisions Before Public Push (`READY AFTER OWNER CONFIRMATION`)

No technical or scientific defects block release. However, because this directory currently resides inside the parent AI OWNER workspace and requires human confirmation on attribution and destination, the owner (**Phạm Thành Trung**) must confirm the following **4 items** before initializing a standalone Git repository or pushing to GitHub:

1. **Team Member Contribution Confirmation (`docs/CONTRIBUTIONS.md`)**:
   - Confirm the specific individual vs. collaborative contributions of **Lý Chấn Hưng** (listed as Member on the official Space Apps Team `4/K` page `https://www.spaceappschallenge.org/2026/find-a-team/4k/?tab=members`).
2. **Repository License & Copyright Confirmation (`LICENSE`)**:
   - Confirm that the **MIT License** in `LICENSE` is approved for public release and whether the copyright line should read `Copyright (c) 2026 Phạm Thành Trung, Lý Chấn Hưng (Team 4/K)`.
3. **Target GitHub Repository URL & Standalone Git Initialization**:
   - Confirm the exact destination GitHub repository URL (e.g., `https://github.com/<owner>/<repo>.git`) and authorize running `git init` inside `4K - Dancing with the SARs` (currently isolated via `.gitignore` from the parent repository).
4. **Public Static Demo Deployment Authorization**:
   - Confirm whether to deploy `frontend/dist` to GitHub Pages / Cloudflare Pages / Vercel and provide the final URL for `README.md` and `docs/SUBMISSION.md`.

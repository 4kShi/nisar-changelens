# System Architecture

> **Status: VERIFIED IMPLEMENTATION — Team 4/K (NASA Space Apps Challenge 2026, Hanoi, Vietnam).**

**NISAR ChangeLens** uses a clean two-part architecture combining a **bounded, offline Python scientific pipeline** with a **100% static serverless React + TypeScript + MapLibre GL JS web application**. There is zero runtime backend server (no FastAPI), zero visitor authentication, and zero credentials in the public bundle. Regional scope focuses strictly on Vietnam's Mekong Delta (Đồng bằng sông Cửu Long — ĐBSCL).

```text
PRIVATE WORKSTATION / AUTHORIZED EXTRACTION ENVIRONMENT (~/.netrc chmod 0600)
=============================================================================
pipeline/discover.py        -> NASA CMR API (29 Mekong Delta NISAR granules)
pipeline/http_range_budget.py -> Thread-safe 250 MB HTTP Range Byte-Budget Guard
pipeline/extract_mask_pair.py -> Stage 1 bounded /mask inspection (~1.15 MB)
pipeline/gates.py             -> 10 Compatibility Gates (fail-closed evaluation)
pipeline/extract_verified_pair.py -> Stage 2 HHHH + looks extraction (~32.66 MB),
                                     5x5 normalized linear boxcar, delta dB,
                                     verified GeoTIFFs + RGBA PNGs + SHA-256 manifest
pipeline/process_pair.py      -> Core deterministic SAR math & PNG/manifest helpers

                              |
          Reviewed static assets + verified manifests (no tokens/URLs)
                              v

PUBLIC STATIC WEB APPLICATION (Vite build -> frontend/dist ~6.6 MB, GitHub Pages)
=============================================================================
- frontend/public/data/verified-angiang/ (4 georeferenced RGBA PNGs + SHA-256 manifest)
- frontend/public/data/v1/               (geoBoundaries mekong_boundary & mekong_provinces)
- frontend/src/data/                     (contract, catalogInventory, verified study stats)
- frontend/src/components/MapStage.tsx   (MapLibre GL JS canvas + image overlays + swipe)
- frontend/src/App.tsx                   (Explore / Research modes, EN | VI, Tour, Receipt)
- frontend/src/index.css                 (Custom responsive dashboard stylesheet; no Tailwind)
```

---

## Component Responsibility Matrix

| Component | Responsibility | Verification / Guarantee |
| :--- | :--- | :--- |
| **Bounded Remote Access (`http_range_budget.py`)** | Enforce a strict `250 MB` cumulative HTTP Range byte budget (`33,812,717` bytes = `33.81 MB` used across Stage 1 + Stage 2) instead of downloading ~`12.23 GB` of full HDF5 granules; reject HTTP `200`, chunked/compressed encoding, and oversized ranges. | Automated test suite (`tests/pipeline/test_http_range_budget.py`) + inspectable byte-budget ledger JSONs. |
| **10 Compatibility Gates (`gates.py`)** | Validate collection maturity (`VALIDATED` V1 vs `PROVISIONAL`), polarization/frequency (`frequencyA/HHHH`), orbit geometry (Track/Frame/Pass/Look), CRID & processor version, dynamic X/Y grid alignment (half-pixel check, non-square pixel support), spatial overlap, mask validity, radiometric positivity, and effective resolution. | `pass` / `fail` / `unknown` fail-closed records; `test_gates_dynamic_resolution.py` verifies `10 m × 10 m`, `10 m × 20 m`, and half-pixel rejection. |
| **Deterministic SAR Processor (`extract_verified_pair.py`, `process_pair.py`)** | Convert valid linear $\gamma^0$ power using validity-weighted $5\times 5$ boxcar filtering into $\gamma^0_{\text{dB}}$ and $\Delta\gamma^0_{\text{dB}}$, generate `EPSG:32648` GeoTIFFs and georeferenced RGBA PNGs, and compute 11 SHA-256 digests (`verified_pair_manifest.json`). | `test_extract_verified_pair.py` + independent reproduction (`docs/FINAL_SCIENTIFIC_QA.md`). |
| **Static Frontend (`frontend/src/`)** | Render interactive MapLibre GL JS canvas (`image` sources over Esri Dark Gray basemap + `geoBoundaries`), Before/After swipe divider, Explore/Research toggle, 6-Act Judge Guided Tour, 5 Evidence State badges, EN/VI switcher, and MD/JSON Screening Receipt export. | Automated TypeScript (`tsc -b`), Vitest (`npm test -- --run`), Vite production build (~`6.6 MB` total), and headless multi-viewport browser checks (`1440×900`, `1024×768`, `768×1024`, `390×844`). |

---

## Visualization Rendering Architecture

- **Georeferenced Image Sources (Not XYZ Tile Pyramids):** The verified An Giang overlays (`before_db.png`, `after_db.png`, `change_db.png`, `change_classes.png` covering `[104.95, 10.45, 105.05, 10.55]`, along with exploratory `change_classes_2db.png`, `change_classes_4db.png`, and `mask_*.png` previews) are loaded directly as MapLibre `type: 'image'` raster sources anchored to verified WGS84 corner coordinates. We do **not** generate or host multi-zoom `z/x/y` tile trees in this prototype; full quantitative arrays remain preserved in the offline `EPSG:32648` GeoTIFF outputs.
- **Basemap & Resilience:** Online reference context uses Esri `World_Dark_Gray_Base` / `World_Dark_Gray_Reference` tiles (`server.arcgisonline.com`). Even if external basemap tiles are blocked or offline, the local `mekong_boundary.geojson`, `mekong_provinces.geojson`, Track `148` swath vectors, and verified PNG overlays remain functional with zero NASA Earthdata dependency at runtime.
- **Pure Custom CSS (No TailwindCSS / Lucide Runtime):** Styling is authored in `frontend/src/index.css` using custom CSS variables (`--bg`, `--surface`, `--text`, `--accent`, etc.) and clean inline SVGs, avoiding external CSS/icon framework bloat.

---

## Security & Secret Hygiene

1. **Zero Visitor Login / Zero Backend Proxies:** Public visitors never enter Earthdata credentials, never hit a proxy server, and never receive signed NASA/ASF CloudFront URLs.
2. **Environment Isolation:** Python remote scripts read `~/.netrc` (`chmod 0600`) strictly on private operator machines during offline extraction. No `VITE_` secret variables exist anywhere in the frontend build.
3. **Fail-Closed Validation & Input Safety:** Manifest and checksum validation rejects tampered records; UI state resets cleanly when switching AOIs so failed/off-swath regions (`Đồng Tháp 0% valid`) disable Compare immediately with an honest diagnostic state.
4. **Verified Build Budget:** `npm run build` outputs a complete self-contained static bundle (`frontend/dist/`, approximately `6.6 MB` — `6,842,940` bytes pre-P1 / `6,843,141` bytes post-P1 CSS patch — including verified PNGs, GeoJSON boundaries, and MapLibre worker) well under the `25 MB` budget.

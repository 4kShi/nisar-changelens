# Independent Setup and Reproducibility Guide (`TEAM_HANDOFF.md`)

> **Status: VERIFIED IMPLEMENTATION — Team 4/K (NASA Space Apps Challenge 2026, Hanoi, Vietnam).**

This document summarizes the verified runtime environment, reproduction commands, and release readiness state for **NISAR ChangeLens** (*"See Change. Understand Earth."*).

---

## 1. Governance & Scope

- **Project Ownership & Authorization:** Team `4/K` (**Phạm Thành Trung** — Team Owner; **Lý Chấn Hưng** — Team Member). Authorized implementation began `2026-11-14 00:00 ICT`.
- **Geographic Scope:** Strictly focused on Vietnam's Mekong Delta (**Đồng bằng sông Cửu Long — ĐBSCL**):
  - **Tier 1–2 Regional Discovery:** All 13 Mekong Delta provinces (`29` authentic NISAR L2 GCOV granules in NASA CMR).
  - **Tier 4 Verified Pair Window:** **An Giang — Tri Tôn / Cô Tô (`[104.95, 10.45, 105.05, 10.55]`)**, `120.77 km²` jointly valid (`99.9065%`).
  - **Tier 3 Off-Swath Diagnostic Window:** **Đồng Tháp Mười Pilot Bbox (`[105.45, 10.60, 105.55, 10.70]`)**, verified `0.00%` valid (`100% mask = 255`) outside the tilted Descending Track `148` swath edge.
- **Self-Contained Workspace:** Operates independently inside `./` (`4K - Dancing with the SARs`) with zero runtime dependency on external orchestration tools.

---

## 2. Verified Technical Stack & Commands

1. **Python Pipeline Environment:**
   - **Python 3.12+** (verified in Python `3.14` venv) with `numpy`, `scipy`, `rasterio`, `h5py`, `pyproj`, `shapely`, `requests`, `earthaccess`, `fsspec`, `aiohttp`, `Pillow`, and `pytest` (`requirements.txt`).
   - Dry-run & SHA-256 verification (`make pipeline` — works offline without NASA credentials):
     - `PYTHONPATH=. python3 pipeline/extract_mask_pair.py`
     - `PYTHONPATH=. python3 pipeline/extract_verified_pair.py`
   - Optional live HDF5 re-extraction (`--execute`) authenticates strictly via `~/.netrc` (`chmod 0600`) within the `250 MB` HTTP Range cap (`33.81 MB` actual transfer).
2. **Frontend Web Application (`frontend/`):**
   - **Node.js `^20.19.0` or `>=22.12.0` LTS**, **React 19.3**, **TypeScript 7.0**, **Vite 8.3**, **MapLibre GL JS 6.18**, and custom CSS (`frontend/src/index.css`; no TailwindCSS, no Lucide Icons).
   - 100% static build (`make web-build` -> `frontend/dist/`, approximately `6.6 MB` total), previewed locally via `make preview` (`http://127.0.0.1:4173/`).
3. **Secret Hygiene:**
   - Zero `.netrc`, `.env`, Earthdata tokens, signed CloudFront URLs, or private workstation paths are committed to Git or bundled into `frontend/dist/`.

---

## 3. Scientific Guardrails Enforced

1. **10 Automated Compatibility Gates (`pipeline/gates.py`):** Evaluates collection maturity, polarization, track/frame/pass/look geometry, CRID, dynamic X/Y grid alignment (`10 m × 10 m`), overlap, mask validity, radiometric positivity, and resolution before allowing subtraction.
2. **Deterministic Physics Baseline:** Normalized $5\times 5$ boxcar filtering on linear $\gamma^0$ (`HHHH`), $\gamma^0_{\text{dB}} = 10\log_{10}(\overline{P}_{5\times 5})$, and $\Delta\gamma^0_{\text{dB}} = \gamma^0_{\text{After,dB}} - \gamma^0_{\text{Before,dB}}$ (**zero black-box AI models in product logic**).
3. **Honest Labeling:** All overlays and statistics use neutral change language (**"Potential Surface Change"**), explicit **5 Evidence States** (`Verified`, `Computed`, `Candidate`, `Inferred`, `Unavailable`), and the **3-Level Interpretation Hierarchy**.

---

## 4. Release & Verification Checklist

- [x] MIT License established (`LICENSE`).
- [x] Full AI usage disclosure documented (`docs/AI_USAGE_DISCLOSURE.md` & `docs/AI_USAGE.md`).
- [x] Software, basemap, `geoBoundaries`, and NASA/ISRO NISAR attributions registered (`docs/LICENSES_AND_ATTRIBUTION.md`, `docs/DATA_SOURCES.md`).
- [x] Physical, operational, and QA limitations synchronized (`docs/LIMITATIONS.md`, `docs/FINAL_SCIENTIFIC_QA.md`).
- [x] Pipeline outputs and all 11 SHA-256 digests verified (`make pipeline` dry-run & integrity verification pass).
- [x] Automated Python + Frontend test suites passing (`make test`).
- [x] Static web bundle compiled cleanly within budget (`make web-build`, approximately `6.6 MB` total `dist/` $\ll 25\text{ MB}$).

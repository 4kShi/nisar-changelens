# Project Submission: NISAR ChangeLens

> **NASA Space Apps Challenge 2026**  
> **Challenge Track:** Dancing with the SARs  
> **Location:** Hanoi, Vietnam  
> **Team:** `4/K` (**Phạm Thành Trung** — Team Owner; **Lý Chấn Hưng** — Member)  
> **Repository:** https://github.com/4kShi/nisar-changelens  
> **Status:** VERIFIED COMPETITION SUBMISSION

---

## 1. Project Information

- **Project Name:** NISAR ChangeLens — Mekong Delta Surface Change Explorer
- **Slogan:** *See Change. Understand Earth.*
- **Target Region:** Mekong Delta (Đồng bằng sông Cửu Long — ĐBSCL), Vietnam (`An Giang` Verified Window `[104.95, 10.45, 105.05, 10.55]` & `Đồng Tháp` Off-Swath Diagnostic `[105.45, 10.60, 105.55, 10.70]`)

### High-Level Summary ($\le 150$ words)
NISAR ChangeLens is an open-source, serverless web application empowering citizens, farmers, environmental analysts, and researchers to screen surface changes across Vietnam's Mekong Delta using newly released NASA-ISRO SAR (NISAR) L2 GCOV satellite observations. Built for NASA Space Apps Challenge 2026 ("Dancing with the SARs"), ChangeLens lowers the technical barrier of 6 GB HDF5 radar products through a bounded HTTP Range pipeline (`33.81 MB` extracted from `12.23 GB` remote data) and a dual-audience UI (`Explore` and `Research & Gates` modes in `EN | VI`). Instead of black-box AI flood claims, ChangeLens enforces 10 automated physical compatibility gates, deterministic $5\times 5$ normalized linear-power boxcar calibration ($\Delta\gamma^0_{\text{dB}}$), a fail-closed off-swath diagnostic proof, 5 explicit Evidence States, and a 3-Level Interpretation Hierarchy—transforming cloud-penetrating L-band SAR into honest, reproducible surface-anomaly screening.

---

## 2. Project Details

### The Challenge
Optical Earth observation satellites (`Sentinel-2`, `Landsat`) are frequently obscured by heavy monsoon cloud cover over the Mekong Delta right when agricultural hydrology and surface-water conditions change rapidly. NASA and ISRO's L-band NISAR mission penetrates clouds day and night, providing calibrated Geocoded Covariance (`L2 GCOV`) backscatter. However, multi-gigabyte HDF5 covariance arrays, tilted swath geometries (`~37%` NoData border fill in coarse north-up bounds), speckle noise, and complex L-band scattering ambiguity (specular open water drops vs. emergent rice double-bounce increases) block everyday analysts—and invite dangerous false flood claims when incompatible passes are naively subtracted.

### The Solution: NISAR ChangeLens
NISAR ChangeLens transforms raw NISAR L2 GCOV granules into an honest, zero-backend, verifiable Earth observation explorer:
- **Bounded Resumable HDF5 Pipeline:** Two-stage authenticated HTTPS Range extraction (`33,812,717` bytes = `33.81 MB`, `13.53%` of our `250 MB` transfer cap) verifies raw `/mask` geometry before fetching `HHHH` backscatter and `numberOfLooks` slices—leaving `99.7%` of the multi-gigabyte remote files untouched.
- **Fail-Closed 10-Gate Verification & Off-Swath Diagnostic Proof:** Before subtracting two radar images, `pipeline/gates.py` checks collection maturity, polarization, orbit track/frame/look geometry, CRID, dynamic X/Y grid alignment (`10 m × 10 m`), overlap, and valid masks. In **Đồng Tháp**, extracting the `[105.45, 10.60, 105.55, 10.70]` window exposed `100% mask = 255` (`0` valid pixels out of `1,212,165`) just outside the tilted Descending Track `148` edge, blocking false comparison transparently.
- **Verified An Giang Case Study (`99.91%` Valid Support):** Over `[104.95, 10.45, 105.05, 10.55]` (`120.89 km²`), `1,207,740` jointly valid pixels (`120.77 km²`) reveal calibrated L-band backscatter shifts (`Delta dB` mean `+0.417 dB`, median `+0.240 dB`, `4.39 km²` with $\Delta\gamma^0 \ge +3.0\text{ dB}$, `0.29 km²` with $\Delta\gamma^0 \le -3.0\text{ dB}$, `116.09 km²` stable).
- **Accessible Dual-Mode Bilingual Experience (`Explore` vs. `Research`, `EN | VI`):** Includes interactive Before/After swipe comparison, a 6-Act Judge Guided Tour, 5 strict Evidence States (`Verified`, `Computed`, `Candidate`, `Inferred`, `Unavailable`), and 1-click Markdown/JSON Screening & Provenance Receipt export.

---

## 3. NASA & Partner Space Agency Data

### NASA Data Used
- **Collection:** `NISAR_L2_GCOV_V1` (Concept `C3622241360-ASF`, Validated) plus regional catalog discovery across `NISAR_L2_GCOV_PROVISIONAL_V1` (`C3929016797-ASF` — `18` granules kept strictly catalog-only).
- **Distributor & Access:** Alaska Satellite Facility DAAC (`ASF DAAC`) / NASA Earthdata Cloud, discovered via NASA CMR (`29` Mekong Delta granules) and accessed via authenticated bounded HTTP Range requests (`earthaccess` + `fsspec` + `h5py`).
- **Verified Repeat-Pass Pair (An Giang Window `[104.95, 10.45, 105.05, 10.55]`):**
  - **Before Pass:** `NISAR_L2_PR_GCOV_033_148_D_083_4005_DHDH_A_20261022T113140_20261022T113214_P05036_N_F_J_001` (`G4404304390-ASF`, Cycle 33, Track `148`, Frame `083`, `Descending`, `Left`-looking, `2026-10-22 11:31:40 UTC`, CRID `P05036`, `v1.0.20`).
  - **After Pass:** `NISAR_L2_PR_GCOV_034_148_D_083_4005_DHDH_A_20261103T113137_20261103T113215_P05036_N_F_J_001` (`G4410154671-ASF`, Cycle 34, Track `148`, Frame `083`, `Descending`, `Left`-looking, `2026-11-03 11:31:37 UTC`, CRID `P05036`, `v1.0.20`).
- **Data Attribution:**
  > *"NISAR L2 GCOV V1, NASA/ISRO, distributed by ASF DAAC, accessed 2026-11-14. Not an official NASA/ISRO product."*

### Space Agency Partner
- **Indian Space Research Organisation (ISRO):** Joint developer and operator of the dual-frequency (L-band and S-band) NASA-ISRO SAR (NISAR) mission (spacecraft bus, launch integration, and S-band radar paired with NASA's L-band SAR and 12 m mesh reflector).

---

## 4. Tools, Libraries & Platforms

- **Offline Scientific Pipeline:** Python `3.12+` (verified on Python `3.14` venv), `numpy`, `scipy`, `rasterio`, `h5py`, `pyproj`, `shapely`, `requests`, `earthaccess`, `fsspec`, `aiohttp`, `Pillow`, `pytest`.
- **Frontend Web Application:** React `19.3`, TypeScript `7.0`, Vite `8.3`, MapLibre GL JS `6.18`, custom CSS (`frontend/src/index.css`; zero TailwindCSS, zero external UI icon framework).
- **Geospatial Vectors & Basemap:** `geoBoundaries` Vietnam ADM1 provincial boundaries (`CC BY 4.0`, clipped to 13 Mekong Delta provinces), Esri `World_Dark_Gray_Base` / `World_Dark_Gray_Reference` XYZ basemap tiles (`© Esri, HERE, Garmin, OpenStreetMap contributors`).
- **Deployment Model:** 100% static bundle (`frontend/dist/`, approximately `6.6 MB` / ~`6,842,940` bytes baseline including verified RGBA PNGs and boundaries); zero runtime server or user accounts required.

---

## 5. AI Assistance Disclosure

- **AI Development Tools Disclosed:** **ChatGPT (OpenAI)** (pre-hackathon SAR literature brainstorming), **OpenAI Codex** (preliminary documentation scaffolding, network/range budget reader prototype), and **Google Antigravity (`agy`)** (agentic engineering of pipeline extraction, TypeScript/MapLibre UI, automated test suites, independent QA checks, and competition docs under Team Owner review). See [`docs/AI_USAGE_DISCLOSURE.md`](AI_USAGE_DISCLOSURE.md).
- **Zero AI Inside Product Science (`NONE`):** Zero LLM APIs, neural networks, or ML flood classifiers execute inside **NISAR ChangeLens**. All radar calibration ($\gamma^0_{\text{dB}} = 10\log_{10}(\overline{P}_{5\times 5})$), change detection ($\Delta\gamma^0_{\text{dB}}$), 10 compatibility gates, and Q&A lookup tables are deterministic and 100% reproducible.

---

## 6. Project Links & Platform Status

- **Source Code Repository (Public):** https://github.com/4kShi/nisar-changelens
- **Live Interactive Demo URL:** *Pending owner publication on GitHub Pages / static host — runs locally via `cd frontend && npm run preview -- --port 4173 --host 127.0.0.1` (`make preview`).*
- **30-Second / Pitch Video URL:** *Pending owner screen recording and upload prior to portal freeze (scripts prepared in [`docs/PITCH_30_SECONDS.md`](PITCH_30_SECONDS.md), [`docs/PITCH_60_SECONDS.md`](PITCH_60_SECONDS.md), and [`docs/DEMO_SCRIPT.md`](DEMO_SCRIPT.md)).*
- **Slide Deck:** *Pending owner slide export (outline below and detailed talking points in [`docs/DEMO_SCRIPT.md`](DEMO_SCRIPT.md)).*

---

## 7. 7-Slide Pitch Presentation Outline

1. **Slide 1 — Title & Hook:** *NISAR ChangeLens: See Change. Understand Earth.* Split swipe view over An Giang (`Track 148, Frame 083`) unlocking `NISAR_L2_GCOV_V1` for Mekong Delta communities without GIS software.
2. **Slide 2 — The Problem:** Optical satellites (`Sentinel-2`, `Landsat`) miss tropical changes under monsoon clouds, while raw `~6 GB` HDF5 NISAR granules hide tilted swath borders (`~37%` fill) and trap naive difference maps in false positives.
3. **Slide 3 — Innovation #1: Bounded HTTP Range Pipeline:** Stage 1 (`1.15 MB`) inspects raw `/mask` first; Stage 2 (`32.66 MB`) fetches `HHHH` + `numberOfLooks` — extracting a bit-identical verified pair using **`33.81 MB` (`13.53%` of `250 MB` cap)** out of `12.23 GB`.
4. **Slide 4 — Innovation #2: Fail-Closed 10 Gates + Đồng Tháp `0%` Proof:** Side-by-side map of the tilted Descending Track `148` boundary separating An Giang (`99.91%` valid) from Đồng Tháp (`0.00%` valid `mask = 255`, blocked fail-closed).
5. **Slide 5 — Verified Physics Over Black-Box AI:** $5\times 5$ normalized linear-power boxcar $\gamma^0_{\text{dB}}$ and $\Delta\gamma^0_{\text{dB}}$ (`+0.417 dB` mean, `4.39 km²` strong increase, `0.29 km²` strong decrease) governed by **5 Evidence States** & **3-Level Interpretation Hierarchy**.
6. **Slide 6 — Product Experience (`Explore` / `Research`, `EN | VI`, Tour & Receipt):** Dual-mode MapLibre web app (~`6.6 MB` static build), 6-Act Judge Tour, and 1-click Markdown/JSON Screening & Provenance Receipt.
7. **Slide 7 — Practical Impact & Honest Roadmap:** Surface-anomaly screening for agricultural extension teams, journalists, and researchers in the Mekong Delta—with explicit disclosure of unintegrated NDWI, `HVHV` cross-pol, gauges, and field verification.

---

## 8. Dedicated Presentation Scripts & Judge Q&A

Complete, submission-ready presentation scripts and evidence-backed Q&A have been split into focused, print-ready competition references:
- **30-Second Pitch Video Script:** [`docs/PITCH_30_SECONDS.md`](PITCH_30_SECONDS.md)
- **60-Second Elevator / Team Pitch:** [`docs/PITCH_60_SECONDS.md`](PITCH_60_SECONDS.md)
- **Full 3-Minute Live Demo & Presentation Script (`EN | VI`):** [`docs/DEMO_SCRIPT.md`](DEMO_SCRIPT.md) & [`docs/DEMO_GUIDE.md`](DEMO_GUIDE.md)
- **Judge High-Rigor Technical & Scientific Q&A (`EN | VI`):** [`docs/JUDGE_QA.md`](JUDGE_QA.md)

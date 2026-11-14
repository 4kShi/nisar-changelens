# NISAR ChangeLens — 3-Minute Demonstration Guide

**Team**: `4/K`  
**Product**: **NISAR ChangeLens** (*"See Change. Understand Earth."*)  
**Challenge**: NASA Space Apps Challenge 2026 — *Dancing with the SARs*  
**Primary Region**: Mekong Delta, Vietnam (`An Giang` Verified Window & `Đồng Tháp` Diagnostic Window)

---

## 1. Quick Start before the Demo (30 Seconds)

```bash
cd frontend
npm install
npm run build
npm run preview -- --port 4173 --host 127.0.0.1
```

Open **`http://127.0.0.1:4173/`** in your browser. The application opens directly into the **Verified An Giang Window (`[104.95, 10.45, 105.05, 10.55]`)** with all 10 compatibility gates passed (`99.91%` common valid pixels).

---

## 2. 3-Minute Live Demo Script

### Minute 0:00 – 0:45 | The Problem & 4-Tier Scientific Evidence Ladder
1. **Show the Main View (`An Giang — Tri Tôn / Cô Tô Window`)**:
   - Point out that L-band SAR from the NASA-ISRO **NISAR** mission (`NISAR_L2_GCOV_V1`) sees through clouds and penetrates wetland/crop canopies in the Mekong Delta.
   - However, raw NISAR granules are **5.8 GB to 6.4 GB HDF5 files** where ~37% of the north-up bounding box is off-swath fill (`mask = 255`), and naive pixel subtraction produces false flood maps.
2. **Click `01 AOI` in the Side Rail**:
   - Highlight the **4-Tier Scientific Evidence Distinction**:
     1. **Tier 1 — Catalog Discovery**: 29 granules found in NASA CMR.
     2. **Tier 2 — Footprint Intersection**: Coarse polygon overlap.
     3. **Tier 3 — Valid Raster Coverage**: Actual HDF5 `mask` verified (`0 < mask < 255`).
     4. **Tier 4 — Scientifically Comparable Pair**: Passes all 10 orbital, radiometric, and grid-alignment gates.

### Minute 0:45 – 1:30 | Why Coarse Footprints Fail (The Đồng Tháp 0% Diagnostic Proof)
1. **Select `Mekong Delta Regional Overview (13 Provinces)`** in the Preset dropdown:
   - Point out the cyan Mekong Delta boundary, all 13 provinces, and the **tilted blue dashed Track 148 radar swath**.
   - Show how the tilted radar swath edge passes right between the **green An Giang box** (inside the swath) and the **amber Đồng Tháp box** (outside the swath, even though it was inside the coarse north-up CMR bounding box!).
2. **Click `Đồng Tháp 0% Diagnostic` in the Map HUD**:
   - Show that when we extracted the `[105.45, 10.60, 105.55, 10.70]` HDF5 subset, **100% of its 1,212,165 pixels had `mask = 255` and `HHHH = NaN`**.
   - Emphasize our **fail-closed scientific design**: instead of fabricating imagery or crashing, NISAR ChangeLens blocks comparison at **Gate 9 & Gate 10** and explains why.

### Minute 1:30 – 2:30 | Real Verified Before–After Comparison in An Giang (`99.91%` Valid)
1. **Click `An Giang Verified AOI` (or `Reset Selection`)**:
   - The map flies back to `[104.95, 10.45, 105.05, 10.55]` (`120.89 km²` window in Tri Tôn / Cô Tô, An Giang).
   - Both **October 22, 2026 (`G4404304390-ASF`)** and **November 3, 2026 (`G4410154671-ASF`)** (`NISAR_L2_GCOV_V1`, Track 148, Frame 083, Descending, Left-looking, CRID `P05036` v1.0.20) are verified on an identical `EPSG:32648` 10 m grid (`1105 × 1094` pixels) with **1,207,740 / 1,208,870 jointly valid pixels (`99.91%`)**.
2. **Interact with the on-map Before/After Swipe & Layer Bar**:
   - Click `BEFORE ↔ AFTER SWIPE` and drag the **⇄** divider across the map between `2026-10-22` (Mean $\gamma^0 = -8.742\text{ dB}$) and `2026-11-03` (Mean $\gamma^0 = -8.325\text{ dB}$).
   - Switch the map overlay between `Oct 22 γ⁰ (dB)`, `Nov 03 γ⁰ (dB)`, `Continuous Δγ⁰ (dB)`, `Classified ±3.0 dB`, and `Valid Mask (99.91%)`.
   - Point out the rectangular agricultural parcels in the southeast where $\Delta\gamma^0 \ge +3.0\text{ dB}$ (`4.39 km²`, `3.63%`) and localized decreases $\le -3.0\text{ dB}$ (`0.29 km²`, `0.24%`), while `96.13%` (`116.09 km²`) remained stable within $\pm 3.0\text{ dB}$.

### Minute 2:30 – 3:00 | 3-Level Scientific Interpretation, 10 Gates & Byte-Budget Provenance
1. **Click `04 Interpret`**:
   - Show the **3-Level Evidence Hierarchy**:
     - **Level 1 (Observed Radar Change)**: Empirical $\text{dB}$ shifts over `120.77 km²`.
     - **Level 2 (Physical Mechanisms)**: Specular reflection on smooth water ($\Delta\gamma^0 \le -3\text{ dB}$) vs L-band double-bounce in flooded emergent rice/wetland stems ($\Delta\gamma^0 \ge +3\text{ dB}$).
     - **Level 3 (Supported Conclusions & Missing Evidence)**: Why $\Delta\text{dB}$ alone never claims binary flood extent without optical NDWI, HVHV cross-pol, river gauges, and DEM RTC correction.
2. **Click `05 Gates` & Toggle `EN | VI` Language Switcher**:
   - Show all **10/10 Passed Compatibility Gates**, the **Resumable HTTP Range Byte-Budget Ledger** (`33,812,717 bytes` = `33.81 MB` used out of the `250 MB` cap — extracting a verified pair from `12.2 GB` of remote HDF5 granules using only `13.53%` of our budget!), and the **SHA-256 cryptographic checksums** for all 11 output GeoTIFF/PNG artifacts.
   - Click **`VI`** in the top header's **`EN | VI` Language Switcher** to demonstrate instantaneous switching to Vietnamese (*"Nhìn Biến Động. Hiểu Trái Đất."*) for Mekong Delta researchers and local decision-makers without reloading the page or losing any map/AOI/comparison state.

---

## 3. Verified Application Screenshots

All current verification screenshots are stored in [`docs/screenshots/`](screenshots/):
- `01_explore_mode.png` — Default **Explore** mode centered on the verified An Giang screening window (`[104.95, 10.45, 105.05, 10.55]`, `99.91%` valid coverage).
- `02_research_gates_mode.png` — **Research & Gates** mode exposing technical metadata, 29-granule catalog, 10-gate verification matrix, and HTTP Range provenance.
- `03_resized_layout.png` — Resizable workspace splitter allowing the user to expand either the interactive MapLibre canvas or the side analysis rail.
- `04_before_visualization.png` — `BEFORE (Oct 22)` calibrated $\gamma^0_{\text{HH}}$ grayscale overlay (`-8.742 dB` boxcar mean).
- `05_after_visualization.png` — `AFTER (Nov 03)` calibrated $\gamma^0_{\text{HH}}$ grayscale overlay (`-8.325 dB` boxcar mean).
- `06_change_visualization.png` — `CHANGE MAP (ΔdB)` with threshold style switching (`±2.0`, `±3.0`, `±4.0 dB` classified or continuous `ΔdB`).
- `07_compatibility_failure_explore.png` — Fail-closed Explore state when switching to the off-swath Đồng Tháp pilot bbox (`0%` valid pixels).
- `08_compatibility_report_research.png` — Research & Gates 10-gate diagnostic report explaining why incompatible or off-swath pairs are blocked.
- `09_english_interface.png` — On-map `BEFORE ↔ AFTER SWIPE` interactive split comparison in English (`EN`) with continuous vector boundaries across both panes.
- `10_vietnamese_interface.png` — Instantaneous bilingual switch to Vietnamese (`VI`) preserving active AOI, swipe/layer selection, and exact verified figures.
- `11_mobile_responsive.png` — Responsive narrow-viewport (`390×844`) layout verification.

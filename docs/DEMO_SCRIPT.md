# NISAR ChangeLens — 6-Act Presentation & Live Demo Script (`DEMO_SCRIPT.md`)

**Project**: NISAR ChangeLens (*"See Change. Understand Earth."*)  
**Team**: `4/K` (**Phạm Thành Trung**, **Lý Chấn Hưng**) · NASA Space Apps Challenge 2026 (Hanoi)  
**Target Live Flow**: `3–4 minutes` synchronized 1:1 with the built-in **`▶ 6-Act Judge Tour`** button inside the live web UI.

---

## Pre-Flight Launch (15 Seconds)

```bash
cd frontend
npm run preview -- --port 4173 --host 127.0.0.1
```
Open `http://127.0.0.1:4173/`. Click **`▶ 6-Act Judge Tour`** (`data-testid="start-tour-btn"`) at the top of the right rail to drive Acts 1–6 smoothly on screen while speaking.

---

## The 6-Act Demonstration Walkthrough

### Act 1 · Mekong Problem & Tilted Swath Trap (`~30s`)
- **UI Click**: Tour starts on **Act 1** (`Mekong Delta Regional Overview`, `Candidate` pill).
- **Show**: Cyan Mekong basin outline, 13 provinces, tilted blue dashed Track `148` swath, and `29` NASA CMR granules.
- **Say (EN)**: *"In tropical monsoons, clouds blind optical satellites over Vietnam's rice bowl. NASA-ISRO's 24 cm L-band NISAR mission penetrates clouds—but notice the tilted radar swath edge running right between green An Giang inside the swath and amber Đồng Tháp outside it. A coarse catalog box says both 'intersect' (`Candidate`), yet ~37% of a GCOV frame is empty off-swath fill."*

### Act 2 · Single-Pass Calibrated Backscatter (`~25s`)
- **UI Click**: **`Next Act →`** (**Act 2**, zooms to An Giang `Oct 22 γ⁰`, `Verified` coverage `99.91%`).
- **Say (EN)**: *"Stepping into Tri Tôn / Cô Tô (`An Giang`), our Stage 1 mask extractor verified `99.91%` valid pixels using just `1.15 MB` over HTTP Range before fetching calibrated `HHHH` backscatter (`-8.742 dB` 5×5 boxcar mean). Notice the bright Núi Tô hillslope contrast against flat darker paddy soils."*

### Act 3 · Fail-Closed Off-Swath Proof (`~35s`)
- **UI Click**: **`Next Act →`** (**Act 3**, switches to `Đồng Tháp Diagnostic 0%`, `Unavailable` comparison).
- **Show**: Honest `comparison-blocked-state` with **`Coverage: Verified`** + **`Comparison: Unavailable`**, explaining `1,212,165 / 1,212,165` pixels had `mask = 255 / HHHH = NaN`.
- **Say (EN)**: *"Watch what most hackathon viewers fail to catch: clicking our nearby Đồng Tháp pilot box proves from raw HDF5 `/mask` arrays that `0%` of pixels are valid radar data. Instead of displaying a misleading 'no-change' green box, NISAR ChangeLens blocks comparison at Gates 9–10 automatically."*

### Act 4 · Verified 12-Day Swipe & Computed Δγ⁰ (`~40s`)
- **UI Click**: **`Next Act →`** (**Act 4**, flies back to An Giang, activates **`BEFORE ↔ AFTER SWIPE`**, `Computed` pill).
- **Interact**: Drag the on-map **`⇄`** handle left/right, then toggle **`±3.0 dB`** / **`Continuous Δγ⁰`**.
- **Say (EN)**: *"Back in An Giang (`2026-10-22` to `2026-11-03`, Track `148`, Frame `083`, `CRID P05036`), every pixel shares the same `EPSG:32648 10 m` grid (`1,207,740` jointly valid pixels = `120.77 km²`). Mean L-band $\Delta\gamma^0$ shifted `+0.417 dB`, with `4.39 km²` (`3.63%`) concentrated strongly upward in southeastern plots and `0.29 km²` dropping $\le -3\text{ dB}$."*

### Act 5 · 5 Evidence States & 3-Level Guardrail (`~35s`)
- **UI Click**: **`Next Act →`** (**Act 5**, switches seamlessly into **Research & Gates Mode**, opens Section `04 Interpret`, `Inferred` pill).
- **Show**: Compact **Five-State Evidence Classification** cards (`Verified`, `Computed`, `Candidate`, `Inferred`, `Unavailable`) and the **3-Level Guardrail**.
- **Say (EN)**: *"Why don't we paint a binary 'Flood Map' with fake 95% AI accuracy? Without synchronized river gauges, optical NDWI, `HVHV` cross-pol, DEM incidence checks, or field ground truth (`Unavailable`), L-band increases could reflect emergent rice double-bounce, rougher tillage, or soil moisture. So Level 1 stays `Verified/Computed`, Level 2 stays `Inferred` hypothesis, and Level 3 waits cleanly for corroborating data."*

### Act 6 · 10 Gates, Byte Budget & 1-Click Screening Receipt (`~35s`)
- **UI Click**: **`Next Act →`** (**Act 6**, opens `05 Gates & Provenance`), toggle **`VI`** briefly in header (`EN | VI`), and click **`Download Receipt (.md)`** (`provenance-receipt-md`).
- **Say (EN)**: *"Inspecting Section 05 shows all 10 compatibility gates passed—including dynamic X/Y spacing checks—plus our `33.81 MB / 250 MB` (`13.53%`) resumable byte-budget ledger out of `12.23 GB` remote HDF5 files and 11 SHA-256 digests. In one click, local analysts export a bilingual, deterministic Markdown or JSON audit receipt ready for field review."*

---

## Closing Statement (For Finals / Q&A Transition)

*"Science starts with knowing what a sensor actually saw versus what a viewer wants to believe. NISAR ChangeLens delivers real cloud-penetrating NASA-ISRO L-band observations to the Mekong Delta at `0.3%` of the bandwidth cost, protected by 10 physical gates and 5 explicit Evidence States—in a `6.6 MB` serverless browser app built for honest Earth observation. Thank you, and we welcome your questions."*

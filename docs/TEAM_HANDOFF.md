# Independent Setup and Reproducibility Guide

> **Status: IMPLEMENTATION (NASA Space Apps 2026, started 14 Nov 2026 00:00 ICT; authorized by project owner Trung).**

This document establishes the reproducibility protocols and technical guidelines for the development and verification of **NISAR ChangeLens**.

---

## 1. Authorization & Competition Governance

- **Authorization Granted:** Full project implementation was formally authorized by project owner Phạm Thành Trung on **2026-11-14 00:00 ICT**. All pre-hackathon STOP restrictions are lifted.
- **Geographic Scope:** Strictly Mekong Delta (Đồng bằng sông Cửu Long — ĐBSCL), prioritizing Dong Thap Muoi wetland and Tram Chim National Park.
- **Self-Contained Project Workspace:** The project operates cleanly inside the `4K - Dancing with the SARs` directory with zero runtime dependency on orchestration frameworks.

---

## 2. Technical Stack & Environment

1. **Python Environment (Pipeline):**
   - Python 3.12 with GDAL 3.12, Rasterio 1.5, NumPy, `h5py`, `earthaccess`, and `shapely`.
   - Earthdata authentication is handled strictly on developer workstations via `~/.netrc` (permissions `0600`).
2. **Frontend Environment (Web GIS):**
   - Node.js 22 LTS with Vite, React 19, TypeScript, and MapLibre GL JS.
   - 100% static client build (`make web-build`), deployed to GitHub Pages. Zero backend runtime.
3. **Secret Hygiene:**
   - Under no circumstances may `.netrc`, `.env`, Earthdata credentials, or personal workstation paths be committed to Git or embedded in the web application bundle.

---

## 3. Scientific Verification & Gate Enforcement

1. **10 Compatibility Gates:** The pipeline automatically evaluates the 10 gates before executing any backscatter subtraction. Incompatible granules (mismatched orbit geometry, differing CRID or maturity, grid misalignment) are blocked from comparison.
2. **Deterministic Baseline:** All change detection uses calibrated decibel differences ($\Delta\text{dB} = \text{after}_{\text{dB}} - \text{before}_{\text{dB}}$) with $5 \times 5$ spatial speckle filtering.
3. **Honest Labeling:** All visual layers and statistics are presented under the standard label **"Potential Surface Change"**, backed by a 3-tier interpretation hierarchy.

---

## 4. Release Scope & Verification Checklist

- [x] MIT License established (`LICENSE`).
- [x] Full AI disclosure documented (`docs/AI_USAGE.md`).
- [x] Software, basemap, boundary, and satellite data attributions registered (`docs/LICENSES_AND_ATTRIBUTION.md`).
- [x] Physical and operational limitations updated (`docs/LIMITATIONS.md`).
- [x] Implementation milestones tracked (`docs/IMPLEMENTATION_LOG.md`).
- [x] Competition submission packet drafted (`docs/SUBMISSION.md`).
- [ ] Pipeline output verified with authentic NISAR L2 GCOV granules (`make pipeline`).
- [ ] Automated test suite passing (`make test`).
- [ ] Static web bundle compiled within budget (`make web-build`, initial bundle $\le 25\text{ MB}$).

# Creativity & Technical Differentiation (`CREATIVITY_AND_DIFFERENTIATION.md`)

**Project**: NISAR ChangeLens (*"See Change. Understand Earth."*)  
**Team**: `4/K` (NASA Space Apps Challenge 2026 — *Dancing with the SARs*, Hanoi)

---

## 1. Core Creative Breakthrough

Most SAR Earth-observation prototypes treat "using satellite data" as downloading entire imagery files, pushing pixels through an uncalibrated black-box segmentation model, and rendering a dramatic flood heatmap.

**NISAR ChangeLens flips the paradigm into a verifiable, bandwidth-bounded, fail-closed public instrument**:
1. **Mask-First Two-Stage HTTP Range Slicing** (`1.15 MB` metadata/mask check before touching `32.66 MB` of backscatter out of `12.23 GB` remote HDF5 files),
2. **Live Geometric Reality Check (The `Đồng Tháp 0%` Fail-Closed Proof)** demonstrating visually and programmatically why coarse CMR footprints trap naive analyzers outside tilted SAR swaths, and
3. **Zero-Hallucination Dual-Audience Scientific Storytelling (`Explore` vs `Research`, `6-Act Guided Tour`, `5 Evidence States`, and 1-Click Deterministic Receipt Export)** inside a `6.6 MB` zero-backend static web application.

---

## 2. Comparative Matrix Against Existing Approaches

| Existing Approach | Fundamental Limitation | NISAR ChangeLens Contribution | Concrete Code & Data Evidence |
| :--- | :--- | :--- | :--- |
| **Raw HDF5 + Desktop GIS (`QGIS`, `SNAP`, `h5py` full download)** | Requires downloading multi-GB (`5.8–6.5 GB`) granules per pass, specialized desktop RAM/storage, Earthdata tokens, and expert knowledge of GCOV covariance schemas & masks. | **Two-stage bounded HTTP Range pipeline** inspects HDF5 `/mask` slices first (`1.15 MB`) and fetches only gated `HHHH` + `looks` subwindows (`32.66 MB`), packaging verified static PNGs into a `6.6 MB` browser app. | [`pipeline/http_range_budget.py`](../pipeline/http_range_budget.py), [`pipeline/extract_mask_pair.py`](../pipeline/extract_mask_pair.py), [`verified_pair_manifest.json`](../data/raw/nisar_subsets/angiang_verified_pair_20261022_20261103/verified_pair_manifest.json) (`33,812,717` / `250,000,000` bytes = `13.53%`). |
| **Optical Satellite Change Viewers (`Sentinel-2`, `Landsat`)** | Cloud cover blocks observations during critical Mekong Delta monsoon transitions (up to `80–90%` overcast sky during high-water weeks). | **Authentic L-band (`24 cm`) SAR backscatter (`NISAR_L2_GCOV_V1`)** observes wetland surface and paddy scattering shifts regardless of cloud cover or solar illumination. | [`ACQUISITIONS`](../frontend/src/data/study.ts) (`2026-10-22` `11:31 UTC` & `2026-11-03` `11:31 UTC`, `99.91%` valid mask under descending Track `148`). |
| **Naive Two-Date SAR Subtraction & Coarse Bbox Filtering** | Comparing cross-track/cross-CRID passes or trusting coarse north-up CMR bounding boxes over tilted radar swaths produces half-pixel illusions, mixed calibrations, or silent `NaN`/fill corruption. | **10 Fail-Closed Compatibility Gates** verify maturity, polarization, track/frame/look geometry, CRID (`P05036`), dynamic X/Y grid alignment (`10 m × 10 m`), overlap, and valid masks (`0 < mask < 255`). Exposes `Đồng Tháp` `[105.45, 10.60, 105.55, 10.70]` as `0%` valid off-swath. | [`pipeline/gates.py`](../pipeline/gates.py), [`test_gates_dynamic_resolution.py`](../tests/pipeline/test_gates_dynamic_resolution.py), [`MEKONG_DELTA_VALID_COVERAGE.md`](MEKONG_DELTA_VALID_COVERAGE.md) (`1,212,165 / 1,212,165` `mask = 255` proof). |
| **Unvalidated Black-Box AI / Deep Learning Flood Classifiers** | Applying Sentinel-1 or optical-trained foundation models to newly commissioned L-band NISAR imagery with zero synchronized field ground truth produces uncalibrated hallucinations and fake "confidence %" scores. | **100% Deterministic Physics + 5 Epistemic Evidence States (`Verified`, `Computed`, `Candidate`, `Inferred`, `Unavailable`)** plus the **3-Level Guardrail**. Explicitly forbids synthetic accuracy numbers (`fabricated_confidence_score: null`). | [`pipeline/extract_verified_pair.py`](../pipeline/extract_verified_pair.py) (`normalized_boxcar_5x5` + `10*log10(P)`), [`frontend/src/data/receipt.ts`](../frontend/src/data/receipt.ts), [`docs/FINAL_SCIENTIFIC_QA.md`](FINAL_SCIENTIFIC_QA.md). |
| **Cloud-Hosted API Dashboards Requiring User Login / GPU Servers** | Public URLs stall on NASA token expiry (`HTTP 401/403`), incur runtime cloud cost, expose signed URLs, or overload during demo traffic spikes. | **Zero-Backend Static Web GIS** (`React 19 + TypeScript + MapLibre GL JS 6`) with `EN | VI` instant switching, **6-Act Guided Judge Tour**, **on-map Swipe Divider**, and offline **1-Click `.md`/`.json` Receipt Export**. | [`frontend/src/App.tsx`](../frontend/src/App.tsx), [`frontend/src/components/MapStage.tsx`](../frontend/src/components/MapStage.tsx), `frontend/dist/` (`6.6 MB`, `0` secrets). |

---

## 3. Why "Honest Subtraction + Off-Swath Rejection" Is Genuine Innovation

In satellite engineering competitions, **refusing to show a false result is often harder—and far more original—than faking a green map**. By making the **Đồng Tháp `0%` off-swath rejection** a flagship interactive teaching moment inside Act 3 of the **6-Act Guided Tour** and pairing it with cryptographic SHA-256 verification and exportable Markdown/JSON receipts, Team `4/K` turns dry HDF5 quality-control engineering into an intuitive story any citizen or judge can test live in 10 seconds.

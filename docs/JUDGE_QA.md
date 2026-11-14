# Judge Technical & Scientific Q&A Reference (`JUDGE_QA.md`)

**Project**: NISAR ChangeLens (*"See Change. Understand Earth."*) · Team `4/K` (Hanoi, Vietnam)

---

### Q1. Why didn't you run a Deep Learning / Foundation Model (e.g., Prithvi / SAM) to output a binary flood mask?
- **EN**: *"Because we have zero synchronized field inundation truth or river gauge telemetry across our An Giang 12-day window in Oct–Nov 2026 (`Level 3: Unavailable`). Applying a pre-trained Sentinel-1 C-band or optical flood model directly onto L-band NISAR `HHHH` without calibration would fabricate unverified classifications and fake confidence scores. Instead, ChangeLens runs a `100%` deterministic linear-power 5×5 boxcar calibration ($\Delta\gamma^0_{\text{dB}}$) with `zero` ML models inside product analysis (`AI_USAGE_DISCLOSURE.md`), strictly separating `Computed` dB measurements from `Inferred` physical hypotheses."*
- **VI**: *"Vì chúng tôi không có dữ liệu kiểm chứng ngập thực địa hay mực nước trạm đo đồng bộ cho cặp ngày 22/10–03/11 (`Tầng 3: Không khả dụng`). Đem mô hình AI huấn luyện trên ảnh quang học hoặc C-band gán sang băng L NISAR sẽ tạo ảo giác phân loại. Thay vào đó, ChangeLens dùng toán học tán xạ radar xác định 100%, lọc boxcar 5×5 trên công suất tuyến tính và gắn nhãn rõ ràng giữa số đo Tính toán và giả thuyết Suy luận."*

### Q2. Why does Dong Thap Pilot (`[105.45, 10.60, 105.55, 10.70]`) show 0% valid coverage even though it intersects the Track 148 CMR box?
- **EN**: *"NISAR GCOV HDF5 tiles are north-up UTM rectangles containing ~37% off-swath fill (`mask = 255`, `HHHH = NaN`) around tilted radar swaths. While our Đồng Tháp pilot box intersects the coarse rectangular CMR metadata polygon (`Candidate`), our Stage 1 bounded `/mask` slice extracted `1,212,165` pixels directly from the remote HDF5 and confirmed `100%` were `mask = 255`. By blocking Gates 9–10 fail-closed, ChangeLens proves honest geometric validation instead of rendering `NaN` or false stability."*

### Q3. Why is the smoothed backscatter mean (`-8.742 dB`) ~1.05 dB higher than the unsmoothed single-pixel mean (`-9.793 dB`), yet Δγ⁰ stays unbiased?
- **EN**: *"Speckle follows a skewed Rayleigh/gamma intensity distribution. Because $f(P) = 10\log_{10} P$ is strictly concave, **Jensen's inequality** implies $\mathbb{E}[10\log_{10} P] < 10\log_{10}\mathbb{E}[P]$. Averaging 25 linear power looks inside the 5×5 window reduces speckle variance before taking the logarithm, raising both Oct 22 and Nov 03 single-date means symmetrically by `~1.05 dB` (`W-2` in `FINAL_SCIENTIFIC_QA.md`) while keeping the log-ratio change mean `+0.417 dB` (`Nov 03 − Oct 22`) unbiased."*

### Q4. How do you ensure `normalized_boxcar_5x5` never smears zeros or `NaN`s from invalid pixels into valid neighbors?
- **EN**: *"Our filter zeroes invalid pixels only in the numerator (`clean`) and divides by the local fraction of valid neighbors `norm = uniform_filter(valid, 5)`, rejecting any neighborhood where `norm <= 0.2`. Independent reproduction verified max absolute difference of $2.38\times 10^{-7}$ against an exact valid-only sliding patch mean. Furthermore, sensitivity between per-date normalization vs joint-mask normalization near the `86` date-asymmetric `mask = 0` Núi Tô shadow pixels shifts `±3.0 dB` class areas by $\le 0.01\text{ km}^2$ and shifts mean/median Δγ⁰ by `0.000 dB` (`W-1`)."*

### Q5. What prevents incompatible granules (different tracks, CRIDs, or shifted pixels) from being subtracted?
- **EN**: *"Our 10-Gate engine (`pipeline/gates.py`) checks collection maturity (`VALIDATED` vs `PROVISIONAL`), polarization/frequency (`frequencyA/HHHH`), identical Track/Frame/Orbit Direction/Look (`148/083/Descending/Left`), identical processor CRID (`P05036`), CRS + independent dynamic X/Y pixel spacing + half-pixel offset alignment (`P0-2`, verified via `test_gates_dynamic_resolution.py`), spatial overlap, valid mask coverage (`≥80%`), finite radiometric positivity, and effective posting resolution."*

### Q6. How can a static browser app avoid downloading 12+ GB NISAR HDF5 files?
- **EN**: *"We separate offline bounded extraction from static web delivery. On an authenticated developer environment (`~/.netrc`), `pipeline/http_range_budget.py` wraps `fsspec` + `h5py` in a strict `250 MB` cumulative byte cap—rejecting HTTP `200`, chunked streams, or oversized reads—pulling just `1.15 MB` in Stage 1 (`/mask`) and `32.66 MB` in Stage 2 (`HHHH` + `numberOfLooks`). The public frontend loads pre-verified PNG overlays (`EPSG:4326` maplibre `image` sources) plus GeoJSON boundaries inside a `6.6 MB` static bundle requiring zero backend servers or Earthdata logins."*

### Q7. How do you convert "Potential Surface Change" into an operational agricultural flood warning next?
- **EN**: *"Four concrete integrations documented in `IMPACT_AND_USE_CASE.md`: (1) pull `HVHV` cross-polarized covariance from the same GCOV files to compute `HH/HV` polarization ratios; (2) fuse cloud-free `Sentinel-2`/`Landsat` `NDWI` windows; (3) align MRC & An Giang provincial canal gauge stations (`Châu Đốc`, `Tân Châu`, `Tri Tôn`); and (4) add DEM local-incidence normalization around steep slopes like Núi Tô alongside local field crop calendars."*

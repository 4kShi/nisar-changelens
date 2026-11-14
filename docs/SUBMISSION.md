# Project Submission: NISAR ChangeLens

> **NASA Space Apps Challenge 2026**  
> **Challenge Track:** Dancing with the SARs  
> **Location:** Hanoi, Vietnam  
> **Team:** NISAR ChangeLens Team (Lead: Phạm Thành Trung)  
> **Status:** IMPLEMENTATION  

---

## 1. Project Information

- **Project Name:** NISAR ChangeLens — Mekong Delta Surface Change Explorer
- **Slogan:** *See Change. Understand Earth.*
- **Target Region:** Mekong Delta (Đồng bằng sông Cửu Long - ĐBSCL), Vietnam (Priority: Dong Thap Muoi wetland)

### High-Level Summary (≤ 150 words)
NISAR ChangeLens is an open-source, serverless web application that empowers citizens and researchers to observe and understand environmental surface changes across Vietnam's Mekong Delta using newly available NASA-ISRO SAR (NISAR) L2 GCOV satellite data. Built for NASA Space Apps Challenge 2026 ("Dancing with the SARs"), ChangeLens solves the complexity barrier of synthetic aperture radar through a guided 4-step UX: Discover, Observe, Compare, and Understand. Rather than unverified black-box AI, ChangeLens enforces scientific rigor: 10 automated compatibility gates, deterministic decibel backscatter differencing, speckle filtering, and a 3-level interpretation hierarchy that prevents over-claiming. Visitors interactively explore high-resolution radar imagery via a responsive split-screen swipe slider without requiring logins, backend servers, or GIS expertise. ChangeLens transforms complex Earth observation radar into transparent, reproducible, and accessible insights into seasonal wetland dynamics in Dong Thap Muoi.

*(Word count: 136 words)*

---

## 2. Project Details

### The Challenge
Optical Earth observation satellites are routinely blind to tropical wetland dynamics due to perpetual cloud cover and monsoon rains. Synthetic Aperture Radar (SAR), specifically NASA and ISRO's newly commissioned NISAR satellite, penetrates clouds, day and night, providing calibrated microwave observations. However, raw SAR data is locked behind specialized software, heavy HDF5 files, and complex physics (covariance matrices, speckle noise, and orbital geometries), creating an insurmountable barrier for decision-makers and citizens.

### The Solution: NISAR ChangeLens
NISAR ChangeLens provides an accessible, fully reproducible, and scientifically honest web GIS application that tracks surface water and wetland dynamics in the Mekong Delta:
- **No-Backend Static Architecture:** An offline Python processing pipeline ingests NISAR L2 GCOV products, runs strict validation gates, computes backscatter differences, and pre-renders multi-resolution map tiles. The web application runs 100% statically on GitHub Pages with zero server cost, zero database latency, and no user login friction.
- **The 4-Step UX:**
  1. **Discover:** Select AOI in the Mekong Delta and view authentic acquisition dates.
  2. **Observe:** Inspect single-pass calibrated L-band radar backscatter (`gamma0` in dB).
  3. **Compare:** Smooth interactive swipe slider comparing before/after passes and backscatter difference ($\Delta\text{dB}$).
  4. **Understand:** Contextual scientific narrative with 3 interpretation levels, clear provenance, and transparent limitations.
- **Explore vs. Research Mode:** A seamless toggle gives casual explorers a clean visual interface while offering researchers full metadata provenance, radar parameters, processing logs, and gate validation receipts.

---

## 3. NASA & Partner Space Agency Data

### NASA Data Used
- **Collection:** NISAR L2 Geocoded Covariance (GCOV), L-band, `frequencyA/HHHH` (diagonal calibrated radar backscatter power, `gamma0` linear).
- **Distributor:** Alaska Satellite Facility (ASF) DAAC / NASA Earthdata.
- **Data Access:** Accessed programmatically via `earthaccess` with Earthdata Login.
- **Data Granules:**
  - Before Pass: `NISAR_L2_PR_GCOV_032_155_A_006_2005_DHDH_M_20261010T222732_20261010T222741_P05023_N_P_J_001.h5` (Track 155, Frame 006, 2026-10-10 22:27:32 UTC, CRID P05023, Provisional)
  - After Pass: `NISAR_L2_PR_GCOV_033_155_A_006_2005_DHDH_M_20261022T222732_20261022T222742_P05023_N_P_J_001.h5` (Track 155, Frame 006, 2026-10-22 22:27:32 UTC, CRID P05023, Provisional)
- **Data Citation:**
  > *"NISAR L2 GCOV, NASA/ISRO, distributed by ASF DAAC, accessed 2026-11-14."*

### Space Agency Partner
- **Indian Space Research Organisation (ISRO):** Co-developer and operator of the dual-frequency (L-band and S-band) NISAR mission. NISAR represents historic space cooperation between NASA and ISRO for global Earth surface observation.

---

## 4. Tools, Libraries & Platforms

- **Data Processing (Offline Pipeline):** Python 3.12, GDAL 3.12, Rasterio 1.5, NumPy, `h5py`, `earthaccess`, `shapely`.
- **Frontend Web Application:** React 19, TypeScript, Vite, MapLibre GL JS, TailwindCSS, Lucide Icons.
- **Geospatial & Basemaps:** geoBoundaries (Vietnam provincial boundaries CC BY 4.0), OpenFreeMap / CARTO basemaps.
- **Hosting & CI/CD:** GitHub Actions, GitHub Pages.

---

## 5. AI Assistance Disclosure

- **ChatGPT (OpenAI):** Conceptual research discussions, SAR boundary definition, and UX workflow formulation prior to the hackathon.
- **OpenAI Codex:** Drafting preliminary documentation scaffolding and packaging structure prior to development start.
- **Google Antigravity (`agy`):** Multi-agent orchestrator managing parallel development workflows (`pipeline`, `frontend`, `docs`, `qa-security`) during the authorized implementation phase.
- **Scientific Integrity:** **Zero AI models inside the product analysis.** All change detection is deterministic radar physics ($P_{\text{dB}} = 10\log_{10}P$; $\Delta\text{dB} = \text{after}_{\text{dB}} - \text{before}_{\text{dB}}$). Human team members conducted all scientific reviews, verification, and code approvals.

---

## 6. Project Links

- **Source Code Repository:** `<!-- RESULTS: GITHUB_REPO_URL -->` (e.g., https://github.com/trungpham/nisar-changelens)
- **Live Interactive Demo:** `<!-- RESULTS: LIVE_DEMO_URL -->` (e.g., https://trungpham.github.io/nisar-changelens)
- **Demo Video:** `<!-- RESULTS: VIDEO_URL -->`

---

## 7. 7-Slide Pitch Presentation Outline

- **Slide 1: Title & Hook**
  - *Headline:* NISAR ChangeLens: See Change. Understand Earth.
  - *Visual:* High-contrast radar split-screen over Dong Thap Muoi wetland.
  - *Key Message:* Transforming complex NASA-ISRO microwave radar into intuitive, accessible environmental intelligence for Vietnam's Mekong Delta.

- **Slide 2: The Challenge: The Tropical Blindspot**
  - *Headline:* Optical Satellites Can't See Through Monsoon Clouds. SAR Can.
  - *Visual:* Side-by-side: Optical cloud-covered satellite image vs. crisp, cloud-penetrating NISAR L-band SAR backscatter.
  - *Key Message:* The Mekong Delta faces extreme climate dynamics, but optical imagery is blocked during peak flooding season. NISAR provides cloud-penetrating radar, but its complex data format is inaccessible to non-specialists.

- **Slide 3: The Solution: The 4-Step UX Experience**
  - *Headline:* Discover → Observe → Compare → Understand
  - *Visual:* Clean UI mockups showing the intuitive journey from region selection to split-screen swipe and narrative explanation.
  - *Key Message:* ChangeLens strips away GIS complexity. Anyone—from high school students to environmental journalists—can immediately observe authentic satellite radar.

- **Slide 4: Scientific Honesty: The 10 Compatibility Gates**
  - *Headline:* Why You Can't Just Subtract Two Radar Images.
  - *Visual:* Flowchart of the 10 automated physical gates (Maturity, CRID, Geometry, Grid, Frequency, Polarization, etc.).
  - *Key Message:* Incompatible radar passes produce optical illusions. Our pipeline automatically enforces 10 strict physical gates before comparison is ever permitted.

- **Slide 5: Transparent Methodology: No AI Hallucinations**
  - *Headline:* Deterministic Radar Physics Over Black-Box AI.
  - *Visual:* Formula breakdown: $P_{\text{dB}} = 10 \cdot \log_{10}(P)$ and $\Delta\text{dB} = \text{after} - \text{before}$ with 5×5 speckle suppression.
  - *Key Message:* Rather than training unreliable deep learning models with zero ground truth, ChangeLens delivers verifiable decibel differencing and a 3-level interpretation hierarchy labeled "Potential Surface Change".

- **Slide 6: Architecture: 100% Serverless, Static & Fast**
  - *Headline:* Offline Python Powerhouse Meets Zero-Cost Static Delivery.
  - *Visual:* Architecture diagram: Raw NISAR HDF5 → Offline Python Pipeline → Static Web Assets (`catalog.json`, XYZ tiles) → React + MapLibre GL JS on GitHub Pages.
  - *Key Message:* No backend servers to crash, zero cloud hosting costs, no user logins, and lightning-fast client-side MapLibre rendering.

- **Slide 7: Impact, Honesty & The Future**
  - *Headline:* Empowering Local Decisions in the Mekong Delta.
  - *Visual:* Roadmap: Multi-polarization (HV), expanded AOIs, automated Sentinel-1 cross-calibration.
  - *Key Message:* ChangeLens proves how open space data, rigorous science, and thoughtful design can protect vulnerable deltas worldwide.

---

## 8. 30-Second Video Pitch Script

- **[0:00 - 0:05] Hook:**  
  *Visual:* Dramatic drone zoom into Mekong Delta rice fields transitioning into heavy cloud cover.  
  *Voiceover (Energetic, clear):* "During monsoon season, Vietnam's Mekong Delta is invisible to regular satellites. But radar sees right through the storm."

- **[0:05 - 0:13] The Problem & Solution:**  
  *Visual:* Complex HDF5 code transforming smoothly into the intuitive NISAR ChangeLens web interface.  
  *Voiceover:* "Introducing NISAR ChangeLens: unlocking NASA and ISRO's newest radar satellite for everyone."

- **[0:13 - 0:22] Core Feature Demo:**  
  *Visual:* User dragging the interactive split swipe slider over Dong Thap Muoi; vibrant blue radar backscatter drop revealing potential water inundation.  
  *Voiceover:* "Discover, observe, and compare genuine L-band radar observations with our interactive swipe lens—backed by 10 strict scientific compatibility gates."

- **[0:22 - 0:30] Call to Action:**  
  *Visual:* Explore/Research mode toggle showing metadata transparency; URL and NASA Space Apps 2026 logo.  
  *Voiceover:* "No login. No server delay. Pure, verifiable Earth observation. NISAR ChangeLens: See Change. Understand Earth."

---

## 9. Kịch Bản Thuyết Trình Tiếng Việt (5–7 Phút)

**Người trình bày:** Đại diện đội NISAR ChangeLens  
**Thời lượng:** 5 – 7 phút  
**Đối tượng lắng nghe:** Ban giám khảo NASA Space Apps Challenge 2026 (Hà Nội)

---

### [0:00 - 1:00] Phần 1: Mở đầu & Bối cảnh bài toán
Kính chào Ban Giám Khảo và toàn thể các bạn!

Đồng bằng sông Cửu Long là vựa lương thực nuôi sống hàng chục triệu người, nhưng cũng là một trong những vùng đồng bằng dễ bị tổn thương nhất trên thế giới trước biến đổi khí hậu, nước biển dâng và các chu kỳ lũ lụt, hạn mặn thất thường. 

Để theo dõi sự thay đổi bề mặt đất và mặt nước, chúng ta thường nghĩ ngay đến ảnh vệ tinh quang học như Sentinel-2 hay Landsat. Thế nhưng, vào mùa mưa bão — thời điểm mà lũ về mạnh nhất và sự thay đổi diễn ra khốc liệt nhất — bầu trời Đồng bằng sông Cửu Long bị mây phủ kín tới 80–90% thời gian. Vệ tinh quang học gần như "mù" hoàn toàn.

Và đó chính là lý do sứ mệnh vệ tinh **NISAR** của NASA và ISRO ra đời — mang theo radar khẩu độ tổng hợp sóng L (L-band SAR) có khả năng xuyên mây, xuyên mưa, hoạt động bất kể ngày đêm để quan sát bề mặt Trái Đất. Hôm nay, đội chúng tôi xin giới thiệu: **NISAR ChangeLens — See Change. Understand Earth.**

---

### [1:00 - 2:00] Phần 2: Rào cản tiếp cận SAR & Triết lý sản phẩm
Mặc dù dữ liệu radar NISAR L2 GCOV là nguồn tài nguyên mở vô giá do NASA và ASF DAAC phân phối, nhưng người dùng thông thường, các nhà báo môi trường, hay thậm chí cán bộ địa phương hầu như không thể tiếp cận được. 

Tại sao? Vì mỗi file ảnh NISAR nặng hàng gigabyte ở định dạng HDF5 phức tạp, chứa ma trận hiệp phương sai radar, nhiễu đốm speckle, và đòi hỏi các phần mềm GIS chuyên dụng cực kỳ nặng nề.

Chúng tôi đặt ra câu hỏi: *Làm thế nào để đưa dữ liệu radar tối tân này đến tay mọi người một cách nhanh chóng, trực quan nhưng phải tuyệt đối chuẩn xác về mặt khoa học?*

Câu trả lời của chúng tôi là quy trình trải nghiệm 4 bước mang tên: **Discover → Observe → Compare → Understand**.

---

### [2:00 - 3:30] Phần 3: Trải nghiệm 4 Bước trên Web GIS Tĩnh
Xin mời Ban Giám Khảo cùng trải nghiệm sản phẩm trực tiếp trên màn hình:

- **Bước 1 — Discover (Khám phá):** Người dùng chọn khu vực quan sát tại Đồng bằng sông Cửu Long, với tâm điểm ưu tiên là vùng đất ngập nước **Đồng Tháp Mười**. Hệ thống hiển thị rõ ràng thông tin thu nhận của cặp ảnh vệ tinh NISAR thực tế.
- **Bước 2 — Observe (Quan sát):** Người dùng có thể chiêm ngưỡng ảnh radar đơn lẻ đã được hiệu chuẩn tán xạ ngược (`gamma0` theo thang đo decibel - dB). Chúng ta thấy rõ sự phân hóa giữa mặt nước phẳng, đồng ruộng và thảm thực vật.
- **Bước 3 — Compare (So sánh):** Đây là trái tim của giao diện. Với thanh trượt **Swipe Slider** mượt mà, người dùng có thể kéo qua lại giữa hai thời điểm (trước và sau) hoặc bật lớp chênh lệch tán xạ ($\Delta\text{dB}$). Vùng tán xạ suy giảm mạnh ($\le -3\,\text{dB}$) hiển thị màu xanh lam nổi bật — báo hiệu sự xuất hiện của mặt nước mở mới.
- **Bước 4 — Understand (Thấu hiểu):** Thay vì chỉ quẳng ra một tấm bản đồ màu mè, ChangeLens cung cấp diễn giải khoa học theo **3 tầng rõ ràng**: từ tín hiệu radar đo được, giả thuyết hiện tượng bề mặt, đến khuyến nghị kiểm chứng thực địa. 

Đặc biệt, hệ thống có nút chuyển đổi giữa **Chế độ Khám phá (Explore)** cho công chúng và **Chế độ Nghiên cứu (Research)** hiển thị tường minh toàn bộ metadata, thông số quỹ đạo, và chứng nhận kiểm định.

---

### [3:30 - 4:45] Phần 4: Bản lĩnh Khoa học — 10 Cổng Tương Thích & Nói "Không" với AI Giả Tạo
Rất nhiều dự án hackathon mắc phải sai lầm chết người: lấy 2 bức ảnh radar chụp khác quỹ đạo, khác góc chiếu hoặc khác mức xử lý rồi trừ thẳng cho nhau, tạo ra những kết quả thay đổi "ảo" đánh lừa mắt nhìn.

NISAR ChangeLens giải quyết triệt để vấn đề này bằng **10 Cổng Tương Thích (Compatibility Gates)** tự động kiểm tra nghiêm ngặt trước khi cho phép so sánh:
1. Độ hoàn thiện sản phẩm (Maturity & CRID)
2. Phiên bản thuật toán xử lý
3. Đại lượng vật lý và đơn vị đo
4. Tần số và phân cực (L-band HHHH)
5. Hướng bay và hình học quỹ đạo (Track/Frame)
6. Hệ tọa độ và khớp lưới pixel (Affine alignment)
7. Diện tích giao thoa vùng phủ
8. Mặt nạ NoData và dữ liệu hợp lệ
9. Chất lượng bức xạ radar
10. Độ phân giải hiệu dụng

Về phương pháp: Chúng tôi **chủ động không sử dụng mô hình AI hộp đen** trong lõi xử lý. Khi không có dữ liệu thực địa (ground truth) đồng bộ, việc áp AI vào sẽ dẫn đến hiện tượng "ảo giác" (hallucination) nguy hiểm. Chúng tôi sử dụng toán học radar xác định: lọc nhiễu đốm speckle 5×5, chuyển đổi logarithmic chuẩn $P_{\text{dB}} = 10\log_{10}(P)$, và tính toán chênh lệch $\Delta\text{dB}$. Nhãn hiển thị luôn trung thực: **"Potential Surface Change" (Biến động bề mặt tiềm năng)** chứ không khẳng định bừa bãi là "lũ lụt".

---

### [4:45 - 5:45] Phần 5: Kiến trúc Kỹ thuật — 100% Serverless, Tĩnh & Tối Ưu
Về mặt kỹ thuật, hệ thống chia làm 2 phần độc lập:
1. **Pipeline Python Offline:** Tự động kết nối Earthdata qua `earthaccess`, trích xuất HDF5, chạy 10 cổng kiểm định, cắt theo đường ranh giới ĐBSCL, và xuất ra các mảnh bản đồ chuẩn XYZ web tiles và file hợp đồng `manifest.json`.
2. **Frontend Static Web:** Xây dựng bằng React, TypeScript, Vite và MapLibre GL JS. Toàn bộ ứng dụng chạy tĩnh 100% trên GitHub Pages. 

Ưu điểm vượt trội:
- **Tốc độ cực nhanh:** Thời gian tải trang ban đầu dưới 25MB.
- **Không có backend runtime:** Không cần server FastAPI hay cơ sở dữ liệu đắt đỏ, không bao giờ bị nghẽn mạng hay sập server khi có hàng ngàn người truy cập cùng lúc.
- **Bảo mật tuyệt đối:** Không chứa bất kỳ API token hay thông tin đăng nhập cá nhân nào trong bundle web. Người dùng vào xem ngay lập tức mà không cần tạo tài khoản.

---

### [5:45 - 6:30] Phần 6: Tác động Xã hội, Giới hạn & Lời kết
Kính thưa Ban Giám Khảo,
Chúng tôi không tuyên bố ChangeLens là một hệ thống cảnh báo thiên tai khẩn cấp thay thế cơ quan nhà nước. Chúng tôi công khai rõ ràng các giới hạn vật lý: hiện tượng sóng gió làm nhám mặt nước, chu kỳ 12 ngày của vệ tinh, và sự cần thiết của dữ liệu kiểm chứng độc lập.

Nhưng NISAR ChangeLens đã chứng minh rằng: **Dữ liệu vũ trụ tối tân của NASA và ISRO hoàn toàn có thể trở nên gần gũi, minh bạch và hữu ích cho cộng đồng.** ChangeLens là chiếc kính lúp giúp người dân Việt Nam nhìn thấy sự thay đổi của quê hương, và từ đó, cùng nhau thấu hiểu và bảo vệ Trái Đất.

Xin trân trọng cảm ơn Ban Giám Khảo! Đội ngũ chúng tôi sẵn sàng lắng nghe câu hỏi.

---

## 10. 8 Câu Hỏi & Trả Lời Dự Đoán Cho Ban Giám Khảo (Q&A)

### Câu 1: Tại sao đội không dùng Deep Learning hay Foundation Models (như SAM 2, Prithvi-EO, TerraMind) để nhận diện ngập lụt tự động?
**Trả lời:**  
"Đây là quyết định kiến trúc có chủ đích dựa trên sự trung thực khoa học. Thứ nhất, dữ liệu NISAR là dữ liệu hoàn toàn mới (mới phóng và đang trong giai đoạn checkout), chưa hề có tập dữ liệu kiểm chứng mặt đất (ground truth) đồng bộ tại Đồng bằng sông Cửu Long trong cùng khung giờ vệ tinh quét qua. Việc 'gán bừa' một mô hình AI huấn luyện trên Sentinel-1 hoặc ảnh quang học sang NISAR L-band mà không fine-tune sẽ gây ra hiện tượng ảo giác (hallucination) và sai lệch nghiêm trọng. Thứ hai, bài toán thay đổi tán xạ radar $L$-band có cơ sở vật lý rất rõ ràng: nước phẳng phản xạ gương làm giảm tán xạ ngược ($\Delta\text{dB} \le -3$). Phương pháp toán học xác định (deterministic baseline) hoàn toàn minh bạch, tái lập được 100%, không tốn tài nguyên GPU của người dùng và là tiêu chuẩn vàng trước khi nghĩ đến việc thử nghiệm AI trong tương lai."

### Câu 2: Làm sao đảm bảo hai ảnh vệ tinh NISAR ở hai ngày khác nhau thực sự so sánh được với nhau mà không bị sai lệch góc nhìn hay độ cao?
**Trả lời:**  
"Pipeline của chúng tôi cài đặt **10 Cổng Tương Thích (Compatibility Gates)** tự động chặn đứng việc so sánh nếu vi phạm nguyên lý SAR:
- Cổng 5 bắt buộc hai ảnh phải cùng một Track quỹ đạo (cùng Track 155), cùng Frame (Frame 006) và cùng hướng bay (Ascending). Nhờ đó, hình học quan sát và góc tới (incidence angle) của chùm sóng radar tại mỗi điểm trên mặt đất là đồng nhất.
- Cổng 6 kiểm tra ma trận Affine Transform và hệ tọa độ bản đồ (EPSG:32648 / WGS 84 UTM Zone 48N). Nếu hai ảnh lệch nhau dù chỉ nửa pixel, cổng sẽ báo FAIL và hủy lệnh tạo bản đồ so sánh.
- Cổng 1 & 2 kiểm tra cấp xử lý (L2 GCOV) và mã cấu hình xử lý (CRID) để đảm bảo cùng mức độ hiệu chuẩn bức xạ."

### Câu 3: Khi tán xạ radar giảm ($\Delta\text{dB} \le -3$), liệu có chắc chắn 100% là do ngập nước hoặc lũ lụt không?
**Trả lời:**  
"Hoàn toàn không chắc chắn 100%, và đó là lý do chúng tôi đặt tên lớp dữ liệu là **'Potential Surface Change' (Biến động bề mặt tiềm năng)** chứ không ghi là 'Bản đồ ngập lụt'. Trong vật lý radar sóng L:
- Tán xạ giảm mạnh thường do mặt nước phẳng lặng gây phản xạ gương (specular reflection).
- Tuy nhiên, hiện tượng đất bị thu hoạch mùa màng trơ trụi, hoặc đất khô nứt nẻ bị xới xáo cũng có thể làm thay đổi hệ số tán xạ.
- Ngược lại, nếu gió lớn thổi mạnh trên mặt nước tạo sóng lăn tăn, tán xạ của nước có thể tăng lên do hiện tượng tán xạ Bragg.
Vì vậy, giao diện ChangeLens áp dụng **3 tầng diễn giải**: tầng 1 là số đo vật lý dB thực, tầng 2 là giả thuyết khoa học, và tầng 3 chỉ khẳng định kết luận khi có nguồn kiểm chứng độc lập."

### Câu 4: Tại sao đội lại giới hạn phạm vi strictly tại Đồng bằng sông Cửu Long (ĐBSCL) và ưu tiên Đồng Tháp Mười?
**Trả lời:**  
"Theo tiêu chí của NASA Space Apps, tính ứng dụng địa phương và sự tập trung sâu sắc luôn giá trị hơn việc bao phủ dàn trải nhưng nông cạn. Đồng bằng sông Cửu Long là vùng chịu tác động khí hậu nặng nề nhất của Việt Nam, và Đồng Tháp Mười là vùng trũng ngập lũ tự nhiên đóng vai trò túi điều tiết nước khổng lồ. Bằng cách giới hạn chặt chẽ trong ĐBSCL (bounding box lon/lat `[104.4, 8.5, 106.9, 11.2]`) và dùng ranh giới hành chính geoBoundaries để cắt mặt nạ (clip mask), chúng tôi đảm bảo dữ liệu xử lý có ý nghĩa sinh thái trọn vẹn, không lãng phí băng thông hiển thị những vùng ngoài rìa không liên quan."

### Câu 5: Dữ liệu ảnh radar rất nặng, làm thế nào hệ thống web chạy mượt trên cả điện thoại di động mà không cần backend hay máy chủ GPU?
**Trả lời:**  
"Chúng tôi sử dụng chiến lược **Pre-rendered Static Pyramid**:
- Toàn bộ công việc tính toán nặng nhọc (đọc HDF5, tính logarit dB, trừ ma trận, lọc speckle) được xử lý offline trong pipeline Python bằng NumPy và GDAL.
- Kết quả được xuất thành các mảnh bản đồ tĩnh chuẩn XYZ Web Tiles (EPSG:3857) theo các mức zoom định sẵn, dung lượng mỗi mảnh chỉ vài chục kilobyte.
- Phía trình duyệt, thư viện MapLibre GL JS tận dụng card đồ họa (WebGL) của chính thiết bị người dùng để render mượt mà ở tốc độ 60fps. Tổng dung lượng tải trang đầu tiên dưới 25MB, giúp người dân vùng sâu vùng xa dùng mạng 4G vẫn tải và tương tác mượt mà."

### Câu 6: Đội giải quyết hiện tượng nhiễu đốm (speckle noise) đặc trưng của ảnh radar SAR như thế nào?
**Trả lời:**  
"Nhiễu đốm là hiện tượng giao thoa sóng kết hợp nội tại trong mọi hệ thống SAR. Nếu không lọc mà lấy hiệu số trực tiếp, bản đồ sẽ lấm tấm hạt muối tiêu và gây hiểu nhầm về biến động cục bộ. Pipeline của chúng tôi tích hợp bộ lọc không gian (spatial filter) kích thước $5 \times 5$ (boxcar / median filter) trên lưới dữ liệu trước khi chuyển đổi sang decibel. Kích thước $5 \times 5$ là điểm cân bằng tối ưu giữa việc triệt tiêu phương sai nhiễu hạt và việc bảo toàn các ranh giới địa hình sắc nét như bờ kênh, đê bao tại vùng Đồng Tháp Mười."

### Câu 7: Vai trò của đối tác ISRO (Ấn Độ) trong dự án này là gì?
**Trả lời:**  
"Vệ tinh NISAR là viết tắt của **NASA-ISRO Synthetic Aperture Radar** — dự án hợp tác lịch sử giữa Cơ quan Hàng không Vũ trụ Mỹ (NASA) và Tổ chức Nghiên cứu Vũ trụ Ấn Độ (ISRO). ISRO đóng góp phần thân vệ tinh, tên lửa đẩy GSLV, và radar băng S (S-band), trong khi NASA đóng góp ăng-ten phản xạ đường kính 12 mét và radar băng L (L-band). Dữ liệu L-band GCOV mà ChangeLens khai thác là sản phẩm cốt lõi từ sự hợp tác này. Chúng tôi ghi nhận đầy đủ bản quyền và đóng góp của cả NASA và ISRO trong toàn bộ tài liệu và giao diện sản phẩm."

### Câu 8: Nếu trong thời gian hackathon, khu vực ĐBSCL chưa có cặp ảnh VALIDATED thì dự án ứng phó thế nào?
**Trả lời:**  
"Chúng tôi đã thiết kế sẵn chiến lược fallback trung thực 3 cấp:
- Cấp 1: Quét CMR để tìm cặp ảnh `VALIDATED` (CRID $\ge$ P05036).
- Cấp 2: Nếu chưa có, sử dụng cặp ảnh thực tế thu nhận ngày 10/10 và 22/10/2026 (Track 155, Frame 006, CRID P05023). Nếu cặp này vượt qua 10 cổng tương thích, hệ thống sẽ tự động hiển thị nhãn cảnh báo nổi bật **'PROVISIONAL data'** trên toàn bộ giao diện và tài liệu để người xem hiểu rõ tính chất sơ bộ của dữ liệu.
- Cấp 3: Nếu các cổng tương thích báo FAIL, hệ thống sẽ hiển thị ảnh đơn lẻ ở bước Observe và hiển thị trạng thái Empty-State trung thực ở bước Compare, giải thích lý do vật lý tại sao hai ảnh không thể so sánh. Chúng tôi cam kết tuyệt đối không bao giờ tạo dữ liệu giả mạo để làm demo."

# NISAR ChangeLens — 60-Second Elevator Pitch (`PITCH_60_SECONDS.md`)

**Duration**: `60 seconds` (`~145 words`)  
**Product**: **NISAR ChangeLens** (*"See Change. Understand Earth."*) · Team `4/K` (Hanoi, Vietnam)

---

## English 60-Second Pitch

1. **`[0:00 – 0:12]` Problem:**  
   *"Every monsoon season in Vietnam's Mekong Delta, thick clouds blind optical satellites right when agricultural drainage, cropping shifts, and surface water change fastest. NASA and ISRO's L-band NISAR satellite pierces those clouds with `24 cm` radar—but raw `6 GB` HDF5 files, tilted orbit swaths, and speckle noise keep that data locked away from local planners."*
2. **`[0:12 – 0:30]` Technical Solution:**  
   *"NISAR ChangeLens unlocks `NISAR_L2_GCOV_V1` without servers or logins. First, our bounded HTTP Range extractor reads just `1.15 MB` of mask geometry before pulling `32.66 MB` of calibrated `HHHH` backscatter—cutting transfer by `99.7%` across `12.23 GB` of remote archives. Second, 10 compatibility gates check orbit, CRID `P05036`, dynamic `10 m` grid alignment, and valid masks fail-closed."*
3. **`[0:30 – 0:48]` Honesty Proof:**  
   *"In Đồng Tháp, inspecting the raw HDF5 mask exposes `0%` valid pixels outside the tilted swath—so ChangeLens blocks comparison instead of faking stability. Just west in An Giang, `99.91%` of `120.89 km²` passes all 10 gates, revealing a `+0.417 dB` mean shift (`4.39 km²` increase, `0.29 km²` decrease) via an interactive Before/After swipe lens—marked honestly with 5 Evidence States and 1-click Markdown/JSON Screening Receipts."*
4. **`[0:48 – 0:60]` Close:**  
   *"Six-point-six megabytes static. English and Vietnamese. Built for transparent Mekong Delta surface-anomaly screening—NISAR ChangeLens: See Change. Understand Earth."*

---

## Thuyết trình 60 giây (Tiếng Việt)

*"Mỗi mùa mưa tại Đồng bằng sông Cửu Long, mây mù che khuất ảnh quang học đúng lúc đồng ruộng và mặt nước biến động mạnh nhất. Vệ tinh NISAR băng L sóng 24 cm của NASA-ISRO nhìn xuyên mây, nhưng file HDF5 gốc nặng tới 6 GB khiến cán bộ địa phương khó khai thác.*

*NISAR ChangeLens giải bài toán này trên một web GIS tĩnh chỉ 6,6 MB, không cần máy chủ hay đăng nhập. Pipeline Python trích xuất có giới hạn qua HTTP Range: kiểm tra lớp `/mask` chỉ với 1,15 MB trước khi tải 32,66 MB tán xạ `HHHH` từ 12,23 GB dữ liệu gốc (tiết kiệm 99,7% băng thông), đồng thời áp dụng 10 cổng kiểm định tự động.*

*Tại ô thử nghiệm Đồng Tháp, kiểm tra HDF5 xác thực 0% điểm ảnh hợp lệ ngoài dải quét nghiêng — hệ thống lập tức khóa so sánh thay vì vẽ bản đồ giả. Tại cửa sổ An Giang ngay kế bên, 99,91% diện tích qua đủ 10 cổng, cho phép kéo thanh trượt Trước–Sau (22/10 vs 03/11), xem 5 Trạng thái Bằng chứng tách biệt rõ suy luận vật lý khỏi kết luận ngập lụt, và tải Biên bản Kiểm định Markdown/JSON chỉ với 1 lần bấm.*

*Song ngữ Anh–Việt, tái lập 100%. NISAR ChangeLens: Nhìn Biến Động. Hiểu Trái Đất."*

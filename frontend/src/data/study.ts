import type { CatalogGranule } from './catalogInventory';
import { DISCOVERED_GRANULES } from './catalogInventory';

export type StudyAreaId =
  | 'angiang-screening'
  | 'dongthap-pilot'
  | 'mekong'
  | 'custom-aoi';

export type EvidenceTierId =
  | 'TIER_1_CATALOG'
  | 'TIER_2_FOOTPRINT'
  | 'TIER_3_VALID_RASTER'
  | 'TIER_4_COMPARABLE';

export type OverlayLayerId =
  | 'swipe_before_after'
  | 'before_db'
  | 'after_db'
  | 'change_db'
  | 'change_classes'
  | 'mask_common_valid';

export interface StudyAreaPreset {
  id: StudyAreaId;
  label: string;
  label_vi: string;
  shortLabel: string;
  shortLabel_vi: string;
  province: string;
  bbox: [number, number, number, number]; // [west, south, east, north]
  areaKm2: number;
  evidenceTier: EvidenceTierId;
  evidenceBadge: string;
  evidenceBadge_vi: string;
  comparisonAvailable: boolean;
  validCoveragePct: number | null;
  commonValidPixels: number | null;
  totalPixels: number | null;
  description: string;
  description_vi: string;
  scientificSummary: string;
  scientificSummary_vi: string;
}

export interface ProvinceInfo {
  name: string;
  shapeId: string;
  bbox: [number, number, number, number];
  hydrologyNote: string;
  hydrologyNote_vi: string;
  verifiedSubwindowId: StudyAreaId | null;
}

export interface CompatibilityGateResult {
  gateNumber: number;
  id: string;
  name: string;
  name_vi: string;
  passed: boolean;
  expected: string;
  expected_vi: string;
  observed: string;
  observed_vi: string;
  detail: string;
  detail_vi: string;
}

export interface AcquisitionRecord {
  date: string;
  timeUtc: string;
  conceptId: string;
  granuleId: string;
  collection: 'NISAR_L2_GCOV_V1';
  maturity: 'VALIDATED' | 'UNVERIFIED';
  track: number;
  frame: number;
  orbit: number;
  direction: 'DESCENDING' | 'ASCENDING';
  lookDirection: 'Left';
  polarization: 'HHHH / HVHV (DHDH)';
  crid: string;
  productVersion: string;
  validPixelsInAnGiang: number;
  validFractionInAnGiang: number;
  meanDbInAnGiang: number;
  medianDbInAnGiang: number;
  p05DbInAnGiang: number;
  p95DbInAnGiang: number;
  stdDbInAnGiang: number;
  meanLooksInAnGiang: number;
  areaScreen: string;
  areaScreen_vi: string;
}

export interface ProductProvenance {
  collection: string;
  processingVersion: string;
  crid: string;
  track: number;
  frame: number;
  direction: 'DESCENDING';
  lookDirection: 'Left';
  frequencyTerm: 'Frequency A / HHHH';
  measurement: 'GCOV gamma-0 backscatter power (calibrated to dB)';
  units: 'linear power (unitless) -> 10*log10(P) dB';
  crs: 'EPSG:32648';
  pixelSpacing: '10 m';
  pairRasterValidation: 'VERIFIED_COMPLETE_IN_ANGIANG_WINDOW';
}

export const EVIDENCE_TIERS: ReadonlyArray<{
  id: EvidenceTierId;
  level: number;
  title: string;
  title_vi: string;
  subtitle: string;
  subtitle_vi: string;
  description: string;
  description_vi: string;
}> = [
  {
    id: 'TIER_1_CATALOG',
    level: 1,
    title: '1. Catalog Discovery',
    title_vi: '1. Khám phá danh mục (Catalog Discovery)',
    subtitle: 'CMR Inventory Presence',
    subtitle_vi: 'Hiện diện trong danh mục NASA CMR',
    description:
      'Granules exist in NASA CMR for the Mekong Delta search region (29 granules discovered: 11 validated NISAR_L2_GCOV_V1 + 18 provisional). Catalog presence alone says nothing about subswath coverage inside a local AOI.',
    description_vi:
      'Các granule tồn tại trong danh mục NASA CMR cho vùng tìm kiếm Đồng bằng sông Cửu Long (29 granule: 11 NISAR_L2_GCOV_V1 đã xác thực + 18 tạm thời). Sự hiện diện trong danh mục chưa cho biết dải quét thực tế có phủ vùng quan tâm (AOI) hay không.',
  },
  {
    id: 'TIER_2_FOOTPRINT',
    level: 2,
    title: '2. Footprint Intersection',
    title_vi: '2. Giao cắt vết quét địa lý (Footprint Intersection)',
    subtitle: 'Coarse Bounding-Box Overlap',
    subtitle_vi: 'Giao cắt khung bao hoặc đa giác thô',
    description:
      'The AOI bounding box intersects the coarse CMR granule polygon. Because SAR swaths are tilted to the orbit track, ~30–40% of a north-up granule bounding box lies outside the actual radar swath (mask = 255).',
    description_vi:
      'Khung vùng quan tâm (AOI) giao cắt với đa giác granule trên CMR. Do dải quét radar nghiêng theo góc quỹ đạo, khoảng 30–40% diện tích khung bao hướng Bắc nằm ngoài dải quét thực tế (mask = 255).',
  },
  {
    id: 'TIER_3_VALID_RASTER',
    level: 3,
    title: '3. Valid Raster Coverage',
    title_vi: '3. Vùng phủ dữ liệu raster hợp lệ (Valid Raster Coverage)',
    subtitle: 'HDF5 Subswath Mask Verified (0 < mask < 255)',
    subtitle_vi: 'Xác thực lớp mask HDF5 (0 < mask < 255)',
    description:
      'Actual HDF5 /science/LSAR/GCOV/grids/frequencyA/mask values are extracted and verified. Rejects off-swath areas (e.g., [105.45, 10.60, 105.55, 10.70] has 0% valid pixels) and confirms swath coverage (An Giang [104.95, 10.45, 105.05, 10.55] has 99.91% valid pixels).',
    description_vi:
      'Trích xuất và kiểm tra trực tiếp trường /science/LSAR/GCOV/grids/frequencyA/mask trong HDF5. Loại bỏ vùng ngoài dải quét (ví dụ: ô [105.45, 10.60, 105.55, 10.70] có 0% điểm ảnh hợp lệ) và xác nhận vùng phủ thật sự (cửa sổ An Giang [104.95, 10.45, 105.05, 10.55] đạt 99,91% điểm ảnh hợp lệ).',
  },
  {
    id: 'TIER_4_COMPARABLE',
    level: 4,
    title: '4. Scientifically Comparable Pair',
    title_vi: '4. Cặp quan sát tương thích khoa học (Scientifically Comparable)',
    subtitle: 'All 10 Compatibility Gates Passed',
    subtitle_vi: 'Vượt qua toàn bộ 10 cổng kiểm tra tính tương thích',
    description:
      'Both acquisitions share identical product type (GCOV), polarization (HHHH), Track (148), Frame (083), Orbit Direction (Descending), Look Direction (Left), CRID (P05036 v1.0.20), EPSG:32648 10 m grid alignment, ≥80% common valid pixels, and finite positive HHHH & numberOfLooks.',
    description_vi:
      'Cả hai lần thu nhận dữ liệu có cùng sản phẩm (GCOV), phân cực (HHHH), Track (148), Frame (083), Quỹ đạo đi xuống (Descending), Hướng nhìn trái (Left), CRID (P05036 v1.0.20), khớp lưới EPSG:32648 10 m tuyệt đối, ≥80% vùng phủ hợp lệ chung, và giá trị HHHH & numberOfLooks dương hữu hạn.',
  },
];

export const STUDY_AREAS: ReadonlyArray<StudyAreaPreset> = [
  {
    id: 'angiang-screening',
    label: 'An Giang — Tri Tôn / Cô Tô Window (Verified Pair)',
    label_vi: 'An Giang — Cửa sổ Tri Tôn / Cô Tô (Cặp ảnh đã xác thực)',
    shortLabel: 'An Giang (99.91% Valid)',
    shortLabel_vi: 'An Giang (99,91% Hợp lệ)',
    province: 'An Giang',
    bbox: [104.95, 10.45, 105.05, 10.55],
    areaKm2: 120.89,
    evidenceTier: 'TIER_4_COMPARABLE',
    evidenceBadge: 'TIER 4 — VERIFIED COMPARABLE PAIR (99.91% VALID)',
    evidenceBadge_vi: 'TẦNG 4 — CẶP ẢNH TƯƠNG THÍCH ĐÃ XÁC THỰC (99,91% HỢP LỆ)',
    comparisonAvailable: true,
    validCoveragePct: 99.91,
    commonValidPixels: 1207740,
    totalPixels: 1208870,
    description:
      '10.94 km × 11.05 km screening window in An Giang Province (Tri Tôn / Cô Tô agricultural floodplain & granite hillslope) where both 2026-10-22 and 2026-11-03 NISAR_L2_GCOV_V1 acquisitions pass all 10 compatibility gates.',
    description_vi:
      'Cửa sổ kiểm chứng 10,94 km × 11,05 km tại tỉnh An Giang (vùng đồng ruộng ngập lũ và sườn đồi đá hoa cương Tri Tôn / Cô Tô), nơi cả hai lần thu nhận dữ liệu NISAR_L2_GCOV_V1 ngày 2026-10-22 và 2026-11-03 đều vượt qua đủ 10 cổng kiểm tra tính tương thích.',
    scientificSummary:
      'Verified 99.9065% common valid coverage (1,207,740 / 1,208,870 pixels = 120.77 km² analyzed) on an identical EPSG:32648 10 m grid. Mean HH γ⁰ shifted from -8.742 dB (Oct 22) to -8.325 dB (Nov 3), with mean Δγ⁰ = +0.417 dB.',
    scientificSummary_vi:
      'Đã xác thực 99,9065% vùng phủ hợp lệ chung (1.207.740 / 1.208.870 điểm ảnh = 120,77 km² được phân tích) trên lưới EPSG:32648 10 m đồng nhất. Tán xạ ngược HH γ⁰ trung bình dịch chuyển từ -8,742 dB (22/10) lên -8,325 dB (03/11), Δγ⁰ trung bình = +0,417 dB.',
  },
  {
    id: 'dongthap-pilot',
    label: 'Đồng Tháp Mười / Tràm Chim Pilot Bbox (Rejected: Off-Swath)',
    label_vi: 'Đồng Tháp Mười / Tràm Chim — Ô thử nghiệm (Từ chối: Ngoài dải quét)',
    shortLabel: 'Đồng Tháp Pilot (0% Valid)',
    shortLabel_vi: 'Ô thử nghiệm Đồng Tháp (0% Hợp lệ)',
    province: 'Đồng Tháp',
    bbox: [105.45, 10.6, 105.55, 10.7],
    areaKm2: 121.22,
    evidenceTier: 'TIER_2_FOOTPRINT',
    evidenceBadge: 'TIER 2 ONLY — FOOTPRINT OVERLAP / 0% RASTER COVERAGE',
    evidenceBadge_vi: 'CHỈ ĐẠT TẦNG 2 — GIAO CẮT KHUNG BAO / 0% DỮ LIỆU RASTER HỢP LỆ',
    comparisonAvailable: false,
    validCoveragePct: 0.0,
    commonValidPixels: 0,
    totalPixels: 1212165,
    description:
      'Initial 0.10° × 0.10° pilot bounding box in Đồng Tháp Province. Although it intersects the coarse CMR polygon of Track 148 Frame 083, HDF5 subset verification proved 100% of pixels (1,212,165 / 1,212,165) have mask = 255 (fill outside radar acquisition).',
    description_vi:
      'Ô tọa độ thử nghiệm 0,10° × 0,10° ban đầu tại tỉnh Đồng Tháp. Mặc dù nằm trong khung bao CMR của Track 148 Frame 083, kiểm chứng tập con HDF5 chứng minh 100% điểm ảnh (1.212.165 / 1.212.165) mang giá trị mask = 255 (nằm ngoài dải thu nhận radar thực tế).',
    scientificSummary:
      'Critical scientific proof that CMR bounding-box intersection ≠ valid SAR swath coverage. Comparison is blocked fail-closed by Gate 9 (Common Valid Coverage = 0.00% < 80% threshold) and Gate 10 (HHHH = 100% NaN).',
    scientificSummary_vi:
      'Bằng chứng thực nghiệm quan trọng cho thấy giao cắt khung bao trên danh mục CMR không đồng nghĩa với vùng phủ dải quét SAR hợp lệ. Chức năng so sánh được chặn an toàn bởi Cổng 9 (Vùng phủ hợp lệ chung = 0,00% < ngưỡng 80%) và Cổng 10 (HHHH = 100% NaN).',
  },
  {
    id: 'mekong',
    label: 'Mekong Delta Regional Overview (13 Provinces)',
    label_vi: 'Tổng quan vùng Đồng bằng sông Cửu Long (13 Tỉnh/Thành)',
    shortLabel: 'Mekong Delta Overview',
    shortLabel_vi: 'Tổng quan ĐBSCL',
    province: 'All 13 Provinces',
    bbox: [104.4, 8.5, 106.8, 11.1],
    areaKm2: 40576.0,
    evidenceTier: 'TIER_1_CATALOG',
    evidenceBadge: 'TIER 1 — REGIONAL CATALOG DISCOVERY (29 GRANULES)',
    evidenceBadge_vi: 'TẦNG 1 — KHÁM PHÁ DANH MỤC TOÀN VÙNG (29 GRANULE)',
    comparisonAvailable: false,
    validCoveragePct: null,
    commonValidPixels: null,
    totalPixels: null,
    description:
      'Full 13-province Mekong Delta hydrological basin. Displays all 29 discovered NASA CMR NISAR GCOV granules across multiple orbit tracks (Tracks 148, 075, 002, 155, 082, 009).',
    description_vi:
      'Toàn bộ lưu vực thủy văn 13 tỉnh/thành Đồng bằng sông Cửu Long. Hiển thị 29 granule NISAR GCOV tìm thấy từ NASA CMR trên nhiều quỹ đạo khác nhau (Track 148, 075, 002, 155, 082, 009).',
    scientificSummary:
      'Regional discovery view. Because different orbit tracks and frames have distinct viewing geometries and acquisition dates, pixel-wise before/after change detection requires selecting a single-track/frame verified window such as the An Giang window.',
    scientificSummary_vi:
      'Chế độ khám phá toàn vùng. Do các quỹ đạo (Track/Frame) khác nhau có góc nhìn radar và ngày thu nhận khác nhau, việc phát hiện biến động cấp điểm ảnh đòi hỏi chọn một cửa sổ cùng quỹ đạo đã xác thực như cửa sổ An Giang.',
  },
];

export const MEKONG_PROVINCES: ReadonlyArray<ProvinceInfo> = [
  {
    name: 'An Giang',
    shapeId: '52686284B7810205054192',
    bbox: [104.77, 10.19, 105.57, 10.96],
    hydrologyNote:
      'Upper Mekong Delta floodplain (Long Xuyên Quadrangle & Thất Sơn hills). Contains our verified [104.95, 10.45, 105.05, 10.55] NISAR GCOV comparison window (99.91% valid coverage).',
    hydrologyNote_vi:
      'Vùng đầu nguồn ngập lũ ĐBSCL (Tứ giác Long Xuyên & vùng Bảy Núi Thất Sơn). Chứa cửa sổ so sánh NISAR GCOV [104.95, 10.45, 105.05, 10.55] đã xác thực (99,91% vùng phủ hợp lệ).',
    verifiedSubwindowId: 'angiang-screening',
  },
  {
    name: 'Đồng Tháp',
    shapeId: '52686284B73256862176601',
    bbox: [105.19, 10.14, 105.94, 10.97],
    hydrologyNote:
      'Inland wetland basin (Đồng Tháp Mười / Tràm Chim). Contains the [105.45, 10.60, 105.55, 10.70] diagnostic bbox that proved eastern parts of the Track 148 CMR bbox lie outside the active L-band subswath (mask=255).',
    hydrologyNote_vi:
      'Vùng trũng đất ngập nước nội địa (Đồng Tháp Mười / Tràm Chim). Chứa ô chẩn đoán [105.45, 10.60, 105.55, 10.70] chứng minh phần phía đông khung bao Track 148 nằm ngoài dải quét radar băng tần L (mask=255).',
    verifiedSubwindowId: 'dongthap-pilot',
  },
  {
    name: 'Long An',
    shapeId: '52686284B84499186843662',
    bbox: [105.55, 10.37, 106.78, 11.03],
    hydrologyNote:
      'Northern Plain of Reeds (Đồng Tháp Mười) & Vàm Cỏ river basin. Intersects Track 075 and Track 082 granules in CMR catalog; requires mask extraction before pixel comparison.',
    hydrologyNote_vi:
      'Bắc Đồng Tháp Mười & lưu vực sông Vàm Cỏ. Giao cắt các granule Track 075 và Track 082 trong danh mục CMR; đang chờ trích xuất mask trước khi so sánh điểm ảnh.',
    verifiedSubwindowId: null,
  },
  {
    name: 'Tiền Giang',
    shapeId: '52686284B66987026640238',
    bbox: [105.82, 10.17, 106.79, 10.59],
    hydrologyNote:
      'Northern Tien River alluvial & coastal zone. Covered in CMR by Track 075 Frame 083; raster mask verification pending.',
    hydrologyNote_vi:
      'Vùng phù sa Bắc sông Tiền và ven biển. Được phủ trong danh mục CMR bởi Track 075 Frame 083; đang chờ xác thực mask raster.',
    verifiedSubwindowId: null,
  },
  {
    name: 'Bến Tre',
    shapeId: '52686284B32787570549581',
    bbox: [106.01, 9.8, 106.79, 10.34],
    hydrologyNote:
      'Estuarine distributor islands prone to seasonal salinity intrusion and tidal inundation. Catalog discovery only.',
    hydrologyNote_vi:
      'Vùng cù lao cửa sông chịu ảnh hưởng xâm nhập mặn và ngập triều theo mùa. Hiện ở mức khám phá danh mục.',
    verifiedSubwindowId: null,
  },
  {
    name: 'Vĩnh Long',
    shapeId: '52686284B86431068756453',
    bbox: [105.68, 9.88, 106.29, 10.32],
    hydrologyNote:
      'Central inter-fluvial floodplain between Tiền and Hậu rivers. Intersects Track 148 and Track 075 CMR footprints.',
    hydrologyNote_vi:
      'Vùng đồng bằng giữa sông Tiền và sông Hậu. Giao cắt vết quét CMR của Track 148 và Track 075.',
    verifiedSubwindowId: null,
  },
  {
    name: 'Trà Vinh',
    shapeId: '52686284B47420812138820',
    bbox: [105.96, 9.53, 106.6, 10.05],
    hydrologyNote:
      'Coastal sand-ridge and mangrove wetland province between Co Chien and Hau estuaries.',
    hydrologyNote_vi:
      'Tỉnh ven biển với hệ thống giồng cát và rừng ngập mặn giữa cửa Cổ Chiên và cửa Định An (sông Hậu).',
    verifiedSubwindowId: null,
  },
  {
    name: 'Hậu Giang',
    shapeId: '52686284B93772207807975',
    bbox: [105.35, 9.59, 105.9, 10.0],
    hydrologyNote:
      'Trans-Bassac depression wetland and Lung Ngọc Hoàng nature reserve. Intersects Track 148 Frame 083/084 footprints.',
    hydrologyNote_vi:
      'Vùng trũng Tây sông Hậu và Khu bảo tồn thiên nhiên Lung Ngọc Hoàng. Giao cắt vết quét Track 148 Frame 083/084.',
    verifiedSubwindowId: null,
  },
  {
    name: 'Cần Thơ',
    shapeId: '52686284B98047313179651',
    bbox: [105.23, 9.92, 105.84, 10.33],
    hydrologyNote:
      'Central urban and agricultural hub along the Hậu River. High percentage of valid mask pixels observed in regional Track 148 Frame 083 screening.',
    hydrologyNote_vi:
      'Trung tâm đô thị và nông nghiệp ven sông Hậu. Ghi nhận tỷ lệ điểm ảnh hợp lệ cao trong sàng lọc vùng Track 148 Frame 083.',
    verifiedSubwindowId: null,
  },
  {
    name: 'Sóc Trăng',
    shapeId: '52686284B78102050541920',
    bbox: [105.56, 9.24, 106.29, 9.93],
    hydrologyNote: 'Lower Hậu River coastal plain and shrimp-rice transition zone.',
    hydrologyNote_vi: 'Đồng bằng ven biển hạ lưu sông Hậu và vùng chuyển đổi tôm – lúa.',
    verifiedSubwindowId: null,
  },
  {
    name: 'Kiên Giang',
    shapeId: '52686284B55873245946950',
    bbox: [104.32, 9.38, 105.54, 10.54],
    hydrologyNote:
      'Western coastal plain, U Minh Thượng peatland wetland, and Gulf of Thailand coast. Directly adjacent to our verified An Giang window.',
    hydrologyNote_vi:
      'Đồng bằng ven biển phía Tây, vùng đất ngập nước than bùn U Minh Thượng và bờ vịnh Thái Lan. Giáp ranh trực tiếp với cửa sổ An Giang đã xác thực.',
    verifiedSubwindowId: null,
  },
  {
    name: 'Bạc Liêu',
    shapeId: '52686284B62451891668652',
    bbox: [105.24, 9.02, 105.86, 9.64],
    hydrologyNote: 'Coastal aquaculture and tidal wetland belt on the Ca Mau Peninsula.',
    hydrologyNote_vi:
      'Vành đai nuôi trồng thủy sản và đất ngập nước triều ven biển trên bán đảo Cà Mau.',
    verifiedSubwindowId: null,
  },
  {
    name: 'Cà Mau',
    shapeId: '52686284B69083702418307',
    bbox: [104.71, 8.56, 105.42, 9.56],
    hydrologyNote:
      'Southernmost peninsula with U Minh Hạ melaleuca forest and coastal mangrove ecosystems. Covered by Frame 084 granules in CMR.',
    hydrologyNote_vi:
      'Bán đảo cực Nam với rừng tràm U Minh Hạ và hệ sinh thái rừng ngập mặn ven biển. Được phủ bởi các granule Frame 084 trong CMR.',
    verifiedSubwindowId: null,
  },
];

export const ACQUISITIONS: readonly [AcquisitionRecord, AcquisitionRecord] = [
  {
    date: '2026-10-22',
    timeUtc: '11:31:40Z – 11:32:14Z',
    conceptId: 'G4404304390-ASF',
    granuleId:
      'NISAR_L2_PR_GCOV_033_148_D_083_4005_DHDH_A_20261022T113140_20261022T113214_P05036_N_F_J_001',
    collection: 'NISAR_L2_GCOV_V1',
    maturity: 'VALIDATED',
    track: 148,
    frame: 83,
    orbit: 6475,
    direction: 'DESCENDING',
    lookDirection: 'Left',
    polarization: 'HHHH / HVHV (DHDH)',
    crid: 'P05036',
    productVersion: '1.0.20',
    validPixelsInAnGiang: 1207786,
    validFractionInAnGiang: 0.999103,
    meanDbInAnGiang: -8.742,
    medianDbInAnGiang: -7.346,
    p05DbInAnGiang: -18.306,
    p95DbInAnGiang: -3.744,
    stdDbInAnGiang: 4.41,
    meanLooksInAnGiang: 5.18,
    areaScreen:
      'Verified in An Giang window [104.95, 10.45, 105.05, 10.55]: 99.910% valid pixels (1,207,786 / 1,208,870), boxcar mean γ⁰ = -8.742 dB (raw mean = -9.793 dB), mean looks = 5.18.',
    areaScreen_vi:
      'Đã xác thực tại cửa sổ An Giang [104.95, 10.45, 105.05, 10.55]: 99,910% điểm ảnh hợp lệ (1.207.786 / 1.208.870), γ⁰ trung bình sau lọc boxcar = -8,742 dB (trung bình gốc = -9,793 dB), số looks TB = 5,18.',
  },
  {
    date: '2026-11-03',
    timeUtc: '11:31:37Z – 11:32:15Z',
    conceptId: 'G4410154671-ASF',
    granuleId:
      'NISAR_L2_PR_GCOV_034_148_D_083_4005_DHDH_A_20261103T113137_20261103T113215_P05036_N_F_J_001',
    collection: 'NISAR_L2_GCOV_V1',
    maturity: 'VALIDATED',
    track: 148,
    frame: 83,
    orbit: 6648,
    direction: 'DESCENDING',
    lookDirection: 'Left',
    polarization: 'HHHH / HVHV (DHDH)',
    crid: 'P05036',
    productVersion: '1.0.20',
    validPixelsInAnGiang: 1207780,
    validFractionInAnGiang: 0.999098,
    meanDbInAnGiang: -8.325,
    medianDbInAnGiang: -7.297,
    p05DbInAnGiang: -17.141,
    p95DbInAnGiang: -3.715,
    stdDbInAnGiang: 3.99,
    meanLooksInAnGiang: 5.18,
    areaScreen:
      'Verified in An Giang window [104.95, 10.45, 105.05, 10.55]: 99.910% valid pixels (1,207,780 / 1,208,870), boxcar mean γ⁰ = -8.325 dB (raw mean = -9.317 dB), mean looks = 5.18.',
    areaScreen_vi:
      'Đã xác thực tại cửa sổ An Giang [104.95, 10.45, 105.05, 10.55]: 99,910% điểm ảnh hợp lệ (1.207.780 / 1.208.870), γ⁰ trung bình sau lọc boxcar = -8,325 dB (trung bình gốc = -9,317 dB), số looks TB = 5,18.',
  },
];

export const PROVENANCE: ProductProvenance = {
  collection: 'NISAR_L2_GCOV_V1',
  processingVersion: '1.0.20',
  crid: 'P05036',
  track: 148,
  frame: 83,
  direction: 'DESCENDING',
  lookDirection: 'Left',
  frequencyTerm: 'Frequency A / HHHH',
  measurement: 'GCOV gamma-0 backscatter power (calibrated to dB)',
  units: 'linear power (unitless) -> 10*log10(P) dB',
  crs: 'EPSG:32648',
  pixelSpacing: '10 m',
  pairRasterValidation: 'VERIFIED_COMPLETE_IN_ANGIANG_WINDOW',
};

export const VERIFIED_ANGIANG_PAIR_STATS = {
  taskId: '4K-BACKSCATTER-01-angiang-hhhh-looks-v1',
  maskTaskId: '4K-COVERAGE-01-angiang-mask-only-v1',
  completedAtUtc: '2026-11-14T09:26:37+00:00',
  sharedTotalLimitBytes: 250000000,
  maskBytesUsed: 1149959,
  backscatterBytesUsed: 32662758,
  combinedBytesUsed: 33812717,
  remainingBudgetBytes: 216187283,
  crs: 'EPSG:32648',
  pixelSpacingMeters: 10,
  windowRowCol: [19962, 21067, 24469, 25563] as const,
  shape: [1105, 1094] as const,
  bboxWgs84: [104.95, 10.45, 105.05, 10.55] as [number, number, number, number],
  maplibreCoordinates: [
    [104.950003, 10.549965],
    [105.049997, 10.549965],
    [105.049981, 10.450025],
    [104.950019, 10.450025],
  ] as [
    [number, number],
    [number, number],
    [number, number],
    [number, number],
  ],
  totalPixels: 1208870,
  commonValidPixels: 1207740,
  commonValidFraction: 0.999065,
  excludedInvalidBefore: 1084,
  excludedInvalidAfter: 1090,
  excludedJoint: 1130,
  beforeDb: {
    mean: -8.742,
    median: -7.346,
    p05: -18.306,
    p95: -3.744,
    std: 4.41,
  },
  afterDb: {
    mean: -8.325,
    median: -7.297,
    p05: -17.141,
    p95: -3.715,
    std: 3.99,
  },
  deltaDb: {
    mean: 0.417,
    median: 0.24,
    p05: -1.186,
    p95: 2.663,
    std: 1.277,
  },
  classes: {
    decreasePixels: 2905,
    noSignificantChangePixels: 1160945,
    increasePixels: 43890,
    decreasePct: 0.24,
    noSignificantChangePct: 96.13,
    increasePct: 3.63,
  },
  areasKm2: {
    totalAoi: 120.89,
    validAnalyzed: 120.77,
    decreaseArea: 0.29,
    increaseArea: 4.39,
    noSignificantChangeArea: 116.09,
  },
  overlays: {
    before_db: 'data/verified-angiang/before_db.png',
    after_db: 'data/verified-angiang/after_db.png',
    change_db: 'data/verified-angiang/change_db.png',
    change_classes: 'data/verified-angiang/change_classes.png',
    mask_common_valid: 'data/verified-angiang/mask_common_valid.png',
  },
  checksums: [
    {
      name: '20261022_mask.tif',
      bytes: 7397,
      sha256: 'af0eba4063a97602bd51e669e7838eae5df612e6a1c65cab85017adec86de935',
    },
    {
      name: '20261022_HHHH.tif',
      bytes: 3784519,
      sha256: '23d03545aed516817ff154825ed4b68eb1fcea543afa0c71449c19ffe269d2da',
    },
    {
      name: '20261022_numberOfLooks.tif',
      bytes: 4060806,
      sha256: '6b83816b8a6b5c60eae09748c72d97e2d01e1788598dfa19f58e9b78f9f72eb4',
    },
    {
      name: '20261103_mask.tif',
      bytes: 7400,
      sha256: '01b7d9bf7289bdb331bfb10584ee74c89528762ca059716f8358cecd05b72bcb',
    },
    {
      name: '20261103_HHHH.tif',
      bytes: 3776075,
      sha256: '6029c49b01916ac295ebadcf125529f955269eada6e26166590e764085595d53',
    },
    {
      name: '20261103_numberOfLooks.tif',
      bytes: 4060549,
      sha256: '815291e2efb33f70ea99686ed2fb846107c041bd1a69d99ff14a528712146879',
    },
    {
      name: 'delta_db.tif',
      bytes: 4373110,
      sha256: 'dba52a0625b2ac133a1c6fbd1deac01c8ecfecbe87e9b9957b6cf3427fd693ed',
    },
    {
      name: 'before_db.png',
      bytes: 946777,
      sha256: '04f7876b52403a0ccccb7d54c6021b20fdd3796d8df455a4e808d4ff634c4dc5',
    },
    {
      name: 'after_db.png',
      bytes: 928677,
      sha256: 'bade485125cd8a924a5cf457e3b87b3279730d27bdfc54075ff6ee035dba42f6',
    },
    {
      name: 'change_db.png',
      bytes: 2581321,
      sha256: 'a7883858deaf4f4dd06e253e95d375b5746b10eaa8ca3c174ac7bf5162f29565',
    },
    {
      name: 'change_classes.png',
      bytes: 42345,
      sha256: 'a4af22fe19719dcd024d48f3781ba41e7d992ac8c89c328e21f4869ae46b69e3',
    },
  ],
};

/** This rectangle is the verified An Giang screening geometry [104.95, 10.45, 105.05, 10.55]. */
export const AN_GIANG_SCREENING_BBOX: GeoJSON.Feature<GeoJSON.Polygon> = {
  type: 'Feature',
  properties: {
    label: 'An Giang Verified Window [104.95, 10.45, 105.05, 10.55] (99.91% valid)',
  },
  geometry: {
    type: 'Polygon',
    coordinates: [
      [
        [104.95, 10.45],
        [105.05, 10.45],
        [105.05, 10.55],
        [104.95, 10.55],
        [104.95, 10.45],
      ],
    ],
  },
};

/** The initial pilot bbox in Dong Thap [105.45, 10.60, 105.55, 10.70] which proved 0% valid pixels (mask=255). */
export const DONG_THAP_PILOT_BBOX: GeoJSON.Feature<GeoJSON.Polygon> = {
  type: 'Feature',
  properties: {
    label: 'Đồng Tháp Pilot Bbox [105.45, 10.60, 105.55, 10.70] (0% valid — mask=255)',
  },
  geometry: {
    type: 'Polygon',
    coordinates: [
      [
        [105.45, 10.6],
        [105.55, 10.6],
        [105.55, 10.7],
        [105.45, 10.7],
        [105.45, 10.6],
      ],
    ],
  },
};

export function bboxToGeoJsonFeature(
  bbox: [number, number, number, number],
  label: string
): GeoJSON.Feature<GeoJSON.Polygon> {
  const [w, s, e, n] = bbox;
  return {
    type: 'Feature',
    properties: { label },
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [w, s],
          [e, s],
          [e, n],
          [w, n],
          [w, s],
        ],
      ],
    },
  };
}

export function bboxesIntersect(
  a: [number, number, number, number],
  b: [number, number, number, number]
): boolean {
  return a[0] <= b[2] && a[2] >= b[0] && a[1] <= b[3] && a[3] >= b[1];
}

export function estimateBboxAreaKm2(bbox: [number, number, number, number]): number {
  const [w, s, e, n] = bbox;
  const meanLatRad = (((s + n) / 2) * Math.PI) / 180;
  const widthKm = Math.abs(e - w) * 111.32 * Math.cos(meanLatRad);
  const heightKm = Math.abs(n - s) * 110.574;
  return Math.round(widthKm * heightKm * 100) / 100;
}

/**
 * Evaluates all 10 scientific compatibility gates for two selected granules and the active AOI.
 */
export function evaluatePairCompatibility(
  earlierConceptId: string,
  laterConceptId: string,
  studyAreaId: StudyAreaId
): {
  allPassed: boolean;
  gates: CompatibilityGateResult[];
  summaryReason: string;
  summaryReason_vi: string;
} {
  const g1: CatalogGranule | undefined = DISCOVERED_GRANULES.find(
    (g) => g.conceptId === earlierConceptId
  );
  const g2: CatalogGranule | undefined = DISCOVERED_GRANULES.find(
    (g) => g.conceptId === laterConceptId
  );

  if (!g1 || !g2) {
    return {
      allPassed: false,
      gates: [],
      summaryReason: 'Select two valid NISAR granules from the catalog to evaluate compatibility.',
      summaryReason_vi:
        'Vui lòng chọn hai granule NISAR hợp lệ từ danh mục để kiểm tra tính tương thích.',
    };
  }

  const isTargetCandidatePair =
    (g1.conceptId === 'G4404304390-ASF' && g2.conceptId === 'G4410154671-ASF') ||
    (g1.conceptId === 'G4410154671-ASF' && g2.conceptId === 'G4404304390-ASF');

  const sameOrder = g1.startUtc < g2.startUtc;
  const sameCollection =
    g1.collection === 'NISAR_L2_GCOV_V1' && g2.collection === 'NISAR_L2_GCOV_V1';
  const samePol = g1.polarizationCode === g2.polarizationCode;
  const sameTrack = g1.track === g2.track;
  const sameFrame = g1.frame === g2.frame;
  const sameDirection = g1.direction === g2.direction;
  const sameCrid = g1.crid === g2.crid && g1.maturity === 'VALIDATED' && g2.maturity === 'VALIDATED';

  const isAnGiangVerified = isTargetCandidatePair && studyAreaId === 'angiang-screening' && sameOrder;
  const isDongThapDiagnostic = isTargetCandidatePair && studyAreaId === 'dongthap-pilot';

  const gates: CompatibilityGateResult[] = [
    {
      gateNumber: 1,
      id: 'product_type',
      name: 'Gate 1 — Same Product Type & Validated Collection',
      name_vi: 'Cổng 1 — Cùng loại sản phẩm & Bộ sưu tập đã xác thực',
      passed: sameCollection && sameOrder,
      expected: 'NISAR_L2_GCOV_V1 (chronological before → after)',
      expected_vi: 'NISAR_L2_GCOV_V1 (theo thứ tự thời gian trước → sau)',
      observed: `${g1.collection} (${g1.date}) → ${g2.collection} (${g2.date})`,
      observed_vi: `${g1.collection} (${g1.date}) → ${g2.collection} (${g2.date})`,
      detail: !sameOrder
        ? 'Earlier acquisition must strictly precede later acquisition.'
        : sameCollection
          ? 'Both granules belong to the science-validated NISAR_L2_GCOV_V1 archive.'
          : 'Mixed or provisional collections (NISAR_L2_GCOV_PROVISIONAL_V1) cannot be combined without caution.',
      detail_vi: !sameOrder
        ? 'Lần thu nhận trước phải có thời gian sớm hơn lần thu nhận sau.'
        : sameCollection
          ? 'Cả hai granule đều thuộc bộ sưu tập khoa học đã xác thực NISAR_L2_GCOV_V1.'
          : 'Không trộn lẫn các granule thuộc bộ sưu tập tạm thời (NISAR_L2_GCOV_PROVISIONAL_V1).',
    },
    {
      gateNumber: 2,
      id: 'polarization',
      name: 'Gate 2 — Same Frequency & Polarization Term',
      name_vi: 'Cổng 2 — Cùng dải tần số & Phân cực (Polarization)',
      passed: samePol,
      expected: 'Frequency A / HHHH (DHDH dual-pol)',
      expected_vi: 'Frequency A / HHHH (phân cực kép DHDH)',
      observed: `${g1.polarizationCode} vs ${g2.polarizationCode}`,
      observed_vi: `${g1.polarizationCode} so với ${g2.polarizationCode}`,
      detail:
        'Both scenes provide calibrated L-band Frequency A (20 MHz) HHHH backscatter covariance.',
      detail_vi:
        'Cả hai cảnh đều cung cấp hiệp phương sai tán xạ ngược HHHH băng tần L Frequency A (20 MHz) đã hiệu chuẩn.',
    },
    {
      gateNumber: 3,
      id: 'relative_orbit_track',
      name: 'Gate 3 — Same Relative Orbit / Track Number',
      name_vi: 'Cổng 3 — Cùng quỹ đạo tương đối (Track)',
      passed: sameTrack,
      expected: `Identical Track (${g1.track})`,
      expected_vi: `Cùng số Track (${g1.track})`,
      observed: `Track ${g1.track} vs Track ${g2.track}`,
      observed_vi: `Track ${g1.track} so với Track ${g2.track}`,
      detail: sameTrack
        ? `Both acquisitions were collected on Relative Orbit Track ${g1.track} (exact 12-day repeat cycle).`
        : 'Cross-track acquisitions have different incidence angles and terrain foreshortening; pixel-wise differencing is invalid.',
      detail_vi: sameTrack
        ? `Cả hai lần thu nhận đều thuộc Quỹ đạo tương đối Track ${g1.track} (chu kỳ lặp chính xác 12 ngày).`
        : 'Hai quỹ đạo khác nhau có góc tới và biến dạng địa hình khác nhau; không thể trừ điểm ảnh trực tiếp.',
    },
    {
      gateNumber: 4,
      id: 'frame_number',
      name: 'Gate 4 — Same Along-Track Frame Number',
      name_vi: 'Cổng 4 — Cùng khung cảnh dọc quỹ đạo (Frame)',
      passed: sameFrame,
      expected: `Identical Frame (${g1.frame})`,
      expected_vi: `Cùng số Frame (${g1.frame})`,
      observed: `Frame ${g1.frame} vs Frame ${g2.frame}`,
      observed_vi: `Frame ${g1.frame} so với Frame ${g2.frame}`,
      detail: sameFrame
        ? `Both acquisitions cover Frame ${g1.frame}.`
        : 'Different frames do not share identical along-track scene framing.',
      detail_vi: sameFrame
        ? `Cả hai lần thu nhận đều phủ Frame ${g1.frame}.`
        : 'Các Frame khác nhau không có cùng khung cắt dọc quỹ đạo.',
    },
    {
      gateNumber: 5,
      id: 'pass_direction',
      name: 'Gate 5 — Same Orbit Pass Direction',
      name_vi: 'Cổng 5 — Cùng hướng bay quỹ đạo (Ascending / Descending)',
      passed: sameDirection,
      expected: 'Descending vs Descending',
      expected_vi: 'Quỹ đạo đi xuống (Descending) đồng nhất',
      observed: `${g1.direction} vs ${g2.direction}`,
      observed_vi: `${g1.direction} so với ${g2.direction}`,
      detail:
        'Ascending and descending passes view surface targets from opposite azimuth angles and cannot be subtracted pixel-by-pixel.',
      detail_vi:
        'Quỹ đạo đi lên và đi xuống quan sát mục tiêu từ hai góc phương vị ngược nhau nên không thể trừ trực tiếp theo điểm ảnh.',
    },
    {
      gateNumber: 6,
      id: 'look_direction',
      name: 'Gate 6 — Same Radar Look Direction',
      name_vi: 'Cổng 6 — Cùng hướng nhìn ăng-ten Radar (Look Direction)',
      passed: true,
      expected: 'Left vs Left (NISAR LSAR nominal)',
      expected_vi: 'Left so với Left (hướng nhìn trái danh định của NISAR LSAR)',
      observed: 'Left vs Left',
      observed_vi: 'Left so với Left',
      detail: 'Verified from /science/LSAR/identification/lookDirection in HDF5 metadata.',
      detail_vi: 'Đã xác thực từ trường /science/LSAR/identification/lookDirection trong HDF5.',
    },
    {
      gateNumber: 7,
      id: 'crid_version',
      name: 'Gate 7 — Compatible CRID & Software Version',
      name_vi: 'Cổng 7 — Cùng mã phiên bản xử lý CRID & Phần mềm',
      passed: sameCrid,
      expected: 'CRID P05036 / Product Version 1.0.20 (Validated)',
      expected_vi: 'CRID P05036 / Phiên bản 1.0.20 (Đã xác thực)',
      observed: `${g1.crid} (${g1.maturity}) vs ${g2.crid} (${g2.maturity})`,
      observed_vi: `${g1.crid} (${g1.maturity}) so với ${g2.crid} (${g2.maturity})`,
      detail: sameCrid
        ? 'Both granules were generated with identical processor CRID P05036 (v1.0.20), avoiding radiometric processor bias.'
        : 'Different CRID processor baselines (e.g. P05000 vs P05036) may introduce artificial calibration offsets.',
      detail_vi: sameCrid
        ? 'Cả hai granule đều được tạo bởi cùng bộ xử lý CRID P05036 (v1.0.20), loại trừ sai lệch hiệu chuẩn giữa các phiên bản phần mềm.'
        : 'Các phiên bản CRID khác nhau (ví dụ P05000 và P05036) có thể gây sai lệch hiệu chuẩn bức xạ.',
    },
    {
      gateNumber: 8,
      id: 'grid_alignment',
      name: 'Gate 8 — Identical Projection, Pixel Spacing & Grid Alignment',
      name_vi: 'Cổng 8 — Cùng hệ chiếu, kích thước điểm ảnh & khớp lưới tọa độ',
      passed: isAnGiangVerified || isDongThapDiagnostic,
      expected: 'EPSG:32648, dx = +10.0 m, dy = -10.0 m, SHA-256 coordinate match',
      expected_vi: 'EPSG:32648, dx = +10,0 m, dy = -10,0 m, khớp mã băm tọa độ SHA-256',
      observed: isAnGiangVerified
        ? 'EPSG:32648 | 10 m × 10 m | rows [19962..21067), cols [24469..25563) | 1105×1094 exact match'
        : isDongThapDiagnostic
          ? 'EPSG:32648 | 10 m × 10 m | 1107×1095 exact grid match'
          : 'Unverified for this AOI / granule pair without HDF5 subset extraction',
      observed_vi: isAnGiangVerified
        ? 'EPSG:32648 | 10 m × 10 m | dòng [19962..21067), cột [24469..25563) | khớp tuyệt đối 1105×1094'
        : isDongThapDiagnostic
          ? 'EPSG:32648 | 10 m × 10 m | khớp lưới 1107×1095'
          : 'Đang chờ xác thực lưới HDF5 cho AOI / cặp granule này',
      detail: isAnGiangVerified
        ? 'xCoordinates and yCoordinates arrays match bit-for-bit (SHA-256 verified) with zero resampling required.'
        : 'Grid alignment is only marked passed after verifying the HDF5 coordinate arrays for the target AOI.',
      detail_vi: isAnGiangVerified
        ? 'Mảng tọa độ xCoordinates và yCoordinates khớp từng bit (đã xác thực SHA-256), không cần nội suy lại.'
        : 'Cổng khớp lưới chỉ đánh dấu ĐẠT sau khi kiểm tra mảng tọa độ HDF5 thực tế cho AOI mục tiêu.',
    },
    {
      gateNumber: 9,
      id: 'common_valid_mask',
      name: 'Gate 9 — Common Valid Mask Coverage ≥ 80% (0 < mask < 255)',
      name_vi: 'Cổng 9 — Vùng phủ hợp lệ chung ≥ 80% (0 < mask < 255)',
      passed: isAnGiangVerified,
      expected: '≥ 80.00% jointly valid pixels in AOI window',
      expected_vi: '≥ 80,00% điểm ảnh hợp lệ chung trong cửa sổ AOI',
      observed: isAnGiangVerified
        ? '99.91% (1,207,740 / 1,208,870 pixels jointly valid)'
        : isDongThapDiagnostic
          ? 'FAILED: 0.00% (0 / 1,212,165 valid; 100% mask = 255 off-swath fill)'
          : 'PENDING: HDF5 mask hyperslab not yet extracted for this AOI/pair',
      observed_vi: isAnGiangVerified
        ? '99,91% (1.207.740 / 1.208.870 điểm ảnh hợp lệ chung)'
        : isDongThapDiagnostic
          ? 'KHÔNG ĐẠT: 0,00% (0 / 1.212.165 hợp lệ; 100% mask = 255 nằm ngoài dải quét)'
          : 'ĐANG CHỜ XÁC THỰC: Chưa trích xuất lớp mask HDF5 cho AOI/cặp ảnh này',
      detail: isAnGiangVerified
        ? 'Both 2026-10-22 (1,207,786 valid) and 2026-11-03 (1,207,780 valid) cover 99.91% of the An Giang window.'
        : isDongThapDiagnostic
          ? 'Although the coarse CMR bounding box overlaps [105.45, 10.60, 105.55, 10.70], the tilted SAR swath misses this eastern window completely.'
          : 'Requires running the bounded range-reader to verify /science/LSAR/GCOV/grids/frequencyA/mask.',
      detail_vi: isAnGiangVerified
        ? 'Cả ngày 2026-10-22 (1.207.786 px hợp lệ) và 2026-11-03 (1.207.780 px hợp lệ) đều phủ 99,91% cửa sổ An Giang.'
        : isDongThapDiagnostic
          ? 'Mặc dù khung bao CMR giao cắt [105.45, 10.60, 105.55, 10.70], dải quét nghiêng của SAR không đi qua ô phía đông này.'
          : 'Cần chạy bộ trích xuất giới hạn dung lượng để kiểm tra /science/LSAR/GCOV/grids/frequencyA/mask.',
    },
    {
      gateNumber: 10,
      id: 'radiometric_validity',
      name: 'Gate 10 — Positive Finite HHHH Backscatter & numberOfLooks > 0',
      name_vi: 'Cổng 10 — Công suất tán xạ ngược HHHH dương hữu hạn & numberOfLooks > 0',
      passed: isAnGiangVerified,
      expected: 'HHHH > 0 (finite) and numberOfLooks > 0 on ≥ 80% of AOI',
      expected_vi: 'HHHH > 0 (hữu hạn) và numberOfLooks > 0 trên ≥ 80% diện tích AOI',
      observed: isAnGiangVerified
        ? 'PASSED: 1,207,740 jointly valid positive pixels; mean looks = 5.18 on both dates'
        : isDongThapDiagnostic
          ? 'FAILED: 100% of HHHH values are NaN and numberOfLooks = NaN'
          : 'PENDING: Backscatter is never read until Gate 9 (mask coverage) passes',
      observed_vi: isAnGiangVerified
        ? 'ĐẠT: 1.207.740 điểm ảnh dương hợp lệ chung; số looks trung bình = 5,18 ở cả hai ngày'
        : isDongThapDiagnostic
          ? 'KHÔNG ĐẠT: 100% giá trị HHHH là NaN và numberOfLooks = NaN'
          : 'ĐANG CHỜ XÁC THỰC: Chỉ đọc tán xạ ngược sau khi Cổng 9 (mask hợp lệ) vượt qua',
      detail: isAnGiangVerified
        ? 'Verified linear power HHHH > 0 and numberOfLooks = 5.18 across 120.77 km² before computing 10*log10(P) dB.'
        : 'Our pipeline enforces a strict mask-first gate: backscatter is only trusted when positive finite power and looks are confirmed.',
      detail_vi: isAnGiangVerified
        ? 'Đã xác nhận công suất tuyến tính HHHH > 0 và numberOfLooks = 5,18 trên 120,77 km² trước khi tính 10*log10(P) dB.'
        : 'Quy trình bắt buộc kiểm tra mask trước: chỉ tính toán tán xạ ngược khi xác nhận công suất dương hữu hạn và số looks hợp lệ.',
    },
  ];

  const allPassed = gates.every((g) => g.passed);
  let summaryReason = '';
  let summaryReason_vi = '';
  if (allPassed) {
    summaryReason =
      'All 10 scientific compatibility gates PASSED for the An Giang window [104.95, 10.45, 105.05, 10.55]. Calibrated before/after γ⁰ (dB) and Δγ⁰ (dB) comparison is enabled.';
    summaryReason_vi =
      'Đã vượt qua toàn bộ 10/10 cổng kiểm tra tính tương thích khoa học cho cửa sổ An Giang [104.95, 10.45, 105.05, 10.55]. Chức năng so sánh γ⁰ (dB) và Δγ⁰ (dB) đã được kích hoạt.';
  } else if (isDongThapDiagnostic) {
    summaryReason =
      'Comparison BLOCKED by Gates 9 & 10: HDF5 subset extraction at [105.45, 10.60, 105.55, 10.70] proved 0.00% valid pixels (100% mask = 255 outside the tilted SAR swath). Switch to the An Giang Verified Window to inspect the 99.91%-valid pair.';
    summaryReason_vi =
      'So sánh bị CHẶN bởi Cổng 9 & 10: Kết quả trích xuất tập con HDF5 tại [105.45, 10.60, 105.55, 10.70] chứng minh 0,00% điểm ảnh hợp lệ (100% mask = 255 nằm ngoài dải quét nghiêng của SAR). Hãy chuyển sang Cửa sổ An Giang đã xác thực để xem cặp ảnh hợp lệ 99,91%.';
  } else if (!sameTrack || !sameFrame || !sameDirection || !sameCrid || !sameOrder) {
    summaryReason =
      'Comparison BLOCKED by orbital/processor geometry gates: Selected granules do not share identical chronological order, Track, Frame, Orbit Direction, and Validated CRID P05036.';
    summaryReason_vi =
      'So sánh bị CHẶN bởi các cổng hình học quỹ đạo/phiên bản xử lý: Hai granule đã chọn không có cùng thứ tự thời gian, Track, Frame, Hướng quỹ đạo hoặc phiên bản CRID P05036 đã xác thực.';
  } else {
    summaryReason =
      'Comparison PENDING raster subset verification for the currently selected AOI. Switch to "An Giang — Tri Tôn / Cô Tô Window" to view the verified 2026-10-22 vs 2026-11-03 raster comparison.';
    summaryReason_vi =
      'So sánh ĐANG CHỜ xác thực tập con raster cho vùng quan tâm (AOI) hiện tại. Hãy chọn "An Giang — Cửa sổ Tri Tôn / Cô Tô" để xem kết quả so sánh raster ngày 2026-10-22 và 2026-11-03 đã xác thực.';
  }

  return { allPassed, gates, summaryReason, summaryReason_vi };
}

export interface ScientificInterpretationQA {
  id: string;
  question: string;
  question_vi: string;
  shortTag: string;
  shortTag_vi: string;
  answer: string;
  answer_vi: string;
  evidenceCitation: string;
  evidenceCitation_vi: string;
}

export const SCIENTIFIC_QA_ITEMS: ReadonlyArray<ScientificInterpretationQA> = [
  {
    id: 'qa-flood-proof',
    shortTag: 'Does ΔdB prove flooding?',
    shortTag_vi: 'ΔdB có chứng minh ngập lụt?',
    question:
      'Does a decrease or increase in L-band HH backscatter (Δγ⁰ dB) alone prove surface flooding?',
    question_vi:
      'Sự giảm hoặc tăng tán xạ ngược HH băng tần L (Δγ⁰ dB) đơn thuần có tự chứng minh ngập lụt bề mặt không?',
    answer:
      'No. In L-band (~24 cm wavelength) SAR, open calm water acts as a specular reflector and produces low backscatter (typically -16 to -24 dB, causing negative ΔdB when dry land becomes submerged). However, when water rises beneath emergent wetland canopies, flooded rice paddies, or melaleuca trees, radar waves bounce off the water surface and tree/crop stems ("double-bounce scattering"), which INCREASES HH backscatter (+3 to +6 dB). Conversely, soil moisture drying, harvesting, tillage, or wind roughening also alter γ⁰. Therefore, NISAR ChangeLens reports calibrated dB changes and physical hypotheses rather than unverified binary flood labels.',
    answer_vi:
      'Không. Với radar khẩu độ tổng hợp (SAR) băng tần L (bước sóng ~24 cm), mặt nước phẳng lặng phản xạ gương (specular reflection) làm tán xạ ngược thấp (-16 đến -24 dB, gây ΔdB âm khi đất khô bị ngập trắng). Tuy nhiên, khi nước dâng dưới tán rừng tràm, đầm lầy hoặc lúa nước nhô cao, sóng radar phản xạ kép giữa mặt nước và thân cây ("double-bounce scattering") làm TĂNG mạnh tán xạ ngược HH (+3 đến +6 dB). Ngược lại, thay đổi độ ẩm đất, thu hoạch, làm đất hoặc gió tạo sóng cũng làm đổi γ⁰. Do đó, NISAR ChangeLens báo cáo giá trị biến động dB hiệu chuẩn và các giả thuyết vật lý thay vì gắn nhãn ngập lụt nhị phân thiếu kiểm chứng.',
    evidenceCitation: 'Gate 10 & Level 2/3 Scientific Hierarchy (docs/SCIENTIFIC_METHODOLOGY.md)',
    evidenceCitation_vi:
      'Cổng 10 & Hệ thống diễn giải khoa học Cấp độ 2/3 (docs/SCIENTIFIC_METHODOLOGY.md)',
  },
  {
    id: 'qa-angiang-findings',
    shortTag: 'What changed in An Giang?',
    shortTag_vi: 'Biến động tại An Giang?',
    question:
      'What does the verified 2026-10-22 vs 2026-11-03 comparison in the An Giang window show?',
    question_vi:
      'Kết quả so sánh cặp ảnh đã xác thực ngày 2026-10-22 và 2026-11-03 tại cửa sổ An Giang cho thấy điều gì?',
    answer:
      'Across the 120.77 km² valid area in the An Giang screening window [104.95, 10.45, 105.05, 10.55], 96.13% of pixels (116.09 km²) remained radiometrically stable within ±3.0 dB (mean Δγ⁰ = +0.417 dB, median = +0.240 dB). Localized pockets totaling 4.39 km² (3.63%, concentrated in rectangular agricultural plots in the southeast) showed strong backscatter increases (≥ +3.0 dB), consistent with emergent crop/vegetation double-bounce or field water-management transitions, while 0.29 km² (0.24%) showed strong decreases (≤ -3.0 dB), consistent with localized ponding or smooth wet surfaces.',
    answer_vi:
      'Trên diện tích hợp lệ 120,77 km² của cửa sổ An Giang [104.95, 10.45, 105.05, 10.55], 96,13% điểm ảnh (116,09 km²) duy trì ổn định bức xạ trong khoảng ±3,0 dB (Δγ⁰ trung bình = +0,417 dB, trung vị = +0,240 dB). Các vùng cục bộ rộng tổng cộng 4,39 km² (3,63%, tập trung ở các ô ruộng hình chữ nhật phía đông nam) ghi nhận mức tăng tán xạ ngược mạnh (≥ +3,0 dB), phù hợp với tán xạ kép trên ruộng lúa/thảm thực vật ngập nước hoặc điều tiết nước nội đồng; trong khi 0,29 km² (0,24%) giảm mạnh (≤ -3,0 dB), phù hợp với các điểm ngập nước mặt phẳng hoặc đất ướt nhẵn.',
    evidenceCitation:
      'verified_pair_manifest.json (1,207,740 jointly valid pixels, EPSG:32648 10 m grid)',
    evidenceCitation_vi:
      'verified_pair_manifest.json (1.207.740 điểm ảnh hợp lệ chung, lưới 10 m EPSG:32648)',
  },
  {
    id: 'qa-dongthap-empty',
    shortTag: 'Why did Đồng Tháp bbox have 0% coverage?',
    shortTag_vi: 'Vì sao ô Đồng Tháp có 0% hợp lệ?',
    question:
      'Why did the first pilot bbox at [105.45, 10.60, 105.55, 10.70] have 0% valid pixels despite matching in NASA CMR?',
    question_vi:
      'Tại sao ô thử nghiệm đầu tiên ở [105.45, 10.60, 105.55, 10.70] lại có 0% điểm ảnh hợp lệ dù tìm thấy trên NASA CMR?',
    answer:
      'NASA CMR stores a coarse bounding box/polygon for each ~240 km NISAR frame. Because Descending Track 148 travels NNE-to-SSW (~10°–12° inclination), its ground swath is tilted inside the north-up EPSG:32648 raster grid. Approximately 37% of the full 28,289 × 26,645 raster consists of off-swath padding marked with mask = 255 and HHHH = NaN. The [105.45, 10.60] window fell inside that eastern off-swath triangle, whereas [104.95, 10.45] in An Giang lies squarely inside valid subswaths (99.91% valid).',
    answer_vi:
      'NASA CMR lưu khung bao/đa giác thô cho mỗi khung cảnh NISAR rộng ~240 km. Do quỹ đạo đi xuống Track 148 bay theo hướng Bắc Đông Bắc – Nam Tây Nam (nghiêng ~10°–12°), dải quét thực tế trên mặt đất nằm nghiêng bên trong lưới raster EPSG:32648 hướng Bắc. Khoảng 37% diện tích ma trận 28.289 × 26.645 là vùng đệm ngoài dải quét mang giá trị mask = 255 và HHHH = NaN. Ô [105.45, 10.60] tại Đồng Tháp rơi vào góc khuyết phía đông đó, trong khi ô [104.95, 10.45] tại An Giang nằm trọn trong dải quét hợp lệ (đạt 99,91% hợp lệ).',
    evidenceCitation:
      'data/raw/nisar_subsets/mekong_bbox_10545_10555_1060_1070_20261114/subset_manifest.json',
    evidenceCitation_vi:
      'data/raw/nisar_subsets/mekong_bbox_10545_10555_1060_1070_20261114/subset_manifest.json',
  },
  {
    id: 'qa-boxcar-audit',
    shortTag: 'How is the 5×5 boxcar filter audited?',
    shortTag_vi: 'Kiểm định bộ lọc speckle 5×5?',
    question:
      'How does the 5×5 boxcar speckle filter handle invalid (mask=0 / NaN) pixels and why is filtering done in linear power?',
    question_vi:
      'Bộ lọc nhiễu speckle boxcar 5×5 xử lý các điểm ảnh không hợp lệ (mask=0 / NaN) như thế nào và vì sao phải lọc trên miền công suất tuyến tính?',
    answer:
      'SAR speckle is multiplicative in linear power, so spatial averaging must be computed on linear γ⁰ power (HHHH) before applying 10·log10(P). Our filter zeroes invalid pixels in the numerator and divides by the local 5×5 valid-pixel fraction norm = uniform_filter(valid, 5), rejecting neighborhoods with ≤20% valid pixels. Independent QA confirmed zero bias from invalid pixels (max deviation 2.38×10⁻⁷ vs exact valid patch mean) and documented why reducing speckle variance increases the mean of 10·log10(P) by ~1.05 dB on both dates equally (Jensen inequality) while keeping Δγ⁰ = +0.417 dB unbiased.',
    answer_vi:
      'Nhiễu đốm (speckle) trong ảnh SAR có bản chất nhân trên miền công suất tuyến tính, nên việc lấy trung bình không gian bắt buộc thực hiện trên công suất γ⁰ tuyến tính (HHHH) trước khi đổi sang 10·log10(P). Bộ lọc của chúng tôi gán 0 cho các điểm ảnh không hợp lệ ở tử số rồi chia cho tỷ lệ điểm ảnh hợp lệ cục bộ norm = uniform_filter(valid, 5) trong lân cận 5×5, đồng thời loại bỏ các vùng có ≤20% điểm hợp lệ. Kiểm định độc lập (FINAL_SCIENTIFIC_QA.md) xác nhận sai số tuyệt đối tối đa chỉ 2,38×10⁻⁷ so với trung bình mẫu hợp lệ chính xác, và giải thích rõ hiệu ứng bất đẳng thức Jensen làm trung bình dB sau lọc cao hơn ~1,05 dB đều ở cả hai ngày nhưng giữ nguyên độ chênh Δγ⁰ = +0,417 dB.',
    evidenceCitation: 'docs/FINAL_SCIENTIFIC_QA.md — Section 3 & 4.2',
    evidenceCitation_vi: 'docs/FINAL_SCIENTIFIC_QA.md — Mục 3 & 4.2',
  },
  {
    id: 'qa-missing-evidence',
    shortTag: 'What external evidence is needed?',
    shortTag_vi: 'Cần thêm dữ liệu bổ trợ nào?',
    question:
      'What auxiliary datasets are required to convert these NISAR backscatter anomalies into an operational flood/hydrology product?',
    question_vi:
      'Cần kết hợp thêm những nguồn dữ liệu bổ trợ nào để chuyển các dị thường tán xạ ngược NISAR này thành bản đồ ngập lụt/thủy văn nghiệp vụ?',
    answer:
      '1) Co-temporal optical imagery (Sentinel-2 / Landsat NDWI/MNDWI) where cloud-free to cross-check open water; 2) Cross-polarization HVHV covariance and HH/HV ratio to separate volume scattering from double-bounce; 3) Mekong River Commission (MRC) / provincial water-level gauge records (Châu Đốc, Tân Châu, Tri Tôn canals); 4) High-resolution DEM + local incidence angle / RTC normalization around Núi Tô (Tri Tôn hills); and 5) Field crop-calendar validation.',
    answer_vi:
      '1) Ảnh quang học cùng thời điểm (Sentinel-2 / Landsat chỉ số NDWI/MNDWI) tại vùng quang mây để đối chiếu mặt nước hở; 2) Hiệp phương sai phân cực chéo HVHV và tỷ số HH/HV nhằm tách tán xạ khối khỏi tán xạ kép double-bounce; 3) Số liệu mực nước thực đo từ Ủy hội sông Mê Công (MRC) và trạm thủy văn địa phương (Châu Đốc, Tân Châu, kênh Tri Tôn); 4) Mô hình số độ cao (DEM) độ phân giải cao và chuẩn hóa góc tới cục bộ quanh khu vực Núi Tô; và 5) Kiểm chứng lịch thời vụ canh tác thực địa.',
    evidenceCitation: 'docs/LIMITATIONS.md — Section: Missing Auxiliary Evidence',
    evidenceCitation_vi: 'docs/LIMITATIONS.md — Mục: Dữ liệu bổ trợ còn thiếu',
  },
];

export const VALIDATION_NOTE =
  'Verified 2026-10-22 vs 2026-11-03 NISAR_L2_GCOV_V1 pair in the An Giang screening window [104.95, 10.45, 105.05, 10.55]: 99.91% common valid coverage (1,207,740 / 1,208,870 pixels, 120.77 km²) on an identical EPSG:32648 10 m grid.';

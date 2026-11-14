export type Language = 'en' | 'vi';

export const STORAGE_KEY = 'nisar-changelens-lang';

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    // Header & Branding
    'brand.tagline': 'See Change. Understand Earth. · Team 4/K',
    'brand.homeAria': 'NISAR ChangeLens home',
    'header.challengeLabel': 'NASA SPACE APPS CHALLENGE 2026',
    'header.challengeName': 'Dancing with the SARs · Mekong Delta',
    'header.statusVerified': 'An Giang Pair Verified (10/10 Gates · 99.91% Valid)',
    'header.statusPending': 'Pending Validation / Gated Selection',
    'header.viewModeAria': 'View mode',
    'header.modeExplore': 'Explore',
    'header.modeResearch': 'Research & Gates',
    'header.langSwitchAria': 'Language switcher (English / Vietnamese)',
    'header.langEn': 'EN',
    'header.langVi': 'VI',
    'header.langEnTitle': 'Switch interface to English',
    'header.langViTitle': 'Chuyển giao diện sang Tiếng Việt',

    // Map Toolbar & Status
    'map.workspaceAria': 'Map workspace',
    'map.interactiveAria': 'Mekong Delta interactive SAR map',
    'map.statusLoading': 'Loading boundaries…',
    'map.statusReady': 'Map & GeoJSON boundaries ready',
    'map.statusBoundaryError': 'Boundary files unavailable',
    'map.statusMapError': 'Map could not initialize',
    'map.activeEvidencePrefix': 'Active Evidence Status:',
    'map.selectedPointPrefix': 'Selected point:',
    'map.clickPrompt': 'Click any province or point on the map to inspect',

    // Map HUD & Controls
    'hud.controlsAria': 'Map controls and AOI status',
    'hud.tier4Verified': 'TIER 4: VERIFIED PAIR (99.91% VALID)',
    'hud.tier2Rejected': 'TIER 2 ONLY: 0.00% VALID (MASK=255)',
    'hud.tierCustom': 'CUSTOM AOI: RASTER SUBSET UNVERIFIED',
    'hud.tier1Catalog': 'TIER 1: MEKONG CATALOG (29 GRANULES)',
    'hud.provincePrefix': 'Province:',
    'hud.btnAnGiang': 'An Giang Verified AOI',
    'hud.btnAnGiangTitle':
      'Fly to verified An Giang NISAR GCOV window [104.95, 10.45, 105.05, 10.55]',
    'hud.btnDongThap': 'Đồng Tháp 0% Diagnostic',
    'hud.btnDongThapTitle':
      'Inspect rejected Đồng Tháp pilot bbox [105.45, 10.60, 105.55, 10.70] (0% valid)',
    'hud.btnPlaceCustomActive': 'Click Map to Place AOI…',
    'hud.btnPlaceCustom': 'Place Custom AOI',
    'hud.btnPlaceCustomTitle':
      'Click anywhere on the map to place a custom 0.10° × 0.10° AOI bounding box',
    'hud.btnHideFootprints': 'Hide CMR Footprints',
    'hud.btnShowFootprints': 'Show CMR Footprints',
    'hud.btnReset': 'Reset Selection',
    'hud.btnResetTitle': 'Reset AOI selection and return to default view',

    // Map Layer Bar
    'layer.groupAria': 'NISAR raster layer selector',
    'layer.barLabel': 'NISAR GCOV Layer:',
    'layer.swipe': 'Before/After Swipe + ΔdB Map',
    'layer.beforeDb': 'Oct 22 γ⁰ (dB)',
    'layer.afterDb': 'Nov 03 γ⁰ (dB)',
    'layer.changeDb': 'Continuous Δγ⁰ (dB)',
    'layer.changeClasses': 'Classified ±3.0 dB',
    'layer.validMask': 'Valid Mask (99.91%)',
    'layer.opacity': 'Opacity',
    'layer.opacityAria': 'Raster overlay opacity',

    // Swipe Dock on Map
    'swipe.dockAria': 'Before and After NISAR HH backscatter swipe comparison',
    'swipe.title': 'Before / After Calibrated Backscatter Swipe',
    'swipe.subtitle':
      'An Giang [104.95, 10.45, 105.05, 10.55] · EPSG:32648 10 m · 1,207,740 valid pixels',
    'swipe.badge': 'REAL NISAR L2 GCOV V1',
    'swipe.beforeAlt': 'Before: 2026-10-22 NISAR HHHH gamma-0 dB',
    'swipe.afterAlt': 'After: 2026-11-03 NISAR HHHH gamma-0 dB',
    'swipe.tagLeft': '2026-10-22 (Before · Mean -8.74 dB)',
    'swipe.tagRight': '2026-11-03 (After · Mean -8.33 dB)',
    'swipe.splitLabel': 'Swipe Split',

    // Map Diagnostic / Unavailable Banners
    'banner.dongThapTitle': 'Diagnostic AOI Rejected by Gate 9 (0.00% Valid Pixels):',
    'banner.dongThapBody1': 'In',
    'banner.dongThapBody2': ', all 1,212,165 pixels have',
    'banner.dongThapBody3':
      '(outside the tilted Descending Track 148 radar swath). No fake imagery is rendered.',
    'banner.switchAnGiangLink': 'Switch to Verified An Giang Window (99.91% valid) →',
    'banner.catalogTitle': 'Catalog / Pending Validation AOI Mode:',
    'banner.catalogBody':
      'Viewing regional boundaries and NASA CMR granule footprints. Pixel-level change overlays are only rendered where HDF5 mask & backscatter subsets pass all 10 compatibility gates.',
    'banner.loadAnGiangLink': 'Load Verified An Giang Comparison →',
    'banner.syntheticBadge': 'SOFTWARE TEST FIXTURE ONLY — NOT REAL NISAR DATA',
    'banner.syntheticBody':
      'Synthetic verification checkerboard active for UI component testing. Never mixed with authentic NISAR observations.',
    'banner.basemapWarning':
      'Basemap tiles are unavailable. GeoJSON boundaries and verified NISAR GCOV rasters remain active.',

    // Map Legend
    'legend.aria': 'Map legend and coordinates',
    'legend.mekong': 'Mekong Delta',
    'legend.angiang': 'An Giang Verified AOI (99.91%)',
    'legend.dongthap': 'Đồng Tháp Pilot (0% Off-Swath)',
    'legend.footprints': 'CMR Track 148 / Catalog Footprints',
    'legend.radioAria': 'Radiometric legend',
    'legend.backscatterPrefix': 'HH Backscatter γ⁰:',
    'legend.backscatterLow': '-25 dB (dark/smooth water)',
    'legend.backscatterHigh': '0 dB (bright/double-bounce)',
    'legend.classesPrefix': 'Classes:',
    'legend.classesStable': 'Stable ±3 dB (116.09 km²)',
    'legend.deltaPrefix': 'Δγ⁰ (Nov 03 − Oct 22):',
    'legend.deltaDec': '-6 dB (Blue Decrease)',
    'legend.deltaZero': '0 dB (White)',
    'legend.deltaInc': '+6 dB (Red Increase)',
    'legend.cursorPrefix': 'Cursor:',
    'legend.cursorPrompt': 'Move cursor over map for coordinates',

    // Side Rail Navigation
    'rail.aria': 'Observation controls and scientific analysis',
    'rail.navAria': 'Workbench sections',
    'rail.tabAll': 'All Steps',
    'rail.tabAoi': '01 AOI',
    'rail.tabCatalog': '02 Catalog (29)',
    'rail.tabCompare': '03 Compare',
    'rail.tabInterpret': '04 Interpret',
    'rail.tabGates': '05 Gates',

    // Section 01: AOI & Evidence Ladder
    'sec1.eyebrow': 'DISCOVER & SELECT AOI',
    'sec1.title': 'Area of Interest (AOI) & Evidence Tier',
    'sec1.resetBtn': 'Reset AOI',
    'sec1.resetBtnTitle': 'Reset to verified An Giang window',
    'sec1.presetLabel': 'Preset Verification Windows',
    'sec1.provinceLabel': 'Mekong Delta Province (13 Provinces)',
    'sec1.provinceTagVerified': '— [Contains Verified 99.91% Window]',
    'sec1.provinceTagDiagnostic': '— [Contains 0% Off-Swath Diagnostic Bbox]',
    'sec1.provinceTagCatalog': '— [Catalog Discovery]',
    'sec1.bboxLabel': 'Bounding Box (WGS84)',
    'sec1.areaValidLabel': 'Window Area / Valid Pixels',
    'sec1.validSuffix': 'valid',
    'sec1.unverifiedSubset': 'Pending validation',
    'sec1.ladderAria': 'Four levels of SAR evidence',
    'sec1.ladderTitle': '4-Tier Scientific Evidence Distinction',

    // Section 02: NISAR Data Explorer
    'sec2.eyebrow': 'NISAR DATA EXPLORER',
    'sec2.titlePrefix': 'NASA CMR Inventory',
    'sec2.titleSuffix': 'Granules',
    'sec2.filterMaturityAria': 'Filter by collection maturity',
    'sec2.filterAllCollections': 'All Collections (29)',
    'sec2.filterValidated': 'Validated NISAR_L2_GCOV_V1 (11)',
    'sec2.filterProvisional': 'Provisional V1 (18)',
    'sec2.filterTrackAria': 'Filter by relative orbit track',
    'sec2.filterAllTracks': 'All Orbit Tracks',
    'sec2.filterTrack148': 'Track 148 (Candidate Pair Track)',
    'sec2.filterTrackPrefix': 'Track',
    'sec2.searchPlaceholder': 'Search granule ID, concept ID, or date (e.g. 2026-10-22)…',
    'sec2.searchAria': 'Search granules',
    'sec2.intersectsCheckbox': 'Intersects AOI',
    'sec2.listAria': 'Discovered NISAR granules',
    'sec2.badgeValidated': 'VALIDATED V1',
    'sec2.badgeProvisional': 'PROVISIONAL',
    'sec2.metaTrack': 'Track',
    'sec2.metaFrame': 'Frame',
    'sec2.metaCycle': 'Cycle',
    'sec2.intersectsYes': '✓ Intersects active AOI bbox',
    'sec2.intersectsNo': 'Outside AOI bbox',
    'sec2.verifiedSubsetTag': '★ 99.91% Verified in An Giang / 0% in Đồng Tháp',
    'sec2.btnBeforeActive': '✓ BEFORE Date',
    'sec2.btnBeforeSet': 'Set BEFORE',
    'sec2.btnAfterActive': '✓ AFTER Date',
    'sec2.btnAfterSet': 'Set AFTER',

    // Section 03: Before-After Comparison & Change Visualization
    'sec3.eyebrow': 'COMPARE & VISUALIZE CHANGE',
    'sec3.title': 'Before–After Radar Backscatter',
    'sec3.tagPassed': '10/10 Gates Passed',
    'sec3.tagBlocked': 'Gated / Unavailable',
    'sec3.beforeLabel': 'EARLIER (BEFORE)',
    'sec3.beforeAria': 'Before acquisition',
    'sec3.beforeNoteVerified': 'Mean γ⁰: -8.742 dB · Looks: 5.18 (5×5 boxcar)',
    'sec3.afterLabel': 'LATER (AFTER)',
    'sec3.afterAria': 'After acquisition',
    'sec3.afterNoteVerified': 'Mean γ⁰: -8.325 dB · Looks: 5.18 (5×5 boxcar)',
    'sec3.catalogGranuleNote': 'Catalog acquisition selected',
    'sec3.sliderBefore': 'Before (2026-10-22)',
    'sec3.sliderSplit': 'Swipe Split:',
    'sec3.sliderAfter': 'After (2026-11-03)',
    'sec3.sliderAria': 'Before and after swipe slider',
    'sec3.layerGroupAria': 'Map layers',
    'sec3.layerSwipe': 'Swipe + ΔdB',
    'sec3.layerBefore': 'Oct 22 γ⁰',
    'sec3.layerAfter': 'Nov 03 γ⁰',
    'sec3.layerChangeDb': 'Continuous ΔdB',
    'sec3.layerClasses': '±3 dB Classes',
    'sec3.layerMask': 'Valid Mask',
    'sec3.statsAria': 'Verified change statistics',
    'sec3.statsTitle': 'Calibrated HHHH Backscatter Change (Δγ⁰ = γ⁰_after − γ⁰_before)',
    'sec3.statsSubtitle':
      '120.77 km² common valid coverage (1,207,740 / 1,208,870 px = 99.91%) · 5×5 boxcar speckle filtering',
    'sec3.statMeanDelta': 'Mean Δγ⁰',
    'sec3.statMedianPrefix': 'Median',
    'sec3.statPctRange': '5th – 95th Pct',
    'sec3.statTo': 'to',
    'sec3.statStdPrefix': 'Std',
    'sec3.statExcluded': 'Excluded Pixels',
    'sec3.classDec': 'Strong Decrease (Δγ⁰ ≤ −3.0 dB)',
    'sec3.classNeutral': 'Stable / Within ±3.0 dB',
    'sec3.classInc': 'Strong Increase (Δγ⁰ ≥ +3.0 dB)',
    'sec3.blockedTitle': 'Comparison Unavailable / Blocked by Compatibility Gates',
    'sec3.restoreBtn': 'Load Verified An Giang Pair (2026-10-22 → 2026-11-03)',
    'sec3.fixtureToggle':
      'Preview clearly labeled Software Test Fixture (UI verification only)',

    // Section 04: Scientific Interpretation
    'sec4.eyebrow': 'SCIENTIFIC INTERPRETATION',
    'sec4.title': '3-Level Evidence Hierarchy & Q&A',
    'sec4.level1Tag': 'LEVEL 1 — OBSERVED RADAR CHANGE (DIRECTLY MEASURED)',
    'sec4.level1VerifiedBody':
      'Between 2026-10-22 and 2026-11-03 (12-day repeat on Descending Track 148, Frame 083), calibrated L-band HH backscatter (γ⁰_HHHH, 5×5 boxcar filtered) across the 120.77 km² common valid An Giang window shifted from a mean of -8.742 dB to -8.325 dB (mean Δγ⁰ = +0.417 dB; unsmoothed raw pixel mean shifted from -9.793 dB to -9.317 dB). 96.13% of the window (116.09 km²) remained within ±3.0 dB, while 4.39 km² (3.63%) increased by ≥ +3.0 dB (concentrated in southeast rectangular agricultural plots) and 0.29 km² (0.24%) decreased by ≤ -3.0 dB.',
    'sec4.level1PendingPrefix':
      'No pixel-wise radar change is reported for the currently selected AOI/pair because compatibility validation is pending or blocked:',
    'sec4.level2Tag': 'LEVEL 2 — POSSIBLE PHYSICAL MECHANISMS (HYPOTHESES)',
    'sec4.level2Item1Title': 'Backscatter Decreases (≤ −3.0 dB, Blue):',
    'sec4.level2Item1Body':
      'Consistent with increased specular reflection from smooth open water ponding, newly irrigated paddy fields, or vegetation harvesting/clearance.',
    'sec4.level2Item2Title': 'Backscatter Increases (≥ +3.0 dB, Red):',
    'sec4.level2Item2Body':
      'Consistent with L-band double-bounce scattering between water surfaces and emergent rice/wetland stems, vegetative growth, soil moisture/roughness shifts, or field drainage exposing bunds.',
    'sec4.level3Tag': 'LEVEL 3 — SUPPORTED CONCLUSIONS & MISSING EVIDENCE',
    'sec4.level3SupportedTitle': 'Supported:',
    'sec4.level3SupportedBody':
      'Localized radiometric anomalies in agricultural parcels of Tri Tôn / Cô Tô (An Giang) are real, calibrated 12-day L-band backscatter shifts verified on an exact 10 m EPSG:32648 grid.',
    'sec4.level3NotSupportedTitle': 'Not Supported Alone:',
    'sec4.level3NotSupportedBody':
      'Backscatter change alone does NOT prove flooding, drying, or land-use conversion. Confirming surface inundation requires co-temporal optical water indices (Sentinel-2 NDWI), HVHV cross-pol analysis, river gauge records, and DEM RTC slope normalization around Núi Tô.',
    'sec4.qaAria': 'Evidence-based scientific Q&A',
    'sec4.qaTitle': 'Deterministic Evidence-Based Q&A Inspector',
    'sec4.qaSourcePrefix': 'Source / Provenance:',
    'sec4.coordEyebrow': 'SELECTED MAP COORDINATE',
    'sec4.coordInside':
      'Inside Verified An Giang Window [104.95..105.05°E, 10.45..10.55°N] (EPSG:32648 10 m grid)',
    'sec4.coordOutside': 'Outside the verified An Giang raster subset window',

    // Section 05: Compatibility Gates & Data Provenance
    'sec5.summaryTitle': '05 · 10 Compatibility Gates & Data Provenance',
    'sec5.statusVerified': '10/10 GATES PASSED · SHA-256 VERIFIED',
    'sec5.statusPending': 'GATE CHECK ACTIVE',
    'sec5.tableAria': '10 scientific compatibility gates',
    'sec5.colGate': 'Compatibility Gate',
    'sec5.colStatus': 'Status',
    'sec5.colEvidence': 'Observed Evidence',
    'sec5.badgePass': 'PASS',
    'sec5.badgeBlocked': 'BLOCKED',
    'sec5.dtBudget': 'HTTP Range Budget Ledger',
    'sec5.budgetCap': 'Shared Budget Cap:',
    'sec5.budgetMask': 'Mask Checkpoint',
    'sec5.budgetBackscatter': 'Backscatter + Looks Checkpoint',
    'sec5.budgetCombined': 'Combined Used:',
    'sec5.budgetRemaining': 'Remaining:',
    'sec5.dtGrid': 'Verified GCOV Grid & Formula',
    'sec5.gridVersion': 'Version',
    'sec5.gridLook': 'Left-looking',
    'sec5.gridWindow': 'Window rows',
    'sec5.gridCols': 'cols',
    'sec5.gridFormula': 'Formula:',
    'sec5.granuleCollection': 'Collection:',
    'sec5.granuleOrbit': 'Orbit',
    'sec5.dtChecksums': 'Verified Output Checksums (SHA-256)',
    'sec5.sourceNote':
      'Data source: NASA CMR / ASF Earthdata Cloud (NISAR_L2_GCOV_V1). Independent Scientific QA completed (docs/FINAL_SCIENTIFIC_QA.md). Zero Earthdata credentials, netrc contents, or signed URL tokens are stored in or exposed to the browser.',

    // Footer
    'footer.left':
      'Team 4/K · NISAR ChangeLens · NASA Space Apps Challenge 2026 (Dancing with the SARs) · Not an official NASA product',
    'footer.right':
      'Data: NASA/ISRO NISAR L2 GCOV V1 via ASF DAAC · Basemap © Esri / OpenStreetMap · Boundaries: geoBoundaries (CC BY 4.0)',

    // Mode Banner, Splitter & Primary Map Controls (UX Optimization)
    'mode.exploreBadge': 'EXPLORE MODE · VISUAL CHANGE VIEW',
    'mode.exploreHint':
      'Explore first: see where radar reflections changed over time in plain language.',
    'mode.researchBadge': 'RESEARCH & GATES · FULL SCIENTIFIC WORKBENCH',
    'mode.researchHint':
      'Full SAR metadata, 29 CMR granules, 10 compatibility gates, CRID policy & SHA-256 provenance.',
    'mode.switchToResearchBtn': 'Open Research & Gates Workbench →',
    'mode.switchToExploreBtn': '← Back to Simplified Explore View',
    'splitter.aria': 'Resize map and analysis sidebar',
    'splitter.tooltip': 'Drag to resize map vs. sidebar (Double-click to reset)',
    'splitter.resetBtn': 'Reset Width',
    'splitter.resetTitle': 'Reset map and sidebar layout to default width',

    // Primary Map Layer Switcher (BEFORE | AFTER | CHANGE | SWIPE)
    'primaryLayer.label': 'Map View:',
    'primaryLayer.before': 'BEFORE (Oct 22)',
    'primaryLayer.after': 'AFTER (Nov 03)',
    'primaryLayer.change': 'CHANGE MAP (ΔdB)',
    'primaryLayer.swipe': 'BEFORE ↔ AFTER SWIPE',
    'primaryLayer.resetOpacity': 'Reset (90%)',
    'primaryLayer.thresholdLabel': 'Change View Style:',
    'primaryLayer.cautionNote':
      'Colors show changes in radar backscatter (dB) between the two observation dates. They do not independently identify the cause of the change.',
    'primaryLayer.invalidSwatch': 'Excluded / Invalid (0.09%)',

    // Explore Mode — Section 1: Location
    'explore.sec1.step': '1',
    'explore.sec1.eyebrow': 'LOCATION',
    'explore.sec1.title': 'Where are you exploring?',
    'explore.sec1.locationLabel': 'Study Area / Location',
    'explore.sec1.provinceLabel': 'Or jump to a Mekong Delta Province',
    'explore.sec1.coordsSummary': 'Show technical coordinates & area details',
    'explore.sec1.statusReady': '✓ Verified Satellite Change Map Available (99.91% valid coverage)',
    'explore.sec1.statusOffSwath':
      '⚠ Diagnostic Off-Swath Window (0% valid radar coverage — comparison disabled)',
    'explore.sec1.statusCatalog':
      'ℹ Regional / Province Overview (Select An Giang Window to view the pixel-level Change Map)',

    // Explore Mode — Section 2: Time Comparison & Compatible Pair Discovery
    'explore.sec2.step': '2',
    'explore.sec2.eyebrow': 'TIME COMPARISON',
    'explore.sec2.title': 'Observation Dates & Compatibility',
    'explore.sec2.intervalBadge': 'days between observations',
    'explore.sec2.comparableBadge': '✓ Scientifically Comparable Pair (Level 3 Verified)',
    'explore.sec2.geometricBadge': '◐ Geometrically Compatible Candidate (Level 2 — Catalog Only)',
    'explore.sec2.incompatibleBadge': '✕ Cannot Compare Directly (Level 1)',
    'explore.sec2.autoOrderedNotice':
      'Dates were automatically ordered chronologically (Earlier → Later) so Change = Later − Earlier.',
    'explore.sec2.swapOrderBtn': 'Auto-Order Chronologically (Earlier → Later)',
    'explore.sec2.pairFinderTitle': 'Compatible Observation Pair Finder',
    'explore.sec2.pairFinderSubtitle':
      'Automatically grouped from 29 NASA CMR granules by matching orbit Track, Frame & viewing geometry:',
    'explore.sec2.level3Heading': 'Level 3 — Raster-Verified Compatible Pair (Ready to View)',
    'explore.sec2.level2Heading':
      'Level 2 — Geometrically Compatible Repeat-Pass Candidates (Catalog Metadata Verified)',
    'explore.sec2.selectPairBtn': 'Load Pair',
    'explore.sec2.activePairTag': 'Active Pair',
    'explore.sec2.whyBlockedBtn': "Why can't these images be compared?",
    'explore.sec2.cridPolicyTitle': 'CRID Processor Compatibility Policy',
    'explore.sec2.cridPolicyBody':
      'Comparing two SAR acquisitions requires consistent calibration software. Pairs sharing Validated CRID P05036 (v1.0.20) pass Gate 7 directly. Repeat-pass pairs sharing Provisional CRID P05023 have consistent internal software but provisional maturity, while cross-CRID pairs (P05023 → P05036) require radiometric offset verification before pixel subtraction.',

    // Explore Mode — Section 3: What Changed?
    'explore.sec3.step': '3',
    'explore.sec3.eyebrow': 'WHAT CHANGED?',
    'explore.sec3.title': 'Surface Radar Change Summary',
    'explore.sec3.leadText':
      'Some areas show stronger radar returns, while others show weaker returns compared with the earlier observation on October 22, 2026.',
    'explore.sec3.cardDecTitle': 'Weaker Radar Return (Decrease)',
    'explore.sec3.cardDecDesc':
      'Blue areas reflect less radar energy than on Oct 22 (consistent with smoother wet surfaces, ponded water, or cleared vegetation).',
    'explore.sec3.cardStableTitle': 'Relatively Stable Surface',
    'explore.sec3.cardStableDesc':
      'Neutral areas changed by less than the selected threshold between Oct 22 and Nov 3 (96.13% of the window at ±3.0 dB).',
    'explore.sec3.cardIncTitle': 'Stronger Radar Return (Increase)',
    'explore.sec3.cardIncDesc':
      'Red/orange areas reflect more radar energy than on Oct 22 (concentrated in southeastern agricultural plots; consistent with water-stem double-bounce, crop growth, or rougher soil).',
    'explore.sec3.cautionBoxTitle': 'What the colors mean (Important Scientific Note)',
    'explore.sec3.cautionBoxBody':
      'Colors show measured changes in L-band radar backscatter (Δγ⁰ in dB). Backscatter change is NOT a direct water or flood map: positive change does not always mean flooding, and negative change does not always mean drying.',

    // Explore Mode — Section 4: Explore More (Progressive Disclosure)
    'explore.sec4.step': '4',
    'explore.sec4.eyebrow': 'EXPLORE MORE',
    'explore.sec4.title': 'Optional Details & Scientific Context',
    'explore.sec4.accStats': 'Change Statistics & Numerical Breakdown',
    'explore.sec4.accObs': 'Satellite Observation Details (Oct 22 & Nov 03)',
    'explore.sec4.accQuality': 'Data Quality, Valid Coverage & Speckle Filtering',
    'explore.sec4.accInterpret': 'Scientific Interpretation & Frequently Asked Questions',
    'explore.sec4.qualityBody':
      '99.91% of the An Giang window (1,207,740 of 1,208,870 pixels = 120.77 km²) contains valid positive radar measurements on both dates. 1,130 boundary pixels (0.09%) are excluded so invalid data never contaminate neighboring pixels during 5×5 boxcar speckle filtering.',
  },

  vi: {
    // Header & Branding
    'brand.tagline': 'Nhìn Biến Động. Hiểu Trái Đất. · Đội 4/K',
    'brand.homeAria': 'Trang chủ NISAR ChangeLens',
    'header.challengeLabel': 'NASA SPACE APPS CHALLENGE 2026',
    'header.challengeName': 'Dancing with the SARs · Đồng bằng sông Cửu Long',
    'header.statusVerified': 'Cặp ảnh An Giang đã xác thực (10/10 Cổng · 99,91% Hợp lệ)',
    'header.statusPending': 'Đang chờ xác thực / Đã chặn theo cổng kiểm tra',
    'header.viewModeAria': 'Chế độ hiển thị',
    'header.modeExplore': 'Khám phá',
    'header.modeResearch': 'Nghiên cứu & Cổng kiểm tra',
    'header.langSwitchAria': 'Chuyển đổi ngôn ngữ (Tiếng Anh / Tiếng Việt)',
    'header.langEn': 'EN',
    'header.langVi': 'VI',
    'header.langEnTitle': 'Switch interface to English',
    'header.langViTitle': 'Chuyển giao diện sang Tiếng Việt',

    // Map Toolbar & Status
    'map.workspaceAria': 'Không gian bản đồ',
    'map.interactiveAria': 'Bản đồ SAR tương tác Đồng bằng sông Cửu Long',
    'map.statusLoading': 'Đang tải ranh giới…',
    'map.statusReady': 'Bản đồ & ranh giới GeoJSON sẵn sàng',
    'map.statusBoundaryError': 'Không thể tải tệp ranh giới',
    'map.statusMapError': 'Không thể khởi tạo bản đồ',
    'map.activeEvidencePrefix': 'Trạng thái bằng chứng hiện tại:',
    'map.selectedPointPrefix': 'Điểm đã chọn:',
    'map.clickPrompt': 'Nhấp vào bất kỳ tỉnh hoặc vị trí nào trên bản đồ để kiểm tra',

    // Map HUD & Controls
    'hud.controlsAria': 'Điều khiển bản đồ và trạng thái vùng quan tâm (AOI)',
    'hud.tier4Verified': 'TẦNG 4: CẶP ẢNH ĐÃ XÁC THỰC (99,91% HỢP LỆ)',
    'hud.tier2Rejected': 'CHỈ ĐẠT TẦNG 2: 0,00% HỢP LỆ (MASK=255)',
    'hud.tierCustom': 'AOI TÙY CHỈNH: ĐANG CHỜ XÁC THỰC RASTER',
    'hud.tier1Catalog': 'TẦNG 1: DANH MỤC ĐBSCL (29 GRANULE)',
    'hud.provincePrefix': 'Tỉnh/Thành:',
    'hud.btnAnGiang': 'AOI An Giang (Đã xác thực)',
    'hud.btnAnGiangTitle':
      'Di chuyển tới cửa sổ NISAR GCOV An Giang đã xác thực [104.95, 10.45, 105.05, 10.55]',
    'hud.btnDongThap': 'Chẩn đoán Đồng Tháp (0%)',
    'hud.btnDongThapTitle':
      'Kiểm tra ô thử nghiệm Đồng Tháp [105.45, 10.60, 105.55, 10.70] (0% điểm ảnh hợp lệ)',
    'hud.btnPlaceCustomActive': 'Nhấp bản đồ để đặt AOI…',
    'hud.btnPlaceCustom': 'Đặt AOI tùy chỉnh',
    'hud.btnPlaceCustomTitle':
      'Nhấp vào bất kỳ đâu trên bản đồ để đặt ô vùng quan tâm (AOI) 0,10° × 0,10°',
    'hud.btnHideFootprints': 'Ẩn vết quét CMR',
    'hud.btnShowFootprints': 'Hiện vết quét CMR',
    'hud.btnReset': 'Đặt lại lựa chọn',
    'hud.btnResetTitle': 'Đặt lại vùng quan tâm (AOI) và quay về góc nhìn mặc định',

    // Map Layer Bar
    'layer.groupAria': 'Bộ chọn lớp ảnh raster NISAR',
    'layer.barLabel': 'Lớp NISAR GCOV:',
    'layer.swipe': 'Trượt Trước/Sau + Bản đồ ΔdB',
    'layer.beforeDb': '22/10 γ⁰ (dB)',
    'layer.afterDb': '03/11 γ⁰ (dB)',
    'layer.changeDb': 'Biến động liên tục Δγ⁰ (dB)',
    'layer.changeClasses': 'Phân lớp ±3,0 dB',
    'layer.validMask': 'Mask hợp lệ (99,91%)',
    'layer.opacity': 'Độ mờ',
    'layer.opacityAria': 'Độ mờ lớp phủ raster',

    // Swipe Dock on Map
    'swipe.dockAria': 'So sánh trượt tán xạ ngược HH NISAR Trước và Sau',
    'swipe.title': 'So sánh trượt Tán xạ ngược (Backscatter) Trước / Sau',
    'swipe.subtitle':
      'An Giang [104.95, 10.45, 105.05, 10.55] · EPSG:32648 10 m · 1.207.740 điểm ảnh hợp lệ',
    'swipe.badge': 'DỮ LIỆU THẬT NISAR L2 GCOV V1',
    'swipe.beforeAlt': 'Trước: 2026-10-22 NISAR HHHH gamma-0 dB',
    'swipe.afterAlt': 'Sau: 2026-11-03 NISAR HHHH gamma-0 dB',
    'swipe.tagLeft': '22/10/2026 (Trước · TB -8,74 dB)',
    'swipe.tagRight': '03/11/2026 (Sau · TB -8,33 dB)',
    'swipe.splitLabel': 'Tỷ lệ thanh trượt',

    // Map Diagnostic / Unavailable Banners
    'banner.dongThapTitle': 'AOI chẩn đoán bị từ chối bởi Cổng 9 (0,00% điểm ảnh hợp lệ):',
    'banner.dongThapBody1': 'Trong ô',
    'banner.dongThapBody2': ', toàn bộ 1.212.165 điểm ảnh đều có',
    'banner.dongThapBody3':
      '(nằm ngoài dải quét nghiêng của quỹ đạo đi xuống Track 148). Không hiển thị ảnh giả lập.',
    'banner.switchAnGiangLink': 'Chuyển sang Cửa sổ An Giang đã xác thực (99,91% hợp lệ) →',
    'banner.catalogTitle': 'Chế độ Danh mục / AOI đang chờ xác thực:',
    'banner.catalogBody':
      'Đang hiển thị ranh giới hành chính và vết quét granule từ NASA CMR. Lớp phủ phát hiện biến động cấp điểm ảnh chỉ được bật khi tập con HDF5 vượt qua đủ 10 cổng kiểm tra tính tương thích.',
    'banner.loadAnGiangLink': 'Mở cặp so sánh An Giang đã xác thực →',
    'banner.syntheticBadge': 'DỮ LIỆU GIẢ LẬP KIỂM THỬ PHẦN MỀM — KHÔNG PHẢI DỮ LIỆU NISAR THẬT',
    'banner.syntheticBody':
      'Mẫu bàn cờ giả lập đang bật để kiểm thử thành phần giao diện. Tuyệt đối không trộn lẫn với dữ liệu quan sát NISAR thực tế.',
    'banner.basemapWarning':
      'Lớp nền bản đồ hiện chưa khả dụng. Ranh giới GeoJSON và lớp raster NISAR GCOV đã xác thực vẫn hoạt động bình thường.',

    // Map Legend
    'legend.aria': 'Chú giải bản đồ và tọa độ',
    'legend.mekong': 'Ranh giới ĐBSCL',
    'legend.angiang': 'AOI An Giang đã xác thực (99,91%)',
    'legend.dongthap': 'Ô thử nghiệm Đồng Tháp (0% ngoài dải quét)',
    'legend.footprints': 'Vết quét CMR Track 148 / Danh mục',
    'legend.radioAria': 'Chú giải bức xạ radar',
    'legend.backscatterPrefix': 'Tán xạ ngược HH γ⁰:',
    'legend.backscatterLow': '-25 dB (tối/mặt nước phẳng)',
    'legend.backscatterHigh': '0 dB (sáng/tán xạ kép double-bounce)',
    'legend.classesPrefix': 'Phân lớp:',
    'legend.classesStable': 'Ổn định ±3 dB (116,09 km²)',
    'legend.deltaPrefix': 'Δγ⁰ (03/11 − 22/10):',
    'legend.deltaDec': '-6 dB (Xanh: Giảm)',
    'legend.deltaZero': '0 dB (Trắng)',
    'legend.deltaInc': '+6 dB (Đỏ: Tăng)',
    'legend.cursorPrefix': 'Con trỏ:',
    'legend.cursorPrompt': 'Di chuyển chuột trên bản đồ để xem tọa độ',

    // Side Rail Navigation
    'rail.aria': 'Bảng điều khiển quan sát và phân tích khoa học',
    'rail.navAria': 'Các bước phân tích',
    'rail.tabAll': 'Tất cả',
    'rail.tabAoi': '01 AOI',
    'rail.tabCatalog': '02 Danh mục (29)',
    'rail.tabCompare': '03 So sánh',
    'rail.tabInterpret': '04 Diễn giải',
    'rail.tabGates': '05 Cổng kiểm tra',

    // Section 01: AOI & Evidence Ladder
    'sec1.eyebrow': 'KHÁM PHÁ & CHỌN VÙNG QUAN TÂM (AOI)',
    'sec1.title': 'Vùng quan tâm (AOI) & Tầng bằng chứng',
    'sec1.resetBtn': 'Đặt lại AOI',
    'sec1.resetBtnTitle': 'Đặt lại về cửa sổ An Giang đã xác thực',
    'sec1.presetLabel': 'Các cửa sổ kiểm chứng định sẵn',
    'sec1.provinceLabel': 'Tỉnh / Thành phố Đồng bằng sông Cửu Long (13 Tỉnh/Thành)',
    'sec1.provinceTagVerified': '— [Chứa cửa sổ xác thực 99,91% hợp lệ]',
    'sec1.provinceTagDiagnostic': '— [Chứa ô chẩn đoán 0% ngoài dải quét]',
    'sec1.provinceTagCatalog': '— [Khám phá danh mục]',
    'sec1.bboxLabel': 'Khung giới hạn tọa độ (WGS84)',
    'sec1.areaValidLabel': 'Diện tích cửa sổ / Điểm ảnh hợp lệ',
    'sec1.validSuffix': 'hợp lệ',
    'sec1.unverifiedSubset': 'Đang chờ xác thực',
    'sec1.ladderAria': 'Bốn cấp độ bằng chứng dữ liệu SAR',
    'sec1.ladderTitle': 'Phân biệt 4 tầng bằng chứng khoa học',

    // Section 02: NISAR Data Explorer
    'sec2.eyebrow': 'TRÌNH KHÁM PHÁ DỮ LIỆU NISAR',
    'sec2.titlePrefix': 'Danh mục NASA CMR',
    'sec2.titleSuffix': 'Granule',
    'sec2.filterMaturityAria': 'Lọc theo mức độ hoàn thiện bộ sưu tập',
    'sec2.filterAllCollections': 'Tất cả bộ sưu tập (29)',
    'sec2.filterValidated': 'Đã xác thực NISAR_L2_GCOV_V1 (11)',
    'sec2.filterProvisional': 'Tạm thời Provisional V1 (18)',
    'sec2.filterTrackAria': 'Lọc theo quỹ đạo tương đối (Track)',
    'sec2.filterAllTracks': 'Tất cả quỹ đạo (Track)',
    'sec2.filterTrack148': 'Track 148 (Quỹ đạo cặp ảnh mục tiêu)',
    'sec2.filterTrackPrefix': 'Track',
    'sec2.searchPlaceholder': 'Tìm mã granule, concept ID hoặc ngày (vd: 2026-10-22)…',
    'sec2.searchAria': 'Tìm kiếm granule',
    'sec2.intersectsCheckbox': 'Giao cắt AOI',
    'sec2.listAria': 'Danh sách các granule NISAR tìm thấy',
    'sec2.badgeValidated': 'ĐÃ XÁC THỰC V1',
    'sec2.badgeProvisional': 'PROVISIONAL',
    'sec2.metaTrack': 'Track',
    'sec2.metaFrame': 'Frame',
    'sec2.metaCycle': 'Chu kỳ',
    'sec2.intersectsYes': '✓ Giao cắt khung tọa độ AOI hiện tại',
    'sec2.intersectsNo': 'Nằm ngoài khung AOI hiện tại',
    'sec2.verifiedSubsetTag': '★ 99,91% Hợp lệ tại An Giang / 0% tại Đồng Tháp',
    'sec2.btnBeforeActive': '✓ Ngày TRƯỚC',
    'sec2.btnBeforeSet': 'Chọn làm TRƯỚC',
    'sec2.btnAfterActive': '✓ Ngày SAU',
    'sec2.btnAfterSet': 'Chọn làm SAU',

    // Section 03: Before-After Comparison & Change Visualization
    'sec3.eyebrow': 'SO SÁNH & TRỰC QUAN HÓA BIẾN ĐỘNG',
    'sec3.title': 'Tán xạ ngược Radar Trước–Sau',
    'sec3.tagPassed': 'Đạt 10/10 Cổng',
    'sec3.tagBlocked': 'Chưa khả dụng / Đã chặn',
    'sec3.beforeLabel': 'LẦN THU NHẬN TRƯỚC (BEFORE)',
    'sec3.beforeAria': 'Lần thu nhận dữ liệu trước',
    'sec3.beforeNoteVerified': 'TB γ⁰: -8,742 dB · Looks: 5,18 (lọc boxcar 5×5)',
    'sec3.afterLabel': 'LẦN THU NHẬN SAU (AFTER)',
    'sec3.afterAria': 'Lần thu nhận dữ liệu sau',
    'sec3.afterNoteVerified': 'TB γ⁰: -8,325 dB · Looks: 5,18 (lọc boxcar 5×5)',
    'sec3.catalogGranuleNote': 'Đã chọn lần thu nhận từ danh mục',
    'sec3.sliderBefore': 'Trước (22/10/2026)',
    'sec3.sliderSplit': 'Tỷ lệ trượt:',
    'sec3.sliderAfter': 'Sau (03/11/2026)',
    'sec3.sliderAria': 'Thanh trượt so sánh trước và sau',
    'sec3.layerGroupAria': 'Các lớp bản đồ',
    'sec3.layerSwipe': 'Trượt + ΔdB',
    'sec3.layerBefore': 'γ⁰ 22/10',
    'sec3.layerAfter': 'γ⁰ 03/11',
    'sec3.layerChangeDb': 'ΔdB liên tục',
    'sec3.layerClasses': 'Phân lớp ±3 dB',
    'sec3.layerMask': 'Mask hợp lệ',
    'sec3.statsAria': 'Thống kê biến động đã xác thực',
    'sec3.statsTitle': 'Biến động Tán xạ ngược HHHH hiệu chuẩn (Δγ⁰ = γ⁰_sau − γ⁰_trước)',
    'sec3.statsSubtitle':
      '120,77 km² vùng phủ hợp lệ chung (1.207.740 / 1.208.870 px = 99,91%) · Lọc nhiễu speckle boxcar 5×5',
    'sec3.statMeanDelta': 'TB Δγ⁰',
    'sec3.statMedianPrefix': 'Trung vị',
    'sec3.statPctRange': 'Phân vị 5% – 95%',
    'sec3.statTo': 'đến',
    'sec3.statStdPrefix': 'Độ lệch chuẩn',
    'sec3.statExcluded': 'Điểm ảnh loại trừ',
    'sec3.classDec': 'Giảm mạnh (Δγ⁰ ≤ −3,0 dB)',
    'sec3.classNeutral': 'Ổn định / Trong ngưỡng ±3,0 dB',
    'sec3.classInc': 'Tăng mạnh (Δγ⁰ ≥ +3,0 dB)',
    'sec3.blockedTitle': 'So sánh chưa khả dụng / Đã bị chặn bởi cổng kiểm tra tính tương thích',
    'sec3.restoreBtn': 'Tải cặp ảnh An Giang đã xác thực (2026-10-22 → 2026-11-03)',
    'sec3.fixtureToggle':
      'Xem trước mẫu giả lập kiểm thử phần mềm (chỉ dùng kiểm tra giao diện)',

    // Section 04: Scientific Interpretation
    'sec4.eyebrow': 'DIỄN GIẢI KHOA HỌC',
    'sec4.title': 'Hệ thống bằng chứng 3 cấp độ & Hỏi đáp (Q&A)',
    'sec4.level1Tag': 'CẤP ĐỘ 1 — BIẾN ĐỘNG TÍN HIỆU RADAR QUAN SÁT ĐƯỢC (ĐO TRỰC TIẾP)',
    'sec4.level1VerifiedBody':
      'Giữa ngày 2026-10-22 và 2026-11-03 (chu kỳ lặp 12 ngày trên quỹ đạo đi xuống Track 148, Frame 083), tán xạ ngược HH băng tần L hiệu chuẩn (γ⁰_HHHH sau lọc nhiễu speckle boxcar 5×5) trên vùng phủ hợp lệ chung 120,77 km² tại An Giang dịch chuyển từ mức trung bình -8,742 dB lên -8,325 dB (trung bình Δγ⁰ = +0,417 dB; trung bình điểm ảnh gốc trước lọc là -9,793 dB và -9,317 dB). 96,13% diện tích cửa sổ (116,09 km²) duy trì ổn định trong ngưỡng ±3,0 dB, trong khi 4,39 km² (3,63%) tăng ≥ +3,0 dB (tập trung tại các ô ruộng hình chữ nhật phía đông nam) và 0,29 km² (0,24%) giảm ≤ -3,0 dB.',
    'sec4.level1PendingPrefix':
      'Chưa báo cáo kết quả phát hiện biến động cấp điểm ảnh cho AOI/cặp ảnh đang chọn vì quá trình xác thực tính tương thích đang chờ hoặc bị chặn:',
    'sec4.level2Tag': 'CẤP ĐỘ 2 — CÁC CƠ CHẾ VẬT LÝ KHẢ DĨ (GIẢ THUYẾT)',
    'sec4.level2Item1Title': 'Tán xạ ngược giảm (≤ −3,0 dB, Màu xanh):',
    'sec4.level2Item1Body':
      'Phù hợp với hiện tượng tăng phản xạ gương (specular reflection) trên mặt nước tĩnh phẳng, ruộng mới dẫn nước, hoặc thu hoạch/dọn quang thực vật.',
    'sec4.level2Item2Title': 'Tán xạ ngược tăng (≥ +3,0 dB, Màu đỏ):',
    'sec4.level2Item2Body':
      'Phù hợp với cơ chế tán xạ kép (double-bounce scattering) băng tần L giữa mặt nước và thân lúa/thực vật ngập nước nhô lên, sự phát triển sinh khối, thay đổi độ ẩm/độ nhám đất, hoặc rút nước lộ bờ bao.',
    'sec4.level3Tag': 'CẤP ĐỘ 3 — KẾT LUẬN ĐƯỢC HỖ TRỢ & BẰNG CHỨNG BỔ TRỢ CÒN THIẾU',
    'sec4.level3SupportedTitle': 'Kết luận có cơ sở:',
    'sec4.level3SupportedBody':
      'Các dị thường bức xạ cục bộ tại những ô ruộng vùng Tri Tôn / Cô Tô (An Giang) là biến động tán xạ ngược băng tần L thực tế sau 12 ngày, đã được kiểm chứng trên lưới 10 m EPSG:32648 khớp tuyệt đối.',
    'sec4.level3NotSupportedTitle': 'Không kết luận đơn độc:',
    'sec4.level3NotSupportedBody':
      'Biến động tán xạ ngược đơn thuần KHÔNG tự chứng minh ngập lụt, hạn hán hay chuyển đổi mục đích sử dụng đất. Để khẳng định ngập mặt nước cần kết hợp chỉ số nước quang học cùng thời điểm (Sentinel-2 NDWI), phân cực chéo HVHV, số liệu trạm thủy văn và hiệu chỉnh địa hình DEM RTC quanh khu vực Núi Tô.',
    'sec4.qaAria': 'Hỏi đáp khoa học dựa trên bằng chứng',
    'sec4.qaTitle': 'Trình tra cứu Hỏi & Đáp (Q&A) khoa học dựa trên bằng chứng',
    'sec4.qaSourcePrefix': 'Nguồn gốc / Dẫn chứng:',
    'sec4.coordEyebrow': 'TỌA ĐỘ BẢN ĐỒ ĐÃ CHỌN',
    'sec4.coordInside':
      'Nằm trong Cửa sổ An Giang đã xác thực [104.95..105.05°E, 10.45..10.55°N] (lưới 10 m EPSG:32648)',
    'sec4.coordOutside': 'Nằm ngoài cửa sổ tập con raster An Giang đã xác thực',

    // Section 05: Compatibility Gates & Data Provenance
    'sec5.summaryTitle': '05 · 10 Cổng kiểm tra tính tương thích & Nguồn gốc dữ liệu',
    'sec5.statusVerified': 'ĐẠT 10/10 CỔNG · ĐÃ XÁC THỰC SHA-256',
    'sec5.statusPending': 'ĐANG KIỂM TRA CỔNG TƯƠNG THÍCH',
    'sec5.tableAria': '10 cổng kiểm tra tính tương thích khoa học',
    'sec5.colGate': 'Cổng kiểm tra tính tương thích',
    'sec5.colStatus': 'Trạng thái',
    'sec5.colEvidence': 'Bằng chứng ghi nhận',
    'sec5.badgePass': 'ĐẠT',
    'sec5.badgeBlocked': 'CHẶN',
    'sec5.dtBudget': 'Sổ cái hạn mức dung lượng HTTP Range',
    'sec5.budgetCap': 'Hạn mức dung lượng chung:',
    'sec5.budgetMask': 'Checkpoint Mask',
    'sec5.budgetBackscatter': 'Checkpoint Tán xạ ngược + Looks',
    'sec5.budgetCombined': 'Tổng dung lượng đã dùng:',
    'sec5.budgetRemaining': 'Còn lại:',
    'sec5.dtGrid': 'Lưới GCOV & Công thức đã xác thực',
    'sec5.gridVersion': 'Phiên bản',
    'sec5.gridLook': 'Nhìn trái (Left-looking)',
    'sec5.gridWindow': 'Dòng cửa sổ',
    'sec5.gridCols': 'cột',
    'sec5.gridFormula': 'Công thức:',
    'sec5.granuleCollection': 'Bộ sưu tập:',
    'sec5.granuleOrbit': 'Quỹ đạo',
    'sec5.dtChecksums': 'Mã băm kiểm toàn vẹn tệp đầu ra (SHA-256)',
    'sec5.sourceNote':
      'Nguồn dữ liệu: NASA CMR / ASF Earthdata Cloud (NISAR_L2_GCOV_V1). Đã hoàn tất Kiểm định Chất lượng Khoa học Độc lập (docs/FINAL_SCIENTIFIC_QA.md). Không lưu trữ hoặc làm lộ thông tin xác thực Earthdata, tệp netrc hay URL có chữ ký trên trình duyệt.',

    // Footer
    'footer.left':
      'Đội 4/K · NISAR ChangeLens · NASA Space Apps Challenge 2026 (Dancing with the SARs) · Không phải sản phẩm chính thức của NASA',
    'footer.right':
      'Dữ liệu: NASA/ISRO NISAR L2 GCOV V1 qua ASF DAAC · Nền bản đồ © Esri / OpenStreetMap · Ranh giới: geoBoundaries (CC BY 4.0)',

    // Mode Banner, Splitter & Primary Map Controls (UX Optimization)
    'mode.exploreBadge': 'CHẾ ĐỘ KHÁM PHÁ · TRỰC QUAN HÓA BIẾN ĐỘNG',
    'mode.exploreHint':
      'Khám phá trước: quan sát trực quan nơi tín hiệu phản xạ radar thay đổi theo thời gian bằng ngôn ngữ dễ hiểu.',
    'mode.researchBadge': 'NGHIÊN CỨU & CỔNG KIỂM TRA · BÀN LÀM VIỆC KHOA HỌC ĐẦY ĐỦ',
    'mode.researchHint':
      'Đầy đủ siêu dữ liệu SAR, 29 granule CMR, 10 cổng tương thích, chính sách CRID & kiểm chứng SHA-256.',
    'mode.switchToResearchBtn': 'Mở Bàn làm việc Nghiên cứu & 10 Cổng kiểm tra →',
    'mode.switchToExploreBtn': '← Quay lại Chế độ Khám phá đơn giản',
    'splitter.aria': 'Kéo thay đổi kích thước bản đồ và bảng phân tích',
    'splitter.tooltip': 'Kéo để chỉnh độ rộng Bản đồ / Bảng phân tích (Nhấp đúp để đặt lại)',
    'splitter.resetBtn': 'Đặt lại độ rộng',
    'splitter.resetTitle': 'Đặt lại bố cục bản đồ và bảng phân tích về kích thước mặc định',

    // Primary Map Layer Switcher (BEFORE | AFTER | CHANGE | SWIPE)
    'primaryLayer.label': 'Chế độ xem Bản đồ:',
    'primaryLayer.before': 'TRƯỚC (22/10)',
    'primaryLayer.after': 'SAU (03/11)',
    'primaryLayer.change': 'BẢN ĐỒ BIẾN ĐỘNG (ΔdB)',
    'primaryLayer.swipe': 'KÉO TRƯỢT TRƯỚC ↔ SAU',
    'primaryLayer.resetOpacity': 'Đặt lại (90%)',
    'primaryLayer.thresholdLabel': 'Kiểu hiển thị biến động:',
    'primaryLayer.cautionNote':
      'Màu sắc thể hiện mức độ thay đổi phản xạ radar (dB) giữa hai ngày quan sát. Chúng không tự xác định nguyên nhân biến động.',
    'primaryLayer.invalidSwatch': 'Điểm ảnh loại trừ / Không hợp lệ (0,09%)',

    // Explore Mode — Section 1: Location
    'explore.sec1.step': '1',
    'explore.sec1.eyebrow': 'VỊ TRÍ QUAN SÁT',
    'explore.sec1.title': 'Bạn đang khám phá khu vực nào?',
    'explore.sec1.locationLabel': 'Khu vực nghiên cứu / Vị trí',
    'explore.sec1.provinceLabel': 'Hoặc chọn nhanh Tỉnh / Thành phố ĐBSCL',
    'explore.sec1.coordsSummary': 'Xem tọa độ kỹ thuật & diện tích chi tiết',
    'explore.sec1.statusReady': '✓ Đã có Bản đồ Biến động Vệ tinh xác thực (99,91% diện tích hợp lệ)',
    'explore.sec1.statusOffSwath':
      '⚠ Ô chẩn đoán ngoài dải quét (0% điểm ảnh hợp lệ — tự động khóa so sánh)',
    'explore.sec1.statusCatalog':
      'ℹ Tổng quan Vùng / Tỉnh (Hãy chọn Cửa sổ An Giang để xem Bản đồ Biến động chi tiết)',

    // Explore Mode — Section 2: Time Comparison & Compatible Pair Discovery
    'explore.sec2.step': '2',
    'explore.sec2.eyebrow': 'SO SÁNH THỜI GIAN',
    'explore.sec2.title': 'Ngày quan sát & Độ tương thích',
    'explore.sec2.intervalBadge': 'ngày giữa hai lần quan sát',
    'explore.sec2.comparableBadge': '✓ Cặp quan sát tương thích khoa học (Đã xác thực Cấp 3)',
    'explore.sec2.geometricBadge': '◐ Tương thích hình học quỹ đạo (Cấp 2 — Mới có trên danh mục)',
    'explore.sec2.incompatibleBadge': '✕ Không thể so sánh trực tiếp (Cấp 1)',
    'explore.sec2.autoOrderedNotice':
      'Hệ thống đã tự động sắp xếp ngày theo đúng thứ tự thời gian (Trước → Sau) để Biến động = Sau − Trước.',
    'explore.sec2.swapOrderBtn': 'Tự động đảo lại đúng thứ tự thời gian (Trước → Sau)',
    'explore.sec2.pairFinderTitle': 'Bộ Tìm Kiếm Cặp Quan Sát Tương Thích',
    'explore.sec2.pairFinderSubtitle':
      'Tự động gom nhóm từ 29 granule NASA CMR theo cùng quỹ đạo Track, Frame & góc nhìn radar:',
    'explore.sec2.level3Heading': 'Cấp 3 — Cặp ảnh đã xác thực Raster (Sẵn sàng hiển thị)',
    'explore.sec2.level2Heading':
      'Cấp 2 — Các cặp lặp lại tương thích hình học quỹ đạo (Đã kiểm tra siêu dữ liệu danh mục)',
    'explore.sec2.selectPairBtn': 'Chọn cặp này',
    'explore.sec2.activePairTag': 'Đang chọn',
    'explore.sec2.whyBlockedBtn': 'Vì sao chưa thể so sánh hai ảnh này?',
    'explore.sec2.cridPolicyTitle': 'Chính sách tương thích phiên bản xử lý CRID',
    'explore.sec2.cridPolicyBody':
      'So sánh hai ảnh SAR đòi hỏi phần mềm hiệu chuẩn đồng nhất. Các cặp cùng mã CRID P05036 (v1.0.20) đã xác thực sẽ vượt qua Cổng 7 trực tiếp. Các cặp lặp lại cùng mã CRID P05023 có phần mềm nội bộ đồng nhất nhưng thuộc bản Provisional, còn các cặp khác CRID (P05023 → P05036) cần kiểm tra độ lệch hiệu chuẩn bức xạ trước khi trừ điểm ảnh.',

    // Explore Mode — Section 3: What Changed?
    'explore.sec3.step': '3',
    'explore.sec3.eyebrow': 'ĐIỀU GÌ ĐÃ THAY ĐỔI?',
    'explore.sec3.title': 'Tóm tắt biến động bề mặt qua Radar',
    'explore.sec3.leadText':
      'Một số khu vực có tín hiệu phản xạ radar mạnh hơn, trong khi một số nơi khác phản xạ yếu hơn so với lần quan sát trước vào ngày 22/10/2026.',
    'explore.sec3.cardDecTitle': 'Phản xạ Radar yếu đi (Giảm)',
    'explore.sec3.cardDecDesc':
      'Vùng màu xanh phản xạ ít năng lượng radar hơn so với ngày 22/10 (thường gặp khi bề mặt ướt phẳng lặng, đọng nước mặt hoặc sau thu hoạch).',
    'explore.sec3.cardStableTitle': 'Bề mặt tương đối ổn định',
    'explore.sec3.cardStableDesc':
      'Vùng trung tính thay đổi ít hơn ngưỡng đang chọn giữa ngày 22/10 và 03/11 (chiếm 96,13% diện tích ở ngưỡng chuẩn ±3,0 dB).',
    'explore.sec3.cardIncTitle': 'Phản xạ Radar mạnh lên (Tăng)',
    'explore.sec3.cardIncDesc':
      'Vùng màu đỏ/cam phản xạ nhiều năng lượng radar hơn so với ngày 22/10 (tập trung ở các ô ruộng phía đông nam; phù hợp với phản xạ kép mặt nước–thân cây, lúa phát triển hoặc mặt đất gồ ghề hơn).',
    'explore.sec3.cautionBoxTitle': 'Ý nghĩa màu sắc (Lưu ý khoa học quan trọng)',
    'explore.sec3.cautionBoxBody':
      'Màu sắc biểu thị độ thay đổi tán xạ ngược radar băng tần L (Δγ⁰ tính bằng dB). Bản đồ biến động phản xạ radar KHÔNG đồng nghĩa với bản đồ ngập lụt trực tiếp: phản xạ tăng không phải lúc nào cũng là ngập, và phản xạ giảm không phải lúc nào cũng là cạn nước.',

    // Explore Mode — Section 4: Explore More (Progressive Disclosure)
    'explore.sec4.step': '4',
    'explore.sec4.eyebrow': 'KHÁM PHÁ THÊM',
    'explore.sec4.title': 'Chi tiết tùy chọn & Bối cảnh khoa học',
    'explore.sec4.accStats': 'Thống kê biến động & Bảng số liệu chi tiết',
    'explore.sec4.accObs': 'Thông tin đợt chụp vệ tinh (22/10 & 03/11)',
    'explore.sec4.accQuality': 'Chất lượng dữ liệu, Độ phủ hợp lệ & Lọc nhiễu Speckle',
    'explore.sec4.accInterpret': 'Diễn giải khoa học & Câu hỏi thường gặp (Q&A)',
    'explore.sec4.qualityBody':
      '99,91% diện tích cửa sổ An Giang (1.207.740 / 1.208.870 điểm ảnh = 120,77 km²) có giá trị đo radar hợp lệ ở cả hai ngày. 1.130 điểm ảnh rìa (0,09%) được loại trừ hoàn toàn để không làm nhiễu các điểm ảnh lân cận trong quá trình lọc trung bình không gian 5×5.',
  },
};

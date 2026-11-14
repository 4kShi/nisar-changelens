import { useCallback, useMemo, useState } from 'react';
import { MapStage, type MapState } from './components/MapStage';
import {
  ACQUISITIONS,
  EVIDENCE_TIERS,
  MEKONG_PROVINCES,
  PROVENANCE,
  SCIENTIFIC_QA_ITEMS,
  STUDY_AREAS,
  VERIFIED_ANGIANG_PAIR_STATS,
  bboxesIntersect,
  estimateBboxAreaKm2,
  evaluatePairCompatibility,
  type OverlayLayerId,
  type StudyAreaId,
  type StudyAreaPreset,
} from './data/study';
import { DISCOVERED_GRANULES } from './data/catalogInventory';
import { I18nProvider, useI18n } from './i18n/I18nContext';
import type { Language } from './i18n/translations';

type ViewMode = 'explore' | 'research';
type RailSectionFilter = 'all' | 'aoi' | 'catalog' | 'compare' | 'interpret' | 'provenance';

export function App({ initialLanguage }: { initialLanguage?: Language } = {}) {
  return (
    <I18nProvider initialLanguage={initialLanguage}>
      <AppWorkbench />
    </I18nProvider>
  );
}

function AppWorkbench() {
  const { lang, setLang, t, pick } = useI18n();

  // Default to the verified An Giang window so users immediately see the working NISAR GCOV MVP
  const [area, setArea] = useState<StudyAreaId>('angiang-screening');
  const [selectedProvince, setSelectedProvince] = useState<string>('An Giang');
  const [customBbox, setCustomBbox] = useState<[number, number, number, number]>([
    105.2, 10.0, 105.3, 10.1,
  ]);
  const [customClickMode, setCustomClickMode] = useState<boolean>(false);
  const [showFootprints, setShowFootprints] = useState<boolean>(true);

  // Catalog filter state
  const [collectionFilter, setCollectionFilter] = useState<'ALL' | 'VALIDATED' | 'PROVISIONAL'>(
    'ALL'
  );
  const [trackFilter, setTrackFilter] = useState<number | 'ALL'>('ALL');
  const [intersectOnly, setIntersectOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected pair for comparison (defaults to verified Oct 22 & Nov 03 pair)
  const [beforeConceptId, setBeforeConceptId] = useState<string>('G4404304390-ASF');
  const [afterConceptId, setAfterConceptId] = useState<string>('G4410154671-ASF');

  // Map overlay & comparison controls
  const [overlayLayer, setOverlayLayer] = useState<OverlayLayerId>('swipe_before_after');
  const [overlayOpacity, setOverlayOpacity] = useState<number>(0.9);
  const [swipePercent, setSwipePercent] = useState<number>(50);
  const [showSyntheticFixture, setShowSyntheticFixture] = useState<boolean>(false);

  // Navigation & UI state
  const [mode, setMode] = useState<ViewMode>('explore');
  const [sectionFilter, setSectionFilter] = useState<RailSectionFilter>('all');
  const [activeQaId, setActiveQaId] = useState<string>(SCIENTIFIC_QA_ITEMS[0].id);
  const [mapState, setMapState] = useState<MapState>('loading');
  const [location, setLocation] = useState<{ longitude: number; latitude: number } | null>(null);

  const activeArea: StudyAreaPreset = useMemo(() => {
    if (area === 'custom-aoi') {
      const coords = customBbox.map((n) => n.toFixed(2)).join(', ');
      return {
        id: 'custom-aoi' as StudyAreaId,
        label: `Custom AOI Window [${coords}]`,
        label_vi: `Cửa sổ AOI tùy chỉnh [${coords}]`,
        shortLabel: 'Custom AOI',
        shortLabel_vi: 'AOI tùy chỉnh',
        province: selectedProvince,
        bbox: customBbox,
        areaKm2: estimateBboxAreaKm2(customBbox),
        evidenceTier: 'TIER_2_FOOTPRINT' as const,
        evidenceBadge: 'TIER 2 — FOOTPRINT INTERSECTION ONLY (RASTER SUBSET PENDING VALIDATION)',
        evidenceBadge_vi:
          'TẦNG 2 — CHỈ GIAO CẮT VẾT QUÉT (TẬP CON RASTER ĐANG CHỜ XÁC THỰC)',
        comparisonAvailable: false,
        validCoveragePct: null,
        commonValidPixels: null,
        totalPixels: null,
        description:
          'User-defined geographic bounding box in the Mekong Delta. Catalog footprint overlap is computed live; pixel-level comparison requires running the bounded HDF5 mask & backscatter extractor.',
        description_vi:
          'Khung giới hạn địa lý do người dùng chọn tại Đồng bằng sông Cửu Long. Độ chồng phủ vết quét danh mục được tính trực tiếp; so sánh cấp điểm ảnh cần chạy bộ trích xuất mask & tán xạ ngược HDF5 có giới hạn.',
        scientificSummary:
          'Custom window pending validation. No synthetic or unverified raster is shown as scientific output.',
        scientificSummary_vi:
          'Cửa sổ tùy chỉnh đang chờ xác thực. Không hiển thị ảnh giả lập hoặc chưa kiểm chứng làm kết quả khoa học.',
      };
    }
    return STUDY_AREAS.find((option) => option.id === area) ?? STUDY_AREAS[0];
  }, [area, customBbox, selectedProvince]);

  const compatibility = useMemo(
    () => evaluatePairCompatibility(beforeConceptId, afterConceptId, area),
    [beforeConceptId, afterConceptId, area]
  );

  const filteredGranules = useMemo(() => {
    return DISCOVERED_GRANULES.filter((g) => {
      if (collectionFilter === 'VALIDATED' && g.collection !== 'NISAR_L2_GCOV_V1') return false;
      if (
        collectionFilter === 'PROVISIONAL' &&
        g.collection !== 'NISAR_L2_GCOV_PROVISIONAL_V1'
      ) {
        return false;
      }
      if (trackFilter !== 'ALL' && g.track !== trackFilter) return false;
      if (intersectOnly && !bboxesIntersect(g.footprintBbox, activeArea.bbox)) return false;
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.trim().toLowerCase();
        const match =
          g.granuleId.toLowerCase().includes(q) ||
          g.conceptId.toLowerCase().includes(q) ||
          g.startUtc.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [collectionFilter, trackFilter, intersectOnly, activeArea.bbox, searchQuery]);

  const onMapStateChange = useCallback((state: MapState) => setMapState(state), []);
  const onLocationSelect = useCallback(
    (value: { longitude: number; latitude: number } | null) => setLocation(value),
    []
  );

  const handleAreaChange = useCallback((newArea: StudyAreaId) => {
    setArea(newArea);
    setCustomClickMode(false);
    if (newArea === 'angiang-screening') {
      setSelectedProvince('An Giang');
    } else if (newArea === 'dongthap-pilot') {
      setSelectedProvince('Đồng Tháp');
    }
  }, []);

  const handleProvinceChange = useCallback((provName: string) => {
    setSelectedProvince(provName);
    const found = MEKONG_PROVINCES.find((p) => p.name === provName);
    if (found?.verifiedSubwindowId) {
      setArea(found.verifiedSubwindowId);
    } else if (found) {
      setCustomBbox(found.bbox);
      setArea('custom-aoi');
    }
  }, []);

  const handleCustomBboxSelect = useCallback((newBbox: [number, number, number, number]) => {
    setCustomBbox(newBbox);
    setArea('custom-aoi');
    setCustomClickMode(false);
  }, []);

  const handleResetSelection = useCallback(() => {
    setArea('angiang-screening');
    setSelectedProvince('An Giang');
    setBeforeConceptId('G4404304390-ASF');
    setAfterConceptId('G4410154671-ASF');
    setOverlayLayer('swipe_before_after');
    setOverlayOpacity(0.9);
    setSwipePercent(50);
    setCustomClickMode(false);
    setLocation(null);
    setShowSyntheticFixture(false);
  }, []);

  const activeQa =
    SCIENTIFIC_QA_ITEMS.find((item) => item.id === activeQaId) ?? SCIENTIFIC_QA_ITEMS[0];

  const showSection = (sec: RailSectionFilter) =>
    sectionFilter === 'all' || sectionFilter === sec;

  return (
    <div className="app-shell" data-lang={lang}>
      <header className="topbar">
        <a className="brand" href="#top" aria-label={t('brand.homeAria')}>
          <span className="brand-mark" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className="brand-copy">
            <strong>
              NISAR <em>ChangeLens</em>
            </strong>
            <small>{t('brand.tagline')}</small>
          </span>
        </a>

        <div className="topbar-center">
          <span className="challenge-label">{t('header.challengeLabel')}</span>
          <span className="challenge-name">{t('header.challengeName')}</span>
        </div>

        <div className="topbar-actions">
          <span
            className={`status-chip ${
              compatibility.allPassed ? 'status-verified' : 'status-pending'
            }`}
          >
            <i />
            {compatibility.allPassed ? t('header.statusVerified') : t('header.statusPending')}
          </span>

          <div
            className="lang-switch"
            role="group"
            aria-label={t('header.langSwitchAria')}
          >
            <button
              type="button"
              className={lang === 'en' ? 'selected' : ''}
              aria-pressed={lang === 'en'}
              title={t('header.langEnTitle')}
              onClick={() => setLang('en')}
              data-testid="lang-btn-en"
            >
              {t('header.langEn')}
            </button>
            <button
              type="button"
              className={lang === 'vi' ? 'selected' : ''}
              aria-pressed={lang === 'vi'}
              title={t('header.langViTitle')}
              onClick={() => setLang('vi')}
              data-testid="lang-btn-vi"
            >
              {t('header.langVi')}
            </button>
          </div>

          <div className="view-switch" role="group" aria-label={t('header.viewModeAria')}>
            <button
              type="button"
              className={mode === 'explore' ? 'selected' : ''}
              onClick={() => setMode('explore')}
            >
              {t('header.modeExplore')}
            </button>
            <button
              type="button"
              className={mode === 'research' ? 'selected' : ''}
              onClick={() => setMode('research')}
            >
              {t('header.modeResearch')}
            </button>
          </div>
        </div>
      </header>

      <main className="workspace" id="top">
        <section className="map-column" aria-label={t('map.workspaceAria')}>
          <div className="map-toolbar">
            <div>
              <span className="eyebrow">
                {pick(activeArea.evidenceBadge, activeArea.evidenceBadge_vi)}
              </span>
              <h1>{pick(activeArea.label, activeArea.label_vi)}</h1>
              <p>{pick(activeArea.description, activeArea.description_vi)}</p>
            </div>
            <div className={`map-status map-status-${mapState}`} role="status">
              <span className="status-dot" />
              {mapState === 'loading' && t('map.statusLoading')}
              {mapState === 'ready' && t('map.statusReady')}
              {mapState === 'boundary-error' && t('map.statusBoundaryError')}
              {mapState === 'map-error' && t('map.statusMapError')}
            </div>
          </div>

          <MapStage
            area={area}
            selectedProvince={selectedProvince}
            customBbox={customBbox}
            customClickMode={customClickMode}
            showFootprints={showFootprints}
            highlightedConceptIds={[beforeConceptId, afterConceptId]}
            overlayLayer={overlayLayer}
            overlayOpacity={overlayOpacity}
            swipePercent={swipePercent}
            showSyntheticFixture={showSyntheticFixture}
            onMapStateChange={onMapStateChange}
            onLocationSelect={onLocationSelect}
            onProvinceSelect={handleProvinceChange}
            onCustomBboxSelect={handleCustomBboxSelect}
            onAreaSelect={handleAreaChange}
            onOverlayLayerChange={setOverlayLayer}
            onOverlayOpacityChange={setOverlayOpacity}
            onSwipePercentChange={setSwipePercent}
            onToggleFootprints={() => setShowFootprints((v) => !v)}
            onToggleCustomClickMode={() => setCustomClickMode((v) => !v)}
            onResetSelection={handleResetSelection}
          />

          <div className="map-caption">
            <span>
              <b>{t('map.activeEvidencePrefix')}</b>{' '}
              {pick(activeArea.scientificSummary, activeArea.scientificSummary_vi)}
            </span>
            <span>
              {location
                ? `${t('map.selectedPointPrefix')} ${location.latitude.toFixed(5)}°N, ${location.longitude.toFixed(5)}°E`
                : t('map.clickPrompt')}
            </span>
          </div>
        </section>

        <aside className="side-rail" aria-label={t('rail.aria')}>
          {/* Quick Step Navigation Bar */}
          <nav className="rail-nav" aria-label={t('rail.navAria')}>
            {(
              [
                ['all', t('rail.tabAll')],
                ['aoi', t('rail.tabAoi')],
                ['catalog', t('rail.tabCatalog')],
                ['compare', t('rail.tabCompare')],
                ['interpret', t('rail.tabInterpret')],
                ['provenance', t('rail.tabGates')],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={`rail-nav-btn ${sectionFilter === id ? 'active' : ''}`}
                onClick={() => setSectionFilter(id)}
              >
                {label}
              </button>
            ))}
          </nav>

          {/* SECTION 01: AOI SELECTION & 4-TIER EVIDENCE LADDER */}
          {showSection('aoi') && (
            <section className="rail-section area-section">
              <div className="section-heading">
                <span className="step-index">01</span>
                <div>
                  <span className="eyebrow">{t('sec1.eyebrow')}</span>
                  <h2>{t('sec1.title')}</h2>
                </div>
                <button
                  type="button"
                  className="mini-reset-btn"
                  onClick={handleResetSelection}
                  title={t('sec1.resetBtnTitle')}
                >
                  {t('sec1.resetBtn')}
                </button>
              </div>

              <label className="field-label" htmlFor="area-select">
                {t('sec1.presetLabel')}
              </label>
              <select
                id="area-select"
                value={area}
                onChange={(event) => handleAreaChange(event.target.value as StudyAreaId)}
              >
                {STUDY_AREAS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {pick(option.label, option.label_vi)}
                  </option>
                ))}
                {area === 'custom-aoi' && (
                  <option value="custom-aoi">
                    {pick(activeArea.label, activeArea.label_vi)}
                  </option>
                )}
              </select>

              <label className="field-label" htmlFor="province-select">
                {t('sec1.provinceLabel')}
              </label>
              <select
                id="province-select"
                value={selectedProvince}
                onChange={(event) => handleProvinceChange(event.target.value)}
              >
                {MEKONG_PROVINCES.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name}{' '}
                    {p.verifiedSubwindowId === 'angiang-screening'
                      ? t('sec1.provinceTagVerified')
                      : p.verifiedSubwindowId === 'dongthap-pilot'
                        ? t('sec1.provinceTagDiagnostic')
                        : t('sec1.provinceTagCatalog')}
                  </option>
                ))}
              </select>

              <div className="aoi-metrics-grid">
                <div className="metric-box">
                  <span className="metric-label">{t('sec1.bboxLabel')}</span>
                  <strong>
                    [{activeArea.bbox[0].toFixed(2)}°E, {activeArea.bbox[1].toFixed(2)}°N,{' '}
                    {activeArea.bbox[2].toFixed(2)}°E, {activeArea.bbox[3].toFixed(2)}°N]
                  </strong>
                </div>
                <div className="metric-box">
                  <span className="metric-label">{t('sec1.areaValidLabel')}</span>
                  <strong>
                    {activeArea.areaKm2.toLocaleString()} km² ·{' '}
                    {activeArea.validCoveragePct !== null
                      ? `${activeArea.validCoveragePct.toFixed(2)}% ${t('sec1.validSuffix')}`
                      : t('sec1.unverifiedSubset')}
                  </strong>
                </div>
              </div>

              <div className="evidence-ladder" aria-label={t('sec1.ladderAria')}>
                <span className="field-label">{t('sec1.ladderTitle')}</span>
                {EVIDENCE_TIERS.map((tier) => {
                  const isCurrent = activeArea.evidenceTier === tier.id;
                  const isPassed =
                    (activeArea.evidenceTier === 'TIER_4_COMPARABLE' && tier.level <= 4) ||
                    (activeArea.evidenceTier === 'TIER_2_FOOTPRINT' && tier.level <= 2) ||
                    (activeArea.evidenceTier === 'TIER_1_CATALOG' && tier.level === 1);
                  return (
                    <div
                      key={tier.id}
                      className={`tier-row ${isCurrent ? 'tier-current' : ''} ${
                        isPassed ? 'tier-passed' : 'tier-unreached'
                      }`}
                    >
                      <span className="tier-dot">{isPassed ? '✓' : tier.level}</span>
                      <div>
                        <strong>{pick(tier.title, tier.title_vi)}</strong>{' '}
                        <small>({pick(tier.subtitle, tier.subtitle_vi)})</small>
                        {isCurrent && <p>{pick(tier.description, tier.description_vi)}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* SECTION 02: NISAR DATA EXPLORER (29 REAL CMR GRANULES) */}
          {showSection('catalog') && (
            <section className="rail-section observe-section">
              <div className="section-heading">
                <span className="step-index">02</span>
                <div>
                  <span className="eyebrow">{t('sec2.eyebrow')}</span>
                  <h2>
                    {t('sec2.titlePrefix')} ({filteredGranules.length} / 29{' '}
                    {t('sec2.titleSuffix')})
                  </h2>
                </div>
              </div>

              <div className="catalog-filters">
                <div className="filter-row">
                  <select
                    aria-label={t('sec2.filterMaturityAria')}
                    value={collectionFilter}
                    onChange={(e) =>
                      setCollectionFilter(
                        e.target.value as 'ALL' | 'VALIDATED' | 'PROVISIONAL'
                      )
                    }
                  >
                    <option value="ALL">{t('sec2.filterAllCollections')}</option>
                    <option value="VALIDATED">{t('sec2.filterValidated')}</option>
                    <option value="PROVISIONAL">{t('sec2.filterProvisional')}</option>
                  </select>

                  <select
                    aria-label={t('sec2.filterTrackAria')}
                    value={trackFilter}
                    onChange={(e) =>
                      setTrackFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))
                    }
                  >
                    <option value="ALL">{t('sec2.filterAllTracks')}</option>
                    <option value={148}>{t('sec2.filterTrack148')}</option>
                    <option value={75}>{t('sec2.filterTrackPrefix')} 075</option>
                    <option value={2}>{t('sec2.filterTrackPrefix')} 002</option>
                    <option value={155}>{t('sec2.filterTrackPrefix')} 155</option>
                    <option value={82}>{t('sec2.filterTrackPrefix')} 082</option>
                    <option value={9}>{t('sec2.filterTrackPrefix')} 009</option>
                  </select>
                </div>

                <div className="filter-row">
                  <input
                    type="search"
                    placeholder={t('sec2.searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label={t('sec2.searchAria')}
                  />
                  <label className="checkbox-inline">
                    <input
                      type="checkbox"
                      checked={intersectOnly}
                      onChange={(e) => setIntersectOnly(e.target.checked)}
                    />
                    {t('sec2.intersectsCheckbox')}
                  </label>
                </div>
              </div>

              <div className="granule-list" role="list" aria-label={t('sec2.listAria')}>
                {filteredGranules.map((g) => {
                  const isBefore = g.conceptId === beforeConceptId;
                  const isAfter = g.conceptId === afterConceptId;
                  const isVerifiedCandidate =
                    g.conceptId === 'G4404304390-ASF' || g.conceptId === 'G4410154671-ASF';
                  const intersectsActive = bboxesIntersect(g.footprintBbox, activeArea.bbox);

                  return (
                    <article
                      key={g.conceptId}
                      className={`granule-card ${
                        isBefore || isAfter ? 'granule-selected' : ''
                      }`}
                      role="listitem"
                    >
                      <div className="granule-card-top">
                        <strong>{g.date}</strong>
                        <span className="granule-time">
                          {g.startUtc.slice(11, 19)} UTC
                        </span>
                        <span
                          className={`maturity-pill ${
                            g.maturity === 'VALIDATED' ? 'mat-valid' : 'mat-prov'
                          }`}
                        >
                          {g.collection === 'NISAR_L2_GCOV_V1'
                            ? t('sec2.badgeValidated')
                            : t('sec2.badgeProvisional')}
                        </span>
                      </div>

                      <div className="granule-meta-line">
                        <span>
                          <b>{g.conceptId}</b>
                        </span>
                        <span>
                          {t('sec2.metaTrack')} <b>{g.track}</b> / {t('sec2.metaFrame')}{' '}
                          <b>{g.frame}</b>
                        </span>
                        <span>{g.direction}</span>
                        <span>CRID {g.crid}</span>
                        <span>
                          {t('sec2.metaCycle')} {g.cycle}
                        </span>
                      </div>

                      <code className="granule-ur">{g.granuleId}</code>

                      <div className="granule-status-row">
                        <span className="footprint-tag">
                          {intersectsActive ? t('sec2.intersectsYes') : t('sec2.intersectsNo')}
                        </span>
                        {isVerifiedCandidate && (
                          <span className="verified-subset-tag">
                            {t('sec2.verifiedSubsetTag')}
                          </span>
                        )}
                      </div>

                      <div className="granule-actions">
                        <button
                          type="button"
                          className={`assign-btn ${isBefore ? 'active-before' : ''}`}
                          onClick={() => setBeforeConceptId(g.conceptId)}
                        >
                          {isBefore ? t('sec2.btnBeforeActive') : t('sec2.btnBeforeSet')}
                        </button>
                        <button
                          type="button"
                          className={`assign-btn ${isAfter ? 'active-after' : ''}`}
                          onClick={() => setAfterConceptId(g.conceptId)}
                        >
                          {isAfter ? t('sec2.btnAfterActive') : t('sec2.btnAfterSet')}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          {/* SECTION 03: BEFORE–AFTER COMPARISON & CHANGE VISUALIZATION */}
          {showSection('compare') && (
            <section className="rail-section compare-section">
              <div className="section-heading">
                <span className="step-index">03</span>
                <div>
                  <span className="eyebrow">{t('sec3.eyebrow')}</span>
                  <h2>{t('sec3.title')}</h2>
                </div>
                <span
                  className={`soon-tag ${
                    compatibility.allPassed ? 'tag-enabled' : 'tag-blocked'
                  }`}
                >
                  {compatibility.allPassed ? t('sec3.tagPassed') : t('sec3.tagBlocked')}
                </span>
              </div>

              <div className="date-pair">
                <label className="date-card">
                  <span className="date-label">{t('sec3.beforeLabel')}</span>
                  <select
                    aria-label={t('sec3.beforeAria')}
                    value={beforeConceptId}
                    onChange={(e) => setBeforeConceptId(e.target.value)}
                  >
                    {DISCOVERED_GRANULES.map((g) => (
                      <option key={g.conceptId} value={g.conceptId}>
                        {g.date} · T{g.track}/F{g.frame} ({g.conceptId})
                      </option>
                    ))}
                  </select>
                  <small>
                    {beforeConceptId === 'G4404304390-ASF'
                      ? t('sec3.beforeNoteVerified')
                      : t('sec3.catalogGranuleNote')}
                  </small>
                </label>
                <span className="date-arrow" aria-hidden="true">
                  →
                </span>
                <label className="date-card after-card">
                  <span className="date-label">{t('sec3.afterLabel')}</span>
                  <select
                    aria-label={t('sec3.afterAria')}
                    value={afterConceptId}
                    onChange={(e) => setAfterConceptId(e.target.value)}
                  >
                    {DISCOVERED_GRANULES.map((g) => (
                      <option key={g.conceptId} value={g.conceptId}>
                        {g.date} · T{g.track}/F{g.frame} ({g.conceptId})
                      </option>
                    ))}
                  </select>
                  <small>
                    {afterConceptId === 'G4410154671-ASF'
                      ? t('sec3.afterNoteVerified')
                      : t('sec3.catalogGranuleNote')}
                  </small>
                </label>
              </div>

              {compatibility.allPassed ? (
                <>
                  <div className="active-comparison-controls">
                    <div className="slider-label">
                      <span>{t('sec3.sliderBefore')}</span>
                      <span>
                        {t('sec3.sliderSplit')} {swipePercent}%
                      </span>
                      <span>{t('sec3.sliderAfter')}</span>
                    </div>
                    <input
                      aria-label={t('sec3.sliderAria')}
                      type="range"
                      min={0}
                      max={100}
                      value={swipePercent}
                      onChange={(e) => {
                        setOverlayLayer('swipe_before_after');
                        setSwipePercent(Number(e.target.value));
                      }}
                    />

                    <div
                      className="layer-buttons"
                      role="group"
                      aria-label={t('sec3.layerGroupAria')}
                    >
                      {(
                        [
                          ['swipe_before_after', t('sec3.layerSwipe')],
                          ['before_db', t('sec3.layerBefore')],
                          ['after_db', t('sec3.layerAfter')],
                          ['change_db', t('sec3.layerChangeDb')],
                          ['change_classes', t('sec3.layerClasses')],
                          ['mask_common_valid', t('sec3.layerMask')],
                        ] as const
                      ).map(([id, label]) => (
                        <button
                          key={id}
                          type="button"
                          className={overlayLayer === id ? 'selected' : ''}
                          onClick={() => setOverlayLayer(id)}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quantitative Statistics Card for Verified An Giang Pair */}
                  <div className="stats-summary-card" aria-label={t('sec3.statsAria')}>
                    <div className="stats-header">
                      <strong>{t('sec3.statsTitle')}</strong>
                      <span>{t('sec3.statsSubtitle')}</span>
                    </div>

                    <div className="stats-grid-3">
                      <div className="stat-cell">
                        <small>{t('sec3.statMeanDelta')}</small>
                        <strong>+{VERIFIED_ANGIANG_PAIR_STATS.deltaDb.mean.toFixed(3)} dB</strong>
                        <span>
                          {t('sec3.statMedianPrefix')} +
                          {VERIFIED_ANGIANG_PAIR_STATS.deltaDb.median.toFixed(2)} dB
                        </span>
                      </div>
                      <div className="stat-cell">
                        <small>{t('sec3.statPctRange')}</small>
                        <strong>
                          {VERIFIED_ANGIANG_PAIR_STATS.deltaDb.p05.toFixed(2)} {t('sec3.statTo')} +
                          {VERIFIED_ANGIANG_PAIR_STATS.deltaDb.p95.toFixed(2)} dB
                        </strong>
                        <span>
                          {t('sec3.statStdPrefix')}{' '}
                          {VERIFIED_ANGIANG_PAIR_STATS.deltaDb.std.toFixed(2)} dB
                        </span>
                      </div>
                      <div className="stat-cell">
                        <small>{t('sec3.statExcluded')}</small>
                        <strong>1,130 px (0.09%)</strong>
                        <span>1,084 Oct 22 / 1,090 Nov 03</span>
                      </div>
                    </div>

                    <div className="class-breakdown">
                      <div className="class-row dec">
                        <span>{t('sec3.classDec')}</span>
                        <strong>
                          {VERIFIED_ANGIANG_PAIR_STATS.areasKm2.decreaseArea} km² (
                          {VERIFIED_ANGIANG_PAIR_STATS.classes.decreasePixels.toLocaleString()} px ·{' '}
                          {VERIFIED_ANGIANG_PAIR_STATS.classes.decreasePct}%)
                        </strong>
                      </div>
                      <div className="class-row neutral">
                        <span>{t('sec3.classNeutral')}</span>
                        <strong>
                          {VERIFIED_ANGIANG_PAIR_STATS.areasKm2.noSignificantChangeArea} km² (
                          {VERIFIED_ANGIANG_PAIR_STATS.classes.noSignificantChangePixels.toLocaleString()}{' '}
                          px · {VERIFIED_ANGIANG_PAIR_STATS.classes.noSignificantChangePct}%)
                        </strong>
                      </div>
                      <div className="class-row inc">
                        <span>{t('sec3.classInc')}</span>
                        <strong>
                          {VERIFIED_ANGIANG_PAIR_STATS.areasKm2.increaseArea} km² (
                          {VERIFIED_ANGIANG_PAIR_STATS.classes.increasePixels.toLocaleString()} px ·{' '}
                          {VERIFIED_ANGIANG_PAIR_STATS.classes.increasePct}%)
                        </strong>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="empty-state" role="status">
                  <strong>{t('sec3.blockedTitle')}</strong>
                  <p>{pick(compatibility.summaryReason, compatibility.summaryReason_vi)}</p>
                  <div className="blocked-actions">
                    <button
                      type="button"
                      className="primary-restore-btn"
                      onClick={handleResetSelection}
                    >
                      {t('sec3.restoreBtn')}
                    </button>
                    <label className="fixture-toggle">
                      <input
                        type="checkbox"
                        checked={showSyntheticFixture}
                        onChange={(e) => setShowSyntheticFixture(e.target.checked)}
                      />
                      {t('sec3.fixtureToggle')}
                    </label>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* SECTION 04: AI-ASSISTED / EVIDENCE-BASED SCIENTIFIC INTERPRETATION */}
          {showSection('interpret') && (
            <section className="rail-section understand-section">
              <div className="section-heading">
                <span className="step-index">04</span>
                <div>
                  <span className="eyebrow">{t('sec4.eyebrow')}</span>
                  <h2>{t('sec4.title')}</h2>
                </div>
              </div>

              <div className="hierarchy-cards">
                <div className="hierarchy-card level-1">
                  <span className="level-tag">{t('sec4.level1Tag')}</span>
                  {compatibility.allPassed ? (
                    <p>{t('sec4.level1VerifiedBody')}</p>
                  ) : (
                    <p>
                      {t('sec4.level1PendingPrefix')}{' '}
                      {pick(compatibility.summaryReason, compatibility.summaryReason_vi)}
                    </p>
                  )}
                </div>

                <div className="hierarchy-card level-2">
                  <span className="level-tag">{t('sec4.level2Tag')}</span>
                  <ul>
                    <li>
                      <strong>{t('sec4.level2Item1Title')}</strong> {t('sec4.level2Item1Body')}
                    </li>
                    <li>
                      <strong>{t('sec4.level2Item2Title')}</strong> {t('sec4.level2Item2Body')}
                    </li>
                  </ul>
                </div>

                <div className="hierarchy-card level-3">
                  <span className="level-tag">{t('sec4.level3Tag')}</span>
                  <p>
                    <strong>{t('sec4.level3SupportedTitle')}</strong>{' '}
                    {t('sec4.level3SupportedBody')}
                    <br />
                    <strong>{t('sec4.level3NotSupportedTitle')}</strong>{' '}
                    {t('sec4.level3NotSupportedBody')}
                  </p>
                </div>
              </div>

              <div className="qa-assistant" aria-label={t('sec4.qaAria')}>
                <span className="field-label">{t('sec4.qaTitle')}</span>
                <div className="qa-pills">
                  {SCIENTIFIC_QA_ITEMS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`qa-pill ${activeQaId === item.id ? 'active' : ''}`}
                      onClick={() => setActiveQaId(item.id)}
                    >
                      {pick(item.shortTag, item.shortTag_vi)}
                    </button>
                  ))}
                </div>
                <div className="qa-answer-box">
                  <strong>Q: {pick(activeQa.question, activeQa.question_vi)}</strong>
                  <p>{pick(activeQa.answer, activeQa.answer_vi)}</p>
                  <small>
                    {t('sec4.qaSourcePrefix')}{' '}
                    {pick(activeQa.evidenceCitation, activeQa.evidenceCitation_vi)}
                  </small>
                </div>
              </div>

              {location && (
                <div className="location-readout" aria-live="polite">
                  <span className="eyebrow">{t('sec4.coordEyebrow')}</span>
                  <strong>
                    {location.latitude.toFixed(5)}°N, {location.longitude.toFixed(5)}°E
                  </strong>
                  <small>
                    {bboxesIntersect(
                      [
                        location.longitude,
                        location.latitude,
                        location.longitude,
                        location.latitude,
                      ],
                      VERIFIED_ANGIANG_PAIR_STATS.bboxWgs84
                    )
                      ? t('sec4.coordInside')
                      : t('sec4.coordOutside')}
                  </small>
                </div>
              )}
            </section>
          )}

          {/* SECTION 05: 10 COMPATIBILITY GATES, BYTE BUDGET & PROVENANCE */}
          {showSection('provenance') && (
            <details
              className={`provenance ${mode === 'research' || sectionFilter === 'provenance' ? 'provenance-open' : ''}`}
              open={mode === 'research' || sectionFilter === 'provenance' || sectionFilter === 'all'}
            >
              <summary>
                <span>{t('sec5.summaryTitle')}</span>
                <span className="provenance-status">
                  {compatibility.allPassed ? t('sec5.statusVerified') : t('sec5.statusPending')}
                </span>
              </summary>

              <div className="gates-table-wrap">
                <table className="gates-table" aria-label={t('sec5.tableAria')}>
                  <thead>
                    <tr>
                      <th>{t('sec5.colGate')}</th>
                      <th>{t('sec5.colStatus')}</th>
                      <th>{t('sec5.colEvidence')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {compatibility.gates.map((g) => (
                      <tr key={g.id} className={g.passed ? 'gate-pass' : 'gate-fail'}>
                        <td>
                          <strong>{pick(g.name, g.name_vi)}</strong>
                          <small>{pick(g.detail, g.detail_vi)}</small>
                        </td>
                        <td>
                          <span className={`gate-badge ${g.passed ? 'pass' : 'fail'}`}>
                            {g.passed ? t('sec5.badgePass') : t('sec5.badgeBlocked')}
                          </span>
                        </td>
                        <td>
                          <code>{pick(g.observed, g.observed_vi)}</code>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <dl>
                <div>
                  <dt>{t('sec5.dtBudget')}</dt>
                  <dd>
                    {t('sec5.budgetCap')} <code>250,000,000 bytes (250 MB)</code>
                    <br />
                    {t('sec5.budgetMask')} (<code>{VERIFIED_ANGIANG_PAIR_STATS.maskTaskId}</code>):{' '}
                    <code>1,149,959 bytes</code>
                    <br />
                    {t('sec5.budgetBackscatter')} (
                    <code>{VERIFIED_ANGIANG_PAIR_STATS.taskId}</code>):{' '}
                    <code>32,662,758 bytes</code>
                    <br />
                    {t('sec5.budgetCombined')} <strong>33,812,717 bytes (13.53%)</strong> ·{' '}
                    {t('sec5.budgetRemaining')} <code>216,187,283 bytes</code>
                  </dd>
                </div>
                <div>
                  <dt>{t('sec5.dtGrid')}</dt>
                  <dd>
                    {PROVENANCE.collection} · {t('sec5.gridVersion')}{' '}
                    {PROVENANCE.processingVersion} · CRID {PROVENANCE.crid}
                    <br />
                    Track {PROVENANCE.track} / Frame {PROVENANCE.frame} · {PROVENANCE.direction} ·{' '}
                    {t('sec5.gridLook')}
                    <br />
                    {PROVENANCE.crs} · {PROVENANCE.pixelSpacing} · {t('sec5.gridWindow')}{' '}
                    <code>[19962..21067)</code>, {t('sec5.gridCols')} <code>[24469..25563)</code>{' '}
                    (1105×1094)
                    <br />
                    {t('sec5.gridFormula')} <code>γ⁰_dB = 10·log10(HHHH_5x5)</code>;{' '}
                    <code>Δγ⁰_dB = γ⁰_after − γ⁰_before</code>
                  </dd>
                </div>
                {ACQUISITIONS.map((observation) => (
                  <div className="granule-row" key={observation.conceptId}>
                    <dt>
                      {observation.date}
                      <br />
                      {observation.conceptId}
                    </dt>
                    <dd>
                      {t('sec5.granuleCollection')} {observation.collection} ({observation.maturity}
                      ) · {t('sec5.granuleOrbit')} {observation.orbit}
                      <br />
                      {pick(observation.areaScreen, observation.areaScreen_vi)}
                      <br />
                      <code>{observation.granuleId}</code>
                    </dd>
                  </div>
                ))}
                <div>
                  <dt>{t('sec5.dtChecksums')}</dt>
                  <dd className="checksum-list">
                    {VERIFIED_ANGIANG_PAIR_STATS.checksums.map((f) => (
                      <div key={f.name} className="checksum-item">
                        <span>
                          <b>{f.name}</b> ({(f.bytes / 1024).toFixed(1)} KB)
                        </span>
                        <code>{f.sha256.slice(0, 24)}…</code>
                      </div>
                    ))}
                  </dd>
                </div>
              </dl>
              <p className="source-note">{t('sec5.sourceNote')}</p>
            </details>
          )}
        </aside>
      </main>

      <footer className="footer-bar">
        <span>{t('footer.left')}</span>
        <span>{t('footer.right')}</span>
      </footer>
    </div>
  );
}

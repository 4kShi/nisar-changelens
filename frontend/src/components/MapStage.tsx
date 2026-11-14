import { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import type { Map as MapLibreMap } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Feature, FeatureCollection, Geometry, Polygon } from 'geojson';
import {
  AN_GIANG_SCREENING_BBOX,
  DONG_THAP_PILOT_BBOX,
  MEKONG_PROVINCES,
  VERIFIED_ANGIANG_PAIR_STATS,
  VISUALIZATION_THRESHOLD_PRESETS,
  bboxToGeoJsonFeature,
  type OverlayLayerId,
  type StudyAreaId,
  type VisualizationThresholdId,
} from '../data/study';
import { DISCOVERED_GRANULES } from '../data/catalogInventory';
import { useI18n } from '../i18n/I18nContext';

export type MapState = 'loading' | 'ready' | 'boundary-error' | 'map-error';

interface MapStageProps {
  mode?: 'explore' | 'research';
  area: StudyAreaId;
  selectedProvince: string;
  customBbox: [number, number, number, number];
  customClickMode: boolean;
  showFootprints: boolean;
  highlightedConceptIds: string[];
  /** True only when the selected before/after pair passed all compatibility gates. */
  pairVerified: boolean;
  overlayLayer: OverlayLayerId;
  overlayOpacity: number;
  swipePercent: number;
  visualizationThreshold?: VisualizationThresholdId;
  showSyntheticFixture: boolean;
  onMapStateChange: (state: MapState) => void;
  onLocationSelect: (location: { longitude: number; latitude: number } | null) => void;
  onProvinceSelect: (provinceName: string) => void;
  onCustomBboxSelect: (bbox: [number, number, number, number]) => void;
  onAreaSelect: (area: StudyAreaId) => void;
  onOverlayLayerChange: (layer: OverlayLayerId) => void;
  onOverlayOpacityChange: (opacity: number) => void;
  onSwipePercentChange: (pct: number) => void;
  onVisualizationThresholdChange?: (thresh: VisualizationThresholdId) => void;
  onToggleFootprints: () => void;
  onToggleCustomClickMode: () => void;
  onResetSelection: () => void;
}

const base = import.meta.env.BASE_URL;
maplibregl.setWorkerUrl(`${base}maplibre-gl-worker.js`);

const STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    carto: {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      attribution:
        'Basemap © Esri, HERE, Garmin, OpenStreetMap contributors | Boundaries: geoBoundaries CC BY 4.0',
    },
    labels: {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
    },
  },
  layers: [
    { id: 'carto-basemap', type: 'raster', source: 'carto', minzoom: 0, maxzoom: 16 },
    {
      id: 'carto-labels',
      type: 'raster',
      source: 'labels',
      minzoom: 0,
      maxzoom: 16,
      paint: { 'raster-opacity': 0.75 },
    },
  ],
};

async function getGeoJson(path: string): Promise<FeatureCollection<Geometry>> {
  const response = await fetch(`${base}${path}`);
  if (!response.ok) throw new Error(`Boundary request failed (${response.status})`);
  const data: unknown = await response.json();
  if (
    !data ||
    typeof data !== 'object' ||
    (data as { type?: unknown }).type !== 'FeatureCollection'
  ) {
    throw new Error('Boundary file is not a GeoJSON FeatureCollection');
  }
  return data as FeatureCollection<Geometry>;
}

function buildFootprintsGeoJson(highlightedIds: string[]): FeatureCollection<Polygon> {
  const features: Feature<Polygon>[] = DISCOVERED_GRANULES.map((g) => {
    const isHighlighted = highlightedIds.includes(g.conceptId);
    return {
      type: 'Feature',
      properties: {
        concept_id: g.conceptId,
        granule_id: g.granuleId,
        track: g.track,
        frame: g.frame,
        collection: g.collection,
        highlighted: isHighlighted ? 1 : 0,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [g.footprint],
      },
    };
  });
  return { type: 'FeatureCollection', features };
}

export function MapStage({
  mode = 'explore',
  area,
  selectedProvince,
  customBbox,
  customClickMode,
  showFootprints,
  highlightedConceptIds,
  pairVerified,
  overlayLayer,
  overlayOpacity,
  swipePercent,
  visualizationThreshold = 'continuous',
  showSyntheticFixture,
  onMapStateChange,
  onLocationSelect,
  onProvinceSelect,
  onCustomBboxSelect,
  onAreaSelect,
  onOverlayLayerChange,
  onOverlayOpacityChange,
  onSwipePercentChange,
  onVisualizationThresholdChange,
  onToggleFootprints,
  onToggleCustomClickMode,
  onResetSelection,
}: MapStageProps) {
  const { t, pick } = useI18n();
  const host = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const loadedRef = useRef(false);
  // State (not just the ref) so the sync effects below re-run once layers exist.
  const [mapReady, setMapReady] = useState(false);
  const [basemapWarning, setBasemapWarning] = useState(false);
  // The bundled rasters belong to one specific verified pair in one window.
  const showVerifiedPair = area === 'angiang-screening' && pairVerified;
  const [cursorCoords, setCursorCoords] = useState<{ lng: number; lat: number } | null>(null);

  const customClickModeRef = useRef(customClickMode);
  customClickModeRef.current = customClickMode;

  // Automatically resize MapLibre canvas when container dimensions change (e.g. splitter drag)
  useEffect(() => {
    const el = host.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => {
      if (mapRef.current && typeof mapRef.current.resize === 'function') {
        mapRef.current.resize();
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!host.current) return;
    let active = true;
    let map: MapLibreMap;
    onMapStateChange('loading');
    try {
      map = new maplibregl.Map({
        container: host.current,
        style: STYLE,
        center: [105.0, 10.5],
        zoom: 10.4,
        minZoom: 5,
        maxZoom: 15,
        attributionControl: false,
      });
    } catch {
      onMapStateChange('map-error');
      return;
    }
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

    map.on('error', (event) => {
      const mapEvent = event as { sourceId?: string };
      if (mapEvent.sourceId === 'carto') setBasemapWarning(true);
    });

    map.on('mousemove', (event) => {
      setCursorCoords({
        lng: Number(event.lngLat.lng.toFixed(4)),
        lat: Number(event.lngLat.lat.toFixed(4)),
      });
    });

    map.on('click', (event) => {
      const lng = Number(event.lngLat.lng.toFixed(5));
      const lat = Number(event.lngLat.lat.toFixed(5));
      onLocationSelect({ longitude: lng, latitude: lat });

      if (customClickModeRef.current) {
        const half = 0.05;
        const newBbox: [number, number, number, number] = [
          Number((lng - half).toFixed(4)),
          Number((lat - half).toFixed(4)),
          Number((lng + half).toFixed(4)),
          Number((lat + half).toFixed(4)),
        ];
        onCustomBboxSelect(newBbox);
        return;
      }

      if (loadedRef.current && map.getLayer('province-fill-hit')) {
        const features = map.queryRenderedFeatures(event.point, {
          layers: ['province-fill-hit'],
        });
        if (features.length > 0) {
          const shapeName = features[0].properties?.shapeName;
          if (typeof shapeName === 'string' && shapeName.length > 0) {
            onProvinceSelect(shapeName);
          }
        }
      }
    });

    map.on('load', async () => {
      try {
        const [mekong, provinces] = await Promise.all([
          getGeoJson('data/v1/mekong_boundary.geojson'),
          getGeoJson('data/v1/mekong_provinces.geojson'),
        ]);
        if (!active) return;

        // 1. CMR Granule footprints source & layers
        map.addSource('granule-footprints', {
          type: 'geojson',
          data: buildFootprintsGeoJson(highlightedConceptIds),
        });
        map.addLayer({
          id: 'granule-footprints-fill',
          type: 'fill',
          source: 'granule-footprints',
          paint: {
            'fill-color': [
              'case',
              ['==', ['get', 'highlighted'], 1],
              '#38bdf8',
              '#94a3b8',
            ],
            'fill-opacity': ['case', ['==', ['get', 'highlighted'], 1], 0.07, 0.02],
          },
        });
        map.addLayer({
          id: 'granule-footprints-line',
          type: 'line',
          source: 'granule-footprints',
          paint: {
            'line-color': [
              'case',
              ['==', ['get', 'highlighted'], 1],
              '#38bdf8',
              '#64748b',
            ],
            'line-width': ['case', ['==', ['get', 'highlighted'], 1], 1.8, 0.8],
            'line-dasharray': [3, 2],
            'line-opacity': ['case', ['==', ['get', 'highlighted'], 1], 0.85, 0.45],
          },
        });

        // 2. Provinces & Mekong boundary
        map.addSource('provinces', { type: 'geojson', data: provinces });
        map.addLayer({
          id: 'province-fill-hit',
          type: 'fill',
          source: 'provinces',
          paint: { 'fill-color': '#ffffff', 'fill-opacity': 0.01 },
        });
        map.addLayer({
          id: 'selected-province-fill',
          type: 'fill',
          source: 'provinces',
          filter: ['==', ['get', 'shapeName'], selectedProvince] as unknown as maplibregl.FilterSpecification,
          paint: { 'fill-color': '#2dd4bf', 'fill-opacity': 0.09 },
        });
        map.addLayer({
          id: 'province-lines',
          type: 'line',
          source: 'provinces',
          paint: { 'line-color': '#94a3b8', 'line-width': 0.85, 'line-opacity': 0.5 },
        });

        map.addSource('mekong-boundary', { type: 'geojson', data: mekong });
        map.addLayer({
          id: 'mekong-boundary-line',
          type: 'line',
          source: 'mekong-boundary',
          paint: { 'line-color': '#5eead4', 'line-width': 2.2, 'line-opacity': 0.9 },
        });

        // 3. Verified An Giang Georeferenced Raster Overlays
        const coords = VERIFIED_ANGIANG_PAIR_STATS.maplibreCoordinates;
        const rasterLayers: Array<{ id: string; url: string }> = [
          { id: 'raster-before_db', url: `${base}${VERIFIED_ANGIANG_PAIR_STATS.overlays.before_db}` },
          { id: 'raster-after_db', url: `${base}${VERIFIED_ANGIANG_PAIR_STATS.overlays.after_db}` },
          { id: 'raster-change_db', url: `${base}${VERIFIED_ANGIANG_PAIR_STATS.overlays.change_db}` },
          {
            id: 'raster-change_classes',
            url: `${base}${VERIFIED_ANGIANG_PAIR_STATS.overlays.change_classes}`,
          },
          {
            id: 'raster-change_classes_2db',
            url: `${base}${VERIFIED_ANGIANG_PAIR_STATS.overlays.change_classes_2db}`,
          },
          {
            id: 'raster-change_classes_4db',
            url: `${base}${VERIFIED_ANGIANG_PAIR_STATS.overlays.change_classes_4db}`,
          },
          {
            id: 'raster-mask_common_valid',
            url: `${base}${VERIFIED_ANGIANG_PAIR_STATS.overlays.mask_common_valid}`,
          },
        ];

        for (const item of rasterLayers) {
          map.addSource(item.id, {
            type: 'image',
            url: item.url,
            coordinates: coords,
          });
          map.addLayer({
            id: item.id,
            type: 'raster',
            source: item.id,
            // Hidden until the visibility sync effect selects exactly one layer.
            layout: { visibility: 'none' },
            paint: {
              'raster-opacity': 0.88,
              'raster-resampling': 'nearest',
            },
          });
        }

        // 4. AOI Bounding Boxes (An Giang Verified, Dong Thap Diagnostic, Custom AOI)
        map.addSource('angiang-bbox', { type: 'geojson', data: AN_GIANG_SCREENING_BBOX });
        map.addLayer({
          id: 'angiang-bbox-fill',
          type: 'fill',
          source: 'angiang-bbox',
          paint: { 'fill-color': '#10b981', 'fill-opacity': 0.06 },
        });
        map.addLayer({
          id: 'angiang-bbox-line',
          type: 'line',
          source: 'angiang-bbox',
          paint: { 'line-color': '#10b981', 'line-width': 2.5 },
        });

        map.addSource('dongthap-bbox', { type: 'geojson', data: DONG_THAP_PILOT_BBOX });
        map.addLayer({
          id: 'dongthap-bbox-fill',
          type: 'fill',
          source: 'dongthap-bbox',
          paint: { 'fill-color': '#f59e0b', 'fill-opacity': 0.1 },
        });
        map.addLayer({
          id: 'dongthap-bbox-line',
          type: 'line',
          source: 'dongthap-bbox',
          paint: { 'line-color': '#f59e0b', 'line-width': 2.2, 'line-dasharray': [3, 2] },
        });

        map.addSource('custom-bbox', {
          type: 'geojson',
          data: bboxToGeoJsonFeature(customBbox, 'Custom User AOI'),
        });
        map.addLayer({
          id: 'custom-bbox-fill',
          type: 'fill',
          source: 'custom-bbox',
          layout: { visibility: 'none' },
          paint: { 'fill-color': '#a855f7', 'fill-opacity': 0.12 },
        });
        map.addLayer({
          id: 'custom-bbox-line',
          type: 'line',
          source: 'custom-bbox',
          layout: { visibility: 'none' },
          paint: { 'line-color': '#c084fc', 'line-width': 2.2, 'line-dasharray': [2, 2] },
        });

        loadedRef.current = true;
        setMapReady(true);
        onMapStateChange('ready');
      } catch {
        if (active) onMapStateChange('boundary-error');
      }
    });

    return () => {
      active = false;
      loadedRef.current = false;
      setMapReady(false);
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync custom AOI visibility (also runs once when the map becomes ready)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    const customVis = area === 'custom-aoi' ? 'visible' : 'none';
    if (map.getLayer('custom-bbox-fill')) {
      map.setLayoutProperty('custom-bbox-fill', 'visibility', customVis);
      map.setLayoutProperty('custom-bbox-line', 'visibility', customVis);
    }
  }, [area, mapReady]);

  // Fly the camera when the study area changes (not on initial load: the
  // constructor already sets the starting view)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loadedRef.current) return;

    if (area === 'angiang-screening') {
      map.flyTo({ center: [105.0, 10.5], zoom: 11.2, duration: 850 });
    } else if (area === 'dongthap-pilot') {
      map.flyTo({ center: [105.5, 10.65], zoom: 11.0, duration: 850 });
    } else if (area === 'custom-aoi') {
      const [w, s, e, n] = customBbox;
      map.flyTo({ center: [(w + e) / 2, (s + n) / 2], zoom: 10.6, duration: 850 });
    } else {
      map.flyTo({ center: [105.55, 9.85], zoom: 7.3, duration: 850 });
    }
  }, [area, customBbox]);

  // Sync selected province highlight
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || !map.getLayer('selected-province-fill')) return;
    map.setFilter('selected-province-fill', [
      '==',
      ['get', 'shapeName'],
      selectedProvince,
    ] as unknown as maplibregl.FilterSpecification);
  }, [selectedProvince, mapReady]);

  // Sync custom bbox GeoJSON source
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    const src = map.getSource('custom-bbox') as maplibregl.GeoJSONSource | undefined;
    if (src) {
      src.setData(bboxToGeoJsonFeature(customBbox, 'Custom User AOI'));
    }
  }, [customBbox, mapReady]);

  // Sync granule footprints visibility and highlighted granules
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    const src = map.getSource('granule-footprints') as maplibregl.GeoJSONSource | undefined;
    if (src) {
      src.setData(buildFootprintsGeoJson(highlightedConceptIds));
    }
    const vis = showFootprints ? 'visible' : 'none';
    if (map.getLayer('granule-footprints-fill')) {
      map.setLayoutProperty('granule-footprints-fill', 'visibility', vis);
      map.setLayoutProperty('granule-footprints-line', 'visibility', vis);
    }
  }, [showFootprints, highlightedConceptIds, mapReady]);

  // Sync verified An Giang raster layer visibility & opacity
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    const showRaster = showVerifiedPair;
    const activeMapLayer =
      overlayLayer === 'swipe_before_after' ? 'change_db' : overlayLayer;

    const allLayerKeys: Array<Exclude<OverlayLayerId, 'swipe_before_after'>> = [
      'before_db',
      'after_db',
      'change_db',
      'change_classes',
      'change_classes_2db',
      'change_classes_4db',
      'mask_common_valid',
    ];

    for (const key of allLayerKeys) {
      const layerId = `raster-${key}`;
      if (!map.getLayer(layerId)) continue;
      const isVisible = showRaster && activeMapLayer === key;
      map.setLayoutProperty(layerId, 'visibility', isVisible ? 'visible' : 'none');
      map.setPaintProperty(layerId, 'raster-opacity', overlayOpacity);
    }
  }, [showVerifiedPair, overlayLayer, overlayOpacity, mapReady]);

  const activeProvinceInfo = MEKONG_PROVINCES.find((p) => p.name === selectedProvince);
  const isChangeLayerActive =
    overlayLayer === 'change_db' ||
    overlayLayer === 'change_classes' ||
    overlayLayer === 'change_classes_2db' ||
    overlayLayer === 'change_classes_4db';

  const activeThresholdPreset =
    VISUALIZATION_THRESHOLD_PRESETS.find((p) => p.id === visualizationThreshold) ??
    VISUALIZATION_THRESHOLD_PRESETS[0];

  const handlePrimaryChangeClick = () => {
    const preset =
      VISUALIZATION_THRESHOLD_PRESETS.find((p) => p.id === visualizationThreshold) ??
      VISUALIZATION_THRESHOLD_PRESETS[0];
    onOverlayLayerChange(preset.overlayLayer);
  };

  return (
    <section className="map-stage" aria-label={t('map.interactiveAria')}>
      <div ref={host} className="map-host" />

      {/* Top-Left Map HUD Toolbar */}
      <div className="map-hud-top" aria-label={t('hud.controlsAria')}>
        <div className="map-hud-badges">
          <span
            className={`hud-tier-pill ${
              showVerifiedPair
                ? 'tier-verified'
                : area === 'dongthap-pilot'
                  ? 'tier-rejected'
                  : 'tier-catalog'
            }`}
            data-testid="hud-tier-pill"
          >
            {showVerifiedPair
              ? t('hud.tier4Verified')
              : area === 'angiang-screening'
                ? t('hud.tierPairPending')
                : area === 'dongthap-pilot'
                ? t('hud.tier2Rejected')
                : area === 'custom-aoi'
                  ? t('hud.tierCustom')
                  : t('hud.tier1Catalog')}
          </span>
          <span className="hud-province-pill">
            {t('hud.provincePrefix')} <strong>{selectedProvince}</strong>
          </span>
        </div>

        <div className="map-hud-actions">
          <button
            type="button"
            className={`hud-btn ${area === 'angiang-screening' ? 'active' : ''}`}
            onClick={() => onAreaSelect('angiang-screening')}
            title={t('hud.btnAnGiangTitle')}
          >
            {t('hud.btnAnGiang')}
          </button>
          <button
            type="button"
            className={`hud-btn ${area === 'dongthap-pilot' ? 'active' : ''}`}
            onClick={() => onAreaSelect('dongthap-pilot')}
            title={t('hud.btnDongThapTitle')}
          >
            {t('hud.btnDongThap')}
          </button>
          <button
            type="button"
            className={`hud-btn ${customClickMode ? 'active-mode' : ''}`}
            onClick={onToggleCustomClickMode}
            title={t('hud.btnPlaceCustomTitle')}
          >
            {customClickMode ? t('hud.btnPlaceCustomActive') : t('hud.btnPlaceCustom')}
          </button>
          <button
            type="button"
            className={`hud-btn ${showFootprints ? 'active' : ''}`}
            onClick={onToggleFootprints}
          >
            {showFootprints ? t('hud.btnHideFootprints') : t('hud.btnShowFootprints')}
          </button>
          <button
            type="button"
            className="hud-btn reset-btn"
            onClick={onResetSelection}
            title={t('hud.btnResetTitle')}
          >
            {t('hud.btnReset')}
          </button>
        </div>

        {/* Prominent Visual Layer Bar when the verified An Giang pair is active */}
        {showVerifiedPair && (
          <div className="map-layer-bar" role="group" aria-label={t('layer.groupAria')}>
            <span className="layer-bar-label">{t('primaryLayer.label')}</span>
            <button
              type="button"
              data-testid="map-view-before"
              className={`layer-chip ${overlayLayer === 'before_db' ? 'selected' : ''}`}
              onClick={() => onOverlayLayerChange('before_db')}
            >
              {t('primaryLayer.before')}
            </button>
            <button
              type="button"
              data-testid="map-view-after"
              className={`layer-chip ${overlayLayer === 'after_db' ? 'selected' : ''}`}
              onClick={() => onOverlayLayerChange('after_db')}
            >
              {t('primaryLayer.after')}
            </button>
            <button
              type="button"
              data-testid="map-view-change"
              className={`layer-chip layer-chip-change ${isChangeLayerActive ? 'selected' : ''}`}
              onClick={handlePrimaryChangeClick}
            >
              {t('primaryLayer.change')}
            </button>
            <button
              type="button"
              data-testid="map-view-swipe"
              className={`layer-chip ${overlayLayer === 'swipe_before_after' ? 'selected' : ''}`}
              onClick={() => onOverlayLayerChange('swipe_before_after')}
            >
              {t('primaryLayer.swipe')}
            </button>

            {mode === 'research' && (
              <button
                type="button"
                data-testid="map-view-mask"
                className={`layer-chip ${overlayLayer === 'mask_common_valid' ? 'selected' : ''}`}
                onClick={() => onOverlayLayerChange('mask_common_valid')}
              >
                {t('layer.validMask')}
              </button>
            )}

            {isChangeLayerActive && onVisualizationThresholdChange && (
              <div className="threshold-inline-group">
                <span className="layer-bar-label">{t('primaryLayer.thresholdLabel')}</span>
                {VISUALIZATION_THRESHOLD_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    data-testid={`threshold-btn-${preset.id}`}
                    className={`thresh-chip ${
                      visualizationThreshold === preset.id &&
                      overlayLayer === preset.overlayLayer
                        ? 'selected'
                        : ''
                    }`}
                    onClick={() => {
                      onVisualizationThresholdChange(preset.id);
                      onOverlayLayerChange(preset.overlayLayer);
                    }}
                    title={pick(preset.note, preset.note_vi)}
                  >
                    {pick(preset.shortLabel, preset.shortLabel_vi)}
                  </button>
                ))}
              </div>
            )}

            <label className="opacity-slider-label">
              {t('layer.opacity')} {Math.round(overlayOpacity * 100)}%
              <input
                type="range"
                min={0.1}
                max={1}
                step={0.05}
                value={overlayOpacity}
                onChange={(e) => onOverlayOpacityChange(Number(e.target.value))}
                aria-label={t('layer.opacityAria')}
              />
            </label>
            {Math.abs(overlayOpacity - 0.9) > 0.01 && (
              <button
                type="button"
                className="opacity-reset-btn"
                onClick={() => onOverlayOpacityChange(0.9)}
              >
                {t('primaryLayer.resetOpacity')}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Synchronized Interactive Before/After Swipe Lens for Verified An Giang Pair */}
      {showVerifiedPair && overlayLayer === 'swipe_before_after' && (
        <div className="swipe-comparison-dock" aria-label={t('swipe.dockAria')}>
          <div className="swipe-dock-header">
            <div>
              <strong>{t('swipe.title')}</strong>
              <span className="swipe-sub">{t('swipe.subtitle')}</span>
            </div>
            <span className="swipe-badge">{t('swipe.badge')}</span>
          </div>

          <div className="swipe-viewport">
            <img
              src={`${base}${VERIFIED_ANGIANG_PAIR_STATS.overlays.after_db}`}
              alt={t('swipe.afterAlt')}
              className="swipe-img swipe-img-after"
            />
            <div
              className="swipe-before-clip"
              style={{ clipPath: `inset(0 ${100 - swipePercent}% 0 0)` }}
            >
              <img
                src={`${base}${VERIFIED_ANGIANG_PAIR_STATS.overlays.before_db}`}
                alt={t('swipe.beforeAlt')}
                className="swipe-img swipe-img-before"
              />
            </div>
            <div className="swipe-divider-line" style={{ left: `${swipePercent}%` }}>
              <span className="swipe-handle">⇄</span>
            </div>
            <span className="swipe-date-tag left">{t('swipe.tagLeft')}</span>
            <span className="swipe-date-tag right">{t('swipe.tagRight')}</span>
          </div>

          <div className="swipe-slider-row">
            <label htmlFor="map-swipe-slider">
              {t('swipe.splitLabel')} ({swipePercent}%)
            </label>
            <input
              id="map-swipe-slider"
              type="range"
              min={0}
              max={100}
              value={swipePercent}
              onChange={(e) => onSwipePercentChange(Number(e.target.value))}
            />
          </div>
        </div>
      )}

      {/* Verified window, but the selected pair failed the gates: keep the bundled rasters hidden */}
      {area === 'angiang-screening' && !pairVerified && (
        <div className="map-unverified-banner" role="status" data-testid="pair-blocked-banner">
          <strong>{t('banner.pairBlockedTitle')}</strong> {t('banner.pairBlockedBody')}{' '}
          <button type="button" className="inline-link-btn" onClick={onResetSelection}>
            {t('sec3.restoreBtn')}
          </button>
        </div>
      )}

      {/* Honest Diagnostic Notice when Unverified AOI or Rejected Dong Thap Pilot is active */}
      {area !== 'angiang-screening' && (
        <div className="map-unverified-banner" role="status">
          {area === 'dongthap-pilot' ? (
            <>
              <strong>{t('banner.dongThapTitle')}</strong> {t('banner.dongThapBody1')}{' '}
              <code>[105.45, 10.60, 105.55, 10.70]</code>
              {t('banner.dongThapBody2')} <code>mask = 255</code> {t('banner.dongThapBody3')}{' '}
              <button
                type="button"
                className="inline-link-btn"
                onClick={() => onAreaSelect('angiang-screening')}
              >
                {t('banner.switchAnGiangLink')}
              </button>
            </>
          ) : (
            <>
              <strong>{t('banner.catalogTitle')}</strong> {t('banner.catalogBody')}{' '}
              <button
                type="button"
                className="inline-link-btn"
                onClick={() => onAreaSelect('angiang-screening')}
              >
                {t('banner.loadAnGiangLink')}
              </button>
            </>
          )}
          {showSyntheticFixture && (
            <div className="synthetic-fixture-preview">
              <span className="synthetic-badge">{t('banner.syntheticBadge')}</span>
              <p>{t('banner.syntheticBody')}</p>
            </div>
          )}
        </div>
      )}

      {basemapWarning && (
        <div className="map-notice" role="status">
          {t('banner.basemapWarning')}
        </div>
      )}

      {/* Map Legend & Live Coordinates */}
      <div className="map-key" aria-label={t('legend.aria')}>
        <div className="map-key-top-row">
          <div className="map-key-items">
            <span>
              <i className="key-line delta" />
              {t('legend.mekong')}
            </span>
            <span>
              <i className="key-line angiang" />
              {t('legend.angiang')}
            </span>
            <span>
              <i className="key-line dongthap" />
              {t('legend.dongthap')}
            </span>
            {showFootprints && (
              <span>
                <i className="key-line footprint" />
                {t('legend.footprints')}
              </span>
            )}
          </div>

          <div className="map-cursor-readout">
            {cursorCoords
              ? `${t('legend.cursorPrefix')} ${cursorCoords.lat.toFixed(4)}° N, ${cursorCoords.lng.toFixed(4)}° E`
              : t('legend.cursorPrompt')}{' '}
            {activeProvinceInfo ? `| ${activeProvinceInfo.name}` : ''}
          </div>
        </div>

        {showVerifiedPair && (
          <div className="map-color-scale" aria-label={t('legend.radioAria')}>
            {overlayLayer === 'before_db' || overlayLayer === 'after_db' ? (
              <div className="legend-scale-row">
                <span>
                  {t('legend.backscatterPrefix')} <strong>{t('legend.backscatterLow')}</strong>
                </span>
                <span className="legend-gradient-bar bar-grayscale" aria-hidden="true" />
                <span>
                  <strong>{t('legend.backscatterHigh')}</strong>
                </span>
                <span className="legend-invalid-pill">
                  <i className="swatch-invalid" /> {t('primaryLayer.invalidSwatch')}
                </span>
              </div>
            ) : overlayLayer === 'change_classes' ||
              overlayLayer === 'change_classes_2db' ||
              overlayLayer === 'change_classes_4db' ? (
              <div className="legend-scale-row">
                <span>
                  {t('legend.classesPrefix')}{' '}
                  <strong className="c-dec">
                    ■ ≤ -{activeThresholdPreset.thresholdDb ?? 3} dB (
                    {activeThresholdPreset.decreaseAreaKm2} km²)
                  </strong>{' '}
                  ·{' '}
                  <strong className="c-inc">
                    ■ ≥ +{activeThresholdPreset.thresholdDb ?? 3} dB (
                    {activeThresholdPreset.increaseAreaKm2} km²)
                  </strong>{' '}
                  ·{' '}
                  <span>
                    ±{activeThresholdPreset.thresholdDb ?? 3} dB (
                    {activeThresholdPreset.stableAreaKm2} km²)
                  </span>
                </span>
                <span className="legend-invalid-pill">
                  <i className="swatch-invalid" /> {t('primaryLayer.invalidSwatch')}
                </span>
              </div>
            ) : (
              <div className="legend-scale-row">
                <span>
                  {t('legend.deltaPrefix')}{' '}
                  <strong className="c-dec">{t('legend.deltaDec')}</strong>
                </span>
                <span className="legend-gradient-bar bar-diverging" aria-hidden="true" />
                <span>
                  <strong>{t('legend.deltaZero')}</strong> →{' '}
                  <strong className="c-inc">{t('legend.deltaInc')}</strong>
                </span>
                <span className="legend-invalid-pill">
                  <i className="swatch-invalid" /> {t('primaryLayer.invalidSwatch')}
                </span>
              </div>
            )}
            <small className="legend-caution-note">{t('primaryLayer.cautionNote')}</small>
          </div>
        )}
      </div>
    </section>
  );
}

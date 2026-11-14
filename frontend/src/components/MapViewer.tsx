import React, { useEffect, useRef, useCallback } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Manifest } from '../types/contract';
import { resolveHref } from '../data/contract';

interface MapViewerProps {
  manifestUrl: string;
  manifest: Manifest;
  boundaryGeojson: GeoJSON.GeoJSON | null;
  aoiGeojson: GeoJSON.GeoJSON | null;
  activeOverlay: 'classes' | 'continuous' | 'none';
  overlayOpacity: number;
  onOverlayChange: (overlay: 'classes' | 'continuous' | 'none') => void;
  onOpacityChange: (opacity: number) => void;
  sliderPos: number;
  onSliderChange: (pos: number) => void;
}

// Reliable free raster basemap style (Carto Positron with OSM attribution)
const BASEMAP_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    carto_positron: {
      type: 'raster',
      tiles: [
        'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
        'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
        'https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png'
      ],
      tileSize: 256,
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
    },
  },
  layers: [
    {
      id: 'carto_basemap',
      type: 'raster',
      source: 'carto_positron',
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

export const MapViewer: React.FC<MapViewerProps> = ({
  manifestUrl,
  manifest,
  boundaryGeojson,
  aoiGeojson,
  activeOverlay,
  overlayOpacity,
  onOverlayChange,
  onOpacityChange,
  sliderPos,
  onSliderChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapBeforeRef = useRef<HTMLDivElement>(null);
  const mapAfterRef = useRef<HTMLDivElement>(null);

  const map1 = useRef<maplibregl.Map | null>(null);
  const map2 = useRef<maplibregl.Map | null>(null);
  const isDragging = useRef(false);

  // Asset URLs from manifest
  const beforeAsset = manifest.assets.find((a) => a.role === 'before_db_image');
  const afterAsset = manifest.assets.find((a) => a.role === 'after_db_image');
  const changeAsset = manifest.assets.find((a) => a.role === 'change_image');
  const classAsset = manifest.assets.find((a) => a.role === 'change_class_image');

  const coords = (manifest.aoi as any).maplibre_coordinates || [
    [105.460387, 10.368838],
    [106.81398, 10.368838],
    [106.81398, 8.610238],
    [105.460387, 8.610238],
  ];

  // Initialize both maps once
  useEffect(() => {
    if (!mapBeforeRef.current || !mapAfterRef.current) return;

    const initialCenter: [number, number] = [105.9, 9.8];
    const initialZoom = 8.2;

    const m1 = new maplibregl.Map({
      container: mapBeforeRef.current,
      style: BASEMAP_STYLE,
      center: initialCenter,
      zoom: initialZoom,
      attributionControl: false,
    });

    const m2 = new maplibregl.Map({
      container: mapAfterRef.current,
      style: BASEMAP_STYLE,
      center: initialCenter,
      zoom: initialZoom,
      attributionControl: false,
    });

    // Synchronize cameras between before and after maps
    let syncFromM1 = false;
    let syncFromM2 = false;

    m1.on('move', () => {
      if (syncFromM2) return;
      syncFromM1 = true;
      m2.jumpTo({
        center: m1.getCenter(),
        zoom: m1.getZoom(),
        bearing: m1.getBearing(),
        pitch: m1.getPitch(),
      });
      syncFromM1 = false;
    });

    m2.on('move', () => {
      if (syncFromM1) return;
      syncFromM2 = true;
      m1.jumpTo({
        center: m2.getCenter(),
        zoom: m2.getZoom(),
        bearing: m2.getBearing(),
        pitch: m2.getPitch(),
      });
      syncFromM2 = false;
    });

    // Add layers when map loads
    const setupLayers = (mapInstance: maplibregl.Map, isBefore: boolean) => {
      mapInstance.on('load', () => {
        // 1. Mekong Boundary Layer
        if (boundaryGeojson) {
          mapInstance.addSource('boundary_src', {
            type: 'geojson',
            data: boundaryGeojson,
          });
          mapInstance.addLayer({
            id: 'boundary_fill',
            type: 'fill',
            source: 'boundary_src',
            paint: { 'fill-color': '#48cae4', 'fill-opacity': 0.04 },
          });
          mapInstance.addLayer({
            id: 'boundary_line',
            type: 'line',
            source: 'boundary_src',
            paint: { 'line-color': '#0077b6', 'line-width': 1.5, 'line-opacity': 0.7 },
          });
        }

        // 2. Analyzed AOI Layer
        if (aoiGeojson) {
          mapInstance.addSource('aoi_src', {
            type: 'geojson',
            data: aoiGeojson,
          });
          mapInstance.addLayer({
            id: 'aoi_line',
            type: 'line',
            source: 'aoi_src',
            paint: {
              'line-color': '#ffaa40',
              'line-width': 2,
              'line-dasharray': [4, 2],
            },
          });
        }

        // 3. NISAR Raster Layer
        if (isBefore && beforeAsset) {
          const url = resolveHref(beforeAsset.href, manifestUrl);
          mapInstance.addSource('before_nisar_src', {
            type: 'image',
            url,
            coordinates: coords,
          });
          mapInstance.addLayer({
            id: 'before_nisar_layer',
            type: 'raster',
            source: 'before_nisar_src',
            paint: { 'raster-opacity': 0.95 },
          });
        } else if (!isBefore && afterAsset) {
          const url = resolveHref(afterAsset.href, manifestUrl);
          mapInstance.addSource('after_nisar_src', {
            type: 'image',
            url,
            coordinates: coords,
          });
          mapInstance.addLayer({
            id: 'after_nisar_layer',
            type: 'raster',
            source: 'after_nisar_src',
            paint: { 'raster-opacity': 0.95 },
          });

          // Overlay sources on After map
          if (classAsset) {
            mapInstance.addSource('class_overlay_src', {
              type: 'image',
              url: resolveHref(classAsset.href, manifestUrl),
              coordinates: coords,
            });
            mapInstance.addLayer({
              id: 'class_overlay_layer',
              type: 'raster',
              source: 'class_overlay_src',
              paint: { 'raster-opacity': overlayOpacity },
              layout: { visibility: activeOverlay === 'classes' ? 'visible' : 'none' },
            });
          }

          if (changeAsset) {
            mapInstance.addSource('change_overlay_src', {
              type: 'image',
              url: resolveHref(changeAsset.href, manifestUrl),
              coordinates: coords,
            });
            mapInstance.addLayer({
              id: 'change_overlay_layer',
              type: 'raster',
              source: 'change_overlay_src',
              paint: { 'raster-opacity': overlayOpacity },
              layout: { visibility: activeOverlay === 'continuous' ? 'visible' : 'none' },
            });
          }
        }
      });
    };

    setupLayers(m1, true);
    setupLayers(m2, false);

    map1.current = m1;
    map2.current = m2;

    return () => {
      m1.remove();
      m2.remove();
    };
  }, [manifestUrl, boundaryGeojson, aoiGeojson]);

  // Update dynamic overlay visibility and opacity on map2
  useEffect(() => {
    const m = map2.current;
    if (!m || !m.isStyleLoaded()) return;

    if (m.getLayer('class_overlay_layer')) {
      m.setLayoutProperty('class_overlay_layer', 'visibility', activeOverlay === 'classes' ? 'visible' : 'none');
      m.setPaintProperty('class_overlay_layer', 'raster-opacity', overlayOpacity);
    }
    if (m.getLayer('change_overlay_layer')) {
      m.setLayoutProperty('change_overlay_layer', 'visibility', activeOverlay === 'continuous' ? 'visible' : 'none');
      m.setPaintProperty('change_overlay_layer', 'raster-opacity', overlayOpacity);
    }
  }, [activeOverlay, overlayOpacity]);

  // Mouse / Touch Slider Dragging
  const handlePointerDown = () => {
    isDragging.current = true;
  };

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const pct = (x / rect.width) * 100;
      onSliderChange(Math.round(pct * 10) / 10);
    },
    [onSliderChange]
  );

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      onSliderChange(Math.max(0, sliderPos - 2));
    } else if (e.key === 'ArrowRight') {
      onSliderChange(Math.min(100, sliderPos + 2));
    }
  };

  return (
    <div
      ref={containerRef}
      className="map-section"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Map 2: After (2026-10-22) + Overlays (Always full width in background) */}
      <div
        ref={mapAfterRef}
        className="maplibre-canvas"
        style={{ position: 'absolute', inset: 0 }}
      />

      {/* Map 1: Before (2026-10-10) (Clipped to slider position on left) */}
      <div
        ref={mapBeforeRef}
        className="maplibre-canvas"
        style={{
          position: 'absolute',
          inset: 0,
          clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)`,
        }}
      />

      {/* Swipe Divider Line & Draggable Handle */}
      <div
        className="swipe-divider"
        style={{ left: `${sliderPos}%` }}
        onPointerDown={handlePointerDown}
        tabIndex={0}
        role="slider"
        aria-valuenow={sliderPos}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Swipe comparison Before / After"
        onKeyDown={handleKeyDown}
      >
        <div className="swipe-handle">↔</div>
      </div>

      {/* Date Labels */}
      <div className="swipe-label swipe-label-left">
        2026-10-10 (Before)
      </div>
      <div className="swipe-label swipe-label-right">
        2026-10-22 (After) {activeOverlay !== 'none' && `+ ${activeOverlay === 'classes' ? 'Classified' : 'Continuous'} ΔdB`}
      </div>

      {/* Layer Controls on Bottom Left */}
      <div className="map-layer-controls">
        <div className="layer-select-row">
          <label style={{ fontWeight: 600 }}>Change Overlay:</label>
          <select
            value={activeOverlay}
            onChange={(e) => onOverlayChange(e.target.value as any)}
            style={{
              background: 'var(--bg-primary)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
              padding: '4px 8px',
              fontSize: '0.8rem',
            }}
          >
            <option value="classes">Classified ΔdB (±3dB)</option>
            <option value="continuous">Continuous ΔdB (-6..+6)</option>
            <option value="none">None (Radar Only)</option>
          </select>
        </div>

        {activeOverlay !== 'none' && (
          <div className="opacity-slider-row">
            <span>Opacity:</span>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={overlayOpacity}
              onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
            />
            <span>{Math.round(overlayOpacity * 100)}%</span>
          </div>
        )}
      </div>

      {/* Dynamic Floating Legend on Bottom Right */}
      <div className="floating-legend">
        {activeOverlay === 'classes' ? (
          <>
            <div className="legend-title">Observed Backscatter Change (12-day)</div>
            <div className="legend-item">
              <span className="legend-color-box" style={{ background: '#1E90FF' }} />
              <span>Backscatter Decrease (ΔdB ≤ -3.0 dB) — Possible Water</span>
            </div>
            <div className="legend-item">
              <span className="legend-color-box" style={{ background: '#E0E0E0' }} />
              <span>No Significant Change (-3 to +3 dB)</span>
            </div>
            <div className="legend-item">
              <span className="legend-color-box" style={{ background: '#FF4500' }} />
              <span>Backscatter Increase (ΔdB ≥ +3.0 dB) — Emergence</span>
            </div>
          </>
        ) : activeOverlay === 'continuous' ? (
          <>
            <div className="legend-title">Signed Difference (ΔdB)</div>
            <div
              style={{
                height: '10px',
                borderRadius: '3px',
                background: 'linear-gradient(to right, #1E90FF, #ffffff, #FF4500)',
                marginBottom: '6px',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              <span>-6 dB (Decrease)</span>
              <span>0 dB</span>
              <span>+6 dB (Increase)</span>
            </div>
          </>
        ) : (
          <>
            <div className="legend-title">NISAR L2 GCOV Backscatter (γ⁰ dB)</div>
            <div
              style={{
                height: '10px',
                borderRadius: '3px',
                background: 'linear-gradient(to right, #000000, #7f7f7f, #ffffff)',
                marginBottom: '6px',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              <span>-25 dB (Open Water)</span>
              <span>-12 dB (Wetland/Crop)</span>
              <span>0 dB (Dense/Urban)</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

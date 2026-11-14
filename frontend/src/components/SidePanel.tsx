import React, { useState } from 'react';
import type { CatalogRegion, Manifest } from '../types/contract';
import { resolveHref } from '../data/contract';

interface SidePanelProps {
  manifestUrl: string;
  manifest: Manifest;
  region: CatalogRegion;
  mode: 'explore' | 'research';
  activeOverlay: 'classes' | 'continuous' | 'none';
  onOverlayChange: (overlay: 'classes' | 'continuous' | 'none') => void;
  sliderPos: number;
  onSliderChange: (pos: number) => void;
}

type Step = 'discover' | 'observe' | 'compare' | 'understand';

export const SidePanel: React.FC<SidePanelProps> = ({
  manifestUrl,
  manifest,
  region,
  mode,
  activeOverlay,
  onOverlayChange,
  sliderPos,
  onSliderChange,
}) => {
  const [activeStep, setActiveStep] = useState<Step>('compare');

  const stats = manifest.analysis.stats;
  const obsBefore = manifest.observations[0];
  const obsAfter = manifest.observations[1];
  const gates = manifest.compatibility.checks;

  return (
    <aside className="side-panel">
      {/* 4-Step Navigation */}
      <nav className="step-nav" aria-label="Explorer steps">
        <button
          className={`step-tab ${activeStep === 'discover' ? 'active' : ''}`}
          onClick={() => setActiveStep('discover')}
        >
          1. Discover
        </button>
        <button
          className={`step-tab ${activeStep === 'observe' ? 'active' : ''}`}
          onClick={() => setActiveStep('observe')}
        >
          2. Observe
        </button>
        <button
          className={`step-tab ${activeStep === 'compare' ? 'active' : ''}`}
          onClick={() => setActiveStep('compare')}
        >
          3. Compare
        </button>
        <button
          className={`step-tab ${activeStep === 'understand' ? 'active' : ''}`}
          onClick={() => setActiveStep('understand')}
        >
          4. Understand
        </button>
      </nav>

      <div className="panel-content">
        {/* Step 1: Discover */}
        {activeStep === 'discover' && (
          <>
            <div className="section-card">
              <h4>📍 {region.name}</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                {region.summary}
              </p>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
                <strong>Bounding Scope:</strong> Lon [{region.bounds?.[0]}°, {region.bounds?.[2]}°], Lat [{region.bounds?.[1]}°, {region.bounds?.[3]}°]
              </div>
            </div>

            <div className="section-card">
              <h4>🌾 Why the Mekong Delta?</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                The Mekong Delta (Đồng bằng sông Cửu Long) is Vietnam's agricultural heartland, characterized by complex seasonal flooding, vast canal networks, and dense monsoon cloud cover.
              </p>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '8px', lineHeight: 1.6 }}>
                Optical satellites (Landsat, Sentinel-2) are frequently blind due to tropical clouds. NASA-ISRO NISAR's L-band synthetic aperture radar (24 cm wavelength) penetrates cloud cover and canopies, enabling dependable observation of water accumulation and wetland dynamics.
              </p>
            </div>
          </>
        )}

        {/* Step 2: Observe */}
        {activeStep === 'observe' && (
          <>
            <div className="section-card">
              <h4>🛰️ Orbit & Acquisition Pair</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Repeat Cycle:</span>{' '}
                  <strong>12 days (Cycle {obsBefore.acquisition.cycle} → {obsAfter.acquisition.cycle})</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Track / Frame:</span>{' '}
                  <strong>Track {obsBefore.acquisition.relative_track}, Frame {obsBefore.acquisition.frame}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Geometry:</span>{' '}
                  <strong>{obsBefore.acquisition.pass_direction}, {obsBefore.acquisition.look_direction}-Looking</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Instrument:</span>{' '}
                  <strong>NISAR LSAR (Frequency A, L-band, HHHH Covariance)</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Calibration:</span>{' '}
                  <strong>RTC γ⁰ (Gamma-Naught) in Linear Power</strong>
                </div>
              </div>
            </div>

            <div className="section-card">
              <h4>⏱️ Temporal Timeline</h4>
              <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ padding: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px' }}>
                  <div style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>T1: Before Acquisition</div>
                  <div>{obsBefore.acquisition.start_utc.split('.')[0]}Z</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>CRID: {obsBefore.processing.crid}</div>
                </div>
                <div style={{ padding: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px' }}>
                  <div style={{ color: 'var(--accent-orange)', fontWeight: 600 }}>T2: After Acquisition</div>
                  <div>{obsAfter.acquisition.start_utc.split('.')[0]}Z</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>CRID: {obsAfter.processing.crid}</div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Step 3: Compare */}
        {activeStep === 'compare' && (
          <>
            <div className="section-card">
              <h4>📊 Quantitative Change Statistics</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '8px' }}>
                Denominator: {stats?.denominator_description}
              </p>

              <div className="stats-grid">
                <div className="stat-box decrease">
                  <div className="stat-num">{stats?.areas_km2?.decrease_area ?? (stats ? ((stats.classes.decrease * stats.pixel_area_m2) / 1e6).toFixed(1) : 0)} km²</div>
                  <div className="stat-label">Decrease (ΔdB ≤ -3.0) — 5.9%</div>
                </div>
                <div className="stat-box">
                  <div className="stat-num">{stats?.areas_km2?.valid_analyzed ?? (stats ? ((stats.valid_pixels * stats.pixel_area_m2) / 1e6).toFixed(1) : 0)} km²</div>
                  <div className="stat-label">Total Valid Area Analyzed</div>
                </div>
                <div className="stat-box increase">
                  <div className="stat-num">{stats?.areas_km2?.increase_area ?? (stats ? ((stats.classes.increase * stats.pixel_area_m2) / 1e6).toFixed(1) : 0)} km²</div>
                  <div className="stat-label">Increase (ΔdB ≥ +3.0) — 0.6%</div>
                </div>
                <div className="stat-box">
                  <div className="stat-num">{stats?.delta_db.mean} dB</div>
                  <div className="stat-label">Mean ΔdB (Std: {stats?.delta_db.std} dB)</div>
                </div>
              </div>
            </div>

            <div className="section-card">
              <h4>🎛️ Interactive Swipe Controls</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.8rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>Before (2026-10-10)</span>
                    <span><strong>{sliderPos}%</strong></span>
                    <span>After (2026-10-22)</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sliderPos}
                    onChange={(e) => onSliderChange(parseFloat(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--accent-cyan)' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    style={{
                      flex: 1,
                      padding: '6px',
                      background: activeOverlay === 'classes' ? 'var(--accent-blue)' : 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '4px',
                      color: '#fff',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                    }}
                    onClick={() => onOverlayChange('classes')}
                  >
                    Classified
                  </button>
                  <button
                    style={{
                      flex: 1,
                      padding: '6px',
                      background: activeOverlay === 'continuous' ? 'var(--accent-blue)' : 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '4px',
                      color: '#fff',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                    }}
                    onClick={() => onOverlayChange('continuous')}
                  >
                    Continuous ΔdB
                  </button>
                  <button
                    style={{
                      flex: 1,
                      padding: '6px',
                      background: activeOverlay === 'none' ? 'var(--accent-blue)' : 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '4px',
                      color: '#fff',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                    }}
                    onClick={() => onOverlayChange('none')}
                  >
                    None
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Step 4: Understand */}
        {activeStep === 'understand' && (
          <>
            <div className="section-card">
              <h4>🎯 Scientific Interpretation</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.8rem' }}>
                <div>
                  <strong style={{ color: 'var(--accent-cyan)' }}>Level 1 — Observed Radar Change:</strong>
                  <p style={{ color: 'var(--text-muted)', marginTop: '2px' }}>
                    {manifest.interpretation.observed_radar_change}
                  </p>
                </div>

                <div>
                  <strong style={{ color: 'var(--accent-orange)' }}>Level 2 — Hypothesized Phenomena:</strong>
                  <ul style={{ paddingLeft: '16px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {manifest.interpretation.hypothesized_surface_phenomena.map((h, i) => (
                      <li key={i} style={{ marginBottom: '4px' }}>{h}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <strong style={{ color: 'var(--accent-green)' }}>Level 3 — Supported Conclusions:</strong>
                  <ul style={{ paddingLeft: '16px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {manifest.interpretation.supported_conclusions.map((c, i) => (
                      <li key={i} style={{ marginBottom: '4px' }}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="section-card">
              <h4>⚠️ Scientific Uncertainty & Ethics</h4>
              <ul style={{ paddingLeft: '16px', color: 'var(--text-muted)', fontSize: '0.78rem', lineHeight: 1.5 }}>
                {manifest.interpretation.uncertainty_notes.map((u, i) => (
                  <li key={i} style={{ marginBottom: '4px' }}>{u}</li>
                ))}
              </ul>
              <div style={{ marginTop: '10px', padding: '8px', background: 'rgba(255,123,0,0.1)', border: '1px solid rgba(255,123,0,0.3)', borderRadius: '6px', fontSize: '0.75rem', color: '#ffaa40' }}>
                <strong>Classification Policy:</strong> Labeled as <em>"Potential Surface Change"</em>. We avoid overclaiming flood disaster without ground-truth stream gauges.
              </div>
            </div>
          </>
        )}

        {/* Research Mode Expansion (Appears in all tabs when Research mode is active) */}
        {mode === 'research' && (
          <div className="section-card" style={{ borderColor: 'var(--accent-cyan)' }}>
            <h4 style={{ color: 'var(--accent-cyan)' }}>🔬 Scientific Audit & Compatibility Gates</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              10 automated physical gates verified before pair comparison:
            </p>

            <table className="gate-table">
              <thead>
                <tr>
                  <th>Gate ID</th>
                  <th>Title</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {gates.map((g) => (
                  <tr key={g.rule_id}>
                    <td><code>{g.rule_id.split('_')[0]}</code></td>
                    <td>{g.title}</td>
                    <td>
                      <span className={`badge badge-${g.status}`}>
                        {g.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ marginTop: '14px', borderTop: '1px solid var(--border-color)', paddingTop: '10px', fontSize: '0.75rem' }}>
              <strong>Log-Ratio Mathematics:</strong>
              <div style={{ padding: '6px', background: 'rgba(0,0,0,0.4)', borderRadius: '4px', margin: '6px 0', fontFamily: 'monospace' }}>
                ΔdB = 10·log₁₀(P_after) − 10·log₁₀(P_before)
              </div>
              <div style={{ color: 'var(--text-dim)' }}>
                Filter: 5×5 boxcar speckle filter on linear power. Resampling: 20m → 100m posting.
              </div>
            </div>

            <div style={{ marginTop: '14px', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
              <strong style={{ fontSize: '0.8rem' }}>📦 Research Downloads (Authentic COG/GeoJSON):</strong>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                <a
                  href={resolveHref('delta_db.tif', manifestUrl)}
                  download
                  style={{ color: 'var(--accent-cyan)', fontSize: '0.75rem', textDecoration: 'none' }}
                >
                  📥 Download delta_db.tif (1.2 MB GeoTIFF)
                </a>
                <a
                  href={resolveHref('aoi.geojson', manifestUrl)}
                  download
                  style={{ color: 'var(--accent-cyan)', fontSize: '0.75rem', textDecoration: 'none' }}
                >
                  📥 Download aoi.geojson (Spatial AOI)
                </a>
                <a
                  href={resolveHref('../../mekong_boundary.geojson', manifestUrl)}
                  download
                  style={{ color: 'var(--accent-cyan)', fontSize: '0.75rem', textDecoration: 'none' }}
                >
                  📥 Download mekong_boundary.geojson (geoBoundaries)
                </a>
                <a
                  href={manifestUrl}
                  download
                  style={{ color: 'var(--accent-cyan)', fontSize: '0.75rem', textDecoration: 'none' }}
                >
                  📥 Download manifest.json (Full Provenance)
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

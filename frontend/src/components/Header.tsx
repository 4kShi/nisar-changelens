import React, { useState } from 'react';
import type { Maturity } from '../types/contract';

interface HeaderProps {
  maturity: Maturity;
  mode: 'explore' | 'research';
  onModeChange: (m: 'explore' | 'research') => void;
}

export const Header: React.FC<HeaderProps> = ({ maturity, mode, onModeChange }) => {
  const [showMaturityModal, setShowMaturityModal] = useState(false);

  return (
    <header className="app-header">
      <div className="brand-section">
        <div className="brand-icon">🛰️</div>
        <div>
          <span className="brand-title">NISAR ChangeLens</span>
          <span className="brand-slogan">Mekong Delta Surface Change Explorer</span>
        </div>
      </div>

      <div className="header-controls">
        <button
          className={`badge badge-${maturity === 'VALIDATED' ? 'pass' : 'provisional'}`}
          onClick={() => setShowMaturityModal(true)}
          title="Click to view scientific maturity details"
          style={{ cursor: 'pointer', border: 'none' }}
        >
          {maturity} DATA
        </button>

        <div className="mode-toggle">
          <button
            className={`mode-btn ${mode === 'explore' ? 'active' : ''}`}
            onClick={() => onModeChange('explore')}
          >
            Explore
          </button>
          <button
            className={`mode-btn ${mode === 'research' ? 'active' : ''}`}
            onClick={() => onModeChange('research')}
          >
            Research
          </button>
        </div>
      </div>

      {showMaturityModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
          onClick={() => setShowMaturityModal(false)}
        >
          <div
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '500px',
              color: 'var(--text-main)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: '12px', color: 'var(--accent-cyan)' }}>
              Scientific Maturity: {maturity}
            </h3>
            <p style={{ fontSize: '0.85rem', marginBottom: '12px', lineHeight: 1.6 }}>
              These observations are official NASA-ISRO NISAR Level-2 GCOV products processed under CRID <strong>P05023</strong>.
              While fully calibrated for polarimetric covariance (RTC gamma0) and passing all 10 project compatibility gates, products with Provisional maturity may undergo minor absolute radiometric refinement in subsequent validated processing pipelines.
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              In accordance with NASA Space Apps Challenge 2026 ethics guidelines, provisional data status is explicitly disclosed to prevent uncalibrated overclaims.
            </p>
            <button
              style={{
                marginTop: '16px',
                padding: '6px 16px',
                background: 'var(--accent-blue)',
                border: 'none',
                borderRadius: '6px',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 600,
              }}
              onClick={() => setShowMaturityModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

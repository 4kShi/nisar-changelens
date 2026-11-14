import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { App } from '../App';

// Mock maplibre-gl so MapStage renders cleanly inside jsdom without WebGL
vi.mock('maplibre-gl', () => {
  class MockMap {
    on() {
      return this;
    }
    remove() {}
    addControl() {}
    resize() {}
    isStyleLoaded() {
      return false;
    }
  }
  class MockNavigationControl {}
  class MockScaleControl {}
  class MockAttributionControl {}
  return {
    Map: MockMap,
    NavigationControl: MockNavigationControl,
    ScaleControl: MockScaleControl,
    AttributionControl: MockAttributionControl,
    setWorkerUrl: vi.fn(),
  };
});

describe('NISAR ChangeLens UX, Visual Change Detection & Scientific Comparison Optimization', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('1. Mode Switching: switches cleanly between Explore and Research & Gates modes and persists in localStorage', () => {
    const { unmount } = render(<App />);

    const exploreBtn = screen.getByTestId('mode-btn-explore');
    const researchBtn = screen.getByTestId('mode-btn-research');
    const modeBanner = screen.getByTestId('mode-context-banner');

    // Defaults to Explore mode
    expect(exploreBtn).toHaveAttribute('aria-pressed', 'true');
    expect(researchBtn).toHaveAttribute('aria-pressed', 'false');
    expect(modeBanner).toHaveClass('banner-explore');
    expect(screen.getByTestId('what-changed-hero')).toBeInTheDocument();

    // Switch to Research & Gates mode
    fireEvent.click(researchBtn);
    expect(researchBtn).toHaveAttribute('aria-pressed', 'true');
    expect(exploreBtn).toHaveAttribute('aria-pressed', 'false');
    expect(modeBanner).toHaveClass('banner-research');
    expect(window.localStorage.getItem('nisar-changelens-mode')).toBe('research');

    // Verify Research mode exposes the 5-step rail navigation and open 10-gate provenance section
    expect(screen.getByTestId('research-step-nav')).toBeInTheDocument();
    expect(screen.getByTestId('provenance-accordion')).toHaveAttribute('open', '');

    // Unmount and remount to verify mode persistence
    unmount();
    render(<App />);
    expect(screen.getByTestId('mode-btn-research')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('mode-context-banner')).toHaveClass('banner-research');
  });

  it('2. Mode Switching State Preservation: preserves AOI, observation pair, and active layer across mode switches', () => {
    render(<App />);

    // Select 'Before' layer in Explore mode
    fireEvent.click(screen.getByTestId('map-view-before'));
    expect(screen.getByTestId('map-view-before')).toHaveClass('selected');

    // Switch to Research mode and verify 'Before' layer and An Giang AOI remain selected
    fireEvent.click(screen.getByTestId('mode-btn-research'));
    expect(screen.getByTestId('map-view-before')).toHaveClass('selected');
    const areaSelect = screen.getByLabelText('Preset Verification Windows') as HTMLSelectElement;
    expect(areaSelect.value).toBe('angiang-screening');
  });

  it('3. Resizable Layout Splitter: resizes sidebar width within min/max bounds and resets to default (440px)', () => {
    render(<App />);

    const splitter = screen.getByTestId('workspace-splitter');

    expect(splitter).toHaveAttribute('aria-valuenow', '440');
    expect(splitter).toHaveAttribute('aria-valuemin', '340');
    expect(splitter).toHaveAttribute('aria-valuemax', '720');

    // Keyboard resize wider (ArrowLeft moves splitter left -> widens right sidebar by +24px)
    fireEvent.keyDown(splitter, { key: 'ArrowLeft' });
    expect(splitter).toHaveAttribute('aria-valuenow', '464');
    expect(window.localStorage.getItem('nisar-changelens-rail-width')).toBe('464');

    // Reset button appears when width !== 440px
    const resetBtn = screen.getByTestId('reset-layout-btn');
    expect(resetBtn).toBeInTheDocument();

    // Keyboard resize narrower (ArrowRight -> narrows right sidebar by -24px)
    fireEvent.keyDown(splitter, { key: 'ArrowRight' });
    expect(splitter).toHaveAttribute('aria-valuenow', '440');

    // Resize wider twice then click Reset Layout button
    fireEvent.keyDown(splitter, { key: 'ArrowLeft' });
    fireEvent.keyDown(splitter, { key: 'ArrowLeft' });
    expect(splitter).toHaveAttribute('aria-valuenow', '488');

    fireEvent.click(screen.getByTestId('reset-layout-btn'));
    expect(splitter).toHaveAttribute('aria-valuenow', '440');
    expect(window.localStorage.getItem('nisar-changelens-rail-width')).toBe('440');
  });

  it('4. Change Visualization: toggles Before, After, Change Map, Swipe, Opacity, and Exploratory Thresholds cleanly', () => {
    render(<App />);

    // Verify primary layer chips on map HUD
    const beforeChip = screen.getByTestId('map-view-before');
    const afterChip = screen.getByTestId('map-view-after');
    const changeChip = screen.getByTestId('map-view-change');
    const swipeChip = screen.getByTestId('map-view-swipe');

    expect(changeChip).toHaveClass('selected');

    fireEvent.click(beforeChip);
    expect(beforeChip).toHaveClass('selected');

    fireEvent.click(afterChip);
    expect(afterChip).toHaveClass('selected');

    fireEvent.click(swipeChip);
    expect(swipeChip).toHaveClass('selected');

    // Switch back to Change Map
    fireEvent.click(changeChip);
    expect(changeChip).toHaveClass('selected');

    // Test opacity slider and reset button
    const opacitySlider = screen.getByLabelText('Raster overlay opacity') as HTMLInputElement;
    expect(opacitySlider.value).toBe('0.9');
    fireEvent.change(opacitySlider, { target: { value: '0.55' } });
    expect(opacitySlider.value).toBe('0.55');
    fireEvent.click(screen.getByText('Reset (90%)'));
    expect(opacitySlider.value).toBe('0.9');

    // Test Exploratory Threshold Selector (Continuous, ±2.0 dB, ±3.0 dB Reference, ±4.0 dB)
    fireEvent.click(screen.getByTestId('threshold-btn-2.0'));
    expect(screen.getAllByText(/1\.26 km²/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/11\.05 km²/).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByTestId('threshold-btn-4.0'));
    expect(screen.getAllByText(/0\.1 km²/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/1\.78 km²/).length).toBeGreaterThan(0);

    // Restore ±3.0 dB Reference Baseline
    fireEvent.click(screen.getByTestId('threshold-btn-3.0'));
    expect(screen.getAllByText(/0\.29 km²/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/4\.39 km²/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/116\.09 km²/).length).toBeGreaterThan(0);
  });

  it('5. Observation Compatibility & Discovery: auto-normalizes date order and handles Level 3, Level 2, and Level 1 pairs', () => {
    render(<App />);

    // Verify Compatible Pair Finder drawer is rendered
    expect(screen.getByTestId('compatible-pairs-drawer')).toBeInTheDocument();
    expect(
      screen.getByTestId('load-pair-G4404304390-ASF_G4410154671-ASF')
    ).toBeInTheDocument();

    // Select the Level 2 Geometrically Compatible Validated pair on Track 148 Frame 84
    const selectLevel2Btn = screen.getByTestId(
      'load-pair-G4410568072-ASF_G4410081861-ASF'
    );
    fireEvent.click(selectLevel2Btn);

    // Verify Level 2 badge and plain-language blocked state appear without crashing
    expect(screen.getByTestId('compat-level-badge')).toHaveTextContent(
      '◐ Geometrically Compatible Candidate (Level 2 — Catalog Only)'
    );
    expect(screen.getByTestId('comparison-blocked-state')).toBeInTheDocument();

    // Restore Verified An Giang pair with 1 click
    fireEvent.click(screen.getByTestId('load-pair-G4404304390-ASF_G4410154671-ASF'));
    expect(screen.getByTestId('compat-level-badge')).toHaveTextContent(
      '✓ Scientifically Comparable Pair (Level 3 Verified)'
    );

    // Test automatic chronological normalization in Explore mode when selecting an earlier date in the After dropdown
    const afterSelect = screen.getByTestId('select-after-granule') as HTMLSelectElement;
    const beforeSelect = screen.getByTestId('select-before-granule') as HTMLSelectElement;

    // Select Nov 03 in Before and Oct 22 in After -> Explore mode automatically normalizes to Oct 22 -> Nov 03
    fireEvent.change(beforeSelect, { target: { value: 'G4410154671-ASF' } });
    fireEvent.change(afterSelect, { target: { value: 'G4404304390-ASF' } });
    expect(beforeSelect.value).toBe('G4404304390-ASF');
    expect(afterSelect.value).toBe('G4410154671-ASF');
    expect(screen.getByTestId('auto-order-notice')).toBeInTheDocument();
  });
});

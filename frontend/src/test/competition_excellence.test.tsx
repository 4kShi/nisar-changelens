import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { App } from '../App';
import {
  EVIDENCE_STATES,
  GUIDED_TOUR_ACTS,
  STUDY_AREAS,
  evaluatePairCompatibility,
  getAreaEvidenceStatus,
} from '../data/study';
import { DISCOVERED_GRANULES } from '../data/catalogInventory';
import {
  buildScreeningReceiptPayload,
  formatScreeningReceiptMarkdown,
} from '../data/receipt';

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

describe('Phase 5B & 5C: 5 Evidence States, 6-Act Guided Tour & Screening Receipt', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('1. Defines and surfaces all 5 distinct Evidence States without conflating coverage and comparison', () => {
    expect(EVIDENCE_STATES.map((s) => s.id)).toEqual([
      'VERIFIED',
      'COMPUTED',
      'CANDIDATE',
      'INFERRED',
      'UNAVAILABLE',
    ]);

    expect(getAreaEvidenceStatus('angiang-screening', true)).toEqual({
      primaryState: 'VERIFIED',
      coverageState: 'VERIFIED',
      comparisonState: 'COMPUTED',
    });

    // Đồng Tháp 0% off-swath: HDF5 mask inspection is VERIFIED (0%), but comparison is UNAVAILABLE
    expect(getAreaEvidenceStatus('dongthap-pilot', false)).toEqual({
      primaryState: 'VERIFIED',
      coverageState: 'VERIFIED',
      comparisonState: 'UNAVAILABLE',
    });

    // Mekong regional view: Catalog footprint is CANDIDATE, comparison is UNAVAILABLE
    expect(getAreaEvidenceStatus('mekong', false)).toEqual({
      primaryState: 'CANDIDATE',
      coverageState: 'UNAVAILABLE',
      comparisonState: 'UNAVAILABLE',
    });

    render(<App />);

    const statusBar = screen.getByTestId('area-evidence-status-bar');
    expect(statusBar).toHaveTextContent('Verified');
    expect(statusBar).toHaveTextContent('Computed');

    const ledger = screen.getByTestId('evidence-states-ledger');
    expect(ledger).toBeInTheDocument();
    expect(screen.getByTestId('evidence-card-verified')).toBeInTheDocument();
    expect(screen.getByTestId('evidence-card-computed')).toBeInTheDocument();
    expect(screen.getByTestId('evidence-card-candidate')).toBeInTheDocument();
    expect(screen.getByTestId('evidence-card-inferred')).toBeInTheDocument();
    expect(screen.getByTestId('evidence-card-unavailable')).toBeInTheDocument();

    // Switch to Vietnamese and ensure all 5 labels switch cleanly
    fireEvent.click(screen.getByTestId('lang-btn-vi'));
    expect(statusBar).toHaveTextContent('Đã xác thực');
    expect(statusBar).toHaveTextContent('Đã tính toán');
    expect(screen.getByTestId('evidence-card-inferred')).toHaveTextContent('Suy luận vật lý');
  });

  it('2. Executes all 6 acts of the Bilingual Judge Guided Tour and restores clean browsing on exit', () => {
    expect(GUIDED_TOUR_ACTS.length).toBe(6);
    render(<App />);

    expect(screen.queryByTestId('guided-tour-panel')).not.toBeInTheDocument();

    // Start Tour -> Act 1: Mekong Overview
    fireEvent.click(screen.getByTestId('start-tour-btn'));
    const panel = screen.getByTestId('guided-tour-panel');
    expect(panel).toBeInTheDocument();
    expect(panel).toHaveTextContent('Act 1');
    expect(
      (screen.getByLabelText('Preset Verification Windows') as HTMLSelectElement).value
    ).toBe('mekong');

    // Act 2: Before SAR (Oct 22 in An Giang)
    fireEvent.click(screen.getByTestId('tour-next-btn'));
    expect(panel).toHaveTextContent('Act 2');
    expect(
      (screen.getByLabelText('Preset Verification Windows') as HTMLSelectElement).value
    ).toBe('angiang-screening');
    expect(screen.getByTestId('map-view-before')).toHaveClass('selected');

    // Act 3: Đồng Tháp 0% Off-Swath Blocked
    fireEvent.click(screen.getByTestId('tour-next-btn'));
    expect(panel).toHaveTextContent('Act 3');
    expect(
      (screen.getByLabelText('Preset Verification Windows') as HTMLSelectElement).value
    ).toBe('dongthap-pilot');
    expect(screen.getByTestId('comparison-blocked-state')).toBeInTheDocument();

    // Act 4: An Giang Swipe & +0.417 dB
    fireEvent.click(screen.getByTestId('tour-next-btn'));
    expect(panel).toHaveTextContent('Act 4');
    expect(screen.getByTestId('map-view-swipe')).toHaveClass('selected');
    expect(screen.getByTestId('what-changed-hero')).toBeInTheDocument();

    // Act 5: Research Mode + Interpret Guardrail + 5 Evidence States
    fireEvent.click(screen.getByTestId('tour-next-btn'));
    expect(panel).toHaveTextContent('Act 5');
    expect(screen.getByTestId('mode-btn-research')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('interpret-accordion')).toHaveAttribute('open', '');

    // Act 6: Gates & Receipt Export
    fireEvent.click(screen.getByTestId('tour-next-btn'));
    expect(panel).toHaveTextContent('Act 6');
    expect(screen.getByTestId('provenance-accordion')).toHaveAttribute('open', '');
    expect(screen.getByTestId('provenance-receipt-panel')).toBeInTheDocument();

    // Switch to Vietnamese mid-tour
    fireEvent.click(screen.getByTestId('lang-btn-vi'));
    expect(panel).toHaveTextContent('Chặng 6');
    expect(panel).toHaveTextContent('Phiếu xuất kiểm chứng');

    // Finish Tour restores clean unfiltered sidebar
    fireEvent.click(screen.getByTestId('tour-next-btn'));
    expect(screen.queryByTestId('guided-tour-panel')).not.toBeInTheDocument();
    expect(screen.getByTestId('section-location')).toBeInTheDocument();
    expect(screen.getByTestId('section-compare')).toBeInTheDocument();
  });

  it('3. Builds deterministic Screening & Provenance Receipts without fabricated metrics for Verified vs Blocked AOIs', () => {
    const beforeG = DISCOVERED_GRANULES.find((g) => g.conceptId === 'G4404304390-ASF');
    const afterG = DISCOVERED_GRANULES.find((g) => g.conceptId === 'G4410154671-ASF');
    const agArea = STUDY_AREAS.find((a) => a.id === 'angiang-screening')!;
    const dtArea = STUDY_AREAS.find((a) => a.id === 'dongthap-pilot')!;

    // A) Verified An Giang Pair
    const agCompat = evaluatePairCompatibility(
      'G4404304390-ASF',
      'G4410154671-ASF',
      'angiang-screening'
    );
    const agPayload = buildScreeningReceiptPayload({
      areaId: 'angiang-screening',
      displayArea: agArea,
      beforeGranule: beforeG,
      afterGranule: afterG,
      compatibility: agCompat,
      thresholdId: '3.0',
      language: 'en',
      mode: 'research',
      generatedAtUtc: '2026-11-15T00:00:00.000Z',
    });

    expect(agPayload.receipt_schema).toBe('nisar-changelens-receipt/v1');
    expect(agPayload.evidence_states.active_coverage_state).toBe('VERIFIED');
    expect(agPayload.evidence_states.active_comparison_state).toBe('COMPUTED');
    expect(agPayload.verified_quantitative_metrics?.delta_db.mean).toBe(0.417);
    expect(agPayload.provenance_and_byte_budget.combined_bytes_used).toBe(33812717);
    expect(agPayload.provenance_and_byte_budget.verified_release_checksums_sha256?.length).toBe(11);
    expect(agPayload.interpretation_and_limitations.fabricated_confidence_score).toBeNull();

    const agMarkdown = formatScreeningReceiptMarkdown(agPayload, 'en');
    expect(agMarkdown).toContain('+0.417 dB');
    expect(agMarkdown).toContain('33,812,717');
    expect(agMarkdown).toContain('Not an operational flood warning');

    // B) Blocked Đồng Tháp 0% Diagnostic Pair — zero invented metrics!
    const dtCompat = evaluatePairCompatibility(
      'G4404304390-ASF',
      'G4410154671-ASF',
      'dongthap-pilot'
    );
    const dtPayload = buildScreeningReceiptPayload({
      areaId: 'dongthap-pilot',
      displayArea: dtArea,
      beforeGranule: beforeG,
      afterGranule: afterG,
      compatibility: dtCompat,
      thresholdId: 'continuous',
      language: 'vi',
      mode: 'explore',
      generatedAtUtc: '2026-11-15T00:00:00.000Z',
    });

    expect(dtPayload.evidence_states.active_coverage_state).toBe('VERIFIED');
    expect(dtPayload.evidence_states.active_comparison_state).toBe('UNAVAILABLE');
    expect(dtPayload.verified_quantitative_metrics).toBeNull();
    expect(dtPayload.selected_pair.all_gates_passed).toBe(false);
    expect(dtPayload.selected_pair.failed_gates_count).toBeGreaterThanOrEqual(2);

    const dtMarkdown = formatScreeningReceiptMarkdown(dtPayload, 'vi');
    expect(dtMarkdown).toContain('UNAVAILABLE');
    expect(dtMarkdown).not.toContain('+0.417 dB');
  });

  it('4. Triggers deterministic Markdown and JSON Receipt downloads from UI buttons cleanly', () => {
    const createObjectURLSpy = vi.fn(() => 'blob:mock-receipt-url');
    const revokeObjectURLSpy = vi.fn();
    Object.defineProperty(URL, 'createObjectURL', {
      value: createObjectURLSpy,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      value: revokeObjectURLSpy,
      configurable: true,
      writable: true,
    });
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    render(<App />);

    fireEvent.click(screen.getByTestId('compare-receipt-md'));
    expect(createObjectURLSpy).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('compare-receipt-status')).toHaveTextContent(
      'nisar-changelens-angiang-screening-2026-10-22-to-2026-11-03.md'
    );

    fireEvent.click(screen.getByTestId('compare-receipt-json'));
    expect(createObjectURLSpy).toHaveBeenCalledTimes(2);
    expect(screen.getByTestId('compare-receipt-status')).toHaveTextContent(
      'nisar-changelens-angiang-screening-2026-10-22-to-2026-11-03.json'
    );

    // Switch to Đồng Tháp and trigger blocked receipt export
    fireEvent.change(screen.getByLabelText('Preset Verification Windows'), {
      target: { value: 'dongthap-pilot' },
    });
    fireEvent.click(screen.getByTestId('blocked-receipt-md'));
    expect(createObjectURLSpy).toHaveBeenCalledTimes(3);
    expect(screen.getByTestId('blocked-receipt-status')).toHaveTextContent(
      'nisar-changelens-dongthap-pilot-2026-10-22-to-2026-11-03.md'
    );

    clickSpy.mockRestore();
  });
});

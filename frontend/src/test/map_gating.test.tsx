import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { App } from '../App';
import { discoverCompatiblePairs } from '../data/study';

// A maplibre-gl mock that records layers and their layout visibility, and lets
// the test fire the 'load' event (the simpler mocks elsewhere never load).
const mapState = vi.hoisted(() => ({
  instance: null as null | {
    handlers: Record<string, Array<(e?: unknown) => unknown>>;
    layers: Map<string, { visibility: string }>;
  },
}));

vi.mock('maplibre-gl', () => {
  class MockMap {
    handlers: Record<string, Array<(e?: unknown) => unknown>> = {};
    layers = new Map<string, { visibility: string }>();
    sources = new Map<string, { setData: () => void }>();
    constructor() {
      mapState.instance = this;
    }
    on(event: string, handler: (e?: unknown) => unknown) {
      (this.handlers[event] ??= []).push(handler);
      return this;
    }
    addSource(id: string) {
      this.sources.set(id, { setData: () => {} });
    }
    addLayer(spec: { id: string; layout?: { visibility?: string } }) {
      this.layers.set(spec.id, { visibility: spec.layout?.visibility ?? 'visible' });
    }
    getLayer(id: string) {
      return this.layers.get(id);
    }
    getSource(id: string) {
      return this.sources.get(id);
    }
    setLayoutProperty(id: string, prop: string, value: string) {
      const layer = this.layers.get(id);
      if (layer && prop === 'visibility') layer.visibility = value;
    }
    setPaintProperty() {}
    setFilter() {}
    flyTo() {}
    queryRenderedFeatures() {
      return [];
    }
    remove() {}
    addControl() {}
    resize() {}
  }
  class MockControl {}
  return {
    Map: MockMap,
    NavigationControl: MockControl,
    ScaleControl: MockControl,
    AttributionControl: MockControl,
    setWorkerUrl: vi.fn(),
  };
});

const RASTER_IDS = [
  'raster-before_db',
  'raster-after_db',
  'raster-change_db',
  'raster-change_classes',
  'raster-change_classes_2db',
  'raster-change_classes_4db',
  'raster-mask_common_valid',
];

function visibleRasters(): string[] {
  const layers = mapState.instance!.layers;
  return RASTER_IDS.filter((id) => layers.get(id)?.visibility === 'visible');
}

async function renderAndLoadMap() {
  render(<App />);
  await act(async () => {
    await Promise.all((mapState.instance!.handlers.load ?? []).map((h) => h()));
  });
}

describe('Map raster gating', () => {
  beforeEach(() => {
    window.localStorage.clear();
    mapState.instance = null;
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => ({ type: 'FeatureCollection', features: [] }),
      }))
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows only the selected Change Map layer after the map loads (no stacked rasters)', async () => {
    await renderAndLoadMap();

    expect(visibleRasters()).toEqual(['raster-change_db']);
    const layers = mapState.instance!.layers;
    expect(layers.get('custom-bbox-fill')?.visibility).toBe('none');
    expect(layers.get('custom-bbox-line')?.visibility).toBe('none');
  });

  it('hides the verified rasters and verified badges when the selected pair fails the gates', async () => {
    await renderAndLoadMap();
    expect(screen.getByTestId('hud-tier-pill')).toHaveTextContent('TIER 4: VERIFIED PAIR');
    expect(screen.queryByTestId('pair-blocked-banner')).not.toBeInTheDocument();

    const unverified = discoverCompatiblePairs('angiang-screening').find(
      (p) => !p.hasLocalVerifiedRasterInAnGiang
    );
    expect(unverified).toBeDefined();
    fireEvent.click(screen.getByTestId(`load-pair-${unverified!.id}`));

    expect(visibleRasters()).toEqual([]);
    expect(screen.getByTestId('pair-blocked-banner')).toBeInTheDocument();
    expect(screen.getByTestId('hud-tier-pill')).toHaveTextContent('SELECTED PAIR NOT VERIFIED');
    expect(screen.getByTestId('area-evidence-badge')).toHaveTextContent(
      'SELECTED PAIR PENDING VALIDATION'
    );
    expect(screen.queryByTestId('map-view-before')).not.toBeInTheDocument();

    // Restoring the verified pair from the map banner brings the Change Map back.
    fireEvent.click(within(screen.getByTestId('pair-blocked-banner')).getByRole('button'));
    expect(visibleRasters()).toEqual(['raster-change_db']);
    expect(screen.queryByTestId('pair-blocked-banner')).not.toBeInTheDocument();
  });
});

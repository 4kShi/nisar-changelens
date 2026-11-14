import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { App } from '../App';
import { discoverCompatiblePairs } from '../data/study';

// A maplibre-gl mock that records layers and their layout visibility, and lets
// the test fire the 'load' event (the simpler mocks elsewhere never load).
type MockMapInstance = {
  options: { style?: { layers?: Array<{ id: string }> } };
  handlers: Record<string, Array<(e?: unknown) => unknown>>;
  layers: Map<string, { visibility: string }>;
  removed: boolean;
};

const mapState = vi.hoisted(() => ({
  instances: [] as MockMapInstance[],
  get instance(): MockMapInstance | null {
    return this.instances[0] ?? null;
  },
}));

vi.mock('maplibre-gl', () => {
  class MockMap {
    options: MockMapInstance['options'];
    handlers: Record<string, Array<(e?: unknown) => unknown>> = {};
    layers = new Map<string, { visibility: string }>();
    sources = new Map<string, { setData: () => void }>();
    removed = false;
    constructor(options: MockMapInstance['options']) {
      this.options = options;
      mapState.instances.push(this);
    }
    on(event: string, handler: (e?: unknown) => unknown) {
      (this.handlers[event] ??= []).push(handler);
      return this;
    }
    off(event: string, handler: (e?: unknown) => unknown) {
      this.handlers[event] = (this.handlers[event] ?? []).filter((h) => h !== handler);
      return this;
    }
    getCenter() {
      return { lng: 105, lat: 10.5 };
    }
    getZoom() {
      return 10.4;
    }
    getBearing() {
      return 0;
    }
    getPitch() {
      return 0;
    }
    jumpTo() {}
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
    remove() {
      this.removed = true;
    }
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
    mapState.instances.length = 0;
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

  it('swipe mode puts BEFORE on the main map and a clipped AFTER-only map on the right', async () => {
    await renderAndLoadMap();
    fireEvent.click(screen.getByTestId('map-view-swipe'));

    // Main map shows only BEFORE; the right-hand swipe pane holds AFTER plus vector
    // boundary overlays above it so administrative/study outlines remain visible.
    expect(visibleRasters()).toEqual(['raster-before_db']);
    expect(mapState.instances).toHaveLength(2);
    const compare = mapState.instances[1];
    const compareLayers = (compare.options.style?.layers ?? []) as Array<{
      id: string;
      type?: string;
    }>;
    expect(
      compareLayers.filter((l) => l.type === 'raster').map((l) => l.id)
    ).toEqual(['swipe-after']);
    expect(compareLayers[0]?.id).toBe('swipe-after');
    expect(compareLayers.map((l) => l.id)).toEqual([
      'swipe-after',
      'province-lines',
      'mekong-boundary-line',
      'granule-footprints-line',
      'angiang-bbox-line',
      'dongthap-bbox-line',
      'custom-bbox-line',
    ]);

    // The AFTER pane is clipped at the divider, which is keyboard operable.
    const pane = screen.getByTestId('swipe-after-pane');
    const divider = screen.getByTestId('swipe-divider');
    expect(pane.style.clipPath).toBe('inset(0px 0px 0px 50%)');
    expect(divider).toHaveAttribute('aria-valuenow', '50');
    fireEvent.keyDown(divider, { key: 'ArrowRight' });
    expect(pane.style.clipPath).toBe('inset(0px 0px 0px 52%)');
    fireEvent.keyDown(divider, { key: 'Home' });
    expect(divider).toHaveAttribute('aria-valuenow', '0');

    // Leaving swipe mode tears the overlay map down.
    fireEvent.click(screen.getByTestId('map-view-before'));
    expect(compare.removed).toBe(true);
    expect(screen.queryByTestId('swipe-divider')).not.toBeInTheDocument();
  });

  it('does not claim the verified result in the title, caption or evidence ladder for a blocked pair', () => {
    render(<App initialMode="research" />);
    const tierRow = (title: string) => screen.getByText(title).closest('.tier-row');
    const caption = () => document.querySelector('.map-caption') as HTMLElement;

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('(Verified Pair)');
    expect(tierRow('4. Scientifically Comparable Pair')).toHaveClass('tier-passed');

    const unverified = discoverCompatiblePairs('angiang-screening').find(
      (p) => !p.hasLocalVerifiedRasterInAnGiang
    );
    fireEvent.click(screen.getByTestId(`load-pair-${unverified!.id}`));

    expect(screen.getByRole('heading', { level: 1 })).not.toHaveTextContent('Verified Pair');
    expect(caption()).toHaveTextContent('Selected pair not verified');
    expect(caption()).not.toHaveTextContent('+0.417');
    expect(tierRow('4. Scientifically Comparable Pair')).not.toHaveClass('tier-passed');
    expect(tierRow('3. Valid Raster Coverage')).not.toHaveClass('tier-passed');
    expect(screen.queryByText(/99\.91% valid/)).not.toBeInTheDocument();

    fireEvent.click(within(screen.getByTestId('pair-blocked-banner')).getByRole('button'));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('(Verified Pair)');
    expect(tierRow('4. Scientifically Comparable Pair')).toHaveClass('tier-passed');
  });

  it('does not offer the swipe for a pair that failed the gates', async () => {
    await renderAndLoadMap();
    fireEvent.click(screen.getByTestId('map-view-swipe'));
    const unverified = discoverCompatiblePairs('angiang-screening').find(
      (p) => !p.hasLocalVerifiedRasterInAnGiang
    );
    fireEvent.click(screen.getByTestId(`load-pair-${unverified!.id}`));

    expect(screen.queryByTestId('swipe-divider')).not.toBeInTheDocument();
    expect(visibleRasters()).toEqual([]);
    expect(mapState.instances[1].removed).toBe(true);
  });

  it('blocks cross-track pairs (T148 vs T155) and clarifies reference archive provenance', async () => {
    await renderAndLoadMap();
    fireEvent.click(screen.getByTestId('mode-btn-research'));

    // Cross-track / cross-direction pair: Track 148 DESC (G4404304390-ASF) vs Track 155 ASC (G4404063067-ASF)
    fireEvent.change(screen.getByTestId('select-after-granule'), {
      target: { value: 'G4404063067-ASF' },
    });

    expect(visibleRasters()).toEqual([]);
    expect(screen.getByTestId('blocked-archive-notice')).toBeInTheDocument();
  });

  it('blocks CRID-mismatched repeat-pass pair on Track 148 Frame 83 (P05023 vs P05036)', async () => {
    await renderAndLoadMap();
    fireEvent.click(screen.getByTestId('mode-btn-research'));

    // Same Track 148 Frame 83 DESCENDING, but Oct 10 PROVISIONAL P05023 vs Nov 03 VALIDATED P05036
    fireEvent.change(screen.getByTestId('select-before-granule'), {
      target: { value: 'G4360284951-ASF' },
    });

    expect(visibleRasters()).toEqual([]);
    expect(screen.getByTestId('hud-tier-pill')).toHaveTextContent(
      /Selected pair not verified/i
    );
    expect(screen.getByTestId('area-evidence-badge')).toHaveTextContent(
      /Pending validation/i
    );
    expect(screen.getByTestId('blocked-archive-notice')).toBeInTheDocument();
  });
});

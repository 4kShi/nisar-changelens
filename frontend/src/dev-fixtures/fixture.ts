/**
 * DEV FIXTURE — "FIXTURE – not a result".
 *
 * Loaded ONLY when VITE_USE_FIXTURE=1 in `vite dev` (vite.config.ts refuses to
 * build with it, and the import in src/data/source.ts sits behind a statically
 * replaced env flag so it is tree-shaken from production bundles).
 *
 * Every image is generated in the browser at runtime and carries the watermark
 * "FIXTURE – not a result". Numbers below are placeholders, NOT measurements.
 */
import type { Catalog, Manifest } from '../types/contract';

export const FIXTURE_WATERMARK = 'FIXTURE – not a result';

const AOI: [number, number, number, number] = [105.35, 10.45, 105.95, 10.95];

/** Approximate, hand-drawn Mekong Delta outline for UI development only. */
const DELTA_OUTLINE = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Mekong Delta (FIXTURE approximate outline)' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [104.45, 10.55], [104.9, 10.95], [105.3, 11.0], [105.95, 11.1], [106.5, 10.95],
          [106.85, 10.4], [106.75, 9.85], [106.3, 9.5], [105.6, 8.9], [105.0, 8.55],
          [104.75, 8.7], [104.8, 9.4], [104.85, 9.9], [104.45, 10.55],
        ]],
      },
    },
  ],
};

const AOI_GEOJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'FIXTURE AOI' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[AOI[0], AOI[1]], [AOI[2], AOI[1]], [AOI[2], AOI[3]], [AOI[0], AOI[3]], [AOI[0], AOI[1]]]],
      },
    },
  ],
};

type Kind = 'before' | 'after' | 'change' | 'class';

function makePng(kind: Kind): string {
  const W = 256;
  const H = 256;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d');
  if (!ctx) return '';
  for (let y = 0; y < H; y += 8) {
    for (let x = 0; x < W; x += 8) {
      const v = Math.sin(x / 23 + (kind === 'after' ? 1.3 : 0)) * Math.cos(y / 31) * 0.5 + 0.5;
      if (kind === 'before' || kind === 'after') {
        const g = Math.round(40 + v * 180);
        ctx.fillStyle = `rgb(${g},${g},${g})`;
      } else if (kind === 'change') {
        const d = v * 2 - 1;
        ctx.fillStyle = d < 0 ? `rgba(33,102,172,${-d})` : `rgba(178,24,43,${d})`;
      } else {
        ctx.fillStyle = v < 0.25 ? 'rgba(33,102,172,0.9)' : v > 0.75 ? 'rgba(178,24,43,0.9)' : 'rgba(0,0,0,0)';
      }
      ctx.fillRect(x, y, 8, 8);
    }
  }
  ctx.save();
  ctx.translate(W / 2, H / 2);
  ctx.rotate(-Math.PI / 8);
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'center';
  ctx.lineWidth = 4;
  ctx.strokeStyle = 'rgba(0,0,0,0.85)';
  ctx.fillStyle = '#ffeb3b';
  for (const dy of [-70, 0, 70]) {
    ctx.strokeText(FIXTURE_WATERMARK, 0, dy);
    ctx.fillText(FIXTURE_WATERMARK, 0, dy);
  }
  ctx.restore();
  return c.toDataURL('image/png');
}

function buildCatalog(): Catalog {
  return {
    schema_version: '1.0',
    generated_at: '2026-11-14T00:00:00Z',
    project: {
      name: 'NISAR ChangeLens (FIXTURE)',
      slogan: 'See Change. Understand Earth.',
      region_scope: 'Mekong Delta, Viet Nam',
    },
    boundary: {
      href: 'boundary.geojson',
      source: 'FIXTURE hand-drawn outline (not geoBoundaries)',
      license: 'n/a — development fixture',
      approximate: true,
    },
    regions: [
      {
        region_id: 'dong-thap-muoi',
        name: 'Dong Thap Muoi (Plain of Reeds) — FIXTURE',
        name_vi: 'Đồng Tháp Mười',
        selection_status: 'provisional',
        bounds: AOI,
        summary: `${FIXTURE_WATERMARK}. Placeholder region card used to develop the interface.`,
        observations: [
          { observation_id: 'fixture-before', date: '2026-10-10T22:27:32Z', maturity: 'PROVISIONAL' },
          { observation_id: 'fixture-after', date: '2026-10-22T22:27:32Z', maturity: 'PROVISIONAL' },
        ],
        comparison: {
          status: 'available',
          release_id: 'fixture-release',
          manifest_href: 'releases/fixture-release/manifest.json',
          compatibility_status: 'pass',
          maturity_label: 'PROVISIONAL',
          reason: null,
        },
      },
      {
        region_id: 'tram-chim',
        name: 'Tram Chim National Park — FIXTURE (no pair)',
        name_vi: 'VQG Tràm Chim',
        selection_status: 'fallback',
        bounds: [105.45, 10.65, 105.6, 10.75],
        summary: `${FIXTURE_WATERMARK}. Exercises the honest "comparison unavailable" state.`,
        observations: [],
        comparison: {
          status: 'unavailable',
          release_id: null,
          manifest_href: null,
          compatibility_status: 'unknown',
          maturity_label: 'UNKNOWN',
          reason: 'FIXTURE: no compatible acquisition pair published for this region.',
        },
      },
    ],
  };
}

function obs(role: 'before' | 'after', start: string): Manifest['observations'][number] {
  return {
    observation_id: `fixture-${role}`,
    role,
    collection: { short_name: 'FIXTURE_COLLECTION', concept_id: null, version: null, maturity: 'PROVISIONAL' },
    granule: { provider: 'FIXTURE', granule_id: `FIXTURE_GRANULE_${role.toUpperCase()}_not_a_result`, concept_id: null, size_bytes: null },
    acquisition: {
      start_utc: start,
      end_utc: start,
      absolute_orbit: null,
      relative_track: 155,
      frame: 6,
      pass_direction: 'ASCENDING',
      look_direction: null,
      cycle: null,
    },
    processing: { product_type: 'GCOV', level: 'L2', crid: 'FIXTURE', product_version: null, processing_datetime: null, software_version: null },
    measurement: {
      band: 'L',
      frequency: 'A',
      polarization_term: 'HHHH',
      hdf5_variable: '/science/LSAR/GCOV/grids/frequencyA/HHHH',
      quantity: 'gamma0 backscatter (RTC, diagonal covariance)',
      units: 'linear power (1)',
      display_units: 'dB',
      fill_value: 'NaN',
    },
    grid: { crs: 'EPSG:32648', affine: [80, 0, 0, 0, -80, 0], width: 512, height: 512, spacing_m: [80, 80], pixel_convention: 'corner', bounds_lonlat: AOI },
    validity: { fill: 'NaN', mask_variable: null, mask_semantics: null, number_of_looks: null },
    provenance: { source_url: null, retrieved_at: null, sha256: null, citation: 'FIXTURE – not a result' },
    missing_fields: ['absolute_orbit', 'look_direction', 'cycle'],
  };
}

function buildManifest(img: Record<Kind, string>): Manifest {
  const gateNames = [
    'G01_identity_maturity', 'G02_processing_crid', 'G03_quantity_units', 'G04_frequency_polarization',
    'G05_orbit_geometry', 'G06_crs_grid_alignment', 'G07_coverage_overlap', 'G08_mask_nodata',
    'G09_radiometric_quality', 'G10_effective_resolution',
  ];
  return {
    schema_version: '1.0',
    release_id: 'fixture-release',
    status: 'available',
    created_at: '2026-11-14T00:00:00Z',
    aoi: { region_id: 'dong-thap-muoi', name: 'Dong Thap Muoi — FIXTURE', bounds: AOI, geometry_href: 'aoi.geojson', boundary_provenance: 'FIXTURE' },
    observations: [obs('before', '2026-10-10T22:27:32Z'), obs('after', '2026-10-22T22:27:32Z')],
    compatibility: {
      status: 'pass',
      reviewer: 'FIXTURE',
      checks: gateNames.map((id, i) => ({
        rule_id: id,
        title: id.replace(/^G\d+_/, '').replace(/_/g, ' '),
        status: i === 8 ? 'unknown' : 'pass',
        blocking: i !== 8,
        observed_values: { fixture: true },
        evidence_refs: [],
        reason: `${FIXTURE_WATERMARK}`,
        required_action: null,
      })),
    },
    analysis: {
      method: 'dB difference (log-ratio) baseline',
      formula: 'ΔdB = 10·log10(P_after) − 10·log10(P_before)',
      version: 'fixture',
      parameters: { speckle_filter: 'FIXTURE', resampling: 'FIXTURE', decrease_threshold_db: -3, increase_threshold_db: 3 },
      stats: {
        denominator_description: 'FIXTURE placeholder denominator (not real pixels)',
        total_pixels_in_aoi: 1000,
        valid_pixels: 900,
        excluded: { nan_or_fill: 60, non_positive: 40 },
        delta_db: { mean: 0, median: 0, p05: -3, p95: 3, std: 1 },
        classes: { decrease: 100, no_significant_change: 700, increase: 100 },
        pixel_area_m2: 6400,
      },
    },
    assets: [
      { asset_id: 'b', role: 'before_db_image', href: img.before, mime: 'image/png', bytes: null, sha256: null, source_observation_ids: ['fixture-before'], purpose: 'display', bounds: AOI },
      { asset_id: 'a', role: 'after_db_image', href: img.after, mime: 'image/png', bytes: null, sha256: null, source_observation_ids: ['fixture-after'], purpose: 'display', bounds: AOI },
      { asset_id: 'c', role: 'change_image', href: img.change, mime: 'image/png', bytes: null, sha256: null, source_observation_ids: ['fixture-before', 'fixture-after'], purpose: 'display', bounds: AOI },
      { asset_id: 'k', role: 'change_class_image', href: img.class, mime: 'image/png', bytes: null, sha256: null, source_observation_ids: ['fixture-before', 'fixture-after'], purpose: 'display', bounds: AOI },
    ],
    visualization: {
      display_crs: 'EPSG:3857',
      backscatter_stretch: { min_db: -25, max_db: 0, colormap: 'gray' },
      change_stretch: { min_db: -6, max_db: 6, colormap: 'RdBu' },
      legends: [
        { id: 'backscatter', title: 'γ⁰ HH (dB) — FIXTURE', items: [{ color: '#282828', label: '−25 dB' }, { color: '#dcdcdc', label: '0 dB' }] },
        { id: 'change', title: 'ΔdB — FIXTURE', items: [{ color: '#2166ac', label: '≤ −6 dB (decrease)' }, { color: '#f7f7f7', label: '0' }, { color: '#b2182b', label: '≥ +6 dB (increase)' }] },
        { id: 'change_class', title: 'Change class — FIXTURE', items: [{ color: '#2166ac', label: 'Backscatter decrease' }, { color: '#b2182b', label: 'Backscatter increase' }] },
      ],
    },
    interpretation: {
      observed_radar_change: `${FIXTURE_WATERMARK}: placeholder observed-change text.`,
      hypothesized_surface_phenomena: ['FIXTURE hypothesis A', 'FIXTURE alternative B'],
      supported_conclusions: [],
      evidence_refs: [],
      uncertainty_notes: ['FIXTURE uncertainty note'],
      public_label: 'Potential Surface Change',
    },
    limitations: ['This is a development fixture. Nothing shown is a result.'],
    provenance: { pipeline_version: 'fixture', git_commit: null, environment: {}, commands: [] },
    reviews: { science_review: null, redistribution_review: null },
  };
}

/** Returns a fetch implementation serving the fixture and the catalog URL to start from. */
export function createFixtureSource(): { catalogUrl: string; fetchImpl: typeof fetch } {
  const base = new URL(`${import.meta.env.BASE_URL}__fixture__/data/v1/`, window.location.href).toString();
  const img: Record<Kind, string> = {
    before: makePng('before'),
    after: makePng('after'),
    change: makePng('change'),
    class: makePng('class'),
  };
  const files: Record<string, unknown> = {
    [`${base}catalog.json`]: buildCatalog(),
    [`${base}boundary.geojson`]: DELTA_OUTLINE,
    [`${base}releases/fixture-release/manifest.json`]: buildManifest(img),
    [`${base}releases/fixture-release/aoi.geojson`]: AOI_GEOJSON,
  };
  const fetchImpl = (async (input: RequestInfo | URL) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    await new Promise((r) => setTimeout(r, 150));
    const body = files[url];
    if (body === undefined) return new Response('not found', { status: 404 });
    return new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }) as typeof fetch;
  return { catalogUrl: `${base}catalog.json`, fetchImpl };
}

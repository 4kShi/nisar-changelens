/**
 * Runtime validation of the static data contract (types in ../types/contract.ts).
 * We validate structure defensively: the app must never show fabricated or
 * half-understood data. Unknown major schema versions are rejected.
 */
import type { Asset, AssetRole, Catalog, CatalogRegion, Manifest } from '../types/contract';

export const SUPPORTED_MAJOR = 1;

export type DataErrorKind =
  | 'deployment' // 401/403/404: the static deployment is missing files or misconfigured
  | 'http'
  | 'network'
  | 'parse'
  | 'schema_version'
  | 'schema';

export class DataError extends Error {
  readonly kind: DataErrorKind;
  readonly url?: string;
  readonly httpStatus?: number;
  constructor(kind: DataErrorKind, message: string, opts: { url?: string; httpStatus?: number } = {}) {
    super(message);
    this.name = 'DataError';
    this.kind = kind;
    this.url = opts.url;
    this.httpStatus = opts.httpStatus;
  }
}

type Json = Record<string, unknown>;

function isObj(v: unknown): v is Json {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function req(cond: unknown, what: string): asserts cond {
  if (!cond) throw new DataError('schema', `Invalid data contract: ${what}`);
}

/** Accepts "1", "1.0", "1.3"... ; rejects anything else (missing, "2.0", numbers, garbage). */
export function checkSchemaVersion(v: unknown): string {
  if (typeof v !== 'string' || !/^\d+(\.\d+){0,2}$/.test(v)) {
    throw new DataError('schema_version', `Missing or malformed schema_version (${JSON.stringify(v)}).`);
  }
  const major = Number(v.split('.')[0]);
  if (major !== SUPPORTED_MAJOR) {
    throw new DataError(
      'schema_version',
      `Unsupported schema_version "${v}" (this viewer supports major version ${SUPPORTED_MAJOR}).`,
    );
  }
  return v;
}

function isBounds(b: unknown): boolean {
  return (
    Array.isArray(b) &&
    b.length === 4 &&
    b.every((n) => typeof n === 'number' && Number.isFinite(n)) &&
    (b[0] as number) < (b[2] as number) &&
    (b[1] as number) < (b[3] as number)
  );
}

export function parseCatalog(input: unknown): Catalog {
  req(isObj(input), 'catalog must be a JSON object');
  checkSchemaVersion(input.schema_version);
  req(isObj(input.project), 'catalog.project');
  req(isObj(input.boundary) && typeof input.boundary.href === 'string', 'catalog.boundary.href');
  req(Array.isArray(input.regions), 'catalog.regions must be an array');
  input.regions.forEach((r: unknown, i: number) => {
    req(isObj(r), `regions[${i}]`);
    req(typeof r.region_id === 'string' && typeof r.name === 'string', `regions[${i}].region_id/name`);
    req(r.bounds === null || isBounds(r.bounds), `regions[${i}].bounds`);
    req(Array.isArray(r.observations), `regions[${i}].observations`);
    req(isObj(r.comparison), `regions[${i}].comparison`);
    const c = r.comparison as Json;
    req(c.status === 'available' || c.status === 'unavailable', `regions[${i}].comparison.status`);
    if (c.status === 'available') {
      req(typeof c.manifest_href === 'string' && c.manifest_href.length > 0, `regions[${i}].comparison.manifest_href`);
    }
  });
  return input as unknown as Catalog;
}

export function parseManifest(input: unknown): Manifest {
  req(isObj(input), 'manifest must be a JSON object');
  checkSchemaVersion(input.schema_version);
  req(typeof input.release_id === 'string', 'manifest.release_id');
  req(isObj(input.aoi) && isBounds(input.aoi.bounds), 'manifest.aoi.bounds');
  req(Array.isArray(input.observations) && input.observations.length === 2, 'manifest.observations must have [before, after]');
  req(isObj(input.compatibility) && Array.isArray(input.compatibility.checks), 'manifest.compatibility.checks');
  req(isObj(input.analysis), 'manifest.analysis');
  req(Array.isArray(input.assets), 'manifest.assets');
  input.assets.forEach((a: unknown, i: number) => {
    req(isObj(a) && typeof a.href === 'string' && typeof a.role === 'string', `assets[${i}].href/role`);
    req(a.bounds === undefined || isBounds(a.bounds), `assets[${i}].bounds`);
  });
  req(isObj(input.visualization), 'manifest.visualization');
  req(isObj(input.interpretation), 'manifest.interpretation');
  req(Array.isArray(input.limitations), 'manifest.limitations');
  return input as unknown as Manifest;
}

/** Resolve a contract href relative to the URL of the file that contains it. */
export function resolveHref(href: string, containingFileUrl: string): string {
  // Template braces must survive URL normalisation.
  const resolved = new URL(href, containingFileUrl).toString();
  return resolved.replace(/%7B/gi, '{').replace(/%7D/gi, '}');
}

/** URL of catalog.json for the current deployment (works under any subpath). */
export function catalogUrl(baseUrl: string = import.meta.env.BASE_URL, pageUrl: string = window.location.href): string {
  const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return new URL(`${base}data/v1/catalog.json`, pageUrl).toString();
}

export async function fetchJson(url: string, fetchImpl: typeof fetch = fetch): Promise<unknown> {
  let res: Response;
  try {
    res = await fetchImpl(url, { credentials: 'omit', cache: 'no-cache' });
  } catch (e) {
    throw new DataError('network', `Network error while loading ${shortUrl(url)}.`, { url });
  }
  if (res.status === 401 || res.status === 403 || res.status === 404) {
    throw new DataError(
      'deployment',
      `Published data file not available (HTTP ${res.status}) at ${shortUrl(url)}. This is a deployment problem, not a login requirement — no account is needed to view ChangeLens.`,
      { url, httpStatus: res.status },
    );
  }
  if (!res.ok) {
    throw new DataError('http', `Server returned HTTP ${res.status} for ${shortUrl(url)}.`, { url, httpStatus: res.status });
  }
  try {
    return await res.json();
  } catch {
    throw new DataError('parse', `File ${shortUrl(url)} is not valid JSON.`, { url });
  }
}

function shortUrl(url: string): string {
  try {
    const u = new URL(url);
    return u.pathname;
  } catch {
    return url;
  }
}

/* ---------------- asset helpers ---------------- */

export type LogicalLayer = 'before' | 'after' | 'change' | 'change_class';

const ROLE_MAP: Record<LogicalLayer, { tiles: AssetRole; image: AssetRole }> = {
  before: { tiles: 'before_db_tiles', image: 'before_db_image' },
  after: { tiles: 'after_db_tiles', image: 'after_db_image' },
  change: { tiles: 'change_tiles', image: 'change_image' },
  change_class: { tiles: 'change_class_tiles', image: 'change_class_image' },
};

export function findLayerAsset(manifest: Manifest, layer: LogicalLayer): Asset | null {
  const roles = ROLE_MAP[layer];
  return (
    manifest.assets.find((a) => a.role === roles.tiles) ??
    manifest.assets.find((a) => a.role === roles.image) ??
    null
  );
}

export type RasterSourceSpec =
  | { type: 'raster'; tiles: string[]; tileSize: number; bounds?: [number, number, number, number]; minzoom?: number; maxzoom?: number; scheme: 'xyz' }
  | { type: 'image'; url: string; coordinates: [[number, number], [number, number], [number, number], [number, number]] };

/** Build a MapLibre source spec from an asset (XYZ tiles or single image with lon/lat bounds). */
export function sourceSpecForAsset(asset: Asset, manifestUrl: string, fallbackBounds?: [number, number, number, number]): RasterSourceSpec | null {
  const url = resolveHref(asset.href, manifestUrl);
  const isTiles = asset.role.endsWith('_tiles') || asset.tile_scheme === 'xyz' || /\{z\}/.test(asset.href);
  if (isTiles) {
    const spec: RasterSourceSpec = { type: 'raster', tiles: [url], tileSize: 256, scheme: 'xyz' };
    if (asset.bounds) spec.bounds = asset.bounds;
    if (typeof asset.minzoom === 'number') spec.minzoom = asset.minzoom;
    if (typeof asset.maxzoom === 'number') spec.maxzoom = asset.maxzoom;
    return spec;
  }
  const b = asset.bounds ?? fallbackBounds;
  if (!b) return null; // an image without georeference cannot be placed honestly
  const [w, s, e, n] = b;
  return { type: 'image', url, coordinates: [[w, n], [e, n], [e, s], [w, s]] };
}

export function regionHasComparison(r: CatalogRegion): boolean {
  return r.comparison.status === 'available' && !!r.comparison.manifest_href;
}

/** Quantitative assets offered for download in Research mode. */
export function downloadableAssets(manifest: Manifest): Asset[] {
  return manifest.assets.filter((a) => a.purpose === 'quantitative' || a.role === 'delta_db_cog' || a.role === 'compatibility_json');
}

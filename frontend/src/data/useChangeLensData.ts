import { useCallback, useEffect, useRef, useState } from 'react';
import type { Catalog, CatalogRegion, Manifest } from '../types/contract';
import { DataError, fetchJson, parseCatalog, parseManifest, regionHasComparison, resolveHref } from './contract';
import { getDataSource, type DataSource } from './source';

export type Loadable<T> =
  | { state: 'idle' }
  | { state: 'loading' }
  | { state: 'error'; error: DataError }
  | { state: 'ready'; value: T };

export interface ManifestBundle {
  manifest: Manifest;
  url: string;
  aoiGeojson: GeoJSON.GeoJSON | null;
  warnings: string[];
}

export interface CatalogBundle {
  catalog: Catalog;
  url: string;
  boundaryGeojson: GeoJSON.GeoJSON | null;
  warnings: string[];
}

function toDataError(e: unknown): DataError {
  if (e instanceof DataError) return e;
  return new DataError('parse', e instanceof Error ? e.message : String(e));
}

export const MAX_RETRIES = 3;

export function useChangeLensData() {
  const [source, setSource] = useState<DataSource | null>(null);
  const [catalog, setCatalog] = useState<Loadable<CatalogBundle>>({ state: 'loading' });
  const [regionId, setRegionId] = useState<string | null>(null);
  const [manifest, setManifest] = useState<Loadable<ManifestBundle>>({ state: 'idle' });
  const [retries, setRetries] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);
  const manifestReq = useRef(0);

  // catalog
  useEffect(() => {
    let cancelled = false;
    setCatalog({ state: 'loading' });
    (async () => {
      try {
        const src = await getDataSource();
        if (cancelled) return;
        setSource(src);
        const raw = await fetchJson(src.catalogUrl, src.fetchImpl);
        const cat = parseCatalog(raw);
        const warnings: string[] = [];
        let boundaryGeojson: GeoJSON.GeoJSON | null = null;
        try {
          boundaryGeojson = (await fetchJson(resolveHref(cat.boundary.href, src.catalogUrl), src.fetchImpl)) as GeoJSON.GeoJSON;
        } catch (e) {
          warnings.push(`Mekong Delta boundary outline could not be loaded (${toDataError(e).message}).`);
        }
        if (cancelled) return;
        setCatalog({ state: 'ready', value: { catalog: cat, url: src.catalogUrl, boundaryGeojson, warnings } });
        setRegionId((prev) => prev ?? (cat.regions.length === 1 ? cat.regions[0].region_id : null));
      } catch (e) {
        if (!cancelled) setCatalog({ state: 'error', error: toDataError(e) });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const region: CatalogRegion | null =
    catalog.state === 'ready' ? catalog.value.catalog.regions.find((r) => r.region_id === regionId) ?? null : null;

  // manifest for selected region (ignores obsolete responses)
  useEffect(() => {
    const id = ++manifestReq.current;
    if (catalog.state !== 'ready' || !region || !source || !regionHasComparison(region)) {
      setManifest({ state: 'idle' });
      return;
    }
    setManifest({ state: 'loading' });
    const url = resolveHref(region.comparison.manifest_href as string, catalog.value.url);
    (async () => {
      try {
        const m = parseManifest(await fetchJson(url, source.fetchImpl));
        const warnings: string[] = [];
        let aoiGeojson: GeoJSON.GeoJSON | null = null;
        if (m.aoi.geometry_href) {
          try {
            aoiGeojson = (await fetchJson(resolveHref(m.aoi.geometry_href, url), source.fetchImpl)) as GeoJSON.GeoJSON;
          } catch (e) {
            warnings.push(`AOI geometry could not be loaded (${toDataError(e).message}); showing AOI bounding box instead.`);
          }
        }
        if (id === manifestReq.current) setManifest({ state: 'ready', value: { manifest: m, url, aoiGeojson, warnings } });
      } catch (e) {
        if (id === manifestReq.current) setManifest({ state: 'error', error: toDataError(e) });
      }
    })();
  }, [catalog, region, source, reloadKey]);

  const retry = useCallback(() => {
    setRetries((n) => {
      if (n >= MAX_RETRIES) return n;
      setReloadKey((k) => k + 1);
      return n + 1;
    });
  }, []);

  return {
    isFixture: source?.isFixture ?? false,
    catalog,
    region,
    selectRegion: setRegionId,
    manifest,
    retry,
    retriesLeft: MAX_RETRIES - retries,
  };
}

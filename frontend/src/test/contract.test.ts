import { describe, expect, it } from 'vitest';
import {
  checkSchemaVersion,
  parseCatalog,
  resolveHref,
  sourceSpecForAsset,
  DataError,
} from '../data/contract';
import type { Asset, Catalog } from '../types/contract';

describe('Data Contract Validator', () => {
  it('accepts supported schema version and rejects unsupported', () => {
    expect(checkSchemaVersion('1.0')).toBe('1.0');
    expect(checkSchemaVersion('1')).toBe('1');
    expect(checkSchemaVersion('1.2.3')).toBe('1.2.3');

    expect(() => checkSchemaVersion('2.0')).toThrow(DataError);
    expect(() => checkSchemaVersion('invalid')).toThrow(DataError);
  });

  it('correctly resolves relative hrefs including templates', () => {
    const base = 'https://example.org/data/v1/releases/r1/manifest.json';
    expect(resolveHref('delta_db.tif', base)).toBe('https://example.org/data/v1/releases/r1/delta_db.tif');
    expect(resolveHref('tiles/{z}/{x}/{y}.png', base)).toBe(
      'https://example.org/data/v1/releases/r1/tiles/{z}/{x}/{y}.png'
    );
  });

  it('validates a valid catalog object', () => {
    const validCat: Catalog = {
      schema_version: '1.0',
      generated_at: '2026-11-14T00:00:00Z',
      project: { name: 'NISAR ChangeLens', slogan: 'See Change', region_scope: 'Mekong Delta' },
      boundary: { href: 'mekong.geojson', source: 'geoBoundaries', license: 'CC BY 4.0', approximate: false },
      regions: [
        {
          region_id: 'dong-thap-muoi',
          name: 'Dong Thap Muoi',
          name_vi: 'Đồng Tháp Mười',
          selection_status: 'selected',
          bounds: [105.4, 8.6, 106.8, 10.4],
          summary: 'Seasonal flood basin',
          observations: [{ observation_id: 'obs-1', date: '2026-10-10', maturity: 'PROVISIONAL' }],
          comparison: {
            status: 'available',
            release_id: 'r1',
            manifest_href: 'releases/r1/manifest.json',
            compatibility_status: 'pass',
            maturity_label: 'PROVISIONAL',
            reason: null,
          },
        },
      ],
    };

    const parsed = parseCatalog(validCat);
    expect(parsed.schema_version).toBe('1.0');
    expect(parsed.regions.length).toBe(1);
  });

  it('generates MapLibre image spec for georeferenced raster asset', () => {
    const asset: Asset = {
      asset_id: 'before_db',
      role: 'before_db_image',
      href: 'before_db.png',
      mime: 'image/png',
      bytes: 1000,
      sha256: 'abcd',
      source_observation_ids: ['obs-1'],
      purpose: 'display',
      bounds: [105.0, 9.0, 106.0, 10.0],
    };

    const spec = sourceSpecForAsset(asset, 'https://example.org/manifest.json');
    expect(spec).not.toBeNull();
    expect(spec?.type).toBe('image');
    if (spec?.type === 'image') {
      expect(spec.coordinates).toEqual([
        [105.0, 10.0],
        [106.0, 10.0],
        [106.0, 9.0],
        [105.0, 9.0],
      ]);
    }
  });
});

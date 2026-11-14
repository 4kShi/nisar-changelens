/**
 * NISAR ChangeLens static data contract v1.0 (shared by pipeline and web).
 * Source of truth for field names. Pipeline JSON Schema: pipeline/schema/manifest.schema.json
 * Conventions: ISO-8601 UTC timestamps; bounds = [west, south, east, north] lon/lat (EPSG:4326);
 * affine = Rasterio order [a,b,c,d,e,f]; `null` means unknown (never implicit pass/zero);
 * all hrefs are RELATIVE to the file that contains them (no absolute workstation paths, no credentials).
 */

export type Bounds = [number, number, number, number];
export type GateStatus = 'pass' | 'fail' | 'unknown';
export type Maturity = 'VALIDATED' | 'PROVISIONAL' | 'BETA' | 'UNKNOWN';

/* ---------------- catalog.json ---------------- */
export interface Catalog {
  schema_version: '1.0';
  generated_at: string;
  project: { name: string; slogan: string; region_scope: string };
  /** Mekong Delta boundary used to clip every raster */
  boundary: { href: string; source: string; license: string; approximate: boolean };
  regions: CatalogRegion[];
}

export interface CatalogRegion {
  region_id: string; // e.g. "dong-thap-muoi"
  name: string; // "Dong Thap Muoi (Plain of Reeds)"
  name_vi: string;
  selection_status: 'selected' | 'provisional' | 'fallback';
  bounds: Bounds | null; // analysis AOI in lon/lat
  /** short public description of why the region matters */
  summary: string;
  observations: { observation_id: string; date: string; maturity: Maturity }[];
  comparison: {
    status: 'available' | 'unavailable';
    release_id: string | null;
    manifest_href: string | null; // relative to catalog.json, e.g. "releases/<id>/manifest.json"
    compatibility_status: GateStatus;
    maturity_label: Maturity; // shown as banner if not VALIDATED
    reason: string | null; // required when unavailable
  };
}

/* ---------------- releases/{release_id}/manifest.json ---------------- */
export interface Manifest {
  schema_version: '1.0';
  release_id: string;
  status: 'available' | 'unavailable';
  created_at: string;
  aoi: {
    region_id: string;
    name: string;
    bounds: Bounds; // lon/lat
    geometry_href: string | null; // GeoJSON of AOI ∩ Mekong boundary ∩ pair footprint
    boundary_provenance: string;
  };
  observations: [Observation, Observation]; // [before, after]
  compatibility: CompatibilityReport;
  analysis: Analysis;
  assets: Asset[];
  visualization: Visualization;
  interpretation: Interpretation;
  limitations: string[];
  provenance: {
    pipeline_version: string;
    git_commit: string | null;
    environment: Record<string, string>; // package -> version
    commands: string[];
  };
  reviews: { science_review: string | null; redistribution_review: string | null };
}

export interface Observation {
  observation_id: string;
  role: 'before' | 'after';
  collection: { short_name: string | null; concept_id: string | null; version: string | null; maturity: Maturity };
  granule: { provider: string; granule_id: string; concept_id: string | null; size_bytes: number | null };
  acquisition: {
    start_utc: string;
    end_utc: string;
    absolute_orbit: number | null;
    relative_track: number | null;
    frame: number | null;
    pass_direction: 'ASCENDING' | 'DESCENDING' | null;
    look_direction: 'LEFT' | 'RIGHT' | null;
    cycle: number | null;
  };
  processing: { product_type: 'GCOV'; level: 'L2'; crid: string | null; product_version: string | null; processing_datetime: string | null; software_version: string | null };
  measurement: {
    band: 'L';
    frequency: 'A' | 'B';
    polarization_term: string; // "HHHH"
    hdf5_variable: string; // "/science/LSAR/GCOV/grids/frequencyA/HHHH"
    quantity: string; // "gamma0 backscatter (RTC, diagonal covariance)"
    units: string; // "linear power (1)"
    display_units: 'dB';
    fill_value: string; // "NaN"
  };
  grid: { crs: string; affine: number[]; width: number; height: number; spacing_m: [number, number]; pixel_convention: 'corner' | 'center'; bounds_lonlat: Bounds };
  validity: { fill: string; mask_variable: string | null; mask_semantics: string | null; number_of_looks: string | null };
  provenance: { source_url: string | null; retrieved_at: string | null; sha256: string | null; citation: string };
  missing_fields: string[];
}

export interface GateCheck {
  rule_id: string; // "G01_identity_maturity" ... "G10_effective_resolution"
  title: string;
  status: GateStatus;
  blocking: boolean;
  observed_values: Record<string, unknown>;
  evidence_refs: string[];
  reason: string;
  required_action: string | null;
}

export interface CompatibilityReport {
  status: GateStatus; // fail/unknown if any blocking gate is not pass
  checks: GateCheck[];
  reviewer: string;
}

export interface Analysis {
  method: 'dB difference (log-ratio) baseline';
  formula: string; // "ΔdB = 10·log10(P_after) − 10·log10(P_before)"
  version: string;
  parameters: {
    speckle_filter: string | null; // e.g. "boxcar 5x5 on linear power"
    resampling: string | null; // e.g. "average, factor 4, 20 m -> 80 m"
    decrease_threshold_db: number; // e.g. -3
    increase_threshold_db: number; // e.g. +3
  };
  stats: {
    denominator_description: string; // "jointly valid pixels inside AOI ∩ Mekong boundary"
    total_pixels_in_aoi: number;
    valid_pixels: number;
    excluded: Record<string, number>; // reason -> count
    delta_db: { mean: number; median: number; p05: number; p95: number; std: number };
    classes: { decrease: number; no_significant_change: number; increase: number }; // pixel counts over valid_pixels
    pixel_area_m2: number;
    areas_km2?: { total_aoi: number; valid_analyzed: number; decrease_area: number; increase_area: number };
  } | null;
}

export type AssetRole =
  | 'before_db_tiles' | 'after_db_tiles' | 'change_tiles' | 'change_class_tiles'
  | 'before_db_image' | 'after_db_image' | 'change_image' | 'change_class_image'
  | 'delta_db_cog' | 'aoi_geojson' | 'boundary_geojson' | 'compatibility_json' | 'thumbnail';

export interface Asset {
  asset_id: string;
  role: AssetRole;
  href: string; // relative to manifest; XYZ template uses {z}/{x}/{y}.png
  mime: string;
  bytes: number | null; // total bytes for tile sets
  sha256: string | null; // single file hash; tile sets use inventory_href
  inventory_href?: string; // JSON list of tile paths + sha256
  source_observation_ids: string[];
  purpose: 'display' | 'quantitative' | 'context';
  /** for image sources: lon/lat bounds; for tiles: bounds + zoom */
  bounds?: Bounds;
  minzoom?: number;
  maxzoom?: number;
  tile_scheme?: 'xyz';
}

export interface Visualization {
  display_crs: 'EPSG:3857';
  backscatter_stretch: { min_db: number; max_db: number; colormap: 'gray' };
  change_stretch: { min_db: number; max_db: number; colormap: 'RdBu' }; // diverging, blue = decrease
  legends: { id: string; title: string; items: { color: string; label: string }[] }[];
}

export interface Interpretation {
  observed_radar_change: string;
  hypothesized_surface_phenomena: string[];
  supported_conclusions: string[]; // may be empty
  evidence_refs: string[];
  uncertainty_notes: string[];
  public_label: 'Potential Surface Change';
}

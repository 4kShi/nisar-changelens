# API and artifact contracts

> **Status: IMPLEMENTATION (NASA Space Apps 2026, started 14 Nov 2026 00:00 ICT; authorized by project owner Trung).**

Contract `v1.0`. This document is the naming authority across architecture,
UX and offline processing. Scope is strictly Mekong Delta (ĐBSCL), prioritizing Dong Thap Muoi.

| Planned static resource | Contract |
|---|---|
| `/data/v1/catalog.json` | Schema version, release ID, regions, published observations, available/unavailable comparisons and manifest references |
| `/data/v1/releases/{release_id}/manifest.json` | Available immutable scientific release |
| Relative asset paths under release | Typed tiles/COGs/masks/provenance with integrity records |

Paths are relative to configurable deployment base, including subpath hosting.
Unreleased/unavailable regions are represented directly in catalog and have no
invented release URL. No live backend is required. Future backend must not proxy
arbitrary URLs or accept visitors' NASA credentials.

## Shared conventions

UTF-8 JSON; semantic schema version; unsupported major versions rejected. Actual
timestamps ISO 8601 UTC. Geographic bounds `[west,south,east,north]` use lon/lat;
projected bounds declare CRS. Affine order is Rasterio `[a,b,c,d,e,f]`,
`x=a*col+b*row+c`, `y=d*col+e*row+f`, with pixel corner/center convention explicit.
`null` is unknown, never an implicit zero/pass. References are relative paths or
allowlisted HTTPS; no credentials, signed URLs, traversal or workstation paths.

## Observation record

| Field | Required information |
|---|---|
| `observation_id` | Stable internal identifier |
| `collection` | Short name, concept ID/version/revision, maturity |
| `granule` | Provider, identifier, concept ID/revision when available |
| `acquisition` | UTC start/end, orbit/pass, relative track/frame, direction, look geometry and quality |
| `processing` | Product/schema/processor versions, CRID, production time, calibration/release notes |
| `measurement` | Product, instrument band, frequency A/B, mode/bandwidth, polarization/diagonal term, HDF5 variable, quantity/normalization, units, representation, scale/offset |
| `grid` | CRS, full affine/order, dimensions, spacing/effective-resolution distinction, bounds, pixel convention |
| `validity` | Fill/NoData, authoritative mask semantics, quality references, number-of-looks information |
| `provenance` | Source citation/query/retrieval time/checksum evidence |
| `missing_fields` | Missing values and blocking consequences |

Discovery records may be incomplete; authoritative product metadata must fill
required scientific fields. Unknowns stay unknown.

## Pair and release

`compatibility.status`: `pass | fail | unknown`. Every check records `rule_id`,
`status`, `observed_values`, `evidence_refs`, `reason`, `required_action` and
reviewer. Map scientific pseudocode `PASS/BLOCK/UNKNOWN` to `pass/fail/unknown`.
Cover every gate in `SCIENTIFIC_METHODOLOGY.md`. A pass is measurement compatibility,
not proof of a surface cause. Preparation-adjusted grids require new validation.

Available manifest requires `schema_version`, immutable `release_id`, `status`,
actual `created_at`, AOI geometry/boundary provenance, two observation records,
complete compatibility report, analysis method/version/parameters/mask/limitations,
typed assets, visualization legends/styles/tile scheme/display CRS, interpretation,
source/preparation/environment records, science review and redistribution review.
Final analysis arrays must share actual pixel locations/support; shapes alone fail.

Unavailable catalog entry schematic — **no observations or results represented**:

```json
{
  "schema_version": "1.0",
  "regions": [{
    "name": "Dong Thap Muoi",
    "selection_status": "provisional",
    "geometry": null,
    "observations": [],
    "comparison": {
      "status": "unavailable",
      "release_id": null,
      "manifest_href": null,
      "compatibility": {"status": "unknown", "checks": []},
      "reason": "No acquisition pair has been verified."
    }
  }]
}
```

This abbreviated empty-state example is not a deployed endpoint or full machine
schema. An available comparison cannot use empty checks or missing assets.

Every asset: ID, role, href, MIME, bytes, SHA-256, source observation IDs and
scientific/display purpose. Scientific rasters additionally declare quantity,
units, CRS/affine/shape/spacing and validity-mask reference. XYZ/TMS tile assets
declare convention, bounds/zoom, legend and complete tile-inventory checksums.
Do not claim a single hash validates a URL template. Package inventory lists
individual objects. Integrity verification feasibility, including browser cost,
must be implemented/tested; trusted release review is separate from client validation.

Interpretation fields: `observed_radar_change`, `hypothesized_surface_phenomena`,
`supported_conclusions`, evidence refs and limitations. No invented confidence;
any statistics state denominator/mask/scope/method. Coverage is not confidence.

## Failure and acceptance behavior

Invalid/unknown schema, failed gate or missing required references rejects pair
comparison. Missing before/after disables comparison; missing overlay can retain
valid observation views with a clear warning. HTTP 401/403 is public deployment
failure, never a visitor Earthdata prompt. Missing tiles are unavailable, not zero
change. Old responses cannot change the current pair's status.

Future acceptance: anonymous clean browser; missing/tampered references rejected;
half-pixel offset fails despite matching CRS/resolution; honest empty state; dates,
units/formula/legend consistent; independence from AI OWNER; no secrets in bundle,
JSON or URLs. These tests are not executed now.

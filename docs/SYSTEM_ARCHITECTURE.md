# System architecture

> **Status: IMPLEMENTATION (NASA Space Apps 2026, started 14 Nov 2026 00:00 ICT; authorized by project owner Trung).**

Architecture: 100% static React/TypeScript/Vite application with MapLibre GL JS, served via GitHub Pages.
Offline Python processing pipeline publishes reviewed, immutable artifacts (`catalog.json`, `manifest.json`, XYZ tiles).
No backend runtime (no FastAPI), zero visitor login, zero secrets in bundle. Scope is strictly Mekong Delta (ĐBSCL).

```text
PRIVATE — future hackathon processing
AOI → discovery → metadata → compatibility screening
    → bounded access/Harmony if supported → raster preparation
    → scientific validation → change analysis → review
    → provenance + quantitative rasters + rendered tiles
                       |
            reviewed, approved publication
                       v
PUBLIC HTTPS static host/object storage
application + data/v1/catalog.json
            + data/v1/releases/{release_id}/manifest.json + assets
                       |
anonymous browser: Discover → Observe → Compare → Understand
```

| Component | Responsibility | Acceptance |
|---|---|---|
| Private acquisition | Authenticate only in private environment; bound access | Identity, transfer and provenance receipts |
| Preparation/analysis | Validate measurements and grids before analysis | Pass/fail/unknown rule evidence; no silent repairs |
| Release | Review science, rights and asset inventory | Immutable identifier/checksums and sanitized provenance |
| Host | HTTPS static data and app | Anonymous read, appropriate CORS/cache headers |
| Frontend | Render and explain released evidence | Reject incomplete contracts; cannot approve science |

Use pre-generated raster XYZ tiles for MVP visualization. MapLibre supports
raster/image/GeoJSON sources; this is not proof of native scientific COG decoding.
Optional COGs serve quantitative download/research use. Keep analysis grid separate
from Web Mercator display reprojection and document resampling. Rendered colors
are not numerical measurements. Defer pixel interrogation until separately validated.
[MapLibre sources](https://maplibre.org/maplibre-style-spec/sources/).

Contracts and canonical resource names are in `API_CONTRACTS.md`. The app checks
schema/reference integrity before display, but scientific acceptance comes from
private reviewed evidence. Unknown/failed gates disable Compare. A new region/pair
clears old layers, legends and validation; discard stale asynchronous responses.

Visitors never authenticate to NASA. Public configuration may include only data
base URL and basemap configuration. Vite exposes `VITE_` values to browsers;
never place a secret there. [Vite environment documentation](https://vite.dev/guide/env-and-mode.html).
Use no public URL-fetch proxy or browser arbitrary processing endpoint. Render
metadata as text, allowlist HTTPS origins, reject active content/traversal, set
host CSP and ensure basemap attribution/terms. These controls are plans, untested.

Deploy a static build plus a versioned release after human approval. A curated
release must work during upstream NASA outage and without AI OWNER. Vite's static
build is documented; its preview server is not the production host.
[Vite static deployment](https://vite.dev/guide/static-deploy.html).
Pin Node/Python/dependencies and commit lockfiles during authorized build; clean
checkout reproduction, anonymous browser, host base paths, CORS, range requests
and mobile/keyboard validation remain pending.

# Licenses and Third-Party Attribution (`LICENSES_AND_ATTRIBUTION.md`)

**Project**: NISAR ChangeLens (*"See Change. Understand Earth."*)  
**Team**: `4/K`  
**Challenge**: NASA Space Apps Challenge 2026 — *Dancing with the SARs*  
**Audit Date**: 2026-11-14

---

## 1. Project Source Code License (`OWNER CONFIRMATION ITEM`)

The repository root contains an [**MIT License**](../LICENSE) file drafted during hackathon scaffolding:

```text
Copyright (c) 2026 Phạm Thành Trung and NISAR ChangeLens team
Licensed under the MIT License.
```

> **Note for Final Submission**: Before pushing the public GitHub repository, Team `4/K` (**Phạm Thành Trung** and **Lý Chấn Hưng**) should confirm whether MIT remains the intended open-source license and whether both team members' names should appear explicitly on the copyright line.

---

## 2. Satellite Data, Boundary & Basemap Attribution

| Asset Category | Provider / Source | License / Terms | Mandatory Attribution Displayed in App |
| :--- | :--- | :--- | :--- |
| **NISAR L2 GCOV Satellite Data** | NASA / ISRO, distributed by Alaska Satellite Facility DAAC (ASF DAAC) | NASA Earth Science Open Data Policy (Public Domain / Unrestricted scientific & educational use) | *"Data: NASA/ISRO NISAR L2 GCOV V1 via ASF DAAC · Not an official NASA product"* |
| **Administrative Boundaries (`mekong_boundary.geojson`, `mekong_provinces.geojson`)** | geoBoundaries (Runfola et al., 2020), William & Mary geoLab | **CC BY 4.0** ([Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/)) | *"Boundaries: geoBoundaries (CC BY 4.0)"* |
| **Web Basemap Tiles (`World_Dark_Gray_Base` & `Reference`)** | Esri / ArcGIS Online (`server.arcgisonline.com`) | Esri Master Agreement / ArcGIS Online Basemap Terms | *"Basemap © Esri, HERE, Garmin, OpenStreetMap contributors"* |

---

## 3. Frontend Dependencies (`frontend/package.json` & `package-lock.json`)

All versions and licenses below were verified directly from `frontend/node_modules/*/package.json`:

| Package | Installed Version | Declared Spec | License | Purpose | Official URL | Attribution Required? |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `react` | `19.3.1` | `^19.3.1` | **MIT** | Core declarative UI framework | https://react.dev/ | Copyright notice in bundled distributions |
| `react-dom` | `19.3.1` | `^19.3.1` | **MIT** | DOM rendering for React | https://react.dev/ | Copyright notice in bundled distributions |
| `maplibre-gl` | `6.18.0` | `^6.18.0` | **BSD-3-Clause** | Interactive WebGL map & raster overlay engine (including `maplibre-gl-worker.js`) | https://maplibre.org/ | Yes (BSD-3-Clause copyright notice; MapLibre control attribution) |
| `typescript` *(dev)* | `7.0.2` | `^7.0.2` | **Apache-2.0** | Static type checking (`tsc -b`) | https://www.typescriptlang.org/ | Dev/build tool only (not bundled) |
| `vite` *(dev)* | `8.3.8` | `^8.3.8` | **MIT** | Frontend bundler & preview server | https://vite.dev/ | Dev/build tool only |
| `@vitejs/plugin-react` *(dev)* | `6.3.0` | `^6.3.0` | **MIT** | React plugin for Vite | https://github.com/vitejs/vite-plugin-react | Dev/build tool only |
| `vitest` *(dev)* | `5.1.0` | `^5.1.0` | **MIT** | Automated unit & component test runner | https://vitest.dev/ | Dev/test tool only |
| `jsdom` *(dev)* | `31.0.1` | `^31.0.1` | **MIT** | DOM environment for Vitest | https://github.com/jsdom/jsdom | Dev/test tool only |
| `@testing-library/react` *(dev)* | `16.3.3` | `^16.3.3` | **MIT** | React component testing utilities | https://testing-library.com/ | Dev/test tool only |
| `@testing-library/jest-dom` *(dev)* | `7.0.1` | `^7.0.1` | **MIT** | DOM assertion matchers for Vitest | https://github.com/testing-library/jest-dom | Dev/test tool only |
| `@types/geojson` *(dev)* | `7946.0.16` | `^7946.0.16` | **MIT** | TypeScript definitions for GeoJSON | https://github.com/DefinitelyTyped/DefinitelyTyped | Dev/build tool only |
| `@types/react` *(dev)* | `19.3.0` | `^19.3.0` | **MIT** | TypeScript definitions for React | https://github.com/DefinitelyTyped/DefinitelyTyped | Dev/build tool only |
| `@types/react-dom` *(dev)* | `19.3.0` | `^19.3.0` | **MIT** | TypeScript definitions for React DOM | https://github.com/DefinitelyTyped/DefinitelyTyped | Dev/build tool only |
| `@types/node` *(dev)* | `26.6.6` | `^26.6.6` | **MIT** | TypeScript definitions for Node.js | https://github.com/DefinitelyTyped/DefinitelyTyped | Dev/build tool only |

---

## 4. Python Pipeline Dependencies (`requirements.txt`)

All versions and licenses below were verified directly via `importlib.metadata` in the project Python environment (used offline to run `pipeline/` and `tests/pipeline/`; **none** of these Python packages are bundled or redistributed in the static web application):

| Package | Verified Version | License (`importlib.metadata`) | Purpose | Official URL | Redistribution / Notice Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `numpy` | `2.5.4` | **BSD-3-Clause** *(wheel metadata: `BSD-3-Clause AND 0BSD AND MIT AND Zlib AND CC0-1.0`)* | Array math, $\gamma^0_{\text{dB}} = 10\log_{10}(P)$ conversion, masking, and statistics | https://numpy.org/ | Not redistributed; installed via `pip` |
| `scipy` | `1.18.1` | **BSD-3-Clause** *(source license; wheel bundles OpenBLAS `BSD-3-Clause`, `libquadmath` `LGPL-2.1-or-later`, and optional FFTW `GPL-2.0+` shared libraries)* | `scipy.ndimage.uniform_filter` for $5\times 5$ normalized boxcar speckle filtering | https://scipy.org/ | **Not redistributed in repository** (installed by user via `pip`). Note: If binary wheels of `scipy` were ever redistributed in a binary appliance, bundled shared library licenses (`LGPL-2.1+` / `GPL-2.0+`) would apply. |
| `rasterio` | `1.5.2` | **BSD-3-Clause** *(links against GDAL MIT/X)* | GeoTIFF raster reading/writing and `EPSG:32648` affine transforms | https://rasterio.readthedocs.io/ | Not redistributed; installed via `pip` |
| `h5py` | `3.16.0` | **BSD-3-Clause** *(links against HDF5 BSD-style)* | Reading remote/local NISAR L2 GCOV HDF5 hierarchy (`/science/LSAR/GCOV/...`) | https://www.h5py.org/ | Not redistributed; installed via `pip` |
| `pyproj` | `3.8.0` | **MIT** | Coordinate transformation (`EPSG:4326` WGS84 $\leftrightarrow$ `EPSG:32648` UTM 48N) | https://pyproj4.github.io/pyproj/ | Not redistributed; installed via `pip` |
| `shapely` | `2.2.0` | **BSD-3-Clause** | Geometric polygon and bounding-box intersection utilities | https://shapely.readthedocs.io/ | Not redistributed; installed via `pip` |
| `requests` | `2.34.2` | **Apache-2.0** | HTTPS queries to NASA CMR API (`pipeline/discover.py`) | https://requests.readthedocs.io/ | Not redistributed; installed via `pip` |
| `earthaccess` | `0.19.0` | **MIT** | NASA Earthdata Login session management & `fsspec` streaming | https://earthaccess.readthedocs.io/ | Not redistributed; installed via `pip` |
| `Pillow` | `13.0.0` | **MIT-CMU** | Rendering georeferenced RGBA PNG overlays (`before_db.png`, `after_db.png`, `change_db.png`, `change_classes.png`) | https://python-pillow.org/ | Not redistributed; installed via `pip` |
| `pytest` | `9.2.0` | **MIT** | Running the 43 automated pipeline unit & integrity tests (`tests/pipeline/`) | https://docs.pytest.org/ | Dev/test tool only |

---

## 5. Trademarks and Non-Endorsement Disclaimer

NASA, ISRO, and Space Apps Challenge names and emblems are the property of their respective agencies. **NISAR ChangeLens** is an independent participant entry created by **Team `4/K`** for the 2026 NASA Space Apps Challenge and is not an official product of, nor endorsed by, NASA or ISRO.

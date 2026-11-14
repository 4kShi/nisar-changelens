# Network diagnosis — Earthdata and NISAR access

**Date:** 2026-11-14  
**Context:** sandboxed execution shell (`bash`). A separate interactive Ubuntu Terminal session was not available, so host-vs-sandbox comparison is **not established**.

## Low-cost tests

No proxy environment variable values were read or displayed; presence check found no HTTP(S)/ALL proxy variables.

| Endpoint | DNS | IPv4 | IPv6 | HTTPS result | Assessment |
|---|---|---|---|---|---|
| `urs.earthdata.nasa.gov` | A and AAAA resolve | TCP timed out after 3 s | `Network is unreachable` | Could not reach TLS/HTTP | Earthdata Login endpoint is unreachable from this execution context over tested routes |
| `cmr.earthdata.nasa.gov` | A resolves | TCP and TLS 1.3 succeed | No AAAA record | Documented collection-search path returned HTTP 200; `/search/site` returned 404 | CMR network is reachable; 404 was path-specific, not network failure |
| `nisar.asf.earthdatacloud.nasa.gov` | A resolves | TCP and TLS 1.3 succeed | No AAAA record | Root GET returned HTTP 200; root HEAD in a separate check returned 403 | ASF host is reachable; root-path method policy differs, not a general connection failure |

The successful CMR endpoint was a public metadata health query (`/search/collections.json?short_name=NISAR_L2_GCOV_V1&page_size=1`). No NASA data granule or raster was requested. The previous Earthaccess authentication attempt failed at `urs.earthdata.nasa.gov` with a network-level error before CMR or data access.

## Classification

- DNS: working for all three names.
- IPv4: Earthdata Login timed out; CMR and ASF connected.
- IPv6: no route to Earthdata Login; no IPv6 DNS result for CMR/ASF.
- TLS: passed for CMR and ASF; not reached for Earthdata Login.
- Proxy: no proxy environment variables detected; values were not inspected.
- CMR/ASF service: reachable; non-200 results were path/method-specific HTTP statuses.
- Root cause: **partial endpoint reachability**, specifically Earthdata Login IPv4 timeout and IPv6 route failure in this shell. A host-versus-Codex restriction cannot be concluded because no separate host terminal was available.

## Safe next action

The smallest correction is to restore/verify outbound connectivity to `urs.earthdata.nasa.gov:443` in this execution environment or perform the authenticated data step from a separately authorized normal Ubuntu Terminal once available. Do not change DNS, routing, firewall, proxy, or AI OWNER configuration based on this single-context test. Do not retry NISAR retrieval until Earthdata Login connectivity is restored.

## Later authenticated access attempt (2026-11-14)

The subsequently authorized run reached the exact October 22 catalog record,
then failed during `earthaccess.open` before any HDF5 range request. The local
checkpoint reports 0 response-body bytes, 0 ranges, and no output files. The
cause was a local timeout type mismatch: fsspec's `sync(timeout=...)` expected
a numeric duration but received `aiohttp.ClientTimeout`. The local reader now
uses Earthaccess's authenticated HTTPS fsspec session directly, bounds the
`fs.info(url)` preflight with numeric `timeout=30`, and passes its returned size
into `fs.open` to skip a second preflight. `aiohttp.ClientTimeout` is used only
inside guarded range reads. No second network attempt has been made.

## Same-task continuation result (2026-11-14)

The authorized continuation passed authenticated fsspec preflight, then failed
before its first HTTP range dispatch because `urlsplit()` did not accept the
`yarl.URL` object emitted by fsspec. The checkpoint confirms 0 body bytes and 0
ranges. Resource identity now converts that object to text before parsing,
strips its query/fragment from persisted identity, and leaves the request URL
unchanged. The correction has local regression coverage; there was no retry.

## Final authorized continuation result (2026-11-14)

The single continuation after URL normalization completed authenticated
preflight and HDF5 open. The Oct 22 mask metadata read then timed out on range
`[1548536,1548736)` before response headers/body. The checkpoint records 44
completed ranges totaling 18,020 response-body bytes, one failed reservation
with zero response-body bytes, zero automatic retries, and no outputs. The
250,000,000-byte cap was not exceeded. No further request was made.

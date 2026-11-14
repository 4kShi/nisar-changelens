# Scientific pipeline boundary

**Status: limited transport utility implemented; NISAR acquisition/processing is not implemented as an integrated pipeline.**

`http_range_budget.py` provides an offline-testable byte-budget wrapper for an
already authenticated fsspec HTTPFile. It reserves the requested response size
before dispatch, serializes shared requests, requires an exact HTTP 206 range,
and caps undecoded bytes yielded by the HTTP response stream. It does not count
HTTP headers, TLS/IP overhead, or bytes buffered below the response stream API.
Call `install_fsspec_httpfile_budget(http_file, shared_budget)` before HDF5
reads. The application does not yet integrate this utility into a complete
NASA data-acquisition workflow.

No complete processing or acquisition pipeline exists here. Future inputs: bounded AOI/query,
authoritative observation metadata and approved access plan. Future outputs:
validated measurement/masks, pair checks and reviewed release products/provenance.
See `../docs/SCIENTIFIC_METHODOLOGY.md` for gates and pseudocode,
`../docs/DATA_ACCESS_DESIGN.md` for resource limits and `../docs/API_CONTRACTS.md`
for interfaces. Unknown/failed evidence stops analysis; no silent full download,
automatic flood conclusion or synthetic substitute.

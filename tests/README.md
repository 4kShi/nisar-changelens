# Test boundary

**Status: local unit tests exist for the bounded HTTP range utility; end-to-end science tests remain incomplete.**

`pipeline/test_http_range_budget.py` uses deterministic in-memory HTTP fakes to
test range reservations, concurrency serialization, response validation,
transport-body accounting, abort behavior and reservation release. Run it with:

```bash
python -m pytest -q tests/pipeline/test_http_range_budget.py
```

These local tests do not establish NASA service availability or scientific
correctness. Synthetic fixtures are test-only and must never be presented as
authentic observations. Other acceptance tests remain specified in
`../docs/TEST_PLAN.md`.

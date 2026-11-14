# QA, security and reproducibility test plan

> **Status: IMPLEMENTATION (NASA Space Apps 2026, started 14 Nov 2026 00:00 ICT; authorized by project owner Trung).**

Active test plan for offline pipeline (`tests/pipeline/`), frontend client contracts (`tests/frontend/`), and security/secret scans. Scope is strictly Mekong Delta (ĐBSCL), prioritizing Dong Thap Muoi.

| ID / owner | Future case | Expected / acceptance |
|---|---|---|
| S01 SAR | Different quantity, units, frequency/polarization or complex term | Block with explicit metadata evidence |
| S02 SAR | Different direction/track/viewing or unresolved calibration/CRID | Reject or require scoped scientific review; no name-based approval |
| S03 SAR/data | Same CRS/resolution/shape, half-pixel offset; rotated/sign-different affine | Fail alignment; approved new target grid requires revalidation |
| S04 SAR | Empty overlap; partial overlap; invalid masks/fill/nonfinite | Empty blocks; partial uses joint valid mask; missing never zero |
| S05 SAR | Linear power versus dB; zero/negative power | Correct declared representation; no double log or epsilon fabrication |
| S06 SAR | Positive/negative log-ratio sign and shared display stretch | Formula/labels/legend consistent; no inferred flooding/displacement |
| S07 SAR | Processing quality/looks, coarse true resolution | Disclose limitations; unresolved material issue blocks |
| D01 data | Empty/truncated/paginated query, incomplete metadata | Distinct error states and retained query provenance |
| D02 data | 429/5xx/timeout; 401/403; ambiguous job creation | Bounded retry only appropriate reads; no auth retry loop or duplicate job |
| D03 data | Range ignored, unknown size, decompression/storage budget exceeded | Abort within byte/storage limits; no full-file fallback |
| D04 data/QA | Missing/wrong checksum, stale source revision | Reject/quarantine; subset/full checksum distinction preserved |
| W01 web | Unknown/failed pair, missing asset/overlay, new selection while loading | Gate disabled; honest layer failure; no stale pair state |
| W02 web | Keyboard-only divider and no-drag buttons; mobile narrow layout | Reachable controls, focus, readable legend/attribution |
| W03 web | No hue distinction, mask/partial coverage | Invalid support distinguishable through labels/pattern/luminance |
| W04 web/QA | Anonymous browser; NASA unavailable; basemap failure | Released data requires no NASA account; safe fallback with provenance |
| Q01 QA | Manifest text includes HTML; traversal/URL to unapproved host | No script execution or arbitrary fetch; text rendering/allowlist |
| Q02 QA | Inspect only intended public bundle/release config | No credentials, cookies, signed URLs, workstation paths, private logs |
| Q03 QA | Independently clean checkout/build/reproduce approved subset | Frozen runtime/locks/input IDs/parameters/hashes; documented numeric tolerance |
| Q04 QA | Challenge/resource mapping, AI/third-party disclosure, public demo | Current rules checked; every claim/source attributable |
| M01 AI/QA | Optional model against same valid-support baseline and independent labels | No inclusion without demonstrated benefit and legal/scientific validity |

For real environmental classification report suitable confusion matrix, per-class
precision/recall/IoU only when dated independent reference labels justify it;
specify denominator, sampling, excluded pixels, class balance, spatial/event split
and reference error. No accuracy from visual agreement, self-generated labels or
invalid support. MVP radar-change visualization does not require fabricated
classification scores. Avoid tuning on exposed evaluation evidence.

## Threat model and planned controls

Protected assets: private NASA identity, acquisition environment, source integrity,
public scientific claims and release availability. Threat surfaces: untrusted
metadata, malicious asset URLs, tampered releases, oversized retrieval, exposed
frontend variables, logs and accidental packaging of AI OWNER.

Mitigations: private acquisition; no public proxy/compute queue; schema/HTTPS-origin
validation; plain-text rendering; byte/concurrency/deadline caps; immutable IDs and
object inventories; scoped publication review; CSP/CORS and public host checks;
dependency license/security review at exact release lock; private log redaction.
No broad credential scan: inspect only intended distributable files. Access to
real credential stores is not authorized by this test plan.

Release gate requires science/data, UX and QA sign-off plus human publication
approval. Passing structural checks is neither science validation nor a deployed
application. Record verified/documentation-reviewed/planned/not-tested separately.

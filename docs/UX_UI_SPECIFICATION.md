# UX / UI specification

> **Status: IMPLEMENTATION (NASA Space Apps 2026, started 14 Nov 2026 00:00 ICT; authorized by project owner Trung).**

Discover → Observe → Compare → Understand. Guided UX flow for Mekong Delta (ĐBSCL) surface change exploration, prioritizing Dong Thap Muoi wetland. Explore mode for general audience, Research mode for full scientific metadata.
AOI drawing in MVP navigates prepared coverage; an unsupported AOI gives an honest
unavailable state, never an implied on-demand scientific job.

## Desktop wireframe

```text
NISAR ChangeLens — See Change. Understand Earth.        Sources / About
Discover → Observe → Compare → Understand
┌ Region / dates ──────┬──────────────────────────────────────────┐
│ [Region]             │                                          │
│ [Observation A]      │                 MAP                      │
│ [Observation B]      │ Before UTC date  │ After UTC date          │
│ Pair gate + reason   │                 │ divider                 │
│ [View evidence]      │ Zoom / fit / scale / attribution          │
├─────────────────────┴──────────────────────────────────────────┤
│ Before | After | Swipe | Change | Opacity                       │
│ Shared measurement legend / change sign / valid area / NoData   │
├────────────────────────────────────────────────────────────────┤
│ Evidence drawer: observations | interpretation | research        │
└────────────────────────────────────────────────────────────────┘
```

Target map ≥two thirds of main desktop area with evidence drawer closed.
Collapsible panels must preserve legend and attribution.

## Mobile wireframe

```text
NISAR ChangeLens                 Sources
[Region] [Acquisitions]
Pair status + essential limitation
┌───────────────────────────────────────┐
│                  MAP                  │
│ Before / After dates                  │
│ Zoom / scale / attribution            │
└───────────────────────────────────────┘
Before | After | Swipe | Change
Compact legend [expand]
[Evidence and limitations ↑]
```

Selectors/evidence use one bottom sheet with close and return-focus behavior.
Keep dates, gate status and essential warnings visible. Display actual UTC
acquisition times, explaining local-time conversion; never use nominal cycle dates.

Divider must be keyboard and touch accessible, preferably a native range input
with visible focus, arrows, Home/End and an intelligible value label. Before/After
buttons provide a no-drag alternative. Verify touch assistive technology during
implementation. [W3C slider guidance](https://www.w3.org/WAI/ARIA/apg/patterns/slider/).
Before/after share camera, quantity, units, stretch and bounds. Change has its own
formula/sign legend. Use labels/pattern/luminance beyond hue; NoData never appears
as zero change. [W3C color guidance](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html).

Evidence has three separate sections: observed radar change; possible surface
explanations with alternatives; supported conclusions only with independent
evidence/review. No default flood labels or invented confidence percentages.
Research mode exposes collection/granule IDs, maturity, version/CRID, frequency,
polarization, geometry, quantity/representation/units, CRS/affine/grid, mask,
parameters and provenance. “Not recorded” remains missing evidence.

| State | Display and behavior |
|---|---|
| Initial/loading | Instructions/progress; no fabricated imagery or active unknown pair |
| No observations | AOI outline and search scope; comparison unavailable |
| One observation | Observation inspection enabled; pair comparison disabled |
| Failed/unknown compatibility | Specific reasons accessible, including disabled options |
| Partial support | Valid boundary and excluded mask; restrict interpretation |
| Pair changed/loading | Clear previous overlay/status/legend; ignore obsolete responses |
| Missing layer | Explicit unavailable layer; no missing-as-unchanged pixels |
| NASA unavailable | Curated release still usable; live-refresh limitation stated |
| Basemap/render failure | Retain text/coordinates and released image fallback if available |
| Request failure | Safe code, explanation and bounded manual retry |

## UX cross-review against scientific validity

This cross-review is of proposed requirements, not real acquisitions.

| Requirement | UX guard / acceptance |
|---|---|
| Compatible quantity/units/frequency/polarization | Show field values; unknown/mismatch disables Compare |
| Geometry/orbit and calibration/CRID | Explain review and differences; names alone cannot approve |
| Full grid alignment | Require actual alignment result; matching CRS insufficient |
| Joint valid support/NoData | Visible exclusions and denominator; unavailable pixels not change |
| Distinct evidence levels | Hypothesis cannot be promoted without supporting references |
| Uncertainty | Essential warnings persist; no invented scores |
| Pair identity | All views/evidence bound to same release and pair |
| Preparation placeholders | Never label wireframes or schematic values as observations |

Planned acceptance: keyboard-only flow; narrow mobile layout; disabled unknown
pairs; rapid pair-switch race; color-independent invalid mask; anonymous demo;
all displayed scientific labels trace to the same manifest. None has run yet.

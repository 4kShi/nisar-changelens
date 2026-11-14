# Project specification

> **Status: IMPLEMENTATION (NASA Space Apps 2026, started 14 Nov 2026 00:00 ICT; authorized by project owner Trung).**

NISAR ChangeLens / “See Change. Understand Earth.” targets NASA Space Apps 2026,
Dancing with the SARs, Hanoi. Implementation authorized 14 Nov 2026 00:00 ICT.
Geographic scope is strictly Mekong Delta (ĐBSCL), prioritizing Dong Thap Muoi.

## People and scope

General users need an understandable map of what radar measured and what remains
uncertain. EO researchers need discovery metadata, compatibility reasoning,
quantitative source references and a reproducible method. Both use an anonymous
public demonstration; private acquisition may require an authorized Earthdata account.

Start with one bounded AOI, one scientifically compatible pair and one calibrated
diagonal intensity channel. Mekong Delta / Dong Thap Muoi and water/wetland change
are candidates. No geometry, dates or pair has been selected. Avoid adding extra
regions to compensate for an invalid pair; record an explicitly reviewed scope change.

## Proposed essential behavior

| Feature | Benefit / evaluation criterion | Acceptance condition |
|---|---|---|
| Region and observation discovery | Impact, Relevance | Actual published coverage and observation identities; empty state when absent |
| Scientific compatibility gate | Validity, Creativity | Every required rule passes with evidence before comparison |
| Map and before/after comparison | Presentation, Impact | Synchronized views, same quantity/stretch, keyboard alternative |
| Signed radar-change overlay | Validity, Relevance | Formula, valid support, units and legend agree with provenance |
| Evidence and limitations | Validity, Creativity | Observation/hypothesis/conclusion remain distinct |
| Public stable release | Presentation, Impact | Anonymous access independent of live NASA authentication |
| Reproducible handoff | Validity, Presentation | Frozen inputs/subsets, parameters, environment and asset hashes |

P1 research panel, context, export and guided story may follow only after P0.
P2 models, segmentation, multiple regions and long timelines are optional.
No live arbitrary AOI analysis, operational flood warning or displacement claim
is promised. No model is required.

The full future flow and failure states are specified in `UX_UI_SPECIFICATION.md`.
Release contract `1.0` is in `API_CONTRACTS.md`; it is the naming authority for
public resources. Science approval is an offline recorded decision, not a browser
schema check. The frontend may display approved available observations without
implying a compatible pair.

Success means an honest, small, accessible demonstration of authentic NISAR radar
change. It does not mean proving a hydrological cause without independent evidence.
No scientific accuracy, model performance or user impact metric has been measured.

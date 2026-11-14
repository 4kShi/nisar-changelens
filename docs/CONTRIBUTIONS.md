# Team 4/K — Member Roster & Contribution Audit (`CONTRIBUTIONS.md`)

**Project**: NISAR ChangeLens (*"See Change. Understand Earth."*)  
**Team**: `4/K`  
**Challenge**: NASA Space Apps Challenge 2026 — *Dancing with the SARs*  
**Local Event**: Hanoi, Vietnam  
**Official Team Page**: https://www.spaceappschallenge.org/2026/find-a-team/4k/?tab=members  
**Audit Date**: 2026-11-14

---

## 1. Official Team Roster Verification

On 2026-11-14, the official NASA Space Apps Challenge 2026 team page (`https://www.spaceappschallenge.org/2026/find-a-team/4k/?tab=members`) was inspected in a live browser (`HTTP 200 OK`). The official roster lists **two registered team members**:

1. **Phạm Thành Trung** — *Team Owner* (Vietnam; Local Event: Hanoi, Vietnam)
2. **Lý Chấn Hưng** — *Member* (Vietnam; Local Event: Hanoi, Vietnam)

No public usernames/handles or individual role bios are displayed on the Space Apps team page itself.

---

## 2. Individual & Collaborative Contribution Audit Table

In accordance with NASA Space Apps transparency standards, the table below records only contributions supported by verifiable project evidence (`docs/IMPLEMENTATION_LOG.md`, `docs/TEAM_HANDOFF.md`, `docs/AI_USAGE.md`, `LICENSE`, and workflow transcripts) and explicitly marks unverified individual task splits as **`NEEDS TEAM CONFIRMATION`**.

| Team Member | Actual Contribution | Related Components/Files | Evidence | Verification Status |
| :--- | :--- | :--- | :--- | :--- |
| **Phạm Thành Trung** *(Team Owner)* | **Verified**: Project owner & team lead; defined the Mekong Delta (Đồng bằng sông Cửu Long) surface-water & wetland research focus; established the 4-tier evidence hierarchy and 250 MB HTTP Range byte-budget governance; formally authorized hackathon implementation on `2026-11-14 00:00 ICT`; directed and reviewed AI-assisted engineering, scientific QA audit (`W-1`/`W-2`), and bilingual (`EN`/`VI`) verification.<br><br>**Unverified individual vs. collaborative split**: Exact division of manual review, slide deck authoring, and live presentation delivery between team members. | `LICENSE`, `README.md`, `docs/TEAM_HANDOFF.md`, `docs/IMPLEMENTATION_LOG.md`, `docs/AI_USAGE_DISCLOSURE.md`, `docs/SCIENTIFIC_METHODOLOGY.md`, `pipeline/`, `frontend/` | Named as Team Owner on official Space Apps page (`find-a-team/4k`) and explicitly recorded as Project Owner / Lead in `LICENSE`, `docs/IMPLEMENTATION_LOG.md`, `docs/TEAM_HANDOFF.md`, and `docs/SUBMISSION.md`. | **PARTIALLY VERIFIED** *(Leadership, architecture & authorization verified; exact split with teammate `NEEDS TEAM CONFIRMATION`)* |
| **Lý Chấn Hưng** *(Member)* | Registered member of Team `4/K` on the official NASA Space Apps Challenge 2026 Hanoi roster.<br><br>Specific individual contributions (e.g., domain research, Mekong Delta case-study review, UI/UX feedback, testing, pitch deck preparation, or video/presentation production) are **not separately itemized** in the local repository logs or commit metadata. | `docs/CONTRIBUTIONS.md`, `docs/SUBMISSION.md` *(pending confirmation of specific modules/slides/research)* | Verified on official Space Apps Team `4/K` page (`https://www.spaceappschallenge.org/2026/find-a-team/4k/?tab=members`). Not separately named in local repository files. | **`NEEDS TEAM CONFIRMATION`** |

---

## 3. Collaborative & AI-Assisted Engineering Distinction

- **Human Direction & Governance**: Human team leadership defined the challenge scope (Mekong Delta surface-water and agricultural backscatter variability), enforced strict scientific honesty rules (never fabricating SAR rasters, never equating coarse catalog footprints with valid pixels, and never claiming binary flood extent from $\Delta\gamma^0$ alone), and approved the two-stage bounded HDF5 extraction strategy (`13.53%` of the 250 MB byte budget used).
- **AI-Assisted Software & Documentation Implementation**: As disclosed in [`docs/AI_USAGE_DISCLOSURE.md`](AI_USAGE_DISCLOSURE.md), software implementation (`pipeline/` and `frontend/`), automated test generation (`tests/pipeline/` and `frontend/src/test/`), independent scientific verification scripts (`docs/FINAL_SCIENTIFIC_QA.md`), and bilingual (`EN | VI`) translations were executed using AI-assisted agentic workflows (**Google Antigravity `agy`**, **OpenAI Codex**, and **ChatGPT**) under human supervision and acceptance testing.

---

## 4. Checklist of Missing Information Requiring Team Confirmation Before Final Submission

Before publishing the final submission or public repository, **Phạm Thành Trung** and **Lý Chấn Hưng** must confirm and update the following items in this file and `README.md`:

1. **Individual Role & Task Breakdown for Lý Chấn Hưng**:
   - Confirm which specific project activities were performed by **Lý Chấn Hưng** (e.g., SAR/Mekong Delta literature review, AOI screening, UI/UX testing, Vietnamese terminology review, 7-slide presentation deck, or 30-second video production).
2. **Collaborative vs. Individual Work Attribution**:
   - Confirm which sections of the presentation script (`docs/SUBMISSION.md`) and demo walkthrough (`docs/DEMO_GUIDE.md`) were prepared jointly vs. individually.
3. **Copyright & License Holder Line**:
   - Confirm whether the copyright notice in [`LICENSE`](../LICENSE) (`Copyright (c) 2026 Phạm Thành Trung and NISAR ChangeLens team`) should explicitly list both team members by full name (`Phạm Thành Trung and Lý Chấn Hưng — Team 4/K`).

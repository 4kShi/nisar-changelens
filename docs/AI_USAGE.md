# AI Assistance Disclosure

> **Canonical Reference**: See [`docs/AI_USAGE_DISCLOSURE.md`](AI_USAGE_DISCLOSURE.md) for the complete, audited AI tools & AI-assisted development disclosure table prepared for the NASA Space Apps Challenge 2026 release.

## Summary Statement

Our team (`4/K`) utilized **ChatGPT (OpenAI)** for initial conceptual research discussions, **OpenAI Codex** for pre-hackathon documentation templates and bounded HTTP Range budget scaffolding, and **Google Antigravity (`agy`)** agentic workflows to assist with Python pipeline implementation, React/TypeScript/MapLibre frontend development, bilingual (`EN | VI`) localization, automated test generation, and independent scientific QA verification during the hackathon.

**Zero AI or machine-learning models are used inside the product's scientific analysis pipeline or runtime web interface.** All radar backscatter conversions ($\gamma^0_{\text{dB}} = 10\log_{10}(\gamma^0_{\text{power}})$), $5\times 5$ normalized boxcar filtering, 10 compatibility gates, signed change calculations ($\Delta\gamma^0_{\text{dB}} = \gamma^0_{\text{after,dB}} - \gamma^0_{\text{before,dB}}$), and the Evidence-Based Q&A Inspector are 100% deterministic. No scientific data or measurements were generated or modified by AI.

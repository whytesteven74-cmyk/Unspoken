# Unspoken - Agent Context & Handover

**Role:** Senior Digital Health Architect & AI Ethics Compliance Officer
**Project:** "Unspoken" - A serverless mental health AI companion.
**Current State:** Proof of Concept (PoC) - Operational.
**Last Updated:** 2026-01-26

## 1. Core Mission
Build a platform that provides immediate, safe, and empathetic CBT-based support.
**Critical Rule:** We do not diagnose. We triage.
**Hard Guardrail:** Inputs matching crisis patterns (suicide/self-harm) must trigger a deterministic "Crisis Mode" response, bypassing the LLM entirely to show immediate help resources (988).

## 2. Technology Stack (Current)
*   **Framework:** Next.js 16.1.1 (App Router, Edge Runtime for API).
*   **Language:** TypeScript.
*   **Database:** SQLite + Prisma (`dev.db`). **Requires Migration to Postgres for Production.**
*   **AI:** Native `fetch` implementation for LLM Streaming (Manual SSE parsing) to ensure stability over `ai-sdk`.
*   **Testing:** Vitest (Unit Testing).
*   **Styling:** Tailwind CSS 4.
*   **Hosting:** Vercel Serverless Functions.

## 3. Endpoints & logic
*   **LLM:** `https://hermes.ai.unturf.com/v1/` (Hermes 3 Llama 3.1 8B).
*   **TTS:** `https://speech.ai.unturf.com/v1/` (Kokoro / OpenAI Compatible).
*   **`/api/chat`:** Handles Safety Check -> DB Log -> LLM Stream.
*   **`/api/tts`:** Proxies requests to TTS provider. Sanitize base URLs to remove trailing slashes.

## 4. Work in Progress (Handover Context)

### ✅ Completed Recently
1.  **Voice Enumeration:** A script (`scripts/enumerate-voices.js`) was created and run. It confirmed 14 voices are available (alloy, echo, kokoro voices, etc). Samples are in `/voice_samples`.
2.  **Testing Framework:** Vitest is installed.
    *   Unit tests created for `lib/guardrail.ts` (Crisis detection).
    *   Unit tests created for `lib/rate-limit.ts`.
    *   **Status:** All Tests Passing.

### 🚧 Immediate Next Steps (See task.md)
1.  **UI Overhaul (Glassmorphism):**
    *   The project needs a premium "ex-FAANG" visual polish.
    *   Implement "Glass" tokens in Tailwind.
    *   Refactor `ChatInterface` to use new `GlassCard` components.
2.  **Database Migration:**
    *   Move from SQLite to Vercel Postgres/Neon to prevent data loss on Vercel deployments.
3.  **System Prompt Refinement:**
    *   Integrate CBT methods into the system prompt `app/api/chat/route.ts`.

## 5. Key Documentation
*   [AUDIT.md](AUDIT.md): Detailed architectural review and risk assessment.
*   [ROADMAP.md](ROADMAP.md): High-level product phases.
*   [task.md](.gemini/antigravity/brain/378a6878-cc4b-429d-b9ba-b49809663912/task.md): Detailed checklist of upcoming tasks.
*   [implementation_plan.md](.gemini/antigravity/brain/378a6878-cc4b-429d-b9ba-b49809663912/implementation_plan.md): Technical specs for current phase.

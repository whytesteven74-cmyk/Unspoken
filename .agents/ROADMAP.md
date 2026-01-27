# Unspoken Product Roadmap
**Objective:** Evolve from PoC to Premium MVP.

## Phase 1: Foundation & Reliability (Current Priority)
*Focus: Ensuring data is safe and code is verified.*

1.  **Database Migration** 🔴
    *   Switch from SQLite to Vercel Postgres/Neon to ensure data persistence.
    *   Run migrations.
2.  **Testing Framework Expansion** 🟡
    *   Install Jest/Vitest.
    *   Write Unit Tests for: `guardrail.ts`, `rate-limit.ts`.
    *   Write Component Tests for: `chat-interface.tsx`.
3.  **Voice Enumeration Utility** 🟢
    *   Build a script to query the TTS endpoint (`https://speech.ai.unturf.com/v1`).
    *   List all available voices and sample them.
    *   Select "Golden Set" of natural voices.

## Phase 2: Refinement & Intelligence
*Focus: Making the AI feel human.*

1.  **System Prompt Overhaul**
    *   Integrate CBT (Cognitive Behavioral Therapy) frameworks.
    *   Experiment with "Persona" tuning.
2.  **Natural Voice Integration**
    *   Map emotion (Stress/Valence) to Voice attributes (Speed/Pitch/Voice ID).
    *   Implement "Pause" tokens for natural pacing.

## Phase 3: "Glassmorphism" UI & Branding
*Focus: Visual WOW factor.*

1.  **Design System Upgrade**
    *   Define "Glass" tokens (background-blur, white-opacity borders).
    *   Update `tailwind.config.ts`.
2.  **Visual Assets**
    *   Design Logo (Abstract/Emotive).
    *   Create Social Media Link components.
3.  **Micro-Interactions**
    *   Add `framer-motion` for message bubbles, typing indicators, and biometric gauges.

## Phase 4: Production Launch Prep
1.  **Security Audit**: Content Security Policy (CSP), Auth integration.
2.  **SEO & Metadata**.
3.  **Final Load Testing**.

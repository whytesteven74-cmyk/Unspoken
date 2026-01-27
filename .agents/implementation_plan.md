# Implementation Plan - Reliability & Polish

## Goal Description
Establish a robust testing foundation using Vitest to ensure system stability, then execute a comprehensive UI overhaul to achieve a premium "Glassmorphism" aesthetic suitable for a mental health application.

## User Review Required
> [!IMPORTANT]
> **Database**: We are currently ensuring the Testing framework works with the *existing* SQLite setup for now, but the Roadmap calls for a migration to Postgres. This plan focuses on Code Quality (Testing) and UI. Database migration is a separate infrastructure task.

## Proposed Changes

### 1. Testing Framework (Vitest) [COMPLETE]
We have successfully set up **Vitest** for unit testing.

#### [COMPLETE] [vitest.config.ts](file:///c:/Users/User/OneDrive/Documents/Unspoken/vitest.config.ts)
Configuration for the test runner. Includes exclusion for Playwright tests.

#### [COMPLETE] [lib/guardrail.test.ts](file:///c:/Users/User/OneDrive/Documents/Unspoken/lib/guardrail.test.ts)
Unit tests for crisis detection logic.
- Verified: Suicide/Self-harm detection logic passes.

#### [COMPLETE] [lib/rate-limit.test.ts](file:///c:/Users/User/OneDrive/Documents/Unspoken/lib/rate-limit.test.ts)
- Verified: Rate limiting logic correctly blocks requests after limit (20) is exceeded.

### 2. UI Overhaul (Glassmorphism)

#### [MODIFY] [tailwind.config.ts](file:///c:/Users/User/OneDrive/Documents/Unspoken/tailwind.config.ts)
- Add custom colors: `glass-background`, `glass-border`.
- Add custom utilities for backlog-filter blur.

#### [NEW] [components/ui/glass-card.tsx](file:///c:/Users/User/OneDrive/Documents/Unspoken/components/ui/glass-card.tsx)
A reusable container component with:
- `backdrop-blur-md`
- `bg-white/10` (or dark mode equivalent)
- `border-white/20`
- `shadow-xl`

#### [MODIFY] [components/chat-interface.tsx](file:///c:/Users/User/OneDrive/Documents/Unspoken/components/chat-interface.tsx)
- Replace standard `div` containers with `GlassCard`.
- Update typography to be more "airy" and readable.
- Integrate `framer-motion` for message arrival.

#### [NEW] [components/branding/logo.tsx](file:///c:/Users/User/OneDrive/Documents/Unspoken/components/branding/logo.tsx)
- SVG based logo representing "Unspoken" (e.g., soundwave or abstract speech bubble).

## Verification Plan

### Automated Tests
- Run `npm run test` (to be added) to verify unit tests pass.
- Run `npx playwright test` to ensure E2E flows remain unbroken by UI changes.

### Manual Verification
- Visual inspection of the "Glass" effect on Light and Dark modes.
- Verify Voice Enumeration script output (already verified).

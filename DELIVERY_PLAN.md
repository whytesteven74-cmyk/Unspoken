# Unspoken - Delivery Plan & Roadmap

## 🎯 Executive Summary
Unspoken is an empathetic CBT companion leveraging biometric data and LLMs to provide real-time emotional support. This document outlines the technical delivery roadmap to transition from prototype to production-grade application.

## 🏗️ Technical Architecture
- **Frontend**: Next.js 15 (App Router), TailwindCSS, Framer Motion
- **Backend**: Next.js API Routes (Node.js runtime)
- **AI**: Custom LLM Proxy with Biometric Context Parsing
- **Testing**: Playwright (E2E), Jest (Unit/Integration - *To Be Added*)
- **CI/CD**: GitHub Actions

---

## 📅 Phased Delivery Roadmap

### Phase 1: Stabilization & Foundation (Current) ✅
**Goal:** Ensure core chat loop is reliable and testable.
- [x] **Fix Chat Streaming**: Implemented robust buffering and parsing for split chunks.
- [x] **Runtime Stability**: Switched API to `nodejs` runtime for better compatibility.
- [x] **E2E Testing Setup**: configured Playwright and wrote baseline chat specs.
- [x] **CI/CD Pipeline**: GitHub Actions workflow created for automated testing.

### Phase 2: Core Feature Completeness (Complete) ✅
- [x] **Biometric Input UI**: Frontend controls for "Stress", "Pitch", "Jitter" to simulate biosignals.
- [x] **Voice Input Integration**: Web Speech API integration for microphone support.
- [x] **Session Memory**: Database integration (Prisma + SQLite) to store chat history and biometric snapshots.
- [x] **TTS Refinement**: Optimized `useTTS` with audio queueing for smooth playback.
- [x] **Crisis Mode Overlay**: Trigger implemented with "Help" resources.

### Phase 3: Production Hardening (In Progress) 🛡️
**Goal:** Prepare for real-world traffic and edge cases.
- [x] **Rate Limiting**: In-memory rate limiter added to `/api/chat`.
- [x] **Error Boundaries**: add React Error Boundaries for graceful UI failure states.
- [x] **Analytics**: Integrate simple event tracking for user interaction.
- [ ] **Security Audit**: Review Content Security Policy (CSP) and API key handling.

### Phase 4: Launch & Scale 🚀
**Goal:** Public release.
- [ ] **Domain Configuration**: Final DNS propagation checks.
- [ ] **SEO Optimization**: Metadata, OpenGraph tags, and sitemap.
- [ ] **User Feedback Loop**: Mechanism for users to flag unhelpful AI responses.

---

## 🛠️ DevOps & Quality Standards

### CI/CD Pipeline
We follow a trunk-based development workflow:
1.  **Feature Branches**: All work is done on `feat/` or `fix/` branches.
2.  **Pull Requests**: Must pass CI (Lint + Build + Playwright Tests) before merge.
3.  **Automated Deploy**: Merges to `main` automatically deploy to Vercel Production.

### Testing Strategy
- **E2E (Playwright)**: Covers critical user journeys (Chat flow, Crisis overlay trigger).
- **Manual Verification**: "Smoke test" new AI models for tone consistency.

### Monitoring
- **Logs**: Structured logs in Vercel.
- **Alerts**: Set up for 500 errors and high latency (>3s).

---

## 📝 Immediate Next Steps
1.  Perform **Security Audit** (Content Security Policy).
2.  Review API Key management (ensure no leakage).
3.  Prepare for Phase 4 (Launch).

# Unspoken Task List

## Phase 1: Foundation & Reliability
- [ ] **Database Migration**
    - [ ] Set up Vercel Postgres/Neon project <!-- id: 0 -->
    - [ ] Update `DATABASE_URL` and `schema.prisma` <!-- id: 1 -->
    - [ ] Run initial migration <!-- id: 2 -->
    - [ ] Verify persistence with `/api/test` <!-- id: 3 -->
- [x] **Testing Framework**
    - [x] Install Vitest/Jest and Testing Library <!-- id: 4 -->
    - [x] Configure test runner scripts <!-- id: 5 -->
    - [x] **Unit Tests**
        - [x] Write tests for `lib/guardrail.ts` <!-- id: 6 -->
        - [x] Write tests for `lib/rate-limit.ts` <!-- id: 7 -->
    - [ ] **Integration Tests**
        - [ ] Write tests for `/api/chat` (Mocked DB/LLM) <!-- id: 8 -->
- [x] **Voice Enumeration**
    - [x] Create enumeration script <!-- id: 9 -->
    - [x] Run script and generate samples <!-- id: 10 -->
    - [ ] Analyze samples and select optimal voice list <!-- id: 11 -->

## Phase 2: Intelligence & Refinement
- [ ] **System Prompt Engineering**
    - [ ] Draft "Persona" refined prompt (CBT/Empathy focus) <!-- id: 12 -->
    - [ ] Implement dynamic prompt injection based on user state <!-- id: 13 -->
- [ ] **Natural Voice Logic**
    - [ ] Implement voice selection logic based on emotion <!-- id: 14 -->
    - [ ] Add "Pause" token handling for TTS <!-- id: 15 -->

## Phase 3: Glassmorphism & UI Polish
- [ ] **Design System**
    - [ ] Define "Glass" tokens in Tailwind config (blur, opacity, noise) <!-- id: 16 -->
    - [ ] Create specialized `GlassCard` and `GlassButton` components <!-- id: 17 -->
- [ ] **Chat Interface Overhaul**
    - [ ] Apply glassmorphism to chat bubbles and container <!-- id: 18 -->
    - [ ] Improve typography (Inter/Outfit fonts) <!-- id: 19 -->
    - [ ] Add `framer-motion` entrance animations <!-- id: 20 -->
- [ ] **Branding**
    - [ ] Design and implement Logo component <!-- id: 21 -->
    - [ ] Add Social Media links <!-- id: 22 -->

## Phase 4: Production Readiness
- [ ] **Security Audit**
    - [ ] Implement CSP headers <!-- id: 23 -->
    - [ ] Review API Key exposure risks <!-- id: 24 -->
- [ ] **Docs & Final Polish**
    - [ ] Complete Project README <!-- id: 25 -->
    - [ ] Final E2E Test Run <!-- id: 26 -->

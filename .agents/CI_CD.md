# CI/CD Guidelines & Methodology

## Core Philosophy
**"Verify Locally, Deploy Confidently."**
We avoid "testing in production" by enforcing strict local verification before any code reaches the remote repository.

## The Workflow Cycle

### 1. Development Phase
- **Feature Branches**: All work happens in feature branches (e.g., `feature/glass-ui`, `fix/voice-enumeration`).
- **Unit Testing**: Run `npm run test` continuously during development. All unit tests must pass.

### 2. Local Verification Phase (The "Gatekeeper")
Before committing, the following must be validated:
- ** Automated Tests**: 
  - `npm run test` (Vitest) must be GREEN.
  - `npx playwright test` (if applicable) must be GREEN.
- **Visual Verification**: 
  - Start local server: `npm run dev`.
  - **Browser Subagent**: Use the AI agent to browse `localhost:3000`.
  - **Checklist**:
    - [ ] No console errors.
    - [ ] UI renders correctly (responsiveness, theme).
    - [ ] Critical user flows (e.g., Chat input) function.

### 3. Commit & Push
Only after passing Phase 2:
- Commit with conventional messages (e.g., `feat: implement glassmorphism ui`).
- Push to remote.
- **CI Server**: Vercel/GitHub Actions will run build/test pipeline.

## Standard Commands
- **Unit Tests**: `npm run test`
- **UI Tests**: `npx playwright test`
- **Dev Server**: `npm run dev`
- **Lint**: `npm run lint`

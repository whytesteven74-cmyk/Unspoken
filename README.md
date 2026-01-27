# Unspoken

**Unspoken** is a serverless mental health bridge application designed to triage users based on text, voice, and facial biomarkers. It offers immediate, non-judgmental CBT support for non-emergencies while rigorously detecting crisis intent to hard-route users to human professionals.

## 🚀 Features

-   **Multimodal Analysis**:
    -   **Text**: Intent detection via Hermes 3 (Llama 3.1 8B).
    -   **Voice**: Real-time jitter and pitch analysis for stress detection.
    -   **Facial**: (Roadmap) Video-based micro-expression analysis.
-   **Adaptive "Therapeutic" Voice**:
    -   Dynamically switches TTS voices (Onyx, Echo, Alloy) based on user stress levels.
-   **Safety First (Hard Guardrails)**:
    -   Deterministic regex and keyword logic detects "I want to kill myself" or self-harm intent *before* AI processing.
    -   Immediate redirection to crisis resources.
-   **Premium UI**:
    -   Glassmorphism design system (Tailwind + Framer Motion).
    -   Privacy-focused "Private & Encrypted" indicators.

## 🛠 Tech Stack

-   **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
-   **Database**: [Neon Postgres](https://neon.tech/) (Prisma ORM)
-   **AI**:
    -   **LLM**: Hermes 3 Llama 3.1 8B (Custom Endpoint)
    -   **TTS**: Kokoro (Custom Endpoint)
-   **Styling**: Tailwind CSS + `framer-motion`
-   **Testing**: Vitest + React Testing Library

## 🏁 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/whytesteven74-cmyk/Unspoken.git
cd Unspoken
npm install
```

### 2. Environment Setup
Create a `.env.local` file:
```env
# Database (Neon)
DATABASE_URL="postgresql://user:password@ep-xyz.us-east-2.aws.neon.tech/unspoken-db?sslmode=require"

# AI Services
LLM_BASE_URL="https://hermes.ai.unturf.com/v1"
LLM_MODEL="adamo1139/Hermes-3-Llama-3.1-8B-FP8-Dynamic"
LLM_API_KEY="your-llm-key"

TTS_BASE_URL="https://speech.ai.unturf.com/v1"
TTS_MODEL="tts-1-kokoro"
TTS_API_KEY="your-tts-key"

# Security
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Database Migration
Initialize the Neon Postgres schema:
```bash
npx prisma migrate dev --name init
```

### 4. Run Development Server
```bash
npm run dev
# Open http://localhost:3000
```

## 🧪 Testing

Run the full test suite (Unit + Integration):
```bash
npm test
```

## 🔒 Security

-   **CSP**: Strict Content-Security-Policy enabled via `middleware.ts`.
-   **Encryption**: All sensitive environmental variables are server-side only.

## 📄 License
MIT

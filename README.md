# Unspoken

Unspoken is a serverless mental health bridge application designed to triage users based on text, voice, and facial biomarkers. It provides immediate CBT support for non-emergencies and hard-routes crises to human professionals.

## Features

- **Multimodal Analysis:** Integrates text, voice (pitch/jitter), and facial expression analysis for a "Digital Psychological Signature".
- **Safety First:** "Hard Guardrail" protocol ensures crisis intent is detected deterministically *before* LLM inference.
- **Privacy Focused:** Client-side biometric processing; only derived scores are sent to the server.
- **Explainable AI:** Uses the TIFU framework to provide transparent rationales for triage decisions.

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Database:** Supabase (PostgreSQL + pgvector)
- **AI Orchestration:** Vercel AI SDK
- **LLM:** Hermes 3 Llama 3.1 8B (via Custom Endpoint)
- **TTS:** UncloseAI Kokoro (via Custom Endpoint)
- **Styling:** Tailwind CSS

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/whytesteven74-cmyk/Unspoken.git
    cd Unspoken
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    Create a `.env.local` file in the root directory with the following keys:
    ```bash
    # AI Services
    LLM_BASE_URL="https://hermes.ai.unturf.com/v1"
    LLM_MODEL="adamo1139/Hermes-3-Llama-3.1-8B-FP8-Dynamic"
    LLM_API_KEY="your-llm-api-key"

    TTS_BASE_URL="https://speech.ai.unturf.com/v1"
    TTS_MODEL="tts-1-kokoro"
    TTS_API_KEY="your-tts-api-key"

    # Supabase (Coming Soon)
    NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
    NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Documentation

See [Gemini.md](./Gemini.md) for detailed architectural and ethical guidelines.

## Deploy on Vercel

The project is configured for deployment on Vercel. Push to the `main` branch to trigger a deployment.

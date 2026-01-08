import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { guardrailCheck } from '@/lib/guardrail';
import { BiometricData } from '@/lib/types';
import { z } from 'zod';

// Configurable via environment variables
const LLM_BASE_URL = process.env.LLM_BASE_URL || 'https://hermes.ai.unturf.com/v1';
const LLM_MODEL = process.env.LLM_MODEL || 'adamo1139/Hermes-3-Llama-3.1-8B-FP8-Dynamic';
const LLM_API_KEY = process.env.LLM_API_KEY || 'sk-placeholder';

const customOpenAI = createOpenAI({
    baseURL: LLM_BASE_URL,
    apiKey: LLM_API_KEY,
});

export const runtime = 'edge';

export async function POST(req: Request) {
    const { messages, biometricData } = await req.json();

    // 1. Hard Guardrail Check
    const lastUserMessage = messages[messages.length - 1];
    if (lastUserMessage && lastUserMessage.role === 'user') {
        const safetyResult = guardrailCheck(lastUserMessage.content);

        if (!safetyResult.isSafe) {
            return Response.json(safetyResult.crisisResponse, { status: 400 }); // Or specific crisis status
        }
    }

    // 2. Construct System Prompt with Biometric Context
    const bioData = biometricData as BiometricData;
    const stressLevel = bioData?.derived_stress_score || 0;

    const systemPrompt = `
    You are Unspoken, an empathetic CBT companion.
    
    Current User Context:
    - Detected Stress Level: ${stressLevel} (Range: 0-1)
    - Voice Jitter: ${bioData?.jitter_percent || 'N/A'}%
    - Face Valence: ${bioData?.face_valence || 'N/A'}
    
    Instructions:
    - If stress is high (> 0.7), use calming, grounding language.
    - If stress is low, be encouraging and reflective.
    - Do NOT diagnose.
    - Keep responses concise (under 3 sentences unless asked for more).
  `;

    // 3. Stream Response
    const result = await streamText({
        model: customOpenAI(LLM_MODEL),
        system: systemPrompt,
        messages: messages.map((m: any) => ({ role: m.role as 'user' | 'assistant' | 'system', content: m.content })),
    });

    return result.toTextStreamResponse();
}

import { guardrailCheck } from '@/lib/guardrail';
import { BiometricData } from '@/lib/types';
import { prisma } from '@/lib/prisma';
import { isRateLimited } from '@/lib/rate-limit';

export const runtime = 'nodejs';

// Configurable via environment variables
const LLM_BASE_URL = process.env.LLM_BASE_URL || 'https://hermes.ai.unturf.com/v1';
const LLM_MODEL = process.env.LLM_MODEL || 'adamo1139/Hermes-3-Llama-3.1-8B-FP8-Dynamic';
const LLM_API_KEY = process.env.LLM_API_KEY || 'sk-placeholder';

export async function GET() {
    return Response.json({ status: "alive", method: "GET" });
}

export async function POST(req: Request) {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    if (isRateLimited(ip)) {
        return Response.json({ error: "Too Many Requests" }, { status: 429 });
    }

    try {
        const { messages } = await req.json();
        const lastUserMessage = messages?.[messages.length - 1];

        if (lastUserMessage && lastUserMessage.role === 'user') {
            const safetyResult = guardrailCheck(lastUserMessage.content);
            if (!safetyResult.isSafe) {
                return Response.json(safetyResult.crisisResponse, { status: 400 });
            }
        }

        return Response.json({ status: "alive", method: "POST", messageCount: messages?.length });
    } catch (e) {
        return Response.json({ error: "Invalid Request" }, { status: 400 });
    }
}

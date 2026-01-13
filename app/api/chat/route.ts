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

    let savedUserId = "";

    try {
        const body = await req.json();
        const { messages, biometricData } = body;

        // --- DATABASE INTEGRATION START ---
        let user = null;
        try {
            user = await prisma.profile.findFirst({ where: { is_anonymous: true } });
            if (!user) {
                user = await prisma.profile.create({ data: { is_anonymous: true, consented_to_biometrics: true } });
            }
            savedUserId = user.id;
        } catch (dbError) {
            console.warn("[API] DB Connection Warning (Profile):", dbError);
        }

        const bioData = biometricData as BiometricData;
        const stressLevel = bioData?.derived_stress_score || 0;

        if (savedUserId) {
            try {
                await prisma.triageEvent.create({
                    data: {
                        user_id: savedUserId,
                        voice_jitter: bioData?.jitter_percent || 0,
                        face_valence: bioData?.face_valence || 0,
                        risk_level: stressLevel > 0.8 ? 'crisis' : stressLevel > 0.5 ? 'moderate' : 'low',
                        created_at: new Date()
                    }
                });
            } catch (e) { console.warn("[API] DB Warning (Triage):", e); }
        }

        const lastUserMessage = messages?.[messages.length - 1];
        if (savedUserId && lastUserMessage?.role === 'user') {
            try {
                await prisma.message.create({
                    data: {
                        user_id: savedUserId,
                        role: 'user',
                        content: lastUserMessage.content
                    }
                });
            } catch (e) { console.warn("[API] DB Warning (User Msg):", e); }
        }
        // --- DATABASE INTEGRATION END ---

        if (lastUserMessage && lastUserMessage.role === 'user') {
            const safetyResult = guardrailCheck(lastUserMessage.content);
            if (!safetyResult.isSafe) {
                return Response.json(safetyResult.crisisResponse, { status: 400 });
            }
        }

        return Response.json({ status: "alive", method: "POST", savedUserId });
    } catch (e) {
        return Response.json({ error: "Invalid Request", details: String(e) }, { status: 400 });
    }
}

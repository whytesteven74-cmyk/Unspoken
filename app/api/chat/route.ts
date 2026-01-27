import { guardrailCheck } from '@/lib/guardrail';
import { BiometricData } from '@/lib/types';
import { prisma } from '@/lib/prisma';
import { isRateLimited } from '@/lib/rate-limit';

export const runtime = 'nodejs';

// Configurable via environment variables
const BASE_URL_RAW = process.env.LLM_BASE_URL || 'https://hermes.ai.unturf.com/v1';
// Sanitize BASE_URL (remove trailing slash)
const LLM_BASE_URL = BASE_URL_RAW.endsWith('/') ? BASE_URL_RAW.slice(0, -1) : BASE_URL_RAW;

const LLM_MODEL = process.env.LLM_MODEL || 'adamo1139/Hermes-3-Llama-3.1-8B-FP8-Dynamic';
const LLM_API_KEY = process.env.LLM_API_KEY || 'sk-placeholder';

export async function GET() {
    return Response.json({
        status: "alive",
        method: "GET",
        env_base: BASE_URL_RAW,
        sanitized_base: LLM_BASE_URL,
        target_url: `${LLM_BASE_URL}/chat/completions`
    });
}

export async function POST(req: Request) {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    if (isRateLimited(ip)) {
        return Response.json({ error: "Too Many Requests" }, { status: 429 });
    }

    let responseTextAccumulator = "";
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
            } catch (e) { }
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
            } catch (e) { }
        }
        // --- DATABASE INTEGRATION END ---

        // 1. Hard Guardrail Check
        if (lastUserMessage && lastUserMessage.role === 'user') {
            const safetyResult = guardrailCheck(lastUserMessage.content);
            if (!safetyResult.isSafe) {
                return Response.json(safetyResult.crisisResponse, { status: 400 });
            }
        }

        // 2. Construct System Prompt
        // 2. Construct System Prompt
        const systemPrompt = `
        You are Unspoken, a highly empathetic and non-judgmental CBT companion.
        Your goal is to provide a safe space for the user to process their emotions using Cognitive Behavioral Therapy principles.

        CORE IDENTITY:
        - Role: Compassionate Listener & CBT Guide.
        - Tone: Warm, validating, calm, and grounded.
        - Style: Use "Reflective Listening" and gentle "Socratic Questioning" to help the user explore their thoughts.

        BIO-ADAPTIVE CONTEXT:
        - User Stress Level: ${stressLevel} (Range: 0-1)
        - Voice Jitter: ${bioData?.jitter_percent || 'N/A'}%
        - Face Valence: ${bioData?.face_valence || 'N/A'}

        ADAPTIVE INSTRUCTIONS:
        - IF STRESS IS HIGH (> 0.7):
          - Priority: De-escalation and Grounding.
          - Action: Use short, calming sentences. Suggest a deep breath if appropriate.
          - Avoid: Complex questions or deep cognitive analysis. Focus on the "here and now".
        - IF STRESS IS LOW/MODERATE:
          - Priority: Exploration and Insight.
          - Action: Encourage the user to elaborate. lightly challenge negative thought patterns (cognitive distortions) only if established rapport exists.

        STRICT BOUNDARIES:
        - DO NOT DIAGNOSE user conditions.
        - DO NOT provide medical or legal advice.
        - IF CRISIS DETECTED (Self-harm/Suicide): Immediately urge them to call emergency services (988). (However, Guardrails should catch this first).
        - Keep responses concise (under 3-4 sentences) to maintain a conversational flow.
        `;

        const openAIMessages = [
            { role: 'system', content: systemPrompt },
            ...messages.map((m: any) => ({ role: m.role, content: m.content }))
        ];

        // 5. Direct Fetch Proxy
        const upstreamResponse = await fetch(`${LLM_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${LLM_API_KEY}`
            },
            body: JSON.stringify({
                model: LLM_MODEL,
                messages: openAIMessages,
                stream: true,
                max_tokens: 500,
            })
        });

        if (!upstreamResponse.ok) {
            const errorText = await upstreamResponse.text();
            console.error("[API] Upstream Error:", upstreamResponse.status, errorText);
            // Return a more descriptive error if it's 405
            if (upstreamResponse.status === 405) {
                return Response.json({
                    error: "Upstream Method Not Allowed",
                    url: `${LLM_BASE_URL}/chat/completions`,
                    details: errorText
                }, { status: 405 });
            }
            return new Response(errorText, { status: upstreamResponse.status });
        }

        // 6. Stream Handling
        const encoder = new TextEncoder();
        const decoder = new TextDecoder();
        let buffer = '';

        const transformStream = new TransformStream({
            async transform(chunk, controller) {
                const text = decoder.decode(chunk, { stream: true });
                buffer += text;
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    const trimmedLine = line.trim();
                    if (!trimmedLine || trimmedLine === 'data: [DONE]') continue;

                    let json: any = null;
                    if (trimmedLine.startsWith('data:')) {
                        try {
                            json = JSON.parse(trimmedLine.replace(/^data:\s*/, ''));
                        } catch (e) { }
                    } else {
                        try { json = JSON.parse(trimmedLine); } catch (e) { }
                    }

                    if (json) {
                        const content = json.choices?.[0]?.delta?.content || json.content || json.response || json.message?.content;
                        if (content) {
                            responseTextAccumulator += content;
                            controller.enqueue(encoder.encode(content));
                        }
                    }
                }
            },
            async flush(controller) {
                if (savedUserId && responseTextAccumulator.trim()) {
                    try {
                        await prisma.message.create({
                            data: { user_id: savedUserId, role: 'assistant', content: responseTextAccumulator }
                        });
                    } catch (err) { }
                }
            }
        });

        return new Response(upstreamResponse.body?.pipeThrough(transformStream), {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });

    } catch (error) {
        return Response.json({ error: "Internal Server Error", details: String(error) }, { status: 500 });
    }
}

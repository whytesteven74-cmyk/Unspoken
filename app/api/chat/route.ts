import { guardrailCheck } from '@/lib/guardrail';
import { BiometricData } from '@/lib/types';
import { prisma } from '@/lib/prisma';
import { isRateLimited } from '@/lib/rate-limit';
import { createClient } from '@/lib/supabase/server';
import { extractAndStoreFacts } from '@/lib/services/fact-extraction';

export const runtime = 'nodejs';

// Configurable via environment variables
const BASE_URL_RAW = process.env.LLM_BASE_URL || 'https://hermes.ai.unturf.com/v1';
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

    // 0. CHECK AUTHENTICATION (Allow bypass for test personas)
    const testPersonaId = req.headers.get('x-test-persona');
    let savedProfileId: string | null = null;
    let authUser: any = null;

    if (testPersonaId && process.env.NODE_ENV === 'development') {
        savedProfileId = testPersonaId;
        authUser = { id: testPersonaId, email: `${testPersonaId.toLowerCase()}@test.bot` };
    } else {
        const supabase = createClient();
        const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser();

        if (authError || !supabaseUser) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
        authUser = supabaseUser;
        savedProfileId = authUser.id;
    }

    try {
        const body = await req.json();
        const { messages, biometricData } = body;

        // Create or update profile using Raw SQL
        try {
            await prisma.$executeRaw`
                INSERT INTO "Profile" (id, is_anonymous) 
                VALUES (${authUser.id}, false) 
                ON CONFLICT (id) DO NOTHING
            `;
        } catch (dbError) {
            console.warn("[API] Raw SQL Profile Warning:", dbError);
        }

        const bioData = biometricData as BiometricData;
        const stressLevel = bioData?.derived_stress_score || 0;

        // Log biometric event using Raw SQL
        try {
            await prisma.$executeRaw`
                INSERT INTO "TriageEvent" (id, user_id, voice_jitter, face_valence, risk_level)
                VALUES (${crypto.randomUUID()}, ${savedProfileId}, ${bioData?.jitter_percent || 0}, ${bioData?.face_valence || 0}, ${stressLevel > 0.8 ? 'crisis' : stressLevel > 0.5 ? 'moderate' : 'low'})
            `;
        } catch (e) {
            console.error("[API] Failed to log triage event (Raw SQL):", e);
        }

        // Log User Message using Raw SQL
        const lastUserMessage = messages?.[messages.length - 1];
        if (lastUserMessage?.role === 'user') {
            try {
                await prisma.$executeRaw`
                    INSERT INTO "Message" (id, user_id, role, content)
                    VALUES (${crypto.randomUUID()}, ${savedProfileId}, 'user', ${lastUserMessage.content})
                `;
            } catch (e) {
                console.error("[API] Failed to save user message (Raw SQL):", e);
            }
        }
        // --- DATABASE INTEGRATION END ---

        // 1. Hard Guardrail Check
        if (lastUserMessage && lastUserMessage.role === 'user') {
            const safetyResult = guardrailCheck(lastUserMessage.content);
            if (!safetyResult.isSafe) {
                return Response.json(safetyResult.crisisResponse, { status: 400 });
            }

            // FIRE AND FORGET: Fact Extraction
            // We do not await this to keep latency low.
            if (savedProfileId && !process.env.MOCK_LLM) {
                extractAndStoreFacts(savedProfileId, lastUserMessage.content)
                    .catch(e => console.error("[Background] Fact Extraction Failed:", e));
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

        const MOCK_LLM = process.env.MOCK_LLM === 'true';

        // 5. MOCK or REAL LLM
        if (MOCK_LLM) {
            console.log("[API] Using Mock LLM Mode");
            const mockResponse = stressLevel > 0.7
                ? "I can hear how much you're struggling right now. Let's take a slow breath together. I'm here to listen, and we'll take this one step at a time."
                : "Thank you for sharing that with me. It sounds like you've been carrying a lot. Can you tell me more about what's on your mind?";

            const encoder = new TextEncoder();
            const stream = new ReadableStream({
                async start(controller) {
                    const words = mockResponse.split(' ');
                    for (const word of words) {
                        controller.enqueue(encoder.encode(word + ' '));
                        await new Promise(r => setTimeout(r, 50)); // Simulating typing
                    }

                    // Save mock response to DB at the end (Raw SQL)
                    if (savedProfileId) {
                        try {
                            await prisma.$executeRaw`
                                INSERT INTO "Message" (id, user_id, role, content)
                                VALUES (${crypto.randomUUID()}, ${savedProfileId}, 'assistant', ${mockResponse})
                            `;
                        } catch (err) { }
                    }
                    controller.close();
                }
            });

            return new Response(stream, {
                headers: { 'Content-Type': 'text/plain; charset=utf-8' }
            });
        }

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
        let responseTextAccumulator = ''; // Accumulated response for DB

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
                if (savedProfileId && responseTextAccumulator.trim()) {
                    try {
                        await prisma.$executeRaw`
                            INSERT INTO "Message" (id, user_id, role, content)
                            VALUES (${crypto.randomUUID()}, ${savedProfileId}, 'assistant', ${responseTextAccumulator})
                        `;
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

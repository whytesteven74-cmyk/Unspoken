import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { guardrailCheck } from '@/lib/guardrail';
import { BiometricData } from '@/lib/types';
import { z } from 'zod';

// Configurable via environment variables
const LLM_BASE_URL = process.env.LLM_BASE_URL || 'https://hermes.ai.unturf.com/v1';
const LLM_MODEL = process.env.LLM_MODEL || 'adamo1139/Hermes-3-Llama-3.1-8B-FP8-Dynamic';
const LLM_API_KEY = process.env.LLM_API_KEY || 'sk-placeholder';

export const runtime = 'edge';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { messages, biometricData } = body;

        console.log("----------------------------------------------------------------");
        console.log("[API] Incoming Request:", {
            messageCount: messages?.length,
            lastMessage: messages?.[messages?.length - 1],
            biometricData
        });

        // 1. Hard Guardrail Check
        const lastUserMessage = messages[messages.length - 1];
        if (lastUserMessage && lastUserMessage.role === 'user') {
            const safetyResult = guardrailCheck(lastUserMessage.content);
            console.log("[API] Guardrail Result:", safetyResult);

            if (!safetyResult.isSafe) {
                console.warn("[API] Guardrail Triggered!");
                return Response.json(safetyResult.crisisResponse, { status: 400 });
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

        // 3. Prepare Messages for LLM
        const openAIMessages = [
            { role: 'system', content: systemPrompt },
            ...messages.map((m: any) => ({ role: m.role, content: m.content }))
        ];

        console.log("[API] Sending Proxy Request to LLM:", LLM_BASE_URL);
        console.log("[API] Model:", LLM_MODEL);

        // 4. Direct Fetch Proxy
        const upstreamResponse = await fetch(`${LLM_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${LLM_API_KEY}`
            },
            body: JSON.stringify({
                model: LLM_MODEL,
                messages: openAIMessages,
                stream: true, // Enable Streaming
                max_tokens: 500,
            })
        });

        if (!upstreamResponse.ok) {
            const errorText = await upstreamResponse.text();
            console.error("[API] Upstream Error:", upstreamResponse.status, errorText);
            return new Response(errorText, { status: upstreamResponse.status });
        }

        // 5. Stream Handling (Transformation to Text)
        // OpenAI streams return "data: { ...JSON... }" chunks.
        // We need to parse these and yield just the content text to the client
        // because our Client expects raw text (impl in chat-interface.tsx).

        const encoder = new TextEncoder();
        const decoder = new TextDecoder();

        const transformStream = new TransformStream({
            async transform(chunk, controller) {
                const text = decoder.decode(chunk);
                const lines = text.split('\n');

                for (const line of lines) {
                    if (line.trim() === '' || line.trim() === 'data: [DONE]') continue;
                    if (line.startsWith('data: ')) {
                        try {
                            const jsonStr = line.replace('data: ', '');
                            const json = JSON.parse(jsonStr);
                            const content = json.choices?.[0]?.delta?.content;
                            if (content) {
                                controller.enqueue(encoder.encode(content));
                            }
                        } catch (e) {
                            console.error("[API] Parse Error on chunk:", line);
                        }
                    }
                }
            }
        });

        return new Response(upstreamResponse.body?.pipeThrough(transformStream), {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });

    } catch (error) {
        console.error("[API] Critical Error:", error);
        return Response.json({ error: "Internal Server Error", details: String(error) }, { status: 500 });
    }
}

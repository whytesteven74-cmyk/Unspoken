import { prisma } from '@/lib/prisma';

// Configuration (using same env vars as chat currently, or distinct ones if needed)
const BASE_URL = process.env.LLM_BASE_URL || 'https://hermes.ai.unturf.com/v1';
const LLM_API_KEY = process.env.LLM_API_KEY || 'sk-placeholder';
const MODEL = process.env.LLM_MODEL || 'adamo1139/Hermes-3-Llama-3.1-8B-FP8-Dynamic';

const ANALYST_SYSTEM_PROMPT = `
You are a Clinical Data Analyst for a therapy application.
Your task is to analyze the user's latest message and extract "Key Facts" that should be stored in their long-term memory vault.

FOCUS ON:
1. Core Beliefs (e.g., "I am not good enough")
2. Life Events (e.g., "Just lost my job", "Getting married")
3. Symptoms/Recurring Themes (e.g., "Panic attacks at night", "Social anxiety")
4. Relationships (e.g., "Strained relationship with father")

RULES:
- Only extract EXPLICIT new information.
- Ignore casual conversation (hello, how are you).
- Ignore immediate emotional reactions unless they indicate a pattern.
- Confidence score (0.0 to 1.0) represents how certain you are this is a long-term fact.

OUTPUT JSON FORMAT:
{
  "facts": [
    {
      "category": "category_name",
      "content": "concise fact description",
      "confidence": 0.95
    }
  ]
}

If no relevant facts are found, return { "facts": [] }.
`;

interface ExtractedFact {
    category: string;
    content: string;
    confidence: number;
}

export async function extractAndStoreFacts(userId: string, userMessage: string) {
    console.log(`[FactExtraction] Analyzing message for User ${userId}...`);

    try {
        const response = await fetch(`${BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${LLM_API_KEY}`
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    { role: 'system', content: ANALYST_SYSTEM_PROMPT },
                    { role: 'user', content: userMessage }
                ],
                temperature: 0.1, // Low temp for extraction
                response_format: { type: "json_object" } // Force JSON if supported, otherwise prompt handles it
            })
        });

        if (!response.ok) {
            console.error(`[FactExtraction] API Error: ${response.status}`);
            return;
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) return;

        // Parse JSON (handle potential markdown fencing)
        const cleanJson = content.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);

        if (parsed.facts && Array.isArray(parsed.facts)) {
            const highConfidenceFacts = parsed.facts.filter((f: ExtractedFact) => f.confidence > 0.7);

            for (const fact of highConfidenceFacts) {
                console.log(`[FactExtraction] Saving: [${fact.category}] ${fact.content}`);

                // Save to Prisma (Supabase)
                // Note: We use executeRaw if Prisma Client isn't fully generated, or standard create
                // Since schema has UserFact, we try standard prisma.userFact.create first

                try {
                    await prisma.userFact.create({
                        data: {
                            user_id: userId,
                            category: fact.category.toUpperCase(),
                            content: fact.content,
                            confidence: fact.confidence
                        }
                    });
                } catch (dbError) {
                    console.error("[FactExtraction] DB Save Error:", dbError);
                }
            }
        }

    } catch (error) {
        console.error("[FactExtraction] Critical Error:", error);
    }
}

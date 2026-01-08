import { NextResponse } from 'next/server';

// Configurable via environment variables
const TTS_BASE_URL = process.env.TTS_BASE_URL || 'https://speech.ai.unturf.com/v1';
const TTS_MODEL = process.env.TTS_MODEL || 'tts-1-kokoro';
const TTS_API_KEY = process.env.TTS_API_KEY || 'sk-placeholder';

export const runtime = 'edge';

export async function POST(req: Request) {
    try {
        const { input, voice = 'alloy' } = await req.json();

        if (!input) {
            return NextResponse.json({ error: 'Text input is required' }, { status: 400 });
        }

        const response = await fetch(`${TTS_BASE_URL}/audio/speech`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${TTS_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: TTS_MODEL,
                input,
                voice,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('TTS API backend error:', errorText);
            return NextResponse.json({ error: `TTS Provider Error: ${response.statusText}` }, { status: response.status });
        }

        const audioBuffer = await response.arrayBuffer();

        return new Response(audioBuffer, {
            headers: {
                'Content-Type': 'audio/mpeg',
                'Cache-Control': 'no-cache',
            },
        });

    } catch (error) {
        console.error('TTS implementation error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

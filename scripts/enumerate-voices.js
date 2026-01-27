const fs = require('fs');
const path = require('path');

// Helper to strip quotes
const cleanEnv = (val) => val ? val.replace(/^["'](.*)["']$/, '$1') : val;

// Configuration
const TTS_BASE_URL = cleanEnv(process.env.TTS_BASE_URL) || 'https://speech.ai.unturf.com/v1';
const API_KEY = cleanEnv(process.env.TTS_API_KEY) || 'sk-placeholder';
const MODEL = 'tts-1-kokoro'; // Default model from env

// Standard OpenAI voices + Kokoro specific guesses
// If the API supports /v1/voices we will overwrite this
let CANDIDATE_VOICES = [
    'alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer', // Standard OpenAI
    'af_bella', 'af_sarah', 'am_adam', 'am_michael', // Common Kokoro voices
    'bf_emma', 'bf_isabella', 'bm_george', 'bm_lewis'  // More Kokoro
];

const PROMPT = "Hello. I am Unspoken, your AI companion. Using this voice to connect with you.";

async function main() {
    console.log(`\n🔊 Unspoken Voice Enumeration Tool`);
    console.log(`   Endpoint: ${TTS_BASE_URL}`);
    console.log(`   Model:    ${MODEL}\n`);

    // 1. Try to discover voices
    console.log(`🔍 Attempting to discover available voices...`);
    try {
        // Try generic /voices endpoint (OpenAI style doesn't have this, but wrappers do)
        const resp = await fetch(`${TTS_BASE_URL}/voices`, {
            headers: { 'Authorization': `Bearer ${API_KEY}` }
        });

        if (resp.ok) {
            const data = await resp.json();
            if (Array.isArray(data.voices)) {
                console.log(`   ✅ Found ${data.voices.length} voices from API.`);
                CANDIDATE_VOICES = data.voices.map(v => v.id || v.name);
            }
        } else {
            console.log(`   ⚠️  /voices endpoint not available (Status: ${resp.status}). Using candidate list.`);
        }
    } catch (e) {
        console.log(`   ⚠️  Discovery failed. Using candidate list.`);
    }

    console.log(`\n🧪 Testing ${CANDIDATE_VOICES.length} voices...\n`);

    // Create output dir
    const outDir = path.join(__dirname, '..', 'voice_samples');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

    // 2. Test each voice
    for (const voice of CANDIDATE_VOICES) {
        process.stdout.write(`   🎙️  Testing '${voice}'... `);

        try {
            const response = await fetch(`${TTS_BASE_URL}/audio/speech`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: MODEL,
                    input: PROMPT,
                    voice: voice,
                }),
            });

            if (!response.ok) {
                console.log(`❌ Failed (${response.status})`);
                continue;
            }

            const buffer = await response.arrayBuffer();
            const outFile = path.join(outDir, `${voice}.mp3`);
            fs.writeFileSync(outFile, Buffer.from(buffer));
            console.log(`✅ Saved to voice_samples/${voice}.mp3`);

        } catch (e) {
            console.log(`❌ Error: ${e.message}`);
        }
    }

    console.log(`\n🎉 Done! samples saved to /voice_samples`);
}

main();

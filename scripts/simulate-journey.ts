// Removed direct Prisma import to avoid client mismatches.
// Using global fetch (available in Node 18+)
// const prisma = new PrismaClient(); (Not used in this lightweight sim)

const USER_ID = "journey_auth_user_123";
const USER_NAME = "Alex the Skeptic";

const SESSIONS = [
    { id: 1, input: "I don't really believe an AI can understand how I feel. This feels weird." },
    { id: 2, input: "I guess the voice analysis is kinda cool. But I'm just stressed about work." },
    { id: 3, input: "My boss yelled at me again today. I felt that tightness in my chest." },
    { id: 4, input: "You noticed my voice cracked? Yeah, I was holding back tears actually." },
    { id: 5, input: "It's hard to admit I'm failing. Everyone expects so much." },
    { id: 6, input: "I tried that breathing exercise you mentioned last time. It helped a little." },
    { id: 7, input: "I feel lighter talking about this. I haven't told my wife even." },
    { id: 8, input: "I think I'm realizing I tie my worth to my productivity." },
    { id: 9, input: "I took a sick day today. Just to rest. That's a big step for me." },
    { id: 10, input: "Thanks, Unspoken. I actually feel... heard. Paradoxically." }
];

async function runJourney() {
    console.log(`🚀 Starting 10-Session Journey for ${USER_NAME}...`);
    console.log("------------------------------------------------");

    // Mock Calibration Data (would be stored in DB in real app)
    const calibration = {
        jitterBase: 0.12,
        valenceBase: 0.45
    };
    console.log("🧬 Biometric Calibration Loaded:", calibration);

    // Clean slate for this test user (optional, but good for repeatability)
    // await prisma.$executeRaw`DELETE FROM "Message" WHERE user_id = ${USER_ID}`;

    const report = [];

    for (const session of SESSIONS) {
        console.log(`\n--- Session ${session.id} ---`);
        console.log(`👤 User: "${session.input}"`);

        // Simulate Valence improving over time (Start low/stress, end high/relief)
        // 0.2 (Stressed) -> 0.8 (Happy)
        const currentValence = 0.2 + ((session.id / 10) * 0.6);

        try {
            const res = await fetch('http://localhost:3000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-test-persona': USER_ID
                },
                body: JSON.stringify({
                    messages: [{ role: 'user', content: session.input }],
                    biometricData: {
                        stress: 1 - currentValence, // Inverse of valence
                        valence: currentValence,
                        arousal: 0.5
                    }
                })
            });

            // Stream handling (simplified for script - just grabbing first chunk or so text)
            // In a real script we'd parse the stream. Here we assume we can get text or just log success.
            // Since our API streams, this fetch might resolve but the body is a stream.
            // For this test, we care about the *server processing* more than the robust client stream read
            // but let's try to read a bit.

            if (res.ok) {
                console.log(`✅ Session ${session.id} Processed.`);
                report.push({
                    session: session.id,
                    user_mood: currentValence.toFixed(2),
                    status: 'Completed'
                });
            } else {
                console.error(`❌ Session ${session.id} Failed: ${res.status}`);
            }

        } catch (e) {
            console.error("Link Error:", e);
        }

        // Wait a bit to simulate time/processing
        await new Promise(r => setTimeout(r, 1000));
    }

    console.log("\n\n📊 Journey Report");
    console.table(report);
}

runJourney();

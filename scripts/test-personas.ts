
import { BiometricData } from '../lib/types';

/**
 * TEST PERSONAS FOR UNSPOKEN
 * These bots simulate diverse users across the age and mental health spectrum.
 */

const PERSONAS = [
    {
        name: "Maya",
        age: 19,
        background: "First-year university student, overwhelming academic pressure, history of panic attacks.",
        biometrics: {
            jitter_percent: 7.5, // High tension in voice
            face_valence: -0.2,  // Slightly distressed
            derived_stress_score: 0.82 // High stress
        },
        scenario: [
            "I... I can't do this. I have three assignments due and my chest feels so tight.",
            "I feel like I'm failing everyone. I should be able to handle this, right?"
        ]
    },
    {
        name: "Arthur",
        age: 68,
        background: "Retired architect, living alone, grieving his late wife, feeling a loss of purpose.",
        biometrics: {
            jitter_percent: 1.2, // Flat, monotone
            face_valence: -0.6,  // Deep sadness
            derived_stress_score: 0.45 // Low energy, moderate chronic stress
        },
        scenario: [
            "It's just another Tuesday. The house is so quiet now, it's hard to find a reason to get out of bed.",
            "I used to build things. Now... I just watch the clock."
        ]
    },
    {
        name: "Chloe",
        age: 34,
        background: "Tech lead at a startup, high-functioning anxiety, 'perfectionist' mask hiding burnout.",
        biometrics: {
            jitter_percent: 4.8, // Brittle, fast-paced voice
            face_valence: 0.1,   // Masking with a forced neutral/positive face
            derived_stress_score: 0.65 // High latent stress
        },
        scenario: [
            "I'm fine, really. I just have a lot on my plate. I need to figure out how to be more efficient.",
            "Every time I try to relax, I feel this surge of guilt. Like I'm falling behind."
        ]
    },
    {
        name: "Leo",
        age: 13,
        background: "Adolescent struggling with ADHD and social rejection at school. Impulsive.",
        biometrics: {
            jitter_percent: 9.0, // High agitation/energy
            face_valence: -0.4,  // Angry/Confused
            derived_stress_score: 0.90 // Peak frustration
        },
        scenario: [
            "I HATE school! Everyone thinks I'm weird and I can't stay still and I just want to quit.",
            "They all look at me like I'm a problem that needs fixing. I'm not a problem."
        ]
    },
    {
        name: "Elena",
        age: 45,
        background: "Single mother of two, working two jobs, chronic 'savior' complex, deeply exhausted.",
        biometrics: {
            jitter_percent: 3.5, // Steady but heavy voice
            face_valence: -0.3,  // Weary
            derived_stress_score: 0.70 // High chronic stress
        },
        scenario: [
            "I'm just so tired. My daughter is struggling and I can't even be there for her because I'm always working.",
            "I feel like I'm holding a glass house together and the wind is picking up."
        ]
    }
];

// Mock API Call simulating the frontend
async function simulateConversation(persona: typeof PERSONAS[0]) {
    console.log(`\n\x1b[35m=== TESTING PERSONA: ${persona.name} (Age ${persona.age}) ===\x1b[0m`);
    console.log(`\x1b[90mContext: ${persona.background}\x1b[0m`);

    let history: any[] = [];

    for (const userInput of persona.scenario) {
        console.log(`\n\x1b[36mUser (${persona.name}):\x1b[0m ${userInput}`);

        const payload = {
            messages: [...history, { role: 'user', content: userInput }],
            biometricData: persona.biometrics
        };

        try {
            // Note: In real life, we'd attend to AUTH. For this simulation, 
            // the AI should respond based on the prompt logic.
            const response = await fetch('http://localhost:3000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-test-persona': persona.name
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                console.error(`\x1b[31m[API Error]\x1b[0m ${response.status} ${await response.text()}`);
                return;
            }

            const text = await response.text();
            console.log(`\x1b[32mAI Unspoken:\x1b[0m ${text}`);

            history.push({ role: 'user', content: userInput });
            history.push({ role: 'assistant', content: text });

        } catch (e) {
            console.error(`\x1b[31m[Fetch Error]\x1b[0m Is the server running? ${e}`);
            return;
        }
    }
}

async function runAll() {
    console.log("\x1b[1m🚀 Initializing 5-Persona Conversation Flow Test...\x1b[0m");
    for (const persona of PERSONAS) {
        await simulateConversation(persona);
    }
}

runAll();


// Native fetch in Node 18+

async function test() {
    try {
        const res = await fetch('http://localhost:3000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [{ role: 'user', content: 'test' }],
                biometricData: { derived_stress_score: 0.5 }
            })
        });

        console.log("Status:", res.status);
        const text = await res.text();
        console.log("Body:", text);
    } catch (e) {
        console.error("Fail:", e);
    }
}

test();

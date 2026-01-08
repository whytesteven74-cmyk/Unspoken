// Using global fetch

async function test() {
    console.log("Sending request...");
    try {
        const response = await fetch('https://unspoken-74ou2jyw0-whytesteven74-1176s-projects.vercel.app/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [{ role: 'user', content: 'Hello from Node script' }]
            })
        });

        console.log("Status:", response.status);
        console.log("Headers:", response.headers.raw());
        const text = await response.text();
        console.log("Body:", text.substring(0, 500)); // First 500 chars
    } catch (e) {
        console.error("Error:", e);
    }
}

test();

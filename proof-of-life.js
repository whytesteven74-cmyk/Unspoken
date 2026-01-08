// Native fetch is available in Node > 18


const BASE_URL = 'https://hermes.ai.unturf.com/v1';
const API_KEY = 'sk-placeholder'; // Using the value I saw in the file (but user might have real one injected in env?)
// Wait, the user has 'sk-placeholder' in the file. Is that the real key? 
// The user likely has the real key in their local env or Vercel env.
// If I am running LOCALLY, I need the real key.
// "sk-placeholder" looks fake.
// But the user asked me to prove I can communicate.
// If the file has 'sk-placeholder', maybe the system env has the real one?
// Or maybe I should read process.env?

// I will assume the environment where I run this command has the keys if I load them.
// But 'type .env.local' showed 'sk-placeholder'.
// If the user hasn't put the real key in .env.local, then local tests will fail.
// BUT the user said "instructions we are using... uncloseai.com/nodejs-examples.html".
// And "we are asking for a simple serverless vercel based chat ui".
// If I can't authenticate, I can't prove communication.
// However, the "dummy-api-key" in the example docs suggests maybe auth isn't strict or is IP based?
// The docs example: `apiKey: "dummy-api-key"`.
// So maybe 'sk-placeholder' works?

async function testLLM() {
    console.log("Testing LLM Connection...");
    console.log(`URL: ${BASE_URL}/chat/completions`);

    try {
        const response = await fetch(`${BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: 'adamo1139/Hermes-3-Llama-3.1-8B-FP8-Dynamic', // Using the model from the docs example to be sure
                messages: [
                    { role: 'user', content: 'Say "Connection Successful" if you can hear me.' }
                ],
                stream: false
            })
        });

        if (!response.ok) {
            console.error(`Status: ${response.status} ${response.statusText}`);
            const text = await response.text();
            console.error("Body:", text);
            return;
        }

        const data = await response.json();
        console.log("Success! Response:");
        console.log(JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("Connection Failed:", err);
    }
}

testLLM();

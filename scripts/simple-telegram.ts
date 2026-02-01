import fs from 'fs';
import path from 'path';

// Manual config load without dotenv dependency
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env: Record<string, string> = {};

envContent.split(/\r?\n/).forEach(line => {
    line = line.trim();
    if (!line || line.startsWith('#')) return;

    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        let value = match[2].trim();
        if (value.startsWith('"') && value.endsWith('"')) {
            value = value.slice(1, -1);
        }
        env[match[1].trim()] = value;
    }
});

console.log('Keys found:', Object.keys(env));

const TOKEN = env.TELEGRAM_BOT_TOKEN;
const CHANNEL = env.TELEGRAM_CHANNEL_ID;

console.log('🔍 Diagnostic:');
console.log(`- Token Present: ${!!TOKEN}`);
console.log(`- Channel: ${CHANNEL}`);

if (!TOKEN) process.exit(1);

async function run() {
    console.log('📡 Fetching Me...');
    try {
        const res = await fetch(`https://api.telegram.org/bot${TOKEN}/getMe`);
        const data = await res.json();
        console.log('Result:', data);

        if (data.ok && CHANNEL) {
            console.log('📨 Sending Message...');
            const res2 = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: CHANNEL,
                    text: "🚀 Unspoken integration connected via diagnostic script."
                })
            });
            const data2 = await res2.json();
            console.log('Send Result:', data2);
        }
    } catch (e) {
        console.error('Fetch Error:', e);
    }
}

run();

import fs from 'fs';
import path from 'path';

// 1. Env Load (Robust)
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env: Record<string, string> = {};

envContent.split(/\r?\n/).forEach(line => {
    line = line.trim();
    if (!line || line.startsWith('#')) return;
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        let value = match[2].trim();
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        env[match[1].trim()] = value;
    }
});

const TOKEN = env.TELEGRAM_BOT_TOKEN;
if (!TOKEN) {
    console.error('❌ Missing TOKEN');
    process.exit(1);
}

let lastUpdateId = 0;

console.log('🤖 Unspoken Bot Active (Polling Mode)...');

async function poll() {
    try {
        const res = await fetch(`https://api.telegram.org/bot${TOKEN}/getUpdates?offset=${lastUpdateId + 1}&timeout=30`);
        const data = await res.json();

        if (data.ok && data.result.length > 0) {
            for (const update of data.result) {
                lastUpdateId = update.update_id;
                if (update.message && update.message.text) {
                    const chatId = update.message.chat.id;
                    const text = update.message.text;
                    const user = update.message.from.first_name;

                    console.log(`📩 [${user}]: ${text}`);

                    // Reply
                    await sendMessage(chatId, `👋 Hello ${user}, this is Unspoken AI.\n\nI received: "${text}"\n\n(This is a verified response from the development dev-bot.)`);
                }
            }
        }
    } catch (e) {
        console.error('Polling Error:', e);
        await new Promise(r => setTimeout(r, 5000));
    }

    // Loop
    setTimeout(poll, 1000);
}

async function sendMessage(chatId: number, text: string) {
    await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text })
    });
}

poll();

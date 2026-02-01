import fs from 'fs';
import path from 'path';

// 1. Load Env
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
const CHANNEL = env.TELEGRAM_CHANNEL_ID;

if (!TOKEN || !CHANNEL) {
    console.error('❌ Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHANNEL_ID in .env');
    process.exit(1);
}

// 2. Get Message
let message = process.argv[2];
const fileFlagIndex = process.argv.indexOf('--file');

if (fileFlagIndex !== -1 && process.argv[fileFlagIndex + 1]) {
    const filePath = process.argv[fileFlagIndex + 1];
    try {
        message = fs.readFileSync(filePath, 'utf-8');
        console.log(`📄 Reading message from file: ${filePath}`);
    } catch (e) {
        console.error(`❌ Could not read file: ${filePath}`);
        process.exit(1);
    }
}

if (!message || message === '--file') {
    console.error('❌ Usage: npx tsx scripts/notify-channel.ts "Message Content" OR --file <path>');
    process.exit(1);
}

// 3. Send
async function send() {
    console.log(`📡 Posting to ${CHANNEL}...`);
    try {
        const res = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHANNEL,
                text: message,
                parse_mode: 'Markdown'
            })
        });
        const data = await res.json();
        if (data.ok) {
            console.log(`✅ Posted (ID: ${data.result.message_id})`);
        } else {
            console.error('❌ API Error:', data);
        }
    } catch (e) {
        console.error('❌ Network Error:', e);
    }
}

send();

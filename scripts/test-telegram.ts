import { sendMessage, getMe } from '../lib/telegram';
import dotenv from 'dotenv';
import path from 'path';

// Load env (since we're running as a script)
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const CHANNEL = process.env.TELEGRAM_CHANNEL_ID || '@unspokenAI';

async function testTelegram() {
    console.log('📡 Testing Telegram Integration...');

    // 1. Verify Bot Identity
    const me = await getMe();
    if (me && me.ok) {
        console.log(`✅ Bot Identity: @${me.result.username} (${me.result.first_name})`);
    } else {
        console.error('❌ Failed to identify bot. Check token.');
        return;
    }

    // 2. Send Message to Channel
    try {
        const message = `🚀 *Unspoken Integration Active*\n\nDevelopment updates are now linked to this channel\\.`;
        const result = await sendMessage(CHANNEL, message);
        console.log(`✅ Message sent to ${CHANNEL} (ID: ${result.message_id})`);
    } catch (error) {
        console.error('❌ Failed to post to channel. Ensure the bot is an Admin.');
    }
}

testTelegram();

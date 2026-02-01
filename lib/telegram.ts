const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const BASE_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

export async function sendMessage(chatId: string | number, text: string, parseMode: 'MarkdownV2' | 'HTML' = 'MarkdownV2') {
    if (!BOT_TOKEN) {
        console.error("❌ TELEGRAM_BOT_TOKEN is missing");
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: text,
                parse_mode: parseMode
            })
        });

        const data = await response.json();
        if (!data.ok) {
            console.error('❌ Telegram API Error:', data);
            throw new Error(data.description);
        }
        return data.result;
    } catch (error) {
        console.error('❌ Failed to send Telegram message:', error);
        throw error;
    }
}

export async function getMe() {
    if (!BOT_TOKEN) return null;
    try {
        const response = await fetch(`${BASE_URL}/getMe`);
        return await response.json();
    } catch (e) {
        return null;
    }
}

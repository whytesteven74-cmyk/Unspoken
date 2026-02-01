import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('📊 Auditing Database Persistence (Raw SQL)...');

    const personas = ['Maya', 'Arthur', 'Chloe', 'Leo', 'Elena'];

    for (const name of personas) {
        const userId = name; // Persona ID used in headers

        try {
            const messageCount: any = await prisma.$queryRaw`SELECT count(*)::int FROM "Message" WHERE user_id = ${userId}`;
            const triageCount: any = await prisma.$queryRaw`SELECT count(*)::int FROM "TriageEvent" WHERE user_id = ${userId}`;
            const lastMessage: any = await prisma.$queryRaw`SELECT content FROM "Message" WHERE user_id = ${userId} AND role = 'assistant' ORDER BY created_at DESC LIMIT 1`;

            console.log(`\n--- Persona: ${name} ---`);
            console.log(`- Messages Saved: ${messageCount[0].count}`);
            console.log(`- Biometric Events: ${triageCount[0].count}`);
            if (lastMessage.length > 0) {
                console.log(`- Last Assistant Response: "${lastMessage[0].content.substring(0, 50)}..."`);
            } else {
                console.log(`- ❌ NO ASSISTANT RESPONSES FOUND`);
            }
        } catch (err) {
            console.error(`- ❌ Error auditing ${name}:`, err);
        }
    }
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());

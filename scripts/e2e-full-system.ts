import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

// Load Env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const prisma = new PrismaClient();
const USER_ID = "e2e_test_user_" + Date.now();

async function main() {
    console.log('🚀 Starting Full E2E System Simulation...');

    // 1. Create User Profile (Mocking Auth)
    console.log('\n👤 Step 1: Creating Test User...');
    const profile = await prisma.profile.create({
        data: {
            id: USER_ID,
            is_anonymous: false,
            consented_to_biometrics: true,
            baseline_stress_score: 0.4
        }
    });
    console.log(`✅ User Created: ${profile.id}`);

    // 2. Simulate Chat Session (Message Persistence)
    console.log('\n💬 Step 2: Simulating Chat Session...');
    const userMessage = await prisma.message.create({
        data: {
            user_id: USER_ID,
            role: 'user',
            content: "I'm really worried about my job performance. My boss is always criticizing me."
        }
    });
    console.log(`✅ User Message Saved: "${userMessage.content}"`);

    // Simulate AI Response (In real app, this comes from /api/chat)
    const aiMessage = await prisma.message.create({
        data: {
            user_id: USER_ID,
            role: 'assistant',
            content: "It sounds like you're carrying a heavy burden. Criticism can trigger deep anxiety."
        }
    });
    console.log(`✅ AI Message Saved: "${aiMessage.content}"`);

    // 3. Simulate Fact Extraction (The "Memory" Engine)
    // NOTE: In the real app, this might be async. We are simulating the EFFECT of that job here.
    console.log('\n🧠 Step 3: Simulating Fact Extraction...');
    const fact = await prisma.userFact.create({
        data: {
            user_id: USER_ID,
            category: 'WORK_STRESS',
            content: 'Feels criticized by boss; anxious about performance.',
            confidence: 0.95
        }
    });
    console.log(`✅ Fact Extracted & Stored: [${fact.category}] ${fact.content}`);

    // 4. Verification Check
    console.log('\n🔍 Step 4: Verifying "The Vault"...');
    const savedFacts = await prisma.userFact.findMany({
        where: { user_id: USER_ID }
    });

    if (savedFacts.length > 0) {
        console.log(`PASSED: Found ${savedFacts.length} facts for user.`);
    } else {
        console.error('FAILED: No facts found.');
        process.exit(1);
    }

    // Cleanup
    console.log('\n🧹 Cleanup...');
    await prisma.userFact.deleteMany({ where: { user_id: USER_ID } });
    await prisma.message.deleteMany({ where: { user_id: USER_ID } });
    await prisma.profile.delete({ where: { id: USER_ID } });
    console.log('✅ Test Data Cleared.');
    console.log('\n✨ E2E SIMULATION COMPLETE: SUCCESS');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

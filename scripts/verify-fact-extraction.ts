import { extractAndStoreFacts } from '../lib/services/fact-extraction';
import { prisma } from '../lib/prisma';

// Use a known test user ID or create one
const TEST_USER_ID = 'test-user-fact-extraction';

async function main() {
    console.log('🧪 Starting Fact Extraction Verification...');

    // 1. Setup Test User (if not exists)
    // We use raw sql because we might trigger this before full prisma generation in some envs
    try {
        await prisma.$executeRaw`
            INSERT INTO "Profile" (id, is_anonymous) 
            VALUES (${TEST_USER_ID}, false) 
            ON CONFLICT (id) DO NOTHING
        `;
        console.log('✅ Test User Secured');
    } catch (e) {
        console.error('❌ Failed to create test user:', e);
        process.exit(1);
    }

    // 2. Simulate a User Message with Facts
    const message = "I'm really struggling with my sleep lately. Every time I try to close my eyes, I worry about losing my job at the bank. My wife tells me it's just anxiety.";
    console.log(`\n📨 Simulating Message: "${message}"`);

    // 3. Trigger Extraction
    console.log('⏳ Triggering Extraction (this calls the LLM)...');
    await extractAndStoreFacts(TEST_USER_ID, message);

    // 4. Verify Database
    console.log('\n🔍 Verifying Database Storage...');
    // Allow a moment for async DB operations if they were detached (though we awaited extractAndStoreFacts)

    const facts = await prisma.userFact.findMany({
        where: { user_id: TEST_USER_ID }
    });

    if (facts.length > 0) {
        console.log(`✅ SUCCESS: Found ${facts.length} facts.`);
        facts.forEach(f => {
            console.log(`   - [${f.category}] ${f.content} (${f.confidence})`);
        });
    } else {
        console.error('❌ FAILED: No facts found in database.');
        // Consider if it's a mock LLM issue or env var issue
        if (process.env.MOCK_LLM === 'true') {
            console.log('   (Note: MOCK_LLM is enabled, ensure the service handles mocks or the verified env has real keys)');
        }
    }

    // Cleanup
    await prisma.userFact.deleteMany({ where: { user_id: TEST_USER_ID } });
    await prisma.profile.delete({ where: { id: TEST_USER_ID } });
    console.log('\n🧹 Cleanup Complete');
}

main();

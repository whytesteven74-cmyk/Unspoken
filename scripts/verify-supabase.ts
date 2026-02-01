import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔌 Connecting to Supabase...');

    try {
        // 1. Create a test profile
        const profile = await prisma.profile.create({
            data: {
                id: 'test-user-id-123',
                is_anonymous: true,
                baseline_stress_score: 0.5,
            },
        });
        console.log('✅ Created test profile:', profile.id);

        // 2. Read it back
        const readBack = await prisma.profile.findUnique({
            where: { id: profile.id },
        });

        if (readBack) {
            console.log('✅ Successfully read back profile:', readBack.id);
        } else {
            throw new Error('Failed to read back profile');
        }

        // 3. Clean up
        await prisma.profile.delete({
            where: { id: profile.id }
        });
        console.log('✅ Cleaned up test record.');

    } catch (e) {
        console.error('❌ Verification failed:', e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();

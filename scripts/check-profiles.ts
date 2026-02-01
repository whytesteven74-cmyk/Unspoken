import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('👥 Checking Profiles in Database...');
    const profiles = await (prisma.profile as any).findMany();
    console.log(`- Total Profiles: ${profiles.length}`);
    profiles.forEach((p: any) => {
        console.log(`  * ID: ${p.id}`);
    });
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());

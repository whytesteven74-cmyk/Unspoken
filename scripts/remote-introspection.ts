import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🏛️  Introspecting Remote Schema...');
    const columns: any = await prisma.$queryRaw`
        SELECT table_name, column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name IN ('Profile', 'Message', 'TriageEvent')
        ORDER BY table_name, ordinal_position;
    `;

    let currentTable = '';
    columns.forEach((c: any) => {
        if (c.table_name !== currentTable) {
            console.log(`\nTable: ${c.table_name}`);
            currentTable = c.table_name;
        }
        console.log(`  - ${c.column_name} (${c.data_type})`);
    });
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());

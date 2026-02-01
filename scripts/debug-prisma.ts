import { Prisma } from '@prisma/client';

async function main() {
    console.log('🔍 Introspecting Prisma Profile Model...');

    // Check DMMF or the Model fields from metadata
    console.log('Available Profile fields in Prisma Metadata:');
    const fields = (Prisma as any).dmmf?.datamodel?.models?.find((m: any) => m.name === 'Profile')?.fields;
    if (fields) {
        fields.forEach((f: any) => console.log(`  - ${f.name} (${f.type})`));
    } else {
        console.log('Metdata not available. Printing client model keys:');
    }
}

main().catch(console.error);

// import { guardrailCheck } from '@/lib/guardrail';
// import { BiometricData } from '@/lib/types';
// import { prisma } from '@/lib/prisma';
// import { isRateLimited } from '@/lib/rate-limit';

export const runtime = 'nodejs';

export async function POST(req: Request) {
    return Response.json({ message: "POST worked with commented imports" });
}

export async function GET() {
    return Response.json({ message: "GET worked with commented imports" });
}

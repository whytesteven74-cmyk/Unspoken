import { isRateLimited } from '@/lib/rate-limit';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function POST(req: Request) {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    if (isRateLimited(ip)) {
        return Response.json({ error: "Too Many Requests" }, { status: 429 });
    }

    let dbStatus = "not attempted";
    try {
        await prisma.profile.count();
        dbStatus = "success";
    } catch (e) {
        dbStatus = "failed: " + String(e);
    }

    return Response.json({ message: "POST worked with prisma", dbStatus, ip });
}

export async function GET() {
    return Response.json({ message: "GET worked with prisma" });
}

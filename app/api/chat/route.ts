import { isRateLimited } from '@/lib/rate-limit';

export const runtime = 'nodejs';

export async function POST(req: Request) {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    if (isRateLimited(ip)) {
        return Response.json({ error: "Too Many Requests" }, { status: 429 });
    }
    return Response.json({ message: "POST worked with isRateLimited", ip });
}

export async function GET() {
    return Response.json({ message: "GET worked with isRateLimited" });
}

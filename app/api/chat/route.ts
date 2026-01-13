export const runtime = 'nodejs';

export async function GET() {
    return Response.json({ status: "alive", method: "GET" });
}

export async function POST() {
    return Response.json({ status: "alive", method: "POST" });
}

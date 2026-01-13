export async function POST(req: Request) {
    return Response.json({ message: "POST worked" });
}

export async function GET() {
    return Response.json({ message: "GET worked" });
}

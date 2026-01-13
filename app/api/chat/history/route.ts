import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
    try {
        // For MVP, we get the history of the single anonymous user
        const user = await prisma.profile.findFirst({ where: { is_anonymous: true } });

        if (!user) {
            return NextResponse.json({ messages: [] });
        }

        const messages = await prisma.message.findMany({
            where: { user_id: user.id },
            orderBy: { created_at: 'asc' },
            take: 50 // Limit to last 50 for performance
        });

        // Format for UI (role, content)
        // Ensure ID is unique string for UI keys if needed, but UI uses index usually or passed ID
        return NextResponse.json({
            messages: messages.map(m => ({
                role: m.role,
                content: m.content,
                id: m.id
            }))
        });

    } catch (error) {
        console.error("Failed to fetch history:", error);
        return NextResponse.json({ messages: [] }, { status: 500 });
    }
}

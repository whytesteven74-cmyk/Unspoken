import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/chat/route';
import { guardrailCheck } from '@/lib/guardrail';
import { isRateLimited } from '@/lib/rate-limit';

// Mock Dependencies
vi.mock('@/lib/guardrail', () => ({
    guardrailCheck: vi.fn()
}));

vi.mock('@/lib/rate-limit', () => ({
    isRateLimited: vi.fn()
}));

vi.mock('@/lib/prisma', () => ({
    prisma: {
        profile: {
            findFirst: vi.fn(),
            create: vi.fn()
        },
        triageEvent: {
            create: vi.fn()
        },
        message: {
            create: vi.fn()
        }
    }
}));

// Mock global fetch
global.fetch = vi.fn();

describe('Chat API Route', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Default safe mocks
        (isRateLimited as any).mockReturnValue(false);
        (guardrailCheck as any).mockReturnValue({ isSafe: true });
        (global.fetch as any).mockResolvedValue({
            ok: true,
            body: {
                pipeThrough: vi.fn().mockReturnThis(), // Mock TransformStream usage
                getReader: vi.fn() // if needed
            }
        });
    });

    it('should return 429 if rate limited', async () => {
        (isRateLimited as any).mockReturnValue(true);

        const req = new Request('http://localhost/api/chat', {
            method: 'POST',
            headers: { 'x-forwarded-for': '1.2.3.4' }
        });

        const res = await POST(req);
        expect(res.status).toBe(429);
        const data = await res.json();
        expect(data.error).toBe('Too Many Requests');
    });

    it('should return 400 if guardrail fails', async () => {
        (guardrailCheck as any).mockReturnValue({
            isSafe: false,
            crisisResponse: { trigger: 'suicide_risk' }
        });

        const req = new Request('http://localhost/api/chat', {
            method: 'POST',
            body: JSON.stringify({
                messages: [{ role: 'user', content: 'unsafe message' }]
            })
        });

        const res = await POST(req);
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.trigger).toBe('suicide_risk');
    });

    it('should proceed to LLM fetch if safe', async () => {
        const req = new Request('http://localhost/api/chat', {
            method: 'POST',
            body: JSON.stringify({
                messages: [{ role: 'user', content: 'hello' }]
            })
        });

        const res = await POST(req);
        expect(res.status).toBe(200);
        expect(global.fetch).toHaveBeenCalledTimes(1);
    });
});

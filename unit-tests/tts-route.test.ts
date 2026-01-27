import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/tts/route';

// Mock global fetch
global.fetch = vi.fn();

describe('TTS API Route', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 400 if input is missing', async () => {
        const req = new Request('http://localhost/api/tts', {
            method: 'POST',
            body: JSON.stringify({ voice: 'alloy' })
        });
        const res = await POST(req);
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toBe('Text input is required');
    });

    it('should return 500/upstream error if fetch fails', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: false,
            status: 503,
            text: async () => 'Service Unavailable',
            statusText: 'Service Unavailable'
        });

        const req = new Request('http://localhost/api/tts', {
            method: 'POST',
            body: JSON.stringify({ input: 'Hello' })
        });

        const res = await POST(req);
        expect(res.status).toBe(503);
    });

    it('should return audio buffer on success', async () => {
        const mockBuffer = new ArrayBuffer(8);
        (global.fetch as any).mockResolvedValue({
            ok: true,
            arrayBuffer: async () => mockBuffer
        });

        const req = new Request('http://localhost/api/tts', {
            method: 'POST',
            body: JSON.stringify({ input: 'Hello' })
        });

        const res = await POST(req);
        expect(res.status).toBe(200);
        expect(res.headers.get('Content-Type')).toBe('audio/mpeg');
    });
});

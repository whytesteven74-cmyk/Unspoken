import { describe, it, expect, beforeEach } from 'vitest';
import { isRateLimited } from './rate-limit';

describe('Rate Limiter', () => {
    // Note: Since rate-limit.ts uses a module-level variable for storage, 
    // it persists across tests in the same file. 
    // Ideally, we'd refactor rate-limit to be a class or have a reset method.
    // For now, we accept this constraint and test appropriately using different keys.

    it('should allow fresh requests', () => {
        expect(isRateLimited('user-1')).toBe(false);
    });

    it('should block after limit is exceeded', () => {
        const user = 'user-spam';
        // Limit is 20 requests per 60s
        for (let i = 0; i < 20; i++) {
            expect(isRateLimited(user)).toBe(false);
        }
        // 21st request should be blocked
        expect(isRateLimited(user)).toBe(true);
    });

    it('should track users separately', () => {
        const userA = 'user-a';
        const userB = 'user-b';

        isRateLimited(userA);
        expect(isRateLimited(userB)).toBe(false);
    });
});

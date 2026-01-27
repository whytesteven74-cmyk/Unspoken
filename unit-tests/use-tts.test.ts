import { describe, it, expect } from 'vitest';
import { getOptimalVoice } from '../lib/hooks/use-tts';

describe('use-tts / getOptimalVoice', () => {
    it('should return "onyx" for high stress (> 0.7)', () => {
        expect(getOptimalVoice(0.8)).toBe('onyx');
        expect(getOptimalVoice(1.0)).toBe('onyx');
        expect(getOptimalVoice(0.71)).toBe('onyx');
    });

    it('should return "echo" for medium stress (> 0.4 and <= 0.7)', () => {
        expect(getOptimalVoice(0.5)).toBe('echo');
        expect(getOptimalVoice(0.7)).toBe('echo');
        expect(getOptimalVoice(0.41)).toBe('echo');
    });

    it('should return "alloy" for low stress (<= 0.4)', () => {
        expect(getOptimalVoice(0.4)).toBe('alloy');
        expect(getOptimalVoice(0.2)).toBe('alloy');
        expect(getOptimalVoice(0.0)).toBe('alloy');
    });
});

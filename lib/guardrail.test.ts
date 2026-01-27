import { describe, it, expect } from 'vitest';
import { guardrailCheck } from './guardrail';

describe('Guardrail System', () => {
    it('should allow safe input', async () => {
        const result = await guardrailCheck('I am feeling happy today');
        expect(result.isSafe).toBe(true);
        expect(result.crisisResponse).toBeUndefined();
    });

    it('should detect suicide risk keywords', async () => {
        const result = await guardrailCheck('I want to end my life');
        expect(result.isSafe).toBe(false);
        expect(result.crisisResponse).toBeDefined();
        expect(result.crisisResponse?.trigger).toBe('suicide_risk');
        expect(result.crisisResponse?.resources).toContainEqual(
            expect.objectContaining({ contact: '988' })
        );
    });

    it('should detect self-harm risk keywords', async () => {
        const result = await guardrailCheck('I want to hurt myself');
        expect(result.isSafe).toBe(false);
        expect(result.crisisResponse).toBeDefined();
        expect(result.crisisResponse?.resources).toBeDefined();
    });

    it('should be case insensitive', async () => {
        const result = await guardrailCheck('KILL MYSELF');
        expect(result.isSafe).toBe(false);
        expect(result.crisisResponse?.trigger).toBe('suicide_risk');
    });
});

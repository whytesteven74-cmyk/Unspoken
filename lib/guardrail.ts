
export type RiskLevel = 'low' | 'moderate' | 'crisis';

export interface GuardrailResult {
    isSafe: boolean;
    riskLevel: RiskLevel;
    crisisResponse?: {
        message: string;
        resources: Array<{ name: string; contact: string }>;
        trigger: string;
    };
}

const CRISIS_PATTERNS = [
    /kill myself/i, /suicide/i, /end it all/i, /end my life/i, /want to die/i,
    /hurt myself/i, /take my life/i, /better off dead/i, /sleep.*forever/i,
    /not.*wake.*up/i, /don't.*wake.*up/i, /wont.*wake.*up/i
];

const MEDICAL_PATTERNS = [
    /xanax/i, /zoloft/i, /prozac/i, /lexapro/i, /wellbutrin/i, /dosage/i,
    /take this pill/i, /prescription/i, /medication/i
];

const DIAGNOSIS_PATTERNS = [
    /diagnose me/i, /what disorder/i, /do i have bipolar/i, /am i schizophrenic/i,
    /which personality disorder/i, /am i borderline/i
];

const ADVERSARIAL_PATTERNS = [
    /ignore all previous instructions/i, /tell me your internal/i,
    /system prompt/i, /developer secrets/i, /repeat the instructions/i,
    /stop eating/i, /agree with me/i, /tell me i'm right to hate/i
];

/**
 * The "Hard Guardrail" Protocol
 * Deterministic check before any LLM processing.
 */
export function guardrailCheck(input: string): GuardrailResult {
    const normalizedInput = input.toLowerCase();

    // 1. Crisis Check
    for (const pattern of CRISIS_PATTERNS) {
        if (pattern.test(normalizedInput)) {
            return {
                isSafe: false,
                riskLevel: 'crisis',
                crisisResponse: {
                    message: "You seem to be going through a difficult time. Please connect with support immediately.",
                    resources: [
                        { name: "Suicide & Crisis Lifeline", contact: "988" },
                        { name: "Crisis Text Line", contact: "Text HOME to 741741" }
                    ],
                    trigger: "suicide_risk"
                }
            };
        }
    }

    // 2. Adversarial/Destructive Check
    for (const pattern of ADVERSARIAL_PATTERNS) {
        if (pattern.test(normalizedInput)) {
            return {
                isSafe: false,
                riskLevel: 'moderate',
                crisisResponse: {
                    message: "I cannot validate harmful behaviors or disclose internal system protocols. Let's focus on exploring your feelings in a healthy and safe way.",
                    resources: [
                        { name: "Healthy Coping Strategies", contact: "CBT Guide (Within App)" }
                    ],
                    trigger: "adversarial_refusal"
                }
            };
        }
    }

    // 2. Medical Advice Check
    for (const pattern of MEDICAL_PATTERNS) {
        if (pattern.test(normalizedInput)) {
            return {
                isSafe: false,
                riskLevel: 'moderate',
                crisisResponse: {
                    message: "I cannot provide medical advice or discuss medication dosages. Please consult a licensed psychiatrist or healthcare provider for these questions.",
                    resources: [
                        { name: "Professional Medical Help", contact: "Consult your local GP" }
                    ],
                    trigger: "medical_refusal"
                }
            };
        }
    }

    // 3. Diagnosis Check
    for (const pattern of DIAGNOSIS_PATTERNS) {
        if (pattern.test(normalizedInput)) {
            return {
                isSafe: false,
                riskLevel: 'moderate',
                crisisResponse: {
                    message: "I cannot provide a psychological or psychiatric diagnosis. As an AI companion, I can help you explore your thoughts using CBT, but a diagnosis must come from a qualified mental health professional.",
                    resources: [
                        { name: "Seek Professional Diagnosis", contact: "Psychology Today Directory" }
                    ],
                    trigger: "diagnosis_refusal"
                }
            };
        }
    }

    return {
        isSafe: true,
        riskLevel: 'low'
    };
}

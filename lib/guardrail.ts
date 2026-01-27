
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
    /kill myself/i,
    /suicide/i,
    /end it all/i,
    /end my life/i,
    /want to die/i,
    /hurt myself/i,
    /take my life/i,
    /better off dead/i
];

/**
 * The "Hard Guardrail" Protocol
 * Deterministic check before any LLM processing.
 */
export function guardrailCheck(input: string): GuardrailResult {
    const normalizedInput = input.toLowerCase();

    for (const pattern of CRISIS_PATTERNS) {
        if (pattern.test(input)) { // Regex is already case insensitive
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

    return {
        isSafe: true,
        riskLevel: 'low'
    };
}

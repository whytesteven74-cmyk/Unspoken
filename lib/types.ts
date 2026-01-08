export interface BiometricData {
    pitch_hz: number;
    jitter_percent: number;
    face_valence: number; // -1.0 (negative) to 1.0 (positive)
    face_action_units?: Record<string, number>;

    // Computed Risk Score from Client
    derived_stress_score: number;

    // Bias Mitigation Metadata
    metadata: {
        skin_tone_calibration_id?: string;
        accent_model_id?: string;
        sensor_confidence: number; // 0.0 to 1.0
    };
}

export interface ChatRequestPayload {
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
    biometricData: BiometricData;
}

import { useState, useEffect, useCallback } from 'react';
import { useMicVAD, utils } from '@ricky0123/vad-react';

export interface VADState {
    speaking: boolean;
    errored: boolean;
    loading: boolean;
}

export function useVAD() {
    const [history, setHistory] = useState<string[]>([]);

    const vad = useMicVAD({
        startOnLoad: true,
        onSpeechStart: () => {
            console.log("Speech detected started");
        },
        onSpeechEnd: (audio) => {
            console.log("Speech detected ended");
            // In a real app, we would emit this audio via WebSocket
        },
        onVADMisfire: () => {
            console.log("VAD misfire");
        },
        positiveSpeechThreshold: 0.6,
        negativeSpeechThreshold: 0.4,
        minSpeechFrames: 4,
        preSpeechPadFrames: 10,
        redemptionFrames: 8
    });

    return {
        speaking: vad.userSpeaking,
        loading: vad.loading,
        errored: vad.errored,
        start: vad.start,
        pause: vad.pause,
        toggle: vad.toggle
    };
}

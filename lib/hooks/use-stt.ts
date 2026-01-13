import { useState, useEffect, useCallback } from 'react';

interface UseSTTProps {
    onResult: (text: string) => void;
}

export function useSTT({ onResult }: UseSTTProps) {
    const [isListening, setIsListening] = useState(false);
    const [isSupported, setIsSupported] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined' && (window.webkitSpeechRecognition || window.SpeechRecognition)) {
            setIsSupported(true);
        }
    }, []);

    const startListening = useCallback(() => {
        if (!isSupported) return;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.interimResults = false;
        recognition.lang = 'en-US';
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            if (transcript) {
                onResult(transcript);
            }
        };

        recognition.onerror = (event: any) => {
            console.error("Speech Recognition Error:", event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    }, [isSupported, onResult]);

    const stopListening = useCallback(() => {
        // The native API stops automatically after a sentence usually, 
        // but we can force it if we hold the instance ref. 
        // For simple "click to speak", letting it auto-stop on silence is often better UX.
        // We'll just define this reset state interactions.
        setIsListening(false);
    }, []);

    return {
        isListening,
        isSupported,
        startListening,
        stopListening
    };
}

// Add type definition for window
declare global {
    interface Window {
        webkitSpeechRecognition: any;
        SpeechRecognition: any;
    }
}

import { useState, useCallback, useRef } from 'react';

interface UseTTSReturn {
    speak: (text: string) => Promise<void>;
    stop: () => void;
    isPlaying: boolean;
    error: string | null;
}

export function useTTS(): UseTTSReturn {
    const [isPlaying, setIsPlaying] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const stop = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setIsPlaying(false);
        }
    }, []);

    const speak = useCallback(async (text: string) => {
        stop();
        setError(null);
        setIsPlaying(true);

        try {
            const response = await fetch('/api/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ input: text }),
            });

            if (!response.ok) {
                throw new Error(`TTS request failed: ${response.statusText}`);
            }

            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);

            if (audioRef.current) {
                audioRef.current.pause();
            }

            const audio = new Audio(audioUrl);
            audioRef.current = audio;

            audio.onended = () => {
                setIsPlaying(false);
                URL.revokeObjectURL(audioUrl);
            };

            audio.onerror = (e) => {
                console.error("Audio playback error", e);
                setError("Failed to play audio");
                setIsPlaying(false);
            };

            await audio.play();

        } catch (err) {
            console.error('TTS Hook Error:', err);
            setError(err instanceof Error ? err.message : 'Unknown TTS error');
            setIsPlaying(false);
        }
    }, [stop]);

    return { speak, stop, isPlaying, error };
}

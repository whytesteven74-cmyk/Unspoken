import { useState, useCallback, useRef, useEffect } from 'react';

interface UseTTSReturn {
    speak: (text: string) => Promise<void>;
    stop: () => void;
    queue: (text: string) => void;
    isPlaying: boolean;
    isProcessing: boolean;
    error: string | null;
}

export function useTTS(): UseTTSReturn {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Audio Queue System
    const audioQueue = useRef<string[]>([]);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const processingRef = useRef(false);

    const stop = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setIsPlaying(false);
        }
        audioQueue.current = []; // Clear queue
        processingRef.current = false;
        setIsProcessing(false);
    }, []);

    const processQueue = useCallback(async () => {
        if (processingRef.current || audioQueue.current.length === 0) return;

        processingRef.current = true;
        setIsProcessing(true);

        const text = audioQueue.current.shift()!;

        try {
            // Fetch Audio
            const response = await fetch('/api/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ input: text }),
            });

            if (!response.ok) throw new Error(`TTS Error: ${response.statusText}`);

            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);

            const audio = new Audio(audioUrl);
            audioRef.current = audio;
            setIsPlaying(true);

            await new Promise<void>((resolve, reject) => {
                audio.onended = () => {
                    URL.revokeObjectURL(audioUrl);
                    setIsPlaying(false);
                    resolve();
                };
                audio.onerror = (e) => {
                    console.error("Audio playback error", e);
                    reject(e);
                };
                audio.play().catch(reject);
            });

        } catch (err) {
            console.error('TTS Processing Error:', err);
            setError(err instanceof Error ? err.message : 'Unknown TTS error');
        } finally {
            processingRef.current = false;
            setIsProcessing(false);
            // Process next item recursively
            if (audioQueue.current.length > 0) {
                processQueue();
            }
        }
    }, []);

    const queue = useCallback((text: string) => {
        if (!text.trim()) return;
        audioQueue.current.push(text);
        processQueue();
    }, [processQueue]);

    // Legacy speak method (clears queue and speaks immediately)
    const speak = useCallback(async (text: string) => {
        stop();
        queue(text);
    }, [stop, queue]);

    // Cleanup on unmount
    useEffect(() => {
        return () => stop();
    }, [stop]);

    return { speak, stop, queue, isPlaying, isProcessing, error };
}

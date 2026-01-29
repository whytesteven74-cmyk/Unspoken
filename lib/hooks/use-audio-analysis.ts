import { useRef, useState, useCallback, useEffect } from 'react';

export interface AudioData {
    pitchHz: number;
    jitter: number; // 0.0 to 1.0 (fluctuation)
    audioStress: number; // 0.0 (calm) to 1.0 (stressed)
    isActive: boolean;
}

export function useAudioAnalysis() {
    const [audioData, setAudioData] = useState<AudioData>({
        pitchHz: 0,
        jitter: 0,
        audioStress: 0,
        isActive: false
    });

    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const rafRef = useRef<number | null>(null);

    // Pitch detection buffers
    const bufferLength = 2048;
    const pitchBufferRef = useRef<number[]>([]);

    // Auto-correlation algorithm for pitch
    const autoCorrelate = (buffer: Float32Array, sampleRate: number): number => {
        let size = buffer.length;
        let rms = 0;

        for (let i = 0; i < size; i++) {
            const val = buffer[i];
            rms += val * val;
        }
        rms = Math.sqrt(rms / size);

        if (rms < 0.01) return -1; // Too quiet

        let r1 = 0, r2 = size - 1, thres = 0.2;
        for (let i = 0; i < size / 2; i++) {
            if (Math.abs(buffer[i]) < thres) { r1 = i; break; }
        }
        for (let i = 1; i < size / 2; i++) {
            if (Math.abs(buffer[size - 1 - i]) < thres) { r2 = size - 1 - i; break; }
        }

        buffer = buffer.slice(r1, r2);
        size = buffer.length;

        const c = new Array(size).fill(0);
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size - i; j++) {
                c[i] = c[i] + buffer[j] * buffer[j + i];
            }
        }

        let d = 0; while (c[d] > c[d + 1]) d++;
        let maxval = -1, maxpos = -1;
        for (let i = d; i < size; i++) {
            if (c[i] > maxval) {
                maxval = c[i];
                maxpos = i;
            }
        }
        let T0 = maxpos;

        // Better interpolation
        let x1 = c[T0 - 1], x2 = c[T0], x3 = c[T0 + 1];
        let a = (x1 + x3 - 2 * x2) / 2;
        let b = (x3 - x1) / 2;
        if (a) T0 = T0 - b / (2 * a);

        return sampleRate / T0;
    };

    const processAudio = useCallback(() => {
        if (!analyserRef.current || !audioContextRef.current) return;

        const buffer = new Float32Array(bufferLength);
        analyserRef.current.getFloatTimeDomainData(buffer);

        const pitch = autoCorrelate(buffer, audioContextRef.current.sampleRate);

        if (pitch !== -1 && pitch > 50 && pitch < 500) {
            // Add to buffer for jitter calculation
            const prevPitches = pitchBufferRef.current;
            prevPitches.push(pitch);
            if (prevPitches.length > 20) prevPitches.shift();

            // Calculate Jitter (average absolute difference between consecutive pitches)
            let jitterSum = 0;
            for (let i = 1; i < prevPitches.length; i++) {
                jitterSum += Math.abs(prevPitches[i] - prevPitches[i - 1]);
            }
            const avgJitter = prevPitches.length > 1 ? jitterSum / (prevPitches.length - 1) : 0;

            // Normalize stress
            // High pitch + High jitter = High Stress
            const normPitch = Math.min(Math.max((pitch - 100) / 200, 0), 1); // 100-300Hz range
            const normJitter = Math.min(avgJitter / 10, 1); // Jitter threshold

            const stress = (normPitch * 0.3) + (normJitter * 0.7);

            setAudioData({
                pitchHz: pitch,
                jitter: avgJitter,
                audioStress: stress,
                isActive: true
            });
        } else {
            // Quiet / No voiced segment
            setAudioData(prev => ({ ...prev, isActive: false }));
        }

        rafRef.current = requestAnimationFrame(processAudio);
    }, []);

    const startAudio = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioContextRef.current = new AudioContext();
            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = bufferLength;

            microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
            microphoneRef.current.connect(analyserRef.current);

            rafRef.current = requestAnimationFrame(processAudio);
            console.log("[AudioAnalysis] Started");
        } catch (err) {
            console.error("[AudioAnalysis] Access denied:", err);
        }
    };

    const stopAudio = () => {
        if (microphoneRef.current) {
            microphoneRef.current.disconnect();
            microphoneRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        setAudioData({ pitchHz: 0, jitter: 0, audioStress: 0, isActive: false });
    };

    useEffect(() => {
        return () => stopAudio();
    }, []);

    return {
        startAudio,
        stopAudio,
        audioData
    };
}

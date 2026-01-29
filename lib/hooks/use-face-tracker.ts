import { useEffect, useRef, useState, useCallback } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

export interface FaceData {
    valence: number; // 0.0 (sad/stressed) to 1.0 (happy/calm)
    isActive: boolean;
}

export function useFaceTracker() {
    const [faceData, setFaceData] = useState<FaceData>({ valence: 0.5, isActive: false });
    const [isInitialized, setIsInitialized] = useState(false);

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const landmarkerRef = useRef<FaceLandmarker | null>(null);
    const requestRef = useRef<number | null>(null);

    // Initialize MediaPipe
    useEffect(() => {
        let mounted = true;

        async function init() {
            try {
                const vision = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
                );

                if (!mounted) return;

                const landmarker = await FaceLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
                        delegate: "GPU"
                    },
                    outputFaceBlendshapes: true,
                    runningMode: "VIDEO",
                    numFaces: 1
                });

                if (mounted) {
                    landmarkerRef.current = landmarker;
                    setIsInitialized(true);
                    console.log("[FaceTracker] MediaPipe Initialized");
                }
            } catch (err) {
                console.error("[FaceTracker] Init Error:", err);
            }
        }

        init();
        return () => { mounted = false; };
    }, []);

    // Calculate Valence from Landmarks
    const calculateValence = useCallback((landmarks: any) => {
        // Simplified valence calculation
        // Lip corners: 61 (left), 291 (right)
        // Upper lip: 0, 13
        // Lower lip: 14, 17
        // Eyebrows: 105 (left), 334 (right)

        // Use Blendshapes if available (more accurate), provided by MediaPipe
        // But for landmarks, we can approximate smile.

        // We often get blendshapes like "mouthSmileLeft", "mouthSmileRight"
        // Let's assume we can get blendshapes from the result.
        return 0.5; // Placeholder for logic block below
    }, []);

    const processVideo = useCallback(() => {
        if (webcamRunning && videoRef.current && landmarkerRef.current) {
            const startTimeMs = performance.now();
            const result = landmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);

            if (result.faceBlendshapes && result.faceBlendshapes.length > 0) {
                const shapes = result.faceBlendshapes[0].categories;

                // Extract key emotion indicators
                const smileLeft = shapes.find(s => s.categoryName === 'mouthSmileLeft')?.score || 0;
                const smileRight = shapes.find(s => s.categoryName === 'mouthSmileRight')?.score || 0;
                const browDownLeft = shapes.find(s => s.categoryName === 'browDownLeft')?.score || 0;
                const browDownRight = shapes.find(s => s.categoryName === 'browDownRight')?.score || 0;

                // Simple formula: Average Smile - Average Frown + Bias
                const avgSmile = (smileLeft + smileRight) / 2;
                const avgFrown = (browDownLeft + browDownRight) / 2;

                // Normalize to 0-1 range (baseline 0.5)
                // Smile increases valence, Frown decreases it
                let rawValence = 0.5 + (avgSmile * 0.5) - (avgFrown * 0.3);

                // Clamp
                rawValence = Math.max(0, Math.min(1, rawValence));

                setFaceData({ valence: rawValence, isActive: true });
            } else {
                setFaceData(prev => ({ ...prev, isActive: false }));
            }
        }

        if (webcamRunning) {
            requestRef.current = requestAnimationFrame(processVideo);
        }
    }, []);

    const [webcamRunning, setWebcamRunning] = useState(false);

    const startCamera = async () => {
        if (!isInitialized || !videoRef.current) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            videoRef.current.srcObject = stream;
            videoRef.current.addEventListener('loadeddata', () => {
                setWebcamRunning(true);
                requestRef.current = requestAnimationFrame(processVideo);
            });
        } catch (err) {
            console.error("[FaceTracker] Camera denied:", err);
        }
    };

    const stopCamera = () => {
        setWebcamRunning(false);
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };

    // Auto-update effect for process loop
    useEffect(() => {
        if (webcamRunning) {
            requestRef.current = requestAnimationFrame(processVideo);
        }
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [webcamRunning, processVideo]);

    return {
        videoRef,
        startCamera,
        stopCamera,
        faceData,
        isReady: isInitialized
    };
}

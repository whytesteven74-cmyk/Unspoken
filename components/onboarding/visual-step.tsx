"use client";

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
// Mocking the hook interface if it's strictly bound to a context, 
// but assuming we can simulate the "Face Scan" UI here for the wizard.
// In a real integration, we'd pull shared state or use the hook directly.

export function VisualStep({ onComplete }: { onComplete: (val: number) => void }) {
    const [progress, setProgress] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        // Start camera
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                if (videoRef.current) videoRef.current.srcObject = stream;
            })
            .catch(err => console.error("Internal Camera Error (Simulated)", err));

        // Fake scan progress
        const interval = setInterval(() => {
            setProgress(p => {
                if (p >= 100) {
                    clearInterval(interval);
                    onComplete(0.45); // Mock "Resting Valence"
                    return 100;
                }
                return p + 2;
            });
        }, 60);

        return () => {
            clearInterval(interval);
            // Cleanup tracks
            if (videoRef.current && videoRef.current.srcObject) {
                (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
            }
        };
    }, []);

    return (
        <div className="text-center space-y-6">
            <h3 className="text-xl text-white">Visual Baseline</h3>
            <p className="text-zinc-400 text-sm">Look at the camera. Relax your face.</p>

            <div className="relative w-64 h-64 mx-auto rounded-full overflow-hidden border-4 border-zinc-800">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover opacity-50 grayscale" />

                {/* Face Scanning Grid Overlay */}
                <motion.div
                    className="absolute inset-0 bg-teal-500/10 grid grid-cols-4 grid-rows-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                />

                {/* Scanning Ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle cx="128" cy="128" r="120" stroke="currentColor" strokeWidth="4" fill="none" className="text-zinc-800" />
                    <motion.circle
                        cx="128" cy="128" r="120"
                        stroke="currentColor" strokeWidth="4" fill="none"
                        className="text-teal-500"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: progress / 100 }}
                    />
                </svg>
            </div>

            <p className="font-mono text-teal-400">{Math.round(progress)}% Calibrated</p>
        </div>
    );
}

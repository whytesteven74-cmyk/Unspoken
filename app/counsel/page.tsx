'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, X, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';

import { useVAD } from '@/hooks/use-vad';

export default function CounselPage() {
    const [aiState, setAiState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');

    const vad = useVAD();

    useEffect(() => {
        if (vad.speaking) {
            setAiState('listening');
        } else if (aiState === 'listening' && !vad.speaking) {
            // Speech ended, now thinking
            setAiState('thinking');
            // Simulate AI reply delay
            setTimeout(() => setAiState('speaking'), 1000);
            setTimeout(() => setAiState('idle'), 4000);
        }
    }, [vad.speaking]);

    const toggleSession = () => {
        vad.toggle();
    };

    const isListening = !vad.loading && !vad.errored; // Simplified for demo

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-between p-6 relative overflow-hidden">

            {/* Ambient Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-teal-900/20 to-black pointer-events-none" />

            {/* Header / Controls */}
            <header className="w-full max-w-lg flex items-center justify-between z-10 text-white/50">
                <Link href="/chat" className="p-3 rounded-full hover:bg-white/10 transition">
                    <X size={24} />
                </Link>
                <div className="flex flex-col items-center">
                    <span className="text-xs font-mono tracking-widest uppercase">Unspoken Voice</span>
                    <span className="text-[10px] text-teal-500/80">{isListening ? 'LIVE CONNECTION' : 'STANDBY'}</span>
                </div>
                <button className="p-3 rounded-full hover:bg-white/10 transition">
                    <MoreHorizontal size={24} />
                </button>
            </header>

            {/* ORB / VISUALIZER */}
            <main className="flex-1 flex flex-col items-center justify-center w-full z-10">
                <div className="relative w-64 h-64 flex items-center justify-center">

                    {/* Core Orb */}
                    <motion.div
                        animate={{
                            scale: aiState === 'listening' ? [1, 1.05, 1] :
                                aiState === 'speaking' ? [1, 1.2, 1] : 1,
                            opacity: aiState === 'idle' ? 0.3 : 1
                        }}
                        transition={{
                            repeat: Infinity,
                            duration: aiState === 'speaking' ? 0.5 : 2,
                            ease: "easeInOut"
                        }}
                        className={`w-32 h-32 rounded-full blur-xl transition-colors duration-1000 ${aiState === 'listening' ? 'bg-teal-500' :
                            aiState === 'speaking' ? 'bg-indigo-500' :
                                aiState === 'thinking' ? 'bg-white' : 'bg-neutral-800'
                            }`}
                    />

                    {/* Outer Rings (React to volume) */}
                    <AnimatePresence>
                        {aiState !== 'idle' && (
                            <>
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1.5, opacity: 0.2 }}
                                    exit={{ scale: 0.8, opacity: 0 }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className="absolute inset-0 rounded-full border border-white/20"
                                />
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 2, opacity: 0.1 }}
                                    exit={{ scale: 0.8, opacity: 0 }}
                                    transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
                                    className="absolute inset-0 rounded-full border border-white/10"
                                />
                            </>
                        )}
                    </AnimatePresence>
                </div>

                <div className="mt-12 h-8 flex items-center gap-1">
                    {/* Text Status Indicator */}
                    <motion.span
                        key={aiState}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-white/60 font-serif text-lg"
                    >
                        {aiState === 'listening' ? "Listening..." :
                            aiState === 'thinking' ? "Processing..." :
                                aiState === 'speaking' ? "Speaking..." : "Tap to start"}
                    </motion.span>
                </div>
            </main>

            {/* Footer / Mic Toggle */}
            <footer className="w-full max-w-lg flex justify-center pb-8 z-10">
                <button
                    onClick={toggleSession}
                    className={`p-6 rounded-full transition-all duration-300 ${isListening
                        ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                        : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                >
                    {isListening ? <MicOff size={32} /> : <Mic size={32} />}
                </button>
            </footer>
        </div>
    );
}

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Volume2, StopCircle, Activity, HeartPulse, ShieldCheck, Sparkles } from 'lucide-react';
import { CrisisOverlay } from './crisis-overlay';
import { useTTS } from '@/lib/hooks/use-tts';
import { BiometricData } from '@/lib/types';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

export function ChatInterface() {
    // Biometric State (Simulation)
    const [stressScore, setStressScore] = useState(0.5);
    const [pitch, setPitch] = useState(120);
    const [isCrisis, setIsCrisis] = useState(false);
    const [crisisResources, setCrisisResources] = useState<any[]>([]);

    // Chat State
    const [messages, setMessages] = useState<any[]>([]);
    const [localInput, setLocalInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // TTS Hook
    const { speak, stop: stopTTS, isPlaying: isTTSPlaying } = useTTS();

    const bottomRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom on new messages
    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleSend = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!localInput.trim() || isLoading) return;

        const text = localInput;
        setLocalInput(''); // Optimistic clear
        stopTTS();

        // Add User Message
        const userMsg = { id: Date.now(), role: 'user', content: text };
        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMsg],
                    biometricData: {
                        pitch_hz: pitch,
                        jitter_percent: stressScore * 20,
                        face_valence: 1 - stressScore * 2,
                        derived_stress_score: stressScore,
                        metadata: { sensor_confidence: 1.0 }
                    }
                })
            });

            if (!response.ok) throw new Error(response.statusText);

            // Create Assistant Message Placeholder
            const assistantMsgId = Date.now() + 1;
            setMessages(prev => [...prev, { id: assistantMsgId, role: 'assistant', content: '' }]);

            // Stream Reader
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            if (!reader) throw new Error('No reader available');

            let assistantContent = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                assistantContent += chunk;

                setMessages(prev => prev.map(m =>
                    m.id === assistantMsgId ? { ...m, content: assistantContent } : m
                ));
            }

            // TTS on finish
            if (!isCrisis) {
                speak(assistantContent);
            }

        } catch (err: any) {
            console.error("Chat Error:", err);
            alert(`Chat Error: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-slate-800 font-sans overflow-hidden">
            <CrisisOverlay
                isOpen={isCrisis}
                onClose={() => setIsCrisis(false)}
                resources={crisisResources.length > 0 ? crisisResources : undefined}
            />

            {/* Main Chat Area */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 flex flex-col max-w-5xl mx-auto w-full bg-white/80 backdrop-blur-xl shadow-2xl h-full md:h-[95vh] md:mt-[2.5vh] md:rounded-3xl border border-white/50 overflow-hidden relative"
            >
                {/* Decorative Background Elements */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 via-blue-500 to-purple-500 opacity-80" />

                {/* Header */}
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white/60 sticky top-0 z-10 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl shadow-lg shadow-teal-500/20">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-slate-800 tracking-tight">Unspoken</h1>
                            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">Biometric CBT Bridge</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100/50 rounded-full border border-slate-200/50 backdrop-blur-sm">
                            <div className={clsx("w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.2)]", stressScore > 0.7 ? "bg-red-500 animate-pulse shadow-red-500/50" : "bg-emerald-500 shadow-emerald-500/50")} />
                            <span className="text-xs font-medium text-slate-600">Bio-Link Active</span>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scroll-smooth custom-scrollbar">
                    {messages.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="flex flex-col items-center justify-center h-[60%] text-center space-y-6"
                        >
                            <div className="relative">
                                <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-white rounded-full flex items-center justify-center shadow-inner border border-slate-50">
                                    <HeartPulse className="w-10 h-10 text-slate-300" />
                                </div>
                                <div className="absolute inset-0 rounded-full border border-slate-200 animate-[ping_3s_ease-in-out_infinite] opacity-50" />
                            </div>
                            <div className="max-w-md space-y-2">
                                <h2 className="text-xl font-semibold text-slate-700">I'm listening.</h2>
                                <p className="text-slate-500 text-sm leading-relaxed">
                                    This is a safe space. I analyze your tone and stress levels to provide the right support. How are you feeling right now?
                                </p>
                            </div>
                        </motion.div>
                    )}

                    <AnimatePresence mode="popLayout">
                        {messages.map((m: any) => (
                            <motion.div
                                key={m.id}
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                                layout
                                className={clsx(
                                    "flex flex-col max-w-[85%] md:max-w-[75%]",
                                    m.role === 'user' ? "self-end items-end" : "self-start items-start"
                                )}
                            >
                                <div
                                    className={clsx(
                                        "px-5 py-3.5 shadow-sm text-[15px] leading-relaxed relative group",
                                        m.role === 'user'
                                            ? "bg-slate-800 text-white rounded-2xl rounded-br-none shadow-slate-300/50"
                                            : "bg-white border border-slate-100 text-slate-700 rounded-2xl rounded-bl-none shadow-slate-200/50"
                                    )}
                                >
                                    {m.content}
                                </div>

                                {m.role === 'assistant' && (
                                    <div className="flex items-center mt-1 ml-1 space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => speak(m.content)}
                                            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-teal-600 transition-colors"
                                            title="Read Aloud"
                                        >
                                            {isTTSPlaying ? <Volume2 className="w-3.5 h-3.5 animate-pulse text-teal-500" /> : <Volume2 className="w-3.5 h-3.5" />}
                                        </button>
                                        <span className="text-[10px] text-slate-300">AI Verified Support</span>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="self-start bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-bl-none flex items-center gap-1.5 shadow-sm"
                        >
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                        </motion.div>
                    )}
                    <div ref={bottomRef} className="h-4" />
                </div>

                {/* Input Area */}
                <div className="p-6 bg-gradient-to-t from-white via-white to-white/0 pt-10">
                    <form onSubmit={handleSend} className="relative flex items-center group">
                        <div className="absolute inset-0 bg-slate-100 rounded-2xl md:rounded-3xl border border-transparent group-focus-within:border-teal-500/30 group-focus-within:bg-white group-focus-within:shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-all duration-300" />

                        <input
                            value={localInput}
                            onChange={(e) => setLocalInput(e.target.value)}
                            placeholder="Type how you feel..."
                            className="w-full bg-transparent border-none px-6 py-4 md:py-5 text-slate-700 placeholder:text-slate-400 focus:ring-0 relative z-10"
                            disabled={isLoading}
                        />

                        <div className="absolute right-3 z-20 flex items-center gap-2">
                            <button
                                type="button"
                                className="p-2 text-slate-400 hover:text-teal-600 transition-colors rounded-full hover:bg-slate-50"
                                disabled={isLoading}
                            >
                                <Mic className="w-5 h-5" />
                            </button>
                            <button
                                type="submit"
                                disabled={!localInput.trim() || isLoading}
                                className="p-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-slate-900/20 active:scale-95"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Send className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </form>
                    <div className="text-center mt-3">
                        <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1.5">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Private & Encrypted Session</span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full" />
                            <span>AI-Enhanced Support</span>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

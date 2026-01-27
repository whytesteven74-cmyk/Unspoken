'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Volume2, StopCircle, Activity, HeartPulse, ShieldCheck, Sparkles, Twitter, Github } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { VoiceControls } from '@/components/voice-controls';
import { ModeToggle } from '@/components/mode-toggle';
import { useAnalytics } from '@/lib/analytics';
import { CrisisOverlay } from './crisis-overlay';
import { useSTT } from '@/lib/hooks/use-stt';
import { useTTS, getOptimalVoice } from '@/lib/hooks/use-tts';
import { BiometricData } from '@/lib/types';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

export function ChatInterface() {
    const { track } = useAnalytics();

    // Biometric State (Simulation)
    const [stressScore, setStressScore] = useState(0.5);
    const [isCrisis, setIsCrisis] = useState(false);
    const [crisisResources, setCrisisResources] = useState<any[]>([]);

    // Voice State
    const [selectedVoice, setSelectedVoice] = useState('auto');
    const [isTTSEnabled, setIsTTSEnabled] = useState(true);

    // Helper to determine voice
    const getCurrentVoice = (score: number) => {
        return selectedVoice === 'auto' ? getOptimalVoice(score) : selectedVoice;
    };

    // Chat State
    const [messages, setMessages] = useState<any[]>([]);
    const [localInput, setLocalInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Biometric State (Detail)
    const [pitch, setPitch] = useState(220);
    const [jitter, setJitter] = useState(5);
    const [showDebug, setShowDebug] = useState(false);

    // TTS Hook
    const { speak, queue, stop: stopTTS, isPlaying: isTTSPlaying } = useTTS();

    // STT Hook
    const { isListening, isSupported, startListening } = useSTT({
        onResult: (text) => setLocalInput(prev => `${prev} ${text}`.trim())
    });

    const bottomRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom on new messages
    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    // Crisis Trigger
    useEffect(() => {
        if (stressScore > 0.9 && !isCrisis) {
            setIsCrisis(true);
            track('crisis_triggered', { stressScore });
        }
    }, [stressScore, isCrisis, track]);


    // Restore Session History
    useEffect(() => {
        fetch('/api/chat/history')
            .then(res => res.json())
            .then(data => {
                if (data.messages) setMessages(data.messages);
            })
            .catch(err => console.error("Failed to load history:", err));
    }, []);

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

        track('chat_sent', { length: text.length, stressScore });

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
            let ttsBuffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                assistantContent += chunk;

                // Handle TTS Buffering
                if (!isCrisis && isTTSEnabled) {
                    ttsBuffer += chunk;

                    // Check for sentence delimiters
                    // We look for . ! ? followed by space or end of string, or newlines
                    const delimiterMatch = ttsBuffer.match(/[.!?]+(?=\s|$)|[\n]+/);

                    if (delimiterMatch) {
                        const lastIndex = delimiterMatch.index! + delimiterMatch[0].length;
                        const sentence = ttsBuffer.substring(0, lastIndex);
                        const remainder = ttsBuffer.substring(lastIndex);

                        if (sentence.trim()) {
                            queue(sentence.trim(), getCurrentVoice(stressScore));
                        }
                        ttsBuffer = remainder;
                    }
                }

                setMessages(prev => prev.map(m =>
                    m.id === assistantMsgId ? { ...m, content: assistantContent } : m
                ));
            }

            // Queue any remaining text in buffer after stream ends
            if (!isCrisis && isTTSEnabled && ttsBuffer.trim()) {
                queue(ttsBuffer.trim(), getCurrentVoice(stressScore));
            }
            console.error("Chat Error:", err);
            alert(`Chat Error: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="flex h-screen bg-background text-foreground font-sans overflow-hidden relative">
            <CrisisOverlay
                isOpen={isCrisis}
                onClose={() => setIsCrisis(false)}
                resources={crisisResources.length > 0 ? crisisResources : undefined}
            />

            {/* Biometric Debug Panel */}
            <AnimatePresence>
                {showDebug && (
                    <motion.div
                        initial={{ x: -300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -300, opacity: 0 }}
                        className="absolute left-0 top-0 bottom-0 w-80 bg-white/90 backdrop-blur-md shadow-2xl z-20 border-r border-slate-200 p-6 overflow-y-auto"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-semibold text-slate-800 mb-0 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-teal-600" />
                                Biometric Controls
                            </h3>
                            <button onClick={() => setShowDebug(false)} className="text-slate-400 hover:text-slate-600">
                                <StopCircle className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    <span>Stress Level</span>
                                    <span className={stressScore > 0.7 ? "text-red-500" : "text-emerald-500"}>{stressScore.toFixed(2)}</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={stressScore}
                                    onChange={(e) => setStressScore(parseFloat(e.target.value))}
                                    className="w-full accent-teal-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                />
                                <p className="text-[10px] text-slate-400">Higher scores trigger empathy & grounding protocols.</p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    <span>Voice Pitch (Hz)</span>
                                    <span>{pitch} Hz</span>
                                </div>
                                <input
                                    type="range"
                                    min="80"
                                    max="300"
                                    step="10"
                                    value={pitch}
                                    onChange={(e) => setPitch(parseInt(e.target.value))}
                                    className="w-full accent-indigo-500 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    <span>Voice Jitter (%)</span>
                                    <span>{jitter.toFixed(1)}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="50"
                                    step="0.5"
                                    value={jitter}
                                    onChange={(e) => setJitter(parseFloat(e.target.value))}
                                    className="w-full accent-purple-500 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>

                            <div className="pt-4 border-t border-slate-200">
                                <button
                                    onClick={() => setIsCrisis(!isCrisis)}
                                    className={clsx(
                                        "w-full py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition-all font-medium text-sm",
                                        isCrisis
                                            ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                                            : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
                                    )}
                                >
                                    <ShieldCheck className="w-4 h-4" />
                                    {isCrisis ? "Deactivate Crisis Mode" : "Force Crisis Mode"}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button for Debug Panel */}
            {!showDebug && (
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => setShowDebug(true)}
                    className="absolute left-6 bottom-6 z-10 p-3 bg-white/80 backdrop-blur shadow-lg border border-white/50 rounded-full text-slate-400 hover:text-teal-600 hover:scale-110 transition-all"
                >
                    <Activity className="w-6 h-6" />
                </motion.button>
            )}

            {/* Main Chat Area */}
            <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{
                    opacity: 1,
                    y: 0,
                    x: showDebug ? 160 : 0, // Push content slightly when debug is open
                    scale: showDebug ? 0.95 : 1
                }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
                className="flex-1 flex flex-col max-w-5xl mx-auto w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] backdrop-blur-3xl shadow-[var(--glass-shadow)] h-full md:h-[95vh] md:mt-[2.5vh] md:rounded-3xl overflow-hidden relative"
            >
                {/* Decorative Background Elements */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 via-blue-500 to-purple-500 opacity-80" />

                {/* Header */}
                <div className="p-5 border-b border-[var(--glass-border)] flex justify-between items-center bg-[var(--glass-bg)] sticky top-0 z-10 backdrop-blur-md">
                    <Logo size="md" />

                    <div className="flex items-center gap-4">
                        <VoiceControls
                            selectedVoice={selectedVoice}
                            onVoiceChange={setSelectedVoice}
                            isTTSEnabled={isTTSEnabled}
                            onTTSToggle={() => setIsTTSEnabled(!isTTSEnabled)}
                        />
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100/50 rounded-full border border-slate-200/50 backdrop-blur-sm">
                            <div className={clsx("w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.2)]", stressScore > 0.7 ? "bg-red-500 animate-pulse shadow-red-500/50" : "bg-emerald-500 shadow-emerald-500/50")} />
                            <span className="hidden sm:inline text-xs font-medium text-slate-600 dark:text-slate-400">Bio-Link Active</span>
                        </div>
                        <ModeToggle />
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
                                <h2 className="text-xl font-semibold text-foreground">I'm listening.</h2>
                                <p className="text-muted-foreground text-sm leading-relaxed">
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
                                        "px-5 py-3.5 shadow-sm text-[15px] leading-relaxed relative group backdrop-blur-md border",
                                        m.role === 'user'
                                            ? "bg-indigo-600/30 border-indigo-500/30 text-white rounded-2xl rounded-br-none shadow-lg shadow-indigo-500/10"
                                            : "bg-[var(--glass-bg)] border border-[var(--glass-border)] text-foreground rounded-2xl rounded-bl-none shadow-lg"
                                    )}
                                >
                                    {m.content}
                                </div>

                                {m.role === 'assistant' && (
                                    <div className="flex items-center mt-1 ml-1 space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => speak(m.content, getCurrentVoice(stressScore))}
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
                <div className="p-6 bg-gradient-to-t from-black/20 via-black/10 to-transparent pt-10">
                    <form onSubmit={handleSend} className="relative flex items-center group">
                        <div className="absolute inset-0 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl md:rounded-3xl group-focus-within:border-indigo-500/50 group-focus-within:bg-[var(--glass-bg)] group-focus-within:shadow-[0_4px_20px_rgba(99,102,241,0.1)] transition-all duration-300 backdrop-blur-md" />

                        <input
                            value={localInput}
                            onChange={(e) => setLocalInput(e.target.value)}
                            placeholder="Type how you feel..."
                            className="w-full bg-transparent border-none px-6 py-4 md:py-5 text-foreground placeholder:text-muted-foreground focus:ring-0 relative z-10"
                            disabled={isLoading}
                        />

                        <div className="absolute right-3 z-20 flex items-center gap-2">
                            <button
                                type="button"
                                onClick={isListening ? () => { } : startListening}
                                className={clsx(
                                    "p-2 transition-colors rounded-full",
                                    isListening
                                        ? "bg-red-50 text-red-600 animate-pulse border border-red-200"
                                        : "text-slate-400 hover:text-teal-600 hover:bg-slate-50"
                                )}
                                disabled={isLoading || !isSupported}
                                title={!isSupported ? "Voice input not supported in this browser" : "Speak"}
                            >
                                {isListening ? <StopCircle className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
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

                {/* Social Footer */}
                <div className="absolute bottom-2 left-0 w-full flex justify-center gap-4 text-slate-500 opacity-50 hover:opacity-100 transition-opacity">
                    <a href="#" className="hover:text-teal-400 transition-colors"><Twitter className="w-4 h-4" /></a>
                    <a href="#" className="hover:text-slate-200 transition-colors"><Github className="w-4 h-4" /></a>
                </div>
            </motion.div>
        </div>
    );
}

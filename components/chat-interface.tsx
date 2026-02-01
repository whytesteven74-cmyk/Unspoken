'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Volume2, StopCircle, Activity, HeartPulse, ShieldCheck, Sparkles, Twitter, Github, LogOut } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { VoiceControls } from '@/components/voice-controls';
import { ModeToggle } from '@/components/mode-toggle';
import { useAnalytics } from '@/lib/analytics';
import { CrisisOverlay } from './crisis-overlay';
import { ShareModal } from '@/components/growth/share-modal';
import { useSTT } from '@/lib/hooks/use-stt';
import { useTTS, getOptimalVoice } from '@/lib/hooks/use-tts';
import { useFaceTracker } from '@/lib/hooks/use-face-tracker';
import { useAudioAnalysis } from '@/lib/hooks/use-audio-analysis';
import { BiometricData } from '@/lib/types';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/hooks/use-auth';
import { useRouter } from 'next/navigation';

export function ChatInterface() {
    const { track } = useAnalytics();
    const { user, loading: authLoading, signOut } = useAuth();
    const router = useRouter();

    // Biometric Hooks (Real-time)
    const { videoRef, startCamera, stopCamera, faceData, isReady: isFaceReady } = useFaceTracker();
    const { startAudio, stopAudio, audioData } = useAudioAnalysis();

    // Derived Stress Score (Simple Weighted Average)
    const stressScore = Math.max(0, Math.min(1,
        ((1 - faceData.valence) * 0.6) + (audioData.audioStress * 0.4)
    ));

    const [isPrivacyMode, setIsPrivacyMode] = useState(false);
    const [isCrisis, setIsCrisis] = useState(false);
    const [crisisResources, setCrisisResources] = useState<any[]>([]);

    // Voice State
    const [selectedVoice, setSelectedVoice] = useState('auto');
    const [isTTSEnabled, setIsTTSEnabled] = useState(true);

    // Chat State
    const [messages, setMessages] = useState<any[]>([]);
    const [localInput, setLocalInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showDebug, setShowDebug] = useState(false);

    // Growth / Viral Loop State
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [currentInsight, setCurrentInsight] = useState("");

    // TTS Hook
    const { speak, queue, stop: stopTTS, isPlaying: isTTSPlaying } = useTTS();

    // STT Hook
    const { isListening, isSupported, startListening } = useSTT({
        onResult: (text) => setLocalInput(prev => `${prev} ${text}`.trim())
    });

    const bottomRef = useRef<HTMLDivElement>(null);

    // Auth Redirect
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    // Load History
    useEffect(() => {
        if (user) {
            fetch('/api/history')
                .then(res => res.json())
                .then(data => {
                    if (data.messages) setMessages(data.messages);
                })
                .catch(err => console.error("Failed to load history:", err));
        }
    }, [user]);

    // Manage Sensors
    useEffect(() => {
        const manageSensors = async () => {
            if (isPrivacyMode) {
                stopCamera();
                stopAudio();
            } else {
                await startAudio();
                if (isFaceReady) await startCamera();
            }
        };
        if (isFaceReady) manageSensors();
        return () => {
            if (!isPrivacyMode) {
                stopCamera();
                stopAudio();
            }
        };
    }, [isFaceReady, startCamera, startAudio, stopCamera, stopAudio, isPrivacyMode]);

    // Scroll to bottom
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

    const getCurrentVoice = (score: number) => {
        return selectedVoice === 'auto' ? getOptimalVoice(score) : selectedVoice;
    };

    const handleSend = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!localInput.trim() || isLoading) return;

        const text = localInput;
        setLocalInput('');
        stopTTS();

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
                        pitch_hz: audioData.pitchHz,
                        jitter_percent: audioData.jitter * 100,
                        face_valence: faceData.valence,
                        derived_stress_score: stressScore
                    }
                })
            });

            if (!response.ok) throw new Error(response.statusText);

            const assistantMsgId = Date.now() + 1;
            setMessages(prev => [...prev, { id: assistantMsgId, role: 'assistant', content: '' }]);

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

                if (!isCrisis && isTTSEnabled) {
                    ttsBuffer += chunk;
                    const delimiterMatch = ttsBuffer.match(/[.!?]+(?=\s|$)|[\n]+/);
                    if (delimiterMatch) {
                        const lastIndex = delimiterMatch.index! + delimiterMatch[0].length;
                        const sentence = ttsBuffer.substring(0, lastIndex);
                        const remainder = ttsBuffer.substring(lastIndex);
                        if (sentence.trim()) queue(sentence.trim(), getCurrentVoice(stressScore));
                        ttsBuffer = remainder;
                    }
                }

                setMessages(prev => prev.map(m =>
                    m.id === assistantMsgId ? { ...m, content: assistantContent } : m
                ));
            }

            if (!isCrisis && isTTSEnabled && ttsBuffer.trim()) {
                queue(ttsBuffer.trim(), getCurrentVoice(stressScore));
            }
        } catch (err: any) {
            console.error("Chat Error:", err);
            alert(`Chat Error: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-background text-foreground font-sans overflow-hidden relative">
            {/* Hidden Video Feed for MediaPipe */}
            <div className="absolute opacity-0 pointer-events-none w-1 h-1 overflow-hidden">
                <video ref={videoRef} autoPlay playsInline muted className="w-1 h-1" />
            </div>

            <AnimatePresence>
                {showDebug && (
                    <motion.div
                        initial={{ x: -300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -300, opacity: 0 }}
                        className="fixed left-0 top-0 bottom-0 w-80 bg-white/90 backdrop-blur-md shadow-2xl z-[60] border-r border-slate-200 p-6 overflow-y-auto"
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
                                <div className="w-full h-2 bg-slate-200 rounded-lg overflow-hidden">
                                    <div
                                        className={clsx("h-full transition-all duration-300", stressScore > 0.7 ? "bg-red-500" : "bg-emerald-500")}
                                        style={{ width: `${stressScore * 100}%` }}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    <span>Voice Pitch</span>
                                    <span>{audioData.pitchHz.toFixed(0)} Hz</span>
                                </div>
                                <div className="w-full h-1 bg-slate-200 rounded-lg overflow-hidden">
                                    <div
                                        className="h-full bg-indigo-500 transition-all duration-300"
                                        style={{ width: `${Math.min(audioData.pitchHz / 4, 100)}%` }}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-200">
                                <button
                                    onClick={() => setIsCrisis(!isCrisis)}
                                    className={clsx(
                                        "w-full py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition-all font-medium text-sm",
                                        isCrisis ? "bg-red-50 text-red-600 border border-red-200" : "bg-slate-50 text-slate-600 border border-slate-200"
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

            <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{
                    opacity: 1,
                    y: 0,
                    x: showDebug ? 160 : 0,
                    scale: showDebug ? 0.98 : 1
                }}
                className="flex-1 flex flex-col max-w-5xl mx-auto w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] backdrop-blur-3xl shadow-[var(--glass-shadow)] h-full md:h-[95vh] md:mt-[2.5vh] md:rounded-3xl overflow-hidden relative"
            >
                {/* Header */}
                <div className="p-4 md:p-5 border-b border-[var(--glass-border)] flex justify-between items-center bg-[var(--glass-bg)]/80 sticky top-0 z-10 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <Logo size="md" />
                        {user && (
                            <div className="hidden lg:flex flex-col border-l border-slate-200 pl-4 py-1">
                                <span className="text-[10px] font-bold text-teal-600 uppercase">Session Active</span>
                                <span className="text-[11px] text-slate-500 truncate max-w-[150px]">{user.email}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <VoiceControls
                            selectedVoice={selectedVoice}
                            onVoiceChange={setSelectedVoice}
                            isTTSEnabled={isTTSEnabled}
                            onTTSToggle={() => setIsTTSEnabled(!isTTSEnabled)}
                        />
                        <button
                            onClick={() => setIsPrivacyMode(!isPrivacyMode)}
                            className={clsx(
                                "flex items-center gap-2 py-1.5 px-3 rounded-full border transition-all text-[11px] font-bold",
                                isPrivacyMode ? "bg-red-50 text-red-600 border-red-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
                            )}
                        >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            {isPrivacyMode ? "Privacy Mode" : "Secure"}
                        </button>
                        <ModeToggle />
                        <button
                            onClick={signOut}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            title="Sign Out"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Viral Loop Trigger (Development) */}
                    <button
                        onClick={() => {
                            setCurrentInsight("I realized my productivity is a mask for my anxiety.");
                            setIsShareModalOpen(true);
                        }}
                        className="absolute bottom-[-16px] right-8 bg-teal-500 hover:bg-teal-600 text-white text-[10px] font-bold px-3 py-1 rounded-b-lg shadow-lg flex items-center gap-1 transition-all z-20"
                    >
                        <Sparkles size={10} />
                        FORCE BREAKTHROUGH
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar">
                    {messages.length === 0 && !isLoading && (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                            <HeartPulse className="w-12 h-12 text-teal-100 animate-pulse" />
                            <div className="max-w-md space-y-2">
                                <h2 className="text-xl font-semibold text-slate-800">Welcome back.</h2>
                                <p className="text-slate-500 text-sm leading-relaxed">
                                    Your session is private, encrypted, and persistent. How can I support you today?
                                </p>
                            </div>
                        </div>
                    )}

                    <AnimatePresence mode="popLayout">
                        {messages.map((m: any) => (
                            <motion.div
                                key={m.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={clsx(
                                    "flex flex-col max-w-[85%] md:max-w-[75%]",
                                    m.role === 'user' ? "self-end items-end" : "self-start items-start"
                                )}
                            >
                                <div className={clsx(
                                    "px-5 py-3.5 shadow-sm text-[15px] leading-relaxed relative rounded-2xl",
                                    m.role === 'user'
                                        ? "bg-indigo-600 text-white rounded-br-none"
                                        : "bg-white border border-slate-100 text-slate-800 rounded-bl-none"
                                )}>
                                    {m.content}
                                </div>
                                {m.role === 'assistant' && (
                                    <button onClick={() => speak(m.content, getCurrentVoice(stressScore))} className="mt-1 p-1 text-slate-400 hover:text-teal-600">
                                        {isTTSPlaying ? <Volume2 className="w-4 h-4 animate-pulse text-teal-500" /> : <Volume2 className="w-4 h-4" />}
                                    </button>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {isLoading && (
                        <div className="self-start flex gap-1.5 p-3">
                            <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" />
                            <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                            <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                    )}
                    <div ref={bottomRef} className="h-1" />
                </div>

                {/* Input Area */}
                <div className="p-4 md:p-6 bg-white/50 backdrop-blur-md border-t border-slate-100">
                    <form onSubmit={handleSend} className="relative flex items-center">
                        <input
                            value={localInput}
                            onChange={(e) => setLocalInput(e.target.value)}
                            placeholder="Share what's on your mind..."
                            className="w-full bg-slate-50/50 border border-slate-200/50 px-6 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                            disabled={isLoading}
                        />
                        <div className="absolute right-3 flex items-center gap-1">
                            <button
                                type="button"
                                onClick={isListening ? () => { } : startListening}
                                className={clsx("p-2 rounded-full transition-all", isListening ? "bg-red-50 text-red-600 animate-pulse" : "text-slate-400 hover:text-teal-600")}
                            >
                                {isListening ? <StopCircle className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                            </button>
                            <button
                                type="submit"
                                disabled={!localInput.trim() || isLoading}
                                className="p-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-700 disabled:opacity-50 transition-all"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>

            {/* Debug Toggle */}
            <button
                onClick={() => setShowDebug(!showDebug)}
                className="fixed left-6 bottom-6 p-3 bg-white shadow-xl rounded-full text-slate-400 hover:text-teal-600 transition-all z-50"
            >
                <Activity className="w-6 h-6" />
            </button>

            {/* Overlays */}
            <CrisisOverlay isOpen={isCrisis} onClose={() => setIsCrisis(false)} />
            <ShareModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                insight={currentInsight}
                valence={faceData.valence} // Real-time valence
            />
            {authLoading && (
                <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-[100] flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <Activity className="w-8 h-8 text-teal-600 animate-pulse" />
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Securing Session</span>
                    </div>
                </div>
            )}
        </div>
    );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { Send, Mic, Volume2, StopCircle, Activity, HeartPulse, Frown, Smile } from 'lucide-react';
import { CrisisOverlay } from './crisis-overlay';
import { useTTS } from '@/lib/hooks/use-tts';
import { BiometricData } from '@/lib/types';
import clsx from 'clsx';

export function ChatInterface() {
    // Biometric State (Simulation)
    const [stressScore, setStressScore] = useState(0.5);
    const [pitch, setPitch] = useState(120);
    const [isCrisis, setIsCrisis] = useState(false);
    const [crisisResources, setCrisisResources] = useState<any[]>([]);

    // TTS Hook
    const { speak, stop: stopTTS, isPlaying: isTTSPlaying } = useTTS();

    // Vercel AI SDK
    const { messages, input, handleInputChange, handleSubmit, isLoading, error: chatError } = useChat({
        api: '/api/chat',
        body: {
            biometricData: {
                pitch_hz: pitch,
                jitter_percent: stressScore * 20, // Simulated correlation
                face_valence: 1 - stressScore * 2, // High stress = Low valence
                derived_stress_score: stressScore,
                metadata: {
                    sensor_confidence: 1.0
                }
            } as BiometricData
        },
        onError: (err) => {
            // Check if it's a JSON response from our Guardrail
            try {
                // The error object from Vercel SDK might be wrapped, so we need to be careful.
                // In a real app, we'd parse the response body, but `err` here is an Error object.
                // Our API returns 400 with a Crisis JSON.
                console.error("Chat Error:", err);
                // For demo purposes, we'll check message content or standard error handling
            } catch (e) {
                console.error("Error parsing error response", e);
            }
        },
        onResponse: async (response) => {
            if (response.status === 400) {
                const data = await response.json();
                if (data.trigger === 'detected_crisis_keywords') {
                    setIsCrisis(true);
                    setCrisisResources(data.resources);
                    // Don't auto-speak in crisis to avoid overwhelming user
                }
            }
        },
        onFinish: (message) => {
            // Auto-speak assistant response if no crisis
            if (message.role === 'assistant' && !isCrisis) {
                speak(message.content);
            }
        }
    });

    // Handle manual submit to stop any playing audio
    const onFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        stopTTS();
        handleSubmit(e);
    };

    return (
        <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
            <CrisisOverlay
                isOpen={isCrisis}
                onClose={() => setIsCrisis(false)}
                resources={crisisResources.length > 0 ? crisisResources : undefined}
            />

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full bg-white shadow-xl h-full md:h-[90vh] md:mt-[5vh] md:rounded-2xl overflow-hidden">

                {/* Header */}
                <div className="p-4 border-b bg-white flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Unspoken</h1>
                        <p className="text-xs text-gray-400">AI CBT Companion • Beta</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <div className={clsx("w-2 h-2 rounded-full", stressScore > 0.7 ? "bg-red-500 animate-pulse" : "bg-green-500")} />
                        <span>Live Bio-Link</span>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
                    {messages.length === 0 && (
                        <div className="text-center text-gray-400 mt-20">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <HeartPulse className="w-8 h-8 text-gray-300" />
                            </div>
                            <p>Hello. I'm listening. How are you feeling right now?</p>
                        </div>
                    )}

                    {messages.map((m) => (
                        <div
                            key={m.id}
                            className={clsx(
                                "flex flex-col max-w-[80%]",
                                m.role === 'user' ? "self-end items-end" : "self-start items-start"
                            )}
                        >
                            <div
                                className={clsx(
                                    "p-4 rounded-2xl shadow-sm text-sm md:text-base",
                                    m.role === 'user'
                                        ? "bg-blue-600 text-white rounded-br-sm"
                                        : "bg-gray-100 text-gray-800 rounded-bl-sm"
                                )}
                            >
                                {m.content}
                            </div>
                            {/* Message Meta / Actions */}
                            {m.role === 'assistant' && (
                                <button
                                    onClick={() => speak(m.content)}
                                    className="mt-1 ml-2 text-gray-400 hover:text-blue-600 transition-colors"
                                    title="Read Aloud"
                                >
                                    {isTTSPlaying ? <Volume2 className="w-4 h-4 animate-pulse text-blue-500" /> : <Volume2 className="w-4 h-4" />}
                                </button>
                            )}
                        </div>
                    ))}

                    {isLoading && (
                        <div className="self-start bg-gray-50 p-4 rounded-2xl rounded-bl-sm flex items-center gap-2">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 border-t bg-gray-50">
                    <form onSubmit={onFormSubmit} className="flex gap-2 relative">
                        <input
                            className="flex-1 p-4 pr-12 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                            value={input}
                            onChange={handleInputChange}
                            placeholder="Type or speak..."
                            autoFocus
                        />

                        <button
                            type="button"
                            className="absolute right-16 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-2"
                            onClick={() => alert("Microphone access would go here in Feature B")}
                        >
                            <Mic className="w-5 h-5" />
                        </button>

                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center min-w-[3.5rem]"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </form>
                    <div className="text-center mt-2">
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest">Unspoken is not a doctor. Call 911 for emergencies.</p>
                    </div>
                </div>
            </div>

            {/* Biometric sidebar simulation (Hidden on mobile for now) */}
            <div className="hidden lg:flex flex-col w-64 p-6 bg-white border-l h-full">
                <h3 className="font-bold text-gray-500 mb-6 uppercase text-xs tracking-wider">Biometric Simulation</h3>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="flex items-center gap-2"><Activity className="w-4 h-4" /> Stress</span>
                            <span className="font-mono text-xs">{stressScore.toFixed(2)}</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={stressScore}
                            onChange={(e) => setStressScore(parseFloat(e.target.value))}
                            className="w-full accent-blue-600"
                        />
                        <div className="flex justify-between text-[10px] text-gray-400">
                            <span>Calm</span>
                            <span>Panic</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="flex items-center gap-2"><Volume2 className="w-4 h-4" /> Voice Pitch</span>
                            <span className="font-mono text-xs">{pitch}Hz</span>
                        </div>
                        <input
                            type="range"
                            min="80"
                            max="300"
                            value={pitch}
                            onChange={(e) => setPitch(parseInt(e.target.value))}
                            className="w-full accent-blue-600"
                        />
                    </div>

                    <div className="p-4 bg-blue-50 rounded-xl space-y-2">
                        <h4 className="text-xs font-bold text-blue-800 uppercase">System Logic</h4>
                        <p className="text-xs text-blue-600 leading-relaxed">
                            If <strong>Stress &gt; 0.7</strong>, the AI will switch to "Grounding Mode" and use short, calming sentences.
                            <br /><br />
                            Try typing <em>"I want to end it all"</em> to test the <strong>Hard Guardrail</strong>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

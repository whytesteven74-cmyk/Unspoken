'use client';

import React from 'react';
import { Volume2, VolumeX, Mic } from 'lucide-react';
import clsx from 'clsx';

const VOICES = [
    { id: 'auto', name: 'Auto (Emotion)' },
    { id: 'alloy', name: 'Alloy (Bright)' },
    { id: 'echo', name: 'Echo (Neutral)' },
    { id: 'fable', name: 'Fable (British)' },
    { id: 'onyx', name: 'Onyx (Deep)' },
    { id: 'nova', name: 'Nova (Energetic)' },
    { id: 'shimmer', name: 'Shimmer (Calm)' },
    // Kokoro Voices
    { id: 'af_bella', name: 'Bella (American F)' },
    { id: 'af_sarah', name: 'Sarah (American F)' },
    { id: 'am_adam', name: 'Adam (American M)' },
    { id: 'am_michael', name: 'Michael (American M)' },
    { id: 'bf_emma', name: 'Emma (British F)' },
    { id: 'bf_isabella', name: 'Isabella (British F)' },
    { id: 'bm_george', name: 'George (British M)' },
    { id: 'bm_lewis', name: 'Lewis (British M)' },
];

interface VoiceControlsProps {
    selectedVoice: string;
    onVoiceChange: (voice: string) => void;
    isTTSEnabled: boolean;
    onTTSToggle: () => void;
}

export function VoiceControls({
    selectedVoice,
    onVoiceChange,
    isTTSEnabled,
    onTTSToggle
}: VoiceControlsProps) {
    return (
        <div className="flex items-center gap-2 bg-[var(--glass-bg)] backdrop-blur-md rounded-lg p-1.5 border border-[var(--glass-border)]">
            {/* Toggle TTS */}
            <button
                onClick={onTTSToggle}
                className={clsx(
                    "p-2 rounded-md transition-colors",
                    isTTSEnabled ? "text-teal-600 dark:text-teal-400 hover:bg-[var(--glass-bg)]" : "text-muted-foreground hover:text-foreground"
                )}
                title={isTTSEnabled ? "Mute Voice" : "Enable Voice"}
            >
                {isTTSEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Voice Dropdown */}
            <div className="relative group">
                <select
                    value={selectedVoice}
                    onChange={(e) => onVoiceChange(e.target.value)}
                    className="appearance-none bg-transparent text-xs text-foreground font-medium pl-2 pr-6 py-1 focus:outline-none cursor-pointer hover:text-foreground/80 transition-colors"
                >
                    {VOICES.map(v => (
                        <option key={v.id} value={v.id} className="bg-background text-foreground">
                            {v.name}
                        </option>
                    ))}
                </select>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                    <Mic className="w-3 h-3" />
                </div>
            </div>
        </div>
    );
}

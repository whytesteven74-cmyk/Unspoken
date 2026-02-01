'use client';

import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Share2, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InsightCardProps {
    insight: string;
    topic?: string;
    valence: number; // -1 to 1
    date?: string;
    userName?: string; // Optional (anonymized usually)
    onShare?: () => void;
    onDownload?: () => void;
}

export const InsightCard: React.FC<InsightCardProps> = ({
    insight,
    topic = "Breakthrough",
    valence,
    date = new Date().toLocaleDateString(),
    userName = "Unspoken User",
    onShare,
    onDownload
}) => {
    const cardRef = useRef<HTMLDivElement>(null);

    // Dynamic gradient based on valence (Sad -> Blue/Grey, Happy -> Teal/Gold)
    const getGradient = () => {
        if (valence < -0.3) return "from-slate-900 to-slate-800 border-slate-700"; // Melancholy
        if (valence > 0.3) return "from-teal-900/80 to-emerald-900/80 border-teal-500/50"; // Positive
        return "from-neutral-900 to-neutral-800 border-neutral-700"; // Neutral
    };

    const getAccentColor = () => {
        if (valence < -0.3) return "text-slate-400";
        if (valence > 0.3) return "text-teal-400";
        return "text-neutral-400";
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "outback" }}
            className="w-full max-w-sm mx-auto"
        >
            <div
                ref={cardRef}
                className={cn(
                    "relative overflow-hidden rounded-2xl border p-8 shadow-2xl backdrop-blur-xl bg-gradient-to-br",
                    getGradient()
                )}
            >
                {/* Background Noise/Texture */}
                <div className="absolute inset-0 opacity-10 bg-[url('/noise.png')] mix-blend-overlay"></div>

                {/* Glowing orb decorative element */}
                <div className={cn(
                    "absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-20",
                    valence > 0 ? "bg-teal-400" : "bg-blue-600"
                )} />

                {/* Header */}
                <div className="relative z-10 flex justify-between items-center mb-8 opacity-80">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-white/50 animate-pulse" />
                        <span className="text-xs font-mono tracking-[0.2em] uppercase text-white/70">
                            UNSPOKEN CLARITY
                        </span>
                    </div>
                    <span className="text-xs font-mono text-white/50">{date}</span>
                </div>

                {/* Content */}
                <div className="relative z-10 space-y-6">
                    <div className="space-y-2">
                        <h3 className={cn("text-xs font-bold uppercase tracking-wider", getAccentColor())}>
                            Subject: {topic}
                        </h3>
                        <p className="text-2xl md:text-3xl font-serif italic leading-tight text-white/95">
                            "{insight}"
                        </p>
                    </div>

                    <div className="h-px w-full bg-white/10" />

                    {/* Footer / Biometrics */}
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">
                                Biometric Verification
                            </p>
                            <div className="flex items-center gap-2">
                                <span className={cn("text-lg font-mono", getAccentColor())}>
                                    {Math.abs(Math.round(valence * 100))}%
                                </span>
                                <span className="text-xs text-white/50">
                                    {valence > 0 ? "Positive Resonance" : "Emotional Load"}
                                </span>
                            </div>
                        </div>

                        {/* Branding Logo Placeholder */}
                        <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-white">U</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions (Outside the card usually, but included here for component preview) */}
            {(onShare || onDownload) && (
                <div className="flex gap-3 mt-6 justify-center">
                    {onShare && (
                        <button
                            onClick={onShare}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 transition-all text-sm font-medium text-white backdrop-blur-md"
                        >
                            <Share2 size={16} />
                            <span>Share Insight</span>
                        </button>
                    )}
                    {onDownload && (
                        <button
                            onClick={onDownload}
                            className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 transition-all"
                        >
                            <Download size={16} />
                        </button>
                    )}
                </div>
            )}
        </motion.div>
    );
};

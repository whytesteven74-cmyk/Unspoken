'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { InsightCard } from './insight-card';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    insight: string;
    valence: number;
}

export const ShareModal: React.FC<ShareModalProps> = ({
    isOpen,
    onClose,
    insight,
    valence
}) => {
    if (!isOpen) return null;

    const handleShare = async () => {
        // Check if Web Share API is supported (Mobile Native Share)
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'My Unspoken Breakthrough',
                    text: `"${insight}" - Verified via Unspoken AI`,
                    url: 'https://unspoken.ai' // Replace with actual URL
                });
                console.log('Shared successfully');
            } catch (err) {
                console.log('Error sharing:', err);
            }
        } else {
            // Fallback: Copy to clipboard or open Telegram directly
            const text = encodeURIComponent(`"${insight}"\n\n- Discovered via @unspokenAI`);
            window.open(`https://t.me/share/url?url=https://unspoken.ai&text=${text}`, '_blank');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="relative w-full max-w-md"
                    >
                        <button
                            onClick={onClose}
                            className="absolute -top-12 right-0 p-2 text-white/50 hover:text-white transition-colors"
                        >
                            <X size={24} />
                        </button>

                        <div className="text-center mb-6">
                            <h2 className="text-xl font-semibold text-white mb-2">Share Your Breakthrough</h2>
                            <p className="text-sm text-white/60">
                                Your biometrics confirm this was a pivotal moment. <br />
                                Inspire others by sharing this insight.
                            </p>
                        </div>

                        <InsightCard
                            insight={insight}
                            valence={valence}
                            onShare={handleShare}
                            topic="Self-Discovery"
                        />

                        <div className="mt-8 text-center">
                            <p className="text-xs text-white/30 uppercase tracking-widest">
                                Anonymized & Secure
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

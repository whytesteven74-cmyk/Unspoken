"use client";

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Lock, Camera, Mic, ShieldCheck } from 'lucide-react';

interface PermissionGateProps {
    type: 'camera' | 'microphone';
    onGrant: () => void;
    title?: string;
    description?: string;
}

export function PermissionGate({ type, onGrant, title, description }: PermissionGateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-8 max-w-md mx-auto py-8"
        >
            <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 bg-teal-500/10 rounded-full animate-pulse" />
                <div className="absolute inset-0 border border-teal-500/30 rounded-full" />
                <div className="absolute inset-0 flex items-center justify-center">
                    {type === 'camera' ? (
                        <Camera className="w-10 h-10 text-teal-400" />
                    ) : (
                        <Mic className="w-10 h-10 text-teal-400" />
                    )}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-neutral-900 border border-neutral-700 p-1.5 rounded-full">
                    <Lock size={12} className="text-zinc-400" />
                </div>
            </div>

            <div className="space-y-3">
                <h3 className="text-xl font-serif text-white">
                    {title || `Enable ${type === 'camera' ? 'Camera' : 'Microphone'} Access`}
                </h3>
                <p className="text-white/50 text-sm leading-relaxed px-4">
                    {description || "Unspoken uses biometric data to calibrate your emotional baseline. This data is processed locally and encrypted."}
                </p>
            </div>

            <div className="space-y-4 pt-4">
                <Button
                    onClick={onGrant}
                    className="w-full bg-teal-600 hover:bg-teal-500 text-white rounded-full h-12 text-sm font-medium tracking-wide shadow-lg shadow-teal-900/20"
                >
                    Allow {type === 'camera' ? 'Camera' : 'Microphone'}
                </Button>

                <div className="flex items-center justify-center gap-2 text-[10px] text-white/30 uppercase tracking-widest">
                    <ShieldCheck size={10} />
                    <span>Private & Encrypted</span>
                </div>
            </div>
        </motion.div>
    );
}

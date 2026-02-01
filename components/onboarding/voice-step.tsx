"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic } from 'lucide-react';
import { motion } from 'framer-motion';

export function VoiceStep({ onComplete }: { onComplete: (val: number) => void }) {
    const [recording, setRecording] = useState(false);

    const toggleRecord = () => {
        if (!recording) {
            setRecording(true);
            // Verify for 3 seconds then stop
            setTimeout(() => {
                setRecording(false);
                onComplete(0.12); // Mock "Jitter" baseline
            }, 3000);
        }
    };

    return (
        <div className="text-center space-y-8 py-4">
            <h3 className="text-xl text-white">Vocal Baseline</h3>
            <p className="text-zinc-400">Read this aloud:</p>

            <blockquote className="text-2xl font-serif italic text-white/90">
                "I am ready to speak my truth today."
            </blockquote>

            <div className="flex justify-center pt-8">
                <Button
                    size="lg"
                    onMouseDown={toggleRecord}
                    // For touch/click
                    onClick={toggleRecord}
                    className={`rounded-full w-20 h-20 transition-all duration-300 ${recording ? 'bg-red-500 scale-110' : 'bg-zinc-800 hover:bg-zinc-700'}`}
                >
                    <Mic className={`w-8 h-8 ${recording ? 'text-white' : 'text-zinc-400'}`} />
                </Button>
            </div>

            {recording && (
                <div className="flex justify-center gap-1 h-8 items-end">
                    {[1, 2, 3, 4, 5].map(i => (
                        <motion.div
                            key={i}
                            className="w-2 bg-teal-500 rounded-full"
                            animate={{ height: [10, 32, 10] }}
                            transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                        />
                    ))}
                </div>
            )}

            <p className="text-xs text-zinc-500 uppercase tracking-widest">
                {recording ? 'Listening...' : 'Tap Mic to Read'}
            </p>
        </div>
    );
}

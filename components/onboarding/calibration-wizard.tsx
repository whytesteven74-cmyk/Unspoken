"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BRAND } from '@/lib/brand';
import { VoiceStep } from './voice-step';
import { VisualStep } from './visual-step';
import { BaselineCard } from './baseline-card';
import { Button } from '@/components/ui/button'; // Assuming we have this
import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Step = 'welcome' | 'voice' | 'visual' | 'analyzing' | 'complete';

export function CalibrationWizard() {
    const [step, setStep] = useState<Step>('welcome');
    const [biometrics, setBiometrics] = useState({ voiceJitter: 0, faceValence: 0 });
    const router = useRouter();

    const next = () => {
        if (step === 'welcome') setStep('voice');
        if (step === 'voice') setStep('visual');
        if (step === 'visual') {
            setStep('analyzing');
            setTimeout(() => setStep('complete'), 3000); // Fake compute time
        }
    };

    const finish = () => {
        router.push('/');
    };

    return (
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 min-h-[400px] flex flex-col justify-between overflow-hidden relative shadow-2xl">

            {/* Progress Bar */}
            <div className="absolute top-0 left-0 h-1 bg-teal-500/20 w-full">
                <motion.div
                    className="h-full bg-teal-500"
                    initial={{ width: '0%' }}
                    animate={{
                        width: step === 'welcome' ? '10%' :
                            step === 'voice' ? '40%' :
                                step === 'visual' ? '70%' : '100%'
                    }}
                />
            </div>

            <AnimatePresence mode='wait'>
                {step === 'welcome' && (
                    <motion.div key="welcome" {...fadeIn} className="space-y-6 text-center py-10">
                        <h2 className="text-2xl font-semibold text-white">Let's Calibrate Your Baseline</h2>
                        <p className="text-zinc-400">
                            To understand your true emotions, Unspoken needs to learn your unique voice patterns and facial expressions.
                        </p>
                        <p className="text-sm text-zinc-500">Takes about 60 seconds. Privacy verified.</p>
                        <div className="pt-4">
                            <Button onClick={next} className="bg-teal-600 hover:bg-teal-500 text-white px-8 py-6 text-lg rounded-full">
                                Begin Calibration <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </div>
                    </motion.div>
                )}

                {step === 'voice' && (
                    <motion.div key="voice" {...fadeIn} className="h-full">
                        <VoiceStep onComplete={(val) => {
                            setBiometrics(p => ({ ...p, voiceJitter: val }));
                            next();
                        }} />
                    </motion.div>
                )}

                {step === 'visual' && (
                    <motion.div key="visual" {...fadeIn} className="h-full">
                        <VisualStep onComplete={(val) => {
                            setBiometrics(p => ({ ...p, faceValence: val }));
                            next();
                        }} />
                    </motion.div>
                )}

                {step === 'analyzing' && (
                    <motion.div key="analyzing" {...fadeIn} className="flex flex-col items-center justify-center py-20">
                        <div className="w-16 h-16 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin mb-6" />
                        <h3 className="text-xl text-white font-mono animate-pulse">Building Biometric Model...</h3>
                    </motion.div>
                )}

                {step === 'complete' && (
                    <motion.div key="complete" {...fadeIn}>
                        <BaselineCard biometrics={biometrics} onContinue={finish} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

const fadeIn = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.4 }
};

"use client";
import { Button } from '@/components/ui/button';

export function BaselineCard({ biometrics, onContinue }: { biometrics: any, onContinue: () => void }) {
    return (
        <div className="space-y-8 text-center py-6">
            <h2 className="text-3xl font-bold text-white">Identity Established</h2>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-zinc-800/50 rounded-2xl border border-white/5">
                    <div className="text-zinc-400 text-sm mb-1">Resting Jitter</div>
                    <div className="text-2xl font-mono text-teal-400">1.2%</div>
                    <div className="text-xs text-zinc-600">Stable</div>
                </div>
                <div className="p-4 bg-zinc-800/50 rounded-2xl border border-white/5">
                    <div className="text-zinc-400 text-sm mb-1">Base Valence</div>
                    <div className="text-2xl font-mono text-teal-400">Neutral</div>
                    <div className="text-xs text-zinc-600">Balanced</div>
                </div>
            </div>

            <div className="bg-teal-500/10 p-6 rounded-2xl border border-teal-500/20 text-left">
                <h4 className="text-teal-400 font-semibold mb-2">Ready for Analysis</h4>
                <p className="text-zinc-300 text-sm">
                    Unspoken has calibrated to your baseline. We can now detect micro-deviations in your voice and expressions indicative of hidden stress.
                </p>
            </div>

            <Button onClick={onContinue} className="w-full bg-white text-zinc-900 hover:bg-zinc-200 py-6 text-lg rounded-xl font-semibold">
                Enter Unspoken
            </Button>
        </div>
    );
}

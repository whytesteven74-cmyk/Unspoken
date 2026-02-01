'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Logo } from '@/components/ui/logo';
import { ShieldCheck, Brain, Activity, Trash2, LogOut, ArrowLeft, Lock } from 'lucide-react';
import Link from 'next/link';

// Mock Data for "The Vault" (Memory Store)
const MOCK_MEMORY = [
    { id: '1', category: 'CORE_BELIEF', content: 'Feels worth is tied to productivity.', date: '2024-02-01' },
    { id: '2', category: 'FAMILY', content: 'Has not told wife about work stress.', date: '2024-01-28' },
    { id: '3', category: 'WORK', content: 'Boss yells frequently; causes somatic chest tightness.', date: '2024-01-25' },
    { id: '4', category: 'STRUGGLE', content: 'Uses "intellectualizing" as a defense mechanism.', date: '2024-01-20' },
];

export default function AccountPage() {
    const [facts, setFacts] = useState(MOCK_MEMORY);

    const handleDelete = (id: string) => {
        // In real app: call API to delete fact
        setFacts(facts.filter(f => f.id !== id));
    };

    return (
        <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-teal-500/30">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-neutral-950/80 backdrop-blur-md border-b border-white/5">
                <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/chat" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors">
                        <ArrowLeft size={18} />
                        <span className="text-sm">Back to Session</span>
                    </Link>
                    <Logo size="sm" />
                </div>
            </nav>

            <main className="pt-28 pb-20 px-6 max-w-5xl mx-auto space-y-12">
                {/* Profile Header */}
                <section className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-900 to-emerald-900 border border-teal-500/30 flex items-center justify-center text-xl font-serif">
                            JS
                        </div>
                        <div>
                            <h1 className="text-2xl font-serif text-white">John Smith</h1>
                            <div className="flex items-center gap-2 text-xs text-white/50">
                                <ShieldCheck size={12} className="text-emerald-500" />
                                <span>Biometrics Calibrated</span>
                                <span>•</span>
                                <span>Member since Jan 2026</span>
                            </div>
                        </div>
                    </div>

                    <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-red-900/50 bg-red-950/10 text-red-400 text-sm hover:bg-red-950/30 transition-colors">
                        <LogOut size={14} />
                        Sign Out
                    </button>
                </section>

                {/* Stats Grid */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-4 text-teal-400">
                            <Activity size={20} />
                            <span className="text-xs font-bold uppercase tracking-widest">Resonance</span>
                        </div>
                        <div className="text-3xl font-mono text-white">0.62</div>
                        <p className="text-xs text-white/40 mt-2">Avg. Positive Valence (Last 7 Days)</p>
                    </div>

                    <div className="p-6 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-4 text-indigo-400">
                            <Brain size={20} />
                            <span className="text-xs font-bold uppercase tracking-widest">Memory</span>
                        </div>
                        <div className="text-3xl font-mono text-white">{facts.length}</div>
                        <p className="text-xs text-white/40 mt-2">Core Facts Stored in Vault</p>
                    </div>

                    <div className="p-6 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm relative overflow-hidden">
                        <div className="absolute -right-4 -bottom-4 opacity-10">
                            <ShieldCheck size={100} />
                        </div>
                        <div className="flex items-center gap-3 mb-4 text-emerald-400">
                            <Lock size={20} />
                            <span className="text-xs font-bold uppercase tracking-widest">Security</span>
                        </div>
                        <div className="text-lg font-medium text-white">Encrypted</div>
                        <p className="text-xs text-white/40 mt-2">Biometric Keys Active</p>
                    </div>
                </section>

                {/* The Vault (Memory) */}
                <section>
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-serif text-white">The Vault</h2>
                            <p className="text-sm text-white/50">Manage what Unspoken remembers about you.</p>
                        </div>
                        <div className="text-xs font-mono text-teal-500 bg-teal-950/30 px-3 py-1 rounded-full border border-teal-500/20">
                            SYSTEM: ACTIVE
                        </div>
                    </div>

                    <div className="space-y-4">
                        {facts.map((fact) => (
                            <motion.div
                                key={fact.id}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="group p-5 rounded-xl bg-neutral-900 border border-white/5 hover:border-teal-500/30 transition-colors flex items-start justify-between"
                            >
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-white/30 bg-white/5 px-2 py-0.5 rounded">
                                            {fact.category}
                                        </span>
                                        <span className="text-[10px] text-white/20 font-mono">
                                            {fact.date}
                                        </span>
                                    </div>
                                    <p className="text-white/80 font-medium leading-relaxed">
                                        "{fact.content}"
                                    </p>
                                </div>

                                <button
                                    onClick={() => handleDelete(fact.id)}
                                    className="text-white/20 hover:text-red-500 transition-colors p-2"
                                    title="Forget this fact"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </motion.div>
                        ))}

                        {facts.length === 0 && (
                            <div className="p-8 text-center border border-dashed border-white/10 rounded-xl text-white/30">
                                The Vault is empty. Start a session to build your memory profile.
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}

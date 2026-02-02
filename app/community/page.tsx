'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Logo } from '@/components/ui/logo'; // Assuming logo component exists
import { InsightCard } from '@/components/growth/insight-card';
import { ArrowLeft, Users } from 'lucide-react';
import Link from 'next/link';

// Mock Data for Community Feed
const COMMUNITY_INSIGHTS = [
    { id: '1', insight: "I realized my anxiety is actually just excitement without breath.", valence: 0.8, date: '2 m ago', topic: 'Reframing' },
    { id: '2', insight: "Silence isn't empty, it's full of answers I was avoiding.", valence: -0.2, date: '15 m ago', topic: 'Solitude' },
    { id: '3', insight: "Productivity is not a measure of my worth.", valence: 0.95, date: '1 h ago', topic: 'Core Belief' },
    { id: '4', insight: "I can say 'no' without saying 'sorry'.", valence: 0.6, date: '2 h ago', topic: 'Boundaries' },
];

export default function CommunityPage() {
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

            <main className="pt-28 pb-20 px-6 max-w-2xl mx-auto space-y-12">
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-teal-400">
                        <Users size={12} />
                        <span>LIVE FEED</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-serif text-white">
                        You Are Not Alone.
                    </h1>
                    <p className="text-white/50 max-w-md mx-auto">
                        Real breakthroughs from real people, anonymized by Unspoken.
                    </p>
                </div>

                {/* Feed */}
                <div className="space-y-8">
                    {COMMUNITY_INSIGHTS.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <InsightCard
                                insight={item.insight}
                                valence={item.valence}
                                date={item.date}
                                topic={item.topic}
                            />
                        </motion.div>
                    ))}
                </div>

                <div className="text-center pt-12">
                    <p className="text-xs text-white/30 uppercase tracking-widest">
                        End of Feed
                    </p>
                </div>
            </main>
        </div>
    );
}

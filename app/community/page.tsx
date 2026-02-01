'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { InsightCard } from '@/components/growth/insight-card';
import { Logo } from '@/components/ui/logo';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

// Mock Data for Social Proof (Simulating active users)
const MOCK_COMMUNITY_INSIGHTS = [
    {
        id: 1,
        insight: "I realized my anger is just a bodyguard for my grief.",
        valence: -0.4,
        date: "2 mins ago"
    },
    {
        id: 2,
        insight: "The silence isn't empty; it's full of answers I was afraid to hear.",
        valence: 0.1,
        date: "5 mins ago"
    },
    {
        id: 3,
        insight: "Productivity is not a measure of my worthiness to exist.",
        valence: 0.5,
        date: "12 mins ago"
    },
    {
        id: 4,
        insight: "It's okay to put down the weight I've been carrying for everyone else.",
        valence: 0.8,
        date: "1 hour ago"
    },
    {
        id: 5,
        insight: "I am learning to be gentle with the parts of me that are still learning.",
        valence: 0.3,
        date: "2 hours ago"
    }
];

export default function CommunityPage() {
    return (
        <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-teal-500/30">
            {/* Header */}
            <header className="fixed top-0 inset-x-0 z-50 bg-neutral-950/80 backdrop-blur-md border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/chat" className="text-white/50 hover:text-white transition-colors">
                            <ArrowLeft size={20} />
                        </Link>
                        <div className="flex items-center gap-2">
                            <Logo size="sm" />
                            <span className="text-sm font-mono tracking-widest text-teal-500 uppercase">
                                Community Pulse
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-2 text-[10px] font-mono text-white/30 uppercase">
                        <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                            142 Online
                        </span>
                        <span>•</span>
                        <span>Global Feed</span>
                    </div>
                </div>
            </header>

            {/* Main Grid */}
            <main className="pt-24 pb-20 px-4 max-w-7xl mx-auto">
                <div className="text-center mb-16 space-y-4">
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl md:text-5xl font-serif text-white/90"
                    >
                        You are not alone.
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-white/50 max-w-lg mx-auto leading-relaxed"
                    >
                        Witness the anonymized breakthroughs of others on the same journey.
                        Every card represents a moment of clarity verified by biometrics.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {MOCK_COMMUNITY_INSIGHTS.map((item, i) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <InsightCard
                                insight={item.insight}
                                valence={item.valence}
                                date={item.date}
                                topic="Community Insight"
                            />
                        </motion.div>
                    ))}
                </div>
            </main>
        </div>
    );
}

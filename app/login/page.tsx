'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, ArrowRight, Loader2, ShieldCheck, Activity } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { clsx } from 'clsx'
import Link from 'next/link'
import { Logo } from '@/components/ui/logo'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isSent, setIsSent] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        const supabase = createClient()
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        })

        if (error) {
            setError(error.message)
            setIsLoading(false)
        } else {
            setIsSent(true)
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-teal-500/30">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-900/20 via-neutral-950 to-neutral-950" />
            <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-[120px]" />

            <nav className="absolute top-0 w-full p-6 flex justify-between items-center z-50">
                <Logo size="sm" />
                <Link href="/" className="text-xs text-white/50 hover:text-white transition-colors uppercase tracking-widest">
                    Back to Home
                </Link>
            </nav>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="bg-neutral-900/50 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl p-8 md:p-10">
                    <div className="text-center mb-10 space-y-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[10px] font-mono tracking-wider mb-2">
                            <Activity size={12} />
                            SECURE ACCESS
                        </div>
                        <h1 className="text-3xl font-serif text-white">Identify Yourself.</h1>
                        <p className="text-white/40 text-sm">Enter the email associated with your biometric profile.</p>
                    </div>

                    {isSent ? (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-teal-950/30 border border-teal-500/20 rounded-2xl p-6 text-center space-y-4"
                        >
                            <div className="w-12 h-12 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto ring-1 ring-teal-500/40">
                                <ShieldCheck className="w-6 h-6 text-teal-400" />
                            </div>
                            <div>
                                <h3 className="text-white font-medium mb-1">Link Dispatched</h3>
                                <p className="text-white/50 text-xs leading-relaxed">
                                    Secure entry link sent to <span className="text-teal-400">{email}</span>. Click it to initialize session.
                                </p>
                            </div>
                            <button
                                onClick={() => setIsSent(false)}
                                className="text-xs text-white/30 hover:text-white transition-colors"
                            >
                                Use different identifier
                            </button>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-white/30 ml-1">Email Coordinates</label>
                                <div className="relative group/input">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/input:text-teal-400 transition-colors">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        placeholder="user@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-black/40 border border-white/5 focus:border-teal-500/50 focus:bg-black/60 focus:ring-1 focus:ring-teal-500/50 rounded-xl py-4 pl-12 pr-4 text-white outline-none transition-all placeholder:text-white/20 font-mono text-sm"
                                    />
                                </div>
                            </div>

                            {error && (
                                <p className="text-red-400 text-xs font-mono bg-red-950/20 border border-red-500/20 p-3 rounded-lg text-center">{error}</p>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className={clsx(
                                    "w-full bg-white text-black hover:bg-teal-400 hover:text-black rounded-full py-4 px-6 flex items-center justify-center gap-2 font-medium transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
                                    isLoading && "cursor-wait"
                                )}
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Initiate Link
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>

                <p className="mt-8 text-center text-white/20 text-[10px] uppercase tracking-widest">
                    Encrypted End-to-End • SOC2 Compliant
                </p>
            </motion.div>
        </div>
    )
}

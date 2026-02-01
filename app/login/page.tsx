'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, ArrowRight, Loader2, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { clsx } from 'clsx'
import Link from 'next/link'

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
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 relative overflow-hidden font-outfit">
            {/* Decorative background elements */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-100/30 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100/30 rounded-full blur-[120px]" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-2xl rounded-[32px] p-8 md:p-10 relative overflow-hidden group">
                    <div className="flex justify-center mb-8">
                        <div className="w-16 h-16 bg-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-600/20 rotate-3 group-hover:rotate-6 transition-transform">
                            <span className="text-white text-3xl font-bold tracking-tighter">U</span>
                        </div>
                    </div>

                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Welcome Back</h1>
                        <p className="text-slate-500 text-base">Enter your email to receive a secure login link.</p>
                    </div>

                    {isSent ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-6 text-center"
                        >
                            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ShieldCheck className="w-6 h-6 text-emerald-600" />
                            </div>
                            <h3 className="text-emerald-900 font-semibold mb-1">Check your inbox</h3>
                            <p className="text-emerald-700/80 text-sm">
                                We've sent a magic link to <span className="font-semibold">{email}</span>.
                                Click it to sign in securely.
                            </p>
                            <button
                                onClick={() => setIsSent(false)}
                                className="mt-6 text-emerald-600 text-sm font-medium hover:underline"
                            >
                                Use a different email
                            </button>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 ml-1">Email Address</label>
                                <div className="relative group/input">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-teal-600 transition-colors">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-slate-100/50 border-transparent focus:border-teal-500/30 focus:bg-white focus:ring-4 focus:ring-teal-500/5 rounded-2xl py-4 pl-12 pr-4 text-slate-900 outline-none transition-all placeholder:text-slate-400"
                                    />
                                </div>
                            </div>

                            {error && (
                                <p className="text-red-500 text-sm font-medium animate-shake text-center">{error}</p>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className={clsx(
                                    "w-full bg-slate-900 hover:bg-black text-white rounded-2xl py-4 px-6 flex items-center justify-center gap-2 font-semibold shadow-xl shadow-slate-900/10 transition-all hover:translate-y-[-2px] active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed",
                                    isLoading && "cursor-wait"
                                )}
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Send Magic Link
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    <div className="mt-10 pt-8 border-t border-slate-100 text-center">
                        <Link href="/" className="text-slate-400 hover:text-slate-600 text-sm font-medium transition-colors">
                            ← Back to Home
                        </Link>
                    </div>
                </div>

                <p className="mt-8 text-center text-slate-400 text-sm">
                    By signing in, you agree to our <span className="underline cursor-pointer">Terms of Service</span>.
                </p>
            </motion.div>
        </div>
    )
}

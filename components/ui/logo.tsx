import React from 'react';
import clsx from 'clsx';
import { Sparkles } from 'lucide-react';

interface LogoProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Logo({ className, size = 'md' }: LogoProps) {
    const sizeClasses = {
        sm: 'h-6 w-6',
        md: 'h-8 w-8',
        lg: 'h-12 w-12',
        xl: 'h-16 w-16'
    };

    const textSizeClasses = {
        sm: 'text-sm',
        md: 'text-lg',
        lg: 'text-2xl',
        xl: 'text-3xl'
    };

    return (
        <div className={clsx("flex items-center gap-2", className)}>
            <div className={clsx("relative flex items-center justify-center", sizeClasses[size])}>
                {/* Background Glow */}
                <div className="absolute inset-0 bg-teal-500/20 blur-xl rounded-full" />

                {/* Icon Container */}
                <div className="relative bg-gradient-to-br from-teal-500 to-indigo-600 rounded-xl p-1.5 shadow-lg shadow-teal-500/20 flex items-center justify-center w-full h-full text-white">
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-[80%] h-[80%]"
                    >
                        <path d="M12 2a10 10 0 0 1 10 10 10 10 0 0 1-10 10" />
                        <path d="M12 12a10 10 0 0 1-10-10" />
                        <path d="M12 12v10" />
                        <path d="M12 2v10" />
                    </svg>
                </div>
            </div>

            <div className="flex flex-col">
                <span className={clsx("font-bold text-slate-800 dark:text-slate-100 tracking-tight leading-none", textSizeClasses[size])}>
                    Unspoken
                </span>
                {size !== 'sm' && (
                    <span className="text-[10px] text-teal-600 dark:text-teal-400 font-medium uppercase tracking-[0.2em] leading-none mt-1">
                        Biometric CBT
                    </span>
                )}
            </div>
        </div>
    );
}

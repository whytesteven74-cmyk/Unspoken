import { cn } from "@/lib/utils";
import React from "react";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    /**
     * Optional intensity of the blur/glass effect. Defaults to 'medium'.
     */
    variant?: 'light' | 'medium' | 'heavy';
}

export function GlassCard({ children, className, variant = 'medium', ...props }: GlassCardProps) {
    // Determine base translucency based on variant
    const bgOpacity = variant === 'light' ? 'bg-white/5' : variant === 'heavy' ? 'bg-white/10' : 'bg-white/5';
    // 'medium' is standard. Heavy might be darker. 
    // Actually let's use the CSS variable --glass-bg which is fixed, but we can override with utility classes if needed.
    // For now, consistent use of var(--glass-bg) is handled by the utility class `bg-[var(--glass-bg)]` if we configured it, 
    // OR we just use arbitrary values here for the "glass" look.
    // Let's use standard utilities for better maintainability.

    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-2xl border",
                "border-[rgba(255,255,255,0.1)]", // Explicit glass border
                "bg-[rgba(255,255,255,0.05)]",    // Explicit glass bg
                "backdrop-blur-xl",               // Heavy blur
                "shadow-[0_4px_30px_rgba(0,0,0,0.1)]", // Glass shadow
                "text-slate-100", // Default text color for dark mode glass
                className
            )}
            {...props}
        >
            {/* Optional Noise Texture Overlay if we wanted it later */}
            <div className="absolute inset-0 z-[-1] pointer-events-none opacity-20" style={{ mixBlendMode: 'overlay' }} />

            {children}
        </div>
    );
}

export function GlassButton({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            className={cn(
                "group relative flex items-center justify-center rounded-xl p-3 transition-all duration-300",
                "border border-[rgba(255,255,255,0.1)]",
                "bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)]",
                "active:scale-95",
                "backdrop-blur-md",
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}

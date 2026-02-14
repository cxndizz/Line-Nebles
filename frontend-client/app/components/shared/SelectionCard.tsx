'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '../../components/ui/Button';

interface SelectionCardProps {
    selected: boolean;
    onClick: () => void;
    icon: React.ReactNode | string;
    title: string;
    className?: string;
    layoutId?: string;
}

export function SelectionCard({ selected, onClick, icon, title, className, layoutId }: SelectionCardProps) {
    return (
        <button
            onClick={onClick}
            type="button"
            className={cn(
                "group relative flex flex-row items-center p-4 md:p-5 transition-all duration-300 text-left w-full rounded-xl overflow-hidden",
                selected
                    ? "bg-gradient-to-br from-[var(--accent)]/10 to-[var(--accent)]/5 border border-[var(--accent)]/50 shadow-[0_0_20px_rgba(212,175,55,0.15)]"
                    : "bg-white border border-slate-100 hover:border-[var(--accent)]/30 hover:shadow-lg hover:shadow-slate-200/50",
                className
            )}
        >
            {/* Active Indication Background/Glow */}
            {selected && (
                <motion.div
                    layoutId={layoutId || "selected-glow"}
                    className="absolute inset-0 bg-[var(--accent)]/5 z-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                />
            )}

            <div className="relative z-10 flex items-center w-full">
                <div className={cn(
                    "text-2xl md:text-4xl mr-4 md:mr-6 transition-transform duration-500",
                    selected ? "scale-110 rotate-3" : "grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105"
                )}>
                    {icon}
                </div>

                <div className="flex-1 pr-2">
                    <div className={cn(
                        "text-sm md:text-base font-medium leading-snug transition-colors duration-300 font-serif tracking-wide",
                        selected ? "text-[var(--primary)]" : "text-slate-600 group-hover:text-slate-900"
                    )}>
                        {title}
                    </div>
                </div>

                {/* Premium Checkbox */}
                <div className={cn(
                    "w-6 h-6 md:w-7 md:h-7 flex-shrink-0 rounded-full border flex items-center justify-center transition-all duration-300 shadow-sm",
                    selected
                        ? "bg-[var(--accent)] border-[var(--accent)] scale-100"
                        : "bg-slate-50 border-slate-200 group-hover:border-[var(--accent)]/50 scale-90 opacity-50 group-hover:opacity-100"
                )}>
                    <motion.div
                        initial={false}
                        animate={{ scale: selected ? 1 : 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" strokeWidth={3} />
                    </motion.div>
                </div>
            </div>
        </button>
    );
}

"use client";

import { motion } from "framer-motion";
import { cn } from "../ui/Button";

interface ContractSelectorProps {
    selectedDuration: number | null;
    onSelect: (months: number) => void;
}

const DURATIONS = [1, 3, 6, 12];

export function ContractSelector({ selectedDuration, onSelect }: ContractSelectorProps) {
    return (
        <div className="flex flex-wrap justify-center gap-4">
            {DURATIONS.map((months, index) => {
                const isSelected = selectedDuration === months;

                return (
                    <motion.button
                        key={months}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => onSelect(months)}
                        className={cn(
                            "relative px-8 py-6 rounded-2xl text-lg font-serif font-bold transition-all duration-300 min-w-[140px]",
                            isSelected
                                ? "bg-gold-gradient text-navy-900 shadow-xl shadow-gold/10 scale-105"
                                : "bg-transparent text-slate-400 border border-slate-700 hover:border-amber-400/50 hover:text-white hover:bg-slate-800 hover:shadow-lg"
                        )}
                    >
                        {months} <span className="text-sm font-sans font-normal opacity-80">Month{months > 1 ? 's' : ''}</span>

                        {isSelected && (
                            <motion.div
                                layoutId="contract-highlight"
                                className="absolute inset-0 border-2 border-amber-400 rounded-2xl"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                    </motion.button>
                );
            })}
        </div>
    );
}

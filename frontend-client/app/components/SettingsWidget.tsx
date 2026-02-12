"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Check, ChevronDown, Coins } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { Language, Currency } from "../lib/i18n/translations";
import { usePathname, useRouter, useParams } from "next/navigation";

export default function SettingsWidget() {
    const { language, setLanguage, currency, setCurrency } = useLanguage();
    const router = useRouter();
    const pathname = usePathname();
    const params = useParams();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLanguageChange = (newLang: Language) => {
        // Optimistic update
        setLanguage(newLang);

        // Update currency based on new language
        switch (newLang) {
            case 'th':
                setCurrency('THB');
                break;
            case 'en':
                setCurrency('USD');
                break;
            case 'cn':
                setCurrency('CNY');
                break;
            default:
                setCurrency('THB');
        }

        // redirect to new path
        // pathname is like /en/renter or /en
        // regex replace the first path segment
        const segments = pathname.split('/');
        // segments[0] is empty, segments[1] is lang
        if (segments.length > 1) {
            segments[1] = newLang;
            const newPath = segments.join('/');
            router.push(newPath);
        }
    };

    const languages: { code: Language; label: string; flag: string }[] = [
        { code: "th", label: "ไทย", flag: "🇹🇭" },
        { code: "en", label: "English", flag: "🇬🇧" },
        { code: "cn", label: "中文", flag: "🇨🇳" },
    ];

    const currencies: { code: Currency; symbol: string }[] = [
        { code: "THB", symbol: "฿" },
        { code: "USD", symbol: "$" },
        { code: "CNY", symbol: "¥" },
    ];

    const isWizard = pathname?.includes('/renter');

    return (
        <div className={`fixed right-6 z-[100] transition-all duration-300 ${isWizard ? 'top-6' : 'bottom-6'}`} ref={containerRef}>
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 bg-white/80 backdrop-blur-md border border-slate-200 shadow-lg px-4 py-2.5 rounded-full text-slate-700 hover:bg-white hover:text-[var(--primary)] transition-all duration-300"
            >
                <Globe size={18} />
                <span className="text-sm font-medium uppercase tracking-wide">
                    {language} • {currency}
                </span>
                <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-full mt-3 w-64 bg-white/90 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-2xl p-4 overflow-hidden"
                    >
                        {/* Language Section */}
                        <div className="mb-4">
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-3 pl-2">
                                Language
                            </div>
                            <div className="space-y-1">
                                {languages.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => {
                                            handleLanguageChange(lang.code);
                                        }}
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${language === lang.code
                                            ? "bg-[var(--primary)]/10 text-[var(--primary)] font-medium"
                                            : "text-slate-600 hover:bg-slate-50"
                                            }`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <span className="text-lg">{lang.flag}</span>
                                            <span>{lang.label}</span>
                                        </div>
                                        {language === lang.code && <Check size={14} />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="h-px bg-slate-100 my-3" />

                        {/* Currency Section */}
                        <div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-3 pl-2 flex items-center space-x-2">
                                <Coins size={12} /> <span>Currency</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {currencies.map((curr) => (
                                    <button
                                        key={curr.code}
                                        onClick={() => {
                                            setCurrency(curr.code);
                                        }}
                                        className={`flex flex-col items-center justify-center py-2 rounded-lg border transition-all ${currency === curr.code
                                            ? "border-[var(--primary)] bg-[var(--primary)]/5 text-[var(--primary)]"
                                            : "border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200 hover:bg-slate-100"
                                            }`}
                                    >
                                        <span className="text-sm font-serif mb-0.5">{curr.symbol}</span>
                                        <span className="text-[10px] font-bold tracking-wider">{curr.code}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

"use client";

import Link from 'next/link';
import { Home, Building, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

export default function LandingPage() {
  const { t, language } = useLanguage();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-[var(--background)]">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--accent)]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--primary)]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="text-center mb-16 space-y-6 z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-white border border-slate-200 text-slate-500 text-xs font-semibold tracking-wider uppercase mb-5 shadow-sm">
            {t("landing.badge")}
          </span>
          <h1 className="text-6xl md:text-8xl font-serif font-bold text-[var(--foreground)] tracking-tight">
            Nebles
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed"
        >
          {t("landing.subtitle")} <br />
          <span className="text-[var(--accent)] font-semibold">{t("landing.subtitleHighlight")}</span>
        </motion.p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 w-full max-w-5xl z-10 px-4">
        <Link href={`/${language}/renter`} className="group block h-full">
          <motion.div
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="h-full"
          >
            <Card className="h-full border border-slate-200 bg-white shadow-xl shadow-slate-200/50 hover:border-[var(--accent)]/50 hover:shadow-2xl hover:shadow-[var(--accent)]/10 transition-all duration-300">
              <CardHeader>
                <div className="w-16 h-16 bg-[var(--primary)]/5 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[var(--primary)] transition-all duration-300">
                  <Home className="w-8 h-8 text-[var(--primary)] group-hover:text-white transition-colors" />
                </div>
                <CardTitle className="text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">{t("landing.residentCard.title")}</CardTitle>
                <CardDescription className="text-slate-500 whitespace-pre-line">
                  {t("landing.residentCard.description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-[var(--accent)] font-medium mt-4 group-hover:translate-x-1 transition-transform uppercase tracking-widest text-xs">
                  {t("landing.residentCard.action")} <ArrowRight className="ml-2 w-4 h-4" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </Link>

        <Link href={`/${language}/owner`} className="group block h-full">
          <motion.div
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="h-full"
          >
            <Card className="h-full border border-slate-200 bg-white shadow-xl shadow-slate-200/50 hover:border-[var(--accent)]/50 hover:shadow-2xl hover:shadow-[var(--accent)]/10 transition-all duration-300">
              <CardHeader>
                <div className="w-16 h-16 bg-[var(--primary)]/5 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[var(--primary)] transition-all duration-300">
                  <Building className="w-8 h-8 text-[var(--primary)] group-hover:text-white transition-colors" />
                </div>
                <CardTitle className="text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">{t("landing.ownerCard.title")}</CardTitle>
                <CardDescription className="text-slate-500 whitespace-pre-line">
                  {t("landing.ownerCard.description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-[var(--accent)] font-medium mt-4 group-hover:translate-x-1 transition-transform uppercase tracking-widest text-xs">
                  {t("landing.ownerCard.action")} <ArrowRight className="ml-2 w-4 h-4" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </Link>
      </div>
    </div>
  );
}

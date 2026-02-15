"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Home, Building, ArrowRight, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

export default function LandingPage() {
  const { t, language } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 pt-24 relative overflow-hidden bg-slate-50 selection:bg-[var(--accent)]/30">

      {/* Premium Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100 via-slate-50 to-slate-100 opacity-80" />

      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-[var(--accent)]/5 rounded-full blur-[120px] pointer-events-none mix-blend-multiply" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-[var(--primary)]/5 rounded-full blur-[100px] pointer-events-none mix-blend-multiply" />

      {/* Decorative Grid */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-[0.02] pointer-events-none" />

      <div className="text-center mb-20 space-y-8 z-10 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mb-8 relative"
          >
            {/* Glowing effect behind logo */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[var(--accent)]/20 to-[var(--primary)]/20 blur-3xl opacity-50 rounded-full" />
            <Image
              src="/images/logo.png"
              alt="Nebles Logo"
              width={240}
              height={100}
              className="h-32 w-auto object-contain relative z-10 drop-shadow-sm"
              priority
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center space-x-3 mb-6"
          >
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-slate-300" />
            <span className="text-xs uppercase tracking-[0.3em] text-slate-400 font-medium">
              {t("landing.badge")}
            </span>
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-slate-300" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-4xl md:text-6xl font-serif text-slate-800 tracking-tight leading-tight"
          >
            {t("landing.subtitle")} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] via-[var(--accent)] to-[var(--primary)] font-medium italic relative py-0.5 leading-snug inline-block">
              {t("landing.subtitleHighlight")}
            </span>
          </motion.h1>
        </motion.div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 w-full max-w-5xl z-10 px-4">
        {/* Renter Card */}
        <Link
          href={`/${language}/renter`}
          className="group block h-full"
          onClick={() => {
            localStorage.removeItem('renter_form_data_v2');
            localStorage.removeItem('renter_form_step_v2');
          }}
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            whileHover={{ y: -8, scale: 1.01 }}
            className="h-full"
          >
            <Card className="h-full border-0 bg-white/60 backdrop-blur-xl shadow-lg ring-1 ring-slate-900/5 hover:ring-[var(--accent)]/30 hover:shadow-2xl hover:shadow-[var(--accent)]/10 transition-all duration-500 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <ArrowRight className="text-[var(--accent)] w-6 h-6 -rotate-45 group-hover:rotate-0 transition-transform duration-500" />
              </div>

              <CardHeader className="pt-10 pb-2">
                <div className="w-16 h-16 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-white group-hover:scale-110 group-hover:bg-none group-hover:bg-[var(--primary)] transition-all duration-500">
                  <Home className="w-7 h-7 text-slate-600 group-hover:text-white transition-colors duration-500" />
                </div>
                <CardTitle className="text-2xl font-serif text-slate-800 group-hover:text-[var(--primary)] transition-colors duration-300">
                  {t("landing.residentCard.title")}
                </CardTitle>
                <div className="h-px w-10 bg-[var(--accent)] mt-4 mb-2 origin-left group-hover:w-20 transition-all duration-500" />
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-500 text-base leading-relaxed whitespace-pre-line group-hover:text-slate-600 transition-colors">
                  {t("landing.residentCard.description")}
                </CardDescription>

                <div className="mt-8 flex items-center text-[var(--primary)] font-medium text-xs uppercase tracking-widest opacity-80 group-hover:opacity-100 transition-opacity">
                  <span className="border-b border-transparent group-hover:border-[var(--primary)] transition-all pb-0.5">
                    {t("landing.residentCard.action")}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </Link>

        {/* Owner Card */}
        <Link
          href={`/${language}/owner`}
          className="group block h-full"
          onClick={() => {
            localStorage.removeItem('owner_form_data_v2');
            localStorage.removeItem('owner_form_step_v2');
          }}
        >
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            whileHover={{ y: -8, scale: 1.01 }}
            className="h-full"
          >
            <Card className="h-full border-0 bg-gradient-to-b from-slate-900 to-slate-800 text-white shadow-2xl ring-1 ring-white/10 hover:ring-[var(--accent)]/50 hover:shadow-[var(--accent)]/20 transition-all duration-500 overflow-hidden relative">
              <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 pointer-events-none" />
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <ArrowRight className="text-white w-6 h-6 -rotate-45 group-hover:rotate-0 transition-transform duration-500" />
              </div>

              <CardHeader className="pt-10 pb-2 relative z-10">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm border border-white/5 group-hover:scale-110 group-hover:bg-white group-hover:text-slate-900 transition-all duration-500">
                  <Building className="w-7 h-7 text-slate-200 group-hover:text-slate-900 transition-colors duration-500" />
                </div>
                <CardTitle className="text-2xl font-serif text-white group-hover:text-[var(--accent)] transition-colors duration-300">
                  {t("landing.ownerCard.title")}
                </CardTitle>
                <div className="h-px w-10 bg-[var(--accent)] mt-4 mb-2 origin-left group-hover:w-20 transition-all duration-500" />
              </CardHeader>
              <CardContent className="relative z-10">
                <CardDescription className="text-slate-300 text-base leading-relaxed whitespace-pre-line group-hover:text-white transition-colors">
                  {t("landing.ownerCard.description")}
                </CardDescription>

                <div className="mt-8 flex items-center text-[var(--accent)] font-medium text-xs uppercase tracking-widest opacity-80 group-hover:opacity-100 transition-opacity">
                  <span className="border-b border-transparent group-hover:border-[var(--accent)] transition-all pb-0.5">
                    {t("landing.ownerCard.action")}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-1 text-slate-400 text-[10px] tracking-widest uppercase opacity-60 font-medium"
      >
        Nebles
      </motion.div>
    </div>
  );
}

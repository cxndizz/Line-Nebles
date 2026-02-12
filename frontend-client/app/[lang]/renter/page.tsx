'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ArrowRight, Check, ArrowLeft, ArrowDown, Sparkles } from 'lucide-react';
import liff from '@line/liff';
import { cn } from '../../components/ui/Button';
import { useLanguage } from '../../context/LanguageContext';
import { LuxuryCalendar } from '../../components/wizard/LuxuryCalendar';
import { useCurrency } from '../../hooks/useCurrency';

type Step = 'WELCOME' | 'LOCATION' | 'PETS' | 'BUDGET' | 'UNIT_TYPE' | 'CONTRACT' | 'MOVE_IN' | 'CONTACT' | 'SUCCESS';

export default function RenterPage() {
    const { t, currencySymbol, language } = useLanguage();
    const [step, setStep] = useState<Step>('WELCOME');
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        locationPreference: '',
        hasPet: 'false',
        petType: '',
        budgetMin: '',
        budgetMax: '',
        roomType: '',
        contractPeriod: '1_year',
        moveInDate: undefined as Date | undefined,
        fullName: '',
        phoneNumber: '',
        lineId: '',
        lineUserId: '',
        lineDisplayName: '',
    });

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const initLiff = async () => {
            try {
                const liffId = process.env.NEXT_PUBLIC_LIFF_ID || '';
                if (!liffId) return;

                await liff.init({ liffId });
                if (liff.isLoggedIn()) {
                    const profile = await liff.getProfile();
                    setFormData(prev => ({
                        ...prev,
                        lineUserId: profile.userId,
                        lineDisplayName: profile.displayName,
                        fullName: prev.fullName || profile.displayName,
                    }));
                }
            } catch (error) {
                console.error('LIFF Initialization failed', error);
            }
        };
        initLiff();
    }, []);

    useEffect(() => {
        if (step !== 'WELCOME' && step !== 'SUCCESS' && step !== 'MOVE_IN' && step !== 'UNIT_TYPE' && step !== 'CONTRACT') {
            const timeout = setTimeout(() => {
                inputRef.current?.focus();
            }, 600);
            return () => clearTimeout(timeout);
        }
    }, [step]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const steps: Step[] = ['WELCOME', 'LOCATION', 'PETS', 'BUDGET', 'UNIT_TYPE', 'CONTRACT', 'MOVE_IN', 'CONTACT', 'SUCCESS'];
    const currentStepIndex = steps.indexOf(step);
    const totalSteps = steps.length - 2;

    const handleNext = () => {
        if (currentStepIndex < steps.length - 1) {
            setStep(steps[currentStepIndex + 1]);
        }
    };

    const handleBack = () => {
        if (currentStepIndex > 0) {
            setStep(steps[currentStepIndex - 1]);
        }
    };

    const isStepValid = () => {
        switch (step) {
            case 'LOCATION':
                return !!formData.locationPreference;
            case 'PETS':
                return formData.hasPet === 'false' || (formData.hasPet === 'true' && !!formData.petType);
            case 'BUDGET':
                return !!formData.budgetMin || !!formData.budgetMax;
            case 'UNIT_TYPE':
                return !!formData.roomType;
            case 'CONTRACT':
                return !!formData.contractPeriod;
            case 'MOVE_IN':
                return !!formData.moveInDate;
            case 'CONTACT':
                return !!formData.fullName && !!formData.phoneNumber;
            default:
                return true;
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && step !== 'WELCOME' && step !== 'SUCCESS' && !e.shiftKey) {
            if (!isStepValid()) return;

            if (step === 'CONTACT') {
                handleSubmit();
            } else {
                handleNext();
            }
        }
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const gasUrl = process.env.NEXT_PUBLIC_GAS_URL || '';
            if (!gasUrl) {
                alert('ยังไม่ได้ตั้งค่า Google Apps Script URL');
                setIsLoading(false);
                return;
            }

            await fetch(gasUrl, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    hasPet: formData.hasPet === 'true',
                }),
            });

            setStep('SUCCESS');
        } catch (error) {
            console.error('Submission failed', error);
            alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่');
        } finally {
            setIsLoading(false);
        }
    };

    const variants = {
        enter: (direction: number) => ({
            y: direction > 0 ? 20 : -20,
            opacity: 0,
            filter: 'blur(4px)',
        }),
        center: {
            zIndex: 1,
            y: 0,
            opacity: 1,
            filter: 'blur(0px)',
        },
        exit: (direction: number) => ({
            zIndex: 0,
            y: direction < 0 ? 20 : -20,
            opacity: 0,
            filter: 'blur(4px)',
        }),
    };

    const [direction, setDirection] = useState(0);

    const navigate = (newDirection: number, action: () => void) => {
        setDirection(newDirection);
        action();
    };

    return (
        <div
            className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col overflow-hidden font-sans selection:bg-[var(--accent)]/20 touch-manipulation"
            onKeyDown={handleKeyDown}
        >
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 p-6 md:p-10 flex justify-between items-center z-50">
                <div className="flex items-center space-x-3 text-[var(--primary)] font-serif text-xl tracking-wide">
                    <div className="w-10 h-10 bg-[var(--primary)] rounded-lg flex items-center justify-center text-white shadow-lg">
                        <Sparkles size={20} strokeWidth={1.5} />
                    </div>
                    <span className="hidden md:inline font-bold">NEBLES</span>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col justify-center items-center relative max-w-4xl mx-auto w-full px-6 md:px-10 py-12 md:py-0 pb-24 md:pb-0">
                <AnimatePresence mode="wait" custom={direction}>

                    {/* STEP: WELCOME */}
                    {step === 'WELCOME' && (
                        <motion.div
                            key="welcome"
                            className="text-center space-y-8 md:space-y-10 max-w-2xl px-4"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, y: -20, filter: 'blur(4px)' }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                        >
                            <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full border border-slate-200 bg-white text-slate-500 text-xs font-semibold tracking-widest uppercase mb-4 shadow-sm">
                                {t("renter.welcome.badge")}
                            </div>
                            <h1 className="text-4xl md:text-7xl font-bold tracking-tight text-slate-900 leading-tight font-serif whitespace-pre-line">
                                {t("renter.welcome.title")}
                            </h1>
                            <p className="text-lg md:text-xl text-slate-500 leading-relaxed font-light max-w-xl mx-auto whitespace-pre-line">
                                {t("renter.welcome.description")}
                            </p>
                            <div className="pt-8">
                                <button
                                    onClick={() => navigate(1, handleNext)}
                                    className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white transition-all duration-300 bg-[var(--primary)] rounded-md hover:bg-[var(--primary)]/90 hover:shadow-lg focus:outline-none w-full md:w-auto"
                                >
                                    <span className="relative z-10 font-bold tracking-wider">{t("common.startSearch")}</span>
                                    <ArrowRight className="relative z-10 ml-3 w-4 h-4 transition-transform group-hover:translate-x-1" />
                                </button>
                                <p className="mt-6 text-[10px] text-slate-400 tracking-widest uppercase font-medium">{t("renter.welcome.concierge")}</p>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP: LOCATION */}
                    {step === 'LOCATION' && (
                        <QuestionSlide key="location" direction={direction} variants={variants}>
                            <NumberBadge number={1} />
                            <h2 className="text-3xl md:text-5xl font-medium text-slate-900 mb-6 font-serif">
                                {t("renter.location.title")}
                            </h2>
                            <p className="text-lg text-slate-500 mb-10 font-light max-w-xl">
                                {t("renter.location.description")}
                            </p>
                            <div className="relative group w-full max-w-2xl">
                                <input
                                    ref={inputRef}
                                    className="w-full bg-white border border-slate-200 rounded-lg text-2xl md:text-3xl p-6 text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] transition-all duration-300 font-light shadow-sm"
                                    placeholder={t("renter.location.placeholder")}
                                    name="locationPreference"
                                    value={formData.locationPreference}
                                    onChange={handleChange}
                                    autoComplete="off"
                                />
                            </div>
                        </QuestionSlide>
                    )}

                    {/* STEP: PETS */}
                    {step === 'PETS' && (
                        <QuestionSlide key="pets" direction={direction} variants={variants}>
                            <NumberBadge number={2} />
                            <h2 className="text-3xl md:text-5xl font-medium text-slate-900 mb-8 font-serif">
                                {t("renter.pets.title")}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl mt-2">
                                <SelectionCard
                                    selected={formData.hasPet === 'false'}
                                    onClick={() => {
                                        setFormData(p => ({ ...p, hasPet: 'false' }));
                                        navigate(1, handleNext); // Auto-advance
                                    }}
                                    icon="🚫"
                                    title={t("renter.pets.noPets")}
                                    accessKey="N"
                                />
                                <SelectionCard
                                    selected={formData.hasPet === 'true'}
                                    onClick={() => setFormData(p => ({ ...p, hasPet: 'true' }))}
                                    icon="🐾"
                                    title={t("renter.pets.petFriendly")}
                                    accessKey="Y"
                                />
                            </div>

                            <AnimatePresence>
                                {formData.hasPet === 'true' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="w-full max-w-2xl mt-6 overflow-hidden"
                                    >
                                        <input
                                            ref={inputRef}
                                            className="w-full bg-white border border-slate-200 rounded-lg text-xl p-5 text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] transition-colors font-light shadow-sm"
                                            placeholder={t("renter.pets.placeholder")}
                                            name="petType"
                                            value={formData.petType}
                                            onChange={handleChange}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </QuestionSlide>
                    )}

                    {/* STEP: BUDGET */}
                    {step === 'BUDGET' && (
                        <QuestionSlide key="budget" direction={direction} variants={variants}>
                            <NumberBadge number={3} />
                            <h2 className="text-3xl md:text-5xl font-medium text-slate-900 mb-8 font-serif">
                                {t("renter.budget.title")}
                            </h2>

                            <BudgetSelection
                                t={t}
                                formData={formData}
                                setFormData={setFormData}
                                navigate={navigate}
                                handleNext={handleNext}
                                language={language as 'th' | 'en' | 'cn'}
                            />
                        </QuestionSlide>
                    )}


                    {/* STEP: UNIT_TYPE */}
                    {step === 'UNIT_TYPE' && (
                        <QuestionSlide key="unit_type" direction={direction} variants={variants}>
                            <NumberBadge number={4} />
                            <h2 className="text-3xl md:text-5xl font-medium text-slate-900 mb-10 font-serif">
                                {t("renter.details.unitType")}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl">
                                {['Studio', '1 Bedroom', '2 Bedrooms', 'Penthouse/Other'].map((type) => (
                                    <SelectionCard
                                        key={type}
                                        selected={formData.roomType === type}
                                        onClick={() => {
                                            setFormData(p => ({ ...p, roomType: type }));
                                            navigate(1, handleNext);
                                        }}
                                        icon={type === 'Studio' ? '🛋️' : type === '1 Bedroom' ? '🛏️' : type === '2 Bedrooms' ? '🏡' : '✨'}
                                        title={type}
                                        accessKey=""
                                    />
                                ))}
                            </div>
                        </QuestionSlide>
                    )}

                    {/* STEP: CONTRACT */}
                    {step === 'CONTRACT' && (
                        <QuestionSlide key="contract" direction={direction} variants={variants}>
                            <NumberBadge number={5} />
                            <h2 className="text-3xl md:text-5xl font-medium text-slate-900 mb-10 font-serif">
                                {t("renter.details.contract")}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl">
                                {[
                                    { val: '1_month', label: '1 Month' },
                                    { val: '3_months', label: '3 Months' },
                                    { val: '6_months', label: '6 Months' },
                                    { val: '1_year', label: '1 Year+' }
                                ].map((opt) => (
                                    <SelectionCard
                                        key={opt.val}
                                        selected={formData.contractPeriod === opt.val}
                                        onClick={() => {
                                            setFormData(p => ({ ...p, contractPeriod: opt.val }));
                                            navigate(1, handleNext);
                                        }}
                                        icon="📅"
                                        title={opt.label}
                                        accessKey=""
                                    />
                                ))}
                            </div>
                        </QuestionSlide>
                    )}

                    {/* STEP: MOVE_IN */}
                    {step === 'MOVE_IN' && (
                        <QuestionSlide key="move_in" direction={direction} variants={variants}>
                            <NumberBadge number={6} />
                            <h2 className="text-3xl md:text-5xl font-medium text-slate-900 mb-10 font-serif">
                                {t("renter.details.moveIn")}
                            </h2>
                            <div className="w-full flex justify-center md:justify-start">
                                <LuxuryCalendar
                                    selected={formData.moveInDate}
                                    onSelect={(date) => {
                                        setFormData(p => ({ ...p, moveInDate: date }));
                                    }}
                                    className="scale-110 origin-top-left"
                                />
                            </div>
                        </QuestionSlide>
                    )}


                    {/* STEP: CONTACT */}
                    {step === 'CONTACT' && (
                        <QuestionSlide key="contact" direction={direction} variants={variants}>
                            <NumberBadge number={7} />
                            <h2 className="text-3xl md:text-5xl font-medium text-slate-900 mb-6 font-serif">
                                {t("renter.contact.title")}
                            </h2>
                            <p className="text-lg text-slate-500 mb-10 font-light tracking-wide">
                                {t("renter.contact.description")}
                            </p>
                            <div className="space-y-6 w-full max-w-2xl">
                                <div className="relative group">
                                    <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1 block">{t("renter.contact.name")}</label>
                                    <input
                                        ref={inputRef}
                                        className="w-full bg-white border border-slate-200 rounded-lg py-3 px-4 text-xl text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] transition-all font-light shadow-sm"
                                        placeholder={t("renter.contact.name")}
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        autoComplete="name"
                                    />
                                </div>
                                <div className="relative group">
                                    <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1 block">{t("renter.contact.phone")}</label>
                                    <input
                                        type="tel"
                                        className="w-full bg-white border border-slate-200 rounded-lg py-3 px-4 text-xl text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] transition-all font-light shadow-sm"
                                        placeholder={t("renter.contact.phone")}
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        autoComplete="tel"
                                    />
                                </div>
                                <div className="relative group">
                                    <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1 block">{t("renter.contact.lineId")}</label>
                                    <input
                                        className="w-full bg-white border border-slate-200 rounded-lg py-3 px-4 text-xl text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] transition-all font-light shadow-sm"
                                        placeholder={t("renter.contact.lineId") + " (Optional)"}
                                        name="lineId"
                                        value={formData.lineId}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </QuestionSlide>
                    )}

                    {/* STEP: SUCCESS */}
                    {step === 'SUCCESS' && (
                        <motion.div
                            key="success"
                            className="text-center flex flex-col items-center justify-center px-4"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, ease: "anticipate" }}
                        >
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-[var(--accent)]/30 flex items-center justify-center mb-8 shadow-gold bg-[var(--accent)]/5">
                                <Check className="w-10 h-10 md:w-12 md:h-12 text-[var(--accent)]" strokeWidth={2} />
                            </div>
                            <h2 className="text-3xl md:text-5xl font-medium text-slate-900 mb-6 font-serif">
                                {t("renter.success.received")}
                            </h2>
                            <div className="h-0.5 w-16 bg-[var(--accent)]/50 mb-8" />
                            <p className="text-lg md:text-xl text-slate-500 mb-10 max-w-sm mx-auto leading-relaxed font-light whitespace-pre-line">
                                {t("renter.success.description")}
                            </p>
                            <button
                                onClick={() => window.location.href = '/' + language}
                                className="text-[var(--primary)] hover:text-[var(--accent)] transition-colors uppercase tracking-widest text-xs font-bold border-b border-transparent hover:border-[var(--accent)] pb-1"
                            >
                                Return to Home
                            </button>
                        </motion.div>
                    )}

                </AnimatePresence>
            </main>

            {/* Persistent Navigation Controls */}
            {step !== 'WELCOME' && step !== 'SUCCESS' && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent md:bg-none z-50">
                    <div className="max-w-4xl mx-auto flex items-center justify-between">
                        <button
                            onClick={() => navigate(-1, handleBack)}
                            className={cn(
                                "p-4 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200",
                                currentStepIndex === 0 && "opacity-0 pointer-events-none"
                            )}
                            disabled={currentStepIndex === 0}
                        >
                            <ArrowLeft size={24} />
                        </button>

                        <button
                            onClick={() => step === 'CONTACT' ? handleSubmit() : navigate(1, handleNext)}
                            disabled={!isStepValid() || isLoading}
                            className={cn(
                                "group flex items-center px-8 py-4 rounded-full transition-all duration-300 shadow-lg",
                                isStepValid()
                                    ? "bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 hover:scale-105"
                                    : "bg-slate-100 text-slate-300 cursor-not-allowed"
                            )}
                        >
                            <span className="text-sm font-bold tracking-widest uppercase mr-3">
                                {step === 'CONTACT' ? (isLoading ? t("common.processing") : t("common.submit")) : t("common.continue")}
                            </span>
                            {step === 'CONTACT' && isLoading ? (
                                <Sparkles size={20} className="animate-spin" />
                            ) : (
                                <ChevronRight size={20} className={cn("transition-transform", isStepValid() && "group-hover:translate-x-1")} />
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Progress Indicator - Top Right (Below Settings) */}
            {step !== 'WELCOME' && step !== 'SUCCESS' && (
                <div className="fixed right-6 top-24 z-40 flex items-center justify-end space-x-4 pointer-events-none">
                    <div className="text-xs md:text-sm font-medium text-slate-400 font-mono">
                        {currentStepIndex} <span className="mx-1 opacity-50">/</span> {totalSteps}
                    </div>
                    <div className="w-24 md:w-32 h-1 bg-slate-100 rounded-full overflow-hidden shadow-sm">
                        <motion.div
                            className="h-full bg-[var(--accent)]"
                            initial={{ width: 0 }}
                            animate={{ width: `${(currentStepIndex / totalSteps) * 100}%` }}
                            transition={{ duration: 0.5, ease: "circOut" }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

// Sub-components

function QuestionSlide({ children, direction, variants }: { children: React.ReactNode, direction: number, variants: any }) {
    return (
        <motion.div
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
                y: { type: "spring", stiffness: 250, damping: 30 },
                opacity: { duration: 0.3 },
                filter: { duration: 0.2 }
            }}
            className="w-full flex flex-col items-center text-center md:text-left md:items-start max-w-4xl mx-auto"
        >
            {children}
        </motion.div>
    )
}

function NumberBadge({ number }: { number: number }) {
    return (
        <div className="flex items-center space-x-4 mb-6 opacity-60">
            <span className="text-[var(--accent)] font-serif text-2xl font-medium italic">
                {String(number).padStart(2, '0')}
            </span>
            <span className="h-px w-12 bg-slate-300" />
        </div>
    )
}

function BudgetSelection({ t, formData, setFormData, navigate, handleNext, language }: any) {
    const { convert, formatCurrency, loading } = useCurrency();

    const getDynamicLabel = (rangeId: string, min: string, max: string) => {
        const baseLabel = t(`renter.budget.${rangeId}`);
        if (language === 'th' || loading) return baseLabel;

        const targetCurr = language === 'en' ? 'USD' : 'CNY';

        let subText = "";

        if (max === "") { // > 50,000
            const minVal = parseInt(min);
            const conv = convert(minVal, targetCurr);
            subText = `> ${formatCurrency(conv, targetCurr)}`;
        } else if (min === "0") { // < 10,000
            const maxVal = parseInt(max);
            const conv = convert(maxVal, targetCurr);
            subText = `< ${formatCurrency(conv, targetCurr)}`;
        } else {
            const minVal = parseInt(min);
            const maxVal = parseInt(max);
            subText = `${formatCurrency(convert(minVal, targetCurr), targetCurr)} - ${formatCurrency(convert(maxVal, targetCurr), targetCurr)}`;
        }

        return (
            <span>
                {baseLabel} <span className="text-[var(--primary)] opacity-60 text-sm ml-2 font-mono">({language === 'en' ? '≈' : '≈'}{subText})</span>
            </span>
        );
    };

    return (
        <div className="grid grid-cols-1 gap-4 w-full max-w-2xl">
            {[
                { id: 'range1', min: '0', max: '10000' },
                { id: 'range2', min: '10000', max: '18000' },
                { id: 'range3', min: '18001', max: '30000' },
                { id: 'range4', min: '30001', max: '50000' },
                { id: 'range5', min: '50001', max: '' },
            ].map((range) => {
                const isSelected = formData.budgetMin === range.min && formData.budgetMax === range.max;
                return (
                    <SelectionCard
                        key={range.id}
                        selected={isSelected}
                        onClick={() => {
                            setFormData((prev: any) => ({ ...prev, budgetMin: range.min, budgetMax: range.max }));
                            navigate(1, handleNext);
                        }}
                        icon="💰"
                        title={getDynamicLabel(range.id, range.min, range.max)}
                    />
                );
            })}
        </div>
    );
}

function SelectionCard({ selected, onClick, icon, title, accessKey }: any) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "group relative flex flex-row items-center p-5 border transition-all duration-200 text-left w-full active:scale-[0.98] rounded-xl shadow-sm",
                selected
                    ? "border-[var(--accent)] bg-[var(--accent)]/5 shadow-md"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
            )}
        >
            <div className={cn("text-3xl mr-5 transition-all duration-300", selected ? "scale-110 grayscale-0" : "grayscale opacity-70 group-hover:opacity-100")}>{icon}</div>
            <div className="flex-1 pr-4">
                <div className={cn("text-lg mb-0.5 transition-colors font-medium", selected ? "text-[var(--primary)]" : "text-slate-500 group-hover:text-slate-700")}>{title}</div>
            </div>

            {/* Checkbox UI */}
            <div className={cn(
                "w-6 h-6 rounded-md border flex items-center justify-center transition-all duration-200",
                selected
                    ? "bg-[var(--accent)] border-[var(--accent)]"
                    : "bg-white border-slate-300 group-hover:border-slate-400"
            )}>
                {selected && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
            </div>
        </button>
    )
}

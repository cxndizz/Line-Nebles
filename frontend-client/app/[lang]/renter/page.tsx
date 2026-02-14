'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { ChevronRight, ArrowRight, Check, ArrowLeft, ArrowDown, Sparkles } from 'lucide-react';
import { Link } from 'lucide-react';
import Image from 'next/image';
import liff from '@line/liff';
import { cn } from '../../components/ui/Button';
import { useLanguage } from '../../context/LanguageContext';
import { LuxuryCalendar } from '../../components/wizard/LuxuryCalendar';
import { useCurrency } from '../../hooks/useCurrency';

type Step = 'WELCOME' | 'LOCATION' | 'PETS' | 'BUDGET' | 'UNIT_TYPE' | 'CONTRACT' | 'MOVE_IN' | 'CONTACT' | 'SUCCESS';

const normalizeRenterData = (raw: any) => {
    // 1. Budget: Convert to Number
    const budgetMin = parseInt(raw.budgetMin?.replace(/,/g, '') || '0', 10);
    const budgetMax = parseInt(raw.budgetMax?.replace(/,/g, '') || '0', 10);

    // 2. Pet Policy: Boolean & Tags
    const isPetFriendly = raw.hasPet === 'true';
    const petTags = isPetFriendly && raw.petType
        ? raw.petType.split(',').map((t: string) => t.trim()).filter((t: string) => t)
        : [];

    // 3. Contract: Convert to Months
    const contractMap: Record<string, number> = {
        '1_month': 1,
        '3_months': 3,
        '6_months': 6,
        '1_year': 12,
        '1_year_plus': 12, // minimal 12
        '2_years': 24
    };
    const contractMonths = contractMap[raw.contractPeriod] || 12; // default 1 year

    // 4. Unit Type: Map to standard Enum keys if needed, currently keeping as array
    const unitTypes = raw.roomType ? [raw.roomType] : [];

    // 5. Move-in Date: YYYY-MM-DD
    const moveInDate = raw.moveInDate instanceof Date
        ? raw.moveInDate.toISOString().split('T')[0]
        : raw.moveInDate;

    // 6. Contact: Sanitize Phone
    const phoneNumber = raw.phoneNumber.replace(/[^0-9]/g, '');

    return {
        line_user_id: raw.lineUserId || '',
        line_display_name: raw.lineDisplayName || '',
        full_name: raw.fullName || '',
        phone_number: phoneNumber,
        email: raw.email?.toLowerCase().trim() || '',
        preferences: {
            location_zones: raw.locationPreference ? raw.locationPreference.split(',').map((z: string) => z.trim()) : [],
            budget: {
                min: budgetMin,
                max: budgetMax
            },
            is_pet_friendly: isPetFriendly,
            pet_tags: petTags,
            unit_types: unitTypes,
            contract_months: contractMonths,
            move_in_date: moveInDate || ''
        },
        secret: process.env.NEXT_PUBLIC_API_SECRET || '',
        metadata: {
            source: 'LIFF_RENTER_FORM',
            submitted_at: new Date().toISOString()
        }
    };
};

export default function RenterPage() {
    const { t, currencySymbol, language } = useLanguage();
    const [step, setStep] = useState<Step>('WELCOME');
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        locationPreference: '',
        hasPet: 'false',
        petType: '',
        budgetMin: '10000',
        budgetMax: '50000',
        roomType: '',
        contractPeriod: '1_year',
        moveInDate: undefined as Date | undefined,
        fullName: '',
        phoneNumber: '',
        lineId: '',
        lineUserId: '',
        lineDisplayName: '',
        email: '',
    });

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const initLiff = async () => {
            try {
                const liffId = process.env.NEXT_PUBLIC_LIFF_ID || '';
                if (!liffId || liffId === 'your_liff_id_here') {
                    console.warn('LIFF ID is missing/invalid. Skipping init.');
                    return;
                }

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
                body: JSON.stringify(normalizeRenterData(formData)),
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

    const animateAndNavigate = (newDirection: number, action: () => void) => {
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
                    <Image
                        src="/images/logo.png"
                        alt="Nebles Logo"
                        width={200}
                        height={65}
                        className="h-16 w-auto object-contain"
                        priority
                    />
                </div>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col justify-center items-center relative max-w-4xl mx-auto w-full px-6 md:px-10 py-12 md:py-20 lg:py-24">
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
                                    onClick={() => animateAndNavigate(1, handleNext)}
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

                            <LocationSelection
                                t={t}
                                formData={formData}
                                setFormData={setFormData}
                            />
                        </QuestionSlide>
                    )}

                    {/* STEP: PETS */}
                    {step === 'PETS' && (
                        <QuestionSlide key="pets" direction={direction} variants={variants}>
                            <NumberBadge number={2} />
                            <h2 className="text-3xl md:text-5xl font-medium text-slate-900 mb-8 font-serif">
                                {t("renter.pets.title")}
                            </h2>
                            <div className="grid grid-cols-2 gap-3 md:gap-4 w-full max-w-2xl mt-2">
                                <SelectionCard
                                    selected={formData.hasPet === 'false'}
                                    onClick={() => {
                                        setFormData(p => ({ ...p, hasPet: 'false' }));
                                        animateAndNavigate(1, handleNext); // Auto-advance
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

                            <div className="w-full max-w-xl mx-auto">
                                <BudgetSliderPro
                                    min={0}
                                    max={150000}
                                    step={500}
                                    value={[
                                        (formData.budgetMin && !isNaN(Number(formData.budgetMin))) ? Number(formData.budgetMin) : 10000,
                                        (formData.budgetMax && !isNaN(Number(formData.budgetMax))) ? Number(formData.budgetMax) : 50000
                                    ]}
                                    onChange={([min, max]) => {
                                        setFormData(prev => ({
                                            ...prev,
                                            budgetMin: min.toString(),
                                            budgetMax: max.toString()
                                        }));
                                    }}
                                />


                            </div>
                        </QuestionSlide>
                    )}


                    {/* STEP: UNIT_TYPE */}
                    {step === 'UNIT_TYPE' && (
                        <QuestionSlide key="unit_type" direction={direction} variants={variants}>
                            <NumberBadge number={4} />
                            <h2 className="text-3xl md:text-5xl font-medium text-slate-900 mb-10 font-serif">
                                {t("renter.details.unitType")}
                            </h2>
                            <div className="grid grid-cols-2 gap-3 md:gap-4 w-full max-w-3xl">
                                {['Studio', '1 Bedroom', '2 Bedrooms', 'Penthouse/Other'].map((type) => (
                                    <SelectionCard
                                        key={type}
                                        selected={formData.roomType === type}
                                        onClick={() => {
                                            setFormData(p => ({ ...p, roomType: type }));
                                            animateAndNavigate(1, handleNext);
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
                            <div className="grid grid-cols-2 gap-3 md:gap-4 w-full max-w-3xl pb-32">
                                {[
                                    ...Array.from({ length: 11 }, (_, i) => {
                                        const num = i + 1;
                                        // Force string interpolation to ensure it's not treated as a key directly if something is weird
                                        const unit = num === 1 ? t("renter.details.month") : t("renter.details.months");
                                        return {
                                            val: `${num}_month${num > 1 ? 's' : ''}`,
                                            label: `${num} ${unit}`
                                        };
                                    }),
                                    { val: '1_year_plus', label: t("renter.details.year_plus") }
                                ].map((opt) => (
                                    <SelectionCard
                                        key={opt.val}
                                        selected={formData.contractPeriod === opt.val}
                                        onClick={() => {
                                            setFormData(p => ({ ...p, contractPeriod: opt.val }));
                                            animateAndNavigate(1, handleNext);
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
                        <QuestionSlide key="move_in" direction={direction} variants={variants} centered>
                            <NumberBadge number={6} />
                            <h2 className="text-3xl md:text-5xl font-medium text-slate-900 mb-10 font-serif">
                                {t("renter.details.moveIn")}
                            </h2>
                            <div className="w-full flex justify-center">
                                <LuxuryCalendar
                                    selected={formData.moveInDate}
                                    onSelect={(date) => {
                                        setFormData(p => ({ ...p, moveInDate: date }));
                                    }}
                                    className="scale-110"
                                />
                            </div>
                        </QuestionSlide>
                    )}


                    {/* STEP: CONTACT */}
                    {step === 'CONTACT' && (
                        <QuestionSlide key="contact" direction={direction} variants={variants}>
                            <NumberBadge number={7} />

                            {/* Almost Done Badge */}
                            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-gradient-to-r from-[var(--accent)]/10 to-[var(--accent)]/5 border border-[var(--accent)]/20 text-[var(--accent)] text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-6 shadow-sm backdrop-blur-sm">
                                <Sparkles className="w-3.5 h-3.5 mr-2" />
                                {t("renter.contact.almostDone")}
                            </div>

                            <h2 className="text-3xl md:text-5xl font-medium text-slate-900 mb-6 font-serif">
                                {t("renter.contact.title")}
                            </h2>
                            <p className="text-lg text-slate-500 mb-8 font-light tracking-wide">
                                {t("renter.contact.description")}
                            </p>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 w-full max-w-5xl">
                                {/* Form Fields */}
                                <div className="space-y-5 w-full">
                                    <div className="relative group">
                                        <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1 block">{t("renter.contact.name")}</label>
                                        <input
                                            ref={inputRef}
                                            className="w-full bg-white border border-slate-200 rounded-lg py-3 px-4 text-lg text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] transition-all font-light shadow-sm"
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
                                            className="w-full bg-white border border-slate-200 rounded-lg py-3 px-4 text-lg text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] transition-all font-light shadow-sm"
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
                                            className="w-full bg-white border border-slate-200 rounded-lg py-3 px-4 text-lg text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] transition-all font-light shadow-sm"
                                            placeholder={t("renter.contact.lineId") + " (Optional)"}
                                            name="lineId"
                                            value={formData.lineId}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="relative group">
                                        <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1 block">{t("renter.contact.email")}</label>
                                        <input
                                            type="email"
                                            className="w-full bg-white border border-slate-200 rounded-lg py-3 px-4 text-lg text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] transition-all font-light shadow-sm"
                                            placeholder={t("renter.contact.email")}
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            autoComplete="email"
                                        />
                                    </div>
                                </div>

                                {/* Trust Badges */}
                                <div className="space-y-4 pt-2">
                                    <div className="flex items-start p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                                        <div className="p-3 rounded-xl bg-[var(--primary)]/5 text-[var(--primary)] mr-5 group-hover:bg-[var(--primary)]/10 transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lock w-6 h-6"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                        </div>
                                        <div>
                                            <h4 className="font-serif font-bold text-slate-800 text-base mb-1">{t("renter.contact.trust.encrypted")}</h4>
                                            <p className="text-xs text-slate-400 leading-relaxed font-light">{t("renter.contact.trust.encryptedDesc")}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                                        <div className="p-3 rounded-xl bg-[var(--accent)]/5 text-[var(--accent)] mr-5 group-hover:bg-[var(--accent)]/10 transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clock w-6 h-6"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                        </div>
                                        <div>
                                            <h4 className="font-serif font-bold text-slate-800 text-base mb-1">{t("renter.contact.trust.response")}</h4>
                                            <p className="text-xs text-slate-400 leading-relaxed font-light">{t("renter.contact.trust.responseDesc")}</p>
                                        </div>
                                    </div>
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

            {/* Step: Confirm Modal (Overlay) - Moved outside main structure to fix AnimatePresence mode="wait" conflict */}
            <AnimatePresence>
                {isConfirmModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
                        >
                            <div className="p-6 md:p-8">
                                <div className="w-12 h-12 bg-[var(--accent)]/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                                    <Check className="text-[var(--accent)] w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-serif text-center text-slate-900 mb-2">{t("renter.contact.confirm.title")}</h3>
                                <p className="text-slate-500 text-center text-sm mb-6">{t("renter.contact.confirm.description")}</p>

                                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm mb-6 max-h-[40vh] overflow-y-auto">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400 font-medium">Location</span>
                                        <span className="text-slate-800 font-bold text-right truncate max-w-[60%]">{formData.locationPreference || '-'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400 font-medium">Budget</span>
                                        <span className="text-slate-800 font-bold text-right">{formData.budgetMin} - {formData.budgetMax}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400 font-medium">Pets</span>
                                        <span className="text-slate-800 font-bold text-right">{formData.hasPet === 'true' ? 'Yes 🐾' : 'No'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400 font-medium">Unit Type</span>
                                        <span className="text-slate-800 font-bold text-right truncate max-w-[60%]">{formData.roomType || '-'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400 font-medium">Contract</span>
                                        <span className="text-slate-800 font-bold text-right">{formData.contractPeriod ? formData.contractPeriod.replace(/_/g, ' ').replace('plus', '+') : '-'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400 font-medium">Move-in</span>
                                        <span className="text-slate-800 font-bold text-right">{formData.moveInDate ? new Date(formData.moveInDate).toDateString() : '-'}</span>
                                    </div>
                                    <div className="h-px bg-slate-200 my-2" />
                                    <div className="flex justify-between">
                                        <span className="text-slate-400 font-medium">Name</span>
                                        <span className="text-slate-800 font-bold text-right">{formData.fullName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400 font-medium">Phone</span>
                                        <span className="text-slate-800 font-bold text-right">{formData.phoneNumber}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400 font-medium">Line ID</span>
                                        <span className="text-slate-800 font-bold text-right">{formData.lineId || '-'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400 font-medium">Email</span>
                                        <span className="text-slate-800 font-bold text-right truncate max-w-[60%]">{formData.email || '-'}</span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isLoading}
                                        className="w-full py-4 bg-[var(--primary)] text-white rounded-xl font-bold tracking-wide uppercase hover:bg-[var(--primary)]/90 transition-all flex items-center justify-center space-x-2"
                                    >
                                        {isLoading ? (
                                            <Sparkles className="animate-spin w-5 h-5" />
                                        ) : (
                                            <span>{t("renter.contact.confirm.submit")}</span>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setIsConfirmModalOpen(false)}
                                        disabled={isLoading}
                                        className="w-full py-3 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-600 transition-colors"
                                    >
                                        {t("renter.contact.confirm.edit")}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Persistent Navigation Controls */}
            {step !== 'WELCOME' && step !== 'SUCCESS' && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent md:bg-none z-50">
                    <div className="max-w-4xl mx-auto flex items-center justify-between">
                        <button
                            onClick={() => animateAndNavigate(-1, handleBack)}
                            className={cn(
                                "p-4 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200",
                                currentStepIndex === 0 && "opacity-0 pointer-events-none"
                            )}
                            disabled={currentStepIndex === 0}
                        >
                            <ArrowLeft size={24} />
                        </button>

                        <button
                            onClick={() => step === 'CONTACT' ? setIsConfirmModalOpen(true) : animateAndNavigate(1, handleNext)}
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

function QuestionSlide({ children, direction, variants, centered = false }: { children: React.ReactNode, direction: number, variants: any, centered?: boolean }) {
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
            className={cn(
                "w-full flex flex-col max-w-4xl mx-auto",
                centered
                    ? "items-center text-center"
                    : "items-center text-center md:text-left md:items-start"
            )}
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

// Rewriting BudgetSlider to be simpler and robust using standard range inputs styled effectively.
// This is the most reliable way to get "Pro" feel without janky JS-based drag.
function BudgetSliderPro({ min, max, step = 1000, value, onChange }: { min: number, max: number, step?: number, value: [number, number], onChange: (val: [number, number]) => void }) {

    // Handlers for Range Sliders
    const handleMinRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = Number(e.target.value);
        const newMin = Math.min(val, value[1] - step);
        onChange([newMin, value[1]]);
    };

    const handleMaxRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = Number(e.target.value);
        const newMax = Math.max(val, value[0] + step);
        onChange([value[0], newMax]);
    };

    // Handlers for Text Inputs (Direct Entry)
    const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Remove non-digits
        const rawVal = e.target.value.replace(/,/g, '');
        if (rawVal === '') {
            // Allow temporary empty state or set to 0? Set to 0 for safety or minimal
            onChange([0, value[1]]);
            return;
        }
        const val = parseInt(rawVal, 10);
        if (isNaN(val)) return;

        // For inputs, we don't clamp immediately against the other handle to allow typing freely, 
        // but we might clamp on blur. 
        // However, specifically for this dual slider logic state, we must maintain [min, max] variants.
        // If user types a Min > Max, typically we push max or clamp min.
        // Let's just update as is, but ensure [0] <= [1] in the render/logic? 
        // Or strictly clamp:
        const safeVal = Math.min(val, value[1]); // Strict clamp for now to avoid crossing
        onChange([safeVal, value[1]]);
    };

    const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawVal = e.target.value.replace(/,/g, '');
        if (rawVal === '') {
            onChange([value[0], max]); // Reset to max? Or 0?
            return;
        }
        const val = parseInt(rawVal, 10);
        if (isNaN(val)) return;

        const safeVal = Math.max(val, value[0]); // Strict clamp
        onChange([value[0], Math.min(safeVal, max)]); // Also clamp to absolute max
    };


    const minPos = ((value[0] - min) / (max - min)) * 100;
    const maxPos = ((value[1] - min) / (max - min)) * 100;

    const formatValue = (val: number) => val.toLocaleString();

    return (
        <div className="w-full max-w-xl mx-auto py-6 px-4">
            <div className="flex justify-between items-end mb-8 font-serif">
                {/* Min Input */}
                <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm min-w-[140px] focus-within:border-[var(--accent)] focus-within:ring-2 focus-within:ring-[var(--accent)]/10 transition-all">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block mb-1">Minimum</span>
                    <div className="flex items-center">
                        <span className="text-slate-400 mr-1 text-lg">฿</span>
                        <input
                            type="text"
                            value={formatValue(value[0])}
                            onChange={handleMinInputChange}
                            className="w-full text-xl text-[var(--primary)] font-bold outline-none bg-transparent placeholder-slate-200"
                            placeholder="0"
                        />
                    </div>
                </div>

                <div className="text-slate-300 pb-5 px-2">-</div>

                {/* Max Input */}
                <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm min-w-[140px] text-right focus-within:border-[var(--accent)] focus-within:ring-2 focus-within:ring-[var(--accent)]/10 transition-all">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block mb-1">Maximum</span>
                    <div className="flex items-center justify-end">
                        <span className="text-slate-400 mr-1 text-lg">฿</span>
                        <input
                            type="text"
                            value={value[1] >= max ? formatValue(max) + "+" : formatValue(value[1])} // Show + only if via slider? Input might be weird.
                            // If editing, removing + is important.
                            // Let's simplify: Just show number. The + logic is good for static, bad for input.
                            // If value == max, we can show value.
                            // Actually user asked to increase max to 500k.
                            onChange={handleMaxInputChange}
                            className="w-full text-xl text-[var(--primary)] font-bold outline-none bg-transparent placeholder-slate-200 text-right"
                            placeholder="Max"
                        />
                    </div>
                </div>
            </div>

            <div className="relative h-20 pt-8"> {/* Container for slider */}
                <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-slate-100 rounded-full -translate-y-1/2 z-0"></div>
                <div
                    className="absolute top-1/2 h-1.5 bg-[var(--accent)] rounded-full -translate-y-1/2 z-0 opacity-80"
                    style={{ left: `${minPos}%`, right: `${100 - maxPos}%` }}
                ></div>

                {/* Range Inputs */}
                <input
                    type="range"
                    min={min} max={max} step={step}
                    value={value[0]}
                    onChange={handleMinRangeChange}
                    className="absolute top-1/2 left-0 w-full -translate-y-1/2 appearance-none bg-transparent pointer-events-none z-10 
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:h-7 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[var(--accent)] [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
                />
                <input
                    type="range"
                    min={min} max={max} step={step}
                    value={value[1]}
                    onChange={handleMaxRangeChange}
                    className="absolute top-1/2 left-0 w-full -translate-y-1/2 appearance-none bg-transparent pointer-events-none z-10
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:h-7 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[var(--accent)] [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
                />
            </div>

            {/* Note for interactions */}
            <div className="flex justify-between text-xs text-slate-300 font-medium px-1 mt-[-20px]">
                <span>฿0</span>
                <span>฿{(max / 2).toLocaleString()}</span>
                <span>฿{max.toLocaleString()}+</span>
            </div>
        </div>
    );
}
function SelectionCard({ selected, onClick, icon, title, accessKey, className }: any) {
    return (
        <button
            onClick={onClick}
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
                    layoutId="selected-glow"
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
    )
}

function LocationSelection({ t, formData, setFormData }: any) {
    const LOCATION_ZONES = [
        { id: 'sukhumvit', value: 'Sukhumvit', icon: '🏙️' },
        { id: 'silom_sathorn', value: 'Silom / Sathorn', icon: '💼' },
        { id: 'siam_ploenchit', value: 'Siam / Chidlom / Ploenchit', icon: '🛍️' },
        { id: 'riverside', value: 'Riverside', icon: '🌊' },
        { id: 'ari_phayathai', value: 'Ari / Phaya Thai', icon: '☕' },
        { id: 'ratchada_rama9', value: 'Ratchada / Rama 9', icon: '🌃' },
        { id: 'chatuchak_ladprao', value: 'Chatuchak / Ladprao', icon: '🌳' },
        { id: 'bangsue_taopoon', value: 'Bang Sue / Tao Poon', icon: '🚇' },
        { id: 'kaset_nawamin', value: 'Kaset-Nawamin / Ramintra', icon: '🛣️' },
        { id: 'latkrabang', value: 'Lat Krabang / Suvarnabhumi', icon: '✈️' },
        { id: 'bangna', value: 'Bang Na / Udom Suk', icon: '🏬' },
        { id: 'thonburi', value: 'Thonburi', icon: '🏛️' },
        { id: 'rama2', value: 'Rama 2 / Bang Khun Thian', icon: '🛣️' },
        { id: 'phetkasem', value: 'Phetkasem / Bang Khae', icon: '🛍️' },
        { id: 'chaengwatthana', value: 'Chaeng Watthana / Pak Kret', icon: '🏢' },
        { id: 'nonthaburi', value: 'Nonthaburi / Rattanathibet', icon: '🏡' },
        { id: 'rangsit_pathum', value: 'Rangsit / Pathum Thani', icon: '🎓' },
        { id: 'ramkhamhaeng', value: 'Ramkhamhaeng / Bang Kapi', icon: '🏟️' },
        { id: 'pinklao', value: 'Pinklao / Taling Chan', icon: '🌉' },
        { id: 'samutprakan', value: 'Samut Prakan / Srinakarin', icon: '🏭' },
    ];

    // Helper to check if a zone is selected
    const isSelected = (val: string) => {
        if (!formData.locationPreference) return false;
        const currentSelected = formData.locationPreference.split(', ').filter(Boolean);
        return currentSelected.includes(val);
    };

    // Helper to toggle selection
    const toggleZone = (val: string) => {
        const currentSelected = formData.locationPreference
            ? formData.locationPreference.split(', ').filter(Boolean)
            : [];

        let newSelected: string[];
        if (currentSelected.includes(val)) {
            newSelected = currentSelected.filter((item: string) => item !== val);
        } else {
            newSelected = [...currentSelected, val];
        }

        // Maintain "Other" text if it exists
        const otherText = currentSelected.find((item: string) => item.startsWith('Other: '));
        if (otherText && !newSelected.includes(otherText) && val !== 'OTHER_FLAG') {
            // If we're just toggling a normal zone, make sure we don't accidentally lose the "Other" text if it was there
            // But actually, the filter above handles standard zones. 
            // "Other" logic is handled separately below, but stored in the same string string.
            // Wait, if "Other: ..." is in currentSelected, and we toggle "Sukhumvit", 
            // "Other: ..." should remain in newSelected unless we explicitly removed it.
            // The filter logic above preserves "Other: ..." because val (e.g. "Sukhumvit") != "Other: ..."
        }

        setFormData((prev: any) => ({ ...prev, locationPreference: newSelected.join(', ') }));
    };

    // Handle "Other" selection
    const [isOtherSelected, setIsOtherSelected] = useState(() => {
        return !!formData.locationPreference?.includes('Other: ');
    });

    const [otherText, setOtherText] = useState(() => {
        const match = formData.locationPreference?.match(/Other: (.*)/);
        return match ? match[1] : '';
    });

    const toggleOther = () => {
        const newIsOtherSelected = !isOtherSelected;
        setIsOtherSelected(newIsOtherSelected);

        let currentSelected = formData.locationPreference
            ? formData.locationPreference.split(', ').filter(Boolean)
            : [];

        if (newIsOtherSelected) {
            // Added "Other", but text is empty initially, so we don't add to string yet or add base pattern?
            // Let's add "Other: " pattern to mark it as selected, or just manage local state?
            // Better to manage local state and only update parent string when valid.
            // But to keep consistency with "isSelected", maybe we don't add to parent string until typed?
            // OR we add "Other: " placeholder?
            // Let's keep it simple: "Other: " prefix.
            // Actually, if I just use local state `isOtherSelected` for the UI, 
            // and only update `locationPreference` when text changes, that's cleaner?
            // But if user selects "Other" and types nothing, and submits?
            // Maybe we just check isOtherSelected and if true, ensure "Other: " + text is in the list.
        } else {
            // Removed "Other"
            setOtherText('');
            const newSelected = currentSelected.filter((item: string) => !item.startsWith('Other: '));
            setFormData((prev: any) => ({ ...prev, locationPreference: newSelected.join(', ') }));
        }
    };

    const handleOtherTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const text = e.target.value;
        setOtherText(text);

        let currentSelected = formData.locationPreference
            ? formData.locationPreference.split(', ').filter((item: string) => !item.startsWith('Other: '))
            : [];

        if (text.trim()) {
            currentSelected.push(`Other: ${text}`);
        } else {
            // If text is empty, do we remove "Other" selection? 
            // Maybe keep the selection active but remove the value from string?
            // But then validation might fail if it relies on string not being empty.
        }

        setFormData((prev: any) => ({ ...prev, locationPreference: currentSelected.join(', ') }));
    };

    // Animation variants for container
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    // Animation variants for items
    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            className="w-full max-w-5xl pb-24 md:pb-10"
            variants={container}
            initial="hidden"
            animate="show"
        >
            {/* Use LayoutGroup to allow smooth transitions when other elements change */}
            <LayoutGroup>
                <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6">
                    {LOCATION_ZONES.map((zone) => (
                        <motion.div key={zone.id} variants={item} layout>
                            <SelectionCard
                                selected={isSelected(zone.value)}
                                onClick={() => toggleZone(zone.value)}
                                icon={zone.icon}
                                title={t(`renter.location.zones.${zone.id}`)}
                                className="h-full"
                            />
                        </motion.div>
                    ))}

                    {/* Other Option */}
                    <motion.div variants={item} layout>
                        <SelectionCard
                            selected={isOtherSelected}
                            onClick={toggleOther}
                            icon="✨"
                            title={t("renter.location.other")}
                            className="h-full"
                        />
                    </motion.div>
                </div>
            </LayoutGroup>

            {/* Other Input Field */}
            <AnimatePresence>
                {isOtherSelected && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, scale: 0.98, y: -10 }}
                        animate={{ opacity: 1, height: 'auto', scale: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0, scale: 0.98, y: -10 }}
                        transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                        className="overflow-hidden"
                    >
                        <div className="p-1"> {/* Padding for focus ring */}
                            <input
                                className="w-full bg-white border-2 border-[var(--accent)]/20 rounded-xl text-lg p-5 text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10 transition-all duration-300 font-serif shadow-inner"
                                placeholder={t("renter.location.otherPlaceholder")}
                                value={otherText}
                                onChange={handleOtherTextChange}
                                autoFocus
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

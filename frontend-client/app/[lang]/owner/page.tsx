'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, Building, FileText, Banknote, User } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import liff from '@line/liff';
import { useLanguage } from '../../context/LanguageContext';

type Step = 'WELCOME' | 'PROJECT' | 'DETAILS' | 'PRICE' | 'CONTACT' | 'SUCCESS';

export default function OwnerPage() {
    const { t, currencySymbol, language } = useLanguage();
    const [step, setStep] = useState<Step>('WELCOME');
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        projectName: '',
        roomDetails: '',
        rentalPrice: '',
        rentalPeriod: '1_year',
        specialConditions: '',
        ownerName: '',
        ownerPhone: '',
        ownerLineId: '',
        lineUserId: '',
        lineDisplayName: '',
    });

    useEffect(() => {
        const initLiff = async () => {
            try {
                // REPLACE THIS WITH YOUR ACTUAL LIFF ID
                const liffId = process.env.NEXT_PUBLIC_LIFF_ID || '';
                if (!liffId || liffId === 'your_liff_id_here') {
                    console.warn('LIFF ID is missing or invalid. Skipping initialization.');
                    return;
                }

                await liff.init({ liffId });
                if (liff.isLoggedIn()) {
                    const profile = await liff.getProfile();
                    setFormData(prev => ({
                        ...prev,
                        lineUserId: profile.userId,
                        lineDisplayName: profile.displayName,
                        ownerName: prev.ownerName || profile.displayName, // Auto-fill name if empty
                    }));
                } else {
                    // Profile might not be available if not logged in
                    // liff.login(); // Optional: force login
                }
            } catch (error) {
                console.error('LIFF Initialization failed', error);
            }
        };
        initLiff();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNext = () => {
        const steps: Step[] = ['WELCOME', 'PROJECT', 'DETAILS', 'PRICE', 'CONTACT', 'SUCCESS'];
        const currentIndex = steps.indexOf(step);
        if (currentIndex < steps.length - 1) {
            setStep(steps[currentIndex + 1]);
        }
    };

    const handleBack = () => {
        const steps: Step[] = ['WELCOME', 'PROJECT', 'DETAILS', 'PRICE', 'CONTACT', 'SUCCESS'];
        const currentIndex = steps.indexOf(step);
        if (currentIndex > 0) {
            setStep(steps[currentIndex - 1]);
        }
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            // REPLACE THIS WITH YOUR ACTUAL GOOGLE APPS SCRIPT WEB APP URL
            const gasUrl = process.env.NEXT_PUBLIC_GAS_URL || '';
            if (!gasUrl) {
                alert('ยังไม่ได้ตั้งค่า Google Apps Script URL');
                setIsLoading(false);
                return;
            }

            const response = await fetch(gasUrl, {
                method: 'POST',
                mode: 'no-cors', // Essential for GAS if not using a proxy
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            // Note: with no-cors, we can't read the response body, but it's usually fine for GAS submissions
            setStep('SUCCESS');
        } catch (error) {
            console.error('Submission failed', error);
            alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่');
        } finally {
            setIsLoading(false);
        }
    };

    // Animation variants
    const slideVariants = {
        hidden: { x: 20, opacity: 0 },
        visible: { x: 0, opacity: 1 },
        exit: { x: -20, opacity: 0 }
    };

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Elements */}
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[var(--primary)]/5 via-transparent to-transparent -z-10" />
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-[var(--accent)]/5 via-transparent to-transparent -z-10" />

            <div className="w-full max-w-lg relative z-10">
                {/* Progress Indicator */}
                {step !== 'WELCOME' && step !== 'SUCCESS' && (
                    <div className="mb-8 flex justify-center space-x-2">
                        {['PROJECT', 'DETAILS', 'PRICE', 'CONTACT'].map((s, i) => (
                            <div key={s} className={`h-1.5 rounded-full transition-all duration-300 ${['PROJECT', 'DETAILS', 'PRICE', 'CONTACT'].indexOf(step) >= i ? 'w-8 bg-[var(--accent)]' : 'w-4 bg-slate-200'}`} />
                        ))}
                    </div>
                )}

                <AnimatePresence mode="wait">
                    {step === 'WELCOME' && (
                        <motion.div key="welcome" initial="hidden" animate="visible" exit="exit" variants={slideVariants}>
                            <Card className="border border-slate-200 bg-white/80 backdrop-blur-xl shadow-xl shadow-slate-200/50">
                                <CardHeader className="text-center pb-2">
                                    <div className="mx-auto w-16 h-16 bg-[var(--primary)]/5 rounded-full flex items-center justify-center mb-4">
                                        <Building className="w-8 h-8 text-[var(--primary)]" />
                                    </div>
                                    <CardTitle className="text-3xl font-bold text-[var(--foreground)] whitespace-pre-line">
                                        {t("owner.welcome.title")}
                                    </CardTitle>
                                    <CardDescription className="text-slate-500 mt-2 text-base whitespace-pre-line">
                                        {t("owner.welcome.description")}
                                    </CardDescription>
                                </CardHeader>
                                <CardFooter className="pt-6">
                                    <Button onClick={handleNext} className="w-full text-lg h-14 bg-[var(--primary)] hover:bg-[var(--primary)]/90 shadow-lg shadow-[var(--primary)]/20" size="lg">
                                        {t("owner.welcome.action")} <ChevronRight className="ml-2 w-5 h-5" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    )}

                    {step === 'PROJECT' && (
                        <motion.div key="project" initial="hidden" animate="visible" exit="exit" variants={slideVariants}>
                            <Card className="border border-slate-200 bg-white shadow-lg">
                                <CardHeader>
                                    <CardTitle className="text-[var(--foreground)]">{t("owner.project.title")}</CardTitle>
                                    <CardDescription className="text-slate-500">{t("owner.project.description")}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Input
                                        placeholder={t("owner.project.placeholder")}
                                        name="projectName"
                                        value={formData.projectName}
                                        onChange={handleChange}
                                        autoFocus
                                        className="bg-white border-slate-200 text-[var(--foreground)] placeholder:text-slate-400 focus:border-[var(--accent)]"
                                    />
                                </CardContent>
                                <CardFooter className="flex justify-between">
                                    <Button variant="ghost" onClick={handleBack} className="text-slate-500 hover:text-[var(--primary)]">{t("common.back")}</Button>
                                    <Button onClick={handleNext} disabled={!formData.projectName} className="bg-[var(--primary)] text-white">{t("common.next")} <ChevronRight className="ml-2 w-4 h-4" /></Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    )}

                    {step === 'DETAILS' && (
                        <motion.div key="details" initial="hidden" animate="visible" exit="exit" variants={slideVariants}>
                            <Card className="border border-slate-200 bg-white shadow-lg">
                                <CardHeader>
                                    <CardTitle className="text-[var(--foreground)]">{t("owner.details.title")}</CardTitle>
                                    <CardDescription className="text-slate-500">{t("owner.details.description")}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Input label={t("owner.details.label")}
                                        name="roomDetails"
                                        value={formData.roomDetails}
                                        onChange={handleChange}
                                        className="bg-white border-slate-200 text-[var(--foreground)]"
                                    />
                                    <Input label={t("owner.details.special")}
                                        placeholder={t("owner.details.specialPlaceholder")}
                                        name="specialConditions"
                                        value={formData.specialConditions}
                                        onChange={handleChange}
                                        className="bg-white border-slate-200 text-[var(--foreground)]"
                                    />
                                </CardContent>
                                <CardFooter className="flex justify-between">
                                    <Button variant="ghost" onClick={handleBack} className="text-slate-500 hover:text-[var(--primary)]">{t("common.back")}</Button>
                                    <Button onClick={handleNext} className="bg-[var(--primary)] text-white">{t("common.next")} <ChevronRight className="ml-2 w-4 h-4" /></Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    )}

                    {step === 'PRICE' && (
                        <motion.div key="price" initial="hidden" animate="visible" exit="exit" variants={slideVariants}>
                            <Card className="border border-slate-200 bg-white shadow-lg">
                                <CardHeader>
                                    <CardTitle className="text-[var(--foreground)]">{t("owner.price.title")}</CardTitle>
                                    <CardDescription className="text-slate-500">{t("owner.price.description")}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="relative w-full">
                                        <span className="absolute left-3 top-3 text-slate-500">{currencySymbol}</span>
                                        <Input className="pl-8 bg-white border-slate-200 text-[var(--foreground)]" placeholder={t("owner.price.pricePlaceholder")} type="number" name="rentalPrice" value={formData.rentalPrice} onChange={handleChange} />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 ml-1">{t("owner.price.contractLabel")}</label>
                                        <select
                                            name="rentalPeriod"
                                            value={formData.rentalPeriod}
                                            onChange={handleChange}
                                            className="flex h-12 w-full rounded-xl bg-white border border-slate-200 px-4 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 shadow-sm"
                                        >
                                            <option value="1_year">{t("owner.price.oneYearPlus")}</option>
                                            <option value="6_months">{t("owner.price.sixMonthsPlus")}</option>
                                            <option value="any">{t("owner.price.shortLong")}</option>
                                        </select>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-between">
                                    <Button variant="ghost" onClick={handleBack} className="text-slate-500 hover:text-[var(--primary)]">{t("common.back")}</Button>
                                    <Button onClick={handleNext} disabled={!formData.rentalPrice} className="bg-[var(--primary)] text-white">{t("common.next")} <ChevronRight className="ml-2 w-4 h-4" /></Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    )}

                    {step === 'CONTACT' && (
                        <motion.div key="contact" initial="hidden" animate="visible" exit="exit" variants={slideVariants}>
                            <Card className="border border-slate-200 bg-white shadow-lg">
                                <CardHeader>
                                    <CardTitle className="text-[var(--foreground)]">{t("owner.contact.title")}</CardTitle>
                                    <CardDescription className="text-slate-500">{t("owner.contact.description")}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Input label={t("owner.contact.nameLabel")} placeholder={t("owner.contact.namePlaceholder")} name="ownerName" value={formData.ownerName} onChange={handleChange} className="bg-white border-slate-200 text-[var(--foreground)]" />
                                    <Input label={t("owner.contact.phoneLabel")} type="tel" placeholder={t("owner.contact.phonePlaceholder")} name="ownerPhone" value={formData.ownerPhone} onChange={handleChange} className="bg-white border-slate-200 text-[var(--foreground)]" />
                                    <Input label={t("owner.contact.lineLabel")} placeholder={t("owner.contact.linePlaceholder")} name="ownerLineId" value={formData.ownerLineId} onChange={handleChange} className="bg-white border-slate-200 text-[var(--foreground)]" />
                                </CardContent>
                                <CardFooter className="flex justify-between">
                                    <Button variant="ghost" onClick={handleBack} className="text-slate-500 hover:text-[var(--primary)]">{t("common.back")}</Button>
                                    <Button
                                        onClick={handleSubmit}
                                        isLoading={isLoading}
                                        disabled={!formData.ownerName || !formData.ownerPhone}
                                        className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white"
                                    >
                                        {t("owner.contact.submit")} <Check className="ml-2 w-4 h-4" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    )}

                    {step === 'SUCCESS' && (
                        <motion.div key="success" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
                            <div className="w-24 h-24 bg-[var(--accent)]/10 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-[var(--accent)]/20">
                                <Check className="w-12 h-12 text-[var(--accent)]" />
                            </div>
                            <h2 className="text-3xl font-bold text-[var(--foreground)] mb-2">{t("owner.success.title")}</h2>
                            <p className="text-slate-500 mb-8 max-w-xs mx-auto whitespace-pre-line">
                                {t("owner.success.description")}
                            </p>
                            <Button onClick={() => window.location.href = '/' + language} variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50">
                                {t("owner.success.home")}
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

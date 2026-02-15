'use client';


import { useState, useEffect, useRef } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, Building, FileText, Banknote, User, Image as ImageIcon, MapPin, PawPrint } from 'lucide-react';
import Image from 'next/image'; // For Logo
import Link from 'next/link';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import liff from '@line/liff';
import { useLanguage } from '../../context/LanguageContext';
import { LocationSelection } from '../../components/shared/LocationSelection'; // Shared Component
import { SelectionCard } from '../../components/shared/SelectionCard'; // Shared Component
import { ImageUpload } from '../../components/shared/ImageUpload'; // Shared Component

type Step = 'WELCOME' | 'PROJECT_LOCATION' | 'UNIT_TYPE' | 'DETAILS' | 'PETS_POLICIES' | 'PHOTOS' | 'CONTACT' | 'SUCCESS';

export default function OwnerPage() {
    const { t, currencySymbol, language } = useLanguage();
    const [step, setStep, isStepInitialized] = useLocalStorage<Step>('owner_form_step_v2', 'WELCOME');
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData, isDataInitialized] = useLocalStorage('owner_form_data_v2', {
        // Project & Location
        projectName: '',
        roomNumber: '', // New Field
        locationPreference: '', // Using same key as Renter for compatibility in LocationSelection, but will map to 'zone'

        // Unit Details
        unitType: '',
        sizeSqm: '',
        floor: '',
        roomDetails: '', // Additional details
        // isAvailable: 'Available' as 'Available' | 'Unavailable', // Removed as per request (default Available)

        // Price & Policy
        // rentalPrice: '', // Deprecated in favor of split pricing
        priceShort: '',
        priceMiddle: '',
        priceLong: '',
        rentalPeriod: 'long', // Keeps track of selected terms to show relevant inputs
        isPetFriendly: false,
        acceptedPets: [] as string[], // e.g., 'Cat', 'Dog', 'Exotic', 'All'
        facilities: [] as string[], // e.g., 'Internet', 'TV', 'Pool'

        // Photos
        images: [] as string[], // Base64 strings (Max 5)

        // Contact
        ownerName: '',
        ownerPhone: '',
        ownerLineId: '',
        lineUserId: '',
        lineDisplayName: '',
    });



    useEffect(() => {
        const initLiff = async () => {
            try {
                const liffId = process.env.NEXT_PUBLIC_LIFF_ID || '';
                if (!liffId || liffId === 'your_liff_id_here') {
                    console.warn('LIFF ID is missing. Skipping init.');
                    return;
                }
                await liff.init({ liffId });
                if (liff.isLoggedIn()) {
                    const profile = await liff.getProfile();
                    setFormData(prev => ({
                        ...prev,
                        lineUserId: profile.userId,
                        lineDisplayName: profile.displayName,
                        ownerName: prev.ownerName || profile.displayName,
                    }));
                }
            } catch (error) {
                console.error('LIFF Initialization failed', error);
            }
        };
        initLiff();
    }, []);

    // Spam Prevention
    const formStartTime = useRef(Date.now());
    const [honeypot, setHoneypot] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNext = () => {
        const steps: Step[] = ['WELCOME', 'PROJECT_LOCATION', 'UNIT_TYPE', 'DETAILS', 'PETS_POLICIES', 'PHOTOS', 'CONTACT', 'SUCCESS'];
        const currentIndex = steps.indexOf(step);

        // Validation Logic
        if (step === 'PHOTOS') {
            if (formData.images.length === 0) {
                alert(t("owner.photos.required") || "Please upload at least one photo.");
                return;
            }
        }

        if (currentIndex < steps.length - 1) {
            setStep(steps[currentIndex + 1]);
        }
    };

    const handleBack = () => {
        const steps: Step[] = ['WELCOME', 'PROJECT_LOCATION', 'UNIT_TYPE', 'DETAILS', 'PETS_POLICIES', 'PHOTOS', 'CONTACT', 'SUCCESS'];
        const currentIndex = steps.indexOf(step);
        if (currentIndex > 0) {
            setStep(steps[currentIndex - 1]);
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

            // Anti-Spam Checks
            const submissionTime = Date.now() - formStartTime.current;
            if (honeypot || submissionTime < 3000) {
                console.warn('Spam detected or too fast submission');
                // Fake success to fool bot
                setStep('SUCCESS');
                setIsLoading(false);
                return;
            }



            // Transform data for backend
            const payload = {
                ...formData,
                zone: formData.locationPreference, // Map to semantic name
                images: formData.images, // Send Base64 images array
                metadata: {
                    source: 'LIFF_OWNER_FORM',
                    submitted_at: new Date().toISOString()
                },
                secret: process.env.NEXT_PUBLIC_API_SECRET || '' // Add Security Key
            };

            const response = await fetch(gasUrl, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            setStep('SUCCESS');
            // Clear local storage after success
            localStorage.removeItem('owner_form_data_v2');
            localStorage.removeItem('owner_form_step_v2');
        } catch (error) {
            console.error('Submission failed', error);
            alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่');
        } finally {
            setIsLoading(false);
        }
    };

    const slideVariants = {
        hidden: { x: 20, opacity: 0 },
        visible: { x: 0, opacity: 1 },
        exit: { x: -20, opacity: 0 }
    };

    // Prevent hydration mismatch by checking if initialized
    if (!isStepInitialized || !isDataInitialized) {
        return null; // Or a loading spinner
    }

    return (
        <div className={`min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col items-center p-4 relative overflow-hidden font-sans ${step === 'WELCOME' ? 'justify-center' : 'pt-24 md:pt-32'}`}>
            {/* Background */}
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[var(--primary)]/5 via-transparent to-transparent -z-10" />

            {/* Honeypot Field (Hidden) */}
            <input
                type="text"
                name="website_website"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                style={{ display: 'none' }}
                tabIndex={-1}
                autoComplete="off"
            />

            {/* Header / Logo - Moved to Absolute Top Left */}
            <div className="absolute top-6 left-6 z-50">
                <Link href={`/${language}`} className="hover:opacity-80 transition-opacity block">
                    <Image
                        src="/images/logo.png"
                        alt="Nebles Logo"
                        width={150}
                        height={50}
                        className="h-12 w-auto object-contain"
                        priority
                    />
                </Link>
            </div>

            {/* Main Content Area - Centered by parent flex-col justify-center */}
            <div className="w-full max-w-2xl relative z-10">
                {/* Progress Bar */}
                {step !== 'WELCOME' && step !== 'SUCCESS' && (
                    <div className="mb-8">
                        <div className="flex justify-between text-xs text-slate-400 font-medium mb-2 uppercase tracking-wider">
                            <span>Project</span>
                            <span>Details</span>
                            <span>Photos</span>
                            <span>Contact</span>
                        </div>
                        <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-[var(--accent)]"
                                initial={{ width: 0 }}
                                animate={{ width: `${(['PROJECT_LOCATION', 'UNIT_TYPE', 'DETAILS', 'PETS_POLICIES', 'PHOTOS', 'CONTACT'].indexOf(step) + 1) / 6 * 100}%` }}
                            />
                        </div>
                    </div>
                )}

                <AnimatePresence mode="wait">
                    {/* STEP 1: WELCOME */}
                    {step === 'WELCOME' && (
                        <motion.div key="welcome" initial="hidden" animate="visible" exit="exit" variants={slideVariants}>
                            <Card className="border-0 shadow-2xl shadow-[var(--primary)]/10 bg-white/80 backdrop-blur-xl">
                                <CardHeader className="text-center pt-10 pb-2">
                                    <div className="mx-auto w-20 h-20 bg-[var(--primary)]/5 rounded-full flex items-center justify-center mb-6">
                                        <Building className="w-10 h-10 text-[var(--primary)]" />
                                    </div>
                                    <CardTitle className="text-3xl md:text-4xl font-serif font-bold text-[var(--foreground)]">
                                        {t("owner.welcome.title")}
                                    </CardTitle>
                                    <CardDescription className="text-slate-500 mt-4 text-lg">
                                        {t("owner.welcome.description")}
                                    </CardDescription>
                                </CardHeader>
                                <CardFooter className="pt-8 pb-10 px-8">
                                    <Button onClick={handleNext} className="w-full h-14 text-lg bg-[var(--primary)] hover:bg-[var(--primary)]/90 shadow-lg shadow-[var(--primary)]/20 rounded-xl" size="lg">
                                        {t("owner.welcome.action")} <ChevronRight className="ml-2" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    )}

                    {/* STEP 2: PROJECT & LOCATION */}
                    {step === 'PROJECT_LOCATION' && (
                        <motion.div key="project" initial="hidden" animate="visible" exit="exit" variants={slideVariants}>
                            <Card className="border-0 shadow-xl bg-white">
                                <CardHeader>
                                    <CardTitle className="font-serif text-2xl">Property & Location</CardTitle>
                                    <CardDescription>Where is your property located?</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Project Name</label>
                                        <Input
                                            placeholder="e.g. Noble Ploenchit"
                                            name="projectName"
                                            value={formData.projectName}
                                            onChange={handleChange}
                                            className="h-12 text-lg"
                                            autoFocus
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Room Number</label>
                                        <Input
                                            placeholder="e.g. 88/123"
                                            name="roomNumber"
                                            value={formData.roomNumber}
                                            onChange={handleChange}
                                            className="h-12 text-lg"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Zone (Select One)</label>
                                        <div className="max-h-[40vh] overflow-y-auto pr-2">
                                            <LocationSelection
                                                t={t}
                                                value={formData.locationPreference}
                                                onChange={(val) => setFormData(prev => ({ ...prev, locationPreference: val }))}
                                                mode="single"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-between pt-4">
                                    <Button variant="ghost" onClick={handleBack}>{t("common.back")}</Button>
                                    <Button onClick={handleNext} disabled={!formData.projectName || !formData.roomNumber || !formData.locationPreference}>
                                        {t("common.next")} <ChevronRight className="ml-2 w-4 h-4" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    )}

                    {/* STEP 3: UNIT TYPE */}
                    {step === 'UNIT_TYPE' && (
                        <motion.div key="unitType" initial="hidden" animate="visible" exit="exit" variants={slideVariants}>
                            <Card className="border-0 shadow-xl bg-white">
                                <CardHeader>
                                    <CardTitle className="font-serif text-2xl">Unit Type</CardTitle>
                                    <CardDescription>What kind of room is it?</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {['Studio', '1 Bedroom', '2 Bedrooms', 'Penthouse/Other'].map((type) => (
                                            <SelectionCard
                                                key={type}
                                                selected={formData.unitType === type}
                                                onClick={() => setFormData(p => ({ ...p, unitType: type }))}
                                                icon={type === 'Studio' ? '🛋️' : type === '1 Bedroom' ? '🛏️' : type === '2 Bedrooms' ? '🏡' : '✨'}
                                                title={type}
                                            />
                                        ))}
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-between pt-4">
                                    <Button variant="ghost" onClick={handleBack}>{t("common.back")}</Button>
                                    <Button onClick={handleNext} disabled={!formData.unitType}>
                                        {t("common.next")} <ChevronRight className="ml-2 w-4 h-4" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    )}

                    {/* STEP 4: DETAILS */}
                    {step === 'DETAILS' && (
                        <motion.div key="details" initial="hidden" animate="visible" exit="exit" variants={slideVariants}>
                            <Card className="border-0 shadow-xl bg-white">
                                <CardHeader>
                                    <CardTitle className="font-serif text-2xl">Room Details</CardTitle>
                                    <CardDescription>Size, availability, and highlights</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Size & Floor */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700">Size (sqm)</label>
                                            <Input
                                                type="number"
                                                name="sizeSqm"
                                                value={formData.sizeSqm}
                                                onChange={handleChange}
                                                placeholder="e.g. 35"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700">Floor</label>
                                            <Input
                                                name="floor"
                                                value={formData.floor}
                                                onChange={handleChange}
                                                placeholder="e.g. 12"
                                            />
                                        </div>
                                    </div>



                                    {/* Description */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Description / Highlights</label>
                                        <textarea
                                            name="roomDetails"
                                            value={formData.roomDetails}
                                            onChange={handleChange}
                                            className="w-full min-h-[100px] p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 text-slate-800 placeholder:text-slate-400"
                                            placeholder="Beautiful view, fully furnished, newly renovated... (Max 255 chars)"
                                            maxLength={255}
                                        />
                                        <div className="text-right text-xs text-slate-400">
                                            {formData.roomDetails.length} / 255
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-between pt-4">
                                    <Button variant="ghost" onClick={handleBack}>{t("common.back")}</Button>
                                    <Button onClick={handleNext}>{t("common.next")} <ChevronRight className="ml-2 w-4 h-4" /></Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    )}

                    {/* STEP 5: PETS & POLICIES */}
                    {step === 'PETS_POLICIES' && (
                        <motion.div key="pets" initial="hidden" animate="visible" exit="exit" variants={slideVariants}>
                            <Card className="border-0 shadow-xl bg-white">
                                <CardHeader>
                                    <CardTitle className="font-serif text-2xl">Price & Policies</CardTitle>
                                    <CardDescription>Rental price and pet policy</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-8">


                                    {/* Contract Terms Grouping */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-slate-700 flex items-center">
                                            <FileText className="w-4 h-4 mr-2" /> Minimum Contract
                                        </label>
                                        <p className="text-xs text-slate-400 mb-2">Select all that apply</p>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            {[
                                                { id: 'short', label: 'Short Term', sub: '1-5 Months' },
                                                { id: 'middle', label: 'Middle Term', sub: '6-11 Months' },
                                                { id: 'long', label: 'Long Term', sub: '1 Year+' },
                                            ].map((term) => (
                                                <SelectionCard
                                                    key={term.id}
                                                    selected={formData.rentalPeriod.includes(term.id)}
                                                    onClick={() => {
                                                        let current = formData.rentalPeriod ? formData.rentalPeriod.split(',').filter(Boolean) : [];
                                                        if (current.includes(term.id)) {
                                                            current = current.filter(c => c !== term.id);
                                                        } else {
                                                            current.push(term.id);
                                                        }
                                                        setFormData(p => ({ ...p, rentalPeriod: current.join(',') }));
                                                    }}
                                                    icon={term.id === 'short' ? '⚡' : term.id === 'middle' ? '🗓️' : '⏳'}
                                                    title={`${term.label} (${term.sub})`}
                                                    className="py-3"
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Dynamic Price Inputs */}
                                    <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        {(formData.rentalPeriod.includes('short') || formData.rentalPeriod.includes('middle') || formData.rentalPeriod.includes('long')) ? (
                                            <>
                                                <div className="text-sm font-bold text-slate-700">Set Prices (THB/Month)</div>
                                                {formData.rentalPeriod.includes('short') && (
                                                    <div className="relative">
                                                        <span className="absolute left-4 top-3 text-slate-400">⚡</span>
                                                        <Input
                                                            type="number"
                                                            name="priceShort"
                                                            value={formData.priceShort}
                                                            onChange={handleChange}
                                                            className="pl-10"
                                                            placeholder="Price for 1-5 Months"
                                                        />
                                                    </div>
                                                )}
                                                {formData.rentalPeriod.includes('middle') && (
                                                    <div className="relative">
                                                        <span className="absolute left-4 top-3 text-slate-400">🗓️</span>
                                                        <Input
                                                            type="number"
                                                            name="priceMiddle"
                                                            value={formData.priceMiddle}
                                                            onChange={handleChange}
                                                            className="pl-10"
                                                            placeholder="Price for 6-11 Months"
                                                        />
                                                    </div>
                                                )}
                                                {formData.rentalPeriod.includes('long') && (
                                                    <div className="relative">
                                                        <span className="absolute left-4 top-3 text-slate-400">⏳</span>
                                                        <Input
                                                            type="number"
                                                            name="priceLong"
                                                            value={formData.priceLong}
                                                            onChange={handleChange}
                                                            className="pl-10"
                                                            placeholder="Price for 1 Year+"
                                                        />
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="text-center text-slate-400 text-sm py-2">Select a contract term above to set prices</div>
                                        )}
                                    </div>

                                    {/* Facilities */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-slate-700 flex items-center">
                                            <Building className="w-4 h-4 mr-2" /> Facilities
                                        </label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {['Internet', 'TV', 'Pool', 'Gym', 'Workspace', 'Kitchen'].map((fac) => (
                                                <SelectionCard
                                                    key={fac}
                                                    selected={formData.facilities.includes(fac)}
                                                    onClick={() => {
                                                        const current = formData.facilities || [];
                                                        if (current.includes(fac)) {
                                                            setFormData(p => ({ ...p, facilities: current.filter(f => f !== fac) }));
                                                        } else {
                                                            setFormData(p => ({ ...p, facilities: [...current, fac] }));
                                                        }
                                                    }}
                                                    icon="✨"
                                                    title={fac}
                                                    className="py-2 px-3 text-sm"
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Pets */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-slate-700 flex items-center">
                                            <PawPrint className="w-4 h-4 mr-2" /> Pet Policy
                                        </label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <SelectionCard
                                                selected={!formData.isPetFriendly}
                                                onClick={() => setFormData(p => ({ ...p, isPetFriendly: false, acceptedPets: [] }))}
                                                icon="🚫"
                                                title="No Pets"
                                            />
                                            <SelectionCard
                                                selected={formData.isPetFriendly}
                                                onClick={() => setFormData(p => ({ ...p, isPetFriendly: true }))}
                                                icon="🐾"
                                                title="Pet Friendly"
                                            />
                                        </div>

                                        {/* Pet Types Selection */}
                                        <AnimatePresence>
                                            {formData.isPetFriendly && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="pl-2 pt-2"
                                                >
                                                    <p className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-wider">Accepted Pets</p>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                        {['Dog', 'Cat', 'Exotic', 'All'].map((pet) => (
                                                            <button
                                                                key={pet}
                                                                onClick={() => {
                                                                    const current = formData.acceptedPets || [];
                                                                    if (pet === 'All') {
                                                                        // If All is clicked, toggle it. If on, clear others? Or just set All. 
                                                                        // Let's say All implies everything.
                                                                        if (current.includes('All')) {
                                                                            setFormData(p => ({ ...p, acceptedPets: [] }));
                                                                        } else {
                                                                            setFormData(p => ({ ...p, acceptedPets: ['Dog', 'Cat', 'Exotic', 'All'] }));
                                                                        }
                                                                    } else {
                                                                        // Normal toggle
                                                                        let newPets: string[] = [...current];
                                                                        if (newPets.includes(pet)) {
                                                                            newPets = newPets.filter(p => p !== pet);
                                                                            // If unchecking something, remove 'All' if it exists
                                                                            newPets = newPets.filter(p => p !== 'All');
                                                                        } else {
                                                                            newPets.push(pet);
                                                                            // If Dog, Cat, and Exotic are all selected, auto-select All? Optional.
                                                                        }
                                                                        setFormData(p => ({ ...p, acceptedPets: newPets }));
                                                                    }
                                                                }}
                                                                className={`
                                                                    py-2 px-3 rounded-lg text-sm font-medium border transition-all
                                                                    ${formData.acceptedPets.includes(pet)
                                                                        ? 'bg-[var(--accent)] text-white border-[var(--accent)] shadow-md'
                                                                        : 'bg-white text-slate-500 border-slate-200 hover:border-[var(--accent)]/50'}
                                                                `}
                                                            >
                                                                {pet}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-between pt-4">
                                    <Button variant="ghost" onClick={handleBack}>{t("common.back")}</Button>
                                    <Button onClick={handleNext} disabled={
                                        (formData.rentalPeriod.includes('short') && !formData.priceShort) ||
                                        (formData.rentalPeriod.includes('middle') && !formData.priceMiddle) ||
                                        (formData.rentalPeriod.includes('long') && !formData.priceLong)
                                    }>
                                        {t("common.next")} <ChevronRight className="ml-2 w-4 h-4" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    )}

                    {/* STEP 6: PHOTOS */}
                    {step === 'PHOTOS' && (
                        <motion.div key="photos" initial="hidden" animate="visible" exit="exit" variants={slideVariants}>
                            <Card className="border-0 shadow-xl bg-white">
                                <CardHeader>
                                    <CardTitle className="font-serif text-2xl">Photos</CardTitle>
                                    <CardDescription>Upload up to 5 photos of your room</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <ImageUpload
                                        images={formData.images}
                                        onChange={(newImages) => setFormData(prev => ({ ...prev, images: newImages }))}
                                        maxImages={5}
                                    />
                                </CardContent>
                                <CardFooter className="flex justify-between pt-4">
                                    <Button variant="ghost" onClick={handleBack}>{t("common.back")}</Button>
                                    <Button onClick={handleNext}>
                                        {t("common.next")} <ChevronRight className="ml-2 w-4 h-4" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    )}

                    {/* STEP 7: CONTACT */}
                    {step === 'CONTACT' && (
                        <motion.div key="contact" initial="hidden" animate="visible" exit="exit" variants={slideVariants}>
                            <Card className="border-0 shadow-xl bg-white">
                                <CardHeader>
                                    <CardTitle className="font-serif text-2xl">Contact Information</CardTitle>
                                    <CardDescription>How can we contact you?</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Input label="Your Name" name="ownerName" value={formData.ownerName} onChange={handleChange} />
                                    <Input label="Phone Number" type="tel" name="ownerPhone" value={formData.ownerPhone} onChange={handleChange} />
                                    <Input label="Line ID" name="ownerLineId" value={formData.ownerLineId} onChange={handleChange} />
                                </CardContent>
                                <CardFooter className="flex justify-between pt-4">
                                    <Button variant="ghost" onClick={handleBack}>{t("common.back")}</Button>
                                    <Button
                                        onClick={handleSubmit}
                                        isLoading={isLoading}
                                        disabled={!formData.ownerName || !formData.ownerPhone}
                                        className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white shadow-lg"
                                    >
                                        Submit Listing <Check className="ml-2 w-4 h-4" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    )}

                    {/* STEP 8: SUCCESS */}
                    {step === 'SUCCESS' && (
                        <motion.div key="success" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
                            <div className="w-24 h-24 bg-[var(--accent)]/10 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-[var(--accent)]/20 shadow-lg shadow-[var(--accent)]/20">
                                <Check className="w-12 h-12 text-[var(--accent)]" />
                            </div>
                            <h2 className="text-3xl font-serif font-bold text-[var(--foreground)] mb-2">{t("owner.success.title")}</h2>
                            <p className="text-slate-500 mb-8 max-w-xs mx-auto text-lg">
                                {t("owner.success.description")}
                            </p>
                            <Button onClick={() => window.location.href = '/' + language} variant="outline" className="border-slate-300">
                                {t("owner.success.home")}
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

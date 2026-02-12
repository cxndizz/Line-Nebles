"use client";

import { motion } from "framer-motion";

interface WizardLayoutProps {
    currentStep: number;
    totalSteps: number;
    children: React.ReactNode;
    title: string;
    description?: string;
}

export function WizardLayout({ currentStep, totalSteps, children, title, description }: WizardLayoutProps) {
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 md:p-8">
            <div className="w-full max-w-4xl space-y-8">
                {/* Progress Indicator */}
                <div className="flex items-center justify-center space-x-4 mb-12">
                    {Array.from({ length: totalSteps }).map((_, index) => {
                        const stepNumber = index + 1;
                        const isActive = stepNumber === currentStep;
                        const isCompleted = stepNumber < currentStep;

                        return (
                            <div key={index} className="flex items-center">
                                <motion.div
                                    initial={false}
                                    animate={{
                                        scale: isActive ? 1.2 : 1,
                                        backgroundColor: isActive || isCompleted ? "var(--primary-gold)" : "rgba(15, 23, 42, 0.1)",
                                        borderColor: isActive ? "var(--primary-gold)" : "rgba(15, 23, 42, 0.2)",
                                    }}
                                    className={`
                    w-10 h-10 rounded-full flex items-center justify-center border-2 
                    text-sm font-bold transition-colors duration-300
                    ${isActive || isCompleted ? "text-white" : "text-slate-400"}
                  `}
                                >
                                    {isCompleted ? "✓" : stepNumber}
                                </motion.div>
                                {stepNumber < totalSteps && (
                                    <div className="w-12 h-1 mx-2 bg-slate-100 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-gold-gradient"
                                            initial={{ width: "0%" }}
                                            animate={{ width: isCompleted ? "100%" : "0%" }}
                                            transition={{ duration: 0.5 }}
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Content Area */}
                <div className="text-center space-y-4 mb-8">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-serif font-bold text-navy-900"
                    >
                        {title}
                    </motion.h1>
                    {description && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="text-lg text-slate-500"
                        >
                            {description}
                        </motion.p>
                    )}
                </div>

                <div className="w-full">
                    {children}
                </div>
            </div>
        </div>
    );
}

"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { translations, Language, Currency, currencySymbols } from "../lib/i18n/translations";
import { useParams } from 'next/navigation';

type Translations = typeof translations.en;

interface LanguageContextProps {
    language: Language;
    setLanguage: (lang: Language) => void;
    currency: Currency;
    setCurrency: (curr: Currency) => void;
    t: (path: string) => any;
    currencySymbol: string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const params = useParams();
    const [language, setLanguage] = useState<Language>("th");
    const [currency, setCurrency] = useState<Currency>("THB");

    // Load from localStorage on mount, but prefer URL params
    useEffect(() => {
        if (params?.lang && (params.lang === 'th' || params.lang === 'en' || params.lang === 'cn')) {
            setLanguage(params.lang as Language);
        } else {
            const savedLang = localStorage.getItem("language") as Language;
            if (savedLang) setLanguage(savedLang);
        }

        const savedCurr = localStorage.getItem("currency") as Currency;
        if (savedCurr) setCurrency(savedCurr);
    }, [params?.lang]);

    // Save to localStorage on change
    useEffect(() => {
        localStorage.setItem("language", language);
    }, [language]);

    useEffect(() => {
        localStorage.setItem("currency", currency);
    }, [currency]);

    // Translation function: t("landing.title") -> value
    const t = (path: string) => {
        const keys = path.split(".");
        let current: any = translations[language];

        for (const key of keys) {
            if (current[key] === undefined) {
                console.warn(`Translation missing for key: ${path} in language: ${language}`);
                return path;
            }
            current = current[key];
        }
        return current;
    };

    return (
        <LanguageContext.Provider
            value={{
                language,
                setLanguage,
                currency,
                setCurrency,
                t,
                currencySymbol: currencySymbols[currency],
            }}
        >
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
};

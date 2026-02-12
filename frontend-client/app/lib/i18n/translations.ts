import { en } from './en';
import { th } from './th';
import { cn } from './cn';

export const translations = {
    en,
    th,
    cn,
};

export type Language = 'en' | 'th' | 'cn';
export type Currency = 'THB' | 'USD' | 'CNY';

export const currencySymbols: Record<Currency, string> = {
    THB: '฿',
    USD: '$',
    CNY: '¥',
};

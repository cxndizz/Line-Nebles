"use client";

import React, { useState, useEffect } from 'react';
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    isToday,
    parseISO,
} from 'date-fns';
import { th, enUS, zhCN } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from './../ui/Button';
import { useLanguage } from '../../context/LanguageContext';

interface LuxuryCalendarProps {
    selected?: Date;
    onSelect?: (date: Date) => void;
    className?: string;
}

export function LuxuryCalendar({ selected, onSelect, className }: LuxuryCalendarProps) {
    const { language } = useLanguage();
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Map app language to date-fns locale
    const getLocale = () => {
        switch (language) {
            case 'th': return th;
            case 'cn': return zhCN;
            default: return enUS;
        }
    };

    const locale = getLocale();

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const renderHeader = () => {
        return (
            <div className="flex justify-between items-center mb-6 px-2">
                <button onClick={prevMonth} className="p-2 rounded-full hover:bg-slate-100 text-[var(--primary)] transition-colors">
                    <ChevronLeft size={20} />
                </button>
                <div className="text-xl font-serif font-bold text-[var(--primary)]">
                    {format(currentMonth, 'MMMM yyyy', { locale })}
                </div>
                <button onClick={nextMonth} className="p-2 rounded-full hover:bg-slate-100 text-[var(--primary)] transition-colors">
                    <ChevronRight size={20} />
                </button>
            </div>
        );
    };

    const renderDays = () => {
        const weekStart = startOfWeek(currentMonth, { locale });
        const days = [];

        for (let i = 0; i < 7; i++) {
            days.push(
                <div key={i} className="text-center text-xs font-bold text-[var(--accent)] uppercase tracking-wider py-2 font-serif opacity-80">
                    {format(new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + i), 'EE', { locale })}
                </div>
            );
        }

        return <div className="grid grid-cols-7 mb-2">{days}</div>;
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart, { locale });
        const endDate = endOfWeek(monthEnd, { locale });

        const dateFormat = "d";
        const rows = [];
        let days = [];
        let day = startDate;
        let formattedDate = "";

        const allDays = eachDayOfInterval({ start: startDate, end: endDate });

        return (
            <div className="grid grid-cols-7 gap-y-2 gap-x-1">
                {allDays.map((dayItem, idx) => {
                    formattedDate = format(dayItem, dateFormat);
                    const cloneDay = dayItem;
                    const isSelected = selected ? isSameDay(dayItem, selected) : false;
                    const isCurrentMonth = isSameMonth(dayItem, monthStart);

                    return (
                        <div key={idx} className="flex justify-center items-center aspect-square">
                            <button
                                disabled={!isCurrentMonth}
                                onClick={() => onSelect && onSelect(cloneDay)}
                                className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 relative",
                                    !isCurrentMonth ? "text-slate-200 pointer-events-none" : "text-slate-600 hover:bg-slate-50",
                                    isSelected && "bg-[var(--accent)] text-slate-900 shadow-lg shadow-[var(--accent)]/40 scale-110 font-bold",
                                    !isSelected && isToday(dayItem) && "text-[var(--accent)] font-bold ring-1 ring-[var(--accent)]"
                                )}
                            >
                                {formattedDate}
                                {isSelected && (
                                    <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse" />
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className={cn("p-6 bg-white/50 backdrop-blur-xl border border-white/60 rounded-[2rem] shadow-xl inline-block min-w-[320px]", className)}>
            {renderHeader()}
            {renderDays()}
            {renderCells()}
        </div>
    );
}

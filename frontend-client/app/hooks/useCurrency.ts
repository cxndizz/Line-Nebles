import { useState, useEffect } from 'react';

const API_URL = 'https://api.exchangerate-api.com/v4/latest/THB';

interface Rates {
    USD: number;
    CNY: number;
    THB: number;
    [key: string]: number;
}

export function useCurrency() {
    const [rates, setRates] = useState<Rates | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRates = async () => {
            try {
                // Check localStorage first
                const cached = localStorage.getItem('currency_rates');
                const cachedTime = localStorage.getItem('currency_timestamp');

                // Cache for 1 hour
                if (cached && cachedTime && (Date.now() - Number(cachedTime) < 3600000)) {
                    setRates(JSON.parse(cached));
                    setLoading(false);
                    return;
                }

                const res = await fetch(API_URL);
                const data = await res.json();

                if (data && data.rates) {
                    setRates(data.rates);
                    localStorage.setItem('currency_rates', JSON.stringify(data.rates));
                    localStorage.setItem('currency_timestamp', Date.now().toString());
                }
            } catch (error) {
                console.error("Failed to fetch currency rates", error);
                // Fallback rates if API fails
                setRates({ USD: 0.028, CNY: 0.2, THB: 1 });
            } finally {
                setLoading(false);
            }
        };

        fetchRates();
    }, []);

    const convert = (amountTHB: number, targetCurrency: 'USD' | 'CNY') => {
        if (!rates) return 0;
        const rate = rates[targetCurrency];
        return Math.round(amountTHB * rate);
    };

    const convertBack = (amountTarget: number, sourceCurrency: 'USD' | 'CNY') => {
        if (!rates) return 0;
        const rate = rates[sourceCurrency];
        // Prevent division by zero
        if (!rate) return 0;
        return Math.round(amountTarget / rate);
    };

    const formatCurrency = (amount: number, currency: 'USD' | 'CNY') => {
        const val = new Intl.NumberFormat('en-US').format(amount);
        return currency === 'USD' ? `$${val}` : `¥${val}`;
    };

    return { rates, loading, convert, convertBack, formatCurrency };
}

'use client';

import { motion, LayoutGroup } from 'framer-motion';
import { SelectionCard } from './SelectionCard';

interface LocationSelectionProps {
    t: (key: string) => string;
    value: string; // comma separated string
    onChange: (newValue: string) => void;
    mode?: 'single' | 'multi';
}

export function LocationSelection({ t, value, onChange, mode = 'multi' }: LocationSelectionProps) {
    const LOCATION_ZONES = [
        { id: 'thonglo_ekkamai', value: 'thonglo_ekkamai', icon: '🏙️' },
        { id: 'phromphong_asoke', value: 'phromphong_asoke', icon: '🏙️' },
        { id: 'siam_phloenchit', value: 'siam_phloenchit', icon: '🛍️' },
        { id: 'silom_sathorn', value: 'silom_sathorn', icon: '💼' },
        { id: 'ari_phayathai', value: 'ari_phayathai', icon: '☕' },
        { id: 'mrt_rama9', value: 'mrt_rama9', icon: '🚇' },
    ];

    // Helper to check if a zone is selected
    const isSelected = (val: string) => {
        if (!value) return false;
        const currentSelected = value.split(', ').filter(Boolean);
        return currentSelected.includes(val);
    };

    // Helper to toggle selection
    const toggleZone = (val: string) => {
        let newSelected: string[] = [];

        if (mode === 'single') {
            if (isSelected(val)) {
                // optional: allow deselecting
                newSelected = [];
            } else {
                newSelected = [val];
            }
        } else {
            // Multi mode
            const currentSelected = value ? value.split(', ').filter(Boolean) : [];
            if (currentSelected.includes(val)) {
                newSelected = currentSelected.filter((item: string) => item !== val);
            } else {
                newSelected = [...currentSelected, val];
            }
        }

        onChange(newSelected.join(', '));
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
            className="w-full max-w-5xl pb-10"
            variants={container}
            initial="hidden"
            animate="show"
        >
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
                </div>
            </LayoutGroup>
        </motion.div>
    );
}

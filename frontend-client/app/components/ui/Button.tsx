import { ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Loader2 } from 'lucide-react';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'luxury-gold' | 'luxury-navy';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
        const variants = {
            primary: 'bg-[var(--primary)] text-white shadow-md hover:bg-[var(--primary)]/90 hover:shadow-lg border-0',
            secondary: 'bg-slate-100 text-slate-900 border border-slate-200 hover:bg-slate-200 hover:border-slate-300 shadow-sm',
            outline: 'bg-transparent border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900',
            ghost: 'bg-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100',
            'luxury-gold': 'bg-gold-gradient text-[var(--primary)] font-bold shadow-lg shadow-gold/20 border-0 hover:shadow-xl hover:shadow-gold/30 hover:scale-[1.02]',
            'luxury-navy': 'bg-[var(--primary)] text-white border border-[var(--primary)] shadow-lg hover:bg-[var(--primary)]/90 hover:border-[var(--accent)] hover:text-[var(--accent)]',
        };

        const sizes = {
            sm: 'h-9 px-4 text-xs',
            md: 'h-11 px-6 text-sm',
            lg: 'h-14 px-8 text-base',
        };

        return (
            <button
                ref={ref}
                disabled={isLoading || props.disabled}
                className={cn(
                    'relative inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none',
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';

export { Button };

import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from './Button';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, ...props }, ref) => {
        return (
            <div className="space-y-2 w-full">
                {label && (
                    <label className="text-sm font-medium text-slate-700 ml-1">
                        {label}
                    </label>
                )}
                <div className="relative group">
                    <input
                        ref={ref}
                        className={cn(
                            'flex h-12 w-full rounded-xl bg-white border border-slate-200 px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm',
                            'focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] transition-all duration-200',
                            'hover:border-slate-300',
                            error && 'border-red-500 focus:ring-red-500/20 focus:border-red-500',
                            className
                        )}
                        {...props}
                    />
                </div>
                {error && (
                    <p className="text-xs text-red-600 ml-1">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export { Input };

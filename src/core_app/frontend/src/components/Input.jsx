import React from 'react';
import { cn } from '../lib/utils';

const Input = React.forwardRef(({ className, label, icon: Icon, error, ...props }, ref) => {
    return (
        <div className="space-y-1.5 w-full">
            {label && (
                <label className="text-xs font-semibold text-emerald-500/70 uppercase tracking-wider ml-1">
                    {label}
                </label>
            )}
            <div className="relative group">
                <input
                    ref={ref}
                    className={cn(
                        'w-full bg-[#06140e] border border-emerald-500/10 rounded-2xl py-3 pl-5 pr-12 text-white placeholder:text-emerald-900/50 focus:outline-none focus:border-emerald-500/40 focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none',
                        error && 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/5',
                        className
                    )}
                    {...props}
                />
                {Icon && (
                    <Icon
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500/40 group-focus-within:text-emerald-500 transition-colors"
                        size={18}
                    />
                )}
            </div>
            {error && <p className="text-[10px] text-red-400 ml-1">{error}</p>}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;

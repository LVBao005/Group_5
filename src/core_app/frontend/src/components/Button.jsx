import React from 'react';
import { cn } from '../lib/utils';

const Button = React.forwardRef(({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const variants = {
        primary: 'bg-[#00ff80] text-[#04110b] hover:bg-[#00e673] shadow-[0_0_20px_rgba(0,255,128,0.2)] hover:shadow-[0_0_30px_rgba(0,255,128,0.4)]',
        secondary: 'bg-emerald-900/20 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-900/40 hover:border-emerald-500/40',
        outline: 'bg-transparent border border-emerald-510/30 text-emerald-500 hover:border-emerald-500 hover:bg-emerald-500/5',
        ghost: 'bg-transparent text-emerald-500/70 hover:text-emerald-500 hover:bg-emerald-500/5',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs rounded-lg',
        md: 'px-5 py-2.5 text-sm rounded-xl',
        lg: 'px-8 py-4 text-base rounded-2xl font-bold',
        icon: 'p-2.5 rounded-xl',
    };

    return (
        <button
            ref={ref}
            className={cn(
                'inline-flex items-center justify-center transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none',
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
});

Button.displayName = 'Button';

export default Button;

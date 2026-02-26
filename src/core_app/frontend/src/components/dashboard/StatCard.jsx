import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

/**
 * StatCard Component - Displays a key metric with icon and trend
 */
const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    trend, 
    trendValue,
    format = 'number',
    color = 'emerald'
}) => {
    const formatValue = (val) => {
        if (format === 'currency') {
            return new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
            }).format(val);
        }
        return new Intl.NumberFormat('vi-VN').format(val);
    };

    const colorClasses = {
        emerald: 'from-emerald-500/10 to-emerald-600/5 border-emerald-500/20 text-emerald-400',
        blue: 'from-blue-500/10 to-blue-600/5 border-blue-500/20 text-blue-400',
        violet: 'from-violet-500/10 to-violet-600/5 border-violet-500/20 text-violet-400',
        amber: 'from-amber-500/10 to-amber-600/5 border-amber-500/20 text-amber-400',
        rose: 'from-rose-500/10 to-rose-600/5 border-rose-500/20 text-rose-400'
    };

    return (
        <div className={`bg-gradient-to-br ${colorClasses[color]} border rounded-3xl p-6 hover:scale-[1.02] transition-all duration-300 group`}>
            <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon size={24} className="text-white" />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-sm font-bold ${
                        trend === 'up' ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                        {trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                        {trendValue}
                    </div>
                )}
            </div>
            <div>
                <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2">
                    {title}
                </p>
                <p className="text-3xl font-black text-white truncate">
                    {formatValue(value)}
                </p>
            </div>
        </div>
    );
};

export default StatCard;

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

/**
 * RevenueChart Component - Line/Area chart for revenue over time
 */
const RevenueChart = ({ data, period = 'today' }) => {
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#1a1d1c] border border-white/10 rounded-2xl p-4 shadow-xl">
                    <p className="text-xs text-white/60 uppercase tracking-wider mb-2 font-bold">
                        {payload[0].payload.time}
                    </p>
                    <div className="space-y-1">
                        <p className="text-sm font-bold text-emerald-400">
                            Doanh thu: {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND'
                            }).format(payload[0].value)}
                        </p>
                        {payload[0].payload.orders !== undefined && (
                            <p className="text-sm font-bold text-blue-400">
                                Đơn hàng: {payload[0].payload.orders}
                            </p>
                        )}
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-[#161a19] border border-white/5 rounded-3xl p-6 h-full">
            <div className="mb-6">
                <h3 className="text-lg font-black text-white uppercase tracking-wide">
                    Biểu Đồ Doanh Thu
                </h3>
                <p className="text-xs text-white/40 font-bold uppercase tracking-widest mt-1">
                    {period === 'today' && 'Theo giờ trong ngày'}
                    {period === 'week' && '7 ngày qua'}
                    {period === 'month' && '30 ngày qua'}
                </p>
            </div>

            <div className="h-[300px]">
                {data && data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid 
                                strokeDasharray="3 3" 
                                stroke="rgba(255,255,255,0.05)" 
                                vertical={false}
                            />
                            <XAxis 
                                dataKey="time" 
                                stroke="rgba(255,255,255,0.2)"
                                style={{ fontSize: '11px', fontWeight: 'bold' }}
                                tick={{ fill: 'rgba(255,255,255,0.4)' }}
                            />
                            <YAxis 
                                stroke="rgba(255,255,255,0.2)"
                                style={{ fontSize: '11px', fontWeight: 'bold' }}
                                tick={{ fill: 'rgba(255,255,255,0.4)' }}
                                tickFormatter={(value) => {
                                    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                                    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                                    return value;
                                }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="#10b981"
                                strokeWidth={3}
                                fill="url(#revenueGradient)"
                                animationDuration={1000}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-white/20 font-bold uppercase tracking-widest text-sm">
                            Chưa có dữ liệu
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RevenueChart;

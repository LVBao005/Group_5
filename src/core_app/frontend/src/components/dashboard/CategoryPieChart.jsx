import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

/**
 * CategoryPieChart Component - Pie chart for revenue by category
 */
const CategoryPieChart = ({ data }) => {
    const COLORS = [
        '#10b981', // emerald
        '#3b82f6', // blue
        '#8b5cf6', // violet
        '#f59e0b', // amber
        '#ef4444', // rose
        '#06b6d4', // cyan
        '#ec4899', // pink
        '#84cc16'  // lime
    ];

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-[#1a1d1c] border border-white/10 rounded-2xl p-4 shadow-xl">
                    <p className="text-sm font-bold text-white mb-2">{data.name}</p>
                    <div className="space-y-1">
                        <p className="text-sm font-bold text-emerald-400">
                            {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND'
                            }).format(data.value)}
                        </p>
                        <p className="text-xs text-white/60 font-bold">
                            {data.orders} đơn hàng
                        </p>
                    </div>
                </div>
            );
        }
        return null;
    };

    const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        if (percent < 0.05) return null; // Don't show label for very small slices

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
                className="text-xs font-bold"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    const CustomLegend = ({ payload }) => {
        return (
            <div className="flex flex-wrap gap-3 justify-center mt-4">
                {payload.map((entry, index) => (
                    <div key={`legend-${index}`} className="flex items-center gap-2">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-xs font-bold text-white/70">
                            {entry.value}
                        </span>
                    </div>
                ))}
            </div>
        );
    };

    const totalRevenue = data?.reduce((sum, item) => sum + item.value, 0) || 0;

    return (
        <div className="bg-[#161a19] border border-white/5 rounded-3xl p-6 h-full">
            <div className="mb-4">
                <h3 className="text-lg font-black text-white uppercase tracking-wide">
                    Cơ Cấu Doanh Thu
                </h3>
                <p className="text-xs text-white/40 font-bold uppercase tracking-widest mt-1">
                    Theo nhóm sản phẩm
                </p>
            </div>

            <div className="h-[300px]">
                {data && data.length > 0 ? (
                    <>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={CustomLabel}
                                    outerRadius={100}
                                    innerRadius={60}
                                    fill="#8884d8"
                                    dataKey="value"
                                    animationDuration={1000}
                                >
                                    {data.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend content={<CustomLegend />} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="text-center mt-4">
                            <p className="text-xs text-white/40 font-bold uppercase tracking-widest">
                                Tổng doanh thu
                            </p>
                            <p className="text-2xl font-black text-emerald-400">
                                {new Intl.NumberFormat('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND'
                                }).format(totalRevenue)}
                            </p>
                        </div>
                    </>
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

export default CategoryPieChart;

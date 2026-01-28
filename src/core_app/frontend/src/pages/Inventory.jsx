import React, { useState } from 'react';
import {
    Package,
    Search,
    Filter,
    Plus,
    ArrowUpRight,
    ArrowDownRight,
    AlertTriangle,
    Calendar,
    MoreVertical,
    Pill,
    ChevronRight,
    User
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { MOCK_MEDICINES, MOCK_CATEGORIES } from '../mockData';
import { cn } from '../lib/utils';

const Inventory = () => {
    const [activeCategory, setActiveCategory] = useState(0);

    // Flatten medicines into batches for inventory view
    const inventoryItems = MOCK_MEDICINES.flatMap(medicine =>
        medicine.batches.map(batch => ({
            ...medicine,
            ...batch,
            // Calculate display stock: stock_std / conversion_rate
            boxQty: Math.floor(batch.stock_std / medicine.conversion_rate),
            subQty: batch.stock_std % medicine.conversion_rate
        }))
    ).filter(item => activeCategory === 0 || item.category_id === activeCategory);

    return (
        <div className="flex h-screen bg-[#0d0f0e] text-slate-200 overflow-hidden font-sans">
            <Sidebar />

            <main className="flex-1 flex flex-col min-w-0 bg-[#0d0f0e]">
                {/* Top Header */}
                <header className="h-20 flex items-center px-10 gap-8 shrink-0">
                    <h1 className="text-xl font-black text-white whitespace-nowrap uppercase tracking-widest">Kho dược phẩm</h1>

                    <div className="relative flex-1 max-w-xl group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#00ff80] transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm tên thuốc, mã lô, nhà sản xuất..."
                            className="w-full bg-[#1a1d1c] border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-[#00ff80]/20 transition-all text-white"
                        />
                    </div>

                    <div className="flex items-center gap-6 ml-auto">
                        <button className="bg-[#00ff80] hover:bg-[#00e673] text-[#04110b] font-black uppercase tracking-widest text-[10px] px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-[0_10px_20px_rgba(0,255,128,0.1)] active:scale-95">
                            <Plus size={16} strokeWidth={3} /> Nhập kho
                        </button>
                        <div className="w-px h-8 bg-white/5" />
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-black text-white leading-none">13:42:15</p>
                            <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest mt-1">Hôm nay</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/20 hover:text-white transition-colors cursor-pointer border border-white/5">
                            <User size={20} />
                        </div>
                    </div>
                </header>

                {/* Inventory Content */}
                <div className="flex-1 overflow-auto p-10 pt-4">
                    {/* Summary Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                        {[
                            { label: 'Tổng mặt hàng', value: MOCK_MEDICINES.length, icon: Package, color: 'text-white' },
                            { label: 'Sắp hết hạn', value: '12', icon: AlertTriangle, color: 'text-amber-500' },
                            { label: 'Dưới định mức', value: '05', icon: ArrowDownRight, color: 'text-rose-500' },
                            { label: 'Giá trị tồn kho', value: '1.2B', icon: TrendingUp, color: 'text-[#00ff80]' }
                        ].map((stat, i) => (
                            <div key={i} className="bg-[#161a19] border border-white/5 p-6 rounded-[2rem] relative overflow-hidden group hover:border-[#00ff80]/20 transition-all">
                                <div className="relative z-10">
                                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-3">{stat.label}</p>
                                    <p className={cn("text-3xl font-black tracking-tighter tabular-nums", stat.color)}>{stat.value}</p>
                                </div>
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-white/[0.02] group-hover:text-[#00ff80]/5 group-hover:scale-110 transition-all duration-700">
                                    {stat.icon && <stat.icon size={64} />}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Filters & Table */}
                    <div className="bg-[#161a19] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col">
                        <div className="p-8 border-b border-white/5 flex items-center justify-between">
                            <div className="flex gap-2 overflow-auto scrollbar-hide pb-1">
                                <button
                                    onClick={() => setActiveCategory(0)}
                                    className={cn(
                                        "px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border",
                                        activeCategory === 0 ? "bg-[#00ff80] border-[#00ff80] text-[#04110b]" : "bg-white/5 border-white/5 text-white/40 hover:text-white"
                                    )}
                                >
                                    Tất cả
                                </button>
                                {MOCK_CATEGORIES.map(cat => (
                                    <button
                                        key={cat.category_id}
                                        onClick={() => setActiveCategory(cat.category_id)}
                                        className={cn(
                                            "px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border shrink-0",
                                            activeCategory === cat.category_id ? "bg-[#00ff80] border-[#00ff80] text-[#04110b]" : "bg-white/5 border-white/5 text-white/40 hover:text-white"
                                        )}
                                    >
                                        {cat.category_name}
                                    </button>
                                ))}
                            </div>
                            <button className="flex items-center gap-2 text-[10px] font-black text-white/20 uppercase tracking-widest hover:text-white transition-colors">
                                <Filter size={14} /> Lọc nâng cao
                            </button>
                        </div>

                        <div className="overflow-auto min-h-[400px]">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">
                                        <th className="py-6 px-10">Dược phẩm & Lô</th>
                                        <th className="py-6">Ngày hết hạn</th>
                                        <th className="py-6 text-right">Giá nhập</th>
                                        <th className="py-6 text-center">Tồn kho hiện tại</th>
                                        <th className="py-6 px-10 text-right">Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {inventoryItems.map((item, idx) => (
                                        <tr key={`${item.medicine_id}-${item.batch_id}`} className="group hover:bg-white/[0.01] transition-colors">
                                            <td className="py-6 px-10">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/20 group-hover:bg-[#00ff80]/10 group-hover:text-[#00ff80] transition-all duration-500">
                                                        <Pill size={22} />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-white text-sm mb-1 group-hover:text-[#00ff80] transition-colors">{item.name}</p>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-[10px] text-[#00ff80]/60 font-black uppercase bg-[#00ff80]/5 px-2 py-0.5 rounded-md">Lô: {item.batch_number}</span>
                                                            <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">{item.brand}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-6">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={14} className="text-white/10" />
                                                    <span className={cn(
                                                        "text-xs font-bold tabular-nums",
                                                        new Date(item.expiry_date) < new Date('2026-06-01') ? "text-amber-500" : "text-white/40"
                                                    )}>
                                                        {new Date(item.expiry_date).toLocaleDateString('vi-VN')}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-6 text-right">
                                                <p className="text-sm font-black text-white tabular-nums tracking-tighter">{item.import_price_package.toLocaleString()}</p>
                                                <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">đ / {item.base_unit}</p>
                                            </td>
                                            <td className="py-6">
                                                <div className="flex flex-col items-center">
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-xl font-black text-[#00ff80] tabular-nums tracking-tighter">{item.boxQty}</span>
                                                        <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">{item.base_unit}</span>
                                                    </div>
                                                    {item.subQty > 0 && (
                                                        <div className="flex items-baseline gap-1.5 opacity-40">
                                                            <Plus size={8} className="text-[#00ff80]" />
                                                            <span className="text-xs font-bold text-white tabular-nums">{item.subQty}</span>
                                                            <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest">{item.sub_unit}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-6 px-10 text-right">
                                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00ff80]/10 border border-[#00ff80]/10">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-[#00ff80] animate-pulse" />
                                                    <span className="text-[9px] font-black text-[#00ff80] uppercase tracking-[0.2em]">Đang kinh doanh</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

// Placeholder icons helper
const TrendingUp = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
);

export default Inventory;

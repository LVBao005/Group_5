import React from 'react';
import {
    LayoutDashboard,
    Search,
    User,
    TrendingUp,
    Package,
    Users,
    Receipt
} from 'lucide-react';
import Sidebar from '../components/Sidebar';

const Dashboard = () => {
    return (
        <div className="flex h-screen bg-[#0d0f0e] text-slate-200 overflow-hidden font-sans">
            <Sidebar />

            <main className="flex-1 flex flex-col min-w-0 bg-[#0d0f0e]">
                {/* Top Header */}
                <header className="h-20 flex items-center px-10 gap-8 shrink-0">
                    <h1 className="text-xl font-black text-white whitespace-nowrap uppercase tracking-widest">Dashboard</h1>

                    <div className="relative flex-1 max-w-xl group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#00ff80] transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm báo cáo, khách hàng..."
                            className="w-full bg-[#1a1d1c] border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-[#00ff80]/20 transition-all text-white"
                        />
                    </div>

                    <div className="flex items-center gap-6 ml-auto">
                        <div className="text-right">
                            <p className="text-sm font-black text-white leading-none">13:40:00</p>
                            <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest mt-1">Thứ Tư, 28 Tháng 1, 2026</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/20 hover:text-white transition-colors cursor-pointer border border-white/5">
                            <User size={20} />
                        </div>
                    </div>
                </header>

                {/* Dashboard Content Placeholder */}
                <div className="flex-1 overflow-auto p-10 pt-4 flex flex-col items-center justify-center">
                    <div className="max-w-4xl w-full text-center space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="inline-flex p-6 rounded-[2.5rem] bg-white/5 border border-white/10 text-white/10 mb-8">
                            <LayoutDashboard size={80} strokeWidth={1} />
                        </div>
                        <div>
                            <h2 className="text-4xl font-black text-white mb-4 tracking-tighter">HỆ THỐNG PHÂN TÍCH DỮ LIỆU</h2>
                            <p className="text-white/30 font-bold uppercase tracking-[0.3em] text-xs">Phần tính năng này đang được phát triển</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-12">
                            {[
                                { label: 'Doanh thu', icon: TrendingUp, val: '0 đ' },
                                { label: 'Sản phẩm', icon: Package, val: '50+' },
                                { label: 'Khách hàng', icon: Users, val: '1,200' },
                                { label: 'Hóa đơn', icon: Receipt, val: '0' }
                            ].map((stat, i) => (stat.icon && (
                                <div key={i} className="bg-[#161a19] border border-white/5 rounded-3xl p-6 text-left group hover:border-[#00ff80]/30 transition-all">
                                    <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 group-hover:bg-[#00ff80]/10 group-hover:text-[#00ff80] transition-all mb-4">
                                        <stat.icon size={20} />
                                    </div>
                                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">{stat.label}</p>
                                    <p className="text-xl font-black text-white">{stat.val}</p>
                                </div>
                            )))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;

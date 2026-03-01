import React from 'react';
import {
    Bell,
    Search,
    User,
    ShieldAlert,
    Zap,
    Clock,
    Settings
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { cn } from '../lib/utils';
import LiveClock from '../components/common/LiveClock';

const Alerts = () => {
    return (
        <div className="flex h-screen bg-[#0d0f0e] text-slate-200 overflow-hidden font-sans">
            <Sidebar />

            <main className="flex-1 flex flex-col min-w-0 bg-[#0d0f0e]">
                {/* Top Header */}
                <header className="h-20 flex items-center px-10 gap-8 shrink-0">
                    <h1 className="text-xl font-black text-white whitespace-nowrap uppercase tracking-widest">Trung tâm cảnh báo</h1>

                    <div className="relative flex-1 max-w-xl group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#00ff80] transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm thông báo, sự cố..."
                            className="w-full bg-[#1a1d1c] border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-[#00ff80]/20 transition-all text-white"
                        />
                    </div>

                    <div className="flex items-center gap-6 ml-auto">
                        <LiveClock />
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/20 hover:text-white transition-colors cursor-pointer border border-white/5">
                            <User size={20} />
                        </div>
                    </div>
                </header>

                {/* Alerts Content Placeholder */}
                <div className="flex-1 overflow-auto p-10 pt-4 flex flex-col items-center justify-center text-center">
                    <div className="max-w-4xl w-full space-y-12 animate-in fade-in zoom-in duration-700">
                        <div className="inline-flex p-8 rounded-[3rem] bg-amber-500/5 border border-amber-500/10 text-amber-500/20 mb-4">
                            <Bell size={100} strokeWidth={1} />
                        </div>
                        <div>
                            <h2 className="text-5xl font-black text-white mb-6 tracking-tighter">TRUNG TÂM GIÁM SÁT</h2>
                            <p className="text-white/20 font-bold uppercase tracking-[0.4em] text-xs">Phần tính năng này đang được thiết lập</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10">
                            {[
                                { label: 'Sắp hết hạn', icon: Clock, color: 'text-amber-500' },
                                { label: 'Sắp hết hàng', icon: Zap, color: 'text-blue-500' },
                                { label: 'Bảo mật', icon: ShieldAlert, color: 'text-rose-500' }
                            ].map((stat, i) => (
                                <div key={i} className="bg-[#161a19] border border-white/5 rounded-[2rem] p-8 text-left group hover:border-white/20 transition-all">
                                    <div className={cn("w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-500", stat.color)}>
                                        <stat.icon size={24} />
                                    </div>
                                    <p className="text-[11px] font-black text-white/20 uppercase tracking-widest mb-2">{stat.label}</p>
                                    <p className="text-sm font-bold text-white/60 italic">Chưa có thông báo mới</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Alerts;

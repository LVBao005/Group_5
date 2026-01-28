import React, { useState } from 'react';
import {
    Receipt,
    Search,
    User,
    Printer,
    History,
    FileText,
    CreditCard,
    Wallet
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { MOCK_INVOICES, MOCK_CUSTOMERS } from '../mockData';
import { cn } from '../lib/utils';

const Invoices = () => {
    const [showDetails, setShowDetails] = useState(false);

    return (
        <div className="flex h-screen bg-[#0d0f0e] text-slate-200 overflow-hidden font-sans">
            <Sidebar />

            <main className="flex-1 flex flex-col min-w-0 bg-[#0d0f0e]">
                {/* Top Header */}
                <header className="h-20 flex items-center px-10 gap-8 shrink-0">
                    <h1 className="text-xl font-black text-white whitespace-nowrap uppercase tracking-widest">Hóa đơn hệ thống</h1>

                    <div className="relative flex-1 max-w-xl group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#00ff80] transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm mã hóa đơn, SĐT khách..."
                            className="w-full bg-[#1a1d1c] border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-[#00ff80]/20 transition-all text-white"
                        />
                    </div>

                    <div className="flex items-center gap-6 ml-auto">
                        <div className="text-right">
                            <p className="text-sm font-black text-white leading-none">13:52:10</p>
                            <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest mt-1">Hôm nay</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/20 hover:text-white transition-colors cursor-pointer border border-white/5">
                            <User size={20} />
                        </div>
                    </div>
                </header>

                {/* Placeholder Style Content (like Dashboard) */}
                <div className="flex-1 overflow-auto p-10 pt-4 flex flex-col items-center justify-center text-center">
                    {!showDetails ? (
                        <div className="max-w-4xl w-full space-y-12 animate-in fade-in slide-in-from-top-4 duration-700">
                            <div className="inline-flex p-8 rounded-[3rem] bg-[#00ff80]/5 border border-[#00ff80]/10 text-[#00ff80]/20 mb-4 shadow-[0_0_50px_rgba(0,255,128,0.05)]">
                                <Receipt size={100} strokeWidth={1} />
                            </div>
                            <div>
                                <h2 className="text-5xl font-black text-white mb-6 tracking-tighter">QUẢN LÝ GIAO DỊCH</h2>
                                <p className="text-white/20 font-bold uppercase tracking-[0.4em] text-xs mb-10">Lịch sử hóa đơn và chứng từ thanh toán</p>

                                <button
                                    onClick={() => setShowDetails(true)}
                                    className="bg-[#00ff80] hover:bg-[#00e673] text-[#04110b] font-black uppercase tracking-[0.2em] text-xs px-12 py-5 rounded-2xl shadow-[0_20px_40px_rgba(0,255,128,0.15)] transition-all transform active:scale-95"
                                >
                                    Xem danh sách chi tiết
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
                                {[
                                    { label: 'Hóa đơn tháng', icon: History, val: MOCK_INVOICES.length },
                                    { label: 'Doanh thu', icon: Wallet, val: MOCK_INVOICES[0].total_amount.toLocaleString() + ' đ' },
                                    { label: 'Yêu cầu in', icon: Printer, val: '0' }
                                ].map((stat, i) => (
                                    <div key={i} className="bg-[#161a19] border border-white/5 rounded-[2rem] p-8 text-left group hover:border-[#00ff80]/20 transition-all">
                                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 group-hover:bg-[#00ff80]/10 group-hover:text-[#00ff80] transition-all mb-6">
                                            <stat.icon size={24} />
                                        </div>
                                        <p className="text-[11px] font-black text-white/20 uppercase tracking-widest mb-2">{stat.label}</p>
                                        <p className="text-2xl font-black text-white tabular-nums tracking-tighter">{stat.val}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        /* Real Invoices List (Simplified functional view) */
                        <div className="w-full max-w-6xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center justify-between mb-6 px-10">
                                <h3 className="text-2xl font-black text-white tracking-widest">DANH SÁCH CHI TIẾT</h3>
                                <button onClick={() => setShowDetails(false)} className="text-[10px] font-black text-white/20 hover:text-[#00ff80] uppercase tracking-widest transition-colors flex items-center gap-2">
                                    Quay lại tổng quan <ChevronRight size={14} />
                                </button>
                            </div>
                            {MOCK_INVOICES.map(invoice => {
                                const customer = MOCK_CUSTOMERS.find(c => c.customer_id === invoice.customer_id);
                                return (
                                    <div key={invoice.invoice_id} className="bg-[#161a19] border border-white/5 rounded-[2.5rem] p-8 flex items-center gap-10 hover:border-white/20 transition-all text-left group relative overflow-hidden">
                                        <div className="w-16 h-16 bg-white/5 rounded-[1.5rem] flex items-center justify-center text-[#00ff80]/30 group-hover:bg-[#00ff80] group-hover:text-[#04110b] transition-all duration-500">
                                            <FileText size={28} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">Mã HD: {invoice.invoice_id}</p>
                                            <h4 className="text-xl font-black text-white mb-2">{customer?.name}</h4>
                                            <span className="text-[10px] text-white/20 font-bold tracking-widest uppercase">{new Date(invoice.sale_date).toLocaleString('vi-VN')}</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-3xl font-black text-[#00ff80] tracking-tighter tabular-nums">{invoice.total_amount.toLocaleString()} <span className="text-xs">đ</span></p>
                                            <p className="text-[10px] text-white/20 font-black uppercase tracking-widest mt-1">Thanh toán tiền mặt</p>
                                        </div>
                                        <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-[#00ff80] opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

// ChevronRight helper
const ChevronRightIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
);

export default Invoices;

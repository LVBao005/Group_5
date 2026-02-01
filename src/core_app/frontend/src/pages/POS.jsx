import React, { useState } from 'react';
import {
    Search,
    ShoppingCart,
    Plus,
    Minus,
    User,
    Pill,
    FlaskConical,
    Thermometer,
    Heart,
    PackageSearch,
    CheckCircle,
    X,
    Trash2,
    Printer,
    ChevronRight,
    ShieldCheck,
    Banknote,
    Users
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { MOCK_MEDICINES, MOCK_CATEGORIES, MOCK_BRANCHES } from '../mockData';
import { cn } from '../lib/utils';
import { invoiceService } from '../services/invoiceService';

const POS = () => {
    const [activeCategory, setActiveCategory] = useState(0); // 0 = Tất cả
    const [cart, setCart] = useState([]);
    const [quantities, setQuantities] = useState({}); // Local state for cards quantity inputs
    const [showInvoice, setShowInvoice] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [phone, setPhone] = useState('');

    // Get current user and branch for the invoice
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const branch = MOCK_BRANCHES.find(b => b.branch_id === user?.branch_id);

    const filteredMedicines = activeCategory === 0
        ? MOCK_MEDICINES
        : MOCK_MEDICINES.filter(m => m.category_id === activeCategory);

    const getIcon = (type) => {
        switch (type) {
            case 'pill': return Pill;
            case 'flask': return FlaskConical;
            case 'thermometer': return Thermometer;
            case 'heart': return Heart;
            default: return Pill;
        }
    };

    const handleUpdateLocalQty = (id, delta) => {
        setQuantities(prev => ({
            ...prev,
            [id]: Math.max(1, (prev[id] || 1) + delta)
        }));
    };

    const addToCart = (medicine) => {
        const qty = quantities[medicine.medicine_id] || 1;
        const existing = cart.find(item => item.medicine_id === medicine.medicine_id);

        if (existing) {
            setCart(cart.map(item =>
                item.medicine_id === medicine.medicine_id
                    ? { ...item, quantity: item.quantity + qty }
                    : item
            ));
        } else {
            setCart([...cart, {
                ...medicine,
                quantity: qty,
                price: medicine.base_sell_price // Default to base unit in this view
            }]);
        }
        // Reset quantity input on card
        setQuantities(prev => ({ ...prev, [medicine.medicine_id]: 1 }));
    };

    const totalAmount = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const handleCheckout = () => {
        if (cart.length > 0) {
            setShowInvoice(true);
        }
    };

    const confirmPayment = async () => {
        setLoading(true);

        // Construct SQL-aligned payload
        const payload = {
            branch_id: user?.branch_id || 1,
            pharmacist_id: user?.pharmacist_id || 1,
            customer_id: null, // Backend can resolve by phone if provided
            total_amount: totalAmount,
            sale_date: new Date().toISOString(),
            details: cart.map(item => ({
                batch_id: item.batches[0]?.batch_id,
                unit_sold: item.base_unit,
                quantity_sold: item.quantity,
                unit_price: item.price,
                total_std_quantity: item.quantity * item.conversion_rate
            }))
        };

        try {
            // Call the API service
            await invoiceService.createInvoice(payload);

            // Success feedback
            setSuccess(true);
            setTimeout(() => {
                setCart([]);
                setShowInvoice(false);
                setSuccess(false);
                setPhone('');
                setLoading(false);
            }, 1500);
        } catch (error) {
            console.error('API Error:', error);
            alert('Lỗi khi đẩy dữ liệu xuống Backend! (Kiểm tra Console)');
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-[#0d0f0e] text-slate-200 overflow-hidden font-sans">
            <Sidebar />

            <main className="flex-1 flex flex-col min-w-0 bg-[#0d0f0e]">
                {/* Top Header */}
                <header className="h-20 flex items-center px-10 gap-8 shrink-0">
                    <h1 className="text-xl font-black text-white whitespace-nowrap">Bán hàng tại quầy</h1>

                    <div className="relative flex-1 max-w-xl group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#00ff80] transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm tên thuốc, mã vạch..."
                            className="w-full bg-[#1a1d1c] border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-[#00ff80]/20 transition-all text-white"
                        />
                    </div>

                    <div className="flex items-center gap-6 ml-auto">
                        <div className="text-right">
                            <p className="text-sm font-black text-white leading-none">13:06:20</p>
                            <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest mt-1">Thứ Tư, 28 Tháng 1, 2026</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/20 hover:text-white transition-colors cursor-pointer border border-white/5">
                            <User size={20} />
                        </div>
                    </div>
                </header>

                {/* Categories Bar */}
                <div className="px-10 py-4 flex gap-3 overflow-auto scrollbar-hide shrink-0">
                    <button
                        onClick={() => setActiveCategory(0)}
                        className={cn(
                            "px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all border",
                            activeCategory === 0 ? "bg-[#00ff80] border-[#00ff80] text-[#04110b] shadow-[0_0_20px_rgba(0,255,128,0.2)]" : "bg-white/5 border-white/5 text-white/40 hover:text-white"
                        )}
                    >
                        Tất cả
                    </button>
                    {MOCK_CATEGORIES.map(cat => (
                        <button
                            key={cat.category_id}
                            onClick={() => setActiveCategory(cat.category_id)}
                            className={cn(
                                "px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all border",
                                activeCategory === cat.category_id ? "bg-[#00ff80] border-[#00ff80] text-[#04110b]" : "bg-white/5 border-white/5 text-white/40 hover:text-white"
                            )}
                        >
                            {cat.category_name}
                        </button>
                    ))}
                </div>

                {/* Product Grid */}
                <div className="flex-1 overflow-auto p-10 pt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6 content-start">
                    {filteredMedicines.map(medicine => {
                        const Icon = getIcon(medicine.icon);
                        const localQty = quantities[medicine.medicine_id] || 1;
                        return (
                            <div key={medicine.medicine_id} className="bg-[#161a19] border border-white/5 rounded-3xl p-6 flex flex-col hover:border-[#00ff80]/30 transition-all group overflow-hidden relative">
                                {/* Category Tag */}
                                <div className="absolute top-4 right-4 bg-white/5 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded text-white/30 group-hover:bg-[#00ff80]/10 group-hover:text-[#00ff80] transition-all">
                                    {medicine.category_name}
                                </div>

                                {/* Top Icon */}
                                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/20 mb-6 group-hover:bg-[#00ff80]/10 group-hover:text-[#00ff80] group-hover:scale-110 transition-all duration-500">
                                    <Icon size={24} />
                                </div>

                                <h3 className="text-base font-black text-white mb-2">{medicine.name}</h3>
                                <div className="flex items-baseline gap-1 mb-8">
                                    <span className="text-xl font-black text-[#00ff80] tracking-tighter">{medicine.base_sell_price.toLocaleString()}</span>
                                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">VNĐ / {medicine.base_unit}</span>
                                </div>

                                {/* Qty Selector */}
                                <div className="mt-auto grid grid-cols-1 gap-3">
                                    <div className="flex items-center justify-between bg-[#0d0f0e] border border-white/5 rounded-2xl p-1.5 px-3">
                                        <button
                                            onClick={() => handleUpdateLocalQty(medicine.medicine_id, -1)}
                                            className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-[#00ff80] hover:bg-white/10 transition-all font-bold"
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <span className="font-black text-white tabular-nums">{localQty}</span>
                                        <button
                                            onClick={() => handleUpdateLocalQty(medicine.medicine_id, 1)}
                                            className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-[#00ff80] hover:bg-white/10 transition-all font-bold"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => addToCart(medicine)}
                                        className="w-full bg-[#00ff80] hover:bg-[#00e673] text-[#04110b] font-black uppercase tracking-widest text-[11px] py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-[0_10px_20px_rgba(0,255,128,0.1)] active:scale-95"
                                    >
                                        <ShoppingCart size={16} strokeWidth={3} /> Thêm vào giỏ
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>

            {/* Right Sidebar: Cart Panel */}
            <aside className="w-[440px] border-l border-white/5 bg-[#0d0f0e] flex flex-col shrink-0 p-8">
                <div className="bg-[#161a19] border border-white/5 rounded-[2.5rem] flex-1 flex flex-col p-8 shadow-2xl overflow-hidden relative">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-black text-white">Giỏ hàng</h2>
                            <div className="bg-[#00ff80]/10 text-[#00ff80] text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border border-[#00ff80]/20">
                                {cart.length} món
                            </div>
                        </div>
                        {cart.length > 0 && (
                            <button
                                onClick={() => setCart([])}
                                className="p-2.5 rounded-xl bg-red-500/10 text-red-500/60 hover:text-red-500 hover:bg-red-500/20 transition-all group flex items-center justify-center"
                                title="Xóa tất cả"
                            >
                                <Trash2 size={18} />
                            </button>
                        )}
                    </div>

                    {/* Cart Items List */}
                    <div className="flex-1 overflow-auto -mx-2 px-2 scrollbar-hide py-2">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-white/10 gap-6 opacity-30">
                                <PackageSearch size={80} strokeWidth={1} />
                                <p className="font-black uppercase tracking-[0.2em] text-sm">Giỏ hàng trống</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {cart.map(item => (
                                    <div key={item.medicine_id} className="bg-white/[0.02] border border-white/5 rounded-3xl p-5 flex items-center gap-4 hover:border-white/10 transition-all group">
                                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/40 group-hover:text-[#00ff80] transition-colors">
                                            {React.createElement(getIcon(item.icon), { size: 20 })}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-white text-sm truncate">{item.name}</p>
                                            <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-0.5">{item.quantity} x {item.price.toLocaleString()}đ</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-white tabular-nums tracking-tighter">{(item.price * item.quantity).toLocaleString()}</p>
                                        </div>
                                        <button
                                            onClick={() => setCart(cart.filter(i => i.medicine_id !== item.medicine_id))}
                                            className="bg-red-500/10 text-red-500 p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Bottom Panel */}
                    <div className="mt-8 pt-8 border-t border-white/5 space-y-6">
                        <div className="space-y-3">
                            <div className="relative group">
                                <input
                                    type="text"
                                    placeholder="Số điện thoại khách hàng"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full bg-[#0d0f0e] border border-white/5 rounded-2xl py-3.5 px-6 text-sm focus:outline-none focus:border-[#00ff80]/30 transition-all text-white placeholder:text-white/10"
                                />
                            </div>
                            <div className="flex justify-between items-center px-2">
                                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Tạm tính</span>
                                <span className="font-black text-white/40 tabular-nums">{totalAmount.toLocaleString()} đ</span>
                            </div>
                            <div className="flex justify-between items-end px-2 pt-2">
                                <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Tổng thanh toán</span>
                                <span className="text-3xl font-black text-[#00ff80] tracking-tighter tabular-nums leading-none">
                                    {totalAmount.toLocaleString()} <span className="text-xs ml-1 font-black">đ</span>
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={handleCheckout}
                            className="w-full bg-[#00ff80] hover:bg-[#00e673] text-[#04110b] font-black uppercase tracking-[0.2em] text-sm py-5 rounded-2xl shadow-[0_15px_30px_rgba(0,255,128,0.2)] transition-all transform active:scale-[0.98] disabled:opacity-20 flex items-center justify-center gap-3"
                            disabled={cart.length === 0}
                        >
                            <CheckCircle size={20} strokeWidth={3} />
                            Xuất hóa đơn
                        </button>
                    </div>
                </div>
            </aside>

            {/* CHECKOUT MODAL */}
            {showInvoice && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-12">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => !loading && setShowInvoice(false)} />

                    {/* Modal Content */}
                    <div className="relative bg-[#161a19] border border-white/10 w-full max-w-2xl rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col transform transition-all animate-in fade-in zoom-in duration-300">
                        {/* Header */}
                        <div className="p-10 pb-6 border-b border-white/5 flex items-start justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle size={20} className="text-[#00ff80]" />
                                    <span className="text-[10px] font-black text-[#00ff80] uppercase tracking-[0.3em]">Hệ thống xác nhận</span>
                                </div>
                                <h2 className="text-3xl font-black text-white tracking-tight">Chi tiết hóa đơn</h2>
                                <p className="text-xs text-white/20 font-bold mt-1 uppercase tracking-widest">Mã HD: #{Math.floor(Math.random() * 900000) + 100000}</p>
                            </div>
                            <button onClick={() => !loading && setShowInvoice(false)} className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/20 hover:text-white hover:bg-white/10 transition-all">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-10 flex-1 overflow-auto space-y-8">
                            {/* Meta Info */}
                            <div className="grid grid-cols-3 gap-8 p-6 bg-white/5 rounded-[2rem] border border-white/5 relative overflow-hidden group">
                                <div className="absolute -right-8 -top-8 text-white/[0.02] scale-150 rotate-12 transition-transform group-hover:scale-125 duration-1000">
                                    <ShieldCheck size={120} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-2">Dược sĩ phụ trách</p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-[#00ff80]/10 flex items-center justify-center text-[#00ff80]">
                                            <User size={16} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-white">{user?.fullName || 'BẢO'}</p>
                                            <p className="text-[10px] text-[#00ff80] font-black uppercase">Pharmacist</p>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-2">Khách hàng</p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-[#00ff80]/10 flex items-center justify-center text-[#00ff80]">
                                            <Users size={16} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-white tracking-widest tabular-nums">{phone || 'KHÁCH VÃNG LAI'}</p>
                                            <p className="text-[10px] text-[#00ff80] font-black uppercase tracking-widest">Customer</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-2">Chi nhánh</p>
                                    <p className="text-sm font-black text-white uppercase">{branch?.branch_name || 'Quầy số 01'}</p>
                                    <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest mt-0.5">{branch?.address || '123 Lê Lợi, Q1, HCM'}</p>
                                </div>
                            </div>

                            {/* Items Table */}
                            <div>
                                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-4 px-2">Danh sách sản phẩm</p>
                                <div className="space-y-2">
                                    {cart.map((item, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 px-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                                            <div className="flex items-center gap-4">
                                                <span className="text-xs font-black text-white/20 tabular-nums">{(i + 1).toString().padStart(2, '0')}</span>
                                                <div>
                                                    <p className="text-sm font-bold text-white">{item.name}</p>
                                                    <p className="text-[10px] text-white/20 font-bold uppercase">{item.quantity} x {item.price.toLocaleString()}đ</p>
                                                </div>
                                            </div>
                                            <p className="text-sm font-black text-white tabular-nums">{(item.price * item.quantity).toLocaleString()} <span className="text-[10px] text-white/30 ml-1">đ</span></p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-10 bg-[#0d0f0e]/50 border-t border-white/5">
                            <div className="flex flex-col gap-4">
                                <div className="flex justify-between items-center px-2">
                                    <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Cần thanh toán</span>
                                    <span className="text-4xl font-black text-[#00ff80] tracking-tighter tabular-nums">
                                        {totalAmount.toLocaleString()} <span className="text-xs ml-1">đ</span>
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    <button
                                        onClick={confirmPayment}
                                        disabled={loading || success}
                                        className={cn(
                                            "w-full py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border flex items-center justify-center gap-2",
                                            success
                                                ? "bg-emerald-500 text-white border-emerald-500"
                                                : "bg-[#00ff80] hover:bg-[#00e673] text-[#04110b] border-[#00ff80]/20"
                                        )}
                                    >
                                        {loading ? (
                                            <div className="w-4 h-4 border-2 border-[#04110b]/20 border-t-[#04110b] rounded-full animate-spin" />
                                        ) : success ? (
                                            <CheckCircle size={16} />
                                        ) : (
                                            <Banknote size={16} />
                                        )}
                                        {success ? 'Đã thanh toán!' : 'Xác nhận thanh toán'}
                                    </button>
                                    <button className="w-full bg-[#00ff80]/10 hover:bg-[#00ff80]/20 text-[#00ff80] py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border border-[#00ff80]/20 flex items-center justify-center gap-2">
                                        <Printer size={16} />
                                        In hóa đơn
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default POS;

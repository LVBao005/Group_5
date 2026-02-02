import React, { useState, useEffect } from 'react';
import {
    Receipt,
    Search,
    User,
    X,
    Calendar,
    DollarSign,
    Package,
    Tag,
    Filter,
    ChevronDown,
    Bot,
    UserCircle,
    Clock,
    ShoppingCart
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { invoiceService } from '../services/invoiceService';
import { formatCurrency, formatDate } from '../utils/format';

const Invoices = () => {
    // State management
    const [invoices, setInvoices] = useState([]);
    const [filteredInvoices, setFilteredInvoices] = useState([]);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [loading, setLoading] = useState(true);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [pharmacistFilter, setPharmacistFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // all, real, simulated
    const [showFilters, setShowFilters] = useState(false);

    // Load invoices from backend
    useEffect(() => {
        loadInvoices();
    }, []);

    // Apply filters
    useEffect(() => {
        applyFilters();
    }, [invoices, searchTerm, dateFrom, dateTo, pharmacistFilter, statusFilter]);

    const loadInvoices = async () => {
        try {
            setLoading(true);
            const data = await invoiceService.getInvoices();
            setInvoices(data);
        } catch (error) {
            console.error('Error loading invoices:', error);
            // Use mock data as fallback
            setInvoices(getMockInvoices());
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...invoices];

        // Search filter (invoice ID or pharmacist name)
        if (searchTerm) {
            filtered = filtered.filter(inv =>
                inv.invoice_id.toString().includes(searchTerm) ||
                inv.pharmacist_name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Date range filter
        if (dateFrom) {
            filtered = filtered.filter(inv => new Date(inv.invoice_date) >= new Date(dateFrom));
        }
        if (dateTo) {
            filtered = filtered.filter(inv => new Date(inv.invoice_date) <= new Date(dateTo));
        }

        // Pharmacist filter
        if (pharmacistFilter) {
            filtered = filtered.filter(inv =>
                inv.pharmacist_name?.toLowerCase().includes(pharmacistFilter.toLowerCase())
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(inv =>
                statusFilter === 'simulated' ? inv.is_simulated : !inv.is_simulated
            );
        }

        setFilteredInvoices(filtered);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setDateFrom('');
        setDateTo('');
        setPharmacistFilter('');
        setStatusFilter('all');
    };

    const openInvoiceDetail = (invoice) => {
        setSelectedInvoice(invoice);
    };

    const closeInvoiceDetail = () => {
        setSelectedInvoice(null);
    };

    return (
        <div className="flex h-screen bg-[#0d0f0e] text-slate-200 overflow-hidden font-sans">
            <Sidebar />

            <main className="flex-1 flex flex-col min-w-0 bg-[#0d0f0e]">
                {/* Top Header */}
                <header className="h-20 flex items-center px-10 gap-8 shrink-0 border-b border-white/5">
                    <h1 className="text-xl font-black text-white whitespace-nowrap uppercase tracking-widest">
                        Quản lý Hóa đơn
                    </h1>

                    <div className="relative flex-1 max-w-xl group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#00ff80] transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm mã hóa đơn, tên dược sĩ..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#1a1d1c] border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-[#00ff80]/20 transition-all text-white"
                        />
                    </div>

                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#1a1d1c] border border-white/5 rounded-xl hover:border-[#00ff80]/20 transition-all"
                    >
                        <Filter size={16} className="text-[#00ff80]" />
                        <span className="text-xs font-bold text-white">Bộ lọc</span>
                        <ChevronDown size={14} className={`text-white/40 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                    </button>

                    <div className="flex items-center gap-6 ml-auto">
                        <div className="text-right">
                            <p className="text-sm font-black text-white leading-none">{new Date().toLocaleTimeString('vi-VN')}</p>
                            <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest mt-1">Hôm nay</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/20 hover:text-white transition-colors cursor-pointer border border-white/5">
                            <User size={20} />
                        </div>
                    </div>
                </header>

                {/* Filters Panel */}
                {showFilters && (
                    <div className="bg-[#161a19] border-b border-white/5 p-6 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2">Từ ngày</label>
                                <input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="w-full bg-[#0d0f0e] border border-white/5 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#00ff80]/20"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2">Đến ngày</label>
                                <input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="w-full bg-[#0d0f0e] border border-white/5 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#00ff80]/20"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2">Tên dược sĩ</label>
                                <input
                                    type="text"
                                    placeholder="Nhập tên..."
                                    value={pharmacistFilter}
                                    onChange={(e) => setPharmacistFilter(e.target.value)}
                                    className="w-full bg-[#0d0f0e] border border-white/5 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#00ff80]/20"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2">Trạng thái</label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full bg-[#0d0f0e] border border-white/5 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#00ff80]/20"
                                >
                                    <option value="all">Tất cả</option>
                                    <option value="real">Real (Người bán)</option>
                                    <option value="simulated">Simulated (Robot)</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end mt-4">
                            <button
                                onClick={clearFilters}
                                className="text-xs font-bold text-white/40 hover:text-[#00ff80] uppercase tracking-wider transition-colors"
                            >
                                Xóa bộ lọc
                            </button>
                        </div>
                    </div>
                )}

                {/* Invoices List */}
                <div className="flex-1 overflow-auto p-10 pt-4">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <div className="w-16 h-16 border-4 border-[#00ff80]/20 border-t-[#00ff80] rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-white/40 font-bold">Đang tải dữ liệu...</p>
                            </div>
                        </div>
                    ) : (
                        <div className="max-w-7xl mx-auto space-y-4">
                            {/* Summary Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                                <StatCard
                                    icon={Receipt}
                                    label="Tổng hóa đơn"
                                    value={filteredInvoices.length}
                                    color="blue"
                                />
                                <StatCard
                                    icon={DollarSign}
                                    label="Tổng doanh thu"
                                    value={formatCurrency(filteredInvoices.reduce((sum, inv) => sum + inv.total_amount, 0))}
                                    color="green"
                                />
                                <StatCard
                                    icon={UserCircle}
                                    label="Real"
                                    value={filteredInvoices.filter(inv => !inv.is_simulated).length}
                                    color="purple"
                                />
                                <StatCard
                                    icon={Bot}
                                    label="Simulated"
                                    value={filteredInvoices.filter(inv => inv.is_simulated).length}
                                    color="orange"
                                />
                            </div>

                            {/* Invoice Table */}
                            {filteredInvoices.length === 0 ? (
                                <div className="text-center py-20">
                                    <Receipt size={64} className="mx-auto mb-4 text-white/10" />
                                    <p className="text-white/40 font-bold">Không tìm thấy hóa đơn nào</p>
                                </div>
                            ) : (
                                <div className="bg-[#161a19] border border-white/5 rounded-3xl overflow-hidden">
                                    <table className="w-full">
                                        <thead className="bg-[#0d0f0e] border-b border-white/5">
                                            <tr>
                                                <th className="text-left px-6 py-4 text-xs font-black text-white/40 uppercase tracking-wider">Mã HD</th>
                                                <th className="text-left px-6 py-4 text-xs font-black text-white/40 uppercase tracking-wider">Thời gian</th>
                                                <th className="text-left px-6 py-4 text-xs font-black text-white/40 uppercase tracking-wider">Nhân viên</th>
                                                <th className="text-right px-6 py-4 text-xs font-black text-white/40 uppercase tracking-wider">Tổng tiền</th>
                                                <th className="text-center px-6 py-4 text-xs font-black text-white/40 uppercase tracking-wider">Trạng thái</th>
                                                <th className="text-center px-6 py-4 text-xs font-black text-white/40 uppercase tracking-wider">Chi tiết</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredInvoices.map((invoice, index) => (
                                                <tr
                                                    key={invoice.invoice_id}
                                                    className={`border-b border-white/5 hover:bg-white/5 transition-colors ${index % 2 === 0 ? 'bg-[#0d0f0e]/50' : ''
                                                        }`}
                                                >
                                                    <td className="px-6 py-4 text-sm font-bold text-[#00ff80]">#{invoice.invoice_id}</td>
                                                    <td className="px-6 py-4 text-sm text-white/60">
                                                        <div className="flex items-center gap-2">
                                                            <Clock size={14} className="text-white/30" />
                                                            {formatDate(invoice.invoice_date)}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-white">{invoice.pharmacist_name || 'N/A'}</td>
                                                    <td className="px-6 py-4 text-sm font-bold text-white text-right tabular-nums">
                                                        {formatCurrency(invoice.total_amount)}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        {invoice.is_simulated ? (
                                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                                                                <Bot size={12} />
                                                                Simulated
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                                                <UserCircle size={12} />
                                                                Real
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <button
                                                            onClick={() => openInvoiceDetail(invoice)}
                                                            className="px-4 py-2 bg-[#00ff80]/10 hover:bg-[#00ff80]/20 text-[#00ff80] rounded-xl text-xs font-bold transition-all"
                                                        >
                                                            Xem chi tiết
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* Invoice Detail Modal */}
            {selectedInvoice && (
                <InvoiceDetailModal
                    invoice={selectedInvoice}
                    onClose={closeInvoiceDetail}
                />
            )}
        </div>
    );
};

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, color }) => {
    const colors = {
        blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
        green: 'text-[#00ff80] bg-[#00ff80]/10 border-[#00ff80]/20',
        purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
        orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20'
    };

    return (
        <div className="bg-[#161a19] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all">
            <div className={`inline-flex p-3 rounded-xl ${colors[color]} mb-4`}>
                <Icon size={24} />
            </div>
            <p className="text-xs font-black text-white/40 uppercase tracking-wider mb-2">{label}</p>
            <p className="text-2xl font-black text-white tabular-nums">{value}</p>
        </div>
    );
};

// Invoice Detail Modal Component
const InvoiceDetailModal = ({ invoice, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-[#161a19] border border-white/10 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-8 border-b border-white/5">
                    <div>
                        <h2 className="text-2xl font-black text-white mb-2">Chi tiết Hóa đơn #{invoice.invoice_id}</h2>
                        <p className="text-sm text-white/40 font-bold flex items-center gap-2">
                            <Calendar size={14} />
                            {formatDate(invoice.invoice_date)}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                    >
                        <X size={20} className="text-white" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-8 overflow-auto max-h-[calc(90vh-180px)]">
                    {/* Invoice Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <InfoItem label="Nhân viên" value={invoice.pharmacist_name || 'N/A'} icon={User} />
                        <InfoItem label="Khách hàng" value={invoice.customer_name || 'N/A'} icon={UserCircle} />
                        <InfoItem label="Chi nhánh" value={invoice.branch_name || 'N/A'} icon={Package} />
                        <InfoItem
                            label="Trạng thái"
                            value={invoice.is_simulated ? 'Simulated' : 'Real'}
                            icon={invoice.is_simulated ? Bot : UserCircle}
                            className={invoice.is_simulated ? 'text-orange-400' : 'text-purple-400'}
                        />
                    </div>

                    {/* Invoice Items */}
                    <div className="mb-6">
                        <h3 className="text-lg font-black text-white mb-4 uppercase tracking-wider">Danh sách thuốc</h3>
                        <div className="bg-[#0d0f0e] border border-white/5 rounded-2xl overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-[#161a19] border-b border-white/5">
                                    <tr>
                                        <th className="text-left px-4 py-3 text-xs font-black text-white/40 uppercase tracking-wider">Thuốc</th>
                                        <th className="text-center px-4 py-3 text-xs font-black text-white/40 uppercase tracking-wider">Lô hàng</th>
                                        <th className="text-center px-4 py-3 text-xs font-black text-white/40 uppercase tracking-wider">Đơn vị</th>
                                        <th className="text-center px-4 py-3 text-xs font-black text-white/40 uppercase tracking-wider">SL</th>
                                        <th className="text-right px-4 py-3 text-xs font-black text-white/40 uppercase tracking-wider">Đơn giá</th>
                                        <th className="text-right px-4 py-3 text-xs font-black text-white/40 uppercase tracking-wider">Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoice.details && invoice.details.length > 0 ? (
                                        invoice.details.map((item, index) => (
                                            <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                <td className="px-4 py-4 text-sm text-white font-bold">{item.medicine_name || 'N/A'}</td>
                                                <td className="px-4 py-4 text-center">
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#00ff80]/10 text-[#00ff80] border border-[#00ff80]/20">
                                                        <Tag size={12} />
                                                        Lô #{item.batch_id}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-sm text-white/60 text-center">{item.unit_sold}</td>
                                                <td className="px-4 py-4 text-sm text-white text-center font-bold">{item.quantity_sold}</td>
                                                <td className="px-4 py-4 text-sm text-white/60 text-right tabular-nums">{formatCurrency(item.unit_price)}</td>
                                                <td className="px-4 py-4 text-sm text-white font-bold text-right tabular-nums">
                                                    {formatCurrency(item.unit_price * item.quantity_sold)}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-4 py-8 text-center text-white/40">
                                                Không có dữ liệu chi tiết
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Total */}
                    <div className="flex justify-end">
                        <div className="bg-[#00ff80]/10 border border-[#00ff80]/20 rounded-2xl px-8 py-4">
                            <p className="text-xs font-black text-[#00ff80]/60 uppercase tracking-wider mb-2">Tổng cộng</p>
                            <p className="text-3xl font-black text-[#00ff80] tabular-nums">{formatCurrency(invoice.total_amount)}</p>
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end gap-4 p-8 border-t border-white/5">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

// Info Item Component
const InfoItem = ({ label, value, icon: Icon, className = 'text-white' }) => {
    return (
        <div className="bg-[#0d0f0e] border border-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
                <Icon size={14} className="text-white/40" />
                <p className="text-xs font-black text-white/40 uppercase tracking-wider">{label}</p>
            </div>
            <p className={`text-sm font-bold ${className}`}>{value}</p>
        </div>
    );
};

// Mock data for fallback
const getMockInvoices = () => [
    {
        invoice_id: 1001,
        invoice_date: '2026-02-01T10:30:00',
        pharmacist_name: 'Nguyễn Văn A',
        customer_name: 'Trần Thị B',
        branch_name: 'Chi nhánh Quận 1',
        total_amount: 350000,
        is_simulated: false,
        details: [
            {
                medicine_name: 'Paracetamol 500mg',
                batch_id: 101,
                unit_sold: 'HỘP',
                quantity_sold: 2,
                unit_price: 25000
            },
            {
                medicine_name: 'Vitamin C 1000mg',
                batch_id: 102,
                unit_sold: 'VIÊN',
                quantity_sold: 30,
                unit_price: 10000
            }
        ]
    },
    {
        invoice_id: 1002,
        invoice_date: '2026-02-01T11:15:00',
        pharmacist_name: 'Simulator Bot',
        customer_name: 'Khách hàng Auto',
        branch_name: 'Chi nhánh Quận 3',
        total_amount: 150000,
        is_simulated: true,
        details: [
            {
                medicine_name: 'Aspirin 100mg',
                batch_id: 103,
                unit_sold: 'VỈ',
                quantity_sold: 5,
                unit_price: 30000
            }
        ]
    }
];

export default Invoices;

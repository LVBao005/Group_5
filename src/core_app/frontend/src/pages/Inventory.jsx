import React, { useState, useEffect } from 'react';
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
    User,
    Upload,
    Database,
    TrendingUp,
    Clock,
    XCircle,
    Eye,
    Edit2,
    Trash2
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { inventoryService } from '../services/inventoryService';

const Inventory = () => {
    const navigate = useNavigate();
    const [medicines, setMedicines] = useState([]); // Master data
    const [batches, setBatches] = useState([]); // Batch tracking data
    const [activeTab, setActiveTab] = useState('batches'); // 'master' or 'batches'
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [importProgress, setImportProgress] = useState(null);
    const [selectedMedicineDetail, setSelectedMedicineDetail] = useState(null);
    const [showBatchModal, setShowBatchModal] = useState(false);

    // Get user branch
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const branchId = user?.branch_id || 1;

    // Load Data
    const loadData = async () => {
        setLoading(true);
        try {
            const response = await inventoryService.getInventoryByBranch(branchId);

            if (!response || !response.success || !Array.from(response.data)) {
                console.error("Invalid inventory response:", response);
                return;
            }

            const data = response.data;

            // Separate master data and batches
            const masterMap = new Map();
            const batchList = [];

            data.forEach(item => {
                const key = item.medicine_id;
                if (!masterMap.has(key)) {
                    masterMap.set(key, {
                        medicine_id: item.medicine_id,
                        medicineName: item.medicine_name,
                        activeIngredient: item.active_ingredient || 'N/A',
                        categoryName: item.category_name,
                        baseUnit: item.base_unit,
                        subUnit: item.sub_unit,
                        conversionRate: item.conversion_rate,
                        retailPrice: item.base_sell_price || 0,
                        brand: item.brand || 'Generic',
                        totalStock: 0,
                        batchCount: 0
                    });
                }

                const master = masterMap.get(key);
                master.totalStock += item.quantity_std || 0;
                master.batchCount += 1;

                batchList.push({
                    batch_id: item.batch_id,
                    medicine_id: item.medicine_id,
                    medicineName: item.medicine_name,
                    batchNumber: item.batch_number,
                    importDate: item.import_date,
                    expiryDate: item.expiry_date,
                    quantityStd: item.quantity_std || 0,
                    importPrice: item.import_price || 0,
                    baseUnit: item.base_unit,
                    subUnit: item.sub_unit,
                    conversionRate: item.conversion_rate || 1,
                    categoryName: item.category_name,
                    status: getExpiryStatus(item.expiry_date)
                });
            });

            setMedicines(Array.from(masterMap.values()));
            setBatches(batchList);
        } catch (error) {
            console.error("Failed to load inventory", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [branchId]);

    // Calculate expiry status
    const getExpiryStatus = (expiryDate) => {
        if (!expiryDate) return 'unknown';

        const today = new Date();
        const expiry = new Date(expiryDate);
        const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

        if (daysUntilExpiry < 0) return 'expired';
        if (daysUntilExpiry <= 15) return 'critical';
        if (daysUntilExpiry <= 90) return 'warning';
        return 'good';
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'expired': return 'bg-rose-500/10 border-rose-500/20 text-rose-500';
            case 'critical': return 'bg-rose-500/10 border-rose-500/20 text-rose-500';
            case 'warning': return 'bg-amber-500/10 border-amber-500/20 text-amber-500';
            case 'good': return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500';
            default: return 'bg-slate-500/10 border-slate-500/20 text-slate-500';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'expired': return 'Đã hết hạn';
            case 'critical': return 'Gấp rút';
            case 'warning': return 'Cảnh báo';
            case 'good': return 'Tốt';
            default: return 'Chưa rõ';
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.name.endsWith('.csv')) {
            alert("Vui lòng chọn file CSV!");
            return;
        }

        try {
            setLoading(true);
            setImportProgress('Đang tải lên file...');

            await inventoryService.importCSV(file, branchId);

            setImportProgress('Import thành công!');
            setTimeout(() => {
                setImportProgress(null);
                loadData(); // Refresh data
            }, 2000);
        } catch (error) {
            setImportProgress('Lỗi khi import file!');
            setTimeout(() => setImportProgress(null), 3000);
        } finally {
            setLoading(false);
            e.target.value = null; // Reset input
        }
    };

    // Filter logic for both tabs
    const filteredMedicines = medicines.filter(item => {
        const matchesSearch = item.medicineName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.activeIngredient?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = activeCategory === 'all' || item.categoryName === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const filteredBatches = batches.filter(item => {
        const matchesSearch = item.medicineName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.batchNumber?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = activeCategory === 'all' || item.categoryName === activeCategory;
        return matchesSearch && matchesCategory;
    });

    // Extract unique categories
    const categories = ['all', ...new Set(batches.map(m => m.categoryName).filter(Boolean))];

    // Calculate statistics
    const stats = {
        totalMedicines: medicines.length,
        totalBatches: batches.length,
        expiringSoon: batches.filter(b => b.status === 'critical' || b.status === 'warning').length,
        expired: batches.filter(b => b.status === 'expired').length,
        totalValue: batches.reduce((sum, b) => sum + (b.quantityStd * b.importPrice), 0)
    };

    // Handle view medicine batches
    const handleViewMedicineBatches = (medicine) => {
        setSelectedMedicineDetail(medicine);
        setShowBatchModal(true);
    };

    const getMedicineBatches = (medicineId) => {
        return batches.filter(b => b.medicine_id === medicineId);
    };

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
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Tìm tên thuốc, mã lô, thành phần..."
                            className="w-full bg-[#1a1d1c] border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-[#00ff80]/20 transition-all text-white"
                        />
                    </div>

                    <div className="flex items-center gap-6 ml-auto">
                        <button 
                            onClick={() => navigate('/import-stock')}
                            className="bg-[#00ff80] hover:bg-[#00e673] text-[#04110b] font-black uppercase tracking-widest text-[10px] px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-[0_10px_20px_rgba(0,255,128,0.1)] active:scale-95"
                        >
                            <Plus size={16} strokeWidth={3} /> Nhập kho
                        </button>
                        <div className="w-px h-8 bg-white/5" />
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-black text-white leading-none">
                                {new Date().toLocaleTimeString('vi-VN')}
                            </p>
                            <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest mt-1">Hôm nay</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/20 hover:text-white transition-colors cursor-pointer border border-white/5">
                            <User size={20} />
                        </div>
                    </div>
                </header>

                {/* Import Progress */}
                {importProgress && (
                    <div className="mx-10 mb-4 bg-blue-500/10 border border-blue-500/20 text-blue-400 px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-3">
                        <Database size={16} className="animate-pulse" />
                        {importProgress}
                    </div>
                )}

                {/* Inventory Content */}
                <div className="flex-1 overflow-auto p-10 pt-4">
                    {/* Summary Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-10">
                        {[
                            { label: 'Tổng danh mục', value: stats.totalMedicines, icon: Database, color: 'text-white' },
                            { label: 'Tổng lô hàng', value: stats.totalBatches, icon: Package, color: 'text-blue-400' },
                            { label: 'Sắp hết hạn', value: stats.expiringSoon, icon: AlertTriangle, color: 'text-amber-500' },
                            { label: 'Đã hết hạn', value: stats.expired, icon: XCircle, color: 'text-rose-500' },
                            { label: 'Giá trị tồn', value: (stats.totalValue / 1000000000).toFixed(1) + 'B', icon: TrendingUp, color: 'text-[#00ff80]' }
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

                    {/* Tab Navigation */}
                    <div className="flex gap-4 mb-6">
                        <button
                            onClick={() => setActiveTab('batches')}
                            className={cn(
                                "px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all flex items-center gap-3",
                                activeTab === 'batches'
                                    ? "bg-[#00ff80] text-[#04110b]"
                                    : "bg-[#161a19] border border-white/5 text-white/40 hover:text-white hover:border-white/10"
                            )}
                        >
                            <Package size={18} />
                            Quản lý Lô hàng
                        </button>
                        <button
                            onClick={() => setActiveTab('master')}
                            className={cn(
                                "px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all flex items-center gap-3",
                                activeTab === 'master'
                                    ? "bg-[#00ff80] text-[#04110b]"
                                    : "bg-[#161a19] border border-white/5 text-white/40 hover:text-white hover:border-white/10"
                            )}
                        >
                            <Database size={18} />
                            Danh mục thuốc
                        </button>
                    </div>

                    {/* Filters & Table */}
                    <div className="bg-[#161a19] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col">
                        <div className="p-8 border-b border-white/5 flex items-center justify-between">
                            <div className="flex gap-2 overflow-auto scrollbar-hide pb-1">
                                <button
                                    onClick={() => setActiveCategory('all')}
                                    className={cn(
                                        "px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border",
                                        activeCategory === 'all' ? "bg-[#00ff80] border-[#00ff80] text-[#04110b]" : "bg-white/5 border-white/5 text-white/40 hover:text-white"
                                    )}
                                >
                                    Tất cả
                                </button>
                                {categories.filter(c => c !== 'all').map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setActiveCategory(cat)}
                                        className={cn(
                                            "px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border shrink-0",
                                            activeCategory === cat ? "bg-[#00ff80] border-[#00ff80] text-[#04110b]" : "bg-white/5 border-white/5 text-white/40 hover:text-white"
                                        )}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                                    {activeTab === 'batches' ? `${filteredBatches.length} lô hàng` : `${filteredMedicines.length} thuốc`}
                                </span>
                                <button className="flex items-center gap-2 text-[10px] font-black text-white/20 uppercase tracking-widest hover:text-white transition-colors">
                                    <Filter size={14} /> Lọc
                                </button>
                            </div>
                        </div>

                        {/* Batch Tracking Table */}
                        {activeTab === 'batches' && (
                            <div className="overflow-auto min-h-[400px]">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">
                                            <th className="py-6 px-10">Thuốc & Mã lô</th>
                                            <th className="py-6">Ngày nhập</th>
                                            <th className="py-6">Hạn sử dụng</th>
                                            <th className="py-6 text-right">Giá nhập</th>
                                            <th className="py-6 text-center">Tồn kho lô</th>
                                            <th className="py-6 px-10 text-right">Trạng thái</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {loading ? (
                                            <tr>
                                                <td colSpan="6" className="py-20 text-center text-white/40">
                                                    Đang tải dữ liệu...
                                                </td>
                                            </tr>
                                        ) : filteredBatches.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="py-20 text-center text-white/40">
                                                    Không tìm thấy dữ liệu
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredBatches.map((batch) => {
                                                const boxQty = Math.floor(batch.quantityStd / (batch.conversionRate || 1));
                                                const subQty = batch.quantityStd % (batch.conversionRate || 1);

                                                return (
                                                    <tr key={batch.batch_id} className="group hover:bg-white/[0.01] transition-colors">
                                                        <td className="py-6 px-10">
                                                            <div className="flex items-center gap-5">
                                                                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/20 group-hover:bg-[#00ff80]/10 group-hover:text-[#00ff80] transition-all duration-500">
                                                                    <Pill size={22} />
                                                                </div>
                                                                <div>
                                                                    <p className="font-black text-white text-sm mb-1 group-hover:text-[#00ff80] transition-colors">
                                                                        {batch.medicineName}
                                                                    </p>
                                                                    <div className="flex items-center gap-3">
                                                                        <span className="text-[10px] text-[#00ff80]/60 font-black uppercase bg-[#00ff80]/5 px-2 py-0.5 rounded-md">
                                                                            Lô: {batch.batchNumber}
                                                                        </span>
                                                                        <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">
                                                                            {batch.categoryName}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-6">
                                                            <div className="flex items-center gap-2">
                                                                <Calendar size={14} className="text-white/10" />
                                                                <span className="text-xs font-bold tabular-nums text-white/40">
                                                                    {batch.importDate ? new Date(batch.importDate).toLocaleDateString('vi-VN') : 'N/A'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="py-6">
                                                            <div className="flex items-center gap-2">
                                                                <Clock size={14} className={cn(
                                                                    batch.status === 'expired' || batch.status === 'critical' ? 'text-rose-500' :
                                                                        batch.status === 'warning' ? 'text-amber-500' : 'text-white/10'
                                                                )} />
                                                                <span className={cn(
                                                                    "text-xs font-bold tabular-nums",
                                                                    batch.status === 'expired' || batch.status === 'critical' ? 'text-rose-500' :
                                                                        batch.status === 'warning' ? 'text-amber-500' : 'text-white/40'
                                                                )}>
                                                                    {batch.expiryDate ? new Date(batch.expiryDate).toLocaleDateString('vi-VN') : 'N/A'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="py-6 text-right">
                                                            <p className="text-sm font-black text-white tabular-nums tracking-tighter">
                                                                {batch.importPrice.toLocaleString()}
                                                            </p>
                                                            <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">
                                                                đ / {batch.baseUnit}
                                                            </p>
                                                        </td>
                                                        <td className="py-6">
                                                            <div className="flex flex-col items-center">
                                                                <div className="flex items-baseline gap-2">
                                                                    <span className="text-xl font-black text-[#00ff80] tabular-nums tracking-tighter">
                                                                        {boxQty}
                                                                    </span>
                                                                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">
                                                                        {batch.baseUnit}
                                                                    </span>
                                                                </div>
                                                                {subQty > 0 && (
                                                                    <div className="flex items-baseline gap-1.5 opacity-40">
                                                                        <Plus size={8} className="text-[#00ff80]" />
                                                                        <span className="text-xs font-bold text-white tabular-nums">{subQty}</span>
                                                                        <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest">
                                                                            {batch.subUnit}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="py-6 px-10 text-right">
                                                            <div className={cn(
                                                                "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border",
                                                                getStatusColor(batch.status)
                                                            )}>
                                                                <div className={cn(
                                                                    "w-1.5 h-1.5 rounded-full",
                                                                    batch.status === 'expired' || batch.status === 'critical' ? 'bg-rose-500 animate-pulse' :
                                                                        batch.status === 'warning' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
                                                                )} />
                                                                <span className="text-[9px] font-black uppercase tracking-[0.2em]">
                                                                    {getStatusLabel(batch.status)}
                                                                </span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Master Data Table */}
                        {activeTab === 'master' && (
                            <div className="overflow-auto min-h-[400px]">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">
                                            <th className="py-6 px-10">Tên thuốc</th>
                                            <th className="py-6">Thành phần</th>
                                            <th className="py-6">Danh mục</th>
                                            <th className="py-6 text-center">Đơn vị tính</th>
                                            <th className="py-6 text-right">Giá bán lẻ</th>
                                            <th className="py-6 text-center">Số lô</th>
                                            <th className="py-6 text-center">Tổng tồn</th>
                                            <th className="py-6 px-10 text-center">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {loading ? (
                                            <tr>
                                                <td colSpan="8" className="py-20 text-center text-white/40">
                                                    Đang tải dữ liệu...
                                                </td>
                                            </tr>
                                        ) : filteredMedicines.length === 0 ? (
                                            <tr>
                                                <td colSpan="8" className="py-20 text-center text-white/40">
                                                    Không tìm thấy dữ liệu
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredMedicines.map((medicine) => {
                                                const boxQty = Math.floor(medicine.totalStock / (medicine.conversionRate || 1));
                                                const subQty = medicine.totalStock % (medicine.conversionRate || 1);

                                                return (
                                                    <tr key={medicine.medicine_id} className="group hover:bg-white/[0.01] transition-colors">
                                                        <td className="py-6 px-10">
                                                            <div className="flex items-center gap-5">
                                                                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/20 group-hover:bg-[#00ff80]/10 group-hover:text-[#00ff80] transition-all duration-500">
                                                                    <Pill size={22} />
                                                                </div>
                                                                <div>
                                                                    <p className="font-black text-white text-sm mb-1 group-hover:text-[#00ff80] transition-colors">
                                                                        {medicine.medicineName}
                                                                    </p>
                                                                    <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">
                                                                        {medicine.brand}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-6">
                                                            <p className="text-xs text-white/60 font-medium max-w-xs">
                                                                {medicine.activeIngredient}
                                                            </p>
                                                        </td>
                                                        <td className="py-6">
                                                            <span className="text-[10px] font-black uppercase bg-blue-500/10 text-blue-400 px-3 py-1.5 rounded-full border border-blue-500/20">
                                                                {medicine.categoryName}
                                                            </span>
                                                        </td>
                                                        <td className="py-6 text-center">
                                                            <div className="flex flex-col items-center gap-1">
                                                                <span className="text-xs font-bold text-white">
                                                                    {medicine.baseUnit}
                                                                </span>
                                                                <div className="flex items-center gap-1 text-[10px] text-white/40">
                                                                    <span>1 {medicine.baseUnit} = {medicine.conversionRate} {medicine.subUnit}</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-6 text-right">
                                                            <p className="text-sm font-black text-[#00ff80] tabular-nums tracking-tighter">
                                                                {medicine.retailPrice.toLocaleString()}
                                                            </p>
                                                            <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">
                                                                VNĐ
                                                            </p>
                                                        </td>
                                                        <td className="py-6 text-center">
                                                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/5 text-white font-black text-xs">
                                                                {medicine.batchCount}
                                                            </span>
                                                        </td>
                                                        <td className="py-6">
                                                            <div className="flex flex-col items-center">
                                                                <div className="flex items-baseline gap-2">
                                                                    <span className="text-xl font-black text-white tabular-nums tracking-tighter">
                                                                        {boxQty}
                                                                    </span>
                                                                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">
                                                                        {medicine.baseUnit}
                                                                    </span>
                                                                </div>
                                                                {subQty > 0 && (
                                                                    <div className="flex items-baseline gap-1.5 opacity-40">
                                                                        <Plus size={8} className="text-white" />
                                                                        <span className="text-xs font-bold text-white tabular-nums">{subQty}</span>
                                                                        <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest">
                                                                            {medicine.subUnit}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="py-6 px-10">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <button 
                                                                    onClick={() => handleViewMedicineBatches(medicine)}
                                                                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-blue-500/20 text-white/40 hover:text-blue-400 transition-all flex items-center justify-center"
                                                                    title="Xem chi tiết lô hàng"
                                                                >
                                                                    <Eye size={14} />
                                                                </button>
                                                                <button className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#00ff80]/20 text-white/40 hover:text-[#00ff80] transition-all flex items-center justify-center">
                                                                    <Edit2 size={14} />
                                                                </button>
                                                                <button className="w-8 h-8 rounded-lg bg-white/5 hover:bg-rose-500/20 text-white/40 hover:text-rose-400 transition-all flex items-center justify-center">
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Batch Detail Modal */}
            {showBatchModal && selectedMedicineDetail && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={() => setShowBatchModal(false)}>
                    <div className="bg-[#161a19] border border-white/10 rounded-[2rem] max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="p-8 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-[#00ff80]/10 rounded-2xl flex items-center justify-center">
                                    <Pill size={28} className="text-[#00ff80]" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white mb-1">{selectedMedicineDetail.medicineName}</h2>
                                    <p className="text-sm text-white/60">{selectedMedicineDetail.activeIngredient}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                                            {selectedMedicineDetail.categoryName}
                                        </span>
                                        <span className="text-xs font-bold text-white/40">
                                            {selectedMedicineDetail.brand}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowBatchModal(false)}
                                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-rose-500/20 text-white/40 hover:text-rose-400 transition-all flex items-center justify-center"
                            >
                                <XCircle size={20} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-8 overflow-auto max-h-[calc(90vh-180px)]">
                            <div className="grid grid-cols-4 gap-4 mb-8">
                                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-wider mb-2">Tổng tồn kho</p>
                                    <p className="text-2xl font-black text-[#00ff80]">
                                        {Math.floor(selectedMedicineDetail.totalStock / (selectedMedicineDetail.conversionRate || 1))} {selectedMedicineDetail.baseUnit}
                                    </p>
                                    {selectedMedicineDetail.totalStock % (selectedMedicineDetail.conversionRate || 1) > 0 && (
                                        <p className="text-xs text-white/40 mt-1">
                                            + {selectedMedicineDetail.totalStock % (selectedMedicineDetail.conversionRate || 1)} {selectedMedicineDetail.subUnit}
                                        </p>
                                    )}
                                </div>
                                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-wider mb-2">Số lô hàng</p>
                                    <p className="text-2xl font-black text-white">{selectedMedicineDetail.batchCount}</p>
                                </div>
                                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-wider mb-2">Giá bán lẻ</p>
                                    <p className="text-2xl font-black text-white">{selectedMedicineDetail.retailPrice.toLocaleString()}đ</p>
                                </div>
                                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-wider mb-2">Đơn vị quy đổi</p>
                                    <p className="text-sm font-bold text-white">1 {selectedMedicineDetail.baseUnit}</p>
                                    <p className="text-xs text-white/40">= {selectedMedicineDetail.conversionRate} {selectedMedicineDetail.subUnit}</p>
                                </div>
                            </div>

                            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Package size={16} className="text-[#00ff80]" />
                                Danh sách các lô hàng ({getMedicineBatches(selectedMedicineDetail.medicine_id).length} lô)
                            </h3>

                            <div className="bg-[#0d0f0e] rounded-2xl overflow-hidden border border-white/5">
                                <table className="w-full">
                                    <thead className="bg-white/5">
                                        <tr className="text-[10px] font-black text-white/40 uppercase tracking-wider">
                                            <th className="py-4 px-6 text-left">Số lô</th>
                                            <th className="py-4 px-4 text-center">Ngày nhập</th>
                                            <th className="py-4 px-4 text-center">Hạn sử dụng</th>
                                            <th className="py-4 px-4 text-right">Giá nhập</th>
                                            <th className="py-4 px-4 text-center">Tồn kho</th>
                                            <th className="py-4 px-6 text-center">Trạng thái</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {getMedicineBatches(selectedMedicineDetail.medicine_id).length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="py-10 text-center text-white/40">
                                                    Không có lô hàng nào
                                                </td>
                                            </tr>
                                        ) : (
                                            getMedicineBatches(selectedMedicineDetail.medicine_id).map((batch) => {
                                                const boxQty = Math.floor(batch.quantityStd / (selectedMedicineDetail.conversionRate || 1));
                                                const subQty = batch.quantityStd % (selectedMedicineDetail.conversionRate || 1);

                                                return (
                                                    <tr key={batch.batch_id} className="hover:bg-white/5 transition-colors">
                                                        <td className="py-4 px-6">
                                                            <span className="text-sm font-bold text-[#00ff80]">{batch.batchNumber}</span>
                                                        </td>
                                                        <td className="py-4 px-4 text-center">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <Calendar size={12} className="text-white/20" />
                                                                <span className="text-xs text-white/60">
                                                                    {batch.importDate ? new Date(batch.importDate).toLocaleDateString('vi-VN') : 'N/A'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-4 text-center">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <Clock size={12} className={cn(
                                                                    batch.status === 'expired' || batch.status === 'critical' ? 'text-rose-500' :
                                                                        batch.status === 'warning' ? 'text-amber-500' : 'text-white/20'
                                                                )} />
                                                                <span className={cn(
                                                                    "text-xs font-bold",
                                                                    batch.status === 'expired' || batch.status === 'critical' ? 'text-rose-500' :
                                                                        batch.status === 'warning' ? 'text-amber-500' : 'text-white/60'
                                                                )}>
                                                                    {batch.expiryDate ? new Date(batch.expiryDate).toLocaleDateString('vi-VN') : 'N/A'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-4 text-right">
                                                            <p className="text-sm font-bold text-white">
                                                                {batch.importPrice.toLocaleString()}đ
                                                            </p>
                                                            <p className="text-[10px] text-white/20">/{selectedMedicineDetail.baseUnit}</p>
                                                        </td>
                                                        <td className="py-4 px-4">
                                                            <div className="flex flex-col items-center">
                                                                <div className="flex items-baseline gap-2">
                                                                    <span className="text-lg font-black text-white">
                                                                        {boxQty}
                                                                    </span>
                                                                    <span className="text-[10px] font-bold text-white/40 uppercase">
                                                                        {selectedMedicineDetail.baseUnit}
                                                                    </span>
                                                                </div>
                                                                {subQty > 0 && (
                                                                    <div className="flex items-baseline gap-1.5 opacity-60">
                                                                        <Plus size={8} className="text-white" />
                                                                        <span className="text-xs font-bold text-white">{subQty}</span>
                                                                        <span className="text-[9px] font-bold text-white/50 uppercase">
                                                                            {selectedMedicineDetail.subUnit}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-6 text-center">
                                                            <div className={cn(
                                                                "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[9px] font-black uppercase",
                                                                batch.status === 'expired' || batch.status === 'critical' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' :
                                                                    batch.status === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                                                                        'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                                                            )}>
                                                                <div className={cn(
                                                                    "w-1.5 h-1.5 rounded-full",
                                                                    batch.status === 'expired' || batch.status === 'critical' ? 'bg-rose-500 animate-pulse' :
                                                                        batch.status === 'warning' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
                                                                )} />
                                                                {getStatusLabel(batch.status)}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;

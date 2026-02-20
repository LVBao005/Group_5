import React, { useState, useEffect } from 'react';
import {
    Package,
    Search,
    Plus,
    ArrowLeft,
    Pill,
    Calendar,
    Clock,
    Database,
    CheckCircle,
    AlertCircle,
    TrendingUp,
    Boxes,
    ShoppingCart,
    Filter,
    XCircle,
    AlertTriangle,
    Eye
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { inventoryService } from '../services/inventoryService';
import { medicineService } from '../services/medicineService';

const ImportStock = () => {
    const navigate = useNavigate();
    const [medicines, setMedicines] = useState([]);
    const [centralBatches, setCentralBatches] = useState([]); // Batches from central warehouse
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [loading, setLoading] = useState(false);
    const [selectedMedicine, setSelectedMedicine] = useState(null);
    const [showImportModal, setShowImportModal] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [importQuantity, setImportQuantity] = useState({ boxes: '', units: '' });
    const [successMessage, setSuccessMessage] = useState('');

    // Get user branch
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const branchId = user?.branch_id || user?.branchId || 1;

    // Load medicines with central warehouse batches
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // Load all medicines
            const medResponse = await medicineService.getAllMedicines();
            if (!medResponse || !medResponse.data) return;

            const medicinesData = medResponse.data;

            // Load central warehouse inventory (assuming branch_id = 0 or a specific ID for central)
            // For now, we'll load from branch 1 as central - you should adjust this logic
            const invResponse = await inventoryService.getInventoryByBranch(0); // 0 = central warehouse
            
            let batchesData = [];
            if (invResponse && invResponse.success && invResponse.data) {
                batchesData = invResponse.data.map(item => ({
                    ...item,
                    status: getExpiryStatus(item.expiry_date)
                }));
            }

            // Aggregate medicines with total available quantity from central
            const medicineMap = new Map();
            medicinesData.forEach(med => {
                const batches = batchesData.filter(b => b.medicine_id === med.medicine_id);
                const totalAvailable = batches.reduce((sum, b) => sum + (b.quantity_std || 0), 0);
                
                medicineMap.set(med.medicine_id, {
                    ...med,
                    totalAvailable,
                    batchCount: batches.length
                });
            });

            setMedicines(Array.from(medicineMap.values()));
            setCentralBatches(batchesData);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

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

    const handleViewMedicine = (medicine) => {
        setSelectedMedicine(medicine);
        setShowImportModal(true);
        setSelectedBatch(null);
        setImportQuantity({ boxes: '', units: '' });
    };

    const getMedicineBatches = (medicineId) => {
        return centralBatches.filter(b => b.medicine_id === medicineId);
    };

    const handleImport = async () => {
        if (!selectedBatch || !selectedMedicine) {
            alert('Vui lòng chọn lô hàng');
            return;
        }

        const boxes = parseInt(importQuantity.boxes) || 0;
        const units = parseInt(importQuantity.units) || 0;
        const totalQty = (boxes * (selectedMedicine.conversion_rate || 1)) + units;

        if (totalQty <= 0) {
            alert('Vui lòng nhập số lượng hợp lệ');
            return;
        }

        if (totalQty > selectedBatch.quantity_std) {
            alert('Số lượng vượt quá tồn kho lô này');
            return;
        }

        try {
            // Call API to transfer from central to branch
            // await inventoryService.transferBatch({
            //     from_branch: 0,
            //     to_branch: branchId,
            //     batch_id: selectedBatch.batch_id,
            //     quantity: totalQty
            // });

            console.log('Transfer:', {
                from_branch: 0,
                to_branch: branchId,
                batch_id: selectedBatch.batch_id,
                medicine: selectedMedicine.medicine_name,
                quantity: totalQty
            });

            setSuccessMessage(`Đã nhập ${boxes} ${selectedMedicine.base_unit} ${units > 0 ? `+ ${units} ${selectedMedicine.sub_unit}` : ''} vào kho chi nhánh!`);
            setTimeout(() => {
                setSuccessMessage('');
                setShowImportModal(false);
                loadData();
            }, 2000);

        } catch (error) {
            console.error('Import failed:', error);
            alert('Lỗi khi nhập kho: ' + error.message);
        }
    };

    const filteredMedicines = medicines.filter(med => {
        const matchesSearch = med.medicine_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            med.active_ingredient?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = activeCategory === 'all' || med.category_name === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const categories = ['all', ...new Set(medicines.map(m => m.category_name).filter(Boolean))];

    const stats = {
        totalMedicines: medicines.length,
        availableBatches: centralBatches.length,
        expiringSoon: centralBatches.filter(b => b.status === 'critical' || b.status === 'warning').length,
    };

    return (
        <div className="flex h-screen bg-[#0d0f0e] text-slate-200 overflow-hidden font-sans">
            <Sidebar />

            <main className="flex-1 flex flex-col min-w-0 bg-[#0d0f0e]">
                {/* Top Header */}
                <header className="h-20 flex items-center px-10 gap-8 shrink-0 border-b border-white/5">
                    <button
                        onClick={() => navigate('/inventory')}
                        className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-bold uppercase tracking-wider">Quay lại</span>
                    </button>
                    <h1 className="text-xl font-black text-white whitespace-nowrap uppercase tracking-widest">
                        Nhập thuốc từ kho tổng
                    </h1>

                    <div className="relative flex-1 max-w-xl group ml-8">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#00ff80] transition-colors" size={18} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Tìm tên thuốc, thành phần..."
                            className="w-full bg-[#1a1d1c] border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-[#00ff80]/20 transition-all text-white"
                        />
                    </div>
                </header>

                {/* Success Message */}
                {successMessage && (
                    <div className="mx-10 mt-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-6 py-4 rounded-xl text-sm font-bold flex items-center gap-3">
                        <CheckCircle size={20} />
                        {successMessage}
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-auto p-10 pt-4">
                    {/* Summary Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        {[
                            { label: 'Tổng danh mục', value: stats.totalMedicines, icon: Database, color: 'text-white' },
                            { label: 'Lô có sẵn', value: stats.availableBatches, icon: Package, color: 'text-blue-400' },
                            { label: 'Sắp hết hạn', value: stats.expiringSoon, icon: AlertTriangle, color: 'text-amber-500' },
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

                    {/* Medicine List Table */}
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
                                    {filteredMedicines.length} thuốc
                                </span>
                            </div>
                        </div>

                        <div className="overflow-auto min-h-[400px]">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">
                                        <th className="py-6 px-10">Tên thuốc</th>
                                        <th className="py-6">Thành phần</th>
                                        <th className="py-6">Danh mục</th>
                                        <th className="py-6 text-center">Đơn vị</th>
                                        <th className="py-6 text-center">Số lô có sẵn</th>
                                        <th className="py-6 text-center">Tồn kho tổng</th>
                                        <th className="py-6 px-10 text-center">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="7" className="py-20 text-center text-white/40">
                                                Đang tải dữ liệu...
                                            </td>
                                        </tr>
                                    ) : filteredMedicines.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="py-20 text-center text-white/40">
                                                Không tìm thấy thuốc
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredMedicines.map((medicine) => {
                                            const boxQty = Math.floor(medicine.totalAvailable / (medicine.conversion_rate || 1));
                                            const subQty = medicine.totalAvailable % (medicine.conversion_rate || 1);

                                            return (
                                                <tr key={medicine.medicine_id} className="group hover:bg-white/[0.01] transition-colors">
                                                    <td className="py-6 px-10">
                                                        <div className="flex items-center gap-5">
                                                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/20 group-hover:bg-[#00ff80]/10 group-hover:text-[#00ff80] transition-all duration-500">
                                                                <Pill size={22} />
                                                            </div>
                                                            <div>
                                                                <p className="font-black text-white text-sm mb-1 group-hover:text-[#00ff80] transition-colors">
                                                                    {medicine.medicine_name}
                                                                </p>
                                                                <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">
                                                                    {medicine.brand || 'Generic'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-6">
                                                        <p className="text-xs text-white/60 font-medium max-w-xs">
                                                            {medicine.active_ingredient || 'N/A'}
                                                        </p>
                                                    </td>
                                                    <td className="py-6">
                                                        <span className="text-[10px] font-black uppercase bg-blue-500/10 text-blue-400 px-3 py-1.5 rounded-full border border-blue-500/20">
                                                            {medicine.category_name}
                                                        </span>
                                                    </td>
                                                    <td className="py-6 text-center">
                                                        <div className="flex flex-col items-center gap-1">
                                                            <span className="text-xs font-bold text-white">
                                                                {medicine.base_unit}
                                                            </span>
                                                            <div className="flex items-center gap-1 text-[10px] text-white/40">
                                                                <span>1:{medicine.conversion_rate} {medicine.sub_unit}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-6 text-center">
                                                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-500/10 text-blue-400 font-black text-sm border border-blue-500/20">
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
                                                                    {medicine.base_unit}
                                                                </span>
                                                            </div>
                                                            {subQty > 0 && (
                                                                <div className="flex items-baseline gap-1.5 opacity-40">
                                                                    <Plus size={8} className="text-white" />
                                                                    <span className="text-xs font-bold text-white tabular-nums">{subQty}</span>
                                                                    <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest">
                                                                        {medicine.sub_unit}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-6 px-10">
                                                        <div className="flex items-center justify-center">
                                                            <button
                                                                onClick={() => handleViewMedicine(medicine)}
                                                                disabled={medicine.batchCount === 0}
                                                                className={cn(
                                                                    "px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2",
                                                                    medicine.batchCount > 0
                                                                        ? "bg-[#00ff80] hover:bg-[#00e673] text-[#04110b] shadow-[0_5px_15px_rgba(0,255,128,0.2)] active:scale-95"
                                                                        : "bg-white/5 text-white/20 cursor-not-allowed"
                                                                )}
                                                            >
                                                                <ShoppingCart size={14} strokeWidth={3} />
                                                                Nhập kho
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
                    </div>
                </div>
            </main>

            {/* Import Modal - Select Batch and Quantity */}
            {showImportModal && selectedMedicine && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={() => setShowImportModal(false)}>
                    <div className="bg-[#161a19] border border-white/10 rounded-[2rem] max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="p-8 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-[#00ff80]/10 rounded-2xl flex items-center justify-center">
                                    <ShoppingCart size={28} className="text-[#00ff80]" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white mb-1">{selectedMedicine.medicine_name}</h2>
                                    <p className="text-sm text-white/60">{selectedMedicine.active_ingredient}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                                            {selectedMedicine.category_name}
                                        </span>
                                        <span className="text-xs font-bold text-white/40">
                                            1 {selectedMedicine.base_unit} = {selectedMedicine.conversion_rate} {selectedMedicine.sub_unit}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowImportModal(false)}
                                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-rose-500/20 text-white/40 hover:text-rose-400 transition-all flex items-center justify-center"
                            >
                                <XCircle size={20} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-8 overflow-auto max-h-[calc(90vh-180px)]">
                            <div className="grid grid-cols-3 gap-4 mb-8">
                                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-wider mb-2">Tổng tồn kho tổng</p>
                                    <p className="text-2xl font-black text-[#00ff80]">
                                        {Math.floor(selectedMedicine.totalAvailable / (selectedMedicine.conversion_rate || 1))} {selectedMedicine.base_unit}
                                    </p>
                                    {selectedMedicine.totalAvailable % (selectedMedicine.conversion_rate || 1) > 0 && (
                                        <p className="text-xs text-white/40 mt-1">
                                            + {selectedMedicine.totalAvailable % (selectedMedicine.conversion_rate || 1)} {selectedMedicine.sub_unit}
                                        </p>
                                    )}
                                </div>
                                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-wider mb-2">Số lô có sẵn</p>
                                    <p className="text-2xl font-black text-white">{selectedMedicine.batchCount}</p>
                                </div>
                                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-wider mb-2">Chi nhánh</p>
                                    <p className="text-sm font-bold text-white">{user?.branchName || user?.branch_name || 'Chi nhánh #' + branchId}</p>
                                </div>
                            </div>

                            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Package size={16} className="text-[#00ff80]" />
                                Chọn lô hàng muốn nhập ({getMedicineBatches(selectedMedicine.medicine_id).length} lô)
                            </h3>

                            <div className="grid grid-cols-1 gap-3 mb-8">
                                {getMedicineBatches(selectedMedicine.medicine_id).length === 0 ? (
                                    <div className="p-10 text-center text-white/40 bg-[#0d0f0e] rounded-2xl border border-white/5">
                                        <Package size={48} className="mx-auto mb-4 opacity-20" />
                                        <p>Không có lô hàng nào trong kho tổng</p>
                                    </div>
                                ) : (
                                    getMedicineBatches(selectedMedicine.medicine_id).map((batch) => {
                                        const boxQty = Math.floor(batch.quantity_std / (selectedMedicine.conversion_rate || 1));
                                        const subQty = batch.quantity_std % (selectedMedicine.conversion_rate || 1);
                                        const isSelected = selectedBatch?.batch_id === batch.batch_id;

                                        return (
                                            <button
                                                key={batch.batch_id}
                                                onClick={() => setSelectedBatch(batch)}
                                                className={cn(
                                                    "p-5 rounded-2xl border-2 transition-all text-left grid grid-cols-6 gap-4 items-center",
                                                    isSelected
                                                        ? "bg-[#00ff80]/10 border-[#00ff80]/40 shadow-[0_0_20px_rgba(0,255,128,0.1)]"
                                                        : "bg-[#0d0f0e] border-white/5 hover:border-white/10"
                                                )}
                                            >
                                                <div className="col-span-2">
                                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-wider mb-1">Số lô</p>
                                                    <p className="text-lg font-black text-[#00ff80]">{batch.batch_number}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-wider mb-1">Ngày nhập</p>
                                                    <p className="text-sm font-bold text-white/60">
                                                        {batch.import_date ? new Date(batch.import_date).toLocaleDateString('vi-VN') : 'N/A'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-wider mb-1">Hạn SD</p>
                                                    <p className={cn(
                                                        "text-sm font-bold",
                                                        batch.status === 'expired' || batch.status === 'critical' ? 'text-rose-500' :
                                                            batch.status === 'warning' ? 'text-amber-500' : 'text-white/60'
                                                    )}>
                                                        {batch.expiry_date ? new Date(batch.expiry_date).toLocaleDateString('vi-VN') : 'N/A'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-wider mb-1">Tồn kho</p>
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-lg font-black text-white">{boxQty}</span>
                                                        <span className="text-[10px] font-bold text-white/40 uppercase">{selectedMedicine.base_unit}</span>
                                                    </div>
                                                    {subQty > 0 && (
                                                        <p className="text-xs text-white/40">+ {subQty} {selectedMedicine.sub_unit}</p>
                                                    )}
                                                </div>
                                                <div className="flex justify-end">
                                                    <div className={cn(
                                                        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[9px] font-black uppercase",
                                                        getStatusColor(batch.status)
                                                    )}>
                                                        <div className={cn(
                                                            "w-1.5 h-1.5 rounded-full",
                                                            batch.status === 'expired' || batch.status === 'critical' ? 'bg-rose-500 animate-pulse' :
                                                                batch.status === 'warning' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
                                                        )} />
                                                        {getStatusLabel(batch.status)}
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })
                                )}
                            </div>

                            {/* Quantity Input */}
                            {selectedBatch && (
                                <div className="bg-[#0d0f0e] border border-[#00ff80]/20 rounded-2xl p-6">
                                    <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Boxes size={16} className="text-[#00ff80]" />
                                        Nhập số lượng muốn lấy từ lô {selectedBatch.batch_number}
                                    </h3>

                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div>
                                            <label className="text-xs font-bold text-white/60 uppercase tracking-wider block mb-2">
                                                Số lượng ({selectedMedicine.base_unit})
                                            </label>
                                            <input
                                                type="number"
                                                value={importQuantity.boxes}
                                                onChange={(e) => setImportQuantity({ ...importQuantity, boxes: e.target.value })}
                                                placeholder="0"
                                                min="0"
                                                max={Math.floor(selectedBatch.quantity_std / (selectedMedicine.conversion_rate || 1))}
                                                className="w-full bg-[#161a19] border border-white/10 rounded-xl py-3 px-4 text-lg font-bold focus:outline-none focus:border-[#00ff80]/40 transition-all text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-white/60 uppercase tracking-wider block mb-2">
                                                Số lượng lẻ ({selectedMedicine.sub_unit})
                                            </label>
                                            <input
                                                type="number"
                                                value={importQuantity.units}
                                                onChange={(e) => setImportQuantity({ ...importQuantity, units: e.target.value })}
                                                placeholder="0"
                                                min="0"
                                                max={selectedMedicine.conversion_rate - 1}
                                                className="w-full bg-[#161a19] border border-white/10 rounded-xl py-3 px-4 text-lg font-bold focus:outline-none focus:border-[#00ff80]/40 transition-all text-white"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl mb-6">
                                        <p className="text-sm font-bold text-white/60">Tổng số lượng sẽ nhập:</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-2xl font-black text-[#00ff80]">
                                                {importQuantity.boxes || 0}
                                            </span>
                                            <span className="text-sm font-bold text-white/40">{selectedMedicine.base_unit}</span>
                                            {importQuantity.units > 0 && (
                                                <>
                                                    <span className="text-white/40">+</span>
                                                    <span className="text-xl font-black text-[#00ff80]">{importQuantity.units}</span>
                                                    <span className="text-sm font-bold text-white/40">{selectedMedicine.sub_unit}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleImport}
                                        className="w-full bg-[#00ff80] hover:bg-[#00e673] text-[#04110b] font-black uppercase tracking-widest text-sm px-6 py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_10px_20px_rgba(0,255,128,0.2)] active:scale-95"
                                    >
                                        <CheckCircle size={18} strokeWidth={3} />
                                        Xác nhận nhập vào kho chi nhánh
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImportStock;

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
    Trash2,
    ShoppingCart,
    Boxes
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { inventoryService } from '../services/inventoryService';

const Inventory = () => {
    const navigate = useNavigate();
    const [medicines, setMedicines] = useState([]); // Master data
    const [batches, setBatches] = useState([]); // Branch Batch tracking data
    const [centralBatches, setCentralBatches] = useState([]); // Central Batches
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [importProgress, setImportProgress] = useState(null);
    const [selectedMedicineDetail, setSelectedMedicineDetail] = useState(null);
    const [showBatchModal, setShowBatchModal] = useState(false);
    const [showLowStockOnly, setShowLowStockOnly] = useState(false);

    // Import Stock specific state
    const [showImportModal, setShowImportModal] = useState(false);
    const [selectedCentralBatch, setSelectedCentralBatch] = useState(null);
    const [importQuantity, setImportQuantity] = useState({ boxes: '', units: '' });
    const [successMessage, setSuccessMessage] = useState('');

    // Get user branch
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const branchId = user?.branch_id || 1;

    // Load Data
    const loadData = async () => {
        setLoading(true);
        try {
            const [localInvResponse, centralInvResponse] = await Promise.all([
                inventoryService.getInventoryByBranch(branchId),
                inventoryService.getCentralBatches()
            ]);

            if (!localInvResponse || !localInvResponse.success || !Array.from(localInvResponse.data)) {
                console.error("Invalid local inventory response:", localInvResponse);
                return;
            }

            const data = localInvResponse.data;
            const centralData = centralInvResponse?.success ? centralInvResponse.data : [];

            // Separate master data and tracking logic
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
                        minStockLevel: item.min_stock_level || 0,
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

            // Add central total available directly onto medicine object for checking
            const medicinesArray = Array.from(masterMap.values()).map(med => {
                const medCentralBatches = centralData.filter(b => b.medicine_id === med.medicine_id);
                const totalCentralStock = medCentralBatches.reduce((acc, curr) => acc + (curr.quantityStd || 0), 0);
                return {
                    ...med,
                    totalCentralStock,
                    centralBatchCount: medCentralBatches.length
                };
            });

            setMedicines(medicinesArray);
            setBatches(batchList);

            // Format central dataset adding statuses just in case they're displayed
                const centralBatchesFormatted = centralData.map(item => {
                    // Fallback for expiryDate (backend may send expiry_date)
                    const expiryDate = item.expiryDate || item.expiry_date || null;
                    // Fallback for quantityStd (backend may send quantity_std or current_total_quantity)
                    const quantityStd = item.quantityStd ?? item.quantity_std ?? item.current_total_quantity ?? 0;
                    return {
                        ...item,
                        expiryDate,
                        quantityStd,
                        status: getExpiryStatus(expiryDate)
                    };
                });
                setCentralBatches(centralBatchesFormatted);
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

    // Import Stock handlers
    const handleOpenImport = (medicine) => {
        setSelectedMedicineDetail(medicine);
        setSelectedCentralBatch(null);
        setImportQuantity({ boxes: '', units: '' });
        setShowImportModal(true);
    };

    const getCentralBatchesForMedicine = (medicineId) => {
        return centralBatches.filter(b => b.medicine_id === medicineId);
    };

    const handleImportSubmit = async () => {
        if (!selectedCentralBatch || !selectedMedicineDetail) {
            alert('Vui lòng chọn lô hàng');
            return;
        }

        const boxes = parseInt(importQuantity.boxes) || 0;
        const units = parseInt(importQuantity.units) || 0;
        const totalQty = (boxes * (selectedMedicineDetail.conversionRate || 1)) + units;

        if (totalQty <= 0) {
            alert('Vui lòng nhập số lượng hợp lệ');
            return;
        }

        if (totalQty > selectedCentralBatch.quantityStd) {
            alert('Số lượng vượt quá tồn kho tổng của lô này');
            return;
        }

        try {
            setLoading(true);
            await inventoryService.importStock(branchId, selectedCentralBatch.batch_id, totalQty);

            setSuccessMessage(`Đã nhập ${boxes} ${selectedMedicineDetail.baseUnit} ${units > 0 ? `+ ${units} ${selectedMedicineDetail.subUnit}` : ''} vào kho chi nhánh!`);
            setTimeout(() => {
                setSuccessMessage('');
                setShowImportModal(false);
                loadData();
            }, 2000);
        } catch (error) {
            console.error('Import failed:', error);
            alert('Lỗi khi nhập kho: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Filter logic for both tabs
    const filteredMedicines = medicines.filter(item => {
        const matchesSearch = item.medicineName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.activeIngredient?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = activeCategory === 'all' || item.categoryName === activeCategory;
        const matchesLowStock = !showLowStockOnly || item.totalStock <= item.minStockLevel;
        return matchesSearch && matchesCategory && matchesLowStock;
    });

    const filteredBatches = batches.filter(item => {
        const matchesSearch = item.medicineName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.batchNumber?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = activeCategory === 'all' || item.categoryName === activeCategory;
        return matchesSearch && matchesCategory;
    });

    // Extract unique categories
    const categories = ['all', ...new Set(medicines.map(m => m.categoryName).filter(Boolean))];

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

                {/* Import Success Message */}
                {successMessage && (
                    <div className="mx-10 mt-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-6 py-4 rounded-xl text-sm font-bold flex items-center gap-3">
                        <Package size={20} />
                        {successMessage}
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
                                    {filteredMedicines.length} Danh mục thuốc
                                </span>
                                <button 
                                    onClick={() => setShowLowStockOnly(!showLowStockOnly)}
                                    className={cn(
                                        "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all px-4 py-2 rounded-full border",
                                        showLowStockOnly 
                                            ? "bg-rose-500/20 border-rose-500/40 text-rose-400 hover:bg-rose-500/30" 
                                            : "bg-white/5 border-white/10 text-white/40 hover:text-white hover:border-white/20"
                                    )}
                                >
                                    <AlertTriangle size={14} /> Thuốc sắp hết
                                </button>
                            </div>
                        </div>

                        {/* Master Data Table */}
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
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => handleOpenImport(medicine)}
                                                                disabled={medicine.centralBatchCount === 0}
                                                                className={cn(
                                                                    "px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 leading-none",
                                                                    medicine.centralBatchCount > 0
                                                                        ? "bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white"
                                                                        : "bg-white/5 text-white/20 cursor-not-allowed"
                                                                )}
                                                                title="Nhập thêm thuốc từ kho tổng"
                                                            >
                                                                <ShoppingCart size={14} />
                                                                Nhập thuốc
                                                            </button>
                                                            <button
                                                                onClick={() => handleViewMedicineBatches(medicine)}
                                                                className="px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest bg-white/5 hover:bg-[#00ff80]/20 text-white/40 hover:text-[#00ff80] transition-all flex items-center gap-2 leading-none"
                                                                title="Xem chi tiết các lô đang có ở chi nhánh"
                                                            >
                                                                <Eye size={14} />
                                                                Chi tiết
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
            {/* Import Modal - Select Batch and Quantity from Central */}
            {showImportModal && selectedMedicineDetail && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-6" onClick={() => setShowImportModal(false)}>
                    <div className="bg-[#161a19] border border-white/10 rounded-[2rem] max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="p-8 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center">
                                    <ShoppingCart size={28} className="text-blue-400" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white mb-1">Nhập: {selectedMedicineDetail.medicineName}</h2>
                                    <p className="text-sm text-white/60">{selectedMedicineDetail.activeIngredient}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowImportModal(false)}
                                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-rose-500/20 text-white/40 hover:text-rose-400 transition-all flex items-center justify-center"
                            >
                                <XCircle size={20} />
                            </button>
                        </div>

                        <div className="p-8 overflow-auto max-h-[calc(90vh-180px)]">
                            <div className="grid grid-cols-3 gap-4 mb-8">
                                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-wider mb-2">Tồn kho chi nhánh</p>
                                    <p className="text-2xl font-black text-white">
                                        {Math.floor(selectedMedicineDetail.totalStock / (selectedMedicineDetail.conversionRate || 1))} {selectedMedicineDetail.baseUnit}
                                    </p>
                                    {selectedMedicineDetail.totalStock % (selectedMedicineDetail.conversionRate || 1) > 0 && (
                                        <p className="text-xs text-white/40 mt-1">
                                            + {selectedMedicineDetail.totalStock % (selectedMedicineDetail.conversionRate || 1)} {selectedMedicineDetail.subUnit}
                                        </p>
                                    )}
                                </div>
                                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-wider mb-2">Tồn kho tổng có sẵn</p>
                                    <p className="text-2xl font-black text-[#00ff80]">
                                        {Math.floor(selectedMedicineDetail.totalCentralStock / (selectedMedicineDetail.conversionRate || 1))} {selectedMedicineDetail.baseUnit}
                                    </p>
                                    {selectedMedicineDetail.totalCentralStock % (selectedMedicineDetail.conversionRate || 1) > 0 && (
                                        <p className="text-xs text-white/40 mt-1">
                                            + {selectedMedicineDetail.totalCentralStock % (selectedMedicineDetail.conversionRate || 1)} {selectedMedicineDetail.subUnit}
                                        </p>
                                    )}
                                </div>
                                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-wider mb-2">Ngưỡng cảnh báo</p>
                                    <p className={cn(
                                        "text-2xl font-black",
                                        selectedMedicineDetail.totalStock <= selectedMedicineDetail.minStockLevel 
                                            ? "text-rose-500" 
                                            : "text-white"
                                    )}>
                                        {Math.floor(selectedMedicineDetail.minStockLevel / (selectedMedicineDetail.conversionRate || 1))} {selectedMedicineDetail.baseUnit}
                                    </p>
                                    {selectedMedicineDetail.minStockLevel % (selectedMedicineDetail.conversionRate || 1) > 0 && (
                                        <p className="text-xs text-white/40 mt-1">
                                            + {selectedMedicineDetail.minStockLevel % (selectedMedicineDetail.conversionRate || 1)} {selectedMedicineDetail.subUnit}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Existing Batches at Branch */}
                            <div className="mb-8">
                                <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Boxes size={16} className="text-blue-400" />
                                    Các lô đang có tại chi nhánh ({getMedicineBatches(selectedMedicineDetail.medicine_id).length} lô)
                                </h3>
                                
                                {getMedicineBatches(selectedMedicineDetail.medicine_id).length === 0 ? (
                                    <div className="p-6 text-center text-white/40 bg-[#0d0f0e] rounded-2xl border border-white/5">
                                        Chưa có lô hàng nào tại chi nhánh
                                    </div>
                                ) : (
                                    <div className="bg-[#0d0f0e] rounded-2xl overflow-hidden border border-white/5">
                                        <table className="w-full">
                                            <thead className="bg-white/5">
                                                <tr className="text-[10px] font-black text-white/40 uppercase tracking-wider">
                                                    <th className="py-3 px-4 text-left">Số lô</th>
                                                    <th className="py-3 px-4 text-center">Hạn sử dụng</th>
                                                    <th className="py-3 px-4 text-center">Tồn kho</th>
                                                    <th className="py-3 px-4 text-center">Trạng thái</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {getMedicineBatches(selectedMedicineDetail.medicine_id).map((batch) => {
                                                    const boxQty = Math.floor(batch.quantityStd / (selectedMedicineDetail.conversionRate || 1));
                                                    const subQty = batch.quantityStd % (selectedMedicineDetail.conversionRate || 1);

                                                    return (
                                                        <tr key={batch.batch_id} className="hover:bg-white/5 transition-colors">
                                                            <td className="py-3 px-4">
                                                                <span className="text-sm font-bold text-[#00ff80]">{batch.batchNumber}</span>
                                                            </td>
                                                            <td className="py-3 px-4 text-center">
                                                                <span className={cn(
                                                                    "text-xs font-bold",
                                                                    batch.status === 'expired' || batch.status === 'critical' ? 'text-rose-500' :
                                                                        batch.status === 'warning' ? 'text-amber-500' : 'text-white/60'
                                                                )}>
                                                                    {batch.expiryDate ? new Date(batch.expiryDate).toLocaleDateString('vi-VN') : 'N/A'}
                                                                </span>
                                                            </td>
                                                            <td className="py-3 px-4">
                                                                <div className="flex flex-col items-center">
                                                                    <div className="flex items-baseline gap-1.5">
                                                                        <span className="text-sm font-black text-white">{boxQty}</span>
                                                                        <span className="text-[9px] font-bold text-white/40 uppercase">{selectedMedicineDetail.baseUnit}</span>
                                                                    </div>
                                                                    {subQty > 0 && (
                                                                        <div className="flex items-baseline gap-1 opacity-60">
                                                                            <Plus size={6} className="text-white" />
                                                                            <span className="text-xs font-bold text-white">{subQty}</span>
                                                                            <span className="text-[8px] font-bold text-white/50 uppercase">{selectedMedicineDetail.subUnit}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="py-3 px-4 text-center">
                                                                <div className={cn(
                                                                    "inline-flex items-center gap-1.5 px-2 py-1 rounded-full border text-[9px] font-black uppercase",
                                                                    getStatusColor(batch.status)
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
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Package size={16} className="text-[#00ff80]" />
                                Chọn lô hàng để nhập xuất từ kho tổng
                            </h3>

                            <div className="grid grid-cols-1 gap-3 mb-8">
                                {getCentralBatchesForMedicine(selectedMedicineDetail.medicine_id).length === 0 ? (
                                    <div className="p-10 text-center text-white/40 bg-[#0d0f0e] rounded-2xl border border-white/5">
                                        Không có lô hàng hợp lệ
                                    </div>
                                ) : (
                                    getCentralBatchesForMedicine(selectedMedicineDetail.medicine_id).map((batch) => {
                                        const boxQty = Math.floor((batch.quantityStd ?? 0) / (selectedMedicineDetail.conversionRate || 1));
                                        const subQty = (batch.quantityStd ?? 0) % (selectedMedicineDetail.conversionRate || 1);
                                        const isSelected = selectedCentralBatch?.batch_id === batch.batch_id;

                                        return (
                                            <button
                                                key={batch.batch_id}
                                                onClick={() => setSelectedCentralBatch(batch)}
                                                className={cn(
                                                    "p-5 rounded-2xl border-2 transition-all text-left grid grid-cols-6 gap-4 items-center",
                                                    isSelected
                                                        ? "bg-[#00ff80]/10 border-[#00ff80]/40 shadow-[0_0_20px_rgba(0,255,128,0.1)]"
                                                        : "bg-[#0d0f0e] border-white/5 hover:border-white/10"
                                                )}
                                            >
                                                <div className="col-span-2">
                                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-wider mb-1">Mã Lô</p>
                                                    <p className="text-lg font-black text-[#00ff80]">{batch.batchNumber}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-wider mb-1">Hạn SD</p>
                                                    <p className={cn(
                                                        "text-sm font-bold",
                                                        batch.status === 'expired' || batch.status === 'critical' ? 'text-rose-500' :
                                                            batch.status === 'warning' ? 'text-amber-500' : 'text-white/60'
                                                    )}>
                                                        {batch.expiryDate ? new Date(batch.expiryDate).toLocaleDateString('vi-VN') : 'N/A'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-wider mb-1">Tồn kho tổng</p>
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-lg font-black text-white">{boxQty}</span>
                                                        <span className="text-[10px] font-bold text-white/40 uppercase">{selectedMedicineDetail.baseUnit}</span>
                                                    </div>
                                                    {subQty > 0 && (
                                                        <p className="text-xs text-white/40">+ {subQty} {selectedMedicineDetail.subUnit}</p>
                                                    )}
                                                </div>
                                                <div className="flex justify-end col-span-2">
                                                    <div className={cn(
                                                        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[9px] font-black uppercase",
                                                        getStatusColor(batch.status)
                                                    )}>
                                                        {getStatusLabel(batch.status)}
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })
                                )}
                            </div>

                            {/* Quantity Input */}
                            {selectedCentralBatch && (
                                <div className="bg-[#0d0f0e] border border-[#00ff80]/20 rounded-2xl p-6">
                                    <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Boxes size={16} className="text-[#00ff80]" />
                                        Nhập số lượng muốn nhập từ lô {selectedCentralBatch.batchNumber}
                                    </h3>

                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div>
                                            <label className="text-xs font-bold text-white/60 uppercase tracking-wider block mb-2">
                                                Số lượng ({selectedMedicineDetail.baseUnit})
                                            </label>
                                            <input
                                                type="number"
                                                value={importQuantity.boxes}
                                                onChange={(e) => setImportQuantity({ ...importQuantity, boxes: e.target.value })}
                                                placeholder="0"
                                                min="0"
                                                max={Math.floor(selectedCentralBatch.quantityStd / (selectedMedicineDetail.conversionRate || 1))}
                                                className="w-full bg-[#161a19] border border-white/10 rounded-xl py-3 px-4 text-lg font-bold focus:outline-none focus:border-[#00ff80]/40 transition-all text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-white/60 uppercase tracking-wider block mb-2">
                                                Số lượng lẻ ({selectedMedicineDetail.subUnit})
                                            </label>
                                            <input
                                                type="number"
                                                value={importQuantity.units}
                                                onChange={(e) => setImportQuantity({ ...importQuantity, units: e.target.value })}
                                                placeholder="0"
                                                min="0"
                                                max={selectedMedicineDetail.conversionRate - 1}
                                                className="w-full bg-[#161a19] border border-white/10 rounded-xl py-3 px-4 text-lg font-bold focus:outline-none focus:border-[#00ff80]/40 transition-all text-white"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleImportSubmit}
                                        disabled={loading}
                                        className="w-full bg-[#00ff80] hover:bg-[#00e673] disabled:opacity-50 text-[#04110b] font-black uppercase tracking-widest text-sm px-6 py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_10px_20px_rgba(0,255,128,0.2)] active:scale-95"
                                    >
                                        Nhập Thuốc
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

export default Inventory;

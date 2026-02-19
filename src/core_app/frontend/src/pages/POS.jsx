import React, { useEffect, useState } from 'react';
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
    ChevronLeft,
    ChevronRight,
    ShieldCheck,
    Banknote,
    Users
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { cn } from '../lib/utils';
import { invoiceService } from '../services/invoiceService';
import { inventoryService } from '../services/inventoryService';

const POS = () => {
    const [medicines, setMedicines] = useState([]);
    const [activeCategory, setActiveCategory] = useState(0); // 0 = Tất cả
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;
    const [categories, setCategories] = useState([]);
    const [cart, setCart] = useState([]);
    const [quantities, setQuantities] = useState({}); // Local state for cards quantity inputs
    const [selectedUnits, setSelectedUnits] = useState({}); // { [medicineId]: 'base' | 'sub' }
    const [availableStock, setAvailableStock] = useState({}); // Track available stock for each medicine
    const [showInvoice, setShowInvoice] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [phone, setPhone] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showSearchDropdown, setShowSearchDropdown] = useState(false);

    // Get current user and branch for the invoice
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    // Placeholder for branch info until we have a real service
    const branch = { branch_name: "Chi nhánh chính", address: "Hệ thống trung tâm" };

    // Load Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch inventory for current branch (default 1)
                const response = await inventoryService.getInventoryByBranch(user?.branch_id || 1);

                // Check if response is successful and has data
                if (!response || !response.success || !Array.from(response.data)) {
                    console.error("Invalid inventory data structure:", response);
                    setLoading(false);
                    return;
                }

                const inventoryData = response.data;

                // Process inventory into Medicines with Batches
                const grouped = {};
                const cats = new Set();

                inventoryData.forEach(item => {
                    // Collect categories
                    if (item.category_id && item.category_name) {
                        cats.add(JSON.stringify({ category_id: item.category_id, category_name: item.category_name }));
                    }

                    if (!grouped[item.medicine_id]) {
                        grouped[item.medicine_id] = {
                            medicine_id: item.medicine_id,
                            name: item.medicine_name,
                            base_unit: item.base_unit,
                            sub_unit: item.sub_unit,
                            base_sell_price: item.base_sell_price || 0,
                            sub_sell_price: item.sub_sell_price || 0,
                            conversion_rate: item.conversion_rate || 1,
                            category_id: item.category_id,
                            batches: [],
                            // Add image placeholder if needed, or mapping logic
                            image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400"
                        };
                    }
                    grouped[item.medicine_id].batches.push({
                        batch_id: item.batch_id,
                        quantity_std: item.quantity_std,
                        expiry_date: item.expiry_date,
                        batch_number: item.batch_number
                    });
                });

                // Finalize medicines list
                const medicinesList = Object.values(grouped).map(m => {
                    // Calculate total stock (sum all batches in BASE units)
                    // If quantity_std seems to be in sub-units (abnormally high), convert it
                    m.total_stock = m.batches.reduce((sum, b) => {
                        let qty = b.quantity_std;

                        // Auto-detect: If quantity seems to be in sub-units (too large), convert to base
                        // Heuristic: If conversion_rate exists and quantity > 500, likely in sub-units
                        if (m.conversion_rate && m.conversion_rate > 1 && qty > 500) {
                            qty = Math.floor(qty / m.conversion_rate);
                            console.warn(`⚠️ ${m.name}: Auto-converted ${b.quantity_std} → ${qty} ${m.base_unit} (÷${m.conversion_rate})`);
                        }

                        return sum + qty;
                    }, 0);

                    // Sort batches by expiry (FIFO)
                    m.batches.sort((a, b) => new Date(a.expiry_date) - new Date(b.expiry_date));

                    // Debug: Log stock calculation for Hapacol
                    if (m.name?.includes('Hapacol')) {
                        console.log(`📦 ${m.name}:`, {
                            batches: m.batches.length,
                            quantities: m.batches.map(b => `Batch ${b.batch_number}: ${b.quantity_std}`),
                            total: m.total_stock,
                            conversion_rate: m.conversion_rate
                        });
                    }

                    return m;
                });

                setMedicines(medicinesList);
                setCategories(Array.from(cats).map(c => JSON.parse(c)));

                // Initialize available stock (same as total_stock initially)
                const stockMap = {};
                medicinesList.forEach(m => {
                    stockMap[m.medicine_id] = m.total_stock;
                });
                setAvailableStock(stockMap);

            } catch (error) {
                console.error("Failed to load POS data", error);
            }
        };
        fetchData();
    }, []);

    // Filter logic
    const filteredMedicines = activeCategory === 0
        ? medicines
        : medicines.filter(m => m.category_id === activeCategory);

    // Search results for autocomplete (Limit 5)
    const searchResults = searchTerm.trim() === ''
        ? []
        : medicines.filter(m =>
            (m.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (m.brand || '').toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, 5);

    // Pagination Logic (Only for "All" category)
    const displayMedicines = activeCategory === 0
        ? filteredMedicines.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
        : filteredMedicines;

    const totalPages = Math.ceil(filteredMedicines.length / ITEMS_PER_PAGE);

    const handleCategoryChange = (catId) => {
        setActiveCategory(catId);
        setCurrentPage(1); // Reset to page 1 when category changes
    };

    const getIcon = (type) => {
        switch (type) {
            case 'pill': return Pill;
            case 'flask': return FlaskConical;
            case 'thermometer': return Thermometer;
            case 'heart': return Heart;
            default: return Pill;
        }
    };

    const formatPrice = (price) => {
        return (price || 0).toLocaleString('vi-VN');
    };

    const handleUpdateLocalQty = (id, delta) => {
        setQuantities(prev => ({
            ...prev,
            [id]: Math.max(0, (prev[id] || 1) + delta)
        }));
    };

    const handleManualQtyChange = (id, value) => {
        if (value === '') {
            setQuantities(prev => ({ ...prev, [id]: '' }));
            return;
        }
        const val = parseInt(value);
        if (isNaN(val)) return;
        setQuantities(prev => ({
            ...prev,
            [id]: Math.max(0, val) // Allow 0 during typing
        }));
    };

    const handleUnitChange = (medicineId, unit) => {
        setSelectedUnits(prev => ({
            ...prev,
            [medicineId]: unit
        }));
    };

    const addToCart = (medicine) => {
        const qty = quantities[medicine.medicine_id] !== undefined ? quantities[medicine.medicine_id] : 1;
        if (qty <= 0) return; // Don't add if quantity is 0
        const unitType = selectedUnits[medicine.medicine_id] || 'base';
        const isSub = unitType === 'sub';

        const unitName = isSub ? medicine.sub_unit : medicine.base_unit;
        const price = isSub ? medicine.sub_sell_price : medicine.base_sell_price;
        const conversion = medicine.conversion_rate || 1;

        // Calculate requested quantity in BASE units
        const requestedQuota = isSub ? Math.ceil(qty / conversion) : qty;
        const currentAvailable = availableStock[medicine.medicine_id] || 0;

        // Check if enough stock available
        if (requestedQuota > currentAvailable) {
            alert(`Không đủ tồn kho! Chỉ còn ${currentAvailable} ${medicine.base_unit}`);
            return;
        }

        const existingItemIndex = cart.findIndex(item =>
            item.medicine_id === medicine.medicine_id && item.unit === unitName
        );

        if (existingItemIndex > -1) {
            const newCart = [...cart];
            newCart[existingItemIndex].quantity += qty;
            setCart(newCart);
        } else {
            setCart([...cart, {
                ...medicine,
                quantity: qty,
                price: price,
                unit: unitName,
                is_sub: isSub
            }]);
        }

        // Deduct from available stock
        setAvailableStock(prev => ({
            ...prev,
            [medicine.medicine_id]: prev[medicine.medicine_id] - requestedQuota
        }));

        // Reset quantity
        setQuantities(prev => ({ ...prev, [medicine.medicine_id]: 1 }));
    };

    const removeFromCart = (item) => {
        // Find medicine to get conversion rate
        const medicine = medicines.find(m => m.medicine_id === item.medicine_id);
        if (!medicine) return;

        const conversion = medicine.conversion_rate || 1;
        const isSub = item.unit === medicine.sub_unit;

        // Calculate how much to restore in BASE units
        const restoreQuota = isSub ? Math.ceil(item.quantity / conversion) : item.quantity;

        // Restore stock
        setAvailableStock(prev => ({
            ...prev,
            [item.medicine_id]: prev[item.medicine_id] + restoreQuota
        }));

        // Remove from cart
        setCart(cart.filter(i => !(i.medicine_id === item.medicine_id && i.unit === item.unit)));
    };

    const clearCart = () => {
        // Restore all stock
        cart.forEach(item => {
            const medicine = medicines.find(m => m.medicine_id === item.medicine_id);
            if (!medicine) return;

            const conversion = medicine.conversion_rate || 1;
            const isSub = item.unit === medicine.sub_unit;
            const restoreQuota = isSub ? Math.ceil(item.quantity / conversion) : item.quantity;

            setAvailableStock(prev => ({
                ...prev,
                [item.medicine_id]: prev[item.medicine_id] + restoreQuota
            }));
        });

        // Clear cart
        setCart([]);
    };

    const totalAmount = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const handleCheckout = () => {
        if (cart.length > 0) {
            setShowInvoice(true);
        }
    };

    const confirmPayment = async () => {
        setLoading(true);

        // Debug: Check user data
        console.log('👤 Current user:', user);

        // Check if user is logged in (either pharmacist_id or username exists)
        if (!user || (!user.pharmacist_id && !user.username)) {
            alert('Lỗi: Thông tin người dùng không hợp lệ. Vui lòng đăng nhập lại!');
            setLoading(false);
            return;
        }

        // Process cart allocations (FIFO)
        const detailsPayload = [];

        for (const item of cart) {
            const medicine = medicines.find(m => m.medicine_id === item.medicine_id);
            if (!medicine) continue;

            let remainingQty = item.quantity;
            let allocated = 0;

            // Batches are already sorted by expiry in 'medicines' state
            for (const batch of medicine.batches) {
                if (remainingQty <= 0) break;

                const take = Math.min(remainingQty, batch.quantity_std);
                if (take > 0) {
                    detailsPayload.push({
                        batch_id: batch.batch_id,
                        unit_sold: item.base_unit,
                        quantity_sold: take,
                        unit_price: item.price,
                        total_std_quantity: take * (item.conversion_rate || 1) // Assuming selling base unit
                    });
                    remainingQty -= take;
                    allocated += take;
                }
            }

            if (remainingQty > 0) {
                alert(`Lỗi: Thuốc ${item.name} không đủ tồn kho để thực hiện giao dịch này! (Thiếu ${remainingQty})`);
                setLoading(false);
                return;
            }
        }

        // Construct SQL-aligned payload
        const payload = {
            branch_id: user?.branch_id || 1,
            pharmacist_id: user?.pharmacist_id || 1,
            customer_phone: phone || null, // Send phone number to backend
            customer_name: customerName || null, // Send customer name to backend
            total_amount: totalAmount,
            is_simulated: false, // Real sale from POS
            details: detailsPayload
        };

        console.log('💰 Creating invoice with payload:', payload);

        try {
            // Call the API service
            const response = await invoiceService.createInvoice(payload);
            console.log('✅ Invoice created successfully:', response);

            // Success feedback
            setSuccess(true);
            setTimeout(() => {
                setCart([]);
                setShowInvoice(false);
                setSuccess(false);
                setPhone('');
                setCustomerName('');
                setLoading(false);

                // Reload inventory data to refresh stock
                window.location.reload();
            }, 1500);
        } catch (error) {
            console.error('❌ API Error:', error);
            console.error('Error details:', error.response?.data || error.message);
            alert(`Lỗi khi đẩy dữ liệu xuống Backend!\n${error.response?.data?.error || error.message}\n(Kiểm tra Console để biết thêm chi tiết)`);
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
                            placeholder="Tìm tên thuốc, thương hiệu..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setShowSearchDropdown(true);
                            }}
                            onFocus={() => setShowSearchDropdown(true)}
                            className="w-full bg-[#1a1d1c] border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-[#00ff80]/20 transition-all text-white"
                        />

                        {/* Autocomplete Dropdown */}
                        {showSearchDropdown && searchResults.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1d1c] border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
                                {searchResults.map((medicine) => (
                                    <button
                                        key={`search-${medicine.medicine_id}`}
                                        onClick={() => {
                                            addToCart(medicine);
                                            setSearchTerm('');
                                            setShowSearchDropdown(false);
                                        }}
                                        className="w-full flex items-center gap-4 px-6 py-4 hover:bg-[#00ff80]/5 transition-colors border-b border-white/5 last:border-0 text-left group/item"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20 group-hover/item:text-[#00ff80] transition-colors">
                                            <Pill size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-white truncate">{medicine.name}</p>
                                            <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">{medicine.brand || 'No Brand'}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-[#00ff80]">{formatPrice(medicine.base_sell_price)}đ</p>
                                            <p className="text-[10px] text-white/20 font-bold uppercase">Còn: {medicine.total_stock} {medicine.base_unit}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Close dropdown on click outside logic is usually handling with a global listener or a transparent overlay, 
                            but for this implementation Plan we'll keep it simple or add a backdrop if needed. 
                            Let's add a simple overlay to handle clicks outside. */}
                        {showSearchDropdown && searchTerm.length > 0 && (
                            <div className="fixed inset-0 z-[55]" onClick={() => setShowSearchDropdown(false)} />
                        )}
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
                        onClick={() => handleCategoryChange(0)}
                        className={cn(
                            "px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all border",
                            activeCategory === 0 ? "bg-[#00ff80] border-[#00ff80] text-[#04110b] shadow-[0_0_20px_rgba(0,255,128,0.2)]" : "bg-white/5 border-white/5 text-white/40 hover:text-white"
                        )}
                    >
                        Tất cả
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat.category_id}
                            onClick={() => handleCategoryChange(cat.category_id)}
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
                <div className="flex-1 overflow-auto p-10 pt-4 flex flex-col">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6 content-start mb-auto">
                        {displayMedicines.map(medicine => {
                            if (!medicine) return null; // Defensive check
                            const localQty = quantities[medicine.medicine_id] !== undefined ? quantities[medicine.medicine_id] : 1;
                            const selectedUnit = selectedUnits[medicine.medicine_id] || 'base';
                            const displayPrice = selectedUnit === 'sub' ? medicine.sub_sell_price : medicine.base_sell_price;
                            const displayUnit = selectedUnit === 'sub' ? medicine.sub_unit : medicine.base_unit;

                            // Calculate available stock in the selected unit
                            const baseStock = availableStock[medicine.medicine_id] || 0;
                            const conversionRate = medicine.conversion_rate || 1;
                            const displayStock = selectedUnit === 'sub'
                                ? Math.floor(baseStock * conversionRate)  // Convert to sub-units (e.g., 10 boxes * 100 = 1000 pills)
                                : baseStock; // Keep as base units

                            return (
                                <div key={medicine.medicine_id} className="bg-[#161a19] border border-white/5 rounded-3xl p-6 flex flex-col hover:border-[#00ff80]/30 transition-all group overflow-hidden relative">
                                    {/* Category Tag */}
                                    <div className="absolute top-4 right-4 bg-white/5 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded text-white/30 group-hover:bg-[#00ff80]/10 group-hover:text-[#00ff80] transition-all">
                                        {medicine.category_name}
                                    </div>

                                    <h3 className="text-base font-black text-white mb-2">{medicine.name}</h3>
                                    {/* Available Stock Display - Shows in selected unit */}
                                    <div className="flex items-center gap-2 mb-1">
                                        <PackageSearch size={14} className="text-white/30" />
                                        <span className={cn(
                                            "text-xs font-bold",
                                            displayStock === 0 ? "text-red-400" :
                                                displayStock < (selectedUnit === 'sub' ? 100 : 10) ? "text-yellow-400" :
                                                    "text-white/50"
                                        )}>
                                            Còn: {displayStock} {displayUnit}
                                        </span>
                                    </div>                                    <div className="flex items-baseline gap-1 mb-6">
                                        <span className="text-xl font-black text-[#00ff80] tracking-tighter">{formatPrice(displayPrice)}</span>
                                        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">VNĐ / {displayUnit}</span>
                                    </div>

                                    {/* Unit Selector - Only if sub_unit exists */}
                                    {medicine.sub_unit && (
                                        <div className="mb-4">
                                            <select
                                                value={selectedUnit}
                                                onChange={(e) => handleUnitChange(medicine.medicine_id, e.target.value)}
                                                className="w-full bg-[#0d0f0e] border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-[#00ff80]/50 cursor-pointer appearance-none"
                                            >
                                                <option value="base">{medicine.base_unit} (Quy chuẩn)</option>
                                                <option value="sub">{medicine.sub_unit} (Bán lẻ)</option>
                                            </select>
                                        </div>
                                    )}

                                    {/* Qty Selector */}
                                    <div className="mt-auto grid grid-cols-1 gap-3">
                                        <div className="flex items-center justify-between bg-[#0d0f0e] border border-white/5 rounded-2xl p-1.5 px-3">
                                            <button
                                                onClick={() => handleUpdateLocalQty(medicine.medicine_id, -1)}
                                                className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-[#00ff80] hover:bg-white/10 transition-all font-bold"
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <input
                                                type="number"
                                                value={localQty}
                                                placeholder="1"
                                                onChange={(e) => handleManualQtyChange(medicine.medicine_id, e.target.value)}
                                                onFocus={(e) => {
                                                    handleManualQtyChange(medicine.medicine_id, '');
                                                    e.target.select();
                                                }}
                                                onBlur={() => {
                                                    if (localQty === '' || localQty <= 0) {
                                                        handleManualQtyChange(medicine.medicine_id, 1);
                                                    }
                                                }}
                                                className="w-12 bg-transparent text-center font-black text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-white/20"
                                            />
                                            <button
                                                onClick={() => handleUpdateLocalQty(medicine.medicine_id, 1)}
                                                className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-[#00ff80] hover:bg-white/10 transition-all font-bold"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => addToCart(medicine)}
                                            disabled={displayStock === 0}
                                            className={cn(
                                                "w-full font-black uppercase tracking-widest text-[11px] py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all",
                                                displayStock === 0
                                                    ? "bg-white/5 text-white/20 cursor-not-allowed border border-white/5"
                                                    : "bg-[#00ff80] hover:bg-[#00e673] text-[#04110b] shadow-[0_10px_20px_rgba(0,255,128,0.1)] active:scale-95"
                                            )}
                                        >
                                            <ShoppingCart size={16} strokeWidth={3} />
                                            {displayStock === 0 ? "Hết hàng" : "Thêm vào giỏ"}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination Controls - Only show if activeCategory is "All" and there are pages */}
                    {activeCategory === 0 && totalPages > 1 && (
                        <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-4">
                            <div className="text-xs font-black text-white/30 uppercase tracking-widest">
                                Món {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredMedicines.length)} trong {filteredMedicines.length}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-xl bg-white/5 text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 disabled:cursor-not-allowed transition-all"
                                >
                                    <ChevronLeft size={20} />
                                </button>

                                <div className="flex items-center gap-1">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                                        .filter(page => {
                                            // Show first, last, current, and adjacent pages
                                            return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
                                        })
                                        .map((page, index, array) => {
                                            // Add ellipsis logic
                                            const prevPage = array[index - 1];
                                            const showEllipsis = prevPage && page - prevPage > 1;

                                            return (
                                                <React.Fragment key={page}>
                                                    {showEllipsis && <span className="text-white/20 text-xs font-black px-2">...</span>}
                                                    <button
                                                        onClick={() => setCurrentPage(page)}
                                                        className={cn(
                                                            "w-8 h-8 rounded-lg text-xs font-black transition-all flex items-center justify-center",
                                                            currentPage === page
                                                                ? "bg-[#00ff80] text-[#04110b] shadow-[0_0_15px_rgba(0,255,128,0.25)] scale-110"
                                                                : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white"
                                                        )}
                                                    >
                                                        {page}
                                                    </button>
                                                </React.Fragment>
                                            );
                                        })}
                                </div>

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-xl bg-white/5 text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 disabled:cursor-not-allowed transition-all"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Right Sidebar: Cart Panel */}
            <aside className="w-[440px] border-l border-[#00ff80]/10 bg-[#141415] flex flex-col shrink-0 p-8 shadow-[-20px_0_50px_rgba(0,0,0,0.5)]">

                <div className="bg-[#1c1c1e] border border-white/5 rounded-[2.5rem] flex-1 flex flex-col p-8 shadow-2xl overflow-hidden relative">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-black text-white">Giỏ hàng</h2>
                            <div className="bg-[#00ff80]/10 text-[#00ff80] text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border border-[#00ff80]/20">
                                {cart.length} món
                            </div>
                        </div>
                        {cart.length > 0 && (
                            <button
                                onClick={clearCart}
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
                            <div className="h-full flex flex-col items-center justify-center gap-6 group/empty">
                                <div className="p-8 rounded-full bg-[#00ff80]/5 border border-[#00ff80]/10 group-hover/empty:scale-110 group-hover/empty:bg-[#00ff80]/10 transition-all duration-500">
                                    <PackageSearch size={80} strokeWidth={1} className="text-[#00ff80]/40 group-hover/empty:text-[#00ff80]/60" />
                                </div>
                                <div className="text-center">
                                    <p className="font-black uppercase tracking-[0.25em] text-xs text-[#00ff80]/60 mb-2">Giỏ hàng trống</p>
                                    <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest italic">"Sẵn sàng phục vụ khách hàng!"</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {cart.map(item => (
                                    <div key={item.medicine_id} className="bg-white/[0.02] border border-white/5 rounded-3xl p-5 flex items-center gap-0 hover:border-white/10 transition-all group">
                                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/40 group-hover:text-[#00ff80] transition-colors">
                                            {React.createElement(getIcon(item.icon), { size: 20 })}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-white text-sm truncate">{item.name}</p>
                                            <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-0.5">{item.quantity} x {formatPrice(item.price)}đ</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-white tabular-nums tracking-tighter">{formatPrice(item.price * item.quantity)}đ</p>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item)}
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
                                    placeholder="Tên khách hàng (tùy chọn)"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    className="w-full bg-[#0d0f0e] border border-white/5 rounded-2xl py-3.5 px-6 text-sm focus:outline-none focus:border-[#00ff80]/30 transition-all text-white placeholder:text-white/10"
                                />
                            </div>
                            <div className="relative group">
                                <input
                                    type="text"
                                    placeholder="Số điện thoại khách hàng (tùy chọn)"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full bg-[#0d0f0e] border border-white/5 rounded-2xl py-3.5 px-6 text-sm focus:outline-none focus:border-[#00ff80]/30 transition-all text-white placeholder:text-white/10"
                                />
                            </div>
                            <div className="flex justify-between items-center px-2">
                                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Tạm tính</span>
                                <span className="font-black text-white/40 tabular-nums">{formatPrice(totalAmount)} đ</span>
                            </div>
                            <div className="flex justify-between items-end px-2 pt-2">
                                <span className="text-xs font-black text-white uppercase tracking-[0.2em]">Tổng thanh toán</span>
                                <span className="text-3xl font-black text-white tracking-tighter tabular-nums leading-none">
                                    {formatPrice(totalAmount)} <span className="text-xs ml-1 font-black opacity-30 text-white">đ</span>
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={handleCheckout}
                            className={cn(
                                "w-full font-black uppercase tracking-[0.25em] text-sm py-5 rounded-2xl transition-all transform active:scale-95 disabled:opacity-20 flex items-center justify-center gap-3",
                                cart.length > 0
                                    ? "bg-[#00ff80] text-[#04110b] shadow-[0_15px_40px_rgba(0,255,128,0.3)] hover:shadow-[0_20px_50px_rgba(0,255,128,0.4)] hover:-translate-y-0.5"
                                    : "bg-white/5 text-white/20 border border-white/5"
                            )}
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
                                                    <p className="text-[10px] text-white/20 font-bold uppercase">{item.quantity} x {formatPrice(item.price)}đ</p>
                                                </div>
                                            </div>
                                            <p className="text-sm font-black text-white tabular-nums">{formatPrice(item.price * item.quantity)} <span className="text-[10px] text-white/30 ml-1">đ</span></p>
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
                                        {formatPrice(totalAmount)} <span className="text-xs ml-1">đ</span>
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

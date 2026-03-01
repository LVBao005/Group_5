import React, { useState, useEffect } from 'react';
import {
    Search,
    User,
    TrendingUp,
    Package,
    Users,
    Receipt,
    RefreshCw,
    Activity
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/dashboard/StatCard';
import RevenueChart from '../components/dashboard/RevenueChart';
import CategoryPieChart from '../components/dashboard/CategoryPieChart';
import AlertsList from '../components/dashboard/AlertsList';
import dashboardService from '../services/dashboardService';
import LiveClock from '../components/common/LiveClock';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalMedicines: 0,
        totalCustomers: 0,
        lowStockCount: 0,
        expiringCount: 0
    });
    const [revenueData, setRevenueData] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
    const [alerts, setAlerts] = useState({ expiring: [], lowStock: [] });
    const [period, setPeriod] = useState('today');
    const [loading, setLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState(new Date());
    const [isRefreshing, setIsRefreshing] = useState(false);

    const loadDashboardData = async () => {
        try {
            setIsRefreshing(true);

            // Load stats
            const statsRes = await dashboardService.getStats(period);
            if (statsRes.success) {
                setStats(statsRes.data);
            }

            // Load revenue timeline
            const revenueRes = await dashboardService.getRevenueTimeline(period);
            if (revenueRes.success) {
                setRevenueData(revenueRes.data);
            }

            // Load category data
            const categoryRes = await dashboardService.getRevenueByCategory(period);
            if (categoryRes.success) {
                setCategoryData(categoryRes.data);
            }

            // Load alerts
            const alertsRes = await dashboardService.getAlerts();
            if (alertsRes.success) {
                setAlerts(alertsRes.data);
            }

            setLastUpdate(new Date());
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    // Initial load
    useEffect(() => {
        loadDashboardData();
    }, [period]);

    // Auto-refresh every 30 seconds for real-time data
    useEffect(() => {
        const interval = setInterval(() => {
            loadDashboardData();
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, [period]);

    const handleRefresh = () => {
        loadDashboardData();
    };

    if (loading) {
        return (
            <div className="flex h-screen bg-[#0d0f0e] items-center justify-center">
                <div className="text-center">
                    <RefreshCw className="w-12 h-12 text-emerald-400 animate-spin mx-auto mb-4" />
                    <p className="text-white/60 font-bold">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#0d0f0e] text-slate-200 overflow-hidden font-sans">
            <Sidebar />

            <main className="flex-1 flex flex-col min-w-0 bg-[#0d0f0e]">
                {/* Top Header */}
                <header className="h-20 flex items-center px-10 gap-8 shrink-0 border-b border-white/5">
                    <h1 className="text-xl font-black text-white whitespace-nowrap uppercase tracking-widest">
                        Dashboard
                    </h1>

                    <div className="relative flex-1 max-w-xl group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#00ff80] transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm báo cáo, khách hàng..."
                            className="w-full bg-[#1a1d1c] border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-[#00ff80]/20 transition-all text-white"
                        />
                    </div>

                    <div className="flex items-center gap-4 ml-auto">
                        <button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="flex items-center gap-2 px-4 py-2 bg-[#1a1d1c] border border-white/5 rounded-xl hover:border-emerald-500/30 transition-all text-sm font-bold text-white/80 hover:text-emerald-400 disabled:opacity-50"
                        >
                            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                            <span className="hidden lg:inline">Làm mới</span>
                        </button>

                        <LiveClock />

                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/20 hover:text-white transition-colors cursor-pointer border border-white/5">
                            <User size={20} />
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <div className="flex-1 overflow-auto p-10 pt-6">
                    <div className="max-w-[1800px] mx-auto space-y-8">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard
                                title="Doanh Thu Hôm Nay"
                                value={stats.totalRevenue}
                                icon={TrendingUp}
                                format="currency"
                                color="emerald"
                            />
                            <StatCard
                                title="Đơn Hàng"
                                value={stats.totalOrders}
                                icon={Receipt}
                                color="blue"
                            />
                            <StatCard
                                title="Sản Phẩm"
                                value={stats.totalMedicines}
                                icon={Package}
                                color="violet"
                            />
                            <StatCard
                                title="Khách Hàng"
                                value={stats.totalCustomers}
                                icon={Users}
                                color="amber"
                            />
                        </div>

                        {/* Period Selector */}
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-white/60">
                                <Activity size={18} />
                                <span className="text-sm font-bold uppercase tracking-wider">Khoảng thời gian:</span>
                            </div>
                            <div className="flex gap-2">
                                {[
                                    { value: 'today', label: 'Hôm nay' },
                                    { value: 'week', label: '7 ngày' },
                                    { value: 'month', label: '30 ngày' },
                                    { value: 'all', label: 'Tất cả' }
                                ].map((p) => (
                                    <button
                                        key={p.value}
                                        onClick={() => setPeriod(p.value)}
                                        className={`px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wider transition-all ${period === p.value
                                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                            : 'bg-[#1a1d1c] text-white/60 border border-white/5 hover:border-white/20'
                                            }`}
                                    >
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <RevenueChart data={revenueData} period={period} />
                            <CategoryPieChart data={categoryData} />
                        </div>

                        {/* Alerts */}
                        <div>
                            <div className="mb-4">
                                <h2 className="text-xl font-black text-white uppercase tracking-wide">
                                    Cảnh Báo & Theo Dõi
                                </h2>
                                <p className="text-xs text-white/40 font-bold uppercase tracking-widest mt-1">
                                    {stats.expiringCount} sản phẩm sắp hết hạn • {stats.lowStockCount} sản phẩm sắp hết hàng
                                </p>
                            </div>
                            <AlertsList alerts={alerts} />
                        </div>

                        {/* Last Update */}
                        <div className="text-center text-xs text-white/20 font-bold uppercase tracking-widest">
                            Cập nhật lần cuối: {lastUpdate.toLocaleTimeString('vi-VN')}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;

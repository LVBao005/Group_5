import React from 'react';
import {
    ShoppingCart,
    Receipt,
    LayoutDashboard,
    Package,
    Bell,
    Pill,
    LogOut,
    User
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { MOCK_BRANCHES } from '../mockData';

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Get current user from localStorage
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    // Find branch name
    const branch = MOCK_BRANCHES.find(b => b.branch_id === user?.branch_id);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    const menuItems = [
        { icon: ShoppingCart, label: 'Bán hàng', path: '/pos' },
        { icon: Receipt, label: 'Hóa đơn', path: '/invoices' },
        { icon: LayoutDashboard, label: 'Báo cáo', path: '/dashboard' },
        { icon: Package, label: 'Kho thuốc', path: '/inventory' },
    ];

    return (
        <aside className="w-64 bg-[#0a0a0b] border-r border-white/5 flex flex-col h-screen sticky top-0 shrink-0">
            <div className="p-6">
                {/* Logo */}
                <div className="flex items-center gap-3 mb-10">
                    <div className="w-10 h-10 bg-[#00ff80] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(0,255,128,0.3)]">
                        <Pill size={22} className="text-[#04110b]" />
                    </div>
                    <div>
                        <h2 className="text-white font-extrabold text-xl tracking-tight leading-none italic">Pharma<span className="text-[#00ff80]">POS</span></h2>
                        <p className="text-[10px] text-emerald-500/50 uppercase tracking-widest font-bold mt-1">
                            Dược sĩ: {user?.fullName?.split(' ').pop() || 'Admin'}
                        </p>
                    </div>
                </div>

                <nav className="space-y-3">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const isPOS = (location.pathname === '/' || location.pathname === '/pos') && item.path === '/pos';
                        const active = isActive || isPOS;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 relative overflow-hidden group",
                                    active
                                        ? "bg-[#00ff80] text-[#04110b] shadow-[0_10px_25px_rgba(0,255,128,0.2)] font-bold"
                                        : "text-white/40 hover:text-white hover:bg-white/5"
                                )}
                            >
                                <item.icon size={20} strokeWidth={active ? 2.5 : 2} />
                                <span className="text-sm">{item.label}</span>
                                {active && (
                                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-[#04110b]/20" />
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="mt-auto p-4 m-4 bg-white/5 rounded-2xl border border-white/5 group transition-colors">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-[#00ff80] border-2 border-emerald-500/20">
                        <User size={20} strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate uppercase">{user?.fullName || 'CHƯA ĐĂNG NHẬP'}</p>
                        <p className="text-[10px] text-emerald-500/60 uppercase tracking-wider font-bold truncate">
                            {branch?.branch_name || 'Quầy số 01'}
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all shrink-0 group/logout active:scale-90"
                        title="Đăng xuất ngay"
                    >
                        <LogOut size={18} className="transition-transform group-hover/logout:translate-x-0.5" />
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;

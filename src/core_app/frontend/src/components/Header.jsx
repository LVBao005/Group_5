import React from 'react';
import { Pill, Bell, User, Search, Menu } from 'lucide-react';
import Button from '../components/Button';

const Header = () => {
    return (
        <header className="h-20 bg-[#0a1a12]/80 backdrop-blur-xl border-b border-emerald-500/10 px-8 flex items-center justify-between sticky top-0 z-50">
            <div className="flex items-center gap-8">
                {/* Mobile Toggle */}
                <button className="lg:hidden text-emerald-500">
                    <Menu size={24} />
                </button>

                {/* Logo */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#00ff80] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(0,255,128,0.2)]">
                        <Pill size={20} className="text-[#04110b]" />
                    </div>
                    <div>
                        <h2 className="text-white font-bold leading-tight">PharmaPOS</h2>
                        <p className="text-[10px] text-emerald-500/50 uppercase tracking-widest font-bold">Manager v1.0</p>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="hidden md:flex relative group w-80 ml-4">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/30 group-focus-within:text-emerald-500 transition-colors" size={16} />
                    <input
                        type="text"
                        placeholder="Tìm nhanh (Alt + K)"
                        className="w-full bg-[#06140e] border border-emerald-500/10 rounded-full py-2 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500/30 transition-all"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative">
                    <Bell size={20} />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0a1a12]" />
                </Button>

                {/* Divider */}
                <div className="w-px h-6 bg-emerald-500/10 mx-2" />

                {/* User Profile */}
                <div className="flex items-center gap-3 pl-2 cursor-pointer group">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-white group-hover:text-emerald-500 transition-colors">Admin User</p>
                        <p className="text-[10px] text-emerald-500/50 uppercase tracking-wider">Quản trị viên</p>
                    </div>
                    <div className="w-10 h-10 bg-emerald-900/20 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500 group-hover:border-emerald-500 transition-all">
                        <User size={20} />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;

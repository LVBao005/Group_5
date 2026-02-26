import React from 'react';

const Footer = () => {
    return (
        <footer className="py-6 px-8 border-t border-emerald-500/5 bg-[#04110b]">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4 text-[10px] text-emerald-900 font-bold uppercase tracking-widest">
                    <span>System Status: <span className="text-emerald-500">Online</span></span>
                    <span className="hidden md:block w-1 h-1 bg-emerald-900 rounded-full" />
                    <span>Server: VN-SOUTH-01</span>
                </div>

                <p className="text-[10px] text-emerald-900 font-bold uppercase tracking-widest">
                    © 2026 PharmaPOS Global • All Rights Reserved
                </p>

                <div className="flex gap-6">
                    <a href="#" className="text-[10px] text-emerald-900 hover:text-emerald-500 font-bold uppercase tracking-widest transition-colors">Hỗ trợ</a>
                    <a href="#" className="text-[10px] text-emerald-900 hover:text-emerald-500 font-bold uppercase tracking-widest transition-colors">Tài liệu</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

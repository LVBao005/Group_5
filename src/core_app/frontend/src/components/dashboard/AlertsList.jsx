import React from 'react';
import { AlertTriangle, PackageX, Clock } from 'lucide-react';

/**
 * AlertsList Component - Displays warnings for expiring and low stock medicines
 */
const AlertsList = ({ alerts }) => {
    const { expiring = [], lowStock = [] } = alerts || {};

    const getSeverityColor = (daysUntilExpiry) => {
        if (daysUntilExpiry <= 7) return 'rose';
        if (daysUntilExpiry <= 15) return 'amber';
        return 'yellow';
    };

    const getSeverityBg = (color) => {
        const colors = {
            rose: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
            amber: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
            yellow: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
        };
        return colors[color] || colors.yellow;
    };

    const getStockSeverityColor = (quantity) => {
        if (quantity <= 10) return 'rose';
        if (quantity <= 30) return 'amber';
        return 'yellow';
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Expiring Soon */}
            <div className="bg-[#161a19] border border-white/5 rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                        <Clock size={20} className="text-amber-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-white uppercase tracking-wide">
                            Sắp Hết Hạn
                        </h3>
                        <p className="text-xs text-white/40 font-bold uppercase tracking-widest">
                            {expiring.length} sản phẩm cần chú ý
                        </p>
                    </div>
                </div>

                <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
                    {expiring.length > 0 ? (
                        expiring.map((item, index) => {
                            const severityColor = getSeverityColor(item.daysUntilExpiry);
                            return (
                                <div
                                    key={`expiring-${index}`}
                                    className={`border rounded-2xl p-4 transition-all hover:scale-[1.02] ${getSeverityBg(severityColor)}`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1">
                                            <h4 className="font-bold text-white mb-1 text-sm">
                                                {item.name}
                                            </h4>
                                            <div className="space-y-1 text-xs">
                                                <p className="text-white/60 font-bold">
                                                    Lô: <span className="text-white">{item.batchId}</span>
                                                </p>
                                                <p className="text-white/60 font-bold">
                                                    HSD: <span className="text-white">{item.expiryDate}</span>
                                                </p>
                                                <p className="text-white/60 font-bold">
                                                    Số lượng: <span className="text-white">{item.quantity}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                                            severityColor === 'rose' ? 'bg-rose-500/20 text-rose-300' :
                                            severityColor === 'amber' ? 'bg-amber-500/20 text-amber-300' :
                                            'bg-yellow-500/20 text-yellow-300'
                                        }`}>
                                            {item.daysUntilExpiry} ngày
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Clock size={48} className="text-white/10 mb-3" />
                            <p className="text-white/20 font-bold uppercase tracking-widest text-sm">
                                Không có cảnh báo
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Low Stock */}
            <div className="bg-[#161a19] border border-white/5 rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-2xl bg-rose-500/10 flex items-center justify-center">
                        <PackageX size={20} className="text-rose-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-white uppercase tracking-wide">
                            Sắp Hết Hàng
                        </h3>
                        <p className="text-xs text-white/40 font-bold uppercase tracking-widest">
                            {lowStock.length} sản phẩm cần nhập
                        </p>
                    </div>
                </div>

                <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
                    {lowStock.length > 0 ? (
                        lowStock.map((item, index) => {
                            const severityColor = getStockSeverityColor(item.quantity);
                            return (
                                <div
                                    key={`lowstock-${index}`}
                                    className={`border rounded-2xl p-4 transition-all hover:scale-[1.02] ${getSeverityBg(severityColor)}`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1">
                                            <h4 className="font-bold text-white mb-1 text-sm">
                                                {item.name}
                                            </h4>
                                            <div className="space-y-1 text-xs">
                                                <p className="text-white/60 font-bold">
                                                    Lô: <span className="text-white">{item.batchId}</span>
                                                </p>
                                                <p className="text-white/60 font-bold">
                                                    Đơn vị: <span className="text-white">{item.unit || 'Viên'}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                                            severityColor === 'rose' ? 'bg-rose-500/20 text-rose-300' :
                                            severityColor === 'amber' ? 'bg-amber-500/20 text-amber-300' :
                                            'bg-yellow-500/20 text-yellow-300'
                                        }`}>
                                            {item.quantity} {item.unit || 'Viên'}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <PackageX size={48} className="text-white/10 mb-3" />
                            <p className="text-white/20 font-bold uppercase tracking-widest text-sm">
                                Không có cảnh báo
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AlertsList;

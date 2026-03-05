import React, { useState, useEffect } from 'react';
import { User, Shield, Building, Edit2, Trash2, Save, X, LogOut, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { pharmacistService } from '../services/pharmacistService';
import { authService } from '../services/authService';
import LiveClock from '../components/common/LiveClock';

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Form states
    const [formData, setFormData] = useState({
        full_name: '',
        role: '',
        branch_id: ''
    });

    useEffect(() => {
        const storedUser = authService.getCurrentUser();
        if (!storedUser) {
            navigate('/login');
            return;
        }
        setUser(storedUser);
        setFormData({
            full_name: storedUser.full_name || storedUser.fullName || '',
            role: storedUser.role || '',
            branch_id: storedUser.branch_id || storedUser.branchId || ''
        });
    }, [navigate]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const updateData = {
                pharmacist_id: user.pharmacist_id || user.pharmacistId,
                full_name: formData.full_name,
                role: formData.role,
                branch_id: parseInt(formData.branch_id)
            };

            const response = await pharmacistService.updatePharmacist(updateData);

            if (response.success) {
                // Update local user data
                const newUser = { ...user, ...formData };
                localStorage.setItem('user', JSON.stringify(newUser));
                setUser(newUser);
                setIsEditing(false);
                setMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' });
            } else {
                setMessage({ type: 'error', text: response.error || 'Cập nhật thất bại' });
            }
        } catch (error) {
            console.error('Update error:', error);
            setMessage({ type: 'error', text: 'Lỗi hệ thống khi cập nhật' });
        } finally {
            setLoading(false);
        }
    };


    if (!user) return null;

    return (
        <div className="flex min-h-screen bg-[#050505] text-white">
            <Sidebar />

            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-20 bg-[#0a0a0b]/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-8 sticky top-0 z-10">
                    <div>
                        <h1 className="text-xl font-black text-white tracking-tight uppercase">Thông tin tài khoản</h1>
                        <p className="text-[10px] text-emerald-500/50 font-bold uppercase tracking-widest mt-0.5">Quản lý hồ sơ dược sĩ</p>
                    </div>
                    <LiveClock />
                </header>

                <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-4xl mx-auto">
                        {/* Profile Card */}
                        <div className="bg-[#0a0a0b] border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#00ff80]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                            <div className="p-8">
                                <div className="flex flex-col md:flex-row gap-8 items-start">
                                    {/* Avatar/Icon Section */}
                                    <div className="shrink-0">
                                        <div className="w-32 h-32 rounded-3xl bg-[#00ff80]/10 border border-[#00ff80]/20 flex items-center justify-center relative">
                                            <User size={64} className="text-[#00ff80]" />
                                            <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-[#00ff80] text-[#04110b] flex items-center justify-center shadow-lg border-4 border-[#0a0a0b]">
                                                <Shield size={20} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Info Section */}
                                    <div className="flex-1 w-full">
                                        <div className="flex items-center justify-between mb-6">
                                            <div>
                                                <h2 className="text-3xl font-black tracking-tight">{user.full_name || user.fullName}</h2>
                                                <p className="text-emerald-500/60 font-medium uppercase tracking-widest text-xs mt-1">ID: #{user.pharmacist_id || user.pharmacistId}</p>
                                            </div>
                                            {!isEditing ? (
                                                <button
                                                    onClick={() => setIsEditing(true)}
                                                    className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl flex items-center gap-2 transition-all border border-white/5 font-bold text-sm active:scale-95"
                                                >
                                                    <Edit2 size={16} /> Chỉnh sửa
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => setIsEditing(false)}
                                                    className="px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl flex items-center gap-2 transition-all border border-red-500/10 font-bold text-sm"
                                                >
                                                    <X size={16} /> Hủy bỏ
                                                </button>
                                            )}
                                        </div>

                                        {message.text && (
                                            <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 border ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                                {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                                                <p className="text-sm font-bold">{message.text}</p>
                                            </div>
                                        )}

                                        <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Username - Disabled */}
                                            <div className="space-y-2 opacity-60">
                                                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                                                    <User size={12} /> Tên đăng nhập (Bảo mật)
                                                </label>
                                                <div className="w-full px-4 py-3.5 bg-white/5 rounded-xl border border-white/5 text-white/50 font-bold select-none cursor-not-allowed">
                                                    {user.username}
                                                </div>
                                            </div>

                                            {/* Branch - Editable */}
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                                                    <Building size={12} /> Chi nhánh (ID)
                                                </label>
                                                <input
                                                    type="number"
                                                    disabled={!isEditing}
                                                    value={formData.branch_id}
                                                    onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                                                    className="w-full px-4 py-3.5 bg-white/5 rounded-xl border border-white/5 focus:border-[#00ff80]/30 outline-none transition-all font-bold placeholder:text-white/10 disabled:cursor-not-allowed"
                                                />
                                            </div>

                                            {/* Full Name - Editable */}
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                                                    Họ và Tên công tác
                                                </label>
                                                <input
                                                    type="text"
                                                    disabled={!isEditing}
                                                    value={formData.full_name}
                                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                                    className="w-full px-4 py-3.5 bg-white/5 rounded-xl border border-white/5 focus:border-[#00ff80]/30 outline-none transition-all font-bold placeholder:text-white/10 disabled:cursor-not-allowed"
                                                />
                                            </div>

                                            {/* Role - Editable */}
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                                                    <Shield size={12} /> Vai trò hệ thống
                                                </label>
                                                <select
                                                    disabled={!isEditing}
                                                    value={formData.role}
                                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                                    className="w-full px-4 py-3.5 bg-white/5 rounded-xl border border-white/5 focus:border-[#00ff80]/30 outline-none transition-all font-bold disabled:cursor-not-allowed appearance-none"
                                                >
                                                    <option value="STAFF" className="bg-[#0a0a0b]">STAFF</option>
                                                    <option value="ADMIN" className="bg-[#0a0a0b]">ADMIN</option>
                                                </select>
                                            </div>

                                            {isEditing && (
                                                <div className="md:col-span-2 pt-4 flex gap-4">
                                                    <button
                                                        type="submit"
                                                        disabled={loading}
                                                        className="flex-1 py-4 bg-[#00ff80] text-[#04110b] font-black uppercase tracking-widest text-sm rounded-2xl shadow-[0_10px_30px_rgba(0,255,128,0.2)] hover:shadow-[0_15px_40px_rgba(0,255,128,0.3)] hover:-translate-y-1 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:translate-y-0"
                                                    >
                                                        {loading ? "Đang xử lý..." : <><Save size={18} /> Lưu thay đổi</>}
                                                    </button>
                                                </div>
                                            )}
                                        </form>

                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Additional Info Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                            <div className="bg-[#0a0a0b] border border-white/5 p-6 rounded-3xl">
                                <h3 className="text-xs font-black uppercase tracking-widest text-[#00ff80] mb-4">Chi nhánh hiện tại</h3>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5">
                                        <Building size={20} className="text-white/40" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-black">{user.branchName || user.branch_name || "Quầy trung tâm"}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[#0a0a0b] border border-white/5 p-6 rounded-3xl flex flex-col justify-center items-center gap-4 group cursor-pointer hover:bg-white/5 transition-colors" onClick={() => navigate('/pos')}>
                                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Quay lại làm việc</p>
                                <div className="flex items-center gap-2 text-[#00ff80] group-hover:gap-4 transition-all">
                                    <span className="text-xl font-black">MỞ MÁY BÁN HÀNG</span>
                                    <Edit2 size={24} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Profile;

import React, { useState, useEffect } from 'react';
import { User, Eye, EyeOff, UserPlus, Pill, Loader2, Building, Shield } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../components/Button';
import Input from '../components/Input';
import axios from '../api/axios';

const Register = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [branches, setBranches] = useState([]);

    const [formData, setFormData] = useState({
        username: '',
        password: '',
        fullName: '',
        role: 'STAFF',
        branchId: ''
    });

    // Load branches from API
    useEffect(() => {
        const loadBranches = async () => {
            try {
                console.log('Loading branches...');
                const response = await axios.get('/branches');
                console.log('Branches response:', response.data);
                setBranches(response.data);
                if (response.data.length > 0) {
                    setFormData(prev => ({ ...prev, branchId: response.data[0].branch_id }));
                }
            } catch (err) {
                console.error('Error loading branches:', err);
                console.error('Error details:', err.response);
            }
        };
        loadBranches();
    }, []);

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = await axios.post('/pharmacists', {
                username: formData.username,
                password: formData.password,
                full_name: formData.fullName,
                role: formData.role,
                branch_id: parseInt(formData.branchId)
            });

            if (response.data.success) {
                setSuccess('Đăng ký thành công! Chuyển đến trang đăng nhập...');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                setError(response.data.error || 'Đăng ký thất bại');
            }
        } catch (err) {
            console.error('Register error:', err);
            setError(err.response?.data?.error || 'Không thể kết nối đến server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#04110b] relative flex items-center justify-center overflow-hidden p-4">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-900/20 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-emerald-900/10 blur-[150px] rounded-full translate-x-1/3 translate-y-1/3" />

            {/* Register Card */}
            <div className="w-full max-w-[520px] z-10">
                <div className="bg-[#0a1a12]/80 backdrop-blur-xl border border-emerald-500/10 rounded-[2rem] p-8 md:p-12 shadow-2xl relative">

                    {/* Logo Section */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-20 h-20 bg-[#00ff80] rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(0,255,128,0.4)] mb-6 transition-transform hover:scale-105 duration-300">
                            <div className="relative">
                                <div className="w-10 h-10 border-4 border-[#04110b] rounded-lg flex items-center justify-center">
                                    <div className="w-4 h-1 border-t-4 border-[#04110b]" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-1 h-4 border-l-4 border-[#04110b]" />
                                    </div>
                                </div>
                                <div className="absolute -top-1 left-1 right-1 h-1.5 bg-[#04110b] rounded-t-sm" />
                            </div>
                        </div>

                        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                            Đăng ký tài khoản
                        </h1>
                        <p className="text-emerald-500/60 text-center text-sm">
                            Tạo tài khoản mới cho hệ thống
                        </p>
                    </div>

                    {/* Form */}
                    <form className="space-y-5" onSubmit={handleRegister}>
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs py-3 px-4 rounded-xl text-center font-bold">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs py-3 px-4 rounded-xl text-center font-bold">
                                {success}
                            </div>
                        )}

                        <Input
                            label="Tên đăng nhập"
                            placeholder="Nhập tên đăng nhập"
                            icon={User}
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            required
                        />

                        <div className="relative">
                            <Input
                                label="Mật khẩu"
                                type={showPassword ? "text" : "password"}
                                placeholder="Nhập mật khẩu"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 bottom-3 text-emerald-500/40 hover:text-emerald-500 transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <Input
                            label="Họ và tên"
                            placeholder="Nhập họ và tên đầy đủ"
                            icon={User}
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            required
                        />

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-emerald-500/70 uppercase tracking-wider ml-1">
                                Vai trò
                            </label>
                            <div className="relative group">
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full bg-[#06140e] border border-emerald-500/10 rounded-2xl py-3 pl-5 pr-12 text-white focus:outline-none focus:border-emerald-500/40 focus:ring-4 focus:ring-emerald-500/5 transition-all appearance-none"
                                    required
                                >
                                    <option value="STAFF" className="bg-[#06140e] text-white">Nhân viên (Staff)</option>
                                    <option value="ADMIN" className="bg-[#06140e] text-white">Quản trị viên (Admin)</option>
                                </select>
                                <Shield className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500/40 pointer-events-none" size={18} />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-emerald-500/70 uppercase tracking-wider ml-1">
                                Chi nhánh
                            </label>
                            <div className="relative group">
                                <select
                                    value={formData.branchId}
                                    onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                                    className="w-full bg-[#06140e] border border-emerald-500/10 rounded-2xl py-3 pl-5 pr-12 text-white focus:outline-none focus:border-emerald-500/40 focus:ring-4 focus:ring-emerald-500/5 transition-all appearance-none"
                                    required
                                >
                                    {branches.length === 0 ? (
                                        <option value="" className="bg-[#06140e] text-white">Đang tải...</option>
                                    ) : (
                                        branches.map(branch => (
                                            <option key={branch.branch_id} value={branch.branch_id} className="bg-[#06140e] text-white">
                                                {branch.branch_name}
                                            </option>
                                        ))
                                    )}
                                </select>
                                <Building className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500/40 pointer-events-none" size={18} />
                            </div>
                        </div>

                        <Button
                            variant="primary"
                            size="lg"
                            className="w-full mt-6 gap-3"
                            disabled={loading}
                            type="submit"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={22} />
                                    <span>ĐANG XỬ LÝ...</span>
                                </>
                            ) : (
                                <>
                                    <span>ĐĂNG KÝ</span>
                                    <UserPlus size={22} strokeWidth={2.5} />
                                </>
                            )}
                        </Button>

                        <div className="text-center mt-6">
                            <p className="text-sm text-emerald-500/60">
                                Đã có tài khoản?{' '}
                                <Link to="/login" className="text-emerald-500 hover:text-emerald-400 font-semibold transition-colors">
                                    Đăng nhập ngay
                                </Link>
                            </p>
                        </div>
                    </form>

                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-32 h-1 bg-emerald-500/20 blur-sm rounded-full" />
                </div>

                <p className="text-center mt-12 text-emerald-900 text-xs tracking-widest uppercase font-bold">
                    Pharmacy Management System • v1.0
                </p>
            </div>
        </div>
    );
};

export default Register;

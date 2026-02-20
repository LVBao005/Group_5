import React, { useState } from 'react';
import { User, Eye, EyeOff, LogIn, Pill, Loader2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../components/Button';
import Input from '../components/Input';
import { authService } from '../services/authService';

const Login = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await authService.login(formData.username, formData.password);
            
            if (response.success) {
                // Đăng nhập thành công, chuyển đến trang POS
                navigate('/pos');
            } else {
                setError(response.error || 'Đăng nhập thất bại');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(err.error || 'Không thể kết nối đến server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#04110b] relative flex items-center justify-center overflow-hidden p-4">
            {/* Background Gradients/Glows */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-900/20 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-emerald-900/10 blur-[150px] rounded-full translate-x-1/3 translate-y-1/3" />

            {/* Sidebar-like UI elements in background */}
            <div className="absolute left-8 top-8 hidden lg:block opacity-20">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-6">
                    <Pill className="text-emerald-500" size={20} />
                </div>
                <div className="space-y-4">
                    <div className="w-32 h-2.5 bg-emerald-900/40 rounded-full" />
                    <div className="w-24 h-2.5 bg-emerald-900/20 rounded-full" />
                </div>
            </div>

            {/* Login Card */}
            <div className="w-full max-w-[480px] z-10">
                <div className="bg-[#0a1a12]/80 backdrop-blur-xl border border-emerald-500/10 rounded-[2rem] p-8 md:p-12 shadow-2xl relative">

                    {/* Logo Section */}
                    <div className="flex flex-col items-center mb-10">
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

                        <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">
                            Đăng nhập hệ thống
                        </h1>
                        <p className="text-emerald-500/60 text-center text-sm leading-relaxed max-w-[280px]">
                            Sử dụng <b>admin / 123</b> để đăng nhập dùng thử.
                        </p>
                    </div>

                    {/* Form */}
                    <form className="space-y-6" onSubmit={handleLogin}>
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs py-3 px-4 rounded-xl text-center font-bold">
                                {error}
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

                        <div className="flex items-center justify-between px-1">
                            <label className="flex items-center gap-3 cursor-pointer group text-sm">
                                <div className="relative flex items-center">
                                    <input type="checkbox" className="peer sr-only" />
                                    <div className="w-5 h-5 bg-[#06140e] border border-emerald-500/20 rounded-md peer-checked:bg-emerald-500 peer-checked:border-emerald-500 transition-all" />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 peer-checked:opacity-100 transition-opacity">
                                        <div className="w-2 h-3 border-r-2 border-b-2 border-[#04110b] rotate-45 mb-1" />
                                    </div>
                                </div>
                                <span className="text-emerald-500/70 group-hover:text-emerald-500 transition-colors">Ghi nhớ đăng nhập</span>
                            </label>

                            <Link to="/register" className="text-sm text-emerald-500/70 hover:text-emerald-400 font-medium transition-colors">
                                Đăng ký tài khoản
                            </Link>
                        </div>

                        <Button
                            variant="primary"
                            size="lg"
                            className="w-full mt-4 gap-3"
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
                                    <span>ĐĂNG NHẬP</span>
                                    <LogIn size={22} strokeWidth={2.5} />
                                </>
                            )}
                        </Button>
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

export default Login;

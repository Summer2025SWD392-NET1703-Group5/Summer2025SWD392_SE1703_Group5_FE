





import React, { useState } from 'react';
import { XMarkIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/SimpleAuthContext';
import LoadingSpinner from './LoadingSpinner';


interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    defaultTab?: 'login' | 'register' | 'forgot-password';
}


const AuthModal: React.FC<AuthModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    defaultTab = 'login'
}) => {
    const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot-password'>(defaultTab);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { login, register, forgotPassword, isLoading, error, clearError } = useAuth();


    // Form states
    const [loginForm, setLoginForm] = useState({
        email: '',
        password: ''
    });


    const [registerForm, setRegisterForm] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phoneNumber: '',
        dateOfBirth: '',
        sex: 'Male',
        address: ''
    });


    const [forgotPasswordForm, setForgotPasswordForm] = useState({
        email: ''
    });


    const [successMessage, setSuccessMessage] = useState('');


    // Reset forms khi đóng modal
    const handleClose = () => {
        setLoginForm({ email: '', password: '' });
        setRegisterForm({
            fullName: '',
            email: '',
            password: '',
            confirmPassword: '',
            phoneNumber: '',
            dateOfBirth: '',
            sex: 'Male',
            address: ''
        });
        setForgotPasswordForm({ email: '' });
        setSuccessMessage('');
        clearError();
        onClose();
    };


    // Handle tab change
    const handleTabChange = (tab: 'login' | 'register' | 'forgot-password') => {
        setActiveTab(tab);
        clearError();
        setSuccessMessage('');
    };


    // Handle login
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login({
                Email: loginForm.email,
                Password: loginForm.password
            });

            setSuccessMessage('Đăng nhập thành công!');
            setTimeout(() => {
                handleClose();
                onSuccess?.();
            }, 1000);
        } catch (error) {
            console.error('Login error:', error);
        }
    };


    // Handle register
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (registerForm.password !== registerForm.confirmPassword) {
            alert('Mật khẩu xác nhận không khớp!');
            return;
        }


        try {
            await register({
                FullName: registerForm.fullName,
                Email: registerForm.email,
                Password: registerForm.password,
                ConfirmPassword: registerForm.confirmPassword,
                PhoneNumber: registerForm.phoneNumber,
                DateOfBirth: registerForm.dateOfBirth,
                Sex: registerForm.sex as 'Male' | 'Female' | 'Other',
                Address: registerForm.address
            });

            setSuccessMessage('Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.');
            setTimeout(() => {
                handleClose();
                onSuccess?.();
            }, 2000);
        } catch (error) {
            console.error('Register error:', error);
        }
    };


    // Handle forgot password
    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await forgotPassword(forgotPasswordForm.email);
            setSuccessMessage('Email khôi phục mật khẩu đã được gửi! Vui lòng kiểm tra hộp thư của bạn.');
        } catch (error) {
            console.error('Forgot password error:', error);
        }
    };


    if (!isOpen) return null;


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative bg-slate-800 rounded-2xl p-8 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors"
                >
                    <XMarkIcon className="w-6 h-6" />
                </button>


                {/* Header */}
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">
                        {activeTab === 'login' && 'Đăng nhập'}
                        {activeTab === 'register' && 'Đăng ký tài khoản'}
                        {activeTab === 'forgot-password' && 'Quên mật khẩu'}
                    </h2>
                    <p className="text-gray-400">
                        {activeTab === 'login' && 'Đăng nhập để đặt vé xem phim'}
                        {activeTab === 'register' && 'Tạo tài khoản mới để trải nghiệm'}
                        {activeTab === 'forgot-password' && 'Nhập email để khôi phục mật khẩu'}
                    </p>
                </div>


                {/* Success Message */}
                {successMessage && (
                    <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 text-sm">
                        {successMessage}
                    </div>
                )}


                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                        {error}
                    </div>
                )}


                {/* Login Form */}
                {activeTab === 'login' && (
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                required
                                value={loginForm.email}
                                onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:border-[#FFD875] focus:outline-none transition-colors"
                                placeholder="Nhập email của bạn"
                            />
                        </div>


                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Mật khẩu
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={loginForm.password}
                                    onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:border-[#FFD875] focus:outline-none transition-colors pr-12"
                                    placeholder="Nhập mật khẩu"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                                >
                                    {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>


                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#FFD875] hover:bg-[#FFD875]/80 text-black font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isLoading ? <LoadingSpinner size="small" /> : 'Đăng nhập'}
                        </button>


                        <div className="text-center space-y-2">
                            <button
                                type="button"
                                onClick={() => handleTabChange('forgot-password')}
                                className="text-[#FFD875] hover:text-[#FFD875]/80 text-sm transition-colors"
                            >
                                Quên mật khẩu?
                            </button>
                            <p className="text-gray-400 text-sm">
                                Chưa có tài khoản?{' '}
                                <button
                                    type="button"
                                    onClick={() => handleTabChange('register')}
                                    className="text-[#FFD875] hover:text-[#FFD875]/80 transition-colors"
                                >
                                    Đăng ký ngay
                                </button>
                            </p>
                        </div>
                    </form>
                )}


                {/* Register Form */}
                {activeTab === 'register' && (
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Họ và tên *
                            </label>
                            <input
                                type="text"
                                required
                                value={registerForm.fullName}
                                onChange={(e) => setRegisterForm(prev => ({ ...prev, fullName: e.target.value }))}
                                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:border-[#FFD875] focus:outline-none transition-colors"
                                placeholder="Nhập họ và tên"
                            />
                        </div>


                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Email *
                            </label>
                            <input
                                type="email"
                                required
                                value={registerForm.email}
                                onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:border-[#FFD875] focus:outline-none transition-colors"
                                placeholder="Nhập email"
                            />
                        </div>


                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Số điện thoại
                                </label>
                                <input
                                    type="tel"
                                    value={registerForm.phoneNumber}
                                    onChange={(e) => setRegisterForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:border-[#FFD875] focus:outline-none transition-colors"
                                    placeholder="Số điện thoại"
                                />
                            </div>


                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Giới tính
                                </label>
                                <select
                                    value={registerForm.sex}
                                    onChange={(e) => setRegisterForm(prev => ({ ...prev, sex: e.target.value }))}
                                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-[#FFD875] focus:outline-none transition-colors"
                                >
                                    <option value="Male">Nam</option>
                                    <option value="Female">Nữ</option>
                                    <option value="Other">Khác</option>
                                </select>
                            </div>
                        </div>


                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Ngày sinh
                            </label>
                            <input
                                type="date"
                                value={registerForm.dateOfBirth}
                                onChange={(e) => setRegisterForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-[#FFD875] focus:outline-none transition-colors"
                            />
                        </div>


                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Địa chỉ
                            </label>
                            <textarea
                                value={registerForm.address}
                                onChange={(e) => setRegisterForm(prev => ({ ...prev, address: e.target.value }))}
                                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:border-[#FFD875] focus:outline-none transition-colors"
                                placeholder="Nhập địa chỉ"
                                rows={2}
                            />
                        </div>


                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Mật khẩu *
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={registerForm.password}
                                    onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:border-[#FFD875] focus:outline-none transition-colors pr-12"
                                    placeholder="Nhập mật khẩu"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                                >
                                    {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>


                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Xác nhận mật khẩu *
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    required
                                    value={registerForm.confirmPassword}
                                    onChange={(e) => setRegisterForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:border-[#FFD875] focus:outline-none transition-colors pr-12"
                                    placeholder="Nhập lại mật khẩu"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                                >
                                    {showConfirmPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>


                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#FFD875] hover:bg-[#FFD875]/80 text-black font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isLoading ? <LoadingSpinner size="small" /> : 'Đăng ký'}
                        </button>


                        <div className="text-center">
                            <p className="text-gray-400 text-sm">
                                Đã có tài khoản?{' '}
                                <button
                                    type="button"
                                    onClick={() => handleTabChange('login')}
                                    className="text-[#FFD875] hover:text-[#FFD875]/80 transition-colors"
                                >
                                    Đăng nhập
                                </button>
                            </p>
                        </div>
                    </form>
                )}


                {/* Forgot Password Form */}
                {activeTab === 'forgot-password' && (
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                required
                                value={forgotPasswordForm.email}
                                onChange={(e) => setForgotPasswordForm(prev => ({ ...prev, email: e.target.value }))}
                                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:border-[#FFD875] focus:outline-none transition-colors"
                                placeholder="Nhập email để khôi phục mật khẩu"
                            />
                        </div>


                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#FFD875] hover:bg-[#FFD875]/80 text-black font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isLoading ? <LoadingSpinner size="small" /> : 'Gửi email khôi phục'}
                        </button>


                        <div className="text-center">
                            <p className="text-gray-400 text-sm">
                                Nhớ lại mật khẩu?{' '}
                                <button
                                    type="button"
                                    onClick={() => handleTabChange('login')}
                                    className="text-[#FFD875] hover:text-[#FFD875]/80 transition-colors"
                                >
                                    Đăng nhập
                                </button>
                            </p>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};


export default AuthModal;


import React, { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { userService } from '../../services/userService';
import type { ChangePasswordData } from '../../types/user';

type FormInputs = ChangePasswordData;

const schema = yup.object().shape({
    OldPassword: yup.string().required('Mật khẩu hiện tại là bắt buộc'),
    NewPassword: yup
        .string()
        .required('Mật khẩu mới là bắt buộc')
        .min(8, 'Mật khẩu mới phải có ít nhất 8 ký tự')
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt'
        ),
    ConfirmNewPassword: yup
        .string()
        .oneOf([yup.ref('NewPassword')], 'Mật khẩu xác nhận không khớp')
        .required('Vui lòng xác nhận mật khẩu mới'),
});

const Security: React.FC = () => {
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<FormInputs>({
        resolver: yupResolver(schema),
    });

    const onSubmit: SubmitHandler<FormInputs> = async (data) => {
        setError(null);
        setSuccess(null);
        try {
            await userService.changePassword(data);
            setSuccess('Đổi mật khẩu thành công!');
            reset();
        } catch (err: any) {
            setError(err.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
        }
    };

    return (
        <div className="animate-fadeInUp">
            <h2 className="text-2xl font-normal text-white mb-6">Bảo mật và Đăng nhập</h2>
            <div className="glass-dark rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-lg font-light text-white mb-4">Đổi mật khẩu</h3>

                {error && <div className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4">{error}</div>}
                {success && <div className="bg-green-500/20 text-green-400 p-3 rounded-lg mb-4">{success}</div>}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-gray-400 text-sm font-light mb-2">Mật khẩu hiện tại</label>
                        <div className="relative">
                            <input
                                type={showOldPassword ? 'text' : 'password'}
                                {...register('OldPassword')}
                                className={`w-full p-3 glass-dark text-white rounded-lg border ${errors.OldPassword ? 'border-red-500' : 'border-gray-600'} focus:border-[#ffd875] focus:outline-none transition-colors pr-12`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowOldPassword(!showOldPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                                {showOldPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                            </button>
                        </div>
                        {errors.OldPassword && <p className="text-red-400 text-sm mt-1">{errors.OldPassword.message}</p>}
                    </div>

                    <div>
                        <label className="block text-gray-400 text-sm font-light mb-2">Mật khẩu mới</label>
                        <div className="relative">
                            <input
                                type={showNewPassword ? 'text' : 'password'}
                                {...register('NewPassword')}
                                className={`w-full p-3 glass-dark text-white rounded-lg border ${errors.NewPassword ? 'border-red-500' : 'border-gray-600'} focus:border-[#ffd875] focus:outline-none transition-colors pr-12`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                                {showNewPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                            </button>
                        </div>
                        {errors.NewPassword && <p className="text-red-400 text-sm mt-1">{errors.NewPassword.message}</p>}
                    </div>

                    <div>
                        <label className="block text-gray-400 text-sm font-light mb-2">Xác nhận mật khẩu mới</label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                {...register('ConfirmNewPassword')}
                                className={`w-full p-3 glass-dark text-white rounded-lg border ${errors.ConfirmNewPassword ? 'border-red-500' : 'border-gray-600'} focus:border-[#ffd875] focus:outline-none transition-colors pr-12`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                                {showConfirmPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                            </button>
                        </div>
                        {errors.ConfirmNewPassword && <p className="text-red-400 text-sm mt-1">{errors.ConfirmNewPassword.message}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-primary w-full sm:w-auto disabled:opacity-50"
                    >
                        {isSubmitting ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Security; 
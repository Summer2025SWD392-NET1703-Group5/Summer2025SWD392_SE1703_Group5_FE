import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheckIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  LockClosedIcon,
  KeyIcon,
  ExclamationCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-hot-toast';
import { userService } from '../../../services/userService';

// Password change validation schema
const passwordSchema = yup.object().shape({
  currentPassword: yup
    .string()
    .required('Mật khẩu hiện tại là bắt buộc'),
  newPassword: yup
    .string()
    .required('Mật khẩu mới là bắt buộc')
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số'),
  confirmPassword: yup
    .string()
    .required('Xác nhận mật khẩu là bắt buộc')
    .oneOf([yup.ref('newPassword')], 'Mật khẩu xác nhận không khớp'),
});

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const Security: React.FC = () => {
  const [showVerifyPhone, setShowVerifyPhone] = useState(false);
  const [showVerifyEmail, setShowVerifyEmail] = useState(false);
  const [showEnableTwoFactor, setShowEnableTwoFactor] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [verificationCode, setVerificationCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');

  const { control, handleSubmit, reset, setError, formState: { errors, isValid } } = useForm<PasswordFormData>({
    resolver: yupResolver(passwordSchema),
    mode: 'onChange',
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }
  });

  // Mock user security data
  const securityInfo = {
    lastLogin: '15/06/2024, 10:30',
    lastLoginIp: '192.168.1.1',
    lastLoginDevice: 'Chrome on Windows',
    phoneVerified: false,
    emailVerified: true,
    twoFactorEnabled: false,
    email: 'nguyenvana@example.com',
    phone: ''
  };

  const handleVerifyPhone = () => {
    // Handle phone verification logic
    alert('Đã gửi mã xác thực đến số điện thoại của bạn');
    setShowVerifyPhone(true);
  };

  const handleSubmitPhoneCode = () => {
    // Handle phone verification code submission
    alert('Xác thực số điện thoại thành công!');
    setShowVerifyPhone(false);
    setVerificationCode('');
  };

  const handleVerifyEmail = () => {
    // Handle email verification logic
    alert('Đã gửi mã xác thực đến email của bạn');
    setShowVerifyEmail(true);
  };

  const handleSubmitEmailCode = () => {
    // Handle email verification code submission
    alert('Xác thực email thành công!');
    setShowVerifyEmail(false);
    setVerificationCode('');
  };

  const handleEnableTwoFactor = () => {
    // Handle two-factor authentication setup
    setShowEnableTwoFactor(true);
  };

  const handleSubmitTwoFactor = () => {
    // Handle two-factor setup submission
    alert('Đã bật xác thực hai yếu tố thành công!');
    setShowEnableTwoFactor(false);
    setVerificationCode('');
  };

  const handleUpdatePhone = () => {
    // Handle phone number update
    alert('Cập nhật số điện thoại thành công!');
    setPhoneNumber('');
  };

  const handleUpdateEmail = () => {
    // Handle email update
    alert('Cập nhật email thành công!');
    setEmail('');
  };

  const onSubmit = async (data: PasswordFormData) => {
    setIsSubmitting(true);
    try {
      await userService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      toast.success('Đổi mật khẩu thành công!');
      reset();
    } catch (error: any) {
      const errorMessage = error.message || 'Có lỗi xảy ra khi đổi mật khẩu';
      if (errorMessage.toLowerCase().includes('mật khẩu hiện tại')) {
        setError('currentPassword', { type: 'manual', message: errorMessage });
      } else {
        setError('root.serverError', { type: 'manual', message: errorMessage });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: '', color: '' };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;

    switch (strength) {
      case 0:
      case 1:
        return { strength: 20, label: 'Rất yếu', color: 'bg-red-500' };
      case 2:
        return { strength: 40, label: 'Yếu', color: 'bg-orange-500' };
      case 3:
        return { strength: 60, label: 'Trung bình', color: 'bg-yellow-500' };
      case 4:
        return { strength: 80, label: 'Mạnh', color: 'bg-blue-500' };
      case 5:
        return { strength: 100, label: 'Rất mạnh', color: 'bg-emerald-500' };
      default:
        return { strength: 0, label: '', color: '' };
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Section */}
      <motion.div
        variants={itemVariants}
        className="flex items-center space-x-3"
      >
        <div className="p-3 bg-[#FFD875]/10 rounded-xl border border-[#FFD875]/20">
          <ShieldCheckIcon className="w-6 h-6 text-[#FFD875]" />
        </div>
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-[#FFD875] to-[#FFC107] bg-clip-text text-transparent">
            Bảo mật tài khoản
          </h2>
          <p className="text-slate-400 text-sm">Quản lý mật khẩu và bảo mật tài khoản</p>
        </div>
      </motion.div>

      {/* Change Password Section */}
      <motion.div
        variants={itemVariants}
        className="bg-slate-700/30 rounded-xl p-6 border border-slate-600/30"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-[#FFD875]/10 rounded-lg">
            <KeyIcon className="w-5 h-5 text-[#FFD875]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Đổi mật khẩu</h3>
            <p className="text-slate-400 text-sm">Cập nhật mật khẩu để bảo mật tài khoản</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Server Error */}
          {errors.root?.serverError && (
            <div className="flex items-center p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg">
              <ExclamationCircleIcon className="w-5 h-5 mr-2" />
              <span>{errors.root.serverError.message}</span>
            </div>
          )}

          {/* Current Password */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-3">
              Mật khẩu hiện tại <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Controller
                name="currentPassword"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type={showCurrentPassword ? 'text' : 'password'}
                    className="w-full p-4 pl-12 pr-12 bg-slate-700/50 text-white rounded-xl border border-slate-600/50 focus:border-[#FFD875] focus:outline-none focus:ring-2 focus:ring-[#FFD875]/20 transition-all duration-300 placeholder-slate-400"
                    placeholder="Nhập mật khẩu hiện tại"
                  />
                )}
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <LockClosedIcon className={`w-5 h-5 ${errors.currentPassword ? 'text-red-400' : 'text-slate-400'}`} />
              </div>
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-[#FFD875] transition-colors"
              >
                {showCurrentPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="mt-2 text-sm text-red-400 flex items-center">
                <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-3">
              Mật khẩu mới <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Controller
                name="newPassword"
                control={control}
                render={({ field }) => {
                  const passwordStrength = getPasswordStrength(field.value);
                  return (
                    <div>
                      <input
                        {...field}
                        type={showNewPassword ? 'text' : 'password'}
                        className="w-full p-4 pl-12 pr-12 bg-slate-700/50 text-white rounded-xl border border-slate-600/50 focus:border-[#FFD875] focus:outline-none focus:ring-2 focus:ring-[#FFD875]/20 transition-all duration-300 placeholder-slate-400"
                        placeholder="Nhập mật khẩu mới"
                      />
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <KeyIcon className={`w-5 h-5 ${errors.newPassword ? 'text-red-400' : 'text-slate-400'}`} />
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-[#FFD875] transition-colors"
                      >
                        {showNewPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                      </button>

                      {/* Password Strength Indicator */}
                      {field.value && (
                        <div className="mt-2 space-y-2">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-slate-400">Độ mạnh mật khẩu</span>
                            <span className={`font-medium ${passwordStrength.strength >= 80 ? 'text-emerald-400' :
                              passwordStrength.strength >= 60 ? 'text-blue-400' :
                                passwordStrength.strength >= 40 ? 'text-yellow-400' :
                                  'text-red-400'
                              }`}>
                              {passwordStrength.label}
                            </span>
                          </div>
                          <div className="w-full bg-slate-600 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                              style={{ width: `${passwordStrength.strength}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }}
              />
            </div>
            {errors.newPassword && (
              <p className="mt-2 text-sm text-red-400 flex items-center">
                <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                {errors.newPassword.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-3">
              Xác nhận mật khẩu mới <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Controller
                name="confirmPassword"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="w-full p-4 pl-12 pr-12 bg-slate-700/50 text-white rounded-xl border border-slate-600/50 focus:border-[#FFD875] focus:outline-none focus:ring-2 focus:ring-[#FFD875]/20 transition-all duration-300 placeholder-slate-400"
                    placeholder="Nhập lại mật khẩu mới"
                  />
                )}
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <KeyIcon className={`w-5 h-5 ${errors.confirmPassword ? 'text-red-400' : 'text-slate-400'}`} />
              </div>
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-[#FFD875] transition-colors"
              >
                {showConfirmPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-2 text-sm text-red-400 flex items-center">
                <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Password Requirements */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-blue-400" />
              <span className="text-blue-400 font-medium">Yêu cầu mật khẩu</span>
            </div>
            <ul className="space-y-1 text-sm text-slate-300">
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-[#FFD875] rounded-full"></span>
                <span>Ít nhất 8 ký tự</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-[#FFD875] rounded-full"></span>
                <span>Chứa ít nhất 1 chữ hoa (A-Z)</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-[#FFD875] rounded-full"></span>
                <span>Chứa ít nhất 1 chữ thường (a-z)</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-[#FFD875] rounded-full"></span>
                <span>Chứa ít nhất 1 số (0-9)</span>
              </li>
            </ul>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={isSubmitting || !isValid}
              className="px-8 py-3 bg-gradient-to-r from-[#FFD875] to-[#FFC107] text-black rounded-xl hover:shadow-[0_0_20px_rgba(255,216,117,0.4)] transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  <span>Đang cập nhật...</span>
                </div>
              ) : (
                'Đổi mật khẩu'
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>

      {/* Security Tips */}
      <motion.div
        variants={itemVariants}
        className="bg-[#FFD875]/5 border border-[#FFD875]/20 rounded-xl p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-[#FFD875]/10 rounded-lg">
            <ShieldCheckIcon className="w-5 h-5 text-[#FFD875]" />
          </div>
          <h3 className="text-lg font-semibold text-[#FFD875]">Mẹo bảo mật</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
          <div className="flex items-start space-x-2">
            <span className="w-1.5 h-1.5 bg-[#FFD875] rounded-full mt-2"></span>
            <span>Sử dụng mật khẩu duy nhất cho mỗi tài khoản</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="w-1.5 h-1.5 bg-[#FFD875] rounded-full mt-2"></span>
            <span>Thay đổi mật khẩu định kỳ (3-6 tháng)</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="w-1.5 h-1.5 bg-[#FFD875] rounded-full mt-2"></span>
            <span>Không chia sẻ mật khẩu với người khác</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="w-1.5 h-1.5 bg-[#FFD875] rounded-full mt-2"></span>
            <span>Đăng xuất khỏi thiết bị công cộng</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Security; 
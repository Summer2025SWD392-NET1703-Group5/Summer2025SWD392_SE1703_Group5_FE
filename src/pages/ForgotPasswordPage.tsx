// pages/ForgotPasswordPage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { EnvelopeIcon, CheckCircleIcon, ArrowLeftIcon, SparklesIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';

// --- Enhanced Validation Schema ---
const schema = yup.object().shape({
  email: yup
    .string()
    .required('Vui lòng nhập địa chỉ email')
    .email('Định dạng email không hợp lệ')
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      'Email phải có định dạng hợp lệ (ví dụ: name@domain.com)'
    )
    .min(5, 'Email phải có ít nhất 5 ký tự')
    .max(100, 'Email không được quá 100 ký tự'),
});

type FormData = {
  email: string;
};

const ForgotPasswordPage: React.FC = () => {
  const { forgotPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    mode: 'onChange',
  });

  const emailValue = watch('email');

  // Countdown timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);
    try {
      await forgotPassword(data.email);
      setEmailSent(true);
      setCountdown(30); // Start 30-second countdown
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements - Only #FFD875 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#FFD875]/5 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-[#FFD875]/3 rounded-full blur-[120px] animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-[#FFD875]/8 rounded-full blur-[80px] animate-bounce delay-500"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          {success ? (
            // Final Success State - Complete Success
            <div className="animate-fadeInUp">
              <div className="relative overflow-hidden bg-slate-800/40 backdrop-blur-xl rounded-2xl p-8 border border-[#FFD875]/20 shadow-[0_0_40px_rgba(255,216,117,0.1)]">
                <div className="absolute inset-0 bg-gradient-to-br from-[#FFD875]/5 via-transparent to-[#FFD875]/5"></div>

                <div className="relative z-10 text-center">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-[#FFD875]/20 blur-xl rounded-full animate-pulse"></div>
                    <div className="relative bg-gradient-to-r from-[#FFD875]/10 to-[#FFD875]/20 p-4 rounded-full inline-block">
                      <CheckCircleIcon className="w-16 h-16 text-[#FFD875] drop-shadow-[0_0_20px_rgba(255,216,117,0.6)] animate-pulse" />
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold text-[#FFD875] mb-3 drop-shadow-[0_0_15px_rgba(255,216,117,0.4)]">
                    Email đã được gửi! ✨
                  </h2>

                  <p className="text-gray-300 text-sm leading-relaxed mb-6">
                    Nếu email của bạn tồn tại trong hệ thống, chúng tôi đã gửi liên kết đặt lại mật khẩu.
                    <br />
                    <span className="text-[#FFD875]/80">Vui lòng kiểm tra hộp thư (kể cả spam).</span>
                  </p>

                  <Link
                    to="/login"
                    className="group inline-flex items-center gap-2 px-6 py-3 bg-[#FFD875] text-black rounded-xl font-semibold transition-all duration-300 hover:shadow-[0_0_25px_rgba(255,216,117,0.5)] hover:scale-105"
                  >
                    <ArrowLeftIcon className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    Quay lại đăng nhập
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            // Form State
            <div className="animate-fadeInUp">
              <div className="relative overflow-hidden bg-slate-800/40 backdrop-blur-xl rounded-2xl p-8 border border-[#FFD875]/20 shadow-[0_0_40px_rgba(255,216,117,0.1)]">
                <div className="absolute inset-0 bg-gradient-to-br from-[#FFD875]/5 via-transparent to-[#FFD875]/5"></div>

                <div className="relative z-10">
                  {/* Header */}
                  <div className="text-center mb-8">
                    <div className="relative mb-4">
                      <div className="absolute inset-0 bg-[#FFD875]/20 blur-xl rounded-full animate-pulse"></div>
                      <div className="relative bg-gradient-to-r from-[#FFD875]/10 to-[#FFD875]/20 p-3 rounded-full inline-block">
                        <EnvelopeIcon className="w-10 h-10 text-[#FFD875] drop-shadow-[0_0_15px_rgba(255,216,117,0.5)]" />
                      </div>
                    </div>

                    <h2 className="text-2xl font-bold text-[#FFD875] mb-2 drop-shadow-[0_0_15px_rgba(255,216,117,0.4)]">
                      Quên mật khẩu?
                    </h2>

                    <p className="text-gray-300 text-sm">
                      {emailSent ? 'Gửi lại liên kết khôi phục' : 'Đừng lo lắng! Nhập email để nhận liên kết khôi phục'}
                    </p>
                  </div>

                  {/* Success Message for Email Sent */}
                  {emailSent && (
                    <div className="animate-fadeInUp bg-[#FFD875]/10 border border-[#FFD875]/30 rounded-xl p-4 backdrop-blur-sm mb-6">
                      <p className="text-[#FFD875] text-sm text-center flex items-center justify-center gap-2">
                        <CheckCircleIcon className="w-4 h-4" />
                        Email đã được gửi thành công!
                      </p>
                    </div>
                  )}

                  {/* Form */}
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Email Input */}
                    <div className="space-y-2">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                        Địa chỉ Email <span className="text-red-400">*</span>
                      </label>

                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <EnvelopeIcon className={`w-5 h-5 transition-colors duration-300 ${errors.email || error ? 'text-red-400' : emailValue ? 'text-[#FFD875]' : 'text-gray-400'
                            }`} />
                        </div>

                        <input
                          id="email"
                          type="email"
                          autoComplete="email"
                          {...register('email')}
                          className={`w-full pl-12 pr-4 py-3 bg-slate-700/50 border rounded-xl text-white placeholder-gray-400 transition-all duration-300 focus:outline-none backdrop-blur-sm ${errors.email || error
                            ? 'border-red-500/50 focus:border-red-400 focus:ring-2 focus:ring-red-400/20'
                            : emailValue
                              ? 'border-[#FFD875]/50 focus:border-[#FFD875] focus:ring-2 focus:ring-[#FFD875]/20 focus:shadow-[0_0_15px_rgba(255,216,117,0.3)]'
                              : 'border-gray-600/50 focus:border-[#FFD875]/70 focus:ring-2 focus:ring-[#FFD875]/10'
                            }`}
                          placeholder="Nhập email của bạn..."
                        />

                        {/* Glowing effect on focus */}
                        {emailValue && !errors.email && !error && (
                          <div className="absolute inset-0 rounded-xl bg-[#FFD875]/10 -z-10 blur-sm animate-pulse"></div>
                        )}
                      </div>

                      {/* Error or Helper Text */}
                      {errors.email ? (
                        <p className="text-red-400 text-xs flex items-center gap-1 animate-fadeInUp">
                          <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                          {errors.email.message}
                        </p>
                      ) : error ? (
                        <p className="text-red-400 text-xs flex items-center gap-1 animate-fadeInUp">
                          <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                          {error}
                        </p>
                      ) : emailValue && (
                        <p className="text-[#FFD875]/70 text-xs flex items-center gap-1">
                          <SparklesIcon className="w-3 h-3" />
                          Email hợp lệ
                        </p>
                      )}
                    </div>

                    {/* Submit/Resend Button */}
                    <button
                      type="submit"
                      disabled={isLoading || !!errors.email || countdown > 0}
                      className="group relative w-full py-3 px-4 bg-[#FFD875] text-black rounded-xl font-semibold transition-all duration-300 hover:shadow-[0_0_25px_rgba(255,216,117,0.5)] hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {isLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                            Đang gửi...
                          </>
                        ) : countdown > 0 ? (
                          <>
                            <ClockIcon className="w-5 h-5" />
                            Gửi lại sau {formatTime(countdown)}
                          </>
                        ) : emailSent ? (
                          <>
                            <EnvelopeIcon className="w-5 h-5 transition-transform group-hover:scale-110" />
                            Gửi lại liên kết
                          </>
                        ) : (
                          <>
                            <EnvelopeIcon className="w-5 h-5 transition-transform group-hover:scale-110" />
                            Gửi liên kết khôi phục
                          </>
                        )}
                      </span>

                      {/* Button glowing effect */}
                      {!isLoading && countdown === 0 && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                      )}
                    </button>

                    {/* Countdown Progress Bar */}
                    {countdown > 0 && (
                      <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-[#FFD875] transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(255,216,117,0.5)]"
                          style={{ width: `${((30 - countdown) / 30) * 100}%` }}
                        ></div>
                      </div>
                    )}

                    {/* Back to Login */}
                    <div className="text-center pt-4">
                      <Link
                        to="/login"
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-[#FFD875] transition-all duration-300 text-sm group"
                      >
                        <ArrowLeftIcon className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        Quay lại trang đăng nhập
                      </Link>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

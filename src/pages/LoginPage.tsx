// pages/LoginPage.tsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { motion, AnimatePresence } from "framer-motion";
import {
  EyeIcon,
  EyeSlashIcon,
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
  ExclamationCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../hooks/useAuth";
import type { LoginCredentials } from "../types/auth";

// --- Validation Schema ---
const schema = yup.object().shape({
  Email: yup.string().email("Email không hợp lệ").required("Email là bắt buộc"),
  Password: yup.string().required("Mật khẩu là bắt buộc"),
  rememberMe: yup.boolean().optional(),
});

// Countdown timer component
const CountdownTimer: React.FC<{ endTime: number; onComplete: () => void }> = ({ endTime, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = Math.max(0, endTime - Date.now());
      setTimeLeft(remaining);

      if (remaining === 0) {
        onComplete();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime, onComplete]);

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 text-center"
    >
      <ClockIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-red-400 mb-2">Tài khoản tạm khóa</h3>
      <p className="text-gray-300 mb-4">Do nhập sai mật khẩu quá nhiều lần</p>
      <div className="text-3xl font-bold text-[#FFD875]">
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </div>
      <p className="text-sm text-gray-400 mt-2">Vui lòng thử lại sau</p>
    </motion.div>
  );
};

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, isAuthenticated, clearError, user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutEndTime, setLockoutEndTime] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
    setError: setFieldError,
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  // Check for existing lockout
  useEffect(() => {
    const savedLockoutTime = localStorage.getItem("loginLockoutTime");
    const savedAttempts = localStorage.getItem("loginFailedAttempts");

    if (savedLockoutTime) {
      const lockoutTime = parseInt(savedLockoutTime);
      if (lockoutTime > Date.now()) {
        setLockoutEndTime(lockoutTime);
      } else {
        localStorage.removeItem("loginLockoutTime");
        localStorage.removeItem("loginFailedAttempts");
      }
    }

    if (savedAttempts) {
      setFailedAttempts(parseInt(savedAttempts));
    }
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect based on user role
      if (user.role === "Staff") {
        navigate("/showtimes", { replace: true });
      } else if (["Admin", "Manager"].includes(user.role)) {
        navigate("/admin/dashboard", { replace: true });
      } else {
        const from = location.state?.from?.pathname || "/";
        navigate(from, { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, location]);

  // Clear errors when unmount
  useEffect(() => {
    return () => {
      if (error) clearError();
    };
  }, [error, clearError]);

  // Sync AuthContext error with local formError
  useEffect(() => {
    if (error && !formError) {
      setFormError(error);
    }
  }, [error, formError]);

  const handleLockoutComplete = () => {
    setLockoutEndTime(0);
    setFailedAttempts(0);
    localStorage.removeItem("loginLockoutTime");
    localStorage.removeItem("loginFailedAttempts");
  };

  const onSubmit = async (data: any) => {
    if (lockoutEndTime > Date.now()) {
      return;
    }

    setFormError(null);

    try {
      // Extract only Email and Password for login
      const loginData: LoginCredentials = {
        Email: data.Email,
        Password: data.Password,
      };
      await login(loginData);
      // Reset failed attempts on successful login
      setFailedAttempts(0);
      localStorage.removeItem("loginFailedAttempts");
    } catch (err: any) {
      // Try to extract error message from different sources
      const errorMessage = err.message || err.response?.data?.message || "Đã có lỗi xảy ra.";

      // Logic để phân biệt các loại lỗi
      if (errorMessage.toLowerCase().includes("mật khẩu")) {
        // Chỉ tăng số lần thử sai khi lỗi là do mật khẩu
        const newFailedAttempts = failedAttempts + 1;
        setFailedAttempts(newFailedAttempts);
        localStorage.setItem("loginFailedAttempts", newFailedAttempts.toString());

        if (newFailedAttempts >= 5) {
          const lockoutTime = Date.now() + 30 * 60 * 1000; // Khóa trong 30 phút
          setLockoutEndTime(lockoutTime);
          localStorage.setItem("loginLockoutTime", lockoutTime.toString());
        } else {
          setFormError(errorMessage);
          setFieldError("Password", { type: "manual", message: "" });
        }
      } else {
        // Các lỗi khác (ví dụ: tài khoản không tồn tại) sẽ hiển thị mà không khóa
        setFormError(errorMessage);
        setFieldError("Email", { type: "manual", message: "" });
      }
    }
  };

  const inputClass = (fieldName: "Email" | "Password") => {
    const hasError = errors[fieldName] || (formError && touchedFields[fieldName]);
    return `appearance-none relative block w-full pl-10 pr-3 py-3 border ${
      hasError ? "border-red-500 bg-red-900/10" : "border-slate-600"
    } placeholder-gray-400 text-white rounded-lg bg-slate-800 focus:outline-none focus:ring-2 ${
      hasError ? "focus:ring-red-500" : "focus:ring-[#FFD875]"
    } focus:border-transparent transition-all duration-300 ${hasError ? "" : "hover:border-[#FFD875]/50"}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-md w-full space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="text-center">
          <motion.div
            className="mx-auto h-16 w-16 bg-[#FFD875] rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,216,117,0.5)]"
            animate={{
              boxShadow: [
                "0 0 30px rgba(255,216,117,0.5)",
                "0 0 50px rgba(255,216,117,0.7)",
                "0 0 30px rgba(255,216,117,0.5)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <UserIcon className="h-10 w-10 text-black" />
          </motion.div>
          <h2 className="mt-6 text-4xl font-bold text-white">Đăng nhập</h2>
          <p className="mt-2 text-sm text-gray-400">Chào mừng bạn quay trở lại</p>
        </div>

        {/* Show lockout timer if account is locked */}
        {lockoutEndTime > Date.now() ? (
          <CountdownTimer endTime={lockoutEndTime} onComplete={handleLockoutComplete} />
        ) : (
          <>
            {/* Login Form */}
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {/* Form Error */}
              <AnimatePresence>
                {formError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start"
                  >
                    <ExclamationCircleIcon className="w-5 h-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                    <p className="text-red-400 text-sm">{formError}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Failed attempts warning */}
              {failedAttempts > 0 && failedAttempts < 5 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-sm text-orange-400"
                >
                  Còn {5 - failedAttempts} lần thử trước khi tài khoản bị khóa
                </motion.div>
              )}

              {/* Email Input */}
              <div>
                <label htmlFor="Email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className={`h-5 w-5 ${errors.Email ? "text-red-400" : "text-gray-400"}`} />
                  </div>
                  <input
                    id="Email"
                    type="email"
                    autoComplete="email"
                    {...register("Email")}
                    className={inputClass("Email")}
                    placeholder="Nhập email của bạn"
                  />
                  {errors.Email && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                    </motion.div>
                  )}
                </div>
                <AnimatePresence>
                  {errors.Email && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="mt-1 text-sm text-red-400"
                    >
                      {errors.Email.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="Password" className="block text-sm font-medium text-gray-300 mb-2">
                  Mật khẩu
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className={`h-5 w-5 ${errors.Password ? "text-red-400" : "text-gray-400"}`} />
                  </div>
                  <input
                    id="Password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    {...register("Password")}
                    className={`${inputClass("Password")} pr-10`}
                    placeholder="Nhập mật khẩu"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-[#FFD875] transition-colors" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400 hover:text-[#FFD875] transition-colors" />
                    )}
                  </button>
                  {errors.Password && !errors.Password.message && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute inset-y-0 right-10 pr-3 flex items-center"
                    >
                      <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                    </motion.div>
                  )}
                </div>
                <AnimatePresence>
                  {errors.Password && errors.Password.message && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="mt-1 text-sm text-red-400"
                    >
                      {errors.Password.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="rememberMe"
                    type="checkbox"
                    {...register("rememberMe")}
                    className="h-4 w-4 text-[#FFD875] focus:ring-[#FFD875] border-slate-600 bg-slate-800 rounded"
                  />
                  <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-300">
                    Ghi nhớ đăng nhập
                  </label>
                </div>

                <div className="text-sm">
                  <Link
                    to="/forgot-password"
                    className="font-medium text-[#FFD875] hover:text-[#e5c368] transition-colors"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>
              </div>

              {/* Submit Button */}
              <div>
                <motion.button
                  type="submit"
                  disabled={isLoading || lockoutEndTime > Date.now()}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-black bg-[#FFD875] hover:bg-[#e5c368] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFD875] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-[0_0_20px_rgba(255,216,117,0.3)] hover:shadow-[0_0_30px_rgba(255,216,117,0.5)]"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? "Đang xử lý..." : "Đăng nhập"}
                </motion.button>
              </div>

              {/* Register Link */}
              <div className="text-center">
                <p className="text-sm text-gray-400">
                  Chưa có tài khoản?{" "}
                  <Link to="/register" className="font-medium text-[#FFD875] hover:text-[#e5c368] transition-colors">
                    Đăng ký ngay
                  </Link>
                </p>
              </div>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default LoginPage;
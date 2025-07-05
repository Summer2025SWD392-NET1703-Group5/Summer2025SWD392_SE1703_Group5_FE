// pages/RegisterPage.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  EyeIcon,
  EyeSlashIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  LockClosedIcon,
  CheckCircleIcon,
  MapPinIcon,
  UsersIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import type { RegisterData } from '../types/auth';
import { motion, AnimatePresence } from 'framer-motion';

// --- Validation Schema ---
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;

// Chia schema thành các phần theo từng step
const step1Schema = yup.object().shape({
  FullName: yup.string()
    .required('Họ tên là bắt buộc')
    .min(2, 'Họ tên phải có ít nhất 2 ký tự')
    .max(50, 'Họ tên không được vượt quá 50 ký tự')
    .test('no-leading-trailing-space', 'Họ tên không được bắt đầu hoặc kết thúc bằng khoảng trắng', (value) => {
      if (!value) return true;
      return value.trim() === value;
    })
    .test('no-multiple-spaces', 'Họ tên không được chứa nhiều khoảng trắng liên tiếp', (value) => {
      if (!value) return true;
      return !value.includes('  '); // Kiểm tra không có 2 khoảng trắng liên tiếp
    })
    .test('at-least-two-words', 'Họ tên phải có ít nhất 2 từ (họ và tên)', (value) => {
      if (!value) return true;
      const words = value.trim().split(' ').filter(word => word.length > 0);
      return words.length >= 2;
    })
    .test('valid-word-length', 'Mỗi từ trong họ tên phải có ít nhất 1 ký tự', (value) => {
      if (!value) return true;
      const words = value.trim().split(' ').filter(word => word.length > 0);
      return words.every(word => word.length >= 1);
    }),
  Email: yup.string().email('Email không hợp lệ').required('Email là bắt buộc'),
  PhoneNumber: yup.string().matches(/^(0\d{9})$/, 'Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)').required('Số điện thoại là bắt buộc'),
});

const step2Schema = yup.object().shape({
  DateOfBirth: yup.string().required('Ngày sinh là bắt buộc').test('is-adult', 'Bạn phải đủ 16 tuổi', (value) => {
    if (!value) return false;
    try {
      const birthDate = new Date(value);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age >= 16;
    } catch (e) {
      return false;
    }
  }),
  Sex: yup.string().oneOf(['Male', 'Female', 'Other'], 'Giới tính không hợp lệ').required('Vui lòng chọn giới tính'),
  Address: yup.string().optional(),
});

const step3Schema = yup.object().shape({
  Password: yup.string()
    .required('Mật khẩu là bắt buộc')
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .matches(passwordRegex, "Mật khẩu phải chứa 1 chữ hoa, 1 số và 1 ký tự đặc biệt"),
  ConfirmPassword: yup.string()
    .oneOf([yup.ref('Password')], 'Mật khẩu xác nhận không khớp')
    .required('Vui lòng xác nhận mật khẩu'),
  acceptTerms: yup.boolean().oneOf([true], 'Bạn phải đồng ý với điều khoản và chính sách của chúng tôi'),
});

// Schema đầy đủ cho quá trình xác thực khi submit form
const fullSchema = yup.object().shape({
  ...step1Schema.fields,
  ...step2Schema.fields,
  ...step3Schema.fields,
});

type FormData = RegisterData & { acceptTerms: boolean };

// --- Password Rules Component ---
const PasswordRules = ({ password = '' }: { password?: string }) => {
  const rules = [
    { label: 'Ít nhất 8 ký tự', check: password.length >= 8 },
    { label: 'Ít nhất 1 chữ cái viết hoa', check: /[A-Z]/.test(password) },
    { label: 'Ít nhất 1 chữ cái viết thường', check: /[a-z]/.test(password) },
    { label: 'Ít nhất 1 chữ số', check: /[0-9]/.test(password) },
    { label: 'Ít nhất 1 ký tự đặc biệt (!@#$%^&*)', check: /[!@#$%^&*]/.test(password) },
  ];

  return (
    <div className="mt-3 space-y-2 bg-slate-800/50 rounded-lg p-3">
      {rules.map((rule, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="flex items-center text-sm"
        >
          {rule.check ? (
            <CheckCircleIcon className="w-4 h-4 text-green-400 mr-2" />
          ) : (
            <XMarkIcon className="w-4 h-4 text-gray-500 mr-2" />
          )}
          <span className={rule.check ? 'text-green-400' : 'text-gray-500'}>
            {rule.label}
          </span>
        </motion.div>
      ))}
    </div>
  );
};

// --- Full Name Rules Component ---
const FullNameRules = ({ fullName = '' }: { fullName?: string }) => {
  const words = fullName.trim().split(' ').filter(word => word.length > 0);

  const rules = [
    { label: 'Từ 2-50 ký tự', check: fullName.length >= 2 && fullName.length <= 50 },
    { label: 'Không bắt đầu/kết thúc bằng khoảng trắng', check: fullName.trim() === fullName },
    { label: 'Không có khoảng trắng liên tiếp', check: !fullName.includes('  ') },
    { label: 'Ít nhất 2 từ (họ và tên)', check: words.length >= 2 },
  ];

  return (
    <div className="mt-3 space-y-2 bg-slate-800/50 rounded-lg p-3">
      <div className="text-xs text-gray-400 mb-2">Yêu cầu cho họ và tên:</div>
      {rules.map((rule, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="flex items-center text-sm"
        >
          {rule.check ? (
            <CheckCircleIcon className="w-4 h-4 text-green-400 mr-2" />
          ) : (
            <XMarkIcon className="w-4 h-4 text-gray-500 mr-2" />
          )}
          <span className={rule.check ? 'text-green-400' : 'text-gray-500'}>
            {rule.label}
          </span>
        </motion.div>
      ))}
    </div>
  );
};

// --- Password Strength Component ---
const PasswordStrengthIndicator = ({ password = '' }: { password?: string }) => {
  const getStrength = () => {
    let score = 0;
    if (!password) return 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*]/.test(password)) score++;
    return Math.min(score, 5);
  };

  const strength = getStrength();
  const strengthText = ['', 'Rất yếu', 'Yếu', 'Trung bình', 'Mạnh', 'Rất mạnh'][strength];
  const strengthColor = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'][strength];

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-400">Độ mạnh mật khẩu</span>
        {password && (
          <span className={`text-xs font-medium ${strength <= 2 ? 'text-red-400' : strength <= 3 ? 'text-yellow-400' : 'text-green-400'}`}>
            {strengthText}
          </span>
        )}
      </div>
      <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${strengthColor} transition-all duration-300`}
          initial={{ width: 0 }}
          animate={{ width: `${(strength / 5) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
};

// --- Required Field Label ---
const RequiredLabel: React.FC<{ text: string }> = ({ text }) => (
  <label className="block text-sm font-medium text-gray-300 mb-2">
    {text} <span className="text-red-500">*</span>
  </label>
);

// --- Step Indicator ---
const StepIndicator: React.FC<{ currentStep: number, totalSteps: number }> = ({ currentStep, totalSteps }) => {
  return (
    <div className="flex items-center justify-center mb-8">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <React.Fragment key={index}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all duration-300 ${index < currentStep
              ? 'bg-[#FFD875] text-slate-900 shadow-[0_0_15px_rgba(255,216,117,0.5)]'
              : index === currentStep
                ? 'bg-[#FFD875] text-slate-900 shadow-[0_0_20px_rgba(255,216,117,0.7)]'
                : 'bg-slate-700 text-gray-400'
              }`}
          >
            {index < currentStep ? <CheckIcon className="w-5 h-5" /> : index + 1}
          </motion.div>
          {index < totalSteps - 1 && (
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: index * 0.1 + 0.05 }}
              className={`h-1 w-16 origin-left ${index < currentStep ? 'bg-[#FFD875]' : 'bg-slate-700'}`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerUser, isLoading, error, isAuthenticated, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [serverError, setServerError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isCheckingPhone, setIsCheckingPhone] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, touchedFields },
    trigger,
    setError: setFieldError,
    getValues
  } = useForm({
    resolver: yupResolver(fullSchema),
    mode: "onChange"
  });

  const passwordValue = (watch('Password') as string) || '';
  const fullNameValue = (watch('FullName') as string) || '';

  useEffect(() => {
    if (registrationSuccess && isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate, registrationSuccess]);

  useEffect(() => {
    return () => { if (error) clearError(); };
  }, [error, clearError]);

  // Clear server error when user changes step or starts editing
  useEffect(() => {
    if (serverError) {
      setServerError(null);
    }
  }, [currentStep]);

  // Clear error states when user starts editing
  const clearFieldErrors = () => {
    if (emailError) setEmailError(null);
    if (phoneError) setPhoneError(null);
    if (serverError) setServerError(null);
  };

  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      // Simulate API call to check if email exists
      // Replace with actual API call
      setIsCheckingEmail(true);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mock check - replace with actual API
      const existingEmails = ['test@example.com', 'user@gmail.com'];
      return existingEmails.includes(email.toLowerCase());
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const checkPhoneExists = async (phone: string): Promise<boolean> => {
    try {
      // Simulate API call to check if phone exists
      // Replace with actual API call
      setIsCheckingPhone(true);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mock check - replace with actual API
      const existingPhones = ['0123456789', '0987654321'];
      return existingPhones.includes(phone);
    } catch (error) {
      console.error('Error checking phone:', error);
      return false;
    } finally {
      setIsCheckingPhone(false);
    }
  };

  const nextStep = async () => {
    let fieldsToValidate: string[] = [];

    if (currentStep === 0) {
      fieldsToValidate = ['FullName', 'Email', 'PhoneNumber'];

      // Check if email exists
      const emailValue = (getValues as any)('Email');
      if (emailValue) {
        const emailExists = await checkEmailExists(emailValue);
        if (emailExists) {
          setFieldError('Email', {
            type: 'manual',
            message: 'Email này đã được sử dụng. Vui lòng sử dụng email khác.'
          });
          setEmailError('Email này đã được sử dụng. Vui lòng sử dụng email khác.');
          return;
        } else {
          setEmailError(null);
        }
      }

      // Check if phone exists
      const phoneValue = (getValues as any)('PhoneNumber');
      if (phoneValue) {
        const phoneExists = await checkPhoneExists(phoneValue);
        if (phoneExists) {
          setFieldError('PhoneNumber', {
            type: 'manual',
            message: 'Số điện thoại này đã được sử dụng. Vui lòng sử dụng số khác.'
          });
          setPhoneError('Số điện thoại này đã được sử dụng. Vui lòng sử dụng số khác.');
          return;
        } else {
          setPhoneError(null);
        }
      }
    } else if (currentStep === 1) {
      fieldsToValidate = ['DateOfBirth', 'Sex'];
    }

    const isValid = await trigger(fieldsToValidate as any);

    if (isValid) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const onSubmit = async (data: any) => {
    try {
      setServerError(null);
      const { acceptTerms, ...registerData } = data;

      await registerUser(registerData as RegisterData);
      setRegistrationSuccess(true);
      // Navigate to success page
      navigate('/register-success');
    } catch (err: any) {
      console.error("Registration failed:", err);
      const errorMessage = err?.message || 'Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại.';
      setServerError(errorMessage);

      // Determine which step the error belongs to and navigate back to that step
      if (errorMessage.toLowerCase().includes('email') || errorMessage.toLowerCase().includes('phone') ||
        errorMessage.toLowerCase().includes('số điện thoại') || errorMessage.toLowerCase().includes('tên')) {
        // Errors related to step 1 (personal info)
        setCurrentStep(0);

        // Set specific field errors if possible
        if (errorMessage.toLowerCase().includes('email')) {
          setFieldError('Email', {
            type: 'manual',
            message: errorMessage
          });
          setEmailError(errorMessage);
        }
        if (errorMessage.toLowerCase().includes('phone') || errorMessage.toLowerCase().includes('số điện thoại')) {
          setFieldError('PhoneNumber', {
            type: 'manual',
            message: errorMessage
          });
          setPhoneError(errorMessage);
        }
        if (errorMessage.toLowerCase().includes('tên')) {
          setFieldError('FullName', {
            type: 'manual',
            message: errorMessage
          });
        }
      } else if (errorMessage.toLowerCase().includes('ngày sinh') || errorMessage.toLowerCase().includes('giới tính') ||
        errorMessage.toLowerCase().includes('địa chỉ')) {
        // Errors related to step 2 (additional info)
        setCurrentStep(1);

        if (errorMessage.toLowerCase().includes('ngày sinh')) {
          setFieldError('DateOfBirth', {
            type: 'manual',
            message: errorMessage
          });
        }
        if (errorMessage.toLowerCase().includes('giới tính')) {
          setFieldError('Sex', {
            type: 'manual',
            message: errorMessage
          });
        }
      } else if (errorMessage.toLowerCase().includes('mật khẩu') || errorMessage.toLowerCase().includes('password')) {
        // Errors related to step 3 (security)
        setCurrentStep(2);

        setFieldError('Password', {
          type: 'manual',
          message: errorMessage
        });
      } else {
        // General errors - stay on current step or go to last step
        setCurrentStep(2);
      }
    }
  };

  if (registrationSuccess) {
    return null;
  }

  const getInputClass = (fieldName: string) => {
    const hasError = (errors as any)[fieldName] && ((touchedFields as any)[fieldName] || serverError) ||
      (fieldName === 'Email' && emailError) ||
      (fieldName === 'PhoneNumber' && phoneError);
    return `w-full pl-10 pr-3 py-3 bg-slate-700/50 border ${hasError ? 'border-red-500 bg-red-900/10' : 'border-slate-600'
      } rounded-lg text-white focus:ring-2 ${hasError ? 'focus:ring-red-500' : 'focus:ring-[#FFD875]'
      } focus:border-transparent transition-all duration-300 ${hasError ? '' : 'hover:border-[#FFD875]/50'
      } placeholder:text-gray-500`;
  };

  const getSelectClass = (fieldName: string) => {
    const hasError = (errors as any)[fieldName] && ((touchedFields as any)[fieldName] || serverError);
    return `w-full pl-10 pr-10 py-3 bg-slate-700/50 border ${hasError ? 'border-red-500 bg-red-900/10' : 'border-slate-600'
      } rounded-lg text-white focus:ring-2 ${hasError ? 'focus:ring-red-500' : 'focus:ring-[#FFD875]'
      } focus:border-transparent transition-all duration-300 ${hasError ? '' : 'hover:border-[#FFD875]/50'
      } cursor-pointer appearance-none
    [&>option]:bg-slate-800 [&>option]:text-white`;
  };

  const iconClass = "h-5 w-5 text-gray-400 absolute top-3.5 left-3";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl w-full space-y-8 bg-slate-800/70 backdrop-blur-sm p-10 rounded-xl shadow-lg border border-[#FFD875]/20 shadow-[0_0_30px_rgba(255,216,117,0.2)]"
      >
        <div className="text-center">
          <motion.h2
            className="text-4xl font-bold text-white"
            animate={{
              textShadow: [
                "0 0 10px rgba(255,216,117,0.3)",
                "0 0 20px rgba(255,216,117,0.5)",
                "0 0 10px rgba(255,216,117,0.3)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Tạo tài khoản mới
          </motion.h2>
          <p className="mt-2 text-sm text-gray-400">Tham gia cùng chúng tôi ngay hôm nay!</p>

          <StepIndicator currentStep={currentStep} totalSteps={3} />
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {serverError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start"
            >
              <ExclamationCircleIcon className="w-5 h-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{serverError}</p>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-xl font-bold text-[#FFD875] mb-6">Thông tin cá nhân</h3>
                <div className="grid grid-cols-1 gap-6">
                  {/* FullName */}
                  <div>
                    <RequiredLabel text="Họ và tên" />
                    <div className="relative">
                      <UserIcon className={`${iconClass} ${errors.FullName ? 'text-red-400' : ''}`} />
                      <input
                        id="FullName"
                        type="text"
                        {...register('FullName')}
                        className={getInputClass('FullName')}
                        placeholder="Nguyễn Văn A"
                      />
                      {errors.FullName && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                        </motion.div>
                      )}
                    </div>

                    {/* Full Name Rules */}
                    {fullNameValue && <FullNameRules fullName={fullNameValue} />}

                    <AnimatePresence>
                      {errors.FullName && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="mt-1 text-sm text-red-400 flex items-center"
                        >
                          <XMarkIcon className="w-4 h-4 mr-1" />
                          {(errors.FullName as any)?.message}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Email */}
                  <div>
                    <RequiredLabel text="Email" />
                    <div className="relative">
                      <EnvelopeIcon className={`${iconClass} ${errors.Email || emailError ? 'text-red-400' : ''}`} />
                      <input
                        id="Email"
                        type="email"
                        {...register('Email')}
                        className={getInputClass('Email')}
                        placeholder="email@example.com"
                        onBlur={async (e) => {
                          const email = e.target.value;
                          if (email) {
                            const exists = await checkEmailExists(email);
                            if (exists) {
                              setFieldError('Email', {
                                type: 'manual',
                                message: 'Email này đã được sử dụng. Vui lòng sử dụng email khác.'
                              });
                              setEmailError('Email này đã được sử dụng. Vui lòng sử dụng email khác.');
                            } else {
                              setEmailError(null);
                            }
                          }
                        }}
                        onChange={(e) => {
                          // Clear error when user starts typing
                          if (emailError) {
                            setEmailError(null);
                          }
                          // Call the original onChange from register
                          register('Email').onChange(e);
                        }}
                      />
                      {(errors.Email || emailError) && !isCheckingEmail && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                        </motion.div>
                      )}
                      {isCheckingEmail && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-[#FFD875] border-t-transparent rounded-full"
                          />
                        </div>
                      )}
                    </div>
                    <AnimatePresence>
                      {(errors.Email || emailError) && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="mt-1 text-sm text-red-400 flex items-center"
                        >
                          <XMarkIcon className="w-4 h-4 mr-1" />
                          {(errors.Email as any)?.message || emailError}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* PhoneNumber */}
                  <div>
                    <RequiredLabel text="Số điện thoại" />
                    <div className="relative">
                      <PhoneIcon className={`${iconClass} ${errors.PhoneNumber || phoneError ? 'text-red-400' : ''}`} />
                      <input
                        id="PhoneNumber"
                        type="tel"
                        {...register('PhoneNumber')}
                        className={getInputClass('PhoneNumber')}
                        placeholder="0123456789"
                        onBlur={async (e) => {
                          const phone = e.target.value;
                          if (phone && phone.length === 10) {
                            const exists = await checkPhoneExists(phone);
                            if (exists) {
                              setFieldError('PhoneNumber', {
                                type: 'manual',
                                message: 'Số điện thoại này đã được sử dụng. Vui lòng sử dụng số khác.'
                              });
                              setPhoneError('Số điện thoại này đã được sử dụng. Vui lòng sử dụng số khác.');
                            } else {
                              setPhoneError(null);
                            }
                          }
                        }}
                        onChange={(e) => {
                          // Clear error when user starts typing
                          if (phoneError) {
                            setPhoneError(null);
                          }
                          // Call the original onChange from register
                          register('PhoneNumber').onChange(e);
                        }}
                      />
                      {(errors.PhoneNumber || phoneError) && !isCheckingPhone && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                        </motion.div>
                      )}
                      {isCheckingPhone && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-[#FFD875] border-t-transparent rounded-full"
                          />
                        </div>
                      )}
                    </div>
                    <AnimatePresence>
                      {(errors.PhoneNumber || phoneError) && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="mt-1 text-sm text-red-400 flex items-center"
                        >
                          <XMarkIcon className="w-4 h-4 mr-1" />
                          {(errors.PhoneNumber as any)?.message || phoneError}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <motion.button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center gap-2 py-3 px-6 rounded-lg bg-[#FFD875] text-slate-900 font-medium hover:bg-[#e5c368] transition-all shadow-[0_0_20px_rgba(255,216,117,0.5)] hover:shadow-[0_0_30px_rgba(255,216,117,0.7)]"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Tiếp theo <ArrowRightIcon className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {currentStep === 1 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-xl font-bold text-[#FFD875] mb-6">Thông tin bổ sung</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* DateOfBirth */}
                  <div>
                    <RequiredLabel text="Ngày sinh" />
                    <div className="relative">
                      <CalendarIcon className={`${iconClass} ${errors.DateOfBirth ? 'text-red-400' : ''}`} />
                      <input
                        id="DateOfBirth"
                        type="date"
                        {...register('DateOfBirth')}
                        className={getInputClass('DateOfBirth')}
                      />
                    </div>
                    <AnimatePresence>
                      {errors.DateOfBirth && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="mt-1 text-sm text-red-400 flex items-center"
                        >
                          <XMarkIcon className="w-4 h-4 mr-1" />
                          {(errors.DateOfBirth as any)?.message}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Sex */}
                  <div>
                    <RequiredLabel text="Giới tính" />
                    <div className="relative">
                      <UsersIcon className={`${iconClass} ${errors.Sex ? 'text-red-400' : ''}`} />
                      <select
                        id="Sex"
                        {...register('Sex')}
                        className={`${getSelectClass('Sex')} focus:shadow-[0_0_15px_rgba(255,216,117,0.3)]`}
                        defaultValue=""
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23FFD875' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                          backgroundPosition: 'right 0.5rem center',
                          backgroundRepeat: 'no-repeat',
                          backgroundSize: '1.5em 1.5em',
                        }}
                      >
                        <option value="" disabled>Chọn giới tính</option>
                        <option value="Male">Nam</option>
                        <option value="Female">Nữ</option>
                        <option value="Other">Khác</option>
                      </select>
                      {/* Glowing effect for select */}
                      <motion.div
                        className="absolute inset-0 rounded-lg pointer-events-none"
                        animate={{
                          boxShadow: [
                            '0 0 0 0 rgba(255,216,117,0)',
                            '0 0 20px 5px rgba(255,216,117,0.3)',
                            '0 0 0 0 rgba(255,216,117,0)',
                          ],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                        }}
                      />
                    </div>
                    <AnimatePresence>
                      {errors.Sex && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="mt-1 text-sm text-red-400 flex items-center"
                        >
                          <XMarkIcon className="w-4 h-4 mr-1" />
                          {(errors.Sex as any)?.message}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Address */}
                  <div className="md:col-span-2">
                    <label htmlFor="Address" className="block text-sm font-medium text-gray-300 mb-2">
                      Địa chỉ (Không bắt buộc)
                    </label>
                    <div className="relative">
                      <MapPinIcon className={iconClass} />
                      <input
                        id="Address"
                        type="text"
                        {...register('Address')}
                        className={getInputClass('Address')}
                        placeholder="123 Đường ABC, Quận 1, TP.HCM"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-between">
                  <motion.button
                    type="button"
                    onClick={prevStep}
                    className="flex items-center gap-2 py-3 px-6 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <ArrowLeftIcon className="w-4 h-4" /> Quay lại
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center gap-2 py-3 px-6 rounded-lg bg-[#FFD875] text-slate-900 font-medium hover:bg-[#e5c368] transition-all shadow-[0_0_20px_rgba(255,216,117,0.5)] hover:shadow-[0_0_30px_rgba(255,216,117,0.7)]"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Tiếp theo <ArrowRightIcon className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-xl font-bold text-[#FFD875] mb-6">Bảo mật tài khoản</h3>
                <div className="space-y-6">
                  {/* Password */}
                  <div>
                    <RequiredLabel text="Mật khẩu" />
                    <div className="relative">
                      <LockClosedIcon className={`${iconClass} ${errors.Password ? 'text-red-400' : ''}`} />
                      <input
                        id="Password"
                        type={showPassword ? 'text' : 'password'}
                        {...register('Password')}
                        className={`${getInputClass('Password')} pr-10`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-[#FFD875] transition-colors" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-gray-400 hover:text-[#FFD875] transition-colors" />
                        )}
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {passwordValue && <PasswordStrengthIndicator password={passwordValue} />}

                    {/* Password Rules */}
                    {passwordValue && <PasswordRules password={passwordValue} />}

                    <AnimatePresence>
                      {errors.Password && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="mt-2 text-sm text-red-400 flex items-center"
                        >
                          <XMarkIcon className="w-4 h-4 mr-1" />
                          {(errors.Password as any)?.message}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* ConfirmPassword */}
                  <div>
                    <RequiredLabel text="Xác nhận mật khẩu" />
                    <div className="relative">
                      <LockClosedIcon className={`${iconClass} ${errors.ConfirmPassword ? 'text-red-400' : ''}`} />
                      <input
                        id="ConfirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        {...register('ConfirmPassword')}
                        className={`${getInputClass('ConfirmPassword')} pr-10`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showConfirmPassword ? (
                          <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-[#FFD875] transition-colors" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-gray-400 hover:text-[#FFD875] transition-colors" />
                        )}
                      </button>
                    </div>
                    <AnimatePresence>
                      {errors.ConfirmPassword && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="mt-1 text-sm text-red-400 flex items-center"
                        >
                          <XMarkIcon className="w-4 h-4 mr-1" />
                          {(errors.ConfirmPassword as any)?.message}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Terms & Conditions */}
                  <div>
                    <div className="flex items-start">
                      <input
                        id="acceptTerms"
                        type="checkbox"
                        {...register('acceptTerms')}
                        className="h-4 w-4 text-[#FFD875] focus:ring-[#FFD875] border-slate-600 bg-slate-800 rounded mt-0.5"
                      />
                      <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-300">
                        Tôi đồng ý với{' '}
                        <Link to="/terms" className="text-[#FFD875] hover:text-[#e5c368] transition-colors">
                          Điều khoản sử dụng
                        </Link>{' '}
                        và{' '}
                        <Link to="/privacy" className="text-[#FFD875] hover:text-[#e5c368] transition-colors">
                          Chính sách bảo mật
                        </Link>
                      </label>
                    </div>
                    <AnimatePresence>
                      {errors.acceptTerms && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="mt-1 text-sm text-red-400 flex items-center"
                        >
                          <XMarkIcon className="w-4 h-4 mr-1" />
                          {(errors.acceptTerms as any)?.message}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="mt-8 flex justify-between">
                  <motion.button
                    type="button"
                    onClick={prevStep}
                    className="flex items-center gap-2 py-3 px-6 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <ArrowLeftIcon className="w-4 h-4" /> Quay lại
                  </motion.button>
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center gap-2 py-3 px-8 rounded-lg bg-[#FFD875] text-slate-900 font-medium hover:bg-[#e5c368] transition-all shadow-[0_0_20px_rgba(255,216,117,0.5)] hover:shadow-[0_0_30px_rgba(255,216,117,0.7)] disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isLoading ? 'Đang xử lý...' : 'Đăng ký'}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login Link */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-400">
              Đã có tài khoản?{' '}
              <Link
                to="/login"
                className="font-medium text-[#FFD875] hover:text-[#e5c368] transition-colors"
              >
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default RegisterPage;


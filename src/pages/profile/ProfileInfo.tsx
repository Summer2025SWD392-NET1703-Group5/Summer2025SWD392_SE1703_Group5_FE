import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarDaysIcon,
  MapPinIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  SparklesIcon,
  ShieldCheckIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/SimpleAuthContext';
import { userService } from '../../services/userService';
import type { UpdateProfileData } from '../../types/user';
import { toast } from 'react-hot-toast';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// Enhanced Validation Schema
const profileSchema = yup.object().shape({
  FullName: yup
    .string()
    .optional()
    .min(2, 'Họ và tên phải có ít nhất 2 ký tự')
    .max(50, 'Họ và tên không được quá 50 ký tự')
    .matches(/^[a-zA-ZÀ-ỹ\s]+$/, 'Họ và tên chỉ được chứa chữ cái và khoảng trắng'),
  PhoneNumber: yup
    .string()
    .optional()
    .matches(/^(84|0[3|5|7|8|9])+([0-9]{8})$/, 'Số điện thoại không hợp lệ (VD: 0987654321)'),
  DateOfBirth: yup
    .string()
    .optional()
    .test('age', 'Bạn phải từ 16 tuổi trở lên', function (value) {
      if (!value) return true; // Allow empty value
      const today = new Date();
      const birthDate = new Date(value);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age >= 16;
    }),
  Sex: yup
    .string()
    .optional()
    .oneOf(['Male', 'Female', 'Other'], 'Vui lòng chọn giới tính hợp lệ')
    .nullable(),
  Address: yup
    .string()
    .optional()
    .nullable()
    .max(200, 'Địa chỉ không được quá 200 ký tự')
    .transform((value, originalValue) => originalValue === "" ? null : value),
});

const InfoField = ({ icon: Icon, label, value, isEditing, children, error, fullWidth = false, isRequired = false }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className={`space-y-2 ${fullWidth ? 'col-span-1 md:col-span-2' : ''}`}
  >
    <label className="text-sm font-medium text-slate-400 flex items-center">
      <Icon className="w-4 h-4 mr-2 text-[#FFD875]" />
      {label}
      {isEditing && isRequired && <span className="text-red-400 ml-1">*</span>}
    </label>
    {isEditing ? (
      <>
        {children}
        {error && (
          <p className="text-red-400 text-xs flex items-start gap-1 mt-1.5">
            <ExclamationCircleIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error.message}</span>
          </p>
        )}
      </>
    ) : (
      <div className="w-full p-4 bg-slate-700/30 text-white rounded-xl border border-slate-600/30 min-h-[56px] flex items-center">
        {value || <span className="text-slate-500">Chưa cập nhật</span>}
      </div>
    )}
  </motion.div>
);

const ProfileInfo: React.FC = () => {
  const { user, setUser, isLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    userService.getUserProfile()
      .then(profile => {
        setUser(profile);
      })
      .catch(err => {
        console.error('Error loading user profile:', err);
        toast.error('Không thể tải thông tin người dùng.');
      });
  }, []);

  const { control, handleSubmit, reset, setError, clearErrors, formState: { errors, isDirty } } = useForm<UpdateProfileData>({
    resolver: yupResolver(profileSchema) as any,
    defaultValues: {
      FullName: '',
      PhoneNumber: '',
      DateOfBirth: undefined,
      Sex: undefined,
      Address: undefined,
    }
  });

  useEffect(() => {
    if (user) {
      console.log('User data in ProfileInfo:', user);
      // Map API data format (snake_case) to form format
      reset({
        FullName: user.fullName || user.Full_Name || '',
        PhoneNumber: user.phoneNumber || user.Phone_Number || '',
        DateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : 
                     user.Date_Of_Birth ? user.Date_Of_Birth.split('T')[0] : undefined,
        Sex: user.sex || user.Sex || undefined,
        Address: user.address || user.Address || undefined,
      });
    }
  }, [user, isEditing, reset]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center space-y-4"
        >
          <div className="relative">
            <div className="w-12 h-12 border-4 border-[#FFD875]/30 border-t-[#FFD875] rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-[#FFD875]/50 rounded-full animate-ping"></div>
          </div>
          <div className="text-[#FFD875] font-medium">Đang tải thông tin...</div>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <div className="text-red-400 text-lg mb-2">⚠️ Lỗi</div>
        <div className="text-slate-400">Không tìm thấy thông tin người dùng.</div>
      </motion.div>
    );
  }

  // Ẩn thông tin cá nhân nếu là Staff
  if (user.role === 'Staff') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <div className="text-yellow-400 text-lg mb-2">⚠️ Không có quyền truy cập</div>
        <div className="text-slate-400">Nhân viên không được phép xem thông tin cá nhân.</div>
      </motion.div>
    );
  }

  const onSubmit = async (data: UpdateProfileData) => {
    clearErrors();
    setSuccess(null);
    setIsSubmitting(true);

    try {
      // Transform data to match API expectations
      const payload = {
        ...data,
        DateOfBirth: data.DateOfBirth || undefined
      };

      const updatedUser = await userService.updateProfile(payload);
      setUser(updatedUser);
      setSuccess('Cập nhật thông tin thành công!');
      setIsEditing(false);
    } catch (err: any) {
      console.error('Update profile error:', err);
      
      // Handle structured API error response
      if (err.response && err.response.data) {
        const errorData = err.response.data;
        
        // Handle field-specific errors from errorDetails
        if (errorData.errorDetails) {
          Object.keys(errorData.errorDetails).forEach(fieldName => {
            const errorMessages = errorData.errorDetails[fieldName];
            if (Array.isArray(errorMessages) && errorMessages.length > 0) {
              setError(fieldName as keyof UpdateProfileData, { 
                type: 'manual', 
                message: errorMessages[0] 
              });
            }
          });
        }
        
        // If no field-specific errors but has general message, show it as server error
        if (!errorData.errorDetails && errorData.message) {
          setError('root.serverError', { 
            type: 'manual', 
            message: errorData.message 
          });
        }
      } else {
        // Fallback for other error types
        const errorMessage = err.message || 'Có lỗi xảy ra khi cập nhật.';
        setError('root.serverError', { type: 'manual', message: errorMessage });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSuccess(null);
    if (user) {
      reset({
        FullName: user.fullName || user.Full_Name || '',
        PhoneNumber: user.phoneNumber || user.Phone_Number || '',
        DateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : 
                     user.Date_Of_Birth ? user.Date_Of_Birth.split('T')[0] : undefined,
        Sex: user.sex || user.Sex || undefined,
        Address: user.address || user.Address || undefined,
      });
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Chưa cập nhật';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'Ngày không hợp lệ';
    }
  };

  // Helper function to get user field value (handles both camelCase and snake_case)
  const getUserField = (camelCase: keyof User, snakeCase: string) => {
    return (user as any)?.[camelCase] || (user as any)?.[snakeCase];
  };

  const genderMap: Record<string, string> = {
    Male: 'Nam',
    Female: 'Nữ',
    Other: 'Khác',
  };

  const getAccountStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'inactive':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'suspended':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-[#FFD875]/10 rounded-xl border border-[#FFD875]/20">
            <UserIcon className="w-6 h-6 text-[#FFD875]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-[#FFD875] to-[#FFC107] bg-clip-text text-transparent">
              Thông tin cá nhân
            </h2>
            <p className="text-slate-400 text-sm">Quản lý thông tin tài khoản của bạn</p>
          </div>
        </div>

        {!isEditing ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsEditing(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#FFD875] to-[#FFC107] text-black rounded-xl hover:shadow-[0_0_20px_rgba(255,216,117,0.4)] transition-all duration-300 font-semibold"
          >
            <PencilIcon className="w-4 h-4" />
            <span>Chỉnh sửa</span>
          </motion.button>
        ) : (
          <div className="flex space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting || !isDirty}
              className="flex items-center space-x-2 px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg"
            >
              <CheckIcon className="w-4 h-4" />
              <span>{isSubmitting ? 'Đang lưu...' : 'Lưu'}</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCancelEdit}
              className="flex items-center space-x-2 px-6 py-3 bg-slate-600 text-white rounded-xl hover:bg-slate-500 transition-all duration-300 font-semibold"
            >
              <XMarkIcon className="w-4 h-4" />
              <span>Hủy</span>
            </motion.button>
          </div>
        )}
      </motion.div>

      {/* Status Messages */}
      {errors.root?.serverError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl flex items-center space-x-2"
        >
          <XMarkIcon className="w-5 h-5 flex-shrink-0" />
          <span>{errors.root.serverError.message}</span>
        </motion.div>
      )}

      {/* Display field validation errors */}
      {(errors.FullName || errors.PhoneNumber || errors.DateOfBirth || errors.Sex || errors.Address) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl space-y-2"
        >
          <div className="flex items-center space-x-2 mb-2">
            <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0" />
            <span className="font-semibold">Vui lòng kiểm tra lại các thông tin sau:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 ml-7">
            {errors.FullName && <li>Họ và tên: {errors.FullName.message}</li>}
            {errors.PhoneNumber && <li>Số điện thoại: {errors.PhoneNumber.message}</li>}
            {errors.DateOfBirth && <li>Ngày sinh: {errors.DateOfBirth.message}</li>}
            {errors.Sex && <li>Giới tính: {errors.Sex.message}</li>}
            {errors.Address && <li>Địa chỉ: {errors.Address.message}</li>}
          </ul>
        </motion.div>
      )}

      {success && !isEditing && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl flex items-center space-x-2"
        >
          <CheckIcon className="w-5 h-5" />
          <span>{success}</span>
        </motion.div>
      )}

      {/* Account Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-slate-700/30 rounded-xl p-6 border border-slate-600/30"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ShieldCheckIcon className="w-6 h-6 text-[#FFD875]" />
            <div>
              <h3 className="text-lg font-semibold text-white">Trạng thái tài khoản</h3>
              <p className="text-slate-400 text-sm">Tình trạng hoạt động của tài khoản</p>
            </div>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getAccountStatusColor(getUserField('accountStatus', 'Account_Status') || 'unknown')}`}>
            {getUserField('accountStatus', 'Account_Status') === 'Active' ? 'Đang hoạt động' :
              getUserField('accountStatus', 'Account_Status') === 'Inactive' ? 'Không hoạt động' :
                getUserField('accountStatus', 'Account_Status') === 'Suspended' ? 'Bị đình chỉ' : 'Không xác định'}
          </span>
        </div>
      </motion.div>

      {/* Form Fields */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8"
        >
          {/* Full Name */}
          <InfoField
            icon={UserIcon}
            label="Họ và tên"
            value={getUserField('fullName', 'Full_Name')}
            isEditing={isEditing}
            error={errors.FullName}
            isRequired
          >
            <Controller
              name="FullName"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  className={`w-full p-4 bg-slate-700/50 text-white rounded-xl border focus:outline-none focus:ring-2 transition-all duration-300 ${
                    errors.FullName 
                    ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' 
                    : 'border-slate-600/50 focus:border-[#FFD875] focus:ring-[#FFD875]/20'
                  }`}
                />
              )}
            />
          </InfoField>

          {/* Email */}
          <InfoField
            icon={EnvelopeIcon}
            label="Email (Không thể thay đổi)"
            value={getUserField('email', 'Email')}
          >
            <input
              type="text"
              value={getUserField('email', 'Email')}
              disabled
              className="w-full p-4 bg-slate-800/50 text-slate-400 rounded-xl border border-slate-700 cursor-not-allowed"
            />
          </InfoField>

          {/* Phone Number */}
          <InfoField
            icon={PhoneIcon}
            label="Số điện thoại"
            value={getUserField('phoneNumber', 'Phone_Number')}
            isEditing={isEditing}
            error={errors.PhoneNumber}
            isRequired
          >
            <Controller
              name="PhoneNumber"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  value={field.value || ''}
                  className={`w-full p-4 bg-slate-700/50 text-white rounded-xl border focus:outline-none focus:ring-2 transition-all duration-300 ${
                    errors.PhoneNumber 
                    ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' 
                    : 'border-slate-600/50 focus:border-[#FFD875] focus:ring-[#FFD875]/20'
                  }`}
                />
              )}
            />
          </InfoField>

          {/* Date of Birth */}
          <InfoField
            icon={CalendarDaysIcon}
            label="Ngày sinh"
            value={formatDate(getUserField('dateOfBirth', 'Date_Of_Birth'))}
            isEditing={isEditing}
            error={errors.DateOfBirth}
            isRequired
          >
            <Controller
              name="DateOfBirth"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  value={field.value || ''}
                  type="date"
                  className={`w-full p-4 bg-slate-700/50 text-white rounded-xl border focus:outline-none focus:ring-2 transition-all duration-300 ${
                    errors.DateOfBirth 
                    ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' 
                    : 'border-slate-600/50 focus:border-[#FFD875] focus:ring-[#FFD875]/20'
                  }`}
                />
              )}
            />
          </InfoField>

          {/* Sex */}
          <InfoField
            icon={SparklesIcon}
            label="Giới tính"
            value={getUserField('sex', 'Sex') ? genderMap[getUserField('sex', 'Sex')] : undefined}
            isEditing={isEditing}
            error={errors.Sex}
          >
            <Controller
              name="Sex"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  value={field.value || ''}
                  className={`w-full p-4 bg-slate-700/50 text-white rounded-xl border focus:outline-none focus:ring-2 transition-all duration-300 appearance-none ${
                    errors.Sex 
                    ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' 
                    : 'border-slate-600/50 focus:border-[#FFD875] focus:ring-[#FFD875]/20'
                  }`}
                >
                  <option value="" disabled>-- Chọn giới tính --</option>
                  <option value="Male">Nam</option>
                  <option value="Female">Nữ</option>
                  <option value="Other">Khác</option>
                </select>
              )}
            />
          </InfoField>

          {/* Address */}
          <InfoField
            icon={MapPinIcon}
            label="Địa chỉ"
            value={getUserField('address', 'Address')}
            isEditing={isEditing}
            error={errors.Address}
            fullWidth={true}
          >
            <Controller
              name="Address"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  value={field.value || ''}
                  rows={3}
                  className={`w-full p-4 bg-slate-700/50 text-white rounded-xl border focus:outline-none focus:ring-2 transition-all duration-300 ${
                    errors.Address 
                    ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' 
                    : 'border-slate-600/50 focus:border-[#FFD875] focus:ring-[#FFD875]/20'
                  }`}
                />
              )}
            />
          </InfoField>

          {/* Account Status - Not editable */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="md:col-span-2"
          >
            <label className="text-sm font-medium text-slate-400 flex items-center">
              <ShieldCheckIcon className="w-4 h-4 mr-2 text-[#FFD875]" />
              Trạng thái tài khoản
            </label>
            <div className={`mt-2 inline-flex items-center gap-2 text-sm font-semibold px-3 py-1.5 rounded-full ${getAccountStatusColor(getUserField('status', 'Account_Status') || 'Active')}`}>
              {getUserField('status', 'Account_Status') || getUserField('accountStatus', 'Account_Status') || 'Active'}
            </div>
          </motion.div>
        </motion.div>
      </form>
    </div>
  );
};

export default ProfileInfo; 
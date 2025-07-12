import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
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
    .required('Họ và tên là bắt buộc')
    .min(2, 'Họ và tên phải có ít nhất 2 ký tự')
    .max(50, 'Họ và tên không được quá 50 ký tự')
    .matches(/^[a-zA-ZÀ-ỹ\s]+$/, 'Họ và tên chỉ được chứa chữ cái và khoảng trắng'),
  PhoneNumber: yup
    .string()
    .required('Số điện thoại là bắt buộc')
    .matches(/^(84|0[3|5|7|8|9])+([0-9]{8})$/, 'Số điện thoại không hợp lệ (VD: 0987654321)'),
  DateOfBirth: yup
    .string()
    .required('Ngày sinh là bắt buộc')
    .test('age', 'Bạn phải từ 16 tuổi trở lên', function (value) {
      if (!value) return true; // Let required handle it
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
    .oneOf(['Male', 'Female', 'Other'], 'Vui lòng chọn giới tính hợp lệ')
    .nullable(),
  Address: yup
    .string()
    .nullable()
    .max(200, 'Địa chỉ không được quá 200 ký tự')
    .transform((value, originalValue) => originalValue === "" ? null : value),
});

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

const InfoField = ({ icon: Icon, label, value, isEditing, children, error, fullWidth = false, isRequired = false }: any) => (
  <motion.div variants={itemVariants} className={`space-y-2 ${fullWidth ? 'col-span-1 md:col-span-2' : ''}`}>
    <label className="text-sm font-medium text-slate-400 flex items-center">
      <Icon className="w-4 h-4 mr-2 text-[#FFD875]" />
      {label}
      {isEditing && isRequired && <span className="text-red-400 ml-1">*</span>}
    </label>
    {isEditing ? (
      <>
        {children}
        {error && (
          <p className="text-red-400 text-xs flex items-center gap-1 mt-1.5">
            <ExclamationCircleIcon className="w-4 h-4 mr-1" />
            {error.message}
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

  const { control, handleSubmit, reset, setError, clearErrors, formState: { errors, isDirty } } = useForm<UpdateProfileData>({
    resolver: yupResolver(profileSchema),
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
      // Map API data format to form format
      reset({
        FullName: user.fullName || '',
        PhoneNumber: user.phoneNumber || '',
        DateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : undefined,
        Sex: user.sex || undefined,
        Address: user.address || undefined,
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
        DateOfBirth: data.DateOfBirth || null
      };

      const updatedUser = await userService.updateProfile(payload);
      setUser(updatedUser);
      setSuccess('Cập nhật thông tin thành công!');
      setIsEditing(false);
    } catch (err: any) {
      const errorMessage = err.message || 'Có lỗi xảy ra khi cập nhật.';
      if (errorMessage.toLowerCase().includes('phone')) {
        setError('PhoneNumber', { type: 'manual', message: 'Số điện thoại này đã được sử dụng.' });
      } else {
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
        FullName: user.fullName || '',
        PhoneNumber: user.phoneNumber || '',
        DateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : undefined,
        Sex: user.sex || undefined,
        Address: user.address || undefined,
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
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
          <XMarkIcon className="w-5 h-5" />
          <span>{errors.root.serverError.message}</span>
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
        variants={itemVariants}
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
          <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getAccountStatusColor(user.accountStatus || 'unknown')}`}>
            {user.accountStatus === 'Active' ? 'Đang hoạt động' :
              user.accountStatus === 'Inactive' ? 'Không hoạt động' :
                user.accountStatus === 'Suspended' ? 'Bị đình chỉ' : 'Không xác định'}
          </span>
        </div>
      </motion.div>

      {/* Form Fields */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8"
        >
          {/* Full Name */}
          <InfoField
            icon={UserIcon}
            label="Họ và tên"
            value={user.fullName}
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
            value={user.email}
          >
            <input
              type="text"
              value={user.email}
              disabled
              className="w-full p-4 bg-slate-800/50 text-slate-400 rounded-xl border border-slate-700 cursor-not-allowed"
            />
          </InfoField>

          {/* Phone Number */}
          <InfoField
            icon={PhoneIcon}
            label="Số điện thoại"
            value={user.phoneNumber}
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
            value={formatDate(user.dateOfBirth)}
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
            value={user.sex ? genderMap[user.sex] : undefined}
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
            value={user.address}
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
          <motion.div variants={itemVariants} className="md:col-span-2">
            <label className="text-sm font-medium text-slate-400 flex items-center">
              <ShieldCheckIcon className="w-4 h-4 mr-2 text-[#FFD875]" />
              Trạng thái tài khoản
            </label>
            <div className={`mt-2 inline-flex items-center gap-2 text-sm font-semibold px-3 py-1.5 rounded-full ${getAccountStatusColor(user.status || 'Active')}`}>
              {user.status || 'Active'}
            </div>
          </motion.div>
        </motion.div>
      </form>
    </motion.div>
  );
};

export default ProfileInfo; 
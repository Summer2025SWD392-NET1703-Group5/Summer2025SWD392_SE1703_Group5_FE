// src/components/admin/forms/UserForm.tsx
import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarDaysIcon,
  XMarkIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import type { User, UserFormData } from '../../../types/user';
import ImageUpload from '../common/ImageUpload';
import DateTimePicker from '../common/DateTimePicker';
import MultiSelect from '../common/MultiSelect';

const userSchema = yup.object({
  email: yup.string().required('Email là bắt buộc').email('Email không hợp lệ'),
  username: yup.string().required('Tên đăng nhập là bắt buộc').min(3, 'Tên đăng nhập quá ngắn'),
  firstName: yup.string().required('Họ là bắt buộc'),
  lastName: yup.string().required('Tên là bắt buộc'),
  phone: yup.string().required('Số điện thoại là bắt buộc').matches(/^[0-9+\-\s]+$/, 'Số điện thoại không hợp lệ'),
  role: yup.string().required('Vai trò là bắt buộc'),
  status: yup.string().required('Trạng thái là bắt buộc'),
});

interface UserFormProps {
  user?: User;
  onSubmit: (data: UserFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const UserForm: React.FC<UserFormProps> = ({ user, onSubmit, onCancel, loading = false }) => {
  const [avatar, setAvatar] = useState<File | string | null>(user?.avatar || null);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: yupResolver(userSchema),
    defaultValues: {
      email: user?.email || '',
      username: user?.username || '',
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      dateOfBirth: user?.dateOfBirth || null,
      gender: user?.gender || 'other',
      role: user?.role || 'customer',
      status: user?.status || 'active',
      preferences: {
        language: user?.preferences?.language || 'vi',
        notifications: {
          email: user?.preferences?.notifications?.email ?? true,
          sms: user?.preferences?.notifications?.sms ?? false,
          push: user?.preferences?.notifications?.push ?? true,
        },
        favoriteGenres: user?.preferences?.favoriteGenres || [],
      },
    },
  });

  const watchedRole = watch('role');
  const watchedFavoriteGenres = watch('preferences.favoriteGenres');

  const genreOptions = [
    { value: 'action', label: 'Hành động' },
    { value: 'comedy', label: 'Hài' },
    { value: 'drama', label: 'Chính kịch' },
    { value: 'horror', label: 'Kinh dị' },
    { value: 'romance', label: 'Lãng mạn' },
    { value: 'sci-fi', label: 'Khoa học viễn tưởng' },
    { value: 'thriller', label: 'Ly kỳ' },
    { value: 'documentary', label: 'Tài liệu' },
    { value: 'animation', label: 'Hoạt hình' },
    { value: 'adventure', label: 'Phiêu lưu' },
  ];

  const handleFormSubmit = async (data: UserFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Error submitting user form:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-slate-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <UserIcon className="w-8 h-8 text-yellow-500" />
          <h2 className="text-2xl font-bold text-white">
            {user ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
          </h2>
        </div>
        <button
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
        {/* Avatar */}
        <div className="bg-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Ảnh đại diện
          </h3>
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-slate-600 rounded-full flex items-center justify-center overflow-hidden">
              {avatar ? (
                <img
                  src={typeof avatar === 'string' ? avatar : URL.createObjectURL(avatar)}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserIcon className="w-12 h-12 text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <ImageUpload
                value={avatar}
                onChange={setAvatar}
                aspectRatio="1/1"
                placeholder="Tải lên ảnh đại diện"
              />
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="bg-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <UserIcon className="w-5 h-5 mr-2" />
            Thông tin cơ bản
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email *
              </label>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      {...field}
                      type="email"
                      className="w-full bg-slate-600 text-white rounded-lg pl-10 pr-4 py-2 border border-slate-500 focus:border-yellow-500 focus:outline-none"
                      placeholder="user@example.com"
                    />
                  </div>
                )}
              />
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tên đăng nhập *
              </label>
              <Controller
                name="username"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className="w-full bg-slate-600 text-white rounded-lg px-4 py-2 border border-slate-500 focus:border-yellow-500 focus:outline-none"
                    placeholder="username"
                  />
                )}
              />
              {errors.username && (
                <p className="text-red-400 text-sm mt-1">{errors.username.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Họ *
              </label>
              <Controller
                name="firstName"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className="w-full bg-slate-600 text-white rounded-lg px-4 py-2 border border-slate-500 focus:border-yellow-500 focus:outline-none"
                    placeholder="Nguyễn"
                  />
                )}
              />
              {errors.firstName && (
                <p className="text-red-400 text-sm mt-1">{errors.firstName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tên *
              </label>
              <Controller
                name="lastName"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className="w-full bg-slate-600 text-white rounded-lg px-4 py-2 border border-slate-500 focus:border-yellow-500 focus:outline-none"
                    placeholder="Văn A"
                  />
                )}
              />
              {errors.lastName && (
                <p className="text-red-400 text-sm mt-1">{errors.lastName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Số điện thoại *
              </label>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <div className="relative">
                    <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      {...field}
                      type="tel"
                      className="w-full bg-slate-600 text-white rounded-lg pl-10 pr-4 py-2 border border-slate-500 focus:border-yellow-500 focus:outline-none"
                      placeholder="0123 456 789"
                    />
                  </div>
                )}
              />
              {errors.phone && (
                <p className="text-red-400 text-sm mt-1">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Ngày sinh
              </label>
              <Controller
                name="dateOfBirth"
                control={control}
                render={({ field }) => (
                  <DateTimePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Chọn ngày sinh"
                    maxDate={new Date()}
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Giới tính
              </label>
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full bg-slate-600 text-white rounded-lg px-4 py-2 border border-slate-500 focus:border-yellow-500 focus:outline-none"
                  >
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                )}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Vai trò *
              </label>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full bg-slate-600 text-white rounded-lg px-4 py-2 border border-slate-500 focus:border-yellow-500 focus:outline-none"
                  >
                    <option value="customer">Khách hàng</option>
                    <option value="staff">Nhân viên</option>
                    <option value="admin">Quản trị viên</option>
                  </select>
                )}
              />
              {errors.role && (
                <p className="text-red-400 text-sm mt-1">{errors.role.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Trạng thái *
              </label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full bg-slate-600 text-white rounded-lg px-4 py-2 border border-slate-500 focus:border-yellow-500 focus:outline-none"
                  >
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Không hoạt động</option>
                    <option value="banned">Bị cấm</option>
                  </select>
                )}
              />
              {errors.status && (
                <p className="text-red-400 text-sm mt-1">{errors.status.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Tùy chọn cá nhân
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Ngôn ngữ
              </label>
              <Controller
                name="preferences.language"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full bg-slate-600 text-white rounded-lg px-4 py-2 border border-slate-500 focus:border-yellow-500 focus:outline-none"
                  >
                    <option value="vi">Tiếng Việt</option>
                    <option value="en">English</option>
                  </select>
                )}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Thể loại yêu thích
              </label>
              <Controller
                name="preferences.favoriteGenres"
                control={control}
                render={({ field }) => (
                  <MultiSelect
                    options={genreOptions}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Chọn thể loại phim yêu thích"
                  />
                )}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Thông báo
              </label>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Controller
                    name="preferences.notifications.email"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="checkbox"
                        checked={field.value}
                        className="w-4 h-4 text-yellow-600 bg-slate-600 border-slate-500 rounded focus:ring-yellow-500"
                      />
                    )}
                  />
                  <label className="ml-2 text-sm text-gray-300">
                    Thông báo qua email
                  </label>
                </div>

                <div className="flex items-center">
                  <Controller
                    name="preferences.notifications.sms"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="checkbox"
                        checked={field.value}
                        className="w-4 h-4 text-yellow-600 bg-slate-600 border-slate-500 rounded focus:ring-yellow-500"
                      />
                    )}
                  />
                  <label className="ml-2 text-sm text-gray-300">
                    Thông báo qua SMS
                  </label>
                </div>

                <div className="flex items-center">
                  <Controller
                    name="preferences.notifications.push"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="checkbox"
                        checked={field.value}
                        className="w-4 h-4 text-yellow-600 bg-slate-600 border-slate-500 rounded focus:ring-yellow-500"
                      />
                    )}
                  />
                  <label className="ml-2 text-sm text-gray-300">
                    Thông báo đẩy
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-slate-600">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            <span>{user ? 'Cập nhật' : 'Tạo mới'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;

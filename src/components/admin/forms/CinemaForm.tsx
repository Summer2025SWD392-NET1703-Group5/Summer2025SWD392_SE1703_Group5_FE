// src/components/admin/forms/CinemaForm.tsx
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  BuildingOfficeIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import type { Cinema, CinemaFormData } from '../../../types/cinema';
import RichTextEditor from '../common/RichTextEditor';

// Frontend form shape
interface CinemaFormShape {
  name: string;
  address: string;
  city: string;
  province: string;
  phone: string;
  email: string;
  description: string;
  status: 'Active' | 'Maintenance' | 'Closed';
}

const cinemaSchema = yup.object({
  name: yup.string().required('Tên rạp là bắt buộc').min(2, 'Tên rạp quá ngắn'),
  address: yup.string().required('Địa chỉ là bắt buộc'),
  city: yup.string().required('Thành phố là bắt buộc'),
  province: yup.string().required('Tỉnh/Thành là bắt buộc'),
  phone: yup.string().required('Số điện thoại là bắt buộc').matches(/^[0-9+\-\s()]+$/, 'Số điện thoại không hợp lệ'),
  email: yup.string().required('Email là bắt buộc').email('Email không hợp lệ'),
  description: yup.string().required('Mô tả là bắt buộc'),
  status: yup.string().oneOf(['Active', 'Maintenance', 'Closed']).required('Trạng thái là bắt buộc'),
});

interface CinemaFormProps {
  cinema?: Cinema;
  onSubmit: (data: CinemaFormShape) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const CinemaForm: React.FC<CinemaFormProps> = ({ cinema, onSubmit, onCancel, loading = false }) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CinemaFormShape>({
    resolver: yupResolver(cinemaSchema),
    defaultValues: {
      name: cinema?.Cinema_Name || '',
      address: cinema?.Address || '',
      city: cinema?.City || 'Hồ Chí Minh',
      province: cinema?.Province || 'Hồ Chí Minh',
      phone: cinema?.Phone_Number || '',
      email: cinema?.Email || '',
      description: cinema?.Description || '',
      status: cinema?.Status === 'Deleted' ? 'Closed' : (cinema?.Status || 'Active'),
    },
  });

  const cities = [
    'Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
    'An Giang', 'Bà Rịa - Vũng Tàu', 'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu',
    'Bắc Ninh', 'Bến Tre', 'Bình Định', 'Bình Dương', 'Bình Phước',
    'Bình Thuận', 'Cà Mau', 'Cao Bằng', 'Đắk Lắk', 'Đắk Nông', 'Điện Biên',
    'Đồng Nai', 'Đồng Tháp', 'Gia Lai', 'Hà Giang', 'Hà Nam', 'Hà Tĩnh',
    'Hải Dương', 'Hậu Giang', 'Hòa Bình', 'Hưng Yên', 'Khánh Hòa', 'Kiên Giang',
    'Kon Tum', 'Lai Châu', 'Lâm Đồng', 'Lạng Sơn', 'Lào Cai', 'Long An',
    'Nam Định', 'Nghệ An', 'Ninh Bình', 'Ninh Thuận', 'Phú Thọ', 'Phú Yên',
    'Quảng Bình', 'Quảng Nam', 'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị',
  ];

  const handleFormSubmit = async (data: CinemaFormShape) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Error submitting cinema form:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-slate-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <BuildingOfficeIcon className="w-8 h-8 text-yellow-500" />
          <h2 className="text-2xl font-bold text-white">
            {cinema ? 'Chỉnh sửa rạp chiếu' : 'Thêm rạp chiếu mới'}
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
        {/* Basic Information */}
        <div className="bg-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <BuildingOfficeIcon className="w-5 h-5 mr-2" />
            Thông tin cơ bản
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tên rạp chiếu *
              </label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className="w-full bg-slate-600 text-white rounded-lg px-4 py-2 border border-slate-500 focus:border-yellow-500 focus:outline-none"
                    placeholder="Nhập tên rạp chiếu"
                  />
                )}
              />
              {errors.name && (
                <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tỉnh/Thành phố *
              </label>
              <Controller
                name="province"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full bg-slate-600 text-white rounded-lg px-4 py-2 border border-slate-500 focus:border-yellow-500 focus:outline-none"
                  >
                    <option value="">Chọn Tỉnh/Thành</option>
                    {cities.map(city => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.province && (
                <p className="text-red-400 text-sm mt-1">{errors.province.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Thành phố/Quận *
              </label>
              <Controller
                name="city"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className="w-full bg-slate-600 text-white rounded-lg px-4 py-2 border border-slate-500 focus:border-yellow-500 focus:outline-none"
                    placeholder="Nhập thành phố hoặc quận"
                  />
                )}
              />
              {errors.city && (
                <p className="text-red-400 text-sm mt-1">{errors.city.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Địa chỉ *
              </label>
              <Controller
                name="address"
                control={control}
                render={({ field }) => (
                  <div className="relative">
                    <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      {...field}
                      type="text"
                      className="w-full bg-slate-600 text-white rounded-lg pl-10 pr-4 py-2 border border-slate-500 focus:border-yellow-500 focus:outline-none"
                      placeholder="Nhập địa chỉ chi tiết"
                    />
                  </div>
                )}
              />
              {errors.address && (
                <p className="text-red-400 text-sm mt-1">{errors.address.message}</p>
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
                      placeholder="cinema@example.com"
                    />
                  </div>
                )}
              />
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Mô tả *
              </label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <RichTextEditor
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Nhập mô tả về rạp chiếu..."
                    minHeight="120px"
                  />
                )}
              />
              {errors.description && (
                <p className="text-red-400 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Cài đặt
          </h3>
          <div className="md:col-span-2">
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
                  <option value="Active">Hoạt động</option>
                  <option value="Maintenance">Bảo trì</option>
                  <option value="Closed">Ngừng hoạt động</option>
                </select>
              )}
            />
            {errors.status && (
              <p className="text-red-400 text-sm mt-1">{errors.status.message}</p>
            )}
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
            <span>{cinema ? 'Cập nhật' : 'Tạo mới'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default CinemaForm;

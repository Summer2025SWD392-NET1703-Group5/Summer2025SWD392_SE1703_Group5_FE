// src/pages/admin/cinemas/AddCinema.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeftIcon, BuildingOfficeIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { cinemaService } from '../../../services/cinemaService';
import type { CinemaFormData } from '../../../types/cinema';
import { motion } from 'framer-motion';

const AddCinema: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const { register, handleSubmit, formState: { errors }, setError } = useForm<CinemaFormData>();

  const onSubmit = async (data: CinemaFormData) => {
    setLoading(true);
    setServerErrors({}); // Clear previous server errors
    const toastId = toast.loading('Đang thêm rạp chiếu phim...');

    try {
      // Thêm rạp chiếu phim vào hệ thống
      await cinemaService.createCinema({
        ...data,
        Status: 'Active', // Mặc định trạng thái khi tạo mới là Active
      });

      toast.success('Thêm rạp chiếu phim thành công!', { id: toastId });
      navigate('/admin/cinemas'); // Chuyển về trang danh sách rạp
    } catch (error: any) {
      console.error('Error creating cinema:', error);
      toast.dismiss(toastId); // Dismiss loading toast

      // Parse error response để hiển thị lỗi trên input
      let errorData: any = {};

      try {
        // Nếu error.message là JSON string
        if (error.message && error.message !== 'Failed to fetch') {
          errorData = JSON.parse(error.message);
        }
      } catch {
        // Nếu không parse được, thử lấy từ response
        if (error.response?.data) {
          errorData = error.response.data;
        }
      }

      // Xử lý errorDetails để hiển thị lỗi trên từng field
      if (errorData.errorDetails) {
        const newServerErrors: Record<string, string> = {};

        Object.keys(errorData.errorDetails).forEach(field => {
          const fieldErrors = errorData.errorDetails[field];
          if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
            // Map field names từ API sang form field names
            const fieldMap: Record<string, string> = {
              'Cinema_Name': 'Cinema_Name',
              'Address': 'Address',
              'City': 'City',
              'Description': 'Description'
            };

            const formFieldName = fieldMap[field] || field;
            newServerErrors[formFieldName] = fieldErrors[0]; // Lấy lỗi đầu tiên

            // Set error cho react-hook-form
            setError(formFieldName as keyof CinemaFormData, {
              type: 'server',
              message: fieldErrors[0]
            });
          }
        });

        setServerErrors(newServerErrors);
      } else if (errorData.errors && Array.isArray(errorData.errors)) {
        // Xử lý errors array format: ["Address: Địa chỉ phải từ 10-500 ký tự"]
        const newServerErrors: Record<string, string> = {};

        errorData.errors.forEach((errorMsg: string) => {
          const colonIndex = errorMsg.indexOf(':');
          if (colonIndex > 0) {
            const field = errorMsg.substring(0, colonIndex).trim();
            const message = errorMsg.substring(colonIndex + 1).trim();

            // Map field names
            const fieldMap: Record<string, string> = {
              'Cinema_Name': 'Cinema_Name',
              'Address': 'Address',
              'City': 'City',
              'Description': 'Description'
            };

            const formFieldName = fieldMap[field] || field;
            newServerErrors[formFieldName] = message;

            setError(formFieldName as keyof CinemaFormData, {
              type: 'server',
              message: message
            });
          }
        });

        setServerErrors(newServerErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-slate-900">
      <div className="mb-6 flex items-center">
        <button
          onClick={() => navigate('/admin/cinemas')}
          className="mr-4 p-2 rounded-full hover:bg-slate-700 transition-all duration-200 text-gray-400 hover:text-white"
        >
          <ArrowLeftIcon className="h-6 w-6" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Thêm rạp chiếu phim mới</h1>
          <p className="text-gray-400 mt-1">Thêm thông tin rạp chiếu phim mới vào hệ thống</p>
        </div>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        onSubmit={handleSubmit(onSubmit)}
        className="bg-slate-800 rounded-lg p-6 border border-slate-700 shadow-lg max-w-3xl mx-auto"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="Cinema_Name" className="block text-sm font-medium text-gray-300 mb-1">
              Tên rạp <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <BuildingOfficeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="Cinema_Name"
                type="text"
                placeholder="Nhập tên rạp chiếu phim"
                className={`bg-slate-700 text-white rounded-lg pl-10 pr-4 py-3 w-full border ${(errors.Cinema_Name || serverErrors.Cinema_Name) ? 'border-red-500' : 'border-slate-600'
                  } focus:border-[#FFD875] focus:outline-none focus:shadow-[0_0_10px_0_rgba(255,216,117,0.3)]`}
                {...register('Cinema_Name', { required: 'Tên rạp là bắt buộc' })}
              />
            </div>
            {(serverErrors.Cinema_Name || errors.Cinema_Name) && (
              <p className="text-red-500 text-sm mt-1">{serverErrors.Cinema_Name || errors.Cinema_Name?.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="City" className="block text-sm font-medium text-gray-300 mb-1">
              Thành phố <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="City"
                type="text"
                placeholder="Nhập thành phố"
                className={`bg-slate-700 text-white rounded-lg pl-10 pr-4 py-3 w-full border ${(errors.City || serverErrors.City) ? 'border-red-500' : 'border-slate-600'
                  } focus:border-[#FFD875] focus:outline-none focus:shadow-[0_0_10px_0_rgba(255,216,117,0.3)]`}
                {...register('City', { required: 'Thành phố là bắt buộc' })}
              />
            </div>
            {(serverErrors.City || errors.City) && (
              <p className="text-red-500 text-sm mt-1">{serverErrors.City || errors.City?.message}</p>
            )}
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="Address" className="block text-sm font-medium text-gray-300 mb-1">
            Địa chỉ <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <MapPinIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <textarea
              id="Address"
              placeholder="Nhập địa chỉ chi tiết"
              rows={2}
              className={`bg-slate-700 text-white rounded-lg pl-10 pr-4 py-2 w-full border ${(errors.Address || serverErrors.Address) ? 'border-red-500' : 'border-slate-600'
                } focus:border-[#FFD875] focus:outline-none focus:shadow-[0_0_10px_0_rgba(255,216,117,0.3)]`}
              {...register('Address', { required: 'Địa chỉ là bắt buộc' })}
            ></textarea>
          </div>
          {(serverErrors.Address || errors.Address) && (
            <p className="text-red-500 text-sm mt-1">{serverErrors.Address || errors.Address?.message}</p>
          )}
        </div>

        <div className="mb-6">
          <label htmlFor="Description" className="block text-sm font-medium text-gray-300 mb-1">
            Mô tả
          </label>
          <textarea
            id="Description"
            placeholder="Nhập mô tả về rạp chiếu phim (tùy chọn)"
            rows={4}
            className={`bg-slate-700 text-white rounded-lg px-4 py-3 w-full border ${(errors.Description || serverErrors.Description) ? 'border-red-500' : 'border-slate-600'
              } focus:border-[#FFD875] focus:outline-none focus:shadow-[0_0_10px_0_rgba(255,216,117,0.3)]`}
            {...register('Description')}
          ></textarea>
          {(serverErrors.Description || errors.Description) && (
            <p className="text-red-500 text-sm mt-1">{serverErrors.Description || errors.Description?.message}</p>
          )}
        </div>

        <div className="flex justify-end mt-6">
          <button
            type="button"
            onClick={() => navigate('/admin/cinemas')}
            className="px-6 py-3 bg-slate-700 text-white rounded-lg mr-4 hover:bg-slate-600 transition-colors"
            disabled={loading}
          >
            Hủy
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-[#FFD875] text-black font-medium rounded-lg hover:bg-[#e5c368] transition-colors shadow-[0_0_15px_0_rgba(255,216,117,0.3)] hover:shadow-[0_0_20px_0_rgba(255,216,117,0.5)]"
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : 'Thêm rạp chiếu phim'}
          </button>
        </div>
      </motion.form>
    </div>
  );
};

export default AddCinema;

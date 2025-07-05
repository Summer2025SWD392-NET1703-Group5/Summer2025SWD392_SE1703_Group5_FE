import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  ArrowLeftIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarDaysIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import api from '../../../config/api';

interface CustomerFormData {
  Full_Name: string;
  Email: string;
  Phone_Number: string;
  Date_Of_Birth: string;
  Sex: string;
  Address: string;
  Role: string;
}

const AddCustomer: React.FC = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<CustomerFormData>({
    Full_Name: '',
    Email: '',
    Phone_Number: '',
    Date_Of_Birth: '',
    Sex: 'Male',
    Address: '',
    Role: 'Customer'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Clear error when user corrects input
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.Full_Name.trim()) {
      newErrors.Full_Name = 'Vui lòng nhập tên khách hàng';
    }

    if (!formData.Email.trim()) {
      newErrors.Email = 'Vui lòng nhập email';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.Email)) {
      newErrors.Email = 'Email không hợp lệ';
    }

    if (!formData.Phone_Number.trim()) {
      newErrors.Phone_Number = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10,11}$/.test(formData.Phone_Number)) {
      newErrors.Phone_Number = 'Số điện thoại không hợp lệ';
    }

    if (!formData.Date_Of_Birth.trim()) {
      newErrors.Date_Of_Birth = 'Vui lòng nhập ngày sinh';
    }

    if (!formData.Sex.trim()) {
      newErrors.Sex = 'Vui lòng chọn giới tính';
    }

    if (!formData.Address.trim()) {
      newErrors.Address = 'Vui lòng nhập địa chỉ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Vui lòng kiểm tra lại thông tin');
      return;
    }

    setSubmitting(true);

    try {
      // Generate a random password
      const randomPassword = Math.random().toString(36).slice(-8);

      // Call the register user API
      const userData = {
        ...formData,
        Password: randomPassword,
        Account_Status: 'active'
      };

      const response = await api.post('/user/register-user', userData);

      toast.success('Thêm khách hàng thành công');
      navigate('/admin/customers');
    } catch (error: any) {
      console.error('Error adding customer:', error);
      toast.error(error.response?.data?.message || 'Không thể thêm khách hàng');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link
          to="/admin/customers"
          className="flex items-center text-gray-400 hover:text-FFD875 transition-colors mb-2"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-1" />
          <span>Quay lại danh sách khách hàng</span>
        </Link>
        <h1 className="text-2xl font-bold text-white">Thêm khách hàng mới</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Thông tin cá nhân */}
          <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-white border-b border-slate-700 pb-2 mb-6">
              Thông tin khách hàng
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Họ tên */}
              <div>
                <label htmlFor="Full_Name" className="block text-sm font-medium text-gray-300 mb-1 required-field">
                  Họ và tên
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="Full_Name"
                    name="Full_Name"
                    value={formData.Full_Name}
                    onChange={handleInputChange}
                    className={`bg-slate-700 text-white pl-10 pr-4 py-2 rounded-lg border ${errors.Full_Name ? 'border-red-500 input-error' : 'border-slate-600 focus:border-FFD875 focus:outline-none focus:ring-1 focus:ring-FFD875'
                      } w-full`}
                    placeholder="Nhập họ tên khách hàng"
                  />
                </div>
                {errors.Full_Name && <p className="error-message">{errors.Full_Name}</p>}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="Email" className="block text-sm font-medium text-gray-300 mb-1 required-field">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="Email"
                    name="Email"
                    value={formData.Email}
                    onChange={handleInputChange}
                    className={`bg-slate-700 text-white pl-10 pr-4 py-2 rounded-lg border ${errors.Email ? 'border-red-500 input-error' : 'border-slate-600 focus:border-FFD875 focus:outline-none focus:ring-1 focus:ring-FFD875'
                      } w-full`}
                    placeholder="Nhập email"
                  />
                </div>
                {errors.Email && <p className="error-message">{errors.Email}</p>}
              </div>

              {/* Số điện thoại */}
              <div>
                <label htmlFor="Phone_Number" className="block text-sm font-medium text-gray-300 mb-1 required-field">
                  Số điện thoại
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <PhoneIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    id="Phone_Number"
                    name="Phone_Number"
                    value={formData.Phone_Number}
                    onChange={handleInputChange}
                    className={`bg-slate-700 text-white pl-10 pr-4 py-2 rounded-lg border ${errors.Phone_Number ? 'border-red-500 input-error' : 'border-slate-600 focus:border-FFD875 focus:outline-none focus:ring-1 focus:ring-FFD875'
                      } w-full`}
                    placeholder="Nhập số điện thoại"
                  />
                </div>
                {errors.Phone_Number && <p className="error-message">{errors.Phone_Number}</p>}
              </div>

              {/* Ngày sinh */}
              <div>
                <label htmlFor="Date_Of_Birth" className="block text-sm font-medium text-gray-300 mb-1 required-field">
                  Ngày sinh
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CalendarDaysIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    id="Date_Of_Birth"
                    name="Date_Of_Birth"
                    value={formData.Date_Of_Birth}
                    onChange={handleInputChange}
                    className={`bg-slate-700 text-white pl-10 pr-4 py-2 rounded-lg border ${errors.Date_Of_Birth ? 'border-red-500 input-error' : 'border-slate-600 focus:border-FFD875 focus:outline-none focus:ring-1 focus:ring-FFD875'
                      } w-full`}
                  />
                </div>
                {errors.Date_Of_Birth && <p className="error-message">{errors.Date_Of_Birth}</p>}
              </div>
            </div>
          </div>

          {/* Thông tin tài khoản */}
          <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-white border-b border-slate-700 pb-2 mb-6">
              Thông tin bổ sung
            </h2>

            <div className="space-y-6">
              {/* Giới tính */}
              <div>
                <label htmlFor="Sex" className="block text-sm font-medium text-gray-300 mb-1 required-field">
                  Giới tính
                </label>
                <select
                  id="Sex"
                  name="Sex"
                  value={formData.Sex}
                  onChange={handleInputChange}
                  className={`bg-slate-700 text-white px-4 py-2 rounded-lg border ${errors.Sex ? 'border-red-500 input-error' : 'border-slate-600 focus:border-FFD875 focus:outline-none focus:ring-1 focus:ring-FFD875'
                    } w-full`}
                >
                  <option value="Male">Nam</option>
                  <option value="Female">Nữ</option>
                  <option value="Other">Khác</option>
                </select>
                {errors.Sex && <p className="error-message">{errors.Sex}</p>}
              </div>

              {/* Địa chỉ */}
              <div>
                <label htmlFor="Address" className="block text-sm font-medium text-gray-300 mb-1 required-field">
                  Địa chỉ
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPinIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    id="Address"
                    name="Address"
                    value={formData.Address}
                    onChange={handleInputChange}
                    rows={3}
                    className={`bg-slate-700 text-white pl-10 pr-4 py-2 rounded-lg border ${errors.Address ? 'border-red-500 input-error' : 'border-slate-600 focus:border-FFD875 focus:outline-none focus:ring-1 focus:ring-FFD875'
                      } w-full`}
                    placeholder="Nhập địa chỉ khách hàng"
                  ></textarea>
                </div>
                {errors.Address && <p className="error-message">{errors.Address}</p>}
              </div>

              {/* Vai trò */}
              <div>
                <label htmlFor="Role" className="block text-sm font-medium text-gray-300 mb-1 required-field">
                  Vai trò
                </label>
                <select
                  id="Role"
                  name="Role"
                  value={formData.Role}
                  onChange={handleInputChange}
                  className={`bg-slate-700 text-white px-4 py-2 rounded-lg border ${errors.Role ? 'border-red-500 input-error' : 'border-slate-600 focus:border-FFD875 focus:outline-none focus:ring-1 focus:ring-FFD875'
                    } w-full`}
                >
                  <option value="Customer">Khách hàng</option>
                  <option value="Staff">Nhân viên</option>
                  <option value="Manager">Quản lý</option>
                </select>
                {errors.Role && <p className="error-message">{errors.Role}</p>}
              </div>

              <div className="bg-slate-700 p-4 rounded-lg mt-6">
                <h3 className="text-sm font-medium text-gray-300 mb-3">Lưu ý</h3>
                <p className="text-sm text-gray-400">
                  Mật khẩu mặc định sẽ được tạo tự động và gửi đến email của người dùng.
                  Tài khoản sẽ được tạo với trạng thái "Hoạt động" mặc định.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Submit buttons */}
        <div className="flex justify-end space-x-4 mt-6">
          <Link
            to="/admin/customers"
            className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
          >
            Hủy
          </Link>
          <button
            type="submit"
            className="px-6 py-2 bg-FFD875 text-black rounded-lg hover:bg-opacity-90 transition-colors btn-glow"
            style={{ backgroundColor: '#FFD875' }}
            disabled={submitting}
          >
            {submitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang lưu...
              </span>
            ) : 'Thêm khách hàng'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCustomer; 
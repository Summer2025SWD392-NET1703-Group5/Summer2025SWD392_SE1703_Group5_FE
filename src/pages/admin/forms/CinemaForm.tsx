// src/components/admin/forms/CinemaForm.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  BuildingOfficeIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
  UserIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface CinemaFormData {
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive' | 'maintenance';
  openingHours: string;
  closingHours: string;
  manager: string;
  facilities: string[];
  description: string;
  images: File[];
}

interface CinemaFormProps {
  mode: 'create' | 'edit';
}

const CinemaForm: React.FC<CinemaFormProps> = ({ mode }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<CinemaFormData>>({});
  const [newFacility, setNewFacility] = useState('');

  const [formData, setFormData] = useState<CinemaFormData>({
    name: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    status: 'active',
    openingHours: '08:00',
    closingHours: '23:00',
    manager: '',
    facilities: [],
    description: '',
    images: [],
  });

  const cities = [
    'Hà Nội', 'TP.HCM', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
    'An Giang', 'Bà Rịa - Vũng Tàu', 'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu',
    'Bắc Ninh', 'Bến Tre', 'Bình Định', 'Bình Dương', 'Bình Phước',
    'Bình Thuận', 'Cà Mau', 'Cao Bằng', 'Đắk Lắk', 'Đắk Nông',
  ];

  const commonFacilities = [
    'Parking', 'Food Court', 'VIP Lounge', 'IMAX', '4DX',
    'Premium Seats', 'Air Conditioning', 'WiFi', 'Elevator',
    'Wheelchair Access', 'Baby Care Room', 'ATM'
  ];

  useEffect(() => {
    if (mode === 'edit' && id) {
      fetchCinema(id);
    }
  }, [mode, id]);

  const fetchCinema = async (cinemaId: string) => {
    try {
      setLoading(true);
      // Mock data for edit mode
      const mockCinema = {
        name: 'CGV Vincom Center',
        address: '191 Bà Triệu, Hai Bà Trưng',
        city: 'Hà Nội',
        phone: '1900 6017',
        email: 'vincom@cgv.vn',
        status: 'active' as const,
        openingHours: '08:00',
        closingHours: '23:00',
        manager: 'Nguyễn Văn A',
        facilities: ['IMAX', '4DX', 'VIP', 'Parking'],
        description: 'Rạp chiếu phim hiện đại với công nghệ tiên tiến',
        images: [],
      };

      setFormData(mockCinema);
    } catch (error) {
      console.error('Error fetching cinema:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof CinemaFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files],
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const addFacility = () => {
    if (newFacility.trim() && !formData.facilities.includes(newFacility.trim())) {
      setFormData(prev => ({
        ...prev,
        facilities: [...prev.facilities, newFacility.trim()],
      }));
      setNewFacility('');
    }
  };

  const removeFacility = (facility: string) => {
    setFormData(prev => ({
      ...prev,
      facilities: prev.facilities.filter(f => f !== facility),
    }));
  };

  const addCommonFacility = (facility: string) => {
    if (!formData.facilities.includes(facility)) {
      setFormData(prev => ({
        ...prev,
        facilities: [...prev.facilities, facility],
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<CinemaFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tên rạp không được để trống';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Địa chỉ không được để trống';
    }

    if (!formData.city) {
      newErrors.city = 'Vui lòng chọn thành phố';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Số điện thoại không được để trống';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email không được để trống';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.manager.trim()) {
      newErrors.manager = 'Tên quản lý không được để trống';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Form data:', formData);
      navigate('/admin/cinemas');
    } catch (error) {
      console.error('Error saving cinema:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-slate-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-6">
          {mode === 'create' ? 'Thêm rạp chiếu phim mới' : 'Chỉnh sửa rạp chiếu phim'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cinema Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Tên rạp *
              </label>
              <div className="relative">
                <BuildingOfficeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2 bg-slate-700 text-white rounded-lg border ${errors.name ? 'border-red-500' : 'border-slate-600'
                    } focus:border-yellow-500 focus:outline-none`}
                  placeholder="Nhập tên rạp"
                />
              </div>
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>

            {/* City */}
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-300 mb-2">
                Thành phố *
              </label>
              <select
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 bg-slate-700 text-white rounded-lg border ${errors.city ? 'border-red-500' : 'border-slate-600'
                  } focus:border-yellow-500 focus:outline-none`}
              >
                <option value="">Chọn thành phố</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              {errors.city && <p className="mt-1 text-sm text-red-500">{errors.city}</p>}
            </div>
          </div>

          {/* Address */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-300 mb-2">
              Địa chỉ *
            </label>
            <div className="relative">
              <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-4 py-2 bg-slate-700 text-white rounded-lg border ${errors.address ? 'border-red-500' : 'border-slate-600'
                  } focus:border-yellow-500 focus:outline-none`}
                placeholder="Nhập địa chỉ chi tiết"
              />
            </div>
            {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address}</p>}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                Số điện thoại *
              </label>
              <div className="relative">
                <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2 bg-slate-700 text-white rounded-lg border ${errors.phone ? 'border-red-500' : 'border-slate-600'
                    } focus:border-yellow-500 focus:outline-none`}
                  placeholder="Nhập số điện thoại"
                />
              </div>
              {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email *
              </label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2 bg-slate-700 text-white rounded-lg border ${errors.email ? 'border-red-500' : 'border-slate-600'
                    } focus:border-yellow-500 focus:outline-none`}
                  placeholder="Nhập email"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Opening Hours */}
            <div>
              <label htmlFor="openingHours" className="block text-sm font-medium text-gray-300 mb-2">
                Giờ mở cửa *
              </label>
              <div className="relative">
                <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="time"
                  id="openingHours"
                  name="openingHours"
                  value={formData.openingHours}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-yellow-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Closing Hours */}
            <div>
              <label htmlFor="closingHours" className="block text-sm font-medium text-gray-300 mb-2">
                Giờ đóng cửa *
              </label>
              <div className="relative">
                <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="time"
                  id="closingHours"
                  name="closingHours"
                  value={formData.closingHours}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-yellow-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-2">
                Trạng thái *
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-yellow-500 focus:outline-none"
              >
                <option value="active">Hoạt động</option>
                <option value="inactive">Ngừng hoạt động</option>
                <option value="maintenance">Bảo trì</option>
              </select>
            </div>
          </div>

          {/* Manager */}
          <div>
            <label htmlFor="manager" className="block text-sm font-medium text-gray-300 mb-2">
              Quản lý rạp *
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                id="manager"
                name="manager"
                value={formData.manager}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-4 py-2 bg-slate-700 text-white rounded-lg border ${errors.manager ? 'border-red-500' : 'border-slate-600'
                  } focus:border-yellow-500 focus:outline-none`}
                placeholder="Nhập tên quản lý"
              />
            </div>
            {errors.manager && <p className="mt-1 text-sm text-red-500">{errors.manager}</p>}
          </div>

          {/* Facilities */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tiện ích
            </label>

            {/* Common Facilities */}
            <div className="mb-4">
              <p className="text-sm text-gray-400 mb-2">Tiện ích phổ biến:</p>
              <div className="flex flex-wrap gap-2">
                {commonFacilities.map(facility => (
                  <button
                    key={facility}
                    type="button"
                    onClick={() => addCommonFacility(facility)}
                    disabled={formData.facilities.includes(facility)}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${formData.facilities.includes(facility)
                        ? 'bg-green-600 text-white cursor-not-allowed'
                        : 'bg-slate-600 text-gray-300 hover:bg-slate-500'
                      }`}
                  >
                    {facility}
                  </button>
                ))}
              </div>
            </div>

            {/* Add Custom Facility */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newFacility}
                onChange={(e) => setNewFacility(e.target.value)}
                placeholder="Thêm tiện ích khác..."
                className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-yellow-500 focus:outline-none"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFacility())}
              />
              <button
                type="button"
                onClick={addFacility}
                className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <PlusIcon className="w-4 h-4" />
                Thêm
              </button>
            </div>

            {/* Selected Facilities */}
            {formData.facilities.length > 0 && (
              <div>
                <p className="text-sm text-gray-400 mb-2">Tiện ích đã chọn:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.facilities.map(facility => (
                    <span
                      key={facility}
                      className="bg-yellow-500 text-black px-3 py-1 rounded-lg text-sm flex items-center gap-2"
                    >
                      {facility}
                      <button
                        type="button"
                        onClick={() => removeFacility(facility)}
                        className="hover:bg-yellow-600 rounded-full p-1"
                      >
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
              Mô tả
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-yellow-500 focus:outline-none"
              placeholder="Nhập mô tả về rạp chiếu phim..."
            />
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Hình ảnh rạp
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-yellow-500 file:text-black hover:file:bg-yellow-600"
            />

            {formData.images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 text-black font-medium py-2 px-4 rounded-lg transition-colors"
            >
              {loading ? 'Đang xử lý...' : mode === 'create' ? 'Tạo rạp' : 'Cập nhật'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/cinemas')}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CinemaForm;

// src/components/admin/forms/CinemaRoomForm.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  CubeIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  Cog6ToothIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface CinemaRoomFormData {
  name: string;
  cinemaId: string;
  type: 'standard' | 'vip' | 'imax' | '4dx' | 'premium';
  totalSeats: number;
  rows: number;
  seatsPerRow: number;
  status: 'active' | 'maintenance' | 'inactive';
  facilities: string[];
  screenSize: string;
  soundSystem: string;
  projectorType: string;
  basePrice: number;
  vipPrice: number;
  description: string;
}

interface Cinema {
  id: string;
  name: string;
}

interface CinemaRoomFormProps {
  mode: 'create' | 'edit';
}

const CinemaRoomForm: React.FC<CinemaRoomFormProps> = ({ mode }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<CinemaRoomFormData>>({});
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [newFacility, setNewFacility] = useState('');
  
  const [formData, setFormData] = useState<CinemaRoomFormData>({
    name: '',
    cinemaId: '',
    type: 'standard',
    totalSeats: 0,
    rows: 0,
    seatsPerRow: 0,
    status: 'active',
    facilities: [],
    screenSize: '',
    soundSystem: '',
    projectorType: '',
    basePrice: 100000,
    vipPrice: 150000,
    description: '',
  });

  const roomTypes = [
    { value: 'standard', label: 'Standard', description: 'Phòng chiếu tiêu chuẩn' },
    { value: 'vip', label: 'VIP', description: 'Phòng VIP với ghế cao cấp' },
    { value: 'imax', label: 'IMAX', description: 'Phòng IMAX với màn hình lớn' },
    { value: '4dx', label: '4DX', description: 'Phòng 4DX với hiệu ứng đặc biệt' },
    { value: 'premium', label: 'Premium', description: 'Phòng Premium với dịch vụ cao cấp' },
  ];

  const commonFacilities = [
    'Air Conditioning', 'Dolby Atmos', 'Reclining Seats', 'Cup Holders',
    'LED Lighting', 'Emergency Exit', 'Wheelchair Access', 'Sound Isolation',
    'Digital Projection', 'Premium Sound', 'VIP Service', 'Food Service'
  ];

  const soundSystems = [
    'Dolby Atmos 7.1', 'Dolby Digital 5.1', 'DTS-X', 'THX Certified',
    'Dolby Surround', '4DX Surround', 'IMAX Enhanced'
  ];

  const projectorTypes = [
    'Digital 4K', 'Digital 2K', 'IMAX Laser', '4DX Digital', 
    'Dolby Vision', 'HDR10', 'Premium Digital'
  ];

  useEffect(() => {
    fetchCinemas();
    if (mode === 'edit' && id) {
      fetchCinemaRoom(id);
    }
  }, [mode, id]);

  useEffect(() => {
    // Auto calculate total seats when rows or seatsPerRow changes
    if (formData.rows > 0 && formData.seatsPerRow > 0) {
      setFormData(prev => ({
        ...prev,
        totalSeats: prev.rows * prev.seatsPerRow,
      }));
    }
  }, [formData.rows, formData.seatsPerRow]);

  const fetchCinemas = async () => {
    try {
      const mockCinemas: Cinema[] = [
        { id: '1', name: 'CGV Vincom Center' },
        { id: '2', name: 'Lotte Cinema Landmark' },
        { id: '3', name: 'Galaxy Nguyễn Du' },
        { id: '4', name: 'BHD Star Bitexco' },
        { id: '5', name: 'CGV Aeon Mall' },
      ];
      setCinemas(mockCinemas);
    } catch (error) {
      console.error('Error fetching cinemas:', error);
    }
  };

  const fetchCinemaRoom = async (roomId: string) => {
    try {
      setLoading(true);
      // Mock data for edit mode
      const mockRoom = {
        name: 'Phòng 1 - IMAX',
        cinemaId: '1',
        type: 'imax' as const,
        totalSeats: 150,
        rows: 12,
        seatsPerRow: 15,
        status: 'active' as const,
        facilities: ['IMAX Screen', 'Dolby Atmos', 'Reclining Seats', 'Air Conditioning'],
        screenSize: '22m x 16m',
        soundSystem: 'Dolby Atmos 7.1',
        projectorType: 'IMAX Laser',
        basePrice: 150000,
        vipPrice: 200000,
        description: 'Phòng chiếu IMAX với công nghệ tiên tiến nhất',
      };
      
      setFormData(mockRoom);
    } catch (error) {
      console.error('Error fetching cinema room:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['totalSeats', 'rows', 'seatsPerRow', 'basePrice', 'vipPrice'].includes(name) 
        ? Number(value) 
        : value,
    }));
    
    if (errors[name as keyof CinemaRoomFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
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
    const newErrors: Partial<CinemaRoomFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tên phòng không được để trống';
    }

    if (!formData.cinemaId) {
      newErrors.cinemaId = 'Vui lòng chọn rạp chiếu';
    }

    if (formData.rows <= 0) {
      newErrors.rows = 'Số hàng ghế phải lớn hơn 0';
    }

    if (formData.seatsPerRow <= 0) {
      newErrors.seatsPerRow = 'Số ghế mỗi hàng phải lớn hơn 0';
    }

    if (!formData.screenSize.trim()) {
      newErrors.screenSize = 'Kích thước màn hình không được để trống';
    }

    if (!formData.soundSystem) {
      newErrors.soundSystem = 'Vui lòng chọn hệ thống âm thanh';
    }

    if (!formData.projectorType) {
      newErrors.projectorType = 'Vui lòng chọn loại máy chiếu';
    }

    if (formData.basePrice <= 0) {
      newErrors.basePrice = 'Giá vé cơ bản phải lớn hơn 0';
    }

    if (formData.vipPrice <= 0) {
      newErrors.vipPrice = 'Giá vé VIP phải lớn hơn 0';
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
      navigate('/admin/cinema-rooms');
    } catch (error) {
      console.error('Error saving cinema room:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedRoomType = roomTypes.find(type => type.value === formData.type);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-slate-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-6">
          {mode === 'create' ? 'Thêm phòng chiếu mới' : 'Chỉnh sửa phòng chiếu'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Room Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Tên phòng chiếu *
              </label>
              <div className="relative">
                <CubeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2 bg-slate-700 text-white rounded-lg border ${
                    errors.name ? 'border-red-500' : 'border-slate-600'
                  } focus:border-yellow-500 focus:outline-none`}
                  placeholder="Nhập tên phòng chiếu"
                />
              </div>
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>

            {/* Cinema */}
            <div>
              <label htmlFor="cinemaId" className="block text-sm font-medium text-gray-300 mb-2">
                Rạp chiếu *
              </label>
              <select
                id="cinemaId"
                name="cinemaId"
                value={formData.cinemaId}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 bg-slate-700 text-white rounded-lg border ${
                  errors.cinemaId ? 'border-red-500' : 'border-slate-600'
                } focus:border-yellow-500 focus:outline-none`}
              >
                <option value="">Chọn rạp chiếu</option>
                {cinemas.map(cinema => (
                  <option key={cinema.id} value={cinema.id}>
                    {cinema.name}
                  </option>
                ))}
              </select>
              {errors.cinemaId && <p className="mt-1 text-sm text-red-500">{errors.cinemaId}</p>}
            </div>
          </div>

          {/* Room Type */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-300 mb-2">
              Loại phòng chiếu *
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-yellow-500 focus:outline-none"
            >
              {roomTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label} - {type.description}
                </option>
              ))}
            </select>
            {selectedRoomType && (
              <p className="mt-1 text-sm text-gray-400">{selectedRoomType.description}</p>
            )}
          </div>

          {/* Seating Configuration */}
          <div className="bg-slate-700 rounded-lg p-4">
            <h3 className="text-white font-medium mb-4">Cấu hình ghế ngồi</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="rows" className="block text-sm font-medium text-gray-300 mb-2">
                  Số hàng ghế *
                </label>
                <input
                  type="number"
                  id="rows"
                  name="rows"
                  value={formData.rows}
                  onChange={handleInputChange}
                  min="1"
                  className={`w-full px-4 py-2 bg-slate-600 text-white rounded-lg border ${
                    errors.rows ? 'border-red-500' : 'border-slate-500'
                  } focus:border-yellow-500 focus:outline-none`}
                  placeholder="Số hàng"
                />
                {errors.rows && <p className="mt-1 text-sm text-red-500">{errors.rows}</p>}
              </div>

              <div>
                <label htmlFor="seatsPerRow" className="block text-sm font-medium text-gray-300 mb-2">
                  Ghế mỗi hàng *
                </label>
                <input
                  type="number"
                  id="seatsPerRow"
                  name="seatsPerRow"
                  value={formData.seatsPerRow}
                  onChange={handleInputChange}
                  min="1"
                  className={`w-full px-4 py-2 bg-slate-600 text-white rounded-lg border ${
                    errors.seatsPerRow ? 'border-red-500' : 'border-slate-500'
                  } focus:border-yellow-500 focus:outline-none`}
                  placeholder="Ghế/hàng"
                />
                {errors.seatsPerRow && <p className="mt-1 text-sm text-red-500">{errors.seatsPerRow}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tổng số ghế
                </label>
                <div className="w-full px-4 py-2 bg-slate-600 text-yellow-400 rounded-lg border border-slate-500 font-medium">
                  {formData.totalSeats} ghế
                </div>
              </div>
            </div>
          </div>

          {/* Technical Specifications */}
          <div className="bg-slate-700 rounded-lg p-4">
            <h3 className="text-white font-medium mb-4">Thông số kỹ thuật</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="screenSize" className="block text-sm font-medium text-gray-300 mb-2">
                  Kích thước màn hình *
                </label>
                <input
                  type="text"
                  id="screenSize"
                  name="screenSize"
                  value={formData.screenSize}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 bg-slate-600 text-white rounded-lg border ${
                    errors.screenSize ? 'border-red-500' : 'border-slate-500'
                  } focus:border-yellow-500 focus:outline-none`}
                  placeholder="VD: 15m x 8m"
                />
                {errors.screenSize && <p className="mt-1 text-sm text-red-500">{errors.screenSize}</p>}
              </div>

              <div>
                <label htmlFor="soundSystem" className="block text-sm font-medium text-gray-300 mb-2">
                  Hệ thống âm thanh *
                </label>
                <select
                  id="soundSystem"
                  name="soundSystem"
                  value={formData.soundSystem}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 bg-slate-600 text-white rounded-lg border ${
                    errors.soundSystem ? 'border-red-500' : 'border-slate-500'
                  } focus:border-yellow-500 focus:outline-none`}
                >
                  <option value="">Chọn hệ thống âm thanh</option>
                  {soundSystems.map(system => (
                    <option key={system} value={system}>
                      {system}
                    </option>
                  ))}
                </select>
                {errors.soundSystem && <p className="mt-1 text-sm text-red-500">{errors.soundSystem}</p>}
              </div>

              <div>
                <label htmlFor="projectorType" className="block text-sm font-medium text-gray-300 mb-2">
                  Loại máy chiếu *
                </label>
                <select
                  id="projectorType"
                  name="projectorType"
                  value={formData.projectorType}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 bg-slate-600 text-white rounded-lg border ${
                    errors.projectorType ? 'border-red-500' : 'border-slate-500'
                  } focus:border-yellow-500 focus:outline-none`}
                >
                  <option value="">Chọn loại máy chiếu</option>
                  {projectorTypes.map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {errors.projectorType && <p className="mt-1 text-sm text-red-500">{errors.projectorType}</p>}
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="basePrice" className="block text-sm font-medium text-gray-300 mb-2">
                Giá vé cơ bản (VNĐ) *
              </label>
              <div className="relative">
                <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
                  id="basePrice"
                  name="basePrice"
                  value={formData.basePrice}
                  onChange={handleInputChange}
                  min="0"
                  step="1000"
                  className={`w-full pl-10 pr-4 py-2 bg-slate-700 text-white rounded-lg border ${
                    errors.basePrice ? 'border-red-500' : 'border-slate-600'
                  } focus:border-yellow-500 focus:outline-none`}
                  placeholder="Nhập giá vé cơ bản"
                />
              </div>
              {errors.basePrice && <p className="mt-1 text-sm text-red-500">{errors.basePrice}</p>}
            </div>

            <div>
              <label htmlFor="vipPrice" className="block text-sm font-medium text-gray-300 mb-2">
                Giá vé VIP (VNĐ) *
              </label>
              <div className="relative">
                <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
                  id="vipPrice"
                  name="vipPrice"
                  value={formData.vipPrice}
                  onChange={handleInputChange}
                  min="0"
                  step="1000"
                  className={`w-full pl-10 pr-4 py-2 bg-slate-700 text-white rounded-lg border ${
                    errors.vipPrice ? 'border-red-500' : 'border-slate-600'
                  } focus:border-yellow-500 focus:outline-none`}
                  placeholder="Nhập giá vé VIP"
                />
              </div>
              {errors.vipPrice && <p className="mt-1 text-sm text-red-500">{errors.vipPrice}</p>}
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
              <option value="maintenance">Bảo trì</option>
              <option value="inactive">Ngừng hoạt động</option>
            </select>
          </div>

          {/* Facilities */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tiện ích phòng chiếu
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
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                      formData.facilities.includes(facility)
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
              placeholder="Nhập mô tả về phòng chiếu..."
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 text-black font-medium py-2 px-4 rounded-lg transition-colors"
            >
              {loading ? 'Đang xử lý...' : mode === 'create' ? 'Tạo phòng chiếu' : 'Cập nhật'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/cinema-rooms')}
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

export default CinemaRoomForm;


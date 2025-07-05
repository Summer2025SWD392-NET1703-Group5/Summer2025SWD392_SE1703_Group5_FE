import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeftIcon, 
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarDaysIcon,
  IdentificationIcon,
  MapPinIcon,
  StarIcon
} from '@heroicons/react/24/outline';

interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  birthday: string;
  gender: 'male' | 'female' | 'other';
  idNumber: string;
  address: string;
  membershipLevel: 'bronze' | 'silver' | 'gold' | 'platinum';
  points: number;
  rating: number;
  totalSpent: number;
  lastVisit: Date;
  bookingsCount: number;
}

// Mock customer data
const MOCK_CUSTOMER = {
  id: '5',
  name: 'Hoàng Văn E',
  email: 'hoangvane@example.com',
  phone: '0945678901',
  birthday: '1990-08-15',
  gender: 'male' as const,
  idNumber: '123456789012',
  address: '123 Đường Lê Lợi, Quận 1, TP.HCM',
  membershipLevel: 'gold' as const,
  points: 1500,
  rating: 4,
  totalSpent: 2800000,
  lastVisit: new Date('2023-07-08'),
  bookingsCount: 15
};

const EditCustomer: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    email: '',
    phone: '',
    birthday: '',
    gender: 'male',
    idNumber: '',
    address: '',
    membershipLevel: 'bronze',
    points: 0,
    rating: 0,
    totalSpent: 0,
    lastVisit: new Date(),
    bookingsCount: 0
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  
  // Fetch customer data
  useEffect(() => {
    // In a real app, you would fetch customer data from an API
    // For now, we'll use mock data
    setFormData(MOCK_CUSTOMER);
    setRating(MOCK_CUSTOMER.rating);
  }, [id]);
  
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
    
    if (!formData.name.trim()) {
      newErrors.name = 'Vui lòng nhập tên khách hàng';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10,11}$/.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }
    
    if (formData.idNumber && !/^[0-9]{9,12}$/.test(formData.idNumber)) {
      newErrors.idNumber = 'CMND/CCCD không hợp lệ';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
    setFormData(prev => ({
      ...prev,
      rating: newRating
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Vui lòng kiểm tra lại thông tin');
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Cập nhật khách hàng thành công');
      navigate('/admin/customers');
    } catch (error) {
      console.error('Error updating customer:', error);
      toast.error('Không thể cập nhật khách hàng');
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
        <h1 className="text-2xl font-bold text-white">Chỉnh sửa khách hàng</h1>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Thông tin cá nhân */}
          <div className="lg:col-span-2 bg-slate-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-white border-b border-slate-700 pb-2 mb-6">
              Thông tin khách hàng
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Họ tên */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1 required-field">
                  Họ và tên
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`bg-slate-700 text-white pl-10 pr-4 py-2 rounded-lg border ${
                      errors.name ? 'border-red-500 input-error' : 'border-slate-600 focus:border-FFD875 focus:outline-none focus:ring-1 focus:ring-FFD875'
                    } w-full`}
                    placeholder="Nhập họ tên khách hàng"
                  />
                </div>
                {errors.name && <p className="error-message">{errors.name}</p>}
              </div>
              
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1 required-field">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`bg-slate-700 text-white pl-10 pr-4 py-2 rounded-lg border ${
                      errors.email ? 'border-red-500 input-error' : 'border-slate-600 focus:border-FFD875 focus:outline-none focus:ring-1 focus:ring-FFD875'
                    } w-full`}
                    placeholder="Nhập email"
                  />
                </div>
                {errors.email && <p className="error-message">{errors.email}</p>}
              </div>
              
              {/* Số điện thoại */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1 required-field">
                  Số điện thoại
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <PhoneIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`bg-slate-700 text-white pl-10 pr-4 py-2 rounded-lg border ${
                      errors.phone ? 'border-red-500 input-error' : 'border-slate-600 focus:border-FFD875 focus:outline-none focus:ring-1 focus:ring-FFD875'
                    } w-full`}
                    placeholder="Nhập số điện thoại"
                  />
                </div>
                {errors.phone && <p className="error-message">{errors.phone}</p>}
              </div>
              
              {/* Ngày sinh */}
              <div>
                <label htmlFor="birthday" className="block text-sm font-medium text-gray-300 mb-1">
                  Ngày sinh
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CalendarDaysIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    id="birthday"
                    name="birthday"
                    value={formData.birthday}
                    onChange={handleInputChange}
                    className="bg-slate-700 text-white pl-10 pr-4 py-2 rounded-lg border border-slate-600 focus:border-FFD875 focus:outline-none focus:ring-1 focus:ring-FFD875 w-full"
                  />
                </div>
              </div>
              
              {/* Giới tính */}
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-300 mb-1">
                  Giới tính
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-FFD875 focus:outline-none focus:ring-1 focus:ring-FFD875 w-full"
                >
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </div>
              
              {/* CMND/CCCD */}
              <div>
                <label htmlFor="idNumber" className="block text-sm font-medium text-gray-300 mb-1">
                  CMND/CCCD
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IdentificationIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="idNumber"
                    name="idNumber"
                    value={formData.idNumber}
                    onChange={handleInputChange}
                    className={`bg-slate-700 text-white pl-10 pr-4 py-2 rounded-lg border ${
                      errors.idNumber ? 'border-red-500 input-error' : 'border-slate-600 focus:border-FFD875 focus:outline-none focus:ring-1 focus:ring-FFD875'
                    } w-full`}
                    placeholder="Nhập số CMND/CCCD"
                  />
                </div>
                {errors.idNumber && <p className="error-message">{errors.idNumber}</p>}
              </div>
            </div>
            
            {/* Địa chỉ */}
            <div className="mt-6">
              <label htmlFor="address" className="block text-sm font-medium text-gray-300 mb-1">
                Địa chỉ
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPinIcon className="h-5 w-5 text-gray-400" />
                </div>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  className="bg-slate-700 text-white pl-10 pr-4 py-2 rounded-lg border border-slate-600 focus:border-FFD875 focus:outline-none focus:ring-1 focus:ring-FFD875 w-full"
                  placeholder="Nhập địa chỉ khách hàng"
                ></textarea>
              </div>
            </div>
          </div>
          
          {/* Thông tin thành viên */}
          <div className="lg:col-span-1 bg-slate-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-white border-b border-slate-700 pb-2 mb-6">
              Thông tin thành viên
            </h2>
            
            <div className="space-y-6">
              {/* Hạng thành viên */}
              <div>
                <label htmlFor="membershipLevel" className="block text-sm font-medium text-gray-300 mb-1">
                  Hạng thành viên
                </label>
                <select
                  id="membershipLevel"
                  name="membershipLevel"
                  value={formData.membershipLevel}
                  onChange={handleInputChange}
                  className="bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-FFD875 focus:outline-none focus:ring-1 focus:ring-FFD875 w-full"
                >
                  <option value="bronze">Đồng</option>
                  <option value="silver">Bạc</option>
                  <option value="gold">Vàng</option>
                  <option value="platinum">Bạch kim</option>
                </select>
              </div>
              
              {/* Điểm tích lũy */}
              <div>
                <label htmlFor="points" className="block text-sm font-medium text-gray-300 mb-1">
                  Điểm tích lũy
                </label>
                <input
                  type="number"
                  id="points"
                  name="points"
                  min="0"
                  value={formData.points}
                  onChange={handleInputChange}
                  className="bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-FFD875 focus:outline-none focus:ring-1 focus:ring-FFD875 w-full"
                />
              </div>
              
              {/* Tổng chi tiêu */}
              <div>
                <label htmlFor="totalSpent" className="block text-sm font-medium text-gray-300 mb-1">
                  Tổng chi tiêu
                </label>
                <input
                  type="number"
                  id="totalSpent"
                  name="totalSpent"
                  min="0"
                  value={formData.totalSpent}
                  onChange={handleInputChange}
                  className="bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-FFD875 focus:outline-none focus:ring-1 focus:ring-FFD875 w-full"
                />
              </div>
              
              {/* Đánh giá khách hàng */}
              <div className="border-t border-slate-700 pt-4 mt-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Đánh giá khách hàng
                </label>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`${
                        (hoverRating || rating) >= star
                          ? 'text-FFD875'
                          : 'text-gray-400'
                      } h-8 w-8 focus:outline-none transition-colors`}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => handleRatingChange(star)}
                    >
                      <StarIcon
                        className={`h-6 w-6 ${
                          (hoverRating || rating) >= star
                            ? 'fill-current'
                            : 'stroke-current'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-white">
                    {rating > 0 ? rating.toFixed(1) : 'Chưa đánh giá'}
                  </span>
                </div>
              </div>
              
              {/* Thông tin khác */}
              <div className="bg-slate-700 p-4 rounded-lg mt-4">
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-400">Số lần đặt vé:</span>
                    <span className="text-white ml-2">{formData.bookingsCount}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-400">Lần cuối đến rạp:</span>
                    <span className="text-white ml-2">
                      {formData.lastVisit.toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <Link
                  to={`/admin/customers/${id}/bookings`}
                  className="block w-full px-4 py-2 bg-slate-700 text-white text-center rounded-lg hover:bg-slate-600 transition-colors"
                >
                  Xem lịch sử đặt vé
                </Link>
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
            ) : 'Lưu thay đổi'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditCustomer; 
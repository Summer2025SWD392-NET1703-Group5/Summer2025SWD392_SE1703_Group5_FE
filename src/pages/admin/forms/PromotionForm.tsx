// src/components/admin/forms/PromotionForm.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  TagIcon,
  PercentBadgeIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  PhotoIcon,
  XMarkIcon,
  PlusIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { getPromotionById, updatePromotion, createPromotion } from '../../../services/admin/promotionManagementServices';
import toast from 'react-hot-toast';

interface PromotionFormData {
  title: string;
  description: string;
  code: string;
  type: 'percentage' | 'fixed' | 'combo';
  value: number | '';
  minOrderValue: number | '';
  maxDiscount: number | '';
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive' | 'scheduled';
  usageLimit: number | '';
  currentUsage: number;
  applicableMovies: string[];
  applicableCinemas: string[];
  banner: File | null;
  terms: string[];
}

interface Movie {
  id: string;
  title: string;
}

interface Cinema {
  id: string;
  name: string;
}

interface PromotionFormProps {
  mode: 'create' | 'edit';
}

const PromotionForm: React.FC<PromotionFormProps> = ({ mode }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<PromotionFormData>>({});
  const [movies, setMovies] = useState<Movie[]>([]);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [newTerm, setNewTerm] = useState('');
  const [isLimitedUpdate, setIsLimitedUpdate] = useState(false);

  const [formData, setFormData] = useState<PromotionFormData>({
    title: '',
    description: '',
    code: '',
    type: 'percentage',
    value: '',
    minOrderValue: '',
    maxDiscount: '',
    startDate: '',
    endDate: '',
    status: 'active',
    usageLimit: 100,
    currentUsage: 0,
    applicableMovies: [],
    applicableCinemas: [],
    banner: null,
    terms: [],
  });

  useEffect(() => {
    fetchMovies();
    fetchCinemas();
    if (mode === 'edit' && id) {
      fetchPromotion(id);
    }
  }, [mode, id]);

  const fetchMovies = async () => {
    try {
      const mockMovies: Movie[] = [
        { id: '1', title: 'Avatar: The Way of Water' },
        { id: '2', title: 'Top Gun: Maverick' },
        { id: '3', title: 'Black Panther: Wakanda Forever' },
        { id: '4', title: 'Spider-Man: No Way Home' },
      ];
      setMovies(mockMovies);
    } catch (error) {
      console.error('Error fetching movies:', error);
    }
  };

  const fetchCinemas = async () => {
    try {
      const mockCinemas: Cinema[] = [
        { id: '1', name: 'CGV Vincom Center' },
        { id: '2', name: 'Lotte Cinema Landmark' },
        { id: '3', name: 'Galaxy Nguyễn Du' },
        { id: '4', name: 'BHD Star Bitexco' },
      ];
      setCinemas(mockCinemas);
    } catch (error) {
      console.error('Error fetching cinemas:', error);
    }
  };

  const fetchPromotion = async (promotionId: string) => {
    try {
      setLoading(true);
      const promo = await getPromotionById(promotionId);

      setFormData({
        title: promo.Title,
        description: promo.Promotion_Detail || '',
        code: promo.Promotion_Code,
        type: promo.Discount_Type.toLowerCase() as 'percentage' | 'fixed' | 'combo',
        value: promo.Discount_Value,
        minOrderValue: promo.Minimum_Purchase || '',
        maxDiscount: promo.Maximum_Discount || '',
        startDate: new Date(promo.Start_Date).toISOString().split('T')[0],
        endDate: new Date(promo.End_Date).toISOString().split('T')[0],
        status: promo.Status.toLowerCase() as 'active' | 'inactive' | 'scheduled',
        usageLimit: promo.Usage_Limit,
        currentUsage: promo.Current_Usage,
        applicableMovies: [], // Assuming you have logic for this
        applicableCinemas: [], // Assuming you have logic for this
        banner: null, // Assuming you handle banner logic
        terms: [], // Assuming you handle terms logic
      });

      if (promo.Current_Usage > 0) {
        setIsLimitedUpdate(true);
        toast.custom((t) => (
          <div
            className={`${t.visible ? 'animate-enter' : 'animate-leave'
              } max-w-md w-full bg-slate-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
          >
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <InformationCircleIcon className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-white">
                    Chế độ cập nhật giới hạn
                  </p>
                  <p className="mt-1 text-sm text-gray-400">
                    Khuyến mãi này đã được sử dụng. Một số trường thông tin sẽ bị khóa.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ));
      }

    } catch (error) {
      console.error('Error fetching promotion:', error);
      toast.error('Không thể tải thông tin khuyến mãi.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Xử lý đặc biệt cho các trường số
    if (['value', 'minOrderValue', 'maxDiscount', 'usageLimit'].includes(name)) {
      // Chỉ lấy các ký tự số, loại bỏ mọi ký tự khác (dấu chấm, phẩy, v.v.)
      const numericValue = value.replace(/[^0-9]/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: numericValue === '' ? '' : parseInt(numericValue, 10),
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }

    if (errors[name as keyof PromotionFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  // Format number for display with thousand separators
  const formatDisplayNumber = (value: number | string): string => {
    if (value === '' || value === undefined || value === null) return '';
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' đ';
  };

  // Hàm xử lý khi thay đổi loại khuyến mãi
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    
    // Khi chuyển từ percentage sang fixed, giữ nguyên giá trị
    // Khi chuyển từ fixed sang percentage, giới hạn giá trị tối đa là 100
    if (value === 'percentage' && formData.value > 100) {
      setFormData(prev => ({
        ...prev,
        type: value as 'percentage' | 'fixed' | 'combo',
        value: 100
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        type: value as 'percentage' | 'fixed' | 'combo'
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      banner: file,
    }));
  };

  const handleMovieSelection = (movieId: string) => {
    setFormData(prev => ({
      ...prev,
      applicableMovies: prev.applicableMovies.includes(movieId)
        ? prev.applicableMovies.filter(id => id !== movieId)
        : [...prev.applicableMovies, movieId],
    }));
  };

  const handleCinemaSelection = (cinemaId: string) => {
    setFormData(prev => ({
      ...prev,
      applicableCinemas: prev.applicableCinemas.includes(cinemaId)
        ? prev.applicableCinemas.filter(id => id !== cinemaId)
        : [...prev.applicableCinemas, cinemaId],
    }));
  };

  const addTerm = () => {
    if (newTerm.trim() && !formData.terms.includes(newTerm.trim())) {
      setFormData(prev => ({
        ...prev,
        terms: [...prev.terms, newTerm.trim()],
      }));
      setNewTerm('');
    }
  };

  const removeTerm = (term: string) => {
    setFormData(prev => ({
      ...prev,
      terms: prev.terms.filter(t => t !== term),
    }));
  };

  const generateCode = () => {
    const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    setFormData(prev => ({
      ...prev,
      code: `PROMO${randomCode}`,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<PromotionFormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Tiêu đề không được để trống';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Mô tả không được để trống';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Mã khuyến mãi không được để trống';
    }

    if (formData.value === '' || formData.value <= 0) {
      newErrors.value = 'Giá trị khuyến mãi phải lớn hơn 0';
    }

    if (formData.type === 'percentage' && formData.value !== '' && Number(formData.value) > 100) {
      newErrors.value = 'Phần trăm giảm giá không được vượt quá 100%';
    }

    if (formData.minOrderValue !== '' && Number(formData.minOrderValue) < 0) {
      newErrors.minOrderValue = 'Giá trị đơn hàng tối thiểu không được âm';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Ngày bắt đầu không được để trống';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'Ngày kết thúc không được để trống';
    }

    if (formData.startDate && formData.endDate && formData.startDate >= formData.endDate) {
      newErrors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
    }

    // Usage limit can be empty or 0 (unlimited) or a positive number
    if (formData.usageLimit !== '' && formData.usageLimit < 0) {
      newErrors.usageLimit = 'Giới hạn sử dụng không được âm';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getInputClass = (error?: string) => {
    return `w-full rounded-lg bg-slate-700 border ${
      error ? 'border-red-400 focus:border-red-500' : 'border-slate-600 focus:border-yellow-500'
    } text-white py-2.5 px-3 focus:outline-none`;
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
      navigate('/admin/promotions');
    } catch (error) {
      console.error('Error saving promotion:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-slate-800 rounded-2xl shadow-2xl border border-slate-700">
      <h2 className="text-3xl font-bold text-white mb-2">
        {mode === 'create' ? 'Tạo Khuyến Mãi Mới' : 'Chỉnh Sửa Khuyến Mãi'}
      </h2>
      <p className="text-gray-400 mb-8">
        {mode === 'create' ? 'Điền thông tin chi tiết để tạo một chương trình khuyến mãi.' : 'Cập nhật thông tin chi tiết cho chương trình khuyến mãi.'}
      </p>

      {isLimitedUpdate && (
        <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-center">
          <InformationCircleIcon className="w-5 h-5 text-yellow-400 mr-3" />
          <p className="text-sm text-yellow-300">
            <strong>Lưu ý:</strong> Khuyến mãi này đã được sử dụng. Một số trường thông tin sẽ bị khóa.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">Tiêu đề</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={getInputClass(errors.title)}
              placeholder="Vd: Giảm giá 50k"
              disabled={isLimitedUpdate}
            />
            {errors.title && <p className="mt-2 text-sm text-red-400">{errors.title}</p>}
          </div>

          {/* Promotion Code */}
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-300 mb-2">Mã khuyến mãi</label>
            <div className="relative">
              <input
                type="text"
                id="code"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                className={`${getInputClass(errors.code)} pr-28`}
                placeholder="Vd: PROMO50K"
                disabled={isLimitedUpdate}
              />
              <button
                type="button"
                onClick={generateCode}
                className="absolute inset-y-0 right-0 flex items-center px-3 bg-slate-600 hover:bg-slate-500 text-gray-300 text-xs font-semibold rounded-r-lg transition"
                disabled={isLimitedUpdate}
              >
                Tạo mã
              </button>
            </div>
            {errors.code && <p className="mt-2 text-sm text-red-400">{errors.code}</p>}
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">Mô tả chi tiết</label>
          <textarea
            id="description"
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleInputChange}
            className={getInputClass(errors.description)}
            placeholder="Mô tả các điều khoản, điều kiện của khuyến mãi"
            disabled={isLimitedUpdate}
          ></textarea>
          {errors.description && <p className="mt-2 text-sm text-red-400">{errors.description}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Discount Type */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-300 mb-2">Loại giảm giá</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleTypeChange}
              className={getInputClass(errors.type)}
              disabled={isLimitedUpdate}
            >
              <option value="percentage">Phần trăm (%)</option>
              <option value="fixed">Số tiền cố định (VND)</option>
              <option value="combo">Combo/Vật phẩm</option>
            </select>
          </div>

          {/* Discount Value */}
          <div>
            <label htmlFor="value" className="block text-sm font-medium text-gray-300 mb-2">Phần trăm giảm giá (%)</label>
            <div className="relative">
              <input
                type="text"
                id="value"
                name="value"
                value={formData.value}
                onChange={handleInputChange}
                className={`${getInputClass(errors.value)} pr-12`}
                placeholder={formData.type === 'percentage' ? 'Vd: 10' : 'Vd: 50000'}
                disabled={isLimitedUpdate}
              />
              <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                {formData.type === 'percentage' ? '%' : 'VND'}
              </span>
            </div>
            {formData.value !== '' && <p className="mt-1 text-sm text-gray-400">Giá trị: {formData.type === 'percentage' ? formData.value + '%' : formatDisplayNumber(formData.value)}</p>}
            {errors.value && <p className="mt-2 text-sm text-red-400">{errors.value}</p>}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Minimum Order Value */}
          <div>
            <label htmlFor="minOrderValue" className="block text-sm font-medium text-gray-300 mb-2">Giá trị đơn hàng tối thiểu (VND)</label>
            <input
              type="text"
              id="minOrderValue"
              name="minOrderValue"
              value={formData.minOrderValue}
              onChange={handleInputChange}
              className={getInputClass(errors.minOrderValue)}
              placeholder="Vd: 200000"
              disabled={isLimitedUpdate}
            />
            {formData.minOrderValue !== '' && <p className="mt-1 text-sm text-gray-400">Giá trị: {formatDisplayNumber(formData.minOrderValue)}</p>}
            {errors.minOrderValue && <p className="mt-2 text-sm text-red-400">{errors.minOrderValue}</p>}
          </div>

          {/* Maximum Discount */}
          {formData.type === 'percentage' && (
            <div>
              <label htmlFor="maxDiscount" className="block text-sm font-medium text-gray-300 mb-2">Giảm giá tối đa (VND)</label>
              <input
                type="text"
                id="maxDiscount"
                name="maxDiscount"
                value={formData.maxDiscount}
                onChange={handleInputChange}
                className={getInputClass(errors.maxDiscount)}
                placeholder="Vd: 100000"
                disabled={isLimitedUpdate}
              />
              {formData.maxDiscount !== '' && <p className="mt-1 text-sm text-gray-400">Giá trị: {formatDisplayNumber(formData.maxDiscount)}</p>}
              {errors.maxDiscount && <p className="mt-2 text-sm text-red-400">{errors.maxDiscount}</p>}
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Start Date */}
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-300 mb-2">Ngày bắt đầu</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              className={getInputClass(errors.startDate)}
              disabled={isLimitedUpdate}
            />
            {errors.startDate && <p className="mt-2 text-sm text-red-400">{errors.startDate}</p>}
          </div>

          {/* End Date */}
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-300 mb-2">Ngày kết thúc</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleInputChange}
              className={getInputClass(errors.endDate)}
            />
            {errors.endDate && <p className="mt-2 text-sm text-red-400">{errors.endDate}</p>}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Usage Limit */}
          <div>
            <label htmlFor="usageLimit" className="block text-sm font-medium text-gray-300 mb-2">Giới hạn sử dụng</label>
            <input
              type="text"
              id="usageLimit"
              name="usageLimit"
              value={formData.usageLimit}
              onChange={handleInputChange}
              className={getInputClass(errors.usageLimit)}
              placeholder="Vd: 1000"
            />
            {formData.usageLimit !== '' && <p className="mt-1 text-sm text-gray-400">Giá trị: {formData.usageLimit}</p>}
            {errors.usageLimit && <p className="mt-2 text-sm text-red-400">{errors.usageLimit}</p>}
          </div>
          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-2">Trạng thái</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className={getInputClass(errors.status)}
            >
              <option value="active">Hoạt động</option>
              <option value="inactive">Không hoạt động</option>
              <option value="scheduled">Lên lịch</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Applicable Movies */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Phim áp dụng</label>
            <div className="max-h-60 overflow-y-auto bg-slate-700/50 p-3 rounded-lg border border-slate-600">
              {movies.map(movie => (
                <div key={movie.id} className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id={`movie-${movie.id}`}
                    checked={formData.applicableMovies.includes(movie.id)}
                    onChange={() => handleMovieSelection(movie.id)}
                    className="w-4 h-4 text-[#FFD875] bg-gray-700 border-gray-600 rounded focus:ring-[#FFD875]"
                    disabled={isLimitedUpdate}
                  />
                  <label htmlFor={`movie-${movie.id}`} className="ml-2 text-sm text-gray-300">{movie.title}</label>
                </div>
              ))}
            </div>
          </div>
          {/* Applicable Cinemas */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Rạp áp dụng</label>
            <div className="max-h-60 overflow-y-auto bg-slate-700/50 p-3 rounded-lg border border-slate-600">
              {cinemas.map(cinema => (
                <div key={cinema.id} className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id={`cinema-${cinema.id}`}
                    checked={formData.applicableCinemas.includes(cinema.id)}
                    onChange={() => handleCinemaSelection(cinema.id)}
                    className="w-4 h-4 text-[#FFD875] bg-gray-700 border-gray-600 rounded focus:ring-[#FFD875]"
                    disabled={isLimitedUpdate}
                  />
                  <label htmlFor={`cinema-${cinema.id}`} className="ml-2 text-sm text-gray-300">{cinema.name}</label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Terms and Conditions */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Điều khoản và điều kiện</label>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newTerm}
                onChange={(e) => setNewTerm(e.target.value)}
                placeholder="Thêm điều khoản..."
                className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-yellow-500 focus:outline-none"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTerm())}
              />
              <button
                type="button"
                onClick={addTerm}
                className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <PlusIcon className="w-4 h-4" />
                Thêm
              </button>
            </div>

            {formData.terms.length > 0 && (
              <div className="space-y-2">
                {formData.terms.map((term, index) => (
                  <div key={index} className="bg-slate-700 rounded-lg p-3 flex items-center justify-between">
                    <span className="text-white text-sm">{term}</span>
                    <button
                      type="button"
                      onClick={() => removeTerm(term)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Banner Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Banner khuyến mãi</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-yellow-500 file:text-black hover:file:bg-yellow-600"
            />

            {formData.banner && (
              <div className="mt-4">
                <img
                  src={URL.createObjectURL(formData.banner)}
                  alt="Banner preview"
                  className="w-full max-w-md h-32 object-cover rounded-lg"
                />
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-4 pt-6">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 text-black font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {loading ? 'Đang xử lý...' : mode === 'create' ? 'Tạo khuyến mãi' : 'Cập nhật'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/promotions')}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
};

export default PromotionForm;


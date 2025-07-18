// src/pages/admin/promotions/EditPromotion.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { TagIcon, ArrowLeftIcon, SparklesIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import FullScreenLoader from '../../../components/FullScreenLoader';
import { getPromotionById, updatePromotion } from '../../../services/admin/promotionManagementServices';
import type { Promotion, UpdatePromotionDto } from '../../../services/admin/promotionManagementServices';

interface PromotionForm extends Omit<Promotion, 'Created_At' | 'Created_By' | 'Is_Expired' | 'Is_Active' | 'Discount_Value' | 'Minimum_Purchase' | 'Maximum_Discount' | 'Usage_Limit'> {
  Discount_Value: number | '';
  Minimum_Purchase: number | '';
  Maximum_Discount: number | '';
  Usage_Limit: number | '';
}

const EditPromotion: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<PromotionForm>({
    Promotion_ID: 0,
    Title: '',
    Promotion_Code: '',
    Start_Date: '',
    End_Date: '',
    Discount_Type: 'Percentage',
    Discount_Value: '',
    Minimum_Purchase: '',
    Maximum_Discount: '',
    Applicable_For: 'All Users',
    Usage_Limit: '',
    Current_Usage: 0,
    Status: 'Active',
    Promotion_Detail: ''
  });

  // Validation errors state
  const [errors, setErrors] = useState({
    Title: '',
    Promotion_Code: '',
    Discount_Value: '',
    Start_Date: '',
    End_Date: '',
    Minimum_Purchase: '',
    Maximum_Discount: ''
  });

  useEffect(() => {
    const fetchPromotion = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        setError(null);

        const promotion = await getPromotionById(id);

        // Format dates for input fields
        const formattedPromotion = {
          ...promotion,
          Start_Date: promotion.Start_Date.split('T')[0],
          End_Date: promotion.End_Date.split('T')[0]
        };

        setFormData(formattedPromotion as PromotionForm);
      } catch (err: any) {
        console.error('Error fetching promotion:', err);
        setError(err.message || 'Không thể tải thông tin khuyến mãi');
        toast.error('Không thể tải thông tin khuyến mãi');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPromotion();
  }, [id]);

  // Format number with dots
  const formatNumber = (value: number | string): string => {
    if (value === '' || value === 0 || value === null || value === undefined) return '';
    return value.toString();
  };

  // Format number for display with thousand separators
  const formatDisplayNumber = (value: number | string): string => {
    if (value === '' || value === 0 || value === null || value === undefined) return '';
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Parse number from formatted string
  const parseNumber = (value: string): number | '' => {
    const parsed = parseInt(value.replace(/\D/g, ''));
    return isNaN(parsed) ? '' : parsed;
  };

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = (): string => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Validate individual field
  const validateField = (name: string, value: string | number): string => {
    switch (name) {
      case 'Title':
        return !value ? 'Tiêu đề khuyến mãi không được để trống' : '';
      case 'Promotion_Code':
        return !value ? 'Mã khuyến mãi không được để trống' : '';
      case 'Discount_Value':
        if (value === '' || value === 0) return 'Giá trị giảm không được để trống';
        if (formData.Discount_Type === 'Percentage' && Number(value) > 100) {
          return 'Phần trăm giảm giá không được vượt quá 100%';
        }
        if (formData.Discount_Type === 'Fix' && Number(value) > 10000000) {
          return 'Giá trị giảm không được vượt quá 10.000.000đ';
        }
        return '';
      case 'Start_Date':
        if (!value) return 'Ngày bắt đầu không được để trống';

        // if (value <= getTodayDate()) return 'Ngày bắt đầu phải ở trong tương lai';

        if (formData.End_Date && value === formData.End_Date) {
          return 'Ngày bắt đầu không được trùng với ngày kết thúc';
        }
        return '';
      case 'End_Date':
        if (!value) return 'Ngày kết thúc không được để trống';
        if (value <= getTodayDate()) return 'Ngày kết thúc phải ở trong tương lai';
        if (formData.Start_Date && value === formData.Start_Date) {
          return 'Ngày kết thúc không được trùng với ngày bắt đầu';
        }
        if (formData.Start_Date && value <= formData.Start_Date) {
          return 'Ngày kết thúc phải sau ngày bắt đầu';
        }
        return '';
      case 'Minimum_Purchase':
        if (value !== '' && Number(value) < 0) return 'Giá trị đơn hàng tối thiểu không được âm';
        if (value !== '' && Number(value) > 100000000) return 'Giá trị đơn hàng tối thiểu không được vượt quá 100.000.000đ';
        return '';
      case 'Maximum_Discount':
        if (value !== '' && Number(value) < 0) return 'Giảm giá tối đa không được âm';
        if (value !== '' && Number(value) > 50000000) return 'Giảm giá tối đa không được vượt quá 50.000.000đ';
        if (formData.Minimum_Purchase !== '' && value !== '' && Number(value) > Number(formData.Minimum_Purchase)) {
          return 'Giảm giá tối đa không được lớn hơn giá trị đơn hàng tối thiểu';
        }
        return '';
      case 'Usage_Limit':
        // Usage limit can be empty or 0 (unlimited) or a positive number
        if (value !== '' && Number(value) < 0) return 'Giới hạn sử dụng không được âm';
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Real-time validation for dates
    if (name === 'Start_Date' || name === 'End_Date') {
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));

      // Also revalidate the other date field
      const otherField = name === 'Start_Date' ? 'End_Date' : 'Start_Date';
      const otherValue = name === 'Start_Date' ? formData.End_Date : formData.Start_Date;
      if (otherValue) {
        const otherError = validateField(otherField, otherValue);
        setErrors(prev => ({
          ...prev,
          [otherField]: otherError
        }));
      }
    }
  };

  // Handle number input with formatting
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numericValue = parseNumber(value);

    setFormData(prev => ({
      ...prev,
      [name]: numericValue
    }));

    // Real-time validation for percentage and other numeric fields
    if (name === 'Discount_Value' || name === 'Minimum_Purchase' || name === 'Maximum_Discount') {
      const error = validateField(name, numericValue);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));

      // Cross-validation: if updating Minimum_Purchase, revalidate Maximum_Discount
      if (name === 'Minimum_Purchase' && formData.Maximum_Discount !== '') {
        const maxDiscountError = validateField('Maximum_Discount', formData.Maximum_Discount);
        setErrors(prev => ({
          ...prev,
          Maximum_Discount: maxDiscountError
        }));
      }
    }
  };

  // Handle blur validation
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let fieldValue: string | number = value;

    if (name === 'Discount_Value' || name === 'Minimum_Purchase' || name === 'Maximum_Discount') {
      fieldValue = formData[name as keyof typeof formData] as number | '';
    }

    const error = validateField(name, fieldValue);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const generateRandomCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    setFormData(prev => ({
      ...prev,
      Promotion_Code: result
    }));

    // Clear error for promotion code
    setErrors(prev => ({
      ...prev,
      Promotion_Code: ''
    }));
  };

  const validateForm = (): boolean => {
    const newErrors = {
      Title: validateField('Title', formData.Title),
      Promotion_Code: validateField('Promotion_Code', formData.Promotion_Code),
      Discount_Value: validateField('Discount_Value', formData.Discount_Value),
      Start_Date: validateField('Start_Date', formData.Start_Date),
      End_Date: validateField('End_Date', formData.End_Date),
      Minimum_Purchase: validateField('Minimum_Purchase', formData.Minimum_Purchase),
      Maximum_Discount: validateField('Maximum_Discount', formData.Maximum_Discount)
    };

    setErrors(newErrors);

    // Check if there are any errors
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    if (!validateForm()) {
      toast.error('Vui lòng kiểm tra và sửa các lỗi trong form');
      return;
    }

    try {
      setIsSubmitting(true);

      if (!id) {
        throw new Error('ID khuyến mãi không hợp lệ');
      }

      // Prepare data for API
      const updateData: UpdatePromotionDto = {
        Title: formData.Title,
        Promotion_Code: formData.Promotion_Code,
        Promotion_Detail: formData.Promotion_Detail,
        Discount_Type: formData.Discount_Type,
        Discount_Value: formData.Discount_Value === '' ? 0 : Number(formData.Discount_Value),
        Minimum_Purchase: formData.Minimum_Purchase === '' ? 0 : Number(formData.Minimum_Purchase),
        Maximum_Discount: formData.Maximum_Discount === '' ? undefined : Number(formData.Maximum_Discount),
        Start_Date: formData.Start_Date,
        End_Date: formData.End_Date,
        Status: formData.Status,
        Usage_Limit: formData.Usage_Limit === '' ? 0 : Number(formData.Usage_Limit),
        Applicable_For: formData.Applicable_For
      };

      await updatePromotion(id, updateData);

      toast.success('Cập nhật khuyến mãi thành công!');
      navigate('/admin/promotions');
    } catch (error) {
      toast.error('Có lỗi xảy ra khi cập nhật khuyến mãi');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[60vh]">
        <FullScreenLoader size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Link
            to="/admin/promotions"
            className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
          >
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col">
        {/* Header with back button */}
        <div className="flex items-center mb-6">
          <Link
            to="/admin/promotions"
            className="mr-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 text-white" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center">
              <SparklesIcon className="w-6 h-6 text-[#FFD875] mr-2" />
              Chỉnh sửa khuyến mãi
            </h1>
            <p className="text-gray-400 mt-1">Cập nhật thông tin khuyến mãi hiện có</p>
          </div>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          {/* Form Header */}
          <div className="bg-slate-800/50 p-4 border-b border-slate-700">
            <h2 className="text-lg font-semibold text-white">Thông tin khuyến mãi</h2>
          </div>

          {/* Form Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Basic Information */}
              <div>
                <div className="mb-6">
                  <label className="flex items-center text-white mb-2">
                    <TagIcon className="w-5 h-5 mr-2 text-[#FFD875]" />
                    Thông tin cơ bản
                  </label>

                  <div className="space-y-4">
                    {/* Title */}
                    <div>
                      <label htmlFor="Title" className="block text-sm font-medium text-gray-400 mb-1">
                        Tiêu đề khuyến mãi <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="Title"
                        name="Title"
                        value={formData.Title}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                        placeholder="Nhập tên khuyến mãi"
                        className={`w-full bg-slate-800 border rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-[#FFD875] focus:border-transparent transition-all ${
                          errors.Title ? "border-red-500" : "border-slate-700"
                        }`}
                      />
                      {errors.Title && <p className="text-red-400 text-sm mt-1">{errors.Title}</p>}
                    </div>

                    {/* Promotion Code */}
                    <div>
                      <label htmlFor="Promotion_Code" className="block text-sm font-medium text-gray-400 mb-1">
                        Mã khuyến mãi <span className="text-red-500">*</span>
                      </label>
                      <div className="flex">
                        <input
                          type="text"
                          id="Promotion_Code"
                          name="Promotion_Code"
                          value={formData.Promotion_Code}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          required
                          placeholder="Ví dụ: SUMMER2024"
                          className={`flex-grow bg-slate-800 border rounded-l-lg py-2 px-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-[#FFD875] focus:border-transparent transition-all ${
                            errors.Promotion_Code ? "border-red-500" : "border-slate-700"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={generateRandomCode}
                          className="bg-slate-700 hover:bg-slate-600 text-white px-3 rounded-r-lg border border-slate-600 transition-colors"
                        >
                          Tạo mã
                        </button>
                      </div>
                      {errors.Promotion_Code && <p className="text-red-400 text-sm mt-1">{errors.Promotion_Code}</p>}
                    </div>

                    {/* Description */}
                    <div>
                      <label htmlFor="Promotion_Detail" className="block text-sm font-medium text-gray-400 mb-1">
                        Mô tả
                      </label>
                      <textarea
                        id="Promotion_Detail"
                        name="Promotion_Detail"
                        value={formData.Promotion_Detail || ""}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Mô tả chi tiết về khuyến mãi"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-[#FFD875] focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="flex items-center text-white mb-2">
                    <TagIcon className="w-5 h-5 mr-2 text-[#FFD875]" />
                    Thời gian áp dụng
                  </label>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Start Date */}
                    <div>
                      <label htmlFor="Start_Date" className="block text-sm font-medium text-gray-400 mb-1">
                        Ngày bắt đầu <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        id="Start_Date"
                        name="Start_Date"
                        value={formData.Start_Date}
                        onChange={handleChange}
                        required
                        disabled
                        className={`w-full bg-gray-600 cursor-not-allowed opacity-70 bg-slate-800 border rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-[#FFD875] focus:border-transparent transition-all ${
                          errors.Start_Date ? "border-red-500" : "border-slate-700"
                        }`}
                      />
                      {errors.Start_Date && <p className="text-red-400 text-sm mt-1">{errors.Start_Date}</p>}
                    </div>

                    {/* End Date */}
                    <div>
                      <label htmlFor="End_Date" className="block text-sm font-medium text-gray-400 mb-1">
                        Ngày kết thúc <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        id="End_Date"
                        name="End_Date"
                        value={formData.End_Date}
                        onChange={handleChange}
                        required
                        min={getTodayDate()}
                        className={`w-full bg-slate-800 border rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-[#FFD875] focus:border-transparent transition-all ${
                          errors.End_Date ? "border-red-500" : "border-slate-700"
                        }`}
                      />
                      {errors.End_Date && <p className="text-red-400 text-sm mt-1">{errors.End_Date}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Promotion Conditions */}
              <div>
                <div className="mb-6">
                  <label className="flex items-center text-white mb-2">
                    <TagIcon className="w-5 h-5 mr-2 text-[#FFD875]" />
                    Điều kiện khuyến mãi
                  </label>

                  <div className="space-y-4">
                    {/* Promotion Type */}
                    <div>
                      <label htmlFor="Discount_Type" className="block text-sm font-medium text-gray-400 mb-1">
                        Loại khuyến mãi <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="Discount_Type"
                        name="Discount_Type"
                        value={formData.Discount_Type}
                        onChange={handleChange}
                        required
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-[#FFD875] focus:border-transparent transition-all appearance-none"
                      >
                        <option value="Percentage">Theo phần trăm (%)</option>
                        <option value="Fix">Số tiền cố định</option>
                      </select>
                    </div>

                    {/* Discount Value */}
                    <div className="mb-6">
                      <label htmlFor="Discount_Value" className="block text-sm font-medium text-gray-300 mb-2">
                        {formData.Discount_Type === "Percentage" ? "Phần trăm giảm giá (%)" : "Giá trị giảm (VND)"}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="Discount_Value"
                        name="Discount_Value"
                        value={formatNumber(formData.Discount_Value)}
                        onChange={handleNumberChange}
                        onBlur={handleBlur}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-[#FFD875] focus:border-transparent transition-all"
                        placeholder={formData.Discount_Type === "Percentage" ? "Ví dụ: 10" : "Ví dụ: 50000"}
                        required
                      />
                      {errors.Discount_Value && <p className="mt-1 text-sm text-red-500">{errors.Discount_Value}</p>}
                      {formData.Discount_Value !== "" && !errors.Discount_Value && (
                        <p className="mt-1 text-sm text-gray-400">
                          Giá trị: {formatDisplayNumber(formData.Discount_Value)}{" "}
                          {formData.Discount_Type === "Percentage" ? "%" : "đ"}
                        </p>
                      )}
                      {formData.Discount_Type === "Percentage" &&
                        formData.Discount_Value !== "" &&
                        Number(formData.Discount_Value) > 100 && (
                          <p className="mt-1 text-sm text-red-500">Phần trăm giảm giá không được vượt quá 100%</p>
                        )}
                    </div>

                    {/* Min Order Value */}
                    <div className="mb-6">
                      <label htmlFor="Minimum_Purchase" className="block text-sm font-medium text-gray-300 mb-2">
                        Giá trị đơn hàng tối thiểu (VND)
                      </label>
                      <input
                        type="text"
                        id="Minimum_Purchase"
                        name="Minimum_Purchase"
                        value={formatNumber(formData.Minimum_Purchase)}
                        onChange={handleNumberChange}
                        onBlur={handleBlur}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-[#FFD875] focus:border-transparent transition-all"
                        placeholder="Ví dụ: 100000"
                      />
                      {errors.Minimum_Purchase && (
                        <p className="mt-1 text-sm text-red-500">{errors.Minimum_Purchase}</p>
                      )}
                      {formData.Minimum_Purchase !== "" && !errors.Minimum_Purchase && (
                        <p className="mt-1 text-sm text-gray-400">
                          Tối thiểu: {formatDisplayNumber(formData.Minimum_Purchase)}đ
                        </p>
                      )}
                    </div>

                    {/* Max Discount */}
                    {formData.Discount_Type === "Percentage" && (
                      <div className="mb-6">
                        <label htmlFor="Maximum_Discount" className="block text-sm font-medium text-gray-300 mb-2">
                          Giảm giá tối đa (VND)
                        </label>
                        <input
                          type="text"
                          id="Maximum_Discount"
                          name="Maximum_Discount"
                          value={formatNumber(formData.Maximum_Discount)}
                          onChange={handleNumberChange}
                          onBlur={handleBlur}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-[#FFD875] focus:border-transparent transition-all"
                          placeholder="Ví dụ: 100000"
                        />
                        {errors.Maximum_Discount && (
                          <p className="mt-1 text-sm text-red-500">{errors.Maximum_Discount}</p>
                        )}
                        {formData.Maximum_Discount !== "" && !errors.Maximum_Discount && (
                          <p className="mt-1 text-sm text-gray-400">
                            Tối đa: {formatDisplayNumber(formData.Maximum_Discount)}đ
                          </p>
                        )}
                      </div>
                    )}

                    {/* Status */}
                    <div>
                      <label htmlFor="Status" className="block text-sm font-medium text-gray-400 mb-1">
                        Trạng thái <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="Status"
                        name="Status"
                        value={formData.Status}
                        onChange={handleChange}
                        required
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-[#FFD875] focus:border-transparent transition-all appearance-none"
                      >
                        <option value="Active">Hoạt động</option>
                        <option value="Inactive">Ngừng hoạt động</option>
                      </select>
                    </div>

                    {/* Usage Limit */}
                    <div className="mb-6">
                      <label htmlFor="Usage_Limit" className="block text-sm font-medium text-gray-300 mb-2">
                        Giới hạn sử dụng
                      </label>
                      <input
                        type="text"
                        id="Usage_Limit"
                        name="Usage_Limit"
                        value={formatNumber(formData.Usage_Limit)}
                        onChange={handleNumberChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-[#FFD875] focus:border-transparent transition-all"
                        placeholder="Ví dụ: 100"
                      />
                      {formData.Usage_Limit !== "" && (
                        <p className="mt-1 text-sm text-gray-400">
                          Giới hạn: {formatDisplayNumber(formData.Usage_Limit)} lần sử dụng
                        </p>
                      )}
                      <p className="mt-1 text-sm text-blue-400">
                        <i>Để trống hoặc nhập 0 nếu muốn không giới hạn số lần sử dụng</i>
                      </p>
                    </div>

                    {/* Usage Count (Read-only) */}
                    <div className="mb-6">
                      <label htmlFor="Current_Usage" className="block text-sm font-medium text-gray-300 mb-2">
                        Đã sử dụng
                      </label>
                      <input
                        type="text"
                        id="Current_Usage"
                        name="Current_Usage"
                        value={formatNumber(formData.Current_Usage)}
                        onChange={handleNumberChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-[#FFD875] focus:border-transparent transition-all"
                        disabled
                      />
                      {formData.Current_Usage > 0 && (
                        <p className="mt-1 text-sm text-gray-400">
                          Đã dùng: {formatDisplayNumber(formData.Current_Usage)} lần
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="mt-8 pt-6 border-t border-slate-700 flex justify-end gap-4">
              <Link
                to="/admin/promotions"
                className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
              >
                Hủy
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-2 bg-[#FFD875] text-black rounded-lg font-medium hover:bg-[#FFD875]/80 transition-colors ${
                  isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting ? "Đang xử lý..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPromotion;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    TagIcon,
    CalendarIcon,
    CurrencyDollarIcon,
    ExclamationCircleIcon,
    CheckIcon,
    SparklesIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';

interface PromotionFormProps {
    mode: 'create' | 'edit';
}

const PromotionForm: React.FC<PromotionFormProps> = ({ mode }) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        code: '',
        type: 'percentage',
        value: 0,
        minOrderValue: 0,
        maxDiscount: 0,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
        status: 'active',
        usageLimit: 100,
        applicableMovies: [] as string[],
        applicableCinemas: [] as string[],
        banner: ''
    });

    // Thêm CSS cho hiệu ứng glowing
    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `
            .glow-effect {
                box-shadow: 0 0 15px rgba(255, 216, 117, 0.5);
                transition: box-shadow 0.3s ease-in-out;
            }
            
            .glow-effect:hover {
                box-shadow: 0 0 25px rgba(255, 216, 117, 0.7);
            }
            
            .glow-text {
                text-shadow: 0 0 10px rgba(255, 216, 117, 0.5);
            }
            
            .btn-primary {
                background: #FFD875;
                color: #1e293b;
                font-weight: bold;
                transition: all 0.3s ease;
            }
            
            .btn-primary:hover {
                background: #f4c956;
                box-shadow: 0 0 15px rgba(255, 216, 117, 0.7);
                transform: translateY(-2px);
            }
            
            .input-glow:focus {
                border-color: #FFD875 !important;
                box-shadow: 0 0 0 2px rgba(255, 216, 117, 0.25) !important;
            }
            
            .panel-glow {
                border: 1px solid rgba(255, 216, 117, 0.2);
                transition: all 0.3s ease;
            }
            
            .panel-glow:hover {
                border-color: rgba(255, 216, 117, 0.4);
                box-shadow: 0 0 20px rgba(255, 216, 117, 0.2);
            }
            
            @keyframes pulse-glow {
                0% { box-shadow: 0 0 5px rgba(255, 216, 117, 0.5); }
                50% { box-shadow: 0 0 15px rgba(255, 216, 117, 0.7); }
                100% { box-shadow: 0 0 5px rgba(255, 216, 117, 0.5); }
            }
            
            .pulse-glow {
                animation: pulse-glow 2s infinite;
            }
        `;
        document.head.appendChild(style);

        return () => {
            document.head.removeChild(style);
        };
    }, []);

    useEffect(() => {
        if (mode === 'edit' && id) {
            fetchPromotionData(id);
        }
    }, [mode, id]);

    const fetchPromotionData = async (promotionId: string) => {
        try {
            setLoading(true);
            // Giả định gọi API để lấy thông tin khuyến mãi
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Mock data cho mục đích demo
            const mockPromotion = {
                id: promotionId,
                title: 'Giảm giá 20% cho khách hàng mới',
                description: 'Ưu đãi đặc biệt dành cho khách hàng lần đầu đặt vé',
                code: 'NEWCUSTOMER20',
                type: 'percentage',
                value: 20,
                minOrderValue: 200000,
                maxDiscount: 100000,
                startDate: '2024-01-01',
                endDate: '2024-03-31',
                status: 'active',
                usageLimit: 1000,
                applicableMovies: ['all'],
                applicableCinemas: ['all'],
                banner: '/api/placeholder/400/200',
            };

            setFormData({
                title: mockPromotion.title,
                description: mockPromotion.description,
                code: mockPromotion.code,
                type: mockPromotion.type,
                value: mockPromotion.value,
                minOrderValue: mockPromotion.minOrderValue,
                maxDiscount: mockPromotion.maxDiscount || 0,
                startDate: mockPromotion.startDate,
                endDate: mockPromotion.endDate,
                status: mockPromotion.status,
                usageLimit: mockPromotion.usageLimit,
                applicableMovies: mockPromotion.applicableMovies,
                applicableCinemas: mockPromotion.applicableCinemas,
                banner: mockPromotion.banner
            });
        } catch (error) {
            console.error('Error fetching promotion data:', error);
            setError('Không thể tải thông tin khuyến mãi. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: Number(value) }));
    };

    const generatePromotionCode = () => {
        const prefix = formData.title.replace(/[^A-Z0-9]/ig, '').substring(0, 5).toUpperCase();
        const randomNum = Math.floor(Math.random() * 9000) + 1000;
        const generatedCode = `${prefix}${randomNum}`;
        setFormData(prev => ({ ...prev, code: generatedCode }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError('');

            // Validate form data
            if (!formData.title || !formData.code || formData.value <= 0) {
                setError('Vui lòng điền đầy đủ thông tin bắt buộc');
                setLoading(false);
                return;
            }

            // Giả định gọi API để lưu khuyến mãi
            await new Promise(resolve => setTimeout(resolve, 1500));

            setSuccess(mode === 'create'
                ? 'Tạo khuyến mãi thành công!'
                : 'Cập nhật khuyến mãi thành công!');

            // Chuyển hướng sau khi lưu thành công
            setTimeout(() => {
                navigate('/admin/promotions');
            }, 2000);
        } catch (error) {
            console.error('Error saving promotion:', error);
            setError('Có lỗi xảy ra khi lưu thông tin khuyến mãi. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl shadow-lg p-6 glow-effect">
            <div className="mb-6 border-b border-[#FFD875]/20 pb-4">
                <h2 className="text-2xl font-bold text-white flex items-center glow-text">
                    <SparklesIcon className="w-7 h-7 mr-3 text-[#FFD875]" />
                    {mode === 'create' ? 'Tạo khuyến mãi mới' : 'Chỉnh sửa khuyến mãi'}
                </h2>
                <p className="text-gray-400 mt-2 pl-10">
                    {mode === 'create'
                        ? 'Tạo mới một chương trình khuyến mãi, ưu đãi cho khách hàng'
                        : 'Cập nhật thông tin khuyến mãi hiện có'}
                </p>
            </div>

            {error && (
                <div className="mb-6 bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg relative">
                    <span className="flex items-center">
                        <ExclamationCircleIcon className="w-5 h-5 mr-2 text-red-400" />
                        {error}
                    </span>
                </div>
            )}

            {success && (
                <div className="mb-6 bg-green-900/30 border border-green-500/50 text-green-300 px-4 py-3 rounded-lg relative">
                    <span className="flex items-center">
                        <CheckIcon className="w-5 h-5 mr-2 text-green-400" />
                        {success}
                    </span>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Thông tin cơ bản */}
                    <div className="bg-slate-800/60 backdrop-blur-sm p-6 rounded-xl panel-glow">
                        <div className="flex items-center mb-4">
                            <TagIcon className="w-5 h-5 text-[#FFD875] mr-2" />
                            <h3 className="text-lg font-medium text-white">Thông tin cơ bản</h3>
                        </div>

                        <div className="mb-5">
                            <label className="block text-gray-300 mb-2">Tiêu đề khuyến mãi <span className="text-red-400">*</span></label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className="w-full bg-slate-900/70 border border-slate-700 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#FFD875]/50 input-glow"
                                placeholder="Nhập tên khuyến mãi"
                                required
                            />
                        </div>

                        <div className="mb-5">
                            <label className="block text-gray-300 mb-2">Mã khuyến mãi <span className="text-red-400">*</span></label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    name="code"
                                    value={formData.code}
                                    onChange={handleInputChange}
                                    className="flex-1 bg-slate-900/70 border border-slate-700 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#FFD875]/50 input-glow"
                                    placeholder="Ví dụ: SUMMER2024"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={generatePromotionCode}
                                    className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg flex items-center transition-all duration-300 hover:shadow-[0_0_10px_rgba(255,216,117,0.3)]"
                                >
                                    <ArrowPathIcon className="w-4 h-4 mr-1" />
                                    Tạo mã
                                </button>
                            </div>
                        </div>

                        <div className="mb-5">
                            <label className="block text-gray-300 mb-2">Mô tả</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={4}
                                className="w-full bg-slate-900/70 border border-slate-700 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#FFD875]/50 input-glow"
                                placeholder="Mô tả chi tiết về khuyến mãi"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-300 mb-2">Trạng thái</label>
                            <div className="relative">
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    className="appearance-none w-full bg-slate-900/70 border border-slate-700 text-white rounded-lg p-3 pr-10 focus:outline-none focus:ring-2 focus:ring-[#FFD875]/50 input-glow"
                                >
                                    <option value="active">Đang hoạt động</option>
                                    <option value="inactive">Tạm dừng</option>
                                    <option value="scheduled">Lên lịch</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Điều kiện khuyến mãi */}
                    <div className="bg-slate-800/60 backdrop-blur-sm p-6 rounded-xl panel-glow">
                        <div className="flex items-center mb-4">
                            <CurrencyDollarIcon className="w-5 h-5 text-[#FFD875] mr-2" />
                            <h3 className="text-lg font-medium text-white">Điều kiện khuyến mãi</h3>
                        </div>

                        <div className="mb-5">
                            <label className="block text-gray-300 mb-2">Loại khuyến mãi <span className="text-red-400">*</span></label>
                            <div className="relative">
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleInputChange}
                                    className="appearance-none w-full bg-slate-900/70 border border-slate-700 text-white rounded-lg p-3 pr-10 focus:outline-none focus:ring-2 focus:ring-[#FFD875]/50 input-glow"
                                >
                                    <option value="percentage">Theo phần trăm (%)</option>
                                    <option value="fixed">Số tiền cố định</option>
                                    <option value="combo">Combo</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="mb-5">
                            <label className="block text-gray-300 mb-2">
                                {formData.type === 'percentage' ? 'Phần trăm giảm giá (%)' : 'Giá trị giảm (VNĐ)'}
                                <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    name="value"
                                    value={formData.value}
                                    onChange={handleNumberInputChange}
                                    min={0}
                                    max={formData.type === 'percentage' ? 100 : undefined}
                                    className="w-full bg-slate-900/70 border border-slate-700 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#FFD875]/50 input-glow"
                                    required
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[#FFD875] font-bold">
                                    {formData.type === 'percentage' ? '%' : 'đ'}
                                </div>
                            </div>
                        </div>

                        <div className="mb-5">
                            <label className="block text-gray-300 mb-2">Giá trị đơn hàng tối thiểu (VNĐ)</label>
                            <input
                                type="number"
                                name="minOrderValue"
                                value={formData.minOrderValue}
                                onChange={handleNumberInputChange}
                                min={0}
                                className="w-full bg-slate-900/70 border border-slate-700 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#FFD875]/50 input-glow"
                            />
                        </div>

                        {formData.type === 'percentage' && (
                            <div className="mb-5">
                                <label className="block text-gray-300 mb-2">Giảm giá tối đa (VNĐ)</label>
                                <input
                                    type="number"
                                    name="maxDiscount"
                                    value={formData.maxDiscount}
                                    onChange={handleNumberInputChange}
                                    min={0}
                                    className="w-full bg-slate-900/70 border border-slate-700 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#FFD875]/50 input-glow"
                                    placeholder="Không giới hạn"
                                />
                            </div>
                        )}

                        <div className="mb-4">
                            <label className="block text-gray-300 mb-2">Giới hạn sử dụng</label>
                            <input
                                type="number"
                                name="usageLimit"
                                value={formData.usageLimit}
                                onChange={handleNumberInputChange}
                                min={1}
                                className="w-full bg-slate-900/70 border border-slate-700 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#FFD875]/50 input-glow"
                            />
                        </div>
                    </div>

                    {/* Thời gian áp dụng */}
                    <div className="bg-slate-800/60 backdrop-blur-sm p-6 rounded-xl panel-glow">
                        <div className="flex items-center mb-4">
                            <CalendarIcon className="w-5 h-5 text-[#FFD875] mr-2" />
                            <h3 className="text-lg font-medium text-white">Thời gian áp dụng</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-gray-300 mb-2">Ngày bắt đầu <span className="text-red-400">*</span></label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleInputChange}
                                    className="w-full bg-slate-900/70 border border-slate-700 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#FFD875]/50 input-glow"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-300 mb-2">Ngày kết thúc <span className="text-red-400">*</span></label>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleInputChange}
                                    className="w-full bg-slate-900/70 border border-slate-700 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#FFD875]/50 input-glow"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Đối tượng áp dụng */}
                    <div className="bg-slate-800/60 backdrop-blur-sm p-6 rounded-xl panel-glow">
                        <div className="flex items-center mb-4">
                            <SparklesIcon className="w-5 h-5 text-[#FFD875] mr-2" />
                            <h3 className="text-lg font-medium text-white">Đối tượng áp dụng</h3>
                        </div>

                        <div className="mb-5">
                            <label className="block text-gray-300 mb-2">Hình ảnh banner</label>
                            <div className="bg-slate-900/70 border border-dashed border-[#FFD875]/50 rounded-lg p-4 text-center cursor-pointer hover:bg-slate-800 transition-all duration-300">
                                <SparklesIcon className="w-10 h-10 mx-auto text-[#FFD875]/50 mb-2" />
                                <p className="text-gray-400 text-sm">Kéo thả hình ảnh vào đây hoặc nhấp để chọn</p>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    id="banner-upload"
                                />
                                <label htmlFor="banner-upload" className="mt-2 inline-block px-4 py-2 bg-slate-700 text-white text-sm rounded-lg hover:bg-slate-600 transition-colors cursor-pointer">
                                    Chọn file
                                </label>
                            </div>
                        </div>

                        <div className="mb-5 border-t border-slate-700 pt-4 mt-6">
                            <h4 className="text-white mb-3 flex items-center">
                                <span className="w-2 h-2 rounded-full bg-[#FFD875] inline-block mr-2"></span>
                                Chọn phim áp dụng
                            </h4>
                            <div className="p-4 bg-slate-900/40 rounded-lg border border-slate-700 min-h-20 flex items-center justify-center">
                                <p className="text-gray-400 text-sm">Chức năng chọn phim sẽ được cập nhật trong phiên bản tiếp theo</p>
                            </div>
                        </div>

                        <div className="border-t border-slate-700 pt-4">
                            <h4 className="text-white mb-3 flex items-center">
                                <span className="w-2 h-2 rounded-full bg-[#FFD875] inline-block mr-2"></span>
                                Chọn rạp áp dụng
                            </h4>
                            <div className="p-4 bg-slate-900/40 rounded-lg border border-slate-700 min-h-20 flex items-center justify-center">
                                <p className="text-gray-400 text-sm">Chức năng chọn rạp sẽ được cập nhật trong phiên bản tiếp theo</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-10 flex justify-center gap-4">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/promotions')}
                        className="bg-slate-700 hover:bg-slate-600 text-white px-8 py-3 rounded-lg transition-all duration-300 hover:shadow-[0_0_10px_rgba(255,216,117,0.3)]"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-[#FFD875] hover:bg-[#f4c956] text-slate-900 px-8 py-3 rounded-lg transition-all duration-300 font-bold btn-primary pulse-glow"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-slate-900 inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Đang lưu...
                            </>
                        ) : (
                            mode === 'create' ? 'Tạo khuyến mãi' : 'Cập nhật khuyến mãi'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PromotionForm; 
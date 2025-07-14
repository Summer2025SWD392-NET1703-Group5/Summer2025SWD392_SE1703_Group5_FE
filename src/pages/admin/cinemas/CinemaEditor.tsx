import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { cinemaService } from '../../../services/cinemaService';
import FullScreenLoader from '../../../components/FullScreenLoader';
import { ArrowLeftIcon, BuildingOfficeIcon, MapPinIcon } from '@heroicons/react/24/outline';

const CinemaEditor: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        city: '',
        status: 'Active',
        description: '',
    });
    const [formErrors, setFormErrors] = useState({
        name: '',
        address: '',
        city: ''
    });
    const [serverErrors, setServerErrors] = useState<Record<string, string>>({});

    // Danh sách các thành phố
    const cities = [
      "Hồ Chí Minh",
      "Hà Nội",
      "Đà Nẵng",
      "Hải Phòng",
      "Cần Thơ",
      "An Giang",
      "Bà Rịa - Vũng Tàu",
      "Bắc Giang",
      "Bắc Kạn",
      "Bạc Liêu",
      "Bắc Ninh",
      "Bến Tre",
      "Bình Định",
      "Bình Dương",
      "Bình Phước",
      "Bình Thuận",
      "Cà Mau",
      "Cao Bằng",
      "Đắk Lắk",
      "Đắk Nông",
      "Điện Biên",
      "Đồng Nai",
      "Đồng Tháp",
      "Gia Lai",
      "Hà Giang",
      "Hà Nam",
      "Hà Tĩnh",
      "Hải Dương",
      "Hậu Giang",
      "Hòa Bình",
      "Hưng Yên",
      "Khánh Hòa",
      "Kiên Giang",
      "Kon Tum",
      "Lai Châu",
      "Lâm Đồng",
      "Lạng Sơn",
      "Lào Cai",
      "Long An",
      "Nam Định",
      "Nghệ An",
      "Ninh Bình",
      "Ninh Thuận",
      "Phú Thọ",
      "Phú Yên",
      "Quảng Bình",
      "Quảng Nam",
      "Quảng Ngãi",
      "Quảng Ninh",
      "Quảng Trị",
    ];

    useEffect(() => {
        if (id && id !== 'new') {
            fetchCinema(Number(id));
        } else {
            setLoading(false);
        }
    }, [id]);

    const fetchCinema = async (cinemaId: number) => {
        try {
            setLoading(true);
            const cinema = await cinemaService.getCinemaById(cinemaId);
            setFormData({
                name: cinema.Cinema_Name,
                address: cinema.Address,
                city: cinema.City,
                status: cinema.Status === 'Active' ? 'Active' : 'Inactive',
                description: cinema.Description || '',
            });
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Không thể tải dữ liệu rạp phim.';
            toast.error(errorMessage);
            console.error('Failed to fetch cinema:', error);
            navigate('/admin/cinemas');
        } finally {
            setLoading(false);
        }
    };

    const validateField = (name: string, value: string): string => {
        if (!value.trim()) {
            switch (name) {
                case 'name': return 'Vui lòng nhập tên rạp';
                case 'address': return 'Vui lòng nhập địa chỉ';
                case 'city': return 'Vui lòng chọn thành phố';
            }
        }
        return '';
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear form errors và server errors khi user nhập lại
        if (formErrors[name as keyof typeof formErrors]) {
            setFormErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
        }

        // Clear server error cho field này
        if (serverErrors[name]) {
            setServerErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate all fields on submit
        const errors = {
            name: validateField('name', formData.name),
            address: validateField('address', formData.address),
            city: validateField('city', formData.city),
        };

        if (Object.values(errors).some(error => error)) {
            setFormErrors(errors);
            toast.error('Vui lòng điền đầy đủ các trường bắt buộc.');
            return;
        }

        setSaving(true);
        setServerErrors({}); // Clear previous server errors
        const isNew = id === 'new';
        const toastId = toast.loading(isNew ? 'Đang tạo rạp...' : 'Đang cập nhật...');

        // Transform data for API
        const apiData = {
            Cinema_Name: formData.name,
            Address: formData.address,
            City: formData.city,
            Status: formData.status,
            Description: formData.description
        };

        try {
            if (isNew) {
                await cinemaService.createCinema(apiData);
                toast.success('Tạo rạp phim thành công!', { id: toastId });
            } else {
                await cinemaService.updateCinema(Number(id), apiData);
                toast.success('Cập nhật rạp phim thành công!', { id: toastId });
            }
            navigate('/admin/cinemas');
        } catch (error: any) {
            console.error('Failed to save cinema:', error);
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
                const newFormErrors = { ...formErrors };

                Object.keys(errorData.errorDetails).forEach(field => {
                    const fieldErrors = errorData.errorDetails[field];
                    if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
                        // Map field names từ API sang form field names
                        const fieldMap: Record<string, string> = {
                            'Cinema_Name': 'name',
                            'Address': 'address',
                            'City': 'city',
                            'Description': 'description'
                        };

                        const formFieldName = fieldMap[field] || field;
                        newServerErrors[formFieldName] = fieldErrors[0]; // Lấy lỗi đầu tiên
                        newFormErrors[formFieldName as keyof typeof formErrors] = fieldErrors[0];
                    }
                });

                setServerErrors(newServerErrors);
                setFormErrors(newFormErrors);
            } else if (errorData.errors && Array.isArray(errorData.errors)) {
                // Xử lý errors array format: ["Address: Địa chỉ phải từ 10-500 ký tự"]
                const newServerErrors: Record<string, string> = {};
                const newFormErrors = { ...formErrors };

                errorData.errors.forEach((errorMsg: string) => {
                    const colonIndex = errorMsg.indexOf(':');
                    if (colonIndex > 0) {
                        const field = errorMsg.substring(0, colonIndex).trim();
                        const message = errorMsg.substring(colonIndex + 1).trim();

                        // Map field names
                        const fieldMap: Record<string, string> = {
                            'Cinema_Name': 'name',
                            'Address': 'address',
                            'City': 'city',
                            'Description': 'description'
                        };

                        const formFieldName = fieldMap[field] || field;
                        newServerErrors[formFieldName] = message;
                        newFormErrors[formFieldName as keyof typeof formErrors] = message;
                    }
                });

                setServerErrors(newServerErrors);
                setFormErrors(newFormErrors);
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="w-full h-full flex items-center justify-center p-10">
                <FullScreenLoader />
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6 flex items-center">
                <button
                    onClick={() => navigate('/admin/cinemas')}
                    className="mr-4 p-2 rounded-full hover:bg-slate-700 transition-all duration-200"
                    aria-label="Go back"
                >
                    <ArrowLeftIcon className="h-6 w-6 text-white" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-white">
                        {id === 'new' ? 'Thêm rạp mới' : 'Cập nhật rạp phim'}
                    </h1>
                    <p className="text-gray-400 mt-1">
                        {id === 'new' ? 'Điền đầy đủ thông tin để tạo rạp mới' : 'Cập nhật thông tin rạp phim'}
                    </p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-slate-800 rounded-lg p-6 shadow-lg">
                <div className="space-y-6">
                    <h2 className="text-lg font-semibold text-white border-b border-slate-700 pb-2">Thông tin rạp</h2>

                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                            Tên rạp <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                onBlur={handleBlur}
                                className="bg-slate-700 text-white pl-10 pr-4 py-2 rounded-lg border border-slate-600 w-full focus:outline-none focus:border-FFD875 focus:ring-1 focus:ring-FFD875 transition-all duration-200"
                                style={{ borderColor: (serverErrors.name || formErrors.name) ? 'red' : formData.name ? '#FFD875' : undefined }}
                                placeholder="Nhập tên rạp..."
                                required
                            />
                        </div>
                        {(serverErrors.name || formErrors.name) && <p className="text-red-500 text-sm mt-1">{serverErrors.name || formErrors.name}</p>}
                    </div>

                    <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-300 mb-1">
                            Địa chỉ <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MapPinIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                onBlur={handleBlur}
                                className="bg-slate-700 text-white pl-10 pr-4 py-2 rounded-lg border border-slate-600 w-full focus:outline-none focus:border-FFD875 focus:ring-1 focus:ring-FFD875 transition-all duration-200"
                                style={{ borderColor: (serverErrors.address || formErrors.address) ? 'red' : formData.address ? '#FFD875' : undefined }}
                                placeholder="Nhập địa chỉ..."
                                required
                            />
                        </div>
                        {(serverErrors.address || formErrors.address) && <p className="text-red-500 text-sm mt-1">{serverErrors.address || formErrors.address}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="city" className="block text-sm font-medium text-gray-300 mb-1">
                                Thành phố <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="city"
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                onBlur={handleBlur}
                                className="bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 w-full focus:outline-none focus:border-FFD875 focus:ring-1 focus:ring-FFD875 transition-all duration-200"
                                style={{ borderColor: (serverErrors.city || formErrors.city) ? 'red' : formData.city ? '#FFD875' : undefined }}
                                required
                            >
                                <option value="">Chọn thành phố</option>
                                {formData.city && !cities.includes(formData.city) && (
                                    <option value={formData.city}>{formData.city}</option>
                                )}
                                {cities.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                            {(serverErrors.city || formErrors.city) && <p className="text-red-500 text-sm mt-1">{serverErrors.city || formErrors.city}</p>}
                        </div>

                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-1">
                                Trạng thái <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                className="bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 w-full focus:outline-none focus:border-FFD875 focus:ring-1 focus:ring-FFD875 transition-all duration-200"
                                required
                            >
                                <option value="Active">Hoạt động</option>
                                <option value="Inactive">Ngừng hoạt động</option>
                            </select>
                        </div>
                    </div>

                    {/* Mô tả */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                            Mô tả
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={4}
                            className={`bg-slate-700 text-white px-4 py-2 rounded-lg border w-full focus:outline-none focus:border-FFD875 focus:ring-1 focus:ring-FFD875 transition-all duration-200 ${serverErrors.description ? 'border-red-500' : 'border-slate-600'}`}
                            placeholder="Nhập mô tả về rạp..."
                        ></textarea>
                        {serverErrors.description && <p className="text-red-500 text-sm mt-1">{serverErrors.description}</p>}
                    </div>
                </div>

                {/* Buttons */}
                <div className="mt-8 flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/cinemas')}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200"
                        disabled={saving}
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-FFD875 text-black rounded-lg hover:bg-opacity-90 transition-all duration-200 btn-glow"
                        style={{ backgroundColor: '#FFD875' }}
                        disabled={saving}
                    >
                        {saving ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {id === 'new' ? 'Đang tạo...' : 'Đang lưu...'}
                            </span>
                        ) : (
                            id === 'new' ? 'Tạo rạp mới' : 'Cập nhật'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CinemaEditor; 
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    CubeIcon,
    UserGroupIcon,
    Cog6ToothIcon,
    ExclamationCircleIcon,
    ArrowPathIcon,
    ViewColumnsIcon,
    ArrowLeftIcon,
    CogIcon
} from '@heroicons/react/24/outline';
import type { CinemaRoom, CinemaRoomFormData, CinemaRoomFormStatus } from '../../../types/cinemaRoom';
import RichTextEditor from '../common/RichTextEditor';
import SeatLayoutConfig from '../cinema-rooms/SeatLayoutConfig';

const roomSchema = yup.object({
    Room_Name: yup.string()
        .required('Tên phòng là bắt buộc')
        .min(2, 'Tên phòng phải có ít nhất 2 ký tự')
        .max(50, 'Tên phòng không được vượt quá 50 ký tự'),
    Room_Type: yup.string()
        .oneOf(['2D', '3D', 'IMAX', 'VIP'], 'Loại phòng không hợp lệ')
        .required('Loại phòng là bắt buộc'),
    Seat_Quantity: yup.number()
        .required('Số ghế là bắt buộc')
        .min(20, 'Số ghế phải ít nhất là 20')
        .max(300, 'Số ghế không được vượt quá 300')
        .integer('Số ghế phải là số nguyên'),
    Status: yup.string()
        .oneOf(['Active', 'Inactive'] as CinemaRoomFormStatus[], 'Trạng thái không hợp lệ')
        .required('Trạng thái là bắt buộc'),
    Notes: yup.string()
        .max(500, 'Ghi chú không được vượt quá 500 ký tự')
        .optional(),
});

interface SeatLayout {
    Layout_ID: number;
    Row_Label: string;
    Column_Number: number;
    Seat_Type: string;
    Is_Active: boolean;
}

interface SeatLayoutResponse {
    success: boolean;
    message: string;
    data: {
        cinema_room: {
            Cinema_Room_ID: number;
            Room_Name: string;
            Room_Type: string;
        };
        rows: Array<{
            Row: string;
            Seats: SeatLayout[];
        }>;
        dimensions: {
            rows: number;
            columns: number;
        };
        stats: {
            total_seats: number;
            seat_types: Array<{
                SeatType: string;
                Count: number;
            }>;
        };
        can_modify: boolean;
    };
}

interface CinemaRoomFormProps {
    room?: CinemaRoom;
    onSubmit: (data: CinemaRoomFormData) => Promise<void>;
    onCancel: () => void;
    loading?: boolean;
}

const CinemaRoomForm: React.FC<CinemaRoomFormProps> = ({ room, onSubmit, onCancel, loading = false }) => {
    const [duplicateNameError, setDuplicateNameError] = useState<string | null>(null);
    const [suggestedName, setSuggestedName] = useState<string | null>(null);
    const [showSeatConfig, setShowSeatConfig] = useState(false);
    const [seatLayout, setSeatLayout] = useState<SeatLayoutResponse['data'] | null>(null);
    const [seatLayoutLoading, setSeatLayoutLoading] = useState(false);

    const {
        control,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm<CinemaRoomFormData>({
        resolver: yupResolver(roomSchema),
        defaultValues: {
            Room_Name: room?.Room_Name || '',
            Room_Type: room?.Room_Type || '2D',
            Seat_Quantity: room?.Seat_Quantity || 50,
            Status: room?.Status === 'Deleted' || room?.Status === 'Closed' || room?.Status === 'Maintenance' ? 'Inactive' : (room?.Status || 'Active'),
            Notes: room?.Notes || '',
        },
    });

    const roomTypes = [
        { value: '2D', label: '2D', color: 'text-white' },
        { value: '3D', label: '3D', color: 'text-blue-400' },
        { value: 'IMAX', label: 'IMAX', color: 'text-purple-400' },
        { value: 'VIP', label: 'VIP', color: 'text-[#FFD875]' },
    ];

    const seatQuantity = watch('Seat_Quantity');
    const roomType = watch('Room_Type');

    // Fetch seat layout from API
    const fetchSeatLayout = async (roomId: number) => {
        try {
            setSeatLayoutLoading(true);
            const response = await fetch(`/api/seat-layouts/room/${roomId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const data: SeatLayoutResponse = await response.json();
                setSeatLayout(data.data);
            } else {
                // If no seat layout found, set to null (will show empty state)
                setSeatLayout(null);
            }
        } catch (error) {
            console.error('Error fetching seat layout:', error);
            setSeatLayout(null);
        } finally {
            setSeatLayoutLoading(false);
        }
    };

    // Load seat layout when room changes
    useEffect(() => {
        if (room?.Cinema_Room_ID) {
            fetchSeatLayout(room.Cinema_Room_ID);
        }
    }, [room?.Cinema_Room_ID]);

    const handleFormSubmit = async (data: CinemaRoomFormData) => {
        setDuplicateNameError(null);
        setSuggestedName(null);

        try {
            await onSubmit(data);
        } catch (error: any) {
            console.error('Error submitting cinema room form:', error);

            const errorMessage = error.message || '';
            if (errorMessage.includes('đã tồn tại trong rạp này') && errorMessage.includes('Bạn có thể sử dụng tên')) {
                setDuplicateNameError(errorMessage);

                const match = errorMessage.match(/Bạn có thể sử dụng tên '([^']+)'/);
                if (match && match[1]) {
                    setSuggestedName(match[1]);
                }
            }
        }
    };

    const useSuggestedName = () => {
        if (suggestedName) {
            setValue('Room_Name', suggestedName, { shouldValidate: true });
            setDuplicateNameError(null);
            setSuggestedName(null);
        }
    };

    const handleSeatConfigSuccess = () => {
        setShowSeatConfig(false);
        // Refresh seat layout after successful configuration
        if (room?.Cinema_Room_ID) {
            fetchSeatLayout(room.Cinema_Room_ID);
        }
    };

    const getSeatTypeIcon = (seatType: string) => {
        switch (seatType) {
            case 'VIP': return '👑';
            case 'Couple': return '💕';
            default: return '💺';
        }
    };

    const getSeatTypeColor = (seatType: string) => {
        switch (seatType) {
            case 'VIP': return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400';
            case 'Couple': return 'bg-pink-500/20 border-pink-500/50 text-pink-400';
            default: return 'bg-blue-500/20 border-blue-500/50 text-blue-400';
        }
    };

    return (
        <div className="p-6">
            <motion.div
                className="mb-6 flex items-center"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
            >
                <button
                    onClick={onCancel}
                    className="mr-4 p-2 rounded-full hover:bg-slate-700 transition-all duration-200 text-gray-400 hover:text-white group"
                >
                    <ArrowLeftIcon className="h-6 w-6 group-hover:scale-110 transition-transform" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-white">
                        {room ? 'Chỉnh sửa phòng chiếu' : 'Thêm phòng chiếu mới'}
                    </h1>
                    <p className="text-gray-400 mt-1">
                        {room ? 'Cập nhật thông tin phòng chiếu' : 'Tạo phòng chiếu mới cho rạp'}
                    </p>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Form Section */}
                <motion.div
                    className="bg-slate-800 rounded-lg p-6 border border-slate-700 shadow-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                >
                    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                        {/* Room Name */}
                        <div className="relative group">
                            <label htmlFor="Room_Name" className="block text-sm font-medium text-[#FFD875] mb-2">
                                Tên phòng chiếu <span className="text-red-500">*</span>
                            </label>
                            <Controller
                                name="Room_Name"
                                control={control}
                                render={({ field }) => (
                                    <div className="relative">
                                        <CubeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FFD875] w-5 h-5" />
                                        <input
                                            {...field}
                                            type="text"
                                            className={`w-full pl-10 pr-4 py-3 bg-slate-700 text-white rounded-lg border ${errors.Room_Name || duplicateNameError ? 'border-red-500' : 'border-[#FFD875]/30'
                                                } focus:border-[#FFD875] focus:ring focus:ring-[#FFD875]/20 focus:outline-none transition-all duration-300 shadow-[0_0_10px_0px_rgba(255,216,117,0.2)] focus:shadow-[0_0_15px_0px_rgba(255,216,117,0.4)]`}
                                            placeholder="Ví dụ: Phòng 01, Screen A..."
                                        />
                                    </div>
                                )}
                            />
                            {errors.Room_Name && <p className="mt-1 text-sm text-red-500">{errors.Room_Name.message}</p>}

                            {/* Duplicate name error with suggestion */}
                            {duplicateNameError && (
                                <div className="mt-2 p-3 bg-red-900/30 border border-red-700 rounded-md">
                                    <div className="flex items-start">
                                        <ExclamationCircleIcon className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                                        <p className="text-sm text-red-400">{duplicateNameError}</p>
                                    </div>

                                    {suggestedName && (
                                        <div className="mt-2 flex items-center">
                                            <button
                                                type="button"
                                                onClick={useSuggestedName}
                                                className="flex items-center text-sm bg-[#FFD875] hover:bg-[#e5c368] text-black px-3 py-1 rounded-md ml-7 shadow-[0_0_10px_0_rgba(255,216,117,0.3)] hover:shadow-[0_0_15px_0_rgba(255,216,117,0.5)] transition-all duration-300"
                                            >
                                                <ArrowPathIcon className="w-4 h-4 mr-1" />
                                                Dùng tên "{suggestedName}"
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Glowing effect */}
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#FFD875]/0 via-[#FFD875]/20 to-[#FFD875]/0 rounded-lg blur opacity-0 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 animate-gradient-x -z-10"></div>
                        </div>

                        {/* Room Type */}
                        <div>
                            <label htmlFor="Room_Type" className="block text-sm font-medium text-[#FFD875] mb-2">
                                Loại phòng <span className="text-red-500">*</span>
                            </label>
                            <Controller
                                name="Room_Type"
                                control={control}
                                render={({ field }) => (
                                    <select
                                        {...field}
                                        className={`w-full px-4 py-3 bg-slate-700 text-white rounded-lg border ${errors.Room_Type ? 'border-red-500' : 'border-[#FFD875]/30'
                                            } focus:border-[#FFD875] focus:ring focus:ring-[#FFD875]/20 focus:outline-none transition-all duration-300 shadow-[0_0_10px_0px_rgba(255,216,117,0.2)] focus:shadow-[0_0_15px_0px_rgba(255,216,117,0.4)]`}
                                    >
                                        {roomTypes.map(type => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            />
                            {errors.Room_Type && <p className="mt-1 text-sm text-red-500">{errors.Room_Type.message}</p>}
                        </div>

                        {/* Seat Quantity */}
                        <div>
                            <label htmlFor="Seat_Quantity" className="block text-sm font-medium text-[#FFD875] mb-2">
                                Tổng số ghế <span className="text-red-500">*</span>
                            </label>
                            <Controller
                                name="Seat_Quantity"
                                control={control}
                                render={({ field }) => (
                                    <div className="relative">
                                        <UserGroupIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FFD875] w-5 h-5" />
                                        <input
                                            {...field}
                                            type="number"
                                            className={`w-full pl-10 pr-4 py-3 bg-slate-700 text-white rounded-lg border ${errors.Seat_Quantity ? 'border-red-500' : 'border-[#FFD875]/30'
                                                } focus:border-[#FFD875] focus:ring focus:ring-[#FFD875]/20 focus:outline-none transition-all duration-300 shadow-[0_0_10px_0px_rgba(255,216,117,0.2)] focus:shadow-[0_0_15px_0px_rgba(255,216,117,0.4)]`}
                                            placeholder="Nhập tổng số ghế (20 - 300)"
                                            min="20"
                                            max="300"
                                        />
                                    </div>
                                )}
                            />
                            {errors.Seat_Quantity && <p className="mt-1 text-sm text-red-500">{errors.Seat_Quantity.message}</p>}
                        </div>

                        {/* Status */}
                        <div>
                            <label htmlFor="Status" className="block text-sm font-medium text-[#FFD875] mb-2">
                                Trạng thái <span className="text-red-500">*</span>
                            </label>
                            <Controller
                                name="Status"
                                control={control}
                                render={({ field }) => (
                                    <div className="relative">
                                        <Cog6ToothIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FFD875] w-5 h-5" />
                                        <select
                                            {...field}
                                            className={`w-full pl-10 pr-4 py-3 bg-slate-700 text-white rounded-lg border ${errors.Status ? 'border-red-500' : 'border-[#FFD875]/30'
                                                } focus:border-[#FFD875] focus:ring focus:ring-[#FFD875]/20 focus:outline-none transition-all duration-300 shadow-[0_0_10px_0px_rgba(255,216,117,0.2)] focus:shadow-[0_0_15px_0px_rgba(255,216,117,0.4)]`}
                                        >
                                            <option value="Active">Hoạt động</option>
                                            <option value="Inactive">Không hoạt động</option>
                                        </select>
                                    </div>
                                )}
                            />
                            {errors.Status && <p className="mt-1 text-sm text-red-500">{errors.Status.message}</p>}
                        </div>

                        {/* Notes */}
                        <div>
                            <label htmlFor="Notes" className="block text-sm font-medium text-[#FFD875] mb-2">
                                Ghi chú
                            </label>
                            <Controller
                                name="Notes"
                                control={control}
                                render={({ field }) => (
                                    <RichTextEditor
                                        value={field.value || ''}
                                        onChange={field.onChange}
                                        placeholder="Nhập ghi chú hoặc mô tả về phòng chiếu..."
                                        minHeight="120px"
                                    />
                                )}
                            />
                            {errors.Notes && <p className="mt-1 text-sm text-red-500">{errors.Notes.message}</p>}
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex gap-4 pt-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-[#FFD875] hover:bg-[#e5c368] disabled:bg-gray-600 text-black font-medium py-3 px-4 rounded-lg transition-all duration-300 shadow-[0_0_15px_0_rgba(255,216,117,0.3)] hover:shadow-[0_0_20px_0_rgba(255,216,117,0.5)] disabled:shadow-none"
                            >
                                {loading ? 'Đang xử lý...' : room ? 'Cập nhật' : 'Tạo phòng chiếu'}
                            </button>
                            <button
                                type="button"
                                onClick={onCancel}
                                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 border border-slate-600"
                            >
                                Hủy
                            </button>

                            {room && room.Cinema_Room_ID && (
                                <Link
                                    to={`/admin/cinema-rooms/${room.Cinema_Room_ID}/seats`}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 flex items-center gap-2 shadow-[0_0_15px_0_rgba(59,130,246,0.3)] hover:shadow-[0_0_20px_0_rgba(59,130,246,0.5)]"
                                >
                                    <ViewColumnsIcon className="w-5 h-5" />
                                    Quản lý sơ đồ ghế
                                </Link>
                            )}
                        </div>
                    </form>
                </motion.div>

                {/* Seat Configuration Section */}
                <motion.div
                    className="bg-slate-800 rounded-lg p-6 border border-slate-700 shadow-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                >
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                        <CogIcon className="w-5 h-5 mr-2 text-[#FFD875]" />
                        Cấu hình sơ đồ ghế
                    </h3>

                    {room && room.Cinema_Room_ID ? (
                        <div className="space-y-4">
                            <div className="bg-slate-900 rounded-lg p-4">
                                <div className="text-center mb-4">
                                    <div className="inline-block bg-gradient-to-r from-[#FFD875]/20 to-[#FFD875]/10 border border-[#FFD875]/30 rounded-lg px-6 py-2 mb-4">
                                        <p className="text-[#FFD875] font-semibold">MÀN HÌNH</p>
                                    </div>
                                </div>

                                {seatLayoutLoading ? (
                                    <div className="text-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FFD875] mx-auto mb-2"></div>
                                        <p className="text-gray-400 text-sm">Đang tải sơ đồ ghế...</p>
                                    </div>
                                ) : seatLayout ? (
                                    <>
                                        {/* Render actual seat layout from API */}
                                        <div className="overflow-x-auto mb-4">
                                            <div className="min-w-max mx-auto space-y-1">
                                                {seatLayout.rows.map(row => (
                                                    <div key={row.Row} className="flex items-center gap-2">
                                                        <div className="w-6 text-center text-[#FFD875] font-semibold text-sm">{row.Row}</div>
                                                        <div className="flex gap-1">
                                                            {row.Seats.map(seat => (
                                                                <div
                                                                    key={seat.Layout_ID}
                                                                    className={`w-6 h-6 rounded border-2 flex items-center justify-center text-xs ${getSeatTypeColor(seat.Seat_Type)} ${!seat.Is_Active ? 'opacity-50' : ''}`}
                                                                    title={`${seat.Row_Label}${seat.Column_Number} - ${seat.Seat_Type}`}
                                                                >
                                                                    <span className="text-xs">{getSeatTypeIcon(seat.Seat_Type)}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="text-center text-sm text-gray-400">
                                            Phòng chiếu đã được cấu hình
                                            <br />
                                            <span className="text-[#FFD875] font-medium">
                                                {roomType} - {seatLayout.stats.total_seats} ghế
                                            </span>
                                            <div className="mt-2 flex justify-center gap-4 text-xs">
                                                {seatLayout.stats.seat_types.map(type => (
                                                    <span key={type.SeatType} className="flex items-center gap-1">
                                                        <span>{getSeatTypeIcon(type.SeatType)}</span>
                                                        <span>{type.SeatType}: {type.Count}</span>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-4 text-gray-400">
                                        <p className="mb-2">Chưa có sơ đồ ghế</p>
                                        <p className="text-sm">Sử dụng nút bên dưới để cấu hình</p>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => setShowSeatConfig(true)}
                                className="w-full bg-[#FFD875] hover:bg-[#e5c368] text-black font-medium py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_15px_0_rgba(255,216,117,0.3)] hover:shadow-[0_0_20px_0_rgba(255,216,117,0.5)]"
                            >
                                <CogIcon className="w-5 h-5" />
                                {seatLayout ? 'Cấu hình lại sơ đồ ghế' : 'Cấu hình sơ đồ ghế hàng loạt'}
                            </button>

                            <div className="text-sm text-gray-400 bg-slate-700/30 rounded-lg p-3">
                                <p className="font-medium text-[#FFD875] mb-2">💡 Hướng dẫn:</p>
                                <ul className="space-y-1 text-xs">
                                    <li>• Cấu hình nhanh sơ đồ ghế cho phòng chiếu</li>
                                    <li>• Chọn loại ghế: Thường, VIP, hoặc Đôi</li>
                                    <li>• Thiết lập hàng ghế và lối đi</li>
                                    <li>• Xem trước trước khi áp dụng</li>
                                </ul>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-400">
                            <CogIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                            <p className="text-lg font-medium mb-2">Tạo phòng chiếu trước</p>
                            <p className="text-sm">
                                Bạn cần tạo phòng chiếu trước khi có thể cấu hình sơ đồ ghế.
                            </p>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Seat Configuration Modal */}
            {showSeatConfig && room?.Cinema_Room_ID && (
                <SeatLayoutConfig
                    roomId={room.Cinema_Room_ID}
                    onClose={() => setShowSeatConfig(false)}
                    onSuccess={handleSeatConfigSuccess}
                />
            )}
        </div>
    );
};

export default CinemaRoomForm;

{/* Add Material Icons */ }
<style jsx global>{`
    @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=weekend');
    
    @keyframes gradient-x {
        0%, 100% { transform: translateX(0%); }
        50% { transform: translateX(100%); }
    }
    
    .animate-gradient-x {
        animation: gradient-x 3s ease infinite;
        background-size: 200% 200%;
    }
`}</style> 
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { seatService } from '../../services/seatService';
import type { Seat } from '../../services/seatService';
import showtimeService from '../../services/showtimeService';
import LoadingSpinner from '../../components/LoadingSpinner';
import bookingService from '../../services/bookingService';
import api from '../../config/api';

const SeatSelection: React.FC = () => {
    const { showtimeId } = useParams<{ showtimeId: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [seats, setSeats] = useState<Seat[]>([]);
    const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
    const [showtimeDetails, setShowtimeDetails] = useState<any>(null);
    const [sessionId] = useState<string>(`session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);
    const [refreshing, setRefreshing] = useState(false);

    // Tải dữ liệu khi component được mount
    useEffect(() => {
        if (!showtimeId) {
            toast.error('Không tìm thấy mã suất chiếu');
            navigate('/movies');
            return;
        }

        loadData();

        // Cleanup: Giải phóng ghế đã giữ khi người dùng rời khỏi trang
        return () => {
            if (selectedSeats.length > 0) {
                releaseSeats();
            }
        };
    }, [showtimeId]);

    // Tải thông tin suất chiếu và ghế
    const loadData = async () => {
        setLoading(true);
        try {
            // Tải thông tin suất chiếu
            const showtimeData = await showtimeService.getShowtimeById(showtimeId!);
            setShowtimeDetails(showtimeData);

            // Tải danh sách ghế
            await refreshSeats();
        } catch (error) {
            console.error('Error loading data:', error);
            toast.error('Không thể tải thông tin ghế');
        } finally {
            setLoading(false);
        }
    };

    // Hàm làm mới sơ đồ ghế
    const refreshSeats = async () => {
        setRefreshing(true);
        try {
            const seatsData = await seatService.getSeatsByShowtime(showtimeId!);
            setSeats(seatsData);
            return seatsData;
        } catch (error) {
            console.error('Error refreshing seats:', error);
            toast.error('Không thể cập nhật thông tin ghế');
            return null;
        } finally {
            setRefreshing(false);
        }
    };

    // Xử lý khi người dùng chọn ghế
    const handleSeatClick = async (seatId: string) => {
        // Kiểm tra xem ghế đã được chọn chưa
        if (selectedSeats.includes(seatId)) {
            // Nếu đã chọn, bỏ chọn ghế
            setSelectedSeats(prev => prev.filter(id => id !== seatId));

            // Giải phóng ghế
            try {
                await seatService.releaseSeats({
                    showtimeId: showtimeId!,
                    seatIds: [seatId],
                    sessionId
                });
                // Cập nhật lại sơ đồ ghế sau khi giải phóng
                await refreshSeats();
            } catch (error) {
                console.error('Error releasing seat:', error);
            }
        } else {
            // Nếu chưa chọn, chọn ghế
            // Kiểm tra xem ghế có khả dụng không
            const seat = seats.find(s => s.id === seatId);
            if (!seat || seat.status !== 'available') {
                toast.error('Ghế này không khả dụng');
                return;
            }

            // Giữ ghế
            try {
                const result = await seatService.holdSeats({
                    showtimeId: showtimeId!,
                    seatIds: [seatId],
                    sessionId
                });

                if (result.success) {
                    setSelectedSeats(prev => [...prev, seatId]);
                    // Cập nhật lại sơ đồ ghế sau khi giữ
                    await refreshSeats();
                } else {
                    toast.error(result.message || 'Không thể chọn ghế này');
                }
            } catch (error) {
                console.error('Error holding seat:', error);
                toast.error('Không thể chọn ghế này');
            }
        }
    };

    // Giải phóng tất cả ghế đã chọn
    const releaseSeats = async () => {
        if (selectedSeats.length === 0) return;

        try {
            await seatService.releaseSeats({
                showtimeId: showtimeId!,
                seatIds: selectedSeats,
                sessionId
            });
            // Cập nhật lại sơ đồ ghế sau khi giải phóng
            await refreshSeats();
        } catch (error) {
            console.error('Error releasing seats:', error);
        }
    };

    // Xác nhận bán ghế khi booking thành công
    const confirmAndSellSeats = async () => {
        if (selectedSeats.length === 0) return false;

        try {
            const result = await seatService.sellSeats({
                showtimeId: showtimeId!,
                seatIds: selectedSeats
            });

            return result.success;
        } catch (error) {
            console.error('Error selling seats:', error);
            return false;
        }
    };

    // Xử lý khi người dùng tiếp tục đến trang thanh toán
    const handleContinue = async () => {
        if (selectedSeats.length === 0) {
            toast.error('Vui lòng chọn ít nhất một ghế');
            return;
        }

        // Thử xác nhận bán ghế
        const sellResult = await confirmAndSellSeats();
        if (sellResult) {
            toast.success('Đã xác nhận ghế thành công');
        }

        // Chuyển đến trang thanh toán với thông tin showtime
        navigate(`/booking/${showtimeId}/payment`);
    };

    // Xử lý khi người dùng muốn hủy booking đang tồn tại
    const handleCancelExistingBooking = async () => {
        try {
            setLoading(true);
            toast.loading('Đang kiểm tra thông tin đơn hàng...');

            // Sử dụng api từ config thay vì fetch trực tiếp
            const checkPendingResponse = await api.get('/bookings/check-pending');

            let bookingId = null;
            if (checkPendingResponse.data?.pendingBooking) {
                const pendingBooking = checkPendingResponse.data.pendingBooking;
                bookingId = pendingBooking.Booking_ID || pendingBooking.id;
            }

            if (!bookingId) {
                toast.dismiss();
                toast.error('Không tìm thấy thông tin đơn hàng đang chờ thanh toán');
                setLoading(false);
                return;
            }

            toast.loading(`Đang hủy đơn đặt vé #${bookingId}...`);

            const cancelResult = await bookingService.cancelBooking(bookingId);

            toast.dismiss();
            toast.success(cancelResult.message || `Đã hủy đơn đặt vé #${bookingId} thành công`);

            // Cập nhật lại sơ đồ ghế sau khi hủy booking - chỉ gọi một lần
            await refreshSeats();

        } catch (error) {
            toast.dismiss();
            console.error('Error cancelling booking:', error);
            toast.error('Có lỗi xảy ra khi hủy đơn đặt vé');

            // Vẫn cố gắng cập nhật lại sơ đồ ghế
            await refreshSeats();
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    // Hiển thị thông báo nếu đang làm mới sơ đồ ghế
    if (refreshing) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <LoadingSpinner />
                <p className="mt-4 text-gray-400">Đang cập nhật sơ đồ ghế...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-2">
            <h1 className="text-2xl font-bold mb-3">Chọn ghế</h1>

            {/* Thông tin suất chiếu */}
            {showtimeDetails && (
                <div className="bg-slate-800 rounded-lg p-3 mb-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                            <p className="text-gray-400">Phim</p>
                            <p className="text-white font-medium">{showtimeDetails.movie?.title || 'Không xác định'}</p>
                        </div>
                        <div>
                            <p className="text-gray-400">Rạp</p>
                            <p className="text-white font-medium">{showtimeDetails.cinema?.name || 'Không xác định'}</p>
                        </div>
                        <div>
                            <p className="text-gray-400">Suất chiếu</p>
                            <p className="text-white font-medium">
                                {new Date(showtimeDetails.startTime).toLocaleDateString('vi-VN')} - {new Date(showtimeDetails.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Nút làm mới */}
            <div className="flex justify-end mb-2">
                <button
                    onClick={refreshSeats}
                    disabled={refreshing}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center"
                >
                    {refreshing ? 'Đang làm mới...' : 'Làm mới sơ đồ ghế'}
                </button>
            </div>

            {/* Màn hình */}
            <div className="text-center mb-0">
                <h3 className="text-xl font-semibold text-white mb-0">MÀN HÌNH</h3>
                <div className="h-2 bg-blue-500 w-full max-w-3xl mx-auto rounded-lg shadow-lg shadow-blue-500/50 mb-2"></div>
            </div>

            {/* Chú thích */}
            <div className="flex justify-center mb-1 text-gray-400 text-sm flex-wrap">
                <div className="flex items-center mr-4 mb-1">
                    <div className="w-4 h-4 bg-green-500 bg-opacity-20 rounded-sm mr-2 border border-green-500"></div>
                    <span>Ghế trống</span>
                </div>
                <div className="flex items-center mr-4 mb-1">
                    <div className="w-4 h-4 bg-purple-500 bg-opacity-20 rounded-sm mr-2 border border-purple-500"></div>
                    <span>Ghế VIP</span>
                </div>
                <div className="flex items-center mr-4 mb-1">
                    <div className="w-4 h-4 bg-orange-500 bg-opacity-20 rounded-sm mr-2 border border-orange-500"></div>
                    <span>Ghế đôi</span>
                </div>
                <div className="flex items-center mr-4 mb-1">
                    <div className="w-4 h-4 bg-red-500 bg-opacity-20 rounded-sm mr-2 border border-red-500"></div>
                    <span>Đã đặt</span>
                </div>
                <div className="flex items-center mb-1">
                    <div className="w-4 h-4 bg-yellow-500 bg-opacity-20 rounded-sm mr-2 border border-yellow-500"></div>
                    <span>Đã chọn</span>
                </div>
            </div>

            {/* Hiển thị ghế */}
            <div className="bg-slate-800 rounded-lg p-3 mb-3">
                <div className="grid grid-cols-10 gap-1 max-w-4xl mx-auto">
                    {seats.map((seat) => (
                        <div
                            key={seat.id}
                            className={`
                seat text-center w-10 h-10 flex items-center justify-center text-sm font-medium rounded-t-lg cursor-pointer transition-all transform hover:scale-105
                ${seat.status === 'available' ? 'seat-available' : ''}
                ${seat.status === 'booked' || seat.status === 'reserved' ? 'seat-occupied' : ''}
                ${seat.status === 'held' && !selectedSeats.includes(seat.id) ? 'seat-occupied' : ''}
                ${selectedSeats.includes(seat.id) ? 'seat-selected' : ''}
                ${seat.type === 'vip' ? 'seat-vip' : ''}
                ${seat.type === 'couple' ? 'seat-couple w-20' : ''}
                ${seat.type === 'disabled' ? 'seat-disabled' : ''}
              `}
                            onClick={() => seat.status === 'available' && handleSeatClick(seat.id)}
                        >
                            {seat.row}{seat.column}
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                .seat-available {
                    background-color: rgba(34, 197, 94, 0.2);
                    border: 1px solid rgb(34, 197, 94);
                    color: white;
                }
                .seat-occupied {
                    background-color: rgba(239, 68, 68, 0.2);
                    border: 1px solid rgb(239, 68, 68);
                    color: rgba(255, 255, 255, 0.5);
                    cursor: not-allowed;
                }
                .seat-selected {
                    background-color: rgba(234, 179, 8, 0.3);
                    border: 1px solid rgb(234, 179, 8);
                    color: rgb(234, 179, 8);
                }
                .seat-vip {
                    background-color: rgba(168, 85, 247, 0.2);
                    border: 1px solid rgb(168, 85, 247);
                }
                .seat-couple {
                    background-color: rgba(249, 115, 22, 0.2);
                    border: 1px solid rgb(249, 115, 22);
                }
                .seat-disabled {
                    background-color: rgba(59, 130, 246, 0.2);
                    border: 1px solid rgb(59, 130, 246);
                }
            `}</style>

            {/* Thông tin đã chọn */}
            <div className="bg-slate-800 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-semibold text-white mb-3">Thông tin đã chọn</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                        <p className="text-gray-400">Ghế đã chọn</p>
                        <p className="text-white font-medium">
                            {selectedSeats.length > 0
                                ? selectedSeats.join(', ')
                                : 'Chưa chọn ghế nào'}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-400">Số lượng ghế</p>
                        <p className="text-white font-medium">{selectedSeats.length}</p>
                    </div>
                    <div>
                        <p className="text-gray-400">Tổng tiền</p>
                        <p className="text-yellow-500 font-bold">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                                selectedSeats.reduce((total, seatId) => {
                                    const seat = seats.find(s => s.id === seatId);
                                    return total + (seat?.price || 0);
                                }, 0)
                            )}
                        </p>
                    </div>
                </div>
            </div>

            {/* Nút điều hướng */}
            <div className="flex justify-between">
                <button
                    onClick={() => navigate(-1)}
                    className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                    Quay lại
                </button>
                <button
                    onClick={handleContinue}
                    disabled={selectedSeats.length === 0}
                    className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Tiếp tục
                </button>
            </div>
        </div>
    );
};

export default SeatSelection;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    TicketIcon,
    ArrowLeftIcon,
    CalendarIcon,
    ClockIcon,
    MapPinIcon,
    UserIcon,
    CreditCardIcon,
    CheckCircleIcon,
    XCircleIcon,
    InformationCircleIcon,
    FilmIcon,
    QrCodeIcon,
    BuildingStorefrontIcon
} from '@heroicons/react/24/outline';
import { QRCodeSVG } from 'qrcode.react';
import { ticketService } from '../../services/ticketService';
import { translateSeatType, translateRoomType } from '../../utils/seatTypeTranslator';

// Add fadeInUp animation to Tailwind if not already present
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-fadeInUp {
    animation: fadeInUp 0.6s ease-out;
  }
  .delay-100 {
    animation-delay: 0.1s;
  }
`;
document.head.appendChild(style);

interface TicketDetailData {
    success: boolean;
    ticket_details: {
        ticket_id: number;
        ticket_code: string;
        status: string;
        is_checked_in: boolean;
        check_in_time: string | null;
        final_price: number;
    };
    cinema_info: {
        cinema_id: number;
        cinema_name: string;
        cinema_address: string;
    };
    room_info: {
        room_id: number;
        room_name: string;
        room_type: string;
    };
    seat_info: {
        seat_id: number;
        seat_label: string;
        row_label: string;
        column_number: string;
        seat_type: string;
    };
    showtime_info: {
        showtime_id: number;
        show_date_formatted: string;
        show_time_formatted: string;
        show_date_raw: string;
        start_time_raw: string;
        end_time: string;
    };
    movie_info: {
        movie_id: number;
        movie_name: string;
        movie_poster: string;
        duration: number;
        rating: string;
    };
    booking_info: {
        booking_id: number;
        booking_date: string;
        booking_status: string;
        total_amount: number;
        payment_deadline: string;
    };
    customer_info: {
        user_id: number;
        full_name: string;
        email: string;
        phone: string;
    };
    qr_code: {
        data: string;
        image_url: string | null;
    };
    usage_instructions: string[];
}

const TicketDetail: React.FC = () => {
    const { id: ticketId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [ticketData, setTicketData] = useState<TicketDetailData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (ticketId) {
            fetchTicketDetail();
        }
    }, [ticketId]);

    const fetchTicketDetail = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await ticketService.getTicketById(ticketId!);
            console.log('Chi tiết vé:', response);
            setTicketData(response);
        } catch (err: any) {
            console.error('Lỗi tải chi tiết vé:', err);
            setError(err.message || 'Không thể tải thông tin chi tiết vé');
        } finally {
            setIsLoading(false);
        }
    };

    // Function to translate booking status to Vietnamese
    const translateBookingStatus = (status: string) => {
        const statusMap: { [key: string]: string } = {
            'Confirmed': 'Đã xác nhận',
            'Pending': 'Đang chờ xử lý',
            'Cancelled': 'Đã hủy',
        };
        return statusMap[status] || status;
    };

    const getStatusBadge = (status: string, isCheckedIn: boolean) => {
        if (isCheckedIn) {
            return (
                <span className="flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30 border border-green-400/20">
                    <CheckCircleIcon className="w-4 h-4 mr-2" />
                    Đã sử dụng
                </span>
            );
        }

        switch (status?.toLowerCase()) {
            case 'active':
                return (
                    <span className="flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-[#FFD875] to-amber-400 text-slate-900 shadow-lg shadow-[#FFD875]/30 border border-[#FFD875]/50">
                        <CheckCircleIcon className="w-4 h-4 mr-2" />
                        Còn hiệu lực
                    </span>
                );
            case 'used':
                return (
                    <span className="flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30 border border-green-400/20">
                        <CheckCircleIcon className="w-4 h-4 mr-2" />
                        Đã sử dụng
                    </span>
                );
            case 'expired':
                return (
                    <span className="flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg shadow-gray-500/30 border border-gray-400/20">
                        <XCircleIcon className="w-4 h-4 mr-2" />
                        Hết hạn
                    </span>
                );
            default:
                return (
                    <span className="flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg shadow-yellow-500/30 border border-yellow-400/20">
                        <InformationCircleIcon className="w-4 h-4 mr-2" />
                        {translateBookingStatus(status) || 'Không xác định'}
                    </span>
                );
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FFD875]"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !ticketData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
                <div className="max-w-4xl mx-auto">
                    <button
                        onClick={() => navigate(-1)}
                        className="mb-6 flex items-center text-gray-400 hover:text-white transition-colors"
                    >
                        <ArrowLeftIcon className="w-5 h-5 mr-2" />
                        Quay lại
                    </button>

                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
                        <XCircleIcon className="w-12 h-12 text-red-400 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-red-400 mb-2">Không thể tải thông tin vé</h2>
                        <p className="text-red-300 mb-4">{error}</p>
                        <button
                            onClick={fetchTicketDetail}
                            className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                        >
                            Thử lại
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-6">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8 animate-fadeInUp">
                    <button
                        onClick={() => navigate(-1)}
                        className="group flex items-center text-gray-400 hover:text-white transition-all duration-300 hover:transform hover:scale-105"
                    >
                        <div className="p-2 rounded-lg bg-slate-800/50 group-hover:bg-slate-700/50 transition-all duration-300 flex items-center">
                            <ArrowLeftIcon className="w-5 h-5 mr-2" />
                            <span className="font-medium">Quay lại</span>
                        </div>
                    </button>
                    
                    <div className="flex items-center space-x-4">
                        {getStatusBadge(ticketData.ticket_details.status, ticketData.ticket_details.is_checked_in)}
                    </div>
                </div>

                {/* Main Ticket Card */}
                <div className="relative bg-gradient-to-br from-slate-800/60 via-slate-800/40 to-slate-900/60 backdrop-blur-xl border border-slate-700/30 rounded-3xl overflow-hidden shadow-2xl shadow-black/20 animate-fadeInUp delay-100">
                    {/* Movie Header */}
                    <div className="relative bg-gradient-to-r from-[#FFD875]/20 via-amber-500/15 to-orange-500/20 p-6 md:p-8 border-b border-slate-700/30">
                        {/* Background Pattern */}
                        <div 
                            className="absolute inset-0 opacity-30"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3C/g%3E%3C/svg%3E")`
                            }}
                        ></div>
                        
                        <div className="relative flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8">
                            {/* Movie Poster */}
                            <div className="flex-shrink-0">
                                {ticketData.movie_info.movie_poster ? (
                                    <div className="relative group">
                                        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#FFD875] to-amber-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                                        <img
                                            src={ticketData.movie_info.movie_poster}
                                            alt={ticketData.movie_info.movie_name}
                                            className="relative w-28 h-40 md:w-32 md:h-44 object-cover rounded-xl shadow-2xl transform group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-28 h-40 md:w-32 md:h-44 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl flex items-center justify-center shadow-xl">
                                        <FilmIcon className="w-10 h-10 text-gray-400" />
                                    </div>
                                )}
                            </div>
                            
                            {/* Movie Info */}
                            <div className="flex-1 min-w-0">
                                <h1 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight">
                                    {ticketData.movie_info.movie_name}
                                </h1>
                                <div className="flex flex-wrap items-center gap-4 text-gray-300 mb-4">
                                    <span className="flex items-center bg-slate-800/50 px-3 py-1 rounded-lg">
                                        <ClockIcon className="w-4 h-4 mr-2 text-[#FFD875]" />
                                        {ticketData.movie_info.duration} phút
                                    </span>
                                    {ticketData.movie_info.rating && (
                                        <span className="px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium shadow-lg">
                                            {ticketData.movie_info.rating}
                                        </span>
                                    )}
                                </div>
                                <div className="bg-slate-900/50 backdrop-blur-sm px-4 py-3 rounded-xl border border-[#FFD875]/20">
                                    <p className="text-[#FFD875] font-semibold text-lg">
                                        Mã vé: <span className="font-mono text-xl">{ticketData.ticket_details.ticket_code}</span>
                                    </p>
                                </div>
                            </div>

                            {/* QR Code */}
                            <div className="flex-shrink-0 flex flex-col items-center space-y-3">
                                <div className="relative group">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-[#FFD875] to-amber-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                                    <div className="relative bg-white p-4 rounded-xl shadow-2xl transform group-hover:scale-105 transition-transform duration-300">
                                        <QRCodeSVG
                                            value={ticketData.qr_code.data}
                                            size={120}
                                            bgColor="#FFFFFF"
                                            fgColor="#000000"
                                            level="H"
                                            includeMargin={false}
                                        />
                                    </div>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-gray-400 font-medium">
                                        Quét để check-in
                                    </p>
                                    <div className="w-8 h-1 bg-gradient-to-r from-[#FFD875] to-amber-500 rounded-full mx-auto mt-1"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Ticket Information */}
                    <div className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Left Column */}
                            <div className="space-y-6">
                                {/* Showtime Info */}
                                <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/40 rounded-xl p-5 border border-slate-700/30 shadow-lg hover:shadow-xl transition-all duration-300">
                                    <h3 className="flex items-center text-lg font-semibold text-white mb-4">
                                        <div className="p-2 bg-[#FFD875]/10 rounded-lg mr-3">
                                            <CalendarIcon className="w-5 h-5 text-[#FFD875]" />
                                        </div>
                                        Thông tin suất chiếu
                                    </h3>
                                    <div className="space-y-3 text-gray-300">
                                        <div className="flex justify-between items-center p-2 bg-slate-800/30 rounded-lg">
                                            <span>Ngày chiếu:</span>
                                            <span className="text-white font-medium">
                                                {ticketData.showtime_info.show_date_formatted}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center p-2 bg-slate-800/30 rounded-lg">
                                            <span>Giờ chiếu:</span>
                                            <span className="text-white font-medium">
                                                {ticketData.showtime_info.show_time_formatted}
                                            </span>
                                        </div>
                                        {ticketData.showtime_info.end_time && (
                                            <div className="flex justify-between items-center p-2 bg-slate-800/30 rounded-lg">
                                                <span>Kết thúc:</span>
                                                <span className="text-white font-medium">
                                                    {ticketData.showtime_info.end_time}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Cinema & Room Info */}
                                <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/40 rounded-xl p-5 border border-slate-700/30 shadow-lg hover:shadow-xl transition-all duration-300">
                                    <h3 className="flex items-center text-lg font-semibold text-white mb-4">
                                        <div className="p-2 bg-[#FFD875]/10 rounded-lg mr-3">
                                            <BuildingStorefrontIcon className="w-5 h-5 text-[#FFD875]" />
                                        </div>
                                        Rạp chiếu
                                    </h3>
                                    <div className="space-y-3 text-gray-300">
                                        <div className="flex justify-between items-center p-2 bg-slate-800/30 rounded-lg">
                                            <span>Rạp:</span>
                                            <span className="text-white font-medium">
                                                {ticketData.cinema_info.cinema_name}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center p-2 bg-slate-800/30 rounded-lg">
                                            <span>Phòng:</span>
                                            <span className="text-white font-medium">
                                                {ticketData.room_info.room_name}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center p-2 bg-slate-800/30 rounded-lg">
                                            <span>Loại phòng:</span>
                                            <span className="text-white font-medium">
                                                {translateRoomType(ticketData.room_info.room_type)}
                                            </span>
                                        </div>
                                        {ticketData.cinema_info.cinema_address && (
                                            <div className="pt-2 border-t border-slate-700">
                                                <p className="text-sm bg-slate-800/30 p-2 rounded-lg flex items-start">
                                                    <MapPinIcon className="w-4 h-4 text-[#FFD875] mr-2 mt-0.5 flex-shrink-0" />
                                                    {ticketData.cinema_info.cinema_address}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Seat Info */}
                                <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/40 rounded-xl p-5 border border-slate-700/30 shadow-lg hover:shadow-xl transition-all duration-300">
                                    <h3 className="flex items-center text-lg font-semibold text-white mb-4">
                                        <div className="p-2 bg-[#FFD875]/10 rounded-lg mr-3">
                                            <TicketIcon className="w-5 h-5 text-[#FFD875]" />
                                        </div>
                                        Thông tin ghế
                                    </h3>
                                    <div className="space-y-3 text-gray-300">
                                        <div className="flex justify-between items-center p-3 bg-gradient-to-r from-[#FFD875]/10 to-amber-500/10 rounded-lg border border-[#FFD875]/20">
                                            <span>Ghế:</span>
                                            <span className="text-[#FFD875] font-bold text-2xl">
                                                {ticketData.seat_info.seat_label}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center p-2 bg-slate-800/30 rounded-lg">
                                            <span>Loại ghế:</span>
                                            <span className="text-white font-medium">
                                                {translateSeatType(ticketData.seat_info.seat_type)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-6">
                                {/* Booking Info */}
                                <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/40 rounded-xl p-5 border border-slate-700/30 shadow-lg hover:shadow-xl transition-all duration-300">
                                    <h3 className="flex items-center text-lg font-semibold text-white mb-4">
                                        <div className="p-2 bg-[#FFD875]/10 rounded-lg mr-3">
                                            <CreditCardIcon className="w-5 h-5 text-[#FFD875]" />
                                        </div>
                                        Thông tin đặt vé
                                    </h3>
                                    <div className="space-y-3 text-gray-300">
                                        <div className="flex justify-between items-center p-2 bg-slate-800/30 rounded-lg">
                                            <span>Mã đặt vé:</span>
                                            <span className="text-white font-medium font-mono">
                                                #{ticketData.booking_info.booking_id}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center p-2 bg-slate-800/30 rounded-lg">
                                            <span>Ngày đặt:</span>
                                            <span className="text-white font-medium">
                                                {new Date(ticketData.booking_info.booking_date).toLocaleDateString('vi-VN')}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center p-2 bg-slate-800/30 rounded-lg">
                                            <span>Trạng thái:</span>
                                            <span className="text-emerald-400 font-medium">
                                                {translateBookingStatus(ticketData.booking_info.booking_status)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-gradient-to-r from-[#FFD875]/10 to-amber-500/10 rounded-lg border border-[#FFD875]/20">
                                            <span className="text-lg font-semibold">Giá vé:</span>
                                            <span className="text-[#FFD875] font-bold text-2xl">
                                                {ticketData.ticket_details.final_price.toLocaleString('vi-VN')} ₫
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Customer Info */}
                                <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/40 rounded-xl p-5 border border-slate-700/30 shadow-lg hover:shadow-xl transition-all duration-300">
                                    <h3 className="flex items-center text-lg font-semibold text-white mb-4">
                                        <div className="p-2 bg-[#FFD875]/10 rounded-lg mr-3">
                                            <UserIcon className="w-5 h-5 text-[#FFD875]" />
                                        </div>
                                        Thông tin khách hàng
                                    </h3>
                                    <div className="space-y-3 text-gray-300">
                                        <div className="flex justify-between items-center p-2 bg-slate-800/30 rounded-lg">
                                            <span>Họ tên:</span>
                                            <span className="text-white font-medium">
                                                {ticketData.customer_info.full_name}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center p-2 bg-slate-800/30 rounded-lg">
                                            <span>Email:</span>
                                            <span className="text-white font-medium text-sm">
                                                {ticketData.customer_info.email}
                                            </span>
                                        </div>
                                        {ticketData.customer_info.phone && (
                                            <div className="flex justify-between items-center p-2 bg-slate-800/30 rounded-lg">
                                                <span>Điện thoại:</span>
                                                <span className="text-white font-medium">
                                                    {ticketData.customer_info.phone}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Check-in Status */}
                                <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/40 rounded-xl p-5 border border-slate-700/30 shadow-lg hover:shadow-xl transition-all duration-300">
                                    <h3 className="flex items-center text-lg font-semibold text-white mb-4">
                                        <div className="p-2 bg-[#FFD875]/10 rounded-lg mr-3">
                                            <QrCodeIcon className="w-5 h-5 text-[#FFD875]" />
                                        </div>
                                        Trạng thái check-in
                                    </h3>
                                    <div className="space-y-3">
                                        {ticketData.ticket_details.is_checked_in ? (
                                            <div className="flex items-center p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20">
                                                <CheckCircleIcon className="w-6 h-6 mr-3 text-green-400" />
                                                <span className="text-green-400 font-semibold">Đã check-in</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center p-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-500/20">
                                                <XCircleIcon className="w-6 h-6 mr-3 text-yellow-400" />
                                                <span className="text-yellow-400 font-semibold">Chưa check-in</span>
                                            </div>
                                        )}
                                        
                                        {ticketData.ticket_details.check_in_time && (
                                            <div className="text-gray-300 text-sm p-2 bg-slate-800/30 rounded-lg">
                                                <strong>Thời gian:</strong> {new Date(ticketData.ticket_details.check_in_time).toLocaleString('vi-VN')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Usage Instructions */}
                        {ticketData.usage_instructions && ticketData.usage_instructions.length > 0 && (
                            <div className="mt-8 bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-6 shadow-lg">
                                <h3 className="flex items-center text-xl font-semibold text-amber-400 mb-4">
                                    <div className="p-2 bg-amber-500/10 rounded-lg mr-3">
                                        <InformationCircleIcon className="w-6 h-6 text-amber-400" />
                                    </div>
                                    Hướng dẫn sử dụng
                                </h3>
                                <ul className="space-y-3 text-amber-200">
                                    {ticketData.usage_instructions.map((instruction, index) => (
                                        <li key={index} className="flex items-start p-3 bg-amber-500/5 rounded-lg border border-amber-500/10">
                                            <span className="w-3 h-3 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full mt-2 mr-4 flex-shrink-0" />
                                            <span className="text-amber-100 leading-relaxed">{instruction}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
                            <Link
                                to="/profile/tickets"
                                className="group px-8 py-4 bg-gradient-to-r from-slate-700 to-slate-600 text-white rounded-xl hover:from-slate-600 hover:to-slate-500 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-center font-semibold"
                            >
                                <span className="flex items-center justify-center">
                                    <ArrowLeftIcon className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
                                    Quay lại danh sách vé
                                </span>
                            </Link>
                            
                            {!ticketData.ticket_details.is_checked_in && (
                                <button className="group px-8 py-4 bg-gradient-to-r from-[#FFD875] to-amber-400 text-slate-900 border-2 border-[#FFD875]/30 rounded-xl hover:from-amber-400 hover:to-[#FFD875] transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold">
                                    <span className="flex items-center justify-center">
                                        <QrCodeIcon className="w-5 h-5 mr-2" />
                                        In vé điện tử
                                    </span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketDetail; 
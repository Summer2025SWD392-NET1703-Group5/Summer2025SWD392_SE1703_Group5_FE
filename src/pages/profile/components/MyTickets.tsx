import React, { useState, useEffect, useRef } from 'react';
import {
    TicketIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    ClockIcon,
    FilmIcon,
    MapPinIcon,
    QrCodeIcon,
    UserGroupIcon,
    CheckCircleIcon,
    XCircleIcon,
    ExclamationCircleIcon,
    CalendarIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline';
import { ticketService, type TicketData } from '../../../services/ticketService';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import PayOSQRModal from '../../../components/PayOSQRModal';

const ITEMS_PER_PAGE = 5;

// Interface mới cho thông tin ghế từ API (chi tiết hơn)
interface DetailedSeat extends Seat {
    layoutId: number;
    price: number;
    isActive: boolean;
    bookedBy?: string; // Tên người dùng đã đặt/giữ ghế
    holdExpiry?: string; // Thời gian hết hạn giữ ghế
}

const MyTickets: React.FC = () => {
    const [tickets, setTickets] = useState<TicketData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedTicket, setExpandedTicket] = useState<number | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const containerRef = useRef<HTMLDivElement>(null);
    const [showQrModal, setShowQrModal] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<TicketData | null>(null);

    useEffect(() => {
        fetchTickets();
    }, []);

    useEffect(() => {
        // Scroll to top when page changes
        if (containerRef.current) {
            containerRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [currentPage]);

    const fetchTickets = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await ticketService.getMyTickets();
            console.log('API response:', response);

            // Check if response has the expected structure
            if (response && 'tickets' in response && Array.isArray(response.tickets)) {
                // Sort tickets by booking_date (newest first)
                const sortedTickets = response.tickets.sort((a, b) => {
                    const dateA = a.booking_date ? new Date(a.booking_date).getTime() : 0;
                    const dateB = b.booking_date ? new Date(b.booking_date).getTime() : 0;
                    return dateB - dateA;
                });
                setTickets(sortedTickets);
                setTotalPages(Math.ceil(sortedTickets.length / ITEMS_PER_PAGE));
            } else if (response && Array.isArray(response)) {
                // Handle case where API returns an array directly
                const sortedTickets = [...response].sort((a, b) => {
                    const dateA = a.booking_date ? new Date(a.booking_date).getTime() : 0;
                    const dateB = b.booking_date ? new Date(b.booking_date).getTime() : 0;
                    return dateB - dateA;
                });
                setTickets(sortedTickets);
                setTotalPages(Math.ceil(sortedTickets.length / ITEMS_PER_PAGE));
            } else {
                console.error('Unexpected API response format:', response);
                setTickets([]);
                setError('Định dạng dữ liệu không hợp lệ. Vui lòng thử lại sau.');
            }
        } catch (err: any) {
            console.error('Error fetching tickets:', err);
            setError(err.message || 'Không thể tải thông tin vé. Vui lòng thử lại sau.');
            setTickets([]);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleExpand = (ticketId: number) => {
        setExpandedTicket(expandedTicket === ticketId ? null : ticketId);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return ''; // Handle invalid date
        }
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatTime = (timeString: string) => {
        if (!timeString) return '';
        try {
            // Nếu là string dạng "14:00:00" hoặc "14:00", parse trực tiếp
            if (typeof timeString === 'string' && timeString.includes(':')) {
                const parts = timeString.split(':');
                if (parts.length >= 2) {
                    const hour = parts[0].padStart(2, '0');
                    const minute = parts[1].padStart(2, '0');
                    return `${hour}:${minute}`;
                }
            }
            
            // Fallback: thử parse như Date object
            const date = new Date(timeString);
            if (!isNaN(date.getTime())) {
                return date.toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                });
            }
            
            return '';
        } catch (error) {
            console.error('Error formatting time:', error);
            return '';
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active':
                return (
                    <span key="status-badge" className="flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FFD875]/10 text-[#FFD875] border border-[#FFD875]/20 shadow-[0_0_8px_rgba(255,216,117,0.3)]">
                        <CheckCircleIcon className="w-3 h-3 mr-1" />
                        Còn hiệu lực
                    </span>
                );
            case 'used':
                return (
                    <span key="status-badge" className="flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FFD875]/10 text-[#FFD875] border border-[#FFD875]/20 shadow-[0_0_8px_rgba(255,216,117,0.3)]">
                        <CheckCircleIcon className="w-3 h-3 mr-1" />
                        Đã sử dụng
                    </span>
                );
            case 'expired':
                return (
                    <span key="status-badge" className="flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <XCircleIcon className="w-3 h-3 mr-1" />
                        Hết hạn
                    </span>
                );
            case 'cancelled':
                return (
                    <span key="status-badge" className="flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <XCircleIcon className="w-3 h-3 mr-1" />
                        Đã hủy
                    </span>
                );
            default:
                return (
                    <span key="status-badge" className="flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <ExclamationCircleIcon className="w-3 h-3 mr-1" />
                        Không xác định
                    </span>
                );
        }
    };

    // Pagination
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const paginatedTickets = tickets.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        return (
            <div className="flex justify-center mt-6 space-x-2">
                <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg ${currentPage === 1
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : 'bg-slate-700 text-white hover:bg-slate-600'}`}
                >
                    <ChevronLeftIcon className="w-5 h-5" />
                </button>

                {Array.from({ length: totalPages }).map((_, index) => {
                    const pageNumber = index + 1;
                    const isCurrentPage = pageNumber === currentPage;

                    // Show current page, first, last, and pages around current
                    if (
                        pageNumber === 1 ||
                        pageNumber === totalPages ||
                        (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                    ) {
                        return (
                            <button
                                key={pageNumber}
                                onClick={() => handlePageChange(pageNumber)}
                                className={`w-10 h-10 rounded-lg ${isCurrentPage
                                    ? 'bg-[#FFD875] text-slate-900 shadow-[0_0_10px_rgba(255,216,117,0.5)]'
                                    : 'bg-slate-700 text-white hover:bg-slate-600'
                                    }`}
                            >
                                {pageNumber}
                            </button>
                        );
                    }

                    // Show ellipsis for gaps
                    if (
                        (pageNumber === 2 && currentPage > 3) ||
                        (pageNumber === totalPages - 1 && currentPage < totalPages - 2)
                    ) {
                        return <span key={pageNumber} className="flex items-center justify-center w-10 h-10">...</span>;
                    }

                    return null;
                })}

                <button
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg ${currentPage === totalPages
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : 'bg-slate-700 text-white hover:bg-slate-600'}`}
                >
                    <ChevronRightIcon className="w-5 h-5" />
                </button>
            </div>
        );
    };

    // Generate QR code for ticket
    const generateQRCode = (ticket: TicketData) => {
        // Use just the ticket code for QR generation
        return (
            <div className="relative">
                <div className="absolute inset-0 bg-[#FFD875]/20 blur-xl rounded-lg"></div>
                <div className="relative bg-white p-3 rounded-lg shadow-lg shadow-[#FFD875]/20 border border-[#FFD875]/30">
                    <QRCodeSVG
                        value={ticket.ticket_code}
                        size={80}
                        bgColor={"#FFFFFF"}
                        fgColor={"#000000"}
                        level={"H"}
                        includeMargin={false}
                    />
                </div>
            </div>
        );
    };

    // Dropdown menu for mobile
    const renderTicketDropdown = () => {
        const recentTickets = tickets.slice(0, 3);

        return (
            <div className="relative lg:hidden mb-6">
                <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="w-full flex items-center justify-between p-3 bg-slate-800 border border-slate-700 rounded-lg text-white"
                >
                    <div className="flex items-center">
                        <TicketIcon className="w-5 h-5 mr-2 text-[#ffd875]" />
                        <span>Vé của tôi ({tickets.length})</span>
                    </div>
                    {dropdownOpen ?
                        <ChevronUpIcon key="dropdown-up" className="w-5 h-5" /> :
                        <ChevronDownIcon key="dropdown-down" className="w-5 h-5" />
                    }
                </button>

                {dropdownOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-slate-800 border border-slate-700 rounded-lg shadow-lg">
                        {recentTickets.length > 0 ? (
                            <>
                                {recentTickets.map(ticket => (
                                    <Link
                                        key={ticket.ticket_id}
                                        to={`/profile/tickets/${ticket.ticket_id}`}
                                        className="block p-3 hover:bg-slate-700 border-b border-slate-700 last:border-0"
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h4 className="font-medium text-white">{ticket.movie_info.movie_name}</h4>
                                                <p className="text-sm text-gray-400">
                                                    {formatDate(ticket.showtime_info.show_date)}
                                                    {ticket.showtime_info.show_date && ticket.showtime_info.start_time && ' • '}
                                                    {(() => {
                                                        console.log('Mobile dropdown - Start time value:', ticket.showtime_info.start_time);
                                                        return formatTime(ticket.showtime_info.start_time);
                                                    })()}
                                                </p>
                                            </div>
                                            {getStatusBadge(ticket.status)}
                                        </div>
                                    </Link>
                                ))}
                                {tickets.length > 3 && (
                                    <Link
                                        to="/profile/tickets"
                                        className="block p-3 text-center text-[#ffd875] hover:bg-slate-700"
                                    >
                                        Xem tất cả vé
                                    </Link>
                                )}
                            </>
                        ) : (
                            <div className="p-3 text-center text-gray-400">
                                Không có vé nào
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    // More detailed seat status info
    const getSeatStatusInfo = (seat: DetailedSeat): { className: string; tooltip: string; isDisabled: boolean } => {
        if (!seat.isActive) {
            return {
                className: "bg-gray-600 cursor-not-allowed",
                tooltip: "Ghế này không hoạt động",
                isDisabled: true
            };
        }

        if (seat.bookedBy) {
            return {
                className: "bg-red-600 cursor-not-allowed",
                tooltip: `Đã được đặt bởi ${seat.bookedBy}`,
                isDisabled: true
            };
        }

        if (seat.holdExpiry) {
            const expiryDate = new Date(seat.holdExpiry);
            const now = new Date();
            if (expiryDate > now) {
                const formattedTime = seat.holdExpiry ? new Date(seat.holdExpiry).toLocaleString('vi-VN') : 'N/A';
                return {
                    className: "bg-orange-500 cursor-not-allowed",
                    tooltip: `Đang được giữ đến ${formattedTime}`,
                    isDisabled: true
                };
            }
        }

        return {
            className: "bg-green-500",
            tooltip: "Ghế trống",
            isDisabled: false
        };
    };

    // Chỉnh sửa hàm hiển thị mã QR thanh toán
    const handleViewQrCode = (ticket: any) => {
        // Lấy thông tin số tiền và chi tiết vé
        const amount = ticket.Total_Amount || ticket.Payment?.Amount || 0;
        const ticketInfo = `${ticket.Seat?.Row}${ticket.Seat?.Number} - ${ticket.Movie?.Title}`;
        
        setSelectedTicket(ticket);
        setShowQrModal(true);
    };

    return (
        <div className="animate-fadeInUp" ref={containerRef}>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-normal text-white flex items-center">
                    <TicketIcon className="w-6 h-6 mr-2" />
                    Vé của tôi
                </h2>
            </div>

            {/* Mobile Dropdown */}
            {renderTicketDropdown()}

            {/* Ticket List */}
            {isLoading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ffd875]"></div>
                </div>
            ) : error ? (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
                    <ExclamationCircleIcon className="w-12 h-12 text-red-400 mx-auto mb-2" />
                    <p className="text-red-400">{error}</p>
                    <button
                        onClick={fetchTickets}
                        className="mt-4 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                    >
                        Thử lại
                    </button>
                </div>
            ) : tickets.length > 0 ? (
                <>
                    <div className="space-y-4">
                        {paginatedTickets.map((ticket) => {
                            console.log('Full ticket object:', ticket);
                            const { className, tooltip, isDisabled } = getSeatStatusInfo(ticket as any);
                            return (
                                <div
                                    key={ticket.ticket_id}
                                    className={className}
                                    title={tooltip}
                                    onClick={() => !isDisabled && handleViewQrCode(ticket)}
                                >
                                    {/* Ticket Header */}
                                    <div
                                        className="p-4 cursor-pointer"
                                        onClick={() => toggleExpand(ticket.ticket_id)}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center space-x-3">
                                                {ticket.movie_info.poster_url ? (
                                                    <img
                                                        src={ticket.movie_info.poster_url}
                                                        alt={ticket.movie_info.movie_name}
                                                        className="w-12 h-16 object-cover rounded-lg"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-16 bg-[#ffd875]/20 rounded-lg flex items-center justify-center">
                                                        <FilmIcon className="w-6 h-6 text-[#ffd875]" />
                                                    </div>
                                                )}
                                                <div>
                                                    <h3 className="text-lg font-medium text-white">{ticket.movie_info.movie_name}</h3>
                                                    <div className="flex items-center text-sm text-gray-400">
                                                        <ClockIcon className="w-4 h-4 mr-1" />
                                                        <span>
                                                            {formatDate(ticket.showtime_info.show_date)}
                                                            {ticket.showtime_info.show_date && ticket.showtime_info.start_time && ' • '}
                                                            {(() => {
                                                                console.log('Start time value:', ticket.showtime_info.start_time, 'Type:', typeof ticket.showtime_info.start_time);
                                                                const timeStr = formatTime(ticket.showtime_info.start_time);
                                                                return timeStr ? timeStr : 'Chưa có giờ';
                                                            })()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                {getStatusBadge(ticket.status)}
                                                {expandedTicket === ticket.ticket_id ?
                                                    <ChevronUpIcon key="chevron-up" className="w-5 h-5 text-gray-400" /> :
                                                    <ChevronDownIcon key="chevron-down" className="w-5 h-5 text-gray-400" />
                                                }
                                            </div>
                                        </div>
                                    </div>

                                    {/* Ticket Details */}
                                    {expandedTicket === ticket.ticket_id && (
                                        <div className="border-t border-gray-700/50 p-4 bg-slate-800/50 relative">
                                            {/* QR Code - Top Right Corner */}
                                            <div className="absolute top-4 right-4">
                                                {generateQRCode(ticket)}
                                            </div>

                                            {/* Ticket Information Grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-24">
                                                <div>
                                                    <p className="text-sm text-gray-400 mb-1">Rạp chiếu</p>
                                                    <div className="flex items-center text-white">
                                                        <MapPinIcon className="w-4 h-4 mr-2 text-[#ffd875]" />
                                                        {ticket.showtime_info.cinema_name}, {ticket.showtime_info.room_name}
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-400 mb-1">Suất chiếu</p>
                                                    <div className="flex items-center text-white">
                                                        <ClockIcon className="w-4 h-4 mr-2 text-[#ffd875]" />
                                                        {formatDate(ticket.showtime_info.show_date)}
                                                        {ticket.showtime_info.start_time && (
                                                            <span className="ml-2 px-2 py-1 bg-[#ffd875]/20 text-[#ffd875] rounded text-xs font-medium">
                                                                {formatTime(ticket.showtime_info.start_time) || 'Chưa có giờ'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-400 mb-1">Ghế</p>
                                                    <div className="flex items-center text-white">
                                                        <UserGroupIcon className="w-4 h-4 mr-2 text-[#ffd875]" />
                                                        {ticket.seat_info}
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-400 mb-1">Mã vé</p>
                                                    <div className="flex items-center text-white">
                                                        <TicketIcon className="w-4 h-4 mr-2 text-[#ffd875]" />
                                                        {ticket.ticket_code}
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-400 mb-1">Giá vé</p>
                                                    <div className="flex items-center text-white">
                                                        <span className="text-[#ffd875] font-medium">
                                                            {ticket.final_price ? ticket.final_price.toLocaleString('vi-VN') : '0'} ₫
                                                        </span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-400 mb-1">Ngày đặt</p>
                                                    <div className="flex items-center text-white">
                                                        <CalendarIcon className="w-4 h-4 mr-2 text-[#ffd875]" />
                                                        {formatDate(ticket.booking_date)}
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-400 mb-1">Trạng thái check-in</p>
                                                    <div className="flex items-center text-white">
                                                        {ticket.is_checked_in ? (
                                                            <span className="text-green-400 flex items-center">
                                                                <CheckCircleIcon className="w-4 h-4 mr-2" />
                                                                Đã check-in
                                                            </span>
                                                        ) : (
                                                            <span className="text-yellow-400 flex items-center">
                                                                <XCircleIcon className="w-4 h-4 mr-2" />
                                                                Chưa check-in
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-4 flex justify-end">
                                                <Link
                                                    to={`/profile/tickets/${ticket.ticket_id}`}
                                                    className="flex items-center px-4 py-2 bg-[#ffd875]/10 text-[#ffd875] rounded-lg hover:bg-[#ffd875]/20 transition-colors"
                                                >
                                                    <QrCodeIcon className="w-4 h-4 mr-2" />
                                                    Chi tiết vé
                                                </Link>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    {renderPagination()}
                </>
            ) : (
                <div className="text-center py-12">
                    <TicketIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-normal text-gray-400 mb-2">Bạn chưa có vé nào</h3>
                    <p className="text-gray-500 mb-6">Đặt vé xem phim ngay để có trải nghiệm tuyệt vời.</p>
                    <Link
                        to="/movies"
                        className="bg-[#FFD875] text-black font-bold px-6 py-3 rounded-lg hover:shadow-[0_0_20px_rgba(255,216,117,0.6)] transition-all duration-300 transform hover:scale-105 shadow-[0_0_10px_rgba(255,216,117,0.3)] inline-block"
                    >
                        Đặt vé ngay
                    </Link>
                </div>
            )}

            {/* QR Code Modal */}
            {showQrModal && selectedTicket && (
                <PayOSQRModal
                    isOpen={showQrModal}
                    onClose={() => setShowQrModal(false)}
                    bookingId={selectedTicket.Booking_ID || selectedTicket.id}
                    amount={selectedTicket.Total_Amount || selectedTicket.Payment?.Amount || 0}
                    ticketInfo={`${selectedTicket.Seat?.Row}${selectedTicket.Seat?.Number} - ${selectedTicket.Movie?.Title || 'Không xác định'}`}
                />
            )}
        </div>
    );
};

export default MyTickets; 
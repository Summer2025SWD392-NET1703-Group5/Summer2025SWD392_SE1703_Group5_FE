import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  ArrowLeftIcon,
  TicketIcon,
  CalendarDaysIcon,
  ClockIcon,
  FilmIcon,
  UserIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PrinterIcon,
  DocumentDuplicateIcon,
  XCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { getBookingById, type Booking as ApiBooking } from '../../../services/admin/bookingManagementServices';

interface BookingDetailProps {
  id: string;
  bookingCode?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  movieTitle?: string;
  moviePoster?: string;
  showtime?: string;
  cinemaName?: string;
  roomName?: string;
  seats: string[];
  status: 'completed' | 'pending' | 'cancelled' | 'refunded' | 'confirmed' | string;
  totalAmount: number;
  paymentMethod?: string;
  paymentStatus?: 'paid' | 'pending' | 'failed' | string;
  createdAt: Date;
  bookingItems?: {
    type: string;
    name: string;
    quantity: number;
    price: number;
  }[];
}

const BookingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [booking, setBooking] = useState<BookingDetailProps | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedSections, setExpandedSections] = useState<string[]>(['booking-info', 'payment-info', 'customer-info']);

  useEffect(() => {
    const initializeBooking = async () => {
      if (!id) {
        navigate('/admin/bookings');
        return;
      }

      setLoading(true);

      try {
        // Kiểm tra xem có dữ liệu từ state không
        const stateBooking = location.state?.bookingData as ApiBooking;

        if (stateBooking) {
          // Sử dụng dữ liệu từ state
          const transformedBooking: BookingDetailProps = {
            id: stateBooking.Booking_ID.toString(),
            bookingCode: `BK${stateBooking.Booking_ID.toString().padStart(6, '0')}`,
            customerName: stateBooking.CustomerName || 'N/A',
            customerEmail: stateBooking.CustomerEmail || 'N/A',
            customerPhone: stateBooking.CustomerPhone || 'N/A',
            movieTitle: stateBooking.MovieName,
            moviePoster: stateBooking.PosterURL,
            showtime: stateBooking.Show_Date,
            cinemaName: stateBooking.CinemaName || 'N/A',
            roomName: stateBooking.RoomName || 'N/A',
            seats: stateBooking.Seats ? stateBooking.Seats.split(',').map(seat => seat.trim()) : [],
            status: stateBooking.Status?.toLowerCase() || 'pending',
            totalAmount: stateBooking.Total_Amount,
            paymentMethod: stateBooking.PaymentMethod || 'N/A',
            paymentStatus: stateBooking.Status?.toLowerCase() === 'completed' ? 'paid' :
              stateBooking.Status?.toLowerCase() === 'pending' ? 'pending' : 'failed',
            createdAt: new Date(stateBooking.Booking_Date),
          };

          setBooking(transformedBooking);
          setLoading(false);
          return;
        }

        // Fallback: Gọi API (sẽ return mock data)
        console.warn('Không có dữ liệu từ state, gọi API...');
        const apiBooking = await getBookingById(id);

        // Transform API booking to component format
        const transformedBooking: BookingDetailProps = {
          id: apiBooking.Booking_ID.toString(),
          bookingCode: `BK${apiBooking.Booking_ID.toString().padStart(6, '0')}`,
          customerName: apiBooking.CustomerName || 'N/A',
          customerEmail: apiBooking.CustomerEmail || 'N/A',
          customerPhone: apiBooking.CustomerPhone || 'N/A',
          movieTitle: apiBooking.MovieName,
          moviePoster: apiBooking.PosterURL,
          showtime: apiBooking.Show_Date,
          cinemaName: apiBooking.CinemaName || 'N/A',
          roomName: apiBooking.RoomName || 'N/A',
          seats: apiBooking.Seats ? apiBooking.Seats.split(',').map(seat => seat.trim()) : [],
          status: apiBooking.Status?.toLowerCase() || 'pending',
          totalAmount: apiBooking.Total_Amount,
          paymentMethod: apiBooking.PaymentMethod || 'N/A',
          paymentStatus: apiBooking.Status?.toLowerCase() === 'completed' ? 'paid' :
            apiBooking.Status?.toLowerCase() === 'pending' ? 'pending' : 'failed',
          createdAt: new Date(apiBooking.Booking_Date),
        };

        setBooking(transformedBooking);
        toast.info('Đang hiển thị dữ liệu demo vì API không khả dụng');

      } catch (error) {
        console.error('Error initializing booking:', error);
        toast.error('Không thể tải thông tin đặt vé');
      } finally {
        setLoading(false);
      }
    };

    initializeBooking();
  }, [id, navigate, location.state]);

  const getStatusClass = (status: string) => {
    const lowerStatus = status.toLowerCase();
    switch (lowerStatus) {
      case 'completed':
      case 'complete':
      case 'confirmed':
        return 'bg-green-500 bg-opacity-20 text-green-500';
      case 'pending':
        return 'bg-blue-500 bg-opacity-20 text-blue-500';
      case 'cancelled':
      case 'canceled':
        return 'bg-red-500 bg-opacity-20 text-red-500';
      case 'refunded':
        return 'bg-orange-500 bg-opacity-20 text-orange-500';
      default:
        return 'bg-gray-500 bg-opacity-20 text-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    const lowerStatus = status.toLowerCase();
    switch (lowerStatus) {
      case 'completed':
      case 'complete':
      case 'confirmed':
        return 'Hoàn thành';
      case 'pending':
        return 'Đang xử lý';
      case 'cancelled':
      case 'canceled':
        return 'Đã hủy';
      case 'refunded':
        return 'Đã hoàn vé';
      default:
        return status;
    }
  };

  const getPaymentStatusClass = (status: string) => {
    const lowerStatus = status.toLowerCase();
    switch (lowerStatus) {
      case 'paid':
        return 'bg-green-500 bg-opacity-20 text-green-500';
      case 'pending':
        return 'bg-blue-500 bg-opacity-20 text-blue-500';
      case 'failed':
        return 'bg-red-500 bg-opacity-20 text-red-500';
      default:
        return 'bg-gray-500 bg-opacity-20 text-gray-500';
    }
  };

  const getPaymentStatusText = (status: string) => {
    const lowerStatus = status.toLowerCase();
    switch (lowerStatus) {
      case 'paid':
        return 'Đã thanh toán';
      case 'pending':
        return 'Chờ thanh toán';
      case 'failed':
        return 'Thanh toán thất bại';
      default:
        return status;
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const isExpanded = (section: string) => expandedSections.includes(section);

  const handlePrintTicket = () => {
    toast.success('Đang chuẩn bị in vé...');
    window.print();
  };

  const handleCopyBookingCode = () => {
    if (booking && booking.bookingCode) {
      navigator.clipboard.writeText(booking.bookingCode);
      toast.success('Đã sao chép mã đặt vé');
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FFD875]"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="p-6 max-w-[1600px] mx-auto">
        <div className="mb-6">
          <Link
            to="/admin/bookings"
            className="flex items-center text-gray-400 hover:text-[#FFD875] transition-colors mb-2"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            <span>Quay lại danh sách đặt vé</span>
          </Link>
          <div className="bg-slate-800 rounded-lg p-8 text-center border border-slate-700">
            <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Không tìm thấy thông tin đặt vé</h2>
            <p className="text-gray-400 mb-4">Mã đặt vé không tồn tại hoặc đã bị xóa</p>
            <Link
              to="/admin/bookings"
              className="px-4 py-2 bg-[#FFD875] text-black rounded-lg hover:bg-opacity-90 transition-colors btn-glow inline-block"
              style={{ backgroundColor: '#FFD875' }}
            >
              Quay lại danh sách
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="mb-6">
        <Link
          to="/admin/bookings"
          className="flex items-center text-gray-400 hover:text-[#FFD875] transition-colors mb-2"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-1" />
          <span>Quay lại danh sách đặt vé</span>
        </Link>
        <div className="flex flex-wrap justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Chi tiết đơn đặt vé</h1>
          <div className="flex gap-2 mt-2 sm:mt-0">
            <button
              onClick={handlePrintTicket}
              className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all flex items-center gap-1"
            >
              <PrinterIcon className="w-4 h-4" />
              <span>In vé</span>
            </button>

            <button
              onClick={handleCopyBookingCode}
              className="px-4 py-2 bg-[#FFD875] text-black rounded-lg hover:bg-opacity-90 transition-all flex items-center gap-1 btn-glow"
              style={{ backgroundColor: '#FFD875' }}
            >
              <DocumentDuplicateIcon className="w-4 h-4" />
              <span>Sao chép mã</span>
            </button>
          </div>
        </div>
      </div>

      {/* Booking Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <TicketIcon className="w-7 h-7 text-[#FFD875] mr-3" />
              <h2 className="text-xl font-semibold text-white">Thông tin đặt vé</h2>
            </div>
            <div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(booking.status)}`}>
                {getStatusText(booking.status)}
              </span>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center mb-3">
              <span className="text-gray-400 text-sm w-28">Mã đặt vé:</span>
              <span className="text-white font-medium">{booking.bookingCode}</span>
            </div>
            <div className="flex items-center mb-3">
              <span className="text-gray-400 text-sm w-28">Thời gian đặt:</span>
              <span className="text-white">
                {format(booking.createdAt, 'HH:mm - dd/MM/yyyy', { locale: vi })}
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-400 text-sm w-28">Tổng tiền:</span>
              <span className="text-white font-medium">
                {booking.totalAmount.toLocaleString('vi-VN')} đ
              </span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center mb-4">
            <UserIcon className="w-6 h-6 text-[#FFD875] mr-2" />
            <h2 className="text-lg font-semibold text-white">Thông tin khách hàng</h2>
          </div>

          <div className="mb-3">
            <div className="text-gray-400 text-sm mb-1">Họ tên:</div>
            <div className="text-white font-medium">{booking.customerName}</div>
          </div>

          <div className="mb-3">
            <div className="text-gray-400 text-sm mb-1">Email:</div>
            <div className="text-white">{booking.customerEmail}</div>
          </div>

          <div className="mb-3">
            <div className="text-gray-400 text-sm mb-1">Số điện thoại:</div>
            <div className="text-white">{booking.customerPhone}</div>
          </div>

          <div>
            <div className="text-gray-400 text-sm mb-1">Thanh toán qua:</div>
            <div className="text-white">{booking.paymentMethod || 'N/A'}</div>
          </div>
        </div>
      </div>

      {/* Movie and Showtime Details */}
      {booking.movieTitle && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
            <div className="w-full h-56 bg-slate-700">
              {booking.moviePoster ? (
                <img
                  src={booking.moviePoster}
                  alt={booking.movieTitle}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  Không có ảnh
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="text-white font-medium text-lg mb-2">{booking.movieTitle}</h3>

              <div className="flex items-center mb-2">
                <CalendarDaysIcon className="w-5 h-5 text-gray-400 mr-1" />
                <span className="text-gray-300 text-sm">
                  {booking.showtime ? format(new Date(booking.showtime), 'dd/MM/yyyy') : 'N/A'}
                </span>
              </div>

              <div className="flex items-center mb-2">
                <ClockIcon className="w-5 h-5 text-gray-400 mr-1" />
                <span className="text-gray-300 text-sm">
                  {booking.showtime ? format(new Date(booking.showtime), 'HH:mm') : 'N/A'}
                </span>
              </div>

              <div className="flex items-center mb-2">
                <BuildingOfficeIcon className="w-5 h-5 text-gray-400 mr-1" />
                <span className="text-gray-300 text-sm">{booking.cinemaName}</span>
              </div>

              <div className="flex items-center">
                <FilmIcon className="w-5 h-5 text-gray-400 mr-1" />
                <span className="text-gray-300 text-sm">{booking.roomName}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center mb-4">
              <div className="mr-3 w-6 h-6 flex items-center justify-center bg-[#FFD875] text-black rounded-full">
                <span className="font-medium">1</span>
              </div>
              <h3 className="text-white font-medium">Ghế đã chọn</h3>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {booking.seats && booking.seats.length > 0 ? (
                booking.seats.map((seat, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-slate-700 text-white rounded-md"
                  >
                    {seat}
                  </span>
                ))
              ) : (
                <span className="text-gray-400">Không có thông tin ghế</span>
              )}
            </div>

            {booking.bookingItems && booking.bookingItems.length > 0 && (
              <>
                <div className="flex items-center mb-4 mt-6">
                  <div className="mr-3 w-6 h-6 flex items-center justify-center bg-[#FFD875] text-black rounded-full">
                    <span className="font-medium">2</span>
                  </div>
                  <h3 className="text-white font-medium">Đồ ăn & Thức uống</h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-700">
                      <tr>
                        <th className="text-left text-xs font-medium text-gray-300 uppercase tracking-wider py-2 px-3">Sản phẩm</th>
                        <th className="text-center text-xs font-medium text-gray-300 uppercase tracking-wider py-2 px-3">Số lượng</th>
                        <th className="text-right text-xs font-medium text-gray-300 uppercase tracking-wider py-2 px-3">Giá</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {booking.bookingItems.filter(item => item.type === 'food').map((item, index) => (
                        <tr key={index}>
                          <td className="py-2 px-3 text-white">{item.name}</td>
                          <td className="py-2 px-3 text-center text-white">{item.quantity}</td>
                          <td className="py-2 px-3 text-right text-white">{item.price.toLocaleString('vi-VN')} đ</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingDetail; 
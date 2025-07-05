// src/pages/admin/BookingManagement.tsx
import React, { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  TicketIcon,
  EyeIcon,
  XMarkIcon,
  CheckIcon,
  ArrowPathIcon,
  QrCodeIcon,
} from '@heroicons/react/24/outline';
import { BookingWithDetails } from '../../types/booking';
import DataTable from '../../components/admin/common/DataTable';
import ConfirmDialog from '../../components/admin/common/ConfirmDialog';
import { formatDate, formatTime, formatCurrency } from '../../utils/dashboardUtils';

const BookingManagement: React.FC = () => {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<BookingWithDetails | null>(null);
  const [showBookingDetail, setShowBookingDetail] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<BookingWithDetails | null>(null);
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);

  // Mock data
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockBookings: BookingWithDetails[] = [
        {
          id: '1',
          userId: '3',
          showtimeId: '1',
          seats: [
            { id: '1', row: 'A', number: 1, type: 'standard', price: 80000 },
            { id: '2', row: 'A', number: 2, type: 'standard', price: 80000 },
          ],
          totalAmount: 160000,
          discountAmount: 16000,
          finalAmount: 144000,
          paymentMethod: 'online',
          paymentStatus: 'completed',
          bookingStatus: 'confirmed',
          bookingCode: 'BK001',
          qrCode: 'QR_BK001',
          notes: '',
          concessions: [
            { id: '1', name: 'Bắp rang bơ', quantity: 1, price: 50000, totalPrice: 50000 },
            { id: '2', name: 'Coca Cola', quantity: 2, price: 25000, totalPrice: 50000 },
          ],
          createdAt: new Date('2024-01-15T10:30:00'),
          updatedAt: new Date('2024-01-15T10:30:00'),
          usedAt: null,
          cancelledAt: null,
          refundedAt: null,
          user: {
            firstName: 'Lê',
            lastName: 'Khách Hàng',
            email: 'customer@example.com',
            phone: '+84 555 123 456',
          },
          showtime: {
            startTime: new Date('2024-01-15T14:30:00'),
            endTime: new Date('2024-01-15T17:45:00'),
            movie: {
              title: 'Avatar: The Way of Water',
              poster: '/api/placeholder/300/450',
              duration: 192,
            },
            cinema: {
              name: 'CGV Vincom Center',
              address: '72 Lê Thánh Tôn, Q1, TP.HCM',
            },
            room: {
              name: 'Phòng 1',
              roomType: 'standard',
            },
          },
        },
        {
          id: '2',
          userId: '3',
          showtimeId: '2',
          seats: [
            { id: '3', row: 'B', number: 5, type: 'vip', price: 140000 },
          ],
          totalAmount: 140000,
          discountAmount: 0,
          finalAmount: 140000,
          paymentMethod: 'card',
          paymentStatus: 'completed',
          bookingStatus: 'used',
          bookingCode: 'BK002',
          qrCode: 'QR_BK002',
          notes: 'VIP seat booking',
          concessions: [],
          createdAt: new Date('2024-01-14T16:00:00'),
          updatedAt: new Date('2024-01-14T19:30:00'),
          usedAt: new Date('2024-01-14T19:30:00'),
          cancelledAt: null,
          refundedAt: null,
          user: {
            firstName: 'Lê',
            lastName: 'Khách Hàng',
            email: 'customer@example.com',
            phone: '+84 555 123 456',
          },
          showtime: {
            startTime: new Date('2024-01-14T19:00:00'),
            endTime: new Date('2024-01-14T21:15:00'),
            movie: {
              title: 'Top Gun: Maverick',
              poster: '/api/placeholder/300/450',
              duration: 130,
            },
            cinema: {
              name: 'CGV Vincom Center',
              address: '72 Lê Thánh Tôn, Q1, TP.HCM',
            },
            room: {
              name: 'Phòng VIP',
              roomType: 'vip',
            },
          },
        },
        {
          id: '3',
          userId: '4',
          showtimeId: '1',
          seats: [
            { id: '4', row: 'C', number: 10, type: 'standard', price: 80000 },
          ],
          totalAmount: 80000,
          discountAmount: 0,
          finalAmount: 80000,
          paymentMethod: 'cash',
          paymentStatus: 'pending',
          bookingStatus: 'confirmed',
          bookingCode: 'BK003',
          qrCode: 'QR_BK003',
          notes: 'Cash payment at counter',
          concessions: [],
          createdAt: new Date('2024-01-15T09:15:00'),
          updatedAt: new Date('2024-01-15T09:15:00'),
          usedAt: null,
          cancelledAt: null,
          refundedAt: null,
          user: {
            firstName: 'Phạm',
            lastName: 'Không Hoạt Động',
            email: 'inactive@example.com',
            phone: '+84 111 222 333',
          },
          showtime: {
            startTime: new Date('2024-01-15T14:30:00'),
            endTime: new Date('2024-01-15T17:45:00'),
            movie: {
              title: 'Avatar: The Way of Water',
              poster: '/api/placeholder/300/450',
              duration: 192,
            },
            cinema: {
              name: 'CGV Vincom Center',
              address: '72 Lê Thánh Tôn, Q1, TP.HCM',
            },
            room: {
              name: 'Phòng 1',
              roomType: 'standard',
            },
          },
        },
      ];
      
      setBookings(mockBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewBooking = (booking: BookingWithDetails) => {
    setSelectedBooking(booking);
    setShowBookingDetail(true);
  };

  const handleCancelBooking = (booking: BookingWithDetails) => {
    setBookingToCancel(booking);
    setShowCancelDialog(true);
  };

  const handleMarkAsUsed = async (booking: BookingWithDetails) => {
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setBookings(prev => prev.map(b => 
        b.id === booking.id 
          ? { ...b, bookingStatus: 'used', usedAt: new Date(), updatedAt: new Date() }
          : b
      ));
    } catch (error) {
      console.error('Error marking booking as used:', error);
    } finally {
      setLoading(false);
    }
  };

  const confirmCancelBooking = async () => {
    if (bookingToCancel) {
      try {
        setLoading(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setBookings(prev => prev.map(b => 
          b.id === bookingToCancel.id 
            ? { 
                ...b, 
                bookingStatus: 'cancelled', 
                cancelledAt: new Date(), 
                updatedAt: new Date() 
              }
            : b
        ));
        setShowCancelDialog(false);
        setBookingToCancel(null);
      } catch (error) {
        console.error('Error cancelling booking:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.bookingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         `${booking.user.firstName} ${booking.user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.showtime.movie.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.bookingStatus === statusFilter;
    const matchesPaymentStatus = paymentStatusFilter === 'all' || booking.paymentStatus === paymentStatusFilter;
    
    const matchesDate = !dateFilter || 
                       formatDate(booking.createdAt) === formatDate(new Date(dateFilter));
    
    return matchesSearch && matchesStatus && matchesPaymentStatus && matchesDate;
  });

  const getBookingStatusBadge = (status: string) => {
    const statusConfig = {
      'confirmed': { label: 'Đã xác nhận', className: 'bg-blue-100 text-blue-800' },
      'used': { label: 'Đã sử dụng', className: 'bg-green-100 text-green-800' },
      'cancelled': { label: 'Đã hủy', className: 'bg-red-100 text-red-800' },
      'expired': { label: 'Hết hạn', className: 'bg-gray-100 text-gray-800' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      'pending': { label: 'Chờ thanh toán', className: 'bg-yellow-100 text-yellow-800' },
      'completed': { label: 'Đã thanh toán', className: 'bg-green-100 text-green-800' },
      'failed': { label: 'Thất bại', className: 'bg-red-100 text-red-800' },
      'refunded': { label: 'Đã hoàn tiền', className: 'bg-purple-100 text-purple-800' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const columns = [
    {
      key: 'booking',
      title: 'Đặt vé',
      render: (booking: BookingWithDetails) => (
        <div>
          <div className="font-medium text-white">{booking.bookingCode}</div>
          <div className="text-sm text-gray-400">{formatDate(booking.createdAt)}</div>
          <div className="text-xs text-gray-500">{formatTime(booking.createdAt)}</div>
        </div>
      ),
    },
    {
      key: 'customer',
      title: 'Khách hàng',
      render: (booking: BookingWithDetails) => (
        <div>
          <div className="font-medium text-white">
            {booking.user.firstName} {booking.user.lastName}
          </div>
          <div className="text-sm text-gray-400">{booking.user.email}</div>
          <div className="text-xs text-gray-500">{booking.user.phone}</div>
        </div>
      ),
    },
    {
      key: 'movie',
      title: 'Phim & Suất chiếu',
      render: (booking: BookingWithDetails) => (
        <div className="flex items-center space-x-3">
          <img
            src={booking.showtime.movie.poster}
            alt={booking.showtime.movie.title}
            className="w-12 h-16 object-cover rounded"
          />
          <div>
            <div className="font-medium text-white">{booking.showtime.movie.title}</div>
            <div className="text-sm text-gray-400">
              {formatDate(booking.showtime.startTime)} {formatTime(booking.showtime.startTime)}
            </div>
            <div className="text-xs text-gray-500">
              {booking.showtime.cinema.name} - {booking.showtime.room.name}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'seats',
      title: 'Ghế',
      render: (booking: BookingWithDetails) => (
        <div>
          <div className="text-white font-medium">
            {booking.seats.map(seat => `${seat.row}${seat.number}`).join(', ')}
          </div>
          <div className="text-sm text-gray-400">
            {booking.seats.length} ghế
          </div>
        </div>
      ),
    },
    {
      key: 'amount',
      title: 'Số tiền',
      render: (booking: BookingWithDetails) => (
        <div>
          <div className="text-white font-medium">{formatCurrency(booking.finalAmount)}</div>
          {booking.discountAmount > 0 && (
            <div className="text-sm text-green-400">
              Giảm: {formatCurrency(booking.discountAmount)}
            </div>
          )}
          <div className="text-xs text-gray-500 capitalize">{booking.paymentMethod}</div>
        </div>
      ),
    },
    {
      key: 'status',
      title: 'Trạng thái',
      render: (booking: BookingWithDetails) => (
        <div className="space-y-1">
          {getBookingStatusBadge(booking.bookingStatus)}
          {getPaymentStatusBadge(booking.paymentStatus)}
        </div>
      ),
    },
    {
      key: 'actions',
      title: 'Thao tác',
      render: (booking: BookingWithDetails) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleViewBooking(booking)}
            className="p-1 text-blue-400 hover:text-blue-300"
            title="Xem chi tiết"
          >
            <EyeIcon className="w-4 h-4" />
          </button>
          {booking.bookingStatus === 'confirmed' && (
            <button
              onClick={() => handleMarkAsUsed(booking)}
              className="p-1 text-green-400 hover:text-green-300"
              title="Đánh dấu đã sử dụng"
            >
              <CheckIcon className="w-4 h-4" />
            </button>
          )}
          {booking.bookingStatus === 'confirmed' && (
            <button
              onClick={() => handleCancelBooking(booking)}
              className="p-1 text-red-400 hover:text-red-300"
              title="Hủy vé"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Quản lý đặt vé</h1>
          <p className="text-gray-400">Quản lý các đơn đặt vé trong hệ thống</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-800 rounded-lg p-6">
          <div className="flex items-center">
            <TicketIcon className="w-8 h-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Tổng đặt vé</p>
              <p className="text-2xl font-bold text-white">{bookings.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <CheckIcon className="w-5 h-5 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Đã xác nhận</p>
              <p className="text-2xl font-bold text-white">
                {bookings.filter(b => b.bookingStatus === 'confirmed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">₫</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Doanh thu</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(
                  bookings
                    .filter(b => b.paymentStatus === 'completed')
                    .reduce((acc, b) => acc + b.finalAmount, 0)
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">%</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Tỷ lệ hủy</p>
              <p className="text-2xl font-bold text-white">
                {bookings.length > 0 
                  ? Math.round(bookings.filter(b => b.bookingStatus === 'cancelled').length / bookings.length * 100)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-800 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm đặt vé..."
              className="w-full bg-slate-700 text-white rounded-lg pl-10 pr-4 py-2 border border-slate-600 focus:border-yellow-500 focus:outline-none"
            />
          </div>

          {/* Booking Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-yellow-500 focus:outline-none"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="used">Đã sử dụng</option>
            <option value="cancelled">Đã hủy</option>
            <option value="expired">Hết hạn</option>
          </select>

          {/* Payment Status Filter */}
          <select
            value={paymentStatusFilter}
            onChange={(e) => setPaymentStatusFilter(e.target.value)}
            className="bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-yellow-500 focus:outline-none"
          >
            <option value="all">Tất cả thanh toán</option>
            <option value="pending">Chờ thanh toán</option>
            <option value="completed">Đã thanh toán</option>
            <option value="failed">Thất bại</option>
            <option value="refunded">Đã hoàn tiền</option>
          </select>

          {/* Date Filter */}
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-yellow-500 focus:outline-none"
          />

          {/* Refresh */}
          <button
            onClick={fetchBookings}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <ArrowPathIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-slate-800 rounded-lg">
        <DataTable
          data={filteredBookings}
          columns={columns}
          loading={loading}
          selectable
          selectedRows={selectedBookings}
          onSelectionChange={setSelectedBookings}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
          }}
        />
      </div>

      {/* Booking Detail Modal */}
      {showBookingDetail && selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => {
            setShowBookingDetail(false);
            setSelectedBooking(null);
          }}
        />
      )}

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={confirmCancelBooking}
        title="Xác nhận hủy vé"
        message={`Bạn có chắc chắn muốn hủy vé "${bookingToCancel?.bookingCode}"? Thao tác này không thể hoàn tác.`}
        confirmText="Hủy vé"
        cancelText="Không hủy"
        type="danger"
      />
    </div>
  );
};

// Booking Detail Modal Component
const BookingDetailModal: React.FC<{
  booking: BookingWithDetails;
  onClose: () => void;
}> = ({ booking, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Chi tiết đặt vé</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Booking Info */}
          <div className="bg-slate-700 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-white mb-3">Thông tin đặt vé</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Mã đặt vé</p>
                <p className="text-white font-medium">{booking.bookingCode}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Ngày đặt</p>
                <p className="text-white">{formatDate(booking.createdAt)} {formatTime(booking.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Trạng thái đặt vé</p>
                <div className="mt-1">{getBookingStatusBadge(booking.bookingStatus)}</div>
              </div>
              <div>
                <p className="text-sm text-gray-400">Trạng thái thanh toán</p>
                <div className="mt-1">{getPaymentStatusBadge(booking.paymentStatus)}</div>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-slate-700 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-white mb-3">Thông tin khách hàng</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Họ tên</p>
                <p className="text-white">{booking.user.firstName} {booking.user.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Email</p>
                <p className="text-white">{booking.user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Số điện thoại</p>
                <p className="text-white">{booking.user.phone}</p>
              </div>
            </div>
          </div>

          {/* Movie & Showtime Info */}
          <div className="bg-slate-700 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-white mb-3">Thông tin suất chiếu</h4>
            <div className="flex items-start space-x-4">
              <img
                src={booking.showtime.movie.poster}
                alt={booking.showtime.movie.title}
                className="w-20 h-28 object-cover rounded"
              />
              <div className="flex-1">
                <h5 className="text-white font-medium text-lg">{booking.showtime.movie.title}</h5>
                <p className="text-gray-400 text-sm mb-2">Thời lượng: {booking.showtime.movie.duration} phút</p>
                <div className="space-y-1">
                  <div>
                    <span className="text-gray-400 text-sm">Rạp: </span>
                    <span className="text-white">{booking.showtime.cinema.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">Phòng: </span>
                    <span className="text-white">{booking.showtime.room.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">Suất chiếu: </span>
                    <span className="text-white">
                      {formatDate(booking.showtime.startTime)} {formatTime(booking.showtime.startTime)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Seats Info */}
          <div className="bg-slate-700 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-white mb-3">Ghế đã chọn</h4>
            <div className="grid grid-cols-1 gap-2">
              {booking.seats.map((seat, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-slate-600 last:border-b-0">
                  <div>
                    <span className="text-white font-medium">Ghế {seat.row}{seat.number}</span>
                    <span className="ml-2 px-2 py-1 bg-slate-600 text-white rounded text-xs capitalize">
                      {seat.type}
                    </span>
                  </div>
                  <span className="text-white">{formatCurrency(seat.price)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Concessions */}
          {booking.concessions.length > 0 && (
            <div className="bg-slate-700 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-white mb-3">Đồ ăn & Thức uống</h4>
              <div className="space-y-2">
                {booking.concessions.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-slate-600 last:border-b-0">
                    <div>
                      <span className="text-white">{item.name}</span>
                      <span className="text-gray-400 text-sm ml-2">x{item.quantity}</span>
                    </div>
                    <span className="text-white">{formatCurrency(item.totalPrice)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment Summary */}
          <div className="bg-slate-700 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-white mb-3">Tóm tắt thanh toán</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Tổng tiền vé:</span>
                <span className="text-white">{formatCurrency(booking.seats.reduce((acc, seat) => acc + seat.price, 0))}</span>
              </div>
              {booking.concessions.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Đồ ăn & Thức uống:</span>
                  <span className="text-white">{formatCurrency(booking.concessions.reduce((acc, item) => acc + item.totalPrice, 0))}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-400">Tổng cộng:</span>
                <span className="text-white">{formatCurrency(booking.totalAmount)}</span>
              </div>
              {booking.discountAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Giảm giá:</span>
                  <span className="text-green-400">-{formatCurrency(booking.discountAmount)}</span>
                </div>
              )}
              <div className="border-t border-slate-600 pt-2">
                <div className="flex justify-between">
                  <span className="text-white font-semibold">Thành tiền:</span>
                  <span className="text-yellow-400 font-semibold text-lg">{formatCurrency(booking.finalAmount)}</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Phương thức thanh toán:</span>
                <span className="text-white capitalize">{booking.paymentMethod}</span>
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="bg-slate-700 rounded-lg p-4 text-center">
            <h4 className="text-lg font-semibold text-white mb-3">Mã QR</h4>
            <div className="flex items-center justify-center">
              <div className="w-32 h-32 bg-white rounded-lg flex items-center justify-center">
                <QrCodeIcon className="w-24 h-24 text-slate-800" />
              </div>
            </div>
            <p className="text-gray-400 text-sm mt-2">Quét mã QR này tại rạp để vào xem phim</p>
          </div>

          {/* Notes */}
          {booking.notes && (
            <div className="bg-slate-700 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-white mb-3">Ghi chú</h4>
              <p className="text-gray-300">{booking.notes}</p>
            </div>
          )}

          {/* Timestamps */}
          <div className="bg-slate-700 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-white mb-3">Lịch sử</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Ngày tạo:</span>
                <span className="text-white">{formatDate(booking.createdAt)} {formatTime(booking.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Cập nhật cuối:</span>
                <span className="text-white">{formatDate(booking.updatedAt)} {formatTime(booking.updatedAt)}</span>
              </div>
              {booking.usedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Ngày sử dụng:</span>
                  <span className="text-green-400">{formatDate(booking.usedAt)} {formatTime(booking.usedAt)}</span>
                </div>
              )}
              {booking.cancelledAt && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Ngày hủy:</span>
                  <span className="text-red-400">{formatDate(booking.cancelledAt)} {formatTime(booking.cancelledAt)}</span>
                </div>
              )}
              {booking.refundedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Ngày hoàn tiền:</span>
                  <span className="text-purple-400">{formatDate(booking.refundedAt)} {formatTime(booking.refundedAt)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-slate-600">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Đóng
          </button>
          {booking.bookingStatus === 'confirmed' && (
            <>
              <button
                onClick={() => {
                  // Handle mark as used
                  onClose();
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Đánh dấu đã sử dụng
              </button>
              <button
                onClick={() => {
                  // Handle cancel booking
                  onClose();
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Hủy vé
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingManagement;


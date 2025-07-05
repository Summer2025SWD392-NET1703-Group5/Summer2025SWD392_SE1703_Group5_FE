// src/pages/admin/bookings/BookingsList.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import {
  TicketIcon,
  EyeIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SparklesIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  UserIcon,
  FilmIcon
} from '@heroicons/react/24/outline';
import { getAllBookings, exportBookingsToExcel } from '../../../services/admin/bookingManagementServices';
import type { Booking, PaginatedResponse } from '../../../services/admin/bookingManagementServices';

const BookingsList: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 10;

  // Fetch bookings from API
  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAllBookings(page, limit, searchTerm, statusFilter);

      if (response) {
        setBookings(response.data);
        setTotalItems(response.totalItems);
        setTotalPages(response.totalPages);
      } else {
        setError('Không nhận được phản hồi từ server');
        setBookings([]);
        setTotalItems(0);
        setTotalPages(1);
      }
    } catch (err) {
      setError('Đã xảy ra lỗi khi tải dữ liệu đặt vé');
      console.error('Error fetching bookings:', err);
      setBookings([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Export bookings to Excel
  const handleExportExcel = async () => {
    try {
      await exportBookingsToExcel(searchTerm, statusFilter);
    } catch (err) {
      setError('Đã xảy ra lỗi khi xuất file Excel');
      console.error('Error exporting to Excel:', err);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchBookings();
  };

  // Handle pagination
  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  // Generate page numbers for pagination
  const generatePageNumbers = () => {
    // If total pages is small, show all pages
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Otherwise, show a window around current page
    let startPage = Math.max(1, page - 2);
    let endPage = Math.min(totalPages, startPage + 4);

    // Adjust start if we're near the end
    if (endPage === totalPages) {
      startPage = Math.max(1, endPage - 4);
    }

    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  };

  // Fetch data on initial load and when filters or pagination change
  useEffect(() => {
    fetchBookings();
  }, [page, statusFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1); // Reset to first page when search changes
      fetchBookings();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const getStatusClass = (status: string | null | undefined) => {
    if (!status) return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';

    const lowerCaseStatus = status.toLowerCase();
    switch (lowerCaseStatus) {
      case 'completed':
      case 'complete':
      case 'confirmed':
        return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.3)]';
      case 'pending':
        return 'bg-[#FFD875]/20 text-[#FFD875] border border-[#FFD875]/30 shadow-[0_0_10px_rgba(255,216,117,0.3)]';
      case 'cancelled':
      case 'canceled':
        return 'bg-red-500/20 text-red-400 border border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.3)]';
      case 'refunded':
        return 'bg-orange-500/20 text-orange-400 border border-orange-500/30 shadow-[0_0_10px_rgba(249,115,22,0.3)]';
      default:
        return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    }
  };

  const formatShowtime = (booking: Booking) => {
    try {
      if (!booking.Show_Date) {
        return 'N/A';
      }

      // If we have both date and time
      if (booking.Start_Time && booking.Start_Time !== 'Invalid Date') {
        // Check if Start_Time already includes the date
        if (booking.Start_Time.includes('T')) {
          return format(new Date(booking.Start_Time), 'dd/MM/yyyy HH:mm');
        }

        // Otherwise combine date and time
        const dateTimeString = `${booking.Show_Date.split('T')[0]}T${booking.Start_Time}`;
        const showtimeDate = new Date(dateTimeString);

        if (!isNaN(showtimeDate.getTime())) {
          return format(showtimeDate, 'dd/MM/yyyy HH:mm');
        }
      }

      // Fallback to just the date
      return format(new Date(booking.Show_Date), 'dd/MM/yyyy');
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'Không hợp lệ';
    }
  };

  const getStatusLabel = (status: string | null | undefined) => {
    if (!status) return 'N/A';

    const lowerCaseStatus = status.toLowerCase();
    switch (lowerCaseStatus) {
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <motion.div
      className="p-6 max-w-[1600px] mx-auto bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Section */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden bg-gradient-to-r from-slate-800/80 via-slate-700/80 to-slate-800/80 backdrop-blur-md rounded-3xl p-8 mb-8 border border-[#FFD875]/20 shadow-[0_0_50px_rgba(255,216,117,0.15)]"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#FFD875]/5 via-transparent to-[#FFD875]/5 animate-pulse"></div>
        <div className="relative z-10 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-[#FFD875]/20 rounded-2xl backdrop-blur-sm">
              <TicketIcon className="w-8 h-8 text-[#FFD875]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#FFD875] via-[#FFC107] to-[#FFD875] bg-clip-text text-transparent">
                Quản lý đặt vé
              </h1>
              <p className="text-slate-300 mt-1">Theo dõi và quản lý tất cả đơn đặt vé</p>
            </div>
          </div>

          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-slate-700/80 text-white rounded-xl hover:bg-slate-600/80 transition-all duration-300 flex items-center gap-2 border border-slate-600/50 hover:border-slate-500/50 shadow-lg"
              onClick={handleRefresh}
            >
              <ArrowPathIcon className="w-5 h-5" />
              <span>Làm mới</span>
            </motion.button>

            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: "0 0 30px rgba(255,216,117,0.4)"
              }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-gradient-to-r from-[#FFD875] to-[#FFC107] text-black rounded-xl hover:from-[#FFC107] hover:to-[#FFD875] transition-all duration-300 flex items-center gap-2 font-semibold shadow-[0_0_20px_rgba(255,216,117,0.3)]"
              onClick={handleExportExcel}
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
              <span>Xuất Excel</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Search and Filter Section */}
      <motion.div
        variants={itemVariants}
        className="bg-gradient-to-r from-slate-800/50 via-slate-700/50 to-slate-800/50 backdrop-blur-md rounded-2xl p-6 mb-8 border border-slate-600/30 shadow-xl"
      >
        <div className="flex flex-wrap gap-6 items-center">
          <div className="flex-1 min-w-[300px]">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-[#FFD875] group-focus-within:text-[#FFC107] transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Tìm theo mã vé, tên khách hàng hoặc phim..."
                className="w-full bg-slate-700/80 text-white pl-12 pr-4 py-3 rounded-xl border border-slate-600/50 focus:border-[#FFD875] focus:outline-none focus:ring-2 focus:ring-[#FFD875]/20 transition-all duration-300 placeholder-slate-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <FunnelIcon className="h-5 w-5 text-[#FFD875] mr-2" />
              <span className="text-slate-300 mr-3 font-medium">Trạng thái:</span>
            </div>
            <select
              className="bg-slate-700/80 text-white px-4 py-3 rounded-xl border border-slate-600/50 focus:border-[#FFD875] focus:outline-none focus:ring-2 focus:ring-[#FFD875]/20 transition-all duration-300"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tất cả</option>
              <option value="completed">Hoàn thành</option>
              <option value="pending">Đang xử lý</option>
              <option value="cancelled">Đã hủy</option>
              <option value="refunded">Đã hoàn vé</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/20 text-red-400 p-4 rounded-xl mb-6 border border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
        >
          {error}
        </motion.div>
      )}

      {/* Enhanced Bookings Table */}
      <motion.div
        variants={itemVariants}
        className="bg-gradient-to-br from-slate-800/80 via-slate-700/80 to-slate-800/80 backdrop-blur-md rounded-2xl overflow-hidden border border-slate-600/30 shadow-2xl"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gradient-to-r from-slate-700/80 to-slate-600/80 backdrop-blur-sm">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#FFD875] uppercase tracking-wider border-b border-slate-600/30">
                  <div className="flex items-center space-x-2">
                    <TicketIcon className="w-4 h-4" />
                    <span>Mã vé</span>
                  </div>
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#FFD875] uppercase tracking-wider border-b border-slate-600/30">
                  <div className="flex items-center space-x-2">
                    <UserIcon className="w-4 h-4" />
                    <span>Khách hàng</span>
                  </div>
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#FFD875] uppercase tracking-wider border-b border-slate-600/30">
                  <div className="flex items-center space-x-2">
                    <FilmIcon className="w-4 h-4" />
                    <span>Phim</span>
                  </div>
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#FFD875] uppercase tracking-wider border-b border-slate-600/30">
                  <div className="flex items-center space-x-2">
                    <CalendarDaysIcon className="w-4 h-4" />
                    <span>Ngày chiếu</span>
                  </div>
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#FFD875] uppercase tracking-wider border-b border-slate-600/30">
                  Ghế
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#FFD875] uppercase tracking-wider border-b border-slate-600/30">
                  <div className="flex items-center space-x-2">
                    <CurrencyDollarIcon className="w-4 h-4" />
                    <span>Tổng tiền</span>
                  </div>
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#FFD875] uppercase tracking-wider border-b border-slate-600/30">
                  Trạng thái
                </th>
                <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-[#FFD875] uppercase tracking-wider border-b border-slate-600/30">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-600/30">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="relative">
                        <ArrowPathIcon className="h-8 w-8 text-[#FFD875] animate-spin" />
                        <div className="absolute inset-0 h-8 w-8 bg-[#FFD875]/20 rounded-full animate-ping"></div>
                      </div>
                      <div className="text-slate-300 font-medium">Đang tải dữ liệu...</div>
                    </div>
                  </td>
                </tr>
              ) : bookings && bookings.length > 0 ? (
                bookings.map((booking, index) => (
                  <motion.tr
                    key={booking.Booking_ID}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-slate-600/20 transition-all duration-300 group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="p-2 bg-[#FFD875]/10 rounded-lg mr-3 group-hover:bg-[#FFD875]/20 transition-colors">
                          <TicketIcon className="h-5 w-5 text-[#FFD875]" />
                        </div>
                        <span className="text-white font-semibold">{booking.Booking_ID}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-white font-medium">{booking.CustomerName || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-white font-medium">{booking.MovieName || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-slate-300">{formatShowtime(booking)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-slate-300">{booking.Seats || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-[#FFD875] font-bold">
                        {booking.Total_Amount ? booking.Total_Amount.toLocaleString('vi-VN') + ' đ' : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1.5 inline-flex text-xs font-bold rounded-full ${getStatusClass(booking.Status)}`}>
                        {getStatusLabel(booking.Status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Link
                          to={`/admin/bookings/${booking.Booking_ID}`}
                          state={{ bookingData: booking }}
                          className="inline-flex items-center justify-center w-10 h-10 bg-[#FFD875]/20 text-[#FFD875] rounded-xl hover:bg-[#FFD875]/30 hover:text-[#FFC107] transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,216,117,0.4)]"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </Link>
                      </motion.div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="p-4 bg-slate-700/50 rounded-full">
                        <TicketIcon className="h-12 w-12 text-slate-400" />
                      </div>
                      <div className="text-slate-400 text-lg font-medium">Không tìm thấy đơn đặt vé nào</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Enhanced Pagination */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-slate-600/30 bg-slate-700/30">
          <div className="flex items-center space-x-2">
            <SparklesIcon className="w-5 h-5 text-[#FFD875]" />
            <span className="text-sm text-slate-300">
              Hiển thị <span className="font-bold text-[#FFD875]">{bookings ? bookings.length : 0}</span> trong tổng số <span className="font-bold text-[#FFD875]">{totalItems}</span> đơn
            </span>
          </div>

          {totalPages > 1 && (
            <div className="flex gap-2 items-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-xl bg-slate-600/50 text-white hover:bg-slate-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-500/30"
                onClick={handlePreviousPage}
                disabled={page === 1 || loading}
                title="Trang trước"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </motion.button>

              {generatePageNumbers().map((pageNum) => (
                <motion.button
                  key={pageNum}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`min-w-[2.5rem] h-10 rounded-xl transition-all duration-300 font-semibold ${pageNum === page
                    ? 'bg-gradient-to-r from-[#FFD875] to-[#FFC107] text-black shadow-[0_0_15px_rgba(255,216,117,0.4)]'
                    : 'bg-slate-600/50 text-white hover:bg-slate-500/50 border border-slate-500/30'
                    }`}
                  onClick={() => setPage(pageNum)}
                  disabled={loading}
                >
                  {pageNum}
                </motion.button>
              ))}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-xl bg-slate-600/50 text-white hover:bg-slate-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-500/30"
                onClick={handleNextPage}
                disabled={page === totalPages || loading}
                title="Trang sau"
              >
                <ChevronRightIcon className="h-5 w-5" />
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BookingsList;

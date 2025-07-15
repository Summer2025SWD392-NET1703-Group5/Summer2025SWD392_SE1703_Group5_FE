import React, { useState, useEffect, useCallback, useRef } from "react";
import { userService } from "../../services/userService";
import type { Booking } from "../../types/booking";
import PayOSQRModal from "../../components/PayOSQRModal";
import CountdownTimer from "../../components/CountdownTimer";
import UnifiedCountdownTimer from "../../components/UnifiedCountdownTimer";
import {
  MapPinIcon,
  ClockIcon,
  TicketIcon,
  TagIcon,
  CalendarIcon,
  FilmIcon,
  VideoCameraIcon,
  CurrencyDollarIcon,
  XCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";
import api from "../../services/apiClient";
import { useSyncCountdownFromServer } from "../../hooks/useCountdown";

const ITEMS_PER_PAGE = 3; // Show 3 bookings per page

const BookingHistory: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // PayOS QR Modal states
  const [showPayOSModal, setShowPayOSModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string>("");

  // Thêm state cho modal QR
  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Thêm state quản lý modal xác nhận
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<number | null>(null);

  // 🔧 FIX: Sử dụng countdown service để đồng bộ timer
  const { syncBookingTimer } = useSyncCountdownFromServer();

  const fetchBookingHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const history = await userService.getBookingHistory();
      // Ensure history is always an array
      const bookingsArray = Array.isArray(history) ? history : [];

      // 🔄 Đồng bộ countdown timer cho các booking đang chờ thanh toán
      bookingsArray.forEach(booking => {
        if (booking.Status === 'Pending') {
          console.log(`🔍 [BookingHistory] Debug booking ${booking.Booking_ID}:`);
          console.log(`  - Booking_Date: ${booking.Booking_Date}`);
          console.log(`  - Showtime_ID: ${booking.Showtime_ID}`);

          const isValid = syncBookingTimer(
            booking.Booking_ID,
            booking.Booking_Date,
            booking.Showtime_ID
          );

          if (!isValid) {
            console.log(`⏰ Booking ${booking.Booking_ID} đã hết hạn, sẽ được refresh`);
            // Có thể trigger refresh lại sau một khoảng thời gian ngắn
            setTimeout(() => {
              fetchBookingHistory();
            }, 1000);
          }
        }
      });

      setBookings(bookingsArray);
      setTotalPages(Math.ceil(bookingsArray.length / ITEMS_PER_PAGE));
    } catch (err: any) {
      setError(err.message || "Không thể tải lịch sử đặt vé.");
      setBookings([]); // Reset to empty array on error
    } finally {
      setIsLoading(false);
    }
  }, [syncBookingTimer]);

  useEffect(() => {
    fetchBookingHistory();
  }, [fetchBookingHistory]);

  useEffect(() => {
    // Scroll to top when page changes
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentPage]);

  // Thay đổi hàm handleCancelBooking để mở modal xác nhận trước
  const handleCancelBooking = (bookingId: number) => {
    setBookingToCancel(bookingId);
    setShowConfirmModal(true);
  };

  // Hàm xử lý xác nhận hủy vé
  const confirmCancelBooking = async () => {
    if (!bookingToCancel) return;

    try {
      await userService.cancelBooking(bookingToCancel);

      // 🔧 FIX: Clear payment state để tránh vào lại phim vẫn thấy payment page
      console.log(`🗑️ [CANCEL_BOOKING] Clearing payment state for cancelled booking ${bookingToCancel}`);

      // Tìm booking đã cancel để lấy showtime ID
      const cancelledBooking = bookings.find((b) => b.Booking_ID === bookingToCancel);

      // 🔍 DEBUG: Log booking structure để hiểu cấu trúc dữ liệu
      console.log(`🔍 [CANCEL_BOOKING] Cancelled booking structure:`, cancelledBooking);
      console.log(`🔍 [CANCEL_BOOKING] Available keys:`, cancelledBooking ? Object.keys(cancelledBooking) : 'No booking found');

      // 🔧 ENHANCED: Try multiple ways to get showtimeId
      let showtimeId = null;
      if (cancelledBooking) {
        // Method 1: From nested Showtime object
        if (cancelledBooking.Showtime?.Showtime_ID) {
          showtimeId = cancelledBooking.Showtime.Showtime_ID;
          console.log(`🔍 [CANCEL_BOOKING] Got showtimeId from Showtime.Showtime_ID: ${showtimeId}`);
        }
        // Method 2: Direct Showtime_ID field
        else if (cancelledBooking.Showtime_ID) {
          showtimeId = cancelledBooking.Showtime_ID;
          console.log(`🔍 [CANCEL_BOOKING] Got showtimeId from Showtime_ID: ${showtimeId}`);
        }
        // Method 3: From any field containing showtime
        else {
          const possibleFields = ['showtimeId', 'showtime_id', 'ShowtimeId'];
          for (const field of possibleFields) {
            if (cancelledBooking[field]) {
              showtimeId = cancelledBooking[field];
              console.log(`🔍 [CANCEL_BOOKING] Got showtimeId from ${field}: ${showtimeId}`);
              break;
            }
          }
        }
      }

      // 🚨 FALLBACK: If no showtimeId found, clear all payment states
      if (!showtimeId) {
        console.warn(`⚠️ [CANCEL_BOOKING] No showtimeId found for booking ${bookingToCancel}, clearing all payment states`);

        // Clear all payment_state_* keys from sessionStorage
        const allSessionKeys = Object.keys(sessionStorage);
        const paymentStateKeys = allSessionKeys.filter(key => key.startsWith('payment_state_'));

        paymentStateKeys.forEach(key => {
          sessionStorage.removeItem(key);
          localStorage.removeItem(key);
          console.log(`🗑️ [CANCEL_BOOKING] Cleared fallback payment state: ${key}`);
        });

        // Also clear common session keys
        const commonKeys = ['bookingData', 'has_pending_booking'];
        commonKeys.forEach(key => {
          sessionStorage.removeItem(key);
          localStorage.removeItem(key);
          console.log(`🗑️ [CANCEL_BOOKING] Cleared fallback session: ${key}`);
        });
      }

      if (showtimeId) {

        // 🔧 ENHANCED: Clear payment state với multiple attempts và delay để đảm bảo
        const clearPaymentStateCompletely = () => {
          const paymentStateKey = `payment_state_${showtimeId}`;

          // Clear multiple times với delay để đảm bảo
          for (let i = 0; i < 5; i++) {
            setTimeout(() => {
              sessionStorage.removeItem(paymentStateKey);
              localStorage.removeItem(paymentStateKey);
              console.log(`🗑️ [CANCEL_BOOKING] Attempt ${i + 1}: Cleared payment state: ${paymentStateKey}`);
            }, i * 50); // Delay 50ms giữa mỗi lần clear
          }
        };

        clearPaymentStateCompletely();

        // Clear các session storage khác liên quan với delay
        const sessionKeys = [
          `booking_session_${showtimeId}`,
          `galaxy_cinema_session_${showtimeId}`,
          "bookingData",
          "has_pending_booking"
        ];

        sessionKeys.forEach((key, index) => {
          // Clear ngay lập tức
          sessionStorage.removeItem(key);
          localStorage.removeItem(key);

          // Clear lại sau delay để đảm bảo
          setTimeout(() => {
            sessionStorage.removeItem(key);
            localStorage.removeItem(key);
            console.log(`🗑️ [CANCEL_BOOKING] Delayed clear session: ${key}`);
          }, (index + 1) * 100);
        });

        // 🔧 ENHANCED: Multiple broadcast events với delay để đảm bảo
        const broadcastCancelEvent = () => {
          try {
            const cancelEvent = {
              action: 'BOOKING_CANCELLED',
              bookingId: bookingToCancel,
              showtimeId: showtimeId,
              timestamp: Date.now(),
              source: 'booking_history_cancel'
            };

            // Broadcast ngay lập tức
            localStorage.setItem('galaxy_cinema_cancel_event', JSON.stringify(cancelEvent));
            setTimeout(() => localStorage.removeItem('galaxy_cinema_cancel_event'), 100);

            // Broadcast lại sau 200ms để đảm bảo
            setTimeout(() => {
              localStorage.setItem('galaxy_cinema_cancel_event', JSON.stringify({
                ...cancelEvent,
                timestamp: Date.now(),
                retry: true
              }));
              setTimeout(() => localStorage.removeItem('galaxy_cinema_cancel_event'), 100);
            }, 200);

            console.log(`📡 [CANCEL_BOOKING] Broadcasted cancel event for booking ${bookingToCancel}`);
          } catch (error) {
            console.warn('⚠️ [CANCEL_BOOKING] Failed to broadcast cancel event:', error);
          }
        };

        const broadcastCleanupEvent = () => {
          try {
            const cleanupEvent = {
              action: "CLEAR_PAYMENT_STATE",
              showtimeId: showtimeId,
              timestamp: Date.now(),
              source: "booking_history_cancel",
            };

            // Broadcast ngay lập tức
            localStorage.setItem("galaxy_cinema_cleanup_event", JSON.stringify(cleanupEvent));
            setTimeout(() => localStorage.removeItem("galaxy_cinema_cleanup_event"), 100);

            // Broadcast lại sau 300ms để đảm bảo
            setTimeout(() => {
              localStorage.setItem("galaxy_cinema_cleanup_event", JSON.stringify({
                ...cleanupEvent,
                timestamp: Date.now(),
                retry: true
              }));
              setTimeout(() => localStorage.removeItem("galaxy_cinema_cleanup_event"), 100);
            }, 300);

            console.log(`📡 [CANCEL_BOOKING] Broadcasted cleanup event for showtime ${showtimeId}`);
          } catch (broadcastError) {
            console.warn("⚠️ [CANCEL_BOOKING] Failed to broadcast cleanup event:", broadcastError);
          }
        };

        // Execute broadcasts
        broadcastCancelEvent();
        broadcastCleanupEvent();
      }

      // Refresh danh sách sau khi hủy
      fetchBookingHistory();
      toast.success("Đã hủy vé thành công");
    } catch (err: any) {
      setError(err.message || "Hủy vé không thành công.");
      toast.error("Không thể hủy vé. Vui lòng thử lại sau.");
    } finally {
      // Đóng modal xác nhận
      setShowConfirmModal(false);
      setBookingToCancel(null);
    }
  };

  // Hàm mở modal và hiển thị QR thanh toán
  const handleShowPaymentQR = async (booking: Booking) => {
    try {
      const bookingId = booking.Booking_ID?.toString() || "";
      setSelectedBookingId(bookingId);

      // Thêm log để debug
      console.log(`Mở QR thanh toán cho booking #${booking.Booking_ID} với số tiền ${booking.Total_Amount}đ`);

      // Sử dụng API pending-payment-url để lấy QR code
      const response = await api.get("/payos/pending-payment-url");
      const responseData = response.data?.data || response.data;

      // Nếu lấy được QR code từ API, hiển thị modal
      if (responseData) {
        // Lưu thông tin booking để hiển thị trong modal
        setSelectedBooking(booking);

        // Mở modal
        setShowQrModal(true);
      } else {
        throw new Error("Không lấy được thông tin thanh toán từ server");
      }
    } catch (error: any) {
      toast.error("Không thể tạo mã QR thanh toán. Vui lòng thử lại sau.");
    }
  };

  // Xử lý khi thanh toán thành công
  const handlePaymentSuccess = (transactionId: string) => {
    setShowPayOSModal(false);
    setSelectedBookingId("");

    // Refresh booking history to update status
    fetchBookingHistory();
  };

  // Xử lý khi countdown timer hết hạn
  const handleBookingTimeout = async (bookingId: number) => {
    console.log(`Xử lý timeout cho booking ${bookingId}`);

    try {
      // Gọi API để hủy booking
      await api.put(`/bookings/${bookingId}/cancel`, {
        reason: "payment_timeout",
      });

      toast.error(`Đơn đặt vé #${bookingId} đã hết hạn thanh toán và được hủy tự động.`);

      // Refresh booking history để cập nhật trạng thái
      fetchBookingHistory();
    } catch (error: any) {
      console.error(`Lỗi khi hủy booking ${bookingId}:`, error);

      // Vẫn refresh để kiểm tra trạng thái từ server
      fetchBookingHistory();

      toast.error(`Đơn đặt vé #${bookingId} đã hết hạn thanh toán.`);
    }
  };

  // Đóng PayOS modal
  const closePayOSModal = () => {
    setShowPayOSModal(false);
    setSelectedBookingId("");
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Get current items - Add safety check
  const paginatedBookings = Array.isArray(bookings)
    ? bookings.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
    : [];

  // Render pagination
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex justify-center mt-6 space-x-2">
        <button
          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`p-2 rounded-lg ${
            currentPage === 1
              ? "bg-gray-700 text-gray-500 cursor-not-allowed"
              : "bg-slate-700 text-white hover:bg-slate-600"
          }`}
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
                className={`w-10 h-10 rounded-lg ${
                  isCurrentPage
                    ? "bg-[#FFD875] text-slate-900 shadow-[0_0_10px_rgba(255,216,117,0.5)]"
                    : "bg-slate-700 text-white hover:bg-slate-600"
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
            return (
              <span key={pageNumber} className="flex items-center justify-center w-10 h-10">
                ...
              </span>
            );
          }

          return null;
        })}

        <button
          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={`p-2 rounded-lg ${
            currentPage === totalPages
              ? "bg-gray-700 text-gray-500 cursor-not-allowed"
              : "bg-slate-700 text-white hover:bg-slate-600"
          }`}
        >
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>
    );
  };

  if (isLoading) {
    return <div className="text-center text-gray-400">Đang tải lịch sử đặt vé...</div>;
  }

  if (error) {
    return <div className="text-center text-red-400 bg-red-500/10 p-4 rounded-lg">{error}</div>;
  }

  if (!Array.isArray(bookings) || bookings.length === 0) {
    return <div className="text-center text-gray-500">Bạn chưa có lịch sử đặt vé nào.</div>;
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return "N/A";
      return new Date(dateString).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const formatDateTime = (dateString: string, timeString: string) => {
    try {
      if (!dateString) {
        return {
          date: "N/A",
          time: timeString || "N/A",
        };
      }

      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return {
          date: "Invalid Date",
          time: timeString || "N/A",
        };
      }

      return {
        date: date.toLocaleDateString("vi-VN", {
          weekday: "short",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
        time: timeString || "N/A",
      };
    } catch (error) {
      return {
        date: "Invalid Date",
        time: timeString || "N/A",
      };
    }
  };

  const getStatusChip = (status: string) => {
    const statusText = translateStatus(status);
    switch (status) {
      case "Confirmed":
        return "bg-[#FFD875]/20 text-[#FFD875] shadow-[0_0_10px_rgba(255,216,117,0.3)]";
      case "Pending":
        return "bg-yellow-500/20 text-yellow-400";
      case "Cancelled":
        return "bg-red-500/20 text-red-400";
      case "Unknown":
        return "bg-gray-500/20 text-gray-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const translateStatus = (status: string) => {
    switch (status) {
      case "Confirmed":
        return "Đã xác nhận";
      case "Pending":
        return "Đang chờ";
      case "Cancelled":
        return "Đã hủy";
      case "Unknown":
        return "Không xác định";
      default:
        return status || "Không xác định";
    }
  };

  return (
    <div className="animate-fadeInUp space-y-6" ref={containerRef}>
      <h2 className="text-2xl font-normal text-white mb-6">Lịch sử đặt vé</h2>
      {paginatedBookings.map((booking) => {
        const showDateTime = formatDateTime(booking.Show_Date || "", booking.Start_Time || "");
        const isPendingPayment = booking.Status === "Pending";
        const canCancel = booking.Status === "Pending" && booking.Booking_ID;

        return (
          <div
            key={booking.Booking_ID || Math.random()}
            className="glass-dark-card p-5 border border-gray-700/50 rounded-lg shadow-lg hover:shadow-[0_0_15px_rgba(255,216,117,0.2)] transition-shadow duration-300"
          >
            <div className="flex flex-col md:flex-row gap-5">
              <img
                src={booking.PosterURL || "/placeholder-movie.jpg"}
                alt={booking.MovieName || "Movie"}
                className="w-full md:w-32 h-auto object-cover rounded-md bg-gray-800"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder-movie.jpg";
                }}
              />
              <div className="flex-grow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-[#FFD875]">{booking.MovieName || "Unknown Movie"}</h3>
                    <p className="text-sm text-gray-400 flex items-center gap-2 mt-1">
                      <MapPinIcon className="w-4 h-4" /> {booking.RoomName || "Unknown Room"}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusChip(
                        booking.Status || "Unknown"
                      )}`}
                    >
                      {translateStatus(booking.Status || "Unknown")}
                    </span>

                    {/* Countdown Timer cho booking đang chờ thanh toán */}
                    {isPendingPayment && (
                      <UnifiedCountdownTimer
                        bookingId={booking.Booking_ID}
                        showtimeId={booking.Showtime_ID}
                        createdAt={booking.Booking_Date}
                        onTimeout={() => handleBookingTimeout(booking.Booking_ID)}
                        className="text-xs"
                      />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4 text-sm text-gray-300">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-[#FFD875]" />
                    <div>
                      <p className="font-semibold">Ngày chiếu</p>
                      <p>{showDateTime.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-5 h-5 text-[#FFD875]" />
                    <div>
                      <p className="font-semibold">Giờ chiếu</p>
                      <p>{showDateTime.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TicketIcon className="w-5 h-5 text-[#FFD875]" />
                    <div>
                      <p className="font-semibold">Ghế</p>
                      <p>{booking.Seats || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TagIcon className="w-5 h-5 text-[#FFD875]" />
                    <div>
                      <p className="font-semibold">Phương thức</p>
                      <p>{booking.PaymentMethod || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CurrencyDollarIcon className="w-5 h-5 text-[#FFD875]" />
                    <div>
                      <p className="font-semibold">Tổng tiền</p>
                      <p className="text-[#FFD875]">{formatPrice(booking.Total_Amount || 0)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons - chỉ hiển thị khi booking chưa bị hủy và có Booking_ID */}
            {canCancel && (
              <div className="mt-4 pt-4 border-t border-gray-700/50 flex justify-end gap-3">
                {/* Nút thanh toán - chỉ hiển thị cho booking đang chờ thanh toán */}
                {isPendingPayment && (
                  <button
                    onClick={() => handleShowPaymentQR(booking)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#FFD875] to-[#E6B840] text-slate-900 rounded-lg hover:shadow-[0_0_15px_rgba(255,216,117,0.3)] transition-all duration-300 font-medium"
                  >
                    <CreditCardIcon className="w-5 h-5" />
                    Thanh toán
                  </button>
                )}

                {/* Nút hủy */}
                <button
                  onClick={() => handleCancelBooking(booking.Booking_ID)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg hover:bg-red-500/20 transition-colors"
                >
                  <XCircleIcon className="w-5 h-5" />
                  Hủy đặt vé
                </button>
              </div>
            )}
          </div>
        );
      })}

      {/* Pagination */}
      {renderPagination()}

      {/* PayOS QR Modal */}
      <PayOSQRModal
        isOpen={showPayOSModal}
        onClose={closePayOSModal}
        bookingId={selectedBookingId}
        onPaymentSuccess={handlePaymentSuccess}
        isStaff={false} // BookingHistory là cho user thường
      />

      {/* Thêm modal QR thanh toán */}
      {showQrModal && selectedBooking && (
        <PayOSQRModal
          isOpen={showQrModal}
          onClose={() => setShowQrModal(false)}
          bookingId={selectedBooking.Booking_ID.toString()}
          amount={Number(selectedBooking.Total_Amount)}
          ticketInfo={`${selectedBooking.Seats?.length || 0} ghế`}
          skipConfirmation={true}
          isStaff={false} // BookingHistory là cho user thường
        />
      )}

      {/* Modal xác nhận khi hủy vé */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-slate-800 p-6 rounded-xl max-w-md w-full border border-gray-700/50 shadow-lg m-4 relative">
            <h3 className="text-xl font-medium text-white mb-4">Xác nhận hủy vé</h3>
            <p className="text-gray-300 mb-6">Bạn có chắc chắn muốn hủy đặt vé này không?</p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={confirmCancelBooking}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Xác nhận hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingHistory;
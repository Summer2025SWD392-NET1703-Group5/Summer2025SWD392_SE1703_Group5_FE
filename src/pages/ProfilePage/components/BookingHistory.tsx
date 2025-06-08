import React, { useState, useEffect } from "react";
import api from "../../../config/axios"; // Assuming correct path
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { PuffLoader } from "react-spinners";
import {
  Calendar,
  Clock,
  Armchair,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock4,
  Film,
  Building,
  CreditCard,
  Receipt,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import "./BookingHistory.css"; // Import the updated CSS

// Định nghĩa kiểu dữ liệu Booking
interface Booking {
  Booking_ID: number;
  Booking_Date: string;
  Payment_Deadline: string;
  Total_Amount: number;
  Status: string;
  Seats: string | null;
  MovieName: string;
  RoomName: string;
  Show_Date: string;
  Start_Time: string;
  PaymentMethod: string | null;
  PosterURL: string | null;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

// --- Helper functions ---
const formatDateTime = (isoString: string): string => {
  try {
    return format(new Date(isoString), "dd/MM/yyyy HH:mm", { locale: vi });
  } catch (e) {
    console.error("Error formatting date time:", e);
    return "N/A";
  }
};

const formatDate = (dateString: string): string => {
  try {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: vi });
  } catch (e) {
    console.error("Error formatting date:", e);
    return "N/A";
  }
};

const formatTime = (timeString: string): string => {
  try {
    const date = new Date(timeString);
    if (!isNaN(date.getTime())) {
      return format(date, "HH:mm", { locale: vi });
    }
    const timeParts = timeString.split(":");
    if (timeParts.length >= 2) {
      const hours = parseInt(timeParts[0], 10);
      const minutes = parseInt(timeParts[1], 10);
      if (!isNaN(hours) && !isNaN(minutes)) {
        const today = new Date();
        today.setHours(hours, minutes, 0, 0);
        return format(today, "HH:mm", { locale: vi });
      }
    }
    console.warn("Could not parse time string:", timeString);
    return "N/A";
  } catch (e) {
    console.error("Error formatting time:", e);
    return "N/A";
  }
};

const getStatusInfo = (
  status: string
): { text: string; className: string; Icon: React.ElementType } => {
  switch (status?.toLowerCase()) {
    case "confirmed":
      return {
        text: "Đã xác nhận",
        className: "status-confirmed",
        Icon: CheckCircle,
      };
    case "pending":
      return {
        text: "Chờ thanh toán",
        className: "status-pending",
        Icon: Clock4,
      };
    case "cancelled":
      return { text: "Đã hủy", className: "status-cancelled", Icon: XCircle };
    case "expired":
      return {
        text: "Hết hạn",
        className: "status-expired",
        Icon: AlertCircle,
      };
    default:
      return {
        text: status || "Không xác định",
        className: "status-other",
        Icon: AlertCircle,
      };
  }
};

const formatSeats = (seats: string | null): string => {
  if (!seats || seats.toLowerCase().includes("đang tải")) {
    return "Chưa có thông tin";
  }
  return seats;
};

// --- Component Chính ---
const BookingHistory: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 4; 

  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Vui lòng đăng nhập để xem lịch sử đặt vé.");
          setIsLoading(false);
          return;
        }
        const response = await api.get("/bookings/my-bookings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const sortedBookings = response.data.sort(
          (a: Booking, b: Booking) =>
            new Date(b.Booking_Date).getTime() -
            new Date(a.Booking_Date).getTime()
        );
        setBookings(sortedBookings);
      } catch (err: unknown) {
        const apiError = err as ApiError;
        const errorMessage =
          apiError.response?.data?.message ||
          apiError.message ||
          "Không thể tải lịch sử đặt vé. Vui lòng thử lại sau.";
        setError(errorMessage);
        console.error("Fetch bookings error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // --- Logic Phân trang ---
  const totalPages = Math.ceil(bookings.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentBookings =
    bookings.length > 0 ? bookings.slice(startIndex, endIndex) : [];

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  // --- Render Logic ---
  if (isLoading) {
    return (
      <div
        className="profile-box profile-info-box loading-container"
        aria-busy="true"
      >
        <PuffLoader color="#facc15" size={60} /> {/* Slightly different gold */}
        <p>Đang tải lịch sử đặt vé...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-box profile-info-box error-message">
        <AlertCircle size={24} className="error-icon" />
        <p>Lỗi: {error}</p>
      </div>
    );
  }

  return (
    <div className="profile-box profile-info-box booking-history-section">
      <h2 className="profile-info-title">Lịch sử đặt vé</h2>
      <p className="profile-info-subtitle">
        Xem lại các giao dịch và thông tin vé đã đặt của bạn.
      </p>

      <div className="booking-content-wrapper">
        {bookings.length === 0 && !isLoading ? (
          <div className="empty-message">
            <Receipt size={32} className="empty-icon" />
            <p>Bạn chưa có lịch sử đặt vé nào.</p>
          </div>
        ) : (
          <>
            <div className="booking-list">
              {currentBookings.map((booking) => {
                const statusInfo = getStatusInfo(booking.Status);
                const displaySeats = formatSeats(booking.Seats);

                return (
                  <div key={booking.Booking_ID} className="booking-carda">
                    {/* Poster Section */}
                    <div className="poster-sectiona">
                      {booking.PosterURL ? (
                        <img 
                          src={booking.PosterURL} 
                          alt={booking.MovieName}
                          className="movie-postera"
                          onError={(e) => {
                            // Hide the broken image
                            e.currentTarget.style.display = 'none';
                            // The fallback icon will be shown via CSS :has() selector
                          }}
                        />
                      ) : (
                        <div className="movie-poster-placeholdera">
                          <Film size={24} />
                        </div>
                      )}
                    </div>
                    
                    {/* Content Section */}
                    <div className="card-contenta">
                      <div className="card-headera">
                        <div className="movie-title-containera">
                          <h3 className="movie-titleea" title={booking.MovieName}>
                            {booking.MovieName}
                          </h3>
                        </div>
                        <div className={`status-badge ${statusInfo.className}`}>
                          <statusInfo.Icon size={14} className="status-icon" />
                          <span>{statusInfo.text}</span>
                        </div>
                      </div>

                      <div className="card-bodya">
                        {/* Show Info */}
                        <div className="info-groupa show-info-group">
                          <div className="info-itema">
                            <Building size={16} className="info-icona" />
                            <span>{booking.RoomName}</span>
                          </div>
                          <div className="info-itema">
                            <Calendar size={16} className="info-icona" />
                            <span>{formatDate(booking.Show_Date)}</span>
                          </div>
                          <div className="info-itema">
                            <Clock size={16} className="info-icona" />
                            <span>{formatTime(booking.Start_Time)}</span>
                          </div>
                        </div>

                        {/* Booking & Seat Info */}
                        <div className="info-groupa booking-seat-group">
                          <div className="info-itema">
                            <Armchair size={16} className="info-icona" />
                            <span>
                              Ghế:{" "}
                              <span className="seat-infoa">{displaySeats}</span>
                            </span>
                          </div>
                          <div className="info-itema">
                            <Calendar size={16} className="info-icona" />
                            <span>
                              Đặt lúc: {formatDateTime(booking.Booking_Date)}
                            </span>
                          </div>
                          {booking.Status?.toLowerCase() === "pending" &&
                            booking.Payment_Deadline && (
                              <div className="info-itema payment-deadlinea">
                                <Clock4
                                  size={16}
                                  className="info-icona deadline-icona"
                                />
                                <span>
                                  Hạn TT:{" "}
                                  {formatDateTime(booking.Payment_Deadline)}
                                </span>
                              </div>
                            )}
                        </div>
                      </div>

                      {/* Footer: Payment Info */}
                      <div className="card-footera">
                        <div className="info-itema payment-method-itema">
                          <CreditCard size={16} className="info-icona" />
                          <span>
                            {booking.PaymentMethod || "Chưa thanh toán"}
                          </span>
                        </div>
                        <div className="info-itema total-amount-itema">
                          <Receipt size={16} className="info-icona amount-icona" />
                          <span className="total-amounta">
                            {booking.Total_Amount.toLocaleString("vi-VN")} VNĐ
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="pagination-controls">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="page-button prev-button"
                  aria-label="Trang trước"
                >
                  <ChevronLeft size={20} />
                  <span>Trước</span>
                </button>
                <span className="page-indicator" aria-live="polite">
                  Trang {currentPage} / {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="page-button next-button"
                  aria-label="Trang tiếp theo"
                >
                  <span>Tiếp</span>
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BookingHistory;

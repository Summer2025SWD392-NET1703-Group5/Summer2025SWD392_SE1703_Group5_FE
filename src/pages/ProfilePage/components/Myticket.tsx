import React, { useState, useEffect } from "react";
import type { ReactElement } from "react";
import "./Myticket.css";
import api from "../../../config/axios";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Ticket,
  QrCode,
  Info,
  AlertTriangle,
  Search,
  Filter,
  Calendar,
  SortAsc,
  SortDesc
} from "lucide-react";
import { Link } from "react-router-dom";

interface Ticket {
  ticket_id: number;
  ticket_code: string;
  booking_id: number;
  status: string;
  is_checked_in: boolean;
  final_price: number;
  booking_date: string;
  movie_info: {
    movie_id: number;
    movie_name: string;
    poster_url: string;
  };
  showtime_info: {
    showtime_id: number;
    show_date: string;
    start_time: string;
    room_name: string;
  };
  seat_info: string;
}

interface TicketDetail {
  Ticket_ID: number;
  Booking_ID: number;
  Ticket_Code: string;
  CustomerInfo: {
    User_ID: number;
    Full_Name: string;
    Email: string;
    Phone_Number: string;
  };
  SeatInfo: {
    Seat_ID: number;
    Row_Label: string;
    Column_Number: number;
    Seat_Type: string;
    SeatLabel: string;
  };
  MovieInfo: {
    Movie_ID: number;
    Movie_Name: string;
    Duration: number;
    Rating: string;
  };
  ShowtimeInfo: {
    Showtime_ID: number;
    ShowDate: string;
    StartTime: string;
    EndTime: string;
  };
  CinemaRoomInfo: {
    Cinema_Room_ID: number;
    Room_Name: string;
    Room_Type: string;
  };
  PriceInfo: {
    Base_Price: number;
    Discount_Amount: number;
    Final_Price: number;
  };
  Is_Checked_In: boolean;
  CheckInTime: string;
}

interface ApiResponse {
  success: boolean;
  total: number;
  tickets: Ticket[];
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

interface StatusConfig {
  color: string;
  backgroundColor: string;
  label: string;
  icon: ReactElement;
}

const statusConfigs: Record<string, StatusConfig> = {
  Active: {
    color: "#22c55e",
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    label: "Hoạt động",
    icon: <Check size={14} />
  },
  Cancelled: {
    color: "#ef4444",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    label: "Đã hủy",
    icon: <X size={14} />
  },
  default: {
    color: "#94a3b8",
    backgroundColor: "rgba(148, 163, 184, 0.1)",
    label: "Không xác định",
    icon: <Info size={14} />
  }
};

const TicketSkeleton = () => (
  <div className="aticket-card aanimate-pulse">
    <div className="aticket-header">
      <div className="askeleton-poster"></div>
      <div className="askeleton-info">
        <div className="askeleton-line aw-3/4"></div>
        <div className="askeleton-line aw-1/2"></div>
        <div className="askeleton-line aw-1/4"></div>
      </div>
    </div>
    <div className="askeleton-details">
      <div className="askeleton-line aw-full"></div>
      <div className="askeleton-line aw-3/4"></div>
      <div className="askeleton-line aw-2/3"></div>
    </div>
    <div className="askeleton-actions">
      <div className="askeleton-button"></div>
    </div>
  </div>
);

const EmptyState = () => (
  <div className="aempty-state">
    <Ticket size={64} className="aempty-icon" />
    <h3>Chưa có vé nào</h3>
    <p>Bạn chưa đặt vé xem phim nào. Hãy đặt vé ngay!</p>
    <Link to="/movies" className="abook-ticket-btn">
      Đặt vé ngay
    </Link>
  </div>
);

const getStatusConfig = (status: string): StatusConfig => {
  return statusConfigs[status] || statusConfigs.default;
};

const TicketActions = ({ ticket, onViewDetail }: { ticket: Ticket; onViewDetail: (ticketCode: string) => void }) => (
  <div className="aticket-actions">
    {ticket.status === "Active" && !ticket.is_checked_in && (
      <button className="aaction-btnn acheck-in-btnn">
        <QrCode size={16} />
        Check-in
      </button>
    )}
    <button 
      className="aaction-btnn adetails-btnn"
      onClick={() => onViewDetail(ticket.ticket_code)}
    >
      <Info size={16} />
      Chi tiết
    </button>
  </div>
);

const TicketDetailModal = ({ 
  ticketDetail, 
  onClose 
}: { 
  ticketDetail: TicketDetail | null;
  onClose: () => void;
}) => {
  if (!ticketDetail) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="aticket-detail-modal-overlay">
      <div className="aticket-detail-modal">
        <div className="aticket-detail-modal-header">
          <h2>Chi tiết vé</h2>
          <button className="aticket-detail-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="aticket-detail-modal-content">
          {/* Thông tin vé - Full width */}
          <div className="aticket-detail-section afull-width">
            <h3 className="aticket-detail-section-title">Thông tin vé</h3>
            <div className="aticket-detail-item-row">
              <div className="aticket-detail-label">Mã vé:</div>
              <div className="aticket-detail-value">{ticketDetail.Ticket_Code}</div>
            </div>
            <div className="aticket-detail-item-row">
              <div className="aticket-detail-label">Trạng thái:</div>
              <div className="aticket-detail-value" style={{
                color: ticketDetail.Is_Checked_In ? "#22c55e" : "#ef4444",
                fontWeight: "600"
              }}>
                {ticketDetail.Is_Checked_In ? "✓ Đã check-in" : "○ Chưa check-in"}
              </div>
            </div>
            {ticketDetail.CheckInTime && ticketDetail.Is_Checked_In && (
              <div className="aticket-detail-item-row">
                <div className="aticket-detail-label">Check-in:</div>
                <div className="aticket-detail-value">
                  {new Date(ticketDetail.CheckInTime).toLocaleString('vi-VN')}
                </div>
              </div>
            )}
          </div>

          {/* Thông tin phim - Left column */}
          <div className="aticket-detail-section">
            <h3 className="aticket-detail-section-title">Thông tin phim</h3>
            <div className="aticket-detail-item-row">
              <div className="aticket-detail-label">Phim:</div>
              <div className="aticket-detail-value">{ticketDetail.MovieInfo.Movie_Name}</div>
            </div>
            <div className="aticket-detail-item-row">
              <div className="aticket-detail-label">Thời lượng:</div>
              <div className="aticket-detail-value">{ticketDetail.MovieInfo.Duration} phút</div>
            </div>
            <div className="aticket-detail-item-row">
              <div className="aticket-detail-label">Độ tuổi:</div>
              <div className="aticket-detail-value">{ticketDetail.MovieInfo.Rating}</div>
            </div>
          </div>

          {/* Thông tin lịch chiếu - Right column */}
          <div className="aticket-detail-section">
            <h3 className="aticket-detail-section-title">Lịch chiếu</h3>
            <div className="aticket-detail-item-row">
              <div className="aticket-detail-label">Ngày:</div>
              <div className="aticket-detail-value">{formatDate(ticketDetail.ShowtimeInfo.ShowDate)}</div>
            </div>
            <div className="aticket-detail-item-row">
              <div className="aticket-detail-label">Bắt đầu:</div>
              <div className="aticket-detail-value">{formatTime(ticketDetail.ShowtimeInfo.StartTime)}</div>
            </div>
            <div className="aticket-detail-item-row">
              <div className="aticket-detail-label">Kết thúc:</div>
              <div className="aticket-detail-value">{formatTime(ticketDetail.ShowtimeInfo.EndTime)}</div>
            </div>
          </div>

          {/* Thông tin phòng - Left column */}
          <div className="aticket-detail-section">
            <h3 className="aticket-detail-section-title">Thông tin phòng</h3>
            <div className="aticket-detail-item-row">
              <div className="aticket-detail-label">Phòng:</div>
              <div className="aticket-detail-value">{ticketDetail.CinemaRoomInfo.Room_Name}</div>
            </div>
            <div className="aticket-detail-item-row">
              <div className="aticket-detail-label">Loại phòng:</div>
              <div className="aticket-detail-value">{ticketDetail.CinemaRoomInfo.Room_Type}</div>
            </div>
            <div className="aticket-detail-item-row">
              <div className="aticket-detail-label">Ghế:</div>
              <div className="aticket-detail-value">{ticketDetail.SeatInfo.SeatLabel}</div>
            </div>
            <div className="aticket-detail-item-row">
              <div className="aticket-detail-label">Loại ghế:</div>
              <div className="aticket-detail-value">{ticketDetail.SeatInfo.Seat_Type}</div>
            </div>
          </div>

          {/* Thông tin giá vé - Right column */}
          <div className="aticket-detail-section">
            <h3 className="aticket-detail-section-title">Giá vé</h3>
            <div className="aticket-detail-item-row">
              <div className="aticket-detail-label">Giá gốc:</div>
              <div className="aticket-detail-value">{ticketDetail.PriceInfo.Base_Price.toLocaleString('vi-VN')} VNĐ</div>
            </div>
            <div className="aticket-detail-item-row">
              <div className="aticket-detail-label">Giảm giá:</div>
              <div className="aticket-detail-value">{ticketDetail.PriceInfo.Discount_Amount.toLocaleString('vi-VN')} VNĐ</div>
            </div>
            <div className="aticket-detail-item-row">
              <div className="aticket-detail-label">Thành tiền:</div>
              <div className="aticket-detail-value aticket-final-price">{ticketDetail.PriceInfo.Final_Price.toLocaleString('vi-VN')} VNĐ</div>
            </div>
          </div>

          {/* Thông tin khách hàng - Full width */}
          <div className="aticket-detail-section">
            <h3 className="aticket-detail-section-title">Khách hàng</h3>
            <div className="aticket-detail-item-row">
              <div className="aticket-detail-label">Họ tên:</div>
              <div className="aticket-detail-value">{ticketDetail.CustomerInfo.Full_Name}</div>
            </div>
            <div className="aticket-detail-item-row">
              <div className="aticket-detail-label">Email:</div>
              <div className="aticket-detail-value">{ticketDetail.CustomerInfo.Email}</div>
            </div>
            <div className="aticket-detail-item-row">
              <div className="aticket-detail-label">Điện thoại:</div>
              <div className="aticket-detail-value">{ticketDetail.CustomerInfo.Phone_Number}</div>
            </div>
          </div>
        </div>
        <div className="aticket-detail-modal-footer">
          <button className="aticket-detail-close-button" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  );
};

// Thêm một số interface mới cho filter
interface FilterOptions {
  status: string;
  date: string;
  sortBy: string;
  searchTerm: string;
}

const MyTicket: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTicketDetail, setSelectedTicketDetail] = useState<TicketDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  const ITEMS_PER_PAGE = 4;

  // Filter states
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    status: "all",
    date: "all",
    sortBy: "newest",
    searchTerm: ""
  });
  const [isFilterVisible, setIsFilterVisible] = useState<boolean>(false);
  
  // Hàm scroll lên đầu trang
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get("/ticket/my-tickets");
        const data: ApiResponse = response.data;
        if (data.success) {
          setTickets(data.tickets);
        } else {
          throw new Error("Failed to fetch tickets.");
        }
      } catch (err: unknown) {
        const apiError = err as ApiError;
        const errorMessage = apiError.message || "Không thể tải vé.";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  // Reset pagination when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterOptions]);

  const handleViewTicketDetail = async (ticketCode: string) => {
    setDetailLoading(true);
    try {
      const response = await api.get(`/ticket/code/${ticketCode}`);
      setSelectedTicketDetail(response.data);
    } catch (error) {
      console.error("Error fetching ticket details:", error);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeTicketDetail = () => {
    setSelectedTicketDetail(null);
  };

  const formatDateTime = (date: string, time: string) => {
    if (!date) return "Không xác định";
    // Nếu time không hợp lệ, chỉ trả về ngày
    let dateTimeString = date;
    if (time) {
      // Ghép ngày và giờ thành chuỗi ISO
      dateTimeString = `${date}T${time}`;
    }
    const dateObj = new Date(dateTimeString);
    if (isNaN(dateObj.getTime())) return "Không xác định";
    const showDate = format(dateObj, "EEEE, dd/MM/yyyy", { locale: vi });
    const showTime = format(dateObj, "HH:mm");
    return `${showDate} - ${showTime}`;
  };

  const handleFilterChange = (field: keyof FilterOptions, value: string) => {
    setFilterOptions((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleFilterVisibility = () => {
    setIsFilterVisible(prev => !prev);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterOptions(prev => ({
      ...prev,
      searchTerm: e.target.value
    }));
  };

  // Apply filters
  const filteredTickets = tickets.filter(ticket => {
    // Filter by status
    if (filterOptions.status === "checked-in" && !ticket.is_checked_in) {
      return false;
    }
    
    if (filterOptions.status === "not-checked-in" && ticket.is_checked_in) {
      return false;
    }
    
    if (filterOptions.status === "active" && ticket.status.toLowerCase() !== "active") {
      return false;
    }
    
    if (filterOptions.status === "cancelled" && ticket.status.toLowerCase() !== "cancelled") {
      return false;
    }

    // Filter by date
    const ticketDate = new Date(ticket.showtime_info.show_date);
    const today = new Date();
    
    if (filterOptions.date === "upcoming" && ticketDate < today) {
      return false;
    }
    
    if (filterOptions.date === "past" && ticketDate >= today) {
      return false;
    }

    // Filter by search term
    if (filterOptions.searchTerm && !ticket.movie_info.movie_name.toLowerCase().includes(filterOptions.searchTerm.toLowerCase())) {
      return false;
    }

    return true;
  });

  // Sort filtered tickets
  const sortedTickets = [...filteredTickets].sort((a, b) => {
    if (filterOptions.sortBy === "newest") {
      return new Date(b.booking_date).getTime() - new Date(a.booking_date).getTime();
    } else if (filterOptions.sortBy === "oldest") {
      return new Date(a.booking_date).getTime() - new Date(b.booking_date).getTime();
    } else if (filterOptions.sortBy === "showtime-asc") {
      return new Date(a.showtime_info.show_date).getTime() - new Date(b.showtime_info.show_date).getTime();
    } else if (filterOptions.sortBy === "showtime-desc") {
      return new Date(b.showtime_info.show_date).getTime() - new Date(a.showtime_info.show_date).getTime();
    }
    
    // Default: newest first
    return new Date(b.booking_date).getTime() - new Date(a.booking_date).getTime();
  });

  const totalPages = Math.ceil(sortedTickets.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentTickets = sortedTickets.slice(startIndex, endIndex);

  const handleResetFilter = () => {
    setFilterOptions({
      status: "all",
      date: "all",
      sortBy: "newest",
      searchTerm: ""
    });
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      scrollToTop();
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      scrollToTop();
    }
  };

  if (loading) {
    return (
      <div className="amyticket-wrapper">
        <div className="amyticket-container">
          {[1, 2, 3].map((i) => (
            <TicketSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="amyticket-wrapper">
        <div className="aerror-message">
          <AlertTriangle size={20} className="aerror-icon" />
          <span>{error}</span>
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="areload-btn"
          style={{ marginTop: '15px', width: 'auto' }}
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="amyticket-wrapper">
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="amyticket-wrapper">
      <div className="amyticket-container">
        {/* Search and Filter Bar */}
        <div className="asearch-filter-container">
          <div className="asearch-bar">
            <Search size={18} className="asearch-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên phim..."
              value={filterOptions.searchTerm}
              onChange={handleSearchChange}
              className="asearch-input"
            />
          </div>
          <button 
            className={`afilter-toggle-btn ${isFilterVisible ? 'aactive' : ''}`} 
            onClick={toggleFilterVisibility}
          >
            <Filter size={16} />
            <span>Bộ lọc</span>
          </button>
        </div>

        {/* Expanded Filter Options */}
        {isFilterVisible && (
          <div className="afilter-expanded">
            <div className="afilter-expanded-row">
              <div className="afilter-group">
                <label className="afilter-label">
                  <span>Trạng thái</span>
                </label>
                <select
                  value={filterOptions.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="afilter-select"
                >
                  <option value="all">Tất cả</option>
                  <option value="active">Hoạt động</option>
                  <option value="cancelled">Đã hủy</option>
                  <option value="checked-in">Đã check-in</option>
                  <option value="not-checked-in">Chưa check-in</option>
                </select>
              </div>
              
              <div className="afilter-group">
                <label className="afilter-label">
                  <Calendar size={14} />
                  <span>Thời gian</span>
                </label>
                <select
                  value={filterOptions.date}
                  onChange={(e) => handleFilterChange('date', e.target.value)}
                  className="afilter-select"
                >
                  <option value="all">Tất cả</option>
                  <option value="upcoming">Sắp chiếu</option>
                  <option value="past">Đã chiếu</option>
                </select>
              </div>
              
              <div className="afilter-group">
                <label className="afilter-label">
                  {filterOptions.sortBy.includes('desc') ? <SortDesc size={14} /> : <SortAsc size={14} />}
                  <span>Sắp xếp</span>
                </label>
                <select
                  value={filterOptions.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="afilter-select"
                >
                  <option value="newest">Ngày đặt (mới nhất)</option>
                  <option value="oldest">Ngày đặt (cũ nhất)</option>
                  <option value="showtime-asc">Ngày chiếu (tăng dần)</option>
                  <option value="showtime-desc">Ngày chiếu (giảm dần)</option>
                </select>
              </div>
              
              <button className="afilter-reset-btn" onClick={handleResetFilter}>
                Đặt lại
              </button>
            </div>
          </div>
        )}

        {/* Filtered Results Info */}
        <div className="afilter-results-info">
          <span className="aresults-count">Có {sortedTickets.length} vé</span>
          {(filterOptions.status !== 'all' || 
            filterOptions.date !== 'all' || 
            filterOptions.sortBy !== 'newest' ||
            filterOptions.searchTerm) && (
            <div className="aactive-filters">
              <span>Đang lọc:</span>
              {filterOptions.status !== 'all' && (
                <span className="aactive-filter-tag">
                  {filterOptions.status === 'active' ? 'Hoạt động' : 
                    filterOptions.status === 'cancelled' ? 'Đã hủy' : 
                    filterOptions.status === 'checked-in' ? 'Đã check-in' : 'Chưa check-in'}
                  <X size={12} onClick={() => handleFilterChange('status', 'all')} />
                </span>
              )}
              {filterOptions.date !== 'all' && (
                <span className="aactive-filter-tag">
                  {filterOptions.date === 'upcoming' ? 'Sắp chiếu' : 'Đã chiếu'}
                  <X size={12} onClick={() => handleFilterChange('date', 'all')} />
                </span>
              )}
              {filterOptions.searchTerm && (
                <span className="aactive-filter-tag">
                  "{filterOptions.searchTerm}"
                  <X size={12} onClick={() => handleFilterChange('searchTerm', '')} />
                </span>
              )}
            </div>
          )}
        </div>

        {/* Display "No results" if filtered tickets is empty */}
        {sortedTickets.length === 0 ? (
          <div className="ano-results">
            <AlertTriangle size={36} />
            <h3>Không tìm thấy kết quả</h3>
            <p>Không có vé nào phù hợp với bộ lọc hiện tại</p>
            <button className="areset-filter-btn" onClick={handleResetFilter}>
              Đặt lại bộ lọc
            </button>
          </div>
        ) : (
          <>
            <div className="aticket-list">
              {currentTickets.map((ticket) => {
                const statusConfig = getStatusConfig(ticket.status);
                
                return (
                  <div 
                    key={ticket.ticket_id} 
                    className={`aticket-card ${ticket.status.toLowerCase()}`}
                  >
                    <div className="aticket-header">
                      <img
                        src={ticket.movie_info.poster_url}
                        alt={ticket.movie_info.movie_name}
                        className="aticket-poster"
                      />
                      <div className="aticket-info">
                        <h3 className="aticket-movie-name">
                          {ticket.movie_info.movie_name}
                        </h3>
                        <p className="aticket-code">Mã vé: {ticket.ticket_code}</p>
                        <div
                          className="aticket-status-badge"
                          style={{
                            color: statusConfig.color,
                            backgroundColor: statusConfig.backgroundColor,
                          }}
                        >
                          {statusConfig.icon}
                          {statusConfig.label}
                        </div>
                      </div>
                    </div>

                    <div className="aticket-details">
                      <div className="aticket-detail-item">
                        <span className="adetail-label">Ngày đặt:</span>
                        <span className="adetail-valuee">
                          {formatDateTime(
                            ticket.booking_date,
                            ticket.showtime_info.start_time
                          )}
                        </span>
                      </div>
                      <div className="aticket-detail-item">
                        <span className="adetail-label">Ngày chiếu:</span>
                        <span className="adetail-valuee">
                          {formatDateTime(
                            ticket.showtime_info.show_date,
                            ticket.showtime_info.start_time
                          )}
                        </span>
                      </div>
                      <div className="aticket-detail-item">
                        <span className="adetail-label">Phòng:</span>
                        <span className="adetail-valuee">{ticket.showtime_info.room_name}</span>
                      </div>
                      <div className="aticket-detail-item">
                        <span className="adetail-label">Ghế:</span>
                        <span className="adetail-valuee">{ticket.seat_info}</span>
                      </div>
                      <div className="aticket-detail-item">
                        <span className="adetail-label">Giá:</span>
                        <span className="adetail-valuee">{ticket.final_price.toLocaleString("vi-VN")} VNĐ</span>
                      </div>
                      <div className="aticket-detail-item">
                        <span className="adetail-label">Trạng thái:</span>
                        <span 
                          className="adetail-valuee acheckin-status"
                          style={{ 
                            color: ticket.is_checked_in ? "#22c55e" : "#ef4444", 
                            fontWeight: "600" 
                          }}
                        >
                          {ticket.is_checked_in ? "✓ Đã check-in" : "○ Chưa check-in"}
                        </span>
                      </div>
                    </div>

                    <TicketActions 
                      ticket={ticket} 
                      onViewDetail={handleViewTicketDetail}
                    />
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="apagination-controls">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="apage-button prev-button"
                  aria-label="Trang trước"
                >
                  <ChevronLeft size={18} />
                  <span>Trước</span>
                </button>
                <span className="apage-indicator">
                  Trang {currentPage} / {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="apage-button next-button"
                  aria-label="Trang tiếp theo"
                >
                  <span>Tiếp</span>
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal xem chi tiết vé */}
      {selectedTicketDetail && (
        <TicketDetailModal 
          ticketDetail={selectedTicketDetail}
          onClose={closeTicketDetail}
        />
      )}
      
      {detailLoading && (
        <div className="aticket-detail-loading-overlay">
          <div className="aticket-detail-spinner"></div>
        </div>
      )}
    </div>
  );
};

export default MyTicket;

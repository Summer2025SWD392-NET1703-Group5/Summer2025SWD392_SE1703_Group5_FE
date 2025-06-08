import React, { useState, useEffect } from "react";
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
  Calendar,
  Filter,
  Search
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

interface ApiResponse {
  success: boolean;
  total: number;
  tickets: Ticket[];
}

interface StatusConfig {
  color: string;
  backgroundColor: string;
  label: string;
  icon: JSX.Element;
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
};

const TicketSkeleton = () => (
  <div className="ticket-card animate-pulse">
    <div className="ticket-header">
      <div className="skeleton-poster"></div>
      <div className="skeleton-info">
        <div className="skeleton-line w-3/4"></div>
        <div className="skeleton-line w-1/2"></div>
        <div className="skeleton-line w-1/4"></div>
      </div>
    </div>
    <div className="skeleton-details">
      <div className="skeleton-line w-full"></div>
      <div className="skeleton-line w-3/4"></div>
      <div className="skeleton-line w-2/3"></div>
    </div>
    <div className="skeleton-actions">
      <div className="skeleton-button"></div>
    </div>
  </div>
);

const EmptyState = () => (
  <div className="empty-state">
    <Ticket size={64} className="empty-icon" />
    <h3>Chưa có vé nào</h3>
    <p>Bạn chưa đặt vé xem phim nào. Hãy đặt vé ngay!</p>
    <Link to="/movies" className="book-ticket-btn">
      Đặt vé ngay
    </Link>
  </div>
);

const TicketActions = ({ ticket }: { ticket: Ticket }) => (
  <div className="ticket-actions">
    {ticket.status === "Active" && !ticket.is_checked_in && (
      <button className="action-btnn check-in-btnn">
        <QrCode size={16} />
        Check-in
      </button>
    )}
    <button className="action-btnn details-btnn">
      <Info size={16} />
      Chi tiết
    </button>
  </div>
);

const MyTicket: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const ITEMS_PER_PAGE = 4; 

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
      } catch (err: any) {
        setError(err.response?.data?.message || "Không thể tải vé.");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const formatDateTime = (date: string, time: string) => {
    const showDate = format(new Date(date), "EEEE, dd/MM/yyyy", { locale: vi });
    const showTime = format(new Date(time), "HH:mm");
    return `${showDate} - ${showTime}`;
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesStatus = filterStatus === "all" ? true : ticket.status.toLowerCase() === filterStatus;
    const matchesSearch = searchQuery === "" ? true : 
      ticket.movie_info.movie_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      ticket.ticket_code.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const sortedTickets = [...filteredTickets].sort((a, b) => {
    if (sortBy === "date") {
      return new Date(b.booking_date).getTime() - new Date(a.booking_date).getTime();
    } else if (sortBy === "price") {
      return b.final_price - a.final_price;
    } else if (sortBy === "showtime") {
      return new Date(b.showtime_info.show_date).getTime() - new Date(a.showtime_info.show_date).getTime();
    }
    return 0;
  });

  const totalPages = Math.ceil(sortedTickets.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentTickets = sortedTickets.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  if (loading) {
    return (
      <div className="myticket-wrapper">
        <div className="myticket-container">
          {[1, 2, 3].map((i) => (
            <TicketSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="myticket-wrapper error-message">Lỗi: {error}</div>;
  }

  if (tickets.length === 0) {
    return (
      <div className="myticket-wrapper">
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="myticket-wrapper">
      <div className="myticket-container">
        <div className="myticket-header">
          <h2 className="myticket-title">Vé của tôi</h2>
          <p className="myticket-subtitle">Quản lý các vé phim của bạn</p>
          
          <div className="filter-controls">
            <div className="search-wrapper">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Tìm theo tên phim hoặc mã vé..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="search-input"
              />
            </div>
            
            <div className="filter-group">
              <div className="filter-label">
                <Filter size={14} />
                <span>Trạng thái:</span>
              </div>
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="filter-select"
              >
                <option value="all">Tất cả</option>
                <option value="active">Hoạt động</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>
            
            <div className="filter-group">
              <div className="filter-label">
                <Calendar size={14} />
                <span>Sắp xếp:</span>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="date">Ngày đặt vé</option>
                <option value="showtime">Ngày chiếu</option>
                <option value="price">Giá vé</option>
              </select>
            </div>
          </div>
        </div>

        {filteredTickets.length === 0 ? (
          <div className="no-results">
            <Info size={48} />
            <h3>Không tìm thấy vé nào</h3>
            <p>Không tìm thấy vé nào phù hợp với bộ lọc của bạn</p>
            <button 
              className="reset-filter-btn"
              onClick={() => {
                setFilterStatus("all");
                setSearchQuery("");
                setCurrentPage(1);
              }}
            >
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          <div className="ticket-list">
            {currentTickets.map((ticket) => (
              <div 
                key={ticket.ticket_id} 
                className={`ticket-card ${ticket.status.toLowerCase()}`}
              >
                <div className="ticket-header">
                  <img
                    src={ticket.movie_info.poster_url}
                    alt={ticket.movie_info.movie_name}
                    className="ticket-poster"
                  />
                  <div className="ticket-info">
                    <h3 className="ticket-movie-name">
                      {ticket.movie_info.movie_name}
                    </h3>
                    <p className="ticket-code">Mã vé: {ticket.ticket_code}</p>
                    <div
                      className="ticket-status-badge"
                      style={{
                        color: statusConfigs[ticket.status].color,
                        backgroundColor:
                          statusConfigs[ticket.status].backgroundColor,
                      }}
                    >
                      {statusConfigs[ticket.status].icon}
                      {statusConfigs[ticket.status].label}
                    </div>
                  </div>
                </div>

                <div className="ticket-details">
                  <div className="ticket-detail-item">
                    <span className="detail-label">Ngày đặt:</span>
                    <span className="detail-valuee  ">
                      {formatDateTime(
                        ticket.booking_date,
                        ticket.showtime_info.start_time
                      )}
                    </span>
                  </div>
                  <div className="ticket-detail-item">
                    <span className="detail-label">Ngày chiếu:</span>
                    <span className="detail-valueee">
                      {formatDateTime(
                        ticket.showtime_info.show_date,
                        ticket.showtime_info.start_time
                      )}
                    </span>
                  </div>
                  <div className="ticket-detail-item">
                    <span className="detail-label">Phòng:</span>
                    <span className="detail-valueee">{ticket.showtime_info.room_name}</span>
                  </div>
                  <div className="ticket-detail-item">
                    <span className="detail-label">Ghế:</span>
                    <span className="detail-valueee">{ticket.seat_info}</span>
                  </div>
                  <div className="ticket-detail-item">
                    <span className="detail-label">Giá:</span>
                    <span className="detail-valueee">{ticket.final_price.toLocaleString("vi-VN")} VNĐ</span>
                  </div>
                  <div className="ticket-detail-item">
                    <span className="detail-label">Trạng thái:</span>
                    <span className="detail-valuee checkin-status">
                      {ticket.is_checked_in ? "✓ Đã check-in" : "○ Chưa check-in"}
                    </span>
                  </div>
                </div>

                <TicketActions ticket={ticket} />
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="pagination-controls">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="page-button prev-button"
              aria-label="Trang trước"
            >
              <ChevronLeft size={18} />
              <span>Trước</span>
            </button>
            <span className="page-indicator">
              Trang {currentPage} / {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="page-button next-button"
              aria-label="Trang tiếp theo"
            >
              <span>Tiếp</span>
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTicket;

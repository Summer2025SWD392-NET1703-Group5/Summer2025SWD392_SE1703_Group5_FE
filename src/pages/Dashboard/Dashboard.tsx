import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Dashboard.css";

interface DashboardStats {
  totalUsers: number;
  totalMovies: number;
  totalBookings: number;
  totalRevenue: number;
  totalCinemas: number;
  activeShowtimes: number;
}

interface RecentBooking {
  id: string;
  movieTitle: string;
  userName: string;
  date: string;
  amount: number;
  status: "confirmed" | "pending" | "cancelled";
}

interface TopMovie {
  id: string;
  title: string;
  bookings: number;
  revenue: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalMovies: 0,
    totalBookings: 0,
    totalRevenue: 0,
    totalCinemas: 0,
    activeShowtimes: 0,
  });

  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [topMovies, setTopMovies] = useState<TopMovie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Mock data - replace with actual API calls
        setTimeout(() => {
          setStats({
            totalUsers: 1250,
            totalMovies: 45,
            totalBookings: 3420,
            totalRevenue: 3125000000, // 125000 USD converted to VND
            totalCinemas: 8,
            activeShowtimes: 120,
          });

          setRecentBookings([
            {
              id: "1",
              movieTitle: "Avengers: Endgame",
              userName: "Nguyễn Văn An",
              date: "2025-05-29",
              amount: 399750, // 15.99 USD converted to VND
              status: "confirmed",
            },
            {
              id: "2",
              movieTitle: "Spider-Man: No Way Home",
              userName: "Trần Thị Bình",
              date: "2025-05-29",
              amount: 324750, // 12.99 USD converted to VND
              status: "confirmed",
            },
            {
              id: "3",
              movieTitle: "The Batman",
              userName: "Lê Minh Châu",
              date: "2025-05-28",
              amount: 374750, // 14.99 USD converted to VND
              status: "pending",
            },
            {
              id: "4",
              movieTitle: "Doctor Strange",
              userName: "Phạm Thị Dung",
              date: "2025-05-28",
              amount: 349750, // 13.99 USD converted to VND
              status: "confirmed",
            },
            {
              id: "5",
              movieTitle: "Black Panther",
              userName: "Hoàng Văn Em",
              date: "2025-05-27",
              amount: 399750, // 15.99 USD converted to VND
              status: "cancelled",
            },
          ]);

          setTopMovies([
            { id: "1", title: "Avengers: Endgame", bookings: 450, revenue: 168750000 }, // 6750 USD to VND
            { id: "2", title: "Spider-Man: No Way Home", bookings: 380, revenue: 123500000 }, // 4940 USD to VND
            { id: "3", title: "The Batman", bookings: 320, revenue: 120000000 }, // 4800 USD to VND
            { id: "4", title: "Doctor Strange", bookings: 290, revenue: 101500000 }, // 4060 USD to VND
          ]);

          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu dashboard:", error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      confirmed: "status-confirmed",
      pending: "status-pending",
      cancelled: "status-cancelled",
    };
    const statusText = {
      confirmed: "Xác nhận",
      pending: "Chờ xử lý",
      cancelled: "Đã hủy",
    };
    return (
      <span className={`status-badge ${statusClasses[status as keyof typeof statusClasses]}`}>
        {statusText[status as keyof typeof statusText]}
      </span>
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Đang tải bảng điều khiển...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Bảng điều khiển quản trị</h1>
          <p>Chào mừng trở lại! Đây là những gì đang diễn ra tại rạp chiếu phim của bạn hôm nay.</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary">
            <span>📊</span>
            Tạo báo cáo
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon users-icon">👥</div>
          <div className="stat-content">
            <h3>Tổng người dùng</h3>
            <p className="stat-number">{stats.totalUsers.toLocaleString("vi-VN")}</p>
            <span className="stat-change positive">+12% so với tháng trước</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon movies-icon">🎬</div>
          <div className="stat-content">
            <h3>Phim đang chiếu</h3>
            <p className="stat-number">{stats.totalMovies}</p>
            <span className="stat-change positive">+3 phim mới phát hành</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bookings-icon">🎫</div>
          <div className="stat-content">
            <h3>Tổng đặt vé</h3>
            <p className="stat-number">{stats.totalBookings.toLocaleString("vi-VN")}</p>
            <span className="stat-change positive">+8% tuần này</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon revenue-icon">💰</div>
          <div className="stat-content">
            <h3>Tổng doanh thu</h3>
            <p className="stat-number">{formatPrice(stats.totalRevenue)}</p>
            <span className="stat-change positive">+15% so với tháng trước</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon cinemas-icon">🏢</div>
          <div className="stat-content">
            <h3>Địa điểm rạp</h3>
            <p className="stat-number">{stats.totalCinemas}</p>
            <span className="stat-change neutral">Trên 5 thành phố</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon showtimes-icon">🕐</div>
          <div className="stat-content">
            <h3>Suất chiếu hoạt động</h3>
            <p className="stat-number">{stats.activeShowtimes}</p>
            <span className="stat-change neutral">Lịch chiếu hôm nay</span>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-section">
          <div className="recent-bookings">
            <div className="section-header">
              <h2>Đặt vé gần đây</h2>
              <Link to="/admin/bookings/all" className="view-all-link">
                Xem tất cả →
              </Link>
            </div>
            <div className="bookings-table">
              <table>
                <thead>
                  <tr>
                    <th>Phim</th>
                    <th>Khách hàng</th>
                    <th>Ngày</th>
                    <th>Số tiền</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((booking) => (
                    <tr key={booking.id}>
                      <td className="movie-title">{booking.movieTitle}</td>
                      <td>{booking.userName}</td>
                      <td>{new Date(booking.date).toLocaleDateString("vi-VN")}</td>
                      <td className="amount">{formatPrice(booking.amount)}</td>
                      <td>{getStatusBadge(booking.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="dashboard-sidebar">
          <div className="top-movies">
            <div className="section-header">
              <h2>Phim hàng đầu</h2>
              <Link to="/admin/reports/movies" className="view-all-link">
                Xem tất cả →
              </Link>
            </div>
            <div className="top-movies-list">
              {topMovies.map((movie, index) => (
                <div key={movie.id} className="top-movie-item">
                  <div className="movie-rank">#{index + 1}</div>
                  <div className="movie-info">
                    <h4>{movie.title}</h4>
                    <p>{movie.bookings} lượt đặt</p>
                    <p className="movie-revenue">{formatPrice(movie.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

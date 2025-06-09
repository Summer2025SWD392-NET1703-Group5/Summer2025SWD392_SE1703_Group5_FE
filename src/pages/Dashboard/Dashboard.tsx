import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getSalesReportOverview,
  getCurrentMonthSalesReport,
  getCurrentWeekSalesReport,
  getTodaySalesReport,
  getRealtimeSalesReport,
  getMovieSalesReport,
  getCinemaSalesReport,
} from "../../config/SaleReportApi";
import {
  getBookingStatistics,
  getMovieBookingStatistics,
  getRoomBookingStatistics,
  getDailyBookingStatistics,
  getPaymentMethodsBookingStatistics,
} from "../../config/BookingStatisticsApi";
import { getStaffPerformance } from "../../config/StaffPerformanceApi";
import {
  formatPrice,
  formatNumber,
  formatDate,
  formatDateTime,
  showErrorToast,
  showSuccessToast,
  LoadingSpinner,
  EmptyState,
} from "../../components/utils/utils";
import "./Dashboard.css";

interface DashboardStats {
  totalUsers: number;
  totalMovies: number;
  totalBookings: number;
  totalRevenue: number;
  totalCinemas: number;
  activeShowtimes: number;
  totalStaff: number;
  totalManagers: number;
  systemPerformance: number;
  growthRate: number;
}

interface SalesData {
  totalRevenue: number;
  totalTickets: number;
  averageTicketPrice: number;
  growthRate: number;
}

interface BookingData {
  totalBookings: number;
  successfulBookings: number;
  cancelledBookings: number;
  successRate: number;
}

interface StaffData {
  totalStaff: number;
  activeStaff: number;
  averagePerformance: number;
  topPerformer: string;
}

interface CinemaData {
  totalCinemas: number;
  activeCinemas: number;
  totalRooms: number;
  averageOccupancy: number;
}

// CSS-in-JS Styles
const styles = {
  dashboard: {
    padding: "2rem",
    background: "#f8f9fa",
    minHeight: "100vh",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#2c3e50",
  },

  loading: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    gap: "1rem",
    color: "#2c3e50",
  },

  dashboardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "2rem",
    background: "white",
    padding: "2rem",
    borderRadius: "16px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.07)",
    border: "1px solid #e9ecef",
  },

  headerContent: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1rem",
    flex: 1,
  },

  headerTitle: {
    color: "#2c3e50",
    margin: 0,
    fontSize: "2.2rem",
    fontWeight: 700,
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },

  headerSubtitle: {
    fontSize: "1.1rem",
    color: "#6c757d",
    margin: 0,
    fontWeight: 500,
  },

  systemInfoSection: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.75rem",
    marginTop: "0.5rem",
  },

  systemMainInfo: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },

  systemIcon: {
    fontSize: "1.5rem",
    color: "#667eea",
  },

  systemName: {
    fontSize: "1.3rem",
    fontWeight: 600,
    color: "#2c3e50",
  },

  systemStatus: {
    padding: "0.25rem 0.75rem",
    borderRadius: "12px",
    fontSize: "0.8rem",
    fontWeight: 600,
    textTransform: "uppercase" as const,
    background: "#d4edda",
    color: "#155724",
  },

  systemDetails: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "0.75rem",
    fontSize: "0.95rem",
    color: "#495057",
  },

  systemDetailItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontWeight: 500,
  },

  detailIcon: {
    fontSize: "1rem",
    color: "#667eea",
    minWidth: "1rem",
  },

  headerControls: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },

  realtimeIndicator: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "1rem 1.5rem",
    background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
    borderRadius: "16px",
    color: "white",
    fontWeight: 600,
    boxShadow: "0 4px 12px rgba(40, 167, 69, 0.3)",
  },

  statusDot: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    background: "#ffffff",
    animation: "pulse 2s infinite",
    boxShadow: "0 0 10px rgba(255, 255, 255, 0.6)",
  },

  realtimeText: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    textAlign: "center" as const,
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "1.5rem",
    marginBottom: "2rem",
  },

  statCard: {
    background: "white",
    padding: "2rem",
    borderRadius: "16px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.07)",
    display: "flex",
    alignItems: "center",
    gap: "1.5rem",
    transition: "all 0.3s ease",
    cursor: "pointer",
    border: "1px solid #e9ecef",
    position: "relative" as const,
    overflow: "hidden",
  },

  statCardBefore: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    height: "4px",
    background: "linear-gradient(90deg, #667eea, #764ba2)",
    content: '""',
  },

  statIcon: {
    fontSize: "3rem",
    width: "80px",
    height: "80px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "20px",
    color: "white",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
  },

  revenueIcon: {
    background: "linear-gradient(135deg, #00b09b 0%, #96c93d 100%)",
  },

  usersIcon: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },

  bookingsIcon: {
    background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  },

  cinemasIcon: {
    background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  },

  staffIcon: {
    background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  },

  performanceIcon: {
    background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
  },

  statContent: {
    flex: 1,
  },

  statTitle: {
    margin: "0 0 0.75rem 0",
    color: "#6c757d",
    fontSize: "0.95rem",
    fontWeight: 600,
    textTransform: "uppercase" as const,
    letterSpacing: "1px",
  },

  statValue: {
    fontSize: "2.2rem",
    fontWeight: 800,
    color: "#2c3e50",
    marginBottom: "0.5rem",
    lineHeight: 1,
  },

  statChange: {
    fontSize: "1rem",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.25rem 0.75rem",
    borderRadius: "20px",
    width: "fit-content",
  },

  positive: {
    color: "#28a745",
    background: "rgba(40, 167, 69, 0.1)",
  },

  negative: {
    color: "#dc3545",
    background: "rgba(220, 53, 69, 0.1)",
  },

  neutral: {
    color: "#6c757d",
    background: "rgba(108, 117, 125, 0.1)",
  },

  statSubtitle: {
    fontSize: "0.9rem",
    color: "#6c757d",
    marginTop: "0.5rem",
    fontWeight: 500,
  },

  dashboardContent: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: "2rem",
    marginBottom: "2rem",
  },

  dashboardSection: {
    background: "white",
    borderRadius: "16px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.07)",
    overflow: "hidden",
    border: "1px solid #e9ecef",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1.5rem 2rem",
    borderBottom: "1px solid #e9ecef",
    background: "#f8f9fa",
  },

  sectionTitle: {
    margin: 0,
    color: "#2c3e50",
    fontSize: "1.4rem",
    fontWeight: 700,
  },

  viewAllLink: {
    color: "#667eea",
    textDecoration: "none",
    fontWeight: 600,
    fontSize: "0.95rem",
    transition: "color 0.2s ease",
  },

  recentBookings: {
    padding: "1.5rem 2rem",
  },

  bookingsTable: {
    width: "100%",
    borderCollapse: "collapse" as const,
  },

  tableHeader: {
    background: "#f8f9fa",
    fontWeight: 600,
    color: "#495057",
    textAlign: "left" as const,
    padding: "1rem",
    borderBottom: "2px solid #e9ecef",
  },

  tableCell: {
    padding: "1rem",
    borderBottom: "1px solid #f1f3f4",
    color: "#2c3e50",
  },

  movieTitle: {
    fontWeight: 600,
    color: "#2c3e50",
  },

  amount: {
    fontWeight: 700,
    color: "#28a745",
  },

  statusBadge: {
    padding: "0.25rem 0.75rem",
    borderRadius: "12px",
    fontSize: "0.8rem",
    fontWeight: 600,
    textTransform: "uppercase" as const,
  },

  statusConfirmed: {
    background: "#d4edda",
    color: "#155724",
  },

  statusPending: {
    background: "#fff3cd",
    color: "#856404",
  },

  statusCancelled: {
    background: "#f8d7da",
    color: "#721c24",
  },

  dashboardSidebar: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "2rem",
  },

  topMovies: {
    padding: "1.5rem 2rem",
  },

  topMoviesList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1rem",
  },

  topMovieItem: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    padding: "1rem",
    background: "#f8f9fa",
    borderRadius: "12px",
    transition: "transform 0.2s ease",
  },

  movieRank: {
    fontSize: "1.2rem",
    fontWeight: 700,
    color: "#ffc107",
    minWidth: "2rem",
  },

  movieInfo: {
    flex: 1,
  },

  movieInfoTitle: {
    margin: "0 0 0.5rem 0",
    fontSize: "1rem",
    fontWeight: 600,
    color: "#2c3e50",
  },

  movieBookings: {
    fontSize: "0.9rem",
    color: "#6c757d",
    margin: "0 0 0.25rem 0",
  },

  movieRevenue: {
    fontSize: "0.9rem",
    fontWeight: 600,
    color: "#28a745",
    margin: 0,
  },

  realtimeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "1.5rem",
    marginBottom: "2rem",
  },

  realtimeCard: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    padding: "1.5rem",
    borderRadius: "12px",
    textAlign: "center" as const,
    transition: "transform 0.2s ease",
  },

  realtimeCardTitle: {
    margin: "0 0 1rem 0",
    fontSize: "1rem",
    opacity: 0.9,
  },

  realtimeValue: {
    fontSize: "2rem",
    fontWeight: 700,
    marginBottom: "0.5rem",
  },

  realtimeSubtitle: {
    fontSize: "0.85rem",
    opacity: 0.8,
  },
};

const Dashboard: React.FC = () => {
  // State for dashboard data
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalMovies: 0,
    totalBookings: 0,
    totalRevenue: 0,
    totalCinemas: 0,
    activeShowtimes: 0,
    totalStaff: 0,
    totalManagers: 0,
    systemPerformance: 0,
    growthRate: 0,
  });

  const [salesData, setSalesData] = useState<SalesData | null>(null);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [staffData, setStaffData] = useState<StaffData | null>(null);
  const [cinemaData, setCinemaData] = useState<CinemaData | null>(null);
  const [realtimeData, setRealtimeData] = useState<any>(null);
  const [topMovies, setTopMovies] = useState<any[]>([]);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);

  // Loading states
  const [loading, setLoading] = useState(true);

  // Date range for data
  const [dateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  // Load dashboard overview data
  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Get overview data for the last 30 days
      const [salesOverview, todaySales, realtimeSales, bookingStats, staffPerformance, movieSales] = await Promise.all([
        getSalesReportOverview(30),
        getTodaySalesReport(),
        getRealtimeSalesReport(),
        getBookingStatistics(dateRange.startDate, dateRange.endDate),
        getStaffPerformance(dateRange.startDate, dateRange.endDate),
        getMovieSalesReport(dateRange.startDate, dateRange.endDate),
      ]);

      // Set comprehensive stats
      setStats({
        totalUsers: 1250, // Mock data - replace with actual API
        totalMovies: movieSales?.totalMovies || 45,
        totalBookings: bookingStats?.totalBookings || 0,
        totalRevenue: salesOverview?.totalRevenue || 0,
        totalCinemas: 8, // Mock data - replace with actual API
        activeShowtimes: 120, // Mock data - replace with actual API
        totalStaff: staffPerformance?.totalStaff || 0,
        totalManagers: 15, // Mock data - replace with actual API
        systemPerformance: 95.8, // Mock data - replace with actual API
        growthRate: salesOverview?.growthRate || 0,
      });

      // Set sales data
      setSalesData({
        totalRevenue: salesOverview?.totalRevenue || 0,
        totalTickets: salesOverview?.totalTickets || 0,
        averageTicketPrice: salesOverview?.averageTicketPrice || 0,
        growthRate: salesOverview?.growthRate || 0,
      });

      // Set booking data
      setBookingData({
        totalBookings: bookingStats?.totalBookings || 0,
        successfulBookings: bookingStats?.successfulBookings || 0,
        cancelledBookings: bookingStats?.cancelledBookings || 0,
        successRate: bookingStats?.successRate || 0,
      });

      // Set staff data
      setStaffData({
        totalStaff: staffPerformance?.totalStaff || 0,
        activeStaff: staffPerformance?.activeStaff || 0,
        averagePerformance: staffPerformance?.averagePerformance || 0,
        topPerformer: staffPerformance?.topPerformer?.name || "N/A",
      });

      // Set cinema data (mock for now)
      setCinemaData({
        totalCinemas: 8,
        activeCinemas: 8,
        totalRooms: 64,
        averageOccupancy: 78.5,
      });

      // Set realtime data
      setRealtimeData(realtimeSales);

      // Set top movies
      setTopMovies(movieSales?.movies?.slice(0, 4) || []);

      // Mock recent bookings data
      setRecentBookings([
        {
          id: "1",
          movieTitle: "Avengers: Endgame",
          userName: "Nguyễn Văn An",
          date: "2025-05-29",
          amount: 399750,
          status: "confirmed",
        },
        {
          id: "2",
          movieTitle: "Spider-Man: No Way Home",
          userName: "Trần Thị Bình",
          date: "2025-05-29",
          amount: 324750,
          status: "confirmed",
        },
        {
          id: "3",
          movieTitle: "The Batman",
          userName: "Lê Minh Châu",
          date: "2025-05-28",
          amount: 374750,
          status: "pending",
        },
        {
          id: "4",
          movieTitle: "Doctor Strange",
          userName: "Phạm Thị Dung",
          date: "2025-05-28",
          amount: 349750,
          status: "confirmed",
        },
        {
          id: "5",
          movieTitle: "Black Panther",
          userName: "Hoàng Văn Em",
          date: "2025-05-27",
          amount: 399750,
          status: "cancelled",
        },
      ]);

      showSuccessToast("Dữ liệu dashboard đã được tải thành công");
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      showErrorToast("Không thể tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh realtime data every 30 seconds
  useEffect(() => {
    loadDashboardData();

    const interval = setInterval(async () => {
      try {
        const realtimeSales = await getRealtimeSalesReport();
        setRealtimeData(realtimeSales);
      } catch (error) {
        console.error("Error refreshing realtime data:", error);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      confirmed: styles.statusConfirmed,
      pending: styles.statusPending,
      cancelled: styles.statusCancelled,
    };

    const statusText = {
      confirmed: "Xác nhận",
      pending: "Chờ xử lý",
      cancelled: "Đã hủy",
    };

    return (
      <span style={{ ...styles.statusBadge, ...statusStyles[status as keyof typeof statusStyles] }}>
        {statusText[status as keyof typeof statusText]}
      </span>
    );
  };

  if (loading) {
    return (
      <div style={{ ...styles.dashboard, ...styles.loading }}>
        <LoadingSpinner size="large" />
        <p>Đang tải bảng điều khiển quản trị...</p>
      </div>
    );
  }

  return (
    <div style={styles.dashboard}>
      {/* Header */}
      <div style={styles.dashboardHeader}>
        <div style={styles.headerContent}>
          <h1 style={styles.headerTitle}>Bảng Điều Khiển Quản Trị Hệ Thống</h1>
          <p style={styles.headerSubtitle}>
            Chào mừng trở lại! Đây là tổng quan về toàn bộ hệ thống rạp chiếu phim Galaxy.
          </p>

          <div style={styles.systemInfoSection}>
            <div style={styles.systemMainInfo}>
              <span style={styles.systemIcon}>🎬</span>
              <span style={styles.systemName}>Galaxy Cinema System</span>
              <span style={styles.systemStatus}>Hoạt động</span>
            </div>

            <div style={styles.systemDetails}>
              <div style={styles.systemDetailItem}>
                <span style={styles.detailIcon}>🏢</span>
                <span>{cinemaData?.totalCinemas || 0} rạp chiếu phim</span>
              </div>
              <div style={styles.systemDetailItem}>
                <span style={styles.detailIcon}>🎭</span>
                <span>{cinemaData?.totalRooms || 0} phòng chiếu</span>
              </div>
              <div style={styles.systemDetailItem}>
                <span style={styles.detailIcon}>👥</span>
                <span>{stats.totalStaff} nhân viên</span>
              </div>
              <div style={styles.systemDetailItem}>
                <span style={styles.detailIcon}>⚡</span>
                <span>Hiệu suất: {stats.systemPerformance}%</span>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.headerControls}>
          <div style={styles.realtimeIndicator}>
            <span style={styles.statusDot}></span>
            <div style={styles.realtimeText}>
              <span>Dữ liệu thời gian thực</span>
              <small>{formatDateTime(new Date())}</small>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statCardBefore}></div>
          <div style={{ ...styles.statIcon, ...styles.revenueIcon }}>💰</div>
          <div style={styles.statContent}>
            <h3 style={styles.statTitle}>Tổng Doanh Thu</h3>
            <div style={styles.statValue}>{formatPrice(stats.totalRevenue)}</div>
            <div style={{ ...styles.statChange, ...(stats.growthRate >= 0 ? styles.positive : styles.negative) }}>
              {stats.growthRate >= 0 ? "📈" : "📉"} {Math.abs(stats.growthRate).toFixed(1)}% so với tháng trước
            </div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statCardBefore}></div>
          <div style={{ ...styles.statIcon, ...styles.usersIcon }}>👥</div>
          <div style={styles.statContent}>
            <h3 style={styles.statTitle}>Tổng Người Dùng</h3>
            <div style={styles.statValue}>{formatNumber(stats.totalUsers)}</div>
            <div style={{ ...styles.statChange, ...styles.positive }}>📈 +12% so với tháng trước</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statCardBefore}></div>
          <div style={{ ...styles.statIcon, ...styles.bookingsIcon }}>🎫</div>
          <div style={styles.statContent}>
            <h3 style={styles.statTitle}>Tổng Đặt Vé</h3>
            <div style={styles.statValue}>{formatNumber(stats.totalBookings)}</div>
            <div style={styles.statSubtitle}>Tỷ lệ thành công: {(bookingData?.successRate || 0).toFixed(1)}%</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statCardBefore}></div>
          <div style={{ ...styles.statIcon, ...styles.cinemasIcon }}>🏢</div>
          <div style={styles.statContent}>
            <h3 style={styles.statTitle}>Rạp Chiếu Phim</h3>
            <div style={styles.statValue}>{stats.totalCinemas}</div>
            <div style={styles.statSubtitle}>{cinemaData?.totalRooms || 0} phòng chiếu</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statCardBefore}></div>
          <div style={{ ...styles.statIcon, ...styles.staffIcon }}>👨‍💼</div>
          <div style={styles.statContent}>
            <h3 style={styles.statTitle}>Nhân Viên</h3>
            <div style={styles.statValue}>{stats.totalStaff}</div>
            <div style={styles.statSubtitle}>{stats.totalManagers} quản lý</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statCardBefore}></div>
          <div style={{ ...styles.statIcon, ...styles.performanceIcon }}>⚡</div>
          <div style={styles.statContent}>
            <h3 style={styles.statTitle}>Hiệu Suất Hệ Thống</h3>
            <div style={styles.statValue}>{stats.systemPerformance}%</div>
            <div style={{ ...styles.statChange, ...styles.positive }}>📈 Hoạt động tốt</div>
          </div>
        </div>
      </div>

      {/* Realtime Data Section */}
      {realtimeData && (
        <div style={styles.realtimeGrid}>
          <div style={styles.realtimeCard}>
            <h4 style={styles.realtimeCardTitle}>Doanh Thu Hôm Nay</h4>
            <div style={styles.realtimeValue}>{formatPrice(realtimeData.todayRevenue || 0)}</div>
            <div style={styles.realtimeSubtitle}>Cập nhật: {formatDateTime(realtimeData.lastUpdate)}</div>
          </div>

          <div style={styles.realtimeCard}>
            <h4 style={styles.realtimeCardTitle}>Vé Bán Trong Giờ</h4>
            <div style={styles.realtimeValue}>{formatNumber(realtimeData.ticketsThisHour || 0)}</div>
            <div style={styles.realtimeSubtitle}>Tổng hôm nay: {formatNumber(realtimeData.ticketsToday || 0)}</div>
          </div>

          <div style={styles.realtimeCard}>
            <h4 style={styles.realtimeCardTitle}>Người Dùng Online</h4>
            <div style={styles.realtimeValue}>{formatNumber(realtimeData.onlineUsers || 0)}</div>
            <div style={styles.realtimeSubtitle}>Đang hoạt động</div>
          </div>

          <div style={styles.realtimeCard}>
            <h4 style={styles.realtimeCardTitle}>Suất Chiếu Đang Diễn Ra</h4>
            <div style={styles.realtimeValue}>{realtimeData.currentShows || 0}</div>
            <div style={styles.realtimeSubtitle}>Trên toàn hệ thống</div>
          </div>
        </div>
      )}

      {/* Dashboard Content */}
      <div style={styles.dashboardContent}>
        <div style={styles.dashboardSection}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Đặt Vé Gần Đây</h2>
            <Link to="/admin/bookings/all" style={styles.viewAllLink}>
              Xem tất cả →
            </Link>
          </div>
          <div style={styles.recentBookings}>
            <table style={styles.bookingsTable}>
              <thead>
                <tr>
                  <th style={styles.tableHeader}>Phim</th>
                  <th style={styles.tableHeader}>Khách hàng</th>
                  <th style={styles.tableHeader}>Ngày</th>
                  <th style={styles.tableHeader}>Số tiền</th>
                  <th style={styles.tableHeader}>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td style={{ ...styles.tableCell, ...styles.movieTitle }}>{booking.movieTitle}</td>
                    <td style={styles.tableCell}>{booking.userName}</td>
                    <td style={styles.tableCell}>{formatDate(booking.date)}</td>
                    <td style={{ ...styles.tableCell, ...styles.amount }}>{formatPrice(booking.amount)}</td>
                    <td style={styles.tableCell}>{getStatusBadge(booking.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={styles.dashboardSidebar}>
          <div style={styles.dashboardSection}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Phim Hàng Đầu</h2>
              <Link to="/admin/reports/movies" style={styles.viewAllLink}>
                Xem tất cả →
              </Link>
            </div>
            <div style={styles.topMovies}>
              <div style={styles.topMoviesList}>
                {topMovies.length > 0 ? (
                  topMovies.map((movie, index) => (
                    <div key={movie.id || index} style={styles.topMovieItem}>
                      <div style={styles.movieRank}>#{index + 1}</div>
                      <div style={styles.movieInfo}>
                        <h4 style={styles.movieInfoTitle}>{movie.title}</h4>
                        <p style={styles.movieBookings}>{formatNumber(movie.bookings || 0)} lượt đặt</p>
                        <p style={styles.movieRevenue}>{formatPrice(movie.revenue || 0)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState
                    title="Không có dữ liệu phim"
                    description="Dữ liệu sẽ được cập nhật khi có đặt vé"
                    icon="🎬"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
          100% { opacity: 1; transform: scale(1); }
        }
        
        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
        }
        
        .top-movie-item:hover,
        .table-row:hover {
          transform: translateX(4px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1) !important;
        }
        
        .realtime-card:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 12px 40px rgba(102, 126, 234, 0.4) !important;
        }
        
        .view-all-link:hover {
          color: #764ba2 !important;
        }
        
        @media (max-width: 1200px) {
          .dashboard-content {
            grid-template-columns: 1fr !important;
          }
          
          .system-details {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        
        @media (max-width: 768px) {
          .dashboard {
            padding: 1rem !important;
          }
          
          .dashboard-header {
            flex-direction: column !important;
            gap: 1rem;
          }
          
          .stats-grid {
            grid-template-columns: 1fr !important;
          }
          
          .realtime-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          
          .system-details {
            grid-template-columns: 1fr !important;
          }
        }
        
        @media (max-width: 480px) {
          .realtime-grid {
            grid-template-columns: 1fr !important;
          }
          
          .bookings-table {
            font-size: 0.8rem !important;
          }
          
          .stat-value {
            font-size: 1.8rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;

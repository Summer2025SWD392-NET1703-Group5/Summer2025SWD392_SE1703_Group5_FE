import React, { useState, useEffect } from "react";
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
import { getStaffPerformance, getStaffPerformanceById } from "../../config/StaffPerformanceApi";
import { getCinemaInfo } from "../../config/CinemasApi";
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

interface RoomData {
  totalRooms: number;
  occupancyRate: number;
  averageCapacity: number;
  peakHours: string;
}

interface CinemaData {
  Cinema_ID: number;
  Cinema_Name: string;
  Address: string;
  City: string;
  Province: string;
  Phone_Number: string;
  Email: string;
  Description: string;
  Status: string;
  Created_At: string;
  Updated_At: string;
  Rooms: Array<{
    Cinema_Room_ID: number;
    Room_Name: string;
    Seat_Quantity: number;
    Room_Type: string;
    Status: string;
    Notes: string;
    Cinema_ID: number;
  }>;
}

// CSS-in-JS Styles
const styles = {
  managerDashboard: {
    padding: "2rem",
    background: "#f8f9fa", // Changed to white/light gray background like other pages
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
    color: "#2c3e50", // Changed from white to dark text
  },

  dashboardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "2rem",
    background: "white", // Changed to solid white
    padding: "2rem",
    borderRadius: "16px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.07)", // Reduced shadow
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

  cinemaInfoSection: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.75rem",
    marginTop: "0.5rem",
  },

  cinemaMainInfo: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },

  cinemaIcon: {
    fontSize: "1.5rem",
    color: "#667eea",
  },

  cinemaName: {
    fontSize: "1.3rem",
    fontWeight: 600,
    color: "#2c3e50",
  },

  cinemaStatus: {
    padding: "0.25rem 0.75rem",
    borderRadius: "12px",
    fontSize: "0.8rem",
    fontWeight: 600,
    textTransform: "uppercase" as const,
  },

  statusActive: {
    background: "#d4edda",
    color: "#155724",
  },

  statusInactive: {
    background: "#f8d7da",
    color: "#721c24",
  },

  cinemaDetails: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "0.75rem",
    fontSize: "0.95rem",
    color: "#495057",
  },

  cinemaDetailItem: {
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
    boxShadow: "0 4px 12px rgba(40, 167, 69, 0.3)", // Reduced shadow
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
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "1.5rem",
    marginBottom: "2rem",
  },

  statCard: {
    background: "white", // Changed to solid white
    padding: "2rem",
    borderRadius: "16px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.07)", // Reduced shadow
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

  ticketsIcon: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },

  bookingsIcon: {
    background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  },

  occupancyIcon: {
    background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
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

  statSubtitle: {
    fontSize: "0.9rem",
    color: "#6c757d",
    marginTop: "0.5rem",
    fontWeight: 500,
  },

  filterSection: {
    background: "white", // Changed to solid white
    padding: "1.5rem 2rem",
    borderRadius: "16px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.07)", // Reduced shadow
    marginBottom: "2rem",
    border: "1px solid #e9ecef",
  },

  dateFilter: {
    display: "flex",
    alignItems: "center",
    gap: "1.5rem",
    flexWrap: "wrap" as const,
  },

  dateLabel: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.75rem",
    fontWeight: 600,
    color: "#2c3e50", // Ensured dark text color
    fontSize: "0.95rem",
  },

  dateInput: {
    padding: "0.75rem 1rem",
    border: "2px solid #e9ecef",
    borderRadius: "10px",
    fontSize: "0.95rem",
    transition: "all 0.2s ease",
    fontWeight: 500,
    color: "#2c3e50", // Ensured dark text color
    backgroundColor: "white", // Explicit white background
  },

  applyFilterBtn: {
    padding: "0.75rem 2rem",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontSize: "0.95rem",
    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
  },

  dashboardSection: {
    background: "white", // Changed to solid white
    borderRadius: "16px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.07)", // Reduced shadow
    marginBottom: "2rem",
    overflow: "hidden",
    border: "1px solid #e9ecef",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1.5rem 2rem",
    borderBottom: "1px solid #e9ecef",
    background: "#f8f9fa", // Light gray header background
  },

  sectionTitle: {
    margin: 0,
    color: "#2c3e50",
    fontSize: "1.4rem",
    fontWeight: 700,
  },

  periodSelector: {
    display: "flex",
    gap: "0.5rem",
  },

  periodBtn: {
    padding: "0.5rem 1rem",
    border: "1px solid #ced4da",
    background: "white",
    color: "#495057",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontWeight: 500,
  },

  activePeriodBtn: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    borderColor: "transparent",
  },

  realtimeBadge: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.5rem 1rem",
    background: "#d4edda",
    color: "#155724",
    borderRadius: "6px",
    fontSize: "0.9rem",
    fontWeight: 500,
  },

  pulseDot: {
    width: "8px",
    height: "8px",
    background: "#28a745",
    borderRadius: "50%",
    animation: "pulse 2s infinite",
  },

  sectionLoading: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "3rem",
  },

  gridContainer: {
    padding: "2rem",
    display: "grid",
    gap: "2rem",
  },

  bookingStatsGrid: {
    gridTemplateColumns: "1fr 1fr 1fr",
  },

  staffPerformanceGrid: {
    gridTemplateColumns: "1fr 2fr",
  },

  realtimeGrid: {
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  },

  chartContainer: {
    background: "#f8f9fa",
    borderRadius: "8px",
    padding: "1.5rem",
  },

  chartTitle: {
    margin: "0 0 1.5rem 0",
    color: "#2c3e50",
    fontWeight: 700,
    fontSize: "1.2rem",
  },

  chartPlaceholder: {
    background: "white",
    borderRadius: "12px",
    padding: "3rem",
    textAlign: "center" as const,
    border: "2px dashed #ced4da",
    color: "#495057",
  },

  chartData: {
    display: "flex",
    justifyContent: "space-around",
    marginTop: "1rem",
  },

  dataPoint: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.25rem",
  },

  statsSummary: {
    background: "#f8f9fa",
    borderRadius: "8px",
    padding: "1.5rem",
  },

  summaryTitle: {
    margin: "0 0 1.5rem 0",
    color: "#2c3e50",
    fontWeight: 700,
    fontSize: "1.2rem",
  },

  summaryGrid: {
    display: "grid",
    gap: "1rem",
  },

  summaryItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.75rem",
    background: "white",
    borderRadius: "6px",
    borderLeft: "4px solid #667eea",
    color: "#2c3e50", // Ensured dark text color
  },

  successText: {
    color: "#28a745",
  },

  cancelledText: {
    color: "#dc3545",
  },

  activeText: {
    color: "#17a2b8",
  },

  topPerformerText: {
    color: "#ffc107",
  },

  movieStats: {
    background: "#f8f9fa",
    borderRadius: "8px",
    padding: "1.5rem",
  },

  movieList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.75rem",
  },

  movieItem: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    padding: "0.75rem",
    background: "white",
    borderRadius: "6px",
    transition: "transform 0.2s ease",
    color: "#2c3e50", // Ensured dark text color
  },

  rank: {
    fontWeight: "bold",
    color: "#ffc107",
    minWidth: "2rem",
  },

  movieName: {
    flex: 1,
    fontWeight: 600,
    color: "#2c3e50",
    fontSize: "1rem",
  },

  tickets: {
    fontWeight: 700,
    color: "#495057",
    minWidth: "5rem",
    textAlign: "right" as const,
    fontSize: "1rem",
  },

  roomStats: {
    background: "#f8f9fa",
    borderRadius: "8px",
    padding: "1.5rem",
  },

  roomList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.75rem",
  },

  roomItem: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    padding: "0.75rem",
    background: "white",
    borderRadius: "6px",
    transition: "transform 0.2s ease",
    color: "#2c3e50", // Ensured dark text color
  },

  roomName: {
    flex: 1,
    fontWeight: 600,
    color: "#2c3e50",
    fontSize: "1rem",
  },

  occupancy: {
    fontWeight: 700,
    color: "#495057",
    minWidth: "4rem",
    textAlign: "right" as const,
    fontSize: "1rem",
  },

  occupancyBar: {
    flex: 1,
    height: "6px",
    background: "#e9ecef",
    borderRadius: "3px",
    overflow: "hidden",
    marginLeft: "1rem",
  },

  occupancyFill: {
    height: "100%",
    background: "linear-gradient(90deg, #28a745, #20c997)",
    borderRadius: "3px",
    transition: "width 0.3s ease",
  },

  staffList: {
    background: "#f8f9fa",
    borderRadius: "8px",
    padding: "1.5rem",
  },

  performanceList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.75rem",
  },

  staffItem: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    padding: "0.75rem",
    background: "white",
    borderRadius: "6px",
    transition: "transform 0.2s ease",
    color: "#2c3e50", // Ensured dark text color
  },

  staffName: {
    flex: 1,
    fontWeight: 600,
    color: "#2c3e50",
    fontSize: "1rem",
  },

  staffRole: {
    color: "#6c757d",
    fontSize: "0.9rem",
    fontWeight: 500,
  },

  performanceScore: {
    fontWeight: 700,
    color: "#495057",
    minWidth: "4rem",
    textAlign: "right" as const,
    fontSize: "1rem",
  },

  performanceBar: {
    flex: 1,
    height: "6px",
    background: "#e9ecef",
    borderRadius: "3px",
    overflow: "hidden",
    marginLeft: "1rem",
  },

  performanceFill: {
    height: "100%",
    background: "linear-gradient(90deg, #28a745, #20c997)",
    borderRadius: "3px",
    transition: "width 0.3s ease",
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

  realtimeLoading: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    padding: "3rem",
    gap: "1rem",
  },
};

const ManagerDashboard: React.FC = () => {
  // State for dashboard data
  const [salesData, setSalesData] = useState<SalesData | null>(null);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [staffData, setStaffData] = useState<StaffData | null>(null);
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [cinemaData, setCinemaData] = useState<CinemaData | null>(null);

  // State for detailed reports
  const [salesReport, setSalesReport] = useState<any>(null);
  const [bookingStats, setBookingStats] = useState<any>(null);
  const [staffPerformance, setStaffPerformance] = useState<any>(null);
  const [movieStats, setMovieStats] = useState<any>(null);
  const [realtimeData, setRealtimeData] = useState<any>(null);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [salesLoading, setSalesLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [staffLoading, setStaffLoading] = useState(false);

  // Date range state
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  // Selected period state
  const [selectedPeriod, setSelectedPeriod] = useState<"today" | "week" | "month">("today");

  // Load dashboard overview data
  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Get overview data for the last 30 days
      const [salesOverview, todaySales, realtimeSales] = await Promise.all([
        getSalesReportOverview(30),
        getTodaySalesReport(),
        getRealtimeSalesReport(),
      ]);

      // Set sales data
      setSalesData({
        totalRevenue: salesOverview?.totalRevenue || 0,
        totalTickets: salesOverview?.totalTickets || 0,
        averageTicketPrice: salesOverview?.averageTicketPrice || 0,
        growthRate: salesOverview?.growthRate || 0,
      });

      // Set realtime data
      setRealtimeData(realtimeSales);

      showSuccessToast("Dữ liệu dashboard đã được tải thành công");
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      showErrorToast("Không thể tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  };

  // Load sales report based on selected period
  const loadSalesReport = async (period: "today" | "week" | "month") => {
    try {
      setSalesLoading(true);
      let report;

      switch (period) {
        case "today":
          report = await getTodaySalesReport();
          break;
        case "week":
          report = await getCurrentWeekSalesReport();
          break;
        case "month":
          report = await getCurrentMonthSalesReport();
          break;
        default:
          report = await getTodaySalesReport();
      }

      setSalesReport(report);
    } catch (error) {
      console.error("Error loading sales report:", error);
      showErrorToast("Không thể tải báo cáo doanh số");
    } finally {
      setSalesLoading(false);
    }
  };

  // Load booking statistics
  const loadBookingStatistics = async () => {
    try {
      setBookingLoading(true);

      const [bookingStats, dailyStats, movieBookings, roomBookings, paymentStats] = await Promise.all([
        getBookingStatistics(dateRange.startDate, dateRange.endDate),
        getDailyBookingStatistics(dateRange.startDate, dateRange.endDate),
        getMovieBookingStatistics(dateRange.startDate, dateRange.endDate),
        getRoomBookingStatistics(dateRange.startDate, dateRange.endDate),
        getPaymentMethodsBookingStatistics(dateRange.startDate, dateRange.endDate),
      ]);

      setBookingStats({
        overview: bookingStats,
        daily: dailyStats,
        movies: movieBookings,
        rooms: roomBookings,
        payments: paymentStats,
      });

      // Set booking summary data
      setBookingData({
        totalBookings: bookingStats?.totalBookings || 0,
        successfulBookings: bookingStats?.successfulBookings || 0,
        cancelledBookings: bookingStats?.cancelledBookings || 0,
        successRate: bookingStats?.successRate || 0,
      });

      // Set room data
      setRoomData({
        totalRooms: roomBookings?.totalRooms || 0,
        occupancyRate: roomBookings?.occupancyRate || 0,
        averageCapacity: roomBookings?.averageCapacity || 0,
        peakHours: roomBookings?.peakHours || "N/A",
      });
    } catch (error) {
      console.error("Error loading booking statistics:", error);
      showErrorToast("Không thể tải thống kê đặt vé");
    } finally {
      setBookingLoading(false);
    }
  };

  // Load staff performance
  const loadStaffPerformance = async () => {
    try {
      setStaffLoading(true);

      const performance = await getStaffPerformance(dateRange.startDate, dateRange.endDate);
      setStaffPerformance(performance);

      // Set staff summary data
      setStaffData({
        totalStaff: performance?.totalStaff || 0,
        activeStaff: performance?.activeStaff || 0,
        averagePerformance: performance?.averagePerformance || 0,
        topPerformer: performance?.topPerformer?.name || "N/A",
      });
    } catch (error) {
      console.error("Error loading staff performance:", error);
      showErrorToast("Không thể tải hiệu suất nhân viên");
    } finally {
      setStaffLoading(false);
    }
  };

  // Load movie statistics
  const loadMovieStatistics = async () => {
    try {
      const movieSales = await getMovieSalesReport(dateRange.startDate, dateRange.endDate);
      setMovieStats(movieSales);
    } catch (error) {
      console.error("Error loading movie statistics:", error);
      showErrorToast("Không thể tải thống kê phim");
    }
  };

  // Load cinema information
  const loadCinemaInfo = async () => {
    try {
      const response = await getCinemaInfo();
      if (response.success && response.data) {
        setCinemaData(response.data);
      }
    } catch (error) {
      console.error("Error loading cinema info:", error);
      showErrorToast("Không thể tải thông tin rạp chiếu");
    }
  };

  // Handle period change
  const handlePeriodChange = (period: "today" | "week" | "month") => {
    setSelectedPeriod(period);
    loadSalesReport(period);
  };

  // Handle date range change
  const handleDateRangeChange = (field: "startDate" | "endDate", value: string) => {
    setDateRange((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Apply date range filter
  const applyDateFilter = () => {
    loadBookingStatistics();
    loadStaffPerformance();
    loadMovieStatistics();
  };

  // Initial load
  useEffect(() => {
    loadCinemaInfo();
    loadDashboardData();
    loadSalesReport("today");
    loadBookingStatistics();
    loadStaffPerformance();
    loadMovieStatistics();
  }, []);

  // Auto-refresh realtime data every 30 seconds
  useEffect(() => {
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

  if (loading) {
    return (
      <div style={{ ...styles.managerDashboard, ...styles.loading }}>
        <LoadingSpinner size="large" />
        <p>Đang tải dữ liệu dashboard...</p>
      </div>
    );
  }

  return (
    <div style={styles.managerDashboard}>
      {/* Header */}
      <div style={styles.dashboardHeader}>
        <div style={styles.headerContent}>
          <h1 style={styles.headerTitle}>Bảng Điều Khiển Quản Lý</h1>

          {cinemaData && (
            <div style={styles.cinemaInfoSection}>
              <div style={styles.cinemaMainInfo}>
                <span style={styles.cinemaIcon}>🎬</span>
                <span style={styles.cinemaName}>{cinemaData.Cinema_Name}</span>
                <span
                  style={{
                    ...styles.cinemaStatus,
                    ...(cinemaData.Status === "Active" ? styles.statusActive : styles.statusInactive),
                  }}
                >
                  {cinemaData.Status === "Active" ? "Hoạt động" : "Ngưng hoạt động"}
                </span>
              </div>

              <div style={styles.cinemaDetails}>
                <div style={styles.cinemaDetailItem}>
                  <span style={styles.detailIcon}>📍</span>
                  <span>
                    {cinemaData.Address}, {cinemaData.City}, {cinemaData.Province}
                  </span>
                </div>
                <div style={styles.cinemaDetailItem}>
                  <span style={styles.detailIcon}>📞</span>
                  <span>{cinemaData.Phone_Number}</span>
                </div>
                <div style={styles.cinemaDetailItem}>
                  <span style={styles.detailIcon}>📧</span>
                  <span>{cinemaData.Email}</span>
                </div>
                <div style={styles.cinemaDetailItem}>
                  <span style={styles.detailIcon}>🏢</span>
                  <span>{cinemaData.Rooms?.length || 0} phòng chiếu</span>
                </div>
              </div>
            </div>
          )}
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

      {/* Quick Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statCardBefore}></div>
          <div style={{ ...styles.statIcon, ...styles.revenueIcon }}>💰</div>
          <div style={styles.statContent}>
            <h3 style={styles.statTitle}>Doanh Thu Tháng</h3>
            <div style={styles.statValue}>{formatPrice(salesData?.totalRevenue || 0)}</div>
            <div
              style={{
                ...styles.statChange,
                ...((salesData?.growthRate || 0) >= 0 ? styles.positive : styles.negative),
              }}
            >
              {(salesData?.growthRate || 0) >= 0 ? "📈" : "📉"} {Math.abs(salesData?.growthRate || 0).toFixed(1)}%
            </div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statCardBefore}></div>
          <div style={{ ...styles.statIcon, ...styles.ticketsIcon }}>🎫</div>
          <div style={styles.statContent}>
            <h3 style={styles.statTitle}>Vé Đã Bán</h3>
            <div style={styles.statValue}>{formatNumber(salesData?.totalTickets || 0)}</div>
            <div style={styles.statSubtitle}>Giá TB: {formatPrice(salesData?.averageTicketPrice || 0)}</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statCardBefore}></div>
          <div style={{ ...styles.statIcon, ...styles.bookingsIcon }}>📊</div>
          <div style={styles.statContent}>
            <h3 style={styles.statTitle}>Tỷ Lệ Đặt Vé</h3>
            <div style={styles.statValue}>{(bookingData?.successRate || 0).toFixed(1)}%</div>
            <div style={styles.statSubtitle}>
              {formatNumber(bookingData?.successfulBookings || 0)} / {formatNumber(bookingData?.totalBookings || 0)}
            </div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statCardBefore}></div>
          <div style={{ ...styles.statIcon, ...styles.occupancyIcon }}>🏢</div>
          <div style={styles.statContent}>
            <h3 style={styles.statTitle}>Tỷ Lệ Lấp Đầy</h3>
            <div style={styles.statValue}>{(roomData?.occupancyRate || 0).toFixed(1)}%</div>
            <div style={styles.statSubtitle}>{cinemaData?.Rooms?.length || roomData?.totalRooms || 0} phòng</div>
          </div>
        </div>
      </div>

      {/* Date Range Filter */}
      <div style={styles.filterSection}>
        <div style={styles.dateFilter}>
          <label style={styles.dateLabel}>
            Từ ngày:
            <input
              style={styles.dateInput}
              type="date"
              value={dateRange.startDate}
              onChange={(e) => handleDateRangeChange("startDate", e.target.value)}
            />
          </label>
          <label style={styles.dateLabel}>
            Đến ngày:
            <input
              style={styles.dateInput}
              type="date"
              value={dateRange.endDate}
              onChange={(e) => handleDateRangeChange("endDate", e.target.value)}
            />
          </label>
          <button style={styles.applyFilterBtn} onClick={applyDateFilter}>
            Áp dụng
          </button>
        </div>
      </div>

      {/* Sales Report Section */}
      <div style={styles.dashboardSection}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Báo Cáo Doanh Số</h2>
          <div style={styles.periodSelector}>
            <button
              style={selectedPeriod === "today" ? { ...styles.periodBtn, ...styles.activePeriodBtn } : styles.periodBtn}
              onClick={() => handlePeriodChange("today")}
            >
              Hôm Nay
            </button>
            <button
              style={selectedPeriod === "week" ? { ...styles.periodBtn, ...styles.activePeriodBtn } : styles.periodBtn}
              onClick={() => handlePeriodChange("week")}
            >
              Tuần Này
            </button>
            <button
              style={selectedPeriod === "month" ? { ...styles.periodBtn, ...styles.activePeriodBtn } : styles.periodBtn}
              onClick={() => handlePeriodChange("month")}
            >
              Tháng Này
            </button>
          </div>
        </div>

        {salesLoading ? (
          <div style={styles.sectionLoading}>
            <LoadingSpinner />
          </div>
        ) : salesReport ? (
          <div style={styles.gridContainer}>
            <div style={styles.chartContainer}>
              <h4 style={styles.chartTitle}>Biểu Đồ Doanh Thu</h4>
              <div style={styles.chartPlaceholder}>
                <p>Biểu đồ doanh thu theo thời gian</p>
                <div style={styles.chartData}>
                  <div style={styles.dataPoint}>
                    <span>Doanh thu: </span>
                    <strong>{formatPrice(salesReport?.totalRevenue || 0)}</strong>
                  </div>
                  <div style={styles.dataPoint}>
                    <span>Số vé: </span>
                    <strong>{formatNumber(salesReport?.totalTickets || 0)}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <EmptyState title="Không có dữ liệu doanh số" description="Chọn khoảng thời gian để xem báo cáo" />
        )}
      </div>

      {/* Booking Statistics Section */}
      <div style={styles.dashboardSection}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Thống Kê Đặt Vé</h2>
        </div>

        {bookingLoading ? (
          <div style={styles.sectionLoading}>
            <LoadingSpinner />
          </div>
        ) : bookingStats ? (
          <div style={{ ...styles.gridContainer, ...styles.bookingStatsGrid }}>
            <div style={styles.statsSummary}>
              <h4 style={styles.summaryTitle}>Tổng Quan Đặt Vé</h4>
              <div style={styles.summaryGrid}>
                <div style={styles.summaryItem}>
                  <span>Tổng đơn đặt:</span>
                  <strong>{formatNumber(bookingStats.overview?.totalBookings || 0)}</strong>
                </div>
                <div style={styles.summaryItem}>
                  <span>Thành công:</span>
                  <strong style={styles.successText}>
                    {formatNumber(bookingStats.overview?.successfulBookings || 0)}
                  </strong>
                </div>
                <div style={styles.summaryItem}>
                  <span>Hủy bỏ:</span>
                  <strong style={styles.cancelledText}>
                    {formatNumber(bookingStats.overview?.cancelledBookings || 0)}
                  </strong>
                </div>
              </div>
            </div>

            <div style={styles.movieStats}>
              <h4 style={styles.summaryTitle}>Top Phim Bán Chạy</h4>
              {bookingStats.movies?.length > 0 ? (
                <div style={styles.movieList}>
                  {bookingStats.movies.slice(0, 5).map((movie: any, index: number) => (
                    <div key={index} style={styles.movieItem}>
                      <span style={styles.rank}>#{index + 1}</span>
                      <span style={styles.movieName}>{movie.title}</span>
                      <span style={styles.tickets}>{formatNumber(movie.ticketsSold)} vé</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p>Không có dữ liệu phim</p>
              )}
            </div>

            <div style={styles.roomStats}>
              <h4 style={styles.summaryTitle}>Hiệu Suất Phòng Chiếu</h4>
              {bookingStats.rooms?.length > 0 ? (
                <div style={styles.roomList}>
                  {bookingStats.rooms.slice(0, 5).map((room: any, index: number) => (
                    <div key={index} style={styles.roomItem}>
                      <span style={styles.roomName}>{room.name}</span>
                      <span style={styles.occupancy}>{(room.occupancyRate || 0).toFixed(1)}%</span>
                      <div style={styles.occupancyBar}>
                        <div style={{ ...styles.occupancyFill, width: `${room.occupancyRate || 0}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>Không có dữ liệu phòng</p>
              )}
            </div>
          </div>
        ) : (
          <EmptyState title="Không có dữ liệu đặt vé" description="Chọn khoảng thời gian để xem thống kê" />
        )}
      </div>

      {/* Staff Performance Section */}
      <div style={styles.dashboardSection}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Hiệu Suất Nhân Viên</h2>
        </div>

        {staffLoading ? (
          <div style={styles.sectionLoading}>
            <LoadingSpinner />
          </div>
        ) : staffPerformance ? (
          <div style={{ ...styles.gridContainer, ...styles.staffPerformanceGrid }}>
            <div style={styles.statsSummary}>
              <h4 style={styles.summaryTitle}>Tổng Quan Nhân Viên</h4>
              <div style={styles.summaryGrid}>
                <div style={styles.summaryItem}>
                  <span>Tổng nhân viên:</span>
                  <strong>{staffData?.totalStaff || 0}</strong>
                </div>
                <div style={styles.summaryItem}>
                  <span>Đang hoạt động:</span>
                  <strong style={styles.activeText}>{staffData?.activeStaff || 0}</strong>
                </div>
                <div style={styles.summaryItem}>
                  <span>Hiệu suất TB:</span>
                  <strong>{(staffData?.averagePerformance || 0).toFixed(1)}%</strong>
                </div>
                <div style={styles.summaryItem}>
                  <span>Nhân viên xuất sắc:</span>
                  <strong style={styles.topPerformerText}>{staffData?.topPerformer}</strong>
                </div>
              </div>
            </div>

            <div style={styles.staffList}>
              <h4 style={styles.summaryTitle}>Bảng Xếp Hạng Nhân Viên</h4>
              {staffPerformance.staff?.length > 0 ? (
                <div style={styles.performanceList}>
                  {staffPerformance.staff.slice(0, 10).map((staff: any, index: number) => (
                    <div key={index} style={styles.staffItem}>
                      <span style={styles.rank}>#{index + 1}</span>
                      <span style={styles.staffName}>{staff.name}</span>
                      <span style={styles.staffRole}>{staff.role}</span>
                      <span style={styles.performanceScore}>{(staff.performanceScore || 0).toFixed(1)}%</span>
                      <div style={styles.performanceBar}>
                        <div style={{ ...styles.performanceFill, width: `${staff.performanceScore || 0}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>Không có dữ liệu nhân viên</p>
              )}
            </div>
          </div>
        ) : (
          <EmptyState title="Không có dữ liệu nhân viên" description="Chọn khoảng thời gian để xem hiệu suất" />
        )}
      </div>

      {/* Realtime Updates Section */}
      <div style={styles.dashboardSection}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Dữ Liệu Thời Gian Thực</h2>
          <div style={styles.realtimeBadge}>
            <span style={styles.pulseDot}></span>
            Cập nhật tự động
          </div>
        </div>

        {realtimeData ? (
          <div style={{ ...styles.gridContainer, ...styles.realtimeGrid }}>
            <div style={styles.realtimeCard}>
              <h4 style={styles.realtimeCardTitle}>Doanh Thu Hôm Nay</h4>
              <div style={styles.realtimeValue}>{formatPrice(realtimeData.todayRevenue || 0)}</div>
              <div style={styles.realtimeSubtitle}>Cập nhật lần cuối: {formatDateTime(realtimeData.lastUpdate)}</div>
            </div>

            <div style={styles.realtimeCard}>
              <h4 style={styles.realtimeCardTitle}>Vé Bán Trong Giờ</h4>
              <div style={styles.realtimeValue}>{formatNumber(realtimeData.ticketsThisHour || 0)}</div>
              <div style={styles.realtimeSubtitle}>Tổng hôm nay: {formatNumber(realtimeData.ticketsToday || 0)}</div>
            </div>

            <div style={styles.realtimeCard}>
              <h4 style={styles.realtimeCardTitle}>Khách Hàng Online</h4>
              <div style={styles.realtimeValue}>{formatNumber(realtimeData.onlineUsers || 0)}</div>
              <div style={styles.realtimeSubtitle}>Đang xem trang</div>
            </div>

            <div style={styles.realtimeCard}>
              <h4 style={styles.realtimeCardTitle}>Suất Chiếu Hiện Tại</h4>
              <div style={styles.realtimeValue}>{realtimeData.currentShows || 0}</div>
              <div style={styles.realtimeSubtitle}>Đang diễn ra</div>
            </div>
          </div>
        ) : (
          <div style={styles.realtimeLoading}>
            <LoadingSpinner />
            <p>Đang tải dữ liệu thời gian thực...</p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
          100% { opacity: 1; transform: scale(1); }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
        }
        
        .movie-item:hover,
        .room-item:hover,
        .staff-item:hover,
        .summary-item:hover {
          transform: translateX(8px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1) !important;
        }
        
        .realtime-card:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 12px 40px rgba(102, 126, 234, 0.4) !important;
        }
        
        .apply-filter-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4) !important;
        }
        
        .date-input:focus {
          outline: none;
          border-color: #667eea !important;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
        }
        
        /* Fix for date input text visibility */
        input[type="date"] {
          color: #2c3e50 !important;
          background-color: white !important;
        }
        
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(0.5);
        }
        
        /* Ensure all text in white containers is visible */
        .manager-dashboard label,
        .manager-dashboard span,
        .manager-dashboard p {
          color: #2c3e50 !important;
        }
        
        /* Exception for cards with gradient backgrounds */
        .realtime-card *,
        .realtime-indicator * {
          color: white !important;
        }
        
        @media (max-width: 768px) {
          .cinema-details {
            grid-template-columns: 1fr !important;
          }
          
          .cinema-main-info {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 0.5rem !important;
          }
          
          .header-controls {
            width: 100% !important;
          }
          
          .realtime-indicator {
            width: 100% !important;
            justify-content: center !important;
          }
          
          .date-filter {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          
          .date-label {
            width: 100% !important;
          }
          
          .date-input {
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ManagerDashboard;

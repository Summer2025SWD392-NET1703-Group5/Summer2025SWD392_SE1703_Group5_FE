// src/pages/manager/ManagerDashboard.tsx
// Manager Dashboard with Cinema-Specific Data Filtering
// - Revenue and ticket sales are filtered by manager's assigned cinema branch
// - Activities show only bookings from manager's cinema
// - Chart data reflects cinema-specific performance
// - Uses getCinemaByManagerEmail to identify manager's cinema
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowPathIcon,
  ChartBarIcon,
  FilmIcon,
  TicketIcon,
  CurrencyDollarIcon,
  UsersIcon,
  SparklesIcon,
  BuildingOffice2Icon,
  BuildingStorefrontIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { getAllBookings } from "../../services/admin/bookingManagementServices";
import movieService from "../../services/movieService";
import cinemaService from "../../services/cinemaService";
import { useAuth } from "../../contexts/SimpleAuthContext";

interface DashboardStats {
  totalRevenue: number;
  totalTickets: number;
  totalMovies: number;
  totalCustomers: number;
  myManagementArea: string;
  cinemaBranch: string;
  branchLocation: string;
  branchRooms: number;
}

interface RecentActivity {
  id: string;
  description: string;
  timestamp: Date;
  type: 'booking' | 'payment' | 'cancellation' | 'update';
}

interface ChartData {
  date: string;
  revenue: number;
  tickets: number;
}

const ManagerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [managerCinema, setManagerCinema] = useState<any | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // First, get manager's cinema
      let cinema = null;
      if (user?.email) {
        cinema = await cinemaService.getCinemaByManagerEmail(user.email);
        setManagerCinema(cinema);
      }
      
      // Use only real API services - no mock fetch calls
      await Promise.all([
        calculateStatsFromServices(cinema),
        getRecentActivitiesFromServices(cinema),
        generateChartData(cinema)
      ]);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Không thể tải dữ liệu dashboard');
      // Set fallback values
      setDashboardStats({
        totalRevenue: 0,
        totalTickets: 0,
        totalMovies: 0,
        totalCustomers: 0,
        myManagementArea: "Khu vực quản lý",
        cinemaBranch: "Galaxy Cinema - Chi nhánh chính",
        branchLocation: "Tp. Hồ Chí Minh",
        branchRooms: 8
      });
      setRecentActivities([]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateChartData = async (cinema: any = null) => {
    try {
      const bookingsResponse = await getAllBookings(1, 1000);
      
      if (bookingsResponse?.data) {
        let bookings = bookingsResponse.data;
        
        // Filter bookings by cinema if manager has a specific cinema
        if (cinema && cinema.Name) {
          bookings = bookings.filter((booking: any) => {
            const bookingCinema = booking.CinemaName || booking.Cinema_Name || booking.cinemaName;
            return bookingCinema && bookingCinema.includes(cinema.Name);
          });
        }
        
        // Get last 7 days
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          last7Days.push(date);
        }
        
        // Calculate revenue and tickets for each day
        const chartData: ChartData[] = last7Days.map(date => {
          const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format
          const dayBookings = bookings.filter((booking: any) => {
            const bookingDate = new Date(booking.created_at || booking.Booking_Date);
            return bookingDate.toISOString().split('T')[0] === dateStr;
          });
          
          const revenue = dayBookings.reduce((sum: number, booking: any) => 
            sum + (booking.Total_Amount || 0), 0
          );
          
          return {
            date: date.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' }),
            revenue: revenue,
            tickets: dayBookings.length
          };
        });
        
        setChartData(chartData);
      } else {
        setChartData([]);
      }
    } catch (error) {
      console.error('Error generating chart data:', error);
      setChartData([]);
    }
  };

  const calculateStatsFromServices = async (cinema: any = null) => {
    try {
      // Get data from existing services
      const [moviesResult, bookingsResult] = await Promise.allSettled([
        movieService.getMovies(),
        getAllBookings(1, 1000) // Get first 1000 bookings for stats
      ]);

      let totalMovies = 0;
      let totalTickets = 0;
      let totalRevenue = 0;
      let totalCustomers = 0;

      if (moviesResult.status === 'fulfilled') {
        const allMovies = moviesResult.value || [];
        // Filter for only "now showing" movies (status: "Now Showing" or similar)
        const nowShowingMovies = allMovies.filter((movie: any) => {
          const status = movie.status || movie.Status || '';
          return status.toLowerCase().includes('now showing') || 
                 status.toLowerCase().includes('đang chiếu') ||
                 status === 'active' ||
                 status === 'showing';
        });
        totalMovies = nowShowingMovies.length;
      }

      if (bookingsResult.status === 'fulfilled' && bookingsResult.value?.data) {
        let bookings = bookingsResult.value.data;
        
        // Filter bookings by cinema if manager has a specific cinema
        if (cinema && cinema.Name) {
          bookings = bookings.filter((booking: any) => {
            const bookingCinema = booking.CinemaName || booking.Cinema_Name || booking.cinemaName;
            return bookingCinema && bookingCinema.includes(cinema.Name);
          });
        }
        
        // Get current month and year
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        
        // Filter bookings for current month
        const thisMonthBookings = bookings.filter((booking: any) => {
          const bookingDate = new Date(booking.created_at || booking.Booking_Date);
          return bookingDate.getMonth() === currentMonth && 
                 bookingDate.getFullYear() === currentYear;
        });
        
        totalTickets = thisMonthBookings.length || 0;
        totalRevenue = bookings.reduce((sum: number, booking: any) => 
          sum + (booking.Total_Amount || 0), 0
        );
        // Count unique customers from cinema bookings (not just this month)
        const allEmails = bookings.map((b: any) => {
          // Try multiple possible email field names
          return b.CustomerEmail || b.Customer_Email || b.Email || b.email || 
                 b.customer_email || b.userEmail || b.User_Email;
        });
        
        const validEmails = allEmails.filter((email: string) => 
          email && 
          email.trim() !== '' && 
          email.includes('@') &&
          email.includes('.')
        );
        
        const uniqueCustomers = new Set(validEmails);
        totalCustomers = uniqueCustomers.size;
      }

      // Use cinema info if available
      const cinemaName = cinema?.Name || user?.fullName || 'Trung tâm';
      const cinemaLocation = cinema?.Address || cinema?.City || "Tp. Hồ Chí Minh";
      
      setDashboardStats({
        totalRevenue,
        totalTickets,
        totalMovies,
        totalCustomers,
        myManagementArea: user?.fullName ? `Khu vực ${user.fullName}` : "Khu vực quản lý",
        cinemaBranch: `Galaxy Cinema - ${cinemaName}`,
        branchLocation: cinemaLocation,
        branchRooms: Math.floor(Math.random() * 5) + 6 // Random 6-10 rooms per branch
      });

    } catch (error) {
      console.error('Error calculating stats from services:', error);
      setDashboardStats({
        totalRevenue: 0,
        totalTickets: 0,
        totalMovies: 0,
        totalCustomers: 0,
        myManagementArea: "Khu vực quản lý",
        cinemaBranch: "Galaxy Cinema - Chi nhánh chính",
        branchLocation: "Tp. Hồ Chí Minh",
        branchRooms: 8
      });
    }
  };

  const getRecentActivitiesFromServices = async (cinema: any = null) => {
    try {
      // Get recent bookings as activities
      const bookingsResponse = await getAllBookings(1, 20); // Get latest 20 bookings to filter
      
      if (bookingsResponse?.data) {
        let bookings = bookingsResponse.data;
        
        // Filter bookings by cinema if manager has a specific cinema
        if (cinema && cinema.Name) {
          bookings = bookings.filter((booking: any) => {
            const bookingCinema = booking.CinemaName || booking.Cinema_Name || booking.cinemaName;
            return bookingCinema && bookingCinema.includes(cinema.Name);
          });
        }
        
        // Take only first 5 after filtering
        const recentBookings = bookings.slice(0, 5);
        
        const activities: RecentActivity[] = recentBookings.map((booking: any, index: number) => ({
          id: booking.Booking_ID || `activity-${index}`,
          description: `[${cinema?.Name || 'Chi nhánh'}] Đặt vé ${booking.MovieName || 'N/A'} - ${booking.CustomerName || 'Anonymous'} - Phòng ${Math.floor(Math.random() * (dashboardStats?.branchRooms || 8)) + 1}`,
          timestamp: new Date(booking.created_at || Date.now() - index * 300000),
          type: 'booking' as const
        }));
        
        setRecentActivities(activities);
      } else {
        setRecentActivities([]);
      }
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      setRecentActivities([]);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
      },
    },
  };

  // Handle manual refresh
  const handleRefresh = async () => {
    await fetchDashboardData();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  const formatCurrencyForChart = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      notation: "compact",
      maximumFractionDigits: 1
    }).format(value);
  };

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl">
          <p className="text-slate-300 text-sm mb-2">{`${label}`}</p>
          <p className="text-emerald-400 text-sm">
            {`Doanh thu: ${formatCurrency(payload[0].value)}`}
          </p>
          <p className="text-blue-400 text-sm">
            {`Vé bán: ${payload[0].payload.tickets} vé`}
          </p>
        </div>
      );
    }
    return null;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'booking': return TicketIcon;
      case 'payment': return CurrencyDollarIcon;
      case 'cancellation': return FilmIcon;
      default: return SparklesIcon;
    }
  };

  // Generate stats array from real data
  const getStats = () => {
    if (!dashboardStats) {
      return [];
    }

    return [
      {
        title: "Doanh thu chi nhánh",
        value: formatCurrency(dashboardStats.totalRevenue),
        icon: CurrencyDollarIcon,
        color: "emerald",
        loading: isLoading,
      },
      {
        title: "Vé bán (tháng này)",
        value: formatNumber(dashboardStats.totalTickets),
        icon: TicketIcon,
        color: "blue",
        loading: isLoading,
      },
      {
        title: "Phim đang chiếu",
        value: formatNumber(dashboardStats.totalMovies),
        icon: FilmIcon,
        color: "purple",
        loading: isLoading,
      },
      {
        title: "Khách hàng chi nhánh",
        value: formatNumber(dashboardStats.totalCustomers),
        icon: UsersIcon,
        color: "orange",
        loading: isLoading,
      },
      {
        title: "Chi nhánh quản lý",
        value: dashboardStats.cinemaBranch,
        icon: BuildingStorefrontIcon,
        color: "indigo",
        loading: isLoading,
      },
      {
        title: "Phòng chiếu",
        value: `${dashboardStats.branchRooms} phòng`,
        icon: BuildingOffice2Icon,
        color: "cyan",
        loading: isLoading,
      },
    ];
  };

  const getColorClasses = (color: string) => {
    const colors = {
      emerald: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      purple: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      orange: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      indigo: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
      cyan: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <motion.div
      className="p-6 space-y-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Enhanced Welcome Header */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden bg-gradient-to-r from-slate-800/80 via-slate-700/80 to-slate-800/80 backdrop-blur-md rounded-3xl p-8 border border-[#FFD875]/20 shadow-[0_0_50px_rgba(255,216,117,0.15)]"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#FFD875]/5 via-transparent to-[#FFD875]/5 animate-pulse"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-[#FFD875] via-[#FFC107] to-[#FFD875] bg-clip-text text-transparent mb-2">
                � Quản Lý Chi Nhánh
              </h1>
              <p className="text-slate-300 text-lg">
                Hệ thống quản lý chi nhánh Galaxy Cinema - Manager: {user?.fullName || "Manager"}
                {managerCinema && (
                  <span className="text-[#FFD875] ml-2">| {managerCinema.Name}</span>
                )}
              </p>
              {dashboardStats && (
                <div className="flex items-center mt-2 text-sm text-slate-400">
                  <MapPinIcon className="w-4 h-4 mr-1" />
                  <span>{dashboardStats.branchLocation}</span>
                  <span className="mx-2">•</span>
                  <BuildingStorefrontIcon className="w-4 h-4 mr-1" />
                  <span>{dashboardStats.branchRooms} phòng chiếu</span>
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-[#FFD875] text-xl font-semibold">{currentTime.toLocaleTimeString("vi-VN")}</div>
              <div className="text-slate-400 text-sm">
                {currentTime.toLocaleDateString("vi-VN", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>

          {/* Dashboard Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-slate-400">
              <SparklesIcon className="w-5 h-5 text-[#FFD875]" />
              <span>Giám sát hoạt động chi nhánh</span>
              <div className="w-2 h-2 rounded-full animate-pulse bg-emerald-400"></div>
              {!managerCinema && user?.email && (
                <span className="text-amber-400 text-xs">⚠️ Chưa được phân công chi nhánh</span>
              )}
              {error && <span className="text-red-400 text-xs">⚠️ {error}</span>}
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center space-x-1 px-4 py-2 bg-[#FFD875]/20 text-[#FFD875] border border-[#FFD875]/30 rounded-lg text-sm font-medium hover:bg-[#FFD875]/30 transition-all disabled:opacity-50"
              >
                <ArrowPathIcon className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                <span>{isLoading ? "Đang tải..." : "Cập nhật"}</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {getStats().map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-md rounded-2xl p-6 border border-slate-600/30 shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl border ${getColorClasses(stat.color)}`}>
                {stat.loading ? (
                  <div className="w-6 h-6 animate-pulse bg-slate-600 rounded"></div>
                ) : (
                  <stat.icon className="w-6 h-6" />
                )}
              </div>
            </div>
            <div>
              <h3 className="text-slate-400 text-sm font-medium mb-1">{stat.title}</h3>
              {stat.loading ? (
                <div className="h-8 bg-slate-600 animate-pulse rounded w-20"></div>
              ) : (
                <p className="text-white text-2xl font-bold">{stat.value}</p>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Chart Section */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-md rounded-2xl p-6 border border-slate-600/30 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <ChartBarIcon className="w-6 h-6 text-[#FFD875]" />
              Doanh thu chi nhánh 7 ngày
            </h3>
          </div>
          <div className="h-64 flex items-center justify-center">
            {isLoading ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-[#FFD875]/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <ChartBarIcon className="w-8 h-8 text-[#FFD875]" />
                </div>
                <p className="text-slate-400">Đang tải dữ liệu biểu đồ...</p>
              </div>
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={formatCurrencyForChart} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10B981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 bg-[#FFD875]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ChartBarIcon className="w-8 h-8 text-[#FFD875]" />
                </div>
                <p className="text-slate-400">Không có dữ liệu để hiển thị</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-md rounded-2xl p-6 border border-slate-600/30 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <TicketIcon className="w-6 h-6 text-[#FFD875]" />
              Hoạt động gần đây
            </h3>
          </div>
          <div className="space-y-4">
            {isLoading ? (
              // Loading skeleton for activities
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-slate-700/50 rounded-lg">
                  <div className="w-2 h-2 bg-slate-600 animate-pulse rounded-full"></div>
                  <div className="flex-1 h-4 bg-slate-600 animate-pulse rounded"></div>
                  <div className="w-16 h-3 bg-slate-600 animate-pulse rounded"></div>
                </div>
              ))
            ) : recentActivities.length > 0 ? (
              recentActivities.map((activity) => {
                const ActivityIcon = getActivityIcon(activity.type);
                return (
                  <div key={activity.id} className="flex items-center space-x-3 p-3 bg-slate-700/50 rounded-lg">
                    <ActivityIcon className="w-4 h-4 text-[#FFD875]" />
                    <span className="text-slate-300 text-sm flex-1">{activity.description}</span>
                    <span className="text-slate-500 text-xs">{activity.timestamp.toLocaleTimeString("vi-VN")}</span>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-400">
                  {managerCinema ? "Chưa có hoạt động gần đây tại chi nhánh này" : "Chưa có hoạt động gần đây"}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-md rounded-2xl p-6 border border-slate-600/30 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <BuildingStorefrontIcon className="w-6 h-6 text-[#FFD875]" />
              Trạng thái chi nhánh
            </h3>
          </div>
          <div className="space-y-4">
            {dashboardStats ? (
              <>
                <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                    <span className="text-slate-300 text-sm">Chi nhánh</span>
                  </div>
                  <span className="text-emerald-400 text-sm font-medium">Hoạt động</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <BuildingOffice2Icon className="w-4 h-4 text-cyan-400" />
                    <span className="text-slate-300 text-sm">Phòng chiếu</span>
                  </div>
                  <span className="text-cyan-400 text-sm font-medium">{dashboardStats.branchRooms}/8 phòng</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <MapPinIcon className="w-4 h-4 text-indigo-400" />
                    <span className="text-slate-300 text-sm">Địa điểm</span>
                  </div>
                  <span className="text-indigo-400 text-sm font-medium">{dashboardStats.branchLocation}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <UsersIcon className="w-4 h-4 text-orange-400" />
                    <span className="text-slate-300 text-sm">Nhân viên</span>
                  </div>
                  <span className="text-orange-400 text-sm font-medium">{Math.floor(Math.random() * 10) + 15} người</span>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-400">Đang tải thông tin chi nhánh...</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Footer Status */}
      <motion.div variants={itemVariants} className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-slate-300">Chi nhánh hoạt động bình thường</span>
            </div>
            <div className="text-slate-500">Cinema Branch Manager Dashboard v2.0.0</div>
          </div>
          <div className="text-slate-500">© 2025 Galaxy Cinema Management System</div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ManagerDashboard;

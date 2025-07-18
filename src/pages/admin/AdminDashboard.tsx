// src/pages/admin/AdminDashboard.tsx
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
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getAllBookings } from "../../services/admin/bookingManagementServices";
import movieService from "../../services/movieService";
import cinemaService from "../../services/cinemaService";

interface DashboardStats {
  totalRevenue: number;
  totalTickets: number;
  totalMovies: number;
  totalCustomers: number;
  totalCinemas: number;
}

interface RecentActivity {
  id: string;
  description: string;
  timestamp: Date;
  type: "booking" | "payment" | "cancellation" | "update";
}

interface ChartData {
  date: string;
  revenue: number;
  tickets: number;
}

const AdminDashboard: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [error, setError] = useState<string | null>(null);

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
      // Use only real API services - no mock fetch calls
      await Promise.all([calculateStatsFromServices(), getRecentActivitiesFromServices(), generateChartDataLocal()]);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Không thể tải dữ liệu dashboard");
      // Set fallback values
      setDashboardStats({
        totalRevenue: 0,
        totalTickets: 0,
        totalMovies: 0,
        totalCustomers: 0,
        totalCinemas: 0,
      });
      setRecentActivities([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Alternative approach - if you want to work entirely in local time:
  const generateChartDataLocal = async () => {
    try {
      const bookingsResponse = await getAllBookings(1, 2000);

      if (bookingsResponse?.data) {
        const bookings = bookingsResponse.data.filter((booking: any) => {
          return booking.Status === "Confirmed" || booking.Status === "Đã xác nhận";
        });

        // Get last 7 days in local time
        const today = new Date();
        const last7Days = [];

        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          date.setHours(0, 0, 0, 0); // Reset to midnight local time
          last7Days.push(date);
        }

        const formatDateLocal = (date: Date): string => {
          return (
            date.getFullYear() +
            "-" +
            String(date.getMonth() + 1).padStart(2, "0") +
            "-" +
            String(date.getDate()).padStart(2, "0")
          );
        };

        // Helper: parse ISO date string as if it’s in local time
        const parseLocalISOString = (isoString: string): Date => {
          const parts = isoString.split(/[-T:.Z]/).map(Number);
          return new Date(parts[0], parts[1] - 1, parts[2], parts[3] || 0, parts[4] || 0, parts[5] || 0, parts[6] || 0);
        };

        const chartData: ChartData[] = last7Days.map((date) => {
          const dateStr = formatDateLocal(date);
          const dayBookings = bookings.filter((booking: any) => {
            const bookingDate = parseLocalISOString(booking.Booking_Date || booking.created_at);
            const localBookingDate = new Date(bookingDate.getFullYear(), bookingDate.getMonth(), bookingDate.getDate());
            const bookingDateStr = formatDateLocal(localBookingDate);
            return bookingDateStr === dateStr;
          });
          const revenue = dayBookings.reduce((sum: number, booking: any) => sum + (booking.Total_Amount || 0), 0);

          return {
            date: date.toLocaleDateString("vi-VN", { month: "short", day: "numeric" }),
            revenue: revenue,
            tickets: dayBookings.length,
          };
        });

        setChartData(chartData);
      } else {
        setChartData([]);
      }
    } catch (error) {
      console.error("Error generating chart data:", error);
      setChartData([]);
    }
  };

  const calculateStatsFromServices = async () => {
    try {
      // Get data from existing services
      const [moviesResult, bookingsResult, cinemasResult] = await Promise.allSettled([
        movieService.getMovies(),
        getAllBookings(1, 1000), // Get first 1000 bookings for stats
        cinemaService.getAllCinemas(), // Get all cinemas for count
      ]);

      let totalMovies = 0;
      let totalTickets = 0;
      let totalRevenue = 0;
      let totalCustomers = 0;
      let totalCinemas = 0;

      if (moviesResult.status === "fulfilled") {
        const allMovies = moviesResult.value || [];
        // Filter for only "now showing" movies (status: "Now Showing" or similar)
        const nowShowingMovies = allMovies.filter((movie: any) => {
          const status = movie.status || movie.Status || "";
          return (
            status.toLowerCase().includes("now showing") ||
            status.toLowerCase().includes("đang chiếu") ||
            status === "active" ||
            status === "showing"
          );
        });
        totalMovies = nowShowingMovies.length;
      }

      if (bookingsResult.status === "fulfilled" && bookingsResult.value?.data) {
        const bookings = bookingsResult.value.data;

        // Get current month and year
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        // Filter bookings for current month
        const thisMonthBookings = bookings.filter((booking: any) => {
          const bookingDate = new Date(booking.created_at || booking.Booking_Date);
          return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
        });

        totalTickets = thisMonthBookings.length || 0;
        totalRevenue = bookings.reduce((sum: number, booking: any) => sum + (booking.Total_Amount || 0), 0);
        // Count unique customers from all bookings (not just this month)
        const allEmails = bookings.map((b: any) => {
          // Try multiple possible email field names
          return (
            b.CustomerEmail || b.Customer_Email || b.Email || b.email || b.customer_email || b.userEmail || b.User_Email
          );
        });

        const validEmails = allEmails.filter(
          (email: string) => email && email.trim() !== "" && email.includes("@") && email.includes(".")
        );

        const uniqueCustomers = new Set(validEmails);

        totalCustomers = uniqueCustomers.size;
      }

      if (cinemasResult.status === "fulfilled") {
        const cinemas = cinemasResult.value || [];
        totalCinemas = cinemas.length;
      } else {
        totalCinemas = 0; // Fallback to known value
      }

      setDashboardStats({
        totalRevenue,
        totalTickets,
        totalMovies,
        totalCustomers,
        totalCinemas, // Use dynamic value from cinema service
      });
    } catch (error) {
      console.error("Error calculating stats from services:", error);
      setDashboardStats({
        totalRevenue: 0,
        totalTickets: 0,
        totalMovies: 0,
        totalCustomers: 0,
        totalCinemas: 0,
      });
    }
  };

  const getRecentActivitiesFromServices = async () => {
    try {
      const bookingsResponse = await getAllBookings(1, 20); // Get more in case some are unconfirmed

      if (bookingsResponse?.data) {
        // Parse ISO string as if it's local time (ignoring misleading 'Z')
        const parseLocalISOString = (isoString: string): Date => {
          const parts = isoString.split(/[-T:.Z]/).map(Number);
          return new Date(parts[0], parts[1] - 1, parts[2], parts[3] || 0, parts[4] || 0, parts[5] || 0, parts[6] || 0);
        };

        // Filter to confirmed bookings
        const confirmedBookings = bookingsResponse.data.filter(
          (booking: any) => booking.Status === "Confirmed" || booking.Status === "Đã xác nhận"
        );

        // Limit to the latest 5 confirmed
        const latestConfirmed = confirmedBookings.slice(0, 5);

        const activities: RecentActivity[] = latestConfirmed.map((booking: any, index: number) => {
          const rawTimestamp = booking.Booking_Date || Date.now() - index * 300000;
          const timestamp =
            typeof rawTimestamp === "string" ? parseLocalISOString(rawTimestamp) : new Date(rawTimestamp);
          return {
            id: booking.Booking_ID || `activity-${index}`,
            description: `Đặt vé phim ${booking.MovieName || "N/A"} - Khách hàng: ${
              booking.CustomerName || "Anonymous"
            }`,
            timestamp,
            type: "booking" as const,
          };
        });

        setRecentActivities(activities);
      } else {
        setRecentActivities([]);
      }
    } catch (error) {
      console.error("Error fetching recent activities:", error);
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
      maximumFractionDigits: 1,
    }).format(value);
  };

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl">
          <p className="text-slate-300 text-sm mb-2">{`${label}`}</p>
          <p className="text-emerald-400 text-sm">{`Doanh thu: ${formatCurrency(payload[0].value)}`}</p>
          <p className="text-blue-400 text-sm">{`Vé bán: ${payload[0].payload.tickets} vé`}</p>
        </div>
      );
    }
    return null;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "booking":
        return TicketIcon;
      case "payment":
        return CurrencyDollarIcon;
      case "cancellation":
        return FilmIcon;
      default:
        return SparklesIcon;
    }
  };

  // Generate stats array from real data
  const getStats = () => {
    if (!dashboardStats) {
      return [];
    }

    return [
      {
        title: "Tổng doanh thu",
        value: formatCurrency(dashboardStats.totalRevenue),
        icon: CurrencyDollarIcon,
        color: "emerald",
        loading: isLoading,
      },
      {
        title: "Vé bán tháng này",
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
        title: "Khách hàng",
        value: formatNumber(dashboardStats.totalCustomers),
        icon: UsersIcon,
        color: "orange",
        loading: isLoading,
      },
      {
        title: "Chi nhánh rạp",
        value: formatNumber(dashboardStats.totalCinemas),
        icon: BuildingOfficeIcon,
        color: "indigo",
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
                🌟 Dashboard Quản Trị
              </h1>
              <p className="text-slate-300 text-lg">Hệ thống quản lý rạp chiếu phim Galaxy Cinema</p>
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
              <span>Hệ thống hoạt động ổn định</span>
              <div className="w-2 h-2 rounded-full animate-pulse bg-emerald-400"></div>
              {error && <span className="text-red-400 text-xs">⚠️ {error}</span>}
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center space-x-1 px-4 py-2 bg-[#FFD875]/20 text-[#FFD875] border border-[#FFD875]/30 rounded-lg text-sm font-medium hover:bg-[#FFD875]/30 transition-all disabled:opacity-50"
              >
                <ArrowPathIcon className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                <span>{isLoading ? "Đang tải..." : "Làm mới"}</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-md rounded-2xl p-6 border border-slate-600/30 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <ChartBarIcon className="w-6 h-6 text-[#FFD875]" />
              Doanh thu 7 ngày qua
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
                    <span className="text-slate-500 text-xs flex flex-col text-right leading-tight">
                      <span>{activity.timestamp.toLocaleTimeString("vi-VN")}</span>
                      <span className="text-slate-400">{activity.timestamp.toLocaleDateString("vi-VN")}</span>
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-400">Chưa có hoạt động gần đây</p>
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
              <span className="text-slate-300">Hệ thống hoạt động bình thường</span>
            </div>
            <div className="text-slate-500">Version: 2.0.0</div>
          </div>
          <div className="text-slate-500">© 2025 Galaxy Cinema Management System</div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AdminDashboard;

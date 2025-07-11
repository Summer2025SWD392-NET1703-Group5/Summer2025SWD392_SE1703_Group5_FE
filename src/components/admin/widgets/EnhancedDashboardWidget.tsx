import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  CurrencyDollarIcon,
  TicketIcon,
  FilmIcon,
  UsersIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  StarIcon,
  GiftIcon,
  ChartPieIcon,
  BellIcon,
  PlusIcon,
  DocumentChartBarIcon,
  UserGroupIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { formatCurrency, formatNumber } from "../../../utils/dashboardUtils";
import type { DashboardOverview, RealtimeData } from "../../../types/dashboard";

interface EnhancedDashboardWidgetProps {
  overview: DashboardOverview;
  realtime: RealtimeData;
  enhancedStats?: {
    // Row 2 - Operations Metrics
    todayShowtimes: number;
    totalCinemas: number;
    occupancyRate: number;
    avgRating: number;

    // Row 3 - Business Metrics
    ticketsSold: number;
    weeklyRevenue: number;
    activePromotions: number;
    growthRate: number;
  };
  notifications?: any[];
  recentActivities?: any[];
  isLoading?: boolean;
  className?: string;
}

const EnhancedDashboardWidget: React.FC<EnhancedDashboardWidgetProps> = ({
  overview,
  realtime,
  enhancedStats,
  notifications = [],
  recentActivities = [],
  isLoading = false,
  className = "",
}) => {
  // Row 1 - Core Metrics (hiện tại có)
  const coreStats = [
    {
      name: "Tổng Phim",
      value: "156", // Mock data for now
      growth: +5.2,
      icon: FilmIcon,
      color: "from-purple-400 to-purple-600",
    },
    {
      name: "Đặt Vé Hôm Nay",
      value: formatNumber(realtime.todayBookings),
      growth: overview.bookingsGrowth,
      icon: TicketIcon,
      color: "from-blue-400 to-blue-600",
    },
    {
      name: "Khách Hàng Mới",
      value: "34", // Mock data for now
      growth: +12.3,
      icon: UsersIcon,
      color: "from-green-400 to-green-600",
    },
    {
      name: "Doanh Thu",
      value: formatCurrency(overview.totalRevenue),
      growth: overview.revenueGrowth,
      icon: CurrencyDollarIcon,
      color: "from-emerald-400 to-emerald-600",
    },
  ];

  // Row 2 - Operations Metrics (cần thêm)
  const operationsStats = [
    {
      name: "Suất Chiếu Hôm Nay",
      value: formatNumber(enhancedStats?.todayShowtimes || 0),
      icon: ClockIcon,
      color: "from-orange-400 to-orange-600",
    },
    {
      name: "Tổng Rạp Phim",
      value: formatNumber(enhancedStats?.totalCinemas || 0),
      icon: BuildingOfficeIcon,
      color: "from-cyan-400 to-cyan-600",
    },
    {
      name: "Tỷ Lệ Lấp Đầy",
      value: `${enhancedStats?.occupancyRate || 0}%`,
      icon: ChartBarIcon,
      color: "from-indigo-400 to-indigo-600",
    },
    {
      name: "Đánh Giá TB",
      value: `${enhancedStats?.avgRating || 0}⭐`,
      icon: StarIcon,
      color: "from-yellow-400 to-yellow-600",
    },
  ];

  // Row 3 - Business Metrics (cần thêm)
  const businessStats = [
    {
      name: "Vé Đã Bán",
      value: formatNumber(enhancedStats?.ticketsSold || 0),
      icon: TicketIcon,
      color: "from-pink-400 to-pink-600",
    },
    {
      name: "Doanh Thu Tuần",
      value: formatCurrency(enhancedStats?.weeklyRevenue || 0),
      icon: CurrencyDollarIcon,
      color: "from-emerald-400 to-emerald-600",
    },
    {
      name: "Khuyến Mãi",
      value: formatNumber(enhancedStats?.activePromotions || 0),
      icon: GiftIcon,
      color: "from-red-400 to-red-600",
    },
    {
      name: "Tăng Trưởng",
      value: `${enhancedStats?.growthRate || 0}%`,
      icon: ChartPieIcon,
      color: (enhancedStats?.growthRate || 0) >= 0 ? "from-green-400 to-green-600" : "from-red-400 to-red-600",
    },
  ];

  // Quick Actions Configuration
  const quickActions = [
    {
      title: "Quản Lý Phim",
      description: "Thêm, sửa, xóa phim",
      icon: FilmIcon,
      href: "/admin/movies",
      color: "from-purple-500 to-purple-700",
    },
    {
      title: "Quản Lý Rạp",
      description: "Quản lý cinema & phòng chiếu",
      icon: BuildingOfficeIcon,
      href: "/admin/cinemas",
      color: "from-blue-500 to-blue-700",
    },
    {
      title: "Suất Chiếu",
      description: "Tạo & quản lý lịch chiếu",
      icon: ClockIcon,
      href: "/admin/showtimes",
      color: "from-orange-500 to-orange-700",
    },
    {
      title: "Khách Hàng",
      description: "Quản lý thông tin khách hàng",
      icon: UserGroupIcon,
      href: "/admin/customers",
      color: "from-green-500 to-green-700",
    },
    {
      title: "Báo Cáo Doanh Thu",
      description: "Xem chi tiết doanh thu",
      icon: DocumentChartBarIcon,
      href: "/admin/reports",
      color: "from-emerald-500 to-emerald-700",
    },
    {
      title: "Phân Tích KH",
      description: "Insights về khách hàng",
      icon: ChartBarIcon,
      href: "/admin/analytics",
      color: "from-cyan-500 to-cyan-700",
    },
    {
      title: "Quản Lý Giá Vé",
      description: "Cài đặt & cập nhật giá",
      icon: CurrencyDollarIcon,
      href: "/admin/ticket-pricing",
      color: "from-yellow-500 to-yellow-700",
    },
    {
      title: "Khuyến Mãi",
      description: "Tạo & quản lý promotion",
      icon: GiftIcon,
      href: "/admin/promotions",
      color: "from-red-500 to-red-700",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
    },
  };

  // Render Stats Component
  const renderStatCard = (stat: any) => {
    const Icon = stat.icon;
    const isPositiveGrowth = stat.growth !== undefined ? stat.growth >= 0 : true;
    const GrowthIcon = isPositiveGrowth ? ArrowTrendingUpIcon : ArrowTrendingDownIcon;

    return (
      <motion.div
        key={stat.name}
        variants={itemVariants}
        whileHover={{
          scale: 1.02,
          y: -4,
        }}
        className={`relative overflow-hidden bg-gradient-to-br ${
          stat.color
        } p-6 rounded-2xl border border-white/20 shadow-2xl transition-all duration-300 group backdrop-blur-sm ${
          isLoading ? "animate-pulse" : ""
        }`}
      >
        {/* Background overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-black/20"></div>

        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-500"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12 group-hover:scale-110 transition-transform duration-700"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm border border-white/30 group-hover:bg-white/30 transition-colors duration-300">
              <Icon className="w-7 h-7 text-white drop-shadow-sm" />
            </div>

            {stat.growth !== undefined && (
              <div
                className={`flex items-center px-3 py-1.5 rounded-full backdrop-blur-sm border ${
                  isPositiveGrowth
                    ? "bg-green-500/20 border-green-400/30 text-green-100"
                    : "bg-red-500/20 border-red-400/30 text-red-100"
                }`}
              >
                <GrowthIcon className="w-4 h-4 mr-1" />
                <span className="font-bold text-sm">
                  {isPositiveGrowth ? "+" : ""}
                  {stat.growth.toFixed(1)}%
                </span>
              </div>
            )}
          </div>

          <div>
            <p className="text-white/90 text-sm font-semibold mb-2 uppercase tracking-wide">{stat.name}</p>
            <p className="text-4xl font-bold text-white drop-shadow-sm">
              {isLoading ? (
                <span className="inline-block w-20 h-10 bg-white/20 rounded animate-pulse"></span>
              ) : (
                stat.value
              )}
            </p>
          </div>
        </div>

        {/* Hover shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      </motion.div>
    );
  };

  return (
    <motion.div className={`space-y-8 ${className}`} variants={containerVariants} initial="hidden" animate="visible">
      {/* Row 1 - Core Metrics */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent flex items-center">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-[#FFD875] to-amber-500 rounded-xl mr-3 shadow-lg">
              <CurrencyDollarIcon className="w-6 h-6 text-black" />
            </div>
            📊 Core Metrics
          </h3>
          <div className="text-sm text-gray-400 bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700/50">
            Cập nhật real-time
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {coreStats.map((stat) => renderStatCard(stat))}
        </div>
      </motion.div>

      {/* Row 2 - Operations Metrics */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent flex items-center">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mr-3 shadow-lg">
              <Cog6ToothIcon className="w-6 h-6 text-white" />
            </div>
            🎭 Operations Metrics
          </h3>
          <div className="text-sm text-gray-400 bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700/50">
            Hoạt động hệ thống
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {operationsStats.map((stat) => renderStatCard(stat))}
        </div>
      </motion.div>

      {/* Row 3 - Business Metrics */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent flex items-center">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl mr-3 shadow-lg">
              <ChartBarIcon className="w-6 h-6 text-white" />
            </div>
            💼 Business Metrics
          </h3>
          <div className="text-sm text-gray-400 bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700/50">
            Phân tích kinh doanh
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {businessStats.map((stat) => renderStatCard(stat))}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent flex items-center">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl mr-3 shadow-lg">
              <PlusIcon className="w-6 h-6 text-white" />
            </div>
            🚀 Thao Tác Nhanh
          </h3>
          <div className="text-sm text-gray-400 bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700/50">
            Truy cập nhanh
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={action.title}
                variants={itemVariants}
                whileHover={{
                  scale: 1.02,
                  y: -4,
                }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to={action.href}
                  className={`block p-6 bg-gradient-to-br ${action.color} rounded-2xl border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 group backdrop-blur-sm`}
                >
                  {/* Background overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-black/20 rounded-2xl"></div>

                  {/* Animated background pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-500"></div>
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm border border-white/30 group-hover:bg-white/30 transition-colors duration-300">
                        <Icon className="w-6 h-6 text-white drop-shadow-sm" />
                      </div>
                      <div className="w-2 h-2 bg-white/40 rounded-full group-hover:bg-white/60 transition-colors duration-300"></div>
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-lg mb-2 group-hover:text-white/90 transition-colors duration-300">
                        {action.title}
                      </h4>
                      <p className="text-white/80 text-sm leading-relaxed group-hover:text-white/70 transition-colors duration-300">
                        {action.description}
                      </p>
                    </div>
                  </div>

                  {/* Hover shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-2xl"></div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Two Column Layout - Charts & Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Hourly Revenue Chart */}
        {realtime.hourlyRevenue.length > 0 && (
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent flex items-center">
                <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-[#FFD875] to-amber-500 rounded-lg mr-3 shadow-lg">
                  <ClockIcon className="w-5 h-5 text-black" />
                </div>
                📈 Doanh Thu Theo Giờ
              </h3>
            </div>
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-end space-x-1 h-32">
                {realtime.hourlyRevenue.map((hour) => {
                  const maxRevenue = Math.max(...realtime.hourlyRevenue.map((h) => h.revenue));
                  const height = maxRevenue > 0 ? (hour.revenue / maxRevenue) * 100 : 0;
                  const isCurrentHour = hour.hour === new Date().getHours();

                  return (
                    <div key={hour.hour} className="flex-1 flex flex-col items-center group">
                      <div className="w-full relative">
                        <motion.div
                          className={`w-full rounded-t-sm transition-all duration-300 ${
                            isCurrentHour ? "bg-[#FFD875]" : "bg-slate-600 group-hover:bg-slate-500"
                          }`}
                          style={{ height: `${height}%` }}
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          transition={{ duration: 0.5, delay: hour.hour * 0.02 }}
                        />
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-slate-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                          {hour.hour}:00 - {formatCurrency(hour.revenue)}
                        </div>
                      </div>
                      <span className={`text-xs mt-1 ${isCurrentHour ? "text-[#FFD875] font-bold" : "text-slate-400"}`}>
                        {hour.hour}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Recent Activities & Alerts */}
        <motion.div variants={itemVariants} className="space-y-6">
          {/* Alerts & Notifications */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <BellIcon className="w-6 h-6 text-[#FFD875] mr-2" />
              🔔 Thông Báo
            </h3>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 space-y-3">
              {notifications.length > 0 ? (
                notifications.slice(0, 3).map((notification, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-lg">
                    <div className="flex-shrink-0">
                      <BellIcon className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm">{notification.title || "Thông báo mới"}</p>
                      <p className="text-slate-400 text-xs">{notification.time || "Vừa xong"}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <BellIcon className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm">Không có thông báo mới</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activities */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <ClockIcon className="w-6 h-6 text-[#FFD875] mr-2" />
              📱 Hoạt Động Gần Đây
            </h3>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 space-y-3">
              {recentActivities.length > 0 ? (
                recentActivities.slice(0, 4).map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-lg">
                    <div className="flex-shrink-0 text-xl">{activity.icon || "📋"}</div>
                    <div className="flex-1">
                      <p className="text-white text-sm">{activity.title}</p>
                      <p className="text-slate-400 text-xs">
                        {activity.count && `${activity.count} items`}
                        {activity.amount && ` - ${formatCurrency(activity.amount)}`}
                      </p>
                    </div>
                    <div className="text-xs text-slate-500">
                      {activity.time ? new Date(activity.time).toLocaleTimeString() : "Vừa xong"}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <ClockIcon className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm">Chưa có hoạt động nào</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default EnhancedDashboardWidget;
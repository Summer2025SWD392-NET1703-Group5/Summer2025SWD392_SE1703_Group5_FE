// src/pages/admin/AdminDashboard.tsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowPathIcon,
  DocumentArrowDownIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { useEnhancedDashboard } from "../../contexts/EnhancedDashboardContext";
import EnhancedDashboardWidget from "../../components/admin/widgets/EnhancedDashboardWidget";

const AdminDashboard: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { state, refreshAllData, toggleAutoRefresh, exportToExcel, resetError } = useEnhancedDashboard();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Extract data from Enhanced Dashboard Context
  const { data, isLoading, error, lastRefresh, autoRefresh } = state;
  const { overview, realtime, enhancedStats, notifications, recentActivities } = data;

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
    console.log("[AdminDashboard] Manual refresh triggered");
    await refreshAllData();
  };

  // Handle export
  const handleExport = async () => {
    console.log("[AdminDashboard] Export triggered");
    await exportToExcel("sales");
  };

  return (
    <motion.div
      className="p-6 space-y-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Enhanced Welcome Header with Controls */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden bg-gradient-to-r from-slate-800/80 via-slate-700/80 to-slate-800/80 backdrop-blur-md rounded-3xl p-8 border border-[#FFD875]/20 shadow-[0_0_50px_rgba(255,216,117,0.15)]"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#FFD875]/5 via-transparent to-[#FFD875]/5 animate-pulse"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-[#FFD875] via-[#FFC107] to-[#FFD875] bg-clip-text text-transparent mb-2">
                🌟 Enhanced Dashboard
              </h1>
              <p className="text-slate-300 text-lg">
                Hệ thống quản lý rạp chiếu phim Galaxy Cinema - Toàn bộ chức năng
              </p>
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
              <span>Enhanced Dashboard hoạt động ổn định</span>
              <div
                className={`w-2 h-2 rounded-full animate-pulse ${isLoading ? "bg-yellow-400" : "bg-emerald-400"}`}
              ></div>
              {lastRefresh && (
                <span className="text-xs text-slate-500">Cập nhật: {lastRefresh.toLocaleTimeString("vi-VN")}</span>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={toggleAutoRefresh}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  autoRefresh
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-slate-600/50 text-slate-400 border border-slate-500/30"
                }`}
              >
                Auto: {autoRefresh ? "ON" : "OFF"}
              </button>

              <button
                onClick={handleExport}
                disabled={isLoading}
                className="flex items-center space-x-1 px-3 py-1.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-medium hover:bg-blue-500/30 transition-all disabled:opacity-50"
              >
                <DocumentArrowDownIcon className="w-4 h-4" />
                <span>Export</span>
              </button>

              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center space-x-1 px-3 py-1.5 bg-[#FFD875]/20 text-[#FFD875] border border-[#FFD875]/30 rounded-lg text-xs font-medium hover:bg-[#FFD875]/30 transition-all disabled:opacity-50"
              >
                <ArrowPathIcon className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                <span>{isLoading ? "Đang tải..." : "Làm mới"}</span>
              </button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center space-x-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
              <span className="text-red-400 text-sm">{error}</span>
              <button onClick={resetError} className="ml-auto text-red-400 hover:text-red-300 text-xs underline">
                Đóng
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Enhanced Dashboard Widget - TẤT CẢ FEATURES TRONG ĐÂY */}
      <motion.div variants={itemVariants}>
        <EnhancedDashboardWidget
          overview={overview}
          realtime={realtime}
          enhancedStats={enhancedStats}
          notifications={notifications}
          recentActivities={recentActivities}
          isLoading={isLoading}
          className="space-y-8"
        />
      </motion.div>

      {/* Footer Status */}
      <motion.div variants={itemVariants} className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-slate-300">Hệ thống hoạt động bình thường</span>
            </div>
            <div className="text-slate-500">Version: 2.0.0 Enhanced</div>
          </div>
          <div className="text-slate-500">© 2024 Galaxy Cinema Management System</div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AdminDashboard;
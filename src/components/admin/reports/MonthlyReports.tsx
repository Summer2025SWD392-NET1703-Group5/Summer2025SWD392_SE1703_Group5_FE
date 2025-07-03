import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DocumentChartBarIcon,
  ArrowPathIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  CurrencyDollarIcon,
  TicketIcon,
  UserGroupIcon,
  FilmIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import reportService, { type MonthlyReportData } from '../../../services/reportService';
import toast from 'react-hot-toast';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const MonthlyReports: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [isLoading, setIsLoading] = useState(false);
  const [monthlyData, setMonthlyData] = useState<MonthlyReportData | null>(null);

  // Fetch data from API
  const fetchMonthlyData = async () => {
    setIsLoading(true);
    try {
      const data = await reportService.getMonthlyReport(selectedMonth);
      setMonthlyData(data);
      
    } catch (error) {
      console.error('[MonthlyReports] Lỗi lấy báo cáo:', error);
      toast.error('Không thể lấy báo cáo tháng. Vui lòng thử lại.');
      setMonthlyData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthlyData();
  }, [selectedMonth]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  // Chart data - Fixed to use actual API data with proper labels
  const lineChartData = {
    labels: monthlyData?.dailyLabels || [],
    datasets: [
      {
        label: 'Doanh thu',
        data: monthlyData?.dailyRevenue || [],
        borderColor: '#FFD875',
        backgroundColor: 'rgba(255, 216, 117, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const barChartData = {
    labels: monthlyData?.topMovies.map(m => m.name) || [],
    datasets: [
      {
        label: 'Doanh thu',
        data: monthlyData?.topMovies.map(m => m.revenue) || [],
        backgroundColor: '#FFD875',
        borderRadius: 8
      }
    ]
  };

  // Removed doughnut chart data - không cần nữa

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(30, 41, 59, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#FFD875',
        borderWidth: 1
      }
    },
    scales: {
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#94a3b8'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#94a3b8'
        }
      }
    }
  };

  const handleExport = async () => {
    try {
      const startDate = `${selectedMonth}-01`;
      const selectedDate = new Date(selectedMonth + '-01');
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth() + 1;
      const endDate = new Date(year, month, 0).toISOString().split('T')[0];
      
      await reportService.exportReportToExcel('sales', startDate, endDate, 'monthly');
      toast.success('Xuất báo cáo Excel thành công!');
    } catch (error) {
      console.error('Lỗi xuất báo cáo:', error);
      toast.error('Không thể xuất báo cáo. Vui lòng thử lại.');
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Báo cáo tháng</h1>

        <div className="flex gap-2">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg border border-slate-600 focus:border-[#FFD875] focus:outline-none"
          />

          <button
            onClick={fetchMonthlyData}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-all flex items-center gap-1"
          >
            <ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </button>

          <button
            onClick={handleExport}
            className="px-4 py-2 bg-[#FFD875] text-black rounded-lg hover:bg-[#e5c368] transition-all flex items-center gap-1 shadow-[0_0_20px_rgba(255,216,117,0.5)] hover:shadow-[0_0_30px_rgba(255,216,117,0.7)]"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            <span>Xuất báo cáo</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-96">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-[#FFD875] border-t-transparent rounded-full"
          />
        </div>
      ) : monthlyData ? (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-800 rounded-lg p-6 border border-slate-700"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Tổng doanh thu</p>
                  <h3 className="text-2xl font-bold text-white mt-1">
                    {formatCurrency(monthlyData.revenue)}
                  </h3>
                  <div className="flex items-center gap-1 mt-2">
                    {monthlyData.revenueGrowth > 0 ? (
                      <ArrowTrendingUpIcon className="w-4 h-4 text-green-400" />
                    ) : (
                      <ArrowTrendingDownIcon className="w-4 h-4 text-red-400" />
                    )}
                    <span className={`text-sm ${monthlyData.revenueGrowth > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {monthlyData.revenueGrowth > 0 ? '+' : ''}{monthlyData.revenueGrowth}%
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-[#FFD875]/20 rounded-lg">
                  <CurrencyDollarIcon className="w-6 h-6 text-[#FFD875]" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-800 rounded-lg p-6 border border-slate-700"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Vé bán ra</p>
                  <h3 className="text-2xl font-bold text-white mt-1">
                    {formatNumber(monthlyData.tickets)}
                  </h3>
                  <div className="flex items-center gap-1 mt-2">
                    {monthlyData.ticketGrowth > 0 ? (
                      <ArrowTrendingUpIcon className="w-4 h-4 text-green-400" />
                    ) : (
                      <ArrowTrendingDownIcon className="w-4 h-4 text-red-400" />
                    )}
                    <span className={`text-sm ${monthlyData.ticketGrowth > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {monthlyData.ticketGrowth > 0 ? '+' : ''}{monthlyData.ticketGrowth}%
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-[#FFD875]/20 rounded-lg">
                  <TicketIcon className="w-6 h-6 text-[#FFD875]" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-800 rounded-lg p-6 border border-slate-700"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Khách hàng</p>
                  <h3 className="text-2xl font-bold text-white mt-1">
                    {formatNumber(monthlyData.customers)}
                  </h3>
                  <div className="flex items-center gap-1 mt-2">
                    {monthlyData.customerGrowth > 0 ? (
                      <ArrowTrendingUpIcon className="w-4 h-4 text-green-400" />
                    ) : (
                      <ArrowTrendingDownIcon className="w-4 h-4 text-red-400" />
                    )}
                    <span className={`text-sm ${monthlyData.customerGrowth > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {monthlyData.customerGrowth > 0 ? '+' : ''}{monthlyData.customerGrowth}%
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-[#FFD875]/20 rounded-lg">
                  <UserGroupIcon className="w-6 h-6 text-[#FFD875]" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-slate-800 rounded-lg p-6 border border-slate-700"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Phim chiếu</p>
                  <h3 className="text-2xl font-bold text-white mt-1">
                    {formatNumber(monthlyData.movies)}
                  </h3>
                  <p className="text-sm text-gray-400 mt-2">Bộ phim</p>
                </div>
                <div className="p-3 bg-[#FFD875]/20 rounded-lg">
                  <FilmIcon className="w-6 h-6 text-[#FFD875]" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 gap-6">
            {/* Daily Revenue Chart - Full width */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-slate-800 rounded-lg p-6 border border-slate-700"
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <ChartBarIcon className="w-5 h-5 text-[#FFD875]" />
                Doanh thu theo ngày
              </h3>
              <div className="h-64">
                <Line data={lineChartData} options={chartOptions} />
              </div>
            </motion.div>
          </div>

          {/* Top Movies */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-slate-800 rounded-lg p-6 border border-slate-700"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FilmIcon className="w-5 h-5 text-[#FFD875]" />
              Top phim doanh thu cao
            </h3>
            <div className="h-64">
              <Bar
                data={barChartData}
                options={{
                  ...chartOptions,
                  indexAxis: 'y' as const,
                  scales: {
                    ...chartOptions.scales,
                    x: {
                      ...chartOptions.scales.x,
                      ticks: {
                        ...chartOptions.scales.x.ticks,
                        callback: function (value) {
                          return formatCurrency(Number(value));
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </motion.div>

          {/* Top Movies Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden"
          >
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Chi tiết phim</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Tên phim
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Doanh thu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Vé bán ra
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      % Tổng doanh thu
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {monthlyData.topMovies.map((movie, index) => (
                    <tr key={index} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {movie.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {formatCurrency(movie.revenue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {formatNumber(movie.tickets)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {((movie.revenue / monthlyData.revenue) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      ) : null}
    </div>
  );
};

export default MonthlyReports; 
// src/pages/admin/Analytics.tsx
import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  UsersIcon,
  TicketIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency, formatNumber } from '../../utils/dashboardUtils';

interface AnalyticsData {
  revenue: {
    total: number;
    change: number;
    data: Array<{ date: string; amount: number; bookings: number }>;
  };
  bookings: {
    total: number;
    change: number;
    data: Array<{ date: string; count: number }>;
  };
  users: {
    total: number;
    change: number;
    new: number;
  };
  movies: {
    popular: Array<{ title: string; bookings: number; revenue: number }>;
    genres: Array<{ name: string; value: number; color: string }>;
  };
  cinemas: {
    performance: Array<{ name: string; revenue: number; bookings: number; occupancy: number }>;
  };
  timeSlots: {
    data: Array<{ time: string; bookings: number }>;
  };
}

const Analytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7days');

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockData: AnalyticsData = {
        revenue: {
          total: 125000000,
          change: 12.5,
          data: [
            { date: '2024-01-08', amount: 15000000, bookings: 150 },
            { date: '2024-01-09', amount: 18000000, bookings: 180 },
            { date: '2024-01-10', amount: 22000000, bookings: 220 },
            { date: '2024-01-11', amount: 16000000, bookings: 160 },
            { date: '2024-01-12', amount: 25000000, bookings: 250 },
            { date: '2024-01-13', amount: 28000000, bookings: 280 },
            { date: '2024-01-14', amount: 21000000, bookings: 210 },
          ],
        },
        bookings: {
          total: 1450,
          change: 8.3,
          data: [
            { date: '2024-01-08', count: 150 },
            { date: '2024-01-09', count: 180 },
            { date: '2024-01-10', count: 220 },
            { date: '2024-01-11', count: 160 },
            { date: '2024-01-12', count: 250 },
            { date: '2024-01-13', count: 280 },
            { date: '2024-01-14', count: 210 },
          ],
        },
        users: {
          total: 15420,
          change: 15.2,
          new: 234,
        },
        movies: {
          popular: [
            { title: 'Avatar: The Way of Water', bookings: 450, revenue: 45000000 },
            { title: 'Top Gun: Maverick', bookings: 380, revenue: 38000000 },
            { title: 'Black Panther: Wakanda Forever', bookings: 320, revenue: 32000000 },
            { title: 'The Batman', bookings: 280, revenue: 28000000 },
            { title: 'Doctor Strange 2', bookings: 250, revenue: 25000000 },
          ],
          genres: [
            { name: 'Hành động', value: 35, color: '#3B82F6' },
            { name: 'Khoa học viễn tưởng', value: 25, color: '#10B981' },
            { name: 'Chính kịch', value: 20, color: '#F59E0B' },
            { name: 'Hài', value: 12, color: '#EF4444' },
            { name: 'Kinh dị', value: 8, color: '#8B5CF6' },
          ],
        },
        cinemas: {
          performance: [
            { name: 'CGV Vincom Center', revenue: 45000000, bookings: 450, occupancy: 85 },
            { name: 'Lotte Cinema Diamond Plaza', revenue: 38000000, bookings: 380, occupancy: 78 },
            { name: 'Galaxy Cinema Nguyen Du', revenue: 32000000, bookings: 320, occupancy: 72 },
            { name: 'BHD Star Cineplex', revenue: 28000000, bookings: 280, occupancy: 68 },
          ],
        },
        timeSlots: {
          data: [
            { time: '09:00', bookings: 45 },
            { time: '12:00', bookings: 120 },
            { time: '15:00', bookings: 180 },
            { time: '18:00', bookings: 250 },
            { time: '21:00', bookings: 320 },
            { time: '00:00', bookings: 85 },
          ],
        },
      };
      
      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !analyticsData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    change: number;
    icon: React.ReactNode;
    color: string;
  }> = ({ title, value, change, icon, color }) => (
    <div className="bg-slate-800 rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          <div className="flex items-center mt-2">
            {change >= 0 ? (
              <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
            ) : (
              <ArrowTrendingDownIcon className="w-4 h-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {Math.abs(change)}%
            </span>
            <span className="text-gray-400 text-sm ml-1">so với tuần trước</span>
          </div>
        </div>
        <div className={`w-12 h-12 ${color} rounded-full flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Thống kê & Phân tích</h1>
          <p className="text-gray-400">Tổng quan hiệu suất kinh doanh</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-yellow-500 focus:outline-none"
          >
            <option value="7days">7 ngày qua</option>
            <option value="30days">30 ngày qua</option>
            <option value="3months">3 tháng qua</option>
            <option value="1year">1 năm qua</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Tổng doanh thu"
          value={formatCurrency(analyticsData.revenue.total)}
          change={analyticsData.revenue.change}
          icon={<CurrencyDollarIcon className="w-6 h-6 text-white" />}
          color="bg-green-500"
        />
        <StatCard
          title="Tổng đặt vé"
          value={formatNumber(analyticsData.bookings.total)}
          change={analyticsData.bookings.change}
          icon={<TicketIcon className="w-6 h-6 text-white" />}
          color="bg-blue-500"
        />
        <StatCard
          title="Người dùng"
          value={formatNumber(analyticsData.users.total)}
          change={analyticsData.users.change}
          icon={<UsersIcon className="w-6 h-6 text-white" />}
          color="bg-purple-500"
        />
        <StatCard
          title="Người dùng mới"
          value={formatNumber(analyticsData.users.new)}
          change={25.4}
          icon={<UsersIcon className="w-6 h-6 text-white" />}
          color="bg-yellow-500"
        />
      </div>

      {/* Revenue & Bookings Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Doanh thu theo ngày</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analyticsData.revenue.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#9CA3AF"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' })}
              />
              <YAxis 
                stroke="#9CA3AF"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${value / 1000000}M`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
                formatter={(value: number) => [formatCurrency(value), 'Doanh thu']}
                labelFormatter={(label) => new Date(label).toLocaleDateString('vi-VN')}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Số lượng đặt vé</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.bookings.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#9CA3AF"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' })}
              />
              <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
                formatter={(value: number) => [value, 'Đặt vé']}
                labelFormatter={(label) => new Date(label).toLocaleDateString('vi-VN')}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Popular Movies & Genre Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Phim phổ biến</h3>
          <div className="space-y-3">
            {analyticsData.movies.popular.map((movie, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                <div>
                  <h4 className="text-white font-medium">{movie.title}</h4>
                  <p className="text-gray-400 text-sm">{movie.bookings} đặt vé</p>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-semibold">{formatCurrency(movie.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Phân bố thể loại</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData.movies.genres}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {analyticsData.movies.genres.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cinema Performance */}
      <div className="bg-slate-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Hiệu suất rạp chiếu</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analyticsData.cinemas.performance}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="name" 
              stroke="#9CA3AF"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F9FAFB'
              }}
              formatter={(value: number, name: string) => {
                if (name === 'revenue') return [formatCurrency(value), 'Doanh thu'];
                if (name === 'bookings') return [value, 'Đặt vé'];
                if (name === 'occupancy') return [`${value}%`, 'Tỷ lệ lấp đầy'];
                return [value, name];
              }}
            />
            <Legend />
            <Bar dataKey="revenue" fill="#10B981" name="revenue" />
            <Bar dataKey="bookings" fill="#3B82F6" name="bookings" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Time Slot Analysis */}
      <div className="bg-slate-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Phân tích khung giờ</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analyticsData.timeSlots.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="time" 
              stroke="#9CA3AF"
              tick={{ fontSize: 12 }}
            />
            <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F9FAFB'
              }}
              formatter={(value: number) => [value, 'Số đặt vé']}
            />
            <Bar 
              dataKey="bookings" 
              fill="#F59E0B"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Analytics;


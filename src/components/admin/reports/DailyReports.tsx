import React, { useState, useEffect } from 'react';
import { 
  DocumentChartBarIcon, 
  ArrowPathIcon, 
  CalendarDaysIcon,
  CurrencyDollarIcon,
  TicketIcon,
  UserIcon,
  FilmIcon,
  BuildingOfficeIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowDownTrayIcon,
  PrinterIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
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
  Filler,
} from 'chart.js';
import 'react-datepicker/dist/react-datepicker.css';
import FullScreenLoader from '../../../components/FullScreenLoader';
import reportService, { type DailyReportData } from '../../../services/reportService';
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

const DailyReports: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState<boolean>(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([
    'revenue', 'bookings', 'movies', 'cinemas', 'payments'
  ]);
  const [reportData, setReportData] = useState<DailyReportData | null>(null);

  useEffect(() => {
    fetchReportData();
  }, [selectedDate]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const data = await reportService.getDailyReport(dateStr);
      setReportData(data);
      
    } catch (error) {
      console.error('[DailyReports] Lỗi lấy báo cáo:', error);
      toast.error('Không thể lấy báo cáo ngày. Vui lòng thử lại.');
      
      // Fallback to null nếu có lỗi
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  // Removed generateHourlyData() - now using real data from API

  const generateTopMovies = () => {
    const movieTitles = [
      'Deadpool & Wolverine',
      'Inside Out 2',
      'Twisters',
      'Despicable Me 4',
      'A Quiet Place: Day One'
    ];

    return movieTitles.map((title, index) => ({
      id: `movie-${index + 1}`,
      title,
      revenue: Math.floor(Math.random() * 50000000) + 10000000,
      bookings: Math.floor(Math.random() * 200) + 50,
      occupancyRate: Math.floor(Math.random() * 50) + 50,
    }));
  };

  const generateCinemaData = () => {
    const cinemaNames = [
      'Galaxy Nguyễn Du',
      'Galaxy Kinh Dương Vương',
      'Galaxy Tân Bình',
      'Galaxy Quang Trung',
      'Galaxy Huỳnh Tấn Phát'
    ];

    return cinemaNames.map((name, index) => ({
      id: `cinema-${index + 1}`,
      name,
      revenue: Math.floor(Math.random() * 50000000) + 10000000,
      bookings: Math.floor(Math.random() * 200) + 50,
      occupancyRate: Math.floor(Math.random() * 50) + 50,
    }));
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section) 
        : [...prev, section]
    );
  };

  const isExpanded = (section: string) => expandedSections.includes(section);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatCompactCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      notation: 'compact',
    }).format(amount);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = async () => {
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      await reportService.exportReportToExcel('sales', dateStr, dateStr, 'daily');
      toast.success('Xuất báo cáo Excel thành công!');
    } catch (error) {
      console.error('Lỗi xuất báo cáo:', error);
      toast.error('Không thể xuất báo cáo. Vui lòng thử lại.');
    }
  };

  const handleRefresh = () => {
    fetchReportData();
  };

  // Chart configurations
  const revenueChartData = {
    labels: reportData?.hourlyData.hours || [],
    datasets: [
      {
        label: 'Doanh thu theo giờ',
        data: reportData?.hourlyData.revenue || [],
        borderColor: '#FFD875',
        backgroundColor: 'rgba(255, 216, 117, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#FFD875',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const bookingsChartData = {
    labels: reportData?.hourlyData.hours || [],
    datasets: [
      {
        label: 'Lượt đặt vé theo giờ',
        data: reportData?.hourlyData.bookings || [],
        backgroundColor: 'rgba(255, 216, 117, 0.7)',
        borderColor: '#FFD875',
        borderWidth: 1,
        borderRadius: 4,
        barThickness: 12,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#FFFFFF',
        bodyColor: '#FFFFFF',
        borderColor: '#374151',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${formatCurrency(value)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(75, 85, 99, 0.3)',
        },
        ticks: {
          color: '#9CA3AF',
        },
      },
      y: {
        grid: {
          color: 'rgba(75, 85, 99, 0.3)',
        },
        ticks: {
          color: '#9CA3AF',
          callback: function(value: any) {
            return formatCompactCurrency(value);
          },
        },
      },
    },
  };

  const bookingChartOptions = {
    ...chartOptions,
    scales: {
      ...chartOptions.scales,
      y: {
        ...chartOptions.scales.y,
        ticks: {
          color: '#9CA3AF',
          callback: function(value: any) {
            return value;
          },
        },
      },
    },
    plugins: {
      ...chartOptions.plugins,
      tooltip: {
        ...chartOptions.plugins.tooltip,
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value} lượt`;
          },
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[400px]">
        <FullScreenLoader size="large" text="Đang tải báo cáo..." />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <DocumentChartBarIcon className="h-7 w-7 text-[#FFD875] mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-white">Báo cáo ngày</h1>
            <p className="text-gray-400">
              {format(selectedDate, 'EEEE, dd/MM/yyyy')}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={handleRefresh}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-all flex items-center gap-1"
          >
            <ArrowPathIcon className="w-4 h-4" />
            <span>Làm mới</span>
          </button>
          
          <div className="relative">
            <DatePicker
              selected={selectedDate}
              onChange={(date: Date | null) => date && setSelectedDate(date)}
              dateFormat="dd/MM/yyyy"
              maxDate={new Date()}
              customInput={
                <button className="px-4 py-2 bg-[#FFD875] text-black rounded-lg hover:bg-opacity-90 transition-all flex items-center gap-1 btn-glow">
                  <CalendarDaysIcon className="w-4 h-4" />
                  <span>Chọn ngày</span>
                </button>
              }
            />
          </div>

          <button 
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-all flex items-center gap-1"
          >
            <PrinterIcon className="w-4 h-4" />
            <span>In báo cáo</span>
          </button>
          
          <button 
            onClick={handleExport}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-all flex items-center gap-1"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            <span>Xuất báo cáo</span>
          </button>
        </div>
      </div>

      {reportData && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-800 rounded-lg p-4 shadow-lg border border-slate-700 hover:border-[#FFD875] transition-colors">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-[#FFD875] bg-opacity-10">
                  <CurrencyDollarIcon className="h-6 w-6 text-[#FFD875]" />
                </div>
                <div className="ml-4">
                  <p className="text-gray-400 text-sm">Tổng doanh thu</p>
                  <p className="text-white text-lg font-bold">{formatCurrency(reportData.summary.totalRevenue)}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-800 rounded-lg p-4 shadow-lg border border-slate-700 hover:border-[#FFD875] transition-colors">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-[#FFD875] bg-opacity-10">
                  <TicketIcon className="h-6 w-6 text-[#FFD875]" />
                </div>
                <div className="ml-4">
                  <p className="text-gray-400 text-sm">Tổng lượt đặt vé</p>
                  <p className="text-white text-lg font-bold">{reportData.summary.totalBookings} lượt</p>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-800 rounded-lg p-4 shadow-lg border border-slate-700 hover:border-[#FFD875] transition-colors">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-[#FFD875] bg-opacity-10">
                  <UserIcon className="h-6 w-6 text-[#FFD875]" />
                </div>
                <div className="ml-4">
                  <p className="text-gray-400 text-sm">Tổng khách hàng</p>
                  <p className="text-white text-lg font-bold">{reportData.summary.totalCustomers} người</p>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-800 rounded-lg p-4 shadow-lg border border-slate-700 hover:border-[#FFD875] transition-colors">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-[#FFD875] bg-opacity-10">
                  <TicketIcon className="h-6 w-6 text-[#FFD875]" />
                </div>
                <div className="ml-4">
                  <p className="text-gray-400 text-sm">Giá vé trung bình</p>
                  <p className="text-white text-lg font-bold">{formatCurrency(reportData.summary.averageTicketPrice)}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Revenue Section */}
          <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden">
            <div 
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-750"
              onClick={() => toggleSection('revenue')}
            >
              <div className="flex items-center">
                <CurrencyDollarIcon className="h-5 w-5 text-[#FFD875] mr-2" />
                <h3 className="text-lg font-semibold text-white">Doanh thu theo giờ</h3>
              </div>
              {isExpanded('revenue') ? (
                <ChevronUpIcon className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDownIcon className="h-5 w-5 text-gray-400" />
              )}
            </div>
            
            {isExpanded('revenue') && (
              <div className="p-4 border-t border-slate-700">
                <div className="h-80">
                  <Line data={revenueChartData} options={chartOptions} />
                </div>
              </div>
            )}
          </div>
          
          {/* Bookings Section */}
          <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden">
            <div 
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-750"
              onClick={() => toggleSection('bookings')}
            >
              <div className="flex items-center">
                <TicketIcon className="h-5 w-5 text-[#FFD875] mr-2" />
                <h3 className="text-lg font-semibold text-white">Lượt đặt vé theo giờ</h3>
              </div>
              {isExpanded('bookings') ? (
                <ChevronUpIcon className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDownIcon className="h-5 w-5 text-gray-400" />
              )}
            </div>
            
            {isExpanded('bookings') && (
              <div className="p-4 border-t border-slate-700">
                <div className="h-80">
                  <Bar data={bookingsChartData} options={bookingChartOptions} />
                </div>
              </div>
            )}
          </div>
          
          {/* Top Movies Section */}
          <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden">
            <div 
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-750"
              onClick={() => toggleSection('movies')}
            >
              <div className="flex items-center">
                <FilmIcon className="h-5 w-5 text-[#FFD875] mr-2" />
                <h3 className="text-lg font-semibold text-white">Top phim trong ngày</h3>
              </div>
              {isExpanded('movies') ? (
                <ChevronUpIcon className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDownIcon className="h-5 w-5 text-gray-400" />
              )}
            </div>
            
            {isExpanded('movies') && (
              <div className="p-4 border-t border-slate-700">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-700">
                    <thead>
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          #
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Tên phim
                        </th>
                        <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Doanh thu
                        </th>
                        <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Lượt đặt vé
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {reportData.topMovies.map((movie: any, index: number) => (
                        <tr key={movie.id} className="hover:bg-slate-750">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              index === 0 ? 'bg-[#FFD875] text-black' :
                              index === 1 ? 'bg-gray-300 text-black' :
                              index === 2 ? 'bg-amber-700 text-white' :
                              'bg-slate-600 text-white'
                            }`}>
                              {index + 1}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-white font-medium">
                            {movie.title}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right text-white">
                            {formatCurrency(movie.revenue)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right text-white">
                            {movie.bookings}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
          
          {/* Cinema Performance Section */}
          <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden">
            <div 
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-750"
              onClick={() => toggleSection('cinemas')}
            >
              <div className="flex items-center">
                <BuildingOfficeIcon className="h-5 w-5 text-[#FFD875] mr-2" />
                <h3 className="text-lg font-semibold text-white">Hiệu suất rạp chiếu</h3>
              </div>
              {isExpanded('cinemas') ? (
                <ChevronUpIcon className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDownIcon className="h-5 w-5 text-gray-400" />
              )}
            </div>
            
            {isExpanded('cinemas') && (
              <div className="p-4 border-t border-slate-700">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-700">
                    <thead>
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Rạp chiếu
                        </th>
                        <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Doanh thu
                        </th>
                        <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Lượt đặt vé
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {reportData.cinemaPerformance.map((cinema: any) => (
                        <tr key={cinema.id} className="hover:bg-slate-750">
                          <td className="px-4 py-3 whitespace-nowrap text-white font-medium">
                            {cinema.name}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right text-white">
                            {formatCurrency(cinema.revenue)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right text-white">
                            {cinema.bookings}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Payment Methods Section */}
          <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden">
            <div 
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-750"
              onClick={() => toggleSection('payments')}
            >
              <div className="flex items-center">
                <CurrencyDollarIcon className="h-5 w-5 text-[#FFD875] mr-2" />
                <h3 className="text-lg font-semibold text-white">Phương thức thanh toán</h3>
              </div>
              {isExpanded('payments') ? (
                <ChevronUpIcon className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDownIcon className="h-5 w-5 text-gray-400" />
              )}
            </div>
            
            {isExpanded('payments') && (
              <div className="p-4 border-t border-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reportData.paymentMethods.map((payment: any, index: number) => (
                    <div key={index} className="bg-slate-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">{payment.method}</span>
                        <span className="text-[#FFD875] font-bold">{payment.percentage}%</span>
                      </div>
                      <div className="mb-2">
                        <div className="w-full bg-slate-600 rounded-full h-2">
                          <div 
                            className="bg-[#FFD875] h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${payment.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-gray-300 text-sm">
                        {formatCurrency(payment.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyReports; 
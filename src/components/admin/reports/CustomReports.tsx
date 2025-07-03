import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  DocumentChartBarIcon,
  ArrowPathIcon,
  AdjustmentsHorizontalIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  ChartBarIcon,
  FilmIcon,
  CurrencyDollarIcon,
  TicketIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  ClockIcon,
  FunnelIcon,
  XMarkIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import reportService, { type CustomReportData } from '../../../services/reportService';
import toast from 'react-hot-toast';

interface ReportConfig {
  dateRange: {
    start: string;
    end: string;
  };
  metrics: string[];
  groupBy: string;
  cinemas: string[];
  movies: string[];
  chartType: 'line' | 'bar' | 'pie';
}

const CustomReports: React.FC = () => {
  const [config, setConfig] = useState<ReportConfig>({
    dateRange: {
      start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    metrics: ['revenue'],
    groupBy: 'day',
    cinemas: [],
    movies: [],
    chartType: 'line'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<CustomReportData | null>(null);
  const [showConfig, setShowConfig] = useState(true);
  const [showCinemaDropdown, setShowCinemaDropdown] = useState(false);
  const [showMovieDropdown, setShowMovieDropdown] = useState(false);

  // Mock data
  const cinemaOptions = [
    { id: '1', name: 'Galaxy Nguyễn Du' },
    { id: '2', name: 'Galaxy Tân Bình' },
    { id: '3', name: 'Galaxy Quang Trung' },
    { id: '4', name: 'Galaxy Kinh Dương Vương' }
  ];

  const movieOptions = [
    { id: '1', name: 'Avatar 3' },
    { id: '2', name: 'Spider-Man 4' },
    { id: '3', name: 'The Batman 2' },
    { id: '4', name: 'Inception 2' }
  ];

  const metricOptions = [
    { value: 'revenue', label: 'Doanh thu', icon: CurrencyDollarIcon, color: '#FFD875' },
    { value: 'tickets', label: 'Vé bán ra', icon: TicketIcon, color: '#e5c368' },
    { value: 'customers', label: 'Khách hàng', icon: UserGroupIcon, color: '#d4b257' },
    { value: 'sessions', label: 'Suất chiếu', icon: ClockIcon, color: '#c3a146' }
  ];

  const groupByOptions = [
    { value: 'day', label: 'Theo ngày' },
    { value: 'week', label: 'Theo tuần' },
    { value: 'month', label: 'Theo tháng' },
    { value: 'cinema', label: 'Theo rạp' },
    { value: 'movie', label: 'Theo phim' }
  ];

  const generateReport = async () => {
    setIsLoading(true);
    try {

      
      const data = await reportService.getCustomReport({
        dateRange: config.dateRange,
        metrics: config.metrics,
        groupBy: config.groupBy,
        cinemas: config.cinemas,
        movies: config.movies
      });

      // Thêm color cho datasets
      const enhancedData = {
        ...data,
        chartData: {
          ...data.chartData,
          datasets: data.chartData.datasets.map((dataset: any, index: number) => {
            const metricInfo = metricOptions.find(m => m.label === dataset.label);
            return {
              ...dataset,
              color: metricInfo?.color || '#FFD875'
            };
          })
        }
      };

      setReportData(enhancedData);
      setShowConfig(false);
      

      
    } catch (error) {
      console.error('[CustomReports] Lỗi tạo báo cáo:', error);
      toast.error('Không thể tạo báo cáo tùy chỉnh. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      await reportService.exportReportToExcel(
        'sales', 
        config.dateRange.start, 
        config.dateRange.end,
        config.groupBy === 'day' ? 'daily' : config.groupBy === 'week' ? 'weekly' : 'monthly'
      );
      toast.success('Xuất báo cáo Excel thành công!');
    } catch (error) {
      console.error('Lỗi xuất báo cáo:', error);
      toast.error('Không thể xuất báo cáo. Vui lòng thử lại.');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  const toggleCinema = (cinemaId: string) => {
    setConfig({
      ...config,
      cinemas: config.cinemas.includes(cinemaId)
        ? config.cinemas.filter(id => id !== cinemaId)
        : [...config.cinemas, cinemaId]
    });
  };

  const toggleMovie = (movieId: string) => {
    setConfig({
      ...config,
      movies: config.movies.includes(movieId)
        ? config.movies.filter(id => id !== movieId)
        : [...config.movies, movieId]
    });
  };

  // Simple chart rendering
  const renderSimpleChart = () => {
    if (!reportData) return null;

    // Fix: Calculate maxValue from all datasets, not just the first one
    const allValues = reportData.chartData.datasets.flatMap((dataset: any) => dataset.data || []);
    const maxValue = Math.max(...allValues.filter((val: number) => val > 0), 1);
    const chartHeight = 400;

    // Debug info - temporary
    console.log('Chart Debug Info:', {
      labels: reportData.chartData.labels,
      datasets: reportData.chartData.datasets,
      allValues,
      maxValue,
      chartType: config.chartType
    });

    return (
      <div className="relative h-[450px]">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-10 w-16 flex flex-col justify-between text-xs text-gray-400">
          <span>{formatNumber(maxValue)}</span>
          <span>{formatNumber(maxValue * 0.75)}</span>
          <span>{formatNumber(maxValue * 0.5)}</span>
          <span>{formatNumber(maxValue * 0.25)}</span>
          <span>0</span>
        </div>

        {/* Chart area - Improved height */}
        <div className="ml-20 h-full relative pb-12">
          {config.chartType === 'line' ? (
            // Line chart
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* Grid lines */}
              <g className="opacity-20">
                {[0, 25, 50, 75, 100].map((y) => (
                  <line
                    key={y}
                    x1="0"
                    y1={y}
                    x2="100"
                    y2={y}
                    stroke="white"
                    strokeWidth="0.2"
                  />
                ))}
              </g>

              {reportData.chartData.datasets.map((dataset: any, datasetIndex: number) => {
                const points = dataset.data.map((value: number, index: number) => {
                  const x = (index / (dataset.data.length - 1)) * 100;
                  const y = 100 - (value / maxValue) * 100;
                  return { x, y, value };
                });

                return (
                  <g key={datasetIndex}>
                    {/* Line */}
                    <polyline
                      fill="none"
                      stroke={dataset.color}
                      strokeWidth="2"
                      opacity="0.8"
                      points={points.map((p: { x: number; y: number }) => `${p.x},${p.y}`).join(' ')}
                      vectorEffect="non-scaling-stroke"
                    />

                    {/* Area fill */}
                    <polygon
                      fill={dataset.color}
                      opacity="0.1"
                      points={`${points.map((p: { x: number; y: number }) => `${p.x},${p.y}`).join(' ')} 100,100 0,100`}
                    />

                    {/* Points */}
                    {points.map((point: { x: number; y: number; value: number }, index: number) => (
                      <g key={index}>
                        <circle
                          cx={point.x}
                          cy={point.y}
                          r="1"
                          fill={dataset.color}
                          className="hover:r-2"
                          vectorEffect="non-scaling-stroke"
                        />
                        {/* Tooltip on hover */}
                        <title>{`${reportData.chartData.labels[index]}: ${formatNumber(point.value)}`}</title>
                      </g>
                    ))}
                  </g>
                );
              })}
            </svg>
          ) : config.chartType === 'bar' ? (
            // Enhanced Bar chart with better rendering
            reportData.chartData.labels.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <ChartBarIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Không có dữ liệu để hiển thị</p>
                  <p className="text-sm">Thử điều chỉnh bộ lọc hoặc khoảng thời gian</p>
                </div>
              </div>
            ) : (
              <div className="flex h-full items-end justify-between gap-1 pb-8">
                {reportData.chartData.labels.slice(0, 15).map((label: string, index: number) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2 group max-w-20">
                  <div className="w-full flex items-end gap-1 h-full relative" style={{ minHeight: '300px' }}>
                    {reportData.chartData.datasets.map((dataset: any, datasetIndex: number) => {
                      const value = dataset.data[index] || 0;
                      // Improved height calculation
                      const heightPercent = maxValue > 0 ? Math.max((value / maxValue) * 85, value > 0 ? 5 : 0) : 0;
                      const heightPx = (heightPercent / 100) * 300; // Convert to pixels
                      
                      return (
                        <div
                          key={datasetIndex}
                          className="flex-1 transition-all duration-300 hover:opacity-80 relative"
                          style={{
                            height: `${Math.max(heightPx, value > 0 ? 8 : 2)}px`, // Always show at least 2px for visual feedback
                            backgroundColor: value > 0 ? (dataset.color || '#FFD875') : 'rgba(255,216,117,0.3)',
                            borderRadius: '4px 4px 0 0',
                            border: '1px solid rgba(255,255,255,0.2)',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                            minWidth: '8px',
                            opacity: value > 0 ? 1 : 0.5
                          }}
                        >
                          {/* Enhanced Tooltip */}
                          <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-30 border border-slate-600">
                            <div className="font-bold text-[#FFD875]">{formatCurrency(value)}</div>
                            <div className="text-gray-300">{dataset.label}</div>
                            <div className="text-gray-400 text-xs">{label}</div>
                            {/* Arrow */}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900"></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <span className="text-[10px] text-gray-400 text-center whitespace-nowrap overflow-hidden text-ellipsis w-full max-w-16">
                    {label.length > 6 ? label.substring(0, 6) + '...' : label}
                  </span>
                </div>
              ))}
              </div>
            )
          ) : (
            // Pie chart (simplified)
            <div className="flex items-center justify-center h-full">
              <div className="relative w-64 h-64">
                {(() => {
                  const data = reportData.chartData.datasets[0].data.slice(0, 4);
                  const total = data.reduce((a: number, b: number) => a + b, 0);
                  let currentAngle = 0;

                  return data.map((value: number, index: number) => {
                    const percentage = (value / total) * 100;
                    const startAngle = currentAngle;
                    const endAngle = currentAngle + (percentage * 3.6);
                    currentAngle = endAngle;

                    const color = metricOptions[index]?.color || ['#FFD875', '#e5c368', '#d4b257', '#c3a146'][index];

                    return (
                      <div
                        key={index}
                        className="absolute inset-0 rounded-full transition-opacity hover:opacity-80"
                        style={{
                          background: `conic-gradient(transparent ${startAngle}deg, ${color} ${startAngle}deg ${endAngle}deg, transparent ${endAngle}deg)`,
                        }}
                      >
                        <title>{`${metricOptions[index]?.label || `Metric ${index + 1}`}: ${formatNumber(value)} (${percentage.toFixed(1)}%)`}</title>
                      </div>
                    );
                  });
                })()}
                <div className="absolute inset-8 bg-slate-800 rounded-full flex items-center justify-center flex-col">
                  <span className="text-white font-bold text-lg">Tổng</span>
                  <span className="text-gray-400 text-sm">{formatNumber(reportData.chartData.datasets[0].data.slice(0, 4).reduce((a: number, b: number) => a + b, 0))}</span>
                </div>
              </div>

              {/* Legend for pie chart */}
              <div className="ml-8 space-y-2">
                {reportData.chartData.datasets[0].data.slice(0, 4).map((value: number, index: number) => {
                  const total = reportData.chartData.datasets[0].data.slice(0, 4).reduce((a: number, b: number) => a + b, 0);
                  const percentage = (value / total) * 100;
                  const color = metricOptions[index]?.color || ['#FFD875', '#e5c368', '#d4b257', '#c3a146'][index];

                  return (
                    <div key={index} className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: color }}
                      />
                      <div className="text-sm">
                        <span className="text-white">{metricOptions[index]?.label || `Metric ${index + 1}`}</span>
                        <span className="text-gray-400 ml-2">({percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* X-axis labels for line and bar charts */}
          {config.chartType !== 'pie' && (
            <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-gray-400">
              {reportData.chartData.labels.filter((_: any, i: number) => {
                const totalLabels = reportData.chartData.labels.length;
                if (totalLabels <= 5) return true;
                if (totalLabels <= 10) return i % 2 === 0;
                if (totalLabels <= 20) return i % 4 === 0;
                return i % Math.ceil(totalLabels / 5) === 0;
              }).map((label: string, index: number) => (
                <span key={index}>{label}</span>
              ))}
            </div>
          )}
        </div>

        {/* Legend for line and bar charts */}
        {config.chartType !== 'pie' && reportData.chartData.datasets.length > 1 && (
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            {reportData.chartData.datasets.map((dataset: any, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: dataset.color }}
                />
                <span className="text-sm text-gray-400">{dataset.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Báo cáo tùy chỉnh</h1>

        <div className="flex gap-2">
          {!showConfig && (
            <button
              onClick={() => setShowConfig(true)}
              className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-all flex items-center gap-1"
            >
              <AdjustmentsHorizontalIcon className="w-4 h-4" />
              <span>Cấu hình</span>
            </button>
          )}

          {reportData && (
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-[#FFD875] text-black rounded-lg hover:bg-[#e5c368] transition-all flex items-center gap-1 shadow-[0_0_20px_rgba(255,216,117,0.5)] hover:shadow-[0_0_30px_rgba(255,216,117,0.7)]"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              <span>Xuất báo cáo</span>
            </button>
          )}
        </div>
      </div>

      {/* Configuration Panel */}
      {showConfig && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800 rounded-lg p-6 border border-slate-700 mb-6"
        >
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FunnelIcon className="w-5 h-5 text-[#FFD875]" />
            Cấu hình báo cáo
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Khoảng thời gian
              </label>
              <div className="space-y-2">
                <input
                  type="date"
                  value={config.dateRange.start}
                  onChange={(e) => setConfig({
                    ...config,
                    dateRange: { ...config.dateRange, start: e.target.value }
                  })}
                  className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-[#FFD875] focus:outline-none"
                />
                <input
                  type="date"
                  value={config.dateRange.end}
                  onChange={(e) => setConfig({
                    ...config,
                    dateRange: { ...config.dateRange, end: e.target.value }
                  })}
                  className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-[#FFD875] focus:outline-none"
                />
              </div>
            </div>

            {/* Metrics */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Chỉ số
              </label>
              <div className="space-y-2">
                {metricOptions.map((metric) => (
                  <label key={metric.value} className="flex items-center gap-2 cursor-pointer hover:bg-slate-700/50 p-1 rounded">
                    <input
                      type="checkbox"
                      checked={config.metrics.includes(metric.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setConfig({ ...config, metrics: [...config.metrics, metric.value] });
                        } else {
                          setConfig({ ...config, metrics: config.metrics.filter(m => m !== metric.value) });
                        }
                      }}
                      className="w-4 h-4 text-[#FFD875] bg-slate-700 border-slate-600 rounded focus:ring-[#FFD875]"
                    />
                    <metric.icon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-white">{metric.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Group By */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Nhóm theo
              </label>
              <select
                value={config.groupBy}
                onChange={(e) => setConfig({ ...config, groupBy: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-[#FFD875] focus:outline-none"
              >
                {groupByOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Cinema Filter */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Rạp chiếu ({config.cinemas.length} đã chọn)
              </label>
              <button
                type="button"
                onClick={() => setShowCinemaDropdown(!showCinemaDropdown)}
                className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-[#FFD875] focus:outline-none flex items-center justify-between"
              >
                <span className="text-sm">
                  {config.cinemas.length === 0 ? 'Tất cả rạp' : `${config.cinemas.length} rạp đã chọn`}
                </span>
                <ChevronDownIcon className="w-4 h-4" />
              </button>

              {showCinemaDropdown && (
                <div className="absolute z-10 mt-1 w-full bg-slate-700 border border-slate-600 rounded-lg shadow-lg">
                  <div className="p-2">
                    <button
                      onClick={() => setConfig({ ...config, cinemas: [] })}
                      className="w-full text-left px-3 py-2 text-sm text-white hover:bg-slate-600 rounded"
                    >
                      Tất cả rạp
                    </button>
                    {cinemaOptions.map((cinema) => (
                      <label
                        key={cinema.id}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-slate-600 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={config.cinemas.includes(cinema.id)}
                          onChange={() => toggleCinema(cinema.id)}
                          className="w-4 h-4 text-[#FFD875] bg-slate-800 border-slate-600 rounded"
                        />
                        <BuildingOfficeIcon className="w-4 h-4 text-gray-400" />
                        {cinema.name}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Movie Filter */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Phim ({config.movies.length} đã chọn)
              </label>
              <button
                type="button"
                onClick={() => setShowMovieDropdown(!showMovieDropdown)}
                className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-[#FFD875] focus:outline-none flex items-center justify-between"
              >
                <span className="text-sm">
                  {config.movies.length === 0 ? 'Tất cả phim' : `${config.movies.length} phim đã chọn`}
                </span>
                <ChevronDownIcon className="w-4 h-4" />
              </button>

              {showMovieDropdown && (
                <div className="absolute z-10 mt-1 w-full bg-slate-700 border border-slate-600 rounded-lg shadow-lg">
                  <div className="p-2 max-h-60 overflow-y-auto">
                    <button
                      onClick={() => setConfig({ ...config, movies: [] })}
                      className="w-full text-left px-3 py-2 text-sm text-white hover:bg-slate-600 rounded"
                    >
                      Tất cả phim
                    </button>
                    {movieOptions.map((movie) => (
                      <label
                        key={movie.id}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-slate-600 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={config.movies.includes(movie.id)}
                          onChange={() => toggleMovie(movie.id)}
                          className="w-4 h-4 text-[#FFD875] bg-slate-800 border-slate-600 rounded"
                        />
                        <FilmIcon className="w-4 h-4 text-gray-400" />
                        {movie.name}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Chart Type */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Loại biểu đồ
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfig({ ...config, chartType: 'line' })}
                  className={`flex-1 py-2 px-3 rounded-lg transition-all ${config.chartType === 'line'
                    ? 'bg-[#FFD875] text-black shadow-[0_0_15px_rgba(255,216,117,0.5)]'
                    : 'bg-slate-700 text-white hover:bg-slate-600'
                    }`}
                >
                  Đường
                </button>
                <button
                  onClick={() => setConfig({ ...config, chartType: 'bar' })}
                  className={`flex-1 py-2 px-3 rounded-lg transition-all ${config.chartType === 'bar'
                    ? 'bg-[#FFD875] text-black shadow-[0_0_15px_rgba(255,216,117,0.5)]'
                    : 'bg-slate-700 text-white hover:bg-slate-600'
                    }`}
                >
                  Cột
                </button>
                <button
                  onClick={() => setConfig({ ...config, chartType: 'pie' })}
                  className={`flex-1 py-2 px-3 rounded-lg transition-all ${config.chartType === 'pie'
                    ? 'bg-[#FFD875] text-black shadow-[0_0_15px_rgba(255,216,117,0.5)]'
                    : 'bg-slate-700 text-white hover:bg-slate-600'
                    }`}
                >
                  Tròn
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <button
              onClick={() => {
                setShowConfig(false);
                setReportData(null);
              }}
              className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all"
            >
              Hủy
            </button>
            <button
              onClick={generateReport}
              disabled={config.metrics.length === 0}
              className="px-6 py-2 bg-[#FFD875] text-black rounded-lg hover:bg-[#e5c368] transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(255,216,117,0.5)] hover:shadow-[0_0_30px_rgba(255,216,117,0.7)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChartBarIcon className="w-5 h-5" />
              Tạo báo cáo
            </button>
          </div>
        </motion.div>
      )}

      {/* Click outside to close dropdowns */}
      {(showCinemaDropdown || showMovieDropdown) && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => {
            setShowCinemaDropdown(false);
            setShowMovieDropdown(false);
          }}
        />
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center h-96">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-[#FFD875] border-t-transparent rounded-full"
          />
        </div>
      )}

      {/* Report Results */}
      {reportData && !isLoading && !showConfig && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-[#FFD875]/50 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Tổng doanh thu</p>
                  <h3 className="text-2xl font-bold text-white mt-1">
                    {formatCurrency(reportData.summary.totalRevenue)}
                  </h3>
                </div>
                <div className="p-3 bg-[#FFD875]/20 rounded-lg">
                  <CurrencyDollarIcon className="w-6 h-6 text-[#FFD875]" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-[#FFD875]/50 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Tổng vé bán</p>
                  <h3 className="text-2xl font-bold text-white mt-1">
                    {formatNumber(reportData.summary.totalTickets)}
                  </h3>
                </div>
                <div className="p-3 bg-[#FFD875]/20 rounded-lg">
                  <TicketIcon className="w-6 h-6 text-[#FFD875]" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-[#FFD875]/50 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Tổng khách hàng</p>
                  <h3 className="text-2xl font-bold text-white mt-1">
                    {formatNumber(reportData.summary.totalCustomers)}
                  </h3>
                </div>
                <div className="p-3 bg-[#FFD875]/20 rounded-lg">
                  <UserGroupIcon className="w-6 h-6 text-[#FFD875]" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-[#FFD875]/50 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Giá vé trung bình</p>
                  <h3 className="text-2xl font-bold text-white mt-1">
                    {formatCurrency(reportData.summary.avgTicketPrice)}
                  </h3>
                </div>
                <div className="p-3 bg-[#FFD875]/20 rounded-lg">
                  <TicketIcon className="w-6 h-6 text-[#FFD875]" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-slate-800 rounded-lg p-6 border border-slate-700"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <ChartBarIcon className="w-5 h-5 text-[#FFD875]" />
              Biểu đồ báo cáo
            </h3>
            {renderSimpleChart()}
          </motion.div>

          {/* Data Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden"
          >
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white">Chi tiết dữ liệu</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Ngày
                    </th>
                    {config.metrics.includes('revenue') && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Doanh thu
                      </th>
                    )}
                    {config.metrics.includes('tickets') && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Vé bán
                      </th>
                    )}
                    {config.metrics.includes('customers') && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Khách hàng
                      </th>
                    )}
                    {config.metrics.includes('sessions') && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Suất chiếu
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {reportData.tableData.map((row, index) => (
                    <tr key={index} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {row.date}
                      </td>
                      {config.metrics.includes('revenue') && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                          {formatCurrency(row.revenue)}
                        </td>
                      )}
                      {config.metrics.includes('tickets') && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                          {formatNumber(row.tickets)}
                        </td>
                      )}
                      {config.metrics.includes('customers') && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                          {formatNumber(row.customers)}
                        </td>
                      )}
                      {config.metrics.includes('sessions') && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                          {formatNumber(row.sessions)}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CustomReports; 
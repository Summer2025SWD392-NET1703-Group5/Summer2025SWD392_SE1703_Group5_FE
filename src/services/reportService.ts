import apiClient from './apiClient';

export interface DailyReportData {
  summary: {
    totalRevenue: number;
    totalBookings: number;
    totalCustomers: number;
    averageTicketPrice: number;
  };
  hourlyData: {
    hours: string[];
    revenue: number[];
    bookings: number[];
  };
  topMovies: Array<{
    id: string;
    title: string;
    revenue: number;
    bookings: number;
    occupancyRate: number;
  }>;
  cinemaPerformance: Array<{
    id: string;
    name: string;
    revenue: number;
    bookings: number;
    occupancyRate: number;
  }>;
  paymentMethods: Array<{
    method: string;
    amount: number;
    percentage: number;
  }>;
}

export interface MonthlyReportData {
  revenue: number;
  tickets: number;
  customers: number;
  movies: number;
  revenueGrowth: number;
  ticketGrowth: number;
  customerGrowth: number;
  topMovies: Array<{ name: string; revenue: number; tickets: number }>;
  dailyRevenue: number[];
  dailyLabels: string[];
}

export interface CustomReportData {
  summary: {
    totalRevenue: number;
    totalTickets: number;
    totalCustomers: number;
    avgTicketPrice: number;
  };
  chartData: any;
  tableData: any[];
}

class ReportService {
  /**
   * Lấy báo cáo ngày
   */
  async getDailyReport(date?: string): Promise<DailyReportData> {
    try {
      console.log('[ReportService] Lấy báo cáo ngày:', date);
      
      // TEMP FIX: Chỉ sử dụng movies/cinemas API để debug, tránh realtime API có vấn đề
      const [moviesResponse, cinemasResponse] = await Promise.all([
        apiClient.get('/sales-report/movies', {
          params: {
            startDate: date || new Date().toISOString().split('T')[0],
            endDate: date || new Date().toISOString().split('T')[0]
          }
        }),
        apiClient.get('/sales-report/cinemas', {
          params: {
            startDate: date || new Date().toISOString().split('T')[0], 
            endDate: date || new Date().toISOString().split('T')[0]
          }
        })
      ]);

      const moviesData = moviesResponse.data.data.movies || [];
      const cinemasData = cinemasResponse.data.data.cinemas || [];
      
      // Tính tổng từ movies data thay vì realtime API
      const totalRevenue = moviesData.reduce((sum: number, movie: any) => sum + (movie.total_revenue || 0), 0);
      const totalBookings = moviesData.reduce((sum: number, movie: any) => sum + (movie.total_bookings || 0), 0);
      const totalTickets = moviesData.reduce((sum: number, movie: any) => sum + (movie.total_tickets || 0), 0);
      const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

      // Chuyển đổi dữ liệu từ API sang format của frontend
      // TEMP: Tạo mock hourly data vì realtime API có vấn đề
      const hourlyData = {
        hours: Array.from({length: 24}, (_, i) => `${i}:00`),
        revenue: Array.from({length: 24}, (_, i) => i === 17 ? totalRevenue : 0), // Giờ 17:00 có doanh thu
        bookings: Array.from({length: 24}, (_, i) => i === 17 ? totalBookings : 0) // Giờ 17:00 có booking
      };

      const topMovies = moviesData.slice(0, 5).map((movie: any) => ({
        id: movie.movie_id?.toString() || '',
        title: movie.title || movie.movie_name || '',
        revenue: movie.total_revenue || 0,
        bookings: movie.total_bookings || 0,
        occupancyRate: movie.occupancy_rate || Math.floor(Math.random() * 50) + 50 // Mock data nếu không có
      }));

      const cinemaPerformance = cinemasData.map((cinema: any) => ({
        id: cinema.cinema_id?.toString() || '',
        name: cinema.cinema_name || '',
        revenue: cinema.total_revenue || 0,
        bookings: cinema.total_bookings || 0,
        occupancyRate: cinema.occupancy_rate || Math.floor(Math.random() * 50) + 50 // Mock data nếu không có
      }));

      // Lấy dữ liệu phương thức thanh toán thật
      let paymentMethods = [];
      try {
        const paymentReport = await this.getPaymentMethodsReport(date || new Date().toISOString().split('T')[0], date || new Date().toISOString().split('T')[0]);
        paymentMethods = paymentReport.payment_methods.map((pm: any) => ({
          method: pm.payment_method,
          amount: pm.total_amount,
          percentage: parseFloat(pm.amount_percentage)
        }));
      } catch (error) {
        console.warn('Không thể lấy dữ liệu phương thức thanh toán, sử dụng mock data:', error);
        // Fallback to mock data dựa trên total revenue tính được
        paymentMethods = [
          { method: 'Cash', amount: totalRevenue * 1.0, percentage: 100 } // Tạm thời 100% Cash
        ];
      }

      const result: DailyReportData = {
        summary: {
          totalRevenue: totalRevenue,
          totalBookings: totalBookings,
          totalCustomers: totalTickets,
          averageTicketPrice: averageBookingValue
        },
        hourlyData,
        topMovies,
        cinemaPerformance,
        paymentMethods
      };
      return result;

    } catch (error) {
      console.error('[ReportService] Lỗi lấy báo cáo ngày:', error);
      throw new Error('Không thể lấy báo cáo ngày');
    }
  }

  /**
   * Lấy báo cáo tháng
   */
  async getMonthlyReport(month?: string): Promise<MonthlyReportData> {
    try {
      console.log('[ReportService] Lấy báo cáo tháng:', month);

      const selectedDate = month ? new Date(month + '-01') : new Date();
      const year = selectedDate.getFullYear();
      const monthNumber = selectedDate.getMonth() + 1;
      
      const startDate = `${year}-${monthNumber.toString().padStart(2, '0')}-01`;
      const endDate = new Date(year, monthNumber, 0).toISOString().split('T')[0];

      const [overviewResponse, moviesResponse, salesResponse] = await Promise.all([
        apiClient.get('/sales-report/overview', { params: { period: '30' } }),
        apiClient.get('/sales-report/movies', { params: { startDate, endDate } }),
        apiClient.get('/sales-report', { params: { startDate, endDate, period: 'daily' } })
      ]);

      const overviewData = overviewResponse.data.data;
      const moviesData = moviesResponse.data.data.movies || [];
      const salesData = salesResponse.data.data;



      const topMovies = moviesData.slice(0, 5).map((movie: any) => ({
        name: movie.title || movie.movie_name || '',
        revenue: movie.total_revenue || 0,
        tickets: movie.total_tickets || 0
      }));

              const dailyRevenue = salesData?.period_sales?.map((day: any) => day.total_amount || 0) || [];
        const dailyLabels = salesData?.period_sales?.map((day: any) => day.period_name || '') || [];

      // Tính toán từ movies data để làm fallback nếu overview API có vấn đề
      const moviesTotal = {
        revenue: moviesData.reduce((sum: number, movie: any) => sum + (movie.total_revenue || 0), 0),
        tickets: moviesData.reduce((sum: number, movie: any) => sum + (movie.total_tickets || 0), 0),
        bookings: moviesData.reduce((sum: number, movie: any) => sum + (movie.total_bookings || 0), 0)
      };

      const result: MonthlyReportData = {
        revenue: overviewData?.current_period?.total_revenue || moviesTotal.revenue,
        tickets: overviewData?.current_period?.total_tickets || moviesTotal.tickets,
        customers: overviewData?.current_period?.total_bookings || moviesTotal.bookings,
        movies: moviesData.length,
        revenueGrowth: parseFloat(overviewData?.growth_percentage?.revenue) || 0,
        ticketGrowth: parseFloat(overviewData?.growth_percentage?.tickets) || 0,
        customerGrowth: parseFloat(overviewData?.growth_percentage?.bookings) || 0,
        topMovies,
        dailyRevenue,
        dailyLabels
      };

      
      return result;

    } catch (error) {
      console.error('[ReportService] Lỗi lấy báo cáo tháng:', error);
      throw new Error('Không thể lấy báo cáo tháng');
    }
  }

  /**
   * Tạo báo cáo tùy chỉnh
   */
  async getCustomReport(config: {
    dateRange: { start: string; end: string };
    metrics: string[];
    groupBy: string;
    cinemas: string[];
    movies: string[];
  }): Promise<CustomReportData> {
    try {
      console.log('[ReportService] Tạo báo cáo tùy chỉnh:', config);

      const { dateRange, groupBy } = config;
      const period = groupBy === 'day' ? 'daily' : groupBy === 'week' ? 'weekly' : 'monthly';

      const salesResponse = await apiClient.get('/sales-report', {
        params: {
          startDate: dateRange.start,
          endDate: dateRange.end,
          period
        }
      });

      const salesData = salesResponse.data.data;
      
              const labels = salesData.period_sales?.map((item: any) => {
          return item.period_name || item.period_key || 'Unknown';
        }) || [];

      const datasets = config.metrics.map((metric) => {
        let data: number[] = [];
        let label = '';
        
        switch (metric) {
          case 'revenue':
            label = 'Doanh thu';
            data = salesData.period_sales?.map((item: any) => item.total_amount || 0) || [];
            break;
          case 'tickets':
            label = 'Vé bán ra';
            data = salesData.period_sales?.map((item: any) => item.total_tickets || 0) || [];
            break;
          case 'customers':
            label = 'Khách hàng';
            data = salesData.period_sales?.map((item: any) => item.total_bookings || 0) || [];
            break;
          case 'sessions':
            label = 'Suất chiếu';
            data = salesData.period_sales?.map(() => Math.floor(Math.random() * 20) + 5) || [];
            break;
        }

        return { label, data };
      });

      const tableData = salesData.period_sales?.map((item: any) => ({
        date: labels[salesData.period_sales.indexOf(item)] || '',
        revenue: item.total_amount || 0,
        tickets: item.total_tickets || 0,
        customers: item.total_bookings || 0,
        sessions: Math.floor(Math.random() * 20) + 5
      })) || [];

      const result: CustomReportData = {
        summary: {
          totalRevenue: salesData.total_amount || 0,
          totalTickets: salesData.total_tickets || 0,
          totalCustomers: salesData.total_bookings || 0,
          avgTicketPrice: salesData.average_booking_value || 0
        },
        chartData: {
          labels,
          datasets
        },
        tableData
      };


      return result;

    } catch (error) {
      console.error('[ReportService] Lỗi tạo báo cáo tùy chỉnh:', error);
      throw new Error('Không thể tạo báo cáo tùy chỉnh');
    }
  }

  /**
   * Xuất báo cáo
   */
  async exportReport(type: 'daily' | 'monthly' | 'custom', params: any): Promise<Blob> {
    try {
      console.log('[ReportService] Xuất báo cáo:', type, params);

      const response = await apiClient.get('/sales-report/export', {
        params: {
          ...params,
          format: 'json'
        },
        responseType: 'blob'
      });

      return response.data;

    } catch (error) {
      console.error('[ReportService] Lỗi xuất báo cáo:', error);
      throw new Error('Không thể xuất báo cáo');
    }
  }

  /**
   * Lấy báo cáo phương thức thanh toán
   */
  async getPaymentMethodsReport(startDate: string, endDate: string) {
    try {
      console.log('[ReportService] Lấy báo cáo phương thức thanh toán:', startDate, endDate);
      
      const response = await apiClient.get('/sales-report/payments', {
        params: { startDate, endDate }
      });

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Lỗi khi lấy báo cáo phương thức thanh toán');
      }
    } catch (error) {
      console.error('[ReportService] Lỗi API báo cáo phương thức thanh toán:', error);
      throw new Error('Không thể lấy báo cáo phương thức thanh toán');
    }
  }

  /**
   * Lấy báo cáo phân loại doanh thu
   */
  async getRevenueCategoriesReport(startDate: string, endDate: string) {
    try {
      console.log('[ReportService] Lấy báo cáo phân loại doanh thu:', startDate, endDate);
      
      const response = await apiClient.get('/sales-report/categories', {
        params: { startDate, endDate }
      });

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Lỗi khi lấy báo cáo phân loại doanh thu');
      }
    } catch (error) {
      console.error('[ReportService] Lỗi API báo cáo phân loại doanh thu:', error);
      throw new Error('Không thể lấy báo cáo phân loại doanh thu');
    }
  }

  /**
   * Export báo cáo Excel
   */
  async exportReportToExcel(
    reportType: 'sales' | 'movies' | 'cinemas' | 'payments' | 'categories',
    startDate: string,
    endDate: string,
    period: 'daily' | 'weekly' | 'monthly' = 'daily'
  ) {
    try {
      console.log('[ReportService] Export báo cáo Excel:', reportType, startDate, endDate);

      const response = await apiClient.get('/sales-report/export-excel', {
        params: { reportType, startDate, endDate, period },
        responseType: 'blob' // Quan trọng: để nhận file binary
      });

      // Tạo URL từ blob và tự động download
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bao-cao-${reportType}-${startDate}-${endDate}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log('[ReportService] Export báo cáo Excel thành công');
      return true;
    } catch (error) {
      console.error('[ReportService] Lỗi export báo cáo Excel:', error);
      throw new Error('Không thể export báo cáo Excel');
    }
  }
}

export default new ReportService(); 
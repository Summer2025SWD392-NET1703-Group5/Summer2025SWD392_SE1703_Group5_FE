import apiClient from './apiClient';
import type {
  DashboardOverview,
  RealtimeData,
  BookingStatistics,
  SalesReport,
  MoviePerformance,
  CinemaPerformance,
  PaymentMethodStats,
  RevenueCategoryStats,
  DashboardFilters,
  DashboardData
} from '../types/dashboard';

/**
 * Dashboard Service - Xử lý tất cả API calls cho dashboard
 * Tích hợp với backend APIs: booking-statistics và sales-report
 */
class DashboardService {
  private readonly baseUrl = '';

  /**
   * Ghi log lỗi tiếng Việt
   */
  private logError(_methodName: string, _error: unknown): void {
    // Removed console.log for performance
  }

  /**
   * Ghi log thành công
   */
  private logSuccess(_methodName: string, _data: unknown): void {
    // Removed console.log for performance
  }

  /**
   * Xử lý error message
   */
  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    return 'Lỗi không xác định';
  }

  /**
   * Lấy tổng quan dashboard
   */
  async getDashboardOverview(period: number = 30): Promise<DashboardOverview> {
    try {

      
      const response = await apiClient.get(`/sales-report/dashboard-overview`, {
        params: { period }
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Lỗi khi lấy tổng quan dashboard');
      }

      const data = response.data.data;
      const overview: DashboardOverview = {
        totalRevenue: data.totalRevenue || 0,
        totalBookings: data.totalBookings || 0,
        totalTickets: data.totalTickets || 0,
        totalCustomers: data.totalCustomers || 0,
        revenueGrowth: data.revenueGrowth || 0,
        bookingsGrowth: data.bookingsGrowth || 0,
        ticketsGrowth: data.ticketsGrowth || 0,
        customersGrowth: data.customersGrowth || 0,
      };

      this.logSuccess('getDashboardOverview', overview);
      return overview;
    } catch (error: unknown) {
      this.logError('getDashboardOverview', error);
      throw new Error(`Lỗi khi lấy tổng quan dashboard: ${this.getErrorMessage(error)}`);
    }
  }

  /**
   * Lấy dữ liệu realtime
   */
  async getRealtimeData(): Promise<RealtimeData> {
    try {

      
      const response = await apiClient.get(`/sales-report/realtime`);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Lỗi khi lấy dữ liệu realtime');
      }

      const data = response.data.data;
      const realtimeData: RealtimeData = {
        todayRevenue: data.today?.total_revenue || 0,
        todayBookings: data.today?.total_bookings || 0,
        todayTickets: data.today?.total_tickets || 0,
        hourlyRevenue: (data.hourly_sales || []).map((hour: any) => ({
          hour: hour.hour,
          revenue: hour.total_amount || 0,
          bookings: hour.total_bookings || 0,
        })),
        currentHourRevenue: 0, // Will be calculated from hourly data
        peakHour: 0, // Will be calculated from hourly data
      };

      // Calculate current hour revenue and peak hour
      if (realtimeData.hourlyRevenue.length > 0) {
        const currentHour = new Date().getHours();
        const currentHourData = realtimeData.hourlyRevenue.find(h => h.hour === currentHour);
        realtimeData.currentHourRevenue = currentHourData?.revenue || 0;

        // Find peak hour
        const peakHourData = realtimeData.hourlyRevenue.reduce((peak, current) => 
          current.revenue > peak.revenue ? current : peak
        );
        realtimeData.peakHour = peakHourData.hour;
      }

      this.logSuccess('getRealtimeData', realtimeData);
      return realtimeData;
    } catch (error: unknown) {
      this.logError('getRealtimeData', error);
      throw new Error(`Lỗi khi lấy dữ liệu realtime: ${this.getErrorMessage(error)}`);
    }
  }

  /**
   * Lấy thống kê booking
   */
  async getBookingStatistics(filters?: DashboardFilters): Promise<BookingStatistics> {
    try {

      
      const params: any = {};
      if (filters?.dateRange) {
        params.startDate = filters.dateRange.startDate.toISOString().split('T')[0];
        params.endDate = filters.dateRange.endDate.toISOString().split('T')[0];
      }

      const response = await apiClient.get(`/booking-statistics`, {
        params
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Lỗi khi lấy thống kê booking');
      }

      const data = response.data.data;
      const bookingStats: BookingStatistics = {
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        totalBookings: data.totalBookings || 0,
        confirmedBookings: data.confirmedBookings || 0,
        cancelledBookings: data.cancelledBookings || 0,
        totalRevenue: data.totalRevenue || 0,
        totalTickets: data.totalTickets || 0,
        averageTicketsPerBooking: data.averageTicketsPerBooking || 0,
        movieStatistics: data.movieStatistics || [],
        roomStatistics: data.roomStatistics || [],
        dailyStatistics: data.dailyStatistics || [],
        paymentMethodStatistics: data.paymentMethodStatistics || [],
      };

      this.logSuccess('getBookingStatistics', bookingStats);
      return bookingStats;
    } catch (error: unknown) {
      this.logError('getBookingStatistics', error);
      throw new Error(`Lỗi khi lấy thống kê booking: ${this.getErrorMessage(error)}`);
    }
  }

  /**
   * Lấy báo cáo doanh thu
   */
  async getSalesReport(filters: DashboardFilters): Promise<SalesReport> {
    try {

      
      const params = {
        startDate: filters.dateRange.startDate.toISOString().split('T')[0],
        endDate: filters.dateRange.endDate.toISOString().split('T')[0],
        period: filters.period || 'daily'
      };

      const response = await apiClient.get(`${this.baseUrl}/sales-report`, {
        params
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Lỗi khi lấy báo cáo doanh thu');
      }

      const data = response.data.data;
      const salesReport: SalesReport = {
        startDate: new Date(data.start_date),
        endDate: new Date(data.end_date),
        period: data.period,
        totalTickets: data.total_tickets || 0,
        totalAmount: data.total_amount || 0,
        totalBookings: data.total_bookings || 0,
        averageBookingValue: data.average_booking_value || 0,
        periodSales: data.period_sales || [],
        movieStatistics: data.movie_statistics || [],
        paymentStatistics: data.payment_statistics || [],
        cinemaStatistics: data.cinema_statistics || [],
        generatedAt: new Date(data.generated_at),
      };

      this.logSuccess('getSalesReport', salesReport);
      return salesReport;
    } catch (error) {
      this.logError('getSalesReport', error);
      throw new Error(`Lỗi khi lấy báo cáo doanh thu: ${this.getErrorMessage(error)}`);
    }
  }

  /**
   * Lấy top movies performance
   */
  async getTopMovies(filters?: DashboardFilters): Promise<MoviePerformance[]> {
    try {
      const params: any = {};
      if (filters?.dateRange) {
        params.startDate = filters.dateRange.startDate.toISOString().split('T')[0];
        params.endDate = filters.dateRange.endDate.toISOString().split('T')[0];
      }

      const response = await apiClient.get(`/sales-report/movies`, {
        params
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Lỗi khi lấy top movies');
      }

      // Extract movies array from API response
      let moviesData = response.data.data?.movies || [];
      if (!Array.isArray(moviesData)) {
        moviesData = [];
      }

      const movies = moviesData.map((movie: any) => ({
        movieId: movie.movie_id || movie.Movie_ID || movie.id,
        movieName: movie.title || movie.Movie_Name || movie.name || 'Unknown Movie',
        genre: movie.genre || movie.Genre || 'N/A',
        totalBookings: movie.total_bookings || movie.TotalBookings || 0,
        totalTickets: movie.total_tickets || movie.TotalTickets || 0,
        totalRevenue: movie.total_revenue || movie.TotalRevenue || 0,
        averageBookingValue: movie.average_booking_value || movie.AverageBookingValue || 0,
        totalShowtimes: movie.total_showtimes || movie.TotalShowtimes || 0,
        cinemasShowing: movie.cinemas_showing || movie.CinemasShowing || 0,
        revenuePerShowtime: movie.revenue_per_showtime || 0,
      }));

      this.logSuccess('getTopMovies', movies);
      return movies;
    } catch (error: unknown) {
      this.logError('getTopMovies', error);
      // Return empty array instead of throwing to prevent dashboard crash
      return [];
    }
  }

  /**
   * Lấy top cinemas performance
   */
  async getTopCinemas(filters?: DashboardFilters): Promise<CinemaPerformance[]> {
    try {

      
      const params: any = {};
      if (filters?.dateRange) {
        params.startDate = filters.dateRange.startDate.toISOString().split('T')[0];
        params.endDate = filters.dateRange.endDate.toISOString().split('T')[0];
      }

      const response = await apiClient.get(`${this.baseUrl}/sales-report/cinemas`, {
        params
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Lỗi khi lấy top cinemas');
      }

      const cinemas = response.data.data.map((cinema: any) => ({
        cinemaId: cinema.cinema_id,
        cinemaName: cinema.cinema_name,
        address: cinema.address,
        totalBookings: cinema.total_bookings,
        totalTickets: cinema.total_tickets,
        totalRevenue: cinema.total_revenue,
        averageBookingValue: cinema.average_booking_value,
        totalShowtimes: cinema.total_showtimes,
        activeRooms: cinema.active_rooms,
        moviesShown: cinema.movies_shown,
      }));

      this.logSuccess('getTopCinemas', cinemas);
      return cinemas;
    } catch (error) {
      this.logError('getTopCinemas', error);
      throw new Error(`Lỗi khi lấy top cinemas: ${this.getErrorMessage(error)}`);
    }
  }

  /**
   * Lấy thống kê phương thức thanh toán
   */
  async getPaymentMethodStats(filters?: DashboardFilters): Promise<PaymentMethodStats[]> {
    try {

      
      const params: any = {};
      if (filters?.dateRange) {
        params.startDate = filters.dateRange.startDate.toISOString().split('T')[0];
        params.endDate = filters.dateRange.endDate.toISOString().split('T')[0];
      }

      const response = await apiClient.get(`${this.baseUrl}/sales-report/payments`, {
        params
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Lỗi khi lấy thống kê thanh toán');
      }

      const paymentStats = response.data.data.map((payment: any) => ({
        paymentMethod: payment.payment_method,
        totalBookings: payment.total_bookings,
        totalAmount: payment.total_amount,
        percentage: parseFloat(payment.percentage),
      }));

      this.logSuccess('getPaymentMethodStats', paymentStats);
      return paymentStats;
    } catch (error) {
      this.logError('getPaymentMethodStats', error);
      throw new Error(`Lỗi khi lấy thống kê thanh toán: ${this.getErrorMessage(error)}`);
    }
  }

  /**
   * Lấy thống kê danh mục doanh thu
   */
  async getRevenueCategoryStats(filters?: DashboardFilters): Promise<RevenueCategoryStats[]> {
    try {

      
      const params: any = {};
      if (filters?.dateRange) {
        params.startDate = filters.dateRange.startDate.toISOString().split('T')[0];
        params.endDate = filters.dateRange.endDate.toISOString().split('T')[0];
      }

      const response = await apiClient.get(`${this.baseUrl}/sales-report/categories`, {
        params
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Lỗi khi lấy thống kê danh mục');
      }

      const categoryStats = response.data.data.map((category: any) => ({
        category: category.category,
        revenue: category.revenue,
        percentage: category.percentage,
        description: category.description,
      }));

      this.logSuccess('getRevenueCategoryStats', categoryStats);
      return categoryStats;
    } catch (error) {
      this.logError('getRevenueCategoryStats', error);
      throw new Error(`Lỗi khi lấy thống kê danh mục: ${this.getErrorMessage(error)}`);
    }
  }

  /**
   * Lấy tất cả dữ liệu dashboard
   */
  async getAllDashboardData(filters?: DashboardFilters): Promise<DashboardData> {
    try {

      
      // Gọi các APIs song song để tối ưu performance
      const [
        overview,
        realtime,
        bookingStats,
        topMovies
      ] = await Promise.allSettled([
        this.getDashboardOverview(),
        this.getRealtimeData(),
        this.getBookingStatistics(filters),
        this.getTopMovies(filters)
      ]);

      // Xử lý kết quả từ Promise.allSettled
      const dashboardData: DashboardData = {
        overview: overview.status === 'fulfilled' ? overview.value : {
          totalRevenue: 0,
          totalBookings: 0,
          totalTickets: 0,
          totalCustomers: 0,
          revenueGrowth: 0,
          bookingsGrowth: 0,
          ticketsGrowth: 0,
          customersGrowth: 0,
        },
        realtime: realtime.status === 'fulfilled' ? realtime.value : {
          todayRevenue: 0,
          todayBookings: 0,
          todayTickets: 0,
          hourlyRevenue: [],
          currentHourRevenue: 0,
          peakHour: 0,
        },
        bookingStats: bookingStats.status === 'fulfilled' ? bookingStats.value : {
          totalBookings: 0,
          confirmedBookings: 0,
          cancelledBookings: 0,
          totalRevenue: 0,
          totalTickets: 0,
          averageTicketsPerBooking: 0,
          movieStatistics: [],
          roomStatistics: [],
          dailyStatistics: [],
          paymentMethodStatistics: [],
        },
        salesReport: {
          startDate: new Date(),
          endDate: new Date(),
          period: 'daily',
          totalTickets: 0,
          totalAmount: 0,
          totalBookings: 0,
          averageBookingValue: 0,
          periodSales: [],
          movieStatistics: [],
          paymentStatistics: [],
          cinemaStatistics: [],
          generatedAt: new Date(),
        },
        topMovies: topMovies.status === 'fulfilled' ? topMovies.value : [],
        topCinemas: [],
        paymentMethods: [],
        revenueCategories: [],
        dailyTrends: bookingStats.status === 'fulfilled' ? bookingStats.value.dailyStatistics : [],
        isLoading: false,
        error: null,
        lastUpdated: new Date(),
      };

      // Log các lỗi nếu có
      const results = [overview, realtime, bookingStats, topMovies];
      
      // Log các lỗi nếu có  
      results.forEach((result, _index) => {
        if (result.status === 'rejected') {
          // Removed console.warn for performance
        }
      });

      this.logSuccess('getAllDashboardData', dashboardData);
      return dashboardData;
    } catch (error: unknown) {
      this.logError('getAllDashboardData', error);
      throw new Error(`Lỗi khi lấy tất cả dữ liệu dashboard: ${this.getErrorMessage(error)}`);
    }
  }

  /**
   * Export dashboard data to Excel
   */
  async exportDashboardToExcel(filters: DashboardFilters, reportType: string = 'sales'): Promise<Blob> {
    try {

      
      const params = {
        reportType,
        startDate: filters.dateRange.startDate.toISOString().split('T')[0],
        endDate: filters.dateRange.endDate.toISOString().split('T')[0],
        period: filters.period || 'daily'
      };

      const response = await apiClient.get(`/sales-report/export-excel`, {
        params,
        responseType: 'blob'
      });

      this.logSuccess('exportDashboardToExcel', 'File Excel đã được tạo');
      return response.data;
    } catch (error: unknown) {
      this.logError('exportDashboardToExcel', error);
      throw new Error(`Lỗi khi export dashboard: ${this.getErrorMessage(error)}`);
    }
  }

  // =============================================================================
  // ENHANCED DASHBOARD FEATURES - ROW 2 & ROW 3 STATISTICS
  // =============================================================================

  /**
   * Lấy tổng số suất chiếu hôm nay  
   */
  async getTodayShowtimes(): Promise<number> {
    try {
      
      const today = new Date().toISOString().split('T')[0];
      const response = await apiClient.get(`/showtimes`, {
        params: {
          date: today,
          status: 'Active'
        }
      });

      // Handle different response structures
      let data = null;
      if (response.data.success !== undefined) {
        // Structure: { success, data, message }
        if (!response.data.success) {
          throw new Error(response.data.message || 'Lỗi khi lấy suất chiếu');
        }
        data = response.data.data;
      } else if (Array.isArray(response.data)) {
        // Structure: Array directly
        data = response.data;
      } else if (response.data.showtimes) {
        // Structure: { showtimes: [...] }
        data = response.data.showtimes;
      } else {
        // Structure: Object with unknown format
        data = response.data;
      }

      const count = Array.isArray(data) ? data.length : 0;
      return count;
    } catch (error) {
      return 0; // Fallback
    }
  }

  /**
   * Lấy tổng số rạp phim
   */
  async getTotalCinemas(): Promise<number> {
    try {
      
      const response = await apiClient.get(`/cinemas/active`);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Lỗi khi lấy danh sách rạp');
      }

      const count = response.data.data?.length || 0;

      
      return count;
    } catch (error) {

      return 0; // Fallback
    }
  }

  /**
   * Lấy tỷ lệ lấp đầy ghế trung bình
   */
  async getAverageOccupancyRate(): Promise<number> {
    try {

      
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7); // 7 ngày qua

      const params = {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      };

      const response = await apiClient.get(`/booking-statistics`, { params });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Lỗi khi lấy thống kê booking');
      }

      // Tính trung bình từ roomStatistics
      const roomStats = response.data.data?.roomStatistics || [];
      if (roomStats.length === 0) return 0;

      const avgOccupancy = roomStats.reduce((sum: number, room: any) => 
        sum + (room.occupancyRate || 0), 0) / roomStats.length;
      
      return Math.round(avgOccupancy * 10) / 10; // Làm tròn 1 chữ số thập phân
    } catch (error) {
      return 0; // Fallback
    }
  }

  /**
   * Lấy đánh giá trung bình của tất cả phim
   */
  async getAverageMovieRating(): Promise<number> {
    try {

      
      const response = await apiClient.get(`/movies`);

      // Handle different response structures
      let movies = [];
      if (response.data.success !== undefined) {
        // Structure: { success, data, message }
        if (!response.data.success) {
          throw new Error(response.data.message || 'Lỗi khi lấy danh sách phim');
        }
        movies = response.data.data || [];
      } else if (Array.isArray(response.data)) {
        // Structure: Array directly
        movies = response.data;
      } else if (response.data.movies) {
        // Structure: { movies: [...] }
        movies = response.data.movies;
      } else {
        // Structure: Object with unknown format
        movies = [];
      }

      if (movies.length === 0) return 4.5; // Default rating

      // Tính trung bình rating từ tất cả phim
      const totalRating = movies.reduce((sum: number, movie: any) => 
        sum + (movie.Rating || movie.rating || 4.5), 0);
      
      const avgRating = totalRating / movies.length;
      
      return Math.round(avgRating * 10) / 10; // Làm tròn 1 chữ số thập phân
    } catch (error) {
      return 4.5; // Fallback
    }
  }

  /**
   * Lấy tổng số vé đã bán (tháng này)
   */
  async getTotalTicketsSold(): Promise<number> {
    try {

      
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(1); // Đầu tháng này

      const params = {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      };

      const response = await apiClient.get(`/booking-statistics`, { params });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Lỗi khi lấy thống kê vé');
      }

      const totalTickets = response.data.data?.totalTickets || 0;
      return totalTickets;
    } catch (error) {
      return 0; // Fallback
    }
  }

  /**
   * Lấy doanh thu tuần này
   */
  async getWeeklyRevenue(): Promise<number> {
    try {

      
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7); // 7 ngày qua

      const params = {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      };

      const response = await apiClient.get(`/sales-report/overview`, { params });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Lỗi khi lấy doanh thu tuần');
      }

      const weeklyRevenue = response.data.data?.totalRevenue || 0;
      return weeklyRevenue;
    } catch (error) {
      return 0; // Fallback
    }
  }

  /**
   * Lấy số khuyến mãi đang chạy
   */
  async getActivePromotions(): Promise<number> {
    try {

      
      const response = await apiClient.get(`/promotions/available`);

      // Handle different response structures
      let data = null;
      if (response.data.success !== undefined) {
        // Structure: { success, data, message }
        if (!response.data.success) {
          throw new Error(response.data.message || 'Lỗi khi lấy khuyến mãi');
        }
        data = response.data.data;
      } else if (Array.isArray(response.data)) {
        // Structure: Array directly
        data = response.data;
      } else if (response.data.promotions) {
        // Structure: { promotions: [...] }
        data = response.data.promotions;
      } else {
        // Structure: Object with unknown format
        data = response.data;
      }

      const count = Array.isArray(data) ? data.length : 0;
      return count;
    } catch (error) {
      return 0; // Fallback
    }
  }

  /**
   * Lấy tỷ lệ tăng trưởng tháng này vs tháng trước
   */
  async getMonthlyGrowthRate(): Promise<number> {
    try {

      
      const thisMonth = new Date();
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      // Doanh thu tháng này
      const thisMonthParams = {
        startDate: new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1).toISOString().split('T')[0],
        endDate: thisMonth.toISOString().split('T')[0]
      };

      // Doanh thu tháng trước  
      const lastMonthParams = {
        startDate: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1).toISOString().split('T')[0],
        endDate: new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0).toISOString().split('T')[0]
      };

      const [thisMonthResponse, lastMonthResponse] = await Promise.all([
        apiClient.get(`/sales-report/overview`, { params: thisMonthParams }),
        apiClient.get(`/sales-report/overview`, { params: lastMonthParams })
      ]);

      const thisMonthRevenue = thisMonthResponse.data.data?.totalRevenue || 0;
      const lastMonthRevenue = lastMonthResponse.data.data?.totalRevenue || 0;

      if (lastMonthRevenue === 0) return 0;

      const growthRate = ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
      
      return Math.round(growthRate * 10) / 10; // Làm tròn 1 chữ số thập phân
    } catch (error) {
      return 0; // Fallback
    }
  }

  // =============================================================================
  // NOTIFICATIONS & ALERTS
  // =============================================================================

  /**
   * Lấy thông báo gần đây
   */
  async getRecentNotifications(): Promise<any[]> {
    try {

      
      const response = await apiClient.get(`/notifications`, {
        params: { limit: 10 }
      });

      // Handle different response structures
      let notifications = [];
      if (response.data.success !== undefined) {
        // Structure: { success, data, message }
        if (!response.data.success) {
          throw new Error(response.data.message || 'Lỗi khi lấy thông báo');
        }
        notifications = response.data.data || [];
      } else if (Array.isArray(response.data)) {
        // Structure: Array directly
        notifications = response.data;
      } else if (response.data.notifications) {
        // Structure: { notifications: [...] }
        notifications = response.data.notifications;
      } else {
        // Structure: Object with unknown format
        notifications = [];
      }
      
      return notifications;
    } catch (error) {
      return []; // Fallback
    }
  }

  /**
   * Lấy recent activities (booking, reviews, customers mới)
   */
  async getRecentActivities(): Promise<any[]> {
    try {

      
      // Lấy booking gần đây nhất
      const endDate = new Date();
      const startDate = new Date();
      startDate.setHours(startDate.getHours() - 24); // 24h qua

      const params = {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      };

      const response = await apiClient.get(`/booking-statistics`, { params });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Lỗi khi lấy hoạt động');
      }

      // Format thành activities feed
      const activities = [
        {
          type: 'booking',
          title: 'Đặt vé mới',
          count: response.data.data?.totalBookings || 0,
          time: new Date(),
          icon: '🎟️'
        },
        {
          type: 'revenue',
          title: 'Doanh thu 24h',
          amount: response.data.data?.totalRevenue || 0,
          time: new Date(),
          icon: '💰'
        }
      ];
      
      return activities;
    } catch (error) {
      return []; // Fallback
    }
  }

  // =============================================================================
  // ENHANCED DASHBOARD DATA - COMBINING ALL STATISTICS
  // =============================================================================

  /**
   * Lấy tất cả dữ liệu cho Enhanced Dashboard (mở rộng)
   */
  async getEnhancedDashboardData(filters?: DashboardFilters): Promise<any> {
    try {
      console.log('[DashboardService] Đang gọi getEnhancedDashboardData với mode lazy loading');
      
      // Chỉ lấy thông tin overview cơ bản
      const overview = await this.getDashboardOverview(typeof filters?.period === 'number' ? filters.period : 30);
      
      // Trả về result với các dữ liệu cần thiết nhất
      const result = {
        // Dữ liệu cơ bản
        overview: overview,
        realtime: {}, // Lazy load khi cần
        bookingStats: {}, // Lazy load khi cần
        topMovies: [], // Lazy load khi cần
        
        // Dữ liệu mở rộng - cũng sẽ lazy load
        enhancedStats: {
          todayShowtimes: 0,
          totalCinemas: 0,
          occupancyRate: 0,
          avgRating: 0,
          ticketsSold: 0,
          weeklyRevenue: 0,
          activePromotions: 0,
          growthRate: 0
        },

        // Dữ liệu bổ sung
        notifications: [],
        recentActivities: [],
        
        // Metadata
        lastUpdated: new Date().toISOString(),
        period: filters?.period || 30
      };
      
      return result;
    } catch (error) {
      throw new Error('Lỗi khi lấy dữ liệu Enhanced Dashboard');
    }
  }
}

export const dashboardService = new DashboardService();
export default dashboardService; 
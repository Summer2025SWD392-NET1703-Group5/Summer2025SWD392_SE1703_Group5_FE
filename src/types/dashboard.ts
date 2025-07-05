// Types cho Dashboard Analytics
export interface DashboardOverview {
  totalRevenue: number;
  totalBookings: number;
  totalTickets: number;
  totalCustomers: number;
  revenueGrowth: number;
  bookingsGrowth: number;
  ticketsGrowth: number;
  customersGrowth: number;
}

export interface RealtimeData {
  todayRevenue: number;
  todayBookings: number;
  todayTickets: number;
  hourlyRevenue: Array<{
    hour: number;
    revenue: number;
    bookings: number;
  }>;
  currentHourRevenue: number;
  peakHour: number;
}

export interface MoviePerformance {
  movieId: number;
  movieName: string;
  genre: string;
  totalBookings: number;
  totalTickets: number;
  totalRevenue: number;
  averageBookingValue: number;
  totalShowtimes: number;
  cinemasShowing: number;
  revenuePerShowtime: number;
}

export interface CinemaPerformance {
  cinemaId: number;
  cinemaName: string;
  address: string;
  totalBookings: number;
  totalTickets: number;
  totalRevenue: number;
  averageBookingValue: number;
  totalShowtimes: number;
  activeRooms: number;
  moviesShown: number;
}

export interface PaymentMethodStats {
  paymentMethod: string;
  totalBookings: number;
  totalAmount: number;
  percentage: number;
}

export interface RevenueCategoryStats {
  category: string;
  revenue: number;
  percentage: number;
  description: string;
}

export interface DailyStats {
  date: string;
  totalBookings: number;
  totalTickets: number;
  totalRevenue: number;
}

export interface BookingStatistics {
  startDate?: Date;
  endDate?: Date;
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  totalTickets: number;
  averageTicketsPerBooking: number;
  movieStatistics: MoviePerformance[];
  roomStatistics: Array<{
    roomId: number;
    roomName: string;
    roomCapacity: number;
    totalBookings: number;
    totalTickets: number;
    totalRevenue: number;
    occupancyRate: number;
  }>;
  dailyStatistics: DailyStats[];
  paymentMethodStatistics: PaymentMethodStats[];
}

export interface SalesReport {
  startDate: Date;
  endDate: Date;
  period: 'daily' | 'weekly' | 'monthly';
  totalTickets: number;
  totalAmount: number;
  totalBookings: number;
  averageBookingValue: number;
  periodSales: Array<{
    periodName: string;
    periodKey: string;
    totalBookings: number;
    totalTickets: number;
    totalAmount: number;
    averageBookingValue: number;
  }>;
  movieStatistics: MoviePerformance[];
  paymentStatistics: PaymentMethodStats[];
  cinemaStatistics: CinemaPerformance[];
  generatedAt: Date;
}

export interface DashboardData {
  overview: DashboardOverview;
  realtime: RealtimeData;
  bookingStats: BookingStatistics;
  salesReport: SalesReport;
  topMovies: MoviePerformance[];
  topCinemas: CinemaPerformance[];
  paymentMethods: PaymentMethodStats[];
  revenueCategories: RevenueCategoryStats[];
  dailyTrends: DailyStats[];
  
  // Enhanced Dashboard Features
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
  
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export interface DashboardFilters {
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  period: number | 'daily' | 'weekly' | 'monthly';
  cinemaId?: number;
  movieId?: number;
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    borderWidth?: number;
    fill?: boolean;
  }>;
} 
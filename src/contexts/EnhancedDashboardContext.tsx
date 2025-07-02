import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import type {
  DashboardData,
  DashboardFilters,
  DashboardOverview,
  RealtimeData
} from '../types/dashboard';
import { dashboardService } from '../services/dashboardService';
import { toast } from 'react-hot-toast';


// Dashboard State
interface DashboardState {
  data: DashboardData;
  filters: DashboardFilters;
  isLoading: boolean;
  error: string | null;
  lastRefresh: Date | null;
  autoRefresh: boolean;
  refreshInterval: number; // seconds
}


// Dashboard Actions
type DashboardAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_DATA'; payload: Partial<DashboardData> }
  | { type: 'SET_FILTERS'; payload: Partial<DashboardFilters> }
  | { type: 'SET_OVERVIEW'; payload: DashboardOverview }
  | { type: 'SET_REALTIME'; payload: RealtimeData }
  | { type: 'SET_AUTO_REFRESH'; payload: boolean }
  | { type: 'SET_REFRESH_INTERVAL'; payload: number }
  | { type: 'SET_LAST_REFRESH'; payload: Date }
  | { type: 'RESET_STATE' };


// Initial State
const initialState: DashboardState = {
  data: {
    overview: {
      totalRevenue: 0,
      totalBookings: 0,
      totalTickets: 0,
      totalCustomers: 0,
      revenueGrowth: 0,
      bookingsGrowth: 0,
      ticketsGrowth: 0,
      customersGrowth: 0,
    },
    realtime: {
      todayRevenue: 0,
      todayBookings: 0,
      todayTickets: 0,
      hourlyRevenue: [],
      currentHourRevenue: 0,
      peakHour: 0,
    },
    bookingStats: {
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
    topMovies: [],
    topCinemas: [],
    paymentMethods: [],
    revenueCategories: [],
    dailyTrends: [],
    isLoading: false,
    error: null,
    lastUpdated: null,
  },
  filters: {
    dateRange: {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      endDate: new Date(),
    },
    period: 30,
  },
  isLoading: false,
  error: null,
  lastRefresh: null,
  autoRefresh: true,
  refreshInterval: 300, // 5 minutes
};


// Reducer
function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };

    case 'SET_DATA':
      return {
        ...state,
        data: { ...state.data, ...action.payload },
        error: null,
        isLoading: false,
      };

    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      };

    case 'SET_OVERVIEW':
      return {
        ...state,
        data: { ...state.data, overview: action.payload },
      };

    case 'SET_REALTIME':
      return {
        ...state,
        data: { ...state.data, realtime: action.payload },
      };

    case 'SET_AUTO_REFRESH':
      return { ...state, autoRefresh: action.payload };

    case 'SET_REFRESH_INTERVAL':
      return { ...state, refreshInterval: action.payload };

    case 'SET_LAST_REFRESH':
      return { ...state, lastRefresh: action.payload };

    case 'RESET_STATE':
      return initialState;

    default:
      return state;
  }
}


// Context Interface
interface DashboardContextType {
  state: DashboardState;

  // Data fetching methods
  refreshAllData: () => Promise<void>;
  refreshOverview: () => Promise<void>;
  refreshRealtime: () => Promise<void>;

  // Filter methods
  updateFilters: (filters: Partial<DashboardFilters>) => void;
  setDateRange: (startDate: Date, endDate: Date) => void;
  setPeriod: (period: number | 'daily' | 'weekly' | 'monthly') => void;

  // Settings methods
  toggleAutoRefresh: () => void;
  setRefreshInterval: (seconds: number) => void;

  // Export methods
  exportToExcel: (reportType?: string) => Promise<void>;

  // Utility methods
  resetError: () => void;
  resetState: () => void;
}


// Create Context
const DashboardContext = createContext<DashboardContextType | undefined>(undefined);


// Provider Component
interface DashboardProviderProps {
  children: React.ReactNode;
}


export const EnhancedDashboardProvider: React.FC<DashboardProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);


  // Ghi log thành công/lỗi bằng tiếng Việt
  const logSuccess = useCallback((action: string) => {
    console.log(`[EnhancedDashboardContext] ${action} thành công`);
  }, []);


  const logError = useCallback((action: string, error: unknown) => {
    console.error(`[EnhancedDashboardContext] Lỗi ${action}:`, error);
  }, []);


  // Refresh all dashboard data
  const refreshAllData = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      console.log('[EnhancedDashboardContext] Đang refresh toàn bộ dữ liệu dashboard...');

      // Sử dụng Enhanced Dashboard method mới
      const dashboardData = await dashboardService.getEnhancedDashboardData(state.filters);

      dispatch({ type: 'SET_DATA', payload: dashboardData });
      dispatch({ type: 'SET_LAST_REFRESH', payload: new Date() });

      logSuccess('refresh toàn bộ dữ liệu');
      // toast.success('Đã cập nhật dữ liệu Enhanced Dashboard'); // Removed notification

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      logError('refresh toàn bộ dữ liệu', error);
      toast.error(`Lỗi khi cập nhật dashboard: ${errorMessage}`);
    }
  }, [state.filters, logSuccess, logError]);


  // Refresh overview data only
  const refreshOverview = useCallback(async () => {
    try {
      console.log('[EnhancedDashboardContext] Đang refresh tổng quan...');

      const period = typeof state.filters.period === 'number' ? state.filters.period : 30;
      const overview = await dashboardService.getDashboardOverview(period);
      dispatch({ type: 'SET_OVERVIEW', payload: overview });

      logSuccess('refresh tổng quan');

    } catch (error) {
      logError('refresh tổng quan', error);
      // Don't show toast for individual component errors
    }
  }, [state.filters.period, logSuccess, logError]);


  // Refresh realtime data only
  const refreshRealtime = useCallback(async () => {
    try {
      console.log('[EnhancedDashboardContext] Đang refresh dữ liệu realtime...');

      const realtime = await dashboardService.getRealtimeData();
      dispatch({ type: 'SET_REALTIME', payload: realtime });

      logSuccess('refresh dữ liệu realtime');

    } catch (error) {
      logError('refresh dữ liệu realtime', error);
      // Don't show toast for individual component errors
    }
  }, [logSuccess, logError]);


  // Update filters
  const updateFilters = useCallback((filters: Partial<DashboardFilters>) => {
    console.log('[EnhancedDashboardContext] Cập nhật filters:', filters);
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);


  // Set date range
  const setDateRange = useCallback((startDate: Date, endDate: Date) => {
    console.log('[EnhancedDashboardContext] Cập nhật khoảng thời gian:', { startDate, endDate });
    dispatch({ type: 'SET_FILTERS', payload: { dateRange: { startDate, endDate } } });
  }, []);


  // Set period
  const setPeriod = useCallback((period: number | 'daily' | 'weekly' | 'monthly') => {
    console.log('[EnhancedDashboardContext] Cập nhật chu kỳ:', period);

    // Convert string periods to numbers
    let numericPeriod: number;
    if (typeof period === 'string') {
      switch (period) {
        case 'daily': numericPeriod = 1; break;
        case 'weekly': numericPeriod = 7; break;
        case 'monthly': numericPeriod = 30; break;
        default: numericPeriod = 30; break;
      }
    } else {
      numericPeriod = period;
    }

    dispatch({ type: 'SET_FILTERS', payload: { period: numericPeriod } });
  }, []);


  // Toggle auto refresh
  const toggleAutoRefresh = useCallback(() => {
    const newValue = !state.autoRefresh;
    console.log('[EnhancedDashboardContext] Toggle auto refresh:', newValue);
    dispatch({ type: 'SET_AUTO_REFRESH', payload: newValue });

    if (newValue) {
      toast.success('Đã bật tự động làm mới');
    } else {
      toast.success('Đã tắt tự động làm mới');
    }
  }, [state.autoRefresh]);


  // Set refresh interval
  const setRefreshInterval = useCallback((seconds: number) => {
    console.log('[EnhancedDashboardContext] Cập nhật khoảng thời gian refresh:', seconds);
    dispatch({ type: 'SET_REFRESH_INTERVAL', payload: seconds });
    toast.success(`Đã cập nhật khoảng thời gian làm mới: ${seconds}s`);
  }, []);


  // Export to Excel
  const exportToExcel = useCallback(async (reportType: string = 'sales') => {
    try {
      console.log('[EnhancedDashboardContext] Đang export Excel...', reportType);

      const blob = await dashboardService.exportDashboardToExcel(state.filters, reportType);

      // Tạo download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dashboard-report-${reportType}-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      logSuccess('export Excel');
      toast.success('Đã xuất báo cáo Excel thành công');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      logError('export Excel', error);
      toast.error(`Lỗi khi xuất Excel: ${errorMessage}`);
    }
  }, [state.filters, logSuccess, logError]);


  // Reset error
  const resetError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);


  // Reset state
  const resetState = useCallback(() => {
    console.log('[EnhancedDashboardContext] Reset state');
    dispatch({ type: 'RESET_STATE' });
    toast.success('Đã reset dashboard');
  }, []);


  // Auto refresh effect - chỉ log 1 lần khi mount
  useEffect(() => {
    // Chỉ log thông báo 1 lần, không thực hiện refresh tự động để tối ưu hiệu năng
    console.log(`[EnhancedDashboardContext] Auto refresh disabled để tối ưu hiệu năng`);
    
    // Không setup interval để tránh spam API calls
    // let interval: NodeJS.Timeout;
    // if (state.autoRefresh && state.refreshInterval > 0) {
    //   interval = setInterval(() => {
    //     refreshRealtime(); 
    //   }, state.refreshInterval * 1000);
    // }

    // return () => {
    //   if (interval) {
    //     clearInterval(interval);
    //   }
    // };
  }, []); // Chỉ chạy 1 lần khi mount


  // Initial data load - chỉ log 1 lần
  useEffect(() => {
    console.log('[EnhancedDashboardContext] Manual data loading để tối ưu hiệu năng');
    // refreshAllData(); // Disabled auto loading
  }, []); // eslint-disable-line react-hooks/exhaustive-deps


  // Context value
  const contextValue: DashboardContextType = {
    state,
    refreshAllData,
    refreshOverview,
    refreshRealtime,
    updateFilters,
    setDateRange,
    setPeriod,
    toggleAutoRefresh,
    setRefreshInterval,
    exportToExcel,
    resetError,
    resetState,
  };


  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
};


// Custom hook to use dashboard context
export const useEnhancedDashboard = (): DashboardContextType => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useEnhancedDashboard must be used within an EnhancedDashboardProvider');
  }
  return context;
};


export default DashboardContext;


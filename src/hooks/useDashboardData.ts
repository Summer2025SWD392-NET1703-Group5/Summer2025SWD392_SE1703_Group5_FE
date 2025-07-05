// src/hooks/useDashboardData.ts
import { useState, useEffect, useCallback } from 'react';
import { useDashboard } from '../contexts/DashboardContext';

interface DashboardMetrics {
  dailyRevenue: number;
  dailyBookings: number;
  totalCustomers: number;
  averageTicketPrice: number;
  cancellationRate: number;
  customerGrowthRate: number;
}

interface DashboardChartData {
  revenue: Array<{ date: string; amount: number }>;
  bookings: Array<{ date: string; count: number }>;
  moviePerformance: Array<{ title: string; revenue: number; bookings: number }>;
  customerDemographics: any;
  peakHours: any;
  seatOccupancy: any;
}

export const useDashboardData = () => {
  const { state, dispatch } = useDashboard();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [chartData, setChartData] = useState<DashboardChartData | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockMetrics: DashboardMetrics = {
        dailyRevenue: 125000000 + Math.random() * 50000000,
        dailyBookings: 342 + Math.floor(Math.random() * 100),
        totalCustomers: 15847 + Math.floor(Math.random() * 1000),
        averageTicketPrice: 85000 + Math.random() * 20000,
        cancellationRate: 3.2 + Math.random() * 2,
        customerGrowthRate: 12.5 + Math.random() * 5,
      };

      setMetrics(mockMetrics);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Không thể tải dữ liệu metrics' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.dateRange, state.filters, dispatch]);

  const fetchChartData = useCallback(async () => {
    try {
      // Generate mock chart data based on date range and filters
      const days = Math.ceil((state.dateRange.endDate.getTime() - state.dateRange.startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      const revenueData = Array.from({ length: days }, (_, i) => {
        const date = new Date(state.dateRange.startDate);
        date.setDate(date.getDate() + i);
        return {
          date: date.toISOString().split('T')[0],
          amount: 2000000 + Math.random() * 3000000,
        };
      });

      const bookingData = Array.from({ length: days }, (_, i) => {
        const date = new Date(state.dateRange.startDate);
        date.setDate(date.getDate() + i);
        return {
          date: date.toISOString().split('T')[0],
          count: 150 + Math.floor(Math.random() * 200),
        };
      });

      const mockChartData: DashboardChartData = {
        revenue: revenueData,
        bookings: bookingData,
        moviePerformance: [
          { title: 'Avatar: The Way of Water', revenue: 45000000, bookings: 1250 },
          { title: 'Top Gun: Maverick', revenue: 38000000, bookings: 1100 },
          { title: 'Black Panther: Wakanda Forever', revenue: 32000000, bookings: 950 },
        ],
        customerDemographics: {},
        peakHours: {},
        seatOccupancy: {},
      };

      setChartData(mockChartData);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Không thể tải dữ liệu biểu đồ' });
    }
  }, [state.dateRange, state.filters, dispatch]);

  const refreshData = useCallback(() => {
    fetchMetrics();
    fetchChartData();
  }, [fetchMetrics, fetchChartData]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Auto refresh
  useEffect(() => {
    if (!state.autoRefresh) return;

    const interval = setInterval(refreshData, state.refreshInterval);
    return () => clearInterval(interval);
  }, [state.autoRefresh, state.refreshInterval, refreshData]);

  return {
    metrics,
    chartData,
    loading: state.loading,
    error: state.error,
    refreshData,
  };
};

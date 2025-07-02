// src/contexts/DashboardContext.tsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';

interface DashboardState {
  loading: boolean;
  error: string | null;
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  filters: {
    cinema?: string;
    movie?: string;
    category?: string;
  };
  refreshInterval: number;
  autoRefresh: boolean;
}

type DashboardAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_DATE_RANGE'; payload: { startDate: Date; endDate: Date } }
  | { type: 'SET_FILTERS'; payload: Partial<DashboardState['filters']> }
  | { type: 'SET_REFRESH_INTERVAL'; payload: number }
  | { type: 'TOGGLE_AUTO_REFRESH' };

const initialState: DashboardState = {
  loading: false,
  error: null,
  dateRange: {
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    endDate: new Date(),
  },
  filters: {},
  refreshInterval: 30000, // 30 seconds
  autoRefresh: true,
};

const dashboardReducer = (state: DashboardState, action: DashboardAction): DashboardState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_DATE_RANGE':
      return { ...state, dateRange: action.payload };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'SET_REFRESH_INTERVAL':
      return { ...state, refreshInterval: action.payload };
    case 'TOGGLE_AUTO_REFRESH':
      return { ...state, autoRefresh: !state.autoRefresh };
    default:
      return state;
  }
};

const DashboardContext = createContext<{
  state: DashboardState;
  dispatch: React.Dispatch<DashboardAction>;
} | null>(null);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Add safety check for React hooks
  if (!React || typeof React.useReducer !== 'function') {
    console.error('React hooks are not available. Please check your React installation.');
    return <div>Loading...</div>;
  }

  try {
    const [state, dispatch] = React.useReducer(dashboardReducer, initialState);

    return (
      <DashboardContext.Provider value={{ state, dispatch }}>
        {children}
      </DashboardContext.Provider>
    );
  } catch (error) {
    console.error('Error in DashboardProvider:', error);
    return <div>Error loading dashboard context</div>;
  }
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

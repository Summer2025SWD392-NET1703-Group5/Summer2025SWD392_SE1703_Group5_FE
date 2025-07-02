// contexts/AuthContext.tsx
import React, { createContext, useContext, useReducer, useEffect, type ReactNode, type Dispatch, type SetStateAction } from 'react';
import { jwtDecode } from 'jwt-decode';
import type { User, LoginCredentials, RegisterData } from '../types/auth';
import { authService } from '../services/authService';
import { userService } from '../services/userService';

// --- Interfaces ---
// Đổi tên để tránh xung đột với AuthState được import
interface ContextState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends ContextState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  refreshToken: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User | null) => void;
}

interface DecodedToken {
  id: number; // Thường là id hoặc sub
  email: string;
  fullName: string;
  role: 'Customer' | 'Staff' | 'Admin' | 'Manager';
  exp: number;
}

// --- Reducer ---
type AuthAction =
  | { type: 'INIT' }
  | { type: 'LOGOUT' }
  | { type: 'START_ACTION' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'CLEAR_ERROR' };

const initialState: ContextState = {
  user: null,
  isAuthenticated: false,
  isLoading: true, // Bắt đầu với loading = true để chờ initialize
  error: null,
};

const authReducer = (state: ContextState, action: AuthAction): ContextState => {
  switch (action.type) {
    case 'START_ACTION':
      return { ...state, isLoading: true, error: null };
    case 'AUTH_SUCCESS':
      return { ...state, isLoading: false, isAuthenticated: true, user: action.payload, error: null };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'AUTH_FAILURE':
      return { ...state, isLoading: false, isAuthenticated: false, user: null, error: action.payload };
    case 'LOGOUT':
      return { ...initialState, isLoading: false };
    case 'INIT':
      return { ...initialState, isLoading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

// --- Context & Provider ---
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Safe wrapper for useReducer to handle React hook errors
const useSafeReducer = (reducer: any, initialState: any) => {
  try {
    return useReducer(reducer, initialState);
  } catch (error) {
    console.error('useReducer error:', error);
    // Fallback state
    return [initialState, () => { }];
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  let state: ContextState;
  let dispatch: React.Dispatch<AuthAction>;

  try {
    [state, dispatch] = useReducer(authReducer, initialState);
  } catch (error) {
    console.error('AuthProvider useReducer error:', error);
    // Fallback to basic state management
    state = initialState;
    dispatch = () => { };
  }

  useEffect(() => {
    if (!dispatch || typeof dispatch !== 'function') {
      console.warn('AuthProvider: dispatch not available, skipping initialization');
      return;
    }

    const initializeAuth = async () => {
      dispatch({ type: 'START_ACTION' });
      const accessToken = localStorage.getItem('accessToken');

      if (accessToken) {
        try {
          const user = await userService.getUserProfile();
          dispatch({ type: 'AUTH_SUCCESS', payload: user });
        } catch (error) {
          authService.logout();
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        dispatch({ type: 'INIT' });
      }
    };

    initializeAuth();

    const syncAuth = (event: StorageEvent) => {
      if (event.key === 'accessToken' || event.key === 'refreshToken') {
        initializeAuth();
      }
    };
    window.addEventListener('storage', syncAuth);
    return () => window.removeEventListener('storage', syncAuth);

  }, [dispatch]);

  const login = async (credentials: LoginCredentials) => {
    if (!dispatch) return;
    dispatch({ type: 'START_ACTION' });
    try {
      const user = await authService.login(credentials);
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
    } catch (error: any) {
      dispatch({ type: 'AUTH_FAILURE', payload: error.message || 'Login failed' });
      throw error;
    }
  };

  const register = async (userData: RegisterData) => {
    if (!dispatch) return;
    dispatch({ type: 'START_ACTION' });
    try {
      const user = await authService.register(userData);
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
    } catch (error: any) {
      dispatch({ type: 'AUTH_FAILURE', payload: error.message || 'Registration failed' });
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    if (dispatch) dispatch({ type: 'LOGOUT' });
  };

  const clearError = () => {
    if (dispatch) dispatch({ type: 'CLEAR_ERROR' });
  };

  const setUser = (user: User | null) => {
    if (dispatch) dispatch({ type: 'SET_USER', payload: user });
  };

  const forgotPassword = async (email: string) => {
    await authService.forgotPassword(email);
  };

  const resetPassword = async (token: string, newPassword: string) => {
    await authService.resetPassword(token, newPassword);
  };

  const refreshToken = async () => {
    try {
      await authService.refreshToken();
      const user = await userService.getUserProfile();
      if (dispatch) dispatch({ type: 'AUTH_SUCCESS', payload: user });
    } catch (error) {
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      register,
      logout,
      clearError,
      setUser,
      forgotPassword,
      resetPassword,
      refreshToken
    }}>
      {!state.isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export context để useAuth hook có thể dùng
export { AuthContext };
export type { AuthContextType };

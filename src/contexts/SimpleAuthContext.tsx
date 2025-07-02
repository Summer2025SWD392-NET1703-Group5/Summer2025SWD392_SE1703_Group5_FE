// Simple AuthContext backup without useReducer
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, LoginCredentials, RegisterData } from '../types/auth';
import { authService } from '../services/authService';
import { userService } from '../services/userService';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (userData: RegisterData) => Promise<void>;
    logout: () => void;
    forgotPassword: (email: string) => Promise<void>;
    resetPassword: (token: string, newPassword: string) => Promise<void>;
    refreshToken: () => Promise<void>;
    clearError: () => void;
    setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const SimpleAuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        // Tránh duplicate initialization
        if (initialized) return;

        const initializeAuth = async () => {
            console.log('[AuthContext] Initializing auth...');
            setIsLoading(true);
            const accessToken = localStorage.getItem('accessToken');
            
            if (accessToken) {
                try {
                    const userData = await userService.getUserProfile();
                    console.log('[AuthContext] User authenticated:', userData.role);
                    setUser(userData);
                    setIsAuthenticated(true);
                } catch (error) {
                    console.error('[AuthContext] Authentication failed:', error);
                    authService.logout();
                    setUser(null);
                    setIsAuthenticated(false);
                }
            } else {
                setUser(null);
                setIsAuthenticated(false);
            }
            setIsLoading(false);
            setInitialized(true);
            console.log('[AuthContext] Auth initialized');
        };

        initializeAuth();

        const syncAuth = (event: StorageEvent) => {
            if (event.key === 'accessToken' || event.key === 'refreshToken') {
                setInitialized(false); // Reset để cho phép re-init
            }
        };
        window.addEventListener('storage', syncAuth);
        return () => window.removeEventListener('storage', syncAuth);
    }, [initialized]);

    const login = async (credentials: LoginCredentials) => {
        setIsLoading(true);
        setError(null);
        try {
            const userData = await authService.login(credentials);
            setUser(userData);
            setIsAuthenticated(true);
        } catch (error: any) {
            setError(error.message || 'Login failed');
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (userData: RegisterData) => {
        setIsLoading(true);
        setError(null);
        try {
            const user = await authService.register(userData);
            setUser(user);
            setIsAuthenticated(true);
        } catch (error: any) {
            setError(error.message || 'Registration failed');
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
        setIsAuthenticated(false);
        setError(null);
    };

    const clearError = () => setError(null);

    const forgotPassword = async (email: string) => {
        await authService.forgotPassword(email);
    };

    const resetPassword = async (token: string, newPassword: string) => {
        await authService.resetPassword(token, newPassword);
    };

    const refreshToken = async () => {
        try {
            await authService.refreshToken();
            const userData = await userService.getUserProfile();
            setUser(userData);
            setIsAuthenticated(true);
        } catch (error) {
            logout();
        }
    };

    const contextValue: AuthContextType = {
        user,
        isAuthenticated,
        isLoading,
        error,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        refreshToken,
        clearError,
        setUser,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within a SimpleAuthProvider');
    }
    return context;
};

export { AuthContext };
export type { AuthContextType }; 
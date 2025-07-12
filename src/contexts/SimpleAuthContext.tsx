// Simple AuthContext backup without useReducer
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { User, LoginCredentials, RegisterData } from "../types/auth";
import { authService } from "../services/authService";
import { userService } from "../services/userService";
import { bookingService } from "../services/bookingService";

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
      console.log("[AuthContext] Initializing auth...");
      setIsLoading(true);
      const accessToken = localStorage.getItem("accessToken");

      if (accessToken) {
        try {
          const userData = await userService.getUserProfile();
          console.log("[AuthContext] User authenticated:", userData.role);
          setUser(userData);
          setIsAuthenticated(true);
        } catch (error) {
          console.error("[AuthContext] Authentication failed:", error);
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
      console.log("[AuthContext] Auth initialized");
    };

    initializeAuth();

    const syncAuth = (event: StorageEvent) => {
      if (event.key === "accessToken" || event.key === "refreshToken") {
        setInitialized(false); // Reset để cho phép re-init
      }
    };
    window.addEventListener("storage", syncAuth);
    return () => window.removeEventListener("storage", syncAuth);
  }, [initialized]);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      // First, perform login to get tokens
      await authService.login(credentials);
      
      // Then fetch the complete user profile to ensure all fields (including cinemaId) are loaded
      const userData = await userService.getUserProfile();
      console.log("[AuthContext] Complete user profile loaded:", userData);

      // 🔥 Clear all booking sessions when user changes (but preserve pending booking info)
      console.log("🧹 [AUTH] Clearing all booking sessions for new user login");
      Object.keys(sessionStorage).forEach((key) => {
        if (
          (key.startsWith("booking_session_") ||
            key.startsWith("payment_state_") ||
            key.includes("booking") ||
            key.includes("payment")) &&
          key !== "has_pending_booking"
        ) {
          // ← Preserve pending booking info
          console.log(`🗑️ [AUTH] Removing session key: ${key}`);
          sessionStorage.removeItem(key);
        }
      });

      setUser(userData);
      setIsAuthenticated(true);

      // 🔧 FIX: Set global auth context for WebSocket
      (window as any).__AUTH_CONTEXT__ = { user: userData };

      // 🔍 Check for pending bookings after successful login
      console.log("🔍 [AUTH] Checking for pending bookings after login");
      try {
        const pendingResult = await bookingService.checkPendingBookings();
        if (pendingResult) {
          console.log("📋 [AUTH] Found pending booking:", pendingResult);

          if (pendingResult.hasPendingBooking) {
            // Có pending booking nhưng chỉ có thông tin cơ bản từ error message
            console.log(`🎬 [AUTH] User has pending booking for movie: ${pendingResult.movieName}`);
            console.log(`⏰ [AUTH] Remaining time: ${pendingResult.remainingMinutes} minutes`);

            // Set flag để BookingPage biết có pending booking
            sessionStorage.setItem(
              "has_pending_booking",
              JSON.stringify({
                movieName: pendingResult.movieName,
                remainingMinutes: pendingResult.remainingMinutes,
                message: pendingResult.message,
              })
            );
          } else {
            // Có full thông tin pending booking
            const bookingSession = {
              id: `booking-${Date.now()}`,
              bookingId: pendingResult.Booking_ID,
              movieId: String(pendingResult.Movie_ID || "1"), // 🔧 Đảm bảo có movieId
              cinemaId: "1", // Default cinema ID
              showtimeId: String(pendingResult.Showtime_ID), // 🔧 Đảm bảo có showtimeId
              selectedSeats: pendingResult.Seats || pendingResult.seats || [], // 🔧 Sử dụng đúng field name
              totalPrice: pendingResult.Total_Amount,
              movieName: pendingResult.Movie_Name,
              showDate: pendingResult.Show_Date,
              startTime: pendingResult.Start_Time,
              roomName: pendingResult.Room_Name,
              timestamp: Date.now(),
              expiresAt: new Date(pendingResult.Payment_Deadline),
            };

            const showtimeIdStr = String(pendingResult.Showtime_ID);
            const bookingIdStr = String(pendingResult.Booking_ID);

            // 🔧 Lưu với cả 2 key để đảm bảo tìm được
            sessionStorage.setItem(`booking_session_${showtimeIdStr}`, JSON.stringify(bookingSession));
            sessionStorage.setItem(`booking_session_${bookingIdStr}`, JSON.stringify(bookingSession));
            console.log(
              `💾 [AUTH] Restored booking session for pending booking with keys: booking_session_${showtimeIdStr} and booking_session_${bookingIdStr}`
            );

            // 🎯 QUAN TRỌNG: Set flag để BookingPage biết có pending booking
            const deadlineTime = new Date(pendingResult.Payment_Deadline).getTime();
            const currentTime = new Date().getTime();
            const remainingMinutes = Math.ceil((deadlineTime - currentTime) / (1000 * 60));

            sessionStorage.setItem(
              "has_pending_booking",
              JSON.stringify({
                movieName: pendingResult.Movie_Name,
                remainingMinutes: remainingMinutes,
                message: "Bạn có đơn đặt vé chưa thanh toán",
                bookingId: pendingResult.Booking_ID,
                showtimeId: pendingResult.Showtime_ID,
                movieId: pendingResult.Movie_ID,
              })
            );
            console.log("🎯 [AUTH] Set has_pending_booking flag for BookingPage redirect");
          }
        } else {
          console.log("📭 [AUTH] No pending bookings found");
        }
      } catch (error) {
        console.error("❌ [AUTH] Error checking pending bookings:", error);
        // Don't throw error, just log it
      }
    } catch (error: any) {
      setError(error.message || "Login failed");
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
      setError(error.message || "Registration failed");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // 🔄 MODIFIED: Do NOT clear booking sessions to preserve cross-tab seat state
    console.log("🔄 [AUTH] Logout without clearing booking sessions (preserve cross-tab state)");

    // Only clear sensitive auth data, not booking sessions
    const sensitiveKeys = ["user", "token", "auth_token", "access_token"];
    sensitiveKeys.forEach((key) => {
      if (localStorage.getItem(key)) {
        console.log(`🗑️ [AUTH] Removing sensitive key: ${key}`);
        localStorage.removeItem(key);
      }
    });

    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    setError(null);

    // 🔧 FIX: Clear global auth context
    (window as any).__AUTH_CONTEXT__ = null;
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

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within a SimpleAuthProvider");
  }
  return context;
};

export { AuthContext };
export type { AuthContextType };
// pages/BookingPage.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import BookingProgress from "../components/BookingProgress";
import SeatSelection from "../components/SeatSelection";
import PaymentComponent from "../components/PaymentComponent";
import type { BookingStep, BookingSession, Seat, CinemaRoom } from "../types";
import { cinemaRooms, createStandardRoom } from "../utils/cinemaLayouts";
import FullScreenLoader from "../components/FullScreenLoader";
import api from "../config/api"; // Changed from axios to the configured API instance
import { toast } from "react-hot-toast";
import { bookingService } from "../services/bookingService";
import { webSocketService } from "../services/webSocketService";
import { sessionStorageService } from "../services/sessionStorageService";
import { ArrowLeftIcon, XCircleIcon } from "@heroicons/react/24/outline";
import PayOSQRModal from "../components/PayOSQRModal";

const BookingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showtimeId } = useParams<{ showtimeId: string }>();
  const [room, setRoom] = useState<CinemaRoom | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [seats, setSeats] = useState<any[]>([]);

  // Thay thế việc sử dụng localStorage bằng API
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);

  // 🔄 State để quản lý việc chuyển đổi giữa seat selection và payment
  // 🛡️ Initialize với check sessionStorage để persist qua reload
  const [currentView, setCurrentView] = useState<"seats" | "payment">(() => {
    try {
      const urlShowtimeId = window.location.pathname.split("/").pop();
      if (urlShowtimeId) {
        const saved = sessionStorage.getItem(`payment_state_${urlShowtimeId}`);
        if (saved) {
          const paymentState = JSON.parse(saved);
          if (paymentState.currentView === "payment" && Date.now() < paymentState.expiresAt) {
            console.log("🔄 [INIT] Restoring currentView to payment from sessionStorage");
            return "payment";
          }
        }
      }
    } catch (error) {
      console.warn("⚠️ [INIT] Failed to check payment state in sessionStorage:", error);
    }
    return "seats";
  });
  const [paymentBookingSession, setPaymentBookingSession] = useState<BookingSession | null>(() => {
    try {
      const urlShowtimeId = window.location.pathname.split("/").pop();
      if (urlShowtimeId) {
        const saved = sessionStorage.getItem(`payment_state_${urlShowtimeId}`);
        if (saved) {
          const paymentState = JSON.parse(saved);
          if (paymentState.currentView === "payment" && Date.now() < paymentState.expiresAt) {
            console.log("🔄 [INIT] Restoring paymentBookingSession from sessionStorage");
            return paymentState.paymentBookingSession;
          }
        }
      }
    } catch (error) {
      console.warn("⚠️ [INIT] Failed to restore paymentBookingSession:", error);
    }
    return null;
  });
  const [isFromPaymentBack, setIsFromPaymentBack] = useState<boolean>(false); // Track nếu từ payment quay lại
  const [isCancellingBooking, setIsCancellingBooking] = useState<boolean>(false); // Flag để prevent restore khi đang cancel
  const [isRestoringPayment, setIsRestoringPayment] = useState<boolean>(false); // Flag để prevent cross-tab interference khi đang restore

  // 🔄 Payment state persistence
  interface PaymentStateData {
    currentView: "payment";
    paymentBookingSession: BookingSession;
    timestamp: number;
    expiresAt: number;
    showtimeId: string;
  }

  const PAYMENT_STATE_EXPIRATION = 15 * 60 * 1000; // 15 phút

  // 🔄 Helper functions cho payment state persistence
  const savePaymentState = useCallback(
    (session: BookingSession) => {
      if (!showtimeId) {
        console.warn("⚠️ [PAYMENT_STATE] Cannot save - showtimeId is missing");
        return;
      }

      const paymentState: PaymentStateData = {
        currentView: "payment",
        paymentBookingSession: session,
        timestamp: Date.now(),
        expiresAt: Date.now() + PAYMENT_STATE_EXPIRATION,
        showtimeId: showtimeId,
      };

      const key = `payment_state_${showtimeId}`;
      try {
        sessionStorage.setItem(key, JSON.stringify(paymentState));
        console.log(`💾 [PAYMENT_STATE] Saved payment state for showtime: ${showtimeId}`);
      } catch (error) {
        console.error("❌ [PAYMENT_STATE] Failed to save payment state:", error);
      }
    },
    [showtimeId]
  );

  const loadPaymentState = useCallback(
    (targetShowtimeId?: string): PaymentStateData | null => {
      const idToUse = targetShowtimeId || showtimeId;
      console.log(
        `🔧 [DEBUG] loadPaymentState called with targetShowtimeId: ${targetShowtimeId}, showtimeId: ${showtimeId}, using: ${idToUse}`
      );

      if (!idToUse) {
        console.warn("⚠️ [PAYMENT_STATE] Cannot load - no showtimeId available");
        return null;
      }

      const key = `payment_state_${idToUse}`;
      try {
        const stored = sessionStorage.getItem(key);
        if (!stored) {
          console.log(`📭 [PAYMENT_STATE] No saved state found for key: ${key}`);
          return null;
        }

        const paymentState: PaymentStateData = JSON.parse(stored);

        // Kiểm tra expiration
        if (Date.now() > paymentState.expiresAt) {
          console.log(`⏰ [PAYMENT_STATE] Payment state expired, removing...`);
          sessionStorage.removeItem(key);
          return null;
        }

        // Validate data structure
        if (paymentState.currentView !== "payment" || !paymentState.paymentBookingSession) {
          console.warn("⚠️ [PAYMENT_STATE] Invalid payment state structure");
          sessionStorage.removeItem(key);
          return null;
        }

        console.log(`📥 [PAYMENT_STATE] Loaded valid payment state for showtime: ${idToUse}`);
        return paymentState;
      } catch (error) {
        console.error("❌ [PAYMENT_STATE] Failed to load payment state:", error);
        sessionStorage.removeItem(key);
        return null;
      }
    },
    [showtimeId]
  );

  const clearPaymentState = useCallback(() => {
    if (!showtimeId) return;

    const key = `payment_state_${showtimeId}`;
    sessionStorage.removeItem(key);
    console.log(`🗑️ [PAYMENT_STATE] Cleared payment state for showtime: ${showtimeId}`);
  }, [showtimeId]);

  // 🔍 Validate booking status
  const validateBookingStatus = useCallback(async (bookingId: string): Promise<boolean> => {
    try {
      console.log(`🔍 [BOOKING_VALIDATION] Checking booking status: ${bookingId}`);

      const response = await api.get(`/bookings/${bookingId}`);

      if (response.data?.success && response.data?.data) {
        const booking = response.data.data;
        const isValid = booking.Status === "Pending";

        console.log(`🔍 [BOOKING_VALIDATION] Booking ${bookingId} status: ${booking.Status}, valid: ${isValid}`);
        return isValid;
      } else {
        console.warn(`⚠️ [BOOKING_VALIDATION] Invalid response for booking ${bookingId}`);
        return false;
      }
    } catch (error: any) {
      console.error(`❌ [BOOKING_VALIDATION] Error validating booking ${bookingId}:`, error);

      // Nếu booking không tồn tại (404) hoặc lỗi khác, coi như invalid
      if (error.response?.status === 404) {
        console.log(`🔍 [BOOKING_VALIDATION] Booking ${bookingId} not found (404)`);
      }
      return false;
    }
  }, []);

  // 🔍 Helper function để detect page reload
  const isPageReload = useCallback((): boolean => {
    try {
      // Method 1: performance.navigation (older browsers)
      if (performance.navigation && performance.navigation.type === 1) {
        return true;
      }

      // Method 2: performance.getEntriesByType (modern browsers)
      const navEntries = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
      if (navEntries.length > 0 && navEntries[0].type === "reload") {
        return true;
      }

      return false;
    } catch (error) {
      console.warn("⚠️ [RELOAD_DETECTION] Could not detect reload, assuming normal navigation");
      return false;
    }
  }, []);

  // 🔄 RESTORE PAYMENT STATE ON RELOAD - Chạy sau khi tất cả data đã load
  useEffect(() => {
    // 🛡️ Skip nếu đã ở payment view (đã được restore trong useState)
    if (currentView === "payment") {
      console.log("✅ [PAYMENT_RESTORE] Already in payment view, skipping useEffect restore");
      return;
    }

    // 🛡️ Chỉ restore khi không còn loading và đã có seats data
    if (loading || seats.length === 0) {
      console.log("⏳ [PAYMENT_RESTORE] Waiting for data to load before restoring...");
      return;
    }
    const restorePaymentState = async () => {
      console.log("🔍 [PAYMENT_RESTORE] Checking for payment state to restore...");

      // 🛡️ Set flag để prevent cross-tab interference
      setIsRestoringPayment(true);

      try {
        // 🔧 Lấy showtimeId trực tiếp từ URL params thay vì state
        const urlShowtimeId = window.location.pathname.split("/").pop();
        console.log(`🔍 [PAYMENT_RESTORE] URL showtimeId: ${urlShowtimeId}, state showtimeId: ${showtimeId}`);

        if (!urlShowtimeId) {
          console.warn("⚠️ [PAYMENT_RESTORE] No showtimeId in URL params");
          return;
        }

        // Detect nếu đây là page reload
        const isReload = isPageReload();
        console.log(`🔍 [PAYMENT_RESTORE] Is page reload: ${isReload}`);

        if (isReload) {
          // Thử load payment state với URL showtimeId
          const savedPaymentState = loadPaymentState(urlShowtimeId);

          if (savedPaymentState) {
            console.log("🔄 [PAYMENT_RESTORE] Found saved payment state, validating...");

            // 🔍 Validate booking còn active không
            const isBookingValid = await validateBookingStatus(savedPaymentState.paymentBookingSession.bookingId);

            if (isBookingValid) {
              console.log("✅ [PAYMENT_RESTORE] Booking is still valid, restoring payment view...");
              console.log("📋 [PAYMENT_RESTORE] Restored session:", savedPaymentState.paymentBookingSession);

              // Restore payment view và session
              setPaymentBookingSession(savedPaymentState.paymentBookingSession);
              setCurrentView("payment");

              console.log("✅ [PAYMENT_RESTORE] Payment view restored successfully");
            } else {
              console.log("❌ [PAYMENT_RESTORE] Booking is no longer valid, clearing state and staying in seats view");
              clearPaymentState();
            }
          } else {
            console.log("ℹ️ [PAYMENT_RESTORE] No valid payment state found, staying in seats view");
          }
        } else {
          console.log("ℹ️ [PAYMENT_RESTORE] Normal navigation, not restoring payment state");
        }
      } finally {
        // 🛡️ Clear flag sau khi restore xong
        setIsRestoringPayment(false);
      }
    };

    restorePaymentState().catch((error) => {
      console.error("❌ [PAYMENT_RESTORE] Error during payment state restoration:", error);
      // Fallback: clear payment state và stay in seats view
      clearPaymentState();
      setIsRestoringPayment(false); // Clear flag on error
    });
  }, [currentView, loading, seats.length]); // Chạy khi data đã load xong

  // 🔍 Debug: Log khi currentView thay đổi
  useEffect(() => {
    console.log(`🔄 [BOOKING_PAGE] Current view changed to: ${currentView}`);
    if (currentView === "seats") {
      console.log(`🎬 [BOOKING_PAGE] SeatSelection component will be mounted/remounted`);
    } else if (currentView === "payment") {
      console.log(`💳 [BOOKING_PAGE] PaymentComponent will be mounted`);
    }
  }, [currentView]);

  // 🔄 Handlers cho PaymentComponent
  const handleBackToSeats = useCallback(async () => {
    console.log("🔄 User bấm quay lại từ payment - cần cancel booking");

    // 🚨 IMPORTANT: Set flag để biết đây là từ payment quay lại
    setIsFromPaymentBack(true);

    // 🚨 QUAN TRỌNG: Set prevent restore flag TRƯỚC để ngăn session restore
    console.log("🚨 [BACK_TO_SEATS] Setting prevent restore flag...");
    setIsCancellingBooking(true);

    // 🚨 QUAN TRỌNG: Clear session storage NGAY để tránh restore ghế cũ
    console.log("🗑️ [BACK_TO_SEATS] Clearing session storage to prevent seat restore...");

    const sessionKeys = [`booking_session_${showtimeId}`, `galaxy_cinema_session_${showtimeId}`, "bookingData"];

    sessionKeys.forEach((key) => {
      const before = sessionStorage.getItem(key);
      sessionStorage.removeItem(key);
      console.log(`🗑️ [BACK_TO_SEATS] ${key}: ${before ? "CLEARED" : "NOT_FOUND"}`);
    });

    // Clear localStorage
    const localStorageKeys = [`galaxy_cinema_session_${showtimeId}`, "bookingData", "selectedSeats"];

    localStorageKeys.forEach((key) => {
      const before = localStorage.getItem(key);
      localStorage.removeItem(key);
      console.log(`🗑️ [BACK_TO_SEATS] localStorage ${key}: ${before ? "CLEARED" : "NOT_FOUND"}`);
    });

    // Clear sessionStorageService
    try {
      sessionStorageService.clearSelectedSeats(showtimeId);
      console.log(`✅ [BACK_TO_SEATS] Cleared sessionStorageService for showtime: ${showtimeId}`);
    } catch (error) {
      console.warn("⚠️ [BACK_TO_SEATS] Failed to clear sessionStorageService:", error);
    }

    // 🚀 IMMEDIATE: Chuyển về trang chọn ghế ngay lập tức để cải thiện UX
    console.log("🔄 Chuyển về trang chọn ghế ngay lập tức");
    setCurrentView("seats");

    // 🗑️ Clear payment state khi user quay lại
    clearPaymentState();

    // 🔧 Broadcast to other tabs that payment state should be cleared
    try {
      const cleanupEvent = {
        action: "CLEAR_PAYMENT_STATE",
        showtimeId: showtimeId,
        timestamp: Date.now(),
      };
      localStorage.setItem("galaxy_cinema_cleanup_event", JSON.stringify(cleanupEvent));
      // Remove immediately để trigger storage event
      setTimeout(() => localStorage.removeItem("galaxy_cinema_cleanup_event"), 100);
    } catch (error) {
      console.warn("⚠️ [PAYMENT_STATE] Failed to broadcast payment state clear:", error);
    }

    // 🔧 BACKGROUND: Thực hiện cancel booking và cleanup trong background
    const performBackgroundCleanup = async () => {
      // Nếu có booking đã được tạo, cần hủy booking
      if (paymentBookingSession?.bookingId) {
        console.log(`🗑️ [BACKGROUND] Hủy booking đã tạo: ${paymentBookingSession.bookingId}`);

        try {
          // Hiển thị loading
          toast.loading("Đang hủy đơn đặt vé...");

          // Gọi API cancel booking
          const response = await api.put(`/bookings/${paymentBookingSession.bookingId}/cancel`, {
            reason: "user_back_from_payment",
          });

          console.log("✅ [BACKGROUND] API cancel booking response:", response);

          if (response.status === 200 || response.data?.success) {
            console.log("✅ [BACKGROUND] Đã hủy booking thành công");
            toast.dismiss();
            toast.success("Đã hủy đơn đặt vé thành công");

            // 🔧 FIX: Force reconnect WebSocket sau khi cancel booking thành công
            console.log("🔄 [BACKGROUND] Force reconnecting WebSocket after cancel booking...");
            setTimeout(async () => {
              if (paymentBookingSession?.showtimeId) {
                // 🔥 FORCE RECONNECT WebSocket
                console.log("🚀 [BACKGROUND] Force reconnecting WebSocket...");
                await webSocketService.forceReconnect(paymentBookingSession.showtimeId.toString());

                // 🔄 Request fresh seats state
                setTimeout(() => {
                  webSocketService.requestCurrentSeatsState(paymentBookingSession.showtimeId.toString());
                  console.log("✅ [BACKGROUND] Requested fresh seats from server");
                }, 500);
              }
            }, 1000);
          } else {
            throw new Error("API response không thành công");
          }
        } catch (error) {
          console.error("❌ [BACKGROUND] Lỗi khi hủy booking:", error);
          toast.dismiss();
          toast.warning("Không thể hủy đơn đặt vé, vui lòng liên hệ hỗ trợ");
        }
      }

      // Release các ghế đã chọn qua WebSocket
      if (paymentBookingSession?.selectedSeats && paymentBookingSession.selectedSeats.length > 0) {
        console.log(`🧹 [BACKGROUND] Release ${paymentBookingSession.selectedSeats.length} ghế đã chọn`);

        try {
          // Force cleanup tất cả ghế qua WebSocket
          await webSocketService.forceCleanupUserSeats(paymentBookingSession.showtimeId?.toString());
          console.log("✅ [BACKGROUND] Đã release ghế thành công");
        } catch (error) {
          console.warn("⚠️ [BACKGROUND] Lỗi khi release ghế:", error);
        }
      }

      // 🔧 FIX: Force refresh seats sau khi cleanup hoàn tất
      console.log("🔄 [BACKGROUND] Final refresh seats...");
      setTimeout(() => {
        if (paymentBookingSession?.showtimeId) {
          webSocketService.requestCurrentSeatsState(paymentBookingSession.showtimeId.toString());
          console.log("✅ [BACKGROUND] Final seats refresh completed");

          // 🔄 Reset prevent restore flag sau khi hoàn tất
          setTimeout(() => {
            setIsCancellingBooking(false);
            console.log("✅ [BACKGROUND] Reset prevent restore flag");
          }, 1000);
        }
      }, 500);
    };

    // Thực hiện cleanup trong background
    performBackgroundCleanup().catch((error) => {
      console.error("❌ [BACKGROUND] Cleanup failed:", error);
      // Reset prevent restore flag ngay cả khi có lỗi
      setTimeout(() => {
        setIsCancellingBooking(false);
        console.log("✅ [BACKGROUND] Reset prevent restore flag after error");
      }, 2000);
    });

    // Clear payment session sau khi đã xử lý xong
    setPaymentBookingSession(null);
  }, [paymentBookingSession]);

  // 🔧 FIX: Chỉ cleanup khi thực sự từ payment quay lại, không phải khi reload
  useEffect(() => {
    if (isFromPaymentBack && paymentBookingSession) {
      console.log("🧹 [FROM_PAYMENT_BACK] Performing cleanup after back from payment");

      // Reset flag ngay lập tức
      setIsFromPaymentBack(false);

      // Thực hiện cleanup logic ở đây nếu cần
      // (hiện tại logic đã được xử lý trong handleBackToSeats)
    }
  }, [isFromPaymentBack, paymentBookingSession]);

  // 🔧 FIX: Cleanup WebSocket và payment state khi user rời khỏi BookingPage hoàn toàn
  useEffect(() => {
    return () => {
      console.log("🔄 [BOOKING_PAGE_CLEANUP] User leaving BookingPage - cleaning up WebSocket and payment state");

      // Cleanup WebSocket
      webSocketService.cleanup();

      // Clear payment state khi rời khỏi trang (navigate away, not reload)
      if (!isPageReload()) {
        clearPaymentState();
        console.log("🗑️ [BOOKING_PAGE_CLEANUP] Cleared payment state on navigation away");
      }
    };
  }, []);

  const handlePaymentSuccess = useCallback(
    (bookingId: string, paymentResult: any) => {
      console.log("✅ Payment successful:", { bookingId, paymentResult });

      // 🧹 Cleanup session storage sau khi payment thành công
      if (paymentBookingSession?.selectedSeats) {
        console.log(`🧹 [PAYMENT_SUCCESS] Cleaning up session storage after successful payment`);

        const bookedSeatIds = paymentBookingSession.selectedSeats.map((seat: any) => seat.id);
        bookedSeatIds.forEach((seatId) => {
          const sessionKey = `seat_${paymentBookingSession.showtimeId}_${seatId}`;
          sessionStorage.removeItem(sessionKey);
          console.log(`🗑️ Removed ${sessionKey} from session storage`);
        });

        // Xóa booking session
        const bookingSessionKey = `booking_session_${paymentBookingSession.showtimeId}`;
        sessionStorage.removeItem(bookingSessionKey);
        console.log(`🗑️ Removed ${bookingSessionKey} from session storage`);
      }

      // Navigate to success page
      navigate(`/booking-success/${bookingId}`, {
        state: {
          bookingSession: paymentBookingSession,
          paymentResult,
          paymentMethod: paymentResult.method || "Unknown",
        },
      });
    },
    [navigate, paymentBookingSession]
  );

  // Kiểm tra trạng thái đăng nhập bằng API
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await api.get("/auth/profile");
        if (response.data && response.data.success) {
          setIsAuthenticated(true);
          setUser(response.data.user || response.data.data);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error("Lỗi khi kiểm tra trạng thái đăng nhập:", error);
        setIsAuthenticated(false);
        setUser(null);
      }
    };

    checkAuthStatus();
  }, []);

  // Lấy dữ liệu từ state của location
  const bookingData = location.state || {};
  const { movie, theater, showtime } = bookingData;

  // 🎬 Debug logging để trace movieId
  useEffect(() => {
    console.log("📋 BookingPage Debug Info:");
    console.log("- URL showtimeId:", showtimeId);
    console.log("- location.state:", location.state);
    console.log("- showtime data:", showtime);
    console.log("- movie data:", movie);
    console.log("- theater data:", theater);

    if (showtime) {
      console.log("🎬 Showtime movieId:", showtime.movieId);
    }
  }, []);

  // 🔥 FORCE WEBSOCKET CONNECTION - Đảm bảo WebSocket luôn kết nối
  useEffect(() => {
    if (showtimeId) {
      console.log(`🚀 BookingPage: Force ensuring WebSocket connection for showtime ${showtimeId}`);

      // Import webSocketService và force reconnect
      import("../services/webSocketService").then(({ webSocketService }) => {
        // Force reconnect nếu chưa connected hoặc connected với showtime khác
        if (!webSocketService.isConnected || webSocketService.getCurrentShowtimeId !== showtimeId) {
          console.log(`🔥 BookingPage: Force reconnecting WebSocket...`);
          webSocketService.forceReconnect(showtimeId);
        }

        // Start auto-reconnect để đảm bảo luôn connected
        webSocketService.startAutoReconnect(showtimeId);
      });
    }
  }, [showtimeId]);

  // 🔄 SIMPLE FIX: Auto-clear seats when returning from PaymentPage
  // 🚨 DISABLED: This was causing cross-tab sync issues when reloading tabs
  // useEffect(() => {
  //     const isFromPayment = location.state?.fromPayment ||
  //                          document.referrer.includes('/payment/') ||
  //                          sessionStorage.getItem('returning_from_payment');

  //     if (isFromPayment) {
  //         console.log('🔄 [SIMPLE_FIX] Detected return from PaymentPage - auto clearing seats');

  //         // Clear session storage flag
  //         sessionStorage.removeItem('returning_from_payment');

  //         // Force clear all seats and refresh
  //         setTimeout(async () => {
  //             try {
  //                 await webSocketService.clearAllSelectedSeats(showtimeId, user?.User_ID);
  //                 await fetchSeats(); // Refresh seats from server
  //                 console.log('✅ [SIMPLE_FIX] Seats cleared and refreshed');

  //                 // 🔧 BROADCAST to other tabs that user returned from payment
  //                 console.log('📡 [SIMPLE_FIX] Broadcasting return from payment to other tabs...');
  //                 const cleanupData = {
  //                     action: 'RETURN_FROM_PAYMENT',
  //                     showtimeId: showtimeId,
  //                     userId: user?.User_ID || 'unknown',
  //                     timestamp: Date.now()
  //                 };

  //                 // Use localStorage for cross-tab communication
  //                 localStorage.setItem('galaxy_cinema_cleanup_event', JSON.stringify(cleanupData));
  //                 setTimeout(() => localStorage.removeItem('galaxy_cinema_cleanup_event'), 100);
  //                 console.log('✅ [SIMPLE_FIX] Broadcasted return from payment event');
  //             } catch (error) {
  //                 console.error('❌ [SIMPLE_FIX] Error clearing seats:', error);
  //             }
  //         }, 100);
  //     }
  // }, [location.state, showtimeId, user?.User_ID]);

  useEffect(() => {
    if (location.state?.error) {
      const { message, movieTitle, expiryTime, bookingId } = location.state.error;
      setBookingError({
        message,
        movieTitle: movieTitle || "Không xác định",
        expiryTime: expiryTime || 0,
        bookingId: bookingId || "",
      });
    }

    if (location.state?.fromTimeout) {
      const message = location.state.message || "Phiên thanh toán đã hết hạn. Vui lòng chọn ghế và đặt vé lại.";

      setTimeout(() => {
        toast.error(message, {
          duration: 5000,
          position: "top-center",
          style: {
            background: "#DC2626",
            color: "#fff",
            fontSize: "16px",
            padding: "16px",
            borderRadius: "8px",
            maxWidth: "500px",
          },
        });
      }, 500);

      if (window.history.state) {
        const newState = { ...location.state };
        delete newState.fromTimeout;
        delete newState.message;

        window.history.replaceState(newState, "", location.pathname);
      }
    }
  }, [location.state]);

  // Initialize booking state - 🎬 FIX movieId detection với API call
  const [bookingSession, setBookingSession] = useState<BookingSession>(() => {
    // Initialize với movieId tạm thời, sẽ được update từ API
    return {
      id: `booking-${Date.now()}`,
      movieId: "1", // Temporary, will be updated from API
      cinemaId: theater?.id || "1",
      showtimeId: showtime?.id || showtimeId || "1",
      selectedSeats: [],
      totalPrice: 0,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      step: 1,
    };
  });

  // 🎬 NEW: Fetch showtime details để lấy đúng movieId
  const fetchShowtimeDetails = async () => {
    try {
      const id = showtime?.id || showtimeId;
      if (!id) return;

      console.log(`🎬 Fetching showtime details for ID: ${id}`);
      const response = await api.get(`/showtimes/${id}`);

      if (response.data && response.data.success) {
        const showtimeData = response.data.data || response.data;
        const correctMovieId = showtimeData.Movie_ID || showtimeData.movieId;

        console.log(`✅ Showtime details fetched - Movie_ID: ${correctMovieId}`);

        // Update booking session với movieId đúng
        setBookingSession((prev) => ({
          ...prev,
          movieId: String(correctMovieId),
        }));

        console.log(`🎯 Updated movieId to: ${correctMovieId}`);
      }
    } catch (error) {
      console.error("❌ Error fetching showtime details:", error);
      // Fallback to existing logic nếu API fail
      let fallbackMovieId = "1";

      if (showtime?.movieId) {
        fallbackMovieId = String(showtime.movieId);
      } else if (location.state?.movieId) {
        fallbackMovieId = String(location.state.movieId);
      } else if (movie?.id) {
        fallbackMovieId = String(movie.id);
      }

      setBookingSession((prev) => ({
        ...prev,
        movieId: fallbackMovieId,
      }));

      console.log(`🎯 Fallback movieId: ${fallbackMovieId}`);
    }
  };

  // Fetch showtime details khi component mount
  useEffect(() => {
    fetchShowtimeDetails();
  }, [showtimeId, showtime]);

  const [bookingError, setBookingError] = useState<{
    message: string;
    bookingId?: string;
    movieTitle?: string;
    expiryTime?: number;
  } | null>(null);
  const [showQrCode, setShowQrCode] = useState(false);
  const [paymentQrUrl, setPaymentQrUrl] = useState<string | null>(null);
  const [qrCheckInterval, setQrCheckInterval] = useState<number | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>("pending");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Thêm state selectedBookingId
  const [selectedBookingId, setSelectedBookingId] = useState<string>("");

  const extractBookingId = (error: any): string => {
    if (error.bookingId) return error.bookingId;
    if (error.response?.data?.bookingId) return error.response.data.bookingId;
    if (error.response?.data?.pendingBookingDetails?.Booking_ID) {
      return String(error.response.data.pendingBookingDetails.Booking_ID);
    }

    const errorMsg = error.message || error.response?.data?.message || "";
    if (errorMsg) {
      const idMatches = [
        errorMsg.match(/ID[:\s]+(\d+)/i),
        errorMsg.match(/booking[-_]?id[:\s]+(\d+)/i),
        errorMsg.match(/đơn đặt[^0-9]+(\d+)/i),
        errorMsg.match(/(\d{3,})$/),
      ];

      for (const match of idMatches) {
        if (match && match[1]) return match[1];
      }
    }
    return "";
  };

  const fetchSeats = async () => {
    setLoading(true);
    try {
      const id = showtime?.id || showtimeId || "1";
      const response = await api.get(`/seats/showtime/${id}`);

      if (response.data && response.data.success) {
        const apiSeats = response.data.data;

        if (apiSeats.SeatLayouts && Array.isArray(apiSeats.SeatLayouts)) {
          const processedSeats = apiSeats.SeatLayouts.map((seat: any) => {
            const isBooked =
              apiSeats.BookedSeats?.some(
                (bookedSeat: any) =>
                  bookedSeat.row_label === seat.Row_Label && bookedSeat.column_number === seat.Column_Number
              ) || false;

            const isPending =
              apiSeats.PendingSeats?.some(
                (pendingSeat: any) =>
                  pendingSeat.row_label === seat.Row_Label && pendingSeat.column_number === seat.Column_Number
              ) || false;

            const seatId = `${seat.Row_Label}${seat.Column_Number}`;
            const seatName = `${seat.Row_Label}${seat.Column_Number}`;

            // 🎭 Map seat types từ backend (Regular/VIP) sang frontend (standard/vip)
            const mapSeatType = (backendType: string): "standard" | "vip" => {
              const type = (backendType || "").toLowerCase();
              switch (type) {
                case "vip":
                  return "vip";
                case "regular":
                default:
                  return "standard";
              }
            };

            const mappedType = mapSeatType(seat.Seat_Type);

            const finalStatus = isBooked || isPending ? "occupied" : "available";

            // 🎯 Sử dụng giá từ API
            const finalPrice = seat.Price;

            // 🔍 Debug log cho ghế A6 và A7 để kiểm tra giá
            if (seatId === "A6" || seatId === "A7") {
              console.log(`🔍 fetchSeats - Seat ${seatId} Price:`, {
                seatId,
                rawSeatData: seat, // 🔍 Log toàn bộ data của ghế
                apiPrice: seat.Price,
                finalPrice,
                seatType: seat.Seat_Type,
                mappedType,
              });
            }

            return {
              id: seatId,
              name: seatName,
              row: seat.Row_Label,
              number: seat.Column_Number,
              type: mappedType,
              status: finalStatus,
              price: finalPrice,
              layoutId: seat.Layout_ID,
            };
          });

          console.log(`🪑 fetchSeats - Setting ${processedSeats.length} seats`);
          const seatA10 = processedSeats.find((s) => s.id === "A10");
          if (seatA10) {
            console.log(`🔍 fetchSeats - Seat A10 final:`, seatA10);
          }

          // 🔧 FIX: KHÔNG clear all seats khi có occupied seats
          // Lý do: Có thể xóa ghế của user khác khi reload
          const occupiedSeats = processedSeats.filter((s) => s.status === "occupied").map((s) => s.id);
          if (occupiedSeats.length > 0) {
            console.log(
              `ℹ️ Found ${occupiedSeats.length} occupied seats, but NOT clearing all seats to preserve other users' selections`
            );
          }

          setSeats(processedSeats);
        } else {
          setSeats([]);
        }

        // 🎬 FETCH MOVIE DETAILS từ API /movies/{id}
        const movieId = apiSeats.Showtime?.Movie_ID || apiSeats.Movie_ID;
        if (movieId) {
          try {
            console.log(`🎬 Fetching movie details for Movie_ID: ${movieId}`);
            const movieResponse = await api.get(`/movies/${movieId}`);

            let movieData = null;
            if (movieResponse.data && movieResponse.data.success && movieResponse.data.data) {
              movieData = movieResponse.data.data;
            } else if (movieResponse.data && (movieResponse.data.Movie_ID || movieResponse.data.Movie_Name)) {
              movieData = movieResponse.data;
            }

            if (movieData) {
              console.log(`✅ Movie details fetched:`, movieData);
              setBookingSession((prev) => ({
                ...prev,
                movieId: String(movieData.Movie_ID || movieId),
                movieDetails: {
                  title: movieData.Movie_Name || "Unknown Movie",
                  poster: movieData.Poster_URL || "",
                  duration: movieData.Duration || 90,
                  rating: movieData.Rating,
                  genre: movieData.Genre,
                },
                movieTitle: movieData.Movie_Name,
              }));
            } else {
              throw new Error("No movie data in response");
            }
          } catch (movieError) {
            console.error("❌ Error fetching movie details:", movieError);
            // Fallback to existing movie data if API fails
            if (apiSeats.Movie) {
              setBookingSession((prev) => ({
                ...prev,
                movieDetails: {
                  title: apiSeats.Movie.Movie_Name || "Unknown Movie",
                  poster: apiSeats.Movie.Poster_URL || "",
                  duration: apiSeats.Movie.Duration || 90,
                },
                movieTitle: apiSeats.Movie.Movie_Name,
              }));
            }
          }
        } else if (apiSeats.Movie) {
          // Fallback nếu không có movieId
          setBookingSession((prev) => ({
            ...prev,
            movieDetails: {
              title: apiSeats.Movie.Movie_Name || "Unknown Movie",
              poster: apiSeats.Movie.Poster_URL || "",
              duration: apiSeats.Movie.Duration || 90,
            },
            movieTitle: apiSeats.Movie.Movie_Name,
          }));
        }

        createRoomFromSeats(apiSeats);
      } else {
        setSeats([]);
        createDefaultRoom();
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        const errorMsg = error.response.data.message;
        if (errorMsg.includes("đơn đặt vé chưa thanh toán") || errorMsg.includes("Bạn đang có một")) {
          const movieMatch = errorMsg.match(/phim "([^"]+)"/);
          const timeMatch = errorMsg.match(/còn (\d+) phút/);
          const bookingId = extractBookingId(error);

          console.log(`⚠️ Pending booking detected, showing modal but keeping WebSocket connected`);

          setBookingError({
            message: errorMsg,
            movieTitle: movieMatch ? movieMatch[1] : "Không xác định",
            expiryTime: timeMatch ? parseInt(timeMatch[1]) : 0,
            bookingId: bookingId,
          });
          return;
        }
      }

      toast.error("Không thể lấy thông tin ghế.");
      setSeats([]);
      createDefaultRoom();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeats();
  }, [showtimeId, showtime]);

  useEffect(() => {
    return () => {
      if (qrCheckInterval) {
        clearInterval(qrCheckInterval);
      }
    };
  }, [qrCheckInterval]);

  const startPaymentStatusCheck = (bookingId: string, orderCode?: string) => {
    // Xóa interval cũ nếu có
    if (qrCheckInterval) {
      clearInterval(qrCheckInterval);
    }

    // Đặt interval mới để kiểm tra trạng thái thanh toán mỗi 5 giây
    const intervalId = window.setInterval(async () => {
      try {
        // Sử dụng orderCode nếu có, nếu không fallback sang bookingId
        const checkEndpoint = orderCode
          ? `/payos/check-status/${orderCode}`
          : `/payos/check-payment-status?bookingId=${bookingId}`;

        const response = await api.get(checkEndpoint);

        // Xác định trạng thái thanh toán từ API response - CHỈ CHECK PAYMENT STATUS
        const isPaid =
          response.data?.data?.status === "PAID" ||
          response.data?.status === "PAID" ||
          response.data?.data?.payosInfo?.status === "PAID" ||
          response.data?.payosInfo?.status === "PAID" ||
          response.data?.payment?.status === "PAID" ||
          response.data?.data?.payment?.status === "PAID";

        if (isPaid) {
          // Dừng interval
          clearInterval(intervalId);
          setQrCheckInterval(null);

          // Đóng QR modal
          setShowQrCode(false);
          setPaymentQrUrl(null);

          // Hiển thị thông báo thành công
          toast.success("Thanh toán thành công! Đang chuyển hướng...");

          // Redirect đến trang booking success
          setTimeout(() => {
            navigate(`/booking-success/${bookingId}`, {
              state: {
                fromPayment: true,
                paymentMethod: "PayOS",
              },
            });
          }, 1500);
        }
      } catch (error) {
        // Silent error handling - tiếp tục check
      }
    }, 5000); // Check mỗi 5 giây

    setQrCheckInterval(intervalId);
  };

  const cancelQrPayment = () => {
    if (qrCheckInterval) {
      clearInterval(qrCheckInterval);
      setQrCheckInterval(null);
    }
    setShowQrCode(false);
    setPaymentQrUrl(null);
    toast("Đã hủy thanh toán qua QR Code");
  };

  const createRoomFromSeats = (apiSeats: any) => {
    const uniqueRows = new Set();
    const seatsByRow: Record<string, any[]> = {};

    if (apiSeats.SeatLayouts && Array.isArray(apiSeats.SeatLayouts)) {
      apiSeats.SeatLayouts.forEach((seat: any) => {
        const row = seat.Row_Label;
        uniqueRows.add(row);

        if (!seatsByRow[row]) {
          seatsByRow[row] = [];
        }
        seatsByRow[row].push(seat);
      });
    }

    const rows = Array.from(uniqueRows).sort();
    const seatsPerRowArr = rows.map((row) => seatsByRow[row as string].length);

    const cinemaRoom: CinemaRoom = {
      id: apiSeats.Room?.Room_ID?.toString() || "room-1",
      name: apiSeats.Room?.Room_Name || "Default Room",
      type: apiSeats.Room?.Room_Type?.toLowerCase() || "standard",
      totalSeats: apiSeats.Total_Seats || seats.length || 50,
      rows: rows.length,
      seatsPerRow: seatsPerRowArr,
      layout: [],
      screenPosition: "front",
    };

    setRoom(cinemaRoom);
  };

  const createDefaultRoom = () => {
    try {
      const cinemaRoom = cinemaRooms && cinemaRooms.length > 0 ? cinemaRooms[0] : createStandardRoom();
      setRoom(cinemaRoom);
    } catch (error) {
      setRoom(createStandardRoom());
    }
  };

  // Booking steps
  const bookingSteps: BookingStep[] = [
    { id: 1, name: "seats", title: "Chọn ghế", completed: false, active: bookingSession.step === 1 },
    {
      id: 2,
      name: "payment",
      title: "Thanh toán",
      completed: bookingSession.step > 2,
      active: bookingSession.step === 2,
    },
    {
      id: 3,
      name: "confirmation",
      title: "Xác nhận",
      completed: bookingSession.step > 3,
      active: bookingSession.step === 3,
    },
  ];

  // Handle seat selection
  const handleSelectSeats = useCallback((seats: Seat[]) => {
    // Only log when seat count changes
    if (seats.length !== bookingSession.selectedSeats.length) {
      console.log(`🪑 Selected ${seats.length} seats: ${seats.map((s) => s.id).join(", ")}`);
    }

    setBookingSession((prev) => {
      const totalPrice = seats.reduce((sum, seat) => sum + seat.price, 0);
      if (prev.selectedSeats.length === seats.length && prev.totalPrice === totalPrice) {
        return prev;
      }

      const updatedSession = { ...prev, selectedSeats: seats, totalPrice };
      console.log("📋 Updated booking session:", updatedSession);
      return updatedSession;
    });
  }, []);

  const handleProceedToPayment = useCallback(async () => {
    if (loading || isProcessingPayment) return;

    if (bookingSession.selectedSeats.length === 0) {
      toast.error("Vui lòng chọn ít nhất một ghế.");
      return;
    }

    setBookingError(null);
    setIsProcessingPayment(true);
    setLoading(true);

    try {
      toast.loading("Đang xử lý đơn đặt vé...", { duration: 8000 });

      const layoutSeatIds = bookingSession.selectedSeats.map((seat: any) => seat.layoutId);
      const bookingData = {
        Showtime_ID: Number(bookingSession.showtimeId),
        layoutSeatIds,
        userId: user?.id ? String(user.id) : null,
      };

      const response = await bookingService.createBooking(bookingData);
      toast.dismiss();

      const bookingId =
        (response as any)?.id ||
        (response as any)?.booking?.Booking_ID ||
        (response as any)?.data?.id ||
        (response as any)?.data?.booking?.Booking_ID ||
        (response as any)?.Booking_ID ||
        "";

      if (!bookingId) {
        throw new Error("Không nhận được mã đơn hàng từ hệ thống.");
      }

      toast.success(`Đặt vé thành công #${bookingId}!`);

      // 🔴 Cập nhật trạng thái ghế thành "booked" sau khi booking thành công
      const bookedSeatIds = bookingSession.selectedSeats.map((seat: any) => seat.id);
      console.log(`🔴 Marking seats as booked: ${bookedSeatIds.join(", ")}`);
      console.log(`🔌 WebSocket connected: ${webSocketService.isConnected}`);
      console.log(
        `📊 Current seats before update:`,
        seats.filter((s) => bookedSeatIds.includes(s.id))
      );

      // Cập nhật local state
      setSeats((prev) => {
        const updated = prev.map((seat) =>
          bookedSeatIds.includes(seat.id) ? { ...seat, status: "occupied" as const } : seat
        );
        console.log(
          `📊 Updated seats:`,
          updated.filter((s) => bookedSeatIds.includes(s.id))
        );
        return updated;
      });

      // Force re-render bằng cách log seats state sau update
      setTimeout(() => {
        console.log(
          `🔍 Seats state after booking:`,
          seats.filter((s) => bookedSeatIds.includes(s.id))
        );
      }, 100);

      // ✅ Booking thành công - KHÔNG xóa ghế khỏi session storage ngay
      // Vì chúng ta vẫn cần thông tin này cho payment step
      console.log(`✅ Booking completed - preserving session data for payment step`);

      const updatedSession = {
        ...bookingSession,
        step: 2,
        bookingId: String(bookingId),
        movieId: bookingSession.movieId || String(bookingSession.movieId),
      };

      console.log(`🎬 Navigating to payment with movieId: ${updatedSession.movieId}`);
      console.log("📋 Full booking session before navigate:", updatedSession);

      // 💾 Lưu booking session vào sessionStorage để persist giữa các trang
      const sessionKey = `booking_session_${bookingId}`;
      const sessionData = {
        bookingSession: updatedSession,
        movieId: bookingSession.movieId,
        movie: bookingSession.movieDetails
          ? {
              id: bookingSession.movieId,
              title: bookingSession.movieDetails.title,
              poster: bookingSession.movieDetails.poster,
            }
          : movie,
        theater,
        showtime,
        timestamp: Date.now(),
      };

      sessionStorage.setItem(sessionKey, JSON.stringify(sessionData));
      console.log(`💾 Saved booking session to sessionStorage: ${sessionKey}`);
      console.log("📋 Saved session data:", sessionData);

      // 🔄 Chuyển sang payment view thay vì navigate
      setPaymentBookingSession(updatedSession);
      setCurrentView("payment");

      // 💾 Save payment state để có thể restore khi reload
      savePaymentState(updatedSession);

      console.log("🔄 Switched to payment view");
    } catch (error: any) {
      toast.dismiss();

      // Check for pending booking error - cải thiện logic detection
      const errorMessage = error.message || "";
      const isPendingBookingError =
        errorMessage.includes("đơn đặt vé chưa thanh toán") ||
        errorMessage.includes("Bạn đang có một đơn đặt vé") ||
        errorMessage.includes("đơn đặt vé hiện tại") ||
        error.bookingId !== undefined || // Check if error has bookingId field
        error.movieTitle !== undefined; // Check if error has movieTitle field

      if (isPendingBookingError) {
        setBookingError({
          message: error.message || "Bạn đang có đơn đặt vé chưa thanh toán",
          movieTitle: error.movieTitle || "Không xác định",
          expiryTime: error.expiryTime || 15, // Default 15 minutes
          bookingId: error.bookingId || extractBookingId(error),
        });
      } else {
        const fallbackMessage = error.message || "Không thể tạo đơn đặt vé. Vui lòng thử lại.";
        toast.error(fallbackMessage);
      }
    } finally {
      setLoading(false);
      setIsProcessingPayment(false);
    }
  }, [loading, isProcessingPayment, bookingSession, user, navigate, movie, theater, showtime]);

  // Cập nhật phương thức handleBack để gọi API hủy booking
  const handleBack = async () => {
    console.log("🔙 handleBack clicked - starting cleanup...");
    console.log("📊 Current selected seats:", bookingSession.selectedSeats);

    try {
      // 🚨 QUAN TRỌNG: Set clearing flag để tạm dừng auto-save session
      console.log("🚨 [HANDLE_BACK] Setting clearing flag to prevent auto-save...");
      setIsCancellingBooking(true);

      // 🚨 QUAN TRỌNG: Clear WebSocket state TRƯỚC để tránh restore
      console.log("🧹 [HANDLE_BACK] Clearing WebSocket selected seats...");

      // 1. Deselect tất cả ghế từ server state
      if (webSocketService.isConnected()) {
        // Lấy tất cả ghế đang selected từ selectedSeats state
        console.log(`🔄 [HANDLE_BACK] WebSocket selected seats: ${selectedSeats.length}`, selectedSeats);

        // Deselect từ server state
        if (selectedSeats.length > 0) {
          selectedSeats.forEach((seat) => {
            console.log(`🔄 [HANDLE_BACK] Deselecting seat from server: ${seat.id}`);
            webSocketService.deselectSeat(showtimeId, seat.id, userId);
          });
        }

        // Deselect ghế từ local state (backup)
        if (selectedSeats.length > 0) {
          console.log(`🔄 [HANDLE_BACK] Deselecting ${selectedSeats.length} local seats...`);
          selectedSeats.forEach((seat) => {
            webSocketService.deselectSeat(showtimeId, seat.id, userId);
          });
        }

        // Rời khỏi showtime room
        webSocketService.leaveShowtime(showtimeId);
        console.log(`🚪 [HANDLE_BACK] Left showtime room: ${showtimeId}`);
      }

      // 2. Clear WebSocket service state
      webSocketService.clearAllSelectedSeats(undefined, showtimeId);

      // 3. Wait for WebSocket deselect to complete
      console.log("⏳ [HANDLE_BACK] Waiting for WebSocket deselect to complete...");
      await new Promise((resolve) => setTimeout(resolve, 500)); // 500ms delay

      // Clear ALL session storage để tránh restore
      console.log("🗑️ [HANDLE_BACK] Clearing all session storage...");

      // 1. Clear sessionStorage - MULTIPLE KEYS
      const sessionKeys = [`booking_session_${showtimeId}`, `galaxy_cinema_session_${showtimeId}`, "bookingData"];

      sessionKeys.forEach((key) => {
        const before = sessionStorage.getItem(key);
        sessionStorage.removeItem(key);
        const after = sessionStorage.getItem(key);
        console.log(
          `🗑️ [HANDLE_BACK] ${key}: ${before ? "EXISTED" : "NOT_FOUND"} → ${after ? "STILL_EXISTS" : "CLEARED"}`
        );
      });

      // 2. Clear localStorage - MULTIPLE KEYS
      const localStorageKeys = [`galaxy_cinema_session_${showtimeId}`, "bookingData", "selectedSeats"];

      localStorageKeys.forEach((key) => {
        const before = localStorage.getItem(key);
        localStorage.removeItem(key);
        const after = localStorage.getItem(key);
        console.log(
          `🗑️ [HANDLE_BACK] localStorage ${key}: ${before ? "EXISTED" : "NOT_FOUND"} → ${
            after ? "STILL_EXISTS" : "CLEARED"
          }`
        );
      });

      // 🧹 ENABLE: Clear sessionStorageService khi cancel booking để tránh restore
      try {
        sessionStorageService.clearSelectedSeats(showtimeId);
        console.log(`✅ [HANDLE_BACK] Cleared sessionStorageService for showtime: ${showtimeId}`);
      } catch (error) {
        console.warn("⚠️ [HANDLE_BACK] Failed to clear sessionStorageService:", error);
      }

      // 3. Clear bookingData
      localStorage.removeItem("bookingData");
      console.log("✅ Cleared bookingData");

      // Xử lý hủy booking nếu có (không cần confirmation)
      console.log("🧹 Calling handleCancelBackendBooking...");
      await handleCancelBackendBooking();
      console.log("✅ Backend booking cleanup completed");

      // Sau khi xử lý xong hoặc nếu không cần xử lý, quay về trang trước
      console.log("🚀 Navigating back...");
      navigate(-1);
    } catch (error) {
      console.error("❌ Error in handleBack:", error);
      navigate(-1); // Vẫn quay lại dù có lỗi
    } finally {
      // Reset clearing flag
      console.log("🔄 [HANDLE_BACK] Resetting clearing flag...");
      setIsCancellingBooking(false);
    }
  };

  const handleCancelBackendBooking = async () => {
    try {
      try {
        // Gọi API kiểm tra booking pending thay vì localStorage
        const checkPendingResponse = await api.get("/bookings/check-pending");

        if (checkPendingResponse.data?.pendingBooking) {
          const pendingBooking = checkPendingResponse.data.pendingBooking;
          const pendingBookingId = pendingBooking.Booking_ID || pendingBooking.id;

          if (pendingBookingId) {
            const response = await bookingService.cancelBooking(pendingBookingId);
            if (response && response.success) {
              toast.success("Đã hủy đơn đặt vé thành công");

              // 🔥 FORCE RECONNECT WebSocket sau khi cancel booking
              console.log("🚀 [HANDLE_BACK] Force reconnecting WebSocket after cancel booking...");
              setTimeout(async () => {
                if (showtimeId) {
                  await webSocketService.forceReconnect(showtimeId.toString());
                  console.log("✅ [HANDLE_BACK] WebSocket reconnected after cancel booking");
                }
              }, 500);

              return true;
            }
          }
        }
      } catch (error1) {
        // Silent error handling for cancel booking attempt
      }

      return false;
    } catch (error) {
      // Silent error handling for cancel booking attempt
      return false;
    }
  };

  const handlePayExistingBooking = async () => {
    if (!bookingError || !bookingError.bookingId) {
      toast.error("Không tìm thấy mã đơn hàng");
      return;
    }

    try {
      // Không set loading để tránh che khuất QR modal
      // setLoading(true);
      const bookingId = bookingError.bookingId;
      toast.loading("Đang kết nối đến cổng thanh toán PayOS...");

      // Sử dụng lại GET endpoint như trong profile
      const response = await api.get("/payos/pending-payment-url");

      toast.dismiss();

      // Sửa logic extract data để match với cấu trúc response thực tế
      const responseData = response.data?.data || response.data;

      const paymentUrl =
        responseData?.payment?.paymentUrl ||
        responseData?.paymentUrl ||
        response.data?.payment?.paymentUrl ||
        response.data?.paymentUrl ||
        response.data?.data?.paymentUrl ||
        response.data?.data?.url ||
        response.data?.url;

      const qrCodeData =
        responseData?.payment?.qrCode ||
        responseData?.qrCode ||
        response.data?.payment?.qrCode ||
        response.data?.qrCode ||
        response.data?.data?.qrCode;

      // Extract orderCode từ response để use trong payment status check
      const orderCode =
        responseData?.payment?.orderCode ||
        responseData?.orderCode ||
        response.data?.payment?.orderCode ||
        response.data?.orderCode ||
        response.data?.data?.orderCode;

      if (qrCodeData) {
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeData)}`;

        setPaymentQrUrl(qrUrl);
        setShowQrCode(true);
        toast.success("Mã QR thanh toán đã được tạo");
        startPaymentStatusCheck(bookingId, orderCode);
      } else if (paymentUrl) {
        setPaymentQrUrl(paymentUrl);
        setShowQrCode(true);
        toast.success("Mã QR thanh toán đã được tạo");
        startPaymentStatusCheck(bookingId, orderCode);
      } else if (response?.data?.success === false) {
        throw new Error(response.data.message || "Không thể tạo liên kết thanh toán");
      } else {
        navigate(`/payment/${bookingId}`, {
          state: {
            fromExistingBooking: true,
          },
        });
      }
    } catch (error: any) {
      toast.dismiss();

      const errorMessage = error.response?.data?.message || error.message || "Không thể kết nối đến dịch vụ thanh toán";
      toast.error(errorMessage);

      // Fallback: navigate to payment page
      navigate(`/payment/${bookingError.bookingId}`, {
        state: {
          fromExistingBooking: true,
        },
      });
    }
  };

  const handleCancelExistingBooking = async () => {
    try {
      setLoading(true);
      toast.loading("Đang kiểm tra thông tin đơn hàng...");

      const checkPendingResponse = await api.get("/bookings/check-pending");

      let bookingId = null;
      if (checkPendingResponse.data?.pendingBooking) {
        const pendingBooking = checkPendingResponse.data.pendingBooking;
        bookingId = pendingBooking.Booking_ID || pendingBooking.id;
      }

      if (!bookingId && bookingError?.bookingId) {
        bookingId = bookingError.bookingId;
      }

      if (!bookingId) {
        toast.error("Không tìm thấy thông tin đơn hàng đang chờ thanh toán");
        setLoading(false);
        return;
      }

      toast.loading(`Đang hủy đơn đặt vé #${bookingId}...`);

      // Thay thế directCancelBooking bằng cancelBooking
      const cancelResult = await bookingService.cancelBooking(bookingId);

      toast.dismiss();
      toast.success(cancelResult.message || `Đã hủy đơn đặt vé #${bookingId} thành công`);

      setBookingError(null);

      // 🔧 FIX: Force cleanup WebSocket state và cross-tab sync sau khi hủy booking
      console.log(`🧹 [CANCEL_MODAL] Force cleanup WebSocket state after booking cancellation`);

      // 1. Force cleanup WebSocket server state
      console.log(`🧹 [CANCEL_MODAL] Step 1: Force cleanup WebSocket server state for showtime: ${showtimeId}`);
      await webSocketService.forceCleanupUserSeats(showtimeId?.toString());

      // 2. Clear all session storage
      console.log(`🧹 [CANCEL_MODAL] Step 2: Clear all session storage`);
      const sessionKeys = [`booking_session_${showtimeId}`, `galaxy_cinema_session_${showtimeId}`, "bookingData"];

      sessionKeys.forEach((key) => {
        sessionStorage.removeItem(key);
        console.log(`🗑️ [CANCEL_MODAL] Cleared session: ${key}`);
      });

      // 3. Clear individual seat sessions
      console.log(`🧹 [CANCEL_MODAL] Step 3: Clear individual seat sessions`);
      seats.forEach((seat) => {
        const sessionKey = `seat_${showtimeId}_${seat.id}`;
        sessionStorage.removeItem(sessionKey);
        console.log(`🗑️ [CANCEL_MODAL] Cleared seat session: ${sessionKey}`);
      });

      // 4. Force broadcast cleanup to all tabs
      console.log(`🧹 [CANCEL_MODAL] Step 4: Force broadcast cleanup to all tabs`);
      try {
        // Broadcast cleanup event to other tabs
        const cleanupData = {
          action: "FORCE_CLEANUP",
          showtimeId: showtimeId,
          userId: user?.id || "anonymous",
          timestamp: Date.now(),
        };

        // Use BroadcastChannel if available
        if (window.BroadcastChannel) {
          const channel = new BroadcastChannel("galaxy_cinema_cleanup");
          channel.postMessage(cleanupData);
          console.log(`📡 [CANCEL_MODAL] Broadcasted cleanup via BroadcastChannel:`, cleanupData);
          channel.close();
        } else {
          // Fallback to localStorage
          localStorage.setItem("galaxy_cinema_cleanup_event", JSON.stringify(cleanupData));
          setTimeout(() => localStorage.removeItem("galaxy_cinema_cleanup_event"), 100);
          console.log(`📡 [CANCEL_MODAL] Broadcasted cleanup via localStorage:`, cleanupData);
        }
      } catch (error) {
        console.warn(`⚠️ [CANCEL_MODAL] Failed to broadcast cleanup:`, error);
      }

      // 5. 🔥 FORCE RECONNECT WebSocket sau khi cancel booking
      console.log(`🔄 [CANCEL_MODAL] Step 5: Force reconnecting WebSocket after cleanup`);
      setTimeout(async () => {
        console.log(`🚀 [CANCEL_MODAL] Force reconnecting WebSocket...`);
        await webSocketService.forceReconnect(showtimeId?.toString());

        // 6. Fetch fresh seats sau khi reconnect
        setTimeout(async () => {
          await fetchSeats();
          console.log(`✅ [CANCEL_MODAL] Seats refreshed after booking cancellation and cleanup`);
        }, 500);
      }, 1000);
    } catch (error: any) {
      toast.dismiss();
      toast.error("Có lỗi xảy ra khi hủy đơn đặt vé. Vui lòng thử lại sau.");
      setBookingError(null);

      // Vẫn cố gắng cập nhật trạng thái ghế ngay cả khi có lỗi
      try {
        await fetchSeats();
      } catch (e) {
        // Silent error handling - không thể cập nhật trạng thái ghế
      }
    } finally {
      setLoading(false);
    }
  };

  // 🔧 FIX: Setup cross-tab cleanup listener
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // 🔧 FIX: Listen for cleanup events from other tabs
      if (e.key === "galaxy_cinema_cleanup_event" && e.newValue) {
        try {
          const data = JSON.parse(e.newValue);
          console.log("📡 [CROSS_TAB] Received cleanup event:", data);

          // 🔧 Handle payment state clear events
          if (data.action === "CLEAR_PAYMENT_STATE" && data.showtimeId === showtimeId) {
            console.log("🗑️ [CROSS_TAB] Processing CLEAR_PAYMENT_STATE from other tab");

            // 🛡️ Skip if currently restoring payment state
            if (isRestoringPayment) {
              console.log("🛡️ [CROSS_TAB] Skipping CLEAR_PAYMENT_STATE - currently restoring payment");
              return;
            }

            // Clear payment state in current tab
            clearPaymentState();

            // Reset to seats view if currently in payment view
            if (currentView === "payment") {
              setCurrentView("seats");
              setPaymentBookingSession(null);
              console.log("🔄 [CROSS_TAB] Switched back to seats view");
            }

            console.log("✅ [CROSS_TAB] Payment state cleared");
          }

          if (
            (data.action === "FORCE_CLEANUP" || data.action === "RETURN_FROM_PAYMENT") &&
            data.showtimeId === showtimeId
          ) {
            console.log(`🧹 [CROSS_TAB] Processing ${data.action} from other tab`);

            // Clear all selected seats in current tab
            setSeats((prevSeats) =>
              prevSeats.map((seat) => ({
                ...seat,
                status: seat.status === "booked" ? "booked" : "available",
                userId: seat.status === "booked" ? seat.userId : null,
              }))
            );

            // Clear local session storage
            const sessionKeys = [`booking_session_${showtimeId}`, `galaxy_cinema_session_${showtimeId}`, "bookingData"];

            sessionKeys.forEach((key) => {
              sessionStorage.removeItem(key);
              console.log(`🗑️ [CROSS_TAB] Cleared session: ${key}`);
            });

            console.log("✅ [CROSS_TAB] Force cleanup completed");
          }
        } catch (error) {
          console.warn("⚠️ [CROSS_TAB] Failed to parse cleanup event:", error);
        }
      }
    };

    // 🔧 FIX: Setup BroadcastChannel listener for cleanup
    let cleanupChannel: BroadcastChannel | null = null;
    if (window.BroadcastChannel) {
      cleanupChannel = new BroadcastChannel("galaxy_cinema_cleanup");
      cleanupChannel.onmessage = (event) => {
        const data = event.data;
        console.log("📡 [BROADCAST] Received cleanup event:", data);

        if (data.action === "FORCE_CLEANUP" && data.showtimeId === showtimeId) {
          console.log("🧹 [BROADCAST] Processing force cleanup from other tab");

          // Clear all selected seats in current tab
          setSeats((prevSeats) =>
            prevSeats.map((seat) => ({
              ...seat,
              status: seat.status === "booked" ? "booked" : "available",
              userId: seat.status === "booked" ? seat.userId : null,
            }))
          );

          // Clear local session storage
          const sessionKeys = [`booking_session_${showtimeId}`, `galaxy_cinema_session_${showtimeId}`, "bookingData"];

          sessionKeys.forEach((key) => {
            sessionStorage.removeItem(key);
            console.log(`🗑️ [BROADCAST] Cleared session: ${key}`);
          });

          console.log("✅ [BROADCAST] Force cleanup completed");
        }
      };
    }

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      if (cleanupChannel) {
        cleanupChannel.close();
      }
    };
  }, [showtimeId]);

  // Movie details for the header
  const movieDetails = {
    title: bookingSession.movieDetails?.title || movie?.title || "Đang tải thông tin phim...",
    poster: bookingSession.movieDetails?.poster || movie?.posterUrl || "/placeholder.jpg",
    language: showtime?.language || "VIE",
    format: showtime?.format || "2D",
    cinema: theater?.name || "Galaxy Cinema",
    date: new Date(showtime?.startTime || Date.now()).toLocaleDateString("vi-VN"),
    time: new Date(showtime?.startTime || Date.now()).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };

  if (loading || !room) {
    return (
      <>
        <FullScreenLoader />

        {/* QR Code Modal cho thanh toán PayOS - render bên ngoài loading */}
        {showQrCode && paymentQrUrl && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-slate-800 p-8 rounded-2xl max-w-md w-full border-2 border-[#FFD875]/60 shadow-lg shadow-[#FFD875]/10 m-4 relative">
              <button onClick={cancelQrPayment} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                <XCircleIcon className="h-6 w-6" />
              </button>

              <h2 className="text-2xl font-bold mb-4 text-center text-[#FFD875]">Thanh toán bằng PayOS</h2>

              {/* Hiển thị số tiền thanh toán */}
              <div className="mb-4 text-center">
                <p className="text-sm text-gray-300 mb-1">Số tiền thanh toán:</p>
                <p className="text-2xl font-bold text-[#FFD875] drop-shadow-[0_0_10px_rgba(255,216,117,0.5)]">
                  {bookingSession?.totalPrice ? bookingSession.totalPrice.toLocaleString("vi-VN") : 0} đ
                </p>

                {/* Hiển thị chi tiết ghế đã chọn */}
                <div className="mt-3 text-center">
                  <p className="text-xs text-gray-400">
                    {bookingSession?.selectedSeats?.length || 0} ghế:{" "}
                    {bookingSession?.selectedSeats?.map((seat) => `${seat.row}${seat.number}`).join(", ")}
                  </p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg mb-4">
                <div className="flex justify-center">
                  <img
                    src={paymentQrUrl}
                    alt="QR Code thanh toán"
                    className="max-w-full h-auto"
                    onError={() => {
                      toast.error("Không thể tải QR code");
                    }}
                  />
                </div>
              </div>

              <p className="text-center text-sm mb-4">Quét mã QR bằng ứng dụng ngân hàng của bạn để thanh toán</p>

              <div className="text-center mb-4">
                <a
                  href={paymentQrUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-[#FFD875] text-black py-3 px-6 rounded-lg font-medium hover:bg-[#FFD875]/80 transition-colors"
                >
                  Mở liên kết thanh toán
                </a>
              </div>

              <div className="text-center text-xs text-gray-400">
                <p>Trang sẽ tự động chuyển hướng sau khi thanh toán thành công</p>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      {/* Header và các thành phần khác */}
      <header className="bg-black text-white py-2 px-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button onClick={handleBack} className="p-2 rounded-full hover:bg-gray-800">
              <ArrowLeftIcon className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-xl font-bold">{movie?.title || "Đặt vé"}</h1>
              <p className="text-sm text-gray-300">{theater?.name || "Rạp chiếu phim"}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Hiển thị tiến trình đặt vé - giảm padding */}
      <div className="container mx-auto px-4 py-1">
        <BookingProgress steps={bookingSteps} currentStep={bookingSession.step} />
      </div>

      {/* Dialog hiển thị lỗi đơn đặt vé đang tồn tại */}
      {bookingError && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-80">
          <div className="bg-gray-800 p-6 rounded-xl shadow-2xl max-w-md w-full border border-yellow-500">
            <div className="text-center mb-5">
              <div className="w-16 h-16 mx-auto bg-yellow-500 rounded-full flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-yellow-500 mb-2">Thông báo</h3>
              <p className="text-white mb-4">{bookingError.message}</p>
              <div className="text-gray-300 mb-5">
                <p>
                  Phim: <span className="font-semibold">{bookingError.movieTitle}</span>
                </p>
                {bookingError.expiryTime && (
                  <p>
                    Thời gian còn lại: <span className="font-semibold">{bookingError.expiryTime} phút</span>
                  </p>
                )}
              </div>
              <div className="flex flex-col space-y-3">
                <button
                  onClick={() => {
                    handlePayExistingBooking();
                  }}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black py-2 px-4 rounded-md font-medium transition-colors"
                >
                  Thanh toán đơn hàng hiện tại
                </button>
                <button
                  onClick={handleCancelExistingBooking}
                  className="w-full bg-transparent hover:bg-gray-700 text-white border border-gray-500 py-2 px-4 rounded-md font-medium transition-colors"
                >
                  Hủy đơn hàng hiện tại
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <FullScreenLoader />
      ) : (
        <main className="flex-grow container mx-auto px-4 py-1">
          {/* 🔄 Conditional rendering based on current view */}
          {currentView === "seats" ? (
            <SeatSelection
              room={room || createStandardRoom()}
              onSeatsChange={handleSelectSeats}
              onNext={handleProceedToPayment}
              onBack={handleBack}
              bookingSession={bookingSession}
              bookingSteps={bookingSteps}
              currentStep={1}
              seats={seats}
              movieDetails={movieDetails}
            />
          ) : currentView === "payment" && paymentBookingSession ? (
            <PaymentComponent
              bookingSession={paymentBookingSession}
              user={user}
              isAuthenticated={isAuthenticated}
              onBack={handleBackToSeats}
              onPaymentSuccess={handlePaymentSuccess}
            />
          ) : null}
        </main>
      )}

      {/* QR Code Modal cho thanh toán PayOS - duplicate để render trong cả loading và non-loading */}
      {showQrCode && (
        <PayOSQRModal
          isOpen={showQrCode}
          onClose={() => setShowQrCode(false)}
          bookingId={selectedBookingId || bookingError?.bookingId || ""}
          onPaymentSuccess={(transactionId) => {
            setShowQrCode(false);
            // Redirect to success page hoặc reload trang
            navigate(`/booking-success/${selectedBookingId || bookingError?.bookingId}`);
          }}
          amount={bookingSession?.totalPrice || 0}
          ticketInfo={bookingSession?.selectedSeats?.map((seat) => `${seat.row}${seat.number}`).join(", ")}
          skipConfirmation={true}
          isStaff={["Staff", "Admin", "Manager"].includes(user?.role || user?.Role)}
        />
      )}
    </div>
  );
};

export default BookingPage;
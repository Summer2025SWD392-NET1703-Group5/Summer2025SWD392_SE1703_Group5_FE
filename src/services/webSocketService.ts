// services/webSocketService.ts
import { io, Socket } from "socket.io-client";
import { toast } from "react-hot-toast";
import { sessionStorageService } from "./sessionStorageService";

// Types cho WebSocket events
export interface SeatSelectionEvent {
  showtimeId: string;
  seatId: string;
}

export interface SeatUpdateEvent {
  seatId: string;
  userId?: string;
  status: "available" | "selected" | "occupied";
  expiresAt?: string;
}

export interface SeatExpirationWarning {
  seatId: string;
  timeRemaining: number; // milliseconds
}

export interface SeatsStateEvent {
  seats: Array<{
    id: string;
    status: "available" | "selected" | "occupied";
    userId?: string;
    expiresAt?: string;
  }>;
}

export interface BookingConfirmationEvent {
  bookingId: string;
  seatIds: string[];
  totalPrice: number;
}

// WebSocket connection states
export type ConnectionState = "disconnected" | "connecting" | "connected" | "reconnecting" | "error";

// WebSocket service configuration
interface WebSocketConfig {
  url: string;
  reconnectAttempts: number;
  reconnectDelay: number;
  maxReconnectDelay: number;
  timeout: number;
}

// Default configuration
const DEFAULT_CONFIG: WebSocketConfig = {
  url: "http://localhost:3000",
  reconnectAttempts: 10,
  reconnectDelay: 1000,
  maxReconnectDelay: 30000,
  timeout: 20000,
};

/**
 * WebSocket Service cho real-time seat selection
 * Quản lý connection, authentication, và event handling
 */
class WebSocketService {
  private socket: Socket | null = null;
  private config: WebSocketConfig;
  private connectionState: ConnectionState = "disconnected";
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private currentShowtimeId: string | null = null;
  private lastSeatCount: number | null = null;

  // Event listeners
  private eventListeners: Map<string, Set<Function>> = new Map();

  // Cross-tab communication
  private storageKey = "galaxy_cinema_seats";
  private broadcastChannel: BroadcastChannel | null = null;

  // Fallback mode khi WebSocket không available
  private fallbackMode = false;

  // Current user ID for session management
  private userId: string | null = null;

  constructor(config?: Partial<WebSocketConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    console.log("🔌 WebSocketService initialized với config:", this.config);

    // 🔄 Setup cross-tab communication
    this.setupCrossTabSync();
  }

  /**
   * Setup cross-tab synchronization using BroadcastChannel
   */
  private setupCrossTabSync(): void {
    console.log(`🔄 Setting up cross-tab sync (BroadcastChannel: ${typeof BroadcastChannel !== "undefined"})`);

    // 🔧 FORCE localStorage fallback for debugging
    this.setupStorageFallback();

    // Continue with normal setup...

    try {
      // 🔄 Initialize BroadcastChannel
      console.log(`🔧 [SETUP] Creating BroadcastChannel: galaxy_cinema_seats`);
      this.broadcastChannel = new BroadcastChannel("galaxy_cinema_seats");
      console.log(`✅ [SETUP] BroadcastChannel created successfully:`, this.broadcastChannel);

      // Listen for messages from other tabs
      const messageHandler = (event: MessageEvent) => {
        console.log(`🔧 [BROADCAST_RECEIVE] Raw event received:`, event);
        const data = event.data;
        console.log(`🔧 [BROADCAST_RECEIVE] Event data:`, data);

        // Check if data has required fields
        if (!data || typeof data !== "object") {
          console.warn(`⚠️ [BROADCAST_RECEIVE] Invalid cross-tab data:`, data);
          return;
        }

        // Only log important cross-tab events (not test messages)
        if (!data.test) {
          console.log(`📡 [BROADCAST_RECEIVE] Cross-tab ${data.action}: ${data.seatId} by user ${data.userId}`);
        }

        console.log(`🔧 [BROADCAST_RECEIVE] Emitting cross-tab-seat-update event...`);
        this.emit("cross-tab-seat-update", {
          seatId: data.seatId,
          userId: data.userId,
          showtimeId: data.showtimeId,
          action: data.action,
          timestamp: data.timestamp,
        });
        console.log(`✅ [BROADCAST_RECEIVE] cross-tab-seat-update event emitted`);
        console.log(`🔄 [BROADCAST_RECEIVE] ===== END CROSS-TAB MESSAGE =====`);
      };

      console.log(`🔧 [SETUP] Adding event listener to BroadcastChannel...`);
      this.broadcastChannel.addEventListener("message", messageHandler);
      console.log(`✅ [SETUP] Event listener added to BroadcastChannel`);

      console.log("✅ [SETUP] Cross-tab sync initialized với BroadcastChannel");

      // 🧪 Test BroadcastChannel immediately
      setTimeout(() => {
        console.log(`🧪 [TEST] Testing BroadcastChannel...`);
        this.testBroadcastChannel();
      }, 1000);
    } catch (error) {
      console.error("❌ [SETUP] BroadcastChannel setup failed:", error);
      console.warn("⚠️ [SETUP] BroadcastChannel không supported, fallback to localStorage");
      this.setupStorageFallback();
    }
  }

  /**
   * Fallback to localStorage for older browsers
   */
  private setupStorageFallback(): void {
    window.addEventListener("storage", (event) => {
      if (event.key === this.storageKey && event.newValue) {
        try {
          const data = JSON.parse(event.newValue);

          // Only log important cross-tab events (not test messages)
          if (!data.test) {
            console.log(`📡 Cross-tab ${data.action}: ${data.seatId} by user ${data.userId}`);
          }
          this.emit("cross-tab-seat-update", {
            seatId: data.seatId,
            userId: data.userId,
            showtimeId: data.showtimeId,
            action: data.action,
            timestamp: data.timestamp,
          });
          console.log(`✅ [STORAGE_RECEIVE] cross-tab-seat-update event emitted`);
          console.log(`🔄 [STORAGE_RECEIVE] ===== END CROSS-TAB MESSAGE =====`);
        } catch (error) {
          console.warn("⚠️ [STORAGE_RECEIVE] Failed to parse storage data:", error);
        }
      } else {
        console.log(`🔄 [STORAGE_EVENT] Ignoring event - key: ${event.key}, hasValue: ${!!event.newValue}`);
      }
    });

    console.log("✅ Cross-tab sync initialized với localStorage fallback");

    // 🚫 [STORAGE_TEST] DISABLED - WebSocket-only mode
    // setTimeout(() => {
    //   console.log(`🧪 [STORAGE_TEST] Testing localStorage fallback...`);
    //   const testData = {
    //     seatId: 'STORAGE_TEST_SEAT',
    //     userId: localStorage.getItem('userId') || 'unknown',
    //     showtimeId: '121',
    //     action: 'selected',
    //     timestamp: Date.now(),
    //     test: true
    //   };

    //   console.log(`🧪 [STORAGE_TEST] Setting localStorage with data:`, testData);
    //   localStorage.setItem(this.storageKey, JSON.stringify(testData));

    //   // Remove after short delay to trigger storage event
    //   setTimeout(() => {
    //     localStorage.removeItem(this.storageKey);
    //     console.log(`🧪 [STORAGE_TEST] Removed test data from localStorage`);
    //   }, 100);
    // }, 1000);
  }

  /**
   * Broadcast seat update to other tabs
   */
  private broadcastSeatUpdate(
    seatId: string,
    userId: string,
    showtimeId: string,
    action: "selected" | "deselected" | "cancel_booking"
  ): void {
    const data = {
      seatId,
      userId,
      showtimeId,
      action,
      timestamp: Date.now(),
    };

    console.log(`🔧 [BROADCAST_DEBUG] Preparing to broadcast:`, data);
    console.log(`🔧 [BROADCAST_DEBUG] BroadcastChannel available: ${!!this.broadcastChannel}`);

    // Ensure BroadcastChannel is available
    if (!this.broadcastChannel && typeof BroadcastChannel !== "undefined") {
      console.log(`🔧 [BROADCAST_DEBUG] Re-initializing BroadcastChannel...`);
      this.setupCrossTabSync();
    }

    // Use BroadcastChannel if available
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(data);
        console.log(`📡 [BROADCAST_SUCCESS] Sent via BroadcastChannel: ${action} seat ${seatId} to other tabs`);
      } catch (error) {
        console.error(`❌ [BROADCAST] Failed to send via BroadcastChannel:`, error);

        // Fallback to localStorage on BroadcastChannel error
        try {
          localStorage.setItem(this.storageKey, JSON.stringify(data));
          setTimeout(() => localStorage.removeItem(this.storageKey), 100);
          console.log(`✅ [BROADCAST_FALLBACK] Successfully sent ${action} seat ${seatId} via localStorage`);
        } catch (fallbackError) {
          console.error(`❌ [BROADCAST_FALLBACK] Failed to send via localStorage:`, fallbackError);
        }
      }
    } else {
      console.warn(`⚠️ [BROADCAST] BroadcastChannel not available, using localStorage fallback`);

      // Fallback to localStorage
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
        setTimeout(() => localStorage.removeItem(this.storageKey), 100);
        console.log(`✅ [BROADCAST] Successfully sent ${action} seat ${seatId} via localStorage`);
      } catch (error) {
        console.error(`❌ [BROADCAST] Failed to send via localStorage:`, error);
      }
    }
  }

  /**
   * Kết nối tới WebSocket server với JWT authentication
   */
  async connect(authToken?: string): Promise<boolean> {
    try {
      if (this.socket?.connected) {
        console.log("✅ WebSocket đã kết nối");
        return true;
      }

      this.setConnectionState("connecting");
      console.log("🔄 Đang kết nối WebSocket server...");

      // Lấy auth token từ localStorage nếu không được provide
      const token = authToken || localStorage.getItem("accessToken");

      // 🔧 Initialize userId từ localStorage hoặc decode từ token
      this.userId = localStorage.getItem("userId");
      if (!this.userId && token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          this.userId = payload?.id || payload?.userId || null;
        } catch (e) {
          console.warn("⚠️ Failed to decode userId from token");
        }
      }

      console.log("🔑 [DEBUG] Auth token check:", {
        provided: !!authToken,
        fromStorage: !!localStorage.getItem("accessToken"),
        tokenLength: token ? token.length : 0,
        tokenPreview: token ? token.substring(0, 20) + "..." : "null",
      });

      if (!token) {
        console.warn("⚠️ Không có auth token, sử dụng fallback mode");
        this.enableFallbackMode();
        return false;
      }

      // 🔧 Tạo socket connection với authentication và CORS fix
      this.socket = io(this.config.url, {
        auth: { token },
        extraHeaders: {
          Authorization: `Bearer ${token}`,
        },
        timeout: this.config.timeout,
        transports: ["websocket", "polling"],
        forceNew: true,
        withCredentials: true,
        autoConnect: true,
      });

      // Setup event listeners
      this.setupSocketEventListeners();

      // Đợi connection hoặc timeout
      return new Promise((resolve) => {
        const connectTimeout = setTimeout(() => {
          console.error("❌ WebSocket connection timeout");
          this.enableFallbackMode();
          resolve(false);
        }, this.config.timeout);

        this.socket!.on("connect", () => {
          clearTimeout(connectTimeout);
          this.setConnectionState("connected");
          this.reconnectAttempts = 0;
          console.log("✅ WebSocket connected thành công");
          console.log(`🔌 Client Socket ID: ${this.socket?.id}`);
          resolve(true);
        });

        this.socket!.on("connect_error", (error) => {
          clearTimeout(connectTimeout);
          console.error("❌ WebSocket connection error:", error);
          this.handleConnectionError(error);
          resolve(false);
        });
      });
    } catch (error) {
      console.error("❌ Lỗi khi kết nối WebSocket:", error);
      this.enableFallbackMode();
      return false;
    }
  }

  /**
   * Setup các event listeners cho socket
   */
  private setupSocketEventListeners(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on("disconnect", (reason) => {
      console.warn("⚠️ WebSocket disconnected:", reason);
      console.warn("📊 Disconnect details:", {
        reason,
        currentShowtime: this.currentShowtimeId,
        reconnectAttempts: this.reconnectAttempts,
        fallbackMode: this.fallbackMode,
        timestamp: new Date().toISOString(),
      });
      this.setConnectionState("disconnected");
      this.handleDisconnection(reason);
    });

    this.socket.on("reconnect", (attemptNumber) => {
      console.log(`🔄 WebSocket reconnected sau ${attemptNumber} attempts`);
      this.setConnectionState("connected");
      this.reconnectAttempts = 0;

      // 🔧 QUAN TRỌNG: Setup lại event listeners sau reconnect
      this.setupSocketEventListeners();

      // Rejoin showtime room nếu có
      if (this.currentShowtimeId) {
        this.joinShowtime(this.currentShowtimeId);
      }
    });

    this.socket.on("reconnect_error", (error) => {
      console.error("❌ Reconnection error:", error);
      this.setConnectionState("error");
    });

    // Seat management events
    this.socket.on("seats-state", (data: SeatsStateEvent) => {
      // 🔧 FIX: Backend gửi array trực tiếp, không phải object với property seats
      const seatsArray = Array.isArray(data) ? data : data?.seats || [];
      // Only log first time or when seat count changes
      if (!this.lastSeatCount || this.lastSeatCount !== seatsArray.length) {
        console.log(`🪑 Received ${seatsArray.length} seats from server`);
        this.lastSeatCount = seatsArray.length;
      }

      // ✅ Validate data structure trước khi xử lý
      if (!Array.isArray(seatsArray)) {
        console.error("❌ Invalid seats data received:", data);
        return;
      }

      // Merge với session storage data nếu có currentShowtimeId
      if (this.currentShowtimeId && this.userId) {
        // 🔧 FIX: Chỉ lấy ghế của current user để tránh merge ghế của user khác
        const sessionSeats = sessionStorageService.getSelectedSeats(this.currentShowtimeId, this.userId.toString());
        console.log(`🔍 [DEBUG] Session seats for user ${this.userId}:`, sessionSeats);

        try {
          const mergedData = {
            seats: seatsArray.map((seat) => {
              // ✅ Validate seat object structure
              if (!seat || typeof seat !== "object") {
                console.warn("⚠️ Invalid seat object:", seat);
                return seat;
              }

              // Nếu seat có trong session storage, mark as selected
              const seatId = seat.id || seat.seatId;
              if (seatId && sessionSeats.includes(seatId)) {
                return { ...seat, status: "selected" as const };
              }
              return seat;
            }),
          };

          console.log(`💾 Merged ${sessionSeats.length} session seats with server data`);
          this.emit("seats-state", mergedData);
        } catch (error) {
          console.error("❌ Error merging seats data:", error);
          // Fallback: emit original data
          this.emit("seats-state", { seats: seatsArray });
        }
      } else {
        this.emit("seats-state", { seats: seatsArray });
      }
    });

    this.socket.on("seat-selected", (data: SeatUpdateEvent) => {
      console.log(`🔧 [FRONTEND_DEBUG] Raw data received:`, JSON.stringify(data));
      console.log(`🔧 [FRONTEND_DEBUG] data.seatId type: ${typeof data.seatId}, value: ${data.seatId}`);
      console.log(`🔧 [FRONTEND_DEBUG] data.userId type: ${typeof data.userId}, value: ${data.userId}`);
      console.log(`🔒 Ghế ${data.seatId} được chọn bởi user ${data.userId}`);
      console.log(`🔌 Socket ID nhận event: ${this.socket?.id}`);
      console.log(`📊 Event data:`, data);
      this.emit("seat-selected", data);
    });

    this.socket.on("seat-deselected", (data: SeatUpdateEvent) => {
      console.log(`🔓 Ghế ${data.seatId} được bỏ chọn`);
      this.emit("seat-deselected", data);
    });

    this.socket.on("seats-booked", (data: { seatIds: string[] }) => {
      console.log("🎫 Ghế đã được đặt:", data.seatIds);
      this.emit("seats-booked", data);
    });

    this.socket.on("seat-booked", (data: { seatId: string; bookingId: string }) => {
      console.log(`🔴 Ghế ${data.seatId} đã được booking #${data.bookingId}`);
      this.emit("seat-booked", data);
    });

    this.socket.on("seat-released", (data: SeatUpdateEvent) => {
      console.log(`🔄 Ghế ${data.seatId} được giải phóng`);
      this.emit("seat-released", data);

      // 🔧 SIMPLE FIX: Auto refresh seats when any seat is released
      console.log("🔄 [AUTO_REFRESH] Seat released detected - refreshing seats from server...");
      setTimeout(() => {
        if (this.socket?.connected && this.currentShowtimeId) {
          this.requestCurrentSeatsState(this.currentShowtimeId);
          console.log("✅ [AUTO_REFRESH] Requested fresh seats from server");
        }
      }, 500);
    });

    // Timeout management events
    this.socket.on("seat-expiration-warning", (data: SeatExpirationWarning) => {
      console.log(`⏰ Cảnh báo ghế ${data.seatId} sắp hết hạn: ${data.timeRemaining}ms`);
      this.emit("seat-expiration-warning", data);
      this.showExpirationWarning(data);
    });

    this.socket.on("seat-hold-extended", (data: { seatId: string; newExpiresAt: string }) => {
      console.log(`⏳ Ghế ${data.seatId} được gia hạn đến ${data.newExpiresAt}`);
      this.emit("seat-hold-extended", data);
      toast.success(`Đã gia hạn ghế ${data.seatId} thêm 15 phút`);
    });

    this.socket.on("seat-hold-extension-failed", (data: { seatId: string; reason: string }) => {
      console.error(`❌ Gia hạn ghế ${data.seatId} thất bại: ${data.reason}`);
      this.emit("seat-hold-extension-failed", data);
      toast.error(`Không thể gia hạn ghế ${data.seatId}: ${data.reason}`);
    });

    // Booking confirmation
    this.socket.on("booking-confirmed", (data: BookingConfirmationEvent) => {
      console.log("🎉 Booking confirmed:", data);
      this.emit("booking-confirmed", data);
    });

    // Error handling
    this.socket.on("error", (error: any) => {
      console.error("❌ WebSocket error:", error);
      this.emit("error", error);

      // Handle specific backend errors
      if (error.message === "Failed to join showtime") {
        console.log("🔄 Backend database error - switching to fallback mode");
        this.emit("fallback-mode", { reason: "backend-error", error: error.error });
        toast.error("Chuyển sang chế độ offline - một số tính năng real-time có thể bị hạn chế");
        return;
      }

      // Show user-friendly error message
      if (error.message) {
        toast.error(`Lỗi kết nối: ${error.message}`);
      } else {
        toast.error("Có lỗi xảy ra với kết nối WebSocket");
      }
    });
  }

  /**
   * Tham gia showtime room
   */
  joinShowtime(showtimeId: string): void {
    if (!this.socket) {
      console.warn("⚠️ Socket chưa được khởi tạo");
      return;
    }

    // Nếu chưa connected, đợi connected event
    if (!this.socket.connected) {
      console.log(`⏳ WebSocket chưa connected, đợi kết nối để join showtime ${showtimeId}`);
      this.currentShowtimeId = showtimeId;

      // Đợi connected event để join
      this.socket.once("connect", () => {
        console.log(`🔄 Connected! Bây giờ join showtime ${showtimeId}`);
        this.performJoinShowtime(showtimeId);
      });
      return;
    }

    // Nếu đã connected, join ngay
    this.performJoinShowtime(showtimeId);
  }

  private performJoinShowtime(showtimeId: string): void {
    console.log(`🎬 Tham gia showtime room: ${showtimeId}`);
    console.log(`🔌 Using Socket ID: ${this.socket?.id}`);
    this.currentShowtimeId = showtimeId;

    // 🚫 DISABLED: Clear session storage để preserve seats across tabs
    // sessionStorageService.clearSelectedSeats(showtimeId);

    this.socket!.emit("join-showtime", { showtimeId });

    // 🔄 Request current state của tất cả ghế khi join
    this.requestCurrentSeatsState(showtimeId);
  }

  /**
   * Request current state của tất cả ghế trong showtime
   */
  requestCurrentSeatsState(showtimeId: string): void {
    if (!this.socket?.connected) {
      console.warn("⚠️ WebSocket chưa kết nối, không thể request seats state");
      return;
    }

    // Request current seats state (reduced logging)
    this.socket.emit("get-seats-state", { showtimeId });

    // 🎭 Simulate server response với current state từ localStorage
    this.simulateCurrentSeatsStateResponse(showtimeId);
  }

  /**
   * Simulate server response cho get-seats-state request
   */
  private simulateCurrentSeatsStateResponse(showtimeId: string): void {
    setTimeout(() => {
      // Lấy current state từ localStorage của tất cả users
      const allSelectedSeats = this.getAllSelectedSeatsFromStorage(showtimeId);

      if (allSelectedSeats.length > 0) {
        console.log(`🔄 Simulating seats-state response với ${allSelectedSeats.length} ghế đã được chọn`);

        // Emit seats-state event với current state
        this.emit("seats-state", {
          showtimeId,
          seats: allSelectedSeats.map((seatId) => ({
            seatId,
            status: "selected",
            userId: this.getOwnerOfSeat(seatId, showtimeId),
            expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 phút
          })),
        });
      }
    }, 100); // Delay nhỏ để simulate network
  }

  /**
   * Lấy tất cả ghế đã được chọn từ localStorage của tất cả users
   */
  private getAllSelectedSeatsFromStorage(showtimeId: string): string[] {
    const allSeats: string[] = [];

    // Scan tất cả localStorage keys để tìm selected seats
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(`selectedSeats_${showtimeId}_`)) {
        try {
          const seats = JSON.parse(localStorage.getItem(key) || "[]");
          allSeats.push(...seats);
        } catch (error) {
          console.warn(`⚠️ Không thể parse localStorage key: ${key}`);
        }
      }
    }

    // Remove duplicates
    return [...new Set(allSeats)];
  }

  /**
   * Tìm owner của ghế từ localStorage
   */
  private getOwnerOfSeat(seatId: string, showtimeId: string): string {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(`selectedSeats_${showtimeId}_`)) {
        try {
          const seats = JSON.parse(localStorage.getItem(key) || "[]");
          if (seats.includes(seatId)) {
            // Extract userId từ key: selectedSeats_showtimeId_userId
            return key.split("_")[2] || "unknown";
          }
        } catch (error) {
          console.warn(`⚠️ Không thể parse localStorage key: ${key}`);
        }
      }
    }
    return "unknown";
  }

  /**
   * Rời khỏi showtime room
   */
  leaveShowtime(): void {
    if (!this.socket?.connected || !this.currentShowtimeId) return;

    console.log(`🚪 Rời khỏi showtime room: ${this.currentShowtimeId}`);
    this.socket.emit("leave-showtime", { showtimeId: this.currentShowtimeId });
    this.currentShowtimeId = null;
  }

  /**
   * Chọn ghế
   */
  selectSeat(showtimeId: string, seatId: string, userId?: string): void {
    // Validation đầu vào
    if (!seatId || seatId === "undefined" || seatId === showtimeId) {
      console.warn(`⚠️ Invalid seatId: ${seatId}, skipping selectSeat`);
      return;
    }

    if (!showtimeId || showtimeId === "undefined") {
      console.warn(`⚠️ Invalid showtimeId: ${showtimeId}, skipping selectSeat`);
      return;
    }

    if (!this.socket?.connected || !this.currentShowtimeId) {
      console.warn("⚠️ WebSocket chưa kết nối hoặc chưa join showtime");
      return;
    }

    // Try multiple sources for userId
    let finalUserId = userId;

    if (!finalUserId) {
      // Try localStorage
      finalUserId = localStorage.getItem("userId") || undefined;
    }

    if (!finalUserId) {
      // Try to get from user object in localStorage
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          finalUserId = user?.id || user?.User_ID;
        } catch (e) {
          console.warn("⚠️ Failed to parse user from localStorage");
        }
      }
    }

    if (!finalUserId) {
      // Try to decode from token (both 'token' and 'accessToken' keys)
      const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          finalUserId = payload?.id || payload?.userId;
        } catch (e) {
          console.warn("⚠️ Failed to decode userId from token");
        }
      }
    }

    // 🔧 FIX: Try to get from current user context if still null
    if (!finalUserId) {
      try {
        // Try to get from window context or global state
        const authContext = (window as any).__AUTH_CONTEXT__;
        if (authContext?.user?.User_ID) {
          finalUserId = authContext.user.User_ID.toString();
        }
      } catch (e) {
        console.warn("⚠️ Failed to get userId from auth context");
      }
    }

    if (!finalUserId || finalUserId === "undefined" || finalUserId === "null") {
      console.warn(`⚠️ Invalid userId: ${finalUserId}, skipping selectSeat`);
      console.warn(
        `🔍 Debug - userId sources: {provided: ${userId}, localStorage: ${localStorage.getItem(
          "userId"
        )}, user: ${localStorage.getItem("user")}, token: ${!!localStorage.getItem("token")}}`
      );
      return;
    }

    console.log(`🔒 Chọn ghế ${seatId} cho user ${finalUserId} trong showtime ${showtimeId}`);

    // 💾 Save to session storage for persistence
    sessionStorageService.saveSelectedSeat(seatId, finalUserId, showtimeId);

    // Emit to WebSocket server
    this.socket.emit("select-seat", {
      showtimeId: showtimeId,
      seatId,
      userId: finalUserId,
    });

    // 🔄 ENABLED: Cross-tab broadcast for seat selection to ensure sync
    console.log(`📡 [SELECT_SEAT] Broadcasting seat selection: ${seatId} by user ${finalUserId}`);
    console.log(`🔧 [SELECT_SEAT] BroadcastChannel status: ${!!this.broadcastChannel}`);
    console.log(`🔧 [SELECT_SEAT] Current showtime: ${this.currentShowtimeId}`);

    this.broadcastSeatUpdate(seatId, finalUserId, this.currentShowtimeId, "selected");

    console.log(`✅ [SELECT_SEAT] Cross-tab broadcast completed for seat selection`);
    console.log(`🔧 [SELECT_SEAT] Final userId used: ${finalUserId}`);
  }

  /**
   * Bỏ chọn ghế
   */
  deselectSeat(seatId: string, userId?: string): void {
    if (!this.socket?.connected || !this.currentShowtimeId) {
      console.warn("⚠️ WebSocket chưa kết nối hoặc chưa join showtime");
      return;
    }

    const finalUserId = userId || localStorage.getItem("userId") || "anonymous";

    // 🗑️ Remove from session storage
    sessionStorageService.removeSelectedSeat(seatId, this.currentShowtimeId);

    // Emit to WebSocket server
    this.socket.emit("deselect-seat", {
      showtimeId: this.currentShowtimeId,
      seatId,
      userId: finalUserId,
    });

    // 🔄 ENABLED: Cross-tab broadcast for seat deselection to ensure sync
    console.log(`📡 [DESELECT_SEAT] Broadcasting seat deselection: ${seatId} by user ${finalUserId}`);
    this.broadcastSeatUpdate(seatId, finalUserId, this.currentShowtimeId, "deselected");
    console.log(`✅ [DESELECT_SEAT] Cross-tab broadcast completed for seat deselection`);
  }

  /**
   * Gia hạn thời gian giữ ghế
   */
  extendSeatHold(seatId: string): void {
    if (!this.socket?.connected || !this.currentShowtimeId) {
      console.warn("⚠️ WebSocket chưa kết nối hoặc chưa join showtime");
      return;
    }

    console.log(`⏳ Gia hạn ghế: ${seatId}`);
    this.socket.emit("extend-seat-hold", {
      showtimeId: this.currentShowtimeId,
      seatId,
    });
  }

  /**
   * Xác nhận booking
   */
  confirmBooking(seatIds: string[], bookingData: any): void {
    if (!this.socket?.connected || !this.currentShowtimeId) {
      console.warn("⚠️ WebSocket chưa kết nối hoặc chưa join showtime");
      return;
    }

    console.log("🎫 Xác nhận booking:", { seatIds, bookingData });
    this.socket.emit("confirm-booking", {
      showtimeId: this.currentShowtimeId,
      seatIds,
      bookingData,
    });
  }

  /**
   * Đăng ký event listener
   */
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
  }

  /**
   * Hủy đăng ký event listener
   */
  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  /**
   * Emit event tới các listeners
   */
  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`❌ Lỗi khi xử lý event ${event}:`, error);
        }
      });
    }
  }

  /**
   * Set connection state và emit event
   */
  private setConnectionState(state: ConnectionState): void {
    if (this.connectionState !== state) {
      this.connectionState = state;
      this.emit("connection-state-changed", state);
      console.log(`🔌 Connection state changed: ${state}`);
    }
  }

  /**
   * Xử lý connection error
   */
  private handleConnectionError(error: any): void {
    this.setConnectionState("error");

    if (error.message === "Authentication failed") {
      console.error("❌ Authentication failed, chuyển sang fallback mode");

      // Safe toast call
      try {
        if (typeof toast?.error === "function") {
          toast.error("Xác thực thất bại. Sử dụng chế độ offline.");
        }
      } catch (toastError) {
        console.warn("⚠️ Toast error:", toastError);
      }

      this.enableFallbackMode();
    } else {
      console.error("❌ Connection error:", error);
      this.scheduleReconnect();
    }
  }

  /**
   * Xử lý disconnection
   */
  private handleDisconnection(reason: string): void {
    console.warn(`⚠️ WebSocket disconnected: ${reason}`);

    // 🔥 FORCE RECONNECT - Luôn thử reconnect trong mọi trường hợp
    if (this.currentShowtimeId) {
      console.log(`🔄 Auto-reconnecting for showtime ${this.currentShowtimeId}...`);
      this.scheduleReconnect();

      // Backup: Start continuous auto-reconnect
      this.startAutoReconnect(this.currentShowtimeId);
    }
  }

  /**
   * 🔥 AGGRESSIVE RECONNECT - Không bao giờ từ bỏ kết nối
   */
  private scheduleReconnect(): void {
    // 🔥 NEVER GIVE UP - Reset attempts nếu quá nhiều để tiếp tục thử
    if (this.reconnectAttempts >= this.config.reconnectAttempts) {
      console.warn(`⚠️ Reached max attempts (${this.config.reconnectAttempts}), resetting counter...`);
      this.reconnectAttempts = 0; // Reset để tiếp tục thử
    }

    this.setConnectionState("reconnecting");
    this.reconnectAttempts++;

    const delay = Math.min(
      this.config.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      this.config.maxReconnectDelay
    );

    console.log(`🔄 Reconnect attempt ${this.reconnectAttempts}/${this.config.reconnectAttempts} sau ${delay}ms`);

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  /**
   * Bật fallback mode
   */
  private enableFallbackMode(): void {
    this.fallbackMode = true;
    this.setConnectionState("error");
    console.warn("⚠️ Fallback mode enabled - sử dụng localStorage và API calls");      // Safe toast call
      try {
        if (typeof toast?.error === "function") {
          toast.error("Chế độ offline: Một số tính năng real-time có thể không khả dụng");
        } else {
          console.warn("⚠️ Toast not available, fallback mode enabled silently");
        }
      } catch (error) {
        console.warn("⚠️ Toast error:", error);
      }
  }

  /**
   * Hiển thị cảnh báo ghế sắp hết hạn
   */
  private showExpirationWarning(data: SeatExpirationWarning): void {
    const minutes = Math.ceil(data.timeRemaining / 60000);
    toast.error(`Ghế ${data.seatId} sẽ hết hạn sau ${minutes} phút. Nhấn để gia hạn.`, {
      duration: 10000,
    });
  }

  /**
   * Ngắt kết nối WebSocket
   */
  disconnect(): void {
    console.log("🔌 Ngắt kết nối WebSocket...");

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.setConnectionState("disconnected");
    this.currentShowtimeId = null;
    this.reconnectAttempts = 0;
    this.fallbackMode = false;
  }

  /**
   * Silent clear - không broadcast đến tabs khác (cho payment)
   */
  silentClearAllSelectedSeats(userId?: string, showtimeId?: string): void {
    const targetShowtimeId = showtimeId || this.currentShowtimeId;

    if (!targetShowtimeId) {
      console.warn("⚠️ Không có showtime ID để silent clear seats");
      return;
    }

    console.log(`🤫 Silent clear all seats for showtime: ${targetShowtimeId} (no broadcast)`);

    // 🔧 FIX: Lấy userId chính xác từ nhiều nguồn
    const finalUserId =
      userId ||
      localStorage.getItem("userId") ||
      localStorage.getItem("user")?.replace(/['"]/g, "") ||
      sessionStorage.getItem("userId") ||
      "anonymous";

    console.log(`👤 [SILENT_CLEAR] Using userId: ${finalUserId} (from ${userId ? "param" : "storage"})`);

    // Clear all possible storage keys
    const allStorageKeys = [
      `booking_session_${targetShowtimeId}`,
      `galaxy_cinema_session_${targetShowtimeId}`,
      `selectedSeats_${targetShowtimeId}`,
      `selectedSeats_${targetShowtimeId}_${finalUserId}`,
      `seat_${targetShowtimeId}`,
      `payment_timer_${targetShowtimeId}`,
    ];

    // Clear sessionStorage
    allStorageKeys.forEach((key) => {
      if (sessionStorage.getItem(key)) {
        sessionStorage.removeItem(key);
      }
    });

    // Clear localStorage
    allStorageKeys.forEach((key) => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
      }
    });

    // 🧹 ENABLE: Clear sessionStorageService khi cancel booking để tránh restore
    sessionStorageService.clearSelectedSeats(targetShowtimeId);

    // Clear server state
    if (this.socket?.connected) {
      this.socket.emit("clear-all-seats", {
        showtimeId: targetShowtimeId,
        userId: finalUserId,
      });
    }

    // 🤫 NO BROADCAST - Silent cleanup for payment
    console.log(`🤫 Silent cleanup completed - no cross-tab broadcast sent`);
  }

  /**
   * Clear tất cả ghế đã chọn của user hiện tại
   */
  clearAllSelectedSeats(userId?: string, showtimeId?: string): void {
    const targetShowtimeId = showtimeId || this.currentShowtimeId;

    if (!targetShowtimeId) {
      console.warn("⚠️ Không có showtime ID để clear seats");
      return;
    }

    console.log(`🧹 Clearing all seats for showtime: ${targetShowtimeId}`);

    // 🔧 FIX: Lấy userId chính xác từ nhiều nguồn
    const finalUserId =
      userId ||
      localStorage.getItem("userId") ||
      localStorage.getItem("user")?.replace(/['"]/g, "") ||
      sessionStorage.getItem("userId") ||
      "anonymous";

    // Clear all possible storage keys
    const allStorageKeys = [
      `booking_session_${targetShowtimeId}`,
      `galaxy_cinema_session_${targetShowtimeId}`,
      `selectedSeats_${targetShowtimeId}`,
      `selectedSeats_${targetShowtimeId}_${finalUserId}`,
      `seat_${targetShowtimeId}`,
      `payment_timer_${targetShowtimeId}`,
    ];

    // Clear sessionStorage
    allStorageKeys.forEach((key) => {
      if (sessionStorage.getItem(key)) {
        sessionStorage.removeItem(key);
      }
    });

    // Clear localStorage
    allStorageKeys.forEach((key) => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
      }
    });

    // 🧹 ENABLE: Clear sessionStorageService khi cancel booking để tránh restore
    sessionStorageService.clearSelectedSeats(targetShowtimeId);

    // Clear server state
    if (this.socket?.connected) {
      this.socket.emit("clear-all-seats", {
        showtimeId: targetShowtimeId,
        userId: finalUserId,
      });
    }

    // 🔄 ENABLED: Cross-tab broadcast for cancel booking to sync all tabs
    this.broadcastSeatUpdate("CANCEL_BOOKING", finalUserId, targetShowtimeId, "cancel_booking");
    console.log(`✅ Cleared all seats for showtime: ${targetShowtimeId} (WITH cross-tab broadcast for cancel)`);
  }

  /**
   * Silent cleanup cho payment - không broadcast đến tabs khác
   */
  silentCleanupUserSeats(showtimeId?: string): Promise<boolean> {
    return new Promise((resolve) => {
      const targetShowtimeId = showtimeId || this.currentShowtimeId;

      if (!targetShowtimeId) {
        console.warn("⚠️ Không có showtime ID để silent cleanup");
        resolve(false);
        return;
      }

      console.log(`🤫 Silent cleanup for showtime: ${targetShowtimeId} (no cross-tab broadcast)`);

      // 1. Clear frontend storage ONLY (no broadcast)
      this.silentClearAllSelectedSeats(undefined, targetShowtimeId);

      // 2. Force cleanup backend if connected
      if (!this.socket?.connected) {
        console.warn("⚠️ WebSocket not connected, only frontend cleanup performed");
        resolve(true);
        return;
      }

      // Listen for completion
      const timeoutId = setTimeout(() => {
        console.warn("⚠️ Silent cleanup timeout");
        resolve(true);
      }, 5000);

      const handleCompletion = () => {
        clearTimeout(timeoutId);
        this.socket?.off("force-cleanup-completed", handleCompletion);

        console.log(`✅ Silent cleanup completed`);
        resolve(true);
      };

      this.socket.on("force-cleanup-completed", handleCompletion);

      // Request backend cleanup
      this.socket.emit("force-cleanup-user-seats", {
        showtimeId: targetShowtimeId,
      });
    });
  }

  /**
   * Force cleanup tất cả ghế của user (cho navigation back)
   */
  forceCleanupUserSeats(showtimeId?: string): Promise<boolean> {
    return new Promise((resolve) => {
      const targetShowtimeId = showtimeId || this.currentShowtimeId;

      if (!targetShowtimeId) {
        console.warn("⚠️ Không có showtime ID để force cleanup");
        resolve(false);
        return;
      }

      console.log(`🧹 Force cleanup for showtime: ${targetShowtimeId}`);

      // 1. Clear frontend storage first
      this.clearAllSelectedSeats(undefined, targetShowtimeId);

      // 2. Force cleanup backend if connected
      if (!this.socket?.connected) {
        console.warn("⚠️ WebSocket not connected, only frontend cleanup performed");
        resolve(true);
        return;
      }

      // Listen for completion
      const timeoutId = setTimeout(() => {
        console.warn("⚠️ Force cleanup timeout");
        resolve(true);
      }, 5000);

      const handleCompletion = () => {
        clearTimeout(timeoutId);
        this.socket?.off("force-cleanup-completed", handleCompletion);

        console.log(`✅ Force cleanup completed`);
        resolve(true);
      };

      this.socket.on("force-cleanup-completed", handleCompletion);

      // Request backend cleanup
      this.socket.emit("force-cleanup-user-seats", {
        showtimeId: targetShowtimeId,
      });
    });
  }

  /**
   * Cleanup khi component unmount
   */
  cleanup(): void {
    console.log("🧹 Cleanup WebSocketService...");

    // 🚨 KHÔNG clear selected seats để preserve session khi navigate
    // this.clearAllSelectedSeats();

    this.leaveShowtime();
    this.disconnect();
    this.eventListeners.clear();

    // 🔄 Close BroadcastChannel - but keep it available for cross-tab sync
    if (this.broadcastChannel) {
      console.log("🔄 BroadcastChannel kept alive for cross-tab sync");
      // Don't close BroadcastChannel to maintain cross-tab communication
      // this.broadcastChannel.close();
      // this.broadcastChannel = null;
    }
  }

  // Getters
  get isConnected(): boolean {
    return this.socket?.connected || false;
  }

  get isFallbackMode(): boolean {
    return this.fallbackMode;
  }

  get getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  get getCurrentShowtimeId(): string | null {
    return this.currentShowtimeId;
  }

  /**
   * Force refresh seats state từ server
   */
  refreshSeatsState(): void {
    if (!this.socket?.connected || !this.currentShowtimeId) {
      console.warn("⚠️ Không thể refresh seats state");
      return;
    }

    console.log("🔄 Refresh seats state từ server...");
    this.socket.emit("get-seats-state", {
      showtimeId: this.currentShowtimeId,
    });
  }

  /**
   * Request seats state for specific showtime
   */
  requestSeatsState(showtimeId: string): void {
    if (!this.socket?.connected) {
      console.warn("⚠️ Không thể request seats state - WebSocket not connected");
      return;
    }

    console.log(`🔄 Requesting seats state for showtime: ${showtimeId}`);
    this.socket.emit("get-seats-state", {
      showtimeId: showtimeId,
    });
  }

  /**
   * Test BroadcastChannel functionality
   */
  testBroadcastChannel(): void {
    if (!this.broadcastChannel) {
      console.warn("⚠️ [TEST] BroadcastChannel not available for testing");
      return;
    }

    const testData = {
      seatId: "TEST",
      userId: "TEST_USER",
      showtimeId: "TEST_SHOWTIME",
      action: "test",
      timestamp: Date.now(),
      test: true,
    };

    console.log(`🧪 [TEST] Sending test message via BroadcastChannel:`, testData);
    try {
      this.broadcastChannel.postMessage(testData);
      console.log(`✅ [TEST] Test message sent successfully`);
    } catch (error) {
      console.error(`❌ [TEST] Failed to send test message:`, error);
    }
  }

  /**
   * 🔥 FORCE RECONNECT - Buộc kết nối lại ngay lập tức
   */
  forceReconnect(showtimeId?: string): Promise<boolean> {
    return new Promise((resolve) => {
      const targetShowtimeId = showtimeId || this.currentShowtimeId;

      console.log(`🔥 Force reconnecting WebSocket${targetShowtimeId ? ` for showtime ${targetShowtimeId}` : ""}...`);

      // Disconnect trước
      if (this.socket?.connected) {
        this.socket.disconnect();
      }

      // Reset state
      this.setConnectionState("disconnected");
      this.reconnectAttempts = 0;

      // Connect lại
      setTimeout(() => {
        this.connect()
          .then(resolve)
          .catch(() => resolve(false));
      }, 100);
    });
  }

  /**
   * 🔄 AUTO RECONNECT - Tự động kết nối lại với retry logic
   */
  startAutoReconnect(showtimeId?: string): void {
    if (this.reconnectTimer) {
      clearInterval(this.reconnectTimer);
    }

    const targetShowtimeId = showtimeId || this.currentShowtimeId;
    if (!targetShowtimeId) return;

    console.log(`🔄 Starting auto-reconnect for showtime ${targetShowtimeId}`);

    this.reconnectTimer = setInterval(() => {
      if (!this.socket?.connected && this.connectionState !== "connecting") {
        console.log(`🔄 Auto-reconnect attempt ${this.reconnectAttempts + 1}...`);
        this.connect();
      }
    }, 3000); // Check every 3 seconds
  }

  /**
   * Kiểm tra health của WebSocket connection
   */
  async healthCheck(): Promise<boolean> {
    if (!this.socket?.connected) {
      return false;
    }

    return new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(false), 5000);

      this.socket!.emit("ping", { timestamp: Date.now() });
      this.socket!.once("pong", () => {
        clearTimeout(timeout);
        resolve(true);
      });
    });
  }
}

// Export singleton instance
export const webSocketService = new WebSocketService();
export default webSocketService;
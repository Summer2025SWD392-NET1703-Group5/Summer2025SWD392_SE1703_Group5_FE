// hooks/useWebSocket.ts
import { useEffect, useState, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { webSocketService } from '../services/webSocketService';
import { sessionStorageService } from '../services/sessionStorageService';
import type {
  ConnectionState,
  SeatUpdateEvent,
  SeatExpirationWarning,
  SeatsStateEvent
} from '../services/webSocketService';
import { seatService } from '../services/seatService';
import type { Seat } from '../types';

interface UseWebSocketOptions {
  showtimeId: string;
  authToken?: string;
  enableFallback?: boolean;
  autoConnect?: boolean;
  userId?: string;
}

interface UseWebSocketReturn {
  // Connection state
  isConnected: boolean;
  connectionState: ConnectionState;
  isFallbackMode: boolean;

  // Seat management
  seats: Seat[];
  selectedSeats: string[]; // Ghế của tôi
  otherUsersSelectedSeats: string[]; // Ghế của người khác
  expiringSeats: Map<string, number>;

  // Actions
  selectSeat: (seatId: string) => Promise<void>;
  deselectSeat: (seatId: string) => Promise<void>;
  extendSeatHold: (seatId: string) => void;
  refreshSeats: () => Promise<void>;

  // Connection management
  connect: () => Promise<boolean>;
  disconnect: () => void;
  forceReconnect: () => Promise<boolean>;

  // Booking
  confirmBooking: (bookingData: any) => void;

  // Session management
  setPreventRestore: (prevent: boolean) => void;
}

/**
 * Custom hook để quản lý WebSocket connection và real-time seat selection
 */
export const useWebSocket = (options: UseWebSocketOptions): UseWebSocketReturn => {
  const { showtimeId, authToken, enableFallback = true, autoConnect = true, userId } = options;
  
  // States
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [isFallbackMode, setIsFallbackMode] = useState(false);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>(() => {
    // 💾 Restore selected seats from session storage on mount
    return sessionStorageService.getSelectedSeats(showtimeId, userId);
  });
  const [otherUsersSelectedSeats, setOtherUsersSelectedSeats] = useState<string[]>([]); // Ghế của người khác
  const [expiringSeats, setExpiringSeats] = useState<Map<string, number>>(new Map());
  const [preventRestore, setPreventRestore] = useState<boolean>(false);
  
  // Refs để tránh stale closure
  const showtimeIdRef = useRef(showtimeId);
  const seatsRef = useRef<Seat[]>([]);
  
  // Update refs khi props thay đổi
  useEffect(() => {
    showtimeIdRef.current = showtimeId;
  }, [showtimeId]);

  useEffect(() => {
    seatsRef.current = seats;
  }, [seats]);

  // 💾 Sync selected seats with session storage when showtimeId or userId changes
  useEffect(() => {
    const sessionSeats = sessionStorageService.getSelectedSeats(showtimeId, userId);
    setSelectedSeats(sessionSeats);

    // 🔄 QUAN TRỌNG: Sync session seats với server khi reconnect
    if (sessionSeats.length > 0 && isConnected) {

      sessionSeats.forEach(seatId => {
        webSocketService.selectSeat(showtimeId, seatId, userId);
      });
    }
  }, [showtimeId, userId, isConnected]);

  // 💰 Helper function để lấy giá fallback theo loại ghế
  const getFallbackPrice = (seatType: string): number => {
    switch (seatType.toLowerCase()) {
      case 'vip':
        return 100000; // 100k cho VIP
      case 'regular':
      case 'normal':
      default:
        return 81000; // 81k cho Regular
    }
  };

  /**
   * Load seats từ API (fallback hoặc initial load)
   */
  const loadSeatsFromAPI = useCallback(async (): Promise<Seat[]> => {
    try {

      const apiSeats = await seatService.getSeatMap(parseInt(showtimeId));
      
      // 🎭 Helper function để map seat types
      const mapSeatType = (backendType: string): 'standard' | 'vip' | 'couple' | 'wheelchair' | 'hidden' => {
        const type = (backendType || '').toLowerCase();
        switch (type) {
          case 'vip':
          case 'premium':
            return 'vip';
          case 'couple':
            return 'couple';
          case 'wheelchair':
          case 'disabled':
            return 'wheelchair';
          case 'hidden':
            return 'hidden';
          default:
            return 'standard';
        }
      };

      // Transform API data to match our Seat interface
      const transformedSeats: Seat[] = apiSeats.data?.map((seat: any) => {
        const mappedType = mapSeatType(seat.type || seat.Seat_Type || 'standard');

        // ✅ FIX: Tạo seatId theo format A1, B5 từ row + column
        const row = seat.row || seat.Row_Letter || 'A';
        const number = seat.number || seat.Seat_Number || 1;
        const frontendSeatId = `${row}${number}`;

        return {
          id: frontendSeatId, // ✅ Sử dụng format A1 thay vì Layout_ID
          row: row,
          number: number,
          type: mappedType,
          status: seat.status || seat.Status || 'available',
          price: seat.price || seat.Price || getFallbackPrice(mappedType),
          layoutId: seat.layoutId || seat.Layout_ID,
          position: seat.position
        };
      }) || [];


      return transformedSeats;
    } catch (error) {
      console.error('❌ Lỗi khi load seats từ API:', error);
      toast.error('Không thể tải thông tin ghế');
      return [];
    }
  }, [showtimeId]);

  /**
   * Refresh seats state
   */
  const refreshSeats = useCallback(async (): Promise<void> => {
    if (isConnected && !isFallbackMode) {
      // Nếu WebSocket connected, request từ server
      webSocketService.refreshSeatsState();
    } else {
      // Fallback: load từ API
      const apiSeats = await loadSeatsFromAPI();
      setSeats(apiSeats);
    }
  }, [isConnected, isFallbackMode, loadSeatsFromAPI]);

  /**
   * Connect to WebSocket
   */
  const connect = useCallback(async (): Promise<boolean> => {
    console.log(`🚀 Hook connect() called for showtime: ${showtimeId}`);

    const connected = await webSocketService.connect(authToken);
    console.log(`🔌 WebSocket connect result: ${connected}`);

    // 🔧 FIX: Đồng bộ state ngay sau khi connect
    setIsConnected(connected);
    setConnectionState(connected ? 'connected' : 'disconnected');
    setIsFallbackMode(!connected && enableFallback);

    if (connected) {
      // 🔧 NEW APPROACH: KHÔNG clear gì cả khi reload - chỉ join showtime
      // Để Redis làm source of truth duy nhất
      console.log(`🔌 Connected to WebSocket for showtime ${showtimeId} - NO CLEARING on reload`);

      console.log(`🎬 Calling joinShowtime for: ${showtimeId}`);
      webSocketService.joinShowtime(showtimeId);
    } else if (enableFallback) {
      console.log('📡 WebSocket failed, using fallback API');
      // Load initial seats từ API - inline để tránh dependency loop
      const apiSeats = await loadSeatsFromAPI();
      setSeats(apiSeats);
    }

    return connected;
  }, [showtimeId, authToken, enableFallback, loadSeatsFromAPI]);

  /**
   * Disconnect WebSocket
   */
  const disconnect = useCallback((): void => {

    webSocketService.disconnect();
  }, []);

  /**
   * Select seat với WebSocket hoặc fallback
   */
  const selectSeat = useCallback(async (seatId: string): Promise<void> => {
    try {
      if (isConnected && !isFallbackMode) {
        // WebSocket mode: emit event
        webSocketService.selectSeat(showtimeId, seatId, userId);
      } else {
        // Fallback mode: API call
        
        const result = await seatService.holdSeats({
          showtimeId: parseInt(showtimeId),
          seatIds: [parseInt(seatId)]
        });

        if (result.success) {
          // Update local state
          setSelectedSeats(prev => [...prev, seatId]);
          setSeats(prev => prev.map(seat => 
            seat.id === seatId 
              ? { ...seat, status: 'selected' as const }
              : seat
          ));
          toast.success(`Đã chọn ghế ${seatId}`);
        } else {
          toast.error(result.message || 'Không thể chọn ghế này');
        }
      }
    } catch (error) {
      console.error(`❌ Lỗi khi chọn ghế ${seatId}:`, error);
      toast.error('Không thể chọn ghế này');
    }
  }, [isConnected, isFallbackMode, showtimeId]);

  /**
   * Deselect seat với WebSocket hoặc fallback
   */
  const deselectSeat = useCallback(async (seatId: string): Promise<void> => {
    try {
      if (isConnected && !isFallbackMode) {
        // WebSocket mode: emit event
        webSocketService.deselectSeat(seatId, userId);

        // Update local state ngay lập tức để UI responsive
        setSelectedSeats(prev => {
          const newSeats = prev.filter(id => id !== seatId);

          // Xóa session nếu không còn ghế nào được chọn
          if (newSeats.length === 0 && showtimeId) {
            const sessionKey = `booking_session_${showtimeId}`;
            sessionStorage.removeItem(sessionKey);
            console.log(`🗑️ Cleared session (user deselected all seats): ${sessionKey}`);
          }

          return newSeats;
        });

      } else {
        // Fallback mode: API call

        const result = await seatService.releaseSeats({
          showtimeId: parseInt(showtimeId),
          seatIds: [parseInt(seatId)]
        });

        if (result.success) {
          // Update local state
          setSelectedSeats(prev => {
            const newSeats = prev.filter(id => id !== seatId);

            // Xóa session nếu không còn ghế nào được chọn
            if (newSeats.length === 0 && showtimeId) {
              const sessionKey = `booking_session_${showtimeId}`;
              sessionStorage.removeItem(sessionKey);
              console.log(`🗑️ Cleared session (user deselected all seats): ${sessionKey}`);
            }

            return newSeats;
          });

          setSeats(prev => prev.map(seat =>
            seat.id === seatId
              ? { ...seat, status: 'available' as const }
              : seat
          ));
          toast.success(`Đã bỏ chọn ghế ${seatId}`);
        } else {
          toast.error(result.message || 'Không thể bỏ chọn ghế này');
        }
      }
    } catch (error) {
      console.error(`❌ Lỗi khi bỏ chọn ghế ${seatId}:`, error);
      toast.error('Không thể bỏ chọn ghế này');
    }
  }, [isConnected, isFallbackMode, showtimeId, userId]);

  /**
   * Extend seat hold
   */
  const extendSeatHold = useCallback((seatId: string): void => {
    if (isConnected && !isFallbackMode) {

      webSocketService.extendSeatHold(seatId);
    } else {
      toast.error('Tính năng gia hạn chỉ khả dụng khi kết nối real-time');
    }
  }, [isConnected, isFallbackMode]);

  /**
   * Confirm booking
   */
  const confirmBooking = useCallback((bookingData: any): void => {
    if (isConnected && !isFallbackMode) {
      webSocketService.confirmBooking(selectedSeats, bookingData);
    } else {
      // Fallback mode sẽ sử dụng existing booking flow
    }
  }, [isConnected, isFallbackMode, selectedSeats]);

  // Setup WebSocket event listeners
  useEffect(() => {
    const handleConnectionStateChange = (state: ConnectionState) => {
      console.log(`🔌 Connection state changed: ${state}`);
      setConnectionState(state);
      setIsConnected(state === 'connected');
      setIsFallbackMode(webSocketService.isFallbackMode);

      // 🔄 Khi reconnect thành công, request fresh data từ server
      if (state === 'connected') {
        console.log(`🔄 Reconnected! Requesting fresh seats data từ server...`);
        // Delay một chút để đảm bảo WebSocket đã sẵn sàng
        setTimeout(() => {
          // Request fresh seats state từ server (bao gồm database data)
          webSocketService.requestSeatsState(showtimeId);
        }, 500);
      }
    };

    const handleSeatsState = (data: SeatsStateEvent) => {
      const seatsArray = Array.isArray(data) ? data : (data?.seats || []);

      // 🔧 FIX: Chỉ log khi có thay đổi về số lượng ghế hoặc status
      const statusCounts = seatsArray.reduce((acc, seat) => {
        const status = seat.status || 'available';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Chỉ log khi có thay đổi thực sự
      const statusKey = JSON.stringify(statusCounts);
      if (!handleSeatsState.lastStatusKey || handleSeatsState.lastStatusKey !== statusKey) {
        console.log(`🪑 [SEATS_STATE] Received ${seatsArray.length} seats from server`);
        console.log(`🔍 [SEATS_STATE] Status breakdown:`, statusCounts);
        handleSeatsState.lastStatusKey = statusKey;
      }

      // Transform server data to match our Seat interface
      const transformedSeats: Seat[] = seatsArray
        .filter(seat => seat && (seat.id || seat.seatId)) // Accept both id and seatId
        .map(seat => {
          // Create frontend seat ID from row + column (e.g., A10)
          const row = seat.row;
          const column = seat.column;
          const frontendSeatId = `${row}${column}`;

          // 🎭 Map seat types từ backend (Regular/VIP) sang frontend (standard/vip)
          const mapSeatType = (backendType: string): 'standard' | 'vip' => {
            const type = (backendType || '').toLowerCase();
            switch (type) {
              case 'vip':
                return 'vip';
              case 'regular':
              default:
                return 'standard';
            }
          };    

          const mappedType = mapSeatType(seat.type || seat.seatType || seat.Seat_Type || 'Regular');

          // 🎯 Map backend status to frontend status
          const mapSeatStatus = (backendStatus: string): 'available' | 'selected' | 'occupied' => {
            switch (backendStatus) {
              case 'selecting':
                return 'selected'; // Frontend treats 'selecting' as 'selected'
              case 'selected':
                return 'selected';
              case 'booked':
              case 'occupied':
                return 'occupied';
              case 'available':
              default:
                return 'available';
            }
          };

          const finalPrice = seat.price || seat.Price || getFallbackPrice(mappedType);

          // 🔧 FIX: Chỉ log khi có vấn đề về giá
          if (frontendSeatId === 'A6' && (!finalPrice || finalPrice < 50000)) {
            console.log(`⚠️ useWebSocket - Seat A6 Price Issue:`, {
              seatId: frontendSeatId,
              apiPrice: seat.price,
              apiPrice2: seat.Price,
              fallbackPrice: getFallbackPrice(mappedType),
              finalPrice,
              seatType: seat.type || seat.seatType || seat.Seat_Type,
              mappedType
            });
          }

          return {
            id: frontendSeatId, // Use row+column format (A10)
            row: row,
            number: column,
            type: mappedType,
            status: mapSeatStatus(seat.status || 'available'),
            price: finalPrice, // ✅ Ưu tiên giá từ API
            layoutId: seat.layoutId || seat.Layout_ID || column, // ✅ Ưu tiên Layout_ID thật từ API
          };
        });

      // 🛠️ FIX: Deduplicate seats by ID before setting
      const deduplicatedSeats = transformedSeats.filter((seat, index, arr) =>
        arr.findIndex(s => s.id === seat.id) === index
      );

      setSeats(deduplicatedSeats);

      // 🔄 QUAN TRỌNG: Sync selected seats từ server data
      // Backend trả về status 'selecting' cho ghế đang được chọn
      const serverSelectedSeats = deduplicatedSeats
        .filter(seat => seat.status === 'selecting' || seat.status === 'selected')
        .map(seat => seat.id);

      // 🎯 Phân loại ghế selected theo userId
      const currentUserId = userId || localStorage.getItem('userId');

      const currentUserSeats: string[] = [];
      const otherUserSeats: string[] = [];

      seatsArray.forEach(seat => {
        if (seat.status === 'selecting' || seat.status === 'selected') {
          const frontendSeatId = `${seat.row}${seat.column}`;
          if (String(seat.userId) === String(currentUserId)) {
            currentUserSeats.push(frontendSeatId);
          } else {
            otherUserSeats.push(frontendSeatId);
          }
        }
      });
        // 🔄 Restore ghế từ session storage nếu có (thử nhiều key patterns)
      let sessionSeats: string[] = [];

      // Thử các pattern key khác nhau
      const sessionKeys = [
        `booking_session_${showtimeId}`, // Key theo showtimeId
        `galaxy_cinema_session_${showtimeId}`, // Key localStorage
      ];

      // Tìm trong sessionStorage với các key patterns
      for (const sessionKey of sessionKeys) {
        const sessionData = sessionStorage.getItem(sessionKey);

        if (sessionData) {
          try {
            const parsed = JSON.parse(sessionData);

            if (parsed.selectedSeats && Array.isArray(parsed.selectedSeats)) {
              sessionSeats = parsed.selectedSeats
                .map((seat: any) => seat.id || seat)
                .filter((seatId: any) => seatId && seatId !== 'undefined' && typeof seatId === 'string' && seatId.length > 0);
              break;
            } else if (parsed.bookingSession?.selectedSeats && Array.isArray(parsed.bookingSession.selectedSeats)) {
              sessionSeats = parsed.bookingSession.selectedSeats
                .map((seat: any) => seat.id || seat)
                .filter((seatId: any) => seatId && seatId !== 'undefined' && typeof seatId === 'string' && seatId.length > 0);
              break;
            }
          } catch (error) {
            console.error(`❌ Error parsing session data from ${sessionKey}:`, error);
          }
        }
      }

      // Tìm trong localStorage nếu không có trong sessionStorage
      if (sessionSeats.length === 0) {
        for (const sessionKey of sessionKeys) {
          const localData = localStorage.getItem(sessionKey);
          if (localData) {
            try {
              const parsed = JSON.parse(localData);
              if (parsed.selectedSeats && Array.isArray(parsed.selectedSeats)) {
                sessionSeats = parsed.selectedSeats.map((seat: any) => seat.id || seat);
                break;
              }
            } catch (error) {
              console.error(`❌ Error parsing local data from ${sessionKey}:`, error);
            }
          }
        }
      }

      // 🚀 Kiểm tra session seats trước khi merge
      const availableSessionSeats: string[] = [];
      const occupiedSessionSeats: string[] = [];

      if (sessionSeats.length > 0 && !preventRestore) {
        // Đảm bảo có userId hợp lệ
        const currentUserId = userId || localStorage.getItem('userId');

        if (!currentUserId) {
          console.warn('⚠️ No userId available for seat restoration');
          return;
        }

        sessionSeats.forEach(seatId => {
          // 🔧 FIX: Convert object to string if needed
          let validSeatId = seatId;
          if (typeof seatId === 'object' && seatId !== null) {
            validSeatId = seatId.id || seatId.seatId || String(seatId);
            console.warn(`⚠️ Converting object seatId to string: ${JSON.stringify(seatId)} → ${validSeatId}`);
          }

          // Kiểm tra seatId hợp lệ với validation mạnh hơn
          if (!validSeatId ||
              validSeatId === 'undefined' ||
              validSeatId === showtimeId ||
              typeof validSeatId !== 'string' ||
              validSeatId.length === 0 ||
              validSeatId.includes('undefined') ||
              validSeatId === '[object Object]') {
            console.warn(`⚠️ Invalid seatId: "${validSeatId}", skipping`);
            return;
          }

          // Use validSeatId instead of seatId
          const seatInfo = transformedSeats.find(s => s.id === validSeatId);

          if (seatInfo) {
            if (seatInfo.status === 'available') {
              availableSessionSeats.push(validSeatId);
              webSocketService.selectSeat(showtimeId, validSeatId, currentUserId);
            } else if (seatInfo.status === 'occupied') {
              occupiedSessionSeats.push(validSeatId);
              // Xóa ghế đã booked khỏi session storage
              sessionStorageService.removeSelectedSeat(validSeatId, showtimeId);
            }
          }
        });
      }

      // Merge server seats với ONLY available session seats
      const mergedSeats = [...new Set([...currentUserSeats, ...availableSessionSeats])];

      setSelectedSeats(mergedSeats);
      setOtherUsersSelectedSeats(otherUserSeats);
    };

    const handleSeatSelected = (data: SeatUpdateEvent) => {


      // Update seat status
      setSeats(prev => prev.map(seat =>
        seat.id === data.seatId
          ? { ...seat, status: data.status as any }
          : seat
      ));

      // Nếu là user hiện tại chọn ghế
      const currentUserId = userId || localStorage.getItem('userId');

      if (String(data.userId) === String(currentUserId)) {
        // ✅ Validation: Kiểm tra seatId hợp lệ trước khi thêm
        if (!data.seatId ||
            data.seatId === 'undefined' ||
            typeof data.seatId !== 'string' ||
            data.seatId.length === 0 ||
            data.seatId.includes('undefined')) {
          console.warn(`⚠️ Invalid seatId: "${data.seatId}", skipping`);
          return;
        }
        setSelectedSeats(prev => {
          if (!prev.includes(data.seatId)) {
            return [...prev, data.seatId];
          }
          return prev;
        });
      } else {
        // Add to otherUsersSelectedSeats để hiển thị màu đỏ cho user khác
        setOtherUsersSelectedSeats(prev => {
          if (!prev.includes(data.seatId)) {
            return [...prev, data.seatId];
          }
          return prev;
        });
      }
    };

    const handleSeatDeselected = (data: SeatUpdateEvent) => {


      // Update seat status
      setSeats(prev => prev.map(seat =>
        seat.id === data.seatId
          ? { ...seat, status: 'available' as any }
          : seat
      ));

      const currentUserId = userId || localStorage.getItem('userId');

      if (String(data.userId) === String(currentUserId)) {
        // Remove from my selected seats
        setSelectedSeats(prev => {
          const filtered = prev.filter(id => id !== data.seatId);

          return filtered;
        });
      } else {
        // Remove from other users' selected seats
        setOtherUsersSelectedSeats(prev => {
          const filtered = prev.filter(id => id !== data.seatId);

          return filtered;
        });
      }
    };

    const handleSeatExpirationWarning = (data: SeatExpirationWarning) => {

      setExpiringSeats(prev => new Map(prev.set(data.seatId, data.timeRemaining)));
    };

    const handleSeatHoldExtended = (data: { seatId: string; newExpiresAt: string }) => {

      setExpiringSeats(prev => {
        const newMap = new Map(prev);
        newMap.delete(data.seatId);
        return newMap;
      });
    };

    const handleCrossTabSeatUpdate = (data: any) => {
      console.log(`🔧 [CROSS_TAB_HANDLER] Received cross-tab event:`, data);

      // 🔧 FIX: Lấy userId từ nhiều nguồn như webSocketService
      const currentUserId = userId ||
                           localStorage.getItem('userId') ||
                           localStorage.getItem('user')?.replace(/['"]/g, '') ||
                           sessionStorage.getItem('userId');

      console.log(`🔧 [CROSS_TAB_HANDLER] Current user ID: ${currentUserId}, Event user ID: ${data.userId}`);

      // Only log important cross-tab events
      if (data.seatId !== 'CLEAR_ALL' && !data.test) {
        console.log(`📡 [CROSS_TAB_HANDLER] Processing cross-tab ${data.action}: ${data.seatId} (user ${data.userId})`);
      }

      // 🔄 ENABLED: Handle cancel booking cross-tab signal
      if (data.action === 'cancel_booking' || (data.seatId === 'CANCEL_BOOKING' && data.action === 'cancel_booking')) {
        console.log(`🔄 [CROSS_TAB_HANDLER] Processing cancel booking signal from user ${data.userId}`);

        // Force refresh seats state from server for all users
        if (webSocketService.isConnected) {
          console.log(`🔄 [CROSS_TAB_HANDLER] Requesting fresh seats state after cancel booking`);
          webSocketService.requestSeatsState(showtimeId);
        }
        return;
      }

      // 🚫 DISABLED: CLEAR_ALL cross-tab handler để tránh clear ghế của user khác (except cancel booking)
      if (data.seatId === 'CLEAR_ALL' && data.action === 'deselected') {
        console.log(`🚫 [CROSS_TAB_HANDLER] CLEAR_ALL signal ignored to preserve seats`);
        return; // Ignore all CLEAR_ALL signals
      }

      if (data.action === 'selected') {
        console.log(`🔄 [CROSS_TAB_HANDLER] Processing seat selection: ${data.seatId}`);

        if (String(data.userId) === String(currentUserId)) {
          // ✅ Validation: Kiểm tra seatId hợp lệ trước khi xử lý cross-tab
          if (!data.seatId ||
              data.seatId === 'undefined' ||
              typeof data.seatId !== 'string' ||
              data.seatId.length === 0 ||
              data.seatId.includes('undefined')) {
            console.warn(`⚠️ [CROSS_TAB_HANDLER] Invalid seatId: "${data.seatId}", skipping`);
            return;
          }

          // Same user selecting from another tab - mark as selected (yellow)
          console.log(`👤 [CROSS_TAB_HANDLER] Same user selecting seat ${data.seatId} from another tab`);
          setSeats(prev => prev.map(seat =>
            seat.id === data.seatId
              ? { ...seat, status: 'selected', userId: data.userId }
              : seat
          ));

          setSelectedSeats(prev => {
            if (!prev.includes(data.seatId)) {
              console.log(`✅ [CROSS_TAB_HANDLER] Adding seat ${data.seatId} to current user's selection`);
              return [...prev, data.seatId];
            }
            return prev;
          });
        } else {
          // Different user selecting - mark as selecting (red)
          console.log(`👥 [CROSS_TAB_HANDLER] Different user selecting seat ${data.seatId}`);
          setSeats(prev => prev.map(seat =>
            seat.id === data.seatId
              ? { ...seat, status: 'selecting', userId: data.userId }
              : seat
          ));

          setOtherUsersSelectedSeats(prev => {
            if (!prev.includes(data.seatId)) {
              console.log(`🔴 [CROSS_TAB_HANDLER] Adding seat ${data.seatId} to other users' selection`);
              return [...prev, data.seatId];
            }
            return prev;
          });
        }
      } else if (data.action === 'deselected') {
        console.log(`🔄 [CROSS_TAB_HANDLER] Processing seat deselection: ${data.seatId}`);

        // Always set seat back to available
        setSeats(prev => prev.map(seat =>
          seat.id === data.seatId
            ? { ...seat, status: 'available', userId: null }
            : seat
        ));

        if (String(data.userId) === String(currentUserId)) {
          console.log(`👤 [CROSS_TAB_HANDLER] Same user deselecting seat ${data.seatId} from another tab`);
          setSelectedSeats(prev => {
            const filtered = prev.filter(id => id !== data.seatId);
            console.log(`✅ [CROSS_TAB_HANDLER] Removing seat ${data.seatId} from current user's selection`);
            return filtered;
          });
        } else {
          console.log(`👥 [CROSS_TAB_HANDLER] Different user deselecting seat ${data.seatId}`);
          setOtherUsersSelectedSeats(prev => {
            const filtered = prev.filter(id => id !== data.seatId);
            console.log(`🔴 [CROSS_TAB_HANDLER] Removing seat ${data.seatId} from other users' selection`);
            return filtered;
          });
        }
      }
    };

    const handleSeatBooked = (data: { seatId: string; bookingId: string }) => {
      console.log(`🔴 Ghế ${data.seatId} đã được booking #${data.bookingId}`);

      // Cập nhật trạng thái ghế thành "occupied" (đỏ)
      setSeats(prev => prev.map(seat =>
        seat.id === data.seatId
          ? { ...seat, status: 'occupied' as const }
          : seat
      ));

      // Loại bỏ khỏi selectedSeats và otherUsersSelectedSeats
      setSelectedSeats(prev => prev.filter(id => id !== data.seatId));
      setOtherUsersSelectedSeats(prev => prev.filter(id => id !== data.seatId));
    };

    // Register event listeners
    webSocketService.on('connection-state-changed', handleConnectionStateChange);
    webSocketService.on('seats-state', handleSeatsState);
    webSocketService.on('seat-selected', handleSeatSelected);
    webSocketService.on('seat-deselected', handleSeatDeselected);
    webSocketService.on('seat-released', handleSeatDeselected); // 🔄 Handle seat release (same as deselect)
    webSocketService.on('seat-booked', handleSeatBooked); // 🔴 Handle booking
    webSocketService.on('seat-expiration-warning', handleSeatExpirationWarning);
    webSocketService.on('seat-hold-extended', handleSeatHoldExtended);
    webSocketService.on('cross-tab-seat-update', handleCrossTabSeatUpdate); // 🔄 Cross-tab sync

    console.log(`✅ WebSocket event listeners registered`);

    // ❌ KHÔNG auto connect ở đây để tránh duplicate connection

    // Cleanup function
    return () => {
      webSocketService.off('connection-state-changed', handleConnectionStateChange);
      webSocketService.off('seats-state', handleSeatsState);
      webSocketService.off('seat-selected', handleSeatSelected);
      webSocketService.off('seat-deselected', handleSeatDeselected);
      webSocketService.off('seat-released', handleSeatDeselected); // 🔄 Cleanup seat-released listener
      webSocketService.off('seat-booked', handleSeatBooked); // 🔴 Cleanup booking handler
      webSocketService.off('seat-expiration-warning', handleSeatExpirationWarning);
      webSocketService.off('seat-hold-extended', handleSeatHoldExtended);
      webSocketService.off('cross-tab-seat-update', handleCrossTabSeatUpdate); // 🔄 Cross-tab cleanup
    };
  }, []);

  // 🔥 FORCE AUTO-CONNECT - Luôn tự động kết nối trong mọi trường hợp
  useEffect(() => {
    if (showtimeId) {
      // Kiểm tra nếu chưa connected hoặc connected với showtime khác
      const needsConnection = !webSocketService.isConnected ||
                             webSocketService.getCurrentShowtimeId !== showtimeId;

      if (needsConnection) {
        console.log(`🚀 Force auto-connecting to showtime ${showtimeId}`);

        // Disconnect trước nếu đã connected với showtime khác
        if (webSocketService.isConnected && webSocketService.getCurrentShowtimeId !== showtimeId) {

          webSocketService.disconnect();
        }

        connect();
      }
    }
  }, [showtimeId, connect]); // Thêm connect vào dependencies

  // 🔧 FIX: Listen for connection state changes from WebSocket service
  useEffect(() => {
    const handleConnectionStateChange = (event: MessageEvent) => {
      if (event.data?.type === 'CONNECTION_STATE_CHANGE') {
        const { state, isConnected: connected } = event.data;
        console.log(`📡 [HOOK] Received connection state change: ${state}, connected: ${connected}`);

        setIsConnected(connected);
        setConnectionState(state);
        setIsFallbackMode(!connected && enableFallback);
      }
    };

    // Listen to BroadcastChannel for connection state changes
    const channel = new BroadcastChannel('galaxy_cinema_websocket');
    channel.addEventListener('message', handleConnectionStateChange);

    return () => {
      channel.removeEventListener('message', handleConnectionStateChange);
      channel.close();
    };
  }, [enableFallback]);

  // 🔥 BACKUP AUTO-CONNECT - Kết nối lại nếu bị disconnect
  useEffect(() => {
    if (showtimeId && !isConnected && connectionState === 'disconnected') {
      console.log(`🔄 Backup auto-connect: WebSocket disconnected, reconnecting...`);
      const timer = setTimeout(() => {
        connect();
      }, 1000); // Delay 1s để tránh spam

      return () => clearTimeout(timer);
    }
  }, [isConnected, connectionState, showtimeId, connect]);

  useEffect(() => {
    if (showtimeId && selectedSeats.length > 0) {
      const sessionKey = `booking_session_${showtimeId}`;
      const sessionData = {
        selectedSeats: selectedSeats,
        showtimeId: showtimeId,
        timestamp: Date.now()
      };

      sessionStorage.setItem(sessionKey, JSON.stringify(sessionData));
    }
  }, [selectedSeats, showtimeId]);

  // 🔧 FIX: KHÔNG cleanup WebSocket khi component unmount
  // Vì khi chuyển từ SeatSelection sang PaymentComponent, chúng ta vẫn muốn giữ connection
  // Chỉ cleanup khi thực sự cần thiết (ví dụ: user rời khỏi trang booking hoàn toàn)
  useEffect(() => {
    return () => {
      // ❌ KHÔNG cleanup WebSocket ở đây để tránh disconnect khi chuyển view
      console.log('🔄 [HOOK_CLEANUP] useWebSocket hook unmounting - preserving WebSocket connection');
    };
  }, [userId]);

  // 🔧 FIX: Force reconnect function
  const forceReconnect = useCallback(async () => {
    console.log(`🔄 [FORCE_RECONNECT] Starting force reconnect for showtime: ${showtimeId}`);

    try {
      // 1. Disconnect first
      await webSocketService.disconnect();

      // 2. Wait a bit
      await new Promise(resolve => setTimeout(resolve, 500));

      // 3. Reconnect
      const result = await webSocketService.connect();

      console.log(`✅ [FORCE_RECONNECT] Force reconnect completed: ${result}`);
      return result;
    } catch (error) {
      console.error(`❌ [FORCE_RECONNECT] Force reconnect failed:`, error);
      throw error;
    }
  }, [showtimeId]);

  return {
    // Connection state
    isConnected,
    connectionState,
    isFallbackMode,

    // Seat management
    seats,
    selectedSeats,
    otherUsersSelectedSeats,
    expiringSeats,

    // Actions
    selectSeat,
    deselectSeat,
    extendSeatHold,
    refreshSeats,

    // Connection management
    connect,
    disconnect,
    forceReconnect,

    // Booking
    confirmBooking,

    // Session management
    setPreventRestore
  };
};

export default useWebSocket;
  
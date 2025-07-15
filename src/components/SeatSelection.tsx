// components/SeatSelection.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeftIcon, ClockIcon, WifiIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import type { Seat, CinemaRoom, BookingSession, BookingStep } from "../types";
import { generateSeatGrid, findBestSeats } from "../utils/seatRecommendations";
import FullScreenLoader from "./FullScreenLoader";
import BookingProgress from "./BookingProgress";
import { translateSeatType } from "../utils/seatTypeTranslator";
import { useWebSocket } from "../hooks/useWebSocket";
import { toast } from "react-hot-toast";
import { useAuth } from "../contexts/SimpleAuthContext";

interface SeatSelectionProps {
  room: CinemaRoom;
  onSeatsChange: (seats: Seat[]) => void;
  onNext: () => void;
  onBack: () => void;
  bookingSession: BookingSession;
  bookingSteps: BookingStep[];
  currentStep: number;
  seats?: Seat[];
  movieDetails?: {
    title: string;
    poster: string;
    language: string;
    format: string;
    cinema: string;
    date: string;
    time: string;
  };
}

const SeatSelection: React.FC<SeatSelectionProps> = ({
  room,
  onSeatsChange,
  onNext,
  onBack,
  bookingSession,
  bookingSteps,
  currentStep,
  seats = [],
  movieDetails = {
    title: "Sonic The Hedgehog 2",
    poster:
      "https://m.media-amazon.com/images/M/MV5BMGI1NjA1MjUtNGQxYS00ZGI5LTlkMzUtZDAwM2EwZjRiY2NkXkEyXkFqcGdeQXVyMTM0NTUzNDIy._V1_.jpg",
    language: "ENG",
    format: "4DX Dolby Atmos",
    cinema: "Mall of Tripla",
    date: "27.04.2022",
    time: "18:35",
  },
}) => {
  // Auth context
  const { user } = useAuth();

  // 🔄 THAY ĐỔI: Disable WebSocket, sử dụng polling mode
  const {
    isConnected,
    connectionState,
    isFallbackMode,
    seats: webSocketSeats,
    selectedSeats: webSocketSelectedSeats,
    otherUsersSelectedSeats,
    expiringSeats,
    selectSeat: webSocketSelectSeat,
    deselectSeat: webSocketDeselectSeat,
    extendSeatHold,
    refreshSeats,
    connect,
    disconnect,
    forceReconnect,
  } = useWebSocket({
    showtimeId: bookingSession.showtimeId?.toString() || "1",
    autoConnect: true, // ✅ Enable auto connect để join showtime
    enableFallback: true,
    userId: user?.id ? String(user.id) : undefined,
  });

  // 🔍 Debug WebSocket connection (only log when connection state changes)
  useEffect(() => {
    console.log(`🔌 SeatSelection WebSocket: ${isConnected ? "Connected" : "Disconnected"} (${connectionState})`);
  }, [isConnected, connectionState]);

  // 🔧 ENHANCED: Listen for reset-selections event from BookingPage
  useEffect(() => {
    const handleResetSelections = (event: CustomEvent) => {
      const { seatIds } = event.detail || {};

      if (Array.isArray(seatIds) && seatIds.length > 0) {
        console.log(`🔄 [SEAT_SELECTION] Received reset-selections event for seats: ${seatIds.join(', ')}`);

        // Force refresh seats from server to get latest state
        console.log('🔄 [SEAT_SELECTION] Force refreshing seats from server...');
        refreshSeats();

        console.log('✅ [SEAT_SELECTION] Seats refresh triggered');
      }
    };

    // Add event listener
    window.addEventListener('galaxy-cinema-reset-selections', handleResetSelections as EventListener);

    // Cleanup
    return () => {
      window.removeEventListener('galaxy-cinema-reset-selections', handleResetSelections as EventListener);
    };
  }, [refreshSeats]);

  // 🔥 FORCE CONNECT - Luôn đảm bảo WebSocket kết nối
  useEffect(() => {
    if (bookingSession.showtimeId) {
      console.log(`🚀 SeatSelection mounted, ensuring WebSocket connection...`);

      // Immediate check và connect
      const checkAndConnect = () => {
        if (!isConnected && connectionState !== "connecting" && connectionState !== "reconnecting") {
          console.log(`🔄 Force connecting WebSocket...`);
          connect();
        }
      };

      // Check ngay lập tức
      checkAndConnect();

      // Check lại sau 100ms để đảm bảo
      const timer1 = setTimeout(checkAndConnect, 100);

      // Check lại sau 500ms nếu vẫn chưa connect
      const timer2 = setTimeout(checkAndConnect, 500);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, []); // Chỉ chạy khi component mount

  // 🔥 CONTINUOUS CHECK - Kiểm tra liên tục và reconnect nếu cần
  useEffect(() => {
    if (bookingSession.showtimeId && !isConnected && connectionState === "disconnected") {
      console.log(`🔄 WebSocket disconnected, attempting reconnect...`);
      const timer = setTimeout(() => {
        connect();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isConnected, connectionState, connect]);

  // 🔧 FIX: Auto-reconnect WebSocket khi bị disconnect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isConnected && bookingSession.showtimeId) {
        console.log(`🔄 Auto-reconnecting WebSocket (disconnected state detected)`);
        console.log(`📊 Connection state: ${connectionState}, Fallback mode: ${isFallbackMode}`);
        connect();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [isConnected, bookingSession.showtimeId, connectionState, isFallbackMode, connect]);

  // 🔧 FIX: Periodic connection check để đảm bảo WebSocket luôn connected
  useEffect(() => {
    if (!bookingSession.showtimeId) return;

    const intervalId = setInterval(() => {
      if (!isConnected && connectionState !== "connecting" && connectionState !== "reconnecting") {
        console.log(`🔄 Periodic check: WebSocket disconnected, attempting reconnect...`);
        console.log(
          `📊 Current state - Connected: ${isConnected}, State: ${connectionState}, Fallback: ${isFallbackMode}`
        );
        connect();
      }
    }, 3000); // Giảm xuống 3 giây để reconnect nhanh hơn

    return () => clearInterval(intervalId);
  }, [isConnected, connectionState, bookingSession.showtimeId, isFallbackMode, connect]);

  // 🔧 FIX: Force reconnect khi có forceReconnect trigger từ BookingPage
  useEffect(() => {
    if (bookingSession.forceReconnect && bookingSession.showtimeId) {
      console.log(`🔄 Force reconnecting WebSocket (triggered by booking cancellation)`);

      // 🚨 CHỈ reconnect 1 lần, không cascade
      const timer = setTimeout(async () => {
        try {
          console.log(`🔄 Single force reconnect after booking cancellation`);
          await forceReconnect();
        } catch (error) {
          console.error(`❌ Error during force reconnect:`, error);
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [bookingSession.forceReconnect]); // 🚨 CHỈ depend on forceReconnect trigger

  // Local state
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [seatLayout, setSeatLayout] = useState<Seat[][]>([]);

  // Optimistic updates - ghế được chọn ngay lập tức trước khi server response
  const [optimisticSelectedSeats, setOptimisticSelectedSeats] = useState<string[]>([]);

  // 🔧 FIX: Đơn giản hóa sync logic - không tự động remove optimistic updates
  // Chỉ sync khi cần thiết và không gây conflict với user actions

  // 🔧 FIX: Ưu tiên webSocketSeats để có dữ liệu realtime, fallback về props seats
  const currentSeats = webSocketSeats.length > 0 ? webSocketSeats : seats;

  // 🪑 Only log when seat source changes
  const prevSeatsLength = useRef(currentSeats.length);
  useEffect(() => {
    if (prevSeatsLength.current !== currentSeats.length) {
      console.log(`🪑 Seats updated: ${currentSeats.length} seats (${seats.length > 0 ? "API" : "WebSocket"})`);
      prevSeatsLength.current = currentSeats.length;
    }
  }, [currentSeats.length, seats.length]);

  // 🚨 DISABLED: Tránh cascade reconnections khi hủy booking
  // useEffect(() => {
  //   if (!isConnected && currentSeats.length > 0 && bookingSession.showtimeId) {
  //     console.log(`🔄 Reconnecting WebSocket after seats update`);
  //     const timer = setTimeout(async () => {
  //       try {
  //         await forceReconnect();
  //       } catch (error) {
  //         console.error(`❌ Error reconnecting after seats update:`, error);
  //         connect(); // Fallback
  //       }
  //     }, 1000);
  //     return () => clearTimeout(timer);
  //   }
  // }, [currentSeats.length, isConnected, connectionState, bookingSession.showtimeId, connect, forceReconnect]);

  // 🔧 FIX: Ưu tiên optimistic updates để có phản hồi ngay lập tức
  const allSelectedSeatIds =
    optimisticSelectedSeats.length > 0
      ? optimisticSelectedSeats
      : isConnected && !isFallbackMode
      ? webSocketSelectedSeats
      : [];

  // 🎯 Only log when selected seats change
  const prevSelectedCount = useRef(allSelectedSeatIds.length);
  useEffect(() => {
    if (prevSelectedCount.current !== allSelectedSeatIds.length) {
      console.log(`🎯 Selected seats: ${allSelectedSeatIds.length} (${allSelectedSeatIds.join(", ")})`);
      prevSelectedCount.current = allSelectedSeatIds.length;
    }
  }, [allSelectedSeatIds.length]);

  // 🔍 Debug: Check if A10 is in selected seats
  if (allSelectedSeatIds.includes("A10")) {
    console.log(`⚠️ A10 is still in allSelectedSeatIds - will be filtered out if occupied`);
  }

  // 🔧 FIX: Sử dụng currentSeats (từ API) để có thông tin đầy đủ về status
  const rawSelectedSeats =
    isConnected && !isFallbackMode
      ? currentSeats.filter((seat) => allSelectedSeatIds.includes(seat.id))
      : bookingSession.selectedSeats;

  // 🛠️ FIX: Loại bỏ ghế đã occupied/booked khỏi selected seats
  const filteredSelectedSeats = rawSelectedSeats.filter((seat) => {
    const isOccupied = seat.status === "occupied" || seat.status === "booked";
    if (isOccupied) {
      console.log(`🚫 Removing occupied seat ${seat.id} from selected seats`);
    }
    return !isOccupied;
  });

  // 🛠️ FIX: Deduplicate currentSelectedSeats by ID
  const currentSelectedSeats = filteredSelectedSeats.filter(
    (seat, index, arr) => arr.findIndex((s) => s.id === seat.id) === index
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const seatMapRef = useRef<HTMLDivElement>(null);

  const MAX_SEATS = 8;
  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 1.5;

  // Removed countdown timer logic

  useEffect(() => {
    const processSeats = async () => {
      try {
        setLoading(true);

        if (currentSeats && currentSeats.length > 0) {
          const seatsByRow: Record<string, Seat[]> = {};
          currentSeats.forEach((seat) => {
            if (!seatsByRow[seat.row]) {
              seatsByRow[seat.row] = [];
            }
            seatsByRow[seat.row].push(seat);
          });

          const rows = Object.keys(seatsByRow).sort();

          // 🔧 FIX: Tìm số cột tối đa trong từng hàng, sau đó lấy max của tất cả hàng
          const maxColsPerRow = rows.map(row => {
            const rowSeats = seatsByRow[row];
            return Math.max(...rowSeats.map(seat => seat.number));
          });
          const maxColsInRoom = Math.max(...maxColsPerRow);

          const generatedLayout = rows.map((row) => {
            const rowSeats = seatsByRow[row].sort((a, b) => a.number - b.number);
            const fullRowSeats: Seat[] = [];

            // 🔧 FIX: Luôn tạo đủ số cột theo maxColsInRoom để tất cả hàng có cùng số cột
            for (let i = 1; i <= maxColsInRoom; i++) {
              const existingSeat = rowSeats.find((s) => s.number === i);
              if (existingSeat) {
                fullRowSeats.push(existingSeat);
              } else {
                // Tạo placeholder seat cho ghế bị ẩn/missing - hiển thị khoảng trống
                fullRowSeats.push({
                  id: `${row}-${i}-hidden`,
                  row: row,
                  number: i,
                  type: "hidden",
                  status: "hidden",
                  price: 0,
                  layoutId: -1,
                });
              }
            }


            return fullRowSeats;
          });

          setSeatLayout(generatedLayout);
        } else {
          console.log("Không có dữ liệu ghế, tạo layout mẫu");
          const mockRoom = generateSeatGrid(8, [12, 14, 14, 16, 16, 14, 14, 12]);
          setSeatLayout(mockRoom.layout);
        }

        setLoading(false);
      } catch (err) {
        console.error("Lỗi khi xử lý dữ liệu ghế:", err);
        setError("Không thể tải sơ đồ phòng chiếu.");
        setLoading(false);
      }
    };

    processSeats();
  }, [currentSeats, bookingSession.showtimeId, isConnected, isFallbackMode]);

  // 💾 Sync webSocketSelectedSeats với optimisticSelectedSeats khi mount/restore
  // 🔧 FIX: Chỉ restore khi component mount lần đầu, không restore khi user đang thao tác
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    if (!hasInitialized && webSocketSelectedSeats.length > 0 && optimisticSelectedSeats.length === 0) {
      console.log(`💾 Restoring ${webSocketSelectedSeats.length} seats from session:`, webSocketSelectedSeats);
      setOptimisticSelectedSeats(webSocketSelectedSeats);
      setHasInitialized(true);
    } else if (!hasInitialized && webSocketSelectedSeats.length === 0) {
      // Nếu không có ghế nào trong session, đánh dấu đã khởi tạo
      setHasInitialized(true);
    }
  }, [webSocketSelectedSeats, optimisticSelectedSeats.length, hasInitialized]);

  // Sync selected seats với parent component
  useEffect(() => {
    if (typeof onSeatsChange === "function") {
      onSeatsChange(currentSelectedSeats);
    }
  }, [currentSelectedSeats, onSeatsChange]);

  // Add Material Symbols stylesheet with thinner weight
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,200,0,-25&icon_names=weekend";
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // Removed formatTime function since countdown timer is removed

  const handleSeatClick = useCallback(
    async (seat: Seat) => {
      console.log(`🎯 handleSeatClick called for seat: ${seat.id}, status: ${seat.status}`);

      // Không cho phép click vào ghế đã bị chiếm hoặc bảo trì
      if (seat.status === "occupied" || seat.status === "maintenance" || seat.status === "hidden") {
        console.log(`❌ Seat ${seat.id} không thể click: ${seat.status}`);
        return;
      }

      // 🔴 Kiểm tra nếu ghế đang được user khác chọn (real-time)
      if (isConnected && !isFallbackMode && otherUsersSelectedSeats.includes(seat.id)) {
        toast.error("Ghế này đang được người khác chọn");
        return;
      }

      // Legacy check for seat.status === 'selected' (fallback)
      if (isConnected && !isFallbackMode && seat.status === "selected") {
        const isMySelection = webSocketSelectedSeats.includes(seat.id);
        if (!isMySelection) {
          toast.error("Ghế này đang được người khác chọn");
          return;
        }
      }

      const isCurrentlySelected = currentSelectedSeats.some((s) => s.id === seat.id);

      // Kiểm tra giới hạn số ghế
      if (!isCurrentlySelected && currentSelectedSeats.length >= MAX_SEATS) {
        toast.warning(`Bạn chỉ có thể chọn tối đa ${MAX_SEATS} ghế`);
        return;
      }

      try {
        if (isCurrentlySelected) {
          // Bỏ chọn ghế - Optimistic update ngay lập tức
          console.log(`🔄 Deselecting seat: ${seat.id}`);
          console.log(
            `📊 Before deselect - optimistic: [${optimisticSelectedSeats.join(
              ", "
            )}], webSocket: [${webSocketSelectedSeats.join(", ")}]`
          );
          setOptimisticSelectedSeats((prev) => {
            const newSeats = prev.filter((id) => id !== seat.id);
            console.log(`📊 After optimistic deselect: [${newSeats.join(", ")}]`);
            return newSeats;
          });

          // Sau đó gửi WebSocket
          await webSocketDeselectSeat(seat.id);
          console.log(`✅ WebSocket deselect completed for: ${seat.id}`);
        } else {
          // Chọn ghế - Optimistic update ngay lập tức
          console.log(`🔄 Selecting seat: ${seat.id}`);
          console.log(
            `📊 Before select - optimistic: [${optimisticSelectedSeats.join(
              ", "
            )}], webSocket: [${webSocketSelectedSeats.join(", ")}]`
          );
          setOptimisticSelectedSeats((prev) => {
            const newSeats = [...prev, seat.id];
            console.log(`📊 After optimistic select: [${newSeats.join(", ")}]`);
            return newSeats;
          });

          // Sau đó gửi WebSocket
          await webSocketSelectSeat(seat.id);
          console.log(`✅ WebSocket select completed for: ${seat.id}`);
        }
      } catch (error) {
        console.error("❌ Lỗi khi xử lý seat selection:", error);

        // Rollback optimistic update nếu có lỗi
        if (isCurrentlySelected) {
          setOptimisticSelectedSeats((prev) => [...prev, seat.id]);
        } else {
          setOptimisticSelectedSeats((prev) => prev.filter((id) => id !== seat.id));
        }

        toast.error("Không thể thực hiện thao tác này");
      }
    },
    [
      isConnected,
      isFallbackMode,
      webSocketSelectedSeats,
      currentSelectedSeats,
      webSocketSelectSeat,
      webSocketDeselectSeat,
      optimisticSelectedSeats,
    ]
  );

  const getSeatColor = (seat: Seat) => {
    // 🔧 FIX: Ưu tiên WebSocket seats state thay vì props seats
    // Tìm seat tương ứng trong WebSocket seats
    const webSocketSeat = webSocketSeats.find((ws) => ws.id === seat.id);
    const effectiveSeat = webSocketSeat || seat;

    // 🔴 QUAN TRỌNG: Nếu ghế đã occupied/booked, luôn hiển thị màu đỏ
    if (effectiveSeat.status === "occupied" || effectiveSeat.status === "booked") {
      return "text-red-400";
    }

    const isOptimisticSelection = optimisticSelectedSeats.includes(seat.id);
    const isWebSocketSelection = webSocketSelectedSeats.includes(seat.id);

    // Ưu tiên optimistic updates (chỉ khi ghế chưa occupied)
    const isMySelection =
      isOptimisticSelection ||
      (!isOptimisticSelection && isWebSocketSelection && isConnected) ||
      (!isConnected && currentSelectedSeats.some((s) => s.id === seat.id));

    const isExpiring = expiringSeats.has(seat.id);

    // Check if seat is selected by another user via WebSocket
    const isSelectedByOther =
      isConnected && !isFallbackMode && otherUsersSelectedSeats.includes(seat.id) && !isMySelection;

    // 🟡 Ghế đang được tôi chọn (màu vàng với hiệu ứng) - chỉ khi chưa occupied
    if (isMySelection) {
      return isExpiring
        ? "text-orange-400 animate-pulse drop-shadow-[0_0_4px_rgba(251,146,60,0.6)]" // Ghế sắp hết hạn
        : "text-[#FFD875] drop-shadow-[0_0_4px_rgba(255,216,117,0.6)]"; // Ghế đã chọn với glow effect nhẹ hơn
    }

    // 🔴 Ghế được người khác chọn (màu đỏ với hiệu ứng)
    if (isSelectedByOther) {
      return "text-red-500 drop-shadow-[0_0_3px_rgba(239,68,68,0.5)]"; // Màu đỏ với glow nhẹ hơn
    }

    switch (seat.status) {
      case "maintenance":
        return "text-slate-500 opacity-50"; // Ghế bảo trì
      case "hidden":
        return "text-transparent"; // Ẩn ghế
      case "available":
        switch (seat.type) {
          case "vip":
            return "text-purple-500 hover:text-purple-400 hover:drop-shadow-[0_0_3px_rgba(168,85,247,0.5)] transition-all duration-200 cursor-pointer";
          case "couple":
            return "text-pink-500 hover:text-pink-400 hover:drop-shadow-[0_0_3px_rgba(236,72,153,0.5)] transition-all duration-200 cursor-pointer";
          default:
            return "text-green-500 hover:text-green-400 hover:drop-shadow-[0_0_3px_rgba(34,197,94,0.5)] transition-all duration-200 cursor-pointer";
        }
      default:
        return "text-slate-600";
    }
  };

  const handleContinue = () => {
    if (currentSelectedSeats.length === 0) {
      toast.warning("Vui lòng chọn ít nhất một ghế.");
      return;
    }

    // Kiểm tra nếu có ghế sắp hết hạn
    const hasExpiringSeats = currentSelectedSeats.some((seat) => expiringSeats.has(seat.id));
    if (hasExpiringSeats) {
      toast.warning("Một số ghế sắp hết hạn. Vui lòng gia hạn hoặc chọn ghế khác.");
      return;
    }

    console.log(
      "✅ Tiếp tục với ghế đã chọn:",
      currentSelectedSeats.map((s) => s.id)
    );
    onNext();
  };

  const totalPrice = currentSelectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  if (loading) return <FullScreenLoader />;
  if (error) return <div className="text-center text-red-400">{error}</div>;

  return (
    <div className="text-white container mx-auto px-4">
      {/* Horizontally aligned header with movie title, progress bar, and timer */}
      <div className="flex items-center justify-between py-3 mt-14">
        {/* Left: Movie title and back button */}
        <div className="flex items-center w-1/4">
          <button
            onClick={onBack}
            className="text-white hover:text-[#FFD875] transition-colors p-1 rounded-full bg-white/10 hover:bg-white/20 mr-3"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">{movieDetails.title}</h1>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="px-2 py-0.5 bg-white/10 rounded text-xs font-medium text-gray-300">
                {movieDetails.language}
              </span>
              <span className="px-2 py-0.5 bg-white/10 rounded text-xs font-medium text-gray-300">
                {movieDetails.format}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Progress indicator - Loại bỏ để tránh hiển thị hai thanh tiến trình */}
        <div className="w-2/4">{/* BookingProgress đã được loại bỏ */}</div>

        {/* Right: Connection Status & Actions */}
        <div className="text-right w-1/4 flex justify-end items-center gap-3">
          {/* Connection Status Indicator */}
          <div className="flex items-center gap-2">
            {isConnected ? (
              <div className="flex items-center gap-1 text-green-400">
                <WifiIcon className="w-4 h-4" />
                <span className="text-xs">Real-time</span>
              </div>
            ) : isFallbackMode ? (
              <div className="flex items-center gap-1 text-yellow-400">
                <ExclamationTriangleIcon className="w-4 h-4" />
                <span className="text-xs">Offline</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-gray-400">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                <span className="text-xs">Connecting...</span>
              </div>
            )}
          </div>

          {/* Refresh Button */}
          <button
            onClick={refreshSeats}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
            title="Refresh seats"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Main grid với responsive design cải thiện */}
      <div className="grid grid-cols-1 xl:grid-cols-4 lg:grid-cols-3 gap-4 lg:gap-6 mt-4">
        {/* Left side: Seat Map với responsive layout */}
        <div className="xl:col-span-3 lg:col-span-2 order-2 lg:order-1">
          {/* Enhanced Curved Screen với hiệu ứng cải thiện */}
          <div className="relative flex justify-center mb-6">
            <div className="w-full max-w-3xl mx-auto text-center">
              {/* Screen Container with Enhanced Perspective */}
              <div className="relative" style={{ perspective: "1000px" }}>
                {/* Curved Screen với hiệu ứng 3D */}
                <div
                  className="h-12 mx-auto relative overflow-hidden"
                  style={{
                    width: "85%",
                    borderBottomLeftRadius: "60%",
                    borderBottomRightRadius: "60%",
                    background:
                      "linear-gradient(to bottom, rgba(255,216,117,0.2), rgba(255,216,117,0.05), transparent)",
                    transform: "rotateX(65deg)",
                    transformOrigin: "top center",
                    boxShadow: "0 10px 40px rgba(255, 216, 117, 0.3)",
                  }}
                >
                  {/* Glowing Edge với hiệu ứng mạnh hơn */}
                  <div
                    className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-transparent via-[#FFD875] to-transparent"
                    style={{
                      borderRadius: "100%",
                      boxShadow: `
                        0 0 20px 5px rgba(255, 216, 117, 1),
                        0 0 40px 15px rgba(255, 216, 117, 0.8),
                        0 0 60px 25px rgba(255, 216, 117, 0.6),
                        0 0 80px 35px rgba(255, 216, 117, 0.4),
                        0 0 100px 45px rgba(255, 216, 117, 0.2)
                      `,
                    }}
                  ></div>

                  {/* Reflection effect */}
                  <div
                    className="absolute top-1 left-2 right-2 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    style={{ borderRadius: "100%" }}
                  ></div>
                </div>
              </div>

              {/* Screen label với hiệu ứng */}
              <div className="mt-2 relative">
                <div className="text-sm font-bold text-[#FFD875] tracking-[0.3em] drop-shadow-lg">MÀN HÌNH</div>
                <div className="absolute inset-0 text-sm font-bold text-[#FFD875] tracking-[0.3em] blur-sm opacity-50">
                  MÀN HÌNH
                </div>
              </div>
            </div>
          </div>

          {/* Seat Map Container - Responsive height */}
          <div
            ref={containerRef}
            className="relative overflow-hidden -mt-2"
            style={{
              height: window.innerWidth < 768 ? "400px" : window.innerWidth < 1024 ? "450px" : "480px",
            }}
          >
            <div
              ref={seatMapRef}
              className="absolute inset-0 flex flex-col items-center justify-center transition-transform duration-300"
              style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }}
            >
              <div className="flex flex-col items-center gap-0.5">
                {/* Header với số cột - Responsive design */}
                {seatLayout.length > 0 && (
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-16 sm:w-20"></div> {/* Khớp với row label width */}
                    <div className="flex gap-0.5">
                      {seatLayout[0].map((seat, seatIndex) => (
                        <div
                          key={seatIndex}
                          className={`text-center text-gray-400 font-medium text-xs flex items-center justify-center h-4 sm:h-6 ${
                            seat.type === "hidden" || seat.status === "hidden"
                              ? "w-8 sm:w-10 lg:w-12" // Khoảng trống responsive
                              : seat.type === "couple"
                              ? "w-16 sm:w-20 lg:w-24" // Ghế đôi responsive
                              : "w-8 sm:w-10 lg:w-12" // Ghế thường responsive
                          }`}
                        >
                          {/* 🔧 FIX: Luôn hiển thị số cột, kể cả ghế ẩn */}
                          {seat.number}
                        </div>
                      ))}
                    </div>
                    <div className="w-8"></div>
                  </div>
                )}

                {seatLayout.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex items-center gap-2">
                    {/* Row label bên trái - responsive */}
                    <div className="w-16 sm:w-20 h-10 sm:h-12 text-center text-gray-400 font-medium text-xs sm:text-sm flex items-center justify-center bg-slate-800/30 rounded-md">
                      {String.fromCharCode(65 + rowIndex)}
                    </div>

                    {/* Container ghế với căn chỉnh chính xác */}
                    <div className="flex gap-0.5">
                      {row.map((seat) =>
                        seat.type === "hidden" || seat.status === "hidden" ? (
                          // Khoảng trống cho ghế bị ẩn - responsive
                          <div key={seat.id} className="w-8 sm:w-10 lg:w-12 h-8 sm:h-10 lg:h-12"></div>
                        ) : (
                          <button
                            key={seat.id}
                            onClick={() => handleSeatClick(seat)}
                            disabled={seat.status === "occupied" || seat.status === "maintenance"}
                            className={`
                              p-0.5 sm:p-1 transition-all duration-200 flex items-center justify-center
                              transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-1 focus:ring-[#FFD875]/30
                              ${
                                seat.type === "couple"
                                  ? "w-16 sm:w-20 lg:w-24 h-8 sm:h-10 lg:h-12"
                                  : "w-8 sm:w-10 lg:w-12 h-8 sm:h-10 lg:h-12"
                              }
                              ${
                                seat.status === "occupied" || seat.status === "maintenance"
                                  ? "cursor-not-allowed opacity-70"
                                  : "cursor-pointer hover:bg-white/5"
                              }
                              rounded-lg touch-manipulation backdrop-blur-sm
                              ${(() => {
                                // 🔧 FIX: Đơn giản hóa logic - chỉ dựa vào allSelectedSeatIds
                                const isSelected = allSelectedSeatIds.includes(seat.id);
                                return isSelected
                                  ? "bg-[#FFD875]/15 ring-1 ring-[#FFD875]/40"
                                  : "hover:bg-slate-700/30";
                              })()}
                            `}
                            title={`${seat.row}${seat.number} - ${translateSeatType(
                              seat.type
                            )} - ${seat.price.toLocaleString()}đ`}
                          >
                            <span
                              className={`material-symbols-outlined ${getSeatColor(
                                seat
                              )} transition-colors duration-200`}
                              style={{
                                fontSize: window.innerWidth < 640 ? "20px" : window.innerWidth < 1024 ? "24px" : "28px",
                              }}
                            >
                              weekend
                            </span>
                          </button>
                        )
                      )}
                    </div>

                    {/* Row label bên phải */}
                    <div className="w-8 h-12 text-center text-gray-400 font-medium text-sm flex items-center justify-center">
                      {String.fromCharCode(65 + rowIndex)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Legend với design và màu sắc cải thiện */}
          <div className="bg-gradient-to-r from-slate-800/40 to-slate-700/40 backdrop-blur-sm rounded-xl p-4 mt-4 border border-slate-600/30">
            <h4 className="text-sm font-medium text-gray-300 mb-4 text-center flex items-center justify-center gap-2">
              Chú thích ghế
            </h4>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 text-xs">
              <div className="flex items-center gap-2 bg-green-500/10 px-3 py-2 rounded-lg border border-green-500/20 hover:bg-green-500/20 transition-colors">
                <span
                  className="material-symbols-outlined text-green-500 drop-shadow-[0_0_2px_rgba(34,197,94,0.4)]"
                  style={{ fontSize: "16px" }}
                >
                  weekend
                </span>
                <span className="text-green-300 font-medium">Thường</span>
              </div>
              <div className="flex items-center gap-2 bg-purple-500/10 px-3 py-2 rounded-lg border border-purple-500/20 hover:bg-purple-500/20 transition-colors">
                <span
                  className="material-symbols-outlined text-purple-500 drop-shadow-[0_0_2px_rgba(168,85,247,0.4)]"
                  style={{ fontSize: "16px" }}
                >
                  weekend
                </span>
                <span className="text-purple-300 font-medium">VIP</span>
              </div>
              <div className="flex items-center gap-2 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">
                <span className="material-symbols-outlined text-red-600" style={{ fontSize: "16px" }}>
                  weekend
                </span>
                <span className="text-red-300 font-medium">Đã đặt</span>
              </div>
              <div className="flex items-center gap-2 bg-[#FFD875]/10 px-3 py-2 rounded-lg border border-[#FFD875]/30 hover:bg-[#FFD875]/20 transition-colors">
                <span
                  className="material-symbols-outlined text-[#FFD875] drop-shadow-[0_0_3px_rgba(255,216,117,0.6)]"
                  style={{ fontSize: "16px" }}
                >
                  weekend
                </span>
                <span className="text-[#FFD875] font-medium">Của tôi</span>
              </div>
              {isConnected && !isFallbackMode && (
                <div className="flex items-center gap-2 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">
                  <span
                    className="material-symbols-outlined text-red-500 drop-shadow-[0_0_2px_rgba(239,68,68,0.4)]"
                    style={{ fontSize: "16px" }}
                  >
                    weekend
                  </span>
                  <span className="text-red-300 font-medium">Người khác</span>
                </div>
              )}
              {expiringSeats.size > 0 && (
                <div className="flex items-center gap-2 bg-orange-500/20 px-3 py-2 rounded-lg border border-orange-500/40 animate-pulse">
                  <span
                    className="material-symbols-outlined text-orange-400 drop-shadow-[0_0_3px_rgba(251,146,60,0.6)]"
                    style={{ fontSize: "16px" }}
                  >
                    weekend
                  </span>
                  <span className="text-orange-300 font-medium">Sắp hết hạn</span>
                </div>
              )}
            </div>
          </div>

          {/* Expiring Seats Warning */}
          {expiringSeats.size > 0 && (
            <div className="mt-3 p-3 bg-orange-500/20 border border-orange-500/30 rounded-lg">
              <div className="flex items-center gap-2 text-orange-400 text-sm font-medium mb-2">
                <ExclamationTriangleIcon className="w-4 h-4" />
                <span>Ghế sắp hết hạn</span>
              </div>
              <div className="space-y-2">
                {Array.from(expiringSeats.entries()).map(([seatId, timeRemaining]) => {
                  const minutes = Math.ceil(timeRemaining / 60000);
                  return (
                    <div key={seatId} className="flex items-center justify-between text-xs">
                      <span>Ghế {seatId}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-orange-300">{minutes} phút</span>
                        <button
                          onClick={() => extendSeatHold(seatId)}
                          className="px-2 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded text-xs transition-colors"
                        >
                          Gia hạn
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Booking Summary - responsive */}
        <div className="xl:col-span-1 lg:col-span-1 order-1 lg:order-2">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 lg:p-5 lg:sticky lg:top-24">
            {/* Movie Information */}
            {movieDetails && (
              <div className="mb-6 pb-4 border-b border-slate-700">
                <div className="flex gap-3">
                  <div className="w-16 h-20 bg-slate-700 rounded-lg overflow-hidden flex-shrink-0">
                    {movieDetails.poster ? (
                      <img src={movieDetails.poster} alt={movieDetails.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-slate-500">movie</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-sm mb-1 truncate">{movieDetails.title}</h3>
                    <div className="space-y-1 text-xs text-gray-300">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs"></span>
                        <span>
                          {movieDetails.time} - {movieDetails.date}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs"></span>
                        <span className="truncate">{movieDetails.cinema}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded text-xs">
                          {movieDetails.format}
                        </span>
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-300 rounded text-xs">
                          {movieDetails.language}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <h3 className="text-lg font-bold mb-3">Ghế đã chọn</h3>
            <div className="mb-5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-300">Ghế đã chọn</h4>
                <span className="text-xs text-gray-400 bg-slate-700 px-2 py-1 rounded">
                  {currentSelectedSeats.length}/{MAX_SEATS}
                </span>
              </div>
              {currentSelectedSeats.length > 0 ? (
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                  {currentSelectedSeats.map((seat) => {
                    const isExpiring = expiringSeats.has(seat.id);
                    return (
                      <div
                        key={seat.id}
                        className={`flex items-center justify-between bg-slate-700 rounded-lg p-2.5 cursor-pointer hover:bg-slate-600 transition-colors duration-200 ${
                          isExpiring ? "ring-1 ring-orange-400 bg-orange-500/10" : ""
                        }`}
                        onClick={() => handleSeatClick(seat)}
                        title={isExpiring ? "Ghế sắp hết hạn - Click để bỏ chọn" : "Click để bỏ chọn ghế này"}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold">
                            {seat.row}
                            {seat.number}
                          </span>
                          {isExpiring && <ExclamationTriangleIcon className="w-3 h-3 text-orange-400" />}
                        </div>
                        <span className="text-xs px-2 py-0.5 bg-slate-600 rounded capitalize">
                          {translateSeatType(seat.type)}
                        </span>
                        <span className="font-medium text-[#FFD875]">{seat.price.toLocaleString()}đ</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8 flex flex-col items-center justify-center bg-slate-700/30 rounded-lg border-2 border-dashed border-slate-600">
                  <div className="w-16 h-16 flex items-center justify-center mx-auto mb-3 bg-slate-600/50 rounded-full">
                    <span className="material-symbols-outlined text-slate-400" style={{ fontSize: "32px" }}>
                      weekend
                    </span>
                  </div>
                  <p className="text-sm font-medium mb-1">Chưa chọn ghế nào</p>
                  <p className="text-xs text-gray-500">Nhấn vào ghế để chọn</p>
                </div>
              )}
            </div>
            {currentSelectedSeats.length > 0 && (
              <div className="mb-5 space-y-3 border-t border-slate-700 pt-4">
                {/* Breakdown giá */}
                <div className="space-y-2">
                  {Object.entries(
                    currentSelectedSeats.reduce((acc, seat) => {
                      const type = translateSeatType(seat.type);
                      if (!acc[type]) acc[type] = { count: 0, price: seat.price };
                      acc[type].count++;
                      return acc;
                    }, {} as Record<string, { count: number; price: number }>)
                  ).map(([type, info]) => (
                    <div key={type} className="flex justify-between text-sm">
                      <span className="text-gray-300">
                        {type} x{info.count}
                      </span>
                      <span className="text-gray-300">{(info.price * info.count).toLocaleString()}đ</span>
                    </div>
                  ))}
                </div>

                {/* Tổng cộng */}
                <div className="flex justify-between items-center font-bold text-lg bg-[#FFD875]/10 p-3 rounded-lg border border-[#FFD875]/20">
                  <span>Tổng cộng:</span>
                  <span className="text-[#FFD875] text-xl">{totalPrice.toLocaleString()}đ</span>
                </div>

                {/* Connection status */}
                <div className="flex items-center justify-center gap-2 text-xs">
                  {isConnected ? (
                    <>
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-400">Đồng bộ thời gian thực</span>
                    </>
                  ) : isFallbackMode ? (
                    <>
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <span className="text-yellow-400">Chế độ offline</span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                      <span className="text-gray-400">Đang kết nối...</span>
                    </>
                  )}
                </div>
              </div>
            )}
            <button
              onClick={handleContinue}
              disabled={currentSelectedSeats.length === 0}
              className={`
                w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 transform
                ${
                  currentSelectedSeats.length > 0
                    ? "bg-gradient-to-r from-[#FFD875] to-[#FFC107] text-black hover:shadow-[0_0_20px_rgba(255,216,117,0.8)] hover:scale-[1.02] active:scale-[0.98]"
                    : "bg-slate-600 text-slate-400 cursor-not-allowed"
                }
              `}
            >
              {currentSelectedSeats.length > 0
                ? `Tiếp tục thanh toán (${totalPrice.toLocaleString()}đ)`
                : "Vui lòng chọn ghế"}
            </button>

            {/* Thông tin bổ sung */}
            <div className="mt-4 p-3 bg-slate-700/30 rounded-lg">
              <div className="text-xs text-gray-400 space-y-2">
                <div className="flex items-center gap-2">
                  <span>Thông tin quan trọng</span>
                </div>
                <div className="space-y-1 ml-5">
                  <p>• Vé đã mua không thể đổi trả</p>
                  <p>• Có mặt trước giờ chiếu 15 phút</p>
                  <p>• Ghế được giữ trong 15 phút</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;
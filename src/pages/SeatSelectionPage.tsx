// components/SeatSelection.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeftIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import type { Seat, CinemaRoom, BookingSession, BookingStep } from '../types';
import { generateSeatGrid, findBestSeats } from '../utils/seatRecommendations';
import FullScreenLoader from '../components/FullScreenLoader';
import BookingProgress from '../components/BookingProgress';
import { toast } from 'react-hot-toast';

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
    title: "Đang tải thông tin phim...",
    poster: "",
    language: "VIE",
    format: "2D",
    cinema: "Galaxy Cinema",
    date: new Date().toLocaleDateString('vi-VN'),
    time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  }
}) => {
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>(bookingSession.selectedSeats);
  const [zoom, setZoom] = useState(1);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [seatLayout, setSeatLayout] = useState<(Seat | null)[][]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const seatMapRef = useRef<HTMLDivElement>(null);

  const MAX_SEATS = 8;
  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 1.5;

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(prev => (prev > 0 ? prev - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const processSeats = async () => {
      try {
        setLoading(true);

        if (seats && seats.length > 0) {
          // Tạo map ghế theo row và column để dễ tra cứu
          const seatMap: Record<string, Record<number, Seat>> = {};
          seats.forEach(seat => {
            if (!seatMap[seat.row]) {
              seatMap[seat.row] = {};
            }
            seatMap[seat.row][seat.number] = seat;
          });

          // Xác định range của mỗi row
          const rowInfo: Record<string, { min: number; max: number }> = {};
          seats.forEach(seat => {
            if (!rowInfo[seat.row]) {
              rowInfo[seat.row] = { min: seat.number, max: seat.number };
            } else {
              rowInfo[seat.row].min = Math.min(rowInfo[seat.row].min, seat.number);
              rowInfo[seat.row].max = Math.max(rowInfo[seat.row].max, seat.number);
            }
          });

          // Tạo layout với khoảng trống
          const rows = Object.keys(rowInfo).sort();

          const generatedLayout = rows.map((row) => {
            const { min, max } = rowInfo[row];
            const rowSeats: (Seat | null)[] = [];

            for (let col = min; col <= max; col++) {
              if (seatMap[row] && seatMap[row][col]) {
                // Ghế tồn tại
                const seatData = seatMap[row][col];
                rowSeats.push(seatData);
              } else {
                // Ghế không tồn tại - tạo placeholder
                rowSeats.push(null);
              }
            }

            return rowSeats;
          });

          setSeatLayout(generatedLayout);
        } else {
          setSeatLayout([]);
        }

        setLoading(false);
      } catch (err) {
        console.error('Lỗi khi xử lý dữ liệu ghế:', err);
        setError('Không thể tải sơ đồ phòng chiếu.');
        setLoading(false);
      }
    };

    processSeats();
  }, [seats, bookingSession.showtimeId]);

  // Add Material Symbols stylesheet with thinner weight
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,200,0,-25&icon_names=weekend';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeatClick = useCallback((seat: Seat) => {
    if (seat.status === 'occupied' || seat.status === 'maintenance') {
      return;
    }

    setSelectedSeats(prev => {
      const isSelected = prev.some(s => s.id === seat.id);
      const newSeats = isSelected
        ? prev.filter(s => s.id !== seat.id)
        : prev.length < MAX_SEATS ? [...prev, { ...seat, status: 'selected' as const }] : prev;

      // Thông báo cho người dùng với toastId để tránh trùng lặp
      if (isSelected) {
        toast.success(`Đã bỏ chọn ghế ${seat.row}${seat.number}`, {
          id: `seat-${seat.id}-remove`,
          duration: 2000,
          position: 'top-right',
          style: {
            background: '#1f2937',
            color: '#fff',
          },
        });
      } else if (prev.length < MAX_SEATS) {
        toast.success(`Đã chọn ghế ${seat.row}${seat.number}`, {
          id: `seat-${seat.id}-add`,
          duration: 2000,
          position: 'top-right',
          style: {
            background: '#1f2937',
            color: '#fff',
          },
        });
      } else if (prev.length >= MAX_SEATS && !isSelected) {
        toast.error(`Bạn chỉ có thể chọn tối đa ${MAX_SEATS} ghế`, {
          id: 'max-seats-error',
          duration: 3000,
          position: 'top-right',
        });
      }

      if (typeof onSeatsChange === 'function') {
        setTimeout(() => onSeatsChange(newSeats), 0);
      }
      return newSeats;
    });
  }, [onSeatsChange]);

  const getSeatColor = (seat: Seat) => {
    const isSelected = selectedSeats.some(s => s.id === seat.id);
    if (isSelected) {
      return 'text-[#FFD875] hover:text-[#FFD875]/80 hover:ring-2 hover:ring-[#FFD875]/50';
    }
    switch (seat.status) {
      case 'occupied': return 'text-red-500';
      case 'maintenance': return 'text-slate-600';
      case 'available':
        switch (seat.type) {
          case 'vip': return 'text-purple-500 hover:text-purple-400';
          case 'couple': return 'text-pink-500 hover:text-pink-400';
          default: return 'text-green-500 hover:text-green-400';
        }
      default: return 'text-slate-700';
    }
  };

  const handleBack = async () => {
    try {
      // Nếu đã chọn ghế, hỏi người dùng xác nhận
      if (selectedSeats.length > 0) {
        const confirmed = window.confirm("Bạn có chắc chắn muốn quay lại? Các ghế đã chọn sẽ không được giữ lại.");
        if (!confirmed) return;
      }

      // Gọi API hủy booking trước khi quay lại
      try {
        const { bookingService } = await import('../services/bookingService');

        // Thử cancelLatestBooking 
        try {
          const result = await bookingService.cancelLatestBooking();
          if (result && result.success) {
            toast.success('Đã hủy đơn đặt vé thành công');
          }
        } catch (error1) {
          // Gọi trực tiếp API với nhiều endpoint
          try {
            const api = (await import('../config/api')).default;
            const latestBooking = bookingService.getLatestBookingFromCache();

            if (latestBooking && latestBooking.id) {
              const bookingId = latestBooking.id;
              const endpoints = [
                `/api/bookings/${bookingId}/cancel`,
                `/bookings/${bookingId}/cancel`,
                `/api/booking/${bookingId}/cancel`,
                `/booking/${bookingId}/cancel`
              ];

              for (const endpoint of endpoints) {
                try {
                  await api.post(endpoint);
                  toast.success(`Đã hủy đơn đặt vé thành công`);
                  break;
                } catch (endpointError: any) {
                  // Continue to next endpoint
                }
              }
            }
          } catch (error2) {
            // Silent error
          }
        }

        bookingService.clearCache();
      } catch (error) {
        // Silent error
      }

      onBack();
    } catch (error) {
      onBack();
    }
  };

  const handleContinue = () => {
    if (selectedSeats.length === 0) {
      alert('Vui lòng chọn ít nhất một ghế.');
      return;
    }
    onNext();
  };

  const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  // 🎬 Sử dụng movie details từ bookingSession nếu có, fallback to props
  const displayMovieDetails = {
    title: bookingSession.movieDetails?.title || bookingSession.movieTitle || movieDetails.title,
    poster: bookingSession.movieDetails?.poster || movieDetails.poster,
    language: movieDetails.language,
    format: movieDetails.format,
    cinema: movieDetails.cinema,
    date: movieDetails.date,
    time: movieDetails.time
  };

  if (loading) return <FullScreenLoader />;
  if (error) return <div className="text-center text-red-400">{error}</div>;

  return (
    <div className="text-white container mx-auto px-4">
      {/* Horizontally aligned header with movie title, progress bar, and timer */}
      <div className="flex items-center justify-between py-3 mt-14">
        {/* Left: Movie title and back button */}
        <div className="flex items-center w-1/4">
          <button onClick={handleBack} className="text-white hover:text-[#FFD875] transition-colors p-1 rounded-full bg-white/10 hover:bg-white/20 mr-3">
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">{displayMovieDetails.title}</h1>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="px-2 py-0.5 bg-white/10 rounded text-xs font-medium text-gray-300">{displayMovieDetails.language}</span>
              <span className="px-2 py-0.5 bg-white/10 rounded text-xs font-medium text-gray-300">{displayMovieDetails.format}</span>
            </div>
          </div>
        </div>

        {/* Center: Progress indicator */}
        <div className="w-2/4">
          <BookingProgress
            steps={bookingSteps}
            currentStep={currentStep}
          />
        </div>

        {/* Right: Timer */}
        <div className="text-right w-1/4 flex justify-end">
          <div>
            <div className="flex items-center justify-end gap-1 text-[#FFD875]">
              <ClockIcon className="w-5 h-5" />
              <span className="font-mono text-xl">{formatTime(timeLeft)}</span>
            </div>
            <p className="text-xs text-gray-400">Thời gian giữ ghế</p>
          </div>
        </div>
      </div>

      {/* Main grid with optimized spacing */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-4">
        {/* Left side: Seat Map with reduced vertical gap */}
        <div className="lg:col-span-3">
          {/* Enhanced Curved Screen with reduced bottom margin */}
          <div className="relative flex justify-center mb-6">
            <div className="w-full max-w-2xl mx-auto text-center">
              {/* Screen Container with Perspective */}
              <div className="relative" style={{ perspective: '800px' }}>
                {/* Curved Screen with Strong Glow */}
                <div
                  className="h-12 mx-auto relative"
                  style={{
                    width: '80%',
                    borderBottomLeftRadius: '50%',
                    borderBottomRightRadius: '50%',
                    background: 'linear-gradient(to bottom, rgba(255,216,117,0.15), transparent)',
                    transform: 'rotateX(60deg)',
                    transformOrigin: 'top center',
                  }}
                >
                  {/* Glowing Edge */}
                  <div
                    className="absolute top-0 left-0 right-0 h-2 bg-[#FFD875]"
                    style={{
                      borderRadius: '100%',
                      boxShadow: '0 0 30px 10px rgba(255, 216, 117, 0.9), 0 0 50px 20px rgba(255, 216, 117, 0.6), 0 0 70px 30px rgba(255, 216, 117, 0.3)',
                    }}
                  ></div>
                </div>
              </div>
              <div className="mt-1 text-xs font-bold text-[#FFD875] tracking-[0.2em]">MÀN HÌNH</div>
            </div>
          </div>

          {/* Seat Map Container - Closer to screen */}
          <div ref={containerRef} className="relative overflow-hidden -mt-2" style={{ height: '480px' }}>
            <div
              ref={seatMapRef}
              className="absolute inset-0 flex flex-col items-center justify-center transition-transform duration-300"
              style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
            >
              <div className="flex flex-col items-center gap-1">
                {seatLayout.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex items-center gap-3">
                    <div className="w-5 text-center text-gray-400 font-medium text-sm">{String.fromCharCode(65 + rowIndex)}</div>
                    <div className="flex gap-1">
                      {row.map((seat, seatIndex) => {
                        if (!seat) {
                          // Ghế không tồn tại - hiển thị khoảng trống
                          return (
                            <div
                              key={`empty-${rowIndex}-${seatIndex}`}
                              className="w-6 h-6 bg-gray-800 rounded-sm"
                            />
                          );
                        }

                        return (
                          <button
                            key={`seat-${rowIndex}-${seatIndex}`}
                            className={`w-6 h-6 rounded-sm ${getSeatColor(seat)}`}
                            onClick={() => handleSeatClick(seat)}
                            disabled={seat.status === 'occupied' || seat.status === 'maintenance'}
                          >
                            {seat.number}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
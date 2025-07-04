// components/SeatSelection.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeftIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import type { Seat, CinemaRoom, BookingSession, BookingStep } from '../types';
import { generateSeatGrid, findBestSeats } from '../utils/seatRecommendations';
import FullScreenLoader from './FullScreenLoader';
import BookingProgress from './BookingProgress';
import { translateSeatType } from '../utils/seatTypeTranslator';

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
    poster: "https://m.media-amazon.com/images/M/MV5BMGI1NjA1MjUtNGQxYS00ZGI5LTlkMzUtZDAwM2EwZjRiY2NkXkEyXkFqcGdeQXVyMTM0NTUzNDIy._V1_.jpg",
    language: "ENG",
    format: "4DX Dolby Atmos",
    cinema: "Mall of Tripla",
    date: "27.04.2022",
    time: "18:35"
  }
}) => {
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>(bookingSession.selectedSeats);
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [seatLayout, setSeatLayout] = useState<Seat[][]>([]);

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

        if (seats && seats.length > 0) {
          console.log("Số ghế có sẵn:", seats.length);

          const seatsByRow: Record<string, Seat[]> = {};
          seats.forEach(seat => {
            if (!seatsByRow[seat.row]) {
              seatsByRow[seat.row] = [];
            }
            seatsByRow[seat.row].push(seat);
          });

          const rows = Object.keys(seatsByRow).sort();
          const generatedLayout = rows.map(row => {
            const rowSeats = seatsByRow[row].sort((a, b) => a.number - b.number);

            // Xử lý ghế bị missing/ẩn - tạo array với placeholder cho ghế bị thiếu
            const maxSeatNumber = Math.max(...rowSeats.map(s => s.number));
            const fullRowSeats: Seat[] = [];

            for (let i = 1; i <= maxSeatNumber; i++) {
              const existingSeat = rowSeats.find(s => s.number === i);
              if (existingSeat) {
                fullRowSeats.push(existingSeat);
              } else {
                // Tạo placeholder seat cho ghế bị ẩn/missing - hiển thị khoảng trống
                fullRowSeats.push({
                  id: `${row}-${i}-hidden`,
                  row: row,
                  number: i,
                  type: 'hidden',
                  status: 'hidden',
                  price: 0,
                  layoutId: -1
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

  // Removed formatTime function since countdown timer is removed

  const handleSeatClick = useCallback((seat: Seat) => {
    if (seat.status === 'occupied' || seat.status === 'maintenance') return;

    setSelectedSeats(prev => {
      const isSelected = prev.some(s => s.id === seat.id);
      const newSeats = isSelected
        ? prev.filter(s => s.id !== seat.id)
        : prev.length < MAX_SEATS ? [...prev, { ...seat, status: 'selected' as const }] : prev;

      if (prev.length === newSeats.length && !isSelected && prev.length >= MAX_SEATS) {
        alert(`Bạn chỉ có thể chọn tối đa ${MAX_SEATS} ghế`);
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
      return 'text-[#FFD875]';
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

  const handleContinue = () => {
    if (selectedSeats.length === 0) {
      alert('Vui lòng chọn ít nhất một ghế.');
      return;
    }
    onNext();
  };

  const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  if (loading) return <FullScreenLoader />;
  if (error) return <div className="text-center text-red-400">{error}</div>;

  return (
    <div className="text-white container mx-auto px-4">
      {/* Horizontally aligned header with movie title, progress bar, and timer */}
      <div className="flex items-center justify-between py-3 mt-14">
        {/* Left: Movie title and back button */}
        <div className="flex items-center w-1/4">
          <button onClick={onBack} className="text-white hover:text-[#FFD875] transition-colors p-1 rounded-full bg-white/10 hover:bg-white/20 mr-3">
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">{movieDetails.title}</h1>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="px-2 py-0.5 bg-white/10 rounded text-xs font-medium text-gray-300">{movieDetails.language}</span>
              <span className="px-2 py-0.5 bg-white/10 rounded text-xs font-medium text-gray-300">{movieDetails.format}</span>
            </div>
          </div>
        </div>

        {/* Center: Progress indicator - Loại bỏ để tránh hiển thị hai thanh tiến trình */}
        <div className="w-2/4">
          {/* BookingProgress đã được loại bỏ */}
        </div>

        {/* Right: Timer - Ẩn thời gian giữ ghế */}
        <div className="text-right w-1/4 flex justify-end">
          {/* Ẩn countdown timer */}
        </div>
      </div>

      {/* Main grid with optimized spacing */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-4">
        {/* Left side: Seat Map with reduced vertical gap */}
        <div className="lg:col-span-3">
          {/* Enhanced Curved Screen with reduced bottom margin */}
          <div className="relative flex justify-center mb-0">
            <div className="w-full max-w-2xl mx-auto text-center">
              {/* Screen Container with Perspective */}
              <div className="relative" style={{ perspective: '800px' }}>
                {/* Curved Screen with Strong Glow */}
                <div
                  className="h-10 mx-auto relative"
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
              <div className="mt-0 text-xs font-bold text-[#FFD875] tracking-[0.2em]">MÀN HÌNH</div>
            </div>
          </div>

          {/* Seat Map Container - Closer to screen */}
          <div ref={containerRef} className="relative overflow-hidden -mt-2" style={{ height: '480px' }}>
            <div
              ref={seatMapRef}
              className="absolute inset-0 flex flex-col items-center justify-center transition-transform duration-300"
              style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
            >
              <div className="flex flex-col items-center gap-0.5">
                {/* Header với số cột */}
                {seatLayout.length > 0 && (
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8"></div>
                    <div className="flex gap-0.5">
                      {seatLayout[0].map((seat, seatIndex) => (
                        <div key={seatIndex} className="w-12 text-center text-gray-400 font-medium text-xs flex items-center justify-center">
                          {seat.number}
                        </div>
                      ))}
                    </div>
                    <div className="w-8"></div>
                  </div>
                )}

                {seatLayout.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex items-center gap-2">
                    <div className="w-20 h-15 text-center text-gray-400 font-medium text-sm flex items-center justify-center">{String.fromCharCode(65 + rowIndex)}</div>
                    <div className="flex gap-0.5">
                      {row.map((seat) => (
                        seat.type === 'hidden' || seat.status === 'hidden' ? (
                          // Hiển thị khoảng trống cho ghế bị ẩn
                          <div key={seat.id} className="w-12 h-12 p-1"></div>
                        ) : (
                          <button
                            key={seat.id}
                            onClick={() => handleSeatClick(seat)}
                            disabled={seat.status === 'occupied' || seat.status === 'maintenance'}
                            className={`
                            w-12 h-12 p-1 transition-all duration-200 flex items-center justify-center
                            transform hover:scale-110 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-offset-slate-900 focus:ring-[#FFD875]
                            ${seat.type === 'couple' ? 'w-24' : ''}
                            ${seat.status === 'occupied' || seat.status === 'maintenance' ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}
                              `}
                            title={`${seat.row}${seat.number} - ${seat.type} - ${seat.price.toLocaleString()}đ`}
                          >
                            <span
                              className={`material-symbols-outlined ${getSeatColor(seat)}`}
                              style={{ fontSize: '32px' }}
                            >
                              weekend
                            </span>
                          </button>
                        )
                      ))}
                    </div>
                    <div className="w-8 h-12 text-center text-gray-400 font-medium text-sm flex items-center justify-center">{String.fromCharCode(65 + rowIndex)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Legend with thinner icons */}
          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs justify-center">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-green-500" style={{ fontSize: '18px' }}>weekend</span>
              <span>Thường</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-purple-500" style={{ fontSize: '18px' }}>weekend</span>
              <span>VIP</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-red-500" style={{ fontSize: '18px' }}>weekend</span>
              <span>Đã đặt</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[#FFD875]" style={{ fontSize: '18px' }}>weekend</span>
              <span>Đã chọn</span>
            </div>
          </div>
        </div>

        {/* Right Side: Booking Summary */}
        <div className="lg:col-span-1">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-5 sticky top-24">
            <h3 className="text-lg font-bold mb-3">Thông tin đặt vé</h3>
            <div className="mb-5 min-h-[150px]">
              <h4 className="text-sm font-medium text-gray-300 mb-2">
                Ghế đã chọn ({selectedSeats.length}/{MAX_SEATS})
              </h4>
              {selectedSeats.length > 0 ? (
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                  {selectedSeats.map(seat => (
                    <div
                      key={seat.id}
                      className="flex items-center justify-between bg-slate-700 rounded-lg p-2.5 cursor-pointer hover:bg-slate-600 transition-colors duration-200"
                      onClick={() => handleSeatClick(seat)}
                      title="Click để bỏ chọn ghế này"
                    >
                      <span className="font-bold">{seat.row}{seat.number}</span>
                      <span className="text-xs px-2 py-0.5 bg-slate-600 rounded capitalize">{translateSeatType(seat.type)}</span>
                      <span className="font-medium text-[#FFD875]">{seat.price.toLocaleString()}đ</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-400 py-6 flex flex-col items-center justify-center">
                  <div className="w-14 h-14 flex items-center justify-center mx-auto mb-2">
                    <span className="material-symbols-outlined text-slate-500" style={{ fontSize: '36px' }}>weekend</span>
                  </div>
                  <p className="text-sm">Chưa chọn ghế nào</p>
                </div>
              )}
            </div>
            {selectedSeats.length > 0 && (
              <div className="mb-5 space-y-1.5 border-t border-slate-700 pt-3">
                <div className="flex justify-between font-bold text-lg"><span>Tổng cộng:</span><span className="text-[#FFD875]">{totalPrice.toLocaleString()}đ</span></div>
              </div>
            )}
            <button
              onClick={handleContinue}
              disabled={selectedSeats.length === 0}
              className="w-full py-3 bg-[#FFD875] text-black rounded-lg font-bold transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,216,117,0.7)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              Tiếp tục thanh toán
            </button>
            <div className="mt-3 text-xs text-gray-400 space-y-1">
              <p>• Vé đã mua không thể đổi trả</p>
              <p>• Vui lòng có mặt trước giờ chiếu 15 phút</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;

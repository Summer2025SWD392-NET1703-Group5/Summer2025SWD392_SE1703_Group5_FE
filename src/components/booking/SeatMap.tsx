import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { ChairIcon, UsersIcon } from '@heroicons/react/24/outline';
import { ChairIcon as ChairIconSolid } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';

// Định nghĩa các kiểu ghế
export type SeatType = 'standard' | 'vip' | 'couple' | 'wheelchair';
export type SeatStatus = 'available' | 'selected' | 'occupied' | 'maintenance' | 'held';

export interface Seat {
  id: string;
  row: string;
  number: number;
  type: SeatType;
  status: SeatStatus;
  price: number;
  layoutId?: number; // Optional, để tương thích
  bookedBy?: string; // Tên người dùng đã giữ/đặt
  holdExpiry?: Date; // Thời gian hết hạn giữ ghế
}

interface SeatMapProps {
  seats: any[];
  selectedSeats: string[];
  onSeatSelect: (seatId: string) => void;
  maxSeats?: number;
  loading?: boolean;
  seatStatus?: string; // Thêm prop để hiển thị trạng thái ghế (đã đặt/tổng số)
  roomType?: string;   // Thêm prop để hiển thị loại phòng (2D, 3D, IMAX...)
}

const SeatMap: React.FC<SeatMapProps> = ({
  seats,
  selectedSeats,
  onSeatSelect,
  maxSeats = 6,
  loading = false,
  seatStatus = "0/0",
  roomType = "2D"
}) => {
  const [seatLayout, setSeatLayout] = useState<any[][]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!seats || seats.length === 0) {
      // Tạo layout mẫu nếu không có dữ liệu
      const rows = 8;
      const cols = 10;
      const dummyLayout: any[][] = [];

      for (let i = 0; i < rows; i++) {
        const row: any[] = [];
        for (let j = 0; j < cols; j++) {
          const seatId = `${String.fromCharCode(65 + i)}${j + 1}`;
          row.push({
            id: seatId,
            type: j === 0 || j === cols - 1 ? 'aisle' : 'standard',
            status: Math.random() > 0.8 ? 'booked' : 'available',
            price: 90000
          });
        }
        dummyLayout.push(row);
      }
      setSeatLayout(dummyLayout);
    } else {
      // Xử lý dữ liệu ghế thực tế
      // Giả sử seats là mảng 2 chiều đã được sắp xếp
      setSeatLayout(seats);
    }
  }, [seats]);

  const handleSeatClick = (seatId: string, status: string) => {
    if (status === 'booked' || status === 'held') return;
    if (selectedSeats.includes(seatId)) {
      onSeatSelect(seatId);
    } else if (selectedSeats.length < maxSeats) {
      onSeatSelect(seatId);
    } else {
      alert(`Bạn chỉ có thể chọn tối đa ${maxSeats} ghế.`);
    }
  };

  const renderSeat = (seat: any, rowIndex: number, colIndex: number) => {
    if (!seat) return <div key={`empty-${rowIndex}-${colIndex}`} className="w-10 h-10"></div>;
    
    if (seat.type === 'aisle') {
      return <div key={`aisle-${rowIndex}-${colIndex}`} className="w-10 h-10"></div>;
    }

    const isSelected = selectedSeats.includes(seat.id);
    const isBooked = seat.status === 'booked';
    const isHeld = seat.status === 'held';
    const isCouple = seat.type === 'couple';

    let seatClasses = `flex items-center justify-center transition-all duration-300 text-sm font-medium 
                      ${isCouple ? 'w-20 h-10 rounded-lg' : 'w-10 h-10 rounded-md'}`;

    if (isSelected) {
      seatClasses += ' bg-yellow-500 text-black shadow-lg transform -translate-y-1';
    } else if (isBooked) {
      seatClasses += ' bg-gray-400 text-gray-700 cursor-not-allowed opacity-50';
    } else if (isHeld) {
      seatClasses += ' bg-orange-300 text-orange-800 cursor-not-allowed';
    } else {
      seatClasses += ' bg-slate-700 hover:bg-slate-600 text-gray-300 cursor-pointer';
    }

    return (
      <div
        key={seat.id}
        className={seatClasses}
        onClick={() => handleSeatClick(seat.id, seat.status)}
        title={`Ghế ${seat.id} - ${seat.price.toLocaleString('vi-VN')}đ`}
      >
        {seat.id}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
        <p className="mt-4 text-gray-400">Đang tải sơ đồ ghế...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Màn hình với hiệu ứng cong */}
      <div className="relative flex justify-center mb-3">
        <div className="w-full max-w-2xl mx-auto text-center">
          {/* Screen Container with Perspective */}
          <div className="relative h-10 bg-gradient-to-b from-gray-700 to-gray-900 rounded-t-lg overflow-hidden">
            {/* Screen Curved Effect */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[95%] h-1 bg-gray-300 opacity-80 rounded-full shadow-lg shadow-gray-300/50"></div>
            </div>
            {/* Screen Text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-gray-400 text-xs">MÀN HÌNH</p>
            </div>
          </div>
          
          {/* Thông tin phòng chiếu và trạng thái ghế */}
          <div className="flex justify-between items-center mt-1 mb-4 text-xs text-gray-400 px-2">
            <div className="flex items-center">
              <span className="bg-yellow-500 text-black font-bold px-2 py-0.5 rounded text-xs mr-1">{roomType}</span>
              <span>Phòng chiếu</span>
            </div>
            <div className="flex items-center">
              <UsersIcon className="w-4 h-4 mr-1" />
              <span>Ghế đã đặt: {seatStatus}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Seat Map */}
      <div className="space-y-0.5">
        {seatLayout.map((row, rowIndex) => (
          <div key={rowIndex} className="flex items-center gap-2">
            <div className="w-8 h-10 text-center text-gray-400 font-medium text-sm flex items-center justify-center">{String.fromCharCode(65 + rowIndex)}</div>
            <div className="flex gap-0.5">
              {row.map((seat: any, colIndex: number) => renderSeat(seat, rowIndex, colIndex))}
            </div>
          </div>
        ))}
      </div>

      {/* Seat Legend */}
      <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs text-gray-400 max-w-md mx-auto pt-3">
        <div className="flex flex-col items-center">
          <div className="w-6 h-6 bg-slate-700 rounded-md mb-1"></div>
          <span>Ghế trống</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-6 h-6 bg-yellow-500 rounded-md mb-1"></div>
          <span>Ghế đang chọn</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-6 h-6 bg-gray-400 opacity-50 rounded-md mb-1"></div>
          <span>Ghế đã đặt</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-12 h-6 bg-slate-700 rounded-lg mb-1"></div>
          <span>Ghế đôi</span>
        </div>
      </div>
    </div>
  );
};

export default SeatMap;


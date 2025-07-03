import React from 'react';
import { TicketIcon } from '@heroicons/react/24/outline';

interface Seat {
  id: string;
  row: string;
  number: number;
  type: 'standard' | 'vip' | 'couple' | 'wheelchair';
  status: 'available' | 'selected' | 'occupied' | 'maintenance';
  price: number;
}

interface SeatCounterProps {
  selectedSeats: Seat[];
  maxSeats?: number;
}

const SeatCounter: React.FC<SeatCounterProps> = ({ selectedSeats, maxSeats = 8 }) => {
  // Nhóm ghế theo loại để hiển thị
  const seatsByType = selectedSeats.reduce((acc, seat) => {
    if (!acc[seat.type]) {
      acc[seat.type] = [];
    }
    acc[seat.type].push(seat);
    return acc;
  }, {} as Record<string, Seat[]>);

  // Tính tổng tiền
  const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  // Định dạng tiền tệ VND
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Tên loại ghế
  const seatTypeNames = {
    standard: 'Ghế thường',
    vip: 'Ghế VIP',
    couple: 'Ghế đôi',
    wheelchair: 'Ghế người khuyết tật'
  };

  return (
    <div className="glass-dark rounded-xl p-6 border border-gray-700/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-normal text-white flex items-center">
          <TicketIcon className="w-5 h-5 mr-2" />
          Ghế đã chọn ({selectedSeats.length}/{maxSeats})
        </h3>
      </div>

      {selectedSeats.length > 0 ? (
        <div className="space-y-4">
          {/* Danh sách ghế đã chọn */}
          <div className="flex flex-wrap gap-2">
            {selectedSeats.map(seat => (
              <div 
                key={seat.id} 
                className="bg-[#ffd875]/20 text-[#ffd875] px-3 py-1.5 rounded-lg text-sm"
              >
                {seat.row}{seat.number}
              </div>
            ))}
          </div>

          {/* Bảng tính giá */}
          <div className="space-y-2 pt-4 border-t border-gray-700/50">
            {Object.entries(seatsByType).map(([type, seats]) => (
              <div key={type} className="flex justify-between text-sm">
                <span className="text-gray-400">
                  {seatTypeNames[type]} x {seats.length}
                </span>
                <span className="text-white">
                  {formatCurrency(seats.reduce((sum, seat) => sum + seat.price, 0))}
                </span>
              </div>
            ))}
            
            <div className="flex justify-between pt-2 border-t border-gray-700/50 mt-2">
              <span className="text-white font-medium">Tổng cộng</span>
              <span className="text-[#ffd875] font-medium">{formatCurrency(totalPrice)}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-gray-400">Vui lòng chọn ghế ngồi</p>
        </div>
      )}
    </div>
  );
};

export default SeatCounter; 
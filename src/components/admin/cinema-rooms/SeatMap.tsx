import React from 'react';
import type { SeatType } from '../../../types/cinema';
import './SeatMap.css';

interface SeatMapProps {
  layout: SeatType[][];
  selectedSeats: { row: number, col: number }[];
  onSeatClick: (row: number, col: number) => void;
}

const Seat: React.FC<{
  type: SeatType;
  isSelected: boolean;
  onClick: () => void;
  rowLabel: string;
  colNumber: number;
}> = ({ type, isSelected, onClick, rowLabel, colNumber }) => {
  if (type === 'aisle') {
    return (
      <div className="seat-container">
        <div className="seat seat-aisle"></div>
        <div className="seat-label"></div>
      </div>
    );
  }

  const seatClass = `seat seat-${type} ${isSelected ? 'seat-selected' : 'seat-available'}`;
  const seatLabel = `${rowLabel}${colNumber}`;

  return (
    <div className="seat-container">
      <div className={seatClass} onClick={onClick} title={`Ghế ${seatLabel} - ${type}`}>
        <span className="material-symbols-outlined">weekend</span>
      </div>
      <div className="seat-label">{seatLabel}</div>
    </div>
  );
};

const SeatMap: React.FC<SeatMapProps> = ({ layout, selectedSeats, onSeatClick }) => {
  const numCols = layout[0]?.length || 0;

  return (
    <div className="flex flex-col items-center">
      {/* Screen */}
      <div className="relative w-4/5 mb-12">
        <div className="w-full h-2 bg-gray-400 rounded-t-lg mb-2 shadow-lg shadow-gray-400/30"></div>
        <div className="text-white font-semibold tracking-widest text-center">MÀN HÌNH</div>
        <div className="absolute w-full h-20 top-2 left-0 bg-gradient-to-b from-gray-400/20 to-transparent rounded-t-lg"></div>
      </div>

      {/* Seat Grid */}
      <div
        className="seat-grid"
        style={{ gridTemplateColumns: `auto repeat(${numCols}, auto) auto` }}
      >
        {layout.map((row, rowIndex) => {
          const rowLabel = String.fromCharCode(65 + rowIndex);
          return (
            <React.Fragment key={rowIndex}>
              <div className="seat-row-label">{rowLabel}</div>
              {row.map((seatType, colIndex) => (
                <Seat
                  key={`${rowIndex}-${colIndex}`}
                  type={seatType}
                  isSelected={selectedSeats.some(s => s.row === rowIndex && s.col === colIndex)}
                  onClick={() => onSeatClick(rowIndex, colIndex)}
                  rowLabel={rowLabel}
                  colNumber={colIndex + 1}
                />
              ))}
              <div className="seat-row-label">{rowLabel}</div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-12 flex flex-wrap justify-center gap-6">
        <div className="flex items-center gap-3">
          <div className="seat-container">
            <div className="seat seat-standard seat-available w-10 h-10">
              <span className="material-symbols-outlined text-base">weekend</span>
            </div>
          </div>
          <span className="text-sm text-gray-300">Ghế thường</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="seat-container">
            <div className="seat seat-vip seat-available w-10 h-10">
              <span className="material-symbols-outlined text-base">weekend</span>
            </div>
          </div>
          <span className="text-sm text-gray-300">Ghế VIP</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="seat-container">
            <div className="seat seat-couple seat-available w-20 h-10">
              <span className="material-symbols-outlined text-base">weekend</span>
            </div>
          </div>
          <span className="text-sm text-gray-300">Ghế đôi</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="seat-container">
            <div className="seat seat-disabled w-10 h-10">
              <span className="material-symbols-outlined text-base">weekend</span>
            </div>
          </div>
          <span className="text-sm text-gray-300">Ghế cho người khuyết tật</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="seat-container">
            <div className="seat seat-selected w-10 h-10">
              <span className="material-symbols-outlined text-base">weekend</span>
            </div>
          </div>
          <span className="text-sm text-gray-300">Ghế đang chọn</span>
        </div>
      </div>
    </div>
  );
};

export default SeatMap; 
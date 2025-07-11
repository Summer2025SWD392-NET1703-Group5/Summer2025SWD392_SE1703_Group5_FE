import React, { useState } from "react";
import { motion } from "framer-motion";
import "../../../components/admin/cinema-rooms/SeatMap.css";
import type { SeatMap, SeatMapRow } from "../../../types/seatLayout";

interface SeatMapProps {
  rows?: number;
  cols?: number;
  seatMapData?: SeatMap; // Add actual seat map data
  selectedSeats?: string[];
  onSeatSelect?: (seatId: string) => void;
  onRowSelect?: (row: string) => void;
  onColSelect?: (col: number) => void;
  disabledSeats?: string[];
  vipSeats?: string[];
  coupleSeats?: string[];
  occupiedSeats?: string[];
  readOnly?: boolean;
}

const RoomSeatMap: React.FC<SeatMapProps> = ({
  rows = 8,
  cols = 12,
  seatMapData,
  selectedSeats = [],
  onSeatSelect = () => {},
  onRowSelect = () => {},
  onColSelect = () => {},
  disabledSeats = [],
  vipSeats = [],
  coupleSeats = [],
  occupiedSeats = [],
  readOnly = false,
}) => {
  // Hover states for rows and columns
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);

  // Use actual seat map data if available, otherwise fallback to grid generation
  const actualRows = seatMapData?.rows || [];
  const actualCols = seatMapData?.dimensions?.columns || cols;
  const actualRowCount = seatMapData?.dimensions?.rows || rows;

  // Always show columns 1-10 for consistent layout
  const allColumnNumbers = Array.from({ length: 10 }, (_, i) => i + 1);

  const handleSeatClick = (seatId: string) => {
    // Tắt chức năng chọn ghế - chỉ xem thôi
    return;
  };

  const handleRowClick = (row: string) => {
    if (!readOnly) {
      onRowSelect(row);
    }
  };

  const handleColClick = (col: number) => {
    if (!readOnly) {
      onColSelect(col);
    }
  };

  // Generate seat ID from row and column
  const generateSeatId = (row: string, col: number) => `${row}${col}`;

  // Check if a row is fully selected (should be hidden)
  const isRowFullySelected = (row: string) => {
    if (!seatMapData?.rows) return false;

    const rowData = seatMapData.rows.find((r) => r.Row.toLowerCase() === row.toLowerCase());
    if (!rowData) return false;

    // Check if all seats in this row are selected
    const rowSeats = [];
    for (let i = 1; i <= rowData.Seats.length; i++) {
      rowSeats.push(`${row}${i}`);
    }

    return rowSeats.length > 0 && rowSeats.every((seatId) => selectedSeats.includes(seatId));
  };

  // Check if a column is fully selected (should be hidden)
  const isColFullySelected = (col: number) => {
    if (!seatMapData?.rows) return false;

    // Check if all seats in this column are selected
    const colSeats = [];
    seatMapData.rows.forEach((rowData) => {
      if (rowData.Seats.length >= col) {
        colSeats.push(`${rowData.Row}${col}`);
      }
    });

    return colSeats.length > 0 && colSeats.every((seatId) => selectedSeats.includes(seatId));
  };

  // Get seat data for a specific position
  const getSeatData = (row: string, col: number) => {
    if (!seatMapData?.rows) return null;
    const rowData = seatMapData.rows.find((r) => r.Row.toLowerCase() === row.toLowerCase());
    return rowData?.Seats.find((seat) => seat.Column_Number === col) || null;
  };

  const getSeatClassName = (seatId: string, row: string, col: number) => {
    let className = "seat";

    if (disabledSeats.includes(seatId)) {
      className += " seat-disabled";
    } else if (occupiedSeats?.includes(seatId)) {
      className += " seat-occupied";
    } else if (selectedSeats.includes(seatId)) {
      className += " seat-selected";
    } else {
      className += " seat-available";
    }

    if (vipSeats.includes(seatId)) {
      className += " seat-vip";
    }

    if (coupleSeats.includes(seatId)) {
      className += " seat-couple";
    }

    // Add hover effect for entire row/column
    if (!readOnly && (hoveredRow === row || hoveredCol === col)) {
      className += " seat-hover";
    }

    return className;
  };

  const getSeatColor = (seatId: string) => {
    // Extract row and column from seatId (e.g., "A1" -> row="A", col=1)
    const row = seatId.charAt(0);
    const col = parseInt(seatId.slice(1));
    const seatData = getSeatData(row, col);

    if (disabledSeats.includes(seatId) || (seatData && !seatData.Is_Active)) {
      return "#374151"; // gray-700
    } else if (occupiedSeats?.includes(seatId)) {
      return "#EF4444"; // red-500
    } else if (selectedSeats.includes(seatId)) {
      return "#FFD875"; // yellow
    } else if (vipSeats.includes(seatId) || (seatData && seatData.Seat_Type === "VIP")) {
      return "#8B5CF6"; // VIP purple
    } else if (coupleSeats.includes(seatId)) {
      return "#EC4899"; // pink-500
    } else {
      return "#10B981"; // green-500
    }
  };

  return (
    <motion.div
      className="bg-slate-900 rounded-lg p-6 border border-slate-700 shadow-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Curved Screen */}
      <div className="relative mb-12">
        <div className="relative">
          {/* Screen curve effect */}
          <div className="h-24 bg-gradient-to-b from-slate-700 to-slate-800 rounded-t-[100%] rounded-b-lg shadow-[0_20px_80px_20px_rgba(255,216,117,0.4)] relative overflow-hidden">
            {/* Inner glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#FFD875]/30 to-transparent"></div>
            {/* Bottom edge glow */}
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-[#FFD875] shadow-[0_0_30px_10px_rgba(255,216,117,0.8)]"></div>
            {/* Screen text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.p
                className="text-[#FFD875] font-bold text-2xl tracking-wider"
                animate={{
                  textShadow: [
                    "0 0 20px rgba(255,216,117,0.8)",
                    "0 0 40px rgba(255,216,117,1)",
                    "0 0 20px rgba(255,216,117,0.8)",
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                MÀN HÌNH
              </motion.p>
            </div>
          </div>

          {/* Light rays from screen */}
          <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 w-[150%] h-32 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-b from-[#FFD875]/20 via-[#FFD875]/10 to-transparent blur-3xl transform scale-150"></div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center mb-6 text-gray-400 text-sm flex-wrap gap-4">
        <div className="flex items-center">
          <span className="material-symbols-outlined text-green-500 mr-2" style={{ fontSize: "20px" }}>
            weekend
          </span>
          <span>Ghế thường</span>
        </div>
        <div className="flex items-center">
          <span className="material-symbols-outlined mr-2" style={{ fontSize: "20px", color: "#8B5CF6" }}>
            weekend
          </span>
          <span>Ghế VIP</span>
        </div>
      </div>

      {/* Seat Grid */}
      <div className="overflow-auto">
        <div
          className="seat-grid"
          style={{ gridTemplateColumns: `auto repeat(${allColumnNumbers.length}, auto)`, gap: "8px" }}
        >
          {/* Empty cell in top-left corner */}
          <div className="flex items-center justify-center p-2"></div>

          {/* Column headers */}
          {allColumnNumbers.map((col) => (
            <motion.div
              key={`col-${col}`}
              className={`flex items-center justify-center w-10 h-10 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer
                ${
                  !readOnly && hoveredCol === col
                    ? "bg-[#FFD875]/20 text-[#FFD875] shadow-[0_0_10px_0_rgba(255,216,117,0.4)]"
                    : "bg-slate-800 text-gray-400 hover:bg-slate-700"
                }`}
              onClick={() => handleColClick(col)}
              onMouseEnter={() => !readOnly && setHoveredCol(col)}
              onMouseLeave={() => setHoveredCol(null)}
              whileHover={!readOnly ? { scale: 1.1 } : {}}
              whileTap={!readOnly ? { scale: 0.95 } : {}}
            >
              {col}
            </motion.div>
          ))}

          {/* Rows with row headers */}
          {Array.from({ length: actualRowCount }, (_, i) => String.fromCharCode(65 + i)).map((row, rowIndex) => (
            <React.Fragment key={`row-${row}`}>
              {/* Row header */}
              <motion.div
                className={`flex items-center justify-center w-10 h-10 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer
                  ${
                    !readOnly && hoveredRow === row
                      ? "bg-[#FFD875]/20 text-[#FFD875] shadow-[0_0_10px_0_rgba(255,216,117,0.4)]"
                      : "bg-slate-800 text-gray-400 hover:bg-slate-700"
                  }`}
                onClick={() => handleRowClick(row)}
                onMouseEnter={() => !readOnly && setHoveredRow(row)}
                onMouseLeave={() => setHoveredRow(null)}
                whileHover={!readOnly ? { scale: 1.1 } : {}}
                whileTap={!readOnly ? { scale: 0.95 } : {}}
              >
                {row}
              </motion.div>

              {/* Seats in this row */}
              {allColumnNumbers.map((col, colIndex) => {
                const seatId = `${row}${col}`;

                // Check if seat should be hidden (row/column fully selected)
                if (isRowFullySelected(row) || isColFullySelected(col)) {
                  return (
                    <div key={`hidden-${row}-${col}`} className="w-10 h-10 flex items-center justify-center">
                      {/* Hidden seat space */}
                    </div>
                  );
                }

                // Check if seat exists in actual data
                const seatData = getSeatData(row, col);
                const seatExistsInData = seatData !== null;

                // If seat doesn't exist in data, show empty space
                if (!seatExistsInData) {
                  return (
                    <div key={`empty-${row}-${col}`} className="w-10 h-10 flex items-center justify-center">
                      {/* Empty space for missing seats */}
                    </div>
                  );
                }

                const isDisabled = disabledSeats.includes(seatId) || (seatData && !seatData.Is_Active);
                const isOccupied = occupiedSeats?.includes(seatId);
                const isSelected = selectedSeats.includes(seatId);
                const isVip = vipSeats.includes(seatId) || (seatData && seatData.Seat_Type === "VIP");
                const isCouple = coupleSeats.includes(seatId);
                const seatColor = getSeatColor(seatId);

                return (
                  <motion.div
                    key={seatId}
                    className={`relative w-10 h-10 rounded-t-lg rounded-b-sm flex items-center justify-center text-xs font-medium transition-all duration-300 cursor-default
                      ${isDisabled ? "opacity-40" : ""}`}
                    style={{
                      backgroundColor: isDisabled ? "#1F2937" : `${seatColor}20`,
                      borderColor: seatColor,
                      borderWidth: "2px",
                      borderStyle: "solid",
                    }}
                    onClick={() => handleSeatClick(seatId)}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      duration: 0.3,
                      delay: (rowIndex * cols + colIndex) * 0.01,
                      type: "spring",
                      stiffness: 200,
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{
                        fontSize: "24px",
                        color: seatColor,
                        fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24",
                      }}
                    >
                      weekend
                    </span>
                    {isSelected && (
                      <motion.div
                        className="absolute inset-0 rounded-t-lg rounded-b-sm pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{
                          background: `radial-gradient(circle, ${seatColor}40 0%, transparent 70%)`,
                        }}
                      />
                    )}
                  </motion.div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Summary */}
      <motion.div
        className="mt-6 flex justify-center gap-8 text-sm text-gray-400"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <div>
          Tổng số ghế:{" "}
          <span className="text-white font-medium">
            {seatMapData?.stats?.total_seats || actualRowCount * allColumnNumbers.length - disabledSeats.length}
          </span>
        </div>
        {selectedSeats.length > 0 && (
          <div>
            Đã chọn: <span className="text-[#FFD875] font-medium">{selectedSeats.length}</span>
          </div>
        )}
        {vipSeats.length > 0 && (
          <div>
            Ghế VIP:{" "}
            <span className="font-medium" style={{ color: "#8B5CF6" }}>
              {vipSeats.length}
            </span>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default RoomSeatMap;
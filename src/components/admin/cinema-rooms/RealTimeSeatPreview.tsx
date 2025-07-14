import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface SeatPreviewData {
    row: string;
    column: number;
    seatType: 'Regular' | 'VIP';
    isEmpty: boolean;
}

interface RealTimeSeatPreviewProps {
    rowsInput: string;
    seatsPerRow: number;
    seatType: 'Regular' | 'VIP';
    hiddenSeats: number[];
    className?: string;
    onToggleHiddenSeat?: (seatIndex: number) => void;
}

const RealTimeSeatPreview: React.FC<RealTimeSeatPreviewProps> = ({
    rowsInput,
    seatsPerRow,
    seatType,
    hiddenSeats,
    className = '',
    onToggleHiddenSeat
}) => {
    // Parse rows input (A-B, A-E, etc.)
    const parseRowsInput = (input: string): string[] => {
        if (!input.trim()) return [];
        
        const rows: string[] = [];
        const parts = input.split(',').map(part => part.trim());

        for (const part of parts) {
            if (part.includes('-')) {
                const [start, end] = part.split('-').map(s => s.trim().toUpperCase());
                if (start.length === 1 && end.length === 1) {
                    const startCode = start.charCodeAt(0);
                    const endCode = end.charCodeAt(0);
                    if (startCode <= endCode) {
                        for (let i = startCode; i <= endCode; i++) {
                            rows.push(String.fromCharCode(i));
                        }
                    }
                }
            } else if (part.length === 1) {
                rows.push(part.toUpperCase());
            }
        }

        return [...new Set(rows)].sort(); // Remove duplicates and sort
    };

    // Generate seat preview data
    const seatPreviewData = useMemo((): SeatPreviewData[] => {
        const rows = parseRowsInput(rowsInput);
        const seats: SeatPreviewData[] = [];

        rows.forEach(row => {
            for (let col = 1; col <= seatsPerRow; col++) {
                seats.push({
                    row,
                    column: col,
                    seatType,
                    isEmpty: hiddenSeats.includes(col)
                });
            }
        });

        return seats;
    }, [rowsInput, seatsPerRow, seatType, hiddenSeats]);

    // Group seats by row
    const seatsByRow = useMemo(() => {
        const grouped: { [key: string]: SeatPreviewData[] } = {};
        seatPreviewData.forEach(seat => {
            if (!grouped[seat.row]) {
                grouped[seat.row] = [];
            }
            grouped[seat.row].push(seat);
        });
        return grouped;
    }, [seatPreviewData]);

    // Get seat styling - Updated to match existing seat configuration colors
    const getSeatStyling = (seat: SeatPreviewData) => {
        if (seat.isEmpty) {
            return 'bg-transparent border-2 border-dashed border-gray-500 cursor-pointer hover:border-gray-400 transition-colors';
        }

        switch (seat.seatType) {
            case 'VIP':
                return 'bg-gradient-to-br from-purple-500/30 to-purple-600/20 border-purple-500 text-purple-400 shadow-lg cursor-pointer hover:from-purple-500/40 hover:to-purple-600/30 transition-all';
            default:
                return 'bg-gradient-to-br from-green-500/30 to-green-600/20 border-green-500 text-green-400 shadow-lg cursor-pointer hover:from-green-500/40 hover:to-green-600/30 transition-all';
        }
    };

    // Get seat icon - using simple shapes instead of emojis
    const getSeatIcon = (seat: SeatPreviewData) => {
        if (seat.isEmpty) return '';
        return seat.seatType === 'VIP' ? '★' : '■';
    };

    // Calculate stats
    const totalSeats = seatPreviewData.filter(seat => !seat.isEmpty).length;
    const totalRows = Object.keys(seatsByRow).length;

    if (!rowsInput.trim() || !seatsPerRow || seatsPerRow <= 0) {
        return (
            <div className={`bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-[#FFD875]/20 ${className}`}>
                <div className="text-center py-8 text-gray-400">
                    <div className="w-16 h-16 mx-auto mb-4 bg-slate-700/50 rounded-xl flex items-center justify-center border border-slate-600">
                        <svg className="w-8 h-8 text-[#FFD875]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v1a1 1 0 01-1 1v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7a1 1 0 01-1-1V5a1 1 0 011-1h4z" />
                        </svg>
                    </div>
                    <p className="text-lg font-medium mb-2 text-white">Preview sơ đồ ghế</p>
                    <p className="text-sm">
                        Nhập hàng ghế và số ghế mỗi hàng để xem preview
                    </p>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            className={`bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-[#FFD875]/20 shadow-xl ${className}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
        >
            {/* Screen */}
            <div className="text-center mb-8">
                <motion.div
                    className="inline-block bg-gradient-to-r from-[#FFD875]/30 to-[#FFA500]/20 border border-[#FFD875]/50 rounded-xl px-8 py-3 shadow-lg"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <div className="flex items-center gap-3">
                        <svg className="w-6 h-6 text-[#FFD875]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v1a1 1 0 01-1 1v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7a1 1 0 01-1-1V5a1 1 0 011-1h4z" />
                        </svg>
                        <p className="text-[#FFD875] font-bold text-lg tracking-wider">MÀN HÌNH</p>
                    </div>
                </motion.div>
            </div>

            {/* Seat Layout */}
            <div className="overflow-x-auto mb-6">
                <div className="min-w-max mx-auto space-y-3">
                    {Object.entries(seatsByRow).map(([rowLabel, seats]) => (
                        <motion.div
                            key={rowLabel}
                            className="flex items-center gap-4"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: rowLabel.charCodeAt(0) * 0.05 }}
                        >
                            {/* Row Label (Left) */}
                            <div className="w-10 text-center">
                                <div className="bg-[#FFD875]/20 rounded-lg py-2 px-1 border border-[#FFD875]/30">
                                    <span className="text-[#FFD875] font-bold text-sm">{rowLabel}</span>
                                </div>
                            </div>

                            {/* Seats */}
                            <div className="flex gap-1.5">
                                {seats.map(seat => (
                                    <motion.div
                                        key={`${seat.row}-${seat.column}`}
                                        className={`w-12 h-12 rounded-lg flex items-center justify-center text-sm font-medium transition-all duration-200 border-2 ${getSeatStyling(seat)}`}
                                        title={seat.isEmpty ? `${seat.row}${seat.column} - Ẩn (Click để hiện)` : `${seat.row}${seat.column} - ${seat.seatType} (Click để ẩn)`}
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{
                                            duration: 0.3,
                                            delay: seat.column * 0.03,
                                            type: "spring",
                                            stiffness: 200
                                        }}
                                        whileHover={{ scale: 1.15, y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => onToggleHiddenSeat && onToggleHiddenSeat(seat.index)}
                                    >
                                        <span className="text-sm">
                                            {getSeatIcon(seat)}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Row Label (Right) */}
                            <div className="w-10 text-center">
                                <div className="bg-[#FFD875]/20 rounded-lg py-2 px-1 border border-[#FFD875]/30">
                                    <span className="text-[#FFD875] font-bold text-sm">{rowLabel}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Stats */}
            <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
            >
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-[#FFD875]/20">
                    <h4 className="text-[#FFD875] font-semibold mb-3 text-sm flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                        </svg>
                        Thống kê sơ đồ
                    </h4>
                    <div className="grid grid-cols-3 gap-4">
                        <motion.div
                            className="bg-slate-700/30 rounded-lg p-3"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.2 }}
                        >
                            <p className="text-2xl font-bold text-[#FFD875] mb-1">{totalRows}</p>
                            <p className="text-gray-300 text-xs font-medium">Hàng ghế</p>
                        </motion.div>
                        <motion.div
                            className="bg-slate-700/30 rounded-lg p-3"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.2 }}
                        >
                            <p className="text-2xl font-bold text-[#FFD875] mb-1">{seatsPerRow}</p>
                            <p className="text-gray-300 text-xs font-medium">Ghế/hàng</p>
                        </motion.div>
                        <motion.div
                            className="bg-gradient-to-r from-[#FFD875]/20 to-[#FFA500]/20 rounded-lg p-3 border border-[#FFD875]/30"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.2 }}
                        >
                            <p className="text-2xl font-bold text-[#FFD875] mb-1">{totalSeats}</p>
                            <p className="text-[#FFD875] text-xs font-medium">Tổng ghế</p>
                        </motion.div>
                    </div>

                    {/* Seat Type Legend */}
                    <div className="mt-4 flex justify-center gap-4 text-xs">
                        <div className="flex items-center gap-2 bg-slate-700/30 px-3 py-1 rounded-lg">
                            <div className={`w-4 h-4 rounded ${seatType === 'VIP' ? 'bg-purple-500/30 border border-purple-500' : 'bg-green-500/30 border border-green-500'}`}></div>
                            <span className="text-gray-300">{seatType === 'VIP' ? 'Ghế VIP' : 'Ghế thường'}</span>
                        </div>
                        {hiddenSeats.length > 0 && (
                            <div className="flex items-center gap-2 bg-slate-700/30 px-3 py-1 rounded-lg">
                                <div className="w-4 h-4 rounded border-2 border-dashed border-gray-500"></div>
                                <span className="text-gray-300">{hiddenSeats.length * totalRows} ghế ẩn</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2 bg-slate-700/30 px-3 py-1 rounded-lg">
                            <span className="text-gray-300">Click ghế để ẩn/hiện</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default RealTimeSeatPreview;

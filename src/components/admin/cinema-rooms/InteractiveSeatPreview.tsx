import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
    EyeIcon,
    EyeSlashIcon,
    UserIcon,
    StarIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline';

// CSS tùy chỉnh cho component
const customStyles = `
    .seat-preview-container {
        /* Auto height - no scrollbar needed */
        height: auto !important;
        max-height: none !important;
        overflow: visible !important;
    }

    /* Seat hover effects */
    .seat-glow-effect {
        filter: drop-shadow(0 0 8px currentColor);
    }

    /* Screen glow animation */
    @keyframes screen-glow {
        0%, 100% { opacity: 0.3; }
        50% { opacity: 0.8; }
    }

    .screen-glow {
        animation: screen-glow 3s ease-in-out infinite;
    }
`;

// Inject styles
if (typeof document !== 'undefined') {
    const styleElement = document.createElement('style');
    styleElement.textContent = customStyles;
    if (!document.head.querySelector('style[data-component="InteractiveSeatPreview"]')) {
        styleElement.setAttribute('data-component', 'InteractiveSeatPreview');
        document.head.appendChild(styleElement);
    }
}

interface SeatData {
    row: string;
    column: number;
    seatType: 'Regular' | 'VIP';
    isEmpty: boolean;
    index: number;
    layoutId?: number;
}

interface InteractiveSeatPreviewProps {
    rowsInput: string;
    seatsPerRow: number;
    defaultSeatType: 'Regular' | 'VIP';
    hiddenSeats: number[];
    seatTypeOverrides?: { [key: number]: 'Regular' | 'VIP' };
    className?: string;
    roomId?: number;
    isNewRoom?: boolean;
    readOnly?: boolean; // Chế độ chỉ xem, không cho chỉnh sửa
    onSeatTypeChange?: (seatIndex: number, newType: 'Regular' | 'VIP') => void;
    onToggleHiddenSeat?: (seatIndex: number) => void;
    onStatsUpdate?: (stats: { total: number; regular: number; vip: number; hidden: number }) => void;
}

const InteractiveSeatPreview: React.FC<InteractiveSeatPreviewProps> = ({
    rowsInput,
    seatsPerRow,
    defaultSeatType,
    hiddenSeats,
    seatTypeOverrides = {},
    className = '',
    roomId,
    isNewRoom = true,
    readOnly = false,
    onSeatTypeChange,
    onToggleHiddenSeat,
    onStatsUpdate
}) => {
    const [hoveredSeat, setHoveredSeat] = useState<number | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    // CSS styles để đảm bảo layout tự động điều chỉnh chiều cao
    const containerStyles = {
        minHeight: 'fit-content',
        height: 'auto',
        overflow: 'visible'
    };

    // Parse rows input
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

        return [...new Set(rows)].sort();
    };

    // Generate seat data
    const seatData = useMemo(() => {
        const rows = parseRowsInput(rowsInput);
        const seats: SeatData[] = [];
        let seatIndex = 0;

        rows.forEach(row => {
            for (let col = 1; col <= seatsPerRow; col++) {
                const isEmpty = hiddenSeats.includes(seatIndex);
                const actualSeatType = seatTypeOverrides[seatIndex] || defaultSeatType;
                
                seats.push({
                    row,
                    column: col,
                    seatType: actualSeatType,
                    isEmpty,
                    index: seatIndex
                });
                seatIndex++;
            }
        });

        return seats;
    }, [rowsInput, seatsPerRow, defaultSeatType, hiddenSeats, seatTypeOverrides]);

    // Calculate statistics
    const stats = useMemo(() => {
        const total = seatData.length;
        const hidden = hiddenSeats.length;
        const visible = seatData.filter(seat => !seat.isEmpty);

        const regular = visible.filter(seat => seat.seatType === 'Regular').length;
        const vip = visible.filter(seat => seat.seatType === 'VIP').length;

        return { total, regular, vip, hidden };
    }, [seatData, hiddenSeats]);

    // Update stats when they change
    React.useEffect(() => {
        onStatsUpdate?.(stats);
    }, [stats, onStatsUpdate]);

    // Get seat styling - Enhanced với hiệu ứng đẹp hơn
    const getSeatStyling = (seat: SeatData) => {
        if (seat.isEmpty) {
            return 'bg-transparent border-2 border-dashed border-gray-500/60 cursor-pointer hover:border-gray-400/80 transition-all duration-300 hover:bg-gray-500/10 hover:shadow-lg';
        }

        const baseClasses = 'cursor-pointer transition-all duration-300 border-2 shadow-xl';
        const hoverClasses = 'hover:shadow-2xl transform-gpu';

        switch (seat.seatType) {
            case 'VIP':
                return `${baseClasses} ${hoverClasses} bg-gradient-to-br from-purple-500/40 via-purple-600/30 to-purple-700/20 border-purple-400/60 text-purple-300 hover:from-purple-500/60 hover:via-purple-600/50 hover:to-purple-700/40 hover:border-purple-300 hover:text-purple-200 shadow-purple-500/20 hover:shadow-purple-500/40`;
            default:
                return `${baseClasses} ${hoverClasses} bg-gradient-to-br from-green-500/40 via-green-600/30 to-green-700/20 border-green-400/60 text-green-300 hover:from-green-500/60 hover:via-green-600/50 hover:to-green-700/40 hover:border-green-300 hover:text-green-200 shadow-green-500/20 hover:shadow-green-500/40`;
        }
    };

    // Get seat icon
    const getSeatIcon = (seat: SeatData) => {
        if (seat.isEmpty) {
            return <EyeSlashIcon className="w-4 h-4 text-gray-500" />;
        }

        switch (seat.seatType) {
            case 'VIP':
                return <StarIcon className="w-4 h-4" />;
            default:
                return <UserIcon className="w-4 h-4" />;
        }
    };

    // Validate VIP seat placement (only bottom half)
    const isVipAllowed = useCallback((seatIndex: number) => {
        const rows = parseRowsInput(rowsInput);
        const totalRows = rows.length;
        const rowIndex = Math.floor(seatIndex / seatsPerRow);

        // Calculate split point
        const isOdd = totalRows % 2 === 1;
        const splitPoint = isOdd ? Math.ceil(totalRows / 2) : totalRows / 2;

        // VIP only allowed from split point onwards (bottom half)
        return rowIndex >= splitPoint;
    }, [rowsInput, seatsPerRow]);

    // Handle seat click (cycle through seat types)
    const handleSeatClick = useCallback((seat: SeatData, event: React.MouseEvent) => {
        event.preventDefault();

        // Không cho phép chỉnh sửa khi ở chế độ readOnly
        if (readOnly) {
            toast.info('Chế độ xem trước - không thể chỉnh sửa');
            return;
        }

        if (event.ctrlKey || event.metaKey) {
            // Ctrl+Click to toggle hidden state
            onToggleHiddenSeat?.(seat.index);
        } else {
            // Regular click to cycle seat type
            if (!seat.isEmpty) {
                const seatTypes: ('Regular' | 'VIP')[] = ['Regular', 'VIP'];
                const currentIndex = seatTypes.indexOf(seat.seatType);
                const nextIndex = (currentIndex + 1) % seatTypes.length;
                const newType = seatTypes[nextIndex];

                // Validate VIP placement
                if (newType === 'VIP' && !isVipAllowed(seat.index)) {
                    toast.error('Ghế VIP chỉ được đặt ở nửa dưới của phòng chiếu');
                    return;
                }

                onSeatTypeChange?.(seat.index, newType);
            } else {
                // If seat is hidden, show it
                onToggleHiddenSeat?.(seat.index);
            }
        }
    }, [onSeatTypeChange, onToggleHiddenSeat, isVipAllowed, readOnly]);

    // Handle right click (toggle hidden state)
    const handleSeatRightClick = useCallback((seat: SeatData, event: React.MouseEvent) => {
        event.preventDefault();

        // Không cho phép chỉnh sửa khi ở chế độ readOnly
        if (readOnly) {
            toast.info('Chế độ xem trước - không thể chỉnh sửa');
            return;
        }

        onToggleHiddenSeat?.(seat.index);
    }, [onToggleHiddenSeat, readOnly]);

    // Handle row click (toggle entire row)
    const handleRowClick = useCallback((rowIndex: number, event: React.MouseEvent) => {
        event.preventDefault();
        const startIndex = rowIndex * seatsPerRow;
        const endIndex = startIndex + seatsPerRow;

        if (event.ctrlKey || event.metaKey) {
            // Ctrl+Click: Toggle hidden state for entire row
            for (let i = startIndex; i < endIndex; i++) {
                onToggleHiddenSeat?.(i);
            }
        } else {
            // Regular click: Change seat type for entire row
            // Check current seat type of first visible seat in row to determine toggle direction
            const rowSeats = seatData.slice(startIndex, endIndex);
            const visibleSeats = rowSeats.filter(seat => !seat.isEmpty);

            if (visibleSeats.length === 0) return; // No visible seats in row

            // Determine new type based on majority of visible seats
            const vipCount = visibleSeats.filter(seat => seat.seatType === 'VIP').length;
            const regularCount = visibleSeats.filter(seat => seat.seatType === 'Regular').length;

            // If majority is VIP or equal, switch to Regular. Otherwise switch to VIP
            const newType = vipCount >= regularCount ? 'Regular' : 'VIP';

            // Check VIP validation for the row
            if (newType === 'VIP' && !isVipAllowed(startIndex)) {
                toast.error('Ghế VIP chỉ được đặt ở nửa dưới của phòng chiếu');
                return;
            }

            for (let i = startIndex; i < endIndex; i++) {
                onSeatTypeChange?.(i, newType);
            }
        }
    }, [seatsPerRow, seatData, isVipAllowed, onToggleHiddenSeat, onSeatTypeChange]);

    // Handle column click (toggle entire column)
    const handleColumnClick = useCallback((columnIndex: number, event: React.MouseEvent) => {
        event.preventDefault();
        const rows = parseRowsInput(rowsInput);
        const totalRows = rows.length;

        if (event.ctrlKey || event.metaKey) {
            // Ctrl+Click: Toggle hidden state for entire column
            for (let rowIndex = 0; rowIndex < totalRows; rowIndex++) {
                const seatIndex = rowIndex * seatsPerRow + columnIndex;
                onToggleHiddenSeat?.(seatIndex);
            }
        } else {
            // Regular click: Change seat type for entire column
            // Check current seat type of visible seats in column to determine toggle direction
            const columnSeats = [];
            for (let rowIndex = 0; rowIndex < totalRows; rowIndex++) {
                const seatIndex = rowIndex * seatsPerRow + columnIndex;
                const seat = seatData[seatIndex];
                if (seat && !seat.isEmpty) {
                    columnSeats.push(seat);
                }
            }

            if (columnSeats.length === 0) return; // No visible seats in column

            // Determine new type based on majority of visible seats
            const vipCount = columnSeats.filter(seat => seat.seatType === 'VIP').length;
            const regularCount = columnSeats.filter(seat => seat.seatType === 'Regular').length;

            // If majority is VIP or equal, switch to Regular. Otherwise switch to VIP
            const newType = vipCount >= regularCount ? 'Regular' : 'VIP';

            for (let rowIndex = 0; rowIndex < totalRows; rowIndex++) {
                const seatIndex = rowIndex * seatsPerRow + columnIndex;

                // Check VIP validation
                if (newType === 'VIP' && !isVipAllowed(seatIndex)) {
                    continue; // Skip seats that can't be VIP
                }

                onSeatTypeChange?.(seatIndex, newType);
            }
        }
    }, [rowsInput, seatsPerRow, seatData, isVipAllowed, onToggleHiddenSeat, onSeatTypeChange]);

    const rows = parseRowsInput(rowsInput);
    const totalRows = rows.length;

    if (!rowsInput.trim() || seatsPerRow === 0) {
        return (
            <motion.div
                className={`flex items-center justify-center h-96 bg-gradient-to-br from-slate-700/30 via-slate-800/20 to-slate-700/30 rounded-2xl border-2 border-dashed border-slate-600/50 ${className}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="text-center p-8">
                    <motion.div
                        animate={{
                            rotate: [0, 10, -10, 0],
                            scale: [1, 1.1, 1]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        <InformationCircleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    </motion.div>
                    <h3 className="text-lg font-semibold text-gray-300 mb-2">Chưa có dữ liệu sơ đồ ghế</h3>
                    <p className="text-gray-400 text-sm max-w-md">
                        Vui lòng nhập thông tin hàng ghế và số ghế mỗi hàng để xem preview sơ đồ ghế
                    </p>
                    <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                        <div className="w-2 h-2 bg-[#FFD875] rounded-full animate-pulse"></div>
                        <span>Đang chờ cấu hình...</span>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <div className={`space-y-4 ${className}`} style={containerStyles}>
            {/* Screen - Enhanced design */}
            <div className="relative mb-6">
                <motion.div
                    className="bg-gradient-to-r from-[#FFD875]/30 via-[#FFD875]/60 to-[#FFD875]/30 rounded-2xl py-4 px-8 text-center border-2 border-[#FFD875]/50 shadow-2xl"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <span className="text-[#FFD875] font-bold text-lg tracking-wider">MÀN HÌNH CHIẾU</span>
                    <div className="mt-1 text-xs text-[#FFD875]/80">SCREEN</div>
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FFD875]/20 to-transparent rounded-2xl blur-xl"></div>

                {/* Screen glow effect */}
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-3/4 h-2 bg-gradient-to-r from-transparent via-[#FFD875]/30 to-transparent rounded-full blur-lg screen-glow" />
            </div>

            {/* Column Numbers - Responsive size */}
            <div className="flex items-center gap-1 mb-3">
                {/* Empty space for row labels */}
                <div className={`${seatsPerRow > 20 ? 'w-6' : seatsPerRow > 15 ? 'w-7' : 'w-8'}`}></div>

                {/* Column numbers - Dynamic sizing */}
                <div className="flex gap-0.5">
                    {Array.from({ length: seatsPerRow }, (_, index) => {
                        // Tính toán kích thước dựa trên số cột
                        const sizeClass = seatsPerRow > 20 ? 'w-5 h-5 text-xs' :
                                         seatsPerRow > 15 ? 'w-6 h-6 text-xs' :
                                         'w-8 h-6 text-xs';

                        return (
                            <motion.div
                                key={index}
                                className={`${sizeClass} rounded flex items-center justify-center font-bold bg-gradient-to-br from-[#FFD875]/20 to-[#FFD875]/10 border border-[#FFD875]/40 text-[#FFD875] cursor-pointer hover:from-[#FFD875]/30 hover:to-[#FFD875]/20 transition-all duration-200`}
                                title={`Cột ${index + 1} - Click để đổi loại ghế, Ctrl+Click để ẩn/hiện`}
                                onClick={(e) => !readOnly && handleColumnClick(index, e)}
                                whileHover={{ scale: readOnly ? 1 : 1.05, y: readOnly ? 0 : -1 }}
                                whileTap={{ scale: readOnly ? 1 : 0.95 }}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.02 }}
                            >
                                {index + 1}
                            </motion.div>
                        );
                    })}
                </div>

                {/* Empty space for row labels */}
                <div className={`${seatsPerRow > 20 ? 'w-6' : seatsPerRow > 15 ? 'w-7' : 'w-8'}`}></div>
            </div>

            {/* Seat Grid - Responsive size */}
            <div className="space-y-1 seat-preview-container px-1">
                {rows.map((rowLabel, rowIndex) => {
                    const rowSeats = seatData.slice(rowIndex * seatsPerRow, (rowIndex + 1) * seatsPerRow);

                    // Tính toán kích thước dựa trên số cột
                    const seatSize = seatsPerRow > 20 ? 'w-5 h-5' :
                                    seatsPerRow > 15 ? 'w-6 h-6' :
                                    'w-8 h-8';
                    const rowLabelSize = seatsPerRow > 20 ? 'w-6' :
                                        seatsPerRow > 15 ? 'w-7' :
                                        'w-8';
                    const gapSize = seatsPerRow > 20 ? 'gap-0.5' : 'gap-1';

                    return (
                        <motion.div
                            key={rowLabel}
                            className={`flex items-center ${gapSize}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: rowIndex * 0.05 }}
                        >
                            {/* Row Label (Left) - Responsive */}
                            <div className={`${rowLabelSize} text-center`}>
                                <motion.div
                                    className="bg-gradient-to-br from-[#FFD875]/30 to-[#FFD875]/20 rounded py-1 px-1 border border-[#FFD875]/40 cursor-pointer hover:from-[#FFD875]/40 hover:to-[#FFD875]/30 transition-all duration-200"
                                    title={`Hàng ${rowLabel} - Click để đổi loại ghế, Ctrl+Click để ẩn/hiện`}
                                    onClick={(e) => !readOnly && handleRowClick(rowIndex, e)}
                                    whileHover={{ scale: readOnly ? 1 : 1.05, y: readOnly ? 0 : -1 }}
                                    whileTap={{ scale: readOnly ? 1 : 0.95 }}
                                >
                                    <span className="text-[#FFD875] font-bold text-xs">{rowLabel}</span>
                                </motion.div>
                            </div>

                            {/* Seats - Responsive size */}
                            <div className={`flex ${gapSize}`}>
                                {rowSeats.map(seat => (
                                    <motion.div
                                        key={`${seat.row}-${seat.column}`}
                                        className={`${seatSize} rounded-lg flex items-center justify-center text-xs font-medium relative overflow-hidden ${getSeatStyling(seat)}`}
                                        title={
                                            readOnly ? `${seat.row}${seat.column} - ${seat.isEmpty ? 'Ẩn' : seat.seatType}` :
                                            seat.isEmpty
                                                ? `${seat.row}${seat.column} - Ẩn (Click để hiện, Ctrl+Click để ẩn/hiện)`
                                                : `${seat.row}${seat.column} - ${seat.seatType} (Click để đổi loại, Ctrl+Click để ẩn/hiện)`
                                        }
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{
                                            duration: 0.3,
                                            delay: seat.column * 0.02,
                                            type: "spring",
                                            stiffness: 200
                                        }}
                                        whileHover={{
                                            scale: readOnly ? 1.05 : 1.15,
                                            y: readOnly ? 0 : -2,
                                            transition: { duration: 0.2 }
                                        }}
                                        whileTap={{ scale: readOnly ? 1 : 0.9 }}
                                        onClick={(e) => handleSeatClick(seat, e)}
                                        onContextMenu={(e) => handleSeatRightClick(seat, e)}
                                        onMouseEnter={() => setHoveredSeat(seat.index)}
                                        onMouseLeave={() => setHoveredSeat(null)}
                                    >
                                        {/* Seat background glow effect */}
                                        {!seat.isEmpty && (
                                            <motion.div
                                                className={`absolute inset-0 rounded-lg ${
                                                    seat.seatType === 'VIP'
                                                        ? 'bg-gradient-to-br from-purple-500/20 to-purple-600/10'
                                                        : 'bg-gradient-to-br from-green-500/20 to-green-600/10'
                                                }`}
                                                animate={hoveredSeat === seat.index ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                                                transition={{ duration: 0.3 }}
                                            />
                                        )}

                                        {/* Seat icon */}
                                        <span className="relative z-10">
                                            {getSeatIcon(seat)}
                                        </span>

                                        {/* Seat number overlay on hover */}
                                        {hoveredSeat === seat.index && !seat.isEmpty && (
                                            <motion.div
                                                className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-slate-900/90 text-white text-xs px-1 py-0.5 rounded border border-slate-600 shadow-lg z-20"
                                                initial={{ opacity: 0, y: 3 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 3 }}
                                            >
                                                {seat.row}{seat.column}
                                            </motion.div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>

                            {/* Row Label (Right) - Responsive */}
                            <div className={`${rowLabelSize} text-center`}>
                                <motion.div
                                    className="bg-gradient-to-br from-[#FFD875]/30 to-[#FFD875]/20 rounded py-1 px-1 border border-[#FFD875]/40 cursor-pointer hover:from-[#FFD875]/40 hover:to-[#FFD875]/30 transition-all duration-200"
                                    title={`Hàng ${rowLabel} - Click để đổi loại ghế, Ctrl+Click để ẩn/hiện`}
                                    onClick={(e) => !readOnly && handleRowClick(rowIndex, e)}
                                    whileHover={{ scale: readOnly ? 1 : 1.05, y: readOnly ? 0 : -1 }}
                                    whileTap={{ scale: readOnly ? 1 : 0.95 }}
                                >
                                    <span className="text-[#FFD875] font-bold text-xs">{rowLabel}</span>
                                </motion.div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Legend - Compact display */}
            <div className="space-y-3 mt-4">
                {/* Seat Type Legend - Very compact */}
                <div className="flex justify-center gap-1 flex-wrap">
                    <motion.div
                        className="flex items-center gap-1 bg-gradient-to-r from-green-500/20 to-green-600/10 px-2 py-1 rounded border border-green-500/30"
                        whileHover={{ scale: 1.02, y: -1 }}
                        transition={{ duration: 0.2 }}
                    >
                        <UserIcon className="w-3 h-3 text-green-400" />
                        <span className="text-green-300 font-medium text-xs">Thường</span>
                    </motion.div>
                    <motion.div
                        className="flex items-center gap-1 bg-gradient-to-r from-purple-500/20 to-purple-600/10 px-2 py-1 rounded border border-purple-500/30"
                        whileHover={{ scale: 1.02, y: -1 }}
                        transition={{ duration: 0.2 }}
                    >
                        <StarIcon className="w-3 h-3 text-purple-400" />
                        <span className="text-purple-300 font-medium text-xs">VIP</span>
                    </motion.div>
                    <motion.div
                        className="flex items-center gap-1 bg-gradient-to-r from-gray-500/20 to-gray-600/10 px-2 py-1 rounded border border-gray-500/30"
                        whileHover={{ scale: 1.02, y: -1 }}
                        transition={{ duration: 0.2 }}
                    >
                        <EyeSlashIcon className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-300 font-medium text-xs">Ẩn</span>
                    </motion.div>
                </div>

                {/* Statistics - Compact size */}
                <motion.div
                    className="bg-gradient-to-br from-slate-700/40 to-slate-800/30 rounded-lg p-3 border border-slate-600/30"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <h4 className="text-[#FFD875] font-bold text-center mb-2 text-sm">Thống kê nhanh</h4>
                    <div className="grid grid-cols-4 gap-2">
                        <motion.div
                            className="text-center bg-slate-600/30 rounded p-2 border border-slate-500/30"
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="text-lg font-bold text-white">{stats.total}</div>
                            <div className="text-gray-400 text-xs">Tổng</div>
                        </motion.div>
                        <motion.div
                            className="text-center bg-gradient-to-br from-green-500/20 to-green-600/10 rounded p-2 border border-green-500/30"
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="text-lg font-bold text-green-400">{stats.regular}</div>
                            <div className="text-green-300 text-xs">Thường</div>
                        </motion.div>
                        <motion.div
                            className="text-center bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded p-2 border border-purple-500/30"
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="text-lg font-bold text-purple-400">{stats.vip}</div>
                            <div className="text-purple-300 text-xs">VIP</div>
                        </motion.div>
                        <motion.div
                            className="text-center bg-gradient-to-br from-gray-500/20 to-gray-600/10 rounded p-2 border border-gray-500/30"
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="text-lg font-bold text-gray-400">{stats.hidden}</div>
                            <div className="text-gray-300 text-xs">Ẩn</div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Quick Instructions - Very compact */}
                {!readOnly && (
                    <motion.div
                        className="bg-gradient-to-br from-slate-700/40 to-slate-800/30 rounded-lg p-2 border border-[#FFD875]/20"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <h4 className="text-[#FFD875] font-bold text-center mb-1 text-xs">Hướng dẫn</h4>
                        <div className="space-y-1 text-xs">
                            <div className="flex items-center gap-1 p-1 bg-slate-600/20 rounded">
                                <div className="w-1 h-1 bg-[#FFD875] rounded-full"></div>
                                <span className="text-gray-300">Click ghế để đổi loại</span>
                            </div>
                            <div className="flex items-center gap-1 p-1 bg-slate-600/20 rounded">
                                <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                                <span className="text-gray-300">Ctrl+Click để ẩn/hiện</span>
                            </div>
                            <div className="flex items-center gap-1 p-1 bg-slate-600/20 rounded">
                                <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                                <span className="text-gray-300">Click hàng/cột cho hàng loạt</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default InteractiveSeatPreview;

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
    PlusIcon,
    TrashIcon,
    PencilIcon,
    CheckIcon,
    XMarkIcon,
    ArrowPathIcon,
    BuildingOfficeIcon,
    CubeIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';
import { seatLayoutService } from '../../../services/seatLayoutService';
import type { ApiResponse } from '../../../services/seatLayoutService';
import RoomSeatMap from '../../../pages/admin/cinema-rooms/RoomSeatMap';
import type { SeatMap, SeatType } from '../../../types/seatLayout';
import FullScreenLoader from '../../FullScreenLoader';
import { cinemaRoomService } from '../../../services/cinemaRoomService';
import { cinemaService } from '../../../services/cinemaService';
import type { CinemaRoom } from '../../../types/cinemaRoom';
import type { Cinema } from '../../../types/cinema';
import { seatService } from '../../../services/seatService';

interface SeatLayoutManagerProps {
    roomId: number;
    readOnly?: boolean;
    onLayoutChange?: () => void;
}

const SeatLayoutManager: React.FC<SeatLayoutManagerProps> = ({
    roomId,
    readOnly = false,
    onLayoutChange
}) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [seatMap, setSeatMap] = useState<SeatMap | null>(null);
    const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
    const [currentSeatType, setCurrentSeatType] = useState<SeatType>('Regular');
    const [configMode, setConfigMode] = useState<boolean>(false);
    const [roomDetails, setRoomDetails] = useState<CinemaRoom | null>(null);
    const [cinemaDetails, setCinemaDetails] = useState<Cinema | null>(null);

    const [bulkConfig, setBulkConfig] = useState({
        rowsInput: '',
        columnsPerRow: '',
        seatType: 'Regular' as SeatType,
        emptyColumns: ''
    });

    // Add validation errors state
    const [validationErrors, setValidationErrors] = useState({
        rowsInput: '',
        columnsPerRow: '',
        totalSeats: ''
    });

    // Fetch room and cinema details
    useEffect(() => {
        const loadDetails = async () => {
            if (!roomId) return;

            try {
                // Load room details
                const room = await cinemaRoomService.getCinemaRoomById(roomId);
                setRoomDetails(room);

                // Load cinema details if Cinema_ID exists
                if (room && room.Cinema_ID) {
                    try {
                        const cinema = await cinemaService.getCinemaById(room.Cinema_ID);
                        setCinemaDetails(cinema);
                    } catch (error) {
                        console.error('Error loading cinema details:', error);
                    }
                }
            } catch (error) {
                console.error('Error loading room details:', error);
            }
        };

        loadDetails();
    }, [roomId]);

    // Fetch seat layout data
    useEffect(() => {
        loadSeatLayout();
    }, [roomId]);

    const loadSeatLayout = async () => {
        if (!roomId) return;

        setLoading(true);
        try {
            const response = await seatLayoutService.getSeatLayoutByRoomId(roomId);
            if (response && response.data) {
                setSeatMap(response.data);
            } else {
                setSeatMap(null);
            }
        } catch (error: any) {
            console.error('Error loading seat layout:', error);
            if (error.response?.status === 404) {
                setSeatMap(null);
            } else {
                toast.error('Không thể tải sơ đồ ghế: ' + (error.message || 'Lỗi không xác định'));
            }
        } finally {
            setLoading(false);
        }
    };

    // Handle seat selection
    const handleSeatSelect = (seatId: string) => {
        if (readOnly) return;

        setSelectedSeats(prev =>
            prev.includes(seatId)
                ? prev.filter(id => id !== seatId)
                : [...prev, seatId]
        );
    };

    // Handle row selection
    const handleRowSelect = (row: string) => {
        if (readOnly || !seatMap) return;

        const rowSeats: string[] = [];
        for (let i = 1; i <= (seatMap?.dimensions.columns || 12); i++) {
            rowSeats.push(`${row}${i}`);
        }

        const allSelected = rowSeats.every(seat => selectedSeats.includes(seat));

        if (allSelected) {
            setSelectedSeats(prev => prev.filter(id => !rowSeats.includes(id)));
        } else {
            setSelectedSeats(prev => {
                const newSelection = [...prev];
                rowSeats.forEach(seat => {
                    if (!newSelection.includes(seat)) {
                        newSelection.push(seat);
                    }
                });
                return newSelection;
            });
        }
    };

    // Handle column selection
    const handleColSelect = (col: number) => {
        if (readOnly || !seatMap) return;

        const colSeats: string[] = [];
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (let i = 0; i < (seatMap?.dimensions.rows || 8); i++) {
            colSeats.push(`${alphabet[i]}${col}`);
        }

        const allSelected = colSeats.every(seat => selectedSeats.includes(seat));

        if (allSelected) {
            setSelectedSeats(prev => prev.filter(id => !colSeats.includes(id)));
        } else {
            setSelectedSeats(prev => {
                const newSelection = [...prev];
                colSeats.forEach(seat => {
                    if (!newSelection.includes(seat)) {
                        newSelection.push(seat);
                    }
                });
                return newSelection;
            });
        }
    };

    // Apply seat type to selected seats
    const applySeatType = async () => {
        if (!seatMap || !seatMap.rows || selectedSeats.length === 0) return;

        const layoutIds: number[] = [];
        seatMap.rows.forEach(row => {
            row.Seats.forEach(seat => {
                const seatId = `${seat.Row_Label}${seat.Column_Number}`;
                if (selectedSeats.includes(seatId)) {
                    layoutIds.push(seat.Layout_ID);
                }
            });
        });

        if (layoutIds.length === 0) return;

        try {
            const toastId = toast.loading(`Đang cập nhật ${layoutIds.length} ghế...`);
            await seatLayoutService.bulkUpdateSeatTypes({
                LayoutIds: layoutIds,
                SeatType: currentSeatType
            });
            toast.success(`Đã cập nhật ${layoutIds.length} ghế thành công`, { id: toastId });
            setSelectedSeats([]);
            loadSeatLayout();
            if (onLayoutChange) onLayoutChange();
        } catch (error: any) {
            console.error('Error updating seat types:', error);
            toast.error('Không thể cập nhật loại ghế: ' + (error.message || 'Lỗi không xác định'));
        }
    };

    // Delete selected seats
    const deleteSelectedSeats = async () => {
        if (!seatMap || !seatMap.rows || selectedSeats.length === 0) return;

        const layoutIds: number[] = [];
        seatMap.rows.forEach(row => {
            row.Seats.forEach(seat => {
                const seatId = `${seat.Row_Label}${seat.Column_Number}`;
                if (selectedSeats.includes(seatId)) {
                    layoutIds.push(seat.Layout_ID);
                }
            });
        });

        if (layoutIds.length === 0) return;

        if (!window.confirm(`Bạn có chắc chắn muốn xóa ${layoutIds.length} ghế đã chọn không?`)) {
            return;
        }

        try {
            const toastId = toast.loading(`Đang xóa ${layoutIds.length} ghế...`);
            await seatLayoutService.softDeleteSeatLayouts({
                LayoutIds: layoutIds
            });
            toast.success(`Đã xóa ${layoutIds.length} ghế thành công`, { id: toastId });
            setSelectedSeats([]);
            loadSeatLayout();
            if (onLayoutChange) onLayoutChange();
        } catch (error: any) {
            console.error('Error deleting seats:', error);
            toast.error('Không thể xóa ghế: ' + (error.message || 'Lỗi không xác định'));
        }
    };

    // Calculate total seats based on current input
    const calculateTotalSeats = (rowsInput: string, columnsPerRow: string, emptyColumns: string): number => {
        if (!rowsInput.trim() || !columnsPerRow) return 0;

        const columns = parseInt(columnsPerRow);
        if (isNaN(columns)) return 0;

        // Parse rows
        let totalRows = 0;
        if (rowsInput.includes('-')) {
            // Range format: A-E
            const parts = rowsInput.split('-');
            if (parts.length === 2) {
                const startChar = parts[0].trim().toUpperCase();
                const endChar = parts[1].trim().toUpperCase();
                const startIndex = startChar.charCodeAt(0) - 'A'.charCodeAt(0);
                const endIndex = endChar.charCodeAt(0) - 'A'.charCodeAt(0);
                if (startIndex >= 0 && endIndex >= startIndex) {
                    totalRows = endIndex - startIndex + 1;
                }
            }
        } else {
            // List format: A,B,C,D,E
            const rows = rowsInput.split(',').map(r => r.trim()).filter(r => r.length > 0);
            totalRows = rows.length;
        }

        // Calculate empty columns
        const emptyColumnsList = emptyColumns
            .split(',')
            .map(c => parseInt(c.trim()))
            .filter(c => !isNaN(c) && c > 0 && c <= columns);

        const seatsPerRow = columns - emptyColumnsList.length;
        return totalRows * seatsPerRow;
    };

    // Validate inputs in real-time
    const validateInputs = (rowsInput: string, columnsPerRow: string, emptyColumns: string) => {
        const errors = {
            rowsInput: '',
            columnsPerRow: '',
            totalSeats: ''
        };

        // Validate rows input
        if (!rowsInput.trim()) {
            errors.rowsInput = 'Vui lòng nhập hàng ghế';
        } else {
            // Check format
            const isValidRange = /^[A-Z]-[A-Z]$/i.test(rowsInput.trim());
            const isValidList = /^[A-Z](,[A-Z])*$/i.test(rowsInput.trim().replace(/\s/g, ''));

            if (!isValidRange && !isValidList) {
                errors.rowsInput = 'Định dạng không hợp lệ. Sử dụng A-E hoặc A,B,C,D,E';
            }
        }

        // Validate columns
        const columns = parseInt(columnsPerRow);
        if (!columnsPerRow) {
            errors.columnsPerRow = 'Vui lòng nhập số cột';
        } else if (isNaN(columns) || columns < 5 || columns > 20) {
            errors.columnsPerRow = 'Số cột phải từ 5 đến 20';
        }

        // Validate total seats
        const totalSeats = calculateTotalSeats(rowsInput, columnsPerRow, emptyColumns);
        if (totalSeats > 0) {
            if (totalSeats < 50) {
                errors.totalSeats = 'Tổng số ghế phải ít nhất 50 ghế';
            } else if (totalSeats > 150) {
                errors.totalSeats = 'Tổng số ghế không được vượt quá 150 ghế';
            }
        }

        setValidationErrors(errors);
        return errors;
    };

    // Update bulk config and validate
    const updateBulkConfig = (field: string, value: string) => {
        const newConfig = { ...bulkConfig, [field]: value };
        setBulkConfig(newConfig);

        // Validate after update
        validateInputs(newConfig.rowsInput, newConfig.columnsPerRow, newConfig.emptyColumns);
    };

    // Current total seats
    const currentTotalSeats = calculateTotalSeats(bulkConfig.rowsInput, bulkConfig.columnsPerRow, bulkConfig.emptyColumns);
    const hasValidationErrors = Object.values(validationErrors).some(error => error !== '');
    const isFormValid = !hasValidationErrors && bulkConfig.rowsInput.trim() && bulkConfig.columnsPerRow && currentTotalSeats >= 50 && currentTotalSeats <= 150;

    // Handle bulk configuration
    const handleBulkConfig = async () => {
        if (!roomId) return;

        // Final validation before submit
        const errors = validateInputs(bulkConfig.rowsInput, bulkConfig.columnsPerRow, bulkConfig.emptyColumns);
        const totalSeats = calculateTotalSeats(bulkConfig.rowsInput, bulkConfig.columnsPerRow, bulkConfig.emptyColumns);

        // Check if there are any validation errors
        if (Object.values(errors).some(error => error !== '')) {
            toast.error('Vui lòng sửa các lỗi trong form');
            return;
        }

        // Check total seats range
        if (totalSeats < 50 || totalSeats > 150) {
            toast.error('Tổng số ghế phải từ 50 đến 150');
            return;
        }

        try {
            const emptyColumns = bulkConfig.emptyColumns
                .split(',')
                .map(c => parseInt(c.trim()))
                .filter(c => !isNaN(c));

            const toastId = toast.loading('Đang cấu hình sơ đồ ghế...');
            await seatLayoutService.bulkConfigureSeatLayout(roomId, {
                SeatType: bulkConfig.seatType,
                RowsInput: bulkConfig.rowsInput,
                ColumnsPerRow: parseInt(bulkConfig.columnsPerRow),
                EmptyColumns: emptyColumns.length > 0 ? emptyColumns : undefined
            });
            toast.success('Cấu hình sơ đồ ghế thành công', { id: toastId });
            setConfigMode(false);
            loadSeatLayout();
            if (onLayoutChange) onLayoutChange();
        } catch (error: any) {
            console.error('Error configuring seat layout:', error);
            toast.error('Không thể cấu hình sơ đồ ghế: ' + (error.message || 'Lỗi không xác định'));
        }
    };

    // Get seats by type
    const getVipSeats = (): string[] => {
        if (!seatMap || !seatMap.rows) return [];
        const vipSeats: string[] = [];
        seatMap.rows.forEach(row => {
            row.Seats.forEach(seat => {
                if (seat.Seat_Type === 'VIP' && seat.Is_Active) {
                    vipSeats.push(`${seat.Row_Label}${seat.Column_Number}`);
                }
            });
        });
        return vipSeats;
    };

    const getCoupleSeats = (): string[] => {
        if (!seatMap || !seatMap.rows) return [];
        const coupleSeats: string[] = [];
        seatMap.rows.forEach(row => {
            row.Seats.forEach(seat => {
                if (seat.Seat_Type === 'Couple' && seat.Is_Active) {
                    coupleSeats.push(`${seat.Row_Label}${seat.Column_Number}`);
                }
            });
        });
        return coupleSeats;
    };

    const getDisabledSeats = (): string[] => {
        if (!seatMap || !seatMap.rows) return [];
        const disabledSeats: string[] = [];
        seatMap.rows.forEach(row => {
            row.Seats.forEach(seat => {
                if (!seat.Is_Active) {
                    disabledSeats.push(`${seat.Row_Label}${seat.Column_Number}`);
                }
            });
        });
        return disabledSeats;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <FullScreenLoader variant="inline" />
            </div>
        );
    }

    if (!seatMap) {
        return (
            <motion.div
                className="bg-slate-800 rounded-lg p-8 text-center border border-slate-700 shadow-lg"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
            >
                <CubeIcon className="w-16 h-16 text-[#FFD875] mx-auto mb-4 opacity-50" />
                <p className="text-gray-400 mb-4 text-lg">Phòng chiếu này chưa có sơ đồ ghế</p>
                {!readOnly && (
                    <button
                        onClick={() => setConfigMode(true)}
                        className="bg-[#FFD875] hover:bg-[#e5c368] text-black font-medium px-6 py-3 rounded-lg transition-all duration-300 shadow-[0_0_15px_0_rgba(255,216,117,0.3)] hover:shadow-[0_0_20px_0_rgba(255,216,117,0.5)]"
                    >
                        <PlusIcon className="w-5 h-5 inline-block mr-2" />
                        Tạo sơ đồ ghế
                    </button>
                )}
            </motion.div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Cinema & Room Info */}
            {(roomDetails || cinemaDetails) && (
                <motion.div
                    className="bg-slate-800 rounded-lg p-4 border border-slate-700 shadow-lg flex items-center justify-between"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="flex items-center gap-4">
                        {cinemaDetails && (
                            <div className="flex items-center gap-2">
                                <BuildingOfficeIcon className="w-5 h-5 text-[#FFD875]" />
                                <span className="text-white font-medium">{cinemaDetails.Cinema_Name}</span>
                            </div>
                        )}
                        {roomDetails && (
                            <>
                                <span className="text-gray-500">•</span>
                                <div className="flex items-center gap-2">
                                    <CubeIcon className="w-5 h-5 text-[#FFD875]" />
                                    <span className="text-white font-medium">{roomDetails.Room_Name}</span>
                                    <span className="px-2 py-1 bg-[#FFD875]/20 text-[#FFD875] rounded-full text-xs font-medium border border-[#FFD875]/30">
                                        {roomDetails.Room_Type}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                    <div className="text-sm text-gray-400">
                        Tổng số ghế: <span className="text-[#FFD875] font-medium">{seatMap?.stats?.total_seats || 0}</span>
                    </div>
                </motion.div>
            )}

            {/* Configuration Mode */}
            {configMode ? (
                <motion.div
                    className="bg-slate-800 rounded-lg p-6 border border-slate-700 shadow-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <PencilIcon className="w-5 h-5 text-[#FFD875] mr-2" />
                        Cấu hình sơ đồ ghế
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-[#FFD875] mb-2">
                                Hàng ghế <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={bulkConfig.rowsInput}
                                onChange={e => updateBulkConfig('rowsInput', e.target.value)}
                                className={`w-full px-4 py-3 bg-slate-700 text-white rounded-lg border ${validationErrors.rowsInput ? 'border-red-500' : 'border-[#FFD875]/30'} focus:border-[#FFD875] focus:ring focus:ring-[#FFD875]/20 focus:outline-none transition-all duration-300 shadow-[0_0_10px_0px_rgba(255,216,117,0.2)] focus:shadow-[0_0_15px_0px_rgba(255,216,117,0.4)]`}
                                placeholder="Nhập hàng ghế (ví dụ: A-E hoặc A,B,C,D,E)"
                            />
                            {validationErrors.rowsInput ? (
                                <p className="text-xs text-red-400 mt-1">{validationErrors.rowsInput}</p>
                            ) : (
                                <p className="text-xs text-gray-400 mt-1">Nhập theo dạng A-E (từ A đến E) hoặc A,B,C,D,E (liệt kê từng hàng)</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#FFD875] mb-2">
                                Số cột mỗi hàng <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                value={bulkConfig.columnsPerRow}
                                onChange={e => updateBulkConfig('columnsPerRow', e.target.value)}
                                className={`w-full px-4 py-3 bg-slate-700 text-white rounded-lg border ${validationErrors.columnsPerRow ? 'border-red-500' : 'border-[#FFD875]/30'} focus:border-[#FFD875] focus:ring focus:ring-[#FFD875]/20 focus:outline-none transition-all duration-300 shadow-[0_0_10px_0px_rgba(255,216,117,0.2)] focus:shadow-[0_0_15px_0px_rgba(255,216,117,0.4)]`}
                                min="5"
                                max="20"
                                placeholder="Nhập số cột (5-20)"
                            />
                            {validationErrors.columnsPerRow ? (
                                <p className="text-xs text-red-400 mt-1">{validationErrors.columnsPerRow}</p>
                            ) : (
                                <p className="text-xs text-gray-400 mt-1">Số ghế trong mỗi hàng (từ 5 đến 20 cột)</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#FFD875] mb-2">
                                Loại ghế
                            </label>
                            <select
                                value={bulkConfig.seatType}
                                onChange={e => updateBulkConfig('seatType', e.target.value as SeatType)}
                                className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-[#FFD875]/30 focus:border-[#FFD875] focus:ring focus:ring-[#FFD875]/20 focus:outline-none transition-all duration-300 shadow-[0_0_10px_0px_rgba(255,216,117,0.2)] focus:shadow-[0_0_15px_0px_rgba(255,216,117,0.4)]"
                            >
                                <option value="Regular">Ghế thường</option>
                                <option value="VIP">Ghế VIP</option>
                                <option value="Couple">Ghế đôi</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#FFD875] mb-2">
                                Cột trống (tùy chọn)
                            </label>
                            <input
                                type="text"
                                value={bulkConfig.emptyColumns}
                                onChange={e => updateBulkConfig('emptyColumns', e.target.value)}
                                className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-[#FFD875]/30 focus:border-[#FFD875] focus:ring focus:ring-[#FFD875]/20 focus:outline-none transition-all duration-300 shadow-[0_0_10px_0px_rgba(255,216,117,0.2)] focus:shadow-[0_0_15px_0px_rgba(255,216,117,0.4)]"
                                placeholder="Nhập vị trí cột trống (ví dụ: 5,6,7)"
                            />
                            <p className="text-xs text-gray-400 mt-1">Tạo lối đi bằng cách bỏ trống các cột (ví dụ: 5,6 sẽ tạo lối đi ở cột 5 và 6)</p>
                        </div>
                    </div>

                    {/* Total Seats Display */}
                    {currentTotalSeats > 0 && (
                        <div className={`mb-4 p-4 rounded-lg border ${currentTotalSeats >= 50 && currentTotalSeats <= 150
                            ? 'bg-green-900/20 border-green-700 text-green-400'
                            : 'bg-red-900/20 border-red-700 text-red-400'
                            }`}>
                            <div className="flex items-center justify-between">
                                <span className="font-medium">Tổng số ghế dự kiến:</span>
                                <span className="text-xl font-bold">{currentTotalSeats} ghế</span>
                            </div>
                            {validationErrors.totalSeats && (
                                <p className="text-sm mt-2 text-red-400">{validationErrors.totalSeats}</p>
                            )}
                            {currentTotalSeats >= 50 && currentTotalSeats <= 150 && (
                                <p className="text-sm mt-2 text-green-400">✓ Số lượng ghế hợp lệ</p>
                            )}
                        </div>
                    )}

                    <div className="flex gap-2">
                        <button
                            onClick={handleBulkConfig}
                            disabled={!bulkConfig.rowsInput.trim() || !bulkConfig.columnsPerRow || !isFormValid}
                            className={`font-medium px-6 py-3 rounded-lg transition-all duration-300 flex items-center gap-2 ${!bulkConfig.rowsInput.trim() || !bulkConfig.columnsPerRow || !isFormValid
                                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                : 'bg-[#FFD875] hover:bg-[#e5c368] text-black shadow-[0_0_15px_0_rgba(255,216,117,0.3)] hover:shadow-[0_0_20px_0_rgba(255,216,117,0.5)]'
                                }`}
                        >
                            <CheckIcon className="w-5 h-5" />
                            Áp dụng
                        </button>

                        <button
                            onClick={() => setConfigMode(false)}
                            className="bg-slate-700 hover:bg-slate-600 text-white font-medium px-6 py-3 rounded-lg transition-all duration-300 flex items-center gap-2 border border-slate-600"
                        >
                            <XMarkIcon className="w-5 h-5" />
                            Hủy
                        </button>
                    </div>
                </motion.div>
            ) : (
                <>


                    {/* Seat Map */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                    >
                        <RoomSeatMap
                            seatMapData={seatMap}
                            vipSeats={getVipSeats()}
                            coupleSeats={getCoupleSeats()}
                            disabledSeats={getDisabledSeats()}
                            selectedSeats={selectedSeats}
                            rows={seatMap?.dimensions?.rows || 0}
                            cols={seatMap?.dimensions?.columns || 0}
                            onSeatSelect={handleSeatSelect}
                            onRowSelect={handleRowSelect}
                            onColSelect={handleColSelect}
                            readOnly={readOnly}
                        />
                    </motion.div>
                </>
            )}
        </div>
    );
};

export default SeatLayoutManager; 
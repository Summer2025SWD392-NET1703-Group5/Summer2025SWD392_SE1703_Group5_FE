import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
    CogIcon,
    EyeIcon,
    CheckCircleIcon,
    XMarkIcon,
    PlusIcon,
    TrashIcon
} from '@heroicons/react/24/outline';

interface SeatLayoutConfigProps {
    roomId: number;
    onClose: () => void;
    onSuccess?: () => void;
}

interface BulkSeatConfig {
    SeatType: 'Regular' | 'VIP' | 'Couple';
    RowsInput: string;
    ColumnsPerRow: number | '';
    EmptyColumns: number[];
}

interface SeatPreview {
    row: string;
    column: number;
    seatType: string;
    isEmpty: boolean;
}

const SeatLayoutConfig: React.FC<SeatLayoutConfigProps> = ({ roomId, onClose, onSuccess }) => {
    const [config, setConfig] = useState<BulkSeatConfig>({
        SeatType: 'Regular',
        RowsInput: '',
        ColumnsPerRow: '',
        EmptyColumns: []
    });

    const [loading, setLoading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [previewSeats, setPreviewSeats] = useState<SeatPreview[]>([]);
    const [newEmptyColumn, setNewEmptyColumn] = useState<string>('');

    // Parse rows input to get array of row labels
    const parseRowsInput = (input: string): string[] => {
        const rows: string[] = [];
        const parts = input.split(',').map(part => part.trim());

        for (const part of parts) {
            if (part.includes('-')) {
                const [start, end] = part.split('-').map(s => s.trim());
                if (start.length === 1 && end.length === 1) {
                    const startCode = start.charCodeAt(0);
                    const endCode = end.charCodeAt(0);
                    for (let i = startCode; i <= endCode; i++) {
                        rows.push(String.fromCharCode(i));
                    }
                }
            } else {
                rows.push(part);
            }
        }

        return rows;
    };

    // Generate preview seats
    const generatePreview = () => {
        const rows = parseRowsInput(config.RowsInput);
        const seats: SeatPreview[] = [];
        const columns = Number(config.ColumnsPerRow);

        rows.forEach(row => {
            for (let col = 1; col <= columns; col++) {
                seats.push({
                    row,
                    column: col,
                    seatType: config.SeatType,
                    isEmpty: config.EmptyColumns.includes(col)
                });
            }
        });

        setPreviewSeats(seats);
        setShowPreview(true);
    };

    // Handle adding empty column
    const handleAddEmptyColumn = () => {
        const colNum = parseInt(newEmptyColumn);
        const maxColumns = Number(config.ColumnsPerRow);
        if (colNum >= 1 && colNum <= maxColumns && !config.EmptyColumns.includes(colNum)) {
            setConfig(prev => ({
                ...prev,
                EmptyColumns: [...prev.EmptyColumns, colNum].sort((a, b) => a - b)
            }));
            setNewEmptyColumn('');
        }
    };

    // Handle removing empty column
    const handleRemoveEmptyColumn = (colNum: number) => {
        setConfig(prev => ({
            ...prev,
            EmptyColumns: prev.EmptyColumns.filter(col => col !== colNum)
        }));
    };

    // Handle form submission
    const handleSubmit = async () => {
        if (!config.RowsInput.trim()) {
            toast.error('Vui lòng nhập thông tin hàng ghế');
            return;
        }

        if (!config.ColumnsPerRow || Number(config.ColumnsPerRow) < 1) {
            toast.error('Vui lòng nhập số cột hợp lệ');
            return;
        }

        setLoading(true);
        const toastId = toast.loading('Đang cấu hình sơ đồ ghế...');

        try {
            const response = await fetch(`/api/seat-layouts/bulk/${roomId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    SeatType: config.SeatType,
                    RowsInput: config.RowsInput,
                    ColumnsPerRow: Number(config.ColumnsPerRow),
                    EmptyColumns: config.EmptyColumns
                })
            });

            if (!response.ok) {
                throw new Error('Cấu hình sơ đồ ghế thất bại');
            }

            toast.success('Cấu hình sơ đồ ghế thành công!', { id: toastId });
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error('Error configuring seat layout:', error);
            toast.error('Cấu hình sơ đồ ghế thất bại', { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    const getSeatIcon = (seatType: string) => {
        switch (seatType) {
            case 'VIP': return '👑';
            case 'Couple': return '💕';
            default: return '💺';
        }
    };

    const getSeatColor = (seatType: string, isEmpty: boolean) => {
        if (isEmpty) return 'bg-gray-500/20 border-gray-500/50';

        switch (seatType) {
            case 'VIP': return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400';
            case 'Couple': return 'bg-pink-500/20 border-pink-500/50 text-pink-400';
            default: return 'bg-blue-500/20 border-blue-500/50 text-blue-400';
        }
    };

    // Check if form is valid for preview/submit
    const isFormValid = config.RowsInput.trim() && config.ColumnsPerRow && Number(config.ColumnsPerRow) >= 1;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            >
                {/* Header */}
                <div className="bg-slate-700/50 px-6 py-4 border-b border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <CogIcon className="w-6 h-6 text-[#FFD875]" />
                        <h2 className="text-xl font-bold text-white">Cấu hình sơ đồ ghế</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-600 rounded-lg transition-colors"
                    >
                        <XMarkIcon className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                    {!showPreview ? (
                        <div className="space-y-6">
                            {/* Seat Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Loại ghế <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={config.SeatType}
                                    onChange={(e) => setConfig(prev => ({ ...prev, SeatType: e.target.value as any }))}
                                    className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-[#FFD875] focus:outline-none"
                                >
                                    <option value="Regular">Ghế thường 💺</option>
                                    <option value="VIP">Ghế VIP 👑</option>
                                    <option value="Couple">Ghế đôi 💕</option>
                                </select>
                            </div>

                            {/* Rows Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Hàng ghế <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={config.RowsInput}
                                    onChange={(e) => setConfig(prev => ({ ...prev, RowsInput: e.target.value }))}
                                    placeholder="VD: A-E hoặc A,B,C,D,E"
                                    className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-[#FFD875] focus:outline-none"
                                />
                                <p className="text-sm text-gray-400 mt-1">
                                    Nhập dải hàng (A-E) hoặc danh sách hàng (A,B,C,D,E)
                                </p>
                            </div>

                            {/* Columns Per Row */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Số cột mỗi hàng <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="50"
                                    value={config.ColumnsPerRow}
                                    onChange={(e) => setConfig(prev => ({ ...prev, ColumnsPerRow: e.target.value ? parseInt(e.target.value) : '' }))}
                                    placeholder="Nhập số cột (VD: 10)"
                                    className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-[#FFD875] focus:outline-none"
                                />
                            </div>

                            {/* Empty Columns */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Cột để trống (lối đi)
                                </label>
                                <div className="flex gap-2 mb-3">
                                    <input
                                        type="number"
                                        min="1"
                                        max={Number(config.ColumnsPerRow) || 50}
                                        value={newEmptyColumn}
                                        onChange={(e) => setNewEmptyColumn(e.target.value)}
                                        placeholder="Số cột"
                                        className="flex-1 bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-[#FFD875] focus:outline-none"
                                        disabled={!config.ColumnsPerRow}
                                    />
                                    <button
                                        onClick={handleAddEmptyColumn}
                                        disabled={!config.ColumnsPerRow}
                                        className="px-4 py-2 bg-[#FFD875] text-black rounded-lg hover:bg-[#e5c368] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <PlusIcon className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {config.EmptyColumns.map(col => (
                                        <span
                                            key={col}
                                            className="px-3 py-1 bg-slate-700 text-white rounded-full text-sm flex items-center gap-2"
                                        >
                                            Cột {col}
                                            <button
                                                onClick={() => handleRemoveEmptyColumn(col)}
                                                className="text-red-400 hover:text-red-300"
                                            >
                                                <XMarkIcon className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                {!config.ColumnsPerRow && (
                                    <p className="text-sm text-gray-500 mt-1">
                                        Vui lòng nhập số cột trước khi thêm lối đi
                                    </p>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={generatePreview}
                                    disabled={!isFormValid}
                                    className="flex-1 px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <EyeIcon className="w-5 h-5" />
                                    Xem trước
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading || !isFormValid}
                                    className="flex-1 px-6 py-3 bg-[#FFD875] text-black rounded-lg hover:bg-[#e5c368] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <CheckCircleIcon className="w-5 h-5" />
                                    {loading ? 'Đang cấu hình...' : 'Áp dụng'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Preview Header */}
                            <div className="text-center">
                                <h3 className="text-lg font-semibold text-white mb-2">Xem trước sơ đồ ghế</h3>
                                <p className="text-gray-400">
                                    Loại ghế: <span className="text-[#FFD875]">{config.SeatType} {getSeatIcon(config.SeatType)}</span>
                                </p>
                            </div>

                            {/* Screen */}
                            <div className="text-center mb-6">
                                <div className="inline-block bg-gradient-to-r from-[#FFD875]/20 to-[#FFD875]/10 border border-[#FFD875]/30 rounded-lg px-8 py-3">
                                    <p className="text-[#FFD875] font-semibold">MÀN HÌNH</p>
                                </div>
                            </div>

                            {/* Seat Preview */}
                            <div className="overflow-x-auto">
                                <div className="min-w-max mx-auto space-y-2">
                                    {Array.from(new Set(previewSeats.map(s => s.row))).map(row => (
                                        <div key={row} className="flex items-center gap-2">
                                            <div className="w-8 text-center text-[#FFD875] font-semibold">{row}</div>
                                            <div className="flex gap-1">
                                                {previewSeats
                                                    .filter(seat => seat.row === row)
                                                    .map(seat => (
                                                        <div
                                                            key={`${seat.row}${seat.column}`}
                                                            className={`w-8 h-8 rounded border-2 flex items-center justify-center text-xs font-semibold ${getSeatColor(seat.seatType, seat.isEmpty)}`}
                                                        >
                                                            {seat.isEmpty ? '🚶' : seat.column}
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Preview Actions */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setShowPreview(false)}
                                    className="flex-1 px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                                >
                                    Quay lại chỉnh sửa
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="flex-1 px-6 py-3 bg-[#FFD875] text-black rounded-lg hover:bg-[#e5c368] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <CheckCircleIcon className="w-5 h-5" />
                                    {loading ? 'Đang cấu hình...' : 'Xác nhận áp dụng'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default SeatLayoutConfig; 
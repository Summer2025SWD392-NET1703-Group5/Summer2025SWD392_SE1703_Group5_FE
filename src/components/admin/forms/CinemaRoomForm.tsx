import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
    CubeIcon,
    UserGroupIcon,
    ExclamationCircleIcon,
    ArrowPathIcon,
    ViewColumnsIcon,
    ArrowLeftIcon,
    CogIcon,
    EyeIcon,
    CheckCircleIcon,
    SparklesIcon,
    PlayIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline';
import type { CinemaRoom, CinemaRoomFormData, CinemaRoomFormStatus } from '../../../types/cinemaRoom';
import RichTextEditor from '../common/RichTextEditor';
import SeatLayoutConfig from '../cinema-rooms/SeatLayoutConfig';
import { seatLayoutService } from '../../../services/seatLayoutService';
import InteractiveSeatPreview from '../cinema-rooms/InteractiveSeatPreview';

const roomSchema = yup.object({
    Room_Name: yup.string()
        .required('Tên phòng là bắt buộc')
        .min(2, 'Tên phòng phải có ít nhất 2 ký tự')
        .max(50, 'Tên phòng không được vượt quá 50 ký tự'),
    Room_Type: yup.string()
        .oneOf(['2D', '3D', 'IMAX', 'VIP'], 'Loại phòng không hợp lệ')
        .required('Loại phòng là bắt buộc'),
    Seat_Quantity: yup.number()
        .required('Số ghế là bắt buộc')
        .min(20, 'Số ghế phải ít nhất là 20')
        .max(300, 'Số ghế không được vượt quá 300')
        .integer('Số ghế phải là số nguyên'),
    Status: yup.string()
        .oneOf(['Active', 'Inactive'] as CinemaRoomFormStatus[], 'Trạng thái không hợp lệ')
        .required('Trạng thái là bắt buộc'),
    Notes: yup.string()
        .max(500, 'Ghi chú không được vượt quá 500 ký tự')
        .nullable()
        .optional(),
});

interface SeatLayout {
    Layout_ID: number;
    Row_Label: string;
    Column_Number: number;
    Seat_Type: string;
    Is_Active: boolean;
}

interface SeatLayoutResponse {
    success: boolean;
    message: string;
    data: {
        cinema_room: {
            Cinema_Room_ID: number;
            Room_Name: string;
            Room_Type: string;
        };
        rows: Array<{
            Row: string;
            Seats: SeatLayout[];
        }>;
        dimensions: {
            rows: number;
            columns: number;
        };
        stats: {
            total_seats: number;
            seat_types: Array<{
                SeatType: string;
                Count: number;
            }>;
        };
        can_modify: boolean;
    };
}

interface SeatLayoutConfigData {
    rowsInput: string;
    seatsPerRow: number;
    seatType: 'Regular' | 'VIP';
    hiddenSeats: number[];
    seatTypeOverrides: { [key: number]: 'Regular' | 'VIP' };
}

interface CinemaRoomFormProps {
    room?: CinemaRoom;
    onSubmit: (data: CinemaRoomFormData, seatLayoutConfig?: SeatLayoutConfigData) => Promise<CinemaRoom | void>;
    onCancel: () => void;
    loading?: boolean;
    cinemaId?: string; // Thêm cinemaId để tạo phòng mới
}

const CinemaRoomForm: React.FC<CinemaRoomFormProps> = ({ room, onSubmit, onCancel, loading = false, cinemaId }) => {
    const [duplicateNameError, setDuplicateNameError] = useState<string | null>(null);
    const [suggestedName, setSuggestedName] = useState<string | null>(null);
    const [showSeatConfig, setShowSeatConfig] = useState(false);
    const [seatLayout, setSeatLayout] = useState<SeatLayoutResponse['data'] | null>(null);
    const [seatLayoutLoading, setSeatLayoutLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState<'basic' | 'layout' | 'preview'>('basic');
    const [createdRoomId, setCreatedRoomId] = useState<number | null>(null); // Lưu ID phòng vừa tạo
    const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set()); // Track các bước đã hoàn thành
    const [seatLayoutErrors, setSeatLayoutErrors] = useState<string[]>([]); // Lưu trữ lỗi validation seat layout

    // Seat layout configuration state
    const [seatLayoutConfig, setSeatLayoutConfig] = useState<SeatLayoutConfigData>({
        rowsInput: '',
        seatsPerRow: 0,
        seatType: 'Regular',
        hiddenSeats: [],
        seatTypeOverrides: {}
    });

    const {
        control,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm<CinemaRoomFormData>({
        resolver: yupResolver(roomSchema) as any,
        defaultValues: {
            Room_Name: room?.Room_Name || '',
            Room_Type: room?.Room_Type || '2D',
            Seat_Quantity: room?.Seat_Quantity || 50,
            Status: room?.Status === 'Deleted' || room?.Status === 'Closed' || room?.Status === 'Maintenance' ? 'Inactive' : (room?.Status || 'Active'),
            Notes: room?.Notes || '',
        },
    });

    const roomTypes = [
        { value: '2D', label: '2D', color: 'text-white' },
        { value: '3D', label: '3D', color: 'text-blue-400' },
        { value: 'IMAX', label: 'IMAX', color: 'text-purple-400' },
        { value: 'VIP', label: 'VIP', color: 'text-[#FFD875]' },
    ];

    const roomType = watch('Room_Type');

    // Parse rows input to calculate total seats
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

    // Validate seat layout configuration
    const validateSeatLayout = (): { isValid: boolean; errors: string[] } => {
        const errors: string[] = [];
        const rows = parseRowsInput(seatLayoutConfig.rowsInput);

        // Kiểm tra số hàng tối đa (A-J = 10 hàng)
        if (rows.length > 10) {
            errors.push('Số hàng ghế tối đa là 10 (từ A đến J)');
        }

        // Kiểm tra hàng ghế không được vượt quá J
        const invalidRows = rows.filter(row => row.charCodeAt(0) > 74); // 74 = 'J'
        if (invalidRows.length > 0) {
            errors.push(`Hàng ghế chỉ được từ A đến J. Hàng không hợp lệ: ${invalidRows.join(', ')}`);
        }

        // Kiểm tra số ghế mỗi hàng tối đa 15
        if (seatLayoutConfig.seatsPerRow > 15) {
            errors.push('Số ghế mỗi hàng tối đa là 15');
        }

        // Kiểm tra tổng số ghế tối đa 150
        const totalSeats = calculateTotalSeats();
        if (totalSeats > 150) {
            errors.push(`Tổng số ghế không được vượt quá 150 (hiện tại: ${totalSeats})`);
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    };

    // Helper function để validate và update errors
    const validateAndUpdateErrors = () => {
        if (seatLayoutConfig.rowsInput.trim() || seatLayoutConfig.seatsPerRow > 0) {
            const validation = validateSeatLayout();
            setSeatLayoutErrors(validation.errors);
        } else {
            setSeatLayoutErrors([]);
        }
    };

    // Calculate total seats from layout configuration
    const calculateTotalSeats = (): number => {
        const rows = parseRowsInput(seatLayoutConfig.rowsInput);
        const totalSeats = rows.length * seatLayoutConfig.seatsPerRow;
        const hiddenSeatsCount = seatLayoutConfig.hiddenSeats.length;
        return totalSeats - hiddenSeatsCount;
    };

    // Auto-update seat quantity when layout changes and validate
    useEffect(() => {
        if (seatLayoutConfig.rowsInput && seatLayoutConfig.seatsPerRow && seatLayoutConfig.seatsPerRow > 0) {
            const calculatedSeats = calculateTotalSeats();
            setValue('Seat_Quantity', calculatedSeats, { shouldValidate: true });
        }

        // Validate seat layout configuration in real-time
        validateAndUpdateErrors();
    }, [seatLayoutConfig.rowsInput, seatLayoutConfig.seatsPerRow, seatLayoutConfig.hiddenSeats, setValue]);

    // Fetch seat layout from API
    const fetchSeatLayout = async (roomId: number) => {
        try {
            setSeatLayoutLoading(true);
            const response = await fetch(`/api/seat-layouts/room/${roomId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const data: SeatLayoutResponse = await response.json();
                setSeatLayout(data.data);

                // Xây dựng mapping giữa seatIndex và seat layout data
                const mapping: {[key: number]: any} = {};
                if (data.data?.rows) {
                    console.log(`📊 Dữ liệu từ API có ${data.data.rows.length} hàng ghế`);
                    console.log(`🔍 Cấu trúc API data:`, JSON.stringify(data.data, null, 2));

                    // Parse rows input để có thứ tự hàng giống như InteractiveSeatPreview
                    const parsedRows = parseRowsInput(seatLayoutConfig.rowsInput);
                    console.log(`📋 Parsed rows:`, parsedRows);

                    let seatIndex = 0; // Bắt đầu từ 0 giống InteractiveSeatPreview

                    parsedRows.forEach((expectedRow, rowIdx) => {
                        console.log(`📍 Xử lý hàng ${expectedRow} (index ${rowIdx})`);

                        for (let col = 1; col <= seatLayoutConfig.seatsPerRow; col++) {
                            // Tìm seat trong API data (không phân biệt hoa thường)
                            let foundSeat = null;
                            for (const apiRow of data.data.rows) {
                                const seat = apiRow.Seats.find((s: any) =>
                                    s.Row_Label.toLowerCase() === expectedRow.toLowerCase() && s.Column_Number === col
                                );
                                if (seat) {
                                    foundSeat = seat;
                                    break;
                                }
                            }

                            if (foundSeat) {
                                mapping[seatIndex] = foundSeat;
                                if (col <= 3) { // Log 3 ghế đầu mỗi hàng để debug
                                    console.log(`🪑 Ghế ${foundSeat.Row_Label}${foundSeat.Column_Number}: seatIndex=${seatIndex}, Layout_ID=${foundSeat.Layout_ID}`);
                                }
                            } else {
                                console.warn(`⚠️ Không tìm thấy ghế ${expectedRow}${col} trong API data`);
                            }

                            seatIndex++; // Tăng index giống InteractiveSeatPreview
                        }
                    });
                }
                console.log(`🗺️ Đã xây dựng mapping cho ${Object.keys(mapping).length} ghế`);
                console.log(`🔍 Sample mapping:`, Object.keys(mapping).slice(0, 5).reduce((obj: any, key) => {
                    obj[key] = mapping[parseInt(key)];
                    return obj;
                }, {}));
                setSeatLayoutMapping(mapping);
            } else {
                // If no seat layout found, set to null (will show empty state)
                setSeatLayout(null);
                setSeatLayoutMapping({});
            }
        } catch (error) {
            console.error('Error fetching seat layout:', error);
            setSeatLayout(null);
            setSeatLayoutMapping({});
        } finally {
            setSeatLayoutLoading(false);
        }
    };

    // Load seat layout when room changes
    useEffect(() => {
        if (room?.Cinema_Room_ID) {
            fetchSeatLayout(room.Cinema_Room_ID);
        }
    }, [room?.Cinema_Room_ID, seatLayoutConfig.seatsPerRow]);

    // Load seat layout mapping khi chuyển sang bước preview
    useEffect(() => {
        if (currentStep === 'preview' && (createdRoomId || room?.Cinema_Room_ID)) {
            const roomId = createdRoomId || room?.Cinema_Room_ID;
            if (roomId) {
                console.log('🔄 Loading seat layout mapping cho bước preview...');
                fetchSeatLayout(roomId);
            }
        }
    }, [currentStep, createdRoomId, room?.Cinema_Room_ID]);

    // Hàm tạo phòng chiếu (chỉ tạo phòng, không tạo sơ đồ ghế)
    const handleCreateRoom = async (data: CinemaRoomFormData) => {
        setDuplicateNameError(null);
        setSuggestedName(null);

        try {
            // Gọi onSubmit để tạo phòng chiếu (không bao gồm sơ đồ ghế)
            const createdRoom = await onSubmit(data, undefined);

            // Lưu ID phòng vừa tạo để sử dụng cho các bước tiếp theo
            if (createdRoom && createdRoom.Cinema_Room_ID) {
                setCreatedRoomId(createdRoom.Cinema_Room_ID);
                console.log('Đã tạo phòng chiếu với ID:', createdRoom.Cinema_Room_ID);

                // Đánh dấu bước basic đã hoàn thành
                setCompletedSteps(prev => new Set([...prev, 'basic']));

                // Sau khi tạo thành công, chuyển sang bước cấu hình ghế
                setCurrentStep('layout');
            } else {
                throw new Error('Không nhận được ID phòng chiếu từ server');
            }
        } catch (error: any) {
            console.error('Error creating cinema room:', error);

            const errorMessage = error.message || '';
            if (errorMessage.includes('đã tồn tại trong rạp này') && errorMessage.includes('Bạn có thể sử dụng tên')) {
                setDuplicateNameError(errorMessage);

                const match = errorMessage.match(/Bạn có thể sử dụng tên '([^']+)'/);
                if (match && match[1]) {
                    setSuggestedName(match[1]);
                }
            }
        }
    };

    // Hàm submit cho phòng đã tồn tại (edit mode)
    const handleFormSubmit = async (data: CinemaRoomFormData) => {
        setDuplicateNameError(null);
        setSuggestedName(null);

        try {
            // Cho phòng đã tồn tại, bao gồm cả sơ đồ ghế nếu có
            const seatLayoutData = (!room && seatLayoutConfig.rowsInput.trim()) ? seatLayoutConfig : undefined;
            await onSubmit(data, seatLayoutData);
        } catch (error: any) {
            console.error('Error submitting cinema room form:', error);

            const errorMessage = error.message || '';
            if (errorMessage.includes('đã tồn tại trong rạp này') && errorMessage.includes('Bạn có thể sử dụng tên')) {
                setDuplicateNameError(errorMessage);

                const match = errorMessage.match(/Bạn có thể sử dụng tên '([^']+)'/);
                if (match && match[1]) {
                    setSuggestedName(match[1]);
                }
            }
        }
    };

    // Hàm tạo sơ đồ ghế cho phòng đã tạo
    const handleCreateSeatLayout = async () => {
        if (!createdRoomId || !seatLayoutConfig.rowsInput.trim() || !seatLayoutConfig.seatsPerRow) {
            toast.error('Vui lòng nhập đầy đủ thông tin sơ đồ ghế');
            return;
        }

        // Validate seat layout configuration
        const validation = validateSeatLayout();
        if (!validation.isValid) {
            setSeatLayoutErrors(validation.errors);
            toast.error(validation.errors[0]); // Hiển thị lỗi đầu tiên
            return;
        }

        // Clear errors if validation passes
        setSeatLayoutErrors([]);

        try {
            const toastId = toast.loading('Đang tạo sơ đồ ghế...');

            // Gọi service tạo sơ đồ ghế
            await seatLayoutService.createSeatLayoutForNewRoom(createdRoomId, {
                rowsInput: seatLayoutConfig.rowsInput,
                seatsPerRow: seatLayoutConfig.seatsPerRow,
                seatType: seatLayoutConfig.seatType,
                hiddenSeats: seatLayoutConfig.hiddenSeats
            });

            toast.success('Tạo sơ đồ ghế thành công!', { id: toastId });

            // Load seat layout mapping ngay sau khi tạo thành công
            console.log('🔄 Loading seat layout mapping sau khi tạo sơ đồ ghế...');
            await fetchSeatLayout(createdRoomId);

            // Đánh dấu bước layout đã hoàn thành
            setCompletedSteps(prev => new Set([...prev, 'layout']));

            setCurrentStep('preview');
        } catch (error: any) {
            console.error('Error creating seat layout:', error);
            toast.error(error.message || 'Tạo sơ đồ ghế thất bại');
        }
    };

    // Hàm cập nhật loại ghế
    const handleUpdateSeatTypes = async () => {
        if (!createdRoomId) {
            toast.error('Không tìm thấy ID phòng chiếu');
            return;
        }

        try {
            const toastId = toast.loading('Đang cập nhật loại ghế...');

            if (Object.keys(seatLayoutConfig.seatTypeOverrides).length === 0) {
                toast.success('Không có thay đổi loại ghế nào', { id: toastId });
                return;
            }

            // Lấy danh sách seat layout để có LayoutIds
            const seatLayoutResponse = await seatLayoutService.getSeatLayoutByRoomId(createdRoomId);
            const seatMap = seatLayoutResponse.data;

            // Tạo flat array từ seat map
            const allSeats: any[] = [];
            seatMap.rows.forEach(row => {
                row.Seats.forEach(seat => {
                    allSeats.push(seat);
                });
            });

            // Group theo loại ghế để gọi API hiệu quả hơn
            const seatTypeGroups: { [key: string]: number[] } = {};

            Object.entries(seatLayoutConfig.seatTypeOverrides).forEach(([seatIndex, seatType]) => {
                const index = parseInt(seatIndex);
                const seatLayout = allSeats.find((seat: any) => {
                    // Tính toán seat index từ row và column
                    const rowIndex = seat.Row_Label.charCodeAt(0) - 'A'.charCodeAt(0);
                    const colIndex = seat.Column_Number - 1;
                    const calculatedIndex = rowIndex * seatLayoutConfig.seatsPerRow + colIndex;
                    return calculatedIndex === index;
                });

                if (seatLayout) {
                    if (!seatTypeGroups[seatType]) {
                        seatTypeGroups[seatType] = [];
                    }
                    seatTypeGroups[seatType].push(seatLayout.Layout_ID);
                }
            });

            // Gọi API cho từng nhóm loại ghế
            for (const [seatType, layoutIds] of Object.entries(seatTypeGroups)) {
                if (layoutIds.length > 0) {
                    await seatLayoutService.bulkUpdateSeatTypes({
                        LayoutIds: layoutIds,
                        SeatType: seatType as 'Regular' | 'VIP'
                    });
                }
            }

            toast.success('Cập nhật loại ghế thành công!', { id: toastId });
        } catch (error: any) {
            console.error('Error updating seat types:', error);
            toast.error(error.message || 'Cập nhật loại ghế thất bại');
        }
    };

    // Hàm cập nhật hiển thị ghế (ẩn/hiện)
    const handleUpdateSeatVisibility = async () => {
        if (!createdRoomId) {
            toast.error('Không tìm thấy ID phòng chiếu');
            return;
        }

        try {
            const toastId = toast.loading('Đang cập nhật hiển thị ghế...');

            if (seatLayoutConfig.hiddenSeats.length === 0) {
                toast.success('Không có ghế nào bị ẩn', { id: toastId });
                return;
            }

            // Lấy danh sách seat layout để có LayoutIds
            const seatLayoutResponse = await seatLayoutService.getSeatLayoutByRoomId(createdRoomId);
            const seatMap = seatLayoutResponse.data;

            // Tạo flat array từ seat map
            const allSeats: any[] = [];
            seatMap.rows.forEach(row => {
                row.Seats.forEach(seat => {
                    allSeats.push(seat);
                });
            });

            // Tìm LayoutIds của các ghế cần ẩn
            const layoutIdsToHide: number[] = [];
            seatLayoutConfig.hiddenSeats.forEach(seatIndex => {
                const seatLayout = allSeats.find((seat: any) => {
                    // Tính toán seat index từ row và column
                    const rowIndex = seat.Row_Label.charCodeAt(0) - 'A'.charCodeAt(0);
                    const colIndex = seat.Column_Number - 1;
                    const calculatedIndex = rowIndex * seatLayoutConfig.seatsPerRow + colIndex;
                    return calculatedIndex === seatIndex;
                });

                if (seatLayout) {
                    layoutIdsToHide.push(seatLayout.Layout_ID);
                }
            });

            if (layoutIdsToHide.length > 0) {
                await seatLayoutService.softDeleteSeatLayouts({
                    LayoutIds: layoutIdsToHide
                });
            }

            toast.success('Cập nhật hiển thị ghế thành công!', { id: toastId });
        } catch (error) {
            console.error('Error updating seat visibility:', error);
            toast.error('Cập nhật hiển thị ghế thất bại');
        }
    };

    const useSuggestedName = () => {
        if (suggestedName) {
            setValue('Room_Name', suggestedName, { shouldValidate: true });
            setDuplicateNameError(null);
            setSuggestedName(null);
        }
    };



    const handleSeatConfigSuccess = () => {
        setShowSeatConfig(false);
        // Refresh seat layout after successful configuration
        if (room?.Cinema_Room_ID) {
            fetchSeatLayout(room.Cinema_Room_ID);
        }
    };

    const getSeatTypeIcon = (seatType: string, isActive: boolean = true) => {
        if (!isActive) {
            return '🚫'; // Icon ghế bị ẩn
        }

        switch (seatType) {
            case 'VIP': return '★';
            case 'Couple': return '♥';
            case 'Regular': return '■';
            case 'Thường': return '■';
            default: return '■';
        }
    };

    // Function để hiển thị tên loại ghế
    const getSeatTypeDisplayName = (seatType: string) => {
        switch (seatType) {
            case 'Regular': return 'Thường';
            case 'VIP': return 'VIP';
            case 'Couple': return 'Couple';
            default: return seatType;
        }
    };

    const getSeatTypeColor = (seatType: string) => {
        switch (seatType) {
            case 'VIP': return 'bg-purple-500/20 border-purple-500/50 text-purple-400';
            case 'Couple': return 'bg-pink-500/20 border-pink-500/50 text-pink-400';
            default: return 'bg-green-500/20 border-green-500/50 text-green-400';
        }
    };

    // State để lưu mapping giữa seatIndex và Layout_ID
    const [seatLayoutMapping, setSeatLayoutMapping] = useState<{[key: number]: any}>({});

    // Handle direct seat editing - toggle seat type (Regular ↔ VIP)
    const handleSeatTypeToggle = useCallback(async (seat: any) => {
        if (!seatLayout?.can_modify) {
            toast.error('Không thể chỉnh sửa ghế vì có booking đang hoạt động');
            return;
        }

        // Không cho chỉnh loại ghế khi ghế đã bị ẩn
        if (!seat.Is_Active) {
            toast.error('Không thể chỉnh sửa loại ghế đã bị ẩn. Vui lòng hiện ghế trước khi chỉnh sửa.');
            return;
        }

        const newSeatType = seat.Seat_Type === 'Regular' ? 'VIP' : 'Regular';

        // Kiểm tra logic VIP chỉ được ở nửa cuối của rạp
        if (newSeatType === 'VIP' && seatLayout) {
            const totalRows = seatLayout.dimensions.rows;
            const halfRows = Math.floor(totalRows / 2); // Làm tròn xuống: 5÷2=2.5→2, 7÷2=3.5→3
            const currentRowIndex = seatLayout.rows.findIndex(row => row.Row === seat.Row_Label);

            // VIP chỉ được ở nửa cuối, tức là từ index halfRows trở đi
            if (currentRowIndex < halfRows) {
                const firstVipRowLabel = seatLayout.rows[halfRows]?.Row || '';
                toast.error(`Ghế VIP chỉ được đặt ở nửa cuối của rạp (từ hàng ${firstVipRowLabel} trở xuống)`);
                return;
            }
        }

        console.log(`🔄 Đang thay đổi loại ghế ${seat.Row_Label}${seat.Column_Number} từ ${getSeatTypeDisplayName(seat.Seat_Type)} thành ${getSeatTypeDisplayName(newSeatType)}`);

        // Update local state immediately for better UX
        setSeatLayout(prevLayout => {
            if (!prevLayout) return prevLayout;

            const updatedRows = prevLayout.rows.map(row => ({
                ...row,
                Seats: row.Seats.map(s =>
                    s.Layout_ID === seat.Layout_ID
                        ? { ...s, Seat_Type: newSeatType }
                        : s
                )
            }));

            // Update stats
            const updatedStats = { ...prevLayout.stats };
            const oldTypeIndex = updatedStats.seat_types.findIndex(t => t.SeatType === seat.Seat_Type);
            const newTypeIndex = updatedStats.seat_types.findIndex(t => t.SeatType === newSeatType);

            if (oldTypeIndex !== -1) {
                updatedStats.seat_types[oldTypeIndex].Count -= 1;
            }
            if (newTypeIndex !== -1) {
                updatedStats.seat_types[newTypeIndex].Count += 1;
            } else {
                updatedStats.seat_types.push({ SeatType: newSeatType, Count: 1 });
            }

            return {
                ...prevLayout,
                rows: updatedRows,
                stats: updatedStats
            };
        });

        const toastId = toast.loading(`Đang cập nhật ghế ${seat.Row_Label}${seat.Column_Number}...`);

        try {
            await seatLayoutService.bulkUpdateSeatTypes({
                LayoutIds: [seat.Layout_ID],
                SeatType: newSeatType as 'Regular' | 'VIP'
            });

            toast.success(`Đã cập nhật ghế ${seat.Row_Label}${seat.Column_Number} thành ${getSeatTypeDisplayName(newSeatType)}`, { id: toastId });
        } catch (error: any) {
            console.error('Error updating seat type:', error);
            toast.error(`Lỗi khi cập nhật ghế: ${error.message || 'Lỗi không xác định'}`, { id: toastId });

            // Revert local state on error
            const roomId = createdRoomId || room?.Cinema_Room_ID;
            if (roomId) {
                await fetchSeatLayout(roomId);
            }
        }
    }, [seatLayout, createdRoomId, room?.Cinema_Room_ID]);

    // Handle direct seat visibility toggle (hide/show seat)
    const handleSeatVisibilityToggle = useCallback(async (seat: any) => {
        if (!seatLayout?.can_modify) {
            toast.error('Không thể chỉnh sửa ghế vì có booking đang hoạt động');
            return;
        }

        const newVisibility = !seat.Is_Active;
        const actionText = newVisibility ? 'hiện' : 'ẩn';
        console.log(`🔄 Đang ${actionText} ghế ${seat.Row_Label}${seat.Column_Number}`);

        // Update local state immediately for better UX
        setSeatLayout(prevLayout => {
            if (!prevLayout) return prevLayout;

            const updatedRows = prevLayout.rows.map(row => ({
                ...row,
                Seats: row.Seats.map(s =>
                    s.Layout_ID === seat.Layout_ID
                        ? { ...s, Is_Active: newVisibility }
                        : s
                )
            }));

            // Update total seats count
            const updatedStats = { ...prevLayout.stats };
            if (newVisibility) {
                updatedStats.total_seats += 1;
            } else {
                updatedStats.total_seats -= 1;
            }

            return {
                ...prevLayout,
                rows: updatedRows,
                stats: updatedStats
            };
        });

        const toastId = toast.loading(`Đang ${actionText} ghế ${seat.Row_Label}${seat.Column_Number}...`);

        try {
            await seatLayoutService.softDeleteSeatLayouts({
                LayoutIds: [seat.Layout_ID],
                IsActive: newVisibility
            });

            toast.success(`Đã ${actionText} ghế ${seat.Row_Label}${seat.Column_Number}`, { id: toastId });
        } catch (error: any) {
            console.error('Error toggling seat visibility:', error);
            toast.error(`Lỗi khi ${actionText} ghế: ${error.message || 'Lỗi không xác định'}`, { id: toastId });

            // Revert local state on error
            const roomId = createdRoomId || room?.Cinema_Room_ID;
            if (roomId) {
                await fetchSeatLayout(roomId);
            }
        }
    }, [seatLayout, createdRoomId, room?.Cinema_Room_ID]);

    // Handle toggle hidden seat với API call trực tiếp
    const handleToggleHiddenSeat = useCallback(async (seatIndex: number) => {
        const isCurrentlyHidden = seatLayoutConfig.hiddenSeats.includes(seatIndex);

        // Cập nhật state local trước
        setSeatLayoutConfig(prev => {
            const newHiddenSeats = prev.hiddenSeats.includes(seatIndex)
                ? prev.hiddenSeats.filter(index => index !== seatIndex)
                : [...prev.hiddenSeats, seatIndex];

            return {
                ...prev,
                hiddenSeats: newHiddenSeats
            };
        });

        // Nếu có roomId (đã tạo phòng hoặc đang edit phòng), gọi API ngay lập tức
        const roomId = createdRoomId || room?.Cinema_Room_ID;
        if (roomId) {
            try {
                // Sử dụng mapping đã có thay vì gọi API lấy dữ liệu
                const seatLayout = seatLayoutMapping[seatIndex];

                if (seatLayout) {
                    console.log(`🎯 Toggle ghế ${seatIndex}: ${isCurrentlyHidden ? 'hiện' : 'ẩn'} ghế ${seatLayout.Row_Label}${seatLayout.Column_Number}`);

                    if (isCurrentlyHidden) {
                        // Ghế đang ẩn -> hiện lại (restore) bằng API toggleSeatLayoutsVisibility
                        await seatLayoutService.softDeleteSeatLayouts({
                            LayoutIds: [seatLayout.Layout_ID],
                            IsActive: true
                        });
                        toast.success(`Đã hiện ghế ${seatLayout.Row_Label}${seatLayout.Column_Number}`);
                    } else {
                        // Ghế đang hiện -> ẩn đi (soft delete)
                        await seatLayoutService.softDeleteSeatLayouts({
                            LayoutIds: [seatLayout.Layout_ID],
                            IsActive: false
                        });
                        toast.success(`Đã ẩn ghế ${seatLayout.Row_Label}${seatLayout.Column_Number}`);
                    }
                } else {
                    // Nếu không có mapping, load lại dữ liệu và tìm ghế để cập nhật
                    console.log('Không tìm thấy mapping cho ghế, đang tải lại dữ liệu...');

                    try {
                        const data = await seatLayoutService.getSeatLayoutByRoomId(roomId);

                        // Tìm ghế trong dữ liệu mới load
                        let foundSeat = null;
                        if (data.data?.rows) {
                            for (const row of data.data.rows) {
                                for (const seat of row.Seats) {
                                    const rowIndex = seat.Row_Label.charCodeAt(0) - 'A'.charCodeAt(0);
                                    const colIndex = seat.Column_Number - 1;
                                    const calculatedIndex = rowIndex * seatLayoutConfig.seatsPerRow + colIndex;

                                    if (calculatedIndex === seatIndex) {
                                        foundSeat = seat;
                                        break;
                                    }
                                }
                                if (foundSeat) break;
                            }
                        }

                        if (foundSeat) {
                            console.log(`🎯 Tìm thấy ghế và toggle: ${isCurrentlyHidden ? 'hiện' : 'ẩn'} ghế ${foundSeat.Row_Label}${foundSeat.Column_Number}`);

                            if (isCurrentlyHidden) {
                                // Ghế đang ẩn -> hiện lại (restore)
                                await seatLayoutService.softDeleteSeatLayouts({
                                    LayoutIds: [foundSeat.Layout_ID],
                                    IsActive: true
                                });
                                toast.success(`Đã hiện ghế ${foundSeat.Row_Label}${foundSeat.Column_Number}`);
                            } else {
                                // Ghế đang hiện -> ẩn đi (soft delete)
                                await seatLayoutService.softDeleteSeatLayouts({
                                    LayoutIds: [foundSeat.Layout_ID],
                                    IsActive: false
                                });
                                toast.success(`Đã ẩn ghế ${foundSeat.Row_Label}${foundSeat.Column_Number}`);
                            }

                            // Cập nhật lại mapping để lần sau không cần load lại
                            await fetchSeatLayout(roomId);
                        } else {
                            toast.error('Không thể tìm thấy thông tin ghế để cập nhật');
                        }
                    } catch (error: any) {
                        console.error('Lỗi khi load dữ liệu ghế:', error);
                        toast.error('Không thể tải thông tin ghế');
                    }
                }
            } catch (error: any) {
                console.error('Lỗi khi cập nhật hiển thị ghế:', error);
                toast.error(error.message || 'Cập nhật hiển thị ghế thất bại');
            }
        } else {
            console.log('⚠️ Không có roomId để gọi API');
        }
    }, [createdRoomId, seatLayoutConfig.hiddenSeats, seatLayoutConfig.seatsPerRow, seatLayoutMapping, room?.Cinema_Room_ID]);

    // Handle seat type change với API call trực tiếp
    const handleSeatTypeChange = useCallback(async (seatIndex: number, newType: 'Regular' | 'VIP') => {
        // Cập nhật state local trước
        setSeatLayoutConfig(prev => {
            const newOverrides = { ...prev.seatTypeOverrides };

            // If the new type is the same as default, remove override
            if (newType === prev.seatType) {
                delete newOverrides[seatIndex];
            } else {
                newOverrides[seatIndex] = newType;
            }

            return {
                ...prev,
                seatTypeOverrides: newOverrides
            };
        });

        // Nếu có roomId (đã tạo phòng hoặc đang edit phòng), gọi API ngay lập tức
        const roomId = createdRoomId || room?.Cinema_Room_ID;
        if (roomId) {
            try {
                // Debug mapping
                console.log(`🔍 Debug mapping cho seatIndex ${seatIndex}:`);
                console.log('📊 seatLayoutMapping keys:', Object.keys(seatLayoutMapping));
                console.log('📊 seatLayoutMapping length:', Object.keys(seatLayoutMapping).length);

                // Sử dụng mapping đã có thay vì gọi API lấy dữ liệu
                const seatLayout = seatLayoutMapping[seatIndex];
                console.log(`🎯 Seat layout cho index ${seatIndex}:`, seatLayout);

                if (seatLayout) {
                    console.log(`🎯 Đổi loại ghế ${seatIndex}: ${seatLayout.Row_Label}${seatLayout.Column_Number} thành ${newType}`);

                    // Gọi API cập nhật loại ghế với endpoint đúng
                    await seatLayoutService.bulkUpdateSeatTypes({
                        LayoutIds: [seatLayout.Layout_ID],
                        SeatType: newType
                    });

                    toast.success(`Đã cập nhật ghế ${seatLayout.Row_Label}${seatLayout.Column_Number} thành ${newType === 'VIP' ? 'VIP' : 'Thường'}`);
                } else {
                    // Nếu không có mapping, load lại dữ liệu và tìm ghế để cập nhật
                    console.log('Không tìm thấy mapping cho ghế, đang tải lại dữ liệu...');

                    try {
                        const data = await seatLayoutService.getSeatLayoutByRoomId(roomId);

                        // Tìm ghế trong dữ liệu mới load
                        let foundSeat = null;
                        if (data.data?.rows) {
                            for (const row of data.data.rows) {
                                for (const seat of row.Seats) {
                                    const rowIndex = seat.Row_Label.charCodeAt(0) - 'A'.charCodeAt(0);
                                    const colIndex = seat.Column_Number - 1;
                                    const calculatedIndex = rowIndex * seatLayoutConfig.seatsPerRow + colIndex;

                                    if (calculatedIndex === seatIndex) {
                                        foundSeat = seat;
                                        break;
                                    }
                                }
                                if (foundSeat) break;
                            }
                        }

                        if (foundSeat) {
                            console.log(`🎯 Tìm thấy ghế và đổi loại: ${foundSeat.Row_Label}${foundSeat.Column_Number} thành ${newType}`);

                            await seatLayoutService.bulkUpdateSeatTypes({
                                LayoutIds: [foundSeat.Layout_ID],
                                SeatType: newType
                            });

                            toast.success(`Đã cập nhật ghế ${foundSeat.Row_Label}${foundSeat.Column_Number} thành ${newType === 'VIP' ? 'VIP' : 'Thường'}`);

                            // Cập nhật lại mapping để lần sau không cần load lại
                            await fetchSeatLayout(roomId);
                        } else {
                            toast.error('Không thể tìm thấy thông tin ghế để cập nhật');
                        }
                    } catch (error: any) {
                        console.error('Lỗi khi load dữ liệu ghế:', error);
                        toast.error('Không thể tải thông tin ghế');
                    }
                }
            } catch (error: any) {
                console.error('Lỗi khi cập nhật loại ghế:', error);
                toast.error(error.message || 'Cập nhật loại ghế thất bại');
            }
        } else {
            console.log('⚠️ Không có roomId để gọi API');
        }
    }, [createdRoomId, seatLayoutConfig.seatsPerRow, seatLayoutMapping, room?.Cinema_Room_ID]);

    // Handle stats update
    const handleStatsUpdate = useCallback((stats: { total: number; regular: number; vip: number; hidden: number }) => {
        // Update seat quantity in form (visible seats = regular + vip)
        const visibleSeats = stats.regular + stats.vip;
        setValue('Seat_Quantity', visibleSeats);
    }, [setValue]);

    // Steps for new room creation
    const steps = [
        { id: 'basic', label: 'Thông tin cơ bản', icon: CubeIcon },
        { id: 'layout', label: 'Cấu hình ghế', icon: CogIcon },
        { id: 'preview', label: 'Xem trước', icon: EyeIcon }
    ];

    const isNewRoom = !room;

    // Key để lưu trạng thái vào localStorage
    const storageKey = `cinema-room-form-${cinemaId || 'new'}`;

    // Khôi phục trạng thái từ localStorage khi component mount
    useEffect(() => {
        if (isNewRoom) {
            const savedState = localStorage.getItem(storageKey);
            if (savedState) {
                try {
                    const parsed = JSON.parse(savedState);
                    if (parsed.currentStep) {
                        setCurrentStep(parsed.currentStep);
                    }
                    if (parsed.createdRoomId) {
                        setCreatedRoomId(parsed.createdRoomId);
                    }
                    if (parsed.seatLayoutConfig) {
                        setSeatLayoutConfig(parsed.seatLayoutConfig);
                    }
                    if (parsed.completedSteps) {
                        setCompletedSteps(new Set(parsed.completedSteps));
                    }
                    console.log('Đã khôi phục trạng thái form từ localStorage:', parsed);
                } catch (error) {
                    console.error('Lỗi khi khôi phục trạng thái:', error);
                }
            }
        }
    }, [isNewRoom, storageKey]);

    // Lưu trạng thái vào localStorage khi có thay đổi
    useEffect(() => {
        if (isNewRoom && (createdRoomId || currentStep !== 'basic')) {
            const stateToSave = {
                currentStep,
                createdRoomId,
                seatLayoutConfig,
                completedSteps: Array.from(completedSteps),
                timestamp: Date.now()
            };
            localStorage.setItem(storageKey, JSON.stringify(stateToSave));
            console.log('Đã lưu trạng thái form vào localStorage:', stateToSave);
        }
    }, [currentStep, createdRoomId, seatLayoutConfig, completedSteps, isNewRoom, storageKey]);

    // Xóa trạng thái khi hoàn thành hoặc hủy
    const clearSavedState = useCallback(() => {
        localStorage.removeItem(storageKey);
        console.log('Đã xóa trạng thái đã lưu');
    }, [storageKey]);

    // Hàm xử lý hoàn thành tạo phòng chiếu
    const handleFinish = useCallback(() => {
        clearSavedState();
        setCompletedSteps(new Set()); // Reset completed steps
        onCancel(); // Navigate về danh sách
    }, [clearSavedState, onCancel]);

    // Hàm xử lý hủy
    const handleCancel = useCallback(() => {
        clearSavedState();
        setCompletedSteps(new Set()); // Reset completed steps
        onCancel();
    }, [clearSavedState, onCancel]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
            {/* Header with enhanced design */}
            <motion.div
                className="mb-8 relative"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-[#FFD875]/10 via-transparent to-[#FFD875]/10 rounded-2xl blur-xl"></div>
                <div className="relative bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-[#FFD875]/20 shadow-2xl">
                    <div className="flex items-center">
                        <button
                            onClick={handleCancel}
                            className="mr-6 p-3 rounded-xl bg-slate-700/50 hover:bg-slate-600/50 transition-all duration-300 text-gray-400 hover:text-white group border border-slate-600/50"
                        >
                            <ArrowLeftIcon className="h-6 w-6 group-hover:scale-110 transition-transform" />
                        </button>
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-lg bg-gradient-to-r from-[#FFD875]/20 to-[#FFA500]/20">
                                    <SparklesIcon className="h-6 w-6 text-[#FFD875]" />
                                </div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                    {room ? 'Chỉnh sửa phòng chiếu' : 'Tạo phòng chiếu mới'}
                                </h1>
                            </div>
                            <p className="text-gray-400 text-lg">
                                {room ? 'Cập nhật thông tin và cấu hình phòng chiếu' : 'Thiết lập phòng chiếu với sơ đồ ghế tích hợp'}
                            </p>
                        </div>
                    </div>

                    {/* Progress Steps for new room */}
                    {isNewRoom && (
                        <div className="mt-6 flex items-center justify-center">
                            <div className="flex items-center space-x-4">
                                {steps.map((step, index) => {
                                    const isActive = step.id === currentStep;
                                    const isCompleted = completedSteps.has(step.id);
                                    const StepIcon = step.icon;

                                    return (
                                        <div key={step.id} className="flex items-center">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    // Không cho phép click vào bước đã hoàn thành
                                                    if (!isCompleted && step.id !== currentStep) {
                                                        // Chỉ cho phép click vào bước tiếp theo nếu bước hiện tại chưa hoàn thành
                                                        const currentIndex = steps.findIndex(s => s.id === currentStep);
                                                        const targetIndex = steps.findIndex(s => s.id === step.id);
                                                        if (targetIndex === currentIndex - 1 && !completedSteps.has(currentStep)) {
                                                            setCurrentStep(step.id as 'basic' | 'layout' | 'preview');
                                                        }
                                                    }
                                                }}
                                                disabled={isCompleted}
                                                className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-300 ${
                                                    isActive
                                                        ? 'bg-gradient-to-r from-[#FFD875]/20 to-[#FFA500]/20 border border-[#FFD875]/50'
                                                        : isCompleted
                                                            ? 'bg-green-500/20 border border-green-500/50 cursor-not-allowed'
                                                            : 'bg-slate-700/50 border border-slate-600/50 hover:bg-slate-600/50'
                                                } ${!isCompleted && step.id !== currentStep ? 'cursor-pointer' : ''}`}
                                            >
                                                <div className={`p-2 rounded-lg ${
                                                    isActive
                                                        ? 'bg-[#FFD875]/20'
                                                        : isCompleted
                                                            ? 'bg-green-500/20'
                                                            : 'bg-slate-600/50'
                                                }`}>
                                                    {isCompleted ? (
                                                        <CheckCircleIcon className="h-5 w-5 text-green-400" />
                                                    ) : (
                                                        <StepIcon className={`h-5 w-5 ${
                                                            isActive ? 'text-[#FFD875]' : 'text-gray-400'
                                                        }`} />
                                                    )}
                                                </div>
                                                <span className={`font-medium ${
                                                    isActive
                                                        ? 'text-[#FFD875]'
                                                        : isCompleted
                                                            ? 'text-green-400'
                                                            : 'text-gray-400'
                                                }`}>
                                                    {step.label}
                                                    {isCompleted && <span className="ml-2 text-xs">(Hoàn thành)</span>}
                                                </span>
                                            </button>
                                            {index < steps.length - 1 && (
                                                <div className={`w-8 h-0.5 mx-2 ${
                                                    isCompleted ? 'bg-green-500/50' : 'bg-slate-600/50'
                                                }`}></div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Main Content */}
            {currentStep === 'preview' && isNewRoom ? (
                /* Responsive Preview Layout - vừa với 100% zoom */
                <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                    {/* Header responsive */}
                    <motion.div
                        className="w-full bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl border-b border-[#FFD875]/20 p-3 lg:p-4"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="max-w-7xl mx-auto">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <motion.button
                                        onClick={() => !completedSteps.has('layout') && setCurrentStep('layout')}
                                        disabled={completedSteps.has('layout')}
                                        className={`p-2 lg:p-3 rounded-xl transition-all duration-300 group border ${
                                            completedSteps.has('layout')
                                                ? 'bg-gray-600/30 text-gray-500 border-gray-600/30 cursor-not-allowed'
                                                : 'bg-slate-700/50 hover:bg-slate-600/50 text-gray-400 hover:text-white border-slate-600/50'
                                        }`}
                                        whileHover={{ scale: completedSteps.has('layout') ? 1 : 1.05, x: completedSteps.has('layout') ? 0 : -2 }}
                                        whileTap={{ scale: completedSteps.has('layout') ? 1 : 0.95 }}
                                    >
                                        <ArrowLeftIcon className="h-4 w-4 lg:h-5 lg:w-5 group-hover:scale-110 transition-transform" />
                                    </motion.button>
                                    <div>
                                        <h2 className="text-base lg:text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                            Cấu hình chi tiết sơ đồ ghế
                                        </h2>
                                        <p className="text-xs lg:text-sm text-gray-400">Chỉnh sửa loại ghế và hiển thị ghế theo ý muốn</p>
                                    </div>
                                </div>

                                {/* Quick action buttons - Responsive */}
                                <div className="flex flex-wrap items-center gap-2">
                                    <motion.button
                                        type="button"
                                        onClick={handleFinish}
                                        className="px-3 py-2 bg-gradient-to-r from-[#FFD875] to-[#FFA500] hover:from-[#e5c368] hover:to-[#e5941a] text-black font-bold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-1 text-xs"
                                        whileHover={{ scale: 1.02, y: -1 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <CheckCircleIcon className="w-3 h-3" />
                                        Hoàn thành
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Main content area - Responsive và vừa với 100% zoom */}
                    <div className="w-full px-3 lg:px-6 py-4">
                        <div className="max-w-7xl mx-auto">
                            <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 lg:gap-6">
                                {/* Seat preview - chiếm 3/4 không gian trên desktop */}
                                <motion.div
                                    className="xl:col-span-3 bg-gradient-to-br from-slate-900/60 via-slate-800/40 to-slate-900/60 rounded-2xl border border-slate-700/30 backdrop-blur-sm shadow-2xl overflow-hidden"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5, delay: 0.1 }}
                                >
                                    <div className="p-3 lg:p-6">
                                        <div className="w-full">
                                            <InteractiveSeatPreview
                                                rowsInput={seatLayoutConfig.rowsInput}
                                                seatsPerRow={seatLayoutConfig.seatsPerRow}
                                                defaultSeatType={seatLayoutConfig.seatType}
                                                hiddenSeats={seatLayoutConfig.hiddenSeats}
                                                seatTypeOverrides={seatLayoutConfig.seatTypeOverrides}
                                                onSeatTypeChange={handleSeatTypeChange}
                                                onToggleHiddenSeat={handleToggleHiddenSeat}
                                                onStatsUpdate={handleStatsUpdate}
                                                isNewRoom={true}
                                                readOnly={false}
                                                showStats={true}
                                                className="w-full"
                                            />
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Sidebar với thông tin và điều khiển - Responsive, chiếm 1/4 không gian */}
                                <motion.div
                                    className="xl:col-span-1 bg-gradient-to-br from-slate-800/90 via-slate-800/80 to-slate-900/90 backdrop-blur-md rounded-2xl border border-[#FFD875]/30 shadow-2xl overflow-hidden"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                >
                                    <div className="h-full flex flex-col">
                                        {/* Header - Compact */}
                                        <div className="p-3 lg:p-4 border-b border-slate-700/50 flex-shrink-0">
                                            <h3 className="text-sm lg:text-base font-bold text-white mb-1 flex items-center gap-2">
                                                <motion.div
                                                    animate={{ rotate: [0, 360] }}
                                                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                                >
                                                    <InformationCircleIcon className="w-4 h-4 text-[#FFD875]" />
                                                </motion.div>
                                                Thông tin cấu hình
                                            </h3>
                                            <p className="text-xs text-gray-400">Tóm tắt sơ đồ ghế</p>
                                        </div>

                                        {/* Content - Compact và scrollable */}
                                        <div className="flex-1 p-3 lg:p-4 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
                                            {/* Summary stats - Compact */}
                                            <div className="space-y-2">
                                                <h4 className="text-[#FFD875] font-semibold text-xs">Thông số cơ bản</h4>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <motion.div
                                                        className="bg-slate-700/40 rounded-lg p-2 border border-slate-600/30"
                                                        whileHover={{ scale: 1.02, backgroundColor: "rgba(51, 65, 85, 0.6)" }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        <span className="text-gray-400 text-xs block">Số hàng</span>
                                                        <div className="text-white font-bold text-sm mt-1">{parseRowsInput(seatLayoutConfig.rowsInput).length}</div>
                                                    </motion.div>
                                                    <motion.div
                                                        className="bg-slate-700/40 rounded-lg p-2 border border-slate-600/30"
                                                        whileHover={{ scale: 1.02, backgroundColor: "rgba(51, 65, 85, 0.6)" }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        <span className="text-gray-400 text-xs block">Ghế/hàng</span>
                                                        <div className="text-white font-bold text-sm mt-1">{seatLayoutConfig.seatsPerRow}</div>
                                                    </motion.div>

                                                    <motion.div
                                                        className="bg-gradient-to-br from-[#FFD875]/20 to-[#FFA500]/10 rounded-lg p-2 border border-[#FFD875]/40"
                                                        whileHover={{ scale: 1.02 }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        <span className="text-[#FFD875]/80 text-xs block">Tổng ghế</span>
                                                        <div className="text-[#FFD875] font-bold text-lg mt-1">{calculateTotalSeats()}</div>
                                                    </motion.div>
                                                </div>
                                            </div>

                                            {/* Hướng dẫn sử dụng - Compact */}
                                            <div className="space-y-2">
                                                <h4 className="text-[#FFD875] font-semibold text-xs flex items-center gap-1">
                                                    <InformationCircleIcon className="w-3 h-3 flex-shrink-0" />
                                                    Hướng dẫn
                                                </h4>
                                                <div className="bg-slate-700/30 rounded-lg p-2 space-y-2">
                                                    <div className="flex items-start gap-1 text-xs">
                                                        <span className="text-[#FFD875] mt-0.5 font-bold flex-shrink-0">•</span>
                                                        <span className="text-gray-300">Click ghế để đổi loại</span>
                                                    </div>
                                                    <div className="flex items-start gap-1 text-xs">
                                                        <span className="text-[#FFD875] mt-0.5 font-bold flex-shrink-0">•</span>
                                                        <span className="text-gray-300">Ctrl+Click để ẩn/hiện</span>
                                                    </div>
                                                    <div className="flex items-start gap-1 text-xs">
                                                        <span className="text-[#FFD875] mt-0.5 font-bold flex-shrink-0">•</span>
                                                        <span className="text-gray-300">Click hàng/cột cho hàng loạt</span>
                                                    </div>
                                                    <div className="flex items-start gap-1 text-xs p-1 bg-amber-500/10 rounded border border-amber-500/20">
                                                        <span className="text-amber-400 mt-0.5 font-bold flex-shrink-0">⚠</span>
                                                        <span className="text-amber-300">VIP chỉ ở nửa dưới phòng</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Form Section */}
                {/* Form Section */}
                                        <motion.div
                    className={`${currentStep === 'preview' && isNewRoom ? 'hidden' : 'xl:col-span-2'} bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-[#FFD875]/20 shadow-2xl`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#FFD875]/5 via-transparent to-[#FFD875]/5 rounded-xl blur-xl"></div>
                        <div className="relative">
                            <AnimatePresence mode="wait">
                                {/* Basic Information Step */}
                                {(currentStep === 'basic' || room) && (
                                    <motion.div
                                        key="basic"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="mb-6">
                                            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-gradient-to-r from-[#FFD875]/20 to-[#FFA500]/20">
                                                    <CubeIcon className="h-5 w-5 text-[#FFD875]" />
                                                </div>
                                                Thông tin cơ bản
                                            </h3>
                                            <p className="text-gray-400">Nhập thông tin chi tiết về phòng chiếu</p>
                                        </div>

                                        <form onSubmit={handleSubmit(handleFormSubmit as any)} className="space-y-6">
                                            {/* Room Name */}
                                            <div className="relative group">
                                                <label htmlFor="Room_Name" className="block text-sm font-medium text-[#FFD875] mb-3">
                                                    Tên phòng chiếu <span className="text-red-500">*</span>
                                                </label>
                                                <Controller
                                                    name="Room_Name"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <div className="relative">
                                                            <CubeIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#FFD875] w-5 h-5" />
                                                            <input
                                                                {...field}
                                                                type="text"
                                                                className={`w-full pl-12 pr-4 py-4 bg-slate-700/50 backdrop-blur-sm text-white rounded-xl border ${errors.Room_Name || duplicateNameError ? 'border-red-500' : 'border-[#FFD875]/30'
                                                                    } focus:border-[#FFD875] focus:ring-2 focus:ring-[#FFD875]/20 focus:outline-none transition-all duration-300 shadow-lg hover:shadow-xl`}
                                                                placeholder="Ví dụ: Phòng 01, Screen A..."
                                                            />
                                                        </div>
                                                    )}
                                                />
                                                {errors.Room_Name && <p className="mt-2 text-sm text-red-400">{errors.Room_Name.message}</p>}

                                                {/* Duplicate name error with suggestion */}
                                                {duplicateNameError && (
                                                    <motion.div
                                                        className="mt-3 p-4 bg-red-900/30 backdrop-blur-sm border border-red-500/50 rounded-xl"
                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ duration: 0.3 }}
                                                    >
                                                        <div className="flex items-start">
                                                            <ExclamationCircleIcon className="w-5 h-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
                                                            <p className="text-sm text-red-300">{duplicateNameError}</p>
                                                        </div>

                                                        {suggestedName && (
                                                            <div className="mt-3 flex items-center">
                                                                <button
                                                                    type="button"
                                                                    onClick={useSuggestedName}
                                                                    className="flex items-center text-sm bg-gradient-to-r from-[#FFD875] to-[#FFA500] hover:from-[#e5c368] hover:to-[#e5941a] text-black px-4 py-2 rounded-lg ml-8 shadow-lg hover:shadow-xl transition-all duration-300"
                                                                >
                                                                    <ArrowPathIcon className="w-4 h-4 mr-2" />
                                                                    Dùng tên "{suggestedName}"
                                                                </button>
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                )}
                                            </div>

                                            {/* Room Type */}
                                            <div>
                                                <label htmlFor="Room_Type" className="block text-sm font-medium text-[#FFD875] mb-3">
                                                    Loại phòng <span className="text-red-500">*</span>
                                                </label>
                                                <Controller
                                                    name="Room_Type"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <div className="grid grid-cols-2 gap-3">
                                                            {roomTypes.map(type => (
                                                                <motion.button
                                                                    key={type.value}
                                                                    type="button"
                                                                    onClick={() => field.onChange(type.value)}
                                                                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                                                                        field.value === type.value
                                                                            ? 'border-[#FFD875] bg-[#FFD875]/10 shadow-lg'
                                                                            : 'border-slate-600 bg-slate-700/50 hover:border-[#FFD875]/50'
                                                                    }`}
                                                                    whileHover={{ scale: 1.02 }}
                                                                    whileTap={{ scale: 0.98 }}
                                                                >
                                                                    <div className="text-center">
                                                                        <div className={`text-lg font-bold ${
                                                                            field.value === type.value ? 'text-[#FFD875]' : 'text-white'
                                                                        }`}>
                                                                            {type.label}
                                                                        </div>
                                                                        <div className={`text-xs mt-1 ${
                                                                            field.value === type.value ? 'text-[#FFD875]/80' : 'text-gray-400'
                                                                        }`}>
                                                                            {type.value === '2D' && 'Phòng chiếu tiêu chuẩn'}
                                                                            {type.value === '3D' && 'Công nghệ 3D hiện đại'}
                                                                            {type.value === 'IMAX' && 'Trải nghiệm IMAX đỉnh cao'}
                                                                            {type.value === 'VIP' && 'Phòng VIP cao cấp'}
                                                                        </div>
                                                                    </div>
                                                                </motion.button>
                                                            ))}
                                                        </div>
                                                    )}
                                                />
                                                {errors.Room_Type && <p className="mt-2 text-sm text-red-400">{errors.Room_Type.message}</p>}
                                            </div>

                                            {/* Seat Quantity */}
                                            <div>
                                                <label htmlFor="Seat_Quantity" className="block text-sm font-medium text-[#FFD875] mb-3">
                                                    Tổng số ghế <span className="text-red-500">*</span>
                                                </label>
                                                <Controller
                                                    name="Seat_Quantity"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <div className="relative">
                                                            <UserGroupIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#FFD875] w-5 h-5" />
                                                            <input
                                                                {...field}
                                                                type="number"
                                                                className={`w-full pl-12 pr-4 py-4 bg-slate-700/50 backdrop-blur-sm text-white rounded-xl border ${errors.Seat_Quantity ? 'border-red-500' : 'border-[#FFD875]/30'
                                                                    } focus:border-[#FFD875] focus:ring-2 focus:ring-[#FFD875]/20 focus:outline-none transition-all duration-300 shadow-lg hover:shadow-xl`}
                                                                placeholder="Nhập tổng số ghế (20 - 300)"
                                                                min="20"
                                                                max="300"
                                                                readOnly={!!(isNewRoom && seatLayoutConfig.rowsInput.trim() && seatLayoutConfig.seatsPerRow > 0)}
                                                            />
                                                            {isNewRoom && seatLayoutConfig.rowsInput.trim() && seatLayoutConfig.seatsPerRow > 0 && (
                                                                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                                                                    <span className="text-xs text-[#FFD875] bg-[#FFD875]/10 px-2 py-1 rounded-lg">
                                                                        Tự động tính
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                />
                                                {errors.Seat_Quantity && <p className="mt-2 text-sm text-red-400">{errors.Seat_Quantity.message}</p>}
                                                {isNewRoom && seatLayoutConfig.rowsInput.trim() && seatLayoutConfig.seatsPerRow > 0 && (
                                                    <p className="mt-2 text-xs text-[#FFD875]/80">
                                                        💡 Số ghế được tính tự động từ cấu hình sơ đồ ghế
                                                    </p>
                                                )}
                                            </div>

                                            {/* Status */}
                                            <div>
                                                <label htmlFor="Status" className="block text-sm font-medium text-[#FFD875] mb-3">
                                                    Trạng thái <span className="text-red-500">*</span>
                                                </label>
                                                <Controller
                                                    name="Status"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <motion.button
                                                                type="button"
                                                                onClick={() => field.onChange('Active')}
                                                                className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                                                                    field.value === 'Active'
                                                                        ? 'border-green-500 bg-green-500/10 shadow-lg'
                                                                        : 'border-slate-600 bg-slate-700/50 hover:border-green-500/50'
                                                                }`}
                                                                whileHover={{ scale: 1.02 }}
                                                                whileTap={{ scale: 0.98 }}
                                                            >
                                                                <div className="text-center">
                                                                    <div className={`text-lg font-bold flex items-center justify-center gap-2 ${
                                                                        field.value === 'Active' ? 'text-green-400' : 'text-white'
                                                                    }`}>
                                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                        </svg>
                                                                        Hoạt động
                                                                    </div>
                                                                    <div className={`text-xs mt-1 ${
                                                                        field.value === 'Active' ? 'text-green-400/80' : 'text-gray-400'
                                                                    }`}>
                                                                        Phòng sẵn sàng sử dụng
                                                                    </div>
                                                                </div>
                                                            </motion.button>
                                                            <motion.button
                                                                type="button"
                                                                onClick={() => field.onChange('Inactive')}
                                                                className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                                                                    field.value === 'Inactive'
                                                                        ? 'border-red-500 bg-red-500/10 shadow-lg'
                                                                        : 'border-slate-600 bg-slate-700/50 hover:border-red-500/50'
                                                                }`}
                                                                whileHover={{ scale: 1.02 }}
                                                                whileTap={{ scale: 0.98 }}
                                                            >
                                                                <div className="text-center">
                                                                    <div className={`text-lg font-bold flex items-center justify-center gap-2 ${
                                                                        field.value === 'Inactive' ? 'text-red-400' : 'text-white'
                                                                    }`}>
                                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 012 0v6a1 1 0 11-2 0V7zM12 7a1 1 0 012 0v6a1 1 0 11-2 0V7z" clipRule="evenodd" />
                                                                        </svg>
                                                                        Tạm dừng
                                                                    </div>
                                                                    <div className={`text-xs mt-1 ${
                                                                        field.value === 'Inactive' ? 'text-red-400/80' : 'text-gray-400'
                                                                    }`}>
                                                                        Phòng không hoạt động
                                                                    </div>
                                                                </div>
                                                            </motion.button>
                                                        </div>
                                                    )}
                                                />
                                                {errors.Status && <p className="mt-2 text-sm text-red-400">{errors.Status.message}</p>}
                                            </div>

                                            {/* Notes */}
                                            <div>
                                                <label htmlFor="Notes" className="block text-sm font-medium text-[#FFD875] mb-3">
                                                    Ghi chú
                                                </label>
                                                <Controller
                                                    name="Notes"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <div className="relative">
                                                            <RichTextEditor
                                                                value={field.value || ''}
                                                                onChange={field.onChange}
                                                                placeholder="Nhập ghi chú hoặc mô tả về phòng chiếu..."
                                                                minHeight="120px"
                                                            />
                                                        </div>
                                                    )}
                                                />
                                                {errors.Notes && <p className="mt-2 text-sm text-red-400">{errors.Notes.message}</p>}
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-4 pt-8">
                                                {isNewRoom ? (
                                                    <>
                                                        <motion.button
                                                            type="button"
                                                            onClick={handleSubmit(handleCreateRoom as any)}
                                                            disabled={loading}
                                                            className="flex-1 bg-gradient-to-r from-[#FFD875] to-[#FFA500] hover:from-[#e5c368] hover:to-[#e5941a] disabled:from-gray-600 disabled:to-gray-600 text-black font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl disabled:shadow-none flex items-center justify-center gap-3"
                                                            whileHover={{ scale: loading ? 1 : 1.02 }}
                                                            whileTap={{ scale: loading ? 1 : 0.98 }}
                                                        >
                                                            <CogIcon className="w-5 h-5" />
                                                            {loading ? 'Đang tạo phòng...' : 'Tiếp tục cấu hình ghế'}
                                                        </motion.button>
                                                        <motion.button
                                                            type="button"
                                                            onClick={handleCancel}
                                                            className="px-6 py-4 bg-slate-700/50 hover:bg-slate-600/50 text-white font-medium rounded-xl transition-all duration-300 border border-slate-600/50"
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                        >
                                                            Hủy
                                                        </motion.button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <motion.button
                                                            type="submit"
                                                            disabled={loading}
                                                            className="flex-1 bg-gradient-to-r from-[#FFD875] to-[#FFA500] hover:from-[#e5c368] hover:to-[#e5941a] disabled:from-gray-600 disabled:to-gray-600 text-black font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl disabled:shadow-none flex items-center justify-center gap-3"
                                                            whileHover={{ scale: loading ? 1 : 1.02 }}
                                                            whileTap={{ scale: loading ? 1 : 0.98 }}
                                                        >
                                                            {loading ? (
                                                                <>
                                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                                                                    Đang xử lý...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <CheckCircleIcon className="w-5 h-5" />
                                                                    Cập nhật phòng chiếu
                                                                </>
                                                            )}
                                                        </motion.button>
                                                        <motion.button
                                                            type="button"
                                                            onClick={handleCancel}
                                                            className="px-6 py-4 bg-slate-700/50 hover:bg-slate-600/50 text-white font-medium rounded-xl transition-all duration-300 border border-slate-600/50"
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                        >
                                                            Hủy
                                                        </motion.button>
                                                        {room && room.Cinema_Room_ID && (
                                                            <Link
                                                                to={`/admin/cinema-rooms/${room.Cinema_Room_ID}/seats`}
                                                                className="bg-blue-600/80 hover:bg-blue-600 text-white font-medium py-4 px-6 rounded-xl transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl backdrop-blur-sm"
                                                            >
                                                                <ViewColumnsIcon className="w-5 h-5" />
                                                                Quản lý sơ đồ ghế
                                                            </Link>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </form>
                                        </motion.div>
                                )}
                                {/* Seat Layout Configuration Step */}
                                {currentStep === 'layout' && isNewRoom && (
                                        <motion.div
                                        key="layout"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="mb-6">
                                            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-gradient-to-r from-[#FFD875]/20 to-[#FFA500]/20">
                                                    <CogIcon className="h-5 w-5 text-[#FFD875]" />
                                                </div>
                                                Cấu hình sơ đồ ghế
                                            </h3>
                                            <p className="text-gray-400">Thiết lập layout ghế cho phòng chiếu</p>
                                        </div>

                                        <div className="space-y-6">
                                            {/* Row Configuration */}
                                            <div>
                                                <label className="block text-sm font-medium text-[#FFD875] mb-3">
                                                    Hàng ghế <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={seatLayoutConfig.rowsInput}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        setSeatLayoutConfig(prev => ({ ...prev, rowsInput: value }));

                                                        // Validate ngay khi nhập
                                                        setTimeout(() => validateAndUpdateErrors(), 0);
                                                    }}
                                                    className={`w-full px-4 py-4 bg-slate-700/50 backdrop-blur-sm text-white rounded-xl border ${
                                                        seatLayoutErrors.some(error => error.includes('hàng ghế'))
                                                            ? 'border-red-500'
                                                            : 'border-[#FFD875]/30'
                                                    } focus:border-[#FFD875] focus:ring-2 focus:ring-[#FFD875]/20 focus:outline-none transition-all duration-300 shadow-lg hover:shadow-xl`}
                                                    placeholder="Ví dụ: A-E, A-J, A,B,C"
                                                />
                                                <p className="mt-2 text-xs text-gray-400">
                                                    Nhập hàng ghế (A-E cho hàng A đến E, hoặc A,B,C cho từng hàng riêng lẻ). Tối đa 10 hàng từ A đến J.
                                                </p>

                                                {/* Hiển thị lỗi validation cho hàng ghế */}
                                                {seatLayoutErrors.filter(error => error.includes('hàng ghế')).map((error, index) => (
                                                    <motion.p
                                                        key={index}
                                                        className="mt-2 text-sm text-red-400 flex items-center gap-2"
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ duration: 0.3 }}
                                                    >
                                                        <ExclamationCircleIcon className="w-4 h-4 flex-shrink-0" />
                                                        {error}
                                                    </motion.p>
                                                ))}
                                                {seatLayoutConfig.rowsInput && parseRowsInput(seatLayoutConfig.rowsInput).length > 0 && (
                                                    <motion.div
                                                        className="mt-4 space-y-3"
                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ duration: 0.3 }}
                                                    >
                                                        <p className="text-xs text-[#FFD875] bg-[#FFD875]/10 px-3 py-2 rounded-lg">
                                                            ✓ Sẽ tạo {parseRowsInput(seatLayoutConfig.rowsInput).length} hàng: {parseRowsInput(seatLayoutConfig.rowsInput).join(', ')}
                                                        </p>


                                                    </motion.div>
                                                )}
                                            </div>

                                            {/* Seats Per Row */}
                                            <div>
                                                <label className="block text-sm font-medium text-[#FFD875] mb-3">
                                                    Số ghế mỗi hàng <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="15"
                                                    value={seatLayoutConfig.seatsPerRow || ''}
                                                    onChange={(e) => {
                                                        const value = parseInt(e.target.value) || 0;
                                                        setSeatLayoutConfig(prev => ({ ...prev, seatsPerRow: value }));

                                                        // Validate ngay khi nhập
                                                        setTimeout(() => validateAndUpdateErrors(), 0);
                                                    }}
                                                    className={`w-full px-4 py-4 bg-slate-700/50 backdrop-blur-sm text-white rounded-xl border ${
                                                        seatLayoutErrors.some(error => error.includes('ghế mỗi hàng') || error.includes('Tổng số ghế'))
                                                            ? 'border-red-500'
                                                            : 'border-[#FFD875]/30'
                                                    } focus:border-[#FFD875] focus:ring-2 focus:ring-[#FFD875]/20 focus:outline-none transition-all duration-300 shadow-lg hover:shadow-xl`}
                                                    placeholder="Nhập số ghế mỗi hàng (tối đa 15)"
                                                />
                                                <p className="mt-2 text-xs text-gray-400">
                                                    Số ghế mỗi hàng tối đa là 15
                                                </p>

                                                {/* Hiển thị lỗi validation cho số ghế mỗi hàng */}
                                                {seatLayoutErrors.filter(error => error.includes('ghế mỗi hàng')).map((error, index) => (
                                                    <motion.p
                                                        key={index}
                                                        className="mt-2 text-sm text-red-400 flex items-center gap-2"
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ duration: 0.3 }}
                                                    >
                                                        <ExclamationCircleIcon className="w-4 h-4 flex-shrink-0" />
                                                        {error}
                                                    </motion.p>
                                                ))}

                                                {/* Hiển thị lỗi validation cho tổng số ghế */}
                                                {seatLayoutErrors.filter(error => error.includes('Tổng số ghế')).map((error, index) => (
                                                    <motion.p
                                                        key={index}
                                                        className="mt-2 text-sm text-red-400 flex items-center gap-2"
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ duration: 0.3 }}
                                                    >
                                                        <ExclamationCircleIcon className="w-4 h-4 flex-shrink-0" />
                                                        {error}
                                                    </motion.p>
                                                ))}
                                            </div>

                                            {/* Validation Errors */}
                                            {seatLayoutErrors.length > 0 && (
                                                <motion.div
                                                    className="mt-4 p-4 bg-red-900/30 backdrop-blur-sm border border-red-500/50 rounded-xl"
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ duration: 0.3 }}
                                                >
                                                    <div className="flex items-start">
                                                        <ExclamationCircleIcon className="w-5 h-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
                                                        <div>
                                                            <p className="text-sm font-medium text-red-300 mb-2">Cấu hình sơ đồ ghế không hợp lệ:</p>
                                                            <ul className="text-sm text-red-300 space-y-1">
                                                                {seatLayoutErrors.map((error, index) => (
                                                                    <li key={index} className="flex items-start">
                                                                        <span className="text-red-400 mr-2">•</span>
                                                                        {error}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}

                                            {/* Seat Type */}
                                            <div>
                                                <label className="block text-sm font-medium text-[#FFD875] mb-3">
                                                    Loại ghế mặc định
                                                </label>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <motion.button
                                                        type="button"
                                                        onClick={() => setSeatLayoutConfig(prev => ({ ...prev, seatType: 'Regular' }))}
                                                        className={`p-3 rounded-xl border-2 transition-all duration-300 ${
                                                            seatLayoutConfig.seatType === 'Regular'
                                                                ? 'border-green-500 bg-green-500/10 shadow-lg shadow-green-500/20'
                                                                : 'border-slate-600 bg-slate-700/30 hover:border-slate-500'
                                                        }`}
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                    >
                                                        <div className="text-center">
                                                            <div className={`text-sm font-bold flex items-center justify-center gap-1 ${
                                                                seatLayoutConfig.seatType === 'Regular' ? 'text-green-400' : 'text-white'
                                                            }`}>
                                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                                                                </svg>
                                                                Thường
                                                            </div>
                                                        </div>
                                                    </motion.button>
                                                    <motion.button
                                                        type="button"
                                                        onClick={() => setSeatLayoutConfig(prev => ({ ...prev, seatType: 'VIP' }))}
                                                        className={`p-3 rounded-xl border-2 transition-all duration-300 ${
                                                            seatLayoutConfig.seatType === 'VIP'
                                                                ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20'
                                                                : 'border-slate-600 bg-slate-700/30 hover:border-slate-500'
                                                        }`}
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                    >
                                                        <div className="text-center">
                                                            <div className={`text-sm font-bold flex items-center justify-center gap-1 ${
                                                                seatLayoutConfig.seatType === 'VIP' ? 'text-purple-400' : 'text-white'
                                                            }`}>
                                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                                </svg>
                                                                VIP
                                                            </div>
                                                        </div>
                                                    </motion.button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Navigation Buttons */}
                                        <div className="flex gap-4 pt-8">
                                            <motion.button
                                                type="button"
                                                onClick={() => !completedSteps.has('basic') && setCurrentStep('basic')}
                                                disabled={completedSteps.has('basic')}
                                                className={`px-6 py-4 font-medium rounded-xl transition-all duration-300 border flex items-center gap-2 ${
                                                    completedSteps.has('basic')
                                                        ? 'bg-gray-600/30 text-gray-500 border-gray-600/30 cursor-not-allowed'
                                                        : 'bg-slate-700/50 hover:bg-slate-600/50 text-white border-slate-600/50'
                                                }`}
                                                whileHover={{ scale: completedSteps.has('basic') ? 1 : 1.02 }}
                                                whileTap={{ scale: completedSteps.has('basic') ? 1 : 0.98 }}
                                            >
                                                <ArrowLeftIcon className="w-4 h-4" />
                                                {completedSteps.has('basic') ? 'Không thể quay lại' : 'Quay lại'}
                                            </motion.button>
                                            <motion.button
                                                type="button"
                                                onClick={handleCreateSeatLayout}
                                                disabled={!seatLayoutConfig.rowsInput.trim() || !seatLayoutConfig.seatsPerRow || loading || seatLayoutErrors.length > 0}
                                                className="flex-1 bg-gradient-to-r from-[#FFD875] to-[#FFA500] hover:from-[#e5c368] hover:to-[#e5941a] disabled:from-gray-600 disabled:to-gray-600 text-black font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl disabled:shadow-none flex items-center justify-center gap-3"
                                                whileHover={{ scale: loading || seatLayoutErrors.length > 0 ? 1 : 1.02 }}
                                                whileTap={{ scale: loading || seatLayoutErrors.length > 0 ? 1 : 0.98 }}
                                            >
                                                <CogIcon className="w-5 h-5" />
                                                {loading ? 'Đang tạo sơ đồ...' : 'Cấu hình chi tiết sơ đồ ghế'}
                                            </motion.button>
                                        </div>
                                            </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                                        </motion.div>

                {/* Preview/Sidebar Section */}
                <motion.div
                    className={`${currentStep === 'preview' && isNewRoom ? 'w-full' : 'xl:col-span-1'} bg-slate-800/80 backdrop-blur-sm rounded-2xl ${currentStep === 'preview' && isNewRoom ? 'p-8' : 'p-4'} border border-[#FFD875]/20 shadow-2xl`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#FFD875]/5 via-transparent to-[#FFD875]/5 rounded-xl blur-xl"></div>
                        <div className="relative">
                            <h3 className={`${currentStep === 'preview' && isNewRoom ? 'text-2xl' : 'text-lg'} font-bold text-white mb-3 flex items-center gap-2`}>
                                <div className="p-1.5 rounded-lg bg-gradient-to-r from-[#FFD875]/20 to-[#FFA500]/20">
                                    <EyeIcon className="w-4 h-4 text-[#FFD875]" />
                                </div>
                                {isNewRoom ? 'Preview sơ đồ ghế' : 'Sơ đồ ghế hiện tại'}
                            </h3>

                            {/* Preview Step for New Room */}
                            {currentStep === 'preview' && isNewRoom && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="flex justify-center">
                                        <InteractiveSeatPreview
                                            rowsInput={seatLayoutConfig.rowsInput}
                                            seatsPerRow={seatLayoutConfig.seatsPerRow}
                                            defaultSeatType={seatLayoutConfig.seatType}
                                            hiddenSeats={seatLayoutConfig.hiddenSeats}
                                            seatTypeOverrides={seatLayoutConfig.seatTypeOverrides}
                                            onSeatTypeChange={handleSeatTypeChange}
                                            onToggleHiddenSeat={handleToggleHiddenSeat}
                                            onStatsUpdate={handleStatsUpdate}
                                            isNewRoom={true}
                                            showStats={true}
                                        />
                                    </div>

                                    {/* Final Action Buttons - Compact */}
                                    <div className="mt-4 space-y-3">
                                        <div className="bg-slate-700/30 rounded-lg p-3">
                                            <h4 className="text-[#FFD875] font-semibold mb-2 flex items-center gap-2 text-sm">
                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                                                </svg>
                                                Tóm tắt
                                            </h4>
                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                <div>
                                                    <span className="text-gray-400">Hàng:</span>
                                                    <span className="text-white ml-1">{parseRowsInput(seatLayoutConfig.rowsInput).join(', ')}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-400">Ghế/hàng:</span>
                                                    <span className="text-white ml-1">{seatLayoutConfig.seatsPerRow}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-400">Loại:</span>
                                                    <span className="text-white ml-1">{seatLayoutConfig.seatType === 'VIP' ? 'VIP' : 'Thường'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-400">Tổng:</span>
                                                    <span className="text-[#FFD875] font-bold ml-1">{calculateTotalSeats()}</span>
                                                </div>
                                    </div>
                                </div>

                                        <div className="space-y-2">
                                            <div className="flex gap-2">
                                        <motion.button
                                            type="button"
                                            onClick={() => !completedSteps.has('layout') && setCurrentStep('layout')}
                                            disabled={completedSteps.has('layout')}
                                            className={`px-3 py-2 font-medium rounded-lg transition-all duration-300 border flex items-center gap-1 text-sm ${
                                                completedSteps.has('layout')
                                                    ? 'bg-gray-600/30 text-gray-500 border-gray-600/30 cursor-not-allowed'
                                                    : 'bg-slate-700/50 hover:bg-slate-600/50 text-white border-slate-600/50'
                                            }`}
                                            whileHover={{ scale: completedSteps.has('layout') ? 1 : 1.02 }}
                                            whileTap={{ scale: completedSteps.has('layout') ? 1 : 0.98 }}
                                        >
                                            <ArrowLeftIcon className="w-3 h-3" />
                                            {completedSteps.has('layout') ? 'Không thể quay lại' : 'Quay lại'}
                                        </motion.button>
                                                <motion.button
                                                    type="button"
                                                    onClick={handleUpdateSeatTypes}
                                                    disabled={loading}
                                                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-bold py-2 px-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:shadow-none flex items-center justify-center gap-1 text-sm"
                                                    whileHover={{ scale: loading ? 1 : 1.02 }}
                                                    whileTap={{ scale: loading ? 1 : 0.98 }}
                                                >
                                                    <CogIcon className="w-3 h-3" />
                                                    {loading ? 'Đang cập nhật...' : 'Cập nhật loại ghế'}
                                                </motion.button>
                                            </div>
                                            <div className="flex gap-2">
                                                <motion.button
                                                    type="button"
                                                    onClick={handleUpdateSeatVisibility}
                                                    disabled={loading}
                                                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-bold py-2 px-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:shadow-none flex items-center justify-center gap-1 text-sm"
                                                    whileHover={{ scale: loading ? 1 : 1.02 }}
                                                    whileTap={{ scale: loading ? 1 : 0.98 }}
                                                >
                                                    <EyeIcon className="w-3 h-3" />
                                                    {loading ? 'Đang cập nhật...' : 'Cập nhật hiển thị ghế'}
                                                </motion.button>
                                                <motion.button
                                                    type="button"
                                                    onClick={handleFinish}
                                                    className="flex-1 bg-gradient-to-r from-[#FFD875] to-[#FFA500] hover:from-[#e5c368] hover:to-[#e5941a] text-black font-bold py-2 px-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-1 text-sm"
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                >
                                                    <CheckCircleIcon className="w-3 h-3" />
                                                    Hoàn thành
                                                </motion.button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Existing room layout */}
                            {room && room.Cinema_Room_ID && (
                                <div className="space-y-4">
                                    <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                                        <div className="text-center mb-4">
                                            <div className="inline-block bg-gradient-to-r from-[#FFD875]/20 to-[#FFD875]/10 border border-[#FFD875]/30 rounded-lg px-6 py-2 mb-4">
                                                <p className="text-[#FFD875] font-semibold">MÀN HÌNH</p>
                                            </div>
                                        </div>

                                        {seatLayoutLoading ? (
                                            <div className="text-center py-8">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FFD875] mx-auto mb-2"></div>
                                                <p className="text-gray-400 text-sm">Đang tải sơ đồ ghế...</p>
                                            </div>
                                        ) : seatLayout ? (
                                            <>
                                                {/* Render actual seat layout from API */}
                                                <div className="overflow-x-auto mb-4">
                                                    <div className="min-w-max mx-auto space-y-2">
                                                        {seatLayout.rows.map(row => (
                                                            <motion.div
                                                                key={row.Row}
                                                                className="flex items-center gap-3"
                                                                initial={{ opacity: 0, x: -20 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ duration: 0.3, delay: 0.1 }}
                                                            >
                                                                <div className="w-8 text-center text-[#FFD875] font-bold text-sm">{row.Row}</div>
                                                                <div className="flex gap-1">
                                                                    {row.Seats.map(seat => (
                                                                        <motion.div
                                                                            key={seat.Layout_ID}
                                                                            className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center text-xs transition-all duration-200 ${
                                                                                !seat.Is_Active
                                                                                    ? 'bg-gray-500/20 border-gray-500/50 text-gray-400 border-dashed'
                                                                                    : getSeatTypeColor(seat.Seat_Type)
                                                                            } ${seatLayout?.can_modify ? 'cursor-pointer hover:ring-2 hover:ring-[#FFD875]/50' : 'cursor-not-allowed'}`}
                                                                            title={seatLayout?.can_modify
                                                                                ? `${seat.Row_Label}${seat.Column_Number} - ${getSeatTypeDisplayName(seat.Seat_Type)} ${!seat.Is_Active ? '(Đã ẩn)' : ''} | ${seat.Is_Active ? 'Click: Đổi loại ghế | ' : ''}Ctrl+Click: ${seat.Is_Active ? 'Ẩn' : 'Hiện'} ghế`
                                                                                : `${seat.Row_Label}${seat.Column_Number} - ${getSeatTypeDisplayName(seat.Seat_Type)} ${!seat.Is_Active ? '(Đã ẩn)' : ''} | Không thể chỉnh sửa (có booking)`
                                                                            }
                                                                            whileHover={{ scale: seatLayout?.can_modify ? 1.1 : 1.05 }}
                                                                            initial={{ scale: 0 }}
                                                                            animate={{ scale: 1 }}
                                                                            transition={{ duration: 0.2, delay: seat.Column_Number * 0.02 }}
                                                                            onClick={(e) => {
                                                                                if (!seatLayout?.can_modify) return;

                                                                                if (e.ctrlKey || e.metaKey) {
                                                                                    // Ctrl+Click để ẩn/hiện ghế
                                                                                    handleSeatVisibilityToggle(seat);
                                                                                } else {
                                                                                    // Click thường để đổi loại ghế
                                                                                    handleSeatTypeToggle(seat);
                                                                                }
                                                                            }}
                                                                        >
                                                                            <span className="text-xs">{getSeatTypeIcon(seat.Seat_Type, seat.Is_Active)}</span>
                                                                        </motion.div>
                                                                    ))}
                                                                </div>
                                                                <div className="w-8 text-center text-[#FFD875] font-bold text-sm">{row.Row}</div>
                                                            </motion.div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="text-center">
                                                    <div className="bg-slate-700/30 rounded-xl p-4 mb-4">
                                                        <div className="flex items-center justify-center gap-3 mb-2">
                                                            <p className="text-[#FFD875] font-semibold flex items-center gap-2">
                                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                                                                </svg>
                                                                Thống kê phòng chiếu
                                                            </p>
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                                seatLayout?.can_modify
                                                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                                            }`}>
                                                                {seatLayout?.can_modify ? '✓ Có thể chỉnh sửa' : '✗ Không thể chỉnh sửa'}
                                                            </span>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                                            <div>
                                                                <span className="text-gray-400">Loại phòng:</span>
                                                                <span className="text-white ml-2 font-medium">{roomType}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-400">Tổng ghế:</span>
                                                                <span className="text-[#FFD875] font-bold ml-2">{seatLayout.stats.total_seats}</span>
                                                            </div>
                                                        </div>

                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-center py-8">
                                                <div className="bg-slate-700/30 rounded-xl p-6">
                                                    <div className="text-6xl mb-4">🎭</div>
                                                    <p className="text-gray-300 font-medium mb-2">Chưa có sơ đồ ghế</p>
                                                    <p className="text-sm text-gray-400">Sử dụng nút bên dưới để cấu hình sơ đồ ghế cho phòng chiếu</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <motion.button
                                        onClick={async () => {
                                            setShowSeatConfig(true);
                                            // Load seat layout mapping khi mở cấu hình chi tiết
                                            const roomId = createdRoomId || room?.Cinema_Room_ID;
                                            if (roomId) {
                                                console.log('🔄 Loading seat layout mapping cho cấu hình chi tiết...');
                                                await fetchSeatLayout(roomId);
                                            }
                                        }}
                                        className="w-full bg-gradient-to-r from-[#FFD875] to-[#FFA500] hover:from-[#e5c368] hover:to-[#e5941a] text-black font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <CogIcon className="w-5 h-5" />
                                        {seatLayout ? 'Cấu hình lại sơ đồ ghế' : 'Cấu hình sơ đồ ghế hàng loạt'}
                                    </motion.button>

                                    <div className="bg-slate-700/30 rounded-xl p-4">
                                        <p className="font-medium text-[#FFD875] mb-3 flex items-center gap-2">
                                            <SparklesIcon className="w-4 h-4" />
                                            Hướng dẫn sử dụng
                                        </p>
                                        <ul className="space-y-2 text-xs text-gray-300">
                                            <li className="flex items-start gap-2">
                                                <span className="text-[#FFD875] mt-0.5">•</span>
                                                <span>Cấu hình nhanh sơ đồ ghế cho phòng chiếu</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-[#FFD875] mt-0.5">•</span>
                                                <span>Chọn loại ghế: Thường, VIP</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-[#FFD875] mt-0.5">•</span>
                                                <span>Thiết lập hàng ghế và lối đi</span>
                                            </li>
                                            {seatLayout && (
                                                <>
                                                    <li className="flex items-start gap-2">
                                                        <span className="text-green-400 mt-0.5">•</span>
                                                        <span><strong>Click ghế:</strong> Đổi loại ghế (Thường ↔ VIP)</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <span className="text-blue-400 mt-0.5">•</span>
                                                        <span><strong>Ctrl+Click ghế:</strong> Ẩn/hiện ghế</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <span className="text-purple-400 mt-0.5">•</span>
                                                        <span><strong>VIP chỉ ở nửa cuối rạp:</strong> Hàng {seatLayout.dimensions.rows > 1 ? Math.floor(seatLayout.dimensions.rows / 2) + 1 : 1} trở xuống</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <span className="text-orange-400 mt-0.5">•</span>
                                                        <span><strong>Ghế ẩn (🚫):</strong> Không thể đổi loại, chỉ có thể hiện lại</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <span className="text-red-400 mt-0.5">•</span>
                                                        <span>Chỉ có thể chỉnh sửa khi không có booking</span>
                                                    </li>
                                                </>
                                            )}
                                            <li className="flex items-start gap-2">
                                                <span className="text-[#FFD875] mt-0.5">•</span>
                                                <span>Xem trước trước khi áp dụng</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {/* Live Preview for Basic/Layout Steps */}
                            {isNewRoom && (currentStep === 'basic' || currentStep === 'layout') && seatLayoutConfig.rowsInput.trim() && seatLayoutConfig.seatsPerRow > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3 }}
                                    className="mt-6"
                                >
                                    <h4 className="text-sm font-medium text-[#FFD875] mb-3 flex items-center gap-2">
                                        <PlayIcon className="w-4 h-4" />
                                        Preview trực tiếp
                                    </h4>
                                    <div className="flex justify-center">
                                        <InteractiveSeatPreview
                                            rowsInput={seatLayoutConfig.rowsInput}
                                            seatsPerRow={seatLayoutConfig.seatsPerRow}
                                            defaultSeatType={seatLayoutConfig.seatType}
                                            hiddenSeats={seatLayoutConfig.hiddenSeats}
                                            seatTypeOverrides={seatLayoutConfig.seatTypeOverrides}
                                            onSeatTypeChange={handleSeatTypeChange}
                                            onToggleHiddenSeat={handleToggleHiddenSeat}
                                            onStatsUpdate={handleStatsUpdate}
                                            isNewRoom={true}
                                            readOnly={currentStep === 'layout'} // Chỉ cho xem ở bước layout
                                            showStats={true}
                                            className="scale-90 origin-top"
                                        />
                                    </div>
                                </motion.div>
                            )}

                            {/* Quick Stats */}
                            {isNewRoom && seatLayoutConfig.rowsInput.trim() && seatLayoutConfig.seatsPerRow > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="mt-4 bg-slate-700/30 rounded-xl p-4"
                                >
                                    <h4 className="text-[#FFD875] font-semibold mb-2 text-sm flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                                        </svg>
                                        Thống kê nhanh
                                    </h4>
                                    <div className="grid grid-cols-2 gap-3 text-xs">
                                        <div className="bg-slate-600/30 rounded-lg p-2">
                                            <span className="text-gray-400">Số hàng:</span>
                                            <span className="text-white ml-2 font-bold">{parseRowsInput(seatLayoutConfig.rowsInput).length}</span>
                                        </div>
                                        <div className="bg-slate-600/30 rounded-lg p-2">
                                            <span className="text-gray-400">Ghế/hàng:</span>
                                            <span className="text-white ml-2 font-bold">{seatLayoutConfig.seatsPerRow}</span>
                                        </div>
                                        <div className="bg-slate-600/30 rounded-lg p-2">
                                            <span className="text-gray-400">Loại ghế:</span>
                                            <span className="text-white ml-2 font-bold">{seatLayoutConfig.seatType === 'VIP' ? '👑 VIP' : '💺 Thường'}</span>
                                        </div>
                                        <div className={`rounded-lg p-2 border ${
                                            calculateTotalSeats() > 150
                                                ? 'bg-red-900/20 border-red-500/50'
                                                : 'bg-[#FFD875]/10 border-[#FFD875]/30'
                                        }`}>
                                            <span className="text-gray-400">Tổng ghế:</span>
                                            <span className={`ml-2 font-bold ${
                                                calculateTotalSeats() > 150 ? 'text-red-400' : 'text-[#FFD875]'
                                            }`}>
                                                {calculateTotalSeats()}/150
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </motion.div>
                </div>
            )}

            {/* Seat Configuration Modal */}
            {showSeatConfig && room?.Cinema_Room_ID && (
                <SeatLayoutConfig
                    roomId={room.Cinema_Room_ID}
                    onClose={() => setShowSeatConfig(false)}
                    onSuccess={handleSeatConfigSuccess}
                />
            )}
        </div>
    );
};

export default CinemaRoomForm;
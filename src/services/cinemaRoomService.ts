import apiClient from './apiClient';
import type { CinemaRoom, CinemaRoomFormData } from '../types/cinemaRoom';

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

const getAllCinemaRooms = async (): Promise<CinemaRoom[]> => {
    const response = await apiClient.get<ApiResponse<CinemaRoom[]>>('/cinema-rooms');
    return response.data.data || [];
};

const getRoomsByCinemaId = async (cinemaId: number): Promise<CinemaRoom[]> => {
    console.log('cinemaRoomService - Getting rooms for cinema ID:', cinemaId);
    try {
        // Try multiple possible endpoints
        try {
            const response = await apiClient.get<any>(`/cinemas/${cinemaId}/rooms`);
            console.log('cinemaRoomService - Raw rooms response:', response.data);

            // Handle different response formats
            let roomsData = [];

            if (response.data && response.data.data && Array.isArray(response.data.data)) {
                // Standard API response format with data property
                roomsData = response.data.data;
            } else if (response.data && Array.isArray(response.data)) {
                // Direct array response
                roomsData = response.data;
            } else if (response.data && response.data.success && response.data.data) {
                // Success wrapper format
                roomsData = response.data.data;
            }

            console.log('cinemaRoomService - Extracted rooms data:', roomsData);

            // Map the rooms to ensure consistent format matching CinemaRoom interface
            const mappedRooms = roomsData.map((room: any, index: number) => {
                // Extract room ID, ensuring it's a number
                const roomId = room.Cinema_Room_ID || room.id || room.roomId || index + 1;

                // Extract room name
                const roomName = room.Room_Name || room.name || room.roomName || `Phòng ${index + 1}`;

                // Extract room type, defaulting to '2D'
                const roomType = room.Room_Type || room.roomType || room.type || '2D';

                // Extract seat quantity/capacity
                const seatQuantity = room.Seat_Quantity || room.Capacity || room.capacity || room.seat_quantity || 48;

                // Extract status, defaulting to 'Active'
                const status = room.Status || room.status || 'Active';

                // Return object matching CinemaRoom interface
                return {
                    Cinema_Room_ID: Number(roomId),
                    Cinema_ID: Number(cinemaId),
                    Room_Name: roomName,
                    Seat_Quantity: Number(seatQuantity),
                    Room_Type: roomType as any,
                    Status: status as any,
                    Notes: room.Notes || room.Description || room.description || null
                };
            });

            console.log('cinemaRoomService - Mapped rooms:', mappedRooms);
            return mappedRooms;
        } catch (error) {
            console.error('cinemaRoomService - Error with first endpoint, trying alternative:', error);

            // Try alternative endpoint format
            const altResponse = await apiClient.get<any>(`/cinema-rooms/cinema/${cinemaId}`);
            console.log('cinemaRoomService - Alternative endpoint response:', altResponse.data);

            let roomsData = [];
            if (altResponse.data && altResponse.data.data && Array.isArray(altResponse.data.data)) {
                roomsData = altResponse.data.data;
            } else if (altResponse.data && Array.isArray(altResponse.data)) {
                roomsData = altResponse.data;
            }

            // Map the rooms to ensure consistent format matching CinemaRoom interface
            const mappedRooms = roomsData.map((room: any, index: number) => {
                // Extract room ID, ensuring it's a number
                const roomId = room.Cinema_Room_ID || room.id || room.roomId || index + 1;

                // Extract room name
                const roomName = room.Room_Name || room.name || room.roomName || `Phòng ${index + 1}`;

                // Extract room type, defaulting to '2D'
                const roomType = room.Room_Type || room.roomType || room.type || '2D';

                // Extract seat quantity/capacity
                const seatQuantity = room.Seat_Quantity || room.Capacity || room.capacity || room.seat_quantity || 48;

                // Extract status, defaulting to 'Active'
                const status = room.Status || room.status || 'Active';

                // Return object matching CinemaRoom interface
                return {
                    Cinema_Room_ID: Number(roomId),
                    Cinema_ID: Number(cinemaId),
                    Room_Name: roomName,
                    Seat_Quantity: Number(seatQuantity),
                    Room_Type: roomType as any,
                    Status: status as any,
                    Notes: room.Notes || room.Description || room.description || null
                };
            });

            console.log('cinemaRoomService - Mapped rooms from alternative endpoint:', mappedRooms);
            return mappedRooms;
        }
    } catch (error) {
        console.error('cinemaRoomService - Error getting rooms by cinema ID:', error);
        throw error;
    }
};

const getCinemaRoomById = async (roomId: number): Promise<CinemaRoom> => {
    // Validate roomId before making the API call
    if (!roomId || isNaN(roomId)) {
        throw new Error('ID phòng chiếu không hợp lệ');
    }

    try {
        const response = await apiClient.get<CinemaRoom>(`/cinema-rooms/${roomId}`);
        return response.data;
    } catch (error) {
        console.error('Error getting room by ID:', error);
        throw error;
    }
};

const createCinemaRoom = async (cinemaId: number, data: CinemaRoomFormData): Promise<CinemaRoom> => {
    // Map frontend field names to backend field names expected by the API
    const payload = {
        RoomName: data.Room_Name,
        Capacity: data.Seat_Quantity,
        RoomType: data.Room_Type,
        Status: data.Status,
        Description: data.Notes || '',
        Cinema_ID: cinemaId
    };

    console.log('cinemaRoomService - Creating room with payload:', payload);
    try {
        const response = await apiClient.post<ApiResponse<CinemaRoom>>(`/cinemas/${cinemaId}/rooms`, payload);
        console.log('cinemaRoomService - Create room response:', response.data);

        // Kiểm tra cấu trúc phản hồi
        if (response.data && response.data.success && response.data.data) {
            return response.data.data;
        } else if (response.data && !('success' in response.data)) {
            // Nếu API trả về trực tiếp đối tượng phòng chiếu
            return response.data as unknown as CinemaRoom;
        } else {
            throw new Error('Định dạng phản hồi từ API không hợp lệ');
        }
    } catch (error: any) {
        console.error('cinemaRoomService - Error creating room:', error);

        // Log chi tiết hơn về lỗi
        if (error.response) {
            console.error('cinemaRoomService - Error response status:', error.response.status);
            console.error('cinemaRoomService - Error response data:', error.response.data);

            // Kiểm tra lỗi trùng tên phòng
            if (error.response.data && error.response.data.message) {
                const errorMessage = error.response.data.message;
                console.error('cinemaRoomService - Error message from API:', errorMessage);

                // Kiểm tra xem có gợi ý tên phòng mới không
                if (errorMessage.includes('đã tồn tại trong rạp này') && errorMessage.includes('Bạn có thể sử dụng tên')) {
                    const suggestedName = errorMessage.match(/Bạn có thể sử dụng tên '([^']+)'/);
                    if (suggestedName && suggestedName[1]) {
                        console.log('cinemaRoomService - Suggested room name:', suggestedName[1]);
                    }
                }

                // Trả về lỗi với message từ API
                throw new Error(errorMessage);
            }
        }

        throw error;
    }
};

const updateCinemaRoom = async (roomId: number, data: Partial<CinemaRoomFormData>): Promise<CinemaRoom> => {
    // Map frontend field names to backend field names expected by the API
    const payload: any = {};

    if (data.Room_Name !== undefined) payload.RoomName = data.Room_Name;
    if (data.Seat_Quantity !== undefined) payload.Capacity = data.Seat_Quantity;
    if (data.Room_Type !== undefined) payload.RoomType = data.Room_Type;
    if (data.Status !== undefined) payload.Status = data.Status;
    if (data.Notes !== undefined) payload.Description = data.Notes;

    console.log('cinemaRoomService - Updating room with ID:', roomId, 'Payload:', payload);
    try {
        const response = await apiClient.put<CinemaRoom>(`/cinema-rooms/${roomId}`, payload);
        console.log('cinemaRoomService - Update room response:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('cinemaRoomService - Error updating room:', error);

        // Log chi tiết hơn về lỗi
        if (error.response) {
            console.error('cinemaRoomService - Error response status:', error.response.status);
            console.error('cinemaRoomService - Error response data:', error.response.data);

            // Kiểm tra lỗi trùng tên phòng
            if (error.response.data && error.response.data.message) {
                const errorMessage = error.response.data.message;
                console.error('cinemaRoomService - Error message from API:', errorMessage);

                // Kiểm tra xem có gợi ý tên phòng mới không
                if (errorMessage.includes('đã tồn tại trong rạp này') && errorMessage.includes('Bạn có thể sử dụng tên')) {
                    const suggestedName = errorMessage.match(/Bạn có thể sử dụng tên '([^']+)'/);
                    if (suggestedName && suggestedName[1]) {
                        console.log('cinemaRoomService - Suggested room name:', suggestedName[1]);
                    }
                }

                // Trả về lỗi với message từ API
                throw new Error(errorMessage);
            }
        }

        throw error;
    }
};

const deleteCinemaRoom = async (roomId: number): Promise<{ success: boolean; message: string }> => {
    console.log('cinemaRoomService - Deleting room with ID:', roomId);
    try {
        const response = await apiClient.delete<ApiResponse<any>>(`/cinema-rooms/${roomId}`);
        console.log('cinemaRoomService - Delete room response:', response.data);
        return {
            success: true,
            message: response.data.message || 'Đã xóa phòng chiếu thành công'
        };
    } catch (error) {
        console.error('cinemaRoomService - Error deleting room:', error);
        throw error;
    }
};

// Lấy danh sách phòng hoạt động của rạp
const getActiveRoomsByCinemaId = async (cinemaId: number): Promise<CinemaRoom[]> => {
    console.log('cinemaRoomService - Getting active rooms for cinema ID:', cinemaId);
    try {
        const response = await apiClient.get<any>(`/cinemas/${cinemaId}/rooms/active`);
        console.log('cinemaRoomService - Raw active rooms response:', response.data);

        // Handle different response formats
        let roomsData = [];

        if (response.data && response.data.data && Array.isArray(response.data.data)) {
            // Standard API response format with data property
            roomsData = response.data.data;
        } else if (response.data && Array.isArray(response.data)) {
            // Direct array response
            roomsData = response.data;
        } else if (response.data && response.data.success && response.data.data) {
            // Success wrapper format
            roomsData = response.data.data;
        }

        console.log('cinemaRoomService - Extracted active rooms data:', roomsData);

        // Map the rooms to ensure consistent format matching CinemaRoom interface
        const mappedRooms = roomsData.map((room: any, index: number) => {
            // Extract room ID, ensuring it's a number
            const roomId = room.Cinema_Room_ID || room.id || room.roomId || index + 1;

            // Extract room name
            const roomName = room.Room_Name || room.name || room.roomName || `Phòng ${index + 1}`;

            // Extract room type, defaulting to '2D'
            const roomType = room.Room_Type || room.roomType || room.type || '2D';

            // Extract seat quantity/capacity
            const seatQuantity = room.Seat_Quantity || room.Capacity || room.capacity || room.seat_quantity || 48;

            // Extract status, defaulting to 'Active'
            const status = room.Status || room.status || 'Active';

            // Return object matching CinemaRoom interface
            return {
                Cinema_Room_ID: Number(roomId),
                Cinema_ID: Number(cinemaId),
                Room_Name: roomName,
                Seat_Quantity: Number(seatQuantity),
                Room_Type: roomType as any,
                Status: status as any,
                Notes: room.Notes || room.Description || room.description || null
            };
        });

        console.log('cinemaRoomService - Mapped active rooms:', mappedRooms);
        return mappedRooms;
    } catch (error) {
        console.error('cinemaRoomService - Error getting active rooms by cinema ID:', error);
        throw error;
    }
};

// Interface cho lịch chiếu hiện tại
interface ExistingShowtime {
    Showtime_ID: number;
    Start_Time: string;
    End_Time: string;
    Movie_Name?: string;
    Duration?: number;
}

// Lấy danh sách lịch chiếu hiện có của phòng trong ngày
const getExistingShowtimesByRoomAndDate = async (roomId: number, date: string): Promise<ExistingShowtime[]> => {
    console.log('cinemaRoomService - Getting existing showtimes for room ID:', roomId, 'date:', date);
    try {
        const response = await apiClient.get<any>(`/showtimes/room/${roomId}/date/${date}`);
        console.log('cinemaRoomService - Raw existing showtimes response:', response.data);

        // Handle different response formats
        let showtimesData = [];

        if (response.data && Array.isArray(response.data)) {
            showtimesData = response.data;
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
            showtimesData = response.data.data;
        } else if (response.data && response.data.success && response.data.data) {
            showtimesData = response.data.data;
        }

        console.log('cinemaRoomService - Extracted showtimes data:', showtimesData);

        // Map the showtimes
        const mappedShowtimes = showtimesData.map((showtime: any) => ({
            Showtime_ID: showtime.Showtime_ID || showtime.id,
            Start_Time: showtime.Start_Time || showtime.startTime,
            End_Time: showtime.End_Time || showtime.endTime,
            Movie_Name: showtime.Movie?.Movie_Name || showtime.movieName,
            Duration: showtime.Movie?.Duration || showtime.duration
        }));

        console.log('cinemaRoomService - Mapped existing showtimes:', mappedShowtimes);
        return mappedShowtimes;
    } catch (error) {
        console.error('cinemaRoomService - Error getting existing showtimes:', error);
        // Return empty array if no showtimes found or error
        return [];
    }
};

// Hàm đề xuất giờ chiếu tránh trùng lịch
const suggestAvailableTime = (
    existingShowtimes: ExistingShowtime[], 
    movieDuration: number, 
    selectedTime?: string
): { suggestedTime: string; isConflict: boolean; conflictDetails?: string } => {
    const CLEANUP_TIME = 15; // 15 phút dọn dẹp
    const OPERATING_START = '09:00';
    const OPERATING_END = '23:00';

    // Nếu chưa chọn giờ, trả về giờ mở cửa
    if (!selectedTime) {
        return {
            suggestedTime: OPERATING_START,
            isConflict: false
        };
    }

    // Chuyển đổi thời gian thành phút để dễ tính toán
    const timeToMinutes = (time: string): number => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    };

    const minutesToTime = (minutes: number): string => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    };

    const selectedTimeMinutes = timeToMinutes(selectedTime);
    const movieEndTimeMinutes = selectedTimeMinutes + movieDuration + CLEANUP_TIME;

    // Kiểm tra xung đột với lịch chiếu hiện có
    for (const showtime of existingShowtimes) {
        const existingStartMinutes = timeToMinutes(showtime.Start_Time);
        const existingEndMinutes = timeToMinutes(showtime.End_Time) + CLEANUP_TIME;

        // Kiểm tra xung đột
        const hasConflict = (
            (selectedTimeMinutes >= existingStartMinutes && selectedTimeMinutes < existingEndMinutes) ||
            (movieEndTimeMinutes > existingStartMinutes && movieEndTimeMinutes <= existingEndMinutes) ||
            (selectedTimeMinutes <= existingStartMinutes && movieEndTimeMinutes >= existingEndMinutes)
        );

        if (hasConflict) {
            // Đề xuất giờ sau khi kết thúc suất chiếu hiện có
            const suggestedTimeMinutes = existingEndMinutes;
            const suggestedEndTimeMinutes = suggestedTimeMinutes + movieDuration + CLEANUP_TIME;

            // Kiểm tra có vượt quá giờ đóng cửa không
            if (suggestedEndTimeMinutes > timeToMinutes(OPERATING_END)) {
                return {
                    suggestedTime: selectedTime,
                    isConflict: true,
                    conflictDetails: `Giờ chiếu trùng với lịch chiếu "${showtime.Movie_Name}" (${showtime.Start_Time} - ${showtime.End_Time}). Không thể tìm giờ phù hợp trong ngày.`
                };
            }

            return {
                suggestedTime: minutesToTime(suggestedTimeMinutes),
                isConflict: true,
                conflictDetails: `Giờ chiếu trùng với lịch chiếu "${showtime.Movie_Name}" (${showtime.Start_Time} - ${showtime.End_Time}). Đề xuất: ${minutesToTime(suggestedTimeMinutes)}`
            };
        }
    }

    // Không có xung đột
    return {
        suggestedTime: selectedTime,
        isConflict: false
    };
};

export const cinemaRoomService = {
    getAllCinemaRooms,
    getRoomsByCinemaId,
    getCinemaRoomById,
    createCinemaRoom,
    updateCinemaRoom,
    deleteCinemaRoom,
    getActiveRoomsByCinemaId,
    getExistingShowtimesByRoomAndDate,
    suggestAvailableTime,
};

export default cinemaRoomService; 
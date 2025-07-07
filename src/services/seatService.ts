import api from '../config/api';


export interface Seat {
    id: string;
    row: string;
    column: number;
    type: 'regular' | 'vip' | 'couple' | 'disabled';
    status: 'available' | 'reserved' | 'booked' | 'held' | 'disabled';
    price: number;
    showtimeId: string;
}


export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}


export interface HoldSeatsRequest {
    showtimeId: number;
    seatIds: number[];
}


export interface ReleaseSeatsRequest {
    showtimeId: number;
    seatIds: number[];
}


export interface SellSeatsRequest {
    showtimeId: number;
    seatIds: number[];
    bookingId?: string;
}


// Lấy danh sách tất cả ghế
export const getAllSeats = async (): Promise<Seat[]> => {
    console.log('seatService - Fetching all seats');
    const response = await api.get<ApiResponse<Seat[]>>('/seats');
    return response.data.data || [];
};


// Lấy danh sách ghế theo suất chiếu
export const getSeatsByShowtime = async (showtimeId: string): Promise<Seat[]> => {
    console.log(`seatService - Fetching seats for showtime ID: ${showtimeId}`);

    // Thêm cache-busting parameters mạnh hơn
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const response = await api.get<ApiResponse<Seat[]>>(`/seats/showtime/${showtimeId}?_t=${timestamp}&_r=${random}`, {
        headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        }
    });
    return response.data.data || [];
};


class SeatService {
    /**
     * Giữ ghế tạm thời khi user chọn
     * @param data - Thông tin ghế cần giữ
     */
    async holdSeats(data: HoldSeatsRequest): Promise<any> {
        try {
            console.log('Holding seats:', data);
            const response = await api.post('/seats/hold', data);
            return response.data;
        } catch (error) {
            console.error('Lỗi khi giữ ghế:', error);
            throw error;
        }
    }


    /**
     * Giải phóng ghế khi user bỏ chọn hoặc hủy
     * @param data - Thông tin ghế cần giải phóng
     */
    async releaseSeats(data: ReleaseSeatsRequest): Promise<any> {
        try {
            console.log('Releasing seats:', data);
            const response = await api.post('/seats/release', data);
            return response.data;
        } catch (error) {
            console.error('Lỗi khi giải phóng ghế:', error);
            throw error;
        }
    }


    /**
     * Bán ghế khi booking được confirm (Staff only)
     * @param data - Thông tin ghế cần bán
     */
    async sellSeats(data: SellSeatsRequest): Promise<any> {
        try {
            console.log('Selling seats:', data);
            const response = await api.post('/seats/sell', data);
            return response.data;
        } catch (error) {
            console.error('Lỗi khi bán ghế:', error);
            throw error;
        }
    }


    /**
     * Lấy thông tin sơ đồ ghế cho suất chiếu
     * @param showtimeId - ID suất chiếu
     */
    async getSeatMap(showtimeId: number): Promise<any> {
        try {
            console.log('Getting seat map for showtime:', showtimeId);

            // Thêm cache-busting parameters mạnh hơn
            const timestamp = Date.now();
            const random = Math.random().toString(36).substring(7);
            const response = await api.get(`/seats/showtime/${showtimeId}?_t=${timestamp}&_r=${random}`, {
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Lỗi khi lấy sơ đồ ghế:', error);
            throw error;
        }
    }


    /**
     * Kiểm tra sức khỏe hệ thống ghế
     */
    async checkHealth(): Promise<any> {
        try {
            const response = await api.get('/seats/health');
            return response.data;
        } catch (error) {
            console.error('Lỗi khi kiểm tra sức khỏe hệ thống ghế:', error);
            throw error;
        }
    }
}


export const seatService = new SeatService();



import apiClient from './apiClient';
import api from '../config/api';
import type { BookingInfo, ScanResult, ScanListItem } from '../types/ticket';

export interface MovieInfo {
    movie_id: number;
    movie_name: string;
    poster_url: string;
}

export interface ShowtimeInfo {
    showtime_id: number;
    show_date: string;
    start_time: string;
    room_name: string;
    cinema_id: number;
    cinema_name: string;
}

export interface TicketData {
    ticket_id: number;
    ticket_code: string;
    booking_id: number;
    status: string;
    is_checked_in: boolean;
    final_price: number;
    booking_date: string;
    movie_info: MovieInfo;
    showtime_info: ShowtimeInfo;
    seat_info: string;
}

export interface TicketResponse {
    success: boolean;
    total: number;
    tickets: TicketData[];
}

export interface PendingTicket {
    ticketCode: string;
    movieTitle: string;
    customerName: string;
    seatNumber: string;
    showtime: string;
    status: string;
}

export const ticketService = {
    /**
     * Fetch all tickets for the current user
     */
    getMyTickets: async (): Promise<TicketResponse | TicketData[]> => {
        try {
            const response = await apiClient.get('/ticket/my-tickets');

            // Handle different response formats
            if (response.data && typeof response.data === 'object') {
                if (Array.isArray(response.data)) {
                    // API returns array of tickets directly
                    return {
                        success: true,
                        tickets: response.data,
                        total: response.data.length
                    };
                } else if (Array.isArray(response.data.tickets)) {
                    // API returns object with tickets array
                    return response.data;
                } else if (response.data.data && Array.isArray(response.data.data)) {
                    // API returns object with data property containing tickets
                    return {
                        success: true,
                        tickets: response.data.data,
                        total: response.data.data.length
                    };
                }
            }

            // Fallback to empty array if response format is unexpected
            console.warn('Unexpected API response format:', response.data);
            return { success: false, tickets: [], total: 0 };
        } catch (error) {
            console.error('Error fetching tickets:', error);
            throw error;
        }
    },

    /**
     * Get detailed ticket information by ID
     */
    getTicketById: async (ticketId: string): Promise<any> => {
        try {
            console.log(`Fetching ticket details for ID: ${ticketId}`);
            const response = await apiClient.get(`/ticket/${ticketId}`);
            console.log('Ticket detail response:', response.data);
            
            // Backend returns the detailed ticket info from ticketService.getTicketByIdAsync()
            if (response.data && response.data.success) {
                return response.data;
            }
            
            // Fallback if response structure is different
            return response.data;
        } catch (error: any) {
            console.error('Error fetching ticket details:', error);
            throw new Error(error.response?.data?.message || 'Không thể lấy thông tin chi tiết vé');
        }
    },

    // POST /ticket/scan/{ticketcode} - Quét vé để check in
    scanTicket: async (ticketCode: string): Promise<ScanResult> => {
        try {
            const response = await api.post(`/ticket/scan/${ticketCode}`);
            return {
                success: true,
                message: 'Quét vé thành công',
                ticket: response.data.ticket,
                alreadyScanned: false
            };
        } catch (error: any) {
            console.error('Error scanning ticket:', error);

            if (error.response?.status === 409) {
                return {
                    success: false,
                    message: 'Vé đã được quét trước đó',
                    alreadyScanned: true
                };
            }

            return {
                success: false,
                message: error.response?.data?.message || 'Vé không hợp lệ hoặc đã hết hạn',
                alreadyScanned: false
            };
        }
    },

    // GET /ticket/booking/{bookingId} - Lấy thông tin vé theo booking
    getBookingInfo: async (bookingId: string): Promise<BookingInfo> => {
        try {
            const response = await api.get(`/ticket/booking/${bookingId}`);
            return response.data;
        } catch (error: any) {
            console.error('Error fetching booking info:', error);
            throw new Error(error.response?.data?.message || 'Không thể lấy thông tin đặt vé');
        }
    },

    // GET /ticket/code/{ticketcode} - Lấy thông tin vé theo mã vé
    getTicketInfo: async (ticketCode: string): Promise<import('../types/ticket').Ticket> => {
        try {
            const response = await api.get(`/ticket/code/${ticketCode}`);
            return response.data;
        } catch (error: any) {
            console.error('Error fetching ticket info:', error);
            throw new Error(error.response?.data?.message || 'Không thể lấy thông tin vé');
        }
    },

    // GET /ticket/scan-list - Lấy danh sách vé đã quét trong ngày
    getScanList: async (): Promise<ScanListItem[]> => {
        try {
            const response = await api.get('/ticket/scan-list');
            const data = response.data;
            
            // API trả về object với property tickets
            if (data && Array.isArray(data.tickets)) {
                const mappedTickets = data.tickets.map((ticket: any) => {
                    // Lấy giờ chiếu đúng từ showtime_info
                    const movieStartTime = ticket.showtime_info?.start_time || null;
                    
                    return {
                    ticketCode: ticket.ticket_code,
                    movieTitle: ticket.movie_info?.movie_name || 'Không có tên phim',
                    customerName: `${ticket.room_info?.cinema_name || 'Galaxy Cinema'} - ${ticket.room_info?.room_name || 'Phòng'}`,
                    seatNumber: ticket.seat_info?.seat_label || 'N/A',
                        scanTime: ticket.check_in_time || new Date().toISOString(), // Thời điểm quét
                        showtime: movieStartTime, // Giờ chiếu phim
                    status: ticket.is_checked_in ? 'SCANNED' : 'PENDING',
                    // Thêm raw data để có thể filter đúng
                    rawData: ticket
                    };
                });
                return mappedTickets;
            }
            
            return [];
        } catch (error: any) {
            console.error('Lỗi khi tải danh sách vé đã quét:', error);
            throw new Error(error.response?.data?.message || 'Không thể tải danh sách vé đã quét');
        }
    },

    // [DEPRECATED] Không sử dụng nữa - dùng getScanList() và filter thay thế
    getPendingTickets: async (): Promise<PendingTicket[]> => {
        try {
            console.log('Tải danh sách vé cần quét hôm nay');
            // Mẫu dữ liệu - có thể được thay thế bằng API thực tế
            const response = await new Promise<PendingTicket[]>((resolve) => {
                setTimeout(() => {
                    resolve([
                        {
                            ticketCode: 'TK-24680',
                            movieTitle: 'Wicked: Part One',
                            customerName: 'Lê Thị C',
                            seatNumber: 'E8',
                            showtime: new Date().toISOString(),
                            status: 'PENDING'
                        },
                        {
                            ticketCode: 'TK-13579',
                            movieTitle: 'Gladiator II',
                            customerName: 'Phạm Văn D',
                            seatNumber: 'F10',
                            showtime: new Date(new Date().getTime() + 3600000).toISOString(), // 1 giờ sau
                            status: 'PENDING'
                        },
                        {
                            ticketCode: 'TK-97531',
                            movieTitle: 'Inside Out 2',
                            customerName: 'Hoàng Văn E',
                            seatNumber: 'D5',
                            showtime: new Date(new Date().getTime() + 7200000).toISOString(), // 2 giờ sau
                            status: 'PENDING'
                        }
                    ]);
                }, 500);
            });
            return response;
        } catch (error) {
            console.error('Lỗi khi tải danh sách vé cần quét:', error);
            throw error;
        }
    }
}; 
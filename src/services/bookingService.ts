import api from '../config/api';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import type { BookingResponse } from '../types/booking';

// Interface cho request tạo booking
export interface CreateBookingRequest {
    Showtime_ID: number;
    layoutSeatIds: number[];
    userId?: string | null;
}

export interface ApplyPromotionRequest {
    bookingId: string;
    promoCode: string;
}

export interface ApplyPointsRequest {
    bookingId: string;
    points: number;
}

class BookingService {
    private isCreatingBooking = false;

    /**
     * Tạo booking mới - Tối ưu hóa hiệu xuất
     * @param bookingData - Thông tin đặt vé
     * @returns Thông tin booking đã tạo
     */
    async createBooking(bookingData: CreateBookingRequest): Promise<BookingResponse> {
        // Kiểm tra duplicate call
        if (this.isCreatingBooking) {
            throw new Error('Đang xử lý đặt vé. Vui lòng đợi...');
        }

        try {
            this.isCreatingBooking = true;

            // Gọi API với timeout ngắn hơn (8s thay vì 15s)
            const response = await Promise.race([
                api.post('bookings', bookingData),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Timeout - Vui lòng thử lại')), 8000)
                )
            ]) as any;

            return response.data;
        } catch (error: any) {
            // Xử lý lỗi đơn giản hơn
            if (error.response?.data) {
                const errorData = error.response.data;
                const errorMessage = errorData.message || 'Lỗi không xác định';

                if (errorMessage.includes('đơn đặt vé chưa thanh toán') ||
                    errorMessage.includes('Bạn đang có một đơn đặt vé')) {

                    const movieMatch = errorMessage.match(/phim "([^"]+)"/);
                    const timeMatch = errorMessage.match(/còn (\d+) phút/);

                    throw {
                        message: errorMessage,
                        bookingId: errorData.bookingId || null,
                        movieTitle: movieMatch ? movieMatch[1] : 'Không xác định',
                        expiryTime: timeMatch ? parseInt(timeMatch[1]) : 0
                    };
                }

                throw new Error(errorMessage);
            }

            throw error;
        } finally {
            this.isCreatingBooking = false;
        }
    }

    /**
     * Áp dụng mã khuyến mãi cho booking
     * @param data - Thông tin mã khuyến mãi và booking ID
     * @returns Thông tin booking sau khi áp dụng khuyến mãi
     */
    async applyPromotion(data: ApplyPromotionRequest): Promise<BookingResponse> {
        try {
            const response = await api.post('bookings/apply-promo', { bookingId: data.bookingId, promoCode: data.promoCode });
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Áp dụng điểm thành viên để giảm giá booking
     * @param data - Số điểm sử dụng và booking ID
     * @returns Thông tin booking sau khi áp dụng điểm
     */
    async applyLoyaltyPoints(data: ApplyPointsRequest): Promise<BookingResponse> {
        try {
            const bookingId = String(data.bookingId);
            const response = await api.post(`/points/booking/${bookingId}/apply-discount`, {
                points: data.points
            });

            const responseData = response?.data;
            let discount = 0;

            if (responseData?.points_used) {
                discount = responseData.points_used * 1000;
            } else if (responseData?.original_total_amount && responseData?.discounted_total_amount) {
                discount = responseData.original_total_amount - responseData.discounted_total_amount;
            } else {
                discount = data.points * 1000;
            }

            return {
                id: bookingId,
                showtimeId: responseData?.show_date || '',
                userId: responseData?.user_id?.toString() || '',
                status: responseData?.status || 'pending',
                totalPrice: responseData?.discounted_total_amount || 0,
                seats: [],
                discount: discount,
                createdAt: responseData?.booking_date || new Date().toISOString()
            };
        } catch (error: any) {
            // Fallback response
            const mockDiscount = data.points * 1000;
            return {
                id: String(data.bookingId),
                showtimeId: '',
                userId: '',
                status: 'pending',
                totalPrice: 0,
                seats: [],
                discount: mockDiscount,
                createdAt: new Date().toISOString()
            };
        }
    }

    /**
     * Lấy thông tin chi tiết về booking
     * @param bookingId - ID của booking cần lấy thông tin
     * @returns Thông tin chi tiết về booking
     */
    async getBookingDetails(bookingId: string | number): Promise<BookingResponse> {
        try {
            const response = await api.get(`/bookings/${bookingId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Hủy booking dựa vào ID
     * @param bookingId - ID của booking cần hủy
     * @returns Kết quả hủy booking
     */
    async cancelBooking(bookingId: string | number): Promise<any> {
        if (!bookingId || bookingId === 'undefined') {
            throw new Error('Booking ID không hợp lệ');
        }

        try {
            const response = await api.put(`bookings/${bookingId}/cancel`, {
                reason: 'user_cancelled'
            });
            return response?.data;
        } catch (error) {
            // Thử với fetch API
            try {
                const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
                // Lấy token từ api config thay vì localStorage
                const token = api.defaults.headers.common.Authorization?.toString().replace('Bearer ', '') || '';

                const response = await fetch(`${baseURL}/api/bookings/${bookingId}/cancel`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ reason: 'user_cancelled' })
                });

                if (response.ok) {
                    const data = await response.json().catch(() => ({}));
                    return { success: true, message: 'Đã hủy đơn đặt vé thành công', data };
                }
            } catch (fetchError) {
                console.error('Lỗi khi hủy booking:', fetchError);
            }

            return { success: false, message: 'Không thể hủy booking' };
        }
    }
}

export const bookingService = new BookingService();

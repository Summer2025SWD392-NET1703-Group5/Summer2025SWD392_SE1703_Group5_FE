import api from '../config/api';
import type { User } from '../types/auth';
import type { UpdateProfileData, ChangePasswordData } from '../types/user';
import type { Booking } from '../types/booking';

class UserService {
    /**
     * Lấy thông tin profile của người dùng hiện tại.
     */
    async getUserProfile(): Promise<User> {
        const response = await api.get('/auth/profile');
        
        // Backend trả về { success: true, user: {...} }
        const userData = response.data.user || response.data;
        
        // Map Role -> role để tương thích với frontend
        const mappedUser = {
            ...userData,
            id: userData.User_ID || userData.id,
            role: userData.Role || userData.role,
            fullName: userData.Full_Name || userData.fullName,
            email: userData.Email || userData.email,
            phone: userData.Phone || userData.phone,
            dateOfBirth: userData.Date_Of_Birth || userData.dateOfBirth,
            gender: userData.Gender || userData.gender,
            cinemaId: userData.Cinema_ID || userData.cinemaId,
            loyaltyPoints: userData.Loyalty_Points || userData.loyaltyPoints,
            avatar: userData.Avatar || userData.avatar,
            createdAt: userData.Created_At || userData.createdAt,
            status: userData.Status || userData.status
        };
        
        console.log(`[userService] Profile loaded: ${mappedUser.role} user`);
        return mappedUser;
    }

    /**
     * Cập nhật thông tin profile người dùng.
     */
    async updateProfile(profileData: UpdateProfileData): Promise<User> {
        const { data } = await api.put<{ user: User }>('/auth/profile', profileData);
        return data.user;
    }

    /**
     * Đổi mật khẩu người dùng.
     */
    async changePassword(data: ChangePasswordData): Promise<void> {
        await api.put('/auth/password', data);
    }

    /**
     * Tải lên avatar của người dùng.
     */
    async uploadAvatar(file: File, onUploadProgress: (progressEvent: any) => void): Promise<{ avatarUrl: string }> {
        const formData = new FormData();
        formData.append('avatar', file);

        const { data } = await api.post('/users/avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress,
        });
        return data;
    }

    /**
     * Lấy lịch sử đặt vé của người dùng.
     */
    async getBookingHistory(): Promise<Booking[]> {
        try {
            const response = await api.get('/bookings/my-bookings');
            const data = response.data;

            // Handle different response structures
            if (Array.isArray(data)) {
                return data;
            } else if (data && Array.isArray(data.data)) {
                return data.data;
            } else if (data && Array.isArray(data.bookings)) {
                return data.bookings;
            } else {
                console.warn('API returned unexpected data structure:', data);
                return [];
            }
        } catch (error: any) {
            console.error('Error fetching booking history:', error);
            // Return empty array instead of throwing error
            return [];
        }
    }

    /**
     * Hủy một vé đã đặt.
     */
    async cancelBooking(bookingId: number): Promise<void> {
        try {
            await api.put(`/bookings/${bookingId}/cancel`);
        } catch (error: any) {
            console.error('Error cancelling booking:', error);
            throw new Error(error.response?.data?.message || 'Không thể hủy đặt vé. Vui lòng thử lại.');
        }
    }

    /**
     * Lấy điểm tích lũy của người dùng.
     */
    async getUserPoints(): Promise<{ user_id: number, total_points: number }> {
        try {
            const { data } = await api.get('/points/my-points');
            return data;
        } catch (error) {
            console.error('Error getting user points:', error);
            throw error;
        }
    }
}

export const userService = new UserService();

import api from '../config/api';
import type { NotificationListResponse, UnreadCountResponse } from '../types/notification';

/**
 * Service for handling notification-related API requests.
 */
export const notificationService = {
    /**
     * Fetches all notifications for the current user.
     * @returns A promise that resolves to the notification list response.
     */
    getNotifications: async (): Promise<NotificationListResponse> => {
        const response = await api.get<NotificationListResponse>('/notifications');
        return response.data;
    },

    /**
     * Fetches the number of unread notifications for the current user.
     * @returns A promise that resolves to the unread count response.
     */
    getUnreadCount: async (): Promise<UnreadCountResponse> => {
        const response = await api.get<UnreadCountResponse>('/notifications/unread-count');
        return response.data;
    },

    /**
     * Marks a specific notification as read.
     * @param notificationId - The ID of the notification to mark as read.
     * @returns A promise that resolves when the operation is complete.
     */
    markAsRead: async (notificationId: number): Promise<void> => {
        await api.put(`/notifications/${notificationId}/read`);
    },

    /**
     * Marks all unread notifications as read for the current user.
     * @returns A promise that resolves when the operation is complete.
     */
    markAllAsRead: async (): Promise<{ updatedCount: number }> => {
        const response = await api.put<{ updatedCount: number }>('/notifications/mark-all-read');
        return response.data;
    },
}; 
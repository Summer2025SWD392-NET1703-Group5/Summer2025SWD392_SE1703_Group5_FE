import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { notificationService } from '../services/notificationService';
import type { Notification } from '../types/notification';
import { useAuth } from './SimpleAuthContext';

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;
    error: string | null;
    fetchNotifications: () => Promise<void>;
    fetchUnreadCount: () => Promise<void>;
    markAsRead: (notificationId: number) => Promise<void>;
    markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = (): NotificationContextType => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

interface NotificationProviderProps {
    children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchNotifications = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const response = await notificationService.getNotifications();
            if (response.Success) {
                setNotifications(response.Notifications);
                setUnreadCount(response.UnreadCount);
            }
            setError(null);
        } catch (err) {
            setError('Failed to fetch notifications.');
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    const fetchUnreadCount = useCallback(async () => {
        if (!user) return;
        try {
            const response = await notificationService.getUnreadCount();
            if (response.success) {
                setUnreadCount(response.unreadCount);
            }
        } catch (err) {
            // Don't set a visible error, fail silently
            console.error('Failed to fetch unread count.');
        }
    }, [user]);

    const markAsRead = async (notificationId: number) => {
        try {
            await notificationService.markAsRead(notificationId);
            
            // Cập nhật notifications và check trong callback để có data mới nhất
            setNotifications(prev => {
                const updatedNotifications = prev.map(n => 
                    n.Notification_ID === notificationId ? { ...n, Is_Read: true } : n
                );
                
                // Kiểm tra với array đã cập nhật
                const remainingUnread = updatedNotifications.filter(n => !n.Is_Read).length;
                setUnreadCount(remainingUnread);
                
                // Dispatch event để cập nhật toàn bộ app
                const event = new CustomEvent('notifications-update', { 
                    detail: { unreadCount: remainingUnread } 
                });
                window.dispatchEvent(event);
                
                return updatedNotifications;
            });
            
        } catch (err) {
            console.error('Failed to mark notification as read.');
            // Optionally re-throw or handle error
        }
    };

    const markAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, Is_Read: true })));
            // Khi đánh dấu tất cả là đã đọc, đặt unreadCount = 0
            setUnreadCount(0);
            
            // Đảm bảo số trên biểu tượng thông báo được cập nhật ngay lập tức
            const event = new CustomEvent('notifications-update', { detail: { unreadCount: 0 } });
            window.dispatchEvent(event);
        } catch (err) {
            console.error('Failed to mark all notifications as read.');
            // Optionally re-throw or handle error
        }
    };

    useEffect(() => {
        if (user) {
            fetchNotifications();
            // Poll for unread count periodically
            const intervalId = setInterval(fetchUnreadCount, 60000); // every 60 seconds
            return () => clearInterval(intervalId);
        } else {
            setNotifications([]);
            setUnreadCount(0);
        }
    }, [user, fetchNotifications, fetchUnreadCount]);

    // Thêm custom event để lắng nghe các thay đổi từ các component khác
    useEffect(() => {
        const handleNotificationsUpdate = () => {
            fetchNotifications();
        };
        
        window.addEventListener('notifications-update', handleNotificationsUpdate);
        
        return () => {
            window.removeEventListener('notifications-update', handleNotificationsUpdate);
        };
    }, [fetchNotifications]);

    const value = {
        notifications,
        unreadCount,
        isLoading,
        error,
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
        markAllAsRead,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
}; 
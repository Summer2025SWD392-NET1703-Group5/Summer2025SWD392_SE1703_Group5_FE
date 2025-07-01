/**
 * Represents a single notification item.
 */
export interface Notification {
    Notification_ID: number;
    Title: string;
    Content: string;
    Creation_Date: string; // ISO 8601 date string
    Is_Read: boolean;
    Read_Date: string | null; // ISO 8601 date string or null
    Type: 'success' | 'info' | 'warning' | 'error' | 'question' | string;
    Related_ID: number | null;
}

/**
 * Represents the response from the GET /api/notifications endpoint.
 */
export interface NotificationListResponse {
    Success: boolean;
    TotalCount: number;
    UnreadCount: number;
    Notifications: Notification[];
}

/**
 * Represents the response from the GET /api/notifications/unread-count endpoint.
 */
export interface UnreadCountResponse {
    success: boolean;
    unreadCount: number;
} 
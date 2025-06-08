import React, { useState, useEffect } from "react";
import {
  Bell,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Info,
  XCircle,
  Clock,
  Link,
} from "lucide-react";
import api from "../../../config/axios";
import { toast } from "react-toastify";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./Notification.css";

interface NotificationItem {
  Notification_ID: number;
  Title: string;
  Content: string;
  Creation_Date: string;
  Is_Read: boolean;
  Read_Date: string | null;
  Type: string; // 'success', 'info', 'warning', 'error'
  Related_ID: number | null;
}

interface ApiResponse {
  Success: boolean;
  TotalCount: number;
  UnreadCount: number;
  Notifications: NotificationItem[];
  Message?: string;
}

interface NotificationProps {
  updateNotificationCount: (unreadCount: number) => void;
}

const Notification: React.FC<NotificationProps> = ({
  updateNotificationCount,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 4; 

  // Tính toán phân trang
  const totalPages = Math.ceil(notifications.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentNotifications = notifications.slice(startIndex, endIndex);

  // Hàm chuyển trang
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Lấy danh sách thông báo
  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get("/notifications");
        const data: ApiResponse = response.data;

        if (data.Success) {
          const sortedNotifications = data.Notifications.sort(
            (a, b) =>
              new Date(b.Creation_Date).getTime() -
              new Date(a.Creation_Date).getTime()
          );
          setNotifications(sortedNotifications);
          setUnreadCount(data.UnreadCount);
          setTotalCount(data.TotalCount);
          updateNotificationCount(data.UnreadCount);
        } else {
          throw new Error(data.Message || "Failed to fetch notifications.");
        }
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || "Không thể tải thông báo.";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [updateNotificationCount]);

  // Định dạng ngày giờ
  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    try {
      const date = parseISO(dateString);
      return format(date, "dd/MM/yyyy HH:mm", { locale: vi });
    } catch (error) {
      console.error("Error formatting datetime:", error);
      return "N/A";
    }
  };

  // Đánh dấu một thông báo đã đọc
  const markNotificationAsRead = async (notificationId: number) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((noti) =>
          noti.Notification_ID === notificationId
            ? { ...noti, Is_Read: true, Read_Date: new Date().toISOString() }
            : noti
        )
      );
      setUnreadCount((prev) => {
        const newCount = prev - 1;
        updateNotificationCount(newCount);
        return newCount;
      });
      toast.success("Đã đánh dấu thông báo là đã đọc.");
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Không thể đánh dấu thông báo.";
      toast.error(errorMessage);
    }
  };

  // Đánh dấu tất cả thông báo đã đọc
  const markAllNotificationsAsRead = async () => {
    setIsMarkingAllRead(true);
    try {
      await api.put("/notifications/mark-all-read");
      setNotifications((prev) =>
        prev.map((noti) => ({
          ...noti,
          Is_Read: true,
          Read_Date: new Date().toISOString(),
        }))
      );
      setUnreadCount(0);
      updateNotificationCount(0);
      toast.success("Đã đánh dấu tất cả thông báo là đã đọc.");
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Không thể đánh dấu tất cả thông báo.";
      toast.error(errorMessage);
    } finally {
      setIsMarkingAllRead(false);
    }
  };

  // Tùy chỉnh trạng thái thông báo
  const getStatusInfo = (isRead: boolean, type: string) => {
    const baseClass = isRead ? "status-read" : "status-unread";
    let Icon: React.ElementType;
    let textColor: string;

    switch (type.toLowerCase()) {
      case "success":
        Icon = CheckCircle;
        textColor = isRead ? "#34d399" : "#22c55e";
        break;
      case "info":
        Icon = Info;
        textColor = isRead ? "#3b82f6" : "#2563eb";
        break;
      case "warning":
        Icon = AlertTriangle;
        textColor = isRead ? "#facc15" : "#eab308";
        break;
      case "error":
        Icon = XCircle;
        textColor = isRead ? "#f87171" : "#ef4444";
        break;
      default:
        Icon = Bell;
        textColor = isRead ? "#9ca3af" : "#6b7280";
    }

    return {
      text: isRead ? "Đã đọc" : "Chưa đọc",
      className: `${baseClass} status-${type.toLowerCase()}`,
      Icon,
      textColor,
    };
  };

  // Rendering
  return (
    <div className="profile-box notification-section">
      <h2 className="profile-info-title">Thông báo</h2>
      <p className="profile-info-subtitle">Xem các thông báo mới nhất</p>
      <div className="notification-content-wrapper">
        <div className="notification-header">
          <p className="notification-stats">
            Tổng cộng: {totalCount} |{" "}
            <span className="unread-count">Chưa đọc: {unreadCount}</span>
          </p>
          {notifications.some((n) => !n.Is_Read) && (
            <button
              onClick={markAllNotificationsAsRead}
              disabled={isMarkingAllRead}
              className={`mark-all-button ${
                isMarkingAllRead ? "disabled" : ""
              }`}
            >
              {isMarkingAllRead ? "Đang xử lý..." : "Đánh dấu tất cả đã đọc"}
            </button>
          )}
        </div>

        {loading && (
          <div className="loading-container">
            <Loader2 className="animate-spin" size={60} color="#f5c518" />
            <p>Đang tải thông báo...</p>
          </div>
        )}

        {error && <div className="error-message">Lỗi: {error}</div>}

        {!loading && !error && notifications.length === 0 && (
          <div className="empty-message">
            <Bell size={48} className="empty-icon" />
            Bạn chưa có thông báo nào.
          </div>
        )}

        {!loading && !error && notifications.length > 0 && (
          <>
            <div className="notification-list">
              {currentNotifications.map((notification) => {
                const statusInfo = getStatusInfo(
                  notification.Is_Read,
                  notification.Type
                );

                return (
                  <div
                    key={notification.Notification_ID}
                    className="notification-card"
                    onClick={() =>
                      !notification.Is_Read &&
                      markNotificationAsRead(notification.Notification_ID)
                    }
                  >
                    {/* Card Header */}
                    <div className="card-header">
                      <div className="notification-info">
                        <statusInfo.Icon
                          size={16}
                          className="header-icon notification-icon"
                          style={{ color: statusInfo.textColor }}
                        />
                        <h3
                          className="notification-title"
                          title={notification.Title}
                        >
                          {notification.Title}
                        </h3>
                      </div>
                      <div className={`status-badge ${statusInfo.className}`}>
                        <statusInfo.Icon
                          size={12}
                          className="status-icon"
                          style={{ color: statusInfo.textColor }}
                        />
                        <span>{statusInfo.text}</span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="card-body">
                      <div className="info-group">
                        <div className="info-item">
                          <Bell size={14} className="info-icon" />
                          <span className="notification-content">
                            {notification.Content}
                          </span>
                        </div>
                        <div className="info-item">
                          <Clock size={14} className="info-icon" />
                          <span>
                            Thời gian:{" "}
                            {formatDateTime(notification.Creation_Date)}
                          </span>
                        </div>
                        {notification.Related_ID && (
                          <div className="info-item">
                            <Link size={14} className="info-icon" />
                            <span>Mã đơn vé: {notification.Related_ID}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="pagination-controls">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="page-button prev-button"
                  aria-label="Trang trước"
                >
                  <ChevronLeft size={18} />
                  <span>Trước</span>
                </button>
                <span className="page-indicator" aria-live="polite">
                  Trang {currentPage} / {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="page-button next-button"
                  aria-label="Trang tiếp theo"
                >
                  <span>Tiếp</span>
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Notification;

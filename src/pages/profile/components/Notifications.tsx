import React, { useState, useEffect, useRef } from 'react';
import { useNotification } from '../../../contexts/NotificationContext';
import { BellIcon, CheckCircleIcon, ChevronLeftIcon, ChevronRightIcon, InformationCircleIcon, ExclamationTriangleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import api from '../../../config/api';
import { toast } from 'react-hot-toast';

const ITEMS_PER_PAGE = 8;

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'success':
      return <CheckCircleIcon className="h-5 w-5 text-green-400 drop-shadow-lg" />;
    case 'info':
      return <InformationCircleIcon className="h-5 w-5 text-blue-400 drop-shadow-lg" />;
    case 'warning':
      return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 drop-shadow-lg" />;
    case 'error':
      return <XCircleIcon className="h-5 w-5 text-red-400 drop-shadow-lg" />;
    default:
      return <BellIcon className="h-5 w-5 text-gray-400 drop-shadow-lg" />;
  }
};

const Notifications: React.FC = () => {
  const { notifications, isLoading, error, markAsRead, markAllAsRead, unreadCount, fetchNotifications } = useNotification();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [animatingItems, setAnimatingItems] = useState<number[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Hàm đánh dấu đã đọc với animation
  const handleMarkAsRead = async (notificationId: number) => {
    try {
      // Thêm animation cho item
      setAnimatingItems(prev => [...prev, notificationId]);
      
      // Gọi API trực tiếp để đảm bảo server cập nhật
      await api.put(`/notifications/${notificationId}/read`);
      
      // Sau đó cập nhật local state
      markAsRead(notificationId);
      
      // Kích hoạt sự kiện để cập nhật số thông báo ở Header
      const event = new CustomEvent('notifications-update', { 
        detail: { unreadCount: unreadCount > 0 ? unreadCount - 1 : 0 } 
      });
      window.dispatchEvent(event);
      
      // Loại bỏ animation sau 500ms
      setTimeout(() => {
        setAnimatingItems(prev => prev.filter(id => id !== notificationId));
      }, 500);
      
      // Kiểm tra nếu đây là thông báo không đọc cuối cùng, reload trang
      const remainingUnread = notifications.filter(n => !n.Is_Read && n.Notification_ID !== notificationId).length;
      if (remainingUnread === 0) {
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      console.error(`Lỗi khi đánh dấu đã đọc thông báo ${notificationId}:`, error);
      toast.error('Không thể đánh dấu thông báo là đã đọc');
    }
  };
  
  // Hàm đánh dấu tất cả đã đọc với animation
  const handleMarkAllAsRead = async () => {
    try {
      // Gọi API trực tiếp để đảm bảo server cập nhật
      await api.put('/notifications/mark-all-read');
      
      // Sau đó cập nhật local state
      markAllAsRead();
      
      // Kích hoạt sự kiện để cập nhật số thông báo ở Header
      const event = new CustomEvent('notifications-update', { detail: { unreadCount: 0 } });
      window.dispatchEvent(event);
      
      // Thông báo thành công
      toast.success('Đã đánh dấu tất cả thông báo là đã đọc', {
        icon: '✅',
        style: {
          borderRadius: '10px',
          background: '#1e293b',
          color: '#fff',
          border: '1px solid #FFD875'
        }
      });
      
      // Tải lại trang để đảm bảo UI được cập nhật
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (error) {
      console.error('Lỗi khi đánh dấu đã đọc tất cả:', error);
      toast.error('Không thể đánh dấu tất cả thông báo là đã đọc');
    }
  };

  useEffect(() => {
    setTotalPages(Math.ceil(notifications.length / ITEMS_PER_PAGE));
  }, [notifications]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Get current items
  const paginatedNotifications = notifications.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Render pagination
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex justify-center mt-6 space-x-2">
        <button
          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`p-2 rounded-lg transition-all duration-300 ${currentPage === 1
            ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
            : 'bg-slate-700/70 text-white hover:bg-slate-600 hover:scale-105'}`}
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </button>

        {Array.from({ length: totalPages }).map((_, index) => {
          const pageNumber = index + 1;
          const isCurrentPage = pageNumber === currentPage;

          if (
            pageNumber === 1 ||
            pageNumber === totalPages ||
            (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
          ) {
            return (
              <button
                key={pageNumber}
                onClick={() => handlePageChange(pageNumber)}
                className={`w-8 h-8 rounded-lg transition-all duration-300 text-sm font-medium ${isCurrentPage
                  ? 'bg-gradient-to-r from-[#FFD875] to-[#FFD875]/80 text-slate-900 shadow-[0_0_15px_rgba(255,216,117,0.4)] scale-105'
                  : 'bg-slate-700/70 text-white hover:bg-slate-600 hover:scale-105 hover:text-[#FFD875]'
                  }`}
              >
                {pageNumber}
              </button>
            );
          }

          if (
            (pageNumber === 2 && currentPage > 3) ||
            (pageNumber === totalPages - 1 && currentPage < totalPages - 2)
          ) {
            return <span key={pageNumber} className="flex items-center justify-center w-8 h-8 text-gray-400 text-sm">...</span>;
          }

          return null;
        })}

        <button
          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={`p-2 rounded-lg transition-all duration-300 ${currentPage === totalPages
            ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
            : 'bg-slate-700/70 text-white hover:bg-slate-600 hover:scale-105'}`}
        >
          <ChevronRightIcon className="w-4 h-4" />
        </button>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFD875] mx-auto mb-3"></div>
          <p className="text-gray-400 text-sm">Đang tải thông báo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-400 bg-red-500/10 p-4 rounded-lg border border-red-500/20">
        <XCircleIcon className="w-12 h-12 mx-auto mb-3" />
        <h3 className="text-lg font-semibold mb-2">Có lỗi xảy ra</h3>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="animate-fadeInUp space-y-6" ref={containerRef}>
      {/* Header Section */}
      <div className="relative bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-xl rounded-xl p-4 border border-slate-600/50">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFD875]/5 via-transparent to-[#FFD875]/10 rounded-xl"></div>
        <div className="relative z-10 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#FFD875]/10 rounded-lg border border-[#FFD875]/20">
              <BellIcon className="w-6 h-6 text-[#FFD875]" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Tất cả thông báo</h2>
              <p className="text-gray-400 text-sm">Quản lý và theo dõi thông báo của bạn</p>
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={() => handleMarkAllAsRead()}
              className="px-4 py-2 bg-gradient-to-r from-[#FFD875] to-[#FFD875]/80 text-slate-900 font-medium rounded-lg hover:scale-105 transition-all duration-300 shadow-[0_0_15px_rgba(255,216,117,0.3)] text-sm"
            >
              Đánh dấu tất cả là đã đọc ({unreadCount})
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="text-center glass-dark-card p-8 rounded-xl border border-gray-600/30">
          <div className="animate-bounce mb-4">
            <BellIcon className="w-16 h-16 mx-auto text-gray-600 opacity-50" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Chưa có thông báo</h3>
          <p className="text-gray-400 mb-4">Bạn hiện không có thông báo nào.</p>
          <Link
            to="/movies"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#FFD875] to-[#FFD875]/80 text-slate-900 font-medium rounded-lg hover:scale-105 transition-all duration-300 text-sm"
          >
            <span>Khám phá phim mới</span>
          </Link>
        </div>
      ) : (
        <div className="glass-dark-card p-4 border border-gray-600/30 rounded-xl backdrop-blur-xl">
          <div className="space-y-3">
            {paginatedNotifications.map((notification, index) => (
              <div
                key={notification.Notification_ID}
                onClick={() => handleMarkAsRead(notification.Notification_ID)}
                className={`group cursor-pointer transition-all duration-300 transform hover:scale-[1.01] ${
                  animatingItems.includes(notification.Notification_ID) ? 'animate-pulse scale-95' : ''
                } ${notification.Is_Read 
                  ? 'hover:bg-slate-700/20' 
                  : 'bg-gradient-to-r from-[#FFD875]/5 to-transparent border-l-3 border-l-[#FFD875]'
                }`}
                style={{ 
                  animationDelay: `${index * 50}ms`,
                  animation: `fadeInUp 0.4s ease-out ${index * 50}ms both`
                }}
              >
                <div className="p-3 rounded-lg border border-gray-700/30 group-hover:border-[#FFD875]/30 transition-all duration-300">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5 p-1.5 bg-slate-700/30 rounded-lg group-hover:bg-slate-600/30 transition-colors duration-300">
                      {getNotificationIcon(notification.Type)}
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-grow">
                          <h4 className="font-medium text-white group-hover:text-[#FFD875] transition-colors duration-300 text-sm">
                            {notification.Title}
                          </h4>
                          <p className="text-gray-300 mt-1 leading-relaxed text-sm">
                            {notification.Content}
                          </p>
                        </div>
                        {!notification.Is_Read && (
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className="inline-block w-2 h-2 bg-[#FFD875] rounded-full animate-pulse"></span>
                            <span className="text-xs text-[#FFD875] font-medium bg-[#FFD875]/10 px-2 py-0.5 rounded-full">
                              Mới
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-xs text-gray-500 bg-slate-700/20 px-2 py-1 rounded-full">
                          {new Date(notification.Creation_Date).toLocaleString('vi-VN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                        {!notification.Is_Read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notification.Notification_ID);
                            }}
                            className="text-xs font-medium text-[#FFD875] hover:text-[#FFD875]/80 transition-colors duration-300 px-2 py-1 rounded-lg hover:bg-[#FFD875]/10"
                          >
                            Đánh dấu đã đọc
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      {renderPagination()}


    </div>
  );
};

export default Notifications; 
// src/components/admin/modals/ShowtimesModal.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  XMarkIcon,
  CalendarIcon,
  ClockIcon,
  FilmIcon,
  CogIcon,
  PlusIcon,
  PencilIcon,
  EyeIcon,
  BuildingOfficeIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import showtimeService from '../../../services/showtimeService';
import type { Showtime } from '../../../types/showtime';

interface ShowtimesModalProps {
  isOpen: boolean;
  onClose: () => void;
  cinemaId: number;
  cinemaName: string;
}

const ShowtimesModal: React.FC<ShowtimesModalProps> = ({
  isOpen,
  onClose,
  cinemaId,
  cinemaName,
}) => {
  const [loading, setLoading] = useState(true);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchShowtimes();
    }
  }, [isOpen, cinemaId]);

  const fetchShowtimes = async () => {
    try {
      setLoading(true);
      // Get showtimes for the cinema
      const response = await showtimeService.getShowtimesByCinema(cinemaId.toString());
      setShowtimes(response.filter((showtime): showtime is Showtime => showtime !== null));
    } catch (error) {
      console.error('Error fetching showtimes:', error);
      toast.error('Không thể tải danh sách lịch chiếu');
      setShowtimes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteShowtime = async (showtimeId: number, movieTitle: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa suất chiếu phim "${movieTitle}"?`)) {
      const toastId = toast.loading(`Đang xóa suất chiếu...`);
      try {
        await showtimeService.deleteShowtime(showtimeId.toString());
        toast.success(`Đã xóa suất chiếu thành công`, { id: toastId });
        // Refresh the showtime list
        await fetchShowtimes();
      } catch (error) {
        toast.error('Không thể xóa suất chiếu.', { id: toastId });
        console.error('Error deleting showtime:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      hidden: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      completed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      cancelled: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      'scheduled': 'Đã lên lịch',
      'hidden': 'Đã ẩn',
      'completed': 'Đã lên lịch',
      'cancelled': 'Đã ẩn',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const formatTime = (time: Date | string | null) => {
    if (!time) return 'N/A';
    try {
      // If it's already a Date object
      if (time instanceof Date) {
        return time.toLocaleTimeString('vi-VN', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      }
      
      // If it's a string, check different formats
      if (typeof time === 'string') {
        // If it's a time string like "14:30" or "14:30:00"
        if (time.match(/^\d{1,2}:\d{2}(:\d{2})?$/)) {
          return time.substring(0, 5); // Return just HH:MM part
        }
        
        // If it's an ISO string or full date string
        if (time.includes('T') || time.includes('-')) {
          const date = new Date(time);
          if (!isNaN(date.getTime())) {
            return date.toLocaleTimeString('vi-VN', { 
              hour: '2-digit', 
              minute: '2-digit' 
            });
          }
        }
        
        // If none of the above, try to parse as date
        const date = new Date(time);
        if (!isNaN(date.getTime())) {
          return date.toLocaleTimeString('vi-VN', { 
            hour: '2-digit', 
            minute: '2-digit' 
          });
        }
      }
      
      return time.toString();
    } catch {
      return 'N/A';
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('vi-VN');
    } catch {
      return 'N/A';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <motion.div
        className="relative bg-gradient-to-br from-slate-800/95 via-slate-800/90 to-slate-900/95 backdrop-blur-xl rounded-3xl max-w-5xl w-full max-h-[80vh] overflow-hidden border border-slate-700/50 shadow-2xl"
        style={{
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 216, 117, 0.2)",
        }}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3 }}
      >
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFD875]/5 via-transparent to-[#FFA500]/5" />
        
        {/* Header */}
        <div className="relative p-6 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                <CalendarIcon className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Lịch chiếu</h3>
                <p className="text-sm text-[#FFD875] mt-1">{cinemaName}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Link
                to={`/admin/showtimes?cinemaId=${cinemaId}`}
                className="px-4 py-2 bg-[#FFD875] hover:bg-[#FFA500] text-black font-medium rounded-lg transition-all duration-300 flex items-center gap-2"
                onClick={onClose}
              >
                <CogIcon className="w-4 h-4" />
                Quản lý chi tiết
              </Link>
              
              <button
                onClick={onClose}
                className="p-2 bg-slate-700/50 hover:bg-slate-600/50 text-gray-400 hover:text-white rounded-lg transition-all duration-300"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="relative p-6 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-[#FFD875]/20 border-t-[#FFD875] rounded-full animate-spin"></div>
              <span className="ml-3 text-slate-400">Đang tải lịch chiếu...</span>
            </div>
          ) : showtimes.length === 0 ? (
            <div className="text-center py-12">
              <CalendarIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-white mb-2">Chưa có lịch chiếu</h4>
              <p className="text-slate-400 mb-6">Rạp này chưa có lịch chiếu nào được thiết lập.</p>
              <Link
                to={`/admin/showtimes/new?cinemaId=${cinemaId}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FFD875] to-[#FFA500] hover:from-[#FFA500] hover:to-[#FFD875] text-black font-semibold rounded-lg transition-all duration-300"
                onClick={onClose}
              >
                <PlusIcon className="w-5 h-5" />
                Thêm lịch chiếu đầu tiên
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {showtimes.slice(0, 10).map((showtime) => (
                <motion.div
                  key={showtime.id}
                  className="bg-slate-700/50 rounded-xl p-4 border border-slate-600/50 hover:border-[#FFD875]/30 transition-all duration-300 group"
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <FilmIcon className="w-5 h-5 text-[#FFD875]" />
                            <h4 className="text-lg font-semibold text-white group-hover:text-[#FFD875] transition-colors">
                              {showtime.movieTitle || `Phim ID: ${showtime.movieId}`}
                            </h4>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div className="flex items-center gap-1 text-slate-400">
                              <BuildingOfficeIcon className="w-4 h-4" />
                              <span>{showtime.roomName || `Phòng ${showtime.roomId}`}</span>
                            </div>
                            
                            <div className="flex items-center gap-1 text-slate-400">
                              <CalendarIcon className="w-4 h-4" />
                              <span>{formatDate(showtime.showDate || null)}</span>
                            </div>
                            
                            <div className="flex items-center gap-1 text-slate-400">
                              <ClockIcon className="w-4 h-4" />
                              <span>{formatTime(showtime.startTime)} - {formatTime(showtime.endTime)}</span>
                            </div>
                            
                            <div>
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(showtime.status)}`}>
                                {getStatusLabel(showtime.status)}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Link
                            to={`/admin/showtimes/${showtime.id}`}
                            className="p-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg transition-all duration-300"
                            title="Chỉnh sửa"
                            onClick={onClose}
                          >
                            <PencilIcon className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/admin/showtimes/${showtime.id}/detail`}
                            className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-all duration-300"
                            title="Xem chi tiết"
                            onClick={onClose}
                          >
                            <EyeIcon className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteShowtime(
                              parseInt(showtime.id), 
                              showtime.movieTitle || showtime.movie?.title || 'N/A'
                            )}
                            className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all duration-300"
                            title="Xóa suất chiếu"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {showtimes.length > 10 && (
                <div className="text-center py-4">
                  <p className="text-slate-400 text-sm">
                    Hiển thị 10 lịch chiếu gần nhất. 
                    <Link 
                      to={`/admin/showtimes?cinemaId=${cinemaId}`}
                      className="text-[#FFD875] hover:text-[#FFA500] ml-1"
                      onClick={onClose}
                    >
                      Xem tất cả {showtimes.length} lịch chiếu
                    </Link>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Footer */}
        {!loading && showtimes.length > 0 && (
          <div className="relative p-6 border-t border-slate-700/50">
            <div className="flex justify-between items-center">
              <div className="text-sm text-slate-400">
                Tổng cộng <span className="font-semibold text-[#FFD875]">{showtimes.length}</span> lịch chiếu
              </div>
              <div className="flex gap-3">
                <Link
                  to={`/admin/showtimes/add?cinemaId=${cinemaId}`}
                  className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-all duration-300 flex items-center gap-2"
                  onClick={onClose}
                >
                  <PlusIcon className="w-4 h-4" />
                  Thêm lịch mới
                </Link>
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-slate-700/70 hover:bg-slate-600/70 text-white rounded-lg transition-all duration-300"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ShowtimesModal;

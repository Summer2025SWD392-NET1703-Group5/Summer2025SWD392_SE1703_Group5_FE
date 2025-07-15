// src/components/admin/modals/CinemaRoomsModal.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  XMarkIcon,
  HomeIcon,
  UsersIcon,
  CogIcon,
  PlusIcon,
  PencilIcon,
  MapIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { toast } from 'react-hot-toast';
import { cinemaRoomService } from '../../../services/cinemaRoomService';
import type { CinemaRoom } from '../../../types/cinemaRoom';

interface CinemaRoomsModalProps {
  isOpen: boolean;
  onClose: () => void;
  cinemaId: number;
  cinemaName: string;
}

const CinemaRoomsModal: React.FC<CinemaRoomsModalProps> = ({
  isOpen,
  onClose,
  cinemaId,
  cinemaName,
}) => {
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState<CinemaRoom[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchRooms();
    }
  }, [isOpen, cinemaId]);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const fetchedRooms = await cinemaRoomService.getRoomsByCinemaId(cinemaId);
      setRooms(fetchedRooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast.error('Không thể tải danh sách phòng chiếu');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoom = async (roomId: number, roomName: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa phòng "${roomName}"?`)) {
      const toastId = toast.loading(`Đang xóa phòng ${roomName}...`);
      try {
        await cinemaRoomService.deleteCinemaRoom(roomId);
        toast.success(`Đã xóa phòng ${roomName}`, { id: toastId });
        // Refresh the room list
        await fetchRooms();
      } catch (error) {
        toast.error('Không thể xóa phòng chiếu.', { id: toastId });
        console.error('Error deleting room:', error);
      }
    }
  };

  const getRoomTypeColor = (type: string) => {
    const colors = {
      '2D': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      '3D': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'IMAX': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'VIP': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'Active': 'bg-green-500/20 text-green-400 border-green-500/30',
      'Inactive': 'bg-red-500/20 text-red-400 border-red-500/30',
      'Maintenance': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'Closed': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      'Active': 'Hoạt động',
      'Inactive': 'Ngừng hoạt động',
      'Maintenance': 'Bảo trì',
      'Closed': 'Đóng cửa',
    };
    return labels[status as keyof typeof labels] || status;
  };

  if (!isOpen) return null;

    return (
        <div
            className="fixed top-0 left-0 w-screen h-screen bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 9999
            }}
            onClick={onClose}
        >
            <div
                className="bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden transform transition-all"
                style={{
                    position: 'relative',
                    zIndex: 10000
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="bg-slate-700 px-6 py-4 flex items-center justify-between">
                    <h3 className="text-lg font-medium text-white flex items-center">
                        <HomeIcon className="w-5 h-5 mr-2 text-[#FFD875]" />
                        Phòng chiếu - {cinema?.Cinema_Name}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-4rem)]">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <FullScreenLoader variant="inline" />
                        </div>
                    ) : rooms.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {rooms.map(room => (
                                <div key={room.Cinema_Room_ID} className="bg-slate-700 rounded-lg p-4 border border-slate-600 hover:border-[#FFD875] transition-all hover:shadow-lg hover:translate-y-[-2px]">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="text-white font-semibold text-lg">{room.Room_Name}</h4>
                                        {getRoomStatusBadge(room.Status)}
                                    </div>

        {/* Content */}
        <div className="relative p-6 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-[#FFD875]/20 border-t-[#FFD875] rounded-full animate-spin"></div>
              <span className="ml-3 text-slate-400">Đang tải phòng chiếu...</span>
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-12">
              <HomeIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-white mb-2">Chưa có phòng chiếu</h4>
              <p className="text-slate-400 mb-6">Rạp này chưa có phòng chiếu nào được thiết lập.</p>
              <Link
                to={`/admin/cinema-rooms?cinemaId=${cinemaId}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FFD875] to-[#FFA500] hover:from-[#FFA500] hover:to-[#FFD875] text-black font-semibold rounded-lg transition-all duration-300"
                onClick={onClose}
              >
                <PlusIcon className="w-5 h-5" />
                Thêm phòng chiếu đầu tiên
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rooms.map((room) => (
                <motion.div
                  key={room.Cinema_Room_ID}
                  className="bg-slate-700/50 rounded-xl p-4 border border-slate-600/50 hover:border-[#FFD875]/30 transition-all duration-300 group"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-white group-hover:text-[#FFD875] transition-colors">
                        {room.Room_Name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full border ${getRoomTypeColor(
                            room.Room_Type
                          )}`}
                        >
                          {room.Room_Type}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(
                            room.Status
                          )}`}
                        >
                          {getStatusLabel(room.Status)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Link
                        to={`/admin/cinema-rooms/${room.Cinema_Room_ID}?cinemaId=${cinemaId}`}
                        className="p-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg transition-all duration-300"
                        title="Chỉnh sửa"
                        onClick={onClose}
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Link>
                      <Link
                        to={`/admin/cinema-rooms/${room.Cinema_Room_ID}/seats?cinemaId=${cinemaId}`}
                        className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-all duration-300"
                        title="Cấu hình sơ đồ ghế"
                        onClick={onClose}
                      >
                        <MapIcon className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteRoom(room.Cinema_Room_ID, room.Room_Name)}
                        className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all duration-300"
                        title="Xóa phòng chiếu"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <div className="flex items-center gap-1">
                      <UsersIcon className="w-4 h-4" />
                      <span>{room.Seat_Quantity} ghế</span>
                    </div>
                    {room.Notes && (
                      <div className="text-xs bg-slate-600/50 px-2 py-1 rounded truncate max-w-32" title={room.Notes}>
                        {room.Notes}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {!loading && rooms.length > 0 && (
          <div className="relative p-6 border-t border-slate-700/50">
            <div className="flex justify-between items-center">
              <div className="text-sm text-slate-400">
                Tổng cộng <span className="font-semibold text-[#FFD875]">{rooms.length}</span> phòng chiếu
              </div>
              <div className="flex gap-3">
                <Link
                  to={`/admin/cinema-rooms/new?cinemaId=${cinemaId}`}
                  className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-all duration-300 flex items-center gap-2"
                  onClick={onClose}
                >
                  <PlusIcon className="w-4 h-4" />
                  Thêm phòng mới
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

export default CinemaRoomsModal;
import React, { useState, useEffect } from 'react';
import { XMarkIcon, HomeIcon, CheckCircleIcon, XCircleIcon, ClockIcon, MapIcon } from '@heroicons/react/24/outline';
import { cinemaService } from '../../../services/cinemaService';
import FullScreenLoader from '../../FullScreenLoader';
import { useNavigate } from 'react-router-dom';

interface Room {
    Cinema_Room_ID: number;
    Cinema_ID: number;
    Room_Name: string;
    Seat_Quantity: number;
    Status: string;
    Room_Type: string;
    Notes?: string;
}

interface Cinema {
    Cinema_ID: number;
    Cinema_Name: string;
}

interface CinemaRoomsModalProps {
    isOpen: boolean;
    onClose: () => void;
    cinema: Cinema | null;
}

const CinemaRoomsModal: React.FC<CinemaRoomsModalProps> = ({ isOpen, onClose, cinema }) => {
    const [loading, setLoading] = useState(true);
    const [rooms, setRooms] = useState<Room[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen && cinema) {
            fetchRooms();
        }
    }, [isOpen, cinema]);

    const fetchRooms = async () => {
        if (!cinema) return;

        setLoading(true);
        try {
            const fetchedRooms = await cinemaService.getCinemaRooms(cinema.Cinema_ID);
            setRooms(fetchedRooms);
        } catch (error) {
            console.error('Error fetching rooms:', error);
        } finally {
            setLoading(false);
        }
    };

    const getRoomStatusBadge = (status: string) => {
        switch (status) {
            case 'Active':
                return (
                    <span className="flex items-center text-green-400">
                        <CheckCircleIcon className="w-4 h-4 mr-1" />
                        Hoạt động
                    </span>
                );
            case 'Maintenance':
                return (
                    <span className="flex items-center text-[#FFD875]">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        Bảo trì
                    </span>
                );
            case 'Inactive':
            case 'Closed':
                return (
                    <span className="flex items-center text-red-400">
                        <XCircleIcon className="w-4 h-4 mr-1" />
                        Không hoạt động
                    </span>
                );
            default:
                return (
                    <span className="flex items-center text-gray-400">
                        {status}
                    </span>
                );
        }
    };

    const handleConfigureSeats = (roomId: number) => {
        onClose();
        navigate(`/admin/cinema-rooms/${roomId}/seats`);
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

                                    <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                                        <div>
                                            <span className="text-gray-400">Loại phòng:</span>
                                            <div className="text-white mt-1">{room.Room_Type || '2D'}</div>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Sức chứa:</span>
                                            <div className="flex items-center mt-1">
                                                <span className="text-white text-xl font-bold">
                                                    {room.Seat_Quantity || 0}
                                                </span>
                                                <span className="text-[#FFD875] text-sm ml-2 font-medium">
                                                    {room.Seat_Quantity > 0 ? 'ghế' : 'chưa cấu hình'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Nút cấu hình ghế */}
                                    <div className="mt-4 pt-3 border-t border-slate-600">
                                        <button
                                            onClick={() => handleConfigureSeats(room.Cinema_Room_ID)}
                                            className="w-full py-2 px-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-lg transition-all duration-300 border border-blue-500/50 flex items-center justify-center gap-2 text-sm font-medium shadow-lg hover:shadow-blue-500/30"
                                        >
                                            <MapIcon className="w-4 h-4" />
                                            Cấu Hình Sơ Đồ Ghế
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-400">
                            Không có phòng chiếu nào cho rạp này
                        </div>
                    )}

                    <div className="flex justify-end mt-6">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-[#FFD875] text-black rounded-lg hover:bg-opacity-90 transition-colors"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CinemaRoomsModal; 
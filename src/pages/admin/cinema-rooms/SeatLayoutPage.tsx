import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
    ChevronLeftIcon,
    HomeIcon,
    CubeIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';
import SeatLayoutManager from '../../../components/admin/cinema-rooms/SeatLayoutManager';
import FullScreenLoader from '../../../components/FullScreenLoader';
import { cinemaRoomService } from '../../../services/cinemaRoomService';

const SeatLayoutPage: React.FC = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState<boolean>(true);
    const [roomDetails, setRoomDetails] = useState<any>(null);

    useEffect(() => {
        if (!roomId) {
            toast.error('Mã phòng không hợp lệ');
            navigate('/admin/cinema-rooms');
            return;
        }

        const loadRoomDetails = async () => {
            try {
                setLoading(true);
                const room = await cinemaRoomService.getCinemaRoomById(parseInt(roomId));
                setRoomDetails(room);
            } catch (error: any) {
                console.error('Error loading room details:', error);
                toast.error('Không thể tải thông tin phòng: ' + (error.message || 'Lỗi không xác định'));
                navigate('/admin/cinema-rooms');
            } finally {
                setLoading(false);
            }
        };

        loadRoomDetails();
    }, [roomId, navigate]);

    const handleBackClick = () => {
        navigate('/admin/cinema-rooms');
    };

    const getRoomTypeColor = (type: string) => {
        switch (type) {
            case 'VIP': return 'text-[#FFD875]';
            case 'IMAX': return 'text-purple-400';
            case '3D': return 'text-blue-400';
            case 'Couple': return 'text-pink-400';
            default: return 'text-white';
        }
    };

    return (
        <div className="p-6">
            {/* Header */}
            <motion.div
                className="flex items-center mb-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
            >
                <button
                    onClick={handleBackClick}
                    className="mr-4 p-2 rounded-full hover:bg-slate-700 transition-all duration-200 text-gray-400 hover:text-white group"
                >
                    <ChevronLeftIcon className="h-6 w-6 group-hover:scale-110 transition-transform" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-white">
                        {loading ? 'Đang tải...' : `Sơ đồ ghế - ${roomDetails?.Room_Name || 'Không xác định'}`}
                    </h1>
                    <p className="text-gray-400 mt-1">Quản lý và cấu hình sơ đồ ghế trong phòng chiếu</p>
                </div>
            </motion.div>

            {loading ? (
                <FullScreenLoader text="Đang tải sơ đồ ghế..." />
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                >
                    {/* Room Info Cards */}
                    <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <motion.div
                            className="bg-slate-800 p-4 rounded-lg border border-slate-700 shadow-lg group hover:shadow-[0_0_20px_0_rgba(255,216,117,0.2)] transition-all duration-300"
                            whileHover={{ y: -5 }}
                        >
                            <div className="flex items-center mb-2">
                                <HomeIcon className="w-5 h-5 text-[#FFD875] mr-2" />
                                <p className="text-sm text-gray-400">Rạp phim</p>
                            </div>
                            <p className="text-white font-medium text-lg">{roomDetails?.Cinema?.Cinema_Name || 'Không xác định'}</p>
                        </motion.div>

                        <motion.div
                            className="bg-slate-800 p-4 rounded-lg border border-slate-700 shadow-lg group hover:shadow-[0_0_20px_0_rgba(255,216,117,0.2)] transition-all duration-300"
                            whileHover={{ y: -5 }}
                        >
                            <div className="flex items-center mb-2">
                                <CubeIcon className="w-5 h-5 text-[#FFD875] mr-2" />
                                <p className="text-sm text-gray-400">Phòng chiếu</p>
                            </div>
                            <p className="text-white font-medium text-lg">{roomDetails?.Room_Name || 'Không xác định'}</p>
                        </motion.div>

                        <motion.div
                            className="bg-slate-800 p-4 rounded-lg border border-slate-700 shadow-lg group hover:shadow-[0_0_20px_0_rgba(255,216,117,0.2)] transition-all duration-300"
                            whileHover={{ y: -5 }}
                        >
                            <div className="flex items-center mb-2">
                                <SparklesIcon className="w-5 h-5 text-[#FFD875] mr-2" />
                                <p className="text-sm text-gray-400">Loại phòng</p>
                            </div>
                            <p className={`font-bold text-lg ${getRoomTypeColor(roomDetails?.Room_Type)}`}>
                                {roomDetails?.Room_Type || 'Thường'}
                            </p>
                        </motion.div>
                    </div>

                    {/* Seat Layout Manager */}
                    <motion.div
                        className="bg-slate-900 rounded-lg p-6 border border-slate-700 shadow-lg"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                    >
                        {roomId && (
                            <SeatLayoutManager
                                roomId={parseInt(roomId)}
                                onLayoutChange={() => {
                                    toast.success('Cập nhật sơ đồ ghế thành công', {
                                        icon: '✨',
                                        style: {
                                            borderRadius: '10px',
                                            background: '#1F2937',
                                            color: '#FFD875',
                                            border: '1px solid #FFD875',
                                        },
                                    });
                                }}
                            />
                        )}
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
};

export default SeatLayoutPage; 
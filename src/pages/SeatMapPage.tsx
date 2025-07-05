import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { seatLayoutService } from '../services/seatLayoutService';
import { cinemaRoomService } from '../services/cinemaRoomService';
import RoomSeatMap from './admin/cinema-rooms/RoomSeatMap';
import LoadingSpinner from '../components/LoadingSpinner';
import type { SeatMap } from '../types/seatLayout';

const SeatMapPage: React.FC = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState<boolean>(true);
    const [seatMap, setSeatMap] = useState<SeatMap | null>(null);
    const [roomDetails, setRoomDetails] = useState<any>(null);

    useEffect(() => {
        if (!roomId) {
            toast.error('Mã phòng không hợp lệ');
            navigate('/cinemas');
            return;
        }

        const loadData = async () => {
            try {
                setLoading(true);

                // Tải thông tin phòng chiếu
                const room = await cinemaRoomService.getCinemaRoomById(parseInt(roomId));
                setRoomDetails(room);

                // Tải sơ đồ ghế
                const seatMapData = await seatLayoutService.getSeatLayoutByRoomId(parseInt(roomId));
                setSeatMap(seatMapData);
            } catch (error: any) {
                console.error('Error loading seat map:', error);
                if (error.response?.status === 404) {
                    toast.error('Phòng chiếu này chưa có sơ đồ ghế');
                } else {
                    toast.error('Không thể tải sơ đồ ghế: ' + (error.message || 'Lỗi không xác định'));
                }
                navigate('/cinemas');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [roomId, navigate]);

    const handleBackClick = () => {
        navigate(-1);
    };

    // Lấy danh sách ghế VIP
    const getVipSeats = (): string[] => {
        if (!seatMap) return [];

        const vipSeats: string[] = [];
        seatMap.rows.forEach(row => {
            row.Seats.forEach(seat => {
                if (seat.Seat_Type === 'VIP' && seat.Is_Active) {
                    vipSeats.push(`${seat.Row_Label}${seat.Column_Number}`);
                }
            });
        });

        return vipSeats;
    };

    // Lấy danh sách ghế đôi
    const getCoupleSeats = (): string[] => {
        if (!seatMap) return [];

        const coupleSeats: string[] = [];
        seatMap.rows.forEach(row => {
            row.Seats.forEach(seat => {
                if (seat.Seat_Type === 'Couple' && seat.Is_Active) {
                    coupleSeats.push(`${seat.Row_Label}${seat.Column_Number}`);
                }
            });
        });

        return coupleSeats;
    };

    // Lấy danh sách ghế không hoạt động
    const getDisabledSeats = (): string[] => {
        if (!seatMap) return [];

        const disabledSeats: string[] = [];
        seatMap.rows.forEach(row => {
            row.Seats.forEach(seat => {
                if (!seat.Is_Active) {
                    disabledSeats.push(`${seat.Row_Label}${seat.Column_Number}`);
                }
            });
        });

        return disabledSeats;
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center mb-6">
                <button
                    onClick={handleBackClick}
                    className="flex items-center text-gray-400 hover:text-white mr-4"
                >
                    <ChevronLeftIcon className="w-5 h-5 mr-1" />
                    Quay lại
                </button>

                <h1 className="text-2xl font-bold text-white">
                    {loading ? 'Đang tải...' : `Sơ đồ ghế - ${roomDetails?.Room_Name || 'Không xác định'}`}
                </h1>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <LoadingSpinner />
                </div>
            ) : seatMap ? (
                <div className="bg-slate-900 rounded-lg p-6">
                    <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-slate-800 p-4 rounded-lg">
                            <p className="text-sm text-gray-400">Rạp phim</p>
                            <p className="text-white font-medium">{roomDetails?.Cinema?.Cinema_Name || 'Không xác định'}</p>
                        </div>

                        <div className="bg-slate-800 p-4 rounded-lg">
                            <p className="text-sm text-gray-400">Phòng chiếu</p>
                            <p className="text-white font-medium">{roomDetails?.Room_Name || 'Không xác định'}</p>
                        </div>

                        <div className="bg-slate-800 p-4 rounded-lg">
                            <p className="text-sm text-gray-400">Loại phòng</p>
                            <p className="text-white font-medium">{roomDetails?.Room_Type || 'Thường'}</p>
                        </div>
                    </div>

                    <div className="mb-6">
                        <div className="bg-slate-800 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-white mb-4">Chú thích</h3>
                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center">
                                    <div className="w-6 h-6 bg-green-500 rounded-md mr-2"></div>
                                    <span className="text-sm text-gray-300">Ghế thường</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-6 h-6 bg-purple-500 rounded-md mr-2"></div>
                                    <span className="text-sm text-gray-300">Ghế VIP</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-6 h-6 bg-orange-500 rounded-md mr-2"></div>
                                    <span className="text-sm text-gray-300">Ghế đôi</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-6 h-6 bg-slate-700 rounded-md mr-2"></div>
                                    <span className="text-sm text-gray-300">Ghế không hoạt động</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <RoomSeatMap
                        rows={seatMap.dimensions.rows}
                        cols={seatMap.dimensions.columns}
                        selectedSeats={[]}
                        onSeatSelect={() => { }}
                        onRowSelect={() => { }}
                        onColSelect={() => { }}
                        vipSeats={getVipSeats()}
                        coupleSeats={getCoupleSeats()}
                        disabledSeats={getDisabledSeats()}
                    />

                    <div className="mt-6 bg-slate-800 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-white mb-2">Thông tin phòng chiếu</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-slate-700 p-3 rounded-lg">
                                <p className="text-sm text-gray-400">Tổng số ghế</p>
                                <p className="text-white font-medium">{seatMap.stats.total_seats}</p>
                            </div>

                            <div className="bg-slate-700 p-3 rounded-lg">
                                <p className="text-sm text-gray-400">Ghế VIP</p>
                                <p className="text-white font-medium">{seatMap.stats.vip_seats || 0}</p>
                            </div>

                            <div className="bg-slate-700 p-3 rounded-lg">
                                <p className="text-sm text-gray-400">Ghế đôi</p>
                                <p className="text-white font-medium">{seatMap.stats.couple_seats || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-slate-800 rounded-lg p-6 text-center">
                    <p className="text-gray-400 mb-4">Phòng chiếu này chưa có sơ đồ ghế</p>
                    <button
                        onClick={handleBackClick}
                        className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg transition-colors"
                    >
                        Quay lại
                    </button>
                </div>
            )}
        </div>
    );
};

export default SeatMapPage; 
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeftIcon,
    BuildingOfficeIcon,
    MapPinIcon,
    PhoneIcon,
    EnvelopeIcon,
    PencilIcon,
    PlusIcon,
    TrashIcon,
    CalendarIcon,
    HomeIcon,
    FilmIcon,
    ClockIcon,
    UserGroupIcon,
    XMarkIcon,
    TicketIcon,
    EyeIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { cinemaService } from '../../../services/cinemaService';
import apiClient from '../../../services/apiClient';
import LoadingSpinner from '../../../components/LoadingSpinner';
import type { Cinema, CinemaRoom } from '../../../types/cinema';

interface Showtime {
    Showtime_ID: number;
    Movie_ID: number;
    Cinema_Room_ID: number;
    Show_Date: string;
    Start_Time: string;
    End_Time: string;
    Status: 'Hidden' | 'Scheduled';
    BookedSeats: number;
    TotalSeats: number;
    AvailableSeats: number;
    
    // Thông tin từ relationships
    Movie?: {
        Movie_ID: number;
        Movie_Name: string;
        Duration: number;
        Poster_URL?: string;
        Genre?: string;
        Rating?: string;
    };
    
    Room?: {
        Cinema_Room_ID: number;
        Room_Name: string;
        Room_Type: string;
    };
    
    Cinema?: {
        Cinema_ID: number;
        Cinema_Name: string;
        City?: string;
        Address?: string;
    };
}

const CinemaDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [showtimesLoading, setShowtimesLoading] = useState(true);
    const [cinema, setCinema] = useState<Cinema | null>(null);
    const [rooms, setRooms] = useState<CinemaRoom[]>([]);
    const [showtimes, setShowtimes] = useState<Showtime[]>([]);

    // Modal states
    const [showRoomModal, setShowRoomModal] = useState(false);
    const [editingRoom, setEditingRoom] = useState<CinemaRoom | null>(null);

    // Tab state
    const [activeTab, setActiveTab] = useState<'info' | 'rooms' | 'showtimes'>('info');

    // Stats animation
    const [animatedStats, setAnimatedStats] = useState({
        rooms: 0,
        seats: 0,
        showtimes: 0
    });

    useEffect(() => {
        if (id) {
            fetchCinemaDetails();
            fetchRooms();
        }
    }, [id]);
    
    // Fetch showtimes sau khi rooms đã được load
    useEffect(() => {
        if (rooms.length > 0) {
            fetchShowtimes();
        }
    }, [rooms]);

    useEffect(() => {
        // Animate stats numbers
        const totalSeats = rooms.reduce((sum, room) => sum + (room.Seat_Quantity || 0), 0);

        const animateValue = (start: number, end: number, key: keyof typeof animatedStats) => {
            let current = start;
            const increment = end / 20;
            const timer = setInterval(() => {
                current += increment;
                if (current >= end) {
                    current = end;
                    clearInterval(timer);
                }
                setAnimatedStats(prev => ({ ...prev, [key]: Math.floor(current) }));
            }, 50);
        };

        animateValue(0, rooms.length, 'rooms');
        animateValue(0, totalSeats, 'seats');
        animateValue(0, showtimes.length, 'showtimes');
    }, [rooms, showtimes]);

    const fetchCinemaDetails = async () => {
        try {
            setLoading(true);
            const data = await cinemaService.getCinemaById(Number(id));
            setCinema(data);
        } catch (error) {
            toast.error('Không thể tải thông tin rạp');
            navigate('/admin/cinemas');
        } finally {
            setLoading(false);
        }
    };

    const fetchRooms = async () => {
        try {
            const data = await cinemaService.getCinemaRooms(Number(id));
            setRooms(data as unknown as CinemaRoom[]);
        } catch (error) {
            console.error('Error fetching rooms:', error);
        }
    };

    const fetchShowtimes = async () => {
        try {
            setShowtimesLoading(true);
            console.log(`Đang tải lịch chiếu cho rạp ID: ${id}`);
            
            // Gọi API lấy tất cả showtimes và filter theo cinema
            const response = await apiClient.get('/showtimes');
            
            if (!response.data || !Array.isArray(response.data)) {
                console.error('Dữ liệu showtimes không hợp lệ:', response.data);
                setShowtimes([]);
                return;
            }
            
            console.log('Tất cả showtimes:', response.data);
            console.log('Danh sách rooms của cinema:', rooms);
            
            // Lấy danh sách room IDs của cinema hiện tại
            const cinemaRoomIds = rooms.map(room => room.Cinema_Room_ID);
            console.log('Room IDs của rạp:', cinemaRoomIds);
            
            // Filter showtimes cho rạp hiện tại dựa trên room IDs
            const cinemaShowtimes = response.data.filter((showtime: any) => {
                // Log chi tiết để debug
                console.log(`Checking showtime ${showtime.Showtime_ID}:`, {
                    Cinema_Room_ID: showtime.Cinema_Room_ID,
                    cinema_id: showtime.cinema_id,
                    Cinema: showtime.Cinema,
                    Room: showtime.Room
                });
                
                // Check nếu showtime thuộc về một trong các rooms của cinema này
                const belongsToRoom = cinemaRoomIds.includes(showtime.Cinema_Room_ID) ||
                                    cinemaRoomIds.includes(parseInt(showtime.Cinema_Room_ID)) ||
                                    cinemaRoomIds.map(id => id.toString()).includes(showtime.Cinema_Room_ID?.toString());
                
                // Fallback: check Cinema_ID nếu có
                const belongsToCinema = showtime.Cinema?.Cinema_ID?.toString() === id ||
                                      showtime.cinema_id?.toString() === id ||
                                      showtime.Cinema_ID?.toString() === id ||
                                      // Check thêm trường hợp nested Room.Cinema
                                      showtime.Room?.Cinema?.Cinema_ID?.toString() === id;
                
                return belongsToRoom || belongsToCinema;
            });
            
            console.log(`Tìm thấy ${cinemaShowtimes.length} suất chiếu cho rạp ID ${id}`);
            
            // Debug: nếu không tìm thấy showtime nào
            if (cinemaShowtimes.length === 0 && response.data.length > 0) {
                console.log('Không tìm thấy suất chiếu. Debug info:');
                console.log('Cinema ID hiện tại:', id);
                console.log('Room IDs của rạp:', cinemaRoomIds);
                console.log('Sample showtime:', response.data[0]);
            }
            
            setShowtimes(cinemaShowtimes);
            
        } catch (error) {
            console.error('Lỗi khi tải lịch chiếu:', error);
            toast.error('Không thể tải lịch chiếu');
            setShowtimes([]);
        } finally {
            setShowtimesLoading(false);
        }
    };

    const handleDeleteRoom = async (roomId: number) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa phòng chiếu này?')) {
            try {
                // TODO: Implement delete cinema room API
                console.log('Deleting room:', roomId);
                toast.success('Chức năng đang phát triển');
                // fetchRooms();
            } catch (error) {
                toast.error('Không thể xóa phòng chiếu');
            }
        }
    };

    const handleDeleteShowtime = async (showtimeId: number) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa lịch chiếu này?')) {
            try {
                // TODO: Implement delete showtime API
                console.log('Deleting showtime:', showtimeId);
                toast.success('Chức năng đang phát triển');
                // fetchShowtimes();
            } catch (error) {
                toast.error('Không thể xóa lịch chiếu');
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <LoadingSpinner />
            </div>
        );
    }

    if (!cinema) {
        return null;
    }

    const tabVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="max-w-[1600px] mx-auto px-4">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-8 flex items-center justify-between"
            >
                <div className="flex items-center">
                    <Link
                        to="/admin/cinemas"
                        className="mr-4 p-2 rounded-full hover:bg-slate-800 transition-all duration-200 text-gray-400 hover:text-white group"
                    >
                        <ArrowLeftIcon className="h-6 w-6 group-hover:scale-110 transition-transform" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <BuildingOfficeIcon className="w-8 h-8 text-[#FFD875]" />
                            {cinema.Cinema_Name}
                        </h1>
                        <p className="text-gray-400 mt-1">Quản lý thông tin chi tiết rạp chiếu phim</p>
                    </div>
                </div>

                <Link
                    to={`/admin/cinemas/${id}/edit`}
                    className="bg-[#FFD875] hover:bg-[#e5c368] text-black px-4 py-2 rounded-lg transition-all duration-300 shadow-[0_0_15px_0_rgba(255,216,117,0.5)] flex items-center gap-2 hover:shadow-[0_0_20px_3px_rgba(255,216,117,0.6)]"
                >
                    <PencilIcon className="w-5 h-5" />
                    Chỉnh sửa thông tin
                </Link>
            </motion.div>

            {/* Tabs */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex gap-1 mb-6 bg-slate-800 p-1 rounded-lg"
            >
                <button
                    onClick={() => setActiveTab('info')}
                    className={`flex-1 py-3 px-6 rounded-md transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'info'
                        ? 'bg-[#FFD875] text-black shadow-[0_0_10px_rgba(255,216,117,0.5)]'
                        : 'text-gray-400 hover:text-white hover:bg-slate-700'
                        }`}
                >
                    <BuildingOfficeIcon className="w-5 h-5" />
                    Thông tin chung
                </button>
                <button
                    onClick={() => setActiveTab('rooms')}
                    className={`flex-1 py-3 px-6 rounded-md transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'rooms'
                        ? 'bg-[#FFD875] text-black shadow-[0_0_10px_rgba(255,216,117,0.5)]'
                        : 'text-gray-400 hover:text-white hover:bg-slate-700'
                        }`}
                >
                    <HomeIcon className="w-5 h-5" />
                    Phòng chiếu ({rooms.length})
                </button>
                <button
                    onClick={() => setActiveTab('showtimes')}
                    className={`flex-1 py-3 px-6 rounded-md transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'showtimes'
                        ? 'bg-[#FFD875] text-black shadow-[0_0_10px_rgba(255,216,117,0.5)]'
                        : 'text-gray-400 hover:text-white hover:bg-slate-700'
                        }`}
                >
                    <CalendarIcon className="w-5 h-5" />
                    Lịch chiếu ({showtimes.length})
                </button>
            </motion.div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                {activeTab === 'info' && (
                    <motion.div
                        key="info"
                        variants={tabVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                    >
                        {/* Cinema Info Card */}
                        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-[0_0_20px_0_rgba(0,0,0,0.3)]">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 bg-[#FFD875] rounded-full"></span>
                                Thông tin rạp
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <MapPinIcon className="w-5 h-5 text-[#FFD875] mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-400">Địa chỉ</p>
                                        <p className="text-white">{cinema.Address}, {cinema.City}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <PhoneIcon className="w-5 h-5 text-[#FFD875] mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-400">Số điện thoại</p>
                                        <p className="text-white">{cinema.Phone_Number || 'Chưa cập nhật'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <EnvelopeIcon className="w-5 h-5 text-[#FFD875] mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-400">Email</p>
                                        <p className="text-white">{cinema.Email || 'Chưa cập nhật'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Statistics Card */}
                        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-[0_0_20px_0_rgba(0,0,0,0.3)] relative overflow-hidden">
                            {/* Background decoration */}
                            <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#FFD875]/10 rounded-full blur-3xl"></div>
                            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[#FFD875]/10 rounded-full blur-3xl"></div>

                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 relative z-10">
                                <span className="w-2 h-2 bg-[#FFD875] rounded-full animate-pulse"></span>
                                Thống kê
                            </h3>
                            <div className="grid grid-cols-2 gap-4 relative z-10">
                                <motion.div
                                    whileHover={{ scale: 1.05, rotate: 1 }}
                                    className="bg-gradient-to-br from-slate-700/50 to-slate-700/30 rounded-lg p-4 text-center border border-slate-600/50 backdrop-blur-sm"
                                >
                                    <HomeIcon className="w-8 h-8 text-[#FFD875] mx-auto mb-2" />
                                    <p className="text-2xl font-bold text-white">{animatedStats.rooms}</p>
                                    <p className="text-sm text-gray-400">Phòng chiếu</p>
                                </motion.div>
                                <motion.div
                                    whileHover={{ scale: 1.05, rotate: -1 }}
                                    className="bg-gradient-to-br from-slate-700/50 to-slate-700/30 rounded-lg p-4 text-center border border-slate-600/50 backdrop-blur-sm"
                                >
                                    <UserGroupIcon className="w-8 h-8 text-[#FFD875] mx-auto mb-2" />
                                    <p className="text-2xl font-bold text-white">{animatedStats.seats}</p>
                                    <p className="text-sm text-gray-400">Tổng số ghế</p>
                                </motion.div>
                                <motion.div
                                    whileHover={{ scale: 1.05, rotate: 1 }}
                                    className="bg-gradient-to-br from-slate-700/50 to-slate-700/30 rounded-lg p-4 text-center border border-slate-600/50 backdrop-blur-sm"
                                >
                                    <FilmIcon className="w-8 h-8 text-[#FFD875] mx-auto mb-2" />
                                    <p className="text-2xl font-bold text-white">{animatedStats.showtimes}</p>
                                    <p className="text-sm text-gray-400">Tổng lịch chiếu</p>
                                </motion.div>
                                <motion.div
                                    whileHover={{ scale: 1.05, rotate: -1 }}
                                    className="bg-gradient-to-br from-slate-700/50 to-slate-700/30 rounded-lg p-4 text-center border border-slate-600/50 backdrop-blur-sm"
                                >
                                    <div className={`relative w-6 h-6 mx-auto mb-2 mt-1`}>
                                        <div className={`absolute inset-0 rounded-full ${cinema.Status === 'Active' ? 'bg-green-500' : 'bg-gray-500'
                                            } animate-ping opacity-75`}></div>
                                        <div className={`relative w-6 h-6 rounded-full ${cinema.Status === 'Active' ? 'bg-green-500' : 'bg-gray-500'
                                            }`}></div>
                                    </div>
                                    <p className="text-sm font-medium text-white">
                                        {cinema.Status === 'Active' ? 'Đang hoạt động' : 'Tạm ngừng'}
                                    </p>
                                    <p className="text-xs text-gray-400">Trạng thái</p>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'rooms' && (
                    <motion.div
                        key="rooms"
                        variants={tabVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                    >
                        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-semibold text-white">Danh sách phòng chiếu</h3>
                                <button
                                    onClick={() => {
                                        setEditingRoom(null);
                                        setShowRoomModal(true);
                                    }}
                                    className="bg-[#FFD875] hover:bg-[#e5c368] text-black px-4 py-2 rounded-lg transition-all duration-300 shadow-[0_0_15px_0px_rgba(255,216,117,0.5)] flex items-center gap-2 hover:shadow-[0_0_20px_3px_rgba(255,216,117,0.6)]"
                                >
                                    <PlusIcon className="w-5 h-5" />
                                    Thêm phòng mới
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {rooms.map((room, index) => (
                                    <motion.div
                                        key={room.Cinema_Room_ID}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        whileHover={{ scale: 1.02, y: -5 }}
                                        className="bg-gradient-to-br from-slate-700 to-slate-700/50 rounded-lg p-4 border border-slate-600 hover:border-[#FFD875]/50 transition-all duration-300 relative overflow-hidden group"
                                    >
                                        <div className="absolute -top-10 -right-10 w-20 h-20 bg-[#FFD875]/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                        <div className="flex justify-between items-start mb-3 relative z-10">
                                            <h4 className="text-white font-medium">{room.Room_Name}</h4>
                                            <div className="flex gap-2">
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => {
                                                        setEditingRoom(room);
                                                        setShowRoomModal(true);
                                                    }}
                                                    className="p-1 hover:bg-slate-600 rounded transition-colors"
                                                >
                                                    <PencilIcon className="w-4 h-4 text-gray-400 hover:text-[#FFD875]" />
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => handleDeleteRoom(room.Cinema_Room_ID)}
                                                    className="p-1 hover:bg-slate-600 rounded transition-colors"
                                                >
                                                    <TrashIcon className="w-4 h-4 text-gray-400 hover:text-red-500" />
                                                </motion.button>
                                            </div>
                                        </div>
                                        <div className="space-y-2 text-sm relative z-10">
                                            <p className="text-gray-400">
                                                Loại: <span className="text-white">{room.Room_Type}</span>
                                            </p>
                                            <p className="text-gray-400">
                                                Số ghế: <span className="text-white font-semibold">{room.Seat_Quantity}</span>
                                            </p>
                                            <p className="text-gray-400">
                                                Trạng thái:
                                                <span className={`ml-2 px-2 py-1 rounded-full text-xs inline-flex items-center gap-1 ${room.Status === 'Active'
                                                        ? 'bg-green-500/20 text-green-400'
                                                        : 'bg-gray-500/20 text-gray-400'
                                                    }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${room.Status === 'Active' ? 'bg-green-400' : 'bg-gray-400'
                                                        }`}></span>
                                                    {room.Status === 'Active' ? 'Hoạt động' : 'Bảo trì'}
                                                </span>
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'showtimes' && (
                    <motion.div
                        key="showtimes"
                        variants={tabVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                    >
                        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-semibold text-white">Danh sách lịch chiếu</h3>
                                <div className="flex gap-3">
                                <button
                                        onClick={() => fetchShowtimes()}
                                        disabled={showtimesLoading}
                                        className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Làm mới"
                                    >
                                        <ArrowPathIcon className={`w-5 h-5 ${showtimesLoading ? 'animate-spin' : ''}`} />
                                    </button>
                                    <Link
                                        to={`/admin/showtimes/add?cinema=${id}`}
                                    className="bg-[#FFD875] hover:bg-[#e5c368] text-black px-4 py-2 rounded-lg transition-all duration-300 shadow-[0_0_15px_0px_rgba(255,216,117,0.5)] flex items-center gap-2 hover:shadow-[0_0_20px_3px_rgba(255,216,117,0.6)]"
                                >
                                    <PlusIcon className="w-5 h-5" />
                                    Thêm lịch chiếu
                                    </Link>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-700">
                                            <th className="text-left py-3 px-4 text-gray-400 font-medium">Phim</th>
                                            <th className="text-left py-3 px-4 text-gray-400 font-medium">Phòng</th>
                                            <th className="text-left py-3 px-4 text-gray-400 font-medium">Thời gian</th>
                                            <th className="text-left py-3 px-4 text-gray-400 font-medium">Ghế</th>
                                            <th className="text-right py-3 px-4 text-gray-400 font-medium">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {showtimesLoading ? (
                                            <tr>
                                                <td colSpan={5} className="py-8 text-center">
                                                    <LoadingSpinner />
                                                    <p className="text-gray-400 mt-2">Đang tải lịch chiếu...</p>
                                                </td>
                                            </tr>
                                        ) : showtimes.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="py-8 text-center">
                                                    <FilmIcon className="w-12 h-12 mx-auto mb-2 text-gray-500" />
                                                    <p className="text-gray-400">Không có lịch chiếu nào</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            showtimes.map((showtime) => (
                                                <tr key={showtime.Showtime_ID} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center gap-3">
                                                            {showtime.Movie?.Poster_URL && (
                                                                <img 
                                                                    src={showtime.Movie.Poster_URL} 
                                                                    alt={showtime.Movie.Movie_Name}
                                                                    className="w-8 h-12 object-cover rounded"
                                                                />
                                                            )}
                                                            <div>
                                                                <p className="text-white font-medium">
                                                                    {showtime.Movie?.Movie_Name || `Phim ${showtime.Movie_ID}`}
                                                                </p>
                                                                {showtime.Movie?.Duration && (
                                                                    <p className="text-xs text-gray-400">
                                                                        {showtime.Movie.Duration} phút
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4 text-white">
                                                        {showtime.Room?.Room_Name || `Phòng ${showtime.Cinema_Room_ID}`}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex items-center gap-2 text-white">
                                                                <ClockIcon className="w-4 h-4 text-gray-400" />
                                                                {showtime.Start_Time.substring(0, 5)} - {showtime.End_Time.substring(0, 5)}
                                                            </div>
                                                            <p className="text-xs text-gray-400">
                                                                {new Date(showtime.Show_Date).toLocaleDateString('vi-VN')}
                                                            </p>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center gap-2">
                                                            <TicketIcon className="w-4 h-4 text-gray-400" />
                                                            <span className="text-white">
                                                                {showtime.BookedSeats || 0}/{showtime.TotalSeats || 0}
                                                            </span>
                                                        </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex justify-end gap-2">
                                                            <Link
                                                                to={`/admin/showtimes/${showtime.Showtime_ID}/detail`}
                                                                className="p-1 hover:bg-slate-600 rounded transition-colors"
                                                                title="Xem chi tiết"
                                                            >
                                                                <EyeIcon className="w-4 h-4 text-gray-400 hover:text-blue-400" />
                                                            </Link>
                                                            <Link
                                                                to={`/admin/showtimes/${showtime.Showtime_ID}`}
                                                            className="p-1 hover:bg-slate-600 rounded transition-colors"
                                                                title="Chỉnh sửa"
                                                        >
                                                            <PencilIcon className="w-4 h-4 text-gray-400 hover:text-[#FFD875]" />
                                                            </Link>
                                                        <button
                                                                onClick={() => handleDeleteShowtime(showtime.Showtime_ID)}
                                                            className="p-1 hover:bg-slate-600 rounded transition-colors"
                                                                title="Xóa"
                                                        >
                                                            <TrashIcon className="w-4 h-4 text-gray-400 hover:text-red-500" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Room Modal */}
            <AnimatePresence>
                {showRoomModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                        onClick={() => setShowRoomModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-[0_0_30px_rgba(255,216,117,0.3)]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-white">
                                    {editingRoom ? 'Chỉnh sửa phòng chiếu' : 'Thêm phòng chiếu mới'}
                                </h3>
                                <button
                                    onClick={() => setShowRoomModal(false)}
                                    className="p-1 hover:bg-slate-700 rounded-lg transition-colors"
                                >
                                    <XMarkIcon className="w-6 h-6 text-gray-400" />
                                </button>
                            </div>

                            {/* Room form content */}
                            <form className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Tên phòng
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-[#FFD875] focus:outline-none"
                                        defaultValue={editingRoom?.Room_Name}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Loại phòng
                                    </label>
                                    <select className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-[#FFD875] focus:outline-none">
                                        <option value="standard">Thường</option>
                                        <option value="vip">VIP</option>
                                        <option value="deluxe">Deluxe</option>
                                    </select>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-[#FFD875] hover:bg-[#e5c368] text-black py-2 rounded-lg transition-colors font-medium"
                                    >
                                        {editingRoom ? 'Cập nhật' : 'Thêm phòng'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowRoomModal(false)}
                                        className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg transition-colors"
                                    >
                                        Hủy
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>


        </div>
    );
};

export default CinemaDetail; 
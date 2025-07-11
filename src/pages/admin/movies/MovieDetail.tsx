import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeftIcon,
    ClockIcon,
    CalendarIcon,
    StarIcon,
    UserIcon,
    GlobeAltIcon,
    LanguageIcon,
    PencilIcon,
    TrashIcon,
    PlayIcon
} from '@heroicons/react/24/outline';
import { movieService } from '../../../services/movieService';
import '../styles/MovieManagement.css';
import { motion } from 'framer-motion';
import FullScreenLoader from '../../../components/FullScreenLoader';
import { toast } from 'react-hot-toast';
import ConfirmDialog from '../../../components/admin/common/ConfirmDialog';
import { useAuth } from '../../../hooks/useAuth';

interface MovieDetailProps { }

const MovieDetail: React.FC<MovieDetailProps> = () => {
    const { user } = useAuth(); // Get current user information
    const isAdmin = user?.role === 'Admin'; // Check if user is Admin
    const { id } = useParams<{ id: string }>();
    const [movie, setMovie] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMovie = async () => {
            if (id) {
                try {
                    setLoading(true);
                    const movieData = await movieService.getMovieById(Number(id));
                    setMovie(movieData);
                } catch (error) {
                    console.error('Error fetching movie:', error);
                    toast.error('Không thể tải thông tin phim');
                    navigate('/admin/movies');
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchMovie();
    }, [id, navigate]);

    const handleEditMovie = () => {
        if (!isAdmin) {
            toast.error('Bạn không có quyền chỉnh sửa phim.');
            return;
        }
        navigate(`/admin/movies/${id}/edit`);
    };

    const handleDeleteMovie = () => {
        if (!isAdmin) {
            toast.error('Bạn không có quyền xóa phim.');
            return;
        }
        setShowDeleteDialog(true);
    };

    const confirmDelete = async () => {
        if (!isAdmin) {
            toast.error('Bạn không có quyền xóa phim.');
            return;
        }
        
        if (id) {
            const toastId = toast.loading('Đang xóa phim...');
            try {
                await movieService.deleteMovie(Number(id));
                toast.success('Xóa phim thành công!', { id: toastId });
                navigate('/admin/movies');
            } catch (error) {
                toast.error('Xóa phim thất bại.', { id: toastId });
                console.error('Error deleting movie:', error);
            } finally {
                setShowDeleteDialog(false);
            }
        }
    };

    const formatDate = (date: string | null) => {
        if (!date) return 'Chưa có';
        return new Date(date).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const statusMap: { [key: string]: { text: string; className: string } } = {
        'Now Showing': {
            text: 'Đang chiếu',
            className: 'bg-green-500/20 text-green-400 border border-green-500/30'
        },
        'Coming Soon': {
            text: 'Sắp chiếu',
            className: 'bg-[#FFD875]/20 text-[#FFD875] border border-[#FFD875]/30'
        },
        'Ended': {
            text: 'Đã kết thúc',
            className: 'bg-red-500/20 text-red-400 border border-red-500/30'
        },
        'Cancelled': {
            text: 'Đã hủy',
            className: 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
        },
        'Inactive': {
            text: 'Không hoạt động',
            className: 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
        }
    };

    const getStatusInfo = (status: string) => {
        return (
            statusMap[status] || {
                text: status,
                className: 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
            }
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="flex flex-col items-center">
                    <FullScreenLoader />
                    <p className="mt-4 text-white">Đang tải thông tin phim...</p>
                </div>
            </div>
        );
    }

    if (!movie) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="text-white text-center">
                    <h2 className="text-2xl font-bold mb-4">Không tìm thấy phim</h2>
                    <Link
                        to="/admin/movies"
                        className="bg-[#FFD875] text-gray-900 px-4 py-2 rounded-lg hover:bg-[#e5c368] transition-colors shadow-[0_0_15px_0_rgba(255,216,117,0.3)] hover:shadow-[0_0_20px_5px_rgba(255,216,117,0.5)]"
                    >
                        Quay lại danh sách
                    </Link>
                </div>
            </div>
        );
    }

    const statusInfo = getStatusInfo(movie.Status);
    const genres = movie.Genre?.split(',') || [];

    return (
        <div className="max-w-[1600px] mx-auto px-4">
            <motion.div
                className="mb-6 flex items-center"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
            >
                <Link
                    to="/admin/movies"
                    className="mr-4 p-2 rounded-full hover:bg-slate-800 transition-all duration-200 text-gray-400 hover:text-white group"
                >
                    <ArrowLeftIcon className="h-6 w-6 group-hover:scale-110 transition-transform" />
                </Link>
                <div className="flex-grow">
                    <h1 className="text-2xl font-bold text-white">Chi tiết phim</h1>
                    <p className="text-gray-400 mt-1">
                        {isAdmin 
                            ? "Xem thông tin chi tiết của phim" 
                            : "Xem thông tin chi tiết của phim (Chế độ chỉ xem)"
                        }
                    </p>
                    {!isAdmin && (
                        <p className="text-amber-400 text-sm mt-1">
                            💡 Bạn chỉ có thể xem thông tin phim. Liên hệ Admin để thực hiện các thay đổi.
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => isAdmin && handleEditMovie()}
                        className={`px-4 py-2 rounded-lg flex items-center transition-all ${
                            isAdmin 
                                ? 'bg-[#FFD875]/10 hover:bg-[#FFD875]/20 text-[#FFD875] shadow-[0_0_10px_0_rgba(255,216,117,0.2)] hover:shadow-[0_0_15px_0_rgba(255,216,117,0.4)] cursor-pointer'
                                : 'bg-[#FFD875]/5 text-[#FFD875]/50 cursor-not-allowed shadow-[0_0_10px_0_rgba(255,216,117,0.1)]'
                        }`}
                        disabled={!isAdmin}
                        title={!isAdmin ? "Chỉ Admin mới có thể chỉnh sửa phim" : "Chỉnh sửa phim"}
                    >
                        <PencilIcon className="w-5 h-5 mr-2" />
                        Chỉnh sửa
                    </button>
                    <button
                        onClick={() => isAdmin && handleDeleteMovie()}
                        className={`px-4 py-2 rounded-lg flex items-center transition-all ${
                            isAdmin 
                                ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 shadow-[0_0_10px_0_rgba(239,68,68,0.2)] hover:shadow-[0_0_15px_0_rgba(239,68,68,0.4)] cursor-pointer'
                                : 'bg-red-500/5 text-red-400/50 cursor-not-allowed shadow-[0_0_10px_0_rgba(239,68,68,0.1)]'
                        }`}
                        disabled={!isAdmin}
                        title={!isAdmin ? "Chỉ Admin mới có thể xóa phim" : "Xóa phim"}
                    >
                        <TrashIcon className="w-5 h-5 mr-2" />
                        Xóa
                    </button>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Poster column */}
                <motion.div
                    className="md:col-span-1"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                >
                    <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 shadow-xl p-4 relative group">
                        {/* Glowing Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-[#FFD875]/10 via-[#FFD875]/30 to-[#FFD875]/10 rounded-xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300 -z-10"></div>

                        <div className="relative poster-glow">
                            <img
                                src={movie.Poster_URL || '/placeholder.png'}
                                alt={movie.Movie_Name}
                                className="w-full aspect-[2/3] object-cover rounded-lg shadow-[0_0_15px_0_rgba(0,0,0,0.5)]"
                            />

                            {movie.Trailer_Link && (
                                <a
                                    href={movie.Trailer_Link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-lg"
                                >
                                    <div className="bg-[#FFD875] rounded-full p-3 shadow-[0_0_20px_5px_rgba(255,216,117,0.5)]">
                                        <PlayIcon className="w-10 h-10 text-slate-900" />
                                    </div>
                                    <span className="absolute bottom-6 text-white bg-black bg-opacity-60 px-4 py-1 rounded-full text-sm">Xem trailer</span>
                                </a>
                            )}
                        </div>

                        <div className="mt-4 space-y-2">
                            <div className="flex justify-center">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${statusInfo.className}`}>
                                    {statusInfo.text}
                                </span>
                            </div>

                            <div className="flex items-center justify-center mt-2">
                                <StarIcon className="w-5 h-5 text-[#FFD875] mr-1" />
                                <span className="text-white font-medium">{movie.Average_Rating || "N/A"}</span>
                                <span className="text-gray-400 text-sm ml-1">({movie.Rating_Count || 0} đánh giá)</span>
                            </div>

                            <div className="text-center text-sm text-gray-400 mt-1">
                                ID: {movie.Movie_ID}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Movie details column */}
                <motion.div
                    className="md:col-span-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                >
                    <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-xl p-6 space-y-6 relative fade-in">
                        {/* Movie title */}
                        <div>
                            <h2 className="text-3xl font-bold text-white">{movie.Movie_Name}</h2>
                            <div className="flex flex-wrap gap-2 mt-3">
                                {genres.map((genre: string, index: number) => (
                                    <span
                                        key={index}
                                        className="bg-[#FFD875]/10 text-[#FFD875] px-3 py-1 rounded-full text-sm"
                                    >
                                        {genre.trim()}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Basic info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 border-t border-b border-slate-700">
                            <div className="flex items-center">
                                <ClockIcon className="w-5 h-5 text-[#FFD875] mr-3" />
                                <div>
                                    <p className="text-gray-400 text-sm">Thời lượng</p>
                                    <p className="text-white">{movie.Duration} phút</p>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <CalendarIcon className="w-5 h-5 text-[#FFD875] mr-3" />
                                <div>
                                    <p className="text-gray-400 text-sm">Ngày khởi chiếu</p>
                                    <p className="text-white">{formatDate(movie.Release_Date)}</p>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <StarIcon className="w-5 h-5 text-[#FFD875] mr-3" />
                                <div>
                                    <p className="text-gray-400 text-sm">Giới hạn tuổi</p>
                                    <p className="text-white">{movie.Rating || "Chưa xếp hạng"}</p>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <LanguageIcon className="w-5 h-5 text-[#FFD875] mr-3" />
                                <div>
                                    <p className="text-gray-400 text-sm">Ngôn ngữ</p>
                                    <p className="text-white">{movie.Language || "Không có thông tin"}</p>
                                </div>
                            </div>
                        </div>

                        {/* Synopsis */}
                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">Nội dung</h3>
                            <p className="text-gray-300 leading-relaxed">{movie.Synopsis || "Chưa có mô tả."}</p>
                        </div>

                        {/* Cast & Crew */}
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">Đạo diễn</h3>
                                <div className="flex items-center">
                                    <UserIcon className="w-5 h-5 text-[#FFD875] mr-2" />
                                    <p className="text-gray-300">{movie.Director || "Chưa có thông tin"}</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">Diễn viên</h3>
                                <div className="flex flex-wrap gap-2">
                                    {movie.Cast ? (
                                        movie.Cast.split(',').map((actor: string, index: number) => (
                                            <span
                                                key={index}
                                                className="bg-slate-700 text-white px-3 py-1 rounded-lg text-sm flex items-center"
                                            >
                                                <UserIcon className="w-4 h-4 mr-1 text-[#FFD875]" />
                                                {actor.trim()}
                                            </span>
                                        ))
                                    ) : (
                                        <p className="text-gray-400">Chưa có thông tin diễn viên</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Additional Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-700">
                            <div>
                                <p className="text-gray-400 text-sm">Quốc gia</p>
                                <p className="text-white flex items-center">
                                    <GlobeAltIcon className="w-4 h-4 text-[#FFD875] mr-2" />
                                    {movie.Country || "Chưa có thông tin"}
                                </p>
                            </div>

                            <div>
                                <p className="text-gray-400 text-sm">Công ty sản xuất</p>
                                <p className="text-white">{movie.Production_Company || "Chưa có thông tin"}</p>
                            </div>

                            <div>
                                <p className="text-gray-400 text-sm">Ngày công chiếu</p>
                                <p className="text-white">{formatDate(movie.Premiere_Date)}</p>
                            </div>

                            <div>
                                <p className="text-gray-400 text-sm">Ngày kết thúc</p>
                                <p className="text-white">{formatDate(movie.End_Date)}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {showDeleteDialog && (
                <ConfirmDialog
                    isOpen={showDeleteDialog}
                    onClose={() => setShowDeleteDialog(false)}
                    onConfirm={confirmDelete}
                    title="Xác nhận xóa phim"
                    message={`Bạn có chắc chắn muốn xóa phim "${movie.Movie_Name}" không? Hành động này không thể hoàn tác.`}
                />
            )}
        </div>
    );
};

export default MovieDetail; 
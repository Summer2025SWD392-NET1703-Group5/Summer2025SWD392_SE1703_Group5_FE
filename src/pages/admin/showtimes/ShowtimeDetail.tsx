import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  CalendarIcon,
  ClockIcon,
  FilmIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import FullScreenLoader from '../../../components/FullScreenLoader';
import ConfirmDialog from '../../../components/admin/common/ConfirmDialog';
import '../../../components/admin/cinema-rooms/SeatMap.css';
import showtimeService from '../../../services/showtimeService';
import { cinemaRoomService } from '../../../services/cinemaRoomService';
import { toast } from 'react-hot-toast';

interface Showtime {
  id: string;
  movieTitle: string;
  moviePoster: string;
  cinemaName: string;
  roomName: string;
  date: string;
  time: string;
  duration: number;
  price: number;
  totalSeats: number;
  bookedSeats: number;
  availableSeats: number;
  status: 'scheduled' | 'hidden';
  revenue: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

const ShowtimeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showtime, setShowtime] = useState<Showtime | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  useEffect(() => {
    fetchShowtimeDetails();
  }, [id]);

  const fetchShowtimeDetails = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const data = await showtimeService.getShowtimeById(id);

      if (!data) {
        throw new Error('Không thể tải thông tin suất chiếu');
      }

      console.log('Dữ liệu showtime từ API:', data);

      // Gọi API song song để lấy thông tin chi tiết
      const promises = [];

      // Lấy thông tin chi tiết phim từ API movie/{id}
      if (data.movieId) {
        promises.push(
          showtimeService.getMovieById(data.movieId)
            .then(movie => ({ type: 'movie', data: movie }))
            .catch(error => {
              console.error('Lỗi khi lấy thông tin phim:', error);
              return { type: 'movie', data: null };
            })
        );
      } else {
        promises.push(Promise.resolve({ type: 'movie', data: null }));
      }

      // Lấy thông tin chi tiết rạp từ API /cinemas/{id}
      if (data.cinemaId) {
        promises.push(
          showtimeService.getCinemaById(data.cinemaId)
            .then(cinema => ({ type: 'cinema', data: cinema }))
            .catch(error => {
              console.error('Lỗi khi lấy thông tin rạp:', error);
              return { type: 'cinema', data: null };
            })
        );
      } else {
        promises.push(Promise.resolve({ type: 'cinema', data: null }));
      }

      // Lấy thông tin phòng chiếu
      if (data.roomId) {
        promises.push(
          cinemaRoomService.getCinemaRoomById(parseInt(data.roomId))
            .then(room => ({ type: 'room', data: room }))
            .catch(error => {
              console.error('Lỗi khi lấy thông tin phòng:', error);
              return { type: 'room', data: null };
            })
        );
      } else {
        promises.push(Promise.resolve({ type: 'room', data: null }));
      }

      // Đợi tất cả API calls hoàn thành
      const results = await Promise.all(promises);

      // Xử lý kết quả
      const movieDetails = results.find(r => r.type === 'movie')?.data;
      const cinemaDetails = results.find(r => r.type === 'cinema')?.data;
      const roomDetails = results.find(r => r.type === 'room')?.data;

      // Lấy thông tin phim từ API hoặc từ dữ liệu showtime
      const movieTitle = movieDetails?.movieName || movieDetails?.Movie_Name || movieDetails?.title ||
        data.movieTitle || data.movie?.title || 'Chưa xác định';

      // Xử lý URL poster
      let posterUrl = movieDetails?.posterURL || movieDetails?.Poster_URL || movieDetails?.poster ||
        data.movie?.poster || '';
      if (!posterUrl || posterUrl === '/placeholder.jpg') {
        posterUrl = 'https://placehold.co/300x450/darkgray/white?text=No+Image';
      } else if (!posterUrl.startsWith('http')) {
        posterUrl = `${window.location.origin}${posterUrl}`;
      }

      // Lấy tên rạp từ API hoặc fallback
      const cinemaName = cinemaDetails?.name || cinemaDetails?.Name ||
        data.cinemaName || data.cinema?.name || 'Galaxy Cinema';

      // Xử lý dữ liệu ngày giờ an toàn
      let formattedDate = '';
      let formattedTime = '';

      try {
        if (data.startTime && typeof data.startTime === 'string') {
          if (data.startTime.includes('T')) {
            const [datePart, timePart] = data.startTime.split('T');
            formattedDate = datePart;
            formattedTime = timePart.substring(0, 5);
          } else if (data.startTime.includes(':')) {
            formattedTime = data.startTime.substring(0, 5);
            formattedDate = data.showDate || new Date().toISOString().split('T')[0];
          }
        } else {
          formattedDate = data.showDate || new Date().toISOString().split('T')[0];
          formattedTime = '00:00';
        }
      } catch (error) {
        console.error('Lỗi khi xử lý thời gian:', error);
        formattedDate = new Date().toISOString().split('T')[0];
        formattedTime = '00:00';
      }

      // Xử lý createdAt và updatedAt an toàn
      let createdAt, updatedAt;
      try {
        createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
        if (isNaN(createdAt.getTime())) createdAt = new Date();
      } catch (error) {
        createdAt = new Date();
      }

      try {
        updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
        if (isNaN(updatedAt.getTime())) updatedAt = new Date();
      } catch (error) {
        updatedAt = new Date();
      }

      // Tính số ghế đã đặt và doanh thu
      const totalSeats = roomDetails?.capacity || roomDetails?.Capacity || data.totalSeats || 0;
      const bookedSeats = typeof data.bookedSeats === 'number' ? data.bookedSeats : 0;
      const availableSeats = totalSeats - bookedSeats;

      // Tính doanh thu từ giá vé
      const ticketPrice = data.price || 90000;
      const revenue = ticketPrice * bookedSeats;

      // Xử lý status an toàn
      let safeStatus: 'scheduled' | 'hidden' = 'scheduled';
      
      // Map các status từ API sang status của frontend
      const statusValue = data.status as string;
      if (statusValue === 'hidden' || statusValue === 'cancelled' || statusValue === 'completed') {
        safeStatus = 'hidden';
      } else {
        // Mặc định là scheduled cho tất cả các trường hợp khác
        safeStatus = 'scheduled';
      }

      // Chuyển đổi dữ liệu từ API sang định dạng frontend sử dụng
      const formattedShowtime: Showtime = {
        id: data.id,
        movieTitle: movieTitle,
        moviePoster: posterUrl,
        cinemaName: cinemaName,
        roomName: roomDetails?.name || roomDetails?.Name || data.roomName || data.room?.name || 'Không xác định',
        date: formattedDate,
        time: formattedTime,
        duration: movieDetails?.duration || movieDetails?.Duration || data.movie?.duration || 120,
        price: ticketPrice,
        totalSeats: totalSeats,
        bookedSeats: bookedSeats,
        availableSeats: availableSeats,
        status: safeStatus,
        revenue: revenue,
        createdAt: createdAt,
        updatedAt: updatedAt,
        createdBy: data.createdBy || 'Admin'
      };

      setShowtime(formattedShowtime);
    } catch (error) {
      console.error('Error fetching showtime details:', error);
      toast.error('Không thể tải thông tin suất chiếu');

    } finally {
      setLoading(false);
    }
  };

  const handleCancelShowtime = async () => {
    if (!id) return;
    
    try {
      const response = await showtimeService.cancelShowtime(id);
      
      if (response.success) {
        toast.success('Hủy lịch chiếu thành công');
        navigate('/admin/showtimes');
      } else {
        toast.error(response.message || 'Không thể hủy lịch chiếu');
      }
    } catch (error: any) {
      console.error('Lỗi khi hủy lịch chiếu:', error);
      toast.error(error.message || 'Đã xảy ra lỗi khi hủy lịch chiếu');
    } finally {

      setShowCancelDialog(false);
    }
  };


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'scheduled': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Đã lên lịch' },
      'hidden': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Đã ẩn' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      label: 'Không xác định'
    };

    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getOccupancyPercentage = (booked: number, total: number) => {
    return total > 0 ? Math.round((booked / total) * 100) : 0;
  };

  if (loading || !showtime) {
    return (
      <div className="flex items-center justify-center p-6 min-h-[400px]">
        <FullScreenLoader />
      </div>
    );
  }

  const occupancyPercentage = getOccupancyPercentage(showtime.bookedSeats, showtime.totalSeats);

  return (
    <div className="p-6">
      {/* Header with back button */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-2">
          <Link
            to="/admin/showtimes"
            className="flex items-center gap-1 text-gray-400 hover:text-FFD875 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Quay lại danh sách</span>
          </Link>
          {getStatusBadge(showtime.status)}
        </div>
        <h1 className="text-2xl font-bold text-white">{showtime.movieTitle}</h1>
        <p className="text-gray-400">
          {showtime.cinemaName} - {showtime.roomName}
        </p>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Movie info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Movie details */}
          <div className="bg-slate-800 rounded-lg p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <img
                src={showtime.moviePoster}
                alt={showtime.movieTitle}
                className="w-40 h-60 object-cover rounded-lg"
                onError={(e) => {
                  // Fallback image nếu URL hình ảnh không tải được
                  e.currentTarget.src = 'https://placehold.co/300x450/darkgray/white?text=No+Image';
                }}
              />
              <div className="flex-1 space-y-4">
                <h2 className="text-xl font-bold text-white">{showtime.movieTitle}</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-400">Ngày chiếu</div>
                      <div className="text-white">{formatDate(showtime.date)}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-400">Giờ chiếu</div>
                      <div className="text-white">{showtime.time} ({showtime.duration} phút)</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <BuildingOfficeIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-400">Rạp chiếu</div>
                      <div className="text-white">{showtime.cinemaName}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <FilmIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-400">Phòng chiếu</div>
                      <div className="text-white">{showtime.roomName}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Seat occupancy */}
          <div className="bg-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-medium text-white mb-4">Tình trạng ghế</h3>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <div className="text-white">
                  <span className="font-medium">{showtime.bookedSeats}</span>
                  <span className="text-gray-400"> / {showtime.totalSeats} ghế đã đặt</span>
                </div>
                <div className={`text-sm font-medium ${occupancyPercentage >= 80 ? 'text-green-400' :
                  occupancyPercentage >= 50 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                  {occupancyPercentage}%
                </div>
              </div>

              <div className="w-full bg-slate-700 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${occupancyPercentage >= 80 ? 'bg-green-400' :
                    occupancyPercentage >= 50 ? 'bg-yellow-400' : 'bg-red-400'
                    }`}
                  style={{ width: `${occupancyPercentage}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <UserGroupIcon className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-gray-400">Ghế đã đặt</div>
                  <div className="text-white">{showtime.bookedSeats}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <UserGroupIcon className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-gray-400">Ghế còn trống</div>
                  <div className="text-white">{showtime.availableSeats}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column - Actions */}
        <div className="space-y-6">
          <div className="bg-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-medium text-white mb-4">Thao tác</h3>

            <div className="space-y-3">
              <Link
                to={`/admin/showtimes/edit/${showtime.id}`}
                className="flex items-center gap-2 w-full px-4 py-2 bg-FFD875 text-black rounded-lg hover:bg-opacity-90 transition-colors btn-glow btn-yellow"
                style={{ backgroundColor: '#FFD875' }}
              >
                <PencilIcon className="w-5 h-5" />
                Chỉnh sửa lịch chiếu
              </Link>

              <button
                onClick={() => setShowCancelDialog(true)}
                className="flex items-center gap-2 w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                disabled={showtime.status === 'hidden'}
              >
                <TrashIcon className="w-5 h-5" />
                Hủy lịch chiếu
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={handleCancelShowtime}
        title="Xác nhận hủy lịch chiếu"
        message="Bạn có chắc chắn muốn hủy lịch chiếu này? Hành động này không thể hoàn tác."
        confirmText="Hủy lịch chiếu"
        cancelText="Đóng"
        type="danger"
      />
    </div>
  );
};

export default ShowtimeDetail; 
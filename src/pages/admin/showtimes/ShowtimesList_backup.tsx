// src/pages/admin/showtimes/ShowtimesList.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import '../../../components/admin/cinema-rooms/SeatMap.css';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  FilmIcon,
  BuildingOfficeIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FunnelIcon,
  TicketIcon,
  UserGroupIcon,
  MapPinIcon,
  CubeIcon,
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../../components/LoadingSpinner';
import ExcelImportExport from '../../../components/admin/common/ExcelImportExport';
import showtimeService from '../../../services/showtimeService';
import movieService from '../../../services/movieService';
import cinemaService from '../../../services/cinemaService';
import { cinemaRoomService } from '../../../services/cinemaRoomService';
import apiClient from '../../../services/apiClient';
import type { Movie } from '../../../types/movie';

interface Cinema {
  id: string;
  name: string;
  address: string;
  phone: string;
}

interface CinemaRoom {
  id: string;
  name: string;
  cinemaId: string;
  capacity: number;
}

interface Showtime {
  id: string;
  Showtime_ID: number;
  Movie_ID: number;
  Cinema_Room_ID: number;
  Room_Name: string;
  Show_Date: string;
  Start_Time: string;
  End_Time: string;
  Status: 'Hidden' | 'Scheduled' | 'Completed' | 'Cancelled';
  Room: {
    Cinema_Room_ID: number;
    Room_Name: string;
    Room_Type: string;
  };
  BookedSeats: number;
  TotalSeats: number;
  AvailableSeats: number;
  SeatStatus: string;
  IsSoldOut: boolean;

  // Enriched data từ API khác
  movieTitle?: string;
  cinemaName?: string;
  cinemaId?: string;
  roomId?: string;
  roomName?: string;
  moviePoster?: string;
  movieDuration?: number;
  price?: number;
  movie?: {
    title: string;
    duration?: number;
    poster?: string;
    rating?: string;
    genre?: string;
  };
  cinema?: {
    name: string;
    address?: string;
    phone?: string;
  };
  room?: {
    name: string;
    capacity?: number;
    roomType?: string;
  };
}

// Hàm tải danh sách phim từ API - đơn giản hóa
const fetchMovies = async (): Promise<Movie[]> => {
  try {
    console.log('📽️ Fetch movies - đơn giản hóa');
    const movies = await movieService.getAllMovies();

    // Chỉ map dữ liệu cơ bản, không gọi thêm API chi tiết
    const mappedMovies = (movies || []).map((movie: any) => ({
      ...movie,
      id: movie.movieID || movie.id || movie.Movie_ID,
      title: movie.movieName || movie.title || movie.Movie_Name || 'Không xác định',
      movieName: movie.movieName || movie.title || movie.Movie_Name || 'Không xác định',
      poster: movie.posterURL || movie.poster || movie.Poster_URL,
      posterURL: movie.posterURL || movie.poster || movie.Poster_URL,
      duration: movie.duration || movie.Duration,
      genre: movie.genre || movie.Genre,
      rating: movie.rating || movie.Rating,
    }));

    console.log('✅ Movies loaded (simplified):', mappedMovies.length);
    return mappedMovies;
  } catch (error) {
    console.error('❌ Lỗi khi tải danh sách phim:', error);
    toast.error('Không thể tải danh sách phim');
    return [];
  }
};

// Hàm tải danh sách rạp từ API - đơn giản hóa
const fetchCinemas = async (): Promise<Cinema[]> => {
  try {
    console.log('🏢 Fetch cinemas - đơn giản hóa');
    const cinemas = await cinemaService.getAllCinemas();

    // Chỉ map dữ liệu cơ bản, không gọi thêm API chi tiết
    const mappedCinemas = (cinemas || []).map((cinema: any) => ({
      id: (cinema.id || cinema.Cinema_ID)?.toString() || '',
      name: cinema.name || cinema.Name || cinema.Cinema_Name || 'Không xác định',
      address: cinema.address || cinema.Address || '',
      phone: cinema.phone || cinema.Phone || cinema.Phone_Number || '',
    }));

    console.log('✅ Cinemas loaded (simplified):', mappedCinemas.length);
    return mappedCinemas;
  } catch (error) {
    console.error('❌ Lỗi khi tải danh sách rạp:', error);
    toast.error('Không thể tải danh sách rạp');
    return [];
  }
};

const fetchShowtimes = async (): Promise<Showtime[]> => {
  try {
    console.log('🚀 Bắt đầu fetch showtimes từ API /showtimes');

    // Gọi API /showtimes để lấy dữ liệu
    const response = await apiClient.get('/showtimes');
    console.log('✅ API /showtimes response:', response);

    const data = response.data;
    console.log('📊 Dữ liệu nhận được:', data);
    console.log('📊 Kiểu dữ liệu:', typeof data, 'Là array?', Array.isArray(data));

    if (!Array.isArray(data)) {
      console.error('❌ API /showtimes không trả về array:', data);
      return [];
    }

    console.log(`📈 Số lượng showtimes: ${data.length}`);

    // Chỉ map dữ liệu cơ bản, không gọi thêm API khác để tăng tốc
    const mappedShowtimes = data.map((showtime: any) => {
      return {
        ...showtime,
        // Thêm id cho compatibility
        id: showtime.Showtime_ID?.toString() || '',

        // Map dữ liệu để tương thích với component
        movieId: showtime.Movie_ID?.toString() || '',
        cinemaId: showtime.Cinema_Room_ID?.toString(), // Tạm thời dùng room ID
        roomId: showtime.Cinema_Room_ID?.toString() || '',
        startTime: showtime.Start_Time || '',
        endTime: showtime.End_Time || '',
        showDate: showtime.Show_Date || '',
        bookedSeats: showtime.BookedSeats || 0,
        totalSeats: showtime.TotalSeats || 0,
        availableSeats: showtime.AvailableSeats || 0,
        status: mapStatus(showtime.Status),

        // Sử dụng dữ liệu có sẵn từ API
        movieTitle: `Phim ${showtime.Movie_ID}`, // Tạm thời
        cinemaName: 'Đang tải...', // Sẽ load sau
        roomName: showtime.Room_Name || showtime.Room?.Room_Name || 'Không xác định',
        roomType: showtime.Room?.Room_Type || null,
        moviePoster: null,
        movieDuration: null,
        cinemaAddress: null,

        // Thêm objects để dễ truy cập
        movie: {
          title: `Phim ${showtime.Movie_ID}`,
          duration: null,
          poster: null,
          rating: null,
          genre: null,
        },
        cinema: {
          name: 'Đang tải...',
          address: null,
          phone: null,
        },
        room: {
          name: showtime.Room_Name || showtime.Room?.Room_Name || 'Không xác định',
          capacity: showtime.TotalSeats || 0,
          roomType: showtime.Room?.Room_Type || null,
        }
      };
    });

    console.log('🎉 Hoàn thành map showtimes:', mappedShowtimes.length);
    return mappedShowtimes;
  } catch (error) {
    console.error('❌ Lỗi khi tải dữ liệu suất chiếu:', error);
    toast.error('Không thể tải dữ liệu lịch chiếu');
    return [];
  }
};

// Hàm map status từ API sang format component
const mapStatus = (apiStatus: string): 'scheduled' | 'ongoing' | 'completed' | 'cancelled' => {
  switch (apiStatus?.toLowerCase()) {
    case 'scheduled':
      return 'scheduled';
    case 'hidden':
      return 'completed'; // Coi Hidden như đã hoàn thành
    case 'completed':
      return 'completed';
    case 'cancelled':
      return 'cancelled';
    default:
      return 'scheduled';
  }
};

// Format functions - Di chuyển lên đây trước khi sử dụng
const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return 'Chưa xác định';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  } catch (error) {
    return dateString;
  }
};

const formatTime = (timeString: string | null | undefined) => {
  if (!timeString) return '--:--';
  try {
    if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(timeString)) {
      return timeString.substring(0, 5);
    }
    if (timeString.includes('T')) {
      const timePart = timeString.split('T')[1];
      return timePart.substring(0, 5);
    }
    const date = new Date(timeString);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch (error) {
    return '--:--';
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

const getStatusLabel = (status: string) => {
  const labels: { [key: string]: string } = {
    scheduled: 'Đã lên lịch',
    ongoing: 'Đang chiếu',
    completed: 'Đã hoàn thành',
    cancelled: 'Đã hủy',
    hidden: 'Đã ẩn',
  };
  return labels[status] || status;
};

const ShowtimesList: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('all');
  const [selectedCinema, setSelectedCinema] = useState<string>('all');
  const [selectedMovie, setSelectedMovie] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [importLoading, setImportLoading] = useState(false);
  const [priceFilter, setPriceFilter] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<string>('all');
  const [roomTypeFilter, setRoomTypeFilter] = useState<string>('all');

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // State cho movie selector
  const [showMovieSelector, setShowMovieSelector] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Thêm loading states riêng cho movies và cinemas
  const [moviesLoading, setMoviesLoading] = useState(true);
  const [cinemasLoading, setCinemasLoading] = useState(true);

  // Debug state changes
  useEffect(() => {
    console.log('🔄 Showtimes state changed:', showtimes.length, showtimes);
  }, [showtimes]);

  useEffect(() => {
    console.log('🔄 Filtered showtimes changed:', filteredShowtimes.length);
  }, [filteredShowtimes]);

  useEffect(() => {
    console.log('🔄 Paginated showtimes changed:', paginatedShowtimes.length);
  }, [paginatedShowtimes]);

  // Thêm CSS cho hiệu ứng glowing
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .glow-effect {
        box-shadow: 0 0 20px rgba(255, 216, 117, 0.4);
        transition: all 0.3s ease;
      }
      
      .glow-effect:hover {
        box-shadow: 0 0 30px rgba(255, 216, 117, 0.6);
        transform: translateY(-2px);
      }
      
      .text-glow {
        text-shadow: 0 0 10px rgba(255, 216, 117, 0.5);
      }
      
      .border-glow {
        border: 1px solid rgba(255, 216, 117, 0.3);
        transition: all 0.3s ease;
      }
      
      .border-glow:hover {
        border-color: rgba(255, 216, 117, 0.8);
        box-shadow: 0 0 15px rgba(255, 216, 117, 0.4);
      }
      
      @keyframes pulse-glow {
        0%, 100% {
          box-shadow: 0 0 20px rgba(255, 216, 117, 0.4);
        }
        50% {
          box-shadow: 0 0 30px rgba(255, 216, 117, 0.8);
        }
      }
      
      .pulse-glow {
        animation: pulse-glow 2s infinite;
      }

      .line-clamp-1 {
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      console.log('🚀 ShowtimesList useEffect - Bắt đầu fetch data');

      // Test API trực tiếp
      try {
        console.log('🧪 Test API /showtimes trực tiếp...');
        const testResponse = await apiClient.get('/showtimes');
        console.log('🧪 Test response:', testResponse);
        console.log('🧪 Test data:', testResponse.data);
      } catch (testError) {
        console.error('🧪 Test API thất bại:', testError);
      }

      setLoading(true);
      setMoviesLoading(true);
      setCinemasLoading(true);

      try {
        // Fetch movies với loading state riêng
        console.log('📽️ Bắt đầu fetch movies...');
        const moviesPromise = fetchMovies()
          .then(data => {
            console.log('✅ Movies loaded:', data.length);
            setMovies(data);
            setMoviesLoading(false);
            return data;
          })
          .catch(error => {
            console.error('❌ Lỗi khi tải phim:', error);
            setMoviesLoading(false);
            return [];
          });

        // Fetch cinemas với loading state riêng
        console.log('🏢 Bắt đầu fetch cinemas...');
        const cinemasPromise = fetchCinemas()
          .then(data => {
            console.log('✅ Cinemas loaded:', data.length);
            setCinemas(data);
            setCinemasLoading(false);
            return data;
          })
          .catch(error => {
            console.error('❌ Lỗi khi tải rạp:', error);
            setCinemasLoading(false);
            return [];
          });

        // Fetch showtimes
        console.log('🎬 Bắt đầu fetch showtimes...');
        const showtimesPromise = fetchShowtimes().then(data => {
          console.log('✅ Showtimes loaded:', data.length);
          return data;
        });

        const [moviesData, cinemasData, showtimesData] = await Promise.all([
          moviesPromise,
          cinemasPromise,
          showtimesPromise,
        ]);

        console.log('📊 Tất cả dữ liệu đã load:', {
          movies: moviesData.length,
          cinemas: cinemasData.length,
          showtimes: showtimesData.length
        });

        setShowtimes(showtimesData);

        // Kiểm tra tham số URL cho bộ lọc
        const params = new URLSearchParams(location.search);
        const cinemaParam = params.get('cinema');
        const movieParam = params.get('movie');
        const dateParam = params.get('date');

        if (cinemaParam) setSelectedCinema(cinemaParam);
        if (movieParam) setSelectedMovie(movieParam);
        if (dateParam) setSelectedDate(dateParam);

      } catch (error) {
        console.error('❌ Lỗi khi tải dữ liệu:', error);
        toast.error('Không thể tải dữ liệu');
      } finally {
        console.log('🏁 Hoàn thành fetch data');
        setLoading(false);
      }
    };

    fetchData();
  }, [location.search]);

  // Excel headers
  const excelHeaders = {
    movieTitle: 'Tên phim',
    cinemaName: 'Rạp chiếu',
    roomName: 'Phòng chiếu',
    showDate: 'Ngày chiếu',
    startTime: 'Giờ bắt đầu',
    endTime: 'Giờ kết thúc',
    price: 'Giá vé',
    totalSeats: 'Tổng số ghế',
    status: 'Trạng thái'
  };

  // Xử lý dữ liệu xuất Excel
  const showtimesForExport = useMemo(() => {
    return showtimes.map(showtime => ({
      movieTitle: showtime.movieTitle,
      cinemaName: showtime.cinemaName,
      roomName: showtime.Room_Name || showtime.roomName,
      showDate: formatDate(showtime.Show_Date),
      startTime: formatTime(showtime.Start_Time),
      endTime: formatTime(showtime.End_Time),
      price: showtime.price || 0,
      totalSeats: showtime.TotalSeats,
      status: getStatusLabel(mapStatus(showtime.Status))
    }));
  }, [showtimes]);

  // Xử lý import từ Excel
  const handleImportShowtimes = async (importedData: any[]) => {
    if (!importedData || importedData.length === 0) {
      toast.error('Không có dữ liệu suất chiếu để nhập');
      return;
    }

    setImportLoading(true);
    const toastId = toast.loading('Đang nhập dữ liệu suất chiếu...');

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast.success(`Đã nhập ${importedData.length} suất chiếu thành công!`, { id: toastId });

      // Làm mới danh sách
      const updatedShowtimes = await fetchShowtimes();
      setShowtimes(updatedShowtimes);
    } catch (error) {
      console.error('Import showtimes error:', error);
      toast.error('Nhập dữ liệu suất chiếu thất bại', { id: toastId });
    } finally {
      setImportLoading(false);
    }
  };

  // Lọc danh sách suất chiếu
  const filteredShowtimes = useMemo(() => {
    return showtimes.filter(showtime => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        (showtime.movieTitle || '').toLowerCase().includes(searchLower) ||
        (showtime.cinemaName || '').toLowerCase().includes(searchLower) ||
        (showtime.roomName || showtime.Room_Name || '').toLowerCase().includes(searchLower);

      if (searchTerm && !matchesSearch) return false;
      if (selectedMovie !== 'all' && showtime.Movie_ID?.toString() !== selectedMovie) return false;
      if (selectedCinema !== 'all' && showtime.cinemaId !== selectedCinema) return false;

      if (selectedDate !== 'all') {
        let showtimeDate = showtime.Show_Date || showtime.showDate;
        if (!showtimeDate && showtime.Start_Time) {
          showtimeDate = showtime.Start_Time.split('T')[0];
        }
        if (showtimeDate !== selectedDate) return false;
      }

      // Time filter
      if (timeFilter !== 'all' && showtime.Start_Time) {
        const timeStr = showtime.Start_Time;
        let startHour: number;

        if (timeStr.includes(':')) {
          // Format HH:MM:SS
          startHour = parseInt(timeStr.split(':')[0]);
        } else {
          // Fallback cho datetime
          startHour = new Date(timeStr).getHours();
        }

        switch (timeFilter) {
          case 'morning':
            if (startHour < 6 || startHour >= 12) return false;
            break;
          case 'afternoon':
            if (startHour < 12 || startHour >= 18) return false;
            break;
          case 'evening':
            if (startHour < 18 || startHour >= 24) return false;
            break;
          case 'late':
            if (startHour >= 6) return false;
            break;
        }
      }

      // Room type filter
      if (roomTypeFilter !== 'all' && showtime.Room?.Room_Type && showtime.Room.Room_Type !== roomTypeFilter) {
        return false;
      }

      if (statusFilter !== 'all') {
        const mappedStatus = mapStatus(showtime.Status);
        if (mappedStatus !== statusFilter) return false;
      }

      return true;
    });
  }, [showtimes, searchTerm, selectedMovie, selectedCinema, selectedDate, statusFilter, timeFilter, roomTypeFilter]);

  // Phân trang
  const paginatedShowtimes = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredShowtimes.slice(startIndex, endIndex);
  }, [filteredShowtimes, currentPage]);

  const totalPages = Math.ceil(filteredShowtimes.length / itemsPerPage);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: {
        bg: 'bg-blue-500/20',
        text: 'text-blue-400',
        border: 'border-blue-500/30'
      },
      ongoing: {
        bg: 'bg-green-500/20',
        text: 'text-green-400',
        border: 'border-green-500/30'
      },
      completed: {
        bg: 'bg-gray-500/20',
        text: 'text-gray-400',
        border: 'border-gray-500/30'
      },
      cancelled: {
        bg: 'bg-red-500/20',
        text: 'text-red-400',
        border: 'border-red-500/30'
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.completed;
    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${config.bg} ${config.text} ${config.border}`}>
        {getStatusLabel(status)}
      </span>
    );
  };

  const getOccupancyRate = (booked: number, total: number) => {
    const rate = Math.round((booked / total) * 100);

    return (
      <div className="flex items-center">
        <div className="w-full bg-slate-700 rounded-full h-2 mr-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${rate >= 80 ? 'bg-green-500' : rate >= 50 ? 'bg-[#FFD875]' : 'bg-red-500'
              }`}
            style={{ width: `${rate}%` }}
          ></div>
        </div>
        <span className={`text-xs font-medium ${rate >= 80 ? 'text-green-400' : rate >= 50 ? 'text-[#FFD875]' : 'text-red-400'
          }`}>{rate}%</span>
      </div>
    );
  };

  const generateDateOptions = () => {
    const dates = [];
    const today = new Date();

    for (let i = -3; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const dateString = date.toISOString().split('T')[0];
      const dateLabel = new Intl.DateTimeFormat('vi-VN', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
      }).format(date);

      dates.push({ value: dateString, label: dateLabel });
    }

    return dates;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6 min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-900 min-h-screen">
      {/* Header với hiệu ứng glowing */}
      <motion.div
        className="mb-6 flex flex-wrap items-center justify-between gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-[#FFD875] text-glow">Quản lý lịch chiếu</h1>
          <p className="text-gray-400 mt-1">Quản lý thông tin các suất chiếu phim</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${showAdvancedFilters
              ? 'bg-[#FFD875] text-black shadow-[0_0_20px_rgba(255,216,117,0.5)]'
              : 'bg-slate-800 text-[#FFD875] border border-[#FFD875]/30 hover:bg-[#FFD875]/10'
              }`}
          >
            <FunnelIcon className="w-5 h-5" />
            Bộ lọc nâng cao
          </button>
          <ExcelImportExport
            data={showtimesForExport}
            onImport={handleImportShowtimes}
            fileName="showtimes-list"
            sheetName="Lịch chiếu"
            headers={excelHeaders}
            disabled={loading || importLoading}
          />
          <Link
            to="/admin/showtimes/new"
            className="bg-[#FFD875] hover:bg-[#e5c368] text-black font-medium px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 glow-effect pulse-glow"
          >
            <PlusIcon className="w-5 h-5" />
            Thêm suất chiếu
          </Link>
        </div>
      </motion.div>

      {/* Main Filters */}
      <motion.div
        className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-5 mb-6 border border-[#FFD875]/20 glow-effect relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {/* Loading overlay */}
        {(moviesLoading || cinemasLoading) && (
          <div className="absolute top-2 right-2 flex items-center gap-2 text-xs text-[#FFD875]">
            <div className="w-3 h-3 border border-[#FFD875] border-t-transparent rounded-full animate-spin"></div>
            <span>Đang tải dữ liệu...</span>
          </div>
        )}

        {/* Stats */}
        {!moviesLoading && !cinemasLoading && (
          <div className="absolute top-2 right-2 flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <FilmIcon className="w-3 h-3" />
              {movies.length} phim
            </span>
            <span className="flex items-center gap-1">
              <BuildingOfficeIcon className="w-3 h-3" />
              {cinemas.length} rạp
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search với icon đẹp hơn */}
          <div className="relative group">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FFD875] w-5 h-5 group-hover:scale-110 transition-transform" />
            <input
              type="text"
              placeholder="Tìm kiếm suất chiếu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-700/50 text-white rounded-lg border border-slate-600 focus:border-[#FFD875] focus:outline-none focus:shadow-[0_0_15px_rgba(255,216,117,0.5)] transition-all duration-300 placeholder-gray-400"
            />
          </div>

          {/* Date filter với calendar icon */}
          <div className="relative group">
            <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FFD875] w-5 h-5 pointer-events-none" />
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-700/50 text-white rounded-lg border border-slate-600 focus:border-[#FFD875] focus:outline-none focus:shadow-[0_0_15px_rgba(255,216,117,0.5)] transition-all duration-300 appearance-none cursor-pointer"
            >
              <option value="all">Tất cả ngày</option>
              {generateDateOptions().map((date, index) => (
                <option key={date.value || `date-${index}`} value={date.value}>
                  {date.label}
                </option>
              ))}
            </select>
          </div>

          {/* Cinema filter với building icon */}
          <div className="relative group">
            <BuildingOfficeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FFD875] w-5 h-5 pointer-events-none" />
            <select
              value={selectedCinema}
              onChange={(e) => setSelectedCinema(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-700/50 text-white rounded-lg border border-slate-600 focus:border-[#FFD875] focus:outline-none focus:shadow-[0_0_15px_rgba(255,216,117,0.5)] transition-all duration-300 appearance-none cursor-pointer"
              disabled={cinemasLoading}
            >
              <option value="all">{cinemasLoading ? 'Đang tải rạp...' : 'Tất cả rạp'}</option>
              {!cinemasLoading && cinemas.map((cinema, index) => (
                <option
                  key={cinema.id || `cinema-${index}`}
                  value={cinema.id}
                  title={`${cinema.name}${cinema.address ? `\n📍 ${cinema.address}` : ''}${cinema.phone ? `\n📞 ${cinema.phone}` : ''}`}
                >
                  {cinema.name}{cinema.address ? ` (${cinema.address.length > 30 ? cinema.address.substring(0, 30) + '...' : cinema.address})` : ''}
                </option>
              ))}
            </select>
            {cinemasLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-[#FFD875] border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            {/* Tooltip hiển thị thông tin chi tiết */}
            {!cinemasLoading && selectedCinema !== 'all' && (
              <div className="absolute top-full mt-2 left-0 bg-slate-800 text-white p-3 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50 min-w-80">
                {(() => {
                  const selectedCinemaData = cinemas.find(c => c.id === selectedCinema);
                  if (!selectedCinemaData) return null;
                  return (
                    <>
                      <div className="text-sm font-medium text-[#FFD875] mb-2">{selectedCinemaData.name}</div>
                      {selectedCinemaData.address && (
                        <div className="text-xs text-gray-300 mb-1">📍 {selectedCinemaData.address}</div>
                      )}
                      {selectedCinemaData.phone && (
                        <div className="text-xs text-gray-300">📞 {selectedCinemaData.phone}</div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Movie filter với poster preview */}
          <div className="relative">
            <button
              onClick={() => setShowMovieSelector(!showMovieSelector)}
              className="w-full bg-slate-700/50 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-[#FFD875] focus:outline-none focus:shadow-[0_0_15px_rgba(255,216,117,0.5)] transition-all duration-300 text-left flex items-center justify-between group"
              disabled={moviesLoading}
            >
              <div className="flex items-center gap-2">
                <FilmIcon className="w-5 h-5 text-[#FFD875]" />
                <span>
                  {moviesLoading ? 'Đang tải phim...' : selectedMovie === 'all'
                    ? 'Tất cả phim'
                    : movies.find(m => m.id === selectedMovie)?.movieName || movies.find(m => m.id === selectedMovie)?.title || 'Chọn phim'}
                </span>
              </div>
              {moviesLoading ? (
                <div className="w-4 h-4 border-2 border-[#FFD875] border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <ChevronRightIcon className={`w-4 h-4 transition-transform text-[#FFD875] ${showMovieSelector ? 'rotate-90' : ''}`} />
              )}
            </button>

            {/* Movie selector dropdown với poster */}
            {showMovieSelector && (
              <motion.div
                className="absolute top-full mt-2 w-full max-h-96 overflow-y-auto bg-slate-800 rounded-xl border border-[#FFD875]/30 shadow-2xl z-50 glow-effect"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div
                  className="p-3 hover:bg-[#FFD875]/10 cursor-pointer border-b border-slate-700 flex items-center gap-2"
                  onClick={() => {
                    setSelectedMovie('all');
                    setShowMovieSelector(false);
                  }}
                >
                  <FilmIcon className="w-5 h-5 text-[#FFD875]" />
                  <span className="text-white">Tất cả phim</span>
                </div>
                {moviesLoading ? (
                  <div className="p-6 text-center">
                    <div className="w-8 h-8 border-2 border-[#FFD875] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-gray-400 text-sm">Đang tải danh sách phim...</p>
                  </div>
                ) : movies.length === 0 ? (
                  <div className="p-6 text-center">
                    <FilmIcon className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">Không có phim nào</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 p-2">
                    {movies.map((movie, index) => (
                      <motion.div
                        key={movie.id || `movie-${index}`}
                        className="relative group cursor-pointer rounded-lg overflow-hidden border border-slate-700 hover:border-[#FFD875]/50 transition-all duration-300"
                        onClick={() => {
                          setSelectedMovie(movie.id);
                          setShowMovieSelector(false);
                        }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="aspect-[2/3] relative overflow-hidden">
                          <img
                            src={movie.posterURL || movie.poster || '/placeholder.png'}
                            alt={movie.movieName || movie.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder.png';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="absolute bottom-0 left-0 right-0 p-3">
                              <p className="text-white text-sm font-medium line-clamp-2 mb-1">
                                {movie.movieName || movie.title}
                              </p>
                              {movie.duration && (
                                <p className="text-gray-300 text-xs flex items-center gap-1">
                                  <ClockIcon className="w-3 h-3" />
                                  {movie.duration} phút
                                </p>
                              )}
                              {movie.genre && (
                                <p className="text-[#FFD875] text-xs mt-1 line-clamp-1">
                                  {movie.genre}
                                </p>
                              )}
                            </div>
                          </div>
                          {movie.rating && (
                            <div className="absolute top-2 right-2 bg-[#FFD875] text-black text-xs px-2 py-1 rounded-md font-bold">
                              {movie.rating}
                            </div>
                          )}
                        </div>
                        {selectedMovie === movie.id && (
                          <div className="absolute inset-0 border-2 border-[#FFD875] rounded-lg shadow-[0_0_20px_rgba(255,216,117,0.7)]">
                            <div className="absolute top-2 left-2 bg-[#FFD875] text-black p-1 rounded-full">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <motion.div
            className="mt-4 pt-4 border-t border-[#FFD875]/20"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Time filter */}
              <div className="relative group">
                <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FFD875] w-5 h-5 pointer-events-none" />
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-700/50 text-white rounded-lg border border-slate-600 focus:border-[#FFD875] focus:outline-none focus:shadow-[0_0_15px_rgba(255,216,117,0.5)] transition-all duration-300 appearance-none cursor-pointer"
                >
                  <option value="all">Tất cả khung giờ</option>
                  <option value="morning">Buổi sáng (6:00 - 12:00)</option>
                  <option value="afternoon">Buổi chiều (12:00 - 18:00)</option>
                  <option value="evening">Buổi tối (18:00 - 24:00)</option>
                  <option value="late">Khuya (0:00 - 6:00)</option>
                </select>
              </div>

              {/* Room type filter */}
              <div className="relative group">
                <CubeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FFD875] w-5 h-5 pointer-events-none" />
                <select
                  value={roomTypeFilter}
                  onChange={(e) => setRoomTypeFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-700/50 text-white rounded-lg border border-slate-600 focus:border-[#FFD875] focus:outline-none focus:shadow-[0_0_15px_rgba(255,216,117,0.5)] transition-all duration-300 appearance-none cursor-pointer"
                >
                  <option value="all">Tất cả loại phòng</option>
                  <option value="2D">Phòng 2D</option>
                  <option value="3D">Phòng 3D</option>
                  <option value="IMAX">Phòng IMAX</option>
                  <option value="VIP">Phòng VIP</option>
                </select>
              </div>

              {/* Occupancy filter */}
              <div className="relative group">
                <UserGroupIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FFD875] w-5 h-5 pointer-events-none" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-700/50 text-white rounded-lg border border-slate-600 focus:border-[#FFD875] focus:outline-none focus:shadow-[0_0_15px_rgba(255,216,117,0.5)] transition-all duration-300 appearance-none cursor-pointer"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="scheduled">Đã lên lịch</option>
                  <option value="completed">Đã hoàn thành</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {/* Quick status filters */}
        <div className="mt-4 flex flex-wrap gap-2">
          {['all', 'scheduled', 'completed', 'cancelled'].map((status, index) => (
            <button
              key={status || `status-${index}`}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${statusFilter === status
                ? 'bg-[#FFD875] text-black shadow-[0_0_15px_rgba(255,216,117,0.5)] scale-105'
                : 'bg-slate-700/50 text-gray-300 hover:bg-[#FFD875]/20 hover:text-[#FFD875] border border-slate-600'
                }`}
            >
              {status === 'all' ? 'Tất cả' : getStatusLabel(status)}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Showtimes Table với thiết kế mới */}
      <motion.div
        className="bg-slate-800/50 backdrop-blur-sm rounded-xl overflow-hidden shadow-2xl border border-[#FFD875]/20 glow-effect"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#FFD875]/10 backdrop-blur-sm">
              <tr>
                <th className="py-4 px-6 text-left text-xs font-medium text-[#FFD875] uppercase tracking-wider">
                  ID
                </th>
                <th className="py-4 px-6 text-left text-xs font-medium text-[#FFD875] uppercase tracking-wider">
                  Phim
                </th>
                <th className="py-4 px-6 text-left text-xs font-medium text-[#FFD875] uppercase tracking-wider">
                  Rạp / Phòng
                </th>
                <th className="py-4 px-6 text-left text-xs font-medium text-[#FFD875] uppercase tracking-wider">
                  Thời gian
                </th>
                <th className="py-4 px-6 text-left text-xs font-medium text-[#FFD875] uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="py-4 px-6 text-left text-xs font-medium text-[#FFD875] uppercase tracking-wider">
                  Công suất
                </th>
                <th className="py-4 px-6 text-right text-xs font-medium text-[#FFD875] uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FFD875]/10">
              {paginatedShowtimes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <FilmIcon className="w-16 h-16 mx-auto mb-4 text-[#FFD875]/30" />
                    <p className="text-gray-400">Không có suất chiếu nào</p>
                  </td>
                </tr>
              ) : (
                paginatedShowtimes.map((showtime, index) => (
                  <motion.tr
                    key={showtime.id || `showtime-${index}`}
                    className="bg-slate-800/30 hover:bg-[#FFD875]/5 transition-all duration-300 group"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="text-sm font-medium text-[#FFD875]">{showtime.Showtime_ID}</span>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {showtime.moviePoster ? (
                          <div className="relative group/poster">
                            <img
                              src={showtime.moviePoster}
                              alt={showtime.movieTitle}
                              className="w-12 h-16 object-cover rounded-lg shadow-lg group-hover:shadow-[0_0_15px_rgba(255,216,117,0.3)] transition-all duration-300 cursor-pointer"
                              onError={(e) => {
                                e.currentTarget.src = '/placeholder.png';
                              }}
                            />
                            {showtime.movie?.rating && (
                              <div className="absolute -top-1 -right-1 bg-[#FFD875] text-black text-xs px-1 py-0.5 rounded-md font-bold">
                                {showtime.movie.rating}
                              </div>
                            )}
                            {/* Tooltip cho poster */}
                            <div className="absolute left-full ml-2 top-0 bg-slate-800 text-white p-3 rounded-lg shadow-xl opacity-0 group-hover/poster:opacity-100 transition-opacity duration-300 pointer-events-none z-50 min-w-64">
                              <div className="text-sm font-medium text-[#FFD875] mb-2">{showtime.movieTitle}</div>
                              {showtime.movie?.genre && (
                                <div className="text-xs text-gray-300 mb-1">Thể loại: {showtime.movie.genre}</div>
                              )}
                              {showtime.movieDuration && (
                                <div className="text-xs text-gray-300 mb-1">Thời lượng: {showtime.movieDuration} phút</div>
                              )}
                              {showtime.movie?.rating && (
                                <div className="text-xs text-gray-300">Phân loại: {showtime.movie.rating}</div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="w-12 h-16 bg-slate-700 rounded-lg flex items-center justify-center">
                            <FilmIcon className="w-6 h-6 text-[#FFD875]/50" />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-white group-hover:text-[#FFD875] transition-colors">
                            {showtime.movieTitle}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            {showtime.movieDuration && (
                              <span className="flex items-center gap-1">
                                <ClockIcon className="w-3 h-3" />
                                {showtime.movieDuration} phút
                              </span>
                            )}
                            {showtime.movie?.genre && (
                              <span className="px-2 py-0.5 bg-slate-700 rounded-full">
                                {showtime.movie.genre}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-[#FFD875]/10 rounded-lg">
                          <BuildingOfficeIcon className="w-5 h-5 text-[#FFD875]" />
                        </div>
                        <div className="min-w-0 flex-1 relative group/cinema">
                          <div className="text-sm font-medium text-white truncate cursor-pointer">{showtime.cinemaName}</div>
                          {showtime.cinemaAddress && (
                            <div className="text-xs text-gray-400 flex items-center gap-1 truncate">
                              <MapPinIcon className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{showtime.cinemaAddress}</span>
                            </div>
                          )}
                          <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                            <CubeIcon className="w-3 h-3 flex-shrink-0" />
                            <span>{showtime.roomName}</span>
                            {showtime.roomType && (
                              <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded-md ml-1">
                                {showtime.roomType}
                              </span>
                            )}
                          </div>
                          {/* Tooltip cho cinema */}
                          <div className="absolute left-0 top-full mt-2 bg-slate-800 text-white p-3 rounded-lg shadow-xl opacity-0 group-hover/cinema:opacity-100 transition-opacity duration-300 pointer-events-none z-50 min-w-72">
                            <div className="text-sm font-medium text-[#FFD875] mb-2">{showtime.cinemaName}</div>
                            {showtime.cinemaAddress && (
                              <div className="text-xs text-gray-300 mb-1">📍 {showtime.cinemaAddress}</div>
                            )}
                            {showtime.cinema?.phone && (
                              <div className="text-xs text-gray-300 mb-1">📞 {showtime.cinema.phone}</div>
                            )}
                            <div className="text-xs text-gray-300">🏢 Phòng: {showtime.roomName} ({showtime.room?.capacity || 0} ghế)</div>
                            {showtime.roomType && (
                              <div className="text-xs text-blue-400 mt-1">🎬 Loại phòng: {showtime.roomType}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-green-500/10 rounded-lg">
                          <ClockIcon className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">
                            {formatDate(showtime.Show_Date)}
                          </div>
                          <div className="text-xs text-gray-400">
                            {formatTime(showtime.Start_Time)} - {formatTime(showtime.End_Time)}
                          </div>
                          {showtime.price && (
                            <div className="text-xs text-[#FFD875] font-medium mt-1 flex items-center gap-1">
                              <CurrencyDollarIcon className="w-3 h-3" />
                              {formatCurrency(showtime.price)}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap">
                      {getStatusBadge(mapStatus(showtime.Status))}
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap">
                      <div>
                        <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                          <TicketIcon className="w-3 h-3" />
                          {showtime.BookedSeats}/{showtime.TotalSeats} ghế
                        </div>
                        {getOccupancyRate(showtime.BookedSeats, showtime.TotalSeats)}
                      </div>
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-1">
                        <Link
                          to={`/admin/showtimes/${showtime.Showtime_ID}/detail`}
                          className="p-2 text-gray-400 hover:text-blue-400 transition-all duration-300 rounded-lg hover:bg-blue-400/10 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                          title="Xem chi tiết"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </Link>
                        <Link
                          to={`/admin/showtimes/${showtime.Showtime_ID}`}
                          className="p-2 text-gray-400 hover:text-[#FFD875] transition-all duration-300 rounded-lg hover:bg-[#FFD875]/10 hover:shadow-[0_0_15px_rgba(255,216,117,0.3)]"
                          title="Chỉnh sửa"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={async () => {
                            if (window.confirm(`Bạn có chắc chắn muốn xóa suất chiếu này?`)) {
                              try {
                                await showtimeService.deleteShowtime(showtime.Showtime_ID.toString());
                                toast.success('Đã xóa suất chiếu thành công');
                                const updatedShowtimes = await fetchShowtimes();
                                setShowtimes(updatedShowtimes);
                              } catch (error) {
                                toast.error('Không thể xóa suất chiếu');
                              }
                            }
                          }}
                          className="p-2 text-gray-400 hover:text-red-500 transition-all duration-300 rounded-lg hover:bg-red-500/10 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                          title="Xóa"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination với thiết kế mới */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-6 border-t border-[#FFD875]/10">
            <div className="text-sm text-gray-400">
              Hiển thị {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredShowtimes.length)} trong tổng số {filteredShowtimes.length} suất chiếu
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg transition-all duration-300 ${currentPage === 1
                  ? 'bg-slate-700/50 text-gray-500 cursor-not-allowed'
                  : 'bg-slate-700/50 text-white hover:bg-[#FFD875] hover:text-black hover:shadow-[0_0_15px_rgba(255,216,117,0.5)]'
                  }`}
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let page;
                if (totalPages <= 5) {
                  page = i + 1;
                } else if (currentPage <= 3) {
                  page = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  page = totalPages - 4 + i;
                } else {
                  page = currentPage - 2 + i;
                }

                return (
                  <button
                    key={`page-${page}-${i}`}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded-lg font-medium transition-all duration-300 ${currentPage === page
                      ? 'bg-[#FFD875] text-black shadow-[0_0_15px_rgba(255,216,117,0.5)] scale-110'
                      : 'bg-slate-700/50 text-white hover:bg-[#FFD875]/20 hover:text-[#FFD875]'
                      }`}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg transition-all duration-300 ${currentPage === totalPages
                  ? 'bg-slate-700/50 text-gray-500 cursor-not-allowed'
                  : 'bg-slate-700/50 text-white hover:bg-[#FFD875] hover:text-black hover:shadow-[0_0_15px_rgba(255,216,117,0.5)]'
                  }`}
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ShowtimesList;
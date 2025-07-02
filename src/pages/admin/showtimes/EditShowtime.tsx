// src/pages/admin/showtimes/EditShowtime.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import '../../../components/admin/cinema-rooms/SeatMap.css';
import {
  FilmIcon,
  BuildingOfficeIcon,
  ClockIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import showtimeService from '../../../services/showtimeService';
import { movieService } from '../../../services/movieService';
import { cinemaRoomService } from '../../../services/cinemaRoomService';
import apiClient from '../../../services/apiClient';
import { useAuth } from '../../../contexts/SimpleAuthContext';

interface Movie {
  id: string;
  title: string;
  poster: string;
  duration: number;
  releaseDate: string;
  status?: string;
}

interface Cinema {
  id: string;
  name: string;
  address: string;
}

interface CinemaRoom {
  id: string;
  name: string;
  cinemaId: string;
  capacity: number;
}

interface Showtime {
  id: string;
  movieId: string;
  movieTitle: string;
  cinemaId: string;
  cinemaName: string;
  roomId: string;
  roomName: string;
  startTime: string;
  endTime: string;
  bookedSeats: number;
  totalSeats: number;
  status: 'scheduled' | 'completed';
}

// Mock API functions
const fetchMovies = async (): Promise<Movie[]> => {
  try {
    console.log('EditShowtime - Đang tải danh sách phim từ API');

    // Thử lấy danh sách phim sắp chiếu trước
    try {
      const response = await fetch('/api/movies/coming-soon');
      if (response.ok) {
        const data = await response.json();
        console.log('Dữ liệu phim sắp chiếu từ API:', data);

        const moviesData = data.data || data;
        if (Array.isArray(moviesData) && moviesData.length > 0) {
          // Chuyển đổi dữ liệu phim sang định dạng chuẩn
          const processedMovies = moviesData.map((movie: any, index: number) => {
            // Xác định ID phim
            let movieId = '';
            if (movie.Movie_ID !== undefined) movieId = String(movie.Movie_ID);
            else if (movie.id !== undefined) movieId = String(movie.id);
            else if (movie.movieId !== undefined) movieId = String(movie.movieId);

            return {
              id: movieId,
              title: movie.Movie_Name || movie.title || movie.movieName || movie.name || `Phim không tên ${index + 1}`,
              poster: movie.Poster_URL || movie.poster || 'https://placehold.co/300x450?text=No+Image',
              duration: movie.Duration || movie.duration || 120,
              releaseDate: movie.Release_Date || movie.releaseDate || new Date().toISOString().split('T')[0],
              status: movie.Status || movie.status || 'Coming Soon'
            };
          });

          console.log('Danh sách phim sắp chiếu đã xử lý:', processedMovies);
          return processedMovies;
        }
      }
    } catch (error) {
      console.error('Lỗi khi lấy phim sắp chiếu:', error);
    }

    // Nếu không lấy được phim đang chiếu, lấy tất cả phim và lọc
    const moviesResponse = await movieService.getAllMovies();
    console.log('Dữ liệu tất cả phim từ API:', moviesResponse);

    // Kiểm tra xem dữ liệu trả về có đúng định dạng không
    if (!Array.isArray(moviesResponse)) {
      console.error('Dữ liệu phim không phải là mảng:', moviesResponse);
      throw new Error('Định dạng dữ liệu phim không hợp lệ');
    }

    // Chuyển đổi dữ liệu phim sang định dạng chuẩn
    const processedMovies = moviesResponse.map((movie: any, index: number) => {
      // Xác định ID phim
      let movieId = '';
      if (movie.Movie_ID !== undefined) movieId = String(movie.Movie_ID);
      else if (movie.id !== undefined) movieId = String(movie.id);
      else if (movie.movieId !== undefined) movieId = String(movie.movieId);

      // Xác định trạng thái phim
      let status = movie.Status || movie.status || '';
      status = status.toLowerCase();

      return {
        id: movieId,
        title: movie.Movie_Name || movie.title || movie.movieName || movie.name || `Phim không tên ${index + 1}`,
        poster: movie.Poster_URL || movie.poster || 'https://placehold.co/300x450?text=No+Image',
        duration: movie.Duration || movie.duration || 120,
        releaseDate: movie.Release_Date || movie.releaseDate || new Date().toISOString().split('T')[0],
        status: status
      };
    });

    // Lọc chỉ lấy phim sắp chiếu
    const comingSoonMovies = processedMovies.filter(movie => {
      const status = (movie.status || '').toLowerCase();
      return status === 'coming soon' || status === 'coming-soon' || status === 'comingsoon';
    });

    console.log('Danh sách phim sắp chiếu đã lọc:', comingSoonMovies);
    return comingSoonMovies.length > 0 ? comingSoonMovies : processedMovies;
  } catch (error) {
    console.error('Error fetching movies:', error);
    toast.error('Không thể tải danh sách phim');

    // Trả về dữ liệu mẫu nếu API lỗi
    return [
      {
        id: '1',
        title: 'Avengers: Endgame',
        poster: 'https://placehold.co/300x450?text=Avengers+Endgame',
        duration: 181,
        releaseDate: '2023-04-26',
        status: 'Coming Soon'
      },
      {
        id: '2',
        title: 'Spider-Man: No Way Home',
        poster: 'https://placehold.co/300x450?text=Spider-Man',
        duration: 148,
        releaseDate: '2023-12-17',
        status: 'Coming Soon'
      }
    ];
  }
};

const fetchCinemas = async (): Promise<Cinema[]> => {
  try {
    console.log('EditShowtime - Đang tải danh sách rạp từ API');

    // Thử lấy danh sách rạp đang hoạt động từ API
    try {
      const response = await fetch('/api/cinemas/active');
      if (response.ok) {
        const data = await response.json();
        console.log('Dữ liệu rạp từ API:', data);

        const cinemasData = data.data || data;
        if (Array.isArray(cinemasData) && cinemasData.length > 0) {
          // Chuyển đổi dữ liệu rạp sang định dạng chuẩn
          const processedCinemas = cinemasData.map((cinema: any, index: number) => {
            // Xác định ID rạp
            let cinemaId = '';
            if (cinema.Cinema_ID !== undefined) cinemaId = String(cinema.Cinema_ID);
            else if (cinema.id !== undefined) cinemaId = String(cinema.id);
            else if (cinema.cinemaId !== undefined) cinemaId = String(cinema.cinemaId);

            return {
              id: cinemaId,
              name: cinema.Cinema_Name || cinema.name || cinema.cinemaName || `Rạp ${index + 1}`,
              address: cinema.Address || cinema.address || '',
            };
          });

          console.log('Danh sách rạp đã xử lý:', processedCinemas);
          return processedCinemas;
        }
      }
    } catch (error) {
      console.error('Lỗi khi lấy rạp từ API:', error);
    }

    // Nếu không lấy được từ API, sử dụng service
    const cinemasMap = await showtimeService.getCinemas();
    const cinemas = Array.from(cinemasMap.values()).map((cinema: any) => ({
      id: cinema.id,
      name: cinema.name,
      address: cinema.address,
    }));

    console.log('Danh sách rạp từ service:', cinemas);
    return cinemas;
  } catch (error) {
    console.error('Error fetching cinemas:', error);
    toast.error('Không thể tải danh sách rạp');

    // Trả về dữ liệu mẫu nếu API lỗi
    return [
      {
        id: '1',
        name: 'Galaxy Nguyễn Du',
        address: '116 Nguyễn Du, Quận 1, TP.HCM',
      },
      {
        id: '2',
        name: 'Galaxy Tân Bình',
        address: '246 Nguyễn Hồng Đào, Tân Bình, TP.HCM',
      },
      {
        id: '3',
        name: 'Galaxy Kinh Dương Vương',
        address: '718bis Kinh Dương Vương, Quận 6, TP.HCM',
      },
    ];
  }
};

const fetchRooms = async (cinemaId: string): Promise<CinemaRoom[]> => {
  try {
    // Sử dụng apiClient để gọi API lấy phòng theo rạp
    try {
      const response = await apiClient.get(`/cinemas/${cinemaId}/rooms`);
      let roomsData = [];

      // Xử lý các định dạng phản hồi khác nhau
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        roomsData = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        roomsData = response.data;
      } else if (response.data && response.data.success && response.data.data) {
        roomsData = response.data.data;
      }

      if (roomsData.length > 0) {
        const processedRooms = roomsData.map((room: any, index: number) => {
          // Xác định ID phòng
          let roomId = '';
          if (room.Cinema_Room_ID !== undefined) roomId = String(room.Cinema_Room_ID);
          else if (room.id !== undefined) roomId = String(room.id);
          else if (room.roomId !== undefined) roomId = String(room.roomId);
          else roomId = String(index + 1);

          // Xác định sức chứa
          let capacity = 48;
          if (room.Seat_Quantity !== undefined) capacity = Number(room.Seat_Quantity);
          else if (room.capacity !== undefined) capacity = Number(room.capacity);
          else if (room.Capacity !== undefined) capacity = Number(room.Capacity);

          return {
            id: roomId,
            name: room.Room_Name || room.name || room.roomName || `Phòng ${index + 1}`,
            cinemaId: String(cinemaId),
            capacity: isNaN(capacity) ? 48 : capacity,
          };
        });

        return processedRooms;
      }
    } catch (error) {
      console.error('Lỗi API /cinemas/{id}/rooms:', error);
    }

    // Thử endpoint khác: /cinema-rooms/cinema/{id}
    try {
      const response = await apiClient.get(`/cinema-rooms/cinema/${cinemaId}`);
      let roomsData = [];

      if (response.data && Array.isArray(response.data)) {
        roomsData = response.data;
      } else if (response.data && response.data.data) {
        roomsData = response.data.data;
      }

      if (roomsData.length > 0) {
        const processedRooms = roomsData.map((room: any, index: number) => ({
          id: room.id || room.Cinema_Room_ID || String(index + 1),
          name: room.name || room.Room_Name || `Phòng ${index + 1}`,
          cinemaId: String(cinemaId),
          capacity: room.capacity || room.Seat_Quantity || 48,
        }));

        return processedRooms;
      }
    } catch (error) {
      console.error('Lỗi API /cinema-rooms/cinema/{id}:', error);
    }

    // Sử dụng service nếu API không thành công
    try {
      const rooms = await cinemaRoomService.getRoomsByCinemaId(Number(cinemaId));
      if (Array.isArray(rooms) && rooms.length > 0) {
        const processedRooms = rooms.map((room: any, index: number) => ({
          id: room.id || String(index + 1),
          name: room.name || `Phòng ${index + 1}`,
          cinemaId: String(cinemaId),
          capacity: room.capacity || 48,
        }));

        return processedRooms;
      }
    } catch (error) {
      console.error('Lỗi service:', error);
    }

    // Trả về dữ liệu mẫu
    return [
      { id: '1', name: 'Phòng chiếu 1', cinemaId, capacity: 120 },
      { id: '2', name: 'Phòng chiếu 2', cinemaId, capacity: 80 },
      { id: '3', name: 'Phòng chiếu 3', cinemaId, capacity: 100 },
      { id: '4', name: 'Phòng chiếu 4', cinemaId, capacity: 150 },
    ];
  } catch (error) {
    console.error(`Error fetching rooms:`, error);
    toast.error('Không thể tải danh sách phòng chiếu');

    return [
      { id: '1', name: 'Phòng chiếu 1', cinemaId, capacity: 120 },
      { id: '2', name: 'Phòng chiếu 2', cinemaId, capacity: 80 },
    ];
  }
};

const fetchShowtime = async (id: string): Promise<Showtime> => {
  try {
    const data = await showtimeService.getShowtimeById(id);

    if (!data) {
      throw new Error('Không nhận được dữ liệu từ API');
    }

    // Xử lý các trường dữ liệu
    const movieId = data.movieId?.toString() || '';
    const cinemaId = data.cinemaId?.toString() || '';
    const roomId = data.roomId?.toString() || '';

    // Fetch thông tin chi tiết phim, rạp, phòng
    let movieTitle = 'Không xác định';
    let cinemaName = 'Không xác định';
    let roomName = 'Không xác định';

    try {
      // Fetch thông tin phim
      if (movieId) {
        try {
          const movieDetails = await showtimeService.getMovieById(movieId);
          if (movieDetails) {
            movieTitle = movieDetails.movieName || movieDetails.Movie_Name || movieDetails.title || movieTitle;
          }
        } catch (error) {
          movieTitle = data.movie?.title || data.movieTitle || movieTitle;
        }
      }

      // Fetch thông tin rạp
      if (cinemaId) {
        try {
          const cinemaDetails = await showtimeService.getCinemaById(cinemaId);
          if (cinemaDetails) {
            cinemaName = cinemaDetails.name || cinemaDetails.Name || cinemaDetails.Cinema_Name || cinemaName;
          }
        } catch (error) {
          cinemaName = data.cinema?.name || data.cinemaName || cinemaName;
        }
      }

      // Fetch thông tin phòng
      if (roomId) {
        try {
          const roomDetails = await cinemaRoomService.getCinemaRoomById(Number(roomId));
          if (roomDetails) {
            roomName = roomDetails.name || roomDetails.Name || roomDetails.Room_Name || roomName;
          }
        } catch (error) {
          roomName = data.room?.name || data.roomName || roomName;
        }
      }
    } catch (error) {
      movieTitle = data.movie?.title || data.movieTitle || movieTitle;
      cinemaName = data.cinema?.name || data.cinemaName || cinemaName;
      roomName = data.room?.name || data.roomName || roomName;
    }

    // Xử lý startTime và endTime
    let startTime: string;
    let endTime: string;

    try {
      if (typeof data.startTime === 'string' && data.startTime) {
        startTime = data.startTime;
      } else if (data.startTime instanceof Date) {
        startTime = data.startTime.toISOString();
      } else {
        startTime = new Date().toISOString();
      }

      if (typeof data.endTime === 'string' && data.endTime) {
        endTime = data.endTime;
      } else if (data.endTime instanceof Date) {
        endTime = data.endTime.toISOString();
      } else {
        const endDate = new Date(startTime);
        endDate.setHours(endDate.getHours() + 2);
        endTime = endDate.toISOString();
      }
    } catch (error) {
      const now = new Date();
      startTime = now.toISOString();
      now.setHours(now.getHours() + 2);
      endTime = now.toISOString();
    }

    const totalSeats = typeof data.totalSeats === 'number' ? data.totalSeats : 0;
    const availableSeats = typeof data.availableSeats === 'number' ? data.availableSeats : 0;
    const bookedSeats = totalSeats - availableSeats;

    // Xử lý status
    let safeStatus: 'scheduled' | 'completed' = 'scheduled';
    if (data.status === 'completed') {
      safeStatus = 'completed';
    } else {
      safeStatus = 'scheduled';
    }

    return {
      id: data.id || id,
      movieId,
      movieTitle,
      cinemaId,
      cinemaName,
      roomId,
      roomName,
      startTime,
      endTime,
      bookedSeats,
      totalSeats,
      status: safeStatus,
    };
  } catch (error) {
    console.error('Error fetching showtime:', error);
    return {
      id,
      movieId: '1',
      movieTitle: 'Phim mẫu',
      cinemaId: '1',
      cinemaName: 'Rạp mẫu',
      roomId: '1',
      roomName: 'Phòng mẫu',
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      bookedSeats: 0,
      totalSeats: 100,
      status: 'scheduled',
    };
  }
};

const EditShowtime: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth(); // Lấy thông tin người dùng
  const isAdmin = user?.role === 'Admin'; // Kiểm tra xem người dùng có phải là Admin không
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [rooms, setRooms] = useState<CinemaRoom[]>([]);
  const [managerCinema, setManagerCinema] = useState<Cinema | null>(null);

  // Form states
  const [selectedMovie, setSelectedMovie] = useState<string>('');
  const [selectedCinema, setSelectedCinema] = useState<string>('');
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [showDate, setShowDate] = useState<string>('');
  const [showTime, setShowTime] = useState<string>('');
  const [showtimeStatus, setShowtimeStatus] = useState<'scheduled' | 'completed'>('scheduled');

  // Selected movie details
  const [selectedMovieDetails, setSelectedMovieDetails] = useState<Movie | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Tải danh sách phim
        const moviesData = await fetchMovies();
        setMovies(moviesData);

        // Nếu là Manager, lấy thông tin rạp của họ
        if (!isAdmin) {
          try {
            const managerResponse = await showtimeService.getShowtimesByManagerCinema();
            if (managerResponse && managerResponse.cinema) {
              const managerCinemaData = {
                id: managerResponse.cinema.Cinema_ID.toString(),
                name: managerResponse.cinema.Cinema_Name,
                address: managerResponse.cinema.Address || ''
              };
              setManagerCinema(managerCinemaData);
              setCinemas([managerCinemaData]);
              setSelectedCinema(managerCinemaData.id);
              console.log(`Đã lấy thông tin rạp của manager: ${managerCinemaData.name}`);
            }
          } catch (error) {
            console.error('Lỗi khi lấy thông tin rạp của manager:', error);
            toast.error('Không thể lấy thông tin rạp của bạn');
          }
        } else {
          // Nếu là Admin, lấy tất cả rạp
          const cinemasData = await fetchCinemas();
          setCinemas(cinemasData);
        }

        // Tải thông tin suất chiếu nếu không phải là trang thêm mới
        if (id && id !== 'add') {
          const showtimeData = await showtimeService.getShowtimeById(id);
          if (showtimeData) {
            setSelectedMovie(showtimeData.movieId);
            
            // Nếu là Manager, sử dụng rạp của họ
            if (!isAdmin && managerCinema) {
              setSelectedCinema(managerCinema.id);
            } else {
              setSelectedCinema(showtimeData.cinemaId);
            }
            
            // Tải danh sách phòng dựa trên rạp đã chọn
            const roomsData = await fetchRooms(isAdmin ? showtimeData.cinemaId : managerCinema?.id || '');
            setRooms(roomsData);
            setSelectedRoom(showtimeData.roomId);

            // Xử lý ngày giờ
            setShowDate(showtimeData.showDate);
            
            const timeString = showtimeData.startTime;
            if (timeString && typeof timeString === 'string') {
              if (timeString.includes('T')) {
                setShowTime(timeString.split('T')[1].substring(0, 5));
              } else {
                setShowTime(timeString.substring(0, 5));
              }
            }
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Không thể tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isAdmin]);

  // Load rooms when cinema changes
  useEffect(() => {
    if (selectedCinema && !loading) {
      const loadRooms = async () => {
        try {
          const roomsData = await fetchRooms(selectedCinema);
          setRooms(roomsData);

          // Reset selected room khi thay đổi cinema (không phải lúc load ban đầu)
          setSelectedRoom('');
        } catch (error) {
          console.error('Error loading rooms:', error);
          toast.error('Không thể tải danh sách phòng chiếu');
        }
      };

      loadRooms();
    } else if (!selectedCinema) {
      setRooms([]);
      setSelectedRoom('');
    }
  }, [selectedCinema, loading]);

  // Update selected movie details when movie changes
  useEffect(() => {
    if (selectedMovie) {
      const movie = movies.find(m => m.id === selectedMovie);
      setSelectedMovieDetails(movie || null);
    } else {
      setSelectedMovieDetails(null);
    }
  }, [selectedMovie, movies]);

  // Force set selectedRoom sau khi có dữ liệu
  useEffect(() => {
    const savedRoomId = sessionStorage.getItem(`editShowtime_${id}_roomId`);
    if (savedRoomId && rooms.length > 0 && !selectedRoom) {
      console.log('Force setting selectedRoom:', savedRoomId);
      setSelectedRoom(savedRoomId);
      sessionStorage.removeItem(`editShowtime_${id}_roomId`);
    }
  }, [rooms, id, selectedRoom]);

  // Calculate end time based on movie duration + 15 phút giải lao
  const calculateEndTime = () => {
    if (!selectedMovieDetails || !showTime) return '';

    const [hours, minutes] = showTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);

    const endDate = new Date(startDate);
    // Thêm thời lượng phim + 15 phút giải lao
    endDate.setMinutes(endDate.getMinutes() + selectedMovieDetails.duration + 15);

    return endDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  // Format currency for display
  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(Number(amount));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!selectedMovie) {
      toast.error('Vui lòng chọn phim');
      return;
    }

    if (!selectedCinema) {
      toast.error('Vui lòng chọn rạp');
      return;
    }

    if (!selectedRoom) {
      toast.error('Vui lòng chọn phòng chiếu');
      return;
    }

    if (!showDate) {
      toast.error('Vui lòng chọn ngày chiếu');
      return;
    }

    if (!showTime) {
      toast.error('Vui lòng chọn giờ chiếu');
      return;
    }

    if (!id) {
      toast.error('ID suất chiếu không hợp lệ');
      return;
    }

    setSubmitting(true);

    try {
      // Tạo đối tượng thời gian hợp lệ
      let startTimeObj: Date;
      let startTimeISO: string;

      try {
        // Kết hợp ngày và giờ thành chuỗi ISO
        const dateTimeString = `${showDate}T${showTime}:00`;
        startTimeObj = new Date(dateTimeString);

        // Kiểm tra xem đối tượng Date có hợp lệ không
        if (isNaN(startTimeObj.getTime())) {
          throw new Error('Thời gian không hợp lệ');
        }

        startTimeISO = startTimeObj.toISOString();
        console.log('startTime được tạo:', startTimeISO);
      } catch (error) {
        console.error('Lỗi khi tạo đối tượng thời gian:', error);
        // Fallback nếu có lỗi
        startTimeISO = new Date().toISOString();
        toast.error('Có lỗi khi xử lý thời gian, sử dụng thời gian hiện tại');
      }

      // Tạo đối tượng dữ liệu để gửi lên API
      const showtimeData = {
        movieId: selectedMovie,
        cinemaId: selectedCinema,
        roomId: selectedRoom,
        startTime: startTimeISO,
        status: showtimeStatus,
      };

      console.log('Dữ liệu gửi lên API:', showtimeData);

      // Gọi API để cập nhật suất chiếu
      const result = await showtimeService.updateShowtime(id, showtimeData);

      if (result) {
        toast.success('Cập nhật suất chiếu thành công');
        navigate('/admin/showtimes');
      }
    } catch (error: any) {
      console.error('Error updating showtime:', error);
      toast.error(error.message || 'Không thể cập nhật suất chiếu');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      {/* Back button and header */}
      <div className="mb-6">
        <Link
          to="/admin/showtimes"
          className="flex items-center text-gray-400 hover:text-FFD875 mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-1" />
          <span>Quay lại danh sách</span>
        </Link>

        <h1 className="text-2xl font-bold text-white">Chỉnh sửa lịch chiếu</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form section */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-slate-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-white border-b border-slate-700 pb-2 mb-6">Thông tin lịch chiếu</h2>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-FFD875"></div>
              </div>
            ) : (
              <>
                {/* Movie selection */}
                <div className="mb-6">
                  <label htmlFor="movie" className="block text-sm font-medium text-gray-300 mb-1">
                    Phim <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FilmIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      id="movie"
                      value={selectedMovie}
                      onChange={(e) => setSelectedMovie(e.target.value)}
                      className="bg-slate-700 text-white pl-10 pr-4 py-2 rounded-lg border border-slate-600 w-full focus:outline-none focus:border-[#FFD875] focus:ring-1 focus:ring-[#FFD875]"
                      required
                    >
                      <option value="">-- Chọn phim --</option>
                      {movies.map((movie) => (
                        <option key={movie.id} value={movie.id}>
                          {movie.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Cinema selection - Chỉ hiển thị cho Admin */}
                {isAdmin ? (
                  <div className="mb-6">
                    <label htmlFor="cinema" className="block text-sm font-medium text-gray-300 mb-1">
                      Rạp <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        id="cinema"
                        value={selectedCinema}
                        onChange={(e) => setSelectedCinema(e.target.value)}
                        className="bg-slate-700 text-white pl-10 pr-4 py-2 rounded-lg border border-slate-600 w-full focus:outline-none focus:border-[#FFD875] focus:ring-1 focus:ring-[#FFD875]"
                        required
                      >
                        <option value="">-- Chọn rạp --</option>
                        {cinemas.map((cinema) => (
                          <option key={cinema.id} value={cinema.id}>
                            {cinema.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="mb-6">
                    <label htmlFor="cinema-display" className="block text-sm font-medium text-gray-300 mb-1">
                      Rạp
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="cinema-display"
                        type="text"
                        value={managerCinema?.name || ''}
                        className="bg-slate-700 text-white pl-10 pr-4 py-2 rounded-lg border border-slate-600 w-full focus:outline-none cursor-not-allowed"
                        disabled
                      />
                      <input type="hidden" name="cinema" value={selectedCinema} />
                    </div>
                  </div>
                )}

                {/* Room selection */}
                <div className="mb-6">
                  <label htmlFor="room" className="block text-sm font-medium text-gray-300 mb-1">
                    Chọn phòng <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="room"
                    value={selectedRoom}
                    onChange={(e) => setSelectedRoom(e.target.value)}
                    className="bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 w-full focus:outline-none focus:border-FFD875 focus:ring-1 focus:ring-FFD875"
                    style={{ borderColor: selectedRoom ? '#FFD875' : undefined }}
                    disabled={!selectedCinema}
                    required
                  >
                    <option value="">-- Chọn phòng --</option>
                    {rooms.map(room => (
                      <option key={room.id} value={room.id}>{room.name} ({room.capacity} ghế)</option>
                    ))}
                  </select>
                  {!selectedCinema && (
                    <p className="text-sm text-gray-400 mt-1">Vui lòng chọn rạp trước</p>
                  )}
                </div>

                {/* Status selection */}
                <div className="mb-6">
                  <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-1">
                    Trạng thái <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="status"
                    value={showtimeStatus}
                    onChange={(e) => setShowtimeStatus(e.target.value as 'scheduled' | 'completed')}
                    className="bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 w-full focus:outline-none focus:border-FFD875 focus:ring-1 focus:ring-FFD875"
                    style={{ borderColor: showtimeStatus ? '#FFD875' : undefined }}
                    required
                  >
                    <option value="scheduled">Đã lên lịch</option>
                    <option value="completed">Đã hoàn thành</option>
                  </select>
                  <p className="text-sm text-gray-400 mt-1">
                    {showtimeStatus === 'scheduled' && 'Suất chiếu đã được lên lịch và chờ bắt đầu'}
                    {showtimeStatus === 'completed' && 'Suất chiếu đã hoàn thành'}
                  </p>
                </div>

                {/* Date and time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-1">
                      Ngày chiếu <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <ClockIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="date"
                        id="date"
                        value={showDate}
                        onChange={(e) => setShowDate(e.target.value)}
                        className="bg-slate-700 text-white pl-10 pr-4 py-2 rounded-lg border border-slate-600 w-full focus:outline-none focus:border-FFD875 focus:ring-1 focus:ring-FFD875"
                        style={{ borderColor: showDate ? '#FFD875' : undefined }}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="time" className="block text-sm font-medium text-gray-300 mb-1">
                      Giờ chiếu <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <ClockIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="time"
                        id="time"
                        value={showTime}
                        onChange={(e) => setShowTime(e.target.value)}
                        className="bg-slate-700 text-white pl-10 pr-4 py-2 rounded-lg border border-slate-600 w-full focus:outline-none focus:border-FFD875 focus:ring-1 focus:ring-FFD875"
                        style={{ borderColor: showTime ? '#FFD875' : undefined }}
                        required
                      />
                    </div>
                    {selectedMovieDetails && showTime && (
                      <p className="text-sm text-gray-400 mt-1">
                        Kết thúc: {calculateEndTime()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end space-x-4 mt-8">
                  <button
                    type="button"
                    onClick={() => navigate('/admin/showtimes')}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    disabled={submitting}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-FFD875 text-black rounded-lg hover:bg-opacity-90 transition-colors btn-glow btn-yellow"
                    style={{ backgroundColor: '#FFD875' }}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Đang lưu...
                      </span>
                    ) : (
                      'Lưu thay đổi'
                    )}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>

        {/* Preview section */}
        <div className="lg:col-span-1">
          <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-white border-b border-slate-700 pb-2 mb-6">Xem trước</h2>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-FFD875"></div>
              </div>
            ) : selectedMovieDetails ? (
              <div>
                <div className="flex justify-center mb-4">
                  <img
                    src={selectedMovieDetails.poster}
                    alt={selectedMovieDetails.title}
                    className="w-32 h-48 object-cover rounded-lg shadow-lg"
                  />
                </div>

                <h3 className="text-white font-semibold text-center mb-4">{selectedMovieDetails.title}</h3>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Thời lượng:</span>
                    <span className="text-white">{selectedMovieDetails.duration} phút</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-400">Ngày khởi chiếu:</span>
                    <span className="text-white">{new Date(selectedMovieDetails.releaseDate).toLocaleDateString('vi-VN')}</span>
                  </div>

                  {selectedCinema && cinemas.find(c => c.id === selectedCinema) && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Rạp:</span>
                      <span className="text-white">{cinemas.find(c => c.id === selectedCinema)?.name}</span>
                    </div>
                  )}

                  {selectedRoom && rooms.find(r => r.id === selectedRoom) && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Phòng:</span>
                      <span className="text-white">
                        {rooms.find(r => r.id === selectedRoom)?.name}
                        {rooms.find(r => r.id === selectedRoom)?.capacity &&
                          ` (${rooms.find(r => r.id === selectedRoom)?.capacity} ghế)`
                        }
                      </span>
                    </div>
                  )}

                  {showDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Ngày chiếu:</span>
                      <span className="text-white">{new Date(showDate).toLocaleDateString('vi-VN')}</span>
                    </div>
                  )}

                  {showTime && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Giờ chiếu:</span>
                      <span className="text-white">{showTime}</span>
                    </div>
                  )}

                  {showTime && selectedMovieDetails && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Giờ kết thúc:</span>
                      <span className="text-white">{calculateEndTime()}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-gray-400">Trạng thái:</span>
                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${showtimeStatus === 'scheduled' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-green-500/20 text-green-400'
                      }`}>
                      {showtimeStatus === 'scheduled' && 'Đã lên lịch'}
                      {showtimeStatus === 'completed' && 'Đã hoàn thành'}
                    </span>
                  </div>

                  {/* Hiển thị ID để debug */}
                  <div className="border-t border-slate-700 pt-2 mt-2">
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>Movie ID: {selectedMovie}</div>
                      <div>Cinema ID: {selectedCinema}</div>
                      <div>Room ID: {selectedRoom}</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <FilmIcon className="w-16 h-16 mb-4" />
                <p>Chọn phim để xem trước</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditShowtime;

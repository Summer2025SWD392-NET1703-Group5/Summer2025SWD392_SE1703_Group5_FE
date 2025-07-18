// src/pages/admin/showtimes/AddShowtime.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import showtimeService from '../../../services/showtimeService';
import { movieService } from '../../../services/movieService';
import { cinemaRoomService } from '../../../services/cinemaRoomService';
import type { ShowtimeFormData } from '../../../types/showtime';
import type { Movie } from '../../../types/movie';
import EarlyPremiereModal from '../../../components/admin/common/EarlyPremiereModal';
import '../../../components/admin/cinema-rooms/SeatMap.css';
import {
  FilmIcon,
  BuildingOfficeIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../../contexts/SimpleAuthContext';
import { getVNLocalDateString } from '../../../utils/timeFormatter';
import { get } from 'react-hook-form';

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

// API functions using real services
const fetchMovies = async (): Promise<Movie[]> => {
  try {
    let allMovies;
    try {
      // Try to fetch movies from the "now-showing" endpoint first
      const response = await fetch('/api/movies/now-showing');
      const responseData = await response.json();
      console.log('Raw movies data from now-showing API:', responseData);

      // Check if the response has a data property (common API pattern)
      if (responseData && responseData.data) {
        allMovies = responseData.data;
      } else if (responseData && Array.isArray(responseData)) {
        allMovies = responseData;
      } else if (responseData && responseData.success && responseData.data) {
        allMovies = responseData.data;
      } else {
        // If the API returned an empty array or invalid format, fall back to regular getMovies
        allMovies = await movieService.getMovies();
        console.log('Raw movies data from getMovies API:', allMovies);
      }
    } catch (error) {
      console.log('Failed to get movies with getMovies, trying getAllMovies');
      allMovies = await movieService.getAllMovies();
      allMovies = allMovies.filter((movie: any) =>
        movie.status === 'Now Showing' ||
        movie.Status === 'Now Showing' ||
        movie.movieStatus === 'Now Showing');
    }

    // Map the movies to a consistent format
    const mappedMovies = allMovies.map((movie: any) => ({
      id: movie.Movie_ID?.toString() || movie.id?.toString() || movie.movieId?.toString(),
      title: movie.Movie_Name || movie.title || movie.movieName || movie.name || '',
      poster: movie.Poster_URL || movie.poster || movie.posterUrl || movie.posterURL || '',
      duration: movie.Duration || movie.duration || 120,
      releaseDate: movie.Release_Date || movie.releaseDate || new Date().toISOString().split('T')[0],
      premiereDate: movie.Premiere_Date || movie.premiereDate || '',
      endDate: movie.End_Date || movie.endDate || '',
      productionCompany: movie.Production_Company || movie.productionCompany || '',
      director: movie.Director || movie.director || '',
      cast: movie.Cast || movie.cast || '',
      genre: movie.Genre || movie.genre || '',
      rating: movie.Rating || movie.rating || '',
      language: movie.Language || movie.language || '',
      country: movie.Country || movie.country || '',
      synopsis: movie.Synopsis || movie.synopsis || '',
      trailerLink: movie.Trailer_Link || movie.trailerLink || '',
      status: movie.Status || movie.status || 'Now Showing',
    }));

    console.log('Mapped movies:', mappedMovies);
    return mappedMovies;
  } catch (error) {
    console.error('Error fetching movies:', error);
    toast.error('Không thể tải danh sách phim');
    return [];
  }
};

const fetchCinemas = async (): Promise<Cinema[]> => {
  try {
    // Try to fetch active cinemas from the API
    try {
      const response = await fetch('/api/cinemas/active');
      const responseData = await response.json();
      console.log('Active cinemas from API:', responseData);

      let activeCinemas = [];

      // Check if the response has a data property (common API pattern)
      if (responseData && responseData.data && Array.isArray(responseData.data)) {
        activeCinemas = responseData.data;
      } else if (responseData && Array.isArray(responseData)) {
        activeCinemas = responseData;
      } else if (responseData && responseData.success && responseData.data) {
        activeCinemas = responseData.data;
      }

      console.log('Extracted cinema data:', activeCinemas);

      if (activeCinemas && activeCinemas.length > 0) {
        const mappedCinemas = activeCinemas.map((cinema: any) => {
          console.log('Processing cinema:', cinema);
          const cinemaId = cinema.Cinema_ID?.toString() || cinema.id?.toString() || cinema.cinemaId?.toString();
          const cinemaName = cinema.Cinema_Name || cinema.name || cinema.cinemaName || '';
          const cinemaAddress = cinema.Address || cinema.address || '';

          console.log(`Mapped cinema: id=${cinemaId}, name=${cinemaName}`);

          return {
            id: cinemaId,
            name: cinemaName,
            address: cinemaAddress,
          };
        });

        console.log('Final mapped cinemas:', mappedCinemas);
        return mappedCinemas;
      }
    } catch (error) {
      console.error('Error fetching active cinemas:', error);
    }

    // Fall back to the service if API fails
    const cinemasMap = await showtimeService.getCinemas();
    return Array.from(cinemasMap.values()).map((cinema: any) => ({
      id: cinema.id,
      name: cinema.name,
      address: cinema.address,
    }));
  } catch (error) {
    console.error('Error fetching cinemas:', error);
    toast.error('Không thể tải danh sách rạp');
    return [];
  }
};

const fetchRooms = async (cinemaId: string): Promise<CinemaRoom[]> => {
  try {
    console.log('Fetching active rooms for cinema ID:', cinemaId);
    const response = await cinemaRoomService.getActiveRoomsByCinemaId(Number(cinemaId));
    console.log('Raw API response for active rooms:', response);

    return response.map((room: any) => {
      // Get the actual capacity from the API response
      const capacity = room.Seat_Quantity || room.Capacity || room.seat_quantity || 48;

      return {
        id: room.Cinema_Room_ID?.toString() || room.id,
        name: room.Room_Name || room.name || room.RoomName,
        cinemaId: room.Cinema_ID?.toString() || room.cinemaId || cinemaId,
        capacity: capacity
      };
    });
  } catch (error) {
    console.error('Error fetching active rooms:', error);
    toast.error('Không thể tải danh sách phòng chiếu hoạt động');
    return [];
  }
};

const AddShowtime: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth(); // Lấy thông tin người dùng
  const isAdmin = user?.role === 'Admin'; // Kiểm tra xem người dùng có phải là Admin không

  // Data states
  const [movies, setMovies] = useState<Movie[]>([]);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [rooms, setRooms] = useState<CinemaRoom[]>([]);
  const [loadingMovieDetails, setLoadingMovieDetails] = useState<boolean>(false);
  const [managerCinema, setManagerCinema] = useState<Cinema | null>(null);

  // Form states
  const [selectedMovie, setSelectedMovie] = useState<string>('');
  const [selectedCinema, setSelectedCinema] = useState<string>('');
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [showDate, setShowDate] = useState<string>('');
  const [showTime, setShowTime] = useState<string>('');

  // Selected movie details
  const [selectedMovieDetails, setSelectedMovieDetails] = useState<Movie | null>(null);
  
  // Early premiere modal state
  const [showEarlyPremiereModal, setShowEarlyPremiereModal] = useState(false);
  const [pendingSubmitEvent, setPendingSubmitEvent] = useState<React.FormEvent | null>(null);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      const cinemaId = searchParams.get("cinemaId");
      try {
        // Luôn tải danh sách phim
        const moviesData = await fetchMovies();
        setMovies(moviesData);
        
        // Set cinema from URL parameter if available
        if (cinemaId && isAdmin) {
          console.log('Setting cinema from URL parameter:', cinemaId);
          setSelectedCinema(cinemaId);
          console.log(`Selected cinema set to: ${cinemaId}`);
        }
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
          
          // After loading cinemas, set the selected cinema from URL if available
          if (cinemaId && cinemasData.length > 0) {
            const cinemaExists = cinemasData.find(c => c.id === cinemaId);
            if (cinemaExists) {
              console.log('Setting cinema from URL after loading cinemas:', cinemaId);
              setSelectedCinema(cinemaId);
            } else {
              console.warn('Cinema ID from URL not found in loaded cinemas:', cinemaId);
            }
          }
        }

        // Set default date to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setShowDate(tomorrow.toISOString().split('T')[0]);

      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Không thể tải dữ liệu');
      }
    };

    loadData();
  }, [isAdmin, searchParams]);

  // Handle cinema selection from URL parameters when cinemas are loaded
  useEffect(() => {
    const cinemaId = searchParams.get("cinemaId");
    if (cinemaId && isAdmin && cinemas.length > 0) {
      const cinemaExists = cinemas.find(c => c.id === cinemaId);
      if (cinemaExists && selectedCinema !== cinemaId) {
        console.log('Setting cinema from URL in separate useEffect:', cinemaId);
        setSelectedCinema(cinemaId);
      }
    }
  }, [cinemas, searchParams, isAdmin, selectedCinema]);

  // Load rooms when cinema changes
  useEffect(() => {
    if (selectedCinema) {
      const loadRooms = async () => {
        try {
          console.log('Loading rooms for cinema ID:', selectedCinema);
          const roomsData = await fetchRooms(selectedCinema);
          console.log('Loaded rooms data:', roomsData);
          setRooms(roomsData);
          setSelectedRoom(''); // Reset selected room
        } catch (error) {
          console.error('Error loading rooms:', error);
          toast.error('Không thể tải danh sách phòng chiếu');
        }
      };

      loadRooms();
    } else {
      setRooms([]);
      setSelectedRoom('');
    }
  }, [selectedCinema]);

  // Update selected movie details when movie changes
  useEffect(() => {
    if (selectedMovie) {
      const fetchMovieDetails = async () => {
        setLoadingMovieDetails(true);
        try {
          // First try to find the movie in the already loaded movies list
          const movieFromList = movies.find(m => m.id === selectedMovie);
          if (movieFromList) {
            setSelectedMovieDetails(movieFromList);
          }

          // Only try to fetch from API if ID is numeric
          if (/^\d+$/.test(selectedMovie)) {
            // Then fetch detailed information from the API
            try {
              const detailedMovie = await movieService.fetchMovieDetails(selectedMovie);
              if (detailedMovie) {
                console.log('Detailed movie from API:', detailedMovie);
                console.log('Premiere_Date from API:', detailedMovie.Premiere_Date);
                console.log('premiereDate from API:', detailedMovie.premiereDate);
                
                const movieData = {
                  id: selectedMovie,
                  title: detailedMovie.Movie_Name || detailedMovie.movieName || detailedMovie.title || movieFromList?.title || '',
                  poster: detailedMovie.Poster_URL || detailedMovie.posterURL || detailedMovie.posterUrl || detailedMovie.poster || movieFromList?.poster || '',
                  duration: detailedMovie.Duration || detailedMovie.duration || movieFromList?.duration || 120,
                  releaseDate: detailedMovie.Release_Date || detailedMovie.releaseDate || movieFromList?.releaseDate || '',
                  premiereDate: detailedMovie.Premiere_Date || detailedMovie.premiereDate || movieFromList?.premiereDate || '',
                  endDate: detailedMovie.End_Date || detailedMovie.endDate || movieFromList?.endDate || '',
                };
                
                console.log('Final movieData:', movieData);
                setSelectedMovieDetails(movieData);
              }
            } catch (error) {
              console.error('Error fetching movie details from API:', error);
              // Already set movie details from list, so we can continue
            }
          } else {
            console.log('Skipping API fetch for non-numeric ID:', selectedMovie);
          }
        } catch (error) {
          console.error('Error in movie details fetch process:', error);
          // Keep the basic movie details if API call fails
          const movie = movies.find(m => m.id === selectedMovie);
          setSelectedMovieDetails(movie || null);
        } finally {
          setLoadingMovieDetails(false);
        }
      };

      fetchMovieDetails();
    } else {
      setSelectedMovieDetails(null);
    }
  }, [selectedMovie, movies]);

  // Validate time when date changes
  useEffect(() => {
    if (showDate && showTime) {
      // If date is today and current time is before minimum time, clear the time
      if (isToday(showDate)) {
        const minTime = getMinTimeForToday();
        if (showTime < minTime) {
          setShowTime('');
          toast.error('Thời gian đã chọn không hợp lệ. Vui lòng chọn thời gian sau hiện tại (+30 phút).');
        }
      }
      
      // Check if datetime is after movie end date
      if (selectedMovieDetails?.endDate && !isDateTimeAfterMovieEndDate(showDate, showTime, selectedMovieDetails.endDate)) {
        setShowTime('');
        toast.error(`Không thể chọn thời gian sau ngày kết thúc phim (${new Date(selectedMovieDetails.endDate).toLocaleDateString('vi-VN')})`);
      }
    }
  }, [showDate, showTime, selectedMovieDetails]);

  // Calculate end time based on movie duration
  const calculateEndTime = () => {
    if (!selectedMovieDetails || !showTime) return '';

    const [hours, minutes] = showTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);

    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + selectedMovieDetails.duration);

    return endDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  // Handle early premiere modal confirm
  const handleEarlyPremiereConfirm = async () => {
    setShowEarlyPremiereModal(false);
    
    if (pendingSubmitEvent) {
      await handleSubmit(pendingSubmitEvent, true); // Gọi lại với allowEarlyShowtime = true
      setPendingSubmitEvent(null);
    }
  };

  // Handle early premiere modal cancel
  const handleEarlyPremiereCancel = () => {
    setShowEarlyPremiereModal(false);
    setPendingSubmitEvent(null);
    toast.error('Đã hủy tạo xuất chiếu sớm');
  };

  // Validation functions
  const isDateTimeAfterNow = (date: string, time: string): boolean => {
    const selectedDateTime = new Date(`${date}T${time}`);
    const now = new Date();
    return selectedDateTime > now;
  };

  const isDateTimeAfterMovieEndDate = (date: string, time: string, movieEndDate: string): boolean => {
    if (!movieEndDate) return true; // If no end date, allow scheduling
    
    const selectedDateTime = new Date(`${date}T${time}`);
    const endDate = new Date(movieEndDate);
    
    // Set end date to end of day for comparison
    endDate.setHours(23, 59, 59, 999);
    
    return selectedDateTime <= endDate;
  };

  const getMinTimeForToday = (): string => {
    const now = new Date();
    
    // Add 30 minutes buffer for preparation time
    const minDate = new Date(now.getTime() + 30 * 60000);
    
    return minDate.toTimeString().slice(0, 5); // Returns HH:MM format
  };

  const isToday = (date: string): boolean => {
    const today = getVNLocalDateString();
    return date === today;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent, allowEarlyShowtime: boolean = false) => {
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

    // Validate datetime is after current time
    if (!isDateTimeAfterNow(showDate, showTime)) {
      toast.error('Thời gian chiếu phải sau thời điểm hiện tại (+30 phút)');
      return;
    }

    // Validate datetime is before movie end date (if movie has end date)
    if (selectedMovieDetails?.endDate && !isDateTimeAfterMovieEndDate(showDate, showTime, selectedMovieDetails.endDate)) {
      toast.error(`Không thể tạo suất chiếu sau ngày kết thúc phim (${new Date(selectedMovieDetails.endDate).toLocaleDateString('vi-VN')})`);
      return;
    }

    setSubmitting(true);

    try {
      // Tạo đối tượng dữ liệu để gửi lên API
      const showtimeData: ShowtimeFormData = {
        movieId: selectedMovie,
        roomId: selectedRoom,
        cinemaId: selectedCinema,
        date: showDate,
        time: showTime,
        startTime: new Date(`${showDate}T${showTime}`),
        specialOffers: [],
        isActive: true
      };

      console.log('Sending showtime data to API:', showtimeData);

      // Gọi API để tạo suất chiếu mới
      const result = await showtimeService.createShowtime(showtimeData, allowEarlyShowtime);

      if (result) {
        toast.success('Thêm suất chiếu thành công');
        console.log('Suất chiếu được tạo thành công, chuyển về trang quản lý suất chiếu');
        
        // Redirect to showtimes page, preserving cinema selection if available
        const cinemaId = searchParams.get("cinemaId");
        if (cinemaId && isAdmin) {
          navigate(`/admin/showtimes?cinemaId=${cinemaId}`);
        } else {
          navigate('/admin/showtimes');
        }
      }
    } catch (error: any) {
      console.error('Error creating showtime:', error);
      
      // Xử lý trường hợp early premiere conflict
      if (error.message === 'early_premiere_request' || 
          (error.response?.data?.message && error.response.data.message.includes('early_premiere_request'))) {
        
        // Lưu form submit event để xử lý sau khi user confirm
        setPendingSubmitEvent(e);
        
        // Debug log before showing modal
        console.log('Before showing modal - selectedMovieDetails:', selectedMovieDetails);
        console.log('Modal props will be:', {
          movieTitle: selectedMovieDetails?.title || 'Phim đã chọn',
          releaseDate: selectedMovieDetails?.releaseDate || '',
          premiereDate: selectedMovieDetails?.premiereDate || '',
          selectedDate: showDate
        });
        
        // Hiển thị modal thay vì window.confirm()
        setShowEarlyPremiereModal(true);
      } else {
        // Xử lý các lỗi khác
        toast.error(error.message || error.response?.data?.message || 'Không thể tạo suất chiếu');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      {/* Back button and header */}
      <div className="mb-6">
        <Link
          to={(() => {
            const cinemaId = searchParams.get("cinemaId");
            return cinemaId && isAdmin ? `/admin/showtimes?cinemaId=${cinemaId}` : "/admin/showtimes";
          })()}
          className="flex items-center text-gray-400 hover:text-FFD875 mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-1" />
          <span>Quay lại danh sách</span>
        </Link>

        <h1 className="text-2xl font-bold text-white">Thêm lịch chiếu mới</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form section */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-slate-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-white border-b border-slate-700 pb-2 mb-6">
              Thông tin lịch chiếu
            </h2>

            {/* Movie selection */}
            <div className="mb-6">
              <label htmlFor="movie" className="block text-sm font-medium text-gray-300 mb-1">
                Chọn phim <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FilmIcon className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="movie"
                  value={selectedMovie}
                  onChange={(e) => setSelectedMovie(e.target.value)}
                  className="bg-slate-700 text-white pl-10 pr-4 py-2 rounded-lg border border-slate-600 w-full focus:outline-none focus:border-FFD875 focus:ring-1 focus:ring-FFD875"
                  style={{ borderColor: selectedMovie ? "#FFD875" : undefined }}
                  required
                >
                  <option key="default-movie" value="">
                    -- Chọn phim --
                  </option>
                  {movies.map((movie, index) => (
                    <option key={`movie-${movie.id || index}`} value={movie.id}>
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
                  Chọn rạp <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="cinema"
                    value={selectedCinema}
                    onChange={(e) => {
                      console.log("Selected cinema ID:", e.target.value);
                      setSelectedCinema(e.target.value);
                    }}
                    className="bg-slate-700 text-white pl-10 pr-4 py-2 rounded-lg border border-slate-600 w-full focus:outline-none focus:border-FFD875 focus:ring-1 focus:ring-FFD875"
                    style={{ borderColor: selectedCinema ? "#FFD875" : undefined }}
                    required
                  >
                    <option key="default-cinema" value="">
                      -- Chọn rạp --
                    </option>
                    {cinemas.map((cinema) => (
                      <option key={`cinema-${cinema.id}`} value={cinema.id}>
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
                    value={managerCinema?.name || ""}
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
                style={{ borderColor: selectedRoom ? "#FFD875" : undefined }}
                disabled={!selectedCinema}
                required
              >
                <option key="default-room" value="">
                  -- Chọn phòng --
                </option>
                {rooms.map((room) => (
                  <option key={`room-${room.id}`} value={room.id}>
                    {room.name} ({room.capacity} ghế)
                  </option>
                ))}
              </select>
              {!selectedCinema && <p className="text-sm text-gray-400 mt-1">Vui lòng chọn rạp trước</p>}
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
                    style={{ borderColor: showDate ? "#FFD875" : undefined }}
                    min={getVNLocalDateString()}
                    max={selectedMovieDetails?.endDate || undefined}
                    required
                  />
                </div>
                {selectedMovieDetails?.endDate && new Date(selectedMovieDetails.endDate) < new Date() && (
                  <p className="text-sm text-red-400 mt-1">
                    ⚠️ Phim đã kết thúc từ {new Date(selectedMovieDetails.endDate).toLocaleDateString("vi-VN")}
                  </p>
                )}
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
                    style={{ borderColor: showTime ? "#FFD875" : undefined }}
                    min={isToday(showDate) ? getMinTimeForToday() : undefined}
                    required
                  />
                </div>
                {isToday(showDate) && (
                  <p className="text-sm text-yellow-400 mt-1">
                    Thời gian tối thiểu: {getVNLocalDateString()} | {getMinTimeForToday()} (sau 30 phút từ bây giờ)
                  </p>
                )}
                {selectedMovieDetails?.endDate && (
                  <p className="text-sm text-gray-400 mt-1">
                    Phim kết thúc chiếu: {new Date(selectedMovieDetails.endDate).toLocaleDateString("vi-VN")}
                  </p>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-4 mt-8">
              <button
                type="button"
                onClick={() => {
                  const cinemaId = searchParams.get("cinemaId");
                  if (cinemaId && isAdmin) {
                    navigate(`/admin/showtimes?cinemaId=${cinemaId}`);
                  } else {
                    navigate("/admin/showtimes");
                  }
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                disabled={submitting}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-FFD875 text-black rounded-lg hover:bg-opacity-90 transition-colors btn-glow btn-yellow"
                style={{ backgroundColor: "#FFD875" }}
                disabled={submitting}
              >
                {submitting ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-black"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Đang lưu...
                  </span>
                ) : (
                  "Thêm lịch chiếu"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Preview section */}
        <div className="lg:col-span-1">
          <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-white border-b border-slate-700 pb-2 mb-6">Xem trước</h2>

            {loadingMovieDetails ? (
              <div className="flex flex-col items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                <p className="mt-4 text-gray-400">Đang tải thông tin phim...</p>
              </div>
            ) : selectedMovieDetails ? (
              <div>
                <div className="flex justify-center mb-4">
                  <img
                    src={selectedMovieDetails.poster || "https://placehold.co/240x360/darkgray/white?text=No+Image"}
                    alt={selectedMovieDetails.title}
                    className="w-32 h-48 object-cover rounded-lg shadow-lg"
                    onError={(e) => {
                      // Fallback image if poster URL is invalid
                      e.currentTarget.src = "https://placehold.co/240x360/darkgray/white?text=No+Image";
                    }}
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
                    <span className="text-white">
                      {(() => {
                        try {
                          return new Date(selectedMovieDetails.releaseDate).toLocaleDateString("vi-VN");
                        } catch (e) {
                          return "Không xác định";
                        }
                      })()}
                    </span>
                  </div>

                  {selectedCinema && cinemas.find((c) => c.id === selectedCinema) && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Rạp:</span>
                      <span className="text-white">{cinemas.find((c) => c.id === selectedCinema)?.name}</span>
                    </div>
                  )}

                  {selectedRoom && rooms.find((r) => r.id === selectedRoom) && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Phòng:</span>
                      <span className="text-white">
                        {rooms.find((r) => r.id === selectedRoom)?.name} (
                        {rooms.find((r) => r.id === selectedRoom)?.capacity} ghế)
                      </span>
                    </div>
                  )}

                  {showDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Ngày chiếu:</span>
                      <span className="text-white">
                        {(() => {
                          try {
                            return new Date(showDate).toLocaleDateString("vi-VN");
                          } catch (e) {
                            return showDate;
                          }
                        })()}
                      </span>
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

      {/* Early Premiere Modal */}
      <EarlyPremiereModal
        isOpen={showEarlyPremiereModal}
        onClose={handleEarlyPremiereCancel}
        onConfirm={handleEarlyPremiereConfirm}
        movieTitle={selectedMovieDetails?.title || "Phim đã chọn"}
        releaseDate={selectedMovieDetails?.releaseDate || ""}
        premiereDate={selectedMovieDetails?.premiereDate || ""}
        selectedDate={showDate}
      />
    </div>
  );
};

export default AddShowtime;

// pages/ShowtimePage.tsx
import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Filter, ChevronLeft, ChevronRight, Users, Star, Film, Building2, Sparkles, SlidersHorizontal, CalendarDays } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import showtimesPageService from '../services/ShowtimesPageService';
import { useAuth } from '../contexts/SimpleAuthContext';
import AuthModal from '../components/AuthModal';
import { toast } from 'react-hot-toast';


// Interfaces
interface Movie {
  id: number;
  title: string;
  poster: string;
  duration: number;
  genre: string;
  rating: string;
  language?: string;
}


interface Cinema {
  id: number;
  name: string;
  address: string;
  city?: string;
}


interface Showtime {
  id: number;
  movieId: number;
  movieTitle: string;
  moviePoster?: string;
  movieDuration?: number;
  movieGenre?: string;
  movieRating?: string;
  cinemaId: number;
  cinemaName: string;
  cinemaAddress: string;
  date: string;
  time: string;
  endTime: string;
  roomId: number;
  roomName: string;
  roomType: string;
  status: string;
  availableSeats: number;
  totalSeats: number;
  language: string;
  isSoldOut?: boolean;
  seatStatus?: string;
}


const ShowtimePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, isLoading } = useAuth();
  const [searchParams] = useSearchParams();

  // Check if unassigned staff trying to access showtimes
  useEffect(() => {
    // Wait for user data to be loaded before checking restrictions
    if (!isLoading && user && user.role === 'Staff' && !user.cinemaId) {
      console.log("[ShowtimePage] Blocking unassigned staff access:", user);
      toast.error('Bạn chưa được phân công làm việc tại rạp nào. Vui lòng liên hệ Quản lý hoặc Admin để được phân công.');
      navigate('/profile/settings', { replace: true });
      return;
    }
  }, [user, isLoading, navigate]);

  // Auth modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingBookingData, setPendingBookingData] = useState<{
    showtimeId: number;
    movieTitle: string;
    cinemaName: string;
    time: string;
    date: string;
  } | null>(null);


  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedCinema, setSelectedCinema] = useState<number | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<number | null>(null);
  const [selectedRoomType, setSelectedRoomType] = useState<string>('all');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [expandedCinemas, setExpandedCinemas] = useState<Record<number, boolean>>({});
  const showtimesPerCinema = 10;


  // Generate dates for the next 7 days
  const generateDates = () => {
    const dates = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);

      const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      const monthNames = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

      dates.push({
        value: date.toISOString().split('T')[0],
        dayName: dayNames[date.getDay()],
        day: date.getDate(),
        month: monthNames[date.getMonth()],
        fullDate: date,
        isToday: i === 0,
        isWeekend: date.getDay() === 0 || date.getDay() === 6
      });
    }
    return dates;
  };

  const dates = generateDates();

  // Lock cinema filter for assigned staff
  useEffect(() => {
    // Wait for user data to be loaded and check if user is assigned staff
    if (!isLoading && user && user.role === 'Staff' && user.cinemaId && cinemas.length > 0) {
      console.log("[ShowtimePage] Locking cinema filter for staff to cinema:", user.cinemaId);
      setSelectedCinema(user.cinemaId);
      
      // Also set the city filter to the staff's cinema city
      const staffCinema = cinemas.find(c => c.id === user.cinemaId);
      if (staffCinema && staffCinema.city) {
        console.log("[ShowtimePage] Locking city filter for staff to city:", staffCinema.city);
        setSelectedCity(staffCinema.city);
      }
    }
  }, [user, isLoading, cinemas]);


  // Handle showtime selection with authentication check
  const handleSelectShowtime = (showtime: Showtime) => {
    console.log('User clicked showtime:', showtime);

    if (!isAuthenticated) {
      console.log('User not authenticated, showing login modal');

      // Store showtime data for after authentication
      setPendingBookingData({
        showtimeId: showtime.id,
        movieTitle: showtime.movieTitle,
        cinemaName: showtime.cinemaName,
        time: showtime.time,
        date: showtime.date
      });

      // Show authentication modal
      setIsAuthModalOpen(true);
      return;
    }

    // User is authenticated, proceed with booking
    proceedWithBooking(showtime.id);
  };


  // Proceed with booking after authentication
  const proceedWithBooking = (showtimeId: number) => {
    console.log('Proceeding with booking for showtime:', showtimeId);
    navigate(`/booking/${showtimeId}`);
  };


  // Handle successful authentication
  const handleAuthSuccess = () => {
    console.log('Authentication successful');
    setIsAuthModalOpen(false);

    if (pendingBookingData) {
      console.log('Proceeding with pending booking:', pendingBookingData);
      proceedWithBooking(pendingBookingData.showtimeId);
      setPendingBookingData(null);
    }
  };


  // Handle auth modal close
  const handleAuthModalClose = () => {
    setIsAuthModalOpen(false);
    setPendingBookingData(null);
  };


  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        // Kiểm tra tham số cinema từ URL
        const cinemaParam = searchParams.get('cinema');
        console.log('Tham số cinema từ URL:', cinemaParam);
        
        const [cinemasData, moviesData] = await Promise.all([
          showtimesPageService.getAllCinemas(),
          showtimesPageService.getAllMovies()
        ]);

        // Lưu dữ liệu rạp và phim
        setCinemas(cinemasData);
        setMovies(moviesData);

        // Thiết lập rạp được chọn từ tham số URL
        if (cinemaParam) {
          // Chuyển đổi chuỗi thành số nếu là số
          const cinemaIdFromUrl = !isNaN(Number(cinemaParam)) ? Number(cinemaParam) : cinemaParam;
          console.log('cinemaIdFromUrl:', cinemaIdFromUrl);
          
          // Tìm rạp phù hợp từ dữ liệu đã tải về
          const matchingCinema = cinemasData.find(
            cinema => cinema.id.toString() === cinemaIdFromUrl.toString() || 
                    cinema.name.toLowerCase().includes(String(cinemaIdFromUrl).toLowerCase())
          );
          
          if (matchingCinema) {
            console.log('Đã tìm thấy rạp phù hợp:', matchingCinema.name, matchingCinema.id);
            setSelectedCinema(matchingCinema.id);
          } else {
            console.log('Không tìm thấy rạp phù hợp với tham số:', cinemaIdFromUrl);
            console.log('Danh sách rạp hiện có:', cinemasData.map(c => ({ id: c.id, name: c.name })));
          }
        }

        // Fetch showtimes immediately after getting cinemas and movies
        if (cinemasData.length > 0 && moviesData.length > 0) {
          await fetchShowtimesWithData(cinemasData, moviesData);
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [searchParams]);


  // Separate function to fetch showtimes with provided data
  const fetchShowtimesWithData = async (cinemasData: Cinema[], moviesData: Movie[]) => {
    try {
      const filters = {
        date: selectedDate,
        cinemaId: selectedCinema || undefined,
        movieId: selectedMovie || undefined,
        roomType: selectedRoomType !== 'all' ? selectedRoomType : undefined,
        timeSlot: selectedTimeSlot !== 'all' ? selectedTimeSlot : undefined,
      };

      const showtimesData = await showtimesPageService.getAllShowtimes(filters);
      console.log('Fetched showtimes:', showtimesData);


      // Enrich showtime data with movie, room details and seats info
      const enrichedShowtimes = await Promise.all(
        showtimesData.map(async (showtime: any) => {
          try {
            // Get movie details
            const movie = moviesData.find(m => m.id === showtime.movieId);

            // Get room details
            let roomInfo = null;
            try {
              roomInfo = await showtimesPageService.getCinemaRoomById(showtime.roomId);
            } catch (error) {
              console.error('Error fetching room info:', error);
            }

            // Get cinema info
            const cinema = cinemasData.find(c => c.id === showtime.cinemaId);

            // Get seats info from API
            let seatsInfo = null;
            try {
              seatsInfo = await showtimesPageService.getShowtimeSeatsInfo(showtime.id);
            } catch (error) {
              console.log('Getting seats info for showtime:', showtime.id);
            }

            return {
              ...showtime,
              movieTitle: movie?.title || `Phim ${showtime.movieId}`,
              moviePoster: movie?.poster,
              movieDuration: movie?.duration,
              movieGenre: movie?.genre,
              movieRating: movie?.rating,
              cinemaName: cinema?.name || `Rạp ${showtime.cinemaId}`,
              cinemaAddress: cinema?.address || '',
              cinemaCity: cinema?.city || '',
              roomName: roomInfo?.name || `Phòng ${showtime.roomId}`,
              roomType: roomInfo?.roomType || '2D',
              time: showtime.startTime?.substring(0, 5) || '00:00',
              endTime: showtime.endTime?.substring(0, 5) || '00:00',
              language: movie?.language || 'Vietsub',
              date: showtime.showDate,
              // Update seat information from API
              availableSeats: seatsInfo?.AvailableSeats || showtime.availableSeats || 50,
              totalSeats: seatsInfo?.TotalSeats || showtime.totalSeats || 100,
              bookedSeats: seatsInfo?.BookedSeats || 0,
              seatStatus: seatsInfo?.SeatStatus || 'Không xác định',
              isSoldOut: seatsInfo?.IsSoldOut || false
            };
          } catch (error) {
            console.error('Error enriching showtime:', error);
            return {
              ...showtime,
              movieTitle: `Phim ${showtime.movieId}`,
              cinemaName: `Rạp ${showtime.cinemaId}`,
              roomName: `Phòng ${showtime.roomId}`,
              time: showtime.startTime?.substring(0, 5) || '00:00',
              endTime: showtime.endTime?.substring(0, 5) || '00:00',
              language: 'Vietsub',
              availableSeats: showtime.availableSeats || 50,
              totalSeats: showtime.totalSeats || 100
            };
          }
        })
      );

      console.log('Enriched showtimes:', enrichedShowtimes);
      setShowtimes(enrichedShowtimes);
    } catch (error) {
      console.error('Error fetching showtimes:', error);
      setShowtimes([]);
    }
  };

  // Fetch showtimes
  const fetchShowtimes = async () => {
    if (cinemas.length > 0 && movies.length > 0) {
      setLoading(true);
      await fetchShowtimesWithData(cinemas, movies);
      setLoading(false);
    }
  };


  useEffect(() => {
    if (cinemas.length > 0 && movies.length > 0) {
      fetchShowtimes();
    }
  }, [selectedDate, selectedCinema, selectedMovie, selectedRoomType, selectedTimeSlot]);


  // Filter showtimes by city and selected cinema
  const filteredShowtimes = showtimes.filter(showtime => {
    // Filter by city if a city is selected
    if (selectedCity !== 'all') {
      const cinema = cinemas.find(c => c.id === showtime.cinemaId);
      if (cinema?.city !== selectedCity) return false;
    }
    
    // Filter by cinema if a cinema is selected
    if (selectedCinema !== null) {
      return showtime.cinemaId === selectedCinema;
    }
    
    return true;
  });

  // Group showtimes by cinema
  const showtimesByCinema = filteredShowtimes.reduce((acc, showtime) => {
    const cinema = cinemas.find(c => c.id === showtime.cinemaId);
    
    if (!acc[showtime.cinemaId]) {
      acc[showtime.cinemaId] = {
        cinema: {
          id: showtime.cinemaId,
          name: cinema?.name || showtime.cinemaName,
          address: cinema?.address || showtime.cinemaAddress
        },
        showtimes: []
      };
    }
    acc[showtime.cinemaId].showtimes.push(showtime);
    return acc;
  }, {} as Record<number, { cinema: Cinema; showtimes: Showtime[] }>);


  const getAvailabilityColor = (available: number, total: number) => {
    const percentage = (available / total) * 100;
    if (percentage > 70) return 'text-green-400';
    if (percentage > 30) return 'text-[#FFD875]';
    return 'text-red-400';
  };


  const getAvailabilityText = (available: number, total: number) => {
    const percentage = (available / total) * 100;
    if (percentage > 70) return 'Còn nhiều chỗ';
    if (percentage > 30) return 'Còn ít chỗ';
    return 'Sắp hết chỗ';
  };


  // Get unique cities from cinemas
  const cities = Array.from(new Set(cinemas.map(c => c.city).filter(Boolean)));


  // Toggle expanded state for cinema
  const toggleCinemaExpanded = (cinemaId: number) => {
    setExpandedCinemas(prev => ({
      ...prev,
      [cinemaId]: !prev[cinemaId]
    }));
  };

  return (
    <div className="min-h-screen bg-black pt-20">
      {/* Animated background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-slate-900 to-black" />
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-72 h-72 bg-[#FFD875]/10 rounded-full filter blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#FFD875]/5 rounded-full filter blur-3xl animate-pulse animation-delay-2000" />
        </div>
      </div>


      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl font-bold text-[#FFD875] mb-4 flex items-center gap-3" style={{ textShadow: '0 0 30px rgba(255, 216, 117, 0.5)' }}>
            <Sparkles className="w-10 h-10" />
            Lịch Chiếu Phim
          </h1>
          <p className="text-slate-400 text-lg">Chọn ngày, rạp và suất chiếu phù hợp với bạn</p>
        </motion.div>


        {/* Date Picker với thiết kế mới */}
        <motion.div
          className="bg-slate-900/50 backdrop-blur-md rounded-2xl p-6 mb-8 border border-[#FFD875]/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{ boxShadow: '0 0 40px rgba(255, 216, 117, 0.1)' }}
        >
          <h3 className="text-white font-semibold mb-4 flex items-center text-lg">
            <CalendarDays className="w-6 h-6 mr-2 text-[#FFD875]" />
            Chọn ngày chiếu
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {dates.map((date, index) => (
              <motion.button
                key={date.value}
                onClick={() => setSelectedDate(date.value)}
                className={`flex-shrink-0 rounded-xl text-center min-w-[100px] transition-all duration-300 relative overflow-hidden group ${selectedDate === date.value
                  ? 'bg-[#FFD875] text-black shadow-lg transform scale-105'
                  : date.isWeekend
                    ? 'bg-slate-800/70 text-[#FFD875] hover:bg-slate-700/70 border border-[#FFD875]/30'
                    : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-[#FFD875] border border-slate-700'
                  }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={selectedDate === date.value ? { boxShadow: '0 0 30px rgba(255, 216, 117, 0.5)' } : {}}
              >
                <div className="p-4">
                  <div className={`text-xs font-medium mb-1 ${date.isToday ? 'text-[#FFD875]' : ''}`}>
                    {date.isToday ? 'Hôm nay' : date.dayName}
                  </div>
                  <div className="text-2xl font-bold mb-1">{date.day}</div>
                  <div className="text-sm">Tháng {date.month}</div>
                </div>
                {selectedDate === date.value && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-t from-[#FFD875]/20 to-transparent"
                    layoutId="dateSelector"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>


        {/* Filters với dropdown style mới */}
        <motion.div
          className="bg-slate-900/50 backdrop-blur-md rounded-2xl p-6 mb-8 border border-[#FFD875]/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ boxShadow: '0 0 40px rgba(255, 216, 117, 0.1)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold flex items-center text-lg">
              <Filter className="w-6 h-6 mr-2 text-[#FFD875]" />
              Bộ lọc
            </h3>
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center gap-2 text-[#FFD875] hover:text-[#FFD875]/80 transition-colors"
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span className="text-sm font-medium">Bộ lọc nâng cao</span>
            </button>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* City Filter */}
            <div className="group">
              <label className="block text-[#FFD875] text-sm mb-2 font-medium">
                Thành phố
                {user && user.role === 'Staff' && user.cinemaId && (
                  <span className="ml-2 text-xs bg-[#FFD875]/20 text-[#FFD875] px-2 py-1 rounded-lg">
                    Theo rạp được phân công
                  </span>
                )}
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FFD875]/70 w-5 h-5 pointer-events-none" />
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  disabled={!!(user && user.role === 'Staff' && user.cinemaId)}
                  className={`w-full pl-10 pr-4 py-3 ${
                    user && user.role === 'Staff' && user.cinemaId 
                      ? 'bg-slate-700/50 text-slate-300 cursor-not-allowed border-slate-600' 
                      : 'bg-slate-800/70 text-white cursor-pointer hover:bg-slate-800/90 hover:border-[#FFD875]/50'
                  } rounded-xl border border-slate-700 focus:border-[#FFD875] focus:outline-none focus:ring-2 focus:ring-[#FFD875]/30 transition-all duration-300 appearance-none`}
                  style={{
                    backgroundImage: user && user.role === 'Staff' && user.cinemaId 
                      ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23888'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`
                      : `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23FFD875'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.7rem center',
                    backgroundSize: '1.5em 1.5em'
                  }}
                >
                  <option value="all">Tất cả thành phố</option>
                  {cities
                    .filter(city => {
                      // If user is staff, only show their assigned cinema's city
                      if (user && user.role === 'Staff' && user.cinemaId) {
                        const staffCinema = cinemas.find(c => c.id === user.cinemaId);
                        return city === staffCinema?.city;
                      }
                      return true;
                    })
                    .map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                </select>
              </div>
            </div>


            {/* Cinema Filter */}
            <div className="group">
              <label className="block text-[#FFD875] text-sm mb-2 font-medium">
                Rạp chiếu phim
                {user && user.role === 'Staff' && user.cinemaId && (
                  <span className="ml-2 text-xs bg-[#FFD875]/20 text-[#FFD875] px-2 py-1 rounded-lg">
                    Rạp được phân công
                  </span>
                )}
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FFD875]/70 w-5 h-5 pointer-events-none" />
                <select
                  value={selectedCinema || ''}
                  onChange={(e) => setSelectedCinema(e.target.value ? Number(e.target.value) : null)}
                  disabled={!!(user && user.role === 'Staff' && user.cinemaId)}
                  className={`w-full pl-10 pr-4 py-3 ${
                    user && user.role === 'Staff' && user.cinemaId 
                      ? 'bg-slate-700/50 text-slate-300 cursor-not-allowed border-slate-600' 
                      : 'bg-slate-800/70 text-white cursor-pointer hover:bg-slate-800/90 hover:border-[#FFD875]/50'
                  } rounded-xl border border-slate-700 focus:border-[#FFD875] focus:outline-none focus:ring-2 focus:ring-[#FFD875]/30 transition-all duration-300 appearance-none`}
                  style={{
                    backgroundImage: user && user.role === 'Staff' && user.cinemaId 
                      ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23888'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`
                      : `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23FFD875'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.7rem center',
                    backgroundSize: '1.5em 1.5em'
                  }}
                >
                  <option value="">Tất cả rạp</option>
                  {cinemas
                    .filter(cinema => selectedCity === 'all' || cinema.city === selectedCity)
                    .filter(cinema => {
                      // If user is staff, only show their assigned cinema
                      if (user && user.role === 'Staff' && user.cinemaId) {
                        return cinema.id === user.cinemaId;
                      }
                      return true;
                    })
                    .map(cinema => (
                      <option key={cinema.id} value={cinema.id}>{cinema.name}</option>
                    ))}
                </select>
              </div>
            </div>


            {/* Movie Filter */}
            <div className="group">
              <label className="block text-[#FFD875] text-sm mb-2 font-medium">Phim</label>
              <div className="relative">
                <Film className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FFD875]/70 w-5 h-5 pointer-events-none" />
                <select
                  value={selectedMovie || ''}
                  onChange={(e) => setSelectedMovie(e.target.value ? Number(e.target.value) : null)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/70 text-white rounded-xl border border-slate-700 focus:border-[#FFD875] focus:outline-none focus:ring-2 focus:ring-[#FFD875]/30 transition-all duration-300 appearance-none cursor-pointer hover:bg-slate-800/90 hover:border-[#FFD875]/50"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23FFD875'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.7rem center',
                    backgroundSize: '1.5em 1.5em'
                  }}
                >
                  <option value="">Tất cả phim</option>
                  {movies.map(movie => (
                    <option key={movie.id} value={movie.id}>{movie.title}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>


          {/* Advanced Filters */}
          <AnimatePresence>
            {showAdvancedFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 pt-4 border-t border-slate-700"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Room Type Filter */}
                  <div className="group">
                    <label className="block text-[#FFD875] text-sm mb-2 font-medium">Loại phòng chiếu</label>
                    <select
                      value={selectedRoomType}
                      onChange={(e) => setSelectedRoomType(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-800/70 text-white rounded-xl border border-slate-700 focus:border-[#FFD875] focus:outline-none focus:ring-2 focus:ring-[#FFD875]/30 transition-all duration-300 appearance-none cursor-pointer hover:bg-slate-800/90 hover:border-[#FFD875]/50"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23FFD875'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 0.7rem center',
                        backgroundSize: '1.5em 1.5em'
                      }}
                    >
                      <option value="all">Tất cả loại phòng</option>
                      <option value="2D">2D</option>
                      <option value="3D">3D</option>
                      <option value="IMAX">IMAX</option>
                      <option value="4DX">4DX</option>
                      <option value="VIP">VIP</option>
                    </select>
                  </div>


                  {/* Time Slot Filter */}
                  <div className="group">
                    <label className="block text-[#FFD875] text-sm mb-2 font-medium">Khung giờ</label>
                    <select
                      value={selectedTimeSlot}
                      onChange={(e) => setSelectedTimeSlot(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-800/70 text-white rounded-xl border border-slate-700 focus:border-[#FFD875] focus:outline-none focus:ring-2 focus:ring-[#FFD875]/30 transition-all duration-300 appearance-none cursor-pointer hover:bg-slate-800/90 hover:border-[#FFD875]/50"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23FFD875'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 0.7rem center',
                        backgroundSize: '1.5em 1.5em'
                      }}
                    >
                      <option value="all">Tất cả khung giờ</option>
                      <option value="morning">Buổi sáng (06:00 - 12:00)</option>
                      <option value="afternoon">Buổi chiều (12:00 - 18:00)</option>
                      <option value="evening">Buổi tối (18:00 - 24:00)</option>
                      <option value="late">Khuya (00:00 - 06:00)</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>


        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFD875]"></div>
            <p className="text-slate-400 mt-4">Đang tải lịch chiếu...</p>
          </div>
        )}


        {/* Showtimes by Cinema với phân trang */}
        {!loading && (
          <div className="space-y-8">
            {Object.values(showtimesByCinema).map(({ cinema, showtimes }, index) => {
              const isExpanded = expandedCinemas[cinema.id] || false;
              const displayedShowtimes = isExpanded ? showtimes : showtimes.slice(0, showtimesPerCinema);
              const hasMore = showtimes.length > showtimesPerCinema;


              return (
                <motion.div
                  key={cinema.id}
                  className="bg-slate-900/50 backdrop-blur-md rounded-2xl overflow-hidden border border-[#FFD875]/20"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  style={{ boxShadow: '0 0 40px rgba(255, 216, 117, 0.1)' }}
                >
                  {/* Cinema Header */}
                  <div className="p-6 border-b border-slate-800/50 bg-gradient-to-r from-slate-900/50 to-slate-800/50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-[#FFD875] mb-2 flex items-center gap-2">
                          <Building2 className="w-6 h-6" />
                          {cinema.name}
                        </h3>
                        <div className="flex items-center text-slate-400 mb-2">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span className="text-sm">{cinema.address}</span>
                        </div>
                      </div>


                    </div>
                  </div>


                  {/* Showtimes Grid */}
                  <div className="p-6">
                    {/* Group by movie */}
                    {(() => {
                      const filteredMovies = movies.filter(movie => displayedShowtimes.some(s => s.movieId === movie.id));
                      
                      // Fallback: If no movies match, create fake movies from showtimes
                      if (filteredMovies.length === 0 && displayedShowtimes.length > 0) {
                        const uniqueMovieIds = [...new Set(displayedShowtimes.map(s => s.movieId))];
                        const fakeMovies = uniqueMovieIds.map(movieId => ({
                          id: movieId,
                          title: `Phim ${movieId}`,
                          poster: '',
                          duration: 120,
                          genre: 'Unknown',
                          rating: 'NC-17'
                        }));
                        return fakeMovies;
                      }
                      
                      return filteredMovies;
                    })()
                      .map(movie => {
                        const movieShowtimes = displayedShowtimes.filter(s => s.movieId === movie.id);
                        if (movieShowtimes.length === 0) return null;


                        return (
                          <div key={movie.id} className="mb-8 last:mb-0">
                            <div className="flex items-start gap-4 mb-4">
                              {movieShowtimes[0].moviePoster && (
                                <img
                                  src={movieShowtimes[0].moviePoster}
                                  alt={movie.title}
                                  className="w-20 h-28 object-cover rounded-lg shadow-lg"
                                />
                              )}
                              <div>
                                <h4 className="text-xl font-semibold text-white mb-2">{movieShowtimes[0].movieTitle || movie.title}</h4>
                                <div className="flex items-center gap-4 text-sm text-slate-400">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {movieShowtimes[0].movieDuration || movie.duration} phút
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Star className="w-4 h-4 text-[#FFD875]" />
                                    {movieShowtimes[0].movieRating || movie.rating}
                                  </span>
                                  <span>{movieShowtimes[0].movieGenre || movie.genre}</span>
                                </div>
                              </div>
                            </div>


                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                              {movieShowtimes.map((showtime, idx) => (
                                <motion.div
                                  key={showtime.id}
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                                >
                                  <button
                                    onClick={() => handleSelectShowtime(showtime)}
                                    className="w-full text-left bg-slate-800/50 hover:bg-slate-700/50 rounded-xl p-4 transition-all duration-300 border border-slate-700 hover:border-[#FFD875]/50 group"
                                    style={{
                                      transition: 'all 0.3s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 216, 117, 0.3)';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.boxShadow = 'none';
                                    }}
                                  >
                                    <div className="flex items-center justify-between mb-3">
                                      <div className="text-white font-bold text-xl group-hover:text-[#FFD875] transition-colors">
                                        {showtime.time}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="bg-[#FFD875]/20 text-[#FFD875] text-xs px-2 py-1 rounded-lg font-medium">
                                          {showtime.roomType}
                                        </span>
                                        {showtime.isSoldOut && (
                                          <span className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded-lg font-medium">
                                            Hết ghế
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    <div className="text-slate-400 text-sm mb-2">
                                      {showtime.roomName} • {showtime.language}
                                    </div>

                                    <div className={`text-xs mt-2 flex items-center ${getAvailabilityColor(showtime.availableSeats, showtime.totalSeats)}`}>
                                      <Users className="w-4 h-4 mr-1" />
                                      <span>{showtime.seatStatus || getAvailabilityText(showtime.availableSeats, showtime.totalSeats)}</span>
                                    </div>
                                  </button>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        );
                      })}


                    {/* Show more/less button */}
                    {hasMore && (
                      <div className="mt-6 text-center">
                        <button
                          onClick={() => toggleCinemaExpanded(cinema.id)}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-[#FFD875]/10 hover:bg-[#FFD875]/20 text-[#FFD875] rounded-xl transition-all duration-300 font-medium border border-[#FFD875]/30 hover:border-[#FFD875]/50"
                          style={{
                            boxShadow: isExpanded ? '0 0 20px rgba(255, 216, 117, 0.2)' : 'none'
                          }}
                        >
                          {isExpanded ? (
                            <>
                              Thu gọn
                              <ChevronLeft className="w-4 h-4 rotate-90" />
                            </>
                          ) : (
                            <>
                              Xem thêm {showtimes.length - showtimesPerCinema} suất chiếu
                              <ChevronRight className="w-4 h-4 rotate-90" />
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}


        {/* No Results - Ẩn thông báo lỗi */}
        {!loading && Object.keys(showtimesByCinema).length === 0 && (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-slate-400 mb-4">
              <Clock className="w-20 h-20 mx-auto mb-4 text-[#FFD875]/30" />
              <p className="text-xl">Đang cập nhật lịch chiếu</p>
              <p className="text-sm mt-2">Vui lòng thử lại sau</p>
            </div>
          </motion.div>
        )}
      </div>      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={handleAuthModalClose}
        onSuccess={handleAuthSuccess}
      />

      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
       
        /* Custom select dropdown styles */
        select option {
          background-color: #1e293b;
          color: white;
          padding: 10px;
        }
       
        select option:hover {
          background-color: #FFD875;
          color: black;
        }
       
        /* Glowing effect for focused elements */
        select:focus {
          box-shadow: 0 0 20px rgba(255, 216, 117, 0.3);
        }
      `}</style>
    </div>
  );
};

export default ShowtimePage;
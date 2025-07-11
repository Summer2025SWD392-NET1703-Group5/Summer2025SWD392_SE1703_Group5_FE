// pages/CinemaDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin, Clock, Calendar,
  ArrowLeft, Share2, Heart, Navigation, Info, Ticket, Building2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Cinema } from '../types/cinema';
import { cinemaService } from '../services/cinemaService';
import FullScreenLoader from '../components/FullScreenLoader';
import toast from 'react-hot-toast';

interface Movie {
  Movie_ID: number;
  Movie_Name: string;
  Duration: number;
  Poster_URL: string;
  Genre: string;
  Status: string;
}

interface ShowtimeData {
  Showtime_ID: number;
  Movie_ID: number;
  Movie_Name: string;
  Room_Name: string;
  Start_Time: string;
  End_Time: string;
  Show_Date: string;
  Status: string;
  Capacity_Available: number;
  Capacity_Total: number;
  Poster_URL: string;
  Duration: number;
  showtime_id?: number;
  start_time?: string;
  end_time?: string;
  room_id?: number;
  room_name?: string;
  room_type?: string;
  capacity_available?: number;
  capacity_total?: number;
  movie_id?: number;
  movie_name?: string;
  duration?: number;
  poster_url?: string;
  rating?: string;
}

const CinemaDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cinema, setCinema] = useState<Cinema | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'showtimes'>('info');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Showtimes states
  const [movies, setMovies] = useState<Movie[]>([]);
  const [showtimes, setShowtimes] = useState<ShowtimeData[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedMovie, setSelectedMovie] = useState<string>('all');
  const [isLoadingShowtimes, setIsLoadingShowtimes] = useState(false);
  const [showtimeSeats, setShowtimeSeats] = useState<Record<string, any>>({});

  // Function to calculate distance between two coordinates
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Get user location on component mount
  useEffect(() => {
    const getUserLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          },
          (error) => {
            console.log('Error getting user location:', error);
            // Don't show error to user, just skip location feature
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000, // 5 minutes
          }
        );
      }
    };

    getUserLocation();
  }, []);

  useEffect(() => {
    const fetchCinema = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        setError(null);

        const cinemaData = await cinemaService.getCinemaById(id);
        setCinema(cinemaData);
        fetchMovies();
      } catch (err: any) {
        setError(err.message || 'Không thể tải thông tin rạp. Vui lòng thử lại sau.');
        toast.error('Không thể tải thông tin rạp');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCinema();
  }, [id]);

  const fetchMovies = async () => {
    if (!id) return;

    try {
      const moviesData = await cinemaService.getMoviesByCinema(id);
      const moviesArray = Array.isArray(moviesData) ? moviesData : [];
      setMovies(moviesArray);
    } catch (error) {
      setMovies([]);
    }
  };

  const fetchShowtimes = async () => {
    if (!id) return;

    try {
      setIsLoadingShowtimes(true);
      const showtimesData = await cinemaService.getCinemaShowtimesByDate(id, selectedDate);
      const showtimesArray = Array.isArray(showtimesData) ? showtimesData as unknown as ShowtimeData[] : [];
      setShowtimes(showtimesArray);
      await fetchSeatsForShowtimes(showtimesArray);
    } catch (error) {
      setShowtimes([]);
    } finally {
      setIsLoadingShowtimes(false);
    }
  };

  const fetchSeatsForShowtimes = async (showtimesArray: ShowtimeData[]) => {
    const seatsData: Record<string, any> = {};

    const seatPromises = showtimesArray.map(async (showtime) => {
      const showtimeId = showtime.Showtime_ID || showtime.showtime_id;
      if (showtimeId) {
        try {
          const seats = await cinemaService.getSeatInfoByShowtime(showtimeId);
          if (seats) {
            seatsData[showtimeId.toString()] = seats;
          }
        } catch (error) {
          // Silent fail
        }
      }
    });

    await Promise.all(seatPromises);
    setShowtimeSeats(seatsData);
  };

  // Fetch showtimes when date or movie changes
  useEffect(() => {
    if (activeTab === 'showtimes') {
      fetchShowtimes();
    }
  }, [selectedDate, activeTab]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: cinema?.Cinema_Name || '',
          text: cinema?.Description || '',
          url: window.location.href,
        });
      } catch (error) {
        // Silent fail
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link đã được sao chép!');
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  // Generate date options for next 7 days
  const getDateOptions = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: i === 0 ? 'Hôm nay' : i === 1 ? 'Ngày mai' : date.toLocaleDateString('vi-VN', {
          weekday: 'short',
          day: '2-digit',
          month: '2-digit'
        })
      });
    }
    return dates;
  };

  // Filter showtimes by selected movie - with safety checks
  const safeShowtimes = Array.isArray(showtimes) ? showtimes : [];

  const filteredShowtimes = selectedMovie === 'all'
    ? safeShowtimes
    : safeShowtimes.filter(showtime => {
      const movieId = (showtime?.Movie_ID || showtime?.movie_id)?.toString();
      return movieId === selectedMovie;
    });

  // Group showtimes by movie - with safety checks and flexible field mapping
  const groupedShowtimes = Array.isArray(filteredShowtimes)
    ? filteredShowtimes.reduce((acc, showtime) => {
      if (!showtime) return acc;

      const movieId = (showtime.Movie_ID || showtime.movie_id)?.toString();
      if (!movieId) return acc;

      const movieName = showtime.Movie_Name || showtime.movie_name || 'Chưa xác định';
      const duration = showtime.Duration || showtime.duration || 0;
      const posterUrl = showtime.Poster_URL || showtime.poster_url || '/placeholder.jpg';

      if (!acc[movieId]) {
        acc[movieId] = {
          movie: {
            Movie_ID: parseInt(movieId),
            Movie_Name: movieName,
            Duration: duration,
            Poster_URL: posterUrl
          },
          showtimes: []
        };
      }
      acc[movieId].showtimes.push(showtime);
      return acc;
    }, {} as Record<string, { movie: any; showtimes: ShowtimeData[] }>)
    : {};

  if (isLoading) {
    return <FullScreenLoader text="Đang tải thông tin rạp chiếu phim..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black pt-20">
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-black via-slate-900 to-black" />
        </div>
        <div className="container mx-auto px-4 py-8 relative z-10">
          <motion.div
            className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center backdrop-blur-md max-w-md mx-auto mt-20"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ boxShadow: '0 0 40px rgba(239, 68, 68, 0.1)' }}
          >
            <p className="text-red-400 mb-6 text-lg">{error}</p>
            <button
              onClick={() => navigate('/cinemas')}
              className="px-6 py-3 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-all duration-300 font-medium"
            >
              Quay lại danh sách rạp
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!cinema) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black pt-20">
      {/* Animated background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-slate-900 to-black" />
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-72 h-72 bg-[#FFD875]/10 rounded-full filter blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#FFD875]/5 rounded-full filter blur-3xl animate-pulse animation-delay-2000" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#FFD875]/5 rounded-full filter blur-3xl animate-pulse animation-delay-4000" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Back Button */}
        <motion.button
          onClick={handleGoBack}
          className="flex items-center text-slate-400 hover:text-[#FFD875] mb-8 transition-all duration-300 group"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          whileHover={{ x: -5 }}
        >
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:animate-pulse" />
          <span className="font-medium">Quay lại danh sách rạp</span>
        </motion.button>

        {/* Cinema Header */}
        <motion.div
          className="relative h-80 md:h-96 rounded-2xl overflow-hidden mb-8 border border-[#FFD875]/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ boxShadow: '0 0 40px rgba(255, 216, 117, 0.1)' }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

          {/* Cinema Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <motion.h1
                  className="text-4xl md:text-5xl font-bold text-[#FFD875] mb-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  style={{ textShadow: '0 0 30px rgba(255, 216, 117, 0.5)' }}
                >
                  {cinema.Cinema_Name}
                </motion.h1>
                <motion.div
                  className="flex items-center text-slate-300 mb-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <MapPin className="w-5 h-5 mr-2 text-[#FFD875]" />
                  <span className="text-lg">{cinema.Address}</span>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs Navigation */}
        <motion.div
          className="flex border-b border-[#FFD875]/20 mb-8 bg-slate-900/30 backdrop-blur-md rounded-t-2xl p-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{ boxShadow: '0 0 20px rgba(255, 216, 117, 0.05)' }}
        >
          {[
            { key: 'info', label: 'Thông tin', icon: Info },
            { key: 'showtimes', label: 'Lịch chiếu', icon: Calendar },
          ].map(({ key, label, icon: Icon }) => (
            <motion.button
              key={key}
              className={`px-6 py-4 font-medium transition-all duration-300 rounded-xl flex items-center gap-2 ${activeTab === key
                ? 'text-[#FFD875] bg-[#FFD875]/10 border border-[#FFD875]/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              onClick={() => setActiveTab(key as any)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={activeTab === key ? { boxShadow: '0 0 15px rgba(255, 216, 117, 0.2)' } : {}}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'info' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Description */}
                  <motion.div
                    className="bg-slate-900/50 backdrop-blur-md rounded-2xl p-6 border border-[#FFD875]/20"
                    style={{ boxShadow: '0 0 40px rgba(255, 216, 117, 0.1)' }}
                  >
                    <h2 className="text-2xl font-bold text-[#FFD875] mb-4 flex items-center gap-2">
                      <Building2 className="w-6 h-6" />
                      Giới thiệu
                    </h2>
                    <p className="text-slate-300 leading-relaxed text-lg">{cinema.Description}</p>
                  </motion.div>

                  {/* Contact Info */}
                  <motion.div
                    className="bg-slate-900/50 backdrop-blur-md rounded-2xl p-6 border border-[#FFD875]/20"
                    style={{ boxShadow: '0 0 40px rgba(255, 216, 117, 0.1)' }}
                  >
                    <h2 className="text-2xl font-bold text-[#FFD875] mb-6">Thông tin liên hệ</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-start gap-4">
                        <div className="bg-[#FFD875]/20 p-3 rounded-xl">
                          <MapPin className="w-6 h-6 text-[#FFD875]" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold mb-2">Địa chỉ</h3>
                          <p className="text-slate-400">{cinema.Address}</p>
                          <p className="text-slate-400">{cinema.City}</p>
                        </div>
                      </div>

                      {cinema.Phone_Number && (
                        <div className="flex items-start gap-4">
                          <div className="bg-[#FFD875]/20 p-3 rounded-xl">
                            <Clock className="w-6 h-6 text-[#FFD875]" />
                          </div>
                          <div>
                            <h3 className="text-white font-semibold mb-2">Liên hệ</h3>
                            <p className="text-slate-400">{cinema.Phone_Number}</p>
                            {cinema.Email && <p className="text-slate-400">{cinema.Email}</p>}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Quick Actions */}
                  <motion.div
                    className="bg-slate-900/50 backdrop-blur-md rounded-2xl p-6 border border-[#FFD875]/20"
                    style={{ boxShadow: '0 0 40px rgba(255, 216, 117, 0.1)' }}
                  >
                    <h2 className="text-xl font-bold text-[#FFD875] mb-6">Hành động nhanh</h2>
                    <div className="space-y-4">
                      <Link
                        to={`/showtimes?cinema=${cinema.Cinema_ID}`}
                        className="flex items-center justify-center bg-[#FFD875] hover:bg-[#FFD875]/90 text-black py-4 px-4 rounded-xl font-bold transition-all duration-300 w-full group"
                        style={{ boxShadow: '0 4px 15px rgba(255, 216, 117, 0.3)' }}
                      >
                        <Calendar className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                        Xem lịch chiếu
                      </Link>
                    </div>
                  </motion.div>

                  {/* Distance */}
                  {userLocation && (cinema as any).coordinates && (
                    <motion.div
                      className="bg-slate-900/50 backdrop-blur-md rounded-2xl p-6 border border-[#FFD875]/20 text-center"
                      style={{ boxShadow: '0 0 40px rgba(255, 216, 117, 0.1)' }}
                    >
                      <Navigation className="w-8 h-8 mx-auto mb-3 text-[#FFD875]" />
                      <h3 className="text-white font-semibold mb-2">Khoảng cách</h3>
                      <p className="text-[#FFD875] text-2xl font-bold">
                        {calculateDistance(
                          userLocation.lat,
                          userLocation.lng,
                          (cinema as any).coordinates.lat,
                          (cinema as any).coordinates.lng
                        ).toFixed(1)} km
                      </p>
                      <p className="text-slate-400 text-sm">từ vị trí của bạn</p>
                    </motion.div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'showtimes' && (
              <div className="space-y-6">
                {/* Date and Movie Filters */}
                <motion.div
                  className="bg-slate-900/50 backdrop-blur-md rounded-2xl p-6 border border-[#FFD875]/20"
                  style={{ boxShadow: '0 0 40px rgba(255, 216, 117, 0.1)' }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Date Filter */}
                    <div>
                      <label className="block text-white font-semibold mb-2">Chọn ngày</label>
                      <select
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-800/70 text-white rounded-xl border border-slate-700 focus:border-[#FFD875] focus:outline-none focus:ring-2 focus:ring-[#FFD875]/30 transition-all duration-300 appearance-none cursor-pointer"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23FFD875'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 0.7rem center',
                          backgroundSize: '1.5em 1.5em'
                        }}
                      >
                        {getDateOptions().map(date => (
                          <option key={date.value} value={date.value}>
                            {date.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Movie Filter */}
                    <div>
                      <label className="block text-white font-semibold mb-2">Chọn phim</label>
                      <select
                        value={selectedMovie}
                        onChange={(e) => setSelectedMovie(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-800/70 text-white rounded-xl border border-slate-700 focus:border-[#FFD875] focus:outline-none focus:ring-2 focus:ring-[#FFD875]/30 transition-all duration-300 appearance-none cursor-pointer"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23FFD875'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 0.7rem center',
                          backgroundSize: '1.5em 1.5em'
                        }}
                      >
                        <option value="all">Tất cả phim</option>
                        {movies.map(movie => (
                          <option key={movie.Movie_ID} value={movie.Movie_ID.toString()}>
                            {movie.Movie_Name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </motion.div>

                {/* Showtimes Display */}
                {isLoadingShowtimes ? (
                  <motion.div
                    className="bg-slate-900/50 backdrop-blur-md rounded-2xl p-8 border border-[#FFD875]/20 text-center"
                    style={{ boxShadow: '0 0 40px rgba(255, 216, 117, 0.1)' }}
                  >
                    <div className="relative mb-6">
                      <div className="w-16 h-16 border-4 border-[#FFD875]/20 border-t-[#FFD875] rounded-full animate-spin mx-auto"></div>
                    </div>
                    <p className="text-slate-400 text-lg">Đang tải lịch chiếu...</p>
                  </motion.div>
                ) : Object.keys(groupedShowtimes).length === 0 ? (
                  <motion.div
                    className="bg-slate-900/50 backdrop-blur-md rounded-2xl p-8 border border-[#FFD875]/20 text-center"
                    style={{ boxShadow: '0 0 40px rgba(255, 216, 117, 0.1)' }}
                  >
                    <Calendar className="w-20 h-20 mx-auto text-[#FFD875]/50 mb-6" />
                    <h3 className="text-2xl font-bold text-white mb-4">Không có suất chiếu</h3>
                    <p className="text-slate-400 text-lg">Không có suất chiếu nào trong ngày được chọn</p>
                  </motion.div>
                ) : (
                  <div className="space-y-6">
                    {Object.values(groupedShowtimes).map(({ movie, showtimes }) => (
                      <motion.div
                        key={movie.Movie_ID}
                        className="bg-slate-900/50 backdrop-blur-md rounded-2xl p-6 border border-[#FFD875]/20"
                        style={{ boxShadow: '0 0 40px rgba(255, 216, 117, 0.1)' }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {/* Movie Info */}
                        <div className="flex items-start gap-4 mb-6">
                          <img
                            src={movie.Poster_URL || '/placeholder.jpg'}
                            alt={movie.Movie_Name}
                            className="w-20 h-28 object-cover rounded-xl border border-[#FFD875]/20"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder.jpg';
                            }}
                          />
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-white mb-2">
                              {movie.Movie_Name}
                            </h3>
                            <div className="flex items-center gap-4 text-slate-400">
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {movie.Duration} phút
                              </span>
                              <span className="flex items-center gap-1">
                                <Ticket className="w-4 h-4" />
                                {showtimes.length} suất chiếu
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Showtimes Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {showtimes.map((showtime, index) => {
                            // Get showtime ID with fallback
                            const showtimeId = showtime.Showtime_ID || showtime.showtime_id;

                            // Get start time with fallback
                            const startTime = showtime.Start_Time || showtime.start_time || '--:--';
                            const displayTime = startTime.length > 5 ? startTime.substring(0, 5) : startTime;

                            // Get room name with fallback
                            const roomName = showtime.Room_Name || showtime.room_name || 'Phòng chiếu';

                            // Get capacity with fallback - use real seat data if available
                            const seatData = showtimeId ? showtimeSeats[showtimeId.toString()] : null;
                            let available = showtime.Capacity_Available ?? showtime.capacity_available ?? 0;
                            let total = showtime.Capacity_Total ?? showtime.capacity_total ?? 0;
                            let booked = 0;

                            // Use real seat data if available
                            if (seatData?.summary) {
                              available = seatData.summary.available;
                              total = seatData.summary.total;
                              booked = seatData.summary.booked;
                            } else {
                              // Calculate booked from available if no seat data
                              booked = total - available;
                            }

                            // Create unique key
                            const uniqueKey = showtimeId ? `showtime-${showtimeId}` : `showtime-${movie.Movie_ID}-${index}`;

                            return (
                              <Link
                                key={uniqueKey}
                                to={`/booking/${showtimeId}`}
                                className="group"
                              >
                                <motion.div
                                  className="bg-slate-800/50 hover:bg-[#FFD875]/10 border border-slate-700 hover:border-[#FFD875]/50 rounded-xl p-4 transition-all duration-300 cursor-pointer"
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  <div className="text-center">
                                    <div className="text-lg font-bold text-white group-hover:text-[#FFD875] transition-colors">
                                      {displayTime}
                                    </div>
                                    <div className="text-sm text-slate-400 mb-2">
                                      {roomName}
                                    </div>
                                    <div className="text-xs text-green-400">
                                      {booked}/{total}
                                    </div>
                                  </div>
                                </motion.div>
                              </Link>
                            );
                          })}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
          .animation-delay-150 {
            animation-delay: 150ms;
          }
        `
      }} />
    </div>
  );
};

export default CinemaDetailPage;



import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  CalendarIcon,
  ClockIcon,
  ArrowLeftIcon,
  StarIcon,
  TicketIcon,
  BuildingOfficeIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import Header from '../components/Header';
import { movieService } from '../services/movieService';
import { getCinemas, getShowtimesByMovieAndDate } from '../services/showtimeService';
import type { Movie, Cinema, Showtime } from '../types';

const MovieShowtimePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [cinemas, setCinemas] = useState<Map<string, any>>(new Map());
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedCinemaId, setSelectedCinemaId] = useState<number | null>(null);
  const [isContentLoaded, setIsContentLoaded] = useState(false);

  // Tạo danh sách ngày trong 7 ngày tới
  const next7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date;
  });

  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        navigate('/movies');
        return;
      }

      setLoading(true);
      
      try {
        // Load movie data
        const movieData = await movieService.getMovieById(id);
        if (movieData) {
          // Map backend data to frontend Movie type
          const mappedMovie: Movie = {
            Movie_ID: movieData.Movie_ID,
            id: movieData.Movie_ID?.toString() || id,
            title: movieData.Movie_Name || movieData.title || '',
            poster: movieData.Poster_URL || movieData.poster || '',
            duration: movieData.Duration || movieData.duration || 0,
            releaseDate: movieData.Release_Date || movieData.releaseDate || '',
            premiereDate: movieData.Premiere_Date || movieData.premiereDate,
            endDate: movieData.End_Date || movieData.endDate,
            productionCompany: movieData.Production_Company || movieData.productionCompany,
            director: movieData.Director || movieData.director || '',
            cast: movieData.Cast || movieData.cast || '',
            genre: movieData.Genre || movieData.genre || '',
            rating: movieData.Rating || movieData.rating,
            language: movieData.Language || movieData.language,
            country: movieData.Country || movieData.country,
            synopsis: movieData.Synopsis || movieData.synopsis,
            trailerLink: movieData.Trailer_Link || movieData.trailerLink,
            status: movieData.Status || movieData.status
          };
          setMovie(mappedMovie);
        } else {
          navigate('/movies');
          return;
        }

        // Load cinemas data
        const cinemaMap = await getCinemas();
        setCinemas(cinemaMap);

        // Load showtimes for the selected date
        const dateStr = selectedDate.toISOString().split('T')[0];
        const showtimesData = await getShowtimesByMovieAndDate(id, dateStr);
        if (Array.isArray(showtimesData)) {
          setShowtimes(showtimesData.filter((s): s is Showtime => s !== null));
        }

        setLoading(false);
        
        // Delay hiệu ứng hiển thị nội dung
        setTimeout(() => {
          setIsContentLoaded(true);
        }, 300);
        
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu phim:", error);
        setLoading(false);
        navigate('/movies');
      }
    };

    loadData();
  }, [id, selectedDate, navigate]);

  // Lọc suất chiếu theo ngày và rạp đã chọn
  const filteredShowtimes = showtimes.filter((showtime) => {
    // Kiểm tra phim
    if (movie && showtime.movieId !== movie.Movie_ID?.toString() && showtime.movieId !== movie.id) return false;

    // Kiểm tra ngày
    if (!showtime.startTime) return false;
    const showtimeDate = new Date(showtime.startTime);
    const isSameDate =
      showtimeDate.getDate() === selectedDate.getDate() &&
      showtimeDate.getMonth() === selectedDate.getMonth() &&
      showtimeDate.getFullYear() === selectedDate.getFullYear();

    if (!isSameDate) return false;

    // Kiểm tra rạp nếu đã chọn
    if (selectedCinemaId !== null && parseInt(showtime.cinemaId) !== selectedCinemaId) {
      return false;
    }

    return true;
  });

  // Nhóm suất chiếu theo rạp
  const showtimesByCinema: Record<string, Showtime[]> = {};
  filteredShowtimes.forEach((showtime) => {
    if (!showtimesByCinema[showtime.cinemaId]) {
      showtimesByCinema[showtime.cinemaId] = [];
    }
    showtimesByCinema[showtime.cinemaId].push(showtime);
  });

  // Format thời gian
  const formatTime = (dateString: string | Date | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format ngày
  const formatDate = (date: Date, format: 'short' | 'full' = 'short') => {
    if (format === 'short') {
      return date.toLocaleDateString('vi-VN', {
        weekday: 'short',
        day: 'numeric',
        month: 'numeric'
      });
    }

    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    });
  };

  // Xử lý khi chọn suất chiếu
  const handleSelectShowtime = (showtime: Showtime, cinemaData: any) => {
    // Convert cinema data to proper Cinema type
    const cinema: Cinema = {
      Cinema_ID: parseInt(cinemaData.id),
      Cinema_Name: cinemaData.name,
      Address: cinemaData.address,
      City: cinemaData.city || '',
      Phone_Number: cinemaData.phoneNumber,
      Email: cinemaData.email,
      Description: cinemaData.description,
      Status: cinemaData.status as 'Active' | 'Maintenance' | 'Closed' | 'Deleted'
    };

    navigate(`/seat-selection`, {
      state: {
        movie,
        cinema,
        showtime
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Header />
        <div className="pt-20 flex flex-col items-center justify-center h-[80vh]">
          <div className="w-16 h-16 border-4 border-[#FFD875] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-lg text-white">Đang tải thông tin suất chiếu...</p>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Header />
        <div className="pt-24 pb-12">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl font-bold text-white mb-4">
              Không tìm thấy phim
            </h1>
            <p className="text-gray-400 mb-6">
              Rất tiếc, chúng tôi không thể tìm thấy thông tin phim bạn đang tìm kiếm.
            </p>
            <Link to="/movies" className="bg-[#FFD875] hover:bg-[#FFD875]/80 text-black py-3 px-6 rounded-lg font-medium transition-all duration-300 transform hover:scale-105">
              Quay lại danh sách phim
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Header />

      <main className={`pt-20 ${isContentLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-700`}>
        {/* Movie Banner */}
        <section className="relative h-64 md:h-80 overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={movie.backgroundImage || movie.poster}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
          </div>

          <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
            <div className="flex items-center">
              <div className="hidden md:block mr-6">
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-32 h-48 object-cover rounded-lg shadow-lg animate-fadeInLeft"
                />
              </div>

              <div className="animate-fadeInUp">
                <Link to={`/movies/${movie.id}`} className="flex items-center text-[#FFD875] mb-2 hover:underline">
                  <ArrowLeftIcon className="w-4 h-4 mr-1" />
                  <span>Quay lại thông tin phim</span>
                </Link>

                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{movie.title}</h1>

                <div className="flex flex-wrap items-center gap-4 text-gray-300 text-sm">
                  <div className="flex items-center">
                    <StarIcon className="w-5 h-5 text-[#FFD875] mr-1" />
                    <span>{movie.rating}/10</span>
                  </div>

                  <div className="flex items-center">
                    <ClockIcon className="w-5 h-5 text-[#FFD875] mr-1" />
                    <span>{movie.duration}</span>
                  </div>

                  <div className="bg-red-600 text-white px-2 py-0.5 rounded-md text-xs font-bold">
                    {movie.ageRating}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Booking Steps */}
        <section className="bg-slate-800 border-y border-slate-700">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-center">
              <div className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-[#FFD875] text-black flex items-center justify-center font-bold">1</div>
                  <span className="text-xs text-[#FFD875] mt-1">Suất chiếu</span>
                </div>
                <div className="w-12 h-1 bg-gray-700 mx-1"></div>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-700 text-gray-400 flex items-center justify-center font-bold">2</div>
                  <span className="text-xs text-gray-400 mt-1">Chọn ghế</span>
                </div>
                <div className="w-12 h-1 bg-gray-700 mx-1"></div>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-700 text-gray-400 flex items-center justify-center font-bold">3</div>
                  <span className="text-xs text-gray-400 mt-1">Thanh toán</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Showtime Selection */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              {/* Date Selection */}
              <div className="glass-dark rounded-2xl p-6 border border-gray-700/50 mb-8 animate-fadeInUp">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <CalendarIcon className="w-5 h-5 mr-2 text-[#FFD875]" />
                  Chọn ngày xem phim
                </h3>

                <div className="flex overflow-x-auto pb-2 space-x-3">
                  {next7Days.map((date, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedDate(date)}
                      className={`flex flex-col items-center justify-center min-w-[80px] h-20 rounded-lg border transition-all duration-300 ${selectedDate.getDate() === date.getDate() &&
                          selectedDate.getMonth() === date.getMonth()
                          ? 'bg-[#FFD875]/20 border-[#FFD875] text-[#FFD875] shadow-[0_0_15px_rgba(255,216,117,0.2)]'
                          : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-800'
                        }`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <span className="text-xs uppercase">
                        {date.toLocaleDateString('vi-VN', { weekday: 'short' })}
                      </span>
                      <span className="text-xl font-medium">{date.getDate()}</span>
                      <span className="text-xs">
                        {date.toLocaleDateString('vi-VN', { month: 'numeric' })}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Cinema Selection */}
              <div className="glass-dark rounded-2xl p-6 border border-gray-700/50 mb-8 animate-fadeInUp animation-delay-200">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <BuildingOfficeIcon className="w-5 h-5 mr-2 text-[#FFD875]" />
                  Chọn rạp chiếu
                </h3>

                <div className="flex overflow-x-auto pb-2 space-x-3">
                  <button
                    onClick={() => setSelectedCinemaId(null)}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-300 ${selectedCinemaId === null
                        ? 'bg-[#FFD875]/20 text-[#FFD875] border border-[#FFD875]/50 shadow-[0_0_15px_rgba(255,216,117,0.2)]'
                        : 'bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700'
                      }`}
                  >
                    Tất cả rạp
                  </button>

                  {Array.from(cinemas.values()).map((cinema, index) => (
                    <button
                      key={cinema.id}
                      onClick={() => setSelectedCinemaId(parseInt(cinema.id))}
                      className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-300 ${selectedCinemaId === parseInt(cinema.id)
                          ? 'bg-[#FFD875]/20 text-[#FFD875] border border-[#FFD875]/50 shadow-[0_0_15px_rgba(255,216,117,0.2)]'
                          : 'bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700'
                        }`}
                      style={{ animationDelay: `${index * 100 + 200}ms` }}
                    >
                      {cinema.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Showtimes List */}
              <div className="space-y-6 animate-fadeInUp animation-delay-400">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <TicketIcon className="w-5 h-5 mr-2 text-[#FFD875]" />
                  Lịch chiếu phim - {formatDate(selectedDate, 'full')}
                </h3>

                {Object.keys(showtimesByCinema).length > 0 ? (
                  Object.entries(showtimesByCinema).map(([cinemaIdStr, cinemaShowtimes], index) => {
                    const cinema = cinemas.get(cinemaIdStr);

                    if (!cinema) return null;

                    return (
                      <div
                        key={cinemaIdStr}
                        className="glass-dark rounded-2xl p-6 border border-gray-700/50 hover:shadow-[0_0_20px_rgba(255,216,117,0.15)] transition-all duration-500"
                        style={{ animationDelay: `${index * 200 + 500}ms` }}
                      >
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <h4 className="text-lg font-semibold text-white hover:text-[#FFD875] transition-colors">{cinema.name}</h4>
                            <p className="text-sm text-gray-400">{cinema.address}</p>
                          </div>

                          <div className="flex items-center space-x-2">
                            {/* Cinema info or features could go here */}
                          </div>
                        </div>

                        {/* Rooms and Showtimes */}
                        <div className="space-y-4">
                          {/* Group showtimes by room */}
                          {(() => {
                            const roomMap: Record<string, Showtime[]> = {};
                            cinemaShowtimes.forEach(showtime => {
                              const room = showtime.roomName || `Phòng ${showtime.roomId || 'Unknown'}`;
                              if (!roomMap[room]) {
                                roomMap[room] = [];
                              }
                              roomMap[room].push(showtime);
                            });

                            return Object.entries(roomMap).map(([roomName, roomShowtimes]) => (
                              <div key={roomName} className="border-t border-gray-700 pt-4">
                                <div className="flex items-center mb-3">
                                  <h5 className="text-white font-medium">{roomName}</h5>
                                  <span className="ml-2 px-2 py-0.5 bg-gray-800 rounded text-xs text-gray-300">
                                    {roomShowtimes[0].format || '2D'}
                                  </span>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                  {roomShowtimes.map((showtime) => (
                                    <button
                                      key={showtime.id}
                                      onClick={() => handleSelectShowtime(showtime, cinema)}
                                      className="glass-dark rounded-lg p-3 border border-gray-700/50 hover:border-[#FFD875]/50 transition-all duration-300 group transform hover:scale-105"
                                    >
                                      <div className="flex justify-between items-center mb-2">
                                        <span className="text-white font-medium group-hover:text-[#FFD875] transition-colors">
                                          {formatTime(showtime.startTime)}
                                        </span>
                                        <span className="text-xs px-1.5 py-0.5 rounded bg-gray-700 text-gray-300">
                                          {showtime.language || 'Phụ đề'}
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center text-xs text-gray-400">
                                        <span className="flex items-center">
                                          <TicketIcon className="w-3 h-3 mr-1" />
                                          {showtime.availableSeats || showtime.totalSeats || 0} ghế
                                        </span>
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ));
                          })()}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="glass-dark rounded-2xl p-8 border border-gray-700/50 text-center">
                    <ClockIcon className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-400">Không có suất chiếu nào cho ngày đã chọn.</p>
                    <p className="text-gray-400 mt-2">Vui lòng chọn ngày khác hoặc rạp khác.</p>
                  </div>
                )}
              </div>

              {/* Information Box */}
              <div className="mt-8 p-4 bg-slate-800/50 border border-gray-700/50 rounded-lg animate-fadeInUp animation-delay-600">
                <div className="flex items-start">
                  <InformationCircleIcon className="w-5 h-5 text-[#FFD875] mr-2 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-400">
                    <p>Giá vé có thể thay đổi tùy theo định dạng phim, rạp chiếu và khung giờ.</p>
                    <p>Vui lòng chọn suất chiếu để xem chi tiết giá vé và chỗ ngồi có sẵn.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default MovieShowtimePage; 
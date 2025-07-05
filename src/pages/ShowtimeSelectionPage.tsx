import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams, useLocation } from 'react-router-dom';
import { 
  CalendarIcon, 
  MapPinIcon, 
  ClockIcon, 
  FilmIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

// Mock data
const MOCK_MOVIE = {
  id: 'movie1',
  title: 'Dune: Part Two',
  posterUrl: 'https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg',
  backdropUrl: 'https://image.tmdb.org/t/p/original/5YZbUmjbMa3ClvSW1Wj3D6XGolb.jpg',
  duration: 166,
  genre: ['Sci-Fi', 'Adventure', 'Drama'],
  director: 'Denis Villeneuve',
  cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson'],
  synopsis: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
  releaseDate: '2024-03-01',
  rating: 4.7
};

const MOCK_THEATERS = [
  {
    id: 'theater1',
    name: 'CGV Vincom Center',
    address: '191 Bà Triệu, Hai Bà Trưng, Hà Nội',
    distance: '2.5 km',
    facilities: ['IMAX', 'VIP', '4DX'],
    rating: 4.5
  },
  {
    id: 'theater2',
    name: 'Lotte Cinema Landmark',
    address: 'E6 Cầu Giấy, Cầu Giấy, Hà Nội',
    distance: '5.2 km',
    facilities: ['Gold Class', 'Dolby Atmos'],
    rating: 4.3
  },
  {
    id: 'theater3',
    name: 'Galaxy Cinema Nguyễn Du',
    address: '116 Nguyễn Du, Hai Bà Trưng, Hà Nội',
    distance: '3.1 km',
    facilities: ['Standard', 'Premium'],
    rating: 4.0
  }
];

const MOCK_SHOWTIMES = [
  {
    id: 'showtime1',
    movieId: 'movie1',
    theaterId: 'theater1',
    roomName: 'Cinema 1',
    startTime: '2024-07-10T10:00:00',
    endTime: '2024-07-10T12:46:00',
    format: '2D',
    language: 'Phụ đề Việt',
    availableSeats: 45
  },
  {
    id: 'showtime2',
    movieId: 'movie1',
    theaterId: 'theater1',
    roomName: 'Cinema 3 - IMAX',
    startTime: '2024-07-10T13:30:00',
    endTime: '2024-07-10T16:16:00',
    format: 'IMAX',
    language: 'Phụ đề Việt',
    availableSeats: 28
  },
  {
    id: 'showtime3',
    movieId: 'movie1',
    theaterId: 'theater1',
    roomName: 'Cinema 5',
    startTime: '2024-07-10T18:00:00',
    endTime: '2024-07-10T20:46:00',
    format: '3D',
    language: 'Phụ đề Việt',
    availableSeats: 52
  },
  {
    id: 'showtime4',
    movieId: 'movie1',
    theaterId: 'theater1',
    roomName: 'Cinema 2',
    startTime: '2024-07-10T21:15:00',
    endTime: '2024-07-10T00:01:00',
    format: '2D',
    language: 'Phụ đề Việt',
    availableSeats: 60
  },
  {
    id: 'showtime5',
    movieId: 'movie1',
    theaterId: 'theater2',
    roomName: 'Cinema 1',
    startTime: '2024-07-10T11:30:00',
    endTime: '2024-07-10T14:16:00',
    format: '2D',
    language: 'Phụ đề Việt',
    availableSeats: 38
  },
  {
    id: 'showtime6',
    movieId: 'movie1',
    theaterId: 'theater2',
    roomName: 'Cinema 2 - Gold Class',
    startTime: '2024-07-10T15:00:00',
    endTime: '2024-07-10T17:46:00',
    format: '2D',
    language: 'Phụ đề Việt',
    availableSeats: 15
  },
  {
    id: 'showtime7',
    movieId: 'movie1',
    theaterId: 'theater3',
    roomName: 'Cinema 3',
    startTime: '2024-07-10T12:45:00',
    endTime: '2024-07-10T15:31:00',
    format: '2D',
    language: 'Phụ đề Việt',
    availableSeats: 42
  },
  {
    id: 'showtime8',
    movieId: 'movie1',
    theaterId: 'theater3',
    roomName: 'Cinema 1',
    startTime: '2024-07-10T19:30:00',
    endTime: '2024-07-10T22:16:00',
    format: '2D',
    language: 'Phụ đề Việt',
    availableSeats: 30
  }
];

const ShowtimeSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { movieId } = useParams<{ movieId: string }>();
  const [searchParams] = useSearchParams();
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTheaterId, setSelectedTheaterId] = useState<string | null>(null);
  
  const movie = MOCK_MOVIE; // In a real app, fetch movie by movieId
  const theaters = MOCK_THEATERS;
  
  // Parse cinema ID from URL query parameters
  useEffect(() => {
    const cinemaId = searchParams.get('cinema');
    console.log('Tham số cinema từ URL:', cinemaId);
    
    if (cinemaId) {
      // Kiểm tra ID thực và ánh xạ sang ID trong dữ liệu mẫu nếu cần
      let theaterId = cinemaId;
      
      // Nếu ID là số hoặc ID thực tế từ backend, ánh xạ sang ID trong mock data
      // Giả sử cinemaId="1" tương ứng với "theater1", "2" với "theater2", v.v.
      if (cinemaId === "1" || cinemaId.toLowerCase().includes("bảo lộc")) {
        theaterId = "theater1";
      } else if (cinemaId === "2" || cinemaId.toLowerCase().includes("hà nội")) {
        theaterId = "theater2";
      } else if (cinemaId === "3" || cinemaId.toLowerCase().includes("huế")) {
        theaterId = "theater3";
      }
      
      // Tìm rạp phù hợp từ dữ liệu mẫu
      const matchingTheater = theaters.find(theater => theater.id === theaterId);
      
      if (matchingTheater) {
        setSelectedTheaterId(theaterId);
        console.log(`Tự động chọn rạp: ${matchingTheater.name} (ID: ${theaterId})`);
      } else {
        console.log(`Không tìm thấy rạp với ID: ${theaterId} từ tham số cinema: ${cinemaId}`);
        
        // Log ra tất cả các ID rạp có trong dữ liệu mẫu để debug
        console.log('Các ID rạp hiện có:', theaters.map(t => t.id));
      }
    }
  }, [searchParams, theaters]);
  
  // Filter showtimes by selected date and theater
  const filteredShowtimes = MOCK_SHOWTIMES.filter(showtime => {
    const showtimeDate = new Date(showtime.startTime);
    const isSameDate = 
      showtimeDate.getDate() === selectedDate.getDate() &&
      showtimeDate.getMonth() === selectedDate.getMonth() &&
      showtimeDate.getFullYear() === selectedDate.getFullYear();
    
    return isSameDate && (!selectedTheaterId || showtime.theaterId === selectedTheaterId);
  });
  
  // Group showtimes by theater
  const showtimesByTheater = theaters.map(theater => {
    const theaterShowtimes = filteredShowtimes.filter(
      showtime => showtime.theaterId === theater.id
    );
    
    return {
      ...theater,
      showtimes: theaterShowtimes
    };
  }).filter(theater => theater.showtimes.length > 0);
  
  // Generate dates for next 7 days
  const next7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date;
  });
  
  // Format time
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('vi-VN', {
      weekday: 'short',
      day: 'numeric',
      month: 'numeric'
    });
  };
  
  // Handle showtime selection
  const handleShowtimeSelect = (showtime: any, theater: any) => {
    // Navigate to seat selection page with movie, theater, and showtime info
    navigate(`/seat-selection`, {
      state: {
        movie,
        theater,
        showtime
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center text-sm text-gray-400 mb-6">
            <span>Phim</span>
            <span className="mx-2">›</span>
            <span className="text-[#ffd875]">Suất chiếu</span>
            <span className="mx-2">›</span>
            <span>Chọn ghế</span>
            <span className="mx-2">›</span>
            <span>Thanh toán</span>
          </div>

          {/* Movie Banner */}
          <div 
            className="relative rounded-2xl overflow-hidden mb-8 h-64 md:h-80"
            style={{
              backgroundImage: `url(${movie.backdropUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-6 flex items-end">
              <img 
                src={movie.posterUrl} 
                alt={movie.title} 
                className="w-24 h-36 md:w-32 md:h-48 object-cover rounded-lg shadow-lg mr-4 md:mr-6"
              />
              <div>
                <h1 className="text-2xl md:text-3xl font-normal text-white mb-2">{movie.title}</h1>
                <div className="flex flex-wrap items-center text-sm text-gray-300 gap-x-4 gap-y-2">
                  <span className="flex items-center">
                    <ClockIcon className="w-4 h-4 mr-1" />
                    {Math.floor(movie.duration / 60)}h {movie.duration % 60}m
                  </span>
                  <span className="flex items-center">
                    <FilmIcon className="w-4 h-4 mr-1" />
                    {movie.genre.join(', ')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Date Selection */}
          <div className="glass-dark rounded-2xl p-6 border border-gray-700/50 mb-8">
            <h2 className="text-xl font-normal text-white mb-4 flex items-center">
              <CalendarIcon className="w-5 h-5 mr-2" />
              Chọn ngày
            </h2>
            <div className="flex overflow-x-auto pb-2 space-x-2">
              {next7Days.map((date, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedDate(date)}
                  className={`flex flex-col items-center justify-center min-w-[80px] h-20 rounded-lg border transition-colors ${
                    selectedDate.getDate() === date.getDate() && 
                    selectedDate.getMonth() === date.getMonth()
                      ? 'bg-[#ffd875]/20 border-[#ffd875] text-[#ffd875]'
                      : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-800'
                  }`}
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

          {/* Theater Filter */}
          <div className="glass-dark rounded-2xl p-6 border border-gray-700/50 mb-8">
            <h2 className="text-xl font-normal text-white mb-4 flex items-center">
              <MapPinIcon className="w-5 h-5 mr-2" />
              Chọn rạp
            </h2>
            <div className="flex overflow-x-auto pb-2 space-x-3">
              <button
                onClick={() => setSelectedTheaterId(null)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  selectedTheaterId === null
                    ? 'bg-[#ffd875]/20 text-[#ffd875] border border-[#ffd875]/50'
                    : 'bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700'
                }`}
              >
                Tất cả rạp
              </button>
              
              {theaters.map(theater => (
                <button
                  key={theater.id}
                  onClick={() => setSelectedTheaterId(theater.id)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    selectedTheaterId === theater.id
                      ? 'bg-[#ffd875]/20 text-[#ffd875] border border-[#ffd875]/50'
                      : 'bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700'
                  }`}
                >
                  {theater.name}
                </button>
              ))}
            </div>
          </div>

          {/* Showtimes by Theater */}
          <div className="space-y-8">
            {showtimesByTheater.length > 0 ? (
              showtimesByTheater.map(theater => (
                <div key={theater.id} className="glass-dark rounded-2xl p-6 border border-gray-700/50">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-normal text-white">{theater.name}</h3>
                      <p className="text-sm text-gray-400">{theater.address}</p>
                    </div>
                    <div className="flex items-center text-sm text-gray-400">
                      <span className="mr-3">{theater.distance}</span>
                      <div className="flex space-x-1">
                        {theater.facilities.map((facility, index) => (
                          <span 
                            key={index} 
                            className="px-2 py-0.5 bg-gray-800 rounded text-xs"
                          >
                            {facility}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {theater.showtimes.map(showtime => (
                      <button
                        key={showtime.id}
                        onClick={() => handleShowtimeSelect(showtime, theater)}
                        className="glass-dark rounded-lg p-3 border border-gray-700/50 hover:border-[#ffd875]/50 transition-all group"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-white font-medium group-hover:text-[#ffd875] transition-colors">
                            {formatTime(showtime.startTime)}
                          </span>
                          <span className="text-xs px-1.5 py-0.5 rounded bg-gray-700 text-gray-300">
                            {showtime.format}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-gray-400">
                          <span>{showtime.roomName}</span>
                          <span>{showtime.availableSeats} ghế trống</span>
                        </div>
                        <div className="mt-2 text-center">
                          <span className="text-xs text-[#ffd875] flex items-center justify-center">
                            Chọn suất
                            <ChevronRightIcon className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="glass-dark rounded-2xl p-8 border border-gray-700/50 text-center">
                <p className="text-gray-400">Không có suất chiếu nào cho ngày đã chọn.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowtimeSelectionPage; 
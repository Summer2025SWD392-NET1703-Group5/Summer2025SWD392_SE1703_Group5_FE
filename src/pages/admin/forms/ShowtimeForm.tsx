// src/components/admin/forms/ShowtimeForm.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FilmIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CubeIcon,
} from '@heroicons/react/24/outline';

interface ShowtimeFormData {
  movieId: string;
  cinemaId: string;
  roomId: string;
  date: string;
  time: string;
  price: number;
  vipPrice: number;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
}

interface Movie {
  id: string;
  title: string;
  duration: number;
  poster: string;
}

interface Cinema {
  id: string;
  name: string;
  rooms: Room[];
}

interface Room {
  id: string;
  name: string;
  type: string;
  totalSeats: number;
}

interface ShowtimeFormProps {
  mode: 'create' | 'edit';
}

const ShowtimeForm: React.FC<ShowtimeFormProps> = ({ mode }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<ShowtimeFormData>>({});
  const [movies, setMovies] = useState<Movie[]>([]);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  
  const [formData, setFormData] = useState<ShowtimeFormData>({
    movieId: '',
    cinemaId: '',
    roomId: '',
    date: '',
    time: '',
    price: 100000,
    vipPrice: 150000,
    status: 'scheduled',
  });

  useEffect(() => {
    fetchMovies();
    fetchCinemas();
    if (mode === 'edit' && id) {
      fetchShowtime(id);
    }
  }, [mode, id]);

  useEffect(() => {
    if (formData.cinemaId) {
      const cinema = cinemas.find(c => c.id === formData.cinemaId);
      setAvailableRooms(cinema?.rooms || []);
      setFormData(prev => ({ ...prev, roomId: '' }));
    }
  }, [formData.cinemaId, cinemas]);

  useEffect(() => {
    if (formData.movieId) {
      const movie = movies.find(m => m.id === formData.movieId);
      setSelectedMovie(movie || null);
    }
  }, [formData.movieId, movies]);

  const fetchMovies = async () => {
    try {
      const mockMovies: Movie[] = [
        {
          id: '1',
          title: 'Avatar: The Way of Water',
          duration: 192,
          poster: '/api/placeholder/100/150',
        },
        {
          id: '2',
          title: 'Top Gun: Maverick',
          duration: 131,
          poster: '/api/placeholder/100/150',
        },
        {
          id: '3',
          title: 'Black Panther: Wakanda Forever',
          duration: 161,
          poster: '/api/placeholder/100/150',
        },
      ];
      setMovies(mockMovies);
    } catch (error) {
      console.error('Error fetching movies:', error);
    }
  };

  const fetchCinemas = async () => {
    try {
      const mockCinemas: Cinema[] = [
        {
          id: '1',
          name: 'CGV Vincom Center',
          rooms: [
            { id: '1', name: 'Phòng 1 - IMAX', type: 'imax', totalSeats: 150 },
            { id: '2', name: 'Phòng 2 - VIP', type: 'vip', totalSeats: 80 },
            { id: '3', name: 'Phòng 3 - Standard', type: 'standard', totalSeats: 120 },
          ],
        },
        {
          id: '2',
          name: 'Lotte Cinema Landmark',
          rooms: [
            { id: '4', name: 'Phòng 1 - Premium', type: 'premium', totalSeats: 100 },
            { id: '5', name: 'Phòng 2 - Standard', type: 'standard', totalSeats: 150 },
          ],
        },
      ];
      setCinemas(mockCinemas);
    } catch (error) {
      console.error('Error fetching cinemas:', error);
    }
  };

  const fetchShowtime = async (showtimeId: string) => {
    try {
      setLoading(true);
      // Mock data for edit mode
      const mockShowtime = {
        movieId: '1',
        cinemaId: '1',
        roomId: '1',
        date: '2024-01-21',
        time: '14:30',
        price: 150000,
        vipPrice: 200000,
        status: 'scheduled' as const,
      };
      
      setFormData(mockShowtime);
    } catch (error) {
      console.error('Error fetching showtime:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'vipPrice' ? Number(value) : value,
    }));
    
    if (errors[name as keyof ShowtimeFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ShowtimeFormData> = {};

    if (!formData.movieId) {
      newErrors.movieId = 'Vui lòng chọn phim';
    }

    if (!formData.cinemaId) {
      newErrors.cinemaId = 'Vui lòng chọn rạp';
    }

    if (!formData.roomId) {
      newErrors.roomId = 'Vui lòng chọn phòng chiếu';
    }

    if (!formData.date) {
      newErrors.date = 'Vui lòng chọn ngày chiếu';
    }

    if (!formData.time) {
      newErrors.time = 'Vui lòng chọn giờ chiếu';
    }

    if (formData.price <= 0) {
      newErrors.price = 'Giá vé phải lớn hơn 0';
    }

    if (formData.vipPrice <= 0) {
      newErrors.vipPrice = 'Giá vé VIP phải lớn hơn 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateEndTime = () => {
    if (selectedMovie && formData.time) {
      const [hours, minutes] = formData.time.split(':').map(Number);
      const startTime = new Date();
      startTime.setHours(hours, minutes, 0, 0);
      
      // Thêm thời lượng phim + 15 phút giải lao
      const endTime = new Date(startTime.getTime() + (selectedMovie.duration + 15) * 60000);
      return endTime.toTimeString().slice(0, 5);
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Form data:', formData);
      navigate('/admin/showtimes');
    } catch (error) {
      console.error('Error saving showtime:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedRoom = availableRooms.find(room => room.id === formData.roomId);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-slate-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-6">
          {mode === 'create' ? 'Thêm lịch chiếu mới' : 'Chỉnh sửa lịch chiếu'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Movie Selection */}
          <div>
            <label htmlFor="movieId" className="block text-sm font-medium text-gray-300 mb-2">
              Chọn phim *
            </label>
            <select
              id="movieId"
              name="movieId"
              value={formData.movieId}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 bg-slate-700 text-white rounded-lg border ${
                errors.movieId ? 'border-red-500' : 'border-slate-600'
              } focus:border-yellow-500 focus:outline-none`}
            >
              <option value="">Chọn phim</option>
              {movies.map(movie => (
                <option key={movie.id} value={movie.id}>
                  {movie.title} ({movie.duration} phút)
                </option>
              ))}
            </select>
            {errors.movieId && <p className="mt-1 text-sm text-red-500">{errors.movieId}</p>}
            
            {selectedMovie && (
              <div className="mt-3 flex items-center gap-3 p-3 bg-slate-700 rounded-lg">
                <img
                  src={selectedMovie.poster}
                  alt={selectedMovie.title}
                  className="w-12 h-16 object-cover rounded"
                />
                <div>
                  <h3 className="text-white font-medium">{selectedMovie.title}</h3>
                  <p className="text-gray-400 text-sm">Thời lượng: {selectedMovie.duration} phút</p>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cinema Selection */}
            <div>
              <label htmlFor="cinemaId" className="block text-sm font-medium text-gray-300 mb-2">
                Chọn rạp *
              </label>
              <select
                id="cinemaId"
                name="cinemaId"
                value={formData.cinemaId}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 bg-slate-700 text-white rounded-lg border ${
                  errors.cinemaId ? 'border-red-500' : 'border-slate-600'
                } focus:border-yellow-500 focus:outline-none`}
              >
                <option value="">Chọn rạp</option>
                {cinemas.map(cinema => (
                  <option key={cinema.id} value={cinema.id}>
                    {cinema.name}
                  </option>
                ))}
              </select>
              {errors.cinemaId && <p className="mt-1 text-sm text-red-500">{errors.cinemaId}</p>}
            </div>

            {/* Room Selection */}
            <div>
              <label htmlFor="roomId" className="block text-sm font-medium text-gray-300 mb-2">
                Chọn phòng chiếu *
              </label>
              <select
                id="roomId"
                name="roomId"
                value={formData.roomId}
                onChange={handleInputChange}
                disabled={!formData.cinemaId}
                className={`w-full px-4 py-2 bg-slate-700 text-white rounded-lg border ${
                  errors.roomId ? 'border-red-500' : 'border-slate-600'
                } focus:border-yellow-500 focus:outline-none disabled:opacity-50`}
              >
                <option value="">Chọn phòng chiếu</option>
                {availableRooms.map(room => (
                  <option key={room.id} value={room.id}>
                    {room.name} ({room.totalSeats} ghế)
                  </option>
                ))}
              </select>
              {errors.roomId && <p className="mt-1 text-sm text-red-500">{errors.roomId}</p>}
              
              {selectedRoom && (
                <div className="mt-2 text-sm text-gray-400">
                  Loại phòng: {selectedRoom.type} | Số ghế: {selectedRoom.totalSeats}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Date */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-2">
                Ngày chiếu *
              </label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full pl-10 pr-4 py-2 bg-slate-700 text-white rounded-lg border ${
                    errors.date ? 'border-red-500' : 'border-slate-600'
                  } focus:border-yellow-500 focus:outline-none`}
                />
              </div>
              {errors.date && <p className="mt-1 text-sm text-red-500">{errors.date}</p>}
            </div>

            {/* Time */}
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-300 mb-2">
                Giờ chiếu *
              </label>
              <div className="relative">
                <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="time"
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2 bg-slate-700 text-white rounded-lg border ${
                    errors.time ? 'border-red-500' : 'border-slate-600'
                  } focus:border-yellow-500 focus:outline-none`}
                />
              </div>
              {errors.time && <p className="mt-1 text-sm text-red-500">{errors.time}</p>}
              
              {calculateEndTime() && (
                <div className="mt-2 text-sm text-gray-400">
                  Dự kiến kết thúc: {calculateEndTime()}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Price */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-2">
                Giá vé thường *
              </label>
              <div className="relative">
                <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="1000"
                  className={`w-full pl-10 pr-4 py-2 bg-slate-700 text-white rounded-lg border ${
                    errors.price ? 'border-red-500' : 'border-slate-600'
                  } focus:border-yellow-500 focus:outline-none`}
                  placeholder="Nhập giá vé"
                />
              </div>
              {errors.price && <p className="mt-1 text-sm text-red-500">{errors.price}</p>}
            </div>

            {/* VIP Price */}
            <div>
              <label htmlFor="vipPrice" className="block text-sm font-medium text-gray-300 mb-2">
                Giá vé VIP *
              </label>
              <div className="relative">
                <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
                  id="vipPrice"
                  name="vipPrice"
                  value={formData.vipPrice}
                  onChange={handleInputChange}
                  min="0"
                  step="1000"
                  className={`w-full pl-10 pr-4 py-2 bg-slate-700 text-white rounded-lg border ${
                    errors.vipPrice ? 'border-red-500' : 'border-slate-600'
                  } focus:border-yellow-500 focus:outline-none`}
                  placeholder="Nhập giá vé VIP"
                />
              </div>
              {errors.vipPrice && <p className="mt-1 text-sm text-red-500">{errors.vipPrice}</p>}
            </div>
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-2">
              Trạng thái *
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-yellow-500 focus:outline-none"
            >
              <option value="scheduled">Đã lên lịch</option>
              <option value="ongoing">Đang chiếu</option>
              <option value="completed">Đã hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 text-black font-medium py-2 px-4 rounded-lg transition-colors"
            >
              {loading ? 'Đang xử lý...' : mode === 'create' ? 'Tạo lịch chiếu' : 'Cập nhật'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/showtimes')}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShowtimeForm;

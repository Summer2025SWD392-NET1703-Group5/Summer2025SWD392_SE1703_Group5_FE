// src/components/admin/forms/ShowtimeForm.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  CalendarIcon,
  ClockIcon,
  BuildingOfficeIcon,
  FilmIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface ShowtimeFormProps {
  mode: 'create' | 'edit';
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
  capacity: number;
  type: string;
}

interface ShowtimeFormData {
  movieId: string;
  cinemaId: string;
  roomId: string;
  date: Date;
  time: string;
  price: number;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
}

const ShowtimeForm: React.FC<ShowtimeFormProps> = ({ mode }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const [formData, setFormData] = useState<ShowtimeFormData>({
    movieId: '',
    cinemaId: '',
    roomId: '',
    date: new Date(),
    time: '10:00',
    price: 100000,
    status: 'scheduled',
  });

  useEffect(() => {
    fetchData();
  }, [mode, id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Simulate API calls
      await Promise.all([
        fetchMovies(),
        fetchCinemas(),
      ]);
      
      if (mode === 'edit' && id) {
        await fetchShowtimeDetails(id);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMovies = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockMovies: Movie[] = [
      { id: '1', title: 'Avatar: The Way of Water', duration: 192, poster: '/api/placeholder/100/150' },
      { id: '2', title: 'Top Gun: Maverick', duration: 130, poster: '/api/placeholder/100/150' },
      { id: '3', title: 'Black Panther: Wakanda Forever', duration: 161, poster: '/api/placeholder/100/150' },
      { id: '4', title: 'Spider-Man: No Way Home', duration: 148, poster: '/api/placeholder/100/150' },
      { id: '5', title: 'Doctor Strange 2', duration: 126, poster: '/api/placeholder/100/150' },
    ];
    
    setMovies(mockMovies);
  };

  const fetchCinemas = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    const mockCinemas: Cinema[] = [
      {
        id: '1',
        name: 'CGV Vincom Center',
        rooms: [
          { id: '101', name: 'Phòng 1 - IMAX', capacity: 150, type: 'IMAX' },
          { id: '102', name: 'Phòng 2 - VIP', capacity: 80, type: 'VIP' },
          { id: '103', name: 'Phòng 3 - Standard', capacity: 120, type: 'Standard' },
        ] 
      },
      {
        id: '2',
        name: 'Lotte Cinema Landmark', 
        rooms: [
          { id: '201', name: 'Phòng 1 - Standard', capacity: 100, type: 'Standard' },
          { id: '202', name: 'Phòng 2 - Standard', capacity: 100, type: 'Standard' },
          { id: '203', name: 'Phòng 3 - Premium', capacity: 70, type: 'Premium' },
        ] 
      },
      { 
        id: '3', 
        name: 'Galaxy Nguyễn Du', 
        rooms: [
          { id: '301', name: 'Phòng 1 - Standard', capacity: 120, type: 'Standard' },
          { id: '302', name: 'Phòng 2 - VIP', capacity: 80, type: 'VIP' },
        ] 
      },
      { 
        id: '4', 
        name: 'BHD Star Bitexco', 
        rooms: [
          { id: '401', name: 'Phòng 1 - Premium', capacity: 90, type: 'Premium' },
          { id: '402', name: 'Phòng 2 - Standard', capacity: 120, type: 'Standard' },
          { id: '403', name: 'Phòng 3 - Standard', capacity: 120, type: 'Standard' },
          { id: '404', name: 'Phòng 4 - Standard', capacity: 120, type: 'Standard' },
          { id: '405', name: 'Phòng 5 - Standard', capacity: 120, type: 'Standard' },
        ] 
      },
    ];
    
    setCinemas(mockCinemas);
  };

  const fetchShowtimeDetails = async (showtimeId: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock data for edit mode
    const mockShowtime = {
      id: showtimeId,
      movieId: '1',
      cinemaId: '1',
      roomId: '101',
      date: new Date('2024-01-21'),
      time: '10:00',
      price: 150000,
      status: 'scheduled' as const,
    };
    
    setFormData(mockShowtime);
    
    // Set selected movie
    const movie = movies.find(m => m.id === mockShowtime.movieId) || null;
    setSelectedMovie(movie);
    
    // Set rooms for selected cinema
    const cinema = cinemas.find(c => c.id === mockShowtime.cinemaId);
    if (cinema) {
      setRooms(cinema.rooms);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) : value,
    }));
    
    // Handle special cases
    if (name === 'movieId') {
      const movie = movies.find(m => m.id === value) || null;
      setSelectedMovie(movie);
    }
    
    if (name === 'cinemaId') {
      const cinema = cinemas.find(c => c.id === value);
      if (cinema) {
        setRooms(cinema.rooms);
        setFormData(prev => ({ ...prev, roomId: '' }));
      } else {
        setRooms([]);
      }
    }
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setFormData(prev => ({ ...prev, date }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // Validate form
      if (!formData.movieId || !formData.cinemaId || !formData.roomId || !formData.time || formData.price <= 0) {
        alert('Vui lòng điền đầy đủ thông tin');
        return;
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Redirect after successful submission
      navigate('/admin/showtimes', { 
        state: { 
          notification: {
            type: 'success',
            message: mode === 'create' 
              ? 'Thêm lịch chiếu mới thành công' 
              : 'Cập nhật lịch chiếu thành công'
          }
        }
      });
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-2">
          <Link 
            to="/admin/showtimes" 
            className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Quay lại danh sách</span>
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-white">
          {mode === 'create' ? 'Thêm lịch chiếu mới' : 'Chỉnh sửa lịch chiếu'}
        </h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Main form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Thông tin lịch chiếu</h2>
              
              <div className="space-y-4">
                {/* Movie selection */}
            <div>
                  <label className="block text-gray-400 mb-1">Chọn phim</label>
                  <select
                    name="movieId"
                    value={formData.movieId}
                    onChange={handleInputChange}
                    className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-yellow-500 focus:outline-none"
                    required
                  >
                    <option value="">-- Chọn phim --</option>
                    {movies.map(movie => (
                      <option key={movie.id} value={movie.id}>{movie.title}</option>
                    ))}
                  </select>
            </div>

                {/* Cinema selection */}
            <div>
                  <label className="block text-gray-400 mb-1">Chọn rạp</label>
                  <select
                    name="cinemaId"
                    value={formData.cinemaId}
                    onChange={handleInputChange}
                    className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-yellow-500 focus:outline-none"
                    required
                  >
                    <option value="">-- Chọn rạp --</option>
                    {cinemas.map(cinema => (
                      <option key={cinema.id} value={cinema.id}>{cinema.name}</option>
                    ))}
                  </select>
            </div>

                {/* Room selection */}
            <div>
                  <label className="block text-gray-400 mb-1">Chọn phòng</label>
                  <select
                    name="roomId"
                    value={formData.roomId}
                    onChange={handleInputChange}
                    className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-yellow-500 focus:outline-none"
                    disabled={rooms.length === 0}
                    required
                  >
                    <option value="">-- Chọn phòng --</option>
                    {rooms.map(room => (
                      <option key={room.id} value={room.id}>{room.name} ({room.capacity} ghế)</option>
                    ))}
                  </select>
        </div>

                {/* Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                    <label className="block text-gray-400 mb-1">Ngày chiếu</label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <DatePicker
                        selected={formData.date}
                        onChange={handleDateChange}
                        dateFormat="dd/MM/yyyy"
                    minDate={new Date()}
                        className="w-full bg-slate-700 text-white rounded-lg pl-10 pr-4 py-2 border border-slate-600 focus:border-yellow-500 focus:outline-none"
                        required
                      />
                    </div>
            </div>

            <div>
                    <label className="block text-gray-400 mb-1">Giờ chiếu</label>
                    <div className="relative">
                      <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="time"
                        name="time"
                        value={formData.time}
                        onChange={handleInputChange}
                        className="w-full bg-slate-700 text-white rounded-lg pl-10 pr-4 py-2 border border-slate-600 focus:border-yellow-500 focus:outline-none"
                        required
                      />
            </div>
          </div>
        </div>

                {/* Price */}
            <div>
                  <label className="block text-gray-400 mb-1">Giá vé (VNĐ)</label>
                  <div className="relative">
                    <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      min="10000"
                      step="10000"
                      className="w-full bg-slate-700 text-white rounded-lg pl-10 pr-4 py-2 border border-slate-600 focus:border-yellow-500 focus:outline-none"
                      required
                    />
                  </div>
            </div>

                {/* Status (only for edit mode) */}
                {mode === 'edit' && (
            <div>
                    <label className="block text-gray-400 mb-1">Trạng thái</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-yellow-500 focus:outline-none"
                    >
                      <option value="scheduled">Đã lên lịch</option>
                      <option value="ongoing">Đang chiếu</option>
                      <option value="completed">Đã hoàn thành</option>
                      <option value="cancelled">Đã hủy</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Right column - Preview & Actions */}
          <div className="space-y-6">
            {/* Preview */}
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Xem trước</h2>
              
              {selectedMovie ? (
                <div className="space-y-4">
                  <div className="flex flex-col items-center">
                    <img
                      src={selectedMovie.poster}
                      alt={selectedMovie.title}
                      className="w-32 h-48 object-cover rounded-lg mb-2"
                    />
                    <h3 className="text-white font-medium">{selectedMovie.title}</h3>
                    <p className="text-gray-400 text-sm">{selectedMovie.duration} phút</p>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-700">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400">Rạp:</span>
                      <span className="text-white">
                        {formData.cinemaId ? cinemas.find(c => c.id === formData.cinemaId)?.name : '-'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400">Phòng:</span>
                      <span className="text-white">
                        {formData.roomId ? rooms.find(r => r.id === formData.roomId)?.name : '-'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400">Ngày:</span>
                      <span className="text-white">{formatDate(formData.date)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400">Giờ:</span>
                      <span className="text-white">{formData.time}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Giá vé:</span>
                      <span className="text-yellow-500 font-bold">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(formData.price)}
                    </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <FilmIcon className="w-16 h-16 text-gray-600 mb-2" />
                  <p className="text-gray-400 text-center">Chọn phim để xem trước</p>
                </div>
              )}
        </div>

            {/* Actions */}
            <div className="bg-slate-800 rounded-lg p-6">
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center justify-center gap-2 w-full bg-yellow-500 hover:bg-yellow-600 text-black font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      <span>{mode === 'create' ? 'Đang thêm...' : 'Đang lưu...'}</span>
                    </>
                  ) : (
                    <span>{mode === 'create' ? 'Thêm lịch chiếu' : 'Lưu thay đổi'}</span>
                  )}
                </button>
                
                <Link
                  to="/admin/showtimes"
                  className="flex items-center justify-center gap-2 w-full bg-slate-700 hover:bg-slate-600 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Hủy
                </Link>
          </div>
        </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ShowtimeForm;

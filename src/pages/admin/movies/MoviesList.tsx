// src/pages/admin/movies/MoviesList.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  FilmIcon,
  StarIcon,
  PlayIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloudArrowDownIcon,
  ArrowDownTrayIcon,
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import ActionButtons, { AddButton } from '../../../components/admin/common/ActionButtons';
import { useAuth } from '../../../contexts/SimpleAuthContext';

interface Movie {
  id: string;
  title: string;
  genre: string;
  duration: number;
  rating: number;
  releaseDate: string;
  status: 'active' | 'inactive' | 'coming_soon';
  poster: string;
  revenue: number;
  bookings: number;
}

const MoviesList: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin'; // Xác định nếu người dùng là Admin
  
  const [loading, setLoading] = useState(true);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const moviesPerPage = 8;

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockMovies: Movie[] = [
        {
          id: '1',
          title: 'Avatar: The Way of Water',
          genre: 'Sci-Fi, Action',
          duration: 192,
          rating: 4.8,
          releaseDate: '2022-12-16',
          status: 'active',
          poster: '/api/placeholder/300/450',
          revenue: 45000000,
          bookings: 1250,
        },
        {
          id: '2',
          title: 'Top Gun: Maverick',
          genre: 'Action, Drama',
          duration: 131,
          rating: 4.7,
          releaseDate: '2022-05-27',
          status: 'active',
          poster: '/api/placeholder/300/450',
          revenue: 38000000,
          bookings: 1100,
        },
        {
          id: '3',
          title: 'Black Panther: Wakanda Forever',
          genre: 'Action, Adventure',
          duration: 161,
          rating: 4.6,
          releaseDate: '2022-11-11',
          status: 'inactive',
          poster: '/api/placeholder/300/450',
          revenue: 32000000,
          bookings: 950,
        },
        {
          id: '4',
          title: 'Spider-Man: No Way Home',
          genre: 'Action, Adventure',
          duration: 148,
          rating: 4.9,
          releaseDate: '2021-12-17',
          status: 'active',
          poster: '/api/placeholder/300/450',
          revenue: 28000000,
          bookings: 850,
        },
        {
          id: '5',
          title: 'Doctor Strange 2',
          genre: 'Action, Fantasy',
          duration: 126,
          rating: 4.5,
          releaseDate: '2022-05-06',
          status: 'coming_soon',
          poster: '/api/placeholder/300/450',
          revenue: 25000000,
          bookings: 780,
        },
        {
          id: '6',
          title: 'The Batman',
          genre: 'Action, Crime',
          duration: 176,
          rating: 4.7,
          releaseDate: '2022-03-04',
          status: 'active',
          poster: '/api/placeholder/300/450',
          revenue: 30000000,
          bookings: 920,
        },
        {
          id: '7',
          title: 'Dune',
          genre: 'Sci-Fi, Adventure',
          duration: 155,
          rating: 4.8,
          releaseDate: '2021-10-22',
          status: 'inactive',
          poster: '/api/placeholder/300/450',
          revenue: 27000000,
          bookings: 800,
        },
        {
          id: '8',
          title: 'No Time to Die',
          genre: 'Action, Thriller',
          duration: 163,
          rating: 4.6,
          releaseDate: '2021-10-08',
          status: 'inactive',
          poster: '/api/placeholder/300/450',
          revenue: 26000000,
          bookings: 780,
        },
        {
          id: '9',
          title: 'Eternals',
          genre: 'Action, Fantasy',
          duration: 157,
          rating: 4.4,
          releaseDate: '2021-11-05',
          status: 'inactive',
          poster: '/api/placeholder/300/450',
          revenue: 24000000,
          bookings: 720,
        },
        {
          id: '10',
          title: 'Shang-Chi',
          genre: 'Action, Fantasy',
          duration: 132,
          rating: 4.7,
          releaseDate: '2021-09-03',
          status: 'inactive',
          poster: '/api/placeholder/300/450',
          revenue: 23500000,
          bookings: 710,
        },
      ];

      setMovies(mockMovies);
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMovies = movies.filter(movie => {
    const matchesSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movie.genre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || movie.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Tính toán phân trang
  const indexOfLastMovie = currentPage * moviesPerPage;
  const indexOfFirstMovie = indexOfLastMovie - moviesPerPage;
  const currentMovies = filteredMovies.slice(indexOfFirstMovie, indexOfLastMovie);
  const totalPages = Math.ceil(filteredMovies.length / moviesPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const generatePageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);

    if (endPage === totalPages) {
      startPage = Math.max(1, endPage - 4);
    }

    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Đang chiếu', border: 'border-green-500/50' },
      inactive: { bg: 'bg-slate-500/20', text: 'text-slate-400', label: 'Ngừng chiếu', border: 'border-slate-500/50' },
      coming_soon: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Sắp chiếu', border: 'border-blue-500/50' },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${config.bg} ${config.text} ${config.border} backdrop-blur-md shadow-lg`}>
        {config.label}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      notation: 'compact'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative">
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-20 left-20 w-72 h-72 bg-[#FFD875]/5 rounded-full filter blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#FFD875]/3 rounded-full filter blur-3xl animate-pulse animation-delay-2000" />
        </div>
        <div className="relative z-10 flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="relative mb-6">
              <div className="w-16 h-16 border-4 border-[#FFD875]/20 border-t-[#FFD875] rounded-full animate-spin mx-auto"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-[#FFD875]/50 rounded-full animate-spin animation-delay-150 mx-auto"></div>
            </div>
            <p className="text-slate-400 text-lg">Đang tải danh sách phim...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative p-6">
      {/* Animated background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-[#FFD875]/5 rounded-full filter blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#FFD875]/3 rounded-full filter blur-3xl animate-pulse animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#FFD875]/3 rounded-full filter blur-3xl animate-pulse animation-delay-4000" />
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8 flex flex-wrap items-center justify-between gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <h1 className="text-3xl font-bold text-[#FFD875] flex items-center gap-3" style={{ textShadow: '0 0 30px rgba(255, 216, 117, 0.5)' }}>
              <FilmIcon className="w-8 h-8" />
              {isAdmin ? 'Quản lý phim' : 'Danh sách phim'}
            </h1>
            <p className="text-slate-400 mt-2">
              {isAdmin 
                ? 'Quản lý danh sách phim trong hệ thống rạp chiếu' 
                : 'Xem danh sách phim đang có trong hệ thống rạp chiếu'}
            </p>
          </div>
          
          {/* Chỉ Admin mới thấy các nút ở header */}
          {isAdmin && (
            <div className="flex gap-3">
              <button
                className="px-4 py-2.5 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/30 hover:bg-purple-500/20 transition-all duration-300 flex items-center gap-2"
              >
                <CloudArrowDownIcon className="w-5 h-5" />
                Import từ TMDB
              </button>
              <button
                className="px-4 py-2.5 bg-green-500/10 text-green-400 rounded-xl border border-green-500/30 hover:bg-green-500/20 transition-all duration-300 flex items-center gap-2"
              >
                <ArrowDownTrayIcon className="w-5 h-5" />
                Xuất Excel
              </button>
              <button
                className="px-4 py-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/30 hover:bg-blue-500/20 transition-all duration-300 flex items-center gap-2"
              >
                <DocumentArrowDownIcon className="w-5 h-5" />
                Tải mẫu
              </button>
              <button
                className="px-4 py-2.5 bg-orange-500/10 text-orange-400 rounded-xl border border-orange-500/30 hover:bg-orange-500/20 transition-all duration-300 flex items-center gap-2"
              >
                <DocumentArrowUpIcon className="w-5 h-5" />
                Nhập Excel
              </button>
            <AddButton to="/admin/movies/add" label="phim mới" />
            </div>
          )}
        </motion.div>

        {/* Filters */}
        <motion.div
          className="mb-8 bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 shadow-lg"
          style={{ boxShadow: '0 0 40px rgba(255, 216, 117, 0.1)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm phim theo tên hoặc thể loại..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-700/70 backdrop-blur-md text-white rounded-xl border border-slate-600 focus:border-[#FFD875] focus:outline-none focus:ring-2 focus:ring-[#FFD875]/30 transition-all duration-300"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <FunnelIcon className="w-5 h-5 text-[#FFD875]" />
              <span className="text-gray-300 font-medium">Trạng thái:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-700/70 backdrop-blur-md text-white px-4 py-3 rounded-xl border border-slate-600 focus:border-[#FFD875] focus:outline-none focus:ring-2 focus:ring-[#FFD875]/30 transition-all duration-300"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang chiếu</option>
                <option value="inactive">Ngừng chiếu</option>
                <option value="coming_soon">Sắp chiếu</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Movies Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {currentMovies.map((movie, index) => (
            <motion.div
              key={movie.id}
              className="bg-slate-800/50 backdrop-blur-md rounded-2xl overflow-hidden border border-slate-700/50 shadow-lg group hover:shadow-2xl transition-all duration-500"
              style={{ boxShadow: '0 0 20px rgba(255, 216, 117, 0.05)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{
                y: -8,
                boxShadow: '0 20px 40px rgba(255, 216, 117, 0.2)'
              }}
            >
              <div className="relative overflow-hidden">
                <Link to={`/admin/movies/${movie.id}`}>
                  <div className="relative h-80">
                    <img
                      src={movie.poster}
                      alt={movie.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-500 flex items-center justify-center">
                      <div className="transform scale-0 group-hover:scale-100 transition-transform duration-500">
                        <PlayIcon className="w-16 h-16 text-[#FFD875] drop-shadow-lg" style={{ filter: 'drop-shadow(0 0 20px rgba(255, 216, 117, 0.8))' }} />
                      </div>
                    </div>

                    {/* Status badge */}
                    <div className="absolute top-3 right-3">
                      {getStatusBadge(movie.status)}
                    </div>

                    {/* Rating badge */}
                    <div className="absolute top-3 left-3">
                      <div className="bg-black/70 backdrop-blur-md rounded-full px-3 py-1 flex items-center gap-1">
                        <StarIcon className="w-4 h-4 text-[#FFD875] fill-current" />
                        <span className="text-white font-semibold text-sm">{movie.rating}</span>
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="absolute bottom-3 left-3">
                      <div className="bg-black/70 backdrop-blur-md rounded-full px-3 py-1">
                        <span className="text-white text-sm font-medium">{movie.duration} phút</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>

              <div className="p-6">
                <h3 className="text-white font-bold text-xl mb-2 line-clamp-1">{movie.title}</h3>
                <p className="text-[#FFD875] text-sm mb-3 font-medium">{movie.genre}</p>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Doanh thu:</span>
                    <span className="text-green-400 font-semibold">{formatCurrency(movie.revenue)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Đặt vé:</span>
                    <span className="text-blue-400 font-semibold">{movie.bookings.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {isAdmin ? (
                    <ActionButtons
                      onView={() => {
                        window.location.href = `/admin/movies/${movie.id}`;
                      }}
                      editLink={`/admin/movies/${movie.id}/edit`}
                      onDelete={() => {
                        if (window.confirm(`Bạn có chắc muốn xóa phim ${movie.title}?`)) {
                          console.log('Deleting movie', movie.id);
                        }
                      }}
                    />
                  ) : (
                    <Link
                      to={`/admin/movies/${movie.id}`}
                      className="flex-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg px-4 py-2 flex items-center justify-center gap-2 transition-all duration-300"
                    >
                      <EyeIcon className="w-4 h-4" />
                      Xem chi tiết
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {filteredMovies.length === 0 ? (
          <motion.div
            className="text-center py-16 bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700/50 mt-8"
            style={{ boxShadow: '0 0 40px rgba(255, 216, 117, 0.1)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <FilmIcon className="w-20 h-20 text-slate-600 mx-auto mb-4" />
            <div className="text-slate-400 text-xl mb-2">Không tìm thấy phim nào</div>
            <p className="text-slate-500">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
          </motion.div>
        ) : (
          totalPages > 1 && (
            <motion.div
              className="mt-12 flex justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-4 border border-slate-700/50" style={{ boxShadow: '0 0 40px rgba(255, 216, 117, 0.1)' }}>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 bg-slate-700/70 text-white rounded-lg hover:bg-slate-600/70 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>

                  {generatePageNumbers().map((page) => (
                    <button
                      key={page}
                      onClick={() => paginate(page)}
                      className={`px-4 py-2 rounded-lg transition-all duration-300 font-medium ${page === currentPage
                        ? 'text-black shadow-lg'
                        : 'bg-slate-700/70 text-white hover:bg-slate-600/70'
                        }`}
                      style={page === currentPage ? {
                        backgroundColor: '#FFD875',
                        boxShadow: '0 4px 15px rgba(255, 216, 117, 0.4)'
                      } : {}}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 bg-slate-700/70 text-white rounded-lg hover:bg-slate-600/70 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )
        )}
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
          .line-clamp-1 {
            display: -webkit-box;
            -webkit-line-clamp: 1;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        `
      }} />
    </div>
  );
};

export default MoviesList;

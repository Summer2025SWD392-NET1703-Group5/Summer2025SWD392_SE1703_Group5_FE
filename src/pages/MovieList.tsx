import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FunnelIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  SparklesIcon,
  FilmIcon,
  StarIcon,
  CalendarIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import Header from '../components/Header';
import Breadcrumb from '../components/Breadcrumb';

import TrailerModal from '../components/TrailerModal';
import FullScreenLoader from '../components/FullScreenLoader';
import type { Movie, FilterOptions } from '../types';
import { movieService } from '../services/movieService';
import './styles/MovieList.css';

// Types cho showtime và cinema data
interface ShowtimeInfo {
  id: string;
  startTime: string;
  endTime: string;
  showDate: string;
  price: number;
  availableSeats: number;
  totalSeats: number;
  cinemaName: string;
  roomName: string;
}

interface CinemaInfo {
  Cinema_ID: number;
  Cinema_Name: string;
  Address: string;
  City: string;
  Phone_Number?: string;
}

interface MovieWithShowtimes extends Movie {
  // UI-specific fields for backward compatibility
  englishTitle?: string;
  backgroundImage?: string;
  genres?: string[];
  description?: string;
  ageRating?: string;
  isComingSoon?: boolean;
  isHot?: boolean;
  isNew?: boolean;
  gallery?: string[];
  reviews?: any[];
  // Showtime-related fields
  showtimes?: ShowtimeInfo[];
  cinemas?: CinemaInfo[];
  showtimesLoading?: boolean;
}

const MovieList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [nowShowingMovies, setNowShowingMovies] = useState<MovieWithShowtimes[]>([]);
  const [comingSoonMovies, setComingSoonMovies] = useState<MovieWithShowtimes[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const moviesPerPage = 24;

  const [filters, setFilters] = useState<FilterOptions>({
    genre: searchParams.get('genre') || '',
    rating: searchParams.get('rating') || '',
    releaseDate: searchParams.get('releaseDate') || '',
    cinema: searchParams.get('cinema') || '',
    sortBy: 'latest',
    search: searchParams.get('search') || ''
  });

  // Fetch movies from API
  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log('Đang tải danh sách phim từ API...');

        // Helper function to map API movie to UI movie format
        const mapApiMovieToUIMovie = (apiMovie: any): MovieWithShowtimes => {
          const movieId = apiMovie.Movie_ID || apiMovie.id || 0;
          const castArray = apiMovie.cast ? (typeof apiMovie.cast === 'string' ? apiMovie.cast.split(',').map((c: string) => c.trim()) : apiMovie.cast) : 
                           (apiMovie.Cast ? (typeof apiMovie.Cast === 'string' ? apiMovie.Cast.split(',').map((c: string) => c.trim()) : apiMovie.Cast) : []);
          const ratingValue = Number(apiMovie.ratingAverage || apiMovie.Average_Rating || apiMovie.rating || 0);
          const durationValue = typeof apiMovie.duration === 'string' ? parseInt(apiMovie.duration) || 0 : (apiMovie.duration || 0);
          
          return {
            Movie_ID: movieId,
            id: String(movieId),
            title: apiMovie.title || apiMovie.Movie_Name || '',
            poster: apiMovie.poster || apiMovie.Poster_URL || '',
            duration: durationValue,
            releaseDate: apiMovie.releaseDate || apiMovie.Release_Date || '',
            premiereDate: apiMovie.premiereDate || apiMovie.Premiere_Date,
            endDate: apiMovie.endDate || apiMovie.End_Date,
            productionCompany: apiMovie.productionCompany || apiMovie.Production_Company,
            director: apiMovie.director || apiMovie.Director || '',
            cast: typeof castArray === 'object' ? castArray.join(', ') : String(castArray || ''),
            genre: apiMovie.genre || apiMovie.Genre,
            rating: ratingValue,
            language: apiMovie.language || apiMovie.Language || '',
            country: apiMovie.country || apiMovie.Country || '',
            synopsis: apiMovie.synopsis || apiMovie.Synopsis || '',
            trailerUrl: apiMovie.trailerLink || apiMovie.Trailer_Link || '',
            status: apiMovie.status || apiMovie.Status || 'now-showing',
            // UI-specific fields (for backward compatibility)
            englishTitle: apiMovie.originalTitle || apiMovie.English_Title,
            backgroundImage: apiMovie.poster || apiMovie.Poster_URL || '',
            genres: apiMovie.genre ? [apiMovie.genre] : (apiMovie.Genre ? [apiMovie.Genre] : []),
            description: apiMovie.synopsis || apiMovie.Synopsis || '',
            ageRating: apiMovie.rating || apiMovie.Rating || 'T13',
            isComingSoon: apiMovie.status === 'coming-soon' || apiMovie.Status === 'Coming Soon',
            isHot: false,
            isNew: apiMovie.status === 'now-showing' || apiMovie.Status === 'Now Showing',
            gallery: [],
            reviews: [],
            // Initialize showtime fields
            showtimes: [],
            cinemas: [],
            showtimesLoading: false
          };
        };

        // Fetch now showing movies
        try {
          const nowShowingData = await movieService.getNowShowingMovies();
          console.log('Kết quả API phim đang chiếu:', nowShowingData);
          const mappedMovies = nowShowingData.map(mapApiMovieToUIMovie);
          setNowShowingMovies(mappedMovies);
        } catch (err) {
          console.error('Lỗi khi tải danh sách phim đang chiếu:', err);
          setNowShowingMovies([]);
        }

        // Fetch coming soon movies
        try {
          const comingSoonData = await movieService.getComingSoonMovies();
          console.log('Kết quả API phim sắp chiếu:', comingSoonData);
          const mappedMovies = comingSoonData.map(mapApiMovieToUIMovie);
          setComingSoonMovies(mappedMovies);
        } catch (err) {
          console.error('Lỗi khi tải danh sách phim sắp chiếu:', err);
          setComingSoonMovies([]);
        }
      } catch (err) {
        console.error('Lỗi khi tải danh sách phim:', err);
        setError('Không thể kết nối đến máy chủ.');
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value && !(key === 'sortBy' && value === 'latest')) {
        params.set(key, value);
      }
    });

    setSearchParams(params);
  }, [filters, setSearchParams]);

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      genre: '',
      rating: '',
      releaseDate: '',
      cinema: '',
      sortBy: 'latest',
      search: ''
    });
    setCurrentPage(1);
    setSearchParams(new URLSearchParams());
  };

  const [activeTab, setActiveTab] = useState<'now-showing' | 'coming-soon'>('now-showing');

  // Get movies for current tab
  const moviesForCurrentTab = useMemo(() => {
    return activeTab === 'now-showing' ? nowShowingMovies : comingSoonMovies;
  }, [activeTab, nowShowingMovies, comingSoonMovies]);

  // Filter and sort movies
  const filteredAndSortedMoviesForTab = useMemo(() => {
    let filtered = moviesForCurrentTab.filter(movie => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const titleMatch = movie.title?.toLowerCase().includes(searchLower) || false;
        const castMatch = movie.cast ? movie.cast.toLowerCase().includes(searchLower) : false;
        const directorMatch = movie.director?.toLowerCase().includes(searchLower) || false;

        if (!titleMatch && !castMatch && !directorMatch) {
          return false;
        }
      }

      // Genre filter
      if (filters.genre && movie.genres && !movie.genres.includes(filters.genre)) {
        return false;
      }

      // Rating filter
      if (filters.rating && movie.rating) {
        const ratingThreshold = parseFloat(filters.rating);
        const movieRating = typeof movie.rating === 'string' ? parseFloat(movie.rating) : movie.rating;
        if (movieRating < ratingThreshold) {
          return false;
        }
      }

      // Release date filter
      if (filters.releaseDate && movie.releaseDate) {
        const movieYear = new Date(movie.releaseDate).getFullYear();
        const filterYear = parseInt(filters.releaseDate);
        if (movieYear !== filterYear) {
          return false;
        }
      }

      return true;
    });

    // Sort movies
    switch (filters.sortBy) {
      case 'latest':
        filtered.sort((a, b) => new Date(b.releaseDate || 0).getTime() - new Date(a.releaseDate || 0).getTime());
        break;
      case 'popular':
        filtered.sort((a, b) => {
          const aRating = typeof a.rating === 'string' ? parseFloat(a.rating) || 0 : (a.rating || 0);
          const bRating = typeof b.rating === 'string' ? parseFloat(b.rating) || 0 : (b.rating || 0);
          return bRating - aRating;
        });
        break;
      case 'rating':
        filtered.sort((a, b) => {
          const aRating = typeof a.rating === 'string' ? parseFloat(a.rating) || 0 : (a.rating || 0);
          const bRating = typeof b.rating === 'string' ? parseFloat(b.rating) || 0 : (b.rating || 0);
          return bRating - aRating;
        });
        break;
      case 'a-z':
        filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        break;
      default:
        break;
    }

    return filtered;
  }, [moviesForCurrentTab, filters]);

  // Calculate filtered counts
  const filteredNowShowingCount = useMemo(() => {
    if (activeTab !== 'now-showing') return nowShowingMovies.length;
    return filteredAndSortedMoviesForTab.length;
  }, [activeTab, nowShowingMovies.length, filteredAndSortedMoviesForTab]);

  const filteredComingSoonCount = useMemo(() => {
    if (activeTab !== 'coming-soon') return comingSoonMovies.length;
    return filteredAndSortedMoviesForTab.length;
  }, [activeTab, comingSoonMovies.length, filteredAndSortedMoviesForTab]);

  // Pagination
  const totalPagesForTab = Math.ceil(filteredAndSortedMoviesForTab.length / moviesPerPage);
  const paginatedMoviesForTab = filteredAndSortedMoviesForTab.slice(
    (currentPage - 1) * moviesPerPage,
    currentPage * moviesPerPage
  );

  // All movies for filters
  const allMovies = useMemo(() => [...nowShowingMovies, ...comingSoonMovies], [nowShowingMovies, comingSoonMovies]);
  const genres = Array.from(new Set(allMovies.flatMap(movie => movie.genres || [])));
  const years = Array.from(new Set(allMovies.map(movie => movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : 0).filter(year => year > 0))).sort((a, b) => b - a);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        <Header />
        <div className="pt-20">
          <FullScreenLoader />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <Header />

      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <Breadcrumb items={[{ label: 'Phim' }]} />

          {/* Page Header */}
          <motion.div
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-3 flex items-center">
                <FilmIcon className="w-12 h-12 text-[#FFD875] mr-4" />
                Danh Sách Phim
              </h1>
              <p className="text-gray-400 text-lg">
                Tìm thấy <span className="text-[#FFD875] font-semibold">{filteredAndSortedMoviesForTab.length}</span> phim {activeTab === 'now-showing' ? 'đang chiếu' : 'sắp chiếu'}
              </p>
            </div>

            <div className="mt-6 lg:mt-0 flex items-center gap-3">
              {/* Filter Toggle */}
              <motion.button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-6 py-3 bg-slate-800 border border-slate-700 text-white rounded-lg font-medium transition-all duration-300 hover:border-[#FFD875]/50 hover:shadow-[0_0_15px_0_rgba(255,216,117,0.3)]"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FunnelIcon className="w-5 h-5 text-[#FFD875]" />
                <span>Bộ Lọc</span>
                {Object.values(filters).filter(v => v && v !== 'latest').length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-[#FFD875] text-black rounded-full text-xs font-bold">
                    {Object.values(filters).filter(v => v && v !== 'latest').length}
                  </span>
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* Tabs */}
          <motion.div
            className="flex justify-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="bg-slate-800/50 backdrop-blur-sm p-1.5 rounded-xl border border-slate-700/50 shadow-lg">
              <button
                onClick={() => {
                  setActiveTab('now-showing');
                  setCurrentPage(1);
                }}
                className={`px-8 py-3.5 rounded-lg font-medium transition-all duration-300 ${activeTab === 'now-showing'
                  ? 'bg-[#FFD875] text-black shadow-[0_0_20px_0_rgba(255,216,117,0.5)]'
                  : 'text-gray-300 hover:text-white hover:bg-slate-700/50'
                  }`}
              >
                <div className="flex items-center space-x-2">
                  <SparklesIcon className="w-5 h-5" />
                  <span>Đang Chiếu</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === 'now-showing' ? 'bg-black/20 text-black' : 'bg-slate-600 text-white'
                    }`}>
                    {filteredNowShowingCount}
                  </span>
                </div>
              </button>
              <button
                onClick={() => {
                  setActiveTab('coming-soon');
                  setCurrentPage(1);
                }}
                className={`px-8 py-3.5 rounded-lg font-medium transition-all duration-300 ${activeTab === 'coming-soon'
                  ? 'bg-[#FFD875] text-black shadow-[0_0_20px_0_rgba(255,216,117,0.5)]'
                  : 'text-gray-300 hover:text-white hover:bg-slate-700/50'
                  }`}
              >
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="w-5 h-5" />
                  <span>Sắp Chiếu</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === 'coming-soon' ? 'bg-black/20 text-black' : 'bg-slate-600 text-white'
                    }`}>
                    {filteredComingSoonCount}
                  </span>
                </div>
              </button>
            </div>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div
              className="mb-6 p-4 bg-red-900/30 backdrop-blur-sm border border-red-700/50 rounded-xl"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-red-400 text-center flex items-center justify-center">
                <XMarkIcon className="w-5 h-5 mr-2" />
                {error}
              </p>
            </motion.div>
          )}

          {/* Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                className="bg-slate-800/50 backdrop-blur-md p-6 rounded-2xl mb-8 border border-slate-700/50 shadow-xl"
                initial={{ opacity: 0, y: -20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -20, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <AdjustmentsHorizontalIcon className="w-6 h-6 mr-2 text-[#FFD875]" />
                    Bộ Lọc & Sắp Xếp
                  </h3>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {/* Search */}
                  <div>
                    <label className="block text-sm font-medium text-[#FFD875] mb-2">
                      Tìm Kiếm
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        placeholder="Tên phim, diễn viên..."
                        className="w-full px-4 py-3 pl-10 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#FFD875] focus:ring-2 focus:ring-[#FFD875]/20 transition-all duration-300"
                      />
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#FFD875]" />
                    </div>
                  </div>

                  {/* Genre */}
                  <div>
                    <label className="block text-sm font-medium text-[#FFD875] mb-2">
                      Thể Loại
                    </label>
                    <select
                      value={filters.genre}
                      onChange={(e) => handleFilterChange('genre', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-[#FFD875] focus:ring-2 focus:ring-[#FFD875]/20 transition-all duration-300"
                    >
                      <option value="">Tất cả thể loại</option>
                      {genres.map(genre => (
                        <option key={genre} value={genre}>{genre}</option>
                      ))}
                    </select>
                  </div>

                  {/* Rating */}
                  <div>
                    <label className="block text-sm font-medium text-[#FFD875] mb-2">
                      Đánh Giá
                    </label>
                    <select
                      value={filters.rating}
                      onChange={(e) => handleFilterChange('rating', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-[#FFD875] focus:ring-2 focus:ring-[#FFD875]/20 transition-all duration-300"
                    >
                      <option value="">Tất cả đánh giá</option>
                      <option value="8">8+ sao</option>
                      <option value="7">7+ sao</option>
                      <option value="6">6+ sao</option>
                      <option value="5">5+ sao</option>
                    </select>
                  </div>

                  {/* Release Year */}
                  <div>
                    <label className="block text-sm font-medium text-[#FFD875] mb-2">
                      Năm Phát Hành
                    </label>
                    <select
                      value={filters.releaseDate}
                      onChange={(e) => handleFilterChange('releaseDate', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-[#FFD875] focus:ring-2 focus:ring-[#FFD875]/20 transition-all duration-300"
                    >
                      <option value="">Tất cả năm</option>
                      {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Sort Options */}
                <div className="flex flex-wrap gap-3 items-center mb-6">
                  <span className="text-sm font-medium text-gray-300">Sắp xếp theo:</span>
                  {[
                    { value: 'latest', label: 'Mới nhất', icon: CalendarIcon },
                    { value: 'popular', label: 'Phổ biến', icon: SparklesIcon },
                    { value: 'rating', label: 'Đánh giá', icon: StarIcon },
                    { value: 'a-z', label: 'A-Z', icon: null }
                  ].map(option => (
                    <motion.button
                      key={option.value}
                      onClick={() => handleFilterChange('sortBy', option.value)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center space-x-2 ${filters.sortBy === option.value
                        ? 'bg-[#FFD875] text-black shadow-[0_0_15px_0_rgba(255,216,117,0.5)]'
                        : 'bg-slate-700/50 text-gray-300 hover:bg-slate-700 hover:text-white border border-slate-600'
                        }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {option.icon && <option.icon className="w-4 h-4" />}
                      <span>{option.label}</span>
                    </motion.button>
                  ))}
                </div>

                {/* Clear Filters */}
                <motion.button
                  onClick={clearFilters}
                  className="text-[#FFD875] hover:text-[#e5c368] text-sm font-medium transition-all duration-300 flex items-center"
                  whileHover={{ x: 5 }}
                >
                  <XMarkIcon className="w-4 h-4 mr-1" />
                  Xóa tất cả bộ lọc
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Movies Grid */}
          {paginatedMoviesForTab.length > 0 ? (
            <>
              <motion.div
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 mb-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <AnimatePresence mode="popLayout">
                  {paginatedMoviesForTab.map((movie, index) => (
                    <motion.div
                      key={movie.Movie_ID || movie.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.3, delay: index * 0.02 }}
                      className="group relative"
                    >
                      <Link to={`/movies/${movie.Movie_ID || movie.id}`} className="block">
                        <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-slate-800/50 border border-slate-700/50 group-hover:border-[#FFD875]/50 transition-all duration-300 group-hover:shadow-[0_0_30px_rgba(255,216,117,0.6)] transform group-hover:scale-105">
                          {/* Movie Poster */}
                          <img
                            src={movie.poster}
                            alt={movie.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />

                          {/* Gradient Overlay on Hover */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <div className="absolute bottom-0 left-0 right-0 p-3">
                              <h3 className="text-white text-sm font-bold line-clamp-2 mb-1">{movie.title}</h3>
                              <div className="flex items-center justify-between">
                                <span className="text-[#FFD875] text-xs flex items-center">
                                  <StarSolid className="w-3 h-3 mr-1" />
                                  {movie.rating || 'N/A'}
                                </span>
                                <span className="text-gray-300 text-xs">{movie.duration} phút</span>
                              </div>
                            </div>
                          </div>

                          {/* Glow Effect */}
                          <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                            <div className="absolute inset-0 bg-gradient-to-r from-[#FFD875]/0 via-[#FFD875]/20 to-[#FFD875]/0 blur-xl"></div>
                          </div>

                          {/* Badges */}
                          {movie.isNew && (
                            <div className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                              MỚI
                            </div>
                          )}
                          {movie.isHot && (
                            <div className="absolute top-2 right-2 px-2 py-1 bg-[#FFD875] text-black text-xs font-bold rounded flex items-center gap-1">
                              <span className="animate-pulse">🔥</span>
                            </div>
                          )}
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>

              {/* Pagination */}
              {totalPagesForTab > 1 && (
                <motion.div
                  className="flex justify-center items-center space-x-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <motion.button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-3 bg-slate-800/50 backdrop-blur-sm text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 hover:text-white transition-all duration-300 border border-slate-700/50 hover:border-[#FFD875]/50"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ChevronLeftIcon className="w-5 h-5" />
                  </motion.button>

                  <div className="flex space-x-2">
                    {Array.from({ length: Math.min(5, totalPagesForTab) }, (_, i) => {
                      let pageNumber;
                      if (totalPagesForTab <= 5) {
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1;
                      } else if (currentPage >= totalPagesForTab - 2) {
                        pageNumber = totalPagesForTab - 4 + i;
                      } else {
                        pageNumber = currentPage - 2 + i;
                      }

                      return (
                        <motion.button
                          key={pageNumber}
                          onClick={() => setCurrentPage(pageNumber)}
                          className={`w-12 h-12 rounded-lg font-medium transition-all duration-300 ${currentPage === pageNumber
                            ? 'bg-[#FFD875] text-black shadow-[0_0_20px_0_rgba(255,216,117,0.5)]'
                            : 'bg-slate-800/50 backdrop-blur-sm text-gray-300 hover:bg-slate-700 hover:text-white border border-slate-700/50 hover:border-[#FFD875]/50'
                            }`}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          {pageNumber}
                        </motion.button>
                      );
                    })}
                  </div>

                  <motion.button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPagesForTab))}
                    disabled={currentPage === totalPagesForTab}
                    className="p-3 bg-slate-800/50 backdrop-blur-sm text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 hover:text-white transition-all duration-300 border border-slate-700/50 hover:border-[#FFD875]/50"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ChevronRightIcon className="w-5 h-5" />
                  </motion.button>
                </motion.div>
              )}
            </>
          ) : (
            /* Empty State */
            <motion.div
              className="text-center py-20"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="w-32 h-32 mx-auto mb-8 bg-slate-800/50 backdrop-blur-sm rounded-full flex items-center justify-center border border-slate-700/50"
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(255,216,117,0.3)",
                    "0 0 40px rgba(255,216,117,0.5)",
                    "0 0 20px rgba(255,216,117,0.3)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <MagnifyingGlassIcon className="w-16 h-16 text-[#FFD875]" />
              </motion.div>
              <h3 className="text-2xl font-semibold text-white mb-3">
                Không tìm thấy phim nào
              </h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để tìm phim bạn muốn xem
              </p>
              <motion.button
                onClick={clearFilters}
                className="bg-[#FFD875] hover:bg-[#e5c368] text-black py-3 px-8 rounded-lg font-medium transition-all duration-300 shadow-[0_0_20px_0_rgba(255,216,117,0.5)] hover:shadow-[0_0_30px_0_rgba(255,216,117,0.7)]"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Xóa bộ lọc
              </motion.button>
            </motion.div>
          )}
        </div>
      </main>

      {/* Trailer Modal */}
      {selectedMovie && (
        <TrailerModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
        />
      )}
    </div>
  );
};

export default MovieList;


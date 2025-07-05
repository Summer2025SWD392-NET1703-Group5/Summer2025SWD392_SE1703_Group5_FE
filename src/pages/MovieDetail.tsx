import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  StarIcon,
  ClockIcon,
  CalendarDaysIcon,
  PlayIcon,
  ShareIcon,
  HeartIcon,
  UserGroupIcon,
  FilmIcon,
  GlobeAltIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon
} from '@heroicons/react/24/solid';
import {
  HeartIcon as HeartOutlineIcon,
  ShareIcon as ShareOutlineIcon
} from '@heroicons/react/24/outline';
import Header from '../components/Header';
import Breadcrumb from '../components/Breadcrumb';
import MovieCard from '../components/MovieCard';
import TrailerModal from '../components/TrailerModal';
import ImageGallery from '../components/ImageGallery';
import ReviewSection from '../components/ReviewSection';
import ShowtimeSection from '../components/ShowtimeSection';
import LoadingSpinner from '../components/LoadingSpinner';
import type { Movie } from '../types';
import { movieService } from '../services/movieService';
import showtimeService from '../services/showtimeService';
import api from '../config/api';
import type { Cinema } from '../types/cinema';
import type { Showtime } from '../types/showtime';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

// Interface cho dữ liệu API trả về
interface ShowtimeAPIItem {
  Showtime_ID: number;
  Start_Time: string;
  End_Time: string;
  Room_Name: string;
  Room_Type: string;
  Capacity_Available: number;
  Show_Date?: string;
  Cinema_ID?: number;
  Cinema_Name?: string;
}

interface ShowtimesByDateGroup {
  Date: string;
  Showtimes: ShowtimeAPIItem[];
}

interface ShowtimesAPIResponse {
  Movie_ID: number;
  Movie_Name: string;
  Cinema_ID: number;
  Cinema_Name: string;
  ShowtimesByDate: ShowtimesByDateGroup[];
}

// Helper function to process movie data from API
const processMovieData = (apiMovie: any): Movie => {
  // Normalize data from different API formats
  const movie: Movie = {
    id: apiMovie.id || apiMovie.movieId || apiMovie.Movie_ID,
    title: apiMovie.title || apiMovie.movieName || apiMovie.Movie_Name || '',
    englishTitle: apiMovie.englishTitle || apiMovie.originalTitle || apiMovie.title || '',
    poster: apiMovie.poster || apiMovie.posterUrl || apiMovie.Poster_URL || '',
    backgroundImage: apiMovie.backgroundImage || apiMovie.poster || apiMovie.Poster_URL || '',
    duration: apiMovie.duration || `${apiMovie.Duration || 120} phút`,
    genres: Array.isArray(apiMovie.genres)
      ? apiMovie.genres
      : apiMovie.genre
        ? apiMovie.genre.split(',').map((g: string) => g.trim())
        : apiMovie.Genre
          ? apiMovie.Genre.split(',').map((g: string) => g.trim())
          : ['Chưa phân loại'],
    director: apiMovie.director || apiMovie.Director || 'Chưa cập nhật',
    cast: Array.isArray(apiMovie.cast)
      ? apiMovie.cast
      : apiMovie.Cast
        ? apiMovie.Cast.split(',').map((c: string) => c.trim())
        : [],
    description: apiMovie.description || apiMovie.synopsis || apiMovie.Synopsis || 'Chưa có mô tả',
    releaseDate: apiMovie.releaseDate || apiMovie.Release_Date || new Date().toISOString().split('T')[0],
    rating: apiMovie.rating || apiMovie.ratingAverage || apiMovie.Rating_Summary?.Average_Rating || 0,
    country: apiMovie.country || apiMovie.Country || 'Chưa cập nhật',
    language: apiMovie.language || apiMovie.Language || 'Chưa cập nhật',
    ageRating: apiMovie.ageRating || apiMovie.Rating || 'P',
    isComingSoon: apiMovie.isComingSoon || apiMovie.Status === 'Coming Soon' || false,
    trailerUrl: apiMovie.trailerUrl || apiMovie.Trailer_Link || '',
    gallery: apiMovie.gallery || [],
    reviews: Array.isArray(apiMovie.Ratings) 
      ? apiMovie.Ratings.map((rating: any) => ({
          id: rating.Rating_ID || rating.id || Date.now() + Math.random(),
          user: rating.Full_Name || rating.user || rating.User_Name || 'Anonymous',
          rating: rating.Rating || rating.rating || 0,
          content: rating.Comment || rating.comment || rating.content || '',
          date: rating.Rating_Date || rating.date || rating.created_at || new Date().toISOString(),
          isUpdated: rating.Is_Updated || rating.is_updated || false
        }))
      : (apiMovie.reviews || [])
  };

  console.log('Processed movie reviews:', movie.reviews);
  return movie;
};

const MovieDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  console.log('MovieDetail component rendered with id:', id);

  // State cho dữ liệu phim và trạng thái hiện tại
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [isContentLoaded, setIsContentLoaded] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'showtimes' | 'reviews' | 'gallery'>('overview');
  const [showTrailerModal, setShowTrailerModal] = useState(false);
  const [showZoomedImage, setShowZoomedImage] = useState(false);
  const [zoomedImageUrl, setZoomedImageUrl] = useState('');
  const [showFullGallery, setShowFullGallery] = useState(false);

  // State cho cinemas và showtimes
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [cinemasLoading, setCinemasLoading] = useState<boolean>(false);
  const [showtimesLoading, setShowtimesLoading] = useState<boolean>(false);

  // State cho user interactions
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{ success: boolean, message: string }>({
    success: false,
    message: ''
  });

  // State cho similar movies
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);
  const [similarLoading, setSimilarLoading] = useState<boolean>(false);

  // Thêm state để lưu tất cả dữ liệu lịch chiếu theo từng rạp
  const [allCinemasShowtimes, setAllCinemasShowtimes] = useState<{ [key: string]: Showtime[] }>({});
  const [selectedCinemaId, setSelectedCinemaId] = useState<number | null>(null);
  const [allShowtimeDates, setAllShowtimeDates] = useState<Set<string>>(new Set());

  // Define types for the tabs
  const tabs = [
    { id: 'overview' as const, name: 'Tổng quan', icon: FilmIcon },
    { id: 'showtimes' as const, name: 'Lịch chiếu', icon: CalendarIcon },
    { id: 'reviews' as const, name: 'Đánh giá', icon: ChatBubbleLeftRightIcon }
  ];

  // Handle rating submission
  const handleRateMovie = async (rating: number, content: string): Promise<boolean> => {
    if (!id) return false;

    try {
      setRatingSubmitting(true);
      console.log(`Gửi đánh giá cho phim ${id}: ${rating} sao, nội dung: ${content}`);

      // Gọi API đánh giá phim thực
      const result = await movieService.rateMovie(id, rating, content);

      if (result.success) {
        // Hiển thị toast thành công
        toast.success(result.message || 'Cảm ơn bạn đã đánh giá phim!');
        
        setSubmissionResult({
          success: true,
          message: result.message
        });

        // Refresh lại movie data để cập nhật reviews
        try {
          console.log('Refreshing movie data after successful rating...');
          const movieData = await movieService.getMovieById(id);
          if (movieData) {
            const processedMovie = processMovieData(movieData);
            console.log('Updated movie reviews count:', processedMovie.reviews?.length || 0);
            setMovie(processedMovie);
          }
        } catch (refreshError) {
          console.error('Error refreshing movie data:', refreshError);
        }

        // Auto hide message after 3 seconds
        setTimeout(() => {
          setSubmissionResult({ success: false, message: '' });
        }, 3000);

        return true;
      } else {
        // Hiển thị toast lỗi
        toast.error(result.message || 'Không thể gửi đánh giá. Vui lòng thử lại sau.');
        
        setSubmissionResult({
          success: false,
          message: result.message
        });

        // Auto hide message after 3 seconds
        setTimeout(() => {
          setSubmissionResult({ success: false, message: '' });
        }, 3000);

        return false;
      }
    } catch (error) {
      console.error('Lỗi khi gửi đánh giá:', error);
      
      const errorMessage = 'Không thể gửi đánh giá. Vui lòng thử lại sau.';
      toast.error(errorMessage);
      
      setSubmissionResult({
        success: false,
        message: errorMessage
      });

      // Auto hide message after 3 seconds
      setTimeout(() => {
        setSubmissionResult({ success: false, message: '' });
      }, 3000);

      return false;
    } finally {
      setRatingSubmitting(false);
    }
  };

  // Tab handling with the proper type
  const handleTabClick = (tab: 'overview' | 'showtimes' | 'reviews' | 'gallery') => {
    setActiveTab(tab);
  };

  // Xử lý khi người dùng chọn rạp
  const handleCinemaSelect = (cinemaId: number) => {
    console.log(`Người dùng chọn rạp với ID: ${cinemaId}`);
    setSelectedCinemaId(cinemaId);

    if (cinemaId === 0) {
      // Nếu chọn "Tất cả rạp", hiển thị toàn bộ lịch chiếu
      const allShowtimes = Object.values(allCinemasShowtimes).flat();
      setShowtimes(allShowtimes);
      console.log('Hiển thị tất cả lịch chiếu:', allShowtimes.length);
    } else {
      // Hiển thị lịch chiếu của rạp được chọn
      const cinemaShowtimes = allCinemasShowtimes[cinemaId.toString()] || [];
      setShowtimes(cinemaShowtimes);
      console.log(`Hiển thị lịch chiếu của rạp ${cinemaId}:`, cinemaShowtimes.length);
    }
  };

  // Effect để lấy dữ liệu phim
  useEffect(() => {
    if (id) {
      setLoading(true);
      setError(false);
      setIsContentLoaded(false);
      console.log(`MovieDetail - useEffect triggered with id: ${id}`);

      const fetchMovieDetails = async () => {
        try {
          // Fetch movie details using movieService first
          console.log(`MovieDetail - Đang gọi API lấy chi tiết phim ${id}...`);

          try {
            const movieData = await movieService.getMovieById(id);
            console.log('MovieService API movie data:', movieData);

            if (movieData) {
              // Process the movie data
              const processedMovie = processMovieData(movieData);
              console.log('Processed movie data:', processedMovie);
              console.log('Processed movie reviews count:', processedMovie.reviews?.length || 0);

              setMovie(processedMovie);
              setLoading(false);
              setIsContentLoaded(true);
              
              // Fetch cinemas data sau khi movie data đã được set
              fetchAllCinemas();
            } else {
              // Fallback to direct API call
              const directApiUrl = `http://localhost:3000/api/movies/${id}`;
              console.log(`Gọi trực tiếp API: ${directApiUrl}`);

              const response = await fetch(directApiUrl);
              console.log('Direct API Response status:', response.status);

              if (response.ok) {
                const apiData = await response.json();
                console.log('Direct API movie data:', apiData);

                // Process the movie data
                const processedMovie = processMovieData(apiData);
                console.log('Processed movie data:', processedMovie);
                console.log('Processed movie reviews count:', processedMovie.reviews?.length || 0);

                setMovie(processedMovie);
                setLoading(false);
                setIsContentLoaded(true);
                
                // Fetch cinemas data sau khi movie data đã được set
                fetchAllCinemas();
              } else {
                setError(true);
                setLoading(false);
                setMovie(null);
                setIsContentLoaded(true);
              }
            }
          } catch (fetchError) {
            console.error('Lỗi khi gọi fetch API:', fetchError);
            setError(true);
            setLoading(false);
            setMovie(null);
            setIsContentLoaded(true);
          }
        } catch (error) {
          console.error('Lỗi khi xử lý dữ liệu phim:', error);
          setError(true);
          setLoading(false);
          setMovie(null);
          setIsContentLoaded(true);
        }
      };

      // Thực hiện fetch dữ liệu ngay lập tức
      fetchMovieDetails();

      console.log("Started fetching data for movie ID:", id);
    }
  }, [id]);

  // Effect để fetch similar movies
  useEffect(() => {
    const fetchSimilarMovies = async () => {
      if (movie && movie.genres.length > 0) {
        setSimilarLoading(true);
        try {
          // Fetch now showing movies and filter by genre
          const nowShowingData = await movieService.getNowShowingMovies();
          const comingSoonData = await movieService.getComingSoonMovies();

          const allMovies = [...nowShowingData, ...comingSoonData];

          // Filter similar movies by genre
          const similar = allMovies
            .filter(m => m.id !== movie.id && movie.genres.some(g => m.genres && m.genres.includes(g)))
            .slice(0, 8);

          setSimilarMovies(similar);
        } catch (error) {
          console.error('Error fetching similar movies:', error);
          setSimilarMovies([]);
        } finally {
          setSimilarLoading(false);
        }
      }
    };

    fetchSimilarMovies();
  }, [movie?.id, movie?.genres?.join(',')]); // Use specific properties to avoid infinite loop

  // Hàm mới để lấy tất cả các rạp và lịch chiếu cùng lúc
  const fetchAllCinemas = async () => {
    try {
      setCinemasLoading(true);
      setShowtimesLoading(true);
      console.log(`MovieDetail - Đang gọi API lấy danh sách rạp chiếu phim ${id}...`);

      // Use direct API call to match the expected response structure
      const response = await fetch(`http://localhost:3000/api/movies/${id}/cinemas`);
      console.log('API Cinemas Response status:', response.status);

      if (response.ok) {
        const apiData = await response.json();
        console.log('MovieDetail - Raw API cinemas data:', apiData);

        if (apiData.success && apiData.data && apiData.data.Cinemas) {
          const movieData = apiData.data;
          const cinemasData = movieData.Cinemas;

          // Convert cinemas data
          const formattedCinemas: Cinema[] = cinemasData.map((cinema: any) => ({
            Cinema_ID: cinema.Cinema_ID,
            Cinema_Name: cinema.Cinema_Name,
            Address: cinema.Address,
            City: cinema.City || '',
            Province: cinema.Province || '',
            Phone_Number: cinema.Phone_Number || '',
            Email: cinema.Email || '',
            Description: cinema.Description || null,
            Status: cinema.Status || 'Active',
            Created_At: cinema.Created_At || new Date().toISOString(),
            Updated_At: cinema.Updated_At || null
          }));

          console.log('MovieDetail - Cinemas đã được format:', formattedCinemas);
          setCinemas(formattedCinemas);

          // Process showtimes from the API response
          const allShowtimes: { [key: string]: Showtime[] } = {};
          const allDates = new Set<string>();
          let combinedShowtimes: Showtime[] = [];

          cinemasData.forEach((cinema: any) => {
            const cinemaId = cinema.Cinema_ID.toString();
            const cinemaShowtimes: Showtime[] = [];

            if (cinema.ShowtimesByDate && Array.isArray(cinema.ShowtimesByDate)) {
              cinema.ShowtimesByDate.forEach((dateGroup: any) => {
                const showDate = dateGroup.Show_Date;
                allDates.add(showDate);

                if (dateGroup.Showtimes && Array.isArray(dateGroup.Showtimes)) {
                  dateGroup.Showtimes.forEach((showtime: any) => {
                    const convertedShowtime: Showtime = {
                      id: showtime.Showtime_ID.toString(),
                      movieId: movieData.Movie_ID.toString(),
                      cinemaId: cinemaId,
                      roomId: showtime.Room?.Cinema_Room_ID?.toString() || '',
                      startTime: showtime.Start_Time,
                      endTime: showtime.End_Time,
                      showDate: showDate,
                      price: 90000, // Default price
                      vipPrice: 120000,
                      couplePrice: 180000,
                      availableSeats: showtime.Capacity_Available || 0,
                      totalSeats: 100, // Default total seats
                      bookedSeats: 100 - (showtime.Capacity_Available || 0),
                      status: 'scheduled',
                      specialOffers: [],
                      isActive: true,
                      createdAt: new Date(),
                      updatedAt: new Date(),
                      roomName: showtime.Room?.Room_Name || '',
                      cinemaName: cinema.Cinema_Name,
                      room: {
                        name: showtime.Room?.Room_Name || '',
                        roomType: showtime.Room?.Room_Type || '2D'
                      }
                    };

                    cinemaShowtimes.push(convertedShowtime);
                    combinedShowtimes.push(convertedShowtime);
                  });
                }
              });
            }

            allShowtimes[cinemaId] = cinemaShowtimes;
          });

          // Update state with processed data
          setAllCinemasShowtimes(allShowtimes);
          setShowtimes(combinedShowtimes);
          setAllShowtimeDates(allDates);

          console.log('Processed cinemas:', formattedCinemas.length);
          console.log('Processed showtimes by cinema:', allShowtimes);
          console.log('Total showtimes:', combinedShowtimes.length);
          console.log('Available dates:', Array.from(allDates));

          // Auto switch to showtimes tab if data is available
          if (combinedShowtimes.length > 0) {
            setTimeout(() => {
              setActiveTab('showtimes');
            }, 500);
          }
        } else {
          console.log('API không trả về dữ liệu hợp lệ');
          setCinemas([]);
          setShowtimes([]);
        }
      } else {
        console.log('API trả về lỗi:', response.status);
        // Fallback to movieService if direct API fails
        try {
          const fallbackData = await movieService.getMovieCinemas(id!);
          if (fallbackData && fallbackData.length > 0) {
            console.log('Using fallback movieService data');
            const formattedCinemas: Cinema[] = fallbackData.map((cinema: any) => ({
              Cinema_ID: cinema.Cinema_ID || cinema.id || 0,
              Cinema_Name: cinema.Cinema_Name || cinema.name || '',
              Address: cinema.Address || cinema.address || '',
              City: cinema.City || cinema.city || '',
              Province: cinema.Province || cinema.province || '',
              Phone_Number: cinema.Phone_Number || cinema.phone || '',
              Email: cinema.Email || cinema.email || '',
              Description: cinema.Description || null,
              Status: cinema.Status || 'Active',
              Created_At: cinema.Created_At || new Date().toISOString(),
              Updated_At: cinema.Updated_At || null
            }));
            setCinemas(formattedCinemas);
          }
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
          setCinemas([]);
          setShowtimes([]);
        }
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách rạp:', error);
      setCinemas([]);
      setShowtimes([]);
    } finally {
      setCinemasLoading(false);
      setShowtimesLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Header />
        <div className="pt-20 flex flex-col items-center justify-center h-[80vh]">
          <LoadingSpinner />
          <p className="text-lg text-white mt-4">Đang tải thông tin phim...</p>
        </div>
      </div>
    );
  }

  if (error || !movie) {
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

  // Fetch related movies based on genre
  const relatedMovies = similarMovies.length > 0 ? similarMovies.slice(0, 4) : [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: movie.title,
        text: movie.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // Show toast notification
    }
  };

  const handleBookNow = () => {
    navigate(`/movies/${id}/showtimes`);
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Header />

      <main className="pt-20">
        {/* Hero Section */}
        <section className={`relative h-screen overflow-hidden ${isContentLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-700`}>
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src={movie.backgroundImage || movie.poster}
              alt={movie.title}
              className="w-full h-full object-cover transform scale-105 animate-slow-zoom"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
          </div>

          {/* Content */}
          <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center w-full">
              {/* Movie Poster */}
              <div className="lg:col-span-1 animate-fadeInLeft">
                <div className="relative max-w-sm mx-auto transform hover:scale-105 transition-transform duration-300">
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="w-full rounded-2xl shadow-2xl shadow-[#FFD875]/20"
                  />

                  {/* Play Button Overlay */}
                  <button
                    onClick={() => setShowTrailerModal(true)}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-2xl group"
                  >
                    <div className="w-20 h-20 bg-[#FFD875] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-[#FFD875]/30">
                      <PlayIcon className="w-8 h-8 text-black ml-1" />
                    </div>
                  </button>

                  {/* Coming Soon Badge */}
                  {movie.isComingSoon && (
                    <div className="absolute -top-4 -right-4 bg-gradient-to-r from-[#FFD875] to-[#FFD875]/80 text-black px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse">
                      Sắp Chiếu
                    </div>
                  )}
                </div>
              </div>

              {/* Movie Info */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h1 className="text-4xl lg:text-6xl font-bold text-white mb-2 animate-fadeInUp">
                    {movie.title}
                  </h1>
                  {movie.englishTitle !== movie.title && (
                    <p className="text-xl text-gray-300 animate-fadeInUp animation-delay-200">
                      {movie.englishTitle}
                    </p>
                  )}
                </div>

                {/* Rating & Info */}
                <div className="flex flex-wrap items-center gap-6 animate-fadeInUp animation-delay-400">
                  <div className="flex items-center space-x-2">
                    <StarIcon className="w-6 h-6 text-[#FFD875]" />
                    <span className="text-2xl font-bold text-white">{movie.rating}</span>
                    <span className="text-gray-400">/5</span>
                  </div>

                  <div className="flex items-center space-x-2 text-gray-300">
                    <ClockIcon className="w-5 h-5 text-[#FFD875]" />
                    <span>{movie.duration}</span>
                  </div>

                  <div className="flex items-center space-x-2 text-gray-300">
                    <CalendarIcon className="w-5 h-5 text-[#FFD875]" />
                    <span>{formatDate(movie.releaseDate)}</span>
                  </div>

                  <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {movie.ageRating}
                  </div>
                </div>

                {/* Genres */}
                <div className="flex flex-wrap gap-2 animate-fadeInUp animation-delay-500">
                  {movie.genres.map((genre, index) => (
                    <span
                      key={index}
                      className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm hover:bg-[#FFD875]/20 hover:text-[#FFD875] transition-colors duration-300 cursor-pointer"
                    >
                      {genre}
                    </span>
                  ))}
                </div>

                {/* Description */}
                <p className="text-lg text-gray-300 leading-relaxed max-w-3xl animate-fadeInUp animation-delay-600">
                  {movie.description}
                </p>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 animate-fadeInUp animation-delay-700">
                  <button
                    onClick={() => setShowTrailerModal(true)}
                    className="bg-[#FFD875] hover:bg-[#FFD875]/80 text-black py-3 px-6 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_15px_rgba(255,216,117,0.4)] flex items-center space-x-2"
                  >
                    <PlayIcon className="w-5 h-5" />
                    <span>Xem Trailer</span>
                  </button>

                  {!movie.isComingSoon && (
                    <button
                      onClick={handleBookNow}
                      className="bg-transparent border-2 border-[#FFD875] text-[#FFD875] hover:bg-[#FFD875] hover:text-black py-3 px-6 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
                    >
                      <CalendarIcon className="w-5 h-5" />
                      <span>Đặt Vé</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content Tabs */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <Breadcrumb
              items={[
                { label: 'Phim', path: '/movies' },
                { label: movie.title }
              ]}
            />

            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-4 mb-8 animate-fadeInUp">
              {tabs.map((tab, index) => {
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${activeTab === tab.id
                      ? 'bg-[#FFD875] text-black shadow-[0_0_15px_rgba(255,216,117,0.3)]'
                      : 'bg-gray-800/50 backdrop-blur-sm border border-gray-600 text-white'
                      }`}
                    style={{ animationDelay: `${index * 100 + 800}ms` }}
                  >
                    {React.createElement(tab.icon, { className: "w-5 h-5" })}
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div className="animate-fadeInUp animation-delay-1000">
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Movie Details */}
                  <div className="lg:col-span-2 space-y-8">
                    {/* Cast & Crew */}
                    <div className="glass-dark p-6 rounded-2xl hover:shadow-[0_0_20px_rgba(255,216,117,0.2)] transition-all duration-500">
                      <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                        <UserGroupIcon className="w-6 h-6 mr-2 text-[#FFD875]" />
                        Diễn Viên & Đạo Diễn
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-[#FFD875] mb-2">Đạo diễn:</h4>
                          <p className="text-gray-300">{movie.director}</p>
                        </div>

                        <div>
                          <h4 className="font-semibold text-[#FFD875] mb-2">Diễn viên:</h4>
                          <div className="flex flex-wrap gap-2">
                            {movie.cast.map((actor, index) => (
                              <span
                                key={index}
                                className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm hover:bg-[#FFD875]/20 hover:text-[#FFD875] transition-all duration-300 cursor-pointer transform hover:scale-105"
                                style={{ animationDelay: `${index * 100}ms` }}
                              >
                                {actor}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Synopsis */}
                    <div className="glass-dark p-6 rounded-2xl hover:shadow-[0_0_20px_rgba(255,216,117,0.2)] transition-all duration-500">
                      <h3 className="text-xl font-bold text-white mb-4">
                        Nội Dung Phim
                      </h3>
                      <p className="text-gray-300 leading-relaxed">
                        {movie.description}
                      </p>
                    </div>
                  </div>

                  {/* Movie Info Sidebar */}
                  <div className="space-y-6">
                    <div className="glass-dark p-6 rounded-2xl hover:shadow-[0_0_20px_rgba(255,216,117,0.2)] transition-all duration-500">
                      <h3 className="text-lg font-bold text-white mb-4">
                        Thông Tin Phim
                      </h3>

                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between p-2 hover:bg-slate-700/30 rounded-lg transition-colors">
                          <span className="text-gray-400">Thể loại:</span>
                          <span className="text-white">{movie.genres.join(', ')}</span>
                        </div>

                        <div className="flex justify-between p-2 hover:bg-slate-700/30 rounded-lg transition-colors">
                          <span className="text-gray-400">Thời lượng:</span>
                          <span className="text-white">{movie.duration}</span>
                        </div>

                        <div className="flex justify-between p-2 hover:bg-slate-700/30 rounded-lg transition-colors">
                          <span className="text-gray-400">Ngày phát hành:</span>
                          <span className="text-white">{formatDate(movie.releaseDate)}</span>
                        </div>

                        <div className="flex justify-between p-2 hover:bg-slate-700/30 rounded-lg transition-colors">
                          <span className="text-gray-400">Quốc gia:</span>
                          <span className="text-white">{movie.country}</span>
                        </div>

                        <div className="flex justify-between p-2 hover:bg-slate-700/30 rounded-lg transition-colors">
                          <span className="text-gray-400">Ngôn ngữ:</span>
                          <span className="text-white">{movie.language}</span>
                        </div>

                        <div className="flex justify-between p-2 hover:bg-slate-700/30 rounded-lg transition-colors">
                          <span className="text-gray-400">Phân loại:</span>
                          <span className="text-white">{movie.ageRating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'showtimes' && (
                <ShowtimeSection
                  movieId={movie.id}
                  cinemas={cinemas}
                  showtimes={showtimes}
                  onCinemaSelect={handleCinemaSelect}
                  loading={cinemasLoading}
                />
              )}

              {activeTab === 'reviews' && (
                <>
                  {console.log('Rendering ReviewSection with reviews:', movie.reviews)}
                  <ReviewSection
                    movieId={movie.id}
                    reviews={movie.reviews || []}
                    onSubmitReview={handleRateMovie}
                  />
                </>
              )}

              {activeTab === 'gallery' && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[movie.poster, movie.backgroundImage, ...movie.gallery].map((image, index) => (
                    <div
                      key={index}
                      className="relative aspect-video rounded-lg overflow-hidden cursor-pointer group transform transition-all duration-300 hover:scale-105 hover:shadow-[0_0_15px_rgba(255,216,117,0.3)]"
                      onClick={() => setShowFullGallery(true)}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <img
                        src={image}
                        alt={`${movie.title} ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="w-12 h-12 bg-[#FFD875] rounded-full flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300">
                          <PlayIcon className="w-6 h-6 text-black" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Related Movies */}
        {relatedMovies.length > 0 && (
          <section className="py-12 bg-slate-800/50">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl lg:text-3xl font-bold text-white mb-8 animate-fadeInUp">
                Phim Liên Quan
                {similarLoading && <LoadingSpinner />}
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {relatedMovies.slice(0, 8).map((relatedMovie, index) => (
                  <div
                    key={relatedMovie.id}
                    className="relative group animate-fadeInUp"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <Link to={`/movies/${relatedMovie.id}`} className="block">
                      <div className="relative overflow-hidden rounded-lg aspect-[2/3]">
                        <img
                          src={relatedMovie.poster}
                          alt={relatedMovie.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />

                        {/* Age rating badge */}
                        <div className={`absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold ${relatedMovie.ageRating === 'P' ? 'bg-green-500 text-white' :
                          relatedMovie.ageRating === 'P13' ? 'bg-yellow-500 text-black' :
                            relatedMovie.ageRating === 'T16' ? 'bg-orange-500 text-white' :
                              relatedMovie.ageRating === 'T18' ? 'bg-red-600 text-white' :
                                'bg-gray-600 text-white'
                        }`}>
                          {relatedMovie.ageRating}
                        </div>

                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute bottom-0 left-0 right-0 p-3">
                            <h3 className="text-white font-medium text-sm line-clamp-1 mb-1">{relatedMovie.title}</h3>
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center">
                                <StarIcon className="w-3 h-3 text-[#FFD875]" />
                                <span className="text-white text-xs ml-1">{relatedMovie.rating}</span>
                              </div>
                              <span className="text-gray-400 text-xs">{new Date(relatedMovie.releaseDate).getFullYear()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>

                    {/* Expanded hover card */}
                    <div className="absolute z-20 left-0 top-0 w-64 h-64 bg-slate-800 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-left scale-95 group-hover:scale-100 pointer-events-none">
                      <div className="p-3 h-full flex flex-col">
                        <div className="relative h-32 mb-2">
                          <img
                            src={relatedMovie.poster}
                            alt={relatedMovie.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <div className="absolute top-2 right-2">
                            <div className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold ${relatedMovie.ageRating === 'P' ? 'bg-green-500 text-white' :
                              relatedMovie.ageRating === 'P13' ? 'bg-yellow-500 text-black' :
                                relatedMovie.ageRating === 'T16' ? 'bg-orange-500 text-white' :
                                  relatedMovie.ageRating === 'T18' ? 'bg-red-600 text-white' :
                                    'bg-gray-600 text-white'
                              }`}>
                              {relatedMovie.ageRating}
                            </div>
                          </div>
                        </div>

                        <div className="flex-grow overflow-hidden">
                          <h3 className="text-white font-semibold text-sm line-clamp-1">{relatedMovie.title}</h3>
                          <div className="flex items-center space-x-2 mb-1">
                            <StarIcon className="w-3 h-3 text-[#FFD875]" />
                            <span className="text-white text-xs">{relatedMovie.rating}</span>
                            <span className="text-gray-400 text-xs">{new Date(relatedMovie.releaseDate).getFullYear()}</span>
                          </div>
                          <p className="text-gray-300 text-xs line-clamp-2">{relatedMovie.description}</p>
                        </div>

                        {/* Action buttons */}
                        <div className="grid grid-cols-3 gap-1 mt-2">
                          <Link
                            to={`/movies/${relatedMovie.id}/showtimes`}
                            className="bg-[#FFD875] text-black text-xs font-medium py-2 rounded flex items-center justify-center hover:bg-[#FFD875]/80 transition-colors pointer-events-auto"
                          >
                            Đặt vé
                          </Link>
                          <button
                            className="bg-slate-700 text-white text-xs font-medium py-2 rounded flex items-center justify-center hover:bg-slate-600 transition-colors pointer-events-auto"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              // Add to favorites logic here
                            }}
                          >
                            <HeartIcon className="w-3 h-3 mr-1" />
                            Thích
                          </button>
                          <Link
                            to={`/movies/${relatedMovie.id}`}
                            className="bg-slate-700 text-white text-xs font-medium py-2 rounded flex items-center justify-center hover:bg-slate-600 transition-colors pointer-events-auto"
                          >
                            Chi tiết
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Modals */}
      {showTrailerModal && (
        <TrailerModal
          movie={movie}
          onClose={() => setShowTrailerModal(false)}
        />
      )}

      {showFullGallery && (
        <ImageGallery
          images={[movie.poster, movie.backgroundImage, ...movie.gallery]}
          movieTitle={movie.title}
          onClose={() => setShowFullGallery(false)}
        />
      )}
    </div>
  );
};

export default MovieDetail;

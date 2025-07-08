// src/pages/admin/movies/EditMovie.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import MultiStepMovieForm from '../../../components/admin/forms/MultiStepMovieForm';
import '../styles/MovieManagement.css';
import { motion } from 'framer-motion';
import { movieService } from '../../../services/movieService';
import { toast } from 'react-hot-toast';
import FullScreenLoader from '../../../components/FullScreenLoader';

const EditMovie: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovie = async () => {
      if (id) {
        try {
          setLoading(true);
          const movieData = await movieService.getMovieById(Number(id));
          console.log('Fetched movie data:', movieData); // Ghi log để xem dữ liệu trả về

          // Đảm bảo tất cả dữ liệu cần thiết được chuẩn bị và định dạng đúng
          const processedMovie = {
            movieID: movieData.movieID || movieData.Movie_ID,
            Movie_ID: movieData.movieID || movieData.Movie_ID,
            Movie_Name: movieData.movieName || movieData.Movie_Name || '',
            Synopsis: movieData.synopsis || movieData.Synopsis || '',
            Duration: movieData.duration || movieData.Duration || 60,
            Release_Date: formatDateForInput(movieData.releaseDate || movieData.Release_Date),
            Premiere_Date: formatDateForInput(movieData.premiereDate || movieData.Premiere_Date),
            End_Date: formatDateForInput(movieData.endDate || movieData.End_Date),
            Director: movieData.director || movieData.Director || '',
            Cast: movieData.cast || movieData.Cast || '',
            Genre: movieData.genre || movieData.Genre || '',
            Language: movieData.language || movieData.Language || 'Tiếng Việt (Lồng tiếng)',
            Country: movieData.country || movieData.Country || 'Việt Nam',
            Rating: movieData.rating || movieData.Rating || '',
            Status: movieData.status || movieData.Status || 'Now Showing',
            Production_Company: movieData.productionCompany || movieData.Production_Company || '',
            Trailer_Link: movieData.trailerLink || movieData.Trailer_Link || '',
            Poster_URL: movieData.posterURL || movieData.Poster_URL || '',
            // Dữ liệu bổ sung nếu có
            movieName: movieData.movieName || movieData.Movie_Name || '',
            synopsis: movieData.synopsis || movieData.Synopsis || '',
            duration: movieData.duration || movieData.Duration || 60,
            releaseDate: formatDateForInput(movieData.releaseDate || movieData.Release_Date),
            premiereDate: formatDateForInput(movieData.premiereDate || movieData.Premiere_Date),
            endDate: formatDateForInput(movieData.endDate || movieData.End_Date),
            director: movieData.director || movieData.Director || '',
            cast: movieData.cast || movieData.Cast || '',
            genre: movieData.genre || movieData.Genre || '',
            rating: movieData.rating || movieData.Rating || '',
            status: movieData.status || movieData.Status || 'Now Showing',
            language: movieData.language || movieData.Language || 'Tiếng Việt (Lồng tiếng)',
            country: movieData.country || movieData.Country || 'Việt Nam',
            productionCompany: movieData.productionCompany || movieData.Production_Company || '',
            trailerLink: movieData.trailerLink || movieData.Trailer_Link || '',
            posterURL: movieData.posterURL || movieData.Poster_URL || '',
          };

          console.log('Processed movie data:', processedMovie); // Ghi log dữ liệu đã xử lý
          setMovie(processedMovie);
        } catch (error) {
          console.error('Error fetching movie:', error);
          toast.error('Không thể tải thông tin phim');
          navigate('/admin/movies');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchMovie();
  }, [id, navigate]);

  // Hàm để định dạng ngày thành yyyy-MM-dd cho input
  const formatDateForInput = (dateString: string | null | undefined): string => {
    if (!dateString) return '';
    try {
      // Xử lý nhiều định dạng ngày có thể có
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (e) {
      console.error('Error formatting date:', e);
      return '';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center">
          <FullScreenLoader />
          <p className="mt-4 text-white">Đang tải thông tin phim...</p>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Không tìm thấy phim</h2>
          <Link
            to="/admin/movies"
            className="bg-[#FFD875] text-gray-900 px-4 py-2 rounded-lg hover:bg-[#e5c368] transition-colors shadow-[0_0_15px_0_rgba(255,216,117,0.3)] hover:shadow-[0_0_20px_5px_rgba(255,216,117,0.5)]"
          >
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  // Config giới hạn trạng thái cho form edit
  const limitedStatuses = {
    statuses: ['Now Showing', 'Ended', 'Cancelled', 'Inactive']
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4">
      <motion.div
        className="mb-8 flex items-center"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Link
          to="/admin/movies"
          className="mr-4 p-2 rounded-full hover:bg-slate-800 transition-all duration-200 text-gray-400 hover:text-white group"
        >
          <ArrowLeftIcon className="h-6 w-6 group-hover:scale-110 transition-transform" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Chỉnh sửa phim: {movie.Movie_Name || movie.movieName}</h1>
          <p className="text-gray-400 mt-1">Cập nhật thông tin phim</p>
        </div>
      </motion.div>

      <motion.div
        className="fade-in bg-slate-800 rounded-xl shadow-lg border border-slate-700 shadow-[0_0_20px_0_rgba(0,0,0,0.3)] relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {/* Hiệu ứng gradient cho viền */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#FFD875]/10 via-[#FFD875]/30 to-[#FFD875]/10 rounded-xl blur-sm -z-10"></div>

        {/* Hiệu ứng overlay gradient ở đầu form */}
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[#FFD875]/20 to-transparent"></div>

        <div className="p-1"> {/* Padding để tạo hiệu ứng viền gradient */}
          <div className="bg-slate-800 rounded-lg p-6">
            <MultiStepMovieForm mode="edit" movie={movie} additionalData={limitedStatuses} />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EditMovie;

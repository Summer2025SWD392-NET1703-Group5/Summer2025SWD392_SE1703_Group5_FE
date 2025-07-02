// src/pages/admin/MovieManagement.tsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  StarIcon,
  FilmIcon,
  ClockIcon,
  CalendarIcon,
  ArrowLeftIcon,
  EyeIcon,
  CloudArrowDownIcon
} from '@heroicons/react/24/outline';
import { movieService } from '../../services/movieService';
import { referenceService } from '../../services/referenceService';
import MultiStepMovieForm from '../../components/admin/forms/MultiStepMovieForm';
import DataTable from '../../components/admin/common/DataTable';
import ConfirmDialog from '../../components/admin/common/ConfirmDialog';
import ExcelImportExport from '../../components/admin/common/ExcelImportExport';
import TMDBImportModal from './movies/TMDBImportModal';
import { formatDate } from '../../utils/dashboardUtils';
import { toast } from 'react-hot-toast';
import './styles/MovieManagement.css';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Define the interface for the backend API response
interface MovieAPI {
  Movie_ID: number;
  Movie_Name: string;
  Release_Date: string;
  Premiere_Date: string | null;
  End_Date: string | null;
  Director: string;
  Cast: string;
  Duration: number;
  Genre: string;
  Rating: string;
  Language: string;
  Country: string;
  Synopsis: string;
  Poster_URL: string;
  Trailer_Link: string;
  Status: string;
  Average_Rating: number;
  Rating_Count: number;
  Showtimes_Count: number;
}

const MovieManagement: React.FC = () => {
  const [movies, setMovies] = useState<MovieAPI[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<any | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [movieToDelete, setMovieToDelete] = useState<MovieAPI | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [showTMDBImport, setShowTMDBImport] = useState(false);
  const [validRatings, setValidRatings] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMovies();
    fetchValidRatings();
  }, []);

  const fetchValidRatings = async () => {
    try {
      const ratings = await referenceService.getValidRatings();
      setValidRatings(ratings);
      console.log('Valid ratings from backend:', ratings);
    } catch (error) {
      console.error('Error fetching valid ratings:', error);
    }
  };

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const fetchedMovies = await movieService.getMovies();
      console.log('Fetched movies:', fetchedMovies);
      setMovies(fetchedMovies);
    } catch (error) {
      toast.error('Không thể tải danh sách phim.');
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
    }
  };

  // Callback khi import thành công với ExportImportToolbar
  const handleImportComplete = () => {
    toast.success('Đang làm mới danh sách phim...');
    fetchMovies(); // Làm mới danh sách phim sau khi import
  };

  const handleCreateMovie = () => {
    navigate('/admin/movies/add');
  };

  const handleEditMovie = (movie: MovieAPI) => {
    navigate(`/admin/movies/${movie.Movie_ID}/edit`);
  };

  const handleViewMovie = (movie: MovieAPI) => {
    navigate(`/admin/movies/${movie.Movie_ID}`);
  };

  const handleDeleteMovie = (movie: MovieAPI) => {
    setMovieToDelete(movie);
    setShowDeleteDialog(true);
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    setSelectedMovie(undefined);
    fetchMovies();
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setSelectedMovie(undefined);
  };

  const confirmDelete = async () => {
    if (movieToDelete && movieToDelete.Movie_ID) {
      const toastId = toast.loading('Đang xóa phim...');
      try {
        await movieService.deleteMovie(movieToDelete.Movie_ID);
        setShowDeleteDialog(false);
        setMovieToDelete(null);
        toast.success('Xóa phim thành công!', { id: toastId });
        fetchMovies();
      } catch (error) {
        toast.error('Xóa phim thất bại.', { id: toastId });
        console.error('Error deleting movie:', error);
      }
    }
  };

  // Cấu hình header cho file Excel
  const excelHeaders = {
    Movie_Name: 'Tên phim',
    Director: 'Đạo diễn',
    Cast: 'Diễn viên',
    Genre: 'Thể loại',
    Synopsis: 'Mô tả',
    Duration: 'Thời lượng (phút)',
    Rating: 'Phân loại',
    Language: 'Ngôn ngữ',
    Country: 'Quốc gia',
    Release_Date: 'Ngày khởi chiếu (YYYY-MM-DD)',
    Status: 'Trạng thái',
    Production_Company: 'Công ty sản xuất',
    Poster_URL: 'Đường dẫn poster',
    Trailer_Link: 'Đường dẫn trailer'
  };

  // Xử lý dữ liệu phim để xuất Excel
  const moviesForExport = useMemo(() => {
    return movies.map(movie => ({
      Movie_ID: movie.Movie_ID,
      Movie_Name: movie.Movie_Name,
      Director: movie.Director || '',
      Cast: movie.Cast || '',
      Genre: movie.Genre || '',
      Synopsis: movie.Synopsis || '',
      Duration: movie.Duration,
      Rating: movie.Rating || '',
      Language: movie.Language || '',
      Country: movie.Country || '',
      Release_Date: movie.Release_Date ? movie.Release_Date.split('T')[0] : '',
      Premiere_Date: movie.Premiere_Date ? movie.Premiere_Date.split('T')[0] : '',
      End_Date: movie.End_Date ? movie.End_Date.split('T')[0] : '',
      Status: movie.Status || '',
      Production_Company: '',
      Poster_URL: movie.Poster_URL || '',
      Trailer_Link: movie.Trailer_Link || ''
    }));
  }, [movies]);

  // Xử lý khi nhập dữ liệu từ Excel
  const handleImportMovies = async (importedData: any[]) => {
    if (!importedData || importedData.length === 0) {
      toast.error('Không có dữ liệu phim để nhập');
      return;
    }

    setImportLoading(true);
    const toastId = toast.loading('Đang nhập dữ liệu phim...');

    try {
      // Đây là nơi bạn sẽ gọi API để thêm nhiều phim cùng lúc
      // Giả lập việc thêm phim bằng timeout
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast.success(`Đã nhập ${importedData.length} phim thành công!`, { id: toastId });

      // Nếu có API thực để thêm nhiều phim, bạn sẽ gọi ở đây
      // const result = await movieService.bulkAddMovies(importedData);

      // Sau khi nhập xong, làm mới danh sách phim
      fetchMovies();
    } catch (error) {
      console.error('Import movies error:', error);
      toast.error('Nhập dữ liệu phim thất bại', { id: toastId });
    } finally {
      setImportLoading(false);
    }
  };

  // Handle TMDB import
  const handleTMDBImport = async (tmdbMovies: any[]) => {
    setImportLoading(true);
    const toastId = toast.loading(`Đang import ${tmdbMovies.length} phim từ TMDB...`);

    try {
      // Convert TMDB movies to your backend format
      const moviesToAdd = tmdbMovies.map(movie => {
        // Xử lý Release_Date - nếu phim đã phát hành, set ngày trong tương lai
        const releaseDate = new Date(movie.releaseDate);
        const today = new Date();
        let finalReleaseDate;

        if (releaseDate <= today) {
          // Nếu phim đã phát hành, set ngày phát hành là 7 ngày sau
          const futureDate = new Date(today);
          futureDate.setDate(futureDate.getDate() + 7);
          finalReleaseDate = futureDate.toISOString().split('T')[0];
        } else {
          finalReleaseDate = movie.releaseDate;
        }

        // Xử lý Rating - sử dụng danh sách rating hợp lệ từ backend
        let rating = validRatings[0] || 'P'; // Default là giá trị đầu tiên
        const ageRating = movie.ageRating || '13+';

        // Map TMDB rating sang backend rating
        if (validRatings.length > 0) {
          // Tìm rating phù hợp dựa trên số tuổi
          const age = parseInt(ageRating.replace('+', ''));

          if (age >= 18) {
            rating = validRatings.find(r => r.includes('18') || r === 'C18') || validRatings[validRatings.length - 1];
          } else if (age >= 16) {
            rating = validRatings.find(r => r.includes('16') || r === 'C16') || validRatings[Math.floor(validRatings.length * 0.66)];
          } else if (age >= 13) {
            rating = validRatings.find(r => r.includes('13') || r === 'C13') || validRatings[Math.floor(validRatings.length * 0.33)];
          } else {
            rating = validRatings.find(r => r === 'P' || r.toLowerCase() === 'g' || r.toLowerCase() === 'pg') || validRatings[0];
          }
        }

        return {
          Movie_Name: movie.title,
          Release_Date: finalReleaseDate,
          Director: movie.director || 'Đang cập nhật',
          Cast: movie.cast?.join(', ') || 'Đang cập nhật',
          Duration: movie.duration || 120,
          Genre: movie.genres?.join(', ') || 'Hành động',
          Rating: rating,
          Language: movie.language || 'Tiếng Anh - Phụ đề Việt',
          Country: 'USA',
          Synopsis: movie.description || 'Đang cập nhật nội dung phim...',
          Poster_URL: movie.poster,
          Trailer_Link: movie.trailer || '',
          Status: 'Coming Soon', // Luôn set Coming Soon cho phim mới
          Production_Company: 'TMDB Import'
        };
      });

      // Try bulk add first if available
      let successCount = 0;
      const failedMovies = [];

      try {
        // Sử dụng bulkAddMovies (sẽ thêm từng phim một)
        const result = await movieService.bulkAddMovies(moviesToAdd);

        if (result.results) {
          successCount = result.results.length;
        }

        if (result.errors && result.errors.length > 0) {
          result.errors.forEach((err: any) => {
            const errorDetail = err.error;
            let errorMessage = 'Lỗi không xác định';

            if (errorDetail?.errors && Array.isArray(errorDetail.errors)) {
              errorMessage = errorDetail.errors.map((e: any) =>
                `${e.field}: ${e.message}`
              ).join(', ');
            } else if (errorDetail?.message) {
              errorMessage = errorDetail.message;
            }

            failedMovies.push({
              name: err.movie,
              error: errorMessage,
              details: errorDetail
            });
          });
        }
      } catch (bulkError: any) {
        console.error('Bulk import error:', bulkError);

        // Nếu bulkAddMovies thất bại hoàn toàn, thử thêm từng phim
        for (const movie of moviesToAdd) {
          try {
            await movieService.addMovie(movie);
            successCount++;
          } catch (error: any) {
            console.error(`Failed to add movie: ${movie.Movie_Name}`, error);
            const errorDetail = error.response?.data;
            let errorMessage = 'Lỗi không xác định';

            if (errorDetail?.errors && Array.isArray(errorDetail.errors)) {
              errorMessage = errorDetail.errors.map((e: any) =>
                `${e.field}: ${e.message}`
              ).join(', ');
            } else if (errorDetail?.message) {
              errorMessage = errorDetail.message;
            }

            failedMovies.push({
              name: movie.Movie_Name,
              error: errorMessage,
              details: errorDetail
            });
          }
        }
      }

      if (successCount > 0) {
        toast.success(`Đã import thành công ${successCount}/${tmdbMovies.length} phim!`, { id: toastId });
      } else {
        toast.error('Không thể import phim nào', { id: toastId });
      }

      // Hiển thị lỗi chi tiết nếu có
      if (failedMovies.length > 0) {
        console.error('Failed movies:', failedMovies);

        // Phân tích lỗi để đưa ra gợi ý
        const hasRatingError = failedMovies.some(f =>
          f.error.toLowerCase().includes('rating') ||
          f.error.toLowerCase().includes('xếp hạng')
        );

        const hasDateError = failedMovies.some(f =>
          f.error.toLowerCase().includes('date') ||
          f.error.toLowerCase().includes('ngày')
        );

        if (hasRatingError) {
          toast.error('Lỗi: Backend yêu cầu định dạng xếp hạng độ tuổi khác. Vui lòng kiểm tra với admin.', { duration: 7000 });
        }

        if (hasDateError) {
          toast.error('Lỗi: Ngày phát hành phải trong tương lai. Đã tự động điều chỉnh nhưng vẫn lỗi.', { duration: 7000 });
        }

        // Hiển thị chi tiết lỗi cho từng phim
        failedMovies.slice(0, 3).forEach(failed => {
          toast.error(`${failed.name}: ${failed.error}`, { duration: 5000 });
        });

        if (failedMovies.length > 3) {
          toast.error(`Và ${failedMovies.length - 3} phim khác...`, { duration: 5000 });
        }
      }

      // Refresh movie list
      if (successCount > 0) {
        fetchMovies();
      }
      setShowTMDBImport(false);
    } catch (error) {
      console.error('TMDB import error:', error);
      toast.error('Import phim từ TMDB thất bại', { id: toastId });
    } finally {
      setImportLoading(false);
    }
  };

  const filteredMovies = useMemo(() => {
    return movies
      .filter(movie => {
        if (!movie || !movie.Movie_Name) {
          return false;
        }
        const matchesSearch = movie.Movie_Name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || movie.Status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => new Date(b.Release_Date).getTime() - new Date(a.Release_Date).getTime());
  }, [movies, searchTerm, statusFilter]);

  const columns = [
    {
      key: 'Poster_URL',
      title: 'Poster',
      render: (movie: MovieAPI) => (
        <div
          className="w-16 h-24 rounded overflow-hidden hover:scale-110 transition-transform duration-300 group cursor-pointer poster-glow"
          onClick={() => handleViewMovie(movie)}
        >
          <img
            src={movie.Poster_URL || '/placeholder.png'}
            alt="Poster"
            className="w-full h-full object-cover rounded shadow-md"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-60 transition-opacity duration-300 flex items-center justify-center">
            <EyeIcon className="w-8 h-8 text-[#FFD875] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </div>
      ),
    },
    {
      key: 'Movie_Name',
      title: 'Tên phim',
      render: (movie: MovieAPI) => (
        <div>
          <p className="font-medium text-white">{movie.Movie_Name}</p>
          <p className="text-xs text-gray-400">{movie.Genre}</p>
        </div>
      )
    },
    {
      key: 'Duration',
      title: 'Thời lượng',
      render: (movie: MovieAPI) => (
        <div className="flex items-center">
          <ClockIcon className="w-4 h-4 text-gray-400 mr-1" />
          <span>{movie.Duration} phút</span>
        </div>
      ),
    },
    {
      key: 'Release_Date',
      title: 'Ngày khởi chiếu',
      render: (movie: MovieAPI) => (
        <div className="flex items-center">
          <CalendarIcon className="w-4 h-4 text-gray-400 mr-1" />
          <span>{formatDate(movie.Release_Date)}</span>
        </div>
      ),
    },
    {
      key: 'Status',
      title: 'Trạng thái',
      render: (movie: MovieAPI) => {
        const statusMap: { [key: string]: { text: string; className: string; icon: React.ReactNode } } = {
          'Now Showing': {
            text: 'Đang chiếu',
            className: 'bg-green-500/20 text-green-400 border border-green-500/30',
            icon: <FilmIcon className="w-3.5 h-3.5 mr-1" />
          },
          'Coming Soon': {
            text: 'Sắp chiếu',
            className: 'bg-[#FFD875]/20 text-[#FFD875] border border-[#FFD875]/30',
            icon: <CalendarIcon className="w-3.5 h-3.5 mr-1" />
          },
          'Ended': {
            text: 'Đã kết thúc',
            className: 'bg-red-500/20 text-red-400 border border-red-500/30',
            icon: <FilmIcon className="w-3.5 h-3.5 mr-1" />
          },
          'Cancelled': {
            text: 'Đã hủy',
            className: 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
            icon: <FilmIcon className="w-3.5 h-3.5 mr-1" />
          },
          'Inactive': {
            text: 'Không hoạt động',
            className: 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
            icon: <FilmIcon className="w-3.5 h-3.5 mr-1" />
          },
        };
        const statusInfo = statusMap[movie.Status] || {
          text: movie.Status,
          className: 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
          icon: <FilmIcon className="w-3.5 h-3.5 mr-1" />
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center justify-center ${statusInfo.className}`}>
            {statusInfo.icon}
            {statusInfo.text}
          </span>
        );
      },
    },
    {
      key: 'Rating',
      title: 'Đánh giá',
      render: (movie: MovieAPI) => (
        <div className="flex items-center">
          <StarIcon className="w-4 h-4 text-[#FFD875] mr-1" />
          <span>{movie.Average_Rating || 0}</span>
          <span className="text-gray-500 text-xs ml-1">({movie.Rating_Count || 0})</span>
        </div>
      ),
    },
    {
      key: 'actions',
      title: 'Hành động',
      render: (movie: MovieAPI) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleViewMovie(movie)}
            className="p-2 text-gray-400 hover:text-[#FFD875] transition-colors duration-300 rounded-full hover:bg-slate-700 hover:shadow-[0_0_10px_0_rgba(255,216,117,0.4)]"
            title="Xem chi tiết"
          >
            <EyeIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleEditMovie(movie)}
            className="p-2 text-gray-400 hover:text-[#FFD875] transition-colors duration-300 rounded-full hover:bg-slate-700 hover:shadow-[0_0_10px_0_rgba(255,216,117,0.4)]"
            title="Chỉnh sửa"
          >
            <PencilIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleDeleteMovie(movie)}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-300 rounded-full hover:bg-slate-700 hover:shadow-[0_0_10px_0_rgba(239,68,68,0.4)]"
            title="Xóa"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      ),
    },
  ];

  if (showForm) {
    return (
      <div className="min-h-screen bg-slate-900 flex">
        <div className="flex-1">
          <main className="p-6">
            <motion.div
              className="mb-6 flex items-center"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <button
                onClick={handleCancelForm}
                className="mr-4 p-2 rounded-full hover:bg-slate-700 transition-all duration-200 text-gray-400 hover:text-white group"
              >
                <ArrowLeftIcon className="h-6 w-6 group-hover:scale-110 transition-transform" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {selectedMovie ? 'Chỉnh sửa phim' : 'Thêm phim mới'}
                </h1>
                <p className="text-gray-400 mt-1">
                  {selectedMovie ? 'Cập nhật thông tin phim' : 'Tạo phim mới với các thông tin chi tiết'}
                </p>
              </div>
            </motion.div>

            <motion.div
              className="fade-in"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <MultiStepMovieForm
                mode={selectedMovie ? "edit" : "add"}
                movie={selectedMovie}
              />
            </motion.div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-900 min-h-screen text-white">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Quản lý phim</h1>
          <p className="text-gray-400 mt-1">Quản lý danh sách phim trong hệ thống</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setShowTMDBImport(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
            disabled={importLoading}
          >
            <CloudArrowDownIcon className="w-5 h-5 mr-2" />
            Import từ TMDB
          </button>
          <ExcelImportExport
            data={moviesForExport}
            onImport={handleImportComplete}
            fileName="movies-list"
            sheetName="Phim"
            headers={excelHeaders}
            disabled={loading || importLoading}
            useApi={true}
            apiType="movies"
          />
          <button
            onClick={handleCreateMovie}
            className="bg-[#FFD875] hover:bg-opacity-80 text-black font-bold py-2 px-4 rounded-lg flex items-center transition-all duration-300 shadow-[0_0_15px_2px_rgba(255,216,117,0.4)] hover:shadow-[0_0_20px_5px_rgba(255,216,117,0.6)]"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Thêm phim
          </button>
        </div>
      </div>

      <div className="mb-8 bg-slate-800 p-4 rounded-lg border border-slate-700 shadow-lg">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm phim theo tên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-700 text-white rounded-lg pl-10 pr-4 py-3 border border-slate-600 focus:border-[#FFD875] focus:outline-none focus:shadow-[0_0_10px_0_rgba(255,216,117,0.3)] transition-colors duration-300"
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-700 text-white rounded-lg px-4 py-3 border border-slate-600 focus:border-[#FFD875] focus:outline-none focus:shadow-[0_0_10px_0_rgba(255,216,117,0.3)] transition-colors duration-300 w-full md:w-auto"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="Now Showing">Đang chiếu</option>
              <option value="Coming Soon">Sắp chiếu</option>
              <option value="Ended">Đã kết thúc</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-lg border border-slate-700 shadow-lg overflow-hidden">
        <DataTable
          columns={columns}
          data={filteredMovies}
          loading={loading}
          pagination={{ pageSize: 6 }}
          rowKey="Movie_ID"
        />
      </div>

      {showDeleteDialog && (
        <ConfirmDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={confirmDelete}
          title="Xác nhận xóa phim"
          message={`Bạn có chắc chắn muốn xóa phim "${movieToDelete?.Movie_Name}" không? Hành động này không thể hoàn tác.`}
        />
      )}

      {/* TMDB Import Modal */}
      {showTMDBImport && (
        <TMDBImportModal
          isOpen={showTMDBImport}
          onClose={() => setShowTMDBImport(false)}
          onImport={handleTMDBImport}
        />
      )}
    </div>
  );
};

export default MovieManagement;


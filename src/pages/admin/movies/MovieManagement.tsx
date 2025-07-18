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
  EyeIcon,
} from '@heroicons/react/24/outline';
import { movieService } from '../../../services/movieService';
import DataTable from '../../../components/admin/common/DataTable';
import ConfirmDialog from '../../../components/admin/common/ConfirmDialog';
import ExcelImportExport from '../../../components/admin/common/ExcelImportExport';
import { formatDate } from '../../../utils/dashboardUtils';
import { toast } from 'react-hot-toast';
import '../styles/MovieManagement.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';

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
  const { user } = useAuth(); // Get current user information
  const isAdmin = user?.role === 'Admin'; // Check if user is Admin
  
  const [movies, setMovies] = useState<MovieAPI[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [movieToDelete, setMovieToDelete] = useState<MovieAPI | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMovies();
  }, []);

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

  const isPremiering = (movie: MovieAPI) => {
    const today = new Date();
    const premiereDate = new Date(movie.Premiere_Date || movie.Release_Date);
    return premiereDate <= today;
  }

  // Callback khi import thành công với ExportImportToolbar
  const handleImportComplete = () => {
    if (!isAdmin) {
      toast.error('Bạn không có quyền import dữ liệu.');
      return;
    }
    toast.success('Đang làm mới danh sách phim...');
    fetchMovies(); // Làm mới danh sách phim sau khi import
  };

  const handleCreateMovie = () => {
    if (!isAdmin) {
      toast.error('Bạn không có quyền thêm phim mới.');
      return;
    }
    navigate('/admin/movies/add');
  };

  const handleEditMovie = (movie: MovieAPI) => {
    if (!isAdmin) {
      toast.error('Bạn không có quyền chỉnh sửa phim.');
      return;
    }
    navigate(`/admin/movies/${movie.Movie_ID}/edit`);
  };

  const handleViewMovie = (movie: MovieAPI) => {
    navigate(`/admin/movies/${movie.Movie_ID}`);
  };

  const handleDeleteMovie = (movie: MovieAPI) => {
    if (!isAdmin) {
      toast.error('Bạn không có quyền xóa phim.');
      return;
    }
    setMovieToDelete(movie);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!isAdmin) {
      toast.error('Bạn không có quyền xóa phim.');
      return;
    }
    
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
      key: "Poster_URL",
      title: "Poster",
      render: (movie: MovieAPI) => (
        <div
          className="w-16 h-24 rounded overflow-hidden hover:scale-110 transition-transform duration-300 group cursor-pointer poster-glow"
          onClick={() => handleViewMovie(movie)}
        >
          <img
            src={movie.Poster_URL || "/placeholder.png"}
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
      key: "Movie_Name",
      title: "Tên phim",
      render: (movie: MovieAPI) => (
        <div>
          <p className="font-medium text-white">{movie.Movie_Name}</p>
          <p className="text-xs text-gray-400">{movie.Genre}</p>
        </div>
      ),
    },
    {
      key: "Duration",
      title: "Thời lượng",
      render: (movie: MovieAPI) => (
        <div className="flex items-center">
          <ClockIcon className="w-4 h-4 text-gray-400 mr-1" />
          <span>{movie.Duration} phút</span>
        </div>
      ),
    },
    {
      key: "Release_Date",
      title: "Ngày khởi chiếu",
      render: (movie: MovieAPI) => (
        <div className="flex items-center">
          <CalendarIcon className="w-4 h-4 text-gray-400 mr-1" />
          <span>{formatDate(movie.Release_Date)}</span>
        </div>
      ),
    },
    {
      key: "Premiere_Date",
      title: "Ngày công chiếu",
      render: (movie: MovieAPI) => (
        <div className="flex items-center">
          <CalendarIcon className="w-4 h-4 text-gray-400 mr-1" />
          <span>{movie.Premiere_Date ? formatDate(movie.Premiere_Date) : "Chưa xác định"}</span>
        </div>
      ),
    },
    {
      key: "End_Date",
      title: "Ngày kết thúc",
      render: (movie: MovieAPI) => (
        <div className="flex items-center">
          <CalendarIcon className="w-4 h-4 text-gray-400 mr-1" />
          <span>{movie.End_Date ? formatDate(movie.End_Date) : "Chưa xác định"}</span>
        </div>
      ),
    },
    {
      key: "Status",
      title: "Trạng thái",
      render: (movie: MovieAPI) => {
        const statusMap: { [key: string]: { text: string; className: string; icon: React.ReactNode } } = {
          "Now Showing": {
            text: "Đang chiếu",
            className: "bg-green-500/20 text-green-400 border border-green-500/30",
            icon: <FilmIcon className="w-3.5 h-3.5 mr-1" />,
          },
          "Coming Soon": {
            text: "Sắp chiếu",
            className: "bg-[#FFD875]/20 text-[#FFD875] border border-[#FFD875]/30",
            icon: <CalendarIcon className="w-3.5 h-3.5 mr-1" />,
          },
          Ended: {
            text: "Đã kết thúc",
            className: "bg-red-500/20 text-red-400 border border-red-500/30",
            icon: <FilmIcon className="w-3.5 h-3.5 mr-1" />,
          },
          Cancelled: {
            text: "Đã hủy",
            className: "bg-gray-500/20 text-gray-400 border border-gray-500/30",
            icon: <FilmIcon className="w-3.5 h-3.5 mr-1" />,
          },
          Inactive: {
            text: "Không hoạt động",
            className: "bg-gray-500/20 text-gray-400 border border-gray-500/30",
            icon: <FilmIcon className="w-3.5 h-3.5 mr-1" />,
          },
        };
        const statusInfo = statusMap[movie.Status] || {
          text: movie.Status,
          className: "bg-gray-500/20 text-gray-400 border border-gray-500/30",
          icon: <FilmIcon className="w-3.5 h-3.5 mr-1" />,
        };
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium flex items-center justify-center ${statusInfo.className}`}
          >
            {statusInfo.icon}
            {statusInfo.text}
          </span>
        );
      },
    },
    {
      key: "Rating",
      title: "Đánh giá",
      render: (movie: MovieAPI) => (
        <div className="flex items-center">
          <StarIcon className="w-4 h-4 text-[#FFD875] mr-1" />
          <span>{movie.Average_Rating || 0}</span>
          <span className="text-gray-500 text-xs ml-1">({movie.Rating_Count || 0})</span>
        </div>
      ),
    },
    {
      key: "actions",
      title: "Hành động",
      render: (movie: MovieAPI) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleViewMovie(movie)}
            className="p-2 text-gray-400 hover:text-[#FFD875] transition-colors duration-300 rounded-full hover:bg-slate-700 hover:shadow-[0_0_10px_0_rgba(255,216,117,0.4)]"
            title="Xem chi tiết"
          >
            <EyeIcon className="w-5 h-5" />
          </button>
          {!isPremiering(movie) && movie.Status !== "Inactive" && movie.Status !== "Ended" && isAdmin && (
            <>
              <button
                onClick={() => isAdmin && handleEditMovie(movie)}
                className={`p-2 transition-colors duration-300 rounded-full ${
                  isAdmin
                    ? "text-gray-400 hover:text-[#FFD875] hover:bg-slate-700 hover:shadow-[0_0_10px_0_rgba(255,216,117,0.4)] cursor-pointer"
                    : "text-gray-400/50 cursor-not-allowed"
                }`}
                title={!isAdmin ? "Chỉ Admin mới có thể chỉnh sửa phim" : "Chỉnh sửa"}
              >
                <PencilIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => isAdmin && handleDeleteMovie(movie)}
                className={`p-2 transition-colors duration-300 rounded-full ${
                  isAdmin
                    ? "text-gray-400 hover:text-red-500 hover:bg-slate-700 hover:shadow-[0_0_10px_0_rgba(239,68,68,0.4)] cursor-pointer"
                    : "text-gray-400/50 cursor-not-allowed"
                }`}
                title={!isAdmin ? "Chỉ Admin mới có thể xóa phim" : "Xóa"}
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 bg-slate-900 min-h-screen text-white">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Quản lý phim</h1>
          <p className="text-gray-400 mt-1">
            {isAdmin 
              ? "Quản lý danh sách phim trong hệ thống" 
              : "Xem danh sách phim trong hệ thống (Chế độ chỉ xem)"
            }
          </p>
          {!isAdmin && (
            <p className="text-amber-400 text-sm mt-1">
              💡 Bạn chỉ có thể xem chi tiết phim. Liên hệ Admin để thực hiện các thay đổi.
            </p>
          )}
        </div>
        <div className="flex gap-4">
          <div className={!isAdmin ? 'opacity-50 pointer-events-none' : ''}>
            <ExcelImportExport
              data={moviesForExport}
              onImport={handleImportComplete}
              fileName="movies-list"
              sheetName="Phim"
              headers={excelHeaders}
              disabled={loading || !isAdmin}
              useApi={true}
              apiType="movies"
            />
          </div>
          <button
            onClick={() => isAdmin && handleCreateMovie()}
            className={`font-bold py-2 px-4 rounded-lg flex items-center transition-all duration-300 ${
              isAdmin 
                ? 'bg-[#FFD875] hover:bg-opacity-80 text-black shadow-[0_0_15px_2px_rgba(255,216,117,0.4)] hover:shadow-[0_0_20px_5px_rgba(255,216,117,0.6)] cursor-pointer'
                : 'bg-[#FFD875]/50 text-black/50 cursor-not-allowed shadow-[0_0_15px_2px_rgba(255,216,117,0.2)]'
            }`}
            disabled={!isAdmin}
            title={!isAdmin ? "Chỉ Admin mới có thể thêm phim mới" : "Thêm phim mới"}
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
    </div>
  );
};

export default MovieManagement;


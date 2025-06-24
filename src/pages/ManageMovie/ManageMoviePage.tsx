import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Modal,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  FormHelperText,
  Snackbar,
  Alert,
  IconButton,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { vi } from 'date-fns/locale';
import api from '../../config/axios';
import { styled } from '@mui/material/styles';
import type { SxProps, Theme } from '@mui/material/styles';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiAlertCircle, FiRefreshCw, FiAlertTriangle, FiGrid, FiLayout, FiInfo, FiUpload } from 'react-icons/fi';

const StyledBox = styled(Box)(({ theme }) => ({
  padding: '24px',
  backgroundColor: '#f9fafb',
  minHeight: '100vh',
}));

const StyledHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '32px',
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
}));

const StyledTitle = styled(Typography)(({ theme }) => ({
  marginBottom: '8px',
  fontSize: '28px',
  fontWeight: 700,
  color: '#111827',
}));

const StyledSubtitle = styled(Typography)(({ theme }) => ({
  color: '#6b7280',
  fontSize: '16px',
}));

const StyledAddButton = styled(Button)(({ theme }) => ({
  marginTop: theme.breakpoints.down('md') ? '16px' : 0,
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 20px',
  backgroundColor: '#3b82f6',
  color: '#ffffff',
  fontWeight: 500,
  fontSize: '16px',
  border: 'none',
  borderRadius: '8px',
  transition: 'background-color 0.3s, box-shadow 0.3s',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  '&:hover': {
    backgroundColor: '#2563eb',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.15)',
  },
}));

const StyledFiltersContainer = styled(Box)(({ theme }) => ({
  backgroundColor: '#ffffff',
  borderRadius: '10px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
  padding: '16px',
  marginBottom: '24px',
  border: '1px solid #e5e7eb',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '16px',
  flexWrap: 'wrap',
}));

const StyledSearchContainer = styled(Box)(({ theme }) => ({
  flex: '1',
  minWidth: '250px',
  maxWidth: '350px',
  position: 'relative',
}));

const StyledSearchInput = styled(TextField)(({ theme }) => ({
  width: '100%',
  '& .MuiOutlinedInput-root': {
    padding: '10px 40px',
    backgroundColor: '#f9fafb',
    transition: 'border-color 0.3s, box-shadow 0.3s',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    '&:hover': {
      borderColor: '#3b82f6',
    },
    '&.Mui-focused': {
      borderColor: '#3b82f6',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
      backgroundColor: '#ffffff',
    },
  },
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  overflow: 'hidden',
}));

const StyledTableHeader = styled(TableHead)(({ theme }) => ({
  backgroundColor: '#f3f4f6',
}));

const StyledHeaderCell = styled(TableCell)(({ theme }) => ({
  padding: '12px 24px',
  textAlign: 'left',
  fontSize: '12px',
  fontWeight: 500,
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  borderBottom: '1px solid #e5e7eb',
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:hover': {
    backgroundColor: '#f9fafb',
  },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: '16px 24px',
  borderBottom: '1px solid #e5e7eb',
  fontSize: '14px',
}));

const StyledStatusLabel = styled('span')<{ status: 'active' | 'inactive' }>(({ theme, status }) => ({
  padding: '4px 8px',
  fontSize: '12px',
  fontWeight: 500,
  borderRadius: '9999px',
  ...(status === 'active' ? {
    backgroundColor: '#dcfce7',
    color: '#15803d',
  } : {
    backgroundColor: '#f3f4f6',
    color: '#4b5563',
  }),
}));

const StyledActionButton = styled(IconButton)(({ theme }) => ({
  padding: '4px',
  '&.edit': {
    color: '#2563eb',
    '&:hover': {
      color: '#1d4ed8',
    },
  },
  '&.delete': {
    color: '#ef4444',
    '&:hover': {
      color: '#dc2626',
    },
  },
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    '&.Mui-focused fieldset': {
      borderColor: '#3b82f6',
    },
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#3b82f6',
  },
}));

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  backgroundColor: '#e3f2fd',
  '&.Mui-selected': {
    backgroundColor: '#bbdefb',
  },
  '&:hover': {
    backgroundColor: '#90caf9',
  },
}));

// Constants for filters
const YEARS = Array.from(
  { length: new Date().getFullYear() - 1990 + 1 },
  (_, i) => new Date().getFullYear() - i
);

const GENRES = [
  'Tất cả',
  'Hành động',
  'Phiêu lưu',
  'Hoạt hình',
  'Hài hước',
  'Tội phạm',
  'Tài liệu',
  'Chính kịch',
  'Gia đình',
  'Giả tưởng',
  'Lịch sử',
  'Kinh dị',
  'Nhạc',
  'Bí ẩn',
  'Lãng mạn',
  'Khoa học viễn tưởng',
  'Thriller',
  'Chiến tranh',
  'Cao bồi'
];

const STATUSES = ['Tất cả', 'Coming Soon', 'Now Showing'];

const LANGUAGES = [
  'Tiếng Việt',
  'Tiếng Anh',
  'Tiếng Trung',
  'Tiếng Hàn',
  'Tiếng Nhật',
  'Tiếng Pháp',
  'Tiếng Đức',
  'Tiếng Tây Ban Nha',
  'Tiếng Ý',
  'Khác'
];

const COUNTRIES = [
  'Việt Nam',
  'Mỹ',
  'Anh',
  'Pháp',
  'Đức',
  'Trung Quốc',
  'Hàn Quốc',
  'Nhật Bản',
  'Thái Lan',
  'Singapore',
  'Khác'
];

interface Movie {
  Movie_ID: number;
  Movie_Name: string;
  Release_Date: string;
  End_Date: string;
  Premiere_Date: string;
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
  Production_Company: string;
}

interface FilterState {
  movieName: string;
  releaseYear: string;
  genre: string;
  status: string;
}

interface NewMovie {
  Movie_Name: string;
  Release_Date: string;
  End_Date: string;
  Premiere_Date: string;
  Director: string;
  Cast: string;
  Duration: number;
  Genre: string[];
  Rating: string;
  Language: string;
  Country: string;
  Synopsis: string;
  Poster_URL: string;
  Trailer_Link: string;
  Status: string;
  Production_Company: string;
  posterFile?: File;
}

const RATINGS = ['G', 'PG', 'PG-13', 'R', 'NC-17'];

// Add placeholder image as base64
const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDIwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNFRUVFRUUiLz48cGF0aCBkPSJNOTAgMTM1SDExMFYxNjVIOTBWMTM1Wk0xMDAgOTBDMTA0LjE4IDkwIDEwNy44MyA5MS41OCA5OS45MyA5NC43NUM5Mi4wMyA5Ny45MiA5MCAxMDEuNTcgOTAgMTA1Ljc1QzkwIDEwOS45MyA5Mi4wMyAxMTMuNTggOTkuOTMgMTE2Ljc1QzEwNy44MyAxMTkuOTIgMTExLjQ4IDEyMS41IDExNS42NiAxMjEuNUMxMTkuODQgMTIxLjUgMTIzLjQ5IDExOS45MiAxMjYuNjYgMTE2Ljc1QzEyOS44MyAxMTMuNTggMTMxLjQxIDEwOS45MyAxMzEuNDEgMTA1Ljc1QzEzMS40MSAxMDEuNTcgMTI5LjgzIDk3LjkyIDEyNi42NiA5NEgxMDBaIiBmaWxsPSIjOTk5OTk5Ii8+PC9zdmc+';

// Add styled components
const StyledGrid = styled(Grid)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
}));

const initialMovieState = {
  Movie_Name: '',
  Release_Date: '',
  End_Date: '',
  Premiere_Date: '',
  Director: '',
  Cast: '',
  Duration: 0,
  Genre: [],
  Rating: '',
  Language: '',
  Country: '',
  Synopsis: '',
  Poster_URL: '',
  Trailer_Link: '',
  Status: 'Coming Soon',
  Production_Company: '',
};

const formFieldStyles = {
  '& .MuiOutlinedInput-root': {
    '&.Mui-focused fieldset': {
      borderColor: '#3b82f6',
    },
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#3b82f6',
  },
  '& .MuiFormHelperText-root': {
    color: '#ef4444',
    '&.Mui-error': {
      color: '#ef4444',
    },
  },
};

const validateMovieName = (name: string): boolean => {
  // Check if name starts with a number
  if (/^\d/.test(name)) {
    return false;
  }
  return true;
};

const validateDates = (releaseDate: string, premiereDate: string, endDate: string): boolean => {
  if (!releaseDate || !premiereDate || !endDate) return false;
  
  const release = new Date(releaseDate);
  const premiere = new Date(premiereDate);
  const end = new Date(endDate);

  // Kiểm tra thứ tự: Release -> Premiere -> End
  if (premiere < release) {
    return false;
  }
  if (end <= premiere) {
    return false;
  }
  return true;
};

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const YOUTUBE_VIDEO_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]{11}($|&|\?)/;

const ManageMoviePage: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    movieName: '',
    releaseYear: '',
    genre: 'Tất cả',
    status: 'Tất cả',
  });
  const [openAddModal, setOpenAddModal] = useState(false);
  const [newMovie, setNewMovie] = useState<NewMovie>(initialMovieState);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [previewUrl, setPreviewUrl] = useState('');
  const [showErrors, setShowErrors] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editMovieId, setEditMovieId] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [movieToDelete, setMovieToDelete] = useState<Movie | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [movieNameError, setMovieNameError] = useState<string>('');
  const [originalStatus, setOriginalStatus] = useState<string>('');
  const [durationError, setDurationError] = useState<string>('');
  const [synopsisError, setSynopsisError] = useState<string>('');
  const [trailerError, setTrailerError] = useState<string>('');

  const steps = ['Thông tin cơ bản', 'Thông tin chi tiết', 'Hình ảnh & Trailer'];

  const fetchMovies = async () => {
    try {
      setLoading(true);
      console.log('Fetching movies with filters:', filters);
      const response = await api.get('/movies', {
        params: {
          name: filters.movieName || undefined,
          year: filters.releaseYear !== '' ? filters.releaseYear : undefined,
          genre: filters.genre !== 'Tất cả' ? filters.genre : undefined,
          status: filters.status !== 'Tất cả' ? filters.status : undefined,
        },
      });
      
      console.log('API Response:', response.data);
      
      if (Array.isArray(response.data)) {
        setMovies(response.data);
      } else {
        console.error('Unexpected response format:', response.data);
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [filters]);

  const handleFilterChange = (field: keyof FilterState) => (
    event: React.ChangeEvent<{ value: unknown }> | any
  ) => {
    setFilters(prev => ({
      ...prev,
      [field]: event.target.value as string
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'coming soon':
        return {
          bg: '#fff3e0',
          color: '#e65100'
        };
      case 'now showing':
        return {
          bg: '#e8f5e9',
          color: '#1b5e20'
        };
      default:
        return {
          bg: '#f5f5f5',
          color: '#424242'
        };
    }
  };

  const resetForm = () => {
    setNewMovie(initialMovieState);
    setSelectedFile(null);
    setPreviewUrl('');
    setShowErrors(false);
    setActiveStep(0);
    setIsEditMode(false);
    setEditMovieId(null);
    setOriginalStatus('');
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const showError = (message: string) => {
    setSnackbar({
      open: true,
      message,
      severity: 'error'
    });
  };

  const showSuccess = (message: string) => {
    setSnackbar({
      open: true,
      message,
      severity: 'success'
    });
  };

  const validateForm = () => {
    // Validate tên phim
    if (!newMovie.Movie_Name.trim()) {
      showError('Vui lòng nhập tên phim');
      return false;
    }
    if (!validateMovieName(newMovie.Movie_Name)) {
      showError('Tên phim không được bắt đầu bằng số');
      return false;
    }
    if (newMovie.Movie_Name.length < 2) {
      showError('Tên phim phải có ít nhất 2 ký tự');
      return false;
    }

    // Validate ngày tháng
    if (!newMovie.Release_Date) {
      showError('Vui lòng chọn ngày phát hành');
      return false;
    }
    if (!newMovie.Premiere_Date) {
      showError('Vui lòng chọn ngày công chiếu');
      return false;
    }
    if (!newMovie.End_Date) {
      showError('Vui lòng chọn ngày kết thúc');
      return false;
    }
    if (!validateDates(newMovie.Release_Date, newMovie.Premiere_Date, newMovie.End_Date)) {
      showError('Thứ tự ngày không hợp lệ: Ngày phát hành -> Ngày công chiếu -> Ngày kết thúc');
      return false;
    }

    // Validate đạo diễn
    if (!newMovie.Director.trim()) {
      showError('Vui lòng nhập tên đạo diễn');
      return false;
    }
    if (newMovie.Director.length < 2) {
      showError('Tên đạo diễn phải có ít nhất 2 ký tự');
      return false;
    }

    // Validate diễn viên
    if (!newMovie.Cast.trim()) {
      showError('Vui lòng nhập tên diễn viên');
      return false;
    }

    // Validate thời lượng
    if (!newMovie.Duration || newMovie.Duration <= 0) {
      showError('Vui lòng nhập thời lượng phim hợp lệ (lớn hơn 0)');
      return false;
    }
    if (newMovie.Duration > 300) {
      showError('Thời lượng phim không được vượt quá 300 phút');
      return false;
    }

    // Validate thể loại
    if (newMovie.Genre.length === 0) {
      showError('Vui lòng chọn ít nhất một thể loại');
      return false;
    }

    // Validate xếp hạng
    if (!newMovie.Rating) {
      showError('Vui lòng chọn xếp hạng độ tuổi');
      return false;
    }

    // Validate ngôn ngữ
    if (!newMovie.Language) {
      showError('Vui lòng chọn ngôn ngữ');
      return false;
    }

    // Validate quốc gia
    if (!newMovie.Country) {
      showError('Vui lòng chọn quốc gia');
      return false;
    }

    // Validate tóm tắt
    if (!newMovie.Synopsis.trim()) {
      showError('Vui lòng nhập tóm tắt nội dung');
      return false;
    }
    if (newMovie.Synopsis.length < 50) {
      showError('Tóm tắt nội dung phải có ít nhất 50 ký tự');
      return false;
    }

    // Validate poster
    if (!newMovie.Poster_URL && !selectedFile) {
      showError('Vui lòng tải lên poster hoặc nhập URL poster');
      return false;
    }

    // Validate trailer
    if (!newMovie.Trailer_Link.trim()) {
      showError('Vui lòng nhập link trailer');
      return false;
    }
    if (!YOUTUBE_VIDEO_REGEX.test(newMovie.Trailer_Link)) {
      showError('Link trailer phải là link video YouTube hợp lệ (có id video)');
      return false;
    }

    // Validate công ty sản xuất
    if (!newMovie.Production_Company.trim()) {
      showError('Vui lòng nhập tên công ty sản xuất');
      return false;
    }

    // Validate trạng thái
    if (!newMovie.Status) {
      showError('Vui lòng chọn trạng thái phim');
      return false;
    }

    return true;
  };

  const handleAddMovie = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      const formData = new FormData();
      
      Object.entries(newMovie).forEach(([key, value]) => {
        if (key !== 'posterFile') {
          if (Array.isArray(value)) {
            formData.append(key, value.join(','));
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      if (selectedFile) {
        formData.append('posterFile', selectedFile);
      }

      if (isEditMode && editMovieId) {
        await handleEditMovie();
      } else {
        const response = await api.post('/movies', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        console.log('Movie added successfully:', response.data);
        showSuccess('Thêm phim mới thành công!');
        
        resetForm();
        setOpenAddModal(false);
        fetchMovies();
      }
      
    } catch (error: any) {
      console.error('Error adding/updating movie:', error);
      if (error.response?.data?.message) {
        showError(error.response.data.message);
      } else {
        showError('Có lỗi xảy ra. Vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditMovie = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      const formData = new FormData();
      
      Object.entries(newMovie).forEach(([key, value]) => {
        if (key !== 'posterFile') {
          if (Array.isArray(value)) {
            formData.append(key, value.join(','));
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      if (selectedFile) {
        formData.append('posterFile', selectedFile);
      }

      const response = await api.put(`/movies/${editMovieId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Movie updated successfully:', response.data);
      showSuccess('Cập nhật phim thành công!');
      
      resetForm();
      setOpenAddModal(false);
      setIsEditMode(false);
      setEditMovieId(null);
      fetchMovies();
      
    } catch (error: any) {
      console.error('Error updating movie:', error);
      if (error.response?.data?.message) {
        showError(error.response.data.message);
      } else {
        showError('Có lỗi xảy ra khi cập nhật phim. Vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditModal = (movie: Movie) => {
    setIsEditMode(true);
    setEditMovieId(movie.Movie_ID);
    setOriginalStatus(movie.Status);
    
    const movieToEdit: NewMovie = {
      Movie_Name: movie.Movie_Name,
      Release_Date: movie.Release_Date,
      End_Date: movie.End_Date,
      Premiere_Date: movie.Premiere_Date,
      Director: movie.Director,
      Cast: movie.Cast || '',
      Duration: movie.Duration || 0,
      Genre: typeof movie.Genre === 'string' ? [movie.Genre] : movie.Genre,
      Rating: movie.Rating,
      Language: movie.Language || '',
      Country: movie.Country || '',
      Synopsis: movie.Synopsis || '',
      Poster_URL: movie.Poster_URL || '',
      Trailer_Link: movie.Trailer_Link || '',
      Status: movie.Status,
      Production_Company: movie.Production_Company || '',
    };

    setNewMovie(movieToEdit);
    if (movie.Poster_URL) {
      setPreviewUrl(movie.Poster_URL);
    }
    setOpenAddModal(true);
    setActiveStep(0);
    setShowErrors(false);
  };

  const handleNext = () => {
    if (isStepValid(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
      setShowErrors(false);
    } else {
      setShowErrors(true);
      // Hiển thị thông báo lỗi tương ứng với bước hiện tại
      switch (activeStep) {
        case 0:
          if (!newMovie.Movie_Name) showError('Vui lòng nhập tên phim');
          else if (!newMovie.Premiere_Date) showError('Vui lòng chọn ngày công chiếu');
          else if (!newMovie.Release_Date) showError('Vui lòng chọn ngày phát hành');
          else if (!newMovie.End_Date) showError('Vui lòng chọn ngày kết thúc');
          else if (!newMovie.Director) showError('Vui lòng nhập tên đạo diễn');
          break;
        case 1:
          if (!newMovie.Duration || newMovie.Duration <= 0) showError('Vui lòng nhập thời lượng hợp lệ');
          else if (newMovie.Genre.length === 0) showError('Vui lòng chọn ít nhất một thể loại');
          else if (!newMovie.Rating) showError('Vui lòng chọn xếp hạng');
          else if (!newMovie.Status) showError('Vui lòng chọn trạng thái phim');
          break;
        case 2:
          if (!newMovie.Trailer_Link) showError('Vui lòng nhập link trailer');
          break;
      }
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setShowErrors(false); // Reset error display when going back
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleInputChange = (field: keyof NewMovie) => (
    event: React.ChangeEvent<HTMLInputElement | { value: unknown }>
  ) => {
    const value = event.target.value as string;
    if (field === 'Movie_Name') {
      if (!validateMovieName(value)) {
        setMovieNameError('Tên phim không được bắt đầu bằng số');
      } else {
        setMovieNameError('');
      }
    }
    if (field === 'Duration') {
      const num = Number(value);
      if (!num) {
        setDurationError('Vui lòng nhập thời lượng phim');
      } else if (num <= 60) {
        setDurationError('Thời lượng phim phải lớn hơn 60 phút');
      } else {
        setDurationError('');
      }
    }
    if (field === 'Synopsis') {
      if (!value.trim()) {
        setSynopsisError('Vui lòng nhập tóm tắt nội dung');
      } else if (value.length < 50) {
        setSynopsisError('Tóm tắt nội dung phải có ít nhất 50 ký tự');
      } else {
        setSynopsisError('');
      }
    }
    if (field === 'Trailer_Link') {
      if (!value.trim()) {
        setTrailerError('Vui lòng nhập link trailer');
      } else if (!YOUTUBE_VIDEO_REGEX.test(value)) {
        setTrailerError('Link trailer phải là link video YouTube hợp lệ (có id video)');
      } else {
        setTrailerError('');
      }
    }
    setNewMovie(prev => ({
      ...prev,
      [field]: field === 'Duration' ? Number(value) : value
    }));
  };

  const handleGenreChange = (
    event: React.ChangeEvent<{ value: unknown }> | any,
    child: React.ReactNode
  ) => {
    setNewMovie(prev => ({
      ...prev,
      Genre: event.target.value as string[]
    }));
  };

  const handleSelectChange = (field: keyof NewMovie) => (
    event: React.ChangeEvent<{ value: unknown }> | any,
    child: React.ReactNode
  ) => {
    const value = event.target.value as string;
    
    // Kiểm tra nếu đang edit và cố gắng thay đổi status
    if (field === 'Status' && isEditMode && originalStatus === 'Now Showing' && value === 'Coming Soon') {
      showError('Không thể chuyển trạng thái từ "Now Showing" sang "Coming Soon"');
      return;
    }

    setNewMovie(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 0:
        return Boolean(
          newMovie.Movie_Name.trim() &&
          validateMovieName(newMovie.Movie_Name) &&
          newMovie.Movie_Name.length >= 2 &&
          newMovie.Release_Date &&
          newMovie.Premiere_Date &&
          newMovie.End_Date &&
          validateDates(newMovie.Release_Date, newMovie.Premiere_Date, newMovie.End_Date) &&
          newMovie.Director.trim() &&
          newMovie.Director.length >= 2
        );
      case 1:
        return Boolean(
          newMovie.Duration > 60 &&
          newMovie.Genre.length > 0 &&
          newMovie.Rating &&
          newMovie.Language &&
          newMovie.Country &&
          newMovie.Synopsis.trim() &&
          newMovie.Synopsis.length >= 50 &&
          !durationError &&
          !synopsisError
        );
      case 2:
        return Boolean(
          ((selectedFile && previewUrl) || (newMovie.Poster_URL && newMovie.Poster_URL.trim() !== '')) &&
          newMovie.Trailer_Link.trim() &&
          newMovie.Production_Company.trim() &&
          newMovie.Status &&
          !trailerError
        );
      default:
        return false;
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <TextField
              label="Tên phim"
              value={newMovie.Movie_Name}
              onChange={handleInputChange('Movie_Name')}
              fullWidth
              required
              error={showErrors && (!newMovie.Movie_Name || !!movieNameError)}
              helperText={showErrors ? (!newMovie.Movie_Name ? "Tên phim là bắt buộc" : movieNameError) : movieNameError}
              sx={formFieldStyles}
            />
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
              <Box sx={{ display: 'flex', gap: '20px' }}>
                <DatePicker
                  label="Ngày phát hành"
                  value={newMovie.Release_Date ? new Date(newMovie.Release_Date) : null}
                  onChange={(date) => {
                    if (date) {
                      setNewMovie(prev => ({
                        ...prev,
                        Release_Date: formatDate(date)
                      }));
                    }
                  }}
                  sx={{ flex: 1, ...formFieldStyles }}
                  slotProps={{
                    textField: {
                      required: true,
                      error: showErrors && !newMovie.Release_Date,
                      helperText: showErrors && !newMovie.Release_Date ? "Ngày phát hành là bắt buộc" : ""
                    }
                  }}
                />
                <DatePicker
                  label="Ngày công chiếu"
                  value={newMovie.Premiere_Date ? new Date(newMovie.Premiere_Date) : null}
                  onChange={(date) => {
                    if (date) {
                      setNewMovie(prev => ({
                        ...prev,
                        Premiere_Date: formatDate(date)
                      }));
                    }
                  }}
                  sx={{ flex: 1, ...formFieldStyles }}
                  slotProps={{
                    textField: {
                      required: true,
                      error: showErrors && (!newMovie.Premiere_Date || (newMovie.Release_Date && new Date(newMovie.Premiere_Date) < new Date(newMovie.Release_Date))),
                      helperText: showErrors ? 
                        !newMovie.Premiere_Date ? "Ngày công chiếu là bắt buộc" : 
                        (newMovie.Release_Date && new Date(newMovie.Premiere_Date) < new Date(newMovie.Release_Date)) ? "Ngày công chiếu phải sau ngày phát hành" : 
                        "" : ""
                    }
                  }}
                  minDate={newMovie.Release_Date ? new Date(newMovie.Release_Date) : undefined}
                />
                <DatePicker
                  label="Ngày kết thúc"
                  value={newMovie.End_Date ? new Date(newMovie.End_Date) : null}
                  onChange={(date) => {
                    if (date) {
                      setNewMovie(prev => ({
                        ...prev,
                        End_Date: formatDate(date)
                      }));
                    }
                  }}
                  sx={{ flex: 1, ...formFieldStyles }}
                  slotProps={{
                    textField: {
                      required: true,
                      error: showErrors && (!newMovie.End_Date || (newMovie.Premiere_Date && new Date(newMovie.End_Date) <= new Date(newMovie.Premiere_Date))),
                      helperText: showErrors ? 
                        !newMovie.End_Date ? "Ngày kết thúc là bắt buộc" : 
                        (newMovie.Premiere_Date && new Date(newMovie.End_Date) <= new Date(newMovie.Premiere_Date)) ? "Ngày kết thúc phải sau ngày công chiếu" : 
                        "" : ""
                    }
                  }}
                  minDate={newMovie.Premiere_Date ? new Date(newMovie.Premiere_Date) : undefined}
                />
              </Box>
            </LocalizationProvider>
            <TextField
              label="Đạo diễn"
              value={newMovie.Director}
              onChange={handleInputChange('Director')}
              fullWidth
              required
              error={showErrors && !newMovie.Director}
              helperText={showErrors && !newMovie.Director ? "Đạo diễn là bắt buộc" : ""}
              sx={formFieldStyles}
            />
            <TextField
              label={<span>Diễn viên <span style={{color: 'red'}}>*</span></span>}
              value={newMovie.Cast}
              onChange={handleInputChange('Cast')}
              fullWidth
              sx={formFieldStyles}
            />
            <TextField
              label={<span>Công ty sản xuất <span style={{color: 'red'}}>*</span></span>}
              value={newMovie.Production_Company}
              onChange={handleInputChange('Production_Company')}
              fullWidth
              sx={formFieldStyles}
            />
          </Box>
        );
      case 1:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <TextField
              label="Thời lượng (phút)"
              type="number"
              value={newMovie.Duration}
              onChange={handleInputChange('Duration')}
              fullWidth
              required
              error={!!durationError}
              helperText={durationError}
              sx={formFieldStyles}
            />
            <FormControl 
              fullWidth 
              required 
              error={showErrors && newMovie.Genre.length === 0}
              sx={formFieldStyles}
            >
              <InputLabel>Thể loại</InputLabel>
              <Select
                multiple
                value={newMovie.Genre}
                label="Thể loại"
                onChange={handleGenreChange}
                required
                renderValue={(selected) => (selected as string[]).join(', ')}
              >
                {GENRES.filter(genre => genre !== 'Tất cả').map(genre => (
                  <MenuItem key={genre} value={genre}>{genre}</MenuItem>
                ))}
              </Select>
              {showErrors && newMovie.Genre.length === 0 && (
                <FormHelperText>Vui lòng chọn ít nhất một thể loại</FormHelperText>
              )}
            </FormControl>
            <FormControl fullWidth required error={showErrors && !newMovie.Rating} sx={formFieldStyles}>
              <InputLabel>Xếp hạng độ tuổi</InputLabel>
              <Select
                value={newMovie.Rating}
                label="Xếp hạng độ tuổi"
                onChange={handleSelectChange('Rating')}
              >
                {RATINGS.map(rating => (
                  <MenuItem key={rating} value={rating}>{rating}</MenuItem>
                ))}
              </Select>
              {showErrors && !newMovie.Rating && (
                <FormHelperText>Vui lòng chọn xếp hạng độ tuổi</FormHelperText>
              )}
            </FormControl>
            <FormControl fullWidth required sx={formFieldStyles}>
              <InputLabel required>Ngôn ngữ</InputLabel>
              <Select
                value={newMovie.Language}
                label="Ngôn ngữ"
                onChange={handleSelectChange('Language')}
              >
                {LANGUAGES.map(language => (
                  <MenuItem key={language} value={language}>{language}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth required sx={formFieldStyles}>
              <InputLabel required>Quốc gia</InputLabel>
              <Select
                value={newMovie.Country}
                label="Quốc gia"
                onChange={handleSelectChange('Country')}
              >
                {COUNTRIES.map(country => (
                  <MenuItem key={country} value={country}>{country}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Tóm tắt nội dung"
              required
              value={newMovie.Synopsis}
              onChange={handleInputChange('Synopsis')}
              multiline
              rows={4}
              fullWidth
              error={!!synopsisError}
              helperText={synopsisError}
              sx={formFieldStyles}
            />
          </Box>
        );
      case 2:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <Box
              sx={{
                width: '100%',
                height: '300px',
                backgroundColor: '#f5f5f5',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: '8px',
                border: '2px dashed #9e9e9e',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                backgroundImage: previewUrl ? `url(${previewUrl})` : 'none',
                '&:hover': {
                  borderColor: '#2196f3',
                  backgroundColor: '#f0f7ff'
                }
              }}
              onClick={() => document.getElementById('poster-upload')?.click()}
            >
              {!previewUrl && (
                <>
                  <input
                    type="file"
                    id="poster-upload"
                    hidden
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <FiUpload style={{ fontSize: '48px', color: '#9e9e9e', marginBottom: '16px' }} />
                  <Typography color="textSecondary" variant="h6" sx={{ mb: 1 }}>
                    Nhấp để tải ảnh lên
                  </Typography>
                  <Typography color="textSecondary" variant="body2">
                    Hỗ trợ: JPG, JPEG, PNG, GIF, WEBP
                  </Typography>
                </>
              )}
            </Box>
            {previewUrl && (
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => {
                    setPreviewUrl('');
                    setSelectedFile(null);
                    setNewMovie(prev => ({ ...prev, Poster_URL: '' }));
                  }}
                  startIcon={<FiTrash2 />}
                >
                  Xóa ảnh
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => document.getElementById('poster-upload')?.click()}
                  startIcon={<FiRefreshCw />}
                >
                  Thay đổi ảnh
                </Button>
              </Box>
            )}
            <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 2 }}>
              Hoặc nhập URL ảnh trực tiếp:
            </Typography>
            <TextField
              label="URL Poster"
              value={newMovie.Poster_URL}
              onChange={(e) => {
                const url = e.target.value;
                setNewMovie(prev => ({ ...prev, Poster_URL: url }));
                setPreviewUrl(url);
              }}
              fullWidth
              placeholder="https://example.com/movie-poster.jpg"
              sx={formFieldStyles}
            />
            <TextField
              label="URL Trailer"
              value={newMovie.Trailer_Link}
              onChange={handleInputChange('Trailer_Link')}
              fullWidth
              required
              error={!!trailerError}
              helperText={trailerError}
              placeholder="https://youtube.com/watch?v=..."
              sx={formFieldStyles}
            />
            <FormControl fullWidth required error={showErrors && !newMovie.Status} sx={formFieldStyles}>
              <InputLabel>Trạng thái phim</InputLabel>
              <Select
                value={newMovie.Status}
                label="Trạng thái phim"
                onChange={handleSelectChange('Status')}
                disabled={isEditMode && originalStatus === 'Now Showing'}
              >
                {STATUSES.filter(status => {
                  // Nếu đang edit và status ban đầu là Now Showing, chỉ cho phép chọn Now Showing
                  if (isEditMode && originalStatus === 'Now Showing') {
                    return status === 'Now Showing';
                  }
                  return status !== 'Tất cả';
                }).map(status => (
                  <MenuItem key={status} value={status}>{status}</MenuItem>
                ))}
              </Select>
              {showErrors && !newMovie.Status && (
                <FormHelperText>Vui lòng chọn trạng thái phim</FormHelperText>
              )}
            </FormControl>
          </Box>
        );
      default:
        return null;
    }
  };

  const handleOpenDeleteDialog = (movie: Movie) => {
    setMovieToDelete(movie);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setMovieToDelete(null);
    setOpenDeleteDialog(false);
  };

  const handleDeleteMovie = async () => {
    if (!movieToDelete) return;

    try {
      setLoading(true);
      await api.delete(`/movies/${movieToDelete.Movie_ID}`);
      showSuccess('Xóa phim thành công!');
      handleCloseDeleteDialog();
      fetchMovies();
    } catch (error: any) {
      console.error('Error deleting movie:', error);
      if (error.response?.data?.message) {
        showError(error.response.data.message);
      } else {
        showError('Có lỗi xảy ra khi xóa phim. Vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="main"
      sx={{
        padding: '24px',
        backgroundColor: '#f9fafb',
        minHeight: '100vh',
      }}
    >
      <Box
        component="header"
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          marginBottom: '32px',
        }}
      >
        <Box>
          <Typography
            variant="h1"
            sx={{
              marginBottom: '8px',
              fontSize: '28px',
              fontWeight: 700,
              color: '#111827',
            }}
          >
            Quản Lý Phim
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              color: '#6b7280',
              fontSize: '16px',
            }}
          >
            Quản lý danh sách phim và thông tin chi tiết
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={() => {
            resetForm();
            setOpenAddModal(true);
          }}
          startIcon={<FiPlus />}
          sx={{
            marginTop: { xs: '16px', md: 0 },
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            backgroundColor: '#3b82f6',
            color: '#ffffff',
            fontWeight: 500,
            fontSize: '16px',
            borderRadius: '8px',
            transition: 'background-color 0.3s, box-shadow 0.3s',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            '&:hover': {
              backgroundColor: '#2563eb',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.15)',
            },
          }}
        >
          Thêm Phim Mới
        </Button>
      </Box>

      <Box
        component="section"
        sx={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          padding: '16px',
          marginBottom: '24px',
          border: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <Box
          sx={{
            flex: '1',
            minWidth: '250px',
            maxWidth: '350px',
            position: 'relative',
          }}
        >
          <TextField
            fullWidth
            placeholder="Tìm kiếm phim..."
            value={filters.movieName}
            onChange={handleFilterChange('movieName')}
            InputProps={{
              startAdornment: <FiSearch style={{ color: '#9ca3af', marginRight: '8px' }} />,
              endAdornment: filters.movieName && (
                <IconButton
                  size="small"
                  onClick={() => setFilters(prev => ({ ...prev, movieName: '' }))}
                  sx={{ color: '#9ca3af' }}
                >
                  <FiX />
                </IconButton>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#f9fafb',
                transition: 'border-color 0.3s, box-shadow 0.3s',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                '&:hover': {
                  borderColor: '#3b82f6',
                },
                '&.Mui-focused': {
                  borderColor: '#3b82f6',
                  boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                  backgroundColor: '#ffffff',
                },
              },
            }}
          />
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <IconButton
            onClick={() => setViewMode('grid')}
            sx={{
              padding: '8px',
              backgroundColor: viewMode === 'grid' ? '#dbeafe' : '#f3f4f6',
              color: viewMode === 'grid' ? '#2563eb' : '#4b5563',
              '&:hover': {
                backgroundColor: viewMode === 'grid' ? '#dbeafe' : '#e5e7eb',
              },
            }}
          >
            <FiGrid />
          </IconButton>
          <IconButton
            onClick={() => setViewMode('table')}
            sx={{
              padding: '8px',
              backgroundColor: viewMode === 'table' ? '#dbeafe' : '#f3f4f6',
              color: viewMode === 'table' ? '#2563eb' : '#4b5563',
              '&:hover': {
                backgroundColor: viewMode === 'table' ? '#dbeafe' : '#e5e7eb',
              },
            }}
          >
            <FiLayout />
          </IconButton>
        </Box>

        <FormControl
          sx={{
            minWidth: '160px',
            maxWidth: '200px',
          }}
        >
          <InputLabel>Trạng thái</InputLabel>
          <Select
            value={filters.status}
            onChange={handleFilterChange('status')}
            label="Trạng thái"
          >
            <MenuItem value="Tất cả">Tất Cả Trạng Thái</MenuItem>
            <MenuItem value="Coming Soon">Coming Soon</MenuItem>
            <MenuItem value="Now Showing">Now Showing</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Box
          sx={{
            textAlign: 'center',
            padding: '48px 0',
          }}
        >
          <CircularProgress sx={{ color: '#3b82f6' }} />
          <Typography
            sx={{
              color: '#6b7280',
              marginTop: '16px',
            }}
          >
            Đang tải dữ liệu...
          </Typography>
        </Box>
      ) : movies.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            padding: '48px 0',
          }}
        >
          <FiAlertCircle
            style={{
              width: '48px',
              height: '48px',
              color: '#9ca3af',
              margin: '0 auto 16px',
            }}
          />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 500,
              color: '#1f2937',
              marginBottom: '4px',
            }}
          >
            Không tìm thấy phim nào
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: '#6b7280',
            }}
          >
            Thử thay đổi bộ lọc hoặc thêm phim mới
          </Typography>
        </Box>
      ) : (
        <TableContainer
          component={Paper}
          sx={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    padding: '12px 24px',
                    backgroundColor: '#f3f4f6',
                    fontSize: '12px',
                    fontWeight: 500,
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderBottom: '1px solid #e5e7eb',
                    width: '50%',
                  }}
                >
                  Tên phim
                </TableCell>
                <TableCell
                  sx={{
                    padding: '12px 24px',
                    backgroundColor: '#f3f4f6',
                    fontSize: '12px',
                    fontWeight: 500,
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderBottom: '1px solid #e5e7eb',
                    width: '30%',
                  }}
                >
                  Trạng thái
                </TableCell>
                <TableCell
                  sx={{
                    padding: '12px 10px',
                    paddingLeft: '140px',
                    backgroundColor: '#f3f4f6',
                    fontSize: '12px',
                    fontWeight: 500,
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderBottom: '1px solid #e5e7eb',
                    width: '20%',
                  }}
                >
                  Thao tác
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {movies.map((movie) => (
                <TableRow
                  key={movie.Movie_ID}
                  sx={{
                    '&:hover': {
                      backgroundColor: '#f9fafb',
                    },
                  }}
                >
                  <TableCell
                    sx={{
                      padding: '16px 24px',
                      borderBottom: '1px solid #e5e7eb',
                      width: '50%',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px',
                      }}
                    >
                      <Box
                        component="img"
                        src={movie.Poster_URL || PLACEHOLDER_IMAGE}
                        alt={movie.Movie_Name}
                        sx={{
                          width: '120px',
                          height: '180px',
                          objectFit: 'cover',
                          borderRadius: '12px',
                          boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
                          transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                          '&:hover': {
                            transform: 'scale(1.08)',
                            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
                          },
                        }}
                      />
                      <Box>
                        <Typography
                          sx={{
                            fontWeight: 600,
                            color: '#1f2937',
                            fontSize: '1.25rem',
                            marginBottom: '8px',
                            lineHeight: 1.4,
                          }}
                        >
                          {movie.Movie_Name}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell
                    sx={{
                      padding: '16px 24px',
                      borderBottom: '1px solid #e5e7eb',
                      width: '30%',
                    }}
                  >
                    <Box
                      component="span"
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        padding: '6px 12px',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        borderRadius: '9999px',
                        minWidth: '140px',
                        ...(movie.Status === 'Now Showing' 
                          ? {
                              backgroundColor: '#dcfce7',
                              color: '#15803d',
                              border: '2px solid #86efac',
                              '&::before': {
                                content: '""',
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: '#15803d',
                                marginRight: '8px',
                              },
                            }
                          : {
                              backgroundColor: '#fef3c7',
                              color: '#b45309',
                              border: '2px solid #fcd34d',
                              '&::before': {
                                content: '""',
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: '#b45309',
                                marginRight: '8px',
                              },
                            }
                        ),
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        },
                      }}
                    >
                      {movie.Status}
                    </Box>
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      padding: '16px 24px',
                      borderBottom: '1px solid #e5e7eb',
                      width: '15%',
                      textAlign: 'center',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        gap: '8px',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '100%',
                      }}
                    >
                      <IconButton
                        onClick={() => handleOpenEditModal(movie)}
                        sx={{
                          color: '#2563eb',
                          backgroundColor: '#e8f0fe',
                          width: '36px',
                          height: '36px',
                          '&:hover': {
                            color: '#1d4ed8',
                            backgroundColor: '#dbeafe',
                          },
                          '& svg': {
                            width: '18px',
                            height: '18px',
                          },
                        }}
                      >
                        <FiEdit2 />
                      </IconButton>
                      <IconButton
                        onClick={() => handleOpenDeleteDialog(movie)}
                        sx={{
                          color: '#ef4444',
                          backgroundColor: '#fee2e2',
                          width: '36px',
                          height: '36px',
                          '&:hover': {
                            color: '#dc2626',
                            backgroundColor: '#fecaca',
                          },
                          '& svg': {
                            width: '18px',
                            height: '18px',
                          },
                        }}
                      >
                        <FiTrash2 />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add Movie Modal */}
      <Dialog
        open={openAddModal}
        onClose={() => setOpenAddModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#1a237e' }}>
            {isEditMode ? 'Sửa Thông Tin Phim' : 'Thêm Phim Mới'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <Card sx={{ flex: 1 }}>
            <CardContent sx={{ p: 3 }}>
              {renderStepContent(activeStep)}
            </CardContent>
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e0e0e0' }}>
              <Button
                onClick={handleBack}
                disabled={activeStep === 0}
                variant="outlined"
                sx={{ minWidth: '100px' }}
              >
                Quay lại
              </Button>
              {activeStep === steps.length - 1 ? (
                <Button
                  onClick={handleAddMovie}
                  variant="contained"
                  disabled={loading || !isStepValid(activeStep)}
                  sx={{ minWidth: '100px' }}
                >
                  {loading ? <CircularProgress size={24} /> : isEditMode ? 'Cập nhật phim' : 'Thêm phim'}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  variant="contained"
                  disabled={!isStepValid(activeStep)}
                  sx={{ minWidth: '100px' }}
                >
                  Tiếp tục
                </Button>
              )}
            </Box>
          </Card>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          {"Xác nhận xóa phim"}
        </DialogTitle>
        <DialogContent>
          <Typography id="delete-dialog-description">
            Bạn có chắc chắn muốn xóa phim "{movieToDelete?.Movie_Name}"? 
            Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Hủy
          </Button>
          <Button
            onClick={handleDeleteMovie}
            color="error"
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Xóa'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ManageMoviePage;
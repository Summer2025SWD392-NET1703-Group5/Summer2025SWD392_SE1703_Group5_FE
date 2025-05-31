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
  Pagination,
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
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { vi } from 'date-fns/locale';
import api from '../../config/axios';
import { styled } from '@mui/material/styles';

// Styles
const styles = {
  pageContainer: {
    padding: 4,
    backgroundColor: '#f5f5f5',
    minHeight: '100vh',
  },
  mainPaper: {
    padding: 3,
    borderRadius: 2,
    backgroundColor: '#ffffff',
  },
  pageTitle: {
    fontWeight: 700,
    color: '#1a237e',
    marginBottom: 3,
    borderBottom: '2px solid #1a237e',
    paddingBottom: 1,
    fontSize: '2.2rem',  // Increased from default h4 size
  },
  searchContainer: {
    mb: 4, 
    display: 'flex', 
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 2,
  },
  searchField: {
    width: 300,
    '& .MuiOutlinedInput-root': {
      fontSize: '1.1rem',
      '&:hover fieldset': {
        borderColor: '#1a237e',
      },
    },
    '& .MuiInputLabel-root': {
      fontSize: '1.1rem',
    },
  },
  addButton: {
    backgroundColor: '#1a237e',
    '&:hover': {
      backgroundColor: '#000051',
    },
    padding: '12px 28px',
    fontWeight: 600,
    fontSize: '1.1rem',
  },
  tableContainer: {
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    borderRadius: 1,
    overflow: 'hidden',
    minHeight: '400px',
    position: 'relative',
  },
  loadingOverlay: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    zIndex: 1,
  },
  tableHeader: {
    backgroundColor: '#e8eaf6',
  },
  headerCell: {
    fontWeight: 700,
    color: '#1a237e',
    fontSize: '1.15rem',
    padding: '16px 8px',
  },
  tableRow: {
    '&:hover': { 
      backgroundColor: '#f5f5f5',
      transition: 'background-color 0.3s',
    },
  },
  tableCell: {
    fontSize: '1.1rem',
    padding: '20px 8px',
  },
  posterContainer: {
    width: 120,  // Increased from 100
    height: 180, // Increased from 150
    overflow: 'hidden',
    borderRadius: 2,
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
  },
  posterImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
  },
  movieName: {
    fontWeight: 600,
    fontSize: '1.15rem',
    color: '#1a237e',
  },
  genreTag: {
    backgroundColor: '#e8eaf6',
    padding: '6px 12px',
    borderRadius: 2,
    display: 'inline-block',
    fontSize: '1.05rem',
    fontWeight: 500,
  },
  statusTag: {
    padding: '6px 12px',
    borderRadius: 2,
    display: 'inline-block',
    fontSize: '1.05rem',
    fontWeight: 500,
  },
  editButton: {
    borderColor: '#1a237e',
    color: '#1a237e',
    '&:hover': {
      borderColor: '#000051',
      backgroundColor: '#e8eaf6',
    },
    fontSize: '1rem',
    padding: '6px 16px',
  },
  deleteButton: {
    borderColor: '#d32f2f',
    color: '#d32f2f',
    '&:hover': {
      borderColor: '#b71c1c',
      backgroundColor: '#ffebee',
    },
    fontSize: '1rem',
    padding: '6px 16px',
  },
  pagination: {
    mt: 4, 
    display: 'flex', 
    justifyContent: 'center',
    '& .MuiPaginationItem-root': {
      color: '#1a237e',
      fontSize: '1.1rem',
    },
    '& .Mui-selected': {
      backgroundColor: '#1a237e !important',
      color: '#ffffff',
    },
  },
  filterContainer: {
    mb: 4,
    p: 2,
    backgroundColor: '#f8f9fa',
    borderRadius: 2,
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  filterItem: {
    minWidth: 200,
    '& .MuiInputLabel-root': {
      fontSize: '1.1rem',
    },
    '& .MuiSelect-select, & .MuiInputBase-input': {
      fontSize: '1.1rem',
    },
  },
  modalContent: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80%',
    maxWidth: 800,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    maxHeight: '90vh',
    overflow: 'auto',
  },
  formControl: {
    width: '100%',
    marginBottom: 2,
  },
  fileInput: {
    display: 'none',
  },
  uploadButton: {
    marginTop: 1,
  },
  stepper: {
    mb: 4,
    '& .MuiStepLabel-root .Mui-completed': {
      color: '#1a237e', 
    },
    '& .MuiStepLabel-root .Mui-active': {
      color: '#1a237e',
    },
  },
  formCard: {
    minHeight: 400,
    display: 'flex',
    flexDirection: 'column',
    p: 3,
    '& .MuiTextField-root': {
      mb: 3,
    },
  },
  stepButtons: {
    display: 'flex',
    justifyContent: 'space-between',
    mt: 'auto',
    pt: 3,
  },
  uploadPreview: {
    width: '100%',
    height: 200,
    backgroundColor: '#f5f5f5',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 1,
    mb: 2,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  requiredLabel: {
    '& .MuiFormLabel-asterisk': {
      color: '#1a237e', // Default blue color
    },
    '&.error .MuiFormLabel-asterisk': {
      color: 'red',
    }
  },
  formField: {
    '& .MuiOutlinedInput-root': {
      '&.Mui-focused fieldset': {
        borderColor: '#1a237e',
      },
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: '#1a237e',
    }
  },
  selectedMenuItem: {
    backgroundColor: '#e3f2fd !important',
    '&.Mui-selected': {
      backgroundColor: '#bbdefb !important',
    },
    '&:hover': {
      backgroundColor: '#90caf9 !important',
    }
  },
};

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
  Director: string;
  Cast: string;
  Genre: string;
  Rating: string;
  Language: string;
  Country: string;
  Synopsis: string;
  Poster_URL: string;
  Trailer_Link: string;
  Status: string;
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

// Add styled components
const StyledGrid = styled(Grid)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
}));

const initialMovieState = {
  Movie_Name: '',
  Release_Date: '',
  End_Date: '',
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

const ManageMoviePage: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    movieName: '',
    releaseYear: '',
    genre: 'Tất cả',
    status: 'Tất cả',
  });
  const limit = 10;
  const [openAddModal, setOpenAddModal] = useState(false);
  const [newMovie, setNewMovie] = useState<NewMovie>(initialMovieState);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [previewUrl, setPreviewUrl] = useState('');
  const [showErrors, setShowErrors] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  const steps = ['Thông tin cơ bản', 'Thông tin chi tiết', 'Hình ảnh & Trailer'];

  const fetchMovies = async () => {
    try {
      setLoading(true);
      console.log('Fetching movies with filters:', filters);
      const response = await api.get('/movies', {
        params: {
          page,
          limit,
          name: filters.movieName || undefined,
          year: filters.releaseYear !== '' ? filters.releaseYear : undefined,
          genre: filters.genre !== 'Tất cả' ? filters.genre : undefined,
          status: filters.status !== 'Tất cả' ? filters.status : undefined,
        },
      });
      
      console.log('API Response:', response.data);
      
      if (Array.isArray(response.data)) {
        setMovies(response.data);
        setTotalPages(Math.ceil(response.data.length / limit));
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
  }, [page, filters]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleFilterChange = (field: keyof FilterState) => (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setFilters(prev => ({
      ...prev,
      [field]: event.target.value as string
    }));
    setPage(1); // Reset to first page when filter changes
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
    if (!newMovie.Movie_Name) {
      showError('Vui lòng nhập tên phim');
      return false;
    }
    if (!newMovie.Release_Date) {
      showError('Vui lòng chọn ngày phát hành');
      return false;
    }
    if (!newMovie.End_Date) {
      showError('Vui lòng chọn ngày kết thúc');
      return false;
    }
    if (!newMovie.Director) {
      showError('Vui lòng nhập tên đạo diễn');
      return false;
    }
    if (!newMovie.Duration || newMovie.Duration <= 0) {
      showError('Vui lòng nhập thời lượng hợp lệ');
      return false;
    }
    if (newMovie.Genre.length === 0) {
      showError('Vui lòng chọn ít nhất một thể loại');
      return false;
    }
    if (!newMovie.Rating) {
      showError('Vui lòng chọn xếp hạng');
      return false;
    }
    if (!newMovie.Status) {
      showError('Vui lòng chọn trạng thái phim');
      return false;
    }
    if (!newMovie.Trailer_Link) {
      showError('Vui lòng nhập link trailer');
      return false;
    }

    // Kiểm tra ngày kết thúc phải sau ngày phát hành
    const releaseDate = new Date(newMovie.Release_Date);
    const endDate = new Date(newMovie.End_Date);
    if (endDate <= releaseDate) {
      showError('Ngày kết thúc phải sau ngày phát hành');
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
          formData.append(key, value.toString());
        }
      });

      if (selectedFile) {
        formData.append('posterFile', selectedFile);
      }

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
      
    } catch (error) {
      console.error('Error adding movie:', error);
      if (error.response?.data?.message) {
        showError(error.response.data.message);
      } else {
        showError('Có lỗi xảy ra khi thêm phim. Vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
    }
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
    setNewMovie(prev => ({
      ...prev,
      [field]: event.target.value
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
    setNewMovie(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 0:
        return newMovie.Movie_Name && 
               newMovie.Release_Date && 
               newMovie.End_Date &&
               newMovie.Director;
      case 1:
        return newMovie.Duration > 0 && 
               newMovie.Genre.length > 0 && 
               newMovie.Rating &&
               newMovie.Status;
      case 2:
        return newMovie.Trailer_Link !== '';
      default:
        return false;
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <TextField
              fullWidth
              label="Tên phim"
              value={newMovie.Movie_Name}
              onChange={handleInputChange('Movie_Name')}
              required
              sx={{ 
                ...styles.formField,
                ...styles.requiredLabel,
                ...(showErrors && !newMovie.Movie_Name && { '&.MuiFormControl-root': { '& .MuiFormLabel-asterisk': { color: 'red' } } })
              }}
              error={showErrors && !newMovie.Movie_Name}
              helperText={showErrors && !newMovie.Movie_Name ? "Vui lòng nhập tên phim" : ""}
            />
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
              <DatePicker
                label="Ngày phát hành *"
                value={newMovie.Release_Date ? new Date(newMovie.Release_Date) : null}
                onChange={(date) => setNewMovie(prev => ({
                  ...prev,
                  Release_Date: date ? date.toISOString().split('T')[0] : ''
                }))}
                sx={{ 
                  width: '100%', 
                  mb: 3,
                  ...styles.formField,
                  ...styles.requiredLabel,
                  ...(showErrors && !newMovie.Release_Date && { '&.MuiFormControl-root': { '& .MuiFormLabel-asterisk': { color: 'red' } } })
                }}
                slotProps={{
                  textField: {
                    error: showErrors && !newMovie.Release_Date,
                    helperText: showErrors && !newMovie.Release_Date ? "Vui lòng chọn ngày phát hành" : ""
                  }
                }}
              />
            </LocalizationProvider>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
              <DatePicker
                label="Ngày kết thúc"
                value={newMovie.End_Date ? new Date(newMovie.End_Date) : null}
                onChange={(date) => setNewMovie(prev => ({
                  ...prev,
                  End_Date: date ? date.toISOString().split('T')[0] : ''
                }))}
                sx={{ 
                  width: '100%', 
                  mb: 3,
                  ...styles.formField,
                  ...styles.requiredLabel,
                  ...(showErrors && !newMovie.End_Date && { '&.MuiFormControl-root': { '& .MuiFormLabel-asterisk': { color: 'red' } } })
                }}
                slotProps={{
                  textField: {
                    error: showErrors && !newMovie.End_Date,
                    helperText: showErrors && !newMovie.End_Date ? "Vui lòng chọn ngày kết thúc" : "",
                    required: true
                  }
                }}
              />
            </LocalizationProvider>
            <TextField
              fullWidth
              label="Đạo diễn"
              value={newMovie.Director}
              onChange={handleInputChange('Director')}
              required
              sx={{ 
                ...styles.formField,
                ...styles.requiredLabel,
                ...(showErrors && !newMovie.Director && { '&.MuiFormControl-root': { '& .MuiFormLabel-asterisk': { color: 'red' } } })
              }}
              error={showErrors && !newMovie.Director}
              helperText={showErrors && !newMovie.Director ? "Vui lòng nhập tên đạo diễn" : ""}
            />
          </Box>
        );
      case 1:
        return (
          <Box>
            <TextField
              fullWidth
              label="Diễn viên"
              value={newMovie.Cast}
              onChange={handleInputChange('Cast')}
              helperText="Nhập tên các diễn viên, phân cách bằng dấu phẩy"
              sx={{ mb: 3, ...styles.formField }}
            />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
              <Box sx={{ flexGrow: 1, minWidth: '250px', flex: '1 1 45%' }}>
                <TextField
                  fullWidth
                  label="Thời lượng (phút)"
                  type="number"
                  value={newMovie.Duration}
                  onChange={handleInputChange('Duration')}
                  required
                  sx={{ 
                    ...styles.formField,
                    ...styles.requiredLabel,
                    ...(showErrors && (!newMovie.Duration || newMovie.Duration <= 0) && { '&.MuiFormControl-root': { '& .MuiFormLabel-asterisk': { color: 'red' } } })
                  }}
                  error={showErrors && (!newMovie.Duration || newMovie.Duration <= 0)}
                  helperText={showErrors && (!newMovie.Duration || newMovie.Duration <= 0) ? "Vui lòng nhập thời lượng hợp lệ" : ""}
                />
              </Box>
              <Box sx={{ flexGrow: 1, minWidth: '250px', flex: '1 1 45%' }}>
                <FormControl 
                  fullWidth 
                  required 
                  error={showErrors && newMovie.Genre.length === 0}
                  sx={{ 
                    ...styles.formField,
                    ...styles.requiredLabel,
                    ...(showErrors && newMovie.Genre.length === 0 && { '&.MuiFormControl-root': { '& .MuiFormLabel-asterisk': { color: 'red' } } })
                  }}
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
                      <MenuItem 
                        key={genre} 
                        value={genre}
                        sx={[
                          styles.selectedMenuItem,
                          newMovie.Genre.includes(genre) && {
                            backgroundColor: '#bbdefb !important',
                            fontWeight: 'bold'
                          }
                        ]}
                      >
                        {genre}
                      </MenuItem>
                    ))}
                  </Select>
                  {showErrors && newMovie.Genre.length === 0 && (
                    <FormHelperText error>Vui lòng chọn ít nhất một thể loại</FormHelperText>
                  )}
                </FormControl>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
              <Box sx={{ flexGrow: 1, minWidth: '250px', flex: '1 1 45%' }}>
                <FormControl 
                  fullWidth 
                  required
                  error={showErrors && !newMovie.Rating}
                  sx={{ 
                    ...styles.formField,
                    ...styles.requiredLabel,
                    ...(showErrors && !newMovie.Rating && { '&.MuiFormControl-root': { '& .MuiFormLabel-asterisk': { color: 'red' } } })
                  }}
                >
                  <InputLabel>Xếp hạng</InputLabel>
                  <Select
                    value={newMovie.Rating}
                    label="Xếp hạng"
                    onChange={handleSelectChange('Rating')}
                    required
                  >
                    {RATINGS.map(rating => (
                      <MenuItem key={rating} value={rating}>{rating}</MenuItem>
                    ))}
                  </Select>
                  {showErrors && !newMovie.Rating && (
                    <FormHelperText error>Vui lòng chọn xếp hạng</FormHelperText>
                  )}
                </FormControl>
              </Box>
              <Box sx={{ flexGrow: 1, minWidth: '250px', flex: '1 1 45%' }}>
                <FormControl 
                  fullWidth 
                  required
                  error={showErrors && !newMovie.Status}
                  sx={{ 
                    ...styles.formField,
                    ...styles.requiredLabel,
                    ...(showErrors && !newMovie.Status && { '&.MuiFormControl-root': { '& .MuiFormLabel-asterisk': { color: 'red' } } })
                  }}
                >
                  <InputLabel>Trạng thái</InputLabel>
                  <Select
                    value={newMovie.Status}
                    label="Trạng thái"
                    onChange={handleSelectChange('Status')}
                    required
                  >
                    {STATUSES.filter(status => status !== 'Tất cả').map(status => (
                      <MenuItem key={status} value={status}>{status}</MenuItem>
                    ))}
                  </Select>
                  {showErrors && !newMovie.Status && (
                    <FormHelperText error>Vui lòng chọn trạng thái phim</FormHelperText>
                  )}
                </FormControl>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
              <Box sx={{ flexGrow: 1, minWidth: '250px', flex: '1 1 45%' }}>
                <FormControl 
                  fullWidth 
                  sx={styles.formField}
                >
                  <InputLabel>Ngôn ngữ</InputLabel>
                  <Select
                    value={newMovie.Language}
                    label="Ngôn ngữ"
                    onChange={handleSelectChange('Language')}
                  >
                    {LANGUAGES.map(lang => (
                      <MenuItem key={lang} value={lang}>{lang}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flexGrow: 1, minWidth: '250px', flex: '1 1 45%' }}>
                <FormControl 
                  fullWidth 
                  sx={styles.formField}
                >
                  <InputLabel>Quốc gia</InputLabel>
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
              </Box>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
              <Box sx={{ flexGrow: 1, minWidth: '250px', flex: '1 1 45%' }}>
                <TextField
                  fullWidth
                  label="Công ty sản xuất"
                  value={newMovie.Production_Company}
                  onChange={handleInputChange('Production_Company')}
                  sx={styles.formField}
                />
              </Box>
              <Box sx={{ flexGrow: 1, minWidth: '250px', flex: '1 1 45%' }}>
                <TextField
                  fullWidth
                  label="Tóm tắt nội dung"
                  value={newMovie.Synopsis}
                  onChange={handleInputChange('Synopsis')}
                  multiline
                  rows={4}
                  sx={styles.formField}
                />
              </Box>
            </Box>
          </Box>
        );
      case 2:
        return (
          <Box>
            <Box 
              sx={{
                ...styles.uploadPreview,
                backgroundImage: previewUrl ? `url(${previewUrl})` : 'none'
              }}
            >
              {!previewUrl && (
                <Typography color="text.secondary">
                  Chưa có ảnh poster
                </Typography>
              )}
            </Box>
            <input
              accept="image/*"
              type="file"
              id="poster-file"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <label htmlFor="poster-file">
              <Button
                variant="outlined"
                component="span"
                fullWidth
                sx={{ mb: 3 }}
              >
                {selectedFile ? 'Thay đổi poster' : 'Chọn poster phim'}
              </Button>
            </label>
            <TextField
              fullWidth
              label="Link trailer"
              value={newMovie.Trailer_Link}
              onChange={handleInputChange('Trailer_Link')}
              required
              sx={{ 
                ...styles.formField,
                ...styles.requiredLabel,
                ...(showErrors && !newMovie.Trailer_Link && { '&.MuiFormControl-root': { '& .MuiFormLabel-asterisk': { color: 'red' } } })
              }}
              error={showErrors && !newMovie.Trailer_Link}
              helperText={showErrors && !newMovie.Trailer_Link ? "Vui lòng nhập link trailer" : ""}
            />
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={styles.pageContainer}>
      <Paper elevation={3} sx={styles.mainPaper}>
        <Typography variant="h4" gutterBottom sx={styles.pageTitle}>
          QUẢN LÝ PHIM
        </Typography>

        {/* Filters */}
        <Paper sx={styles.filterContainer}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Tên phim"
                variant="outlined"
                value={filters.movieName}
                onChange={handleFilterChange('movieName')}
                sx={styles.filterItem}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth sx={styles.filterItem}>
                <InputLabel>Năm phát hành</InputLabel>
                <Select
                  value={filters.releaseYear}
                  label="Năm phát hành"
                  onChange={handleFilterChange('releaseYear')}
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  {YEARS.map(year => (
                    <MenuItem key={year} value={year}>{year}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth sx={styles.filterItem}>
                <InputLabel>Thể loại</InputLabel>
                <Select
                  value={filters.genre}
                  label="Thể loại"
                  onChange={handleFilterChange('genre')}
                >
                  {GENRES.map(genre => (
                    <MenuItem key={genre} value={genre}>{genre}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth sx={styles.filterItem}>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={filters.status}
                  label="Trạng thái"
                  onChange={handleFilterChange('status')}
                >
                  {STATUSES.map(status => (
                    <MenuItem key={status} value={status}>{status}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        <Box sx={{ mt: 3, mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            variant="contained" 
            sx={styles.addButton}
            onClick={() => setOpenAddModal(true)}
          >
            Thêm Phim Mới
          </Button>
        </Box>

        <TableContainer component={Paper} sx={styles.tableContainer}>
          {loading && (
            <Box sx={styles.loadingOverlay}>
              <CircularProgress />
            </Box>
          )}
          <Table>
            <TableHead>
              <TableRow sx={styles.tableHeader}>
                <TableCell sx={styles.headerCell}>Poster</TableCell>
                <TableCell sx={styles.headerCell}>Tên Phim</TableCell>
                <TableCell sx={styles.headerCell}>Ngày Phát Hành</TableCell>
                <TableCell sx={styles.headerCell}>Đạo Diễn</TableCell>
                <TableCell sx={styles.headerCell}>Thể Loại</TableCell>
                <TableCell sx={styles.headerCell}>Trạng Thái</TableCell>
                <TableCell sx={styles.headerCell}>Thao Tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {movies.map((movie) => (
                <TableRow key={movie.Movie_ID} sx={styles.tableRow}>
                  <TableCell sx={styles.tableCell}>
                    <Box sx={styles.posterContainer}>
                      <img
                        src={movie.Poster_URL || '/placeholder-movie.jpg'}
                        alt={movie.Movie_Name}
                        style={styles.posterImage}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-movie.jpg';
                        }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell sx={{ ...styles.tableCell, ...styles.movieName }}>{movie.Movie_Name}</TableCell>
                  <TableCell sx={styles.tableCell}>{new Date(movie.Release_Date).toLocaleDateString('vi-VN')}</TableCell>
                  <TableCell sx={styles.tableCell}>{movie.Director}</TableCell>
                  <TableCell sx={styles.tableCell}>
                    <Box sx={styles.genreTag}>{movie.Genre}</Box>
                  </TableCell>
                  <TableCell sx={styles.tableCell}>
                    <Box sx={{
                      ...styles.statusTag,
                      backgroundColor: getStatusColor(movie.Status).bg,
                      color: getStatusColor(movie.Status).color,
                    }}>
                      {movie.Status}
                    </Box>
                  </TableCell>
                  <TableCell sx={styles.tableCell}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        size="medium"
                        sx={styles.editButton}
                      >
                        Sửa
                      </Button>
                      <Button
                        variant="outlined"
                        size="medium"
                        sx={styles.deleteButton}
                      >
                        Xóa
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={styles.pagination}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      </Paper>

      {/* Add Movie Modal */}
      <Dialog
        open={openAddModal}
        onClose={() => setOpenAddModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#1a237e' }}>
            Thêm Phim Mới
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep} sx={styles.stepper}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <Card sx={styles.formCard}>
            <CardContent sx={{ flex: 1 }}>
              {renderStepContent(activeStep)}
            </CardContent>
            <Box sx={styles.stepButtons}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
              >
                Quay lại
              </Button>
              <Box>
                <Button
                  onClick={() => setOpenAddModal(false)}
                  sx={{ mr: 1 }}
                >
                  Hủy
                </Button>
                {activeStep === steps.length - 1 ? (
                  <Button
                    variant="contained"
                    onClick={handleAddMovie}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Thêm phim'}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={!isStepValid(activeStep)}
                  >
                    Tiếp tục
                  </Button>
                )}
              </Box>
            </Box>
          </Card>
        </DialogContent>
      </Dialog>

      {/* Add Snackbar at the end of the component */}
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

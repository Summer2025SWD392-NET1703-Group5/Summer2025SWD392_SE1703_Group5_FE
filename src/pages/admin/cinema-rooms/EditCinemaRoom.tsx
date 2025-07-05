// src/pages/admin/cinema-rooms/EditCinemaRoom.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  ArrowLeftIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import RoomSeatMap from './RoomSeatMap';
import '../../../components/admin/cinema-rooms/SeatMap.css';

interface CinemaRoom {
  id: string;
  name: string;
  cinemaId: string;
  cinemaName: string;
  capacity: number;
  status: 'active' | 'inactive' | 'maintenance';
  rows: number;
  cols: number;
  vipSeats: string[];
  disabledSeats: string[];
  coupleSeats: string[];
}

interface Cinema {
  id: string;
  name: string;
}

// Mock API functions
const fetchCinemas = async (): Promise<Cinema[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return [
    { id: '1', name: 'Galaxy Nguyễn Du' },
    { id: '2', name: 'Galaxy Tân Bình' },
    { id: '3', name: 'Galaxy Kinh Dương Vương' },
  ];
};

const fetchCinemaRoom = async (id: string): Promise<CinemaRoom> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return {
    id,
    name: 'Phòng chiếu undefined',
    cinemaId: '1',
    cinemaName: 'Galaxy Nguyễn Du',
    capacity: 96,
    status: 'active',
    rows: 8,
    cols: 12,
    vipSeats: ['C5', 'C6', 'C7', 'C8', 'D5', 'D6', 'D7', 'D8', 'E5', 'E6', 'E7', 'E8'],
    disabledSeats: ['A1', 'A12', 'H1', 'H12'],
    coupleSeats: [],
  };
};

const EditCinemaRoom: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    cinemaId: '',
    status: 'active',
    rows: 8,
    cols: 12,
  });
  
  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Seat configuration
  const [vipSeats, setVipSeats] = useState<string[]>([]);
  const [disabledSeats, setDisabledSeats] = useState<string[]>([]);
  const [coupleSeats, setCoupleSeats] = useState<string[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  
  // Reference data
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [seatTypeMode, setSeatTypeMode] = useState<'regular' | 'vip' | 'couple'>('regular');
  
  // Load data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [cinemasData, roomData] = await Promise.all([
          fetchCinemas(),
          id ? fetchCinemaRoom(id) : Promise.resolve(null),
        ]);
        
        setCinemas(cinemasData);
        
        if (roomData) {
          setFormData({
            name: roomData.name,
            cinemaId: roomData.cinemaId,
            status: roomData.status,
            rows: roomData.rows,
            cols: roomData.cols,
          });
          
          setVipSeats(roomData.vipSeats);
          setDisabledSeats(roomData.disabledSeats);
          setCoupleSeats(roomData.coupleSeats);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Không thể tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id]);
  
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Clear error when user corrects input
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  // Handle numeric input changes
  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseInt(value, 10);
    
    // Clear error when user corrects input
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    if (!isNaN(numValue)) {
      setFormData(prev => ({
        ...prev,
        [name]: numValue,
      }));
    }
  };
  
  // Handle seat selection
  const handleSeatSelect = (seatId: string) => {
    if (selectedSeats.includes(seatId)) {
      // If already selected, deselect it
      setSelectedSeats(selectedSeats.filter(s => s !== seatId));
    } else {
      // If not selected, select it
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };
  
  // Handle row selection
  const handleRowSelect = (row: string) => {
    const rowSeats: string[] = [];
    // Generate all seat IDs in this row
    for (let col = 1; col <= formData.cols; col++) {
      rowSeats.push(`${row}${col}`);
    }
    
    // Check if all seats in this row are already selected
    const allSelected = rowSeats.every(seat => selectedSeats.includes(seat));
    
    if (allSelected) {
      // If all selected, deselect the entire row
      setSelectedSeats(selectedSeats.filter(seat => !rowSeats.includes(seat)));
    } else {
      // Otherwise, select all seats in the row
      const newSelected = [...selectedSeats];
      rowSeats.forEach(seat => {
        if (!newSelected.includes(seat)) {
          newSelected.push(seat);
        }
      });
      setSelectedSeats(newSelected);
    }
  };
  
  // Handle column selection
  const handleColSelect = (col: number) => {
    const colSeats: string[] = [];
    // Generate all seat IDs in this column
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let r = 0; r < formData.rows; r++) {
      if (r < alphabet.length) {
        const row = alphabet[r];
        colSeats.push(`${row}${col}`);
      }
    }
    
    // Check if all seats in this column are already selected
    const allSelected = colSeats.every(seat => selectedSeats.includes(seat));
    
    if (allSelected) {
      // If all selected, deselect the entire column
      setSelectedSeats(selectedSeats.filter(seat => !colSeats.includes(seat)));
    } else {
      // Otherwise, select all seats in the column
      const newSelected = [...selectedSeats];
      colSeats.forEach(seat => {
        if (!newSelected.includes(seat)) {
          newSelected.push(seat);
        }
      });
      setSelectedSeats(newSelected);
    }
  };
  
  // Apply seat type to selected seats
  const applySeatType = () => {
    if (selectedSeats.length === 0) {
      toast.error('Vui lòng chọn ít nhất một ghế');
      return;
    }
    
    switch (seatTypeMode) {
      case 'vip':
        // Remove from other types first
        setDisabledSeats(disabledSeats.filter(seat => !selectedSeats.includes(seat)));
        setCoupleSeats(coupleSeats.filter(seat => !selectedSeats.includes(seat)));
        // Add to VIP
        setVipSeats([...vipSeats.filter(seat => !selectedSeats.includes(seat)), ...selectedSeats]);
        break;
        
      case 'couple':
        // Remove from other types first
        setVipSeats(vipSeats.filter(seat => !selectedSeats.includes(seat)));
        setDisabledSeats(disabledSeats.filter(seat => !selectedSeats.includes(seat)));
        // Add to couple
        setCoupleSeats([...coupleSeats.filter(seat => !selectedSeats.includes(seat)), ...selectedSeats]);
        break;
        
      case 'regular':
      default:
        // Remove from all special types
        setVipSeats(vipSeats.filter(seat => !selectedSeats.includes(seat)));
        setDisabledSeats(disabledSeats.filter(seat => !selectedSeats.includes(seat)));
        setCoupleSeats(coupleSeats.filter(seat => !selectedSeats.includes(seat)));
        break;
    }
    
    // Clear selection after applying
    setSelectedSeats([]);
    toast.success(`Đã áp dụng loại ghế cho ${selectedSeats.length} ghế`);
  };
  
  // Form validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Vui lòng nhập tên phòng chiếu';
    }
    
    if (!formData.cinemaId) {
      newErrors.cinemaId = 'Vui lòng chọn rạp';
    }
    
    if (formData.rows < 1 || formData.rows > 26) {
      newErrors.rows = 'Số hàng phải từ 1 đến 26';
    }
    
    if (formData.cols < 1 || formData.cols > 20) {
      newErrors.cols = 'Số cột phải từ 1 đến 20';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Vui lòng kiểm tra lại thông tin');
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Calculate capacity (total seats minus disabled seats)
      const totalSeats = formData.rows * formData.cols;
      const capacity = totalSeats - disabledSeats.length;
      
      // Prepare data for submission
      const roomData = {
        ...formData,
        capacity,
        vipSeats,
        disabledSeats,
        coupleSeats,
      };
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(id ? 'Cập nhật phòng chiếu thành công' : 'Tạo phòng chiếu mới thành công');
      navigate('/admin/cinema-rooms');
    } catch (error) {
      console.error('Error saving room:', error);
      toast.error('Không thể lưu phòng chiếu');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-FFD875"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header with back button */}
      <div className="mb-6">
        <Link 
          to="/admin/cinema-rooms" 
          className="flex items-center text-gray-400 hover:text-FFD875 mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-1" />
          <span>Quay lại danh sách</span>
        </Link>
        
        <h1 className="text-2xl font-bold text-white">
          {id ? 'Chỉnh sửa phòng:' : 'Thêm phòng chiếu mới'}
          {id && <span className="ml-2">{formData.name}</span>}
        </h1>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form inputs */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
              <h2 className="text-lg font-semibold text-white border-b border-slate-700 pb-2 mb-6">Thông tin phòng chiếu</h2>
              
              <div className="space-y-4">
                {/* Room name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1 required-field">
                    Tên phòng
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`bg-slate-700 text-white pl-10 pr-4 py-2 rounded-lg border ${
                        errors.name ? 'border-red-500 input-error' : 'border-slate-600 focus:border-FFD875 focus:outline-none focus:ring-1 focus:ring-FFD875'
                      } w-full`}
                      placeholder="Nhập tên phòng chiếu"
                    />
                  </div>
                  {errors.name && <p className="error-message">{errors.name}</p>}
                </div>
                
                {/* Cinema */}
                <div>
                  <label htmlFor="cinemaId" className="block text-sm font-medium text-gray-300 mb-1 required-field">
                    Thuộc rạp
                  </label>
                  <select
                    id="cinemaId"
                    name="cinemaId"
                    value={formData.cinemaId}
                    onChange={handleInputChange}
                    className={`bg-slate-700 text-white px-4 py-2 rounded-lg border ${
                      errors.cinemaId ? 'border-red-500 input-error' : 'border-slate-600 focus:border-FFD875 focus:outline-none focus:ring-1 focus:ring-FFD875'
                    } w-full`}
                  >
                    <option value="">-- Chọn rạp --</option>
                    {cinemas.map(cinema => (
                      <option key={cinema.id} value={cinema.id}>{cinema.name}</option>
                    ))}
                  </select>
                  {errors.cinemaId && <p className="error-message">{errors.cinemaId}</p>}
                </div>
                
                {/* Room dimensions */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="rows" className="block text-sm font-medium text-gray-300 mb-1 required-field">
                      Số hàng
                    </label>
                    <input
                      type="number"
                      id="rows"
                      name="rows"
                      min="1"
                      max="26"
                      value={formData.rows}
                      onChange={handleNumericChange}
                      className={`bg-slate-700 text-white px-4 py-2 rounded-lg border ${
                        errors.rows ? 'border-red-500 input-error' : 'border-slate-600 focus:border-FFD875 focus:outline-none focus:ring-1 focus:ring-FFD875'
                      } w-full`}
                    />
                    {errors.rows && <p className="error-message">{errors.rows}</p>}
                  </div>
                  <div>
                    <label htmlFor="cols" className="block text-sm font-medium text-gray-300 mb-1 required-field">
                      Số cột
                    </label>
                    <input
                      type="number"
                      id="cols"
                      name="cols"
                      min="1"
                      max="20"
                      value={formData.cols}
                      onChange={handleNumericChange}
                      className={`bg-slate-700 text-white px-4 py-2 rounded-lg border ${
                        errors.cols ? 'border-red-500 input-error' : 'border-slate-600 focus:border-FFD875 focus:outline-none focus:ring-1 focus:ring-FFD875'
                      } w-full`}
                    />
                    {errors.cols && <p className="error-message">{errors.cols}</p>}
                  </div>
                </div>
                
                {/* Status */}
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-1 required-field">
                    Trạng thái
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-FFD875 focus:outline-none focus:ring-1 focus:ring-FFD875 w-full"
                  >
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Không hoạt động</option>
                    <option value="maintenance">Bảo trì</option>
                  </select>
                </div>
                
                {/* Capacity info */}
                <div className="bg-slate-700 p-4 rounded-lg">
                  <div className="flex items-center text-sm text-gray-300 mb-2">
                    <UserGroupIcon className="w-5 h-5 mr-2" />
                    <span>Sức chứa:</span>
                    <span className="ml-auto text-white font-semibold">{formData.rows * formData.cols - disabledSeats.length} ghế</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-300 mb-2">
                    <div className="w-3 h-3 bg-purple-500 bg-opacity-30 rounded-sm mr-2 border border-purple-500"></div>
                    <span>Ghế VIP:</span>
                    <span className="ml-auto text-white font-semibold">{vipSeats.length} ghế</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-300">
                    <div className="w-3 h-3 bg-orange-500 bg-opacity-30 rounded-sm mr-2 border border-orange-500"></div>
                    <span>Ghế đôi:</span>
                    <span className="ml-auto text-white font-semibold">{coupleSeats.length} ghế</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Seat configuration */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800 rounded-lg p-6 shadow-lg mb-6">
              <h2 className="text-lg font-semibold text-white mb-4">Cấu hình ghế</h2>
              
              <div className="flex flex-wrap mb-4 gap-2">
                <button
                  type="button"
                  onClick={() => setSeatTypeMode('regular')}
                  className={`px-3 py-1 rounded-lg ${seatTypeMode === 'regular' ? 'bg-FFD875 text-black' : 'bg-slate-700 text-white'}`}
                >
                  Ghế thường
                </button>
                <button
                  type="button"
                  onClick={() => setSeatTypeMode('vip')}
                  className={`px-3 py-1 rounded-lg ${seatTypeMode === 'vip' ? 'bg-FFD875 text-black' : 'bg-slate-700 text-white'}`}
                >
                  Ghế VIP
                </button>
                <button
                  type="button"
                  onClick={() => setSeatTypeMode('couple')}
                  className={`px-3 py-1 rounded-lg ${seatTypeMode === 'couple' ? 'bg-FFD875 text-black' : 'bg-slate-700 text-white'}`}
                >
                  Ghế đôi
                </button>
                
                <button
                  type="button"
                  onClick={applySeatType}
                  disabled={selectedSeats.length === 0}
                  className={`ml-auto px-4 py-1 rounded-lg ${
                    selectedSeats.length > 0 
                      ? 'bg-FFD875 text-black btn-glow btn-yellow' 
                      : 'bg-slate-700 text-gray-400 cursor-not-allowed'
                  }`}
                  style={selectedSeats.length > 0 ? { backgroundColor: '#FFD875' } : {}}
                >
                  Áp dụng ({selectedSeats.length} ghế)
                </button>
              </div>
              
              <div className="mb-3 text-sm text-gray-400">
                <div className="flex items-center gap-1 mb-1">
                  <CheckCircleIcon className="w-4 h-4 text-green-500" />
                  <span>Nhấp vào chữ cái (A, B, C...) để chọn cả hàng, nhấp vào số (1, 2, 3...) để chọn cả cột</span>
                </div>
                <div className="flex items-center gap-1">
                  <ExclamationCircleIcon className="w-4 h-4 text-yellow-500" />
                  <span>Đảm bảo đặt các ghế không sử dụng cho các khu vực không có ghế thực tế</span>
                </div>
              </div>
              
              <RoomSeatMap
                rows={formData.rows}
                cols={formData.cols}
                selectedSeats={selectedSeats}
                onSeatSelect={handleSeatSelect}
                onRowSelect={handleRowSelect}
                onColSelect={handleColSelect}
                vipSeats={vipSeats}
                disabledSeats={disabledSeats}
                coupleSeats={coupleSeats}
              />
            </div>
            
            {/* Submit buttons */}
            <div className="flex justify-end space-x-4">
              <Link
                to="/admin/cinema-rooms"
                className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
              >
                Hủy
              </Link>
              <button
                type="submit"
                className="px-6 py-2 bg-FFD875 text-black rounded-lg hover:bg-opacity-90 transition-colors btn-glow btn-yellow"
                style={{ backgroundColor: '#FFD875' }}
                disabled={submitting}
              >
                {submitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang lưu...
                  </span>
                ) : id ? 'Lưu thay đổi' : 'Tạo phòng chiếu'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditCinemaRoom;

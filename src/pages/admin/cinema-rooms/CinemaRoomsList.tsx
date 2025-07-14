// src/pages/admin/cinema-rooms/CinemaRoomsList.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  MapIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CogIcon,
  HomeIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import ExcelImportExport from '../../../components/admin/common/ExcelImportExport';
import { cinemaService } from '../../../services/cinemaService';
import { cinemaRoomService } from '../../../services/cinemaRoomService';
import type { Cinema } from '../../../types/cinema';
import type { CinemaRoom } from '../../../types/cinemaRoom';
import { useAuth } from '../../../hooks/useAuth';

const CinemaRoomsList: React.FC = () => {
  const { user } = useAuth(); // Lấy thông tin người dùng hiện tại
  const isAdmin = user?.role === 'Admin'; // Kiểm tra có phải Admin không
  
  const [loading, setLoading] = useState(true);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [rooms, setRooms] = useState<CinemaRoom[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<CinemaRoom[]>([]);
  const [importLoading, setImportLoading] = useState(false);
  const [managerCinema, setManagerCinema] = useState<Cinema | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const selectedCinemaId = searchParams.get('cinemaId');

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        if (isAdmin) {
          // Admin có thể xem tất cả các rạp
        const fetchedCinemas = await cinemaService.getAllCinemas();
        setCinemas(fetchedCinemas);

        if (fetchedCinemas.length > 0) {
          const initialCinemaId = selectedCinemaId || fetchedCinemas[0].Cinema_ID.toString();
          if (!selectedCinemaId) {
            setSearchParams({ cinemaId: initialCinemaId });
          }
          await fetchRoomsForCinema(Number(initialCinemaId));
          }
        } else {
          // Manager chỉ có thể xem rạp được phân công
          const fetchedCinema = await cinemaService.getManagerCinema();
          if (fetchedCinema) {
            setManagerCinema(fetchedCinema);
            setCinemas([fetchedCinema]); // Đặt vào mảng các rạp để dùng chung logic
            
            // Lấy ID của rạp manager quản lý
            const cinemaId = fetchedCinema.Cinema_ID;
            
            // Lấy danh sách phòng của rạp đó
            await fetchRoomsForCinema(cinemaId);
          }
        }
      } catch (error) {
        toast.error('Không thể tải dữ liệu rạp hoặc phòng chiếu.');
        console.error('Error fetching initial data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const fetchRoomsForCinema = async (cinemaId: number) => {
    try {
      setLoading(true);
      
      // Sử dụng API khác nhau tùy thuộc vào vai trò người dùng
      let fetchedRooms;
      if (isAdmin) {
        fetchedRooms = await cinemaRoomService.getRoomsByCinemaId(cinemaId);
      } else {
        // Manager - gọi API riêng để lấy phòng trong rạp của họ
        fetchedRooms = await cinemaRoomService.getRoomsByCinemaId(cinemaId);
      }
      
      setRooms(fetchedRooms);
      setFilteredRooms(fetchedRooms);
      setCurrentPage(1); // Reset về trang 1 khi đổi rạp
    } catch (error: any) {
      if (error.response?.status !== 404) {
        toast.error('Không thể tải danh sách phòng chiếu cho rạp này.');
      }
      setRooms([]);
      setFilteredRooms([]);
      console.error(`Error fetching rooms for cinema ${cinemaId}:`, error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCinemaId) {
      fetchRoomsForCinema(Number(selectedCinemaId));
    }
  }, [selectedCinemaId]);

  // Filtering logic
  useEffect(() => {
    let tempRooms = [...rooms];

    if (searchTerm) {
      tempRooms = tempRooms.filter(room =>
        room.Room_Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.Cinema_Room_ID.toString().includes(searchTerm)
      );
    }
    if (statusFilter !== 'all') {
      // Cập nhật logic filter cho trạng thái mới
      if (statusFilter === 'active') {
        tempRooms = tempRooms.filter(room => room.Status.toLowerCase() === 'active');
      } else if (statusFilter === 'inactive') {
        tempRooms = tempRooms.filter(room =>
          room.Status.toLowerCase() === 'inactive' ||
          room.Status.toLowerCase() === 'maintenance' ||
          room.Status.toLowerCase() === 'closed' ||
          room.Status.toLowerCase() === 'deleted'
        );
      }
    }
    if (typeFilter !== 'all') {
      tempRooms = tempRooms.filter(room => room.Room_Type === typeFilter);
    }

    setFilteredRooms(tempRooms);
    setCurrentPage(1); // Reset về trang 1 khi filter
  }, [searchTerm, statusFilter, typeFilter, rooms]);

  // Phân trang
  const paginatedRooms = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredRooms.slice(startIndex, endIndex);
  }, [filteredRooms, currentPage]);

  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);

  // Pagination handlers
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

  // Excel headers
  const excelHeaders = {
    Cinema_Room_ID: 'ID phòng',
    Room_Name: 'Tên phòng',
    Room_Type: 'Loại phòng',
    Seat_Quantity: 'Số ghế',
    Status: 'Trạng thái',
    Cinema_Name: 'Rạp chiếu'
  };

  // Xử lý dữ liệu xuất Excel
  const roomsForExport = useMemo(() => {
    const cinema = cinemas.find(c => c.Cinema_ID.toString() === selectedCinemaId);
    return rooms.map(room => ({
      Cinema_Room_ID: room.Cinema_Room_ID,
      Room_Name: room.Room_Name,
      Room_Type: room.Room_Type,
      Seat_Quantity: room.Seat_Quantity,
      Status: room.Status,
      Cinema_Name: cinema?.Cinema_Name || ''
    }));
  }, [rooms, cinemas, selectedCinemaId]);

  // Xử lý import dữ liệu từ Excel
  const handleImportRooms = async (importedData: any[]) => {
    if (!importedData || importedData.length === 0) {
      toast.error('Không có dữ liệu phòng chiếu để nhập');
      return;
    }

    setImportLoading(true);
    const toastId = toast.loading('Đang nhập dữ liệu phòng chiếu...');

    try {
      // Làm mới danh sách phòng chiếu
      if (selectedCinemaId) {
        fetchRoomsForCinema(Number(selectedCinemaId));
      }

      toast.success(`Đã nhập dữ liệu phòng chiếu thành công!`, { id: toastId });
    } catch (error) {
      console.error('Import rooms error:', error);
      toast.error('Nhập dữ liệu phòng chiếu thất bại', { id: toastId });
    } finally {
      setImportLoading(false);
    }
  };

  const handleCinemaTabClick = (cinemaId: number) => {
    setSearchTerm('');
    setStatusFilter('all');
    setTypeFilter('all');
    setSearchParams({ cinemaId: cinemaId.toString() });
  };

  const handleDeleteRoom = async (roomId: number, roomName: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa phòng "${roomName}"?`)) {
      const toastId = toast.loading(`Đang xóa phòng ${roomName}...`);
      try {
        await cinemaRoomService.deleteCinemaRoom(roomId);
        toast.success(`Đã xóa phòng ${roomName}`, { id: toastId });
        // Refresh the room list
        if (selectedCinemaId) {
          fetchRoomsForCinema(Number(selectedCinemaId));
        }
      } catch (error) {
        toast.error('Không thể xóa phòng chiếu.', { id: toastId });
        console.error('Error deleting room:', error);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      Active: {
        bg: 'bg-green-500/20',
        text: 'text-green-400',
        border: 'border-green-500/50',
        label: 'Hoạt động'
      },
      Maintenance: {
        bg: 'bg-red-500/20',
        text: 'text-red-400',
        border: 'border-red-500/50',
        label: 'Không hoạt động'
      },
      Closed: {
        bg: 'bg-red-500/20',
        text: 'text-red-400',
        border: 'border-red-500/50',
        label: 'Không hoạt động'
      },
      Inactive: {
        bg: 'bg-red-500/20',
        text: 'text-red-400',
        border: 'border-red-500/50',
        label: 'Không hoạt động'
      },
      Deleted: {
        bg: 'bg-red-500/20',
        text: 'text-red-400',
        border: 'border-red-500/50',
        label: 'Không hoạt động'
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.Inactive;

    return (
      <span
        className={`px-3 py-1 text-xs font-semibold rounded-full border ${config.bg} ${config.text} ${config.border} backdrop-blur-md shadow-lg`}
      >
        {config.label}
      </span>
    );
  };

  const getRoomTypeIcon = (type: string) => {
    switch (type) {
      case 'VIP':
        return '👑';
      case 'IMAX':
        return '🎬';
      case '3D':
        return '🥽';
      default:
        return '🎭';
    }
  };

  const selectedCinema = cinemas.find(c => c.Cinema_ID.toString() === selectedCinemaId);

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
            <p className="text-slate-400 text-lg">Đang tải danh sách phòng chiếu...</p>
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
              <CogIcon className="w-8 h-8" />
              Quản lý phòng chiếu
            </h1>
            <p className="text-slate-400 mt-2">
              {isAdmin 
                ? 'Quản lý các phòng chiếu tại các rạp'
                : `Quản lý phòng chiếu tại ${managerCinema?.Cinema_Name || 'rạp của bạn'}`
              }
            </p>
          </div>
          <div className="flex gap-3">
            <ExcelImportExport
              data={roomsForExport}
              onImport={handleImportRooms}
              fileName="cinema-rooms-list"
              sheetName="Phòng chiếu"
              headers={excelHeaders}
              disabled={loading || importLoading || !selectedCinemaId}
              useApi={true}
              apiType="cinemas"
              cinemaId={selectedCinemaId ? Number(selectedCinemaId) : undefined}
            />
            <Link
              to={`/admin/cinema-rooms/new?cinemaId=${selectedCinemaId || (managerCinema?.Cinema_ID || '')}`}
              className="px-6 py-3 text-black rounded-xl transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-2xl font-semibold"
              style={{
                backgroundColor: '#FFD875',
                boxShadow: '0 4px 20px rgba(255, 216, 117, 0.4), 0 0 40px rgba(255, 216, 117, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 6px 25px rgba(255, 216, 117, 0.5), 0 0 50px rgba(255, 216, 117, 0.3)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(255, 216, 117, 0.4), 0 0 40px rgba(255, 216, 117, 0.2)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <PlusIcon className="w-5 h-5" />
              Thêm phòng chiếu
            </Link>
          </div>
        </motion.div>

        {/* Cinema Tabs - Chỉ hiển thị cho Admin */}
        {isAdmin && (
        <motion.div
          className="mb-8 bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 shadow-lg"
          style={{ boxShadow: '0 0 40px rgba(255, 216, 117, 0.1)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center overflow-x-auto gap-2">
            {cinemas.map((cinema) => (
              <button
                key={cinema.Cinema_ID}
                onClick={() => handleCinemaTabClick(cinema.Cinema_ID)}
                className={`px-6 py-3 text-sm font-semibold transition-all duration-300 whitespace-nowrap rounded-xl border ${selectedCinemaId === cinema.Cinema_ID.toString()
                  ? 'bg-[#FFD875] text-black border-[#FFD875] shadow-lg'
                  : 'bg-slate-700/50 text-gray-300 border-slate-600/50 hover:bg-slate-600/50 hover:text-[#FFD875] hover:border-[#FFD875]/50'
                  }`}
                style={selectedCinemaId === cinema.Cinema_ID.toString() ? {
                  boxShadow: '0 4px 15px rgba(255, 216, 117, 0.4)'
                } : {}}
              >
                <HomeIcon className="w-4 h-4 inline mr-2" />
                {cinema.Cinema_Name}
              </button>
            ))}
          </div>
        </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Filters */}
          <div className="mb-8 bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 shadow-lg" style={{ boxShadow: '0 0 40px rgba(255, 216, 117, 0.1)' }}>
            <div className="flex flex-wrap gap-4">
              {/* Search */}
              <div className="flex-1 min-w-[300px]">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm phòng chiếu hoặc ID..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-700/70 backdrop-blur-md text-white rounded-xl border border-slate-600 focus:border-[#FFD875] focus:outline-none focus:ring-2 focus:ring-[#FFD875]/30 transition-all duration-300"
                  />
                </div>
              </div>
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-slate-700/70 backdrop-blur-md text-white px-4 py-3 rounded-xl border border-slate-600 focus:border-[#FFD875] focus:outline-none focus:ring-2 focus:ring-[#FFD875]/30 transition-all duration-300"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Hoạt động</option>
                <option value="inactive">Không hoạt động</option>
              </select>
              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="bg-slate-700/70 backdrop-blur-md text-white px-4 py-3 rounded-xl border border-slate-600 focus:border-[#FFD875] focus:outline-none focus:ring-2 focus:ring-[#FFD875]/30 transition-all duration-300"
              >
                <option value="all">Tất cả loại</option>
                <option value="2D">2D</option>
                <option value="3D">3D</option>
                <option value="IMAX">IMAX</option>
                <option value="VIP">VIP</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl overflow-hidden border border-slate-700/50 shadow-lg" style={{ boxShadow: '0 0 40px rgba(255, 216, 117, 0.1)' }}>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-700/50">
                <thead className="bg-slate-700/50 backdrop-blur-md">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-[#FFD875] uppercase tracking-wider">
                      ID
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-[#FFD875] uppercase tracking-wider">
                      Tên phòng
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-[#FFD875] uppercase tracking-wider">
                      Loại phòng
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-[#FFD875] uppercase tracking-wider">
                      Sức chứa
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-[#FFD875] uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-[#FFD875] uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {paginatedRooms.length > 0 ? (
                    paginatedRooms.map((room, index) => (
                      <motion.tr
                        key={`room-${room.Cinema_Room_ID || index}`}
                        className="hover:bg-slate-700/30 transition-all duration-300"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-[#FFD875]">#{room.Cinema_Room_ID}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gradient-to-br from-[#FFD875]/20 to-[#FFD875]/10 flex items-center justify-center border border-[#FFD875]/30">
                              <CogIcon className="h-7 w-7 text-[#FFD875]" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-semibold text-white">{room.Room_Name}</div>
                              <div className="text-sm text-slate-400">Phòng chiếu {room.Cinema_Room_ID}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-2xl mr-2">{getRoomTypeIcon(room.Room_Type)}</span>
                            <span className={`font-semibold ${room.Room_Type === 'VIP' ? 'text-[#FFD875]' :
                              room.Room_Type === 'IMAX' ? 'text-purple-400' :
                                room.Room_Type === '3D' ? 'text-blue-400' :
                                  'text-white'
                              }`}>
                              {room.Room_Type}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-white font-semibold text-lg">{room.Seat_Quantity}</div>
                          <div className="text-[#FFD875] text-sm">ghế</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(room.Status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex justify-center items-center gap-2">
                            <Link
                              to={`/admin/cinema-rooms/${room.Cinema_Room_ID}?cinemaId=${selectedCinemaId}`}
                              className="p-2 bg-slate-700/70 backdrop-blur-md text-gray-300 hover:text-[#FFD875] rounded-lg transition-all duration-300 border border-slate-600/50"
                              title="Chỉnh sửa"
                            >
                              <PencilSquareIcon className="w-4 h-4" />
                            </Link>
                            <Link
                              to={`/admin/cinema-rooms/${room.Cinema_Room_ID}/seats?cinemaId=${selectedCinemaId}`}
                              className="p-2 bg-slate-700/70 backdrop-blur-md text-gray-300 hover:text-blue-400 rounded-lg transition-all duration-300 border border-slate-600/50"
                              title="Cấu hình sơ đồ ghế"
                            >
                              <MapIcon className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDeleteRoom(room.Cinema_Room_ID, room.Room_Name)}
                              className="p-2 bg-slate-700/70 backdrop-blur-md text-gray-300 hover:text-red-400 rounded-lg transition-all duration-300 border border-slate-600/50"
                              title="Xóa"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <CogIcon className="h-16 w-16 text-slate-600 mb-4" />
                          <p className="text-slate-400 text-lg mb-2">
                            {rooms.length === 0 ? `Rạp "${selectedCinema?.Cinema_Name}" chưa có phòng chiếu nào` : 'Không tìm thấy phòng chiếu nào khớp với bộ lọc'}
                          </p>
                          {rooms.length === 0 && (
                            <Link
                              to={`/admin/cinema-rooms/new?cinemaId=${selectedCinemaId}`}
                              className="mt-2 text-[#FFD875] hover:text-[#e5c368] transition-colors font-medium"
                            >
                              Thêm phòng chiếu ngay
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 flex items-center justify-between border-t border-slate-700/50 bg-slate-700/20 backdrop-blur-md">
                <div className="text-sm text-slate-300">
                  Hiển thị <span className="font-semibold text-[#FFD875]">{((currentPage - 1) * itemsPerPage) + 1}</span> - <span className="font-semibold text-[#FFD875]">{Math.min(currentPage * itemsPerPage, filteredRooms.length)}</span> trong tổng số <span className="font-semibold text-[#FFD875]">{filteredRooms.length}</span> phòng
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 bg-slate-700/70 text-white rounded-lg hover:bg-slate-600/70 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                  </button>

                  {generatePageNumbers().map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded-lg transition-all duration-300 font-medium ${page === currentPage
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
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 bg-slate-700/70 text-white rounded-lg hover:bg-slate-600/70 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
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
        `
      }} />
    </div>
  );
};

export default CinemaRoomsList;


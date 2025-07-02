x// src/pages/admin/ShowtimeManagement.tsx
import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  ClockIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';
import { ShowtimeWithDetails, ShowtimeFormData } from '../../types/showtime';
import ShowtimeForm from '../../components/admin/forms/ShowtimeForm';
import DataTable from '../../components/admin/common/DataTable';
import ConfirmDialog from '../../components/admin/common/ConfirmDialog';
import { formatDate, formatTime, formatCurrency } from '../../utils/dashboardUtils';

const ShowtimeManagement: React.FC = () => {
  const [showtimes, setShowtimes] = useState<ShowtimeWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedShowtime, setSelectedShowtime] = useState<ShowtimeWithDetails | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cinemaFilter, setCinemaFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showtimeToDelete, setShowtimeToDelete] = useState<ShowtimeWithDetails | null>(null);
  const [selectedShowtimes, setSelectedShowtimes] = useState<string[]>([]);

  // Mock data
  useEffect(() => {
    fetchShowtimes();
  }, []);

  const fetchShowtimes = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockShowtimes: ShowtimeWithDetails[] = [
        {
          id: '1',
          movieId: '1',
          cinemaId: '1',
          roomId: '1',
          startTime: new Date('2024-01-15T14:30:00'),
          endTime: new Date('2024-01-15T17:45:00'),
          price: 80000,
          vipPrice: 120000,
          couplePrice: 200000,
          availableSeats: 95,
          totalSeats: 120,
          bookedSeats: ['A1', 'A2', 'B5'],
          status: 'scheduled',
          specialOffers: ['Giảm 20% cho học sinh'],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          movie: {
            title: 'Avatar: The Way of Water',
            duration: 192,
            poster: '/api/placeholder/300/450',
          },
          cinema: {
            name: 'CGV Vincom Center',
            address: '72 Lê Thánh Tôn, Q1, TP.HCM',
          },
          room: {
            name: 'Phòng 1',
            capacity: 120,
            roomType: 'standard',
          },
        },
        {
          id: '2',
          movieId: '2',
          cinemaId: '1',
          roomId: '2',
          startTime: new Date('2024-01-15T19:00:00'),
          endTime: new Date('2024-01-15T21:15:00'),
          price: 90000,
          vipPrice: 140000,
          couplePrice: 220000,
          availableSeats: 65,
          totalSeats: 80,
          bookedSeats: ['A1', 'A2'],
          status: 'scheduled',
          specialOffers: [],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          movie: {
            title: 'Top Gun: Maverick',
            duration: 130,
            poster: '/api/placeholder/300/450',
          },
          cinema: {
            name: 'CGV Vincom Center',
            address: '72 Lê Thánh Tôn, Q1, TP.HCM',
          },
          room: {
            name: 'Phòng VIP',
            capacity: 80,
            roomType: 'vip',
          },
        },
        {
          id: '3',
          movieId: '1',
          cinemaId: '2',
          roomId: '3',
          startTime: new Date('2024-01-14T20:30:00'),
          endTime: new Date('2024-01-14T23:45:00'),
          price: 100000,
          vipPrice: 150000,
          couplePrice: 250000,
          availableSeats: 180,
          totalSeats: 200,
          bookedSeats: ['A1'],
          status: 'completed',
          specialOffers: ['IMAX Experience'],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          movie: {
            title: 'Avatar: The Way of Water',
            duration: 192,
            poster: '/api/placeholder/300/450',
          },
          cinema: {
            name: 'Lotte Cinema Diamond Plaza',
            address: '34 Lê Duẩn, Q1, TP.HCM',
          },
          room: {
            name: 'Phòng IMAX',
            capacity: 200,
            roomType: 'imax',
          },
        },
      ];
      
      setShowtimes(mockShowtimes);
    } catch (error) {
      console.error('Error fetching showtimes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShowtime = () => {
    setSelectedShowtime(undefined);
    setShowForm(true);
  };

  const handleEditShowtime = (showtime: ShowtimeWithDetails) => {
    setSelectedShowtime(showtime);
    setShowForm(true);
  };

  const handleDeleteShowtime = (showtime: ShowtimeWithDetails) => {
    setShowtimeToDelete(showtime);
    setShowDeleteDialog(true);
  };

  const handleDuplicateShowtime = (showtime: ShowtimeWithDetails) => {
    const duplicatedShowtime = {
      ...showtime,
      id: undefined,
      startTime: new Date(showtime.startTime.getTime() + 24 * 60 * 60 * 1000), // Next day
      endTime: new Date(showtime.endTime.getTime() + 24 * 60 * 60 * 1000),
      status: 'scheduled' as const,
      availableSeats: showtime.totalSeats,
      bookedSeats: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setSelectedShowtime(duplicatedShowtime);
    setShowForm(true);
  };

  const handleSubmitForm = async (data: ShowtimeFormData) => {
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (selectedShowtime) {
        // Update existing showtime
        setShowtimes(prev => prev.map(showtime => 
          showtime.id === selectedShowtime.id 
            ? { 
                ...showtime, 
                ...data,
                endTime: data.startTime ? new Date(data.startTime.getTime() + 3 * 60 * 60 * 1000) : showtime.endTime, // Mock calculation
                updatedAt: new Date() 
              }
            : showtime
        ));
      } else {
        // Create new showtime
        const newShowtime: ShowtimeWithDetails = {
          ...data,
          id: Date.now().toString(),
          endTime: data.startTime ? new Date(data.startTime.getTime() + 3 * 60 * 60 * 1000) : new Date(), // Mock calculation
          availableSeats: 120, // Mock value
          totalSeats: 120,
          bookedSeats: [],
          status: 'scheduled',
          createdAt: new Date(),
          updatedAt: new Date(),
          movie: {
            title: 'Mock Movie',
            duration: 120,
            poster: '/api/placeholder/300/450',
          },
          cinema: {
            name: 'Mock Cinema',
            address: 'Mock Address',
          },
          room: {
            name: 'Mock Room',
            capacity: 120,
            roomType: 'standard',
          },
        } as ShowtimeWithDetails;
        setShowtimes(prev => [newShowtime, ...prev]);
      }
      
      setShowForm(false);
      setSelectedShowtime(undefined);
    } catch (error) {
      console.error('Error saving showtime:', error);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (showtimeToDelete) {
      try {
        setLoading(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setShowtimes(prev => prev.filter(showtime => showtime.id !== showtimeToDelete.id));
        setShowDeleteDialog(false);
        setShowtimeToDelete(null);
      } catch (error) {
        console.error('Error deleting showtime:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedShowtimes.length === 0) return;
    
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setShowtimes(prev => prev.filter(showtime => !selectedShowtimes.includes(showtime.id)));
      setSelectedShowtimes([]);
    } catch (error) {
      console.error('Error bulk deleting showtimes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredShowtimes = showtimes.filter(showtime => {
    const matchesSearch = showtime.movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         showtime.cinema.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         showtime.room.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || showtime.status === statusFilter;
    
    const matchesCinema = cinemaFilter === 'all' || showtime.cinemaId === cinemaFilter;
    
    const matchesDate = !dateFilter || 
                       formatDate(showtime.startTime) === formatDate(new Date(dateFilter));
    
    return matchesSearch && matchesStatus && matchesCinema && matchesDate;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'scheduled': { label: 'Đã lên lịch', className: 'bg-blue-100 text-blue-800' },
      'ongoing': { label: 'Đang chiếu', className: 'bg-green-100 text-green-800' },
      'completed': { label: 'Đã hoàn thành', className: 'bg-gray-100 text-gray-800' },
      'cancelled': { label: 'Đã hủy', className: 'bg-red-100 text-red-800' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const getRoomTypeBadge = (roomType: string) => {
    const typeConfig = {
      'standard': { label: 'Thường', className: 'bg-gray-100 text-gray-800' },
      'vip': { label: 'VIP', className: 'bg-yellow-100 text-yellow-800' },
      'imax': { label: 'IMAX', className: 'bg-purple-100 text-purple-800' },
      '4dx': { label: '4DX', className: 'bg-red-100 text-red-800' },
    };
    
    const config = typeConfig[roomType as keyof typeof typeConfig];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const columns = [
    {
      key: 'movie',
      title: 'Phim',
      render: (showtime: ShowtimeWithDetails) => (
        <div className="flex items-center space-x-3">
          <img
            src={showtime.movie.poster}
            alt={showtime.movie.title}
            className="w-12 h-16 object-cover rounded"
          />
          <div>
            <div className="font-medium text-white">{showtime.movie.title}</div>
            <div className="text-sm text-gray-400">{showtime.movie.duration} phút</div>
          </div>
        </div>
      ),
    },
    {
      key: 'cinema',
      title: 'Rạp & Phòng',
      render: (showtime: ShowtimeWithDetails) => (
        <div>
          <div className="font-medium text-white">{showtime.cinema.name}</div>
          <div className="text-sm text-gray-400 flex items-center space-x-2">
            <span>{showtime.room.name}</span>
            {getRoomTypeBadge(showtime.room.roomType)}
          </div>
        </div>
      ),
    },
    {
      key: 'schedule',
      title: 'Lịch chiếu',
      render: (showtime: ShowtimeWithDetails) => (
        <div>
          <div className="font-medium text-white">{formatDate(showtime.startTime)}</div>
          <div className="text-sm text-gray-400">
            {formatTime(showtime.startTime)} - {formatTime(showtime.endTime)}
          </div>
        </div>
      ),
    },
    {
      key: 'pricing',
      title: 'Giá vé',
      render: (showtime: ShowtimeWithDetails) => (
        <div className="text-sm">
          <div className="text-white">Thường: {formatCurrency(showtime.price)}</div>
          <div className="text-gray-400">VIP: {formatCurrency(showtime.vipPrice)}</div>
          <div className="text-gray-400">Đôi: {formatCurrency(showtime.couplePrice)}</div>
        </div>
      ),
    },
    {
      key: 'seats',
      title: 'Ghế',
      render: (showtime: ShowtimeWithDetails) => {
        const occupancyRate = ((showtime.totalSeats - showtime.availableSeats) / showtime.totalSeats * 100).toFixed(1);
        return (
          <div>
            <div className="text-white font-medium">
              {showtime.availableSeats}/{showtime.totalSeats}
            </div>
            <div className="text-sm text-gray-400">
              Đã bán: {occupancyRate}%
            </div>
            <div className="w-full bg-slate-600 rounded-full h-2 mt-1">
              <div 
                className="bg-yellow-500 h-2 rounded-full" 
                style={{ width: `${100 - (showtime.availableSeats / showtime.totalSeats * 100)}%` }}
              ></div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'status',
      title: 'Trạng thái',
      render: (showtime: ShowtimeWithDetails) => getStatusBadge(showtime.status),
    },
    {
      key: 'offers',
      title: 'Ưu đãi',
      render: (showtime: ShowtimeWithDetails) => (
        <div className="flex flex-wrap gap-1">
          {showtime.specialOffers.length > 0 ? (
            showtime.specialOffers.slice(0, 2).map((offer, index) => (
              <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                {offer.length > 15 ? `${offer.substring(0, 15)}...` : offer}
              </span>
            ))
          ) : (
            <span className="text-gray-400 text-xs">Không có</span>
          )}
          {showtime.specialOffers.length > 2 && (
            <span className="px-2 py-1 bg-slate-600 text-white rounded text-xs">
              +{showtime.specialOffers.length - 2}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      title: 'Thao tác',
      render: (showtime: ShowtimeWithDetails) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleEditShowtime(showtime)}
            className="p-1 text-blue-400 hover:text-blue-300"
            title="Chỉnh sửa"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDuplicateShowtime(showtime)}
            className="p-1 text-green-400 hover:text-green-300"
            title="Nhân bản"
          >
            <DocumentDuplicateIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteShowtime(showtime)}
            className="p-1 text-red-400 hover:text-red-300"
            title="Xóa"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  if (showForm) {
    return (
      <ShowtimeForm
        showtime={selectedShowtime}
        onSubmit={handleSubmitForm}
        onCancel={() => {
          setShowForm(false);
          setSelectedShowtime(undefined);
        }}
        loading={loading}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Quản lý suất chiếu</h1>
          <p className="text-gray-400">Quản lý lịch chiếu phim trong hệ thống</p>
        </div>
        <button
          onClick={handleCreateShowtime}
          className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Thêm suất chiếu</span>
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-800 rounded-lg p-6">
          <div className="flex items-center">
            <CalendarDaysIcon className="w-8 h-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Hôm nay</p>
              <p className="text-2xl font-bold text-white">
                {filteredShowtimes.filter(s => formatDate(s.startTime) === formatDate(new Date())).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6">
          <div className="flex items-center">
            <ClockIcon className="w-8 h-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Đang chiếu</p>
              <p className="text-2xl font-bold text-white">
                {filteredShowtimes.filter(s => s.status === 'ongoing').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">%</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Tỷ lệ lấp đầy</p>
              <p className="text-2xl font-bold text-white">
                {filteredShowtimes.length > 0 
                  ? Math.round(filteredShowtimes.reduce((acc, s) => acc + ((s.totalSeats - s.availableSeats) / s.totalSeats), 0) / filteredShowtimes.length * 100)
                  : 0}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">₫</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Doanh thu dự kiến</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(
                  filteredShowtimes.reduce((acc, s) => 
                    acc + (s.totalSeats - s.availableSeats) * s.price, 0
                  )
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-800 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm..."
              className="w-full bg-slate-700 text-white rounded-lg pl-10 pr-4 py-2 border border-slate-600 focus:border-yellow-500 focus:outline-none"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-yellow-500 focus:outline-none"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="scheduled">Đã lên lịch</option>
            <option value="ongoing">Đang chiếu</option>
            <option value="completed">Đã hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
          </select>

          {/* Cinema Filter */}
          <select
            value={cinemaFilter}
            onChange={(e) => setCinemaFilter(e.target.value)}
            className="bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-yellow-500 focus:outline-none"
          >
            <option value="all">Tất cả rạp</option>
            <option value="1">CGV Vincom Center</option>
            <option value="2">Lotte Cinema Diamond Plaza</option>
          </select>

          {/* Date Filter */}
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-yellow-500 focus:outline-none"
          />

          {/* Bulk Actions */}
          {selectedShowtimes.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Xóa ({selectedShowtimes.length})
            </button>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-slate-800 rounded-lg">
        <DataTable
          data={filteredShowtimes}
          columns={columns}
          loading={loading}
          selectable
          selectedRows={selectedShowtimes}
          onSelectionChange={setSelectedShowtimes}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
          }}
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="Xác nhận xóa suất chiếu"
        message={`Bạn có chắc chắn muốn xóa suất chiếu "${showtimeToDelete?.movie.title}" lúc ${showtimeToDelete ? formatTime(showtimeToDelete.startTime) : ''}? Thao tác này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        type="danger"
      />
    </div>
  );
};

export default ShowtimeManagement;


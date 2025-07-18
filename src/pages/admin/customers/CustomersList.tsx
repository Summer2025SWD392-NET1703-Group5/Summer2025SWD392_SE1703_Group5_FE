import React, { useState, useEffect } from 'react';
import {
  TrashIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  StarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import api from '../../../config/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import ActionButtons, { AddButton } from '../../../components/admin/common/ActionButtons';
import { useAuth } from '../../../contexts/SimpleAuthContext';
import { cinemaService } from '../../../services/cinemaService';

interface User {
  User_ID: number;
  Full_Name: string;
  Email: string;
  Phone_Number: string;
  Address: string | null;
  Date_Of_Birth: string;
  Sex: string;
  Role: string;
  Account_Status: string;
  Last_Login: string | null;
  Is_Deleted?: boolean;
  total_points: number;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  points: number;
  totalSpent: number;
  lastVisit: Date;
  bookingsCount: number;
  rating: number | null;
  status: string;
  isDeleted: boolean;
}

interface UserPoints {
  user_id: number;
  total_points: number;
}

const CustomersList: React.FC = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Fetch users from API
  useEffect(() => {
    if (user) {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      let userData: User[] = [];

      if (user?.role === 'Admin') {
        const response = await api.get('/user');
        userData = response.data;
      } else if (user?.role === 'Manager') {
        const myCinema = await cinemaService.getManagerCinema();
        if (myCinema && myCinema.Cinema_ID) {
          const staff = await cinemaService.getCinemaStaff(myCinema.Cinema_ID);
          // Ánh xạ dữ liệu nhân viên sang định dạng User chung
          userData = staff.map(s => ({
            User_ID: s.User_ID,
            Full_Name: s.Name || '',
            Email: s.Email,
            Phone_Number: '',
            Address: null,
            Date_Of_Birth: '',
            Sex: '',
            Role: 'Staff',
            Account_Status: 'Active',
            Last_Login: null,
            Is_Deleted: false,
            total_points: 0
          }));
        }
      }

      const customersData = await Promise.all(
        userData.map(async (u) => {
          let points = 0;
          try {
            // Chỉ lấy điểm cho role Customer
            if (u.Role === 'Customer') {
              const pointsResponse = await api.get<UserPoints>(`/points/users/${u.User_ID}`);
              points = pointsResponse.data.total_points;
            }
          } catch (error) {
            // Bỏ qua lỗi nếu không tìm thấy điểm
          }

          return {
            id: u.User_ID.toString(),
            name: u.Full_Name,
            email: u.Email,
            phone: u.Phone_Number,
            role: u.Role,
            points: points,
            totalSpent: getRandomSpent(),
            lastVisit: u.Last_Login ? new Date(u.Last_Login) : new Date(),
            bookingsCount: Math.floor(Math.random() * 30),
            rating: Math.random() > 0.2 ? Math.floor(Math.random() * 5) + 1 : null,
            status: u.Account_Status,
            isDeleted: u.Is_Deleted || false,
          };
        })
      );

      setCustomers(customersData);
    } catch (error) {
      console.error('Error fetching data:', error);
      if (user?.role !== 'Manager') {
        toast.error('Không thể tải dữ liệu.');
      }
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to generate random spent amount (placeholder)
  const getRandomSpent = (): number => {
    return 500000 + Math.floor(Math.random() * 3000000);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-500/10 text-green-400 border border-green-500/30';
      case 'inactive':
        return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30';
      case 'pending':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/30';
      default:
        return 'bg-slate-600/20 text-slate-300 border border-slate-500/30';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'Hoạt động';
      case 'inactive':
        return 'Không hoạt động';
      case 'pending':
        return 'Đang chờ';
      case 'deleted':
        return 'Đã xóa';
      default:
        return status;
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm);

    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'deleted' ? customer.isDeleted :
        (statusFilter === customer.status.toLowerCase() && !customer.isDeleted));

    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalItems = filteredCustomers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);

  // Reset to first page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Pagination handlers
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

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

  const handleDeleteCustomer = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa khách hàng này?')) {
      const toastId = toast.loading('Đang xóa khách hàng...');
      try {
        await api.delete(`/user/${id}`);
        toast.success('Đã xóa khách hàng thành công', { id: toastId });
        setCustomers(customers.map(c =>
          c.id === id ? { ...c, isDeleted: true, status: 'Deleted' } : c
        ));
      } catch (error) {
        toast.error('Không thể xóa khách hàng', { id: toastId });
        console.error('Error deleting customer:', error);
      }
    }
  };

  const handleRestoreCustomer = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn khôi phục khách hàng này?')) {
      const toastId = toast.loading('Đang khôi phục khách hàng...');
      try {
        await api.put(`/user/${id}/restore`);
        toast.success('Đã khôi phục khách hàng thành công', { id: toastId });
        setCustomers(customers.map(c =>
          c.id === id ? { ...c, isDeleted: false, status: 'Active' } : c
        ));
      } catch (error) {
        toast.error('Không thể khôi phục khách hàng', { id: toastId });
        console.error('Error restoring customer:', error);
      }
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus.toLowerCase() === 'active' ? 'inactive' : 'active';

    try {
      await api.put(`/user/${id}/status`, { status: newStatus });
      toast.success(`Đã ${newStatus === 'active' ? 'kích hoạt' : 'vô hiệu hóa'} tài khoản`);

      // Update local state
      const updatedCustomers = customers.map(c =>
        c.id === id ? { ...c, status: newStatus } : c
      );
      setCustomers(updatedCustomers);
      if (selectedCustomer?.id === id) {
        setSelectedCustomer({ ...selectedCustomer, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Không thể cập nhật trạng thái khách hàng');
    }
  };

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
    if (selectedCustomer) {
      const updatedCustomers = customers.map(c =>
        c.id === selectedCustomer.id ? { ...c, rating: newRating } : c
      );
      setCustomers(updatedCustomers);
      setSelectedCustomer({ ...selectedCustomer, rating: newRating });
    }
  };

  const handleRefresh = async () => {
    await fetchUsers();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCustomer(null);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6">
      {/* Header */}
      <motion.div
        className="mb-8 flex flex-wrap items-center justify-between gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-[#FFD875]">Quản lý người dùng</h1>
          <p className="mt-2 text-slate-400">Xem và quản lý thông tin người dùng trong hệ thống.</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleRefresh}
            className="flex items-center justify-center px-4 py-2 bg-slate-700/70 text-white rounded-lg hover:bg-slate-600/70 transition-colors duration-300"
            title="Làm mới danh sách"
          >
            <ArrowPathIcon className="h-5 w-5" />
          </button>
          {user?.role === 'Admin' && (
            <AddButton to="/admin/customers/new" label="người dùng mới" />
          )}
        </div>
      </motion.div>

      {/* Search and filter bar */}
      <div className="bg-slate-800 rounded-2xl p-4 mb-6 border border-slate-700">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Tìm theo tên, email hoặc số điện thoại..."
              className="bg-slate-700/50 text-white pl-11 pr-4 py-3 rounded-lg border border-slate-600 focus:border-[#FFD875] focus:outline-none focus:ring-1 focus:ring-[#FFD875]/50 w-full transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="bg-slate-700/50 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-[#FFD875] focus:outline-none focus:ring-1 focus:ring-[#FFD875]/50 transition-all"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Không hoạt động</option>
            <option value="deleted">Đã xóa</option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <motion.div
        className="bg-slate-800/50 backdrop-blur-md rounded-2xl shadow-lg border border-slate-700/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-700">
            {/* Table Header */}
            <thead className="bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Khách hàng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Vai trò</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Điểm</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-700/50">
              {loading ? (
                <tr><td colSpan={7} className="text-center p-12 text-slate-400">Đang tải dữ liệu...</td></tr>
              ) : paginatedCustomers.length > 0 ? (
                <AnimatePresence>
                  {paginatedCustomers.map((customer) => (
                    <motion.tr
                      key={customer.id}
                      className="hover:bg-slate-700/40 transition-colors duration-200"
                      layout
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      {/* ID */}
                      <td className="px-6 py-4 font-semibold text-[#FFD875]" style={{ textShadow: '0 0 10px rgba(255, 216, 117, 0.3)' }}>
                        {customer.id}
                      </td>

                      {/* Customer */}
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-[#FFD875]/20 to-transparent border border-[#FFD875]/30 flex items-center justify-center">
                            <span className="font-bold text-[#FFD875]">{customer.name.charAt(0).toUpperCase()}</span>
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-white">{customer.name}</div>
                            <div className="text-sm text-slate-400">{customer.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4 text-slate-300">{customer.role}</td>

                      {/* Points */}
                      <td className="px-6 py-4 font-semibold text-white">{customer.points.toLocaleString()}</td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(customer.isDeleted ? 'deleted' : customer.status)}`}>
                          {getStatusLabel(customer.isDeleted ? 'deleted' : customer.status)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {user?.role === 'Admin' ? (
                            <>
                              <ActionButtons
                                onView={() => handleViewCustomer(customer)}
                                editLink={`/admin/customers/${customer.id}`}
                                onDelete={() => handleDeleteCustomer(customer.id)}
                                hideDelete={customer.isDeleted}
                              />
                              {customer.isDeleted && (
                                <button
                                  onClick={() => handleRestoreCustomer(customer.id)}
                                  className="p-2 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500/20"
                                  title="Khôi phục"
                                >
                                  <ArrowPathIcon className="h-4 w-4" />
                                </button>
                              )}
                            </>
                          ) : (
                            <button
                              onClick={() => handleViewCustomer(customer)}
                              className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20"
                              title="Xem chi tiết"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              ) : (
                <tr><td colSpan={7} className="text-center p-12 text-slate-500">Không tìm thấy khách hàng.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="text-sm text-slate-400">
              Hiển thị <span className="font-semibold text-white">{paginatedCustomers.length}</span> trong tổng số <span className="font-semibold text-white">{totalItems}</span> khách hàng
            </div>
            <div className="flex gap-2">
              <button
                className="p-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </button>
              {generatePageNumbers().map((page) => (
                <button
                  key={page}
                  className={`px-3 py-1 rounded-lg transition-colors font-medium ${page === currentPage ? 'bg-[#FFD875] text-black' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
              <button
                className="p-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {isModalOpen && selectedCustomer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8">
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-20 w-20 rounded-full bg-gradient-to-br from-[#FFD875]/20 to-transparent border-2 border-[#FFD875]/30 flex items-center justify-center">
                    <span className="font-bold text-3xl text-[#FFD875]">{selectedCustomer.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="ml-6 flex-grow">
                    <h2 className="text-2xl font-bold text-white">{selectedCustomer.name}</h2>
                    <p className="text-sm text-slate-400 mb-3">ID: {selectedCustomer.id} &bull; {selectedCustomer.role}</p>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedCustomer.isDeleted ? 'deleted' : selectedCustomer.status)}`}>
                      {getStatusLabel(selectedCustomer.isDeleted ? 'deleted' : selectedCustomer.status)}
                    </span>
                  </div>
                  <button onClick={closeModal} className="text-slate-500 hover:text-white">
                    <XCircleIcon className="w-6 h-6" />
                  </button>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-700/50 p-4 rounded-lg">
                    <div className="text-sm text-slate-400">Email</div>
                    <div className="font-medium text-white">{selectedCustomer.email}</div>
                  </div>
                  <div className="bg-slate-700/50 p-4 rounded-lg">
                    <div className="text-sm text-slate-400">Số điện thoại</div>
                    <div className="font-medium text-white">{selectedCustomer.phone}</div>
                  </div>
                  <div className="bg-slate-700/50 p-4 rounded-lg">
                    <div className="text-sm text-slate-400">Điểm tích lũy</div>
                    <div className="font-bold text-xl text-[#FFD875]">{selectedCustomer.points.toLocaleString()}</div>
                  </div>
                  <div className="bg-slate-700/50 p-4 rounded-lg">
                    <div className="text-sm text-slate-400 mb-1">Đánh giá</div>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className={`${(hoverRating || rating) >= star ? 'text-[#FFD875]' : 'text-slate-600'} h-6 w-6 focus:outline-none transition-all`}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => handleRatingChange(star)}
                        >
                          <StarIcon className="h-5 w-5 fill-current" />
                        </button>
                      ))}
                      <span className="ml-2 text-sm text-slate-300">{rating > 0 ? `${rating} sao` : 'Chưa có'}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-700 flex justify-end gap-4">
                  {!selectedCustomer.isDeleted ? (
                    <>
                      <button
                        onClick={() => handleToggleStatus(selectedCustomer.id, selectedCustomer.status)}
                        className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all ${selectedCustomer.status.toLowerCase() === 'active' ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'}`}
                        disabled={user?.role !== 'Admin'}
                        title={user?.role !== 'Admin' ? 'Không có quyền' : (selectedCustomer.status.toLowerCase() === 'active' ? 'Vô hiệu hóa' : 'Kích hoạt')}
                      >
                        {selectedCustomer.status.toLowerCase() === 'active' ? (
                          <>
                            <XCircleIcon className="w-4 h-4" /> Vô hiệu hóa
                          </>
                        ) : (
                          <>
                            <CheckCircleIcon className="w-4 h-4" /> Kích hoạt
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          handleDeleteCustomer(selectedCustomer.id);
                          closeModal();
                        }}
                        className="px-4 py-2 rounded-lg font-semibold bg-slate-700 hover:bg-slate-600 text-white flex items-center gap-2 transition-all disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={user?.role !== 'Admin'}
                        title={user?.role !== 'Admin' ? 'Không có quyền' : 'Xóa'}
                      >
                        <TrashIcon className="w-4 h-4" /> Xóa
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        handleRestoreCustomer(selectedCustomer.id);
                        closeModal();
                      }}
                      className="px-4 py-2 rounded-lg font-semibold bg-green-500/10 text-green-400 hover:bg-green-500/20 flex items-center gap-2 transition-all disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={user?.role !== 'Admin'}
                      title={user?.role !== 'Admin' ? 'Không có quyền' : 'Khôi phục'}
                    >
                      <ArrowPathIcon className="w-4 h-4" /> Khôi phục
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomersList; 
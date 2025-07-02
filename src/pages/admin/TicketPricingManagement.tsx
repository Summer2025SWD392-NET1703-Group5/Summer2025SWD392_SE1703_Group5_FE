import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TicketIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  BuildingOfficeIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import ticketPricingService from '../../services/ticketPricingService';
import type { 
  TicketPricingGroup, 
  CreateTicketPricingRequest
} from '../../types/ticketPricing';
import toast from 'react-hot-toast';

const TicketPricingManagement: React.FC = () => {
  const [pricingGroups, setPricingGroups] = useState<TicketPricingGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [createForm, setCreateForm] = useState<CreateTicketPricingRequest>({
    Room_Type: '',
    Seat_Type: '',
    Base_Price: 0
  });
  const [editForm, setEditForm] = useState<CreateTicketPricingRequest>({
    Room_Type: '',
    Seat_Type: '',
    Base_Price: 0
  });

  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      await loadPricingGroups();
      setIsLoading(false);
    };
    
    initializeData();
  }, []);

  const loadPricingGroups = async () => {
    try {
      const groups = await ticketPricingService.getAllTicketPricings();
      setPricingGroups(groups);
    } catch (error: any) {
      toast.error(error.message || 'Không thể tải dữ liệu giá vé');
    }
  };

  const resetCreateForm = () => {
    setCreateForm({ Room_Type: '', Seat_Type: '', Base_Price: 0 });
  };

  const resetEditForm = () => {
    setEditForm({ Room_Type: '', Seat_Type: '', Base_Price: 0 });
    setSelectedItem(null);
  };



  const handleCreate = async () => {
    if (!createForm.Room_Type || !createForm.Seat_Type || !createForm.Base_Price || createForm.Base_Price <= 0) {
      toast.error('Vui lòng điền đầy đủ thông tin và giá vé phải lớn hơn 0');
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading('Đang tạo cấu hình giá vé...');
    
    try {
      await ticketPricingService.createTicketPricing(createForm);
      toast.dismiss(loadingToast);
      toast.success('Tạo cấu hình giá vé thành công!');
      setShowCreateModal(false);
      resetCreateForm();
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error(error.message || 'Có lỗi xảy ra khi tạo cấu hình giá vé');
    } finally {
      // Luôn refresh data dù thành công hay thất bại
      await loadPricingGroups();
      setIsLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedItem || !editForm.Base_Price) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading('Đang cập nhật cấu hình giá vé...');
    
    try {
      const id = ticketPricingService.generateId(selectedItem.Room_Type, selectedItem.Seat_Type);
      await ticketPricingService.updateTicketPricing(id, editForm);
      toast.dismiss(loadingToast);
      toast.success('Cập nhật cấu hình giá vé thành công!');
      setShowEditModal(false);
      resetEditForm();
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error(error.message || 'Có lỗi xảy ra khi cập nhật cấu hình giá vé');
    } finally {
      // Luôn refresh data dù thành công hay thất bại
      await loadPricingGroups();
      setIsLoading(false);
    }
  };

  const handleDelete = async (roomType: string, seatType: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa cấu hình giá vé này?')) return;

    setIsLoading(true);
    const loadingToast = toast.loading('Đang xóa cấu hình giá vé...');
    
    try {
      const id = ticketPricingService.generateId(roomType, seatType);
      await ticketPricingService.deleteTicketPricing(id);
      toast.dismiss(loadingToast);
      toast.success('Xóa cấu hình giá vé thành công!');
      
      // Xóa item khỏi state ngay lập tức để UI responsive
      setPricingGroups(prevGroups => 
        prevGroups.map(group => ({
          ...group,
          seat_types: group.seat_types.filter(seat => 
            !(group.room_type === roomType && seat.Seat_Type === seatType)
          )
        })).filter(group => group.seat_types.length > 0)
      );
      
    } catch (error: any) {
      toast.dismiss(loadingToast);
      console.error('Lỗi xóa cấu hình giá vé:', error);
      toast.error(error.message || 'Có lỗi xảy ra khi xóa cấu hình giá vé');
    } finally {
      // Refresh data để đảm bảo sync với server
      await loadPricingGroups();
      setIsLoading(false);
    }
  };

  const openEditModal = (group: any, seatType: any) => {
    setSelectedItem({ ...seatType, Room_Type: group.room_type });
    setEditForm({
      Room_Type: group.room_type,
      Seat_Type: seatType.Seat_Type,
      Base_Price: seatType.Base_Price
    });
    setShowEditModal(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <TicketIcon className="w-8 h-8 text-[#FFD875]" />
          <div>
            <h1 className="text-2xl font-bold text-white">Quản Lý Giá Vé</h1>
            <p className="text-gray-400">Cấu hình giá vé theo loại phòng và ghế</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              setIsLoading(true);
              loadPricingGroups().finally(() => setIsLoading(false));
            }}
            disabled={isLoading}
            className={`px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-all flex items-center gap-1 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Đang tải...' : 'Làm Mới'}</span>
          </button>

                     

          <button
            onClick={() => setShowCreateModal(true)}
            disabled={isLoading}
            className={`px-4 py-2 bg-[#FFD875] text-black rounded-lg hover:bg-[#e5c368] transition-all flex items-center gap-1 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <PlusIcon className="w-4 h-4" />
            <span>Thêm Mới</span>
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-[#FFD875] border-t-transparent rounded-full"
          />
        </div>
      ) : (
        <div className="space-y-6">
          {pricingGroups.map((group) => (
            <motion.div
              key={group.room_type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden"
            >
              <div className="bg-slate-700 px-6 py-4 border-b border-slate-600">
                <div className="flex items-center gap-3">
                  <BuildingOfficeIcon className="w-5 h-5 text-[#FFD875]" />
                  <h3 className="text-lg font-semibold text-white">{group.room_type}</h3>
                  <span className="px-2 py-1 bg-[#FFD875] text-black rounded-full text-xs font-medium">
                    {group.seat_types.length} loại ghế
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-700/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                        Loại Ghế
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                        Giá Cơ Bản
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                        Trạng Thái
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">
                        Thao Tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {group.seat_types.map((seatType) => (
                      <tr key={seatType.Price_ID} className="hover:bg-slate-700/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-white font-medium">{seatType.Seat_Type}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-[#FFD875] font-semibold">
                            {formatCurrency(seatType.Base_Price)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            seatType.Status === 'Active' 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {seatType.Status === 'Active' ? 'Hoạt động' : 'Không hoạt động'}
                          </span>
                        </td>
                                                 <td className="px-6 py-4 whitespace-nowrap text-right">
                           <div className="flex items-center justify-end gap-2">
                             <button
                               onClick={() => openEditModal(group, seatType)}
                               disabled={isLoading}
                               className={`p-1 hover:bg-slate-600 rounded transition-all ${
                                 isLoading ? 'opacity-50 cursor-not-allowed' : ''
                               }`}
                               title="Chỉnh sửa"
                             >
                               <PencilIcon className="w-4 h-4 text-blue-400" />
                             </button>
                             <button
                               onClick={() => handleDelete(group.room_type, seatType.Seat_Type)}
                               disabled={isLoading}
                               className={`p-1 hover:bg-slate-600 rounded transition-all ${
                                 isLoading ? 'opacity-50 cursor-not-allowed' : ''
                               }`}
                               title="Xóa"
                             >
                               <TrashIcon className="w-4 h-4 text-red-400" />
                             </button>
                           </div>
                         </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          ))}

          {pricingGroups.length === 0 && (
            <div className="text-center py-12">
              <TicketIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">Chưa có cấu hình giá vé</h3>
              <p className="text-gray-500 mb-4">Hãy thêm cấu hình giá vé đầu tiên của bạn</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-[#FFD875] text-black rounded-lg hover:bg-[#e5c368] transition-all"
              >
                Thêm Cấu Hình Giá Vé
              </button>
            </div>
          )}
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 rounded-lg p-6 w-full max-w-md border border-slate-700"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Tạo Cấu Hình Giá Vé Mới</h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetCreateForm();
                  }}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-all"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Loại Phòng</label>
                <input
                  type="text"
                  value={createForm.Room_Type}
                  onChange={(e) => setCreateForm({ ...createForm, Room_Type: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-[#FFD875] focus:outline-none"
                  placeholder="Ví dụ: 2D, 3D, IMAX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Loại Ghế</label>
                <input
                  type="text"
                  value={createForm.Seat_Type}
                  onChange={(e) => setCreateForm({ ...createForm, Seat_Type: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-[#FFD875] focus:outline-none"
                                                  placeholder="Ví dụ: Thường, VIP"
                />
              </div>

                              <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Giá Cơ Bản (VNĐ)</label>
                  <input
                    type="number"
                    value={createForm.Base_Price || ''}
                    onChange={(e) => setCreateForm({ ...createForm, Base_Price: Number(e.target.value) || 0 })}
                    onFocus={(e) => {
                      e.target.select();
                    }}
                    className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-[#FFD875] focus:outline-none"
                    placeholder="Ví dụ: 120000"
                    min="1000"
                    step="1000"
                  />
                </div>
            </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetCreateForm();
                  }}
                  className="flex-1 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-all"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreate}
                  disabled={isLoading}
                  className={`flex-1 px-4 py-2 bg-[#FFD875] text-black rounded-lg hover:bg-[#e5c368] transition-all ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? 'Đang xử lý...' : 'Tạo Mới'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 rounded-lg p-6 w-full max-w-md border border-slate-700"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Chỉnh Sửa Giá Vé</h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    resetEditForm();
                  }}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-all"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Loại Phòng</label>
                                 <input
                   type="text"
                   value={editForm.Room_Type}
                   onChange={(e) => setEditForm({ ...editForm, Room_Type: e.target.value })}
                   className="w-full px-3 py-2 bg-slate-600 text-gray-400 rounded-lg border border-slate-600 cursor-not-allowed"
                   disabled
                 />
                <p className="text-xs text-gray-500 mt-1">Không thể thay đổi loại phòng</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Loại Ghế</label>
                                 <input
                   type="text"
                   value={editForm.Seat_Type}
                   onChange={(e) => setEditForm({ ...editForm, Seat_Type: e.target.value })}
                   className="w-full px-3 py-2 bg-slate-600 text-gray-400 rounded-lg border border-slate-600 cursor-not-allowed"
                   disabled
                 />
                <p className="text-xs text-gray-500 mt-1">Không thể thay đổi loại ghế</p>
              </div>

                               <div>
                   <label className="block text-sm font-medium text-gray-400 mb-2">Giá Cơ Bản (VNĐ)</label>
                   <input
                     type="number"
                     value={editForm.Base_Price}
                     onChange={(e) => setEditForm({ ...editForm, Base_Price: Number(e.target.value) })}
                     onFocus={(e) => e.target.select()}
                     className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-[#FFD875] focus:outline-none"
                     placeholder="Ví dụ: 120000"
                     min="0"
                     step="1000"
                   />
                 </div>
            </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    resetEditForm();
                  }}
                  className="flex-1 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-all"
                >
                  Hủy
                </button>
                <button
                  onClick={handleEdit}
                  disabled={isLoading}
                  className={`flex-1 px-4 py-2 bg-[#FFD875] text-black rounded-lg hover:bg-[#e5c368] transition-all ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? 'Đang xử lý...' : 'Cập Nhật'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TicketPricingManagement;

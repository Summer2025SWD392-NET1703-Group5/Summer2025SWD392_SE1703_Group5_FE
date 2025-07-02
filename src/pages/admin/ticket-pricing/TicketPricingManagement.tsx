import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TicketIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  ArrowPathIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  CalculatorIcon,
  ChartBarIcon,
  AdjustmentsHorizontalIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import ticketPricingService from '../../../services/ticketPricingService';
import type {
  TicketPricingGroup,
  CreateTicketPricingRequest,
  PricingStructure,
  SeatType,
  BulkPriceUpdate
} from '../../../types/ticketPricing';
import toast from 'react-hot-toast';

const TicketPricingManagement: React.FC = () => {
  // States
  const [pricingGroups, setPricingGroups] = useState<TicketPricingGroup[]>([]);
  const [pricingStructure, setPricingStructure] = useState<PricingStructure | null>(null);
  const [seatTypes, setSeatTypes] = useState<SeatType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showCalculatorModal, setShowCalculatorModal] = useState(false);
  const [showStructureModal, setShowStructureModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [filterRoomType, setFilterRoomType] = useState<string>('');
  const [bulkUpdates, setBulkUpdates] = useState<BulkPriceUpdate[]>([]);

  // Form states
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

  const [calculatorForm, setCalculatorForm] = useState({
    roomType: '',
    seatType: '',
    showDate: '',
    startTime: ''
  });

  // Load data
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadPricingGroups(),
        loadPricingStructure(),
        loadSeatTypes()
      ]);
    } catch (error) {
      console.error('Lỗi tải dữ liệu:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPricingGroups = async () => {
    try {
      const groups = await ticketPricingService.getAllTicketPricings();
      setPricingGroups(groups);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const loadPricingStructure = async () => {
    try {
      const structure = await ticketPricingService.getPricingStructure();
      setPricingStructure(structure);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const loadSeatTypes = async () => {
    try {
      const types = await ticketPricingService.getAvailableSeatTypes();
      setSeatTypes(types);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // CRUD Operations
  const handleCreate = async () => {
    if (!createForm.Room_Type || !createForm.Seat_Type || !createForm.Base_Price) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      await ticketPricingService.createTicketPricing(createForm);
      toast.success('Tạo cấu hình giá vé thành công!');
      setShowCreateModal(false);
      setCreateForm({ Room_Type: '', Seat_Type: '', Base_Price: 0 });
      loadAllData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleEdit = async () => {
    if (!selectedItem || !editForm.Base_Price) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      const id = ticketPricingService.generateId(selectedItem.Room_Type, selectedItem.Seat_Type);
      await ticketPricingService.updateTicketPricing(id, editForm);
      toast.success('Cập nhật cấu hình giá vé thành công!');
      setShowEditModal(false);
      setSelectedItem(null);
      loadAllData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (roomType: string, seatType: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa cấu hình giá vé này?')) {
      return;
    }

    try {
      const id = ticketPricingService.generateId(roomType, seatType);
      await ticketPricingService.deleteTicketPricing(id);
      toast.success('Xóa cấu hình giá vé thành công!');
      loadAllData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleBulkUpdate = async () => {
    if (bulkUpdates.length === 0) {
      toast.error('Không có cập nhật nào để thực hiện');
      return;
    }

    try {
      await ticketPricingService.bulkUpdatePrices(bulkUpdates);
      toast.success('Cập nhật hàng loạt thành công!');
      setShowBulkModal(false);
      setBulkUpdates([]);
      loadAllData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleCalculatePrice = async () => {
    if (!calculatorForm.roomType || !calculatorForm.seatType || !calculatorForm.showDate || !calculatorForm.startTime) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      const result = await ticketPricingService.calculateTicketPrice(calculatorForm);
      toast.success(`Giá vé tính được: ${ticketPricingService.formatCurrency(result.finalPrice)}`);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // Utility functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getRoomTypes = () => {
    return [...new Set(pricingGroups.map(group => group.room_type))];
  };

  const getFilteredGroups = () => {
    if (!filterRoomType) return pricingGroups;
    return pricingGroups.filter(group => group.room_type === filterRoomType);
  };

  // Modal components
  const CreateModal = () => (
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
            <h3 className="text-xl font-bold text-white mb-4">Tạo Cấu Hình Giá Vé Mới</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Loại Phòng
                </label>
                <input
                  type="text"
                  value={createForm.Room_Type}
                  onChange={(e) => setCreateForm({ ...createForm, Room_Type: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-[#FFD875] focus:outline-none"
                  placeholder="Ví dụ: 2D, 3D, IMAX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Loại Ghế
                </label>
                <input
                  type="text"
                  value={createForm.Seat_Type}
                  onChange={(e) => setCreateForm({ ...createForm, Seat_Type: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-[#FFD875] focus:outline-none"
                                                      placeholder="Ví dụ: Thường, VIP, Sweetbox"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Giá Cơ Bản (VNĐ)
                </label>
                <input
                  type="number"
                  value={createForm.Base_Price}
                  onChange={(e) => setCreateForm({ ...createForm, Base_Price: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-[#FFD875] focus:outline-none"
                  placeholder="Ví dụ: 120000"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-all"
              >
                Hủy
              </button>
              <button
                onClick={handleCreate}
                className="flex-1 px-4 py-2 bg-[#FFD875] text-black rounded-lg hover:bg-[#e5c368] transition-all"
              >
                Tạo Mới
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const EditModal = () => (
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
            <h3 className="text-xl font-bold text-white mb-4">Chỉnh Sửa Giá Vé</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Loại Phòng
                </label>
                <input
                  type="text"
                  value={editForm.Room_Type}
                  onChange={(e) => setEditForm({ ...editForm, Room_Type: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-[#FFD875] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Loại Ghế
                </label>
                <input
                  type="text"
                  value={editForm.Seat_Type}
                  onChange={(e) => setEditForm({ ...editForm, Seat_Type: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-[#FFD875] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Giá Cơ Bản (VNĐ)
                </label>
                <input
                  type="number"
                  value={editForm.Base_Price}
                  onChange={(e) => setEditForm({ ...editForm, Base_Price: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-[#FFD875] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-all"
              >
                Hủy
              </button>
              <button
                onClick={handleEdit}
                className="flex-1 px-4 py-2 bg-[#FFD875] text-black rounded-lg hover:bg-[#e5c368] transition-all"
              >
                Cập Nhật
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const CalculatorModal = () => (
    <AnimatePresence>
      {showCalculatorModal && (
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
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <CalculatorIcon className="w-5 h-5 text-[#FFD875]" />
              Tính Giá Vé
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Loại Phòng
                </label>
                <select
                  value={calculatorForm.roomType}
                  onChange={(e) => setCalculatorForm({ ...calculatorForm, roomType: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-[#FFD875] focus:outline-none"
                >
                  <option value="">Chọn loại phòng</option>
                  {getRoomTypes().map(roomType => (
                    <option key={roomType} value={roomType}>{roomType}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Loại Ghế
                </label>
                <select
                  value={calculatorForm.seatType}
                  onChange={(e) => setCalculatorForm({ ...calculatorForm, seatType: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-[#FFD875] focus:outline-none"
                >
                  <option value="">Chọn loại ghế</option>
                  {seatTypes.map(seatType => (
                    <option key={seatType.seat_type} value={seatType.seat_type}>
                      {seatType.seat_type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Ngày Chiếu
                </label>
                <input
                  type="date"
                  value={calculatorForm.showDate}
                  onChange={(e) => setCalculatorForm({ ...calculatorForm, showDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-[#FFD875] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Giờ Chiếu
                </label>
                <input
                  type="time"
                  value={calculatorForm.startTime}
                  onChange={(e) => setCalculatorForm({ ...calculatorForm, startTime: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-[#FFD875] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCalculatorModal(false)}
                className="flex-1 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-all"
              >
                Đóng
              </button>
              <button
                onClick={handleCalculatePrice}
                className="flex-1 px-4 py-2 bg-[#FFD875] text-black rounded-lg hover:bg-[#e5c368] transition-all"
              >
                Tính Giá
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const StructureModal = () => (
    <AnimatePresence>
      {showStructureModal && pricingStructure && (
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
            className="bg-slate-800 rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto border border-slate-700"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <ChartBarIcon className="w-5 h-5 text-[#FFD875]" />
                Cấu Trúc Giá Vé
              </h3>
              <button
                onClick={() => setShowStructureModal(false)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-all"
              >
                <XMarkIcon className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Base Prices */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Giá Cơ Bản</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(pricingStructure.basePrices).map(([roomType, seats]) => (
                    <div key={roomType} className="bg-slate-700 rounded-lg p-4">
                      <h5 className="font-medium text-[#FFD875] mb-2">{roomType}</h5>
                      <div className="space-y-1">
                        {Object.entries(seats).map(([seatType, price]) => (
                          <div key={seatType} className="flex justify-between text-sm">
                            <span className="text-gray-300">{seatType}</span>
                            <span className="text-white">{formatCurrency(price)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Day Types */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Hệ Số Theo Ngày</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(pricingStructure.dayTypes).map(([dayType, info]) => (
                    <div key={dayType} className="bg-slate-700 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-[#FFD875]">{dayType}</span>
                        <span className="text-white">x{info.multiplier}</span>
                      </div>
                      <p className="text-sm text-gray-300">{info.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Time Slots */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Hệ Số Theo Giờ</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(pricingStructure.timeSlots).map(([slot, info]) => (
                    <div key={slot} className="bg-slate-700 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-[#FFD875]">{slot}</span>
                        <span className="text-white">x{info.multiplier}</span>
                      </div>
                      <p className="text-sm text-gray-300">{info.description}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {info.startTime} - {info.endTime}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Holidays */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Ngày Lễ Đặc Biệt</h4>
                <div className="bg-slate-700 rounded-lg p-4">
                  <div className="flex flex-wrap gap-2">
                    {pricingStructure.holidays.map((holiday, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-[#FFD875] text-black rounded-full text-sm font-medium"
                      >
                        {holiday}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

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
            onClick={() => setShowCalculatorModal(true)}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-all flex items-center gap-1"
          >
            <CalculatorIcon className="w-4 h-4" />
            <span>Tính Giá</span>
          </button>

          <button
            onClick={() => setShowStructureModal(true)}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-all flex items-center gap-1"
          >
            <ChartBarIcon className="w-4 h-4" />
            <span>Cấu Trúc</span>
          </button>

          <button
            onClick={loadAllData}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-all flex items-center gap-1"
          >
            <ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Làm Mới</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-[#FFD875] text-black rounded-lg hover:bg-[#e5c368] transition-all flex items-center gap-1 shadow-[0_0_20px_rgba(255,216,117,0.5)]"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Thêm Mới</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <select
            value={filterRoomType}
            onChange={(e) => setFilterRoomType(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 text-white rounded-lg border border-slate-600 focus:border-[#FFD875] focus:outline-none"
          >
            <option value="">Tất cả loại phòng</option>
            {getRoomTypes().map(roomType => (
              <option key={roomType} value={roomType}>{roomType}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-[#FFD875] border-t-transparent rounded-full"
          />
        </div>
      ) : (
        /* Content */
        <div className="space-y-6">
          {getFilteredGroups().map((group, groupIndex) => (
            <motion.div
              key={group.room_type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: groupIndex * 0.1 }}
              className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden"
            >
              {/* Group Header */}
              <div className="bg-slate-700 px-6 py-4 border-b border-slate-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BuildingOfficeIcon className="w-5 h-5 text-[#FFD875]" />
                    <h3 className="text-lg font-semibold text-white">{group.room_type}</h3>
                    <span className="px-2 py-1 bg-[#FFD875] text-black rounded-full text-xs font-medium">
                      {group.seat_types.length} loại ghế
                    </span>
                  </div>
                </div>
              </div>

              {/* Seat Types Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-700/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Loại Ghế
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Giá Cơ Bản
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Trạng Thái
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Cập Nhật Cuối
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Thao Tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {group.seat_types.map((seatType, seatIndex) => (
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
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${seatType.Status === 'Active'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                            }`}>
                            {seatType.Status === 'Active' ? 'Hoạt động' : 'Không hoạt động'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-400 text-sm">
                          {new Date(seatType.Last_Updated).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setSelectedItem({ ...seatType, Room_Type: group.room_type });
                                setEditForm({
                                  Room_Type: group.room_type,
                                  Seat_Type: seatType.Seat_Type,
                                  Base_Price: seatType.Base_Price
                                });
                                setShowEditModal(true);
                              }}
                              className="p-1 hover:bg-slate-600 rounded transition-all"
                              title="Chỉnh sửa"
                            >
                              <PencilIcon className="w-4 h-4 text-blue-400" />
                            </button>
                            <button
                              onClick={() => handleDelete(group.room_type, seatType.Seat_Type)}
                              className="p-1 hover:bg-slate-600 rounded transition-all"
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

          {getFilteredGroups().length === 0 && (
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

      {/* Modals */}
      <CreateModal />
      <EditModal />
      <CalculatorModal />
      <StructureModal />
    </div>
  );
};

export default TicketPricingManagement;

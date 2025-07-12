import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TicketIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  FunnelIcon,
  CalculatorIcon,
  ChartBarIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import ticketPricingService from "../../../services/ticketPricingService";
import type {
  TicketPricingGroup,
  CreateTicketPricingRequest,
  PricingStructure,
  SeatType,
} from "../../../types/ticketPricing";
import toast from "react-hot-toast";

const TicketPricingManagement: React.FC = () => {
  // States
  const [pricingGroups, setPricingGroups] = useState<TicketPricingGroup[]>([]);
  const [pricingStructure, setPricingStructure] = useState<PricingStructure | null>(null);
  const [seatTypes, setSeatTypes] = useState<SeatType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCalculatorModal, setShowCalculatorModal] = useState(false);
  const [showStructureModal, setShowStructureModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [filterRoomType, setFilterRoomType] = useState<string>("");

  // Form states
  const [createForm, setCreateForm] = useState<CreateTicketPricingRequest>({
    Room_Type: "",
    Seat_Type: "",
    Base_Price: 0,
  });

  const [editForm, setEditForm] = useState<CreateTicketPricingRequest>({
    Room_Type: "",
    Seat_Type: "",
    Base_Price: 0,
  });

  const [calculatorForm, setCalculatorForm] = useState({
    roomType: "",
    seatType: "",
    showDate: "",
    startTime: "",
  });

  // Load data
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([loadPricingGroups(), loadPricingStructure(), loadSeatTypes()]);
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
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
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      await ticketPricingService.createTicketPricing(createForm);
      toast.success("Tạo cấu hình giá vé thành công!");
      setShowCreateModal(false);
      setCreateForm({ Room_Type: "", Seat_Type: "", Base_Price: 0 });
      loadAllData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleEdit = async () => {
    if (!selectedItem || !editForm.Base_Price) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      const id = ticketPricingService.generateId(selectedItem.Room_Type, selectedItem.Seat_Type);
      await ticketPricingService.updateTicketPricing(id, editForm);
      toast.success("Cập nhật cấu hình giá vé thành công!");
      setShowEditModal(false);
      setSelectedItem(null);
      loadAllData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (roomType: string, seatType: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa cấu hình giá vé này?")) {
      return;
    }

    try {
      const id = ticketPricingService.generateId(roomType, seatType);
      await ticketPricingService.deleteTicketPricing(id);
      toast.success("Xóa cấu hình giá vé thành công!");
      loadAllData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleCalculatePrice = async () => {
    if (!calculatorForm.roomType || !calculatorForm.seatType || !calculatorForm.showDate || !calculatorForm.startTime) {
      toast.error("Vui lòng điền đầy đủ thông tin");
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
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getRoomTypes = () => {
    return [...new Set(pricingGroups.map((group) => group.room_type))];
  };

  const getFilteredGroups = () => {
    if (!filterRoomType) return pricingGroups;
    return pricingGroups.filter((group) => group.room_type === filterRoomType);
  };

  // Modal components
  // Thay thế CreateModal bằng modal mới dùng state local
  const CreateModal = () => {
    const [roomType, setRoomType] = useState('');
    const [seatType, setSeatType] = useState('');
    const [basePrice, setBasePrice] = useState(0);

    const handleSubmit = async () => {
      if (!roomType || !seatType || !basePrice) {
        toast.error('Vui lòng điền đầy đủ thông tin');
        return;
      }
      try {
        await ticketPricingService.createTicketPricing({ Room_Type: roomType, Seat_Type: seatType, Base_Price: basePrice });
        toast.success('Tạo cấu hình giá vé thành công!');
        setShowCreateModal(false);
        setRoomType('');
        setSeatType('');
        setBasePrice(0);
        loadAllData();
      } catch (error: any) {
        toast.error(error.message);
      }
    };

    if (!showCreateModal) return null;
    return (
      <AnimatePresence>
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
                <label className="block text-sm font-medium text-gray-400 mb-2">Loại Phòng</label>
                <select
                  value={roomType}
                  onChange={e => setRoomType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-[#FFD875] focus:outline-none"
                >
                  <option value="">Chọn loại phòng</option>
                  <option value="2D">2D</option>
                  <option value="3D">3D</option>
                  <option value="IMAX">IMAX</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Loại Ghế</label>
                <select
                  value={seatType}
                  onChange={e => setSeatType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-[#FFD875] focus:outline-none"
                >
                  <option value="">Chọn loại ghế</option>
                  <option value="Regular">Regular</option>
                  <option value="VIP">VIP</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Giá Cơ Bản (VNĐ)</label>
                <input
                  type="number"
                  value={basePrice}
                  onChange={e => setBasePrice(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-[#FFD875] focus:outline-none"
                  placeholder="Ví dụ: 120000"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowCreateModal(false); setRoomType(''); setSeatType(''); setBasePrice(0); }}
                className="flex-1 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-all"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-2 bg-[#FFD875] text-black rounded-lg hover:bg-[#e5c368] transition-all"
              >
                Tạo Mới
              </button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  // Thay thế EditModal bằng modal mới dùng state local
  const EditModal = () => {
    const [roomType, setRoomType] = useState('');
    const [seatType, setSeatType] = useState('');
    const [basePrice, setBasePrice] = useState(0);

    useEffect(() => {
      if (showEditModal && selectedItem) {
        setRoomType(selectedItem.Room_Type || '');
        setSeatType(selectedItem.Seat_Type || '');
        setBasePrice(selectedItem.Base_Price || 0);
      }
    }, [showEditModal, selectedItem]);

    const handleSubmit = async () => {
      if (!roomType || !seatType || !basePrice) {
        toast.error('Vui lòng điền đầy đủ thông tin');
        return;
      }
      try {
        const id = ticketPricingService.generateId(roomType, seatType);
        await ticketPricingService.updateTicketPricing(id, { Room_Type: roomType, Seat_Type: seatType, Base_Price: basePrice });
        toast.success('Cập nhật cấu hình giá vé thành công!');
        setShowEditModal(false);
        setRoomType('');
        setSeatType('');
        setBasePrice(0);
        setSelectedItem(null);
        loadAllData();
      } catch (error: any) {
        toast.error(error.message);
      }
    };

    if (!showEditModal || !selectedItem) return null;
    return (
      <AnimatePresence>
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
                <label className="block text-sm font-medium text-gray-400 mb-2">Loại Phòng</label>
                <select
                  value={roomType}
                  onChange={e => setRoomType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-[#FFD875] focus:outline-none"
                >
                  <option value="">Chọn loại phòng</option>
                  <option value="2D">2D</option>
                  <option value="3D">3D</option>
                  <option value="IMAX">IMAX</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Loại Ghế</label>
                <select
                  value={seatType}
                  onChange={e => setSeatType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-[#FFD875] focus:outline-none"
                >
                  <option value="">Chọn loại ghế</option>
                  <option value="Regular">Regular</option>
                  <option value="VIP">VIP</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Giá Cơ Bản (VNĐ)</label>
                <input
                  type="number"
                  value={basePrice}
                  onChange={e => setBasePrice(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-[#FFD875] focus:outline-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowEditModal(false); setRoomType(''); setSeatType(''); setBasePrice(0); setSelectedItem(null); }}
                className="flex-1 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-all"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-2 bg-[#FFD875] text-black rounded-lg hover:bg-[#e5c368] transition-all"
              >
                Cập Nhật
              </button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

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
                <label className="block text-sm font-medium text-gray-400 mb-2">Loại Phòng</label>
                <select
                  value={calculatorForm.roomType}
                  onChange={(e) => setCalculatorForm({ ...calculatorForm, roomType: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-[#FFD875] focus:outline-none"
                >
                  <option value="">Chọn loại phòng</option>
                  {getRoomTypes().map((roomType) => (
                    <option key={roomType} value={roomType}>
                      {roomType}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Loại Ghế</label>
                <select
                  value={calculatorForm.seatType}
                  onChange={(e) => setCalculatorForm({ ...calculatorForm, seatType: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-[#FFD875] focus:outline-none"
                >
                  <option value="">Chọn loại ghế</option>
                  {seatTypes.map((seatType) => (
                    <option key={seatType.seat_type} value={seatType.seat_type}>
                      {seatType.seat_type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Ngày Chiếu</label>
                <input
                  type="date"
                  value={calculatorForm.showDate}
                  onChange={(e) => setCalculatorForm({ ...calculatorForm, showDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-[#FFD875] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Giờ Chiếu</label>
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
                      <span key={index} className="px-3 py-1 bg-[#FFD875] text-black rounded-full text-sm font-medium">
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

  // Khi mở modal tạo mới, reset form về rỗng
  const handleOpenCreateModal = () => {
    setCreateForm({ Room_Type: '', Seat_Type: '', Base_Price: 0 });
    setShowCreateModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="p-6 space-y-6">
        {/* Enhanced Header with gradient background */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-slate-800/80 via-slate-700/80 to-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-600/50 shadow-2xl"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-[#FFD875] to-[#e5c368] rounded-xl shadow-lg">
                <TicketIcon className="w-8 h-8 text-slate-900" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Quản Lý Giá Vé
                </h1>
                <p className="text-gray-400 mt-1">
                  Cấu hình giá vé theo loại phòng và ghế với hệ thống tính giá thông minh
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleOpenCreateModal}
                className="px-6 py-2.5 bg-gradient-to-r from-[#FFD875] to-[#e5c368] text-slate-900 rounded-xl hover:from-[#e5c368] hover:to-[#d4b356] transition-all flex items-center gap-2 shadow-lg hover:shadow-[#FFD875]/25 font-semibold"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Thêm Mới</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-slate-800/60 via-slate-700/60 to-slate-800/60 backdrop-blur-sm rounded-xl p-4 border border-slate-600/50 shadow-lg"
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FunnelIcon className="w-5 h-5 text-[#FFD875]" />
              <span className="text-white font-medium">Bộ lọc:</span>
            </div>
            <div className="flex-1 max-w-xs">
              <select
                value={filterRoomType}
                onChange={(e) => setFilterRoomType(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-700/80 text-white rounded-lg border border-slate-600/50 focus:border-[#FFD875] focus:outline-none focus:ring-2 focus:ring-[#FFD875]/20 transition-all"
              >
                <option value="">🎬 Tất cả loại phòng</option>
                {getRoomTypes().map((roomType) => (
                  <option key={roomType} value={roomType}>
                    {roomType === "2D" ? "🎞️" : roomType === "3D" ? "🥽" : roomType === "IMAX" ? "🎭" : "🎪"} {roomType}
                  </option>
                ))}
              </select>
            </div>
            {filterRoomType && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => setFilterRoomType("")}
                className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all flex items-center gap-1 text-sm"
              >
                <XMarkIcon className="w-4 h-4" />
                Xóa bộ lọc
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Enhanced Loading State */}
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-96 bg-gradient-to-br from-slate-800/40 to-slate-700/40 backdrop-blur-sm rounded-2xl border border-slate-600/50"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 border-4 border-[#FFD875] border-t-transparent rounded-full mb-4 shadow-lg"
            />
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-center"
            >
              <h3 className="text-xl font-semibold text-white mb-2">Đang tải dữ liệu giá vé...</h3>
              <p className="text-gray-400">Vui lòng chờ trong giây lát</p>
            </motion.div>
          </motion.div>
        ) : (
          /* Enhanced Content */
          <div className="space-y-8">
            {getFilteredGroups().map((group, groupIndex) => (
              <motion.div
                key={group.room_type}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIndex * 0.15 }}
                className="bg-gradient-to-br from-slate-800/80 via-slate-700/80 to-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-600/50 overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500"
              >
                {/* Enhanced Group Header */}
                <div className="bg-gradient-to-r from-slate-700/90 to-slate-600/90 px-8 py-6 border-b border-slate-600/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-gradient-to-br from-[#FFD875] to-[#e5c368] rounded-lg shadow-lg">
                        <BuildingOfficeIcon className="w-6 h-6 text-slate-900" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-1">{group.room_type}</h3>
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 bg-gradient-to-r from-[#FFD875] to-[#e5c368] text-slate-900 rounded-full text-sm font-semibold shadow-lg">
                            {group.seat_types.length} loại ghế
                          </span>
                          <span className="text-gray-400 text-sm">
                            Tổng giá trung bình:{" "}
                            {formatCurrency(
                              group.seat_types.reduce((sum, seat) => sum + seat.Base_Price, 0) / group.seat_types.length
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Seat Types Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-slate-700/60 to-slate-600/60">
                      <tr>
                        <th className="px-8 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <span>🪑</span>
                            Loại Ghế
                          </div>
                        </th>
                        <th className="px-8 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <CurrencyDollarIcon className="w-4 h-4" />
                            Giá Cơ Bản
                          </div>
                        </th>
                        <th className="px-8 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <span>📊</span>
                            Trạng Thái
                          </div>
                        </th>
                        <th className="px-8 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <span>⏰</span>
                            Cập Nhật Cuối
                          </div>
                        </th>
                        <th className="px-8 py-4 text-right text-sm font-semibold text-gray-300 uppercase tracking-wider">
                          <div className="flex items-center justify-end gap-2">
                            <span>⚙️</span>
                            Thao Tác
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-600/50">
                      {group.seat_types.map((seatType, seatIndex) => (
                        <motion.tr
                          key={seatType.Price_ID}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: seatIndex * 0.1 }}
                          className="hover:bg-gradient-to-r hover:from-slate-700/40 hover:to-slate-600/40 transition-all duration-300 group"
                        >
                          <td className="px-8 py-6 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#FFD875] to-[#e5c368] shadow-lg"></div>
                              <span className="text-white font-semibold text-lg">{seatType.Seat_Type}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl font-bold bg-gradient-to-r from-[#FFD875] to-[#e5c368] bg-clip-text text-transparent">
                                {formatCurrency(seatType.Base_Price)}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                            <span
                              className={`px-4 py-2 rounded-full text-sm font-semibold shadow-lg ${
                                seatType.Status === "Active"
                                  ? "bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-400 border border-green-500/30"
                                  : "bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-400 border border-red-500/30"
                              }`}
                            >
                              {seatType.Status === "Active" ? "✅ Hoạt động" : "❌ Không hoạt động"}
                            </span>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap text-gray-400">
                            <div className="flex items-center gap-2">
                              <span className="text-sm">
                                {new Date(seatType.Last_Updated).toLocaleDateString("vi-VN", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-3">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => {
                                  setSelectedItem({ ...seatType, Room_Type: group.room_type });
                                  setShowEditModal(true);
                                }}
                                className="p-2.5 bg-gradient-to-r from-blue-500/20 to-blue-600/20 hover:from-blue-500/30 hover:to-blue-600/30 rounded-lg transition-all border border-blue-500/30 shadow-lg"
                                title="Chỉnh sửa"
                              >
                                <PencilIcon className="w-4 h-4 text-blue-400" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleDelete(group.room_type, seatType.Seat_Type)}
                                className="p-2.5 bg-gradient-to-r from-red-500/20 to-red-600/20 hover:from-red-500/30 hover:to-red-600/30 rounded-lg transition-all border border-red-500/30 shadow-lg"
                                title="Xóa"
                              >
                                <TrashIcon className="w-4 h-4 text-red-400" />
                              </motion.button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            ))}

            {getFilteredGroups().length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20 bg-gradient-to-br from-slate-800/40 to-slate-700/40 backdrop-blur-sm rounded-2xl border border-slate-600/50"
              >
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="mb-8"
                >
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-[#FFD875] to-[#e5c368] rounded-2xl flex items-center justify-center shadow-2xl">
                    <TicketIcon className="w-12 h-12 text-slate-900" />
                  </div>
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-3">Chưa có cấu hình giá vé</h3>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                  Hệ thống chưa có cấu hình giá vé nào. Hãy tạo cấu hình đầu tiên để bắt đầu quản lý giá vé cho rạp
                  chiếu phim.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleOpenCreateModal}
                  className="px-8 py-4 bg-gradient-to-r from-[#FFD875] to-[#e5c368] text-slate-900 rounded-xl hover:from-[#e5c368] hover:to-[#d4b356] transition-all font-semibold shadow-lg hover:shadow-[#FFD875]/25 flex items-center gap-3 mx-auto"
                >
                  <PlusIcon className="w-5 h-5" />
                  Tạo Cấu Hình Giá Vé Đầu Tiên
                </motion.button>
              </motion.div>
            )}
          </div>
        )}

        {/* Modals */}
        <CreateModal />
        <EditModal />
        <CalculatorModal />
        <StructureModal />
      </div>
    </div>
  );
};

export default TicketPricingManagement;
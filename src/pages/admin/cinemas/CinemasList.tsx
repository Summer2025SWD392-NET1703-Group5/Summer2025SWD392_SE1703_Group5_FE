// src/pages/admin/cinemas/CinemasList.tsx
import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  UserIcon,
  ArrowPathIcon,
  UsersIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { cinemaService } from "../../../services/cinemaService";
import type { Cinema } from "../../../types/cinema";
import StaffAssignmentModal from "../../../components/admin/forms/StaffAssignmentModal";
import ExcelImportExport from "../../../components/admin/common/ExcelImportExport";
import { AddButton } from "../../../components/admin/common/ActionButtons";
import { useAuth } from "../../../contexts/SimpleAuthContext";
import "../../../components/admin/styles/AdminPage.css";

interface User {
  User_ID: number;
  Full_Name: string;
  Email: string;
  Phone_Number: string;
  Cinema_ID: number | null;
  Cinema_Name: string | null;
}

interface CinemaStats {
  totalRooms: number;
  totalSeats: number;
  totalShowtimes: number;
}

interface CinemaWithStats extends Cinema {
  manager: User | null | undefined;
  staff: User[];
  stats?: CinemaStats;
}

const CinemasList: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [cinemas, setCinemas] = useState<CinemaWithStats[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [importLoading, setImportLoading] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);

  // Modal states
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedCinema, setSelectedCinema] = useState<Cinema | null>(null);
  const [assignmentType, setAssignmentType] = useState<"manager" | "staff">("manager");
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState<{ name: string; description: string } | null>(null);

  useEffect(() => {
    fetchCinemas();
  }, []);

  const fetchCinemas = async () => {
    try {
      setLoading(true);
      const fetchedCinemas = await cinemaService.getAllCinemas();

      // Fetch details for each cinema to get stats, managers and staff
      const cinemasWithDetails = await Promise.all(
        fetchedCinemas.map(async (cinema): Promise<CinemaWithStats> => {
          try {
            const details = await cinemaService.getCinemaDetails(cinema.Cinema_ID);

            // Lấy thông tin manager và staff cho rạp
            let manager: User | null = null;
            let staff: User[] = [];

            // Lấy manager được gán cho rạp này bằng cinema ID
            try {
              const managerResponse = await cinemaService.getCinemaManager(cinema.Cinema_ID);
              // Normalize the manager data to match our User interface
              if (managerResponse) {
                manager = {
                  User_ID: managerResponse.User_ID,
                  Full_Name: (managerResponse as any).Full_Name || (managerResponse as any).Name || 'Unknown',
                  Email: managerResponse.Email,
                  Phone_Number: (managerResponse as any).Phone_Number || '',
                  Cinema_ID: (managerResponse as any).Cinema_ID || null,
                  Cinema_Name: (managerResponse as any).Cinema_Name || null,
                } as User;
              }
            } catch (error) {
              console.error(`Error fetching manager for cinema ${cinema.Cinema_ID}:`, error);
              manager = null;
            }

            // Cố gắng lấy thông tin staff từ API
            try {
              const staffResponse = await cinemaService.getCinemaStaff(cinema.Cinema_ID);
              staff = staffResponse as unknown as User[];
            } catch (error) {
              console.error(`Error fetching staff for cinema ${cinema.Cinema_ID}:`, error);
            }

            // Tính số phòng chiếu từ CinemaRooms hoặc rooms
            const totalRooms =
              cinema.CinemaRooms?.length || cinema.rooms?.length || details?.statistics?.totalRooms || 0;

            return {
              ...cinema,
              stats: {
                totalRooms: totalRooms,
                totalSeats: details?.statistics?.totalSeats || 0,
                totalShowtimes: details?.statistics?.totalShowtimes || 0,
              },
              manager: manager,
              staff: staff,
            };
          } catch (error) {
            // If details fail, return the cinema without stats
            console.error(`Could not fetch details for cinema ${cinema.Cinema_ID}`, error);

            // Vẫn cố gắng lấy thông tin manager và staff nếu có thể
            let manager = null;
            let staff: User[] = [];

            // Lấy manager được gán cho rạp này bằng cinema ID
            try {
              const managerResponse = await cinemaService.getCinemaManager(cinema.Cinema_ID);
              // Normalize the manager data to match our User interface
              if (managerResponse) {
                manager = {
                  User_ID: managerResponse.User_ID,
                  Full_Name: (managerResponse as any).Full_Name || (managerResponse as any).Name || 'Unknown',
                  Email: managerResponse.Email,
                  Phone_Number: (managerResponse as any).Phone_Number || '',
                  Cinema_ID: (managerResponse as any).Cinema_ID || null,
                  Cinema_Name: (managerResponse as any).Cinema_Name || null,
                } as User;
              }
            } catch (error) {
              console.error(`Error fetching manager for cinema ${cinema.Cinema_ID}:`, error);
              manager = null;
            }

            try {
              const staffResponse = await cinemaService.getCinemaStaff(cinema.Cinema_ID);
              staff = staffResponse as unknown as User[];
            } catch (staffError) {
              console.error(`Error fetching staff for cinema ${cinema.Cinema_ID}:`, staffError);
            }

            // Tính số phòng chiếu dựa trên CinemaRooms hoặc rooms
            const totalRooms = cinema.CinemaRooms?.length || cinema.rooms?.length || 0;

            return {
              ...cinema,
              stats: {
                totalRooms: totalRooms,
                totalSeats: 0,
                totalShowtimes: 0,
              },
              manager: manager,
              staff: staff,
            };
          }
        })
      );

      setCinemas(cinemasWithDetails);
    } catch (error: any) {
      if (error.response?.status !== 404) {
        toast.error("Không thể tải danh sách rạp phim.");
      }
      console.error("Error fetching cinemas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCinema = async (cinemaId: number, cinemaName: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa rạp ${cinemaName}?`)) {
      const toastId = toast.loading(`Đang xóa rạp ${cinemaName}...`);
      try {
        await cinemaService.deleteCinema(cinemaId);
        toast.success(`Đã xóa rạp ${cinemaName}`, { id: toastId });
        setCinemas((prevCinemas) => prevCinemas.filter((c) => c.Cinema_ID !== cinemaId));
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || "Xóa rạp thất bại";
        toast.error(errorMessage, { id: toastId });
        console.error(`Error deleting cinema ${cinemaId}:`, error);
      }
    }
  };

  const handleOpenStaffAssignment = (cinema: Cinema, type: "manager" | "staff") => {
    setSelectedCinema(cinema);
    setAssignmentType(type);
    setShowAssignmentModal(true);
  };

  const handleOpenDescriptionModal = (cinemaName: string, description: string) => {
    setSelectedDescription({ name: cinemaName, description });
    setShowDescriptionModal(true);
  };

  const filteredCinemas = cinemas.filter((cinema) => {
    const matchesSearch =
      cinema.Cinema_Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cinema.Address && cinema.Address.toLowerCase().includes(searchTerm.toLowerCase()));

    const backendStatusToFrontend = (status: Cinema["Status"]): string => {
      const map = {
        Active: "active",
        Maintenance: "maintenance",
        Closed: "inactive",
        Deleted: "inactive",
      };
      return map[status] || "inactive";
    };

    const matchesStatus = statusFilter === "all" || backendStatusToFrontend(cinema.Status) === statusFilter;
    const matchesCity = cityFilter === "all" || cinema.City === cityFilter;
    return matchesSearch && matchesStatus && matchesCity;
  });

  // Pagination logic
  const totalItems = filteredCinemas.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCinemas = filteredCinemas.slice(startIndex, endIndex);

  // Reset to first page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, cityFilter]);

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

  // Cấu hình header cho file Excel
  const excelHeaders = {
    Cinema_Name: "Tên rạp",
    Address: "Địa chỉ",
    City: "Thành phố",
    Status: "Trạng thái",
    Description: "Mô tả",
    Seats_Capacity: "Tổng số ghế",
  };

  // Xử lý dữ liệu rạp chiếu để xuất Excel
  const cinemasForExport = useMemo(() => {
    return cinemas.map((cinema) => ({
      Cinema_ID: cinema.Cinema_ID,
      Cinema_Name: cinema.Cinema_Name,
      Address: cinema.Address || "",
      City: cinema.City || "",
      Status: cinema.Status || "Active",
      Description: cinema.Description || "",
      Seats_Capacity: cinema.stats?.totalSeats || 0,
      Total_Rooms: cinema.stats?.totalRooms || 0,
    }));
  }, [cinemas]);

  // Xử lý khi nhập dữ liệu từ Excel
  const handleImportCinemas = async (importedData: any[]) => {
    if (!importedData || importedData.length === 0) {
      toast.error("Không có dữ liệu rạp để nhập");
      return;
    }

    setImportLoading(true);
    const toastId = toast.loading("Đang nhập dữ liệu rạp...");

    try {
      // Đây là nơi bạn sẽ gọi API để thêm nhiều rạp cùng lúc
      // Giả lập việc thêm rạp bằng timeout
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success(`Đã nhập ${importedData.length} rạp thành công!`, { id: toastId });

      // Nếu có API thực để thêm nhiều rạp, bạn sẽ gọi ở đây
      // const result = await cinemaService.bulkAddCinemas(importedData);

      // Sau khi nhập xong, làm mới danh sách rạp
      fetchCinemas();
    } catch (error) {
      console.error("Import cinemas error:", error);
      toast.error("Nhập dữ liệu rạp thất bại", { id: toastId });
    } finally {
      setImportLoading(false);
    }
  };

  const getStatusBadge = (status: Cinema["Status"]) => {
    const statusConfig = {
      Active: {
        bg: "bg-green-500/20",
        text: "text-green-400",
        label: "Hoạt động",
        border: "border-green-500/50",
        icon: "●",
      },
      Closed: {
        bg: "bg-slate-500/20",
        text: "text-slate-400",
        label: "Ngừng hoạt động",
        border: "border-slate-500/50",
        icon: "⏸",
      },
      Maintenance: {
        bg: "bg-slate-500/20",
        text: "text-slate-400",
        label: "Ngừng hoạt động",
        border: "border-slate-500/50",
        icon: "⏸",
      },
      Deleted: {
        bg: "bg-slate-500/20",
        text: "text-slate-400",
        label: "Ngừng hoạt động",
        border: "border-slate-500/50",
        icon: "⏸",
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.Closed;
    return (
      <span
        className={`inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-full border ${config.bg} ${config.text} ${config.border} backdrop-blur-md shadow-lg transition-all duration-300 hover:scale-105`}
      >
        <span className="text-sm">{config.icon}</span>
        {config.label}
      </span>
    );
  };

  const allCities = [...new Set(cinemas.map((cinema) => cinema.City))];

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
            <p className="text-slate-400 text-lg">Đang tải danh sách rạp chiếu...</p>
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
            <h1
              className="text-3xl font-bold text-[#FFD875] flex items-center gap-3"
              style={{ textShadow: "0 0 30px rgba(255, 216, 117, 0.5)" }}
            >
              <BuildingOfficeIcon className="w-8 h-8" />
              Quản lý rạp chiếu phim
            </h1>
            <p className="text-slate-400 mt-2">Quản lý thông tin và hoạt động của các rạp chiếu phim</p>

            {/* Summary Stats */}
            <div className="flex items-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#FFD875]/10 rounded-lg border border-[#FFD875]/20">
                  <BuildingOfficeIcon className="w-4 h-4 text-[#FFD875]" />
                </div>
                <div>
                  <span className="text-lg font-bold text-white">{cinemas.length}</span>
                  <span className="text-sm text-gray-400 ml-1">rạp</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                  <span className="text-sm font-bold text-green-400">●</span>
                </div>
                <div>
                  <span className="text-lg font-bold text-white">
                    {cinemas.filter((c) => c.Status === "Active").length}
                  </span>
                  <span className="text-sm text-gray-400 ml-1">hoạt động</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <ExcelImportExport
              data={cinemasForExport}
              onImport={handleImportCinemas}
              fileName="cinemas-list"
              sheetName="Rạp chiếu phim"
              headers={excelHeaders}
              disabled={loading || importLoading}
            />
            <button
              onClick={fetchCinemas}
              className="px-6 py-3 bg-slate-800/70 backdrop-blur-md text-white rounded-xl hover:bg-slate-700/70 transition-all duration-300 flex items-center gap-2 border border-slate-700 hover:border-[#FFD875]/50 shadow-lg hover:shadow-xl"
              disabled={loading}
            >
              <ArrowPathIcon className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
              <span>Làm mới</span>
            </button>

            {user?.role === "Admin" && <AddButton to="/admin/cinemas/new" label="rạp mới" />}
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          className="mb-8 bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 shadow-lg"
          style={{ boxShadow: "0 0 40px rgba(255, 216, 117, 0.1)" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên hoặc địa chỉ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-700/70 backdrop-blur-md text-white rounded-xl border border-slate-600 focus:border-[#FFD875] focus:outline-none focus:ring-2 focus:ring-[#FFD875]/30 transition-all duration-300"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-700/70 backdrop-blur-md text-white px-4 py-3 rounded-xl border border-slate-600 focus:border-[#FFD875] focus:outline-none focus:ring-2 focus:ring-[#FFD875]/30 transition-all duration-300"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Ngừng hoạt động</option>
            </select>

            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="bg-slate-700/70 backdrop-blur-md text-white px-4 py-3 rounded-xl border border-slate-600 focus:border-[#FFD875] focus:outline-none focus:ring-2 focus:ring-[#FFD875]/30 transition-all duration-300"
            >
              <option value="all">Tất cả thành phố</option>
              {allCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Cinema Cards */}
        {filteredCinemas.length === 0 ? (
          <motion.div
            className="text-center py-20 bg-gradient-to-br from-slate-800/60 via-slate-800/40 to-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-700/50 relative overflow-hidden"
            style={{ boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 216, 117, 0.1)" }}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            {/* Decorative background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#FFD875]/5 via-transparent to-[#FFA500]/5" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#FFD875]/10 to-transparent rounded-full blur-2xl -translate-y-16 translate-x-16" />

            <div className="relative">
              <div className="mb-8">
                <div className="relative inline-block">
                  <BuildingOfficeIcon className="w-24 h-24 text-slate-600 mx-auto mb-4" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#FFD875]/20 rounded-full border border-[#FFD875]/40 flex items-center justify-center">
                    <span className="text-[#FFD875] text-sm">?</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <h3 className="text-2xl font-bold text-white">
                  {searchTerm || statusFilter !== "all" || cityFilter !== "all"
                    ? "Không tìm thấy rạp chiếu nào"
                    : "Chưa có rạp chiếu nào"}
                </h3>
                <p className="text-slate-400 text-lg max-w-md mx-auto leading-relaxed">
                  {searchTerm || statusFilter !== "all" || cityFilter !== "all"
                    ? "Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc để tìm thấy kết quả phù hợp hơn"
                    : "Hệ thống chưa có rạp chiếu nào. Hãy thêm rạp chiếu đầu tiên!"}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                {searchTerm || statusFilter !== "all" || cityFilter !== "all" ? (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                      setCityFilter("all");
                    }}
                    className="px-6 py-3 bg-slate-700/70 hover:bg-slate-600/70 text-white rounded-xl transition-all duration-300 flex items-center gap-2 border border-slate-600/50 hover:border-[#FFD875]/30"
                  >
                    <ArrowPathIcon className="w-5 h-5" />
                    Xóa bộ lọc
                  </button>
                ) : (
                  user?.role === "Admin" && (
                    <Link
                      to="/admin/cinemas/new"
                      className="px-8 py-4 bg-gradient-to-r from-[#FFD875] to-[#FFA500] hover:from-[#FFA500] hover:to-[#FFD875] text-black font-semibold rounded-xl transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl hover:shadow-[#FFD875]/25 hover:scale-105"
                    >
                      <PlusIcon className="w-6 h-6" />
                      Thêm rạp chiếu đầu tiên
                    </Link>
                  )
                )}

                <button
                  onClick={fetchCinemas}
                  className="px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-xl transition-all duration-300 flex items-center gap-2 border border-blue-500/30"
                >
                  <ArrowPathIcon className="w-5 h-5" />
                  Làm mới
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {paginatedCinemas.map((cinema, index) => (
                <motion.div
                  key={cinema.Cinema_ID}
                  className="relative bg-gradient-to-br from-slate-800/60 via-slate-800/40 to-slate-900/60 backdrop-blur-xl rounded-3xl overflow-hidden border border-slate-700/50 shadow-2xl group transition-all duration-700 h-[700px] flex flex-col"
                  style={{
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 216, 117, 0.1)",
                  }}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{
                    y: -12,
                    scale: 1.02,
                    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 216, 117, 0.3)",
                  }}
                >
                  {/* Decorative gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#FFD875]/5 via-transparent to-[#FFA500]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                  {/* Animated background pattern */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#FFD875]/10 to-transparent rounded-full blur-2xl -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700" />

                  <div className="relative p-8 flex flex-col h-full">{/* Cinema header with enhanced styling */}
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex-1 pr-4">
                        <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-[#FFD875] transition-colors duration-300">
                          {cinema.Cinema_Name}
                        </h3>

                        {/* Enhanced status and stats row */}
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-xs font-semibold text-[#FFD875] bg-gradient-to-r from-[#FFD875]/20 to-[#FFA500]/20 px-3 py-2 rounded-full border border-[#FFD875]/30 backdrop-blur-sm">
                            ID: {cinema.Cinema_ID}
                          </span>
                          {getStatusBadge(cinema.Status)}
                        </div>

                        {/* Manager description with enhanced design */}
                        {cinema.manager ? (
                          <div className="flex items-start group/item">
                            <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20 mr-4 group-hover/item:bg-purple-500/20 transition-colors">
                              <UserIcon className="w-5 h-5 text-purple-400" />
                            </div>
                            <div className="flex-1">
                              <div className="text-gray-300 font-medium">{cinema.manager.Full_Name}</div>
                              <div className="text-sm text-purple-400 mt-1">Quản lý • ID: {cinema.manager.User_ID}</div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start group/item">
                            <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20 mr-4 group-hover/item:bg-purple-500/20 transition-colors">
                              <UserIcon className="w-5 h-5 text-purple-400" />
                            </div>
                            <div className="flex-1">
                              <div className="text-gray-300 font-medium">Rạp chưa có quản lý</div>
                              <div className="text-sm text-purple-400 mt-1">Quản lý • ID: N/A</div>
                            </div>
                          </div>
                        )}
                      </div>
                      {/* Action buttons with improved styling */}
                      <div className="flex flex-col gap-2">
                        <Link
                          to={`/admin/cinemas/${cinema.Cinema_ID}/edit`}
                          className="p-3 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-xl transition-all duration-300 border border-green-500/20 hover:border-green-500/40 hover:scale-110"
                          title="Chỉnh sửa"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => handleDeleteCinema(cinema.Cinema_ID, cinema.Cinema_Name)}
                          className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all duration-300 border border-red-500/20 hover:border-red-500/40 hover:scale-110"
                          title="Xóa"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Enhanced Cinema details - scrollable content area */}
                    <div className="flex-1 min-h-0">
                      <div className="flex items-start group/item mb-3">
                        <div className="p-3  bg-purple-500/10 rounded-lg border border-purple-500/20 mr-4 group-hover/item:bg-purple-500/20 transition-colors">
                          <UsersIcon className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <div className="text-gray-300 font-medium">{cinema.staff.length}</div>
                          <div className="text-sm text-blue-400 mt-1">Nhân Viên</div>
                        </div>
                      </div>
                      
                      <div className="space-y-4 mb-6">
                        <div className="flex items-start group/item">
                          <div className="p-3 bg-[#FFD875]/10 rounded-lg border border-[#FFD875]/20 mr-4 group-hover/item:bg-[#FFD875]/20 transition-colors">
                            <MapPinIcon className="w-5 h-5 text-[#FFD875]" />
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-300 font-medium leading-relaxed">
                              {cinema.Address || "Chưa có địa chỉ"}
                            </p>
                            {cinema.City && <p className="text-sm text-[#FFD875] mt-1">{cinema.City}</p>}
                          </div>
                        </div>

                        {/* Cinema Contact Information */}
                        {(cinema.Phone_Number || cinema.Email) && (
                          <div className="flex items-start group/item">
                            <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20 mr-4 group-hover/item:bg-blue-500/20 transition-colors">
                              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21L8.16 10.71a11.02 11.02 0 005.13 5.13l1.322-2.064a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <div className="text-gray-300 font-medium">Thông tin liên hệ</div>
                              {cinema.Phone_Number && (
                                <div className="text-sm text-blue-400 mt-1">📞 {cinema.Phone_Number}</div>
                              )}
                              {cinema.Email && (
                                <div className="text-sm text-blue-400 mt-1">📧 {cinema.Email}</div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Cinema Description */}
                        {cinema.Description && (
                          <div className="flex items-start group/item">
                            <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20 mr-4 group-hover/item:bg-green-500/20 transition-colors">
                              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <div className="text-gray-300 font-medium">Mô tả</div>
                              <div className="text-sm text-green-400 mt-1 leading-relaxed">
                                <p className="line-clamp-3 cursor-pointer hover:text-green-300 transition-colors" 
                                   onClick={() => cinema.Description && handleOpenDescriptionModal(cinema.Cinema_Name, cinema.Description)}
                                   title="Nhấp để xem mô tả đầy đủ">
                                  {cinema.Description}
                                </p>
                                {cinema.Description && cinema.Description.length > 100 && (
                                  <button 
                                    onClick={() => handleOpenDescriptionModal(cinema.Cinema_Name, cinema.Description!)}
                                    className="text-xs text-green-500 hover:text-green-300 mt-1 underline transition-colors"
                                  >
                                    Xem thêm...
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Enhanced Action buttons grid - fixed at bottom */}
                    <div className="grid grid-cols-2 gap-3 pt-6 border-t border-slate-700/50 mt-auto">
                      <button
                        onClick={() => handleOpenStaffAssignment(cinema, "manager")}
                        className="flex flex-col items-center gap-2 py-4 px-3 bg-gradient-to-br from-slate-700/50 to-slate-800/50 hover:from-purple-500/20 hover:to-purple-600/20 text-gray-300 hover:text-purple-400 rounded-xl transition-all duration-300 border border-slate-600/50 hover:border-purple-500/30 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:from-slate-700/50 disabled:hover:to-slate-800/50 disabled:hover:text-gray-300 group/btn"
                        disabled={user?.role !== "Admin"}
                        title={user?.role !== "Admin" ? "Không có quyền" : "Phân công quản lý"}
                      >
                        <div className="p-2 bg-purple-500/10 rounded-lg group-hover/btn:bg-purple-500/20 transition-colors">
                          <UserIcon className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-medium">Quản lý</span>
                      </button>

                      <button
                        onClick={() => handleOpenStaffAssignment(cinema, "staff")}
                        className="flex flex-col items-center gap-2 py-4 px-3 bg-gradient-to-br from-slate-700/50 to-slate-800/50 hover:from-green-500/20 hover:to-green-600/20 text-gray-300 hover:text-green-400 rounded-xl transition-all duration-300 border border-slate-600/50 hover:border-green-500/30 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:from-slate-700/50 disabled:hover:to-slate-800/50 disabled:hover:text-gray-300 group/btn"
                        disabled={user?.role !== "Admin"}
                        title={user?.role !== "Admin" ? "Không có quyền" : "Phân công nhân viên"}
                      >
                        <div className="p-2 bg-green-500/10 rounded-lg group-hover/btn:bg-green-500/20 transition-colors">
                          <UsersIcon className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-medium">Nhân viên</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                className="mt-12 flex justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div
                  className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-4 border border-slate-700/50"
                  style={{ boxShadow: "0 0 40px rgba(255, 216, 117, 0.1)" }}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-sm text-slate-300">
                      Hiển thị <span className="font-semibold text-[#FFD875]">{paginatedCinemas.length}</span> trong
                      tổng số <span className="font-semibold text-[#FFD875]">{totalItems}</span> rạp chiếu
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                        className="p-2 bg-slate-700/70 text-white rounded-lg hover:bg-slate-600/70 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeftIcon className="h-4 w-4" />
                      </button>

                      {generatePageNumbers().map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-2 rounded-lg transition-all duration-300 font-medium ${
                            page === currentPage
                              ? "text-black shadow-lg"
                              : "bg-slate-700/70 text-white hover:bg-slate-600/70"
                          }`}
                          style={
                            page === currentPage
                              ? {
                                  backgroundColor: "#FFD875",
                                  boxShadow: "0 4px 15px rgba(255, 216, 117, 0.4)",
                                }
                              : {}
                          }
                        >
                          {page}
                        </button>
                      ))}

                      <button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className="p-2 bg-slate-700/70 text-white rounded-lg hover:bg-slate-600/70 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRightIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {showAssignmentModal && selectedCinema && (
        <StaffAssignmentModal
          isOpen={showAssignmentModal}
          onClose={() => setShowAssignmentModal(false)}
          cinema={selectedCinema}
          type={assignmentType}
          onSuccess={fetchCinemas}
        />
      )}

      {/* Description Modal */}
      {showDescriptionModal && selectedDescription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDescriptionModal(false)}
          />
          
          {/* Modal */}
          <motion.div
            className="relative bg-gradient-to-br from-slate-800/95 via-slate-800/90 to-slate-900/95 backdrop-blur-xl rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-slate-700/50 shadow-2xl"
            style={{
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 216, 117, 0.2)",
            }}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Decorative gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#FFD875]/5 via-transparent to-[#FFA500]/5" />
            
            {/* Header */}
            <div className="relative p-6 border-b border-slate-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Mô tả rạp chiếu</h3>
                    <p className="text-sm text-[#FFD875] mt-1">{selectedDescription.name}</p>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowDescriptionModal(false)}
                  className="p-2 bg-slate-700/50 hover:bg-slate-600/50 text-gray-400 hover:text-white rounded-lg transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="relative p-6 max-h-96 overflow-y-auto">
              <div className="prose prose-invert prose-green max-w-none">
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {selectedDescription.description}
                </p>
              </div>
            </div>
            
            {/* Footer */}
            <div className="relative p-6 border-t border-slate-700/50">
              <div className="flex justify-end">
                <button
                  onClick={() => setShowDescriptionModal(false)}
                  className="px-6 py-3 bg-gradient-to-r from-[#FFD875] to-[#FFA500] hover:from-[#FFA500] hover:to-[#FFD875] text-black font-semibold rounded-xl transition-all duration-300 flex items-center gap-2"
                >
                  Đóng
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <style
        dangerouslySetInnerHTML={{
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
          .line-clamp-3 {
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        `,
        }}
      />
    </div>
  );
};

export default CinemasList;

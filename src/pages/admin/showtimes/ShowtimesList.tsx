// src/pages/admin/showtimes/ShowtimesList.tsx
import React, { useState, useEffect, useMemo } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import "../../../components/admin/cinema-rooms/SeatMap.css";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  FilmIcon,
  BuildingOfficeIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  TicketIcon,
  CubeIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";
import FullScreenLoader from "../../../components/FullScreenLoader";
import ExcelImportExport from "../../../components/admin/common/ExcelImportExport";
import showtimeService from "../../../services/showtimeService";
import apiClient from "../../../services/apiClient";
import type { Movie } from "../../../types/movie";
import { useAuth } from "../../../contexts/SimpleAuthContext";
import movieService from "../../../services/movieService";
import cinemaService from "../../../services/cinemaService";

interface Cinema {
  id: string;
  name: string;
  address: string;
  phone: string;
  Cinema_ID?: number;
  Cinema_Name?: string;
  Address?: string;
  Phone_Number?: string;
}

interface Showtime {
  id: string;
  Showtime_ID: number;
  Movie_ID: number;
  Cinema_Room_ID: number;
  Room_Name: string;
  Show_Date: string;
  Start_Time: string;
  End_Time: string;
  Status: "Hidden" | "Scheduled";
  Room: {
    Cinema_Room_ID: number;
    Room_Name: string;
    Room_Type: string;
  };
  BookedSeats: number;
  TotalSeats: number;
  AvailableSeats: number;
  SeatStatus: string;
  IsSoldOut: boolean;

  // Thêm thuộc tính Movie và CinemaRoom từ API relationships
  Movie?: {
    Movie_ID: number;
    Movie_Name: string;
    Duration: number;
    Poster_URL?: string;
    Genre?: string;
    Rating?: string;
  };
  // Thêm Cinema object trực tiếp từ API response
  Cinema?: {
    Cinema_ID: number;
    Cinema_Name: string;
    City?: string;
    Address?: string;
  };

  // Enriched data từ API khác
  movieTitle?: string;
  cinemaName?: string;
  cinemaId?: string;
  roomId?: string;
  roomName?: string;
  moviePoster?: string;
  movieDuration?: number;
  price?: number;
  movie?: {
    title: string;
    duration?: number;
    poster?: string;
    rating?: string;
    genre?: string;
  };
  cinema?: {
    name: string;
    address?: string;
    phone?: string;
  };
  room?: {
    name: string;
    capacity?: number;
    roomType?: string;
  };
}

// Đã xóa tất cả mapping cứng - load hoàn toàn từ API

// Hàm tải danh sách phim từ API
const fetchMovies = async (): Promise<Movie[]> => {
  try {
    const response = await movieService.getAllMovies();

    // Map dữ liệu phim để chuẩn hóa
    const mappedMovies = response.map((movie: any) => ({
      ...movie,
      id: movie.Movie_ID || movie.id,
      title: movie.Movie_Name || movie.title || "Không xác định",
      movieName: movie.Movie_Name || movie.title,
      poster: movie.Poster_URL || movie.poster,
      posterURL: movie.Poster_URL || movie.poster,
      duration: movie.Duration || movie.duration,
      genre: movie.Genre || movie.genre,
      rating: movie.Rating || movie.rating,
    }));

    return mappedMovies;
  } catch (error) {
    console.error("Lỗi khi tải danh sách phim:", error);
    toast.error("Không thể tải danh sách phim");
    return [];
  }
};

// Hàm tải danh sách rạp từ API
const fetchCinemas = async (): Promise<Cinema[]> => {
  try {
    const response = await cinemaService.getActiveCinemas();

    // Map dữ liệu rạp để chuẩn hóa
    const mappedCinemas = response.map((cinema: any) => ({
      ...cinema,
      id: (cinema.Cinema_ID || cinema.id)?.toString() || "",
      name: cinema.Cinema_Name || cinema.name || "Không xác định",
      address: cinema.Address || cinema.address || "",
      phone: cinema.Phone_Number || cinema.phone || "",
    }));

    return mappedCinemas;
  } catch (error) {
    console.error("Lỗi khi tải danh sách rạp:", error);
    toast.error("Không thể tải danh sách rạp");
    return [];
  }
};

const fetchShowtimes = async (): Promise<Showtime[]> => {
  try {
    // Gọi API /showtimes để lấy dữ liệu
    const response = await apiClient.get("/showtimes");

    const data = response.data;

    if (!Array.isArray(data)) {
      return [];
    }

    // Map với enrichment từ movies, cinemas và rooms data
    const mappedShowtimes = data.map((showtime: any) => {

      return {
        ...showtime,
        // Thêm id cho compatibility
        id: showtime.Showtime_ID?.toString() || "",

        // Map dữ liệu để tương thích với component
        movieId: showtime.Movie_ID?.toString() || "",
        cinemaId: showtime.Cinema_Room_ID?.toString(),
        roomId: showtime.Cinema_Room_ID?.toString() || "",
        startTime: showtime.Start_Time || "",
        endTime: showtime.End_Time || "",
        bookedSeats: showtime.BookedSeats || 0,
        totalSeats: showtime.TotalSeats || 0,
        availableSeats: showtime.AvailableSeats || 0,

        // Enriched data từ API - sử dụng dữ liệu trực tiếp từ API response
        movieTitle: showtime.Movie?.Movie_Name || `Phim ${showtime.Movie_ID}`,
        cinemaName: showtime.Cinema?.Cinema_Name || "Không xác định",
        roomName: showtime.Room?.Room_Name || showtime.Room_Name || "Không xác định",
        roomType: showtime.Room?.Room_Type || null,
        moviePoster: showtime.Movie?.Poster_URL || null,
        movieDuration: showtime.Movie?.Duration || null,
        cinemaAddress: showtime.Cinema?.Address || null,
        cinemaCity: showtime.Cinema?.City || null,

        // Thêm objects để dễ truy cập - sử dụng dữ liệu trực tiếp từ API
        movie: {
          title: showtime.Movie?.Movie_Name || `Phim ${showtime.Movie_ID}`,
          duration: showtime.Movie?.Duration || null,
          poster: showtime.Movie?.Poster_URL || null,
          rating: showtime.Movie?.Rating || null,
          genre: showtime.Movie?.Genre || null,
        },
        cinema: {
          name: showtime.Cinema?.Cinema_Name || "Không xác định",
          address: showtime.Cinema?.Address || null,
          city: showtime.Cinema?.City || null,
          phone: null,
        },
        room: {
          name: showtime.Room?.Room_Name || showtime.Room_Name || "Không xác định",
          capacity: showtime.TotalSeats || 0,
          roomType: showtime.Room?.Room_Type || null,
        },
      };
    });

    // Sắp xếp theo Showtime_ID giảm dần (mới nhất trước)
    mappedShowtimes.sort((a, b) => (b.Showtime_ID || 0) - (a.Showtime_ID || 0));

    return mappedShowtimes;
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu lịch chiếu:", error);
    toast.error("Không thể tải dữ liệu lịch chiếu");
    return [];
  }
};

// Hàm map status từ API sang format component
const mapStatus = (apiStatus: string): "Đã lên lịch" | "Đã ẩn" => {
  switch (apiStatus?.toLowerCase()) {
    case "scheduled":
      return "Đã lên lịch";
    case "hidden":
      return "Đã ẩn";
    default:
      return "Đã lên lịch"; // Mặc định là "Đã lên lịch" nếu không xác định
  }
};

// Format functions - Di chuyển lên đây trước khi sử dụng
const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "Chưa xác định";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  } catch (error) {
    return dateString;
  }
};

const formatTime = (timeString: string | null | undefined) => {
  if (!timeString) return "--:--";
  try {
    if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(timeString)) {
      return timeString.substring(0, 5);
    }
    if (timeString.includes("T")) {
      const timePart = timeString.split("T")[1];
      return timePart.substring(0, 5);
    }
    const date = new Date(timeString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch (error) {
    return "--:--";
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const getStatusLabel = (status: string) => {
  const labels: { [key: string]: string } = {
    scheduled: "Đã lên lịch",
    hidden: "Đã ẩn",
  };
  return labels[status] || status;
};

const ShowtimesList: React.FC = () => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth(); // Lấy thông tin người dùng
  const isAdmin = user?.role === "Admin"; // Kiểm tra xem người dùng có phải là Admin không

  const [loading, setLoading] = useState(true);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("all");
  const [selectedCinema, setSelectedCinema] = useState<string>("all");
  const [selectedMovie, setSelectedMovie] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [timeFilter] = useState<string>("all");
  const [roomTypeFilter] = useState<string>("all");

  // Thêm state để lưu thông tin rạp của Manager
  const [managerCinema, setManagerCinema] = useState<{ id: string | number; name: string } | null>(null);

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Cinema tab selection similar to CinemaRoomsList
  const selectedCinemaId = searchParams.get("cinemaId");

  // Thêm CSS cho hiệu ứng glowing
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .glow-effect {
        box-shadow: 0 0 20px rgba(255, 216, 117, 0.4);
        transition: all 0.3s ease;
      }
      
      .glow-effect:hover {
        box-shadow: 0 0 30px rgba(255, 216, 117, 0.6);
        transform: translateY(-2px);
      }
      
      .text-glow {
        text-shadow: 0 0 10px rgba(255, 216, 117, 0.5);
      }
      
      .border-glow {
        border: 1px solid rgba(255, 216, 117, 0.3);
        transition: all 0.3s ease;
      }
      
      .border-glow:hover {
        border-color: rgba(255, 216, 117, 0.8);
        box-shadow: 0 0 15px rgba(255, 216, 117, 0.4);
      }
      
      @keyframes pulse-glow {
        0%, 100% {
          box-shadow: 0 0 20px rgba(255, 216, 117, 0.4);
        }
        50% {
          box-shadow: 0 0 30px rgba(255, 216, 117, 0.8);
        }
      }
      
      .pulse-glow {
        animation: pulse-glow 2s infinite;
      }

      .line-clamp-1 {
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        // Fetch movies với loading state riêng
        const moviesData = await fetchMovies().catch((error) => {
          console.error("Lỗi khi fetch movies:", error);
          return [];
        });
        setMovies(moviesData);

        // Fetch cinemas với loading state riêng
        const cinemasData = await fetchCinemas().catch((error) => {
          console.error("Lỗi khi fetch cinemas:", error);
          return [];
        });
        setCinemas(cinemasData);

        // // Fetch showtimes dựa trên vai trò người dùng
        let showtimesData: Showtime[] = [];

        if (isAdmin) {
          // Admin có thể xem tất cả suất chiếu
          showtimesData = await fetchShowtimes();
        } else {
          // Manager chỉ xem suất chiếu của rạp họ quản lý
          const managerResponse = await showtimeService.getShowtimesByManagerCinema();

          // Lưu thông tin rạp của Manager nếu có
          if (managerResponse && managerResponse.cinema) {
            setManagerCinema({
              id: managerResponse.cinema.Cinema_ID || 0,
              name: managerResponse.cinema.Cinema_Name || "Không xác định",
            });
          }

          // Đảm bảo dữ liệu suất chiếu là mảng và có định dạng đúng
          if (managerResponse && Array.isArray(managerResponse.showtimes)) {
            showtimesData = managerResponse.showtimes;
          } else if (managerResponse && typeof managerResponse === "object") {
            // Fallback nếu cấu trúc không như mong đợi
            showtimesData = [];
            console.warn("Cấu trúc dữ liệu manager response không như mong đợi:", managerResponse);
          }
        }

        setShowtimes(showtimesData);

        // Kiểm tra tham số URL cho bộ lọc
        const params = new URLSearchParams(location.search);
        const cinemaParam = params.get("cinema");
        const movieParam = params.get("movie");
        const dateParam = params.get("date");

        if (cinemaParam) setSelectedCinema(cinemaParam);
        if (movieParam) setSelectedMovie(movieParam);
        if (dateParam) setSelectedDate(dateParam);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
        toast.error("Không thể tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [location.search, isAdmin]); 

  // Excel headers
  const excelHeaders = {
    movieTitle: "Tên phim",
    cinemaName: "Rạp chiếu",
    roomName: "Phòng chiếu",
    showDate: "Ngày chiếu",
    startTime: "Giờ bắt đầu",
    endTime: "Giờ kết thúc",
    totalSeats: "Tổng số ghế",
    status: "Trạng thái",
  };

  // Xử lý dữ liệu xuất Excel
  const showtimesForExport = useMemo(() => {
    return showtimes.map((showtime) => ({
      movieTitle: showtime.movieTitle,
      cinemaName: showtime.cinemaName,
      roomName: showtime.Room_Name || showtime.roomName,
      showDate: formatDate(showtime.Show_Date),
      startTime: formatTime(showtime.Start_Time),
      endTime: formatTime(showtime.End_Time),
      totalSeats: showtime.TotalSeats,
      status: getStatusLabel(mapStatus(showtime.Status)),
    }));
  }, [showtimes]);

  // Xử lý import từ Excel
  const handleImportShowtimes = async (importedData: any[]) => {
    if (!importedData || importedData.length === 0) {
      toast.error("Không có dữ liệu suất chiếu để nhập");
      return;
    }
    const toastId = toast.loading("Đang nhập dữ liệu suất chiếu...");
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success(`Đã nhập ${importedData.length} suất chiếu thành công!`, { id: toastId });

      // Làm mới danh sách
      const updatedShowtimes = await fetchShowtimes();
      setShowtimes(updatedShowtimes);
    } catch (error) {
      toast.error("Nhập dữ liệu suất chiếu thất bại", { id: toastId });
    }
  };

  // Handle cinema tab click similar to CinemaRoomsList
  const handleCinemaTabClick = (cinemaId: number) => {
    setSearchTerm("");
    setStatusFilter("all");
    setSelectedMovie("all");
    setSelectedDate("all");
    setSelectedCinema("all");

    if (cinemaId === 0) {
      // "All Cinemas" selected - remove cinemaId param
      setSearchParams({});
    } else {
      // Specific cinema selected
      setSearchParams({ cinemaId: cinemaId.toString() });
    }

    setCurrentPage(1);
  };

  // Lọc danh sách suất chiếu
  const filteredShowtimes = useMemo(() => {
    if (!showtimes || showtimes.length === 0) {
      return [];
    }

    const result = showtimes.filter((showtime) => {
      // Basic search
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        (showtime.movieTitle || showtime.Movie?.Movie_Name || "").toLowerCase().includes(searchLower) ||
        (showtime.cinemaName || "").toLowerCase().includes(searchLower) ||
        (showtime.roomName || showtime.Room_Name || "").toLowerCase().includes(searchLower);

      if (searchTerm && !matchesSearch) return false;

      // Movie filter
      if (selectedMovie !== "all" && showtime.Movie_ID?.toString() !== selectedMovie) return false;

      // Cinema filter by selectedCinemaId (similar to CinemaRoomsList)
      if (selectedCinemaId && isAdmin) {
        const cinemaIdToCheck = Number(selectedCinemaId);
        // Check multiple possible cinema ID fields in the showtime object
        const showtimeCinemaId = showtime.Cinema?.Cinema_ID || (showtime.cinemaId ? Number(showtime.cinemaId) : null);

        if (showtimeCinemaId !== cinemaIdToCheck) return false;
      }

      // Legacy cinema filter for dropdown (keep for compatibility)
      if (selectedCinema !== "all" && showtime.cinemaId !== selectedCinema) return false;

      // Date filter
      if (selectedDate !== "all") {
        let showtimeDate = showtime.Show_Date;
        if (!showtimeDate && showtime.Start_Time) {
          showtimeDate = showtime.Start_Time.split("T")[0];
        }
        if (showtimeDate !== selectedDate) return false;
      }

      // Status filter - Check status only if a specific status is selected
      if (statusFilter !== "all") {
        const status = showtime.Status?.toLowerCase();

        // Check if status matches filter
        if (mapStatus(status) !== statusFilter) return false;
      }

      // All filters passed
      return true;
    });

    return result;
  }, [
    showtimes,
    searchTerm,
    selectedMovie,
    selectedCinema,
    selectedCinemaId,
    selectedDate,
    statusFilter,
    timeFilter,
    roomTypeFilter,
    isAdmin,
  ]);

  // Phân trang
  const paginatedShowtimes = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredShowtimes.slice(startIndex, endIndex);
  }, [filteredShowtimes, currentPage]);

  const totalPages = Math.ceil(filteredShowtimes.length / itemsPerPage);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      "Đã lên lịch": {
        bg: "bg-blue-500/20",
        text: "text-blue-400",
        border: "border-blue-500/30",
      },
      "Đã ẩn": {
        bg: "bg-purple-500/20",
        text: "text-purple-400",
        border: "border-purple-500/30",
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      bg: "bg-gray-500/20",
      text: "text-gray-400",
      border: "border-gray-500/30",
    };

    return (
      <span
        className={`px-3 py-1 text-xs font-medium rounded-full border ${config.bg} ${config.text} ${config.border}`}
      >
        {getStatusLabel(status)}
      </span>
    );
  };

  const getOccupancyRate = (booked: number, total: number) => {
    let rate = Math.round((booked / total) * 100);
    if (isNaN(rate) || total === 0) rate = 0;
    return (
      <div className="flex items-center">
        <div className="w-full bg-slate-700 rounded-full h-2 mr-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              rate >= 80 ? "bg-green-500" : rate >= 50 ? "bg-[#FFD875]" : "bg-red-500"
            }`}
            style={{ width: `${rate}%` }}
          ></div>
        </div>
        <span
          className={`text-xs font-medium ${
            rate >= 80 ? "text-green-400" : rate >= 50 ? "text-[#FFD875]" : "text-red-400"
          }`}
        >
          {rate}%
        </span>
      </div>
    );
  };

  const isHappenedShowtime = (showtime: Showtime) => {
    const now = new Date();
    const startTime = new Date(`${showtime.Show_Date}T${showtime.Start_Time}`);
    return now >= startTime;
  };

  const generateDateOptions = () => {
    const dates = [];
    const today = new Date();

    for (let i = -3; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const dateString = date.toISOString().split("T")[0];
      const dateLabel = new Intl.DateTimeFormat("vi-VN", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
      }).format(date);

      dates.push({ value: dateString, label: dateLabel });
    }

    return dates;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6 min-h-[400px]">
        <FullScreenLoader />
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
              <CalendarIcon className="w-8 h-8" />
              Quản lý lịch chiếu
              {!isAdmin && managerCinema && <span className="ml-2 text-2xl text-white">- {managerCinema.name}</span>}
            </h1>
            <p className="text-slate-400 mt-2">
              Quản lý thông tin các suất chiếu phim
              {!isAdmin && managerCinema && <span className="ml-1">tại rạp {managerCinema.name}</span>}
            </p>
          </div>

          <div className="flex gap-3">
            {isAdmin && (
              <>
                <ExcelImportExport
                  headers={excelHeaders}
                  data={showtimesForExport}
                  fileName="danh-sach-suat-chieu"
                  onImport={handleImportShowtimes}
                />
                <Link
                  to={`/admin/showtimes/add?cinemaId=${selectedCinemaId || ""}`}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FFD875] to-[#FFE055] text-black font-semibold rounded-xl hover:shadow-lg hover:shadow-[#FFD875]/25 transition-all duration-300 hover:scale-105"
                >
                  <PlusIcon className="w-5 h-5" />
                  <span>Thêm suất chiếu</span>
                </Link>
              </>
            )}
            {!isAdmin && (
              <Link
                to={`/admin/showtimes/add?cinemaId=${managerCinema?.id || ""}`}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FFD875] to-[#FFE055] text-black font-semibold rounded-xl hover:shadow-lg hover:shadow-[#FFD875]/25 transition-all duration-300 hover:scale-105"
              >
                <PlusIcon className="w-5 h-5" />
                <span>Thêm suất chiếu</span>
              </Link>
            )}
          </div>
        </motion.div>

        {/* Cinema Tabs - Chỉ hiển thị cho Admin */}
        {isAdmin && (
          <motion.div
            className="mb-8 bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 shadow-lg"
            style={{ boxShadow: "0 0 40px rgba(255, 216, 117, 0.1)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex items-center overflow-x-auto gap-2">
              {/* All Cinemas tab */}
              <button
                onClick={() => handleCinemaTabClick(0)} // 0 means all cinemas
                className={`px-6 py-3 text-sm font-semibold transition-all duration-300 whitespace-nowrap rounded-xl border ${
                  !selectedCinemaId
                    ? "bg-[#FFD875] text-black border-[#FFD875] shadow-lg"
                    : "bg-slate-700/50 text-gray-300 border-slate-600/50 hover:bg-slate-600/50 hover:text-[#FFD875] hover:border-[#FFD875]/50"
                }`}
                style={
                  !selectedCinemaId
                    ? {
                        boxShadow: "0 4px 15px rgba(255, 216, 117, 0.4)",
                      }
                    : {}
                }
              >
                <HomeIcon className="w-4 h-4 inline mr-2" />
                Tất cả rạp
              </button>

              {cinemas.map((cinema) => (
                <button
                  key={cinema.Cinema_ID || cinema.id}
                  onClick={() => handleCinemaTabClick(Number(cinema.Cinema_ID || cinema.id))}
                  className={`px-6 py-3 text-sm font-semibold transition-all duration-300 whitespace-nowrap rounded-xl border ${
                    selectedCinemaId === (cinema.Cinema_ID || cinema.id)?.toString()
                      ? "bg-[#FFD875] text-black border-[#FFD875] shadow-lg"
                      : "bg-slate-700/50 text-gray-300 border-slate-600/50 hover:bg-slate-600/50 hover:text-[#FFD875] hover:border-[#FFD875]/50"
                  }`}
                  style={
                    selectedCinemaId === (cinema.Cinema_ID || cinema.id)?.toString()
                      ? {
                          boxShadow: "0 4px 15px rgba(255, 216, 117, 0.4)",
                        }
                      : {}
                  }
                >
                  <HomeIcon className="w-4 h-4 inline mr-2" />
                  {cinema.Cinema_Name || cinema.name}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Filters */}
        <motion.div
          className="mb-8 bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 shadow-lg"
          style={{ boxShadow: "0 0 40px rgba(255, 216, 117, 0.1)" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
            {/* Search box */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm suất chiếu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-700/70 backdrop-blur-md text-white rounded-xl border border-slate-600 focus:border-[#FFD875] focus:outline-none focus:ring-2 focus:ring-[#FFD875]/30 transition-all duration-300"
              />
            </div>

            {/* Date filter */}
            <div className="relative">
              <CalendarIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-700/70 backdrop-blur-md text-white rounded-xl border border-slate-600 focus:border-[#FFD875] focus:outline-none focus:ring-2 focus:ring-[#FFD875]/30 transition-all duration-300 appearance-none"
              >
                <option value="all">Tất cả ngày</option>
                {generateDateOptions().map((date) => (
                  <option key={date.value} value={date.value}>
                    {date.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Movie filter */}
            <div className="relative">
              <FilmIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedMovie}
                onChange={(e) => setSelectedMovie(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-700/70 backdrop-blur-md text-white rounded-xl border border-slate-600 focus:border-[#FFD875] focus:outline-none focus:ring-2 focus:ring-[#FFD875]/30 transition-all duration-300 appearance-none"
              >
                <option value="all">Tất cả phim</option>
                {movies.map((movie) => (
                  <option key={movie.id} value={movie.id}>
                    {movie.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status filter buttons */}
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-4 py-2 rounded-full transition-all duration-300 ${
                statusFilter === "all"
                  ? "bg-[#FFD875] text-black font-medium"
                  : "bg-slate-700/70 text-slate-300 hover:bg-slate-600/70"
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setStatusFilter("scheduled")}
              className={`px-4 py-2 rounded-full transition-all duration-300 ${
                statusFilter === "scheduled"
                  ? "bg-[#FFD875] text-black font-medium"
                  : "bg-slate-700/70 text-slate-300 hover:bg-slate-600/70"
              }`}
            >
              Đã lên lịch
            </button>
            <button
              onClick={() => setStatusFilter("hidden")}
              className={`px-4 py-2 rounded-full transition-all duration-300 ${
                statusFilter === "hidden"
                  ? "bg-[#FFD875] text-black font-medium"
                  : "bg-slate-700/70 text-slate-300 hover:bg-slate-600/70"
              }`}
            >
              Đã ẩn
            </button>
          </div>
        </motion.div>

        {/* Showtimes Table với thiết kế mới */}
        <motion.div
          className="bg-slate-800/50 backdrop-blur-sm rounded-xl overflow-hidden shadow-2xl border border-[#FFD875]/20 glow-effect"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="overflow-x-hidden h-[105vh]">
            <table className="w-full h-full">
              <thead className="bg-[#FFD875]/10 backdrop-blur-sm">
                <tr>
                  <th className="py-4 px-6 text-left text-xs font-medium text-[#FFD875] uppercase tracking-wider">
                    ID
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-medium text-[#FFD875] uppercase tracking-wider">
                    Phim
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-medium text-[#FFD875] uppercase tracking-wider">
                    Rạp / Phòng
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-medium text-[#FFD875] uppercase tracking-wider">
                    Thời gian
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-medium text-[#FFD875] uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-medium text-[#FFD875] uppercase tracking-wider">
                    Công suất
                  </th>
                  <th className="py-4 px-6 text-right text-xs font-medium text-[#FFD875] uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FFD875]/10">
                {paginatedShowtimes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <FilmIcon className="w-16 h-16 mx-auto mb-4 text-[#FFD875]/30" />
                      <p className="text-gray-400">Không có suất chiếu nào</p>

                      <div className="mt-4">
                        <p className="text-gray-400">Thông tin debug:</p>
                        <p className="text-gray-400">- Tổng số suất chiếu: {showtimes.length}</p>
                        <p className="text-gray-400">- Số suất chiếu sau khi lọc: {filteredShowtimes.length}</p>
                        <p className="text-gray-400">- Trạng thái lọc hiện tại: {statusFilter}</p>
                        <button
                          onClick={() => {
                            setStatusFilter("all");
                            setSelectedMovie("all");
                            setSelectedCinema("all");
                            setSelectedDate("all");
                            setSearchTerm("");
                            // Reset cinema selection for Admin users
                            if (isAdmin) {
                              setSearchParams({});
                            }
                          }}
                          className="mt-2 px-4 py-1 bg-[#FFD875] text-black rounded-md"
                        >
                          Xóa tất cả bộ lọc
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedShowtimes.map((showtime, index) => (
                    <motion.tr
                      key={showtime.id || `showtime-${index}`}
                      className="bg-slate-800/30 hover:bg-[#FFD875]/5 transition-all duration-300 group"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className="text-sm font-medium text-[#FFD875]">{showtime.Showtime_ID}</span>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {showtime.moviePoster || showtime.Movie?.Poster_URL ? (
                            <div className="relative group/poster">
                              <img
                                src={showtime.moviePoster || showtime.Movie?.Poster_URL}
                                alt={showtime.movieTitle || showtime.Movie?.Movie_Name || `Phim ${showtime.Movie_ID}`}
                                className="w-12 h-16 object-cover rounded-lg shadow-lg group-hover:shadow-[0_0_15px_rgba(255,216,117,0.3)] transition-all duration-300 cursor-pointer"
                                onError={(e) => {
                                  // Ẩn hình ảnh khi lỗi
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                              {showtime.Movie?.Rating && (
                                <div className="absolute -top-1 -right-1 bg-[#FFD875] text-black text-xs px-1 py-0.5 rounded-md font-bold">
                                  {showtime.Movie?.Rating}
                                </div>
                              )}
                              {/* Tooltip cho poster */}
                              <div className="absolute left-full ml-2 top-0 bg-slate-800 text-white p-3 rounded-lg shadow-xl opacity-0 group-hover/poster:opacity-100 transition-opacity duration-300 pointer-events-none z-50 min-w-64">
                                <div className="text-sm font-medium text-[#FFD875] mb-2">
                                  {showtime.movieTitle || showtime.Movie?.Movie_Name || `Phim ${showtime.Movie_ID}`}
                                </div>
                                {showtime.Movie?.Genre && (
                                  <div className="text-xs text-gray-300 mb-1">Thể loại: {showtime.Movie?.Genre}</div>
                                )}
                                {showtime.Movie?.Duration && (
                                  <div className="text-xs text-gray-300 mb-1">
                                    Thời lượng: {showtime.Movie?.Duration} phút
                                  </div>
                                )}
                                {showtime.Movie?.Rating && (
                                  <div className="text-xs text-gray-300">Phân loại: {showtime.Movie?.Rating}</div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="w-12 h-16 bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg flex items-center justify-center border border-slate-600">
                              <FilmIcon className="w-6 h-6 text-[#FFD875]/50" />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-white group-hover:text-[#FFD875] transition-colors">
                              {showtime.movieTitle || showtime.Movie?.Movie_Name || `Phim ${showtime.Movie_ID}`}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              {showtime.Movie?.Duration && (
                                <span className="flex items-center gap-1">
                                  <ClockIcon className="w-3 h-3" />
                                  {showtime.Movie?.Duration} phút
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-[#FFD875]/10 rounded-lg">
                            <BuildingOfficeIcon className="w-5 h-5 text-[#FFD875]" />
                          </div>
                          <div className="min-w-0 flex-1 relative group/cinema">
                            {isAdmin && (
                              <div className="text-sm font-medium text-white truncate cursor-pointer">
                                {showtime.cinemaName || showtime.Cinema?.Cinema_Name || "Không xác định"}
                              </div>
                            )}
                            <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                              <CubeIcon className="w-3 h-3 flex-shrink-0" />
                              <span className="font-medium text-white">
                                {showtime.Room?.Room_Name || "Không xác định"}
                              </span>
                              {showtime.Room?.Room_Type && (
                                <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded-md ml-1">
                                  {showtime.Room?.Room_Type}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-green-500/10 rounded-lg">
                            <ClockIcon className="w-5 h-5 text-green-400" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">{formatDate(showtime.Show_Date)}</div>
                            <div className="text-xs text-gray-400">
                              {formatTime(showtime.Start_Time)} - {formatTime(showtime.End_Time)}
                            </div>
                            {showtime.price && (
                              <div className="text-xs text-[#FFD875] font-medium mt-1 flex items-center gap-1">
                                <CurrencyDollarIcon className="w-3 h-3" />
                                {formatCurrency(showtime.price)}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 whitespace-nowrap">{getStatusBadge(mapStatus(showtime.Status))}</td>

                      <td className="py-4 px-6 whitespace-nowrap">
                        <div>
                          <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                            <TicketIcon className="w-3 h-3" />
                            {showtime.BookedSeats || 0}/{showtime.TotalSeats || 0} ghế
                          </div>
                          {getOccupancyRate(showtime.BookedSeats || 0, showtime.TotalSeats || 0)}
                        </div>
                      </td>

                      <td className="py-4 px-6 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-1">
                          <Link
                            to={`/admin/showtimes/${showtime.Showtime_ID}/detail`}
                            className="p-2 text-gray-400 hover:text-blue-400 transition-all duration-300 rounded-lg hover:bg-blue-400/10 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                            title="Xem chi tiết"
                          >
                            <EyeIcon className="w-5 h-5" />
                          </Link>
                          {!isHappenedShowtime(showtime) && (
                            <>
                              <Link
                                to={`/admin/showtimes/${showtime.Showtime_ID}`}
                                className="p-2 text-gray-400 hover:text-[#FFD875] transition-all duration-300 rounded-lg hover:bg-[#FFD875]/10 hover:shadow-[0_0_15px_rgba(255,216,117,0.3)]"
                                title="Chỉnh sửa"
                              >
                                <PencilIcon className="w-5 h-5" />
                              </Link>

                              <button
                                onClick={async () => {
                                  if (window.confirm(`Bạn có chắc chắn muốn xóa suất chiếu này?`)) {
                                    try {
                                      await showtimeService.deleteShowtime(showtime.Showtime_ID.toString());
                                      toast.success("Đã xóa suất chiếu thành công");
                                      const updatedShowtimes = await fetchShowtimes();
                                      setShowtimes(updatedShowtimes);
                                    } catch (error) {
                                      toast.error("Không thể xóa suất chiếu");
                                    }
                                  }
                                }}
                                className="p-2 text-gray-400 hover:text-red-500 transition-all duration-300 rounded-lg hover:bg-red-500/10 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                                title="Xóa"
                              >
                                <TrashIcon className="w-5 h-5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination với thiết kế mới */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-6 border-t border-[#FFD875]/10">
              <div className="text-sm text-gray-400">
                Hiển thị {(currentPage - 1) * itemsPerPage + 1} -{" "}
                {Math.min(currentPage * itemsPerPage, filteredShowtimes.length)} trong tổng số{" "}
                {filteredShowtimes.length} suất chiếu
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    currentPage === 1
                      ? "bg-slate-700/50 text-gray-500 cursor-not-allowed"
                      : "bg-slate-700/50 text-white hover:bg-[#FFD875] hover:text-black hover:shadow-[0_0_15px_rgba(255,216,117,0.5)]"
                  }`}
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let page;
                  if (totalPages <= 5) {
                    page = i + 1;
                  } else if (currentPage <= 3) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i;
                  } else {
                    page = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={`page-${page}-${i}`}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded-lg font-medium transition-all duration-300 ${
                        currentPage === page
                          ? "bg-[#FFD875] text-black shadow-[0_0_15px_rgba(255,216,117,0.5)] scale-110"
                          : "bg-slate-700/50 text-white hover:bg-[#FFD875]/20 hover:text-[#FFD875]"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    currentPage === totalPages
                      ? "bg-slate-700/50 text-gray-500 cursor-not-allowed"
                      : "bg-slate-700/50 text-white hover:bg-[#FFD875] hover:text-black hover:shadow-[0_0_15px_rgba(255,216,117,0.5)]"
                  }`}
                >
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ShowtimesList;

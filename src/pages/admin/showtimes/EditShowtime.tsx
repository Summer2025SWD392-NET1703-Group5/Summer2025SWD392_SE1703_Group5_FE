// src/pages/admin/showtimes/EditShowtime.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import "../../../components/admin/cinema-rooms/SeatMap.css";
import { FilmIcon, BuildingOfficeIcon, ClockIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import showtimeService from "../../../services/showtimeService";
import { movieService } from "../../../services/movieService";
import { cinemaRoomService } from "../../../services/cinemaRoomService";
import { useAuth } from "../../../contexts/SimpleAuthContext";
import { getVNLocalDateString } from "../../../utils/timeFormatter";

interface Movie {
  id: string;
  title: string;
  poster: string;
  duration: number;
  releaseDate: string;
  endDate?: string;
  status?: string;
}

interface Cinema {
  id: string;
  name: string;
  address: string;
}

interface CinemaRoom {
  id: string;
  name: string;
  cinemaId: string;
  capacity: number;
}

// Fetch movies from service, filter for 'Now Showing', and map to consistent format
const fetchMovies = async (): Promise<Movie[]> => {
  try {
    let allMovies = await movieService.getAllMovies();
    allMovies = allMovies.filter(
      (movie: any) =>
        movie.status === "Now Showing" || movie.Status === "Now Showing" || movie.movieStatus === "Now Showing"
    );

    return allMovies.map((movie: any) => ({
      id: movie.Movie_ID?.toString() || movie.id?.toString() || movie.movieId?.toString(),
      title: movie.Movie_Name || movie.title || movie.movieName || movie.name || "",
      poster: movie.Poster_URL || movie.poster || movie.posterUrl || movie.posterURL || "",
      duration: movie.Duration || movie.duration || 120,
      releaseDate: movie.Release_Date || movie.releaseDate || new Date().toISOString().split("T")[0],
      premiereDate: movie.Premiere_Date || movie.premiereDate || "",
      endDate: movie.End_Date || movie.endDate || "",
      status: movie.Status || movie.status || "Now Showing",
    }));
  } catch (error) {
    console.error("Error fetching movies:", error);
    toast.error("Không thể tải danh sách phim");
    return [];
  }
};

const fetchCinemas = async (): Promise<Cinema[]> => {
  try {
    // Use service to get cinemas
    const cinemasMap = await showtimeService.getCinemas();
    return Array.from(cinemasMap.values()).map((cinema: any) => ({
      id: cinema.id,
      name: cinema.name,
      address: cinema.address,
    }));
  } catch (error) {
    console.error("Error fetching cinemas:", error);
    toast.error("Không thể tải danh sách rạp");
    return [];
  }
};

const fetchRooms = async (cinemaId: string): Promise<CinemaRoom[]> => {
  try {
    const rooms = await cinemaRoomService.getRoomsByCinemaId(Number(cinemaId));
    if (Array.isArray(rooms) && rooms.length > 0) {
      return rooms.map((room: any, index: number) => ({
        id: room.Cinema_Room_ID || String(index + 1),
        name: room.Room_Name || `Phòng ${index + 1}`,
        cinemaId: String(cinemaId),
        capacity: room.Seat_Quantity || 0,
      }));
    }
    return [];
  } catch (error) {
    console.error(`Error fetching rooms:`, error);
    toast.error("Không thể tải danh sách phòng chiếu");
    return [];
  }
};

const EditShowtime: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth(); // Lấy thông tin người dùng
  const isAdmin = user?.role === "Admin"; // Kiểm tra xem người dùng có phải là Admin không

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [rooms, setRooms] = useState<CinemaRoom[]>([]);
  const [managerCinema, setManagerCinema] = useState<Cinema | null>(null);

  // Form states
  const [selectedMovie, setSelectedMovie] = useState<string>("");
  const [selectedCinema, setSelectedCinema] = useState<string>("");
  const [selectedRoom, setSelectedRoom] = useState<string>();
  const [showDate, setShowDate] = useState<string>("");
  const [showTime, setShowTime] = useState<string>("");
  const [showtimeStatus, setShowtimeStatus] = useState<"Scheduled" | "Hidden">("Scheduled");

  // Selected movie details
  const [selectedMovieDetails, setSelectedMovieDetails] = useState<Movie | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Tải danh sách phim
        const moviesData = await fetchMovies();
        setMovies(moviesData);

        // Nếu là Manager, lấy thông tin rạp của họ
        if (!isAdmin) {
          try {
            const managerResponse = await showtimeService.getShowtimesByManagerCinema();
            if (managerResponse && managerResponse.cinema) {
              const managerCinemaData = {
                id: managerResponse.cinema.Cinema_ID.toString(),
                name: managerResponse.cinema.Cinema_Name,
                address: managerResponse.cinema.Address || "",
              };
              setManagerCinema(managerCinemaData);
              setCinemas([managerCinemaData]);
              setSelectedCinema(managerCinemaData.id);
              console.log(`Đã lấy thông tin rạp của manager: ${managerCinemaData.name}`);
            }
          } catch (error) {
            console.error("Lỗi khi lấy thông tin rạp của manager:", error);
            toast.error("Không thể lấy thông tin rạp của bạn");
          }
        } else {
          // Nếu là Admin, lấy tất cả rạp
          const cinemasData = await fetchCinemas();
          setCinemas(cinemasData);
        }

        // Tải thông tin suất chiếu nếu không phải là trang thêm mới
        if (id && id !== "add") {
          const showtimeData = await showtimeService.getShowtimeById(id);
          if (showtimeData) {
            setSelectedMovie(showtimeData.movieId);

            // Wait for managerCinema to be set if needed
            let cinemaIdToUse = showtimeData.cinemaId;
            if (!isAdmin) {
              // If managerCinema is not yet set, wait for it
              if (!managerCinema) {
                // Wait for managerCinema to be set in a microtask
                await new Promise((resolve) => setTimeout(resolve, 0));
              }
              cinemaIdToUse = managerCinema?.id || showtimeData.cinemaId;
              setSelectedCinema(cinemaIdToUse);
            } else {
              setSelectedCinema(cinemaIdToUse);
            }

            // Fetch rooms for the correct cinema
            const roomsData = await fetchRooms(cinemaIdToUse);
            setRooms(roomsData);
            // Set selectedRoom only if it exists in the fetched rooms
            const roomIdString = showtimeData.roomId?.toString() || "";
            setSelectedRoom(roomIdString);
            // Xử lý ngày giờ
            setShowDate(showtimeData.showDate || "");

            const timeString = showtimeData.startTime;
            if (timeString && typeof timeString === "string") {
              if (timeString.includes("T")) {
                setShowTime(timeString.split("T")[1].substring(0, 5));
              } else {
                setShowTime(timeString.substring(0, 5));
              }
            }
          }
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Không thể tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isAdmin]);

  // Load rooms when cinema changes
  useEffect(() => {
    if (selectedCinema) {
      const loadRooms = async () => {
        try {
          const roomsData = await fetchRooms(selectedCinema);
          setRooms(roomsData);
        } catch (error) {
          console.error("Error loading rooms:", error);
          toast.error("Không thể tải danh sách phòng chiếu");
        }
      };

      loadRooms();
    } else if (!selectedCinema) {
      setRooms([]);
    }
  }, [selectedCinema]);

  // Update selected movie details when movie changes
  useEffect(() => {
    if (selectedMovie) {
      const fetchMovieDetails = async () => {
        try {
          // First try to find the movie in the already loaded movies list
          const movieFromList = movies.find((m) => m.id === selectedMovie);
          if (movieFromList) {
            setSelectedMovieDetails(movieFromList);
          }

          // Only try to fetch from API if ID is numeric
          if (/^\d+$/.test(selectedMovie)) {
            // Then fetch detailed information from the API
            try {
              const detailedMovie = await movieService.fetchMovieDetails(selectedMovie);
              if (detailedMovie) {
                console.log("Detailed movie from API:", detailedMovie);

                const movieData = {
                  id: selectedMovie,
                  title:
                    detailedMovie.Movie_Name ||
                    detailedMovie.movieName ||
                    detailedMovie.title ||
                    movieFromList?.title ||
                    "",
                  poster:
                    detailedMovie.Poster_URL ||
                    detailedMovie.posterURL ||
                    detailedMovie.posterUrl ||
                    detailedMovie.poster ||
                    movieFromList?.poster ||
                    "",
                  duration: detailedMovie.Duration || detailedMovie.duration || movieFromList?.duration || 120,
                  releaseDate:
                    detailedMovie.Release_Date || detailedMovie.releaseDate || movieFromList?.releaseDate || "",
                  endDate: detailedMovie.End_Date || detailedMovie.endDate || movieFromList?.endDate || "",
                };

                console.log("Final movieData:", movieData);
                setSelectedMovieDetails(movieData);
              }
            } catch (error) {
              console.error("Error fetching movie details from API:", error);
              // Already set movie details from list, so we can continue
            }
          } else {
            console.log("Skipping API fetch for non-numeric ID:", selectedMovie);
          }
        } catch (error) {
          console.error("Error in movie details fetch process:", error);
          // Keep the basic movie details if API call fails
          const movie = movies.find((m) => m.id === selectedMovie);
          setSelectedMovieDetails(movie || null);
        }
      };

      fetchMovieDetails();
    } else {
      setSelectedMovieDetails(null);
    }
  }, [selectedMovie, movies]);

  // Remove force set selectedRoom from sessionStorage (redundant)

  // Validate time when date changes
  useEffect(() => {
    if (showDate && showTime) {
      // If date is today and current time is before minimum time, clear the time
      if (isToday(showDate)) {
        const minTime = getMinTimeForToday();
        if (showTime < minTime) {
          setShowTime("");
          toast.error("Thời gian đã chọn không hợp lệ. Vui lòng chọn thời gian sau hiện tại (+30 phút).");
        }
      }

      // Check if datetime is after movie end date
      if (
        selectedMovieDetails?.endDate &&
        !isDateTimeAfterMovieEndDate(showDate, showTime, selectedMovieDetails.endDate)
      ) {
        setShowTime("");
        toast.error(
          `Không thể chọn thời gian sau ngày kết thúc phim (${new Date(selectedMovieDetails.endDate).toLocaleDateString(
            "vi-VN"
          )})`
        );
      }
    }
  }, [showDate, showTime, selectedMovieDetails]);

  // Calculate end time based on movie duration + 15 phút giải lao
  const calculateEndTime = () => {
    if (!selectedMovieDetails || !showTime) return "";

    const [hours, minutes] = showTime.split(":").map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);

    const endDate = new Date(startDate);
    // Thêm thời lượng phim + 15 phút giải lao
    endDate.setMinutes(endDate.getMinutes() + selectedMovieDetails.duration + 15);

    return endDate.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  };

  // Validation functions
  const isDateTimeAfterNow = (date: string, time: string): boolean => {
    const selectedDateTime = new Date(`${date}T${time}`);
    const now = new Date();
    const minTime = new Date(now.getTime() + 30 * 60000); // Thêm 30 phút để chuẩn bị
    return selectedDateTime > minTime;
  };

  const isDateTimeAfterMovieEndDate = (date: string, time: string, movieEndDate: string): boolean => {
    if (!movieEndDate) return true; // If no end date, allow scheduling

    const selectedDateTime = new Date(`${date}T${time}`);
    const endDate = new Date(movieEndDate);

    // Set end date to end of day for comparison
    endDate.setHours(23, 59, 59, 999);

    return selectedDateTime <= endDate;
  };

  const getMinTimeForToday = (): string => {
    const now = new Date();

    // Add 30 minutes buffer for preparation time
    const minDate = new Date(now.getTime() + 30 * 60000);

    return minDate.toTimeString().slice(0, 5); // Returns HH:MM format
  };

  const isToday = (date: string): boolean => {
    const today = getVNLocalDateString();
    return date === today;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!selectedMovie) {
      toast.error("Vui lòng chọn phim");
      return;
    }

    if (!selectedCinema) {
      toast.error("Vui lòng chọn rạp");
      return;
    }

    if (!selectedRoom) {
      toast.error("Vui lòng chọn phòng chiếu");
      return;
    }

    if (!showDate) {
      toast.error("Vui lòng chọn ngày chiếu");
      return;
    }

    if (!showTime) {
      toast.error("Vui lòng chọn giờ chiếu");
      return;
    }

    if (!id) {
      toast.error("ID suất chiếu không hợp lệ");
      return;
    }

    // Validate datetime is after current time
    if (!isDateTimeAfterNow(showDate, showTime)) {
      toast.error("Thời gian chiếu phải sau thời điểm hiện tại (+30 phút)");
      return;
    }

    // Validate datetime is before movie end date (if movie has end date)
    if (
      selectedMovieDetails?.endDate &&
      !isDateTimeAfterMovieEndDate(showDate, showTime, selectedMovieDetails.endDate)
    ) {
      toast.error(
        `Không thể tạo suất chiếu sau ngày kết thúc phim (${new Date(selectedMovieDetails.endDate).toLocaleDateString(
          "vi-VN"
        )})`
      );
      return;
    }

    setSubmitting(true);

    try {
      // Tạo đối tượng dữ liệu để gửi lên API
      const showtimeData = {
        movieId: selectedMovie,
        cinemaId: selectedCinema,
        roomId: selectedRoom,
        showDate: showDate,
        startTime: showTime,
        status: showtimeStatus,
      };

      console.log("Dữ liệu gửi lên API:", showtimeData);

      // Gọi API để cập nhật suất chiếu
      const result = await showtimeService.updateShowtime(id, showtimeData);

      if (result) {
        toast.success("Cập nhật suất chiếu thành công");
        navigate("/admin/showtimes");
      }
    } catch (error: any) {
      console.error("Error updating showtime:", error);
      toast.error(error.message || "Không thể cập nhật suất chiếu");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      {/* Back button and header */}
      <div className="mb-6">
        <Link to="/admin/showtimes" className="flex items-center text-gray-400 hover:text-FFD875 mb-4">
          <ArrowLeftIcon className="w-4 h-4 mr-1" />
          <span>Quay lại danh sách</span>
        </Link>

        <h1 className="text-2xl font-bold text-white">Chỉnh sửa lịch chiếu</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form section */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-slate-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-white border-b border-slate-700 pb-2 mb-6">
              Thông tin lịch chiếu
            </h2>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-FFD875"></div>
              </div>
            ) : (
              <>
                {/* Movie selection */}
                <div className="mb-6">
                  <label htmlFor="movie" className="block text-sm font-medium text-gray-300 mb-1">
                    Phim <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FilmIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      id="movie"
                      value={selectedMovie}
                      onChange={(e) => setSelectedMovie(e.target.value)}
                      className="bg-slate-700 text-white pl-10 pr-4 py-2 rounded-lg border border-slate-600 w-full focus:outline-none focus:border-[#FFD875] focus:ring-1 focus:ring-[#FFD875]"
                      required
                    >
                      <option value="">-- Chọn phim --</option>
                      {movies.map((movie) => (
                        <option key={movie.id} value={movie.id}>
                          {movie.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Cinema selection - Chỉ hiển thị cho Admin */}
                {isAdmin ? (
                  <div className="mb-6">
                    <label htmlFor="cinema" className="block text-sm font-medium text-gray-300 mb-1">
                      Rạp <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        id="cinema"
                        value={selectedCinema}
                        onChange={(e) => setSelectedCinema(e.target.value)}
                        className="bg-slate-700 text-white pl-10 pr-4 py-2 rounded-lg border border-slate-600 w-full focus:outline-none focus:border-[#FFD875] focus:ring-1 focus:ring-[#FFD875]"
                        required
                      >
                        <option value="">-- Chọn rạp --</option>
                        {cinemas.map((cinema) => (
                          <option key={cinema.id} value={cinema.id}>
                            {cinema.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="mb-6">
                    <label htmlFor="cinema-display" className="block text-sm font-medium text-gray-300 mb-1">
                      Rạp
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="cinema-display"
                        type="text"
                        value={managerCinema?.name || ""}
                        className="bg-slate-700 text-white pl-10 pr-4 py-2 rounded-lg border border-slate-600 w-full focus:outline-none cursor-not-allowed"
                        disabled
                      />
                      <input type="hidden" name="cinema" value={selectedCinema} />
                    </div>
                  </div>
                )}

                {/* Room selection */}
                <div className="mb-6">
                  <label htmlFor="room" className="block text-sm font-medium text-gray-300 mb-1">
                    Chọn phòng <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="room"
                    value={selectedRoom}
                    onChange={(e) => setSelectedRoom(e.target.value)}
                    className="bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 w-full focus:outline-none focus:border-FFD875 focus:ring-1 focus:ring-FFD875"
                    style={{ borderColor: selectedRoom ? "#FFD875" : undefined }}
                    disabled={!selectedCinema}
                    required
                  >
                    <option value="">-- Chọn phòng --</option>
                    {rooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.name} ({room.capacity} ghế)
                      </option>
                    ))}
                  </select>
                  {!selectedCinema && <p className="text-sm text-gray-400 mt-1">Vui lòng chọn rạp trước</p>}
                </div>

                {/* Status selection */}
                <div className="mb-6">
                  <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-1">
                    Trạng thái <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="status"
                    value={showtimeStatus}
                    onChange={(e) => setShowtimeStatus(e.target.value as "Scheduled" | "Hidden")}
                    className="bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 w-full focus:outline-none focus:border-FFD875 focus:ring-1 focus:ring-FFD875"
                    style={{ borderColor: showtimeStatus ? "#FFD875" : undefined }}
                    required
                  >
                    <option value="Scheduled">Đã lên lịch</option>
                    <option value="Hidden">Đã ẩn</option>
                  </select>
                  <p className="text-sm text-gray-400 mt-1">
                    {showtimeStatus === "Scheduled" && "Suất chiếu đã được lên lịch và chờ bắt đầu"}
                    {showtimeStatus === "Hidden" && "Suất chiếu đã ẩn"}
                  </p>
                </div>

                {/* Date and time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-1">
                      Ngày chiếu <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <ClockIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="date"
                        id="date"
                        value={showDate}
                        onChange={(e) => setShowDate(e.target.value)}
                        className="bg-slate-700 text-white pl-10 pr-4 py-2 rounded-lg border border-slate-600 w-full focus:outline-none focus:border-FFD875 focus:ring-1 focus:ring-FFD875"
                        style={{ borderColor: showDate ? "#FFD875" : undefined }}
                        min={getVNLocalDateString()}
                        max={selectedMovieDetails?.endDate || undefined}
                        required
                      />
                    </div>
                    {selectedMovieDetails?.endDate && new Date(selectedMovieDetails.endDate) < new Date() && (
                      <p className="text-sm text-red-400 mt-1">
                        ⚠️ Phim đã kết thúc từ {new Date(selectedMovieDetails.endDate).toLocaleDateString("vi-VN")}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="time" className="block text-sm font-medium text-gray-300 mb-1">
                      Giờ chiếu <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <ClockIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="time"
                        id="time"
                        value={showTime}
                        onChange={(e) => setShowTime(e.target.value)}
                        className="bg-slate-700 text-white pl-10 pr-4 py-2 rounded-lg border border-slate-600 w-full focus:outline-none focus:border-FFD875 focus:ring-1 focus:ring-FFD875"
                        style={{ borderColor: showTime ? "#FFD875" : undefined }}
                        min={isToday(showDate) ? getMinTimeForToday() : undefined}
                        required
                      />
                    </div>
                    {isToday(showDate) && (
                      <p className="text-sm text-yellow-400 mt-1">
                        Thời gian tối thiểu: {getVNLocalDateString()} | {getMinTimeForToday()} (sau 30 phút từ bây giờ)
                      </p>
                    )}
                    {selectedMovieDetails?.endDate && (
                      <p className="text-sm text-gray-400 mt-1">
                        Phim kết thúc chiếu: {new Date(selectedMovieDetails.endDate).toLocaleDateString("vi-VN")}
                      </p>
                    )}
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end space-x-4 mt-8">
                  <button
                    type="button"
                    onClick={() => navigate("/admin/showtimes")}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    disabled={submitting}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-FFD875 text-black rounded-lg hover:bg-opacity-90 transition-colors btn-glow btn-yellow"
                    style={{ backgroundColor: "#FFD875" }}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-black"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Đang lưu...
                      </span>
                    ) : (
                      "Lưu thay đổi"
                    )}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>

        {/* Preview section */}
        <div className="lg:col-span-1">
          <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-white border-b border-slate-700 pb-2 mb-6">Xem trước</h2>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-FFD875"></div>
              </div>
            ) : selectedMovieDetails ? (
              <div>
                <div className="flex justify-center mb-4">
                  <img
                    src={selectedMovieDetails.poster}
                    alt={selectedMovieDetails.title}
                    className="w-32 h-48 object-cover rounded-lg shadow-lg"
                  />
                </div>

                <h3 className="text-white font-semibold text-center mb-4">{selectedMovieDetails.title}</h3>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Thời lượng:</span>
                    <span className="text-white">{selectedMovieDetails.duration} phút</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-400">Ngày khởi chiếu:</span>
                    <span className="text-white">
                      {(() => {
                        try {
                          return new Date(selectedMovieDetails.releaseDate).toLocaleDateString("vi-VN");
                        } catch (e) {
                          return "Không xác định";
                        }
                      })()}
                    </span>
                  </div>

                  {selectedMovieDetails.endDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Ngày kết thúc:</span>
                      <span className="text-white">
                        {(() => {
                          try {
                            return new Date(selectedMovieDetails.endDate).toLocaleDateString("vi-VN");
                          } catch (e) {
                            return "Không xác định";
                          }
                        })()}
                      </span>
                    </div>
                  )}

                  {selectedCinema && cinemas.find((c) => c.id === selectedCinema) && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Rạp:</span>
                      <span className="text-white">{cinemas.find((c) => c.id === selectedCinema)?.name}</span>
                    </div>
                  )}

                  {selectedRoom && rooms.find((r) => r.id === selectedRoom) && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Phòng:</span>
                      <span className="text-white">
                        {rooms.find((r) => r.id === selectedRoom)?.name}
                        {rooms.find((r) => r.id === selectedRoom)?.capacity &&
                          ` (${rooms.find((r) => r.id === selectedRoom)?.capacity} ghế)`}
                      </span>
                    </div>
                  )}

                  {showDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Ngày chiếu:</span>
                      <span className="text-white">{new Date(showDate).toLocaleDateString("vi-VN")}</span>
                    </div>
                  )}

                  {showTime && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Giờ chiếu:</span>
                      <span className="text-white">{showTime}</span>
                    </div>
                  )}

                  {showTime && selectedMovieDetails && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Giờ kết thúc:</span>
                      <span className="text-white">{calculateEndTime()}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-gray-400">Trạng thái:</span>
                    <span
                      className={`text-sm font-medium px-2 py-1 rounded-full ${
                        showtimeStatus === "Scheduled"
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-green-500/20 text-green-400"
                      }`}
                    >
                      {showtimeStatus === "Scheduled" && "Đã lên lịch"}
                      {showtimeStatus === "Hidden" && "Đã ẩn"}
                    </span>
                  </div>

                  {/* Hiển thị ID để debug */}
                  <div className="border-t border-slate-700 pt-2 mt-2">
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>Movie ID: {selectedMovie}</div>
                      <div>Cinema ID: {selectedCinema}</div>
                      <div>Room ID: {selectedRoom}</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <FilmIcon className="w-16 h-16 mb-4" />
                <p>Chọn phim để xem trước</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditShowtime;

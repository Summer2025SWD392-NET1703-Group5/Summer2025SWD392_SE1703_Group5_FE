import React, { useState, useEffect, type CSSProperties } from "react";
import { LoadingSpinner, showSuccessToast, showErrorToast } from "../../components/utils/utils";
import { getMoviesWithFilters } from "../../config/MovieApi";
import { getShowtimesByMovieAndDate, getMovieShowtimeDates } from "../../config/ShowtimeApi";

// CSS Styles as objects
const styles: { [key: string]: CSSProperties } = {
  staffBooking: {
    padding: "2rem",
    backgroundColor: "#f8fafc",
    minHeight: "100vh",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#1e293b",
  },
  bookingHeader: {
    marginBottom: "2rem",
    textAlign: "center" as const,
  },
  bookingTitle: {
    fontSize: "2.5rem",
    fontWeight: "700",
    marginBottom: "2rem",
    color: "#d97706",
    textShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  stepIndicator: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "1rem",
    flexWrap: "wrap" as const,
    marginBottom: "2rem",
  },
  step: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.75rem 1rem",
    borderRadius: "12px",
    backgroundColor: "#e2e8f0",
    color: "#64748b",
    transition: "all 0.3s ease",
  },
  stepActive: {
    backgroundColor: "#eab308",
    color: "white",
    transform: "scale(1.05)",
    boxShadow: "0 4px 12px rgba(234, 179, 8, 0.3)",
  },
  stepCompleted: {
    backgroundColor: "#10b981",
    color: "white",
  },
  stepNumber: {
    width: "2rem",
    height: "2rem",
    borderRadius: "50%",
    backgroundColor: "rgba(255,255,255,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "600",
    fontSize: "0.875rem",
  },
  stepInfo: {
    display: "flex",
    flexDirection: "column" as const,
  },
  stepTitle: {
    fontWeight: "600",
    fontSize: "0.875rem",
  },
  stepDescription: {
    fontSize: "0.75rem",
    opacity: 0.8,
  },
  bookingContent: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "2rem",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    border: "1px solid #e2e8f0",
  },
  stepContent: {
    minHeight: "400px",
  },
  sectionTitle: {
    fontSize: "1.875rem",
    fontWeight: "600",
    marginBottom: "1.5rem",
    color: "#d97706",
    textAlign: "center" as const,
  },
  // Layout for movies left, showtimes right
  movieShowtimeLayout: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "2rem",
    minHeight: "70vh",
  },
  moviesPanel: {
    backgroundColor: "#f8fafc",
    border: "2px solid #e2e8f0",
    borderRadius: "12px",
    padding: "1.5rem",
    height: "fit-content",
    maxHeight: "70vh",
    overflowY: "auto" as const,
  },
  showtimesPanel: {
    backgroundColor: "#f8fafc",
    border: "2px solid #e2e8f0",
    borderRadius: "12px",
    padding: "1.5rem",
    height: "fit-content",
    maxHeight: "70vh",
    overflowY: "auto" as const,
  },
  panelTitle: {
    fontSize: "1.5rem",
    fontWeight: "600",
    marginBottom: "1.5rem",
    color: "#d97706",
    textAlign: "center" as const,
    borderBottom: "2px solid #e2e8f0",
    paddingBottom: "0.75rem",
  },
  dateFilterContainer: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1rem",
    marginBottom: "1.5rem",
    padding: "1rem",
    backgroundColor: "#fefce8",
    borderRadius: "8px",
    border: "1px solid #fde047",
  },
  dateFilterLabel: {
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "#a16207",
  },
  datePickerContainer: {
    position: "relative" as const,
    display: "inline-block",
    width: "100%",
  },
  datePickerButton: {
    padding: "0.75rem 1rem",
    borderRadius: "8px",
    border: "2px solid #eab308",
    fontSize: "0.875rem",
    backgroundColor: "white",
    color: "#1e293b",
    cursor: "pointer",
    width: "100%",
    textAlign: "left" as const,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    transition: "all 0.2s ease",
  },
  datePickerButtonActive: {
    border: "2px solid #ca8a04",
    boxShadow: "0 0 0 3px rgba(234, 179, 8, 0.1)",
  },
  datePickerDropdown: {
    position: "absolute" as const,
    top: "100%",
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: "white",
    border: "2px solid #eab308",
    borderRadius: "8px",
    marginTop: "0.25rem",
    boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
    maxHeight: "350px",
    overflowY: "auto" as const,
    minWidth: "280px",
    maxWidth: "320px",
  },
  calendarContainer: {
    padding: "0.75rem",
  },
  calendarHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.75rem",
    padding: "0.25rem 0",
  },
  calendarNavButton: {
    backgroundColor: "#eab308",
    color: "white",
    border: "none",
    borderRadius: "4px",
    padding: "0.375rem 0.5rem",
    cursor: "pointer",
    fontSize: "0.875rem",
    fontWeight: "600",
    transition: "all 0.2s ease",
    minWidth: "2rem",
  },
  calendarTitle: {
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "#a16207",
  },
  calendarGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "1px",
    marginBottom: "0.5rem",
  },
  calendarDayHeader: {
    padding: "0.375rem",
    textAlign: "center" as const,
    fontSize: "0.7rem",
    fontWeight: "600",
    color: "#64748b",
    backgroundColor: "#f8fafc",
  },
  calendarDay: {
    padding: "0.5rem 0.25rem",
    textAlign: "center" as const,
    cursor: "pointer",
    borderRadius: "3px",
    fontSize: "0.8rem",
    transition: "all 0.15s ease",
    minHeight: "2rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  calendarDayDisabled: {
    color: "#cbd5e1",
    cursor: "not-allowed",
    backgroundColor: "#f8fafc",
  },
  calendarDayToday: {
    backgroundColor: "#fef3c7",
    color: "#a16207",
    fontWeight: "600",
    border: "1px solid #eab308",
  },
  calendarDaySelected: {
    backgroundColor: "#eab308",
    color: "white",
    fontWeight: "600",
  },
  calendarDayHover: {
    backgroundColor: "#fef3c7",
    color: "#a16207",
    transform: "scale(1.05)",
  },
  datePickerHeader: {
    padding: "1rem",
    borderBottom: "1px solid #fef3c7",
    backgroundColor: "#fefce8",
  },
  datePickerTitle: {
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "#a16207",
    marginBottom: "0.5rem",
  },
  customDateInput: {
    width: "100%",
    padding: "0.5rem",
    border: "1px solid #eab308",
    borderRadius: "6px",
    fontSize: "0.875rem",
    backgroundColor: "white",
    color: "#1e293b",
  },
  quickDatesSection: {
    padding: "1rem",
    borderBottom: "1px solid #fef3c7",
  },
  quickDatesSectionTitle: {
    fontSize: "0.75rem",
    fontWeight: "600",
    color: "#a16207",
    marginBottom: "0.5rem",
  },
  dateOption: {
    padding: "0.75rem 1rem",
    cursor: "pointer",
    borderBottom: "1px solid #fef3c7",
    transition: "all 0.2s ease",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateOptionHover: {
    backgroundColor: "#fef3c7",
  },
  dateOptionSelected: {
    backgroundColor: "#eab308",
    color: "white",
  },
  quickDateButtons: {
    display: "flex",
    gap: "0.5rem",
    flexWrap: "wrap" as const,
  },
  quickDateButton: {
    padding: "0.375rem 0.75rem",
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "6px",
    fontSize: "0.75rem",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
    color: "#64748b",
  },
  quickDateButtonActive: {
    backgroundColor: "#eab308",
    color: "white",
    border: "1px solid #ca8a04",
  },
  movieCard: {
    backgroundColor: "#ffffff",
    border: "2px solid #e2e8f0",
    borderRadius: "12px",
    padding: "1.5rem",
    cursor: "pointer",
    transition: "all 0.3s ease",
    textAlign: "center" as const,
  },
  movieCardHover: {
    backgroundColor: "#fef3c7",
    transform: "translateY(-4px)",
    boxShadow: "0 8px 20px rgba(234, 179, 8, 0.2)",
  },
  movieCardSelected: {
    backgroundColor: "#fef3c7",
    border: "2px solid #eab308",
    boxShadow: "0 4px 12px rgba(234, 179, 8, 0.25)",
  },
  showtimeCard: {
    backgroundColor: "#ffffff",
    border: "2px solid #e2e8f0",
    borderRadius: "12px",
    padding: "1.5rem",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  showtimeCardHover: {
    backgroundColor: "#fef3c7",
    transform: "translateX(4px)",
  },
  showtimeCardSelected: {
    backgroundColor: "#fef3c7",
    border: "2px solid #eab308",
    boxShadow: "0 4px 12px rgba(234, 179, 8, 0.25)",
  },
  buttonGroup: {
    display: "flex",
    gap: "1rem",
    justifyContent: "center",
    marginTop: "2rem",
  },
  primaryButton: {
    backgroundColor: "#eab308",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "0.75rem 2rem",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  primaryButtonHover: {
    backgroundColor: "#ca8a04",
    transform: "translateY(-2px)",
    boxShadow: "0 4px 12px rgba(234, 179, 8, 0.3)",
  },
  secondaryButton: {
    backgroundColor: "#f1f5f9",
    color: "#475569",
    border: "2px solid #e2e8f0",
    borderRadius: "8px",
    padding: "0.75rem 2rem",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  secondaryButtonHover: {
    backgroundColor: "#e2e8f0",
    border: "2px solid #cbd5e1",
  },
  loadingOverlay: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
};

interface Movie {
  Movie_ID: number;
  Title: string;
  Description: string;
  Duration: number;
  Release_Date: string;
  Poster_URL: string;
  Trailer_URL: string;
  Director: string;
  Cast: string;
  Genre: string;
  Language: string;
  Rating: string;
  Status: string;
}

interface Showtime {
  Showtime_ID: number;
  Movie_ID: number;
  Cinema_Room_ID: number;
  Room_Name: string;
  Show_Date: string;
  Start_Time: string;
  End_Time: string;
  Status: string;
  Room: {
    Cinema_Room_ID: number;
    Room_Name: string;
    Room_Type: string;
  };
  Capacity_Available: number;
  AvailableSeats: number;
  TotalSeats: number;
  Cinema: {
    Cinema_ID: number;
    Cinema_Name: string;
  };
}

interface BookingData {
  selectedMovie: Movie | null;
  selectedShowtime: Showtime | null;
}

const BOOKING_STEPS = [
  { id: 1, title: "Chọn Phim & Suất Chiếu", description: "Chọn phim và suất chiếu" },
  { id: 2, title: "Chọn Ghế", description: "Chọn ghế ngồi" },
  { id: 3, title: "Thông Tin KH", description: "Chọn hoặc tạo khách hàng" },
  { id: 4, title: "Khuyến Mãi", description: "Áp dụng khuyến mãi" },
  { id: 5, title: "Thanh Toán", description: "Xử lý thanh toán" },
  { id: 6, title: "Hoàn Thành", description: "Xác nhận đặt vé" },
];

const StaffBooking: React.FC = () => {
  // Helper function to format date without timezone issues
  const formatDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Data states
  const [movies, setMovies] = useState<Movie[]>([]);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [availableDates, setAvailableDates] = useState<string[]>([]);

  // Booking data
  const [bookingData, setBookingData] = useState<BookingData>({
    selectedMovie: null,
    selectedShowtime: null,
  }); // Date filter state
  const [selectedDate, setSelectedDate] = useState<string>(formatDateString(new Date()));
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());

  // Generate date options for the next 14 days
  const generateDateOptions = () => {
    const options = [];
    for (let i = 0; i < 14; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateStr = formatDateString(date);
      const isToday = i === 0;
      const isTomorrow = i === 1;

      let label = "";
      if (isToday) label = "Hôm nay";
      else if (isTomorrow) label = "Ngày mai";
      else
        label = date.toLocaleDateString("vi-VN", {
          weekday: "long",
          day: "numeric",
          month: "numeric",
          year: "numeric",
        });

      options.push({
        value: dateStr,
        label: label,
        date: date.toLocaleDateString("vi-VN", {
          day: "numeric",
          month: "numeric",
        }),
      });
    }
    return options;
  };

  const dateOptions = generateDateOptions();

  // Calendar helper functions
  const getMonthName = (month: number) => {
    const monthNames = [
      "Tháng 1",
      "Tháng 2",
      "Tháng 3",
      "Tháng 4",
      "Tháng 5",
      "Tháng 6",
      "Tháng 7",
      "Tháng 8",
      "Tháng 9",
      "Tháng 10",
      "Tháng 11",
      "Tháng 12",
    ];
    return monthNames[month];
  };

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(calendarMonth, calendarYear);
    const firstDay = getFirstDayOfMonth(calendarMonth, calendarYear);
    const today = new Date();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    } // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(calendarYear, calendarMonth, day);
      // Fix timezone issue by creating date string manually
      const year = calendarYear;
      const month = (calendarMonth + 1).toString().padStart(2, "0");
      const dayStr = day.toString().padStart(2, "0");
      const dateStr = `${year}-${month}-${dayStr}`;

      const isToday = date.toDateString() === today.toDateString();
      const isSelected = dateStr === selectedDate;
      const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());

      days.push({
        day,
        date: dateStr,
        isToday,
        isSelected,
        isPast,
      });
    }

    return days;
  };

  const navigateMonth = (direction: "prev" | "next") => {
    if (direction === "prev") {
      if (calendarMonth === 0) {
        setCalendarMonth(11);
        setCalendarYear(calendarYear - 1);
      } else {
        setCalendarMonth(calendarMonth - 1);
      }
    } else {
      if (calendarMonth === 11) {
        setCalendarMonth(0);
        setCalendarYear(calendarYear + 1);
      } else {
        setCalendarMonth(calendarMonth + 1);
      }
    }
  };
  useEffect(() => {
    loadMovies();
  }, []);
  // Load showtimes when a movie is selected
  useEffect(() => {
    if (bookingData.selectedMovie) {
      loadShowtimesForMovie(bookingData.selectedMovie.Movie_ID.toString());
    } else {
      setShowtimes([]); // Clear showtimes when no movie is selected
      setAvailableDates([]); // Clear available dates
    }
  }, [bookingData.selectedMovie]);

  // Load showtimes when date changes (if movie is already selected)
  useEffect(() => {
    if (bookingData.selectedMovie && selectedDate && availableDates.includes(selectedDate)) {
      loadShowtimesForDate(bookingData.selectedMovie.Movie_ID.toString(), selectedDate);
    }
  }, [selectedDate, bookingData.selectedMovie?.Movie_ID]);

  const loadShowtimesForDate = async (movieId: string, date: string) => {
    try {
      setLoading(true);
      console.log("🔍 Loading showtimes for movie:", movieId, "on date:", date);

      const showtimesData = await getShowtimesByMovieAndDate(movieId, date);
      console.log("🔍 Showtimes from API:", showtimesData);

      const showtimesArray = Array.isArray(showtimesData) ? showtimesData : [];
      setShowtimes(showtimesArray);
    } catch (error) {
      console.error(`Error loading showtimes for movie ${movieId} on date ${date}:`, error);
      showErrorToast("Không thể tải suất chiếu cho ngày đã chọn");
      setShowtimes([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMovies = async () => {
    try {
      setLoading(true);

      // Use getMoviesWithFilters to get only "Now Showing" movies
      const moviesData = await getMoviesWithFilters({
        status: "Now Showing",
      });

      setMovies(moviesData);
    } catch (error) {
      console.error("Error loading movies:", error);
      showErrorToast("Không thể tải danh sách phim đang chiếu");
      setError("Không thể tải danh sách phim đang chiếu");
    } finally {
      setLoading(false);
    }
  };
  const loadShowtimesForMovie = async (movieId: string) => {
    try {
      setLoading(true);

      // First, get available dates for this movie
      console.log("🔍 Loading available dates for movie:", movieId);
      const datesData = await getMovieShowtimeDates(movieId);
      console.log("🔍 Available dates from API:", datesData);

      // Ensure we have an array of dates
      const availableDatesArray = Array.isArray(datesData) ? datesData : [];
      setAvailableDates(availableDatesArray);

      // Auto-select first available date if current selected date is not available
      let dateToUse = selectedDate;
      if (availableDatesArray.length > 0 && !availableDatesArray.includes(selectedDate)) {
        dateToUse = availableDatesArray[0];
        console.log("🔍 Auto-selecting first available date:", dateToUse);
        setSelectedDate(dateToUse);
      }

      // Now get showtimes for the movie and selected date
      console.log("🔍 Loading showtimes for movie:", movieId, "on date:", dateToUse);
      const showtimesData = await getShowtimesByMovieAndDate(movieId, dateToUse);
      console.log("🔍 Showtimes from API:", showtimesData);

      // Ensure we always set an array
      const showtimesArray = Array.isArray(showtimesData) ? showtimesData : [];
      setShowtimes(showtimesArray);
    } catch (error) {
      console.error(`Error loading showtimes for movie ${movieId}:`, error);
      showErrorToast("Không thể tải danh sách suất chiếu");
      // Clear data on error
      setShowtimes([]);
      setAvailableDates([]);
    } finally {
      setLoading(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div style={styles.stepContent}>
            <h2 style={styles.sectionTitle}>Chọn Phim và Suất Chiếu</h2>
            <p style={{ textAlign: "center", color: "#64748b", marginBottom: "2rem" }}>
              Chọn phim từ danh sách bên trái, sau đó chọn suất chiếu phù hợp bên phải
            </p>

            {loading ? (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "300px" }}>
                <LoadingSpinner />
              </div>
            ) : (
              <div style={styles.movieShowtimeLayout}>
                {/* Left Panel: Movies */}
                <div style={styles.moviesPanel}>
                  <h3 style={styles.panelTitle}>🎬 Phim Đang Chiếu</h3>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                      gap: "1rem",
                    }}
                  >
                    {movies.map((movie) => {
                      const isSelected = bookingData.selectedMovie?.Movie_ID === movie.Movie_ID;

                      return (
                        <div
                          key={movie.Movie_ID}
                          style={{
                            ...styles.movieCard,
                            ...(isSelected ? styles.movieCardSelected : {}),
                            padding: "0.75rem",
                          }}
                          onClick={() => {
                            setBookingData((prev) => ({
                              ...prev,
                              selectedMovie: movie,
                              selectedShowtime: null, // Reset showtime when movie changes
                            }));
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) {
                              Object.assign(e.currentTarget.style, styles.movieCardHover);
                            }
                          }}
                          onMouseLeave={(e) => {
                            Object.assign(e.currentTarget.style, {
                              ...styles.movieCard,
                              ...(isSelected ? styles.movieCardSelected : {}),
                              padding: "0.75rem",
                            });
                          }}
                        >
                          <img
                            src={movie.Poster_URL}
                            alt={movie.Title}
                            style={{
                              width: "100%",
                              height: "200px",
                              objectFit: "cover",
                              borderRadius: "6px",
                              marginBottom: "0.5rem",
                            }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://via.placeholder.com/180x200?text=No+Image";
                            }}
                          />
                          <h4
                            style={{
                              fontSize: "0.875rem",
                              fontWeight: "600",
                              marginBottom: "0.25rem",
                              color: "#1e293b",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {movie.Title}
                          </h4>
                          <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.25rem" }}>
                            {movie.Genre} • {movie.Duration}'
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "#059669", fontWeight: "500" }}>{movie.Rating}</div>
                        </div>
                      );
                    })}
                  </div>{" "}
                  {movies.length === 0 && !loading && (
                    <div style={{ textAlign: "center", color: "#64748b", marginTop: "2rem" }}>
                      Không có phim nào đang chiếu
                    </div>
                  )}
                </div>

                {/* Right Panel: Showtimes */}
                <div style={styles.showtimesPanel}>
                  <h3 style={styles.panelTitle}>📅 Suất Chiếu</h3> {/* Date Filter Section */}
                  <div style={styles.dateFilterContainer}>
                    <label style={styles.dateFilterLabel}>Chọn ngày:</label>
                    {/* Custom Date Picker */}
                    <div style={styles.datePickerContainer}>
                      <button
                        style={{
                          ...styles.datePickerButton,
                          ...(isDatePickerOpen ? styles.datePickerButtonActive : {}),
                        }}
                        onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                      >
                        {" "}
                        <span>
                          {dateOptions.find((option) => option.value === selectedDate)?.label ||
                            new Date(selectedDate).toLocaleDateString("vi-VN", {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                        </span>
                        <span style={{ color: "#eab308", fontWeight: "bold" }}>{isDatePickerOpen ? "▲" : "▼"}</span>
                      </button>{" "}
                      {isDatePickerOpen && (
                        <div style={styles.datePickerDropdown}>
                          {/* Calendar Widget */}
                          <div style={styles.calendarContainer}>
                            {/* Calendar Header */}
                            <div style={styles.calendarHeader}>
                              <button
                                style={styles.calendarNavButton}
                                onClick={() => navigateMonth("prev")}
                                onMouseEnter={(e) => {
                                  Object.assign(e.currentTarget.style, { backgroundColor: "#ca8a04" });
                                }}
                                onMouseLeave={(e) => {
                                  Object.assign(e.currentTarget.style, { backgroundColor: "#eab308" });
                                }}
                              >
                                ←
                              </button>
                              <div style={styles.calendarTitle}>
                                {getMonthName(calendarMonth)} {calendarYear}
                              </div>
                              <button
                                style={styles.calendarNavButton}
                                onClick={() => navigateMonth("next")}
                                onMouseEnter={(e) => {
                                  Object.assign(e.currentTarget.style, { backgroundColor: "#ca8a04" });
                                }}
                                onMouseLeave={(e) => {
                                  Object.assign(e.currentTarget.style, { backgroundColor: "#eab308" });
                                }}
                              >
                                →
                              </button>
                            </div>
                            {/* Day Headers */}
                            <div style={styles.calendarGrid}>
                              {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day) => (
                                <div key={day} style={styles.calendarDayHeader}>
                                  {day}
                                </div>
                              ))}
                            </div>
                            {/* Calendar Days */}
                            <div style={styles.calendarGrid}>
                              {generateCalendarDays().map((dayInfo, index) => {
                                if (!dayInfo) {
                                  return <div key={index} style={{ padding: "0.75rem" }}></div>;
                                }

                                const { day, date, isToday, isSelected, isPast } = dayInfo;

                                return (
                                  <div
                                    key={day}
                                    style={{
                                      ...styles.calendarDay,
                                      ...(isPast ? styles.calendarDayDisabled : {}),
                                      ...(isToday ? styles.calendarDayToday : {}),
                                      ...(isSelected ? styles.calendarDaySelected : {}),
                                    }}
                                    onClick={() => {
                                      if (!isPast) {
                                        setSelectedDate(date);
                                        setIsDatePickerOpen(false);
                                      }
                                    }}
                                    onMouseEnter={(e) => {
                                      if (!isPast && !isSelected && !isToday) {
                                        Object.assign(e.currentTarget.style, styles.calendarDayHover);
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      Object.assign(e.currentTarget.style, {
                                        ...styles.calendarDay,
                                        ...(isPast ? styles.calendarDayDisabled : {}),
                                        ...(isToday ? styles.calendarDayToday : {}),
                                        ...(isSelected ? styles.calendarDaySelected : {}),
                                      });
                                    }}
                                  >
                                    {day}
                                  </div>
                                );
                              })}
                            </div>{" "}
                            {/* Quick Actions */}
                            <div
                              style={{
                                borderTop: "1px solid #fef3c7",
                                paddingTop: "0.75rem",
                                marginTop: "0.75rem",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  gap: "0.375rem",
                                  flexWrap: "wrap" as const,
                                  justifyContent: "center",
                                }}
                              >
                                <button
                                  style={{
                                    ...styles.quickDateButton,
                                    ...(selectedDate === formatDateString(new Date())
                                      ? styles.quickDateButtonActive
                                      : {}),
                                    fontSize: "0.7rem",
                                    padding: "0.25rem 0.5rem",
                                  }}
                                  onClick={() => {
                                    const today = formatDateString(new Date());
                                    setSelectedDate(today);
                                    setIsDatePickerOpen(false);
                                  }}
                                >
                                  Hôm nay
                                </button>
                                <button
                                  style={{
                                    ...styles.quickDateButton,
                                    ...(selectedDate === formatDateString(new Date(Date.now() + 86400000))
                                      ? styles.quickDateButtonActive
                                      : {}),
                                    fontSize: "0.7rem",
                                    padding: "0.25rem 0.5rem",
                                  }}
                                  onClick={() => {
                                    const tomorrow = formatDateString(new Date(Date.now() + 86400000));
                                    setSelectedDate(tomorrow);
                                    setIsDatePickerOpen(false);
                                  }}
                                >
                                  Ngày mai
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>{" "}
                    <div style={styles.quickDateButtons}>
                      {/* Show available dates from API instead of just next 7 days */}
                      {bookingData.selectedMovie && availableDates.length > 0
                        ? availableDates.slice(0, 7).map((dateStr) => {
                            const date = new Date(dateStr);
                            const isToday = dateStr === formatDateString(new Date());
                            const isTomorrow = dateStr === formatDateString(new Date(Date.now() + 86400000));
                            const isSelected = selectedDate === dateStr;

                            let label = "";
                            if (isToday) label = "Hôm nay";
                            else if (isTomorrow) label = "Ngày mai";
                            else
                              label = date.toLocaleDateString("vi-VN", {
                                weekday: "short",
                                day: "numeric",
                                month: "numeric",
                              });

                            return (
                              <button
                                key={dateStr}
                                style={{
                                  ...styles.quickDateButton,
                                  ...(isSelected ? styles.quickDateButtonActive : {}),
                                }}
                                onClick={() => setSelectedDate(dateStr)}
                              >
                                {label}
                              </button>
                            );
                          })
                        : // Fallback to next 7 days if no movie selected
                          [0, 1, 2, 3, 4, 5, 6].map((offset) => {
                            const date = new Date();
                            date.setDate(date.getDate() + offset);
                            const dateStr = formatDateString(date);
                            const isToday = offset === 0;
                            const isTomorrow = offset === 1;
                            const isSelected = selectedDate === dateStr;

                            let label = "";
                            if (isToday) label = "Hôm nay";
                            else if (isTomorrow) label = "Ngày mai";
                            else
                              label = date.toLocaleDateString("vi-VN", {
                                weekday: "short",
                                day: "numeric",
                                month: "numeric",
                              });

                            return (
                              <button
                                key={offset}
                                style={{
                                  ...styles.quickDateButton,
                                  ...(isSelected ? styles.quickDateButtonActive : {}),
                                }}
                                onClick={() => setSelectedDate(dateStr)}
                              >
                                {label}
                              </button>
                            );
                          })}
                    </div>
                  </div>
                  {bookingData.selectedMovie ? (
                    <div
                      style={{ marginBottom: "1rem", padding: "1rem", backgroundColor: "#fef3c7", borderRadius: "8px" }}
                    >
                      <div style={{ fontSize: "0.875rem", color: "#a16207", fontWeight: "600" }}>
                        Phim đã chọn: {bookingData.selectedMovie.Title}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                        Thời lượng: {bookingData.selectedMovie.Duration} phút
                      </div>
                      {loading && (
                        <div style={{ fontSize: "0.75rem", color: "#a16207", marginTop: "0.5rem" }}>
                          Đang tải suất chiếu...
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      style={{ marginBottom: "1rem", padding: "1rem", backgroundColor: "#fef3c7", borderRadius: "8px" }}
                    >
                      <div style={{ fontSize: "0.875rem", color: "#92400e", textAlign: "center" }}>
                        Vui lòng chọn phim trước để xem suất chiếu
                      </div>
                    </div>
                  )}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {!bookingData.selectedMovie ? (
                      <div style={{ textAlign: "center", color: "#64748b", padding: "2rem" }}>
                        Vui lòng chọn phim để xem suất chiếu
                      </div>
                    ) : loading ? (
                      <div style={{ textAlign: "center", color: "#64748b", padding: "2rem" }}>
                        <LoadingSpinner />
                        <div style={{ marginTop: "1rem" }}>Đang tải suất chiếu...</div>
                      </div>
                    ) : (
                      showtimes.map((showtime) => {
                        const isSelected = bookingData.selectedShowtime?.Showtime_ID === showtime.Showtime_ID;

                        return (
                          <div
                            key={showtime.Showtime_ID}
                            style={{
                              ...styles.showtimeCard,
                              ...(isSelected ? styles.showtimeCardSelected : {}),
                              padding: "0.75rem",
                            }}
                            onClick={() => {
                              setBookingData((prev) => ({ ...prev, selectedShowtime: showtime }));
                            }}
                            onMouseEnter={(e) => {
                              if (!isSelected) {
                                Object.assign(e.currentTarget.style, styles.showtimeCardHover);
                              }
                            }}
                            onMouseLeave={(e) => {
                              Object.assign(e.currentTarget.style, {
                                ...styles.showtimeCard,
                                ...(isSelected ? styles.showtimeCardSelected : {}),
                                padding: "0.75rem",
                              });
                            }}
                          >                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: "0.5rem",
                                fontSize: "0.875rem",
                              }}
                            >
                              <div>
                                <div style={{ color: "#64748b", fontSize: "0.75rem" }}>Ngày</div>
                                <div style={{ fontWeight: "600" }}>
                                  {new Date(showtime.Show_Date).toLocaleDateString("vi-VN")}
                                </div>
                              </div>
                              <div>
                                <div style={{ color: "#64748b", fontSize: "0.75rem" }}>Giờ chiếu</div>
                                <div style={{ fontWeight: "600" }}>
                                  {showtime.Start_Time} - {showtime.End_Time}
                                </div>
                              </div>
                              <div>
                                <div style={{ color: "#64748b", fontSize: "0.75rem" }}>Phòng</div>
                                <div style={{ fontWeight: "600" }}>
                                  {showtime.Room_Name} ({showtime.Room?.Room_Type || ''})
                                </div>
                              </div>
                              <div>
                                <div style={{ color: "#64748b", fontSize: "0.75rem" }}>Ghế trống</div>
                                <div style={{ fontWeight: "600", color: "#059669" }}>
                                  {showtime.AvailableSeats || showtime.Capacity_Available || 0}/{showtime.TotalSeats || 'N/A'}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>{" "}
                  {bookingData.selectedMovie && !loading && showtimes.length === 0 && (
                    <div style={{ textAlign: "center", color: "#64748b", marginTop: "2rem" }}>
                      Không có suất chiếu nào cho ngày đã chọn
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Continue Button */}
            {bookingData.selectedMovie && bookingData.selectedShowtime && (
              <div
                style={{
                  marginTop: "2rem",
                  padding: "1.5rem",
                  backgroundColor: "#fefce8",
                  border: "2px solid #fde047",
                  borderRadius: "12px",
                  textAlign: "center",
                }}
              >
                <div style={{ color: "#a16207", marginBottom: "1rem" }}>
                  <strong>Đã chọn:</strong> {bookingData.selectedMovie.Title} -{" "}
                  {new Date(bookingData.selectedShowtime.Show_Date).toLocaleDateString("vi-VN")}{" "}
                  {bookingData.selectedShowtime.Start_Time}
                </div>
                <button
                  style={{
                    ...styles.primaryButton,
                    fontSize: "1.125rem",
                    padding: "1rem 2rem",
                  }}
                  onClick={() => {
                    showSuccessToast("Tiếp tục với chức năng chọn ghế (sẽ được phát triển tiếp)");
                    setCurrentStep(2);
                  }}
                  onMouseEnter={(e) => {
                    Object.assign(e.currentTarget.style, styles.primaryButtonHover);
                  }}
                  onMouseLeave={(e) => {
                    Object.assign(e.currentTarget.style, {
                      ...styles.primaryButton,
                      fontSize: "1.125rem",
                      padding: "1rem 2rem",
                    });
                  }}
                >
                  Tiếp tục chọn ghế →
                </button>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div style={styles.stepContent}>
            <h2 style={styles.sectionTitle}>Chức năng đang được phát triển</h2>
            <p style={{ textAlign: "center", color: "#64748b", marginBottom: "2rem" }}>
              Các bước tiếp theo sẽ được bổ sung trong các phiên bản sau.
            </p>
            <div style={styles.buttonGroup}>
              <button
                style={styles.secondaryButton}
                onClick={() => setCurrentStep(1)}
                onMouseEnter={(e) => {
                  Object.assign(e.currentTarget.style, styles.secondaryButtonHover);
                }}
                onMouseLeave={(e) => {
                  Object.assign(e.currentTarget.style, styles.secondaryButton);
                }}
              >
                ← Quay về bước đầu
              </button>
            </div>
          </div>
        );
    }
  };

  if (error && !movies.length) {
    return (
      <div style={styles.staffBooking}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
          <div
            style={{
              textAlign: "center",
              padding: "2rem",
              backgroundColor: "#fef2f2",
              border: "2px solid #fecaca",
              borderRadius: "12px",
              maxWidth: "400px",
            }}
          >
            <h2 style={{ color: "#dc2626", marginBottom: "1rem" }}>Có lỗi xảy ra</h2>
            <p style={{ marginBottom: "1.5rem", color: "#7f1d1d" }}>{error}</p>
            <button
              style={{
                ...styles.primaryButton,
                backgroundColor: "#dc2626",
              }}
              onClick={loadMovies}
              onMouseEnter={(e) => {
                Object.assign(e.currentTarget.style, { backgroundColor: "#b91c1c" });
              }}
              onMouseLeave={(e) => {
                Object.assign(e.currentTarget.style, { backgroundColor: "#dc2626" });
              }}
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.staffBooking}>
      <div style={styles.bookingHeader}>
        <h1 style={styles.bookingTitle}>Đặt Vé Cho Khách Hàng</h1>
        <div style={styles.stepIndicator}>
          {BOOKING_STEPS.map((step) => (
            <div
              key={step.id}
              style={{
                ...styles.step,
                ...(currentStep === step.id ? styles.stepActive : {}),
                ...(currentStep > step.id ? styles.stepCompleted : {}),
              }}
            >
              <div style={styles.stepNumber}>{step.id}</div>
              <div style={styles.stepInfo}>
                <div style={styles.stepTitle}>{step.title}</div>
                <div style={styles.stepDescription}>{step.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.bookingContent}>{renderCurrentStep()}</div>

      {loading && (
        <div style={styles.loadingOverlay}>
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
};

export default StaffBooking;

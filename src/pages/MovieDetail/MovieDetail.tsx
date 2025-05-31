import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./MovieDetail.css";
import Poster from "../../assets/images/AVG_EndGame_Poster.jpg";
import Backdrop from "../../assets/images/AVG_EndGame_Backdrop.jpg";

interface Movie {
  id: string;
  title: string;
  originalTitle: string;
  description: string;
  duration: number;
  releaseDate: string;
  director: string;
  cast: string[];
  genres: string[];
  rating: number;
  ageRating: string;
  language: string;
  subtitles: string[];
  poster: string;
  backdrop: string;
  trailer: string;
  status: "coming-soon" | "now-showing" | "ended";
  price: {
    standard: number;
    vip: number;
    couple: number;
  };
}

interface Showtime {
  id: string;
  movieId: string;
  date: string;
  time: string;
  cinema: string;
  screen: string;
  seatTypes: {
    standard: { available: number; total: number; price: number };
    vip: { available: number; total: number; price: number };
    couple: { available: number; total: number; price: number };
  };
}

const MovieDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedCinema, setSelectedCinema] = useState<string>("all");
  const [showTrailer, setShowTrailer] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "showtimes">("overview");

  useEffect(() => {
    if (id) {
      fetchMovieDetails(id);
      fetchShowtimes(id);
    }
  }, [id]);

  const fetchMovieDetails = async (movieId: string) => {
    try {
      // Mock data - replace with actual API call
      movieId = movieId || "1"; // Default to a mock ID if none provided
      setTimeout(() => {
        const mockMovie: Movie = {
          id: movieId,
          title: "Avengers: Endgame",
          originalTitle: "Avengers: Endgame",
          description:
            "Sau những sự kiện tàn khốc của Avengers: Infinity War, vũ trụ đã bị tàn phá do nỗ lực của Thanos - kẻ titan điên loạn. Với sự giúp đỡ của những đồng minh còn lại, các Avengers phải tập hợp một lần nữa để hoàn tác những hành động của Thanos và khôi phục lại trật tự cho vũ trụ một lần và mãi mãi.",
          duration: 181,
          releaseDate: "2019-04-26",
          director: "Anthony Russo, Joe Russo",
          cast: [
            "Robert Downey Jr.",
            "Chris Evans",
            "Mark Ruffalo",
            "Chris Hemsworth",
            "Scarlett Johansson",
            "Jeremy Renner",
          ],
          genres: ["Hành động", "Phiêu lưu", "Chính kịch", "Khoa học viễn tưởng"],
          rating: 8.4,
          ageRating: "T13",
          language: "Tiếng Anh",
          subtitles: ["Tiếng Anh", "Tiếng Việt", "Tiếng Trung"],
          poster: Poster,
          backdrop: Backdrop,
          trailer: "https://www.youtube.com/embed/TcMBFSGVi1c",
          status: "now-showing",
          price: {
            standard: 120000,
            vip: 180000,
            couple: 250000,
          },
        };
        setMovie(mockMovie);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching movie details:", error);
      setLoading(false);
    }
  };

  const fetchShowtimes = async (movieId: string) => {
    try {
      // Mock data with more dates - replace with actual API call
      const mockShowtimes: Showtime[] = [
        // May 30, 2025 (Today)
        {
          id: "1",
          movieId,
          date: "2025-05-31",
          time: "10:00",
          cinema: "CGV Vincom Center",
          screen: "Phòng chiếu 1",
          seatTypes: {
            standard: { available: 45, total: 60, price: 120000 },
            vip: { available: 12, total: 20, price: 180000 },
            couple: { available: 4, total: 6, price: 250000 },
          },
        },
        {
          id: "2",
          movieId,
          date: "2025-05-31",
          time: "14:30",
          cinema: "CGV Vincom Center",
          screen: "Phòng chiếu 2",
          seatTypes: {
            standard: { available: 30, total: 60, price: 120000 },
            vip: { available: 8, total: 20, price: 180000 },
            couple: { available: 2, total: 6, price: 250000 },
          },
        },
        {
          id: "3",
          movieId,
          date: "2025-05-31",
          time: "19:15",
          cinema: "Lotte Cinema",
          screen: "Phòng chiếu 3",
          seatTypes: {
            standard: { available: 25, total: 60, price: 120000 },
            vip: { available: 15, total: 20, price: 180000 },
            couple: { available: 6, total: 6, price: 250000 },
          },
        },
        {
          id: "4",
          movieId,
          date: "2025-05-31",
          time: "22:00",
          cinema: "Galaxy Cinema",
          screen: "Phòng chiếu 1",
          seatTypes: {
            standard: { available: 40, total: 60, price: 120000 },
            vip: { available: 18, total: 20, price: 180000 },
            couple: { available: 5, total: 6, price: 250000 },
          },
        },

        // May 31, 2025 (Tomorrow)
        {
          id: "5",
          movieId,
          date: "2025-06-06",
          time: "09:30",
          cinema: "CGV Vincom Center",
          screen: "Phòng chiếu 1",
          seatTypes: {
            standard: { available: 55, total: 60, price: 120000 },
            vip: { available: 19, total: 20, price: 180000 },
            couple: { available: 6, total: 6, price: 250000 },
          },
        },
        {
          id: "6",
          movieId,
          date: "2025-06-06",
          time: "13:00",
          cinema: "Lotte Cinema",
          screen: "Phòng chiếu 2",
          seatTypes: {
            standard: { available: 35, total: 60, price: 120000 },
            vip: { available: 10, total: 20, price: 180000 },
            couple: { available: 3, total: 6, price: 250000 },
          },
        },
        {
          id: "7",
          movieId,
          date: "2025-06-06",
          time: "16:45",
          cinema: "Galaxy Cinema",
          screen: "Phòng chiếu 2",
          seatTypes: {
            standard: { available: 28, total: 60, price: 120000 },
            vip: { available: 14, total: 20, price: 180000 },
            couple: { available: 4, total: 6, price: 250000 },
          },
        },
        {
          id: "8",
          movieId,
          date: "2025-06-06",
          time: "20:30",
          cinema: "BHD Star",
          screen: "Phòng chiếu 1",
          seatTypes: {
            standard: { available: 22, total: 60, price: 120000 },
            vip: { available: 6, total: 20, price: 180000 },
            couple: { available: 2, total: 6, price: 250000 },
          },
        },

        // June 1, 2025
        {
          id: "9",
          movieId,
          date: "2025-06-01",
          time: "11:15",
          cinema: "CGV Vincom Center",
          screen: "Phòng chiếu 3",
          seatTypes: {
            standard: { available: 50, total: 60, price: 120000 },
            vip: { available: 17, total: 20, price: 180000 },
            couple: { available: 5, total: 6, price: 250000 },
          },
        },
        {
          id: "10",
          movieId,
          date: "2025-06-01",
          time: "15:20",
          cinema: "Lotte Cinema",
          screen: "Phòng chiếu 1",
          seatTypes: {
            standard: { available: 42, total: 60, price: 120000 },
            vip: { available: 11, total: 20, price: 180000 },
            couple: { available: 3, total: 6, price: 250000 },
          },
        },
        {
          id: "11",
          movieId,
          date: "2025-06-01",
          time: "18:45",
          cinema: "Galaxy Cinema",
          screen: "Phòng chiếu 3",
          seatTypes: {
            standard: { available: 38, total: 60, price: 120000 },
            vip: { available: 9, total: 20, price: 180000 },
            couple: { available: 1, total: 6, price: 250000 },
          },
        },

        // June 2, 2025
        {
          id: "12",
          movieId,
          date: "2025-06-02",
          time: "10:45",
          cinema: "BHD Star",
          screen: "Phòng chiếu 2",
          seatTypes: {
            standard: { available: 48, total: 60, price: 120000 },
            vip: { available: 16, total: 20, price: 180000 },
            couple: { available: 4, total: 6, price: 250000 },
          },
        },
        {
          id: "13",
          movieId,
          date: "2025-06-02",
          time: "14:15",
          cinema: "CGV Vincom Center",
          screen: "Phòng chiếu 2",
          seatTypes: {
            standard: { available: 33, total: 60, price: 120000 },
            vip: { available: 7, total: 20, price: 180000 },
            couple: { available: 2, total: 6, price: 250000 },
          },
        },
        {
          id: "14",
          movieId,
          date: "2025-06-02",
          time: "17:30",
          cinema: "Lotte Cinema",
          screen: "Phòng chiếu 3",
          seatTypes: {
            standard: { available: 26, total: 60, price: 120000 },
            vip: { available: 13, total: 20, price: 180000 },
            couple: { available: 5, total: 6, price: 250000 },
          },
        },
        {
          id: "15",
          movieId,
          date: "2025-06-02",
          time: "21:00",
          cinema: "Galaxy Cinema",
          screen: "Phòng chiếu 1",
          seatTypes: {
            standard: { available: 19, total: 60, price: 120000 },
            vip: { available: 4, total: 20, price: 180000 },
            couple: { available: 1, total: 6, price: 250000 },
          },
        },

        // June 3, 2025
        {
          id: "16",
          movieId,
          date: "2025-06-03",
          time: "12:00",
          cinema: "CGV Vincom Center",
          screen: "Phòng chiếu 1",
          seatTypes: {
            standard: { available: 44, total: 60, price: 120000 },
            vip: { available: 15, total: 20, price: 180000 },
            couple: { available: 6, total: 6, price: 250000 },
          },
        },
        {
          id: "17",
          movieId,
          date: "2025-06-03",
          time: "16:30",
          cinema: "BHD Star",
          screen: "Phòng chiếu 3",
          seatTypes: {
            standard: { available: 37, total: 60, price: 120000 },
            vip: { available: 8, total: 20, price: 180000 },
            couple: { available: 3, total: 6, price: 250000 },
          },
        },
        {
          id: "18",
          movieId,
          date: "2025-06-03",
          time: "19:45",
          cinema: "Lotte Cinema",
          screen: "Phòng chiếu 2",
          seatTypes: {
            standard: { available: 31, total: 60, price: 120000 },
            vip: { available: 12, total: 20, price: 180000 },
            couple: { available: 4, total: 6, price: 250000 },
          },
        },

        // June 4, 2025
        {
          id: "19",
          movieId,
          date: "2025-06-04",
          time: "13:30",
          cinema: "Galaxy Cinema",
          screen: "Phòng chiếu 2",
          seatTypes: {
            standard: { available: 52, total: 60, price: 120000 },
            vip: { available: 18, total: 20, price: 180000 },
            couple: { available: 5, total: 6, price: 250000 },
          },
        },
        {
          id: "20",
          movieId,
          date: "2025-06-04",
          time: "18:00",
          cinema: "CGV Vincom Center",
          screen: "Phòng chiếu 3",
          seatTypes: {
            standard: { available: 29, total: 60, price: 120000 },
            vip: { available: 5, total: 20, price: 180000 },
            couple: { available: 2, total: 6, price: 250000 },
          },
        },

        // June 5, 2025
        {
          id: "21",
          movieId,
          date: "2025-06-05",
          time: "11:00",
          cinema: "BHD Star",
          screen: "Phòng chiếu 1",
          seatTypes: {
            standard: { available: 46, total: 60, price: 120000 },
            vip: { available: 14, total: 20, price: 180000 },
            couple: { available: 6, total: 6, price: 250000 },
          },
        },
        {
          id: "22",
          movieId,
          date: "2025-06-05",
          time: "15:45",
          cinema: "Lotte Cinema",
          screen: "Phòng chiếu 1",
          seatTypes: {
            standard: { available: 34, total: 60, price: 120000 },
            vip: { available: 9, total: 20, price: 180000 },
            couple: { available: 3, total: 6, price: 250000 },
          },
        },
        {
          id: "23",
          movieId,
          date: "2025-06-05",
          time: "20:15",
          cinema: "Galaxy Cinema",
          screen: "Phòng chiếu 3",
          seatTypes: {
            standard: { available: 23, total: 60, price: 120000 },
            vip: { available: 6, total: 20, price: 180000 },
            couple: { available: 1, total: 6, price: 250000 },
          },
        },
      ];
      setShowtimes(mockShowtimes);

      // Set default selected date to today
      const today = new Date().toISOString().split("T")[0];
      setSelectedDate(today);
    } catch (error) {
      console.error("Error fetching showtimes:", error);
    }
  };

  const getAvailableDates = () => {
    const dates = [...new Set(showtimes.map((showtime) => showtime.date))];
    return dates.sort();
  };

  const getAvailableCinemas = () => {
    const cinemas = [...new Set(showtimes.map((showtime) => showtime.cinema))];
    return cinemas.sort();
  };

  const getFilteredShowtimes = () => {
    return showtimes.filter((showtime) => {
      const dateMatch = !selectedDate || showtime.date === selectedDate;
      const cinemaMatch = selectedCinema === "all" || showtime.cinema === selectedCinema;
      return dateMatch && cinemaMatch;
    });
  };

  // Add this new function to group showtimes by cinema
  const getGroupedShowtimes = () => {
    const filteredShowtimes = getFilteredShowtimes();
    const groupedShowtimes: { [cinema: string]: Showtime[] } = {};

    filteredShowtimes.forEach((showtime) => {
      if (!groupedShowtimes[showtime.cinema]) {
        groupedShowtimes[showtime.cinema] = [];
      }
      groupedShowtimes[showtime.cinema].push(showtime);
    });

    // Sort showtimes within each cinema by time
    Object.keys(groupedShowtimes).forEach((cinema) => {
      groupedShowtimes[cinema].sort((a, b) => a.time.localeCompare(b.time));
    });

    return groupedShowtimes;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}g ${mins}p`;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={i} className="star filled">
          ★
        </span>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <span key="half" className="star half">
          ★
        </span>
      );
    }

    const remainingStars = 10 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="star empty">
          ★
        </span>
      );
    }

    return stars;
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "coming-soon":
        return "SẮP CHIẾU";
      case "now-showing":
        return "ĐANG CHIẾU";
      case "ended":
        return "ĐÃ KẾT THÚC";
      default:
        return status.toUpperCase();
    }
  };

  const handleBooking = (showtimeId: string) => {
    navigate(`/booking/${showtimeId}`);
  };

  if (loading) {
    return (
      <div className="movie-detail-loading">
        <div className="spinner"></div>
        <p>Đang tải thông tin phim...</p>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="movie-detail-error">
        <h2>Không tìm thấy phim</h2>
        <p>Phim bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
        <button onClick={() => navigate("/movies")} className="btn-primary">
          Quay lại danh sách phim
        </button>
      </div>
    );
  }

  return (
    <div className="movie-detail">
      {/* Hero Section */}
      <div className="movie-hero" style={{ backgroundImage: `url(${movie.backdrop})` }}>
        <div className="movie-hero-overlay">
          <div className="movie-hero-content">
            <div className="movie-poster">
              <img src={movie.poster} alt={movie.title} />
              <button className="play-trailer-btn" onClick={() => setShowTrailer(true)}>
                ▶ Xem Trailer
              </button>
            </div>
            <div className="movie-info">
              <h1 className="movie-title">{movie.title}</h1>
              {movie.originalTitle !== movie.title && <p className="original-title">({movie.originalTitle})</p>}

              <div className="movie-meta">
                <span className="rating">
                  {renderStars(movie.rating)}
                  <span className="rating-score">{movie.rating}/10</span>
                </span>
                <span className="duration">{formatDuration(movie.duration)}</span>
                <span className="age-rating">{movie.ageRating}</span>
                <span className={`status ${movie.status}`}>{getStatusText(movie.status)}</span>
              </div>

              <div className="movie-genres">
                {movie.genres.map((genre) => (
                  <span key={genre} className="genre-tag">
                    {genre}
                  </span>
                ))}
              </div>

              <p className="movie-description">{movie.description}</p>

              <div className="movie-details">
                <div className="detail-item">
                  <strong>Đạo diễn:</strong> {movie.director}
                </div>
                <div className="detail-item">
                  <strong>Ngày phát hành:</strong> {new Date(movie.releaseDate).toLocaleDateString("vi-VN")}
                </div>
                <div className="detail-item">
                  <strong>Ngôn ngữ:</strong> {movie.language}
                </div>
                <div className="detail-item">
                  <strong>Phụ đề:</strong> {movie.subtitles.join(", ")}
                </div>
              </div>

              {movie.status === "now-showing" && (
                <button className="btn-book-now" onClick={() => setActiveTab("showtimes")}>
                  Đặt vé ngay
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="movie-tabs">
        <button
          className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Tổng quan
        </button>
        <button
          className={`tab-btn ${activeTab === "showtimes" ? "active" : ""}`}
          onClick={() => setActiveTab("showtimes")}
        >
          Lịch chiếu
        </button>
      </div>

      {/* Tab Content */}
      <div className="movie-content">
        {activeTab === "overview" && (
          <div className="overview-tab">
            <div className="cast-section">
              <h3>Diễn viên</h3>
              <div className="cast-list">
                {movie.cast.map((actor) => (
                  <div key={actor} className="cast-member">
                    <div className="actor-avatar">{actor.charAt(0)}</div>
                    <span className="actor-name">{actor}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pricing-section">
              <h3>Giá vé</h3>
              <div className="price-list">
                <div className="price-item">
                  <span className="seat-type">Ghế thường</span>
                  <span className="price">{formatPrice(movie.price.standard)}</span>
                </div>
                <div className="price-item">
                  <span className="seat-type">Ghế VIP</span>
                  <span className="price">{formatPrice(movie.price.vip)}</span>
                </div>
                <div className="price-item">
                  <span className="seat-type">Ghế đôi</span>
                  <span className="price">{formatPrice(movie.price.couple)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "showtimes" && (
          <div className="showtimes-tab">
            <div className="showtime-filters">
              <div className="filter-group">
                <label>Chọn ngày:</label>
                <div className="date-buttons">
                  <button
                    className={`date-btn ${selectedDate === new Date().toISOString().split("T")[0] ? "active" : ""}`}
                    onClick={() => setSelectedDate(new Date().toISOString().split("T")[0])}
                  >
                    Hôm nay
                  </button>
                  {getAvailableDates().map((date) => (
                    <button
                      key={date}
                      className={`date-btn ${selectedDate === date ? "active" : ""}`}
                      onClick={() => setSelectedDate(date)}
                    >
                      {new Date(date).toLocaleDateString("vi-VN", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <label>Chọn rạp:</label>
                <select value={selectedCinema} onChange={(e) => setSelectedCinema(e.target.value)}>
                  <option value="all">Tất cả rạp</option>
                  {getAvailableCinemas().map((cinema) => (
                    <option key={cinema} value={cinema}>
                      {cinema}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="showtimes-list">
              {Object.keys(getGroupedShowtimes()).length === 0 ? (
                <div className="no-showtimes">
                  <p>Không có lịch chiếu nào phù hợp với bộ lọc đã chọn.</p>
                </div>
              ) : (
                Object.entries(getGroupedShowtimes()).map(([cinema, cinemaShowtimes]) => (
                  <div key={cinema} className="cinema-group">
                    <div className="cinema-header">
                      <h3 className="cinema-name">{cinema}</h3>
                      <p className="showtimes-count">{cinemaShowtimes.length} suất chiếu</p>
                    </div>

                    <div className="cinema-showtimes">
                      {cinemaShowtimes.map((showtime) => (
                        <button
                          key={showtime.id}
                          className="showtime-btn"
                          onClick={() => handleBooking(showtime.id)}
                          disabled={
                            showtime.seatTypes.standard.available === 0 &&
                            showtime.seatTypes.vip.available === 0 &&
                            showtime.seatTypes.couple.available === 0
                          }
                        >
                          {showtime.time}
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Trailer Modal */}
      {showTrailer && (
        <div className="trailer-modal" onClick={() => setShowTrailer(false)}>
          <div className="trailer-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-trailer" onClick={() => setShowTrailer(false)}>
              ✕
            </button>
            <iframe src={movie.trailer} title="Trailer phim" frameBorder="0" allowFullScreen></iframe>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetail;

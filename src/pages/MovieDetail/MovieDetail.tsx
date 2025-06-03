import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMovieById } from "../../config/MovieApi";
import { getShowtimesByMovie, getMovieShowtimeDates } from "../../config/ShowtimeApi";
import loadingGif from "../../assets/images/loading.gif";

interface Movie {
  Movie_ID: number;
  Movie_Name: string;
  Release_Date: string;
  End_Date: string;
  Director: string;
  Cast: string;
  Duration: number;
  Genre: string;
  Rating: string;
  Language: string;
  Country: string;
  Synopsis: string;
  Poster_URL: string;
  Trailer_Link: string;
  Status: string;
  Average_Rating: number;
  Rating_Count: number;
  Showtimes_Count: number;
}

interface Showtime {
  Showtime_ID: string;
  Movie_ID: number;
  Room_ID: number;
  Showtime_Date: string;
  Start_Time: string;
  End_Time: string;
  Price: number;
  Available_Seats: number;
  Total_Seats: number;
  Status: string;
  Room_Name?: string;
  Cinema_Name?: string;
}

const MovieDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedCinema, setSelectedCinema] = useState<string>("all");
  const [showTrailer, setShowTrailer] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "showtimes">("overview");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchMovieDetails(id);
      fetchShowtimes(id);
      fetchAvailableDates(id);
    }
  }, [id]);

  const fetchMovieDetails = async (movieId: string) => {
    try {
      const movieData = await getMovieById(movieId);
      setMovie(movieData);
    } catch (error: any) {
      console.error("Error fetching movie details:", error);
      setError(error.response?.data?.message || "Không thể tải thông tin phim");
    }
  };

  const fetchShowtimes = async (movieId: string) => {
    try {
      const showtimeData = await getShowtimesByMovie(movieId);
      setShowtimes(Array.isArray(showtimeData) ? showtimeData : []);
    } catch (error: any) {
      console.error("Error fetching showtimes:", error);
      // Don't set error for showtimes as it's not critical
    }
  };

  const fetchAvailableDates = async (movieId: string) => {
    try {
      const datesData = await getMovieShowtimeDates(movieId);
      setAvailableDates(Array.isArray(datesData) ? datesData : []);

      // Set default selected date to today if available
      const today = new Date().toISOString().split("T")[0];
      if (datesData.includes(today)) {
        setSelectedDate(today);
      } else if (datesData.length > 0) {
        setSelectedDate(datesData[0]);
      }
    } catch (error: any) {
      console.error("Error fetching available dates:", error);
      // Set default to today even if API fails
      setSelectedDate(new Date().toISOString().split("T")[0]);
    } finally {
      setLoading(false);
    }
  };

  const getAvailableCinemas = () => {
    const cinemas = [
      ...new Set(
        showtimes
          .filter((showtime) => !selectedDate || showtime.Showtime_Date === selectedDate)
          .map((showtime) => showtime.Cinema_Name || "Unknown Cinema")
      ),
    ];
    return cinemas.sort();
  };

  const getFilteredShowtimes = () => {
    return showtimes.filter((showtime) => {
      const dateMatch = !selectedDate || showtime.Showtime_Date === selectedDate;
      const cinemaMatch = selectedCinema === "all" || showtime.Cinema_Name === selectedCinema;
      return dateMatch && cinemaMatch && showtime.Status === "Active";
    });
  };

  const getGroupedShowtimes = () => {
    const filteredShowtimes = getFilteredShowtimes();
    const groupedShowtimes: { [cinema: string]: Showtime[] } = {};

    filteredShowtimes.forEach((showtime) => {
      const cinemaName = showtime.Cinema_Name || "Unknown Cinema";
      if (!groupedShowtimes[cinemaName]) {
        groupedShowtimes[cinemaName] = [];
      }
      groupedShowtimes[cinemaName].push(showtime);
    });

    // Sort showtimes within each cinema by time
    Object.keys(groupedShowtimes).forEach((cinema) => {
      groupedShowtimes[cinema].sort((a, b) => a.Start_Time.localeCompare(b.Start_Time));
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
    switch (status.toLowerCase()) {
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
      <>
        <div className="movie-detail">
          <div className="detail-loading">
            <img src={loadingGif} alt="Loading..." className="detail-loading-gif" />
          </div>
        </div>

        <style>{`
          .movie-detail {
            min-height: 100vh;
            background-color: #000;
            color: #ffffff;
          }

          .movie-detail .detail-loading {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            background-color: #000;
          }

          .movie-detail .detail-loading-gif {
            width: 150px;
            height: 150px;
            background: none;
            mix-blend-mode: screen;
          }
        `}</style>
      </>
    );
  }

  if (error || !movie) {
    return (
      <>
        <div className="movie-detail">
          <div className="detail-error">
            <h2>Không tìm thấy phim</h2>
            <p>{error || "Phim bạn đang tìm kiếm không tồn tại hoặc đã bị xóa."}</p>
            <button onClick={() => navigate("/movies")} className="detail-btn-primary">
              Quay lại danh sách phim
            </button>
          </div>
        </div>

        <style>{`
          .movie-detail {
            min-height: 100vh;
            background-color: #000;
            color: #ffffff;
          }

          .movie-detail .detail-error {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            text-align: center;
            color: #ffffff;
            padding: 2rem;
          }

          .movie-detail .detail-error h2 {
            color: #ffd700;
            margin-bottom: 1rem;
            font-size: 2rem;
          }

          .movie-detail .detail-error p {
            margin-bottom: 2rem;
            font-size: 1.1rem;
            color: #cccccc;
          }

          .movie-detail .detail-btn-primary {
            background: #ffd700;
            color: #000;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
            transition: background-color 0.3s ease;
            font-size: 1rem;
          }

          .movie-detail .detail-btn-primary:hover {
            background: #ffa500;
          }
        `}</style>
      </>
    );
  }

  return (
    <div className="movie-detail">
      {/* Hero Section */}
      <div className="detail-hero" style={{ backgroundImage: `url(${movie.Poster_URL})` }}>
        <div className="detail-hero-overlay">
          <div className="detail-hero-content">
            <div className="detail-poster">
              <img src={movie.Poster_URL} alt={movie.Movie_Name} />
              <button className="detail-play-trailer-btn" onClick={() => setShowTrailer(true)}>
                ▶ Xem Trailer
              </button>
            </div>
            <div className="detail-info">
              <h1 className="detail-title">{movie.Movie_Name}</h1>

              <div className="detail-meta">
                <span className="detail-rating">
                  {renderStars(movie.Average_Rating)}
                  <span className="detail-rating-score">{movie.Average_Rating}/10</span>
                </span>
                <span className="detail-duration">{formatDuration(movie.Duration)}</span>
                <span className="detail-age-rating">{movie.Rating}</span>
                <span className={`detail-status ${movie.Status.toLowerCase()}`}>{getStatusText(movie.Status)}</span>
              </div>

              <div className="detail-genres">
                {movie.Genre.split(",").map((genre, index) => (
                  <span key={index} className="detail-genre-tag">
                    {genre.trim()}
                  </span>
                ))}
              </div>

              <p className="detail-description">{movie.Synopsis}</p>

              <div className="detail-details">
                <div className="detail-item">
                  <strong>Đạo diễn:</strong> {movie.Director}
                </div>
                <div className="detail-item">
                  <strong>Diễn viên:</strong> {movie.Cast}
                </div>
                <div className="detail-item">
                  <strong>Ngày phát hành:</strong> {new Date(movie.Release_Date).toLocaleDateString("vi-VN")}
                </div>
                <div className="detail-item">
                  <strong>Ngôn ngữ:</strong> {movie.Language}
                </div>
                <div className="detail-item">
                  <strong>Quốc gia:</strong> {movie.Country}
                </div>
              </div>

              {movie.Status.toLowerCase() === "now-showing" && (
                <button className="detail-btn-book-now" onClick={() => setActiveTab("showtimes")}>
                  Đặt vé ngay
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="detail-tabs">
        <button
          className={`detail-tab-btn ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Tổng quan
        </button>
        <button
          className={`detail-tab-btn ${activeTab === "showtimes" ? "active" : ""}`}
          onClick={() => setActiveTab("showtimes")}
        >
          Lịch chiếu
        </button>
      </div>

      {/* Tab Content */}
      <div className="detail-content">
        {activeTab === "overview" && (
          <div className="detail-overview-tab">
            <div className="detail-cast-section">
              <h3>Diễn viên</h3>
              <div className="detail-cast-list">
                {movie.Cast.split(",").map((actor) => (
                  <div key={actor} className="detail-cast-member">
                    <div className="detail-actor-avatar">{actor.trim().charAt(0)}</div>
                    <span className="detail-actor-name">{actor.trim()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "showtimes" && (
          <div className="detail-showtimes-tab">
            <div className="detail-showtime-filters">
              <div className="detail-filter-group">
                <label>Chọn ngày:</label>
                <div className="detail-date-buttons">
                  <button
                    className={`detail-date-btn ${
                      selectedDate === new Date().toISOString().split("T")[0] ? "active" : ""
                    }`}
                    onClick={() => setSelectedDate(new Date().toISOString().split("T")[0])}
                  >
                    Hôm nay
                  </button>
                  {availableDates.map((date) => (
                    <button
                      key={date}
                      className={`detail-date-btn ${selectedDate === date ? "active" : ""}`}
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

              <div className="detail-filter-group">
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

            <div className="detail-showtimes-list">
              {Object.keys(getGroupedShowtimes()).length === 0 ? (
                <div className="detail-no-showtimes">
                  <p>Không có lịch chiếu nào phù hợp với bộ lọc đã chọn.</p>
                </div>
              ) : (
                Object.entries(getGroupedShowtimes()).map(([cinema, cinemaShowtimes]) => (
                  <div key={cinema} className="detail-cinema-group">
                    <div className="detail-cinema-header">
                      <h3 className="detail-cinema-name">{cinema}</h3>
                      <p className="detail-showtimes-count">{cinemaShowtimes.length} suất chiếu</p>
                    </div>

                    <div className="detail-cinema-showtimes">
                      {cinemaShowtimes.map((showtime) => (
                        <button
                          key={showtime.Showtime_ID}
                          className="detail-showtime-btn"
                          onClick={() => handleBooking(showtime.Showtime_ID)}
                          disabled={showtime.Available_Seats === 0}
                        >
                          <div className="showtime-time">{showtime.Start_Time}</div>
                          <div className="showtime-info">
                            <span>{formatPrice(showtime.Price)}</span>
                            <span>
                              {showtime.Available_Seats}/{showtime.Total_Seats} ghế
                            </span>
                          </div>
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
        <div className="detail-trailer-modal" onClick={() => setShowTrailer(false)}>
          <div className="detail-trailer-content" onClick={(e) => e.stopPropagation()}>
            <button className="detail-close-trailer" onClick={() => setShowTrailer(false)}>
              ✕
            </button>
            <iframe src={movie.Trailer_Link} title="Trailer phim" frameBorder="0" allowFullScreen></iframe>
          </div>
        </div>
      )}

      <style>{`
        /* Main container - unique prefix to avoid conflicts */
        .movie-detail {
          min-height: 100vh;
          background-color: #000;
          color: #ffffff;
        }

        /* Loading and Error States */
        .movie-detail .detail-loading {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          background-color: #000;
        }

        .movie-detail .detail-loading-gif {
          width: 150px;
          height: 150px;
          background: none;
          mix-blend-mode: screen;
        }

        .movie-detail .detail-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          text-align: center;
          color: #ffffff;
          padding: 2rem;
        }

        .movie-detail .detail-error h2 {
          color: #ffd700;
          margin-bottom: 1rem;
          font-size: 2rem;
        }

        .movie-detail .detail-error p {
          margin-bottom: 2rem;
          font-size: 1.1rem;
          color: #cccccc;
        }

        .movie-detail .detail-btn-primary {
          background: #ffd700;
          color: #000;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.3s ease;
          font-size: 1rem;
        }

        .movie-detail .detail-btn-primary:hover {
          background: #ffa500;
        }

        /* Hero Section */
        .movie-detail .detail-hero {
          position: relative;
          height: 80vh;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }

        .movie-detail .detail-hero-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.6) 50%, rgba(0, 0, 0, 0.3) 100%);
        }

        .movie-detail .detail-hero-content {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 3rem;
          display: flex;
          gap: 2rem;
          align-items: flex-end;
        }

        .movie-detail .detail-poster {
          position: relative;
          flex-shrink: 0;
        }

        .movie-detail .detail-poster img {
          width: 300px;
          height: 450px;
          object-fit: cover;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        }

        .movie-detail .detail-play-trailer-btn {
          position: absolute;
          bottom: 1rem;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(255, 215, 0, 0.9);
          color: #000;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: background-color 0.3s ease;
        }

        .movie-detail .detail-play-trailer-btn:hover {
          background: #ffd700;
        }

        .movie-detail .detail-info {
          flex: 1;
          max-width: 600px;
        }

        .movie-detail .detail-title {
          font-size: 3rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
          color: #ffffff;
        }

        .movie-detail .detail-original-title {
          font-size: 1.2rem;
          color: #cccccc;
          margin: 0 0 1.5rem 0;
          font-style: italic;
        }

        .movie-detail .detail-meta {
          display: flex;
          align-items: center;
          gap: 2rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }

        .movie-detail .detail-rating {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .movie-detail .star {
          color: #ffc107;
          font-size: 1.2rem;
        }

        .movie-detail .star.filled {
          color: #ffc107;
        }

        .movie-detail .star.half {
          background: linear-gradient(90deg, #ffc107 50%, #333 50%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .movie-detail .star.empty {
          color: #333;
        }

        .movie-detail .detail-rating-score {
          color: #ffffff;
          font-weight: 600;
        }

        .movie-detail .detail-duration,
        .movie-detail .detail-age-rating {
          color: #cccccc;
          font-weight: 500;
        }

        .movie-detail .detail-status {
          padding: 0.25rem 0.75rem;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .movie-detail .detail-status.now-showing {
          background: #ffd700;
          color: #000;
        }

        .movie-detail .detail-status.coming-soon {
          background: #ffa500;
          color: #000;
        }

        .movie-detail .detail-status.ended {
          background: #7f8c8d;
          color: white;
        }

        .movie-detail .detail-genres {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }

        .movie-detail .detail-genre-tag {
          background: rgba(255, 255, 255, 0.1);
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.9rem;
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .movie-detail .detail-description {
          font-size: 1.1rem;
          line-height: 1.6;
          color: #cccccc;
          margin-bottom: 2rem;
          word-wrap: break-word;
          word-break: break-word;
          white-space: normal;
          overflow-wrap: break-word;
          hyphens: auto;
          max-width: 100%;
          text-align: justify;
        }

        .movie-detail .detail-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .movie-detail .detail-item {
          color: #cccccc;
        }

        .movie-detail .detail-item strong {
          color: #ffffff;
        }

        .movie-detail .detail-btn-book-now {
          background: linear-gradient(135deg, #ffd700 0%, #ffa500 100%);
          color: #000;
          border: none;
          padding: 1rem 2rem;
          font-size: 1.1rem;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .movie-detail .detail-btn-book-now:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(255, 215, 0, 0.3);
        }

        .movie-detail .detail-btn-primary {
          background: #ffd700;
          color: #000;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.3s ease;
        }

        .movie-detail .detail-btn-primary:hover {
          background: #ffa500;
        }

        /* Tabs */
        .movie-detail .detail-tabs {
          background: #111;
          padding: 0 3rem;
          display: flex;
          border-bottom: 1px solid #333;
        }

        .movie-detail .detail-tab-btn {
          background: none;
          border: none;
          color: #cccccc;
          padding: 1.5rem 2rem;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          border-bottom: 3px solid transparent;
          transition: all 0.3s ease;
        }

        .movie-detail .detail-tab-btn:hover {
          color: #ffffff;
        }

        .movie-detail .detail-tab-btn.active {
          color: #ffd700;
          border-bottom-color: #ffd700;
        }

        /* Tab Content */
        .movie-detail .detail-content {
          padding: 3rem;
          background: #111;
        }

        /* Overview Tab */
        .movie-detail .detail-overview-tab {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 3rem;
        }

        .movie-detail .detail-cast-section h3,
        .movie-detail .detail-pricing-section h3 {
          color: #ffffff;
          font-size: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .movie-detail .detail-cast-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 1rem;
        }

        .movie-detail .detail-cast-member {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 0.5rem;
        }

        .movie-detail .detail-actor-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: #ffd700;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #000;
          font-weight: 600;
          font-size: 1.5rem;
        }

        .movie-detail .detail-actor-name {
          color: #cccccc;
          font-size: 0.9rem;
        }

        .movie-detail .detail-price-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .movie-detail .detail-price-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: #222;
          border-radius: 8px;
          border-left: 4px solid #ffd700;
        }

        .movie-detail .detail-seat-type {
          color: #ffffff;
          font-weight: 500;
        }

        .movie-detail .detail-price {
          color: #ffd700;
          font-weight: 600;
          font-size: 1.1rem;
        }

        /* Showtimes Tab */
        .movie-detail .detail-showtime-filters {
          display: flex;
          gap: 2rem;
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: #222;
          border-radius: 8px;
          justify-content: space-between;
        }

        .movie-detail .detail-filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .movie-detail .detail-filter-group:first-child {
          flex: 1;
          margin-right: 2rem;
        }

        .movie-detail .detail-filter-group:last-child {
          flex-shrink: 0;
          min-width: 200px;
        }

        .movie-detail .detail-filter-group label {
          color: #ffffff;
          font-weight: 500;
        }

        .movie-detail .detail-filter-group select {
          padding: 0.75rem;
          border: 1px solid #333;
          border-radius: 6px;
          background: #000;
          color: #ffffff;
          font-size: 1rem;
          min-width: 200px;
        }

        .movie-detail .detail-filter-group select:focus {
          outline: none;
          border-color: #ffd700;
        }

        .movie-detail .detail-date-buttons {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
          margin-top: 0.5rem;
          max-width: 100%;
          overflow-x: auto;
          padding-bottom: 0.5rem;
        }

        .movie-detail .detail-date-btn {
          background: #222;
          color: #cccccc;
          border: 2px solid #444;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          font-size: 0.9rem;
          transition: all 0.3s ease;
          min-width: 100px;
          text-align: center;
          flex-shrink: 0;
          white-space: nowrap;
        }

        .movie-detail .detail-date-btn:hover {
          background: #333;
          color: #ffffff;
          border-color: #555;
          transform: translateY(-1px);
        }

        .movie-detail .detail-date-btn.active {
          background: linear-gradient(135deg, #ffd700 0%, #ffa500 100%);
          color: #000;
          border-color: #ffd700;
          box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
        }

        .movie-detail .detail-showtimes-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .movie-detail .detail-no-showtimes {
          text-align: center;
          padding: 3rem;
          color: #cccccc;
        }

        .movie-detail .detail-cinema-group {
          margin-bottom: 2rem;
          background: #222;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid #333;
        }

        .movie-detail .detail-cinema-header {
          background: #000;
          padding: 1.5rem;
          border-bottom: 1px solid #333;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .movie-detail .detail-cinema-name {
          color: #ffffff;
          margin: 0;
          font-size: 1.4rem;
          font-weight: 600;
        }

        .movie-detail .detail-showtimes-count {
          color: #cccccc;
          margin: 0;
          font-size: 0.9rem;
        }

        .movie-detail .detail-cinema-showtimes {
          padding: 1.5rem;
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .movie-detail .detail-showtime-btn {
          background: #222;
          color: #ffffff;
          border: 2px solid #444;
          padding: 0.75rem 1.25rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 1rem;
          transition: all 0.3s ease;
          min-width: 80px;
          text-align: center;
        }

        .movie-detail .detail-showtime-btn:hover:not(:disabled) {
          background: #ffd700;
          border-color: #ffd700;
          color: #000;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
        }

        .movie-detail .detail-showtime-btn:disabled {
          background: #444;
          color: #888;
          border-color: #555;
          cursor: not-allowed;
          transform: none;
          opacity: 0.6;
        }

        /* Trailer Modal */
        .movie-detail .detail-trailer-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 2rem;
        }

        .movie-detail .detail-trailer-content {
          position: relative;
          width: 100%;
          max-width: 1000px;
          aspect-ratio: 16/9;
        }

        .movie-detail .detail-trailer-content iframe {
          width: 100%;
          height: 100%;
          border-radius: 8px;
        }

        .movie-detail .detail-close-trailer {
          position: absolute;
          top: -50px;
          right: 0;
          background: none;
          border: none;
          color: white;
          font-size: 2rem;
          cursor: pointer;
          padding: 0.5rem;
          z-index: 10000;
        }

        .movie-detail .detail-close-trailer:hover {
          color: #ffd700;
        }

        /* Responsive Design */
        @media (max-width: 1200px) {
          .movie-detail .detail-hero-content {
            padding: 2rem;
            flex-direction: column;
            align-items: center;
            text-align: center;
          }

          .movie-detail .detail-poster img {
            width: 250px;
            height: 375px;
          }

          .movie-detail .detail-title {
            font-size: 2.5rem;
          }

          .movie-detail .detail-overview-tab {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
        }

        @media (max-width: 768px) {
          .movie-detail .detail-hero {
            height: 60vh;
          }

          .movie-detail .detail-hero-content {
            padding: 1rem;
            position: static;
            background: rgba(0, 0, 0, 0.8);
          }

          .movie-detail .detail-poster img {
            width: 200px;
            height: 300px;
          }

          .movie-detail .detail-title {
            font-size: 2rem;
          }

          .movie-detail .detail-meta {
            gap: 1rem;
          }

          .movie-detail .detail-tabs {
            padding: 0 1rem;
          }

          .movie-detail .detail-tab-btn {
            padding: 1rem;
            font-size: 0.9rem;
          }

          .movie-detail .detail-content {
            padding: 1.5rem;
          }

          .movie-detail .detail-showtime-filters {
            flex-direction: column;
            gap: 1rem;
            justify-content: flex-start;
          }

          .movie-detail .detail-filter-group:first-child {
            margin-right: 0;
          }

          .movie-detail .detail-filter-group:last-child {
            min-width: auto;
          }

          .movie-detail .detail-cast-list {
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          }

          .movie-detail .detail-cinema-header {
            flex-direction: column;
            gap: 0.5rem;
            text-align: center;
          }

          .movie-detail .detail-cinema-showtimes {
            padding: 1rem;
            gap: 0.75rem;
          }

          .movie-detail .detail-showtime-btn {
            flex: 1;
            min-width: 70px;
            padding: 0.6rem 1rem;
            font-size: 0.9rem;
          }

          .movie-detail .detail-date-buttons {
            gap: 0.5rem;
            overflow-x: auto;
            scrollbar-width: thin;
            scrollbar-color: #404564 transparent;
          }

          .movie-detail .detail-date-btn {
            padding: 0.6rem 0.8rem;
            font-size: 0.85rem;
            min-width: 90px;
          }
        }

        @media (max-width: 480px) {
          .movie-detail .detail-poster img {
            width: 150px;
            height: 225px;
          }

          .movie-detail .detail-title {
            font-size: 1.5rem;
          }

          .movie-detail .detail-tab-btn {
            padding: 0.75rem 0.5rem;
            font-size: 0.8rem;
          }

          .movie-detail .detail-content {
            padding: 1rem;
          }

          .movie-detail .detail-trailer-modal {
            padding: 1rem;
          }

          .movie-detail .detail-close-trailer {
            top: -40px;
            font-size: 1.5rem;
          }

          .movie-detail .detail-cinema-header {
            padding: 1rem;
          }

          .movie-detail .detail-cinema-name {
            font-size: 1.2rem;
          }

          .movie-detail .detail-cinema-showtimes {
            padding: 0.75rem;
            gap: 0.5rem;
          }

          .movie-detail .detail-showtime-btn {
            min-width: 60px;
            padding: 0.5rem 0.75rem;
            font-size: 0.85rem;
          }

          .movie-detail .detail-date-btn {
            padding: 0.5rem 0.6rem;
            font-size: 0.8rem;
            min-width: 80px;
          }
        }
      `}</style>
    </div>
  );
};

export default MovieDetail;

import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMovieById } from "../../config/MovieApi";
import loadingGif from "../../assets/images/loading.gif";
import RateModal from "./components/RateModal";
import {
  PlayCircleOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";

interface ApiMovieResponse {
  Movie_ID: number;
  Movie_Name: string;
  Release_Date: string;
  End_Date: string;
  Production_Company: string;
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
  Created_At: string;
  Updated_At: string;
  Rating_Summary: {
    Average_Rating: number;
    Rating_Count: number;
    Rating_Distribution: number[];
  };
  Ratings: Array<{
    Rating_ID: number;
    Full_Name: string;
    Rating: number;
    Comment: string;
    Rating_Date: string;
    Is_Verified: boolean;
  }>;
  Showtimes: Array<{
    Show_Date: string;
    Showtimes: Array<{
      Showtime_ID: number;
      Start_Time: string;
      End_Time: string;
      Capacity_Available: number;
      Room: {
        Cinema_Room_ID: number;
        Room_Name: string;
        Room_Type: string;
      };
    }>;
  }>;
}

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

const MovieDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [movieData, setMovieData] = useState<ApiMovieResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedCinema, setSelectedCinema] = useState<string>("all");
  const [showTrailer, setShowTrailer] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "showtimes" | "reviews">("overview");
  const [error, setError] = useState<string | null>(null);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (id) {
      fetchMovieDetails(id);
    }
  }, [id]);

  // Handle keyboard events for trailer modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && showTrailer) {
        setShowTrailer(false);
      }
    };

    if (showTrailer) {
      document.addEventListener("keydown", handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [showTrailer]);

  const fetchMovieDetails = async (movieId: string) => {
    try {
      setLoading(true);
      const data: ApiMovieResponse = await getMovieById(movieId);
      console.log("Movie API Response:", data);

      setMovieData(data);

      // Transform API response to component format
      const transformedMovie: Movie = {
        Movie_ID: data.Movie_ID,
        Movie_Name: data.Movie_Name,
        Release_Date: data.Release_Date,
        End_Date: data.End_Date,
        Director: data.Director,
        Cast: data.Cast,
        Duration: data.Duration,
        Genre: data.Genre,
        Rating: data.Rating,
        Language: data.Language,
        Country: data.Country,
        Synopsis: data.Synopsis,
        Poster_URL: data.Poster_URL,
        Trailer_Link: data.Trailer_Link,
        Status: data.Status,
        Average_Rating: data.Rating_Summary?.Average_Rating || 0,
        Rating_Count: data.Rating_Summary?.Rating_Count || 0,
        Showtimes_Count: data.Showtimes?.reduce((total, dateGroup) => total + dateGroup.Showtimes.length, 0) || 0,
      };

      setMovie(transformedMovie);

      // Set default selected date
      if (data.Showtimes && data.Showtimes.length > 0) {
        const today = new Date().toISOString().split("T")[0];
        const todayShowtime = data.Showtimes.find((st) => new Date(st.Show_Date).toISOString().split("T")[0] === today);

        if (todayShowtime) {
          setSelectedDate(new Date(todayShowtime.Show_Date).toISOString().split("T")[0]);
        } else {
          setSelectedDate(new Date(data.Showtimes[0].Show_Date).toISOString().split("T")[0]);
        }
      }
    } catch (error: any) {
      console.error("Error fetching movie details:", error);
      setError(error.response?.data?.message || "Không thể tải thông tin phim");
    } finally {
      setLoading(false);
    }
  };

  const getAvailableCinemas = () => {
    if (!movieData?.Showtimes || !selectedDate) return [];

    const selectedDateGroup = movieData.Showtimes.find(
      (st) => new Date(st.Show_Date).toISOString().split("T")[0] === selectedDate
    );

    if (!selectedDateGroup) return [];

    const cinemas = [...new Set(selectedDateGroup.Showtimes.map((showtime) => showtime.Room.Room_Name))];

    return cinemas.sort();
  };

  const getFilteredShowtimes = () => {
    if (!movieData?.Showtimes || !selectedDate) return [];

    const selectedDateGroup = movieData.Showtimes.find(
      (st) => new Date(st.Show_Date).toISOString().split("T")[0] === selectedDate
    );

    if (!selectedDateGroup) return [];

    return selectedDateGroup.Showtimes.filter((showtime) => {
      const cinemaMatch = selectedCinema === "all" || showtime.Room.Room_Name === selectedCinema;
      return cinemaMatch;
    });
  };

  const getGroupedShowtimes = () => {
    const filteredShowtimes = getFilteredShowtimes();
    const groupedShowtimes: { [cinema: string]: any[] } = {};

    filteredShowtimes.forEach((showtime) => {
      const cinemaName = `Galaxy Cinema - ${showtime.Room.Room_Name}`;
      if (!groupedShowtimes[cinemaName]) {
        groupedShowtimes[cinemaName] = [];
      }
      groupedShowtimes[cinemaName].push({
        Showtime_ID: showtime.Showtime_ID,
        Start_Time: new Date(showtime.Start_Time).toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        End_Time: new Date(showtime.End_Time).toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        Available_Seats: showtime.Capacity_Available,
        Room_Name: showtime.Room.Room_Name,
        Room_Type: showtime.Room.Room_Type,
        Is_Almost_Full: showtime.Capacity_Available < 10,
      });
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

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="star empty">
          ★
        </span>
      );
    }

    return stars;
  };
  const handleBooking = (showtimeId: string) => {
    navigate(`/booking/${showtimeId}`);
  };

  const renderDateButtons = () => {
    if (!movieData?.Showtimes) return null;

    const today = new Date().toISOString().split("T")[0];

    return (
      <div className="detail-date-buttons">
        {movieData.Showtimes.map((dateGroup, index) => {
          const date = new Date(dateGroup.Show_Date).toISOString().split("T")[0];
          const isToday = date === today;

          return (
            <button
              key={index}
              className={`detail-date-btn ${selectedDate === date ? "active" : ""}`}
              onClick={() => setSelectedDate(date)}
            >
              {isToday
                ? "Hôm nay"
                : new Date(dateGroup.Show_Date).toLocaleDateString("vi-VN", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
            </button>
          );
        })}
      </div>
    );
  };

  const handleRatingSubmitted = async () => {
    // Refresh movie data to show updated ratings
    if (id) {
      await fetchMovieDetails(id);
    }
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
  const getEmbedUrl = (url: string) => {
    if (!url) return "";

    // YouTube URL patterns
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(youtubeRegex);

    if (match) {
      return `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0&modestbranding=1`;
    }

    // Vimeo URL patterns
    const vimeoRegex = /(?:vimeo\.com\/)([0-9]+)/;
    const vimeoMatch = url.match(vimeoRegex);

    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
    }

    // If it's already an embed URL, return as is
    if (url.includes("embed") || url.includes("player")) {
      return url;
    }

    // Return original URL as fallback
    return url;
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
      <div className="detail-hero" style={{ backgroundImage: `url(${movie?.Poster_URL})` }} ref={heroRef}>
        <div className="detail-hero-overlay">
          <div className="detail-hero-content">
            <div className="detail-poster">
              <img src={movie?.Poster_URL} alt={movie?.Movie_Name} />{" "}
              <div className="detail-poster-actions">
                {movie?.Trailer_Link && (
                  <button className="detail-play-trailer-btn" onClick={() => setShowTrailer(true)}>
                    <PlayCircleOutlined style={{ fontSize: "20px", marginRight: "8px" }} />
                    Xem Trailer
                  </button>
                )}
              </div>
            </div>
            <div className="detail-info">
              <div className="detail-status-badge">
                <span className={`detail-status ${movie?.Status.toLowerCase()}`}>
                  {getStatusText(movie?.Status || "")}
                </span>
              </div>

              <h1 className="detail-title">{movie?.Movie_Name}</h1>

              <div className="detail-meta">
                <div className="detail-rating">
                  {renderStars(movie?.Average_Rating || 0)}
                  <span className="detail-rating-score">{movie?.Average_Rating || 0}/5</span>
                  <span className="detail-rating-count">({movie?.Rating_Count || 0} đánh giá)</span>
                </div>
                <div className="detail-meta-items">
                  <span className="detail-duration">
                    <ClockCircleOutlined style={{ marginRight: "4px" }} />
                    {formatDuration(movie?.Duration || 0)}
                  </span>
                  <span className="detail-age-rating">{movie?.Rating}</span>
                  <span className="detail-release-date">
                    <CalendarOutlined style={{ marginRight: "4px" }} />
                    {new Date(movie?.Release_Date || "").getFullYear()}
                  </span>
                </div>
              </div>

              <div className="detail-genres">
                {movie?.Genre.split(",").map((genre, index) => (
                  <span key={index} className="detail-genre-tag">
                    {genre.trim()}
                  </span>
                ))}
              </div>

              <p className="detail-description">{movie?.Synopsis}</p>

              <div className="detail-quick-info">
                <div className="detail-info-grid">
                  <div className="detail-info-item">
                    <UserOutlined style={{ marginRight: "8px", color: "#ffd700" }} />
                    <div>
                      <strong>Đạo diễn:</strong>
                      <p>{movie?.Director}</p>
                    </div>
                  </div>
                  <div className="detail-info-item">
                    <EnvironmentOutlined style={{ marginRight: "8px", color: "#ffd700" }} />
                    <div>
                      <strong>Quốc gia:</strong>
                      <p>{movie?.Country}</p>
                    </div>
                  </div>
                  <div className="detail-info-item">
                    <CalendarOutlined style={{ marginRight: "8px", color: "#ffd700" }} />
                    <div>
                      <strong>Phát hành:</strong>
                      <p>{new Date(movie?.Release_Date || "").toLocaleDateString("vi-VN")}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="detail-hero-actions">
                {movie?.Status.toLowerCase() !== "cancelled" && (
                  <button className="detail-btn-book-now" onClick={() => setActiveTab("showtimes")}>
                    🎫 Đặt vé ngay
                  </button>
                )}
                <button className="detail-btn-secondary" onClick={() => setActiveTab("reviews")}>
                  ⭐ Đánh giá phim
                </button>
              </div>
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
          Lịch chiếu ({movie?.Showtimes_Count || 0})
        </button>
        <button
          className={`detail-tab-btn ${activeTab === "reviews" ? "active" : ""}`}
          onClick={() => setActiveTab("reviews")}
        >
          Đánh giá ({movie?.Rating_Count || 0})
        </button>
      </div>
      {/* Tab Content */}
      <div className="detail-content">
        {" "}
        {activeTab === "overview" && (
          <div className="detail-overview-tab">
            <div className="detail-movie-stats">
              <div className="stats-container">
                <div className="stat-item">
                  <h4>{movie?.Average_Rating || 0}</h4>
                  <p>Điểm đánh giá</p>
                </div>
                <div className="stat-item">
                  <h4>{movie?.Rating_Count || 0}</h4>
                  <p>Lượt đánh giá</p>
                </div>
                <div className="stat-item">
                  <h4>{movie?.Showtimes_Count || 0}</h4>
                  <p>Suất chiếu</p>
                </div>
                <div className="stat-item">
                  <h4>{formatDuration(movie?.Duration || 0)}</h4>
                  <p>Thời lượng</p>
                </div>
              </div>
            </div>

            <div className="detail-cast-section">
              <h3>Diễn viên chính</h3>
              <div className="detail-cast-list">
                {movie?.Cast.split(",")
                  .slice(0, 6)
                  .map((actor, index) => (
                    <div key={index} className="detail-cast-member">
                      <div className="detail-actor-avatar">{actor.trim().charAt(0)}</div>
                      <span className="detail-actor-name">{actor.trim()}</span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="detail-movie-info">
              <h3>Thông tin chi tiết</h3>
              <div className="detail-info-table">
                <div className="info-row">
                  <span className="info-label">Đạo diễn:</span>
                  <span className="info-value">{movie?.Director}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Diễn viên:</span>
                  <span className="info-value">{movie?.Cast}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Thể loại:</span>
                  <span className="info-value">{movie?.Genre}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Ngôn ngữ:</span>
                  <span className="info-value">{movie?.Language}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Quốc gia sản xuất:</span>
                  <span className="info-value">{movie?.Country}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Ngày khởi chiếu:</span>
                  <span className="info-value">{new Date(movie?.Release_Date || "").toLocaleDateString("vi-VN")}</span>
                </div>
                {movie?.End_Date && (
                  <div className="info-row">
                    <span className="info-label">Ngày kết thúc:</span>
                    <span className="info-value">{new Date(movie?.End_Date || "").toLocaleDateString("vi-VN")}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {activeTab === "showtimes" && (
          <div className="detail-showtimes-tab">
            <div className="detail-showtime-filters">
              <div className="detail-filter-group">
                <label>Chọn ngày:</label>
                {renderDateButtons()}
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
                          className={`detail-showtime-btn ${showtime.Is_Almost_Full ? "almost-full" : ""}`}
                          onClick={() => handleBooking(showtime.Showtime_ID)}
                          disabled={showtime.Available_Seats === 0}
                        >
                          <div className="showtime-time">{showtime.Start_Time}</div>
                          <div className="showtime-info">
                            <span className="available-seats">{showtime.Available_Seats} ghế trống</span>
                            <span className="room-type">{showtime.Room_Type}</span>
                            {showtime.Is_Almost_Full && <small className="almost-full-text">Sắp hết chỗ</small>}
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
        {activeTab === "reviews" && (
          <div className="detail-reviews-tab">
            <div className="reviews-summary">
              <div className="rating-overview">
                <div className="overall-rating">
                  <span className="rating-number">{movie?.Average_Rating || 0}</span>
                  <div className="rating-stars">{renderStars(movie?.Average_Rating || 0)}</div>
                  <p>{movie?.Rating_Count || 0} đánh giá</p>
                </div>

                {movieData?.Rating_Summary?.Rating_Distribution && (
                  <div className="rating-distribution">
                    {movieData.Rating_Summary.Rating_Distribution.slice(0, 5).map((count, index) => (
                      <div key={index} className="rating-bar">
                        <span>{index + 1} sao</span>
                        <div className="bar">
                          <div
                            className="bar-fill"
                            style={{
                              width: `${movie?.Rating_Count ? (count / movie.Rating_Count) * 100 : 0}%`,
                            }}
                          ></div>
                        </div>
                        <span>{count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rating-actions">
                <button className="btn-rate-movie" onClick={() => setShowRatingForm(true)}>
                  ⭐ Đánh giá phim này
                </button>
              </div>
            </div>

            <div className="reviews-list">
              {movieData?.Ratings && movieData.Ratings.length > 0 ? (
                movieData.Ratings.map((review) => (
                  <div key={review.Rating_ID} className="review-item">
                    <div className="review-header">
                      <div className="reviewer-info">
                        <div className="reviewer-avatar">{review.Full_Name.charAt(0).toUpperCase()}</div>
                        <div className="reviewer-details">
                          <h4>{review.Full_Name}</h4>
                          <div className="review-rating">{renderStars(review.Rating)}</div>
                        </div>
                      </div>
                      <span className="review-date">{new Date(review.Rating_Date).toLocaleDateString("vi-VN")}</span>
                    </div>
                    {review.Comment && <p className="review-comment">{review.Comment}</p>}
                    {review.Is_Verified && <span className="verified-badge">✓ Đã xác thực</span>}
                  </div>
                ))
              ) : (
                <div className="no-reviews">
                  <p>Chưa có đánh giá nào cho phim này.</p>
                  <button className="btn-be-first-review" onClick={() => setShowRatingForm(true)}>
                    Hãy là người đầu tiên đánh giá!
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {/* Rating Modal */}
      <RateModal
        isOpen={showRatingForm}
        onClose={() => setShowRatingForm(false)}
        movieId={id!}
        movieName={movie?.Movie_Name || ""}
        onRatingSubmitted={handleRatingSubmitted}
      />{" "}
      {/* Trailer Modal */}
      {showTrailer && (
        <div className="detail-trailer-modal" onClick={() => setShowTrailer(false)}>
          <div className="detail-trailer-content" onClick={(e) => e.stopPropagation()}>
            <button className="detail-close-trailer" onClick={() => setShowTrailer(false)}>
              ✕
            </button>{" "}
            <iframe
              src={getEmbedUrl(movie?.Trailer_Link || "")}
              title={`Trailer phim ${movie?.Movie_Name}`}
              frameBorder="0"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              loading="lazy"
            ></iframe>
          </div>{" "}
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
        }        /* Hero Section */
        .movie-detail .detail-hero {
          position: relative;
          height: 90vh;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          background-attachment: fixed;
        }

        .movie-detail .detail-hero-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            135deg,
            rgba(0, 0, 0, 0.9) 0%,
            rgba(0, 0, 0, 0.7) 40%,
            rgba(0, 0, 0, 0.5) 70%,
            rgba(0, 0, 0, 0.3) 100%
          );
        }

        .movie-detail .detail-hero-content {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 4rem 3rem;
          display: flex;
          gap: 3rem;
          align-items: flex-end;
          max-width: 1400px;
          margin: 0 auto;
        }

        .movie-detail .detail-poster {
          position: relative;
          flex-shrink: 0;
        }

        .movie-detail .detail-poster img {
          width: 320px;
          height: 480px;
          object-fit: cover;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
          transition: transform 0.3s ease;
        }

        .movie-detail .detail-poster:hover img {
          transform: scale(1.02);
        }

        .movie-detail .detail-poster-actions {
          position: absolute;
          bottom: -20px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          gap: 12px;
          align-items: center;
        }

        .movie-detail .detail-play-trailer-btn {
          background: linear-gradient(135deg, #ffd700 0%, #ffb700 100%);
          color: #000;
          border: none;
          padding: 12px 20px;
          border-radius: 25px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          box-shadow: 0 8px 25px rgba(255, 215, 0, 0.4);
        }

        .movie-detail .detail-play-trailer-btn:hover {
          background: linear-gradient(135deg, #ffed4e 0%, #ffd700 100%);
          transform: translateY(-2px);
          box-shadow: 0 12px 35px rgba(255, 215, 0, 0.6);
        }        .movie-detail .detail-info {
          flex: 1;
          padding-left: 2rem;
        }

        .movie-detail .detail-status-badge {
          margin-bottom: 1rem;
        }

        .movie-detail .detail-status {
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .movie-detail .detail-status.now-showing {
          background: linear-gradient(135deg, #2ed573 0%, #1e90ff 100%);
          color: #fff;
        }

        .movie-detail .detail-status.coming-soon {
          background: linear-gradient(135deg, #ffd700 0%, #ffa500 100%);
          color: #000;
        }

        .movie-detail .detail-status.ended {
          background: linear-gradient(135deg, #747d8c 0%, #57606f 100%);
          color: #fff;
        }

        .movie-detail .detail-title {
          font-size: 3.5rem;
          font-weight: 900;
          margin: 1rem 0;
          background: linear-gradient(135deg, #fff 0%, #ffd700 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
          line-height: 1.2;
        }

        .movie-detail .detail-meta {
          margin: 1.5rem 0;
        }

        .movie-detail .detail-rating {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .movie-detail .detail-rating-score {
          font-size: 1.2rem;
          font-weight: 700;
          color: #ffd700;
        }

        .movie-detail .detail-rating-count {
          font-size: 0.9rem;
          color: #ccc;
        }

        .movie-detail .detail-meta-items {
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }

        .movie-detail .detail-duration,
        .movie-detail .detail-age-rating,
        .movie-detail .detail-release-date {
          background: rgba(255, 255, 255, 0.1);
          padding: 8px 12px;
          border-radius: 15px;
          font-size: 0.9rem;
          font-weight: 500;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
        }

        .movie-detail .detail-age-rating {
          background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
          color: #fff;
          font-weight: 700;
        }

        .movie-detail .detail-genres {
          margin: 1.5rem 0;
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .movie-detail .detail-genre-tag {
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 215, 0, 0.1) 100%);
          color: #ffd700;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
          border: 1px solid rgba(255, 215, 0, 0.3);
          backdrop-filter: blur(10px);
        }

        .movie-detail .detail-description {
          font-size: 1.1rem;
          line-height: 1.7;
          margin: 2rem 0;
          color: #e0e0e0;
          max-width: 800px;
        }

        .movie-detail .detail-quick-info {
          margin: 2rem 0;
        }

        .movie-detail .detail-info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .movie-detail .detail-info-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          background: rgba(255, 255, 255, 0.05);
          padding: 15px;
          border-radius: 12px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .movie-detail .detail-info-item strong {
          color: #ffd700;
          font-size: 0.9rem;
          margin-bottom: 4px;
          display: block;
        }

        .movie-detail .detail-info-item p {
          margin: 0;
          color: #ccc;
          font-size: 0.95rem;
        }

        .movie-detail .detail-hero-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2.5rem;
        }

        .movie-detail .detail-btn-book-now {
          background: linear-gradient(135deg, #ffd700 0%, #ffb700 100%);
          color: #000;
          border: none;
          padding: 15px 30px;
          border-radius: 25px;
          font-size: 1.1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 8px 25px rgba(255, 215, 0, 0.4);
        }

        .movie-detail .detail-btn-book-now:hover {
          background: linear-gradient(135deg, #ffed4e 0%, #ffd700 100%);
          transform: translateY(-3px);
          box-shadow: 0 12px 35px rgba(255, 215, 0, 0.6);
        }

        .movie-detail .detail-btn-secondary {
          background: transparent;
          color: #fff;
          border: 2px solid rgba(255, 255, 255, 0.3);
          padding: 13px 28px;
          border-radius: 25px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .movie-detail .detail-btn-secondary:hover {
          border-color: #ffd700;
          color: #ffd700;
          background: rgba(255, 215, 0, 0.1);
          transform: translateY(-2px);
        }

        /* Tabs */
        .movie-detail .detail-tabs {
          background: #111;
          padding: 0;
          display: flex;
          justify-content: center;
          border-bottom: 1px solid #333;
          position: sticky;
          top: 0;
          z-index: 100;
          backdrop-filter: blur(10px);
        }

        .movie-detail .detail-tab-btn {
          background: transparent;
          color: #ccc;
          border: none;
          padding: 20px 40px;
          cursor: pointer;
          font-size: 1.1rem;
          font-weight: 600;
          transition: all 0.3s ease;
          position: relative;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .movie-detail .detail-tab-btn::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 3px;
          background: linear-gradient(135deg, #ffd700 0%, #ffb700 100%);
          transition: width 0.3s ease;
        }

        .movie-detail .detail-tab-btn:hover {
          color: #ffd700;
        }

        .movie-detail .detail-tab-btn.active {
          color: #ffd700;
        }

        .movie-detail .detail-tab-btn.active::after {
          width: 100%;
        }

        /* Tab Content */
        .movie-detail .detail-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 4rem 3rem;
          background: #0a0a0a;
          min-height: 60vh;
        }

        /* Overview Tab */
        .movie-detail .detail-overview-tab {
          display: flex;
          flex-direction: column;
          gap: 3rem;
        }

        .movie-detail .detail-movie-stats {
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%);
          border-radius: 20px;
          padding: 2rem;
          border: 1px solid rgba(255, 215, 0, 0.2);
        }

        .movie-detail .stats-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 2rem;
          text-align: center;
        }

        .movie-detail .stat-item h4 {
          font-size: 2.5rem;
          font-weight: 900;
          color: #ffd700;
          margin: 0;
          margin-bottom: 0.5rem;
        }

        .movie-detail .stat-item p {
          color: #ccc;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-size: 0.9rem;
          margin: 0;
        }

        .movie-detail .detail-cast-section {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 20px;
          padding: 2rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .movie-detail .detail-cast-section h3 {
          color: #ffd700;
          font-size: 1.5rem;
          margin-bottom: 1.5rem;
          font-weight: 700;
        }

        .movie-detail .detail-cast-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1.5rem;
        }

        .movie-detail .detail-cast-member {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 15px;
          transition: all 0.3s ease;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .movie-detail .detail-cast-member:hover {
          background: rgba(255, 215, 0, 0.1);
          border-color: rgba(255, 215, 0, 0.3);
          transform: translateY(-5px);
        }

        .movie-detail .detail-actor-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ffd700 0%, #ffb700 100%);
          color: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: 900;
        }

        .movie-detail .detail-actor-name {
          color: #fff;
          font-weight: 600;
          text-align: center;
          font-size: 0.95rem;
        }

        .movie-detail .detail-movie-info {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 20px;
          padding: 2rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .movie-detail .detail-movie-info h3 {
          color: #ffd700;
          font-size: 1.5rem;
          margin-bottom: 1.5rem;
          font-weight: 700;
        }

        .movie-detail .detail-info-table {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .movie-detail .info-row {
          display: grid;
          grid-template-columns: 200px 1fr;
          gap: 1rem;
          padding: 1rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .movie-detail .info-row:last-child {
          border-bottom: none;
        }

        .movie-detail .info-label {
          color: #ffd700;
          font-weight: 600;
        }        .movie-detail .info-value {
          color: #ccc;
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
          z-index: 1000;
          backdrop-filter: blur(10px);
        }

        .movie-detail .detail-trailer-content {
          position: relative;
          width: 90%;
          max-width: 900px;
          height: 70vh;
          background: #000;
          border-radius: 15px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
          border: 2px solid rgba(255, 215, 0, 0.3);
        }

        .movie-detail .detail-trailer-content iframe {
          width: 100%;
          height: 100%;
          border: none;
        }

        .movie-detail .detail-close-trailer {
          position: absolute;
          top: 15px;
          right: 15px;
          background: rgba(0, 0, 0, 0.8);
          color: #fff;
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: bold;
          z-index: 1001;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .movie-detail .detail-close-trailer:hover {
          background: rgba(255, 215, 0, 0.2);
          border-color: #ffd700;
          color: #ffd700;
          transform: scale(1.1);
        }

        /* Star Rating */
        .movie-detail .star {
          color: #ffd700;
          font-size: 1.2rem;
          text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
        }

        .movie-detail .star.filled {
          color: #ffd700;
        }

        .movie-detail .star.half {
          color: #ffd700;
          opacity: 0.6;
        }

        .movie-detail .star.empty {
          color: #555;
        }

        /* Enhanced Showtimes Styling */
        .movie-detail .detail-showtimes-tab {
          padding: 2rem;
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.03) 0%, rgba(0, 0, 0, 0.05) 100%);
          border-radius: 20px;
          border: 1px solid rgba(255, 215, 0, 0.1);
        }

        .movie-detail .detail-showtime-filters {
          display: flex;
          gap: 2rem;
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 15px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .movie-detail .detail-filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .movie-detail .detail-filter-group label {
          color: #ffd700;
          font-weight: 600;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .movie-detail .detail-filter-group select {
          background: rgba(0, 0, 0, 0.7);
          color: #fff;
          border: 1px solid rgba(255, 215, 0, 0.3);
          padding: 10px 15px;
          border-radius: 8px;
          font-size: 0.95rem;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        .movie-detail .detail-filter-group select:focus {
          outline: none;
          border-color: #ffd700;
          box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.2);
        }

        .movie-detail .detail-date-btn {
          background: rgba(255, 255, 255, 0.1);
          color: #ccc;
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 12px 18px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 600;
          backdrop-filter: blur(10px);
          margin-right: 10px;
          margin-bottom: 10px;
        }

        .movie-detail .detail-date-btn:hover {
          background: rgba(255, 215, 0, 0.2);
          border-color: #ffd700;
          color: #ffd700;
          transform: translateY(-2px);
        }

        .movie-detail .detail-date-btn.active {
          background: linear-gradient(135deg, #ffd700 0%, #ffb700 100%);
          color: #000;
          border-color: #ffd700;
          font-weight: 700;
          box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);
        }

        .movie-detail .detail-cinema-group {
          margin-bottom: 2rem;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 15px;
          padding: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }

        .movie-detail .detail-cinema-group:hover {
          background: rgba(255, 215, 0, 0.05);
          border-color: rgba(255, 215, 0, 0.2);
        }

        .movie-detail .detail-cinema-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(255, 215, 0, 0.2);
        }

        .movie-detail .detail-cinema-name {
          color: #ffd700;
          font-size: 1.3rem;
          font-weight: 700;
          margin: 0;
        }

        .movie-detail .detail-showtimes-count {
          color: #ccc;
          font-size: 0.9rem;
          margin: 0;
          background: rgba(255, 215, 0, 0.1);
          padding: 4px 12px;
          border-radius: 20px;
          border: 1px solid rgba(255, 215, 0, 0.3);
        }

        .movie-detail .detail-cinema-showtimes {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 12px;
        }

        .movie-detail .detail-showtime-btn {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
          color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 15px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: left;
          backdrop-filter: blur(10px);
          position: relative;
          overflow: hidden;
        }

        .movie-detail .detail-showtime-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.1), transparent);
          transition: left 0.5s ease;
        }

        .movie-detail .detail-showtime-btn:hover::before {
          left: 100%;
        }

        .movie-detail .detail-showtime-btn:hover {
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 215, 0, 0.05) 100%);
          border-color: #ffd700;
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(255, 215, 0, 0.2);
        }

        .movie-detail .detail-showtime-btn:disabled {
          background: rgba(100, 100, 100, 0.2);
          color: #666;
          cursor: not-allowed;
          border-color: #444;
        }

        .movie-detail .detail-showtime-btn.almost-full {
          border-color: #ff6b6b;
          background: linear-gradient(135deg, rgba(255, 107, 107, 0.1) 0%, rgba(255, 107, 107, 0.05) 100%);
        }

        .movie-detail .showtime-time {
          font-size: 1.1rem;
          font-weight: 700;
          color: #ffd700;
          margin-bottom: 8px;
        }

        .movie-detail .showtime-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .movie-detail .available-seats {
          font-size: 0.85rem;
          color: #4CAF50;
          font-weight: 600;
        }

        .movie-detail .room-type {
          font-size: 0.8rem;
          color: #ccc;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .movie-detail .almost-full-text {
          color: #ff6b6b;
          font-weight: 600;
          font-size: 0.75rem;
          text-transform: uppercase;
        }

        .movie-detail .detail-no-showtimes {
          text-align: center;
          padding: 3rem 2rem;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 15px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .movie-detail .detail-no-showtimes p {
          color: #ccc;
          font-size: 1.1rem;
          margin: 0;
        }

        /* Enhanced Rating Styling */
        .movie-detail .detail-reviews-tab {
          padding: 2rem;
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.03) 0%, rgba(0, 0, 0, 0.05) 100%);
          border-radius: 20px;
          border: 1px solid rgba(255, 215, 0, 0.1);
        }

        .movie-detail .reviews-summary {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 20px;
          padding: 2rem;
          margin-bottom: 2rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .movie-detail .rating-overview {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 3rem;
          align-items: center;
          margin-bottom: 2rem;
        }

        .movie-detail .overall-rating {
          text-align: center;
          padding: 2rem;
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%);
          border-radius: 20px;
          border: 1px solid rgba(255, 215, 0, 0.2);
        }

        .movie-detail .rating-number {
          font-size: 4rem;
          font-weight: 900;
          color: #ffd700;
          display: block;
          margin-bottom: 0.5rem;
          text-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
        }

        .movie-detail .overall-rating .rating-stars {
          margin-bottom: 1rem;
          display: flex;
          justify-content: center;
          gap: 4px;
        }

        .movie-detail .overall-rating p {
          color: #ccc;
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0;
        }

        .movie-detail .rating-distribution {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .movie-detail .rating-bar {
          display: grid;
          grid-template-columns: 60px 1fr 40px;
          gap: 15px;
          align-items: center;
        }

        .movie-detail .rating-bar span:first-child {
          color: #ffd700;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .movie-detail .bar {
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          overflow: hidden;
        }

        .movie-detail .bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #ffd700 0%, #ffb700 100%);
          border-radius: 4px;
          transition: width 0.8s ease;
        }

        .movie-detail .rating-bar span:last-child {
          color: #ccc;
          font-size: 0.85rem;
          text-align: right;
        }

        .movie-detail .rating-actions {
          text-align: center;
        }

        .movie-detail .btn-rate-movie {
          background: linear-gradient(135deg, #ffd700 0%, #ffb700 100%);
          color: #000;
          border: none;
          padding: 15px 30px;
          border-radius: 25px;
          font-size: 1.1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 8px 25px rgba(255, 215, 0, 0.4);
        }

        .movie-detail .btn-rate-movie:hover {
          background: linear-gradient(135deg, #ffed4e 0%, #ffd700 100%);
          transform: translateY(-3px);
          box-shadow: 0 12px 35px rgba(255, 215, 0, 0.6);
        }

        .movie-detail .reviews-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .movie-detail .review-item {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 15px;
          padding: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }

        .movie-detail .review-item:hover {
          background: rgba(255, 215, 0, 0.05);
          border-color: rgba(255, 215, 0, 0.2);
          transform: translateY(-2px);
        }

        .movie-detail .review-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .movie-detail .reviewer-info {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .movie-detail .reviewer-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ffd700 0%, #ffb700 100%);
          color: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          font-weight: 900;
        }

        .movie-detail .reviewer-details h4 {
          color: #fff;
          margin: 0 0 4px 0;
          font-size: 1rem;
          font-weight: 600;
        }

        .movie-detail .review-rating {
          display: flex;
          gap: 2px;
        }

        .movie-detail .review-date {
          color: #888;
          font-size: 0.85rem;
        }

        .movie-detail .review-comment {
          color: #ccc;
          line-height: 1.6;
          margin: 1rem 0 0.5rem 0;
          font-size: 0.95rem;
        }

        .movie-detail .verified-badge {
          background: rgba(76, 175, 80, 0.2);
          color: #4CAF50;
          padding: 4px 12px;
          border-radius: 15px;
          font-size: 0.8rem;
          font-weight: 600;
          border: 1px solid rgba(76, 175, 80, 0.3);
        }

        .movie-detail .no-reviews {
          text-align: center;
          padding: 3rem 2rem;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 15px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .movie-detail .no-reviews p {
          color: #ccc;
          font-size: 1.1rem;
          margin-bottom: 1.5rem;
        }

        .movie-detail .btn-be-first-review {
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 215, 0, 0.1) 100%);
          color: #ffd700;
          border: 1px solid rgba(255, 215, 0, 0.3);
          padding: 12px 24px;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 600;
        }

        .movie-detail .btn-be-first-review:hover {
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.3) 0%, rgba(255, 215, 0, 0.15) 100%);
          border-color: #ffd700;
          transform: translateY(-2px);
        }        @media (max-width: 1024px) {
          .movie-detail .detail-hero-content {
            padding: 3rem 2rem;
            gap: 2rem;
          }

          .movie-detail .detail-poster img {
            width: 280px;
            height: 420px;
          }

          .movie-detail .detail-title {
            font-size: 2.8rem;
          }

          .movie-detail .detail-cinema-showtimes {
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          }

          .movie-detail .rating-overview {
            grid-template-columns: 1fr;
            gap: 2rem;
            text-align: center;
          }
        }

        @media (max-width: 768px) {
          .movie-detail .detail-hero-content {
            flex-direction: column;
            align-items: center;
            text-align: center;
            padding: 2rem 1rem;
          }

          .movie-detail .detail-poster img {
            width: 240px;
            height: 360px;
          }

          .movie-detail .detail-title {
            font-size: 2.2rem;
          }

          .movie-detail .detail-info {
            padding-left: 0;
          }

          .movie-detail .detail-content {
            padding: 2rem 1rem;
          }

          .movie-detail .detail-tabs {
            overflow-x: auto;
            justify-content: flex-start;
          }

          .movie-detail .detail-tab-btn {
            padding: 15px 25px;
            font-size: 1rem;
            white-space: nowrap;
          }

          .movie-detail .detail-hero-actions {
            flex-direction: column;
            align-items: center;
          }

          .movie-detail .info-row {
            grid-template-columns: 1fr;
            gap: 0.5rem;
          }

          .movie-detail .stats-container {
            grid-template-columns: repeat(2, 1fr);
          }

          .movie-detail .detail-showtime-filters {
            flex-direction: column;
            gap: 1rem;
          }

          .movie-detail .detail-cinema-showtimes {
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
            gap: 10px;
          }

          .movie-detail .detail-showtime-btn {
            padding: 12px;
          }

          .movie-detail .showtime-time {
            font-size: 1rem;
          }

          .movie-detail .rating-overview {
            grid-template-columns: 1fr;
          }

          .movie-detail .rating-number {
            font-size: 3rem;
          }
        }

        @media (max-width: 480px) {
          .movie-detail .detail-poster img {
            width: 200px;
            height: 300px;
          }

          .movie-detail .detail-title {
            font-size: 1.8rem;
          }

          .movie-detail .detail-cast-list {
            grid-template-columns: repeat(2, 1fr);
          }

          .movie-detail .stats-container {
            grid-template-columns: 1fr;
          }

          .movie-detail .detail-cinema-showtimes {
            grid-template-columns: 1fr;
          }

          .movie-detail .detail-showtime-btn {
            padding: 10px;
          }

          .movie-detail .showtime-time {
            font-size: 0.95rem;
          }

          .movie-detail .rating-number {
            font-size: 2.5rem;
          }          .movie-detail .detail-showtimes-tab,
          .movie-detail .detail-reviews-tab {
            padding: 1rem;
          }

          .movie-detail .reviews-summary {
            padding: 1.5rem;
          }

          .movie-detail .overall-rating {
            padding: 1.5rem;
          }

          .movie-detail .detail-trailer-content {
            width: 95%;
            height: 60vh;
          }

          .movie-detail .detail-close-trailer {
            top: 10px;
            right: 10px;
            width: 35px;
            height: 35px;
            font-size: 16px;
          }
        }

        /* Additional responsive styles for trailer */
        @media (max-width: 320px) {
          .movie-detail .detail-trailer-content {
            width: 98%;
            height: 50vh;
          }
        }

        @media (orientation: landscape) and (max-height: 600px) {
          .movie-detail .detail-trailer-content {
            height: 85vh;
          }
        }
      `}</style>
    </div>
  );
};

export default MovieDetail;

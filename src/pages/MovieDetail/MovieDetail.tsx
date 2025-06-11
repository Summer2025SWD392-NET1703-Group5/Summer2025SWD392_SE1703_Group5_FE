import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMovieById } from "../../config/MovieApi";
import loadingGif from "../../assets/images/loading.gif";
import RateModal from "./components/RateModal";

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

  useEffect(() => {
    if (id) {
      fetchMovieDetails(id);
    }
  }, [id]);

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
      return `https://www.youtube.com/embed/${match[1]}`;
    }

    // If it's already an embed URL, return as is
    if (url.includes("embed")) {
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
      <div className="detail-hero" style={{ backgroundImage: `url(${movie?.Poster_URL})` }}>
        <div className="detail-hero-overlay">
          <div className="detail-hero-content">
            <div className="detail-poster">
              <img src={movie?.Poster_URL} alt={movie?.Movie_Name} />
              {movie?.Trailer_Link && (
                <button className="detail-play-trailer-btn" onClick={() => setShowTrailer(true)}>
                  ▶ Xem Trailer
                </button>
              )}
            </div>
            <div className="detail-info">
              <h1 className="detail-title">{movie?.Movie_Name}</h1>

              <div className="detail-meta">
                <span className="detail-rating">
                  {renderStars(movie?.Average_Rating || 0)}
                  <span className="detail-rating-score">{movie?.Average_Rating || 0}/5</span>
                </span>
                <span className="detail-duration">{formatDuration(movie?.Duration || 0)}</span>
                <span className="detail-age-rating">{movie?.Rating}</span>
                <span className={`detail-status ${movie?.Status.toLowerCase()}`}>
                  {getStatusText(movie?.Status || "")}
                </span>
              </div>

              <div className="detail-genres">
                {movie?.Genre.split(",").map((genre, index) => (
                  <span key={index} className="detail-genre-tag">
                    {genre.trim()}
                  </span>
                ))}
              </div>

              <p className="detail-description">{movie?.Synopsis}</p>

              <div className="detail-details">
                <div className="detail-item">
                  <strong>Đạo diễn:</strong> {movie?.Director}
                </div>
                <div className="detail-item">
                  <strong>Diễn viên:</strong> {movie?.Cast}
                </div>
                <div className="detail-item">
                  <strong>Ngày phát hành:</strong> {new Date(movie?.Release_Date || "").toLocaleDateString("vi-VN")}
                </div>
                <div className="detail-item">
                  <strong>Ngôn ngữ:</strong> {movie?.Language}
                </div>
                <div className="detail-item">
                  <strong>Quốc gia:</strong> {movie?.Country}
                </div>
              </div>

              {movie?.Status.toLowerCase() !== "cancelled" && (
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
        {activeTab === "overview" && (
          <div className="detail-overview-tab">
            <div className="detail-cast-section">
              <h3>Diễn viên</h3>
              <div className="detail-cast-list">
                {movie?.Cast.split(",").map((actor, index) => (
                  <div key={index} className="detail-cast-member">
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
      />

      {/* Trailer Modal */}
      {showTrailer && (
        <div className="detail-trailer-modal" onClick={() => setShowTrailer(false)}>
          <div className="detail-trailer-content" onClick={(e) => e.stopPropagation()}>
            <button className="detail-close-trailer" onClick={() => setShowTrailer(false)}>
              ✕
            </button>
            <iframe
              src={getEmbedUrl(movie.Trailer_Link)}
              title="Trailer phim"
              frameBorder="0"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            ></iframe>
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
          font-size: 1rem;
          margin-right: 0.1rem;
        }

        .movie-detail .star.filled {
          color: #ffc107;
        }

        .movie-detail .star.half {
          background: linear-gradient(90deg, #ffc107 50%, #333 50%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .movie-detail .star.empty {
          color: #333;
        }

        .movie-detail .detail-rating-score {
          color: #ffffff;
          font-weight: 600;
          margin-left: 0.25rem;
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
          padding: 0.75rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.9rem;
          transition: all 0.3s ease;
          min-width: 120px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }

        .movie-detail .showtime-time {
          font-size: 1.1rem;
          font-weight: 700;
          color: #ffd700;
        }

        .movie-detail .showtime-info {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.8rem;
        }

        .movie-detail .available-seats {
          color: #4caf50;
          font-weight: 500;
        }

        .movie-detail .room-type {
          color: #ffd700;
          font-weight: 500;
          font-size: 0.7rem;
          text-transform: uppercase;
        }

        .movie-detail .almost-full-text {
          color: #ff6b35;
          font-size: 0.7rem;
          font-weight: 500;
        }

        .movie-detail .detail-showtime-btn.almost-full {
          border-color: #ff6b35;
          background: rgba(255, 107, 53, 0.1);
        }

        .movie-detail .detail-showtime-btn.almost-full .available-seats {
          color: #ff6b35;
        }

        .movie-detail .detail-showtime-btn:hover:not(:disabled) {
          background: #ffd700;
          border-color: #ffd700;
          color: #000;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
        }

        .movie-detail .detail-showtime-btn:hover:not(:disabled) .showtime-time {
          color: #000;
        }

        .movie-detail .detail-showtime-btn:hover:not(:disabled) .room-type {
          color: #000;
        }

        .movie-detail .detail-showtime-btn:disabled {
          background: #444;
          color: #888;
          border-color: #555;
          cursor: not-allowed;
          transform: none;
          opacity: 0.6;
        }

        .movie-detail .detail-showtime-btn:disabled .available-seats {
          color: #888;
        }

        /* Reviews Tab Rating Stars */
        .movie-detail .review-rating .star {
          font-size: 1rem;
          margin-right: 0.1rem;
        }

        .movie-detail .overall-rating .rating-stars .star {
          font-size: 1.5rem;
          margin-right: 0.2rem;
        }

        /* Rating Form Stars */
        .rating-star {
          font-size: 2rem;
          color: #444;
          transition: color 0.2s ease, transform 0.2s ease;
          cursor: default;
        }

        .rating-star.filled {
          color: #ffd700;
        }

        .rating-star.interactive {
          cursor: pointer;
        }

        .rating-star.interactive:hover {
          color: #ffd700;
          transform: scale(1.1);
        }

        /* Responsive Design for Rating Form */
        @media (max-width: 768px) {
          .rating-form-overlay {
            padding: 1rem;
          }

          .rating-form-modal {
            max-height: 95vh;
          }

          .rating-form-header {
            padding: 1rem;
          }

          .rating-form {
            padding: 1rem;
          }

          .rating-star {
            font-size: 1.5rem;
          }

          .movie-detail .overall-rating .rating-stars .star {
            font-size: 1.3rem;
          }

          .movie-detail .detail-showtime-btn {
            min-width: 100px;
            padding: 0.6rem 0.8rem;
            font-size: 0.85rem;
          }

          .movie-detail .showtime-time {
            font-size: 1rem;
          }

          .movie-detail .showtime-info {
            font-size: 0.75rem;
          }
        }

        @media (max-width: 480px) {
          .rating-form-header h3 {
            font-size: 1rem;
          }

          .rating-star {
            font-size: 1.3rem;
          }

          .comment-section textarea {
            min-height: 80px;
          }

          .movie-detail .detail-showtime-btn {
            min-width: 80px;
            padding: 0.5rem 0.6rem;
            font-size: 0.8rem;
          }

          .movie-detail .showtime-time {
            font-size: 0.9rem;
          }

          .movie-detail .showtime-info {
            font-size: 0.7rem;
          }

          .movie-detail .overall-rating .rating-stars .star {
            font-size: 1.2rem;
          }
        }

        /* Reviews Tab Styles - Enhanced */
        .detail-reviews-tab {
          max-width: 1200px;
          margin: 0 auto;
        }

        .reviews-summary {
          background: linear-gradient(135deg, #222 0%, #2a2a2a 100%);
          border-radius: 16px;
          padding: 2.5rem;
          margin-bottom: 2.5rem;
          border: 1px solid #333;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .rating-overview {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 3rem;
          align-items: center;
          margin-bottom: 2rem;
        }

        .overall-rating {
          text-align: center;
          padding: 1.5rem;
          background: rgba(255, 215, 0, 0.1);
          border-radius: 12px;
          border: 1px solid rgba(255, 215, 0, 0.3);
        }

        .overall-rating .rating-number {
          font-size: 4rem;
          font-weight: bold;
          color: #ffd700;
          display: block;
          text-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
        }

        .overall-rating .rating-stars {
          margin: 1rem 0;
          display: flex;
          justify-content: center;
          gap: 0.2rem;
        }

        .overall-rating .rating-stars .star {
          font-size: 1.5rem;
          margin-right: 0;
        }

        .overall-rating p {
          color: #ccc;
          font-size: 1.1rem;
          margin: 0.5rem 0 0 0;
        }

        .rating-distribution {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .rating-bar {
          display: flex;
          align-items: center;
          gap: 1rem;
          font-size: 0.95rem;
          padding: 0.5rem 0;
        }

        .rating-bar span:first-child {
          min-width: 70px;
          color: #ffd700;
          font-weight: 500;
        }

        .rating-bar span:last-child {
          min-width: 40px;
          text-align: right;
          color: #ccc;
          font-weight: 500;
        }

        .bar {
          flex: 1;
          height: 24px;
          background: #444;
          border-radius: 12px;
          overflow: hidden;
          position: relative;
        }

        .bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #ffd700 0%, #ffed4e 100%);
          transition: width 0.8s ease;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
        }

        .rating-actions {
          text-align: center;
          padding-top: 1.5rem;
          border-top: 1px solid #333;
        }

        .btn-rate-movie,
        .btn-be-first-review {
          background: linear-gradient(135deg, #ffd700 0%, #ffa500 100%);
          color: #000;
          border: none;
          padding: 1rem 2rem;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 1.1rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 4px 16px rgba(255, 215, 0, 0.3);
        }

        .btn-rate-movie:hover,
        .btn-be-first-review:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(255, 215, 0, 0.4);
          background: linear-gradient(135deg, #ffed4e 0%, #ffd700 100%);
        }

        .btn-be-first-review {
          margin-top: 1rem;
        }

        .reviews-list {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .review-item {
          background: linear-gradient(135deg, #222 0%, #2a2a2a 100%);
          border-radius: 16px;
          padding: 2rem;
          border-left: 4px solid #ffd700;
          border: 1px solid #333;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .review-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, #ffd700 0%, transparent 100%);
        }

        .review-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          border-color: #444;
        }

        .review-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
        }

        .reviewer-info {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .reviewer-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ffd700 0%, #ffa500 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #000;
          font-weight: bold;
          font-size: 1.5rem;
          box-shadow: 0 4px 16px rgba(255, 215, 0, 0.3);
        }

        .reviewer-details h4 {
          margin: 0 0 0.5rem 0;
          color: #fff;
          font-size: 1.2rem;
          font-weight: 600;
        }

        .review-rating {
          display: flex;
          gap: 0.2rem;
        }

        .review-rating .star {
          font-size: 1.1rem;
          margin-right: 0;
        }

        .review-date {
          color: #999;
          font-size: 0.9rem;
          background: rgba(255, 255, 255, 0.05);
          padding: 0.5rem 1rem;
          border-radius: 8px;
        }

        .review-comment {
          color: #ddd;
          line-height: 1.7;
          margin: 0;
          font-size: 1rem;
          background: rgba(255, 255, 255, 0.02);
          padding: 1.5rem;
          border-radius: 12px;
          border-left: 3px solid #ffd700;
        }

        .verified-badge {
          display: inline-block;
          background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
          color: white;
          padding: 0.4rem 0.8rem;
          border-radius: 16px;
          font-size: 0.8rem;
          margin-top: 1rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
        }

        .no-reviews {
          text-align: center;
          padding: 4rem 2rem;
          color: #ccc;
          background: linear-gradient(135deg, #1a1a1a 0%, #222 100%);
          border-radius: 16px;
          border: 1px solid #333;
        }

        .no-reviews p {
          font-size: 1.2rem;
          margin-bottom: 2rem;
          color: #999;
        }

        /* Rating Form Styles - Enhanced */
        .rating-form-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 2rem;
          backdrop-filter: blur(10px);
        }

        .rating-form-modal {
          background: linear-gradient(135deg, #222 0%, #2a2a2a 100%);
          border-radius: 20px;
          width: 100%;
          max-width: 550px;
          max-height: 90vh;
          overflow-y: auto;
          border: 1px solid #444;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          animation: modalSlideIn 0.3s ease-out;
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-30px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .rating-form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2rem;
          border-bottom: 1px solid #333;
          background: rgba(255, 215, 0, 0.05);
        }

        .rating-form-header h3 {
          margin: 0;
          color: #fff;
          font-size: 1.4rem;
          font-weight: 600;
        }

        .close-rating-form {
          background: none;
          border: none;
          color: #ccc;
          font-size: 2rem;
          cursor: pointer;
          padding: 0.5rem;
          transition: all 0.3s ease;
          border-radius: 50%;
          width: 45px;
          height: 45px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-rating-form:hover {
          color: #ffd700;
          background: rgba(255, 215, 0, 0.1);
          transform: rotate(90deg);
        }

        .rating-form {
          padding: 2rem;
        }

        .rating-section {
          margin-bottom: 2rem;
        }

        .rating-section label {
          display: block;
          color: #fff;
          font-weight: 600;
          margin-bottom: 1rem;
          font-size: 1.1rem;
        }

        .star-rating {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .rating-star {
          font-size: 2.5rem;
          color: #444;
          transition: all 0.2s ease;
          cursor: default;
        }

        .rating-star.filled {
          color: #ffd700;
          text-shadow: 0 2px 8px rgba(255, 215, 0, 0.5);
        }

        .rating-star.interactive {
          cursor: pointer;
        }

        .rating-star.interactive:hover {
          color: #ffd700;
          transform: scale(1.2);
          text-shadow: 0 4px 16px rgba(255, 215, 0, 0.6);
        }

        .rating-text {
          color: #ffd700;
          font-size: 1rem;
          font-weight: 600;
          background: rgba(255, 215, 0, 0.1);
          padding: 0.5rem 1rem;
          border-radius: 8px;
          border: 1px solid rgba(255, 215, 0, 0.3);
        }

        .comment-section {
          margin-bottom: 2rem;
        }

        .comment-section label {
          display: block;
          color: #fff;
          font-weight: 600;
          margin-bottom: 1rem;
          font-size: 1.1rem;
        }

        .comment-section textarea {
          width: 100%;
          background: #333;
          border: 2px solid #444;
          border-radius: 12px;
          padding: 1rem;
          color: #fff;
          font-family: inherit;
          resize: vertical;
          min-height: 120px;
          font-size: 1rem;
          line-height: 1.5;
          transition: all 0.3s ease;
        }

        .comment-section textarea:focus {
          outline: none;
          border-color: #ffd700;
          box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.1);
          background: #3a3a3a;
        }

        .comment-section textarea::placeholder {
          color: #999;
        }

        .comment-section small {
          color: #999;
          font-size: 0.85rem;
          margin-top: 0.5rem;
          display: block;
        }

        .rating-form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          padding-top: 1rem;
          border-top: 1px solid #333;
        }

        .btn-cancel,
        .btn-submit {
          padding: 1rem 2rem;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 1rem;
          min-width: 120px;
        }

        .btn-cancel {
          background: #444;
          color: #fff;
          border: 2px solid #555;
        }

        .btn-cancel:hover:not(:disabled) {
          background: #555;
          border-color: #666;
          transform: translateY(-2px);
        }

        .btn-submit {
          background: linear-gradient(135deg, #ffd700 0%, #ffa500 100%);
          color: #000;
          font-weight: 700;
          box-shadow: 0 4px 16px rgba(255, 215, 0, 0.3);
        }

        .btn-submit:hover:not(:disabled) {
          background: linear-gradient(135deg, #ffed4e 0%, #ffd700 100%);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(255, 215, 0, 0.4);
        }

        .btn-submit:disabled,
        .btn-cancel:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        /* Trailer Modal - Enhanced */
        .movie-detail .detail-trailer-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 2rem;
          backdrop-filter: blur(10px);
        }

        .movie-detail .detail-trailer-content {
          position: relative;
          width: 100%;
          max-width: 1200px;
          aspect-ratio: 16/9;
          background: #000;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        }

        .movie-detail .detail-trailer-content iframe {
          width: 100%;
          height: 100%;
          border: none;
        }

        .movie-detail .detail-close-trailer {
          position: absolute;
          top: -60px;
          right: 0;
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid rgba(255, 255, 255, 0.3);
          color: white;
          font-size: 2rem;
          cursor: pointer;
          padding: 0.75rem;
          z-index: 10000;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .movie-detail .detail-close-trailer:hover {
          color: #ffd700;
          background: rgba(255, 215, 0, 0.2);
          border-color: #ffd700;
          transform: rotate(90deg);
        }

        /* Responsive Design - Enhanced */
        @media (max-width: 768px) {
          .rating-overview {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          
          .reviewer-info {
            flex-direction: row;
            align-items: center;
            gap: 1rem;
          }
          
          .review-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }

          .rating-form-actions {
            flex-direction: column;
          }

          .btn-cancel,
          .btn-submit {
            width: 100%;
          }

          .rating-star {
            font-size: 2rem;
          }

          .overall-rating .rating-number {
            font-size: 3rem;
          }

          .movie-detail .detail-close-trailer {
            top: -50px;
            width: 45px;
            height: 45px;
            font-size: 1.5rem;
          }
        }

        @media (max-width: 480px) {
          .rating-form-header h3 {
            font-size: 1.1rem;
          }

          .rating-star {
            font-size: 1.8rem;
          }

          .comment-section textarea {
            min-height: 100px;
          }

          .overall-rating .rating-number {
            font-size: 2.5rem;
          }

          .reviews-summary,
          .rating-form-modal {
            margin: 1rem;
            padding: 1.5rem;
          }

          .movie-detail .detail-trailer-modal {
            padding: 1rem;
          }

          .movie-detail .detail-close-trailer {
            top: -40px;
            width: 40px;
            height: 40px;
            font-size: 1.2rem;
          }
        }
      `}</style>
    </div>
  );
};

export default MovieDetail;

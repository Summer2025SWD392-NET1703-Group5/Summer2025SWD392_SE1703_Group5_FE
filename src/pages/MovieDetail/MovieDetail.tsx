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
            "After the devastating events of Avengers: Infinity War, the universe is in ruins due to the efforts of the Mad Titan, Thanos. With the help of remaining allies, the Avengers must assemble once more in order to undo Thanos's actions and restore order to the universe once and for all.",
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
          genres: ["Action", "Adventure", "Drama", "Sci-Fi"],
          rating: 8.4,
          ageRating: "PG-13",
          language: "English",
          subtitles: ["English", "Vietnamese", "Chinese"],
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
          date: "2025-05-30",
          time: "10:00",
          cinema: "CGV Vincom Center",
          screen: "Screen 1",
          seatTypes: {
            standard: { available: 45, total: 60, price: 120000 },
            vip: { available: 12, total: 20, price: 180000 },
            couple: { available: 4, total: 6, price: 250000 },
          },
        },
        {
          id: "2",
          movieId,
          date: "2025-05-30",
          time: "14:30",
          cinema: "CGV Vincom Center",
          screen: "Screen 2",
          seatTypes: {
            standard: { available: 30, total: 60, price: 120000 },
            vip: { available: 8, total: 20, price: 180000 },
            couple: { available: 2, total: 6, price: 250000 },
          },
        },
        {
          id: "3",
          movieId,
          date: "2025-05-30",
          time: "19:15",
          cinema: "Lotte Cinema",
          screen: "Screen 3",
          seatTypes: {
            standard: { available: 25, total: 60, price: 120000 },
            vip: { available: 15, total: 20, price: 180000 },
            couple: { available: 6, total: 6, price: 250000 },
          },
        },
        {
          id: "4",
          movieId,
          date: "2025-05-30",
          time: "22:00",
          cinema: "Galaxy Cinema",
          screen: "Screen 1",
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
          date: "2025-05-31",
          time: "09:30",
          cinema: "CGV Vincom Center",
          screen: "Screen 1",
          seatTypes: {
            standard: { available: 55, total: 60, price: 120000 },
            vip: { available: 19, total: 20, price: 180000 },
            couple: { available: 6, total: 6, price: 250000 },
          },
        },
        {
          id: "6",
          movieId,
          date: "2025-05-31",
          time: "13:00",
          cinema: "Lotte Cinema",
          screen: "Screen 2",
          seatTypes: {
            standard: { available: 35, total: 60, price: 120000 },
            vip: { available: 10, total: 20, price: 180000 },
            couple: { available: 3, total: 6, price: 250000 },
          },
        },
        {
          id: "7",
          movieId,
          date: "2025-05-31",
          time: "16:45",
          cinema: "Galaxy Cinema",
          screen: "Screen 2",
          seatTypes: {
            standard: { available: 28, total: 60, price: 120000 },
            vip: { available: 14, total: 20, price: 180000 },
            couple: { available: 4, total: 6, price: 250000 },
          },
        },
        {
          id: "8",
          movieId,
          date: "2025-05-31",
          time: "20:30",
          cinema: "BHD Star",
          screen: "Screen 1",
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
          screen: "Screen 3",
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
          screen: "Screen 1",
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
          screen: "Screen 3",
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
          screen: "Screen 2",
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
          screen: "Screen 2",
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
          screen: "Screen 3",
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
          screen: "Screen 1",
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
          screen: "Screen 1",
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
          screen: "Screen 3",
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
          screen: "Screen 2",
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
          screen: "Screen 2",
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
          screen: "Screen 3",
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
          screen: "Screen 1",
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
          screen: "Screen 1",
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
          screen: "Screen 3",
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
    return `${hours}h ${mins}m`;
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

  const handleBooking = (showtimeId: string) => {
    navigate(`/booking/${showtimeId}`);
  };

  if (loading) {
    return (
      <div className="movie-detail-loading">
        <div className="spinner"></div>
        <p>Loading movie details...</p>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="movie-detail-error">
        <h2>Movie not found</h2>
        <p>The movie you're looking for doesn't exist or has been removed.</p>
        <button onClick={() => navigate("/movies")} className="btn-primary">
          Back to Movies
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
                ▶ Watch Trailer
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
                <span className={`status ${movie.status}`}>{movie.status.replace("-", " ").toUpperCase()}</span>
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
                  <strong>Director:</strong> {movie.director}
                </div>
                <div className="detail-item">
                  <strong>Release Date:</strong> {new Date(movie.releaseDate).toLocaleDateString()}
                </div>
                <div className="detail-item">
                  <strong>Language:</strong> {movie.language}
                </div>
                <div className="detail-item">
                  <strong>Subtitles:</strong> {movie.subtitles.join(", ")}
                </div>
              </div>

              {movie.status === "now-showing" && (
                <button className="btn-book-now" onClick={() => setActiveTab("showtimes")}>
                  Book Tickets Now
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
          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === "showtimes" ? "active" : ""}`}
          onClick={() => setActiveTab("showtimes")}
        >
          Showtimes
        </button>
      </div>

      {/* Tab Content */}
      <div className="movie-content">
        {activeTab === "overview" && (
          <div className="overview-tab">
            <div className="cast-section">
              <h3>Cast</h3>
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
              <h3>Ticket Prices</h3>
              <div className="price-list">
                <div className="price-item">
                  <span className="seat-type">Standard Seat</span>
                  <span className="price">{formatPrice(movie.price.standard)}</span>
                </div>
                <div className="price-item">
                  <span className="seat-type">VIP Seat</span>
                  <span className="price">{formatPrice(movie.price.vip)}</span>
                </div>
                <div className="price-item">
                  <span className="seat-type">Couple Seat</span>
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
                <label>Select Date:</label>
                <div className="date-buttons">
                  <button
                    className={`date-btn ${selectedDate === "" ? "active" : ""}`}
                    onClick={() => setSelectedDate("")}
                  >
                    All Dates
                  </button>
                  {getAvailableDates().map((date) => (
                    <button
                      key={date}
                      className={`date-btn ${selectedDate === date ? "active" : ""}`}
                      onClick={() => setSelectedDate(date)}
                    >
                      {new Date(date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <label>Select Cinema:</label>
                <select value={selectedCinema} onChange={(e) => setSelectedCinema(e.target.value)}>
                  <option value="all">All Cinemas</option>
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
                  <p>No showtimes available for the selected filters.</p>
                </div>
              ) : (
                Object.entries(getGroupedShowtimes()).map(([cinema, cinemaShowtimes]) => (
                  <div key={cinema} className="cinema-group">
                    <div className="cinema-header">
                      <h3 className="cinema-name">{cinema}</h3>
                      <p className="showtimes-count">
                        {cinemaShowtimes.length} showtime{cinemaShowtimes.length !== 1 ? "s" : ""}
                      </p>
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
            <iframe src={movie.trailer} title="Movie Trailer" frameBorder="0" allowFullScreen></iframe>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetail;

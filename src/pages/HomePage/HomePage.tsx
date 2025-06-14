import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getMoviesWithFilters } from "../../config/MovieApi";
import { EmptyState, formatDuration } from "../../components/utils/utils";
import { PlaySquareOutlined } from "@ant-design/icons";
import ticket from "../../assets/images/ticket-icon.png";
import loadingGif from "../../assets/images/loading.gif";

interface Movie {
  Movie_ID: number;
  Movie_Name: string;
  Release_Date: string;
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
}

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [nowShowingMovies, setNowShowingMovies] = useState<Movie[]>([]);
  const [comingSoonMovies, setComingSoonMovies] = useState<Movie[]>([]);
  const [featuredMovies, setFeaturedMovies] = useState<Movie[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  const nowShowingRef = useRef<HTMLDivElement>(null);
  const comingSoonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchHomePageData();
  }, []);

  useEffect(() => {
    if (featuredMovies.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % featuredMovies.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [featuredMovies.length]);

  const fetchHomePageData = async () => {
    try {
      setLoading(true);
      const [nowShowing, comingSoon] = await Promise.all([
        getMoviesWithFilters({ status: "Now Showing" }),
        getMoviesWithFilters({ status: "Coming Soon" }),
      ]);

      setNowShowingMovies(Array.isArray(nowShowing) ? nowShowing : []);
      setComingSoonMovies(Array.isArray(comingSoon) ? comingSoon : []);

      // Set featured movies as first 5 now showing movies
      if (nowShowing && nowShowing.length > 0) {
        setFeaturedMovies(nowShowing.slice(0, 5));
      }
    } catch (error) {
      console.error("Error fetching homepage data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMovieClick = (movieId: number) => {
    navigate(`/movie/${movieId}`);
  };

  const scrollMovieSection = (direction: "left" | "right", sectionRef: React.RefObject<HTMLDivElement | null>) => {
    if (sectionRef.current) {
      const scrollAmount = 320; // Card width + gap
      const currentScroll = sectionRef.current.scrollLeft;
      const newScroll = direction === "left" ? currentScroll - scrollAmount : currentScroll + scrollAmount;

      sectionRef.current.scrollTo({
        left: newScroll,
        behavior: "smooth",
      });
    }
  };
  const renderStars = (rating: number) => {
    const stars = [];
    // Convert 10-scale rating to 5-star scale
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    // Show stars on 5-scale
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

    return (
      <span className="stars-container">
        {stars}
        <span className="rating-number">{rating.toFixed(1)}/5</span>
      </span>
    );
  };

  if (loading) {
    return (
      <div className="loading-wrapper">
        <img src={loadingGif} alt="Loading..." className="loading-gif" />
      </div>
    );
  }

  return (
    <div className="homepage">
      {/* Hero Carousel Section */}
      {featuredMovies.length > 0 && (
        <section className="hero-carousel">
          <div className="carousel-container">
            {featuredMovies.map((movie, index) => (
              <div
                key={movie.Movie_ID}
                className={`carousel-slide ${index === currentSlide ? "active" : ""}`}
                style={{ backgroundImage: `url(${movie.Poster_URL})` }}
              >
                <div className="hero-overlay">
                  <div className="container">
                    <div className="hero-content">
                      <div className="hero-info">
                        <div className="movie-badge">PHIM ĐANG CHIẾU</div>
                        <h1 className="hero-title">{movie.Movie_Name}</h1>
                        <div className="hero-meta">
                          <span className="rating">{renderStars(movie.Average_Rating)}</span>
                          <span className="duration">{formatDuration(movie.Duration)}</span>
                          <span className="genre">{movie.Genre.split(",")[0]}</span>
                        </div>
                        <p className="hero-description">{movie.Synopsis}</p>
                        <div className="hero-actions">
                          <button className="btn-primary" onClick={() => handleMovieClick(movie.Movie_ID)}>
                            🎬 Đặt vé ngay
                          </button>
                          <button
                            className="btn-secondary"
                            onClick={() => {
                              if (movie.Trailer_Link) {
                                window.open(movie.Trailer_Link, "_blank");
                              }
                            }}
                          >
                            ▶️ Xem Trailer
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Carousel Navigation */}
          <div className="carousel-navigation">
            <div className="carousel-indicators">
              {featuredMovies.map((movie, index) => (
                <button
                  key={index}
                  className={`indicator ${index === currentSlide ? "active" : ""}`}
                  onClick={() => setCurrentSlide(index)}
                >
                  <img src={movie.Poster_URL} alt={movie.Movie_Name} className="indicator-poster" />
                  <div className="indicator-overlay"></div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Now Showing Movies */}
      <section className="movies-section">
        <div className="container">
          <div className="section-header">
            <h2>Phim Đang Chiếu</h2>
            <button className="view-all-btn" onClick={() => navigate("/movie?status=Now%20Showing")}>
              Xem tất cả →
            </button>
          </div>
          {nowShowingMovies.length === 0 ? (
            <EmptyState title="Không có phim đang chiếu" description="Vui lòng quay lại sau" />
          ) : (
            <div className="movies-carousel-container">
              <button className="carousel-side-btn left" onClick={() => scrollMovieSection("left", nowShowingRef)}>
                ❮
              </button>
              <div className="movies-grid carousel" ref={nowShowingRef}>
                {nowShowingMovies.map((movie) => (
                  <div key={movie.Movie_ID} className="movie-card" onClick={() => handleMovieClick(movie.Movie_ID)}>
                    <div className="movie-poster">
                      <img src={movie.Poster_URL} alt={movie.Movie_Name} />
                      <div className="movie-overlay">
                        <button
                          className="btn-buy-ticket"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMovieClick(movie.Movie_ID);
                          }}
                        >
                          <img src={ticket} alt="ticket icon" className="ticket-icon" /> Mua vé
                        </button>
                        <button
                          className="btn-trailer"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (movie.Trailer_Link) {
                              window.open(movie.Trailer_Link, "_blank");
                            }
                          }}
                        >
                          <PlaySquareOutlined style={{ fontSize: "24px", marginRight: "8px" }} />
                          Trailer
                        </button>
                      </div>
                      <div className="movie-rating">⭐ {(movie.Average_Rating / 2).toFixed(1)}/5</div>
                    </div>
                    <div className="movie-info">
                      <h3 className="movie-title">{movie.Movie_Name}</h3>
                      <p className="movie-genre">{movie.Genre}</p>
                      <p className="movie-duration">{formatDuration(movie.Duration)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="carousel-side-btn right" onClick={() => scrollMovieSection("right", nowShowingRef)}>
                ❯
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Coming Soon Movies */}
      <section className="movies-section coming-soon">
        <div className="container">
          <div className="section-header">
            <h2>Phim Sắp Chiếu</h2>
            <button className="view-all-btn" onClick={() => navigate("/movie?status=Coming%20Soon")}>
              Xem tất cả →
            </button>
          </div>
          {comingSoonMovies.length === 0 ? (
            <EmptyState title="Không có phim sắp chiếu" description="Vui lòng quay lại sau" />
          ) : (
            <div className="movies-carousel-container">
              <button className="carousel-side-btn left" onClick={() => scrollMovieSection("left", comingSoonRef)}>
                ❮
              </button>
              <div className="movies-grid carousel" ref={comingSoonRef}>
                {comingSoonMovies.map((movie) => (
                  <div key={movie.Movie_ID} className="movie-card" onClick={() => handleMovieClick(movie.Movie_ID)}>
                    <div className="movie-poster">
                      <img src={movie.Poster_URL} alt={movie.Movie_Name} />
                      <div className="movie-overlay">
                        <button
                          className="btn-info"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMovieClick(movie.Movie_ID);
                          }}
                        >
                          ℹ️ Thông tin
                        </button>
                        <button
                          className="btn-trailer"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (movie.Trailer_Link) {
                              window.open(movie.Trailer_Link, "_blank");
                            }
                          }}
                        >
                          <PlaySquareOutlined style={{ fontSize: "24px", marginRight: "8px" }} />
                          Trailer
                        </button>
                      </div>
                      <div className="coming-soon-badge">Sắp chiếu</div>
                    </div>
                    <div className="movie-info">
                      <h3 className="movie-title">{movie.Movie_Name}</h3>
                      <p className="movie-genre">{movie.Genre}</p>
                      <p className="release-date">
                        Khởi chiếu: {new Date(movie.Release_Date).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="carousel-side-btn right" onClick={() => scrollMovieSection("right", comingSoonRef)}>
                ❯
              </button>
            </div>
          )}
        </div>
      </section>

      <style>{`
        .homepage {
          min-height: 100vh;
          background: #000;
          color: #fff;
          font-family: "Arial", sans-serif;
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 20px;
        }

        /* Loading */
        .loading-wrapper {
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

        .loading-gif {
          width: 150px;
          height: 150px;
          background: none;
          mix-blend-mode: screen;
        }

        /* Hero Carousel Section */
        .hero-carousel {
          height: 100vh;
          position: relative;
          overflow: hidden;
        }

        .hero-carousel::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            to right,
            rgba(0, 0, 0, 0.4) 0%,
            transparent 10%,
            transparent 90%,
            rgba(0, 0, 0, 0.4) 100%
          ),
          linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0.3) 0%,
            transparent 15%,
            transparent 85%,
            rgba(0, 0, 0, 0.3) 100%
          );
          z-index: 1;
          pointer-events: none;
        }

        .carousel-container {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .carousel-slide {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          opacity: 0;
          transition: opacity 0.5s ease-in-out;
          display: flex;
          align-items: center;
          filter: blur(0px);
        }

        .carousel-slide.active {
          opacity: 1;
        }

        .hero-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.3));
          z-index: 1;
        }

        .hero-content {
          position: absolute;
          bottom: 60px;
          left: 120px;
          z-index: 2;
          max-width: 600px;
          padding: 2rem;
        }        .movie-badge {
          background: none;
          color: #ffd700;
          padding: 0.4rem 0.8rem;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: bold;
          display: inline-block;
          margin-bottom: 0.8rem;
          border: 1px solid #ffd700;
        }

        .hero-title {
          font-size: 2.5rem;
          font-weight: bold;
          margin: 0.5rem 0;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        }        .hero-meta {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          margin: 0.8rem 0;
          flex-wrap: wrap;
        }        
        .hero-meta span {
          background: none;
          padding: 0.3rem 0.8rem;
          border-radius: 15px;
          font-size: 0.85rem;
          border: 1px solid rgba(255, 255, 255, 0.4);
          color: #fff;
        }

        .hero-meta span.rating {
          border: none;
          padding: 0.3rem 0;
        }

        .hero-description {
          font-size: 1rem;
          line-height: 1.5;
          margin: 1rem 0;
          opacity: 0.9;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          word-wrap: break-word;
          white-space: normal;
          max-width: 100%;
        }

        .hero-actions {
          display: flex;
          gap: 0.8rem;
          margin-top: 1.5rem;
        }        .btn-primary {
          background: none;
          color: #ffd700;
          border: 2px solid #ffd700;
          padding: 0.7rem 1.2rem;
          border-radius: 20px;
          font-weight: bold;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-primary:hover {
          background: #ffd700;
          color: #000;
          transform: translateY(-2px);
        }        .btn-secondary {
          background: none;
          color: #fff;
          border: 2px solid rgba(255, 255, 255, 0.5);
          padding: 0.7rem 1.2rem;
          border-radius: 20px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s;
          font-size: 0.9rem;
        }

        .btn-secondary:hover {
          background: none;
          border-color: #ffd700;
          color: #ffd700;
        }

        /* Carousel Navigation */
        .carousel-navigation {
          position: absolute;
          bottom: 90px;
          right: 90px;
          z-index: 10;
        }

        .carousel-indicators {
          display: flex;
          gap: 12px;
        }

        .indicator {
          width: 60px;
          height: 90px;
          border-radius: 8px;
          border: 2px solid rgba(255, 255, 255, 0.6);
          background: transparent;
          cursor: pointer;
          transition: all 0.3s;
          overflow: hidden;
          position: relative;
          padding: 0;
        }

        .indicator-poster {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: all 0.3s;
        }        .indicator-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: none;
          transition: all 0.3s;
        }

        .indicator.active {
          border-color: #ffd700;
          transform: scale(1.1);
          box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);
        }

        .indicator.active .indicator-overlay {
          background: none;
        }

        .indicator:hover {
          transform: scale(1.05);
          border-color: #ffd700;
        }

        .indicator:hover .indicator-overlay {
          background: none;
        }

        /* Movies Section */
        .movies-section {
          padding: 4rem 0;
          background: #111;
        }

        .movies-section.coming-soon {
          background: #000;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 3rem;
        }

        .section-header h2 {
          font-size: 2.5rem;
          font-weight: bold;
          color: #ffd700;
        }        .view-all-btn {
          background: none;
          color: #ffd700;
          border: 1px solid #ffd700;
          padding: 0.75rem 1.5rem;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.3s;
          font-weight: 500;
        }

        .view-all-btn:hover {
          background: #ffd700;
          color: #000;
        }

        .movies-carousel-container {
          position: relative;
          overflow: visible;
          display: flex;
          align-items: center;
          gap: 1rem;
          margin: 0 60px;
        }        .carousel-side-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 50px;
          height: 50px;
          border-radius: 50%;
          border: 2px solid #ffd700;
          background: none;
          color: #ffd700;
          font-size: 1.5rem;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
        }

        .carousel-side-btn.left {
          left: -60px;
        }

        .carousel-side-btn.right {
          right: -60px;
        }

        .carousel-side-btn:hover {
          background: #ffd700;
          color: #000;
          transform: translateY(-50%) scale(1.1);
        }

        .movies-grid.carousel {
          display: flex;
          overflow-x: auto;
          scroll-behavior: smooth;
          gap: 2rem;
          padding: 20px 1rem 1rem 1rem;
          scrollbar-width: none;
          -ms-overflow-style: none;
          width: 100%;
        }

        .movies-grid.carousel::-webkit-scrollbar {
          display: none;
        }

        .movies-grid.carousel .movie-card {
          flex: 0 0 280px;
        }

        .movie-card {
          background: #222;
          border-radius: 15px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s;
          border: 2px solid transparent;
          transform-origin: center bottom;
          margin-top: 20px;
        }

        .movie-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 15px 40px rgba(255, 215, 0, 0.3);
          border-color: #ffd700;
          z-index: 10;
          position: relative;
        }

        .movie-poster {
          position: relative;
          aspect-ratio: 2/3;
          overflow: hidden;
        }

        .movie-poster img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s;
        }

        .movie-card:hover .movie-poster img {
          transform: scale(1.05);
        }

        .movie-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s;
          z-index: 2;
        }

        .movie-card:hover .movie-overlay {
          opacity: 1;
          pointer-events: auto;
        }        .btn-buy-ticket,
        .btn-info,
        .btn-trailer {
          background: none;
          color: white;
          padding: 10px 15px;
          border: 1px solid rgba(255, 255, 255, 0.6);
          border-radius: 5px;
          cursor: pointer;
          font-size: 1em;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
          min-width: 120px;
        }

        .btn-buy-ticket:hover,
        .btn-info:hover,
        .btn-trailer:hover {
          background: none;
          border-color: #ffd700;
          color: #ffd700;
        }

        .ticket-icon {
          width: 16px !important;
          height: 16px !important;
          vertical-align: middle;
          margin-right: 6px;
          filter: brightness(1.2);
          object-fit: contain;
        }

        .btn-buy-ticket .ticket-icon {
          width: 30px !important;
          height: 30px !important;
        }

        .play-btn {
          background: #ffd700;
          color: #000;
          border: none;
          width: 70px;
          height: 70px;
          border-radius: 50%;
          font-size: 2rem;
          cursor: pointer;
          transition: all 0.3s;
          margin-bottom: 0.5rem;
        }

        .overlay-text {
          color: #fff;
          font-weight: bold;
          font-size: 1rem;
        }        
        .movie-rating {
          position: absolute;
          top: 15px;
          right: 15px;
          background: none;
          color: #ffd700;
          padding: 0.3rem 0.6rem;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 600;
          border: 1px solid rgba(255, 215, 0, 0.5);
        }        .coming-soon-badge {
          position: absolute;
          top: 15px;
          left: 15px;
          background: none;
          color: #ffd700;
          padding: 0.3rem 0.6rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          border: 1px solid #ffd700;
        }

        .movie-info {
          padding: 1.5rem;
        }

        .movie-title {
          font-size: 1.2rem;
          font-weight: bold;
          margin: 0 0 0.5rem 0;
          color: #fff;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .movie-genre,
        .movie-duration,
        .release-date {
          color: #ccc;
          font-size: 0.9rem;
          margin: 0.3rem 0;
        }        /* Stars */
        .star {
          color: #ffd700;
          font-size: 1rem;
          text-shadow: none;
          background: none;
          border: none;
          padding: 0;
          margin: 0;
        }

        .star.filled {
          border: none;
          color: #ffd700;
        }

        .star.half {
          border: none;
          color: #ffd700;
          opacity: 0.6;
        }

        .star.empty {
          border: none;
          color: #555;
        }

        span.stars-container {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0;
        }

        span.rating-number {
          border: none; 
          color: #ffd700;
          font-weight: 600;
          font-size: 0.9rem;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .movies-grid.carousel .movie-card {
            flex: 0 0 250px;
          }
          
          .hero-carousel {
            height: 100vh;
          }
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 2rem;
          }

          .hero-actions {
            flex-direction: column;
            gap: 0.5rem;
          }

          .hero-content {
            bottom: 40px;
            left: 60px;
            padding: 1.5rem;
            max-width: calc(100% - 9rem);
          }

          .section-header {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .movies-carousel-container {
            margin: 0 50px;
          }

          .carousel-side-btn {
            width: 40px;
            height: 40px;
            font-size: 1.2rem;
          }

          .carousel-side-btn.left {
            left: -50px;
          }

          .carousel-side-btn.right {
            right: -50px;
          }

          .movies-grid.carousel .movie-card {
            flex: 0 0 200px;
          }

          .carousel-control-btn {
            width: 35px;
            height: 35px;
            font-size: 1rem;
          }

          .movies-grid {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 1rem;
          }

          .carousel-navigation {
            bottom: 120px;
            right: 20px;
          }

          .indicator {
            width: 45px;
            height: 68px;
          }

          .hero-carousel {
            height: 100vh;
          }
        }

        @media (max-width: 480px) {
          .movies-grid.carousel .movie-card {
            flex: 0 0 150px;
          }

          .section-controls {
            flex-direction: column;
            gap: 0.5rem;
          }

          .hero-title {
            font-size: 1.6rem;
          }

          .hero-description {
            -webkit-line-clamp: 1;
            font-size: 0.9rem;
          }

          .hero-content {
            bottom: 30px;
            left: 30px;
            padding: 1rem;
            max-width: calc(100% - 6rem);
          }

          .carousel-navigation {
            bottom: 100px;
            right: 15px;
          }

          .indicator {
            width: 35px;
            height: 53px;
          }

          .btn-primary, .btn-secondary {
            padding: 0.6rem 1rem;
            font-size: 0.8rem;
          }

          .carousel-side-btn {
            width: 35px;
            height: 35px;
            font-size: 1rem;
          }

          .carousel-side-btn.left {
            left: -40px;
          }

          .carousel-side-btn.right {
            right: -40px;
          }
        }

        .hero-ticket-icon {
          width: 28px;
          height: 28px;
          vertical-align: middle;
          margin-right: 10px;
          filter: brightness(0.8);
        }
      `}</style>
    </div>
  );
};

export default HomePage;

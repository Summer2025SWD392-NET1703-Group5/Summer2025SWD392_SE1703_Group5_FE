import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "./ViewMoviePage.css";
import ticket from "../../assets/images/ticket-icon.png";
import Header from "../../components/Header/Header";
import { PlaySquareOutlined } from "@ant-design/icons";
import api from "../../config/axios";
import loading from "../../assets/images/loading.gif";
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

const filters = [
  { label: "Đang chiếu", value: "Now Showing" },
  { label: "Sắp chiếu", value: "Coming Soon" },
];

const ViewMoviePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const statusFromUrl = decodeURIComponent(searchParams.get("status") || "Coming Soon");
  const [activeFilter, setActiveFilter] = useState(statusFromUrl);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovies = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const encodedFilter = encodeURIComponent(activeFilter);
        const response = await api.get(`/movies?status=${encodedFilter}&page=1&limit=10`);
        console.log("API Response:", response.data);
        const movieData = Array.isArray(response.data) ? response.data : [];
        setMovies(movieData);
      } catch (err: any) {
        console.error("Error fetching movies:", err);
        setError(err.response?.data?.message || "Không thể tải danh sách phim.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, [activeFilter]);

  useEffect(() => {
    const statusParam = searchParams.get("status");
    if (statusParam) {
      setActiveFilter(decodeURIComponent(statusParam));
    }
  }, [searchParams]);

  const handleBuyTicket = (movieId: number) => {
    navigate(`/showtimes?movieId=${movieId}`);
  };

  if (isLoading) {
    return (
      <div className="loading-wrapper">
        <img src={loading} alt="Loading..." className="loading-gif" />
      </div>
    );
  }

  if (error) {
    return <div>Lỗi: {error}</div>;
  }

  return (
    <>
      <Header />
      <div className="movie-filter-bar">
        <span className="movie-filter-title">
          <span className="blue-bar" /> PHIM
        </span>
        {filters.map((filter) => (
          <span
            key={filter.value}
            className={`movie-filter-item${activeFilter === filter.value ? " active" : ""}`}
            onClick={() => setActiveFilter(filter.value)}
          >
            {filter.label}
          </span>
        ))}
      </div>

      <div className="movie-list">
        {movies.map((movie) => (
          <div className="movie-card" key={movie.Movie_ID}>
            <div className="movie-poster-wrapper">
              <img
                src={movie.Poster_URL || "https://via.placeholder.com/300x450"}
                alt={movie.Movie_Name}
                className="movie-poster"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://via.placeholder.com/300x450";
                }}
              />
              <div className="movie-overlay">
                <button className="btn-buy-ticket" onClick={() => handleBuyTicket(movie.Movie_ID)}>
                  <img src={ticket} alt="ticket icon" className="ticket-icon" /> Mua vé
                </button>
                <button className="btn-trailer" onClick={() => window.open(movie.Trailer_Link, "_blank")}>
                  <span role="img" aria-label="play">
                    <PlaySquareOutlined style={{ fontSize: "24px", marginRight: "17px" }} />
                  </span>
                  Trailer
                </button>
              </div>
              <div className="movie-meta">
                <span className="movie-rating">⭐ {movie.Average_Rating || 0}</span>
                {movie.Rating && <span className="movie-age">{movie.Rating}</span>}
              </div>
            </div>
            <div className="movie-info">
              <div className="movie-title">{movie.Movie_Name}</div>
              {movie.Release_Date && (
                <div className="movie-release">
                  Khởi chiếu: {new Date(movie.Release_Date).toLocaleDateString("vi-VN")}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default ViewMoviePage;

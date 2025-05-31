import React, { useState } from "react";
import "./ViewMoviePage.css";
import ticket from "../../assets/images/ticket-icon.png";
import Header from "../../components/Header/Header";
import poster1 from "../../assets/images/movieTest1.jpg";
import poster2 from "../../assets/images/movieTest2.jpg";
import poster3 from "../../assets/images/movieTest3.jpg";
import poster4 from "../../assets/images/movieTest4.jpg";
import { PlaySquareOutlined } from "@ant-design/icons";
const filters = [
  { label: "Đang chiếu", value: "now_showing" },
  { label: "Sắp chiếu", value: "coming_soon" },
  { label: "Phim IMAX", value: "imax" },
];
const movies = [
  {
    id: 1,
    title: "The Stone: Buồn Thần Bán Thánh",
    poster: poster1,
    rating: 7,
    age: "T16",
    releaseDate: "23.05.2025",
  },
  {
    id: 2,
    title: "Onoda - 10.000 Đêm Trong Rừng",
    poster: poster2,
    rating: 7,
    age: "T16",
    releaseDate: "",
  },
  {
    id: 3,
    title: "Dính 'Thính' Là Yêu",
    poster: poster3,
    rating: 7,
    age: "",
    releaseDate: "06.06.2025",
  },
  {
    id: 4,
    title: "Tổ Đội Gấu Nhí: Du Hí 4 Phương",
    poster: poster4,
    rating: 9.5,
    age: "",
    releaseDate: "06.06.2025",
  },
];

const ViewMoviePage = () => {
  const [activeFilter, setActiveFilter] = useState("now_showing");

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
        <span className="movie-filter-location">
          <span className="location-icon">📍</span>
          <span className="location-text">Toàn quốc</span>
        </span>
      </div>

      <div className="movie-list">
        {movies.map((movie) => (
          <div className="movie-card" key={movie.id}>
            <div className="movie-poster-wrapper">
              <img src={movie.poster} alt={movie.title} className="movie-poster" />
              <div className="movie-overlay">
                <button className="btn-buy-ticket" onClick={() => window.location.href = `/movieDetail/${movie.id}`}>
                  <img src={ticket} alt="ticket icon" className="ticket-icon" /> Mua vé
                </button>
                <button className="btn-trailer">
                  <span role="img" aria-label="play">
                    <PlaySquareOutlined style={{ fontSize: "24px", marginRight: "17px" }} />
                  </span>{" "}
                  Trailer
                </button>
              </div>
              <div className="movie-meta">
                <span className="movie-rating">⭐ {movie.rating}</span>
                {movie.age && <span className="movie-age">{movie.age}</span>}
              </div>
            </div>

            <div className="movie-info">
              <div className="movie-title">{movie.title}</div>
              {movie.releaseDate && <div className="movie-release">Khởi chiếu: {movie.releaseDate}</div>}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default ViewMoviePage;

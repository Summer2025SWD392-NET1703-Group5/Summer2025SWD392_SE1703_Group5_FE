import React, { useState, useEffect } from 'react';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import BannerSlider from '../../components/PosterSlider/BannerSlider';
import './HomePage.css';
import api from "../../config/axios";
import { PlaySquareOutlined } from '@ant-design/icons';
import loading from "../../assets/images/loading.gif";
import ticket from "../../assets/images/ticket-icon.png";

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

const GENRES = [
  'Hành động',
  'Phiêu lưu',
  'Hoạt hình',
  'Hài hước',
  'Tội phạm',
  'Tài liệu',
  'Chính kịch',
  'Gia đình',
  'Giả tưởng',
  'Lịch sử',
  'Kinh dị',
  'Nhạc',
  'Bí ẩn',
  'Lãng mạn',
  'Khoa học viễn tưởng',
  'Thriller',
  'Chiến tranh',
  'Cao bồi'
];

const HomePage = () => {
  const [moviesByGenre, setMoviesByGenre] = useState<{ [key: string]: Movie[] }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovies = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get('/movies');
        const allMovies = Array.isArray(response.data) ? response.data : [];
        
        // Group movies by genre
        const groupedMovies: { [key: string]: Movie[] } = {};
        GENRES.forEach(genre => {
          const moviesInGenre = allMovies.filter(movie => 
            movie.Genre.toLowerCase().includes(genre.toLowerCase())
          );
          if (moviesInGenre.length > 0) {
            groupedMovies[genre] = moviesInGenre;
          }
        });
        
        setMoviesByGenre(groupedMovies);
      } catch (err: any) {
        console.error('Error fetching movies:', err);
        setError(err.response?.data?.message || "Không thể tải danh sách phim.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, []);

  if (isLoading) {
    return <div className="loading-wrapper">
      <img src={loading} alt="Loading..." className="loading-gif" />
    </div>
  }

  if (error) {
    return <div>Lỗi: {error}</div>
  }

  return (
    <div className="homepage-root">
      <div className="homepage-content">
        <BannerSlider />
        
        {Object.entries(moviesByGenre).map(([genre, movies]) => (
          <div key={genre} className="movie-category">
            <h2 className="category-title">{genre}</h2>
            <div className="movie-row">
              {movies.map((movie) => (
                <div className="movie-card" key={movie.Movie_ID}>
                  <div className="movie-poster-wrapper">
                    <img 
                      src={movie.Poster_URL || 'https://via.placeholder.com/300x450'} 
                      alt={movie.Movie_Name} 
                      className="movie-poster"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/300x450';
                      }}
                    />
                    <div className="movie-overlay">
                      <button className="btn-buy-ticket">
                        <img src={ticket} alt="ticket icon" className="ticket-icon" /> Mua vé
                      </button>
                      <button className="btn-trailer" onClick={() => window.open(movie.Trailer_Link, '_blank')}>
                        <span role="img" aria-label="play">
                          <PlaySquareOutlined style={{ fontSize: '24px', marginRight: '17px'}} />
                        </span> 
                        Trailer
                      </button>
                    </div>
                    <div className="movie-meta">
                      <span className="movie-rating">⭐ {movie.Average_Rating || 0}</span>
                      {movie.Rating && (
                        <span className="movie-age">{movie.Rating}</span>
                      )}
                    </div>
                  </div>
                  <div className="movie-info">
                    <div className="movie-title">{movie.Movie_Name}</div>
                    {movie.Release_Date && (
                      <div className="movie-release">
                        Khởi chiếu: {new Date(movie.Release_Date).toLocaleDateString('vi-VN')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
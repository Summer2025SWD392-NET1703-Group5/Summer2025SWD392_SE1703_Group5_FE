import React from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSkeleton from './LoadingSkeleton';

interface Movie {
  id: string;
  title: string;
  originalTitle?: string;
  posterUrl: string;
  ageRating?: string; // P, P13, T16, T18, etc.
}

interface MovieGridProps {
  movies: Movie[];
  loading?: boolean;
  title?: string;
}

const MovieGrid: React.FC<MovieGridProps> = ({
  movies,
  loading = false,
  title
}) => {
  const navigate = useNavigate();
  const [imageErrors, setImageErrors] = React.useState<Record<string, boolean>>({});

  const handleMovieClick = (movie: Movie) => {
    console.log('Navigating to movie detail:', movie);
    navigate(`/movies/${movie.id}`);
  };

  const handleImageError = (movieId: string) => {
    console.log('Image error for movie:', movieId);
    setImageErrors(prev => ({
      ...prev,
      [movieId]: true
    }));
  };

  const getPosterUrl = (movie: Movie) => {
    if (!movie.poster && !movie.posterUrl) {
      return 'https://via.placeholder.com/300x450?text=No+Image';
    }

    // Ưu tiên sử dụng poster đã được chuyển đổi từ keysToCamel
    const posterPath = movie.poster || movie.posterUrl;

    // Kiểm tra nếu poster là URL đầy đủ
    if (posterPath.startsWith('http://') || posterPath.startsWith('https://')) {
      return posterPath;
    }

    // Nếu là đường dẫn tương đối, thêm URL cơ sở
    return `${import.meta.env.VITE_API_URL || ''}${posterPath}`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {title && <div className="h-8 bg-slate-800 rounded w-64 animate-pulse" />}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
          {Array.from({ length: 16 }).map((_, index) => (
            <div key={index} className="aspect-[2/3] bg-slate-800 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      {title && (
        <h2 className="text-2xl font-bold text-white">{title}</h2>
      )}

      {/* Movie Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
        {movies.map((movie) => (
          <div
            key={movie.id || Math.random().toString()}
            className="relative transition-all duration-200 ease-in-out rounded-md overflow-hidden cursor-pointer hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/20"
            onClick={() => handleMovieClick(movie)}
          >
            {/* Movie Poster */}
            <div className="relative aspect-[2/3] bg-gray-800 rounded-md overflow-hidden">
              {!imageErrors[movie.id] ? (
                <img
                  src={getPosterUrl(movie)}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                  onError={() => handleImageError(movie.id)}
                />
              ) : (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                  <div className="text-center p-4">
                    <div className="text-yellow-500 text-3xl mb-2">🎬</div>
                    <p className="text-gray-400 text-xs">{movie.title}</p>
                  </div>
                </div>
              )}

              {/* Age Rating Badge */}
              {movie.ageRating && (
                <div className={`
                  absolute top-1 right-1 text-xs font-bold px-1.5 py-0.5 rounded 
                  ${movie.ageRating === 'P' ? 'bg-green-600' :
                    movie.ageRating === 'P13' ? 'bg-blue-600' :
                      movie.ageRating === 'T16' ? 'bg-yellow-600' :
                        movie.ageRating === 'T18' ? 'bg-red-600' : 'bg-gray-600'} 
                  text-white
                `}>
                  {movie.ageRating}
                </div>
              )}
            </div>

            {/* Movie Title */}
            <div className="pt-2 pb-1 px-1">
              <h3 className="text-white text-xs font-medium line-clamp-1">{movie.title}</h3>
              {movie.originalTitle && movie.originalTitle !== movie.title && (
                <p className="text-gray-400 text-[10px] line-clamp-1">{movie.originalTitle}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {movies.length === 0 && (
        <div className="text-center py-12 bg-slate-800/50 rounded-lg">
          <div className="text-yellow-500 text-5xl mb-4">🎬</div>
          <div className="text-gray-300 text-lg mb-2">Không tìm thấy phim nào</div>
          <div className="text-gray-400 text-sm">Vui lòng thử lại sau</div>
        </div>
      )}
    </div>
  );
};

export default MovieGrid;

// Sample usage:
export const MovieGridExample: React.FC = () => {
  const sampleMovies: Movie[] = [
    {
      id: '1',
      title: 'Trứng Thiên Thần',
      originalTitle: 'Angel\'s Egg',
      posterUrl: 'https://m.media-amazon.com/images/M/MV5BNWYzODM0NmQtMTZiOS00MzJlLWI2YzUtNTRhNGE3YmYwNjFiXkEyXkFqcGdeQXVyNjUxMDQ0MTg@._V1_.jpg',
      ageRating: 'P13'
    },
    {
      id: '2',
      title: 'Giọt Nước Trần Ly',
      originalTitle: 'STRAW',
      posterUrl: 'https://m.media-amazon.com/images/M/MV5BMWRkMDE5MjUtN2MyYi00MjQ1LTkxMTYtM2ZlZjdkNTAwMWNiXkEyXkFqcGdeQXVyOTgxNDIzMTU@._V1_.jpg',
      ageRating: 'T16'
    },
    {
      id: '3',
      title: 'Quái Thú Vô Hình: Kẻ Săn Mồi',
      originalTitle: 'Predator: Killer of Killers',
      posterUrl: 'https://m.media-amazon.com/images/M/MV5BYmVlNWJkZWYtYmJkMy00MmY2LTg2ZmYtYTM3NWYxNTZiNGVlXkEyXkFqcGdeQXVyMTUzMTg2ODkz._V1_.jpg',
      ageRating: 'T18'
    },
    {
      id: '4',
      title: 'K.O.',
      originalTitle: 'K.O.',
      posterUrl: 'https://m.media-amazon.com/images/M/MV5BYjBkOTZlNmYtN2NjOS00YWM2LTk0MzMtOTEwMmIyNWIwMDA5XkEyXkFqcGdeQXVyMTUzMTg2ODkz._V1_.jpg',
      ageRating: 'T16'
    },
    {
      id: '5',
      title: 'Lạc Trong Ánh Sao',
      originalTitle: 'Lost in Starlight',
      posterUrl: 'https://m.media-amazon.com/images/M/MV5BYmQxNDliY2EtYTQzYy00OTQ0LWIzMjEtN2U4MzE0YmRkOGIxXkEyXkFqcGdeQXVyMzgxODM4NjM@._V1_.jpg',
      ageRating: 'P'
    },
    {
      id: '6',
      title: 'Con Tim Dẫn Lối',
      originalTitle: 'The Heart Knows',
      posterUrl: 'https://m.media-amazon.com/images/M/MV5BNGJmMWUwNTgtYmYzNS00YmI1LTgxMjItZTBlMmQzYmQ5MWI1XkEyXkFqcGdeQXVyMzQ0NTk5NzU@._V1_.jpg',
      ageRating: 'P'
    },
    {
      id: '7',
      title: 'Trò Chơi Của Một Góa Phụ',
      originalTitle: 'A Widow\'s Game',
      posterUrl: 'https://m.media-amazon.com/images/M/MV5BNzU3YTY1ZDctZTQ5MS00ZmI1LTkyYzUtNDIzNDEyYTRhZmZiXkEyXkFqcGdeQXVyMTI5ODk3NDU0._V1_.jpg',
      ageRating: 'T16'
    },
    {
      id: '8',
      title: 'Chếch Hướng 2',
      originalTitle: 'Off Track 2',
      posterUrl: 'https://m.media-amazon.com/images/M/MV5BYTc4MTdlOWYtNzU0OS00YTAxLWIwZDEtMjI1MTQ1ZDkwYTRiXkEyXkFqcGdeQXVyMTMzNzIyNDc1._V1_.jpg',
      ageRating: 'P13'
    },
    {
      id: '9',
      title: 'Bí Mật Kinh Hoàng',
      originalTitle: 'The Terrifying Secret',
      posterUrl: 'https://m.media-amazon.com/images/M/MV5BMTJiMmE5YTctZGY2ZS00NmY3LWE3NDgtODgxOGJjY2U3ZmVkXkEyXkFqcGdeQXVyMTQyMTMwOTk0._V1_.jpg',
      ageRating: 'T16'
    },
    {
      id: '10',
      title: 'Lilo & Stitch',
      originalTitle: 'Lilo & Stitch',
      posterUrl: 'https://m.media-amazon.com/images/M/MV5BMTkwOTU5MTA2M15BMl5BanBnXkFtZTYwMjYyNTc3._V1_.jpg',
      ageRating: 'P'
    },
    {
      id: '11',
      title: 'Người Nhện: Du Hành Vũ Trụ Nhện',
      originalTitle: 'Spider-Man: Across the Spider-Verse',
      posterUrl: 'https://m.media-amazon.com/images/M/MV5BMzI0NmVkMjEtYmY4MS00ZDMxLTlkZmEtMzU4MDQxYTMzMjU2XkEyXkFqcGdeQXVyMzQ0MzA0NTM@._V1_.jpg',
      ageRating: 'P13'
    },
    {
      id: '12',
      title: 'Vùng Đất Linh Hồn',
      originalTitle: 'Spirited Away',
      posterUrl: 'https://m.media-amazon.com/images/M/MV5BMjlmZmI5MDctNDE2YS00YWE0LWE5ZWItZDBhYWQ0NTcxNWRhXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg',
      ageRating: 'P'
    },
    {
      id: '13',
      title: 'Thợ Săn Quái Vật',
      originalTitle: 'The Witcher',
      posterUrl: 'https://m.media-amazon.com/images/M/MV5BN2FiOWU4YzYtMzZiOS00MzcyLTlkOGEtOTgwZmEwMzAxMzA3XkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_.jpg',
      ageRating: 'T18'
    },
    {
      id: '14',
      title: 'Bỗng Dưng Trúng Số',
      originalTitle: 'Lotto',
      posterUrl: 'https://m.media-amazon.com/images/M/MV5BNGJmMWEzOGQtYzgwMS00ZTQ2LWI2NGEtNjJlMDlkMzgxZDQ1XkEyXkFqcGdeQXVyMTUzMDA3Mjc2._V1_.jpg',
      ageRating: 'P13'
    },
    {
      id: '15',
      title: 'Vũ Điệu Tình Yêu',
      originalTitle: 'Dance of Love',
      posterUrl: 'https://m.media-amazon.com/images/M/MV5BNDJhNWM4N2ItNjJiYy00NTc2LTg5ZmMtYjI2ZmMwMzE0YjRhXkEyXkFqcGdeQXVyMTI1NDEyNTM5._V1_.jpg',
      ageRating: 'P'
    },
    {
      id: '16',
      title: 'Thám Tử Lừng Danh Conan',
      originalTitle: 'Detective Conan: The Movie',
      posterUrl: 'https://m.media-amazon.com/images/M/MV5BOGRlNTllMmYtNTcyYy00MGJjLWFiY2UtMDE2NWY3ZmRkNjhmXkEyXkFqcGdeQXVyMTA0MTM5NjI2._V1_.jpg',
      ageRating: 'P13'
    }
  ];

  return <MovieGrid movies={sampleMovies} title="Phim Đang Chiếu" />;
};

import React from 'react';
import { HeartIcon, StarIcon, ClockIcon, TrashIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

interface MovieItem {
  id: string;
  title: string;
  poster: string;
  rating: number;
  year: number;
  genres: string[];
  runtime: number;
  addedDate: string;
}

const Favorites: React.FC = () => {
  // Mock favorite movies
  const favoriteMovies: MovieItem[] = [
    {
      id: 'movie1',
      title: 'Dune: Part Two',
      poster: 'https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg',
      rating: 4.7,
      year: 2024,
      genres: ['Sci-Fi', 'Adventure', 'Drama'],
      runtime: 166,
      addedDate: '2024-03-15'
    },
    {
      id: 'movie2',
      title: 'Oppenheimer',
      poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
      rating: 4.5,
      year: 2023,
      genres: ['Biography', 'Drama', 'History'],
      runtime: 180,
      addedDate: '2024-02-20'
    },
    {
      id: 'movie3',
      title: 'Poor Things',
      poster: 'https://image.tmdb.org/t/p/w500/kCGlIMHnOm8JPXq3rXM6c5wMxcT.jpg',
      rating: 4.3,
      year: 2023,
      genres: ['Comedy', 'Drama', 'Sci-Fi'],
      runtime: 141,
      addedDate: '2024-01-10'
    }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const handleRemoveFavorite = (id: string) => {
    // Handle removing movie from favorites
    console.log(`Removing movie ${id} from favorites`);
  };

  return (
    <div className="animate-fadeInUp">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-normal text-white flex items-center">
          <HeartSolidIcon className="w-6 h-6 text-red-500 mr-2" />
          Phim yêu thích
        </h2>
        <div className="text-sm text-gray-400">
          Tổng cộng: <span className="text-[#ffd875] font-light">{favoriteMovies.length}</span> phim
        </div>
      </div>

      {favoriteMovies.length > 0 ? (
        <div className="space-y-4">
          {favoriteMovies.map((movie) => (
            <div 
              key={movie.id}
              className="glass-dark rounded-xl p-4 border border-gray-700/50 hover:border-[#ffd875]/30 transition-all duration-300 group"
            >
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Movie Poster */}
                <div className="flex-shrink-0 relative">
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="w-full sm:w-32 h-48 sm:h-48 object-cover rounded-lg group-hover:scale-[1.02] transition-transform duration-300"
                  />
                  <button className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full hover:bg-red-500/80 transition-colors">
                    <HeartSolidIcon className="w-5 h-5 text-red-500" />
                  </button>
                </div>

                {/* Movie Details */}
                <div className="flex-1 flex flex-col">
                  <div className="mb-2">
                    <h3 className="text-xl font-normal text-white group-hover:text-[#ffd875] transition-colors">
                      {movie.title}
                    </h3>
                    <div className="flex items-center text-sm text-gray-400 mt-1">
                      <span className="mr-3">{movie.year}</span>
                      <span className="flex items-center mr-3">
                        <StarIcon className="w-4 h-4 text-[#ffd875] mr-1" />
                        {movie.rating}
                      </span>
                      <span className="flex items-center">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        {formatRuntime(movie.runtime)}
                      </span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex flex-wrap gap-2 mt-2">
                      {movie.genres.map((genre) => (
                        <span
                          key={genre}
                          className="text-xs px-2 py-1 rounded-full bg-gray-700/50 text-gray-300"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-auto flex items-center justify-between text-sm text-gray-400">
                    <span>Đã thêm: {formatDate(movie.addedDate)}</span>
                    <button
                      onClick={() => handleRemoveFavorite(movie.id)}
                      className="flex items-center text-red-400 hover:text-red-300 transition-colors"
                    >
                      <TrashIcon className="w-4 h-4 mr-1" />
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <HeartIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-normal text-gray-400 mb-2">Chưa có phim yêu thích</h3>
          <p className="text-gray-500 mb-6">Bạn chưa thêm phim nào vào danh sách yêu thích.</p>
          <button className="btn-primary">
            Khám phá phim
          </button>
        </div>
      )}
    </div>
  );
};

export default Favorites; 
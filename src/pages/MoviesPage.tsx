import React, { useState, useEffect } from 'react';
import MovieGrid from '../components/MovieGrid';
import PageTransition from '../components/PageTransition';
import { movieService } from '../services/movieService';
import type { Movie } from '../types/movie';
import FullScreenLoader from '../components/FullScreenLoader';

const MoviesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'now-playing' | 'coming-soon'>('now-playing');
  const [loading, setLoading] = useState(true);
  const [nowPlayingMovies, setNowPlayingMovies] = useState<Movie[]>([]);
  const [comingSoonMovies, setComingSoonMovies] = useState<Movie[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch movies based on active tab
  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      setError(null);

      console.log(`=== MoviesPage: Fetching ${activeTab} movies ===`);

      try {
        if (activeTab === 'now-playing') {
          console.log('MoviesPage: Calling movieService.getNowShowingMovies()');
          const movies = await movieService.getNowShowingMovies();
          console.log('MoviesPage: Received now showing movies:', movies);
          console.log('MoviesPage: Now showing movies count:', movies.length);
          setNowPlayingMovies(movies);
        } else {
          console.log('MoviesPage: Calling movieService.getComingSoonMovies()');
          const movies = await movieService.getComingSoonMovies();
          console.log('MoviesPage: Received coming soon movies:', movies);
          console.log('MoviesPage: Coming soon movies count:', movies.length);
          setComingSoonMovies(movies);
        }
      } catch (err) {
        console.error(`Error fetching ${activeTab} movies:`, err);
        console.error('Error details:', {
          message: (err as Error).message,
          stack: (err as Error).stack
        });
        setError(`Không thể tải danh sách phim. Vui lòng thử lại sau.`);
      } finally {
        setLoading(false);
        console.log(`=== MoviesPage: Finished fetching ${activeTab} movies ===`);
      }
    };

    fetchMovies();
  }, [activeTab]);

  // Format movies for the MovieGrid component
  const formatMoviesForGrid = (movies: Movie[]) => {
    console.log('MoviesPage: Formatting movies for grid, count:', movies.length);

    return movies.map(movie => {
      console.log('Processing movie:', movie);

      // Xử lý nhiều cấu trúc dữ liệu khác nhau
      const id = movie.id || '';
      const title = movie.title || '';
      const originalTitle = movie.englishTitle || movie.originalTitle || '';
      const posterUrl = movie.poster || '';
      const ageRating = movie.ageRating || '';

      console.log('Formatted movie:', { id, title, originalTitle, posterUrl, ageRating });

      return {
        id,
        title,
        originalTitle,
        posterUrl,
        ageRating
      };
    });
  };

  // Handle tab change
  const handleTabChange = (tab: 'now-playing' | 'coming-soon') => {
    console.log('MoviesPage: Tab changed to', tab);
    setActiveTab(tab);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-950 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Tất Cả Phim
            </h1>
            <p className="text-gray-400 text-lg">
              Khám phá bộ sưu tập phim đa dạng của chúng tôi
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-slate-900 p-1 rounded-lg border border-slate-700">
              <button
                onClick={() => handleTabChange('now-playing')}
                className={`px-6 py-3 rounded-md font-medium transition-all duration-300 ${activeTab === 'now-playing'
                  ? 'bg-yellow-500 text-black'
                  : 'text-gray-300 hover:text-white'
                  }`}
              >
                Đang Chiếu {nowPlayingMovies.length > 0 && `(${nowPlayingMovies.length})`}
              </button>
              <button
                onClick={() => handleTabChange('coming-soon')}
                className={`px-6 py-3 rounded-md font-medium transition-all duration-300 ${activeTab === 'coming-soon'
                  ? 'bg-yellow-500 text-black'
                  : 'text-gray-300 hover:text-white'
                  }`}
              >
                Sắp Chiếu {comingSoonMovies.length > 0 && `(${comingSoonMovies.length})`}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-center mb-8 p-4 bg-red-900/30 border border-red-700 rounded-lg">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <FullScreenLoader text="Đang tải danh sách phim..." />
          ) : (
            /* Movie Grid */
            <MovieGrid
              movies={formatMoviesForGrid(
                activeTab === 'now-playing' ? nowPlayingMovies : comingSoonMovies
              )}
              title={activeTab === 'now-playing' ? 'Phim Đang Chiếu' : 'Phim Sắp Chiếu'}
            />
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default MoviesPage;

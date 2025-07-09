import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarIcon,
  ClockIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
} from '@heroicons/react/24/outline';
import { PlayIcon as PlayIconSolid, StarIcon as StarIconSolid, FireIcon } from '@heroicons/react/24/solid';
import type { Movie } from '../types';

interface ComingSoonSectionProps {
  movies: Movie[];
  loading?: boolean;
  error?: string | null;
  onTrailerClick?: (movie: Movie) => void;
}

const ComingSoonSection: React.FC<ComingSoonSectionProps> = ({
  movies = [],
  loading = false,
  error = null,
  onTrailerClick
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const displayMovies = movies;
  const visibleMovies = 4; // Number of movies visible at once
  const maxIndex = Math.max(0, displayMovies.length - visibleMovies);

  // Loading state
  if (loading) {
    return (
      <section className="py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full"></div>
              <div className="h-8 bg-gray-700 rounded-lg w-48 animate-pulse" />
            </div>
          </div>
          <div className="flex space-x-4">
            {Array.from({ length: visibleMovies }).map((_, index) => (
              <div key={index} className="flex-1">
                <div className="bg-gray-700 rounded-lg aspect-[2/3] animate-pulse mb-4 h-[450px]" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-700 rounded animate-pulse" />
                  <div className="h-3 bg-gray-800 rounded w-2/3 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full"></div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">Phim Sắp Chiếu</h2>
            </div>
          </div>
          <div className="text-center py-12">
            <div className="text-red-400 mb-4">
              <CalendarIcon className="w-16 h-16 mx-auto mb-2" />
              <p className="text-lg font-semibold">Có lỗi khi tải phim sắp chiếu</p>
              <p className="text-sm text-gray-400">{error}</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Empty state
  if (displayMovies.length === 0) {
    return (
      <section className="py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full"></div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">Phim Sắp Chiếu</h2>
            </div>
          </div>
          <div className="text-center py-12">
            <div className="text-gray-400">
              <CalendarIcon className="w-16 h-16 mx-auto mb-4" />
              <p className="text-lg">Hiện tại chưa có phim nào sắp chiếu</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const nextSlide = () => {
    setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
  };

  const prevSlide = () => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  };

  // Auto-play functionality
  useEffect(() => {
    const interval = setInterval(() => {
      if (hoveredIndex === null) { // Only auto-slide when no movie is being hovered
        setCurrentIndex(prev => {
          const next = prev + 1;
          return next > maxIndex ? 0 : next;
        });
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [maxIndex, hoveredIndex]);

  return (
    <section className="py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full"></div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Phim Sắp Chiếu
            </h2>
            <CalendarIcon className="w-6 h-6 text-amber-400" />
          </div>
          <Link
            to="/coming-soon"
            className="text-amber-400 hover:text-amber-300 font-medium flex items-center gap-2 transition-colors group"
          >
            Xem tất cả
            <ChevronRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Slider container */}
        <div className="relative">
          <div className="relative overflow-hidden" ref={sliderRef}>
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentIndex * (100 / visibleMovies)}%)` }}
            >
              {displayMovies.map((movie, index) => (
                <div
                  key={`coming_soon_${movie.id}_${index}`}
                  className={`w-1/${visibleMovies} flex-shrink-0 px-2`}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div className="relative rounded-lg overflow-hidden group h-[450px]">
                    {/* Movie poster */}
                    <img
                      src={movie.poster}
                      alt={movie.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />

                    {/* Age rating badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`
                        ${movie.ageRating === '13+' ? 'bg-red-600' :
                          movie.ageRating === '16+' ? 'bg-red-700' :
                            movie.ageRating === '18+' ? 'bg-red-800' :
                              'bg-green-600'} 
                        text-white px-2 py-1 rounded text-xs font-bold
                      `}>
                        {movie.ageRating}
                      </span>
                    </div>

                    {/* Coming Soon badge */}
                    <div className="absolute top-3 right-3">
                      <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">
                        Sắp Chiếu
                      </span>
                    </div>

                    {/* Release date ribbon */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-[#ffd875]" />
                        <span className="text-white text-sm font-bold">
                          {new Date(movie.releaseDate).toLocaleDateString('vi-VN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Hover overlay with info */}
                    <div className={`absolute inset-0 bg-black/80 flex flex-col justify-between p-4 transition-opacity duration-300 ${hoveredIndex === index ? 'opacity-100' : 'opacity-0'}`}>
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl font-bold text-white">{movie.title}</h3>
                          {movie.isHot && (
                            <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded text-xs font-bold flex items-center">
                              <FireIcon className="w-3 h-3 mr-1" /> HOT
                            </span>
                          )}
                        </div>
                        <div className="flex items-center mb-3">
                          <StarIconSolid className="w-4 h-4 text-[#ffd875] mr-1" />
                          <span className="text-white text-sm">{movie.rating}</span>
                          <span className="mx-2 text-gray-400">•</span>
                          <ClockIcon className="w-4 h-4 text-[#ffd875] mr-1" />
                          <span className="text-white text-sm">{movie.duration}</span>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {movie.genre?.split(', ').map(genre => (
                            <span key={genre} className="bg-slate-700/80 text-gray-300 px-2 py-0.5 rounded-full text-xs">
                              {genre}
                            </span>
                          ))}
                        </div>
                        <p className="text-gray-300 text-sm line-clamp-3 mb-4">
                          {movie.description}
                        </p>
                        <div className="text-gray-400 text-xs mb-4">
                          <p className="mb-1">Đạo diễn: {movie.director}</p>
                          <p className="line-clamp-1">Diễn viên: {Array.isArray(movie.cast) ? movie.cast.join(', ') : movie.cast}</p>
                        </div>
                      </div>

                      <div className="mt-auto flex space-x-2">
                        <Link
                          to={`/movie/${movie.id}`}
                          className="flex-1 bg-[#ffd875] hover:bg-[#ffcf5c] text-black font-medium py-2 px-4 rounded text-center text-sm transition-colors"
                        >
                          Chi tiết
                        </Link>
                        {(movie.trailerLink || movie.trailerUrl) && (
                          <button
                            onClick={() => onTrailerClick?.(movie)}
                            className="flex items-center justify-center bg-slate-700/80 hover:bg-slate-600 text-white py-2 px-4 rounded transition-colors"
                          >
                            <PlayIconSolid className="w-4 h-4 mr-1" />
                            <span className="text-sm">Trailer</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Movie info below poster (visible when not hovering) */}
                  <div className={`mt-2 transition-opacity duration-300 ${hoveredIndex === index ? 'opacity-0' : 'opacity-100'}`}>
                    <h3 className="text-white font-medium text-base truncate">{movie.title}</h3>
                    <div className="flex items-center text-sm text-gray-400">
                      <span>{new Date(movie.releaseDate).getFullYear()}</span>
                      <span className="mx-1">•</span>
                      <span>{movie.duration}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation arrows */}
          {currentIndex > 0 && (
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 bg-[#ffd875] rounded-full flex items-center justify-center shadow-lg hover:bg-[#ffcf5c] transition-colors z-10"
              aria-label="Previous movies"
            >
              <ChevronLeftIcon className="w-6 h-6 text-black" />
            </button>
          )}

          {currentIndex < maxIndex && (
            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-10 h-10 bg-[#ffd875] rounded-full flex items-center justify-center shadow-lg hover:bg-[#ffcf5c] transition-colors z-10"
              aria-label="Next movies"
            >
              <ChevronRightIcon className="w-6 h-6 text-black" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default ComingSoonSection; 
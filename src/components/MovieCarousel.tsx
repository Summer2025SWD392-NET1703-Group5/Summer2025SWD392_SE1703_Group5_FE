import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlayIcon,
  PauseIcon,
  ArrowPathIcon
} from '@heroicons/react/24/solid';
import {
  EllipsisHorizontalIcon,
  ViewfinderCircleIcon
} from '@heroicons/react/24/outline';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import MovieCard from './MovieCard';
import type { Movie } from '../types';
import { useStaggerAnimation, useHover3D } from '../hooks/useGSAP';

interface MovieCarouselProps {
  movies: Movie[];
  title?: string;
  subtitle?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showDots?: boolean;
  showControls?: boolean;
  showProgress?: boolean;
  itemsPerView?: number;
  itemsToScroll?: number;
  spacing?: number;
  variant?: 'default' | 'compact' | 'detailed' | 'hero' | 'modern';
  className?: string;
  onMovieClick?: (movie: Movie) => void;
  onViewAll?: () => void;
  infinite?: boolean;
  pauseOnHover?: boolean;
  showRank?: boolean;
  loading?: boolean;
  error?: string;
  emptyMessage?: string;
}

const MovieCarousel: React.FC<MovieCarouselProps> = ({
  movies = [],
  title,
  subtitle,
  autoPlay = false,
  autoPlayInterval = 5000,
  showDots = false,
  showControls = true,
  showProgress = false,
  itemsPerView = 4,
  itemsToScroll = 2,
  spacing = 24,
  variant = 'default',
  className = '',
  onMovieClick,
  onViewAll,
  infinite = false,
  pauseOnHover = true,
  showRank = false,
  loading = false,
  error,
  emptyMessage = 'Không có phim nào để hiển thị'
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoPlay);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, scrollLeft: 0 });
  const [progress, setProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Responsive breakpoints
  const getResponsiveItemsPerView = useCallback(() => {
    if (typeof window === 'undefined') return itemsPerView;

    const width = window.innerWidth;
    if (width < 640) return 1; // mobile
    if (width < 768) return 2; // tablet
    if (width < 1024) return 3; // small desktop
    if (width < 1280) return itemsPerView; // desktop
    return Math.min(itemsPerView + 1, 6); // large desktop
  }, [itemsPerView]);

  const [responsiveItemsPerView, setResponsiveItemsPerView] = useState(getResponsiveItemsPerView());

  // Update responsive items per view on window resize
  useEffect(() => {
    const handleResize = () => {
      setResponsiveItemsPerView(getResponsiveItemsPerView());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [getResponsiveItemsPerView]);

  // Calculate card width based on container and spacing
  const getCardWidth = useCallback(() => {
    if (!scrollContainerRef.current) return 320;

    const containerWidth = scrollContainerRef.current.clientWidth;
    const totalSpacing = spacing * (responsiveItemsPerView - 1);
    return (containerWidth - totalSpacing) / responsiveItemsPerView;
  }, [spacing, responsiveItemsPerView]);

  // Check scroll button states
  const checkScrollButtons = useCallback(() => {
    if (!scrollContainerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    const maxScroll = scrollWidth - clientWidth;

    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft < maxScroll - 5);

    // Update current index based on scroll position
    const cardWidth = getCardWidth();
    const newIndex = Math.round(scrollLeft / (cardWidth + spacing));
    setCurrentIndex(newIndex);
  }, [getCardWidth, spacing]);

  // Scroll functions
  const scrollToIndex = useCallback((index: number, smooth = true) => {
    if (!scrollContainerRef.current) return;

    const cardWidth = getCardWidth();
    const scrollPosition = index * (cardWidth + spacing);

    scrollContainerRef.current.scrollTo({
      left: scrollPosition,
      behavior: smooth ? 'smooth' : 'auto'
    });
  }, [getCardWidth, spacing]);

  const scrollLeft = useCallback(() => {
    const newIndex = Math.max(0, currentIndex - itemsToScroll);
    scrollToIndex(newIndex);
  }, [currentIndex, itemsToScroll, scrollToIndex]);

  const scrollRight = useCallback(() => {
    const maxIndex = Math.max(0, movies.length - responsiveItemsPerView);
    const newIndex = Math.min(maxIndex, currentIndex + itemsToScroll);
    scrollToIndex(newIndex);
  }, [currentIndex, itemsToScroll, movies.length, responsiveItemsPerView, scrollToIndex]);

  // Auto-play functionality
  const startAutoPlay = useCallback(() => {
    if (!autoPlay || movies.length <= responsiveItemsPerView) return;

    autoPlayRef.current = setInterval(() => {
      setCurrentIndex(prev => {
        const maxIndex = movies.length - responsiveItemsPerView;
        const nextIndex = infinite ? (prev + 1) % movies.length : Math.min(prev + 1, maxIndex);

        if (!infinite && prev >= maxIndex) {
          return 0; // Reset to beginning
        }

        return nextIndex;
      });
    }, autoPlayInterval);
  }, [autoPlay, movies.length, responsiveItemsPerView, infinite, autoPlayInterval]);

  const stopAutoPlay = useCallback(() => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = null;
    }
  }, []);

  const toggleAutoPlay = () => {
    setIsAutoPlaying(prev => {
      const newState = !prev;
      if (newState) {
        startAutoPlay();
      } else {
        stopAutoPlay();
      }
      return newState;
    });
  };

  // Progress tracking for auto-play
  useEffect(() => {
    if (!isAutoPlaying || !showProgress) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          return 0;
        }
        return prev + (100 / (autoPlayInterval / 100));
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isAutoPlaying, showProgress, autoPlayInterval]);

  // Mouse drag functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;

    setIsDragging(true);
    setDragStart({
      x: e.pageX - scrollContainerRef.current.offsetLeft,
      scrollLeft: scrollContainerRef.current.scrollLeft
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;

    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - dragStart.x) * 2;
    scrollContainerRef.current.scrollLeft = dragStart.scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!scrollContainerRef.current) return;

    setIsDragging(true);
    setDragStart({
      x: e.touches[0].pageX - scrollContainerRef.current.offsetLeft,
      scrollLeft: scrollContainerRef.current.scrollLeft
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;

    const x = e.touches[0].pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - dragStart.x) * 2;
    scrollContainerRef.current.scrollLeft = dragStart.scrollLeft - walk;
  };

  // Setup event listeners
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener('scroll', checkScrollButtons);
    checkScrollButtons(); // Initial check

    return () => container.removeEventListener('scroll', checkScrollButtons);
  }, [checkScrollButtons]);

  // Auto-play management
  useEffect(() => {
    if (isAutoPlaying && !isHovered) {
      startAutoPlay();
    } else {
      stopAutoPlay();
    }

    return stopAutoPlay;
  }, [isAutoPlaying, isHovered, startAutoPlay, stopAutoPlay]);

  // Scroll to current index when it changes
  useEffect(() => {
    scrollToIndex(currentIndex, true);
  }, [currentIndex, scrollToIndex]);

  // Pause on hover
  const handleMouseEnter = () => {
    setIsHovered(true);
    if (pauseOnHover) {
      stopAutoPlay();
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (pauseOnHover && isAutoPlaying) {
      startAutoPlay();
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className={`movie-carousel-loading ${className}`}>
        {title && (
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-2">
              <div className="h-8 bg-gray-700 rounded-lg w-48 animate-pulse" />
              {subtitle && <div className="h-4 bg-gray-800 rounded w-32 animate-pulse" />}
            </div>
          </div>
        )}

        <div className="flex space-x-6">
          {Array.from({ length: responsiveItemsPerView }).map((_, index) => (
            <div key={index} className="flex-none w-80">
              <div className="bg-gray-700 rounded-2xl aspect-[2/3] animate-pulse mb-4" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-700 rounded animate-pulse" />
                <div className="h-3 bg-gray-800 rounded w-2/3 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`movie-carousel-error text-center py-12 ${className}`}>
        <div className="text-red-400 mb-4">
          <ViewfinderCircleIcon className="w-16 h-16 mx-auto mb-2" />
          <p className="text-lg font-semibold">Có lỗi xảy ra</p>
          <p className="text-sm text-gray-400">{error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="btn-primary inline-flex items-center space-x-2"
        >
          <ArrowPathIcon className="w-4 h-4" />
          <span>Thử lại</span>
        </button>
      </div>
    );
  }

  // Empty state
  if (!movies || movies.length === 0) {
    return (
      <div className={`movie-carousel-empty text-center py-12 ${className}`}>
        <div className="text-gray-400">
          <EllipsisHorizontalIcon className="w-16 h-16 mx-auto mb-4" />
          <p className="text-lg">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  const maxIndex = Math.max(0, movies.length - responsiveItemsPerView);
  const showLeftButton = showControls && canScrollLeft;
  const showRightButton = showControls && canScrollRight;

  return (
    <div
      className={`movie-carousel relative ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Header */}
      {(title || subtitle) && (
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-1">
            {title && (
              <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center space-x-3">
                <span>{title}</span>
                {movies.length > 0 && (
                  <span className="text-sm font-normal text-gray-400 bg-gray-800 px-2 py-1 rounded-full">
                    {movies.length} phim
                  </span>
                )}
              </h2>
            )}
            {subtitle && (
              <p className="text-gray-400 text-sm md:text-base">{subtitle}</p>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {/* Auto-play controls */}
            {autoPlay && (
              <button
                onClick={toggleAutoPlay}
                className="w-10 h-10 bg-gray-800 hover:bg-gray-700 text-white rounded-full flex items-center justify-center transition-colors"
                title={isAutoPlaying ? 'Tạm dừng' : 'Phát tự động'}
              >
                {isAutoPlaying ? (
                  <PauseIcon className="w-5 h-5" />
                ) : (
                  <PlayIcon className="w-5 h-5 ml-0.5" />
                )}
              </button>
            )}

            {/* View all button */}
            {onViewAll && (
              <button
                onClick={onViewAll}
                className="text-yellow-400 hover:text-yellow-300 font-medium text-sm transition-colors"
              >
                Xem tất cả →
              </button>
            )}
          </div>
        </div>
      )}

      {/* Progress bar */}
      {showProgress && isAutoPlaying && (
        <div className="mb-4">
          <div className="w-full bg-gray-800 rounded-full h-1">
            <div
              className="bg-yellow-400 h-1 rounded-full transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Carousel Content */}
      <div className="relative group">
        {/* Left Button */}
        {showLeftButton && (
          <button
            onClick={scrollLeft}
            className={`absolute left-0 top-1/2 transform -translate-y-1/2 z-20 w-12 h-12 rounded-full backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all duration-200 ${isDragging
              ? 'opacity-0'
              : 'bg-black/50 text-white hover:bg-black/70 hover:scale-110 opacity-0 group-hover:opacity-100'
              }`}
            disabled={isDragging}
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
        )}

        {/* Right Button */}
        {showRightButton && (
          <button
            onClick={scrollRight}
            className={`absolute right-0 top-1/2 transform -translate-y-1/2 z-20 w-12 h-12 rounded-full backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all duration-200 ${isDragging
              ? 'opacity-0'
              : 'bg-black/50 text-white hover:bg-black/70 hover:scale-110 opacity-0 group-hover:opacity-100'
              }`}
            disabled={isDragging}
          >
            <ChevronRightIcon className="w-6 h-6" />
          </button>
        )}

        {/* Scrollable Container */}
        <div
          ref={scrollContainerRef}
          className={`flex overflow-x-auto scrollbar-hide pb-4 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            gap: `${spacing}px`,
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
        >
          {movies.map((movie, index) => (
            <div
              key={movie.id}
              className={`flex-none ${variant === 'modern'
                ? 'w-[140px] sm:w-[160px] md:w-[180px] lg:w-[200px]'
                : variant === 'compact'
                  ? 'w-64'
                  : variant === 'hero'
                    ? 'w-96'
                    : 'w-80'
                }`}
            >
              {variant === 'modern' ? (
                <div
                  className="relative group/card cursor-pointer transform transition-all duration-300 hover:scale-105"
                  onClick={() => onMovieClick?.(movie)}
                >
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-lg">
                    <img
                      src={movie.poster}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />

                    {/* Overlay hiệu ứng khi hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="text-white text-sm font-bold line-clamp-2">{movie.title}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[#FFD875] text-xs">⭐ {movie.rating}</span>
                          <PlayIcon className="w-8 h-8 text-white opacity-80 hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    </div>

                    {/* Glow effect */}
                    <div className="absolute inset-0 rounded-lg opacity-0 group-hover/card:opacity-100 transition-all duration-300 pointer-events-none">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#FFD875]/0 via-[#FFD875]/30 to-[#FFD875]/0 blur-xl"></div>
                      <div className="absolute inset-0 rounded-lg shadow-[0_0_30px_rgba(255,216,117,0.6)]"></div>
                    </div>

                    {/* Badges */}
                    {movie.isNew && (
                      <div className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                        MỚI
                      </div>
                    )}
                    {movie.isHot && (
                      <div className="absolute top-2 right-2 px-2 py-1 bg-[#FFD875] text-black text-xs font-bold rounded flex items-center gap-1">
                        <span className="animate-pulse">🔥</span> HOT
                      </div>
                    )}
                  </div>
                </div>
              ) : showRank && index < 10 ? (
                <div className="relative">
                  <div className="absolute -top-4 -left-4 z-10 w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-xl font-bold text-black">{index + 1}</span>
                  </div>
                  <MovieCard
                    {...movie}
                    onClick={() => onMovieClick?.(movie)}
                  />
                </div>
              ) : (
                <MovieCard
                  {...movie}
                  onClick={() => onMovieClick?.(movie)}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Dots Navigation */}
      {showDots && movies.length > responsiveItemsPerView && (
        <div className="flex justify-center space-x-2 mt-6">
          {Array.from({
            length: Math.ceil((movies.length - responsiveItemsPerView + 1) / itemsToScroll)
          }).map((_, index) => {
            const dotIndex = index * itemsToScroll;
            const isActive = Math.abs(currentIndex - dotIndex) < itemsToScroll;

            return (
              <button
                key={index}
                onClick={() => scrollToIndex(dotIndex)}
                className={`transition-all duration-300 rounded-full ${isActive
                  ? 'bg-yellow-400 w-8 h-2'
                  : 'bg-gray-600 hover:bg-gray-500 w-2 h-2'
                  }`}
                aria-label={`Đi đến nhóm phim ${index + 1}`}
              />
            );
          })}
        </div>
      )}

      {/* Keyboard Navigation Hint */}
      <div className="sr-only" aria-live="polite">
        Đang hiển thị phim {currentIndex + 1} đến {Math.min(currentIndex + responsiveItemsPerView, movies.length)} trong tổng số {movies.length} phim
      </div>
    </div>
  );
};

export default MovieCarousel;

import React, { useState, useEffect, useRef } from 'react';
import {
  PlayIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  TicketIcon,
  InformationCircleIcon,
  StarIcon
} from '@heroicons/react/24/solid';
import type { Movie } from '../types';

interface AnimeCarouselProps {
  movies: Movie[];
  onMovieClick?: (movie: Movie) => void;
  onBookTicket?: (movie: Movie) => void;
  loading?: boolean;
}

const AnimeCarousel: React.FC<AnimeCarouselProps> = ({
  movies = [],
  onMovieClick,
  onBookTicket,
  loading = false
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Function to handle scrolling
  const scroll = (direction: 'left' | 'right') => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const cardWidth = container.querySelector('.anime-card')?.clientWidth || 300;
    const scrollAmount = direction === 'left' ? -cardWidth * 2 : cardWidth * 2;

    container.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });
  };

  // Check scroll position and update arrow visibility
  const handleScroll = () => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const isAtStart = container.scrollLeft <= 10;
    const isAtEnd = container.scrollLeft + container.clientWidth >= container.scrollWidth - 10;

    setShowLeftArrow(!isAtStart);
    setShowRightArrow(!isAtEnd);

    // Update current index based on scroll position
    const cardWidth = container.querySelector('.anime-card')?.clientWidth || 300;
    const newIndex = Math.round(container.scrollLeft / cardWidth);
    setCurrentIndex(newIndex);
  };

  // Setup auto-scroll
  useEffect(() => {
    autoPlayRef.current = setInterval(() => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const isAtEnd = container.scrollLeft + container.clientWidth >= container.scrollWidth - 10;

      if (isAtEnd) {
        // Reset to beginning if at the end
        container.scrollTo({
          left: 0,
          behavior: 'smooth'
        });
        setCurrentIndex(0);
      } else {
        // Scroll to next item
        scroll('right');
      }
    }, 5000);

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [movies]);

  // Pause auto-scroll when hovering
  const handleMouseEnter = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
  };

  // Resume auto-scroll when mouse leaves
  const handleMouseLeave = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
    autoPlayRef.current = setInterval(() => scroll('right'), 5000);
    setHoveredIndex(null);
  };

  // Add scroll event listener
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      handleScroll(); // Initial check
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [movies]);

  // Function to create shimmer loading effect
  const ShimmerEffect = () => (
    <div className="animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full"></div>
  );

  if (loading) {
    return (
      <div className="w-full bg-black py-4">
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="flex-shrink-0 relative">
              <div className="w-[300px] h-[169px] bg-gray-800 rounded-lg relative overflow-hidden">
                <ShimmerEffect />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-black overflow-hidden">
      <div
        className="relative group"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Left Navigation Button */}
        {showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-[#FFD875]/20 text-white w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-300 opacity-0 group-hover:opacity-100 focus:opacity-100 hover:opacity-100 border border-[#FFD875]/30 shadow-[0_0_15px_rgba(255,216,117,0.3)]"
            aria-label="Previous anime"
          >
            <ChevronLeftIcon className="w-8 h-8 text-[#FFD875]" />
          </button>
        )}

        {/* Anime Cards Container */}
        <div
          ref={containerRef}
          className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {movies.map((movie, index) => (
            <div
              key={movie.id}
              className="anime-card flex-shrink-0 w-[300px] h-[169px] mx-2 first:ml-4 last:mr-4 relative snap-start"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Card Container with hover effects */}
              <div
                className={`relative w-full h-full rounded-lg overflow-hidden transition-all duration-300 
                  ${hoveredIndex === index ? 'transform scale-105 shadow-[0_0_20px_rgba(255,216,117,0.4)]' : 'shadow-md'}`}
              >
                {/* Poster Image */}
                <img
                  src={movie.poster}
                  alt={movie.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-40"></div>

                {/* Basic Info (Always Visible) */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h3 className="text-white font-bold text-lg truncate">{movie.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-[#b3b3b3]">
                    {movie.year && <span>{movie.year}</span>}
                    {movie.year && movie.rating && <span>•</span>}
                    {movie.rating && (
                      <>
                        <div className="flex items-center">
                          <StarIcon className="w-3 h-3 text-[#FFD875]" />
                          <span className="ml-1">{movie.rating}</span>
                        </div>
                      </>
                    )}
                    {movie.genre && (
                      <>
                        <span>•</span>
                        <span>{movie.genre}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Hover Details */}
                {hoveredIndex === index && (
                  <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col justify-center items-center gap-4 p-4 animate-fadeIn">
                    <h3 className="text-[#FFD875] font-bold text-lg text-center">{movie.title}</h3>

                    <div className="flex gap-3">
                      {/* Play Button */}
                      <button
                        onClick={() => onMovieClick && onMovieClick(movie)}
                        className="flex items-center justify-center gap-1 bg-[#FFD875] hover:bg-[#FFD875]/90 text-black px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 shadow-[0_0_10px_rgba(255,216,117,0.5)] hover:shadow-[0_0_15px_rgba(255,216,117,0.7)]"
                      >
                        <PlayIcon className="w-4 h-4" />
                        <span>Xem</span>
                      </button>

                      {/* Book Ticket Button */}
                      <button
                        onClick={() => onBookTicket && onBookTicket(movie)}
                        className="flex items-center justify-center gap-1 bg-transparent hover:bg-[#FFD875]/20 text-[#FFD875] border border-[#FFD875] px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 hover:shadow-[0_0_10px_rgba(255,216,117,0.4)]"
                      >
                        <TicketIcon className="w-4 h-4" />
                        <span>Đặt vé</span>
                      </button>
                    </div>

                    {/* Details Button */}
                    <button
                      onClick={() => onMovieClick && onMovieClick(movie)}
                      className="text-[#FFD875]/80 hover:text-[#FFD875] text-xs flex items-center gap-1 transition-all duration-300"
                    >
                      <InformationCircleIcon className="w-3 h-3" />
                      <span>Chi tiết</span>
                    </button>
                  </div>
                )}

                {/* Badges */}
                {movie.isHot && (
                  <div className="absolute top-2 left-2 bg-[#FFD875] text-black text-xs font-bold px-2 py-0.5 rounded shadow-[0_0_10px_rgba(255,216,117,0.5)]">
                    HOT
                  </div>
                )}
                {movie.isNew && (
                  <div className="absolute top-2 right-2 bg-[#46d369] text-black text-xs font-bold px-2 py-0.5 rounded shadow-[0_0_10px_rgba(70,211,105,0.5)]">
                    MỚI
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Right Navigation Button */}
        {showRightArrow && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-[#FFD875]/20 text-white w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-300 opacity-0 group-hover:opacity-100 focus:opacity-100 hover:opacity-100 border border-[#FFD875]/30 shadow-[0_0_15px_rgba(255,216,117,0.3)]"
            aria-label="Next anime"
          >
            <ChevronRightIcon className="w-8 h-8 text-[#FFD875]" />
          </button>
        )}

        {/* Carousel Indicators */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {movies.slice(0, Math.min(10, Math.ceil(movies.length / 3))).map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${Math.floor(currentIndex / 3) === index ? 'bg-[#FFD875] w-6 shadow-[0_0_10px_rgba(255,216,117,0.5)]' : 'bg-gray-500 hover:bg-gray-400'
                }`}
              onClick={() => {
                if (!containerRef.current) return;
                const container = containerRef.current;
                const cardWidth = container.querySelector('.anime-card')?.clientWidth || 300;
                container.scrollTo({
                  left: cardWidth * index * 3,
                  behavior: 'smooth'
                });
                setCurrentIndex(index * 3);
              }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnimeCarousel; 
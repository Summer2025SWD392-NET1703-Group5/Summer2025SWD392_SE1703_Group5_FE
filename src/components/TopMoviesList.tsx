import React, { useState, useEffect, useRef } from 'react';
import { PlayIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';
import { StarIcon } from '@heroicons/react/24/solid';
import type { Movie } from '../types';

interface TopMoviesListProps {
  movies: Movie[];
  loading?: boolean;
  error?: string | null;
  title?: string;
  showRanking?: boolean;
}

// Define the movie display type to match our sample data structure
interface DisplayMovie {
  id: number;
  title: string;
  year: number;
  genre: string;
  rating: number;
  poster: string;
  badges: string[];
}

// Sample movie data for Netflix-style Top 10
const sampleNetflixTopMovies: DisplayMovie[] = [
  {
    id: 101,
    title: "ARCHIVE 81",
    year: 2022,
    genre: "Horror",
    rating: 8.2,
    poster: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&h=1200&fit=crop",
    badges: ["MỚI"]
  },
  {
    id: 102,
    title: "ABSOLUMENT ROYAL!",
    year: 2023,
    genre: "Comedy",
    rating: 7.8,
    poster: "https://images.unsplash.com/photo-1580130379624-59b0a2b92c8e?w=800&h=1200&fit=crop",
    badges: []
  },
  {
    id: 103,
    title: "NE T'ÉLOIGNE PAS",
    year: 2022,
    genre: "Thriller",
    rating: 8.0,
    poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&h=1200&fit=crop",
    badges: []
  },
  {
    id: 104,
    title: "SÉDUCTION HAUTE TENSION",
    year: 2023,
    genre: "Romance",
    rating: 7.5,
    poster: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=1200&fit=crop",
    badges: ["TẬP MỚI"]
  },
  {
    id: 105,
    title: "THE LAST SURVIVOR",
    year: 2022,
    genre: "Action",
    rating: 7.9,
    poster: "https://images.unsplash.com/photo-1597310089496-bf7d2baa1f0f?w=800&h=1200&fit=crop",
    badges: []
  },
  {
    id: 106,
    title: "MIDNIGHT CHRONICLES",
    year: 2023,
    genre: "Fantasy",
    rating: 8.4,
    poster: "https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=800&h=1200&fit=crop",
    badges: ["MỚI"]
  },
  {
    id: 107,
    title: "QUANTUM PARADOX",
    year: 2022,
    genre: "Sci-Fi",
    rating: 8.1,
    poster: "https://images.unsplash.com/photo-1535951485-0662203cab14?w=800&h=1200&fit=crop",
    badges: []
  },
  {
    id: 108,
    title: "OCEAN'S SECRET",
    year: 2023,
    genre: "Adventure",
    rating: 7.6,
    poster: "https://images.unsplash.com/photo-1511084891045-b7325930125c?w=800&h=1200&fit=crop",
    badges: ["TẬP MỚI"]
  },
  {
    id: 109,
    title: "CITY OF SHADOWS",
    year: 2022,
    genre: "Crime",
    rating: 8.3,
    poster: "https://images.unsplash.com/photo-1555661605-1e9c342888c0?w=800&h=1200&fit=crop",
    badges: []
  },
  {
    id: 110,
    title: "THE FINAL CHAPTER",
    year: 2023,
    genre: "Drama",
    rating: 7.7,
    poster: "https://images.unsplash.com/photo-1588927600216-659a58efe3d9?w=800&h=1200&fit=crop",
    badges: []
  }
];

const TopMoviesList: React.FC<TopMoviesListProps> = ({
  movies,
  loading = false,
  error,
  title = "Top phim hot",
  showRanking = true
}) => {
  const [displayMovies, setDisplayMovies] = useState<DisplayMovie[]>(sampleNetflixTopMovies);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Function to handle scrolling the carousel
  const scrollCarousel = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return;

    const container = carouselRef.current;
    const cardWidth = 370; // Card width + gap (280px + 90px)
    const scrollAmount = direction === 'left' ? -cardWidth : cardWidth;

    container.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });
  };

  // Function to handle automatic scrolling
  const autoScroll = () => {
    if (!carouselRef.current) return;

    const container = carouselRef.current;
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
      scrollCarousel('right');
      setCurrentIndex(prev => (prev + 1) % displayMovies.length);
    }
  };

  // Function to check scroll position and update arrow visibility
  const handleScroll = () => {
    if (!carouselRef.current) return;

    const container = carouselRef.current;
    const isAtStart = container.scrollLeft <= 10;
    const isAtEnd = container.scrollLeft + container.clientWidth >= container.scrollWidth - 10;

    setShowLeftArrow(!isAtStart);
    setShowRightArrow(!isAtEnd);
  };

  // Prevent wheel scrolling
  const preventScroll = (e: React.WheelEvent) => {
    e.preventDefault();
  };

  // Setup auto-scroll
  useEffect(() => {
    // Start auto-scroll
    autoPlayRef.current = setInterval(autoScroll, 3000);

    // Clear interval on component unmount
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [displayMovies]);

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
    autoPlayRef.current = setInterval(autoScroll, 3000);
    setHoveredIndex(null); // Reset hovered index when mouse leaves
  };

  useEffect(() => {
    // If movies are provided, map them to our display format
    if (movies && movies.length >= 10) {
      const mappedMovies: DisplayMovie[] = movies.slice(0, 10).map(movie => {
        // Ensure year is a number
        let yearValue: number;
        if (typeof movie.year === 'number') {
          yearValue = movie.year;
        } else if (typeof movie.year === 'string') {
          const parsedYear = parseInt(movie.year, 10);
          yearValue = isNaN(parsedYear) ? new Date().getFullYear() : parsedYear;
        } else {
          yearValue = new Date().getFullYear();
        }

        return {
          id: movie.id,
          title: movie.title,
          year: yearValue,
          genre: Array.isArray(movie.genres) ? movie.genres[0] : typeof movie.genre === 'string' ? movie.genre : 'Drama',
          rating: movie.rating,
          poster: movie.poster,
          badges: [
            ...(movie.isNew ? ["MỚI"] : []),
            ...(movie.isHot ? ["TẬP MỚI"] : [])
          ]
        };
      });

      setDisplayMovies(mappedMovies);
    }

    // Add scroll event listener
    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener('scroll', handleScroll);
      // Initial check
      handleScroll();
    }

    return () => {
      if (carousel) {
        carousel.removeEventListener('scroll', handleScroll);
      }
    };
  }, [movies]);

  // Function to create shimmer loading effect
  const ShimmerEffect = () => (
    <div className="animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full"></div>
  );

  if (loading) {
    return (
      <div className="px-4 md:px-8">
        <div className="flex space-x-4 overflow-x-auto scrollbar-hide">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex-shrink-0 w-48">
              <div className="bg-gray-700 rounded-lg aspect-[2/3] animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="px-4 md:px-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1 h-8 bg-[#FFD875] rounded-full"></div>
          <h2 className="text-3xl font-bold text-white">{title}</h2>
        </div>
        <div className="text-center py-12">
          <div className="text-red-400 mb-4">
            <StarIcon className="w-16 h-16 mx-auto mb-2" />
            <p className="text-lg font-semibold">Có lỗi khi tải top phim</p>
            <p className="text-sm text-gray-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black selection:bg-[#FFD875] selection:text-black">
      <div className="max-w-full">
        {/* Header */}
        <div className="flex flex-col">
          <div className="flex items-center">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-[#FFD875] rounded-full shadow-[0_0_10px_rgba(255,216,117,0.4)]"></div>
              <h2 className="text-3xl font-bold text-white flex items-center gap-2">
                <span className="text-[#FFD875]">🏆</span>
                <span>{title}</span>
              </h2>
            </div>
          </div>
          <h3 className="text-lg text-gray-400 mt-1 ml-10 font-medium">Top phim hot</h3>
        </div>

        {/* Carousel Container */}
        <div
          className="relative group"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Left Navigation Button */}
          {showLeftArrow && (
            <button
              onClick={() => scrollCarousel('left')}
              className="absolute -left-5 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/80 text-white w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-300 opacity-0 group-hover:opacity-100 focus:opacity-100 hover:opacity-100 border border-white/20 shadow-lg"
              aria-label="Previous movies"
            >
              <ChevronLeftIcon className="w-8 h-8" />
            </button>
          )}

          {/* Movies List */}
          <div
            ref={carouselRef}
            className="flex space-x-12 md:space-x-10 sm:space-x-8 xs:space-x-6 overflow-x-auto snap-x snap-mandatory hide-scrollbar"
            onScroll={handleScroll}
            onWheel={preventScroll}
            style={{ touchAction: 'none' }}
          >
            {displayMovies.map((movie, index) => (
              <Link
                key={movie.id}
                to={`/movie/${movie.id}`}
                className="relative flex-shrink-0 cursor-pointer snap-start h-[500px] md:h-[450px] sm:h-[400px] xs:h-[350px]"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Ranking Number */}
                {showRanking && (
                  <div
                    className="absolute -left-[20px] bottom-[50px] z-10 transition-all duration-300
                             md:-left-[15px] md:bottom-[40px]
                             sm:-left-[10px] sm:bottom-[30px]
                             xs:-left-[5px] xs:bottom-[20px]"
                    style={{
                      filter: hoveredIndex === index ? 'drop-shadow(0 0 15px rgba(255, 216, 117, 0.9))' : 'none',
                    }}
                  >
                    <span
                      className="font-black text-[320px] font-['Arial_Black',sans-serif] leading-none
                               md:text-[280px] sm:text-[240px] xs:text-[200px]"
                      style={{
                        color: 'transparent',
                        WebkitTextStroke: `4px ${index === 0 ? '#FFD875' : '#ffffff'}`,
                        textShadow: '4px 4px 8px rgba(0,0,0,0.8)',
                        lineHeight: '0.8',
                        opacity: '0.9',
                        display: 'block',
                      }}
                    >
                      {index + 1}
                    </span>
                  </div>
                )}

                {/* Movie Card */}
                <div
                  className={`relative w-[280px] h-[400px] rounded-lg overflow-hidden shadow-lg 
                             transition-all duration-400 ease-in-out
                             ${hoveredIndex === index ? 'scale-[1.08] -translate-y-2 shadow-xl shadow-black/30' : ''}
                             md:w-[240px] md:h-[360px]
                             sm:w-[200px] sm:h-[300px]
                             xs:w-[160px] xs:h-[240px]`}
                >
                  {/* Galaxy Logo */}
                  <div className="absolute top-3 right-3 z-20 bg-[#FFD875] w-7 h-7 flex items-center justify-center rounded-sm shadow-lg">
                    <span className="text-black font-bold text-sm">G</span>
                  </div>

                  {/* Poster Image */}
                  <div className="w-full h-full overflow-hidden">
                    <img
                      src={movie.poster}
                      alt={movie.title}
                      loading="lazy"
                      className={`w-full h-full object-cover transition-transform duration-300 ${hoveredIndex === index ? 'scale-110' : ''}`}
                    />
                  </div>

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent from-60% via-black/70 to-black/90"></div>

                  {/* Movie Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    {/* Movie Title */}
                    <h3 className="text-white font-bold text-lg mb-2 uppercase tracking-wide">{movie.title}</h3>

                    {/* Badges */}
                    {movie.badges && movie.badges.length > 0 && (
                      <div className="flex gap-2 mb-2">
                        {movie.badges.map((badge, idx) => (
                          <span
                            key={idx}
                            className={`px-2 py-0.5 text-xs font-bold rounded ${badge === 'MỚI' ? 'bg-[#46d369] text-black' : 'bg-[#FFD875] text-black'
                              }`}
                          >
                            {badge}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Meta Info */}
                    <div className="flex items-center gap-2 text-xs text-[#b3b3b3]">
                      <span>{movie.year}</span>
                      <span>•</span>
                      <div className="flex items-center">
                        <span className="text-[#FFD875]">★</span>
                        <span className="ml-1">{movie.rating}</span>
                      </div>
                      <span>•</span>
                      <span>{movie.genre}</span>
                    </div>
                  </div>

                  {/* Play Button Overlay - Only visible when this specific card is hovered */}
                  {hoveredIndex === index && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/80 via-black/50 to-black/30 animate-fadeIn">
                      <div className="w-16 h-16 rounded-full bg-[#FFD875]/30 backdrop-blur-sm flex items-center justify-center border-2 border-[#FFD875] transform scale-110 transition-transform duration-300 animate-scaleIn">
                        <PlayIcon className="w-8 h-8 text-white ml-1" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Movie Title Below Card (Visible on Larger Screens) */}
                <div className="hidden md:block absolute bottom-[-40px] left-0 right-0 text-center">
                  <p className="text-white text-sm font-medium truncate">{movie.title}</p>
                  <p className="text-gray-400 text-xs">{movie.year} • {movie.genre}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Right Navigation Button */}
          {showRightArrow && (
            <button
              onClick={() => scrollCarousel('right')}
              className="absolute -right-5 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/80 text-white w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-300 opacity-0 group-hover:opacity-100 focus:opacity-100 hover:opacity-100 border border-white/20 shadow-lg"
              aria-label="Next movies"
            >
              <ChevronRightIcon className="w-8 h-8" />
            </button>
          )}

          {/* Carousel Indicators */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {displayMovies.slice(0, 10).map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentIndex ? 'bg-[#FFD875] w-6' : 'bg-gray-500 hover:bg-gray-400'
                  }`}
                onClick={() => {
                  if (!carouselRef.current) return;
                  const container = carouselRef.current;
                  const cardWidth = 370;
                  container.scrollTo({
                    left: cardWidth * index,
                    behavior: 'smooth'
                  });
                  setCurrentIndex(index);
                }}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopMoviesList;

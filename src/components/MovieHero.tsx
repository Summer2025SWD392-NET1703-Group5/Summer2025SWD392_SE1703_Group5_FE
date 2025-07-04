import React, { useState, useEffect, useRef } from 'react';
import { Play, Calendar, Clock, Star, Info, Heart, Share2, Volume2, VolumeX, ArrowRight, Maximize, Minimize, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import type { Movie } from '../types'; // THÊM import
import BookingTicketButton from './BookingTicketButton';
import { createRipple, floatAnimation, pulseAnimation } from '../utils/animations';
import { useParallax, useTextReveal } from '../hooks/useGSAP';

interface RelatedMovie {
  id: number;
  title: string;
  poster: string;
  trailerUrl?: string;
}

interface MovieHeroProps {
  id: number;
  title: string;
  englishTitle?: string;
  rating: number;
  duration: string;
  releaseDate: string;
  description: string;
  backgroundImage: string;
  trailer?: string;
  genres?: string[];
  director?: string;
  cast?: string[];
  ageRating?: string;
  relatedMovies?: RelatedMovie[];
  onMovieSelect?: (movie: Movie) => void; // THÊM PROP MỚI
  onTrailerClick?: (movie: Movie) => void;
}

const MovieHero: React.FC<MovieHeroProps> = ({
  id,
  title,
  englishTitle,
  rating,
  duration,
  releaseDate,
  description,
  backgroundImage,
  trailer,
  genres = [],
  director,
  cast = [],
  ageRating = "T13",
  relatedMovies = [],
  onMovieSelect, // THÊM PROP MỚI
  onTrailerClick
}) => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [selectedTrailer, setSelectedTrailer] = useState(trailer);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  // Animated text for description - FIX: Add null check before splitting
  const descriptionParts = description ? description.split('. ') : [];

  useEffect(() => {
    if (descriptionParts.length > 1) {
      const interval = setInterval(() => {
        setCurrentTextIndex((prev) => (prev + 1) % descriptionParts.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [descriptionParts.length]);

  // Refs cho animation
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const thumbnailsRef = useRef<HTMLDivElement>(null);

  // Parallax effect cho background
  const bgParallaxRef = useParallax(0.3);

  // Text reveal effect cho title
  const titleRevealRef = useTextReveal({ duration: 1.2, delay: 0.3 });

  // GSAP animation khi component mount
  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // Animate hero content
    tl.from(heroRef.current, {
      opacity: 0,
      duration: 1
    })
      .from('.age-rating', {
        y: -30,
        opacity: 0,
        duration: 0.6
      }, '-=0.5')
      .from('.movie-info > div', {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1
      }, '-=0.3')
      .from('.genre-tag', {
        scale: 0,
        opacity: 0,
        duration: 0.5,
        stagger: 0.05,
        ease: 'back.out(1.7)'
      }, '-=0.3')
      .from('.director-cast', {
        x: -50,
        opacity: 0,
        duration: 0.8
      }, '-=0.3')
      .from('.action-button', {
        scale: 0.8,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'back.out(1.7)'
      }, '-=0.4');

    // Animate thumbnails
    if (thumbnailsRef.current) {
      gsap.from('.thumbnail-item', {
        x: 100,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        delay: 1,
        ease: 'power3.out'
      });
    }
  }, []);

  // Floating animation cho play button
  useEffect(() => {
    const playButton = document.querySelector('.play-button');
    if (playButton) {
      floatAnimation(playButton as HTMLElement, 10);
    }
  }, []);

  // Pulse animation cho favorite button khi active
  useEffect(() => {
    const favoriteButton = document.querySelector('.favorite-button');
    if (favoriteButton && isFavorite) {
      pulseAnimation(favoriteButton as HTMLElement);
    }
  }, [isFavorite]);

  // Enhanced play trailer với animation
  const handlePlayTrailer = () => {
    const tl = gsap.timeline();

    tl.to(contentRef.current, {
      opacity: 0,
      y: 50,
      duration: 0.5,
      ease: 'power2.in'
    })
      .call(() => {
        setIsVideoPlaying(true);
        setIsMuted(false);
      });
  };

  // Enhanced thumbnail click với transition
  const handleThumbnailClick = (movie: RelatedMovie) => {
    // Animate out current content
    gsap.to([titleRef.current, contentRef.current], {
      opacity: 0,
      y: 30,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        // Update content
        if (onMovieSelect) {
          const fullMovie: Movie = {
            id: movie.id,
            title: movie.title,
            englishTitle: movie.title,
            poster: movie.poster,
            backgroundImage: movie.poster,
            rating: 4.0,
            genre: "Hành Động",
            genres: ["Hành Động"],
            duration: "120 phút",
            releaseDate: "2024-01-01",
            description: `Mô tả cho phim ${movie.title}`,
            cast: ["Diễn viên 1", "Diễn viên 2"],
            director: "Đạo diễn",
            ageRating: "T13",
            trailerUrl: movie.trailerUrl || "",
            isComingSoon: false,
            country: "Mỹ",
            language: "Tiếng Anh",
            reviews: [],
            gallery: []
          };
          onMovieSelect(fullMovie);
        }

        // Animate in new content
        gsap.fromTo([titleRef.current, contentRef.current],
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', stagger: 0.1 }
        );
      }
    });

    if (movie.trailerUrl) {
      setSelectedTrailer(movie.trailerUrl);
    }
  };

  // Add ripple effect to buttons
  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    createRipple(e.nativeEvent, e.currentTarget);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link đã được sao chép!');
    }
  };

  const toggleFullscreen = () => {
    if (!videoContainerRef.current) return;

    if (!document.fullscreenElement) {
      videoContainerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <>
      <style>
        {`
        .text-glow-gold {
          text-shadow: 0 0 8px rgba(255, 216, 117, 0.4);
        }
        
        /* Ripple effect */
        .ripple {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 216, 117, 0.6);
          transform: scale(0);
          pointer-events: none;
        }
        
        /* Hover effects */
        .genre-tag {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .genre-tag:hover {
          transform: translateY(-2px);
        }
        
        /* Thumbnail hover */
        .thumbnail-item {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .thumbnail-item:hover {
          transform: scale(1.1) translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        }
        
        /* Smooth scrollbar */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}
      </style>

      <div ref={heroRef} className="relative h-screen overflow-hidden">
        {/* Background Image/Video with parallax */}
        <div ref={bgParallaxRef} className="absolute inset-0 scale-110">
          {isVideoPlaying && selectedTrailer ? (
            <div
              ref={videoContainerRef}
              className={`relative w-full h-full ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}
              style={isFullscreen ? { width: '100vw', height: '100vh', overflow: 'hidden' } : {}}
            >
              <iframe
                src={`${selectedTrailer}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1`}
                className={`${isFullscreen ? 'absolute inset-0' : 'w-full h-full'}`}
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
                style={{
                  border: 'none',
                  width: isFullscreen ? '100%' : '100%',
                  height: isFullscreen ? '100%' : '100%',
                  objectFit: 'cover'
                }}
              />
              <div className="absolute bottom-4 right-4 flex items-center space-x-3 z-10">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-3 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-all duration-300"
                  title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
                >
                  {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                </button>

                <button
                  onClick={toggleFullscreen}
                  className="p-3 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-all duration-300"
                  title={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
                >
                  {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
                </button>
              </div>

              <button
                onClick={() => setIsVideoPlaying(false)}
                className="absolute top-4 right-4 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-all duration-300"
                title="Đóng video"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          ) : (
            <>
              {!imageLoaded && (
                <div className="absolute inset-0 bg-slate-800 animate-pulse" />
              )}
              <img
                src={backgroundImage}
                alt={title}
                className="w-full h-full object-cover"
                onLoad={() => setImageLoaded(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </>
          )}
        </div>

        {/* Content */}
        {(!isVideoPlaying || !isFullscreen) && (
          <div ref={contentRef} className="relative z-10 h-full flex items-center">
            <div className="container mx-auto px-4 lg:px-8">
              <div className="max-w-4xl">
                {/* Age Rating Badge */}
                <div className="age-rating inline-flex items-center bg-red-600 text-white px-3 py-1 rounded-md text-sm font-semibold mb-4">
                  {ageRating}
                </div>

                {/* Title with text reveal effect */}
                <h1 ref={titleRevealRef} className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight">
                  {title}
                </h1>

                {englishTitle && (
                  <p className="text-xl md:text-2xl text-slate-300 mb-6 font-light">
                    {englishTitle}
                  </p>
                )}

                {/* Movie Info */}
                <div className="movie-info flex flex-wrap items-center gap-6 mb-6 text-white">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-500 mr-2" />
                    <span className="font-semibold">{rating}/5</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-slate-400 mr-2" />
                    <span>{duration}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-slate-400 mr-2" />
                    <span>{releaseDate}</span>
                  </div>
                </div>

                {/* Genres */}
                <div className="flex flex-wrap gap-3 mb-6">
                  {genres.map((genre) => (
                    <span
                      key={genre}
                      className="genre-tag px-4 py-2 rounded-full text-sm font-medium
                               bg-[#FFD875]/10 text-[#FFD875] border border-[#FFD875]/30
                               hover:bg-[#FFD875]/20 hover:shadow-[0_0_15px_rgba(255,216,117,0.3)]"
                    >
                      {genre}
                    </span>
                  ))}
                </div>

                {/* Director & Cast */}
                <div className="director-cast space-y-2 text-slate-300 text-sm mb-6 max-w-2xl">
                  {director && (
                    <p>
                      <span className="font-semibold text-[#FFD875] text-glow-gold">Đạo diễn:</span> {director}
                    </p>
                  )}
                  {Array.isArray(cast) && cast.length > 0 && (
                    <p>
                      <span className="font-semibold text-[#FFD875] text-glow-gold">Diễn viên:</span> {cast.slice(0, 3).join(', ')}...
                    </p>
                  )}
                </div>

                {/* Description */}
                <p className="text-slate-200 mb-8 max-w-2xl text-base leading-relaxed h-16 relative overflow-hidden">
                  {descriptionParts.map((part, index) => (
                    <span
                      key={index}
                      className={`absolute inset-0 transition-all duration-1000 ${currentTextIndex === index ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    >
                      {part}{descriptionParts.length > 1 ? '.' : ''}
                    </span>
                  ))}
                </p>

                {/* Action Buttons */}
                <div ref={buttonsRef} className="flex flex-wrap gap-4 items-center">
                  <button
                    onClick={(e) => {
                      handleButtonClick(e);
                      handlePlayTrailer();
                    }}
                    className="play-button action-button relative overflow-hidden flex items-center justify-center gap-2 px-8 py-4 rounded-lg
                             bg-[#FFD875] text-black font-bold text-lg
                             hover:shadow-[0_0_25px_rgba(255,216,117,0.6)]
                             transition-all duration-300 transform hover:scale-105"
                  >
                    <Play className="w-6 h-6" />
                    <span>Xem Trailer</span>
                  </button>

                  <div className="action-button">
                    <BookingTicketButton href={`/movies/${id}/showtimes`} />
                  </div>

                  <button
                    onClick={(e) => {
                      handleButtonClick(e);
                      setIsFavorite(!isFavorite);
                    }}
                    className={`favorite-button action-button relative overflow-hidden p-4 rounded-lg transition-all duration-300 ${isFavorite
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-slate-700 hover:bg-slate-600 text-white'
                      }`}
                  >
                    <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>

                  <button
                    onClick={(e) => {
                      handleButtonClick(e);
                      handleShare();
                    }}
                    className="action-button relative overflow-hidden p-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all duration-300"
                  >
                    <Share2 className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Related Movies Thumbnails */}
        {relatedMovies.length > 0 && (!isVideoPlaying || !isFullscreen) && (
          <div ref={thumbnailsRef} className="absolute bottom-[102px] right-8 z-20">
            <div className="flex space-x-2 max-w-2xl overflow-x-auto scrollbar-hide pr-16">
              {relatedMovies.slice(0, 6).map((movie, index) => (
                <button
                  key={movie.id}
                  onClick={() => handleThumbnailClick(movie)}
                  className="thumbnail-item group relative flex-shrink-0 w-28 h-16 rounded-lg overflow-hidden border-2 border-transparent bg-black/40 hover:border-yellow-400/70"
                >
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="w-full h-full object-cover object-center"
                  />
                  {/* Overlay khi hover */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Play className="w-5 h-5 text-yellow-400" />
                  </div>
                  {/* Tên phim (tooltip khi hover) */}
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    {movie.title}
                  </div>
                </button>
              ))}
              <div className="flex-shrink-0 w-28 h-16" />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MovieHero;

import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  StarIcon,
  ClockIcon,
  CalendarDaysIcon,
  PlayIcon,
  EyeIcon,
  FireIcon,
  SparklesIcon,
  TicketIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/solid";
import type { Movie } from "../types";
import TrailerModal from "./TrailerModal";
import { toast } from "react-hot-toast";

interface MovieCardProps {
  movie: Movie;
  showTrailer?: boolean;
  onTrailerClick?: (movie: Movie) => void;
  variant?: "default" | "compact" | "detailed" | "grid";
  showRank?: boolean;
  rank?: number;
  className?: string;
  lazy?: boolean;
}

const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  showTrailer = true,
  onTrailerClick,
  variant = "default",
  showRank = false,
  rank,
  className = "",
  lazy = true,
}) => {
  if (!movie) return null;

  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [viewCount, setViewCount] = useState(movie.views || 0);
  const [isIntersecting, setIsIntersecting] = useState(!lazy);

  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [lazy]);

  // Destructure movie properties with fallbacks
  const {
    id,
    title,
    englishTitle,
    originalTitle,
    poster,
    rating = 0,
    genre,
    genres = [],
    duration = "N/A",
    releaseDate,
    year,
    description = "",
    cast = [],
    director = "",
    ageRating = "T13",
    trailerUrl,
    isComingSoon = false,
    isHot = false,
    isNew = false,
    country = "",
    quality = "HD",
    subtitle = "Vietsub",
  } = movie;

  // Helper functions
  const truncatedDescription =
    description && description.length > 120
      ? description.slice(0, 120) + "..."
      : description || "Chưa có mô tả cho bộ phim này.";

  // Xử lý hiển thị diễn viên từ dữ liệu API
  const displayCast = (() => {
    if (Array.isArray(cast) && cast.length > 0) {
      return cast.slice(0, 3).join(", ");
    } else if (typeof cast === "string" && cast.trim() !== "") {
      return cast;
    } else {
      return "Đang cập nhật";
    }
  })();

  const displayGenres = genres.length > 0 ? genres : genre ? [genre] : ["Chưa phân loại"];

  const formatDate = (dateString: string) => {
    if (!dateString) return "Chưa xác định";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatViewCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const createSlug = (title: string) => {
    if (!title) return "";

    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim("-");
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 8.5) return "text-green-400 bg-green-900/50";
    if (rating >= 7.0) return "text-[#FFD875] bg-yellow-900/50";
    if (rating >= 5.0) return "text-orange-400 bg-orange-900/50";
    return "text-red-400 bg-red-900/50";
  };

  // Xử lý poster URL
  const getPosterUrl = () => {
    if (!poster) return "https://via.placeholder.com/300x450?text=No+Image";

    // Kiểm tra nếu poster là URL đầy đủ
    if (poster.startsWith("http://") || poster.startsWith("https://")) {
      return poster;
    }

    // Nếu là đường dẫn tương đối, thêm URL cơ sở
    return `${import.meta.env.VITE_API_URL || ""}${poster}`;
  };

  // Xử lý khi click vào card
  const handleCardClick = () => {
    navigate(`/movies/${id}/${createSlug(title)}`);
  };

  // Xử lý khi click vào nút trailer
  const handleTrailerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onTrailerClick) {
      onTrailerClick(movie);
    } else {
      setIsTrailerOpen(true);
    }
  };

  // Xử lý khi hình ảnh tải xong
  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  // Xử lý khi hình ảnh lỗi
  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  // Render different variants
  if (variant === "compact") {
    return (
      <div
        ref={cardRef}
        className={`movie-card-compact relative bg-slate-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.03] cursor-pointer ${className}`}
        onClick={handleCardClick}
      >
        <div className="flex items-center space-x-4 p-4">
          {/* Poster */}
          <div className="relative w-16 h-24 flex-shrink-0 overflow-hidden rounded-md">
            {isIntersecting ? (
              <img
                src={getPosterUrl()}
                alt={title}
                className={`w-full h-full object-cover ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                onLoad={handleImageLoad}
                onError={handleImageError}
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-gray-700" />
            )}
            {!imageLoaded && !imageError && <div className="absolute inset-0 bg-gray-700 animate-pulse" />}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white truncate">{title}</h3>
            <p className="text-xs text-gray-400 truncate">{displayGenres.join(", ")}</p>
            <div className="flex items-center space-x-2 mt-1">
              <StarIcon className="w-4 h-4 text-[#FFD875]" />
              <span className="text-sm text-gray-300">{rating}/5</span>
              <span className="text-xs text-gray-500">•</span>
              <span className="text-xs text-gray-500">{year || "N/A"}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <>
      {isTrailerOpen && trailerUrl && (
        <TrailerModal
          isOpen={isTrailerOpen}
          onClose={() => setIsTrailerOpen(false)}
          trailerUrl={trailerUrl}
          title={title}
        />
      )}

      <div
        ref={cardRef}
        className={`movie-card group relative bg-slate-800 rounded-lg overflow-hidden shadow-lg hover:shadow-yellow-500/20 transition-all duration-300 ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCardClick}
      >
        {/* Poster */}
        <div className="relative aspect-[2/3] bg-slate-900 overflow-hidden">
          {isIntersecting ? (
            <>
              <img
                ref={imageRef}
                src={getPosterUrl()}
                alt={title}
                className={`w-full h-full object-cover transition-all duration-500 ${
                  isHovered ? "scale-110 blur-sm brightness-50" : ""
                } ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                onLoad={handleImageLoad}
                onError={handleImageError}
                loading="lazy"
              />
              {imageError && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                  <div className="text-center p-4">
                    <div className="text-yellow-500 text-5xl mb-2">🎬</div>
                    <p className="text-gray-400 text-sm line-clamp-3">{title}</p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full bg-slate-800 animate-pulse" />
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col items-start space-y-2">
            {isComingSoon && (
              <div className="bg-purple-600 text-white px-2 py-1 rounded text-xs font-bold flex items-center space-x-1">
                <CalendarDaysIcon className="w-3 h-3" />
                <span>Sắp chiếu</span>
              </div>
            )}
            {isHot && (
              <div className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold flex items-center space-x-1">
                <FireIcon className="w-3 h-3" />
                <span>Hot</span>
              </div>
            )}
            {isNew && (
              <div className="bg-green-600 text-white px-2 py-1 rounded text-xs font-bold flex items-center space-x-1">
                <SparklesIcon className="w-3 h-3" />
                <span>Mới</span>
              </div>
            )}
          </div>

          {/* Hover Actions */}
          <div
            className={`absolute inset-0 flex flex-col items-center justify-center space-y-4 transition-opacity duration-300 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          >
            {showTrailer && trailerUrl && (
              <button
                onClick={handleTrailerClick}
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded-full flex items-center space-x-2 transition-all duration-300 transform hover:scale-105"
              >
                <PlayIcon className="w-5 h-5" />
                <span>Xem Trailer</span>
              </button>
            )}

            <Link
              to={`/movies/${id}/${createSlug(title)}`}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full flex items-center space-x-2 transition-all duration-300 transform hover:scale-105"
              onClick={(e) => e.stopPropagation()}
            >
              <TicketIcon className="w-5 h-5" />
              <span>Đặt vé</span>
            </Link>
          </div>

          <div className="absolute top-3 right-3 flex flex-col items-end space-y-2">
            {/* Rating */}
            <div
              className={`flex items-center space-x-1 px-2 py-1 rounded-full backdrop-blur-sm ${getRatingColor(
                rating
              )}`}
            >
              <StarIcon className="w-4 h-4" />
              <span className="text-sm font-semibold">{rating}/5</span>
            </div>

            {/* Quality & Subtitle */}
            <div className="flex space-x-1">
              <span className="bg-green-600 text-white px-2 py-0.5 rounded text-xs font-bold">{quality}</span>
              <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs font-bold">{subtitle}</span>
            </div>
          </div>

          {/* Bottom Info */}
          <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
            {/* Age Rating */}
            <div className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">{ageRating}</div>

            {/* View Count */}
            {viewCount > 0 && (
              <div className="flex items-center space-x-1 bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs">
                <EyeIcon className="w-3 h-3" />
                <span>{formatViewCount(viewCount)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Movie Info */}
        <div className="p-5 space-y-4">
          {/* Title */}
          <div className="block group-hover:text-yellow-400 transition-colors duration-300">
            <h3 className="font-bold text-xl line-clamp-2 text-white mb-2 leading-tight">{title}</h3>
            {(englishTitle || originalTitle) && (englishTitle || originalTitle) !== title && (
              <p className="text-sm text-gray-400 line-clamp-1 mb-2">{englishTitle || originalTitle}</p>
            )}
          </div>

          {/* Genres */}
          <div className="flex flex-wrap gap-2">
            {displayGenres.slice(0, 3).map((genreItem, index) => (
              <span
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(
                    `/genres/${
                      typeof genreItem === "string" ? genreItem.toLowerCase() : String(genreItem).toLowerCase()
                    }`
                  );
                }}
                className="genre-badge px-3 py-1 rounded-full text-xs bg-gradient-to-r from-gray-700 to-gray-600 text-gray-300 hover:from-yellow-600 hover:to-yellow-700 hover:text-black transition-all duration-300 cursor-pointer"
              >
                {genreItem}
              </span>
            ))}
          </div>

          {/* Movie Details */}
          <div className="space-y-2 text-sm text-gray-400">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ClockIcon className="w-4 h-4" />
                <span>{duration}</span>
              </div>

              {(releaseDate || year) && (
                <div className="flex items-center space-x-2">
                  <CalendarDaysIcon className="w-4 h-4" />
                  <span>{year || formatDate(releaseDate)}</span>
                </div>
              )}
            </div>

            {country && (
              <div className="text-xs text-gray-500">
                <span className="font-medium">Quốc gia: </span>
                <span>{country}</span>
              </div>
            )}
          </div>

          {/* Description */}
          {description && <p className="text-sm text-gray-400 line-clamp-3 leading-relaxed">{truncatedDescription}</p>}

          {/* Cast & Director */}
          {(displayCast !== "Đang cập nhật" || director) && (
            <div className="space-y-1 text-xs text-gray-500">
              {director && (
                <div>
                  <span className="font-medium">Đạo diễn: </span>
                  <span>{director}</span>
                </div>
              )}
              {displayCast !== "Đang cập nhật" && (
                <div>
                  <span className="font-medium">Diễn viên: </span>
                  <span>{displayCast}</span>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-center pt-2">
            <Link
              to={`/movies/${id}/${createSlug(title)}`}
              className="text-sm text-yellow-500 hover:text-yellow-400 font-medium flex items-center space-x-1 transition-colors duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <InformationCircleIcon className="w-4 h-4" />
              <span>Chi tiết</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default MovieCard;
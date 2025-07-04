import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  PlayIcon,
  StarIcon,
  ClockIcon
} from '@heroicons/react/24/solid';

// Tạo một interface cho phim trong component này
interface MovieItem {
  id: number | string;
  title: string;
  englishTitle: string;
  poster: string;
  backgroundImage?: string;
  rating: number;
  genre?: string;
  genres?: string[];
  duration: string;
  releaseDate: string;
  description: string;
  cast: string[];
  director: string;
  ageRating: string;
  trailerUrl?: string;
  isComingSoon?: boolean;
  country: string;
  language: string;
  reviews?: any[];
  gallery?: string[];
  year?: number;
  views?: number;
  isHot?: boolean;
  isNew?: boolean;
}

interface TheaterMovieSliderProps {
  movies: MovieItem[];
  onTrailerClick: (movie: MovieItem) => void;
}

const TheaterMovieSlider: React.FC<TheaterMovieSliderProps> = ({ movies, onTrailerClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const maxIndex = Math.max(0, movies.length - 4);

  // Ensure we have at least 4 movies for demo purposes
  const displayMovies = movies.length >= 4 ? movies : [
    ...movies,
    {
      id: "mock_1001",
      title: "Nhiệm Vụ Bất Khả Thi 8",
      englishTitle: "Mission: Impossible - The Final Reckoning",
      poster: "https://images.unsplash.com/photo-1489599735734-79b4fc8a1a64?w=300&h=450&fit=crop",
      rating: 7.5,
      year: 2025,
      duration: "2h 00m",
      genre: "Hành Động",
      genres: ["Hành Động", "Phiêu Lưu"],
      ageRating: "T16",
      views: 2500000,
      isHot: true,
      description: "Tom Cruise trở lại trong nhiệm vụ cuối cùng đầy kịch tính",
      trailerUrl: "https://www.youtube.com/embed/avz06PDqDbM",
      cast: ["Tom Cruise", "Hayley Atwell"],
      director: "Christopher McQuarrie",
      releaseDate: "2025-05-23",
      isComingSoon: false,
      country: "Mỹ",
      language: "Tiếng Anh",
      reviews: [],
      gallery: []
    },
    {
      id: "mock_1002",
      title: "Lilo & Stitch",
      englishTitle: "Lilo & Stitch",
      poster: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=450&fit=crop",
      rating: 7.8,
      year: 2025,
      duration: "1h 48m",
      genre: "Gia Đình",
      genres: ["Gia Đình", "Hoạt Hình"],
      ageRating: "T13",
      views: 1800000,
      isNew: true,
      description: "Câu chuyện cảm động về tình bạn giữa cô bé và sinh vật ngoài hành tinh",
      trailerUrl: "https://www.youtube.com/embed/2IPdHvvRyZM",
      cast: ["Maia Kealoha", "Sydney Agudong"],
      director: "Dean Fleischer Camp",
      releaseDate: "2025-05-23",
      isComingSoon: false,
      country: "Mỹ",
      language: "Tiếng Anh",
      reviews: [],
      gallery: []
    },
    {
      id: "mock_1003",
      title: "Bí Mật Kinh Hoàng",
      englishTitle: "Until Dawn",
      poster: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=450&fit=crop",
      rating: 8.2,
      year: 2025,
      duration: "1h 43m",
      genre: "Kinh Dị",
      genres: ["Kinh Dị", "Giật Gân"],
      ageRating: "T18",
      views: 3200000,
      isHot: true,
      description: "Nhóm bạn trẻ mắc kẹt trong một cabin trên núi phải đối mặt với những bí mật kinh hoàng",
      trailerUrl: "https://www.youtube.com/embed/4geJHc1GGmA",
      cast: ["Hayden Panettiere", "Peter Stormare"],
      director: "David Slade",
      releaseDate: "2025-03-15",
      isComingSoon: false,
      country: "Mỹ",
      language: "Tiếng Anh",
      reviews: [],
      gallery: []
    },
    {
      id: "mock_1004",
      title: "Yadang: Ba Mặt Lật Kèo",
      englishTitle: "Yadang: The Snitch",
      poster: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=450&fit=crop",
      rating: 8.9,
      year: 2025,
      duration: "2h 03m",
      genre: "Tội Phạm",
      genres: ["Tội Phạm", "Hành Động"],
      ageRating: "T13",
      views: 4100000,
      isHot: true,
      description: "Cuộc đối đầu gay cấn giữa cảnh sát và tội phạm trong thế giới ngầm",
      trailerUrl: "https://www.youtube.com/embed/6COmYeLsz4c",
      cast: ["Ma Dong Seok", "Kim Moo Yeol"],
      director: "Lee Hae Young",
      releaseDate: "2025-01-10",
      isComingSoon: false,
      country: "Hàn Quốc",
      language: "Tiếng Hàn",
      reviews: [],
      gallery: []
    }
  ].slice(0, 4 - movies.length);

  // Combine original movies with demo movies if needed
  const allMovies = [...movies, ...displayMovies].slice(0, 8);

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
    }, 5000);

    return () => clearInterval(interval);
  }, [maxIndex, hoveredIndex]);

  return (
    <div className="relative">
      {/* Slider container */}
      <div className="relative overflow-hidden" ref={sliderRef}>
        <div 
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * 25}%)` }}
        >
          {allMovies.map((movie, index) => (
            <div 
              key={`${movie.id}_${index}`} 
              className="w-1/4 flex-shrink-0 px-2"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="relative rounded-lg overflow-hidden group h-[400px]">
                {/* Movie poster */}
                <img 
                  src={movie.poster} 
                  alt={movie.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                {/* Age rating badge */}
                <div className="absolute top-3 left-3">
                  <span className={`
                    ${movie.ageRating === 'T13' ? 'bg-red-600' : 
                      movie.ageRating === 'T16' ? 'bg-red-700' : 
                      movie.ageRating === 'T18' ? 'bg-red-800' : 
                      'bg-green-600'} 
                    text-white px-2 py-1 rounded text-xs font-bold
                  `}>
                    {movie.ageRating}
                  </span>
                </div>

                {/* P.ĐỀ badge */}
                <div className="absolute top-3 right-3">
                  <span className="bg-slate-800/80 text-white px-2 py-1 rounded text-xs font-bold">
                    P.ĐỀ
                  </span>
                </div>
                
                {/* Hover overlay with info */}
                <div className={`absolute inset-0 bg-black/70 flex flex-col justify-between p-4 transition-opacity duration-300 ${hoveredIndex === index ? 'opacity-100' : 'opacity-0'}`}>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{movie.title}</h3>
                    <div className="flex items-center mb-3">
                      <StarIcon className="w-4 h-4 text-[#ffd875] mr-1" />
                      <span className="text-white text-sm">{movie.rating.toFixed(1)}</span>
                      <span className="mx-2 text-gray-400">•</span>
                      <ClockIcon className="w-4 h-4 text-[#ffd875] mr-1" />
                      <span className="text-white text-sm">{movie.duration}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {movie.genres?.slice(0, 2).map(genre => (
                        <span key={genre} className="bg-slate-700/80 text-gray-300 px-2 py-0.5 rounded-full text-xs">
                          {genre}
                        </span>
                      ))}
                    </div>
                    <p className="text-gray-300 text-sm line-clamp-3 mb-4">
                      {movie.description}
                    </p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Link 
                      to={`/movie/${movie.id}`} 
                      className="flex-1 bg-[#ffd875] hover:bg-[#ffcf5c] text-black font-medium py-2 px-4 rounded text-center text-sm transition-colors"
                    >
                      Chi tiết
                    </Link>
                    <button
                      onClick={() => onTrailerClick(movie)}
                      className="flex items-center justify-center bg-slate-700/80 hover:bg-slate-600 text-white py-2 px-4 rounded transition-colors"
                    >
                      <PlayIcon className="w-4 h-4 mr-1" />
                      <span className="text-sm">Trailer</span>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Movie info below poster (visible when not hovering) */}
              <div className={`mt-2 transition-opacity duration-300 ${hoveredIndex === index ? 'opacity-0' : 'opacity-100'}`}>
                <h3 className="text-white font-medium text-base truncate">{movie.title}</h3>
                <div className="flex items-center text-sm text-gray-400">
                  <span>{movie.year}</span>
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
  );
};

export default TheaterMovieSlider; 
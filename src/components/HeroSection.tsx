import React from 'react';
import { Play, Calendar, Clock, Star } from 'lucide-react';

interface MovieHeroProps {
  title: string;
  rating: number;
  duration: string;
  releaseDate: string;
  description: string;
  backgroundImage: string;
}

const MovieHero: React.FC<MovieHeroProps> = ({
  title,
  rating,
  duration,
  releaseDate,
  description,
  backgroundImage
}) => {
  return (
    <div className="relative h-screen overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${backgroundImage})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center h-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl">
            {/* Movie Title */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              {title}
            </h1>

            {/* Movie Info */}
            <div className="flex items-center space-x-6 mb-6">
              <div className="flex items-center space-x-1">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="text-yellow-400 font-semibold text-lg">{rating}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <Clock className="w-5 h-5" />
                <span>{duration}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <Calendar className="w-5 h-5" />
                <span>{releaseDate}</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-300 text-lg leading-relaxed mb-8 max-w-xl">
              {description}
            </p>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105">
                <Play className="w-5 h-5" />
                <span>Xem Trailer</span>
              </button>
              <button className="flex items-center space-x-2 bg-transparent border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black px-6 py-3 rounded-lg font-semibold transition-all duration-300">
                <span>Đặt Vé Ngay</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default MovieHero;

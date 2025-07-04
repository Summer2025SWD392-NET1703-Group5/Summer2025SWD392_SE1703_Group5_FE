// components/TouchFriendlyShowtimes.tsx
import React, { useState } from 'react';
import { Clock, Users, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Cinema } from '../types/cinema';
import type { Showtime } from '../types/cinema';

interface TouchFriendlyShowtimesProps {
  cinema: Cinema;
  showtimes: Showtime[];
}

const TouchFriendlyShowtimes: React.FC<TouchFriendlyShowtimesProps> = ({ cinema, showtimes }) => {
  const [expandedMovies, setExpandedMovies] = useState<Set<number>>(new Set());

  const toggleMovie = (movieId: number) => {
    const newExpanded = new Set(expandedMovies);
    if (newExpanded.has(movieId)) {
      newExpanded.delete(movieId);
    } else {
      newExpanded.add(movieId);
    }
    setExpandedMovies(newExpanded);
  };

  const sampleMovies = [
    { id: 1, title: "Avengers: Endgame" },
    { id: 2, title: "Top Gun: Maverick" },
    { id: 3, title: "Avatar: The Way of Water" },
    { id: 4, title: "Spider-Man: No Way Home" }
  ];

  return (
    <div className="md:hidden">
      <div className="bg-slate-800 rounded-lg overflow-hidden mb-4">
        {/* Cinema Header */}
        <div className="p-4 border-b border-slate-700">
          <h3 className="text-lg font-bold text-white mb-1">{cinema.name}</h3>
          <div className="flex items-center text-slate-400 text-sm">
            <Star className="w-4 h-4 mr-1 text-yellow-500" />
            <span>{cinema.rating} • {cinema.screens} phòng</span>
          </div>
        </div>

        {/* Movies */}
        {sampleMovies.map(movie => {
          const movieShowtimes = showtimes.filter(s => s.movieId === movie.id);
          if (movieShowtimes.length === 0) return null;

          const isExpanded = expandedMovies.has(movie.id);

          return (
            <div key={movie.id} className="border-b border-slate-700 last:border-b-0">
              <button
                onClick={() => toggleMovie(movie.id)}
                className="w-full p-4 text-left flex items-center justify-between hover:bg-slate-750 transition-colors"
              >
                <div>
                  <h4 className="text-white font-medium">{movie.title}</h4>
                  <p className="text-slate-400 text-sm">{movieShowtimes.length} suất chiếu</p>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </button>

              {isExpanded && (
                <div className="px-4 pb-4">
                  <div className="grid grid-cols-2 gap-3">
                    {movieShowtimes.map(showtime => (
                      <Link
                        key={showtime.id}
                        to={`/booking?showtime=${showtime.id}`}
                        className="block bg-slate-700 hover:bg-slate-600 rounded-lg p-3 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-white font-bold">
                            {showtime.time}
                          </div>
                          <div className="text-xs bg-yellow-600 text-white px-2 py-1 rounded">
                            {showtime.format}
                          </div>
                        </div>
                        
                        <div className="text-slate-400 text-xs mb-2">
                          Phòng {showtime.screenNumber} • {showtime.language}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-yellow-500 font-semibold text-sm">
                            {showtime.prices.standard.toLocaleString('vi-VN')}đ
                          </div>
                          <div className="flex items-center text-xs text-slate-400">
                            <Users className="w-3 h-3 mr-1" />
                            <span>{showtime.availableSeats}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TouchFriendlyShowtimes;

// src/components/admin/widgets/PopularMoviesWidget.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { FilmIcon } from '@heroicons/react/24/outline';

interface Movie {
  id: string;
  title: string;
  revenue: number;
  bookings: number;
  rating: number;
}

interface PopularMoviesWidgetProps {
  movies: Movie[];
}

const PopularMoviesWidget: React.FC<PopularMoviesWidgetProps> = ({ movies }) => {
  return (
    <motion.div
      className="p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <FilmIcon className="w-6 h-6 text-[#FFD875]" />
        <h3 className="text-xl font-bold text-[#FFD875]">Phim phổ biến</h3>
      </div>
      <div className="space-y-3">
        {movies.slice(0, 5).map((movie, index) => (
          <div key={movie.id} className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg">
            <div className="w-8 h-8 bg-[#FFD875] rounded-full flex items-center justify-center text-black font-bold">
              {index + 1}
            </div>
            <div className="flex-1">
              <h4 className="text-white font-medium">{movie.title}</h4>
              <p className="text-slate-400 text-sm">{movie.bookings} đặt vé</p>
            </div>
            <div className="text-right">
              <p className="text-[#FFD875] font-bold">⭐ {movie.rating}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default PopularMoviesWidget;

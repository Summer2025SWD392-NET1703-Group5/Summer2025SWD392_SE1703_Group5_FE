// components/TrailerModal.tsx - Auto Full Screen Version
import React, { useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { Movie } from '../types';

interface TrailerModalProps {
  movie: Movie;
  onClose: () => void;
}

const TrailerModal: React.FC<TrailerModalProps> = ({ movie, onClose }) => {
  // Ngăn scroll khi modal mở
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  // Xử lý đóng modal khi click bên ngoài hoặc nhấn ESC
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
            onClose();
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, [onClose]);

  // Xử lý click vào backdrop
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-5xl">
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-[#ffd875] transition-colors p-2 rounded-full bg-gray-800/50"
          aria-label="Đóng"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
        
        <div className="bg-gray-900 rounded-xl overflow-hidden">
          <div className="aspect-video">
          <iframe
              src={movie.trailerUrl}
              title={`${movie.title} Trailer`}
              className="w-full h-full"
            allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            ></iframe>
        </div>

          <div className="p-4 border-t border-gray-800">
            <h3 className="text-xl font-medium text-white">{movie.title} - Trailer</h3>
            <p className="text-gray-400 text-sm mt-1">
              {movie.director} | {movie.duration} | {movie.genres.join(', ')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrailerModal;

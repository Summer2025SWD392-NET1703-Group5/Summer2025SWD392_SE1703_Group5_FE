import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon 
} from '@heroicons/react/24/outline';
import type { ImageGalleryProps } from '../types';

const ImageGallery: React.FC<ImageGalleryProps> = ({ 
  images, 
  movieTitle, 
  onClose 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Ngăn scroll khi gallery mở
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  // Xử lý đóng gallery khi nhấn ESC
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

  // Xử lý điều hướng bằng phím mũi tên
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        goToPrevious();
      } else if (event.key === 'ArrowRight') {
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentIndex]);

  // Xử lý click vào backdrop
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Chuyển đến ảnh trước
  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  // Chuyển đến ảnh tiếp theo
  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div 
      className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-4 animate-fadeIn"
      onClick={handleBackdropClick}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent z-10">
        <h2 className="text-white font-medium">
          {movieTitle} - Ảnh {currentIndex + 1}/{images.length}
        </h2>
        <button
          onClick={onClose}
          className="text-white hover:text-[#ffd875] transition-colors p-2 rounded-full"
          aria-label="Đóng"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Main image */}
      <div className="relative w-full h-full flex items-center justify-center">
        <img
          src={images[currentIndex]}
          alt={`${movieTitle} - Ảnh ${currentIndex + 1}`}
          className="max-h-[80vh] max-w-full object-contain"
        />
      </div>

      {/* Navigation buttons */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
        aria-label="Ảnh trước"
      >
        <ChevronLeftIcon className="w-6 h-6" />
      </button>

      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
        aria-label="Ảnh tiếp theo"
      >
        <ChevronRightIcon className="w-6 h-6" />
      </button>

      {/* Thumbnails */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        <div className="flex justify-center gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-16 h-16 flex-shrink-0 rounded-md overflow-hidden transition-all ${
                index === currentIndex 
                  ? 'border-2 border-[#ffd875] scale-110' 
                  : 'border border-gray-700 opacity-60 hover:opacity-100'
              }`}
            >
              <img
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageGallery;


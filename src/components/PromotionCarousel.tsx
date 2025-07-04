import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/solid';

// Define interfaces
interface Promotion {
  id: number;
  title: string;
  code: string;
  discount: string;
  description: string;
  endDate: string;
  imageUrl: string;
  conditions?: string;
}

interface PromotionCarouselProps {
  promotions: Promotion[];
  loading?: boolean;
}

const PromotionCarousel: React.FC<PromotionCarouselProps> = ({ promotions, loading = false }) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [copiedCode, setCopiedCode] = useState<number | null>(null);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);

  // Handle auto-scrolling
  useEffect(() => {
    if (loading || isPaused || promotions.length <= 3) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % Math.max(1, promotions.length - 2));
    }, 4000);

    return () => clearInterval(interval);
  }, [loading, isPaused, promotions.length]);

  // Handle manual navigation
  const handlePrev = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => Math.min(promotions.length - 3, prev + 1));
  };

  // Handle copy promotion code
  const handleCopyCode = (code: string, id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code)
      .then(() => {
        setCopiedCode(id);
        setTimeout(() => setCopiedCode(null), 2000);
      })
      .catch(err => {
        console.error('Failed to copy code: ', err);
      });
  };

  // Handle promotion detail view
  const handlePromotionClick = (promotion: Promotion) => {
    setSelectedPromotion(promotion);
  };

  // Close promotion detail modal
  const closeModal = () => {
    setSelectedPromotion(null);
  };

  if (loading) {
    return (
      <div className="w-full h-64 flex justify-center items-center">
        <div className="w-12 h-12 border-4 border-[#FFD875] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="relative px-4 md:px-8">
      {/* Navigation buttons */}
      <button
        onClick={handlePrev}
        disabled={currentIndex === 0}
        className={`absolute top-1/2 left-2 z-10 p-2 rounded-full bg-black/60 backdrop-blur-sm border border-[#FFD875]/30 shadow-[0_0_15px_rgba(255,216,117,0.3)] hover:shadow-[0_0_20px_rgba(255,216,117,0.5)] transition-all duration-300 transform -translate-y-1/2 ${currentIndex === 0 ? 'text-gray-500 cursor-not-allowed' : 'text-[#FFD875] hover:text-white'}`}
        aria-label="Previous"
      >
        <ArrowLeftIcon className="w-5 h-5" />
      </button>
      
      <button
        onClick={handleNext}
        disabled={currentIndex >= promotions.length - 3}
        className={`absolute top-1/2 right-2 z-10 p-2 rounded-full bg-black/60 backdrop-blur-sm border border-[#FFD875]/30 shadow-[0_0_15px_rgba(255,216,117,0.3)] hover:shadow-[0_0_20px_rgba(255,216,117,0.5)] transition-all duration-300 transform -translate-y-1/2 ${currentIndex >= promotions.length - 3 ? 'text-gray-500 cursor-not-allowed' : 'text-[#FFD875] hover:text-white'}`}
        aria-label="Next"
      >
        <ArrowRightIcon className="w-5 h-5" />
      </button>

      {/* Carousel container */}
      <div 
        ref={carouselRef}
        className="w-full overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div 
          className="flex transition-transform duration-700 ease-in-out gap-4"
          style={{ transform: `translateX(-${currentIndex * (320 + 16)}px)` }}
        >
          {promotions.map((promotion) => (
            <div 
              key={promotion.id}
              className="flex-shrink-0 w-[320px] h-[180px] rounded-lg relative overflow-hidden group cursor-pointer border border-[#FFD875]/30 hover:border-[#FFD875] transition-all duration-300 shadow-[0_0_15px_rgba(0,0,0,0.3)] hover:shadow-[0_0_25px_rgba(255,216,117,0.2)]"
              onClick={() => handlePromotionClick(promotion)}
            >
              {/* Background image with overlay */}
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-all duration-300"></div>
              <img 
                src={promotion.imageUrl} 
                alt={promotion.title} 
                className="w-full h-full object-cover opacity-75 group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              
              {/* Content overlay */}
              <div className="absolute inset-0 p-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-white font-bold text-lg line-clamp-1 group-hover:text-[#FFD875] transition-colors duration-300">
                    {promotion.title}
                  </h3>
                  <p className="text-gray-300 text-sm line-clamp-2 mt-1">
                    {promotion.description}
                  </p>
                </div>
                
                <div className="mt-auto">
                  <div className="flex items-center justify-between">
                    <span className="bg-[#FFD875] text-black font-bold px-3 py-1 rounded-md shadow-[0_0_10px_rgba(255,216,117,0.5)] animate-pulse">
                      {promotion.discount}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <button
                          onClick={(e) => handleCopyCode(promotion.code, promotion.id, e)}
                          className="flex items-center bg-black/70 px-3 py-1 rounded-md border border-[#FFD875]/50 hover:bg-black/90 transition-colors"
                        >
                          <span className="text-[#FFD875] font-mono mr-2">{promotion.code}</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                          </svg>
                        </button>
                        {copiedCode === promotion.id && (
                          <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs py-1 px-2 rounded opacity-100 transition-opacity">
                            Đã sao chép!
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 mt-2">
                    Hết hạn: {promotion.endDate}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination dots */}
      <div className="flex justify-center mt-4 space-x-2">
        {Array.from({ length: Math.max(1, promotions.length - 2) }).map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'bg-[#FFD875] w-4 shadow-[0_0_10px_rgba(255,216,117,0.7)]' 
                : 'bg-gray-600 hover:bg-gray-400'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Promotion Detail Modal */}
      {selectedPromotion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={closeModal}>
          <div 
            className="relative w-full max-w-2xl max-h-[80vh] overflow-y-auto bg-black border border-[#FFD875]/30 rounded-lg shadow-[0_0_30px_rgba(255,216,117,0.2)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-48 overflow-hidden">
              <img 
                src={selectedPromotion.imageUrl} 
                alt={selectedPromotion.title} 
                className="w-full h-full object-cover object-center opacity-70"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
              <button 
                onClick={closeModal}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/70 text-white hover:text-[#FFD875] transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <h2 className="text-2xl font-bold text-[#FFD875] mb-2">{selectedPromotion.title}</h2>
              <div className="mb-6">
                <span className="inline-block bg-[#FFD875] text-black font-bold px-3 py-1 rounded-md shadow-[0_0_10px_rgba(255,216,117,0.5)] mb-4">
                  {selectedPromotion.discount}
                </span>
                <p className="text-gray-300 mb-4">{selectedPromotion.description}</p>
                {selectedPromotion.conditions && (
                  <div className="mb-4">
                    <h3 className="text-white font-semibold mb-2">Điều kiện áp dụng:</h3>
                    <p className="text-gray-400 text-sm">{selectedPromotion.conditions}</p>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-400">
                    Hết hạn: {selectedPromotion.endDate}
                  </div>
                  <div>
                    <button
                      onClick={(e) => handleCopyCode(selectedPromotion.code, selectedPromotion.id, e)}
                      className="flex items-center bg-black/70 px-3 py-2 rounded-md border border-[#FFD875]/50 hover:bg-black/90 transition-colors"
                    >
                      <span className="text-[#FFD875] font-mono mr-2">{selectedPromotion.code}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                        <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center">
                <button 
                  className="px-6 py-2 bg-[#FFD875] text-black rounded-md font-semibold hover:bg-opacity-90 transition-all duration-300 shadow-[0_0_15px_rgba(255,216,117,0.4)] hover:shadow-[0_0_20px_rgba(255,216,117,0.6)]"
                  onClick={closeModal}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromotionCarousel; 
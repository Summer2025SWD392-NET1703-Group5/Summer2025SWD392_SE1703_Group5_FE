import React from 'react';
import { FilmIcon } from '@heroicons/react/24/solid';

interface FullScreenLoaderProps {
  variant?: 'fullscreen' | 'inline';
  size?: 'small' | 'medium' | 'large';
  text?: string;
}

const FullScreenLoader: React.FC<FullScreenLoaderProps> = ({ 
  variant = 'fullscreen',
  size = 'medium',
  text
}) => {
  // Size classes for different variants
  const sizeClasses = {
    small: variant === 'fullscreen' ? 'w-16 h-16 border-4' : 'w-5 h-5 border-2',
    medium: variant === 'fullscreen' ? 'w-20 h-20 border-4' : 'w-8 h-8 border-2',
    large: variant === 'fullscreen' ? 'w-24 h-24 border-4' : 'w-12 h-12 border-3',
  };

  const iconSizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8',
  };

  if (variant === 'inline') {
    return (
      <div className="flex flex-col items-center justify-center py-4">
        <div className="relative">
          <div 
            className={`glowing-spinner ${sizeClasses[size]}`}
            style={{
              border: '4px solid #FFD875',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              boxShadow: '0 0 10px #FFD875, inset 0 0 5px #FFD875'
            }}
          />
          <FilmIcon className={`${iconSizeClasses[size]} text-[#FFD875] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`} />
        </div>
        {text && <p className="mt-2 text-[#FFD875] font-medium">{text}</p>}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center z-[9999]">
      <style>
        {`
          .glowing-spinner {
            border-radius: 50%;
            border: 4px solid #FFD875;
            border-top-color: transparent;
            animation: spin 1s linear infinite;
            box-shadow: 0 0 20px #FFD875, inset 0 0 10px #FFD875;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
      
      <div className="relative mb-8">
        <div className={`glowing-spinner ${sizeClasses[size]}`}></div>
        <FilmIcon className={`${iconSizeClasses[size]} text-[#FFD875] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`} />
      </div>

      <div className="text-center">
        <h1 className="text-3xl font-bold text-white tracking-wider">
          GALAXY CINEMA
        </h1>
        <p className="text-[#FFD875] text-lg mt-1">
          {text || 'vũ trụ điện ảnh'}
        </p>
      </div>
    </div>
  );
};

export default FullScreenLoader; 
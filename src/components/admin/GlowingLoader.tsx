import React from 'react';
import FullScreenLoader from '../FullScreenLoader';

interface GlowingLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const GlowingLoader: React.FC<GlowingLoaderProps> = ({ 
  size = 'md', 
  text 
}) => {
  // Map kích thước để tương thích với FullScreenLoader
  const sizeMap: Record<string, 'small' | 'medium' | 'large'> = {
    sm: 'small',
    md: 'medium',
    lg: 'large'
  };

  return <FullScreenLoader variant="inline" size={sizeMap[size]} text={text} />;
};

export default GlowingLoader; 
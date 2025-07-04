import React from 'react';
import FullScreenLoader from './FullScreenLoader';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string; // giữ tương thích ngược
  text?: string;
  className?: string; // thêm className cho tương thích ngược
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = '#FFD875', // không sử dụng
  text,
  className
}) => {
  return <FullScreenLoader variant="inline" size={size} text={text} />;
};

export default LoadingSpinner;
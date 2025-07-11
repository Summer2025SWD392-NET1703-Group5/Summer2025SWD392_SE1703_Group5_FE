import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = '#FFD875'
}) => {
  const sizeClasses = {
    small: 'h-5 w-5 border-2',
    medium: 'h-8 w-8 border-2',
    large: 'h-12 w-12 border-3',
  };

  return (
    <div
      className={`animate-spin rounded-full ${sizeClasses[size]} border-t-transparent border-b-transparent`}
      style={{ borderColor: color }}
    />
  );
};

export default LoadingSpinner;

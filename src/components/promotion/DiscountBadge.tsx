import React from 'react';

interface DiscountBadgeProps {
  type: string;
  value: number;
}

export const DiscountBadge: React.FC<DiscountBadgeProps> = ({ type, value }) => {
  const getDiscountText = () => {
    if (type.toLowerCase() === 'percentage' || type === 'Percentage') {
      return `Giảm ${value}%`;
    } else if (type.toLowerCase() === 'fix' || type === 'Fix' || type === 'Fixed') {
      return `Giảm ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)}`;
    } else {
      return `Giảm ${value}`;
    }
  };

  const getBadgeColor = () => {
    if (type.toLowerCase() === 'percentage' || type === 'Percentage') {
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    } else if (type.toLowerCase() === 'fix' || type === 'Fix' || type === 'Fixed') {
      return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    } else {
      return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    }
  };

  return (
    <div className={`px-3 py-1.5 rounded-lg text-sm font-medium border inline-block ${getBadgeColor()}`}>
      {getDiscountText()}
    </div>
  );
}; 
import React from 'react';
import { motion } from 'framer-motion';

interface UsageProgressBarProps {
  currentUsage: number;
  usageLimit: number;
  className?: string;
}

export const UsageProgressBar: React.FC<UsageProgressBarProps> = ({
  currentUsage,
  usageLimit,
  className = ''
}) => {
  const percentage = usageLimit > 0 ? (currentUsage / usageLimit) * 100 : 0;
  const remainingUsage = Math.max(0, usageLimit - currentUsage);

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Usage Stats */}
      <div className="flex justify-between text-sm">
        <span className="text-gray-400">
          Đã sử dụng: {currentUsage}/{usageLimit}
        </span>
        <span className="text-gray-400">
          Còn lại: {remainingUsage}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${
            percentage >= 90 
              ? 'bg-red-500' 
              : percentage >= 70 
                ? 'bg-yellow-500' 
                : 'bg-green-500'
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percentage, 100)}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>

      {/* Percentage Text */}
      <div className="text-center">
        <span className={`text-xs font-medium ${
          percentage >= 90 
            ? 'text-red-400' 
            : percentage >= 70 
              ? 'text-yellow-400' 
              : 'text-green-400'
        }`}>
          {percentage.toFixed(1)}% đã sử dụng
        </span>
      </div>
    </div>
  );
};

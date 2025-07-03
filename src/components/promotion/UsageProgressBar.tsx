import React from 'react';
import { motion } from 'framer-motion';
import { TicketIcon } from '@heroicons/react/24/outline';

interface UsageProgressBarProps {
  currentUsage: number;
  usageLimit: number;
}

export const UsageProgressBar: React.FC<UsageProgressBarProps> = ({ currentUsage, usageLimit }) => {
  // Fix logic for calculating percentage
  const calculatePercentage = () => {
    if (!usageLimit || usageLimit === 0) {
      return 100; // If no limit, consider as fully used
    }
    if (currentUsage >= usageLimit) {
      return 100; // If used >= limit, show 100%
    }
    const calc = Math.min((currentUsage / usageLimit) * 100, 100);
    return calc;
  };
  
  const percentage = calculatePercentage();
  const remainingUsage = Math.max(usageLimit - currentUsage, 0);
  
  // Determine color based on usage percentage
  const getProgressColor = () => {
    if (percentage >= 90) return 'from-red-500 to-red-600';
    if (percentage >= 70) return 'from-orange-500 to-orange-600';
    if (percentage >= 50) return 'from-yellow-500 to-yellow-600';
    return 'from-green-500 to-green-600';
  };

  const getBackgroundColor = () => {
    if (percentage >= 90) return 'bg-red-500/10';
    if (percentage >= 70) return 'bg-orange-500/10';
    if (percentage >= 50) return 'bg-yellow-500/10';
    return 'bg-green-500/10';
  };

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center text-xs text-gray-400">
          <TicketIcon className="w-4 h-4 mr-2 text-[#ffd875]" />
          <span>Mức sử dụng</span>
        </div>
        <div className="text-xs text-gray-400">
          {currentUsage}/{usageLimit}
        </div>
      </div>
      
      {/* Progress Bar Container */}
      <div className={`relative w-full h-3 ${getBackgroundColor()} rounded-full overflow-hidden border border-slate-600/30`}>
        {/* Progress Bar Fill */}
        <motion.div
          className={`h-full bg-gradient-to-r ${getProgressColor()} relative overflow-hidden`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ 
            duration: 1.5, 
            ease: "easeOut",
            delay: 0.3 
          }}
        >
          {/* Shimmer effect - only show if not 100% */}
          {percentage < 100 && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{ x: ["-100%", "100%"] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
                delay: 1.8
              }}
              style={{ width: "50%" }}
            />
          )}
        </motion.div>
        
        {/* Percentage Text Overlay */}
        <motion.div 
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <span className="text-xs font-bold text-white drop-shadow-lg">
            {Math.round(percentage)}%
          </span>
        </motion.div>
      </div>
      
      {/* Status Text */}
      <motion.div 
        className="flex justify-between items-center mt-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <span className={`text-xs font-medium ${
          percentage >= 100 ? 'text-red-400' :
          percentage >= 90 ? 'text-red-400' :
          percentage >= 70 ? 'text-orange-400' :
          percentage >= 50 ? 'text-yellow-400' :
          'text-green-400'
        }`}>
          {percentage >= 100 ? 'Đã hết lượt' : 
           percentage >= 90 ? 'Gần hết lượt' :
           percentage >= 70 ? 'Sắp hết' :
           'Còn nhiều lượt'}
        </span>
        
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          remainingUsage === 0 ? 'bg-red-500/20 text-red-400' :
          remainingUsage <= 5 ? 'bg-orange-500/20 text-orange-400' :
          remainingUsage <= 10 ? 'bg-yellow-500/20 text-yellow-400' :
          'bg-green-500/20 text-green-400'
        }`}>
          Còn lại: {remainingUsage}
        </span>
      </motion.div>
    </div>
  );
}; 
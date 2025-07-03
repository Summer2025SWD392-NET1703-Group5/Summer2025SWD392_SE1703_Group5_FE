import React, { useState, useEffect } from 'react';
import { ClockIcon } from '@heroicons/react/24/outline';

interface CountdownTimerProps {
  initialTime?: number; // thời gian tính bằng giây
  onTimeout?: () => void;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ 
  initialTime = 600, // mặc định 10 phút
  onTimeout 
}) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    // Nếu thời gian đã hết, gọi callback onTimeout
    if (timeLeft <= 0) {
      if (onTimeout) {
        onTimeout();
      }
      return;
    }

    // Thiết lập interval để giảm thời gian mỗi giây
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    // Cleanup interval khi component unmount
    return () => clearInterval(timer);
  }, [timeLeft, onTimeout]);

  // Chuyển đổi số giây thành phút:giây
  const formatTime = (seconds: number) => {
    if (seconds <= 0) return '00:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Tính phần trăm thời gian còn lại
  const percentageLeft = (timeLeft / initialTime) * 100;

  // Xác định màu sắc dựa trên thời gian còn lại
  const getColorClass = () => {
    if (percentageLeft > 50) return 'text-green-400';
    if (percentageLeft > 20) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <div className="glass-dark rounded-lg px-4 py-2 border border-gray-700/50 flex items-center">
      <ClockIcon className={`w-5 h-5 mr-2 ${getColorClass()}`} />
      <div className="flex flex-col">
        <span className={`font-medium ${getColorClass()}`}>{formatTime(timeLeft)}</span>
        <span className="text-xs text-gray-400">Thời gian giữ ghế</span>
      </div>
    </div>
  );
};

export default CountdownTimer; 
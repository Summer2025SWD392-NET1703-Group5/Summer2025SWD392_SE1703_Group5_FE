import React from 'react';
import { ClockIcon } from '@heroicons/react/24/outline';
import { useCountdown } from '../hooks/useCountdown';

interface UnifiedCountdownTimerProps {
  bookingId: number;
  showtimeId: number;
  createdAt?: string; // Để đồng bộ với server time
  onTimeout?: () => void;
  className?: string;
}

/**
 * Component CountdownTimer thống nhất sử dụng countdown service
 * Đảm bảo đồng bộ giữa PaymentComponent và BookingHistory
 */
const UnifiedCountdownTimer: React.FC<UnifiedCountdownTimerProps> = ({
  bookingId,
  showtimeId,
  createdAt,
  onTimeout,
  className = ''
}) => {
  // Sử dụng hook countdown thống nhất
  const { timeLeft, isExpired, formattedTime } = useCountdown({
    bookingId,
    showtimeId,
    duration: 5 * 60, // 5 phút
    onTimeout,
    autoStart: true
  });

  // Nếu đã hết hạn, không hiển thị gì
  if (isExpired) {
    return null;
  }

  // Xác định màu sắc dựa trên thời gian còn lại
  const getTimerColor = () => {
    if (timeLeft <= 60) { // < 1 phút
      return 'text-red-400';
    } else if (timeLeft <= 120) { // < 2 phút
      return 'text-yellow-400';
    }
    return 'text-[#FFD875]';
  };

  const getBackgroundColor = () => {
    if (timeLeft <= 60) {
      return 'bg-red-500/10 border-red-500/30';
    } else if (timeLeft <= 120) {
      return 'bg-yellow-500/10 border-yellow-500/30';
    }
    return 'bg-[#FFD875]/10 border-[#FFD875]/30';
  };

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${getBackgroundColor()} ${className}`}>
      <ClockIcon className={`w-4 h-4 ${getTimerColor()}`} />
      <span className={`text-sm font-mono font-semibold ${getTimerColor()}`}>
        {formattedTime}
      </span>
      <span className="text-xs text-gray-400">còn lại</span>
    </div>
  );
};

export default UnifiedCountdownTimer;

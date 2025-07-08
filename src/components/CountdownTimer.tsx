import React, { useState, useEffect, useCallback } from 'react';
import { ClockIcon } from '@heroicons/react/24/outline';

interface CountdownTimerProps {
  bookingId: number;
  showtimeId?: number;
  selectedSeats?: string;
  createdAt?: string;
  onTimeout?: () => void;
  className?: string;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  bookingId,
  showtimeId,
  selectedSeats,
  createdAt,
  onTimeout,
  className = ''
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isExpired, setIsExpired] = useState<boolean>(false);

  // Tạo session key tương tự như PaymentPage
  const createSessionKey = useCallback(() => {
    if (showtimeId && selectedSeats) {
      return `payment_timer_${showtimeId}_${selectedSeats.replace(/,/g, '_')}`;
    }
    // Fallback sử dụng selectedSeats và bookingId
    if (selectedSeats) {
      return `payment_timer_${bookingId}_${selectedSeats.replace(/,/g, '_')}`;
    }
    // Fallback cuối cùng nếu không có đủ thông tin
    return `payment_timer_booking_${bookingId}`;
  }, [showtimeId, selectedSeats, bookingId]);

  // Tính toán thời gian còn lại
  const calculateTimeLeft = useCallback(() => {
    const sessionKey = createSessionKey();

    // Kiểm tra session storage trước (ưu tiên cho đồng bộ với PaymentPage)
    let startTimestamp = sessionStorage.getItem(sessionKey);

    if (!startTimestamp) {
      // Nếu không có session timer, có nghĩa là chưa có ai vào PaymentPage
      // Trong trường hợp này, chỉ hiển thị timer nếu booking vừa được tạo (< 5 phút)
      if (createdAt) {
        const createdTime = new Date(createdAt).getTime();
        const now = Date.now();
        const elapsed = Math.floor((now - createdTime) / 1000);
        const remaining = Math.max(0, (5 * 60) - elapsed);

        // Chỉ hiển thị timer nếu booking còn trong thời hạn 5 phút
        if (remaining > 0) {
          console.log(`Booking ${bookingId} - Tạo từ ${elapsed}s trước, còn lại: ${remaining}s`);
          return remaining;
        } else {
          console.log(`Booking ${bookingId} - Đã quá hạn 5 phút, không hiển thị timer`);
          return 0;
        }
      }

      console.warn(`Không tìm thấy timestamp cho booking ${bookingId}`);
      return 0;
    }

    // Nếu có session timer, tính từ session timestamp
    const now = Date.now();
    const elapsed = Math.floor((now - parseInt(startTimestamp)) / 1000);
    const remaining = Math.max(0, (5 * 60) - elapsed); // 5 phút

    console.log(`Booking ${bookingId} - Session timer: ${elapsed}s đã trôi qua, còn lại: ${remaining}s`);
    return remaining;
  }, [createSessionKey, createdAt, bookingId]);

  // Format thời gian thành MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Khởi tạo và cập nhật timer
  useEffect(() => {
    console.log(`Khởi tạo countdown timer cho booking ${bookingId}`);
    
    // Tính toán thời gian ban đầu
    const initialTimeLeft = calculateTimeLeft();
    setTimeLeft(initialTimeLeft);
    
    // Nếu đã hết thời gian
    if (initialTimeLeft <= 0) {
      setIsExpired(true);
      console.log(`Booking ${bookingId} đã hết hạn`);
      if (onTimeout) {
        onTimeout();
      }
      return;
    }

    // Thiết lập interval để cập nhật mỗi giây
    const timer = setInterval(() => {
      const currentTimeLeft = calculateTimeLeft();
      setTimeLeft(currentTimeLeft);
      
      if (currentTimeLeft <= 0) {
        setIsExpired(true);
        clearInterval(timer);
        
        // Xóa session khi hết thời gian
        const sessionKey = createSessionKey();
        sessionStorage.removeItem(sessionKey);
        console.log(`Timer hết hạn cho booking ${bookingId}, đã xóa session: ${sessionKey}`);
        
        if (onTimeout) {
          onTimeout();
        }
      }
    }, 1000);

    // Cleanup
    return () => {
      clearInterval(timer);
      console.log(`Cleanup timer cho booking ${bookingId}`);
    };
  }, [calculateTimeLeft, createSessionKey, bookingId, onTimeout]);

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
        {formatTime(timeLeft)}
      </span>
      <span className="text-xs text-gray-400">còn lại</span>
    </div>
  );
};

export default CountdownTimer;

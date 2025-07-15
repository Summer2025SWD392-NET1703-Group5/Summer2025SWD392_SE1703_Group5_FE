import { useState, useEffect, useCallback, useRef } from 'react';
import countdownService from '../services/countdownService';

interface UseCountdownOptions {
  bookingId: number;
  showtimeId: number;
  duration?: number; // seconds, default 5 minutes
  onTimeout?: () => void;
  autoStart?: boolean; // default true
}

interface UseCountdownReturn {
  timeLeft: number;
  isExpired: boolean;
  formattedTime: string;
  startTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
}

/**
 * Hook thống nhất để quản lý countdown timer
 * Đảm bảo đồng bộ giữa tất cả components
 */
export const useCountdown = ({
  bookingId,
  showtimeId,
  duration = 5 * 60, // 5 minutes default
  onTimeout,
  autoStart = true
}: UseCountdownOptions): UseCountdownReturn => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const timeoutCallbackRef = useRef(onTimeout);
  const isInitializedRef = useRef(false);

  // Update callback ref when onTimeout changes
  useEffect(() => {
    timeoutCallbackRef.current = onTimeout;
  }, [onTimeout]);

  // Initialize countdown data
  const initializeCountdown = useCallback(() => {
    console.log(`🚀 [useCountdown] Khởi tạo countdown cho booking ${bookingId}`);
    
    // Initialize countdown data in service
    countdownService.initCountdown(bookingId, showtimeId, duration);
    
    // Get initial time left
    const initialTimeLeft = countdownService.getTimeLeft(bookingId);
    setTimeLeft(initialTimeLeft);
    setIsExpired(initialTimeLeft <= 0);
    
    console.log(`📊 [useCountdown] Booking ${bookingId} - Thời gian còn lại: ${initialTimeLeft}s`);
    
    isInitializedRef.current = true;
  }, [bookingId, showtimeId, duration]);

  // Start timer
  const startTimer = useCallback(() => {
    console.log(`▶️ [useCountdown] Bắt đầu timer cho booking ${bookingId}`);
    
    countdownService.startTimer(bookingId, (currentTimeLeft) => {
      setTimeLeft(currentTimeLeft);
      setIsExpired(currentTimeLeft <= 0);
    });

    // Register timeout callback
    if (timeoutCallbackRef.current) {
      countdownService.onTimeout(bookingId, timeoutCallbackRef.current);
    }
  }, [bookingId]);

  // Stop timer
  const stopTimer = useCallback(() => {
    console.log(`⏹️ [useCountdown] Dừng timer cho booking ${bookingId}`);
    
    countdownService.stopTimer(bookingId);
    
    // Unregister timeout callback
    if (timeoutCallbackRef.current) {
      countdownService.offTimeout(bookingId, timeoutCallbackRef.current);
    }
  }, [bookingId]);

  // Reset timer
  const resetTimer = useCallback(() => {
    console.log(`🔄 [useCountdown] Reset timer cho booking ${bookingId}`);
    
    stopTimer();
    countdownService.clearTimer(bookingId);
    initializeCountdown();
    
    if (autoStart) {
      startTimer();
    }
  }, [bookingId, stopTimer, initializeCountdown, autoStart, startTimer]);

  // Initialize on mount
  useEffect(() => {
    if (!isInitializedRef.current) {
      initializeCountdown();
    }
  }, [initializeCountdown]);

  // Auto start timer
  useEffect(() => {
    if (isInitializedRef.current && autoStart && !isExpired) {
      startTimer();
    }

    // Cleanup on unmount
    return () => {
      if (isInitializedRef.current) {
        stopTimer();
      }
    };
  }, [autoStart, isExpired, startTimer, stopTimer]);

  // Update timeout callback when it changes
  useEffect(() => {
    if (timeoutCallbackRef.current && isInitializedRef.current) {
      // Re-register callback
      countdownService.offTimeout(bookingId, timeoutCallbackRef.current);
      countdownService.onTimeout(bookingId, timeoutCallbackRef.current);
    }
  }, [bookingId, onTimeout]);

  // Format time
  const formattedTime = countdownService.formatTime(timeLeft);

  return {
    timeLeft,
    isExpired,
    formattedTime,
    startTimer,
    stopTimer,
    resetTimer
  };
};

/**
 * Hook để đồng bộ countdown từ server data
 * Sử dụng trong BookingHistory khi fetch data từ API
 */
export const useSyncCountdownFromServer = () => {
  const syncBookingTimer = useCallback((bookingId: number, createdAt: string, showtimeId: number) => {
    console.log(`🔄 [useSyncCountdown] Đồng bộ timer cho booking ${bookingId} từ server`);
    
    const isValid = countdownService.syncFromServer(bookingId, createdAt, showtimeId);
    
    if (!isValid) {
      console.log(`⏰ [useSyncCountdown] Booking ${bookingId} đã hết hạn`);
    }
    
    return isValid;
  }, []);

  return { syncBookingTimer };
};

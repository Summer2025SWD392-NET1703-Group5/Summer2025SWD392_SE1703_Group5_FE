// hooks/useBooking.ts
import { useState, useEffect, useCallback } from 'react';
import { Seat, BookingSession } from '../types/booking';

export const useBooking = (initialSession?: BookingSession) => {
  const [bookingSession, setBookingSession] = useState<BookingSession>(
    initialSession || {
      id: '',
      movieId: '',
      cinemaId: '',
      showtimeId: '',
      selectedSeats: [],
      totalPrice: 0,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      step: 1
    }
  );

  const [timeLeft, setTimeLeft] = useState(15 * 60);

  // Timer management
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const expiry = new Date(bookingSession.expiresAt).getTime();
      const remaining = Math.max(0, Math.floor((expiry - now) / 1000));
      
      setTimeLeft(remaining);
      
      if (remaining === 0) {
        // Handle timeout
        resetBooking();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [bookingSession.expiresAt]);

  const updateSelectedSeats = useCallback((seats: Seat[]) => {
    const totalPrice = seats.reduce((sum, seat) => sum + seat.price, 0);
    setBookingSession(prev => ({
      ...prev,
      selectedSeats: seats,
      totalPrice
    }));
  }, []);

  const addSeat = useCallback((seat: Seat, maxSeats = 8) => {
    setBookingSession(prev => {
      if (prev.selectedSeats.length >= maxSeats) {
        throw new Error(`Chỉ có thể chọn tối đa ${maxSeats} ghế`);
      }
      
      const newSeats = [...prev.selectedSeats, seat];
      const totalPrice = newSeats.reduce((sum, s) => sum + s.price, 0);
      
      return {
        ...prev,
        selectedSeats: newSeats,
        totalPrice
      };
    });
  }, []);

  const removeSeat = useCallback((seatId: string) => {
    setBookingSession(prev => {
      const newSeats = prev.selectedSeats.filter(s => s.id !== seatId);
      const totalPrice = newSeats.reduce((sum, s) => sum + s.price, 0);
      
      return {
        ...prev,
        selectedSeats: newSeats,
        totalPrice
      };
    });
  }, []);

  const toggleSeat = useCallback((seat: Seat, maxSeats = 8) => {
    setBookingSession(prev => {
      const isSelected = prev.selectedSeats.some(s => s.id === seat.id);
      
      if (isSelected) {
        const newSeats = prev.selectedSeats.filter(s => s.id !== seat.id);
        const totalPrice = newSeats.reduce((sum, s) => sum + s.price, 0);
        return { ...prev, selectedSeats: newSeats, totalPrice };
      } else {
        if (prev.selectedSeats.length >= maxSeats) {
          throw new Error(`Chỉ có thể chọn tối đa ${maxSeats} ghế`);
        }
        
        const newSeats = [...prev.selectedSeats, seat];
        const totalPrice = newSeats.reduce((sum, s) => sum + s.price, 0);
        return { ...prev, selectedSeats: newSeats, totalPrice };
      }
    });
  }, []);

  const resetBooking = useCallback(() => {
    setBookingSession(prev => ({
      ...prev,
      selectedSeats: [],
      totalPrice: 0,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000)
    }));
  }, []);

  const extendSession = useCallback((minutes = 15) => {
    setBookingSession(prev => ({
      ...prev,
      expiresAt: new Date(Date.now() + minutes * 60 * 1000)
    }));
  }, []);

  return {
    bookingSession,
    timeLeft,
    updateSelectedSeats,
    addSeat,
    removeSeat,
    toggleSeat,
    resetBooking,
    extendSession,
    setBookingSession
  };
};

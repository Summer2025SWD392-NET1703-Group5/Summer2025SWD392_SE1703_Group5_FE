// components/BookingSummary.tsx
import React, { useState, useEffect } from "react";
import { ClockIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import type { Seat, BookingSession } from "../types";
import { translateSeatType } from "../utils/seatTypeTranslator";

interface BookingSummaryProps {
  bookingSession: BookingSession;
  onContinue: () => void;
  maxSeats?: number;
}

const BookingSummary: React.FC<BookingSummaryProps> = ({ bookingSession, onContinue, maxSeats = 8 }) => {
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const expiry = new Date(bookingSession.expiresAt).getTime();
    const now = new Date().getTime();
    const initialTimeLeft = Math.max(0, Math.floor((expiry - now) / 1000));

    setTimeLeft(initialTimeLeft);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [bookingSession.expiresAt]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const { selectedSeats } = bookingSession;
  const subtotal = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
  const serviceFee = 0;
  const total = subtotal + serviceFee;

  return (
    <div className="bg-slate-800 rounded-xl p-6 sticky top-4">
      {/* Timer */}
      <div
        className={`flex items-center justify-center space-x-2 mb-6 p-3 bg-slate-700 rounded-lg ${
          timeLeft < 60 ? "text-red-500" : "text-gray-300"
        }`}
      >
        <ClockIcon className="w-5 h-5 mr-2" />
        <span className="font-mono text-lg">{isExpired ? "Hết thời gian" : formatTime(timeLeft)}</span>
        {timeLeft < 300 && <ExclamationTriangleIcon className="w-5 h-5 text-red-400 animate-pulse" />}
      </div>

      <h3 className="text-lg font-bold mb-4">Thông tin đặt vé</h3>

      {/* Movie Info */}
      <div className="mb-6 p-4 bg-slate-700 rounded-lg">
        <h4 className="font-medium text-white mb-2">Spider-Man: No Way Home</h4>
        <div className="text-sm text-gray-300 space-y-1">
          <p>📍 CGV Vincom Center</p>
          <p>📅 Thứ 7, 25/11/2023</p>
          <p>🕐 19:30 - 21:45</p>
          <p>🎬 Phòng 1 - Standard</p>
        </div>
      </div>

      {/* Selected Seats */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-300">Ghế đã chọn</h4>
          <span className="text-xs text-gray-400">
            {selectedSeats.length}/{maxSeats}
          </span>
        </div>

        {selectedSeats.length > 0 ? (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {selectedSeats.map((seat) => (
              <div key={seat.id} className="flex items-center justify-between bg-slate-700 rounded-lg p-3">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-white">
                      {seat.row}
                      {seat.number}
                    </span>
                    <span className="text-xs px-2 py-1 bg-slate-600 rounded text-gray-300">
                      {translateSeatType(seat.type)}
                    </span>
                  </div>
                </div>
                <span className="font-medium text-yellow-400">{seat.price.toLocaleString()}đ</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-8">
            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">🎭</div>
            <p className="text-sm">Chưa chọn ghế nào</p>
            <p className="text-xs mt-1">Chọn ghế để tiếp tục</p>
          </div>
        )}
      </div>

      {/* Price Breakdown */}
      {selectedSeats.length > 0 && (
        <div className="mb-6">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-300">Tạm tính ({selectedSeats.length} ghế):</span>
              <span className="text-white">{subtotal.toLocaleString()}đ</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Giảm giá:</span>
              <span className="text-green-400">-0đ</span>
            </div>
            <hr className="border-slate-600 my-3" />
            <div className="flex justify-between text-lg font-bold">
              <span className="text-white">Tổng cộng:</span>
              <span className="text-yellow-400">{total.toLocaleString()}đ</span>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={onContinue}
          disabled={selectedSeats.length === 0 || timeLeft === 0}
          className={`w-full bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors ${
            isExpired || selectedSeats.length === 0 ? "bg-gray-700 text-gray-400 cursor-not-allowed" : ""
          }`}
        >
          {isExpired
            ? "Hết thời gian đặt vé"
            : selectedSeats.length === 0
            ? "Chọn ghế để tiếp tục"
            : "Tiếp tục thanh toán"}
        </button>

        {selectedSeats.length > 0 && (
          <button className="w-full bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm">
            Lưu để đặt sau
          </button>
        )}
      </div>

      {/* Emergency Contact */}
      {timeLeft < 300 && (
        <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
          <div className="flex items-center space-x-2 text-red-400 text-sm">
            <ExclamationTriangleIcon className="w-4 h-4" />
            <span className="font-medium">Sắp hết thời gian!</span>
          </div>
          <p className="text-xs text-red-300 mt-1">Liên hệ hotline: 1900-6017 nếu cần hỗ trợ</p>
        </div>
      )}
    </div>
  );
};

export default BookingSummary;
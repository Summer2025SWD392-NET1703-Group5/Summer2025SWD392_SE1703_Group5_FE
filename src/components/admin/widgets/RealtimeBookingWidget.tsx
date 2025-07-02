// src/components/admin/widgets/RealtimeBookingWidget.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { ClockIcon } from '@heroicons/react/24/outline';

interface Booking {
  id: string;
  movieTitle: string;
  cinemaName: string;
  showtime: string;
  customerName: string;
  timestamp: string;
}

interface RealtimeBookingWidgetProps {
  bookings: Booking[];
}

const RealtimeBookingWidget: React.FC<RealtimeBookingWidgetProps> = ({ bookings }) => {
  return (
    <motion.div
      className="p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <ClockIcon className="w-6 h-6 text-[#FFD875]" />
        <h3 className="text-xl font-bold text-[#FFD875]">Đặt vé gần đây</h3>
      </div>
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {bookings.slice(0, 6).map((booking, index) => (
          <motion.div
            key={booking.id}
            className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <div className="flex-1">
              <h4 className="text-white font-medium text-sm">{booking.movieTitle}</h4>
              <p className="text-slate-400 text-xs">{booking.customerName} • {booking.cinemaName}</p>
            </div>
            <div className="text-right">
              <p className="text-[#FFD875] text-xs">{booking.showtime}</p>
              <p className="text-slate-400 text-xs">{booking.timestamp}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default RealtimeBookingWidget;

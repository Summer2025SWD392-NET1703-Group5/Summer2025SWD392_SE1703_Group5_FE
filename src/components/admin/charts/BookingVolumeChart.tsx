// src/components/admin/charts/BookingVolumeChart.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { TicketIcon } from '@heroicons/react/24/outline';

interface BookingVolumeChartProps {
  data: Array<{ date: string; count: number }>;
}

const BookingVolumeChart: React.FC<BookingVolumeChartProps> = ({ data }) => {
  return (
    <motion.div
      className="p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <TicketIcon className="w-6 h-6 text-[#FFD875]" />
        <h3 className="text-xl font-bold text-[#FFD875]">Lượng đặt vé</h3>
      </div>
      <div className="h-64 flex items-end justify-center bg-slate-800/30 rounded-lg p-4">
        <div className="text-slate-400 text-center">
          <TicketIcon className="w-16 h-16 mx-auto mb-2 opacity-50" />
          <p>Biểu đồ lượng đặt vé sẽ hiển thị ở đây</p>
          <p className="text-sm">({data.length} ngày dữ liệu)</p>
        </div>
      </div>
    </motion.div>
  );
};

export default BookingVolumeChart;

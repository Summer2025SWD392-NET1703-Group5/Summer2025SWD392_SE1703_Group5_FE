// src/components/admin/widgets/CinemaPerformanceWidget.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { BuildingOfficeIcon } from '@heroicons/react/24/outline';

interface Cinema {
  id: string;
  name: string;
  revenue: number;
  occupancyRate: number;
}

interface CinemaPerformanceWidgetProps {
  cinemas: Cinema[];
}

const CinemaPerformanceWidget: React.FC<CinemaPerformanceWidgetProps> = ({ cinemas }) => {
  return (
    <motion.div
      className="p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <BuildingOfficeIcon className="w-6 h-6 text-[#FFD875]" />
        <h3 className="text-xl font-bold text-[#FFD875]">Hiệu suất rạp</h3>
      </div>
      <div className="space-y-3">
        {cinemas.slice(0, 4).map((cinema, index) => (
          <div key={cinema.id} className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg">
            <div className="w-8 h-8 bg-[#FFD875] rounded-full flex items-center justify-center text-black font-bold">
              {index + 1}
            </div>
            <div className="flex-1">
              <h4 className="text-white font-medium">{cinema.name}</h4>
              <p className="text-slate-400 text-sm">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', notation: 'compact' }).format(cinema.revenue)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[#FFD875] font-bold">{cinema.occupancyRate}%</p>
              <p className="text-slate-400 text-xs">Lấp đầy</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default CinemaPerformanceWidget;

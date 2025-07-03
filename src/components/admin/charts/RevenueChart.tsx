// src/components/admin/charts/RevenueChart.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { ChartBarIcon } from '@heroicons/react/24/outline';

interface RevenueChartProps {
  data: Array<{ date: string; amount: number }>;
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  return (
    <motion.div
      className="p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <ChartBarIcon className="w-6 h-6 text-[#FFD875]" />
        <h3 className="text-xl font-bold text-[#FFD875]">Biểu đồ doanh thu</h3>
      </div>
      <div className="h-64 flex items-end justify-center bg-slate-800/30 rounded-lg p-4">
        <div className="text-slate-400 text-center">
          <ChartBarIcon className="w-16 h-16 mx-auto mb-2 opacity-50" />
          <p>Biểu đồ doanh thu sẽ hiển thị ở đây</p>
          <p className="text-sm">({data.length} ngày dữ liệu)</p>
        </div>
      </div>
    </motion.div>
  );
};

export default RevenueChart;

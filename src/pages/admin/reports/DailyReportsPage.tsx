// src/pages/admin/reports/DailyReportsPage.tsx
import React from 'react';
import { motion } from 'framer-motion';
import DailyReports from '../../../components/admin/reports/DailyReports';
import { DocumentChartBarIcon } from '@heroicons/react/24/outline';

const DailyReportsPage: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-[#FFD875] rounded-lg">
            <DocumentChartBarIcon className="w-6 h-6 text-slate-900" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Báo cáo ngày</h1>
            <p className="text-slate-400">Xem chi tiết doanh thu và hoạt động theo ngày</p>
          </div>
        </div>
      </div>

      {/* Reports Component */}
      <div className="bg-slate-800 rounded-lg border border-slate-700">
        <DailyReports />
      </div>
    </motion.div>
  );
};

export default DailyReportsPage;

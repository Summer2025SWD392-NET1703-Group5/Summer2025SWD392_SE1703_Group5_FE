// src/pages/admin/reports/MonthlyReportsPage.tsx
import React from 'react';
import { motion } from 'framer-motion';
import MonthlyReports from '../../../components/admin/reports/MonthlyReports';
import { DocumentChartBarIcon } from '@heroicons/react/24/outline';

const MonthlyReportsPage: React.FC = () => {
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
            <h1 className="text-2xl font-bold text-white">Báo cáo tháng</h1>
            <p className="text-slate-400">Phân tích doanh thu và xu hướng theo tháng</p>
          </div>
        </div>
      </div>

      {/* Reports Component */}
      <div className="bg-slate-800 rounded-lg border border-slate-700">
        <MonthlyReports />
      </div>
    </motion.div>
  );
};

export default MonthlyReportsPage;

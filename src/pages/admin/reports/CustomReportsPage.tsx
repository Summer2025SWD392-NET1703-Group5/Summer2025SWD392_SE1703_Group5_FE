// src/pages/admin/reports/CustomReportsPage.tsx
import React from 'react';
import { motion } from 'framer-motion';
import CustomReports from '../../../components/admin/reports/CustomReports';
import { AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

const CustomReportsPage: React.FC = () => {
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
            <AdjustmentsHorizontalIcon className="w-6 h-6 text-slate-900" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Báo cáo tùy chỉnh</h1>
            <p className="text-slate-400">Tạo báo cáo theo yêu cầu với bộ lọc linh hoạt</p>
          </div>
        </div>
      </div>

      {/* Reports Component */}
      <div className="bg-slate-800 rounded-lg border border-slate-700">
        <CustomReports />
      </div>
    </motion.div>
  );
};

export default CustomReportsPage;

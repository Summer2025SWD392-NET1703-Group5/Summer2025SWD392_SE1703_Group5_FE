// src/components/admin/MetricCard.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';

interface MetricCardProps {
  title: string;
  value: number;
  format: 'currency' | 'number' | 'percentage';
  icon: React.ComponentType<any>;
  trend: number;
  color: 'green' | 'blue' | 'purple' | 'orange' | 'red';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, format, icon: Icon, trend, color }) => {
  const formatValue = (val: number, fmt: string) => {
    switch (fmt) {
      case 'currency':
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
      case 'percentage':
        return `${val}%`;
      default:
        return val.toLocaleString();
    }
  };

  const colorClasses = {
    green: 'text-green-400 bg-green-500/20',
    blue: 'text-blue-400 bg-blue-500/20',
    purple: 'text-purple-400 bg-purple-500/20',
    orange: 'text-orange-400 bg-orange-500/20',
    red: 'text-red-400 bg-red-500/20',
  };

  return (
    <motion.div
      className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/50"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-2">
        <Icon className="w-8 h-8 text-[#FFD875]" />
        <div className="flex items-center gap-1">
          {trend > 0 ? (
            <ArrowTrendingUpIcon className="w-4 h-4 text-green-400" />
          ) : (
            <ArrowTrendingDownIcon className="w-4 h-4 text-red-400" />
          )}
          <span className={`text-xs px-2 py-1 rounded ${colorClasses[color]}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        </div>
      </div>
      <h3 className="text-slate-400 text-sm">{title}</h3>
      <p className="text-white text-xl font-bold">{formatValue(value, format)}</p>
    </motion.div>
  );
};

export default MetricCard;

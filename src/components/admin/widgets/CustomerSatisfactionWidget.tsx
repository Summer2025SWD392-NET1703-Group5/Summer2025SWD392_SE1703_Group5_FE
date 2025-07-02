// src/components/admin/widgets/CustomerSatisfactionWidget.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { StarIcon } from '@heroicons/react/24/outline';

interface CustomerSatisfactionData {
  averageRating: number;
  totalReviews: number;
  distribution: Array<{ rating: number; count: number }>;
}

interface CustomerSatisfactionWidgetProps {
  data: CustomerSatisfactionData;
}

const CustomerSatisfactionWidget: React.FC<CustomerSatisfactionWidgetProps> = ({ data }) => {
  return (
    <motion.div
      className="p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <StarIcon className="w-6 h-6 text-[#FFD875]" />
        <h3 className="text-xl font-bold text-[#FFD875]">Đánh giá khách hàng</h3>
      </div>

      <div className="text-center mb-6">
        <div className="text-4xl font-bold text-[#FFD875] mb-2">{data.averageRating}</div>
        <div className="flex items-center justify-center gap-1 mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <StarIcon
              key={star}
              className={`w-5 h-5 ${star <= Math.floor(data.averageRating) ? 'text-[#FFD875] fill-current' : 'text-slate-600'}`}
            />
          ))}
        </div>
        <p className="text-slate-400 text-sm">Dựa trên {data.totalReviews.toLocaleString()} đánh giá</p>
      </div>

      <div className="space-y-2">
        {data.distribution.reverse().map((item) => (
          <div key={item.rating} className="flex items-center gap-3">
            <span className="text-sm text-slate-400 w-6">{item.rating}⭐</span>
            <div className="flex-1 bg-slate-700 rounded-full h-2">
              <div
                className="bg-[#FFD875] h-2 rounded-full"
                style={{ width: `${(item.count / data.totalReviews) * 100}%` }}
              ></div>
            </div>
            <span className="text-sm text-slate-400 w-12">{item.count}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default CustomerSatisfactionWidget;

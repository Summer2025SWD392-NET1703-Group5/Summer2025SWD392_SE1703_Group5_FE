import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardDocumentIcon,
  XMarkIcon,
  CheckIcon,
  CalendarIcon,
  ChevronRightIcon,
  TicketIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import type { Promotion } from '../types/promotion';
import { UsageProgressBar } from './promotion/UsageProgressBar';
import { DiscountBadge } from './promotion/DiscountBadge';

interface PromoDetailsModalProps {
  promotion: Promotion;
  isOpen: boolean;
  onClose: () => void;
  onApply: (code: string) => void;
  formatPrice: (price: number) => string;
  formatDate: (dateString: string) => string;
}

const PromoDetailsModal: React.FC<PromoDetailsModalProps> = ({
  promotion,
  isOpen,
  onClose,
  onApply,
  formatPrice,
  formatDate
}) => {
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  if (!isOpen) return null;

  // Khuyến mãi bị vô hiệu hóa nếu hết lượt hoặc đã được sử dụng
  const isDisabled = promotion.remainingUsage <= 0 || promotion.isUsed;

  const handleCopyCode = () => {
    if (isDisabled || !promotion.code) return;

    navigator.clipboard.writeText(promotion.code);
    setCopied(true);

    // Hiển thị "Đã sao chép!" trong 1.5 giây rồi tự động đóng modal
    setTimeout(() => {
      setCopied(false);
      onClose(); // Tự động đóng modal
    }, 500);
  };

  // Hàm xử lý khi bấm nút "Đặt vé ngay"
  const handleBookTicket = () => {
    if (isDisabled) return;

    // Copy mã khuyến mãi vào clipboard
    if (promotion.code) {
      navigator.clipboard.writeText(promotion.code);
      toast.success('Đã sao chép mã khuyến mãi!', {
        duration: 2000,
        position: 'top-center',
        style: {
          background: '#10b981',
          color: 'white',
          fontWeight: 'bold'
        }
      });
    }

    // Đóng modal
    onClose();

    // Chuyển hướng đến trang chọn lịch chiếu
    navigate('/showtimes');
  };
 
  const handleApplyCode = () => {
    // Sử dụng hàm handleBookTicket thay vì logic cũ
    handleBookTicket();
  };
 
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };
 
  const modalVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: { opacity: 1, y: 0, scale: 1 }
  };

  // Tạo thông báo trạng thái phù hợp cho button
  const getButtonText = () => {
    if (promotion.isUsed) return 'Đã sử dụng';
    if (promotion.remainingUsage <= 0) return 'Đã hết lượt sử dụng';
    return 'Đặt vé ngay';
  };

  // Xác định class button dựa trên trạng thái
  const getButtonClass = () => {
    const baseClass = 'py-2 px-4 rounded-lg font-bold transition-all duration-300 flex items-center justify-center text-sm';

    if (promotion.isUsed) {
      return `${baseClass} bg-gray-500 text-white cursor-not-allowed opacity-70`;
    }

    if (promotion.remainingUsage <= 0) {
      return `${baseClass} bg-gray-600 text-gray-300 cursor-not-allowed opacity-50`;
    }

    return `${baseClass} bg-[#ffd875] hover:bg-[#e6c269] text-black`;
  };
 
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={onClose}
        >
          <motion.div
            className="bg-slate-800 rounded-2xl max-w-md w-full overflow-hidden border border-[#ffd875]/30 shadow-lg shadow-[#ffd875]/20"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with image */}
            <div className="relative h-32 overflow-hidden">
              <img
                src={promotion.image}
                alt={promotion.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent"></div>
             
              {/* Badge */}
              {promotion.badge && (
                <div className="absolute top-4 left-4">
                  <span className={`
                    ${promotion.badge === 'HOT' ? 'bg-red-500' :
                      promotion.badge === 'NEW' ? 'bg-green-500' :
                      'bg-orange-500'}
                    text-white px-3 py-1 rounded-full text-sm font-bold
                  `}>
                    {promotion.badge}
                  </span>
                </div>
              )}

              {/* Đã sử dụng badge */}
              {promotion.isUsed && (
                <div className="absolute top-4 right-16">
                  <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm font-bold border border-gray-500">
                    Đã sử dụng
                  </span>
                </div>
              )}
             
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 bg-slate-800/50 text-white p-1 rounded-full hover:bg-slate-700"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
             
              {/* Title at bottom of image */}
              <div className="absolute bottom-0 left-0 w-full p-3">
                <h3 className="text-lg font-bold text-white drop-shadow-lg">{promotion.title}</h3>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              {/* Description */}
              <div className="mb-4">
                <p className="text-gray-300 text-sm">{promotion.description}</p>
                {/* Thêm thông tin loại giảm giá */}
                {promotion.discountType && promotion.discountValue && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <div className={`px-2 py-1 rounded text-xs font-medium border ${
                      promotion.discountType.toLowerCase() === 'percentage'
                        ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                        : 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                    }`}>
                      {promotion.discountType.toLowerCase() === 'percentage'
                        ? `Giảm ${promotion.discountValue}%`
                        : `Giảm ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(promotion.discountValue || 0)}`
                      }
                    </div>

                    {/* Hiển thị thêm mức chi tiêu tối thiểu nếu có */}
                    {promotion.minimumPurchase && promotion.minimumPurchase > 0 && (
                      <div className="bg-slate-700/30 text-gray-300 text-xs px-2 py-1 rounded border border-slate-600/30">
                        Đơn tối thiểu: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(promotion.minimumPurchase || 0)}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Usage Statistics with Progress Bar */}
              <div className="mb-4 bg-slate-700/30 p-3 rounded-lg">
                <UsageProgressBar
                  currentUsage={promotion.currentUsage}
                  usageLimit={promotion.usageLimit}
                />
              </div>

              {/* Validity */}
              <div className="flex items-center text-gray-400 text-sm mb-4 bg-slate-700/30 p-2 rounded-lg">
                <CalendarIcon className="w-4 h-4 mr-2 text-[#ffd875]" />
                <span>Có hiệu lực đến: {formatDate(promotion.validUntil)}</span>
              </div>

              {/* Terms and conditions */}
              <div className="mb-4">
                <h4 className="text-white font-medium mb-2 text-sm">Điều kiện áp dụng:</h4>
                <ul className="space-y-1">
                  {promotion.terms.map((term, index) => (
                    <li key={index} className="flex items-start text-xs text-gray-400">
                      <ChevronRightIcon className="w-3 h-3 text-[#ffd875] mr-2 flex-shrink-0 mt-0.5" />
                      <span>{term}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Promo code display */}
              {promotion.code && (
                <div className="mb-4 bg-slate-700/30 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-medium text-sm">Mã khuyến mãi:</h4>
                    <button
                      onClick={handleCopyCode}
                      disabled={isDisabled}
                      className={`text-xs flex items-center transition-colors ${
                        isDisabled
                          ? 'text-gray-500 cursor-not-allowed'
                          : 'text-[#ffd875] hover:underline'
                      }`}
                    >
                      {copied ? (
                        <CheckIcon className="w-3 h-3 mr-1 text-green-500" />
                      ) : (
                        <ClipboardDocumentIcon className={`w-3 h-3 mr-1 ${isDisabled ? 'text-gray-500' : 'text-[#ffd875]'}`} />
                      )}
                      {copied ? 'Đã sao chép!' : (promotion.isUsed ? 'Đã sử dụng' : isDisabled ? 'Không khả dụng' : 'Sao chép')}
                    </button>
                  </div>
                  <motion.div
                    className={`font-mono text-base font-bold text-center py-2 bg-slate-800 rounded border transition-all duration-300 ${
                      isDisabled
                        ? 'border-slate-600/30 text-gray-500 cursor-not-allowed'
                        : 'border-[#ffd875]/30 text-[#ffd875] cursor-pointer'
                    }`}
                    onClick={handleCopyCode}
                    whileHover={isDisabled ? {} : { scale: 1.02 }}
                    whileTap={isDisabled ? {} : { scale: 0.98 }}
                  >
                    {promotion.code}
                  </motion.div>
                </div>
              )}
             
              {/* Action buttons */}
              <div className="flex justify-center">
                <button
                  onClick={handleApplyCode}
                  className={getButtonClass()}
                  disabled={isDisabled}
                >
                  <TicketIcon className="w-4 h-4 mr-2" />
                  {getButtonText()}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PromoDetailsModal; 
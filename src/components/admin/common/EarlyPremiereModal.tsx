import React, { useEffect } from 'react';
import { 
  ExclamationTriangleIcon, 
  FilmIcon, 
  CalendarDaysIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';
import './EarlyPremiereModal.css';

interface EarlyPremiereModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  movieTitle: string;
  releaseDate: string;
  premiereDate: string;
  selectedDate: string;
}

const EarlyPremiereModal: React.FC<EarlyPremiereModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  movieTitle,
  releaseDate,
  premiereDate,
  selectedDate
}) => {
  if (!isOpen) return null;

  // Handle ESC key
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const formatDate = (dateString: string) => {
    try {
      // Check for empty, null, or undefined
      if (!dateString || dateString.trim() === '') {
        return 'Chưa xác định';
      }
      
      const date = new Date(dateString);
      // Check for invalid date
      if (isNaN(date.getTime())) {
        return 'Ngày không hợp lệ';
      }
      
      return date.toLocaleDateString('vi-VN');
    } catch (e) {
      console.error('Error formatting date:', e, dateString);
      return 'Lỗi định dạng ngày';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity early-premiere-modal-backdrop"
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className="relative bg-slate-800 rounded-xl shadow-2xl w-full max-w-md transform transition-all early-premiere-modal"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Xuất chiếu sớm</h3>
                <p className="text-sm text-gray-400">Cần xác nhận từ bạn</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Movie info */}
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-3">
                <FilmIcon className="w-5 h-5 text-FFD875" />
                <span className="text-sm font-medium text-FFD875">Thông tin phim</span>
              </div>
              <p className="text-white font-medium text-base">{movieTitle}</p>
            </div>

            {/* Warning message */}
            <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-yellow-200 text-sm leading-relaxed">
                Bạn đang tạo xuất chiếu trước ngày công chiếu chính thức của phim. 
                Điều này có thể ảnh hưởng đến kế hoạch marketing và chiến lược phát hành của hãng phim.
              </p>
            </div>

            {/* Date comparison */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CalendarDaysIcon className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-gray-300">Ngày phát hành:</span>
                </div>
                <span className="text-sm font-medium text-white">{formatDate(releaseDate)}</span>
              </div>
              
                             <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                 <div className="flex items-center space-x-2">
                   <CalendarDaysIcon className="w-4 h-4 text-green-400" />
                   <span className="text-sm text-gray-300">Ngày công chiếu:</span>
                 </div>
                 <div className="text-right">
                   <span className="text-sm font-medium text-white">
                     {formatDate(premiereDate)}
                   </span>
                 </div>
               </div>
              
              <div className="flex items-center justify-between p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CalendarDaysIcon className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-yellow-200">Ngày chiếu dự xuất:</span>
                </div>
                <span className="text-sm font-medium text-yellow-200">{formatDate(selectedDate)}</span>
              </div>
            </div>

            <div className="text-center mb-6">
              <p className="text-gray-300 text-sm">
                Bạn có chắc chắn muốn tạo xuất chiếu sớm này không?
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex space-x-3 p-6 border-t border-slate-700">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-300 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors modal-button"
            >
              Hủy
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-black bg-FFD875 hover:bg-opacity-90 rounded-lg transition-colors font-semibold modal-button"
              style={{ backgroundColor: '#FFD875' }}
            >
              Xác nhận tạo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarlyPremiereModal; 
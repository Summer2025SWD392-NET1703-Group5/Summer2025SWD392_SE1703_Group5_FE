import React from 'react';
import { ExclamationTriangleIcon, UserGroupIcon } from '@heroicons/react/24/outline';

interface UnassignedStaffNoticeProps {
  className?: string;
}

/**
 * Component hiển thị thông báo cho nhân viên chưa được phân công rạp
 */
export const UnassignedStaffNotice: React.FC<UnassignedStaffNoticeProps> = ({ 
  className = '' 
}) => {
  return (
    <div className={`glass-dark rounded-2xl p-6 border border-red-500/30 bg-red-500/5 ${className}`}>
      <div className="flex items-start space-x-4">
        <div className="flex h-12 w-12 flex-none items-center justify-center rounded-lg bg-red-500">
          <ExclamationTriangleIcon className="h-7 w-7 text-white" />
        </div>
        <div className="flex-auto">
          <h3 className="text-lg font-semibold text-red-400 mb-2">
            Tài khoản chưa được phân công
          </h3>
          <p className="text-gray-300 mb-4">
            Tài khoản nhân viên của bạn hiện chưa được phân công làm việc tại rạp chiếu phim nào. 
            Để có thể sử dụng đầy đủ các chức năng dành cho nhân viên, bạn cần được quản lý 
            phân công vào một rạp cụ thể.
          </p>
          
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-4">
            <h4 className="text-sm font-semibold text-yellow-400 mb-2 flex items-center">
              <UserGroupIcon className="h-4 w-4 mr-2" />
              Các chức năng bị hạn chế:
            </h4>
            <ul className="text-xs text-gray-300 space-y-1 list-disc list-inside">
              <li>Xem lịch chiếu và đặt vé cho khách hàng</li>
              <li>Quét và kiểm tra vé điện tử</li>
            </ul>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <h4 className="text-sm font-semibold text-blue-400 mb-2">
              Để được phân công rạp:
            </h4>
            <p className="text-xs text-gray-300 mb-2">
              Vui lòng liên hệ với Quản lý hoặc Quản trị viên để được phân công 
              làm việc tại rạp Galaxy Cinema gần nhất.
            </p>
            <p className="text-xs text-blue-300">
              📞 Hotline hỗ trợ: 1900-6017<br />
              📧 Email: support@galaxycinema.vn
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnassignedStaffNotice;

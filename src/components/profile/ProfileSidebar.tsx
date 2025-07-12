import React, { useMemo, useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  UserIcon,
  TicketIcon,
  CogIcon,
  BellIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../contexts/NotificationContext';
import { cinemaService } from '../../services/cinemaService';

interface ProfileSidebarProps {
  className?: string;
}

interface MenuItem {
  name: string;
  path: string;
  icon: React.ComponentType<any>;
  exact?: boolean;
  badge?: number | undefined;
  roles: string[];
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const { unreadCount } = useNotification();
  const [cinemaName, setCinemaName] = useState<string>('');
  const [isLoadingCinema, setIsLoadingCinema] = useState<boolean>(false);

  // Fetch cinema information for staff users
  useEffect(() => {
    const fetchCinemaInfo = async () => {
      // Only fetch cinema info for staff with a valid cinemaId
      if (user?.role?.toLowerCase() === 'staff' && user?.cinemaId) {
        console.log("[ProfileSidebar] Fetching cinema info for staff:", user.cinemaId);
        setIsLoadingCinema(true);
        try {
          // Fetch cinema details using cinema service
          const cinemaData = await cinemaService.getCinemaById(user.cinemaId);
          
          // Set cinema name from API response
          setCinemaName(cinemaData.Cinema_Name || cinemaData.name || `Galaxy Cinema ${user.cinemaId}`);
        } catch (error) {
          console.error('Không thể lấy thông tin rạp:', error);
          // Fallback to a default name format
          setCinemaName(`Galaxy Cinema ${user.cinemaId}`);
        } finally {
          setIsLoadingCinema(false);
        }
      } else if (user?.role?.toLowerCase() === 'staff' && !user?.cinemaId) {
        console.log("[ProfileSidebar] Staff user without cinema assignment");
        // Clear cinema info for unassigned staff
        setCinemaName('');
        setIsLoadingCinema(false);
      }
    };

    fetchCinemaInfo();
  }, [user]);

  const allMenuItems: MenuItem[] = [
    {
      name: 'Thông tin cá nhân',
      path: '/profile',
      icon: UserIcon,
      exact: true,
      roles: ['customer', 'admin'] // Chỉ customer và admin
    },
    {
      name: 'Lịch sử đặt vé',
      path: '/profile/bookings',
      icon: TicketIcon,
      roles: ['customer'] // Chỉ customer
    },
    {
      name: 'Vé của tôi',
      path: '/profile/tickets',
      icon: TicketIcon,
      roles: ['customer'] // Chỉ customer
    },
    {
      name: 'Thông báo',
      path: '/profile/notifications',
      icon: BellIcon,
      badge: unreadCount > 0 ? unreadCount : undefined,
      roles: ['customer'] // Chỉ customer
    },
    {
      name: 'Cài đặt',
      path: '/profile/settings',
      icon: CogIcon,
      roles: ['customer', 'staff', 'admin'] // Tất cả đều có, staff chỉ được xem mục này
    }
  ];

  // Memoize menu items để tránh re-filter mỗi render
  const menuItems = useMemo(() => {
    const userRole = user?.role?.toLowerCase();
    
    // If user is staff but not assigned to any cinema, only allow settings access
    if (userRole === 'staff' && !user?.cinemaId) {
      return allMenuItems.filter(item => 
        item.roles.includes(userRole) && item.path === '/profile/settings'
      );
    }
    
    return allMenuItems.filter(item => item.roles.includes(userRole || 'customer'));
  }, [user?.role, user?.cinemaId]);

  return (
    <div className={`glass-dark rounded-2xl p-6 border border-gray-700/50 ${className}`}>
      <h2 className="text-xl font-normal text-white mb-6">Tài khoản của tôi</h2>

      {/* Staff without Cinema Assignment - Access Restriction */}
      {user?.role?.toLowerCase() === 'staff' && !user?.cinemaId && (
        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-red-500">
              <BuildingOfficeIcon className="h-6 w-6 text-white" />
            </div>
            <div className="flex-auto">
              <h3 className="text-sm font-semibold text-red-400">Chưa được phân công</h3>
              <p className="text-xs text-gray-300 mb-2">
                Bạn chưa được phân công làm việc tại rạp nào.
              </p>
              <p className="text-xs text-red-300">
                Vui lòng liên hệ Quản lý hoặc Admin để được phân công công việc.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Staff Cinema Information */}
      {user?.role?.toLowerCase() === 'staff' && user?.cinemaId && (
        <div className="mb-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-blue-500">
              <BuildingOfficeIcon className="h-6 w-6 text-white" />
            </div>
            <div className="flex-auto">
              <h3 className="text-sm font-semibold text-blue-400">Nhân viên rạp</h3>
              <p className="text-xs text-gray-300">
                {isLoadingCinema ? (
                  <span className="inline-flex items-center">
                    <span className="animate-spin inline-block w-3 h-3 border border-gray-400 border-t-transparent rounded-full mr-2"></span>
                    Đang tải...
                  </span>
                ) : (
                  cinemaName || `Rạp ID: ${user.cinemaId}`
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      <nav className="space-y-2">
        {/* Limited access message for unassigned staff */}
        {user?.role?.toLowerCase() === 'staff' && !user?.cinemaId && (
          <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 mb-4">
            <p className="text-xs text-yellow-300 text-center">
              Quyền truy cập bị hạn chế cho đến khi được phân công rạp
            </p>
          </div>
        )}
        
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            className={({ isActive }) => `
              flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 group
              ${isActive ? 
                'text-[#ffd875] bg-[#ffd875]/10 border border-[#ffd875]/30 shadow-[0_0_15px_rgba(255,216,117,0.2)]' : 
                'text-gray-300 hover:text-[#ffd875] hover:bg-[#ffd875]/5 border border-transparent hover:border-[#ffd875]/20 hover:shadow-[0_0_10px_rgba(255,216,117,0.1)]'
              }
            `}
          >
            <item.icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
            <span className="font-medium flex-1">{item.name}</span>
            {item.badge && (
              <div className="relative">
                <span className="relative inline-flex rounded-full h-5 w-5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs items-center justify-center font-bold shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
                <span className="absolute top-0 left-0 inline-flex rounded-full h-5 w-5 bg-red-400 animate-ping opacity-75"></span>
              </div>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default ProfileSidebar; 
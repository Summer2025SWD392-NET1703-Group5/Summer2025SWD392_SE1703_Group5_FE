import React, { useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  UserIcon,
  TicketIcon,
  CogIcon,
  HeartIcon,
  BellIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../contexts/NotificationContext';

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
  const location = useLocation();
  const { user } = useAuth();
  const { unreadCount } = useNotification();

  const allMenuItems: MenuItem[] = [
    {
      name: 'Thông tin cá nhân',
      path: '/profile',
      icon: UserIcon,
      exact: true,
      roles: ['customer', 'staff', 'admin'] // Tất cả đều có
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
      roles: ['customer', 'staff', 'admin'] // Tất cả đều có
    }
  ];

  // Memoize menu items để tránh re-filter mỗi render
  const menuItems = useMemo(() => {
    const userRole = user?.role?.toLowerCase();
    return allMenuItems.filter(item => item.roles.includes(userRole || 'customer'));
  }, [user?.role]);

  return (
    <div className={`glass-dark rounded-2xl p-6 border border-gray-700/50 ${className}`}>
      <h2 className="text-xl font-normal text-white mb-6">Tài khoản của tôi</h2>

      <nav className="space-y-2">
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
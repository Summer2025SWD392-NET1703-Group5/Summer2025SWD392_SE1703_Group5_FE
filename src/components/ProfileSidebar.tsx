import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  UserIcon,
  TicketIcon,
  CogIcon,
  HeartIcon,
  BellIcon,
  CreditCardIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { useNotification } from '../contexts/NotificationContext';

interface ProfileSidebarProps {
  className?: string;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ className = '' }) => {
  const location = useLocation();
  const { unreadCount } = useNotification();
  
  // Debug log
  console.log('ProfileSidebar - unreadCount:', unreadCount);
  
  const menuItems = [
    {
      name: 'Thông tin cá nhân',
      path: '/profile',
      icon: UserIcon,
      exact: true
    },
    {
      name: 'Lịch sử đặt vé',
      path: '/profile/bookings',
      icon: TicketIcon
    },
    {
      name: 'Phim yêu thích',
      path: '/profile/favorites',
      icon: HeartIcon
    },
    {
      name: 'Thông báo',
      path: '/profile/notifications',
      icon: BellIcon,
      badge: unreadCount || 13 // Fallback để test UI
    },
    {
      name: 'Phương thức thanh toán',
      path: '/profile/payment-methods',
      icon: CreditCardIcon
    },
    {
      name: 'Bảo mật',
      path: '/profile/security',
      icon: ShieldCheckIcon
    },
    {
      name: 'Cài đặt',
      path: '/profile/settings',
      icon: CogIcon
    }
  ];

  const isActive = (path: string, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className={`glass-dark rounded-2xl p-6 border border-gray-700/50 ${className}`}>
      <h2 className="text-xl font-bold text-white mb-6">Tài khoản của tôi</h2>
      
      <nav className="space-y-3">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center justify-between px-4 py-3.5 rounded-lg transition-all duration-300 group relative
              ${isActive ? 
                'text-[#ffd875] bg-[#ffd875]/10 border border-[#ffd875]/30 shadow-[0_0_15px_rgba(255,216,117,0.2)]' : 
                'text-gray-300 hover:text-[#ffd875] hover:bg-[#ffd875]/5 border border-transparent hover:border-[#ffd875]/20 hover:shadow-[0_0_10px_rgba(255,216,117,0.1)]'
              }
            `}
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <item.icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110 flex-shrink-0" />
              <span className="font-medium truncate">{item.name}</span>
            </div>
            {item.badge && (
              <div className="relative flex h-7 w-7 flex-shrink-0 ml-4 z-30">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-7 w-7 bg-red-600 hover:bg-red-700 items-center justify-center text-sm font-black text-white shadow-lg shadow-red-600/60 border border-red-500">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              </div>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default ProfileSidebar; 
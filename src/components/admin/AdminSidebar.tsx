// src/components/admin/AdminSidebar.tsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  ChartBarIcon,
  FilmIcon,
  BuildingOfficeIcon,
  UsersIcon,
  TicketIcon,
  CurrencyDollarIcon,
  Cog6ToothIcon,
  BellIcon,
  DocumentChartBarIcon,
  CalendarIcon,
  ShieldCheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowLeftOnRectangleIcon,
  UserCircleIcon,
  StarIcon,
  UserPlusIcon,
  TagIcon,
  PlusIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/SimpleAuthContext';

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: (collapsed: boolean) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  path?: string;
  children?: MenuItem[];
  badge?: number;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ collapsed, onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['dashboard']);
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);

  // Add custom CSS for the glossy text effect
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      /* Glossy text effect for cinema name */
      .cinema-name {
        position: relative;
        background: linear-gradient(to bottom, #ffffff 0%, #ffd875 100%);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        text-shadow: 0px 2px 8px rgba(255, 216, 117, 0.5);
        letter-spacing: 0.05em;
      }
      
      .cinema-tagline {
        color: #FFD875;
        text-shadow: 0 0 10px rgba(255, 216, 117, 0.7);
        animation: glow 2s ease-in-out infinite alternate;
      }
      
      @keyframes glow {
        from {
          text-shadow: 0 0 5px rgba(255, 216, 117, 0.5);
        }
        to {
          text-shadow: 0 0 15px rgba(255, 216, 117, 0.8);
        }
      }
      
      /* Smooth transition for sidebar */
      .sidebar-transition {
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      /* Smooth hover effect */
      .menu-item-hover {
        position: relative;
        overflow: hidden;
      }
      
      .menu-item-hover::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 216, 117, 0.2), transparent);
        transition: left 0.5s;
      }
      
      .menu-item-hover:hover::before {
        left: 100%;
      }
      
      /* Smooth collapse animation */
      .sidebar-collapse-enter {
        transform: translateX(-100%);
        opacity: 0;
      }
      
      .sidebar-collapse-enter-active {
        transform: translateX(0);
        opacity: 1;
        transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      /* Smooth expand animation for sub-menus */
      .submenu-transition {
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      .submenu-transition.expanded {
        max-height: 500px;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: HomeIcon,
      path: '/admin',
    },
    // Quản lý đặt vé - chỉ hiển thị cho Admin
    ...(user?.role === 'Admin' ? [
    {
      id: 'bookings',
      label: 'Quản lý đặt vé',
      icon: TicketIcon,
      children: [
        { id: 'bookings-list', label: 'Danh sách đặt vé', icon: TicketIcon, path: '/admin/bookings' },
      ],
      }
    ] : []),
    {
      id: 'movies',
      label: 'Quản lý phim',
      icon: FilmIcon,
      children: [
        { id: 'movies-list', label: 'Danh sách phim', icon: FilmIcon, path: '/admin/movies' },
        ...(user?.role === 'Admin' ? [
          { id: 'movies-add', label: 'Thêm phim mới', icon: PlusIcon, path: '/admin/movies/add' }
        ] : []),
      ],
    },
    {
      id: 'cinemas',
      label: 'Quản lý rạp',
      icon: BuildingOfficeIcon,
      children: [
        ...(user?.role === 'Admin' ? [
          { id: 'cinemas-list', label: 'Danh sách rạp', icon: BuildingOfficeIcon, path: '/admin/cinemas' }
        ] : []),
        { id: 'cinemas-rooms', label: 'Phòng chiếu', icon: CogIcon, path: '/admin/cinema-rooms' },
        { id: 'cinemas-showtimes', label: 'Lịch chiếu', icon: CalendarIcon, path: '/admin/showtimes' },
      ],
    },
    {
      id: 'promotions',
      label: 'Quản lý khuyến mãi',
      icon: TagIcon,
      children: [
        { id: 'promotions-list', label: 'Danh sách khuyến mãi', icon: TagIcon, path: '/admin/promotions' },
        ...(user?.role === 'Admin' ? [
          { id: 'promotions-add', label: 'Thêm khuyến mãi', icon: PlusIcon, path: '/admin/promotions/add' }
        ] : []),
      ],
    },
    // Quản lý khách hàng - chỉ hiển thị cho Admin
    ...(user?.role === 'Admin' ? [
    {
      id: 'customers',
      label: 'Quản lý khách hàng',
      icon: UsersIcon,
      children: [
        { id: 'customers-list', label: 'Danh sách KH', icon: UsersIcon, path: '/admin/customers' },
          { id: 'customers-add', label: 'Thêm khách hàng', icon: UserPlusIcon, path: '/admin/customers/new' }
        ],
      }
        ] : []),
    {
      id: 'reports',
      label: 'Báo cáo',
      icon: ChartBarIcon,
      children: [
        { id: 'reports-daily', label: 'Báo cáo ngày', icon: DocumentChartBarIcon, path: '/admin/reports/daily' },
        { id: 'reports-monthly', label: 'Báo cáo tháng', icon: DocumentChartBarIcon, path: '/admin/reports/monthly' },
        { id: 'reports-custom', label: 'Báo cáo tùy chỉnh', icon: DocumentChartBarIcon, path: '/admin/reports/custom' },
      ],
    },
  ];

  const toggleMenu = (menuId: string) => {
    if (collapsed) return;

    setExpandedMenus(prev =>
      prev.includes(menuId)
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  const isActive = (path?: string) => {
    if (!path) return false;
    
    // Xử lý đặc biệt cho dashboard
    if (path === '/admin') {
      // Dashboard chỉ active khi đúng là đường dẫn /admin
      return location.pathname === '/admin';
    }
    
    // Các trang khác active khi đường dẫn khớp hoặc bắt đầu với đường dẫn trang
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const isParentActive = (children?: MenuItem[]) => {
    if (!children) return false;
    
    // Menu cha active khi có ít nhất một menu con active
    return children.some(child => {
      if (!child.path) return false;
      return isActive(child.path);
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedMenus.includes(item.id);
    const itemIsActive = isActive(item.path) || isParentActive(item.children);
    const isHovered = hoveredMenu === item.id;

    return (
      <div key={item.id} className="relative">
        {item.path ? (
          <Link
            to={item.path}
            onMouseEnter={() => setHoveredMenu(item.id)}
            onMouseLeave={() => setHoveredMenu(null)}
            className={`menu-item-hover flex items-center px-4 py-3 text-sm font-medium transition-all duration-300 ease-in-out relative group ${itemIsActive
              ? 'bg-[#FFD875] text-slate-900 shadow-[4px_0_15px_-5px_rgba(255,216,117,0.5)]'
              : 'text-gray-300 hover:bg-[#FFD875] hover:text-slate-900 hover:shadow-[0_0_15px_rgba(255,216,117,0.4)]'
              } ${level > 0 ? (collapsed ? 'pl-4' : 'pl-12') : 'pl-4'}`}
          >
            <item.icon className={`${collapsed ? 'w-6 h-6 mx-auto' : 'w-5 h-5 mr-3'} flex-shrink-0 transition-all duration-300 ${isHovered && !itemIsActive ? 'text-black' : ''}`} />
            {!collapsed && (
              <>
                <span className={`flex-1 ${isHovered && !itemIsActive ? 'transform translate-x-1 transition-transform duration-300' : 'transition-transform duration-300'}`}>{item.label}</span>
                {item.badge && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </>
            )}
            {itemIsActive && !collapsed && (
              <div className="absolute left-0 top-0 h-full w-1 bg-[#FFD875] rounded-r-full"></div>
            )}
            {collapsed && (
              <div className="absolute left-full ml-2 px-3 py-1.5 bg-slate-800 border border-slate-700 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-all duration-300 z-50 whitespace-nowrap shadow-lg">
                {item.label}
                {item.badge && (
                  <span className="ml-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </div>
            )}
            {isHovered && !collapsed && !itemIsActive && (
              <div className="absolute inset-0 bg-[#FFD875] opacity-10 z-[-1] rounded-lg"></div>
            )}
          </Link>
        ) : (
          <button
            onClick={() => toggleMenu(item.id)}
            onMouseEnter={() => setHoveredMenu(item.id)}
            onMouseLeave={() => setHoveredMenu(null)}
            className={`menu-item-hover w-full flex items-center px-4 py-3 text-sm font-medium transition-all duration-300 ease-in-out relative group ${itemIsActive
              ? 'text-white bg-slate-700/50 hover:bg-[#FFD875] hover:text-slate-900 hover:shadow-[0_0_15px_rgba(255,216,117,0.4)]'
              : 'text-gray-300 hover:bg-[#FFD875] hover:text-slate-900 hover:shadow-[0_0_15px_rgba(255,216,117,0.4)]'
              } ${level > 0 ? (collapsed ? 'pl-4' : 'pl-12') : 'pl-4'}`}
          >
            <item.icon className={`${collapsed ? 'w-6 h-6 mx-auto' : 'w-5 h-5 mr-3'} flex-shrink-0 transition-all duration-300 ${isHovered && !itemIsActive ? 'text-black' : ''}`} />
            {!collapsed && (
              <>
                <span className={`flex-1 text-left ${isHovered && !itemIsActive ? 'transform translate-x-1 transition-transform duration-300' : 'transition-transform duration-300'}`}>{item.label}</span>
                {item.badge && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full mr-2">
                    {item.badge}
                  </span>
                )}
                {hasChildren && (
                  <div className="ml-2 transition-transform duration-300 ease-in-out" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    <ChevronDownIcon className="w-4 h-4" />
                  </div>
                )}
              </>
            )}
            {collapsed && (
              <div className="absolute left-full ml-2 px-3 py-1.5 bg-slate-800 border border-slate-700 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-all duration-300 z-50 whitespace-nowrap shadow-lg">
                {item.label}
                {item.badge && (
                  <span className="ml-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
                {hasChildren && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <ChevronRightIcon className="w-4 h-4" />
                  </div>
                )}
              </div>
            )}
            {isHovered && !collapsed && !itemIsActive && (
              <div className="absolute inset-0 bg-[#FFD875] opacity-10 z-[-1] rounded-lg"></div>
            )}
          </button>
        )}

        {/* Render children */}
        {hasChildren && !collapsed && (
          <div className={`bg-black/20 overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="py-2 relative">
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-700 z-0"></div>
              {isExpanded && item.children?.map(child => renderMenuItem(child, level + 1))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`sidebar-transition fixed left-0 top-0 h-full bg-slate-800 border-r border-slate-700/50 z-40 ${collapsed ? 'w-20' : 'w-64'
      }`}>
      {/* Header */}
      <div className={`flex items-center justify-between transition-all duration-500 ease-in-out ${collapsed ? 'h-20 flex-col justify-center' : 'h-20 px-6'}`}>
        <div
          className="flex items-center cursor-pointer group"
          onClick={() => {
            navigate('/admin');
            window.location.reload();
          }}
        >
          <div className="w-10 h-10 bg-[#FFD875] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(255,216,117,0.5)] group-hover:shadow-[0_0_25px_rgba(255,216,117,0.7)]">
            <FilmIcon className="w-6 h-6 text-black" />
          </div>
          {!collapsed && (
            <div className="ml-3">
              <h1 className="text-lg font-bold uppercase tracking-wider leading-tight cinema-name">Galaxy Cinema</h1>
              <p className="text-[10px] uppercase tracking-widest leading-tight -mt-1 cinema-tagline">Admin Dashboard</p>
            </div>
          )}
        </div>
        <button
          onClick={() => onToggle(!collapsed)}
          className="absolute top-7 bg-slate-700 text-white p-1 rounded-full border border-slate-600 hover:bg-[#FFD875] hover:text-black transition-all duration-300 hover:shadow-[0_0_10px_rgba(255,216,117,0.5)] focus:outline-none focus:ring-2 focus:ring-[#FFD875] focus:ring-opacity-50"
          style={{ right: '-12px', transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden pb-24 custom-scrollbar" style={{ scrollbarWidth: 'thin', scrollbarColor: '#FFD875 #1E293B' }}>
        <div className="py-4 space-y-1">
          {menuItems.map(item => renderMenuItem(item))}
        </div>
      </nav>

      {/* Footer */}
      <div className={`absolute bottom-0 left-0 w-full border-t border-slate-700/50 transition-all duration-300 ease-in-out ${collapsed ? 'p-2' : 'p-4'}`}>
        {collapsed ? (
          <div className="flex flex-col gap-2">
            <button
              onClick={() => navigate('/profile')}
              className="w-full flex items-center justify-center p-3 rounded-lg text-slate-400 hover:bg-[#FFD875]/20 hover:text-[#FFD875] group transition-colors duration-300"
            >
              <UserCircleIcon className="w-6 h-6" />
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center p-3 rounded-lg text-slate-400 hover:bg-red-500/20 hover:text-red-400 group transition-colors duration-300"
            >
              <ArrowLeftOnRectangleIcon className="w-6 h-6" />
            </button>
          </div>
        ) : (
          <div className="flex items-center">
            <div
              className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center text-[#FFD875] overflow-hidden transition-all duration-300 hover:ring-2 hover:ring-[#FFD875] hover:ring-opacity-50 cursor-pointer"
              onClick={() => navigate('/profile')}
            >
              <UserCircleIcon className="w-7 h-7" />
            </div>
            <div className="flex-1 ml-3">
              <p className="text-sm font-semibold text-white">{user?.fullName || 'Admin User'}</p>
              <p className="text-xs text-slate-400">{user?.email || 'admin@example.com'}</p>
            </div>
            <button
              onClick={handleLogout}
              className="ml-2 p-2 rounded-lg text-slate-400 hover:bg-red-500/20 hover:text-red-400 group transition-colors duration-300"
              title="Đăng xuất"
            >
              <ArrowLeftOnRectangleIcon className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSidebar;

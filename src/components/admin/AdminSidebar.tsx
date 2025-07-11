// src/components/admin/AdminSidebar.tsx
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  HomeIcon,
  ChartBarIcon,
  FilmIcon,
  BuildingOfficeIcon,
  UsersIcon,
  TicketIcon,
  CurrencyDollarIcon,
  DocumentChartBarIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ArrowLeftOnRectangleIcon,
  UserCircleIcon,
  TagIcon,
  CogIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../contexts/SimpleAuthContext";

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
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);

  // Add custom CSS for the glossy text effect
  useEffect(() => {
    const style = document.createElement("style");
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

      /* Custom scrollbar for sidebar */
      .sidebar-scrollbar {
        scrollbar-width: thin;
        scrollbar-color: rgba(255, 216, 117, 0.6) rgba(30, 41, 59, 0.3);
      }

      .sidebar-scrollbar::-webkit-scrollbar {
        width: 6px;
      }

      .sidebar-scrollbar::-webkit-scrollbar-track {
        background: rgba(30, 41, 59, 0.3);
        border-radius: 3px;
      }

      .sidebar-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(255, 216, 117, 0.6);
        border-radius: 3px;
        transition: background 0.3s ease;
      }

      .sidebar-scrollbar::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 216, 117, 0.8);
      }

      /* Ensure sidebar takes full height and allows scrolling */
      .sidebar-container {
        height: 100vh;
        display: flex;
        flex-direction: column;
      }

      .sidebar-nav {
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
        min-height: 0; /* Important for flex child to shrink */
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const menuItems: MenuItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: HomeIcon,
      path: "/admin",
    },
    // Quản lý đặt vé
    {
      id: "bookings",
      label: "Quản lý đặt vé",
      icon: TicketIcon,
      path: "/admin/bookings",
    },

    // Quản lý giá vé - chỉ hiển thị cho Admin
    ...(user?.role === "Admin"
      ? [
          {
            id: "ticket-pricing",
            label: "Quản lý giá vé",
            icon: CurrencyDollarIcon,
            path: "/admin/ticket-pricing",
          },
        ]
      : []),
    {
      id: "movies",
      label: "Quản lý phim",
      icon: FilmIcon,
      path: "/admin/movies",
    },
    {
      id: "cinemas",
      label: "Quản lý rạp",
      icon: BuildingOfficeIcon,
      children: [
        ...(user?.role === "Admin"
          ? [{ id: "cinemas-list", label: "Danh sách rạp", icon: BuildingOfficeIcon, path: "/admin/cinemas" }]
          : []),
        { id: "cinemas-rooms", label: "Phòng chiếu", icon: CogIcon, path: "/admin/cinema-rooms" },
        { id: "cinemas-showtimes", label: "Lịch chiếu", icon: CalendarIcon, path: "/admin/showtimes" },
      ],
    },
    // Quản lý khuyến mãi - chỉ hiển thị cho Admin
    ...(user?.role === "Admin"
      ? [
          {
            id: "promotions",
            label: "Quản lý khuyến mãi",
            icon: TagIcon,
            path: "/admin/promotions",
          },
        ]
      : []),
    // Quản lý khách hàng - chỉ hiển thị cho Admin
    ...(user?.role === "Admin"
      ? [
          {
            id: "customers",
            label: "Quản lý khách hàng",
            icon: UsersIcon,
            path: "/admin/customers",
          },
        ]
      : []),
    {
      id: "reports",
      label: "Báo cáo",
      icon: ChartBarIcon,
      children: [
        { id: "reports-daily", label: "Báo cáo ngày", icon: DocumentChartBarIcon, path: "/admin/reports/daily" },
        { id: "reports-monthly", label: "Báo cáo tháng", icon: DocumentChartBarIcon, path: "/admin/reports/monthly" },
        { id: "reports-custom", label: "Báo cáo tùy chỉnh", icon: DocumentChartBarIcon, path: "/admin/reports/custom" },
      ],
    },
  ];

  const toggleMenu = (menuId: string) => {
    if (collapsed) return;

    setExpandedMenus((prev) => (prev.includes(menuId) ? prev.filter((id) => id !== menuId) : [...prev, menuId]));
  };

  const isActive = (path?: string) => {
    if (!path) return false;

    // Xử lý đặc biệt cho dashboard
    if (path === "/admin") {
      // Dashboard chỉ active khi đúng là đường dẫn /admin hoặc /admin/dashboard
      return location.pathname === "/admin" || location.pathname === "/admin/dashboard";
    }

    // Các trang khác active khi đường dẫn khớp hoặc bắt đầu với đường dẫn trang
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  const isParentActive = (children?: MenuItem[]) => {
    if (!children) return false;

    // Menu cha active khi có ít nhất một menu con active
    return children.some((child) => {
      if (!child.path) return false;
      return isActive(child.path);
    });
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
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
            className={`menu-item-hover flex items-center px-4 py-3 text-sm font-medium transition-all duration-300 ease-in-out relative group rounded-xl border ${
              itemIsActive
                ? "bg-gradient-to-r from-[#FFD875] to-amber-500 text-slate-900 shadow-[0_0_20px_rgba(255,216,117,0.4)] border-[#FFD875]/30"
                : "text-gray-300 hover:bg-gradient-to-r hover:from-[#FFD875]/20 hover:to-amber-500/20 hover:text-[#FFD875] hover:shadow-[0_0_15px_rgba(255,216,117,0.3)] border-transparent hover:border-[#FFD875]/30 backdrop-blur-sm"
            } ${level > 0 ? (collapsed ? "pl-4" : "pl-12") : "pl-4"}`}
          >
            <div
              className={`${
                collapsed ? "w-8 h-8 mx-auto" : "w-8 h-8 mr-3"
              } flex items-center justify-center rounded-lg transition-all duration-300 ${
                itemIsActive ? "bg-slate-900/20" : "bg-slate-700/30 group-hover:bg-[#FFD875]/20"
              }`}
            >
              <item.icon
                className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${
                  itemIsActive ? "text-slate-900" : isHovered ? "text-[#FFD875]" : "text-gray-300"
                }`}
              />
            </div>
            {!collapsed && (
              <>
                <span
                  className={`flex-1 font-medium transition-all duration-300 ${
                    itemIsActive
                      ? "text-slate-900"
                      : isHovered
                      ? "text-[#FFD875] transform translate-x-1"
                      : "text-gray-300"
                  }`}
                >
                  {item.label}
                </span>
                {item.badge && (
                  <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg border border-red-400/30">
                    {item.badge}
                  </span>
                )}
              </>
            )}
            {itemIsActive && !collapsed && (
              <div className="absolute left-0 top-0 h-full w-1 bg-[#FFD875] rounded-r-full"></div>
            )}
            {collapsed && (
              <div className="absolute left-full ml-3 px-4 py-2 bg-slate-800/95 backdrop-blur-xl border border-slate-600/50 text-white text-sm rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 z-50 whitespace-nowrap shadow-2xl">
                <span className="font-medium">{item.label}</span>
                {item.badge && (
                  <span className="ml-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                    {item.badge}
                  </span>
                )}
                {/* Tooltip arrow */}
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-slate-800/95 border-l border-t border-slate-600/50 rotate-45"></div>
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
            className={`menu-item-hover w-full flex items-center px-4 py-3 text-sm font-medium transition-all duration-300 ease-in-out relative group rounded-xl border ${
              itemIsActive
                ? "text-[#FFD875] bg-gradient-to-r from-slate-700/50 to-slate-800/50 hover:from-[#FFD875]/20 hover:to-amber-500/20 hover:text-[#FFD875] border-slate-600/30 hover:border-[#FFD875]/30"
                : "text-gray-300 hover:bg-gradient-to-r hover:from-[#FFD875]/20 hover:to-amber-500/20 hover:text-[#FFD875] border-transparent hover:border-[#FFD875]/30 backdrop-blur-sm"
            } ${level > 0 ? (collapsed ? "pl-4" : "pl-12") : "pl-4"}`}
          >
            <div
              className={`${
                collapsed ? "w-8 h-8 mx-auto" : "w-8 h-8 mr-3"
              } flex items-center justify-center rounded-lg transition-all duration-300 ${
                itemIsActive ? "bg-[#FFD875]/20" : "bg-slate-700/30 group-hover:bg-[#FFD875]/20"
              }`}
            >
              <item.icon
                className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${
                  itemIsActive ? "text-[#FFD875]" : isHovered ? "text-[#FFD875]" : "text-gray-300"
                }`}
              />
            </div>
            {!collapsed && (
              <>
                <span
                  className={`flex-1 text-left font-medium transition-all duration-300 ${
                    itemIsActive
                      ? "text-[#FFD875]"
                      : isHovered
                      ? "text-[#FFD875] transform translate-x-1"
                      : "text-gray-300"
                  }`}
                >
                  {item.label}
                </span>
                {item.badge && (
                  <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg border border-red-400/30 mr-2">
                    {item.badge}
                  </span>
                )}
                {hasChildren && (
                  <div
                    className={`ml-2 flex items-center justify-center w-6 h-6 rounded-lg transition-all duration-300 ease-in-out ${
                      isExpanded ? "rotate-180 bg-[#FFD875]/20" : "bg-slate-700/30 group-hover:bg-[#FFD875]/20"
                    }`}
                  >
                    <ChevronDownIcon
                      className={`w-4 h-4 transition-colors ${
                        itemIsActive || isHovered ? "text-[#FFD875]" : "text-gray-400"
                      }`}
                    />
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
          <div
            className={`bg-black/20 overflow-hidden transition-all duration-500 ease-in-out ${
              isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="py-2 relative">
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-700 z-0"></div>
              {isExpanded && item.children?.map((child) => renderMenuItem(child, level + 1))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={`sidebar-transition sidebar-container fixed left-0 top-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 z-40 shadow-2xl ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between transition-all duration-500 ease-in-out flex-shrink-0 ${
          collapsed ? "h-20 flex-col justify-center" : "h-20 px-6"
        }`}
      >
        <div
          className="flex items-center cursor-pointer group"
          onClick={() => {
            navigate("/admin");
            window.location.reload();
          }}
        >
          <div className="w-12 h-12 bg-gradient-to-br from-[#FFD875] to-amber-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-[0_0_20px_rgba(255,216,117,0.5)] group-hover:shadow-[0_0_30px_rgba(255,216,117,0.8)] border border-[#FFD875]/30">
            <FilmIcon className="w-7 h-7 text-black" />
          </div>
          {!collapsed && (
            <div className="ml-4">
              <h1 className="text-xl font-bold uppercase tracking-wider leading-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Galaxy Cinema
              </h1>
              <p className="text-xs uppercase tracking-widest leading-tight -mt-1 text-[#FFD875]/70 font-medium">
                Admin Dashboard
              </p>
            </div>
          )}
        </div>
        <button
          onClick={() => onToggle(!collapsed)}
          className="absolute top-8 bg-gradient-to-br from-slate-700 to-slate-800 text-white p-2 rounded-full border border-slate-600/50 hover:bg-gradient-to-br hover:from-[#FFD875] hover:to-amber-500 hover:text-black transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,216,117,0.6)] focus:outline-none focus:ring-2 focus:ring-[#FFD875]/50 focus:ring-offset-2 focus:ring-offset-slate-900 backdrop-blur-sm"
          style={{ right: "-14px", transform: collapsed ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Menu */}
      <nav className="sidebar-nav sidebar-scrollbar">
        <div className="py-6 space-y-2 px-3">{menuItems.map((item) => renderMenuItem(item))}</div>
      </nav>

      {/* Footer */}
      <div
        className={`flex-shrink-0 border-t border-slate-700/50 transition-all duration-300 ease-in-out ${
          collapsed ? "p-2" : "p-4"
        }`}
      >
        {collapsed ? (
          <div className="flex flex-col gap-2">
            <button
              onClick={() => navigate("/profile")}
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
              onClick={() => navigate("/profile")}
            >
              <UserCircleIcon className="w-7 h-7" />
            </div>
            <div className="flex-1 ml-3">
              <p className="text-sm font-semibold text-white">{user?.fullName || "Admin User"}</p>
              <p className="text-xs text-slate-400">{user?.email || "admin@example.com"}</p>
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
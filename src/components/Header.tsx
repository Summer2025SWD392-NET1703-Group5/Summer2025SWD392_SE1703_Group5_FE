import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useLocation, NavLink } from "react-router-dom";
import {
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
  FilmIcon,
  HomeIcon,
  TicketIcon,
  UserIcon,
  BellIcon,
  ChevronDownIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  BuildingOfficeIcon,
  ClockIcon,
  MapPinIcon,
  TagIcon,
  UserCircleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { Popover, Transition } from "@headlessui/react";
import { useAuth } from "../contexts/SimpleAuthContext";
import { useNotification } from "../contexts/NotificationContext";
import { Fragment } from "react/jsx-runtime";
import api from "../config/api";
import { toast } from "react-hot-toast";

const Header: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isCinemaMenuOpen, setIsCinemaMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const notificationRef = useRef<HTMLDivElement>(null);
  const cinemaMenuRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();

  // Function to get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircleIcon className="h-5 w-5 text-green-400" />;
      case "info":
        return <InformationCircleIcon className="h-5 w-5 text-blue-400" />;
      case "warning":
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />;
      case "error":
        return <XCircleIcon className="h-5 w-5 text-red-400" />;
      default:
        return <BellIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  // Function to translate role to Vietnamese
  const translateRole = (role: string) => {
    const roleTranslations: { [key: string]: string } = {
      Customer: "Khách hàng",
      Staff: "Nhân viên",
      Manager: "Quản lý",
      Admin: "Quản trị viên",
    };
    return roleTranslations[role] || role;
  };

  // Use useCallback for the scroll handler
  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 50);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close all menus when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsNotificationOpen(false);
    setIsCinemaMenuOpen(false);
    setIsSearchOpen(false);
    // Các menu khác sử dụng Popover của Headless UI sẽ tự động đóng khi người dùng chuyển trang
    console.log(`Đóng tất cả menu khi chuyển đến: ${location.pathname}`);
  }, [location.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/movies?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  // Navigation items dựa trên role
  const getNavItems = () => {
    // Staff chỉ được xem một số trang nhất định
    if (user?.role === "Staff") {
      return [
        { name: "Lịch chiếu", path: "/showtimes", icon: ClockIcon },
        { name: "Quét vé", path: "/staff/scanner", icon: TicketIcon },
      ];
    }

    // Navigation mặc định cho Customer và Guest
    return [
      { name: "Trang Chủ", path: "/", icon: HomeIcon },
      { name: "Phim", path: "/movies", icon: FilmIcon },
      {
        name: "Rạp Chiếu",
        path: "/cinemas",
        icon: BuildingOfficeIcon,
        hasDropdown: true,
        dropdownItems: [
          { name: "Tất cả rạp", path: "/cinemas", icon: BuildingOfficeIcon },
          { name: "Lịch chiếu", path: "/showtimes", icon: ClockIcon },
        ],
      },
      { name: "Khuyến Mãi", path: "/promotions", icon: TagIcon },
    ];
  };

  const navItems = getNavItems();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  // Add custom CSS for the text animation and search animation
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      /* Search animation */
      @keyframes searchAppear {
        0% {
          width: 0;
          opacity: 0;
          transform: translateX(50px);
        }
        100% {
          width: 100%;
          opacity: 1;
          transform: translateX(0);
        }
      }

      .search-container {
        position: relative;
        overflow: hidden;
      }

      .search-animation {
        animation: searchAppear 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
      }

      .search-glow:focus-within, .search-glow:focus {
        border-color: #FFD875;
        box-shadow: 0 0 20px rgba(255, 216, 117, 0.6);
      }

      .search-button {
        background-color: #FFD875;
        color: #000;
        transition: all 0.3s ease;
      }

      .search-button:hover {
        background-color: #FFD875;
        box-shadow: 0 0 15px rgba(255, 216, 117, 0.8);
        transform: scale(1.1);
      }
      
      /* Notification animation */
      @keyframes notificationGlow {
        0% {
          box-shadow: 0 0 5px rgba(255, 216, 117, 0.3);
        }
        50% {
          box-shadow: 0 0 15px rgba(255, 216, 117, 0.7);
        }
        100% {
          box-shadow: 0 0 5px rgba(255, 216, 117, 0.3);
        }
      }
      
      .notification-item {
        transition: all 0.3s ease;
      }
      
      .notification-item:hover {
        background-color: rgba(255, 216, 117, 0.1);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      }
      
      .notification-unread {
        border-left: 3px solid #FFD875;
        animation: notificationGlow 2s infinite;
      }
      
      .notification-read-button {
        color: #FFD875;
        font-weight: 500;
        transition: all 0.3s ease;
      }
      
      .notification-read-button:hover {
        color: white;
        text-shadow: 0 0 10px rgba(255, 216, 117, 0.8);
      }

      /* Advanced Button Effects */
      @keyframes breathe {
        0%, 100% {
          box-shadow: 0 0 20px rgba(255, 216, 117, 0.4);
        }
        50% {
          box-shadow: 0 0 30px rgba(255, 216, 117, 0.8);
        }
      }

      @keyframes shimmerText {
        0% {
          background-position: -200% 0;
        }
        100% {
          background-position: 200% 0;
        }
      }

      @keyframes ripple {
        0% {
          transform: scale(0);
          opacity: 1;
        }
        100% {
          transform: scale(4);
          opacity: 0;
        }
      }

      @keyframes floating {
        0%, 100% {
          transform: translateY(0px) rotate(0deg);
        }
        33% {
          transform: translateY(-10px) rotate(5deg);
        }
        66% {
          transform: translateY(5px) rotate(-3deg);
        }
      }

      @keyframes magneticHover {
        0% {
          transform: translateY(0) scale(1);
        }
        50% {
          transform: translateY(-3px) scale(1.02);
        }
        100% {
          transform: translateY(0) scale(1);
        }
      }

      @keyframes glowPulse {
        0%, 100% {
          filter: drop-shadow(0 0 5px rgba(255, 216, 117, 0.8));
        }
        50% {
          filter: drop-shadow(0 0 20px rgba(255, 216, 117, 1));
        }
      }

      .btn-login {
        position: relative;
        overflow: hidden;
      }

      .btn-login::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        background: radial-gradient(circle, rgba(255, 216, 117, 0.3) 0%, transparent 70%);
        transition: all 0.6s ease;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        z-index: 0;
      }

      .btn-login:hover::before {
        width: 300px;
        height: 300px;
      }

      .btn-login:hover {
        animation: magneticHover 0.6s ease-in-out;
      }

      .btn-login .btn-text {
        position: relative;
        z-index: 10;
        background: linear-gradient(90deg, transparent, rgba(255, 216, 117, 0.9), transparent);
        background-size: 200% 100%;
        background-clip: text;
        -webkit-background-clip: text;
        animation: shimmerText 2s infinite linear;
      }

      .btn-login:hover .btn-text {
        animation: shimmerText 0.8s infinite linear;
      }

      .btn-register {
        position: relative;
        overflow: hidden;
        animation: breathe 3s infinite ease-in-out;
      }

      .btn-register::after {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
        transition: left 0.7s ease;
        z-index: 5;
      }

      .btn-register:hover::after {
        left: 100%;
      }

      .btn-register:hover {
        animation: breathe 1s infinite ease-in-out, glowPulse 1.5s infinite ease-in-out;
        transform: scale(1.05) translateY(-2px);
      }

      .btn-register .btn-text {
        position: relative;
        z-index: 10;
        animation: floating 4s infinite ease-in-out;
      }

      .btn-register:hover .btn-text {
        animation: floating 2s infinite ease-in-out;
      }

      /* Ripple Effect */
      .ripple-effect {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 216, 117, 0.6);
        pointer-events: none;
        animation: ripple 0.6s linear;
        z-index: 1;
      }

      /* Particle Effects */
      .particle {
        position: absolute;
        width: 4px;
        height: 4px;
        background: #FFD875;
        border-radius: 50%;
        pointer-events: none;
        animation: particleFloat 3s linear infinite;
        z-index: 2;
      }

      @keyframes particleFloat {
        0% {
          opacity: 0;
          transform: translateY(0) scale(0);
        }
        10% {
          opacity: 1;
          transform: translateY(-10px) scale(1);
        }
        90% {
          opacity: 1;
          transform: translateY(-50px) scale(0.5);
        }
        100% {
          opacity: 0;
          transform: translateY(-60px) scale(0);
        }
      }

      /* Enhanced 3D tilt effect */
      .btn-3d-tilt {
        transform-style: preserve-3d;
        perspective: 1000px;
        transition: transform 0.3s ease;
      }

      .btn-3d-tilt:hover {
        transform: rotateX(10deg) rotateY(10deg) translateZ(20px);
      }

      /* Magnetic field effect */
      .magnetic-field::before {
        content: '';
        position: absolute;
        top: -20px;
        left: -20px;
        right: -20px;
        bottom: -20px;
        background: radial-gradient(circle, rgba(255, 216, 117, 0.1) 0%, transparent 70%);
        border-radius: 50%;
        opacity: 0;
        transition: opacity 0.3s ease;
        z-index: -1;
      }

      .magnetic-field:hover::before {
        opacity: 1;
        animation: ripple 2s infinite;
      }

      /* Additional micro-interactions */
      .btn-login:active {
        transform: scale(0.95);
        transition: transform 0.1s ease;
      }

      .btn-register:active {
        transform: scale(0.95) translateY(-2px);
        transition: transform 0.1s ease;
      }

      /* Performance optimizations */
      .btn-login, .btn-register {
        will-change: transform, filter, box-shadow;
        backface-visibility: hidden;
        transform-style: preserve-3d;
      }

      /* Enhanced glow on focus for accessibility */
      .btn-login:focus-visible,
      .btn-register:focus-visible {
        outline: 2px solid #FFD875;
        outline-offset: 2px;
        box-shadow: 0 0 0 4px rgba(255, 216, 117, 0.3);
      }

      /* Reduce motion for users with motion sensitivity */
      @media (prefers-reduced-motion: reduce) {
        .btn-login, .btn-register {
          animation: none !important;
        }
        
        .btn-login *, .btn-register * {
          animation: none !important;
          transition: opacity 0.2s ease, background-color 0.2s ease !important;
        }
      }

      /* Enhanced mobile touch interactions */
      @media (max-width: 1024px) {
        .btn-3d-tilt:hover {
          transform: none;
        }
        
        .btn-login:active, .btn-register:active {
          transform: scale(0.98);
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Create ripple effect
  const createRipple = (event: React.MouseEvent<HTMLElement>) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const ripple = document.createElement("span");
    ripple.className = "ripple-effect";
    ripple.style.width = ripple.style.height = size + "px";
    ripple.style.left = x + "px";
    ripple.style.top = y + "px";

    button.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  };

  // Create particle effect
  const createParticles = (event: React.MouseEvent<HTMLElement>) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();

    for (let i = 0; i < 6; i++) {
      const particle = document.createElement("span");
      particle.className = "particle";

      const x = Math.random() * rect.width;
      const y = Math.random() * rect.height;

      particle.style.left = x + "px";
      particle.style.top = y + "px";
      particle.style.animationDelay = Math.random() * 0.5 + "s";

      button.appendChild(particle);

      setTimeout(() => {
        particle.remove();
      }, 3000);
    }
  };

  // Combined click handler
  const handleButtonClick = (event: React.MouseEvent<HTMLElement>) => {
    createRipple(event);
    createParticles(event);
  };

  // Thêm useEffect để lắng nghe sự kiện cập nhật thông báo
  useEffect(() => {
    const handleNotificationsUpdate = (event: CustomEvent) => {
      // Cập nhật lại trạng thái hiển thị dựa trên dữ liệu từ sự kiện
      if (event.detail && typeof event.detail.unreadCount === "number") {
        // Không cần set thủ công vì useNotification đã cập nhật
      }
    };

    // Thêm event listener kiểu typesafe
    window.addEventListener("notifications-update", handleNotificationsUpdate as EventListener);

    return () => {
      window.removeEventListener("notifications-update", handleNotificationsUpdate as EventListener);
    };
  }, []);

  // Hàm đánh dấu tất cả thông báo là đã đọc
  const handleMarkAllNotificationsAsRead = async () => {
    try {
      // Gọi API trực tiếp
      await api.put("/notifications/mark-all-read");

      // Cập nhật context sau khi API thành công
      markAllAsRead();

      // Thêm thông báo thành công
      toast.success("Đã đánh dấu tất cả thông báo là đã đọc");

      // Tải lại trang để cập nhật UI
      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (error) {
      console.error("Lỗi khi đánh dấu đã đọc tất cả thông báo:", error);
      toast.error("Không thể đánh dấu đã đọc");
    }
  };

  // Hàm đánh dấu một thông báo đã đọc
  const handleMarkNotificationAsRead = async (notificationId: number) => {
    try {
      // Gọi API trực tiếp
      await api.put(`/notifications/${notificationId}/read`);

      // Cập nhật context sau khi API thành công
      markAsRead(notificationId);

      // Kiểm tra nếu đây là thông báo chưa đọc cuối cùng
      const remainingUnread = notifications.filter((n) => !n.Is_Read && n.Notification_ID !== notificationId).length;
      if (remainingUnread === 0) {
        // Nếu không còn thông báo chưa đọc nào, tải lại trang
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
    } catch (error) {
      console.error(`Lỗi khi đánh dấu đã đọc thông báo ${notificationId}:`, error);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "glass-dark shadow-2xl" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-[#FFD875] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(255,216,117,0.5)]">
              <FilmIcon className="w-6 h-6 text-black" />
            </div>
            <div className="hidden sm:flex flex-col">
              <h1 className="text-xl font-bold text-white uppercase tracking-wider leading-tight">Galaxy Cinema</h1>
              <p className="text-[10px] text-[#FFD875] uppercase tracking-widest leading-tight -mt-1">
                Vũ Trụ Điện Ảnh
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;

              if (item.hasDropdown) {
                return (
                  <div key={item.name} className="relative" ref={cinemaMenuRef}>
                    <button
                      onClick={() => setIsCinemaMenuOpen(!isCinemaMenuOpen)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 group ${
                        isActive(item.path)
                          ? "text-[#FFD875] bg-[#FFD875]/10"
                          : "text-gray-300 hover:text-[#FFD875] hover:bg-[#FFD875]/5"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.name}</span>
                      <ChevronDownIcon
                        className={`w-4 h-4 transition-transform duration-300 ${isCinemaMenuOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {/* Cinema Dropdown */}
                    {isCinemaMenuOpen && (
                      <div className="absolute top-full left-0 mt-2 w-56 glass-dark rounded-xl shadow-2xl border border-gray-700/50 z-50 animate-fadeInUp">
                        <div className="py-2">
                          {item.dropdownItems?.map((dropdownItem) => {
                            const DropdownIcon = dropdownItem.icon;
                            return (
                              <Link
                                key={dropdownItem.name}
                                to={dropdownItem.path}
                                className="flex items-center space-x-3 px-4 py-2 hover:bg-[#FFD875]/5 text-gray-300 hover:text-[#FFD875] transition-colors"
                                onClick={() => setIsCinemaMenuOpen(false)}
                              >
                                <DropdownIcon className="w-5 h-5" />
                                <span>{dropdownItem.name}</span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 group ${
                      isActive
                        ? "text-[#FFD875] bg-[#FFD875]/10"
                        : "text-gray-300 hover:text-[#FFD875] hover:bg-[#FFD875]/5"
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative hidden md:block" ref={notificationRef}>
              <Popover className="relative">
                {({ open }: { open: boolean }) => (
                  <>
                    <Popover.Button className="relative flex items-center p-2 text-gray-400 hover:text-white focus:outline-none group transition-all duration-300">
                      <span className="sr-only">View notifications</span>
                      <BellIcon
                        className="h-6 w-6 transition-all duration-300 group-hover:scale-110 group-hover:text-[#FFD875]"
                        aria-hidden="true"
                      />
                      {unreadCount > 0 && (
                        <div className="absolute top-0 right-0 flex h-5 w-5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gradient-to-r from-red-400 to-red-500 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-5 w-5 bg-gradient-to-r from-red-500 to-red-600 items-center justify-center text-xs font-bold text-white shadow-[0_0_10px_rgba(239,68,68,0.6)]">
                            {unreadCount > 99 ? "99+" : unreadCount}
                          </span>
                        </div>
                      )}
                    </Popover.Button>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="opacity-0 translate-y-1"
                      enterTo="opacity-100 translate-y-0"
                      leave="transition ease-in duration-150"
                      leaveFrom="opacity-100 translate-y-0"
                      leaveTo="opacity-0 translate-y-1"
                    >
                      <Popover.Panel className="absolute right-0 z-50 mt-3 w-80 max-h-96 overflow-hidden transform px-4 sm:px-0 lg:max-w-3xl">
                        <div className="overflow-hidden rounded-xl shadow-2xl ring-1 ring-black/20 backdrop-blur-sm">
                          <div className="relative bg-slate-800/95 border border-slate-600/50 rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.6)] backdrop-blur-lg">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#FFD875]/5 via-transparent to-slate-900/20 rounded-xl"></div>
                            <div className="relative z-10">
                              <div className="flex justify-between items-center p-3 border-b border-slate-600/50">
                                <h3 className="text-base font-semibold text-[#FFD875] flex items-center gap-2">
                                  <BellIcon className="w-4 h-4" />
                                  Thông báo
                                </h3>
                                {unreadCount > 0 && (
                                  <button
                                    onClick={handleMarkAllNotificationsAsRead}
                                    className="notification-read-button text-xs hover:underline transition-all duration-300 hover:text-[#FFD875] px-2 py-1 rounded-md hover:bg-[#FFD875]/10"
                                  >
                                    Đánh dấu tất cả là đã đọc
                                  </button>
                                )}
                              </div>
                              {notifications.length > 0 ? (
                                <div className="flow-root max-h-80 overflow-y-auto">
                                  <ul role="list" className="divide-y divide-slate-600/30">
                                    {notifications.slice(0, 10).map((notification, index) => (
                                      <li
                                        key={notification.Notification_ID}
                                        className="py-1"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                      >
                                        <div
                                          onClick={() => handleMarkNotificationAsRead(notification.Notification_ID)}
                                          className={`block p-2.5 rounded-lg transition-all duration-300 cursor-pointer notification-item group ${
                                            notification.Is_Read
                                              ? "hover:bg-slate-700/20"
                                              : "notification-unread bg-[#FFD875]/5 border-l-3 border-l-[#FFD875]"
                                          }`}
                                        >
                                          <div className="flex items-start gap-2.5">
                                            <div className="flex-shrink-0 mt-0.5 p-1 bg-slate-700/30 rounded group-hover:bg-slate-600/30 transition-colors duration-300">
                                              {getNotificationIcon(notification.Type)}
                                            </div>
                                            <div className="flex-grow min-w-0">
                                              <p className="text-sm font-medium text-white group-hover:text-[#FFD875] transition-colors duration-300 truncate">
                                                {notification.Title}
                                              </p>
                                              <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                                                {notification.Content}
                                              </p>
                                              <div className="flex justify-between items-center mt-1.5">
                                                <p className="text-xs text-gray-500 bg-slate-700/20 px-1.5 py-0.5 rounded-full">
                                                  {new Date(notification.Creation_Date).toLocaleString("vi-VN", {
                                                    month: "short",
                                                    day: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                  })}
                                                </p>
                                                {!notification.Is_Read && (
                                                  <div className="flex items-center gap-1">
                                                    <span className="inline-block w-1.5 h-1.5 bg-[#FFD875] rounded-full animate-pulse"></span>
                                                    <span className="text-xs text-[#FFD875] font-medium">Mới</span>
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ) : (
                                <div className="text-center text-gray-500 py-8">
                                  <BellIcon className="w-12 h-12 mx-auto text-gray-600 mb-3 opacity-50" />
                                  <h3 className="text-base font-medium text-white mb-1">Chưa có thông báo</h3>
                                  <p className="text-xs">Bạn hiện không có thông báo nào.</p>
                                </div>
                              )}
                              <div className="border-t border-slate-600/50 p-3 text-center bg-slate-800/30">
                                <Link
                                  to="/profile/notifications"
                                  className="text-xs font-medium text-[#FFD875] hover:text-[#FFD875]/80 notification-read-button transition-all duration-300 px-3 py-1.5 rounded-lg hover:bg-[#FFD875]/10 inline-flex items-center gap-1.5"
                                >
                                  <BellIcon className="w-3 h-3" />
                                  Xem tất cả thông báo
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Popover.Panel>
                    </Transition>
                  </>
                )}
              </Popover>
            </div>

            {/* User Profile */}
            {user ? (
              <Popover className="relative">
                {({ open }) => (
                  <>
                    <Popover.Button className="flex items-center gap-x-2 text-sm font-semibold leading-6 text-white outline-none hover:text-[#FFD875] transition-colors duration-300 group">
                      <img
                        src={
                          user.avatar ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            user.fullName
                          )}&background=ffd875&color=000&bold=true`
                        }
                        alt={user.fullName}
                        className="h-8 w-8 rounded-full bg-gray-50 ring-2 ring-transparent group-hover:ring-[#FFD875]/30 transition-all duration-300"
                      />
                      <span className="hidden sm:block group-hover:text-[#FFD875] transition-colors duration-300">
                        {user.fullName}
                      </span>
                      {/* Role Badge */}
                      {["Admin", "Manager"].includes(user.role) && (
                        <span className="hidden sm:block px-2 py-1 text-xs font-medium bg-[#FFD875] text-black rounded-full">
                          {translateRole(user.role)}
                        </span>
                      )}
                      <ChevronDownIcon
                        className={`h-5 w-5 transition-transform ${open ? "rotate-180" : ""}`}
                        aria-hidden="true"
                      />
                    </Popover.Button>

                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="opacity-0 translate-y-1"
                      enterTo="opacity-100 translate-y-0"
                      leave="transition ease-in duration-150"
                      leaveFrom="opacity-100 translate-y-0"
                      leaveTo="opacity-0 translate-y-1"
                    >
                      <Popover.Panel className="absolute right-0 top-full z-10 mt-3 w-screen max-w-xs overflow-hidden rounded-xl bg-gray-800 shadow-lg ring-1 ring-gray-700">
                        <div className="p-4">
                          {/* Admin Dashboard Link for Admin/Manager */}
                          {["Admin", "Manager"].includes(user.role) && (
                            <div className="group relative flex items-center gap-x-6 rounded-lg p-3 text-sm leading-6 hover:bg-gray-700 mb-2 border border-[#FFD875]/30 bg-[#FFD875]/5">
                              <div className="flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-[#FFD875] group-hover:bg-[#FFD875]/80">
                                <CogIcon className="h-6 w-6 text-black" aria-hidden="true" />
                              </div>
                              <div className="flex-auto">
                                <Link
                                  to="/admin/dashboard"
                                  className="block font-semibold text-[#FFD875] group-hover:text-white"
                                >
                                  Admin Dashboard
                                  <span className="absolute inset-0" />
                                </Link>
                                <p className="mt-1 text-gray-400">Quản lý hệ thống</p>
                              </div>
                            </div>
                          )}

                          {/* Customer Profile Links */}
                          {user.role === "Customer" && (
                            <>
                              <div className="group relative flex items-center gap-x-6 rounded-lg p-3 text-sm leading-6 hover:bg-gray-700">
                                <div className="flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-gray-700 group-hover:bg-gray-600">
                                  <UserCircleIcon className="h-6 w-6 text-white" aria-hidden="true" />
                                </div>
                                <div className="flex-auto">
                                  <Link to="/profile" className="block font-semibold text-white">
                                    Trang cá nhân
                                    <span className="absolute inset-0" />
                                  </Link>
                                  <p className="mt-1 text-gray-400">Xem và chỉnh sửa thông tin</p>
                                </div>
                              </div>
                            </>
                          )}

                          {/* Staff Profile Links */}
                          {user.role === "Staff" && (
                            <>
                              <div className="group relative flex items-center gap-x-6 rounded-lg p-3 text-sm leading-6 hover:bg-gray-700 mb-2 border border-blue-500/30 bg-blue-500/5">
                                <div className="flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-blue-500 group-hover:bg-blue-600">
                                  <ClockIcon className="h-6 w-6 text-white" aria-hidden="true" />
                                </div>
                                <div className="flex-auto">
                                  <Link
                                    to="/showtimes"
                                    className="block font-semibold text-blue-400 group-hover:text-white"
                                  >
                                    Lịch chiếu
                                    <span className="absolute inset-0" />
                                  </Link>
                                  <p className="mt-1 text-gray-400">Xem và đặt vé cho khách</p>
                                </div>
                              </div>
                              <div className="group relative flex items-center gap-x-6 rounded-lg p-3 text-sm leading-6 hover:bg-gray-700 mb-2">
                                <div className="flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-gray-700 group-hover:bg-gray-600">
                                  <TicketIcon className="h-6 w-6 text-white" aria-hidden="true" />
                                </div>
                                <div className="flex-auto">
                                  <Link to="/staff/scanner" className="block font-semibold text-white">
                                    Quét vé
                                    <span className="absolute inset-0" />
                                  </Link>
                                  <p className="mt-1 text-gray-400">Scan và kiểm tra vé</p>
                                </div>
                              </div>
                              <div className="group relative flex items-center gap-x-6 rounded-lg p-3 text-sm leading-6 hover:bg-gray-700">
                                <div className="flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-gray-700 group-hover:bg-gray-600">
                                  <CogIcon className="h-6 w-6 text-white" aria-hidden="true" />
                                </div>
                                <div className="flex-auto">
                                  <Link to="/profile/settings" className="block font-semibold text-white">
                                    Cài đặt
                                    <span className="absolute inset-0" />
                                  </Link>
                                  <p className="mt-1 text-gray-400">Thiết lập tài khoản</p>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                        <div className="divide-y divide-gray-700">
                          {/* User Info */}
                          <div className="p-4 bg-gray-900/50">
                            <div className="flex items-center gap-x-3">
                              <img
                                src={
                                  user.avatar ||
                                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    user.fullName
                                  )}&background=ffd875&color=000&bold=true`
                                }
                                alt={user.fullName}
                                className="h-10 w-10 rounded-full bg-gray-50"
                              />
                              <div>
                                <p className="text-sm font-medium text-white">{user.fullName}</p>
                                <p className="text-xs text-gray-400">{user.email}</p>
                                <span
                                  className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${
                                    user.role === "Admin"
                                      ? "bg-red-500/20 text-red-400"
                                      : user.role === "Manager"
                                      ? "bg-orange-500/20 text-orange-400"
                                      : user.role === "Staff"
                                      ? "bg-blue-500/20 text-blue-400"
                                      : "bg-green-500/20 text-green-400"
                                  }`}
                                >
                                  {translateRole(user.role)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="p-4">
                            <button
                              onClick={logout}
                              className="group flex w-full items-center gap-x-3 rounded-md px-3 py-2 text-sm font-semibold leading-6 text-white hover:bg-red-500/20 hover:text-red-400"
                            >
                              <ArrowRightOnRectangleIcon className="h-5 w-5" aria-hidden="true" />
                              Đăng xuất
                            </button>
                          </div>
                        </div>
                      </Popover.Panel>
                    </Transition>
                  </>
                )}
              </Popover>
            ) : (
              <div className="hidden lg:flex items-center space-x-3">
                {/* Login Button */}
                <Link
                  to="/login"
                  onClick={handleButtonClick}
                  className="btn-login btn-3d-tilt magnetic-field group relative px-6 py-2.5 font-medium text-white transition-all duration-300 hover:text-black overflow-hidden rounded-lg"
                >
                  <span className="btn-text relative z-10">Đăng nhập</span>
                  <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 group-hover:border-[#FFD875] transition-all duration-300"></div>
                  <div className="absolute inset-0 bg-[#FFD875]/0 rounded-lg opacity-0 group-hover:opacity-100 group-hover:bg-[#FFD875]/20 transition-all duration-500"></div>
                  <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 shadow-[0_0_20px_rgba(255,216,117,0.4)] transition-all duration-300"></div>
                </Link>

                {/* Register Button */}
                <Link
                  to="/register"
                  onClick={handleButtonClick}
                  className="btn-register btn-3d-tilt magnetic-field group relative px-6 py-2.5 font-medium text-black overflow-hidden rounded-lg transition-all duration-300"
                >
                  <span className="btn-text relative z-10">Đăng ký</span>
                  <div className="absolute inset-0 bg-[#FFD875] rounded-lg shadow-[0_0_20px_rgba(255,216,117,0.5)] group-hover:shadow-[0_0_30px_rgba(255,216,117,0.8)] transition-all duration-300"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <div className="absolute -inset-1 bg-[#FFD875] rounded-lg opacity-0 group-hover:opacity-75 blur-sm transition-all duration-300"></div>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-300 hover:text-[#FFD875] transition-colors duration-300"
            >
              {isMobileMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {isSearchOpen && (
          <div className="pb-4 search-container overflow-hidden">
            <form onSubmit={handleSearch} className="relative max-w-md mx-auto search-animation">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm phim, rạp chiếu..."
                className="w-full px-4 py-3 pr-14 glass-dark border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none search-glow transition-all duration-300"
                autoFocus
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full search-button"
                aria-label="Tìm kiếm"
              >
                <MagnifyingGlassIcon className="w-5 h-5" />
              </button>
            </form>
          </div>
        )}

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden pb-4 animate-fadeInUp">
            <nav className="flex flex-col space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;

                if (item.hasDropdown) {
                  return (
                    <div key={item.name}>
                      <Link
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                          isActive(item.path)
                            ? "text-[#FFD875] bg-[#FFD875]/10"
                            : "text-gray-300 hover:text-[#FFD875] hover:bg-[#FFD875]/5"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.name}</span>
                      </Link>

                      {/* Mobile Cinema Submenu */}
                      <div className="ml-4 mt-2 space-y-1">
                        {item.dropdownItems?.map((dropdownItem) => {
                          const DropdownIcon = dropdownItem.icon;
                          return (
                            <Link
                              key={dropdownItem.name}
                              to={dropdownItem.path}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="flex items-center space-x-3 px-4 py-2 text-gray-400 hover:text-[#FFD875] hover:bg-[#FFD875]/5 rounded-lg transition-colors text-sm"
                            >
                              <DropdownIcon className="w-4 h-4" />
                              <span>{dropdownItem.name}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                      isActive(item.path)
                        ? "text-[#FFD875] bg-[#FFD875]/10"
                        : "text-gray-300 hover:text-[#FFD875] hover:bg-[#FFD875]/5"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}

              {/* Mobile Notifications */}
              <div className="px-4 py-3 border-t border-gray-700/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <BellIcon className="w-5 h-5 text-[#FFD875]" />
                    <span className="text-gray-300 font-medium">Thông báo</span>
                  </div>
                  {unreadCount > 0 && (
                    <div className="relative flex h-6 w-6">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gradient-to-r from-red-400 to-red-500 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-6 w-6 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs items-center justify-center font-bold shadow-[0_0_10px_rgba(239,68,68,0.6)]">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    </div>
                  )}
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.slice(0, 3).map((notification, index) => (
                      <div
                        key={notification.Notification_ID}
                        onClick={() => handleMarkNotificationAsRead(notification.Notification_ID)}
                        className={`p-2.5 rounded-lg border transition-all duration-300 cursor-pointer group ${
                          !notification.Is_Read
                            ? "bg-[#FFD875]/5 border-[#FFD875]/20 border-l-3 border-l-[#FFD875]"
                            : "bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50"
                        }`}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="flex-shrink-0 mt-0.5 p-1 bg-slate-700/30 rounded group-hover:bg-slate-600/30 transition-colors duration-300">
                            {getNotificationIcon(notification.Type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate group-hover:text-[#FFD875] transition-colors duration-300">
                              {notification.Title}
                            </p>
                            <p className="text-xs text-gray-400 mt-1 line-clamp-2">{notification.Content}</p>
                            <div className="flex items-center justify-between mt-1.5">
                              <p className="text-xs text-gray-500 bg-slate-700/20 px-1.5 py-0.5 rounded-full">
                                {new Date(notification.Creation_Date).toLocaleString("vi-VN", {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                              {!notification.Is_Read && <span className="text-xs text-[#FFD875] font-medium">Mới</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-3">
                      <BellIcon className="w-6 h-6 mx-auto text-gray-600 mb-1.5 opacity-50" />
                      <p className="text-xs">Chưa có thông báo</p>
                    </div>
                  )}
                </div>
                {notifications.length > 3 && (
                  <div className="mt-3 pt-2 border-t border-gray-700/30">
                    <Link
                      to="/profile/notifications"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block text-center text-xs text-[#FFD875] hover:text-[#FFD875]/80 transition-colors duration-300"
                    >
                      Xem tất cả thông báo
                    </Link>
                  </div>
                )}
              </div>

              {/* Mobile User Profile */}
              {user && (
                <div className="px-4 py-3 border-t border-gray-700/50">
                  <div className="flex items-center space-x-3 mb-3 p-2 rounded-lg">
                    <img
                      src={
                        user.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          user.fullName
                        )}&background=ffd875&color=000&bold=true`
                      }
                      alt={user.fullName}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-[#FFD875]/30"
                    />
                    <div>
                      <p className="text-white font-medium">{user.fullName}</p>
                      <p className="text-gray-400 text-sm">{user.email}</p>
                      <span
                        className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${
                          user.role === "Admin"
                            ? "bg-red-500/20 text-red-400"
                            : user.role === "Manager"
                            ? "bg-orange-500/20 text-orange-400"
                            : user.role === "Staff"
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-green-500/20 text-green-400"
                        }`}
                      >
                        {translateRole(user.role)}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {/* Staff-specific mobile menu */}
                    {user.role === "Staff" ? (
                      <>
                        <Link
                          to="/showtimes"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center space-x-2 px-3 py-2 text-blue-400 hover:text-[#FFD875] hover:bg-[#FFD875]/5 rounded-lg transition-colors"
                        >
                          <ClockIcon className="w-4 h-4" />
                          <span className="text-sm">Lịch chiếu</span>
                        </Link>
                        <Link
                          to="/staff/scanner"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-[#FFD875] hover:bg-[#FFD875]/5 rounded-lg transition-colors"
                        >
                          <TicketIcon className="w-4 h-4" />
                          <span className="text-sm">Quét vé</span>
                        </Link>
                      </>
                    ) : (
                      /* Customer/other roles mobile menu */
                      <>
                        <Link
                          to="/profile"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-[#FFD875] hover:bg-[#FFD875]/5 rounded-lg transition-colors"
                        >
                          <UserCircleIcon className="w-4 h-4" />
                          <span className="text-sm">Trang cá nhân</span>
                        </Link>
                      </>
                    )}

                    {/* Common profile link for Staff */}
                    {user.role === "Staff" && (
                      <Link
                        to="/profile"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-[#FFD875] hover:bg-[#FFD875]/5 rounded-lg transition-colors"
                      >
                        <UserCircleIcon className="w-4 h-4" />
                        <span className="text-sm">Thông tin cá nhân</span>
                      </Link>
                    )}

                    <button
                      onClick={logout}
                      className="flex items-center space-x-2 w-full px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                    >
                      <ArrowRightOnRectangleIcon className="w-4 h-4" />
                      <span className="text-sm">Đăng xuất</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Mobile Login/Register Buttons */}
              {!user && (
                <div className="px-4 py-3 border-t border-gray-700/50 space-y-3">
                  <Link
                    to="/login"
                    onClick={(e) => {
                      handleButtonClick(e);
                      setIsMobileMenuOpen(false);
                    }}
                    className="btn-login btn-3d-tilt magnetic-field group relative w-full px-6 py-3 font-medium text-white transition-all duration-300 hover:text-black overflow-hidden rounded-lg block text-center"
                  >
                    <span className="btn-text relative z-10">Đăng nhập</span>
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 group-hover:border-[#FFD875] transition-all duration-300"></div>
                    <div className="absolute inset-0 bg-[#FFD875]/0 rounded-lg opacity-0 group-hover:opacity-100 group-hover:bg-[#FFD875]/20 transition-all duration-500"></div>
                    <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 shadow-[0_0_20px_rgba(255,216,117,0.4)] transition-all duration-300"></div>
                  </Link>

                  <Link
                    to="/register"
                    onClick={(e) => {
                      handleButtonClick(e);
                      setIsMobileMenuOpen(false);
                    }}
                    className="btn-register btn-3d-tilt magnetic-field group relative w-full px-6 py-3 font-medium text-black overflow-hidden rounded-lg transition-all duration-300 block text-center"
                  >
                    <span className="btn-text relative z-10">Đăng ký</span>
                    <div className="absolute inset-0 bg-[#FFD875] rounded-lg shadow-[0_0_20px_rgba(255,216,117,0.5)] group-hover:shadow-[0_0_30px_rgba(255,216,117,0.8)] transition-all duration-300"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    <div className="absolute -inset-1 bg-[#FFD875] rounded-lg opacity-0 group-hover:opacity-75 blur-sm transition-all duration-300"></div>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
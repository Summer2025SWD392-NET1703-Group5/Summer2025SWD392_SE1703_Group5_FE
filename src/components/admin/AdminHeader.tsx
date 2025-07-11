// src/components/admin/AdminHeader.tsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon,
  Cog6ToothIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../contexts/SimpleAuthContext";
import cinemaService from "../../services/cinemaService";
import type { Cinema } from "../../types/cinema";

interface AdminHeaderProps {
  user: any;
  onToggleSidebar: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ user, onToggleSidebar }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [managerCinema, setManagerCinema] = useState<Cinema | null>(null);
  const [loadingCinema, setLoadingCinema] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchResultsRef = useRef<HTMLDivElement>(null);

  // Add CSS for glowing effect
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes pulse-glow {
        0%, 100% {
          box-shadow: 0 0 20px rgba(255, 216, 117, 0.4);
        }
        50% {
          box-shadow: 0 0 30px rgba(255, 216, 117, 0.8);
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      try {
        document.head.removeChild(style);
      } catch (e) {
        // Style already removed
      }
    };
  }, []);

  // Load cinema information if user is manager
  useEffect(() => {
    const loadManagerCinema = async () => {
      if (user?.role === "Manager" && user?.email) {
        setLoadingCinema(true);
        try {
          const cinema = await cinemaService.getCinemaByManagerEmail(user.email);
          setManagerCinema(cinema);
        } catch (error) {
          console.error("Error loading manager cinema:", error);
        } finally {
          setLoadingCinema(false);
        }
      }
    };

    loadManagerCinema();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchVisible(false);
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isSearchVisible && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchVisible]);

  // Debounced search function
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchQuery.trim().length > 0) {
        performSearch(searchQuery);
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery]);

  const performSearch = async (query: string) => {
    try {
      // Mock search results - replace with actual API calls
      const mockResults = [
        // Movies
        {
          type: "movie",
          id: 1,
          title: "Avatar: The Way of Water",
          subtitle: "Phim đang chiếu",
          path: "/admin/movies/1",
        },
        { type: "movie", id: 2, title: "Top Gun: Maverick", subtitle: "Phim đang chiếu", path: "/admin/movies/2" },

        // Customers
        { type: "customer", id: 1, title: "Nguyễn Văn A", subtitle: "Khách hàng VIP", path: "/admin/customers/1" },
        { type: "customer", id: 2, title: "Trần Thị B", subtitle: "Khách hàng thường", path: "/admin/customers/2" },

        // Cinemas
        { type: "cinema", id: 1, title: "CGV Vincom Center", subtitle: "123 Nguyễn Huệ, Q1", path: "/admin/cinemas/1" },
        { type: "cinema", id: 2, title: "Lotte Cinema Diamond", subtitle: "456 Lê Lợi, Q1", path: "/admin/cinemas/2" },

        // Cinema Rooms
        {
          type: "room",
          id: 1,
          title: "Phòng 1 - CGV Vincom",
          subtitle: "120 ghế, 2D/3D",
          path: "/admin/cinema-rooms/1",
        },
        {
          type: "room",
          id: 2,
          title: "Phòng VIP - Lotte Diamond",
          subtitle: "80 ghế VIP",
          path: "/admin/cinema-rooms/2",
        },

        // Showtimes
        {
          type: "showtime",
          id: 1,
          title: "Avatar - 14:30",
          subtitle: "CGV Vincom, Phòng 1",
          path: "/admin/showtimes/1",
        },
        {
          type: "showtime",
          id: 2,
          title: "Top Gun - 19:45",
          subtitle: "Lotte Diamond, Phòng VIP",
          path: "/admin/showtimes/2",
        },
      ];

      const filteredResults = mockResults.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.subtitle.toLowerCase().includes(query.toLowerCase())
      );

      setSearchResults(filteredResults);
      setShowSearchResults(filteredResults.length > 0);
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  const getSearchIcon = (type: string) => {
    switch (type) {
      case "movie":
        return "🎬";
      case "customer":
        return "👤";
      case "cinema":
        return "🏢";
      case "room":
        return "🪑";
      case "showtime":
        return "🕐";
      default:
        return "📄";
    }
  };

  const getSearchTypeLabel = (type: string) => {
    switch (type) {
      case "movie":
        return "Phim";
      case "customer":
        return "Khách hàng";
      case "cinema":
        return "Rạp chiếu";
      case "room":
        return "Phòng chiếu";
      case "showtime":
        return "Suất chiếu";
      default:
        return "Khác";
    }
  };

  const handleSearchResultClick = (result: any) => {
    navigate(result.path);
    setSearchQuery("");
    setShowSearchResults(false);
    setIsSearchVisible(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      handleSearchResultClick(searchResults[0]);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleProfileClick = () => {
    navigate("/admin/profile");
    setShowUserMenu(false);
  };

  return (
    <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 backdrop-blur-xl border-b border-slate-700/50 shadow-lg">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side */}
          <div className="flex items-center space-x-6">
            <button
              onClick={onToggleSidebar}
              className="group flex items-center justify-center w-10 h-10 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600/30 hover:border-[#FFD875]/50 text-gray-400 hover:text-[#FFD875] transition-all duration-300 lg:hidden"
            >
              <Bars3Icon className="w-5 h-5" />
            </button>

            {/* Cinema name for manager */}
            {user?.role === "Manager" && managerCinema && (
              <div
                className="flex items-center space-x-3 bg-gradient-to-r from-[#FFD875]/20 to-amber-500/20 backdrop-blur-sm px-6 py-3 rounded-xl border border-[#FFD875]/30 shadow-lg"
                style={{
                  boxShadow: "0 0 20px rgba(255, 216, 117, 0.4)",
                  animation: "pulse-glow 2s infinite",
                }}
              >
                <div className="flex items-center justify-center w-8 h-8 bg-[#FFD875]/20 rounded-lg">
                  <BuildingOfficeIcon className="w-5 h-5 text-[#FFD875]" />
                </div>
                <div>
                  <span
                    className="text-[#FFD875] font-bold text-lg block"
                    style={{ textShadow: "0 0 10px rgba(255, 216, 117, 0.5)" }}
                  >
                    {managerCinema.Cinema_Name}
                  </span>
                  <span className="text-[#FFD875]/70 text-xs">Quản lý rạp</span>
                </div>
              </div>
            )}

            {/* Loading state for cinema */}
            {user?.role === "Manager" && loadingCinema && (
              <div className="flex items-center space-x-3 bg-slate-700/50 backdrop-blur-sm px-6 py-3 rounded-xl border border-slate-600/30">
                <div className="flex items-center justify-center w-8 h-8 bg-slate-600/50 rounded-lg">
                  <BuildingOfficeIcon className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <span className="text-gray-300 text-sm font-medium">Đang tải thông tin rạp...</span>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse mt-1"></div>
                </div>
              </div>
            )}

            {/* No cinema assigned for manager */}
            {user?.role === "Manager" && !loadingCinema && !managerCinema && (
              <div className="flex items-center space-x-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-sm px-6 py-3 rounded-xl border border-orange-500/30 shadow-lg">
                <div className="flex items-center justify-center w-8 h-8 bg-orange-500/20 rounded-lg">
                  <BuildingOfficeIcon className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <span className="text-orange-400 text-sm font-medium">Chưa được phân công rạp</span>
                  <span className="text-orange-400/70 text-xs block">Liên hệ admin để được hỗ trợ</span>
                </div>
              </div>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="flex items-center justify-end relative" ref={searchContainerRef}>
              <div
                className={`flex items-center transition-all duration-300 ease-in-out overflow-hidden ${
                  isSearchVisible ? "w-80" : "w-0"
                }`}
              >
                <form onSubmit={handleSearch} className="relative w-full">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Tìm kiếm phim, khách hàng, rạp, phòng, suất chiếu..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`bg-slate-700/50 backdrop-blur-sm text-white pl-12 pr-4 py-3 rounded-xl border border-slate-600/30 focus:border-[#FFD875]/50 focus:outline-none focus:ring-2 focus:ring-[#FFD875]/20 w-full transition-all duration-300 ${
                      isSearchVisible ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                  />
                </form>
              </div>

              {/* Search Results Dropdown */}
              {showSearchResults && isSearchVisible && (
                <div
                  ref={searchResultsRef}
                  className="absolute top-full right-0 mt-3 w-96 bg-slate-800/95 backdrop-blur-xl border border-slate-600/50 rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto"
                >
                  <div className="p-4">
                    <div className="text-xs text-gray-400 mb-3 font-medium">
                      Kết quả tìm kiếm ({searchResults.length})
                    </div>
                    {searchResults.map((result) => (
                      <div
                        key={`${result.type}-${result.id}`}
                        onClick={() => handleSearchResultClick(result)}
                        className="flex items-center p-3 hover:bg-slate-700/50 rounded-xl cursor-pointer transition-all duration-200 group border border-transparent hover:border-slate-600/30"
                      >
                        <div className="flex items-center justify-center w-10 h-10 bg-slate-700/50 rounded-lg mr-3 group-hover:bg-[#FFD875]/20 transition-colors">
                          <span className="text-lg">{getSearchIcon(result.type)}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white font-medium group-hover:text-[#FFD875] transition-colors">
                              {result.title}
                            </span>
                            <span className="text-xs bg-slate-700/50 text-gray-300 px-2 py-1 rounded-full border border-slate-600/30">
                              {getSearchTypeLabel(result.type)}
                            </span>
                          </div>
                          <div className="text-sm text-gray-400">{result.subtitle}</div>
                        </div>
                      </div>
                    ))}
                    {searchResults.length === 0 && searchQuery && (
                      <div className="text-center py-8 text-gray-400">
                        <MagnifyingGlassIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <div>Không tìm thấy kết quả cho "{searchQuery}"</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <button
                onClick={() => setIsSearchVisible(!isSearchVisible)}
                className="group flex items-center justify-center w-10 h-10 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600/30 hover:border-[#FFD875]/50 text-gray-400 hover:text-[#FFD875] transition-all duration-300"
              >
                {isSearchVisible ? <XMarkIcon className="w-5 h-5" /> : <MagnifyingGlassIcon className="w-5 h-5" />}
              </button>
            </div>

            {/* User menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 p-2 rounded-xl hover:bg-slate-700/50 transition-all duration-300 border border-transparent hover:border-slate-600/30"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-[#FFD875]/20 to-amber-500/20 rounded-xl flex items-center justify-center border border-[#FFD875]/30">
                  <UserCircleIcon className="w-6 h-6 text-[#FFD875]" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm text-white font-semibold">{user?.name || "Admin User"}</p>
                  <p className="text-xs text-[#FFD875]/70 font-medium">{user?.role || "Administrator"}</p>
                </div>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-3 w-56 bg-slate-800/95 backdrop-blur-xl border border-slate-600/50 rounded-xl shadow-2xl z-50">
                  <div className="p-3">
                    {/* User info header */}
                    <div className="px-3 py-2 mb-2 bg-slate-700/30 rounded-lg border border-slate-600/30">
                      <div className="text-sm font-semibold text-white">{user?.name || "Admin User"}</div>
                      <div className="text-xs text-[#FFD875]/70">{user?.email || "admin@galaxy.com"}</div>
                    </div>

                    <button
                      onClick={handleProfileClick}
                      className="w-full flex items-center px-3 py-2.5 text-sm text-gray-300 hover:bg-slate-700/50 hover:text-white rounded-xl transition-all duration-200 group border border-transparent hover:border-slate-600/30"
                    >
                      <div className="flex items-center justify-center w-8 h-8 bg-slate-700/50 rounded-lg mr-3 group-hover:bg-[#FFD875]/20 transition-colors">
                        <UserCircleIcon className="w-4 h-4 group-hover:text-[#FFD875]" />
                      </div>
                      Hồ sơ cá nhân
                    </button>

                    <button
                      onClick={() => navigate("/admin/settings")}
                      className="w-full flex items-center px-3 py-2.5 text-sm text-gray-300 hover:bg-slate-700/50 hover:text-white rounded-xl transition-all duration-200 group border border-transparent hover:border-slate-600/30"
                    >
                      <div className="flex items-center justify-center w-8 h-8 bg-slate-700/50 rounded-lg mr-3 group-hover:bg-[#FFD875]/20 transition-colors">
                        <Cog6ToothIcon className="w-4 h-4 group-hover:text-[#FFD875]" />
                      </div>
                      Cài đặt
                    </button>

                    <hr className="my-2 border-slate-600/50" />

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-all duration-200 group border border-transparent hover:border-red-500/30"
                    >
                      <div className="flex items-center justify-center w-8 h-8 bg-red-500/10 rounded-lg mr-3 group-hover:bg-red-500/20 transition-colors">
                        <ArrowRightOnRectangleIcon className="w-4 h-4" />
                      </div>
                      Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
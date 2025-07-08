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
    <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg hover:bg-slate-700 text-gray-400 hover:text-white transition-colors lg:hidden"
          >
            <Bars3Icon className="w-5 h-5" />
          </button>

          {/* Cinema name for manager */}
          {user?.role === "Manager" && managerCinema && (
            <div
              className="flex items-center space-x-2 bg-slate-700/50 px-4 py-2 rounded-lg border border-[#FFD875]/30"
              style={{
                boxShadow: "0 0 20px rgba(255, 216, 117, 0.4)",
                animation: "pulse-glow 2s infinite",
              }}
            >
              <BuildingOfficeIcon className="w-5 h-5 text-[#FFD875]" />
              <span
                className="text-[#FFD875] font-semibold text-lg"
                style={{ textShadow: "0 0 10px rgba(255, 216, 117, 0.5)" }}
              >
                {managerCinema.Cinema_Name}
              </span>
            </div>
          )}

          {/* Loading state for cinema */}
          {user?.role === "Manager" && loadingCinema && (
            <div className="flex items-center space-x-2 bg-slate-700/50 px-4 py-2 rounded-lg">
              <BuildingOfficeIcon className="w-5 h-5 text-gray-400" />
              <span className="text-gray-400 text-sm">Đang tải thông tin rạp...</span>
            </div>
          )}

          {/* No cinema assigned for manager */}
          {user?.role === "Manager" && !loadingCinema && !managerCinema && (
            <div className="flex items-center space-x-2 bg-orange-500/20 px-4 py-2 rounded-lg border border-orange-500/30">
              <BuildingOfficeIcon className="w-5 h-5 text-orange-400" />
              <span className="text-orange-400 text-sm">Chưa được phân công rạp</span>
            </div>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-2">
          {/* Search */}
          <div className="flex items-center justify-end relative" ref={searchContainerRef}>
            <div
              className={`flex items-center transition-all duration-300 ease-in-out overflow-hidden ${
                isSearchVisible ? "w-64" : "w-0"
              }`}
            >
              <form onSubmit={handleSearch} className="relative w-full">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Tìm kiếm phim, khách hàng, rạp, phòng, suất chiếu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`bg-slate-700 text-white pl-10 pr-4 py-2 rounded-lg border border-slate-600 focus:border-[#FFD875] focus:outline-none w-full transition-all duration-300 ${
                    isSearchVisible ? "opacity-100" : "opacity-0 pointer-events-none"
                  }`}
                />
              </form>
            </div>

            {/* Search Results Dropdown */}
            {showSearchResults && isSearchVisible && (
              <div
                ref={searchResultsRef}
                className="absolute top-full right-0 mt-2 w-80 bg-slate-800 border border-slate-600 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
              >
                <div className="p-3">
                  <div className="text-xs text-gray-400 mb-2">Kết quả tìm kiếm ({searchResults.length})</div>
                  {searchResults.map((result, index) => (
                    <div
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleSearchResultClick(result)}
                      className="flex items-center p-3 hover:bg-slate-700 rounded-lg cursor-pointer transition-colors group"
                    >
                      <div className="text-xl mr-3">{getSearchIcon(result.type)}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium group-hover:text-[#FFD875]">{result.title}</span>
                          <span className="text-xs bg-slate-700 text-gray-300 px-2 py-1 rounded">
                            {getSearchTypeLabel(result.type)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-400 mt-1">{result.subtitle}</div>
                      </div>
                    </div>
                  ))}
                  {searchResults.length === 0 && searchQuery && (
                    <div className="text-center py-4 text-gray-400">Không tìm thấy kết quả cho "{searchQuery}"</div>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={() => setIsSearchVisible(!isSearchVisible)}
              className="p-2 rounded-lg hover:bg-slate-700 text-gray-400 hover:text-[#FFD875] transition-colors"
            >
              {isSearchVisible ? <XMarkIcon className="w-5 h-5" /> : <MagnifyingGlassIcon className="w-5 h-5" />}
            </button>
          </div>

          {/* User menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                <UserCircleIcon className="w-5 h-5 text-white" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm text-white font-medium">{user?.name || "Admin User"}</p>
                <p className="text-xs text-gray-400">{user?.role || "Administrator"}</p>
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-600 rounded-lg shadow-lg z-50">
                <div className="p-2">
                  <button
                    onClick={handleProfileClick}
                    className="w-full flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-slate-700 hover:text-white rounded-lg transition-colors"
                  >
                    <UserCircleIcon className="w-4 h-4 mr-3" />
                    Hồ sơ cá nhân
                  </button>
                  <hr className="my-2 border-slate-600" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-3 py-2 text-sm text-red-400 hover:bg-slate-700 hover:text-red-300 rounded-lg transition-colors"
                  >
                    <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3" />
                    Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
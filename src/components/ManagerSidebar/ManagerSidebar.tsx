import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./ManagerSidebar.css";
import Logo from "../../assets/images/Logo.png";
import { useAuth } from "../../pages/context/AuthContext";
import api from "../../config/axios";

interface SidebarItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  subItems?: SidebarItem[];
}

const ManagerSidebar: React.FC = () => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [cinemaName, setCinemaName] = useState<string>("");

  const sidebarItems: SidebarItem[] = [
    {
      id: "manager-dashboard",
      label: "Bảng Điều Khiển",
      icon: "📊",
      path: "/manager/manager-dashboard",
    },
    {
      id: "cinemaroom",
      label: "Quản Lý Phòng Chiếu",
      icon: "🏟️",
      path: "/manager/cinemarooms",
    },
    {
      id: "showtime",
      label: "Quản Lý Lịch Chiếu",
      icon: "🕒",
      path: "/manager/showtimes",
    },
  ];

  const isActiveItem = (path: string) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  const renderSidebarItem = (item: SidebarItem) => {
    const isActive = isActiveItem(item.path);
    return (
      <li key={item.id} className="sidebar-item">
        <Link
          to={item.path}
          className={`sidebar-link ${isActive ? "active" : ""}`}
        >
          <span className="sidebar-icon">{item.icon}</span>
          {!isCollapsed && <span className="sidebar-label">{item.label}</span>}
        </Link>
      </li>
    );
  };
  const handleLogout = () => {
    logout();
  };

  useEffect(() => {
    const fetchCinemaInfo = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const response = await api.get("/cinemas/manager/my-cinema", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data && response.data.success && response.data.data?.Cinema_Name) {
          setCinemaName(response.data.data.Cinema_Name);
        }
      } catch {
        // Không hiển thị gì nếu lỗi
      }
    };
    fetchCinemaInfo();
  }, []);

  return (
    <div className={`manager-sidebar ${isCollapsed ? "collapsed" : ""}`}>
      {/* Header */}
      {!isCollapsed && (
        <div className="sidebar-header">
          <div className="logo">
            <img src={Logo} alt="Logo Galaxy" className="logo-img" />
            <span className="logo-text">Galaxy</span>
          </div>
          {cinemaName && (
            <div style={{ fontSize: "0.95rem", color: "#bdc3c7", marginTop: 4, fontWeight: 500 }}>
              {cinemaName}
            </div>
          )}
          <button
            className="collapse-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title="Thu gọn thanh bên"
          >
            ☰
          </button>
        </div>
      )}
      {isCollapsed && (
        <div className="collapsed-header">
          <button
            className="expand-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title="Mở rộng thanh bên"
          >
            ☰
          </button>
        </div>
      )}
      <nav className="sidebar-nav">
        <ul className="sidebar-menu">
          {sidebarItems.map((item) => renderSidebarItem(item))}
        </ul>
      </nav>
      <div className="sidebar-footer">
        {!isCollapsed ? (
          <>
            <div className="manager-profile">
              <div className="profile-avatar">👤</div>
              <div className="profile-info">
                <span className="profile-name">
                  Quản Lý{cinemaName ? ` | ${cinemaName}` : ""}
                </span>
                <span className="profile-role">Manager</span>
              </div>
            </div>
            <button
              className="logout-btn"
              title="Đăng Xuất"
              onClick={handleLogout}
            >
              <span className="logout-icon">🚪</span>
              <span>Đăng Xuất</span>
            </button>
          </>
        ) : (
          <div className="collapsed-footer">
            <div className="profile-avatar-collapsed">👤</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerSidebar;

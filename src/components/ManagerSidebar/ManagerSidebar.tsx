import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./ManagerSidebar.css";
import Logo from "../../assets/images/Logo.png";

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

  const sidebarItems: SidebarItem[] = [
    {
      id: "showtime",
      label: "Quản Lý Lịch Chiếu",
      icon: "🕒",
      path: "/manager/showtimes",
    },
    {
      id: "cinemaroom",
      label: "Quản Lý Phòng Chiếu",
      icon: "🏟️",
      path: "/manager/cinemarooms",
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
        <Link to={item.path} className={`sidebar-link ${isActive ? "active" : ""}`}> 
          <span className="sidebar-icon">{item.icon}</span>
          {!isCollapsed && <span className="sidebar-label">{item.label}</span>}
        </Link>
      </li>
    );
  };

  return (
    <div className={`manager-sidebar ${isCollapsed ? "collapsed" : ""}`}>
      {/* Header */}
      {!isCollapsed && (
        <div className="sidebar-header">
          <div className="logo">
            <img src={Logo} alt="Logo Galaxy" className="logo-img" />
            <span className="logo-text">Galaxy</span>
          </div>
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
          <div className="manager-profile">
            <div className="profile-avatar">👤</div>
            <div className="profile-info">
              <span className="profile-name">Quản Lý</span>
              <span className="profile-role">Manager</span>
            </div>
          </div>
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
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./AdminSidebar.css";
import Logo from "../../assets/images/Logo.png";

interface SidebarItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  subItems?: SidebarItem[];
}

const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const sidebarItems: SidebarItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "📊",
      path: "/admin/dashboard",
    },
    {
      id: "users",
      label: "Manage Users",
      icon: "👥",
      path: "/admin/users",
      subItems: [
        { id: "all-users", label: "All Users", icon: "👤", path: "/admin/users/all" },
        { id: "add-user", label: "Add User", icon: "➕", path: "/admin/users/add" },
        { id: "user-roles", label: "User Roles", icon: "🔑", path: "/admin/users/roles" },
      ],
    },
    {
      id: "movies",
      label: "Manage Movies",
      icon: "🎬",
      path: "/admin/movies",
      subItems: [
        { id: "all-movies", label: "All Movies", icon: "🎭", path: "/admin/movies/all" },
        { id: "add-movie", label: "Add Movie", icon: "➕", path: "/admin/movies/add" },
        { id: "genres", label: "Genres", icon: "🏷️", path: "/admin/movies/genres" },
        { id: "ratings", label: "Ratings", icon: "⭐", path: "/admin/movies/ratings" },
      ],
    },
    {
      id: "cinemas",
      label: "Manage Cinemas",
      icon: "🏢",
      path: "/admin/cinemas",
      subItems: [
        { id: "all-cinemas", label: "All Cinemas", icon: "🏬", path: "/admin/cinemas/all" },
        { id: "add-cinema", label: "Add Cinema", icon: "➕", path: "/admin/cinemas/add" },
        { id: "rooms", label: "Cinema Rooms", icon: "🎦", path: "/admin/cinemas/rooms" },
      ],
    },
    {
      id: "showtimes",
      label: "Manage Showtimes",
      icon: "🕐",
      path: "/admin/showtimes",
      subItems: [
        { id: "all-showtimes", label: "All Showtimes", icon: "📅", path: "/admin/showtimes/all" },
        { id: "add-showtime", label: "Add Showtime", icon: "➕", path: "/admin/showtimes/add" },
        { id: "schedule", label: "Schedule", icon: "📋", path: "/admin/showtimes/schedule" },
      ],
    },
    {
      id: "bookings",
      label: "Manage Bookings",
      icon: "🎫",
      path: "/admin/bookings",
      subItems: [
        { id: "all-bookings", label: "All Bookings", icon: "📝", path: "/admin/bookings/all" },
        { id: "pending-bookings", label: "Pending", icon: "⏳", path: "/admin/bookings/pending" },
        { id: "cancelled-bookings", label: "Cancelled", icon: "❌", path: "/admin/bookings/cancelled" },
      ],
    },
    {
      id: "reports",
      label: "Reports & Analytics",
      icon: "📈",
      path: "/admin/reports",
      subItems: [
        { id: "revenue-report", label: "Revenue Report", icon: "💰", path: "/admin/reports/revenue" },
        { id: "booking-analytics", label: "Booking Analytics", icon: "📊", path: "/admin/reports/bookings" },
        { id: "movie-performance", label: "Movie Performance", icon: "🎯", path: "/admin/reports/movies" },
        { id: "user-analytics", label: "User Analytics", icon: "👥", path: "/admin/reports/users" },
      ],
    },
    {
      id: "payments",
      label: "Payment Management",
      icon: "💳",
      path: "/admin/payments",
      subItems: [
        { id: "all-payments", label: "All Payments", icon: "💸", path: "/admin/payments/all" },
        { id: "refunds", label: "Refunds", icon: "↩️", path: "/admin/payments/refunds" },
        { id: "payment-methods", label: "Payment Methods", icon: "💳", path: "/admin/payments/methods" },
      ],
    },
    {
      id: "promotions",
      label: "Promotions & Offers",
      icon: "🎉",
      path: "/admin/promotions",
      subItems: [
        { id: "all-promotions", label: "All Promotions", icon: "🏷️", path: "/admin/promotions/all" },
        { id: "add-promotion", label: "Add Promotion", icon: "➕", path: "/admin/promotions/add" },
        { id: "coupons", label: "Coupons", icon: "🎟️", path: "/admin/promotions/coupons" },
      ],
    },
  ];

  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) => (prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]));
  };

  const isActiveItem = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  const renderSidebarItem = (item: SidebarItem, isSubItem = false) => {
    const isActive = isActiveItem(item.path);
    const isExpanded = expandedItems.includes(item.id);
    const hasSubItems = item.subItems && item.subItems.length > 0;

    return (
      <li key={item.id} className={`sidebar-item ${isSubItem ? "sub-item" : ""}`}>
        <div
          className={`sidebar-link ${isActive ? "active" : ""} ${hasSubItems ? "has-submenu" : ""}`}
          onClick={() => (hasSubItems ? toggleExpanded(item.id) : undefined)}
        >
          {hasSubItems ? (
            <div className="sidebar-link-content">
              <div className="sidebar-link-main">
                <span className="sidebar-icon">{item.icon}</span>
                {!isCollapsed && <span className="sidebar-label">{item.label}</span>}
              </div>
              {!isCollapsed && <span className={`expand-icon ${isExpanded ? "expanded" : ""}`}>▼</span>}
            </div>
          ) : (
            <Link to={item.path} className="sidebar-link-content">
              <div className="sidebar-link-main">
                <span className="sidebar-icon">{item.icon}</span>
                {!isCollapsed && <span className="sidebar-label">{item.label}</span>}
              </div>
            </Link>
          )}
        </div>

        {hasSubItems && isExpanded && !isCollapsed && (
          <ul className="sub-menu">{item.subItems!.map((subItem) => renderSidebarItem(subItem, true))}</ul>
        )}
      </li>
    );
  };

  return (
    <div className={`admin-sidebar ${isCollapsed ? "collapsed" : ""}`}>
      {/* Header with logo and collapse button - hidden when collapsed */}
      {!isCollapsed && (
        <div className="sidebar-header">
          <div className="logo">
            <img src={Logo} alt="Galaxy Logo" className="logo-img" />
            <span className="logo-text">Galaxy</span>
          </div>
          <button className="collapse-btn" onClick={() => setIsCollapsed(!isCollapsed)} title="Collapse sidebar">
            ☰
          </button>
        </div>
      )}

      {/* Collapse button when sidebar is collapsed */}
      {isCollapsed && (
        <div className="collapsed-header">
          <button className="expand-btn" onClick={() => setIsCollapsed(!isCollapsed)} title="Expand sidebar">
            ☰
          </button>
        </div>
      )}

      <nav className="sidebar-nav">
        <ul className="sidebar-menu">{sidebarItems.map((item) => renderSidebarItem(item))}</ul>
      </nav>

      {/* Footer - only show profile avatar when collapsed */}
      <div className="sidebar-footer">
        {!isCollapsed ? (
          <>
            <div className="admin-profile">
              <div className="profile-avatar">👤</div>
              <div className="profile-info">
                <span className="profile-name">Admin User</span>
                <span className="profile-role">Administrator</span>
              </div>
            </div>
            <button className="logout-btn" title="Logout">
              <span className="logout-icon">🚪</span>
              <span>Logout</span>
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

export default AdminSidebar;

import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom"; // Thêm useNavigate
import "./AdminSidebar.css";
import Logo from "../../assets/images/Logo.png";
import { useAuth } from "../../pages/context/AuthContext"; // Import useAuth từ AuthContext

interface SidebarItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  subItems?: SidebarItem[];
}

const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate(); // Khởi tạo useNavigate
  const { logout } = useAuth(); // Lấy hàm logout từ AuthContext
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const sidebarItems: SidebarItem[] = [
    {
      id: "dashboard",
      label: "Bảng Điều Khiển",
      icon: "📊",
      path: "/admin/dashboard",
    },
    {
      id: "users",
      label: "Quản Lý Người Dùng",
      icon: "👥",
      path: "/admin/users",
    },
   
    {
      id: "cinemas",
      label: "Quản Lý Chi Nhánh Rạp",
      icon: "🏢",
      path: "/admin/cinemas",
    },
   
    {
      id: "bookings",
      label: "Quản Lý Đặt Vé",
      icon: "🎫",
      path: "/admin/bookings",
      subItems: [
        {
          id: "all-bookings",
          label: "Tất Cả Đặt Vé",
          icon: "📝",
          path: "/admin/bookings/all",
        },
        {
          id: "pending-bookings",
          label: "Chờ Xử Lý",
          icon: "⏳",
          path: "/admin/bookings/pending",
        },
        {
          id: "cancelled-bookings",
          label: "Đã Hủy",
          icon: "❌",
          path: "/admin/bookings/cancelled",
        },
      ],
    },
    {
      id: "reports",
      label: "Báo Cáo & Phân Tích",
      icon: "📈",
      path: "/admin/reports",
      subItems: [
        {
          id: "revenue-report",
          label: "Báo Cáo Doanh Thu",
          icon: "💰",
          path: "/admin/reports/revenue",
        },
        {
          id: "booking-analytics",
          label: "Phân Tích Đặt Vé",
          icon: "📊",
          path: "/admin/reports/bookings",
        },
        {
          id: "movie-performance",
          label: "Hiệu Suất Phim",
          icon: "🎯",
          path: "/admin/reports/movies",
        },
        {
          id: "user-analytics",
          label: "Phân Tích Người Dùng",
          icon: "👥",
          path: "/admin/reports/users",
        },
      ],
    },
    {
      id: "payments",
      label: "Quản Lý Thanh Toán",
      icon: "💳",
      path: "/admin/payments",
      subItems: [
        {
          id: "all-payments",
          label: "Tất Cả Thanh Toán",
          icon: "💸",
          path: "/admin/payments/all",
        },
        {
          id: "refunds",
          label: "Hoàn Tiền",
          icon: "↩️",
          path: "/admin/payments/refunds",
        },
        {
          id: "payment-methods",
          label: "Phương Thức Thanh Toán",
          icon: "💳",
          path: "/admin/payments/methods",
        },
      ],
    },
    {
      id: "promotions",
      label: "Khuyến Mãi & Ưu Đãi",
      icon: "🎉",
      path: "/admin/promotions",
      subItems: [
        {
          id: "all-promotions",
          label: "Tất Cả Khuyến Mãi",
          icon: "🏷️",
          path: "/admin/promotions/all",
        },
        {
          id: "add-promotion",
          label: "Thêm Khuyến Mãi",
          icon: "➕",
          path: "/admin/promotions/add",
        },
        {
          id: "coupons",
          label: "Phiếu Giảm Giá",
          icon: "🎟️",
          path: "/admin/promotions/coupons",
        },
      ],
    },
  ];

  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const isActiveItem = (path: string) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  const renderSidebarItem = (item: SidebarItem, isSubItem = false) => {
    const isActive = isActiveItem(item.path);
    const isExpanded = expandedItems.includes(item.id);
    const hasSubItems = item.subItems && item.subItems.length > 0;

    return (
      <li
        key={item.id}
        className={`sidebar-item ${isSubItem ? "sub-item" : ""}`}
      >
        <div
          className={`sidebar-link ${isActive ? "active" : ""} ${
            hasSubItems ? "has-submenu" : ""
          }`}
          onClick={() => (hasSubItems ? toggleExpanded(item.id) : undefined)}
        >
          {hasSubItems ? (
            <div className="sidebar-link-content">
              <div className="sidebar-link-main">
                <span className="sidebar-icon">{item.icon}</span>
                {!isCollapsed && (
                  <span className="sidebar-label">{item.label}</span>
                )}
              </div>
              {!isCollapsed && (
                <span className={`expand-icon ${isExpanded ? "expanded" : ""}`}>
                  ▼
                </span>
              )}
            </div>
          ) : (
            <Link to={item.path} className="sidebar-link-content">
              <div className="sidebar-link-main">
                <span className="sidebar-icon">{item.icon}</span>
                {!isCollapsed && (
                  <span className="sidebar-label">{item.label}</span>
                )}
              </div>
            </Link>
          )}
        </div>

        {hasSubItems && isExpanded && !isCollapsed && (
          <ul className="sub-menu">
            {item.subItems!.map((subItem) => renderSidebarItem(subItem, true))}
          </ul>
        )}
      </li>
    );
  };

  // Gắn hàm logout vào nút đăng xuất
  const handleLogoutClick = () => {
    logout(); // Gọi hàm logout từ AuthContext
  };

  return (
    <div className={`admin-sidebar ${isCollapsed ? "collapsed" : ""}`}>
      {/* Tiêu đề với logo và nút thu gọn - ẩn khi thu gọn */}
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

      {/* Nút mở rộng khi thanh bên được thu gọn */}
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

      {/* Chân trang - chỉ hiển thị ảnh đại diện khi thu gọn */}
      <div className="sidebar-footer">
        {!isCollapsed ? (
          <>
            <div className="admin-profile">
              <div className="profile-avatar">👤</div>
              <div className="profile-info">
                <span className="profile-name">Người Dùng Quản Trị</span>
                <span className="profile-role">Quản Trị Viên</span>
              </div>
            </div>
            <button
              className="logout-btn"
              title="Đăng Xuất"
              onClick={handleLogoutClick}
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

export default AdminSidebar;

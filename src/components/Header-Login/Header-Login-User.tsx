import React, { useState, useEffect, useRef } from "react";
import "./Header-Login-User.css";
import logo from "../../assets/images/Logo.png";
import { useNavigate } from "react-router-dom";

const HeaderLoginUser: React.FC = () => {
  const [user, setUser] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate= useNavigate();
  useEffect(() => {
    const fullName = localStorage.getItem("fullName");
    setUser(fullName);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  const handleProfileClick = () => {
    setShowDropdown((prev) => !prev);
  };
  const handleProfileNavigation = () => {
    setShowDropdown(false); 
    navigate('/profile'); 
  };
  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setShowDropdown(false);
    window.location.href = "/";
  };
 
  return (
    <header className="header-login-user">
      <div className="header-login-user__logo">
        <img src={logo} alt="Logo" className="header-login-user__logo-img" />
        <div>
          <div className="header-login-user__logo-title">Galaxy</div>
        </div>
      </div>
      <div className="header-login-user__search">
        <span className="header-login-user__search-icon">🔍</span>
        <input type="text" placeholder="Tìm kiếm phim, diễn viên" />
      </div>
      <nav className="header-login-user__nav">
        <a href="#">Chủ Đề</a>
        <div className="header-login-user__dropdown">
          <a href="#">
            Thể loại <span>▼</span>
          </a>
        </div>
        <a href="#">Phim Lẻ</a>
        <a href="#">Phim Bộ</a>
        <div className="header-login-user__dropdown">
          <a href="#">
            Quốc gia <span>▼</span>
          </a>
        </div>
        <a href="#">Diễn Viên</a>
        <a href="#">Lịch chiếu</a>
      </nav>
      <div className="header-login-user__right">
        <div className="header-login-user__divider"></div>
        <div className="header-login-user__profile-wrapper" ref={dropdownRef}>
          <button
            className="header-login-user__profile-btn"
            onClick={handleProfileClick}
          >
            <span className="header-login-user__profile-avatar">👤</span>
            <span className="header-login-user__profile-name">{user}</span>
            <span className="header-login-user__profile-caret">▼</span>
          </button>
          {showDropdown && (
            <div className="header-login-user__profile-dropdown">
              <div className="header-login-user__profile-greeting">
                Chào,
                <br />
                <b>{user}</b>
              </div>
              <ul>
                <li>
                  <span>❤️</span> Yêu thích
                </li>
                <li>
                  <span>➕</span> Danh sách
                </li>
                <li>
                  <span>⏩</span> Xem tiếp
                </li>
                <li
                  onClick={handleProfileNavigation}
                  style={{ cursor: 'pointer' }}>
                  <span>👤</span> Tài khoản
                </li>
                <li
                  onClick={handleLogout}
                  style={{ cursor: "pointer", color: "#ff5252" }}
                >
                  <span>↩️</span> Thoát
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default HeaderLoginUser;

import React, { useState, useEffect, useRef } from "react";
import "./Header-Login-Staff.css";
import logo from "../../assets/images/Logo.png";
import { useNavigate } from "react-router-dom";

const HeaderLoginStaff = () => {
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fullName = localStorage.getItem("fullName");
    setUser(fullName);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
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
    navigate("/profile");
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    setUser(null);
    setShowDropdown(false);
    window.location.href = "/";
  };

  const goToHome = () => {
    navigate("/");
  };

  const goToMovie = () => {
    navigate("/movie");
  };

  const goToScan = () => {
    navigate("/staff/scan");
  };

  return (
    <header className="header-login-staff">
      <div
        className="header-login-staff__logo"
        onClick={goToHome}
        style={{ cursor: "pointer" }}
      >
        <img src={logo} alt="Logo" className="header-login-staff__logo-img" />
        <div>
          <div className="header-login-staff__logo-title">Galaxy</div>
        </div>
      </div>
      <div className="header-login-staff__search">
        <span className="header-login-staff__search-icon">🔍</span>
        <input type="text" placeholder="Tìm kiếm phim, diễn viên" />
      </div>
      <nav className="header-login-staff__nav">
        <a href="#">Đặt vé</a>
        <a
          onClick={goToScan}
          style={{ cursor: "pointer", fontWeight: "bold", color: "#FFD700" }}
        >
          Quét vé
        </a>
      </nav>
      <div className="header-login-staff__right">
        <div className="header-login-staff__divider"></div>
        <div className="header-login-staff__profile-wrapper" ref={dropdownRef}>
          <button
            className="header-login-staff__profile-btn"
            onClick={handleProfileClick}
          >
            <span className="header-login-staff__profile-avatar">👤</span>
            <span className="header-login-staff__profile-name">{user}</span>
            <span className="header-login-staff__profile-badge">Staff</span>
            <span className="header-login-staff__profile-caret">▼</span>
          </button>
          {showDropdown && (
            <div className="header-login-staff__profile-dropdown">
              <div className="header-login-staff__profile-greeting">
                Chào,
                <br />
                <b>{user}</b>
              </div>
              <ul>
                <li
                  onClick={handleProfileNavigation}
                  style={{ cursor: "pointer" }}
                >
                  <span>👤</span> Tài khoản
                </li>
                <li onClick={goToScan} style={{ cursor: "pointer" }}>
                  <span>🎫</span> Quét vé
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

export default HeaderLoginStaff;

import { useState, useEffect, useRef } from "react";
import "./Header-Login-Staff.css";
import logo from "../../assets/images/Logo.png";
import { useNavigate, useLocation } from "react-router-dom";

const HeaderLoginStaff = () => {
  const [user, setUser] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fullName = localStorage.getItem("fullName");
    setUser(fullName);
  }, []);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // When sentinel is not visible, header is sticky
        setIsSticky(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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
    navigate("/staff");
  };

  const goToBooking = () => {
    navigate("/staff/booking");
  };

  const goToScan = () => {
    navigate("/staff/scan");
  };

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Sentinel element to detect sticky state */}
      <div ref={sentinelRef} style={{ position: "absolute", top: 0, height: "1px", visibility: "hidden" }} />

      <header ref={headerRef} className={`header-login-staff ${isSticky ? "sticky-active" : ""}`}>
        <div className="header-login-staff__logo" onClick={goToHome} style={{ cursor: "pointer" }}>
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
          <a
            onClick={goToBooking}
            style={{ cursor: "pointer" }}
            className={isActivePath("/staff/booking") ? "active" : ""}
          >
            Đặt vé
          </a>
          <a onClick={goToScan} style={{ cursor: "pointer" }} className={isActivePath("/staff/scan") ? "active" : ""}>
            Quét vé
          </a>
        </nav>
        <div className="header-login-staff__right">
          <div className="header-login-staff__divider"></div>
          <div className="header-login-staff__profile-wrapper" ref={dropdownRef}>
            <button className="header-login-staff__profile-btn" onClick={handleProfileClick}>
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
                  <li onClick={handleProfileNavigation} style={{ cursor: "pointer" }}>
                    <span>👤</span> Tài khoản
                  </li>
                  <li onClick={goToScan} style={{ cursor: "pointer" }}>
                    <span>🎫</span> Quét vé
                  </li>
                  <li onClick={handleLogout} style={{ cursor: "pointer", color: "#ff5252" }}>
                    <span>↩️</span> Thoát
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default HeaderLoginStaff;

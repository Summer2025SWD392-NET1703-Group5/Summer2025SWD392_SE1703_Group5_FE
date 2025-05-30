import React, { useState } from "react";
import "./Header.css";
import logo from "../../assets/images/Logo.png";
import LoginPage from "../../pages/LoginPage/LoginPage";
import RegisterPage from "../../pages/RegisterPage/RegisterPage";
import ForgotPasswordPage from "../../pages/ForgotPasswordPage/ForgotPasswordPage";

interface HeaderProps {
  onLoginClick?: () => void; 
}

const Header: React.FC<HeaderProps> = ({ onLoginClick }) => {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  // Nếu onLoginClick được truyền từ Layout, sử dụng nó, nếu không thì dùng logic nội bộ
  const handleLoginClick =
    onLoginClick ||
    (() => {
      setShowLogin(true);
      setShowRegister(false);
      setShowForgot(false);
    });

  return (
    <>
      <header className="header">
        <div className="header__logo">
          <img src={logo} alt="Logo" className="header__logo-img" />
          <div>
            <div className="header__logo-title">Galaxy</div>
          </div>
        </div>
        <div className="header__search">
          <span className="header__search-icon">🔍</span>
          <input type="text" placeholder="Tìm kiếm phim, diễn viên" />
        </div>
        <nav className="header__nav">
          <a href="#">Chủ Đề</a>
          <div className="header__dropdown">
            <a href="#">
              Thể loại <span>▼</span>
            </a>
          </div>
          <a href="#">Phim Lẻ</a>
          <a href="#">Phim Bộ</a>
          <div className="header__dropdown">
            <a href="#">
              Quốc gia <span>▼</span>
            </a>
          </div>
          <a href="#">Diễn Viên</a>
          <a href="#">Lịch chiếu</a>
        </nav>
        <div className="header__right">
          <div className="header__divider"></div>
          <button className="header__member" onClick={handleLoginClick}>
            <span className="header__member-icon">👤</span>
            Thành viên
          </button>
        </div>
      </header>

      {/* Hiển thị các modal chỉ khi chưa đăng nhập */}
      {showLogin && (
        <LoginPage
          onClose={() => setShowLogin(false)}
          onSwitchToRegister={() => {
            setShowLogin(false);
            setShowRegister(true);
            setShowForgot(false);
          }}
          onSwitchToForgot={() => {
            setShowLogin(false);
            setShowRegister(false);
            setShowForgot(true);
          }}
        />
      )}
      {showRegister && (
        <RegisterPage
          onClose={() => setShowRegister(false)}
          onSwitchToLogin={() => {
            setShowRegister(false);
            setShowLogin(true);
            setShowForgot(false);
          }}
        />
      )}
      {showForgot && (
        <ForgotPasswordPage
          onClose={() => setShowForgot(false)}
          onSwitchToLogin={() => {
            setShowForgot(false);
            setShowLogin(true);
            setShowRegister(false);
          }}
        />
      )}
    </>
  );
};

export default Header;

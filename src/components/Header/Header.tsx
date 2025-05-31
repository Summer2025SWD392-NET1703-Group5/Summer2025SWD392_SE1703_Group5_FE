import React, { useState } from 'react';
import './Header.css';
import { SearchOutlined } from '@ant-design/icons';
import logo from '../../assets/images/Logo.png';
import buybutton from '../../assets/images/buybutton.png';
import LoginPage from '../../pages/LoginPage/LoginPage';
import RegisterPage from '../../pages/RegisterPage/RegisterPage';
import ForgotPasswordPage from '../../pages/ForgotPasswordPage/ForgotPasswordPage';
import { useNavigate } from "react-router-dom";
interface HeaderProps {
  onLoginClick?: () => void;
}
const Header: React.FC<HeaderProps> = ({ onLoginClick }) => {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const navigate = useNavigate();
  const goToHome = () => {
    navigate("/");
  };
  const goToMovie = () => {
    navigate("/movie");
  };

  // Fallback login click handler if onLoginClick is not provided
  const handleLoginClick = onLoginClick || (() => {
    setShowLogin(true);
    setShowRegister(false);
    setShowForgot(false);
  });

  return (
    <>
      <header className="header">
        <div className="header__logo">
          <img src={logo} alt="Logo" className="header__logo-img" onClick={goToHome} />
          <div>
            <div className="header__logo-title">Galaxy</div>
          </div>
        </div>
        <div className="header__search">
          <button className="header__search-icon"><SearchOutlined /></button>
          <input type="text" placeholder="Tìm kiếm phim, diễn viên" />
        </div>
        <nav className="header__nav">
          <img src={buybutton} />
          <div className="header__dropdown">
            <button onClick={goToMovie}>Phim</button>
          </div>
          <a href="#">Phim Lẻ</a>
          <a href="#">Phim Bộ</a>
          <div className="header__dropdown">
            <a href="#">Quốc gia <span>▼</span></a>
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

      {/* Modal rendering for login, register, and forgot password */}
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
import React from 'react';
import './RegisterPage.css';
import logo from '../../assets/images/Logo.png';
import loginposter from '../../assets/images/loginposter.jpg';

interface RegisterPageProps {
  onClose?: () => void;
  onSwitchToLogin?: () => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onClose, onSwitchToLogin }) => {
  return (
    <div className="register-2col-overlay">
      <div className="register-2col-modal">
        <div className="register-2col-left">
          <img src={loginposter} alt="Register Poster" className="register-2col-poster" />
          <div className="register-2col-brand">
            <img src={logo} alt="Logo" className="register-2col-logo large" />
            <div className="register-2col-brand-text">
              Galaxy<br />
              <span>Phim hay cả vũ trụ</span>
            </div>
          </div>
        </div>
        <div className="register-2col-right">
          <button className="register-2col-close" onClick={onClose}>×</button>
          <h2 className="register-2col-title">Tạo tài khoản mới</h2>
          <div className="register-2col-sub">Nếu bạn đã có tài khoản, <a href="#" onClick={e => {e.preventDefault(); onSwitchToLogin && onSwitchToLogin();}}>đăng nhập</a></div>
          <form className="register-2col-form">
            <input type="text" placeholder="Tên hiển thị" className="register-2col-input" />
            <input type="email" placeholder="Email" className="register-2col-input" />
            <input type="password" placeholder="Mật khẩu" className="register-2col-input" />
            <input type="password" placeholder="Nhập lại mật khẩu" className="register-2col-input" />
            <button type="submit" className="register-2col-btn">Đăng ký</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage; 
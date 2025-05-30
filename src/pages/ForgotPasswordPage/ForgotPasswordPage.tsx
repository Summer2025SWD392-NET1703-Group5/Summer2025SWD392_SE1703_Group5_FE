import React from 'react';
import './ForgotPasswordPage.css';
import logo from '../../assets/images/Logo.png';
import loginposter from '../../assets/images/loginposter.jpg';

interface ForgotPasswordPageProps {
  onClose?: () => void;
  onSwitchToLogin?: () => void;
}

const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onClose, onSwitchToLogin }) => {
  return (
    <div className="forgotpw-2col-overlay">
      <div className="forgotpw-2col-modal">
        <div className="forgotpw-2col-left">
          <img src={loginposter} alt="Poster" className="forgotpw-2col-poster" />
          <div className="forgotpw-2col-brand">
            <img src={logo} alt="Logo" className="forgotpw-2col-logo large" />
            <div className="forgotpw-2col-brand-text">
              Galaxy<br />
              <span>Phim hay cả vũ trụ</span>
            </div>
          </div>
        </div>
        <div className="forgotpw-2col-right">
          <button className="forgotpw-2col-close" onClick={onClose}>×</button>
          <h2 className="forgotpw-2col-title">Quên mật khẩu</h2>
          <div className="forgotpw-2col-sub">Nếu bạn đã có tài khoản, <a href="#" onClick={e => {e.preventDefault(); onSwitchToLogin && onSwitchToLogin();}}>đăng nhập</a></div>
          <form className="forgotpw-2col-form">
            <input type="email" placeholder="Email đăng ký" className="forgotpw-2col-input" />
            <button type="submit" className="forgotpw-2col-btn">Gửi yêu cầu</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage; 
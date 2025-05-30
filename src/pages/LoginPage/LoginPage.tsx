import React, { useState } from "react";
import "./LoginPage.css";
import logo from "../../assets/images/Logo.png";
import loginposter from "../../assets/images/loginposter.jpg";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, useLocation } from "react-router-dom";

interface LoginPageProps {
  onClose?: () => void;
  onSwitchToRegister?: () => void;
  onSwitchToForgot?: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({
  onClose,
  onSwitchToRegister,
  onSwitchToForgot,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await login(email, password);
      setIsLoading(false);
      if (onClose) onClose();
      // Điều hướng đến trang trước đó hoặc mặc định về '/'
      const from = location.state?.from?.pathname || '/';
      navigate(from);
    } catch (error: any) {
      setIsLoading(false);
      const errorMessage = error?.response?.data?.message || "Lỗi không xác định từ API";
      setError(errorMessage);
      console.error("Login error:", error);
    }
  };

  return (
    <div className="login-2col-overlay">
      <div className="login-2col-modal">
        <div className="login-2col-left">
          <img
            src={loginposter}
            alt="Login Poster"
            className="login-2col-poster"
          />
          <div className="login-2col-brand">
            <img src={logo} alt="Logo" className="login-2col-logo large" />
            <div className="login-2col-brand-text">
              Galaxy
              <br />
              <span>Phim hay cả vũ trụ</span>
            </div>
          </div>
        </div>
        <div className="login-2col-right">
          <button className="login-2col-close" onClick={onClose}>
            ×
          </button>
          <h2 className="login-2col-title">Đăng nhập</h2>
          <div className="login-2col-sub">
            Nếu bạn chưa có tài khoản,{" "}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onSwitchToRegister && onSwitchToRegister();
              }}
            >
              đăng ký ngay
            </a>
          </div>
          <form className="login-2col-form" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email"
              className="login-2col-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Mật khẩu"
              className="login-2col-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && (
              <div style={{ color: "red", marginBottom: 8 }}>{error}</div>
            )}
            <button
              type="submit"
              className="login-2col-btn"
              disabled={isLoading}
            >
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>
          <div className="login-2col-extra">
            <a
              href="#"
              className="login-2col-forgot"
              onClick={(e) => {
                e.preventDefault();
                onSwitchToForgot && onSwitchToForgot();
              }}
            >
              Quên mật khẩu?
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
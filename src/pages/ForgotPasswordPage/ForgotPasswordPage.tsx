import React, { useState } from "react";
import "./ForgotPasswordPage.css";
import logo from "../../assets/images/Logo.png";
import loginposter from "../../assets/images/loginposter.jpg";
import api from "../../config/axios";
import { toast } from "react-toastify/unstyled";

interface ForgotPasswordPageProps {
  onClose?: () => void;
  onSwitchToLogin?: () => void;
}

const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onClose, onSwitchToLogin }) => {
  const [email, setEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);

    try {
      const response = await api.post("/auth/reset-password", { Email: email });
      setIsLoading(false);
      setIsSuccess(true);
      toast.success(response.data.message || "Link reset password đã được gửi tới email của bạn.");
    } catch (error: any) {
      setIsLoading(false);
      const errorMessage =
        error?.response?.data?.message || "Lỗi không xác định từ API";
      setError(errorMessage);
      console.error("Lỗi reset mật khẩu:", error);
    }
  };

  return (
    <div className="forgotpw-2col-overlay">
      <div className="forgotpw-2col-modal">
        <div className="forgotpw-2col-left">
          <img
            src={loginposter}
            alt="Poster"
            className="forgotpw-2col-poster"
          />
          <div className="forgotpw-2col-brand">
            <img src={logo} alt="Logo" className="forgotpw-2col-logo large" />
            <div className="forgotpw-2col-brand-text">
              Galaxy
              <br />
              <span>Phim hay cả vũ trụ</span>
            </div>
          </div>
        </div>
        <div className="forgotpw-2col-right">
          <button className="forgotpw-2col-close" onClick={onClose}>
            ×
          </button>
          <h2 className="forgotpw-2col-title">Quên mật khẩu</h2>
          <div className="forgotpw-2col-sub">
            Nếu bạn đã có tài khoản,{" "}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onSwitchToLogin && onSwitchToLogin();
              }}
            >
              đăng nhập
            </a>
          </div>
          <form className="forgotpw-2col-form" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email đăng ký"
              className="forgotpw-2col-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {error && (
              <div style={{ color: "red", marginBottom: 8 }}>{error}</div>
            )}
            {isSuccess && (
              <div style={{ color: "green", marginBottom: 8 }}>
                Đã gửi mail xác thực đến mail của bạn
              </div>
            )}
            <button
              type="submit"
              className="forgotpw-2col-btn"
              disabled={isLoading}
            >
              {isLoading ? "Đang gửi..." : "Gửi yêu cầu"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
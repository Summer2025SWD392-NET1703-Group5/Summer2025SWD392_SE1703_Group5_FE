import React, { useState } from "react";
import "./RegisterPage.css";
import logo from "../../assets/images/Logo.png";
import loginposter from "../../assets/images/loginposter.jpg";
import api from "../../config/axios";
import { toast } from "react-toastify";

interface RegisterPageProps {
  onClose?: () => void;
  onSwitchToLogin?: () => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({
  onClose,
  onSwitchToLogin,
}) => {
  const [step, setStep] = useState(1); // Quản lý bước hiện tại (1 hoặc 2)
  const [isLoading, setIsLoading] = useState(false); // Quản lý trạng thái tải
  const [error, setError] = useState<string | null>(null); // Quản lý lỗi
  const [formData, setFormData] = useState({
    FullName: "",
    Email: "",
    Password: "",
    ConfirmPassword: "",
    PhoneNumber: "",
    Address: "",
    DateOfBirth: "",
    Sex: "Male", // Set default value to match API expectation
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Kiểm tra các trường bắt buộc ở bước 1
    if (
      !formData.FullName ||
      !formData.DateOfBirth ||
      !formData.PhoneNumber ||
      !formData.Address
    ) {
      setError("Vui lòng điền đầy đủ các thông tin bắt buộc.");
      return;
    }

    setStep(2);
  };

  const handlePrevStep = () => {
    setError(null);
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Kiểm tra các trường bắt buộc ở bước 2
    if (
      !formData.Email ||
      !formData.Password ||
      !formData.ConfirmPassword ||
      !formData.Sex
    ) {
      setError("Vui lòng điền đầy đủ các thông tin bắt buộc.");
      setIsLoading(false);
      return;
    }

    // Kiểm tra mật khẩu khớp
    if (formData.Password !== formData.ConfirmPassword) {
      setError("Mật khẩu và nhập lại mật khẩu không khớp.");
      setIsLoading(false);
      return;
    }

    // Kiểm tra định dạng email cơ bản
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.Email)) {
      setError("Email không hợp lệ.");
      setIsLoading(false);
      return;
    }

    // Kiểm tra độ mạnh của mật khẩu
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[0-9]).{8,}$/;
    if (!passwordRegex.test(formData.Password)) {
      setError(
        "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, số và ký tự đặc biệt (ví dụ: !@#$%^&*)."
      );
      setIsLoading(false);
      return;
    }

    // Log dữ liệu trước khi gửi để kiểm tra
    console.log("Dữ liệu gửi đi:", {
      FullName: formData.FullName,
      Email: formData.Email,
      Password: formData.Password,
      PhoneNumber: formData.PhoneNumber,
      Address: formData.Address,
      DateOfBirth: formData.DateOfBirth,
      Sex: formData.Sex,
    });

    try {
      const response = await api.post("/auth/register", {
        FullName: formData.FullName,
        Email: formData.Email,
        Password: formData.Password,
        ConfirmPassword : formData.ConfirmPassword,
        PhoneNumber: formData.PhoneNumber,
        Address: formData.Address,
        DateOfBirth: formData.DateOfBirth,
        Sex: formData.Sex,
      });

      setIsLoading(false);
      toast.success(response.data.message || "Đăng ký thành công!");
      // Chuyển về bước 1 và xóa form
      setStep(1);
      setFormData({
        FullName: "",
        Email: "",
        Password: "",
        ConfirmPassword: "",
        PhoneNumber: "",
        Address: "",
        DateOfBirth: "",
        Sex: "Male",
      });
      // Tùy chọn: Chuyển hướng đến trang đăng nhập
      if (onSwitchToLogin) {
        onSwitchToLogin();
      }
    } catch (err: any) {
      setIsLoading(false);
      let errorMessage = "Đã có lỗi xảy ra. Vui lòng thử lại.";
      if (err.response?.status === 400) {
        // Xử lý lỗi cụ thể từ API
        if (err.response?.data?.message.includes("Email")) {
          errorMessage = "Email đã được sử dụng. Vui lòng chọn email khác.";
        } else if (err.response?.data?.message.includes("mật khẩu")) {
          errorMessage = "Mật khẩu không đáp ứng yêu cầu. Vui lòng kiểm tra lại.";
        } else {
          errorMessage = err.response?.data?.message || errorMessage;
        }
      }
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="register-2col-overlay">
      <div className="register-2col-modal">
        <div className="register-2col-left">
          <img
            src={loginposter}
            alt="Register Poster"
            className="register-2col-poster"
          />
          <div className="register-2col-brand">
            <img src={logo} alt="Logo" className="register-2col-logo large" />
            <div className="register-2col-brand-text">
              Galaxy
              <br />
              <span>Phim hay cả vũ trụ</span>
            </div>
          </div>
        </div>
        <div className="register-2col-right">
          <button className="register-2col-close" onClick={onClose}>
            ×
          </button>
          <h2 className="register-2col-title">Tạo tài khoản mới</h2>
          <div className="register-2col-sub">
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

          {/* Chỉ báo tiến trình */}
          <div className="register-step-indicator">
            <span
              className={`step-circle ${step === 1 ? "active" : ""}`}
            ></span>
            <span className="step-line"></span>
            <span
              className={`step-circle ${step === 2 ? "active" : ""}`}
            ></span>
          </div>

          {step === 1 ? (
            <form className="register-2col-form" onSubmit={handleNextStep}>
              <input
                type="text"
                name="FullName"
                placeholder="Tên hiển thị"
                className="register-2col-input"
                value={formData.FullName}
                onChange={handleInputChange}
                required
              />
              <input
                type="date"
                name="DateOfBirth"
                placeholder="Ngày sinh"
                className="register-2col-input"
                value={formData.DateOfBirth}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="PhoneNumber"
                placeholder="Số điện thoại"
                className="register-2col-input"
                value={formData.PhoneNumber}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="Address"
                placeholder="Địa chỉ"
                className="register-2col-input"
                value={formData.Address}
                onChange={handleInputChange}
                required
              />
              {error && (
                <div
                  style={{ color: "red", marginBottom: 8, textAlign: "center" }}
                >
                  {error}
                </div>
              )}
              <button type="submit" className="register-2col-btn">
                Tiếp tục
              </button>
            </form>
          ) : (
            <form className="register-2col-form" onSubmit={handleSubmit}>
              <input
                type="email"
                name="Email"
                placeholder="Email"
                className="register-2col-input"
                value={formData.Email}
                onChange={handleInputChange}
                required
              />
              <input
                type="password"
                name="Password"
                placeholder="Mật khẩu"
                className="register-2col-input"
                value={formData.Password}
                onChange={handleInputChange}
                required
              />
              <input
                type="password"
                name="ConfirmPassword"
                placeholder="Nhập lại mật khẩu"
                className="register-2col-input"
                value={formData.ConfirmPassword}
                onChange={handleInputChange}
                required
              />
              <select
                name="Sex"
                className="register-2col-input"
                value={formData.Sex}
                onChange={handleInputChange}
                required
              >
                <option value="Male">Nam</option>
                <option value="Female">Nữ</option>
                <option value="Other">Khác</option>
              </select>
              {error && (
                <div
                  style={{ color: "red", marginBottom: 8, textAlign: "center" }}
                >
                  {error}
                </div>
              )}
              <div className="register-2col-buttons">
                <button
                  type="button"
                  className="register-2col-btn register-2col-btn-secondary"
                  onClick={handlePrevStep}
                  disabled={isLoading}
                >
                  Quay lại
                </button>
                <button
                  type="submit"
                  className="register-2col-btn"
                  disabled={isLoading}
                >
                  {isLoading ? "Đang đăng ký..." : "Đăng ký"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
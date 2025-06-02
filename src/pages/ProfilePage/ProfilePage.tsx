import React, { useState, useEffect } from "react";
import "./ProfilePage.css";
import { useAuth } from "../context/AuthContext";
import api from "../../config/axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  User,
  Ticket,
  QrCode,
  Bell,
  Settings,
  Home,
  LogOut,
} from "lucide-react";

interface UserProfile {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  dateOfBirth: string;
  sex: string;
  role: string;
  accountStatus: string;
}

const Profile: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [notificationCount] = useState(0); // Giả lập số lượng thông báo

  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get("/auth/profile");
        setUserProfile(response.data);
        setFormData(response.data);
        setIsLoading(false);
      } catch (err: any) {
        setIsLoading(false);
        const errorMessage =
          err.response?.data?.message || "Không thể tải thông tin người dùng.";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    };

    fetchUserProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    setIsLoading(true);
    setError(null);

    try {
      const updateData = {
        FullName: formData.fullName,
        DateOfBirth: formData.dateOfBirth,
        Sex: formData.sex,
        PhoneNumber: formData.phoneNumber,
        Address: formData.address,
      };

      await api.put("/auth/profile", updateData);
      setUserProfile(formData);
      setIsLoading(false);
      toast.success("Cập nhật hồ sơ thành công!");
    } catch (err: any) {
      setIsLoading(false);
      const errorMessage =
        err.response?.data?.message || "Không thể cập nhật hồ sơ.";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setIsPasswordLoading(true);

    if (newPassword !== confirmPassword) {
      setPasswordError("Mật khẩu mới và xác nhận mật khẩu không khớp.");
      setIsPasswordLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Mật khẩu mới phải có ít nhất 6 ký tự.");
      setIsPasswordLoading(false);
      return;
    }

    try {
      const response = await api.put("/auth/password", {
        OldPassword: oldPassword,
        NewPassword: newPassword,
        ConfirmNewPassword: confirmPassword,
      });
      setIsPasswordLoading(false);
      toast.success(response.data.message || "Đổi mật khẩu thành công!");
      setShowPasswordModal(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setIsPasswordLoading(false);
      const errorMessage =
        err.response?.data?.message || "Không thể đổi mật khẩu.";
      setPasswordError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (isLoading) {
    return <div className="profile-wrapper">Đang tải...</div>;
  }

  if (error) {
    return <div className="profile-wrapper">Lỗi: {error}</div>;
  }

  return (
    <div className="profile-wrapper">
      <div className="profile-container">
        {/* Ô thứ nhất: Menu quản lý tài khoản */}
        <div className="profile-box profile-menu-box">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full flex items-center px-4 py-2 rounded-md text-left ${
                  activeTab === "profile"
                    ? "bg-indigo-50 text-indigo-600 font-medium"
                    : "text-gray-300 hover:bg-gray-700"
                }`}
              >
                <User className="h-5 w-5 mr-3 flex-shrink-0" />
                Thông tin cá nhân
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("bookings")}
                className={`w-full flex items-center px-4 py-2 rounded-md text-left ${
                  activeTab === "bookings"
                    ? "bg-indigo-50 text-indigo-600 font-medium"
                    : "text-gray-300 hover:bg-gray-700"
                }`}
              >
                <Ticket className="h-5 w-5 mr-3 flex-shrink-0" />
                Lịch sử đặt vé
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("checkins")}
                className={`w-full flex items-center px-4 py-2 rounded-md text-left ${
                  activeTab === "checkins"
                    ? "bg-indigo-50 text-indigo-600 font-medium"
                    : "text-gray-300 hover:bg-gray-700"
                }`}
              >
                <QrCode className="h-5 w-5 mr-3 flex-shrink-0" />
                Check-in vé
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("notifications")}
                className={`w-full flex items-center justify-between px-4 py-2 rounded-md text-left ${
                  activeTab === "notifications"
                    ? "bg-indigo-50 text-indigo-600 font-medium"
                    : "text-gray-300 hover:bg-gray-700"
                }`}
              >
                <div className="flex items-center">
                  <Bell className="h-5 w-5 mr-3 flex-shrink-0" />
                  Thông báo
                </div>
                {notificationCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center ml-2 flex-shrink-0">
                    {notificationCount}
                  </span>
                )}
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/")}
                className="w-full flex items-center px-4 py-2 rounded-md text-gray-300 hover:bg-gray-700 text-left"
              >
                <Home className="h-5 w-5 mr-3 flex-shrink-0" />
                Trang chủ
              </button>
            </li>
            <li className="border-t border-gray-600 pt-2 mt-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-2 rounded-md text-red-500 hover:bg-red-900/20 text-left"
              >
                <LogOut className="h-5 w-5 mr-3 flex-shrink-0" />
                Đăng xuất
              </button>
            </li>
          </ul>
        </div>

        {/* Ô thứ hai: Thông tin tài khoản */}
        <div className="profile-box profile-info-box">
          <h2 className="profile-info-title">Tài khoản</h2>
          <p className="profile-info-subtitle">Cập nhật thông tin tài khoản</p>

          <form onSubmit={handleUpdateProfile}>
            <div className="profile-info-grid">
              {/* Cột trái */}
              <div className="profile-info-column">
                <div className="profile-info-section">
                  <label className="profile-info-label">Tên thành viên</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData?.fullName || ""}
                    onChange={handleInputChange}
                    className="profile-info-input"
                  />
                </div>

                <div className="profile-info-section">
                  <label className="profile-info-label">Email</label>
                  <input
                    type="email"
                    value={formData?.email || ""}
                    className="profile-info-input"
                    readOnly
                  />
                </div>

                <div className="profile-info-section">
                  <label className="profile-info-label">Số điện thoại</label>
                  <input
                    type="text"
                    name="phoneNumber"
                    value={formData?.phoneNumber || ""}
                    onChange={handleInputChange}
                    className="profile-info-input"
                  />
                </div>

                <div className="profile-info-section">
                  <label className="profile-info-label">Địa chỉ</label>
                  <input
                    type="text"
                    name="address"
                    value={formData?.address || ""}
                    onChange={handleInputChange}
                    className="profile-info-input"
                  />
                </div>
              </div>

              {/* Cột phải */}
              <div className="profile-info-column">
                <div className="profile-info-section">
                  <label className="profile-info-label">Ngày sinh</label>
                  <input
                    type="text"
                    name="dateOfBirth"
                    value={formData?.dateOfBirth || ""}
                    onChange={handleInputChange}
                    className="profile-info-input"
                  />
                </div>

                <div className="profile-info-section">
                  <label className="profile-info-label">Giới tính</label>
                  <input
                    type="text"
                    name="sex"
                    value={formData?.sex || ""}
                    onChange={handleInputChange}
                    className="profile-info-input"
                  />
                </div>

                <div className="profile-info-section">
                  <label className="profile-info-label">Vai trò</label>
                  <input
                    type="text"
                    value={formData?.role || ""}
                    className="profile-info-input"
                    readOnly
                  />
                </div>

                <div className="profile-info-section">
                  <label className="profile-info-label">
                    Trạng thái tài khoản
                  </label>
                  <input
                    type="text"
                    value={formData?.accountStatus || ""}
                    className="profile-info-input"
                    readOnly
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="profile-update-btn"
              disabled={isLoading}
            >
              {isLoading ? "Đang cập nhật..." : "Cập nhật"}
            </button>
          </form>

          <div className="profile-change-password">
            <span
              onClick={() => setShowPasswordModal(true)}
              className="profile-change-password-link"
            >
              Đổi mật khẩu, nhấn vào đây
            </span>
          </div>
        </div>
      </div>

      {/* Modal đổi mật khẩu */}
      {showPasswordModal && (
        <div className="password-modal-overlay">
          <div className="password-modal">
            <h3 className="password-modal-title">Đổi mật khẩu</h3>
            <form onSubmit={handlePasswordSubmit}>
              <div className="password-modal-section">
                <label className="password-modal-label">Mật khẩu cũ</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="password-modal-input"
                  required
                />
              </div>
              <div className="password-modal-section">
                <label className="password-modal-label">Mật khẩu mới</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="password-modal-input"
                  required
                />
              </div>
              <div className="password-modal-section">
                <label className="password-modal-label">
                  Xác nhận mật khẩu mới
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="password-modal-input"
                  required
                />
              </div>
              {passwordError && (
                <div className="password-modal-error">{passwordError}</div>
              )}
              <div className="password-modal-buttons">
                <button
                  type="submit"
                  className="password-modal-btn"
                  disabled={isPasswordLoading}
                >
                  {isPasswordLoading ? "Đang đổi..." : "Đổi mật khẩu"}
                </button>
                <button
                  type="button"
                  className="password-modal-close-btn"
                  onClick={() => setShowPasswordModal(false)}
                  disabled={isPasswordLoading}
                >
                  Đóng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;

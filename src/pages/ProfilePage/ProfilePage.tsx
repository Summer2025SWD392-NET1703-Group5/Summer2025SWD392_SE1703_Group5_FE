import React, { useState, useEffect } from "react";
import "./ProfilePage.css";
import { useAuth } from "../context/AuthContext";
import api from "../../config/axios";
import { toast } from "react-toastify";

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
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get("/auth/profile"); // Sửa endpoint thành /users/profile
        setUserProfile(response.data);
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
          <h3 className="profile-box-title">Quản lý tài khoản</h3>
          <ul className="profile-menu">
            <li className="profile-menu-item">
              <span className="profile-menu-icon">♥</span>
              <span className="profile-menu-text">Yêu thích</span>
            </li>
            <li className="profile-menu-item">
              <span className="profile-menu-icon">+</span>
              <span className="profile-menu-text">Danh sách</span>
            </li>
            <li className="profile-menu-item">
              <span className="profile-menu-icon">👁️</span>
              <span className="profile-menu-text">Xem tiếp</span>
            </li>
            <li className="profile-menu-item active">
              <span className="profile-menu-icon">👤</span>
              <span className="profile-menu-text">Tài khoản</span>
            </li>
          </ul>
          <div className="profile-user-info">
            <p className="profile-username">
              {userProfile?.fullName || "Người dùng"}
            </p>
            <p className="profile-email">
              {userProfile?.email || "email@example.com"}
            </p>
          </div>
          <button className="profile-logout-btn" onClick={logout}>
            Thoát
          </button>
        </div>

        {/* Ô thứ hai: Thông tin tài khoản */}
        <div className="profile-box profile-info-box">
          <h2 className="profile-info-title">Tài khoản</h2>
          <p className="profile-info-subtitle">Cập nhật thông tin tài khoản</p>

          <div className="profile-info-grid">
            {/* Cột trái */}
            <div className="profile-info-column">
              <div className="profile-info-section">
                <label className="profile-info-label">Tên thành viên</label>
                <input
                  type="text"
                  value={userProfile?.fullName || ""}
                  className="profile-info-input"
                  readOnly
                />
              </div>

              <div className="profile-info-section">
                <label className="profile-info-label">Email</label>
                <input
                  type="email"
                  value={userProfile?.email || ""}
                  className="profile-info-input"
                  readOnly
                />
              </div>

              <div className="profile-info-section">
                <label className="profile-info-label">Số điện thoại</label>
                <input
                  type="text"
                  value={userProfile?.phoneNumber || ""}
                  className="profile-info-input"
                  readOnly
                />
              </div>

              <div className="profile-info-section">
                <label className="profile-info-label">Địa chỉ</label>
                <input
                  type="text"
                  value={userProfile?.address || ""}
                  className="profile-info-input"
                  readOnly
                />
              </div>
            </div>

            {/* Cột phải */}
            <div className="profile-info-column">
              <div className="profile-info-section">
                <label className="profile-info-label">Ngày sinh</label>
                <input
                  type="text"
                  value={userProfile?.dateOfBirth || ""}
                  className="profile-info-input"
                  readOnly
                />
              </div>

              <div className="profile-info-section">
                <label className="profile-info-label">Giới tính</label>
                <input
                  type="text"
                  value={userProfile?.sex || ""}
                  className="profile-info-input"
                  readOnly
                />
              </div>

              <div className="profile-info-section">
                <label className="profile-info-label">Vai trò</label>
                <input
                  type="text"
                  value={userProfile?.role || ""}
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
                  value={userProfile?.accountStatus || ""}
                  className="profile-info-input"
                  readOnly
                />
              </div>
            </div>
          </div>

          <button className="profile-update-btn">Cập nhật</button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
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
  Home,
  LogOut,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Lock,
  ChevronRight,
  AlertTriangle,
  X,
} from "lucide-react";
import BookingHistory from "./components/BookingHistory";
import Notification from "./components/Notification";
import MyTicket from "./components/Myticket"; 

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

interface ApiError {
  response?: {
    data?: {
      message?: string;
      errors?: Array<{
        field: string;
        message: string;
        value: string;
      }>;
    };
  };
  message?: string;
}

interface ApiErrorData {
  message?: string;
  errors?: Array<{
    field: string;
    message: string;
    value: string;
  }>;
}

const Profile: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [apiErrorData, setApiErrorData] = useState<ApiErrorData | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [notificationCount, setNotificationCount] = useState(0); 

  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get("/auth/profile");
        setUserProfile(response.data);
        setFormData(response.data);
        setIsLoading(false);
      } catch (err: unknown) {
        setIsLoading(false);
        const apiError = err as ApiError;
        const errorMessage =
          apiError.response?.data?.message || "Không thể tải thông tin người dùng.";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    };

    const fetchNotificationCount = async () => {
      try {
        const response = await api.get("/notifications");
        if (response.data.Success) {
          setNotificationCount(response.data.UnreadCount);
        }
      } catch (err: unknown) {
        const apiError = err as ApiError;
        console.error("Error fetching notification count:", apiError);
      }
    };

    fetchUserProfile();
    fetchNotificationCount();
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
    setFieldErrors({});
    setApiErrorData(null);

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
    } catch (err: unknown) {
      setIsLoading(false);
      const apiError = err as ApiError;
      
      // Set main error message
      const errorMessage =
        apiError.response?.data?.message || "Không thể cập nhật hồ sơ.";
      setError(errorMessage);
      
      // Save API error data for displaying
      if (apiError.response?.data) {
        setApiErrorData(apiError.response.data);
      }
      
      // Process field-specific errors
      if (apiError.response?.data?.errors && apiError.response.data.errors.length > 0) {
        const newFieldErrors: Record<string, string> = {};
        
        apiError.response.data.errors.forEach(error => {
          // Convert API field names (PascalCase) to component field names (camelCase)
          const fieldName = error.field.charAt(0).toLowerCase() + error.field.slice(1);
          newFieldErrors[fieldName] = error.message;
        });
        
        setFieldErrors(newFieldErrors);
      }
      
      toast.error(errorMessage);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setIsPasswordLoading(true);
    setApiErrorData(null);

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
    } catch (err: unknown) {
      setIsPasswordLoading(false);
      const apiError = err as ApiError;
      
      // Set main error message
      const errorMessage =
        apiError.response?.data?.message || "Không thể đổi mật khẩu.";
      setPasswordError(errorMessage);
      
      // Save API error data for displaying
      if (apiError.response?.data) {
        setApiErrorData(apiError.response.data);
      }
      
      toast.error(errorMessage);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Callback to update notification count from Notification component
  const updateNotificationCount = (unreadCount: number) => {
    setNotificationCount(unreadCount);
  };

  if (isLoading) {
    return (
      <div className="profile-wrapper">
        <div className="profile-loading">
          <div className="profile-loading-spinner"></div>
          <p>Đang tải thông tin tài khoản...</p>
        </div>
      </div>
    );
  }

  if (error && !userProfile) {
    return (
      <div className="profile-wrapper">
        <div className="profile-error">
          <AlertTriangle size={24} />
          <p>Lỗi: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="profile-update-btn"
            style={{ marginTop: '15px' }}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-wrapper">
      <div className="profile-container">
        <div className="profile-box profile-menu-box">
          {userProfile && (
            <div className="profile-user-summary">
              <div className="profile-avatar">
                {userProfile.fullName.charAt(0).toUpperCase()}
              </div>
              <div className="profile-user-info">
                <h3 className="profile-username">{userProfile.fullName}</h3>
                <p className="profile-role">{userProfile.role}</p>
              </div>
            </div>
          )}
          
          <ul className="profile-menu-list">
            <li>
              <button
                onClick={() => setActiveTab("profile")}
                className={`menu-item ${
                  activeTab === "profile" ? "active" : ""
                }`}
              >
                <User className="menu-icon" />
                <span>Thông tin cá nhân</span>
                {activeTab === "profile" && <ChevronRight size={16} className="menu-active-icon" />}
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("bookings")}
                className={`menu-item ${
                  activeTab === "bookings" ? "active" : ""
                }`}
              >
                <Calendar className="menu-icon" />
                <span>Lịch sử đặt vé</span>
                {activeTab === "bookings" && <ChevronRight size={16} className="menu-active-icon" />}
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("checkins")}
                className={`menu-item ${
                  activeTab === "checkins" ? "active" : ""
                }`}
              >
                <QrCode className="menu-icon" />
                <span>Check-in vé</span>
                {activeTab === "checkins" && <ChevronRight size={16} className="menu-active-icon" />}
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("notifications")}
                className={`menu-item ${
                  activeTab === "notifications" ? "active" : ""
                }`}
              >
                <Bell className="menu-icon" />
                <span>Thông báo</span>
                
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("tickets")}
                className={`menu-item ${
                  activeTab === "tickets" ? "active" : ""
                }`}
              >
                <Ticket className="menu-icon" />
                <span>Vé của tôi</span>
                {activeTab === "tickets" && <ChevronRight size={16} className="menu-active-icon" />}
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/")}
                className="menu-item"
              >
                <Home className="menu-icon" />
                <span>Trang chủ</span>
              </button>
            </li>
            <li className="menu-divider">
              <button
                onClick={handleLogout}
                className="menu-item logout-item"
              >
                <LogOut className="menu-icon" />
                <span>Đăng xuất</span>
              </button>
            </li>
          </ul>
        </div>

        {activeTab === "profile" && (
          <div className="profile-box profile-info-box">
            <h2 className="profile-info-title">Thông tin cá nhân</h2>
            <p className="profile-info-subtitle">Cập nhật thông tin tài khoản của bạn</p>

            {error && (
              <div className="api-error-banner">
                <AlertTriangle size={18} className="error-icon" />
                <span>{error}</span>
                {apiErrorData?.errors && apiErrorData.errors.length > 0 && (
                  <ul style={{ 
                    marginTop: '8px', 
                    paddingLeft: '24px', 
                    listStyleType: 'disc',
                    fontSize: '14px'
                  }}>
                    {apiErrorData.errors.map((err: { field: string; message: string; value: string }, index: number) => (
                      <li key={index}>
                        <strong>{err.field}:</strong> {err.message}
                      </li>
                    ))}
                  </ul>
                )}
                <button 
                  onClick={() => {
                    setError(null);
                    setApiErrorData(null);
                  }} 
                  className="modal-close-btn"
                  style={{ 
                    position: 'absolute', 
                    right: '10px', 
                    top: '10px', 
                    background: 'transparent',
                    border: 'none',
                    color: '#ef4444',
                    fontSize: '18px',
                    cursor: 'pointer'
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="profile-form">
              <div className="profile-info-grid">
                <div className="profile-info-column">
                  <div className="profile-info-section">
                    <label className="profile-info-label">
                      <User size={16} className="field-icon" />
                      Họ và tên
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData?.fullName || ""}
                      onChange={handleInputChange}
                      className="profile-info-input"
                      placeholder="Nhập họ và tên của bạn"
                    />
                  </div>
                  <div className="profile-info-section">
                    <label className="profile-info-label">
                      <Mail size={16} className="field-icon" />
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData?.email || ""}
                      className="profile-info-input disabled"
                      readOnly
                    />
                  </div>
                  <div className="profile-info-section">
                    <label className="profile-info-label">
                      <Phone size={16} className="field-icon" />
                      Số điện thoại
                    </label>
                    <input
                      type="text"
                      name="phoneNumber"
                      value={formData?.phoneNumber || ""}
                      onChange={handleInputChange}
                      className={`profile-info-input ${fieldErrors.phoneNumber ? 'error' : ''}`}
                      placeholder="Nhập số điện thoại của bạn"
                    />
                    {fieldErrors.phoneNumber && (
                      <div className="form-error">{fieldErrors.phoneNumber}</div>
                    )}
                  </div>
                </div>
                <div className="profile-info-column">
                  <div className="profile-info-section">
                    <label className="profile-info-label">
                      <Calendar size={16} className="field-icon" />
                      Ngày sinh
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData?.dateOfBirth || ""}
                      onChange={handleInputChange}
                      className="profile-info-input"
                    />
                  </div>
                  <div className="profile-info-section">
                    <label className="profile-info-label">
                      <User size={16} className="field-icon" />
                      Giới tính
                    </label>
                    <select
                      name="sex"
                      value={formData?.sex || ""}
                      onChange={(e) => 
                        setFormData((prev) => 
                          prev ? { ...prev, sex: e.target.value } : null
                        )
                      }
                      className="profile-info-input"
                    >
                      <option value="">Chọn giới tính</option>
                      <option value="Male">Nam</option>
                      <option value="Female">Nữ</option>
                      <option value="Other">Khác</option>
                    </select>
                  </div>
                  <div className="profile-info-section">
                    <label className="profile-info-label">
                      <MapPin size={16} className="field-icon" />
                      Địa chỉ
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData?.address || ""}
                      onChange={handleInputChange}
                      className={`profile-info-input ${fieldErrors.address ? 'error' : ''}`}
                      placeholder="Nhập địa chỉ của bạn"
                    />
                    {fieldErrors.address && (
                      <div className="form-error">{fieldErrors.address}</div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="profile-actions">
                <button
                  type="submit"
                  className="profile-update-btn"
                  disabled={isLoading}
                >
                  {isLoading ? "Đang cập nhật..." : "Cập nhật thông tin"}
                </button>
                
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(true)}
                  className="profile-password-btn"
                >
                  <Lock size={16} />
                  Đổi mật khẩu
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === "bookings" && <BookingHistory />}

        {activeTab === "checkins" && (
          <div className="profile-box profile-info-box">
            <h2 className="profile-info-title">Check-in vé</h2>
            <p className="profile-info-subtitle">Quản lý check-in vé của bạn</p>
            
            <div className="profile-empty-state">
              <QrCode size={64} className="empty-icon" />
              <h3>Chưa có dữ liệu check-in</h3>
              <p>Bạn chưa có lịch sử check-in nào. Hãy đặt vé và check-in tại rạp!</p>
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <Notification updateNotificationCount={updateNotificationCount} />
        )}

        {activeTab === "tickets" && (
          <MyTicket /> 
        )}
      </div>

      {showPasswordModal && (
        <div className="password-modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="password-modal" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close-btn" 
              onClick={() => setShowPasswordModal(false)}
              aria-label="Đóng"
            >
              &times;
            </button>
            
            <h3 className="password-modal-title">
              <Lock size={20} className="modal-title-icon" />
              Đổi mật khẩu
            </h3>
            
            <form onSubmit={handlePasswordSubmit}>
              <div className="password-modal-section">
                <label className="password-modal-label">Mật khẩu hiện tại</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="password-modal-input"
                  placeholder="Nhập mật khẩu hiện tại"
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
                  placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
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
                  placeholder="Xác nhận lại mật khẩu mới"
                  required
                />
              </div>
              {passwordError && (
                <div className="password-modal-error">
                  {passwordError}
                  {apiErrorData?.errors && apiErrorData.errors.length > 0 && (
                    <ul style={{ 
                      marginTop: '8px', 
                      paddingLeft: '16px', 
                      listStyleType: 'disc',
                      fontSize: '13px',
                      textAlign: 'left'
                    }}>
                      {apiErrorData.errors.map((err: { field: string; message: string; value: string }, index: number) => (
                        <li key={index}>
                          <strong>{err.field}:</strong> {err.message}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
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
                  Hủy
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
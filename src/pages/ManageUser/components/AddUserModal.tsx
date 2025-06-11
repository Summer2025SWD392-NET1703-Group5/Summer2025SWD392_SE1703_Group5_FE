import React, { useState } from "react";
import "./AddUserModal.css";

interface AddUserData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  sex: "Male" | "Female";
  role: "Customer" | "Staff" | "Admin" | "Manager";
}

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddUser: (userData: AddUserData) => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose, onAddUser }) => {
  const [formData, setFormData] = useState<AddUserData>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    sex: "Male",
    role: "Customer",
  });

  const [errors, setErrors] = useState<Partial<AddUserData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof AddUserData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<AddUserData> = {};

    // Full name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Họ và tên là bắt buộc";
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Họ và tên phải có ít nhất 2 ký tự";
    } else if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(formData.fullName.trim())) {
      newErrors.fullName = "Họ và tên chỉ được chứa chữ cái và khoảng trắng";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email là bắt buộc";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Vui lòng nhập địa chỉ email hợp lệ";
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = "Số điện thoại là bắt buộc";
    } else if (!/^(\+84|84|0)[3|5|7|8|9][0-9]{8}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Vui lòng nhập số điện thoại hợp lệ (VD: 0123456789)";
    }

    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = "Địa chỉ là bắt buộc";
    } else if (formData.address.trim().length < 5) {
      newErrors.address = "Địa chỉ phải có ít nhất 5 ký tự";
    }

    // Date of birth validation
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Ngày sinh là bắt buộc";
    } else {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();

      if (birthDate > today) {
        newErrors.dateOfBirth = "Ngày sinh không được trong tương lai";
      } else if (age < 13) {
        newErrors.dateOfBirth = "Người dùng phải ít nhất 13 tuổi";
      } else if (age > 120) {
        newErrors.dateOfBirth = "Ngày sinh không hợp lệ";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Format data for API
      const userData = {
        ...formData,
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.replace(/\s/g, ""),
        address: formData.address.trim(),
      };

      await onAddUser(userData);

      // Reset form
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        address: "",
        dateOfBirth: "",
        sex: "Male",
        role: "Customer",
      });
      setErrors({});
    } catch (error) {
      console.error("Error adding user:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      address: "",
      dateOfBirth: "",
      sex: "Male",
      role: "Customer",
    });
    setErrors({});
    onClose();
  };

  // Get max date (today)
  const getMaxDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // Get min date (120 years ago)
  const getMinDate = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 120);
    return date.toISOString().split("T")[0];
  };

  if (!isOpen) return null;

  return (
    <div className="add-modal-overlay" onClick={handleClose}>
      <div className="add-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="add-modal-header">
          <h2>Thêm người dùng mới</h2>
          <button className="add-modal-close-btn" onClick={handleClose} type="button">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="add-user-form">
          {/* Full Name and Email */}
          <div className="add-form-row">
            <div className="add-form-group">
              <label htmlFor="fullName">Họ và tên *</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className={errors.fullName ? "add-input-error" : ""}
                placeholder="Nhập họ và tên"
                disabled={isSubmitting}
              />
              {errors.fullName && <span className="add-error-message">{errors.fullName}</span>}
            </div>

            <div className="add-form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? "add-input-error" : ""}
                placeholder="Nhập địa chỉ email"
                disabled={isSubmitting}
              />
              {errors.email && <span className="add-error-message">{errors.email}</span>}
            </div>
          </div>

          {/* Phone and Date of Birth */}
          <div className="add-form-row">
            <div className="add-form-group">
              <label htmlFor="phone">Số điện thoại *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={errors.phone ? "add-input-error" : ""}
                placeholder="Nhập số điện thoại (VD: 0123456789)"
                disabled={isSubmitting}
              />
              {errors.phone && <span className="add-error-message">{errors.phone}</span>}
            </div>

            <div className="add-form-group">
              <label htmlFor="dateOfBirth">Ngày sinh *</label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                className={errors.dateOfBirth ? "add-input-error" : ""}
                min={getMinDate()}
                max={getMaxDate()}
                disabled={isSubmitting}
              />
              {errors.dateOfBirth && <span className="add-error-message">{errors.dateOfBirth}</span>}
            </div>
          </div>

          {/* Address */}
          <div className="add-form-group">
            <label htmlFor="address">Địa chỉ *</label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className={errors.address ? "add-input-error" : ""}
              placeholder="Nhập địa chỉ đầy đủ"
              rows={3}
              disabled={isSubmitting}
            />
            {errors.address && <span className="add-error-message">{errors.address}</span>}
          </div>

          {/* Sex and Role */}
          <div className="add-form-row">
            <div className="add-form-group">
              <label htmlFor="sex">Giới tính</label>
              <select id="sex" name="sex" value={formData.sex} onChange={handleInputChange} disabled={isSubmitting}>
                <option value="Male">Nam</option>
                <option value="Female">Nữ</option>
              </select>
            </div>

            <div className="add-form-group">
              <label htmlFor="role">Vai trò</label>
              <select id="role" name="role" value={formData.role} onChange={handleInputChange} disabled={isSubmitting}>
                <option value="Customer">Khách hàng</option>
                <option value="Staff">Nhân viên</option>
                <option value="Manager">Quản lý</option>
                <option value="Admin">Quản trị viên</option>
              </select>
            </div>
          </div>

          {/* Info box */}
          <div className="add-info-box">
            <p>📝 Thông tin quan trọng:</p>
            <ul>
              <li>Mật khẩu tạm thời sẽ được tự động tạo và gửi qua email</li>
              <li>Người dùng sẽ được yêu cầu đổi mật khẩu khi đăng nhập lần đầu</li>
              <li>Tài khoản sẽ được kích hoạt ngay sau khi tạo</li>
            </ul>
          </div>

          {/* Form Actions */}
          <div className="add-modal-actions">
            <button type="button" onClick={handleClose} className="add-btn-secondary" disabled={isSubmitting}>
              Hủy
            </button>
            <button type="submit" className="add-btn-primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="add-spinner-small"></span>
                  Đang tạo...
                </>
              ) : (
                <>
                  <span>➕</span>
                  Thêm người dùng
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;

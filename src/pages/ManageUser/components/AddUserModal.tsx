import React, { useState } from "react";
import "./AddUserModal.css";

interface AddUserData {
  username: string;
  email: string;
  fullName: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: "admin" | "user" | "staff";
  status: "active" | "inactive";
}

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddUser: (userData: Omit<AddUserData, "confirmPassword">) => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose, onAddUser }) => {
  const [formData, setFormData] = useState<AddUserData>({
    username: "",
    email: "",
    fullName: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "user",
    status: "active",
  });

  const [errors, setErrors] = useState<Partial<AddUserData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof AddUserData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<AddUserData> = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = "Username can only contain letters, numbers, and underscores";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = "Full name must be at least 2 characters";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Password must contain at least one uppercase letter, one lowercase letter, and one number";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const { confirmPassword, ...userData } = formData;
      onAddUser(userData);

      setFormData({
        username: "",
        email: "",
        fullName: "",
        phone: "",
        password: "",
        confirmPassword: "",
        role: "user",
        status: "active",
      });

      onClose();
    } catch (error) {
      console.error("Error adding user:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      username: "",
      email: "",
      fullName: "",
      phone: "",
      password: "",
      confirmPassword: "",
      role: "user",
      status: "active",
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="add-modal-overlay" onClick={handleClose}>
      <div className="add-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="add-modal-header">
          <h2>Add New User</h2>
          <button className="add-modal-close-btn" onClick={handleClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="add-user-form">
          <div className="add-form-row">
            <div className="add-form-group">
              <label htmlFor="username">Username *</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className={errors.username ? "add-input-error" : ""}
                placeholder="Enter username"
              />
              {errors.username && <span className="add-error-message">{errors.username}</span>}
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
                placeholder="Enter email address"
              />
              {errors.email && <span className="add-error-message">{errors.email}</span>}
            </div>
          </div>

          <div className="add-form-row">
            <div className="add-form-group">
              <label htmlFor="fullName">Full Name *</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className={errors.fullName ? "add-input-error" : ""}
                placeholder="Enter full name"
              />
              {errors.fullName && <span className="add-error-message">{errors.fullName}</span>}
            </div>

            <div className="add-form-group">
              <label htmlFor="phone">Phone Number *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={errors.phone ? "add-input-error" : ""}
                placeholder="Enter phone number"
              />
              {errors.phone && <span className="add-error-message">{errors.phone}</span>}
            </div>
          </div>

          <div className="add-form-row">
            <div className="add-form-group">
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={errors.password ? "add-input-error" : ""}
                placeholder="Enter password"
              />
              {errors.password && <span className="add-error-message">{errors.password}</span>}
            </div>

            <div className="add-form-group">
              <label htmlFor="confirmPassword">Confirm Password *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={errors.confirmPassword ? "add-input-error" : ""}
                placeholder="Confirm password"
              />
              {errors.confirmPassword && <span className="add-error-message">{errors.confirmPassword}</span>}
            </div>
          </div>

          <div className="add-form-row">
            <div className="add-form-group">
              <label htmlFor="role">Role</label>
              <select id="role" name="role" value={formData.role} onChange={handleInputChange}>
                <option value="user">User</option>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="add-form-group">
              <label htmlFor="status">Status</label>
              <select id="status" name="status" value={formData.status} onChange={handleInputChange}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="add-password-requirements">
            <p>Password requirements:</p>
            <ul>
              <li>At least 8 characters long</li>
              <li>Contains at least one uppercase letter</li>
              <li>Contains at least one lowercase letter</li>
              <li>Contains at least one number</li>
            </ul>
          </div>

          <div className="add-modal-actions">
            <button type="button" onClick={handleClose} className="add-btn-secondary" disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="add-btn-primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="add-spinner-small"></span>
                  Adding User...
                </>
              ) : (
                "Add User"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;

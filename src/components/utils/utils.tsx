import React from "react";
import { toast } from "react-toastify";

// Date formatting utilities
export const formatDate = (date: string | Date | null | undefined, locale: string = "vi-VN"): string => {
  if (!date) return "Không có dữ liệu";

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;

    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return "Ngày không hợp lệ";
    }

    return dateObj.toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Lỗi định dạng ngày";
  }
};

export const formatDateTime = (date: string | Date | null | undefined, locale: string = "vi-VN"): string => {
  if (!date) return "Không có dữ liệu";

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;

    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return "Ngày không hợp lệ";
    }

    return dateObj.toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    console.error("Error formatting datetime:", error);
    return "Lỗi định dạng ngày giờ";
  }
};

// Time conversion utility for HTML time inputs
export const convertToTimeInputFormat = (timeString: string | Date | null | undefined): string => {
  if (!timeString) return "";

  try {
    let dateObj: Date;

    if (timeString instanceof Date) {
      dateObj = timeString;
    } else if (typeof timeString === "string") {
      // Handle HH:MM or HH:MM:SS format
      if (timeString.match(/^\d{1,2}:\d{2}(:\d{2})?$/)) {
        const [hours, minutes] = timeString.split(":");
        const paddedHours = hours.padStart(2, "0");
        const paddedMinutes = minutes.padStart(2, "0");
        return `${paddedHours}:${paddedMinutes}`;
      }

      // Handle ISO datetime strings
      if (timeString.includes("T")) {
        const timePart = timeString.split("T")[1];
        if (timePart) {
          const timeOnly = timePart.split(".")[0]; // Remove milliseconds
          const [hours, minutes] = timeOnly.split(":");
          const paddedHours = hours.padStart(2, "0");
          const paddedMinutes = minutes.padStart(2, "0");
          return `${paddedHours}:${paddedMinutes}`;
        }
      }

      // Try to create a date object from the string
      dateObj = new Date(`1970-01-01T${timeString}`);

      // If that fails, try parsing as full datetime
      if (isNaN(dateObj.getTime())) {
        dateObj = new Date(timeString);
      }
    } else {
      return "";
    }

    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      console.warn("Could not parse time string:", timeString);
      return typeof timeString === "string" && timeString.match(/^\d{1,2}:\d{2}$/) ? timeString : "";
    }

    const hours = dateObj.getHours().toString().padStart(2, "0");
    const minutes = dateObj.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  } catch (error) {
    console.error("Error converting time to input format:", error);
    return typeof timeString === "string" && timeString.match(/^\d{1,2}:\d{2}$/) ? timeString : "";
  }
};

// Enhanced time formatting for display
export const formatTime = (date: string | Date | null | undefined): string => {
  if (!date) return "Không có dữ liệu";

  try {
    let dateObj: Date;

    if (date instanceof Date) {
      dateObj = date;
    } else if (typeof date === "string") {
      // Handle HH:MM format
      if (date.match(/^\d{1,2}:\d{2}(:\d{2})?$/)) {
        const [hours, minutes] = date.split(":");
        dateObj = new Date();
        dateObj.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      } else {
        // Handle full datetime strings
        dateObj = new Date(date);
      }
    } else {
      return "Giờ không hợp lệ";
    }

    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return "Giờ không hợp lệ";
    }

    return dateObj.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, // Use 24-hour format
    });
  } catch (error) {
    console.error("Error formatting time:", error);
    return "Lỗi định dạng giờ";
  }
};

export const getTimeFromNow = (date: string | Date | null | undefined): string => {
  if (!date) return "Không có dữ liệu";

  try {
    const now = new Date();
    const dateObj = typeof date === "string" ? new Date(date) : date;

    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return "Ngày không hợp lệ";
    }

    const diffInMs = now.getTime() - dateObj.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return "vừa xong";
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    if (diffInDays < 7) return `${diffInDays} ngày trước`;

    return formatDate(dateObj);
  } catch (error) {
    console.error("Error calculating time from now:", error);
    return "Lỗi tính toán thời gian";
  }
};

// Price formatting utilities
export const formatPrice = (price: number, currency: string = "VND"): string => {
  if (currency === "VND") {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(price);
};

export const formatNumber = (number: number): string => {
  return new Intl.NumberFormat("vi-VN").format(number);
};

// Duration formatting utilities
export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) return `${remainingMinutes} phút`;
  if (remainingMinutes === 0) return `${hours} giờ`;
  return `${hours} giờ ${remainingMinutes} phút`;
};

// String utilities
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};

export const removeAccents = (str: string): string => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
};

// Movie rating utilities
export const renderStars = (rating: number, maxStars: number = 10): React.JSX.Element[] => {
  const stars: React.JSX.Element[] = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <span key={i} className="star filled">
        ★
      </span>
    );
  }

  if (hasHalfStar) {
    stars.push(
      <span key="half" className="star half">
        ★
      </span>
    );
  }

  const remainingStars = maxStars - Math.ceil(rating);
  for (let i = 0; i < remainingStars; i++) {
    stars.push(
      <span key={`empty-${i}`} className="star empty">
        ★
      </span>
    );
  }

  return stars;
};

export const getRatingText = (rating: number): string => {
  if (rating >= 9) return "Xuất sắc";
  if (rating >= 8) return "Rất tốt";
  if (rating >= 7) return "Tốt";
  if (rating >= 6) return "Khá";
  if (rating >= 5) return "Trung bình";
  if (rating >= 4) return "Dưới trung bình";
  return "Kém";
};

// Status utilities
export const getMovieStatusText = (status: string): string => {
  switch (status.toLowerCase()) {
    case "coming-soon":
      return "SẮP CHIẾU";
    case "now-showing":
      return "ĐANG CHIẾU";
    case "ended":
      return "ĐÃ KẾT THÚC";
    default:
      return status.toUpperCase();
  }
};

export const getAccountStatusText = (status: string): string => {
  switch (status.toLowerCase()) {
    case "active":
      return "Hoạt động";
    case "inactive":
      return "Ngưng hoạt động";
    case "banned":
      return "Bị cấm";
    case "suspended":
      return "Tạm khóa";
    default:
      return status;
  }
};

export const getRoleText = (role: string): string => {
  switch (role.toLowerCase()) {
    case "admin":
      return "Quản trị viên";
    case "staff":
      return "Nhân viên";
    case "customer":
      return "Khách hàng";
    case "manager":
      return "Quản lý";
    default:
      return role;
  }
};

// Validation utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^(\+84|84|0)[3|5|7|8|9][0-9]{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
};

export const validatePassword = (
  password: string
): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Mật khẩu phải có ít nhất 8 ký tự");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Mật khẩu phải có ít nhất một chữ hoa");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Mật khẩu phải có ít nhất một chữ thường");
  }
  if (!/\d/.test(password)) {
    errors.push("Mật khẩu phải có ít nhất một số");
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Mật khẩu phải có ít nhất một ký tự đặc biệt");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Loading component
export const LoadingSpinner: React.FC<{
  size?: "small" | "medium" | "large";
  color?: string;
}> = ({ size = "medium", color = "#e50914" }) => {
  const sizeMap = {
    small: "20px",
    medium: "40px",
    large: "60px",
  };

  return (
    <div
      className="loading-spinner"
      style={{
        width: sizeMap[size],
        height: sizeMap[size],
        border: `3px solid #f3f3f3`,
        borderTop: `3px solid ${color}`,
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
      }}
    />
  );
};

// Empty state component
export const EmptyState: React.FC<{
  title: string;
  description?: string;
  icon?: string;
  action?: React.ReactNode;
}> = ({ title, description, icon = "📭", action }) => {
  return (
    <div className="empty-state" style={{ textAlign: "center", padding: "3rem" }}>
      <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>{icon}</div>
      <h3 style={{ marginBottom: "0.5rem", color: "#333" }}>{title}</h3>
      {description && <p style={{ color: "#666", marginBottom: "1.5rem" }}>{description}</p>}
      {action}
    </div>
  );
};

// Toast notification utility
export const showToast = (
  message: string,
  type: "success" | "error" | "warning" | "info" = "info",
  options?: {
    position?: "top-right" | "top-center" | "top-left" | "bottom-right" | "bottom-center" | "bottom-left";
    autoClose?: number | false;
    hideProgressBar?: boolean;
    closeOnClick?: boolean;
    pauseOnHover?: boolean;
    draggable?: boolean;
  }
) => {
  const defaultOptions = {
    position: "top-right" as const,
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    ...options,
  };

  try {
    switch (type) {
      case "success":
        return toast.success(message, defaultOptions);
      case "error":
        return toast.error(message, defaultOptions);
      case "warning":
        return toast.warn(message, defaultOptions);
      case "info":
        return toast.info(message, defaultOptions);
      default:
        return toast(message, defaultOptions);
    }
  } catch (error) {
    console.error("Toast error:", error);
    // Fallback to console and alert
    console.log(`${type.toUpperCase()}: ${message}`);
    if (type === "error") {
      alert(`Error: ${message}`);
    }
  }
};

// Dismiss all toasts utility
export const dismissAllToasts = () => {
  try {
    toast.dismiss();
  } catch (error) {
    console.error("Error dismissing toasts:", error);
  }
};

// Utility functions for specific toast types with better error handling
export const showSuccessToast = (message: string, options?: any) => {
  try {
    console.log("Showing success toast:", message); // Debug log
    return showToast(message, "success", options);
  } catch (error) {
    console.error("Success toast error:", error);
    console.log(`SUCCESS: ${message}`);
  }
};

export const showErrorToast = (message: string, options?: any) => {
  try {
    console.log("Showing error toast:", message); // Debug log
    return showToast(message, "error", options);
  } catch (error) {
    console.error("Error toast error:", error);
    console.error(`ERROR: ${message}`);
    // Show alert for critical errors
    alert(`Error: ${message}`);
  }
};

export const showWarningToast = (message: string, options?: any) => {
  try {
    console.log("Showing warning toast:", message); // Debug log
    return showToast(message, "warning", options);
  } catch (error) {
    console.error("Warning toast error:", error);
    console.warn(`WARNING: ${message}`);
  }
};

export const showInfoToast = (message: string, options?: any) => {
  try {
    console.log("Showing info toast:", message); // Debug log
    return showToast(message, "info", options);
  } catch (error) {
    console.error("Info toast error:", error);
    console.log(`INFO: ${message}`);
  }
};

// Date conversion utility for HTML date inputs
export const convertToDateInputFormat = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return "";

  try {
    let dateObj: Date;

    if (dateString instanceof Date) {
      dateObj = dateString;
    } else if (typeof dateString === "string") {
      // If already in YYYY-MM-DD format
      if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateString;
      }

      // Parse the date string
      dateObj = new Date(dateString);
    } else {
      return "";
    }

    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      console.warn("Could not parse date string:", dateString);
      return typeof dateString === "string" ? dateString : "";
    }

    // Convert to YYYY-MM-DD format for HTML date input
    const year = dateObj.getFullYear();
    const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
    const day = dateObj.getDate().toString().padStart(2, "0");

    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error("Error converting date to input format:", error);
    return typeof dateString === "string" ? dateString : "";
  }
};

export default {
  // Date utilities
  formatDate,
  formatDateTime,
  convertToTimeInputFormat,
  convertToDateInputFormat,

  // Price utilities
  formatPrice,
  formatNumber,
  formatDuration,

  // String utilities
  capitalize,
  truncateText,
  removeAccents,

  // Rating utilities
  renderStars,
  getRatingText,

  // Status utilities
  getMovieStatusText,
  getAccountStatusText,
  getRoleText,

  // Validation utilities
  validateEmail,
  validatePhone,
  validatePassword,

  // Components
  LoadingSpinner,
  EmptyState,

  // Toast utilities
  showToast,
  showSuccessToast,
  showErrorToast,
  showWarningToast,
  showInfoToast,
  dismissAllToasts,
};

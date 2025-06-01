import React from 'react';

// Date formatting utilities
export const formatDate = (date: string | Date, locale: string = 'vi-VN'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatDateTime = (date: string | Date, locale: string = 'vi-VN'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getTimeFromNow = (date: string | Date): string => {
  const now = new Date();
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const diffInMs = now.getTime() - dateObj.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) return 'vừa xong';
  if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
  if (diffInHours < 24) return `${diffInHours} giờ trước`;
  if (diffInDays < 7) return `${diffInDays} ngày trước`;
  
  return formatDate(dateObj);
};

// Price formatting utilities
export const formatPrice = (price: number, currency: string = 'VND'): string => {
  if (currency === 'VND') {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(price);
};

export const formatNumber = (number: number): string => {
  return new Intl.NumberFormat('vi-VN').format(number);
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
  return text.slice(0, maxLength) + '...';
};

export const removeAccents = (str: string): string => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
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
  if (rating >= 9) return 'Xuất sắc';
  if (rating >= 8) return 'Rất tốt';
  if (rating >= 7) return 'Tốt';
  if (rating >= 6) return 'Khá';
  if (rating >= 5) return 'Trung bình';
  if (rating >= 4) return 'Dưới trung bình';
  return 'Kém';
};

// Status utilities
export const getMovieStatusText = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'coming-soon':
      return 'SẮP CHIẾU';
    case 'now-showing':
      return 'ĐANG CHIẾU';
    case 'ended':
      return 'ĐÃ KẾT THÚC';
    default:
      return status.toUpperCase();
  }
};

export const getAccountStatusText = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'Hoạt động';
    case 'inactive':
      return 'Ngưng hoạt động';
    case 'banned':
      return 'Bị cấm';
    case 'suspended':
      return 'Tạm khóa';
    default:
      return status;
  }
};

export const getRoleText = (role: string): string => {
  switch (role.toLowerCase()) {
    case 'admin':
      return 'Quản trị viên';
    case 'staff':
      return 'Nhân viên';
    case 'customer':
      return 'Khách hàng';
    case 'manager':
      return 'Quản lý';
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
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Mật khẩu phải có ít nhất 8 ký tự');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất một chữ hoa');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất một chữ thường');
  }
  if (!/\d/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất một số');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất một ký tự đặc biệt');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};


// Loading component
export const LoadingSpinner: React.FC<{
  size?: 'small' | 'medium' | 'large';
  color?: string;
}> = ({ size = 'medium', color = '#e50914' }) => {
  const sizeMap = {
    small: '20px',
    medium: '40px',
    large: '60px'
  };

  return (
    <div 
      className="loading-spinner"
      style={{
        width: sizeMap[size],
        height: sizeMap[size],
        border: `3px solid #f3f3f3`,
        borderTop: `3px solid ${color}`,
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
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
}> = ({ title, description, icon = '📭', action }) => {
  return (
    <div className="empty-state" style={{ textAlign: 'center', padding: '3rem' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{icon}</div>
      <h3 style={{ marginBottom: '0.5rem', color: '#333' }}>{title}</h3>
      {description && (
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>{description}</p>
      )}
      {action}
    </div>
  );
};

// Toast notification utility
export const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
  // This would integrate with your toast library (e.g., react-toastify)
  console.log(`${type.toUpperCase()}: ${message}`);
};

export default {
  // Date utilities
  formatDate,
  formatDateTime,
  formatTime,
  getTimeFromNow,
  
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
  showToast
};
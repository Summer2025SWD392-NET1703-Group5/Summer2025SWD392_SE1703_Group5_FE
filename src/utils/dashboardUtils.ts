// src/utils/dashboardUtils.ts
import { format, parseISO, startOfDay, endOfDay, subDays, isValid } from 'date-fns';
import { vi } from 'date-fns/locale';

/**
 * Dashboard Utilities - Các hàm tiện ích cho dashboard
 */

/**
 * Format tiền tệ VND
 */
export const formatCurrency = (amount: number): string => {
  if (amount === 0) return '0 ₫';

  if (amount >= 1000000000) {
    return `${(amount / 1000000000).toFixed(1)}B ₫`;
  }

  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M ₫`;
  }

  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K ₫`;
  }

  return `${amount.toLocaleString('vi-VN')} ₫`;
};

export const formatCompactCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    notation: 'compact',
  }).format(amount);
};

/**
 * Format số với thousand separators
 */
export const formatNumber = (num: number | undefined | null): string => {
  // Handle undefined/null values
  if (num === undefined || num === null || isNaN(num)) return '0';
  if (num === 0) return '0';

  if (num >= 1000000000) {
    return `${(num / 1000000000).toFixed(1)}B`;
  }

  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }

  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }

  return num.toLocaleString('vi-VN');
};

export const formatCompactNumber = (num: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    notation: 'compact',
  }).format(num);
};

/**
 * Format phần trăm
 */
export const formatPercent = (percent: number): string => {
  return `${percent.toFixed(1)}%`;
};

/**
 * Format ngày tháng
 */
export const formatDate = (date: Date | string | null | undefined): string => {
  try {
    // Handle null/undefined
    if (!date) return 'N/A';

    // Convert string to Date if needed
    let dateObj: Date;
    if (typeof date === 'string') {
      dateObj = new Date(date);
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      return 'Invalid Date';
    }

    // Validate the date
    if (isNaN(dateObj.getTime()) || !isValid(dateObj)) {
      return 'Invalid Date';
    }

    return dateObj.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid Date';
  }
};

/**
 * Format ngày giờ đầy đủ
 */
export const formatDateTime = (date: Date | string | null | undefined): string => {
  try {
    // Handle null/undefined
    if (!date) return 'N/A';

    // Convert string to Date if needed
    let dateObj: Date;
    if (typeof date === 'string') {
      dateObj = new Date(date);
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      return 'Invalid DateTime';
    }

    // Validate the date
    if (isNaN(dateObj.getTime()) || !isValid(dateObj)) {
      return 'Invalid DateTime';
    }

    return dateObj.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('DateTime formatting error:', error);
    return 'Invalid DateTime';
  }
};

export const formatTime = (date: Date | string): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return 'Invalid Time';
    return format(dateObj, 'HH:mm', { locale: vi });
  } catch (error) {
    console.error('Time formatting error:', error);
    return 'Invalid Time';
  }
};

export const formatRelativeDate = (date: Date | string): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return 'Invalid Date';

    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Hôm nay';
    if (diffInDays === 1) return 'Hôm qua';
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} tuần trước`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} tháng trước`;
    return `${Math.floor(diffInDays / 365)} năm trước`;
  } catch (error) {
    console.error('Relative date formatting error:', error);
    return 'Invalid Date';
  }
};

// Date range utilities
export const getDateRange = (days: number) => {
  const endDate = endOfDay(new Date());
  const startDate = startOfDay(subDays(new Date(), days));
  return { startDate, endDate };
};

export const getDateRangeByType = (type: string) => {
  const now = new Date();

  switch (type) {
    case '7days':
      return getDateRange(7);
    case '30days':
      return getDateRange(30);
    case '3months':
      return getDateRange(90);
    case '1year':
      return getDateRange(365);
    default:
      return getDateRange(7);
  }
};

/**
 * Tính tỷ lệ tăng trưởng
 */
export const calculateGrowthRate = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

/**
 * Get màu cho growth rate
 */
export const getGrowthColor = (growth: number): string => {
  if (growth > 0) return 'text-emerald-400';
  if (growth < 0) return 'text-red-400';
  return 'text-slate-400';
};

/**
 * Get icon direction cho growth rate
 */
export const getGrowthDirection = (growth: number): 'up' | 'down' | 'neutral' => {
  if (growth > 0) return 'up';
  if (growth < 0) return 'down';
  return 'neutral';
};

// Status utilities
export const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    // Booking statuses
    confirmed: 'text-green-400',
    pending: 'text-yellow-400',
    cancelled: 'text-red-400',
    used: 'text-blue-400',
    expired: 'text-gray-400',

    // Payment statuses
    paid: 'text-green-400',
    unpaid: 'text-yellow-400',
    refunded: 'text-purple-400',
    failed: 'text-red-400',

    // General statuses
    active: 'text-green-400',
    inactive: 'text-gray-400',
    completed: 'text-blue-400',
    processing: 'text-yellow-400',
  };

  return statusColors[status.toLowerCase()] || 'text-gray-400';
};

export const getStatusBadgeColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    confirmed: 'bg-green-500/20 text-green-400 border-green-500/30',
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
    used: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    expired: 'bg-gray-500/20 text-gray-400 border-gray-500/30',

    paid: 'bg-green-500/20 text-green-400 border-green-500/30',
    unpaid: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    refunded: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    failed: 'bg-red-500/20 text-red-400 border-red-500/30',

    active: 'bg-green-500/20 text-green-400 border-green-500/30',
    inactive: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };

  return statusColors[status.toLowerCase()] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
};

/**
 * Truncate text với ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const capitalizeFirstLetter = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
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

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Mật khẩu phải có ít nhất 8 ký tự');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất 1 chữ hoa');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất 1 chữ thường');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất 1 số');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất 1 ký tự đặc biệt');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// File utilities
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileExtension = (filename: string): string => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

export const isImageFile = (filename: string): boolean => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  const extension = getFileExtension(filename).toLowerCase();
  return imageExtensions.includes(extension);
};

// Utility functions
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

export const generateRandomId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export const generateBookingCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Array utilities
export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce((result, item) => {
    const group = String(item[key]);
    if (!result[group]) {
      result[group] = [];
    }
    result[group].push(item);
    return result;
  }, {} as Record<string, T[]>);
};

export const sortBy = <T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

// Local storage utilities
export const setLocalStorage = (key: string, value: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error setting localStorage:', error);
  }
};

export const getLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error getting localStorage:', error);
    return defaultValue;
  }
};

export const removeLocalStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing localStorage:', error);
  }
};

// Chart utilities
export const generateChartColors = (count: number): string[] => {
  const colors = [
    '#FFD875', '#FFC107', '#FF9800', '#F44336', '#E91E63',
    '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#03DAC6',
    '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107'
  ];

  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(colors[i % colors.length]);
  }

  return result;
};

export const formatChartData = (data: any[], xKey: string, yKey: string) => {
  return data.map(item => ({
    name: item[xKey],
    value: item[yKey],
  }));
};

/**
 * Validate date range
 */
export const validateDateRange = (startDate: Date, endDate: Date): boolean => {
  return startDate <= endDate;
};

/**
 * Get default date range (last 30 days)
 */
export const getDefaultDateRange = (): { startDate: Date; endDate: Date } => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  return { startDate, endDate };
};

/**
 * Format duration (minutes to hours/minutes)
 */
export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes} phút`;
  }

  return `${hours}h ${remainingMinutes}m`;
};

/**
 * Calculate percentage share
 */
export const calculatePercentageShare = (value: number, total: number): number => {
  if (total === 0) return 0;
  return (value / total) * 100;
};

/**
 * Sort array by multiple criteria
 */
export const sortByMultipleCriteria = <T>(
  array: T[],
  criteria: Array<{ key: keyof T; direction: 'asc' | 'desc' }>
): T[] => {
  return [...array].sort((a, b) => {
    for (const criterion of criteria) {
      const aValue = a[criterion.key];
      const bValue = b[criterion.key];

      let comparison = 0;
      if (aValue < bValue) comparison = -1;
      if (aValue > bValue) comparison = 1;

      if (comparison !== 0) {
        return criterion.direction === 'asc' ? comparison : -comparison;
      }
    }
    return 0;
  });
};

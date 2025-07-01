// src/types/user.ts
export type UserStatus = 'active' | 'inactive' | 'banned';
export type UserRole = 'admin' | 'customer' | 'manager' | 'staff';

export interface User {
  id: number;
  fullName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string;
  sex?: 'Male' | 'Female' | 'Other';
  avatar?: string;
  role: string;
  accountStatus?: string;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string;
}

export interface UserFormData {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: Date | null;
  gender: 'male' | 'female' | 'other';
  role: 'admin' | 'staff' | 'customer';
  status: 'active' | 'inactive' | 'banned';
  preferences: {
    language: string;
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    favoriteGenres: string[];
  };
}

/**
 * Giao diện cho dữ liệu cập nhật profile.
 * Các trường đều là tùy chọn.
 */
export interface UpdateProfileData {
  FullName?: string;
  PhoneNumber?: string;
  DateOfBirth?: string; // Format: YYYY-MM-DD
  Sex?: 'Male' | 'Female' | 'Other';
  Address?: string;
}

/**
 * Giao diện cho dữ liệu thay đổi mật khẩu.
 */
export interface ChangePasswordData {
  OldPassword: string;
  NewPassword: string;
  ConfirmNewPassword: string;
}

/**
 * Giao diện cho lịch sử đặt vé.
 */
export interface Booking {
  id: string;
  movieTitle: string;
  moviePoster: string;
  cinemaName: string;
  cinemaAddress: string;
  date: string;
  time: string;
  seats: string[];
  totalPrice: number;
  status: 'confirmed' | 'cancelled' | 'completed';
  bookingDate: string;
}

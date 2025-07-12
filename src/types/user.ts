// src/types/user.ts
export type UserStatus = 'Active' | 'Inactive' | 'Pending_Verification' | 'Deleted';
export type UserRole = 'Customer' | 'Staff' | 'Admin' | 'Manager';

export interface User {
  id: number;
  fullName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string;
  sex?: 'Male' | 'Female' | 'Other';
  avatar?: string;
  role: 'Customer' | 'Staff' | 'Admin' | 'Manager';
  accountStatus?: 'Active' | 'Inactive' | 'Pending_Verification' | 'Deleted';
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string;
  
  // Snake_case API response properties
  User_ID?: number;
  Full_Name?: string;
  Phone_Number?: string;
  Date_Of_Birth?: string;
  Sex?: 'Male' | 'Female' | 'Other';
  Address?: string;
  Account_Status?: 'Active' | 'Inactive' | 'Pending_Verification' | 'Deleted';
  Cinema_ID?: number;
  Cinema_Name?: string;
  
  // Additional backwards compatibility properties
  total_points?: number; // For customer points
  username?: string; // Legacy username field
  firstName?: string; // Legacy firstName field
  lastName?: string; // Legacy lastName field
  phone?: string; // Alternative phone field
  gender?: 'Male' | 'Female' | 'Other'; // Alternative gender field
  status?: string; // Alternative status field
  Name?: string; // Alternative name field
  preferences?: {
    language: string;
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    favoriteGenres: string[];
  };
}

export interface UserFormData {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: Date | null;
  gender: 'Male' | 'Female' | 'Other';
  role: UserRole;
  status: UserStatus;
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

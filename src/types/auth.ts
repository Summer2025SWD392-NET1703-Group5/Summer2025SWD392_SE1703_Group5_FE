// types/auth.ts
/**
 * Giao diện cho đối tượng người dùng, dựa trên response từ API.
 */
export interface User {
  id: number; // User_ID từ backend
  fullName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string;
  sex?: 'Male' | 'Female' | 'Other';
  avatar?: string;
  role: 'Customer' | 'Staff' | 'Admin' | 'Manager';
  accountStatus: 'Active' | 'Inactive' | 'Pending_Verification' | 'Deleted';
}

/**
 * Giao diện cho dữ liệu đăng nhập.
 */
export type LoginCredentials = {
  Email: string; // Backend yêu cầu 'Email' viết hoa
  Password: string;
};

/**
 * Giao diện cho dữ liệu đăng ký, dựa trên yêu cầu của API.
 */
export interface RegisterData {
  FullName: string;
  Email: string;
  Password: string;
  ConfirmPassword: string;
  PhoneNumber: string;
  DateOfBirth: string; // Format: YYYY-MM-DD
  Sex: 'Male' | 'Female' | 'Other';
  Address?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  token: string | null;
}

export interface PasswordResetData {
  email: string;
  otp?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export interface ValidationErrors {
  [key: string]: string;
}

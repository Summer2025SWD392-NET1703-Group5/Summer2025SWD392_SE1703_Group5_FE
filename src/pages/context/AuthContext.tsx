import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../../config/axios";
import { toast } from "react-toastify";

interface User {
  userId: string;
  fullName?: string;
  email?: string;
  role?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth phải được sử dụng trong AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const fullName = localStorage.getItem("fullName");
    const email = localStorage.getItem("email");
    const role = localStorage.getItem("role");

    if (token && userId) {
      return {
        user: { userId, fullName, email, role },
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    }

    return {
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    };
  });

  const login = async (email: string, password: string) => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await api.post("/auth/login", {
        Email: email,
        Password: password,
      });
      const { token, user, role } = response.data; // Lấy role từ response.data

      console.log("Phản hồi API:", response.data);

      if (!token || !user?.userId) {
        throw new Error("Token hoặc userId không hợp lệ");
      }

      const userId = user.userId.toString();
      const fullName = user.fullName || ""; // Sử dụng fullName từ API nếu có
      const userEmail = user.email || email; // Sử dụng email từ API nếu có, nếu không thì lấy từ form
      const userRole = user.role || ""; // Sử dụng role từ API

      // Lưu các giá trị vào localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("userId", userId);
      localStorage.setItem("fullName", fullName);
      localStorage.setItem("email", userEmail);
      localStorage.setItem("role", userRole);

      setAuthState({
        user: { userId, fullName, email: userEmail, role: userRole },
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      toast.success("Đăng nhập thành công!");
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Đăng nhập thất bại. Vui lòng kiểm tra email hoặc mật khẩu.";
      setAuthState((prev) => ({ ...prev, isLoading: false, error: message }));
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.clear();
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
    toast.info("Đăng xuất thành công.");
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../../config/axios";
import { toast } from "react-toastify";

interface User {
  userId: string;
  fullName: string;
  email: string;
  role: string;
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
    throw new Error("useAuth must be used within an AuthProvider");
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

    if (token && userId && fullName && email && role) {
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
      const response = await api.post("/Auth/login", { email, password });
      const {
        token,
        userId,
        fullName,
        email: userEmail,
        tokenExpiration,
        role,
      } = response.data;

      console.log("API response:", response.data);

      if (!token) {
        throw new Error("Token không hợp lệ");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("userId", userId.toString());
      localStorage.setItem("fullName", fullName);
      localStorage.setItem("email", userEmail);
      localStorage.setItem("tokenExpiration", tokenExpiration);
      localStorage.setItem("role", role);

      setAuthState({
        user: { userId: userId.toString(), fullName, email: userEmail, role },
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

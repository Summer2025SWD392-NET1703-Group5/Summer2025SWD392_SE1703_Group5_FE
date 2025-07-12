// components/StaffProtectedRoute.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';

interface StaffProtectedRouteProps {
  children: React.ReactElement;
  requireCinemaAssignment?: boolean;
}

/**
 * Component `StaffProtectedRoute` dùng để bảo vệ các route dành riêng cho nhân viên.
 * - Kiểm tra role Staff
 * - Kiểm tra phân công rạp nếu requireCinemaAssignment = true
 * - Hiển thị thông báo và chuyển hướng nếu không đủ điều kiện
 *
 * @param {StaffProtectedRouteProps} props - Props cho component
 * @returns {React.ReactElement} - Render children hoặc Navigate component
 */
export const StaffProtectedRoute = ({ 
  children, 
  requireCinemaAssignment = true 
}: StaffProtectedRouteProps): React.ReactElement => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Đang tải
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Chưa đăng nhập
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Không phải staff
  if (user?.role !== 'Staff') {
    toast.error('Bạn không có quyền truy cập trang này');
    return <Navigate to="/" replace />;
  }

  // Staff nhưng chưa được phân công rạp
  if (requireCinemaAssignment && !user?.cinemaId) {
    toast.error('Bạn chưa được phân công làm việc tại rạp nào. Vui lòng liên hệ Quản lý hoặc Admin để được phân công.');
    return <Navigate to="/profile/settings" replace />;
  }

  // Đủ điều kiện truy cập
  return children;
};

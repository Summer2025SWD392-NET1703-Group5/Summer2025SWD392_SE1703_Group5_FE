import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/SimpleAuthContext';

interface RoleGuardProps {
  children: React.ReactElement;
  allowedRoles: string[];
  redirectTo?: string;
  requireAuth?: boolean;
}

/**
 * Component bảo vệ routes dựa trên role của user
 * @param children - Component con cần render
 * @param allowedRoles - Danh sách roles được phép truy cập
 * @param redirectTo - Đường dẫn redirect khi không có quyền (mặc định: /login)
 * @param requireAuth - Có yêu cầu đăng nhập hay không (mặc định: true)
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  redirectTo = '/login',
  requireAuth = true
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Đang loading, hiển thị loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-lg">Đang tải...</div>
      </div>
    );
  }

  // Nếu yêu cầu đăng nhập mà chưa đăng nhập
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Nếu đã đăng nhập, kiểm tra role
  if (isAuthenticated && user) {
    // Nếu user có role trong danh sách cho phép
    if (allowedRoles.includes(user.role)) {
      return children;
    }
    
    // Nếu user là admin/manager nhưng không trong allowedRoles, redirect về admin
    if (['Admin', 'Manager'].includes(user.role) && !allowedRoles.includes(user.role)) {
      return <Navigate to="/admin/dashboard" replace />;
    }
    
    // Các trường hợp khác - không có quyền truy cập
    return <Navigate to="/" replace />;
  }

  // Trường hợp không yêu cầu đăng nhập (guest allowed)
  if (!requireAuth) {
    return children;
  }

  // Fallback redirect
  return <Navigate to={redirectTo} state={{ from: location }} replace />;
};

export default RoleGuard; 
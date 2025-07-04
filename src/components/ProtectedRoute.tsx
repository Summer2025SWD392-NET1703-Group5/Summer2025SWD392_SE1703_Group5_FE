// components/ProtectedRoute.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactElement;
}

/**
 * Component `ProtectedRoute` dùng để bảo vệ các route yêu cầu xác thực.
 * - Nếu người dùng đã xác thực, nó sẽ render `children`.
 * - Nếu người dùng chưa xác thực, nó sẽ chuyển hướng họ đến trang đăng nhập.
 * - Nó cũng lưu lại vị trí mà người dùng đang cố gắng truy cập để có thể
 *   chuyển hướng họ trở lại đó sau khi đăng nhập thành công.
 *
 * @param {ProtectedRouteProps} props - Props cho component, chứa `children` cần render.
 * @returns {React.ReactElement} - Render `children` hoặc component `Navigate`.
 */
export const ProtectedRoute = ({ children }: ProtectedRouteProps): React.ReactElement => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Trong khi đang kiểm tra trạng thái xác thực, không render gì cả
  // hoặc có thể hiển thị một spinner toàn trang.
  if (isLoading) {
    return <div>Loading...</div>; // Hoặc một component Spinner đẹp hơn
  }

  // Nếu đã xác thực, cho phép truy cập route
  if (isAuthenticated) {
    return children;
  }

  // Nếu chưa xác thực, chuyển hướng về trang đăng nhập
  // state={{ from: location }} giúp ta có thể quay lại trang trước đó sau khi login
  return <Navigate to="/login" state={{ from: location }} replace />;
};

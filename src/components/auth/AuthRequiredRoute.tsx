import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/SimpleAuthContext';

interface AuthRequiredRouteProps {
    children: React.ReactElement;
    allowAdminAccess?: boolean; // Có cho phép admin/manager truy cập không
}

/**
 * Component yêu cầu đăng nhập bắt buộc
 * Tự động redirect admin/manager về admin dashboard (trừ khi allowAdminAccess = true)
 */
export const AuthRequiredRoute: React.FC<AuthRequiredRouteProps> = ({
    children,
    allowAdminAccess = false
}) => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    // Đang loading
    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-white text-lg">Đang tải...</div>
            </div>
        );
    }

    // Chưa đăng nhập - redirect về login
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Nếu user là admin/manager và không được phép truy cập
    if (user && ['Admin', 'Manager'].includes(user.role) && !allowAdminAccess) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    // Đã đăng nhập và có quyền truy cập
    return children;
};

export default AuthRequiredRoute; 
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/SimpleAuthContext';
import { toast } from 'react-hot-toast';

interface AuthRequiredRouteProps {
    children: React.ReactElement;
    allowAdminAccess?: boolean; // Có cho phép admin/manager truy cập không
    requireCinemaAssignment?: boolean; // Có yêu cầu staff phải được phân công rạp không
}

/**
 * Component yêu cầu đăng nhập bắt buộc
 * Tự động redirect admin/manager về admin dashboard (trừ khi allowAdminAccess = true)
 * Kiểm tra phân công rạp cho staff (nếu requireCinemaAssignment = true)
 */
export const AuthRequiredRoute: React.FC<AuthRequiredRouteProps> = ({
    children,
    allowAdminAccess = false,
    requireCinemaAssignment = false
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

    // Kiểm tra phân công rạp cho staff (nếu requireCinemaAssignment = true)
    // Chỉ áp dụng cho staff, các role khác (Customer, Admin, Manager) được phép truy cập tự do
    // Đợi user data được load hoàn tất trước khi kiểm tra
    if (requireCinemaAssignment && user && user.role === 'Staff' && !user.cinemaId) {
        console.log("[AuthRequiredRoute] Blocking unassigned staff access:", user);
        toast.error('Bạn chưa được phân công làm việc tại rạp nào. Vui lòng liên hệ Quản lý hoặc Admin để được phân công.');
        return <Navigate to="/profile/settings" replace />;
    }

    // Đã đăng nhập và có quyền truy cập
    return children;
};

export default AuthRequiredRoute; 
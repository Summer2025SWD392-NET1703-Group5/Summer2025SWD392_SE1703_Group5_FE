import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/SimpleAuthContext';

interface StaffRouteProps {
    children: React.ReactElement;
}

// Danh sách các trang Staff được phép truy cập
const ALLOWED_STAFF_PATHS = [
    '/showtimes',
    '/booking',
    '/payment',
    '/booking-success',
    '/staff/scanner',
    '/profile',
    '/profile/security'
];

/**
 * Component giới hạn truy cập cho Staff
 * Staff chỉ được phép truy cập: showtimes, booking, payment và profile cơ bản
 */
export const StaffRoute: React.FC<StaffRouteProps> = ({ children }) => {
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

    // Không phải Staff - redirect về dashboard tương ứng
    if (user && user.role !== 'Staff') {
        if (['Admin', 'Manager'].includes(user.role)) {
            return <Navigate to="/admin/dashboard" replace />;
        } else {
            return <Navigate to="/" replace />;
        }
    }

    // Kiểm tra xem Staff có được phép truy cập trang này không
    const currentPath = location.pathname;
    const isAllowedPath = ALLOWED_STAFF_PATHS.some(path => 
        currentPath === path || 
        currentPath.startsWith(path + '/') ||
        (path === '/booking' && currentPath.match(/^\/booking\/\d+/)) ||
        (path === '/payment' && currentPath.match(/^\/payment\/\d+/)) ||
        (path === '/booking-success' && currentPath.match(/^\/booking-success\/\d+/))
    );

    // Nếu không được phép truy cập, redirect về showtimes
    if (!isAllowedPath) {
        return <Navigate to="/showtimes" replace />;
    }

    // Cho phép truy cập
    return children;
};

export default StaffRoute; 
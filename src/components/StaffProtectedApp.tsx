import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/SimpleAuthContext';

interface StaffProtectedAppProps {
    children: React.ReactNode;
}

// Danh sách các trang Staff được phép truy cập
const ALLOWED_STAFF_PATHS = [
    '/showtimes',
    '/booking',
    '/payment',
    '/booking-success',
    '/staff/scanner',
    '/profile',
    '/profile/security',
    '/login',
    '/logout'
];

/**
 * Component để bảo vệ ứng dụng khỏi Staff truy cập các trang không được phép
 */
export const StaffProtectedApp: React.FC<StaffProtectedAppProps> = ({ children }) => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    // Nếu đang loading hoặc chưa đăng nhập, cho phép truy cập bình thường
    if (isLoading || !isAuthenticated || !user) {
        return <>{children}</>;
    }

    // Nếu không phải Staff, cho phép truy cập bình thường
    if (user.role !== 'Staff') {
        return <>{children}</>;
    }

    // Kiểm tra xem Staff có được phép truy cập trang hiện tại không
    const currentPath = location.pathname;
    const isAllowedPath = ALLOWED_STAFF_PATHS.some(path => {
        if (path === currentPath) return true;
        if (currentPath.startsWith(path + '/')) return true;
        
        // Các pattern đặc biệt cho booking flow
        if (path === '/booking' && currentPath.match(/^\/booking\/\d+/)) return true;
        if (path === '/payment' && currentPath.match(/^\/payment\/\d+/)) return true;
        if (path === '/booking-success' && currentPath.match(/^\/booking-success\/\d+/)) return true;
        
        return false;
    });

    // Nếu Staff cố truy cập trang không được phép, redirect về showtimes
    if (!isAllowedPath) {
        return <Navigate to="/showtimes" replace />;
    }

    // Cho phép truy cập
    return <>{children}</>;
};

export default StaffProtectedApp; 
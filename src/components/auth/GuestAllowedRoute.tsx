import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/SimpleAuthContext';

interface GuestAllowedRouteProps {
    children: React.ReactElement;
}

/**
 * Component cho phép guest truy cập trang
 * Nhưng redirect admin/manager về admin dashboard
 */
export const GuestAllowedRoute: React.FC<GuestAllowedRouteProps> = ({ children }) => {
    const { user, isAuthenticated, isLoading } = useAuth();

    // Đang loading
    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-white text-lg">Đang tải...</div>
            </div>
        );
    }

    // Nếu user là admin hoặc manager, redirect về admin dashboard
    if (isAuthenticated && user && ['Admin', 'Manager'].includes(user.role)) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    // Cho phép guest và customer truy cập
    return children;
};

export default GuestAllowedRoute; 
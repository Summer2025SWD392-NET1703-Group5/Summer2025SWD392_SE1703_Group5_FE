import React, { useMemo, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/SimpleAuthContext';

interface AdminRouteProps {
    children: React.ReactElement;
}

/**
 * Component chỉ cho phép Admin và Manager truy cập
 */
export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const location = useLocation();
    const lastLoggedState = useRef<string>('');

    // Memoize để tránh tính toán lại không cần thiết
    const authState = useMemo(() => {
        const currentState = `${isLoading}-${isAuthenticated}-${user?.role || 'none'}-${location.pathname}`;
        
        // Chỉ log khi state thay đổi
        if (currentState !== lastLoggedState.current) {
            console.log('[AdminRoute] State changed:', {
                isLoading,
                isAuthenticated, 
                userRole: user?.role || null,
                currentPath: location.pathname
            });
            lastLoggedState.current = currentState;
        }

        return { isLoading, isAuthenticated, user };
    }, [isLoading, isAuthenticated, user, location.pathname]);

    // Đang loading
    if (authState.isLoading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-white text-lg">Đang tải...</div>
            </div>
        );
    }

    // Chưa đăng nhập - redirect về login
    if (!authState.isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Đã đăng nhập nhưng không phải admin/manager
    if (authState.user && !['Admin', 'Manager'].includes(authState.user.role)) {
        return <Navigate to="/" replace />;
    }

    // Admin hoặc Manager - cho phép truy cập
    return children;
};

export default AdminRoute; 
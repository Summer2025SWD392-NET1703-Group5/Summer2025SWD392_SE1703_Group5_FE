import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/SimpleAuthContext';
import toast from 'react-hot-toast';

interface AdminOnlyRouteProps {
    children: React.ReactNode;
    redirectTo?: string;
}

const AdminOnlyRoute: React.FC<AdminOnlyRouteProps> = ({
    children,
    redirectTo = '/admin/dashboard'
}) => {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user && user.role !== 'Admin') {
            toast.error('Bạn không có quyền truy cập trang này');
            navigate(redirectTo, { replace: true });
        }
    }, [user, navigate, redirectTo]);

    // Chỉ render children nếu user là Admin
    if (!user || user.role !== 'Admin') {
        return null;
    }

    return <>{children}</>;
};

export default AdminOnlyRoute; 
import React, { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './SimpleAuthContext';

interface PermissionContextType {
    isManager: boolean;
    canEdit: boolean; // Có thể thực hiện các hành động (thêm/sửa/xóa)
    canView: boolean;   // Có thể xem
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export const PermissionProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const location = useLocation();

    const isManager = user?.role === 'Manager';

    // Manager có quyền edit trên trang quản lý lịch chiếu và phòng chiếu
    const canEdit = useMemo(() => {
        if (!user) return false;
        if (user.role === 'Admin') return true;
        if (user.role === 'Manager') {
            return location.pathname.startsWith('/admin/showtimes') || location.pathname.startsWith('/admin/cinema-rooms');
        }
        return false;
    }, [user, location.pathname]);

    const canView = useMemo(() => {
        if (!user) return false;
        return user.role === 'Admin' || user.role === 'Manager';
    }, [user]);

    const value = {
        isManager,
        canEdit,
        canView
    };

    return (
        <PermissionContext.Provider value={value}>
            {children}
        </PermissionContext.Provider>
    );
};

export const usePermissions = (): PermissionContextType => {
    const context = useContext(PermissionContext);
    if (context === undefined) {
        throw new Error('usePermissions must be used within a PermissionProvider');
    }
    return context;
};

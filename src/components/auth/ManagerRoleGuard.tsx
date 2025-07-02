import React, { ReactElement } from 'react';
import { useAuth } from '../../contexts/SimpleAuthContext';
import { useLocation } from 'react-router-dom';

interface ManagerRoleGuardProps {
    children: ReactElement;
    allowEdit?: boolean; // Cho phép thao tác sửa/xóa/thêm hay chỉ xem
}

/**
 * Component kiểm soát quyền của Manager
 * - Manager chỉ được phép thao tác đầy đủ trong các trang quản lý lịch chiếu và phòng chiếu
 * - Ở các trang khác, Manager chỉ được xem, không được thao tác (thêm/sửa/xóa)
 */
export const ManagerRoleGuard: React.FC<ManagerRoleGuardProps> = ({ children, allowEdit = false }) => {
    const { user } = useAuth();
    const location = useLocation();

    // Nếu không phải Manager, cho phép truy cập bình thường (Admin hoặc các role khác)
    if (!user || user.role !== 'Manager') {
        return children;
    }

    // Kiểm tra xem có phải đang ở trang quản lý lịch chiếu hoặc phòng chiếu không
    const isShowtimeOrRoomPage =
        location.pathname.includes('/admin/showtimes') ||
        location.pathname.includes('/admin/cinema-rooms');

    // Nếu đang ở trang quản lý lịch chiếu hoặc phòng chiếu, cho phép thao tác đầy đủ
    if (isShowtimeOrRoomPage) {
        return children;
    }

    // Ở các trang khác, chỉ cho phép xem nếu allowEdit = false
    if (!allowEdit) {
        // Trả về children nhưng vô hiệu hóa các nút thêm/sửa/xóa
        return React.cloneElement(children, {
            readOnly: true,
            disableActions: true,
            className: `${children.props.className || ''} manager-readonly`
        });
    }

    // Nếu allowEdit = true (hiếm khi xảy ra), cho phép thao tác
    return children;
};

export default ManagerRoleGuard; 
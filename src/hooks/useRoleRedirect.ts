import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/SimpleAuthContext';

/**
 * Hook để xử lý redirect dựa trên role của user
 */
export const useRoleRedirect = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Chỉ redirect khi đã đăng nhập và có user
    if (isAuthenticated && user) {
      // Redirect admin/manager về dashboard khi họ cố truy cập trang customer
      if (['Admin', 'Manager'].includes(user.role)) {
        const currentPath = window.location.pathname;
        
        // Danh sách các trang mà admin/manager không nên truy cập
        const customerOnlyPaths = [
          '/login',
          '/register', 
          '/forgot-password',
          '/seat-selection',
          '/booking',
          '/payment'
        ];

        // Kiểm tra nếu đang ở trang customer-only
        const shouldRedirect = customerOnlyPaths.some(path => 
          currentPath.startsWith(path)
        );

        if (shouldRedirect) {
          navigate('/admin/dashboard', { replace: true });
        }
      }
    }
  }, [user, isAuthenticated, navigate]);

  return {
    isAdmin: user && ['Admin', 'Manager'].includes(user.role),
    isCustomer: user && user.role === 'Customer',
    isStaff: user && user.role === 'Staff',
    userRole: user?.role
  };
};

export default useRoleRedirect; 
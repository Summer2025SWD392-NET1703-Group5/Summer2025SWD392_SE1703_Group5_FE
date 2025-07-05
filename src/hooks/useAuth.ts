import { useContext } from 'react';
import { AuthContext, type AuthContextType } from '../contexts/SimpleAuthContext';

/**
 * Custom hook để truy cập AuthContext một cách an toàn.
 * Cung cấp một cách ngắn gọn để lấy trạng thái và các hàm xác thực.
 * @returns {AuthContextType} - Giá trị của AuthContext.
 * @throws {Error} - Ném lỗi nếu hook được sử dụng bên ngoài AuthProvider.
 */
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within a SimpleAuthProvider');
    }
    return context;
}; 
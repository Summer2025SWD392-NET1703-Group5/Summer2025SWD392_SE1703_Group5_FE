import axios, {
    AxiosError,
    type InternalAxiosRequestConfig,
    type AxiosResponse,
} from 'axios';
import axiosRetry from 'axios-retry';
import { handleApiError } from '../utils/errorHandler';




// --- Biến môi trường ---
// Sử dụng Vite's import.meta.env để truy cập biến môi trường
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '30000', 10);




// --- Quản lý Token từ localStorage ---
const getAccessToken = () => localStorage.getItem('accessToken');
const getRefreshToken = () => localStorage.getItem('refreshToken');




/**
 * Cập nhật token trong localStorage.
 * Được gọi sau khi đăng nhập thành công hoặc refresh token.
 * @param accessToken
 * @param refreshToken (Optional)
 */
export const setAuthTokens = (accessToken: string, refreshToken?: string | null) => {
    if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
    }
    if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
    } else {
        // Nếu không có refreshToken, hãy xóa nó khỏi localStorage để tránh lỗi
        localStorage.removeItem('refreshToken');
    }
};




/**
 * Xóa token khỏi localStorage.
 * Được gọi khi logout hoặc refresh token thất bại.
 */
export const clearAuthTokens = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
};




/**
 * Tạo instance của Axios với các cấu hình mặc định.
 * - Base URL: Lấy từ biến môi trường.
 * - Timeout: Cấu hình thời gian chờ cho request.
 * - Headers: Cấu hình header mặc định.
 */
const api = axios.create({
    baseURL: BASE_URL,
    timeout: TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
});




// --- Interceptor cho Request ---
/**
 * Interceptor này sẽ được thực thi trước mỗi request.
 * Nó sẽ tự động đính kèm Access Token vào header `Authorization`.
 */
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => {
        // Xử lý lỗi khi thiết lập request
        return Promise.reject(error);
    }
);




// --- Interceptor cho Response ---
/**
 * Interceptor này xử lý các response trả về.
 * - Thành công: Trả về dữ liệu.
 * - Thất bại:
 *   - Lỗi 401 (Unauthorized): Xóa token và logout người dùng.
 *   - Các lỗi khác: Chuyển cho `handleApiError` xử lý.
 */
api.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
        // Nếu là lỗi 401, xóa token và trigger logout
        if (error.response?.status === 401) {
            clearAuthTokens();
            // Trigger một sự kiện để AuthContext có thể lắng nghe và cập nhật state
            window.dispatchEvent(new Event('storage'));
        }




        // Sau khi xử lý (hoặc không xử lý), ném lỗi cho `handleApiError` để chuẩn hóa và hiển thị
        return handleApiError(error);
    }
);




// --- Cấu hình Retry Mechanism ---
/**
 * Sử dụng `axios-retry` để tự động thử lại các request thất bại (vd: lỗi mạng).
 * - Retries: Số lần thử lại.
 * - Retry Delay: Thời gian chờ giữa các lần thử lại, tăng dần.
 * - Retry Condition: Điều kiện để thực hiện retry (chỉ retry khi có lỗi mạng hoặc lỗi server 5xx).
 */
axiosRetry(api, {
    retries: 0, // Số lần thử lại
    retryDelay: (retryCount: number) => {
        return retryCount * 1000; // 1s, 2s, 3s
    },
    retryCondition: (error: AxiosError) => {
        // Chỉ retry với lỗi mạng hoặc lỗi server (5xx), không retry lỗi client (4xx) ngoại trừ 408 và 429
        return (
            axiosRetry.isNetworkOrIdempotentRequestError(error) ||
            (error.response?.status !== undefined && error.response.status >= 500)
        );
    },
});




export default api;






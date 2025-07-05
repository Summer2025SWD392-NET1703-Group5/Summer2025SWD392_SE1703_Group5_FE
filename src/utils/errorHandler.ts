import { AxiosError } from 'axios';
import { toast } from 'react-hot-toast';

/**
 * Kiểu dữ liệu cho lỗi API chuẩn
 */
interface ApiError {
    message: string;
    code?: string;
    details?: any;
}

/**
 * Xử lý lỗi từ API và hiển thị thông báo phù hợp
 * @param error Lỗi từ Axios
 * @returns Promise bị reject với lỗi đã được xử lý
 */
export const handleApiError = (error: AxiosError): Promise<never> => {
    // Mặc định message
    let errorMessage = 'Đã xảy ra lỗi khi kết nối đến máy chủ';
    let statusCode = error.response?.status || 0;
    let errorDetail = '';

    // Log chi tiết lỗi
    console.log('API Error:', error);

    try {
        // Xử lý dựa trên status code
        if (error.response) {
            statusCode = error.response.status;

            switch (statusCode) {
                case 400:
                    errorMessage = 'Yêu cầu không hợp lệ';
                    errorDetail = getErrorDetail(error);
                    break;
                case 401:
                    errorMessage = 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại';
                    // Có thể thêm logic để redirect đến trang login
                    break;
                case 403:
                    errorMessage = 'Bạn không có quyền thực hiện thao tác này';
                    console.log('Forbidden access error:', error.response.data);
                    break;
                case 404:
                    const url = error.config?.url || '';
                    errorMessage = `Đường dẫn ${error.config?.method?.toUpperCase() || 'GET'} ${url} không tồn tại trên server.`;
                    break;
                case 422:
                    errorMessage = 'Dữ liệu không hợp lệ';
                    errorDetail = getErrorDetail(error);
                    break;
                case 500:
                    errorMessage = 'Lỗi máy chủ, vui lòng thử lại sau';
                    console.log('Server error:', error.response.data);
                    break;
                default:
                    errorMessage = `Lỗi ${statusCode}: ${error.message}`;
                    break;
            }
        } else if (error.request) {
            // Lỗi không nhận được response
            errorMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau.';
            console.log('Network error - no response received:', error.request);

            // Không hiển thị toast cho lỗi mạng khi đang thử nhiều endpoint
            if (error.config?.url?.includes('/movies') || error.config?.url?.includes('/movie')) {
                return Promise.reject(error);
            }
        } else {
            // Lỗi khác
            errorMessage = `Lỗi không xác định: ${error.message}`;
        }

        // Không hiển thị toast error nữa - chỉ xử lý im lặng

    } catch (e) {
        console.error('Error in error handler:', e);
        toast.error('Đã xảy ra lỗi không xác định');
    }

    // Reject promise với error ban đầu để có thể xử lý tiếp ở các component
    return Promise.reject(error);
};

/**
 * Trích xuất chi tiết lỗi từ response
 */
const getErrorDetail = (error: AxiosError): string => {
    try {
        const responseData = error.response?.data as any;

        // Kiểm tra các định dạng lỗi phổ biến
        if (typeof responseData === 'string') {
            return responseData;
        }

        if (responseData?.message) {
            return responseData.message;
        }

        if (responseData?.error) {
            return typeof responseData.error === 'string'
                ? responseData.error
                : JSON.stringify(responseData.error);
        }

        if (responseData?.errors) {
            if (Array.isArray(responseData.errors)) {
                return responseData.errors.join(', ');
            } else if (typeof responseData.errors === 'object') {
                return Object.values(responseData.errors).flat().join(', ');
            }
        }

        return JSON.stringify(responseData);
    } catch (e) {
        return 'Không thể xác định chi tiết lỗi';
    }
};

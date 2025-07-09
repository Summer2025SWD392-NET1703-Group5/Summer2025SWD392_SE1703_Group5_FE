import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';

// Cờ DEBUG - có thể thay đổi hoặc ghi đè bởi biến môi trường
const DEBUG = process.env.NODE_ENV === 'development';

// Đơn giản hóa cơ chế request deduplication
const pendingRequests = new Map();

function getRequestKey(config: AxiosRequestConfig): string {
  const { method = 'get', url = '', params = {} } = config;
  return `${method}_${url}_${JSON.stringify(params || {})}`;
}

// Không sử dụng cache để đảm bảo dữ liệu luôn được load từ server

// Tạo instance axios với cấu hình mặc định
const apiClient = axios.create({
    baseURL: 'http://localhost:3000/api',
    headers: {
        'Content-Type': 'application/json',
    },
    // Thêm transformRequest để xử lý dữ liệu trước khi gửi đi
    transformRequest: [
        (data, _headers) => {
            // Nếu data là object và không phải FormData, chuyển đổi để tránh circular structure
            if (data && typeof data === 'object' && !(data instanceof FormData)) {
                try {
                    return safeStringify(data);
                } catch (error) {
                    console.error('Error transforming request data:', error);
                    return JSON.stringify(data);
                }
            }
            return data;
        },
        ...axios.defaults.transformRequest as any[]
    ],
    timeout: 30000,
});

// Thêm interceptor để áp dụng request deduplication
apiClient.interceptors.request.use(
    async (config) => {
        try {
            // Thêm token vào header nếu có
            const token = localStorage.getItem('accessToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            // Chỉ log khi ở chế độ DEBUG
            if (DEBUG) {
                const url = `${config.baseURL || ''}${config.url || ''}`;
                console.log(`API Request: ${config.method?.toUpperCase()} ${url}`);
            }

            // Chỉ thực hiện deduplication cho các request GET
            if (config.method?.toLowerCase() === 'get' && config.url) {
                const key = getRequestKey(config);
                
                // Nếu đã có request tương tự đang thực hiện, cancel request hiện tại
                if (pendingRequests.has(key)) {
                    if (DEBUG) console.log(`[RequestDeduplication] Skipping duplicate request: ${key}`);
                    
                    // Đánh dấu request này là đã bị hủy
                    config.cancelToken = new axios.CancelToken(cancel => {
                        cancel(`Duplicate request canceled: ${key}`);
                    });
                }
            }
        } catch (error) {
            if (DEBUG) console.error('Error in request interceptor:', error);
        }

        return config;
    }, 
    (error) => {
        return Promise.reject(error);
    }
);

// Xử lý response để quản lý các pending request
apiClient.interceptors.response.use(
    (response) => {
        // Chỉ log khi ở chế độ DEBUG
        if (DEBUG) {
            const url = response.config.url || '';
            console.log(`API Response (${url}): ${response.status}`);
        }
        
        // Xóa request khỏi danh sách pending
        const key = getRequestKey(response.config);
        pendingRequests.delete(key);
        
        return response;
    },
    (error) => {
        try {
            // Nếu request bị hủy vì trùng lặp, không hiển thị lỗi
            if (axios.isCancel(error)) {
                if (DEBUG) console.log(error.message);
                return new Promise(() => {}); // Trả về promise không bao giờ resolve/reject
            }
            
            // Xóa request khỏi danh sách pending nếu có lỗi
            if (error.config) {
                const key = getRequestKey(error.config);
                pendingRequests.delete(key);
            }
            
            // Nhóm log lỗi vào một object để giảm lượng log
            if (DEBUG) {
                const errorInfo = {
                    message: '',
                    status: '',
                    details: {}
                };

                if (error.response) {
                    // Lỗi từ server với response
                    errorInfo.message = error.response.data?.message || error.message;
                    errorInfo.status = error.response.status;
                    
                    // Lấy thông tin lỗi chi tiết
                    if (error.response.data && typeof error.response.data === 'object') {
                        const { message, code, error: errorType } = error.response.data;
                        errorInfo.details = { message, code, errorType };
                    }
                    
                    // Chỉ log một lần với đầy đủ thông tin
                    console.error('API Error:', errorInfo);
                } else if (error.request) {
                    // Yêu cầu được gửi nhưng không nhận được phản hồi
                    console.error('API Request Error: No response received', {
                        url: error.config?.url,
                        method: error.config?.method
                    });
                } else {
                    // Lỗi khi thiết lập request
                    console.error('API Setup Error:', error.message);
                }
            }

            // Thêm thông tin lỗi vào đối tượng error để component có thể sử dụng
            if (error.response && error.response.data) {
                error.message = error.response.data.message || error.message;
                error.apiError = error.response.data;
            }
        } catch (loggingError) {
            if (DEBUG) console.error('Error in error handling:', loggingError);
        }

        return Promise.reject(error);
    }
);

// Hàm xử lý dữ liệu trước khi gửi để tránh lỗi circular structure
const safeStringify = (obj: any) => {
    // Danh sách các thuộc tính thường gây lỗi circular reference
    const circularProps = ['parent', 'include', '_previousDataValues', '_model', 'dataValues', 'sequelize', 'options', 'attributes'];


    const seen = new WeakSet();
    return JSON.stringify(obj, (key, value) => {
        // Bỏ qua các thuộc tính có thể gây lỗi circular reference
        if (circularProps.includes(key)) {
            return '[Circular]';
        }


        // Xử lý các thuộc tính bắt đầu bằng '_' (thường là thuộc tính private của ORM)
        if (key.startsWith('_') && typeof value === 'object' && value !== null) {
            return '[Object]';
        }


        // Xử lý các đối tượng phức tạp
        if (typeof value === 'object' && value !== null) {
            // Kiểm tra nếu đối tượng đã được xử lý trước đó
            if (seen.has(value)) {
                return '[Circular]';
            }
            seen.add(value);


            // Xử lý đặc biệt cho các đối tượng từ Sequelize
            if (value.constructor && value.constructor.name &&
                (value.constructor.name.includes('Model') ||
                    value.constructor.name.includes('Sequelize'))) {
                return '[SequelizeModel]';
            }
        }
        return value;
    });
};

export default apiClient;


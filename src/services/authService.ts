// services/authService.ts
import api, { setAuthTokens, clearAuthTokens } from '../config/api';
import type { User, LoginCredentials, RegisterData } from '../types/auth';


// Cần đảm bảo API response có cấu trúc này
interface AuthResponse {
  user: User;
  token: string;
}


class AuthService {
  /**
   * Đăng nhập người dùng và lưu token.
   * @param credentials Email và password
   * @returns Thông tin người dùng
   */
  async login(credentials: LoginCredentials): Promise<User> {
    try {
      const { data } = await api.post<AuthResponse>('/auth/login', credentials);
      setAuthTokens(data.token, '');
      // Sau khi login, chúng ta sẽ trả về user từ response của API login
      // và AuthContext sẽ dùng nó, thay vì gọi getProfile một lần nữa.
      return data.user;
    } catch (error: any) {
      // Extract error message from API response
      const errorMessage = error.response?.data?.message || error.message || 'Đăng nhập thất bại';

      // Throw error with proper message for UI to catch
      const loginError = new Error(errorMessage);
      throw loginError;
    }
  }


  /**
   * Đăng ký người dùng mới và lưu token.
   * @param userData Dữ liệu đăng ký
   * @returns Thông tin người dùng
   */
  async register(userData: RegisterData): Promise<User> {
    console.log('Sending registration data:', userData);
    try {
      const { data } = await api.post<AuthResponse>('/auth/register', userData);
      console.log('API Register Response:', data);
      setAuthTokens(data.token, '');
      return data.user;
    } catch (error) {
      console.error('Registration API error:', error);
      throw error;
    }
  }


  /**
   * Đăng xuất người dùng bằng cách xóa token.
   */
  logout(): void {
    // Tùy chọn: Gửi request tới server để vô hiệu hóa refresh token
    // const refreshToken = localStorage.getItem('refreshToken');
    // if (refreshToken) {
    //   api.post('/auth/logout', { refreshToken });
    // }
    clearAuthTokens();
  }


  /**
   * Gửi yêu cầu quên mật khẩu.
   * @param email Email của người dùng
   */
  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/reset-password', { Email: email });
  }


  /**
   * Đặt lại mật khẩu bằng token.
   * @param token Token nhận được từ email
   * @param newPassword Mật khẩu mới
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    await api.post('/auth/reset-password', { token, newPassword });
  }


  /**
   * Chủ động làm mới access token.
   * Thường thì việc này đã được interceptor xử lý, nhưng có thể cần dùng trong một số trường hợp.
   * @returns Access token mới
   */
  async refreshToken(): Promise<string> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }
    try {
      // Giả sử API refresh trả về cấu trúc giống AuthResponse
      const { data } = await api.post<AuthResponse>('/auth/refresh', { refreshToken });
      setAuthTokens(data.token, '');
      return data.token;
    } catch (error) {
      // Nếu refresh thất bại, xóa token và throw lỗi để AuthContext xử lý
      clearAuthTokens();
      throw error;
    }
  }
}


export const authService = new AuthService();






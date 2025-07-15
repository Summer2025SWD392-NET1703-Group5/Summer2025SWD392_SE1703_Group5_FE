/**
 * Service thống nhất để quản lý countdown timer cho booking
 * Đảm bảo đồng bộ giữa PaymentComponent và BookingHistory
 */

export interface CountdownData {
  bookingId: number;
  showtimeId: number;
  startTimestamp: number;
  duration: number; // seconds
  expiresAt: number;
}

class CountdownService {
  private static instance: CountdownService;
  private timers: Map<number, NodeJS.Timeout> = new Map();
  private callbacks: Map<number, (() => void)[]> = new Map();

  private constructor() {}

  static getInstance(): CountdownService {
    if (!CountdownService.instance) {
      CountdownService.instance = new CountdownService();
    }
    return CountdownService.instance;
  }

  /**
   * Tạo session key thống nhất cho booking timer
   */
  private getSessionKey(bookingId: number): string {
    return `booking_timer_${bookingId}`;
  }

  /**
   * Khởi tạo hoặc lấy countdown data cho booking
   */
  initCountdown(bookingId: number, showtimeId: number, duration: number = 5 * 60): CountdownData {
    const sessionKey = this.getSessionKey(bookingId);
    
    // Kiểm tra xem đã có timer trong session storage chưa
    const existingData = sessionStorage.getItem(sessionKey);
    
    if (existingData) {
      try {
        const parsed: CountdownData = JSON.parse(existingData);
        console.log(`🔄 [COUNTDOWN] Sử dụng timer hiện có cho booking ${bookingId}:`, parsed);
        return parsed;
      } catch (error) {
        console.error(`❌ [COUNTDOWN] Lỗi parse timer data cho booking ${bookingId}:`, error);
      }
    }

    // Tạo timer mới
    const now = Date.now();
    const countdownData: CountdownData = {
      bookingId,
      showtimeId,
      startTimestamp: now,
      duration,
      expiresAt: now + (duration * 1000)
    };

    sessionStorage.setItem(sessionKey, JSON.stringify(countdownData));
    console.log(`✅ [COUNTDOWN] Tạo timer mới cho booking ${bookingId}:`, countdownData);
    
    return countdownData;
  }

  /**
   * Tính thời gian còn lại (seconds)
   */
  getTimeLeft(bookingId: number): number {
    const sessionKey = this.getSessionKey(bookingId);
    const data = sessionStorage.getItem(sessionKey);

    if (!data) {
      console.warn(`⚠️ [COUNTDOWN] Không tìm thấy timer data cho booking ${bookingId}`);
      return 0;
    }

    try {
      const countdownData: CountdownData = JSON.parse(data);
      const now = Date.now();
      const remaining = Math.max(0, countdownData.expiresAt - now);
      const timeLeftSeconds = Math.floor(remaining / 1000);

      // Debug log để kiểm tra
      if (timeLeftSeconds > 600) { // Nếu > 10 phút thì có vấn đề
        console.warn(`🚨 [COUNTDOWN] Timer bất thường cho booking ${bookingId}:`);
        console.warn(`  - now: ${now} (${new Date(now)})`);
        console.warn(`  - expiresAt: ${countdownData.expiresAt} (${new Date(countdownData.expiresAt)})`);
        console.warn(`  - remaining: ${remaining}ms`);
        console.warn(`  - timeLeft: ${timeLeftSeconds}s`);
        console.warn(`  - countdownData:`, countdownData);
      }

      return timeLeftSeconds;
    } catch (error) {
      console.error(`❌ [COUNTDOWN] Lỗi tính thời gian còn lại cho booking ${bookingId}:`, error);
      return 0;
    }
  }

  /**
   * Kiểm tra xem timer đã hết hạn chưa
   */
  isExpired(bookingId: number): boolean {
    return this.getTimeLeft(bookingId) <= 0;
  }

  /**
   * Format thời gian thành MM:SS
   */
  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  /**
   * Đăng ký callback khi timer hết hạn
   */
  onTimeout(bookingId: number, callback: () => void): void {
    if (!this.callbacks.has(bookingId)) {
      this.callbacks.set(bookingId, []);
    }
    this.callbacks.get(bookingId)!.push(callback);
  }

  /**
   * Bỏ đăng ký callback
   */
  offTimeout(bookingId: number, callback: () => void): void {
    const callbacks = this.callbacks.get(bookingId);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Bắt đầu theo dõi timer cho booking
   */
  startTimer(bookingId: number, onTick?: (timeLeft: number) => void): void {
    // Clear existing timer nếu có
    this.stopTimer(bookingId);

    const timer = setInterval(() => {
      const timeLeft = this.getTimeLeft(bookingId);
      
      // Gọi callback onTick nếu có
      if (onTick) {
        onTick(timeLeft);
      }

      // Kiểm tra hết hạn
      if (timeLeft <= 0) {
        console.log(`⏰ [COUNTDOWN] Timer hết hạn cho booking ${bookingId}`);
        
        // Clear timer
        this.stopTimer(bookingId);
        
        // Clear session storage
        this.clearTimer(bookingId);
        
        // Gọi tất cả callbacks
        const callbacks = this.callbacks.get(bookingId) || [];
        callbacks.forEach(callback => {
          try {
            callback();
          } catch (error) {
            console.error(`❌ [COUNTDOWN] Lỗi khi gọi timeout callback cho booking ${bookingId}:`, error);
          }
        });
        
        // Clear callbacks
        this.callbacks.delete(bookingId);
      }
    }, 1000);

    this.timers.set(bookingId, timer);
    console.log(`🚀 [COUNTDOWN] Bắt đầu timer cho booking ${bookingId}`);
  }

  /**
   * Dừng timer cho booking
   */
  stopTimer(bookingId: number): void {
    const timer = this.timers.get(bookingId);
    if (timer) {
      clearInterval(timer);
      this.timers.delete(bookingId);
      console.log(`⏹️ [COUNTDOWN] Dừng timer cho booking ${bookingId}`);
    }
  }

  /**
   * Xóa timer data khỏi session storage
   */
  clearTimer(bookingId: number): void {
    const sessionKey = this.getSessionKey(bookingId);
    sessionStorage.removeItem(sessionKey);
    console.log(`🗑️ [COUNTDOWN] Xóa timer data cho booking ${bookingId}`);
  }

  /**
   * Xóa tất cả timers (cleanup)
   */
  clearAllTimers(): void {
    this.timers.forEach((timer, bookingId) => {
      clearInterval(timer);
      console.log(`🗑️ [COUNTDOWN] Cleanup timer cho booking ${bookingId}`);
    });

    this.timers.clear();
    this.callbacks.clear();
    console.log(`🧹 [COUNTDOWN] Đã cleanup tất cả timers`);
  }

  /**
   * Debug: Clear tất cả session storage timer data
   */
  clearAllSessionTimers(): void {
    const keys = Object.keys(sessionStorage);
    keys.forEach(key => {
      if (key.startsWith('booking_timer_')) {
        sessionStorage.removeItem(key);
        console.log(`🗑️ [COUNTDOWN] Xóa session timer: ${key}`);
      }
    });
    console.log(`🧹 [COUNTDOWN] Đã xóa tất cả session timer data`);
  }

  /**
   * Đồng bộ timer từ server (khi fetch booking history)
   * CHỈ sync nếu chưa có timer trong session storage
   */
  syncFromServer(bookingId: number, createdAt: string, showtimeId: number): boolean {
    const sessionKey = this.getSessionKey(bookingId);
    const existingData = sessionStorage.getItem(sessionKey);

    // Nếu đã có timer (từ PaymentComponent), không ghi đè
    if (existingData) {
      console.log(`🔄 [COUNTDOWN] Booking ${bookingId} đã có timer, không sync từ server`);

      // Chỉ kiểm tra xem timer hiện tại có hợp lệ không
      try {
        const parsed: CountdownData = JSON.parse(existingData);
        const timeLeft = this.getTimeLeft(bookingId);

        if (timeLeft <= 0) {
          console.log(`⏰ [COUNTDOWN] Timer hiện tại đã hết hạn, xóa timer`);
          this.clearTimer(bookingId);
          return false;
        }

        console.log(`✅ [COUNTDOWN] Timer hiện tại còn ${timeLeft}s, giữ nguyên`);
        return true;
      } catch (error) {
        console.error(`❌ [COUNTDOWN] Timer data bị lỗi, sẽ tạo mới từ server`);
        // Tiếp tục tạo timer mới từ server data
      }
    }

    // Tạo timer mới từ server data
    const createdTime = new Date(createdAt).getTime();
    const now = Date.now();
    const elapsed = now - createdTime;
    const duration = 5 * 60 * 1000; // 5 phút

    console.log(`🔍 [COUNTDOWN] Tạo timer từ server cho booking ${bookingId}:`);
    console.log(`  - createdAt: ${createdAt}`);
    console.log(`  - createdTime: ${createdTime} (${new Date(createdTime)})`);
    console.log(`  - now: ${now} (${new Date(now)})`);
    console.log(`  - elapsed: ${elapsed}ms (${Math.floor(elapsed/1000)}s)`);
    console.log(`  - duration: ${duration}ms (${Math.floor(duration/1000)}s)`);

    // Kiểm tra xem booking có còn trong thời hạn không
    if (elapsed >= duration) {
      console.log(`⏰ [COUNTDOWN] Booking ${bookingId} đã quá hạn (${Math.floor(elapsed/1000)}s)`);
      this.clearTimer(bookingId);
      return false;
    }

    // Tạo timer data mới
    const countdownData: CountdownData = {
      bookingId,
      showtimeId,
      startTimestamp: createdTime,
      duration: Math.floor(duration / 1000),
      expiresAt: createdTime + duration
    };

    sessionStorage.setItem(sessionKey, JSON.stringify(countdownData));

    const timeLeft = Math.floor((countdownData.expiresAt - now) / 1000);
    console.log(`🔄 [COUNTDOWN] Tạo timer từ server thành công:`);
    console.log(`  - expiresAt: ${countdownData.expiresAt} (${new Date(countdownData.expiresAt)})`);
    console.log(`  - timeLeft: ${timeLeft}s (${Math.floor(timeLeft/60)}:${(timeLeft%60).toString().padStart(2,'0')})`);

    return true;
  }
}

export default CountdownService.getInstance();

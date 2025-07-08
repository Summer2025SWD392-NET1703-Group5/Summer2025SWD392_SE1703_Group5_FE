// services/sessionStorageService.ts

interface UserSeatSelection {
  seatId: string;
  userId: string;
  showtimeId: string;
  timestamp: number;
  expiresAt: number;
}

interface SessionData {
  showtimeId: string;
  selectedSeats: UserSeatSelection[];
  lastUpdated: number;
}

/**
 * Service quản lý session persistence cho seat selections
 * Lưu trữ selected seats trong localStorage với expiration
 */
class SessionStorageService {
  private readonly STORAGE_KEY = 'galaxy_cinema_session';
  private readonly EXPIRATION_TIME = 15 * 60 * 1000; // 15 phút

  /**
   * Lưu seat selection vào session storage
   */
  saveSelectedSeat(seatId: string, userId: string, showtimeId: string): void {
    try {
      // ✅ Validation: Kiểm tra seatId hợp lệ trước khi lưu
      if (!seatId ||
          seatId === 'undefined' ||
          typeof seatId !== 'string' ||
          seatId.length === 0 ||
          seatId.includes('undefined')) {
        console.error(`❌ [SESSION_STORAGE] Invalid seatId: "${seatId}", không lưu vào session`);
        return;
      }

      const sessionData = this.getSessionData(showtimeId);
      const now = Date.now();
      const expiresAt = now + this.EXPIRATION_TIME;

      // Remove existing selection for this seat
      sessionData.selectedSeats = sessionData.selectedSeats.filter(
        seat => seat.seatId !== seatId
      );

      // Add new selection
      sessionData.selectedSeats.push({
        seatId,
        userId,
        showtimeId,
        timestamp: now,
        expiresAt
      });

      sessionData.lastUpdated = now;
      this.saveSessionData(showtimeId, sessionData);

      console.log(`💾 Saved seat ${seatId} to session storage`);
    } catch (error) {
      console.error('❌ Failed to save selected seat:', error);
    }
  }

  /**
   * Xóa seat selection khỏi session storage
   */
  removeSelectedSeat(seatId: string, showtimeId: string): void {
    try {
      const sessionData = this.getSessionData(showtimeId);

      sessionData.selectedSeats = sessionData.selectedSeats.filter(
        seat => seat.seatId !== seatId
      );

      sessionData.lastUpdated = Date.now();
      this.saveSessionData(showtimeId, sessionData);

      console.log(`🗑️ Removed seat ${seatId} from session storage`);
    } catch (error) {
      console.error('❌ Failed to remove selected seat:', error);
    }
  }

  /**
   * Clear tất cả selected seats cho showtime
   */
  clearSelectedSeats(showtimeId: string): void {
    try {
      const sessionData = this.getSessionData(showtimeId);
      const clearedCount = sessionData.selectedSeats.length;

      sessionData.selectedSeats = [];
      sessionData.lastUpdated = Date.now();
      this.saveSessionData(showtimeId, sessionData);

      console.log(`🧹 Cleared ${clearedCount} selected seats from session storage`);
    } catch (error) {
      console.error('❌ Error clearing selected seats:', error);
    }
  }

  /**
   * Lấy danh sách selected seats cho showtime
   */
  getSelectedSeats(showtimeId: string, userId?: string): string[] {
    try {
      const sessionData = this.getSessionData(showtimeId);
      const now = Date.now();

      // Filter expired selections
      const validSelections = sessionData.selectedSeats.filter(
        seat => seat.expiresAt > now
      );

      // Update session data if we removed expired items
      if (validSelections.length !== sessionData.selectedSeats.length) {
        sessionData.selectedSeats = validSelections;
        sessionData.lastUpdated = now;
        this.saveSessionData(showtimeId, sessionData);
      }

      // Return seats for specific user or all seats
      const filteredSeats = userId 
        ? validSelections.filter(seat => seat.userId === userId)
        : validSelections;

      const validSeatIds = filteredSeats
        .map(seat => seat.seatId)
        .filter(seatId => seatId && seatId !== 'undefined' && typeof seatId === 'string' && !seatId.includes('undefined'));

      // 🧹 Cleanup: Nếu có invalid seats, clean up session storage
      if (validSeatIds.length !== filteredSeats.length) {
        console.log(`🧹 [SESSION_CLEANUP] Found ${filteredSeats.length - validSeatIds.length} invalid seats, cleaning up...`);
        sessionData.selectedSeats = sessionData.selectedSeats.filter(seat =>
          seat.seatId && seat.seatId !== 'undefined' && typeof seat.seatId === 'string' && !seat.seatId.includes('undefined')
        );
        this.saveSessionData(showtimeId, sessionData);
      }

      return validSeatIds;
    } catch (error) {
      console.error('❌ Failed to get selected seats:', error);
      return [];
    }
  }

  /**
   * Lấy tất cả seat selections (bao gồm của other users)
   */
  getAllSelectedSeats(showtimeId: string): { [userId: string]: string[] } {
    try {
      const sessionData = this.getSessionData(showtimeId);
      const now = Date.now();

      // Filter expired selections
      const validSelections = sessionData.selectedSeats.filter(
        seat => seat.expiresAt > now
      );

      // Group by userId
      const groupedSeats: { [userId: string]: string[] } = {};
      validSelections.forEach(seat => {
        if (!groupedSeats[seat.userId]) {
          groupedSeats[seat.userId] = [];
        }
        groupedSeats[seat.userId].push(seat.seatId);
      });

      return groupedSeats;
    } catch (error) {
      console.error('❌ Failed to get all selected seats:', error);
      return {};
    }
  }

  /**
   * Extend expiration time cho selected seats
   */
  extendSeatExpiration(seatId: string, showtimeId: string): void {
    try {
      const sessionData = this.getSessionData(showtimeId);
      const now = Date.now();
      const newExpiresAt = now + this.EXPIRATION_TIME;

      sessionData.selectedSeats = sessionData.selectedSeats.map(seat => 
        seat.seatId === seatId 
          ? { ...seat, expiresAt: newExpiresAt }
          : seat
      );

      sessionData.lastUpdated = now;
      this.saveSessionData(showtimeId, sessionData);

      console.log(`⏰ Extended expiration for seat ${seatId}`);
    } catch (error) {
      console.error('❌ Failed to extend seat expiration:', error);
    }
  }

  /**
   * Clear all selections cho showtime
   */
  clearShowtimeSelections(showtimeId: string): void {
    try {
      localStorage.removeItem(`${this.STORAGE_KEY}_${showtimeId}`);
      console.log(`🧹 Cleared all selections for showtime ${showtimeId}`);
    } catch (error) {
      console.error('❌ Failed to clear showtime selections:', error);
    }
  }

  /**
   * Clear expired selections across all showtimes
   */
  cleanupExpiredSelections(): void {
    try {
      const now = Date.now();
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith(this.STORAGE_KEY)
      );

      keys.forEach(key => {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          if (data.selectedSeats) {
            const validSelections = data.selectedSeats.filter(
              (seat: UserSeatSelection) => seat.expiresAt > now
            );

            if (validSelections.length === 0) {
              localStorage.removeItem(key);
            } else if (validSelections.length !== data.selectedSeats.length) {
              data.selectedSeats = validSelections;
              data.lastUpdated = now;
              localStorage.setItem(key, JSON.stringify(data));
            }
          }
        } catch (error) {
          // Remove corrupted data
          localStorage.removeItem(key);
        }
      });

      console.log('🧹 Cleaned up expired selections');
    } catch (error) {
      console.error('❌ Failed to cleanup expired selections:', error);
    }
  }

  /**
   * Private: Get session data for showtime
   */
  private getSessionData(showtimeId: string): SessionData {
    try {
      const key = `${this.STORAGE_KEY}_${showtimeId}`;
      const stored = localStorage.getItem(key);
      
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('⚠️ Failed to parse session data, creating new');
    }

    return {
      showtimeId,
      selectedSeats: [],
      lastUpdated: Date.now()
    };
  }

  /**
   * Private: Save session data
   */
  private saveSessionData(showtimeId: string, data: SessionData): void {
    try {
      const key = `${this.STORAGE_KEY}_${showtimeId}`;
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('❌ Failed to save session data:', error);
    }
  }
}

// Export singleton instance
export const sessionStorageService = new SessionStorageService();

// 🔧 Debug: Expose to window for testing
if (typeof window !== 'undefined') {
  (window as any).sessionStorageService = sessionStorageService;
}

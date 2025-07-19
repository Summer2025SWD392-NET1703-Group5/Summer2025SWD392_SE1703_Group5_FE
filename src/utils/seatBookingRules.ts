// utils/seatBookingRules.ts
import type { Seat } from '../types';

export interface SeatValidationResult {
  isValid: boolean;
  reason: string;
  suggestedSeats?: string[];
}

export class SeatBookingRulesEngine {
  private seats: Seat[];
  private occupiedSeats: string[];
  private seatMap: Map<string, Seat>;
  private rowMap: Map<string, Seat[]>;

  constructor(seats: Seat[], occupiedSeats: string[] = []) {
    this.seats = seats;
    this.occupiedSeats = occupiedSeats;
    this.seatMap = new Map();
    this.rowMap = new Map();
    
    // Tạo map để tra cứu nhanh
    this.buildSeatMaps();
  }

  private buildSeatMaps(): void {
    console.log('🏗️ [SeatRules] Building seat maps...');
    
    this.seats.forEach(seat => {
      this.seatMap.set(seat.id, seat);
      
      if (!this.rowMap.has(seat.row)) {
        this.rowMap.set(seat.row, []);
      }
      this.rowMap.get(seat.row)!.push(seat);
    });

    // Sắp xếp ghế trong mỗi hàng theo số ghế
    this.rowMap.forEach(rowSeats => {
      rowSeats.sort((a, b) => a.number - b.number);
    });

    console.log(`🏗️ [SeatRules] Built maps for ${this.seats.length} seats in ${this.rowMap.size} rows`);
  }

  /**
   * Kiểm tra xem việc chọn ghế có hợp lệ không
   */
  public validateSeatSelection(seatId: string, currentSelectedSeats: string[]): SeatValidationResult {
    console.log(`🔍 [SeatRules] Validating seat selection: ${seatId}`);
    console.log(`🔍 [SeatRules] Current selected: [${currentSelectedSeats.join(', ')}]`);
    console.log(`🔍 [SeatRules] Occupied seats: [${this.occupiedSeats.join(', ')}]`);

    const seat = this.seatMap.get(seatId);
    if (!seat) {
      return {
        isValid: false,
        reason: 'Ghế không tồn tại'
      };
    }

    // Tạo danh sách ghế sẽ được chọn sau khi thêm ghế mới
    const newSelectedSeats = [...currentSelectedSeats, seatId];
    
    // Kiểm tra quy tắc không để lại ghế lẻ
    const violatesRule = this.checkIsolatedSeatRule(newSelectedSeats);
    
    if (violatesRule.hasViolation) {
      return {
        isValid: false,
        reason: violatesRule.reason,
        suggestedSeats: this.getSuggestedSeats(currentSelectedSeats)
      };
    }

    return {
      isValid: true,
      reason: 'Hợp lệ'
    };
  }

  /**
   * Kiểm tra quy tắc không để lại ghế lẻ
   */
  private checkIsolatedSeatRule(selectedSeats: string[]): { hasViolation: boolean; reason: string } {
    console.log(`🔍 [SeatRules] Checking isolated seat rule for: [${selectedSeats.join(', ')}]`);

    // Tạo set các ghế đã được chọn hoặc bị chiếm
    const unavailableSeats = new Set([...selectedSeats, ...this.occupiedSeats]);
    
    // Kiểm tra từng hàng ghế
    for (const [rowId, rowSeats] of this.rowMap) {
      console.log(`🔍 [SeatRules] Checking row ${rowId} with ${rowSeats.length} seats`);
      
      const violations = this.findIsolatedSeatsInRow(rowSeats, unavailableSeats);
      
      if (violations.length > 0) {
        const violatedSeatIds = violations.map(v => v.id).join(', ');
        console.log(`❌ [SeatRules] Found isolated seats in row ${rowId}: ${violatedSeatIds}`);
        
        return {
          hasViolation: true,
          reason: `Không thể chọn ghế này vì sẽ để lại ghế lẻ (${violatedSeatIds}). Vui lòng chọn ghế khác để tránh để lại ghế đơn lẻ.`
        };
      }
    }

    console.log(`✅ [SeatRules] No isolated seat violations found`);
    return { hasViolation: false, reason: '' };
  }

  /**
   * Tìm ghế bị cô lập trong một hàng
   */
  private findIsolatedSeatsInRow(rowSeats: Seat[], unavailableSeats: Set<string>): Seat[] {
    const isolatedSeats: Seat[] = [];
    
    for (let i = 0; i < rowSeats.length; i++) {
      const seat = rowSeats[i];
      
      // Bỏ qua ghế đã được chọn/chiếm hoặc ghế ẩn
      if (unavailableSeats.has(seat.id) || seat.status === 'hidden' || seat.type === 'hidden') {
        continue;
      }

      // Kiểm tra ghế có bị cô lập không
      const leftSeat = i > 0 ? rowSeats[i - 1] : null;
      const rightSeat = i < rowSeats.length - 1 ? rowSeats[i + 1] : null;
      
      const leftUnavailable = !leftSeat || 
        unavailableSeats.has(leftSeat.id) || 
        leftSeat.status === 'hidden' || 
        leftSeat.type === 'hidden';
        
      const rightUnavailable = !rightSeat || 
        unavailableSeats.has(rightSeat.id) || 
        rightSeat.status === 'hidden' || 
        rightSeat.type === 'hidden';

      // Ghế bị cô lập nếu cả hai bên đều không khả dụng
      if (leftUnavailable && rightUnavailable) {
        isolatedSeats.push(seat);
        console.log(`🔍 [SeatRules] Seat ${seat.id} is isolated (left: ${leftUnavailable}, right: ${rightUnavailable})`);
      }
    }
    
    return isolatedSeats;
  }

  /**
   * Đề xuất ghế phù hợp
   */
  private getSuggestedSeats(currentSelectedSeats: string[]): string[] {
    console.log(`💡 [SeatRules] Getting suggested seats for current selection: [${currentSelectedSeats.join(', ')}]`);
    
    const suggestions: string[] = [];
    const unavailableSeats = new Set([...currentSelectedSeats, ...this.occupiedSeats]);
    
    // Tìm ghế liền kề với ghế đã chọn
    for (const selectedSeatId of currentSelectedSeats) {
      const selectedSeat = this.seatMap.get(selectedSeatId);
      if (!selectedSeat) continue;
      
      const rowSeats = this.rowMap.get(selectedSeat.row) || [];
      const seatIndex = rowSeats.findIndex(s => s.id === selectedSeatId);
      
      // Kiểm tra ghế bên trái
      if (seatIndex > 0) {
        const leftSeat = rowSeats[seatIndex - 1];
        if (!unavailableSeats.has(leftSeat.id) && 
            leftSeat.status !== 'hidden' && 
            leftSeat.type !== 'hidden') {
          
          // Kiểm tra xem việc chọn ghế này có tạo ra ghế lẻ không
          const testSelection = [...currentSelectedSeats, leftSeat.id];
          const testResult = this.checkIsolatedSeatRule(testSelection);
          
          if (!testResult.hasViolation && !suggestions.includes(leftSeat.id)) {
            suggestions.push(leftSeat.id);
          }
        }
      }
      
      // Kiểm tra ghế bên phải
      if (seatIndex < rowSeats.length - 1) {
        const rightSeat = rowSeats[seatIndex + 1];
        if (!unavailableSeats.has(rightSeat.id) && 
            rightSeat.status !== 'hidden' && 
            rightSeat.type !== 'hidden') {
          
          // Kiểm tra xem việc chọn ghế này có tạo ra ghế lẻ không
          const testSelection = [...currentSelectedSeats, rightSeat.id];
          const testResult = this.checkIsolatedSeatRule(testSelection);
          
          if (!testResult.hasViolation && !suggestions.includes(rightSeat.id)) {
            suggestions.push(rightSeat.id);
          }
        }
      }
    }
    
    console.log(`💡 [SeatRules] Suggested seats: [${suggestions.join(', ')}]`);
    return suggestions.slice(0, 5); // Giới hạn 5 đề xuất
  }

  /**
   * Kiểm tra xem có thể chọn một nhóm ghế liền kề không
   */
  public canSelectConsecutiveSeats(startSeatId: string, count: number): SeatValidationResult {
    const startSeat = this.seatMap.get(startSeatId);
    if (!startSeat) {
      return {
        isValid: false,
        reason: 'Ghế bắt đầu không tồn tại'
      };
    }

    const rowSeats = this.rowMap.get(startSeat.row) || [];
    const startIndex = rowSeats.findIndex(s => s.id === startSeatId);
    
    if (startIndex === -1) {
      return {
        isValid: false,
        reason: 'Không tìm thấy ghế trong hàng'
      };
    }

    // Kiểm tra có đủ ghế liền kề không
    if (startIndex + count > rowSeats.length) {
      return {
        isValid: false,
        reason: 'Không đủ ghế liền kề trong hàng'
      };
    }

    // Kiểm tra tất cả ghế trong nhóm có khả dụng không
    const seatsToSelect: string[] = [];
    for (let i = 0; i < count; i++) {
      const seat = rowSeats[startIndex + i];
      if (this.occupiedSeats.includes(seat.id) || 
          seat.status === 'hidden' || 
          seat.type === 'hidden') {
        return {
          isValid: false,
          reason: `Ghế ${seat.id} không khả dụng`
        };
      }
      seatsToSelect.push(seat.id);
    }

    // Kiểm tra quy tắc ghế lẻ
    const ruleCheck = this.checkIsolatedSeatRule(seatsToSelect);
    if (ruleCheck.hasViolation) {
      return {
        isValid: false,
        reason: ruleCheck.reason
      };
    }

    return {
      isValid: true,
      reason: 'Có thể chọn nhóm ghế này'
    };
  }
}

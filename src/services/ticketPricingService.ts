import apiClient from './apiClient';
import type { 
  TicketPricing, 
  TicketPricingGroup, 
  CreateTicketPricingRequest, 
  BulkPriceUpdate,
  PricingStructure,
  SeatType,
  PriceCalculation
} from '../types/ticketPricing';

class TicketPricingService {
  private baseURL = '/ticket-pricing';

  /**
   * Lấy tất cả cấu hình giá vé
   */
  async getAllTicketPricings(): Promise<TicketPricingGroup[]> {
    try {
      const response = await apiClient.get(this.baseURL);
      return response.data;
    } catch (error: any) {
      console.error('❌ [TicketPricingService] Lỗi lấy danh sách giá vé:', error);
      throw new Error(error.response?.data?.message || 'Không thể lấy danh sách giá vé');
    }
  }

  /**
   * Lấy chi tiết một cấu hình giá vé
   */
  async getTicketPricingById(id: string): Promise<TicketPricing> {
    try {
      const response = await apiClient.get(`${this.baseURL}/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ [TicketPricingService] Lỗi lấy chi tiết giá vé:', error);
      throw new Error(error.response?.data?.message || 'Không thể lấy chi tiết giá vé');
    }
  }

  /**
   * Tạo cấu hình giá vé mới
   */
  async createTicketPricing(data: CreateTicketPricingRequest): Promise<any> {
    try {
      const response = await apiClient.post(this.baseURL, data);
      return response.data;
    } catch (error: any) {
      console.error('❌ [TicketPricingService] Lỗi tạo giá vé:', error);
      throw new Error(error.response?.data?.message || 'Không thể tạo cấu hình giá vé mới');
    }
  }

  /**
   * Cập nhật cấu hình giá vé
   */
  async updateTicketPricing(id: string, data: Partial<CreateTicketPricingRequest>): Promise<any> {
    try {
      const response = await apiClient.put(`${this.baseURL}/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error('❌ [TicketPricingService] Lỗi cập nhật giá vé:', error);
      throw new Error(error.response?.data?.message || 'Không thể cập nhật cấu hình giá vé');
    }
  }

  /**
   * Xóa cấu hình giá vé
   */
  async deleteTicketPricing(id: string): Promise<any> {
    try {
      const response = await apiClient.delete(`${this.baseURL}/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ [TicketPricingService] Lỗi xóa giá vé:', error);
      throw new Error(error.response?.data?.message || 'Không thể xóa cấu hình giá vé');
    }
  }

  /**
   * Cập nhật hàng loạt giá vé
   */
  async bulkUpdatePrices(updates: BulkPriceUpdate[]): Promise<any> {
    try {
      const response = await apiClient.post(`${this.baseURL}/bulk-update`, { PriceUpdates: updates });
      return response.data;
    } catch (error: any) {
      console.error('❌ [TicketPricingService] Lỗi cập nhật hàng loạt:', error);
      throw new Error(error.response?.data?.message || 'Không thể cập nhật hàng loạt giá vé');
    }
  }

  /**
   * Lấy cấu trúc giá vé
   */
  async getPricingStructure(): Promise<PricingStructure> {
    try {
      const response = await apiClient.get(`${this.baseURL}/pricing-structure`);
      return response.data;
    } catch (error: any) {
      console.error('❌ [TicketPricingService] Lỗi lấy cấu trúc giá:', error);
      throw new Error(error.response?.data?.message || 'Không thể lấy cấu trúc giá vé');
    }
  }

  /**
   * Lấy danh sách loại ghế có sẵn
   */
  async getAvailableSeatTypes(): Promise<SeatType[]> {
    try {
      const response = await apiClient.get(`${this.baseURL}/available-seat-types`);
      return response.data;
    } catch (error: any) {
      console.error('❌ [TicketPricingService] Lỗi lấy loại ghế:', error);
      throw new Error(error.response?.data?.message || 'Không thể lấy danh sách loại ghế');
    }
  }

  /**
   * Tính giá vé cho tham số cụ thể
   */
  async calculateTicketPrice(params: {
    roomType: string;
    seatType: string;
    showDate: string;
    startTime: string;
  }): Promise<PriceCalculation> {
    try {
      const response = await apiClient.get(`${this.baseURL}/calculate`, { params });
      return response.data;
    } catch (error: any) {
      console.error('❌ [TicketPricingService] Lỗi tính giá vé:', error);
      throw new Error(error.response?.data?.message || 'Không thể tính giá vé');
    }
  }

  /**
   * Format currency helper
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  /**
   * Generate ID từ room type và seat type
   */
  generateId(roomType: string, seatType: string): string {
    return `${roomType}_${seatType}`;
  }

  /**
   * Parse ID thành room type và seat type
   */
  parseId(id: string): { roomType: string; seatType: string } {
    const parts = id.split('_');
    if (parts.length < 2) {
      throw new Error('ID không hợp lệ');
    }
    return {
      roomType: parts[0],
      seatType: parts.slice(1).join('_')
    };
  }
}

export default new TicketPricingService();

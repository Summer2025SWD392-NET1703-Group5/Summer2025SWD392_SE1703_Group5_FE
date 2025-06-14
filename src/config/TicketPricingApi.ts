import api from "./axios";

// Ticket Pricing management API calls
const TicketPricingApi = {
  // Get all ticket pricing configurations (Admin/Staff/Manager only)
  getAllPricing: async () => {
    try {
      const response = await api.get("ticket-pricing");
      return response.data;
    } catch (error) {
      console.error("Error fetching ticket pricing:", error);
      throw error;
    }
  },

  // Create new pricing configuration (Admin only)
  createPricing: async (pricingData: any) => {
    try {
      const response = await api.post("ticket-pricing", pricingData);
      return response.data;
    } catch (error) {
      console.error("Error creating pricing:", error);
      throw error;
    }
  },

  // Get pricing structure (Admin/Staff/Manager/Customer)
  getPricingStructure: async () => {
    try {
      const response = await api.get("ticket-pricing/pricing-structure");
      return response.data;
    } catch (error) {
      console.error("Error fetching pricing structure:", error);
      throw error;
    }
  },

  // Calculate ticket price (Admin/Staff/Manager/Customer)
  calculatePrice: async (calculationData: any) => {
    try {
      const response = await api.get("ticket-pricing/calculate", { params: calculationData });
      return response.data;
    } catch (error) {
      console.error("Error calculating price:", error);
      throw error;
    }
  },

  // Get available seat types (Authenticated users only)
  getAvailableSeatTypes: async () => {
    try {
      const response = await api.get("ticket-pricing/available-seat-types");
      return response.data;
    } catch (error) {
      console.error("Error fetching available seat types:", error);
      throw error;
    }
  },

  // Bulk update pricing (Admin only)
  bulkUpdatePricing: async (bulkData: any) => {
    try {
      const response = await api.post("ticket-pricing/bulk-update", bulkData);
      return response.data;
    } catch (error) {
      console.error("Error bulk updating pricing:", error);
      throw error;
    }
  },

  // Get pricing details by ID (Admin/Staff/Manager only)
  getPricingById: async (pricingId: string) => {
    try {
      const response = await api.get(`ticket-pricing/${pricingId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching pricing by ID:", error);
      throw error;
    }
  },

  // Update pricing configuration (Admin only)
  updatePricing: async (pricingId: string, pricingData: any) => {
    try {
      const response = await api.put(`ticket-pricing/${pricingId}`, pricingData);
      return response.data;
    } catch (error) {
      console.error("Error updating pricing:", error);
      throw error;
    }
  },

  // Delete pricing configuration (Admin only)
  deletePricing: async (pricingId: string) => {
    try {
      const response = await api.delete(`ticket-pricing/${pricingId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting pricing:", error);
      throw error;
    }
  },
};

export default TicketPricingApi;

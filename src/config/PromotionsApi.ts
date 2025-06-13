import api from "./axios";

// Promotions management API calls
const PromotionsApi = {
  // Get all available promotions (Public)
  getAvailablePromotions: async () => {
    try {
      const response = await api.get("promotions/available");
      return response.data;
    } catch (error) {
      console.error("Error fetching available promotions:", error);
      throw error;
    }
  },

  // Validate promotion code (Authenticated users only)
  validatePromotion: async (code: string) => {
    try {
      const response = await api.get(`promotions/validate/${code}`);
      return response.data;
    } catch (error) {
      console.error("Error validating promotion:", error);
      throw error;
    }
  },

  // Apply promotion to booking (Authenticated users only)
  applyPromotion: async (promotionData: any) => {
    try {
      const response = await api.post("promotions/apply", promotionData);
      return response.data;
    } catch (error) {
      console.error("Error applying promotion:", error);
      throw error;
    }
  },

  // Remove promotion from booking (Authenticated users only)
  removePromotion: async (bookingId: string) => {
    try {
      const response = await api.delete(`promotions/remove/${bookingId}`);
      return response.data;
    } catch (error) {
      console.error("Error removing promotion:", error);
      throw error;
    }
  },

  // Get all promotions (Admin only)
  getAllPromotions: async () => {
    try {
      const response = await api.get("promotions");
      return response.data;
    } catch (error) {
      console.error("Error fetching all promotions:", error);
      throw error;
    }
  },

  // Create new promotion (Admin only)
  createPromotion: async (promotionData: any) => {
    try {
      const response = await api.post("promotions", promotionData);
      return response.data;
    } catch (error) {
      console.error("Error creating promotion:", error);
      throw error;
    }
  },

  // Get promotion details by ID (Admin/Staff/Manager only)
  getPromotionById: async (promotionId: string) => {
    try {
      const response = await api.get(`promotions/${promotionId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching promotion by ID:", error);
      throw error;
    }
  },

  // Update promotion (Admin only)
  updatePromotion: async (promotionId: string, promotionData: any) => {
    try {
      const response = await api.put(`promotions/${promotionId}`, promotionData);
      return response.data;
    } catch (error) {
      console.error("Error updating promotion:", error);
      throw error;
    }
  },

  // Delete promotion (Admin only)
  deletePromotion: async (promotionId: string) => {
    try {
      const response = await api.delete(`promotions/${promotionId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting promotion:", error);
      throw error;
    }
  },
};

export default PromotionsApi;

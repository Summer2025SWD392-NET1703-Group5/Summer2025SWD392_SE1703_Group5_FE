import api from "./axios";

// Points management API calls
const PointsApi = {
  // Get user's current points (Authenticated users only)
  getMyPoints: async () => {
    try {
      const response = await api.get("points/my-points");
      return response.data;
    } catch (error) {
      console.error("Error fetching user points:", error);
      throw error;
    }
  },

  // Get points earning history (Authenticated users only)
  getEarningHistory: async () => {
    try {
      const response = await api.get("points/earning-history");
      return response.data;
    } catch (error) {
      console.error("Error fetching earning history:", error);
      throw error;
    }
  },

  // Get points redemption history (Authenticated users only)
  getRedemptionHistory: async () => {
    try {
      const response = await api.get("points/redemption-history");
      return response.data;
    } catch (error) {
      console.error("Error fetching redemption history:", error);
      throw error;
    }
  },

  // Apply points discount to booking (Authenticated users only)
  applyPointsDiscount: async (bookingId: string, pointsData: any) => {
    try {
      const response = await api.post(`points/booking/${bookingId}/apply-discount`, pointsData);
      return response.data;
    } catch (error) {
      console.error("Error applying points discount:", error);
      throw error;
    }
  },

  // Get all user points (Admin only)
  getAllUserPoints: async () => {
    try {
      const response = await api.get("points/all");
      return response.data;
    } catch (error) {
      console.error("Error fetching all user points:", error);
      throw error;
    }
  },
};

export default PointsApi;

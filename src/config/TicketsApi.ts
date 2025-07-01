import api from "./axios";

// Tickets management API calls
const TicketsApi = {
  // Get ticket info by booking ID (Public)
  getTicketByBooking: async (bookingId: string) => {
    try {
      const response = await api.get(`ticket/booking/${bookingId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching ticket by booking:", error);
      throw error;
    }
  },

  // Get ticket info by ticket code (Public)
  getTicketByCode: async (ticketCode: string) => {
    try {
      const response = await api.get(`ticket/code/${ticketCode}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching ticket by code:", error);
      throw error;
    }
  },

  // Verify ticket status (Admin/Staff only)
  verifyTicket: async (ticketCode: string) => {
    try {
      const response = await api.get(`ticket/verify/${ticketCode}`);
      return response.data;
    } catch (error) {
      console.error("Error verifying ticket:", error);
      throw error;
    }
  },

  // Scan ticket for check-in (Admin/Staff only)
  scanTicket: async (ticketCode: string) => {
    try {
      const response = await api.post(`ticket/scan/${ticketCode}`);
      return response.data;
    } catch (error) {
      console.error("Error scanning ticket:", error);
      throw error;
    }
  },

  // Get scan list for check-in today (Admin/Staff only)
  getScanList: async () => {
    try {
      const response = await api.get("ticket/scan-list");
      return response.data;
    } catch (error) {
      console.error("Error fetching scan list:", error);
      throw error;
    }
  },

  // Send ticket via email (Public - Authenticated users only)
  sendTicketEmail: async (emailData: any) => {
    try {
      const response = await api.post("ticket/email", emailData);
      return response.data;
    } catch (error) {
      console.error("Error sending ticket email:", error);
      throw error;
    }
  },

  // Get user's tickets (Authenticated users only)
  getMyTickets: async () => {
    try {
      const response = await api.get("ticket/my-tickets");
      return response.data;
    } catch (error) {
      console.error("Error fetching user tickets:", error);
      throw error;
    }
  },

  // Get check-in statistics (Admin/Staff only)
  getCheckinStats: async () => {
    try {
      const response = await api.get("ticket/checkin-stats");
      return response.data;
    } catch (error) {
      console.error("Error fetching check-in stats:", error);
      throw error;
    }
  },

  // Get all tickets in system (Admin only)
  getAllTickets: async () => {
    try {
      const response = await api.get("ticket/all");
      return response.data;
    } catch (error) {
      console.error("Error fetching all tickets:", error);
      throw error;
    }
  },

  // Clean up invalid tickets (Admin only)
  cleanupTickets: async () => {
    try {
      const response = await api.post("ticket/cleanup");
      return response.data;
    } catch (error) {
      console.error("Error cleaning up tickets:", error);
      throw error;
    }
  },

  // Update ticket status (Admin only)
  updateTicketStatus: async (statusData: any) => {
    try {
      const response = await api.post("ticket/update-status", statusData);
      return response.data;
    } catch (error) {
      console.error("Error updating ticket status:", error);
      throw error;
    }
  },

  // Download ticket as PDF
  downloadTicket: async (ticketId: string) => {
    try {
      const response = await api.get(`ticket/${ticketId}/download`, {
        responseType: "blob",
      });
      return response.data;
    } catch (error) {
      console.error("Error downloading ticket:", error);
      throw error;
    }
  },
};

export default TicketsApi;

import api from "./axios";

// Get all bookings for staff/admin
const getAllBookings = async () => {
  try {
    const response = await api.get("bookings");
    return response.data;
  } catch (error) {
    console.error("Error fetching bookings:", error);
    throw error;
  }
};

// Create new booking for customer (Staff/Manager only)
const createBooking = async (bookingData: any) => {
  try {
    const response = await api.post("bookings", bookingData);
    return response.data;
  } catch (error) {
    console.error("Error creating booking:", error);
    throw error;
  }
};

// Get booking by ID
const getBookingById = async (bookingId: string) => {
  try {
    const response = await api.get(`bookings/${bookingId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching booking:", error);
    throw error;
  }
};

// Update payment status (Admin/Staff/Manager only)
const updateBookingPayment = async (bookingId: string, paymentData: any) => {
  try {
    const response = await api.put(`bookings/${bookingId}/payment`, paymentData);
    return response.data;
  } catch (error) {
    console.error("Error updating payment status:", error);
    throw error;
  }
};

// Cancel booking (Admin/Staff/Manager only)
const cancelBooking = async (bookingId: string) => {
  try {
    const response = await api.put(`bookings/${bookingId}/cancel`);
    return response.data;
  } catch (error) {
    console.error("Error cancelling booking:", error);
    throw error;
  }
};

// Search bookings with filters (Admin/Manager only)
const searchBookings = async (searchParams?: any) => {
  try {
    const queryString = searchParams ? `?${new URLSearchParams(searchParams).toString()}` : "";
    const response = await api.get(`bookings/search${queryString}`);
    return response.data;
  } catch (error) {
    console.error("Error searching bookings:", error);
    throw error;
  }
};

// Export bookings to CSV (Admin/Manager only)
const exportBookings = async () => {
  try {
    const response = await api.get("bookings/export", {
      responseType: "blob",
    });
    return response.data;
  } catch (error) {
    console.error("Error exporting bookings:", error);
    throw error;
  }
};

// Staff: Check pending bookings for staff (Staff only)
const getStaffPendingBookings = async () => {
  try {
    const response = await api.get("bookings/staff/check-pending");
    return response.data;
  } catch (error) {
    console.error("Error checking staff pending bookings:", error);
    throw error;
  }
};

export {
  getAllBookings,
  createBooking,
  getBookingById,
  updateBookingPayment,
  cancelBooking,
  searchBookings,
  exportBookings,
  getStaffPendingBookings,
};

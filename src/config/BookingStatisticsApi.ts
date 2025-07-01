import api from "./axios";

// Get booking statistics (Admin/Staff only)
const getBookingStatistics = async (startDate: string, endDate: string) => {
  try {
    const queryParams = new URLSearchParams({
      startDate,
      endDate,
    });

    const response = await api.get(`booking-statistics?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching booking statistics:", error);
    throw error;
  }
};

// Get all booking statistics (Admin/Staff only)
const getAllBookingStatistics = async () => {
  try {
    const response = await api.get("booking-statistics/all");
    return response.data;
  } catch (error) {
    console.error("Error fetching all booking statistics:", error);
    throw error;
  }
};

// Get movie booking statistics (Admin/Staff only)
const getMovieBookingStatistics = async (startDate: string, endDate: string) => {
  try {
    const queryParams = new URLSearchParams({
      startDate,
      endDate,
    });

    const response = await api.get(`booking-statistics/movies?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching movie booking statistics:", error);
    throw error;
  }
};

// Get room booking statistics (Admin/Staff only)
const getRoomBookingStatistics = async (startDate: string, endDate: string) => {
  try {
    const queryParams = new URLSearchParams({
      startDate,
      endDate,
    });

    const response = await api.get(`booking-statistics/rooms?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching room booking statistics:", error);
    throw error;
  }
};

// Get daily booking statistics (Admin/Staff only)
const getDailyBookingStatistics = async (startDate: string, endDate: string) => {
  try {
    const queryParams = new URLSearchParams({
      startDate,
      endDate,
    });

    const response = await api.get(`booking-statistics/daily?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching daily booking statistics:", error);
    throw error;
  }
};

// Get payment methods booking statistics (Admin/Staff only)
const getPaymentMethodsBookingStatistics = async (startDate: string, endDate: string) => {
  try {
    const queryParams = new URLSearchParams({
      startDate,
      endDate,
    });

    const response = await api.get(`booking-statistics/payment-methods?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching payment methods booking statistics:", error);
    throw error;
  }
};

export {
  getPaymentMethodsBookingStatistics,
  getDailyBookingStatistics,
  getRoomBookingStatistics,
  getMovieBookingStatistics,
  getAllBookingStatistics,
  getBookingStatistics,
};

import api from "./axios";

// Get seat layout for a specific showtime (Authenticated users only)
const getAvailableSeats = async (showtimeId: string) => {
  try {
    const response = await api.get(`seats/showtime/${showtimeId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching showtime seats:", error);
    throw error;
  }
};

export { getAvailableSeats };

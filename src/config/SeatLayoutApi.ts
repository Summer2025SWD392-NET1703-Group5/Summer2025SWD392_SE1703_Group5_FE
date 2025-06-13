import api from "./axios";

// Get seat layout for a specific room
const getSeatLayout = async (roomId: string) => {
  try {
    const response = await api.get(`seat-layouts/room/${roomId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching seat layout:", error);
    throw error;
  }
};

export { getSeatLayout };

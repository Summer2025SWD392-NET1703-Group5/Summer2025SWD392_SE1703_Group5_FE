import api from "./axios";

// Get Cinema Information of current manager
const getCinemaInfo = async () => {
  try {
    const response = await api.get("cinemas/manager/my-cinema");
    return response.data;
  } catch (error) {
    console.error("Error fetching cinema information:", error);
    throw error;
  }
};

const getManagerCinemaRooms = async () => {
  try {
    const response = await api.get("cinemas/manager/my-rooms");
    // Extract rooms array from the nested response structure
    const data = response.data;
    if (data.success && data.data && Array.isArray(data.data.rooms)) {
      return data.data.rooms;
    }
    // Fallback for different response structures
    return Array.isArray(data) ? data : data?.rooms || [];
  } catch (error) {
    console.error("Error fetching cinema rooms:", error);
    throw error;
  }
};

export { getCinemaInfo, getManagerCinemaRooms };

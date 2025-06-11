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

export { getCinemaInfo };

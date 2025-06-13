import api from "./axios";

// Get staff performance report (Admin/Manager only)
const getStaffPerformance = async (startDate: string, endDate: string) => {
  try {
    const queryParams = new URLSearchParams({
      startDate,
      endDate,
    });

    const response = await api.get(`staffPerformance?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching staff performance:", error);
    throw error;
  }
};

// Get staff performance report by staff ID (Admin/Manager only)
const getStaffPerformanceById = async (staffId: string, startDate: string, endDate: string) => {
  try {
    const queryParams = new URLSearchParams({
      startDate,
      endDate,
    });

    const response = await api.get(`staffPerformance/${staffId}?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching staff performance by ID:", error);
    throw error;
  }
};

// Export staff performance report (Admin/Manager only)
const exportStaffPerformance = async (
  startDate: string,
  endDate: string,
  staffId?: string,
  format: string = "excel"
) => {
  try {
    const queryParams = new URLSearchParams({
      startDate,
      endDate,
      format,
    });

    if (staffId) {
      queryParams.append("staffId", staffId);
    }

    const response = await api.get(`staffPerformance/export?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Error exporting staff performance:", error);
    throw error;
  }
};

export { getStaffPerformanceById, getStaffPerformance, exportStaffPerformance };

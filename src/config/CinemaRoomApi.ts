import api from "./axios";

// Get all cinema rooms
const getAllCinemaRooms = async () => {
  try {
    const response = await api.get("cinema-rooms");
    return response.data;
  } catch (error) {
    console.error("Error fetching cinema rooms:", error);
    throw error;
  }
};

// Create new cinema room (Admin/Staff/Manager only)
const createCinemaRoom = async (roomData: any) => {
  try {
    const response = await api.post("cinema-rooms", roomData);
    return response.data;
  } catch (error) {
    console.error("Error creating cinema room:", error);
    throw error;
  }
};

// Get cinema room by ID
const getCinemaRoomById = async (id: string) => {
  try {
    const response = await api.get(`cinema-rooms/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching cinema room with ID ${id}:`, error);
    throw error;
  }
};

// Update cinema room (Admin/Staff/Manager only)
const updateCinemaRoom = async (id: string, roomData: any) => {
  try {
    const response = await api.put(`cinema-rooms/${id}`, roomData);
    return response.data;
  } catch (error) {
    console.error(`Error updating cinema room with ID ${id}:`, error);
    throw error;
  }
};

// Delete cinema room (Admin/Staff/Manager only)
const deleteCinemaRoom = async (id: string) => {
  try {
    const response = await api.delete(`cinema-rooms/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting cinema room with ID ${id}:`, error);
    throw error;
  }
};

// Get cinema rooms by type
const getCinemaRoomsByType = async (roomType: string) => {
  try {
    const response = await api.get(`cinema-rooms/type/${roomType}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching cinema rooms by type ${roomType}:`, error);
    throw error;
  }
};

// Get available cinema rooms for a specific date and time
const getAvailableCinemaRooms = async (date: string, startTime: string, endTime: string) => {
  try {
    const response = await api.get(`cinema-rooms/available`, {
      params: { date, startTime, endTime }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching available cinema rooms for ${date} ${startTime}-${endTime}:`, error);
    throw error;
  }
};

// Search cinema rooms
const searchCinemaRooms = async (searchQuery: string) => {
  try {
    const response = await api.post("cinema-rooms/search", { query: searchQuery });
    return response.data;
  } catch (error) {
    console.error("Error searching cinema rooms:", error);
    throw error;
  }
};

// Get cinema room capacity information
const getCinemaRoomCapacity = async (id: string) => {
  try {
    const response = await api.get(`cinema-rooms/${id}/capacity`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching capacity for cinema room ${id}:`, error);
    throw error;
  }
};

// Get cinema room seating layout
const getCinemaRoomSeating = async (id: string) => {
  try {
    const response = await api.get(`cinema-rooms/${id}/seating`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching seating layout for cinema room ${id}:`, error);
    throw error;
  }
};

// Update cinema room seating layout (Admin/Staff/Manager only)
const updateCinemaRoomSeating = async (id: string, seatingData: any) => {
  try {
    const response = await api.put(`cinema-rooms/${id}/seating`, seatingData);
    return response.data;
  } catch (error) {
    console.error(`Error updating seating layout for cinema room ${id}:`, error);
    throw error;
  }
};

// Get cinema room status
const getCinemaRoomStatus = async (id: string) => {
  try {
    const response = await api.get(`cinema-rooms/${id}/status`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching status for cinema room ${id}:`, error);
    throw error;
  }
};

// Update cinema room status (Admin/Staff/Manager only)
const updateCinemaRoomStatus = async (id: string, status: string) => {
  try {
    const response = await api.put(`cinema-rooms/${id}/status`, { status });
    return response.data;
  } catch (error) {
    console.error(`Error updating status for cinema room ${id}:`, error);
    throw error;
  }
};

// Get cinema room equipment
const getCinemaRoomEquipment = async (id: string) => {
  try {
    const response = await api.get(`cinema-rooms/${id}/equipment`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching equipment for cinema room ${id}:`, error);
    throw error;
  }
};

// Update cinema room equipment (Admin/Staff/Manager only)
const updateCinemaRoomEquipment = async (id: string, equipmentData: any) => {
  try {
    const response = await api.put(`cinema-rooms/${id}/equipment`, equipmentData);
    return response.data;
  } catch (error) {
    console.error(`Error updating equipment for cinema room ${id}:`, error);
    throw error;
  }
};

// Get showtimes for a specific cinema room
const getCinemaRoomShowtimes = async (id: string) => {
  try {
    const response = await api.get(`cinema-rooms/${id}/showtimes`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching showtimes for cinema room ${id}:`, error);
    throw error;
  }
};

// Get cinema room occupancy statistics
const getCinemaRoomOccupancy = async (id: string, startDate: string, endDate: string) => {
  try {
    const response = await api.get(`cinema-rooms/${id}/occupancy`, {
      params: { startDate, endDate }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching occupancy statistics for cinema room ${id}:`, error);
    throw error;
  }
};

// Activate cinema room (Admin/Staff/Manager only)
const activateCinemaRoom = async (id: string) => {
  try {
    const response = await api.post(`cinema-rooms/${id}/activate`);
    return response.data;
  } catch (error) {
    console.error(`Error activating cinema room ${id}:`, error);
    throw error;
  }
};

// Deactivate cinema room (Admin/Staff/Manager only)
const deactivateCinemaRoom = async (id: string) => {
  try {
    const response = await api.post(`cinema-rooms/${id}/deactivate`);
    return response.data;
  } catch (error) {
    console.error(`Error deactivating cinema room ${id}:`, error);
    throw error;
  }
};

// Schedule maintenance for cinema room (Admin/Staff/Manager only)
const scheduleCinemaRoomMaintenance = async (id: string, maintenanceData: any) => {
  try {
    const response = await api.post(`cinema-rooms/${id}/maintenance`, maintenanceData);
    return response.data;
  } catch (error) {
    console.error(`Error scheduling maintenance for cinema room ${id}:`, error);
    throw error;
  }
};

// Get cinema room maintenance schedule
const getCinemaRoomMaintenance = async (id: string) => {
  try {
    const response = await api.get(`cinema-rooms/${id}/maintenance`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching maintenance schedule for cinema room ${id}:`, error);
    throw error;
  }
};

export {
  getAllCinemaRooms,
  createCinemaRoom,
  getCinemaRoomById,
  updateCinemaRoom,
  deleteCinemaRoom,
  getCinemaRoomsByType,
  getAvailableCinemaRooms,
  searchCinemaRooms,
  getCinemaRoomCapacity,
  getCinemaRoomSeating,
  updateCinemaRoomSeating,
  getCinemaRoomStatus,
  updateCinemaRoomStatus,
  getCinemaRoomEquipment,
  updateCinemaRoomEquipment,
  getCinemaRoomShowtimes,
  getCinemaRoomOccupancy,
  activateCinemaRoom,
  deactivateCinemaRoom,
  scheduleCinemaRoomMaintenance,
  getCinemaRoomMaintenance,
};

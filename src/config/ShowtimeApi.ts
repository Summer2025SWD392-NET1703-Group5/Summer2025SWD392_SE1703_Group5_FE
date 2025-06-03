import api from "./axios";

// Get all showtimes
const getAllShowtimes = async () => {
  try {
    const response = await api.get("showtimes");
    return response.data;
  } catch (error) {
    console.error("Error fetching showtimes:", error);
    throw error;
  }
};

// Create new showtime (Admin/Staff only)
const createShowtime = async (showtimeData: any) => {
  try {
    const response = await api.post("showtimes", showtimeData);
    return response.data;
  } catch (error) {
    console.error("Error creating showtime:", error);
    throw error;
  }
};

// Get showtimes for all rooms with movie selection capability
const getShowtimeRooms = async () => {
  try {
    const response = await api.get("showtimes/rooms");
    return response.data;
  } catch (error) {
    console.error("Error fetching showtime rooms:", error);
    throw error;
  }
};

// Hide all showtimes for today (Admin/Staff only)
const hideAllShowtimesToday = async () => {
  try {
    const response = await api.put("showtimes/hide-all-showtimes");
    return response.data;
  } catch (error) {
    console.error("Error hiding all showtimes:", error);
    throw error;
  }
};

// Get showtime by ID
const getShowtimeById = async (id: string) => {
  try {
    const response = await api.get(`showtimes/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching showtime with ID ${id}:`, error);
    throw error;
  }
};

// Update showtime (Admin/Staff only)
const updateShowtime = async (id: string, showtimeData: any) => {
  try {
    const response = await api.put(`showtimes/${id}`, showtimeData);
    return response.data;
  } catch (error) {
    console.error(`Error updating showtime with ID ${id}:`, error);
    throw error;
  }
};

// Delete showtime (Admin/Staff only)
const deleteShowtime = async (id: string) => {
  try {
    const response = await api.delete(`showtimes/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting showtime with ID ${id}:`, error);
    throw error;
  }
};

// Hide expired showtimes
const hideExpiredShowtimes = async () => {
  try {
    const response = await api.post("showtimes/hide-expired");
    return response.data;
  } catch (error) {
    console.error("Error hiding expired showtimes:", error);
    throw error;
  }
};

// Get showtimes by movie ID
const getShowtimesByMovie = async (movieId: string) => {
  try {
    const response = await api.get(`showtimes/movie/${movieId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching showtimes for movie ${movieId}:`, error);
    throw error;
  }
};

// Get showtimes by room ID
const getShowtimesByRoom = async (roomId: string) => {
  try {
    const response = await api.get(`showtimes/room/${roomId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching showtimes for room ${roomId}:`, error);
    throw error;
  }
};

// Get available dates for a movie
const getMovieShowtimeDates = async (movieId: string) => {
  try {
    const response = await api.get(`showtimes/movie/${movieId}/dates`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching showtime dates for movie ${movieId}:`, error);
    throw error;
  }
};

// Get showtimes by movie and date
const getShowtimesByMovieAndDate = async (movieId: string, date: string) => {
  try {
    const response = await api.get(`showtimes/movie/${movieId}/date/${date}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching showtimes for movie ${movieId} on date ${date}:`, error);
    throw error;
  }
};

// Search showtimes
const searchShowtimes = async (searchQuery: string) => {
  try {
    const response = await api.post("showtimes/search", { query: searchQuery });
    return response.data;
  } catch (error) {
    console.error("Error searching showtimes:", error);
    throw error;
  }
};

// Get showtimes by room and date
const getShowtimesByRoomAndDate = async (roomId: string, date: string) => {
  try {
    const response = await api.get(`showtimes/room/${roomId}/date/${date}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching showtimes for room ${roomId} on date ${date}:`, error);
    throw error;
  }
};

// Get admin showtimes by movie (Admin/Staff only)
const getAdminShowtimesByMovie = async (movieId: string) => {
  try {
    const response = await api.get(`showtimes/admin/movie/${movieId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching admin showtimes for movie ${movieId}:`, error);
    throw error;
  }
};

// Create showtime automatically (Admin/Staff only)
const createShowtimeAuto = async (showtimeData: any) => {
  try {
    const response = await api.post("showtimes/create", showtimeData);
    return response.data;
  } catch (error) {
    console.error("Error creating showtime automatically:", error);
    throw error;
  }
};

export {
  getAllShowtimes,
  createShowtime,
  getShowtimeRooms,
  hideAllShowtimesToday,
  getShowtimeById,
  updateShowtime,
  deleteShowtime,
  hideExpiredShowtimes,
  getShowtimesByMovie,
  getShowtimesByRoom,
  getMovieShowtimeDates,
  getShowtimesByMovieAndDate,
  searchShowtimes,
  getShowtimesByRoomAndDate,
  getAdminShowtimesByMovie,
  createShowtimeAuto,
};

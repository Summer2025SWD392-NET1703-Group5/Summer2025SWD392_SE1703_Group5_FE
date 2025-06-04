import api from "./axios";

// Get all movies
const getAllMovies = async () => {
  try {
    const response = await api.get("movies");
    return response.data;
  } catch (error) {
    console.error("Error fetching movies:", error);
    throw error;
  }
};

// Create new movie (Admin/Staff only)
const createMovie = async (movieData: any) => {
  try {
    const response = await api.post("movies", movieData);
    return response.data;
  } catch (error) {
    console.error("Error creating movie:", error);
    throw error;
  }
};

// Get coming soon movies
const getComingSoonMovies = async () => {
  try {
    const response = await api.get("movies/coming-soon");
    return response.data;
  } catch (error) {
    console.error("Error fetching coming soon movies:", error);
    throw error;
  }
};

// Get now showing movies
const getNowShowingMovies = async () => {
  try {
    const response = await api.get("movies/now-showing");
    return response.data;
  } catch (error) {
    console.error("Error fetching now showing movies:", error);
    throw error;
  }
};

// Get movie genres
const getMovieGenres = async () => {
  try {
    const response = await api.get("movies/genres");
    return response.data;
  } catch (error) {
    console.error("Error fetching movie genres:", error);
    throw error;
  }
};

// Search movies
const searchMovies = async (searchQuery: string) => {
  try {
    const response = await api.get(`movies/search?query=${encodeURIComponent(searchQuery)}`);
    return response.data;
  } catch (error) {
    console.error("Error searching movies:", error);
    throw error;
  }
};

// Get movies by genre
const getMoviesByGenre = async (genre: string) => {
  try {
    const response = await api.get(`movies/genre/${encodeURIComponent(genre)}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching movies by genre ${genre}:`, error);
    throw error;
  }
};

// Get movie statistics overview (Admin/Staff only)
const getMovieStatsOverview = async () => {
  try {
    const response = await api.get("movies/stats/overview");
    return response.data;
  } catch (error) {
    console.error("Error fetching movie stats overview:", error);
    throw error;
  }
};

// Get movie by ID
const getMovieById = async (id: string) => {
  try {
    const response = await api.get(`movies/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching movie with ID ${id}:`, error);
    throw error;
  }
};

// Update movie (Admin/Staff only)
const updateMovie = async (id: string, movieData: any) => {
  try {
    const response = await api.put(`movies/${id}`, movieData);
    return response.data;
  } catch (error) {
    console.error(`Error updating movie with ID ${id}:`, error);
    throw error;
  }
};

// Delete movie (Admin/Staff only)
const deleteMovie = async (id: string) => {
  try {
    const response = await api.delete(`movies/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting movie with ID ${id}:`, error);
    throw error;
  }
};

// Get similar movies
const getSimilarMovies = async (id: string) => {
  try {
    const response = await api.get(`movies/${id}/similar`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching similar movies for ID ${id}:`, error);
    throw error;
  }
};

// Rate movie
const rateMovie = async (id: string, ratingData: { rating: number; comment: string }) => {
  try {
    const response = await api.post(`movies/${id}/rate`, ratingData);
    return response.data;
  } catch (error) {
    console.error(`Error rating movie with ID ${id}:`, error);
    throw error;
  }
};

// Get movie showtimes for specific cinema
const getMovieShowtimes = async (movieId: string, cinemaId?: string) => {
  try {
    const endpoint = cinemaId ? `movies/${movieId}/cinemas/${cinemaId}/showtimes` : `movies/${movieId}/showtimes`;
    const response = await api.get(endpoint);
    return response.data;
  } catch (error) {
    console.error(`Error fetching showtimes for movie ${movieId}:`, error);
    throw error;
  }
};

export {
  getAllMovies,
  createMovie,
  getComingSoonMovies,
  getNowShowingMovies,
  getMovieGenres,
  searchMovies,
  getMoviesByGenre,
  getMovieStatsOverview,
  getMovieById,
  updateMovie,
  deleteMovie,
  getSimilarMovies,
  rateMovie,
  getMovieShowtimes,
};

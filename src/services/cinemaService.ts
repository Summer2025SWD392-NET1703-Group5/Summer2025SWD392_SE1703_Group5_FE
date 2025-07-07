import apiClient from './apiClient';
import type { Cinema, CinemaFormData } from '../types/cinema';


interface CinemaResponse {
    success: boolean;
    data: Cinema[];
    message?: string;
}


interface SingleCinemaResponse {
    success: boolean;
    data: Cinema;
    message?: string;
}


interface UserResponse {
    success: boolean;
    data: User[];
    message?: string;
}


interface AssignResponse {
    success: boolean;
    message: string;
}


interface User {
    User_ID: number;
    Name: string;
    Email: string;
    Role: string;
}


interface CinemaDetailsResponse {
    success: boolean;
    data: {
        cinema: Cinema;
        statistics: {
            totalRooms: number;
            totalSeats?: number;
            totalShowtimes?: number;
        };
        staff?: User[];
        manager?: User;
    };
    message?: string;
}


interface Room {
    Room_ID: number;
    Cinema_ID: number;
    Room_Name: string;
    Capacity: number;
    Status: string;
    Room_Type: string;
    Created_At?: string;
    Updated_At?: string;
    Seat_Layout?: any;
}


interface RoomsResponse {
    success: boolean;
    data: Room[];
    message?: string;
}


interface Showtime {
    Showtime_ID: number;
    Movie_ID: number;
    Movie_Name: string;
    Room_ID: number;
    Room_Name: string;
    Start_Time: string;
    End_Time: string;
    Price: number;
    Status: string;
}


interface ShowtimesResponse {
    success: boolean;
    data: Showtime[];
    message?: string;
}


interface Movie {
    Movie_ID: number;
    Movie_Name: string;
    Duration: number;
    Poster_URL: string;
    Genre: string;
    Status: string;
}


interface MoviesResponse {
    success: boolean;
    data: Movie[];
    message?: string;
}


interface SeatInfo {
    total: number;
    available: number;
    booked: number;
    seats: any[];
}


interface SeatInfoResponse {
    success: boolean;
    data: SeatInfo;
    message?: string;
}


class CinemaService {
    /**
     * Get all cinemas
     */
    async getAllCinemas(): Promise<Cinema[]> {
        try {
            const response = await apiClient.get<CinemaResponse>('/cinemas');
            return response.data.data || [];
        } catch (error) {
            console.error('Error fetching cinemas:', error);
            throw error;
        }
    }


    /**
     * Get cinema by ID
     */
    async getCinemaById(id: string | number): Promise<Cinema> {
        try {
            const response = await apiClient.get<SingleCinemaResponse>(`/cinemas/${id}`);
            return response.data.data;
        } catch (error) {
            console.error(`Error fetching cinema with ID ${id}:`, error);
            throw error;
        }
    }


    /**
     * Get showtimes for a cinema by date
     */
    async getCinemaShowtimesByDate(cinemaId: string | number, date: string): Promise<Showtime[]> {
        try {
            const response = await apiClient.get<any>(`/cinemas/${cinemaId}/showtimes`, {
                params: { date }
            });

            if (response.data && response.data.success && response.data.data) {
                const responseData = response.data.data;
                const movies = responseData.movies;

                if (Array.isArray(movies)) {
                    const allShowtimes: any[] = [];

                    movies.forEach((movie: any) => {
                        if (movie.showtimes && Array.isArray(movie.showtimes)) {
                            movie.showtimes.forEach((showtime: any) => {
                                allShowtimes.push({
                                    Showtime_ID: showtime.showtime_id,
                                    Start_Time: showtime.start_time,
                                    End_Time: showtime.end_time,
                                    Room_Name: showtime.room_name,
                                    Capacity_Available: showtime.capacity_available,
                                    Capacity_Total: showtime.capacity_total || 100,
                                    Show_Date: responseData.date,
                                    Status: 'Active',
                                    Movie_ID: movie.movie_id,
                                    Movie_Name: movie.movie_name,
                                    Duration: movie.duration,
                                    Poster_URL: movie.poster_url,
                                    showtime_id: showtime.showtime_id,
                                    start_time: showtime.start_time,
                                    end_time: showtime.end_time,
                                    room_name: showtime.room_name,
                                    room_id: showtime.room_id,
                                    room_type: showtime.room_type,
                                    capacity_available: showtime.capacity_available,
                                    movie_id: movie.movie_id,
                                    movie_name: movie.movie_name,
                                    duration: movie.duration,
                                    poster_url: movie.poster_url,
                                    rating: movie.rating
                                });
                            });
                        }
                    });

                    return allShowtimes;
                }
            }

            return [];
        } catch (error) {
            return [];
        }
    }


    /**
     * Get movies showing at a cinema
     */
    async getMoviesByCinema(cinemaId: string | number): Promise<Movie[]> {
        try {
            const response = await apiClient.get<MoviesResponse>(`/cinemas/${cinemaId}/movies`);

            if (response.data && response.data.success) {
                const movies = response.data.data;
                if (Array.isArray(movies)) {
                    return movies;
                } else if (movies && typeof movies === 'object') {
                    const keys = Object.keys(movies);
                    for (const key of keys) {
                        if (Array.isArray(movies[key])) {
                            return movies[key];
                        }
                    }
                }
            }

            if (Array.isArray(response.data)) {
                return response.data;
            }

            return [];
        } catch (error) {
            return [];
        }
    }


    /**
     * Get seat information for a showtime using seats-info API
     */
    async getSeatInfoByShowtime(showtimeId: string | number): Promise<any> {
        try {
            const response = await apiClient.get<any>(`/showtimes/${showtimeId}/seats-info`);

            if (response.data && response.data.success && response.data.data) {
                const seatsData = response.data.data;

                // Handle the actual API response structure
                if (seatsData.BookedSeats !== undefined && seatsData.TotalSeats !== undefined) {
                    return {
                        summary: {
                            total: seatsData.TotalSeats,
                            available: seatsData.AvailableSeats || (seatsData.TotalSeats - seatsData.BookedSeats),
                            booked: seatsData.BookedSeats,
                            held: 0
                        }
                    };
                }
            }

            return null;
        } catch (error) {
            return null;
        }
    }


    /**
     * Get seat map and availability for a showtime
     */
    async getShowtimeSeats(showtimeId: string | number): Promise<any> {
        // Use the same API endpoint as getSeatInfoByShowtime
        return this.getSeatInfoByShowtime(showtimeId);
    }


    /**
     * Get detailed cinema information including statistics
     */
    async getCinemaDetails(id: string | number): Promise<CinemaDetailsResponse['data']> {
        try {
            const response = await apiClient.get<CinemaDetailsResponse>(`/cinemas/${id}`);
            return response.data.data;
        } catch (error) {
            console.error(`Error fetching details for cinema with ID ${id}:`, error);
            throw error;
        }
    }


    /**
     * Get rooms for a cinema
     */
    async getCinemaRooms(id: string | number): Promise<Room[]> {
        try {
            const response = await apiClient.get<RoomsResponse>(`/cinemas/${id}/rooms`);
            return response.data.data || [];
        } catch (error) {
            console.error(`Error fetching rooms for cinema with ID ${id}:`, error);
            throw error;
        }
    }


    /**
     * Get showtimes for a cinema
     */
    async getCinemaShowtimes(id: string | number): Promise<Showtime[]> {
        try {
            const response = await apiClient.get<ShowtimesResponse>(`/cinemas/${id}/showtimes`);
            return response.data.data || [];
        } catch (error) {
            console.error(`Error fetching showtimes for cinema with ID ${id}:`, error);
            return [];
        }
    }


    /**
     * Get cinemas by city
     */
    async getCinemasByCity(city: string): Promise<Cinema[]> {
        try {
            const response = await apiClient.get<CinemaResponse>(`/cinemas/city/${encodeURIComponent(city)}`);
            return response.data.data || [];
        } catch (error) {
            console.error(`Error fetching cinemas for city ${city}:`, error);
            throw error;
        }
    }


    async createCinema(data: CinemaFormData): Promise<Cinema> {
        const response = await apiClient.post<SingleCinemaResponse>('/cinemas', data);
        return response.data.data;
    }


    async updateCinema(id: number, data: Partial<CinemaFormData>): Promise<Cinema> {
        const response = await apiClient.put<SingleCinemaResponse>(`/cinemas/${id}`, data);
        return response.data.data;
    }


    async deleteCinema(id: number): Promise<{ success: boolean; message: string }> {
        const response = await apiClient.delete<SingleCinemaResponse>(`/cinemas/${id}`);
        return { success: response.data.success, message: response.data.message || 'Xóa thành công' };
    }


    /**
     * Get all managers
     */
    async getAllManagers(): Promise<User[]> {
        try {
            const response = await apiClient.get<UserResponse>('/user/managers');
            return response.data.data || [];
        } catch (error) {
            console.error('Error fetching managers:', error);
            throw error;
        }
    }


    /**
     * Assign manager to a cinema
     */
    async assignManager(cinemaId: number, managerId: number): Promise<{ success: boolean; message: string }> {
        try {
            const response = await apiClient.post<AssignResponse>('/user/managers/assign', {
                cinema_id: cinemaId,
                manager_id: managerId
            });
            return {
                success: response.data.success,
                message: response.data.message || 'Gán quản lý thành công'
            };
        } catch (error) {
            console.error('Error assigning manager:', error);
            throw error;
        }
    }


    /**
     * Get all staff
     */
    async getAllStaff(): Promise<User[]> {
        try {
            const response = await apiClient.get<UserResponse>('/user/staff');
            return response.data.data || [];
        } catch (error) {
            console.error('Error fetching staff:', error);
            throw error;
        }
    }


    /**
     * Assign staff to a cinema
     */
    async assignStaff(cinemaId: number, staffId: number): Promise<{ success: boolean; message: string }> {
        try {
            const response = await apiClient.post<AssignResponse>('/user/staff/assign', {
                cinema_id: cinemaId,
                staff_id: staffId
            });
            return {
                success: response.data.success,
                message: response.data.message || 'Gán nhân viên thành công'
            };
        } catch (error) {
            console.error('Error assigning staff:', error);
            throw error;
        }
    }


    /**
     * Get staff assigned to a specific cinema
     */
    async getCinemaStaff(cinemaId: number): Promise<User[]> {
        try {
            // Sử dụng API /user/staff thay vì /cinemas/{id}/staff vì endpoint cũ không tồn tại
            const response = await apiClient.get<UserResponse>(`/user/staff`);
            
            // Lọc staff theo cinema nếu cần (nếu API trả về thông tin cinema_id)
            let staffList = response.data.data || [];
            
            // Nếu API không filter theo cinema_id, trả về tất cả staff
            // TODO: Có thể cần filter dựa trên Cinema_ID nếu API trả về thông tin này
            return staffList;
        } catch (error) {
            console.error(`Error fetching staff for cinema with ID ${cinemaId}:`, error);
            throw error;
        }
    }


    /**
     * Get manager assigned to a specific cinema
     */
    async getCinemaManager(cinemaId: number): Promise<User | null> {
        try {
            // Thử gọi endpoint cũ trước, nếu lỗi thì fallback sang API khác
            try {
                const response = await apiClient.get<{ success: boolean, data: User, message?: string }>(`/cinemas/${cinemaId}/manager`);
                return response.data.data || null;
            } catch (originalError) {
                // Fallback: Lấy tất cả managers và tìm theo cinema_id
                console.log(`Endpoint /cinemas/${cinemaId}/manager không tồn tại, fallback sang /user/managers`);
                const managersResponse = await apiClient.get<UserResponse>(`/user/managers`);
                const managers = managersResponse.data.data || [];
                
                // TODO: Filter manager theo cinema_id nếu có thông tin này trong API response
                // Hiện tại trả về manager đầu tiên hoặc null
                return managers.length > 0 ? managers[0] : null;
            }
        } catch (error) {
            console.error(`Error fetching manager for cinema with ID ${cinemaId}:`, error);
            return null;
        }
    }


    /**
     * Get cinema by manager email
     */
    async getCinemaByManagerEmail(email: string): Promise<Cinema | null> {
        try {
            // Lấy tất cả cinemas
            const allCinemas = await this.getAllCinemas();


            // Tìm cinema có email manager khớp
            for (const cinema of allCinemas) {
                if (cinema.Email === email) {
                    return cinema;
                }
            }


            return null;
        } catch (error) {
            console.error(`Error fetching cinema for manager email ${email}:`, error);
            throw error;
        }
    }


    /**
     * Lấy thông tin rạp mà Manager được phân công
     */
    async getManagerCinema(): Promise<Cinema> {
        try {
            // Gọi API để lấy thông tin rạp dựa trên Manager hiện tại
            console.log('Gọi API lấy thông tin rạp của manager');
            const response = await apiClient.get<any>('/cinemas/manager/my-cinema');
            
            if (response.data && response.data.success && response.data.data) {
                return response.data.data;
            } else if (response.data && !response.data.success) {
                throw new Error(response.data.message || 'Không tìm thấy rạp được phân công');
            } else if (response.data) {
                // Trường hợp API trả về trực tiếp đối tượng Cinema
                return response.data;
            }
            
            throw new Error('Không tìm thấy rạp được phân công');
        } catch (error) {
            console.error('Error fetching manager cinema:', error);
            throw error;
        }
    }

    /**
     * Get all active cinemas
     */
    async getActiveCinemas(): Promise<Cinema[]> {
        try {
            const response = await apiClient.get<CinemaResponse>('/cinemas/active');
            return response.data.data || [];
        } catch (error) {
            console.error('Error fetching active cinemas:', error);
            // Fallback to all cinemas if active endpoint doesn't exist
            return this.getAllCinemas();
        }
    }

    /**
     * Get all cities that have cinemas
     */
    async getCities(): Promise<string[]> {
        try {
            const response = await apiClient.get<{ success: boolean; data: string[]; message?: string }>('/cinemas/cities');
            return response.data.data || [];
        } catch (error) {
            console.error('Error fetching cinema cities:', error);
            // Fallback: extract cities from all cinemas
            try {
                const allCinemas = await this.getAllCinemas();
                const cities = [...new Set(allCinemas.map(cinema => cinema.City).filter(Boolean))];
                return cities;
            } catch (fallbackError) {
                console.error('Error in fallback cities extraction:', fallbackError);
                return [];
            }
        }
    }
}


export const cinemaService = new CinemaService();
export default cinemaService;


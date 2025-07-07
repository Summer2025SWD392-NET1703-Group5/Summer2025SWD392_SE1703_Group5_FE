import api from '../config/api';


interface Cinema {
    id: number;
    name: string;
    address: string;
    city?: string;
    phone?: string;
    email?: string;
    description?: string;
    status?: string;
}


interface CinemaRoom {
    id: number;
    cinemaId: number;
    name: string;
    capacity: number;
    roomType: string;
    status: string;
}


interface Movie {
    id: number;
    title: string;
    poster: string;
    duration: number;
    genre: string;
    rating: string;
    releaseDate: string;
    director?: string;
    cast?: string;
    synopsis?: string;
    language?: string;
    country?: string;
    status?: string;
}


interface Showtime {
    id: number;
    movieId: number;
    cinemaId: number;
    roomId: number;
    startTime: string;
    endTime: string;
    showDate: string;
    availableSeats: number;
    totalSeats: number;
    status: string;
}


// Helper function to map API response to our interface
const mapCinemaFromAPI = (cinema: any): Cinema => ({
    id: cinema.Cinema_ID,
    name: cinema.Cinema_Name,
    address: cinema.Address,
    city: cinema.City,
    phone: cinema.Phone_Number,
    email: cinema.Email,
    description: cinema.Description,
    status: cinema.Status
});


const mapMovieFromAPI = (movie: any): Movie => ({
    id: movie.Movie_ID,
    title: movie.Movie_Name,
    poster: movie.Poster_URL,
    duration: movie.Duration,
    genre: movie.Genre,
    rating: movie.Rating,
    releaseDate: movie.Release_Date,
    director: movie.Director,
    cast: movie.Cast,
    synopsis: movie.Synopsis,
    language: movie.Language,
    country: movie.Country,
    status: movie.Status
});


const mapCinemaRoomFromAPI = (room: any): CinemaRoom => ({
    id: room.Cinema_Room_ID || room.Room_ID,
    cinemaId: room.Cinema_ID,
    name: room.Room_Name,
    capacity: room.Seat_Quantity || room.Capacity || 100,
    roomType: room.Room_Type || '2D',
    status: room.Status || 'Active'
});


const mapShowtimeFromAPI = (showtime: any): Showtime => ({
    id: showtime.Showtime_ID || showtime.showtime_id,
    movieId: showtime.Movie_ID || showtime.movie_id,
    cinemaId: showtime.Cinema_ID || showtime.cinema_id,
    roomId: showtime.Cinema_Room_ID || showtime.Room_ID || showtime.room_id,
    startTime: showtime.Start_Time || showtime.start_time,
    endTime: showtime.End_Time || showtime.end_time,
    showDate: showtime.Show_Date || showtime.date,
    availableSeats: showtime.Available_Seats || showtime.capacity_available || 50,
    totalSeats: showtime.Total_Seats || showtime.total_seats || 100,
    status: showtime.Status || 'Active'
});


export const showtimesPageService = {
    // Lấy thông tin rạp chiếu
    async getCinemaById(cinemaId: string | number): Promise<Cinema> {
        try {
            console.log(`Fetching cinema details for ID: ${cinemaId}`);
            const response = await api.get(`/cinemas/${cinemaId}`);
            const data = response.data.data || response.data;
            console.log('Cinema data received:', data);
            return mapCinemaFromAPI(data);
        } catch (error) {
            console.error('Error fetching cinema:', error);
            // Ẩn lỗi hoàn toàn
            return {
                id: Number(cinemaId),
                name: `Rạp ${cinemaId}`,
                address: 'Đang cập nhật',
                city: 'Đang cập nhật'
            };
        }
    },


    // Lấy danh sách tất cả rạp
    async getAllCinemas(): Promise<Cinema[]> {
        try {
            console.log('Fetching all cinemas...');
            const response = await api.get('/cinemas');
            const cinemas = response.data.data || response.data || [];
            console.log('Cinemas received:', cinemas);
            return cinemas.map(mapCinemaFromAPI);
        } catch (error) {
            console.error('Error fetching cinemas:', error);
            // Ẩn lỗi, trả về mảng rỗng
            return [];
        }
    },


    // Lấy thông tin phòng chiếu
    async getCinemaRoomById(roomId: string | number): Promise<CinemaRoom> {
        try {
            console.log(`Fetching room details for ID: ${roomId}`);
            // Tạm thời sử dụng fallback data vì API cinema-rooms có thể chưa sẵn sàng
            return {
                id: Number(roomId),
                cinemaId: 1,
                name: `Phòng ${roomId}`,
                capacity: 100,
                roomType: '2D',
                status: 'Active'
            };
        } catch (error) {
            console.error('Error fetching cinema room:', error);
            // Return fallback data
            return {
                id: Number(roomId),
                cinemaId: 1,
                name: `Phòng ${roomId}`,
                capacity: 100,
                roomType: '2D',
                status: 'Active'
            };
        }
    },


    // Lấy danh sách phòng chiếu của một rạp
    async getCinemaRooms(cinemaId: string | number): Promise<CinemaRoom[]> {
        try {
            console.log(`Fetching rooms for cinema ID: ${cinemaId}`);
            const response = await api.get(`/cinemas/${cinemaId}/rooms`);
            const rooms = response.data.data || response.data || [];
            console.log('Cinema rooms received:', rooms);
            return rooms.map(mapCinemaRoomFromAPI);
        } catch (error) {
            console.error('Error fetching cinema rooms:', error);
            // Ẩn lỗi hoàn toàn
            return [];
        }
    },


    // Lấy thông tin chi tiết phim
    async getMovieById(movieId: string | number): Promise<Movie> {
        try {
            console.log(`Fetching movie details for ID: ${movieId}`);
            const response = await api.get(`/movies/${movieId}`);
            const data = response.data.data || response.data;
            console.log('Movie data received:', data);
            return mapMovieFromAPI(data);
        } catch (error) {
            console.error('Error fetching movie:', error);
            // Ẩn lỗi hoàn toàn
            return {
                id: Number(movieId),
                title: `Phim ${movieId}`,
                poster: '',
                duration: 90,
                genre: 'Đang cập nhật',
                rating: 'P',
                releaseDate: new Date().toISOString().split('T')[0]
            };
        }
    },


    // Lấy danh sách tất cả phim
    async getAllMovies(): Promise<Movie[]> {
        try {
            console.log('Fetching all movies...');
            const response = await api.get('/movies');
            const movies = response.data.data || response.data || [];
            console.log('Movies received:', movies);
            return movies.map(mapMovieFromAPI);
        } catch (error) {
            console.error('Error fetching movies:', error);
            // Ẩn lỗi, trả về mảng rỗng
            return [];
        }
    },


    // Lấy danh sách phim đang chiếu
    async getNowShowingMovies(): Promise<Movie[]> {
        try {
            console.log('Fetching now showing movies...');
            const response = await api.get('/movies/now-showing');
            const movies = response.data.data || response.data || [];
            console.log('Now showing movies received:', movies);
            return movies.map(mapMovieFromAPI);
        } catch (error) {
            console.error('Error fetching now showing movies:', error);
            // Ẩn lỗi, trả về mảng rỗng
            return [];
        }
    },


    // Lấy danh sách phim đang chiếu tại rạp cụ thể
    async getMoviesByCinema(cinemaId: string | number): Promise<Movie[]> {
        try {
            console.log(`Fetching movies for cinema ID: ${cinemaId}`);
            const response = await api.get(`/cinemas/${cinemaId}/movies`);
            const movies = response.data.data || response.data || [];
            console.log('Movies at cinema received:', movies);
            return movies.map(mapMovieFromAPI);
        } catch (error) {
            console.error('Error fetching movies by cinema:', error);
            // Ẩn lỗi hoàn toàn
            return [];
        }
    },


    // Lấy danh sách suất chiếu của một phim tại một rạp cụ thể
    async getMovieShowtimesAtCinema(movieId: string | number, cinemaId: string | number): Promise<Showtime[]> {
        try {
            console.log(`Fetching showtimes for movie ${movieId} at cinema ${cinemaId}`);
            const response = await api.get(`/movies/${movieId}/cinemas/${cinemaId}/showtimes`);
            const showtimes = response.data.data || response.data || [];
            console.log('Movie showtimes at cinema received:', showtimes);
            return showtimes.map(mapShowtimeFromAPI);
        } catch (error) {
            console.error('Error fetching movie showtimes at cinema:', error);
            // Ẩn lỗi hoàn toàn
            return [];
        }
    },


    // Lấy suất chiếu của rạp theo ngày (API chính mà chúng ta sẽ sử dụng)
    async getCinemaShowtimesByDate(cinemaId: string | number, date?: string): Promise<any> {
        try {
            const queryDate = date || new Date().toISOString().split('T')[0];
            console.log(`Fetching showtimes for cinema ${cinemaId} on date ${queryDate}`);

            const response = await api.get(`/cinemas/${cinemaId}/showtimes`, {
                params: { date: queryDate }
            });

            const data = response.data.data || response.data;
            console.log('Cinema showtimes received:', data);
            return data;
        } catch (error) {
            console.error('Error fetching cinema showtimes by date:', error);
            // Ẩn lỗi hoàn toàn
            return null;
        }
    },


    // Lấy tất cả suất chiếu - sử dụng API mới
    async getAllShowtimes(filters?: {
        date?: string;
        cinemaId?: number;
        movieId?: number;
        roomType?: string;
        timeSlot?: string;
    }): Promise<Showtime[]> {
        try {
            const queryDate = filters?.date || new Date().toISOString().split('T')[0];
            console.log('Fetching all showtimes with filters:', filters);

            // Nếu có cinemaId, sử dụng API cinema-specific
            if (filters?.cinemaId) {
                const cinemaShowtimes = await this.getCinemaShowtimesByDate(filters.cinemaId, queryDate);

                // Chuyển đổi dữ liệu từ API response
                const allShowtimes: Showtime[] = [];

                if (cinemaShowtimes && cinemaShowtimes.movies) {
                    cinemaShowtimes.movies.forEach((movie: any) => {
                        movie.showtimes.forEach((showtime: any) => {
                            allShowtimes.push({
                                id: showtime.showtime_id,
                                movieId: movie.movie_id,
                                cinemaId: cinemaShowtimes.cinema_id,
                                roomId: showtime.room_id,
                                startTime: showtime.start_time,
                                endTime: showtime.end_time,
                                showDate: cinemaShowtimes.date,
                                availableSeats: showtime.capacity_available || 50,
                                totalSeats: 100,
                                status: 'Active'
                            });
                        });
                    });
                }

                return allShowtimes;
            }

            // Nếu không có cinemaId, lấy tất cả rạp và suất chiếu
            const cinemas = await this.getAllCinemas();
            const allShowtimes: Showtime[] = [];

            // Lấy suất chiếu từ tất cả rạp
            const showtimePromises = cinemas.map(async (cinema) => {
                try {
                    const cinemaShowtimes = await this.getCinemaShowtimesByDate(cinema.id, queryDate);

                    if (cinemaShowtimes && cinemaShowtimes.movies) {
                        cinemaShowtimes.movies.forEach((movie: any) => {
                            movie.showtimes.forEach((showtime: any) => {
                                allShowtimes.push({
                                    id: showtime.showtime_id,
                                    movieId: movie.movie_id,
                                    cinemaId: cinema.id,
                                    roomId: showtime.room_id,
                                    startTime: showtime.start_time,
                                    endTime: showtime.end_time,
                                    showDate: cinemaShowtimes.date,
                                    availableSeats: showtime.capacity_available || 50,
                                    totalSeats: 100,
                                    status: 'Active'
                                });
                            });
                        });
                    }
                } catch (error) {
                    console.error(`Error fetching showtimes for cinema ${cinema.id}:`, error);
                }
            });

            await Promise.all(showtimePromises);

            // Áp dụng các filter khác
            let filteredShowtimes = allShowtimes;

            if (filters?.movieId) {
                filteredShowtimes = filteredShowtimes.filter(s => s.movieId === filters.movieId);
            }

            if (filters?.roomType && filters.roomType !== 'all') {
                // Lọc theo roomType (cần thêm logic sau khi có thông tin room)
            }

            if (filters?.timeSlot && filters.timeSlot !== 'all') {
                filteredShowtimes = filteredShowtimes.filter(s => {
                    const hour = parseInt(s.startTime.split(':')[0]);
                    switch (filters.timeSlot) {
                        case 'morning': return hour >= 6 && hour < 12;
                        case 'afternoon': return hour >= 12 && hour < 18;
                        case 'evening': return hour >= 18 && hour < 24;
                        case 'late': return hour >= 0 && hour < 6;
                        default: return true;
                    }
                });
            }

            console.log('Filtered showtimes:', filteredShowtimes);
            return filteredShowtimes;

        } catch (error) {
            console.error('Error fetching showtimes:', error);
            // Return empty array instead of throwing to prevent UI crash
            return [];
        }
    },


    // Lấy suất chiếu theo ngày
    async getShowtimesByDate(date: string): Promise<Showtime[]> {
        try {
            return await this.getAllShowtimes({ date });
        } catch (error) {
            console.error('Error fetching showtimes by date:', error);
            return [];
        }
    },


    // Lấy suất chiếu theo rạp
    async getShowtimesByCinema(cinemaId: string | number): Promise<Showtime[]> {
        try {
            return await this.getAllShowtimes({ cinemaId: Number(cinemaId) });
        } catch (error) {
            return [];
        }
    },


    // Lấy suất chiếu theo phim
    async getShowtimesByMovie(movieId: string | number): Promise<Showtime[]> {
        try {
            return await this.getAllShowtimes({ movieId: Number(movieId) });
        } catch (error) {
            return [];
        }
    },


    // Lấy thông tin ghế đã chọn trong suất chiếu
    async getShowtimeSeatsInfo(showtimeId: string | number): Promise<any> {
        try {
            console.log(`Fetching seats info for showtime ID: ${showtimeId}`);
            const response = await api.get(`/showtimes/${showtimeId}/seats-info`);
            const data = response.data.data || response.data;
            console.log('Showtime seats info received:', data);
            return data;
        } catch (error) {
            console.error('Error fetching showtime seats info:', error);
            return null;
        }
    }
};


export default showtimesPageService;




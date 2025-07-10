import api from '../config/api';
import type { Movie, MovieFormData, MovieResponse } from '../types/movie';

// API Configuration

// Helper để chuyển đổi key từ snake_case và PascalCase sang camelCase
const toCamel = (s: string): string => {
    const cameled = s.replace(/([-_][a-z])/ig, ($1) => {
        return $1.toUpperCase()
            .replace('-', '')
            .replace('_', '');
    });
    // Xử lý trường hợp PascalCase không có dấu gạch dưới (ví dụ: MovieID -> movieID)
    return cameled.charAt(0).toLowerCase() + cameled.slice(1);
};

const keysToCamel = (o: any): any => {
    if (Array.isArray(o)) {
        return o.map(v => keysToCamel(v));
    } else if (o !== null && typeof o === 'object') {
        const camelCaseObj = Object.keys(o).reduce((acc, key) => {
            let camelKey = toCamel(key);

            // Xử lý các trường hợp đặc biệt để phù hợp với interface Movie
            if (camelKey === 'movieId' || camelKey === 'movieID') camelKey = 'id';
            if (camelKey === 'movieName') camelKey = 'title';
            if (camelKey === 'posterUrl' || camelKey === 'posterURL') camelKey = 'poster';

            // Xử lý các trường khác từ API
            if (key === 'Poster_URL') camelKey = 'poster';
            if (key === 'Movie_ID') camelKey = 'id';
            if (key === 'Movie_Name') camelKey = 'title';
            if (key === 'Cast') camelKey = 'cast';
            if (key === 'Director') camelKey = 'director';
            if (key === 'Duration') camelKey = 'duration';
            if (key === 'Release_Date') camelKey = 'releaseDate';
            if (key === 'Premiere_Date') camelKey = 'premiereDate';
            if (key === 'End_Date') camelKey = 'endDate';
            if (key === 'Genre') camelKey = 'genre';
            if (key === 'Rating') camelKey = 'rating';
            if (key === 'Language') camelKey = 'language';
            if (key === 'Country') camelKey = 'country';
            if (key === 'Synopsis') camelKey = 'synopsis';
            if (key === 'Trailer_Link') camelKey = 'trailerLink';
            if (key === 'Status') camelKey = 'status';
            if (key === 'Created_At') camelKey = 'createdAt';
            if (key === 'Updated_At') camelKey = 'updatedAt';
            if (key === 'MovieRatings') camelKey = 'movieRatings';
            if (key === 'User_ID') camelKey = 'userID';

            // Xử lý Rating_Summary
            if (key === 'Rating_Summary') {
                acc['ratingAverage'] = o[key]?.Average_Rating || 0;
                acc['ratingCount'] = o[key]?.Rating_Count || 0;
                acc['ratingDistribution'] = o[key]?.Rating_Distribution || [];
                // Không thêm Rating_Summary vào đối tượng kết quả
                return acc;
            }

            acc[camelKey] = keysToCamel(o[key]);
            return acc;
        }, {} as any);

        return camelCaseObj;
    }
    return o;
};

// Helper để kiểm tra nếu response là HTML thay vì JSON
const isHtmlResponse = (data: any): boolean => {
    if (typeof data === 'string' &&
        (data.trim().startsWith('<!doctype html>') ||
            data.trim().startsWith('<html') ||
            data.trim().startsWith('<?xml'))) {
        return true;
    }
    return false;
};

// Directly return the API response format for admin pages
const processApiResponse = (response: any): any[] => {
    if (!response) return [];

    if (Array.isArray(response)) {
        return response;
    }

    if (response.data && Array.isArray(response.data)) {
        return response.data;
    }

    if (response.results && Array.isArray(response.results)) {
        return response.results;
    }

    if (response.movies && Array.isArray(response.movies)) {
        return response.movies;
    }

    return [];
};

export const movieService = {
    /**
     * Lấy danh sách tất cả phim.
     */
    async getMovies(): Promise<any[]> {
        // Các endpoint khác nhau để thử, sẽ thử lần lượt cho đến khi thành công
        const endpoints = [
            '/movies',
            '/movies/all',
            '/movie'
        ];

        // Thử từng endpoint cho đến khi thành công
        for (const endpoint of endpoints) {
            try {
                const response = await api.get(endpoint);

                // Kiểm tra nếu response là HTML thay vì JSON
                if (isHtmlResponse(response.data)) {
                    continue; // Thử endpoint tiếp theo
                }

                // Process and return the API response directly for admin pages
                const movies = processApiResponse(response.data);
                return movies;
            } catch (error) {
                // Tiếp tục với endpoint tiếp theo
                console.error(`movieService.getMovies - Error fetching from ${endpoint}:`, error);
            }
        }

        // Nếu tất cả các endpoint đều thất bại, trả về mảng rỗng
        throw new Error('Unable to fetch movies from any endpoint');
    },

    /**
     * Lấy danh sách tất cả phim (alias cho getMovies).
     */
    async getAllMovies(): Promise<MovieResponse[]> {
        return this.getMovies();
    },

    /**
     * Lấy thông tin chi tiết của một phim theo ID.
     */
    async getMovieById(id: string | number): Promise<any> {
        try {
            // Thử gọi API với đường dẫn /movies/{id} trước
            try {
                console.log(`movieService.getMovieById - Calling /movies/${id}`);
                const response = await api.get(`/movies/${id}`);
                console.log(`movieService.getMovieById - Response data:`, response.data);
                
                if (response.data && response.data.Ratings) {
                    console.log(`movieService.getMovieById - Found Ratings:`, response.data.Ratings);
                }
                
                return response.data;
            } catch (apiError) {
                console.log(`movieService.getMovieById - First API failed, trying /movie/${id}`);
                // Nếu không thành công, thử với đường dẫn /movie/{id}
                const fallbackResponse = await api.get(`/movie/${id}`);
                console.log(`movieService.getMovieById - Fallback response data:`, fallbackResponse.data);
                
                if (fallbackResponse.data && fallbackResponse.data.Ratings) {
                    console.log(`movieService.getMovieById - Found Ratings in fallback:`, fallbackResponse.data.Ratings);
                }
                
                return fallbackResponse.data;
            }
        } catch (error) {
            console.error(`movieService.getMovieById - Error fetching movie ${id}:`, error);
            throw error;
        }
    },

    /**
     * Lấy thông tin chi tiết của một phim theo ID từ API backend.
     * Hàm này sẽ thử các đường dẫn API khác nhau để lấy thông tin phim.
     */
    async fetchMovieDetails(id: string | number): Promise<any> {
        try {
            // Check if ID is numeric before making API calls
            if (!/^\d+$/.test(id.toString())) {
                throw new Error('Movie ID must be numeric for API calls');
            }

            // Thử các đường dẫn API khác nhau
            const endpoints = [
                `/movies/${id}`,
                `/movie/${id}`
            ];

            for (const endpoint of endpoints) {
                try {
                    const response = await api.get(endpoint);

                    if (response.data) {
                        return response.data;
                    }
                } catch (endpointError) {
                    // Tiếp tục thử endpoint tiếp theo
                }
            }

            throw new Error(`Could not fetch movie with ID ${id} from any endpoint`);
        } catch (error) {
            throw error;
        }
    },

    /**
     * Thêm phim mới vào hệ thống.
     * @param data Dữ liệu phim cần thêm
     * @returns Promise với dữ liệu phim đã được thêm
     */
    async addMovie(data: any): Promise<any> {
        try {
            const response = await api.post('/movies', data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Thêm nhiều phim cùng lúc (bulk add).
     * @param movies Mảng các phim cần thêm
     * @returns Promise với kết quả thêm phim
     */
    async bulkAddMovies(movies: any[]): Promise<any> {
        // Backend hiện tại không hỗ trợ bulk add, nên thêm từng phim
        const results = [];
        const errors = [];

        for (const movie of movies) {
            try {
                const result = await this.addMovie(movie);
                results.push(result);
            } catch (error: any) {
                errors.push({
                    movie: movie.Movie_Name,
                    error: error.response?.data || error.message
                });
            }
        }

        // Throw error if all failed
        if (results.length === 0 && errors.length > 0) {
            throw new Error(`All movies failed to import. Errors: ${JSON.stringify(errors)}`);
        }

        return { results, errors };
    },

    /**
     * Tạo một phim mới.
     * Dữ liệu được gửi dưới dạng multipart/form-data.
     */
    async createMovie(data: MovieFormData): Promise<any> {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                if (key === 'posterFile' && value instanceof File) {
                    formData.append(key, value);
                } else if (value instanceof File) {
                    // Bỏ qua các file khác không phải posterFile
                }
                else {
                    formData.append(key, String(value));
                }
            }
        });

        try {
            const response = await api.post('/movies', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Cập nhật thông tin phim.
     * Dữ liệu được gửi dưới dạng multipart/form-data.
     */
    async updateMovie(id: string | number, data: MovieFormData): Promise<any> {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                if (key === 'posterFile' && value instanceof File) {
                    formData.append(key, value);
                } else if (value instanceof File) {
                    // Bỏ qua các file khác không phải posterFile
                }
                else {
                    formData.append(key, String(value));
                }
            }
        });

        try {
            const response = await api.put(`/movies/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Xóa phim.
     */
    async deleteMovie(id: string | number): Promise<void> {
        try {
            await api.delete(`/movies/${id}`);
        } catch (error) {
            throw error;
        }
    },

    /**
     * Lấy danh sách phim đang chiếu.
     */
    async getNowShowingMovies(): Promise<Movie[]> {
        // Các endpoint khác nhau để thử, sẽ thử lần lượt cho đến khi thành công
        const endpoints = [
            '/movies/now-showing',
            '/movies?status=now-showing',
            '/movies/status/now-showing'
        ];

        // Thử từng endpoint cho đến khi thành công
        for (const endpoint of endpoints) {
            try {
                const response = await api.get(endpoint);

                // Kiểm tra nếu response là HTML thay vì JSON
                if (isHtmlResponse(response.data)) {
                    continue; // Thử endpoint tiếp theo
                }

                // Xử lý dữ liệu trả về
                const nowShowingMovies = Array.isArray(response.data)
                    ? response.data.map(keysToCamel)
                    : Array.isArray(response.data.data)
                        ? response.data.data.map(keysToCamel)
                        : [];

                return nowShowingMovies;
            } catch (error) {
                // Tiếp tục với endpoint tiếp theo
                console.error(`movieService.getNowShowingMovies - Error fetching from ${endpoint}:`, error);
            }
        }

        // Nếu tất cả các endpoint đều thất bại, trả về mảng rỗng
        throw new Error('Unable to fetch now showing movies from any endpoint');
    },

    /**
     * Lấy danh sách phim sắp chiếu.
     */
    async getComingSoonMovies(): Promise<Movie[]> {
        // Các endpoint khác nhau để thử, sẽ thử lần lượt cho đến khi thành công
        const endpoints = [
            '/movies/coming-soon',
            '/movies?status=coming-soon',
            '/movies/status/coming-soon'
        ];

        // Thử từng endpoint cho đến khi thành công
        for (const endpoint of endpoints) {
            try {
                const response = await api.get(endpoint);

                // Kiểm tra nếu response là HTML thay vì JSON
                if (isHtmlResponse(response.data)) {
                    continue; // Thử endpoint tiếp theo
                }

                // Xử lý dữ liệu trả về
                const comingSoonMovies = Array.isArray(response.data)
                    ? response.data.map(keysToCamel)
                    : Array.isArray(response.data.data)
                        ? response.data.data.map(keysToCamel)
                        : [];

                return comingSoonMovies;
            } catch (error) {
                // Tiếp tục với endpoint tiếp theo
                console.error(`movieService.getComingSoonMovies - Error fetching from ${endpoint}:`, error);
            }
        }

        // Nếu tất cả các endpoint đều thất bại, trả về mảng rỗng
        throw new Error('Unable to fetch coming soon movies from any endpoint');
    },

    /**
     * Lấy danh sách suất chiếu của một phim cụ thể.
     */
    async getMovieShowtimes(movieId: string | number): Promise<any[]> {
        try {
            const response = await api.get(`/movies/${movieId}/showtimes`);

            if (response.data) {
                // Handle the new API structure
                if (response.data.success && response.data.data) {
                    const data = response.data.data;

                    // Flatten the showtimes from all cinemas and dates
                    const allShowtimes: any[] = [];
                    if (data.Cinemas && Array.isArray(data.Cinemas)) {
                        data.Cinemas.forEach((cinema: any) => {
                            if (cinema.ShowtimesByDate && Array.isArray(cinema.ShowtimesByDate)) {
                                cinema.ShowtimesByDate.forEach((dateGroup: any) => {
                                    if (dateGroup.Showtimes && Array.isArray(dateGroup.Showtimes)) {
                                        dateGroup.Showtimes.forEach((showtime: any) => {
                                            allShowtimes.push({
                                                ...showtime,
                                                Show_Date: dateGroup.Show_Date,
                                                Cinema_ID: cinema.Cinema_ID,
                                                Cinema_Name: cinema.Cinema_Name
                                            });
                                        });
                                    }
                                });
                            }
                        });
                    }
                    return allShowtimes;
                }
                // Handle old API structure
                else if (Array.isArray(response.data)) {
                    return response.data;
                }
                else if (Array.isArray(response.data.data)) {
                    return response.data.data;
                }
            }

            return [];
        } catch (error) {
            return [];
        }
    },

    /**
     * Lấy danh sách rạp chiếu một phim cụ thể.
     */
    async getMovieCinemas(movieId: string | number): Promise<any[]> {
        try {
            const response = await api.get(`/movies/${movieId}/cinemas`);

            if (response.data) {
                // Handle the new API structure
                if (response.data.success && response.data.data && response.data.data.Cinemas) {
                    return response.data.data.Cinemas;
                }
                // Handle old API structure
                else if (Array.isArray(response.data)) {
                    return response.data;
                }
                else if (Array.isArray(response.data.data)) {
                    return response.data.data;
                }
            }

            return [];
        } catch (error) {
            return [];
        }
    },

    /**
     * Lấy danh sách suất chiếu của một phim tại một rạp cụ thể.
     */
    async getMovieCinemaShowtimes(movieId: string | number, cinemaId: string | number): Promise<any[]> {
        try {
            const response = await api.get(`/movies/${movieId}/cinemas/${cinemaId}/showtimes`);

            if (response.data) {
                // Handle the new API structure
                if (response.data.success && response.data.data) {
                    const data = response.data.data;

                    // Flatten the showtimes from all dates
                    const allShowtimes: any[] = [];
                    if (data.ShowtimesByDate && Array.isArray(data.ShowtimesByDate)) {
                        data.ShowtimesByDate.forEach((dateGroup: any) => {
                            if (dateGroup.Showtimes && Array.isArray(dateGroup.Showtimes)) {
                                dateGroup.Showtimes.forEach((showtime: any) => {
                                    allShowtimes.push({
                                        ...showtime,
                                        Show_Date: dateGroup.Show_Date,
                                        Cinema_ID: data.Cinema_ID,
                                        Cinema_Name: data.Cinema_Name,
                                        Movie_ID: data.Movie_ID,
                                        Movie_Name: data.Movie_Name
                                    });
                                });
                            }
                        });
                    }
                    return allShowtimes;
                }
                // Handle old API structure
                else if (Array.isArray(response.data)) {
                    return response.data;
                }
                else if (Array.isArray(response.data.data)) {
                    return response.data.data;
                }
            }

            return [];
        } catch (error) {
            return [];
        }
    },

    /**
     * Lấy danh sách tất cả thể loại phim
     */
    async getGenres(): Promise<string[]> {
        try {
            // Thử gọi API để lấy danh sách genres
            const response = await api.get('/movies/genres');
            
            if (response.data) {
                // Xử lý response từ API
                if (response.data.success && response.data.data) {
                    return response.data.data;
                } else if (Array.isArray(response.data)) {
                    return response.data;
                } else if (response.data.genres && Array.isArray(response.data.genres)) {
                    return response.data.genres;
                }
            }
            
            throw new Error('Invalid genres response format');
        } catch (error) {
            console.error('Error fetching genres from API:', error);
            
            // Fallback: Extract genres từ tất cả phim
            try {
                const allMovies = await this.getMovies();
                const genreSet = new Set<string>();
                
                allMovies.forEach(movie => {
                    const movieGenre = movie.Genre || movie.genre;
                    if (movieGenre) {
                        // Split by comma if multiple genres
                        const genres = movieGenre.split(',').map((g: string) => g.trim());
                        genres.forEach((genre: string) => {
                            if (genre) genreSet.add(genre);
                        });
                    }
                });
                
                return Array.from(genreSet).slice(0, 10); // Limit to 10 genres
            } catch (fallbackError) {
                console.error('Error in fallback genres extraction:', fallbackError);
                
                // Final fallback: Return default genres
                return [
                    'Hành Động',
                    'Kinh Dị', 
                    'Hài Hước',
                    'Lãng Mạn',
                    'Khoa Học Viễn Tưởng',
                    'Phiêu Lưu',
                    'Hoạt Hình',
                    'Tâm Lý',
                    'Thể Thao',
                    'Gia Đình'
                ];
            }
        }
    },

    /**
     * Đánh giá phim
     * @param movieId ID của phim cần đánh giá
     * @param rating Điểm đánh giá (1-5 hoặc 1-10)
     * @param comment Bình luận đánh giá
     * @returns Promise với kết quả đánh giá
     */
    async rateMovie(movieId: string | number, rating: number, comment: string): Promise<{ success: boolean; message: string; data?: any }> {
        try {
            console.log(`Đánh giá phim ID ${movieId}: ${rating} sao, bình luận: ${comment}`);
            
            const requestData = {
                Rating: rating,
                Comment: comment
            };

            const response = await api.post(`/movies/${movieId}/rate`, requestData);
            
            console.log('Kết quả đánh giá phim:', response.data);
            
            if (response.data) {
                return {
                    success: true,
                    message: response.data.message || 'Đánh giá phim thành công!',
                    data: response.data.data
                };
            }
            
            return {
                success: true,
                message: 'Đánh giá phim thành công!'
            };
        } catch (error: any) {
            console.error('Lỗi khi đánh giá phim:', error);
            
            let errorMessage = 'Có lỗi xảy ra khi đánh giá phim. Vui lòng thử lại sau.';
            
            if (error.response) {
                // API trả về lỗi
                errorMessage = error.response.data?.message || 
                              error.response.data?.error || 
                              `Lỗi ${error.response.status}: ${error.response.statusText}`;
            } else if (error.request) {
                // Không thể kết nối đến server
                errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
            }
            
            return {
                success: false,
                message: errorMessage
            };
        }
    }
};

export default movieService; 
import apiClient from './apiClient';
import type { Showtime, ShowtimeFormData } from '../types/showtime';


export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}


// Interface cho dữ liệu từ API backend


// Ánh xạ ID phim với tên phim
const movieNames: Record<string, string> = {
    '1': 'Inside Out 2',
    '2': 'Deadpool & Wolverine',
    '3': 'Godzilla x Kong',
    '21': 'Kung Fu Panda 4',
};


// Ánh xạ ID rạp với tên rạp
const cinemaNames: Record<string, string> = {
    '1': 'Galaxy Nguyễn Du',
    '2': 'Galaxy Tân Bình',
    '3': 'Galaxy Kinh Dương Vương',
};


// Ánh xạ ID phòng với tên phòng
const roomNames: Record<string, string> = {
    '1': 'Phòng 01',
    '2': 'Phòng 02',
    '3': 'Phòng 03',
    '4': 'Phòng 01',
    '5': 'Phòng 02',
    '6': 'Phòng 4',
};


// Lấy danh sách tất cả rạp phim
export const getCinemas = async () => {
    try {
        // Gọi API để lấy danh sách rạp phim đang hoạt động
        const response = await apiClient.get('/cinemas/active');


        if (response.data && response.data.data && Array.isArray(response.data.data)) {
            // Tạo map ID rạp -> thông tin rạp để dễ truy cập
            const cinemasMap = new Map();
            response.data.data.forEach((cinema: any) => {
                cinemasMap.set(cinema.Cinema_ID.toString(), {
                    id: cinema.Cinema_ID.toString(),
                    name: cinema.Cinema_Name,
                    address: cinema.Address,
                    city: cinema.City,
                    description: cinema.Description,
                    phoneNumber: cinema.Phone_Number,
                    email: cinema.Email,
                    status: cinema.Status
                });
            });


            return cinemasMap;
        }


        return new Map();
    } catch (error) {
        console.error('Error fetching cinemas:', error);
        return new Map();
    }
};


// Lấy thông tin chi tiết rạp phim theo ID
export const getCinemaById = async (cinemaId: string) => {
    try {
        console.log(`showtimeService - Đang lấy thông tin rạp với ID: ${cinemaId}`);


        // Thử lấy tất cả rạp, sau đó lọc theo ID
        const response = await apiClient.get('/cinemas');


        let allCinemas = [];
        if (response.data && response.data.data && Array.isArray(response.data.data)) {
            allCinemas = response.data.data;
        } else if (response.data && Array.isArray(response.data)) {
            allCinemas = response.data;
        }


        // Tìm rạp theo ID
        const foundCinema = allCinemas.find((cinema: any) => {
            const id = cinema.Cinema_ID?.toString() || cinema.id?.toString();
            return id === cinemaId;
        });


        if (foundCinema) {
            console.log(`Tìm thấy thông tin rạp với ID ${cinemaId} từ danh sách rạp`);
            return {
                id: foundCinema.Cinema_ID?.toString() || foundCinema.id?.toString() || cinemaId,
                name: foundCinema.Cinema_Name || foundCinema.name || 'Galaxy Cinema',
                address: foundCinema.Address || foundCinema.address || 'Hà Nội',
                city: foundCinema.City || foundCinema.city || 'Hà Nội',
                description: foundCinema.Description || foundCinema.description || '',
                phoneNumber: foundCinema.Phone_Number || foundCinema.phoneNumber || '',
                email: foundCinema.Email || foundCinema.email || '',
                status: foundCinema.Status || foundCinema.status || 'active'
            };
        }


        // Nếu không tìm thấy từ danh sách, thử gọi API chi tiết
        console.log(`Không tìm thấy rạp với ID ${cinemaId} trong danh sách, thử gọi API chi tiết`);


        // Thử gọi API với endpoint /cinemas/active
        try {
            const activeResponse = await apiClient.get('/cinemas/active');
            let activeCinemas = [];


            if (activeResponse.data && activeResponse.data.data && Array.isArray(activeResponse.data.data)) {
                activeCinemas = activeResponse.data.data;
            } else if (activeResponse.data && Array.isArray(activeResponse.data)) {
                activeCinemas = activeResponse.data;
            }


            const activeCinema = activeCinemas.find((cinema: any) => {
                const id = cinema.Cinema_ID?.toString() || cinema.id?.toString();
                return id === cinemaId;
            });


            if (activeCinema) {
                console.log(`Tìm thấy thông tin rạp với ID ${cinemaId} từ danh sách rạp active`);
                return {
                    id: activeCinema.Cinema_ID?.toString() || activeCinema.id?.toString() || cinemaId,
                    name: activeCinema.Cinema_Name || activeCinema.name || 'Galaxy Cinema',
                    address: activeCinema.Address || activeCinema.address || 'Hà Nội',
                    city: activeCinema.City || activeCinema.city || 'Hà Nội',
                    description: activeCinema.Description || activeCinema.description || '',
                    phoneNumber: activeCinema.Phone_Number || activeCinema.phoneNumber || '',
                    email: activeCinema.Email || activeCinema.email || '',
                    status: activeCinema.Status || activeCinema.status || 'active'
                };
            }
        } catch (activeError) {
            console.log(`Không thể lấy danh sách rạp active:`, activeError);
        }


        // Nếu vẫn không tìm thấy, thử gọi API chi tiết với tham số đơn giản hóa
        try {
            const detailResponse = await apiClient.get(`/cinemas/${cinemaId}`, {
                params: { simple: true }
            });


            if (detailResponse.data) {
                const cinema = detailResponse.data.data || detailResponse.data;
                console.log(`Lấy được thông tin rạp từ API chi tiết`);
                return {
                    id: cinema.Cinema_ID?.toString() || cinema.id?.toString() || cinemaId,
                    name: cinema.Cinema_Name || cinema.name || 'Galaxy Cinema',
                    address: cinema.Address || cinema.address || 'Hà Nội',
                    city: cinema.City || cinema.city || 'Hà Nội',
                    description: cinema.Description || cinema.description || '',
                    phoneNumber: cinema.Phone_Number || cinema.phoneNumber || '',
                    email: cinema.Email || cinema.email || '',
                    status: cinema.Status || cinema.status || 'active'
                };
            }
        } catch (detailError) {
            console.log(`Không thể lấy thông tin chi tiết rạp:`, detailError);
        }


        // Nếu tất cả các cách đều thất bại, sử dụng dữ liệu từ cinemaNames
        if (cinemaNames[cinemaId]) {
            console.log(`Sử dụng dữ liệu từ cinemaNames cho ID ${cinemaId}`);
            return {
                id: cinemaId,
                name: cinemaNames[cinemaId],
                address: 'Hà Nội',
                city: 'Hà Nội',
                description: '',
                phoneNumber: '',
                email: '',
                status: 'active'
            };
        }


        // Nếu không có trong cinemaNames, trả về tên mặc định
        return {
            id: cinemaId,
            name: `Galaxy Cinema ${cinemaId}`,
            address: 'Hà Nội',
            city: 'Hà Nội',
            description: '',
            phoneNumber: '',
            email: '',
            status: 'active'
        };
    } catch (error) {
        console.error(`Error fetching cinema with ID ${cinemaId}:`, error);


        // Nếu có lỗi, trả về dữ liệu từ cinemaNames hoặc tên mặc định
        if (cinemaNames[cinemaId]) {
            return {
                id: cinemaId,
                name: cinemaNames[cinemaId],
                address: 'Hà Nội',
                city: 'Hà Nội',
                description: '',
                phoneNumber: '',
                email: '',
                status: 'active'
            };
        }


        return {
            id: cinemaId,
            name: `Galaxy Cinema ${cinemaId}`,
            address: 'Hà Nội',
            city: 'Hà Nội',
            description: '',
            phoneNumber: '',
            email: '',
            status: 'active'
        };
    }
};


// Lấy danh sách tất cả suất chiếu - Tối ưu hóa hiệu xuất
export const getAllShowtimes = async () => {
    try {
        const response = await apiClient.get('/showtimes');
        if (!response.data) return [];


        let showtimes = [];
        if (Array.isArray(response.data)) {
            showtimes = response.data;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
            showtimes = response.data.data;
        } else {
            return [];
        }


        // Transform data đơn giản hơn
        return showtimes
            .map((item: any) => {
                if (!item || typeof item !== 'object') return null;


                const movieId = item.Movie_ID?.toString() || '';
                const movieTitle = item.Movie?.Movie_Name || movieNames[movieId] || 'Chưa xác định';
                const roomId = item.Cinema_Room_ID?.toString() || '';
                const cinemaId = item.CinemaRoom?.Cinema?.Cinema_ID?.toString() || '1';

                return {
                    id: item.Showtime_ID?.toString() || '',
                    movieId,
                    cinemaId,
                    roomId,
                    startTime: item.Start_Time,
                    endTime: item.End_Time,
                    showDate: item.Show_Date || '2025-06-11',
                    price: item.Base_Price || 90000,
                    vipPrice: item.Vip_Price || 120000,
                    couplePrice: item.Couple_Price || 180000,
                    availableSeats: item.AvailableSeats || 120,
                    totalSeats: item.TotalSeats || 120,
                    bookedSeats: item.Booked_Seats || 0,
                    status: mapStatus(item.Status || 'scheduled'),
                    specialOffers: item.Special_Offers || [],
                    isActive: item.Is_Active !== false,
                    createdAt: item.Created_At || new Date(),
                    updatedAt: item.Updated_At || new Date(),
                    movieTitle,
                    cinemaName: item.CinemaRoom?.Cinema?.Cinema_Name || cinemaNames[cinemaId] || 'Galaxy Cinema',
                    roomName: item.Room_Name || roomNames[roomId] || 'Phòng 01',
                    movie: {
                        title: movieTitle,
                        duration: item.Movie?.Duration || 90,
                        poster: item.Movie?.Poster_URL || '/placeholder.jpg'
                    },
                    cinema: {
                        name: item.CinemaRoom?.Cinema?.Cinema_Name || cinemaNames[cinemaId] || 'Galaxy Cinema',
                        address: item.CinemaRoom?.Cinema?.Location || 'Hà Nội'
                    },
                    room: {
                        name: item.Room_Name || roomNames[roomId] || 'Phòng 01',
                        capacity: item.TotalSeats || 120,
                        roomType: item.Room?.Room_Type || '2D'
                    }
                } as Showtime;
            })
            .filter((item: Showtime | null): item is Showtime => item !== null);
    } catch (error: any) {
        return [];
    }
};


// Hàm chuyển đổi status từ backend sang frontend
function mapStatus(backendStatus: string): 'scheduled' | 'ongoing' | 'completed' | 'cancelled' {
    switch (backendStatus.toLowerCase()) {
        case 'scheduled': return 'scheduled';
        case 'hidden': return 'cancelled';
        case 'cancelled': return 'cancelled';
        case 'ongoing': return 'ongoing';
        case 'completed': return 'completed';
        default: return 'scheduled';
    }
}


// Lấy chi tiết suất chiếu theo ID
export const getShowtimeById = async (id: string) => {
    console.log(`showtimeService - Fetching showtime with ID: ${id}`);
    try {
        const response = await apiClient.get(`/showtimes/${id}`);


        // Chuyển đổi dữ liệu từ backend sang frontend
        if (response.data) {
            const item = response.data;
            const transformedShowtime = transformBackendShowtime(item);


            // Đảm bảo thông tin cinema luôn có đầy đủ
            if (transformedShowtime) {
                // Nếu không có thông tin rạp, thêm thông tin mặc định
                if (!transformedShowtime.cinema || !transformedShowtime.cinema.name) {
                    const cinemaId = transformedShowtime.cinemaId || '1';
                    transformedShowtime.cinema = {
                        name: getCinemaNameFromCache(cinemaId),
                        address: 'Hà Nội'
                    };
                }


                // Nếu không có thông tin phòng, thêm thông tin mặc định
                if (!transformedShowtime.room || !transformedShowtime.room.name) {
                    const roomId = transformedShowtime.roomId || '1';
                    transformedShowtime.room = {
                        name: getRoomNameFromCache(roomId),
                        capacity: 50,
                        roomType: '2D'
                    };
                }


                // Đảm bảo có cinemaName và roomName
                transformedShowtime.cinemaName = transformedShowtime.cinema.name;
                transformedShowtime.roomName = transformedShowtime.room.name;
            }


            return transformedShowtime;
        }


        return null;
    } catch (error) {
        console.error(`Error fetching showtime with ID ${id}:`, error);
        return null;
    }
};


// Hàm lấy tên rạp từ cache
function getCinemaNameFromCache(cinemaId: string): string {
    // Sử dụng cinemaNames đã định nghĩa ở trên
    return cinemaNames[cinemaId] || `Galaxy Cinema ${cinemaId}`;
}


// Hàm lấy tên phòng từ cache
function getRoomNameFromCache(roomId: string): string {
    // Sử dụng roomNames đã định nghĩa ở trên
    return roomNames[roomId] || `Phòng ${roomId}`;
}


// Hàm chuyển đổi dữ liệu từ backend sang frontend
function transformBackendShowtime(item: any): Showtime | null {
    if (!item || typeof item !== 'object') {
        return null;
    }


    try {
        // Xử lý thời gian - chỉ lấy phần giờ:phút:giây từ chuỗi thời gian
        const extractTimeFromString = (timeString: string): string => {
            if (!timeString) return '';


            // Nếu là chuỗi ISO (có chứa T), trích xuất phần thời gian
            if (typeof timeString === 'string' && timeString.includes('T')) {
                const timePart = timeString.split('T')[1];
                return timePart.split('.')[0]; // Lấy HH:MM:SS
            }


            return timeString;
        };


        // Xác định cinemaId từ CinemaRoom nếu có
        let cinemaId = item.cinemaId || item.Cinema_ID || '1'; // Default
        if (item.CinemaRoom?.Cinema?.Cinema_ID) {
            cinemaId = String(item.CinemaRoom.Cinema.Cinema_ID);
        }


        // Xử lý trạng thái
        const status = mapStatus(item.Status || item.status || 'scheduled');


        // Xử lý số ghế đã đặt và còn trống
        const totalSeats = item.TotalSeats || item.totalSeats || 50; // Giá trị mặc định nếu không có
        const availableSeats = item.AvailableSeats !== undefined ? item.AvailableSeats :
            (item.availableSeats !== undefined ? item.availableSeats : 50);
        const bookedSeats = item.bookedSeats !== undefined ? item.bookedSeats : (totalSeats - availableSeats);


        // Đảm bảo Show_Date được định dạng đúng
        let showDate = item.Show_Date || item.showDate || null;


        // Nếu không có showDate, thử lấy từ startTime nếu có định dạng ISO
        if (!showDate && item.Start_Time && typeof item.Start_Time === 'string' && item.Start_Time.includes('T')) {
            showDate = item.Start_Time.split('T')[0];
        } else if (!showDate && item.startTime && typeof item.startTime === 'string' && item.startTime.includes('T')) {
            showDate = item.startTime.split('T')[0];
        }


        // Nếu vẫn không có, sử dụng ngày mặc định
        if (!showDate) {
            showDate = new Date().toISOString().split('T')[0];
        }


        // Lấy tên phim từ API hoặc từ dữ liệu có sẵn
        let movieTitle = 'Chưa xác định';
        if (item.Movie && item.Movie.Movie_Name) {
            movieTitle = item.Movie.Movie_Name;
        } else if (item.movie && item.movie.title) {
            movieTitle = item.movie.title;
        } else if (item.movieTitle) {
            movieTitle = item.movieTitle;
        } else if (item.Movie_Name) {
            movieTitle = item.Movie_Name;
        }


        // Lấy tên rạp từ dữ liệu có sẵn
        let cinemaName = '';
        if (item.CinemaRoom?.Cinema?.Cinema_Name) {
            cinemaName = item.CinemaRoom.Cinema.Cinema_Name;
        } else if (item.cinema && item.cinema.name) {
            cinemaName = item.cinema.name;
        } else if (item.cinemaName) {
            cinemaName = item.cinemaName;
        } else {
            cinemaName = getCinemaNameFromCache(cinemaId);
        }


        // Lấy tên phòng từ dữ liệu có sẵn
        let roomName = '';
        if (item.Room?.Room_Name) {
            roomName = item.Room.Room_Name;
        } else if (item.CinemaRoom?.Room_Name) {
            roomName = item.CinemaRoom.Room_Name;
        } else if (item.Room_Name) {
            roomName = item.Room_Name;
        } else if (item.room && item.room.name) {
            roomName = item.room.name;
        } else if (item.roomName) {
            roomName = item.roomName;
        } else {
            const roomId = item.Cinema_Room_ID || item.roomId || '1';
            roomName = getRoomNameFromCache(roomId);
        }


        // Xử lý URL poster
        let posterUrl = '';
        if (item.Movie?.Poster_URL) {
            posterUrl = item.Movie.Poster_URL;
        } else if (item.movie?.poster) {
            posterUrl = item.movie.poster;
        } else if (item.moviePoster) {
            posterUrl = item.moviePoster;
        } else {
            posterUrl = '/placeholder.jpg';
        }


        // Tạo đối tượng showtime
        const showtime: Showtime = {
            id: String(item.Showtime_ID || item.id || ''),
            movieId: String(item.Movie_ID || item.movieId || ''),
            cinemaId: String(cinemaId),
            roomId: String(item.Cinema_Room_ID || item.roomId || ''),
            startTime: extractTimeFromString(item.Start_Time || item.startTime || ''),
            endTime: extractTimeFromString(item.End_Time || item.endTime || ''),
            showDate: showDate,
            price: item.Base_Price || item.price || 90000, // Giá mặc định
            vipPrice: item.Vip_Price || item.vipPrice || 120000,
            couplePrice: item.Couple_Price || item.couplePrice || 200000,
            availableSeats: availableSeats,
            totalSeats: totalSeats,
            bookedSeats: bookedSeats,
            status: status,
            specialOffers: item.specialOffers || [],
            isActive: item.Status !== 'Hidden' && item.Status !== 'Cancelled',
            createdAt: new Date(),
            updatedAt: new Date(),
            // Thêm thông tin bổ sung cho frontend
            movieTitle: movieTitle,
            cinemaName: cinemaName,
            roomName: roomName,
            movie: {
                title: movieTitle,
                duration: item.Movie?.Duration || item.movie?.duration || 90,
                poster: posterUrl
            },
            cinema: {
                name: cinemaName,
                address: item.CinemaRoom?.Cinema?.Location || item.cinema?.address || 'Hà Nội'
            },
            room: {
                name: roomName,
                capacity: totalSeats,
                roomType: item.Room?.Room_Type || item.CinemaRoom?.Room_Type || item.room?.roomType || '2D'
            }
        };


        return showtime;
    } catch (error) {
        console.error('Error transforming showtime data:', error);
        return null;
    }
}


// Lấy danh sách suất chiếu theo phim
export const getShowtimesByMovie = async (movieId: string) => {
    console.log(`showtimeService - Fetching showtimes for movie ID: ${movieId}`);
    try {
        const response = await apiClient.get(`/showtimes/movie/${movieId}`);


        if (response.data && Array.isArray(response.data)) {
            return response.data.map(item => transformBackendShowtime(item)).filter(Boolean);
        } else if (response.data && response.data.dates) {
            // Xử lý cấu trúc phức tạp từ API
            const result: Showtime[] = [];
            response.data.dates.forEach((dateInfo: any) => {
                if (dateInfo.Showtimes && Array.isArray(dateInfo.Showtimes)) {
                    dateInfo.Showtimes.forEach((showtime: any) => {
                        const transformed = transformBackendShowtime({
                            ...showtime,
                            Show_Date: dateInfo.Show_Date,
                            Movie_ID: response.data.movie_id,
                            Movie: {
                                Movie_Name: response.data.movie_name,
                                Duration: response.data.duration,
                                Poster_URL: '/placeholder.jpg'
                            }
                        });
                        if (transformed) result.push(transformed);
                    });
                }
            });
            return result;
        }


        return [];
    } catch (error) {
        console.error(`Error fetching showtimes for movie ID ${movieId}:`, error);
        return [];
    }
};


// Lấy danh sách suất chiếu theo phim và ngày
export const getShowtimesByMovieAndDate = async (movieId: string, date: string) => {
    console.log(`showtimeService - Fetching showtimes for movie ID: ${movieId} on date: ${date}`);
    try {
        // Try to get showtimes with date filter
        const response = await apiClient.get(`/showtimes/movie/${movieId}`, {
            params: { date }
        });

        if (response.data && Array.isArray(response.data)) {
            return response.data.map(item => transformBackendShowtime(item)).filter(Boolean);
        } else if (response.data && response.data.dates) {
            // Process complex structure from API and filter by date
            const result: Showtime[] = [];
            response.data.dates.forEach((dateInfo: any) => {
                if (dateInfo.Show_Date === date && dateInfo.Showtimes && Array.isArray(dateInfo.Showtimes)) {
                    dateInfo.Showtimes.forEach((showtime: any) => {
                        const transformed = transformBackendShowtime({
                            ...showtime,
                            Show_Date: dateInfo.Show_Date,
                            Movie_ID: response.data.movie_id,
                            Movie: {
                                Movie_Name: response.data.movie_name,
                                Duration: response.data.duration,
                                Poster_URL: '/placeholder.jpg'
                            }
                        });
                        if (transformed) result.push(transformed);
                    });
                }
            });
            return result;
        }

        return [];
    } catch (error) {
        console.error(`Error fetching showtimes for movie ID ${movieId} on date ${date}:`, error);
        // Fallback: get all showtimes for the movie and filter by date
        try {
            const allShowtimes = await getShowtimesByMovie(movieId);
            return allShowtimes.filter(showtime => {
                if (!showtime || !showtime.startTime) return false;
                const showtimeDate = new Date(showtime.startTime).toISOString().split('T')[0];
                return showtimeDate === date;
            });
        } catch (fallbackError) {
            console.error(`Fallback also failed:`, fallbackError);
            return [];
        }
    }
};


// Lấy danh sách suất chiếu theo rạp
export const getShowtimesByCinema = async (cinemaId: string) => {
    console.log(`showtimeService - Fetching showtimes for cinema ID: ${cinemaId}`);
    try {
        const response = await apiClient.get(`/showtimes/cinema/${cinemaId}`);


        if (response.data && Array.isArray(response.data)) {
            return response.data.map(item => transformBackendShowtime(item)).filter(Boolean);
        }


        return [];
    } catch (error) {
        console.error(`Error fetching showtimes for cinema ID ${cinemaId}:`, error);
        return [];
    }
};


// Tạo suất chiếu mới (Admin)
export const createShowtime = async (data: ShowtimeFormData, allowEarlyShowtime: boolean = false) => {
    console.log('showtimeService - Creating new showtime:', data, 'allowEarlyShowtime:', allowEarlyShowtime);
    try {
        // Chuyển đổi dữ liệu từ frontend sang định dạng backend
        const backendData = {
            Movie_ID: parseInt(data.movieId),
            Cinema_Room_ID: parseInt(data.roomId),
            Cinema_ID: parseInt(data.cinemaId), // Add Cinema_ID field
            Show_Date: data.date || new Date().toISOString().split('T')[0],
            Start_Time: data.time || '12:00:00',
            Base_Price: 90000, // Default price
            allowEarlyShowtime: allowEarlyShowtime
        };


        console.log('Sending data to API:', backendData);
        const response = await apiClient.post('/showtimes', backendData);
        return response.data;
    } catch (error) {
        console.error('Error creating showtime:', error);
        throw error;
    }
};


// Cập nhật suất chiếu (Admin)
export const updateShowtime = async (id: string, data: Partial<ShowtimeFormData>) => {
    console.log(`showtimeService - Updating showtime ID: ${id}`, data);
    try {
        // Chuyển đổi dữ liệu từ frontend sang định dạng backend
        const backendData: any = {};


        if (data.movieId) backendData.Movie_ID = parseInt(data.movieId);
        if (data.roomId) backendData.Cinema_Room_ID = parseInt(data.roomId);
        if (data.date) backendData.Show_Date = data.date;
        if (data.time) backendData.Start_Time = data.time;
        if (data.price) backendData.Base_Price = data.price;


        const response = await apiClient.put(`/showtimes/${id}`, backendData);
        return response.data;
    } catch (error) {
        console.error(`Error updating showtime ID ${id}:`, error);
        throw error;
    }
};


// Xóa suất chiếu (Admin)
export const deleteShowtime = async (id: string) => {
    console.log(`showtimeService - Deleting showtime ID: ${id}`);
    try {
        const response = await apiClient.delete(`/showtimes/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting showtime ID ${id}:`, error);
        throw error;
    }
};


// Lấy thông tin chi tiết phim theo ID
export const getMovieById = async (movieId: string) => {
    try {
        // Sửa đường dẫn API, xóa bỏ phần /api/ bị trùng lặp
        const response = await apiClient.get(`/movies/${movieId}`);


        if (response.data && response.data.data) {
            return response.data.data;
        }


        return response.data;
    } catch (error) {
        console.error(`Error fetching movie details for ID ${movieId}:`, error);


        // Thử gọi API với đường dẫn khác nếu đường dẫn đầu tiên thất bại
        try {
            const fallbackResponse = await apiClient.get(`/movie/${movieId}`);


            if (fallbackResponse.data && fallbackResponse.data.data) {
                return fallbackResponse.data.data;
            }


            return fallbackResponse.data;
        } catch (fallbackError) {
            console.error(`Fallback also failed for movie ID ${movieId}:`, fallbackError);
            throw error; // Ném lỗi ban đầu
        }
    }
};


// Hàm trợ giúp để lấy thông tin phim cho suất chiếu
export const fetchMovieDetailsForShowtime = async (showtime: Showtime): Promise<Showtime> => {
    // Nếu đã có thông tin phim đầy đủ, không cần gọi API
    if (showtime.movie?.title && showtime.movie.title !== 'Chưa xác định') {
        return showtime;
    }


    try {
        const movieDetails = await getMovieById(showtime.movieId);
        if (movieDetails) {
            return {
                ...showtime,
                movieTitle: movieDetails.Movie_Name || movieDetails.title || showtime.movieTitle,
                movie: {
                    title: movieDetails.Movie_Name || movieDetails.title || showtime.movie?.title || '',
                    duration: movieDetails.Duration || movieDetails.duration || showtime.movie?.duration || 90,
                    poster: movieDetails.Poster_URL || movieDetails.poster || showtime.movie?.poster || '/placeholder.jpg'
                }
            };
        }
    } catch (error) {
        console.error(`Error enriching showtime ${showtime.id} with movie details:`, error);
    }


    return showtime;
};


// Hàm tải danh sách phim từ API
export const fetchMovies = async () => {
    try {
        console.log('showtimeService - Đang tải danh sách phim từ API...');


        // Thử tải phim từ API "now-showing" trước
        try {
            const response = await apiClient.get('/movies/now-showing');


            if (response.data && response.data.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
                console.log('showtimeService - Đã tải được danh sách phim từ endpoint now-showing');
                return response.data.data.map((movie: any) => ({
                    id: movie.Movie_ID?.toString() || movie.id?.toString() || '',
                    title: movie.Movie_Name || movie.title || movie.movieName || '',
                    poster: movie.Poster_URL || movie.poster || '',
                    duration: movie.Duration || movie.duration || 120,
                    releaseDate: movie.Release_Date || movie.releaseDate || '',
                    premiereDate: movie.Premiere_Date || movie.premiereDate || '',
                    endDate: movie.End_Date || movie.endDate || '',
                    productionCompany: movie.Production_Company || movie.productionCompany || '',
                    director: movie.Director || movie.director || '',
                    cast: movie.Cast || movie.cast || '',
                    genre: movie.Genre || movie.genre || '',
                    rating: movie.Rating || movie.rating || '',
                    language: movie.Language || movie.language || '',
                    country: movie.Country || movie.country || '',
                    synopsis: movie.Synopsis || movie.synopsis || '',
                    trailerLink: movie.Trailer_Link || movie.trailerLink || '',
                    status: movie.Status || movie.status || 'Coming Soon',
                    createdAt: movie.Created_At || movie.createdAt || '',
                    updatedAt: movie.Updated_At || movie.updatedAt || '',
                    ratingAverage: movie.Rating_Summary?.Average_Rating || movie.ratingAverage || 0,
                    ratingCount: movie.Rating_Summary?.Rating_Count || movie.ratingCount || 0,
                }));
            }
        } catch (error) {
            console.error('showtimeService - Lỗi khi tải phim từ endpoint now-showing:', error);
        }


        // Nếu không thành công, thử tải từng phim riêng lẻ (dựa vào log)
        try {
            console.log('showtimeService - Đang tải phim từ các API riêng lẻ...');
            const movieIds = ['1', '2', '3', '21']; // ID phim từ log
            const moviesPromises = movieIds.map(async (id) => {
                try {
                    const response = await apiClient.get(`/movies/${id}`);


                    if (response.data && response.data.data) {
                        const movie = response.data.data;
                        return {
                            id: movie.Movie_ID?.toString() || movie.id?.toString() || id,
                            title: movie.Movie_Name || movie.title || movie.movieName || `Phim ${id}`,
                            poster: movie.Poster_URL || movie.poster || '',
                            duration: movie.Duration || movie.duration || 120,
                            releaseDate: movie.Release_Date || movie.releaseDate || '',
                            premiereDate: movie.Premiere_Date || movie.premiereDate || '',
                            endDate: movie.End_Date || movie.endDate || '',
                            productionCompany: movie.Production_Company || movie.productionCompany || '',
                            director: movie.Director || movie.director || '',
                            cast: movie.Cast || movie.cast || '',
                            genre: movie.Genre || movie.genre || '',
                            rating: movie.Rating || movie.rating || '',
                            language: movie.Language || movie.language || '',
                            country: movie.Country || movie.country || '',
                            synopsis: movie.Synopsis || movie.synopsis || '',
                            trailerLink: movie.Trailer_Link || movie.trailerLink || '',
                            status: movie.Status || movie.status || 'Coming Soon',
                            createdAt: movie.Created_At || movie.createdAt || '',
                            updatedAt: movie.Updated_At || movie.updatedAt || '',
                            ratingAverage: movie.Rating_Summary?.Average_Rating || movie.ratingAverage || 0,
                            ratingCount: movie.Rating_Summary?.Rating_Count || movie.ratingCount || 0,
                        };
                    }
                    return null;
                } catch (err) {
                    console.error(`showtimeService - Lỗi khi tải phim ID ${id}:`, err);
                    return null;
                }
            });


            const movies = (await Promise.all(moviesPromises)).filter(movie => movie !== null);


            if (movies.length > 0) {
                console.log(`showtimeService - Đã tải được ${movies.length} phim từ API riêng lẻ`);
                return movies;
            }
        } catch (error) {
            console.error('showtimeService - Lỗi khi tải phim từ các API riêng lẻ:', error);
        }


        // Nếu không thành công, thử dùng API movies
        try {
            const response = await apiClient.get('/movies');


            if (response.data && response.data.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
                console.log('showtimeService - Đã tải được danh sách phim từ endpoint /api/movies');
                return response.data.data.map((movie: any) => ({
                    id: movie.Movie_ID?.toString() || movie.id?.toString() || '',
                    title: movie.Movie_Name || movie.title || movie.movieName || '',
                    poster: movie.Poster_URL || movie.poster || '',
                    duration: movie.Duration || movie.duration || 120,
                    releaseDate: movie.Release_Date || movie.releaseDate || '',
                    premiereDate: movie.Premiere_Date || movie.premiereDate || '',
                    endDate: movie.End_Date || movie.endDate || '',
                    productionCompany: movie.Production_Company || movie.productionCompany || '',
                    director: movie.Director || movie.director || '',
                    cast: movie.Cast || movie.cast || '',
                    genre: movie.Genre || movie.genre || '',
                    rating: movie.Rating || movie.rating || '',
                    language: movie.Language || movie.language || '',
                    country: movie.Country || movie.country || '',
                    synopsis: movie.Synopsis || movie.synopsis || '',
                    trailerLink: movie.Trailer_Link || movie.trailerLink || '',
                    status: movie.Status || movie.status || 'Coming Soon',
                    createdAt: movie.Created_At || movie.createdAt || '',
                    updatedAt: movie.Updated_At || movie.updatedAt || '',
                    ratingAverage: movie.Rating_Summary?.Average_Rating || movie.ratingAverage || 0,
                    ratingCount: movie.Rating_Summary?.Rating_Count || movie.ratingCount || 0,
                }));
            }
        } catch (error) {
            console.error('showtimeService - Lỗi khi tải phim từ endpoint movies:', error);
        }


        // Trả về mảng rỗng nếu không lấy được dữ liệu
        console.log('showtimeService - Không thể tải danh sách phim, trả về mảng rỗng');
        return [];
    } catch (error) {
        console.error('showtimeService - Lỗi khi tải danh sách phim:', error);
        return [];
    }
};


// Lấy danh sách rạp đang chiếu một phim cụ thể
export const getCinemasShowingMovie = async (movieId: string) => {
    console.log(`showtimeService - Fetching cinemas showing movie ID: ${movieId}`);
    try {
        // Thử gọi API với đường dẫn theo tài liệu API - đã xóa /api/ để tránh trùng lặp
        const response = await apiClient.get(`/movies/${movieId}/cinemas`);


        if (response.data && Array.isArray(response.data)) {
            console.log(`Found ${response.data.length} cinemas showing movie ${movieId}`);
            return response.data;
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
            console.log(`Found ${response.data.data.length} cinemas showing movie ${movieId} in data field`);
            return response.data.data;
        }


        // Nếu không có dữ liệu hoặc API thất bại, lấy tất cả rạp và giả định tất cả đều chiếu phim này
        console.log('No cinema data found, falling back to fetching all cinemas');
        const allCinemasResponse = await apiClient.get('/cinemas');


        if (allCinemasResponse.data && Array.isArray(allCinemasResponse.data)) {
            return allCinemasResponse.data;
        } else if (allCinemasResponse.data && allCinemasResponse.data.data && Array.isArray(allCinemasResponse.data.data)) {
            return allCinemasResponse.data.data;
        }


        console.log('Fallback to hardcoded cinema data');
        // Trả về danh sách rạp mặc định nếu không có dữ liệu
        return [
            {
                Cinema_ID: 1,
                Cinema_Name: "Galaxy Nguyễn Du",
                Address: "116 Nguyễn Du, Bến Thành, Quận 1, TP.HCM",
                City: "Hồ Chí Minh",
                Province: "Hồ Chí Minh",
                Phone_Number: "1900 2224",
                Email: "cskh@galaxycine.vn",
                Status: "Active"
            },
            {
                Cinema_ID: 2,
                Cinema_Name: "Galaxy Tân Bình",
                Address: "246 Nguyễn Hồng Đào, Quận Tân Bình, TP.HCM",
                City: "Hồ Chí Minh",
                Province: "Hồ Chí Minh",
                Phone_Number: "1900 2224",
                Email: "cskh@galaxycine.vn",
                Status: "Active"
            },
            {
                Cinema_ID: 3,
                Cinema_Name: "Galaxy Kinh Dương Vương",
                Address: "718bis Kinh Dương Vương, Q6, TP.HCM",
                City: "Hồ Chí Minh",
                Province: "Hồ Chí Minh",
                Phone_Number: "1900 2224",
                Email: "cskh@galaxycine.vn",
                Status: "Active"
            }
        ];
    } catch (error) {
        console.error(`Error fetching cinemas for movie ID ${movieId}:`, error);
        // Trả về danh sách rạp mặc định khi lỗi
        return [
            {
                Cinema_ID: 1,
                Cinema_Name: "Galaxy Nguyễn Du",
                Address: "116 Nguyễn Du, Bến Thành, Quận 1, TP.HCM",
                City: "Hồ Chí Minh",
                Province: "Hồ Chí Minh",
                Phone_Number: "1900 2224",
                Email: "cskh@galaxycine.vn",
                Status: "Active"
            },
            {
                Cinema_ID: 2,
                Cinema_Name: "Galaxy Tân Bình",
                Address: "246 Nguyễn Hồng Đào, Quận Tân Bình, TP.HCM",
                City: "Hồ Chí Minh",
                Province: "Hồ Chí Minh",
                Phone_Number: "1900 2224",
                Email: "cskh@galaxycine.vn",
                Status: "Active"
            }
        ];
    }
};


// Interface cho thông tin ghế của showtime
export interface ShowtimeSeatsInfo {
    Showtime_ID: number;
    Movie_ID: number;
    Cinema_Room_ID: number;
    Room_Name: string;
    Show_Date: string;
    Start_Time: string;
    End_Time: string;
    Status: string;
    Room: {
        Cinema_Room_ID: number;
        Room_Name: string;
        Room_Type: string;
    };
    BookedSeats: number;
    TotalSeats: number;
    AvailableSeats: number;
    SeatStatus: string;
    IsSoldOut: boolean;
}


export interface ShowtimeSeatsResponse {
    success: boolean;
    data: ShowtimeSeatsInfo;
    message: string;
}

// Gọi API để lấy thông tin ghế của một showtime
export const getShowtimeSeatsInfo = async (showtimeId: string): Promise<ShowtimeSeatsResponse> => {
    try {
        console.log(`Đang gọi API lấy thông tin ghế cho showtime ID: ${showtimeId}`);

        const response = await apiClient.get(`/showtimes/${showtimeId}/seats-info`);

        if (response.data) {
            console.log(`Nhận được dữ liệu từ API:`, response.data);
            return response.data as ShowtimeSeatsResponse;
        }

        throw new Error('Không có dữ liệu từ API');
    } catch (error: any) {
        console.error(`Lỗi khi lấy thông tin ghế cho showtime ${showtimeId}:`, error);

        // Xử lý lỗi và trả về response có cấu trúc phù hợp
        const errorMessage = error.response?.data?.message || error.message || 'Lỗi không xác định';

        throw new Error(`Không thể lấy thông tin ghế: ${errorMessage}`);
    }
};


// Kiểm tra premiere conflict trước khi tạo showtime
export const checkPremiereConflict = async (movieId: string, showDate: string) => {
    try {
        console.log(`Checking premiere conflict for movie ${movieId} on date ${showDate}`);
        
        const movieDetails = await getMovieById(movieId);
        if (!movieDetails) {
            throw new Error('Không tìm thấy phim');
        }

        const releaseDate = new Date(movieDetails.Release_Date || movieDetails.releaseDate);
        const premiereDate = movieDetails.Premiere_Date || movieDetails.premiereDate 
            ? new Date(movieDetails.Premiere_Date || movieDetails.premiereDate) 
            : null;
        const selectedDate = new Date(showDate);

        if (premiereDate && selectedDate < premiereDate && selectedDate >= releaseDate) {
            return {
                conflict: true,
                movie: movieDetails,
                releaseDate: releaseDate.toISOString().split('T')[0],
                premiereDate: premiereDate.toISOString().split('T')[0],
                selectedDate: showDate
            };
        }

        return { conflict: false, movie: movieDetails };
    } catch (error) {
        console.error('Error checking premiere conflict:', error);
        throw error;
    }
};


// Lấy danh sách suất chiếu theo rạp của manager
export const getShowtimesByManagerCinema = async () => {
    try {
        console.log('Đang lấy danh sách suất chiếu theo rạp của manager');
        const response = await apiClient.get('/showtimes/manager/cinema');
        
        if (!response.data) {
            console.error('Không có dữ liệu trả về từ API');
            return { showtimes: [], cinema: null, total: 0 };
        }
        
        // API trả về cấu trúc { success: true, cinema: {...}, total: number, showtimes: [...] }
        const data = response.data;
        
        if (!data.success || !data.showtimes || !Array.isArray(data.showtimes)) {
            console.error('Cấu trúc dữ liệu không hợp lệ:', data);
            return { showtimes: [], cinema: null, total: 0 };
        }
        
        // Lấy thông tin rạp từ response
        const cinema = data.cinema || {};
        console.log(`Đã lấy ${data.total} suất chiếu của rạp ${cinema.Cinema_Name || 'không xác định'}`);
        
        // Trả về dữ liệu gốc từ API mà không chuyển đổi
        return {
            showtimes: data.showtimes,
            cinema: cinema,
            total: data.total || data.showtimes.length
        };
    } catch (error) {
        console.error('Lỗi khi lấy danh sách suất chiếu theo rạp của manager:', error);
        return { showtimes: [], cinema: null, total: 0 };
    }
};


// Hủy lịch chiếu
export const cancelShowtime = async (id: string) => {
  try {
    console.log(`Đang hủy lịch chiếu ID: ${id}`);
    const response = await apiClient.put(`/showtimes/${id}/cancel`);
    
    if (response.data && response.data.success) {
      console.log('Hủy lịch chiếu thành công:', response.data);
      return {
        success: true,
        message: response.data.message || 'Hủy lịch chiếu thành công'
      };
    } else {
      console.error('Lỗi khi hủy lịch chiếu:', response.data);
      return {
        success: false,
        message: response.data?.message || 'Không thể hủy lịch chiếu'
      };
    }
  } catch (error: any) {
    console.error('Lỗi khi gọi API hủy lịch chiếu:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Đã xảy ra lỗi khi hủy lịch chiếu'
    };
  }
};


// Lấy danh sách phim có suất chiếu tại rạp cụ thể
export const getMoviesByCinema = async (cinemaId: string) => {
    try {
        const allShowtimes = await getAllShowtimes();
        
        // Lọc suất chiếu theo rạp và lấy unique movies
        const moviesAtCinema = allShowtimes
            .filter((showtime: any) => showtime.cinemaId === cinemaId && showtime.status !== 'cancelled')
            .reduce((movies: any[], showtime: any) => {
                if (!movies.some((movie: any) => movie.id === showtime.movieId)) {
                    movies.push({
                        id: showtime.movieId,
                        title: showtime.movieTitle,
                        poster: showtime.movie?.poster || '/placeholder.jpg'
                    });
                }
                return movies;
            }, [] as { id: string; title: string; poster: string }[]);
            
        return moviesAtCinema;
    } catch (error) {
        console.error('Error fetching movies by cinema:', error);
        return [];
    }
};

// Lấy danh sách ngày có suất chiếu của phim tại rạp cụ thể (3 ngày gần nhất)
export const getShowDatesForMovieAtCinema = async (movieId: string, cinemaId: string) => {
    try {
        const allShowtimes = await getAllShowtimes();
        const today = new Date();
        
        // Lọc suất chiếu theo phim và rạp
        const showtimesForMovieAtCinema = allShowtimes
            .filter((showtime: any) => 
                showtime.movieId === movieId && 
                showtime.cinemaId === cinemaId && 
                showtime.status !== 'cancelled' &&
                new Date(showtime.showDate) >= today
            )
            .map((showtime: any) => showtime.showDate)
            .filter((date: string, index: number, self: string[]) => self.indexOf(date) === index) // Remove duplicates
            .sort((a: string, b: string) => new Date(a).getTime() - new Date(b).getTime()) // Sort by date
            .slice(0, 3); // Lấy 3 ngày gần nhất
            
        return showtimesForMovieAtCinema.map((date: string) => ({
            date,
            displayDate: new Date(date).toLocaleDateString('vi-VN', {
                weekday: 'short',
                day: '2-digit',
                month: '2-digit'
            })
        }));
    } catch (error) {
        console.error('Error fetching show dates:', error);
        return [];
    }
};

// Lấy danh sách giờ chiếu của phim tại rạp trong ngày cụ thể
export const getShowtimesForMovieAtCinemaOnDate = async (movieId: string, cinemaId: string, date: string) => {
    try {
        const allShowtimes = await getAllShowtimes();
        
        // Lọc suất chiếu theo phim, rạp và ngày
        const showtimesForDay = allShowtimes
            .filter((showtime: any) => 
                showtime.movieId === movieId && 
                showtime.cinemaId === cinemaId && 
                showtime.showDate === date &&
                showtime.status !== 'cancelled'
            );
        
        // Lấy thông tin ghế cho mỗi suất chiếu
        const showtimesWithSeatsInfo = await Promise.all(
            showtimesForDay.map(async (showtime: any) => {
                try {
                    // Gọi API lấy thông tin ghế
                    const seatsInfo = await getShowtimeSeatsInfo(showtime.id);
                    
                    // Nếu có thông tin ghế, cập nhật thông tin ghế trống
                    if (seatsInfo && seatsInfo.success && seatsInfo.data) {
                        const { BookedSeats, TotalSeats, AvailableSeats } = seatsInfo.data;
                        
                        return {
                            id: showtime.id,
                            startTime: showtime.startTime,
                            endTime: showtime.endTime,
                            roomName: showtime.roomName || seatsInfo.data.Room_Name,
                            roomType: showtime.roomType || (seatsInfo.data.Room ? seatsInfo.data.Room.Room_Type : '2D'),
                            availableSeats: AvailableSeats !== undefined ? AvailableSeats : (TotalSeats - BookedSeats),
                            totalSeats: TotalSeats || 50,
                            price: showtime.price || 90000,
                            seatStatus: `${BookedSeats}/${TotalSeats}`,
                            isSoldOut: AvailableSeats === 0 || BookedSeats === TotalSeats
                        };
                    }
                    
                    // Nếu không lấy được thông tin ghế, sử dụng dữ liệu mặc định
                    return {
                        id: showtime.id,
                        startTime: showtime.startTime,
                        endTime: showtime.endTime,
                        roomName: showtime.roomName || 'Phòng chiếu',
                        roomType: showtime.roomType || '2D',
                        availableSeats: showtime.availableSeats || 45,
                        totalSeats: showtime.totalSeats || 50,
                        price: showtime.price || 90000,
                        seatStatus: `${showtime.totalSeats - showtime.availableSeats || 5}/${showtime.totalSeats || 50}`,
                        isSoldOut: showtime.availableSeats === 0
                    };
                } catch (error) {
                    console.error(`Lỗi khi lấy thông tin ghế cho suất chiếu ${showtime.id}:`, error);
                    
                    // Trả về thông tin mặc định nếu có lỗi
                    return {
                        id: showtime.id,
                        startTime: showtime.startTime,
                        endTime: showtime.endTime,
                        roomName: showtime.roomName || 'Phòng chiếu',
                        roomType: showtime.roomType || '2D',
                        availableSeats: showtime.availableSeats || 45,
                        totalSeats: showtime.totalSeats || 50,
                        price: showtime.price || 90000,
                        seatStatus: `${showtime.totalSeats - showtime.availableSeats || 5}/${showtime.totalSeats || 50}`,
                        isSoldOut: false
                    };
                }
            })
        );
            
        // Sắp xếp theo thời gian bắt đầu
        return showtimesWithSeatsInfo.sort((a, b) => {
            const timeA = a.startTime.split(':').map(Number);
            const timeB = b.startTime.split(':').map(Number);
            return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
        });
    } catch (error) {
        console.error('Error fetching showtimes for date:', error);
        return [];
    }
};

const showtimeService = {
    getAllShowtimes,
    getShowtimeById,
    getShowtimesByMovie,
    getShowtimesByMovieAndDate,
    getShowtimesByCinema,
    createShowtime,
    updateShowtime,
    deleteShowtime,
    getMovieById,
    fetchMovieDetailsForShowtime,
    fetchMovies,
    getCinemas,
    getCinemaById,
    getCinemasShowingMovie,
    getShowtimeSeatsInfo,
    checkPremiereConflict,
    getShowtimesByManagerCinema,
    cancelShowtime,
    getMoviesByCinema,
    getShowDatesForMovieAtCinema,
    getShowtimesForMovieAtCinemaOnDate
};

export default showtimeService;


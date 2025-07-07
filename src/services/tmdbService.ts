// TMDB API Service
// Sử dụng API key trực tiếp trong code vì không thể tạo file .env
const TMDB_API_KEY = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJlZTFhMDZhZDQ5NDNlM2Q2Nzk0ZGMwZGZmNTM1MTdlZSIsIm5iZiI6MTc0MzU5MjE3OC4zODUsInN1YiI6IjY3ZWQxYWYyZjVhZTcxNDM1ZGFhZjQ1NSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.YVJyzBbE01t5dC6tw8QzC9Wz5mqdSqaKlVekrvqVGpc';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// Image size configurations
export const TMDB_IMAGE_SIZES = {
    poster: {
        small: 'w185',
        medium: 'w342',
        large: 'w500',
        original: 'original'
    },
    backdrop: {
        small: 'w300',
        medium: 'w780',
        large: 'w1280',
        original: 'original'
    },
    logo: {
        small: 'w45',
        medium: 'w92',
        large: 'w185',
        original: 'original'
    }
};

// Headers cho API requests
const headers = {
    'Authorization': `Bearer ${TMDB_API_KEY}`,
    'Content-Type': 'application/json',
};

// Helper function để build image URL
export const getTMDBImageUrl = (path: string | null, type: 'poster' | 'backdrop' | 'logo', size: string = 'large') => {
    if (!path) return '/placeholder-movie.svg';
    const sizeConfig = TMDB_IMAGE_SIZES[type];
    const imageSize = sizeConfig[size as keyof typeof sizeConfig] || sizeConfig.large;
    return `${TMDB_IMAGE_BASE_URL}/${imageSize}${path}`;
};

// Interface cho Movie từ TMDB
export interface TMDBMovie {
    id: number;
    title: string;
    original_title: string;
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    release_date: string;
    vote_average: number;
    vote_count: number;
    genre_ids: number[];
    adult: boolean;
    video: boolean;
    popularity: number;
}

export interface TMDBMovieDetail extends TMDBMovie {
    runtime: number;
    genres: Array<{ id: number; name: string }>;
    production_companies: Array<{
        id: number;
        name: string;
        logo_path: string | null;
        origin_country: string;
    }>;
    tagline: string;
    status: string;
    budget: number;
    revenue: number;
    images?: {
        backdrops: Array<{ file_path: string }>;
        posters: Array<{ file_path: string }>;
        logos: Array<{ file_path: string }>;
    };
    videos?: {
        results: Array<{
            key: string;
            site: string;
            type: string;
            official: boolean;
        }>;
    };
}

// Genre mapping sang tiếng Việt
const GENRE_MAPPING: Record<number, string> = {
    28: 'Hành động',
    12: 'Phiêu lưu',
    16: 'Hoạt hình',
    35: 'Hài',
    80: 'Hình sự',
    99: 'Tài liệu',
    18: 'Chính kịch',
    10751: 'Gia đình',
    14: 'Giả tưởng',
    36: 'Lịch sử',
    27: 'Kinh dị',
    10402: 'Nhạc',
    9648: 'Bí ẩn',
    10749: 'Lãng mạn',
    878: 'Khoa học viễn tưởng',
    10770: 'Phim truyền hình',
    53: 'Giật gân',
    10752: 'Chiến tranh',
    37: 'Miền Tây'
};

// Service methods
export const tmdbService = {
    // Lấy danh sách phim đang chiếu
    async getNowPlaying(page: number = 1, region: string = 'VN') {
        try {
            const response = await fetch(
                `${TMDB_BASE_URL}/movie/now_playing?language=vi-VN&page=${page}&region=${region}`,
                { headers }
            );
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching now playing movies:', error);
            throw error;
        }
    },

    // Lấy danh sách phim sắp chiếu
    async getUpcoming(page: number = 1, region: string = 'VN') {
        try {
            const response = await fetch(
                `${TMDB_BASE_URL}/movie/upcoming?language=vi-VN&page=${page}&region=${region}`,
                { headers }
            );
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching upcoming movies:', error);
            throw error;
        }
    },

    // Lấy phim phổ biến
    async getPopular(page: number = 1) {
        try {
            const response = await fetch(
                `${TMDB_BASE_URL}/movie/popular?language=vi-VN&page=${page}`,
                { headers }
            );
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching popular movies:', error);
            throw error;
        }
    },

    // Lấy chi tiết phim
    async getMovieDetail(movieId: number): Promise<TMDBMovieDetail> {
        try {
            const response = await fetch(
                `${TMDB_BASE_URL}/movie/${movieId}?language=vi-VN&append_to_response=images,videos`,
                { headers }
            );
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching movie detail:', error);
            throw error;
        }
    },

    // Tìm kiếm phim
    async searchMovies(query: string, page: number = 1) {
        try {
            const response = await fetch(
                `${TMDB_BASE_URL}/search/movie?language=vi-VN&query=${encodeURIComponent(query)}&page=${page}`,
                { headers }
            );
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error searching movies:', error);
            throw error;
        }
    },

    // Lấy danh sách thể loại
    async getGenres() {
        try {
            const response = await fetch(
                `${TMDB_BASE_URL}/genre/movie/list?language=vi-VN`,
                { headers }
            );
            const data = await response.json();
            return data.genres;
        } catch (error) {
            console.error('Error fetching genres:', error);
            throw error;
        }
    },

    // Convert TMDB movie sang format của app
    convertToAppMovie(tmdbMovie: TMDBMovie): any {
        const genres = tmdbMovie.genre_ids
            .map(id => GENRE_MAPPING[id])
            .filter(Boolean)
            .join(', ');

        return {
            id: tmdbMovie.id,
            title: tmdbMovie.title,
            poster: getTMDBImageUrl(tmdbMovie.poster_path, 'poster', 'medium'),
            posterLarge: getTMDBImageUrl(tmdbMovie.poster_path, 'poster', 'large'),
            backdrop: getTMDBImageUrl(tmdbMovie.backdrop_path, 'backdrop', 'large'),
            backdropOriginal: getTMDBImageUrl(tmdbMovie.backdrop_path, 'backdrop', 'original'),
            genre: genres || 'Đang cập nhật',
            rating: tmdbMovie.vote_average / 2, // Convert từ 0-10 sang 0-5
            duration: 'Đang cập nhật', // Cần gọi API detail để lấy
            ageRating: tmdbMovie.adult ? '18+' : '13+',
            description: tmdbMovie.overview || 'Đang cập nhật nội dung...',
            releaseDate: tmdbMovie.release_date,
            isNew: new Date(tmdbMovie.release_date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Mới trong 30 ngày
            isHot: tmdbMovie.popularity > 100 || tmdbMovie.vote_average > 7.5,
            language: 'Vietsub',
            cast: [], // Cần gọi API detail để lấy
            director: 'Đang cập nhật', // Cần gọi API detail để lấy
            trailer: '', // Cần gọi API detail để lấy
        };
    },

    // Lấy trailer URL từ videos
    getTrailerUrl(videos: TMDBMovieDetail['videos']): string {
        if (!videos || !videos.results.length) return '';

        // Ưu tiên trailer official trên YouTube
        const trailer = videos.results.find(
            video => video.type === 'Trailer' && video.site === 'YouTube' && video.official
        ) || videos.results.find(
            video => video.type === 'Trailer' && video.site === 'YouTube'
        ) || videos.results[0];

        return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : '';
    }
}; 
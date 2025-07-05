import { useState, useEffect, useCallback } from 'react';
import { tmdbService, getTMDBImageUrl } from '../services/tmdbService';
import type { TMDBMovie, TMDBMovieDetail } from '../services/tmdbService';
import type { Movie } from '../types';

interface UseTMDBMoviesOptions {
    type: 'now_playing' | 'upcoming' | 'popular' | 'search';
    page?: number;
    query?: string;
    region?: string;
}

interface UseTMDBMoviesResult {
    movies: Movie[];
    loading: boolean;
    error: string | null;
    totalPages: number;
    totalResults: number;
    fetchNextPage: () => void;
    refetch: () => void;
}

export const useTMDBMovies = ({
    type,
    page = 1,
    query = '',
    region = 'VN'
}: UseTMDBMoviesOptions): UseTMDBMoviesResult => {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalPages, setTotalPages] = useState(0);
    const [totalResults, setTotalResults] = useState(0);
    const [currentPage, setCurrentPage] = useState(page);

    const fetchMovies = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            let data;

            switch (type) {
                case 'now_playing':
                    data = await tmdbService.getNowPlaying(currentPage, region);
                    break;
                case 'upcoming':
                    data = await tmdbService.getUpcoming(currentPage, region);
                    break;
                case 'popular':
                    data = await tmdbService.getPopular(currentPage);
                    break;
                case 'search':
                    if (!query) {
                        setMovies([]);
                        setLoading(false);
                        return;
                    }
                    data = await tmdbService.searchMovies(query, currentPage);
                    break;
                default:
                    throw new Error('Invalid movie type');
            }

            const convertedMovies = data.results.map((movie: TMDBMovie) =>
                tmdbService.convertToAppMovie(movie)
            );

            if (currentPage === 1) {
                setMovies(convertedMovies);
            } else {
                setMovies(prev => [...prev, ...convertedMovies]);
            }

            setTotalPages(data.total_pages);
            setTotalResults(data.total_results);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi tải phim');
            console.error('Error fetching movies:', err);

            // Fallback data khi API lỗi
            const fallbackMovies = [
                {
                    id: 1001,
                    title: 'Avengers: Endgame',
                    poster: 'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
                    backdrop: 'https://image.tmdb.org/t/p/w1280/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg',
                    genre: 'Hành động, Phiêu lưu',
                    rating: 4.5,
                    duration: '181 phút',
                    ageRating: '13+',
                    description: 'Các siêu anh hùng tập hợp lần cuối để đánh bại Thanos.',
                    releaseDate: '2019-04-26',
                    isNew: false,
                    isHot: true,
                    language: 'Tiếng Anh',
                    cast: ['Robert Downey Jr.', 'Chris Evans', 'Mark Ruffalo'],
                    director: 'Anthony Russo, Joe Russo',
                    trailer: 'https://www.youtube.com/watch?v=TcMBFSGVi1c'
                },
                {
                    id: 1002,
                    title: 'Spider-Man: No Way Home',
                    poster: 'https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
                    backdrop: 'https://image.tmdb.org/t/p/w1280/14QbnygCuTO0vl7CAFmPf1fgZfV.jpg',
                    genre: 'Hành động, Phiêu lưu',
                    rating: 4.7,
                    duration: '148 phút',
                    ageRating: '13+',
                    description: 'Peter Parker phải đối mặt với những kẻ thù từ các vũ trụ khác.',
                    releaseDate: '2021-12-17',
                    isNew: false,
                    isHot: true,
                    language: 'Tiếng Anh',
                    cast: ['Tom Holland', 'Zendaya', 'Benedict Cumberbatch'],
                    director: 'Jon Watts',
                    trailer: 'https://www.youtube.com/watch?v=JfVOs4VSpmA'
                },
                {
                    id: 1003,
                    title: 'Black Widow',
                    poster: 'https://image.tmdb.org/t/p/w500/qAZ0pzat24kLdO3o8ejmbLxyOac.jpg',
                    backdrop: 'https://image.tmdb.org/t/p/w1280/keIxh0wPr2Ymj0Btjh4gW7JJ89e.jpg',
                    genre: 'Hành động, Phiêu lưu',
                    rating: 4.2,
                    duration: '134 phút',
                    ageRating: '13+',
                    description: 'Natasha Romanoff đối mặt với quá khứ đen tối của mình.',
                    releaseDate: '2021-07-09',
                    isNew: false,
                    isHot: false,
                    language: 'Tiếng Anh',
                    cast: ['Scarlett Johansson', 'Florence Pugh', 'David Harbour'],
                    director: 'Cate Shortland',
                    trailer: 'https://www.youtube.com/watch?v=ybji16u608U'
                },
                {
                    id: 1004,
                    title: 'Doctor Strange in the Multiverse of Madness',
                    poster: 'https://image.tmdb.org/t/p/w500/9Gtg2DzBhmYamXBS1hKAhiwbBKS.jpg',
                    backdrop: 'https://image.tmdb.org/t/p/w1280/wcKFYIiVDvRURrzglV9kGu7fpfY.jpg',
                    genre: 'Hành động, Giả tưởng',
                    rating: 4.3,
                    duration: '126 phút',
                    ageRating: '13+',
                    description: 'Doctor Strange khám phá đa vũ trụ đầy nguy hiểm.',
                    releaseDate: '2022-05-06',
                    isNew: false,
                    isHot: true,
                    language: 'Tiếng Anh',
                    cast: ['Benedict Cumberbatch', 'Elizabeth Olsen', 'Chiwetel Ejiofor'],
                    director: 'Sam Raimi',
                    trailer: 'https://www.youtube.com/watch?v=aWzlQ2N6qqg'
                },
                {
                    id: 1005,
                    title: 'Thor: Love and Thunder',
                    poster: 'https://image.tmdb.org/t/p/w500/pIkRyD18kl4FhoCNQuWxWu5cBLM.jpg',
                    backdrop: 'https://image.tmdb.org/t/p/w1280/p1F51Lvj3sMopG948F5HsBbl43C.jpg',
                    genre: 'Hành động, Hài',
                    rating: 4.1,
                    duration: '119 phút',
                    ageRating: '13+',
                    description: 'Thor hợp tác với những người bạn cũ để bảo vệ vũ trụ.',
                    releaseDate: '2022-07-08',
                    isNew: false,
                    isHot: false,
                    language: 'Tiếng Anh',
                    cast: ['Chris Hemsworth', 'Natalie Portman', 'Christian Bale'],
                    director: 'Taika Waititi',
                    trailer: 'https://www.youtube.com/watch?v=Go8nTmfrQd8'
                },
                {
                    id: 1006,
                    title: 'Top Gun: Maverick',
                    poster: 'https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg',
                    backdrop: 'https://image.tmdb.org/t/p/w1280/odJ4hx6g6vBt4lBWKFD1tI8WS4x.jpg',
                    genre: 'Hành động, Chính kịch',
                    rating: 4.6,
                    duration: '130 phút',
                    ageRating: '13+',
                    description: 'Pete "Maverick" Mitchell trở lại với một nhiệm vụ đặc biệt.',
                    releaseDate: '2022-05-27',
                    isNew: false,
                    isHot: true,
                    language: 'Tiếng Anh',
                    cast: ['Tom Cruise', 'Miles Teller', 'Jennifer Connelly'],
                    director: 'Joseph Kosinski',
                    trailer: 'https://www.youtube.com/watch?v=qSqVVswa420'
                }
            ];

            // Set fallback data dựa trên type
            if (type === 'now_playing') {
                setMovies(fallbackMovies.slice(0, 4));
            } else if (type === 'upcoming') {
                setMovies(fallbackMovies.slice(2, 6));
            } else if (type === 'popular') {
                setMovies(fallbackMovies);
            }
        } finally {
            setLoading(false);
        }
    }, [type, currentPage, query, region]);

    useEffect(() => {
        fetchMovies();
    }, [fetchMovies]);

    const fetchNextPage = useCallback(() => {
        if (currentPage < totalPages && !loading) {
            setCurrentPage(prev => prev + 1);
        }
    }, [currentPage, totalPages, loading]);

    const refetch = useCallback(() => {
        setCurrentPage(1);
        fetchMovies();
    }, [fetchMovies]);

    return {
        movies,
        loading,
        error,
        totalPages,
        totalResults,
        fetchNextPage,
        refetch
    };
};

// Hook để fetch chi tiết phim
export const useTMDBMovieDetail = (movieId: number | string) => {
    const [movie, setMovie] = useState<TMDBMovieDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMovieDetail = async () => {
            if (!movieId) return;

            setLoading(true);
            setError(null);

            try {
                const data = await tmdbService.getMovieDetail(Number(movieId));
                setMovie(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi tải chi tiết phim');
                console.error('Error fetching movie detail:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchMovieDetail();
    }, [movieId]);

    return { movie, loading, error };
};

// Hook để fetch featured movie cho Hero section
export const useFeaturedMovie = () => {
    const [featuredMovie, setFeaturedMovie] = useState<Movie | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFeaturedMovie = async () => {
            setLoading(true);
            setError(null);

            try {
                // Lấy phim popular đầu tiên làm featured
                const popularData = await tmdbService.getPopular(1);
                if (popularData.results.length > 0) {
                    // Lấy phim có backdrop
                    const movieWithBackdrop = popularData.results.find(
                        (movie: TMDBMovie) => movie.backdrop_path
                    ) || popularData.results[0];

                    // Lấy thêm chi tiết phim
                    const detailData = await tmdbService.getMovieDetail(movieWithBackdrop.id);

                    const converted = tmdbService.convertToAppMovie(movieWithBackdrop);

                    // Bổ sung thông tin từ detail
                    converted.duration = detailData.runtime ? `${detailData.runtime} phút` : 'Đang cập nhật';
                    converted.director = 'Đang cập nhật'; // Cần thêm API credits
                    converted.trailer = tmdbService.getTrailerUrl(detailData.videos);

                    // Lấy logo nếu có
                    if (detailData.images?.logos && detailData.images.logos.length > 0) {
                        converted.logo = tmdbService.getTMDBImageUrl(
                            detailData.images.logos[0].file_path,
                            'logo',
                            'large'
                        );
                    }

                    setFeaturedMovie(converted);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi tải phim nổi bật');
                console.error('Error fetching featured movie:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchFeaturedMovie();
    }, []);

    return { featuredMovie, loading, error };
}; 
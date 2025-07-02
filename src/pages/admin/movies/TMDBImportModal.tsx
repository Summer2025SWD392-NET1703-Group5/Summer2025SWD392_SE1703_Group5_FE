import React, { useState, useEffect } from 'react';
import { XMarkIcon, MagnifyingGlassIcon, ArrowDownTrayIcon, CheckIcon } from '@heroicons/react/24/outline';
import { tmdbService, getTMDBImageUrl } from '../../../services/tmdbService';
import type { TMDBMovie } from '../../../services/tmdbService';
import toast from 'react-hot-toast';

interface TMDBImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (movies: any[]) => void;
}

const TMDBImportModal: React.FC<TMDBImportModalProps> = ({ isOpen, onClose, onImport }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<TMDBMovie[]>([]);
    const [selectedMovies, setSelectedMovies] = useState<Set<number>>(new Set());
    const [loading, setLoading] = useState(false);
    const [searchType, setSearchType] = useState<'search' | 'popular' | 'now_playing' | 'upcoming'>('popular');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    // Fetch movies based on type
    const fetchMovies = async () => {
        setLoading(true);
        try {
            let data;
            switch (searchType) {
                case 'search':
                    if (!searchQuery.trim()) {
                        toast.error('Vui lòng nhập từ khóa tìm kiếm');
                        setLoading(false);
                        return;
                    }
                    data = await tmdbService.searchMovies(searchQuery, page);
                    break;
                case 'popular':
                    data = await tmdbService.getPopular(page);
                    break;
                case 'now_playing':
                    data = await tmdbService.getNowPlaying(page);
                    break;
                case 'upcoming':
                    data = await tmdbService.getUpcoming(page);
                    break;
            }

            setSearchResults(data.results);
            setTotalPages(data.total_pages);
        } catch (error) {
            console.error('Error fetching TMDB movies:', error);
            toast.error('Lỗi khi tải phim từ TMDB');
        } finally {
            setLoading(false);
        }
    };

    // Fetch on mount or when type/page changes
    useEffect(() => {
        if (isOpen && searchType !== 'search') {
            fetchMovies();
        }
    }, [isOpen, searchType, page]);

    // Handle search
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchType === 'search') {
            setPage(1);
            fetchMovies();
        }
    };

    // Toggle movie selection
    const toggleMovieSelection = (movieId: number) => {
        const newSelected = new Set(selectedMovies);
        if (newSelected.has(movieId)) {
            newSelected.delete(movieId);
        } else {
            newSelected.add(movieId);
        }
        setSelectedMovies(newSelected);
    };

    // Select all movies
    const selectAll = () => {
        const allIds = new Set(searchResults.map(movie => movie.id));
        setSelectedMovies(allIds);
    };

    // Deselect all
    const deselectAll = () => {
        setSelectedMovies(new Set());
    };

    // Import selected movies
    const handleImport = async () => {
        if (selectedMovies.size === 0) {
            toast.error('Vui lòng chọn ít nhất một phim');
            return;
        }

        setLoading(true);
        const moviesToImport = [];

        try {
            // Fetch detailed info for each selected movie
            for (const movieId of selectedMovies) {
                try {
                    const detailData = await tmdbService.getMovieDetail(movieId);
                    const convertedMovie = {
                        tmdbId: detailData.id,
                        title: detailData.title,
                        englishTitle: detailData.original_title,
                        description: detailData.overview || 'Đang cập nhật...',
                        poster: getTMDBImageUrl(detailData.poster_path, 'poster', 'large'),
                        backdrop: getTMDBImageUrl(detailData.backdrop_path, 'backdrop', 'original'),
                        genres: detailData.genres.map(g => g.name),
                        duration: detailData.runtime || 120,
                        releaseDate: detailData.release_date,
                        rating: detailData.vote_average / 2, // Convert from 0-10 to 0-5
                        ageRating: detailData.adult ? '18+' : '13+',
                        language: 'Vietsub',
                        cast: [], // Would need credits API
                        director: 'Đang cập nhật',
                        trailer: tmdbService.getTrailerUrl(detailData.videos),
                        status: new Date(detailData.release_date) > new Date() ? 'coming_soon' : 'now_showing'
                    };
                    moviesToImport.push(convertedMovie);
                } catch (error) {
                    console.error(`Error fetching details for movie ${movieId}:`, error);
                }
            }

            if (moviesToImport.length > 0) {
                onImport(moviesToImport);
                toast.success(`Đã import ${moviesToImport.length} phim thành công!`);
                onClose();
            }
        } catch (error) {
            toast.error('Lỗi khi import phim');
            console.error('Import error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-slate-700">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-white">Import Phim từ TMDB</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            <XMarkIcon className="w-6 h-6 text-gray-400" />
                        </button>
                    </div>

                    {/* Search Type Tabs */}
                    <div className="flex gap-2 mt-4">
                        {[
                            { value: 'popular', label: 'Phổ biến' },
                            { value: 'now_playing', label: 'Đang chiếu' },
                            { value: 'upcoming', label: 'Sắp chiếu' },
                            { value: 'search', label: 'Tìm kiếm' }
                        ].map(tab => (
                            <button
                                key={tab.value}
                                onClick={() => {
                                    setSearchType(tab.value as any);
                                    setPage(1);
                                    setSelectedMovies(new Set());
                                }}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${searchType === tab.value
                                    ? 'bg-[#FFD875] text-black'
                                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Search Bar */}
                    {searchType === 'search' && (
                        <form onSubmit={handleSearch} className="mt-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Nhập tên phim để tìm kiếm..."
                                    className="w-full px-4 py-3 pl-12 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#FFD875]"
                                />
                                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <button
                                    type="submit"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-[#FFD875] text-black font-medium rounded-lg hover:bg-[#e5c368] transition-colors"
                                >
                                    Tìm kiếm
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* Selection Info */}
                <div className="px-6 py-3 bg-slate-700/50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <span className="text-gray-300">
                            Đã chọn: <span className="font-bold text-[#FFD875]">{selectedMovies.size}</span> phim
                        </span>
                        <button
                            onClick={selectAll}
                            className="text-sm text-[#FFD875] hover:underline"
                        >
                            Chọn tất cả
                        </button>
                        <button
                            onClick={deselectAll}
                            className="text-sm text-gray-400 hover:text-white"
                        >
                            Bỏ chọn tất cả
                        </button>
                    </div>
                    <button
                        onClick={handleImport}
                        disabled={selectedMovies.size === 0 || loading}
                        className="flex items-center gap-2 px-4 py-2 bg-[#FFD875] text-black font-medium rounded-lg hover:bg-[#e5c368] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ArrowDownTrayIcon className="w-5 h-5" />
                        Import {selectedMovies.size > 0 && `(${selectedMovies.size})`}
                    </button>
                </div>

                {/* Movie Grid */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-280px)]">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFD875]"></div>
                        </div>
                    ) : searchResults.length === 0 ? (
                        <div className="text-center py-20 text-gray-400">
                            {searchType === 'search' ? 'Nhập từ khóa và nhấn tìm kiếm' : 'Không tìm thấy phim nào'}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {searchResults.map(movie => (
                                <div
                                    key={movie.id}
                                    onClick={() => toggleMovieSelection(movie.id)}
                                    className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${selectedMovies.has(movie.id)
                                        ? 'border-[#FFD875] ring-2 ring-[#FFD875]/50'
                                        : 'border-transparent hover:border-slate-600'
                                        }`}
                                >
                                    {/* Selection Indicator */}
                                    {selectedMovies.has(movie.id) && (
                                        <div className="absolute top-2 right-2 z-10 w-6 h-6 bg-[#FFD875] rounded-full flex items-center justify-center">
                                            <CheckIcon className="w-4 h-4 text-black" />
                                        </div>
                                    )}

                                    {/* Poster */}
                                    <img
                                        src={getTMDBImageUrl(movie.poster_path, 'poster', 'medium')}
                                        alt={movie.title}
                                        className="w-full aspect-[2/3] object-cover"
                                    />

                                    {/* Info */}
                                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black via-black/80 to-transparent">
                                        <h3 className="text-white font-medium text-sm line-clamp-2">{movie.title}</h3>
                                        <div className="flex items-center gap-2 text-xs text-gray-300 mt-1">
                                            <span>{new Date(movie.release_date).getFullYear()}</span>
                                            <span>•</span>
                                            <span>⭐ {(movie.vote_average / 2).toFixed(1)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-slate-700 flex items-center justify-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1 || loading}
                            className="px-3 py-1 bg-slate-700 text-white rounded-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Trước
                        </button>
                        <span className="text-gray-300">
                            Trang {page} / {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages || loading}
                            className="px-3 py-1 bg-slate-700 text-white rounded-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Sau
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TMDBImportModal; 
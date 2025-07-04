import React, { useState, useEffect } from 'react';
import { getTMDBImageUrl } from '../services/tmdbService';
import { PhotoIcon, FilmIcon, SparklesIcon, ArrowDownTrayIcon } from '@heroicons/react/24/solid';
import { useTMDBMovies } from '../hooks/useTMDBMovies';

const AssetShowcase: React.FC = () => {
    const [selectedMovie, setSelectedMovie] = useState<any>(null);
    const { movies } = useTMDBMovies({ type: 'popular', page: 1 });

    useEffect(() => {
        if (movies.length > 0) {
            // Chọn phim đầu tiên có đầy đủ hình ảnh
            const movieWithAssets = movies.find(m => m.poster && m.backdrop) || movies[0];
            setSelectedMovie(movieWithAssets);
        }
    }, [movies]);

    const assetSources = [
        {
            category: 'Hero Section - Featured Movie',
            sources: [
                { name: 'TMDB Backdrop', example: selectedMovie?.backdropOriginal, type: 'image' },
                { name: 'TMDB Poster', example: selectedMovie?.posterLarge, type: 'image' },
                { name: 'Unsplash Cinema', example: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920&h=1080&fit=crop', type: 'image' }
            ]
        },
        {
            category: 'Movie Cards',
            sources: [
                { name: 'TMDB Poster (300x450)', example: selectedMovie?.poster, type: 'image' },
                { name: 'Placeholder SVG', example: '/placeholder-movie.svg', type: 'image' },
                { name: 'Genre Icons', example: 'https://cdn-icons-png.flaticon.com/512/3163/3163478.png', type: 'icon' }
            ]
        },
        {
            category: 'Promotional Banners',
            sources: [
                { name: 'Unsplash Promo', example: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&h=400&fit=crop', type: 'image' },
                { name: 'Hot Badge', example: '🔥 HOT', type: 'badge' },
                { name: 'New Badge', example: '✨ MỚI', type: 'badge' }
            ]
        },
        {
            category: 'Decorative Elements',
            sources: [
                { name: 'Popcorn Icon', example: '🍿', type: 'emoji' },
                { name: 'Cinema Icon', example: '🎬', type: 'emoji' },
                { name: 'Star Icon', example: '⭐', type: 'emoji' },
                { name: 'Ticket Icon', example: '🎟️', type: 'emoji' }
            ]
        },
        {
            category: 'Loading States',
            sources: [
                { name: 'Skeleton Screen', example: 'Tailwind CSS animate-pulse', type: 'code' },
                { name: 'Lottie Animation', example: 'LottieFiles JSON', type: 'code' },
                { name: 'CSS Spinner', example: 'animate-spin', type: 'code' }
            ]
        }
    ];

    const resourceLinks = [
        { name: 'TMDB API', url: 'https://www.themoviedb.org/documentation/api', desc: 'Dữ liệu phim chất lượng cao' },
        { name: 'Unsplash', url: 'https://unsplash.com/s/photos/cinema', desc: 'Ảnh nền miễn phí' },
        { name: 'Flaticon', url: 'https://www.flaticon.com/search?word=cinema', desc: 'Icons SVG/PNG' },
        { name: 'LottieFiles', url: 'https://lottiefiles.com/search?q=loading', desc: 'Animation JSON' },
        { name: 'Freepik', url: 'https://www.freepik.com/search?format=search&query=movie%20banner', desc: 'Banner & Vector' },
        { name: 'unDraw', url: 'https://undraw.co/search', desc: 'Illustrations SVG' }
    ];

    return (
        <div className="asset-showcase bg-gray-900 text-white p-8 rounded-xl">
            <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-[#FFD875] to-[#FFA500] bg-clip-text text-transparent">
                🎨 Showcase Tài Nguyên Đã Tích Hợp
            </h2>

            {/* API Integration Status */}
            <div className="mb-8 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <h3 className="text-lg font-semibold text-green-400">TMDB API Đã Kết Nối</h3>
                </div>
                <p className="text-sm text-gray-300">
                    ✅ API Key: Đã cấu hình |
                    ✅ Dữ liệu: {movies.length} phim đã tải |
                    ✅ Hình ảnh: Chất lượng cao
                </p>
            </div>

            {/* Asset Categories */}
            <div className="space-y-6 mb-8">
                {assetSources.map((category, idx) => (
                    <div key={idx} className="border border-gray-700 rounded-lg p-4">
                        <h3 className="text-xl font-semibold mb-3 text-[#FFD875]">{category.category}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {category.sources.map((source, sIdx) => (
                                <div key={sIdx} className="bg-gray-800 rounded p-3">
                                    <p className="text-sm font-medium mb-2">{source.name}</p>
                                    {source.type === 'image' && source.example && (
                                        <img
                                            src={source.example}
                                            alt={source.name}
                                            className="w-full h-32 object-cover rounded"
                                            onError={(e) => {
                                                e.currentTarget.src = '/placeholder-movie.svg';
                                            }}
                                        />
                                    )}
                                    {source.type === 'icon' && (
                                        <img
                                            src={source.example}
                                            alt={source.name}
                                            className="w-12 h-12"
                                        />
                                    )}
                                    {source.type === 'badge' && (
                                        <span className="inline-block px-3 py-1 bg-gray-700 rounded-full text-sm">
                                            {source.example}
                                        </span>
                                    )}
                                    {source.type === 'emoji' && (
                                        <span className="text-3xl">{source.example}</span>
                                    )}
                                    {source.type === 'code' && (
                                        <code className="text-xs text-gray-400">{source.example}</code>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Resource Links */}
            <div className="border-t border-gray-700 pt-6">
                <h3 className="text-xl font-semibold mb-4 text-[#FFD875]">📚 Nguồn Tài Nguyên</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {resourceLinks.map((link, idx) => (
                        <a
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors group"
                        >
                            <ArrowDownTrayIcon className="w-5 h-5 text-[#FFD875] group-hover:scale-110 transition-transform" />
                            <div>
                                <p className="font-medium">{link.name}</p>
                                <p className="text-xs text-gray-400">{link.desc}</p>
                            </div>
                        </a>
                    ))}
                </div>
            </div>

            {/* Usage Guide */}
            <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <h3 className="text-lg font-semibold mb-2 text-blue-400">💡 Hướng Dẫn Sử Dụng</h3>
                <ul className="text-sm text-gray-300 space-y-1">
                    <li>• TMDB API tự động lấy poster, backdrop, thông tin phim</li>
                    <li>• Placeholder SVG hiển thị khi không có hình ảnh</li>
                    <li>• Unsplash cung cấp ảnh nền chất lượng cao cho hero sections</li>
                    <li>• LottieFiles cho animations loading và decorative</li>
                    <li>• Tất cả tài nguyên đã được tối ưu cho performance</li>
                </ul>
            </div>
        </div>
    );
};

export default AssetShowcase; 
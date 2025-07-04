import React from 'react';
import AssetShowcase from '../components/AssetShowcase';
import AnimatedHeroBackground from '../components/AnimatedHeroBackground';
import MovieCard3D from '../components/MovieCard3D';
import { useTMDBMovies } from '../hooks/useTMDBMovies';
import { FloatingIcon, CinemaLoading, SuccessAnimation } from '../components/LottieAnimations';

const AssetsDemo: React.FC = () => {
    const { movies } = useTMDBMovies({ type: 'popular', page: 1 });

    return (
        <div className="min-h-screen bg-black">
            {/* Hero với AnimatedHeroBackground */}
            <section className="relative h-96 overflow-hidden">
                <AnimatedHeroBackground
                    imageUrl="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920&h=1080&fit=crop"
                >
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center z-10">
                            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                                <span className="bg-gradient-to-r from-[#FFD875] to-[#FFA500] bg-clip-text text-transparent">
                                    Galaxy Cinema Assets
                                </span>
                            </h1>
                            <p className="text-xl text-gray-300">Showcase Tài Nguyên & API Integration</p>
                        </div>
                    </div>
                </AnimatedHeroBackground>
            </section>

            {/* Showcase Component */}
            <section className="py-12 px-4 max-w-7xl mx-auto">
                <AssetShowcase />
            </section>

            {/* Demo Movie Cards với data thực từ TMDB */}
            <section className="py-12 px-4 max-w-7xl mx-auto">
                <h2 className="text-3xl font-bold mb-8 text-white text-center">
                    <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                        Movie Cards với TMDB Data
                    </span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {movies.slice(0, 8).map((movie, idx) => (
                        <MovieCard3D
                            key={movie.id}
                            movie={movie}
                            index={idx}
                        />
                    ))}
                </div>
            </section>

            {/* Lottie Animations Demo */}
            <section className="py-12 px-4 max-w-7xl mx-auto">
                <h2 className="text-3xl font-bold mb-8 text-white text-center">
                    <span className="bg-gradient-to-r from-pink-400 to-pink-600 bg-clip-text text-transparent">
                        Lottie Animations
                    </span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-gray-900 rounded-lg p-6 text-center">
                        <h3 className="text-lg font-semibold text-white mb-4">Loading Animation</h3>
                        <div className="h-32 flex items-center justify-center">
                            <CinemaLoading />
                        </div>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-6 text-center">
                        <h3 className="text-lg font-semibold text-white mb-4">Success Animation</h3>
                        <div className="h-32 flex items-center justify-center">
                            <SuccessAnimation />
                        </div>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-6 text-center">
                        <h3 className="text-lg font-semibold text-white mb-4">Floating Icons</h3>
                        <div className="h-32 relative">
                            <FloatingIcon type="star" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Asset Sources */}
            <section className="py-12 px-4 max-w-7xl mx-auto">
                <div className="bg-gradient-to-r from-[#FFD875]/10 to-[#FFA500]/10 rounded-xl p-8 border border-[#FFD875]/30">
                    <h2 className="text-2xl font-bold mb-6 text-[#FFD875]">🎬 Tổng Kết Tài Nguyên</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-white">
                        <div>
                            <h3 className="text-lg font-semibold mb-3 text-[#FFD875]">Đã Tích Hợp:</h3>
                            <ul className="space-y-2 text-sm">
                                <li>✅ TMDB API - Dữ liệu phim real-time</li>
                                <li>✅ Poster & Backdrop chất lượng cao</li>
                                <li>✅ Three.js 3D animations</li>
                                <li>✅ GSAP smooth animations</li>
                                <li>✅ Lottie decorative elements</li>
                                <li>✅ Responsive & optimized images</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-3 text-[#FFD875]">Performance:</h3>
                            <ul className="space-y-2 text-sm">
                                <li>⚡ Lazy loading cho images</li>
                                <li>⚡ Skeleton screens khi loading</li>
                                <li>⚡ Image optimization với TMDB sizes</li>
                                <li>⚡ Fallback placeholder SVG</li>
                                <li>⚡ Cached API responses</li>
                                <li>⚡ Reduced motion support</li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-black/30 rounded-lg">
                        <p className="text-sm text-gray-300">
                            <strong className="text-[#FFD875]">API Key Status:</strong> Active |
                            <strong className="text-[#FFD875] ml-3">Rate Limit:</strong> 40 requests/10 seconds |
                            <strong className="text-[#FFD875] ml-3">Language:</strong> vi-VN
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AssetsDemo; 
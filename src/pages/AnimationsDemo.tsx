import React, { useState } from 'react';
import {
    FloatingIcon,
    CinemaLoading,
    SuccessAnimation,
    MovieTicketAnimation,
    StarRatingAnimation,
    FilmReelAnimation,
    CurtainAnimation,
    PopcornBoxAnimation,
    CinemaSeatAnimation,
    CountdownAnimation
} from '../components/LottieAnimations';
import { mockDataService } from '../services/mockDataService';

const AnimationsDemo: React.FC = () => {
    const [curtainOpen, setCurtainOpen] = useState(false);
    const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

    // Mock data
    const cinemas = mockDataService.getCinemas();
    const showtimes = mockDataService.getShowtimes();
    const userProfile = mockDataService.getUserProfile(1);
    const notifications = mockDataService.getUserNotifications(1);

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            {/* Header */}
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-6xl font-bold mb-4">
                    <span className="bg-gradient-to-r from-[#FFD875] to-[#FFA500] bg-clip-text text-transparent">
                        Galaxy Cinema Animations & Data
                    </span>
                </h1>
                <p className="text-xl text-gray-400">Showcase CSS Animations & Mock Data</p>
            </div>

            {/* Section 1: Basic Animations */}
            <section className="mb-16">
                <h2 className="text-3xl font-bold mb-8 text-[#FFD875]">🎬 Basic Animations</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Floating Icons */}
                    <div className="bg-gray-800 rounded-xl p-6">
                        <h3 className="text-lg font-semibold mb-4">Floating Icons</h3>
                        <div className="relative h-32 flex items-center justify-center gap-8">
                            <FloatingIcon type="popcorn" delay={0} />
                            <FloatingIcon type="cinema" delay={1} />
                            <FloatingIcon type="star" delay={2} />
                        </div>
                    </div>

                    {/* Loading Animation */}
                    <div className="bg-gray-800 rounded-xl p-6">
                        <h3 className="text-lg font-semibold mb-4">Cinema Loading</h3>
                        <div className="h-32 flex items-center justify-center">
                            <CinemaLoading />
                        </div>
                    </div>

                    {/* Success Animation */}
                    <div className="bg-gray-800 rounded-xl p-6">
                        <h3 className="text-lg font-semibold mb-4">Success Check</h3>
                        <div className="h-32 flex items-center justify-center">
                            <SuccessAnimation />
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 2: Cinema Elements */}
            <section className="mb-16">
                <h2 className="text-3xl font-bold mb-8 text-[#FFD875]">🎭 Cinema Elements</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Movie Ticket */}
                    <div className="bg-gray-800 rounded-xl p-6">
                        <h3 className="text-lg font-semibold mb-4">Movie Ticket</h3>
                        <MovieTicketAnimation />
                    </div>

                    {/* Film Reel */}
                    <div className="bg-gray-800 rounded-xl p-6">
                        <h3 className="text-lg font-semibold mb-4">Film Reel</h3>
                        <div className="flex justify-center">
                            <FilmReelAnimation />
                        </div>
                    </div>

                    {/* Popcorn Box */}
                    <div className="bg-gray-800 rounded-xl p-6">
                        <h3 className="text-lg font-semibold mb-4">Popcorn Box</h3>
                        <div className="flex justify-center">
                            <PopcornBoxAnimation />
                        </div>
                    </div>

                    {/* Star Rating */}
                    <div className="bg-gray-800 rounded-xl p-6">
                        <h3 className="text-lg font-semibold mb-4">Star Rating</h3>
                        <div className="flex justify-center">
                            <StarRatingAnimation rating={4.5} />
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 3: Interactive Elements */}
            <section className="mb-16">
                <h2 className="text-3xl font-bold mb-8 text-[#FFD875]">🎪 Interactive Elements</h2>

                <div className="space-y-8">
                    {/* Curtain Animation */}
                    <div className="bg-gray-800 rounded-xl p-6">
                        <h3 className="text-lg font-semibold mb-4">Theater Curtain</h3>
                        <button
                            onClick={() => setCurtainOpen(!curtainOpen)}
                            className="px-6 py-3 bg-[#FFD875] text-black font-bold rounded-lg hover:bg-[#e5c368] transition-colors"
                        >
                            {curtainOpen ? 'Close Curtain' : 'Open Curtain'}
                        </button>
                        <div className="relative h-48 mt-4 bg-gray-700 rounded-lg overflow-hidden">
                            <CurtainAnimation isOpen={curtainOpen} />
                            <div className="flex items-center justify-center h-full">
                                <span className="text-2xl">🎬 The Show Begins!</span>
                            </div>
                        </div>
                    </div>

                    {/* Cinema Seats */}
                    <div className="bg-gray-800 rounded-xl p-6">
                        <h3 className="text-lg font-semibold mb-4">Cinema Seats</h3>
                        <div className="grid grid-cols-8 gap-2 max-w-md mx-auto">
                            {Array.from({ length: 24 }, (_, i) => (
                                <CinemaSeatAnimation
                                    key={i}
                                    isOccupied={i % 5 === 0}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Countdown Timer */}
                    <div className="bg-gray-800 rounded-xl p-6">
                        <h3 className="text-lg font-semibold mb-4">Countdown Timer</h3>
                        <div className="flex justify-center">
                            <CountdownAnimation seconds={10} />
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 4: Mock Data Showcase */}
            <section className="mb-16">
                <h2 className="text-3xl font-bold mb-8 text-[#FFD875]">📊 Mock Data</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Cinemas */}
                    <div className="bg-gray-800 rounded-xl p-6">
                        <h3 className="text-lg font-semibold mb-4">🏢 Cinemas</h3>
                        <div className="space-y-3">
                            {cinemas.map(cinema => (
                                <div key={cinema.id} className="bg-gray-700 rounded-lg p-3">
                                    <h4 className="font-semibold text-[#FFD875]">{cinema.name}</h4>
                                    <p className="text-sm text-gray-400">{cinema.address}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs">⭐ {cinema.rating}</span>
                                        <span className="text-xs">• {cinema.rooms} phòng</span>
                                        <span className="text-xs">• {cinema.seats} ghế</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* User Profile */}
                    <div className="bg-gray-800 rounded-xl p-6">
                        <h3 className="text-lg font-semibold mb-4">👤 User Profile</h3>
                        <div className="flex items-center gap-4 mb-4">
                            <img
                                src={userProfile.avatar}
                                alt={userProfile.name}
                                className="w-16 h-16 rounded-full"
                            />
                            <div>
                                <h4 className="font-semibold text-[#FFD875]">{userProfile.name}</h4>
                                <p className="text-sm text-gray-400">{userProfile.email}</p>
                                <span className="text-xs bg-[#FFD875] text-black px-2 py-1 rounded-full">
                                    {userProfile.membershipLevel} • {userProfile.points} points
                                </span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="bg-gray-700 rounded p-2">
                                <span className="text-gray-400">Total Bookings:</span>
                                <p className="font-semibold">{userProfile.totalBookings}</p>
                            </div>
                            <div className="bg-gray-700 rounded p-2">
                                <span className="text-gray-400">Total Spent:</span>
                                <p className="font-semibold">{userProfile.totalSpent.toLocaleString('vi-VN')}đ</p>
                            </div>
                        </div>
                    </div>

                    {/* Showtimes */}
                    <div className="bg-gray-800 rounded-xl p-6">
                        <h3 className="text-lg font-semibold mb-4">🕐 Showtimes</h3>
                        <div className="grid grid-cols-3 gap-2">
                            {showtimes.slice(0, 6).map(showtime => (
                                <div key={showtime.id} className="bg-gray-700 rounded-lg p-2 text-center">
                                    <p className="font-bold text-[#FFD875]">{showtime.startTime}</p>
                                    <p className="text-xs text-gray-400">{showtime.type}</p>
                                    <p className="text-xs">{showtime.price.toLocaleString('vi-VN')}đ</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Notifications */}
                    <div className="bg-gray-800 rounded-xl p-6">
                        <h3 className="text-lg font-semibold mb-4">🔔 Notifications</h3>
                        <div className="space-y-2">
                            {notifications.map(notif => (
                                <div key={notif.id} className={`bg-gray-700 rounded-lg p-3 ${!notif.read ? 'border-l-4 border-[#FFD875]' : ''}`}>
                                    <div className="flex items-start gap-2">
                                        <span className="text-2xl">{notif.icon}</span>
                                        <div className="flex-1">
                                            <h5 className="font-semibold text-sm">{notif.title}</h5>
                                            <p className="text-xs text-gray-400">{notif.message}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <div className="text-center text-gray-500 text-sm">
                <p>Created with ❤️ for Galaxy Cinema</p>
                <p>All animations are pure CSS - No external dependencies!</p>
            </div>
        </div>
    );
};

export default AnimationsDemo; 
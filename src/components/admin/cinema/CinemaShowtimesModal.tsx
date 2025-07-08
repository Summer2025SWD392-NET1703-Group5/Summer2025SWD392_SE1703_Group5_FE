import React, { useState, useEffect } from 'react';
import { XMarkIcon, FilmIcon, CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';
import { cinemaService } from '../../../services/cinemaService';
import FullScreenLoader from '../../FullScreenLoader';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

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
    Poster_URL?: string;
}

interface Cinema {
    Cinema_ID: number;
    Cinema_Name: string;
}

interface CinemaShowtimesModalProps {
    isOpen: boolean;
    onClose: () => void;
    cinema: Cinema | null;
}

const CinemaShowtimesModal: React.FC<CinemaShowtimesModalProps> = ({ isOpen, onClose, cinema }) => {
    const [loading, setLoading] = useState(true);
    const [showtimes, setShowtimes] = useState<Showtime[]>([]);
    const [dateFilter, setDateFilter] = useState<string>(format(new Date(), 'yyyy-MM-dd'));

    useEffect(() => {
        if (isOpen && cinema) {
            fetchShowtimes();
        }
    }, [isOpen, cinema, dateFilter]);

    const fetchShowtimes = async () => {
        if (!cinema) return;

        setLoading(true);
        try {
            let fetchedShowtimes = await cinemaService.getCinemaShowtimes(cinema.Cinema_ID);

            // Filter showtimes by the selected date
            if (dateFilter) {
                fetchedShowtimes = fetchedShowtimes.filter(showtime => {
                    const showtimeDate = new Date(showtime.Start_Time).toISOString().split('T')[0];
                    return showtimeDate === dateFilter;
                });
            }

            setShowtimes(fetchedShowtimes);
        } catch (error) {
            console.error('Error fetching showtimes:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (dateString: string) => {
        try {
            return format(new Date(dateString), 'HH:mm', { locale: vi });
        } catch {
            return 'Invalid Date';
        }
    };

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'EEEE, dd/MM/yyyy', { locale: vi });
        } catch {
            return 'Invalid Date';
        }
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDateFilter(e.target.value);
    };

    // Group showtimes by movie
    const showtimesByMovie = showtimes.reduce((acc, showtime) => {
        if (!acc[showtime.Movie_ID]) {
            acc[showtime.Movie_ID] = {
                movie: {
                    Movie_ID: showtime.Movie_ID,
                    Movie_Name: showtime.Movie_Name,
                    Poster_URL: showtime.Poster_URL || ''
                },
                showtimes: []
            };
        }
        acc[showtime.Movie_ID].showtimes.push(showtime);
        return acc;
    }, {} as Record<number, {
        movie: { Movie_ID: number; Movie_Name: string; Poster_URL: string },
        showtimes: Showtime[]
    }>);

    const getNextDays = (days: number) => {
        const result = [];
        const today = new Date();

        for (let i = 0; i < days; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            result.push({
                value: format(date, 'yyyy-MM-dd'),
                label: format(date, 'dd/MM (EEEE)', { locale: vi })
            });
        }

        return result;
    };

    const nextDays = getNextDays(7);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
            <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden transform transition-all">
                <div className="bg-slate-700 px-6 py-4 flex items-center justify-between">
                    <h3 className="text-lg font-medium text-white flex items-center">
                        <FilmIcon className="w-5 h-5 mr-2 text-[#FFD875]" />
                        Lịch chiếu phim - {cinema?.Cinema_Name}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-4rem)]">
                    <div className="mb-6">
                        <label className="block text-gray-300 mb-2">Chọn ngày:</label>
                        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                            {nextDays.map(day => (
                                <button
                                    key={day.value}
                                    className={`py-2 px-2 rounded-lg text-center text-sm transition-all ${dateFilter === day.value
                                            ? 'bg-[#FFD875] text-black font-medium'
                                            : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                                        }`}
                                    onClick={() => setDateFilter(day.value)}
                                >
                                    {day.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-8">
                            <FullScreenLoader variant="inline" text="Đang tải lịch chiếu..." />
                        </div>
                    ) : Object.values(showtimesByMovie).length > 0 ? (
                        <div className="space-y-6">
                            {Object.values(showtimesByMovie).map(({ movie, showtimes }) => (
                                <div key={movie.Movie_ID} className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                                    <div className="flex mb-4 items-center">
                                        <div className="w-16 h-20 overflow-hidden rounded bg-slate-600 mr-4">
                                            {movie.Poster_URL ? (
                                                <img
                                                    src={movie.Poster_URL}
                                                    alt={movie.Movie_Name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <FilmIcon className="w-8 h-8" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="text-white font-semibold text-lg">{movie.Movie_Name}</h4>
                                            <p className="text-gray-400 flex items-center text-sm">
                                                <CalendarIcon className="w-4 h-4 mr-1" />
                                                {formatDate(showtimes[0].Start_Time)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-3">
                                        <h5 className="text-sm text-gray-300 mb-2">Suất chiếu:</h5>
                                        <div className="flex flex-wrap gap-2">
                                            {showtimes.sort((a, b) =>
                                                new Date(a.Start_Time).getTime() - new Date(b.Start_Time).getTime()
                                            ).map(showtime => (
                                                <div
                                                    key={showtime.Showtime_ID}
                                                    className="bg-slate-800 px-3 py-2 rounded-lg border border-slate-600 hover:border-[#FFD875] transition-all"
                                                >
                                                    <div className="font-medium text-white flex items-center">
                                                        <ClockIcon className="w-4 h-4 mr-1 text-[#FFD875]" />
                                                        {formatTime(showtime.Start_Time)}
                                                    </div>
                                                    <div className="text-sm text-gray-400 mt-1">
                                                        Phòng: {showtime.Room_Name}
                                                    </div>
                                                    <div className="text-sm text-[#FFD875] mt-1 text-right">
                                                        {new Intl.NumberFormat('vi-VN').format(showtime.Price)}đ
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-400">
                            Không có lịch chiếu nào cho ngày {format(new Date(dateFilter), 'dd/MM/yyyy')}
                        </div>
                    )}

                    <div className="flex justify-end mt-6">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-[#FFD875] text-black rounded-lg hover:bg-opacity-90 transition-colors"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CinemaShowtimesModal; 
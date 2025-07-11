import React, { useState, useEffect } from 'react';
import { XMarkIcon, FilmIcon, CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';
import { cinemaService } from '../../../services/cinemaService';
import LoadingSpinner from '../../LoadingSpinner';
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
            // Sử dụng getCinemaShowtimesByDate thay vì getCinemaShowtimes
            const showtimesData = await cinemaService.getCinemaShowtimesByDate(cinema.Cinema_ID, dateFilter);
            console.log('Fetched showtimes:', showtimesData);
            
            // Map data to match interface
            const mappedShowtimes: Showtime[] = showtimesData.map((st: any) => ({
                Showtime_ID: st.Showtime_ID || st.showtime_id,
                Movie_ID: st.Movie_ID || st.movie_id,
                Movie_Name: st.Movie_Name || st.movie_name,
                Room_ID: st.Room_ID || st.room_id,
                Room_Name: st.Room_Name || st.room_name,
                Start_Time: st.Start_Time || st.start_time,
                End_Time: st.End_Time || st.end_time,
                Price: st.Price || 0,
                Status: st.Status || 'Active',
                Poster_URL: st.Poster_URL || st.poster_url
            }));
            
            console.log('Sample showtime data:', mappedShowtimes[0]); // Debug log

            setShowtimes(mappedShowtimes);
        } catch (error) {
            console.error('Error fetching showtimes:', error);
            setShowtimes([]);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (timeString: string) => {
        try {
            // Nếu timeString chỉ là giờ (HH:mm hoặc HH:mm:ss)
            if (/^\d{2}:\d{2}(:\d{2})?$/.test(timeString)) {
                return timeString.substring(0, 5);
            }
            
            // Nếu timeString là datetime đầy đủ
            const date = new Date(timeString);
            if (!isNaN(date.getTime())) {
                return format(date, 'HH:mm', { locale: vi });
            }
            
            return timeString;
        } catch {
            return timeString;
        }
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            if (!isNaN(date.getTime())) {
                return format(date, 'EEEE, dd/MM/yyyy', { locale: vi });
            }
            return dateString;
        } catch {
            return dateString;
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
                label: format(date, 'dd/MM', { locale: vi }),
                dayName: format(date, 'EEEE', { locale: vi })
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
                                    className={`py-2 px-3 rounded-lg text-center text-sm transition-all ${dateFilter === day.value
                                            ? 'bg-[#FFD875] text-black font-medium'
                                            : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                                        }`}
                                    onClick={() => setDateFilter(day.value)}
                                >
                                    <div className="font-medium">{day.label}</div>
                                    <div className="text-xs">{day.dayName}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-8">
                            <LoadingSpinner />
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
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    TicketIcon,
    ClockIcon,
    FilmIcon,
    ChevronDownIcon,
    ArrowRightIcon
} from '@heroicons/react/24/outline';
import { ticketService, type Ticket } from '../services/ticketService';

interface TicketDropdownProps {
    className?: string;
}

const TicketDropdown: React.FC<TicketDropdownProps> = ({ className = '' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Close dropdown when clicking outside
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        // Fetch tickets when dropdown is opened
        if (isOpen && tickets.length === 0) {
            fetchTickets();
        }
    }, [isOpen]);

    const fetchTickets = async () => {
        try {
            setIsLoading(true);
            const response = await ticketService.getMyTickets();

            if (response && 'tickets' in response && Array.isArray(response.tickets)) {
                // Sort tickets by booking_date (newest first) and take first 3
                const sortedTickets = response.tickets.sort((a, b) =>
                    new Date(b.booking_date).getTime() - new Date(a.booking_date).getTime()
                );
                setTickets(sortedTickets.slice(0, 3));
            } else if (response && Array.isArray(response)) {
                // Sort tickets by booking_date (newest first) and take first 3
                const sortedTickets = [...response].sort((a, b) =>
                    new Date(b.booking_date).getTime() - new Date(a.booking_date).getTime()
                );
                setTickets(sortedTickets.slice(0, 3));
            }
        } catch (error) {
            console.error('Error fetching tickets:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            month: 'short',
            day: 'numeric',
        });
    };

    const formatTime = (timeString: string) => {
        if (!timeString) return '';
        try {
            const date = new Date(timeString);
            return date.toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch (error) {
            return timeString;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active':
                return 'bg-green-500';
            case 'used':
                return 'bg-blue-500';
            case 'expired':
                return 'bg-gray-500';
            case 'cancelled':
                return 'bg-red-500';
            default:
                return 'bg-yellow-500';
        }
    };

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 group ticket-dropdown-glow ${isOpen ? 'text-[#FFD875] bg-[#FFD875]/10 ticket-dropdown-active' : 'text-gray-300 hover:text-[#FFD875] hover:bg-[#FFD875]/5'
                    }`}
            >
                <TicketIcon className={`w-5 h-5 ${isOpen ? 'text-[#FFD875]' : 'group-hover:text-[#FFD875]'}`} />
                <span className="font-medium">Vé Của Tôi</span>
                <ChevronDownIcon className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-80 glass-dark rounded-xl shadow-2xl border border-gray-700/50 z-50 animate-fadeInUp overflow-hidden ticket-dropdown-active">
                    <div className="p-3 border-b border-gray-700/50">
                        <h3 className="text-[#FFD875] font-medium">Vé gần đây</h3>
                    </div>

                    <div className="max-h-80 overflow-y-auto py-2 hide-scrollbar scrollbar-hide">
                        {isLoading ? (
                            <div className="flex justify-center items-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#ffd875]"></div>
                            </div>
                        ) : tickets.length > 0 ? (
                            <>
                                {tickets.map(ticket => (
                                    <Link
                                        key={ticket.ticket_id}
                                        to={`/profile/tickets/${ticket.ticket_id}`}
                                        className="block px-4 py-3 hover:bg-[#FFD875]/5 transition-colors border-b border-gray-700/30 last:border-0 ticket-item-hover"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <div className="flex items-start space-x-3">
                                            <div className="relative">
                                                {ticket.movie_info.poster_url ? (
                                                    <img
                                                        src={ticket.movie_info.poster_url}
                                                        alt={ticket.movie_info.movie_name}
                                                        className="w-10 h-14 object-cover rounded-md"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-14 bg-[#ffd875]/20 rounded-md flex items-center justify-center">
                                                        <FilmIcon className="w-6 h-6 text-[#ffd875]" />
                                                    </div>
                                                )}
                                                <div className={`absolute -top-1 -right-1 w-3 h-3 ${getStatusColor(ticket.status)} rounded-full border border-slate-800`}></div>
                                            </div>

                                            <div className="flex-1">
                                                <h4 className="text-white font-medium text-sm line-clamp-1">{ticket.movie_info.movie_name}</h4>
                                                <div className="flex items-center text-xs text-gray-400 mt-1">
                                                    <ClockIcon className="w-3 h-3 mr-1" />
                                                    <span>{formatDate(ticket.showtime_info.show_date)} • {formatTime(ticket.showtime_info.start_time)}</span>
                                                </div>
                                                <div className="mt-1 flex items-center justify-between">
                                                    <span className="text-xs bg-slate-700 px-2 py-0.5 rounded-full text-gray-300">
                                                        {ticket.showtime_info.cinema_name}, {ticket.showtime_info.room_name} • Ghế {ticket.seat_info}
                                                    </span>
                                                    <span className="text-xs text-[#FFD875]">{ticket.ticket_code}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                                <div className="p-3 border-t border-gray-700/50">
                                    <Link
                                        to="/profile/tickets"
                                        className="flex items-center justify-center space-x-2 w-full py-2 bg-[#FFD875]/10 hover:bg-[#FFD875]/20 text-[#FFD875] rounded-lg transition-all duration-300 hover:shadow-[0_0_10px_rgba(255,216,117,0.3)]"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <span>Xem tất cả vé</span>
                                        <ArrowRightIcon className="w-4 h-4" />
                                    </Link>
                                </div>
                            </>
                        ) : (
                            <div className="py-8 text-center">
                                <TicketIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                                <p className="text-gray-400 text-sm">Bạn chưa có vé nào</p>
                                <Link
                                    to="/movies"
                                    className="mt-3 inline-block px-4 py-2 bg-[#FFD875]/10 text-[#FFD875] rounded-lg hover:bg-[#FFD875]/20 transition-colors text-sm"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Đặt vé ngay
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TicketDropdown; 
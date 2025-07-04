// pages/MyTicketsPage.tsx
import React, { useState, useEffect } from 'react';
import { 
  TicketIcon, 
  CalendarIcon, 
  ClockIcon, 
  MapPinIcon,
  QrCodeIcon,
  EyeIcon,
  ShareIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

interface Ticket {
  id: string;
  bookingCode: string;
  movieTitle: string;
  moviePoster: string;
  cinema: string;
  cinemaAddress: string;
  date: string;
  time: string;
  room: string;
  seats: string[];
  totalPrice: number;
  status: 'upcoming' | 'completed' | 'cancelled';
  bookingDate: string;
}

const MyTicketsPage: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchTickets = async () => {
      setLoading(true);
      
      // Mock data
      const mockTickets: Ticket[] = [
        {
          id: '1',
          bookingCode: 'BK1701234567',
          movieTitle: 'Spider-Man: No Way Home',
          moviePoster: '/api/placeholder/300/450',
          cinema: 'CGV Vincom Center',
          cinemaAddress: '191 Bà Triệu, Hai Bà Trưng, Hà Nội',
          date: '2023-11-25',
          time: '19:30',
          room: 'Phòng 1',
          seats: ['F7', 'F8'],
          totalPrice: 170000,
          status: 'upcoming',
          bookingDate: '2023-11-20T10:30:00'
        },
        {
          id: '2',
          bookingCode: 'BK1701234568',
          movieTitle: 'Avengers: Endgame',
          moviePoster: '/api/placeholder/300/450',
          cinema: 'CGV Aeon Mall',
          cinemaAddress: '27 Cổ Linh, Long Biên, Hà Nội',
          date: '2023-11-15',
          time: '21:00',
          room: 'Phòng 3',
          seats: ['G5', 'G6', 'G7'],
          totalPrice: 240000,
          status: 'completed',
          bookingDate: '2023-11-10T15:20:00'
        },
        {
          id: '3',
          bookingCode: 'BK1701234569',
          movieTitle: 'The Batman',
          moviePoster: '/api/placeholder/300/450',
          cinema: 'CGV Vincom Center',
          cinemaAddress: '191 Bà Triệu, Hai Bà Trưng, Hà Nội',
          date: '2023-11-10',
          time: '20:15',
          room: 'Phòng 2',
          seats: ['E10'],
          totalPrice: 90000,
          status: 'cancelled',
          bookingDate: '2023-11-05T09:15:00'
        }
      ];

      setTimeout(() => {
        setTickets(mockTickets);
        setLoading(false);
      }, 1000);
    };

    fetchTickets();
  }, []);

  const filteredTickets = tickets.filter(ticket => ticket.status === activeTab);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'text-green-400 bg-green-400/10';
      case 'completed': return 'text-blue-400 bg-blue-400/10';
      case 'cancelled': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'upcoming': return 'Sắp chiếu';
      case 'completed': return 'Đã xem';
      case 'cancelled': return 'Đã hủy';
      default: return 'Không xác định';
    }
  };

  const handleViewTicket = (ticket: Ticket) => {
    // Navigate to ticket detail
    console.log('View ticket:', ticket);
  };

  const handleShareTicket = (ticket: Ticket) => {
    if (navigator.share) {
      navigator.share({
        title: `Vé xem phim ${ticket.movieTitle}`,
        text: `Tôi sẽ xem ${ticket.movieTitle} tại ${ticket.cinema} vào ${ticket.date} lúc ${ticket.time}`,
      });
    }
  };

  const handleDownloadTicket = (ticket: Ticket) => {
    // Generate and download PDF
    alert('Tính năng tải vé sẽ được cập nhật sớm!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-700 rounded w-1/4"></div>
            <div className="flex space-x-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-10 bg-slate-700 rounded w-24"></div>
              ))}
            </div>
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-slate-800 rounded-xl p-6">
                <div className="flex space-x-4">
                  <div className="w-20 h-28 bg-slate-700 rounded"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-6 bg-slate-700 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                    <div className="h-4 bg-slate-700 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Vé của tôi</h1>
          <p className="text-gray-400">Quản lý và xem lại các vé đã đặt</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-slate-800 rounded-lg p-1 mb-8 max-w-md">
          {[
            { key: 'upcoming', label: 'Sắp chiếu', count: tickets.filter(t => t.status === 'upcoming').length },
            { key: 'completed', label: 'Đã xem', count: tickets.filter(t => t.status === 'completed').length },
            { key: 'cancelled', label: 'Đã hủy', count: tickets.filter(t => t.status === 'cancelled').length }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-yellow-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Tickets List */}
        {filteredTickets.length === 0 ? (
          <div className="text-center py-16">
            <TicketIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              Không có vé nào
            </h3>
            <p className="text-gray-500 mb-6">
              {activeTab === 'upcoming' && 'Bạn chưa có vé nào sắp chiếu'}
              {activeTab === 'completed' && 'Bạn chưa xem phim nào'}
              {activeTab === 'cancelled' && 'Bạn chưa hủy vé nào'}
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-yellow-600 hover:bg-yellow-500 text-white py-2 px-6 rounded-lg transition-colors"
            >
              Đặt vé ngay
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredTickets.map(ticket => (
              <div key={ticket.id} className="bg-slate-800 rounded-xl overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6">
                    {/* Movie Poster */}
                    <div className="flex-shrink-0">
                      <img
                        src={ticket.moviePoster}
                        alt={ticket.movieTitle}
                        className="w-20 h-28 object-cover rounded-lg"
                      />
                    </div>

                    {/* Ticket Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-white mb-1">
                            {ticket.movieTitle}
                          </h3>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                            {getStatusText(ticket.status)}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-yellow-400">
                            {ticket.totalPrice.toLocaleString()}đ
                          </div>
                          <div className="text-sm text-gray-400">
                            {ticket.bookingCode}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <MapPinIcon className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="font-medium">{ticket.cinema}</p>
                              <p className="text-gray-400 text-xs">{ticket.cinemaAddress}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <CalendarIcon className="w-4 h-4 text-gray-400" />
                            <span>{new Date(ticket.date).toLocaleDateString('vi-VN')}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <ClockIcon className="w-4 h-4 text-gray-400" />
                            <span>{ticket.time} - {ticket.room}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <TicketIcon className="w-4 h-4 text-gray-400" />
                            <span>Ghế: {ticket.seats.join(', ')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-slate-700">
                    {ticket.status === 'upcoming' && (
                      <>
                        <button
                          onClick={() => handleViewTicket(ticket)}
                          className="flex items-center space-x-2 bg-yellow-600 hover:bg-yellow-500 text-white py-2 px-4 rounded-lg transition-colors"
                        >
                          <QrCodeIcon className="w-4 h-4" />
                          <span>Xem mã QR</span>
                        </button>
                        
                        <button
                          onClick={() => handleShareTicket(ticket)}
                          className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 text-white py-2 px-4 rounded-lg transition-colors"
                        >
                          <ShareIcon className="w-4 h-4" />
                          <span>Chia sẻ</span>
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => handleViewTicket(ticket)}
                      className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 text-white py-2 px-4 rounded-lg transition-colors"
                    >
                      <EyeIcon className="w-4 h-4" />
                      <span>Xem chi tiết</span>
                    </button>

                    <button
                      onClick={() => handleDownloadTicket(ticket)}
                      className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 text-white py-2 px-4 rounded-lg transition-colors"
                    >
                      <ArrowDownTrayIcon className="w-4 h-4" />
                      <span>Tải PDF</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTicketsPage;

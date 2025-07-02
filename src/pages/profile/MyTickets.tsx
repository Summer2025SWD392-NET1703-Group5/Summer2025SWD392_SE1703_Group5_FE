import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  CalendarIcon, 
  MapPinIcon,
  ClockIcon,
  ChevronDownIcon,
  TicketIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon, XCircleIcon, ClockIcon as ClockSolidIcon } from '@heroicons/react/24/solid';
import QRCode from 'qrcode';

interface Ticket {
  id: string;
  movieTitle: string;
  moviePoster: string;
  cinemaName: string;
  roomNumber: string;
  showDate: string;
  showTime: string;
  seats: string[];
  totalPrice: number;
  status: 'confirmed' | 'cancelled' | 'expired';
  bookingCode: string;
  bookingDate: string;
}

const MyTickets: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedTickets, setExpandedTickets] = useState<Set<string>>(new Set());
  const [qrCodes, setQrCodes] = useState<{ [key: string]: string }>({});
  const ticketsPerPage = 6;

  // Mock data
  useEffect(() => {
    const mockTickets: Ticket[] = [
      {
        id: '1',
        movieTitle: 'BIỆT ĐỘI SĂM SÉT',
        moviePoster: 'https://via.placeholder.com/150x200',
        cinemaName: 'Galaxy Thủ Đức',
        roomNumber: 'Phòng 01',
        showDate: '21 tháng 6, 2025',
        showTime: '19:30',
        seats: ['B10'],
        totalPrice: 119000,
        status: 'confirmed',
        bookingCode: '3BO6JE7R',
        bookingDate: '19 tháng 6, 2025'
      },
      {
        id: '2',
        movieTitle: 'AVENGERS: ENDGAME',
        moviePoster: 'https://via.placeholder.com/150x200',
        cinemaName: 'Galaxy Nguyễn Du',
        roomNumber: 'Phòng 03',
        showDate: '22 tháng 6, 2025',
        showTime: '21:00',
        seats: ['D5', 'D6'],
        totalPrice: 238000,
        status: 'confirmed',
        bookingCode: 'AV3ND3RS',
        bookingDate: '20 tháng 6, 2025'
      },
    ];
    setTickets(mockTickets);
    setFilteredTickets(mockTickets);
  }, []);

  // Generate QR codes for tickets
  useEffect(() => {
    const generateQRCodes = async () => {
      const codes: { [key: string]: string } = {};
      for (const ticket of filteredTickets) {
        try {
          const qrData = JSON.stringify({
            code: ticket.bookingCode,
            movie: ticket.movieTitle,
            date: ticket.showDate,
            time: ticket.showTime,
            seats: ticket.seats.join(', ')
          });
          const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
            width: 120,
            margin: 1,
            color: {
              dark: '#FFD875',
              light: '#1e293b'
            }
          });
          codes[ticket.id] = qrCodeDataUrl;
        } catch (error) {
          console.error('Error generating QR code:', error);
        }
      }
      setQrCodes(codes);
    };

    generateQRCodes();
  }, [filteredTickets]);

  // Filter tickets
  useEffect(() => {
    let filtered = tickets;

    if (searchTerm) {
      filtered = filtered.filter(ticket =>
        ticket.movieTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.bookingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.cinemaName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === statusFilter);
    }

    setFilteredTickets(filtered);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, tickets]);

  const indexOfLastTicket = currentPage * ticketsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
  const currentTickets = filteredTickets.slice(indexOfFirstTicket, indexOfLastTicket);
  const totalPages = Math.ceil(filteredTickets.length / ticketsPerPage);

  const toggleTicketExpansion = (ticketId: string) => {
    const newExpanded = new Set(expandedTickets);
    if (newExpanded.has(ticketId)) {
      newExpanded.delete(ticketId);
    } else {
      newExpanded.add(ticketId);
    }
    setExpandedTickets(newExpanded);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <div className="flex items-center gap-1 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <CheckCircleIcon className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-emerald-400">Đã xác nhận</span>
          </div>
        );
      case 'cancelled':
        return (
          <div className="flex items-center gap-1 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full">
            <XCircleIcon className="w-4 h-4 text-red-400" />
            <span className="text-xs text-red-400">Đã hủy</span>
          </div>
        );
      case 'expired':
        return (
          <div className="flex items-center gap-1 px-3 py-1 bg-slate-500/10 border border-slate-500/20 rounded-full">
            <ClockSolidIcon className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-400">Đã hết hạn</span>
          </div>
        );
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with glowing effect */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#FFD875]/20 to-transparent blur-3xl"></div>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative flex items-center gap-3 mb-6"
        >
          <div className="p-3 bg-gradient-to-br from-[#FFD875]/20 to-[#FFC107]/20 rounded-xl backdrop-blur-sm border border-[#FFD875]/20">
            <TicketIcon className="w-6 h-6 text-[#FFD875]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-[#FFD875] to-[#FFC107] bg-clip-text text-transparent">
              Vé của tôi
            </h2>
            <p className="text-sm text-slate-400 mt-1">Quản lý và xem lại vé đã đặt</p>
          </div>
        </motion.div>
      </div>

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên phim, mã vé..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-[#FFD875]/50 focus:shadow-[0_0_20px_rgba(255,216,117,0.1)] transition-all duration-300"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:border-[#FFD875]/50 focus:shadow-[0_0_20px_rgba(255,216,117,0.1)] transition-all duration-300"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="confirmed">Đã xác nhận</option>
          <option value="cancelled">Đã hủy</option>
          <option value="expired">Đã hết hạn</option>
        </select>
      </motion.div>

      {/* Tickets Grid with Animation */}
      {currentTickets.length > 0 ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {currentTickets.map((ticket) => (
              <motion.div
                key={ticket.id}
                variants={itemVariants}
                layout
                whileHover={{ scale: 1.02 }}
                className="relative overflow-hidden bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-[#FFD875]/10 shadow-[0_0_30px_rgba(255,216,117,0.05)] hover:shadow-[0_0_40px_rgba(255,216,117,0.1)] transition-all duration-500"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#FFD875]/[0.02] to-transparent"></div>
                
                {/* Ticket Content */}
                <div className="relative p-6">
                  <div className="flex gap-6">
                    {/* Movie Poster */}
                    <div className="relative group flex-shrink-0">
                      <div className="absolute inset-0 bg-gradient-to-t from-[#FFD875]/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <img
                        src={ticket.moviePoster}
                        alt={ticket.movieTitle}
                        className="w-24 h-32 object-cover rounded-xl shadow-lg"
                      />
                    </div>

                    {/* Ticket Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-white mb-1">{ticket.movieTitle}</h3>
                          <div className="flex items-center gap-2 text-sm text-slate-400">
                            <MapPinIcon className="w-4 h-4 text-[#FFD875]" />
                            {ticket.cinemaName} - {ticket.roomNumber}
                          </div>
                        </div>
                        {getStatusBadge(ticket.status)}
                      </div>

                      {/* Show Details */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Ngày chiếu</p>
                          <div className="flex items-center gap-1 text-sm text-slate-300">
                            <CalendarIcon className="w-3.5 h-3.5 text-[#FFD875]" />
                            {ticket.showDate}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Giờ chiếu</p>
                          <div className="flex items-center gap-1 text-sm text-slate-300">
                            <ClockIcon className="w-3.5 h-3.5 text-[#FFD875]" />
                            {ticket.showTime}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Ghế</p>
                          <p className="text-sm font-medium text-[#FFD875]">{ticket.seats.join(', ')}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Giá vé</p>
                          <p className="text-sm font-bold text-[#FFD875] drop-shadow-[0_0_8px_rgba(255,216,117,0.5)]">
                            {ticket.totalPrice.toLocaleString('vi-VN')}đ
                          </p>
                        </div>
                      </div>

                      {/* Booking Info */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-slate-500">Mã vé:</span>
                          <span className="font-mono font-bold text-[#FFD875] bg-[#FFD875]/10 px-3 py-1 rounded-lg">
                            {ticket.bookingCode}
                          </span>
                        </div>
                        <button
                          onClick={() => toggleTicketExpansion(ticket.id)}
                          className="flex items-center gap-1 text-sm text-[#FFD875] hover:text-[#FFC107] transition-colors"
                        >
                          <span>Chi tiết</span>
                          <ChevronDownIcon
                            className={`w-4 h-4 transition-transform duration-300 ${
                              expandedTickets.has(ticket.id) ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* QR Code */}
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <div className="absolute inset-0 bg-[#FFD875]/10 blur-xl"></div>
                        <div className="relative bg-slate-900/80 p-2 rounded-xl border border-[#FFD875]/20 shadow-[0_0_20px_rgba(255,216,117,0.2)]">
                          {qrCodes[ticket.id] && (
                            <img
                              src={qrCodes[ticket.id]}
                              alt="QR Code"
                              className="w-24 h-24"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {expandedTickets.has(ticket.id) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 pt-4 border-t border-slate-700/50 overflow-hidden"
                      >
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-slate-500">Ngày đặt:</span>
                            <span className="ml-2 text-slate-300">{ticket.bookingDate}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Trạng thái thanh toán:</span>
                            <span className="ml-2 text-emerald-400">Đã thanh toán</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <TicketIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">Không tìm thấy vé nào</p>
        </motion.div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center items-center gap-2"
        >
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-[#FFD875] hover:border-[#FFD875]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            <ChevronDownIcon className="w-5 h-5 rotate-90" />
          </button>
          
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index + 1}
              onClick={() => setCurrentPage(index + 1)}
              className={`w-10 h-10 rounded-lg font-medium transition-all duration-300 ${
                currentPage === index + 1
                  ? 'bg-gradient-to-r from-[#FFD875] to-[#FFC107] text-black shadow-[0_0_20px_rgba(255,216,117,0.4)]'
                  : 'bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-[#FFD875] hover:border-[#FFD875]/50'
              }`}
            >
              {index + 1}
            </button>
          ))}
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-[#FFD875] hover:border-[#FFD875]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            <ChevronDownIcon className="w-5 h-5 -rotate-90" />
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default MyTickets; 
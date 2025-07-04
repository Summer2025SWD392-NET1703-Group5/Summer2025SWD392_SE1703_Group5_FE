// pages/BookingSuccessPage.tsx
import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate, Link, useParams } from 'react-router-dom';
import {
  CheckCircleIcon,
  TicketIcon,
  CalendarIcon,
  MapPinIcon,
  ClockIcon,
  FilmIcon,
  ArrowDownTrayIcon,
  InformationCircleIcon,
  PrinterIcon,
  UserIcon,
  ChevronRightIcon,
  DevicePhoneMobileIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline';
import QRCode from 'react-qr-code';
import Confetti from 'react-confetti';
import type { BookingSession } from '../types';
import api from '../config/api';
import { toast } from 'react-hot-toast';
import PayOSQRModal from '../components/PayOSQRModal';
import { useAuth } from '../hooks/useAuth';

interface TicketInfo {
  Ticket_ID: number;
  Booking_ID: number;
  Ticket_Code: string;
  CustomerInfo: {
    User_ID: number;
    Full_Name: string;
    Email: string;
    Phone_Number: string;
  };
  SeatInfo: {
    Seat_ID: number;
    Row_Label: string;
    Column_Number: number;
    Seat_Type: string;
    SeatLabel: string;
    Price?: number;
  };
  MovieInfo: {
    Movie_ID: number;
    Movie_Name: string;
    Duration: number;
    Rating: string;
  };
  ShowtimeInfo: {
    Showtime_ID: number;
    ShowDate: string;
    StartTime: string;
    EndTime: string;
  };
  CinemaRoomInfo: {
    Cinema_Room_ID: number;
    Room_Name: string;
    Room_Type: string;
  };
  PriceInfo?: {
    Base_Price: number;
    Discount_Amount: number;
    Final_Price: number;
  };
  Is_Checked_In: boolean;
  CheckInTime: string | null;
}

interface MovieDetails {
  Movie_ID: number;
  Movie_Name: string;
  Poster_URL: string;
  Duration: number;
  Rating: string;
  Genre: string;
  Director: string;
  Cast: string;
  Synopsis: string;
  Language: string;
  Country: string;
}

const BookingSuccessPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const { user } = useAuth(); // Lấy thông tin người dùng
  const isStaff = user?.role === 'Staff' || user?.role === 'Admin';
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  const [confettiActive, setConfettiActive] = useState(true);
  const [tickets, setTickets] = useState<TicketInfo[]>([]);
  const [movieDetails, setMovieDetails] = useState<MovieDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMovie, setIsLoadingMovie] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketInfo | null>(null);
  
  // State cho các giá trị thanh toán
  const [subtotal, setSubtotal] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [promotionDiscount, setPromotionDiscount] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>("Tiền mặt");
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const ticketRefsContainer = useRef<HTMLDivElement>(null);

  // Truy cập dữ liệu từ cả location.state trực tiếp và từ location.state.paymentResult
  const locationData = location.state || {};
  const { bookingSession } = locationData;
  const paymentResult = locationData.paymentResult || locationData;

  useEffect(() => {
    const handleResize = () => setWindowDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    const timer = setTimeout(() => setConfettiActive(false), 8000);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (bookingId) {
      fetchTickets();
    }
  }, [bookingId]);

  // Xử lý dữ liệu từ API payment
  useEffect(() => {
    // Kiểm tra dữ liệu payment từ location state trong cả hai định dạng có thể
    const bookingInfo = paymentResult?.booking_info;
    const paymentInfo = paymentResult?.payment_info;
    
    if (bookingInfo) {
      console.log("Đọc dữ liệu thanh toán:", bookingInfo);
      
      // Tính tổng giá vé gốc và giảm giá
      const pointsUsed = bookingInfo.points_used || 0;
      const promotionAmount = bookingInfo.promotion_discount || 0;
      const originalTotal = bookingInfo.total_amount + pointsUsed + promotionAmount;
      
      // Cập nhật giá trị từ API
      setSubtotal(originalTotal); // Tổng giá vé gốc (trước khi giảm)
      setDiscount(pointsUsed);  // Điểm sử dụng
      setPromotionDiscount(promotionAmount); // Mã giảm giá
      setTotal(bookingInfo.total_amount || 0);    // Tổng cộng sau khi đã giảm
      
      // Cập nhật phương thức thanh toán
      if (paymentInfo?.payment_method) {
        const method = paymentInfo.payment_method;
        setPaymentMethod(method === 'Cash' ? 'Tiền mặt' : method);
      }
      
      console.log(`Giá vé gốc: ${originalTotal}, Giảm giá điểm: ${pointsUsed}, Giảm giá khuyến mãi: ${promotionAmount}, Còn lại: ${bookingInfo.total_amount}`);
    }
  }, [paymentResult]);

  const fetchTickets = async () => {
    if (!bookingId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log('Đang lấy thông tin vé cho booking:', bookingId);

      // Gọi API /tickets/booking/{id}
      const response = await api.get(`/ticket/booking/${bookingId}`);
      console.log('Response tickets:', response.data);

      // Xử lý nhiều cấu trúc response khác nhau
      let ticketsData = [];
      let responseBookingInfo = null;
      let responsePaymentInfo = null;

      // Kiểm tra cấu trúc có booking_info và payment_info không
      if (response.data.booking_info) {
        responseBookingInfo = response.data.booking_info;
        responsePaymentInfo = response.data.payment_info;
      }

      if (response.data.success && response.data.data) {
        ticketsData = Array.isArray(response.data.data) ? response.data.data : [response.data.data];
      } else if (response.data.tickets) {
        ticketsData = Array.isArray(response.data.tickets) ? response.data.tickets : [response.data.tickets];
      } else if (Array.isArray(response.data)) {
        ticketsData = response.data;
      } else if (response.data && typeof response.data === 'object') {
        ticketsData = [response.data];
      }

      console.log('Processed tickets data:', ticketsData);

      if (ticketsData.length > 0) {
        console.log('First ticket data:', ticketsData[0]);
        console.log('Ticket code from API:', ticketsData[0]?.Ticket_Code);
        setTickets(ticketsData);

        // Lấy thông tin phim từ vé đầu tiên
        const firstTicket = ticketsData[0];
        const movieId = firstTicket.MovieInfo?.Movie_ID || firstTicket.Movie_ID;

        if (movieId) {
          await fetchMovieDetails(movieId);
        }
        
        // Nếu không có dữ liệu payment từ location state, tính toán từ vé và API booking
        if (!paymentResult?.booking_info) {
          console.log("Không có dữ liệu API, tính giá từ vé");
          
          let totalFinalPrice = 0;
          ticketsData.forEach((ticket: TicketInfo) => {
            // Lấy Final_Price từ mỗi vé và cộng vào tổng
            const finalPrice = ticket.PriceInfo?.Final_Price || 0;
            totalFinalPrice += finalPrice;
          });
          
          console.log(`Tổng giá vé tính từ ${ticketsData.length} vé:`, totalFinalPrice);
          
          // Nếu có booking_info từ response API ticket
          if (responseBookingInfo) {
            const pointsUsed = responseBookingInfo.points_used || 0;
            const promotionAmount = responseBookingInfo.promotion_discount || 0;
            const finalTotal = responseBookingInfo.total_amount || (totalFinalPrice - pointsUsed - promotionAmount);
            
            setSubtotal(totalFinalPrice);
            setDiscount(pointsUsed);
            setPromotionDiscount(promotionAmount);
            setTotal(finalTotal);
            
            console.log(`[Từ response] Giá gốc: ${totalFinalPrice}, Giảm giá điểm: ${pointsUsed}, Giảm giá mã: ${promotionAmount}, Còn lại: ${finalTotal}`);
            
            // Cập nhật phương thức thanh toán
            if (responsePaymentInfo?.payment_method) {
              const method = responsePaymentInfo.payment_method;
              setPaymentMethod(method === 'Cash' ? 'Tiền mặt' : method);
            }
            return;
          }
          
          // Lấy thông tin booking từ API riêng nếu không có sẵn từ ticket API
          try {
            const bookingResponse = await api.get(`/bookings/${bookingId}`);
            console.log("Booking API response:", bookingResponse.data);
            
            if (bookingResponse.data) {
              let bookingData = bookingResponse.data;
              if (bookingResponse.data.data) {
                bookingData = bookingResponse.data.data;
              }
              
              // Lấy thông tin points_used nếu có
              const pointsUsed = bookingData.Points_Used || bookingData.points_used || 0;
              
              // Tính tổng gốc (trước giảm giá) và tổng sau khi giảm giá
              const originalTotal = totalFinalPrice;
              const finalTotal = originalTotal - pointsUsed;
              
              setSubtotal(originalTotal);
              setDiscount(pointsUsed);
              setTotal(finalTotal);
              
              console.log(`Giá gốc: ${originalTotal}, Giảm giá: ${pointsUsed}, Còn lại: ${finalTotal}`);
            }
          } catch (error) {
            console.error("Lỗi khi lấy thông tin booking:", error);
            
            // Nếu lỗi API booking, vẫn hiển thị giá từ vé
            setSubtotal(totalFinalPrice);
            
            // Kiểm tra xem có dữ liệu points_used trong response.data không
            if (response.data && response.data.booking_info && response.data.booking_info.points_used) {
              const pointsUsed = response.data.booking_info.points_used;
              setDiscount(pointsUsed);
              setTotal(totalFinalPrice - pointsUsed);
              console.log(`Sử dụng điểm từ response ban đầu: ${pointsUsed}`);
            } else {
              setTotal(totalFinalPrice);
            }
          }
        }
      } else {
        console.warn('Không tìm thấy vé nào cho booking:', bookingId);
        toast.error('Không tìm thấy thông tin vé');
      }
    } catch (error: any) {
      console.error('Lỗi khi lấy thông tin vé:', error);
      toast.error('Không thể lấy thông tin vé');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMovieDetails = async (movieId: number) => {
    try {
      setIsLoadingMovie(true);
      console.log('Đang lấy thông tin phim ID:', movieId);

      // Gọi API /movies/{id}
      const response = await api.get(`/movies/${movieId}`);
      console.log('Response movie:', response.data);

      // Xử lý nhiều cấu trúc response khác nhau
      let movieData = null;

      if (response.data.success && response.data.data) {
        movieData = response.data.data;
      } else if (response.data.movie) {
        movieData = response.data.movie;
      } else if (response.data.Movie_ID || response.data.Movie_Name) {
        movieData = response.data;
      }

      if (movieData) {
        console.log('Movie data found:', movieData);
        setMovieDetails({
          Movie_ID: movieData.Movie_ID || movieData.id,
          Movie_Name: movieData.Movie_Name || movieData.title || movieData.name,
          Poster_URL: movieData.Poster_URL || movieData.poster || movieData.posterUrl,
          Duration: movieData.Duration || movieData.duration || 120,
          Rating: movieData.Rating || movieData.rating || 'PG',
          Genre: movieData.Genre || movieData.genre || '',
          Director: movieData.Director || movieData.director || '',
          Cast: movieData.Cast || movieData.cast || '',
          Synopsis: movieData.Synopsis || movieData.synopsis || '',
          Language: movieData.Language || movieData.language || 'VIE',
          Country: movieData.Country || movieData.country || 'VN'
        });
      } else {
        console.warn('Không tìm thấy dữ liệu phim');
      }
    } catch (error: any) {
      console.error('Lỗi khi lấy thông tin phim:', error);
      // Không hiển thị error toast vì có thể không quan trọng
    } finally {
      setIsLoadingMovie(false);
    }
  };

  const bookingCode = bookingId ? `BLT${bookingId}` : `BLT${Math.floor(100000 + Math.random() * 900000)}`;

  const getPaymentMethodName = (method: string) => {
    return method === 'Cash' || method === 'cash' ? 'Tiền mặt' : method;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5); // HH:mm
  };

  // Use real ticket data if available
  const displayTicket = tickets.length > 0 ? tickets[0] : null;

  // Debug QR code value
  const qrCodeValue = displayTicket?.Ticket_Code || bookingCode;
  console.log('QR Code được tạo từ:', qrCodeValue);

  // Movie display data - prioritize API data
  const displayMovieDetails = {
    title: movieDetails?.Movie_Name || displayTicket?.MovieInfo?.Movie_Name || "Phim không xác định",
    poster: movieDetails?.Poster_URL || "/placeholder-movie.svg",
    language: movieDetails?.Language || "VIE",
    format: displayTicket?.CinemaRoomInfo?.Room_Type || "2D",
    cinema: "Galaxy Cinema",
    date: displayTicket ? formatDate(displayTicket.ShowtimeInfo.ShowDate) : new Date().toLocaleDateString('vi-VN'),
    time: displayTicket ? formatTime(displayTicket.ShowtimeInfo.StartTime) : "18:00",
    rating: movieDetails?.Rating || displayTicket?.MovieInfo?.Rating || "PG",
    duration: movieDetails?.Duration || displayTicket?.MovieInfo?.Duration || 120,
    roomName: displayTicket?.CinemaRoomInfo?.Room_Name || "Phòng 01"
  };

  const handlePrintTicket = () => {
    setIsPrinting(true);
    toast.success('Đang chuẩn bị trang in vé...');
    
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 300);
  };

  // Thêm CSS cho trang in
  useEffect(() => {
    // Tạo style tag cho trang in
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        body, html {
          margin: 0;
          padding: 0;
          background: white !important;
        }
        
        body * {
          visibility: hidden;
          background: white !important;
        }
        
        .ticket-container {
          visibility: visible;
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          background: white !important;
          color: black !important;
          padding: 20px;
          border: none !important;
        }
        
        .ticket-container * {
          visibility: visible;
          color: black !important;
          background: white !important;
        }
        
        .ticket-header {
          border-bottom: 1px solid #000 !important;
          background: white !important;
          padding-bottom: 10px;
          margin-bottom: 15px;
        }
        
        .print-hidden, .animate-bounce, .animate-pulse {
          display: none !important;
        }
        
        .text-gradient {
          background: none !important;
          -webkit-text-fill-color: initial !important;
          color: black !important;
        }
        
        .border, .shadow-lg, .hover\\:shadow-\\[0_0_20px_\\#FFD87540\\], .border-2 {
          border: none !important;
          box-shadow: none !important;
        }
        
        .rounded-lg, .rounded-xl, .rounded-2xl, .rounded-full {
          border-radius: 0 !important;
        }
        
        .ticket-content {
          padding: 0 !important;
        }
        
        .bg-slate-800\\/70 {
          background: white !important;
        }

        .individual-ticket {
          visibility: visible;
          position: relative;
          page-break-before: always;
          background: white !important;
          color: black !important;
          height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .individual-ticket * {
          visibility: visible;
        }
        
        /* Ghi đè màu nền gradient và giữ văn bản trắng cho phần đầu vé */
        .individual-ticket .bg-gradient-to-r {
          background: #1a2a6c !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color: white !important;
        }
        
        .individual-ticket .bg-gradient-to-r * {
          color: white !important;
        }
        
        /* Giữ màu cam cho thông tin ghế ngồi */
        .individual-ticket .text-orange-500 {
          color: #f97316 !important;
        }
        
        .individual-ticket .bg-orange-100 {
          background-color: #ffedd5 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        
        /* Giữ màu xám cho phần chân vé */
        .individual-ticket .bg-gray-100 {
          background-color: #f3f4f6 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        
        /* Giữ biên giới và góc bo tròn */
        .individual-ticket .border-b-2.border-dashed {
          border-bottom: 2px dashed #d1d5db !important;
        }
        
        .individual-ticket .rounded-lg {
          border-radius: 0.5rem !important;
        }
        
        .individual-ticket .rounded-full {
          border-radius: 9999px !important;
        }
        
        .individual-ticket .border-4 {
          border: 4px solid #1f2937 !important;
        }

        .ticket-refs-container {
          display: block !important;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Component cho mỗi vé riêng lẻ
  const IndividualTicket: React.FC<{ ticket: TicketInfo }> = ({ ticket }) => {
    return (
      <div className="individual-ticket">
        <div className="w-full max-w-md mx-auto bg-white rounded-lg overflow-hidden">
          {/* Phần đầu vé với logo và thương hiệu */}
          <div className="bg-gradient-to-r from-[#1a2a6c] via-[#b21f1f] to-[#fdbb2d] text-white p-4 text-center">
            <h2 className="text-2xl font-bold tracking-wider">GALAXY CINEMA</h2>
            <p className="uppercase text-sm tracking-widest">VŨ TRỤ ĐIỆN ẢNH</p>
          </div>
          
          <div className="border-b-2 border-dashed border-gray-300 relative">
            <div className="absolute -left-3 -bottom-3 w-6 h-6 rounded-full bg-gray-100"></div>
            <div className="absolute -right-3 -bottom-3 w-6 h-6 rounded-full bg-gray-100"></div>
            </div>
            
          {/* Thông tin chính */}
          <div className="p-6">
            <div className="text-center mb-4">
              <h3 className="text-2xl font-bold text-gray-800">{ticket.MovieInfo.Movie_Name}</h3>
              <p className="text-sm text-gray-600">{ticket.MovieInfo.Duration} phút | {ticket.MovieInfo.Rating}</p>
            </div>
            
            <div className="flex justify-between items-center mb-6">
              <div className="space-y-2">
                <div className="flex items-center">
                  <CalendarIcon className="w-5 h-5 text-gray-600 mr-2" />
                  <p className="text-gray-800">{formatDate(ticket.ShowtimeInfo.ShowDate)}</p>
                </div>
                <div className="flex items-center">
                  <ClockIcon className="w-5 h-5 text-gray-600 mr-2" />
                  <p className="text-gray-800">{formatTime(ticket.ShowtimeInfo.StartTime)}</p>
                </div>
                <div className="flex items-center">
                  <MapPinIcon className="w-5 h-5 text-gray-600 mr-2" />
                  <p className="text-gray-800">{ticket.CinemaRoomInfo.Room_Name}</p>
                </div>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="bg-orange-100 rounded-full p-2 mb-1">
                  <TicketIcon className="w-8 h-8 text-orange-500" />
                </div>
                <p className="text-2xl font-bold text-orange-500">{ticket.SeatInfo.SeatLabel}</p>
                <p className="text-xs text-gray-500">Ghế của bạn</p>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              {/* Mã vé */}
              <div className="text-left">
                <p className="text-xs text-gray-500">MÃ VÉ</p>
                <p className="text-lg font-mono font-bold">{ticket.Ticket_Code}</p>
              </div>
              
              {/* QR Code */}
              <div className="border-4 border-gray-800 rounded-md p-1 bg-white">
              <QRCode
                value={ticket.Ticket_Code}
                size={100}
                bgColor={"#ffffff"}
                fgColor={"#000000"}
                  level={"H"}
              />
              </div>
            </div>
          </div>
          
          {/* Phần chân vé */}
          <div className="bg-gray-100 p-3 text-center">
            <p className="text-sm font-medium text-gray-700">Vui lòng đến trước 15 phút để check-in</p>
            <p className="text-xs text-gray-500 mt-1">Vé có giá trị duy nhất cho suất chiếu này</p>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFD875] mx-auto mb-4"></div>
          <p className="text-gray-300">Đang tải thông tin thanh toán...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white relative overflow-hidden">
      {confettiActive && (
        <Confetti
          width={windowDimensions.width}
          height={windowDimensions.height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
          className="print-hidden"
        />
      )}

      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden print-hidden">
        <div className="absolute top-10 left-10 w-32 h-32 border border-emerald-400/20 rounded-full animate-pulse"></div>
        <div className="absolute top-20 right-20 w-48 h-48 border border-purple-400/20 rounded-full animate-pulse animation-delay-1000"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 border border-pink-400/20 rounded-full animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-40 right-40 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-5xl">
        {/* Header - Success message */}
        <div className="text-center mb-8 print-hidden">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500/20 rounded-full mb-4 animate-bounce">
            <CheckCircleIcon className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Đặt vé thành công!
          </h1>
          <p className="text-lg text-gray-300">
            Cảm ơn bạn đã tin tưởng và lựa chọn GALAXY Cinema
          </p>
        </div>

        {/* Main Ticket Card */}
        <div className="ticket-container bg-slate-800/80 backdrop-blur-xl rounded-2xl overflow-hidden border border-[#FFD875]/30 shadow-xl shadow-[#FFD875]/5 hover:shadow-[0_0_30px_rgba(255,216,117,0.2)] transition-all duration-300 transform hover:-translate-y-1">
          {/* Ticket Header - Golden gradient */}
          <div className="bg-gradient-to-r from-[#FFD875] to-amber-500 p-4 ticket-header relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/pattern-light.svg')] opacity-10"></div>
            <div className="flex justify-between items-center relative z-10">
              <div>
                <h2 className="text-2xl font-bold text-black">Hóa đơn thanh toán</h2>
                <p className="text-black/80 font-medium">Cinema Bolt</p>
              </div>
              {isStaff && (
                <div className="flex items-center bg-white/20 rounded-md px-3 py-1 backdrop-blur-sm">
                  <UserIcon className="w-4 h-4 text-black mr-1" />
                  <span className="text-black font-semibold">Staff</span>
                </div>
              )}
            </div>
          </div>

          {/* Ticket Body - Clean modern look with soft shadows */}
          <div className="p-6 relative ticket-content">
            {/* Decorative elements */}
            <div className="absolute top-0 left-6 right-6 border-t border-dashed border-gray-500 print-hidden"></div>
            <div className="absolute top-0 left-0 w-6 h-6 rounded-full bg-slate-900 transform -translate-x-3 -translate-y-3 print-hidden"></div>
            <div className="absolute top-0 right-0 w-6 h-6 rounded-full bg-slate-900 transform translate-x-3 -translate-y-3 print-hidden"></div>

            {/* Main content with grid layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Side - Movie Details with drop shadow */}
              <div className="lg:col-span-2 space-y-5">
                <div className="flex items-start gap-4">
                  {isLoadingMovie ? (
                    <div className="w-28 h-40 rounded-lg bg-gray-700 animate-pulse"></div>
                  ) : (
                    <div className="relative group">
                      <img
                        src={displayMovieDetails.poster}
                        alt={displayMovieDetails.title}
                        className="w-28 h-40 rounded-lg object-cover shadow-lg group-hover:shadow-2xl group-hover:scale-105 transition-all duration-300 print:w-20 print:h-28"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-movie.svg';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-end justify-center p-2 print-hidden">
                        <span className="text-white text-xs font-medium">{displayMovieDetails.duration} phút</span>
                      </div>
                    </div>
                  )}
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">{displayMovieDetails.title}</h3>
                    <div className="flex items-center flex-wrap gap-2 mb-3 print-hidden">
                      <span className="px-2.5 py-1 bg-slate-700/50 backdrop-blur-sm rounded-md text-xs font-medium border border-slate-600/50">{displayMovieDetails.language}</span>
                      <span className="px-2.5 py-1 bg-slate-700/50 backdrop-blur-sm rounded-md text-xs font-medium border border-slate-600/50">{displayMovieDetails.format}</span>
                      <span className="px-2.5 py-1 bg-red-600/80 backdrop-blur-sm text-white rounded-md text-xs font-medium border border-red-500/50">{displayMovieDetails.rating}</span>
                    </div>
                    
                    {/* Movie details with icons */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center space-x-2">
                        <CalendarIcon className="w-4 h-4 text-[#FFD875]" />
                        <span className="text-gray-200">{displayMovieDetails.date}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <ClockIcon className="w-4 h-4 text-[#FFD875]" />
                        <span className="text-gray-200">{displayMovieDetails.time}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPinIcon className="w-4 h-4 text-[#FFD875]" />
                        <span className="text-gray-200">{displayMovieDetails.roomName}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Seats section with improved visuals */}
                <div className="bg-slate-700/30 backdrop-blur-sm rounded-xl p-4 border border-slate-600/30">
                  <h4 className="flex items-center text-gray-300 mb-3 text-sm font-medium">
                    <TicketIcon className="w-4 h-4 text-[#FFD875] mr-2" />Ghế đã chọn
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {tickets.length > 0 ? (
                      tickets.map((ticket, index) => (
                        <span
                          key={index}
                          className="px-3 py-1.5 bg-[#FFD875]/20 border border-[#FFD875]/40 text-[#FFD875] rounded-md font-medium shadow-inner shadow-[#FFD875]/5"
                        >
                          {ticket.SeatInfo.SeatLabel || `${ticket.SeatInfo.Row_Label}${ticket.SeatInfo.Column_Number}`}
                        </span>
                      ))
                    ) : (
                      bookingSession?.selectedSeats?.map((seat: any) => (
                        <span
                          key={seat.id}
                          className="px-3 py-1.5 bg-[#FFD875]/20 border border-[#FFD875]/40 text-[#FFD875] rounded-md font-medium shadow-inner shadow-[#FFD875]/5"
                        >
                          {seat.name || seat.id}
                        </span>
                      )) || (
                        <span className="px-3 py-1.5 bg-[#FFD875]/20 border border-[#FFD875]/40 text-[#FFD875] rounded-md font-medium shadow-inner shadow-[#FFD875]/5">A10</span>
                      )
                    )}
                  </div>
                </div>
                
                {/* Ticket Code Section */}
                {tickets.length > 0 && (
                  <div className="bg-slate-700/30 backdrop-blur-sm rounded-xl p-4 border border-slate-600/30 print-hidden">
                    <h4 className="flex items-center text-gray-300 mb-3 text-sm font-medium">
                      <QrCodeIcon className="w-4 h-4 text-[#FFD875] mr-2" />Mã vé
                    </h4>
                    <div className="flex items-center space-x-3">
                      {tickets.length === 1 ? (
                        <div className="bg-white p-2 rounded-lg">
                          <QRCode
                            value={tickets[0].Ticket_Code}
                            size={80}
                            bgColor={"#ffffff"}
                            fgColor={"#000000"}
                            level={"L"}
                            className="h-20 w-20"
                          />
                        </div>
                      ) : null}
                      <div className="flex flex-col">
                        {tickets.map((ticket, index) => (
                          <div key={index} className="flex items-center space-x-1 mb-1">
                            <span className="text-gray-400 text-sm">Ghế {ticket.SeatInfo.SeatLabel}:</span>
                            <span className="text-[#FFD875] font-mono text-sm">{ticket.Ticket_Code}</span>
                          </div>
                        ))}
                        <p className="text-xs text-gray-400 mt-1">Vui lòng xuất trình mã này khi đến rạp</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Side - Payment Details */}
              <div className="lg:col-span-1 bg-slate-700/30 backdrop-blur-sm rounded-xl p-5 border border-slate-600/30">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <InformationCircleIcon className="w-5 h-5 text-[#FFD875] mr-2" />
                  Chi tiết thanh toán
                </h3>

                <div className="space-y-4">
                  {/* Payment Method and Time */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Phương thức:</span>
                      <span className="text-white font-medium">{paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Thời gian:</span>
                      <span className="text-white">{new Date().toLocaleString('vi-VN')}</span>
                    </div>
                  </div>

                  {/* Customer Info if available */}
                  {displayTicket && displayTicket.CustomerInfo && (
                    <div className="pt-3 border-t border-slate-600/50 space-y-2">
                      <h4 className="text-white font-medium flex items-center mb-2">
                        <UserIcon className="w-4 h-4 text-[#FFD875] mr-2" />
                        Thông tin khách hàng
                      </h4>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Họ tên:</span>
                        <span className="text-white">{displayTicket.CustomerInfo.Full_Name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Email:</span>
                        <span className="text-white text-xs">{displayTicket.CustomerInfo.Email}</span>
                      </div>
                    </div>
                  )}

                  {/* Price Breakdown with improved visuals */}
                  <div className="pt-3 border-t border-slate-600/50 space-y-2">
                    <h4 className="text-white font-medium flex items-center mb-2">
                      <TicketIcon className="w-4 h-4 text-[#FFD875] mr-2" />
                      Chi tiết giá vé
                    </h4>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Giá vé:</span>
                      <span className="text-white">{subtotal.toLocaleString()}đ</span>
                    </div>
                    
                    {/* Chiết khấu bằng mã khuyến mãi - hiển thị khi có */}
                    {promotionDiscount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-green-400 flex items-center">
                          <span className="inline-block w-4 h-4 mr-1 text-center bg-green-400/20 rounded-full text-green-400 text-xs">%</span>
                          Giảm giá (mã):
                        </span>
                        <span className="text-green-400">-{promotionDiscount.toLocaleString()}đ</span>
                      </div>
                    )}
                    
                    {/* Giảm giá bằng điểm - hiển thị khi có */}
                    {discount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-green-400 flex items-center">
                          <DevicePhoneMobileIcon className="w-4 h-4 mr-1" />
                          Giảm giá (điểm):
                        </span>
                        <span className="text-green-400">-{discount.toLocaleString()}đ</span>
                      </div>
                    )}
                  </div>

                  {/* Final Total - Highlighted */}
                  <div className="mt-4 bg-[#FFD875]/20 rounded-lg p-3 border border-[#FFD875]/30">
                    <div className="flex justify-between font-bold text-lg">
                      <span className="text-white">Tổng cộng:</span>
                      <span className="text-[#FFD875]">{total.toLocaleString()}đ</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Box */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-400/30 rounded-xl p-5 my-6 max-w-3xl mx-auto print-hidden">
        <div className="flex items-center mb-3">
          <DevicePhoneMobileIcon className="w-6 h-6 text-blue-400 mr-2" />
          <h3 className="text-lg font-semibold text-blue-300">Thông báo quan trọng</h3>
        </div>
        <p className="text-gray-300 mb-2">
          ✅ <span className="text-emerald-400 font-semibold">Vé điện tử và bill thanh toán</span> đã được gửi về email của bạn
        </p>
        <p className="text-gray-300 text-sm">
          ⏰ Vui lòng đến rạp trước 15 phút để check-in vé thuận tiện nhất
        </p>
      </div>

      {/* Container cho các vé riêng lẻ - Chỉ hiển thị khi in */}
      <div ref={ticketRefsContainer} className="ticket-refs-container hidden">
        {tickets.map((ticket, index) => (
          <IndividualTicket key={index} ticket={ticket} />
        ))}
      </div>

      {/* Action Buttons - Centered prominently */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6 print-hidden relative z-20">
        {/* Staff sẽ không thấy nút xem lịch sử đặt vé và khám phá phim khác */}
        {!isStaff && (
          <>
            <button
              onClick={() => navigate('/profile/bookings')}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-gray-200 font-medium rounded-lg transition-all flex items-center justify-center gap-2 border border-slate-600/50 cursor-pointer hover:shadow-lg z-20"
            >
              <TicketIcon className="w-5 h-5" />
              Xem lịch sử đặt vé
            </button>
            <button
              onClick={() => navigate('/movies')}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-gray-200 font-medium rounded-lg transition-all flex items-center justify-center gap-2 border border-slate-600/50 cursor-pointer hover:shadow-lg z-20"
            >
              <FilmIcon className="w-5 h-5" />
              Khám phá phim khác
            </button>
          </>
        )}
        
        {/* Nút "In vé" - Nổi bật hơn */}
        <button
          onClick={handlePrintTicket}
          disabled={isPrinting || !displayTicket}
          className={`w-full sm:w-auto px-8 py-4 ${isPrinting ? 'bg-slate-500' : 'bg-gradient-to-r from-[#FFD875] to-amber-500 hover:from-amber-500 hover:to-[#FFD875]'} 
          text-black font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-[#FFD875]/30 cursor-pointer z-20
          ${isPrinting ? '' : 'transform hover:-translate-y-0.5'}`}
        >
          <PrinterIcon className="w-5 h-5" />
          {isPrinting ? 'Đang chuẩn bị...' : tickets.length > 0 ? `In ${tickets.length + 1} trang` : 'In vé'}
        </button>
      </div>

      {/* Thêm một button dự phòng để đảm bảo người dùng có thể đến các trang cần thiết */}
      <div className="mt-6 flex flex-col items-center justify-center gap-3 print-hidden">
        <p className="text-gray-400 text-sm">Nếu không thể bấm nút ở trên, vui lòng sử dụng liên kết bên dưới:</p>
        <div className="flex gap-4">
          {!isStaff && (
            <>
              <button 
                onClick={() => navigate('/profile/bookings')}
                className="text-blue-400 hover:text-blue-300 hover:underline cursor-pointer"
              >
                Lịch sử đặt vé
              </button>
              <button 
                onClick={() => navigate('/movies')}
                className="text-blue-400 hover:text-blue-300 hover:underline cursor-pointer"
              >
                Danh sách phim
              </button>
            </>
          )}
        </div>
      </div>

      {showQrCode && selectedTicket && (
        <PayOSQRModal
          isOpen={showQrCode}
          onClose={() => setShowQrCode(false)}
          bookingId={bookingId ? bookingId : ""}
          amount={total || 0}
          ticketInfo={`${selectedTicket.SeatInfo?.SeatLabel || ''} - ${selectedTicket.MovieInfo?.Movie_Name || ''}`}
        />
      )}
    </div>
  );
};

export default BookingSuccessPage;



// pages/BookingPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import BookingProgress from '../components/BookingProgress';
import SeatSelection from '../components/SeatSelection';
import type { BookingStep, BookingSession, Seat, CinemaRoom } from '../types';
import { cinemaRooms, createStandardRoom } from '../utils/cinemaLayouts';
import FullScreenLoader from '../components/FullScreenLoader';
import api from '../config/api'; // Changed from axios to the configured API instance
import { toast } from 'react-hot-toast';
import { bookingService } from '../services/bookingService';
import { ArrowLeftIcon, XCircleIcon } from '@heroicons/react/24/outline';
import PayOSQRModal from '../components/PayOSQRModal';

const BookingPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { showtimeId } = useParams<{ showtimeId: string }>();
    const [room, setRoom] = useState<CinemaRoom | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [seats, setSeats] = useState<any[]>([]);

    // Thay thế việc sử dụng localStorage bằng API
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [user, setUser] = useState<any>(null);

    // Kiểm tra trạng thái đăng nhập bằng API
    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const response = await api.get('/auth/profile');
                if (response.data && response.data.success) {
                    setIsAuthenticated(true);
                    setUser(response.data.user || response.data.data);
                } else {
                    setIsAuthenticated(false);
                    setUser(null);
                }
            } catch (error) {
                console.error('Lỗi khi kiểm tra trạng thái đăng nhập:', error);
                setIsAuthenticated(false);
                setUser(null);
            }
        };

        checkAuthStatus();
    }, []);

    // Lấy dữ liệu từ state của location
    const bookingData = location.state || {};
    const { movie, theater, showtime } = bookingData;

    // 🎬 Debug logging để trace movieId
    useEffect(() => {
        console.log('📋 BookingPage Debug Info:');
        console.log('- URL showtimeId:', showtimeId);
        console.log('- location.state:', location.state);
        console.log('- showtime data:', showtime);
        console.log('- movie data:', movie);
        console.log('- theater data:', theater);
        
        if (showtime) {
            console.log('🎬 Showtime movieId:', showtime.movieId);
        }
    }, []);

    useEffect(() => {
        if (location.state?.error) {
            const { message, movieTitle, expiryTime, bookingId } = location.state.error;
            setBookingError({
                message,
                movieTitle: movieTitle || 'Không xác định',
                expiryTime: expiryTime || 0,
                bookingId: bookingId || ''
            });
        }

        if (location.state?.fromTimeout) {
            const message = location.state.message || 'Phiên thanh toán đã hết hạn. Vui lòng chọn ghế và đặt vé lại.';

            setTimeout(() => {
                toast.error(message, {
                    duration: 5000,
                    position: 'top-center',
                    style: {
                        background: '#DC2626',
                        color: '#fff',
                        fontSize: '16px',
                        padding: '16px',
                        borderRadius: '8px',
                        maxWidth: '500px'
                    }
                });
            }, 500);

            if (window.history.state) {
                const newState = { ...location.state };
                delete newState.fromTimeout;
                delete newState.message;

                window.history.replaceState(newState, '', location.pathname);
            }
        }
    }, [location.state]);

    // Initialize booking state - 🎬 FIX movieId detection với API call
    const [bookingSession, setBookingSession] = useState<BookingSession>(() => {
        // Initialize với movieId tạm thời, sẽ được update từ API
        return {
            id: `booking-${Date.now()}`,
            movieId: '1', // Temporary, will be updated from API
            cinemaId: theater?.id || '1',
            showtimeId: showtime?.id || showtimeId || '1',
            selectedSeats: [],
            totalPrice: 0,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
            step: 1
        };
    });

    // 🎬 NEW: Fetch showtime details để lấy đúng movieId
    const fetchShowtimeDetails = async () => {
        try {
            const id = showtime?.id || showtimeId;
            if (!id) return;

            console.log(`🎬 Fetching showtime details for ID: ${id}`);
            const response = await api.get(`/showtimes/${id}`);
            
            if (response.data && response.data.success) {
                const showtimeData = response.data.data || response.data;
                const correctMovieId = showtimeData.Movie_ID || showtimeData.movieId;
                
                console.log(`✅ Showtime details fetched - Movie_ID: ${correctMovieId}`);
                
                // Update booking session với movieId đúng
                setBookingSession(prev => ({
                    ...prev,
                    movieId: String(correctMovieId)
                }));
                
                console.log(`🎯 Updated movieId to: ${correctMovieId}`);
            }
        } catch (error) {
            console.error('❌ Error fetching showtime details:', error);
            // Fallback to existing logic nếu API fail
            let fallbackMovieId = '1';
            
            if (showtime?.movieId) {
                fallbackMovieId = String(showtime.movieId);
            } else if (location.state?.movieId) {
                fallbackMovieId = String(location.state.movieId);
            } else if (movie?.id) {
                fallbackMovieId = String(movie.id);
            }
            
            setBookingSession(prev => ({
                ...prev,
                movieId: fallbackMovieId
            }));
            
            console.log(`🎯 Fallback movieId: ${fallbackMovieId}`);
        }
    };

    // Fetch showtime details khi component mount
    useEffect(() => {
        fetchShowtimeDetails();
    }, [showtimeId, showtime]);

    const [bookingError, setBookingError] = useState<{
        message: string;
        bookingId?: string;
        movieTitle?: string;
        expiryTime?: number;
    } | null>(null);
    const [showQrCode, setShowQrCode] = useState(false);
    const [paymentQrUrl, setPaymentQrUrl] = useState<string | null>(null);
    const [qrCheckInterval, setQrCheckInterval] = useState<number | null>(null);
    const [paymentStatus, setPaymentStatus] = useState<string>('pending');
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    // Thêm state selectedBookingId
    const [selectedBookingId, setSelectedBookingId] = useState<string>('');

    const extractBookingId = (error: any): string => {
        if (error.bookingId) return error.bookingId;
        if (error.response?.data?.bookingId) return error.response.data.bookingId;
        if (error.response?.data?.pendingBookingDetails?.Booking_ID) {
            return String(error.response.data.pendingBookingDetails.Booking_ID);
        }

        const errorMsg = error.message || error.response?.data?.message || '';
        if (errorMsg) {
            const idMatches = [
                errorMsg.match(/ID[:\s]+(\d+)/i),
                errorMsg.match(/booking[-_]?id[:\s]+(\d+)/i),
                errorMsg.match(/đơn đặt[^0-9]+(\d+)/i),
                errorMsg.match(/(\d{3,})$/),
            ];

            for (const match of idMatches) {
                if (match && match[1]) return match[1];
            }
        }
        return '';
    };

    const fetchSeats = async () => {
        setLoading(true);
        try {
            const id = showtime?.id || showtimeId || '1';
            const response = await api.get(`/seats/showtime/${id}`);

            if (response.data && response.data.success) {
                const apiSeats = response.data.data;

                if (apiSeats.SeatLayouts && Array.isArray(apiSeats.SeatLayouts)) {
                    const processedSeats = apiSeats.SeatLayouts.map((seat: any) => {
                        const isBooked = apiSeats.BookedSeats?.some(
                            (bookedSeat: any) =>
                                bookedSeat.row_label === seat.Row_Label &&
                                bookedSeat.column_number === seat.Column_Number
                        ) || false;

                        const isPending = apiSeats.PendingSeats?.some(
                            (pendingSeat: any) =>
                                pendingSeat.row_label === seat.Row_Label &&
                                pendingSeat.column_number === seat.Column_Number
                        ) || false;

                        const seatId = `${seat.Row_Label}${seat.Column_Number}`;
                        const seatName = `${seat.Row_Label}${seat.Column_Number}`;

                        return {
                            id: seatId,
                            name: seatName,
                            row: seat.Row_Label,
                            number: seat.Column_Number,
                            type: seat.Seat_Type.toLowerCase(),
                            status: isBooked || isPending ? 'occupied' : 'available',
                            price: seat.Price || 90000,
                            layoutId: seat.Layout_ID
                        };
                    });

                    setSeats(processedSeats);
                } else {
                    setSeats([]);
                }

                // 🎬 FETCH MOVIE DETAILS từ API /movies/{id}
                const movieId = apiSeats.Showtime?.Movie_ID || apiSeats.Movie_ID;
                if (movieId) {
                    try {
                        console.log(`🎬 Fetching movie details for Movie_ID: ${movieId}`);
                        const movieResponse = await api.get(`/movies/${movieId}`);
                        
                        let movieData = null;
                        if (movieResponse.data && movieResponse.data.success && movieResponse.data.data) {
                            movieData = movieResponse.data.data;
                        } else if (movieResponse.data && (movieResponse.data.Movie_ID || movieResponse.data.Movie_Name)) {
                            movieData = movieResponse.data;
                        }

                        if (movieData) {
                            console.log(`✅ Movie details fetched:`, movieData);
                            setBookingSession(prev => ({
                                ...prev,
                                movieId: String(movieData.Movie_ID || movieId),
                                movieDetails: {
                                    title: movieData.Movie_Name || 'Unknown Movie',
                                    poster: movieData.Poster_URL || '',
                                    duration: movieData.Duration || 90,
                                    rating: movieData.Rating,
                                    genre: movieData.Genre
                                },
                                movieTitle: movieData.Movie_Name
                            }));
                        } else {
                            throw new Error('No movie data in response');
                        }
                    } catch (movieError) {
                        console.error('❌ Error fetching movie details:', movieError);
                        // Fallback to existing movie data if API fails
                        if (apiSeats.Movie) {
                            setBookingSession(prev => ({
                                ...prev,
                                movieDetails: {
                                    title: apiSeats.Movie.Movie_Name || 'Unknown Movie',
                                    poster: apiSeats.Movie.Poster_URL || '',
                                    duration: apiSeats.Movie.Duration || 90
                                },
                                movieTitle: apiSeats.Movie.Movie_Name
                            }));
                        }
                    }
                } else if (apiSeats.Movie) {
                    // Fallback nếu không có movieId
                    setBookingSession(prev => ({
                        ...prev,
                        movieDetails: {
                            title: apiSeats.Movie.Movie_Name || 'Unknown Movie',
                            poster: apiSeats.Movie.Poster_URL || '',
                            duration: apiSeats.Movie.Duration || 90
                        },
                        movieTitle: apiSeats.Movie.Movie_Name
                    }));
                }

                createRoomFromSeats(apiSeats);
            } else {
                setSeats([]);
                createDefaultRoom();
            }
        } catch (error: any) {
            if (error.response?.data?.message) {
                const errorMsg = error.response.data.message;
                if (errorMsg.includes('đơn đặt vé chưa thanh toán') || errorMsg.includes('Bạn đang có một')) {
                    const movieMatch = errorMsg.match(/phim "([^"]+)"/);
                    const timeMatch = errorMsg.match(/còn (\d+) phút/);
                    const bookingId = extractBookingId(error);

                    setBookingError({
                        message: errorMsg,
                        movieTitle: movieMatch ? movieMatch[1] : 'Không xác định',
                        expiryTime: timeMatch ? parseInt(timeMatch[1]) : 0,
                        bookingId: bookingId
                    });
                    return;
                }
            }

            toast.error('Không thể lấy thông tin ghế.');
            setSeats([]);
            createDefaultRoom();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSeats();
    }, [showtimeId, showtime]);

    useEffect(() => {
        return () => {
            if (qrCheckInterval) {
                clearInterval(qrCheckInterval);
            }
        };
    }, [qrCheckInterval]);

    const startPaymentStatusCheck = (bookingId: string, orderCode?: string) => {
        // Xóa interval cũ nếu có
        if (qrCheckInterval) {
            clearInterval(qrCheckInterval);
        }

        // Đặt interval mới để kiểm tra trạng thái thanh toán mỗi 5 giây
        const intervalId = window.setInterval(async () => {
            try {
                // Sử dụng orderCode nếu có, nếu không fallback sang bookingId
                const checkEndpoint = orderCode
                    ? `/payos/check-status/${orderCode}`
                    : `/payos/check-payment-status?bookingId=${bookingId}`;

                const response = await api.get(checkEndpoint);

                // Xác định trạng thái thanh toán từ API response - CHỈ CHECK PAYMENT STATUS
                const isPaid = response.data?.data?.status === 'PAID' ||
                    response.data?.status === 'PAID' ||
                    response.data?.data?.payosInfo?.status === 'PAID' ||
                    response.data?.payosInfo?.status === 'PAID' ||
                    response.data?.payment?.status === 'PAID' ||
                    response.data?.data?.payment?.status === 'PAID';

                if (isPaid) {
                    // Dừng interval
                    clearInterval(intervalId);
                    setQrCheckInterval(null);
                    
                    // Đóng QR modal
                    setShowQrCode(false);
                    setPaymentQrUrl(null);
                    
                    // Hiển thị thông báo thành công
                    toast.success('Thanh toán thành công! Đang chuyển hướng...');
                    
                    // Redirect đến trang booking success
                    setTimeout(() => {
                        navigate(`/booking-success/${bookingId}`, {
                            state: {
                                fromPayment: true,
                                paymentMethod: 'PayOS'
                            }
                        });
                    }, 1500);
                }
            } catch (error) {
                // Silent error handling - tiếp tục check
            }
        }, 5000); // Check mỗi 5 giây

        setQrCheckInterval(intervalId);
    };

    const cancelQrPayment = () => {
        if (qrCheckInterval) {
            clearInterval(qrCheckInterval);
            setQrCheckInterval(null);
        }
        setShowQrCode(false);
        setPaymentQrUrl(null);
        toast('Đã hủy thanh toán qua QR Code');
    };

    const createRoomFromSeats = (apiSeats: any) => {
        const uniqueRows = new Set();
        const seatsByRow: Record<string, any[]> = {};

        if (apiSeats.SeatLayouts && Array.isArray(apiSeats.SeatLayouts)) {
            apiSeats.SeatLayouts.forEach((seat: any) => {
                const row = seat.Row_Label;
                uniqueRows.add(row);

                if (!seatsByRow[row]) {
                    seatsByRow[row] = [];
                }
                seatsByRow[row].push(seat);
            });
        }

        const rows = Array.from(uniqueRows).sort();
        const seatsPerRowArr = rows.map(row => seatsByRow[row as string].length);

        const cinemaRoom: CinemaRoom = {
            id: apiSeats.Room?.Room_ID?.toString() || 'room-1',
            name: apiSeats.Room?.Room_Name || 'Default Room',
            type: apiSeats.Room?.Room_Type?.toLowerCase() || 'standard',
            totalSeats: apiSeats.Total_Seats || seats.length || 50,
            rows: rows.length,
            seatsPerRow: seatsPerRowArr,
            layout: [],
            screenPosition: 'front'
        };

        setRoom(cinemaRoom);
    };

    const createDefaultRoom = () => {
        try {
            const cinemaRoom = cinemaRooms && cinemaRooms.length > 0
                ? cinemaRooms[0]
                : createStandardRoom();
            setRoom(cinemaRoom);
        } catch (error) {
            setRoom(createStandardRoom());
        }
    };

    // Booking steps
    const bookingSteps: BookingStep[] = [
        { id: 1, name: 'seats', title: 'Chọn ghế', completed: false, active: bookingSession.step === 1 },
        { id: 2, name: 'payment', title: 'Thanh toán', completed: bookingSession.step > 2, active: bookingSession.step === 2 },
        { id: 3, name: 'confirmation', title: 'Xác nhận', completed: bookingSession.step > 3, active: bookingSession.step === 3 }
    ];

    // Handle seat selection
    const handleSelectSeats = useCallback((seats: Seat[]) => {
        setBookingSession(prev => {
            const totalPrice = seats.reduce((sum, seat) => sum + seat.price, 0);
            if (prev.selectedSeats.length === seats.length && prev.totalPrice === totalPrice) {
                return prev;
            }
            return { ...prev, selectedSeats: seats, totalPrice };
        });
    }, []);

    const handleProceedToPayment = useCallback(async () => {
        if (loading || isProcessingPayment) return;

        if (bookingSession.selectedSeats.length === 0) {
            toast.error('Vui lòng chọn ít nhất một ghế.');
            return;
        }

        setBookingError(null);
        setIsProcessingPayment(true);
        setLoading(true);

        try {
            toast.loading('Đang xử lý đơn đặt vé...', { duration: 8000 });

            const layoutSeatIds = bookingSession.selectedSeats.map((seat: any) => seat.layoutId);
            const bookingData = {
                Showtime_ID: Number(bookingSession.showtimeId),
                layoutSeatIds,
                userId: user?.id ? String(user.id) : null
            };

            const response = await bookingService.createBooking(bookingData);
            toast.dismiss();

            const bookingId = (response as any)?.id ||
                (response as any)?.booking?.Booking_ID ||
                (response as any)?.data?.id ||
                (response as any)?.data?.booking?.Booking_ID ||
                (response as any)?.Booking_ID ||
                '';

            if (!bookingId) {
                throw new Error('Không nhận được mã đơn hàng từ hệ thống.');
            }

            toast.success(`Đặt vé thành công #${bookingId}!`);

            const updatedSession = {
                ...bookingSession,
                step: 2,
                bookingId: String(bookingId),
                movieId: bookingSession.movieId || String(bookingSession.movieId)
            };

            console.log(`🎬 Navigating to payment with movieId: ${updatedSession.movieId}`);
            console.log('📋 Full booking session before navigate:', updatedSession);

            navigate(`/payment/${bookingId}`, {
                state: {
                    bookingSession: updatedSession,
                    movieId: bookingSession.movieId,
                    movie: bookingSession.movieDetails ? {
                        id: bookingSession.movieId,
                        title: bookingSession.movieDetails.title,
                        poster: bookingSession.movieDetails.poster
                    } : movie,
                    theater,
                    showtime
                }
            });

        } catch (error: any) {
            toast.dismiss();

            // Check for pending booking error - cải thiện logic detection
            const errorMessage = error.message || '';
            const isPendingBookingError = 
                errorMessage.includes('đơn đặt vé chưa thanh toán') ||
                errorMessage.includes('Bạn đang có một đơn đặt vé') ||
                errorMessage.includes('đơn đặt vé hiện tại') ||
                (error.bookingId !== undefined) || // Check if error has bookingId field
                (error.movieTitle !== undefined); // Check if error has movieTitle field

            if (isPendingBookingError) {
                setBookingError({
                    message: error.message || 'Bạn đang có đơn đặt vé chưa thanh toán',
                    movieTitle: error.movieTitle || 'Không xác định',
                    expiryTime: error.expiryTime || 15, // Default 15 minutes
                    bookingId: error.bookingId || extractBookingId(error)
                });
            } else {
                const fallbackMessage = error.message || 'Không thể tạo đơn đặt vé. Vui lòng thử lại.';
                toast.error(fallbackMessage);
            }
        } finally {
            setLoading(false);
            setIsProcessingPayment(false);
        }
    }, [loading, isProcessingPayment, bookingSession, user, navigate, movie, theater, showtime]);

    // Cập nhật phương thức handleBack để gọi API hủy booking
    const handleBack = async () => {
        try {
            // Nếu đã chọn ghế, hỏi người dùng xác nhận
            if (bookingSession.selectedSeats.length > 0) {
                const confirmed = window.confirm('Bạn có chắc chắn muốn quay lại? Các ghế đã chọn sẽ bị hủy.');
                if (!confirmed) {
                    return;
                }
            }

            // Xử lý hủy booking nếu có
            await handleCancelBackendBooking();

            // Sau khi xử lý xong hoặc nếu không cần xử lý, quay về trang trước
            navigate(-1);
        } catch (error) {
            navigate(-1); // Vẫn quay lại dù có lỗi
        }
    };

    const handleCancelBackendBooking = async () => {
        try {
            try {
                // Gọi API kiểm tra booking pending thay vì localStorage
                const checkPendingResponse = await api.get('/bookings/check-pending');

                if (checkPendingResponse.data?.pendingBooking) {
                    const pendingBooking = checkPendingResponse.data.pendingBooking;
                    const pendingBookingId = pendingBooking.Booking_ID || pendingBooking.id;

                    if (pendingBookingId) {
                        const response = await bookingService.cancelBooking(pendingBookingId);
                        if (response && response.success) {
                            toast.success('Đã hủy đơn đặt vé thành công');
                            return true;
                        }
                    }
                }
            } catch (error1) {
                // Silent error handling for cancel booking attempt
            }

            return false;
        } catch (error) {
            // Silent error handling for cancel booking attempt
            return false;
        }
    };

    const handlePayExistingBooking = async () => {
        if (!bookingError || !bookingError.bookingId) {
            toast.error('Không tìm thấy mã đơn hàng');
            return;
        }

        try {
            // Không set loading để tránh che khuất QR modal
            // setLoading(true);
            const bookingId = bookingError.bookingId;
            toast.loading('Đang kết nối đến cổng thanh toán PayOS...');

            // Sử dụng lại GET endpoint như trong profile
            const response = await api.get('/payos/pending-payment-url');
            
            toast.dismiss();

            // Sửa logic extract data để match với cấu trúc response thực tế
            const responseData = response.data?.data || response.data;
            
            const paymentUrl = responseData?.payment?.paymentUrl ||
                responseData?.paymentUrl ||
                response.data?.payment?.paymentUrl ||
                response.data?.paymentUrl ||
                response.data?.data?.paymentUrl ||
                response.data?.data?.url ||
                response.data?.url;

            const qrCodeData = responseData?.payment?.qrCode ||
                responseData?.qrCode ||
                response.data?.payment?.qrCode ||
                response.data?.qrCode ||
                response.data?.data?.qrCode;

            // Extract orderCode từ response để use trong payment status check
            const orderCode = responseData?.payment?.orderCode ||
                responseData?.orderCode ||
                response.data?.payment?.orderCode ||
                response.data?.orderCode ||
                response.data?.data?.orderCode;

            if (qrCodeData) {
                const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeData)}`;
                
                setPaymentQrUrl(qrUrl);
                setShowQrCode(true);
                toast.success('Mã QR thanh toán đã được tạo');
                startPaymentStatusCheck(bookingId, orderCode);
            }
            else if (paymentUrl) {
                setPaymentQrUrl(paymentUrl);
                setShowQrCode(true);
                toast.success('Mã QR thanh toán đã được tạo');
                startPaymentStatusCheck(bookingId, orderCode);
            }
            else if (response?.data?.success === false) {
                throw new Error(response.data.message || 'Không thể tạo liên kết thanh toán');
            }
            else {
                navigate(`/payment/${bookingId}`, {
                    state: {
                        fromExistingBooking: true
                    }
                });
            }
        } catch (error: any) {
            toast.dismiss();
            
            const errorMessage = error.response?.data?.message || error.message || 'Không thể kết nối đến dịch vụ thanh toán';
            toast.error(errorMessage);
            
            // Fallback: navigate to payment page
            navigate(`/payment/${bookingError.bookingId}`, {
                state: {
                    fromExistingBooking: true
                }
            });
        }
    };

    const handleCancelExistingBooking = async () => {
        try {
            setLoading(true);
            toast.loading('Đang kiểm tra thông tin đơn hàng...');

            const checkPendingResponse = await api.get('/bookings/check-pending');

            let bookingId = null;
            if (checkPendingResponse.data?.pendingBooking) {
                const pendingBooking = checkPendingResponse.data.pendingBooking;
                bookingId = pendingBooking.Booking_ID || pendingBooking.id;
            }

            if (!bookingId && bookingError?.bookingId) {
                bookingId = bookingError.bookingId;
            }

            if (!bookingId) {
                toast.error('Không tìm thấy thông tin đơn hàng đang chờ thanh toán');
                setLoading(false);
                return;
            }

            toast.loading(`Đang hủy đơn đặt vé #${bookingId}...`);

            // Thay thế directCancelBooking bằng cancelBooking
            const cancelResult = await bookingService.cancelBooking(bookingId);

            toast.dismiss();
            toast.success(cancelResult.message || `Đã hủy đơn đặt vé #${bookingId} thành công`);

            setBookingError(null);

            // Gọi lại fetchSeats để cập nhật trạng thái ghế
            await fetchSeats();

            // Đợi một chút để đảm bảo server đã cập nhật trạng thái ghế
            setTimeout(async () => {
                await fetchSeats();
            }, 1000);

        } catch (error: any) {
            toast.dismiss();
            toast.error('Có lỗi xảy ra khi hủy đơn đặt vé. Vui lòng thử lại sau.');
            setBookingError(null);

            // Vẫn cố gắng cập nhật trạng thái ghế ngay cả khi có lỗi
            try {
                await fetchSeats();
            } catch (e) {
                // Silent error handling - không thể cập nhật trạng thái ghế
            }
        } finally {
            setLoading(false);
        }
    };

    // Movie details for the header
    const movieDetails = {
        title: bookingSession.movieDetails?.title || movie?.title || "Đang tải thông tin phim...",
        poster: bookingSession.movieDetails?.poster || movie?.posterUrl || "/placeholder.jpg",
        language: showtime?.language || "VIE",
        format: showtime?.format || "2D",
        cinema: theater?.name || "Galaxy Cinema",
        date: new Date(showtime?.startTime || Date.now()).toLocaleDateString('vi-VN'),
        time: new Date(showtime?.startTime || Date.now()).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        })
    };

    if (loading || !room) {
        return (
            <>
                <FullScreenLoader />
                
                {/* QR Code Modal cho thanh toán PayOS - render bên ngoài loading */}
                {showQrCode && paymentQrUrl && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
                        <div className="bg-slate-800 p-8 rounded-2xl max-w-md w-full border-2 border-[#FFD875]/60 shadow-lg shadow-[#FFD875]/10 m-4 relative">
                            <button
                                onClick={cancelQrPayment}
                                className="absolute top-4 right-4 text-gray-400 hover:text-white"
                            >
                                <XCircleIcon className="h-6 w-6" />
                            </button>

                            <h2 className="text-2xl font-bold mb-4 text-center text-[#FFD875]">Thanh toán bằng PayOS</h2>

                            {/* Hiển thị số tiền thanh toán */}
                            <div className="mb-4 text-center">
                                <p className="text-sm text-gray-300 mb-1">Số tiền thanh toán:</p>
                                <p className="text-2xl font-bold text-[#FFD875] drop-shadow-[0_0_10px_rgba(255,216,117,0.5)]">
                                    {bookingSession?.totalPrice ? bookingSession.totalPrice.toLocaleString('vi-VN') : 0} đ
                                </p>
                                
                                {/* Hiển thị chi tiết ghế đã chọn */}
                                <div className="mt-3 text-center">
                                    <p className="text-xs text-gray-400">
                                        {bookingSession?.selectedSeats?.length || 0} ghế: {bookingSession?.selectedSeats?.map(seat => `${seat.row}${seat.number}`).join(', ')}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-lg mb-4">
                                <div className="flex justify-center">
                                    <img
                                        src={paymentQrUrl}
                                        alt="QR Code thanh toán"
                                        className="max-w-full h-auto"
                                        onError={() => {
                                            toast.error("Không thể tải QR code");
                                        }}
                                    />
                                </div>
                            </div>

                            <p className="text-center text-sm mb-4">
                                Quét mã QR bằng ứng dụng ngân hàng của bạn để thanh toán
                            </p>

                            <div className="text-center mb-4">
                                <a
                                    href={paymentQrUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block bg-[#FFD875] text-black py-3 px-6 rounded-lg font-medium hover:bg-[#FFD875]/80 transition-colors"
                                >
                                    Mở liên kết thanh toán
                                </a>
                            </div>

                            <div className="text-center text-xs text-gray-400">
                                <p>Trang sẽ tự động chuyển hướng sau khi thanh toán thành công</p>
                            </div>
                        </div>
                    </div>
                )}
            </>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-900">
            {/* Header và các thành phần khác */}
            <header className="bg-black text-white py-2 px-4 shadow-md">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <button onClick={handleBack} className="p-2 rounded-full hover:bg-gray-800">
                            <ArrowLeftIcon className="h-6 w-6" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold">{movie?.title || 'Đặt vé'}</h1>
                            <p className="text-sm text-gray-300">{theater?.name || 'Rạp chiếu phim'}</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hiển thị tiến trình đặt vé - giảm padding */}
            <div className="container mx-auto px-4 py-1">
                <BookingProgress steps={bookingSteps} currentStep={bookingSession.step} />
            </div>

            {/* Dialog hiển thị lỗi đơn đặt vé đang tồn tại */}
            {bookingError && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-80">
                    <div className="bg-gray-800 p-6 rounded-xl shadow-2xl max-w-md w-full border border-yellow-500">
                        <div className="text-center mb-5">
                            <div className="w-16 h-16 mx-auto bg-yellow-500 rounded-full flex items-center justify-center mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-yellow-500 mb-2">Thông báo</h3>
                            <p className="text-white mb-4">{bookingError.message}</p>
                            <div className="text-gray-300 mb-5">
                                <p>Phim: <span className="font-semibold">{bookingError.movieTitle}</span></p>
                                {bookingError.expiryTime && (
                                    <p>Thời gian còn lại: <span className="font-semibold">{bookingError.expiryTime} phút</span></p>
                                )}
                            </div>
                            <div className="flex flex-col space-y-3">
                                <button
                                    onClick={() => {
                                        handlePayExistingBooking();
                                    }}
                                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-black py-2 px-4 rounded-md font-medium transition-colors"
                                >
                                    Thanh toán đơn hàng hiện tại
                                </button>
                                <button
                                    onClick={handleCancelExistingBooking}
                                    className="w-full bg-transparent hover:bg-gray-700 text-white border border-gray-500 py-2 px-4 rounded-md font-medium transition-colors"
                                >
                                    Hủy đơn hàng hiện tại
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Loading */}
            {loading ? (
                <FullScreenLoader />
            ) : (
                <main className="flex-grow container mx-auto px-4 py-1">
                    {/* Hiển thị giao diện chọn ghế */}
                    <SeatSelection
                        room={room || createStandardRoom()}
                        onSeatsChange={handleSelectSeats}
                        onNext={handleProceedToPayment}
                        onBack={handleBack}
                        bookingSession={bookingSession}
                        bookingSteps={bookingSteps}
                        currentStep={1}
                        seats={seats}
                        movieDetails={movieDetails}
                    />
                </main>
            )}
            
            {/* QR Code Modal cho thanh toán PayOS - duplicate để render trong cả loading và non-loading */}
            {showQrCode && (
                <PayOSQRModal
                    isOpen={showQrCode}
                    onClose={() => setShowQrCode(false)}
                    bookingId={selectedBookingId || bookingError?.bookingId || ''}
                    onPaymentSuccess={(transactionId) => {
                        setShowQrCode(false);
                        // Redirect to success page hoặc reload trang
                        navigate(`/booking-success/${selectedBookingId || bookingError?.bookingId}`);
                                    }}
                    amount={bookingSession?.totalPrice || 0}
                    ticketInfo={bookingSession?.selectedSeats?.map(seat => `${seat.row}${seat.number}`).join(', ')}
                    skipConfirmation={true}
                />
            )}
        </div>
    );
};

export default BookingPage;

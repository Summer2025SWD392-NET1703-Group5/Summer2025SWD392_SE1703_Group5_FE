// // pages/PaymentPage.tsx
// import React, { useState, useEffect, useRef } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import {
//   ArrowLeftIcon,
//   CheckCircleIcon,
//   ClockIcon,
//   LockClosedIcon,
//   ShieldCheckIcon,
//   XCircleIcon,
//   MagnifyingGlassIcon,
//   UserPlusIcon,
//   BanknotesIcon,
//   QrCodeIcon
// } from '@heroicons/react/24/outline';
// import BookingProgress from '../components/BookingProgress';
// import PayOSQRModal from '../components/PayOSQRModal';
// import type { BookingSession } from '../types';
// import { toast } from 'react-hot-toast';
// import api from '../config/api';

// const mockPromoCodes = [
//   { code: 'CINEMA10', description: 'Giảm 10,000đ', value: 10000 },
//   { code: 'MEGA50', description: 'Giảm 50,000đ cho đơn trên 200k', value: 50000 },
//   { code: 'BOLTNEW', description: 'Giảm 20% cho thành viên mới', value: 0.2 },
// ];

// const PaymentPage: React.FC = () => {
//   const location = useLocation();
//   const navigate = useNavigate();

//   // Thay thế useAuth bằng cách kiểm tra localStorage
//   const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
//   const [user, setUser] = useState<any>(null);

//   const bookingSession = location.state?.bookingSession as BookingSession;

//   const hasCalledBookingApi = useRef(false);

//   const [isProcessing, setIsProcessing] = useState(false);
//   const [timeLeft, setTimeLeft] = useState(5 * 60);
//   const [paymentComplete, setPaymentComplete] = useState<boolean>(false);
//   const [paymentError, setPaymentError] = useState<string | null>(null);

//   const [selectedPromo, setSelectedPromo] = useState<string | null>(null);
//   const [manualPromoCode, setManualPromoCode] = useState('');
//   const [appliedDiscount, setAppliedDiscount] = useState<number>(0);

//   const [pointsToUse, setPointsToUse] = useState<string>('');
//   const [appliedPointsValue, setAppliedPointsValue] = useState<number>(0);
//   const [pointsError, setPointsError] = useState<string | null>(null);

//   const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);

//   const [customerSearch, setCustomerSearch] = useState('');
//   const [foundCustomer, setFoundCustomer] = useState<{
//     User_ID: number;
//     Full_Name: string;
//     Email: string;
//     Phone_Number: string;
//     Total_Points?: number;
//   } | null>(null);
//   const [showCreateCustomerForm, setShowCreateCustomerForm] = useState(false);
//   const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);
//   const [customerLinked, setCustomerLinked] = useState(false);
//   const [isLinkingCustomer, setIsLinkingCustomer] = useState(false);
//   const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
//   const [shouldAutoLink, setShouldAutoLink] = useState(false);

//   const [movieDetails, setMovieDetails] = useState<any>(null);
//   const [showtime, setShowtime] = useState<any>(null);
//   const [theater, setTheater] = useState<any>(null);
//   const [isLoadingMovie, setIsLoadingMovie] = useState<boolean>(false);

//   // PayOS QR Modal states - thay thế các state cũ
//   const [showPayOSModal, setShowPayOSModal] = useState<boolean>(false);

//   const [userLoyaltyPoints, setUserLoyaltyPoints] = useState<number>(0);
//   const [isLoadingPoints, setIsLoadingPoints] = useState<boolean>(false);
//   const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
//   const [isApplyingPoints, setIsApplyingPoints] = useState<boolean>(false);

//   const cinemaName = bookingSession?.cinemaId ? `Rạp ${bookingSession.cinemaId}` : "Galaxy Cinema";
//   const showDate = bookingSession?.showtimeId ? new Date().toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN');
//   const showTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

//   const steps = [
//     { id: 1, name: 'seats', title: 'Chọn ghế', completed: true, active: false },
//     { id: 2, name: 'payment', title: 'Thanh toán', completed: false, active: true },
//     { id: 3, name: 'confirmation', title: 'Xác nhận', completed: false, active: false }
//   ];

//   // Kiểm tra trạng thái đăng nhập bằng API thay vì localStorage
//   useEffect(() => {
//     const checkAuthStatus = async () => {
//       try {
//         const storedToken = localStorage.getItem('accessToken');
//         const storedRefreshToken = localStorage.getItem('refreshToken');

//         if (!storedToken) {
//           setIsAuthenticated(false);
//           setUser(null);
//           return;
//         }

//         const endpoints = ['/auth/profile', '/profile', '/user/profile', '/me'];
//         let userData = null;
//         let successEndpoint = null;

//         for (const endpoint of endpoints) {
//           try {
//             const response = await api.get(endpoint);

//             if (response.data && (response.data.success !== false)) {
//               userData = response.data.user || response.data.data || response.data;
//               successEndpoint = endpoint;
//               break;
//             }
//           } catch (endpointError: any) {
//             continue;
//           }
//         }

//         if (userData && successEndpoint) {
//           setIsAuthenticated(true);
//           setUser(userData);
//         } else {
//           setIsAuthenticated(false);
//           setUser(null);
//         }
//       } catch (error) {
//         console.error('Auth check failed:', error);
//         setIsAuthenticated(false);
//         setUser(null);
//       }
//     };

//     checkAuthStatus();
//   }, []);

//   useEffect(() => {
//     if (!bookingSession) {
//       navigate('/');
//       return;
//     }
//     const timer = setInterval(() => setTimeLeft(prev => (prev > 0 ? prev - 1 : 0)), 1000);
//     return () => clearInterval(timer);
//   }, [bookingSession, navigate]);

//   useEffect(() => {
//     if (timeLeft === 0 && !paymentComplete && !paymentError) {
//       handlePaymentTimeout();
//     }
//   }, [timeLeft, paymentComplete, paymentError]);

//   // Combined useEffect: Fetch showtime first, then movie details
//   useEffect(() => {
//     const fetchShowtimeAndMovieDetails = async () => {
//       if (!bookingSession?.showtimeId) return;

//       try {
//         const showtimeResponse = await api.get(`/showtimes/${bookingSession.showtimeId}`);

//         if (showtimeResponse.data) {
//           const showtimeData = showtimeResponse.data.data || showtimeResponse.data;
          
//           if (showtimeData) {
//             setShowtime({
//               id: showtimeData.Showtime_ID,
//               movieId: showtimeData.Movie_ID,
//               cinemaRoomId: showtimeData.Cinema_Room_ID,
//               date: showtimeData.Show_Date,
//               startTime: showtimeData.Start_Time,
//               endTime: showtimeData.End_Time,
//               price: showtimeData.Base_Price || 90000
//             });

//             if (showtimeData.Room_Name) {
//               setTheater({
//                 id: showtimeData.Cinema_ID || 1,
//                 name: showtimeData.Cinema_Name || 'Galaxy Cinema',
//                 address: showtimeData.Cinema_Address || '',
//                 room: {
//                   id: showtimeData.Cinema_Room_ID,
//                   name: showtimeData.Room_Name,
//                   type: showtimeData.Room_Type || '2D'
//                 }
//               });
//             }

//             const movieId = showtimeData.Movie_ID;
            
//             try {
//               const movieResponse = await api.get(`/movies/${movieId}`);
//               const movieData = movieResponse.data;

//               let finalMovieData = null;
//               if (movieData.success && movieData.data) {
//                 finalMovieData = movieData.data;
//               } else if (movieData.Movie_ID || movieData.Movie_Name) {
//                 finalMovieData = movieData;
//               }

//               if (finalMovieData) {
//                 setMovieDetails({
//                   id: finalMovieData.Movie_ID,
//                   title: finalMovieData.Movie_Name,
//                   duration: finalMovieData.Duration,
//                   rating: finalMovieData.Rating,
//                   genre: finalMovieData.Genre,
//                   poster: finalMovieData.Poster_URL,
//                   description: finalMovieData.Synopsis
//                 });
//               }
//             } catch (movieError: any) {
//               console.error('Error fetching movie details:', movieError);
//             } finally {
//               setIsLoadingMovie(false);
//             }
//           }
//         }
//       } catch (error) {
//         console.error('Error fetching showtime details:', error);
//         setIsLoadingMovie(false);
//       }
//     };

//     fetchShowtimeAndMovieDetails();
//   }, [bookingSession?.showtimeId, user?.accessToken]);

//   // Create booking on page load
//   useEffect(() => {
//     const createInitialBooking = async () => {
//       try {
//         setIsProcessing(true);
//         toast.loading('Đang kết nối với đơn đặt vé...');

//         if (location.state?.bookingSession?.bookingId) {
//           const bookingId = location.state.bookingSession.bookingId;
//           setCreatedBookingId(bookingId);
//           toast.dismiss();
//           toast.success('Đã kết nối với đơn đặt vé');
//           hasCalledBookingApi.current = true;
//           setIsProcessing(false);
//           return;
//         }

//         const pathSegments = location.pathname.split('/');
//         const bookingIdFromUrl = pathSegments[pathSegments.length - 1];

//         if (bookingIdFromUrl && bookingIdFromUrl !== 'payment') {
//           setCreatedBookingId(bookingIdFromUrl);
//           toast.dismiss();
//           toast.success('Đã kết nối với đơn đặt vé');
//           hasCalledBookingApi.current = true;
//           setIsProcessing(false);
//           return;
//         }

//         toast.dismiss();
//         toast.error('Không tìm thấy thông tin đơn đặt vé. Vui lòng quay lại chọn ghế.');
//         navigate(-1);

//         hasCalledBookingApi.current = true;
//       } catch (error: any) {
//         toast.dismiss();
//         toast.error('Không thể kết nối với đơn đặt vé. Vui lòng thử lại.');
//         navigate(-1);
//       } finally {
//         setIsProcessing(false);
//         toast.dismiss();
//       }
//     };

//     createInitialBooking();
//   }, []);

//   // Lấy thông tin điểm thưởng khi component mount
//   useEffect(() => {
//     const fetchUserPoints = async () => {
//       if (!isAuthenticated) return;

//       try {
//         setIsLoadingPoints(true);

//         // Thay đổi: Sử dụng API points/user/{id} thay vì userService.getUserPoints
//         // Lấy ID người dùng từ user hiện tại
//         const userId = user?.id || user?.User_ID || user?.userId;
        
//         if (!userId) {
//           setIsLoadingPoints(false);
//           return;
//         }
        
//         // Gọi API points/user/{id}
//         const response = await api.get(`/points/user/${userId}`);
//         let pointsData;
        
//         if (response.data?.success && response.data?.data) {
//           pointsData = response.data.data;
//         } else {
//           pointsData = response.data;
//         }

//         let actualPoints = 0;

//         if (pointsData && typeof pointsData === 'object') {
//           if (typeof pointsData.total_points === 'number') {
//             actualPoints = pointsData.total_points;
//           }
//           else if (typeof pointsData.user_id === 'number' && pointsData.total_points !== undefined) {
//             actualPoints = Number(pointsData.total_points) || 0;
//           }
//           else if (typeof pointsData === 'number') {
//             actualPoints = pointsData;
//           }
//           else {
//             actualPoints = 0;
//           }
//         } else if (typeof pointsData === 'number') {
//           actualPoints = pointsData;
//         } else {
//           actualPoints = 0;
//         }

//         setUserLoyaltyPoints(actualPoints);
//       } catch (error) {
//         console.error('Error fetching user points:', error);
//         setUserLoyaltyPoints(0);
//       } finally {
//         setIsLoadingPoints(false);
//       }
//     };

//     fetchUserPoints();
//   }, [isAuthenticated, user]);

//   // Auto-link customer mới tạo với booking
//   useEffect(() => {
//     if (foundCustomer && shouldAutoLink && createdBookingId && !customerLinked && !isLinkingCustomer) {
//       setShouldAutoLink(false);

//       setTimeout(() => {
//         handleLinkCustomer();
//       }, 500);
//     }
//   }, [foundCustomer, shouldAutoLink, createdBookingId, customerLinked, isLinkingCustomer]);

//   // Fetch customer points when found
//   useEffect(() => {
//     const loadCustomerPoints = async () => {
//       if (foundCustomer && foundCustomer.User_ID && (foundCustomer.Total_Points === undefined || foundCustomer.Total_Points === 0)) {
//         try {
//           const points = await fetchCustomerPoints(foundCustomer.User_ID);
//           setFoundCustomer(prev => prev ? { ...prev, Total_Points: points } : null);
//         } catch (error) {
//           // Error silently handled
//         }
//       }
//     };
    
//     loadCustomerPoints();
//   }, [foundCustomer?.User_ID]);

//   // Update loyalty points when customer is linked
//   useEffect(() => {
//     if (customerLinked && foundCustomer?.Total_Points !== undefined) {
//       setUserLoyaltyPoints(foundCustomer.Total_Points);
//     }
//   }, [customerLinked, foundCustomer?.Total_Points]);

//   // Function để fetch customer points từ API
//   const fetchCustomerPoints = async (userId: string | number) => {
//     if (!userId || userId === 0) {
//       return 0;
//     }

//     try {
//       // Sử dụng API /points/user/{id} nhất quán với fetchUserPoints
//       const response = await api.get(`/points/user/${userId}`);
      
//       if (response.data && response.data.success && response.data.data) {
//         return response.data.data.total_points || 0;
//       } else if (response.data && typeof response.data.total_points === 'number') {
//         return response.data.total_points;
//       } else {
//         return 0;
//       }
//     } catch (error: any) {
//       console.error(`Error fetching points for user ${userId}:`, error);
//       return 0;
//     }
//   };

//   const formatTime = (seconds: number) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
//   };

//   const applyPromoCode = async (code: string) => {
//     if (!createdBookingId) {
//       toast.error('Vui lòng đợi hệ thống tạo đơn hàng');
//       return;
//     }

//     try {
//       setIsProcessing(true);

//       // Gọi API áp dụng mã khuyến mãi trực tiếp
//       const response = await api.post(`/promotions/apply`, {
//         bookingId: parseInt(createdBookingId),
//         promotionCode: code
//       });

//       // Kiểm tra success từ API response
//       const isSuccess = response.data?.success;
//       const message = response.data?.message;
//       const discount = response.data?.discount_amount || response.data?.discount || response.data?.data?.discount || 0;

//       if (isSuccess && discount > 0) {
//         setSelectedPromo(code);
//         setAppliedDiscount(discount);
//         toast.success('Đã áp dụng mã giảm giá!');
//       } else {
//         // Hiển thị thông báo lỗi từ API
//         const errorMessage = message || 'Mã khuyến mãi không hợp lệ';
//         toast.error(errorMessage);
//       }
//     } catch (error: any) {
//       toast.error(error.response?.data?.message || 'Mã khuyến mãi không hợp lệ');
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const handleSelectPromo = (code: string) => {
//     if (selectedPromo === code) {
//       setSelectedPromo(null);
//       setAppliedDiscount(0);
//     } else {
//       applyPromoCode(code);
//     }
//   };

//   const handleApplyPoints = async () => {
//     if (!createdBookingId) {
//       toast.error('Vui lòng đợi hệ thống tạo đơn hàng');
//       return;
//     }

//     setPointsError(null);
//     const points = parseInt(pointsToUse, 10);

//     if (isNaN(points) || points <= 0) {
//       setPointsError('Vui lòng nhập số điểm hợp lệ.');
//       return;
//     }

//     if (points > userLoyaltyPoints) {
//       setPointsError(`Bạn chỉ có ${userLoyaltyPoints} điểm khả dụng.`);
//       return;
//     }

//     try {
//       setIsProcessing(true);
//       setIsApplyingPoints(true);

//       toast.loading('Đang áp dụng điểm thưởng...');

//       await new Promise(resolve => setTimeout(resolve, 500));

//       const payload = {
//         pointsToUse: Number(points)
//       };

//       let response: any = null;
//       let attempts = 0;
//       const maxAttempts = 2;

//       while (attempts < maxAttempts) {
//         try {
//           attempts++;
//           response = await api.post(`/points/booking/${createdBookingId}/apply-discount`, payload);
//           break;

//         } catch (attemptError: any) {

//           if (attempts >= maxAttempts) {
//             throw attemptError;
//           } else {
//             if (attemptError.response?.status >= 500) {
//               await new Promise(resolve => setTimeout(resolve, 2000));
//             } else {
//               throw attemptError;
//             }
//           }
//         }
//       }

//       if (!response) {
//         throw new Error('Không nhận được phản hồi từ server sau nhiều lần thử');
//       }

//       handleSuccessfulPointsApplication(points, response.data);
//     } catch (error: any) {
//       toast.dismiss();

//       if (error.response && error.response.data) {
//         let errorMessage = 'Không thể áp dụng điểm';

//         if (error.response.data.message) {
//           errorMessage = error.response.data.message;
//         } else if (error.response.data.error) {
//           errorMessage = error.response.data.error;
//         } else if (typeof error.response.data === 'string') {
//           errorMessage = error.response.data;
//         } else if (error.response.status === 500) {
//           errorMessage = 'Lỗi server khi áp dụng điểm. Vui lòng thử lại sau.';
//         } else if (error.response.status === 400) {
//           errorMessage = 'Thông tin điểm không hợp lệ.';
//         } else if (error.response.status === 404) {
//           errorMessage = 'Không tìm thấy đơn đặt vé để áp dụng điểm.';
//         }

//         toast.error(errorMessage);
//         setPointsError(errorMessage);
//       } else if (error.request) {
//         const errorMessage = 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.';
//         toast.error(errorMessage);
//         setPointsError(errorMessage);
//       } else {
//         const errorMessage = error.message || 'Lỗi không xác định khi áp dụng điểm';
//         toast.error('Không thể áp dụng điểm. Vui lòng thử lại.');
//         setPointsError(errorMessage);
//       }
//     } finally {
//       setIsProcessing(false);
//       setIsApplyingPoints(false);
//     }
//   };

//   // Hàm xử lý kết quả thành công khi áp dụng điểm
//   const handleSuccessfulPointsApplication = (points: number, response: any) => {
//     toast.dismiss();

//     let discount = 0;
//     let actualPointsUsed = points;

//     if (response) {
//       if (response.points_used && response.original_total_amount && response.discounted_total_amount) {
//         actualPointsUsed = Number(response.points_used);
//         discount = response.original_total_amount - response.discounted_total_amount;

//       }
//       else if (response.original_total_amount && response.discounted_total_amount) {
//         discount = response.original_total_amount - response.discounted_total_amount;

//       }
//       else if (response.discount) {
//         discount = response.discount;
//       }
//       else if (response.points_used) {
//         actualPointsUsed = typeof response.points_used === 'number'
//           ? response.points_used
//           : Number(response.points_used);
//         discount = actualPointsUsed;
//       }
//       else {
//         discount = points;
//       }
//     } else {
//       discount = points;
//     }

//     setAppliedPointsValue(discount);
//     toast.success(`Đã áp dụng ${actualPointsUsed} điểm thành công, giảm ${discount.toLocaleString('vi-VN')}đ!`);

//     setUserLoyaltyPoints(prev => prev - actualPointsUsed);
//   };

//   const handleCustomerSearch = async () => {
//     if (!customerSearch.trim()) {
//       toast.error('Vui lòng nhập số điện thoại hoặc email');
//       return;
//     }

//     try {
//       setIsSearchingCustomer(true);

//       const isEmail = customerSearch.includes('@');
//       const isPhone = /^[0-9]{10,11}$/.test(customerSearch.trim());

//       if (!isEmail && !isPhone) {
//         toast.error('Vui lòng nhập số điện thoại (10-11 số) hoặc email hợp lệ');
//         return;
//       }

//       const endpoint = isEmail
//         ? `/member/lookup/email/${encodeURIComponent(customerSearch.trim())}`
//         : `/member/lookup/phone/${customerSearch.trim()}`;

//       const response = await api.get(endpoint);

//       let customerData = null;

//       if (response.data && response.data.success && response.data.data) {
//         customerData = response.data.data;
//       }
//       else if (response.data && response.data.User_ID) {
//         customerData = response.data;
//       }
//       else if (response.data && (response.data.Full_Name || response.data.Email || response.data.Phone_Number)) {
//         customerData = response.data;
//       }

//       if (customerData) {
//         const foundCustomerData = {
//           User_ID: customerData.User_ID || customerData.id || 0,
//           Full_Name: customerData.Full_Name || customerData.name || customerData.fullName || 'N/A',
//           Email: customerData.Email || customerData.email || 'N/A',
//           Phone_Number: customerData.Phone_Number || customerData.phone || customerData.phoneNumber || 'N/A',
//           Total_Points: customerData.Total_Points || customerData.points || customerData.totalPoints || 0
//         };

//         const customerPoints = await fetchCustomerPoints(foundCustomerData.User_ID);
//         foundCustomerData.Total_Points = customerPoints;

//         setFoundCustomer(foundCustomerData);
//         toast.success(`Đã tìm thấy khách hàng: ${foundCustomerData.Full_Name}`);
//       } else {
//         setFoundCustomer(null);
//         toast.error('Không tìm thấy khách hàng với thông tin này');
//       }
//     } catch (error: any) {
//       setFoundCustomer(null);

//       if (error.response?.status === 404) {
//         toast.error('Không tìm thấy khách hàng với thông tin này');
//       } else {
//         toast.error('Lỗi khi tìm kiếm khách hàng. Vui lòng thử lại.');
//       }
//     } finally {
//       setIsSearchingCustomer(false);
//     }
//   };

//   const handleCreateCustomer = async (e: React.FormEvent) => {
//     e.preventDefault();

//     try {
//       setIsCreatingCustomer(true);
//       const formData = new FormData(e.target as HTMLFormElement);
//       const dateOfBirth = formData.get('dateOfBirth') as string;
//       const newCustomerData = {
//         Full_Name: formData.get('name') as string,
//         Email: formData.get('email') as string,
//         Phone_Number: formData.get('phone') as string,
//         Sex: formData.get('sex') as string,
//         Date_Of_Birth: dateOfBirth || "2000-01-01",
//         Address: formData.get('address') as string || '',
//       };

//       toast.loading('Đang tạo tài khoản khách hàng...');

//       const response = await api.post('/user/staff-register', newCustomerData);

//       let isSuccess = false;
//       let createdCustomer = null;
//       let successMessage = '';

//       if (response.data && response.data.success && response.data.data) {
//         isSuccess = true;
//         createdCustomer = response.data.data;
//         successMessage = response.data.message || `Đã tạo tài khoản thành công cho ${createdCustomer.Full_Name}`;
//       }
//       else if (response.data && response.data.user) {
//         isSuccess = true;
//         createdCustomer = response.data.user;
//         successMessage = response.data.message || `Đã tạo tài khoản thành công cho ${createdCustomer.Full_Name}`;
//       }
//       else if (response.data && response.data.message && response.data.message.includes('Đã tạo tài khoản')) {
//         isSuccess = true;
//         createdCustomer = {
//           User_ID: Date.now(),
//           Full_Name: newCustomerData.Full_Name,
//           Email: newCustomerData.Email,
//           Phone_Number: newCustomerData.Phone_Number,
//           Total_Points: 0
//         };
//         successMessage = response.data.message;
//       }
//       else if (response.status === 200 || response.status === 201) {
//         isSuccess = true;
//         createdCustomer = {
//           User_ID: Date.now(),
//           Full_Name: newCustomerData.Full_Name,
//           Email: newCustomerData.Email,
//           Phone_Number: newCustomerData.Phone_Number,
//           Total_Points: 0
//         };
//         successMessage = `Đã tạo tài khoản thành công cho ${newCustomerData.Full_Name}`;
//       }

//       if (isSuccess && createdCustomer) {
//         setFoundCustomer({
//           User_ID: createdCustomer.User_ID,
//           Full_Name: createdCustomer.Full_Name,
//           Email: createdCustomer.Email,
//           Phone_Number: createdCustomer.Phone_Number,
//           Total_Points: createdCustomer.Total_Points || 0
//         });

//         toast.dismiss();
//         toast.success(successMessage);
//         setShowCreateCustomerForm(false);

//         setShouldAutoLink(true);
//       } else {
//         toast.dismiss();
//         toast.error('Không thể tạo tài khoản khách hàng');
//       }
//     } catch (error: any) {
//       toast.dismiss();

//       if (error.response?.data?.message && error.response.data.message.includes('Đã tạo tài khoản')) {
//         const createdCustomer = {
//           User_ID: Date.now(),
//           Full_Name: "Customer",
//           Email: "temp@example.com",
//           Phone_Number: "0000000000",
//           Total_Points: 0
//         };

//         setFoundCustomer(createdCustomer);
//         toast.success(error.response.data.message);
//         setShowCreateCustomerForm(false);

//         setShouldAutoLink(true);
//       } else if (error.response?.data?.message) {
//         if (error.response.data.message.includes('email')) {
//           toast.error('Email này đã được sử dụng. Vui lòng thử email khác.');
//         } else {
//           toast.error(`Lỗi: ${error.response.data.message}`);
//         }
//       } else {
//         toast.error('Không thể tạo tài khoản khách hàng. Vui lòng thử lại.');
//       }
//     } finally {
//       setIsCreatingCustomer(false);
//     }
//   };

//   // Hàm liên kết customer với booking
//   const handleLinkCustomer = async () => {
//     if (!foundCustomer || !createdBookingId) {
//       toast.error('Thiếu thông tin để liên kết khách hàng');
//       return;
//     }

//     try {
//       setIsLinkingCustomer(true);
//       toast.loading('Đang liên kết khách hàng với đơn hàng...');

//       const payloadOptions = [
//         {
//           bookingId: parseInt(createdBookingId, 10),
//           memberIdentifier: foundCustomer.Email
//         },
//         {
//           booking_id: parseInt(createdBookingId, 10),
//           member_id: foundCustomer.User_ID
//         }
//       ];

//       let success = false;
//       let responseData = null;

//       for (const payload of payloadOptions) {
//         try {
//           const response = await api.post('/member/link-member', payload);

//           if (response.data && (response.data.success || response.status === 200)) {
//             success = true;
//             responseData = response.data;
//             break;
//           }
//         } catch (payloadError: any) {
//           continue;
//         }
//       }

//       if (success) {
//         setCustomerLinked(true);
//         toast.dismiss();
//         toast.success(`Đã liên kết khách hàng ${foundCustomer.Full_Name} với đơn hàng`);
//       } else {
//         toast.dismiss();
//         toast.error('Không thể liên kết khách hàng với đơn hàng');
//       }
//     } catch (error: any) {
//       toast.dismiss();
//       toast.error('Lỗi khi liên kết khách hàng. Vui lòng thử lại.');
//     } finally {
//       setIsLinkingCustomer(false);
//     }
//   };

//   // Function để handle cash payment cho Staff
//   const handleCashPayment = async () => {
//     if (!createdBookingId) {
//       toast.error('Vui lòng đợi hệ thống tạo đơn hàng');
//       return;
//     }

//     const userRole = user?.role || user?.Role;
//     if (!['Staff', 'Admin', 'Manager'].includes(userRole)) {
//       toast.error('Chỉ nhân viên mới có quyền thanh toán tiền mặt');
//       return;
//     }

//     setIsProcessing(true);
//     setPaymentError(null);

//     try {
//       toast.loading('Đang xử lý thanh toán tiền mặt...');

//       // Gọi API thanh toán tiền mặt
//       const response = await api.put(`/bookings/${createdBookingId}/payment`);

//       toast.dismiss();

//       // Kiểm tra kết quả thanh toán
//       if (response.data && response.data.success) {
//         setPaymentComplete(true);
//         toast.success('Thanh toán tiền mặt thành công!');

//         // Chuyển hướng đến trang thành công
//         setTimeout(() => {
//           navigate(`/booking-success/${createdBookingId}`, {
//             state: {
//               bookingSession: {
//                 ...bookingSession,
//                 step: 3,
//                 discount: appliedDiscount + appliedPointsValue,
//               },
//               paymentResult: {
//                 success: true,
//                 transactionId: `CASH-${createdBookingId}-${Date.now()}`
//               },
//               paymentMethod: "Cash"
//             }
//           });
//         }, 1500);
//       } else {
//         throw new Error(response.data?.message || 'Thanh toán tiền mặt thất bại');
//       }
//     } catch (error: any) {
//       toast.dismiss();
//       const errorMessage = error.response?.data?.message || error.message || 'Thanh toán tiền mặt thất bại. Vui lòng thử lại.';
//       toast.error(errorMessage);
//       setPaymentError(errorMessage);
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   // Function để handle PayOS payment cho Staff
//   const handleStaffPayOSPayment = async () => {
//     if (!createdBookingId) {
//       toast.error('Vui lòng đợi hệ thống tạo đơn hàng');
//       return;
//     }

//     const userRole = user?.role || user?.Role;
//     if (!['Staff', 'Admin', 'Manager'].includes(userRole)) {
//       toast.error('Chỉ nhân viên mới có quyền tạo link thanh toán này');
//       return;
//     }

//     // Mở PayOS QR Modal cho Staff
//     setShowPayOSModal(true);
//   };

//   const handlePayment = async () => {
//     if (!createdBookingId) {
//       toast.error('Vui lòng đợi hệ thống tạo đơn hàng');
//       return;
//     }

//     // Mở PayOS QR Modal cho Customer
//     setShowPayOSModal(true);
//   };

//   // Xử lý khi thanh toán thành công từ PayOS Modal
//   const handlePaymentSuccess = (transactionId: string) => {
//     setShowPayOSModal(false);
//     setPaymentComplete(true);
    
//     // Kiểm tra xem có booking ID hợp lệ không
//     if (!createdBookingId || createdBookingId === 'undefined' || createdBookingId === 'null') {
//       toast.error('Thanh toán thành công nhưng không tìm thấy thông tin đặt vé. Vui lòng kiểm tra email hoặc liên hệ hỗ trợ.');
      
//       // Thay vì redirect về home, redirect về profile bookings để user có thể tìm booking
//       setTimeout(() => {
//         navigate('/profile/bookings', { replace: true });
//       }, 2000);
//       return;
//     }
    
//     // Show success message immediately
//     toast.success('Thanh toán thành công! Đang chuyển hướng...');

//     // 🧹 Cleanup session storage sau khi payment thành công
//     if (bookingSession?.showtimeId) {
//       console.log('🧹 [PAYMENT_SUCCESS] Cleaning up session storage');

//       const sessionKeys = [
//         `payment_state_${bookingSession.showtimeId}`,
//         `booking_session_${bookingSession.showtimeId}`,
//         `galaxy_cinema_session_${bookingSession.showtimeId}`,
//         'bookingData'
//       ];

//       sessionKeys.forEach(key => {
//         sessionStorage.removeItem(key);
//         console.log(`🗑️ [PAYMENT_SUCCESS] Removed ${key}`);
//       });

//       // 🔧 Broadcast cleanup event to other tabs
//       try {
//         const cleanupEvent = {
//           action: 'PAYMENT_SUCCESS_CLEANUP',
//           showtimeId: bookingSession.showtimeId,
//           timestamp: Date.now()
//         };
//         localStorage.setItem('galaxy_cinema_cleanup_event', JSON.stringify(cleanupEvent));
//         setTimeout(() => localStorage.removeItem('galaxy_cinema_cleanup_event'), 100);
//         console.log('📡 [PAYMENT_SUCCESS] Broadcasted cleanup event');
//       } catch (error) {
//         console.warn('⚠️ [PAYMENT_SUCCESS] Failed to broadcast cleanup:', error);
//       }
//     }

//     // Chuyển hướng đến trang thành công
//     setTimeout(() => {
//       try {
//         const targetPath = `/booking-success/${createdBookingId}`;
//         const navigationState = {
//           bookingSession: bookingSession ? {
//             ...bookingSession,
//             step: 3,
//             discount: (appliedDiscount || 0) + (appliedPointsValue || 0),
//           } : null,
//           paymentResult: {
//             success: true,
//             transactionId: transactionId,
//             bookingId: createdBookingId
//           },
//           paymentMethod: "PayOS",
//           timestamp: new Date().toISOString()
//         };
        
//         navigate(targetPath, {
//           state: navigationState,
//           replace: true // Use replace to avoid back navigation issues
//         });
        
//       } catch (error) {
//         // Fallback: navigate to profile bookings
//         toast.error('Có lỗi khi chuyển trang. Đang chuyển đến lịch sử đặt vé...');
//         navigate('/profile/bookings', { 
//           replace: true,
//           state: { 
//             message: 'Thanh toán thành công! Vui lòng kiểm tra vé trong lịch sử đặt vé.',
//             bookingId: createdBookingId
//           }
//         });
//       }
//     }, 1000); // Reduce timeout for better UX
//   };

//   // Đóng PayOS modal
//   const closePayOSModal = () => {
//     setShowPayOSModal(false);
//   };

//   // Xử lý khi người dùng nhấn nút "Back"
//   const handleBack = async () => {
//     // Nếu chưa tạo đơn hàng, quay lại trang trước đó
//     if (!createdBookingId || createdBookingId === 'undefined') {
//       navigate(-1);
//       return;
//     }

//     // Hiển thị dialog xác nhận
//     setShowConfirmDialog(true);
//   };

//   // Cập nhật hàm xử lý hủy booking
//   const handleCancelBooking = async () => {
//     if (!createdBookingId || createdBookingId === 'undefined') {
//       toast.error('Không tìm thấy thông tin đặt vé. Quay về trang chọn ghế.');
//       setShowConfirmDialog(false);
//       navigate(-1);
//       return;
//     }

//     try {
//       setIsProcessing(true);
//       toast.loading('Đang hủy đơn đặt vé...');

//       // Try different API endpoints for cancellation using PUT method
//       const cancelEndpoints = [
//         `/bookings/${createdBookingId}/cancel`,
//       ];

//       let success = false;
//       let responseData = null;

//       for (const endpoint of cancelEndpoints) {
//         try {
//           const response = await api.put(endpoint);
//           if (response.status === 200 || response.data?.success) {
//             success = true;
//             responseData = response.data;
//             break;
//           }
//         } catch (endpointError: any) {
//           // Continue to next endpoint if this one fails
//           continue;
//         }
//       }

//       toast.dismiss();

//       if (success) {
//         toast.success('Đã hủy đơn đặt vé thành công');
//       } else {
//         // Even if API fails, still allow user to go back
//         toast.success('Đã quay lại trang chọn ghế');
//       }

//       // Đóng dialog và quay về trang chọn ghế
//       setShowConfirmDialog(false);
//       navigate(-1);
//     } catch (error: any) {
//       toast.dismiss();
//       toast.success('Đã quay lại trang chọn ghế');

//       // Thông báo lỗi nhưng vẫn quay về trang chọn ghế
//       setShowConfirmDialog(false);
//       navigate(-1);
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   // Thêm hàm đóng dialog
//   const closeConfirmDialog = () => {
//     setShowConfirmDialog(false);
//   };

//   // Hàm xử lý khi hết thời gian thanh toán
//   const handlePaymentTimeout = async () => {
//     // Tự động hủy booking khi hết thời gian
//     setPaymentError('Phiên thanh toán đã hết hạn. Đang hủy đơn đặt vé...');
//     toast.error('Phiên thanh toán đã hết hạn. Đang hủy đơn đặt vé...');

//     try {
//       // Attempt to cancel the booking
//       if (createdBookingId && createdBookingId !== 'undefined') {
//         try {
//           // Try multiple cancel endpoints
//           const cancelEndpoints = [
//             `/bookings/${createdBookingId}/cancel`,
//             `/api/bookings/${createdBookingId}/cancel`
//           ];

//           let cancelSuccess = false;
//           for (const endpoint of cancelEndpoints) {
//             try {
//               await api.put(endpoint, { reason: 'timeout_expired' });
//               cancelSuccess = true;
//               break;
//             } catch (endpointError) {
//               continue;
//             }
//           }

//           if (cancelSuccess) {
//             toast.success('Đã hủy đơn đặt vé do hết hạn thanh toán');
//           } else {
//             toast.error('Đã hết hạn thanh toán. Vui lòng đặt vé lại.');
//           }
//         } catch (error) {
//           toast.error('Đã hết hạn thanh toán. Vui lòng đặt vé lại.');
//         }
//       } else {
//         toast.error('Phiên thanh toán đã hết hạn. Vui lòng đặt vé lại.');
//       }

//       // Navigate back to seat selection after 3 seconds
//       setTimeout(() => {
//         // Sử dụng navigate(-1) để quay về trang trước đó (seat selection)
//         navigate(-1);
//       }, 3000);

//     } catch (error) {
//       // Even if there's an error, still navigate back
//       setTimeout(() => {
//         toast.error('Phiên thanh toán đã hết hạn. Vui lòng đặt vé lại.');
//         // Sử dụng navigate(-1) để quay về trang trước đó (seat selection)
//         navigate(-1);
//       }, 3000);
//     }
//   };

//   // Format number with dots for display
//   const formatNumber = (value: number | string): string => {
//     if (value === '' || value === null || value === undefined) return '';
//     return value.toString();
//   };

//   // Format number for display with thousand separators
//   const formatDisplayNumber = (value: number | string): string => {
//     if (value === '' || value === null || value === undefined) return '';
    
//     // Convert to number first to handle string inputs
//     const numValue = typeof value === 'string' ? parseInt(value, 10) : value;
    
//     // Handle zero case
//     if (numValue === 0) return '0';
    
//     // Format with thousand separators (dots for Vietnamese format)
//     return numValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
//   };

//   // Parse number from formatted string
//   const parseNumber = (value: string): number | '' => {
//     const parsed = parseInt(value.replace(/\D/g, ''));
//     return isNaN(parsed) ? '' : parsed;
//   };

//   // Handle points input change with formatting
//   const handlePointsInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { value } = e.target;
//     // Remove non-numeric characters
//     const numericValue = parseNumber(value);
//     setPointsToUse(numericValue === '' ? '' : numericValue.toString());
//     setPointsError(null); // Clear any error when input changes
//   };

//   if (!bookingSession) return null;

//   const subtotal = bookingSession.totalPrice;
//   const serviceFee = 0;
//   const total = Math.max(0, subtotal + serviceFee - appliedDiscount - appliedPointsValue);

//   return (
//     <div className="bg-gray-900 min-h-screen text-white">
//       {/* Loại bỏ nút Quay lại và đồng hồ khỏi header */}
//       <div className="bg-gradient-to-b from-gray-800/80 to-transparent backdrop-blur-sm sticky top-0 z-40 pt-3 pb-2">
//         <div className="container mx-auto px-4">
//           {/* Để trống header chỉ chứa logo và menu */}
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="container mx-auto px-4 pb-12 pt-16">
//         {/* Thêm nút Quay lại và đồng hồ vào đây, phía trên tên phim */}
//         <div className="flex items-center justify-between mb-6">
//           <button
//             onClick={handleBack}
//             className="flex items-center bg-gradient-to-r from-yellow-500 to-amber-600 text-black px-4 py-2 rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105 text-base font-medium"
//           >
//             <ArrowLeftIcon className="h-5 w-5 mr-2" />
//             <span>Quay lại</span>
//           </button>
          
//           <div className="flex items-center justify-end bg-gray-800/80 px-3 py-2 rounded-full shadow-md border border-gray-700/50">
//             <ClockIcon className={`h-5 w-5 mr-1 ${timeLeft < 60 ? 'text-red-500' : 'text-yellow-400'}`} />
//             <span className={`font-mono font-medium ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-yellow-400'}`}>
//               {formatTime(timeLeft)}
//             </span>
//           </div>
//         </div>

//         {/* Tên phim */}
//         <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-[#FFD875] to-amber-400 bg-clip-text text-transparent">
//           {movieDetails?.title || "Đang tải thông tin phim..."}
//         </h1>

//         {/* Giảm padding cho thanh tiến trình */}
//         <div className="pt-2 pb-4">
//           <BookingProgress steps={steps} currentStep={2} />
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
//           {/* Left Column - Customer Info */}
//           <div className="lg:col-span-2 space-y-6">
//             {/* Customer Info Section - chỉ hiển thị khi user là Staff */}
//             {(user?.role === 'Staff' || user?.role === 'staff' || user?.Role === 'Staff') ? (
//               <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-xl border border-gray-700/50 mb-6">
//                 <h2 className="text-xl font-bold mb-5 bg-gradient-to-r from-[#FFD875] to-amber-400 bg-clip-text text-transparent">Tìm kiếm khách hàng</h2>
//                 <div className="flex gap-2 mb-4">
//                   <div className="relative flex-1">
//                     <input
//                       type="text"
//                       value={customerSearch}
//                       onChange={(e) => setCustomerSearch(e.target.value)}
//                       placeholder="Tìm SĐT (10-11 số) hoặc Email"
//                       className="w-full pl-4 pr-10 py-3 bg-slate-700/70 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD875] transition-colors text-white"
//                       onKeyPress={(e) => {
//                         if (e.key === 'Enter') {
//                           handleCustomerSearch();
//                         }
//                       }}
//                     />
//                     {customerSearch && (
//                       <button 
//                         onClick={() => setCustomerSearch('')}
//                         className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
//                       >
//                         <XCircleIcon className="w-5 h-5" />
//                       </button>
//                     )}
//                   </div>
//                   <button
//                     onClick={handleCustomerSearch}
//                     disabled={isSearchingCustomer}
//                     className="p-3 bg-[#FFD875] text-black rounded-lg transform hover:scale-105 transition-transform disabled:opacity-50 shadow-md hover:shadow-lg"
//                   >
//                     {isSearchingCustomer ? (
//                       <div className="animate-spin h-5 w-5 border-2 border-black border-t-transparent rounded-full"></div>
//                     ) : (
//                       <MagnifyingGlassIcon className="w-5 h-5" />
//                     )}
//                   </button>
//                 </div>
//                 {foundCustomer ? (
//                   <div className="p-4 bg-gradient-to-br from-green-900/30 to-green-800/20 rounded-lg border border-green-700/50 mb-4 shadow-lg">
//                     <div className="text-sm space-y-2">
//                       <div className="flex items-center gap-2">
//                         <span className="text-green-300 min-w-24">Khách hàng:</span> 
//                         <span className="font-bold text-white">{foundCustomer.Full_Name}</span>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <span className="text-green-300 min-w-24">Email:</span> 
//                         <span className="text-gray-300">{foundCustomer.Email}</span>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <span className="text-green-300 min-w-24">SĐT:</span> 
//                         <span className="text-gray-300">{foundCustomer.Phone_Number}</span>
//                       </div>
//                       {foundCustomer.Total_Points !== undefined && (
//                         <div className="flex items-center gap-2">
//                           <span className="text-green-300 min-w-24">Điểm tích lũy:</span> 
//                           <span className="text-yellow-400 font-medium">{foundCustomer.Total_Points.toLocaleString()}</span>
//                         </div>
//                       )}
//                     </div>
//                     {!customerLinked ? (
//                       <button
//                         onClick={handleLinkCustomer}
//                         disabled={isLinkingCustomer || !createdBookingId}
//                         className="mt-3 w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:opacity-50 text-white rounded-lg transition-colors font-medium"
//                       >
//                         {isLinkingCustomer ? (
//                           <div className="flex items-center justify-center gap-2">
//                             <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
//                             <span>Đang liên kết...</span>
//                           </div>
//                         ) : (
//                           'Áp dụng khách hàng'
//                         )}
//                       </button>
//                     ) : (
//                       <div className="mt-3 text-sm text-green-400 flex items-center justify-center p-2 bg-green-900/20 rounded-lg border border-green-700/30">
//                         <CheckCircleIcon className="w-4 h-4 mr-1" />
//                         Đã liên kết với đơn hàng
//                       </div>
//                     )}
//                   </div>
//                 ) : null}

//                 {/* Options luôn hiển thị */}
//                 <div className="flex flex-col gap-2">
//                   <div className="text-sm text-gray-300 font-medium">Các tùy chọn khác:</div>
//                   <div className="flex flex-wrap gap-2">
//                     <button
//                       onClick={() => setShowCreateCustomerForm(true)}
//                       className="flex items-center gap-1 text-[#FFD875] hover:text-white bg-slate-700/50 hover:bg-slate-600/50 px-4 py-2 rounded-lg transition-colors shadow-md"
//                     >
//                       <UserPlusIcon className="w-4 h-4" />
//                       Tạo tài khoản mới
//                     </button>
//                     <button
//                       onClick={() => {
//                         // Reset customer selection để làm khách vãng lai
//                         setFoundCustomer(null);
//                         setCustomerLinked(false);
//                         setCustomerSearch('');
//                         toast.success('Đã chuyển sang khách vãng lai');
//                       }}
//                       className="flex items-center gap-2 text-gray-300 hover:text-white bg-slate-700/50 hover:bg-slate-600/50 px-4 py-2 rounded-lg transition-colors shadow-md"
//                     >
//                       <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                         <circle cx="12" cy="7" r="4" />
//                         <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
//                       </svg>
//                       Khách vãng lai
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ) : null}

//             {/* Promo & Loyalty Section - chỉ hiển thị khi đã link member hoặc user đã đăng nhập (không phải staff) */}
//             {(customerLinked || (isAuthenticated && !['Staff', 'Admin', 'Manager'].includes(user?.role || user?.Role))) && (
//             <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 mb-6 shadow-xl border border-gray-700/50">
//               <h2 className="text-xl font-bold mb-5 bg-gradient-to-r from-[#FFD875] to-amber-400 bg-clip-text text-transparent">Khuyến mãi & Điểm thưởng</h2>

//               <div className="mb-6">
//                 <div className="flex flex-col space-y-3 mb-4">
//                   <label className="text-sm text-gray-300 font-medium">Nhập hoặc chọn mã khuyến mãi</label>
//                   <div className="flex space-x-2">
//                     <input
//                       type="text"
//                       className="flex-1 bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFD875] transition-colors"
//                       placeholder="Nhập mã khuyến mãi"
//                       value={manualPromoCode}
//                       onChange={(e) => setManualPromoCode(e.target.value)}
//                     />
//                     <button
//                       onClick={() => applyPromoCode(manualPromoCode)}
//                       disabled={isProcessing || !manualPromoCode.trim() || !createdBookingId}
//                       className="px-5 py-3 bg-gradient-to-r from-[#FFD875] to-amber-500 text-slate-900 font-medium rounded-lg disabled:opacity-50 hover:shadow-md transition-all duration-300 transform hover:scale-[1.02]"
//                     >
//                       {isProcessing ? (
//                         <div className="flex items-center space-x-2">
//                           <span className="animate-spin h-4 w-4 border-2 border-slate-900 border-t-transparent rounded-full"></span>
//                           <span>Áp dụng</span>
//                         </div>
//                       ) : (
//                         'Áp dụng'
//                       )}
//                     </button>
//                   </div>
//                 </div>

//                 <div className="flex flex-wrap gap-2 mb-4">
//                   {mockPromoCodes.map(promo => (
//                     <button
//                       key={promo.code}
//                       onClick={() => handleSelectPromo(promo.code)}
//                       disabled={isProcessing || !createdBookingId}
//                       className={`px-4 py-2 rounded-lg transition-all duration-300 border ${selectedPromo === promo.code
//                         ? 'bg-[#FFD875] text-slate-900 border-amber-500 shadow-md'
//                         : 'bg-slate-700/70 text-white hover:bg-slate-600 border-slate-600 hover:border-slate-500'
//                         }`}
//                     >
//                       {promo.code}
//                     </button>
//                   ))}
//                 </div>

//                 {selectedPromo && (
//                   <div className="bg-green-900/20 border border-green-600/30 text-green-400 p-4 rounded-lg flex items-start animate-fadeIn">
//                     <CheckCircleIcon className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
//                     <div>
//                       <p className="font-medium text-green-300">Mã giảm giá đã được áp dụng!</p>
//                       <p className="text-sm text-green-400 mt-1">{mockPromoCodes.find(p => p.code === selectedPromo)?.description}</p>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               <div className="pt-4 border-t border-slate-700/50">
//                 <div className="flex justify-between mb-3">
//                   <div className="text-sm font-medium text-gray-300">Điểm khả dụng:</div>
//                   <div className="font-medium text-[#FFD875]">
//                     {isLoadingPoints ? (
//                       <span className="flex items-center">
//                         <div className="animate-spin h-4 w-4 border-2 border-[#FFD875] border-t-transparent rounded-full mr-2"></div>
//                         Đang tải...
//                       </span>
//                     ) : (
//                       userLoyaltyPoints.toLocaleString()
//                     )}
//                   </div>
//                 </div>
//                 <div className="flex flex-col space-y-3">
//                   <div className="space-x-2 flex">
//                     <div className="flex-1">
//                       <input
//                         type="text"
//                         inputMode="numeric"
//                         className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFD875] transition-colors"
//                         placeholder="Nhập số điểm muốn sử dụng"
//                         value={formatNumber(pointsToUse)}
//                         onChange={handlePointsInputChange}
//                       />
//                     </div>
//                     <button
//                       onClick={handleApplyPoints}
//                       disabled={isProcessing || !pointsToUse || !createdBookingId}
//                       className={`px-5 py-3 ${isApplyingPoints
//                         ? 'bg-green-600 text-white'
//                         : 'bg-gradient-to-r from-[#FFD875] to-amber-500 text-slate-900'} 
//                         font-medium rounded-lg disabled:opacity-50 hover:shadow-md transition-all duration-300 transform hover:scale-[1.02]`}
//                     >
//                       {isApplyingPoints ? (
//                         <div className="flex items-center space-x-2">
//                           <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
//                           <span>Đang áp dụng...</span>
//                         </div>
//                       ) : (
//                         'Áp dụng'
//                       )}
//                     </button>
//                   </div>
                  
//                   {pointsToUse !== '' && (
//                     <div className="text-sm text-yellow-400 font-medium ml-2">
//                       {formatDisplayNumber(pointsToUse)} điểm
//                     </div>
//                   )}
                  
//                   {pointsError && (
//                     <p className="text-sm text-red-400 mt-1 ml-2 bg-red-900/20 border border-red-600/30 p-2 rounded">
//                       <XCircleIcon className="w-4 h-4 inline mr-1" />
//                       {pointsError}
//                     </p>
//                   )}
                  
//                   {appliedPointsValue > 0 && (
//                     <div className="mt-2 text-sm text-green-400 ml-2 bg-green-900/20 border border-green-600/30 p-2 rounded flex items-center">
//                       <CheckCircleIcon className="w-4 h-4 mr-1" />
//                       Đã áp dụng {appliedPointsValue.toLocaleString()} điểm
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//             )}

//             {/* Payment Methods */}
//             <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl p-6 shadow-xl border border-gray-700/50">
//               <h2 className="text-xl font-semibold mb-6 text-center text-white flex items-center justify-center">
//                 <span className="bg-gradient-to-r from-[#FFD875] to-amber-400 bg-clip-text text-transparent">Phương thức thanh toán</span>
//               </h2>
//               <div>
//                 {/* Hiển thị nút thanh toán chỉ khi không trong trạng thái hiển thị QR code */}
//                 {!showPayOSModal && (
//                   <div className="space-y-3">
//                     {/* Nút thanh toán PayOS cho Customer (chỉ hiển thị cho khách hàng đã đăng nhập) */}
//                     {(!user?.role && !user?.Role) || (!['Staff', 'Admin', 'Manager'].includes(user?.role || user?.Role)) ? (
//                   <button
//                     onClick={handlePayment}
//                     disabled={isProcessing || paymentComplete || !createdBookingId}
//                     className="w-full py-4 bg-gradient-to-r from-[#FFD875] to-amber-500 text-slate-900 font-medium rounded-lg disabled:opacity-50 hover:shadow-[0_0_15px_rgba(255,216,117,0.4)] transform hover:scale-[1.02] transition-all duration-300 flex justify-center items-center space-x-3"
//                   >
//                     {isProcessing ? (
//                       <>
//                         <span className="animate-spin h-5 w-5 border-4 border-slate-900 border-t-transparent rounded-full"></span>
//                         <span className="font-semibold text-lg">Đang xử lý...</span>
//                       </>
//                     ) : paymentComplete ? (
//                       <>
//                         <CheckCircleIcon className="w-6 h-6" />
//                         <span className="font-semibold text-lg">Thanh toán thành công!</span>
//                       </>
//                     ) : (
//                       <>
//                         <ShieldCheckIcon className="w-6 h-6" />
//                         <span className="font-semibold text-lg">Thanh toán với PayOS</span>
//                       </>
//                     )}
//                   </button>
//                     ) : null}

//                     {/* Nút thanh toán cho Staff */}
//                     {['Staff', 'Admin', 'Manager'].includes(user?.role || user?.Role) && (
//                       <div className="space-y-6">
//                         <div className="text-center mb-4">
//                           <h3 className="text-xl font-bold bg-gradient-to-r from-[#FFD875] to-amber-400 bg-clip-text text-transparent mb-3">Phương thức thanh toán - Nhân viên</h3>
//                           <p className="text-sm text-gray-400">Chọn phương thức thanh toán phù hợp cho khách hàng</p>
//                         </div>

//                         <div className="grid grid-cols-1 gap-4">
//                           {/* Nút thanh toán tiền mặt */}
//                           <div className="relative overflow-hidden group">
//                             <button
//                               onClick={handleCashPayment}
//                               disabled={isProcessing || paymentComplete || !createdBookingId}
//                               className="w-full p-5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold rounded-xl disabled:opacity-50 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg shadow-emerald-500/25 flex items-center justify-center space-x-4 group z-10"
//                             >
//                               {isProcessing ? (
//                                 <>
//                                   <span className="animate-spin h-6 w-6 border-3 border-white border-t-transparent rounded-full"></span>
//                                   <span className="text-lg">Đang xử lý...</span>
//                                 </>
//                               ) : paymentComplete ? (
//                                 <>
//                                   <CheckCircleIcon className="w-6 h-6" />
//                                   <span className="text-lg">Thanh toán thành công!</span>
//                                 </>
//                               ) : (
//                                 <>
//                                   <BanknotesIcon className="w-8 h-8 group-hover:scale-110 transition-transform" />
//                                   <span className="text-xl">Thanh toán tiền mặt</span>
//                                 </>
//                               )}
//                             </button>
//                             <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-emerald-600/20 blur-xl group-hover:blur-md transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
//                           </div>

//                           {/* Nút thanh toán PayOS cho Staff */}
//                           <div className="relative overflow-hidden group">
//                             <button
//                               onClick={handleStaffPayOSPayment}
//                               disabled={isProcessing || paymentComplete || !createdBookingId}
//                               className="w-full p-5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold rounded-xl disabled:opacity-50 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-4 group z-10"
//                             >
//                               {isProcessing ? (
//                                 <>
//                                   <span className="animate-spin h-6 w-6 border-3 border-white border-t-transparent rounded-full"></span>
//                                   <span className="text-lg">Đang xử lý...</span>
//                                 </>
//                               ) : paymentComplete ? (
//                                 <>
//                                   <CheckCircleIcon className="w-6 h-6" />
//                                   <span className="text-lg">Thanh toán thành công!</span>
//                                 </>
//                               ) : (
//                                 <>
//                                   <QrCodeIcon className="w-8 h-8 group-hover:scale-110 transition-transform" />
//                                   <span className="text-xl">Thanh toán PayOS (QR)</span>
//                                 </>
//                               )}
//                             </button>
//                             <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-blue-600/20 blur-xl group-hover:blur-md transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
//                           </div>
//                         </div>
                        
//                         <div className="flex items-center mt-4 justify-center">
//                           <div className="flex items-center text-xs text-amber-300 bg-amber-900/20 px-3 py-2 rounded-lg">
//                             <LockClosedIcon className="w-4 h-4 mr-2" />
//                             <span>Giao dịch được bảo mật và ghi nhật ký</span>
//                           </div>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 )}

//                 {/* Payment Error Display */}
//                 {paymentError && (
//                   <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
//                     <p className="text-red-400 text-sm">{paymentError}</p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* Right Column - Order Summary */}
//           <div className="space-y-6">
//             <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 sticky top-6 shadow-xl border border-gray-700/50">
//               <h2 className="text-xl font-bold mb-5 bg-gradient-to-r from-[#FFD875] to-amber-400 bg-clip-text text-transparent">Thông tin đơn hàng</h2>

//               {isLoadingMovie ? (
//                 <div className="animate-pulse flex space-x-4 mb-4">
//                   <div className="rounded-lg bg-gray-700 h-32 w-24"></div>
//                   <div className="flex-1 space-y-4 py-1">
//                     <div className="h-4 bg-gray-700 rounded w-3/4"></div>
//                     <div className="h-4 bg-gray-700 rounded w-1/2"></div>
//                     <div className="h-4 bg-gray-700 rounded w-5/6"></div>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="flex mb-6 bg-gray-800/50 p-3 rounded-lg border border-gray-700/50">
//                   <img
//                     src={movieDetails?.poster}
//                     alt={movieDetails?.title}
//                     className="w-24 h-32 object-cover rounded-md mr-4 shadow-md"
//                   />
//                   <div>
//                     <h3 className="font-bold text-lg text-white">{movieDetails?.title}</h3>
//                     <p className="text-gray-400 text-sm mt-1">
//                       <span className="text-[#FFD875]">Rạp:</span> {cinemaName}
//                     </p>
//                     <p className="text-gray-400 text-sm">
//                       <span className="text-[#FFD875]">Suất chiếu:</span> {showDate} • {showTime}
//                     </p>
//                     <p className="text-gray-400 text-sm mt-2">
//                       <span className="text-[#FFD875]">Ghế:</span> {bookingSession?.selectedSeats.map((seat, index) =>
//                         `${seat.row}${seat.number}` || seat.id || `Ghế ${index + 1}`
//                       ).join(', ')}
//                     </p>
//                   </div>
//                 </div>
//               )}

//               <div className="space-y-3 py-4 border-t border-b border-slate-700/50">
//                 <div className="flex justify-between">
//                   <span className="text-gray-300">Giá vé:</span>
//                   <span className="font-medium">{subtotal.toLocaleString()}đ</span>
//                 </div>
//                 {appliedDiscount > 0 && (
//                   <div className="flex justify-between text-green-400">
//                     <span>Giảm giá (mã):</span>
//                     <span>-{appliedDiscount.toLocaleString()}đ</span>
//                   </div>
//                 )}
//                 {appliedPointsValue > 0 && (
//                   <div className="flex justify-between text-green-400">
//                     <span>Giảm giá (điểm):</span>
//                     <span>-{appliedPointsValue.toLocaleString()}đ</span>
//                   </div>
//                 )}
//                 <div className="flex justify-between pt-3 mt-1 border-t border-slate-700/50 text-lg font-medium">
//                   <span>Tổng cộng:</span>
//                   <span className="text-[#FFD875] font-bold">{total.toLocaleString()}đ</span>
//                 </div>
//               </div>

//               <div className="mt-4 p-3 bg-slate-700/20 rounded-lg border border-slate-600/30">
//                 <div className="flex items-center space-x-2 text-xs text-slate-400">
//                   <LockClosedIcon className="w-4 h-4 text-[#FFD875]" />
//                   <span>Thông tin thanh toán được bảo mật tuyệt đối</span>
//                 </div>
//                 {timeLeft < 120 && (
//                   <div className="flex items-center space-x-2 text-xs text-red-400 mt-2">
//                     <ClockIcon className="w-4 h-4" />
//                     <span>Vui lòng hoàn tất thanh toán trước khi hết thời gian</span>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* PayOS QR Modal */}
//       <PayOSQRModal
//         isOpen={showPayOSModal}
//         onClose={closePayOSModal}
//         bookingId={createdBookingId || ''}
//         onPaymentSuccess={handlePaymentSuccess}
//         amount={total}
//         ticketInfo={`${bookingSession?.selectedSeats?.length || 0} ghế ${showtime?.room_name ? `- ${showtime.room_name}` : ''}`}
//         isStaff={['Staff', 'Admin', 'Manager'].includes(user?.role || user?.Role || '')}
//       />

//       {/* Confirmation Dialog */}
//       {showConfirmDialog && (
//         <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
//           <div className="bg-slate-800 p-8 rounded-2xl max-w-md w-full border-2 border-red-500/30 shadow-lg shadow-red-500/10 m-4 relative">
//             {/* Icon warning */}
//             <div className="flex justify-center mb-6">
//               <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
//                 </svg>
//               </div>
//             </div>

//             <h3 className="text-2xl font-bold mb-4 text-white text-center">Xác nhận hủy đặt vé</h3>
//             <p className="text-gray-300 mb-8 text-center leading-relaxed">
//               Bạn có chắc chắn muốn hủy đặt vé này không? 
//               <br />
//               <span className="text-red-400 font-medium">Thao tác này không thể hoàn tác.</span>
//             </p>

//             <div className="flex gap-4">
//               <button
//                 onClick={closeConfirmDialog}
//                 className="flex-1 bg-slate-600/50 hover:bg-slate-600 text-white py-3 px-6 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 border border-slate-500/50 hover:border-slate-400"
//               >
//                 Giữ lại đặt vé
//               </button>
//               <button
//                 onClick={handleCancelBooking}
//                 disabled={isProcessing}
//                 className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 px-6 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-lg shadow-red-500/25"
//               >
//                 {isProcessing ? (
//                   <div className="flex items-center justify-center">
//                     <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
//                     Đang hủy...
//                   </div>
//                 ) : (
//                   'Xác nhận hủy'
//                 )}
//               </button>
//             </div>

//             {/* Thông tin bổ sung */}
//             <div className="mt-6 p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
//               <p className="text-xs text-gray-400 text-center">
//                 💡 <span className="font-medium">Lưu ý:</span> Sau khi hủy, bạn sẽ quay về trang chọn ghế để đặt vé mới
//               </p>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Create Customer Form Modal - only rendered when needed */}
//       {showCreateCustomerForm && (
//         <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
//           <div className="bg-slate-800 p-8 rounded-2xl max-w-lg w-full border-2 border-[#FFD875]/60 shadow-lg shadow-[#FFD875]/10 m-4 max-h-[90vh] overflow-y-auto">
//             <h2 className="text-2xl font-bold mb-6 text-[#FFD875]">Tạo tài khoản khách hàng mới</h2>
//             <form onSubmit={handleCreateCustomer} className="space-y-4">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div className="md:col-span-2">
//                   <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Họ và tên <span className="text-red-400">*</span></label>
//                   <input type="text" name="name" id="name" required className="w-full px-4 py-2 bg-slate-700/70 border border-slate-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FFD875] transition-colors" />
//                 </div>

//                 <div>
//                   <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email <span className="text-red-400">*</span></label>
//                   <input type="email" name="email" id="email" required className="w-full px-4 py-2 bg-slate-700/70 border border-slate-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FFD875] transition-colors" />
//                 </div>

//                 <div>
//                   <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">Số điện thoại <span className="text-red-400">*</span></label>
//                   <input type="tel" name="phone" id="phone" required pattern="[0-9]{10,11}" placeholder="0123456789" className="w-full px-4 py-2 bg-slate-700/70 border border-slate-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FFD875] transition-colors" />
//                 </div>

//                 <div>
//                   <label htmlFor="sex" className="block text-sm font-medium text-gray-300 mb-1">Giới tính <span className="text-red-400">*</span></label>
//                   <select name="sex" id="sex" required className="w-full px-4 py-2 bg-slate-700/70 border border-slate-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FFD875] transition-colors">
//                     <option value="">Chọn giới tính</option>
//                     <option value="Male">Nam</option>
//                     <option value="Female">Nữ</option>
//                     <option value="Other">Khác</option>
//                   </select>
//                 </div>

//                 <div>
//                   <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-300 mb-1">Ngày sinh <span className="text-red-400">*</span></label>
//                   <input type="date" name="dateOfBirth" id="dateOfBirth" required className="w-full px-4 py-2 bg-slate-700/70 border border-slate-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FFD875] transition-colors" />
//                 </div>

//                 <div className="md:col-span-2">
//                   <label htmlFor="address" className="block text-sm font-medium text-gray-300 mb-1">Địa chỉ</label>
//                   <textarea name="address" id="address" rows={2} className="w-full px-4 py-2 bg-slate-700/70 border border-slate-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FFD875] transition-colors resize-none" placeholder="Nhập địa chỉ (tùy chọn)"></textarea>
//                 </div>
//               </div>

//               <div className="flex justify-end gap-4 pt-4 border-t border-slate-600">
//                 <button
//                   type="button"
//                   onClick={() => setShowCreateCustomerForm(false)}
//                   disabled={isCreatingCustomer}
//                   className="px-6 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg transition-colors disabled:opacity-50"
//                 >
//                   Hủy
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={isCreatingCustomer}
//                   className="px-6 py-2 bg-[#FFD875] hover:bg-amber-400 text-black rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
//                 >
//                   {isCreatingCustomer ? (
//                     <>
//                       <div className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full"></div>
//                       Đang tạo...
//                     </>
//                   ) : (
//                     'Tạo tài khoản'
//                   )}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default PaymentPage;
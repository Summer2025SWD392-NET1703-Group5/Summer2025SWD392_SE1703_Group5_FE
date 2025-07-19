// components/PaymentComponent.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  UserPlusIcon,
  BanknotesIcon,
  QrCodeIcon,
} from "@heroicons/react/24/outline";
import BookingProgress from "./BookingProgress";
import PayOSQRModal from "./PayOSQRModal";
import type { BookingSession } from "../types";
import { toast } from "react-hot-toast";
import api from "../config/api";
import { bookingService } from "../services/bookingService";
import { promotionService } from "../services/promotionService";
import { useCountdown } from "../hooks/useCountdown";

const mockPromoCodes = [
  { code: "CINEMA10", description: "Giảm 10,000đ", value: 10000 },
  { code: "MEGA50", description: "Giảm 50,000đ cho đơn trên 200k", value: 50000 },
  { code: "BOLTNEW", description: "Giảm 20% cho thành viên mới", value: 0.2 },
];

interface PaymentComponentProps {
  bookingSession: BookingSession;
  user: any;
  isAuthenticated: boolean;
  onBack: () => void;
  onPaymentSuccess: (bookingId: string, paymentResult: any) => void;
  onUpdateSession?: (updatedSession: BookingSession) => void;
}

const PaymentComponent: React.FC<PaymentComponentProps> = ({
  bookingSession,
  user,
  isAuthenticated,
  onBack,
  onPaymentSuccess,
  onUpdateSession,
}) => {
  // State variables
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
  const [promoCode, setPromoCode] = useState<string>("");
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [pointsToUse, setPointsToUse] = useState<string>("");
  const [appliedPointsValue, setAppliedPointsValue] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [showQRModal, setShowQRModal] = useState<boolean>(false);
  const [qrData, setQrData] = useState<any>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
  const [showCreateCustomerForm, setShowCreateCustomerForm] = useState<boolean>(false);
  const [isCreatingCustomer, setIsCreatingCustomer] = useState<boolean>(false);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [pointsError, setPointsError] = useState<string | null>(null);
  // 🔧 FIX: Sử dụng countdown service thống nhất
  const { timeLeft, isExpired, formattedTime } = useCountdown({
    bookingId: bookingSession?.bookingId || 0,
    showtimeId: bookingSession?.showtimeId || 0,
    duration: 5 * 60, // 5 phút
    onTimeout: async () => {
      console.log("⏰ Payment timeout - hủy booking và quay về chọn ghế");

      try {
        // Hủy booking qua API
        if (bookingSession?.bookingId) {
          console.log(`🗑️ Hủy booking: ${bookingSession.bookingId}`);
          await api.put(`/bookings/${bookingSession.bookingId}/cancel`, {
            reason: "payment_timeout",
          });
          console.log("✅ Đã hủy booking thành công");
        }

        // Xóa session storage
        if (bookingSession?.bookingId) {
          sessionStorage.removeItem(`booking_timestamp_${bookingSession.bookingId}`);
        }
        if (bookingSession?.showtimeId) {
          sessionStorage.removeItem(`booking_session_${bookingSession.showtimeId}`);
        }

        // Hiển thị thông báo
        toast.error("Hết thời gian thanh toán! Đang chuyển về trang chọn ghế...");

        // Chuyển về trang chọn ghế sau 2 giây
        setTimeout(() => {
          onBack(); // Gọi callback để quay về
        }, 2000);
      } catch (error) {
        console.error("❌ Lỗi khi hủy booking:", error);
        toast.error("Hết thời gian thanh toán! Đang chuyển về trang chọn ghế...");
        setTimeout(() => {
          onBack();
        }, 2000);
      }
    }
  });
  const [userPoints, setUserPoints] = useState<number>(0);
  const [isLoadingPoints, setIsLoadingPoints] = useState<boolean>(false);
  const [isApplyingPromo, setIsApplyingPromo] = useState<boolean>(false);
  const [availablePromotions, setAvailablePromotions] = useState<any[]>([]);
  const [isLoadingPromotions, setIsLoadingPromotions] = useState<boolean>(false);
  const [showPromotionDropdown, setShowPromotionDropdown] = useState<boolean>(false);

  // Member search states for staff
  const [memberSearchQuery, setMemberSearchQuery] = useState<string>("");
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [isSearchingMember, setIsSearchingMember] = useState<boolean>(false);
  const [memberSearchResults, setMemberSearchResults] = useState<any[]>([]);
  const [showCreateCustomerModal, setShowCreateCustomerModal] = useState<boolean>(false);

  // Movie and showtime data
  const [movie, setMovie] = useState<any>(null);
  const [showtime, setShowtime] = useState<any>(null);
  const [isLoadingMovie, setIsLoadingMovie] = useState<boolean>(false);
  const [isLoadingShowtime, setIsLoadingShowtime] = useState<boolean>(false);

  // 🔄 Fetch user points from API
  useEffect(() => {
    const fetchUserPoints = async () => {
      if (!user || !user.User_ID) return;

      setIsLoadingPoints(true);
      try {
        console.log(`Đang lấy thông tin điểm của người dùng ${user.User_ID}`);
        const response = await api.get(`/points/user/${user.User_ID}`);

        if (response.data && (response.data.success || response.data.data)) {
          const pointsData = response.data.data || response.data;
          const totalPoints = pointsData.total_points || 0;
          setUserPoints(totalPoints);
          console.log(`✅ Lấy thông tin điểm thành công: ${totalPoints} điểm`);
        } else {
          console.warn("❌ API trả về dữ liệu không hợp lệ:", response.data);
        }
      } catch (error) {
        console.error("❌ Lỗi khi lấy thông tin điểm:", error);
      } finally {
        setIsLoadingPoints(false);
      }
    };

    fetchUserPoints();
    fetchAvailablePromotions();
  }, [user, bookingSession.bookingId]);

  // 🔄 Restore promotion và points state từ sessionStorage khi reload
  useEffect(() => {
    if (!bookingSession.showtimeId) return;

    const restorePaymentUIState = () => {
      try {
        const paymentStateKey = `payment_state_${bookingSession.showtimeId}`;
        const savedPaymentState = sessionStorage.getItem(paymentStateKey);

        if (savedPaymentState) {
          const paymentData = JSON.parse(savedPaymentState);
          const session = paymentData.paymentBookingSession;

          console.log('🔄 [PAYMENT_UI] Restoring promotion and points state...');

          // Restore promotion state nếu có
          if (session.appliedPromotion) {
            console.log('🎫 [PAYMENT_UI] Restoring promotion:', session.appliedPromotion);
            setPromoCode(session.appliedPromotion.code || '');
            setAppliedDiscount(session.appliedPromotion.discountAmount || 0);
          }

          // Restore points state nếu có
          if (session.usedPoints && session.usedPoints > 0) {
            console.log('💎 [PAYMENT_UI] Restoring points:', session.usedPoints);
            setPointsToUse(session.usedPoints.toString());
            setAppliedPointsValue(session.usedPoints);
          }

          console.log('✅ [PAYMENT_UI] Payment UI state restored successfully');
        }
      } catch (error) {
        console.error('❌ [PAYMENT_UI] Error restoring payment UI state:', error);
      }
    };

    restorePaymentUIState();
  }, [bookingSession.showtimeId]);

  // 🎯 Lấy danh sách mã khuyến mãi phù hợp
  const fetchAvailablePromotions = async () => {
    if (!bookingSession.bookingId) {
      console.log("Chưa có booking ID, bỏ qua việc lấy mã khuyến mãi");
      return;
    }

    try {
      setIsLoadingPromotions(true);

      const promotions = await promotionService.getAvailablePromotionsForBooking(
        bookingSession.bookingId,
        bookingSession.totalAmount || 0
      );

      setAvailablePromotions(promotions);
    } catch (error) {
      console.error("Lỗi khi lấy mã khuyến mãi:", error);
      setAvailablePromotions([]);
    } finally {
      setIsLoadingPromotions(false);
    }
  };

  // 🎯 Áp dụng mã khuyến mãi từ dropdown
  const handleApplyPromotionFromDropdown = async (promotionCode: string) => {
    setPromoCode(promotionCode);
    setShowPromotionDropdown(false);

    // Tự động áp dụng mã
    if (!bookingSession.bookingId) {
      setPromoError("Không tìm thấy thông tin đơn hàng");
      return;
    }

    try {
      setIsApplyingPromo(true);
      setPromoError(null);

      const response = await bookingService.applyPromotion({
        bookingId: bookingSession.bookingId,
        promoCode: promotionCode,
      });

      if (response.success) {
        const discountAmount = response.discount_amount || 0;
        setAppliedDiscount(discountAmount);
        setPromoCode("");
        toast.success(`Đã áp dụng mã giảm giá: -${discountAmount.toLocaleString("vi-VN")}đ`);

        // Cập nhật session với thông tin promotion
        if (onUpdateSession) {
          const updatedSession = {
            ...bookingSession,
            appliedPromotion: {
              code: promotionCode,
              discountAmount: discountAmount
            }
          };
          onUpdateSession(updatedSession);
          console.log('✅ [PAYMENT] Updated session with promotion:', updatedSession.appliedPromotion);
        }

        // Refresh danh sách mã khuyến mãi
        await fetchAvailablePromotions();
      } else {
        setPromoError(response.message || "Không thể áp dụng mã giảm giá");
      }
    } catch (error: any) {
      console.error("Lỗi khi áp dụng mã giảm giá:", error);
      const errorMessage = error.response?.data?.message || error.message || "Không thể áp dụng mã giảm giá";
      setPromoError(errorMessage);
    } finally {
      setIsApplyingPromo(false);
    }
  };

  // 🎯 Xóa mã khuyến mãi đã áp dụng
  const handleRemovePromotion = async () => {
    if (!bookingSession.bookingId) {
      return;
    }

    try {
      setIsApplyingPromo(true);
      setPromoError(null);

      const response = await bookingService.removePromotion(bookingSession.bookingId);

      if (response.success) {
        setAppliedDiscount(0);
        setPromoCode("");
        toast.success("Đã xóa mã giảm giá");

        // Cập nhật session để xóa thông tin promotion
        if (onUpdateSession) {
          const updatedSession = {
            ...bookingSession
          };
          // Xóa appliedPromotion nếu có
          if ('appliedPromotion' in updatedSession) {
            delete updatedSession.appliedPromotion;
          }
          onUpdateSession(updatedSession);
          console.log('✅ [PAYMENT] Removed promotion from session');
        }

        // Refresh danh sách mã khuyến mãi
        await fetchAvailablePromotions();
      } else {
        setPromoError(response.message || "Không thể xóa mã giảm giá");
      }
    } catch (error: any) {
      console.error("Lỗi khi xóa mã giảm giá:", error);
      const errorMessage = error.response?.data?.message || error.message || "Không thể xóa mã giảm giá";
      setPromoError(errorMessage);
    } finally {
      setIsApplyingPromo(false);
    }
  };

  // 🗑️ Xóa điểm đã sử dụng
  const handleRemovePoints = async () => {
    if (!bookingSession.bookingId) {
      return;
    }

    try {
      setIsProcessing(true);
      setPointsError(null);

      const response = await bookingService.removePointsFromBooking(bookingSession.bookingId);

      if (response.success) {
        // Hoàn lại điểm cho user
        setUserPoints((prev) => prev + appliedPointsValue);
        setAppliedPointsValue(0);
        setPointsToUse("");
        toast.success("Đã xóa điểm và hoàn lại vào tài khoản");

        // Cập nhật session để xóa thông tin points
        if (onUpdateSession) {
          const updatedSession = {
            ...bookingSession
          };
          // Xóa usedPoints nếu có
          if ('usedPoints' in updatedSession) {
            delete updatedSession.usedPoints;
          }
          onUpdateSession(updatedSession);
          console.log('✅ [PAYMENT] Removed points from session');
        }
      } else {
        setPointsError(response.message || "Không thể xóa điểm");
      }
    } catch (error: any) {
      console.error("Lỗi khi xóa điểm:", error);
      const errorMessage = error.response?.data?.message || error.message || "Không thể xóa điểm";
      setPointsError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  // 🎯 Xử lý áp dụng mã giảm giá
  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) {
      setPromoError("Vui lòng nhập mã giảm giá");
      return;
    }

    if (!bookingSession.bookingId) {
      setPromoError("Không tìm thấy thông tin đơn hàng");
      return;
    }

    try {
      setIsApplyingPromo(true);
      setPromoError(null);

      const response = await bookingService.applyPromotion({
        bookingId: bookingSession.bookingId,
        promoCode: promoCode.trim(),
      });

      if (response.success) {
        setAppliedDiscount(response.discount_amount || 0);
        setPromoCode("");
        toast.success(`Đã áp dụng mã giảm giá: -${(response.discount_amount || 0).toLocaleString("vi-VN")}đ`);
      } else {
        setPromoError(response.message || "Không thể áp dụng mã giảm giá");
      }
    } catch (error: any) {
      console.error("Lỗi khi áp dụng mã giảm giá:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Có lỗi xảy ra khi áp dụng mã giảm giá";
      setPromoError(errorMessage);
    } finally {
      setIsApplyingPromo(false);
    }
  };

  // � Tìm kiếm member bằng phone
  const searchMemberByPhone = async (phone: string) => {
    try {
      setIsSearchingMember(true);
      const response = await api.get(`/member/lookup/phone/${phone}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi tìm kiếm member bằng phone:", error);
      throw error;
    } finally {
      setIsSearchingMember(false);
    }
  };

  // 🔍 Tìm kiếm member bằng email
  const searchMemberByEmail = async (email: string) => {
    try {
      setIsSearchingMember(true);
      const response = await api.get(`/member/lookup/email/${email}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi tìm kiếm member bằng email:", error);
      throw error;
    } finally {
      setIsSearchingMember(false);
    }
  };

  // 🔗 Liên kết booking với member
  const linkBookingToMember = async (memberId: number, memberData?: any) => {
    try {
      console.log("🔗 Bắt đầu liên kết booking với member:", { memberId, bookingId: bookingSession.bookingId, memberData });

      // Tìm member để lấy phone hoặc email làm memberIdentifier
      // Ưu tiên memberData được truyền vào, sau đó selectedMember, cuối cùng memberSearchResults
      let member = memberData || selectedMember;

      console.log("🔍 Debug linkBookingToMember:", {
        memberId,
        memberData,
        selectedMember,
        selectedMemberUserId: selectedMember?.User_ID,
        memberSearchResults: memberSearchResults.length,
        memberSearchResultsIds: memberSearchResults.map(m => m.User_ID)
      });

      // Nếu không có memberData và selectedMember không khớp ID, tìm trong memberSearchResults
      if (!member || member.User_ID !== memberId) {
        console.log("🔍 member không khớp, tìm trong memberSearchResults...");
        member = memberSearchResults.find((m: any) => m.User_ID === memberId);
      }

      if (!member) {
        console.error("❌ Không tìm thấy member với ID:", memberId);
        console.error("memberData:", memberData);
        console.error("selectedMember:", selectedMember);
        console.error("memberSearchResults:", memberSearchResults);
        throw new Error("Không tìm thấy thông tin member");
      }

      // Sử dụng phone hoặc email làm memberIdentifier
      const memberIdentifier = member.Phone_Number || member.Email;
      if (!memberIdentifier) {
        console.error("❌ Member không có phone hoặc email:", member);
        throw new Error("Member không có phone hoặc email");
      }

      console.log("🔗 Thông tin liên kết:", {
        bookingId: bookingSession.bookingId,
        memberIdentifier,
        memberName: member.Full_Name,
        memberId: member.User_ID
      });

      const response = await api.post("/member/link-member", {
        bookingId: parseInt(bookingSession.bookingId || "0"),
        memberIdentifier: memberIdentifier,
      });

      console.log("✅ Liên kết thành công:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Lỗi liên kết booking với member:", error);
      throw error;
    }
  };

  // 👤 Tạo tài khoản mới cho khách hàng
  const createNewCustomer = async (customerData: any) => {
    try {
      const response = await api.post("/user/staff-register", customerData);
      return response.data;
    } catch (error) {
      console.error("Lỗi tạo tài khoản khách hàng:", error);
      throw error;
    }
  };

  // 🔍 Xử lý tìm kiếm member
  const handleMemberSearch = async () => {
    if (!memberSearchQuery.trim()) {
      toast.error("Vui lòng nhập số điện thoại hoặc email");
      return;
    }

    try {
      setIsSearchingMember(true);
      let result = null;

      // Kiểm tra xem là email hay phone
      const isEmail = memberSearchQuery.includes("@");

      console.log("🔍 Tìm kiếm member:", {
        query: memberSearchQuery.trim(),
        isEmail,
        endpoint: isEmail
          ? `/member/lookup/email/${memberSearchQuery.trim()}`
          : `/member/lookup/phone/${memberSearchQuery.trim()}`,
      });

      if (isEmail) {
        result = await searchMemberByEmail(memberSearchQuery.trim());
      } else {
        result = await searchMemberByPhone(memberSearchQuery.trim());
      }

      console.log("📋 Kết quả API:", result);

      // Kiểm tra nếu có data (API trả về trực tiếp hoặc trong result.data)
      const memberData = result?.data || result;

      if (memberData && memberData.User_ID) {
        console.log("✅ Tìm thấy member:", memberData);
        toast.success("Tìm thấy thành viên!");

        // Lấy điểm của member tìm được để hiển thị
        try {
          console.log("🎯 Lấy điểm cho User_ID:", memberData.User_ID);
          const pointsResponse = await api.get(`/points/user/${memberData.User_ID}`);
          console.log("💰 Kết quả điểm:", pointsResponse.data);

          if (pointsResponse.data && pointsResponse.data.success) {
            // Lưu điểm vào member data để hiển thị
            memberData.points = pointsResponse.data.data.total_points || 0;
          } else {
            memberData.points = 0;
          }
        } catch (error) {
          console.error("❌ Lỗi khi lấy điểm của member:", error);
          memberData.points = 0;
        }

        // Hiển thị kết quả tìm kiếm để user có thể chọn
        console.log("📝 Set member search results:", [memberData]);
        setMemberSearchResults([memberData]);
        // Không reset selectedMember nếu đã có member được chọn từ việc tạo mới
        // setSelectedMember(null); // Reset selected member để hiển thị kết quả tìm kiếm
      } else {
        console.log("❌ Không tìm thấy member hoặc kết quả không hợp lệ:", result);
        setMemberSearchResults([]);
        setSelectedMember(null);
        toast.error("Không tìm thấy thành viên");
      }
    } catch (error: any) {
      console.error("❌ Lỗi tìm kiếm member:", error);
      console.error("Chi tiết lỗi:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      setMemberSearchResults([]);
      const errorMessage = error?.response?.data?.message || "Không tìm thấy thành viên";
      toast.error(errorMessage);
    } finally {
      setIsSearchingMember(false);
    }
  };

  // �🔄 Restore additional data từ sessionStorage nếu cần
  const getAdditionalData = () => {
    const pathParts = window.location.pathname.split("/");
    const bookingId = pathParts[pathParts.length - 1];

    if (bookingId) {
      const sessionKey = `booking_session_${bookingId}`;
      const savedData = sessionStorage.getItem(sessionKey);

      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          return {
            movie: parsedData.movie,
            theater: parsedData.theater,
            showtime: parsedData.showtime,
          };
        } catch (error) {
          console.error("❌ Failed to parse saved booking session:", error);
        }
      }
    }

    return {
      movie: null,
      theater: null,
      showtime: null,
    };
  };

  // 🎬 Load dữ liệu movie từ API hoặc sessionStorage
  useEffect(() => {
    const loadMovieData = async () => {
      // 🔧 Thử lấy movieId từ nhiều nguồn khác nhau
      let movieId = bookingSession?.movieId;

      if (!movieId) {
        // Thử lấy từ sessionStorage với các key khác nhau
        const possibleKeys = [
          `booking_session_${bookingSession?.bookingId}`,
          `booking_session_${bookingSession?.showtimeId}`,
          "has_pending_booking",
        ];

        for (const key of possibleKeys) {
          try {
            const savedData = sessionStorage.getItem(key);
            if (savedData) {
              const parsedData = JSON.parse(savedData);
              if (parsedData.movieId) {
                movieId = parsedData.movieId;
                console.log(`🔍 Found movieId from ${key}: ${movieId}`);
                break;
              }
            }
          } catch (error) {
            console.warn(`⚠️ Error parsing ${key}:`, error);
          }
        }
      }

      if (!movieId) {
        console.log("⚠️ Không tìm thấy movie ID từ bất kỳ nguồn nào");
        setMovie(null);
        setIsLoadingMovie(false);
        return;
      }

      // 1. Thử lấy từ sessionStorage trước
      const sessionKey = `booking_session_${bookingSession?.bookingId}`;
      const savedData = sessionStorage.getItem(sessionKey);

      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          console.log("📋 Dữ liệu từ sessionStorage:", parsedData);

          if (parsedData.movie) {
            setMovie(parsedData.movie);
            setIsLoadingMovie(false);
            return;
          }
        } catch (error) {
          console.error("❌ Lỗi parse sessionStorage:", error);
        }
      }

      // 2. Nếu không có, fetch từ API
      try {
        setIsLoadingMovie(true);
        console.log(`🎬 Đang tải thông tin phim ID: ${movieId}`);

        const response = await api.get(`/movies/${movieId}`);
        console.log("✅ Thông tin phim từ API:", response.data);
        setMovie(response.data);
      } catch (error) {
        console.error("❌ Lỗi fetch movie:", error);
        setMovie(null);
      } finally {
        setIsLoadingMovie(false);
      }
    };

    loadMovieData();
  }, [bookingSession?.movieId, bookingSession?.bookingId, bookingSession?.showtimeId]);

  // 🎭 Load dữ liệu showtime từ API
  useEffect(() => {
    const loadShowtimeData = async () => {
      // 🔧 Thử lấy showtimeId từ nhiều nguồn khác nhau
      let showtimeId = bookingSession?.showtimeId;

      if (!showtimeId) {
        // Thử lấy từ URL
        const urlParts = window.location.pathname.split("/");
        const urlShowtimeId = urlParts[urlParts.length - 1];
        if (urlShowtimeId && !isNaN(Number(urlShowtimeId))) {
          showtimeId = urlShowtimeId;
          console.log(`🔍 Found showtimeId from URL: ${showtimeId}`);
        }
      }

      if (!showtimeId) {
        // Thử lấy từ sessionStorage với các key khác nhau
        const possibleKeys = [
          `booking_session_${bookingSession?.bookingId}`,
          `booking_session_${bookingSession?.showtimeId}`,
          "has_pending_booking",
        ];

        for (const key of possibleKeys) {
          try {
            const savedData = sessionStorage.getItem(key);
            if (savedData) {
              const parsedData = JSON.parse(savedData);
              if (parsedData.showtimeId) {
                showtimeId = parsedData.showtimeId;
                console.log(`🔍 Found showtimeId from ${key}: ${showtimeId}`);
                break;
              }
            }
          } catch (error) {
            console.warn(`⚠️ Error parsing ${key}:`, error);
          }
        }
      }

      if (!showtimeId) {
        console.log("⚠️ Không tìm thấy showtime ID từ bất kỳ nguồn nào");
        setShowtime(null);
        setIsLoadingShowtime(false);
        return;
      }

      try {
        setIsLoadingShowtime(true);
        console.log(`🎭 Đang tải thông tin showtime ID: ${showtimeId}`);

        const response = await api.get(`/showtimes/${showtimeId}`);
        console.log("✅ Thông tin showtime từ API:", response.data);
        setShowtime(response.data);
      } catch (error) {
        console.error("❌ Lỗi fetch showtime:", error);
        setShowtime(null);
      } finally {
        setIsLoadingShowtime(false);
      }
    };

    loadShowtimeData();
  }, [bookingSession?.showtimeId, bookingSession?.bookingId]);

  // 🔄 Restore user data từ localStorage và auto-select payment method
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        console.log("👤 User data loaded:", parsedUser);
      } catch (error) {
        console.error("❌ Failed to parse user data:", error);
      }
    }

    // Auto-select PayOS cho user thường (không phải staff)
    const userRole = user?.role || user?.Role;
    if (!["Staff", "Admin", "Manager"].includes(userRole)) {
      setSelectedPaymentMethod("payos");
      console.log("🔄 Auto-selected PayOS for regular user");
    }
  }, [user]);

  // ✅ Countdown timer đã được thay thế bằng useCountdown hook

  // 🔧 Xử lý selectedSeats - có thể là string hoặc array
  const processedSeats = React.useMemo(() => {
    console.log("🔧 [PAYMENT] Processing seats:", {
      selectedSeats: bookingSession.selectedSeats,
      type: typeof bookingSession.selectedSeats,
      isArray: Array.isArray(bookingSession.selectedSeats),
    });

    if (!bookingSession.selectedSeats) return [];

    // Nếu là string, convert thành array
    if (typeof bookingSession.selectedSeats === "string") {
      const seatLabels = bookingSession.selectedSeats
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const processedArray = seatLabels.map((seatLabel) => {
        const row = seatLabel.charAt(0);
        const number = parseInt(seatLabel.slice(1));
        return {
          id: seatLabel,
          row: row,
          number: number,
          type: "standard" as const,
          price: 90000,
          status: "selected" as const,
        };
      });
      console.log("✅ [PAYMENT] Converted string to seats:", processedArray);
      return processedArray;
    }

    // Nếu đã là array, return as is
    if (Array.isArray(bookingSession.selectedSeats)) {
      console.log("✅ [PAYMENT] Using existing array:", bookingSession.selectedSeats);
      return bookingSession.selectedSeats;
    }

    console.log("⚠️ [PAYMENT] Unknown selectedSeats format, returning empty array");
    return [];
  }, [bookingSession.selectedSeats]);

  // 💰 Tính toán giá tiền với fallback
  const subtotal =
    bookingSession.totalPrice || processedSeats?.reduce((sum, seat) => sum + (seat.price || 90000), 0) || 0;
  const serviceFee = 0;
  const total = Math.max(0, subtotal + serviceFee - appliedDiscount - appliedPointsValue);

  // 📊 Booking steps for progress
  const bookingSteps = [
    { id: 1, name: "seats", title: "Chọn ghế", completed: true, active: false },
    { id: 2, name: "payment", title: "Thanh toán", completed: false, active: true },
    { id: 3, name: "confirmation", title: "Xác nhận", completed: false, active: false },
  ];

  // 🔄 Payment handlers
  const handleCashPayment = async () => {
    if (!bookingSession.bookingId) {
      toast.error("Vui lòng đợi hệ thống tạo đơn hàng");
      return;
    }

    const userRole = user?.role || user?.Role;
    if (!["Staff", "Admin", "Manager"].includes(userRole)) {
      toast.error("Chỉ nhân viên mới có quyền thanh toán tiền mặt");
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      toast.loading("Đang xử lý thanh toán tiền mặt...");

      // Gọi API thanh toán tiền mặt
      const response = await api.put(`/bookings/${bookingSession.bookingId}/payment`);

      toast.dismiss();

      // Kiểm tra kết quả thanh toán
      if (response.data && response.data.success) {
        toast.success("Thanh toán tiền mặt thành công!");

        // Xóa session timer khi thanh toán thành công
        if (bookingSession && processedSeats) {
          const seatIds = processedSeats.map((seat) => seat.id || seat.seatId || "unknown").join("_");
          const sessionKey = `payment_timer_${bookingSession.showtimeId}_${seatIds}`;
          sessionStorage.removeItem(sessionKey);
          console.log(`Thanh toán thành công - đã xóa session timer: ${sessionKey}`);
        }

        // Gọi callback success
        setTimeout(() => {
          onPaymentSuccess(bookingSession.bookingId, {
            success: true,
            transactionId: `CASH-${bookingSession.bookingId}-${Date.now()}`,
            method: "Cash",
          });
        }, 1500);
      } else {
        throw new Error(response.data?.message || "Thanh toán tiền mặt thất bại");
      }
    } catch (error: any) {
      toast.dismiss();
      const errorMessage =
        error.response?.data?.message || error.message || "Thanh toán tiền mặt thất bại. Vui lòng thử lại.";
      toast.error(errorMessage);
      setPaymentError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayOSPayment = async () => {
    if (!bookingSession.bookingId) {
      toast.error("Vui lòng đợi hệ thống tạo đơn hàng");
      return;
    }

    // Mở PayOS QR Modal
    setShowQRModal(true);
  };

  const handlePayment = async () => {
    const userRole = user?.role || user?.Role;
    const isStaff = ["Staff", "Admin", "Manager"].includes(userRole);

    // Nếu là user thường, tự động mở QR Code
    if (!isStaff) {
      await handlePayOSPayment();
      return;
    }

    if (selectedPaymentMethod === "cash") {
      await handleCashPayment();
    } else if (selectedPaymentMethod === "payos") {
      await handlePayOSPayment();
    } else {
      toast.error("Vui lòng chọn phương thức thanh toán");
    }
  };

  // Xử lý áp dụng điểm
  const handleApplyPoints = async () => {
    if (!pointsToUse.trim() || isProcessing) {
      return;
    }

    // Kiểm tra xem có member được chọn không (cho staff)
    const isStaff = ["Staff", "Admin", "Manager"].includes(user?.role || user?.Role);
    if (isStaff && !selectedMember) {
      setPointsError("Vui lòng chọn khách hàng trước khi sử dụng điểm");
      return;
    }

    setIsProcessing(true);
    setPointsError(null);

    try {
      const points = parseInt(pointsToUse);

      // Kiểm tra hợp lệ
      if (isNaN(points) || points <= 0) {
        setPointsError("Số điểm không hợp lệ");
        return;
      }

      // Kiểm tra đủ điểm
      if (points > userPoints) {
        const memberName = selectedMember ? selectedMember.Full_Name : "Bạn";
        setPointsError(`${memberName} chỉ có ${userPoints.toLocaleString("vi-VN")} điểm`);
        return;
      }

      // Giới hạn điểm sử dụng không vượt quá tổng tiền
      const maxPoints = subtotal - appliedDiscount; // 1 điểm = 1đ
      if (points > maxPoints) {
        setPointsError(`Điểm sử dụng tối đa: ${maxPoints.toLocaleString("vi-VN")}`);
        return;
      }

      // Tính giá trị điểm (1 điểm = 1 đồng)
      const pointsValue = points;

      if (bookingSession.bookingId) {
        try {
          // Chuyển đổi bookingId thành số (nếu là chuỗi)
          const numericBookingId = Number(bookingSession.bookingId);

          if (isNaN(numericBookingId)) {
            setPointsError(`ID đơn hàng không hợp lệ: ${bookingSession.bookingId}`);
            return;
          }

          // Kiểm tra lại tham số points
          if (!Number.isInteger(points) || points <= 0) {
            setPointsError("Số điểm phải là số nguyên dương");
            return;
          }

          console.log("Gửi request với tham số:", {
            bookingId: numericBookingId,
            pointsToUse: points,
          });

          // Gọi API với endpoint và tham số đúng
          const response = await api.post(`/points/booking/${numericBookingId}/apply-discount`, {
            pointsToUse: points,
          });

          console.log("Kết quả từ API:", response.data);

          if (response.data && response.data.success) {
            setAppliedPointsValue(pointsValue);
            setUserPoints((prev) => Math.max(0, prev - points)); // Cập nhật lại số điểm sau khi sử dụng
            setPointsToUse("");
            toast.success(
              `Đã sử dụng ${points.toLocaleString("vi-VN")} điểm để giảm giá ${pointsValue.toLocaleString("vi-VN")}đ`
            );

            // Cập nhật session với thông tin points
            if (onUpdateSession) {
              const updatedSession = {
                ...bookingSession,
                usedPoints: points
              };
              onUpdateSession(updatedSession);
              console.log('✅ [PAYMENT] Updated session with points:', points);
            }
          } else {
            throw new Error(response.data?.message || "Không thể áp dụng điểm");
          }
        } catch (error: any) {
          console.error("Lỗi khi áp dụng điểm:", error);
          const errorMessage = error.response?.data?.message || error.message || "Không thể áp dụng điểm";
          setPointsError(errorMessage);

          // Log chi tiết lỗi để debug
          if (error.response?.data) {
            console.error("Chi tiết lỗi:", error.response.data);
            if (error.response.data.error) {
              setPointsError(`${errorMessage}: ${error.response.data.error}`);
            }
          }
        }
      } else {
        // Nếu chưa có booking ID, chỉ cập nhật giao diện
        setAppliedPointsValue(pointsValue);
        setUserPoints((prev) => Math.max(0, prev - points)); // Cập nhật lại số điểm sau khi sử dụng
        setPointsToUse("");
        toast.success(
          `Đã sử dụng ${points.toLocaleString("vi-VN")} điểm để giảm giá ${pointsValue.toLocaleString("vi-VN")}đ`
        );
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (!bookingSession) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header with back button */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 mt-20 lg:mt-24 pt-4">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Quay lại</span>
            </button>

            {/* Timer */}
            <div className="flex items-center gap-2 text-[#FFD875]">
              <ClockIcon className="w-5 h-5" />
              <span className="font-mono text-lg">{isExpired ? "00:00" : formattedTime}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Progress */}
      <div className="container mx-auto px-4 py-6">
        <BookingProgress steps={bookingSteps} currentStep={2} />
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Payment Methods */}
          <div className="lg:col-span-2 space-y-6">
            {/* Member Search - Chỉ hiển thị cho Staff/Admin/Manager */}
            {["Staff", "Admin", "Manager"].includes(user?.role || user?.Role) && (
              <div className="bg-gradient-to-br from-slate-800/95 via-slate-900/95 to-slate-800/95 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/30 shadow-2xl">
                <div className="flex items-center gap-3 mb-8">
                  <MagnifyingGlassIcon className="w-6 h-6 text-[#FFD875]" />
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Tìm kiếm khách hàng
                  </h3>
                </div>

                <div className="space-y-4">
                  {/* Search Input */}
                  <div className="relative">
                    <input
                      type="text"
                      value={memberSearchQuery}
                      onChange={(e) => setMemberSearchQuery(e.target.value)}
                      placeholder="Nhập số điện thoại (10-11 số) hoặc email..."
                      className="w-full pl-4 pr-32 py-4 bg-slate-700/50 border border-slate-600/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#FFD875]/50 focus:border-[#FFD875]/50 text-white placeholder-gray-400 transition-all duration-300"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleMemberSearch();
                        }
                      }}
                    />
                    <button
                      onClick={handleMemberSearch}
                      disabled={!memberSearchQuery.trim() || isSearchingMember}
                      className="absolute right-2 top-2 bottom-2 px-6 bg-[#FFD875] hover:bg-[#FFA500] text-slate-900 font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
                    >
                      {isSearchingMember ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                          <span className="hidden sm:inline">Đang tìm...</span>
                        </>
                      ) : (
                        <span>Tìm kiếm</span>
                      )}
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      onClick={() => setShowCreateCustomerModal(true)}
                      className="group px-6 py-4 bg-[#FFD875] hover:bg-[#FFA500] text-slate-900 font-semibold rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Tạo tài khoản mới</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedMember(null);
                        setMemberSearchResults([]);
                        setMemberSearchQuery("");
                      }}
                      className="group px-6 py-4 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span>Khách vãng lai</span>
                    </button>
                  </div>

                  {/* Member Search Results */}
                  {memberSearchResults.length > 0 && !selectedMember && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-[#FFD875] rounded-full"></div>
                        <h4 className="text-white font-semibold">Kết quả tìm kiếm</h4>
                      </div>
                      <div className="space-y-3">
                        {memberSearchResults.map((member, index) => (
                          <div
                            key={index}
                            className="group bg-gradient-to-r from-slate-700/60 to-slate-800/60 border border-slate-600/50 rounded-2xl p-5 hover:border-[#FFD875]/50 transition-all duration-300"
                          >
                            <div className="flex items-center justify-between">
                              <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-[#FFD875] rounded-full flex items-center justify-center">
                                    <span className="text-slate-900 font-bold text-sm">
                                      {member.Full_Name?.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="text-white font-semibold text-lg">{member.Full_Name}</p>
                                    <div className="flex items-center gap-4 text-sm">
                                      <span className="text-gray-300 flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                          />
                                        </svg>
                                        {member.Phone_Number}
                                      </span>
                                      <span className="text-gray-300 flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                                          />
                                        </svg>
                                        {member.Email}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                {member.points !== undefined && (
                                  <div className="flex items-center gap-2 mt-2">
                                    <div className="px-3 py-1 bg-[#FFD875]/20 border border-[#FFD875]/30 rounded-full">
                                      <span className="text-[#FFD875] text-sm font-medium">
                                        ⭐ {member.points.toLocaleString("vi-VN")} điểm
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={async () => {
                                  setSelectedMember(member);
                                  setUserPoints(member.points || 0);

                                  // Tự động liên kết booking với member
                                  try {
                                    await linkBookingToMember(member.User_ID, member);
                                    toast.success("Đã liên kết đơn hàng với thành viên!");
                                  } catch (error) {
                                    console.error("Lỗi liên kết booking:", error);
                                    toast.error("Không thể liên kết đơn hàng");
                                  }
                                }}
                                className="px-6 py-3 bg-[#FFD875] hover:bg-[#FFA500] text-slate-900 font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                              >
                                Chọn khách hàng
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Selected Member Display */}
                  {selectedMember && (
                    <div className="bg-[#FFD875]/10 border border-[#FFD875]/30 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#FFD875] rounded-full flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-slate-900"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-white font-medium">
                                {selectedMember.Full_Name || selectedMember.Email}
                              </span>
                              <div className="px-2 py-1 bg-[#FFD875]/20 rounded-md">
                                <span className="text-[#FFD875] text-xs font-medium">Đã chọn</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                              <span className="text-gray-400 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                  />
                                </svg>
                                {selectedMember.Phone_Number}
                              </span>
                              <span className="text-gray-400 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                                  />
                                </svg>
                                {selectedMember.Email}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedMember(null);
                            setUserPoints(0);
                          }}
                          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                          title="Bỏ chọn khách hàng"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Promo Code Section - Hiển thị cho user thường hoặc staff có member được chọn */}
            {(!["Staff", "Admin", "Manager"].includes(user?.role || user?.Role) || selectedMember) && (
              <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/30 shadow-2xl">
                <div className="flex items-center gap-3 mb-8">
                  <svg className="w-6 h-6 text-[#FFD875]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Mã giảm giá
                  </h3>
                </div>

                <div className="flex gap-3 mb-4">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="Nhập mã giảm giá"
                    className="flex-1 px-4 py-3 bg-slate-700/70 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD875] text-white placeholder-gray-400"
                  />
                  <button
                    onClick={handleApplyPromoCode}
                    disabled={!promoCode.trim() || isProcessing || isApplyingPromo}
                    className="px-6 py-3 bg-[#FFD875] hover:bg-[#FFA500] text-slate-900 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isApplyingPromo ? "Đang xử lý..." : "Áp dụng"}
                  </button>
                </div>

                {/* Dropdown mã khuyến mãi phù hợp */}
                {(() => {
                  const shouldShow = availablePromotions.length > 0 && !appliedDiscount;
                  return shouldShow;
                })() && (
                  <div className="mb-4">
                    <button
                      onClick={() => setShowPromotionDropdown(!showPromotionDropdown)}
                      className="flex items-center gap-2 text-[#FFD875] hover:text-[#FFA500] text-sm font-medium transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      Mã khuyến mãi phù hợp ({availablePromotions.length})
                    </button>

                    {showPromotionDropdown && (
                      <div className="mt-3 bg-slate-700/50 border border-slate-600 rounded-lg max-h-48 overflow-y-auto">
                        {availablePromotions.map((promo) => (
                          <div
                            key={promo.id}
                            className="p-3 border-b border-slate-600/50 last:border-b-0 hover:bg-slate-600/30 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-mono text-[#FFD875] font-medium">{promo.code}</span>
                                  {promo.isCurrentlyApplied && (
                                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                                      Đang áp dụng
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-300 mb-1">{promo.title}</div>
                                <div className="text-xs text-[#FFD875]">
                                  Giảm {promo.discountAmount?.toLocaleString("vi-VN")}đ
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {promo.isCurrentlyApplied ? (
                                  <button
                                    onClick={handleRemovePromotion}
                                    disabled={isApplyingPromo}
                                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                                    title="Xóa mã"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                      />
                                    </svg>
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleApplyPromotionFromDropdown(promo.code)}
                                    disabled={isApplyingPromo}
                                    className="px-3 py-1 bg-[#FFD875] hover:bg-[#FFA500] text-slate-900 text-xs font-medium rounded transition-colors disabled:opacity-50"
                                  >
                                    {isApplyingPromo ? "..." : "Áp dụng"}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {promoError && <div className="text-red-400 text-sm mb-4">{promoError}</div>}

                {appliedDiscount > 0 && (
                  <div className="bg-[#FFD875]/20 border border-[#FFD875]/50 rounded-lg p-3 text-[#FFD875] text-sm flex items-center justify-between">
                    <span>✅ Đã áp dụng mã giảm giá: -{appliedDiscount.toLocaleString("vi-VN")}đ</span>
                    <button
                      onClick={handleRemovePromotion}
                      disabled={isApplyingPromo}
                      className="p-1 text-[#FFD875] hover:text-[#FFA500] transition-colors disabled:opacity-50"
                      title="Xóa mã giảm giá"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Points Section - Hiển thị cho user thường hoặc staff có member được chọn */}
            {(!["Staff", "Admin", "Manager"].includes(user?.role || user?.Role) || selectedMember) && (
              <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/30 shadow-2xl">
                <div className="flex items-center gap-3 mb-8">
                  <svg className="w-6 h-6 text-[#FFD875]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Sử dụng điểm tích lũy
                  </h3>
                </div>

                <div className="mb-6">
                  <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#FFD875] rounded-lg flex items-center justify-center">
                          <span className="text-slate-900 font-bold text-sm">⭐</span>
                        </div>
                        <div>
                          <p className="text-white font-semibold">
                            {selectedMember ? `Điểm của ${selectedMember.Full_Name}` : "Điểm hiện có"}
                          </p>
                          <p className="text-[#FFD875] text-sm">1 điểm = 1 VND</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {isLoadingPoints ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin h-4 w-4 border-2 border-[#FFD875] border-t-transparent rounded-full"></div>
                            <span className="text-gray-400">Đang tải...</span>
                          </div>
                        ) : (
                          <div className="text-2xl font-bold text-[#FFD875]">
                            {userPoints.toLocaleString("vi-VN") || 0}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative mb-6">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={pointsToUse}
                    onChange={(e) => {
                      // Chỉ cho phép nhập số
                      const value = e.target.value.replace(/[^0-9]/g, "");
                      setPointsToUse(value);
                    }}
                    placeholder="Nhập số điểm muốn sử dụng..."
                    className="w-full pl-12 pr-32 py-4 bg-slate-700/50 border border-slate-600/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#FFD875]/50 focus:border-[#FFD875]/50 text-white placeholder-gray-400 transition-all duration-300"
                  />
                  <button
                    onClick={handleApplyPoints}
                    disabled={!pointsToUse.trim() || isProcessing}
                    className="absolute right-2 top-2 bottom-2 px-6 bg-[#FFD875] hover:bg-[#FFA500] text-slate-900 font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        <span className="hidden sm:inline">Đang xử lý...</span>
                      </>
                    ) : (
                      <span>Sử dụng điểm</span>
                    )}
                  </button>
                </div>

                {pointsError && <div className="text-red-400 text-sm mb-4">{pointsError}</div>}

                {appliedPointsValue > 0 && (
                  <div className="bg-[#FFD875]/20 border border-[#FFD875]/50 rounded-lg p-3 text-[#FFD875] text-sm flex items-center justify-between">
                    <span>
                      ✅ Đã sử dụng {appliedPointsValue.toLocaleString("vi-VN")} điểm: -
                      {appliedPointsValue.toLocaleString("vi-VN")}đ
                    </span>
                    <button
                      onClick={handleRemovePoints}
                      disabled={isProcessing}
                      className="ml-3 p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                      title="Xóa điểm đã sử dụng"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-700/30 shadow-2xl sticky top-24">
              <h3 className="text-xl font-bold text-[#FFD875] mb-6">Thông tin đơn hàng</h3>

              {/* Movie Info - Compact */}
              <div className="mb-6 pb-4 border-b border-slate-700/50">
                {isLoadingMovie ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin h-5 w-5 border-2 border-[#FFD875] border-t-transparent rounded-full"></div>
                    <span className="ml-2 text-gray-400 text-sm">Đang tải...</span>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    {/* Movie Poster */}
                    {(movie?.poster_url || movie?.poster || movie?.image || movie?.Image || movie?.Poster_URL) && (
                      <div className="flex-shrink-0">
                        <img
                          src={movie.poster_url || movie.poster || movie.image || movie.Image || movie.Poster_URL}
                          alt={movie?.title || movie?.Title || "Movie Poster"}
                          className="w-12 h-16 object-cover rounded-lg border border-slate-600/50"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                    )}

                    {/* Movie Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-white text-base truncate">
                        {movie?.title || movie?.Title || "Đang tải..."}
                      </h4>
                      <p className="text-gray-400 text-sm mt-1">Galaxy Cinema</p>
                      <div className="flex items-center gap-2 mt-2 text-sm">
                        <span className="text-[#FFD875]">{showtime?.Show_Date || "Đang tải..."}</span>
                        <span className="text-gray-500">•</span>
                        <span className="text-[#FFD875]">{showtime?.Start_Time || "Đang tải..."}</span>
                      </div>
                      {showtime?.Room_Name && <p className="text-gray-400 text-sm mt-1">{showtime.Room_Name}</p>}
                    </div>
                  </div>
                )}
              </div>

              {/* Seats - Compact */}
              <div className="mb-6 pb-4 border-b border-slate-700/50">
                <h4 className="font-semibold text-white text-sm mb-3">Ghế đã chọn</h4>
                <div className="space-y-2">
                  {processedSeats?.map((seat, index) => (
                    <div key={index} className="flex justify-between items-center py-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                            seat.type === "vip" ? "bg-[#FFD875] text-slate-900" : "bg-slate-700 text-white"
                          }`}
                        >
                          {seat.row}
                          {seat.number}
                        </div>
                        <span className="text-white text-sm">{seat.type === "vip" ? "VIP" : "Thường"}</span>
                      </div>
                      <span className="text-[#FFD875] font-semibold text-sm">
                        {(seat.price || 90000).toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Methods - Chỉ hiển thị cho Staff/Admin/Manager */}
              {["Staff", "Admin", "Manager"].includes(user?.role || user?.Role) && (
                <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/30 shadow-2xl">
                  <div className="flex items-center gap-3 mb-8">
                    <LockClosedIcon className="w-6 h-6 text-[#FFD875]" />
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                      Phương thức thanh toán
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* PayOS */}
                    <div
                      className={`group p-6 rounded-2xl border cursor-pointer transition-all duration-300 transform hover:-translate-y-1 ${
                        selectedPaymentMethod === "payos"
                          ? "border-[#FFD875]/50 bg-[#FFD875]/10 shadow-lg"
                          : "border-slate-600/50 hover:border-slate-500/50 bg-slate-700/30"
                      }`}
                      onClick={() => setSelectedPaymentMethod("payos")}
                    >
                      <div className="flex flex-col items-center text-center space-y-3">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                            selectedPaymentMethod === "payos"
                              ? "bg-[#FFD875] shadow-lg"
                              : "bg-[#FFD875]/70 group-hover:bg-[#FFD875]"
                          }`}
                        >
                          <QrCodeIcon
                            className={`w-6 h-6 ${
                              selectedPaymentMethod === "payos"
                                ? "text-slate-900"
                                : "text-slate-700 group-hover:text-slate-900"
                            }`}
                          />
                        </div>
                        <div>
                          <h5 className="font-semibold text-white">PayOS QR</h5>
                          <p className="text-sm text-gray-400">Quét mã QR để thanh toán</p>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border-2 transition-all duration-300 ${
                            selectedPaymentMethod === "payos" ? "border-[#FFD875] bg-[#FFD875]" : "border-gray-400"
                          }`}
                        >
                          {selectedPaymentMethod === "payos" && (
                            <svg className="w-3 h-3 text-white m-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Cash Payment */}
                    <div
                      className={`group p-6 rounded-2xl border cursor-pointer transition-all duration-300 transform hover:-translate-y-1 ${
                        selectedPaymentMethod === "cash"
                          ? "border-[#FFD875]/50 bg-[#FFD875]/10 shadow-lg"
                          : "border-slate-600/50 hover:border-slate-500/50 bg-slate-700/30"
                      }`}
                      onClick={() => setSelectedPaymentMethod("cash")}
                    >
                      <div className="flex flex-col items-center text-center space-y-3">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                            selectedPaymentMethod === "cash"
                              ? "bg-slate-700 shadow-lg"
                              : "bg-slate-700/70 group-hover:bg-slate-700"
                          }`}
                        >
                          <BanknotesIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h5 className="font-semibold text-white">Tiền mặt</h5>
                          <p className="text-sm text-gray-400">Thanh toán tại quầy</p>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border-2 transition-all duration-300 ${
                            selectedPaymentMethod === "cash" ? "border-[#FFD875] bg-[#FFD875]" : "border-gray-400"
                          }`}
                        >
                          {selectedPaymentMethod === "cash" && (
                            <svg className="w-3 h-3 text-white m-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Price Breakdown - Compact */}
              <div className="space-y-2 text-sm mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Tạm tính</span>
                  <span className="text-white">{subtotal.toLocaleString("vi-VN")}đ</span>
                </div>

                {appliedDiscount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Giảm giá</span>
                    <span className="text-[#FFD875]">-{appliedDiscount.toLocaleString("vi-VN")}đ</span>
                  </div>
                )}

                {appliedPointsValue > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Điểm tích lũy</span>
                    <span className="text-[#FFD875]">-{appliedPointsValue.toLocaleString("vi-VN")}đ</span>
                  </div>
                )}

                <div className="border-t border-slate-600/50 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-semibold">Tổng cộng</span>
                    <span className="text-xl font-bold text-[#FFD875]">{total.toLocaleString("vi-VN")}đ</span>
                  </div>
                </div>
              </div>

              {/* Payment Button */}
              <div className="relative">
                <button
                  onClick={handlePayment}
                  disabled={
                    (["Staff", "Admin", "Manager"].includes(user?.role || user?.Role) && !selectedPaymentMethod) ||
                    isProcessing ||
                    isExpired
                  }
                  className="group w-full bg-[#FFD875] hover:bg-[#FFA500] text-slate-900 font-bold py-6 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed shadow-xl relative overflow-hidden"
                >
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                  <div className="relative flex items-center justify-center gap-3">
                    {isProcessing ? (
                      <>
                        <div className="animate-spin h-6 w-6 border-3 border-white border-t-transparent rounded-full"></div>
                        <span className="text-lg">Đang xử lý thanh toán...</span>
                      </>
                    ) : isExpired ? (
                      <>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="text-lg">Hết thời gian thanh toán</span>
                      </>
                    ) : !["Staff", "Admin", "Manager"].includes(user?.role || user?.Role) ? (
                      <>
                        <div className="w-8 h-8 bg-slate-900/20 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 16h4m-4 0v4m-4-4h4m-4 0v4"
                            />
                          </svg>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold">Thanh toán PayOS</div>
                          <div className="text-lg opacity-90">{total.toLocaleString("vi-VN")}đ</div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-8 h-8 bg-slate-900/20 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold">Xác nhận thanh toán</div>
                          <div className="text-lg opacity-90">{total.toLocaleString("vi-VN")}đ</div>
                        </div>
                      </>
                    )}
                  </div>
                </button>
              </div>

              {paymentError && (
                <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-red-400 font-medium">{paymentError}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PayOS QR Modal */}
      {showQRModal && (
        <PayOSQRModal
          isOpen={showQRModal}
          onClose={() => setShowQRModal(false)}
          bookingId={bookingSession.bookingId || ""}
          onPaymentSuccess={(transactionId) => {
            setShowQRModal(false);
            onPaymentSuccess(bookingSession.bookingId || "", {
              success: true,
              transactionId,
              method: "PayOS",
            });
          }}
          amount={total}
          ticketInfo={processedSeats?.map((seat) => `${seat.row}${seat.number}`).join(", ")}
          skipConfirmation={true}
          isStaff={["Staff", "Admin", "Manager"].includes(user?.role || user?.Role)}
        />
      )}

      {/* Create Customer Modal */}
      {showCreateCustomerModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-6">Tạo tài khoản khách hàng</h3>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const customerData = {
                  Full_Name: formData.get("fullName"),
                  Email: formData.get("email"),
                  Phone_Number: formData.get("phone"),
                  Address: formData.get("address"),
                  Date_Of_Birth: formData.get("dateOfBirth"),
                  Sex: formData.get("gender"),
                };

                try {
                  const result = await createNewCustomer(customerData);
                  console.log("🔍 Create customer result:", result);

                  // Handle both old and new response formats
                  const isSuccess = result.success || (result.user && result.message);
                  const userData = result.data || result.user;

                  console.log("🔍 Debug response parsing:", {
                    isSuccess,
                    userData,
                    userIdFromData: userData?.User_ID,
                    resultSuccess: result.success,
                    resultData: result.data,
                    resultUser: result.user
                  });

                  if (isSuccess && userData) {
                    toast.success("Tạo tài khoản thành công!");
                    setShowCreateCustomerModal(false);

                    // Tự động chọn customer vừa tạo
                    setSelectedMember(userData);
                    console.log("🎯 Đã set selectedMember:", userData);

                    // Tự động liên kết booking với member mới tạo
                    try {
                      console.log("🔗 Chuẩn bị gọi linkBookingToMember với User_ID:", userData.User_ID);
                      await linkBookingToMember(userData.User_ID, userData);
                      toast.success("Đã liên kết đơn hàng với khách hàng mới!");
                    } catch (linkError) {
                      console.error("Lỗi liên kết booking:", linkError);
                      toast.error("Tạo tài khoản thành công nhưng không thể liên kết đơn hàng");
                    }
                  } else {
                    console.error("❌ Tạo tài khoản thất bại:", { isSuccess, userData, result });
                    toast.error(result.message || "Có lỗi xảy ra");
                  }
                } catch (error: any) {
                  console.error("❌ Create customer error:", error);
                  toast.error(error?.response?.data?.message || "Có lỗi xảy ra khi tạo tài khoản");
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Họ và tên *</label>
                <input
                  type="text"
                  name="fullName"
                  required
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FFD875]"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FFD875]"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Số điện thoại *</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FFD875]"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Địa chỉ</label>
                <input
                  type="text"
                  name="address"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FFD875]"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Ngày sinh</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FFD875]"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Giới tính</label>
                <select
                  name="gender"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FFD875]"
                >
                  <option value="">Chọn giới tính</option>
                  <option value="Male">Nam</option>
                  <option value="Female">Nữ</option>
                  <option value="Other">Khác</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateCustomerModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#FFD875] hover:bg-[#FFA500] text-slate-900 font-medium rounded-lg transition-colors"
                >
                  Tạo tài khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentComponent;
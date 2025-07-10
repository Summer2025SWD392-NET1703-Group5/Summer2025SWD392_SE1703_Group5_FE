import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlayIcon,
  StarIcon,
  ClockIcon,
  CalendarDaysIcon,
  MapPinIcon,
  TicketIcon,
  FilmIcon,
  TrophyIcon,
  GiftIcon,
  UsersIcon,
  ChevronRightIcon,
  BuildingOfficeIcon,
  SparklesIcon,
  XMarkIcon,
  FireIcon,
} from "@heroicons/react/24/outline";
import {
  PlayIcon as PlayIconSolid,
  StarIcon as StarIconSolid,
} from "@heroicons/react/24/solid";
import { movieService } from "../services/movieService";
import { promotionService } from "../services/promotionService";
import { cinemaService } from "../services/cinemaService";
import type { Cinema } from "../types/cinema";
import FullScreenLoader from "../components/FullScreenLoader";
import { toast } from "react-hot-toast";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import PromoDetailsModal from "../components/PromoDetailsModal";
import type { Promotion } from "../types/promotion";
import { DiscountBadge } from "../components/promotion/DiscountBadge";

// Định nghĩa kiểu dữ liệu cho Movie trong HomePage
interface HomePageMovie {
  id: number;
  title: string;
  poster: string;
  backdrop?: string;
  description: string;
  rating: number;
  duration: string;
  genre: string;
  releaseDate: string;
  trailer?: string;
  ageRating?: string;
  isHot?: boolean;
  isNew?: boolean;
}

interface HomePagePromotion {
  id: number;
  title: string;
  description: string;
  discount: string;
  image: string;
  endDate: string;
  originalData?: any; // Store original API data for proper conversion
}

// Định nghĩa kiểu dữ liệu cho phim từ API
interface ApiMovie {
  Movie_ID?: number;
  Movie_Name?: string;
  Poster_URL?: string;
  id?: number | string;
  title?: string;
  poster?: string;
  movie_id?: number | string;
  movie_name?: string;
  poster_url?: string;
}

// Định nghĩa kiểu dữ liệu cho suất chiếu từ API
interface ApiShowtimeData {
  Showtime_ID?: number;
  Movie_ID?: number;
  Start_Time?: string;
  End_Time?: string;
  Room_Name?: string;
  Show_Date?: string;
  Capacity_Available?: number;
  Capacity_Total?: number;
  Price?: number;
  showtime_id?: number;
  movie_id?: number;
  start_time?: string;
  end_time?: string;
  room_name?: string;
  capacity_available?: number;
  capacity_total?: number;
  Room?: {
    Cinema_Room_ID?: number;
    Room_Name?: string;
    Room_Type?: string;
  };
}

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  // States
  const [nowShowingMovies, setNowShowingMovies] = useState<HomePageMovie[]>([]);
  const [comingSoonMovies, setComingSoonMovies] = useState<HomePageMovie[]>([]);
  const [promotions, setPromotions] = useState<HomePagePromotion[]>([]);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroMovieIndex, setHeroMovieIndex] = useState(0);

  // Carousel states
  const [nowShowingCurrentIndex, setNowShowingCurrentIndex] = useState(0);
  const [comingSoonCurrentIndex, setComingSoonCurrentIndex] = useState(0);
  const [currentPromotionIndex, setCurrentPromotionIndex] = useState(0);

  // Promotion modal states
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false);

  // Quick booking states
  const [selectedCinemaId, setSelectedCinemaId] = useState("");
  const [selectedMovieId, setSelectedMovieId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedShowtimeId, setSelectedShowtimeId] = useState("");

  // Dynamic data for quick booking
  const [availableMovies, setAvailableMovies] = useState<{ id: string; title: string; poster: string }[]>([]);
  const [availableShowtimes, setAvailableShowtimes] = useState<
    {
      id: string;
      startTime: string;
      endTime: string;
      roomName: string;
      roomType: string;
      availableSeats: number;
      totalSeats: number;
      price: number;
      seatStatus: string;
      isSoldOut: boolean;
    }[]
  >([]);

  // Modal booking states
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingMovie, setBookingMovie] = useState<HomePageMovie | null>(null);
  const [modalSelectedCinemaId, setModalSelectedCinemaId] = useState("");
  const [modalSelectedDate, setModalSelectedDate] = useState("");
  const [modalSelectedShowtimeId, setModalSelectedShowtimeId] = useState("");
  const [modalAvailableShowtimes, setModalAvailableShowtimes] = useState<
    {
      id: string;
      startTime: string;
      endTime: string;
      roomName: string;
      roomType: string;
      availableSeats: number;
      totalSeats: number;
      price: number;
      seatStatus: string;
      isSoldOut: boolean;
    }[]
  >([]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [nowShowingResponse, comingSoonResponse, availablePromotions, activeCinemas] = await Promise.all([
          movieService.getNowShowingMovies(),
          movieService.getComingSoonMovies(),
          promotionService.getAvailablePromotions(),
          cinemaService.getAllCinemas(),
        ]);

        // Chuyển đổi dữ liệu phim sang định dạng HomePageMovie
        const mapToHomePageMovie = (movie: any): HomePageMovie => {
          // Calculate rating using the same logic as MovieDetail with proper validation
          let calculatedRating = 4.5; // Default rating
          
          // First, try to use pre-calculated rating from Rating_Summary (for MovieDetail compatibility)
          if (movie.Rating_Summary?.Average_Rating !== undefined && 
              movie.Rating_Summary?.Average_Rating !== null &&
              !isNaN(Number(movie.Rating_Summary.Average_Rating)) &&
              Number(movie.Rating_Summary.Average_Rating) > 0) {
            const ratingValue = Number(movie.Rating_Summary.Average_Rating);
            calculatedRating = ratingValue;
          }
          // For HomePage API, calculate from MovieRatings array (the main logic for HomePage)
          else if ((movie.MovieRatings && Array.isArray(movie.MovieRatings) && movie.MovieRatings.length > 0) ||
                   (movie.movieRatings && Array.isArray(movie.movieRatings) && movie.movieRatings.length > 0)) {
            // Use movieRatings (camelCase) if available, otherwise use MovieRatings
            const ratingsArray = movie.movieRatings || movie.MovieRatings;
            
            const validRatings = ratingsArray.filter((rating: any) => {
              // Check both Rating (original) and rating (camelCase) fields
              const ratingValue = rating.Rating || rating.rating;
              return ratingValue !== null && 
                     ratingValue !== undefined && 
                     !isNaN(Number(ratingValue)) && 
                     Number(ratingValue) > 0;
            });
            
            if (validRatings.length > 0) {
              const totalRating = validRatings.reduce((sum: number, rating: any) => {
                const ratingValue = rating.Rating || rating.rating;
                return sum + Number(ratingValue);
              }, 0);
              const averageRating = totalRating / validRatings.length;
              
              if (!isNaN(averageRating) && averageRating > 0) {
                calculatedRating = Number(averageRating.toFixed(1));
              }
            }
          }
          // If not available, try other rating fields (fallback)
          else if ((movie.rating !== undefined && movie.rating !== null) || (movie.ratingAverage !== undefined && movie.ratingAverage !== null)) {
            const ratingValue = Number(movie.rating || movie.ratingAverage);
            if (!isNaN(ratingValue) && ratingValue > 0) {
              calculatedRating = ratingValue;
            }
          }
          
          // Final validation to ensure we always have a valid number
          if (isNaN(calculatedRating) || calculatedRating <= 0) {
            calculatedRating = 4.5;
          }

          const fullDescription = movie.synopsis || movie.description || movie.Synopsis || movie.Description || "";
          const truncatedDescription = fullDescription.length > 150 
            ? fullDescription.substring(0, 150) + "..."
            : fullDescription;

          return {
            id: typeof movie.id === "string" ? parseInt(movie.id) : movie.id || movie.Movie_ID || 0,
            title: movie.title || movie.Movie_Name || "",
            poster: movie.poster || movie.Poster_URL || "",
            backdrop: movie.backdrop || movie.Poster_URL || "",
            description: truncatedDescription,
            rating: calculatedRating,
            duration: typeof movie.duration === "number" ? `${movie.duration} phút` : movie.Duration ? `${movie.Duration} phút` : "120 phút",
            genre: movie.genre || movie.Genre || "",
            releaseDate: movie.releaseDate || movie.Release_Date || new Date().toISOString(),
            trailer: movie.trailerLink || movie.Trailer_Link || "",
            ageRating: movie.ageRating || movie.Rating || "P",
            // Use Premiere_Date to determine if movie is new (premiered within last 14 days)
            isNew: new Date(movie.premiereDate || movie.Premiere_Date || movie.releaseDate || movie.Release_Date || Date.now()).getTime() > Date.now() - 14 * 24 * 60 * 60 * 1000,
          };
        };

        const nowShowingMoviesData = nowShowingResponse.map(mapToHomePageMovie);
        const comingSoonMoviesData = comingSoonResponse.map(mapToHomePageMovie);

        setNowShowingMovies(nowShowingMoviesData.slice(0, 12));
        setComingSoonMovies(comingSoonMoviesData.slice(0, 8));

        // Chuyển đổi dữ liệu khuyến mãi - preserve service data
        const formattedPromotions = availablePromotions.map((promo: any) => ({
          id: promo.id || promo.Promotion_ID || 0,
          title: promo.title || promo.Title || promo.Promotion_Name || "",
          description: promo.description || promo.Description || "",
          discount: promo.discount || promo.Discount_Description || (promo.Discount_Value ? `${promo.Discount_Type === 'Percentage' ? promo.Discount_Value + '%' : new Intl.NumberFormat('vi-VN').format(promo.Discount_Value) + ' VND'}` : "10%"),
          image: promo.image || promo.Image_URL || "/promotion-placeholder.jpg",
          endDate: promo.endDate || promo.End_Date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          // Store original API data for proper conversion
          originalData: promo,
        }));

        setPromotions(formattedPromotions.slice(0, 6));
        setCinemas(activeCinemas);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu trang chủ:", error);
        toast.error("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Auto change hero movie
  useEffect(() => {
    if (nowShowingMovies.length > 0) {
      const interval = setInterval(() => {
        setHeroMovieIndex((prev) => (prev + 1) % Math.min(nowShowingMovies.length, 5));
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [nowShowingMovies]);

  // Quick booking handlers
  const handleCinemaChange = async (cinemaId: string) => {
    setSelectedCinemaId(cinemaId);
    setSelectedMovieId("");
    setSelectedDate("");
    setSelectedShowtimeId("");
    setAvailableMovies([]);
    setAvailableShowtimes([]);

    if (cinemaId) {
      try {
        // Sử dụng cinemaService.getMoviesByCinema thay vì getMoviesByCinema từ showtimeService
        const movies = await cinemaService.getMoviesByCinema(cinemaId);
        console.log("Phim đang chiếu tại rạp:", movies);

        // Chuyển đổi định dạng dữ liệu từ API sang định dạng cần thiết
        const formattedMovies = movies.map((movie: ApiMovie) => ({
          id: String(movie.Movie_ID || movie.id || movie.movie_id || ""),
          title: String(movie.Movie_Name || movie.title || movie.movie_name || "Phim không tên"),
          poster: String(movie.Poster_URL || movie.poster || movie.poster_url || ""),
        }));

        setAvailableMovies(formattedMovies);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách phim:", error);
        toast.error("Không thể tải danh sách phim. Vui lòng thử lại sau.");
      }
    }
  };

  const handleMovieChange = async (movieId: string) => {
    setSelectedMovieId(movieId);
    setSelectedDate("");
    setSelectedShowtimeId("");
    setAvailableShowtimes([]);

    if (movieId && selectedCinemaId) {
      try {
        // Gọi API lấy danh sách ngày chiếu
        const response = await cinemaService.getCinemaShowtimesByDate(selectedCinemaId, "");

        // Lọc các suất chiếu của phim đã chọn
        const filteredShowtimes = response.filter(
          (showtime: ApiShowtimeData) => String(showtime.Movie_ID) === movieId || String(showtime.movie_id) === movieId
        );

        // Trích xuất các ngày chiếu duy nhất
        const uniqueDates = new Set<string>();
        filteredShowtimes.forEach((showtime: ApiShowtimeData) => {
          const showDate =
            showtime.Show_Date ||
            (showtime.Start_Time ? new Date(showtime.Start_Time).toISOString().split("T")[0] : null) ||
            (showtime.start_time ? new Date(showtime.start_time).toISOString().split("T")[0] : null);
          if (showDate) uniqueDates.add(showDate);
        });

        // Log available dates for debugging
        console.log("Ngày chiếu có sẵn:", Array.from(uniqueDates));
      } catch (error) {
        console.error("Lỗi khi lấy ngày chiếu:", error);
        toast.error("Không thể tải lịch chiếu. Vui lòng thử lại sau.");
      }
    }
  };

  const handleDateChange = async (date: string) => {
    setSelectedDate(date);
    setSelectedShowtimeId("");
    setAvailableShowtimes([]);

    if (date && selectedMovieId && selectedCinemaId) {
      try {
        // Gọi API lấy suất chiếu theo rạp, ngày
        const allShowtimes = await cinemaService.getCinemaShowtimesByDate(selectedCinemaId, date);

        // Lọc các suất chiếu của phim đã chọn
        const filteredShowtimes = allShowtimes.filter(
          (showtime: ApiShowtimeData) =>
            String(showtime.Movie_ID) === selectedMovieId || String(showtime.movie_id) === selectedMovieId
        );

        // Lấy thông tin ghế cho mỗi suất chiếu
        const showtimesWithSeatsInfo = await Promise.all(
          filteredShowtimes.map(async (showtime: ApiShowtimeData) => {
            try {
              const showtimeId = showtime.Showtime_ID || showtime.showtime_id;

              if (showtimeId === undefined) return null;

              // Gọi API lấy thông tin ghế
              const seatsInfoResponse = await cinemaService.getSeatInfoByShowtime(showtimeId);

              const startTime = showtime.Start_Time || showtime.start_time || "";
              const endTime = showtime.End_Time || showtime.end_time || "";

              // Format thời gian một cách an toàn
              let formattedStartTime = "";
              let formattedEndTime = "";

              try {
                // Kiểm tra nếu startTime có dạng HH:MM thì không cần parse với new Date()
                if (startTime && startTime.includes(":") && startTime.length <= 8) {
                  formattedStartTime = startTime;
                } else if (startTime) {
                  const startDate = new Date(startTime);
                  // Kiểm tra xem date có hợp lệ không
                  if (!isNaN(startDate.getTime())) {
                    formattedStartTime = startDate.toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    });
                  }
                }

                if (endTime && endTime.includes(":") && endTime.length <= 8) {
                  formattedEndTime = endTime;
                } else if (endTime) {
                  const endDate = new Date(endTime);
                  if (!isNaN(endDate.getTime())) {
                    formattedEndTime = endDate.toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    });
                  }
                }
              } catch (error) {
                console.error("Lỗi khi format thời gian:", error);
                // Fallback to raw values in case of error
                formattedStartTime = typeof startTime === "string" ? startTime.substring(0, 5) : "";
                formattedEndTime = typeof endTime === "string" ? endTime.substring(0, 5) : "";
              }

              // Nếu có thông tin ghế, sử dụng thông tin đó
              if (seatsInfoResponse && seatsInfoResponse.summary) {
                const { total, available, booked } = seatsInfoResponse.summary;

                return {
                  id: String(showtimeId || ""),
                  startTime: formattedStartTime,
                  endTime: formattedEndTime,
                  roomName: String(showtime.Room_Name || showtime.room_name || "Phòng chiếu"),
                  roomType: showtime.Room?.Room_Type || "2D",
                  availableSeats: available || 0,
                  totalSeats: total || 0,
                  price: Number(showtime.Price || 0),
                  seatStatus: `${booked || 0}/${total || 0}`,
                  isSoldOut: available === 0,
                };
              }

              // Nếu không có thông tin ghế, sử dụng thông tin từ showtime
              return {
                id: String(showtimeId || ""),
                startTime: formattedStartTime,
                endTime: formattedEndTime,
                roomName: String(showtime.Room_Name || showtime.room_name || "Phòng chiếu"),
                roomType: showtime.Room?.Room_Type || "2D",
                availableSeats: Number(showtime.Capacity_Available || showtime.capacity_available || 0),
                totalSeats: Number(showtime.Capacity_Total || showtime.capacity_total || 0),
                price: Number(showtime.Price || 0),
                seatStatus: `${
                  Number(showtime.Capacity_Total || 0) - Number(showtime.Capacity_Available || 0)
                }/${Number(showtime.Capacity_Total || 0)}`,
                isSoldOut: Number(showtime.Capacity_Available || 0) === 0,
              };
            } catch (error) {
              console.error(`Lỗi khi lấy thông tin ghế cho suất chiếu:`, error);
              return null;
            }
          })
        );

        // Lọc bỏ các suất chiếu null (lỗi)
        const validShowtimes = showtimesWithSeatsInfo.filter((showtime) => showtime !== null) as {
          id: string;
          startTime: string;
          endTime: string;
          roomName: string;
          roomType: string;
          availableSeats: number;
          totalSeats: number;
          price: number;
          seatStatus: string;
          isSoldOut: boolean;
        }[];

        // Sắp xếp suất chiếu theo thời gian
        validShowtimes.sort((a, b) => {
          if (!a || !b || !a.startTime || !b.startTime) return 0;
          const timeA = a.startTime.split(":").map(Number);
          const timeB = b.startTime.split(":").map(Number);
          return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1]);
        });

        // Nếu không có suất chiếu hợp lệ
        if (validShowtimes.length === 0) {
          console.log("Không có suất chiếu hợp lệ");
          setAvailableShowtimes([]);
        } else {
          setAvailableShowtimes(validShowtimes);
        }
      } catch (error) {
        console.error("Lỗi khi lấy suất chiếu:", error);
        toast.error("Không thể tải suất chiếu. Vui lòng thử lại sau.");
        setAvailableShowtimes([]);
      }
    }
  };

  const handleShowtimeChange = (showtimeId: string) => {
    setSelectedShowtimeId(showtimeId);
  };

  const handleQuickBooking = () => {
    if (selectedShowtimeId) {
      navigate(`/booking/${selectedShowtimeId}`);
    }
  };

  // Carousel navigation
  const handleNowShowingNext = () => {
    setNowShowingCurrentIndex((prev) => (prev + 4 >= nowShowingMovies.length ? 0 : prev + 4));
  };

  const handleNowShowingPrev = () => {
    setNowShowingCurrentIndex((prev) => (prev === 0 ? Math.max(0, nowShowingMovies.length - 4) : prev - 4));
  };

  const handleComingSoonNext = () => {
    setComingSoonCurrentIndex((prev) => (prev + 4 >= comingSoonMovies.length ? 0 : prev + 4));
  };

  const handleComingSoonPrev = () => {
    setComingSoonCurrentIndex((prev) => (prev === 0 ? Math.max(0, comingSoonMovies.length - 4) : prev - 4));
  };

  // Promotion carousel navigation
  const handlePromotionNext = () => {
    setCurrentPromotionIndex((prev) => (prev + 1 >= promotions.length ? 0 : prev + 1));
  };

  const handlePromotionPrev = () => {
    setCurrentPromotionIndex((prev) => (prev === 0 ? promotions.length - 1 : prev - 1));
  };

  // Calculate promotion card width for responsive design
  const getPromotionCardWidth = () => {
    return 320; // Base width for desktop, CSS will handle responsive
  };

  // Convert HomePagePromotion to Promotion for modal
  const convertToPromotion = (homePromotion: HomePagePromotion): Promotion => {
    // Use the same helper function to get discount type and value
    const discountInfo = getDiscountTypeAndValue(homePromotion);
    const originalData = homePromotion.originalData;

    // Calculate prices based on discount type and value
    const originalPrice = 100000; // Default values
    let discountedPrice = originalPrice;
    let discountPercentage = 0;

    if (discountInfo.type === 'Percentage') {
      discountPercentage = discountInfo.value;
      discountedPrice = originalPrice * (1 - discountPercentage / 100);
    } else { // Fixed discount
      discountedPrice = Math.max(0, originalPrice - discountInfo.value);
      discountPercentage = Math.round((discountInfo.value / originalPrice) * 100);
    }

    return {
      id: homePromotion.id,
      title: homePromotion.title,
      description: homePromotion.description,
      image: homePromotion.image,
      originalPrice,
      discountedPrice,
      discountPercentage,
      validUntil: homePromotion.endDate,
      category: "special" as const,
      badge: "HOT" as const,
      isActive: true,
      terms: ["Áp dụng theo điều kiện và điều khoản của rạp"],
      code: `PROMO${homePromotion.id}`,
      usageLimit: originalData?.Usage_Limit || originalData?.usageLimit || 100,
      currentUsage: originalData?.Current_Usage || originalData?.currentUsage || 10,
      remainingUsage: originalData?.Usage_Remaining || originalData?.remainingUsage || 90,
      discountType: discountInfo.type,
      discountValue: discountInfo.value,
      minimumPurchase: originalData?.Minimum_Purchase || originalData?.minimumPurchase || 50000,
      isUsed: false,
    };
  };

  // Promotion modal handlers
  const handlePromotionClick = (promotion: HomePagePromotion) => {
    const convertedPromotion = convertToPromotion(promotion);
    setSelectedPromotion(convertedPromotion);
    setIsPromotionModalOpen(true);
  };

  const handleClosePromotionModal = () => {
    setIsPromotionModalOpen(false);
    setSelectedPromotion(null);
  };

  // Apply promotion code (for PromoDetailsModal)
  const handleApplyPromotionCode = async (code: string) => {
    try {
      toast.success(`Đã áp dụng mã khuyến mãi: ${code}`);
      // Here you can add logic to apply the promotion code
      // For now, we'll just show a success message
    } catch (error) {
      console.error("Lỗi khi áp dụng mã khuyến mãi:", error);
      toast.error("Không thể áp dụng mã khuyến mãi");
    }
  };

  // Modal booking handlers
  const handleOpenBookingModal = (movie: HomePageMovie) => {
    setBookingMovie(movie);
    setIsBookingModalOpen(true);
    setModalSelectedCinemaId("");
    setModalSelectedDate("");
    setModalSelectedShowtimeId("");
    setModalAvailableShowtimes([]);
  };

  const handleCloseBookingModal = () => {
    setIsBookingModalOpen(false);
    setBookingMovie(null);
    setModalSelectedCinemaId("");
    setModalSelectedDate("");
    setModalSelectedShowtimeId("");
    setModalAvailableShowtimes([]);
  };

  // Escape key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isBookingModalOpen) {
        handleCloseBookingModal();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isBookingModalOpen]);

  const handleModalCinemaChange = async (cinemaId: string) => {
    setModalSelectedCinemaId(cinemaId);
    setModalSelectedDate("");
    setModalSelectedShowtimeId("");
    setModalAvailableShowtimes([]);

    if (cinemaId && bookingMovie) {
      try {
        // Gọi API lấy danh sách ngày chiếu
        const response = await cinemaService.getCinemaShowtimesByDate(cinemaId, "");

        // Lọc các suất chiếu của phim đã chọn
        const filteredShowtimes = response.filter(
          (showtime: ApiShowtimeData) =>
            String(showtime.Movie_ID) === bookingMovie.id.toString() ||
            String(showtime.movie_id) === bookingMovie.id.toString()
        );

        // Log available dates for debugging
        const uniqueDates = new Set<string>();
        filteredShowtimes.forEach((showtime: ApiShowtimeData) => {
          const showDate =
            showtime.Show_Date ||
            (showtime.Start_Time ? new Date(showtime.Start_Time).toISOString().split("T")[0] : null) ||
            (showtime.start_time ? new Date(showtime.start_time).toISOString().split("T")[0] : null);
          if (showDate) uniqueDates.add(showDate);
        });

        console.log("Ngày chiếu có sẵn cho modal:", Array.from(uniqueDates));
      } catch (error) {
        console.error("Lỗi khi lấy ngày chiếu cho modal:", error);
        toast.error("Không thể tải lịch chiếu. Vui lòng thử lại sau.");
      }
    }
  };

  const handleModalDateChange = async (date: string) => {
    setModalSelectedDate(date);
    setModalSelectedShowtimeId("");
    setModalAvailableShowtimes([]);

    if (date && bookingMovie && modalSelectedCinemaId) {
      try {
        // Gọi API lấy suất chiếu theo rạp, ngày
        const allShowtimes = await cinemaService.getCinemaShowtimesByDate(modalSelectedCinemaId, date);

        // Lọc các suất chiếu của phim đã chọn
        const filteredShowtimes = allShowtimes.filter(
          (showtime: ApiShowtimeData) =>
            String(showtime.Movie_ID) === bookingMovie.id.toString() ||
            String(showtime.movie_id) === bookingMovie.id.toString()
        );

        // Lấy thông tin ghế cho mỗi suất chiếu
        const showtimesWithSeatsInfo = await Promise.all(
          filteredShowtimes.map(async (showtime: ApiShowtimeData) => {
            try {
              const showtimeId = showtime.Showtime_ID || showtime.showtime_id;

              if (showtimeId === undefined) return null;

              // Gọi API lấy thông tin ghế
              const seatsInfoResponse = await cinemaService.getSeatInfoByShowtime(showtimeId);

              const startTime = showtime.Start_Time || showtime.start_time || "";
              const endTime = showtime.End_Time || showtime.end_time || "";

              // Format thời gian một cách an toàn
              let formattedStartTime = "";
              let formattedEndTime = "";

              try {
                // Kiểm tra nếu startTime có dạng HH:MM thì không cần parse với new Date()
                if (startTime && startTime.includes(":") && startTime.length <= 8) {
                  formattedStartTime = startTime;
                } else if (startTime) {
                  const startDate = new Date(startTime);
                  // Kiểm tra xem date có hợp lệ không
                  if (!isNaN(startDate.getTime())) {
                    formattedStartTime = startDate.toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    });
                  }
                }

                if (endTime && endTime.includes(":") && endTime.length <= 8) {
                  formattedEndTime = endTime;
                } else if (endTime) {
                  const endDate = new Date(endTime);
                  if (!isNaN(endDate.getTime())) {
                    formattedEndTime = endDate.toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    });
                  }
                }
              } catch (error) {
                console.error("Lỗi khi format thời gian modal:", error);
                // Fallback to raw values in case of error
                formattedStartTime = typeof startTime === "string" ? startTime.substring(0, 5) : "";
                formattedEndTime = typeof endTime === "string" ? endTime.substring(0, 5) : "";
              }

              // Nếu có thông tin ghế, sử dụng thông tin đó
              if (seatsInfoResponse && seatsInfoResponse.summary) {
                const { total, available, booked } = seatsInfoResponse.summary;

                return {
                  id: String(showtimeId || ""),
                  startTime: formattedStartTime,
                  endTime: formattedEndTime,
                  roomName: String(showtime.Room_Name || showtime.room_name || "Phòng chiếu"),
                  roomType: showtime.Room?.Room_Type || "2D",
                  availableSeats: available || 0,
                  totalSeats: total || 0,
                  price: Number(showtime.Price || 0),
                  seatStatus: `${booked || 0}/${total || 0}`,
                  isSoldOut: available === 0,
                };
              }

              // Nếu không có thông tin ghế, sử dụng thông tin từ showtime
              return {
                id: String(showtimeId || ""),
                startTime: formattedStartTime,
                endTime: formattedEndTime,
                roomName: String(showtime.Room_Name || showtime.room_name || "Phòng chiếu"),
                roomType: showtime.Room?.Room_Type || "2D",
                availableSeats: Number(showtime.Capacity_Available || showtime.capacity_available || 0),
                totalSeats: Number(showtime.Capacity_Total || showtime.capacity_total || 0),
                price: Number(showtime.Price || 0),
                seatStatus: `${
                  Number(showtime.Capacity_Total || 0) - Number(showtime.Capacity_Available || 0)
                }/${Number(showtime.Capacity_Total || 0)}`,
                isSoldOut: Number(showtime.Capacity_Available || 0) === 0,
              };
            } catch (error) {
              console.error(`Lỗi khi lấy thông tin ghế cho suất chiếu modal:`, error);
              return null;
            }
          })
        );

        // Lọc bỏ các suất chiếu null (lỗi)
        const validShowtimes = showtimesWithSeatsInfo.filter((showtime) => showtime !== null) as {
          id: string;
          startTime: string;
          endTime: string;
          roomName: string;
          roomType: string;
          availableSeats: number;
          totalSeats: number;
          price: number;
          seatStatus: string;
          isSoldOut: boolean;
        }[];

        // Sắp xếp suất chiếu theo thời gian
        validShowtimes.sort((a, b) => {
          if (!a || !b || !a.startTime || !b.startTime) return 0;
          const timeA = a.startTime.split(":").map(Number);
          const timeB = b.startTime.split(":").map(Number);
          return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1]);
        });

        // Nếu không có suất chiếu hợp lệ
        if (validShowtimes.length === 0) {
          console.log("Không có suất chiếu hợp lệ cho modal");
          setModalAvailableShowtimes([]);
        } else {
          setModalAvailableShowtimes(validShowtimes);
        }
      } catch (error) {
        console.error("Lỗi khi lấy suất chiếu modal:", error);
        toast.error("Không thể tải suất chiếu. Vui lòng thử lại sau.");
        setModalAvailableShowtimes([]);
      }
    }
  };

  const handleModalShowtimeChange = (showtimeId: string) => {
    setModalSelectedShowtimeId(showtimeId);
  };

  const handleModalBookingConfirm = () => {
    if (modalSelectedShowtimeId) {
      navigate(`/booking/${modalSelectedShowtimeId}`);
      handleCloseBookingModal();
    }
  };

  // Handle trailer viewing
  const handleTrailerPlay = (movie: HomePageMovie) => {
    if (movie.trailer) {
      // Open trailer in new window/tab
      window.open(movie.trailer, '_blank');
    } else {
      toast.error('Trailer không khả dụng cho phim này');
    }
  };

  if (loading) {
    return <FullScreenLoader />;
  }

  const heroMovie = nowShowingMovies[heroMovieIndex];

  // Helper function to get discount type and value from promotion data
  const getDiscountTypeAndValue = (promotion: HomePagePromotion): { type: string; value: number } => {
    const originalData = promotion.originalData;
    
    // First, try to get from the properly mapped promotion service data
    if (originalData && originalData.discountType && originalData.discountValue !== undefined) {
      return {
        type: originalData.discountType,
        value: originalData.discountValue
      };
    }
    
    // Second, try to get from API data if available
    if (originalData && originalData.Discount_Value !== undefined && originalData.Discount_Type) {
      return {
        type: originalData.Discount_Type,
        value: originalData.Discount_Value
      };
    }
    
    // Fallback: parse from discount text
    if (promotion.discount.includes('%')) {
      const value = parseInt(promotion.discount.replace(/[^\d]/g, '')) || 10;
      return { type: 'Percentage', value };
    } else if (promotion.discount.includes('VND') || promotion.discount.includes('.') || promotion.discount.includes(',')) {
      // Handle different number formats like "100.000 VND" or "100,000 VND"
      const numericValue = promotion.discount.replace(/[^\d]/g, '');
      const value = parseInt(numericValue) || 50000;
      return { type: 'Fixed', value };
    }
    
    // Default fallback
    return { type: 'Percentage', value: 10 };
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {/* Hero Section */}
        <section className="relative h-screen overflow-hidden">
          <AnimatePresence mode="wait">
            {heroMovie && (
              <motion.div
                key={heroMovie.id}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                {/* Background Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${heroMovie.backdrop || heroMovie.poster})`,
                  }}
                />

                {/* Overlay Gradients */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                {/* Content */}
                <div className="relative z-10 h-full flex items-center">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="max-w-2xl">
                      <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="space-y-6"
                      >
                        {/* Movie Badges */}
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 bg-gradient-to-r from-[#FFD875] to-[#FFA500] text-black text-sm font-bold rounded-full shadow-lg">
                            ĐANG CHIẾU
                          </span>
                          <div className="flex items-center gap-1 text-[#FFD875]">
                            <StarIconSolid className="w-5 h-5" />
                            <span className="font-semibold">{heroMovie.rating && !isNaN(heroMovie.rating) ? heroMovie.rating : 4.5}</span>
                          </div>
                        </div>

                        {/* Title */}
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
                          <span className="bg-gradient-to-r from-white via-[#FFD875] to-white bg-clip-text text-transparent">
                            {heroMovie.title}
                          </span>
                        </h1>

                        {/* Movie Info */}
                        <div className="flex flex-wrap items-center gap-6 text-gray-300">
                          <div className="flex items-center gap-2">
                            <ClockIcon className="w-5 h-5 text-[#FFD875]" />
                            <span>{heroMovie.duration}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FilmIcon className="w-5 h-5 text-[#FFD875]" />
                            <span>{heroMovie.genre}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CalendarDaysIcon className="w-5 h-5 text-[#FFD875]" />
                            <span>{new Date(heroMovie.releaseDate).getFullYear()}</span>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-gray-300 text-lg leading-relaxed max-w-xl">{heroMovie.description}</p>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center gap-4 pt-4">
                          <button
                            onClick={() => handleOpenBookingModal(heroMovie)}
                            className="px-8 py-4 bg-gradient-to-r from-[#FFD875] to-[#FFA500] text-black font-bold rounded-xl hover:shadow-2xl hover:shadow-[#FFD875]/50 transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-3"
                          >
                            <TicketIcon className="w-6 h-6" />
                            ĐẶT VÉ NGAY
                          </button>

                          <button
                            onClick={() => navigate(`/movies/${heroMovie.id}`)}
                            className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold rounded-xl hover:bg-white/20 transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-3"
                          >
                            <FilmIcon className="w-6 h-6" />
                            XEM CHI TIẾT
                          </button>

                          {heroMovie.trailer && (
                            <button
                              onClick={() => handleTrailerPlay(heroMovie)}
                              className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold rounded-xl hover:bg-white/20 transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-3"
                            >
                              <PlayIconSolid className="w-6 h-6" />
                              XEM TRAILER
                            </button>
                          )}
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* Movie Thumbnails */}
                <div className="absolute bottom-8 right-8 flex gap-2">
                  {nowShowingMovies.slice(0, 5).map((movie, index) => (
                    <button
                      key={movie.id}
                      onClick={() => setHeroMovieIndex(index)}
                      className={`w-16 h-24 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                        index === heroMovieIndex
                          ? "border-[#FFD875] shadow-lg shadow-[#FFD875]/50"
                          : "border-white/30 hover:border-white/60"
                      }`}
                    >
                      <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Quick Booking Section - Enhanced UX */}
        <section className="relative py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-slate-950 to-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="relative overflow-hidden bg-gradient-to-br from-slate-800/95 via-slate-900/95 to-slate-800/95 backdrop-blur-xl rounded-3xl border border-yellow-500/20 shadow-2xl shadow-yellow-900/20"
            >
              {/* Background decorative elements */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-full blur-3xl -translate-y-48 translate-x-48"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-[#FFD875]/10 to-[#FFA500]/10 rounded-full blur-3xl translate-y-32 -translate-x-32"></div>

              <div className="relative z-10 p-6 sm:p-8 lg:p-12">
                {/* Header */}
                <div className="text-center mb-10">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="inline-flex items-center gap-4 mb-6"
                  >
                    <div className="w-1 h-12 bg-gradient-to-b from-[#FFD875] to-[#FFA500] rounded-full"></div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[#FFD875] via-yellow-400 to-[#FFA500] bg-clip-text text-transparent">
                      ĐẶT VÉ NHANH
                    </h2>
                    <TicketIcon className="w-10 h-10 text-[#FFD875]" />
                  </motion.div>
                  <p className="text-gray-300 text-lg sm:text-xl max-w-2xl mx-auto">
                    Tìm kiếm và đặt vé phim yêu thích của bạn chỉ trong 4 bước đơn giản
                  </p>
                </div>

                {/* Booking Steps */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-4 items-end">
                  {/* Step 1: Chọn Rạp */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 1.0 }}
                    className="space-y-3"
                  >
                    <label className="block text-sm font-bold text-[#FFD875] ml-2 flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-[#FFD875] to-[#FFA500] rounded-full flex items-center justify-center text-black text-xs font-bold">
                        1
                      </div>
                      <BuildingOfficeIcon className="w-4 h-4" />
                      Chọn Rạp
                    </label>
                    <select
                      value={selectedCinemaId}
                      onChange={(e) => handleCinemaChange(e.target.value)}
                      className="w-full px-4 py-4 bg-slate-700/80 border-2 border-yellow-400/20 rounded-2xl text-gray-100 font-medium focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/20 transition-all duration-300 shadow-lg hover:shadow-xl hover:border-yellow-400/40 backdrop-blur-sm hover:bg-slate-600/80"
                    >
                      <option value="" className="bg-slate-800 text-gray-300">
                        Chọn rạp chiếu
                      </option>
                      {cinemas.map((cinema) => (
                        <option key={cinema.Cinema_ID} value={cinema.Cinema_ID} className="bg-slate-800 text-gray-100">
                          {cinema.Cinema_Name}
                        </option>
                      ))}
                    </select>
                  </motion.div>

                  {/* Step 2: Chọn Phim */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 1.1 }}
                    className="space-y-3"
                  >
                    <label className="block text-sm font-bold text-[#FFD875] ml-2 flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-[#FFD875] to-[#FFA500] rounded-full flex items-center justify-center text-black text-xs font-bold">
                        2
                      </div>
                      <FilmIcon className="w-4 h-4" />
                      Chọn Phim
                    </label>
                    <select
                      value={selectedMovieId}
                      onChange={(e) => handleMovieChange(e.target.value)}
                      disabled={!selectedCinemaId}
                      className="w-full px-4 py-4 bg-slate-700/80 border-2 border-yellow-400/20 rounded-2xl text-gray-100 font-medium focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/20 transition-all duration-300 shadow-lg hover:shadow-xl hover:border-yellow-400/40 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-800/60 hover:bg-slate-600/80"
                    >
                      <option value="" className="bg-slate-800 text-gray-300">
                        Chọn phim
                      </option>
                      {availableMovies.map((movie) => (
                        <option key={movie.id} value={movie.id} className="bg-slate-800 text-gray-100">
                          {movie.title}
                        </option>
                      ))}
                    </select>
                  </motion.div>

                  {/* Step 3: Chọn Ngày */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 1.2 }}
                    className="space-y-3"
                  >
                    <label className="block text-sm font-bold text-[#FFD875] ml-2 flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-[#FFD875] to-[#FFA500] rounded-full flex items-center justify-center text-black text-xs font-bold">
                        3
                      </div>
                      <CalendarDaysIcon className="w-4 h-4" />
                      Chọn Ngày
                    </label>
                    <select
                      value={selectedDate}
                      onChange={(e) => handleDateChange(e.target.value)}
                      disabled={!selectedMovieId}
                      className="w-full px-4 py-4 bg-slate-700/80 border-2 border-yellow-400/20 rounded-2xl text-gray-100 font-medium focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/20 transition-all duration-300 shadow-lg hover:shadow-xl hover:border-yellow-400/40 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-800/60 hover:bg-slate-600/80"
                    >
                      <option value="" className="bg-slate-800 text-gray-300">
                        Chọn ngày
                      </option>
                      {(() => {
                        // Tạo mảng 3 ngày: hôm nay, ngày mai, ngày mốt
                        const today = new Date();
                        const tomorrow = new Date(today);
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        const dayAfterTomorrow = new Date(today);
                        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

                        const fixedDates = [
                          {
                            date: today.toISOString().split("T")[0],
                            displayDate: `Hôm nay (${today.toLocaleDateString("vi-VN", {
                              weekday: "long",
                              day: "2-digit",
                              month: "2-digit",
                            })})`,
                          },
                          {
                            date: tomorrow.toISOString().split("T")[0],
                            displayDate: `Ngày mai (${tomorrow.toLocaleDateString("vi-VN", {
                              weekday: "long",
                              day: "2-digit",
                              month: "2-digit",
                            })})`,
                          },
                          {
                            date: dayAfterTomorrow.toISOString().split("T")[0],
                            displayDate: `Ngày mốt (${dayAfterTomorrow.toLocaleDateString("vi-VN", {
                              weekday: "long",
                              day: "2-digit",
                              month: "2-digit",
                            })})`,
                          },
                        ];

                        return fixedDates.map((dateItem) => (
                          <option key={dateItem.date} value={dateItem.date} className="bg-slate-800 text-gray-100">
                            {dateItem.displayDate}
                          </option>
                        ));
                      })()}
                    </select>
                  </motion.div>

                  {/* Step 4: Chọn Suất */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 1.3 }}
                    className="space-y-3"
                  >
                    <label className="block text-sm font-bold text-[#FFD875] ml-2 flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-[#FFD875] to-[#FFA500] rounded-full flex items-center justify-center text-black text-xs font-bold">
                        4
                      </div>
                      <ClockIcon className="w-4 h-4" />
                      Chọn Suất
                    </label>
                    <select
                      value={selectedShowtimeId}
                      onChange={(e) => handleShowtimeChange(e.target.value)}
                      disabled={!selectedDate}
                      className="w-full px-4 py-4 bg-slate-700/80 border-2 border-yellow-400/20 rounded-2xl text-gray-100 font-medium focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/20 transition-all duration-300 shadow-lg hover:shadow-xl hover:border-yellow-400/40 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-800/60 hover:bg-slate-600/80"
                    >
                      <option value="" className="bg-slate-800 text-gray-300">
                        Chọn suất chiếu
                      </option>
                      {availableShowtimes.length > 0 ? (
                        availableShowtimes.map((showtime) => (
                          <option key={showtime.id} value={showtime.id} className="bg-slate-800 text-gray-100">
                            {showtime.startTime} - {showtime.roomName} ({showtime.roomType}) ({showtime.seatStatus} ghế)
                          </option>
                        ))
                      ) : (
                        <option value="" disabled className="bg-slate-800 text-gray-500">
                          Không có suất chiếu
                        </option>
                      )}
                    </select>
                  </motion.div>

                  {/* ĐẶT NGAY Button */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 1.4 }}
                    className="space-y-3 sm:col-span-2 lg:col-span-1"
                  >
                    <label className="block text-sm font-bold text-transparent ml-2">.</label>
                    <motion.button
                      onClick={handleQuickBooking}
                      disabled={!selectedShowtimeId}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full px-6 py-4 bg-gradient-to-r from-[#FFD875] via-yellow-400 to-[#FFA500] text-black font-bold text-lg rounded-2xl shadow-2xl hover:shadow-3xl hover:shadow-yellow-500/50 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
                    >
                      {/* Button shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:translate-x-full transition-transform duration-700"></div>

                      <TicketIcon className="w-6 h-6 relative z-10" />
                      <span className="relative z-10">ĐẶT NGAY</span>
                    </motion.button>
                  </motion.div>
                </div>

                {/* Progress Indicator */}
                <div className="mt-8 flex justify-center">
                  <div className="flex items-center gap-3">
                    {[1, 2, 3, 4].map((step) => (
                      <div key={step} className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            (step === 1 && selectedCinemaId) ||
                            (step === 2 && selectedMovieId) ||
                            (step === 3 && selectedDate) ||
                            (step === 4 && selectedShowtimeId)
                              ? "bg-[#FFD875] shadow-lg shadow-yellow-400/50"
                              : "bg-slate-600"
                          }`}
                        ></div>
                        {step < 4 && <div className="w-8 h-0.5 bg-slate-600"></div>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Now Showing Movies - Enhanced UX */}
        <section className="py-16 sm:py-20 lg:py-24 bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-12 lg:mb-16"
            >
              <div className="inline-flex items-center gap-4 mb-6">
                <div className="w-1 h-10 bg-gradient-to-b from-[#FFD875] to-[#FFA500] rounded-full"></div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                  <span className="bg-gradient-to-r from-white via-[#FFD875] to-white bg-clip-text text-transparent">
                    PHIM ĐANG CHIẾU
                  </span>
                </h2>
                <FilmIcon className="w-8 h-8 sm:w-10 sm:h-10 text-[#FFD875]" />
              </div>
              <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto">
                Những bộ phim hot nhất đang chiếu tại Galaxy Cinema
              </p>
            </motion.div>

            {/* Carousel Container */}
            <div className="relative">
              {/* Navigation Buttons */}
              <button
                onClick={handleNowShowingPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-14 h-14 bg-gradient-to-r from-[#FFD875]/90 to-[#FFA500]/90 hover:from-[#FFD875] hover:to-[#FFA500] text-black rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-yellow-500/30 backdrop-blur-sm border border-white/20"
              >
                <ChevronRightIcon className="w-6 h-6 rotate-180" />
              </button>

              <button
                onClick={handleNowShowingNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-14 h-14 bg-gradient-to-r from-[#FFD875]/90 to-[#FFA500]/90 hover:from-[#FFD875] hover:to-[#FFA500] text-black rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-yellow-500/30 backdrop-blur-sm border border-white/20"
              >
                <ChevronRightIcon className="w-6 h-6" />
              </button>

              {/* Movies Carousel */}
              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-500"
                  style={{ transform: `translateX(-${nowShowingCurrentIndex * 25}%)` }}
                >
                  {nowShowingMovies.map((movie, index) => (
                    <motion.div
                      key={`movie-${index}`}
                      initial={{ y: 50, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="flex-shrink-0 w-full sm:w-1/2 lg:w-1/4 px-2 sm:px-3"
                    >
                      <div 
                        className="group relative bg-slate-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-yellow-500/20 transition-all duration-500 border border-slate-700 hover:border-yellow-400/50 transform hover:-translate-y-2 cursor-pointer"
                        onClick={() => navigate(`/movies/${movie.id}`)}
                      >
                        <div className="relative aspect-[2/3] overflow-hidden">
                          <img
                            src={movie.poster}
                            alt={movie.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />

                          {/* Overlay gradient */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                          {/* Hot Badge */}
                          {movie.isHot && (
                            <div className="absolute top-3 left-3">
                              <span className="px-2 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-lg">
                                <FireIcon className="w-3 h-3" />
                                HOT
                              </span>
                            </div>
                          )}

                          {/* Rating Badge */}
                          <div className="absolute top-3 right-3">
                            <span className="px-2 py-1 bg-black/60 backdrop-blur-sm text-yellow-400 text-xs font-bold rounded-lg flex items-center gap-1 shadow-lg">
                              <StarIconSolid className="w-3 h-3" />
                              {movie.rating && !isNaN(movie.rating) ? movie.rating : 4.5}
                            </span>
                          </div>

                          {/* Hover Action Buttons */}
                          <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                            {/* Play Trailer Button */}
                            {movie.trailer && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTrailerPlay(movie);
                                }}
                                className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 hover:bg-white/30 transition-all duration-300 hover:scale-110"
                                title="Xem trailer"
                              >
                                <PlayIcon className="w-6 h-6 text-white ml-0.5" />
                              </button>
                            )}

                            {/* View Details Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/movies/${movie.id}`);
                              }}
                              className="w-12 h-12 bg-yellow-400/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-yellow-400/30 hover:bg-yellow-400/30 transition-all duration-300 hover:scale-110"
                              title="Xem chi tiết"
                            >
                              <FilmIcon className="w-6 h-6 text-yellow-400" />
                            </button>
                          </div>
                        </div>

                        {/* Movie Info */}
                        <div className="p-4 bg-slate-800">
                          <h3 className="text-gray-100 font-bold text-sm mb-2 line-clamp-2 min-h-[40px] group-hover:text-yellow-400 transition-colors duration-300">
                            {movie.title.toUpperCase()}
                          </h3>

                          {/* Movie Details */}
                          <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                            <span className="flex items-center gap-1">
                              <ClockIcon className="w-3 h-3" />
                              {movie.duration}
                            </span>
                            <span>{movie.genre}</span>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenBookingModal(movie);
                            }}
                            className="w-full py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold text-sm rounded-xl hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300 shadow-lg hover:shadow-yellow-400/40 transform hover:scale-105"
                          >
                            MUA VÉ
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-center mt-12">
              <Link
                to="/movies"
                className="inline-block px-8 py-3 border-2 border-yellow-400 text-yellow-400 font-bold rounded hover:bg-yellow-400 hover:text-black transition-all duration-300"
              >
                XEM THÊM
              </Link>
            </div>
          </div>
        </section>

        {/* Coming Soon Movies - Enhanced UX */}
        <section className="py-16 sm:py-20 lg:py-24 bg-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-12 lg:mb-16"
            >
              <div className="inline-flex items-center gap-4 mb-6">
                <div className="w-1 h-10 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full"></div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                  <span className="bg-gradient-to-r from-white via-blue-400 to-white bg-clip-text text-transparent">
                    PHIM SẮP CHIẾU
                  </span>
                </h2>
                <CalendarDaysIcon className="w-8 h-8 sm:w-10 sm:h-10 text-blue-400" />
              </div>
              <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto">
                Những siêu phẩm đáng chờ đợi sẽ ra mắt trong thời gian tới
              </p>
            </motion.div>

            {/* Carousel Container */}
            <div className="relative">
              {/* Navigation Buttons */}
              <button
                onClick={handleComingSoonPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-14 h-14 bg-gradient-to-r from-blue-500/90 to-blue-600/90 hover:from-blue-400 hover:to-blue-500 text-white rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/30 backdrop-blur-sm border border-white/20"
              >
                <ChevronRightIcon className="w-6 h-6 rotate-180" />
              </button>

              <button
                onClick={handleComingSoonNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-14 h-14 bg-gradient-to-r from-blue-500/90 to-blue-600/90 hover:from-blue-400 hover:to-blue-500 text-white rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/30 backdrop-blur-sm border border-white/20"
              >
                <ChevronRightIcon className="w-6 h-6" />
              </button>

              {/* Movies Carousel */}
              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-500"
                  style={{ transform: `translateX(-${comingSoonCurrentIndex * 25}%)` }}
                >
                  {comingSoonMovies.map((movie, index) => (
                    <motion.div
                      key={`movie-${index}`}
                      initial={{ y: 50, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="flex-shrink-0 w-full sm:w-1/2 lg:w-1/4 px-2 sm:px-3"
                    >
                      <div 
                        className="group relative bg-slate-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 border border-slate-700 hover:border-blue-400/50 transform hover:-translate-y-2 cursor-pointer"
                        onClick={() => navigate(`/movies/${movie.id}`)}
                      >
                        <div className="relative aspect-[2/3] overflow-hidden">
                          <img
                            src={movie.poster}
                            alt={movie.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />

                          {/* Overlay gradient */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                          {/* Coming Soon Badge */}
                          <div className="absolute top-3 left-3">
                            <span className="px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded-lg flex items-center shadow-lg">
                              SẮP CHIẾU
                            </span>
                          </div>

                          {/* Rating Badge */}
                          <div className="absolute top-3 right-3">
                            <span className="px-2 py-1 bg-black/60 backdrop-blur-sm text-yellow-400 text-xs font-bold rounded-lg flex items-center gap-1 shadow-lg">
                              <StarIconSolid className="w-3 h-3" />
                              {movie.rating && !isNaN(movie.rating) ? movie.rating : 4.5}
                            </span>
                          </div>

                          {/* Hover Action Buttons */}
                          <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                            {/* Play Trailer Button */}
                            {movie.trailer && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTrailerPlay(movie);
                                }}
                                className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 hover:bg-white/30 transition-all duration-300 hover:scale-110"
                                title="Xem trailer"
                              >
                                <PlayIcon className="w-6 h-6 text-white ml-0.5" />
                              </button>
                            )}

                            {/* View Details Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/movies/${movie.id}`);
                              }}
                              className="w-12 h-12 bg-blue-400/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-blue-400/30 hover:bg-blue-400/30 transition-all duration-300 hover:scale-110"
                              title="Xem chi tiết"
                            >
                              <FilmIcon className="w-6 h-6 text-blue-400" />
                            </button>
                          </div>
                        </div>

                        {/* Movie Info */}
                        <div className="p-4 bg-slate-800">
                          <h3 className="text-gray-100 font-bold text-sm mb-2 line-clamp-2 min-h-[40px] group-hover:text-blue-400 transition-colors duration-300">
                            {movie.title.toUpperCase()}
                          </h3>

                          <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                            <span className="flex items-center gap-1 pr-5">
                              <CalendarDaysIcon className="w-3 h-3" />
                              {new Date(movie.releaseDate).toLocaleDateString('vi-VN')}
                            </span>
                            <span>{movie.genre}</span>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/movies/${movie.id}`);
                            }}
                            className="w-full py-3 bg-gradient-to-r from-blue-400 to-blue-500 text-white font-bold text-sm rounded-xl hover:from-blue-500 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-blue-400/40 transform hover:scale-105"
                          >
                            XEM CHI TIẾT
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-center mt-12">
              <Link
                to="/movies"
                className="inline-block px-8 py-3 border-2 border-yellow-400 text-yellow-400 font-bold rounded hover:bg-yellow-400 hover:text-black transition-all duration-300"
              >
                XEM THÊM
              </Link>
            </div>
          </div>
        </section>

        {/* Promotions Section - Enhanced UX */}
        <section className="py-16 sm:py-20 lg:py-24 bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-12 lg:mb-16"
            >
              <div className="inline-flex items-center gap-4 mb-6">
                <div className="w-1 h-10 bg-gradient-to-b from-red-400 to-red-600 rounded-full"></div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                  <span className="bg-gradient-to-r from-white via-red-400 to-white bg-clip-text text-transparent">
                    KHUYẾN MÃI
                  </span>
                </h2>
                <GiftIcon className="w-8 h-8 sm:w-10 sm:h-10 text-red-400" />
              </div>
              <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto">
                Ưu đãi hấp dẫn và những chương trình khuyến mãi đặc biệt
              </p>
            </motion.div>

            {/* Carousel Container */}
            <div className="relative">
              {/* Navigation Buttons */}
              {promotions.length > 1 && (
                <>
                  <button
                    onClick={handlePromotionPrev}
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-red-500/90 to-red-600/90 hover:from-red-400 hover:to-red-500 text-white rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-red-500/30 backdrop-blur-sm border border-white/20"
                  >
                    <ChevronLeftIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>

                  <button
                    onClick={handlePromotionNext}
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-red-500/90 to-red-600/90 hover:from-red-400 hover:to-red-500 text-white rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-red-500/30 backdrop-blur-sm border border-white/20"
                  >
                    <ChevronRightIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </>
              )}

              <div className="overflow-hidden">
                <div
                  className="flex gap-4 sm:gap-6 transition-transform duration-500"
                  style={{
                    transform: `translateX(-${currentPromotionIndex * (getPromotionCardWidth() + 24)}px)`,
                  }}
                >
                  {promotions.map((promotion, index) => {
                    const discountInfo = getDiscountTypeAndValue(promotion);
                    return (
                      <motion.div
                        key={`promotion-${index}`}
                        initial={{ y: 50, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        viewport={{ once: true }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        className="flex-shrink-0 w-72 sm:w-80 h-44 sm:h-48 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-red-500/20 transition-all duration-300 group cursor-pointer relative"
                        onClick={() => handlePromotionClick(promotion)}
                      >
                      <div className="relative w-full h-full">
                        <img
                          src={promotion.image}
                          alt={promotion.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />

                        {/* Overlay với thông tin */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                        

                        {/* Hot Badge - if applicable */}
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold rounded-full shadow-lg animate-pulse">
                            HOT
                          </span>
                        </div>

                        {/* Content */}
                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="text-white font-bold text-lg mb-2 line-clamp-1">{promotion.title}</h3>
                          <p className="text-gray-300 text-sm line-clamp-2 mb-2">{promotion.description}</p>
                          
                          {/* Discount highlight - Using DiscountBadge component */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-400">Giảm giá:</span>
                              <DiscountBadge 
                                type={discountInfo.type} 
                                value={discountInfo.value} 
                              />
                            </div>
                            <div className="flex items-center text-xs text-gray-400">
                              <GiftIcon className="w-4 h-4 mr-1" />
                              <span>Xem chi tiết</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Navigation Dots */}
              <div className="flex justify-center items-center gap-2 mt-8">
                {[0, 1, 2].map((dot) => (
                  <button
                    key={`dot-${dot}`}
                    className="w-3 h-3 rounded-full bg-gray-600 hover:bg-yellow-400 transition-colors duration-300"
                  />
                ))}
              </div>
            </div>

            <div className="text-center mt-12">
              <Link
                to="/promotions"
                className="inline-block px-8 py-3 border-2 border-yellow-400 text-yellow-400 font-bold rounded hover:bg-yellow-400 hover:text-black transition-all duration-300"
              >
                TẤT CẢ ƯU ĐÃI
              </Link>
            </div>
          </div>
        </section>

        {/* Cinema Locations */}
        <section className="py-20 bg-gradient-to-b from-slate-900/50 to-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="w-2 h-8 bg-gradient-to-b from-green-400 to-green-600 rounded-full"></div>
                <h2 className="text-4xl font-bold text-white">
                  <span className="bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
                    Hệ Thống Rạp
                  </span>
                </h2>
                <MapPinIcon className="w-8 h-8 text-green-400" />
              </div>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Galaxy Cinema - Chuỗi rạp chiếu phim hiện đại nhất Việt Nam
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {cinemas.map((cinema, index) => (
                <motion.div
                  key={`cinema-${index}`}
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group bg-slate-800/50 rounded-2xl p-6 border border-slate-700 hover:border-green-400/50 transition-all duration-500"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <BuildingOfficeIcon className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-white font-bold text-lg mb-2 group-hover:text-green-400 transition-colors duration-300">
                    {cinema.Cinema_Name}
                  </h3>

                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{cinema.Address}</p>

                  <div className="flex items-center gap-2 text-sm text-green-400">
                    <MapPinIcon className="w-4 h-4" />
                    <span>{cinema.City}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                to="/cinemas"
                className="inline-flex items-center gap-3 px-8 py-4 bg-slate-800 border border-slate-600 text-white font-bold rounded-xl hover:border-green-400 hover:text-green-400 transition-all duration-300"
              >
                Xem Tất Cả Rạp Chiếu
                <ChevronRightIcon className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section - Enhanced UX */}
        <section className="py-16 sm:py-20 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-12 lg:mb-20"
            >
              <div className="inline-flex items-center gap-4 mb-6">
                <div className="w-1 h-10 bg-gradient-to-b from-[#FFD875] to-[#FFA500] rounded-full"></div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                  <span className="bg-gradient-to-r from-[#FFD875] via-yellow-400 to-[#FFA500] bg-clip-text text-transparent">
                    Tại Sao Chọn Galaxy Cinema?
                  </span>
                </h2>
                <StarIcon className="w-8 h-8 sm:w-10 sm:h-10 text-[#FFD875]" />
              </div>
              <p className="text-gray-400 text-lg sm:text-xl max-w-3xl mx-auto">
                Trải nghiệm điện ảnh đỉnh cao với công nghệ hiện đại nhất và dịch vụ chuyên nghiệp
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {[
                {
                  icon: <FilmIcon className="w-8 h-8" />,
                  title: "Công Nghệ 4DX",
                  description: "Trải nghiệm điện ảnh sống động với ghế chuyển động và hiệu ứng đặc biệt",
                  color: "from-blue-400 to-blue-600",
                },
                {
                  icon: <UsersIcon className="w-8 h-8" />,
                  title: "Dịch Vụ VIP",
                  description: "Phòng chiếu VIP với ghế massage và dịch vụ cao cấp",
                  color: "from-purple-400 to-purple-600",
                },
                {
                  icon: <TrophyIcon className="w-8 h-8" />,
                  title: "Chất Lượng Hàng Đầu",
                  description: "Âm thanh Dolby Atmos và hình ảnh 4K siêu nét",
                  color: "from-[#FFD875] to-[#FFA500]",
                },
                {
                  icon: <SparklesIcon className="w-8 h-8" />,
                  title: "Ưu Đãi Đặc Biệt",
                  description: "Chương trình khuyến mãi và tích điểm hấp dẫn",
                  color: "from-red-400 to-red-600",
                },
              ].map((feature, index) => (
                <motion.div
                  key={`feature-${index}`}
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  viewport={{ once: true }}
                  className="group text-center bg-slate-800/30 rounded-2xl p-6 lg:p-8 border border-slate-700/50 hover:border-yellow-400/30 transition-all duration-500 hover:bg-slate-800/50"
                >
                  <div
                    className={`w-20 h-20 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg group-hover:shadow-xl`}
                  >
                    <div className="text-white">{feature.icon}</div>
                  </div>

                  <h3 className="text-white font-bold text-xl mb-4 group-hover:text-[#FFD875] transition-colors duration-300">
                    {feature.title}
                  </h3>

                  <p className="text-gray-400 leading-relaxed text-sm lg:text-base">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Movie Booking Modal */}
      <AnimatePresence>
        {isBookingModalOpen && bookingMovie && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={handleCloseBookingModal}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full max-w-4xl bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-3xl border border-yellow-500/20 shadow-2xl shadow-yellow-900/20 overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-full blur-3xl -translate-y-32 translate-x-32"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#FFD875]/10 to-[#FFA500]/10 rounded-full blur-3xl translate-y-24 -translate-x-24"></div>

                {/* Close Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCloseBookingModal();
                  }}
                  className="absolute top-4 right-4 z-20 w-10 h-10 bg-slate-700/80 hover:bg-slate-600 text-gray-300 hover:text-white rounded-full flex items-center justify-center transition-all duration-300"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>

                <div className="relative z-10 p-6 lg:p-8">
                  {/* Header */}
                  <div className="flex items-start gap-6 mb-8">
                    {/* Movie Poster */}
                    <div className="flex-shrink-0 w-24 h-36 rounded-xl overflow-hidden shadow-lg">
                      <img src={bookingMovie.poster} alt={bookingMovie.title} className="w-full h-full object-cover" />
                    </div>

                    {/* Movie Info */}
                    <div className="flex-1">
                      <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">{bookingMovie.title}</h2>
                      <div className="flex flex-wrap items-center gap-4 text-gray-300 mb-4">
                        <div className="flex items-center gap-2">
                          <ClockIcon className="w-4 h-4 text-[#FFD875]" />
                          <span>{bookingMovie.duration}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FilmIcon className="w-4 h-4 text-[#FFD875]" />
                          <span>{bookingMovie.genre}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <StarIconSolid className="w-4 h-4 text-[#FFD875]" />
                          <span>{bookingMovie.rating && !isNaN(bookingMovie.rating) ? bookingMovie.rating : 4.5}</span>
                        </div>
                      </div>
                      <div className="inline-flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 bg-gradient-to-r from-[#FFD875] to-[#FFA500] text-black text-sm font-bold rounded-full">
                          ĐANG CHIẾU
                        </span>
                        <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                          {bookingMovie.ageRating || "T18"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Booking Form */}
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-xl font-bold bg-gradient-to-r from-[#FFD875] via-yellow-400 to-[#FFA500] bg-clip-text text-transparent mb-2">
                        CHỌN RẠP VÀ SUẤT CHIẾU
                      </h3>
                      <p className="text-gray-400">Vui lòng chọn rạp và suất chiếu phù hợp</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Step 1: Chọn Rạp */}
                      <div className="space-y-3">
                        <label className="block text-sm font-bold text-[#FFD875] flex items-center gap-2">
                          <div className="w-6 h-6 bg-gradient-to-r from-[#FFD875] to-[#FFA500] rounded-full flex items-center justify-center text-black text-xs font-bold">
                            1
                          </div>
                          <BuildingOfficeIcon className="w-4 h-4" />
                          Chọn Rạp
                        </label>
                        <select
                          value={modalSelectedCinemaId}
                          onChange={(e) => handleModalCinemaChange(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-700/80 border-2 border-yellow-400/20 rounded-xl text-gray-100 font-medium focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/20 transition-all duration-300 shadow-lg hover:shadow-xl hover:border-yellow-400/40 backdrop-blur-sm hover:bg-slate-600/80"
                        >
                          <option value="" className="bg-slate-800 text-gray-300">
                            Chọn rạp chiếu
                          </option>
                          {cinemas.map((cinema) => (
                            <option
                              key={cinema.Cinema_ID}
                              value={cinema.Cinema_ID}
                              className="bg-slate-800 text-gray-100"
                            >
                              {cinema.Cinema_Name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Step 2: Chọn Ngày */}
                      <div className="space-y-3">
                        <label className="block text-sm font-bold text-[#FFD875] flex items-center gap-2">
                          <div className="w-6 h-6 bg-gradient-to-r from-[#FFD875] to-[#FFA500] rounded-full flex items-center justify-center text-black text-xs font-bold">
                            2
                          </div>
                          <CalendarDaysIcon className="w-4 h-4" />
                          Chọn Ngày
                        </label>
                        <select
                          value={modalSelectedDate}
                          onChange={(e) => handleModalDateChange(e.target.value)}
                          disabled={!modalSelectedCinemaId}
                          className="w-full px-4 py-3 bg-slate-700/80 border-2 border-yellow-400/20 rounded-xl text-gray-100 font-medium focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/20 transition-all duration-300 shadow-lg hover:shadow-xl hover:border-yellow-400/40 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-800/60 hover:bg-slate-600/80"
                        >
                          <option value="" className="bg-slate-800 text-gray-300">
                            Chọn ngày chiếu
                          </option>
                          {(() => {
                            // Tạo mảng 3 ngày: hôm nay, ngày mai, ngày mốt
                            const today = new Date();
                            const tomorrow = new Date(today);
                            tomorrow.setDate(tomorrow.getDate() + 1);
                            const dayAfterTomorrow = new Date(today);
                            dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

                            const fixedDates = [
                              {
                                date: today.toISOString().split("T")[0],
                                displayDate: `Hôm nay (${today.toLocaleDateString("vi-VN", {
                                  weekday: "long",
                                  day: "2-digit",
                                  month: "2-digit",
                                })})`,
                              },
                              {
                                date: tomorrow.toISOString().split("T")[0],
                                displayDate: `Ngày mai (${tomorrow.toLocaleDateString("vi-VN", {
                                  weekday: "long",
                                  day: "2-digit",
                                  month: "2-digit",
                                })})`,
                              },
                              {
                                date: dayAfterTomorrow.toISOString().split("T")[0],
                                displayDate: `Ngày mốt (${dayAfterTomorrow.toLocaleDateString("vi-VN", {
                                  weekday: "long",
                                  day: "2-digit",
                                  month: "2-digit",
                                })})`,
                              },
                            ];

                            return fixedDates.map((dateItem) => (
                              <option key={dateItem.date} value={dateItem.date} className="bg-slate-800 text-gray-100">
                                {dateItem.displayDate}
                              </option>
                            ));
                          })()}
                        </select>
                      </div>

                      {/* Step 3: Chọn Suất */}
                      <div className="space-y-3">
                        <label className="block text-sm font-bold text-[#FFD875] flex items-center gap-2">
                          <div className="w-6 h-6 bg-gradient-to-r from-[#FFD875] to-[#FFA500] rounded-full flex items-center justify-center text-black text-xs font-bold">
                            3
                          </div>
                          <ClockIcon className="w-4 h-4" />
                          Chọn Suất
                        </label>
                        <select
                          value={modalSelectedShowtimeId}
                          onChange={(e) => handleModalShowtimeChange(e.target.value)}
                          disabled={!modalSelectedDate}
                          className="w-full px-4 py-4 bg-slate-800/80 border-2 border-yellow-400/20 rounded-2xl text-gray-100 font-medium focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/20 transition-all duration-300 shadow-lg hover:shadow-xl hover:border-yellow-400/40 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-900/60 hover:bg-slate-700/80"
                        >
                          <option value="" className="bg-slate-800 text-gray-300">
                            Chọn suất chiếu
                          </option>
                          {modalAvailableShowtimes.map((showtime) => (
                            <option key={showtime.id} value={showtime.id} className="bg-slate-800 text-gray-100">
                              {showtime.startTime} - {showtime.roomName} ({showtime.roomType}) ({showtime.seatStatus}{" "}
                              ghế)
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-4 pt-6">
                      <button
                        onClick={handleCloseBookingModal}
                        className="px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white font-bold rounded-xl transition-all duration-300"
                      >
                        HỦY
                      </button>
                      <motion.button
                        onClick={handleModalBookingConfirm}
                        disabled={!modalSelectedShowtimeId}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-8 py-3 bg-gradient-to-r from-[#FFD875] via-yellow-400 to-[#FFA500] text-black font-bold rounded-xl shadow-lg hover:shadow-xl hover:shadow-yellow-500/40 transition-all duration-300 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
                      >
                        {/* Button shine effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:translate-x-full transition-transform duration-700"></div>

                        <TicketIcon className="w-5 h-5 relative z-10" />
                        <span className="relative z-10">ĐẶT GHẾ NGAY</span>
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Promotion Modal */}
      {selectedPromotion && (
        <PromoDetailsModal
          promotion={selectedPromotion}
          isOpen={isPromotionModalOpen}
          onClose={handleClosePromotionModal}
          onApply={handleApplyPromotionCode}
          formatPrice={(price: number) =>
            new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price)
          }
          formatDate={(dateString: string) => new Date(dateString).toLocaleDateString("vi-VN")}
        />
      )}
    </>
  );
};

export default HomePage;
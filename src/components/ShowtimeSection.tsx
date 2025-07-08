import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';
import type { Cinema } from '../types/cinema';
import type { Showtime } from '../types/showtime';
import { getShowtimeSeatsInfo } from '../services/showtimeService';
import type { ShowtimeSeatsInfo } from '../services/showtimeService';

import AuthModal from './AuthModal';
import { useAuth } from '../contexts/SimpleAuthContext';
import { formatTime as formatTimeUtil } from '../utils/timeFormatter';


interface ShowtimeSectionProps {
  movieId: string | number;
  cinemas: Cinema[];
  showtimes: Showtime[];
  onCinemaSelect?: (cinemaId: number) => void;
  onRefetch?: (cinemaId: number | null) => void;
  loading?: boolean;
}


// Add a custom extended Showtime interface that includes the room property
interface ExtendedShowtime extends Showtime {
  room?: {
    name: string;
    roomType?: string;
    capacity?: number;
  };
}


const ShowtimeSection: React.FC<ShowtimeSectionProps> = ({
  movieId,
  cinemas,
  showtimes,
  onCinemaSelect,
  onRefetch,
  loading = false
}) => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedCinemaId, setSelectedCinemaId] = useState<number | null>(null);
  const [localLoading, setLocalLoading] = useState(false);
  const [seatsInfoCache, setSeatsInfoCache] = useState<Record<string, ShowtimeSeatsInfo>>({});
  const [loadingSeats, setLoadingSeats] = useState<Record<string, boolean>>({});
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingBookingData, setPendingBookingData] = useState<{
    showtime: Showtime;
    cinema: Cinema;
  } | null>(null);
  const { isAuthenticated } = useAuth();


  // Kết hợp trạng thái loading từ props và local
  const isLoading = loading || localLoading;


  // Function để fetch thông tin ghế cho một showtime
  const fetchSeatsInfo = async (showtimeId: string) => {
    if (seatsInfoCache[showtimeId] || loadingSeats[showtimeId]) {
      return; // Đã có cache hoặc đang loading
    }


    setLoadingSeats(prev => ({ ...prev, [showtimeId]: true }));


    try {
      const response = await getShowtimeSeatsInfo(showtimeId);
      if (response.success) {
        setSeatsInfoCache(prev => ({ ...prev, [showtimeId]: response.data }));
      }
    } catch (error) {
      console.error(`Error fetching seats info for showtime ${showtimeId}:`, error);
    } finally {
      setLoadingSeats(prev => ({ ...prev, [showtimeId]: false }));
    }
  };


  // Auto-fetch thông tin ghế cho các showtime hiện tại
  useEffect(() => {
    // Fetch thông tin ghế cho tất cả showtimes (max 10 cùng lúc để tránh quá tải)
    const batchSize = 10;
    for (let i = 0; i < showtimes.length; i += batchSize) {
      const batch = showtimes.slice(i, i + batchSize);
      batch.forEach(showtime => {
        if (showtime?.id && !seatsInfoCache[showtime.id] && !loadingSeats[showtime.id]) {
          fetchSeatsInfo(showtime.id);
        }
      });
    }
  }, [showtimes]);


  // Reset localLoading khi dữ liệu showtimes thay đổi
  useEffect(() => {
    if (localLoading) {
      console.log('Received new showtimes data, resetting localLoading state');
      setLocalLoading(false);
    }
  }, [showtimes, localLoading]);


  // Format thời gian
  const formatTime = (dateString: string | Date) => {
    try {
      // Xử lý trường hợp dateString chỉ là thời gian (không có ngày)
      if (typeof dateString === 'string') {
        // Handle epoch date pattern from backend (1970-01-01T14:00:00.000Z)
        if (dateString.startsWith('1970-01-01T')) {
          const timeMatch = dateString.match(/T(\d{2}):(\d{2}):/);
          if (timeMatch) {
            const hours = timeMatch[1];
            const minutes = timeMatch[2];
            return `${hours}:${minutes}`;
          }
        }
        
        // Kiểm tra format time-only: HH:MM hoặc HH:MM:SS
        if (dateString.match(/^\d{1,2}:\d{2}(:\d{2})?$/)) {
          const timeParts = dateString.split(':');
          const hours = timeParts[0].padStart(2, '0');
          const minutes = timeParts[1].padStart(2, '0');
          return `${hours}:${minutes}`;
        }
        
        // Nếu có chứa ngày (ISO format hoặc có 'T') - nhưng không phải epoch
        if (dateString.includes('T') || dateString.includes('-')) {
          const date = new Date(dateString);
          if (!isNaN(date.getTime())) {
            return date.toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            });
          }
        }
      }

      // Xử lý Date object
      if (dateString instanceof Date) {
        return dateString.toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
      }

      // Fallback: cố gắng parse thành Date
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
      }
      
      // Nếu tất cả đều thất bại, return string gốc hoặc '00:00'
      return typeof dateString === 'string' ? dateString : '00:00';
    } catch (error) {
      console.error('Error formatting time:', error);
      return typeof dateString === 'string' ? dateString : '00:00';
    }
  };


  // Format ngày theo định dạng mong muốn
  const formatDate = (date: Date, format: 'short' | 'full' = 'short') => {
    try {
      const options: Intl.DateTimeFormatOptions = format === 'full'
        ? {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }
        : {
          weekday: 'long',
          day: 'numeric',
          month: '2-digit',
          year: 'numeric'
        };


      return date.toLocaleDateString('vi-VN', options);
    } catch (error) {
      console.error('Error formatting date:', error);
      return date.toLocaleDateString('vi-VN');
    }
  };


  // Call onCinemaSelect when a cinema is selected
  useEffect(() => {
    if (selectedCinemaId && onCinemaSelect) {
      onCinemaSelect(selectedCinemaId);
    }
  }, [selectedCinemaId, onCinemaSelect]);


  // Function to refetch showtimes data when needed
  const refetchShowtimes = () => {
    console.log("Refetching showtimes data...");
    // Simulate a loading state
    const loadingElement = document.getElementById('showtime-loading-indicator');
    if (loadingElement) loadingElement.style.display = 'block';


    // Trigger a refresh by reloading the page
    // In a real implementation, you would call your API fetch function instead
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };


  // Lọc suất chiếu theo ngày và rạp đã chọn
  const filteredShowtimes = useMemo(() => {
    console.log('Filtering showtimes by:', {
      date: selectedDate ? formatDate(selectedDate) : 'no date',
      cinemaId: selectedCinemaId
    });


    return showtimes.filter((showtime) => {
      if (!showtime) {
        console.log('Skipping showtime: undefined or null showtime');
        return false;
      }


      if (!showtime.startTime) {
        console.log('Skipping showtime due to missing startTime:', showtime);
        return false;
      }


      try {
        // Lấy thông tin ngày từ startTime hoặc showDate
        let showtimeDate: Date;
        let showtimeDateString = '';


        if (showtime.showDate) {
          showtimeDateString = showtime.showDate;
          showtimeDate = new Date(showtime.showDate);
        } else if (typeof showtime.startTime === 'string') {
          // Kiểm tra xem startTime có chứa ngày tháng không
          if (showtime.startTime.includes('T') || showtime.startTime.includes('-')) {
            showtimeDate = new Date(showtime.startTime);
            showtimeDateString = showtime.startTime;
          } else {
            // Nếu startTime chỉ có thời gian (HH:MM:SS)
            const dateStr = selectedDate.toISOString().split('T')[0];
            showtimeDateString = `${dateStr}T${showtime.startTime}`;
            showtimeDate = new Date(showtimeDateString);
          }
        } else {
          showtimeDate = new Date(showtime.startTime);
        }


        // Kiểm tra ngày (chỉ so sánh ngày, tháng, năm)
        const isSameDate =
          showtimeDate.getDate() === selectedDate.getDate() &&
          showtimeDate.getMonth() === selectedDate.getMonth() &&
          showtimeDate.getFullYear() === selectedDate.getFullYear();


        // Kiểm tra rạp đã chọn
        const isCorrectCinema = !selectedCinemaId || selectedCinemaId === 0 ||
          Number(showtime.cinemaId) === selectedCinemaId;


        // Ghi log chi tiết về kết quả lọc
        if (isSameDate && isCorrectCinema) {
          console.log('Including showtime:', {
            id: showtime.id,
            cinemaId: showtime.cinemaId,
            cinemaName: showtime.cinemaName,
            isSameDate,
            isCorrectCinema
          });
        }


        // Chỉ trả về true nếu cả hai điều kiện đều đúng
        return isSameDate && isCorrectCinema;


      } catch (error) {
        console.error('Error processing showtime date:', error, showtime);
        return false;
      }
    });
  }, [selectedDate, selectedCinemaId, showtimes]);


  // Tất cả các ngày trong lịch chiếu
  const availableDates = useMemo(() => {
    // Set để lưu trữ ngày duy nhất
    const uniqueDates = new Set<string>();
    const result: Date[] = [];


    // Thu thập ngày từ tất cả showtimes, lọc theo rạp nếu có chọn rạp
    showtimes.forEach(st => {
      // Nếu có chọn rạp và không trùng khớp, bỏ qua
      if (selectedCinemaId && Number(st.cinemaId) !== selectedCinemaId) {
        return;
      }


      let dateStr = '';
      if (st.showDate) {
        dateStr = st.showDate.split('T')[0];
        uniqueDates.add(dateStr);
      } else if (typeof st.startTime === 'string' && st.startTime.includes('-')) {
        dateStr = st.startTime.split('T')[0].split(' ')[0];
        uniqueDates.add(dateStr);
      }
    });


    console.log(`Found ${uniqueDates.size} unique dates for cinema ID: ${selectedCinemaId || 'all'}`);


    // Chuyển đổi các chuỗi ngày thành đối tượng Date
    Array.from(uniqueDates).forEach(dateStr => {
      try {
        const dateParts = dateStr.split('-');
        const year = parseInt(dateParts[0]);
        const month = parseInt(dateParts[1]) - 1; // Tháng trong JS bắt đầu từ 0
        const day = parseInt(dateParts[2]);


        if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
          const date = new Date(year, month, day);
          result.push(date);
        }
      } catch (err) {
        console.error('Error parsing date:', dateStr, err);
      }
    });


    // Nếu không tìm thấy ngày nào, thêm 7 ngày từ ngày hiện tại
    if (result.length === 0) {
      const today = new Date();
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(today.getDate() + i);
        result.push(date);
      }
    }


    // Sắp xếp theo thứ tự thời gian
    result.sort((a, b) => a.getTime() - b.getTime());
    return result;
  }, [showtimes, selectedCinemaId]);


  // Sử dụng availableDates thay vì dates
  useEffect(() => {
    if (availableDates.length > 0) {
      setSelectedDate(availableDates[0]);
    }
  }, [availableDates]);


  // Reset the selected date when cinema selection changes
  useEffect(() => {
    if (availableDates.length > 0) {
      setSelectedDate(availableDates[0]);
    }
  }, [selectedCinemaId, availableDates]);


  // Debug logs đã được loại bỏ để tránh re-render liên tục


  // Nhóm suất chiếu theo rạp
  const showtimesByCinema = useMemo(() => {
    const result: Record<string, Showtime[]> = {};

    filteredShowtimes.forEach((showtime) => {
      const cinemaId = showtime.cinemaId;
      if (!result[cinemaId]) {
        result[cinemaId] = [];
      }
      result[cinemaId].push(showtime);
    });

    return result;
  }, [filteredShowtimes]);


  // Handle cinema selection
  const handleCinemaSelect = (cinemaId: number | null) => {
    console.log("Cinema selection changed from", selectedCinemaId, "to", cinemaId);


    // Set cinema ID trước để UI cập nhật ngay
    setSelectedCinemaId(cinemaId);


    // Fetch dữ liệu mới cho mọi thay đổi lựa chọn rạp
    if (onRefetch) {
      console.log("Fetching showtimes data for cinema:", cinemaId);
      setLocalLoading(true);


      // Truyền cinemaId để component cha có thể sử dụng trong API call
      onRefetch(cinemaId);
    }
  };


  // Xử lý khi chọn suất chiếu
  const handleSelectShowtime = (showtime: Showtime, cinema: Cinema) => {
    console.log("Đang chọn suất chiếu:", showtime);
    console.log("Rạp:", cinema);


    // Kiểm tra xem user đã đăng nhập chưa
    if (!isAuthenticated) {
      console.log("User chưa đăng nhập, hiển thị modal đăng nhập");
      // Lưu thông tin suất chiếu để sử dụng sau khi đăng nhập
      setPendingBookingData({ showtime, cinema });
      setShowAuthModal(true);
      return;
    }


    // User đã đăng nhập, proceed với booking
    proceedWithBooking(showtime, cinema);
  };


  // Xử lý booking khi đã authenticated
  const proceedWithBooking = (showtime: Showtime, cinema: Cinema) => {
    // Tạo dữ liệu đặt vé với thông tin đầy đủ
    const bookingData = {
      movie: {
        id: movieId,
        title: showtime.movieTitle || "Phim",
        posterUrl: showtime.movie?.poster || ""
      },
      theater: {
        id: cinema.Cinema_ID.toString(),
        name: cinema.Cinema_Name,
        address: cinema.Address
      },
      showtime: {
        id: showtime.id,
        showtimeId: showtime.id,
        movieId: showtime.movieId,
        theaterId: cinema.Cinema_ID.toString(),
        roomName: showtime.roomName || showtime.room?.name || "Phòng chiếu",
        startTime: showtime.startTime,
        endTime: showtime.endTime,
        format: showtime.room?.roomType || "2D",
        language: "Phụ đề Việt"
      }
    };


    // Lưu vào localStorage để không mất khi reload
    localStorage.setItem('bookingData', JSON.stringify(bookingData));
    console.log("Đã lưu bookingData:", bookingData);


    // Chuyển hướng đến trang chọn ghế
    navigate(`/booking/${showtime.id}`, { state: bookingData });
  };


  // Xử lý khi đăng nhập thành công
  const handleAuthSuccess = () => {
    console.log("Đăng nhập thành công");
    setShowAuthModal(false);

    // Nếu có pending booking data, proceed với booking
    if (pendingBookingData) {
      console.log("Proceeding với pending booking:", pendingBookingData);
      proceedWithBooking(pendingBookingData.showtime, pendingBookingData.cinema);
      setPendingBookingData(null);
    }
  };


  // Xử lý khi đóng modal auth
  const handleAuthModalClose = () => {
    setShowAuthModal(false);
    setPendingBookingData(null);
  };


  // Lấy tên rạp từ ID
  const getCinemaNameById = (cinemaId: string): string => {
    const cinema = cinemas.find(c => c.Cinema_ID.toString() === cinemaId);
    return cinema ? cinema.Cinema_Name : `Rạp ${cinemaId}`;
  };


  // Lấy thông tin rạp từ ID
  const getCinemaById = (cinemaId: number): Cinema => {
    const cinema = cinemas.find(c => c.Cinema_ID === cinemaId);
    if (cinema) return cinema;


    // Trả về rạp mặc định nếu không tìm thấy
    return {
      Cinema_ID: cinemaId,
      Cinema_Name: `Rạp ${cinemaId}`,
      Address: '',
      City: '',
      Province: '',
      Phone_Number: '',
      Email: '',
      Description: null,
      Status: 'Active',
      Created_At: new Date().toISOString(),
      Updated_At: null
    };
  };


  useEffect(() => {
    console.log('ShowtimeSection - Nhận dữ liệu mới', {
      cinemas: cinemas.length,
      showtimes: showtimes.length
    });
  }, [cinemas, showtimes]);


  // Hiển thị log cho debug
  useEffect(() => {
    console.log('ShowtimeSection filtered showtimes:', filteredShowtimes.length);
    console.log('ShowtimeSection availableDates:', availableDates.length);
  }, [filteredShowtimes, availableDates]);


  // Tải lại trang khi không tìm thấy dữ liệu
  const handleRefresh = () => {
    window.location.reload();
  };


  return (
    <>
      <div className="space-y-6">
        {/* Chọn ngày */}
        <div className="glass-dark rounded-2xl p-6 border border-gray-700/50">
          <h3 className="text-lg font-normal text-white mb-4 flex items-center">
            <CalendarIcon className="w-5 h-5 mr-2" />
            Chọn ngày
          </h3>


          <div className="flex overflow-x-auto pb-2 space-x-2">
            {availableDates.length > 0 ? (
              availableDates.map((date, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedDate(date)}
                  className={`flex flex-col items-center justify-center min-w-[80px] h-20 rounded-lg border transition-colors ${selectedDate.getDate() === date.getDate() &&
                    selectedDate.getMonth() === date.getMonth()
                    ? 'bg-[#ffd875]/20 border-[#ffd875] text-[#ffd875]'
                    : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-800'
                    }`}
                >
                  <span className="text-xs uppercase">
                    {date.toLocaleDateString('vi-VN', { weekday: 'short' })}
                  </span>
                  <span className="text-xl font-medium">{date.getDate()}</span>
                  <span className="text-xs">
                    {date.toLocaleDateString('vi-VN', { month: 'numeric' })}
                  </span>
                </button>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center w-full p-4 bg-gray-800/50 backdrop-blur-sm border border-gray-600 text-white rounded-lg">
                <p className="text-gray-400">Không tìm thấy ngày chiếu nào</p>
                <button
                  onClick={handleRefresh}
                  className="mt-2 px-4 py-2 bg-[#ffd875] text-black rounded-lg hover:bg-[#ffd875]/80 transition-all"
                >
                  Tải lại
                </button>
              </div>
            )}
          </div>
        </div>


        {/* Chọn rạp */}
        <div className="glass-dark rounded-2xl p-6 border border-gray-700/50">
          <h3 className="text-lg font-normal text-white mb-4 flex items-center">
            <MapPinIcon className="w-5 h-5 mr-2" />
            Chọn rạp
            {isLoading && <span className="ml-2"><span className="inline-block w-4 h-4 animate-spin"><svg className="w-full h-full" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg></span></span>}
          </h3>


          <div className="flex overflow-x-auto pb-2 space-x-3">
            <button
              onClick={() => handleCinemaSelect(null)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${selectedCinemaId === null
                ? 'bg-[#ffd875]/20 text-[#ffd875] border border-[#ffd875]/50'
                : 'bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700'
                }`}
            >
              Tất cả rạp
            </button>


            {cinemas.map((cinema) => (
              <button
                key={cinema.Cinema_ID}
                onClick={() => handleCinemaSelect(cinema.Cinema_ID)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${selectedCinemaId === cinema.Cinema_ID
                  ? 'bg-[#ffd875]/20 text-[#ffd875] border border-[#ffd875]/50'
                  : 'bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700'
                  }`}
              >
                {cinema.Cinema_Name}
              </button>
            ))}
          </div>
        </div>


        {/* Danh sách suất chiếu */}
        <div className="space-y-6">
          <h3 className="text-lg font-normal text-white">
            Lịch chiếu phim - {selectedDate ? formatDate(selectedDate, 'full') : ''}
          </h3>


          {isLoading ? (
            <div id="showtime-loading-indicator" className="glass-dark rounded-2xl p-8 border border-gray-700/50 text-center">
              <span className="mx-auto mb-3 block">
                <span className="inline-block w-12 h-12 animate-spin">
                  <svg className="w-full h-full" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </span>
              </span>
              <p className="text-gray-400">Đang tải thông tin suất chiếu...</p>
            </div>
          ) : Object.keys(showtimesByCinema).length > 0 ? (
            <div className="space-y-8">
              {Object.entries(showtimesByCinema).map(([cinemaId, showtimes]) => (
                <div key={cinemaId} className="glass-dark rounded-2xl p-6 border border-gray-700/50">
                  <h4 className="text-lg font-medium text-white mb-4">
                    {showtimes[0].cinemaName || getCinemaNameById(cinemaId)}
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {showtimes.map((showtime) => (
                      <button
                        key={showtime.id}
                        onClick={() => handleSelectShowtime(showtime, getCinemaById(parseInt(cinemaId)))}
                        className="glass-light p-3 rounded-lg border border-gray-700/50 hover:border-[#FFD875] transition-colors group"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-white font-medium group-hover:text-[#FFD875] transition-colors">
                            {showtime.startTime ? formatTime(showtime.startTime) : '00:00'}
                          </span>
                          <span className="text-xs px-1.5 py-0.5 rounded bg-gray-700 text-gray-300">
                            {showtime.room?.roomType || '2D'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-400">
                            {showtime.room?.name || 'Phòng chiếu'}
                          </span>
                          {(() => {
                            const seatsInfo = seatsInfoCache[showtime.id];
                            const isLoadingCurrentSeat = loadingSeats[showtime.id];

                            if (isLoadingCurrentSeat) {
                              return (
                                <span className="text-gray-400 text-xs animate-pulse">
                                  Loading...
                                </span>
                              );
                            }

                            if (seatsInfo) {
                              return (
                                <span className={`text-xs font-medium ${seatsInfo.IsSoldOut
                                    ? 'text-red-500'
                                    : seatsInfo.AvailableSeats < 10
                                      ? 'text-yellow-500'
                                      : 'text-green-500'
                                  }`}>
                                  {seatsInfo.IsSoldOut ? 'Hết vé' : seatsInfo.SeatStatus}
                                </span>
                              );
                            }

                            // Fallback to original data
                            return (
                              <span className="text-green-500">
                                {showtime.availableSeats}/{showtime.totalSeats}
                              </span>
                            );
                          })()}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-dark rounded-2xl p-8 border border-gray-700/50 text-center">
              <div className="text-5xl mb-4">🎬</div>
              <h3 className="text-xl font-medium text-white mb-2">Không có suất chiếu</h3>
              <p className="text-gray-400">
                {selectedCinemaId
                  ? "Không có suất chiếu cho phim này tại rạp đã chọn vào ngày này."
                  : "Vui lòng chọn rạp để xem lịch chiếu phim."}
              </p>
            </div>
          )}
        </div>
      </div>


      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={handleAuthModalClose}
        onSuccess={handleAuthSuccess}
        defaultTab="login"
      />
    </>
  );
};


export default ShowtimeSection;




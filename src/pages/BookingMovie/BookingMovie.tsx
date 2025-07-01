import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../config/axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Seat {
  id: string;
  row: string;
  number: number;
  status: 'available' | 'selected' | 'occupied';
  price: number;
  seatType: string;
}

interface Layout {
  Layout_ID: number;
  Cinema_Room_ID: number;
  Row_Label: string;
  Column_Number: number;
  Seat_Type: string;
  Is_Active: boolean;
  Price: number;
}

interface BookedSeat {
  seat_id: number;
  ticket_id: number;
  booking_id: number;
  user_id: number;
  username: string;
  layout_id?: number;
}

interface ShowtimeDetailsResponse {
  success: boolean;
  data: {
    Showtime_ID: number;
    Seats: any[]; // This seems to be empty in the example, relying on SeatLayouts and BookedSeats
    Movie: {
      Movie_ID: number[];
      Movie_Name: string;
      Duration: number;
      Genre: string;
      Rating: string;
      Release_Date: string | null;
      Poster_URL: string;
      Trailer_URL: string;
      Description: string;
    };
    Room: {
      Room_ID: number[];
      Room_Name: string;
      Capacity: number;
      Room_Type: string;
      Status: string;
    };
    Movie_Title: string;
    Cinema_Room: string;
    Total_Seats: number;
    Available_Seats: number;
    Booked_Seats: number;
    Pending_Seats: number;
    Showtime_Date: string;
    Showtime_Time: string;
    SeatLayouts: Layout[];
    BookedSeats: BookedSeat[];
    PendingSeats: any[];
  };
}

interface Coupon {
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
  description: string;
}

const BookingMovie: React.FC = () => {
  const [searchParams] = useSearchParams();
  const showtimeId = searchParams.get('showtimeId');
  const [showtimeDetails, setShowtimeDetails] = useState<ShowtimeDetailsResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  const initializeSeats = (details: ShowtimeDetailsResponse['data'] | null, currentSelectedSeats: string[]): Seat[] => {
    if (!details || !details.SeatLayouts) return [];

    const newSeats: Seat[] = [];
    const bookedSeatLayoutIds = new Set(details.BookedSeats.map(b => b.layout_id).filter(id => id !== undefined));
    const pendingSeatLayoutIds = new Set(details.PendingSeats.map(p => p.layout_id));

    details.SeatLayouts.forEach(layout => {
      const seatId = `${layout.Row_Label}-${layout.Column_Number}`;
      const isOccupied = bookedSeatLayoutIds.has(layout.Layout_ID);
      const isPending = pendingSeatLayoutIds.has(layout.Layout_ID);
      const isSelected = currentSelectedSeats.includes(seatId);

      let status: 'available' | 'selected' | 'occupied';
      if (isOccupied || isPending) {
        status = 'occupied';
      } else if (isSelected) {
        status = 'selected';
      } else {
        status = 'available';
      }

      newSeats.push({
        id: seatId,
        row: layout.Row_Label,
        number: layout.Column_Number,
        status: status,
        price: layout.Price,
        seatType: layout.Seat_Type,
      });
    });
    return newSeats;
  };

  useEffect(() => {
    const fetchShowtimeDetails = async () => {
      if (showtimeId) {
        try {
          const response = await api.get(`seats/showtime/${showtimeId}`);
          console.log('Fetched showtime details:', response.data);
          if (response.data.success) {
            setShowtimeDetails(response.data.data);
          } else {
            toast.error(response.data.message || 'Failed to fetch showtime details');
            setError(response.data.message || 'Failed to fetch showtime details');
          }
        } catch (err) {
          console.error('Error fetching showtime details:', err);
          toast.error('Failed to fetch showtime details');
          setError('Failed to fetch showtime details');
        } finally {
          setLoading(false);
        }
      } else {
        setError('Showtime ID is required');
        setLoading(false);
      }
    };

    fetchShowtimeDetails();
  }, [showtimeId]);

  useEffect(() => {
    if (showtimeDetails) {
      setSeats(initializeSeats(showtimeDetails, selectedSeats));
    }
  }, [showtimeDetails, selectedSeats]);

  const [currentStep, setCurrentStep] = useState<'select' | 'payment' | 'qr'>('select');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const availableCoupons: Coupon[] = [
    { code: 'DISCOUNT10', discount: 10, type: 'percentage', description: 'Giảm 10%' },
    { code: 'SAVE50K', discount: 50000, type: 'fixed', description: 'Giảm 50,000đ' },
    { code: 'VIP20', discount: 20, type: 'percentage', description: 'Giảm 20% cho ghế VIP' }
  ];

  const handleSeatClick = (seatId: string) => {
    const seat = seats.find(s => s.id === seatId);
    if (!seat || seat.status === 'occupied') return;

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(id => id !== seatId));
    } else {
      if (selectedSeats.length >= 8) {
        toast.error('Bạn chỉ có thể chọn tối đa 8 ghế.');
        return;
      }
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const applyCoupon = () => {
    const coupon = availableCoupons.find(c => c.code === couponCode.toUpperCase());
    if (coupon) {
      setAppliedCoupon(coupon);
      toast.success(`Áp dụng mã khuyến mãi thành công: ${coupon.description}`);
    } else {
      toast.error('Mã khuyến mãi không hợp lệ!');
    }
  };

  const calculateTotal = () => {
    const selectedSeatObjects = seats.filter(seat => selectedSeats.includes(seat.id));
    const subtotal = selectedSeatObjects.reduce((sum, seat) => sum + seat.price, 0);
    
    if (!appliedCoupon) return subtotal;
    
    if (appliedCoupon.type === 'percentage') {
      return subtotal - (subtotal * appliedCoupon.discount / 100);
    } else {
      return Math.max(0, subtotal - appliedCoupon.discount);
    }
  };

  const handleProceedToPayment = async () => {
    if (!showtimeDetails || !showtimeId || selectedSeats.length === 0) {
      toast.error('Vui lòng chọn ghế và đảm bảo thông tin suất chiếu đã tải.');
      return;
    }

    const layoutSeatIds = selectedSeats.map(seatId => {
      const [rowLabel, columnNumberStr] = seatId.split('-');
      const columnNumber = parseInt(columnNumberStr);
      const layout = showtimeDetails.SeatLayouts.find(
        l => l.Row_Label === rowLabel && l.Column_Number === columnNumber
      );
      return layout?.Layout_ID;
    }).filter((id): id is number => id !== undefined);

    if (layoutSeatIds.length === 0) {
      toast.error('Không tìm thấy thông tin ghế đã chọn.');
      return;
    }

    try {
      // For now, setting currentStep directly after successful API call
      // In a real scenario, you'd integrate the customer info and payment method here
      // const payload = {
      //   Showtime_ID: parseInt(showtimeId),
      //   layoutSeatIds: layoutSeatIds,
      //   customerInfo: customerInfo,
      //   totalAmount: calculateTotal(),
      //   paymentMethod: 'Not implemented yet'
      // };
      // const response = await api.post('/bookings', payload);
      
      // Simulating API call success for now:
      const response = await api.post('/bookings', {
        Showtime_ID: parseInt(showtimeId),
        layoutSeatIds: layoutSeatIds
      });

      console.log('Booking successful:', response.data);
      if (response.data.success) {
        toast.success('Đặt vé thành công! Vui lòng hoàn tất thanh toán.');
        setCurrentStep('payment'); // Transition to payment step after successful booking
      } else {
        toast.error(response.data.message || 'Đặt vé thất bại.');
      }
    } catch (err) {
      console.error('Error during booking:', err);
      toast.error('Đã xảy ra lỗi khi đặt vé. Vui lòng thử lại.');
    }
  };

  const renderSeatMap = () => {
    const seatsByRow: { [key: string]: Seat[] } = {};
    seats.forEach(seat => {
      if (!seatsByRow[seat.row]) seatsByRow[seat.row] = [];
      seatsByRow[seat.row].push(seat);
    });

    const sortedRowLabels = Object.keys(seatsByRow).sort();

    return (
      <div className="seat-map">
        <div className="screen-text">SCREEN</div>
        <div className="screen"></div>
        {sortedRowLabels.map(rowLabel => {
          const rowSeats = seatsByRow[rowLabel].sort((a, b) => a.number - b.number);
          
          return (
            <div key={rowLabel} className="seat-row">
              <span className="row-label">{rowLabel}</span>
              <div className="seats">
                {rowSeats.map(seat => (
                  <button
                    key={seat.id}
                    className={`seat ${seat.status} ${seat.seatType === 'VIP' ? 'vip' : ''}`}
                    onClick={() => handleSeatClick(seat.id)}
                    disabled={seat.status === 'occupied'}
                  >
                    {seat.status === 'selected' && <div className="selected-indicator"></div>}
                  </button>
                ))}
              </div>
              <span className="row-label">{rowLabel}</span>
            </div>
          );
        })}
        
        <div className="legend">
          <div className="legend-item">
            <div className="seat available"></div>
            <span>Regular</span>
          </div>
          <div className="legend-item">
            <div className="seat vip"></div>
            <span>VIP</span>
          </div>
          <div className="legend-item">
            <div className="seat occupied"></div>
            <span>Occupied</span>
          </div>
        </div>
      </div>
    );
  };

  const renderPaymentForm = () => (
    <div className="payment-form">
      <h3>Thông tin thanh toán</h3>
      
      <div className="customer-info">
        <h4>Thông tin khách hàng</h4>
        <input
          type="text"
          placeholder="Họ và tên"
          value={customerInfo.name}
          onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
        />
        <input
          type="email"
          placeholder="Email"
          value={customerInfo.email}
          onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
        />
        <input
          type="tel"
          placeholder="Số điện thoại"
          value={customerInfo.phone}
          onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
        />
      </div>

      <div className="coupon-section">
        <h4>Mã khuyến mãi</h4>
        <div className="coupon-input">
          <input
            type="text"
            placeholder="Nhập mã khuyến mãi"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
          />
          <button onClick={applyCoupon}>Áp dụng</button>
        </div>
        {appliedCoupon && (
          <div className="applied-coupon">
            ✓ Đã áp dụng: {appliedCoupon.description}
          </div>
        )}
      </div>

      <div className="order-summary">
        <h4>Tóm tắt đơn hàng</h4>
        <div className="selected-seats-info">
          <p>Ghế đã chọn: {selectedSeats.join(', ')}</p>
          <p>Số lượng: {selectedSeats.length} ghế</p>
        </div>
        <div className="price-breakdown">
          <div className="price-row">
            <span>Tạm tính:</span>
            <span>{seats.filter(s => selectedSeats.includes(s.id)).reduce((sum, seat) => sum + seat.price, 0).toLocaleString()}đ</span>
          </div>
          {appliedCoupon && (
            <div className="price-row discount">
              <span>Giảm giá:</span>
              <span>-{appliedCoupon.type === 'percentage' ? `${appliedCoupon.discount}%` : `${appliedCoupon.discount.toLocaleString()}đ`}</span>
            </div>
          )}
          <div className="price-row total">
            <span>Tổng cộng:</span>
            <span>{calculateTotal().toLocaleString()}đ</span>
          </div>
        </div>
      </div>

      <div className="payment-methods">
        <h4>Phương thức thanh toán</h4>
        <div className="payment-options">
          <label>
            <input type="radio" name="payment" value="card" defaultChecked />
            Thẻ tín dụng/ghi nợ
          </label>
          <label>
            <input type="radio" name="payment" value="banking" />
            Chuyển khoản ngân hàng
          </label>
          <label>
            <input type="radio" name="payment" value="ewallet" />
            Ví điện tử
          </label>
        </div>
      </div>
    </div>
  );

  const renderQRCode = () => (
    <div className="qr-section">
      <h3>Quét mã QR để thanh toán</h3>
      <div className="qr-code">
        <div className="qr-placeholder">
          <p>QR CODE</p>
          <p>Tổng tiền: {calculateTotal().toLocaleString()}đ</p>
        </div>
      </div>
      <p>Quét mã QR bằng ứng dụng ngân hàng để thanh toán</p>
      <button onClick={() => toast.success('Thanh toán thành công!')}>
        Xác nhận đã thanh toán
      </button>
    </div>
  );

  if (loading) {
    return <div className="cinema-booking">Loading seat layout...</div>;
  }

  if (error) {
    return null;
  }

  return (
    <>
      <ToastContainer />
      <style>{`
        .cinema-booking {
          width: 100vw;
          min-height: 100vh;
          padding: 20px;
          font-family: Arial, sans-serif;
          background: radial-gradient(circle at center, rgba(255, 215, 0, 0.15) 0%, rgba(0, 0, 0, 1) 80%);
          background-size: 200% 200%;
          animation: backgroundAnimate 15s ease infinite alternate;
          display: flex;
          flex-direction: column;
          align-items: center;
          box-sizing: border-box;
        }

        @keyframes backgroundAnimate {
          0% { background-position: 0% 0%; }
          100% { background-position: 100% 100%; }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.7s ease-out forwards;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .screen-text {
          color: #FFD700;
          font-size: 1.5em;
          font-weight: bold;
          text-align: center;
          margin-bottom: 20px;
          letter-spacing: 5px;
          text-transform: uppercase;
        }

        .booking-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .booking-header h2 {
          color: #FFD700;
          margin-bottom: 20px;
          font-size: 2.5em;
          text-transform: uppercase;
          letter-spacing: 2px;
        }

        .steps {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 50px;
          position: relative;
          width: 80%;
          margin-left: auto;
          margin-right: auto;
        }

        .steps::before {
          content: '';
          position: absolute;
          top: 17px;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, #FFD700, #000000, #FFD700);
          background-size: 200% 100%;
          animation: progressFlow 4s linear infinite;
          z-index: 0;
        }

        @keyframes progressFlow {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .step {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          position: relative;
          z-index: 1;
          flex: 1;
          transition: transform 0.3s ease, color 0.3s ease;
        }

        .step-circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #000000;
          border: 2px solid #FFD700;
          display: flex;
          justify-content: center;
          align-items: center;
          color: #FFD700;
          font-size: 18px;
          transition: all 0.4s ease;
          position: relative;
        }

        .step:nth-child(1) .step-circle::before { content: '1'; }
        .step:nth-child(2) .step-circle::before { content: '2'; }
        .step:nth-child(3) .step-circle::before { content: '3'; }

        .step-text {
          color: #FFD700;
          margin-top: 15px;
          font-size: 16px;
          white-space: nowrap;
          transition: color 0.3s ease;
        }

        .step.active .step-circle {
          background: #FFD700;
          color: #000000;
          box-shadow: 0 0 15px rgba(255, 215, 0, 0.7);
          transform: scale(1.1);
        }

        .step.active .step-circle::before {
          /* content: ''; */ /* Xóa dòng này để số bước hiển thị */
        }

        .step.completed .step-circle {
          background: #FFD700;
          color: #000000;
          transform: scale(1.05);
        }

        .step.completed .step-circle::before {
          content: '✔';
          font-weight: bold;
        }

        .spinner {
          width: 28px;
          height: 28px;
          border: 4px solid rgba(255, 215, 0, 0.2);
          border-top: 4px solid #FFD700;
          border-right: 4px solid transparent;
          border-bottom: 4px solid transparent;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .seat-selection {
          display: flex;
          justify-content: center;
          align-items: stretch;
          gap: 30px;
          flex-wrap: wrap;
        }

        .seat-map {
          background: #000000;
          padding: 40px 20px;
          border-radius: 10px;
          width: 1200px;
          border: 2px solid #FFD700;
        }

        .screen {
          background: linear-gradient(90deg, #FFD700, #000000, #FFD700);
          background-size: 200% 100%;
          animation: flowLight 4s linear infinite;

          height: 12px;
          margin: 0 auto 120px auto;
          width: 85%;
          border-radius: 50% / 100% 100% 0 0;
          transform: perspective(600px) rotateX(50deg) translateZ(15px);
          transform-style: preserve-3d;
          box-shadow: 0 15px 30px rgba(0,0,0,0.4), 0 8px 15px rgba(0,0,0,0.2), inset 0 2px 4px rgba(255,255,255,0.3);
          position: relative;
          border: 1px solid #FFD700;
        }

        .screen::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%) perspective(200px) rotateX(10deg);
          transform-origin: center top;
          width: 130%;
          height: 190px;
          background: radial-gradient(ellipse at center, rgba(255, 215, 0, 0.3) 0%, transparent 70%);
          filter: blur(15px);
          opacity: 1;
          animation: projectLight 4s ease-in-out infinite alternate;
          pointer-events: none;
          z-index: -1;
        }

        @keyframes projectLight {
          0% { opacity: 1; transform: translateX(-50%) perspective(200px) rotateX(10deg) scale(1, 1); }
          100% { opacity: 1.2; transform: translateX(-50%) perspective(200px) rotateX(10deg) scale(1.05, 1.05); }
        }

        @keyframes flowLight {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .seat-row {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 15px;
          gap: 20px;
        }

        .row-label {
          color: #FFD700;
          width: 20px;
          text-align: center;
          font-weight: normal;
          font-size: 16px;
          background: none;
          border: none;
        }

        .seats {
          display: flex;
          gap: 10px;
          justify-content: center;
        }

        .seat {
          width: 36px;
          height: 32px;
          border: none;
          border-radius: 8px 8px 4px 4px;
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.2s ease;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .selected-indicator {
          width: 15px;
          height: 15px;
          background-color: transparent; /* Xóa màu nền */
          border: 2px solid #FFF; /* Thêm viền trắng */
          border-radius: 50%;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .seat::before {
          content: '';
          position: absolute;
          top: -8px;
          left: 4px;
          right: 4px;
          height: 12px;
          border-radius: 8px 8px 4px 4px;
          background: inherit;
        }

        .seat.available {
          background: #007bff; /* Màu xanh nước biển cho ghế Regular có sẵn */
        }

        .seat.available::before {
          background: #007bff;
        }

        .seat.available:hover {
          /* background: #888; */ /* Xóa màu nền khi hover */
          transform: scale(1.05);
        }

        .seat.selected {
          background: #28a745; /* Màu xanh lá cây cho ghế đã chọn */
          transform: scale(1.05);
        }

        .seat.selected::before {
          background: #28a745;
        }

        .seat.selected:hover {
          /* background: #888; */ /* Xóa màu nền khi hover */
          transform: scale(1.05);
        }

        .seat.occupied {
          background: #555;
          cursor: not-allowed;
        }

        .seat.occupied::before {
          background: #555;
        }

        .seat.vip {
          background: #FF0000; /* Màu đỏ cho ghế VIP */
        }

        .seat.vip::before {
          background: #FF0000;
        }

        .seat.vip.selected {
          background: #28a745; /* Ghế VIP đã chọn sẽ có màu xanh lá cây */
        }

        .seat.vip.selected::before {
          background: #28a745;
        }

        .seat.vip:hover {
          /* background: #888; */ /* Xóa màu nền khi hover */
          transform: scale(1.05);
        }

        .legend {
          display: flex;
          justify-content: center;
          gap: 30px;
          margin-top: 40px;
          padding-top: 20px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #FFD700;
          font-size: 14px;
        }

        .legend-item .seat {
          width: 24px;
          height: 20px;
          cursor: default;
          transform: none;
        }

        .legend-item .seat::before {
          top: -6px;
          height: 8px;
        }

        .selection-summary {
          text-align: center;
          padding: 30px;
          background: #1a1a1a;
          border-radius: 10px;
          color: #FFD700;
          border: 1px solid #FFD700;
          box-shadow: 0 0 20px rgba(255, 215, 0, 0.4);
          width: 350px;
          flex-shrink: 0;
        }

        .selection-summary p {
          margin: 15px 0;
          font-size: 20px;
          font-weight: bold;
        }

        .next-btn {
          background: linear-gradient(90deg, #FFD700, #FFC000);
          color: #000000;
          border: none;
          padding: 15px 40px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 18px;
          margin-top: 20px;
          font-weight: bold;
          transition: all 0.4s ease;
          box-shadow: 0 5px 15px rgba(255, 215, 0, 0.4);
        }

        .next-btn:disabled {
          background: #666;
          cursor: not-allowed;
          box-shadow: none;
        }

        .next-btn:hover:not(:disabled) {
          background: linear-gradient(90deg, #FFC000, #FFD700);
          transform: scale(1.08);
          box-shadow: 0 8px 25px rgba(255, 215, 0, 0.6);
        }

        .payment-form {
          max-width: 600px;
          margin: 0 auto;
          background: #1a1a1a;
          padding: 30px;
          border-radius: 10px;
          border: 2px solid #FFD700;
        }

        .payment-form h3, .payment-form h4 {
          color: #FFD700;
          margin-bottom: 15px;
        }

        .customer-info {
          margin-bottom: 30px;
        }

        .customer-info input {
          width: 100%;
          padding: 12px;
          margin-bottom: 15px;
          border: 1px solid #FFD700;
          border-radius: 5px;
          font-size: 16px;
          box-sizing: border-box;
          background: #000000;
          color: #FFD700;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }

        .customer-info input:focus {
          outline: none;
          border-color: #FFD700;
          box-shadow: 0 0 10px rgba(255, 215, 0, 0.6);
        }

        .customer-info input::placeholder {
          color: #FFD70080;
        }

        .coupon-section {
          margin-bottom: 30px;
        }

        .coupon-input {
          display: flex;
          gap: 10px;
          margin-bottom: 10px;
        }

        .coupon-input input {
          flex: 1;
          padding: 12px;
          border: 1px solid #FFD700;
          border-radius: 5px;
          background: #000000;
          color: #FFD700;
        }

        .coupon-input button {
          padding: 12px 20px;
          background: #FFD700;
          color: #000000;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-weight: bold;
          transition: all 0.3s ease;
        }

        .coupon-input button:hover {
          background: #FFC000;
          transform: scale(1.05);
        }

        .applied-coupon {
          color: #FFD700;
          font-weight: bold;
        }

        .order-summary {
          background: #000000;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
          border: 1px solid #FFD700;
        }

        .selected-seats-info p {
          margin: 5px 0;
          color: #FFD700;
        }

        .price-breakdown {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid #FFD700;
        }

        .price-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          color: #FFD700;
        }

        .price-row.discount {
          color: #FFD700;
        }

        .price-row.total {
          font-weight: bold;
          font-size: 18px;
          padding-top: 10px;
          border-top: 1px solid #FFD700;
          color: #FFD700;
        }

        .payment-methods {
          margin-bottom: 30px;
        }

        .payment-options {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .payment-options label {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px;
          border: 1px solid #FFD700;
          border-radius: 5px;
          cursor: pointer;
          color: #FFD700;
        }

        .payment-options label:hover {
          background: #000000;
        }

        .payment-actions {
          display: flex;
          justify-content: space-between;
          gap: 20px;
        }

        .payment-actions button {
          flex: 1;
          padding: 12px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.3s ease;
        }

        .payment-actions button:first-child {
          background: #1a1a1a;
          color: #FFD700;
          border: 1px solid #FFD700;
        }

        .payment-actions button:first-child:hover {
          background: #000000;
          transform: scale(1.05);
        }

        .qr-section {
          text-align: center;
          max-width: 400px;
          margin: 0 auto;
          background: #1a1a1a;
          padding: 30px;
          border-radius: 10px;
          border: 2px solid #FFD700;
        }

        .qr-section h3 {
          color: #FFD700;
          margin-bottom: 15px;
        }

        .qr-code {
          margin: 30px 0;
        }

        .qr-placeholder {
          width: 200px;
          height: 200px;
          border: 2px solid #FFD700;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #000000;
          color: #FFD700;
        }

        .qr-section button {
          background: #FFD700;
          color: #000000;
          border: none;
          padding: 12px 30px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 16px;
          margin-top: 20px;
          font-weight: bold;
          transition: all 0.3s ease;
        }

        .qr-section button:hover {
          background: #FFC000;
          transform: scale(1.05);
        }

        @media (max-width: 768px) {
          .seat {
            width: 32px;
            height: 28px;
          }
          
          .seat::before {
            height: 10px;
            top: -6px;
          }
          
          .seats {
            gap: 8px;
          }
          
          .seat-row {
            gap: 15px;
          }
        }

        .step.active .step-text {
          color: #FFD700;
          text-shadow: 0 0 8px rgba(255, 215, 0, 0.8);
        }

        .step.completed .step-text {
          color: #FFD700;
          text-shadow: 0 0 8px rgba(255, 215, 0, 0.6);
        }
      `}</style>

      <div className="cinema-booking">
        <div className="booking-header">
          <h2>Cinema Seat Booking</h2>
          <div className="steps">
            <div className={`step ${currentStep === 'select' ? 'active' : ''} ${currentStep === 'payment' || currentStep === 'qr' ? 'completed' : ''}`}>
              <div className="step-circle">
                {/* {currentStep === 'select' && <span className="spinner"></span>} */}
              </div>
              <span className="step-text">Chọn ghế</span>
            </div>
            <div className={`step ${currentStep === 'payment' ? 'active' : ''} ${currentStep === 'qr' ? 'completed' : ''}`}>
              <div className="step-circle">
                {/* {currentStep === 'payment' && <span className="spinner"></span>} */}
              </div>
              <span className="step-text">Thanh toán</span>
            </div>
            <div className={`step ${currentStep === 'qr' ? 'active' : ''}`}>
              <div className="step-circle">
                {/* {currentStep === 'qr' && <span className="spinner"></span>} */}
              </div>
              <span className="step-text">QR Code</span>
            </div>
          </div>
        </div>

        <div className="booking-content">
          {currentStep === 'select' && (
            <div className="seat-selection animate-fade-in-up">
              {renderSeatMap()}
              <div className="selection-summary">
                <p>Đã chọn: {selectedSeats.length} ghế</p>
                <p>Ghế đã chọn: {selectedSeats.join(', ')}</p>
                <p>Tổng tiền: {seats.filter(s => selectedSeats.includes(s.id)).reduce((sum, seat) => sum + seat.price, 0).toLocaleString()}đ</p>
                <button 
                  className="next-btn"
                  disabled={selectedSeats.length === 0}
                  onClick={handleProceedToPayment}
                >
                  Tiếp tục
                </button>
              </div>
            </div>
          )}

          {currentStep === 'payment' && (
            <div className="payment-section animate-fade-in-up">
              {renderPaymentForm()}
              <div className="payment-actions">
                <button onClick={() => setCurrentStep('select')}>Quay lại</button>
                <button 
                  className="next-btn"
                  onClick={() => setCurrentStep('qr')}
                >
                  Thanh toán
                </button>
              </div>
            </div>
          )}

          {currentStep === 'qr' && (
            <div className="qr-payment animate-fade-in-up">
              {renderQRCode()}
              <button onClick={() => setCurrentStep('payment')}>Quay lại</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BookingMovie;

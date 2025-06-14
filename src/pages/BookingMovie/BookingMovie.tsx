import React, { useState } from 'react';

interface Seat {
  id: string;
  row: number;
  number: number;
  status: 'available' | 'selected' | 'occupied';
  price: number;
}

interface Coupon {
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
  description: string;
}

const BookingMovie: React.FC = () => {
  // Khởi tạo dữ liệu ghế theo layout
  const initializeSeats = (): Seat[] => {
    const seats: Seat[] = [];
    const seatLayout = [9, 9, 7, 7, 11, 11, 11]; // Số ghế mỗi hàng
    
    for (let row = 1; row <= 7; row++) {
      const seatsInRow = seatLayout[row - 1];
      
      for (let seat = 1; seat <= seatsInRow; seat++) {
        const seatId = `${row}-${seat}`;
        let status: 'available' | 'occupied' = 'available';
        let price = 100000;
        
        // Set một số ghế đã được đặt (màu đen)
        if ((row === 2 && (seat === 4 || seat === 5)) || 
            (row === 3 && (seat === 3 || seat === 4 || seat === 5)) ||
            (row === 4 && (seat === 2 || seat === 3 || seat === 4 || seat === 5 || seat === 6)) ||
            (row === 5 && (seat === 4 || seat === 5 || seat === 8 || seat === 9)) ||
            (row === 6 && (seat === 4 || seat === 5 || seat === 6 || seat === 7 || seat === 8))) {
          status = 'occupied';
        }
        
        seats.push({
          id: seatId,
          row,
          number: seat,
          status,
          price
        });
      }
    }
    return seats;
  };

  const [seats, setSeats] = useState<Seat[]>(initializeSeats());
  const [selectedSeats, setSelectedSeats] = useState<string[]>(['5-6', '5-7']); // Ghế màu cam
  const [currentStep, setCurrentStep] = useState<'select' | 'payment' | 'qr'>('select');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });

  // Set ghế đã chọn ban đầu
  React.useEffect(() => {
    setSeats(prevSeats => 
      prevSeats.map(seat => 
        selectedSeats.includes(seat.id) ? { ...seat, status: 'selected' } : seat
      )
    );
  }, []);

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
      setSeats(seats.map(s => 
        s.id === seatId ? { ...s, status: 'available' } : s
      ));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
      setSeats(seats.map(s => 
        s.id === seatId ? { ...s, status: 'selected' } : s
      ));
    }
  };

  const applyCoupon = () => {
    const coupon = availableCoupons.find(c => c.code === couponCode.toUpperCase());
    if (coupon) {
      setAppliedCoupon(coupon);
      alert(`Áp dụng mã khuyến mãi thành công: ${coupon.description}`);
    } else {
      alert('Mã khuyến mãi không hợp lệ!');
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

  const renderSeatMap = () => {
    const seatsByRow: { [key: number]: Seat[] } = {};
    seats.forEach(seat => {
      if (!seatsByRow[seat.row]) seatsByRow[seat.row] = [];
      seatsByRow[seat.row].push(seat);
    });

    return (
      <div className="seat-map">
        <div className="screen"></div>
        {Object.keys(seatsByRow).map(rowNum => {
          const row = parseInt(rowNum);
          const rowSeats = seatsByRow[row].sort((a, b) => a.number - b.number);
          
          return (
            <div key={row} className="seat-row">
              <span className="row-label">{row}</span>
              <div className="seats">
                {rowSeats.map(seat => (
                  <button
                    key={seat.id}
                    className={`seat ${seat.status}`}
                    onClick={() => handleSeatClick(seat.id)}
                    disabled={seat.status === 'occupied'}
                  >
                  </button>
                ))}
              </div>
              <span className="row-label">{row}</span>
            </div>
          );
        })}
        
        <div className="legend">
          <div className="legend-item">
            <div className="seat available"></div>
            <span>Available</span>
          </div>
          <div className="legend-item">
            <div className="seat selected"></div>
            <span>Selected</span>
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
      <button onClick={() => alert('Thanh toán thành công!')}>
        Xác nhận đã thanh toán
      </button>
    </div>
  );

  return (
    <>
      <style>{`
        .cinema-booking {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: Arial, sans-serif;
          background: #4a4a4a;
          min-height: 100vh;
        }

        .booking-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .booking-header h2 {
          color: #fff;
          margin-bottom: 20px;
        }

        .steps {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-bottom: 20px;
        }

        .step {
          padding: 10px 20px;
          background: #666;
          border-radius: 5px;
          color: #ccc;
        }

        .step.active {
          background: #007bff;
          color: white;
        }

        /* Seat Map Styles - Cập nhật theo ảnh mới */
        .seat-map {
          background: #4a4a4a;
          padding: 40px 20px;
          border-radius: 10px;
          margin-bottom: 20px;
        }

        /* Màn hình cong vừa phải */
        .screen {
  background: linear-gradient(to bottom, 
    #e8e8e8 0%, 
    #d0d0d0 20%, 
    #b8b8b8 50%, 
    #a0a0a0 80%, 
    #888888 100%
  );
  height: 12px;
  margin: 0 auto 50px auto;
  width: 85%;
  
  /* Tạo hình ellipse để cong toàn bộ */
  border-radius: 50% / 100% 100% 0 0;
  
  /* Transform để tạo hiệu ứng 3D */
  transform: 
    perspective(600px) 
    rotateX(50deg) 
    translateZ(15px);
  
  transform-style: preserve-3d;
  
  box-shadow: 
    0 15px 30px rgba(0,0,0,0.4),
    0 8px 15px rgba(0,0,0,0.2),
    inset 0 2px 4px rgba(255,255,255,0.3);
  
  position: relative;
  border: 1px solid #999;
}


        .seat-row {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 15px;
          gap: 20px;
        }

        /* Số hàng không có khung, chỉ text xám nhạt */
        .row-label {
          color: #999;
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

        /* Hình dạng ghế giống ảnh mới - có lưng tựa cao */
        .seat {
          width: 36px;
          height: 32px;
          border: none;
          border-radius: 8px 8px 4px 4px;
          cursor: pointer;
          font-size: 0;
          transition: all 0.2s ease;
          position: relative;
        }

        /* Tạo phần lưng tựa ghế */
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

        /* Ghế trống - màu xám nhạt */
        .seat.available {
          background: #a8a8a8;
        }

        .seat.available::before {
          background: #a8a8a8;
        }

        .seat.available:hover {
          background: #b8b8b8;
          transform: scale(1.05);
        }

        .seat.available:hover::before {
          background: #b8b8b8;
        }

        /* Ghế đang chọn - màu cam */
        .seat.selected {
          background: #ff8c00;
          transform: scale(1.05);
        }

        .seat.selected::before {
          background: #ff8c00;
        }

        /* Ghế đã đặt - màu xám đậm */
        .seat.occupied {
          background: #555;
          cursor: not-allowed;
        }

        .seat.occupied::before {
          background: #555;
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
          color: #999;
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

        /* Selection Summary */
        .selection-summary {
          text-align: center;
          padding: 20px;
          background: #5a5a5a;
          border-radius: 8px;
          color: #fff;
        }

        .selection-summary p {
          margin: 10px 0;
          font-size: 18px;
        }

        .next-btn {
          background: #28a745;
          color: white;
          border: none;
          padding: 12px 30px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 16px;
          margin-top: 10px;
        }

        .next-btn:disabled {
          background: #666;
          cursor: not-allowed;
        }

        .next-btn:hover:not(:disabled) {
          background: #218838;
        }

        /* Payment Form Styles */
        .payment-form {
          max-width: 600px;
          margin: 0 auto;
          background: #fff;
          padding: 30px;
          border-radius: 10px;
        }

        .payment-form h3, .payment-form h4 {
          color: #333;
          margin-bottom: 15px;
        }

        .customer-info {
          margin-bottom: 30px;
        }

        .customer-info input {
          width: 100%;
          padding: 12px;
          margin-bottom: 15px;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 16px;
          box-sizing: border-box;
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
          border: 1px solid #ddd;
          border-radius: 5px;
        }

        .coupon-input button {
          padding: 12px 20px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }

        .coupon-input button:hover {
          background: #0056b3;
        }

        .applied-coupon {
          color: #28a745;
          font-weight: bold;
        }

        .order-summary {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
        }

        .selected-seats-info p {
          margin: 5px 0;
        }

        .price-breakdown {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid #ddd;
        }

        .price-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .price-row.discount {
          color: #28a745;
        }

        .price-row.total {
          font-weight: bold;
          font-size: 18px;
          padding-top: 10px;
          border-top: 1px solid #ddd;
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
          border: 1px solid #ddd;
          border-radius: 5px;
          cursor: pointer;
        }

        .payment-options label:hover {
          background: #f8f9fa;
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
        }

        .payment-actions button:first-child {
          background: #6c757d;
          color: white;
        }

        .payment-actions button:first-child:hover {
          background: #545b62;
        }

        /* QR Code Styles */
        .qr-section {
          text-align: center;
          max-width: 400px;
          margin: 0 auto;
          background: #fff;
          padding: 30px;
          border-radius: 10px;
        }

        .qr-section h3 {
          color: #333;
          margin-bottom: 15px;
        }

        .qr-code {
          margin: 30px 0;
        }

        .qr-placeholder {
          width: 200px;
          height: 200px;
          border: 2px solid #333;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #f8f9fa;
        }

        .qr-section button {
          background: #28a745;
          color: white;
          border: none;
          padding: 12px 30px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 16px;
          margin-top: 20px;
        }

        .qr-section button:hover {
          background: #218838;
        }

        /* Responsive */
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
      `}</style>

      <div className="cinema-booking">
        <div className="booking-header">
          <h2>Cinema Seat Booking</h2>
          <div className="steps">
            <div className={`step ${currentStep === 'select' ? 'active' : ''}`}>
              1. Chọn ghế
            </div>
            <div className={`step ${currentStep === 'payment' ? 'active' : ''}`}>
              2. Thanh toán
            </div>
            <div className={`step ${currentStep === 'qr' ? 'active' : ''}`}>
              3. QR Code
            </div>
          </div>
        </div>

        <div className="booking-content">
          {currentStep === 'select' && (
            <div className="seat-selection">
              {renderSeatMap()}
              <div className="selection-summary">
                <p>Đã chọn: {selectedSeats.length} ghế</p>
                <p>Tổng tiền: {seats.filter(s => selectedSeats.includes(s.id)).reduce((sum, seat) => sum + seat.price, 0).toLocaleString()}đ</p>
                <button 
                  className="next-btn"
                  disabled={selectedSeats.length === 0}
                  onClick={() => setCurrentStep('payment')}
                >
                  Tiếp tục
                </button>
              </div>
            </div>
          )}

          {currentStep === 'payment' && (
            <div className="payment-section">
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
            <div className="qr-payment">
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

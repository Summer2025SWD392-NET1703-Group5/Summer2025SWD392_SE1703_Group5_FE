import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import SeatSelection from "../components/SeatSelection";

const SeatSelectionPage: React.FC = () => {
  const { showtimeId } = useParams<{ showtimeId: string }>();
  const navigate = useNavigate();

  if (!showtimeId) {
    navigate("/");
    return null;
  }

  // Mock data for the component - in real app this would come from API/context
  const mockRoom = {
    id: "1",
    name: "Phòng 1",
    rows: 10,
    seatsPerRow: 12,
    totalSeats: 120,
  };

  const mockBookingSession = {
    step: 1,
    selectedSeats: [],
    totalPrice: 0,
    showtimeId,
  };

  const mockBookingSteps = [
    { id: 1, name: "seats", title: "Chọn ghế", completed: false, active: true },
    { id: 2, name: "payment", title: "Thanh toán", completed: false, active: false },
    { id: 3, name: "confirmation", title: "Xác nhận", completed: false, active: false },
  ];

  const handleSeatsChange = (seats: any[]) => {
    console.log("Seats changed:", seats);
  };

  const handleNext = () => {
    // Chuyển đến BookingPage với payment view
    navigate(`/booking/${showtimeId}`, {
      state: { showPaymentView: true },
    });
  };

  const handleBack = () => {
    navigate(`/booking/${showtimeId}`);
  };

  return (
    <SeatSelection
      room={mockRoom}
      onSeatsChange={handleSeatsChange}
      onNext={handleNext}
      onBack={handleBack}
      bookingSession={mockBookingSession}
      bookingSteps={mockBookingSteps}
      currentStep={1}
    />
  );
};

export default SeatSelectionPage;
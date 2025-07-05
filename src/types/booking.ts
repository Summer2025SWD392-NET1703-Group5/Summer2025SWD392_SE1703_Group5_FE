// types/booking.ts
export interface Seat {
  id: string;
  row: string;
  number: number;
  type: 'regular' | 'vip' | 'couple' | 'wheelchair';
  status: 'available' | 'occupied' | 'selected' | 'blocked';
  price: number;
  position: {
    x: number;
    y: number;
  };
}

export interface CinemaRoom {
  id: string;
  name: string;
  type: 'standard' | 'premium' | 'imax';
  totalSeats: number;
  rows: number;
  seatsPerRow: number[];
  layout: Seat[][];
  screenPosition: 'front' | 'center';
}

export interface BookingStep {
  id: number;
  name: string;
  title: string;
  completed: boolean;
  active: boolean;
}

export interface BookingSession {
  id: string;
  movieId: string;
  cinemaId: string;
  showtimeId: string;
  selectedSeats: Seat[];
  totalPrice: number;
  expiresAt: Date;
  step: number;
  movieDetails?: {
    title: string;
    poster: string;
    duration: number;
    rating?: string;
    genre?: string;
  };
  movieTitle?: string;
  bookingId?: string;
  discount?: number;
}

/**
 * Interface for a single booking item in the user's booking history.
 * Based on the response from the `GET /api/bookings/my-bookings` endpoint.
 */
export type Booking = {
  Booking_ID: number;
  Booking_Date: string;
  Payment_Deadline: string;
  Total_Amount: number;
  Status: string;
  Seats: string;
  MovieName: string;
  RoomName: string;
  Show_Date: string;
  Start_Time: string;
  PaymentMethod: string;
  PosterURL: string | null;
};

/**
 * Interface for API response when creating or manipulating bookings
 * Used by bookingService.ts
 */
export interface BookingResponse {
  id?: string;
  showtimeId?: string;
  userId?: string;
  status?: string;
  totalPrice?: number;
  seats?: Array<any>;
  discount?: number;
  createdAt?: string;
  // Thêm trường success và booking để phù hợp với API trả về
  success?: boolean;
  booking?: {
    Booking_ID: number;
    User_ID: number;
    Showtime_ID: number;
    Movie_Name: string;
    Show_Date: string;
    Start_Time: string;
    Room_Name: string;
    Seats: Array<any>;
    Total_Amount: number;
    Payment_Deadline: string;
    Status: string;
    Payment_Method: any;
  };
  message?: string;
  // ...other fields
}
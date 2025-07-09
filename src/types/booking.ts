// types/booking.ts

// Backend model-based interfaces
export interface Seat {
  Seat_ID: number;
  Layout_ID: number;
  Seat_Number: string;
  Is_Active: boolean;
  // Frontend-specific properties
  id?: string;
  row?: string;
  number?: number;
  type?: 'regular' | 'standard' | 'vip' | 'couple' | 'wheelchair'; // Added 'standard' for backend compatibility
  status?: 'available' | 'occupied' | 'selected' | 'blocked' | 'selecting' | 'maintenance' | 'hidden'; // Added more statuses
  price?: number;
  position?: {
    x: number;
    y: number;
  };
  // Additional backwards compatibility
  seatId?: string; // Alternative id field
  userId?: string; // For user assignment in WebSocket
}

export interface CinemaRoom {
  Cinema_Room_ID: number;
  Room_Name: string;
  Seat_Quantity: number;
  Room_Type: string;
  Status: string;
  Notes?: string;
  Cinema_ID: number;
  // Frontend-specific properties
  id?: string;
  name?: string;
  type?: 'standard' | 'premium' | 'imax';
  totalSeats?: number;
  rows?: number;
  seatsPerRow?: number[];
  layout?: Seat[][];
  screenPosition?: 'front' | 'center';
}

/**
 * Interface for a TicketBooking entity based on backend model
 */
export interface TicketBooking {
  Booking_ID: number;
  User_ID?: number;
  Showtime_ID: number;
  Promotion_ID?: number;
  Booking_Date: string; // ISO date string
  Payment_Deadline: string; // ISO date string
  Total_Amount: number;
  Points_Earned: number;
  Points_Used: number;
  Status: string;
  Created_By: number;
}

/**
 * Interface for a Ticket entity based on backend model
 */
export interface Ticket {
  Ticket_ID: number;
  Booking_ID: number;
  Seat_ID: number;
  Showtime_ID: number;
  Base_Price: number;
  Discount_Amount: number;
  Final_Price: number;
  Ticket_Code: string;
  Is_Checked_In: boolean;
  Check_In_Time?: string; // ISO date string
  Status?: string;
}

/**
 * Interface for Payment entity based on backend model
 */
export interface Payment {
  Payment_ID: number;
  Booking_ID: number;
  Amount: number;
  Payment_Method: string;
  Payment_Reference?: string;
  Transaction_Date?: string; // ISO date string
  Payment_Status: string;
  Processor_Response?: string;
  Processed_By?: number;
}

/**
 * Interface for SeatLayout entity based on backend model
 */
export interface SeatLayout {
  Layout_ID: number;
  Cinema_Room_ID: number;
  Row_Label: string;
  Column_Number: number;
  Seat_Type: string;
  Is_Active: boolean;
}

// Frontend-specific interfaces
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
  // Additional backwards compatibility
  discount_amount?: number; // For promotion discounts
  // ...other fields
}

// Missing interface for booking with details
export interface BookingWithDetails {
  id: string;
  bookingId: string;
  bookingCode: string; // Added for admin components
  movieTitle: string;
  moviePoster: string;
  showDate: string;
  startTime: string;
  cinemaName: string;
  roomName: string;
  seats: Array<{
    id: string;
    row: string;
    number: string;
    type: string;
    price: number;
  }>;
  totalAmount: number;
  finalAmount: number; // Added for admin components
  discountAmount: number; // Added for admin components
  bookingStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string; // Added for admin components
  usedAt?: string; // Added for admin components
  cancelledAt?: string; // Added for admin components
  refundedAt?: string; // Added for admin components
  notes?: string; // Added for admin components
  concessions: Array<{
    name: string;
    quantity: number;
    price: number;
    totalPrice: number;
  }>;
  // User info for admin components
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  // Showtime info for admin components
  showtime: {
    movie: {
      title: string;
      poster: string;
      duration: number;
    };
    startTime: string;
    endTime: string;
    cinema: {
      name: string;
    };
    room: {
      name: string;
    };
  };
}
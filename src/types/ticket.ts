/**
 * Backend Ticket model interface based on actual database structure
 */
export interface TicketModel {
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
 * Frontend Ticket interface (adapted for QR scanning and display)
 */
export interface Ticket {
    ticketCode: string;
    bookingId: string;
    movieTitle: string;
    showtime: string;
    cinemaName: string;
    roomName: string;
    seatNumber: string;
    customerName: string;
    customerPhone: string;
    price: number;
    status: 'VALID' | 'USED' | 'EXPIRED' | 'INVALID';
    bookingDate: string;
    showDate: string;
    scanTime?: string;
    staffName?: string;
}

export interface BookingInfo {
    bookingId: string;
    customerName: string;
    customerPhone: string;
    movieTitle: string;
    showtime: string;
    cinemaName: string;
    roomName: string;
    seats: string[];
    totalPrice: number;
    bookingDate: string;
    status: string;
    tickets: Ticket[];
}

export interface ScanResult {
    success: boolean;
    message: string;
    alreadyScanned?: boolean;
    ticket?: {
        id: string;
        code: string;
        movieTitle: string;
        showtime: string;
        seatNumber: string;
        customerName: string;
        status: string;
        customerPhone?: string;
        ticketCode?: string;
        cinemaName?: string;
        roomName?: string;
        bookingDate?: string;
        scanTime?: string;
        staffName?: string;
        price?: number;
        duration?: number;
    };
}

export interface ScanListItem {
    ticketCode: string;
    movieTitle: string;
    customerName: string;
    seatNumber: string;
    scanTime: string;
    status: string;
}

export interface PendingTicket {
    ticketCode: string;
    movieTitle: string;
    customerName: string;
    seatNumber: string;
    showtime: string;
    status: string;
} 
// types/cinema.ts
export type SeatType = 'standard' | 'vip' | 'couple' | 'disabled' | 'aisle';

export interface Seat {
  id: string;
  row: number;
  column: number;
  type: SeatType;
  price: number;
  isAvailable: boolean;
}

export interface CinemaRoomUI {
  id: string;
  name: string;
  cinemaId: string;
  rows: number;
  cols: number;
  layout: SeatType[][];
  capacity: number;
  status: 'active' | 'inactive' | 'maintenance';
  facilities: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CinemaRoom {
  Cinema_Room_ID: number;
  Room_Name: string;
  Seat_Quantity: number;
  Room_Type: string;
  Status: string;
  Notes: string | null;
  Cinema_ID: number;
}

export type CinemaStatus = 'Active' | 'Maintenance' | 'Closed' | 'Deleted';

/**
 * Represents a Cinema object, mirroring the backend's Sequelize model.
 * The naming convention (Pascal_Snake_Case) is kept consistent with the backend API
 * to minimize transformations.
 */
export interface Cinema {
  Cinema_ID: number;
  Cinema_Name: string;
  Address: string;
  City: string;
  Phone_Number?: string;
  Email?: string;
  Description?: string;
  Status: 'Active' | 'Maintenance' | 'Closed' | 'Deleted';
  Created_At?: string;
  Updated_At?: string;
  CinemaRooms?: CinemaRoom[];
  rooms?: CinemaRoom[];
}

/**
 * Defines the shape of the data for the cinema form.
 * This matches the fields required by the POST /api/cinemas and PUT /api/cinemas/:id endpoints.
 */
export interface CinemaFormData {
  Cinema_Name: string;
  Address: string;
  City: string;
  Phone_Number?: string;
  Email?: string;
  Description?: string;
  Status?: string;
}

export interface Showtime {
  id: string;
  movieId: string;
  cinemaId: string;
  roomId: string;
  startTime: string;
  endTime: string;
  price: number;
  vipPrice: number;
  couplePrice: number;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  availableSeats: number;
  totalSeats: number;
  createdAt: string;
  updatedAt: string;
}

export interface ShowtimeSeat {
  id: string;
  showtimeId: string;
  row: number;
  column: number;
  type: SeatType;
  price: number;
  status: 'available' | 'reserved' | 'sold' | 'blocked';
  bookingId?: string;
}

export interface CinemaFilter {
  city?: string;
  facilities?: string[];
  status?: string;
}

export interface CinemaReview {
  id: number;
  author: string;
  rating: number;
  comment: string;
  date: string;
  avatar?: string;
}

export interface SeatMap {
  id: string;
  row: string;
  number: number;
  type: 'standard' | 'vip' | 'couple';
  status: 'available' | 'occupied' | 'selected' | 'maintenance';
  price: number;
}

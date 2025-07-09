// src/types/showtime.ts

/**
 * Backend Showtime model interface based on actual database structure
 */
export interface ShowtimeModel {
  Showtime_ID: number;
  Movie_ID: number;
  Cinema_Room_ID: number;
  Show_Date: string; // DATEONLY format YYYY-MM-DD
  Start_Time: string; // TIME format HH:MM:SS
  End_Time: string; // TIME format HH:MM:SS
  Status: string;
  Capacity_Available: number;
  Created_By: number;
  Created_At?: string; // ISO date string
  Updated_At?: string; // ISO date string
}

/**
 * Frontend Showtime interface (converted/adapted from backend)
 */
export interface Showtime {
  id: string;
  movieId: string;
  cinemaId: string;
  roomId: string;
  startTime: Date | string | null;
  endTime: Date | string | null;
  showDate?: string | null;
  price: number;
  vipPrice: number;
  couplePrice: number;
  availableSeats: number;
  totalSeats: number;
  bookedSeats: string[] | number;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  specialOffers: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Các trường bổ sung cho frontend
  movieTitle?: string;
  cinemaName?: string;
  roomName?: string;
  movie?: {
    title: string;
    duration?: number;
    poster?: string;
  };
  cinema?: {
    name: string;
    address?: string;
  };
  room?: {
    name: string;
    capacity?: number;
    roomType?: string;
  };
  
  // Additional backwards compatibility properties
  Show_Date?: string; // Maps to showDate
  Capacity_Total?: number; // Maps to totalSeats
  capacity_total?: number; // Alternative mapping
  time?: string; // Formatted time display
  format?: string; // Format display (2D, 3D, etc.)
  screenNumber?: number; // Screen number display
  language?: string; // Language display
  prices?: {
    standard: number;
  };
  isSoldOut?: boolean; // Sold out status
  seatStatus?: string; // Seat status display
  cinemaAddress?: string; // Cinema address display
  roomType?: string; // Room type display
  movieDuration?: number; // Movie duration display
  movieRating?: string; // Movie rating display
  movieGenre?: string; // Movie genre display
  createdBy?: string; // Creator information
}

export interface ShowtimeFormData {
  movieId: string;
  cinemaId: string;
  roomId: string;
  startTime?: Date | string | null;
  date?: string;
  time?: string;
  showDate?: string;
  price?: number;
  vipPrice?: number;
  couplePrice?: number;
  specialOffers?: string[];
  isActive?: boolean;
  status?: string;
}

export interface ShowtimeWithDetails extends Showtime {
  movie: {
    title: string;
    duration: number;
    poster: string;
  };
  cinema: {
    name: string;
    address: string;
  };
  room: {
    name: string;
    capacity: number;
    roomType: string;
  };
}

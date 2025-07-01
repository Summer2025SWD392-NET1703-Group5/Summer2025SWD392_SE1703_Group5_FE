// src/types/showtime.ts
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

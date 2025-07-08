import type { Movie } from "./movie";
import type { Cinema, Showtime } from "./cinema";

export type { Movie } from "./movie";
export type { Cinema, Showtime } from "./cinema";

// Movie related types
export interface Movie {
  id: number;
  title: string;
  englishTitle?: string;
  originalTitle?: string;
  poster: string;
  backgroundImage: string;
  duration: string;
  genres: string[];
  genre?: string;
  director: string;
  cast: string[];
  description: string;
  releaseDate: string;
  rating: number;
  country: string;
  language: string;
  ageRating: string;
  isComingSoon: boolean;
  isHot?: boolean;
  isNew?: boolean;
  year?: string | number;
  quality?: string;
  subtitle?: string;
  views?: number;
  gallery: string[];
  trailerUrl: string;
  reviews: Review[];
}

export interface Review {
  id: number | string;
  user?: string;
  rating: number;
  content: string;
  date: string;
  isUpdated?: boolean;
}

// Cinema types
export interface Cinema {
  id: number;
  name: string;
  address: string;
  city: string;
  district?: string;
  location?: string;
  phone: string;
  email?: string;
  image: string;
  images?: string[];
  facilities: string[];
  amenities?: string[];
  rating: number;
  operatingHours?: {
    open: string;
    close: string;
  };
  ticketPrices?: {
    standard: number;
    vip: number;
    couple: number;
  };
  screens?: number;
  totalSeats?: number;
  parkingSpaces?: number;
  website?: string;
  reviews?: any[];
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// Cinema room type
export interface CinemaRoom {
  id: string;
  name: string;
  type: "standard" | "premium" | "imax";
  totalSeats: number;
  rows: number;
  seatsPerRow: number[];
  layout: Seat[][];
  screenPosition: "front" | "center";
}

// Showtime types
export interface Showtime {
  id: number;
  movieId: number;
  cinemaId: number;
  roomName: string;
  startTime: string;
  endTime: string;
  format: string;
  language: string;
  availableSeats: number;
  date?: string;
  times?: string[];
  price?: number;
}

// Seat types
export interface Seat {
  id: string;
  row: string;
  number: number;
  type: "standard" | "vip";
  status: "available" | "selected" | "occupied" | "maintenance";
  price: number;
  position?: {
    x: number;
    y: number;
  };
  layoutId?: number;
}

// User types
export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  role: "user" | "admin";
}

// Booking types
export interface Booking {
  id: number;
  userId: number;
  showtimeId: number;
  seats: Seat[];
  totalPrice: number;
  bookingDate: string;
  status: "pending" | "confirmed" | "cancelled";
  paymentMethod: string;
}

// Booking step type
export interface BookingStep {
  id: number;
  name: string;
  title: string;
  completed: boolean;
  active: boolean;
}

// Booking session type
export interface BookingSession {
  id: string;
  movieId: string;
  cinemaId: string;
  showtimeId: string;
  selectedSeats: Seat[];
  totalPrice: number;
  expiresAt: Date;
  step: number;
  bookingId?: string;
  forceReconnect?: number; // Timestamp để trigger WebSocket reconnect
}

// Component props types
export interface BreadcrumbItem {
  label: string;
  path?: string;
}

export interface ShowtimeSectionProps {
  movieId: string | number;
  cinemas: Cinema[];
  showtimes: Showtime[];
  onCinemaSelect?: (cinemaId: number) => void;
  loading?: boolean;
}

export interface ReviewSectionProps {
  movieId: string | number;
  reviews: Review[];
  onSubmitReview?: (rating: number, content: string) => Promise<boolean>;
}

export interface TrailerModalProps {
  movie: Movie;
  onClose: () => void;
}

export interface ImageGalleryProps {
  images: string[];
  movieTitle: string;
  onClose: () => void;
}

export interface MovieCardProps {
  movie: Movie;
  showTrailer?: boolean;
  onTrailerClick?: (movie: Movie) => void;
}

export interface MovieFormData {
  poster: File | null;
  title: string;
  genres: string[];
  duration: string;
  releaseDate: Date | null;
  status: "coming-soon" | "now-showing" | "ended";
  rating: number;
}

// Filter options
export interface FilterOptions {
  genre: string;
  rating: string;
  releaseDate: string;
  cinema: string;
  sortBy: string;
  search: string;
}

// Navigation types
export interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<any>;
}

// Không re-export movie.ts để tránh xung đột
// export * from './movie';

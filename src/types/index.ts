// Re-export types from individual files
export type { Movie, MovieFormData, MovieFilter, MovieReferences, MovieResponse, MovieStatus } from "./movie";
export type { User as AuthUser, LoginCredentials, RegisterData, AuthState, PasswordResetData, ValidationErrors } from "./auth";
export type { Cinema, CinemaFormData, CinemaRoom, CinemaRoomUI, CinemaFilter, CinemaReview, SeatMap, SeatType } from "./cinema";
export type { Showtime, ShowtimeFormData, ShowtimeWithDetails } from "./showtime";
export type { User, UserFormData, UpdateProfileData, ChangePasswordData, UserRole, UserStatus } from "./user";
export type { Booking, BookingResponse, BookingStep, BookingSession, Seat } from "./booking";
export type { Notification, NotificationListResponse, UnreadCountResponse } from "./notification";
export type { Promotion, ApiPromotion, PromotionStatus, DiscountType, ApplicableFor } from "./promotion";
export type { SeatLayout, SeatMapItem, SeatMapRow, SeatMap as SeatLayoutMap } from "./seatLayout";
export type { Ticket, BookingInfo, ScanResult } from "./ticket";
export type { TicketPricing, TicketPricingGroup, PricingStructure } from "./ticketPricing";
export type { CinemaRoom as CinemaRoomType, CinemaRoomFormData, CinemaRoomStatus, CinemaRoomType as RoomType } from "./cinemaRoom";
export type { DashboardOverview, RealtimeData, MoviePerformance, CinemaPerformance } from "./dashboard";

// Legacy types for backward compatibility
export interface Review {
  id: number | string;
  user?: string;
  rating: number;
  content: string;
  date: string;
  isUpdated?: boolean;
}

// Component props types
export interface BreadcrumbItem {
  label: string;
  path?: string;
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

// Image Gallery props
export interface ImageGalleryProps {
  images: string[];
  currentIndex?: number;
  onClose?: () => void;
}

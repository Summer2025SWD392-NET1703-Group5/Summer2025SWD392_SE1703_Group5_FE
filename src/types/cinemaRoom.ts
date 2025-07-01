// src/types/cinemaRoom.ts
export type CinemaRoomStatus = 'Active' | 'Inactive' | 'Maintenance' | 'Closed' | 'Deleted';
export type CinemaRoomFormStatus = 'Active' | 'Inactive';
export type CinemaRoomType = '2D' | '3D' | 'IMAX' | 'VIP';

/**
 * Represents a Cinema Room object from the backend.
 * The naming convention (Pascal_Snake_Case) is kept consistent with the backend API.
 */
export interface CinemaRoom {
    Cinema_Room_ID: number;
    Cinema_ID?: number;
    Room_Name: string;
    Seat_Quantity: number;
    Room_Type: CinemaRoomType;
    Status: CinemaRoomStatus;
    Notes: string | null;
    Created_At?: string;
    Updated_At?: string | null;

    // Thêm các trường từ API trả về
    NowShowingMovies?: any[];
    HasSeats?: boolean;
    SeatTypes?: any[];
    UpcomingShowtimes?: any[];
    CanDelete?: boolean;
}

/**
 * Defines the shape of the data for the cinema room form.
 * Matches the fields for creating/updating a cinema room.
 */
export interface CinemaRoomFormData {
    Room_Name: string;
    Seat_Quantity: number;
    Room_Type: CinemaRoomType;
    Status: CinemaRoomFormStatus;
    Notes?: string;
} 
// src/types/seatLayout.ts
export type SeatType = 'Regular' | 'VIP' | 'Premium' | 'Economy' | 'Couple';

/**
 * Represents a Seat Layout object from the backend.
 * The naming convention (Pascal_Snake_Case) is kept consistent with the backend API.
 */
export interface SeatLayout {
    Layout_ID: number;
    Cinema_Room_ID: number;
    Row_Label: string;
    Column_Number: number;
    Seat_Type: SeatType;
    Is_Active: boolean;
}

/**
 * Represents a seat in the visual seat map
 */
export interface SeatMapItem {
    Layout_ID: number;
    Row_Label: string;
    Column_Number: number;
    Seat_Type: SeatType;
    Is_Active: boolean;
}

/**
 * Represents a row in the seat map
 */
export interface SeatMapRow {
    Row: string;
    Seats: SeatMapItem[];
}

/**
 * Represents the complete seat map for a cinema room
 */
export interface SeatMap {
    cinema_room: {
        Cinema_Room_ID: number;
        Room_Name: string;
        Room_Type: string;
        Cinema_Name: string;
    };
    rows: SeatMapRow[];
    dimensions: {
        rows: number;
        columns: number;
    };
    stats: {
        total_seats: number;
        seat_types: {
            SeatType: string;
            Count: number;
        }[];
    };
    can_modify: boolean;
}

/**
 * Request payload for updating a seat type
 */
export interface UpdateSeatTypeRequest {
    SeatType: SeatType;
    IsActive?: boolean;
}

/**
 * Request payload for bulk updating seat types
 */
export interface BulkUpdateSeatTypesRequest {
    LayoutIds: number[];
    SeatType: SeatType;
    IsActive?: boolean;
}

/**
 * Request payload for bulk deleting seat layouts
 */
export interface BulkDeleteLayoutsRequest {
    LayoutIds: number[];
}

/**
 * Request payload for configuring seat layout
 */
export interface SeatMapConfigurationRequest {
    ColumnsPerRow: number;
    Rows: {
        RowLabel: string;
        SeatType: SeatType;
        EmptyColumns?: number[];
    }[];
}

/**
 * Request payload for bulk configuring seat layout
 */
export interface BulkSeatConfigurationRequest {
    SeatType: SeatType;
    RowsInput: string;
    ColumnsPerRow: number;
    EmptyColumns?: number[];
    OverwriteExisting?: boolean;
}

/**
 * Response for seat types
 */
export interface SeatTypesResponse {
    seat_types: {
        room_type: string;
        seat_type: string;
        base_price: number;
    }[];
} 
import apiClient from './apiClient';
import type {
    SeatLayout,
    SeatMap,
    UpdateSeatTypeRequest,
    BulkUpdateSeatTypesRequest,
    BulkDeleteLayoutsRequest,
    SeatMapConfigurationRequest,
    BulkSeatConfigurationRequest,
    SeatTypesResponse
} from '../types/seatLayout';

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

/**
 * Get all seat layouts
 */
const getAllSeatLayouts = async (): Promise<SeatLayout[]> => {
    console.log('seatLayoutService - Getting all seat layouts');
    try {
        const response = await apiClient.get<ApiResponse<SeatLayout[]>>('/seat-layouts');
        console.log('seatLayoutService - All seat layouts received:', response.data);
        return response.data.data || [];
    } catch (error) {
        console.error('seatLayoutService - Error getting all seat layouts:', error);
        throw error;
    }
};

/**
 * Get seat layout by ID
 */
const getSeatLayoutById = async (layoutId: number): Promise<SeatLayout> => {
    console.log('seatLayoutService - Getting seat layout by ID:', layoutId);
    try {
        const response = await apiClient.get<SeatLayout>(`/seat-layouts/${layoutId}`);
        console.log('seatLayoutService - Seat layout received:', response.data);
        return response.data;
    } catch (error) {
        console.error('seatLayoutService - Error getting seat layout by ID:', error);
        throw error;
    }
};

/**
 * Get seat layout by room ID
 */
const getSeatLayoutByRoomId = async (roomId: number): Promise<ApiResponse<SeatMap>> => {
    console.log('seatLayoutService - Getting seat layout for room ID:', roomId);
    try {
        const response = await apiClient.get<ApiResponse<SeatMap>>(`/seat-layouts/room/${roomId}`);
        console.log('seatLayoutService - Seat layout for room received:', response.data);
        return response.data;
    } catch (error) {
        console.error('seatLayoutService - Error getting seat layout for room:', error);
        throw error;
    }
};

/**
 * Update seat type
 */
const updateSeatType = async (layoutId: number, data: UpdateSeatTypeRequest): Promise<SeatLayout> => {
    console.log('seatLayoutService - Updating seat type for layout ID:', layoutId, 'Data:', data);
    try {
        const response = await apiClient.put<ApiResponse<SeatLayout>>(`/seat-layouts/${layoutId}/seat-type`, data);
        console.log('seatLayoutService - Seat type update response:', response.data);
        if (response.data && response.data.data) {
            return response.data.data;
        }
        throw new Error('Invalid response format');
    } catch (error) {
        console.error('seatLayoutService - Error updating seat type:', error);
        throw error;
    }
};

/**
 * Bulk update seat types
 */
const bulkUpdateSeatTypes = async (data: BulkUpdateSeatTypesRequest): Promise<ApiResponse<any>> => {
    console.log('seatLayoutService - Bulk updating seat types. Data:', data);
    try {
        const response = await apiClient.put<ApiResponse<any>>('/seat-layouts/bulk-update-types', data);
        console.log('seatLayoutService - Bulk update response:', response.data);
        return response.data;
    } catch (error) {
        console.error('seatLayoutService - Error bulk updating seat types:', error);
        throw error;
    }
};

/**
 * Get seat types and pricing
 */
const getSeatTypes = async (): Promise<SeatTypesResponse> => {
    console.log('seatLayoutService - Getting seat types');
    try {
        const response = await apiClient.get<ApiResponse<SeatTypesResponse>>('/seat-layouts/seat-types');
        console.log('seatLayoutService - Seat types received:', response.data);
        return response.data.data || { seat_types: [] };
    } catch (error) {
        console.error('seatLayoutService - Error getting seat types:', error);
        throw error;
    }
};

/**
 * Configure seat layout for a room
 */
const configureSeatLayout = async (roomId: number, data: SeatMapConfigurationRequest): Promise<ApiResponse<any>> => {
    console.log('seatLayoutService - Configuring seat layout for room ID:', roomId, 'Data:', data);
    try {
        const response = await apiClient.post<ApiResponse<any>>(`/seat-layouts/room/${roomId}`, data);
        console.log('seatLayoutService - Configure seat layout response:', response.data);
        return response.data;
    } catch (error) {
        console.error('seatLayoutService - Error configuring seat layout:', error);
        throw error;
    }
};

/**
 * Bulk configure seat layout
 */
const bulkConfigureSeatLayout = async (roomId: number, data: BulkSeatConfigurationRequest): Promise<ApiResponse<any>> => {
    console.log('seatLayoutService - Bulk configuring seat layout for room ID:', roomId, 'Data:', data);
    try {
        const response = await apiClient.post<ApiResponse<any>>(`/seat-layouts/bulk/${roomId}`, data);
        console.log('seatLayoutService - Bulk configure seat layout response:', response.data);
        return response.data;
    } catch (error) {
        console.error('seatLayoutService - Error bulk configuring seat layout:', error);
        throw error;
    }
};

/**
 * Soft delete seat layouts
 */
const softDeleteSeatLayouts = async (data: BulkDeleteLayoutsRequest): Promise<ApiResponse<any>> => {
    console.log('seatLayoutService - Soft deleting seat layouts. Data:', data);
    try {
        const response = await apiClient.delete<ApiResponse<any>>('/seat-layouts/bulk-delete', {
            data
        });
        console.log('seatLayoutService - Soft delete response:', response.data);
        return response.data;
    } catch (error) {
        console.error('seatLayoutService - Error soft deleting seat layouts:', error);
        throw error;
    }
};

/**
 * Get seat usage statistics
 */
const getSeatUsageStats = async (roomId: number, days: number = 30): Promise<ApiResponse<any>> => {
    console.log('seatLayoutService - Getting seat usage stats for room ID:', roomId, 'Days:', days);
    try {
        const response = await apiClient.get<ApiResponse<any>>(`/seat-layouts/room/${roomId}/usage-stats?days=${days}`);
        console.log('seatLayoutService - Seat usage stats received:', response.data);
        return response.data;
    } catch (error) {
        console.error('seatLayoutService - Error getting seat usage stats:', error);
        throw error;
    }
};

export const seatLayoutService = {
    getAllSeatLayouts,
    getSeatLayoutById,
    getSeatLayoutByRoomId,
    updateSeatType,
    bulkUpdateSeatTypes,
    getSeatTypes,
    configureSeatLayout,
    bulkConfigureSeatLayout,
    softDeleteSeatLayouts,
    getSeatUsageStats
}; 
import api from '../../config/api';

export type Booking = {
    Booking_ID: number;
    Booking_Date: string;
    Payment_Deadline: string;
    Total_Amount: number;
    Status: 'Pending' | 'Completed' | 'Cancelled' | 'Refunded' | 'Confirmed' | 'completed' | 'pending' | 'cancelled' | 'refunded' | 'confirmed';
    Seats: string;
    User_ID: number;
    CustomerName: string;
    CustomerEmail: string;
    CustomerPhone: string;
    Showtime_ID: number;
    MovieName: string;
    RoomName: string;
    Show_Date: string;
    Start_Time: string;
    PaymentMethod: string | null;
    PosterURL: string;
    CinemaName?: string;
}

export type PaginatedResponse<T> = {
    data: T[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
}

export type ApiResponse<T> = {
    success: boolean;
    data: T[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalCount: number;
        limit: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
    metadata: {
        responseTime: string;
        dataCount: number;
    };
}

// Get all bookings with optional filters
export const getAllBookings = async (
    page = 1,
    limit = 10,
    searchTerm = '',
    status = 'all'
): Promise<ApiResponse<Booking> | null> => {
    try {
        const response = await api.get('/bookings', {
            params: {
                page,
                limit,
                search: searchTerm,
                status: status !== 'all' ? status : undefined
            }
        });

        // Handle the API response
        if (response.data) {
            // Check if the response is already in the expected format
            if (response.data.success && response.data.data && Array.isArray(response.data.data)) {
                return response.data as ApiResponse<Booking>;
            }
            // If the response is an array, format it into an API response
            else if (Array.isArray(response.data)) {
                return {
                    success: true,
                    data: response.data,
                    pagination: {
                        currentPage: page,
                        totalPages: response.headers['x-total-pages']
                            ? parseInt(response.headers['x-total-pages'])
                            : Math.ceil(response.data.length / limit),
                        totalCount: response.headers['x-total-count']
                            ? parseInt(response.headers['x-total-count'])
                            : response.data.length,
                        limit: limit,
                        hasNextPage: page < Math.ceil(response.data.length / limit),
                        hasPrevPage: page > 1
                    },
                    metadata: {
                        responseTime: '0ms',
                        dataCount: response.data.length
                    }
                };
            }
        }

        return null;
    } catch (error) {
        console.error('Error fetching bookings:', error);
        throw error;
    }
};

// Get a single booking by ID
export const getBookingById = async (id: string): Promise<Booking> => {
    try {
        // Temporary mock data thay vì gọi API không tồn tại
        console.warn(`API /bookings/${id} không tồn tại, sử dụng mock data`);

        const mockBooking: Booking = {
            Booking_ID: parseInt(id),
            Booking_Date: new Date().toISOString(),
            Payment_Deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            Total_Amount: 198000,
            Status: 'Pending',
            Seats: 'A1, A2',
            User_ID: 1,
            CustomerName: 'Khách hàng demo',
            CustomerEmail: 'demo@example.com',
            CustomerPhone: '0123456789',
            Showtime_ID: 1,
            MovieName: 'Phim demo',
            RoomName: 'Phòng 1',
            Show_Date: new Date().toISOString(),
            Start_Time: '18:00',
            PaymentMethod: 'Thẻ tín dụng',
            PosterURL: '',
            CinemaName: 'Galaxy Cinema Demo'
        };

        return mockBooking;

        // Original API call (commented out vì API không tồn tại)
        // const response = await api.get(`/bookings/${id}`);
        // return response.data;
    } catch (error) {
        console.error(`Error fetching booking with ID ${id}:`, error);
        throw error;
    }
};

// Export bookings to Excel
export const exportBookingsToExcel = async (
    searchTerm = '',
    status = 'all'
) => {
    try {
        // Using blob to handle file download
        const response = await api.get(`/bookings/export`, {
            params: {
                search: searchTerm,
                status: status !== 'all' ? status : undefined
            },
            responseType: 'blob'
        });

        // Create a URL for the blob and trigger download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;

        // Get filename from content-disposition header or use default
        const contentDisposition = response.headers['content-disposition'];
        const filename = contentDisposition
            ? contentDisposition.split('filename=')[1].replace(/"/g, '')
            : 'bookings-export.xlsx';

        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        return true;
    } catch (error) {
        console.error('Error exporting bookings to Excel:', error);
        throw error;
    }
};

// Update booking status
export const updateBookingStatus = async (id: string, status: string): Promise<Booking> => {
    try {
        // Temporary mock response thay vì gọi API không tồn tại
        console.warn(`API PATCH /bookings/${id} không tồn tại, sử dụng mock response`);

        const mockUpdatedBooking: Booking = {
            Booking_ID: parseInt(id),
            Booking_Date: new Date().toISOString(),
            Payment_Deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            Total_Amount: 198000,
            Status: status as any,
            Seats: 'A1, A2',
            User_ID: 1,
            CustomerName: 'Khách hàng demo',
            CustomerEmail: 'demo@example.com',
            CustomerPhone: '0123456789',
            Showtime_ID: 1,
            MovieName: 'Phim demo',
            RoomName: 'Phòng 1',
            Show_Date: new Date().toISOString(),
            Start_Time: '18:00',
            PaymentMethod: 'Thẻ tín dụng',
            PosterURL: '',
            CinemaName: 'Galaxy Cinema Demo'
        };

        return mockUpdatedBooking;

        // Original API call (commented out vì API không tồn tại)
        // const response = await api.patch(`/bookings/${id}`, { status });
        // return response.data;
    } catch (error) {
        console.error(`Error updating booking status for ID ${id}:`, error);
        throw error;
    }
};

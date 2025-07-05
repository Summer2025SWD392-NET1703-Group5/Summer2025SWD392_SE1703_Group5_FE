/**
 * Utility functions để dịch seat types từ tiếng Anh sang tiếng Việt
 */

export const translateSeatType = (seatType: string): string => {
    const seatTypeMap: { [key: string]: string } = {
        'Regular': 'Thường',
        'VIP': 'VIP',
        'standard': 'Thường',
    };
    
    return seatTypeMap[seatType] || seatType;
};

export const translateRoomType = (roomType: string): string => {
    const roomTypeMap: { [key: string]: string } = {
        '2D': '2D',
        '3D': '3D',
        'IMAX': 'IMAX',
        '4DX': '4DX',
        'Regular': 'Thường',
        'Premium': 'Cao cấp'
    };
    
    return roomTypeMap[roomType] || roomType;
}; 
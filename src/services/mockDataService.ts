// Mock Data Service
// Cung cấp dữ liệu mẫu khi backend không hoạt động

export const mockDataService = {
    // Mock cinemas data
    getCinemas: () => [
        {
            id: 1,
            name: 'Galaxy Nguyễn Du',
            address: '116 Nguyễn Du, Quận 1, TP.HCM',
            phone: '028 7300 8881',
            image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&h=600&fit=crop',
            facilities: ['Parking', 'Food Court', 'VIP Room', '4DX'],
            rooms: 8,
            seats: 1200,
            rating: 4.5,
            coordinates: { lat: 10.7769, lng: 106.6951 }
        },
        {
            id: 2,
            name: 'Galaxy Tân Bình',
            address: '246 Nguyễn Hồng Đào, Tân Bình, TP.HCM',
            phone: '028 7300 8882',
            image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=600&fit=crop',
            facilities: ['Parking', 'Kids Zone', 'IMAX', 'Dolby Atmos'],
            rooms: 10,
            seats: 1500,
            rating: 4.7,
            coordinates: { lat: 10.8012, lng: 106.6438 }
        },
        {
            id: 3,
            name: 'Galaxy Phú Nhuận',
            address: '123 Phan Xích Long, Phú Nhuận, TP.HCM',
            phone: '028 7300 8883',
            image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&h=600&fit=crop',
            facilities: ['Parking', 'Coffee Shop', 'VIP Lounge'],
            rooms: 6,
            seats: 900,
            rating: 4.3,
            coordinates: { lat: 10.7998, lng: 106.6808 }
        }
    ],

    // Mock showtimes data
    getShowtimes: (movieId?: number, cinemaId?: number) => {
        const times = ['09:00', '11:30', '14:00', '16:30', '19:00', '21:30', '23:45'];
        const types = ['2D', '3D', 'IMAX', '4DX'];
        const languages = ['Vietsub', 'Lồng tiếng', 'Phụ đề'];

        return times.map((time, index) => ({
            id: index + 1,
            movieId: movieId || 1,
            cinemaId: cinemaId || 1,
            roomId: Math.floor(Math.random() * 8) + 1,
            startTime: time,
            date: new Date(Date.now() + Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000),
            type: types[Math.floor(Math.random() * types.length)],
            language: languages[Math.floor(Math.random() * languages.length)],
            price: 75000 + Math.floor(Math.random() * 50000),
            availableSeats: Math.floor(Math.random() * 50) + 20
        }));
    },

    // Mock seat map data
    getSeatMap: (roomId: number) => {
        const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K'];
        const seatsPerRow = 12;
        const seatMap = [];

        for (let row of rows) {
            for (let i = 1; i <= seatsPerRow; i++) {
                const isVIP = ['D', 'E', 'F'].includes(row) && i >= 4 && i <= 9;
                const isOccupied = Math.random() < 0.3;

                seatMap.push({
                    id: `${row}${i}`,
                    row: row,
                    number: i,
                    type: isVIP ? 'VIP' : 'Regular',
                    status: isOccupied ? 'occupied' : 'available',
                    price: isVIP ? 120000 : 75000
                });
            }
        }

        return {
            roomId,
            roomName: `Phòng ${roomId}`,
            totalSeats: rows.length * seatsPerRow,
            seatMap
        };
    },

    // Mock user bookings
    getUserBookings: (userId: number) => [
        {
            id: 'BK001',
            userId,
            movieTitle: 'Avatar: The Way of Water',
            moviePoster: 'https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg',
            cinema: 'Galaxy Nguyễn Du',
            date: '2024-01-15',
            time: '19:00',
            seats: ['E5', 'E6'],
            totalAmount: 240000,
            status: 'confirmed',
            qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=BK001',
            bookingDate: new Date('2024-01-10')
        },
        {
            id: 'BK002',
            userId,
            movieTitle: 'Oppenheimer',
            moviePoster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
            cinema: 'Galaxy Tân Bình',
            date: '2024-01-20',
            time: '21:30',
            seats: ['F7', 'F8', 'F9'],
            totalAmount: 360000,
            status: 'confirmed',
            qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=BK002',
            bookingDate: new Date('2024-01-18')
        },
        {
            id: 'BK003',
            userId,
            movieTitle: 'Barbie',
            moviePoster: 'https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg',
            cinema: 'Galaxy Phú Nhuận',
            date: '2024-01-08',
            time: '14:00',
            seats: ['C4', 'C5'],
            totalAmount: 150000,
            status: 'completed',
            qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=BK003',
            bookingDate: new Date('2024-01-05')
        }
    ],

    // Mock user profile
    getUserProfile: (userId: number) => ({
        id: userId,
        name: 'Nguyễn Văn A',
        email: 'nguyenvana@example.com',
        phone: '0901234567',
        avatar: 'https://ui-avatars.com/api/?name=Nguyen+Van+A&background=FFD875&color=000',
        membershipLevel: 'Gold',
        points: 2500,
        joinDate: new Date('2023-01-15'),
        totalBookings: 25,
        totalSpent: 3750000,
        favoriteGenres: ['Hành động', 'Khoa học viễn tưởng', 'Hoạt hình'],
        preferences: {
            language: 'Vietsub',
            favoriteTime: 'Evening',
            favoriteCinema: 'Galaxy Nguyễn Du'
        }
    }),

    // Mock reviews
    getMovieReviews: (movieId: number) => [
        {
            id: 1,
            movieId,
            userId: 1,
            userName: 'Minh Anh',
            userAvatar: 'https://ui-avatars.com/api/?name=Minh+Anh&background=FFD875&color=000',
            rating: 4.5,
            comment: 'Phim rất hay, kỹ xảo đẹp mắt, cốt truyện hấp dẫn. Diễn xuất của các diễn viên rất tốt!',
            date: new Date('2024-01-10'),
            likes: 25,
            helpful: true
        },
        {
            id: 2,
            movieId,
            userId: 2,
            userName: 'Thanh Tùng',
            userAvatar: 'https://ui-avatars.com/api/?name=Thanh+Tung&background=FFD875&color=000',
            rating: 5,
            comment: 'Xuất sắc! Đây là một trong những bộ phim hay nhất tôi từng xem. Âm thanh và hình ảnh đều tuyệt vời.',
            date: new Date('2024-01-12'),
            likes: 18,
            helpful: true
        },
        {
            id: 3,
            movieId,
            userId: 3,
            userName: 'Hương Giang',
            userAvatar: 'https://ui-avatars.com/api/?name=Huong+Giang&background=FFD875&color=000',
            rating: 3.5,
            comment: 'Phim cũng được, nhưng hơi dài. Một số phân cảnh có thể cắt bớt.',
            date: new Date('2024-01-14'),
            likes: 8,
            helpful: false
        }
    ],

    // Mock notifications
    getUserNotifications: (userId: number) => [
        {
            id: 1,
            userId,
            type: 'booking',
            title: 'Đặt vé thành công',
            message: 'Bạn đã đặt vé xem phim Avatar: The Way of Water thành công!',
            date: new Date('2024-01-10'),
            read: true,
            icon: '🎬'
        },
        {
            id: 2,
            userId,
            type: 'promotion',
            title: 'Ưu đãi cuối tuần',
            message: 'Giảm 30% cho tất cả suất chiếu vào thứ 7 và Chủ nhật!',
            date: new Date('2024-01-12'),
            read: false,
            icon: '🎁'
        },
        {
            id: 3,
            userId,
            type: 'reminder',
            title: 'Nhắc nhở xem phim',
            message: 'Suất chiếu Oppenheimer của bạn sẽ bắt đầu sau 2 giờ nữa.',
            date: new Date('2024-01-20'),
            read: false,
            icon: '⏰'
        }
    ],

    // Mock payment methods
    getPaymentMethods: () => [
        {
            id: 1,
            type: 'credit_card',
            name: 'Visa',
            last4: '4242',
            icon: '💳',
            isDefault: true
        },
        {
            id: 2,
            type: 'e_wallet',
            name: 'MoMo',
            account: '0901234567',
            icon: '📱',
            isDefault: false
        },
        {
            id: 3,
            type: 'bank_transfer',
            name: 'VietcomBank',
            account: '****3456',
            icon: '🏦',
            isDefault: false
        }
    ],

    // Mock statistics for dashboard
    getDashboardStats: () => ({
        todayRevenue: 15750000,
        weeklyRevenue: 89250000,
        monthlyRevenue: 375000000,
        todayBookings: 125,
        activeMovies: 24,
        totalCustomers: 15420,
        occupancyRate: 68.5,
        popularMovies: [
            { title: 'Avatar 2', bookings: 450 },
            { title: 'Oppenheimer', bookings: 380 },
            { title: 'Barbie', bookings: 320 }
        ],
        revenueByDay: [
            { day: 'Mon', revenue: 12500000 },
            { day: 'Tue', revenue: 10800000 },
            { day: 'Wed', revenue: 11200000 },
            { day: 'Thu', revenue: 13400000 },
            { day: 'Fri', revenue: 18500000 },
            { day: 'Sat', revenue: 22300000 },
            { day: 'Sun', revenue: 20100000 }
        ]
    })
}; 
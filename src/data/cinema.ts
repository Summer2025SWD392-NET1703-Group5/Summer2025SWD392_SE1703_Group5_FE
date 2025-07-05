// data/cinemas.ts
import type { Cinema } from '../types/cinema';

export const sampleCinemas: Cinema[] = [
  {
    id: 1,
    name: "CGV Vincom Center Landmark 81",
    address: "Tầng 3-4, Vincom Center Landmark 81, 720A Điện Biên Phủ, Bình Thạnh",
    district: "Bình Thạnh",
    city: "Hồ Chí Minh",
    phone: "1900 6017",
    email: "landmark81@cgv.vn",
    website: "https://cgv.vn",
    coordinates: {
      lat: 10.7953,
      lng: 106.7218
    },
    images: [
      "https://images.unsplash.com/photo-1489185078254-c3365d6e359f?w=800",
      "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800",
      "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=800"
    ],
    amenities: [
      "Bãi đậu xe",
      "Khu ẩm thực",
      "WiFi miễn phí",
      "Điều hòa",
      "Thang máy",
      "Nhà vệ sinh",
      "Cửa hàng tiện lợi"
    ],
    facilities: [
      "Màn hình IMAX",
      "Âm thanh Dolby Atmos",
      "Ghế massage VIP",
      "Phòng chiếu 4DX",
      "Quầy bán đồ ăn",
      "Khu vui chơi trẻ em"
    ],
    screens: 12,
    totalSeats: 2400,
    rating: 4.5,
    reviews: [
      {
        id: 1,
        author: "Nguyễn Văn A",
        rating: 5,
        comment: "Rạp rất đẹp, âm thanh hình ảnh tuyệt vời!",
        date: "2024-01-15",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100"
      }
    ],
    operatingHours: {
      open: "08:00",
      close: "23:30"
    },
    ticketPrices: {
      standard: 85000,
      vip: 150000,
      couple: 280000
    },
    parkingSpaces: 500,
    description: "Rạp chiếu phim hiện đại nhất tại Landmark 81 với công nghệ âm thanh hình ảnh tiên tiến.",
    rooms: [
      {
        id: 101,
        name: "Phòng 01",
        type: "2D",
        capacity: 180,
        status: "active"
      },
      {
        id: 102,
        name: "Phòng 02",
        type: "3D",
        capacity: 160,
        status: "active"
      },
      {
        id: 103,
        name: "Phòng IMAX",
        type: "IMAX",
        capacity: 220,
        status: "active"
      },
      {
        id: 104,
        name: "Phòng VIP",
        type: "VIP",
        capacity: 80,
        status: "active"
      },
      {
        id: 105,
        name: "Phòng 4DX",
        type: "4DX",
        capacity: 120,
        status: "active"
      }
    ]
  },
  {
    id: 2,
    name: "Lotte Cinema Keangnam Hanoi",
    address: "Tầng 5, Keangnam Hanoi Landmark Tower, Phạm Hùng, Nam Từ Liêm",
    district: "Nam Từ Liêm",
    city: "Hà Nội",
    phone: "1900 5555",
    email: "keangnam@lotte.vn",
    coordinates: {
      lat: 21.0136,
      lng: 105.7851
    },
    images: [
      "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800"
    ],
    amenities: [
      "Bãi đậu xe",
      "Khu ẩm thực",
      "WiFi miễn phí",
      "Điều hòa",
      "ATM",
      "Pharmacy"
    ],
    facilities: [
      "Màn hình Premium",
      "Âm thanh 7.1",
      "Ghế da cao cấp",
      "Quầy bán combo",
      "Khu chờ VIP"
    ],
    screens: 8,
    totalSeats: 1600,
    rating: 4.3,
    reviews: [],
    operatingHours: {
      open: "09:00",
      close: "23:00"
    },
    ticketPrices: {
      standard: 75000,
      vip: 120000,
      couple: 220000
    },
    parkingSpaces: 300,
    description: "Rạp chiếu phim cao cấp tại tòa nhà Keangnam với không gian sang trọng."
  },
  {
    id: 3,
    name: "Galaxy Cinema Nguyễn Du",
    address: "116 Nguyễn Du, Quận 1, TP. Hồ Chí Minh",
    district: "Quận 1",
    city: "Hồ Chí Minh",
    phone: "028 3822 2299",
    email: "nguyendu@galaxycine.vn",
    coordinates: {
      lat: 10.7769,
      lng: 106.6951
    },
    images: [
      "https://images.unsplash.com/photo-1489185078254-c3365d6e359f?w=800"
    ],
    amenities: [
      "Bãi đậu xe",
      "Khu ẩm thực",
      "WiFi miễn phí",
      "Điều hòa"
    ],
    facilities: [
      "Màn hình LED",
      "Âm thanh Dolby Digital",
      "Ghế da thật",
      "Quầy bán đồ ăn"
    ],
    screens: 6,
    totalSeats: 1200,
    rating: 4.2,
    reviews: [],
    operatingHours: {
      open: "08:30",
      close: "23:30"
    },
    ticketPrices: {
      standard: 70000,
      vip: 110000,
      couple: 200000
    },
    parkingSpaces: 150,
    description: "Rạp chiếu phim trung tâm thành phố với vị trí thuận lợi."
  },
  {
    id: 4,
    name: "BHD Star Cineplex Bitexco",
    address: "Tầng 3-4, Bitexco Financial Tower, 2 Hải Triều, Quận 1",
    district: "Quận 1",
    city: "Hồ Chí Minh",
    phone: "028 3914 4414",
    email: "bitexco@bhdstar.vn",
    coordinates: {
      lat: 10.7717,
      lng: 106.7041
    },
    images: [
      "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800"
    ],
    amenities: [
      "Bãi đậu xe",
      "Khu ẩm thực",
      "WiFi miễn phí",
      "View thành phố"
    ],
    facilities: [
      "Màn hình 4K",
      "Âm thanh THX",
      "Ghế VIP massage",
      "Bar & Lounge"
    ],
    screens: 7,
    totalSeats: 1400,
    rating: 4.4,
    reviews: [],
    operatingHours: {
      open: "09:00",
      close: "24:00"
    },
    ticketPrices: {
      standard: 80000,
      vip: 140000,
      couple: 260000
    },
    parkingSpaces: 200,
    description: "Rạp chiếu phim cao cấp tại tòa nhà Bitexco với tầm nhìn tuyệt đẹp."
  },
  {
    id: 5,
    name: "Cinestar Hai Bà Trưng",
    address: "135 Hai Bà Trưng, Quận 3, TP. Hồ Chí Minh",
    district: "Quận 3",
    city: "Hồ Chí Minh",
    phone: "028 3930 0648",
    email: "haibatrung@cinestar.com.vn",
    coordinates: {
      lat: 10.7886,
      lng: 106.6917
    },
    images: [
      "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=800"
    ],
    amenities: [
      "Bãi đậu xe",
      "Quầy bán đồ ăn",
      "WiFi miễn phí",
      "Điều hòa"
    ],
    facilities: [
      "Màn hình Digital",
      "Âm thanh 5.1",
      "Ghế bọc da",
      "Quầy combo"
    ],
    screens: 5,
    totalSeats: 1000,
    rating: 4.0,
    reviews: [],
    operatingHours: {
      open: "08:00",
      close: "23:00"
    },
    ticketPrices: {
      standard: 65000,
      vip: 100000,
      couple: 180000
    },
    parkingSpaces: 100,
    description: "Rạp chiếu phim gia đình với giá vé hợp lý và dịch vụ tốt."
  },
  {
    id: 6,
    name: "Mega GS Cinemas Cao Thắng",
    address: "19 Cao Thắng, Quận 3, TP. Hồ Chí Minh",
    district: "Quận 3",
    city: "Hồ Chí Minh",
    phone: "028 3932 2648",
    email: "caothang@megags.vn",
    coordinates: {
      lat: 10.7756,
      lng: 106.6934
    },
    images: [
      "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800"
    ],
    amenities: [
      "Bãi đậu xe",
      "Khu ẩm thực",
      "Game center",
      "WiFi miễn phí"
    ],
    facilities: [
      "Màn hình LED",
      "Âm thanh Dolby",
      "Ghế massage",
      "Phòng VIP"
    ],
    screens: 9,
    totalSeats: 1800,
    rating: 4.1,
    reviews: [],
    operatingHours: {
      open: "08:30",
      close: "23:30"
    },
    ticketPrices: {
      standard: 70000,
      vip: 115000,
      couple: 210000
    },
    parkingSpaces: 180,
    description: "Rạp chiếu phim hiện đại với nhiều tiện ích giải trí."
  }
];

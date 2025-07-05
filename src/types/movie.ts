// src/types/movie.ts

/**
 * Định nghĩa kiểu dữ liệu cho một bộ phim nhận từ API
 * (thuộc tính theo kiểu camelCase sau khi chuyển đổi từ snake_case của backend)
 */
export interface Movie {
  id: string;
  title: string;
  poster: string;
  duration: number;
  releaseDate: string;
  premiereDate?: string;
  endDate?: string;
  productionCompany?: string;
  director?: string;
  cast?: string;
  genre?: string;
  rating?: string;
  language?: string;
  country?: string;
  synopsis?: string;
  trailerLink?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  ratingAverage?: number;
  ratingCount?: number;
  ratingDistribution?: number[];
}

/**
 * Định nghĩa kiểu dữ liệu cho form tạo/chỉnh sửa Movie (gửi lên API)
 * (thuộc tính theo kiểu PascalCase/snake_case để khớp với backend)
 */
export interface MovieFormData {
  Movie_Name: string;
  Duration: number;
  Release_Date: string;
  Premiere_Date?: string | null;
  End_Date?: string | null;
  Production_Company?: string | null;
  Director: string;
  Cast: string;
  Genre: string;
  Rating: string;
  Language: string;
  Country: string;
  Synopsis: string;
  posterFile?: File | null;
  Poster_URL?: string | null;
  Trailer_Link?: string | null;
  Status: string;
}

/**
 * Dữ liệu tham chiếu cho các trường trong form
 */
export interface MovieReferences {
  actors: string[];
  productionCompanies: string[];
  directors: string[];
  languages: string[];
  countries: string[];
  genres: string[];
  ratings: string[];
  statuses: string[];
}

/**
 * Định nghĩa kiểu dữ liệu cho bộ lọc Movie
 */
export interface MovieFilter {
  search?: string;
  status?: 'now-showing' | 'coming-soon' | 'ended' | 'all';
  genre?: string;
  fromDate?: Date;
  toDate?: Date;
  sortBy?: 'title' | 'releaseDate' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Enum cho trạng thái của Movie
 */
export enum MovieStatus {
  NowShowing = 'now-showing',
  ComingSoon = 'coming-soon',
  Ended = 'ended',
}

/**
 * Label hiển thị cho trạng thái Movie
 */
export const movieStatusLabels = {
  'now-showing': 'Đang chiếu',
  'coming-soon': 'Sắp chiếu',
  'ended': 'Đã kết thúc',
};

/**
 * Danh sách thể loại phim
 */
export const movieGenres = [
  'Hành động',
  'Phiêu lưu',
  'Hoạt hình',
  'Hài',
  'Tội phạm',
  'Tài liệu',
  'Chính kịch',
  'Gia đình',
  'Giả tưởng',
  'Lịch sử',
  'Kinh dị',
  'Âm nhạc',
  'Bí ẩn',
  'Lãng mạn',
  'Khoa học viễn tưởng',
  'Ly kỳ',
  'Chiến tranh',
  'Cao bồi',
];

export interface MovieResponse {
  Movie_ID: number;
  Movie_Name: string;
  Release_Date: string;
  Premiere_Date: string;
  End_Date: string;
  Production_Company: string;
  Director: string;
  Cast: string;
  Duration: number;
  Genre: string;
  Rating: string;
  Language: string;
  Country: string;
  Synopsis: string;
  Poster_URL: string;
  Trailer_Link: string;
  Status: string;
  Created_At: string;
  Updated_At: string;
  Rating_Summary: {
    Average_Rating: number;
    Rating_Count: number;
    Rating_Distribution: number[];
  };
  Ratings: any[];
  Showtimes: any[];
} 
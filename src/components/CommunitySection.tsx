// src/components/CommunitySection.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// TypeScript Interfaces
interface TopComment {
  id: number;
  user: { name: string; avatar: string };
  content: string;
  rating: number;
  movie: { title: string; poster: string };
  stats: { likes: number; views: number; replies: number };
  timeAgo: string;
}

interface MovieItem {
  id: number;
  rank: number;
  title: string;
  poster: string;
  stats: { comments: number; views: number };
  trend: 'up' | 'down' | 'stable';
}

interface Genre {
  id: string;
  name: string;
  color: string;
  count: number;
}

interface RecentComment {
  id: number;
  user: { name: string; avatar: string };
  content: string;
  movieTitle: string;
  timeAgo: string;
}

const CommunitySection: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentVerticalIndex, setCurrentVerticalIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Mock Data
  const topComments: TopComment[] = [
    {
      id: 1,
      user: {
        name: "quanansatsu",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=32&h=32&fit=crop&crop=face"
      },
      content: "vừa xem xong. Đức kết là phim để tài trừ tà nhưng nu9 (người duy ...",
      rating: 5,
      movie: {
        title: "ONE",
        poster: "https://images.unsplash.com/photo-1489599735734-79b4fc8a1a64?w=40&h=56&fit=crop"
      },
      stats: { likes: 0, views: 0, replies: 43 },
      timeAgo: "2h"
    },
    {
      id: 2,
      user: {
        name: "Kẻ nghiện set",
        avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=32&h=32&fit=crop&crop=face"
      },
      content: "Hết phần 1 thôi mấy ní phần 2 triệu vào cung chi chiến với ông mù tín ...",
      rating: 4,
      movie: {
        title: "ONE",
        poster: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=40&h=56&fit=crop"
      },
      stats: { likes: 1, views: 0, replies: 5 },
      timeAgo: "3h"
    },
    {
      id: 3,
      user: {
        name: "Còn đang ngủ",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face"
      },
      content: "Bj văn khí thì lên núi ẩm sự phụ Tổ Dịch Thuỷ là giải đc nha",
      rating: 3,
      movie: {
        title: "ONE",
        poster: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=40&h=56&fit=crop"
      },
      stats: { likes: 2, views: 0, replies: 2 },
      timeAgo: "4h"
    },
    {
      id: 4,
      user: {
        name: "hà sơn",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face"
      },
      content: "các cậu cho to xin tên mấy bộ giống như này đi, kiểu đứm nhão ...",
      rating: 4,
      movie: {
        title: "ONE",
        poster: "https://images.unsplash.com/photo-1489599735734-79b4fc8a1a64?w=40&h=56&fit=crop"
      },
      stats: { likes: 1, views: 0, replies: 1 },
      timeAgo: "5h"
    },
    {
      id: 5,
      user: {
        name: "Thích so chim",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"
      },
      content: "ANNAA CẢ phẩm tội nhất mỗi cha vụa hết bị nhập xong mất vo mất con ....",
      rating: 2,
      movie: {
        title: "ONE",
        poster: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=40&h=56&fit=crop"
      },
      stats: { likes: 0, views: 0, replies: 0 },
      timeAgo: "6h"
    },
    {
      id: 6,
      user: {
        name: "Cô 2 Rô",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face"
      },
      content: "ĐÃ CÓ TẬP 6 XEM RIÊNG, VUI LÒNG ĐỢI 1 LÁT ĐỂ LOAD FULL ..",
      rating: 5,
      movie: {
        title: "ONE",
        poster: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=40&h=56&fit=crop"
      },
      stats: { likes: 0, views: 0, replies: 7 },
      timeAgo: "1h"
    }
  ];

  const hotMovies: MovieItem[] = [
    {
      id: 1,
      rank: 1,
      title: "ONE: Người Hùng Trung Học",
      poster: "https://images.unsplash.com/photo-1489599735734-79b4fc8a1a64?w=40&h=56&fit=crop",
      stats: { comments: 1247, views: 2500000 },
      trend: 'up'
    },
    {
      id: 2,
      rank: 2,
      title: "Cung Điện Ma Ám",
      poster: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=40&h=56&fit=crop",
      stats: { comments: 892, views: 1800000 },
      trend: 'up'
    },
    {
      id: 3,
      rank: 3,
      title: "Lâm Giang Tiền",
      poster: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=40&h=56&fit=crop",
      stats: { comments: 756, views: 1500000 },
      trend: 'up'
    },
    {
      id: 4,
      rank: 4,
      title: "Người Hùng Yếu Đuối",
      poster: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=56&fit=crop",
      stats: { comments: 634, views: 1200000 },
      trend: 'down'
    },
    {
      id: 5,
      rank: 5,
      title: "Không Dung Thứ",
      poster: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=56&fit=crop",
      stats: { comments: 523, views: 900000 },
      trend: 'down'
    }
  ];

  const lovedMovies: MovieItem[] = [
    {
      id: 1,
      rank: 1,
      title: "ONE: Người Hùng Trung Học",
      poster: "https://images.unsplash.com/photo-1489599735734-79b4fc8a1a64?w=40&h=56&fit=crop",
      stats: { comments: 15400, views: 3200000 },
      trend: 'up'
    },
    {
      id: 2,
      rank: 2,
      title: "Lâm Giang Tiền",
      poster: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=40&h=56&fit=crop",
      stats: { comments: 12900, views: 2800000 },
      trend: 'up'
    },
    {
      id: 3,
      rank: 3,
      title: "Không Dung Thứ",
      poster: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=56&fit=crop",
      stats: { comments: 9900, views: 2100000 },
      trend: 'down'
    },
    {
      id: 4,
      rank: 4,
      title: "Kiện Tướng",
      poster: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=56&fit=crop",
      stats: { comments: 8500, views: 1900000 },
      trend: 'up'
    },
    {
      id: 5,
      rank: 5,
      title: "Phineas và Ferb",
      poster: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=40&h=56&fit=crop",
      stats: { comments: 7200, views: 1600000 },
      trend: 'down'
    }
  ];

  const hotGenres: Genre[] = [
    { id: '1', name: 'Chính Kịch', color: 'bg-pink-600', count: 245 },
    { id: '2', name: 'Tâm Lý', color: 'bg-blue-600', count: 189 },
    { id: '3', name: 'Tình Cảm', color: 'bg-purple-600', count: 167 },
    { id: '4', name: 'Lãng Mạn', color: 'bg-green-600', count: 134 },
    { id: '5', name: 'Hành Động', color: 'bg-orange-600', count: 290 }
  ];

  const recentComments: RecentComment[] = [
    {
      id: 1,
      user: {
        name: "gaisdep",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=32&h=32&fit=crop&crop=face"
      },
      content: "t cày phim này 1 ngày =))/ hết hay ngọt ..",
      movieTitle: "ONE: Người Hùng Trung Học",
      timeAgo: "1 phút"
    },
    {
      id: 2,
      user: {
        name: "TTT",
        avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=32&h=32&fit=crop&crop=face"
      },
      content: "ai có link truyện ko cho mình xin với a",
      movieTitle: "Sao Địch Nối Sắc Đẹp Tuyệt Trần",
      timeAgo: "2 phút"
    },
    {
      id: 3,
      user: {
        name: "Mynkyns",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face"
      },
      content: "Một biến thể khác của Wendingo. Fica ...",
      movieTitle: "Không Dung Thứ",
      timeAgo: "3 phút"
    },
    {
      id: 4,
      user: {
        name: "Hạt",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face"
      },
      content: "Ý là định lộn thể huyết chứ có bại liệt đầu m ..",
      movieTitle: "Cung Điện Ma Ám",
      timeAgo: "4 phút"
    },
    {
      id: 5,
      user: {
        name: "gaisdep",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"
      },
      content: "t cày phim này 1 ngày =)/ hết hay ngọt ..",
      movieTitle: "ONE: Người Hùng Trung Học",
      timeAgo: "5 phút"
    }
  ];

  // Auto-scroll effects
  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % Math.max(1, topComments.length - 3));
    }, 3000);
    
    return () => clearInterval(interval);
  }, [isPaused, topComments.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVerticalIndex(prev => (prev + 1) % recentComments.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, [recentComments.length]);

  // Helper functions
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-xs ${i < rating ? 'text-[#ffd875]' : 'text-gray-600'}`}
      >
        ★
      </span>
    ));
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-[#ffd875] text-black';
      case 2: return 'bg-gray-300 text-black';
      case 3: return 'bg-orange-500 text-white';
      default: return 'bg-slate-600 text-white';
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="bg-black py-8">
      <div className="max-w-6xl mx-auto px-4 space-y-4">
        {/* TOP BÌNH LUẬN */}
        <div className="border border-[#ffd875]/30 bg-black/40 backdrop-blur-sm rounded-lg p-4 shadow-[0_0_15px_rgba(0,0,0,0.2)] hover:shadow-[0_0_20px_rgba(255,216,117,0.15)] transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-[#ffd875] text-lg animate-pulse">🏆</span>
              <h2 className="text-base font-bold text-white">TOP BÌNH LUẬN</h2>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                className="p-2 rounded-full bg-black/50 text-gray-400 hover:text-[#ffd875] transition-all duration-300 hover:shadow-[0_0_10px_rgba(255,216,117,0.3)]"
                disabled={currentSlide === 0}
              >
                <span className="text-sm">‹</span>
              </button>
              <button
                onClick={() => setCurrentSlide(Math.min(topComments.length - 4, currentSlide + 1))}
                className="p-2 rounded-full bg-black/50 text-gray-400 hover:text-[#ffd875] transition-all duration-300 hover:shadow-[0_0_10px_rgba(255,216,117,0.3)]"
                disabled={currentSlide >= topComments.length - 4}
              >
                <span className="text-sm">›</span>
              </button>
            </div>
          </div>

          <div 
            className="overflow-hidden"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div 
              className="flex transition-transform duration-500 ease-in-out gap-4"
              style={{ transform: `translateX(-${currentSlide * (256 + 16)}px)` }}
            >
              {topComments.map((comment) => (
                <div
                  key={comment.id}
                  className="flex-shrink-0 w-64 border border-gray-300/20 bg-black/60 backdrop-blur-sm rounded-lg p-3 hover:border-[#ffd875]/50 transition-all duration-300"
                >
                  <div className="flex items-start space-x-3 mb-3">
                    <img
                      src={comment.user.avatar}
                      alt={comment.user.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-medium text-white truncate">
                          {comment.user.name}
                        </h4>
                        <span className="text-xs text-gray-400">{comment.timeAgo}</span>
                      </div>
                      <div className="flex items-center space-x-1 mb-2">
                        {renderStars(comment.rating)}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-300 leading-relaxed mb-3 line-clamp-3">
                    {comment.content}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="text-[#ffd875] font-medium">{comment.movie.title}</span>
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center space-x-1">
                        <span>❤️</span>
                        <span>{comment.stats.likes}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <span>💬</span>
                        <span>{comment.stats.replies}</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Grid - 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* SÔI NỔI NHẤT */}
          <div className="border border-[#ffd875]/30 bg-black/40 backdrop-blur-sm rounded-lg p-4 shadow-[0_0_15px_rgba(0,0,0,0.2)] hover:shadow-[0_0_20px_rgba(255,216,117,0.15)] transition-all duration-300">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-[#ffd875] text-base animate-pulse">🔥</span>
              <h3 className="text-base font-bold text-white">SÔI NỔI NHẤT</h3>
            </div>
            <div className="space-y-3">
              {hotMovies.map((movie) => (
                <Link
                  key={movie.id}
                  to={`/movie/${movie.id}`}
                  className="flex items-center space-x-3 p-2 rounded hover:bg-black/60 transition-all duration-300 group hover:shadow-[0_0_10px_rgba(255,216,117,0.1)]"
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${getRankBadgeColor(movie.rank)}`}>
                    {movie.rank}
                  </div>
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="w-8 h-11 rounded object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-white group-hover:text-[#ffd875] transition-colors duration-300 truncate">
                      {movie.title}
                    </h4>
                    <div className="flex items-center space-x-2 text-xs text-gray-400">
                      <span>{formatNumber(movie.stats.comments)}</span>
                      <span>•</span>
                      <span>{formatNumber(movie.stats.views)}</span>
                      {movie.trend === 'up' ? (
                        <span className="text-green-500">↗</span>
                      ) : (
                        <span className="text-red-500">↘</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
              <button className="text-xs text-gray-400 hover:text-[#ffd875] transition-colors duration-300">
                Xem thêm
              </button>
            </div>
          </div>

          {/* YÊU THÍCH NHẤT */}
          <div className="border border-[#ffd875]/30 bg-black/40 backdrop-blur-sm rounded-lg p-4 shadow-[0_0_15px_rgba(0,0,0,0.2)] hover:shadow-[0_0_20px_rgba(255,216,117,0.15)] transition-all duration-300">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-[#ffd875] text-base animate-pulse">❤️</span>
              <h3 className="text-base font-bold text-white">YÊU THÍCH NHẤT</h3>
            </div>
            <div className="space-y-3">
              {lovedMovies.map((movie) => (
                <Link
                  key={movie.id}
                  to={`/movie/${movie.id}`}
                  className="flex items-center space-x-3 p-2 rounded hover:bg-black/60 transition-all duration-300 group hover:shadow-[0_0_10px_rgba(255,216,117,0.1)]"
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${getRankBadgeColor(movie.rank)}`}>
                    {movie.rank}
                  </div>
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="w-8 h-11 rounded object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-white group-hover:text-[#ffd875] transition-colors duration-300 truncate">
                      {movie.title}
                    </h4>
                    <div className="flex items-center space-x-2 text-xs text-gray-400">
                      <span>{formatNumber(movie.stats.comments)}</span>
                      <span>•</span>
                      <span>{formatNumber(movie.stats.views)}</span>
                      {movie.trend === 'up' ? (
                        <span className="text-green-500">↗</span>
                      ) : (
                        <span className="text-red-500">↘</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
              <button className="text-xs text-gray-400 hover:text-[#ffd875] transition-colors duration-300">
                Xem thêm
              </button>
            </div>
          </div>

          {/* THỂ LOẠI HOT */}
          <div className="border border-[#ffd875]/30 bg-black/40 backdrop-blur-sm rounded-lg p-4 shadow-[0_0_15px_rgba(0,0,0,0.2)] hover:shadow-[0_0_20px_rgba(255,216,117,0.15)] transition-all duration-300">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-[#ffd875] text-base animate-pulse">✨</span>
              <h3 className="text-base font-bold text-white">THỂ LOẠI HOT</h3>
            </div>
            <div className="space-y-2">
              {hotGenres.map((genre) => (
                <Link
                  key={genre.id}
                  to={`/genre/${genre.id}`}
                  className="flex items-center justify-between p-2 rounded hover:bg-black/60 transition-all duration-300 group hover:shadow-[0_0_10px_rgba(255,216,117,0.1)]"
                >
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${genre.color}`}></div>
                    <span className="text-sm text-white group-hover:text-[#ffd875] transition-colors duration-300">
                      {genre.name}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 font-medium">
                    {genre.count}
                  </span>
                </Link>
              ))}
              <button className="text-xs text-gray-400 hover:text-[#ffd875] transition-colors duration-300">
                Xem thêm
              </button>
            </div>
          </div>

          {/* BÌNH LUẬN MỚI */}
          <div className="border border-[#ffd875]/30 bg-black/40 backdrop-blur-sm rounded-lg p-4 shadow-[0_0_15px_rgba(0,0,0,0.2)] hover:shadow-[0_0_20px_rgba(255,216,117,0.15)] transition-all duration-300">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-[#ffd875] text-base animate-pulse">🕒</span>
              <h3 className="text-base font-bold text-white">BÌNH LUẬN MỚI</h3>
            </div>
            <div className="h-80 overflow-hidden relative">
              <div 
                className="transition-transform duration-1000 ease-in-out"
                style={{ 
                  transform: `translateY(-${currentVerticalIndex * 64}px)` 
                }}
              >
                {[...recentComments, ...recentComments].map((comment, index) => (
                  <div
                    key={`${comment.id}-${index}`}
                    className="h-16 flex items-start space-x-2 p-2 hover:bg-black/60 transition-all duration-300"
                  >
                    <img
                      src={comment.user.avatar}
                      alt={comment.user.name}
                      className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs font-medium text-white truncate">
                          {comment.user.name}
                        </span>
                        <span className="text-xs text-gray-500">{comment.timeAgo}</span>
                      </div>
                      <p className="text-xs text-gray-300 line-clamp-1 mb-1">
                        {comment.content}
                      </p>
                      <span className="text-xs text-[#ffd875] truncate block">
                        {comment.movieTitle}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunitySection;

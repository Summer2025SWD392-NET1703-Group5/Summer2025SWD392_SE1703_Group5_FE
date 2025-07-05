import React, { useState } from 'react';
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  CalendarDaysIcon,
  TicketIcon,
  CogIcon,
  EyeIcon,
  EyeSlashIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  MapPinIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';

interface BookingHistory {
  id: string;
  movieTitle: string;
  moviePoster: string;
  cinemaName: string;
  cinemaAddress: string;
  date: string;
  time: string;
  seats: string[];
  totalPrice: number;
  status: 'confirmed' | 'cancelled' | 'completed';
  bookingDate: string;
}

const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'bookings' | 'settings'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mock user data
  const [userInfo, setUserInfo] = useState({
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@example.com',
    phone: '0123456789',
    dateOfBirth: '1990-01-15',
    gender: 'male',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
    joinDate: '2023-01-15',
    totalBookings: 12,
    totalSpent: 2400000
  });

  const [editForm, setEditForm] = useState(userInfo);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Validation functions
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate name (required)
    if (!editForm.name.trim()) {
      newErrors.name = 'Họ và tên là bắt buộc';
    } else if (editForm.name.trim().length < 2) {
      newErrors.name = 'Họ và tên phải có ít nhất 2 ký tự';
    }

    // Validate email (required)
    if (!editForm.email.trim()) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    // Validate phone (required)
    if (!editForm.phone.trim()) {
      newErrors.phone = 'Số điện thoại là bắt buộc';
    } else if (!/^[0-9]{10,11}$/.test(editForm.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại phải có 10-11 chữ số';
    }

    // Validate date of birth (required, must be over 16)
    if (!editForm.dateOfBirth) {
      newErrors.dateOfBirth = 'Ngày sinh là bắt buộc';
    } else {
      const birthDate = new Date(editForm.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      if (age < 16) {
        newErrors.dateOfBirth = 'Bạn phải từ 16 tuổi trở lên';
      }
    }

    // Validate gender (required)
    if (!editForm.gender) {
      newErrors.gender = 'Giới tính là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Mock booking history
  const bookingHistory: BookingHistory[] = [
    {
      id: 'BK123456',
      movieTitle: 'Spider-Man: No Way Home',
      moviePoster: 'https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
      cinemaName: 'CGV Vincom Center',
      cinemaAddress: '191 Bà Triệu, Hai Bà Trưng, Hà Nội',
      date: '2024-06-10',
      time: '19:30',
      seats: ['A5', 'A6'],
      totalPrice: 300000,
      status: 'confirmed',
      bookingDate: '2024-06-05'
    },
    {
      id: 'BK123455',
      movieTitle: 'Avengers: Endgame',
      moviePoster: 'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
      cinemaName: 'Lotte Cinema Landmark',
      cinemaAddress: 'E6 Cầu Giấy, Cầu Giấy, Hà Nội',
      date: '2024-05-20',
      time: '21:00',
      seats: ['B7', 'B8'],
      totalPrice: 320000,
      status: 'completed',
      bookingDate: '2024-05-15'
    },
    {
      id: 'BK123454',
      movieTitle: 'Top Gun: Maverick',
      moviePoster: 'https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg',
      cinemaName: 'Galaxy Cinema Nguyễn Du',
      cinemaAddress: '116 Nguyễn Du, Hai Bà Trưng, Hà Nội',
      date: '2024-05-01',
      time: '15:30',
      seats: ['C10'],
      totalPrice: 150000,
      status: 'completed',
      bookingDate: '2024-04-28'
    },
    {
      id: 'BK123453',
      movieTitle: 'The Batman',
      moviePoster: 'https://image.tmdb.org/t/p/w500/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg',
      cinemaName: 'CGV Vincom Center',
      cinemaAddress: '191 Bà Triệu, Hai Bà Trưng, Hà Nội',
      date: '2024-04-15',
      time: '18:00',
      seats: ['D5', 'D6', 'D7'],
      totalPrice: 450000,
      status: 'cancelled',
      bookingDate: '2024-04-10'
    }
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string, timeString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('vi-VN', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }),
      time: timeString
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-[#FFD875] bg-[#FFD875]/10 border-[#FFD875]/20 shadow-[0_0_10px_rgba(255,216,117,0.2)]';
      case 'completed':
        return 'text-[#FFD875] bg-[#FFD875]/10 border-[#FFD875]/20 shadow-[0_0_10px_rgba(255,216,117,0.2)]';
      case 'cancelled':
        return 'text-red-400 bg-red-400/10 border-red-400/20';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Đã xác nhận';
      case 'completed':
        return 'Đã hoàn thành';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return 'Không xác định';
    }
  };

  const handleSaveProfile = () => {
    if (validateForm()) {
    setUserInfo(editForm);
    setIsEditing(false);
      setErrors({});
    }
  };

  const handleCancelEdit = () => {
    setEditForm(userInfo);
    setIsEditing(false);
    setErrors({});
  };

  const handleFormChange = (field: string, value: string) => {
    setEditForm({ ...editForm, [field]: value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Mật khẩu xác nhận không khớp!');
      return;
    }
    // Handle password change logic here
    alert('Đổi mật khẩu thành công!');
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <div className="glass-dark rounded-2xl p-6 mb-8 border border-gray-700/50">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
              <div className="relative group">
                <img
                  src={userInfo.avatar}
                  alt={userInfo.name}
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-yellow-400/20 group-hover:ring-yellow-400/40 transition-all duration-300"
                />
                <button className="absolute bottom-0 right-0 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black p-2 rounded-full hover:scale-110 transition-transform duration-300 shadow-lg">
                  <PencilIcon className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-white mb-2">{userInfo.name}</h1>
                <p className="text-gray-400 mb-4 flex items-center justify-center md:justify-start">
                  <EnvelopeIcon className="w-4 h-4 mr-2" />
                  {userInfo.email}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                  <div className="text-center md:text-left">
                    <div className="text-3xl font-bold text-[#FFD875] mb-1 drop-shadow-[0_0_10px_rgba(255,216,117,0.5)]">{userInfo.totalBookings}</div>
                    <div className="text-gray-400">Vé đã đặt</div>
                  </div>
                  <div className="text-center md:text-left">
                    <div className="text-3xl font-bold text-[#FFD875] mb-1 drop-shadow-[0_0_10px_rgba(255,216,117,0.5)]">{formatPrice(userInfo.totalSpent)}</div>
                    <div className="text-gray-400">Tổng chi tiêu</div>
                  </div>
                  <div className="text-center md:text-left">
                    <div className="text-lg font-bold text-[#FFD875] mb-1 drop-shadow-[0_0_10px_rgba(255,216,117,0.5)]">{formatDate(userInfo.joinDate)}</div>
                    <div className="text-gray-400">Ngày tham gia</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="glass-dark rounded-2xl overflow-hidden border border-gray-700/50">
            <div className="flex border-b border-gray-700/50">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-300 ${activeTab === 'profile'
                  ? 'text-[#FFD875] bg-[#FFD875]/10 border-b-2 border-[#FFD875] shadow-[0_0_10px_rgba(255,216,117,0.2)]'
                  : 'text-gray-400 hover:text-[#FFD875] hover:bg-[#FFD875]/5'
                }`}
              >
                <UserIcon className="w-5 h-5 inline-block mr-2" />
                Thông tin cá nhân
              </button>
              <button
                onClick={() => setActiveTab('bookings')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-300 ${activeTab === 'bookings'
                  ? 'text-[#FFD875] bg-[#FFD875]/10 border-b-2 border-[#FFD875] shadow-[0_0_10px_rgba(255,216,117,0.2)]'
                  : 'text-gray-400 hover:text-[#FFD875] hover:bg-[#FFD875]/5'
                }`}
              >
                <TicketIcon className="w-5 h-5 inline-block mr-2" />
                Lịch sử đặt vé
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-300 ${activeTab === 'settings'
                  ? 'text-[#FFD875] bg-[#FFD875]/10 border-b-2 border-[#FFD875] shadow-[0_0_10px_rgba(255,216,117,0.2)]'
                  : 'text-gray-400 hover:text-[#FFD875] hover:bg-[#FFD875]/5'
                }`}
              >
                <CogIcon className="w-5 h-5 inline-block mr-2" />
                Cài đặt
              </button>
            </div>

            <div className="p-6">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="animate-fadeInUp">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">Thông tin cá nhân</h2>
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="bg-gradient-to-r from-[#FFD875] to-[#FFD875] text-black font-semibold px-6 py-2 rounded-lg hover:shadow-[0_0_20px_rgba(255,216,117,0.4)] transition-all duration-300 transform hover:scale-105 shadow-[0_0_10px_rgba(255,216,117,0.2)] flex items-center space-x-2"
                      >
                        <PencilIcon className="w-4 h-4" />
                        <span>Chỉnh sửa</span>
                      </button>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          onClick={handleSaveProfile}
                          className="bg-gradient-to-r from-[#FFD875] to-[#FFD875] text-black font-semibold px-6 py-2 rounded-lg hover:shadow-[0_0_20px_rgba(255,216,117,0.4)] transition-all duration-300 transform hover:scale-105 shadow-[0_0_10px_rgba(255,216,117,0.2)] flex items-center space-x-2"
                        >
                          <CheckIcon className="w-4 h-4" />
                          <span>Lưu</span>
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
                        >
                          <XMarkIcon className="w-4 h-4" />
                          <span>Hủy</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-400 text-sm font-semibold mb-2">
                        Họ và tên <span className="text-red-500">*</span>
                      </label>
                      {isEditing ? (
                        <div>
                        <input
                          type="text"
                          value={editForm.name}
                            onChange={(e) => handleFormChange('name', e.target.value)}
                            className={`w-full p-3 glass-dark text-white rounded-lg border transition-all duration-300 ${errors.name
                              ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                              : 'border-gray-600 focus:border-[#FFD875] focus:outline-none focus:ring-2 focus:ring-[#FFD875]/20 focus:shadow-[0_0_10px_rgba(255,216,117,0.3)]'
                              }`}
                            placeholder="Nhập họ và tên"
                          />
                          {errors.name && (
                            <p className="text-red-400 text-xs mt-1">{errors.name}</p>
                          )}
                        </div>
                      ) : (
                        <div className="p-3 glass-dark text-white rounded-lg border border-gray-700/50">
                          {userInfo.name}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm font-semibold mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      {isEditing ? (
                        <div>
                        <input
                          type="email"
                          value={editForm.email}
                            onChange={(e) => handleFormChange('email', e.target.value)}
                            className={`w-full p-3 glass-dark text-white rounded-lg border transition-all duration-300 ${errors.email
                              ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                              : 'border-gray-600 focus:border-[#FFD875] focus:outline-none focus:ring-2 focus:ring-[#FFD875]/20 focus:shadow-[0_0_10px_rgba(255,216,117,0.3)]'
                              }`}
                            placeholder="Nhập địa chỉ email"
                          />
                          {errors.email && (
                            <p className="text-red-400 text-xs mt-1">{errors.email}</p>
                          )}
                        </div>
                      ) : (
                        <div className="p-3 glass-dark text-white rounded-lg border border-gray-700/50">
                          {userInfo.email}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm font-semibold mb-2">
                        Số điện thoại <span className="text-red-500">*</span>
                      </label>
                      {isEditing ? (
                        <div>
                        <input
                          type="tel"
                          value={editForm.phone}
                            onChange={(e) => handleFormChange('phone', e.target.value)}
                            className={`w-full p-3 glass-dark text-white rounded-lg border transition-all duration-300 ${errors.phone
                              ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                              : 'border-gray-600 focus:border-[#FFD875] focus:outline-none focus:ring-2 focus:ring-[#FFD875]/20 focus:shadow-[0_0_10px_rgba(255,216,117,0.3)]'
                              }`}
                            placeholder="Nhập số điện thoại"
                        />
                          {errors.phone && (
                            <p className="text-red-400 text-xs mt-1">{errors.phone}</p>
                          )}
                        </div>
                      ) : (
                        <div className="p-3 glass-dark text-white rounded-lg border border-gray-700/50">
                          {userInfo.phone}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm font-semibold mb-2">
                        Ngày sinh <span className="text-red-500">*</span>
                      </label>
                      {isEditing ? (
                        <div>
                        <input
                          type="date"
                          value={editForm.dateOfBirth}
                            onChange={(e) => handleFormChange('dateOfBirth', e.target.value)}
                            className={`w-full p-3 glass-dark text-white rounded-lg border transition-all duration-300 ${errors.dateOfBirth
                              ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                              : 'border-gray-600 focus:border-[#FFD875] focus:outline-none focus:ring-2 focus:ring-[#FFD875]/20 focus:shadow-[0_0_10px_rgba(255,216,117,0.3)]'
                              }`}
                          />
                          {errors.dateOfBirth && (
                            <p className="text-red-400 text-xs mt-1">{errors.dateOfBirth}</p>
                          )}
                        </div>
                      ) : (
                        <div className="p-3 glass-dark text-white rounded-lg border border-gray-700/50">
                          {formatDate(userInfo.dateOfBirth)}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm font-semibold mb-2">
                        Giới tính <span className="text-red-500">*</span>
                      </label>
                      {isEditing ? (
                        <div>
                        <select
                          value={editForm.gender}
                            onChange={(e) => handleFormChange('gender', e.target.value)}
                            className={`w-full p-3 glass-dark text-white rounded-lg border transition-all duration-300 ${errors.gender
                              ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                              : 'border-gray-600 focus:border-[#FFD875] focus:outline-none focus:ring-2 focus:ring-[#FFD875]/20 focus:shadow-[0_0_10px_rgba(255,216,117,0.3)]'
                              }`}
                          >
                            <option value="">Chọn giới tính</option>
                          <option value="male">Nam</option>
                          <option value="female">Nữ</option>
                          <option value="other">Khác</option>
                        </select>
                          {errors.gender && (
                            <p className="text-red-400 text-xs mt-1">{errors.gender}</p>
                          )}
                        </div>
                      ) : (
                        <div className="p-3 glass-dark text-white rounded-lg border border-gray-700/50">
                          {userInfo.gender === 'male' ? 'Nam' : userInfo.gender === 'female' ? 'Nữ' : 'Khác'}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm font-semibold mb-2">
                        Ngày tham gia
                      </label>
                      <div className="p-3 glass-dark text-gray-400 rounded-lg border border-gray-700/50">
                        {formatDate(userInfo.joinDate)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bookings Tab */}
              {activeTab === 'bookings' && (
                <div className="animate-fadeInUp">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">Lịch sử đặt vé</h2>
                    <div className="text-sm text-gray-400">
                      Tổng cộng: <span className="text-[#FFD875] font-semibold drop-shadow-[0_0_8px_rgba(255,216,117,0.5)]">{bookingHistory.length}</span> vé
                    </div>
                  </div>

                  <div className="space-y-4">
                    {bookingHistory.map((booking) => {
                      const dateTime = formatDateTime(booking.date, booking.time);
                      return (
                        <div
                          key={booking.id}
                          className="glass-dark rounded-xl p-6 border border-gray-700/50 hover:border-[#FFD875]/30 transition-all duration-300 group"
                        >
                          <div className="flex flex-col lg:flex-row gap-6">
                            {/* Movie Poster */}
                            <div className="flex-shrink-0">
                              <img
                                src={booking.moviePoster}
                                alt={booking.movieTitle}
                                className="w-24 h-36 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>

                            {/* Booking Details */}
                            <div className="flex-1 space-y-4">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                  <h3 className="text-xl font-bold text-white mb-2">{booking.movieTitle}</h3>
                                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                                    <span className="flex items-center">
                                      <MapPinIcon className="w-4 h-4 mr-1" />
                                      {booking.cinemaName}
                                    </span>
                                    <span className="flex items-center">
                                      <ClockIcon className="w-4 h-4 mr-1" />
                                      {dateTime.date} - {dateTime.time}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                                    {getStatusText(booking.status)}
                                  </span>
                                  <span className="text-lg font-bold text-[#FFD875] drop-shadow-[0_0_8px_rgba(255,216,117,0.5)]">
                                    {formatPrice(booking.totalPrice)}
                                  </span>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-400">Địa chỉ rạp:</span>
                                  <p className="text-white mt-1">{booking.cinemaAddress}</p>
                                </div>
                                <div>
                                  <span className="text-gray-400">Ghế ngồi:</span>
                                  <p className="text-white mt-1">
                                    {booking.seats.map((seat, index) => (
                                      <span
                                        key={seat}
                                        className="inline-block bg-[#FFD875]/20 text-[#FFD875] px-2 py-1 rounded mr-2 mb-1 shadow-[0_0_8px_rgba(255,216,117,0.3)]"
                                      >
                                        {seat}
                                      </span>
                                    ))}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-gray-400">Mã đặt vé:</span>
                                  <p className="text-white mt-1 font-mono">{booking.id}</p>
                                </div>
                                <div>
                                  <span className="text-gray-400">Ngày đặt:</span>
                                  <p className="text-white mt-1">{formatDate(booking.bookingDate)}</p>
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex space-x-3 pt-4 border-t border-gray-700/50">
                                {booking.status === 'confirmed' && (
                                  <>
                                    <button className="bg-gradient-to-r from-[#FFD875] to-[#FFD875] text-black font-semibold px-4 py-2 rounded-lg hover:shadow-[0_0_15px_rgba(255,216,117,0.4)] transition-all duration-300 transform hover:scale-105 shadow-[0_0_8px_rgba(255,216,117,0.2)] text-sm">
                                      Xem vé
                                    </button>
                                    <button className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm">
                                      Hủy vé
                                    </button>
                                  </>
                                )}
                                {booking.status === 'completed' && (
                                  <button className="bg-gradient-to-r from-[#FFD875] to-[#FFD875] text-black font-semibold px-4 py-2 rounded-lg hover:shadow-[0_0_15px_rgba(255,216,117,0.4)] transition-all duration-300 transform hover:scale-105 shadow-[0_0_8px_rgba(255,216,117,0.2)] text-sm">
                                    Đánh giá phim
                                  </button>
                                )}
                                <button className="px-4 py-2 bg-gray-600/50 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors text-sm">
                                  Chi tiết
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {bookingHistory.length === 0 && (
                    <div className="text-center py-12">
                      <TicketIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-400 mb-2">Chưa có lịch sử đặt vé</h3>
                      <p className="text-gray-500 mb-6">Bạn chưa đặt vé xem phim nào. Hãy khám phá những bộ phim hot nhất!</p>
                      <button className="bg-[#FFD875] text-black font-bold px-6 py-3 rounded-lg hover:shadow-[0_0_20px_rgba(255,216,117,0.6)] transition-all duration-300 transform hover:scale-105 shadow-[0_0_10px_rgba(255,216,117,0.3)]">
                        Đặt vé ngay
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="animate-fadeInUp">
                  <h2 className="text-2xl font-bold text-white mb-6">Cài đặt tài khoản</h2>

                  {/* Change Password */}
                  <div className="glass-dark rounded-xl p-6 border border-gray-700/50 mb-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Đổi mật khẩu</h3>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                      <div>
                        <label className="block text-gray-400 text-sm font-semibold mb-2">
                          Mật khẩu hiện tại
                        </label>
                        <div className="relative">
                          <input
                            type={showCurrentPassword ? 'text' : 'password'}
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                            className="w-full p-3 glass-dark text-white rounded-lg border border-gray-600 focus:border-[#FFD875] focus:outline-none focus:ring-2 focus:ring-[#FFD875]/20 focus:shadow-[0_0_10px_rgba(255,216,117,0.3)] transition-all duration-300 pr-12"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                          >
                            {showCurrentPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-400 text-sm font-semibold mb-2">
                          Mật khẩu mới
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                            className="w-full p-3 glass-dark text-white rounded-lg border border-gray-600 focus:border-[#FFD875] focus:outline-none focus:ring-2 focus:ring-[#FFD875]/20 focus:shadow-[0_0_10px_rgba(255,216,117,0.3)] transition-all duration-300 pr-12"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                          >
                            {showNewPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-400 text-sm font-semibold mb-2">
                          Xác nhận mật khẩu mới
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                            className="w-full p-3 glass-dark text-white rounded-lg border border-gray-600 focus:border-[#FFD875] focus:outline-none focus:ring-2 focus:ring-[#FFD875]/20 focus:shadow-[0_0_10px_rgba(255,216,117,0.3)] transition-all duration-300 pr-12"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                          >
                            {showConfirmPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="bg-gradient-to-r from-[#FFD875] to-[#FFD875] text-black font-semibold px-6 py-3 rounded-lg hover:shadow-[0_0_20px_rgba(255,216,117,0.4)] transition-all duration-300 transform hover:scale-105 shadow-[0_0_10px_rgba(255,216,117,0.2)] w-full sm:w-auto"
                      >
                        Đổi mật khẩu
                      </button>
                    </form>
                  </div>

                  {/* Notification Settings */}
                  <div className="glass-dark rounded-xl p-6 border border-gray-700/50 mb-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Cài đặt thông báo</h3>
                    <div className="space-y-4">
                      <label className="flex items-center justify-between cursor-pointer">
                        <div>
                          <span className="text-white font-medium">Thông báo email</span>
                          <p className="text-sm text-gray-400">Nhận thông báo về đặt vé và khuyến mãi qua email</p>
                        </div>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="toggle-checkbox"
                        />
                      </label>

                      <label className="flex items-center justify-between cursor-pointer">
                        <div>
                          <span className="text-white font-medium">Thông báo push</span>
                          <p className="text-sm text-gray-400">Nhận thông báo trên trình duyệt</p>
                        </div>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="toggle-checkbox"
                        />
                      </label>

                      <label className="flex items-center justify-between cursor-pointer">
                        <div>
                          <span className="text-white font-medium">Thông báo khuyến mãi</span>
                          <p className="text-sm text-gray-400">Nhận thông báo về các chương trình khuyến mãi</p>
                        </div>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="toggle-checkbox"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Privacy Settings */}
                  <div className="glass-dark rounded-xl p-6 border border-gray-700/50">
                    <h3 className="text-lg font-semibold text-white mb-4">Quyền riêng tư</h3>
                    <div className="space-y-4">
                      <label className="flex items-center justify-between cursor-pointer">
                        <div>
                          <span className="text-white font-medium">Hiển thị thông tin công khai</span>
                          <p className="text-sm text-gray-400">Cho phép người khác xem thông tin cơ bản của bạn</p>
                        </div>
                        <input
                          type="checkbox"
                          className="toggle-checkbox"
                        />
                      </label>

                      <label className="flex items-center justify-between cursor-pointer">
                        <div>
                          <span className="text-white font-medium">Chia sẻ lịch sử xem phim</span>
                          <p className="text-sm text-gray-400">Cho phép chia sẻ lịch sử xem phim với bạn bè</p>
                        </div>
                        <input
                          type="checkbox"
                          className="toggle-checkbox"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;


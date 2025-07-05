import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  UserIcon,
  StarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

interface CustomerReview {
  id: string;
  customerId: string;
  customerName: string;
  email: string;
  phone: string;
  membershipLevel: 'bronze' | 'silver' | 'gold' | 'platinum';
  points: number;
  rating: number;
  lastVisit: Date;
  bookingsCount: number;
  totalSpent: number;
  notes: string;
}

// Mock customer reviews data
const MOCK_REVIEWS: CustomerReview[] = [
  {
    id: '1',
    customerId: '1',
    customerName: 'Nguyễn Văn A',
    email: 'nguyenvana@example.com',
    phone: '0901234567',
    membershipLevel: 'platinum',
    points: 2500,
    rating: 4.5,
    lastVisit: new Date('2023-07-10'),
    bookingsCount: 25,
    totalSpent: 4500000,
    notes: 'Khách hàng thân thiết, luôn đến đúng giờ và giữ trật tự trong rạp.'
  },
  {
    id: '2',
    customerId: '2',
    customerName: 'Trần Thị B',
    email: 'tranthib@example.com',
    phone: '0912345678',
    membershipLevel: 'gold',
    points: 1800,
    rating: 5.0,
    lastVisit: new Date('2023-07-15'),
    bookingsCount: 18,
    totalSpent: 3200000,
    notes: 'Khách hàng thân thiện, thường đi xem phim cùng gia đình vào cuối tuần.'
  },
  {
    id: '3',
    customerId: '3',
    customerName: 'Lê Văn C',
    email: 'levanc@example.com',
    phone: '0923456789',
    membershipLevel: 'silver',
    points: 950,
    rating: 3.5,
    lastVisit: new Date('2023-06-28'),
    bookingsCount: 10,
    totalSpent: 1800000,
    notes: 'Khách hàng đôi khi phàn nàn về dịch vụ, cần chú ý phục vụ tốt hơn.'
  },
  {
    id: '4',
    customerId: '4',
    customerName: 'Phạm Thị D',
    email: 'phamthid@example.com',
    phone: '0934567890',
    membershipLevel: 'bronze',
    points: 350,
    rating: 2.0,
    lastVisit: new Date('2023-05-12'),
    bookingsCount: 3,
    totalSpent: 600000,
    notes: 'Khách hàng từng phàn nàn về chất lượng âm thanh và dịch vụ bán hàng.'
  },
  {
    id: '5',
    customerId: '5',
    customerName: 'Hoàng Văn E',
    email: 'hoangvane@example.com',
    phone: '0945678901',
    membershipLevel: 'gold',
    points: 1500,
    rating: 4.0,
    lastVisit: new Date('2023-07-08'),
    bookingsCount: 15,
    totalSpent: 2800000,
    notes: 'Khách hàng thường xuyên đặt vé online, ít khi có vấn đề.'
  }
];

const CustomerReviews: React.FC = () => {
  const [reviews, setReviews] = useState<CustomerReview[]>(MOCK_REVIEWS);
  const [searchTerm, setSearchTerm] = useState('');
  const [membershipFilter, setMembershipFilter] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [selectedReview, setSelectedReview] = useState<CustomerReview | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editNotes, setEditNotes] = useState('');
  const [editRating, setEditRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  
  useEffect(() => {
    if (selectedReview) {
      setEditNotes(selectedReview.notes);
      setEditRating(selectedReview.rating);
    }
  }, [selectedReview]);
  
  const getMembershipColor = (level: string) => {
    switch (level) {
      case 'bronze':
        return 'bg-amber-700 bg-opacity-20 text-amber-700';
      case 'silver':
        return 'bg-slate-400 bg-opacity-20 text-slate-400';
      case 'gold':
        return 'bg-yellow-500 bg-opacity-20 text-yellow-500';
      case 'platinum':
        return 'bg-sky-400 bg-opacity-20 text-sky-400';
      default:
        return 'bg-gray-500 bg-opacity-20 text-gray-500';
    }
  };

  const getMembershipLabel = (level: string) => {
    switch (level) {
      case 'bronze':
        return 'Đồng';
      case 'silver':
        return 'Bạc';
      case 'gold':
        return 'Vàng';
      case 'platinum':
        return 'Bạch kim';
      default:
        return level;
    }
  };
  
  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.phone.includes(searchTerm);
    
    const matchesMembership = membershipFilter === 'all' || review.membershipLevel === membershipFilter;
    
    let matchesRating = true;
    if (ratingFilter === '4+') {
      matchesRating = review.rating >= 4;
    } else if (ratingFilter === '3+') {
      matchesRating = review.rating >= 3;
    } else if (ratingFilter === 'under3') {
      matchesRating = review.rating < 3;
    }
    
    return matchesSearch && matchesMembership && matchesRating;
  });
  
  const handleSaveReview = () => {
    if (!selectedReview) return;
    
    const updatedReviews = reviews.map(review => 
      review.id === selectedReview.id 
        ? { ...review, notes: editNotes, rating: editRating } 
        : review
    );
    
    setReviews(updatedReviews);
    setSelectedReview({ ...selectedReview, notes: editNotes, rating: editRating });
    setEditMode(false);
  };
  
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={`h-4 w-4 ${
              star <= Math.round(rating) ? 'text-FFD875 fill-current' : 'text-gray-400'
            }`}
          />
        ))}
        <span className="ml-1 text-white">{rating.toFixed(1)}</span>
      </div>
    );
  };
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Đánh giá khách hàng</h1>
        
        <div className="flex gap-2">
          <button 
            className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-all flex items-center gap-1"
          >
            <ArrowPathIcon className="w-4 h-4" />
            <span>Làm mới</span>
          </button>
        </div>
      </div>
      
      {/* Search and filter bar */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[300px]">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Tìm theo tên, email hoặc số điện thoại..."
              className="bg-slate-700 text-white pl-10 pr-4 py-2 rounded-lg border border-slate-600 focus:border-FFD875 focus:outline-none focus:ring-1 focus:ring-FFD875 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <FunnelIcon className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-gray-400 mr-2">Hạng thành viên:</span>
          </div>
          <select
            className="bg-slate-700 text-white px-3 py-2 rounded-lg border border-slate-600 focus:border-FFD875 focus:outline-none focus:ring-1 focus:ring-FFD875"
            value={membershipFilter}
            onChange={(e) => setMembershipFilter(e.target.value)}
          >
            <option value="all">Tất cả</option>
            <option value="bronze">Đồng</option>
            <option value="silver">Bạc</option>
            <option value="gold">Vàng</option>
            <option value="platinum">Bạch kim</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <StarIcon className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-gray-400 mr-2">Đánh giá:</span>
          </div>
          <select
            className="bg-slate-700 text-white px-3 py-2 rounded-lg border border-slate-600 focus:border-FFD875 focus:outline-none focus:ring-1 focus:ring-FFD875"
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
          >
            <option value="all">Tất cả</option>
            <option value="4+">4 sao trở lên</option>
            <option value="3+">3 sao trở lên</option>
            <option value="under3">Dưới 3 sao</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reviews table */}
        <div className="lg:col-span-2 bg-slate-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Khách hàng
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Hạng thành viên
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Đánh giá
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Lần cuối đến rạp
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Số lần đặt vé
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredReviews.length > 0 ? (
                  filteredReviews.map((review) => (
                    <tr 
                      key={review.id} 
                      className={`hover:bg-slate-750 cursor-pointer ${selectedReview?.id === review.id ? 'bg-slate-750' : ''}`}
                      onClick={() => setSelectedReview(review)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center">
                            <UserIcon className="h-6 w-6 text-FFD875" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">{review.customerName}</div>
                            <div className="text-sm text-gray-400">{review.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getMembershipColor(review.membershipLevel)}`}>
                          {getMembershipLabel(review.membershipLevel)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderStars(review.rating)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-white">
                        {format(review.lastVisit, 'dd/MM/yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-white">
                        {review.bookingsCount}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-400">
                      Không tìm thấy khách hàng nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="px-6 py-4 flex items-center justify-between border-t border-slate-700">
            <div className="text-sm text-gray-400">
              Hiển thị <span className="font-medium text-white">{filteredReviews.length}</span> trong tổng số <span className="font-medium text-white">{reviews.length}</span> khách hàng
            </div>
            
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-slate-700 text-white rounded hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                Trước
              </button>
              <button className="px-3 py-1 bg-FFD875 text-black rounded hover:bg-opacity-90 transition-colors" style={{ backgroundColor: '#FFD875' }}>
                1
              </button>
              <button className="px-3 py-1 bg-slate-700 text-white rounded hover:bg-slate-600 transition-colors">
                Sau
              </button>
            </div>
          </div>
        </div>
        
        {/* Review details */}
        <div className="lg:col-span-1 bg-slate-800 rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Chi tiết đánh giá</h2>
            
            {selectedReview ? (
              <div>
                <div className="flex items-center mb-6">
                  <div className="h-16 w-16 rounded-full bg-slate-700 flex items-center justify-center">
                    <UserIcon className="h-8 w-8 text-FFD875" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-semibold text-white">{selectedReview.customerName}</h3>
                    <div className="flex items-center">
                      <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getMembershipColor(selectedReview.membershipLevel)}`}>
                        {getMembershipLabel(selectedReview.membershipLevel)}
                      </span>
                      <span className="text-sm text-gray-400 ml-2">{selectedReview.points} điểm</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-gray-400 text-sm">Email:</div>
                      <div className="text-white">{selectedReview.email}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm">Số điện thoại:</div>
                      <div className="text-white">{selectedReview.phone}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 border-t border-slate-700 pt-4">
                    <div>
                      <div className="text-gray-400 text-sm">Số lần đặt vé:</div>
                      <div className="text-white">{selectedReview.bookingsCount}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm">Tổng chi tiêu:</div>
                      <div className="text-white">{selectedReview.totalSpent.toLocaleString('vi-VN')} đ</div>
                    </div>
                  </div>
                  
                  <div className="border-t border-slate-700 pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-gray-400 text-sm">Đánh giá khách hàng:</div>
                      {!editMode && (
                        <button 
                          onClick={() => setEditMode(true)}
                          className="text-FFD875 hover:text-yellow-400 transition-colors text-sm flex items-center"
                        >
                          <PencilIcon className="h-3 w-3 mr-1" />
                          Chỉnh sửa
                        </button>
                      )}
                    </div>
                    
                    {editMode ? (
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            className={`${
                              (hoverRating || editRating) >= star
                                ? 'text-FFD875'
                                : 'text-gray-400'
                            } h-8 w-8 focus:outline-none transition-colors`}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setEditRating(star)}
                          >
                            <StarIcon
                              className={`h-6 w-6 ${
                                (hoverRating || editRating) >= star
                                  ? 'fill-current'
                                  : 'stroke-current'
                              }`}
                            />
                          </button>
                        ))}
                        <span className="ml-2 text-white">
                          {editRating.toFixed(1)}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <StarIcon
                            key={star}
                            className={`h-5 w-5 ${
                              star <= Math.round(selectedReview.rating) ? 'text-FFD875 fill-current' : 'text-gray-400'
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-white">{selectedReview.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="border-t border-slate-700 pt-4">
                    <div className="text-gray-400 text-sm mb-2">Ghi chú:</div>
                    {editMode ? (
                      <textarea
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        rows={4}
                        className="bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-FFD875 focus:outline-none focus:ring-1 focus:ring-FFD875 w-full"
                      />
                    ) : (
                      <div className="text-white bg-slate-700 p-3 rounded-lg">
                        {selectedReview.notes || 'Không có ghi chú'}
                      </div>
                    )}
                  </div>
                  
                  {editMode && (
                    <div className="flex gap-3 mt-6 border-t border-slate-700 pt-4">
                      <button 
                        onClick={handleSaveReview}
                        className="px-4 py-2 bg-FFD875 text-black rounded-lg hover:bg-opacity-90 transition-all flex-1 btn-glow"
                        style={{ backgroundColor: '#FFD875' }}
                      >
                        Lưu thay đổi
                      </button>
                      
                      <button 
                        onClick={() => {
                          setEditMode(false);
                          setEditNotes(selectedReview.notes);
                          setEditRating(selectedReview.rating);
                        }}
                        className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all flex-1"
                      >
                        Hủy
                      </button>
                    </div>
                  )}
                  
                  {!editMode && (
                    <div className="flex gap-3 mt-6 border-t border-slate-700 pt-4">
                      <Link
                        to={`/admin/customers/${selectedReview.customerId}`}
                        className="px-4 py-2 bg-FFD875 text-black rounded-lg hover:bg-opacity-90 transition-all flex-1 text-center btn-glow"
                        style={{ backgroundColor: '#FFD875' }}
                      >
                        Xem chi tiết KH
                      </Link>
                      
                      <Link
                        to={`/admin/customers/${selectedReview.customerId}/bookings`}
                        className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all flex-1 text-center"
                      >
                        Xem lịch sử đặt vé
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <UserIcon className="h-16 w-16 mx-auto mb-4 text-gray-500" />
                <p>Chọn một khách hàng để xem đánh giá</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerReviews; 
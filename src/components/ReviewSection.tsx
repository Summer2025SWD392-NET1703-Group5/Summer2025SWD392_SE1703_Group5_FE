import React, { useState } from 'react';
import {
  StarIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
  PlusIcon
} from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import type { Review } from '../types';
import FullScreenLoader from './FullScreenLoader';

interface ReviewSectionProps {
  movieId: string | number;
  reviews: Review[];
  onSubmitReview?: (rating: number, content: string) => Promise<boolean>;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({ movieId, reviews, onSubmitReview }) => {
  const [userReview, setUserReview] = useState('');
  const [userRating, setUserRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{ success?: boolean; message?: string }>({});

  // Tính rating trung bình
  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  // Xử lý gửi đánh giá
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userRating === 0) {
      setSubmissionResult({
        success: false,
        message: 'Vui lòng chọn số sao đánh giá'
      });
      return;
    }

    setIsSubmitting(true);
    setSubmissionResult({});

    try {
      // Call the provided onSubmitReview function if available
      if (onSubmitReview) {
        const success = await onSubmitReview(userRating, userReview);

        if (success) {
          // Reset form on success
          setUserReview('');
          setUserRating(0);
          setSubmissionResult({
            success: true,
            message: 'Cảm ơn bạn đã gửi đánh giá!'
          });
        } else {
          setSubmissionResult({
            success: false,
            message: 'Không thể gửi đánh giá. Vui lòng thử lại sau.'
          });
        }
      } else {
        // If no onSubmitReview provided, simulate success
        console.log({
          movieId,
          rating: userRating,
          content: userReview,
          date: new Date().toISOString()
        });

        // Reset form
        setUserReview('');
        setUserRating(0);
        setSubmissionResult({
          success: true,
          message: 'Cảm ơn bạn đã gửi đánh giá! (Giả lập)'
        });
      }
    } catch (err) {
      console.error("Lỗi khi đánh giá:", err);
      setSubmissionResult({
        success: false,
        message: 'Đã xảy ra lỗi. Vui lòng thử lại sau.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hiển thị số reviews giới hạn hoặc tất cả
  const displayedReviews = showAllReviews
    ? reviews
    : reviews.slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Tổng quan đánh giá */}
      <div className="glass-dark p-6 rounded-2xl">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="text-center">
            <div className="text-5xl font-bold text-white mb-2">{averageRating}</div>
            <div className="flex justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon
                  key={star}
                  className={`w-5 h-5 ${star <= Math.round(parseFloat(averageRating))
                    ? 'text-[#FFD875]'
                    : 'text-gray-600'
                    }`}
                />
              ))}
            </div>
            <p className="text-gray-400 text-sm mt-1">{reviews.length} đánh giá</p>
          </div>

          <div className="flex-1">
            {/* Phân bố rating */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = reviews.filter(review => review.rating === star).length;
                const percentage = reviews.length > 0
                  ? Math.round((count / reviews.length) * 100)
                  : 0;

                return (
                  <div key={star} className="flex items-center gap-2">
                    <div className="flex items-center w-12">
                      <span className="text-gray-400 text-sm">{star}</span>
                      <StarIcon className="w-4 h-4 text-[#FFD875] ml-1" />
                    </div>
                    <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-gray-400 text-sm w-10">{percentage}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Form đánh giá */}
      <div className="glass-dark p-6 rounded-2xl">
        <h3 className="text-xl font-normal text-white mb-4">Viết đánh giá</h3>

        <form onSubmit={handleSubmitReview} className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-2">Đánh giá của bạn</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setUserRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="text-2xl focus:outline-none"
                >
                  {star <= (hoveredRating || userRating) ? (
                    <StarIcon className="w-8 h-8 text-[#FFD875]" />
                  ) : (
                    <StarOutlineIcon className="w-8 h-8 text-gray-500" />
                  )}
                </button>
              ))}
              {userRating > 0 && (
                <span className="ml-2 text-gray-300">
                  {userRating === 5 ? 'Tuyệt vời' :
                    userRating === 4 ? 'Rất tốt' :
                      userRating === 3 ? 'Bình thường' :
                        userRating === 2 ? 'Không tốt' : 'Tệ'}
                </span>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="review" className="block text-gray-300 mb-2">Nhận xét của bạn</label>
            <textarea
              id="review"
              value={userReview}
              onChange={(e) => setUserReview(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              rows={4}
              placeholder="Chia sẻ cảm nhận của bạn về bộ phim..."
            ></textarea>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2 rounded-lg transition-colors ${isSubmitting
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#ffd875] to-[#ffb347] text-black hover:from-[#ffb347] hover:to-[#ffd875]'
                }`}
            >
              {isSubmitting ? <span className="inline-block"><FullScreenLoader variant="inline" size="small" /></span> : 'Gửi đánh giá'}
            </button>
          </div>

          {/* Submission result notification */}
          {submissionResult.message && (
            <div className={`mt-4 px-4 py-3 rounded-lg ${submissionResult.success
              ? 'bg-green-800/50 text-green-200 border border-green-700'
              : 'bg-red-800/50 text-red-200 border border-red-700'
              }`}>
              {submissionResult.message}
            </div>
          )}
        </form>
      </div>

      {/* Danh sách đánh giá */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {displayedReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}

          {reviews.length > 3 && (
            <div className="text-center mt-6">
              <button
                onClick={() => setShowAllReviews(!showAllReviews)}
                className="px-6 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
              >
                {showAllReviews ? 'Thu gọn' : `Xem thêm ${reviews.length - 3} đánh giá`}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="glass-dark p-8 rounded-2xl text-center">
          <p className="text-gray-400">Chưa có đánh giá nào cho phim này.</p>
          <p className="text-gray-400">Hãy là người đầu tiên đánh giá!</p>
        </div>
      )}
    </div>
  );
};

// Component hiển thị một đánh giá
const ReviewCard: React.FC<{ review: Review }> = ({ review }) => {
  const formattedDate = new Date(review.date).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Add null check for review.user
  const userInitial = review.user ? review.user.charAt(0) : '?';

  return (
    <div className="glass-dark p-4 rounded-xl">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-medium">
            {userInitial}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-white font-medium">{review.user || 'Anonymous'}</h4>
              {review.isUpdated && (
                <span className="bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-400 text-xs font-medium px-2.5 py-1 rounded-full border border-orange-500/30 animate-pulse shadow-sm">
                  đã chỉnh sửa
                </span>
              )}
            </div>
            <p className="text-gray-400 text-sm">{formattedDate}</p>
          </div>
        </div>
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <StarIcon
              key={star}
              className={`w-4 h-4 ${star <= review.rating ? 'text-[#FFD875]' : 'text-gray-600'
                }`}
            />
          ))}
        </div>

      </div>
      <p className="mt-3 text-gray-300">{review.content}</p>
    </div>
  );
};

export default ReviewSection;


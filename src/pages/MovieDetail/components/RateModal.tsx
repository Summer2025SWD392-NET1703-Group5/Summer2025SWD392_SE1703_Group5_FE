import React, { useState } from "react";
import { rateMovie } from "../../../config/MovieApi";
import { showSuccessToast, showErrorToast } from "../../../components/utils/utils";

interface RateModalProps {
  isOpen: boolean;
  onClose: () => void;
  movieId: string;
  movieName: string;
  onRatingSubmitted: () => void;
}

const RateModal: React.FC<RateModalProps> = ({ isOpen, onClose, movieId, movieName, onRatingSubmitted }) => {
  const [userRating, setUserRating] = useState({
    rating: 0,
    comment: "",
  });
  const [submittingRating, setSubmittingRating] = useState(false);

  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (userRating.rating === 0) {
      showErrorToast("Vui lòng chọn số sao đánh giá");
      return;
    }

    try {
      setSubmittingRating(true);

      const ratingData = {
        rating: userRating.rating,
        comment: userRating.comment.trim(),
      };

      await rateMovie(movieId, ratingData);

      showSuccessToast("Đánh giá của bạn đã được gửi thành công!");

      // Reset form
      setUserRating({ rating: 0, comment: "" });
      onClose();
      onRatingSubmitted();
    } catch (error: any) {
      console.error("Error submitting rating:", error);
      const errorMessage = error.response?.data?.message || "Có lỗi xảy ra khi gửi đánh giá";
      showErrorToast(errorMessage);
    } finally {
      setSubmittingRating(false);
    }
  };

  const handleStarClick = (rating: number) => {
    setUserRating((prev) => ({ ...prev, rating }));
  };

  const renderRatingStars = (currentRating: number, interactive: boolean = false) => {
    const stars = [];

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`rating-star ${i <= currentRating ? "filled" : ""} ${interactive ? "interactive" : ""}`}
          onClick={interactive ? () => handleStarClick(i) : undefined}
        >
          ★
        </span>
      );
    }

    return stars;
  };

  if (!isOpen) return null;

  return (
    <div className="rating-form-overlay" onClick={onClose}>
      <div className="rating-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="rating-form-header">
          <h3>Đánh giá phim: {movieName}</h3>
          <button className="close-rating-form" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleRatingSubmit} className="rating-form">
          <div className="rating-section">
            <label>Chọn số sao (1-5):</label>
            <div className="star-rating">{renderRatingStars(userRating.rating, true)}</div>
            <div className="rating-text">{userRating.rating > 0 ? `${userRating.rating}/5 sao` : "Chưa chọn"}</div>
          </div>

          <div className="comment-section">
            <label htmlFor="comment">Nhận xét (không bắt buộc):</label>
            <textarea
              id="comment"
              value={userRating.comment}
              onChange={(e) => setUserRating((prev) => ({ ...prev, comment: e.target.value }))}
              placeholder="Chia sẻ cảm nhận của bạn về bộ phim..."
              maxLength={500}
              rows={4}
            />
            <small>{userRating.comment.length}/500 ký tự</small>
          </div>

          <div className="rating-form-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={submittingRating}>
              Hủy
            </button>
            <button type="submit" className="btn-submit" disabled={submittingRating || userRating.rating === 0}>
              {submittingRating ? "Đang gửi..." : "Gửi đánh giá"}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        /* Rating Form Styles - Enhanced */
        .rating-form-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 2rem;
          backdrop-filter: blur(10px);
        }

        .rating-form-modal {
          background: linear-gradient(135deg, #222 0%, #2a2a2a 100%);
          border-radius: 20px;
          width: 100%;
          max-width: 550px;
          max-height: 90vh;
          overflow-y: auto;
          border: 1px solid #444;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          animation: modalSlideIn 0.3s ease-out;
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-30px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .rating-form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2rem;
          border-bottom: 1px solid #333;
          background: rgba(255, 215, 0, 0.05);
        }

        .rating-form-header h3 {
          margin: 0;
          color: #fff;
          font-size: 1.4rem;
          font-weight: 600;
        }

        .close-rating-form {
          background: none;
          border: none;
          color: #ccc;
          font-size: 2rem;
          cursor: pointer;
          padding: 0.5rem;
          transition: all 0.3s ease;
          border-radius: 50%;
          width: 45px;
          height: 45px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-rating-form:hover {
          color: #ffd700;
          background: rgba(255, 215, 0, 0.1);
          transform: rotate(90deg);
        }

        .rating-form {
          padding: 2rem;
        }

        .rating-section {
          margin-bottom: 2rem;
        }

        .rating-section label {
          display: block;
          color: #fff;
          font-weight: 600;
          margin-bottom: 1rem;
          font-size: 1.1rem;
        }

        .star-rating {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
          justify-content: center;
        }

        .rating-star {
          font-size: 2rem;
          color: #444;
          transition: all 0.2s ease;
          cursor: default;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .rating-star.filled {
          color: #ffd700;
          text-shadow: 0 2px 8px rgba(255, 215, 0, 0.5);
          background: rgba(255, 215, 0, 0.1);
        }

        .rating-star.interactive {
          cursor: pointer;
        }

        .rating-star.interactive:hover {
          color: #ffd700;
          transform: scale(1.2);
          text-shadow: 0 4px 16px rgba(255, 215, 0, 0.6);
          background: rgba(255, 215, 0, 0.2);
        }

        .rating-text {
          color: #ffd700;
          font-size: 1.1rem;
          font-weight: 600;
          background: rgba(255, 215, 0, 0.1);
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          border: 1px solid rgba(255, 215, 0, 0.3);
          text-align: center;
          margin-top: 1rem;
        }

        .comment-section {
          margin-bottom: 2rem;
        }

        .comment-section label {
          display: block;
          color: #fff;
          font-weight: 600;
          margin-bottom: 1rem;
          font-size: 1.1rem;
        }

        .comment-section textarea {
          width: 100%;
          background: #333;
          border: 2px solid #444;
          border-radius: 12px;
          padding: 1rem;
          color: #fff;
          font-family: inherit;
          resize: vertical;
          min-height: 120px;
          font-size: 1rem;
          line-height: 1.5;
          transition: all 0.3s ease;
          box-sizing: border-box;
        }

        .comment-section textarea:focus {
          outline: none;
          border-color: #ffd700;
          box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.1);
          background: #3a3a3a;
        }

        .comment-section textarea::placeholder {
          color: #999;
        }

        .comment-section small {
          color: #999;
          font-size: 0.85rem;
          margin-top: 0.5rem;
          display: block;
        }

        .rating-form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          padding-top: 1rem;
          border-top: 1px solid #333;
        }

        .btn-cancel,
        .btn-submit {
          padding: 1rem 2rem;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 1rem;
          min-width: 120px;
        }

        .btn-cancel {
          background: #444;
          color: #fff;
          border: 2px solid #555;
        }

        .btn-cancel:hover:not(:disabled) {
          background: #555;
          border-color: #666;
          transform: translateY(-2px);
        }

        .btn-submit {
          background: linear-gradient(135deg, #ffd700 0%, #ffa500 100%);
          color: #000;
          font-weight: 700;
          box-shadow: 0 4px 16px rgba(255, 215, 0, 0.3);
        }

        .btn-submit:hover:not(:disabled) {
          background: linear-gradient(135deg, #ffed4e 0%, #ffd700 100%);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(255, 215, 0, 0.4);
        }

        .btn-submit:disabled,
        .btn-cancel:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .rating-form-overlay {
            padding: 1rem;
          }

          .rating-form-modal {
            max-height: 95vh;
          }

          .rating-form-header {
            padding: 1.5rem;
          }

          .rating-form {
            padding: 1.5rem;
          }

          .rating-star {
            font-size: 1.8rem;
            width: 35px;
            height: 35px;
          }

          .star-rating {
            gap: 0.3rem;
          }

          .rating-form-actions {
            flex-direction: column;
          }

          .btn-cancel,
          .btn-submit {
            width: 100%;
          }
        }

        @media (max-width: 480px) {
          .rating-form-header h3 {
            font-size: 1.1rem;
          }

          .rating-star {
            font-size: 1.5rem;
            width: 30px;
            height: 30px;
          }

          .comment-section textarea {
            min-height: 100px;
          }

          .rating-form-modal {
            margin: 1rem;
          }

          .rating-form-header,
          .rating-form {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default RateModal;

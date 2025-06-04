import React, { useState, useEffect } from "react";
import { LoadingSpinner, showErrorToast } from "../../../components/utils/utils";
import { getAllMovies } from "../../../config/MovieApi";
import { getAllCinemaRooms } from "../../../config/CinemaRoomApi";

interface AddShowtimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddShowtime: (showtimeData: any) => void;
}

interface ShowtimeFormData {
  Movie_ID: string;
  Cinema_Room_ID: string;
  Show_Date: string;
  Start_Time: string;
}

interface Movie {
  Movie_ID: number;
  Movie_Name: string;
  Duration: number;
  Status: string;
  End_Date: string;
  Release_Date: string;
  Director: string;
  Language: string;
  Trailer: string;
  Poster: string;
  ShowtimeCount?: number;
}

interface CinemaRoom {
  Cinema_Room_ID: number;
  Room_Name: string;
  Room_Type: string;
  Capacity: number;
  Status: string;
}

const AddShowtimeModal: React.FC<AddShowtimeModalProps> = ({ isOpen, onClose, onAddShowtime }) => {
  const [formData, setFormData] = useState<ShowtimeFormData>({
    Movie_ID: "",
    Cinema_Room_ID: "",
    Show_Date: "",
    Start_Time: "",
  });

  const [errors, setErrors] = useState<Partial<ShowtimeFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [cinemaRooms, setCinemaRooms] = useState<CinemaRoom[]>([]);
  const [loadingMovies, setLoadingMovies] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);

  // Fetch movies and cinema rooms when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        Movie_ID: "",
        Cinema_Room_ID: "",
        Show_Date: "",
        Start_Time: "",
      });
      setErrors({});
      fetchMovies();
      fetchCinemaRooms();
    }
  }, [isOpen]);

  const fetchMovies = async () => {
    try {
      setLoadingMovies(true);
      const data = await getAllMovies();
      // Filter only now-showing movies
      const activeMovies = data.filter((movie: Movie) => movie.Status === "Now Showing");
      setMovies(activeMovies);
    } catch (error: any) {
      console.error("Error fetching movies:", error);
      const errorMessage = error?.response?.data?.message || error.message || "Lỗi khi tải danh sách phim";
      showErrorToast(errorMessage);
      setMovies([]);
    } finally {
      setLoadingMovies(false);
    }
  };

  const fetchCinemaRooms = async () => {
    try {
      setLoadingRooms(true);
      const data = await getAllCinemaRooms();
      // Filter only active cinema rooms
      const activeRooms = data.filter((room: CinemaRoom) => room.Status === "Active" || !room.Status);
      setCinemaRooms(activeRooms);
    } catch (error: any) {
      console.error("Error fetching cinema rooms:", error);
      const errorMessage = error?.response?.data?.message || error.message || "Lỗi khi tải danh sách phòng chiếu";
      showErrorToast(errorMessage);
      setCinemaRooms([]);
    } finally {
      setLoadingRooms(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing/selecting
    if (errors[name as keyof ShowtimeFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Validate form data
  const validateForm = (): boolean => {
    const newErrors: Partial<ShowtimeFormData> = {};

    // Movie ID validation
    if (!formData.Movie_ID.trim()) {
      newErrors.Movie_ID = "Vui lòng chọn phim";
    }

    // Cinema Room ID validation
    if (!formData.Cinema_Room_ID.trim()) {
      newErrors.Cinema_Room_ID = "Vui lòng chọn phòng chiếu";
    }

    // Show Date validation
    if (!formData.Show_Date.trim()) {
      newErrors.Show_Date = "Ngày chiếu là bắt buộc";
    } else {
      const selectedDate = new Date(formData.Show_Date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.Show_Date = "Ngày chiếu không thể là ngày trong quá khứ";
      }
    }

    // Start Time validation
    if (!formData.Start_Time.trim()) {
      newErrors.Start_Time = "Giờ chiếu là bắt buộc";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert string IDs to numbers for API
      const showtimeData = {
        Movie_ID: parseInt(formData.Movie_ID),
        Cinema_Room_ID: parseInt(formData.Cinema_Room_ID),
        Show_Date: formData.Show_Date,
        Start_Time: formData.Start_Time,
      };

      await onAddShowtime(showtimeData);
      onClose();
    } catch (error: any) {
      console.error("Error adding showtime:", error);
      const errorMessage = error?.response?.data?.message || error.message || "Lỗi khi thêm suất chiếu";
      showErrorToast(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Don't render if modal is not open
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-container">
        <div className="modal-header">
          <h2>Thêm suất chiếu mới</h2>
          <button className="modal-close-btn" onClick={onClose} type="button">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="Movie_ID">
                Phim <span className="required">*</span>
              </label>
              <select
                id="Movie_ID"
                name="Movie_ID"
                value={formData.Movie_ID}
                onChange={handleInputChange}
                className={`form-select ${errors.Movie_ID ? "error" : ""}`}
                disabled={isSubmitting || loadingMovies}
              >
                <option value="">{loadingMovies ? "Đang tải..." : "Chọn phim"}</option>
                {movies.map((movie) => (
                  <option key={movie.Movie_ID} value={movie.Movie_ID}>
                    {movie.Movie_Name} ({movie.Duration} phút)
                  </option>
                ))}
              </select>
              {errors.Movie_ID && <span className="error-message">{errors.Movie_ID}</span>}
              {loadingMovies && (
                <div className="loading-indicator">
                  <LoadingSpinner size="small" />
                  <span>Đang tải danh sách phim...</span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="Cinema_Room_ID">
                Phòng chiếu <span className="required">*</span>
              </label>
              <select
                id="Cinema_Room_ID"
                name="Cinema_Room_ID"
                value={formData.Cinema_Room_ID}
                onChange={handleInputChange}
                className={`form-select ${errors.Cinema_Room_ID ? "error" : ""}`}
                disabled={isSubmitting || loadingRooms}
              >
                <option value="">{loadingRooms ? "Đang tải..." : "Chọn phòng chiếu"}</option>
                {cinemaRooms.map((room) => (
                  <option key={room.Cinema_Room_ID} value={room.Cinema_Room_ID}>
                    {room.Room_Name} - {room.Room_Type} ({room.Capacity} ghế)
                  </option>
                ))}
              </select>
              {errors.Cinema_Room_ID && <span className="error-message">{errors.Cinema_Room_ID}</span>}
              {loadingRooms && (
                <div className="loading-indicator">
                  <LoadingSpinner size="small" />
                  <span>Đang tải danh sách phòng...</span>
                </div>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="Show_Date">
                Ngày chiếu <span className="required">*</span>
              </label>
              <input
                type="date"
                id="Show_Date"
                name="Show_Date"
                value={formData.Show_Date}
                onChange={handleInputChange}
                className={`form-input ${errors.Show_Date ? "error" : ""}`}
                disabled={isSubmitting}
                min={new Date().toISOString().split("T")[0]}
              />
              {errors.Show_Date && <span className="error-message">{errors.Show_Date}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="Start_Time">
                Giờ chiếu <span className="required">*</span>
              </label>
              <input
                type="time"
                id="Start_Time"
                name="Start_Time"
                value={formData.Start_Time}
                onChange={handleInputChange}
                className={`form-input ${errors.Start_Time ? "error" : ""}`}
                disabled={isSubmitting}
              />
              {errors.Start_Time && <span className="error-message">{errors.Start_Time}</span>}
            </div>
          </div>

          <div className="form-note">
            <p>
              <strong>Lưu ý:</strong>
            </p>
            <ul>
              <li>Chọn phim từ danh sách các phim đang chiếu</li>
              <li>Chọn phòng chiếu từ danh sách phòng có sẵn</li>
              <li>Ngày chiếu không thể là ngày trong quá khứ</li>
              <li>Giờ chiếu sử dụng định dạng 24 giờ (VD: 14:30)</li>
              <li>Hệ thống sẽ tự động tính toán giờ kết thúc dựa trên thời lượng phim</li>
            </ul>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={isSubmitting}>
              Hủy
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting || loadingMovies || loadingRooms}>
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="small" />
                  Đang thêm...
                </>
              ) : (
                "Thêm suất chiếu"
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
          backdrop-filter: blur(4px);
        }

        .modal-container {
          background: white;
          border-radius: 12px;
          width: 100%;
          max-width: 700px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          animation: modalSlideIn 0.3s ease-out;
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-50px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          border-bottom: 1px solid #e5e7eb;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 12px 12px 0 0;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
          color: white;
        }

        .modal-close-btn {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: white;
          padding: 0.5rem;
          border-radius: 8px;
          transition: background-color 0.2s ease;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-close-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .modal-form {
          padding: 2rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }

        .required {
          color: #ef4444;
        }

        .form-input,
        .form-select {
          padding: 0.75rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.2s ease;
          color: #2c3e50;
          background-color: white;
          font-family: inherit;
        }

        .form-input:focus,
        .form-select:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          transform: translateY(-1px);
        }

        .form-input.error,
        .form-select.error {
          border-color: #ef4444;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }

        .form-input:disabled,
        .form-select:disabled {
          background-color: #f9fafb;
          opacity: 0.7;
          cursor: not-allowed;
        }

        .form-select {
          cursor: pointer;
        }

        .form-select option {
          padding: 0.5rem;
          color: #2c3e50;
        }

        .error-message {
          color: #ef4444;
          font-size: 0.8rem;
          margin-top: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .error-message::before {
          content: "⚠️";
          font-size: 0.7rem;
        }

        .loading-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.5rem;
          color: #6b7280;
          font-size: 0.8rem;
        }

        .form-note {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border: 1px solid #dee2e6;
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          border-left: 4px solid #667eea;
        }

        .form-note p {
          margin: 0 0 0.75rem 0;
          font-weight: 600;
          color: #2c3e50;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .form-note p::before {
          content: "💡";
          font-size: 1rem;
        }

        .form-note ul {
          margin: 0;
          padding-left: 1.5rem;
          color: #6c757d;
        }

        .form-note li {
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
          line-height: 1.4;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding-top: 1.5rem;
          border-top: 1px solid #e5e7eb;
        }

        .btn-secondary {
          padding: 0.75rem 1.5rem;
          border: 2px solid #d1d5db;
          background-color: white;
          color: #374151;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .btn-secondary:hover:not(:disabled) {
          background-color: #f9fafb;
          border-color: #9ca3af;
          transform: translateY(-1px);
        }

        .btn-secondary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-primary {
          padding: 0.75rem 1.5rem;
          border: none;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: inherit;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 15px -3px rgba(0, 0, 0, 0.2);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          background: #95a5a6;
          transform: none;
          box-shadow: none;
        }

        @media (max-width: 768px) {
          .modal-container {
            margin: 1rem;
            max-width: none;
          }

          .modal-header {
            padding: 1rem 1.5rem;
          }

          .modal-form {
            padding: 1.5rem;
          }

          .form-row {
            grid-template-columns: 1fr;
            gap: 1rem;
            margin-bottom: 1rem;
          }

          .modal-actions {
            flex-direction: column;
          }

          .btn-secondary,
          .btn-primary {
            width: 100%;
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .modal-backdrop {
            padding: 0.5rem;
          }

          .modal-header h2 {
            font-size: 1.25rem;
          }

          .form-note {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AddShowtimeModal;

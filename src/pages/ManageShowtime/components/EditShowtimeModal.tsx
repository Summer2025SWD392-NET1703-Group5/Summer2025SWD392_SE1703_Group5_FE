import React, { useState, useEffect } from "react";
import {
  formatDate,
  LoadingSpinner,
  showErrorToast,
  convertToTimeInputFormat,
  convertToDateInputFormat,
} from "../../../components/utils/utils";
import { getAllMovies } from "../../../config/MovieApi";
import { getManagerCinemaRooms } from "../../../config/CinemasApi";
import { updateShowtime } from "../../../config/ShowtimeApi";

interface EditShowtimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateShowtime: (showtimeData: any) => void;
  showtime: {
    Showtime_ID: number;
    Show_Date: string;
    Start_Time: string;
    Status: string;
    Movies: {
      Movie_ID: number;
      Movie_Name: string;
      Duration: number;
    };
    Rooms: {
      Cinema_Room_ID: number;
      Room_Name: string;
      Room_Type: string;
    };
  } | null;
}

interface ShowtimeFormData {
  Movie_ID: string;
  Cinema_Room_ID: string;
  Show_Date: string;
  Start_Time: string;
  Status: string;
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
  Seat_Quantity: number;
  Room_Type: string;
  Status: string;
  Notes: string;
  Cinema_ID: number;
}

const EditShowtimeModal: React.FC<EditShowtimeModalProps> = ({ isOpen, onClose, onUpdateShowtime, showtime }) => {
  const [formData, setFormData] = useState<ShowtimeFormData>({
    Movie_ID: "",
    Cinema_Room_ID: "",
    Show_Date: "",
    Start_Time: "",
    Status: "Scheduled",
  });

  const [errors, setErrors] = useState<Partial<ShowtimeFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [cinemaRooms, setCinemaRooms] = useState<CinemaRoom[]>([]);
  const [loadingMovies, setLoadingMovies] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [conflictInfo, setConflictInfo] = useState<{
    premiereDate: string;
    requestedDate: string;
    movieName: string;
  } | null>(null);
  const [pendingUpdateData, setPendingUpdateData] = useState<any>(null);

  // Initialize form data when showtime prop changes
  useEffect(() => {
    if (isOpen && showtime) {
      // Convert date to proper format for HTML date input using utility function
      const showDate = convertToDateInputFormat(showtime.Show_Date);

      // Convert time to proper format for HTML time input using utility function
      const startTime = convertToTimeInputFormat(showtime.Start_Time);

      console.log("Setting form data with Show_Date:", showDate, "from original:", showtime.Show_Date);
      console.log("Setting form data with Start_Time:", startTime, "from original:", showtime.Start_Time);

      setFormData({
        Movie_ID: showtime.Movies.Movie_ID.toString(),
        Cinema_Room_ID: showtime.Rooms.Cinema_Room_ID.toString(),
        Show_Date: showDate,
        Start_Time: startTime,
        Status: showtime.Status || "Scheduled",
      });
      setErrors({});
      fetchMovies();
      fetchCinemaRooms();
    }
  }, [isOpen, showtime]);

  const fetchMovies = async () => {
    try {
      setLoadingMovies(true);
      const data = await getAllMovies({ status: "Now Showing" });
      setMovies(data);
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
      // Use manager-specific API to get only rooms managed by current manager
      const data = await getManagerCinemaRooms();
      const activeRooms = data.filter((room: CinemaRoom) => room.Status == "Active");
      // Ensure data is an array before setting state
      setCinemaRooms(Array.isArray(activeRooms) ? activeRooms : []);
    } catch (error: any) {
      console.error("Error fetching manager cinema rooms:", error);
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
  // const validateForm = (): boolean => {
  //   const newErrors: Partial<ShowtimeFormData> = {};

  //   // Movie ID validation
  //   if (!formData.Movie_ID.trim()) {
  //     newErrors.Movie_ID = "Vui lòng chọn phim";
  //   }

  //   // Cinema Room ID validation
  //   if (!formData.Cinema_Room_ID.trim()) {
  //     newErrors.Cinema_Room_ID = "Vui lòng chọn phòng chiếu";
  //   }

  //   // Show Date validation
  //   if (!formData.Show_Date.trim()) {
  //     newErrors.Show_Date = "Ngày chiếu là bắt buộc";
  //   } else {
  //     const selectedDate = new Date(formData.Show_Date);
  //     const today = new Date();
  //     today.setHours(0, 0, 0, 0);

  //     // Allow past dates for editing (admin might need to edit historical data)
  //     if (selectedDate < new Date("2020-01-01")) {
  //       newErrors.Show_Date = "Ngày chiếu không hợp lệ";
  //     }
  //   }

  //   // Start Time validation
  //   if (!formData.Start_Time.trim()) {
  //     newErrors.Start_Time = "Giờ chiếu là bắt buộc";
  //   }

  //   // Status validation
  //   if (!formData.Status.trim()) {
  //     newErrors.Status = "Trạng thái là bắt buộc";
  //   }

  //   setErrors(newErrors);
  //   return Object.keys(newErrors).length === 0;
  // };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!showtime) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert string IDs to numbers for API and ensure time format is correct
      const updateData = {
        Movie_ID: parseInt(formData.Movie_ID),
        Cinema_Room_ID: parseInt(formData.Cinema_Room_ID),
        Show_Date: formData.Show_Date,
        Start_Time: formData.Start_Time, // Time should already be in HH:MM format
        Status: formData.Status,
      };

      console.log("Sending update data to API:", updateData);

      // Call the updateShowtime API
      const updatedShowtime = await updateShowtime(showtime.Showtime_ID.toString(), updateData);

      console.log("API response for updated showtime:", updatedShowtime);

      // Call the parent callback with updated data - let parent handle state updates
      await onUpdateShowtime(updatedShowtime);

      // Don't call onClose here - let parent handle it after successful update
    } catch (error: any) {
      console.error("Error updating showtime:", error);
      console.log("Error response data:", error?.response?.data);
      console.log("Error response status:", error?.response?.status);

      // Check if this is a re-release conflict error - handle it here instead of letting parent handle
      if (error?.response?.status === 409 && error?.response?.data?.type === "EARLY_PREMIERE_REQUEST") {
        console.log("Detected re-release conflict, showing dialog");
        const conflictData = error.response.data;
        const movieData = conflictData.movieData || {};

        setConflictInfo({
          premiereDate: movieData.premiereDate || conflictData.premiereDate || "",
          requestedDate: movieData.requestedDate
            ? typeof movieData.requestedDate === "string"
              ? movieData.requestedDate
              : new Date(movieData.requestedDate).toISOString().split("T")[0]
            : formData.Show_Date,
          movieName:
            movieData.movieName ||
            conflictData.movieName ||
            movies.find((m) => m.Movie_ID === parseInt(formData.Movie_ID))?.Movie_Name ||
            "Phim đã chọn",
        });
        setPendingUpdateData({
          Movie_ID: parseInt(formData.Movie_ID),
          Cinema_Room_ID: parseInt(formData.Cinema_Room_ID),
          Show_Date: formData.Show_Date,
          Start_Time: formData.Start_Time,
          Status: formData.Status,
        });
        setShowConflictDialog(true);
        return; // Don't let the error propagate to parent
      }

      // For other errors, show error toast and don't propagate
      const errorMessage = error?.response?.data?.message || error.message || "Lỗi khi cập nhật suất chiếu";
      showErrorToast(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle early showtime update
  const handleUpdateEarlyShowtime = async () => {
    if (!pendingUpdateData || !showtime) return;

    setIsSubmitting(true);
    setShowConflictDialog(false);

    try {
      console.log("Updating early showtime with data:", pendingUpdateData);

      // Call the updateShowtime API with the early showtime flag as URL parameter
      const updatedShowtime = await updateShowtime(showtime.Showtime_ID.toString(), pendingUpdateData, true);

      console.log("API response for updated early showtime:", updatedShowtime);

      // Call the parent callback with updated data
      await onUpdateShowtime(updatedShowtime);

      // Clear conflict state
      setConflictInfo(null);
      setPendingUpdateData(null);
    } catch (error: any) {
      console.error("Error updating early showtime:", error);
      const errorMessage = error?.response?.data?.message || error.message || "Lỗi khi cập nhật suất chiếu sớm";
      showErrorToast(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle conflict dialog close
  const handleCloseConflictDialog = () => {
    setShowConflictDialog(false);
    setConflictInfo(null);
    setPendingUpdateData(null);
  };

  // Handle backdrop click to close modal
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking the backdrop itself, not its children
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Don't render if modal is not open or no showtime data
  if (!isOpen || !showtime) return null;

  return (
    <>
      <div className="modal-backdrop" onClick={handleBackdropClick}>
        <div className="modal-container">
          <div className="modal-header">
            <h2>Chỉnh sửa suất chiếu #{showtime.Showtime_ID}</h2>
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
                      {movie.Movie_Name} ({movie.Duration} phút) - {movie.Status}
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
                      {room.Room_Name} - {room.Room_Type}
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
                  <span className="label-icon">📅</span>
                  Ngày chiếu <span className="required">*</span>
                </label>
                <div className="date-input-wrapper">
                  <input
                    type="date"
                    id="Show_Date"
                    name="Show_Date"
                    value={formData.Show_Date}
                    onChange={handleInputChange}
                    className={`form-input date-input ${errors.Show_Date ? "error" : ""}`}
                    disabled={isSubmitting}
                  />
                  <span className="input-icon">📅</span>
                </div>
                {errors.Show_Date && <span className="error-message">{errors.Show_Date}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="Start_Time">
                  <span className="label-icon">🕐</span>
                  Giờ chiếu <span className="required">*</span>
                </label>
                <div className="time-input-wrapper">
                  <input
                    type="time"
                    id="Start_Time"
                    name="Start_Time"
                    value={formData.Start_Time}
                    onChange={handleInputChange}
                    className={`form-input time-input ${errors.Start_Time ? "error" : ""}`}
                    disabled={isSubmitting}
                  />
                  <span className="input-icon">🕐</span>
                </div>
                {errors.Start_Time && <span className="error-message">{errors.Start_Time}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="Status">
                  Trạng thái <span className="required">*</span>
                </label>
                <select
                  id="Status"
                  name="Status"
                  value={formData.Status}
                  onChange={handleInputChange}
                  className={`form-select ${errors.Status ? "error" : ""}`}
                  disabled={isSubmitting}
                >
                  <option value="Scheduled">Đã lên lịch</option>
                  <option value="Hidden">Ẩn</option>
                </select>
                {errors.Status && <span className="error-message">{errors.Status}</span>}
              </div>
            </div>

            <div className="form-note">
              <p>
                <strong>Lưu ý khi chỉnh sửa:</strong>
              </p>
              <ul>
                <li>Có thể thay đổi phim và phòng chiếu nếu cần thiết</li>
                <li>Cẩn thận khi thay đổi ngày và giờ chiếu vì có thể ảnh hưởng đến vé đã bán</li>
                <li>Trạng thái "Ẩn" sẽ ẩn suất chiếu khỏi khách hàng</li>
                <li>Trạng thái "Đã lên lịch" sẽ hiển thị suất chiếu cho khách hàng</li>
                <li>Hệ thống sẽ tự động tính toán lại giờ kết thúc dựa trên thời lượng phim mới</li>
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
                  </>
                ) : (
                  "Cập nhật suất chiếu"
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
            background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
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
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .label-icon {
            font-size: 1rem;
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

          .date-input-wrapper,
          .time-input-wrapper {
            position: relative;
            display: flex;
            align-items: center;
          }

          .date-input,
          .time-input {
            width: 100%;
            padding-right: 3rem;
            background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
            border: 2px solid #e5e7eb;
            position: relative;
          }

          .date-input::-webkit-calendar-picker-indicator,
          .time-input::-webkit-calendar-picker-indicator {
            opacity: 0;
            position: absolute;
            right: 0;
            width: 100%;
            height: 100%;
            cursor: pointer;
          }

          .input-icon {
            position: absolute;
            right: 0.75rem;
            top: 50%;
            transform: translateY(-50%);
            font-size: 1.2rem;
            color: #f39c12;
            pointer-events: none;
            z-index: 1;
          }

          .date-input:focus,
          .time-input:focus {
            outline: none;
            border-color: #f39c12;
            box-shadow: 0 0 0 3px rgba(243, 156, 18, 0.1);
            transform: translateY(-1px);
            background: white;
          }

          .date-input:focus + .input-icon,
          .time-input:focus + .input-icon {
            color: #e67e22;
            transform: translateY(-50%) scale(1.1);
          }

          .date-input.error,
          .time-input.error {
            border-color: #ef4444;
            box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
            background: #fef2f2;
          }

          .date-input:disabled,
          .time-input:disabled {
            background-color: #f9fafb;
            opacity: 0.7;
            cursor: not-allowed;
          }

          /* Custom styling for webkit browsers */
          .date-input::-webkit-datetime-edit {
            padding: 0;
            color: #2c3e50;
          }

          .date-input::-webkit-datetime-edit-fields-wrapper {
            padding: 0;
          }

          .date-input::-webkit-datetime-edit-text {
            color: #f39c12;
            font-weight: 500;
          }

          .date-input::-webkit-datetime-edit-month-field,
          .date-input::-webkit-datetime-edit-day-field,
          .date-input::-webkit-datetime-edit-year-field {
            color: #2c3e50;
            font-weight: 600;
          }

          .time-input::-webkit-datetime-edit {
            padding: 0;
            color: #2c3e50;
          }

          .time-input::-webkit-datetime-edit-fields-wrapper {
            padding: 0;
          }

          .time-input::-webkit-datetime-edit-text {
            color: #f39c12;
            font-weight: 500;
          }

          .time-input::-webkit-datetime-edit-hour-field,
          .time-input::-webkit-datetime-edit-minute-field {
            color: #2c3e50;
            font-weight: 600;
          }

          /* Firefox styling */
          @-moz-document url-prefix() {
            .date-input,
            .time-input {
              padding-right: 0.75rem;
            }
            
            .input-icon {
              display: none;
            }
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
            background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
            border: 1px solid #ffc107;
            border-radius: 8px;
            padding: 1.5rem;
            margin-bottom: 2rem;
            border-left: 4px solid #f39c12;
          }

          .form-note p {
            margin: 0 0 0.75rem 0;
            font-weight: 600;
            color: #856404;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .form-note p::before {
            content: "⚠️";
            font-size: 1rem;
          }

          .form-note ul {
            margin: 0;
            padding-left: 1.5rem;
            color: #856404;
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
            background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
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

      {/* Re-release Conflict Dialog - same as AddShowtimeModal */}
      {showConflictDialog && conflictInfo && (
        <div className="conflict-dialog-backdrop">
          <div className="conflict-dialog">
            <div className="conflict-dialog-header">
              <h3>⚠️ Xung đột lịch chiếu</h3>
            </div>

            <div className="conflict-dialog-content">
              <div className="conflict-info">
                <h4>Phát hiện yêu cầu chiếu sớm</h4>
                <div className="conflict-details">
                  <div className="conflict-item">
                    <span className="conflict-label">Phim:</span>
                    <span className="conflict-value">{conflictInfo.movieName}</span>
                  </div>
                  <div className="conflict-item">
                    <span className="conflict-label">Ngày chiếu chính thức:</span>
                    <span className="conflict-value">{formatDate(conflictInfo.premiereDate)}</span>
                  </div>
                  <div className="conflict-item">
                    <span className="conflict-label">Ngày chiếu sớm yêu cầu:</span>
                    <span className="conflict-value">{formatDate(conflictInfo.requestedDate)}</span>
                  </div>
                </div>

                <div className="conflict-explanation">
                  <p>
                    <strong>Lý do xung đột:</strong> Ngày chiếu yêu cầu ({formatDate(conflictInfo.requestedDate)}) diễn
                    ra trước ngày chiếu chính thức ({formatDate(conflictInfo.premiereDate)}).
                  </p>
                  <p>
                    Điều này tạo ra một suất chiếu sớm - phù hợp cho các sự kiện đặc biệt, buổi chiếu thử, hoặc chiến
                    dịch marketing.
                  </p>
                </div>

                <div className="conflict-options">
                  <div className="option-info">
                    <h5>🎬 Cập nhật suất chiếu sớm</h5>
                    <p>Cho phép cập nhật suất chiếu trước ngày chiếu chính thức. Thích hợp cho:</p>
                    <ul>
                      <li>Buổi ra mắt phim (movie premiere)</li>
                      <li>Suất chiếu sớm cho VIP/thành viên</li>
                      <li>Buổi chiếu thử (preview screening)</li>
                      <li>Sự kiện marketing đặc biệt</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="conflict-dialog-actions">
              <button
                type="button"
                onClick={handleCloseConflictDialog}
                className="btn-secondary"
                disabled={isSubmitting}
              >
                Hủy
              </button>
              <button type="button" onClick={handleUpdateEarlyShowtime} className="btn-primary" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="small" />
                    Đang cập nhật...
                  </>
                ) : (
                  "🎬 Cập nhật suất chiếu sớm"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add the same conflict dialog styles as AddShowtimeModal */}
      <style>{`
        .conflict-dialog-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1100;
          padding: 1rem;
          backdrop-filter: blur(4px);
        }

        .conflict-dialog {
          background: white;
          border-radius: 12px;
          width: 100%;
          max-width: 600px;
          max-height: 80vh;
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

        .conflict-dialog-header {
          padding: 1.5rem 2rem;
          border-bottom: 1px solid #e5e7eb;
          background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
          color: white;
          border-radius: 12px 12px 0 0;
        }

        .conflict-dialog-header h3 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: white;
        }

        .conflict-dialog-content {
          padding: 2rem;
        }

        .conflict-info {
          margin-bottom: 1.5rem;
        }

        .conflict-details {
          margin-bottom: 1rem;
        }

        .conflict-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }

        .conflict-label {
          font-weight: 500;
          color: #333;
        }

        .conflict-value {
          font-weight: 600;
          color: #e74c3c;
        }

        .conflict-explanation {
          background: #f9ecec;
          border: 1px solid #e74c3c;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1.5rem;
        }

        .conflict-explanation p {
          margin: 0;
          color: #333;
          line-height: 1.4;
        }

        .conflict-options {
          background: #eef9ff;
          border: 1px solid #3498db;
          border-radius: 8px;
          padding: 1rem;
        }

        .option-info {
          margin-bottom: 1rem;
        }

        .option-info h5 {
          margin: 0 0 0.5rem 0;
          font-weight: 600;
          color: #3498db;
        }

        .option-info p {
          margin: 0;
          color: #333;
          line-height: 1.4;
        }

        .conflict-dialog-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding: 1.5rem 2rem;
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
          background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
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
          .conflict-dialog {
            margin: 1rem;
            max-width: none;
          }

          .conflict-dialog-header {
            padding: 1rem 1.5rem;
          }

          .conflict-dialog-content {
            padding: 1.5rem;
          }

          .conflict-dialog-actions {
            flex-direction: column;
          }

          .btn-secondary,
          .btn-primary {
            width: 100%;
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .conflict-dialog-header h3 {
            font-size: 1.25rem;
          }

          .conflict-dialog-content {
            padding: 1rem;
          }
        }
      `}</style>
    </>
  );
};

export default EditShowtimeModal;

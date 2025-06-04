import React, { useState, useEffect } from "react";
import AddShowtimeModal from "./components/AddShowtimeModal";
import EditShowtimeModal from "./components/EditShowtimeModal";
import {
  getAllShowtimes,
  createShowtime,
  updateShowtime,
  deleteShowtime,
  getShowtimesByMovie,
  getShowtimesByRoom,
  searchShowtimes,
  hideExpiredShowtimes,
} from "../../config/ShowtimeApi";
import { getAllMovies } from "../../config/MovieApi";
import {
  formatDateTime,
  formatDate,
  formatTime,
  LoadingSpinner,
  EmptyState,
  showSuccessToast,
  showErrorToast,
  showWarningToast,
  showInfoToast,
  removeAccents,
} from "../../components/utils/utils";

interface Showtime {
  Showtime_ID: number;
  Movie_ID: number;
  Cinema_Room_ID: number;
  Room_Name: string;
  Show_Date: string;
  Start_Time: string;
  End_Time: string;
  Status: string;
  Rooms: {
    Cinema_Room_ID: number;
    Room_Name: string;
    Room_Type: string;
  };
  Movies?: {
    Movie_ID: number;
    Movie_Name: string;
    Duration: number;
  };
}

const ManageShowtime: React.FC = () => {
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [showHidden, setShowHidden] = useState(false); // Toggle to show hidden showtimes
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedShowtimes, setSelectedShowtimes] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingShowtime, setEditingShowtime] = useState<Showtime | null>(null);
  const [moviesMap, setMoviesMap] = useState<Map<number, any>>(new Map());
  const [hideExpiredLoading, setHideExpiredLoading] = useState(false);

  const showtimesPerPage = 10;

  useEffect(() => {
    fetchShowtimes();
  }, []);

  const fetchShowtimes = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch showtimes and movies simultaneously
      const [showtimesData, moviesData] = await Promise.all([getAllShowtimes(), getAllMovies()]);

      // Create a map of movies for quick lookup
      const movieMap = new Map();
      moviesData.forEach((movie: any) => {
        movieMap.set(movie.Movie_ID, movie);
      });
      setMoviesMap(movieMap);

      // Populate movie information in showtimes
      const enrichedShowtimes = showtimesData.map((showtime: any) => ({
        ...showtime,
        Movies: movieMap.get(showtime.Movie_ID) || null,
      }));

      setShowtimes(enrichedShowtimes);
    } catch (error: any) {
      console.error("Lỗi khi tải danh sách suất chiếu:", error);
      const errorMessage =
        error?.response?.data?.message || error.message || "Không thể tải danh sách suất chiếu. Vui lòng thử lại.";
      setError(errorMessage);
      showErrorToast(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAddShowtime = async (showtimeData: any) => {
    try {
      // Call API to create showtime
      const newShowtime = await createShowtime(showtimeData);

      // Enrich with movie data
      const movieInfo = moviesMap.get(newShowtime.Movie_ID);
      const enrichedShowtime = {
        ...newShowtime,
        Movies: movieInfo || null,
      };

      // Add the new showtime to local state
      setShowtimes((prev) => [enrichedShowtime, ...prev]);
      setShowAddModal(false);
      showSuccessToast("Thêm suất chiếu mới thành công");
      setCurrentPage(1);
    } catch (error: any) {
      console.error("Error adding showtime:", error);
      const errorMessage = error?.response?.data?.message || error.message || "Lỗi khi thêm suất chiếu mới";
      showErrorToast(errorMessage);
      throw error;
    }
  };

  const handleEditShowtime = (showtime: Showtime) => {
    setEditingShowtime(showtime);
    setShowEditModal(true);
  };

  const handleUpdateShowtime = async (updatedShowtimeData: any) => {
    try {
      // Enrich with movie data for local state update
      const movieInfo = moviesMap.get(updatedShowtimeData.Movie_ID);
      const enrichedShowtime = {
        ...updatedShowtimeData,
        Movies: movieInfo || null,
      };

      // Update the showtime in local state
      setShowtimes((prev) =>
        prev.map((showtime) => (showtime.Showtime_ID === updatedShowtimeData.Showtime_ID ? enrichedShowtime : showtime))
      );

      setShowEditModal(false);
      setEditingShowtime(null);
    } catch (error: any) {
      console.error("Error updating showtime:", error);
      const errorMessage = error?.response?.data?.message || error.message || "Lỗi khi cập nhật suất chiếu";
      showErrorToast(errorMessage);
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingShowtime(null);
  };

  const filteredShowtimes = showtimes.filter((showtime) => {
    // Filter by showHidden toggle - show only Scheduled by default, or only Hidden when toggled
    if (!showHidden && showtime.Status !== "Scheduled") return false;
    if (showHidden && showtime.Status !== "Hidden") return false;

    const searchLower = removeAccents(searchTerm.toLowerCase());
    const matchesSearch =
      removeAccents(showtime.Room_Name?.toLowerCase() || "").includes(searchLower) ||
      removeAccents(showtime.Rooms?.Room_Name?.toLowerCase() || "").includes(searchLower) ||
      removeAccents(showtime.Movies?.Movie_Name?.toLowerCase() || "").includes(searchLower);

    const showtimeDate = new Date(showtime.Show_Date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    let matchesDate = true;
    if (dateFilter === "today") {
      matchesDate = showtimeDate.toDateString() === today.toDateString();
    } else if (dateFilter === "tomorrow") {
      matchesDate = showtimeDate.toDateString() === tomorrow.toDateString();
    } else if (dateFilter === "upcoming") {
      matchesDate = showtimeDate > today;
    } else if (dateFilter === "past") {
      matchesDate = showtimeDate < today;
    }

    return matchesSearch && matchesDate;
  });

  const totalPages = Math.ceil(filteredShowtimes.length / showtimesPerPage);
  const startIndex = (currentPage - 1) * showtimesPerPage;
  const currentShowtimes = filteredShowtimes.slice(startIndex, startIndex + showtimesPerPage);

  const handleSelectShowtime = (showtimeId: number) => {
    setSelectedShowtimes((prev) =>
      prev.includes(showtimeId) ? prev.filter((id) => id !== showtimeId) : [...prev, showtimeId]
    );
  };

  const handleSelectAll = () => {
    if (selectedShowtimes.length === currentShowtimes.length) {
      setSelectedShowtimes([]);
    } else {
      setSelectedShowtimes(currentShowtimes.map((showtime) => showtime.Showtime_ID));
    }
  };

  const handleDeleteShowtime = async (showtimeId: number) => {
    const showtime = showtimes.find((s) => s.Showtime_ID === showtimeId);
    if (!showtime) return;

    const confirmMessage = `Bạn có chắc chắn muốn xóa suất chiếu phòng "${
      showtime.Rooms?.Room_Name || showtime.Room_Name
    }" - ${formatDate(showtime.Show_Date)}?\nSuất chiếu sẽ bị xóa hoàn toàn khỏi hệ thống.`;

    if (!window.confirm(confirmMessage)) return;

    try {
      setActionLoading(showtimeId);
      // Call the deleteShowtime API
      await deleteShowtime(showtimeId.toString());

      // Remove the showtime from local state
      setShowtimes((prev) => prev.filter((showtime) => showtime.Showtime_ID !== showtimeId));
      setSelectedShowtimes((prev) => prev.filter((id) => id !== showtimeId));
      showSuccessToast("Đã xóa suất chiếu thành công");
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message || "Lỗi khi xóa suất chiếu";
      showErrorToast(errorMessage);
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedShowtimes.length === 0) {
      showWarningToast("Vui lòng chọn suất chiếu trước");
      return;
    }

    if (
      !window.confirm(
        `Bạn có chắc chắn muốn xóa ${selectedShowtimes.length} suất chiếu?\nCác suất chiếu sẽ bị xóa hoàn toàn khỏi hệ thống.`
      )
    )
      return;

    try {
      setLoading(true);
      // Delete each showtime using the deleteShowtime API
      const deletePromises = selectedShowtimes.map((showtimeId) => deleteShowtime(showtimeId.toString()));
      await Promise.all(deletePromises);

      // Remove deleted showtimes from local state
      setShowtimes((prev) => prev.filter((showtime) => !selectedShowtimes.includes(showtime.Showtime_ID)));
      setSelectedShowtimes([]);
      showSuccessToast(`Đã xóa ${selectedShowtimes.length} suất chiếu thành công`);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message || "Lỗi khi xóa suất chiếu";
      showErrorToast(errorMessage);
      await fetchShowtimes();
    } finally {
      setLoading(false);
    }
  };

  const handleHideExpiredShowtimes = async () => {
    const confirmMessage =
      "Bạn có chắc chắn muốn ẩn tất cả suất chiếu đã hết hạn?\nCác suất chiếu đã qua thời gian chiếu sẽ được chuyển sang trạng thái ẩn.";

    if (!window.confirm(confirmMessage)) return;

    try {
      setHideExpiredLoading(true);
      const response = await hideExpiredShowtimes();

      // Update local state to mark expired showtimes as "Hidden"
      const now = new Date();
      setShowtimes((prev) =>
        prev.map((showtime) => {
          const showtimeDateTime = new Date(`${showtime.Show_Date} ${showtime.Start_Time}`);

          // If showtime has passed and is currently "Scheduled", change to "Hidden"
          if (showtimeDateTime < now && showtime.Status === "Scheduled") {
            return { ...showtime, Status: "Hidden" };
          }
          return showtime;
        })
      );

      // Clear any selected expired showtimes that are now hidden
      setSelectedShowtimes((prev) =>
        prev.filter((showtimeId) => {
          const showtime = showtimes.find((s) => s.Showtime_ID === showtimeId);
          if (!showtime) return false;

          const showtimeDateTime = new Date(`${showtime.Show_Date} ${showtime.Start_Time}`);
          return !(showtimeDateTime < now && showtime.Status === "Scheduled");
        })
      );

      showSuccessToast("Đã ẩn tất cả suất chiếu hết hạn thành công");

      // Show additional info about the action
      const hiddenCount = response?.hiddenCount || 0;
      if (hiddenCount > 0) {
        showInfoToast(`Đã ẩn ${hiddenCount} suất chiếu hết hạn`);
      } else {
        showInfoToast("Không có suất chiếu hết hạn nào cần ẩn");
      }
    } catch (error: any) {
      console.error("Error hiding expired showtimes:", error);
      const errorMessage = error?.response?.data?.message || error.message || "Lỗi khi ẩn suất chiếu hết hạn";
      showErrorToast(errorMessage);
      await fetchShowtimes();
    } finally {
      setHideExpiredLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusClasses: { [key: string]: string } = {
      scheduled: "status-scheduled",
      hidden: "status-hidden",
    };

    const statusText: { [key: string]: string } = {
      scheduled: "Đã lên lịch",
      hidden: "Ẩn",
    };

    return (
      <span className={`status-badge ${statusClasses[status.toLowerCase()] || "status-unknown"}`}>
        {statusText[status.toLowerCase()] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="manage-showtime-loading">
        <LoadingSpinner size="large" />
        <p>Đang tải danh sách suất chiếu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="manage-showtime">
        <EmptyState
          title="Lỗi tải dữ liệu"
          description={error}
          icon="⚠️"
          action={
            <button className="btn-primary" onClick={fetchShowtimes}>
              Thử lại
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="manage-showtime">
      <div className="manage-showtime-header">
        <div className="header-content">
          <h1>Quản lý suất chiếu</h1>
          <p>Quản lý lịch chiếu phim, thời gian và trạng thái suất chiếu</p>
        </div>
        <div className="header-actions">
          <button
            className={`btn-toggle ${showHidden ? "active" : ""}`}
            onClick={() => {
              setShowHidden(!showHidden);
              setSelectedShowtimes([]);
              setCurrentPage(1);
            }}
          >
            {showHidden ? "📋 Hiển thị đã lên lịch" : "👁️ Hiển thị đã ẩn"}
          </button>
          <button
            className="btn-secondary"
            onClick={handleHideExpiredShowtimes}
            disabled={hideExpiredLoading}
            title="Ẩn tất cả suất chiếu đã qua thời gian chiếu"
          >
            {hideExpiredLoading ? (
              <>
                <LoadingSpinner size="small" />
                Đang ẩn...
              </>
            ) : (
              <>
                <span>🕐</span>
                Ẩn suất chiếu hết hạn
              </>
            )}
          </button>
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            <span>➕</span>
            Thêm suất chiếu mới
          </button>
        </div>
      </div>

      <div className="manage-showtime-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên phim hoặc phòng chiếu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filters">
          <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="filter-select">
            <option value="all">Tất cả thời gian</option>
            <option value="today">Hôm nay</option>
            <option value="tomorrow">Ngày mai</option>
            <option value="upcoming">Sắp tới</option>
            <option value="past">Đã qua</option>
          </select>
        </div>

        {selectedShowtimes.length > 0 && (
          <div className="bulk-actions">
            <span className="selected-count">Đã chọn {selectedShowtimes.length}</span>
            <button onClick={handleBulkDelete} className="bulk-btn delete" disabled={loading}>
              {loading ? "Đang xóa..." : "Xóa"}
            </button>
          </div>
        )}
      </div>

      {filteredShowtimes.length === 0 && !loading && (
        <EmptyState
          title={showHidden ? "Không có suất chiếu đã ẩn" : "Không tìm thấy suất chiếu"}
          description={
            searchTerm
              ? "Thử tìm kiếm với từ khóa khác"
              : showHidden
              ? "Chưa có suất chiếu nào bị ẩn"
              : "Chưa có suất chiếu nào đã lên lịch"
          }
          icon={showHidden ? "👁️" : "🎬"}
          action={
            searchTerm ? (
              <button className="btn-primary" onClick={() => setSearchTerm("")}>
                Xóa bộ lọc
              </button>
            ) : null
          }
        />
      )}

      {filteredShowtimes.length > 0 && (
        <div className="showtimes-table-container">
          <table className="showtimes-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectedShowtimes.length === currentShowtimes.length && currentShowtimes.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th>ID</th>
                <th>Phim</th>
                <th>Phòng chiếu</th>
                <th>Ngày chiếu</th>
                <th>Giờ chiếu</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {currentShowtimes.map((showtime) => (
                <tr
                  key={showtime.Showtime_ID}
                  className={`${selectedShowtimes.includes(showtime.Showtime_ID) ? "selected" : ""}`}
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedShowtimes.includes(showtime.Showtime_ID)}
                      onChange={() => handleSelectShowtime(showtime.Showtime_ID)}
                    />
                  </td>
                  <td>#{showtime.Showtime_ID}</td>
                  <td className="movie-title">
                    {showtime.Movies?.Movie_Name || `Phim #${showtime.Movie_ID}`}
                    {showtime.Movies?.Duration && (
                      <div className="movie-duration">({showtime.Movies.Duration} phút)</div>
                    )}
                    {!showtime.Movies && <div className="movie-missing">Thông tin phim không có</div>}
                  </td>
                  <td className="room-name">
                    {showtime.Rooms?.Room_Name || showtime.Room_Name || "Chưa có thông tin"}
                  </td>
                  <td>{formatDate(showtime.Show_Date)}</td>
                  <td>
                    <div className="time-range">
                      <div>{formatTime(showtime.Start_Time)}</div>
                      <div className="time-separator">-</div>
                      <div>{formatTime(showtime.End_Time)}</div>
                    </div>
                  </td>
                  <td>{getStatusBadge(showtime.Status)}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn edit"
                        title="Chỉnh sửa suất chiếu"
                        disabled={actionLoading === showtime.Showtime_ID}
                        onClick={() => handleEditShowtime(showtime)}
                      >
                        {actionLoading === showtime.Showtime_ID ? <LoadingSpinner size="small" /> : "✏️"}
                      </button>
                      <button
                        onClick={() => handleDeleteShowtime(showtime.Showtime_ID)}
                        className="action-btn delete"
                        disabled={actionLoading === showtime.Showtime_ID}
                        title="Xóa suất chiếu"
                      >
                        {actionLoading === showtime.Showtime_ID ? <LoadingSpinner size="small" /> : "🗑️"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            Trước
          </button>

          <div className="pagination-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`pagination-btn ${currentPage === page ? "active" : ""}`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Sau
          </button>
        </div>
      )}

      <div className="showtimes-summary">
        <div className="summary-item">
          <span className="summary-label">Tổng suất chiếu:</span>
          <span className="summary-value">{showtimes.length}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Đã lên lịch:</span>
          <span className="summary-value">{showtimes.filter((s) => s.Status === "Scheduled").length}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Ẩn:</span>
          <span className="summary-value">{showtimes.filter((s) => s.Status === "Hidden").length}</span>
        </div>
      </div>

      {/* Add Showtime Modal */}
      {showAddModal && (
        <AddShowtimeModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAddShowtime={handleAddShowtime}
        />
      )}

      {/* Edit Showtime Modal */}
      {showEditModal && (
        <EditShowtimeModal
          isOpen={showEditModal}
          onClose={handleCloseEditModal}
          onUpdateShowtime={handleUpdateShowtime}
          showtime={editingShowtime}
        />
      )}

      <style>{`
        .manage-showtime {
          padding: 1.5rem;
          background-color: #f5f7fa;
          min-height: 100vh;
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
          color: #2c3e50;
        }

        .manage-showtime-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 50vh;
          color: #7f8c8d;
        }

        .manage-showtime-header {
          margin-bottom: 2rem;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 2rem;
        }

        .header-content h1 {
          color: #2c3e50;
          margin: 0;
          font-size: 2.2rem;
          font-weight: 700;
        }

        .header-content p {
          color: #7f8c8d;
          margin: 0.5rem 0 0 0;
          font-size: 1rem;
        }

        .header-actions {
          flex-shrink: 0;
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .btn-primary {
          background-color: #3498db;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: background-color 0.2s ease;
        }

        .btn-primary:hover {
          background-color: #2980b9;
        }

        .btn-secondary {
          background-color: #95a5a6;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: background-color 0.2s ease;
        }

        .btn-secondary:hover:not(:disabled) {
          background-color: #7f8c8d;
        }

        .btn-secondary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          background-color: #bdc3c7;
        }

        .btn-toggle {
          background-color: #95a5a6;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: background-color 0.2s ease;
        }

        .btn-toggle:hover {
          background-color: #7f8c8d;
        }

        .btn-toggle.active {
          background-color: #f39c12;
          color: white;
        }

        .btn-toggle.active:hover {
          background-color: #e67e22;
        }

        .manage-showtime-controls {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          margin-bottom: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .search-bar {
          display: flex;
          gap: 1rem;
        }

        .search-input {
          flex: 1;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 1rem;
          background-color: #f8f9fa;
          color: #2c3e50;
        }

        .search-input:focus {
          outline: none;
          border-color: #3498db;
          background-color: white;
        }

        .filters {
          display: flex;
          gap: 1rem;
        }

        .filter-select {
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 0.9rem;
          background-color: white;
          cursor: pointer;
          color: #2c3e50;
        }

        .bulk-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background-color: #e8f4fd;
          border-radius: 6px;
          border-left: 4px solid #3498db;
        }

        .selected-count {
          font-weight: 600;
          color: #2c3e50;
        }

        .bulk-btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s ease;
          color: white;
        }

        .bulk-btn.delete {
          background-color: #e74c3c;
        }

        .bulk-btn.delete:hover {
          background-color: #c0392b;
        }

        .showtimes-table-container {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow-x: auto;
          margin-bottom: 1.5rem;
        }

        .showtimes-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9rem;
          color: #2c3e50;
        }

        .showtimes-table th,
        .showtimes-table td {
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid #ecf0f1;
          color: #2c3e50;
        }

        .showtimes-table th {
          background-color: #f8f9fa;
          color: #2c3e50;
          font-weight: 600;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .showtimes-table tr:hover {
          background-color: #f8f9fa;
        }

        .showtimes-table tr.selected {
          background-color: #e8f4fd;
        }

        .movie-title {
          font-weight: 600;
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .movie-duration {
          font-size: 0.8rem;
          color: #7f8c8d;
          font-weight: normal;
          margin-top: 0.25rem;
        }

        .movie-missing {
          font-size: 0.8rem;
          color: #e74c3c;
          font-weight: normal;
          margin-top: 0.25rem;
          font-style: italic;
        }

        .room-name {
          font-weight: 500;
        }

        .time-range {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
        }

        .time-separator {
          color: #7f8c8d;
        }

        .price {
          font-weight: 600;
          color: #27ae60;
        }

        .seat-info {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .seat-info .available {
          color: #27ae60;
          font-weight: 600;
        }

        .seat-info .separator {
          color: #7f8c8d;
        }

        .seat-info .total {
          color: #2c3e50;
        }

        .occupancy-rate {
          font-weight: 600;
          color: #f39c12;
        }

        .status-select {
          padding: 0.4rem 0.6rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 0.85rem;
          background-color: white;
          cursor: pointer;
          color: #2c3e50;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 500;
          text-transform: capitalize;
        }

        .status-scheduled {
          background-color: #d4edda;
          color: #155724;
        }

        .status-hidden {
          background-color: #fff3cd;
          color: #856404;
        }

        .status-unknown {
          background-color: #e2e3e5;
          color: #6c757d;
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .action-btn {
          padding: 0.5rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 1.1rem;
          transition: all 0.2s ease;
          background-color: #f8f9fa;
          color: #6c757d;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 36px;
          min-height: 36px;
        }

        .action-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .action-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .action-btn.edit {
          background-color: #e3f2fd;
          color: #1976d2;
        }

        .action-btn.edit:hover:not(:disabled) {
          background-color: #bbdefb;
          color: #0d47a1;
        }

        .action-btn.delete {
          background-color: #ffebee;
          color: #d32f2f;
        }

        .action-btn.delete:hover:not(:disabled) {
          background-color: #ffcdd2;
          color: #b71c1c;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }

        .pagination-numbers {
          display: flex;
          gap: 0.25rem;
        }

        .pagination-btn {
          padding: 0.5rem 0.75rem;
          border: 1px solid #ddd;
          background-color: white;
          color: #2c3e50;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s ease;
        }

        .pagination-btn:hover:not(:disabled) {
          background-color: #3498db;
          color: white;
          border-color: #3498db;
        }

        .pagination-btn.active {
          background-color: #3498db;
          color: white;
          border-color: #3498db;
        }

        .pagination-btn:disabled {
          background-color: #ecf0f1;
          color: #95a5a6;
          cursor: not-allowed;
        }

        .showtimes-summary {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          display: flex;
          justify-content: space-around;
          gap: 2rem;
        }

        .summary-item {
          text-align: center;
        }

        .summary-label {
          display: block;
          font-size: 0.9rem;
          color: #7f8c8d;
          margin-bottom: 0.5rem;
        }

        .summary-value {
          display: block;
          font-size: 1.5rem;
          font-weight: 700;
          color: #2c3e50;
        }

        @media (max-width: 768px) {
          .manage-showtime {
            padding: 1rem;
          }

          .manage-showtime-header {
            flex-direction: column;
            gap: 1rem;
          }

          .filters {
            flex-direction: column;
          }

          .showtimes-summary {
            flex-direction: column;
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ManageShowtime;

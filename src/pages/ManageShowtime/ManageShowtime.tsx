import React, { useState, useEffect } from "react";
import AddShowtimeModal from "./components/AddShowtimeModal";
import EditShowtimeModal from "./components/EditShowtimeModal";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import ShowtimeFilters from "./components/ShowtimeFilters";
import useShowtimeFilters, { type Showtime } from "../../hooks/useShowtimeFilters";
import { getAllShowtimesByRoom, createShowtime, deleteShowtime } from "../../config/ShowtimeApi";
import { getManagerCinemaRooms } from "../../config/CinemasApi";
import {
  formatDate,
  formatTime,
  LoadingSpinner,
  EmptyState,
  showSuccessToast,
  showErrorToast,
  showWarningToast,
} from "../../components/utils/utils";

const ManageShowtime: React.FC = () => {
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionEditLoading, setActionEditLoading] = useState<number | null>(null);
  const [actionDeleteLoading, setActionDeleteLoading] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedShowtimes, setSelectedShowtimes] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingShowtime, setEditingShowtime] = useState<Showtime | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteModalData, setDeleteModalData] = useState<{
    type: "single" | "bulk";
    showtimeId?: number;
    title: string;
    message: string;
  } | null>(null);

  // Use the custom filter hook
  const {
    filters,
    filteredShowtimes,
    filterStats,
    updateSearch,
    updateDateFilter,
    updateStatusFilter,
    clearDateFilter,
  } = useShowtimeFilters(showtimes);

  const showtimesPerPage = 10;
  const totalPages = Math.ceil(filteredShowtimes.length / showtimesPerPage);
  const startIndex = (currentPage - 1) * showtimesPerPage;
  const currentShowtimes = filteredShowtimes.slice(startIndex, startIndex + showtimesPerPage);

  useEffect(() => {
    fetchShowtimes();
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const fetchShowtimes = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if user has token before making API calls
      const token = localStorage.getItem("token");
      if (!token) {
        const errorMessage = "Bạn cần đăng nhập để truy cập trang này";
        setError(errorMessage);
        showErrorToast(errorMessage);
        return;
      }

      // Fetch manager's cinema rooms
      const managerRooms = await getManagerCinemaRooms();

      const activeManagerRooms = managerRooms.filter((room: any) => room.Status === "Active");

      // Ensure managerRooms is an array
      const rooms = Array.isArray(activeManagerRooms) ? activeManagerRooms : [];

      if (rooms.length === 0) {
        console.warn("Manager has no cinema rooms assigned");
        setShowtimes([]);
        return;
      }

      // Fetch showtimes for each room managed by the current manager
      const showtimePromises = rooms.map((room) =>
        getAllShowtimesByRoom(room.Cinema_Room_ID.toString()).catch((error) => {
          console.error(`Error fetching showtimes for room ${room.Cinema_Room_ID}:`, error);
          return null; // Return null if room has error
        })
      );

      const showtimeResults = await Promise.all(showtimePromises);

      // Process the API response and extract showtimes
      const allShowtimes: Showtime[] = [];

      showtimeResults.forEach((roomData, index) => {
        if (roomData && roomData.dates && Array.isArray(roomData.dates)) {
          const room = rooms[index];

          // Process each date in the room
          roomData.dates.forEach((dateData: any) => {
            if (dateData.showtimes && Array.isArray(dateData.showtimes)) {
              // Process each showtime in the date
              dateData.showtimes.forEach((showtime: any) => {
                allShowtimes.push({
                  ...showtime,
                  // Map the Movie data to Movies for consistency with existing code
                  Movies: showtime.Movie || null,
                  // Add room information
                  Rooms: {
                    Cinema_Room_ID: room.Cinema_Room_ID,
                    Room_Name: roomData.room_name || room.Room_Name,
                    Room_Type: roomData.room_type || room.Room_Type,
                  },
                  // Add Cinema_Room_ID for compatibility
                  Cinema_Room_ID: room.Cinema_Room_ID,
                  Room_Name: roomData.room_name || room.Room_Name,
                  // Add Show_Date from the date data
                  Show_Date: dateData.date,
                  // Map Movie_ID from nested Movie object
                  Movie_ID: showtime.Movie?.Movie_ID || showtime.Movie_ID,
                });
              });
            }
          });
        }
      });

      // Remove duplicates based on Showtime_ID
      const uniqueShowtimes = allShowtimes.filter(
        (showtime, index, self) => index === self.findIndex((s) => s.Showtime_ID === showtime.Showtime_ID)
      );

      setShowtimes(uniqueShowtimes);
    } catch (error: any) {
      console.error("Lỗi khi tải danh sách suất chiếu:", error);

      // Use API error message if available, otherwise fallback to generic message
      let errorMessage = "Không thể tải danh sách suất chiếu. Vui lòng thử lại.";

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      // Handle specific error cases
      if (error?.response?.status === 401) {
        errorMessage = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
        localStorage.removeItem("token");
      } else if (error?.response?.status === 403) {
        errorMessage = "Bạn không có quyền truy cập chức năng này.";
      }

      setError(errorMessage);
      showErrorToast(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAddShowtime = async (showtimeData: any, allowEarlyShowtime?: boolean) => {
    try {
      console.log("Creating showtime with data:", showtimeData);

      // Call API to create showtime with optional allowEarlyShowtime flag
      const newShowtime = await createShowtime(showtimeData, allowEarlyShowtime);
      console.log("API response for new showtime:", newShowtime);

      // Fetch fresh data to ensure we have complete information
      await fetchShowtimes();

      setShowAddModal(false);
      showSuccessToast("Thêm suất chiếu mới thành công");
      setCurrentPage(1);
    } catch (error: any) {
      console.error("Error adding showtime:", error);
      console.error("Error response:", error?.response?.data);

      // Use API error message if available
      let errorMessage = "Lỗi khi thêm suất chiếu mới";

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      // Handle specific validation errors
      if (error?.response?.status === 400) {
        errorMessage = "Dữ liệu không hợp lệ: " + errorMessage;
      } else if (error?.response?.status === 401) {
        errorMessage = "Bạn không có quyền thêm suất chiếu";
      } else if (error?.response?.status === 409) {
        errorMessage = "Xung đột lịch chiếu: " + errorMessage;
      }

      showErrorToast(errorMessage);
      throw error;
    }
  };

  const handleEditShowtime = (showtime: Showtime) => {
    setEditingShowtime(showtime);
    setActionEditLoading(showtime.Showtime_ID);
    setShowEditModal(true);
  };

  const handleUpdateShowtime = async (updatedShowtimeData: any) => {
    try {
      console.log("Updated showtime data:", updatedShowtimeData);

      // Fetch fresh data to ensure we have complete information
      await fetchShowtimes();

      setShowEditModal(false);
      setEditingShowtime(null);

      // Show success toast here instead of in modal
      showSuccessToast("Cập nhật suất chiếu thành công");
    } catch (error: any) {
      console.error("Error updating showtime:", error);

      // Use API error message if available
      let errorMessage = "Lỗi khi cập nhật suất chiếu";

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      showErrorToast(errorMessage);
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setActionEditLoading(null);
    setEditingShowtime(null);
  };

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

    setDeleteModalData({
      type: "single",
      showtimeId,
      title: "Xác nhận ẩn suất chiếu",
      message: `Bạn có chắc chắn muốn ẩn suất chiếu phòng "${
        showtime.Rooms?.Room_Name || showtime.Rooms.Room_Name
      }" - ${formatDate(showtime.Show_Date)}?\n\nSuất chiếu sẽ bị ẩn khỏi hệ thống.`,
    });
    setShowDeleteModal(true);
  };

  const handleBulkDelete = async () => {
    if (selectedShowtimes.length === 0) {
      showWarningToast("Vui lòng chọn suất chiếu trước");
      return;
    }

    setDeleteModalData({
      type: "bulk",
      title: "Xác nhận ẩn suất chiếu",
      message: `Bạn có chắc chắn muốn ẩn ${selectedShowtimes.length} suất chiếu?\n\nCác suất chiếu sẽ bị ẩn khỏi hệ thống.`,
    });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteModalData) return;

    try {
      if (deleteModalData.type === "single" && deleteModalData.showtimeId) {
        setActionDeleteLoading(deleteModalData.showtimeId);
        await deleteShowtime(deleteModalData.showtimeId.toString());
        showSuccessToast("Đã ẩn suất chiếu thành công");
        setSelectedShowtimes((prev) => prev.filter((id) => id !== deleteModalData.showtimeId));
      } else if (deleteModalData.type === "bulk") {
        setLoading(true);
        const deletePromises = selectedShowtimes.map((showtimeId) => deleteShowtime(showtimeId.toString()));
        await Promise.all(deletePromises);
        showSuccessToast(`Đã ẩn ${selectedShowtimes.length} suất chiếu thành công`);
        setSelectedShowtimes([]);
      }

      await fetchShowtimes();
      setShowDeleteModal(false);
      setDeleteModalData(null);
    } catch (error: any) {
      let errorMessage = "Lỗi khi ẩn suất chiếu";

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      showErrorToast(errorMessage);
      if (deleteModalData.type === "bulk") {
        await fetchShowtimes();
      }
    } finally {
      setActionDeleteLoading(null);
      setLoading(false);
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteModalData(null);
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
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            <span>➕</span>
            Thêm suất chiếu mới
          </button>
        </div>
      </div>

      {/* Use the new filter component */}
      <ShowtimeFilters
        filters={filters}
        filteredCount={filteredShowtimes.length}
        onSearchChange={updateSearch}
        onDateFilterChange={updateDateFilter}
        onStatusFilterChange={updateStatusFilter}
        onClearDateFilter={clearDateFilter}
      />

      <div className="manage-showtime-controls">
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
          title={filters.statusFilter === "hidden" ? "Không có suất chiếu đã ẩn" : "Không tìm thấy suất chiếu"}
          description={
            filters.search
              ? "Thử tìm kiếm với từ khóa khác"
              : filters.statusFilter === "hidden"
              ? "Chưa có suất chiếu nào bị ẩn"
              : "Chưa có suất chiếu nào đã lên lịch"
          }
          icon={filters.statusFilter === "hidden" ? "👁️" : "🎬"}
          action={
            filters.search ? (
              <button className="btn-primary" onClick={() => updateSearch("")}>
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
                    {showtime.Movies?.Movie_Name || `Phim #${showtime.Movies?.Movie_ID}`}
                    {showtime.Movies?.Duration && (
                      <div className="movie-duration">({showtime.Movies?.Duration} phút)</div>
                    )}
                    {!showtime.Movies && <div className="movie-missing">Thông tin phim không có</div>}
                  </td>
                  <td className="room-info">
                    <div className="room-name">
                      {showtime.Rooms?.Room_Name || showtime.Rooms.Room_Name || "Chưa có thông tin"}
                    </div>
                    {showtime.Rooms?.Room_Type && <div className="room-type">({showtime.Rooms.Room_Type})</div>}
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
                        disabled={actionEditLoading === showtime.Showtime_ID}
                        onClick={() => handleEditShowtime(showtime)}
                      >
                        {actionEditLoading === showtime.Showtime_ID ? <LoadingSpinner size="small" /> : "✏️"}
                      </button>
                      <button
                        onClick={() => handleDeleteShowtime(showtime.Showtime_ID)}
                        className="action-btn delete"
                        disabled={actionDeleteLoading === showtime.Showtime_ID}
                        title="Xóa suất chiếu"
                      >
                        {actionDeleteLoading === showtime.Showtime_ID ? <LoadingSpinner size="small" /> : "🗑️"}
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
          <span className="summary-value">{filterStats.total}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Đã lên lịch:</span>
          <span className="summary-value">{filterStats.scheduled}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Ẩn:</span>
          <span className="summary-value">{filterStats.hidden}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Hiển thị:</span>
          <span className="summary-value">{filterStats.filtered}</span>
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deleteModalData && (
        <DeleteConfirmModal
          isOpen={showDeleteModal}
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
          title={deleteModalData.title}
          message={deleteModalData.message}
          isLoading={deleteModalData.type === "single" ? actionDeleteLoading === deleteModalData.showtimeId : loading}
          confirmText="Ẩn suất chiếu"
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
          align-items: flex-start;
          flex-wrap: wrap;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .filter-select {
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 0.9rem;
          background-color: white;
          cursor: pointer;
          color: #2c3e50;
          min-width: 200px;
        }

        .filter-select optgroup {
          font-weight: 600;
          color: #2c3e50;
          background-color: #f8f9fa;
        }

        .filter-select option {
          padding: 0.5rem;
          color: #2c3e50;
        }

        .custom-date-picker {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .custom-date-input {
          padding: 0.5rem 0.75rem;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 0.9rem;
          background-color: white;
          color: #2c3e50;
          min-width: 150px;
          transition: border-color 0.2s ease;
        }

        .custom-date-input:focus {
          outline: none;
          border-color: #3498db;
          box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.1);
        }

        .filter-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-left: auto;
          margin-top: 0.25rem;
        }

        .filter-count {
          font-size: 0.9rem;
          color: #7f8c8d;
          font-weight: 500;
          padding: 0.5rem 0.75rem;
          background-color: #f8f9fa;
          border-radius: 4px;
          border: 1px solid #e9ecef;
        }

        .clear-filter-btn {
          background-color: #e74c3c;
          color: white;
          border: none;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          cursor: pointer;
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s ease;
        }

        .clear-filter-btn:hover {
          background-color: #c0392b;
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

        .room-info {
          font-weight: 500;
        }

        .room-name {
          font-weight: 500;
          color: #2c3e50;
        }

        .room-type {
          font-size: 0.8rem;
          color: #7f8c8d;
          font-weight: normal;
          margin-top: 0.25rem;
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
          color: #2c3e50 !important;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .pagination-btn:hover:not(:disabled) {
          background-color: #3498db;
          color: white !important;
          border-color: #3498db;
        }

        .pagination-btn.active {
          background-color: #3498db;
          color: white !important;
          border-color: #3498db;
          font-weight: 600;
        }

        .pagination-btn:disabled {
          background-color: #f8f9fa;
          color: #495057 !important;
          border-color: #e9ecef;
          cursor: not-allowed;
          opacity: 1;
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

          .header-actions {
            width: 100%;
            justify-content: flex-start;
          }

          .btn-primary {
            justify-content: center;
            width: 100%;
          }

          .filters {
            flex-direction: column;
            align-items: stretch;
          }

          .filter-group {
            width: 100%;
          }

          .filter-select {
            min-width: auto;
            width: 100%;
          }

          .custom-date-input {
            min-width: auto;
            width: 100%;
          }

          .filter-info {
            margin-left: 0;
            justify-content: space-between;
            margin-top: 0.5rem;
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

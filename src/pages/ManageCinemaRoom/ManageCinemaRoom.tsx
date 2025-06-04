import React, { useState, useEffect } from "react";
import api from "../../config/axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiX,
  FiAlertCircle,
  FiRefreshCw,
  FiAlertTriangle,
  FiGrid,
  FiLayout,
  FiInfo,
} from "react-icons/fi";
import "./ManageCinemaRoom.css";

// Interface cho response từ GET API
interface CinemaRoomResponse {
  Cinema_Room_ID: number;
  Room_Name: string;
  Seat_Quantity: number;
  Room_Type: string;
  Status: string;
  Notes: string;
  HasUpcomingShowtimes: boolean;
  Created_At?: string;
  Updated_At?: string | null;
}

// Interface cho request gửi lên POST API
interface CinemaRoomRequest {
  RoomName: string;
  Capacity: number;
  RoomType: string;
  Description: string;
  Status: string;
}
// Modal component props
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  size = "md",
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "modal-sm",
    md: "modal-md",
    lg: "modal-lg",
    xl: "modal-xl",
  };

  return (
    <div className="modal-overlay">
      <div className={`modal-content ${sizeClasses[size]}`}>
        <button onClick={onClose} className="modal-close-button">
          <FiX className="modal-close-icon" />
        </button>
        {children}
      </div>
    </div>
  );
};

const ManageCinemaRoom: React.FC = () => {
  const [cinemaRooms, setCinemaRooms] = useState<CinemaRoomResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [isUpdatingRoom, setIsUpdatingRoom] = useState(false);
  const [currentRoomId, setCurrentRoomId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [newRoom, setNewRoom] = useState<Partial<CinemaRoomRequest>>({
    RoomName: "",
    Capacity: 0,
    RoomType: "",
    Description: "",
    Status: "Active",
  });

  const navigate = useNavigate();

  // Get role from localStorage
  const getRole = () => {
    return localStorage.getItem("role") || sessionStorage.getItem("role");
  };

  // Check access rights
  useEffect(() => {
    const role = getRole();
    if (role !== "Admin" && role !== "Staff" && role !== "Manager") {
      toast.error("Bạn không có quyền truy cập trang này.");
      navigate("/");
    }
  }, [navigate]);

  // Fetch cinema rooms from API
  const fetchCinemaRooms = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/cinema-rooms");
      if (Array.isArray(response.data)) {
        const sortedRooms = response.data.sort(
          (a: CinemaRoomResponse, b: CinemaRoomResponse) =>
            b.Cinema_Room_ID - a.Cinema_Room_ID
        );
        setCinemaRooms(sortedRooms);
      } else {
        setError("Không thể tải danh sách phòng chiếu.");
        toast.error("Không thể tải danh sách phòng chiếu.");
      }
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi khi tải dữ liệu.");
      toast.error(err.message || "Đã xảy ra lỗi khi tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCinemaRooms();
  }, []);

  // Filter cinema rooms based on search and status
  const filteredRooms = cinemaRooms.filter((room) => {
    const matchesSearch = room.Room_Name.toLowerCase().includes(
      searchTerm.toLowerCase()
    );
    const matchesStatus =
      statusFilter === "all" || room.Status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Open add room modal
  const handleAddRoom = () => {
    setNewRoom({
      RoomName: "",
      Capacity: 0,
      RoomType: "",
      Description: "",
      Status: "Active",
    });
    setIsUpdatingRoom(false);
    setIsAddingRoom(true);
  };

  // Open edit room modal
  const handleEditRoom = (room: CinemaRoomResponse) => {
    setCurrentRoomId(room.Cinema_Room_ID);
    setNewRoom({
      RoomName: room.Room_Name,
      Capacity: room.Seat_Quantity,
      RoomType: room.Room_Type,
      Description: room.Notes || "",
      Status: room.Status,
    });
    setIsAddingRoom(false);
    setIsUpdatingRoom(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsAddingRoom(false);
    setIsUpdatingRoom(false);
    setConfirmDeleteId(null);
    setCurrentRoomId(null);
    setNewRoom({
      RoomName: "",
      Capacity: 0,
      RoomType: "",
      Description: "",
      Status: "Active",
    });
  };

  // Create new cinema room
  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Xác thực thất bại. Vui lòng đăng nhập lại.");
      return;
    }

    // Validate input
    if (!newRoom.RoomName?.trim()) {
      toast.error("Tên phòng là bắt buộc.");
      return;
    }
    if (!newRoom.Capacity || newRoom.Capacity <= 0) {
      toast.error("Số ghế phải lớn hơn 0.");
      return;
    }
    if (!newRoom.RoomType?.trim()) {
      toast.error("Loại phòng là bắt buộc.");
      return;
    }

    try {
      const response = await api.post("/cinema-rooms", newRoom, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data) {
        await fetchCinemaRooms();
        toast.success(
          `Phòng chiếu '${newRoom.RoomName}' đã được tạo thành công!`
        );
        handleCloseModal();
      } else {
        throw new Error("Dữ liệu trả về từ server không hợp lệ.");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Không thể tạo phòng chiếu.";
      toast.error(`Lỗi: ${errorMessage}`);
    }
  };

  // Update cinema room
  const handleUpdateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRoomId) {
      toast.error("Không có phòng chiếu nào được chọn để cập nhật.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Xác thực thất bại. Vui lòng đăng nhập lại.");
      return;
    }

    // Validate input
    if (!newRoom.RoomName?.trim()) {
      toast.error("Tên phòng là bắt buộc.");
      return;
    }
    if (!newRoom.Capacity || newRoom.Capacity <= 0) {
      toast.error("Số ghế phải lớn hơn 0.");
      return;
    }
    if (!newRoom.RoomType?.trim()) {
      toast.error("Loại phòng là bắt buộc.");
      return;
    }

    try {
      const response = await api.put(
        `/cinema-rooms/${currentRoomId}`,
        newRoom,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        await fetchCinemaRooms();
        toast.success(
          `Phòng chiếu '${newRoom.RoomName}' đã được cập nhật thành công!`
        );
        handleCloseModal();
      } else {
        throw new Error("Dữ liệu trả về từ server không hợp lệ.");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Không thể cập nhật phòng chiếu.";
      toast.error(`Lỗi: ${errorMessage}`);
    }
  };

  // Delete cinema room
  const handleDeleteRoom = async (id: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Xác thực thất bại. Vui lòng đăng nhập lại.");
      return;
    }

    try {
      await api.delete(`/cinema-rooms/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      await fetchCinemaRooms();
      toast.success("Phòng chiếu đã được xóa thành công!");
      setConfirmDeleteId(null);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Không thể xóa phòng chiếu.";
      toast.error(`Lỗi: ${errorMessage}`);
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="manage-cinema-room">
      <ToastContainer position="top-right" autoClose={5000} />
  
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản Lý Phòng Chiếu</h1>
          <p className="page-subtitle">
            Quản lý các phòng chiếu và thông tin chi tiết của chúng
          </p>
        </div>
        <button onClick={handleAddRoom} className="add-room-button">
          <FiPlus className="add-room-icon" />
          Thêm Phòng Chiếu Mới
        </button>
      </div>
  
      {/* Filters and Controls */}
      <div className="filters-container">
        <div className="filters-left">
          <div className="search-wrapper">
            <div className="search-container">
              <input
                type="text"
                placeholder="Tìm kiếm phòng chiếu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <FiSearch className="search-icon" />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="clear-search-button"
                >
                  <FiX className="clear-search-icon" />
                </button>
              )}
            </div>
          </div>
        </div>
  
        <div className="filters-center">
          <div className="view-mode-toggle">
            <button
              onClick={() => setViewMode("table")}
              className={`view-mode-button ${
                viewMode === "table" ? "view-mode-button-active" : ""
              }`}
              title="Chế Độ Bảng"
            >
              <FiLayout className="view-mode-icon" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`view-mode-button ${
                viewMode === "grid" ? "view-mode-button-active" : ""
              }`}
              title="Chế Độ Lưới"
            >
              <FiGrid className="view-mode-icon" />
            </button>
          </div>
        </div>
  
        <div className="filters-right">
          <div className="status-filter-wrapper">
            <div className="status-filter-container">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="status-filter-select"
              >
                <option value="all">Tất Cả Trạng Thái</option>
                <option value="Active">Hoạt Động</option>
                <option value="Inactive">Không Hoạt Động</option>
              </select>
            </div>
          </div>
        </div>
      </div>
  
      {/* Error Display */}
      {error && (
        <div className="error-message">
          <div className="error-content">
            <FiAlertCircle className="error-icon" />
            <p className="error-text">{error}</p>
          </div>
          <button onClick={fetchCinemaRooms} className="error-retry-button">
            <FiRefreshCw className="error-retry-icon" /> Thử Lại
          </button>
        </div>
      )}
  
      {/* Loading State */}
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Đang tải danh sách phòng chiếu...</p>
        </div>
      ) : (
        <>
          {/* Table View */}
          {viewMode === "table" && (
            <div className="table-view">
              {filteredRooms.length > 0 ? (
                <div className="table-scroll-container">
                  <table className="cinema-room-table">
                    <thead className="table-header">
                      <tr>
                        <td className="table-header-cell">ID</td>
                        <td className="table-header-cell">Tên Phòng</td>
                        <td className="table-header-cell">Loại Phòng</td>
                        <td className="table-header-cell">Số Ghế</td>
                        <td className="table-header-cell">Trạng Thái</td>
                        <td className="table-header-cell">Ghi Chú</td>
                        <td className="table-header-cell">
                          Có Suất Chiếu Sắp Tới
                        </td>
                        <td className="table-header-cell text-right">
                          Hành Động
                        </td>
                      </tr>
                    </thead>
                    <tbody className="table-body">
                      {filteredRooms.map((room) => (
                        <tr key={room.Cinema_Room_ID} className="table-row">
                          <td className="table-cell">
                            <div className="cell-content-bold">
                              {room.Cinema_Room_ID}
                            </div>
                          </td>
                          <td className="table-cell">
                            <div className="cell-content-bold">
                              {room.Room_Name}
                            </div>
                          </td>
                          <td className="table-cell">
                            <div className="cell-content">{room.Room_Type}</div>
                          </td>
                          <td className="table-cell">
                            <div className="cell-content">
                              {room.Seat_Quantity}
                            </div>
                          </td>
                          <td className="table-cell">
                            <span
                              className={`status-label ${
                                room.Status === "Active" ? "status-active" : "status-inactive-red"
                              }`}
                            >
                              {room.Status}
                            </span>
                          </td>
                          <td className="table-cell">
                            <div className="cell-content">
                              {room.Notes || "-"}
                            </div>
                          </td>
                          <td className="table-cell">
                            <div className="cell-content">
                              {room.HasUpcomingShowtimes ? "Có" : "Không"}
                            </div>
                          </td>
                          <td className="table-cell text-right">
                            <div className="action-buttons">
                              <button
                                onClick={() => handleEditRoom(room)}
                                className="edit-button"
                                title="Chỉnh Sửa Phòng Chiếu"
                              >
                                <FiEdit2 className="action-icon" />
                              </button>
                              <button
                                onClick={() =>
                                  setConfirmDeleteId(room.Cinema_Room_ID)
                                }
                                className="delete-button"
                                title="Xóa Phòng Chiếu"
                              >
                                <FiTrash2 className="action-icon" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="no-data-message">
                  <FiInfo className="no-data-icon" />
                  <h3 className="no-data-title">Không tìm thấy phòng chiếu</h3>
                  <p className="no-data-text">
                    {searchTerm || statusFilter !== "all"
                      ? "Thử điều chỉnh tiêu chí tìm kiếm hoặc bộ lọc của bạn"
                      : "Thêm một phòng chiếu mới để bắt đầu"}
                  </p>
                </div>
              )}
            </div>
          )}
  
          {/* Grid View */}
          {viewMode === "grid" && (
            <>
              {filteredRooms.length > 0 ? (
                <div className="grid-view">
                  {filteredRooms.map((room) => (
                    <div key={room.Cinema_Room_ID} className="grid-card">
                      <div className="grid-card-content">
                        <div className="grid-card-header">
                          <h3
                            className="grid-card-title"
                            title={room.Room_Name}
                          >
                            {room.Room_Name}
                          </h3>
                          <span
                            className={`status-label ${
                              room.Status === "Active" ? "status-active" : "status-inactive-red"
                            }`}
                          >
                            {room.Status}
                          </span>
                        </div>
  
                        <div className="grid-card-details">
                          <div className="grid-card-detail">
                            <span className="detail-label">ID:</span>
                            <span className="detail-value">
                              {room.Cinema_Room_ID}
                            </span>
                          </div>
                          <div className="grid-card-detail">
                            <span className="detail-label">Loại Phòng:</span>
                            <span className="detail-value">
                              {room.Room_Type}
                            </span>
                          </div>
                          <div className="grid-card-detail">
                            <span className="detail-label">Số Ghế:</span>
                            <span className="detail-value">
                              {room.Seat_Quantity}
                            </span>
                          </div>
                          <div className="grid-card-detail">
                            <span className="detail-label">Ghi Chú:</span>
                            <span className="detail-value">
                              {room.Notes || "-"}
                            </span>
                          </div>
                          <div className="grid-card-detail">
                            <span className="detail-label">
                              Suất Chiếu Sắp Tới:
                            </span>
                            <span className="detail-value">
                              {room.HasUpcomingShowtimes ? "Có" : "Không"}
                            </span>
                          </div>
                        </div>
  
                        <div className="grid-card-actions">
                          <button
                            onClick={() => handleEditRoom(room)}
                            className="edit-button"
                            title="Chỉnh Sửa Phòng Chiếu"
                          >
                            <FiEdit2 className="action-icon" />
                          </button>
                          <button
                            onClick={() =>
                              setConfirmDeleteId(room.Cinema_Room_ID)
                            }
                            className="delete-button"
                            title="Xóa Phòng Chiếu"
                          >
                            <FiTrash2 className="action-icon" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-data-message grid-no-data">
                  <FiInfo className="no-data-icon" />
                  <h3 className="no-data-title">Không tìm thấy phòng chiếu</h3>
                  <p className="no-data-text">
                    {searchTerm || statusFilter !== "all"
                      ? "Thử điều chỉnh tiêu chí tìm kiếm hoặc bộ lọc của bạn"
                      : "Thêm một phòng chiếu mới để bắt đầu"}
                  </p>
                </div>
              )}
            </>
          )}
        </>
      )}
  
      {/* Add/Edit Room Modal */}
      <Modal
        isOpen={isAddingRoom || isUpdatingRoom}
        onClose={handleCloseModal}
        size="md"
      >
        <div className="modal-body">
          <h2 className="modal-title">
            {isUpdatingRoom ? "Cập Nhật Phòng Chiếu" : "Thêm Phòng Chiếu Mới"}
          </h2>
          <form
            onSubmit={isUpdatingRoom ? handleUpdateRoom : handleCreateRoom}
            className="modal-form"
          >
            <div className="form-group">
              <label className="form-label">
                Tên Phòng <span className="required">*</span>
              </label>
              <input
                type="text"
                value={newRoom.RoomName || ""}
                onChange={(e) =>
                  setNewRoom({ ...newRoom, RoomName: e.target.value })
                }
                className="form-input"
                placeholder="Nhập tên phòng"
                required
              />
            </div>
  
            <div className="form-group">
              <label className="form-label">
                Số Ghế <span className="required">*</span>
              </label>
              <input
                type="number"
                value={newRoom.Capacity || 0}
                onChange={(e) =>
                  setNewRoom({ ...newRoom, Capacity: parseInt(e.target.value) })
                }
                className="form-input"
                placeholder="Nhập số ghế"
                required
                min="1"
              />
            </div>
  
            <div className="form-group">
              <label className="form-label">
                Loại Phòng <span className="required">*</span>
              </label>
              <select
                value={newRoom.RoomType || ""}
                onChange={(e) =>
                  setNewRoom({ ...newRoom, RoomType: e.target.value })
                }
                className="form-select"
                required
              >
                <option value="">Chọn loại phòng</option>
                <option value="2D">2D</option>
                <option value="3D">3D</option>
                <option value="IMAX">IMAX</option>
              </select>
            </div>
  
            <div className="form-group">
              <label className="form-label">Ghi Chú</label>
              <textarea
                value={newRoom.Description || ""}
                onChange={(e) =>
                  setNewRoom({ ...newRoom, Description: e.target.value })
                }
                className="form-textarea"
                rows={4}
                placeholder="Ghi chú (Tùy Chọn)"
              ></textarea>
            </div>
  
            <div className="form-group">
              <label className="form-label">
                Trạng Thái <span className="required">*</span>
              </label>
              <select
                value={newRoom.Status || "Active"}
                onChange={(e) =>
                  setNewRoom({ ...newRoom, Status: e.target.value })
                }
                className="form-select"
                required
              >
                <option value="Active">Hoạt Động</option>
                <option value="Inactive">Không Hoạt Động</option>
              </select>
            </div>
  
            <div className="modal-actions">
              <button
                type="button"
                onClick={handleCloseModal}
                className="modal-cancel-button"
              >
                Hủy
              </button>
              <button type="submit" className="modal-submit-button">
                {isUpdatingRoom ? "Cập Nhật Phòng" : "Thêm Phòng"}
              </button>
            </div>
          </form>
        </div>
      </Modal>
  
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
        size="sm"
      >
        <div className="modal-body">
          <div className="delete-confirmation">
            <FiAlertTriangle className="delete-icon" />
          </div>
          <h2 className="modal-title text-center">Xác Nhận Xóa</h2>
          <p className="modal-message text-center">
            Bạn có chắc chắn muốn xóa phòng chiếu này không? Hành động này không
            thể hoàn tác.
          </p>
          <div className="modal-actions justify-center">
            <button
              onClick={() => setConfirmDeleteId(null)}
              className="modal-cancel-button"
            >
              Hủy
            </button>
            <button
              onClick={() =>
                confirmDeleteId && handleDeleteRoom(confirmDeleteId)
              }
              className="modal-delete-button"
            >
              Xóa
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ManageCinemaRoom;

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
import "./ManageCinemaBranch.css";

// Định nghĩa kiểu dữ liệu cho rạp phim
interface Cinema {
  Cinema_ID: number;
  Cinema_Name: string;
  Address: string;
  City: string;
  Province: string;
  Phone_Number: string;
  Email: string;
  Description: string;
  Status: string;
  Created_At: string;
  Updated_At: string | null;
}

// Định nghĩa kiểu dữ liệu cho phòng chiếu
interface Room {
  Cinema_Room_ID: number;
  Room_Name: string;
  Seat_Quantity: number;
  Room_Type: string;
  Status: string;
  Notes: string;
  Cinema_ID: number;
}

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
        <button type="button" onClick={onClose} className="modal-close-button">
          <FiX className="modal-close-icon" />
        </button>
        {children}
      </div>
    </div>
  );
};

const ManageCinemaBranch: React.FC = () => {
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [isAddingCinema, setIsAddingCinema] = useState(false);
  const [isUpdatingCinema, setIsUpdatingCinema] = useState(false);
  const [isManagingRooms, setIsManagingRooms] = useState(false);
  const [currentCinemaId, setCurrentCinemaId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [newCinema, setNewCinema] = useState<Partial<Cinema>>({
    Cinema_Name: "",
    Address: "",
    City: "",
    Province: "",
    Phone_Number: "",
    Email: "",
    Description: "",
    Status: "Active",
  });

  const navigate = useNavigate();

  // Lấy role từ localStorage
  const getRole = () => {
    return localStorage.getItem("role") || sessionStorage.getItem("role");
  };

  // Kiểm tra quyền truy cập
  useEffect(() => {
    const role = getRole();
    if (role !== "Admin") {
      toast.error("Bạn không có quyền truy cập trang này.");
      navigate("/");
    }
  }, [navigate]);

  // Lấy dữ liệu rạp phim từ API
  const fetchCinemas = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/cinemas");
      if (response.data.success) {
        const sortedCinemas = response.data.data.sort(
          (a: Cinema, b: Cinema) => b.Cinema_ID - a.Cinema_ID
        );
        setCinemas(sortedCinemas);
      } else {
        setError("Không thể tải danh sách rạp phim.");
        toast.error("Không thể tải danh sách rạp phim.");
      }
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi khi tải dữ liệu.");
      toast.error(err.message || "Đã xảy ra lỗi khi tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  // Lấy dữ liệu phòng chiếu từ API
  const fetchRooms = async (cinemaId: number) => {
    try {
      setLoading(true);
      const response = await api.get(`/cinemas/${cinemaId}/rooms`);
      if (response.data.success) {
        setRooms(response.data.data);
      } else {
        throw new Error("Không thể tải danh sách phòng chiếu.");
      }
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi khi tải dữ liệu phòng chiếu.");
      toast.error(err.message || "Đã xảy ra lỗi khi tải dữ liệu phòng chiếu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCinemas();
  }, []);

  // Lọc rạp phim dựa trên tìm kiếm và trạng thái
  const filteredCinemas = cinemas.filter((cinema) => {
    const matchesSearch =
      cinema.Cinema_Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cinema.City.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cinema.Province.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || cinema.Status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Mở modal thêm rạp phim
  const handleAddCinema = () => {
    setNewCinema({
      Cinema_Name: "",
      Address: "",
      City: "",
      Province: "",
      Phone_Number: "",
      Email: "",
      Description: "",
      Status: "Active",
    });
    setIsUpdatingCinema(false);
    setIsAddingCinema(true);
  };

  // Mở modal chỉnh sửa rạp phim
  const handleEditCinema = (cinema: Cinema) => {
    setCurrentCinemaId(cinema.Cinema_ID);
    setNewCinema({
      Cinema_Name: cinema.Cinema_Name,
      Address: cinema.Address,
      City: cinema.City,
      Province: cinema.Province,
      Phone_Number: cinema.Phone_Number,
      Email: cinema.Email,
      Description: cinema.Description,
      Status: cinema.Status,
    });
    setIsAddingCinema(false);
    setIsUpdatingCinema(true);
  };

  // Mở modal quản lý phòng chiếu
  const handleManageRooms = (cinemaId: number) => {
    setCurrentCinemaId(cinemaId);
    setIsManagingRooms(true); // Chỉ mở modal, fetchRooms sẽ được gọi qua useEffect
  };

  // Đóng modal
  const handleCloseModal = () => {
    setIsAddingCinema(false);
    setIsUpdatingCinema(false);
    setIsManagingRooms(false);
    setConfirmDeleteId(null);
    setCurrentCinemaId(null);
    setRooms([]); // Reset rooms khi đóng modal
    setNewCinema({
      Cinema_Name: "",
      Address: "",
      City: "",
      Province: "",
      Phone_Number: "",
      Email: "",
      Description: "",
      Status: "Active",
    });
  };

  // Thêm rạp phim mới
  const handleCreateCinema = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Xác thực thất bại. Vui lòng đăng nhập lại.");
      return;
    }

    if (!newCinema.Cinema_Name?.trim()) {
      toast.error("Tên rạp là bắt buộc.");
      return;
    }
    if (!newCinema.Address?.trim()) {
      toast.error("Địa chỉ là bắt buộc.");
      return;
    }
    if (!newCinema.City?.trim()) {
      toast.error("Thành phố là bắt buộc.");
      return;
    }
    if (!newCinema.Province?.trim()) {
      toast.error("Tỉnh là bắt buộc.");
      return;
    }
    if (!newCinema.Phone_Number?.trim()) {
      toast.error("Số điện thoại là bắt buộc.");
      return;
    }
    if (!newCinema.Email?.trim()) {
      toast.error("Email là bắt buộc.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newCinema.Email || "")) {
      toast.error("Email không hợp lệ.");
      return;
    }

    try {
      const response = await api.post("/cinemas", newCinema, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data) {
        await fetchCinemas();
        toast.success(
          `Rạp phim '${newCinema.Cinema_Name}' đã được tạo thành công!`
        );
        handleCloseModal();
      } else {
        throw new Error("Dữ liệu trả về từ server không hợp lệ.");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Không thể tạo rạp phim.";
      toast.error(`Lỗi: ${errorMessage}`);
    }
  };

  // Cập nhật rạp phim
  const handleUpdateCinema = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCinemaId) {
      toast.error("Không có rạp phim nào được chọn để cập nhật.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Xác thực thất bại. Vui lòng đăng nhập lại.");
      return;
    }

    if (!newCinema.Cinema_Name?.trim()) {
      toast.error("Tên rạp là bắt buộc.");
      return;
    }
    if (!newCinema.Address?.trim()) {
      toast.error("Địa chỉ là bắt buộc.");
      return;
    }
    if (!newCinema.City?.trim()) {
      toast.error("Thành phố là bắt buộc.");
      return;
    }
    if (!newCinema.Province?.trim()) {
      toast.error("Tỉnh là bắt buộc.");
      return;
    }
    if (!newCinema.Phone_Number?.trim()) {
      toast.error("Số điện thoại là bắt buộc.");
      return;
    }
    if (!newCinema.Email?.trim()) {
      toast.error("Email là bắt buộc.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newCinema.Email || "")) {
      toast.error("Email không hợp lệ.");
      return;
    }

    try {
      const response = await api.put(`/cinemas/${currentCinemaId}`, newCinema, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data) {
        await fetchCinemas();
        toast.success(
          `Rạp phim '${newCinema.Cinema_Name}' đã được cập nhật thành công!`
        );
        handleCloseModal();
      } else {
        throw new Error("Dữ liệu trả về từ server không hợp lệ.");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Không thể cập nhật rạp phim.";
      toast.error(`Lỗi: ${errorMessage}`);
    }
  };

  // Xóa rạp phim
  const handleDeleteCinema = async (id: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Xác thực thất bại. Vui lòng đăng nhập lại.");
      return;
    }

    try {
      await api.delete(`/cinemas/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchCinemas();
      toast.success("Rạp phim đã được xóa thành công!");
      setConfirmDeleteId(null);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Không thể xóa rạp phim.";
      toast.error(`Lỗi: ${errorMessage}`);
      setConfirmDeleteId(null);
    }
  };

  // Gọi fetchRooms khi modal Manage Rooms mở và có currentCinemaId
  useEffect(() => {
    if (isManagingRooms && currentCinemaId) {
      fetchRooms(currentCinemaId);
    }
  }, [isManagingRooms, currentCinemaId]);

  return (
    <div className="manage-cinema-branch">
      <ToastContainer position="top-right" autoClose={5000} />

      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản Lý Rạp Phim</h1>
          <p className="page-subtitle">
            Quản lý các rạp phim và thông tin chi tiết của chúng
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddCinema}
          className="add-cinema-button"
        >
          <FiPlus className="add-cinema-icon" /> Thêm Rạp Phim Mới
        </button>
      </div>

      {/* Filters and Controls */}
      <div className="filters-container">
        <div className="filters-left">
          <div className="search-wrapper">
            <div className="search-container">
              <input
                type="text"
                placeholder="Tìm kiếm rạp phim..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <FiSearch className="search-icon" />
              {searchTerm && (
                <button
                  type="button"
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
              type="button"
              onClick={() => setViewMode("table")}
              className={`view-mode-button ${
                viewMode === "table" ? "view-mode-button-active" : ""
              }`}
              title="Chế Độ Bảng"
            >
              <FiLayout className="view-mode-icon" />
            </button>
            <button
              type="button"
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
          <button
            type="button"
            onClick={fetchCinemas}
            className="error-retry-button"
          >
            <FiRefreshCw className="error-retry-icon" /> Thử Lại
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Đang tải danh sách rạp phim...</p>
        </div>
      ) : (
        <>
          {/* Table View */}
          {viewMode === "table" && (
            <div className="table-view">
              {filteredCinemas.length > 0 ? (
                <div className="table-scroll-container">
                  <table className="cinema-table">
                    <thead className="table-header">
                      <tr>
                        <td className="table-header-cell">ID</td>
                        <td className="table-header-cell">Tên Rạp</td>
                        <td className="table-header-cell">Địa Chỉ</td>
                        <td className="table-header-cell">Thành Phố</td>
                        <td className="table-header-cell">Tỉnh</td>
                        <td className="table-header-cell">Số Điện Thoại</td>
                        <td className="table-header-cell">Email</td>
                        <td className="table-header-cell">Mô Tả</td>
                        <td className="table-header-cell">Trạng Thái</td>
                        <td className="table-header-cell text-right">
                          Hành Động
                        </td>
                      </tr>
                    </thead>
                    <tbody className="table-body">
                      {filteredCinemas.map((cinema) => (
                        <tr key={cinema.Cinema_ID} className="table-row">
                          <td className="table-cell">{cinema.Cinema_ID}</td>
                          <td className="table-cell">{cinema.Cinema_Name}</td>
                          <td className="table-cell">{cinema.Address}</td>
                          <td className="table-cell">{cinema.City}</td>
                          <td className="table-cell">{cinema.Province}</td>
                          <td className="table-cell">{cinema.Phone_Number}</td>
                          <td className="table-cell">{cinema.Email}</td>
                          <td className="table-cell">
                            {cinema.Description || "-"}
                          </td>
                          <td className="table-cell">
                            <span
                              className={`status-label ${
                                cinema.Status === "Active"
                                  ? "status-active"
                                  : "status-inactive"
                              }`}
                            >
                              {cinema.Status}
                            </span>
                          </td>
                          <td className="table-cell text-right">
                            <div className="action-buttons">
                              <button
                                type="button"
                                onClick={() => handleEditCinema(cinema)}
                                className="edit-button"
                                title="Chỉnh Sửa Rạp Phim"
                              >
                                <FiEdit2 className="action-icon" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setConfirmDeleteId(cinema.Cinema_ID)
                                }
                                className="delete-button"
                                title="Xóa Rạp Phim"
                              >
                                <FiTrash2 className="action-icon" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleManageRooms(cinema.Cinema_ID)
                                }
                                className="manage-button"
                                title="Quản Lý Phòng Chiếu"
                              >
                                <FiGrid className="action-icon" />
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
                  <h3 className="no-data-title">Không tìm thấy rạp phim</h3>
                  <p className="no-data-text">
                    {searchTerm || statusFilter !== "all"
                      ? "Thử điều chỉnh tiêu chí tìm kiếm hoặc bộ lọc của bạn"
                      : "Thêm một rạp phim mới để bắt đầu"}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Grid View */}
          {viewMode === "grid" && (
            <>
              {filteredCinemas.length > 0 ? (
                <div className="grid-view">
                  {filteredCinemas.map((cinema) => (
                    <div key={cinema.Cinema_ID} className="grid-card">
                      <div className="grid-card-content">
                        <div className="grid-card-header">
                          <h3
                            className="grid-card-title"
                            title={cinema.Cinema_Name}
                          >
                            {cinema.Cinema_Name}
                          </h3>
                          <span
                            className={`status-label ${
                              cinema.Status === "Active"
                                ? "status-active"
                                : "status-inactive"
                            }`}
                          >
                            {cinema.Status}
                          </span>
                        </div>

                        <div className="grid-card-details">
                          <div className="grid-card-detail">
                            <span className="detail-label">ID:</span>
                            <span className="detail-value">
                              {cinema.Cinema_ID}
                            </span>
                          </div>
                          <div className="grid-card-detail">
                            <span className="detail-label">Thành Phố:</span>
                            <span className="detail-value">{cinema.City}</span>
                          </div>
                          <div className="grid-card-detail">
                            <span className="detail-label">Tỉnh:</span>
                            <span className="detail-value">
                              {cinema.Province}
                            </span>
                          </div>
                          <div className="grid-card-detail">
                            <span className="detail-label">Địa Chỉ:</span>
                            <span className="detail-value truncate">
                              {cinema.Address}
                            </span>
                          </div>
                          {cinema.Description && (
                            <div className="grid-card-detail description">
                              <span className="detail-label">Mô Tả:</span>
                              <p
                                className="detail-value line-clamp"
                                title={cinema.Description}
                              >
                                {cinema.Description}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="grid-card-actions">
                          <button
                            type="button"
                            onClick={() => handleEditCinema(cinema)}
                            className="edit-button"
                            title="Chỉnh Sửa Rạp Phim"
                          >
                            <FiEdit2 className="action-icon" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(cinema.Cinema_ID)}
                            className="delete-button"
                            title="Xóa Rạp Phim"
                          >
                            <FiTrash2 className="action-icon" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleManageRooms(cinema.Cinema_ID)}
                            className="manage-button"
                            title="Quản Lý Phòng Chiếu"
                          >
                            <FiGrid className="action-icon" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-data-message grid-no-data">
                  <FiInfo className="no-data-icon" />
                  <h3 className="no-data-title">Không tìm thấy rạp phim</h3>
                  <p className="no-data-text">
                    {searchTerm || statusFilter !== "all"
                      ? "Thử điều chỉnh tiêu chí tìm kiếm hoặc bộ lọc của bạn"
                      : "Thêm một rạp phim mới để bắt đầu"}
                  </p>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Add/Edit Cinema Modal */}
      <Modal
        isOpen={isAddingCinema || isUpdatingCinema}
        onClose={handleCloseModal}
        size="md"
      >
        <div className="modal-body">
          <h2 className="modal-title">
            {isUpdatingCinema ? "Cập Nhật Rạp Phim" : "Thêm Rạp Phim Mới"}
          </h2>
          <form
            onSubmit={
              isUpdatingCinema ? handleUpdateCinema : handleCreateCinema
            }
            className="modal-form"
          >
            <div className="form-group">
              <label className="form-label">
                Tên Rạp <span className="required">*</span>
              </label>
              <input
                type="text"
                value={newCinema.Cinema_Name || ""}
                onChange={(e) =>
                  setNewCinema({ ...newCinema, Cinema_Name: e.target.value })
                }
                className="form-input"
                placeholder="Nhập tên rạp"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Địa Chỉ <span className="required">*</span>
              </label>
              <input
                type="text"
                value={newCinema.Address || ""}
                onChange={(e) =>
                  setNewCinema({ ...newCinema, Address: e.target.value })
                }
                className="form-input"
                placeholder="Nhập địa chỉ"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Thành Phố <span className="required">*</span>
                </label>
                <input
                  type="text"
                  value={newCinema.City || ""}
                  onChange={(e) =>
                    setNewCinema({ ...newCinema, City: e.target.value })
                  }
                  className="form-input"
                  placeholder="Nhập thành phố"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Tỉnh <span className="required">*</span>
                </label>
                <input
                  type="text"
                  value={newCinema.Province || ""}
                  onChange={(e) =>
                    setNewCinema({ ...newCinema, Province: e.target.value })
                  }
                  className="form-input"
                  placeholder="Nhập tỉnh"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Số Điện Thoại <span className="required">*</span>
                </label>
                <input
                  type="text"
                  value={newCinema.Phone_Number || ""}
                  onChange={(e) =>
                    setNewCinema({ ...newCinema, Phone_Number: e.target.value })
                  }
                  className="form-input"
                  placeholder="Nhập số điện thoại"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Email <span className="required">*</span>
                </label>
                <input
                  type="email"
                  value={newCinema.Email || ""}
                  onChange={(e) =>
                    setNewCinema({ ...newCinema, Email: e.target.value })
                  }
                  className="form-input"
                  placeholder="Nhập email"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Mô Tả</label>
              <textarea
                value={newCinema.Description || ""}
                onChange={(e) =>
                  setNewCinema({ ...newCinema, Description: e.target.value })
                }
                className="form-textarea"
                rows={4}
                placeholder="Mô tả rạp phim (Tùy Chọn)"
              ></textarea>
            </div>

            <div className="form-group">
              <label className="form-label">
                Trạng Thái <span className="required">*</span>
              </label>
              <select
                value={newCinema.Status || "Active"}
                onChange={(e) =>
                  setNewCinema({ ...newCinema, Status: e.target.value })
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
                {isUpdatingCinema ? "Cập Nhật Rạp" : "Thêm Rạp"}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Manage Rooms Modal */}
      <Modal isOpen={isManagingRooms} onClose={handleCloseModal} size="lg">
        <div className="modal-body">
          <h2 className="modal-title">
            Quản Lý Phòng Chiếu - Rạp {currentCinemaId}
          </h2>
          <div className="room-table-container">
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p className="loading-text">
                  Đang tải danh sách phòng chiếu...
                </p>
              </div>
            ) : rooms.length > 0 ? (
              <table className="room-table">
                <thead>
                  <tr>
                    <th>ID Phòng</th>
                    <th>Tên Phòng</th>
                    <th>Số Ghế</th>
                    <th>Loại Phòng</th>
                    <th>Trạng Thái</th>
                    <th>Ghi Chú</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((room) => (
                    <tr key={room["Cinema_Room_ID"]}>
                      <td>{room["Cinema_Room_ID"]}</td>
                      <td>{room.Room_Name}</td>
                      <td>{room.Seat_Quantity}</td>
                      <td>{room.Room_Type}</td>
                      <td>
                        <span
                          className={`status-label ${
                            room.Status === "Active"
                              ? "status-active"
                              : "status-inactive"
                          }`}
                        >
                          {room.Status}
                        </span>
                      </td>
                      <td>{room.Notes || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="no-data-message">
                <FiInfo className="no-data-icon" />
                <p>Không có phòng chiếu nào.</p>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleCloseModal}
            className="modal-cancel-button"
          >
            Đóng
          </button>
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
            Bạn có chắc chắn muốn xóa rạp phim này không? Hành động này không
            thể hoàn tác.
          </p>
          <div className="modal-actions justify-center">
            <button
              type="button"
              onClick={() => setConfirmDeleteId(null)}
              className="modal-cancel-button"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={() =>
                confirmDeleteId && handleDeleteCinema(confirmDeleteId)
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

export default ManageCinemaBranch;

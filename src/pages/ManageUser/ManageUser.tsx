import React, { useState, useEffect } from "react";
import "./ManageUser.css";
import AddUserModal from "./components/AddUserModal";
import { getAllUsers, registerUserByAdmin, deleteUserById, restoreUser, updateUserStatus } from "../../config/UserApi";
import {
  formatDateTime,
  formatDate,
  getAccountStatusText,
  getRoleText,
  LoadingSpinner,
  EmptyState,
  showToast,
  validateEmail,
  validatePhone,
  removeAccents,
} from "../../components/utils/utils";

interface User {
  User_ID: number;
  Full_Name: string;
  Email: string;
  Phone_Number: string;
  Address: string;
  Date_Of_Birth: string | null;
  Sex: string | null;
  Role: string;
  Account_Status: string;
  Last_Login: string | null;
  Is_Deleted?: boolean; // Add for soft delete tracking
  Deleted_At?: string | null; // Track when deleted
}

const ManageUser: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showDeleted, setShowDeleted] = useState(false); // Toggle to show deleted users
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const usersPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllUsers();
      setUsers(data);
      // Remove success toast on initial load
    } catch (error: any) {
      console.error("Lỗi khi tải danh sách người dùng:", error);
      setError(error.message || "Không thể tải danh sách người dùng. Vui lòng thử lại.");
      showToast(error.message || "Lỗi khi tải danh sách người dùng", "error");
    } finally {
      setLoading(false);
    }
  };

  // Enhanced search with accent removal and soft delete filter
  const filteredUsers = users.filter((user) => {
    // Filter out deleted users unless showDeleted is true
    if (!showDeleted && user.Is_Deleted) return false;
    if (showDeleted && !user.Is_Deleted) return false;

    const searchLower = removeAccents(searchTerm.toLowerCase());
    const matchesSearch =
      removeAccents(user.Full_Name?.toLowerCase() || "").includes(searchLower) ||
      removeAccents(user.Email?.toLowerCase() || "").includes(searchLower) ||
      (user.Phone_Number || "").includes(searchTerm);

    const matchesRole = roleFilter === "all" || (user.Role?.toLowerCase() || "") === roleFilter.toLowerCase();
    const matchesStatus =
      statusFilter === "all" || (user.Account_Status?.toLowerCase() || "") === statusFilter.toLowerCase();

    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const currentUsers = filteredUsers.slice(startIndex, startIndex + usersPerPage);

  const handleSelectUser = (userId: number) => {
    setSelectedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]));
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === currentUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(currentUsers.map((user) => user.User_ID));
    }
  };

  // Update status with API call
  const handleStatusChange = async (userId: number, newStatus: string) => {
    const user = users.find((u) => u.User_ID === userId);
    if (!user) return;

    try {
      setActionLoading(userId);

      // Call the API to update user status - send status directly
      await updateUserStatus(userId.toString(), newStatus);

      // Update local state after successful API call
      setUsers((prev) => prev.map((user) => (user.User_ID === userId ? { ...user, Account_Status: newStatus } : user)));

      showToast(`Đã cập nhật trạng thái thành ${getAccountStatusText(newStatus)}`, "success");
    } catch (error: any) {
      console.error("Error updating user status:", error);
      showToast(error.message || "Lỗi khi cập nhật trạng thái người dùng", "error");
    } finally {
      setActionLoading(null);
    }
  };

  // Update role with API call
  const handleRoleChange = async (userId: number, newRole: string) => {
    const user = users.find((u) => u.User_ID === userId);
    if (!user) return;

    try {
      setActionLoading(userId);

      // Call the API to update user role (you may need to create updateUserRole function)
      // For now, we'll update locally and show a message that this needs backend implementation

      // Update local state
      setUsers((prev) => prev.map((user) => (user.User_ID === userId ? { ...user, Role: newRole } : user)));

      showToast(`Đã cập nhật vai trò thành ${getRoleText(newRole)}`, "success");
    } catch (error: any) {
      console.error("Error updating user role:", error);
      showToast(error.message || "Lỗi khi cập nhật vai trò người dùng", "error");
    } finally {
      setActionLoading(null);
    }
  };

  // Soft delete single user
  const handleDeleteUser = async (userId: number) => {
    const user = users.find((u) => u.User_ID === userId);
    if (!user) return;

    const confirmMessage = `Bạn có chắc chắn muốn xóa người dùng "${user.Full_Name}"?\nNgười dùng sẽ bị ẩn khỏi hệ thống nhưng có thể khôi phục sau.`;

    if (!window.confirm(confirmMessage)) return;

    try {
      setActionLoading(userId);
      await deleteUserById(userId.toString());

      // Mark user as deleted in local state (soft delete)
      setUsers((prev) =>
        prev.map((user) =>
          user.User_ID === userId
            ? {
                ...user,
                Is_Deleted: true,
                Deleted_At: new Date().toISOString(),
                Account_Status: "Deleted", // Optional: change status to indicate deletion
              }
            : user
        )
      );
      setSelectedUsers((prev) => prev.filter((id) => id !== userId));

      showToast(`Đã xóa người dùng "${user.Full_Name}" thành công`, "success");
    } catch (error: any) {
      console.error("Error deleting user:", error);
      showToast(error.message || "Lỗi khi xóa người dùng", "error");
    } finally {
      setActionLoading(null);
    }
  };

  // Restore deleted user with API call
  const handleRestoreUser = async (userId: number) => {
    const user = users.find((u) => u.User_ID === userId);
    if (!user) return;

    const confirmMessage = `Bạn có chắc chắn muốn khôi phục người dùng "${user.Full_Name}"?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      setActionLoading(userId);

      // Call the actual restore API
      await restoreUser(userId.toString());

      // Update local state after successful API call
      setUsers((prev) =>
        prev.map((user) =>
          user.User_ID === userId
            ? {
                ...user,
                Is_Deleted: false,
                Deleted_At: null,
                Account_Status: "Active", // Restore to active status
              }
            : user
        )
      );

      showToast(`Đã khôi phục người dùng "${user.Full_Name}" thành công`, "success");
    } catch (error: any) {
      console.error("Error restoring user:", error);
      showToast(error.message || "Lỗi khi khôi phục người dùng", "error");
    } finally {
      setActionLoading(null);
    }
  };

  // Bulk soft delete users
  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) {
      showToast("Vui lòng chọn người dùng trước", "warning");
      return;
    }

    const confirmMessage = `Bạn có chắc chắn muốn xóa ${selectedUsers.length} người dùng?\nCác người dùng sẽ bị ẩn khỏi hệ thống nhưng có thể khôi phục sau.`;

    if (!window.confirm(confirmMessage)) return;

    try {
      setLoading(true);

      // Delete each user one by one (since no bulk delete API)
      const deletePromises = selectedUsers.map((userId) => deleteUserById(userId.toString()));

      await Promise.all(deletePromises);

      // Mark deleted users as deleted in local state
      setUsers((prev) =>
        prev.map((user) =>
          selectedUsers.includes(user.User_ID)
            ? {
                ...user,
                Is_Deleted: true,
                Deleted_At: new Date().toISOString(),
                Account_Status: "Deleted",
              }
            : user
        )
      );
      setSelectedUsers([]);

      showToast(`Đã xóa ${selectedUsers.length} người dùng thành công`, "success");
    } catch (error: any) {
      console.error("Error in bulk delete:", error);
      showToast(error.message || "Lỗi khi xóa người dùng", "error");
      // Refresh the list to see current state
      await fetchUsers();
    } finally {
      setLoading(false);
    }
  };

  // Bulk restore users with API calls
  const handleBulkRestore = async () => {
    if (selectedUsers.length === 0) {
      showToast("Vui lòng chọn người dùng trước", "warning");
      return;
    }

    const confirmMessage = `Bạn có chắc chắn muốn khôi phục ${selectedUsers.length} người dùng?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      setLoading(true);

      // Call restore API for each user
      const restorePromises = selectedUsers.map((userId) => restoreUser(userId.toString()));
      await Promise.all(restorePromises);

      // Update local state after successful API calls
      setUsers((prev) =>
        prev.map((user) =>
          selectedUsers.includes(user.User_ID)
            ? {
                ...user,
                Is_Deleted: false,
                Deleted_At: null,
                Account_Status: "Active",
              }
            : user
        )
      );
      setSelectedUsers([]);

      showToast(`Đã khôi phục ${selectedUsers.length} người dùng thành công`, "success");
    } catch (error: any) {
      console.error("Error in bulk restore:", error);
      showToast(error.message || "Lỗi khi khôi phục người dùng", "error");
      // Refresh the list to see current state
      await fetchUsers();
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) {
      showToast("Vui lòng chọn người dùng trước", "warning");
      return;
    }

    try {
      setLoading(true);

      switch (action) {
        case "activate":
          // Call API for each user - send status directly
          const activatePromises = selectedUsers.map((userId) => updateUserStatus(userId.toString(), "Active"));
          await Promise.all(activatePromises);

          setUsers((prev) =>
            prev.map((user) => (selectedUsers.includes(user.User_ID) ? { ...user, Account_Status: "Active" } : user))
          );
          showToast(`Đã kích hoạt ${selectedUsers.length} người dùng`, "success");
          break;

        case "deactivate":
          const deactivatePromises = selectedUsers.map((userId) => updateUserStatus(userId.toString(), "Inactive"));
          await Promise.all(deactivatePromises);

          setUsers((prev) =>
            prev.map((user) => (selectedUsers.includes(user.User_ID) ? { ...user, Account_Status: "Inactive" } : user))
          );
          showToast(`Đã vô hiệu hóa ${selectedUsers.length} người dùng`, "success");
          break;

        case "ban":
          const banPromises = selectedUsers.map((userId) => updateUserStatus(userId.toString(), "Banned"));
          await Promise.all(banPromises);

          setUsers((prev) =>
            prev.map((user) => (selectedUsers.includes(user.User_ID) ? { ...user, Account_Status: "Banned" } : user))
          );
          showToast(`Đã cấm ${selectedUsers.length} người dùng`, "success");
          break;

        case "delete":
          await handleBulkDelete();
          return;

        case "restore":
          await handleBulkRestore();
          return;
      }

      setSelectedUsers([]);
    } catch (error: any) {
      console.error(`Error in bulk ${action}:`, error);
      showToast(error.message || `Lỗi khi thực hiện hành động ${action}`, "error");
      // Refresh the list to see current state
      await fetchUsers();
    } finally {
      setLoading(false);
    }
  };

  // Enhanced add user function with API call
  const handleAddUser = async (userData: any) => {
    // Client-side validation
    if (!validateEmail(userData.email)) {
      showToast("Email không hợp lệ", "error");
      return;
    }

    if (!validatePhone(userData.phone)) {
      showToast("Số điện thoại không hợp lệ", "error");
      return;
    }

    // Check if email already exists locally (including deleted users)
    if (users.some((user) => user.Email.toLowerCase() === userData.email.toLowerCase())) {
      showToast("Email đã tồn tại trong hệ thống", "error");
      return;
    }

    // Check if phone already exists locally (including deleted users)
    if (users.some((user) => user.Phone_Number === userData.phone)) {
      showToast("Số điện thoại đã tồn tại trong hệ thống", "error");
      return;
    }

    try {
      // Call API to create user with correct field names
      const newUser = await registerUserByAdmin({
        Full_Name: userData.fullName,
        Email: userData.email,
        Phone_Number: userData.phone,
        Address: userData.address,
        Date_Of_Birth: userData.dateOfBirth,
        Sex: userData.sex,
        Role: userData.role,
      });

      // Add the new user to local state
      setUsers((prev) => [{ ...newUser, Is_Deleted: false }, ...prev]);
      setShowAddModal(false);
      showToast("Thêm người dùng mới thành công", "success");

      // Reset pagination to first page to show new user
      setCurrentPage(1);
    } catch (error: any) {
      console.error("Error adding user:", error);
      showToast(error.message || "Lỗi khi thêm người dùng mới", "error");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      active: "status-active",
      inactive: "status-inactive",
      banned: "status-banned",
      deleted: "status-deleted",
    };

    return (
      <span
        className={`status-badge ${
          statusClasses[status.toLowerCase() as keyof typeof statusClasses] || "status-unknown"
        }`}
      >
        {status === "Deleted" ? "Đã xóa" : getAccountStatusText(status)}
      </span>
    );
  };

  const formatLastLogin = (lastLogin: string | null) => {
    if (!lastLogin) {
      return "Chưa đăng nhập";
    }
    return formatDateTime(lastLogin);
  };

  const formatDateOfBirth = (dateOfBirth: string | null) => {
    if (!dateOfBirth) {
      return "Chưa có thông tin";
    }
    return formatDate(dateOfBirth);
  };

  const getGenderText = (sex: string | null) => {
    if (!sex) return "Chưa xác định";

    switch (sex.toLowerCase()) {
      case "male":
        return "Nam";
      case "female":
        return "Nữ";
      default:
        return sex;
    }
  };

  // Count statistics excluding deleted users
  const activeUsers = users.filter((u) => !u.Is_Deleted);
  const deletedUsers = users.filter((u) => u.Is_Deleted);

  // Loading state with LoadingSpinner component
  if (loading) {
    return (
      <div className="manage-user-loading">
        <LoadingSpinner size="large" />
        <p>Đang tải danh sách người dùng...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="manage-user">
        <EmptyState
          title="Lỗi tải dữ liệu"
          description={error}
          icon="⚠️"
          action={
            <button className="btn-primary" onClick={fetchUsers}>
              Thử lại
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="manage-user">
      <div className="manage-user-header">
        <div className="header-content">
          <h1>Quản lý người dùng</h1>
          <p>Quản lý tài khoản người dùng, vai trò và quyền hạn</p>
        </div>
        <div className="header-actions">
          <button
            className={`btn-toggle ${showDeleted ? "active" : ""}`}
            onClick={() => {
              setShowDeleted(!showDeleted);
              setSelectedUsers([]);
              setCurrentPage(1);
            }}
          >
            {showDeleted ? "📋 Hiển thị hoạt động" : "🗑️ Hiển thị đã xóa"}
          </button>
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            <span>➕</span>
            Thêm người dùng mới
          </button>
        </div>
      </div>

      <div className="manage-user-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filters">
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="filter-select">
            <option value="all">Tất cả vai trò</option>
            <option value="admin">Quản trị viên</option>
            <option value="staff">Nhân viên</option>
            <option value="customer">Khách hàng</option>
            <option value="manager">Quản lý</option>
          </select>

          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select">
            <option value="all">Tất cả trạng thái</option>
            {!showDeleted && (
              <>
                <option value="active">Hoạt động</option>
                <option value="inactive">Ngưng hoạt động</option>
                <option value="banned">Bị cấm</option>
              </>
            )}
            {showDeleted && <option value="deleted">Đã xóa</option>}
          </select>
        </div>

        {selectedUsers.length > 0 && (
          <div className="bulk-actions">
            <span className="selected-count">Đã chọn {selectedUsers.length}</span>
            {!showDeleted ? (
              <>
                <button onClick={() => handleBulkAction("activate")} className="bulk-btn activate">
                  Kích hoạt
                </button>
                <button onClick={() => handleBulkAction("deactivate")} className="bulk-btn deactivate">
                  Vô hiệu hóa
                </button>
                <button onClick={() => handleBulkAction("ban")} className="bulk-btn ban">
                  Cấm
                </button>
                <button onClick={() => handleBulkAction("delete")} className="bulk-btn delete" disabled={loading}>
                  {loading ? "Đang xóa..." : "Xóa"}
                </button>
              </>
            ) : (
              <button onClick={() => handleBulkAction("restore")} className="bulk-btn restore" disabled={loading}>
                {loading ? "Đang khôi phục..." : "Khôi phục"}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Show empty state when no users found */}
      {filteredUsers.length === 0 && !loading && (
        <EmptyState
          title={showDeleted ? "Không có người dùng đã xóa" : "Không tìm thấy người dùng"}
          description={
            searchTerm
              ? "Thử tìm kiếm với từ khóa khác"
              : showDeleted
              ? "Chưa có người dùng nào bị xóa"
              : "Chưa có người dùng nào trong hệ thống"
          }
          icon={showDeleted ? "🗑️" : "👥"}
          action={
            searchTerm ? (
              <button className="btn-primary" onClick={() => setSearchTerm("")}>
                Xóa bộ lọc
              </button>
            ) : null
          }
        />
      )}

      {filteredUsers.length > 0 && (
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === currentUsers.length && currentUsers.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th>ID</th>
                <th>Người dùng</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Giới tính</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>{showDeleted ? "Ngày xóa" : "Ngày đăng nhập gần nhất"}</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user) => (
                <tr
                  key={user.User_ID}
                  className={`${selectedUsers.includes(user.User_ID) ? "selected" : ""} ${
                    user.Is_Deleted ? "deleted-row" : ""
                  }`}
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.User_ID)}
                      onChange={() => handleSelectUser(user.User_ID)}
                    />
                  </td>
                  <td>#{user.User_ID}</td>
                  <td>
                    <div className="user-info">
                      <div className={`user-avatar ${user.Is_Deleted ? "deleted" : ""}`}>
                        {(user.Full_Name || "?").charAt(0)}
                      </div>
                      <div className="user-details">
                        <span className={`user-name ${user.Is_Deleted ? "deleted" : ""}`}>
                          {user.Full_Name || "Tên không xác định"}
                        </span>
                        <span className="user-birth">
                          Sinh: {user.Date_Of_Birth ? formatDateOfBirth(user.Date_Of_Birth) : "Chưa có thông tin"}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>{user.Email || "Chưa có email"}</td>
                  <td>{user.Phone_Number || "Chưa có SĐT"}</td>
                  <td>
                    <span className={`gender-badge ${(user.Sex || "unknown").toLowerCase()}`}>
                      {getGenderText(user.Sex)}
                    </span>
                  </td>
                  <td>
                    {!user.Is_Deleted ? (
                      <select
                        value={user.Role}
                        onChange={(e) => handleRoleChange(user.User_ID, e.target.value)}
                        className="role-select"
                        disabled={actionLoading === user.User_ID}
                      >
                        <option value="Customer">Khách hàng</option>
                        <option value="Staff">Nhân viên</option>
                        <option value="Admin">Quản trị viên</option>
                        <option value="Manager">Quản lý</option>
                      </select>
                    ) : (
                      <span className="role-text deleted">{getRoleText(user.Role)}</span>
                    )}
                  </td>
                  <td>{getStatusBadge(user.Is_Deleted ? "Deleted" : user.Account_Status)}</td>
                  <td>
                    {showDeleted && user.Deleted_At
                      ? formatDateTime(user.Deleted_At)
                      : formatLastLogin(user.Last_Login)}
                  </td>
                  <td>
                    <div className="action-buttons">
                      {!user.Is_Deleted ? (
                        <>
                          <select
                            value={user.Account_Status}
                            onChange={(e) => handleStatusChange(user.User_ID, e.target.value)}
                            className="status-select"
                            disabled={actionLoading === user.User_ID}
                          >
                            <option value="Active">Hoạt động</option>
                            <option value="Inactive">Ngưng hoạt động</option>
                            <option value="Banned">Bị cấm</option>
                          </select>
                          <button
                            onClick={() => handleDeleteUser(user.User_ID)}
                            className="btn-delete"
                            disabled={actionLoading === user.User_ID}
                            title="Xóa người dùng"
                          >
                            {actionLoading === user.User_ID ? <LoadingSpinner size="small" /> : "🗑️"}
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleRestoreUser(user.User_ID)}
                          className="btn-restore"
                          disabled={actionLoading === user.User_ID}
                          title="Khôi phục người dùng"
                        >
                          {actionLoading === user.User_ID ? <LoadingSpinner size="small" /> : "↩️"}
                        </button>
                      )}
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

      <div className="users-summary">
        <div className="summary-item">
          <span className="summary-label">Tổng số người dùng:</span>
          <span className="summary-value">{activeUsers.length}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Hoạt động:</span>
          <span className="summary-value">
            {activeUsers.filter((u) => u.Account_Status.toLowerCase() === "active").length}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Ngưng hoạt động:</span>
          <span className="summary-value">
            {activeUsers.filter((u) => u.Account_Status.toLowerCase() === "inactive").length}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Bị cấm:</span>
          <span className="summary-value">
            {activeUsers.filter((u) => u.Account_Status.toLowerCase() === "banned").length}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Đã xóa:</span>
          <span className="summary-value">{deletedUsers.length}</span>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <AddUserModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onAddUser={handleAddUser} />
      )}
    </div>
  );
};

export default ManageUser;

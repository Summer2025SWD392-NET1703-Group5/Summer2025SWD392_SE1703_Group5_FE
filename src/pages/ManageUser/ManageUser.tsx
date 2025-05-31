import React, { useState, useEffect } from "react";
import "./ManageUser.css";
import AddUserModal from "./components/AddUserModal";
import { getAllUsers } from "../../config/UserApi";

interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  sex: string;
  role: string;
  status: string;
  lastLogin: string;
}

const ManageUser: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const usersPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Mock data - replace with actual API call
      setTimeout(() => {
        getAllUsers()
          .then((data) => {
            setUsers(data);
          })
          .catch((error) => {
            console.error("Lỗi khi tải danh sách người dùng:", error);
          });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Lỗi khi tải danh sách người dùng:", error);
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const currentUsers = filteredUsers.slice(startIndex, startIndex + usersPerPage);

  const handleSelectUser = (userId: string) => {
    setSelectedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]));
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === currentUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(currentUsers.map((user) => user.id));
    }
  };

  const handleStatusChange = (userId: string, newStatus: "active" | "inactive" | "banned") => {
    setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, status: newStatus } : user)));
  };

  const handleRoleChange = (userId: string, newRole: "admin" | "user" | "staff") => {
    setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, role: newRole } : user)));
  };

  const handleBulkAction = (action: string) => {
    if (selectedUsers.length === 0) {
      alert("Vui lòng chọn người dùng trước");
      return;
    }

    switch (action) {
      case "activate":
        setUsers((prev) =>
          prev.map((user) => (selectedUsers.includes(user.id) ? { ...user, status: "active" } : user))
        );
        break;
      case "deactivate":
        setUsers((prev) =>
          prev.map((user) => (selectedUsers.includes(user.id) ? { ...user, status: "inactive" } : user))
        );
        break;
      case "ban":
        setUsers((prev) =>
          prev.map((user) => (selectedUsers.includes(user.id) ? { ...user, status: "banned" } : user))
        );
        break;
      case "delete":
        if (window.confirm(`Bạn có chắc chắn muốn xóa ${selectedUsers.length} người dùng?`)) {
          setUsers((prev) => prev.filter((user) => !selectedUsers.includes(user.id)));
        }
        break;
    }
    setSelectedUsers([]);
  };

  // Add user function
  const handleAddUser = (userData: any) => {
    const newUser: User = {
      ...userData,
      id: Date.now().toString(), // Generate a temporary ID
      registeredDate: new Date().toISOString().split("T")[0],
      lastLogin: "Chưa đăng nhập",
    };

    setUsers((prev) => [newUser, ...prev]);
    setShowAddModal(false);
  };

  // const getRoleText = (role: string) => {
  //   switch (role) {
  //     case "admin":
  //       return "Quản trị viên";
  //     case "staff":
  //       return "Nhân viên";
  //     case "user":
  //       return "Người dùng";
  //     case "manager":
  //       return "Quản lý";
  //     default:
  //       return role;
  //   }
  // };

  // const getStatusText = (status: string) => {
  //   switch (status) {
  //     case "active":
  //       return "Hoạt động";
  //     case "inactive":
  //       return "Ngưng hoạt động";
  //     case "banned":
  //       return "Bị cấm";
  //     default:
  //       return status;
  //   }
  // };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  if (loading) {
    return (
      <div className="manage-user-loading">
        <div className="spinner"></div>
        <p>Đang tải danh sách người dùng...</p>
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
            placeholder="Tìm kiếm theo tên, email hoặc tên đăng nhập..."
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
            <option value="user">Người dùng</option>
            <option value="manager">Quản lý</option>
          </select>

          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select">
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Ngưng hoạt động</option>
            <option value="banned">Bị cấm</option>
          </select>
        </div>

        {selectedUsers.length > 0 && (
          <div className="bulk-actions">
            <span className="selected-count">Đã chọn {selectedUsers.length}</span>
            <button onClick={() => handleBulkAction("activate")} className="bulk-btn activate">
              Kích hoạt
            </button>
            <button onClick={() => handleBulkAction("deactivate")} className="bulk-btn deactivate">
              Vô hiệu hóa
            </button>
            <button onClick={() => handleBulkAction("ban")} className="bulk-btn ban">
              Cấm
            </button>
            <button onClick={() => handleBulkAction("delete")} className="bulk-btn delete">
              Xóa
            </button>
          </div>
        )}
      </div>

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
              <th>Người dùng</th>
              <th>Email</th>
              <th>Số điện thoại</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th>Ngày đăng nhập gần nhất</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((user) => (
              <tr key={user.id} className={selectedUsers.includes(user.id) ? "selected" : ""}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleSelectUser(user.id)}
                  />
                </td>
                <td>
                  <div className="user-info">
                    <div className="user-avatar">{user.fullName.charAt(0)}</div>
                    <div className="user-details">
                      <span className="user-name">{user.fullName}</span>
                    </div>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>{user.phone}</td>
                <td>
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value as "admin" | "user" | "staff")}
                    className="role-select"
                  >
                    <option value="user">Người dùng</option>
                    <option value="staff">Nhân viên</option>
                    <option value="admin">Quản trị viên</option>
                    <option value="manager">Quản lý</option>
                  </select>
                </td>
                <td>
                  <select
                    value={user.status}
                    onChange={(e) => handleStatusChange(user.id, e.target.value as "active" | "inactive" | "banned")}
                    className="status-select"
                  >
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Ngưng hoạt động</option>
                    <option value="banned">Bị cấm</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
          <span className="summary-value">{users.length}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Hoạt động:</span>
          <span className="summary-value">{users.filter((u) => u.status === "active").length}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Ngưng hoạt động:</span>
          <span className="summary-value">{users.filter((u) => u.status === "inactive").length}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Bị cấm:</span>
          <span className="summary-value">{users.filter((u) => u.status === "banned").length}</span>
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

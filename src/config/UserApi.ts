import api from "./axios";

const getAllUsers = async () => {
  try {
    const response = await api.get("user");
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

const getUserById = async (id: string) => {
  try {
    const response = await api.get(`user/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user with ID ${id}:`, error);
    throw error;
  }
};

const registerUserByAdmin = async (userData: any) => {
  try {
    const response = await api.post("user/register-user", userData);
    return response.data;
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
};

const getUserProfile = async () => {
  try {
    const response = await api.get("user/profile");
    return response.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

const deleteUserById = async (id: string) => {
  try {
    const response = await api.delete(`user/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting user with ID ${id}:`, error);
    throw error;
  }
};

const restoreUser = async (id: string) => {
  try {
    const response = await api.put(`user/${id}/restore`);
    return response.data;
  } catch (error) {
    console.error(`Error restoring user with ID ${id}:`, error);
    throw error;
  }
};

const updateUserStatus = async (id: string, status: any) => {
  try {
    const response = await api.put(`user/${id}/status`, status);
    return response.data;
  } catch (error) {
    console.error(`Error updating user status with ID ${id}:`, error);
    throw error;
  }
};

const resetUserPassword = async (id: string, passwordData: any) => {
  try {
    const response = await api.post(`user/${id}/reset-password`, passwordData);
    return response.data;
  } catch (error) {
    console.error(`Error resetting password for user with ID ${id}:`, error);
    throw error;
  }
};

const updateUserProfile = async (profileData: any) => {
  try {
    const response = await api.put("user/profile", profileData);
    return response.data;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

const registerStaffUser = async (userData: any) => {
  try {
    const response = await api.post("user/staff-register", userData);
    return response.data;
  } catch (error) {
    console.error("Error registering staff user:", error);
    throw error;
  }
};

const getAllManagers = async () => {
  try {
    const response = await api.get("user/managers");
    return response.data;
  } catch (error) {
    console.error("Error fetching managers:", error);
    throw error;
  }
};

const assignManager = async (assignmentData: any) => {
  try {
    const response = await api.post("user/managers/assign", assignmentData);
    return response.data;
  } catch (error) {
    console.error("Error assigning manager:", error);
    throw error;
  }
};

const removeManagerAssignment = async (managerId: string) => {
  try {
    const response = await api.delete(`user/managers/${managerId}/remove-assignment`);
    return response.data;
  } catch (error) {
    console.error(`Error removing manager assignment with ID ${managerId}:`, error);
    throw error;
  }
};

export {
  getAllUsers,
  getUserById,
  registerUserByAdmin,
  getUserProfile,
  deleteUserById,
  restoreUser,
  updateUserStatus,
  resetUserPassword,
  updateUserProfile,
  registerStaffUser,
  getAllManagers,
  assignManager,
  removeManagerAssignment,
};

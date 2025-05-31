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
    }

export { getAllUsers, getUserById, registerUserByAdmin, getUserProfile };

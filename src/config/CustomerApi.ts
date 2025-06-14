import api from "./axios";

// Search customers by name, email, or phone
const searchCustomers = async (searchTerm: string) => {
  try {
    const response = await api.get(`customers/search?q=${encodeURIComponent(searchTerm)}`);
    return response.data;
  } catch (error) {
    console.error("Error searching customers:", error);
    throw error;
  }
};

// Get all customers
const getAllCustomers = async () => {
  try {
    const response = await api.get("customers");
    return response.data;
  } catch (error) {
    console.error("Error fetching customers:", error);
    throw error;
  }
};

// Get customer by ID
const getCustomerById = async (customerId: string) => {
  try {
    const response = await api.get(`customers/${customerId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching customer:", error);
    throw error;
  }
};

// Create new customer
const createCustomer = async (customerData: any) => {
  try {
    const response = await api.post("customers", customerData);
    return response.data;
  } catch (error) {
    console.error("Error creating customer:", error);
    throw error;
  }
};

// Update customer information
const updateCustomer = async (customerId: string, customerData: any) => {
  try {
    const response = await api.put(`customers/${customerId}`, customerData);
    return response.data;
  } catch (error) {
    console.error("Error updating customer:", error);
    throw error;
  }
};

// Delete customer
const deleteCustomer = async (customerId: string) => {
  try {
    const response = await api.delete(`customers/${customerId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting customer:", error);
    throw error;
  }
};

// Get customer booking history
const getCustomerBookings = async (customerId: string) => {
  try {
    const response = await api.get(`customers/${customerId}/bookings`);
    return response.data;
  } catch (error) {
    console.error("Error fetching customer bookings:", error);
    throw error;
  }
};

// Get customer points
const getCustomerPoints = async (customerId: string) => {
  try {
    const response = await api.get(`customers/${customerId}/points`);
    return response.data;
  } catch (error) {
    console.error("Error fetching customer points:", error);
    throw error;
  }
};

// Validate customer membership
const validateMembership = async (customerId: string) => {
  try {
    const response = await api.get(`customers/${customerId}/membership`);
    return response.data;
  } catch (error) {
    console.error("Error validating customer membership:", error);
    throw error;
  }
};

export {
  searchCustomers,
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerBookings,
  getCustomerPoints,
  validateMembership,
};

import api from "./axios";

// Get Member by phone number
const getMemberByPhone = async (phoneNumber: string) => {
  try {
    const response = await api.get(`member/lookup/phone/${phoneNumber}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching seat layout:", error);
    throw error;
  }
};

// Get Member by email
const getMemberByEmail = async (email: string) => {
  try {
    const response = await api.get(`member/lookup/email/${email}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching member by email:", error);
    throw error;
  }
};

// Link member to booking by booking ID and member identifier(phone or email)
const linkMemberBooking = async (bookingId: string, memberIdentifier: string) => {
    try {
        const response = await api.post(`member/link-member`, { bookingId, memberIdentifier });
        return response.data;
    } catch (error) {
        console.error("Error linking member to booking:", error);
        throw error;
    }
    }

export { getMemberByPhone, getMemberByEmail, linkMemberBooking };

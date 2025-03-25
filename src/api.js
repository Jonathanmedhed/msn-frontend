// src/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

// Request interceptor to add auth token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMessage =
      error.response?.data?.error ||
      error.message ||
      "An unexpected error occurred";
    return Promise.reject(new Error(errorMessage));
  }
);

// Helper function to handle file upload errors
const handleFileUploadError = (error) => {
  if (error.message.includes("Network Error")) {
    throw new Error("Failed to upload - check your internet connection");
  }
  throw error;
};

/* -------------------------
   Authentication API
------------------------- */
export const loginUser = async (email, password) => {
  try {
    const response = await api.post("/users/login", { email, password });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await api.post("/users/register", userData);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const logoutUser = async () => {
  try {
    const response = await api.post("/users/logout");
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const changePassword = async ({ currentPassword, newPassword }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("User not authorized");
  }

  const response = await api.post(
    "/auth/change-password",
    { currentPassword, newPassword },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  // Since our backend always returns a 200 with a success flag, check that flag:
  if (!response.data.success) {
    throw new Error(response.data.message);
  }
  return response.data;
};

/* -------------------------
   User Profile API
------------------------- */
export const fetchLoggedInUser = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("No authentication token found. Logging out...");
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      window.location.reload();
      return null; // Return null to indicate no user data
    }

    const response = await api.get("/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 403) {
      console.warn("Token invalid or expired. Logging out...");
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      window.location.reload();
    }
    return Promise.reject(error);
  }
};

// Fetch the main user
export const fetchMainUser = async () => {
  try {
    const response = await api.get("/users/main-user");
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

// Fetch a user's profile by their ID
export const fetchUserProfile = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

// Update user profile fields (non-file updates)
export const updateUserProfile = async (userId, data) => {
  try {
    const response = await api.put(`/users/${userId}/update`, data);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const updateUserStatus = async (userId, newStatus) => {
  try {
    const response = await api.put(`/users/${userId}/status`, {
      status: newStatus,
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

// Upload a single profile picture
export const uploadProfilePicture = async (userId, file) => {
  try {
    const formData = new FormData();
    formData.append("profilePicture", file);

    const response = await api.post(
      `/users/${userId}/upload-profile-picture`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data;
  } catch (error) {
    return handleFileUploadError(error);
  }
};

export const uploadPictures = async (userId, files) => {
  try {
    const formData = new FormData();
    files.forEach((file) => formData.append("pictures", file));

    const response = await api.post(
      `/users/${userId}/upload-pictures`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    console.log("UploadPictures API response:", response.data);
    return response.data;
  } catch (error) {
    return handleFileUploadError(error);
  }
};

export const uploadFiles = async (userId, files) => {
  try {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    const response = await api.post(`/users/${userId}/upload-files`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    console.log("UploadFiles API response:", response.data);
    return response.data;
  } catch (error) {
    return handleFileUploadError(error);
  }
};

export const blockContact = async (userId, contactId) => {
  try {
    const response = await api.put(`/users/${userId}/block-contact`, {
      contactId,
    });
    return response.data;
  } catch (error) {
    throw Promise.reject(error);
  }
};

export const removeContact = async (userId, contactId) => {
  try {
    const response = await api.put(`/users/${userId}/remove-contact`, {
      contactId,
    });
    return response.data;
  } catch (error) {
    throw Promise.reject(error);
  }
};

// Delete a user (if needed)
export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/users/${userId}/delete`);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const addContact = async (userId, email) => {
  try {
    const response = await api.put(`/users/${userId}/add-contact`, { email });
    return response.data;
  } catch (error) {
    throw Promise.reject(error);
  }
};

/* -------------------------
   Friend Requests
------------------------- */
export const sendFriendRequest = async (senderId, recipientEmail) => {
  try {
    const response = await api.post("/users/friend-request", {
      senderId,
      recipientEmail,
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const acceptFriendRequest = async (senderId) => {
  try {
    const response = await api.post("/users/friend-request/accept", {
      senderId,
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const rejectFriendRequest = async (senderId) => {
  try {
    const response = await api.post("/users/friend-request/reject", {
      senderId,
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const cancelFriendRequest = async (recipientId) => {
  try {
    const response = await api.post("/users/friend-request/cancel", {
      recipientId,
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

/* -------------------------
   Chat API
------------------------- */
export const createChat = async (participantIds) => {
  try {
    const response = await api.post("/chats/create", { participantIds });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const sendMessage = async (
  chatId,
  senderId,
  content,
  attachments = []
) => {
  try {
    const response = await api.post(`/chats/${chatId}/send`, {
      senderId,
      content,
      attachments,
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const fetchChatMessages = async (chatId) => {
  try {
    const response = await api.get(`/chats/${chatId}/messages`);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const fetchUserChats = async (userId) => {
  try {
    const response = await api.get(`/chats/user/${String(userId)}`);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const updateMessageStatus = async (messageId, status) => {
  try {
    const response = await api.patch(`/chats/${messageId}/status`, { status });
    return response.data;
  } catch (error) {
    return handleFileUploadError(error);
  }
};

export default api;

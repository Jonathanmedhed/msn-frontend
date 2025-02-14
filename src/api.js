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

/* -------------------------
   User Profile API
------------------------- */

// Fetch the main user
export const fetchMainUser = async () => {
  try {
    const response = await api.get("/users/main-user");
    console.log(response.data);
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

// Upload multiple pictures (e.g., additional pictures)
export const uploadPictures = async (userId, files) => {
  try {
    const formData = new FormData();
    files.forEach((file) => formData.append("pictures", file));

    const response = await api.post(
      `/users/${userId}/upload-pictures`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data;
  } catch (error) {
    return handleFileUploadError(error);
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

export const sendMessage = async (chatId, senderId, content) => {
  try {
    const response = await api.post(`/chats/${chatId}/send`, {
      senderId,
      content,
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

export default api;

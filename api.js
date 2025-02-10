import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

export const fetchContacts = async () => {
  try {
    const response = await api.get("/contacts");
    return response.data;
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return [];
  }
};

export const sendMessage = async (chatId, message) => {
  try {
    const response = await api.post(`/chats/${chatId}/messages`, {
      content: message,
    });
    return response.data;
  } catch (error) {
    console.error("Error sending message:", error);
  }
};

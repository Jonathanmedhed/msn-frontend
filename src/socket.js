import { io } from "socket.io-client";

export const socket = io("https://msn-backend.onrender.com", {
  withCredentials: true, // ✅ Important for CORS
  transports: ["websocket", "polling"], // ✅ Ensures compatibility
});

socket.on("connect", () => {
  console.log("Connected to server with ID:", socket.id);
});

socket.on("receiveMessage", (message) => {
  console.log("New message received:", message);
});

socket.on("disconnect", () => {
  console.log("Disconnected from server");
});

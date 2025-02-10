import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  withCredentials: true, // ✅ Important for CORS
  transports: ["websocket", "polling"], // ✅ Ensures compatibility
});

socket.on("connect", () => {
  console.log("Connected to server with ID:", socket.id);
});

socket.on("receiveMessage", (message) => {
  console.log("New message received:", message);
});

export default socket;

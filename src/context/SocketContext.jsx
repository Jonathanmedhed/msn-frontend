// src/context/SocketContext.js
import { createContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import PropTypes from "prop-types";

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io("https://msn-backend.onrender.com", {
      withCredentials: true,
      transports: ["websocket", "polling"],
      secure: true,
    });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Global socket connected:", newSocket.id);
    });

    // Global listener for any new message events.
    newSocket.on("newMessage", (data) => {
      console.log("Global socket received newMessage:", data);
    });

    return () => newSocket.disconnect();
  }, []);

  // Function to join a chat room.
  const joinChatRoom = (chatId) => {
    if (socket && chatId) {
      console.log("Global socket: Emitting joinChat for chatId:", chatId);
      socket.emit("joinChat", { chatId });
    }
  };

  return (
    <SocketContext.Provider value={{ socket, joinChatRoom }}>
      {children}
    </SocketContext.Provider>
  );
};

SocketProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

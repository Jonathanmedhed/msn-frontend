// src/context/SocketContext.js
import { createContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import PropTypes from "prop-types";

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io("http://localhost:5000", {
      withCredentials: true,
      transports: ["websocket"],
    });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Global socket connected:", newSocket.id);
    });

    // Log when a chat room is joined
    newSocket.on("joinChat", (data) => {
      console.log("joinChat event received in global socket:", data);
    });

    return () => newSocket.disconnect();
  }, []);

  // Function to join a chat room
  const joinChatRoom = (chatId) => {
    if (socket && chatId) {
      console.log("Emitting joinChat for chatId:", chatId);
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

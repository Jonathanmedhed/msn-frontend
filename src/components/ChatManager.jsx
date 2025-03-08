import { useEffect } from "react";
import { socket } from "../socket";
import { useChatStore } from "../stores/chatStore";

// components/ChatManager.jsx
export const ChatManager = ({ userId }) => {
  const { addMessage, updateChatInList, chats, setChatList } = useChatStore();

  useEffect(() => {
    if (!userId) return;

    // Join all existing chats on mount
    socket.emit("joinAllChats", userId);

    // Handle new chat creation
    const handleChatCreated = (newChat) => {
      setChatList([...chats, newChat]);
      socket.emit("joinChat", { chatId: newChat._id });
    };

    // Message handling
    const handleNewMessage = (message) => {
      if (!chats.some((c) => c._id === message.chat)) return;
      addMessage(message.chat, message);
    };

    socket.on("chatCreated", handleChatCreated);
    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("chatCreated", handleChatCreated);
      socket.off("newMessage", handleNewMessage);
    };
  }, [userId, chats, setChatList, addMessage]);
};

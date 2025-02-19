import { useState, useEffect, useRef } from "react";
import { Box, TextField, IconButton, Menu, MenuItem } from "@mui/material";
import PropTypes from "prop-types";
import { UserCard } from "./UserCard";
import { Message } from "./Message";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import ImageIcon from "@mui/icons-material/Image";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import SendIcon from "@mui/icons-material/Send";
import EmojiPicker from "emoji-picker-react";
import { io } from "socket.io-client";
import { sendMessage, fetchChatMessages, createChat } from "../api";
import { isValidObjectId } from "../utils/validation";
import { memo } from "react";

export const ChatWindow = memo(
  ({
    onUpdateContact,
    selectedContact,
    isMobile,
    onBlockContact,
    chats,
    blockedContacts,
    onRemoveContact,
  }) => {
    const [message, setMessage] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isSending, setIsSending] = useState(false);

    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);
    const currentUserId = localStorage.getItem("userId");

    if (!currentUserId) {
      throw new Error("User not authenticated");
    }
    // Scroll to bottom when messages change
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    // Fetch initial messages and setup socket
    useEffect(() => {
      let isMounted = true;

      const initializeChat = async () => {
        if (!selectedContact?.chatId) return;

        try {
          const messagesData = await fetchChatMessages(selectedContact.chatId);
          if (isMounted) {
            setMessages(messagesData);
          }
          socketRef.current = io("http://localhost:5000", {
            withCredentials: true,
            transports: ["websocket"],
          });

          const socket = socketRef.current;
          socket.emit("joinChat", { chatId: selectedContact.chatId });

          socket.on("newMessage", (newMessage) => {
            if (isMounted) {
              setMessages((prev) => [...prev, newMessage]);
            }
          });

          socket.on("messageStatus", (updatedMessage) => {
            if (isMounted) {
              setMessages((prev) =>
                prev.map((msg) =>
                  msg._id === updatedMessage._id ? updatedMessage : msg
                )
              );
            }
          });
        } catch (error) {
          if (isMounted) {
            console.error("Chat initialization error:", error);
            setMessages([]);
          }
        }
      };

      initializeChat();

      return () => {
        isMounted = false;
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }, [selectedContact?.chatId]);

    // Handle file attachments
    const handleFileAttach = (event) => {
      const file = event.target.files[0];
      if (file) {
        console.log("File attached:", file.name);
        // TODO: Implement file upload logic
      }
    };

    // Handle image attachments
    const handleImageAttach = (event) => {
      const image = event.target.files[0];
      if (image) {
        console.log("Image attached:", image.name);
        // TODO: Implement image upload logic
      }
    };

    // Handle emoji selection
    const handleEmojiClick = (emoji) => {
      setMessage((prev) => prev + emoji.emoji);
      setShowEmojiPicker(false);
    };

    // Handle message sending
    const handleSendMessage = async () => {
      const trimmedMessage = message.trim();
      if (!trimmedMessage || isSending) return;

      setIsSending(true);
      let chatId = selectedContact.chatId;
      const tempMessageId = Date.now().toString();

      try {
        // Validate current user ID
        const currentUserId = localStorage.getItem("userId");
        if (!currentUserId) {
          throw new Error("User not authenticated");
        }

        // Validate contact ID
        if (!selectedContact?._id) {
          throw new Error("Invalid contact selected");
        }

        // Optimistic update
        setMessages((prev) => [
          ...prev,
          {
            _id: tempMessageId,
            content: trimmedMessage,
            sender: currentUserId,
            status: "pending",
            createdAt: new Date(),
          },
        ]);

        // Create chat if needed
        if (!chatId) {
          const participantIds = [currentUserId, selectedContact._id];
          if (
            participantIds.length !== 2 ||
            !participantIds.every((id) => isValidObjectId(id))
          ) {
            throw new Error("Invalid participant IDs for chat creation");
          }
          const newChat = await createChat(participantIds);
          chatId = newChat._id;
          // Instead of mutating, update the parent state:
          onUpdateContact({ ...selectedContact, chatId });
        }

        // Send via API
        const sentMessage = await sendMessage(
          chatId,
          currentUserId,
          trimmedMessage
        );

        // Replace temporary message
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === tempMessageId
              ? { ...sentMessage.message, status: "sent" }
              : msg
          )
        );

        setMessage("");
      } catch (error) {
        console.error("Message send error:", error);
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === tempMessageId
              ? {
                  ...msg,
                  status: "failed",
                  error: error.message,
                }
              : msg
          )
        );
      } finally {
        setIsSending(false);
      }
    };

    // Handle Enter key for sending
    const handleKeyPress = (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        handleSendMessage();
      }
    };

    useEffect(() => {
      if (!selectedContact.chatId && chats && chats.length > 0) {
        // Find the chat corresponding to the selected contact
        const chatForContact = chats.find((chat) =>
          chat.participants.some(
            (p) => p._id.toString() === selectedContact._id.toString()
          )
        );
        if (chatForContact) {
          // Update the selected contact with the chat ID
          onUpdateContact({ ...selectedContact, chatId: chatForContact._id });
        }
      }
    }, [chats, selectedContact, onUpdateContact]);

    return (
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
        }}
      >
        {/* Chat Header (Desktop) */}
        {!isMobile && (
          <Box
            sx={{
              p: 2,
              borderBottom: "1px solid",
              borderColor: "divider",
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
            }}
            onClick={(e) => setAnchorEl(e.currentTarget)}
          >
            <UserCard
              user={selectedContact}
              size="small"
              onBlockContact={onBlockContact}
              blockedContacts={blockedContacts}
              isLoggedInUser={false}
              title="Chat Window Card"
              onRemoveContact={onRemoveContact}
            />
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
            >
              <MenuItem
                onClick={() => {
                  onBlockContact(selectedContact);
                  setAnchorEl(null);
                }}
              >
                Block Contact
              </MenuItem>
            </Menu>
          </Box>
        )}

        {/* Messages Container */}
        <Box
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            p: 2,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {(messages || []).map((msg) => {
            // If msg.sender is an object with _id, use that.
            // Otherwise, fall back to using msg.sender directly (e.g., it might be a string).
            const senderId =
              (typeof msg.sender === "object" && msg.sender?._id) || msg.sender;

            return (
              <Message
                key={msg._id}
                text={msg.content}
                isUser={senderId === currentUserId}
                status={msg.status}
                timestamp={new Date(msg.createdAt)}
                senderName={
                  msg.sender
                    ? msg.sender.name || msg.sender.username
                    : "Unknown sender"
                }
                senderAvatar={
                  msg?.sender.pictures && msg?.sender.pictures.length > 0
                    ? msg?.sender.pictures[0]
                    : "https://via.placeholder.com/150"
                }
              />
            );
          })}
          <div ref={messagesEndRef} />
        </Box>

        {/* Message Input Area */}
        <Box
          sx={{
            p: 1.5,
            borderTop: "1px solid",
            borderColor: "divider",
            display: "flex",
            alignItems: "center",
            gap: 1,
            position: "relative",
          }}
        >
          {/* Attachment Buttons */}
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <IconButton component="label" disabled={isSending}>
              <input
                type="file"
                hidden
                onChange={handleFileAttach}
                accept=".pdf,.doc,.docx"
              />
              <AttachFileIcon />
            </IconButton>
            <IconButton component="label" disabled={isSending}>
              <input
                type="file"
                hidden
                onChange={handleImageAttach}
                accept="image/*"
              />
              <ImageIcon />
            </IconButton>
            <IconButton
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              disabled={isSending}
            >
              <EmojiEmotionsIcon />
            </IconButton>
          </Box>

          {/* Message Input */}
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="Type a message..."
            size="small"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isSending}
            sx={{
              flexGrow: 1,
              "& .MuiOutlinedInput-root": {
                borderRadius: 4,
              },
            }}
          />

          {/* Send Button */}
          <IconButton
            onClick={handleSendMessage}
            disabled={!message.trim() || isSending}
            sx={{
              p: 1.5,
              backgroundColor: "primary.main",
              color: "primary.contrastText",
              "&:hover": { backgroundColor: "primary.dark" },
              "&:disabled": { backgroundColor: "action.disabledBackground" },
            }}
          >
            <SendIcon />
          </IconButton>

          {/* Emoji Picker */}
          {showEmojiPicker && (
            <Box
              sx={{
                position: "absolute",
                bottom: 70,
                right: 16,
                zIndex: 999,
              }}
            >
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                previewConfig={{ showPreview: false }}
              />
            </Box>
          )}
        </Box>
      </Box>
    );
  }
);

ChatWindow.propTypes = {
  selectedContact: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    profilePicture: PropTypes.string.isRequired,
    status: PropTypes.oneOf(["online", "offline", "busy", "blocked"])
      .isRequired,
    chatId: PropTypes.string,
  }).isRequired,
  isMobile: PropTypes.bool.isRequired,
  onBlockContact: PropTypes.func.isRequired,
  onUpdateContact: PropTypes.func.isRequired,
  onRemoveContact: PropTypes.func.isRequired,
  chats: PropTypes.array.isRequired,
  blockedContacts: PropTypes.array.isRequired,
};

ChatWindow.displayName = "ChatWindow";

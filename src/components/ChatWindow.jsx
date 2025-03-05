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
import {
  sendMessage,
  fetchChatMessages,
  createChat,
  uploadPictures,
} from "../api";
import { isValidObjectId } from "../utils/validation";
import { memo } from "react";
import { useTranslation } from "react-i18next";

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
    const { t } = useTranslation();
    const [message, setMessage] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isSending, setIsSending] = useState(false);
    // New state for previewing attached images
    const [previewImages, setPreviewImages] = useState([]);
    const [isUploading, setIsUploading] = useState(false);

    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);
    const currentUserId = localStorage.getItem("userId");

    if (!currentUserId) {
      throw new Error(t("userNotAuthenticated"));
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
          console.log("messagesData");
          console.log(messagesData);
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
        if (socketRef.current) socketRef.current.disconnect();
      };
    }, [selectedContact?.chatId]);

    // File attachment (non-image) remains unchanged
    const handleFileAttach = (event) => {
      const file = event.target.files[0];
      if (file) {
        console.log("File attached:", file.name);
        // TODO: Implement file upload logic
      }
    };

    // New function to handle image selection
    const handleImageSelect = (event) => {
      const file = event.target.files[0];
      if (file) {
        const previewUrl = URL.createObjectURL(file);
        const tempId = `preview-${Date.now()}`;
        const previewMessage = {
          _id: tempId,
          content: "",
          sender: currentUserId,
          status: "pending",
          createdAt: new Date(),
          attachment: { type: "image", url: previewUrl, file },
        };
        console.log("Preview message created:", previewMessage); // Debug log
        setMessages((prev) => [...prev, previewMessage]);
        setPreviewImages((prev) => [...prev, { file, previewUrl, tempId }]);
      }
      event.target.value = "";
      event.target.blur();
    };
    // Remove a preview message (and its file) if user cancels attachment.
    const handleRemovePreviewImage = (tempId) => {
      setPreviewImages((prev) => prev.filter((p) => p.tempId !== tempId));
      setMessages((prev) => prev.filter((msg) => msg._id !== tempId));
    };

    // When sending a message, if there are preview images, upload them first.
    // Function to upload preview images and send them as attachments.
    const handleSendImageAttachments = async () => {
      if (previewImages.length === 0) return;
      setIsUploading(true);
      try {
        // Extract file objects from previewImages.
        const filesArray = previewImages.map((imgObj) => imgObj.file);
        // Call your API function to upload images.
        const uploadResponse = await uploadPictures(currentUserId, filesArray);
        console.log("Upload response:", uploadResponse);
        // Assume the API returns an object with a 'pictureUrls' array.
        const pictureUrls = uploadResponse.pictureUrls || [];
        if (pictureUrls.length === 0) {
          console.error("No picture URLs returned from uploadPictures API");
          throw new Error("Image upload failed.");
        }
        // Build the attachments array (one object per image).
        const attachments = pictureUrls.map((url) => ({
          type: "image",
          url,
        }));

        // Ensure a chat exists.
        let chatId = selectedContact.chatId;
        if (!chatId) {
          const participantIds = [currentUserId, selectedContact._id];
          if (
            participantIds.length !== 2 ||
            !participantIds.every((id) => isValidObjectId(id))
          ) {
            throw new Error(t("invalidParticipantIDsForChatCreation"));
          }
          const newChat = await createChat(participantIds);
          chatId = newChat._id;
          onUpdateContact({ ...selectedContact, chatId });
          console.log("Created new chat with id:", chatId);
        }

        // Send a new message with the attachments.
        // You can decide if you want to send a caption (in 'content') or just the attachments.
        const sentMessageResponse = await sendMessage(
          chatId,
          currentUserId,
          "", // No text content in this case
          attachments // Pass attachments as an array
        );
        console.log("Sent message with attachments:", sentMessageResponse);

        // Update the messages state with the newly created message.
        setMessages((prev) => [...prev, sentMessageResponse.message]);
        // Clear preview images since they've been sent.
        setPreviewImages([]);
      } catch (error) {
        console.error("Error sending image attachments:", error.message);
        // Optionally show an error message to the user.
      } finally {
        setIsUploading(false);
      }
    };

    // When the send button is clicked, if there are preview images, send them; otherwise, send a text message.
    const handleSendMessage = async () => {
      // If there are image previews, upload them and send as attachments.
      if (previewImages.length > 0) {
        await handleSendImageAttachments();
        return;
      }
      // Otherwise, send a text message.
      const trimmedMessage = message.trim();
      if (!trimmedMessage || isSending) return;
      setIsSending(true);
      let chatId = selectedContact.chatId;
      const tempMessageId = Date.now().toString();
      try {
        const currentUserId = localStorage.getItem("userId");
        if (!currentUserId) {
          throw new Error(t("userNotAuthenticated"));
        }
        if (!selectedContact?._id) {
          throw new Error(t("invalidContactSelected"));
        }
        // Optimistic update for text message.
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
        if (!chatId) {
          const participantIds = [currentUserId, selectedContact._id];
          if (
            participantIds.length !== 2 ||
            !participantIds.every((id) => isValidObjectId(id))
          ) {
            throw new Error(t("invalidParticipantIDsForChatCreation"));
          }
          const newChat = await createChat(participantIds);
          chatId = newChat._id;
          onUpdateContact({ ...selectedContact, chatId });
        }
        const sentMessage = await sendMessage(
          chatId,
          currentUserId,
          trimmedMessage
        );
        console.log("Sent message API response:", sentMessage);
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
              ? { ...msg, status: "failed", error: error.message }
              : msg
          )
        );
      } finally {
        setIsSending(false);
      }
    };

    const handleKeyPress = (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        handleSendMessage();
      }
    };

    // Handle emoji selection
    const handleEmojiClick = (emoji) => {
      setMessage((prev) => prev + emoji.emoji);
      setShowEmojiPicker(false);
    };

    useEffect(() => {
      if (!selectedContact.chatId && chats && chats.length > 0) {
        const chatForContact = chats.find((chat) =>
          chat.participants.some(
            (p) => p._id.toString() === selectedContact._id.toString()
          )
        );
        if (chatForContact) {
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
                    : t("unknownSender")
                }
                senderAvatar={
                  msg?.sender.pictures && msg?.sender.pictures.length > 0
                    ? msg?.sender.pictures[0]
                    : "https://via.placeholder.com/150"
                }
                attachments={msg.attachments} // Pass attachment info to your Message component
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
            <IconButton component="label" disabled={isSending || isUploading}>
              <input
                type="file"
                hidden
                onChange={handleFileAttach}
                accept=".pdf,.doc,.docx"
              />
              <AttachFileIcon />
            </IconButton>
            <IconButton component="label" disabled={isSending || isUploading}>
              <input
                type="file"
                hidden
                onChange={handleImageSelect} // Use the new handleImageSelect for image preview
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
            placeholder={t("typeAmessage")}
            size="small"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isSending}
            sx={{
              flexGrow: 1,
              "& .MuiOutlinedInput-root": { borderRadius: 4 },
            }}
          />

          {/* Send Button */}
          <IconButton
            onClick={handleSendMessage}
            disabled={
              (!message.trim() && previewImages.length === 0) || isSending
            }
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
              sx={{ position: "absolute", bottom: 70, right: 16, zIndex: 999 }}
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

export default ChatWindow;

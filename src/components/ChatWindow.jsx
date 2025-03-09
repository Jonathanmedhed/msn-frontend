import { useState, useEffect, useRef, useMemo, useContext } from "react";
import { Box, TextField, IconButton, Menu, MenuItem } from "@mui/material";
import PropTypes from "prop-types";
import { UserCard } from "./UserCard";
import { Message } from "./Message";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import ImageIcon from "@mui/icons-material/Image";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import SendIcon from "@mui/icons-material/Send";
import EmojiPicker from "emoji-picker-react";
import {
  sendMessage,
  fetchChatMessages,
  createChat,
  uploadPictures,
  uploadFiles,
  updateMessageStatus,
} from "../api";
import { isValidObjectId } from "../utils/validation";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import { SocketContext } from "../context/SocketContext";

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
    const { socket, joinChatRoom } = useContext(SocketContext);

    const { t } = useTranslation();
    const [message, setMessage] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isSending, setIsSending] = useState(false);
    const [previewImages, setPreviewImages] = useState([]);
    const [previewFiles, setPreviewFiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);

    const uniqueMessages = useMemo(() => {
      const seen = new Set();
      return (messages || []).filter((msg) => {
        const duplicate = seen.has(msg._id);
        seen.add(msg._id);
        return !duplicate;
      });
    }, [messages]);

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

    useEffect(() => {
      let isMounted = true;
      const initializeChat = async () => {
        if (!selectedContact?.chatId) return;
        try {
          const messagesData = await fetchChatMessages(selectedContact.chatId);
          console.log("Initial messages fetched:", messagesData);
          if (isMounted) {
            setMessages(messagesData);
          }
        } catch (error) {
          console.error("Chat initialization error:", error);
          if (isMounted) setMessages([]);
        }
      };
      initializeChat();
      return () => {
        isMounted = false;
      };
    }, [selectedContact?.chatId]);

    // Join chat room using the global socket
    useEffect(() => {
      if (selectedContact?.chatId && socket) {
        joinChatRoom(selectedContact.chatId);
      }
    }, [selectedContact, socket, joinChatRoom]);

    // Listen for new messages and message status updates on the global socket.
    useEffect(() => {
      if (!socket) return;
      const handleNewMessage = (newMessage) => {
        console.log("ChatWindow received newMessage:", newMessage);
        // If message is from another user and status is not "read", update it.
        if (
          newMessage.sender &&
          newMessage.sender._id !== currentUserId &&
          newMessage.status !== "read"
        ) {
          console.log(
            "Updating message status to read for message:",
            newMessage._id
          );
          updateMessageStatus(newMessage._id, "read");
        }
        setMessages((prev) => [...prev, newMessage]);
      };

      const handleMessageStatus = (updatedMessage) => {
        console.log(
          "ChatWindow received messageStatus update:",
          updatedMessage
        );
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === updatedMessage._id ? updatedMessage : msg
          )
        );
      };

      socket.on("newMessage", handleNewMessage);
      socket.on("messageStatus", handleMessageStatus);

      return () => {
        socket.off("newMessage", handleNewMessage);
        socket.off("messageStatus", handleMessageStatus);
      };
    }, [socket, currentUserId]);

    // Mark received messages as "read" when ChatWindow is open.
    useEffect(() => {
      if (socket && selectedContact?.chatId) {
        const unreadMessages = messages.filter((msg) => {
          const senderId =
            typeof msg.sender === "object" ? msg.sender._id : msg.sender;
          return (
            senderId !== currentUserId &&
            (msg.status === "sent" || msg.status === "delivered")
          );
        });
        if (unreadMessages.length > 0) {
          console.log("Marking messages as read:", unreadMessages);
          unreadMessages.forEach((msg) => {
            socket.emit("updateMessageStatus", {
              messageId: msg._id,
              status: "read",
            });
          });
        }
      }
    }, [socket, selectedContact?.chatId, messages, currentUserId]);

    // ---------------------------
    // Image Attachment Handling
    // ---------------------------
    const handleImageSelect = (event) => {
      const files = Array.from(event.target.files);
      if (files.length > 0) {
        files.forEach((file) => {
          const previewUrl = URL.createObjectURL(file);
          // Generate a unique tempId for each file preview
          const tempId = `preview-${Date.now()}-${Math.random()}`;
          const previewMessage = {
            _id: tempId,
            content: "",
            sender: currentUserId,
            status: "pending",
            createdAt: new Date(),
            attachments: [{ type: "image", url: previewUrl, file }],
          };
          console.log("Preview image message created:", previewMessage);
          setMessages((prev) => [...prev, previewMessage]);
          setPreviewImages((prev) => [...prev, { file, previewUrl, tempId }]);
        });
      }
      event.target.value = "";
      event.target.blur();
    };

    // ---------------------------
    // File Attachment Handling
    // ---------------------------
    const handleFileAttach = (event) => {
      const files = Array.from(event.target.files);
      if (files.length > 0) {
        files.forEach((file) => {
          const tempId = `preview-file-${Date.now()}-${Math.random()}`;
          const previewMessage = {
            _id: tempId,
            content: "",
            sender: currentUserId,
            status: "pending",
            createdAt: new Date(),
            attachments: [{ type: "file", url: "", name: file.name, file }],
          };
          console.log("Preview file message created:", previewMessage);
          setMessages((prev) => [...prev, previewMessage]);
          setPreviewFiles((prev) => [
            ...prev,
            { file, fileName: file.name, tempId },
          ]);
        });
      }
      event.target.value = "";
      event.target.blur();
    };

    // Remove a preview image or file message (by tempId)
    const handleRemovePreview = (tempId) => {
      setPreviewImages((prev) => prev.filter((p) => p.tempId !== tempId));
      setPreviewFiles((prev) => prev.filter((p) => p.tempId !== tempId));
      setMessages((prev) => prev.filter((msg) => msg._id !== tempId));
    };

    // ---------------------------
    // Sending Attachments (Images & Files)
    // ---------------------------
    const handleSendAttachments = async () => {
      if (previewImages.length === 0 && previewFiles.length === 0) return;
      setIsUploading(true);
      try {
        let attachments = [];
        // Upload images if present
        if (previewImages.length > 0) {
          const imageFiles = previewImages.map((imgObj) => imgObj.file);
          const imageResponse = await uploadPictures(currentUserId, imageFiles);
          const imageUrls = imageResponse.pictureUrls || [];
          if (previewImages.length > 0 && imageUrls.length === 0) {
            throw new Error("Image upload failed.");
          }
          attachments = [
            ...attachments,
            ...imageUrls.map((url) => ({ type: "image", url })),
          ];
        }
        // Upload files if present
        if (previewFiles.length > 0) {
          const fileFiles = previewFiles.map((fileObj) => fileObj.file);
          const fileResponse = await uploadFiles(currentUserId, fileFiles);
          const fileUrls = fileResponse.fileUrls || [];
          if (previewFiles.length > 0 && fileUrls.length === 0) {
            throw new Error("File upload failed.");
          }
          attachments = [
            ...attachments,
            ...fileUrls.map((url, index) => ({
              type: "file",
              url,
              name: previewFiles[index].fileName,
            })),
          ];
        }
        // Ensure chat exists
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
        // Send a new message with the attachments array.
        const sentMessageResponse = await sendMessage(
          chatId,
          currentUserId,
          "", // No text content for attachment-only messages
          attachments
        );
        console.log("Sent message with attachments:", sentMessageResponse);
        setMessages((prev) => {
          const filtered = prev.filter(
            (msg) => !msg._id.startsWith("preview-")
          );
          return [...filtered, sentMessageResponse.message];
        });
        // Clear preview states
        setPreviewImages([]);
        setPreviewFiles([]);
      } catch (error) {
        console.error("Error sending attachments:", error.message);
      } finally {
        setIsUploading(false);
      }
    };

    const handleSendMessage = async () => {
      // If there are any attachments (images or files), send them.
      if (previewImages.length > 0 || previewFiles.length > 0) {
        await handleSendAttachments();
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
          {(uniqueMessages || []).map((msg) => {
            const senderId =
              (typeof msg.sender === "object" && msg.sender?._id) || msg.sender;
            return (
              <Message
                key={msg._id}
                messageId={msg._id} // Pass the unique message id
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
                attachments={msg.attachments}
                onRemovePreview={
                  msg._id.startsWith("preview-") ? handleRemovePreview : null
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
            <IconButton component="label" disabled={isSending || isUploading}>
              <input
                type="file"
                hidden
                onChange={handleFileAttach}
                accept=".pdf,.doc,.docx"
                multiple
              />
              <AttachFileIcon />
            </IconButton>
            <IconButton component="label" disabled={isSending || isUploading}>
              <input
                type="file"
                hidden
                onChange={handleImageSelect}
                accept="image/*"
                multiple
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
              (!message.trim() &&
                previewImages.length === 0 &&
                previewFiles.length === 0) ||
              isSending
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
          <Box
            sx={{
              display: showEmojiPicker ? "unset" : "none",
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

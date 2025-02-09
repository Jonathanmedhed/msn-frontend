import { useState } from "react";
import { Box, TextField, IconButton, Menu, MenuItem } from "@mui/material";
import PropTypes from "prop-types";
import { UserCard } from "./UserCard"; // Assuming UserCard is used for contacts
import { Message } from "./Message"; // Import the Message component
import AttachFileIcon from "@mui/icons-material/AttachFile";
import ImageIcon from "@mui/icons-material/Image";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import SendIcon from "@mui/icons-material/Send"; // Import Send icon
import EmojiPicker from "emoji-picker-react";
import "../css/emoji-picker-custom.css";

export const ChatWindow = ({ selectedContact, isMobile, onBlockContact }) => {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null); // For the block menu

  // Mock messages (replace with actual data)
  const messages = [
    { text: "Hello!", isUser: false, status: "received" },
    { text: "Hi there!", isUser: true, status: "read" },
    { text: "How are you?", isUser: false, status: "received" },
    { text: "I'm good, thanks!", isUser: true, status: "sent" },
  ];

  // Handle file attachment
  const handleFileAttach = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log("File attached:", file.name);
      // Handle file upload logic here
    }
  };

  // Handle image attachment
  const handleImageAttach = (event) => {
    const image = event.target.files[0];
    if (image) {
      console.log("Image attached:", image.name);
      // Handle image upload logic here
    }
  };

  // Handle emoji selection
  const handleEmojiClick = (emoji) => {
    setMessage((prevMessage) => prevMessage + emoji.emoji);
    setShowEmojiPicker(false); // Close the emoji picker after selection
  };

  // Handle opening the block menu
  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Handle closing the block menu
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Handle blocking the contact
  const handleBlockContact = () => {
    onBlockContact(selectedContact); // Call the parent function to block the contact
    handleMenuClose();
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
        width: "100%",
      }}
    >
      {/* User Card (Desktop Only) */}
      {!isMobile && (
        <Box
          sx={{
            p: 2,
            borderBottom: "1px solid",
            borderColor: "divider", // Use theme's divider color
            display: "flex",
            alignItems: "center",
          }}
        >
          <IconButton onClick={handleAvatarClick}>
            <UserCard user={selectedContact} size="small" />
          </IconButton>

          {/* Block Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleBlockContact}>Block Contact</MenuItem>
          </Menu>
        </Box>
      )}

      {/* Chat History */}
      <Box sx={{ flexGrow: 1, overflowY: "auto", p: 2 }}>
        {messages.map((message, index) => (
          <Message
            key={index}
            text={message.text}
            isUser={message.isUser}
            status={message.status}
          />
        ))}
      </Box>

      {/* Message Input */}
      <Box
        sx={{
          p: 1, // Reduced padding for the container
          borderTop: "1px solid",
          borderColor: "divider", // Use theme's divider color
          display: "flex",
          alignItems: "center",
          gap: 0.5, // Reduced gap between elements
        }}
      >
        {/* Icons on the Left */}
        <Box sx={{ display: "flex", gap: 0.5 }}>
          {/* File Attachment Button */}
          <IconButton component="label" sx={{ p: 1 }}>
            {" "}
            {/* Reduced padding */}
            <input
              type="file"
              hidden
              onChange={handleFileAttach}
              accept=".pdf,.doc,.docx"
            />
            <AttachFileIcon />
          </IconButton>

          {/* Image Attachment Button */}
          <IconButton component="label" sx={{ p: 1 }}>
            {" "}
            {/* Reduced padding */}
            <input
              type="file"
              hidden
              onChange={handleImageAttach}
              accept="image/*"
            />
            <ImageIcon />
          </IconButton>

          {/* Emoji Button */}
          <IconButton
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            sx={{ p: 1 }} // Reduced padding
          >
            <EmojiEmotionsIcon />
          </IconButton>
        </Box>

        {/* Input Field (Takes All Available Space) */}
        <TextField
          fullWidth
          placeholder="Type a message"
          size="small"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          sx={{ flexGrow: 1, mx: 0.5 }} // Minimal margin for separation
        />

        {/* Send Button on the Right */}
        <IconButton
          sx={{
            p: 1, // Reduced padding
            borderRadius: "50%", // Make the button round
            backgroundColor: "background.paper", // Use theme's paper color
            color: "primary.main", // Blue icon
            "&:hover": {
              backgroundColor: "action.hover", // Use theme's hover color
            },
          }}
        >
          <SendIcon />
        </IconButton>

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <Box sx={{ position: "absolute", bottom: 80, right: 16 }}>
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </Box>
        )}
      </Box>
    </Box>
  );
};

ChatWindow.propTypes = {
  selectedContact: PropTypes.shape({
    name: PropTypes.string.isRequired,
    profilePicture: PropTypes.string.isRequired,
    status: PropTypes.oneOf(["online", "offline", "busy", "blocked"])
      .isRequired,
  }).isRequired,
  isMobile: PropTypes.bool.isRequired,
  onBlockContact: PropTypes.func.isRequired, // Function to handle blocking a contact
};

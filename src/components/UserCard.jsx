import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Badge,
  Menu,
  MenuItem,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import BlockIcon from "@mui/icons-material/Block";
import PropTypes from "prop-types";
import { useState } from "react";
// Import the Message component used in ChatWindow for consistent styling
import { Message } from "./Message";

export const UserCard = ({
  user,
  size = "large",
  showEditIcon = false,
  onEditClick,
  alwaysShowPersonalMessage = false,
  largeStatus = false,
  avatarSizeMultiplier = 1,
  isLoggedInUser = false,
  onStatusChange,
  chat, // new prop for the chat object
  isContactList,
}) => {
  console.log(`${user.name} Chat: `, chat);

  const getStatusColor = (status) => {
    switch (status) {
      case "online":
        return "green";
      case "offline":
        return "red";
      case "busy":
        return "orange";
      default:
        return "gray";
    }
  };

  const [anchorEl, setAnchorEl] = useState(null);
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const handleStatusSelect = (status) => {
    onStatusChange(status);
    handleMenuClose();
  };

  const isBlocked = user.status === "blocked";
  const baseAvatarSize = size === "lg" ? 100 : size === "md" ? 70 : 60;
  const avatarSize = baseAvatarSize * avatarSizeMultiplier;

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Determine if there is a lastMessage on the chat
  const hasLastMessage = chat && chat.lastMessage && chat.lastMessage.content;
  const lastMessage = hasLastMessage ? chat.lastMessage.content : "";
  // Use customMessage, or fallback to personalMessage or bio if available
  const customMessage = user.customMessage || user.personalMessage || user.bio;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        padding: 1,
      }}
    >
      {/* Avatar with Status Indicator */}
      <Badge
        overlap="circular"
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        variant="dot"
        sx={{
          "& .MuiBadge-badge": {
            backgroundColor: getStatusColor(user.status),
            color: getStatusColor(user.status),
            boxShadow: `0 0 0 2px white`,
            width: largeStatus ? 16 : 12,
            height: largeStatus ? 16 : 12,
            borderRadius: "50%",
          },
        }}
      >
        <Box
          sx={{
            position: "relative",
            width: avatarSize,
            height: avatarSize,
          }}
        >
          <IconButton onClick={handleAvatarClick}>
            <Avatar
              alt={user.name}
              src={user.profilePicture}
              sx={{
                width: "100%",
                height: "100%",
                opacity: isBlocked ? 0.5 : 1,
              }}
            />
          </IconButton>

          {isBlocked && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1,
              }}
            >
              <BlockIcon
                onClick={handleAvatarClick}
                sx={{
                  fontSize: avatarSize,
                  color: "red",
                  width: "100%",
                  height: "100%",
                }}
              />
            </Box>
          )}

          {isLoggedInUser ? (
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              {["Online", "Away", "Busy", "Offline"].map((status) => (
                <MenuItem
                  key={status}
                  onClick={() => handleStatusSelect(status)}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        backgroundColor:
                          status === "Online"
                            ? "green"
                            : status === "Away"
                            ? "orange"
                            : status === "Busy"
                            ? "red"
                            : "gray",
                      }}
                    />
                    <Typography>{status}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </Menu>
          ) : (
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              {[isBlocked ? "Unblock" : "Block"].map((status) => (
                <MenuItem
                  key={status}
                  onClick={() => handleStatusSelect(status)}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography>{status}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </Menu>
          )}
        </Box>
      </Badge>

      {/* User Info */}
      {hasLastMessage ? (
        // If a lastMessage exists, use a two-row layout:
        // Top row: Name and customMessage (both left aligned with ellipsis)
        // Bottom row: lastMessage rendered as a message bubble
        <Box
          sx={{
            flexGrow: 1,
            ml: 2,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: isContactList ? "center" : "",
            alignContent: isContactList ? "center" : "",
          }}
        >
          {/* Top row */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <Typography variant="h6" noWrap>
              {user.name}
            </Typography>
            {customMessage && (
              <Typography
                variant="body2"
                color="textSecondary"
                noWrap
                sx={{
                  ml: 1, // space between name and custom message
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  pt: 0.5,
                }}
              >
                {customMessage}
              </Typography>
            )}
          </Box>
          {/* Bottom row: Render lastMessage as a bubble with reduced padding */}
          {lastMessage && (
            <Box sx={{ maxWidth: "80%" }}>
              <Message
                text={lastMessage}
                isUser={false}
                isContactList={true}
                sx={{ py: 0.5 }}
              />
            </Box>
          )}
        </Box>
      ) : (
        // Otherwise, use the default layout.
        <Box sx={{ flexGrow: 1, ml: 2 }}>
          <Typography variant="h6">{user.name}</Typography>
          {!alwaysShowPersonalMessage && (
            <Typography variant="body2" color="textSecondary">
              {user.status}
            </Typography>
          )}
          {alwaysShowPersonalMessage && (
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography
                variant="body2"
                color="textSecondary"
                sx={{ mt: 1, overflow: "hidden", textOverflow: "ellipsis" }}
                noWrap
              >
                {customMessage}
              </Typography>
              {showEditIcon && (
                <IconButton
                  onClick={onEditClick}
                  sx={{
                    fontSize: "inherit",
                    padding: 0,
                    marginLeft: 1,
                  }}
                >
                  <EditIcon fontSize="inherit" />
                </IconButton>
              )}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

UserCard.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
    profilePicture: PropTypes.string.isRequired,
    status: PropTypes.oneOf(["online", "offline", "busy", "blocked"])
      .isRequired,
    customMessage: PropTypes.string,
    personalMessage: PropTypes.string,
    bio: PropTypes.string,
  }).isRequired,
  size: PropTypes.oneOf(["lg", "md"]),
  showArrow: PropTypes.bool,
  showEditIcon: PropTypes.bool,
  onArrowClick: PropTypes.func,
  onEditClick: PropTypes.func,
  alwaysShowPersonalMessage: PropTypes.bool,
  largeStatus: PropTypes.bool,
  avatarSizeMultiplier: PropTypes.number,
  onStatusChange: PropTypes.func,
  isLoggedInUser: PropTypes.bool,
  isContactList: PropTypes.bool,
  // New prop for the chat object
  chat: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    participants: PropTypes.arrayOf(
      PropTypes.shape({
        _id: PropTypes.any.isRequired,
      })
    ).isRequired,
    messages: PropTypes.arrayOf(
      PropTypes.shape({
        content: PropTypes.string.isRequired,
      })
    ),
    lastMessage: PropTypes.shape({
      _id: PropTypes.string,
      content: PropTypes.string,
      createdAt: PropTypes.string,
    }),
  }),
};

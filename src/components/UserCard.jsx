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
import BlockIcon from "@mui/icons-material/Block"; // Import the Block icon
import PropTypes from "prop-types";
import { useState } from "react";

export const UserCard = ({
  user,
  size = "large",
  showEditIcon = false,
  onEditClick,
  alwaysShowPersonalMessage = false,
  largeStatus = false,
  avatarSizeMultiplier = 1, // New prop to control avatar size
  isLoggedInUser = false,
  onStatusChange,
}) => {
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

  const [anchorEl, setAnchorEl] = useState(null); // For the status menu
  // Handle closing the status menu
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Handle status change
  const handleStatusSelect = (status) => {
    onStatusChange(status); // Call the parent function to update the status
    handleMenuClose();
  };

  const isBlocked = user.status === "blocked";
  const baseAvatarSize = size === "lg" ? 100 : size === "md" ? 70 : 60; // Base size for the avatar
  const avatarSize = baseAvatarSize * avatarSizeMultiplier; // Apply multiplier

  // Handle opening the status menu
  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  return (
    <Box
      sx={{ display: "flex", alignItems: "center", width: "100%", padding: 1 }}
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
            width: largeStatus ? 16 : 12, // Adjust status circle size
            height: largeStatus ? 16 : 12, // Adjust status circle size
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
          {/* Avatar with Status Indicator */}
          <IconButton onClick={handleAvatarClick}>
            <Avatar
              alt={user.name}
              src={user.profilePicture}
              sx={{
                width: "100%",
                height: "100%",
                opacity: isBlocked ? 0.5 : 1, // Reduce opacity if blocked
              }}
            />
          </IconButton>
          {/* Blocked Icon */}

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
                zIndex: 1, // Ensure the icon is in front of the avatar
              }}
            >
              <BlockIcon
                onClick={handleAvatarClick}
                sx={{
                  fontSize: avatarSize, // Match the avatar size
                  color: "red", // Red color for the blocked icon
                  width: "100%",
                  height: "100%",
                }}
              />
            </Box>
          )}
          {/* Status Menu */}
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
      <Box sx={{ flexGrow: 1, ml: 2 }}>
        <Typography variant="h6">{user.name}</Typography>
        {!alwaysShowPersonalMessage && (
          <Typography variant="body2" color="textSecondary">
            {user.status}
          </Typography>
        )}

        {/* Always show personal message */}
        {alwaysShowPersonalMessage && (
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              {user.customMessage}
            </Typography>
            {showEditIcon && (
              <IconButton
                onClick={onEditClick}
                sx={{
                  fontSize: "inherit", // Match the font size of the Typography
                  padding: 0, // Remove padding to align better with text
                  marginLeft: 1, // Add some spacing between text and icon
                }}
              >
                <EditIcon fontSize="inherit" />
              </IconButton>
            )}
          </Box>
        )}
      </Box>
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
  }).isRequired,
  size: PropTypes.oneOf(["lg", "md"]),
  showArrow: PropTypes.bool,
  showEditIcon: PropTypes.bool,
  onArrowClick: PropTypes.func,
  onEditClick: PropTypes.func,
  alwaysShowPersonalMessage: PropTypes.bool,
  largeStatus: PropTypes.bool, // New prop for larger status circle
  avatarSizeMultiplier: PropTypes.number, // New prop for avatar size multiplier
  onStatusChange: PropTypes.func,
  isLoggedInUser: PropTypes.bool,
};

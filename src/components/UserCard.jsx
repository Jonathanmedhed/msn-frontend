import React from "react";
import { Box, Typography, IconButton, Avatar } from "@mui/material";
import { ArrowDropDown, Edit } from "@mui/icons-material";

// Status colors
const statusColors = {
  Online: "#4caf50", // Green
  Away: "#ffeb3b", // Yellow
  Busy: "#ff9800", // Orange
  Offline: "#f44336", // Red
  Blocked: "#9e9e9e", // Gray
};

function UserCard({
  user,
  showArrow = false,
  showEditIcon = false,
  alwaysShowPersonalMessage = false,
  size = "medium", // 'medium' or 'small'
  onArrowClick,
  onEditClick,
}) {
  const { name, status, avatar, personalMessage } = user;

  // Avatar size based on the `size` prop
  const avatarSize = size === "small" ? 40 : 56;

  // Status indicator size based on the `size` prop
  const statusIndicatorSize = size === "small" ? 12 : 14;

  // Render status circle or slash icon
  const renderStatusIndicator = (status) => {
    if (status === "Blocked") {
      return (
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            right: 0,
            backgroundColor: statusColors[status],
            borderRadius: "50%",
            width: statusIndicatorSize + 6, // Slightly larger for the slash icon
            height: statusIndicatorSize + 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              width: "100%",
              height: "2px",
              backgroundColor: "#fff",
              transform: "rotate(-45deg)",
            }}
          />
        </Box>
      );
    } else {
      return (
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            right: 0,
            backgroundColor: statusColors[status],
            borderRadius: "50%",
            width: statusIndicatorSize,
            height: statusIndicatorSize,
            border: "2px solid #fff",
          }}
        />
      );
    }
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      {/* Avatar and Status Indicator */}
      <Box sx={{ position: "relative" }}>
        <Avatar src={avatar} sx={{ width: avatarSize, height: avatarSize }} />
        {renderStatusIndicator(status)}
      </Box>

      {/* User Info */}
      <Box sx={{ ml: 2, flexGrow: 1 }}>
        <Typography variant={size === "small" ? "subtitle1" : "h6"}>
          {name}{" "}
          <Typography
            component="span"
            variant="body2"
            color="textSecondary"
            sx={{ opacity: 0.7 }}
          >
            ({status})
          </Typography>
          {/* Dropdown Arrow */}
          {showArrow && (
            <IconButton
              onClick={onArrowClick}
              sx={{
                padding: 0, // Remove padding
                color: "black", // Set the icon color
              }}
            >
              <ArrowDropDown />
            </IconButton>
          )}
        </Typography>
        {/* Personal Message */}
        {(alwaysShowPersonalMessage || personalMessage) && (
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography
              variant="body2"
              color="textSecondary"
              sx={{ opacity: 0.7 }}
            >
              {personalMessage || "<Enter personal message>"}
            </Typography>
            {showEditIcon && (
              <IconButton
                onClick={onEditClick}
                sx={{ padding: 0, marginLeft: 0.5 }}
              >
                <Edit sx={{ fontSize: 16, color: "black" }} />
              </IconButton>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default UserCard;

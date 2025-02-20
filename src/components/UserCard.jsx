import { memo, useState } from "react";
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
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import PropTypes from "prop-types";
import { Message } from "./Message";
import { ConfirmationDialog } from "./ConfirmationDialog";

export const UserCard = memo(
  ({
    user,
    size = "large",
    showEditIcon = false,
    onEditClick,
    alwaysShowPersonalMessage = false,
    largeStatus = false,
    avatarSizeMultiplier = 1,
    isLoggedInUser = false,
    onStatusChange,
    chat,
    isContactList,
    onBlockContact,
    blockedContacts,
    onRemoveContact,
    sentRequest,
    receivedRequest,
    onAcceptRequest,
    onRejectRequest,
    onCancelRequest,
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

    const [anchorEl, setAnchorEl] = useState(null);
    const handleMenuClose = () => {
      setAnchorEl(null);
    };
    const [confirmDialog, setConfirmDialog] = useState({
      open: false,
      title: "",
      message: "",
      onConfirm: null,
    });

    // Check if the user is blocked by looking for their _id in blockedContacts
    const isBlocked = blockedContacts
      ? blockedContacts.map(String).includes(String(user._id))
      : false;

    const baseAvatarSize = size === "lg" ? 100 : size === "md" ? 70 : 60;
    const avatarSize = baseAvatarSize * avatarSizeMultiplier;

    const handleAvatarClick = (event) => {
      setAnchorEl(event.currentTarget);
    };

    // Determine if there is a last message on the chat
    const hasLastMessage = chat && chat.lastMessage && chat.lastMessage.content;
    const lastMessage = hasLastMessage ? chat.lastMessage.content : "";

    // Use the first picture in user.pictures if available, otherwise use a default image.
    const avatarSrc =
      user.pictures && user.pictures.length > 0 ? user.pictures[0] : "";

    // For sent requests, display the email instead of customMessage.
    const displayText = sentRequest ? user.email : user.customMessage;

    const openConfirmDialog = (title, message, onConfirm) => {
      setConfirmDialog({
        open: true,
        title,
        message,
        onConfirm: () => {
          onConfirm();
          setConfirmDialog((prev) => ({ ...prev, open: false }));
        },
      });
    };

    const handleAcceptClick = (e) => {
      e.stopPropagation();
      openConfirmDialog(
        "Accept Friend Request",
        `Accept friend request from ${user.name}?`,
        () => {
          if (onAcceptRequest) onAcceptRequest(user);
        }
      );
    };

    const handleRejectClick = (e) => {
      e.stopPropagation();
      openConfirmDialog(
        "Reject Friend Request",
        `Reject friend request from ${user.name}?`,
        () => {
          if (onRejectRequest) onRejectRequest(user);
        }
      );
    };

    const handleCancelClick = () => {
      openConfirmDialog(
        "Cancel Friend Request",
        `Cancel friend request sent to ${user.name}?`,
        () => {
          if (onCancelRequest) onCancelRequest(user);
        }
      );
    };

    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          padding: 1,
        }}
      >
        <ConfirmationDialog
          open={confirmDialog.open}
          onClose={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
          title={confirmDialog.title}
          message={confirmDialog.message}
          onConfirm={
            confirmDialog.onConfirm ||
            (() => setConfirmDialog((prev) => ({ ...prev, open: false })))
          }
        />
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
              "& .MuiIconButton-root": {
                width: "100%",
                height: "100%",
                padding: 0,
              },
            }}
          >
            <IconButton onClick={handleAvatarClick} sx={{ p: 0 }}>
              <Avatar
                alt={user.name}
                src={avatarSrc}
                sx={{
                  width: "100%",
                  height: "100%",
                  opacity: isBlocked ? 0.5 : 1,
                  borderRadius: "50%",
                  objectFit: "cover",
                  objectPosition: "center",
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

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              {isLoggedInUser ? (
                <Box>
                  {["Online", "Away", "Busy", "Offline"].map((status) => (
                    <MenuItem
                      key={status}
                      onClick={() => {
                        onStatusChange(status);
                        handleMenuClose();
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
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
                </Box>
              ) : (
                <Box>
                  <MenuItem
                    onClick={() => {
                      onBlockContact(user);
                      handleMenuClose();
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography>{isBlocked ? "Unblock" : "Block"}</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      onRemoveContact(user);
                      handleMenuClose();
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography>Remove Contact</Typography>
                    </Box>
                  </MenuItem>
                </Box>
              )}
            </Menu>
          </Box>
        </Badge>

        {/* User Info */}
        {hasLastMessage ? (
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
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="h6" noWrap>
                {user.name}
              </Typography>
              {(user.customMessage || sentRequest) && (
                <Typography
                  variant="body2"
                  color="textSecondary"
                  noWrap
                  sx={{
                    ml: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    pt: 0.5,
                  }}
                >
                  {displayText}
                </Typography>
              )}
            </Box>
            {lastMessage && (
              <Box sx={{ maxWidth: "80%" }}>
                {/* Render lastMessage as a bubble */}
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
          <Box sx={{ flexGrow: 1, ml: 2 }}>
            <Typography variant="h6">{user.name}</Typography>
            {!alwaysShowPersonalMessage && (
              <Typography variant="body2" color="textSecondary">
                {user.status}
              </Typography>
            )}
            {(alwaysShowPersonalMessage || sentRequest) && (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ overflow: "hidden", textOverflow: "ellipsis" }}
                  noWrap
                >
                  {displayText}
                </Typography>
                {showEditIcon && (
                  <IconButton
                    onClick={onEditClick}
                    sx={{ fontSize: "inherit", padding: 0, marginLeft: 1 }}
                  >
                    <EditIcon fontSize="inherit" />
                  </IconButton>
                )}
              </Box>
            )}
          </Box>
        )}
        {/* Friend Request Actions */}
        {receivedRequest && (
          <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
            <IconButton
              onClick={handleAcceptClick}
              size="small"
              color="primary"
            >
              <CheckIcon />
            </IconButton>
            <IconButton onClick={handleRejectClick} size="small" color="error">
              <CloseIcon />
            </IconButton>
          </Box>
        )}
        {sentRequest && (
          <Box sx={{ ml: "auto" }}>
            <IconButton onClick={handleCancelClick} size="small" color="error">
              <CloseIcon />
            </IconButton>
          </Box>
        )}
      </Box>
    );
  }
);

UserCard.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    status: PropTypes.oneOf(["online", "offline", "busy", "blocked"])
      .isRequired,
    customMessage: PropTypes.string,
    bio: PropTypes.string,
    _id: PropTypes.any.isRequired,
    pictures: PropTypes.array, // New pictures array
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
  onBlockContact: PropTypes.func,
  onRemoveContact: PropTypes.func,
  onAcceptRequest: PropTypes.func,
  onRejectRequest: PropTypes.func,
  onCancelRequest: PropTypes.func,
  blockedContacts: PropTypes.array,
  sentRequest: PropTypes.bool,
  receivedRequest: PropTypes.bool,
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

UserCard.displayName = "UserCard";

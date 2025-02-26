import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { useTheme } from "@mui/material/styles";
import {
  ArrowBack,
  ExitToApp,
  Notifications,
  People,
  Settings,
  Edit,
  VpnKey,
  Language,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Badge,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Snackbar,
  Alert,
} from "@mui/material";
import { TextFieldDialog } from "./TextFieldDialog";
import { logoutUser, changePassword } from "../api";

export const DrawerMenu = ({
  isDrawerOpen,
  toggleDrawer,
  isMobile,
  userAvatar,
  userStatus,
  userCustomMessage,
  userBio,
  userImages,
  handleStatusChange,
  handleFieldUpdate,
  handlePicturesClick,
}) => {
  const theme = useTheme();
  const [selectedOption, setSelectedOption] = useState(null);
  const [statusAnchorEl, setStatusAnchorEl] = useState(null);
  // State for generic dialog (for editing fields like bio, message)
  const [editField, setEditField] = useState({
    open: false,
    field: "",
    title: "",
    value: "",
  });
  // Local state to manage the order of images
  const [orderedImages, setOrderedImages] = useState(userImages || []);
  // State for language preference ("english" or "spanish")
  const [language, setLanguage] = useState("english");
  // State for change password dialog
  const [openChangePasswordDialog, setOpenChangePasswordDialog] =
    useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success", // "success" or "error"
  });

  // Sync local images order with prop changes
  useEffect(() => {
    setOrderedImages(userImages || []);
  }, [userImages]);

  // Handle text field edits
  const handleTextEdit = (field, title, currentValue) => {
    setEditField({
      open: true,
      field,
      title,
      value: currentValue,
    });
  };

  const handleOptionClick = (option) => {
    // For Change Password, open the dialog directly
    if (option === "Change Password") {
      setOpenChangePasswordDialog(true);
    } else {
      setSelectedOption(option);
    }
  };

  const handleBackClick = () => {
    setSelectedOption(null);
  };

  const handleStatusMenuOpen = (event) => {
    setStatusAnchorEl(event.currentTarget);
  };

  const handleStatusMenuClose = () => {
    setStatusAnchorEl(null);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "online":
        return "#4CAF50";
      case "away":
        return "#FFC107";
      case "busy":
        return "#F44336";
      case "offline":
        return "#9E9E9E";
      default:
        return "#9E9E9E";
    }
  };

  // Drag and drop handlers for reordering images
  const handleDragStart = (e, index) => {
    e.dataTransfer.setData("dragIndex", index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, dropIndex) => {
    e.preventDefault();
    const dragIndex = Number(e.dataTransfer.getData("dragIndex"));
    if (dragIndex === dropIndex) return;

    const newOrder = [...orderedImages];
    const [draggedImage] = newOrder.splice(dragIndex, 1);
    newOrder.splice(dropIndex, 0, draggedImage);
    setOrderedImages(newOrder);

    // Update the parent's state via your API update.
    await handleFieldUpdate("pictures", newOrder);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      window.location.reload();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Handler for changing language switch value
  const handleLanguageChange = (event) => {
    setLanguage(event.target.checked ? "spanish" : "english");
  };

  // Handler for submitting a password change
  const handleChangePasswordSubmit = async (data) => {
    try {
      const result = await changePassword(data);
      console.log("Password changed successfully:", result);
      setNotification({
        open: true,
        message: result.message, // "Password changed successfully."
        severity: "success",
      });
    } catch (error) {
      console.error("Error changing password:", error.message);
      setNotification({
        open: true,
        message: error.message, // "Password incorrect." or other friendly message
        severity: "error",
      });
    }
  };

  const handleNotificationClose = (event, reason) => {
    if (reason === "clickaway") return;
    setNotification({ ...notification, open: false });
  };

  // Change Password Dialog Component
  const ChangePasswordDialog = ({ open, onClose, onSubmit }) => {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = () => {
      if (newPassword !== repeatPassword) {
        setError("New password and repeat password do not match");
        return;
      }
      onSubmit({ currentPassword, newPassword });
      // Reset fields after submission
      setCurrentPassword("");
      setNewPassword("");
      setRepeatPassword("");
      setError("");
      onClose();
    };

    return (
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <TextField
            label="Current Password"
            type="password"
            fullWidth
            margin="dense"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <TextField
            label="New Password"
            type="password"
            fullWidth
            margin="dense"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <TextField
            label="Repeat New Password"
            type="password"
            fullWidth
            margin="dense"
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
          />
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Change Password
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  // Content for the Profile option remains the same.
  const ProfileContent = () => (
    <Box sx={{ p: 2 }}>
      <List>
        {/* Status Option */}
        <ListItem button onClick={handleStatusMenuOpen}>
          <ListItemText
            primary="Status"
            secondary={userStatus}
            secondaryTypographyProps={{
              style: { textTransform: "capitalize" },
            }}
          />
          <Badge
            variant="dot"
            sx={{
              "& .MuiBadge-dot": {
                backgroundColor: getStatusColor(userStatus),
                width: 12,
                height: 12,
                borderRadius: "50%",
              },
            }}
          />
        </ListItem>

        {/* Personal Message */}
        <ListItem
          button
          onClick={() =>
            handleTextEdit("customMessage", "Edit Message", userCustomMessage)
          }
        >
          <ListItemText
            primary="Personal Message"
            secondary={userCustomMessage || "No message set"}
            secondaryTypographyProps={{
              style: {
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              },
            }}
          />
          <Edit fontSize="small" sx={{ ml: 1 }} />
        </ListItem>

        {/* Bio */}
        <ListItem
          button
          onClick={() => handleTextEdit("bio", "Edit Bio", userBio)}
        >
          <ListItemText
            primary="Bio"
            secondary={userBio || "No bio available"}
            secondaryTypographyProps={{
              style: {
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              },
            }}
          />
          <Edit fontSize="small" sx={{ ml: 1 }} />
        </ListItem>

        {/* Images */}
        <ListItem button onClick={handlePicturesClick}>
          <Box sx={{ width: "100%" }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Images
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 1,
              }}
            >
              <Box
                onClick={handlePicturesClick}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 80,
                  border: "1px dashed gray",
                  borderRadius: 1,
                  cursor: "pointer",
                }}
              >
                <Typography variant="body2">Add image</Typography>
              </Box>
              {orderedImages &&
                orderedImages.map((img, index) => (
                  <Box
                    key={index}
                    component="img"
                    src={img}
                    alt={`User content ${index}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                    sx={{
                      height: 80,
                      width: "100%",
                      borderRadius: 1,
                      objectFit: "cover",
                      border:
                        index === 0
                          ? `2px solid ${theme.palette.primary.main}`
                          : "none",
                      cursor: "grab",
                    }}
                  />
                ))}
            </Box>
          </Box>
        </ListItem>
      </List>

      {/* Status Menu */}
      <Menu
        anchorEl={statusAnchorEl}
        open={Boolean(statusAnchorEl)}
        onClose={handleStatusMenuClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        {["Online", "Away", "Busy", "Offline"].map((status) => (
          <MenuItem
            key={status}
            onClick={() => {
              handleStatusChange(status.toLowerCase());
              handleStatusMenuClose();
            }}
            sx={{ minWidth: 150 }}
          >
            <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: getStatusColor(status),
                  mr: 2,
                }}
              />
              <Typography>{status}</Typography>
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );

  // Settings sub-menu content (no Privacy option)
  const SettingsContent = () => (
    <List>
      <ListItem button onClick={() => handleOptionClick("Change Password")}>
        <ListItemIcon>
          <VpnKey />
        </ListItemIcon>
        <ListItemText primary="Change Password" />
      </ListItem>
      <ListItem
        button
        onClick={() => handleOptionClick("Language Preferences")}
      >
        <ListItemIcon>
          <Language />
        </ListItemIcon>
        <ListItemText primary="Language Preferences" />
      </ListItem>
    </List>
  );

  // Language Preferences content with a switch for English/Spanish.
  const LanguagePreferencesContent = () => (
    <Box
      sx={{
        p: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Typography variant="h6">Language Preferences</Typography>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Typography variant="body2">English</Typography>
        <Switch
          checked={language === "spanish"}
          onChange={handleLanguageChange}
        />
        <Typography variant="body2">Spanish</Typography>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Render the Change Password Dialog */}
      <ChangePasswordDialog
        open={openChangePasswordDialog}
        onClose={() => setOpenChangePasswordDialog(false)}
        onSubmit={handleChangePasswordSubmit}
      />
      <Drawer
        anchor="left"
        open={isDrawerOpen}
        onClose={toggleDrawer}
        sx={{
          "& .MuiDrawer-paper": {
            width: isMobile ? "100%" : 250,
          },
        }}
      >
        <TextFieldDialog
          open={editField.open}
          onClose={() => setEditField({ ...editField, open: false })}
          title={editField.title}
          fieldName={editField.field}
          currentValue={editField.value}
          onSave={handleFieldUpdate}
        />
        {/* Header */}
        <Box
          sx={{
            backgroundColor: "primary.main",
            color: "primary.contrastText",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", p: 2 }}>
            <IconButton
              color="inherit"
              onClick={selectedOption ? handleBackClick : toggleDrawer}
            >
              <ArrowBack />
            </IconButton>
            <Typography variant="h6" sx={{ ml: 1 }}>
              {selectedOption || "Menu"}
            </Typography>
          </Box>
        </Box>

        <Divider />

        {!selectedOption ? (
          <List>
            {["Profile", "Settings", "Notifications", "Contacts"].map(
              (option) => (
                <ListItem
                  button
                  key={option}
                  onClick={() => handleOptionClick(option)}
                >
                  <ListItemIcon sx={{ color: "inherit" }}>
                    {option === "Profile" ? (
                      <Avatar src={userAvatar} />
                    ) : option === "Settings" ? (
                      <Settings />
                    ) : option === "Notifications" ? (
                      <Notifications />
                    ) : (
                      <People />
                    )}
                  </ListItemIcon>
                  <ListItemText primary={option} />
                </ListItem>
              )
            )}
            <Divider />
            <ListItem button onClick={handleLogout}>
              <ListItemIcon sx={{ color: "inherit" }}>
                <ExitToApp />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </List>
        ) : (
          <Box>
            {selectedOption === "Profile" && <ProfileContent />}
            {selectedOption === "Settings" && <SettingsContent />}
            {selectedOption === "Language Preferences" && (
              <LanguagePreferencesContent />
            )}
          </Box>
        )}
      </Drawer>
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleNotificationClose}
      >
        <Alert
          onClose={handleNotificationClose}
          severity={notification.severity}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
};

DrawerMenu.propTypes = {
  isDrawerOpen: PropTypes.bool.isRequired,
  toggleDrawer: PropTypes.func.isRequired,
  isMobile: PropTypes.bool,
  userAvatar: PropTypes.string,
  userStatus: PropTypes.string,
  userCustomMessage: PropTypes.string,
  userBio: PropTypes.string,
  userImages: PropTypes.array,
  handleStatusChange: PropTypes.func,
  handleFieldUpdate: PropTypes.func,
  handlePicturesClick: PropTypes.func.isRequired,
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default DrawerMenu;

import PropTypes from "prop-types";
import { useState, useEffect, useContext } from "react";
import { useTranslation } from "react-i18next";
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
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import BlockIcon from "@mui/icons-material/Block";
import DeleteIcon from "@mui/icons-material/Delete";

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
  InputAdornment,
} from "@mui/material";
import { TextFieldDialog } from "./TextFieldDialog";
import { logoutUser, changePassword } from "../api";
import { ThemeContext } from "../ThemeContext";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { UserCard } from "./UserCard";
import { CircularProgress } from "@mui/material";

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
  contacts,
  blockedContacts,
  onBlockContact,
  onRemoveContact,
  isUploading,
}) => {
  const { i18n, t } = useTranslation();

  const theme = useTheme();

  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    action: "", // "block" or "delete"
    contact: null,
  });

  const { toggleTheme, isDarkMode } = useContext(ThemeContext);

  const [contactsSearch, setContactsSearch] = useState("");
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
  // State for change password dialog
  const [openChangePasswordDialog, setOpenChangePasswordDialog] =
    useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success", // "success" or "error"
  });
  // State for notifications settings:
  const [notificationSettings, setNotificationSettings] = useState({
    notifications: true,
    messages: true,
    friendRequests: true,
    friendOnline: true,
  });

  // Load notification settings from local storage on mount.
  useEffect(() => {
    const storedSettings = localStorage.getItem("notificationSettings");
    if (storedSettings) {
      setNotificationSettings(JSON.parse(storedSettings));
    }
  }, []);

  // Sync local images order with prop changes
  useEffect(() => {
    setOrderedImages(userImages || []);
  }, [userImages]);

  const openConfirmDialog = (action, contact) => {
    setConfirmDialog({ open: true, action, contact });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({ open: false, action: "", contact: null });
  };

  const handleRemoveImage = (indexToRemove) => {
    const newImages = orderedImages.filter(
      (_, index) => index !== indexToRemove
    );
    setOrderedImages(newImages);
    // Update parent's state (if needed)
    handleFieldUpdate("pictures", newImages);
  };

  const handleConfirmAction = () => {
    if (confirmDialog.action === "block") {
      onBlockContact(confirmDialog.contact);
    } else if (confirmDialog.action === "delete") {
      onRemoveContact(confirmDialog.contact);
    }
    closeConfirmDialog();
  };

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
    // If switch is checked, set to Spanish, else English.
    const newLang = event.target.checked ? "es" : "en";
    i18n.changeLanguage(newLang);
  };

  // Handler for submitting a password change
  const handleChangePasswordSubmit = async (data) => {
    try {
      const result = await changePassword(data);
      setNotification({
        open: true,
        message: result.message, // "Password changed successfully."
        severity: "success",
      });
    } catch (error) {
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

  // Handler to update notification settings.
  const handleNotificationSwitchChange = (key, checked) => {
    let updatedSettings;
    if (key === "notifications") {
      if (!checked) {
        // If turning off notifications, force all settings to false.
        updatedSettings = {
          notifications: false,
          messages: false,
          friendRequests: false,
          friendOnline: false,
        };
      } else {
        // Turning notifications on—restore defaults (or you could restore saved values)
        updatedSettings = {
          notifications: true,
          messages: true,
          friendRequests: true,
          friendOnline: true,
        };
      }
    } else {
      // If notifications are off, don't allow toggling individual settings.
      if (!notificationSettings.notifications) return;
      updatedSettings = { ...notificationSettings, [key]: checked };
    }
    setNotificationSettings(updatedSettings);
    localStorage.setItem(
      "notificationSettings",
      JSON.stringify(updatedSettings)
    );
  };

  // Change Password Dialog Component
  const ChangePasswordDialog = ({ open, onClose, onSubmit }) => {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = () => {
      if (newPassword !== repeatPassword) {
        setError(t("passwordNoMatch"));
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
        <DialogTitle>{t("changePassword")}</DialogTitle>
        <DialogContent>
          <TextField
            label={t("currentPassword")}
            type="password"
            fullWidth
            margin="dense"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <TextField
            label={t("newPassword")}
            type="password"
            fullWidth
            margin="dense"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <TextField
            label={"repeatPassword"}
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
          <Button onClick={onClose}>{t("cancel")}</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {t("changePassword")}
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
            primary={t("status")}
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
            handleTextEdit("customMessage", t("editMessage"), userCustomMessage)
          }
        >
          <ListItemText
            primary={t("personalMessage")}
            secondary={userCustomMessage || t("noMessageSet")}
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
          onClick={() => handleTextEdit("bio", t("editBio"), userBio)}
        >
          <ListItemText
            primary="Bio"
            secondary={userBio || t("noBioAvailable")}
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
              {t("images")}
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
                  textAlign: "center",
                }}
              >
                <Typography variant="body2">{t("addImage")}</Typography>
              </Box>
              {orderedImages &&
                orderedImages.map((img, index) => (
                  <Box
                    key={index}
                    sx={{ position: "relative", display: "inline-block" }}
                  >
                    <Box
                      component="img"
                      src={img}
                      alt={`${t("userContent")} ${index}`}
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
                    <IconButton
                      sx={{
                        position: "absolute",
                        top: 2,
                        right: 2,
                        bgcolor: "rgba(0,0,0,0.5)",
                        color: "white",
                        "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
                        p: 0.5,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage(index);
                      }}
                      size="small"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              {isUploading && <CircularProgress />}
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
        {["online", "away", "busy", "offline"].map((status, i) => (
          <MenuItem
            key={i}
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
              <Typography>
                {i === 0
                  ? t("online")
                  : i === 1
                  ? t("away")
                  : i === 2
                  ? t("busy")
                  : t("offline")}
              </Typography>
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
        <ListItemText primary={t("changePassword")} />
      </ListItem>
      <ListItem>
        <ListItemIcon>
          <Language />
        </ListItemIcon>
        {LanguagePreferencesContent()}
      </ListItem>
      <ListItem>{ThemePreferencesContent()}</ListItem>
    </List>
  );

  const LanguagePreferencesContent = () => (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Typography variant="body2">{t("english")}</Typography>
        <Switch
          checked={i18n.language === "es"}
          onChange={handleLanguageChange}
        />
        <Typography variant="body2">{t("spanish")}</Typography>
      </Box>
    </Box>
  );

  const ThemePreferencesContent = () => (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Brightness7Icon />
        <Switch checked={isDarkMode} onChange={toggleTheme} />
        <Brightness4Icon />
      </Box>
    </Box>
  );

  const NotificationsContent = () => (
    <List>
      <ListItem>
        <ListItemText primary={t("notifications")} />
        <Switch
          checked={notificationSettings.notifications}
          onChange={(e) =>
            handleNotificationSwitchChange("notifications", e.target.checked)
          }
        />
      </ListItem>
      <ListItem>
        <ListItemText primary={t("messages")} />
        <Switch
          checked={notificationSettings.messages}
          onChange={(e) =>
            handleNotificationSwitchChange("messages", e.target.checked)
          }
          disabled={!notificationSettings.notifications}
        />
      </ListItem>
      <ListItem>
        <ListItemText primary={t("friendRequests")} />
        <Switch
          checked={notificationSettings.friendRequests}
          onChange={(e) =>
            handleNotificationSwitchChange("friendRequests", e.target.checked)
          }
          disabled={!notificationSettings.notifications}
        />
      </ListItem>
      <ListItem>
        <ListItemText primary={t("friendOnline")} />
        <Switch
          checked={notificationSettings.friendOnline}
          onChange={(e) =>
            handleNotificationSwitchChange("friendOnline", e.target.checked)
          }
          disabled={!notificationSettings.notifications}
        />
      </ListItem>
    </List>
  );

  const ContactsContent = () => {
    // Filter contacts based on the search query.
    const filteredContacts = contacts.filter((contact) =>
      contact.name.toLowerCase().includes(contactsSearch.toLowerCase())
    );

    return (
      <Box>
        <Dialog open={confirmDialog.open} onClose={closeConfirmDialog}>
          <DialogTitle>
            {confirmDialog.action === "block" ? t("block") : t("delete")}
          </DialogTitle>
          <DialogContent>
            <Typography>
              {confirmDialog.action === "block"
                ? `${t("blockA")} ${confirmDialog.contact?.name}?`
                : `${t("deleteA")} ${confirmDialog.contact?.name}?`}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeConfirmDialog}>{t("cancel")}</Button>
            <Button
              onClick={handleConfirmAction}
              variant="contained"
              color="primary"
            >
              {t("confirm")}
            </Button>
          </DialogActions>
        </Dialog>
        <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
          <TextField
            fullWidth
            placeholder={t("search")}
            size="small"
            value={contactsSearch}
            onChange={(e) => setContactsSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconButton size="small">
                    <SearchIcon sx={{ color: "text.secondary" }} />
                  </IconButton>
                </InputAdornment>
              ),
              endAdornment: contactsSearch && (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setContactsSearch("")}
                    size="small"
                  >
                    <CloseIcon sx={{ color: "text.secondary" }} />
                  </IconButton>
                </InputAdornment>
              ),
              sx: {
                backgroundColor: "background.paper",
                borderRadius: "25px",
                "& .MuiOutlinedInput-notchedOutline": { border: "none" },
              },
            }}
          />
        </Box>
        <List sx={{ flexGrow: 1, overflowY: "auto" }}>
          {filteredContacts.map((contact) => (
            <ListItem
              button
              key={contact._id}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <UserCard blockedContacts={blockedContacts} user={contact} />
              <Box>
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    openConfirmDialog("block", contact);
                  }}
                  size="small"
                  color="primary"
                >
                  <BlockIcon />
                </IconButton>
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    openConfirmDialog("delete", contact);
                  }}
                  size="small"
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </ListItem>
          ))}
        </List>
      </Box>
    );
  };

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
              {selectedOption === "Profile"
                ? t("profile")
                : selectedOption === "Settings"
                ? t("settings")
                : selectedOption === "Notifications"
                ? t("notifications")
                : selectedOption === "Contacts"
                ? t("contacts")
                : "Menu"}
            </Typography>
          </Box>
        </Box>

        <Divider />

        {!selectedOption ? (
          <List>
            {["Profile", "Settings", "Notifications", "Contacts"].map(
              (option, i) => (
                <ListItem
                  button
                  key={i}
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
                  <ListItemText
                    primary={
                      i === 0
                        ? t("profile")
                        : i === 1
                        ? t("settings")
                        : i === 2
                        ? t("notifications")
                        : t("contacts")
                    }
                  />
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
            {selectedOption === "Notifications" && <NotificationsContent />}
            {selectedOption === "Contacts" && <ContactsContent />}
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
  contacts: PropTypes.array,
  blockedContacts: PropTypes.array,
  onBlockContact: PropTypes.func,
  onRemoveContact: PropTypes.func,
  isUploading: PropTypes.bool,
};

export default DrawerMenu;

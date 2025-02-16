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
} from "@mui/material";
import { TextFieldDialog } from "./TextFieldDialog";

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
  // State for generic dialog
  const [editField, setEditField] = useState({
    open: false,
    field: "",
    title: "",
    value: "",
  });
  // Local state to manage the order of images
  const [orderedImages, setOrderedImages] = useState(userImages || []);

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
    setSelectedOption(option);
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

  // Drag and drop handlers for reordering images
  const handleDrop = async (e, dropIndex) => {
    e.preventDefault();
    const dragIndex = Number(e.dataTransfer.getData("dragIndex"));
    if (dragIndex === dropIndex) return;

    const newOrder = [...orderedImages];
    const [draggedImage] = newOrder.splice(dragIndex, 1);
    newOrder.splice(dropIndex, 0, draggedImage);
    setOrderedImages(newOrder);

    // Update the parent's state via your API update.
    // Ensure that your updateUserProfile endpoint returns the updated images order.
    await handleFieldUpdate("pictures", newOrder);
  };

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
              {/* "Add image" button always first */}
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
              {/* Render each image as a draggable cell */}
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
                      // The first image gets a border with the theme's primary color.
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

  return (
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
        sx={{ backgroundColor: "primary.main", color: "primary.contrastText" }}
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
          <ListItem button onClick={() => handleOptionClick("Logout")}>
            <ListItemIcon sx={{ color: "inherit" }}>
              <ExitToApp />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      ) : (
        <Box>
          {selectedOption === "Profile" && <ProfileContent />}
          {/* Add other option contents here */}
        </Box>
      )}
    </Drawer>
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
};

export default DrawerMenu;

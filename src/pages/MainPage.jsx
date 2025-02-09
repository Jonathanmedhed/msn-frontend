import PropTypes from "prop-types";
import { useState, useRef } from "react";
import {
  Box,
  CssBaseline,
  Menu,
  MenuItem,
  useMediaQuery,
  TextField,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  Fab,
  Drawer,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
} from "@mui/material";
import { AppBarComponent } from "../components/AppBarComponent";
import { UserProfileBox } from "../components/UserProfileBox";
import { EditPersonalMessageDialog } from "../components/EditPersonalMessageDialog";
import { ChatWindow } from "../components/ChatWindow";
import { UserCard } from "../components/UserCard"; // Assuming UserCard is used for contacts
import { user, contacts } from "../data/mockData"; // Import mock data
import {
  Search as SearchIcon,
  Close as CloseIcon,
  Add,
  Chat,
  AccountCircle,
  Settings,
  ExitToApp,
  Help,
  Notifications,
  People,
} from "@mui/icons-material"; // Import icons
import { SearchUserDialog } from "../components/SearchUserDialog";
import { AddUserDialog } from "../components/AddUserDialog";

export const MainPage = () => {
  const [userProfile, setUserProfile] = useState(user);
  const [contactList] = useState(contacts);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newPersonalMessage, setNewPersonalMessage] = useState(
    user.personalMessage
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const isMobile = useMediaQuery("(max-width: 600px)");
  const searchInputRef = useRef(null);

  // State for dialogs
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isSearchUserDialogOpen, setIsSearchUserDialogOpen] = useState(false);

  // State for drawer visibility
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleEditDialogOpen = () => {
    setNewPersonalMessage(userProfile.personalMessage);
    setIsEditDialogOpen(true);
  };
  const handleEditDialogClose = () => setIsEditDialogOpen(false);
  const handleSavePersonalMessage = () => {
    setUserProfile((prev) => ({
      ...prev,
      personalMessage: newPersonalMessage,
    }));
    handleEditDialogClose();
  };
  const handleDeletePersonalMessage = () => {
    setUserProfile((prev) => ({ ...prev, personalMessage: "" }));
    handleEditDialogClose();
  };
  const handleSearchChange = (event) => setSearchQuery(event.target.value);
  const handleClearSearch = () => {
    setSearchQuery("");
    searchInputRef.current.blur();
  };
  const handleMagnifierClick = () => searchInputRef.current.focus();
  const handleContactSelect = (contact) => {
    setSelectedContact(contact);
  };
  const showBackButton = isMobile && selectedContact !== null;
  const handleBackClick = () => {
    setSelectedContact(null);
  };
  const filteredContacts = contactList.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const handleStatusChange = (status) => {
    setUserProfile((prev) => ({ ...prev, status }));
  };
  const handleBlockContact = (contact) => {
    console.log("Blocking contact:", contact.name);
  };

  // Handle opening and closing dialogs
  const handleAddUserDialogOpen = () => setIsAddUserDialogOpen(true);
  const handleAddUserDialogClose = () => setIsAddUserDialogOpen(false);
  const handleSearchUserDialogOpen = () => setIsSearchUserDialogOpen(true);
  const handleSearchUserDialogClose = () => setIsSearchUserDialogOpen(false);

  // Handle adding a user
  const handleAddUser = (email) => {
    console.log("Adding user with email:", email);
    // Add logic to add the user
  };

  // Handle selecting a user to chat with
  const handleSelectUserToChat = (contact) => {
    setSelectedContact(contact);
    handleSearchUserDialogClose();
  };

  // Toggle drawer visibility
  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  // Handle drawer menu item clicks
  const handleMenuItemClick = (option) => {
    console.log(`Clicked on: ${option}`);
    // Add logic for each option
    switch (option) {
      case "Account":
        console.log("Navigate to Account page");
        break;
      case "Settings":
        console.log("Navigate to Settings page");
        break;
      case "Logout":
        console.log("Logging out...");
        break;
      case "Help":
        console.log("Navigate to Help page");
        break;
      case "Notifications":
        console.log("Navigate to Notifications page");
        break;
      case "Contacts":
        console.log("Navigate to Contacts page");
        break;
      default:
        break;
    }
    toggleDrawer(); // Close the drawer after clicking an option
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100vw",
      }}
    >
      <CssBaseline />
      <AppBarComponent
        isMobile={isMobile}
        showBackButton={showBackButton}
        onBackClick={handleBackClick}
        toggleSidebar={toggleDrawer} // Pass the toggleDrawer function
      />
      <UserProfileBox
        user={isMobile && selectedContact ? selectedContact : userProfile}
        handleMenuOpen={handleMenuOpen}
        handleEditDialogOpen={handleEditDialogOpen}
        isMobile={isMobile}
        isLoggedInUser={!selectedContact || !isMobile}
        onStatusChange={handleStatusChange}
      />
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {["Online", "Away", "Busy", "Offline", "Blocked"].map((status) => (
          <MenuItem key={status} onClick={() => handleStatusChange(status)}>
            {status}
          </MenuItem>
        ))}
      </Menu>
      <EditPersonalMessageDialog
        isEditDialogOpen={isEditDialogOpen}
        handleEditDialogClose={handleEditDialogClose}
        newPersonalMessage={newPersonalMessage}
        setNewPersonalMessage={setNewPersonalMessage}
        handleSavePersonalMessage={handleSavePersonalMessage}
        handleDeletePersonalMessage={handleDeletePersonalMessage}
      />
      <Box
        sx={{
          display: "flex",
          flexGrow: 1,
          overflow: "hidden",
          width: "100%",
        }}
      >
        {/* Sidebar (Contact List) */}
        {(!isMobile || !selectedContact) && (
          <Box
            sx={{
              width: isMobile ? "100%" : "30%",
              minWidth: isMobile ? "100%" : "250px",
              borderRight: "1px solid",
              borderColor: "divider",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box
              sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}
            >
              <TextField
                fullWidth
                placeholder="Search"
                size="small"
                value={searchQuery}
                onChange={handleSearchChange}
                inputRef={searchInputRef}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconButton onClick={handleMagnifierClick} size="small">
                        <SearchIcon sx={{ color: "text.secondary" }} />
                      </IconButton>
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <IconButton onClick={handleClearSearch} size="small">
                        <CloseIcon sx={{ color: "text.secondary" }} />
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: {
                    backgroundColor: "background.paper",
                    borderRadius: "25px",
                    "& .MuiOutlinedInput-notchedOutline": {
                      border: "none",
                    },
                  },
                }}
              />
            </Box>
            <List sx={{ flexGrow: 1, overflowY: "auto" }}>
              {filteredContacts.map((contact, index) => (
                <ListItem
                  button
                  key={index}
                  onClick={() => handleContactSelect(contact)}
                  sx={{
                    backgroundColor:
                      selectedContact?.name === contact.name
                        ? "action.selected"
                        : "inherit",
                  }}
                >
                  <UserCard user={contact} size="md" />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
        {/* Chat Window */}
        {(isMobile && selectedContact) || !isMobile ? (
          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              width: "100%",
              overflow: "hidden",
            }}
          >
            {selectedContact ? (
              <ChatWindow
                selectedContact={selectedContact}
                isMobile={isMobile}
                onBlockContact={handleBlockContact}
              />
            ) : (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                  width: "100%",
                }}
              >
                <h2>Select a contact to start chatting</h2>
              </Box>
            )}
          </Box>
        ) : null}
      </Box>
      {/* Floating Buttons */}
      <Box
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 2,
        }}
      >
        <Fab color="primary" onClick={handleAddUserDialogOpen}>
          <Add />
        </Fab>
        <Fab color="secondary" onClick={handleSearchUserDialogOpen}>
          <Chat />
        </Fab>
      </Box>
      {/* Dialogs */}
      <AddUserDialog
        open={isAddUserDialogOpen}
        onClose={handleAddUserDialogClose}
        onAddUser={handleAddUser}
      />
      <SearchUserDialog
        open={isSearchUserDialogOpen}
        onClose={handleSearchUserDialogClose}
        contacts={contactList}
        onSelectUser={handleSelectUserToChat}
      />
      {/* Drawer */}
      <Drawer
        anchor="left" // Drawer appears from the left
        open={isDrawerOpen} // Controlled by isDrawerOpen state
        onClose={toggleDrawer} // Close drawer when clicking outside or pressing Esc
      >
        <Box
          sx={{
            width: 250, // Width of the drawer
            padding: 2,
          }}
        >
          <Typography variant="h6" sx={{ p: 2 }}>
            Microsoft Messenger
          </Typography>
          <Divider />
          <List>
            {/* Account */}
            <ListItem button onClick={() => handleMenuItemClick("Account")}>
              <ListItemIcon>
                <AccountCircle />
              </ListItemIcon>
              <ListItemText primary="Account" />
            </ListItem>
            {/* Settings */}
            <ListItem button onClick={() => handleMenuItemClick("Settings")}>
              <ListItemIcon>
                <Settings />
              </ListItemIcon>
              <ListItemText primary="Settings" />
            </ListItem>
            {/* Notifications */}
            <ListItem
              button
              onClick={() => handleMenuItemClick("Notifications")}
            >
              <ListItemIcon>
                <Notifications />
              </ListItemIcon>
              <ListItemText primary="Notifications" />
            </ListItem>
            {/* Contacts */}
            <ListItem button onClick={() => handleMenuItemClick("Contacts")}>
              <ListItemIcon>
                <People />
              </ListItemIcon>
              <ListItemText primary="Contacts" />
            </ListItem>
            {/* Help */}
            <ListItem button onClick={() => handleMenuItemClick("Help")}>
              <ListItemIcon>
                <Help />
              </ListItemIcon>
              <ListItemText primary="Help" />
            </ListItem>
            <Divider />
            {/* Logout */}
            <ListItem button onClick={() => handleMenuItemClick("Logout")}>
              <ListItemIcon>
                <ExitToApp />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </Box>
  );
};

MainPage.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
    profilePicture: PropTypes.string.isRequired,
    status: PropTypes.oneOf(["online", "offline", "busy", "blocked"])
      .isRequired,
    personalMessage: PropTypes.string,
  }),
  contacts: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      profilePicture: PropTypes.string.isRequired,
      status: PropTypes.oneOf(["online", "offline", "busy", "blocked"])
        .isRequired,
      personalMessage: PropTypes.string,
    })
  ),
};

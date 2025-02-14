// src/pages/MainPage.jsx
import PropTypes from "prop-types";
import { useState, useRef, useMemo, useEffect } from "react";
import {
  Box,
  CssBaseline,
  Menu,
  MenuItem,
  useMediaQuery,
  Fab,
  CircularProgress,
  Button,
} from "@mui/material";
import { AppBarComponent } from "../components/AppBarComponent";
import { UserProfileBox } from "../components/UserProfileBox";
import { EditPersonalMessageDialog } from "../components/EditPersonalMessageDialog";
import { ChatWindow } from "../components/ChatWindow";
import { Add, Chat } from "@mui/icons-material";
import { SearchUserDialog } from "../components/SearchUserDialog";
import { AddUserDialog } from "../components/AddUserDialog";
import { Sidebar } from "../components/SideBar";
import { DrawerMenu } from "../components/DrawerMenu";
import {
  fetchMainUser,
  fetchUserChats,
  loginUser,
  updateUserProfile,
  uploadProfilePicture,
  uploadPictures,
} from "../api";

export const MainPage = () => {
  // State variables
  const [userProfile, setUserProfile] = useState({});
  const [contactList, setContactList] = useState([]);
  const [chatList, setChatList] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newCustomMessage, setNewCustomMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isSearchUserDialogOpen, setIsSearchUserDialogOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Refs for file inputs (profile picture & multiple pictures)
  const profilePictureInputRef = useRef(null);
  const picturesInputRef = useRef(null);
  const searchInputRef = useRef(null);

  // Media query
  const isMobile = useMediaQuery("(max-width: 600px)");

  // Handler functions for menus and dialogs
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleEditDialogOpen = () => {
    setNewCustomMessage(userProfile.personalMessage);
    setIsEditDialogOpen(true);
  };
  const handleEditDialogClose = () => setIsEditDialogOpen(false);
  const handleSavePersonalMessage = async () => {
    // For example, if you want to update the personal message using updateUserProfile:
    try {
      const updatedData = { customMessage: newCustomMessage };
      const response = await updateUserProfile(userProfile._id, updatedData);
      setUserProfile(response.user);
    } catch (error) {
      console.error("Error updating personal message:", error.message);
    }
    setIsEditDialogOpen(false);
  };
  const handleDeletePersonalMessage = () => {
    setUserProfile((prev) => ({ ...prev, personalMessage: "" }));
    setIsEditDialogOpen(false);
  };
  const handleSearchChange = (event) => setSearchQuery(event.target.value);
  const handleClearSearch = () => {
    setSearchQuery("");
    searchInputRef.current.blur();
  };
  const handleMagnifierClick = () => searchInputRef.current.focus();
  const handleContactSelect = (contact) => {
    setSelectedContact(contact);
    // Optionally update the contact list if needed
    setContactList((prevContacts) =>
      prevContacts.map((c) => (c._id === contact._id ? contact : c))
    );
  };
  const handleStatusChange = async (status) => {
    try {
      const updatedData = { status };
      const response = await updateUserProfile(userProfile._id, updatedData);
      setUserProfile(response.user);
    } catch (error) {
      console.error("Error updating status:", error.message);
    }
  };

  const handleAddUserDialogOpen = () => setIsAddUserDialogOpen(true);
  const handleAddUserDialogClose = () => setIsAddUserDialogOpen(false);
  const handleSearchUserDialogOpen = () => setIsSearchUserDialogOpen(true);
  const handleSearchUserDialogClose = () => setIsSearchUserDialogOpen(false);
  const handleAddUser = (email) =>
    console.log("Adding user with email:", email);
  const handleSelectUserToChat = (contact) => {
    setSelectedContact(contact);
    handleSearchUserDialogClose();
  };
  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);
  const handleMenuItemClick = (option) => {
    console.log(`Clicked on: ${option}`);
    toggleDrawer();
  };

  // File upload handlers:
  const handleProfilePictureClick = () => {
    profilePictureInputRef.current && profilePictureInputRef.current.click();
  };

  const handleProfilePictureChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const response = await uploadProfilePicture(userProfile._id, file);
        // Update the user profile with the new profile picture
        setUserProfile(response.user);
      } catch (error) {
        console.error("Error uploading profile picture:", error.message);
      }
    }
  };

  const handlePicturesClick = () => {
    picturesInputRef.current && picturesInputRef.current.click();
  };

  const handlePicturesChange = async (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      try {
        const filesArray = Array.from(files);
        const response = await uploadPictures(userProfile._id, filesArray);
        // Update the user profile with the new pictures array
        setUserProfile(response.user);
      } catch (error) {
        console.error("Error uploading pictures:", error.message);
      }
    }
  };

  // Generic update handler
  const handleFieldUpdate = async (fieldName, newValue) => {
    try {
      const updatedData = { [fieldName]: newValue };
      const response = await updateUserProfile(userProfile._id, updatedData);
      setUserProfile(response.user);
    } catch (error) {
      console.error(`Error updating ${fieldName}:`, error.message);
    }
  };

  // For demonstration: show a back button on mobile when a contact is selected
  const showBackButton = isMobile && selectedContact !== null;
  const handleBackClick = () => setSelectedContact(null);

  // Compute filtered contacts based on search query
  const filteredContacts = useMemo(
    () =>
      contactList.filter((contact) =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [contactList, searchQuery]
  );

  // Fetch main user data and chats on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const mainUser = await fetchMainUser();
        if (mainUser) {
          setIsLoggedIn(true);
        }
        // Fetch the user's chats
        const userChats = await fetchUserChats(mainUser._id.toString());

        // Map chats to contacts by finding a chat that includes the contact
        const contactsWithChats = mainUser.contacts.map((contact) => {
          const chat = userChats.find((chat) =>
            chat.participants.some(
              (p) => p._id.toString() === contact._id.toString()
            )
          );
          return {
            ...contact,
            chatId: chat ? chat._id : null,
            personalMessage: contact.customMessage || "",
          };
        });
        setChatList(userChats);
        setUserProfile({ ...mainUser });
        setContactList(contactsWithChats);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

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
        toggleSidebar={toggleDrawer}
        isLoggedIn={isLoggedIn}
      />
      <UserProfileBox
        user={isMobile && selectedContact ? selectedContact : userProfile}
        handleMenuOpen={handleMenuOpen}
        handleEditDialogOpen={handleEditDialogOpen}
        isMobile={isMobile}
        isLoggedInUser={!selectedContact || !isMobile}
        onStatusChange={handleStatusChange}
      />

      {/* Temporary Login Button */}
      <Box
        sx={{
          position: "fixed",
          top: 80, // Changed from 16 to 80
          right: 16,
          zIndex: 1000,
        }}
      >
        <Button
          variant="contained"
          onClick={async () => {
            try {
              const response = await loginUser(
                "mainuser@example.com",
                "password123"
              );
              localStorage.setItem("token", response.token);
              localStorage.setItem("userId", response.user.id);
              setIsLoggedIn(true); // Update login state
            } catch (error) {
              console.error("Login failed:", error.message);
            }
          }}
        >
          Temporary Login
        </Button>
      </Box>

      {/* Hidden file inputs */}
      <input
        type="file"
        accept="image/*"
        ref={profilePictureInputRef}
        style={{ display: "none" }}
        onChange={handleProfilePictureChange}
      />
      <input
        type="file"
        accept="image/*"
        multiple
        ref={picturesInputRef}
        style={{ display: "none" }}
        onChange={handlePicturesChange}
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
        newPersonalMessage={newCustomMessage}
        setNewPersonalMessage={setNewCustomMessage}
        handleSavePersonalMessage={handleSavePersonalMessage}
        handleDeletePersonalMessage={handleDeletePersonalMessage}
      />
      <Box
        sx={{ display: "flex", flexGrow: 1, overflow: "hidden", width: "100%" }}
      >
        {(!isMobile || !selectedContact) && (
          <Sidebar
            isMobile={isMobile}
            searchQuery={searchQuery}
            handleSearchChange={handleSearchChange}
            handleMagnifierClick={handleMagnifierClick}
            handleClearSearch={handleClearSearch}
            filteredContacts={filteredContacts}
            selectedContact={selectedContact}
            handleContactSelect={handleContactSelect}
            chatList={chatList}
            isContactList={true}
          />
        )}
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
              loading ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                  }}
                >
                  <CircularProgress />
                </Box>
              ) : (
                <ChatWindow
                  selectedContact={selectedContact}
                  isMobile={isMobile}
                  onBlockContact={(contact) =>
                    console.log("Blocking contact:", contact.name)
                  }
                  onUpdateContact={handleContactSelect}
                  chats={chatList} // Pass the main user's chats here
                />
              )
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
      {(!selectedContact || !isMobile) && (
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
          <Fab
            color="primary"
            onClick={handleAddUserDialogOpen}
            sx={{
              display: { xs: selectedContact ? "none" : "flex", md: "flex" },
            }}
          >
            <Add />
          </Fab>
          <Fab
            color="secondary"
            onClick={handleSearchUserDialogOpen}
            sx={{
              display: { xs: selectedContact ? "none" : "flex", md: "flex" },
            }}
          >
            <Chat />
          </Fab>
        </Box>
      )}
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
      <DrawerMenu
        isDrawerOpen={isDrawerOpen}
        toggleDrawer={toggleDrawer}
        isMobile={isMobile}
        userAvatar={userProfile.profilePicture}
        userStatus={userProfile.status}
        userCustomMessage={userProfile.customMessage}
        userBio={userProfile.bio}
        userImages={userProfile.pictures}
        handleStatusChange={handleStatusChange}
        handleEditCustomMessage={handleEditDialogOpen}
        handleMenuItemClick={handleMenuItemClick}
        handleFieldUpdate={handleFieldUpdate}
        handlePicturesClick={handlePicturesClick}
      />
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

export default MainPage;

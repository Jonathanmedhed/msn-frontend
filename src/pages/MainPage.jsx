// src/pages/MainPage.jsx
import PropTypes from "prop-types";
import { useState, useRef, useMemo, useCallback } from "react";
import {
  Box,
  CssBaseline,
  Menu,
  MenuItem,
  useMediaQuery,
  Fab,
  CircularProgress,
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
  updateUserProfile,
  uploadProfilePicture,
  uploadPictures,
  blockContact,
  removeContact,
  addContact,
} from "../api";
import LoginRegister from "./LoginRegisterPage";
import { useAuth } from "../context/AuthContext";

export const MainPage = () => {
  // Use our custom hook to fetch user data
  const {
    userProfile,
    contactList,
    chatList,
    loading,
    login,
    logout,
    register,
    refetch,
  } = useAuth();

  // State variables
  const [anchorEl, setAnchorEl] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newCustomMessage, setNewCustomMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isSearchUserDialogOpen, setIsSearchUserDialogOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Refs for file inputs (profile picture & multiple pictures)
  const profilePictureInputRef = useRef(null);
  const picturesInputRef = useRef(null);
  const searchInputRef = useRef(null);

  // Media query
  const isMobile = useMediaQuery("(max-width: 600px)");

  // Determine if authenticated (using our custom hook's userProfile)
  const isAuthenticated = Boolean(userProfile);

  // Handler functions for menus and dialogs
  const handleMenuOpen = useCallback(
    (event) => setAnchorEl(event.currentTarget),
    []
  );
  const handleMenuClose = useCallback(() => setAnchorEl(null), []);

  const handleEditDialogOpen = useCallback(() => {
    setNewCustomMessage(userProfile?.customMessage || "");
    setIsEditDialogOpen(true);
  }, [userProfile]);

  const handleEditDialogClose = useCallback(
    () => setIsEditDialogOpen(false),
    []
  );

  const handleSavePersonalMessage = useCallback(async () => {
    try {
      await updateUserProfile(userProfile._id, {
        customMessage: newCustomMessage,
      });
      refetch();
    } catch (error) {
      console.error("Error updating personal message:", error.message);
    }
    setIsEditDialogOpen(false);
  }, [newCustomMessage, userProfile?._id, refetch]);

  const handleDeletePersonalMessage = useCallback(() => {
    setNewCustomMessage("");
    setIsEditDialogOpen(false);
  }, []);

  const handleSearchChange = useCallback(
    (event) => setSearchQuery(event.target.value),
    []
  );
  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    searchInputRef.current.blur();
  }, []);
  const handleMagnifierClick = useCallback(
    () => searchInputRef.current.focus(),
    []
  );
  const handleContactSelect = useCallback(
    (contact) => setSelectedContact(contact),
    []
  );
  const handleStatusChange = useCallback(
    async (status) => {
      try {
        await updateUserProfile(userProfile._id, { status });
        refetch();
      } catch (error) {
        console.error("Error updating status:", error.message);
      }
    },
    [userProfile?._id, refetch]
  );

  const handleAddUserDialogOpen = useCallback(
    () => setIsAddUserDialogOpen(true),
    []
  );
  const handleAddUserDialogClose = useCallback(
    () => setIsAddUserDialogOpen(false),
    []
  );
  const handleSearchUserDialogOpen = useCallback(
    () => setIsSearchUserDialogOpen(true),
    []
  );
  const handleSearchUserDialogClose = useCallback(
    () => setIsSearchUserDialogOpen(false),
    []
  );
  const handleSelectUserToChat = useCallback(
    (contact) => {
      setSelectedContact(contact);
      handleSearchUserDialogClose();
    },
    [handleSearchUserDialogClose]
  );
  const toggleDrawer = useCallback(() => setIsDrawerOpen((prev) => !prev), []);
  const handleMenuItemClick = useCallback(
    (option) => {
      console.log(`Clicked on: ${option}`);
      toggleDrawer();
    },
    [toggleDrawer]
  );

  const handleProfilePictureChange = useCallback(
    async (event) => {
      const file = event.target.files[0];
      if (file) {
        try {
          await uploadProfilePicture(userProfile._id, file);
          refetch();
        } catch (error) {
          console.error("Error uploading profile picture:", error.message);
        }
      }
    },
    [userProfile?._id, refetch]
  );

  const handlePicturesClick = useCallback(() => {
    picturesInputRef.current && picturesInputRef.current.click();
  }, []);

  const handlePicturesChange = useCallback(
    async (event) => {
      const files = event.target.files;
      if (files && files.length > 0) {
        try {
          const filesArray = Array.from(files);
          await uploadPictures(userProfile._id, filesArray);
          refetch();
        } catch (error) {
          console.error("Error uploading pictures:", error.message);
        }
      }
    },
    [userProfile?._id, refetch]
  );

  const handleFieldUpdate = useCallback(
    async (fieldName, newValue) => {
      try {
        await updateUserProfile(userProfile._id, { [fieldName]: newValue });
        refetch();
      } catch (error) {
        console.error(`Error updating ${fieldName}:`, error.message);
      }
    },
    [userProfile?._id, refetch]
  );

  const showBackButton = isMobile && selectedContact !== null;
  const handleBackClick = useCallback(() => setSelectedContact(null), []);

  const filteredContacts = useMemo(
    () =>
      contactList.filter((contact) =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [contactList, searchQuery]
  );

  const handleBlockContact = useCallback(
    async (contact) => {
      try {
        await blockContact(userProfile._id, contact._id);
        refetch();
      } catch (error) {
        console.error("Error blocking contact:", error);
      }
    },
    [userProfile?._id, refetch]
  );

  const handleRemoveContact = useCallback(
    async (contact) => {
      try {
        await removeContact(userProfile._id, contact._id);
        refetch();
      } catch (error) {
        console.error("Error removing contact:", error);
      }
    },
    [userProfile?._id, refetch]
  );

  const handleAddUser = useCallback(
    async (email) => {
      try {
        await addContact(userProfile._id, email);
        refetch();
      } catch (error) {
        console.error("Error adding contact:", error.message);
      }
    },
    [userProfile?._id, refetch]
  );

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
      {loading ? (
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
      ) : !isAuthenticated ? (
        <LoginRegister login={login} register={register} />
      ) : (
        <>
          <AppBarComponent
            isMobile={isMobile}
            showBackButton={showBackButton}
            onBackClick={handleBackClick}
            toggleSidebar={toggleDrawer}
            isLoggedIn={isAuthenticated}
            blockedContacts={userProfile.blockedContacts}
            onLoginClick={() => {}}
            onLogoutSuccess={logout}
          />
          <UserProfileBox
            user={isMobile && selectedContact ? selectedContact : userProfile}
            handleMenuOpen={handleMenuOpen}
            handleEditDialogOpen={handleEditDialogOpen}
            isMobile={isMobile}
            isLoggedInUser={isAuthenticated}
            onStatusChange={handleStatusChange}
            onBlockContact={handleBlockContact}
            blockedContacts={userProfile.blockedContacts}
            onRemoveContact={handleRemoveContact}
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
            blockedContacts={userProfile.blockedContacts}
            onBlockContact={handleBlockContact}
            onRemoveContact={handleRemoveContact}
          />
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
                  onUpdateContact={handleContactSelect}
                  chats={chatList}
                  blockedContacts={userProfile.blockedContacts}
                  onRemoveContact={handleRemoveContact}
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
                  display: {
                    xs: selectedContact ? "none" : "flex",
                    md: "flex",
                  },
                }}
              >
                <Add />
              </Fab>
              <Fab
                color="secondary"
                onClick={handleSearchUserDialogOpen}
                sx={{
                  display: {
                    xs: selectedContact ? "none" : "flex",
                    md: "flex",
                  },
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
            blockedContacts={userProfile.blockedContacts}
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
          <EditPersonalMessageDialog
            isEditDialogOpen={isEditDialogOpen}
            handleEditDialogClose={handleEditDialogClose}
            newPersonalMessage={newCustomMessage}
            setNewPersonalMessage={setNewCustomMessage}
            handleSavePersonalMessage={handleSavePersonalMessage}
            handleDeletePersonalMessage={handleDeletePersonalMessage}
          />
        </>
      )}
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

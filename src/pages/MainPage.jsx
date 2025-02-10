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
} from "@mui/material";
import { AppBarComponent } from "../components/AppBarComponent";
import { UserProfileBox } from "../components/UserProfileBox";
import { EditPersonalMessageDialog } from "../components/EditPersonalMessageDialog";
import { ChatWindow } from "../components/ChatWindow";
import { user, contacts } from "../data/mockData";
import { Add, Chat } from "@mui/icons-material";
import { SearchUserDialog } from "../components/SearchUserDialog";
import { AddUserDialog } from "../components/AddUserDialog";
import { Sidebar } from "../components/SideBar";
import { DrawerMenu } from "../components/DrawerMenu";
import { fetchMainUser } from "../api";

export const MainPage = () => {
  const [userProfile, setUserProfile] = useState(user);
  const [contactList, setContactList] = useState(contacts);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newPersonalMessage, setNewPersonalMessage] = useState(
    user.personalMessage
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const isMobile = useMediaQuery("(max-width: 600px)");
  const searchInputRef = useRef(null);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isSearchUserDialogOpen, setIsSearchUserDialogOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);

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
  const handleContactSelect = (contact) => setSelectedContact(contact);
  const showBackButton = isMobile && selectedContact !== null;
  const handleBackClick = () => setSelectedContact(null);
  const filteredContacts = useMemo(
    () =>
      contactList.filter((contact) =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [contactList, searchQuery]
  );
  const handleStatusChange = (status) =>
    setUserProfile((prev) => ({ ...prev, status }));
  const handleBlockContact = (contact) =>
    console.log("Blocking contact:", contact.name);
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

  // Fetch main user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const mainUser = await fetchMainUser();
        console.log(mainUser);
        // Transform API response to match component needs
        setUserProfile({
          ...mainUser,
          personalMessage: mainUser.customMessage || "",
        });

        // Transform contacts data
        setContactList(
          mainUser.contacts.map((contact) => ({
            ...contact,
            personalMessage: contact.customMessage || "",
          }))
        );
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
              <>
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
                ) : (
                  <ChatWindow
                    selectedContact={selectedContact}
                    isMobile={isMobile}
                    onBlockContact={handleBlockContact}
                  />
                )}
              </>
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
        handleMenuItemClick={handleMenuItemClick}
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

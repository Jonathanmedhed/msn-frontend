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
import { fetchMainUser, fetchUserChats, loginUser } from "../api";

export const MainPage = () => {
  const [userProfile, setUserProfile] = useState({});
  const [contactList, setContactList] = useState([]);
  const [chatList, setChatList] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newPersonalMessage, setNewPersonalMessage] = useState("");
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
  const handleContactSelect = (contact) => {
    setSelectedContact(contact);
    // Optionally update the contact list if needed
    setContactList((prevContacts) =>
      prevContacts.map((c) => (c._id === contact._id ? contact : c))
    );
  };
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
        // Convert mainUser._id to a string to be safe
        const userChats = await fetchUserChats(mainUser._id.toString());

        // Map chats to contacts by finding a chat that includes the contact
        const contactsWithChats = mainUser.contacts.map((contact) => {
          // Ensure both IDs are compared as strings
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
      {console.log("Chat List:", chatList)}
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

      <Box
        sx={{
          position: "fixed",
          top: 16,
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
            } catch (error) {
              console.error("Login failed:", error.message);
            }
          }}
        >
          Temporary Login
        </Button>
      </Box>
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
                  onBlockContact={handleBlockContact}
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

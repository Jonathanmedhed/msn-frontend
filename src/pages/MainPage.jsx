// src/pages/MainPage.jsx
import PropTypes from "prop-types";
import {
  useState,
  useRef,
  useMemo,
  useCallback,
  useContext,
  useEffect,
} from "react";
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
  updateUserProfile,
  uploadPictures,
  blockContact,
  removeContact,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
} from "../api";
import LoginRegister from "./LoginRegisterPage";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import FriendRequestStatusDialog from "../components/FriendRequestStatusDialog";
import { SocketContext } from "../context/SocketContext";

export const MainPage = () => {
  const { t } = useTranslation();

  const { socket } = useContext(SocketContext);

  // Use our custom hook to fetch user data
  const {
    userProfile,
    contactList,
    chatList: initialChatList,
    loading,
    login,
    logout,
    register,
    refetch,
    error,
    requestsSent,
    requestsReceived,
  } = useAuth();

  const [chatList, setChatList] = useState(initialChatList);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newCustomMessage, setNewCustomMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isSearchUserDialogOpen, setIsSearchUserDialogOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [friendRequestDialog, setFriendRequestDialog] = useState({
    open: false,
    status: "", // "success" or "error"
    message: "",
  });
  const [isUploading, setIsUploading] = useState(false);

  // Global socket listener: join every chat room in the chatList.
  // This will ensure that the socket receives newMessage events for every chat.
  useEffect(() => {
    if (!socket) return;
    console.log("Joining all chat rooms...");
    chatList.forEach((chat) => {
      socket.emit("joinChat", { chatId: chat._id });
      console.log(`Joined chat room: ${chat._id}`);
    });
  }, [socket, chatList]);

  // Global socket listener to update chats when new messages are received (for all chats)
  useEffect(() => {
    if (!socket) return;
    console.log("Setting up global socket listener in MainPage");
    const handleNewMessage = (newMessage) => {
      console.log("MainPage received new message:", newMessage);
      setChatList((prevChats) =>
        prevChats.map((chat) => {
          if (chat._id === newMessage.chat) {
            console.log(
              `Updating chat ${chat._id} with new lastMessage:`,
              newMessage
            );
            return { ...chat, lastMessage: newMessage };
          }
          return chat;
        })
      );
    };

    const handleMessageStatus = (updatedMessage) => {
      console.log("MainPage received message status update:", updatedMessage);
      setChatList((prevChats) =>
        prevChats.map((chat) => {
          if (chat._id === updatedMessage.chat) {
            // Optionally update the lastMessage status if it matches
            if (
              chat.lastMessage &&
              chat.lastMessage._id === updatedMessage._id
            ) {
              return { ...chat, lastMessage: updatedMessage };
            }
          }
          return chat;
        })
      );
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("messageStatus", handleMessageStatus);

    return () => {
      console.log("Cleaning up global socket listener in MainPage");
      socket.off("newMessage", handleNewMessage);
      socket.off("messageStatus", handleMessageStatus);
    };
  }, [socket]);

  // Ensure that when the initial chatList changes (for example, on login or refetch),
  // we update our local chatList state.
  useEffect(() => {
    setChatList(initialChatList);
  }, [initialChatList]);

  // Refs for file inputs (profile picture & multiple pictures)
  const picturesInputRef = useRef(null);
  const searchInputRef = useRef(null);

  // Media query
  const isMobile = useMediaQuery("(max-width: 600px)");

  // Determine if authenticated (using our custom hook's userProfile)
  const isAuthenticated = Boolean(userProfile);

  const closeFriendRequestDialog = useCallback(() => {
    setFriendRequestDialog({ open: false, status: "", message: "" });
  }, []);

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

  const handlePicturesClick = useCallback(() => {
    if (!isUploading && picturesInputRef.current) {
      picturesInputRef.current.click();
    }
  }, [isUploading]);

  // Update your handlePicturesChange to ensure the input is cleared and blurred.
  const handlePicturesChange = useCallback(
    async (event) => {
      const files = event.target.files;
      if (files && files.length > 0) {
        setIsUploading(true);
        try {
          const filesArray = Array.from(files);
          await uploadPictures(userProfile._id, filesArray);
          refetch();
        } catch (error) {
          console.error("Error uploading pictures:", error.message);
        }
        setIsUploading(false);
      }
      // Clear the file input so the same file can be selected again.
      event.target.value = "";
      // Optionally, remove focus from the input.
      event.target.blur();
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

  // Memoize the search query itself
  const memoizedSearchQuery = useMemo(() => searchQuery, [searchQuery]);

  const filteredContacts = useMemo(
    () =>
      contactList.filter((contact) =>
        contact.name.toLowerCase().includes(memoizedSearchQuery.toLowerCase())
      ),
    [contactList, memoizedSearchQuery]
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

  const handleSendFriendRequest = useCallback(
    async (email) => {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setFriendRequestDialog({
          open: true,
          status: "error",
          message: t("invalidEmailFormat"),
        });
        return;
      }
      try {
        // Assume sendFriendRequest returns a promise that rejects
        // if the email is not found in the database.
        await sendFriendRequest(userProfile._id, email);
        setFriendRequestDialog({
          open: true,
          status: "success",
          message: t("requestSent"),
        });
        refetch();
      } catch (error) {
        setFriendRequestDialog({
          open: true,
          status: "error",
          message: error.message || t("errorSendingRequest"),
        });
      }
    },
    [userProfile?._id, refetch, t]
  );

  const handleAddUser = useCallback(
    async (email) => {
      try {
        await handleSendFriendRequest(email);
      } catch (error) {
        console.error("Error sending friend request:", error.message);
      }
    },
    [handleSendFriendRequest]
  );

  const handleAcceptRequest = async (user) => {
    try {
      await acceptFriendRequest(user._id);
      refetch();
    } catch (error) {
      console.error("Error accepting friend request:", error.message);
    }
  };

  const handleRejectRequest = async (user) => {
    try {
      await rejectFriendRequest(user._id);
      refetch();
    } catch (error) {
      console.error("Error rejecting friend request:", error.message);
    }
  };

  const handleCancelRequest = async (user) => {
    try {
      await cancelFriendRequest(user._id);
      refetch();
    } catch (error) {
      console.error("Error canceling friend request:", error.message);
    }
  };

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          justifyContent: "center",
          alignItems: "center",
          p: 2,
        }}
      >
        <CssBaseline />
        <h2>{t("OopsAnErrorOccurred")}</h2>
        <p>{error.message || t("somethingWentWrong.")}</p>
        <Button variant="contained" onClick={refetch}>
          {t("tryAgain")}
        </Button>
      </Box>
    );
  }
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
          <FriendRequestStatusDialog
            open={friendRequestDialog.open}
            status={friendRequestDialog.status}
            message={friendRequestDialog.message}
            onClose={closeFriendRequestDialog}
          />
          <AppBarComponent
            isMobile={isMobile}
            showBackButton={showBackButton}
            onBackClick={handleBackClick}
            toggleSidebar={toggleDrawer}
            isLoggedIn={isAuthenticated}
            blockedContacts={userProfile.blockedContacts}
            onLoginClick={() => {}}
            logout={logout}
          />
          <UserProfileBox
            user={isMobile && selectedContact ? selectedContact : userProfile}
            handleMenuOpen={handleMenuOpen}
            handleEditDialogOpen={handleEditDialogOpen}
            isMobile={isMobile}
            isLoggedInUser={isAuthenticated && !selectedContact}
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
            {["online", "away", "busy", "offline"].map((status, i) => (
              <MenuItem key={i} onClick={() => handleStatusChange(status)}>
                {i === 0
                  ? t("online")
                  : i === 1
                  ? t("away")
                  : i === 2
                  ? t("busy")
                  : t("offline")}
              </MenuItem>
            ))}
          </Menu>
          {(isMobile && !selectedContact) || !isMobile ? (
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
              requestsReceived={requestsReceived}
              requestsSent={requestsSent}
              onAcceptRequest={handleAcceptRequest}
              onRejectRequest={handleRejectRequest}
              onCancelRequest={handleCancelRequest}
            />
          ) : null}
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
                  <h2>
                    {contactList?.lengh > 0
                      ? t("selectAcontactToStartChatting")
                      : t("addAcontactToStartChatting")}
                  </h2>
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
            onAddUser={handleAddUser} // This now sends a friend request
          />
          <SearchUserDialog
            open={isSearchUserDialogOpen}
            onClose={handleSearchUserDialogClose}
            contacts={contactList}
            onSelectUser={handleSelectUserToChat}
            blockedContacts={userProfile.blockedContacts}
          />
          <DrawerMenu
            blockedContacts={userProfile.blockedContacts}
            contacts={contactList}
            isDrawerOpen={isDrawerOpen}
            toggleDrawer={toggleDrawer}
            isMobile={isMobile}
            userAvatar={
              userProfile.pictures && userProfile.pictures.length > 0
                ? userProfile.pictures[0]
                : ""
            }
            userStatus={userProfile.status}
            userCustomMessage={userProfile.customMessage}
            userBio={userProfile.bio}
            userImages={userProfile.pictures}
            handleStatusChange={handleStatusChange}
            handleEditCustomMessage={handleEditDialogOpen}
            handleMenuItemClick={handleMenuItemClick}
            handleFieldUpdate={handleFieldUpdate}
            handlePicturesClick={handlePicturesClick}
            isUploading={isUploading}
            onBlockContact={handleBlockContact}
            onRemoveContact={handleRemoveContact}
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
      {/* Hidden file input */}
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
  userProfile: PropTypes.shape({
    name: PropTypes.string.isRequired,
    profilePicture: PropTypes.string.isRequired,
    status: PropTypes.oneOf(["online", "offline", "busy", "blocked"])
      .isRequired,
    customMessage: PropTypes.string,
  }),
  contacts: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      profilePicture: PropTypes.string.isRequired,
      status: PropTypes.oneOf(["online", "offline", "busy", "blocked"])
        .isRequired,
      customMessage: PropTypes.string,
    })
  ),
};

export default MainPage;

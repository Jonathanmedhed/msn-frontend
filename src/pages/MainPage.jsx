import PropTypes from "prop-types";
import {
  useState,
  useRef,
  useMemo,
  useCallback,
  useContext,
  useEffect,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
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
  updateUserStatus,
} from "../api";
import LoginRegister from "./LoginRegisterPage";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import FriendRequestStatusDialog from "../components/FriendRequestStatusDialog";
import { SocketContext } from "../context/SocketContext";
import { LocalNotifications } from "@capacitor/local-notifications";

export const MainPage = () => {
  const { t } = useTranslation();

  const { socket } = useContext(SocketContext);

  const queryClient = useQueryClient();

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

  // Sync with auth data changes
  useEffect(() => {
    setChatList(initialChatList);
  }, [initialChatList]);

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

  useEffect(() => {
    if (socket && userProfile?._id) {
      // Join user's presence channel
      socket.emit("joinUser", userProfile._id);
      console.log("Joined user channel:", userProfile._id);
    }
  }, [socket, userProfile?._id]);

  // Global socket listener to update chats when new messages are received (for all chats)
  useEffect(() => {
    if (!socket) return;
    const handleNewMessage = (newMessage) => {
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
      // Show a notification if the message is from someone else.
      const currentUserId = localStorage.getItem("userId");
      if (newMessage.sender && newMessage.sender._id !== currentUserId) {
        // If the message has attachments, use "Attachment" as snippet.
        let snippet = newMessage.content;
        if (newMessage.attachments && newMessage.attachments.length > 0) {
          snippet = "Attachment";
        } else if (snippet && snippet.length > 20) {
          snippet = `${snippet.substring(0, 20)}...`;
        }
        triggerNotification(
          newMessage.sender.name,
          snippet,
          newMessage.sender.profilePicture
        );
      }
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

    // Listen for user status changes (to update contacts in sidebar, etc.)
    const handleUserStatusChange = (data) => {
      console.log("[Socket] userStatusChange event received:", data);

      const currentUserId = localStorage.getItem("userId");
      // Don't notify for self-status changes
      if (data.userId === currentUserId) return;

      // Get current data before update
      const currentData = queryClient.getQueryData(["userData"]);
      const oldContact = currentData?.contactList?.find(
        (c) => c._id === data.userId
      );

      // Only notify if contact exists and status changed meaningfully
      if (oldContact && oldContact.status !== data.status) {
        if (data.status === "online") {
          triggerStatusNotification(oldContact.name, "connected");
        } else if (data.status === "offline") {
          triggerStatusNotification(oldContact.name, "disconnected");
        }
      }

      // Update query cache
      queryClient.setQueryData(["userData"], (oldData) => {
        if (!oldData) return oldData;

        const updatedContacts = oldData.contactList.map((contact) =>
          contact._id === data.userId
            ? { ...contact, status: data.status }
            : contact
        );

        const updatedChats = oldData.chatList.map((chat) => ({
          ...chat,
          participants: chat.participants.map((p) =>
            p._id === data.userId ? { ...p, status: data.status } : p
          ),
        }));

        return {
          ...oldData,
          contactList: updatedContacts,
          chatList: updatedChats,
        };
      });
    };

    const handleFriendRequestAccepted = (data) => {
      console.log("[Socket] friendRequestAccepted:", data);

      queryClient.setQueryData(["userData"], (oldData) => {
        if (!oldData) return oldData;

        // Add new contact
        const updatedContacts = [...oldData.contactList];
        if (!updatedContacts.some((c) => c._id === data.newContact._id)) {
          updatedContacts.push(data.newContact);
        }

        // Remove from requests
        const updatedReceived = oldData.requestsReceived.filter(
          (r) => r._id !== data.removedRequestId
        );

        return {
          ...oldData,
          contactList: updatedContacts,
          requestsReceived: updatedReceived,
        };
      });
    };

    const handleFriendRequestUpdate = (data) => {
      queryClient.invalidateQueries(["userData"]); // Force refresh of all user data
      if (data.type === "accepted" && data.newChat) {
        queryClient.setQueryData(["chats"], (old) => [...old, data.newChat]);
      }
    };

    const handleNewFriendRequest = (data) => {
      console.log("[Socket] newFriendRequest:", data);

      queryClient.setQueryData(["userData"], (oldData) => {
        if (!oldData) return oldData;

        // For received requests
        if (data.type === "received") {
          const exists = oldData.requestsReceived.some(
            (r) => r._id === data.request._id
          );

          if (!exists) {
            return {
              ...oldData,
              requestsReceived: [...oldData.requestsReceived, data.request],
            };
          }
        }

        // For sent requests (store just IDs)
        if (data.type === "sent") {
          const exists = oldData.requestsSent.includes(data.request);
          if (!exists) {
            return {
              ...oldData,
              requestsSent: [...oldData.requestsSent, data.request],
            };
          }
        }

        return oldData;
      });
    };

    socket.on("userStatusChange", handleUserStatusChange);
    socket.on("friendRequestAccepted", handleFriendRequestAccepted);
    socket.on("friendRequestUpdate", handleFriendRequestUpdate);
    socket.on("newFriendRequest", handleNewFriendRequest);
    socket.on("newMessage", handleNewMessage);
    socket.on("messageStatus", handleMessageStatus);
    socket.on("userStatusChange", handleUserStatusChange);

    return () => {
      console.log("Cleaning up global socket listener in MainPage");
      socket.off("friendRequestAccepted", handleFriendRequestAccepted);
      socket.off("friendRequestUpdate", handleFriendRequestUpdate);
      socket.off("newFriendRequest", handleNewFriendRequest);
      socket.off("newMessage", handleNewMessage);
      socket.off("messageStatus", handleMessageStatus);
      socket.off("userStatusChange", handleUserStatusChange);
    };
  }, [socket]);

  // Ensure that when the initial chatList changes (for example, on login or refetch),
  // we update our local chatList state.
  useEffect(() => {
    setChatList(initialChatList);
  }, [initialChatList]);

  // Function to trigger a notification using Capacitor LocalNotifications
  const triggerNotification = async (senderName, snippet, senderAvatar) => {
    try {
      const permission = await LocalNotifications.requestPermissions();
      if (permission.display === "granted") {
        await LocalNotifications.schedule({
          notifications: [
            {
              id: Date.now(),
              title: `Message received from ${senderName}`,
              body: snippet,
              schedule: { at: new Date(Date.now() + 1000) },
              // Optionally add an icon or attachment if supported
              sound: null,
              attachments: senderAvatar ? [{ url: senderAvatar }] : [],
              actionTypeId: "",
              extra: {},
            },
          ],
        });
      } else {
        // Fallback using the Web Notification API
        if ("Notification" in window) {
          if (Notification.permission !== "granted") {
            await Notification.requestPermission();
          }
          if (Notification.permission === "granted") {
            new Notification(`Message received from ${senderName}`, {
              body: snippet,
              icon: senderAvatar || "default_icon.png",
            });
          }
        }
      }
    } catch (error) {
      console.error("Failed to schedule notification:", error);
    }
  };

  const triggerStatusNotification = async (contactName, statusType) => {
    const title =
      statusType === "connected"
        ? `${contactName} ${t("isNowOnline")}`
        : `${contactName} ${t("isOffline")}`;

    try {
      const permission = await LocalNotifications.requestPermissions();
      if (permission.display === "granted") {
        await LocalNotifications.schedule({
          notifications: [
            {
              id: Date.now(),
              title: title,
              schedule: { at: new Date(Date.now() + 1000) },
              sound: null,
              actionTypeId: "",
              extra: {},
            },
          ],
        });
      } else if ("Notification" in window) {
        if (Notification.permission !== "granted") {
          await Notification.requestPermission();
        }
        if (Notification.permission === "granted") {
          new Notification(title);
        }
      }
    } catch (error) {
      console.error("Status notification error:", error);
    }
  };

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
        // Use the dedicated status endpoint
        await updateUserStatus(userProfile._id, status);

        // Optional: Only refetch if needed for other components
        refetch();

        // Socket will handle real-time updates through the 'userStatusChange' event
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

        queryClient.setQueryData(["userData"], (oldData) => ({
          ...oldData,
          requestsSent: [...oldData.requestsSent, email],
        }));

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
    [userProfile?._id, refetch, t, queryClient]
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

      // Optimistic update
      queryClient.setQueryData(["userData"], (oldData) => ({
        ...oldData,
        requestsReceived: oldData.requestsReceived.filter(
          (r) => r._id !== user._id
        ),
      }));

      // Socket will handle the rest via the 'friendRequestAccepted' event
    } catch (error) {
      console.error("Error accepting friend request:", error.message);
      // Rollback on error
      queryClient.invalidateQueries(["userData"]);
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

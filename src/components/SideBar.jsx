import PropTypes from "prop-types";
import {
  Box,
  Divider,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListSubheader,
  TextField,
  Fab,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import { UserCard } from "./UserCard";
import { Search as SearchIcon, Close as CloseIcon } from "@mui/icons-material";
import { memo } from "react";
import { useTranslation } from "react-i18next";

export const Sidebar = memo(
  ({
    isMobile,
    searchQuery,
    handleSearchChange,
    handleMagnifierClick,
    handleClearSearch,
    filteredContacts,
    selectedContact,
    handleContactSelect,
    chatList,
    isContactList,
    blockedContacts,
    onRemoveContact,
    onBlockContact,
    requestsReceived,
    requestsSent,
    onAcceptRequest,
    onRejectRequest,
    onCancelRequest,
    onAddUser,
  }) => {
    const { t } = useTranslation();
    return (
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
        <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
          <TextField
            fullWidth
            placeholder={t("search")}
            size="small"
            value={searchQuery}
            onChange={handleSearchChange}
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
                "& .MuiOutlinedInput-notchedOutline": { border: "none" },
              },
            }}
          />
        </Box>
        <List sx={{ flexGrow: 1, overflowY: "auto" }}>
          {!isMobile && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "flex-end",
              }}
            >
              <Fab
                color="primary"
                onClick={onAddUser}
                sx={{
                  transform: "scale(0.6)", // Shrinks to 50% size
                  minHeight: "unset", // Prevents default sizing
                  display: {
                    xs: selectedContact ? "none" : "flex",
                    md: "flex",
                  },
                }}
              >
                <Add sx={{ fontSize: 30 }} /> {/* Adjust icon size if needed */}
              </Fab>
            </Box>
          )}
          {chatList.map((chat) => {
            // Find the contact for this chat
            const currentUserId = localStorage.getItem("userId");
            const contactForChat = filteredContacts.find((contact) =>
              chat.participants.some(
                (p) =>
                  (p._id ? p._id.toString() : p.toString()) ===
                    contact._id.toString() &&
                  contact._id.toString() !== currentUserId
              )
            );
            console.log(chat);
            if (!contactForChat) return null; // Skip chats without matching contacts

            return (
              <ListItem
                button
                key={chat._id}
                onClick={() => handleContactSelect(contactForChat)}
                sx={{
                  backgroundColor:
                    selectedContact?._id === contactForChat._id
                      ? "action.selected"
                      : "inherit",
                }}
              >
                <UserCard
                  user={contactForChat}
                  size="md"
                  chat={chat}
                  isContactList={isContactList}
                  blockedContacts={blockedContacts}
                  title="SideBar Card"
                  onRemoveContact={onRemoveContact}
                  onBlockContact={onBlockContact}
                />
              </ListItem>
            );
          })}
        </List>
        <Divider />

        {/* Friend Requests Received */}
        {requestsReceived && requestsReceived.length > 0 && (
          <>
            <ListSubheader>Friend Requests Received</ListSubheader>
            {requestsReceived.map((request) => {
              const chatForRequest = chatList.find((chat) =>
                chat.participants.some(
                  (p) => p._id.toString() === request._id.toString()
                )
              );
              return (
                <ListItem
                  button
                  key={request._id}
                  //onClick={() => handleContactSelect(request)}
                >
                  <UserCard
                    user={request}
                    size="md"
                    chat={chatForRequest}
                    isContactList={isContactList}
                    blockedContacts={blockedContacts}
                    title="Friend Request Received"
                    onRemoveContact={onRemoveContact}
                    onBlockContact={onBlockContact}
                    receivedRequest={true}
                    onAcceptRequest={onAcceptRequest}
                    onRejectRequest={onRejectRequest}
                    onCancelRequest={onCancelRequest}
                  />
                </ListItem>
              );
            })}
          </>
        )}
        {/* Friend Requests Sent */}
        {requestsSent && requestsSent.length > 0 && (
          <>
            <ListSubheader>{t("friendRequestsSent")}</ListSubheader>
            {requestsSent.map((request) => (
              <ListItem button key={request._id}>
                <UserCard
                  user={request}
                  size="md"
                  isContactList={isContactList}
                  blockedContacts={blockedContacts}
                  title="Friend Request Sent"
                  onRemoveContact={onRemoveContact}
                  onBlockContact={onBlockContact}
                  sentRequest={true}
                  onAcceptRequest={onAcceptRequest}
                  onRejectRequest={onRejectRequest}
                  onCancelRequest={onCancelRequest}
                />
              </ListItem>
            ))}
          </>
        )}
      </Box>
    );
  }
);

Sidebar.propTypes = {
  isMobile: PropTypes.bool.isRequired,
  searchQuery: PropTypes.string.isRequired,
  handleSearchChange: PropTypes.func.isRequired,
  handleMagnifierClick: PropTypes.func.isRequired,
  handleClearSearch: PropTypes.func.isRequired,
  isContactList: PropTypes.bool,
  blockedContacts: PropTypes.array,
  requestsReceived: PropTypes.array,
  requestsSent: PropTypes.array,
  onRemoveContact: PropTypes.func,
  onBlockContact: PropTypes.func,
  onAcceptRequest: PropTypes.func,
  onRejectRequest: PropTypes.func,
  onCancelRequest: PropTypes.func,
  onAddUser: PropTypes.func,
  filteredContacts: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      email: PropTypes.string,
      profilePicture: PropTypes.string.isRequired,
      bio: PropTypes.string,
      customMessage: PropTypes.string,
      status: PropTypes.string.isRequired,
      isOnline: PropTypes.bool,
      lastSeen: PropTypes.instanceOf(Date),
    })
  ).isRequired,
  selectedContact: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string,
    profilePicture: PropTypes.string.isRequired,
    bio: PropTypes.string,
    customMessage: PropTypes.string,
    status: PropTypes.string.isRequired,
    isOnline: PropTypes.bool,
    lastSeen: PropTypes.instanceOf(Date),
  }),
  handleContactSelect: PropTypes.func.isRequired,
  chatList: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      participants: PropTypes.arrayOf(
        PropTypes.shape({
          _id: PropTypes.any.isRequired,
        })
      ).isRequired,
      messages: PropTypes.arrayOf(
        PropTypes.shape({
          content: PropTypes.string.isRequired,
          // add other message fields if needed
        })
      ),
    })
  ).isRequired,
};

Sidebar.defaultProps = {
  selectedContact: null,
};

Sidebar.displayName = "Sidebar";

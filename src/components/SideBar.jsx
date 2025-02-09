import PropTypes from "prop-types";
import {
  Box,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  TextField,
} from "@mui/material";
import { UserCard } from "./UserCard";
import { Search as SearchIcon, Close as CloseIcon } from "@mui/icons-material";

export const Sidebar = ({
  isMobile,
  searchQuery,
  handleSearchChange,
  handleMagnifierClick,
  handleClearSearch,
  filteredContacts,
  selectedContact,
  handleContactSelect,
}) => (
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
        placeholder="Search"
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
);

Sidebar.propTypes = {
  isMobile: PropTypes.bool.isRequired,
  searchQuery: PropTypes.string.isRequired,
  handleSearchChange: PropTypes.func.isRequired,
  handleMagnifierClick: PropTypes.func.isRequired,
  handleClearSearch: PropTypes.func.isRequired,
  filteredContacts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      profilePicture: PropTypes.string.isRequired,
      bio: PropTypes.string,
      customMessage: PropTypes.string,
      status: PropTypes.string.isRequired,
      isOnline: PropTypes.bool.isRequired,
      lastSeen: PropTypes.instanceOf(Date).isRequired,
    })
  ).isRequired,
  selectedContact: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    profilePicture: PropTypes.string.isRequired,
    bio: PropTypes.string,
    customMessage: PropTypes.string,
    status: PropTypes.string.isRequired,
    isOnline: PropTypes.bool.isRequired,
    lastSeen: PropTypes.instanceOf(Date).isRequired,
  }),
  handleContactSelect: PropTypes.func.isRequired,
};

Sidebar.defaultProps = {
  selectedContact: null,
};

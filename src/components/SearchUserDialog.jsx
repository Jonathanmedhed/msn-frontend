import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  List,
  ListItem,
  Box,
} from "@mui/material";
import PropTypes from "prop-types";
import { UserCard } from "./UserCard"; // Import the UserCard component

export const SearchUserDialog = ({ open, onClose, contacts, onSelectUser }) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter contacts based on search query
  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Start Chat</DialogTitle>
      <DialogContent>
        {/* List of Contacts */}
        <Box
          sx={{
            maxHeight: "300px", // Limit height to show only 4 contacts
            overflowY: "auto", // Make the rest scrollable
            marginBottom: 2, // Add space between the list and the search box
          }}
        >
          <List>
            {filteredContacts.map((contact) => (
              <ListItem
                button
                key={contact.name}
                onClick={() => onSelectUser(contact)}
                sx={{ padding: 0 }} // Remove default padding
              >
                {/* Use the UserCard component with adjusted text size */}
                <UserCard
                  user={contact}
                  size="small"
                  avatarSizeMultiplier={0.95}
                  sx={{
                    "& .MuiTypography-h6": {
                      fontSize: "0.50rem", // Reduce user name text size
                    },
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Search Box at the Bottom */}
        <TextField
          fullWidth
          label="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

SearchUserDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  contacts: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      profilePicture: PropTypes.string.isRequired,
      status: PropTypes.oneOf(["online", "offline", "busy", "blocked"])
        .isRequired,
    })
  ).isRequired,
  onSelectUser: PropTypes.func.isRequired,
};

import { List, ListItem, Typography, Button, Box } from "@mui/material";
import { UserCard } from "./UserCard";
import { contacts } from "../data/mockData"; // Import mock contacts

export const ContactList = ({ handleContactSelect, onAddContact }) => (
  <List>
    {contacts.length > 0 ? (
      contacts.map((contact) => (
        <ListItem
          button
          key={contact.id}
          onClick={() => handleContactSelect(contact)}
        >
          <UserCard user={contact} size="small" />
        </ListItem>
      ))
    ) : (
      <Box sx={{ textAlign: "center", p: 2 }}>
        <Typography variant="body1" color="textSecondary">
          No contacts available
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={onAddContact}
          sx={{ mt: 1 }}
        >
          Add Contact
        </Button>
      </Box>
    )}
  </List>
);

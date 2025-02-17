import PropTypes from "prop-types";
import { Box } from "@mui/material";
import { UserCard } from "./UserCard";

export const UserProfileBox = ({
  user,
  handleMenuOpen,
  handleEditDialogOpen,
  isLoggedInUser,
  onStatusChange,
  onBlockContact,
  blockedContacts,
  onRemoveContact,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        p: 2,
        borderBottom: "1px solid",
        borderColor: "divider", // Use theme's divider color
        backgroundColor: "background.paper", // Use theme's paper color
      }}
    >
      <UserCard
        user={user}
        isLoggedInUser={isLoggedInUser} // Show arrow button only for logged-in user
        showEditIcon={isLoggedInUser} // Show edit button only for logged-in user
        alwaysShowPersonalMessage // Always show the personal message section
        onArrowClick={handleMenuOpen}
        onEditClick={handleEditDialogOpen}
        largeStatus={true} // Make the status circle 1.5 times bigger
        onStatusChange={onStatusChange}
        size="lg"
        onBlockContact={onBlockContact}
        blockedContacts={blockedContacts}
        title="UserProfileBox Card"
        onRemoveContact={onRemoveContact}
      />
    </Box>
  );
};

UserProfileBox.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
    profilePicture: PropTypes.string.isRequired,
    status: PropTypes.oneOf(["online", "away", "busy", "offline"]).isRequired,
    personalMessage: PropTypes.string,
  }).isRequired,
  handleMenuOpen: PropTypes.func.isRequired,
  handleEditDialogOpen: PropTypes.func.isRequired,
  isLoggedInUser: PropTypes.bool.isRequired,
  onStatusChange: PropTypes.func.isRequired,
  onBlockContact: PropTypes.func.isRequired,
  onRemoveContact: PropTypes.func.isRequired,
  blockedContacts: PropTypes.array,
};

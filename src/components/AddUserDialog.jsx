import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";

export const AddUserDialog = ({ open, onClose, onAddUser }) => {
  const [email, setEmail] = useState("");
  const { t } = useTranslation();

  const handleAddUser = () => {
    onAddUser(email); // Call the parent function to add the user
    setEmail(""); // Clear the input
    onClose(); // Close the dialog
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add User by Email</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleAddUser} color="primary">
          {t("add")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

AddUserDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onAddUser: PropTypes.func.isRequired,
};

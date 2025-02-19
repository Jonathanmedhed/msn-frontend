import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";

export const EditPersonalMessageDialog = ({
  isEditDialogOpen,
  handleEditDialogClose,
  newPersonalMessage,
  setNewPersonalMessage,
  handleSavePersonalMessage,
  handleDeletePersonalMessage,
}) => (
  <Dialog open={isEditDialogOpen} onClose={handleEditDialogClose}>
    <DialogTitle>Edit Personal Message</DialogTitle>
    <DialogContent>
      <TextField
        fullWidth
        value={newPersonalMessage}
        onChange={(e) => setNewPersonalMessage(e.target.value)}
        placeholder="Enter personal message"
        sx={{ mt: 2 }}
      />
    </DialogContent>
    <DialogActions>
      <Button onClick={handleDeletePersonalMessage} color="error">
        Delete
      </Button>
      <Button onClick={handleEditDialogClose}>Cancel</Button>
      <Button onClick={handleSavePersonalMessage} color="primary">
        Save
      </Button>
    </DialogActions>
  </Dialog>
);

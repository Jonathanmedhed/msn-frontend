import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";

export const EditPersonalMessageDialog = ({
  isEditDialogOpen,
  handleEditDialogClose,
  newPersonalMessage,
  setNewPersonalMessage,
  handleSavePersonalMessage,
  handleDeletePersonalMessage,
}) => {
  const { t } = useTranslation();

  return (
    <Dialog open={isEditDialogOpen} onClose={handleEditDialogClose}>
      <DialogTitle>Edit Personal Message</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          value={newPersonalMessage}
          onChange={(e) => setNewPersonalMessage(e.target.value)}
          placeholder={t("enterPersonalMessage")}
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDeletePersonalMessage} color="error">
          {t("delete")}
        </Button>
        <Button onClick={handleEditDialogClose}>Cancel</Button>
        <Button onClick={handleSavePersonalMessage} color="primary">
          {t("save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

EditPersonalMessageDialog.propTypes = {
  isEditDialogOpen: PropTypes.bool.isRequired,
  handleEditDialogClose: PropTypes.func.isRequired,
  newPersonalMessage: PropTypes.string.isRequired,
  setNewPersonalMessage: PropTypes.func.isRequired,
  handleSavePersonalMessage: PropTypes.func.isRequired,
  handleDeletePersonalMessage: PropTypes.func.isRequired,
};

export default EditPersonalMessageDialog;

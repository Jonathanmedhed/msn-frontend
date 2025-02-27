import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
} from "@mui/material";
import { useTranslation } from "react-i18next";

export const TextFieldDialog = ({
  open,
  onClose,
  title,
  fieldName,
  currentValue,
  onSave,
}) => {
  const { t } = useTranslation();

  const [value, setValue] = useState(currentValue || "");

  // Update local state if currentValue changes
  useEffect(() => {
    setValue(currentValue || "");
  }, [currentValue]);

  const handleChange = (e) => {
    setValue(e.target.value);
  };

  const handleSave = () => {
    onSave(fieldName, value);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label={fieldName}
          type="text"
          fullWidth
          variant="standard"
          value={value}
          onChange={handleChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("cancel")}</Button>
        <Button onClick={handleSave}>{t("save")}</Button>
      </DialogActions>
    </Dialog>
  );
};

TextFieldDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  fieldName: PropTypes.string.isRequired,
  currentValue: PropTypes.string,
  onSave: PropTypes.func.isRequired,
};

// src/components/FriendRequestStatusDialog.jsx
import PropTypes from "prop-types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";

const FriendRequestStatusDialog = ({ open, onClose, status, message }) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        {status === "success" ? t("requestSent") : t("error")}
      </DialogTitle>
      <DialogContent>
        <Typography>{message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" color="primary">
          {t("ok")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

FriendRequestStatusDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  status: PropTypes.oneOf(["success", "error"]).isRequired,
  message: PropTypes.string.isRequired,
};

export default FriendRequestStatusDialog;

import { Box, Typography, Paper } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import PropTypes from "prop-types";

export const Message = ({ text, isUser, status, timestamp }) => {
  const getStatusIcon = () => {
    switch (status) {
      case "sent":
        return <CheckCircleOutlineIcon fontSize="small" color="disabled" />;
      case "delivered":
        return (
          <>
            <CheckCircleOutlineIcon fontSize="small" color="disabled" />
            <CheckCircleOutlineIcon fontSize="small" color="disabled" />
          </>
        );
      case "read":
        return (
          <>
            <CheckCircleIcon fontSize="small" color="primary" />
            <CheckCircleIcon fontSize="small" color="primary" />
          </>
        );
      case "failed":
        return <ErrorOutlineIcon fontSize="small" color="error" />;
      default:
        return <CheckCircleOutlineIcon fontSize="small" color="disabled" />;
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", mb: 2 }}>
      <Paper
        sx={{
          p: 2,
          backgroundColor: isUser ? "#1976d2" : "#4caf50",
          color: "white",
          borderRadius: isUser ? "20px 20px 0 20px" : "20px 20px 20px 0",
          maxWidth: "70%",
        }}
      >
        <Typography>{text}</Typography>
      </Paper>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mt: 0.5,
          justifyContent: isUser ? "flex-end" : "flex-start",
        }}
      >
        <Typography variant="caption" color="textSecondary">
          {new Date(timestamp).toLocaleTimeString()}
        </Typography>
        {getStatusIcon()}
      </Box>
    </Box>
  );
};

Message.propTypes = {
  text: PropTypes.string.isRequired,
  isUser: PropTypes.bool.isRequired,
  status: PropTypes.oneOf(["pending", "sent", "delivered", "read", "failed"])
    .isRequired,
  timestamp: PropTypes.instanceOf(Date).isRequired,
};

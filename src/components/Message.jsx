import { Box, Typography, Paper } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import PropTypes from "prop-types";

export const Message = ({ text, isUser, status, timestamp, error }) => {
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
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        mb: 2,
        alignSelf: isUser ? "flex-end" : "flex-start",
        maxWidth: "85%",
      }}
    >
      {/* Message Bubble */}
      <Paper
        sx={{
          p: 2,
          backgroundColor: isUser ? "#1976d2" : "#4caf50",
          color: "white",
          borderRadius: isUser ? "20px 20px 0 20px" : "20px 20px 20px 0",
        }}
      >
        <Typography variant="body1">{text}</Typography>
      </Paper>

      {/* Meta Information */}
      <Box
        sx={{
          mt: 0.5,
          display: "flex",
          flexDirection: "column",
          alignItems: isUser ? "flex-end" : "flex-start",
          gap: 0.5,
        }}
      >
        {/* Error Message */}
        {error && (
          <Typography
            variant="caption"
            color="error.main"
            sx={{ fontStyle: "italic" }}
          >
            {error}
          </Typography>
        )}

        {/* Timestamp and Status */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
          }}
        >
          <Typography variant="caption" color="textSecondary">
            {new Date(timestamp).toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
            })}
          </Typography>
          {getStatusIcon()}
        </Box>
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
  error: PropTypes.string,
};

Message.defaultProps = {
  error: null,
};

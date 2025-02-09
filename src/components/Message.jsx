import { Box, Typography, Paper } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import PropTypes from "prop-types";

export const Message = ({ text, isUser, status }) => {
  // Define colors for user and contact messages
  const userColor = "#1976d2"; // Blue for user messages
  const contactColor = "#4caf50"; // Green for contact messages

  // Define status icons
  const statusIcons = {
    sent: <CheckCircleOutlineIcon fontSize="small" sx={{ color: "gray" }} />,
    received: (
      <>
        <CheckCircleOutlineIcon fontSize="small" sx={{ color: "gray" }} />
        <CheckCircleOutlineIcon fontSize="small" sx={{ color: "gray" }} />
      </>
    ),
    read: (
      <>
        <CheckCircleIcon fontSize="small" sx={{ color: userColor }} />
        <CheckCircleIcon fontSize="small" sx={{ color: userColor }} />
      </>
    ),
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: isUser ? "flex-end" : "flex-start",
        mb: 2,
      }}
    >
      <Paper
        sx={{
          p: 2,
          backgroundColor: isUser ? userColor : contactColor,
          color: "white",
          borderRadius: isUser
            ? "20px 20px 0 20px" // Rounded corners for user messages
            : "20px 20px 20px 0", // Rounded corners for contact messages
          maxWidth: "70%",
        }}
      >
        <Typography>{text}</Typography>
      </Paper>
      {/* Status Icons */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          mt: 0.5,
          justifyContent: isUser ? "flex-end" : "flex-start",
        }}
      >
        {statusIcons[status]}
      </Box>
    </Box>
  );
};

Message.propTypes = {
  text: PropTypes.string.isRequired,
  isUser: PropTypes.bool.isRequired,
  status: PropTypes.oneOf(["sent", "received", "read"]).isRequired,
};

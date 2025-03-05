import { Box, Typography, Paper } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import PropTypes from "prop-types";

export const Message = ({
  text,
  isUser,
  status,
  timestamp,
  error,
  isContactList,
  attachments,
}) => {
  const iconSize = isContactList ? "0.1rem" : "small";

  const getStatusIcon = () => {
    switch (status) {
      case "sent":
        return <CheckCircleOutlineIcon fontSize={iconSize} color="disabled" />;
      case "delivered":
        return (
          <Box>
            <CheckCircleOutlineIcon fontSize={iconSize} color="disabled" />
            <CheckCircleOutlineIcon fontSize={iconSize} color="disabled" />
          </Box>
        );
      case "read":
        return (
          <Box>
            <CheckCircleIcon fontSize={iconSize} color="primary" />
            <CheckCircleIcon fontSize={iconSize} color="primary" />
          </Box>
        );
      case "failed":
        return <ErrorOutlineIcon fontSize={iconSize} color="error" />;
      default:
        return <CheckCircleOutlineIcon fontSize={iconSize} color="disabled" />;
    }
  };

  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        mb: isContactList ? 0 : 2,
        alignSelf: isUser ? "flex-end" : "flex-start",
        width: isContactList ? "fit-content" : "auto",
        maxWidth: isContactList ? "75%" : "85%",
      }}
    >
      {/* Message Bubble */}
      <Paper
        sx={{
          p: isContactList ? "3px 9px 3px 7px" : "9px 13px 9px 13px",
          backgroundColor: isUser ? "#1976d2" : "#4caf50",
          color: "white",
          borderRadius: isUser ? "20px 20px 0 20px" : "20px 20px 20px 0",
        }}
      >
        <Typography variant="body1">{text}</Typography>
        {attachments && attachments.length > 0 && (
          <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 1 }}>
            {attachments.map((attachment, index) =>
              attachment.type === "image" && attachment.url ? (
                <Box key={index}>
                  <Box
                    component="img"
                    src={attachment.url}
                    alt={`attachment-preview-${index}`}
                    sx={{ maxWidth: "200px", borderRadius: 1 }}
                  />
                </Box>
              ) : null
            )}
          </Box>
        )}
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
        {error && (
          <Typography
            variant="caption"
            color="error.main"
            sx={{ fontStyle: "italic" }}
          >
            {error}
          </Typography>
        )}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          {!isContactList && (
            <Typography variant="caption" color="textSecondary">
              {new Date(timestamp).toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
              })}
            </Typography>
          )}
          {!isContactList ? (
            getStatusIcon()
          ) : (
            <Box sx={{ position: "absolute", top: "0.4rem", right: "-1.2rem" }}>
              {getStatusIcon()}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

Message.propTypes = {
  text: PropTypes.string.isRequired,
  isUser: PropTypes.bool.isRequired,
  isContactList: PropTypes.bool,
  status: PropTypes.oneOf(["pending", "sent", "delivered", "read", "failed"])
    .isRequired,
  timestamp: PropTypes.instanceOf(Date).isRequired,
  error: PropTypes.string,
  attachments: PropTypes.array,
};

Message.defaultProps = {
  error: null,
  attachment: null,
};

export default Message;

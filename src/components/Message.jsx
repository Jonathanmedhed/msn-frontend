import { Box, Typography, Paper, IconButton } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import PropTypes from "prop-types";

export const Message = ({
  messageId,
  text,
  isUser,
  status,
  timestamp,
  error,
  isContactList,
  attachments,
  onRemovePreview, // Callback to remove preview
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
      <Paper
        sx={{
          p: isContactList ? "3px 9px 3px 7px" : "9px 13px 9px 13px",
          backgroundColor: isUser ? "#1976d2" : "#4caf50",
          color: "white",
          borderRadius: isUser ? "20px 20px 0 20px" : "20px 20px 20px 0",
          minHeight:
            attachments && attachments.length > 0 && !text ? 80 : "auto",
        }}
      >
        <Typography variant="body1">{text}</Typography>
        {attachments &&
          attachments.length > 0 &&
          attachments.map((att, index) => {
            if (att.type === "image" && att.url) {
              return (
                <Box key={index} sx={{ mt: 1, position: "relative" }}>
                  <Box
                    component="img"
                    src={att.url}
                    alt="attachment preview"
                    sx={{ maxWidth: "200px", borderRadius: 1 }}
                  />
                  {onRemovePreview && messageId.startsWith("preview-") && (
                    <IconButton
                      onClick={() => onRemovePreview(messageId)}
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        bgcolor: "rgba(0,0,0,0.5)",
                        color: "white",
                        "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              );
            } else if (att.type === "file") {
              return (
                <Box
                  key={index}
                  sx={{
                    mt: 1,
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    p: 1,
                    border: "1px solid #ccc",
                    borderRadius: 1,
                    backgroundColor: "#f5f5f5",
                    color: "black",
                  }}
                >
                  <InsertDriveFileIcon />
                  <Typography variant="body2">{att.name}</Typography>
                  {onRemovePreview && messageId.startsWith("preview-") && (
                    <IconButton
                      onClick={() => onRemovePreview(messageId)}
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        bgcolor: "rgba(0,0,0,0.5)",
                        color: "white",
                        "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              );
            }
            return null;
          })}
      </Paper>
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
  messageId: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  isUser: PropTypes.bool.isRequired,
  isContactList: PropTypes.bool,
  status: PropTypes.oneOf(["pending", "sent", "delivered", "read", "failed"])
    .isRequired,
  timestamp: PropTypes.instanceOf(Date).isRequired,
  error: PropTypes.string,
  attachments: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.string,
      url: PropTypes.string,
      name: PropTypes.string,
      file: PropTypes.any,
    })
  ),
  onRemovePreview: PropTypes.func,
};

Message.defaultProps = {
  error: null,
  attachments: [],
  onRemovePreview: null,
};

export default Message;

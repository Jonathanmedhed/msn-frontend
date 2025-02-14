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
}) => {
  const iconSize = isContactList ? "0.1rem" : "small";

  const getStatusIcon = () => {
    switch (status) {
      case "sent":
        return <CheckCircleOutlineIcon fontSize={iconSize} color="disabled" />;
      case "delivered":
        return (
          <>
            <CheckCircleOutlineIcon fontSize={iconSize} color="disabled" />
            <CheckCircleOutlineIcon fontSize={iconSize} color="disabled" />
          </>
        );
      case "read":
        return (
          <>
            <CheckCircleIcon fontSize={iconSize} color="primary" />
            <CheckCircleIcon fontSize={iconSize} color="primary" />
          </>
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
        {isContactList ? (
          <Typography
            variant="body1"
            fontSize={15}
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {text.length > 100 ? `${text.substring(0, 100)}...` : text}
          </Typography>
        ) : (
          <Typography variant="body1">{text}</Typography>
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
            <Box
              sx={{
                position: "absolute",
                top: "0.4rem",
                right: "-1.2rem",
              }}
            >
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
};

Message.defaultProps = {
  error: null,
};

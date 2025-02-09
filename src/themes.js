// themes.js
import { createTheme } from "@mui/material/styles";

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2", // Blue
    },
    secondary: {
      main: "#dc004e", // Pink
    },
    background: {
      default: "#f5f5f5", // Light gray
      paper: "#ffffff", // White
    },
    text: {
      primary: "#000000", // Black
      secondary: "#555555", // Dark gray
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#90caf9", // Light blue
    },
    secondary: {
      main: "#f48fb1", // Light pink
    },
    background: {
      default: "#121212", // Dark gray
      paper: "#1e1e1e", // Slightly lighter dark gray
    },
    text: {
      primary: "#ffffff", // White
      secondary: "#bbbbbb", // Light gray
    },
  },
});

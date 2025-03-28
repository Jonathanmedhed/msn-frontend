// App.js
import { useState, useMemo } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { ThemeContext } from "./ThemeContext";
import { lightTheme, darkTheme } from "./themes";
import { MainPage } from "./pages/MainPage"; // Your main component
import { AuthProvider } from "./context/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ErrorBoundary from "./components/ErrorBoundary";
import "../i18n";
import "./css/emoji-picker-custom.css";
import { SocketProvider } from "./context/SocketContext";

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const queryClient = new QueryClient();

  // Toggle between light and dark themes
  const toggleTheme = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  // Memoize the theme to avoid unnecessary re-renders
  const theme = useMemo(
    () => (isDarkMode ? darkTheme : lightTheme),
    [isDarkMode]
  );

  return (
    <ErrorBoundary>
      <ThemeContext.Provider value={{ toggleTheme, isDarkMode }}>
        <ThemeProvider theme={theme}>
          <CssBaseline /> {/* Apply baseline styles for dark mode */}
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <SocketProvider>
                <MainPage />
              </SocketProvider>
            </AuthProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </ThemeContext.Provider>
    </ErrorBoundary>
  );
}

export default App;

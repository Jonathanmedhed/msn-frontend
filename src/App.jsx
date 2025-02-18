// App.js
import { useState, useMemo } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { ThemeContext } from "./ThemeContext";
import { lightTheme, darkTheme } from "./themes";
import { MainPage } from "./pages/MainPage"; // Your main component
import { AuthProvider } from "./context/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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
    <ThemeContext.Provider value={{ toggleTheme, isDarkMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline /> {/* Apply baseline styles for dark mode */}
        <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <MainPage />
        </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}

export default App;
